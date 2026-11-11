import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { Readable } from "stream";
import { db } from "@/lib/db";
import { authMiddleware, type Env } from "../middleware/auth";
import {
  uploadFileToDrive,
  createResumableUploadSession,
  createFolderInDrive,
  deleteFileFromDrive,
  renameFileInDrive,
  moveFileInDrive,
  downloadFileStream,
  listFiles,
  getGoogleDriveClient,
} from "@/lib/google-drive";
import {
  selectStorageAccount,
  type UploadStrategy,
} from "@/lib/storage-algorithm";
import { autoConnectPrimaryGoogleAccount } from "@/lib/auto-connect";

function safeSerialize<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (_, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
}

export const listFilesSchema = z.object({
  page: z.string().optional().default("1"),
  limit: z.string().optional().default("24"),
  scope: z.enum(["all", "mydrive", "sharedWithMe"]).optional().default("all"),
  q: z.string().optional(),
  accountId: z.string().optional(),
  type: z.string().optional().default("all"),
  date: z.string().optional().default("all"),
  sort: z.string().optional().default("name_asc"),
  folderId: z.string().optional(),
});

export const patchFileSchema = z.object({
  name: z.string().trim().min(1).optional(),
  destinationFolderId: z.string().optional(),
});

export const searchFilesSchema = z.object({
  q: z.string().optional(),
});

export const bulkDeleteSchema = z.object({
  itemIds: z.array(z.string().min(1)).min(1),
});

export const bulkMoveSchema = z.object({
  itemIds: z.array(z.string().min(1)).min(1),
  destinationFolderId: z.string().min(1),
});

/**
 * Zero-Retention Helper: Resolve which storage account has access to a Google Drive item
 * without persisting user files/folders in the local database.
 */
async function resolveAccountForDriveItem(
  userId: string,
  itemId: string,
  hintAccountId?: string
): Promise<{ accountId: string; fileId: string; mimeType?: string; name?: string } | null> {
  const accounts = await db.storageAccount.findMany({
    where: { userId, isActive: true },
    select: { id: true },
  });

  if (accounts.length === 0) return null;

  const orderedAccounts = hintAccountId
    ? [
        ...accounts.filter((a) => a.id === hintAccountId),
        ...accounts.filter((a) => a.id !== hintAccountId),
      ]
    : accounts;

  for (const acc of orderedAccounts) {
    try {
      const drive = await getGoogleDriveClient(acc.id);
      const { data } = await drive.files.get({
        fileId: itemId,
        fields: "id, name, mimeType, trashed",
        supportsAllDrives: true,
      });

      if (data && data.id && !data.trashed) {
        return {
          accountId: acc.id,
          fileId: data.id,
          mimeType: data.mimeType || undefined,
          name: data.name || undefined,
        };
      }
    } catch {
      // Continue to next account if not found or unauthorized in this account
    }
  }

  return null;
}

export const filesRouter = new Hono<Env>()
  .use("*", authMiddleware)

  // 0. List Files and Folders (Directory Explorer)
  .get("/", zValidator("query", listFilesSchema), async (c) => {
    const user = c.get("user");

    // Automatically ensure primary login Google Account is connected
    await autoConnectPrimaryGoogleAccount(user.id);

    const {
      page: rawPage,
      limit: rawLimit,
      scope,
      q: query,
      accountId,
      type: fileType,
      date: dateFilter,
      sort: sortBy,
      folderId,
    } = c.req.valid("query");

    const page = Math.max(1, parseInt(rawPage || "1", 10));
    const limit = Math.max(1, Math.min(100, parseInt(rawLimit || "24", 10)));

    // 1. Get ALL active storage accounts (so frontend dropdown/tabs always show complete pool)
    const allUserAccounts = await db.storageAccount.findMany({
      where: { userId: user.id, isActive: true },
      select: {
        id: true,
        email: true,
        displayName: true,
        availableStorage: true,
        usagePercentage: true,
      },
      orderBy: { createdAt: "asc" },
    });

    if (allUserAccounts.length === 0) {
      return c.json({
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

    // Determine target accounts to query
    const accounts = accountId
      ? allUserAccounts.filter((a) => a.id === accountId)
      : allUserAccounts;

    const currentParentId = folderId && folderId !== "root" ? folderId : "root";

    // 2. Fetch live files directly from Google Drive for current directory and sync to DB
    const driveResults = await Promise.allSettled(
      accounts.map(async (acc) => {
        try {
          const { files: driveFiles } = await listFiles(acc.id, {
            query,
            folderId: folderId && folderId !== "root" ? folderId : undefined,
            scope,
            pageSize: 60,
          });

          return driveFiles.map((df) => {
            const owner = df.owners?.[0];
            const isOwner = Boolean(owner?.me);
            const isShared = !isOwner || Boolean(df.shared);
            const sharedBy = !isOwner
              ? df.sharingUser?.displayName || owner?.displayName || owner?.emailAddress || "Pengguna Luar"
              : null;

            return {
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
              isShared,
              sharedBy,
              account: {
                id: acc.id,
                email: acc.email,
                displayName: acc.displayName,
              },
            };
          });
        } catch (err: unknown) {
          const msg = (err as Error)?.message || "Unknown error";
          console.warn(`Could not list files for ${acc.email} (${scope}): ${msg}`);
          return [];
        }
      })
    );

    let filteredItems = driveResults
      .filter((r) => r.status === "fulfilled")
      .flatMap((r) => (r as PromiseFulfilledResult<any[]>).value);

    // 3. Apply Filters
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

    // 4. Sorting (Folders always first, then requested order)
    filteredItems.sort((a, b) => {
      if (a.isFolder && !b.isFolder) return -1;
      if (!a.isFolder && b.isFolder) return 1;

      if (sortBy === "name_asc") return a.name.localeCompare(b.name);
      if (sortBy === "name_desc") return b.name.localeCompare(a.name);
      if (sortBy === "date_desc")
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      if (sortBy === "date_asc")
        return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      if (sortBy === "size_desc") return Number(b.size) - Number(a.size);
      if (sortBy === "size_asc") return Number(a.size) - Number(b.size);

      return a.name.localeCompare(b.name);
    });

    const total = filteredItems.length;
    const skip = (page - 1) * limit;
    const paginatedItems = filteredItems.slice(0, skip + limit);

    const folders = paginatedItems.filter((item) => item.isFolder);
    const files = paginatedItems.filter((item) => !item.isFolder);

    return c.json(
      safeSerialize({
        folders,
        files,
        allItems: paginatedItems,
        accounts: allUserAccounts.map((a) => ({
          id: a.id,
          email: a.email,
          displayName: a.displayName,
          availableStorage: a.availableStorage.toString(),
          usagePercentage: a.usagePercentage,
          isLoginAccount: a.email.toLowerCase() === (user.email || "").toLowerCase(),
        })),
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + limit < total,
      })
    );
  })

  // 1a. Initiate Direct-to-Google Resumable Upload (Bypasses Vercel 4.5MB limit & 0 RAM usage)
  .post(
    "/initiate-upload",
    zValidator(
      "json",
      z.object({
        name: z.string().min(1, "File name is required"),
        size: z.number().nonnegative(),
        mimeType: z.string().default("application/octet-stream"),
        strategy: z.string().default("manual"),
        accountId: z.string().optional(),
        targetAccountId: z.string().optional(),
        parentFolderId: z.string().optional(),
      })
    ),
    async (c) => {
      const user = c.get("user");
      const {
        name,
        size,
        mimeType,
        strategy,
        accountId,
        targetAccountId,
        parentFolderId,
      } = c.req.valid("json");

      let accounts = await db.storageAccount.findMany({
        where: { userId: user.id, isActive: true },
      });

      if (accounts.length === 0) {
        const autoConnected = await autoConnectPrimaryGoogleAccount(user.id);
        if (autoConnected) {
          accounts = await db.storageAccount.findMany({
            where: { userId: user.id, isActive: true },
          });
        }
      }

      if (accounts.length === 0) {
        return c.json({ error: "No connected storage accounts" }, 400);
      }

      const manualAccountId = accountId || targetAccountId;
      const selectedAccount = selectStorageAccount(
        accounts,
        BigInt(size),
        strategy as UploadStrategy,
        manualAccountId ?? undefined
      );

      if (!selectedAccount) {
        return c.json(
          { error: "No account has enough storage for this file" },
          400
        );
      }

      try {
        const session = await createResumableUploadSession(selectedAccount.id, {
          name,
          mimeType,
          size,
          parentFolderId,
          origin: c.req.header("origin"),
        });

        return c.json({
          uploadUrl: session.uploadUrl,
          account: {
            id: selectedAccount.id,
            email: selectedAccount.email,
            displayName: selectedAccount.displayName,
          },
        });
      } catch (err: unknown) {
        console.error("Direct Resumable Upload Init Error:", err);
        const errMsg =
          err instanceof Error
            ? err.message
            : "Failed to initiate direct upload session";
        return c.json({ error: errMsg }, 500);
      }
    }
  )

  // 1. Upload File
  .post("/upload", async (c) => {
    const user = c.get("user");
    const formData = await c.req.formData();
    const file = formData.get("file") as File | null;
    const strategy = (formData.get("strategy") as UploadStrategy) ?? "manual";
    const manualAccountId =
      (formData.get("accountId") as string) ||
      (formData.get("targetAccountId") as string);
    const relativePath = (formData.get("relativePath") as string) || "";
    let targetParentFolderId =
      (formData.get("parentFolderId") as string) || undefined;

    if (!file) {
      return c.json({ error: "No file provided" }, 400);
    }

    const accounts = await db.storageAccount.findMany({
      where: { userId: user.id, isActive: true },
    });

    if (accounts.length === 0) {
      return c.json({ error: "No connected storage accounts" }, 400);
    }

    const fileSize = BigInt(file.size);

    const selectedAccount = selectStorageAccount(
      accounts,
      fileSize,
      strategy,
      manualAccountId ?? undefined
    );

    if (!selectedAccount) {
      return c.json(
        { error: "No account has enough storage for this file" },
        400
      );
    }

    try {
      const buffer = Buffer.from(await file.arrayBuffer());

      // If folder path is nested
      if (relativePath && relativePath.includes("/")) {
        const parts = relativePath.split("/").filter(Boolean);
        const directorySegments = parts.slice(0, parts.length - 1);
        let currentParent = targetParentFolderId;

        for (const segment of directorySegments) {
          const newDriveFolder = await createFolderInDrive(
            selectedAccount.id,
            segment,
            currentParent
          );
          if (newDriveFolder.id) {
            currentParent = newDriveFolder.id;
          }
        }

        targetParentFolderId = currentParent;
      }

      // Upload to Google Drive directly (Zero-Retention)
      const driveFile = await uploadFileToDrive(selectedAccount.id, {
        name: file.name,
        mimeType: file.type || "application/octet-stream",
        buffer,
        size: file.size,
        parentFolderId: targetParentFolderId,
      });

      // Update storage account used / available
      const newUsed = selectedAccount.usedStorage + fileSize;
      const newAvail =
        selectedAccount.totalStorage > newUsed
          ? selectedAccount.totalStorage - newUsed
          : BigInt(0);
      const newPct =
        selectedAccount.totalStorage > BigInt(0)
          ? Number((newUsed * BigInt(100)) / selectedAccount.totalStorage)
          : 0;

      await db.storageAccount.update({
        where: { id: selectedAccount.id },
        data: {
          usedStorage: newUsed,
          availableStorage: newAvail,
          usagePercentage: newPct,
          lastSyncedAt: new Date(),
        },
      });

      const fileResponse = {
        id: driveFile.id!,
        name: driveFile.name ?? file.name,
        mimeType: driveFile.mimeType ?? file.type,
        size: (driveFile.size ?? file.size).toString(),
        parentFolderId: targetParentFolderId || null,
        webViewLink: driveFile.webViewLink,
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        account: {
          id: selectedAccount.id,
          email: selectedAccount.email,
        },
      };

      return c.json(
        safeSerialize({
          success: true,
          file: fileResponse,
          account: {
            id: selectedAccount.id,
            email: selectedAccount.email,
          },
        })
      );
    } catch (err: any) {
      console.error("Upload error:", err);
      return c.json({ error: err.message || "Upload failed" }, 500);
    }
  })

  // 2. Search Files
  .get(
    "/search",
    zValidator("query", searchFilesSchema),
    async (c) => {
      const user = c.get("user");
      const { q } = c.req.valid("query");

      if (!q || q.trim().length < 2) {
        return c.json({ results: [] });
      }

      const accounts = await db.storageAccount.findMany({
        where: { userId: user.id, isActive: true },
        select: { id: true, email: true },
      });

      if (accounts.length === 0) {
        return c.json({ results: [] });
      }

      const searchResults = await Promise.allSettled(
        accounts.map(async (account) => {
          const { files } = await listFiles(account.id, {
            query: q,
            pageSize: 20,
          });
          return files.map((f) => ({
            providerFileId: f.id,
            name: f.name,
            mimeType: f.mimeType,
            size: f.size ?? "0",
            webViewLink: f.webViewLink,
            thumbnailLink: f.thumbnailLink,
            storageAccountId: account.id,
            storageAccountEmail: account.email,
          }));
        })
      );

      const results = searchResults
        .filter((r) => r.status === "fulfilled")
        .flatMap((r) => (r as PromiseFulfilledResult<unknown[]>).value);

      return c.json({ results, query: q });
    }
  )

  // 3. Bulk Delete Files / Folders
  .post("/bulk-delete", zValidator("json", bulkDeleteSchema), async (c) => {
    const user = c.get("user");
    const { itemIds } = c.req.valid("json");

    let deletedCount = 0;
    const errors: string[] = [];

    await Promise.allSettled(
      itemIds.map(async (id) => {
        try {
          const resolved = await resolveAccountForDriveItem(user.id, id);
          if (resolved) {
            await deleteFileFromDrive(resolved.accountId, resolved.fileId);
            deletedCount++;
          } else {
            errors.push(`Item ${id}: Tidak ditemukan pada akun Drive yang aktif`);
          }
        } catch (err: any) {
          errors.push(`Item ${id}: ${err.message}`);
        }
      })
    );

    return c.json({
      success: true,
      deletedCount,
      totalRequested: itemIds.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  })

  // 4. Bulk Move Files / Folders
  .post("/bulk-move", zValidator("json", bulkMoveSchema), async (c) => {
    const user = c.get("user");
    const { itemIds, destinationFolderId } = c.req.valid("json");

    let movedCount = 0;
    const errors: string[] = [];

    await Promise.allSettled(
      itemIds.map(async (id) => {
        try {
          const resolved = await resolveAccountForDriveItem(user.id, id);
          if (resolved) {
            await moveFileInDrive(
              resolved.accountId,
              resolved.fileId,
              destinationFolderId
            );
            movedCount++;
          } else {
            errors.push(`Item ${id}: Tidak ditemukan pada akun Drive yang aktif`);
          }
        } catch (err: any) {
          errors.push(`Item ${id}: ${err.message}`);
        }
      })
    );

    return c.json({
      success: true,
      movedCount,
      totalRequested: itemIds.length,
      destinationFolderId,
      errors: errors.length > 0 ? errors : undefined,
    });
  })

  // 5. Download File Stream
  .get("/:id/download", async (c) => {
    const user = c.get("user");
    const id = c.req.param("id");

    const resolved = await resolveAccountForDriveItem(user.id, id);
    if (!resolved) {
      return c.json({ error: "File not found" }, 404);
    }

    try {
      const { stream, mimeType, extension } = await downloadFileStream(
        resolved.accountId,
        resolved.fileId,
        resolved.mimeType
      );

      let fileName = resolved.name || "download";
      if (extension && !fileName.endsWith(extension)) {
        fileName = `${fileName}${extension}`;
      }

      const webStream = new ReadableStream({
        start(controller) {
          (stream as Readable).on("data", (chunk: Buffer) => {
            controller.enqueue(new Uint8Array(chunk));
          });
          (stream as Readable).on("end", () => {
            controller.close();
          });
          (stream as Readable).on("error", (err: Error) => {
            controller.error(err);
          });
        },
      });

      const headers = new Headers();
      headers.set(
        "Content-Disposition",
        `attachment; filename="${encodeURIComponent(fileName)}"; filename*=UTF-8''${encodeURIComponent(fileName)}`
      );
      headers.set("Content-Type", mimeType || "application/octet-stream");

      return new Response(webStream, {
        status: 200,
        headers,
      });
    } catch (error) {
      console.error("File download error:", error);
      return c.json(
        { error: "Failed to download file from Google Drive" },
        500
      );
    }
  })

  // 6. Rename or Move File / Folder
  .patch(
    "/:id",
    zValidator("json", patchFileSchema),
    async (c) => {
      const user = c.get("user");
      const id = c.req.param("id");
      const { name, destinationFolderId } = c.req.valid("json");

      if (!name && !destinationFolderId) {
        return c.json(
          { error: "Provide a name to rename or destinationFolderId to move" },
          400
        );
      }

      const resolved = await resolveAccountForDriveItem(user.id, id);
      if (!resolved) {
        return c.json({ error: "Item not found" }, 404);
      }

      if (name && typeof name === "string" && name.trim()) {
        await renameFileInDrive(
          resolved.accountId,
          resolved.fileId,
          name.trim()
        );
      }

      if (destinationFolderId && typeof destinationFolderId === "string") {
        await moveFileInDrive(
          resolved.accountId,
          resolved.fileId,
          destinationFolderId
        );
      }

      return c.json({
        success: true,
        item: {
          id: resolved.fileId,
          name: name ? name.trim() : resolved.name,
          parentFolderId: destinationFolderId || undefined,
        },
      });
    }
  )

  // 7. Delete File / Folder
  .delete("/:id", async (c) => {
    const user = c.get("user");
    const id = c.req.param("id");

    const resolved = await resolveAccountForDriveItem(user.id, id);
    if (!resolved) {
      return c.json({ error: "Item not found" }, 404);
    }

    try {
      await deleteFileFromDrive(resolved.accountId, resolved.fileId);
      return c.json({ success: true, message: "Item moved to trash" });
    } catch (err: any) {
      console.warn("Drive delete warning:", err);
      return c.json({ error: err.message || "Failed to delete item" }, 500);
    }
  });
