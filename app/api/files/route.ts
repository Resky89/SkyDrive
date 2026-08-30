import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { listFiles } from "@/lib/google-drive";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const accountId = searchParams.get("accountId") || undefined;
  const query = searchParams.get("q") || undefined;
  const fileType = searchParams.get("type") || "all";
  const dateFilter = searchParams.get("date") || "all";
  const sortBy = searchParams.get("sort") || "name_asc";
  const folderId = searchParams.get("folderId") || undefined;
  const scope = (searchParams.get("scope") as "mydrive" | "sharedWithMe") || "mydrive";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "32")));

  // 1. Get active storage accounts
  const accountWhere = accountId
    ? { id: accountId, userId: session.user.id, isActive: true }
    : { userId: session.user.id, isActive: true };

  const accounts = await db.storageAccount.findMany({
    where: accountWhere,
    select: {
      id: true,
      email: true,
      displayName: true,
      availableStorage: true,
      usagePercentage: true,
    },
  });

  if (accounts.length === 0) {
    return NextResponse.json({
      folders: [],
      files: [],
      allItems: [],
      accounts: [],
      page: 1,
      total: 0,
      totalPages: 0,
      hasMore: false,
    });
  }

  const currentParentId = folderId && folderId !== "root" ? folderId : "root";

  // 2. Fetch live files directly from Google Drive for current directory and sync to DB
  let liveDriveItems: any[] = [];

  const driveResults = await Promise.allSettled(
    accounts.map(async (acc) => {
      try {
        const { files: driveFiles } = await listFiles(acc.id, {
          query,
          folderId: folderId && folderId !== "root" ? folderId : undefined,
          scope,
          pageSize: 60,
        });

        // Upsert into DB in background
        for (const df of driveFiles) {
          if (!df.id || !df.name) continue;
          await db.file.upsert({
            where: {
              storageAccountId_providerFileId: {
                storageAccountId: acc.id,
                providerFileId: df.id,
              },
            },
            update: {
              name: df.name,
              mimeType: df.mimeType,
              size: BigInt(df.size || 0),
              parentProviderId: currentParentId,
              webViewLink: df.webViewLink,
              thumbnailLink: df.thumbnailLink,
              status: "active",
            },
            create: {
              userId: session.user.id,
              storageAccountId: acc.id,
              providerFileId: df.id,
              name: df.name,
              mimeType: df.mimeType,
              size: BigInt(df.size || 0),
              parentProviderId: currentParentId,
              webViewLink: df.webViewLink,
              thumbnailLink: df.thumbnailLink,
              status: "active",
            },
          });
        }

        return driveFiles.map((df) => ({
          id: df.id,
          name: df.name,
          size: (df.size || 0).toString(),
          mimeType: df.mimeType,
          driveFileId: df.id,
          parentFolderId: currentParentId,
          isFolder: df.mimeType === "application/vnd.google-apps.folder",
          status: "active",
          createdAt: df.createdTime || new Date().toISOString(),
          updatedAt: df.modifiedTime || new Date().toISOString(),
          webViewLink: df.webViewLink,
          thumbnailLink: df.thumbnailLink || null,
          iconLink: (df as any).iconLink || null,
          account: {
            id: acc.id,
            email: acc.email,
            displayName: acc.displayName,
          },
        }));
      } catch (err) {
        console.warn(`Could not list files for ${acc.email} (${scope}):`, err);
        return [];
      }
    })
  );

  liveDriveItems = driveResults
    .filter((r) => r.status === "fulfilled")
    .flatMap((r) => (r as PromiseFulfilledResult<any[]>).value);

  // 3. Apply Filters
  let filteredItems = liveDriveItems;

  // Type Filter
  if (fileType !== "all") {
    if (fileType === "folders") {
      filteredItems = filteredItems.filter((i) => i.isFolder);
    } else if (fileType === "documents") {
      filteredItems = filteredItems.filter(
        (i) =>
          !i.isFolder &&
          (i.mimeType.includes("document") ||
            i.mimeType.includes("word") ||
            i.mimeType.includes("text") ||
            i.mimeType === "application/vnd.google-apps.document")
      );
    } else if (fileType === "spreadsheets") {
      filteredItems = filteredItems.filter(
        (i) =>
          !i.isFolder &&
          (i.mimeType.includes("spreadsheet") ||
            i.mimeType.includes("excel") ||
            i.mimeType.includes("csv") ||
            i.mimeType === "application/vnd.google-apps.spreadsheet")
      );
    } else if (fileType === "presentations") {
      filteredItems = filteredItems.filter(
        (i) =>
          !i.isFolder &&
          (i.mimeType.includes("presentation") ||
            i.mimeType.includes("powerpoint") ||
            i.mimeType === "application/vnd.google-apps.presentation")
      );
    } else if (fileType === "photos") {
      filteredItems = filteredItems.filter((i) => i.mimeType.startsWith("image/"));
    } else if (fileType === "videos") {
      filteredItems = filteredItems.filter((i) => i.mimeType.startsWith("video/"));
    } else if (fileType === "audio") {
      filteredItems = filteredItems.filter((i) => i.mimeType.startsWith("audio/"));
    } else if (fileType === "pdfs") {
      filteredItems = filteredItems.filter((i) => i.mimeType.includes("pdf"));
    } else if (fileType === "archives") {
      filteredItems = filteredItems.filter(
        (i) =>
          i.mimeType.includes("zip") ||
          i.mimeType.includes("tar") ||
          i.mimeType.includes("rar") ||
          i.mimeType.includes("7z")
      );
    }
  }

  // Date Filter
  if (dateFilter !== "all") {
    const now = new Date();
    filteredItems = filteredItems.filter((i) => {
      const itemDate = new Date(i.updatedAt);
      if (dateFilter === "today") {
        const today = new Date(now.setHours(0, 0, 0, 0));
        return itemDate >= today;
      } else if (dateFilter === "week") {
        const weekAgo = new Date(now.setDate(now.getDate() - 7));
        return itemDate >= weekAgo;
      } else if (dateFilter === "month") {
        const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
        return itemDate >= monthAgo;
      } else if (dateFilter === "year") {
        const yearStart = new Date(now.getFullYear(), 0, 1);
        return itemDate >= yearStart;
      }
      return true;
    });
  }

  // 4. Google Drive-Style Sorting (Folders always first, then requested order)
  filteredItems.sort((a, b) => {
    // Folders always at top
    if (a.isFolder && !b.isFolder) return -1;
    if (!a.isFolder && b.isFolder) return 1;

    if (sortBy === "name_asc") return a.name.localeCompare(b.name);
    if (sortBy === "name_desc") return b.name.localeCompare(a.name);
    if (sortBy === "date_desc") return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    if (sortBy === "date_asc") return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
    if (sortBy === "size_desc") return Number(b.size) - Number(a.size);
    if (sortBy === "size_asc") return Number(a.size) - Number(b.size);

    return a.name.localeCompare(b.name);
  });

  const total = filteredItems.length;
  const skip = (page - 1) * limit;
  const paginatedItems = filteredItems.slice(0, skip + limit);

  const folders = paginatedItems.filter((item) => item.isFolder);
  const files = paginatedItems.filter((item) => !item.isFolder);

  return NextResponse.json({
    folders,
    files,
    allItems: paginatedItems,
    accounts: accounts.map((a) => ({
      id: a.id,
      email: a.email,
      availableStorage: a.availableStorage.toString(),
      usagePercentage: a.usagePercentage,
    })),
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    hasMore: skip + limit < total,
  });
}
