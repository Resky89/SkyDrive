import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { Readable } from "stream";
import { db } from "@/lib/db";
import { authMiddleware, type Env } from "../middleware/auth";
import {
  uploadFileToDrive,
  createFolderInDrive,
  deleteFileFromDrive,
  renameFileInDrive,
  moveFileInDrive,
  downloadFileStream,
  listFiles,
} from "@/lib/google-drive";
import {
  selectStorageAccount,
  type UploadStrategy,
} from "@/lib/storage-algorithm";

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
  scope: z.enum(["mydrive", "sharedWithMe"]).optional().default("mydrive"),
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

export const filesRouter = new Hono<Env>()
  .use("*", authMiddleware)

  // 0. List Files and Folders (Directory Explorer)
  .get("/", zValidator("query", listFilesSchema), async (c) => {
    const user = c.get("user");
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

    // 1. Get active storage accounts
    const accountWhere = accountId
      ? { id: accountId, userId: user.id, isActive: true }
      : { userId: user.id, isActive: true };

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

          // Upsert into DB in background for cache / analytics
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
                userId: user.id,
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
      })
    );
  })

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

    const upload = await db.upload.create({
      data: {
        userId: user.id,
        storageAccountId: selectedAccount.id,
        originalFilename: file.name,
        fileSize,
        mimeType: file.type,
        uploadStrategy: strategy,
        status: "in_progress",
        startedAt: new Date(),
      },
    });

    try {
      const buffer = Buffer.from(await file.arrayBuffer());

      // If folder path is nested
      if (relativePath && relativePath.includes("/")) {
        const parts = relativePath.split("/").filter(Boolean);
        const directorySegments = parts.slice(0, parts.length - 1);
        let currentParent = targetParentFolderId;

        for (const segment of directorySegments) {
          let existingFolder = await db.file.findFirst({
            where: {
              userId: user.id,
              storageAccountId: selectedAccount.id,
              name: segment,
              mimeType: "application/vnd.google-apps.folder",
              parentProviderId: currentParent || null,
              status: "active",
            },
          });

          if (!existingFolder) {
            const newDriveFolder = await createFolderInDrive(
              selectedAccount.id,
              segment,
              currentParent
            );

            if (newDriveFolder.id) {
              existingFolder = await db.file.create({
                data: {
                  userId: user.id,
                  storageAccountId: selectedAccount.id,
                  providerFileId: newDriveFolder.id,
                  name: segment,
                  mimeType: "application/vnd.google-apps.folder",
                  size: BigInt(0),
                  parentProviderId: currentParent || null,
                  webViewLink: newDriveFolder.webViewLink,
                  status: "active",
                },
              });
            }
          }

          if (existingFolder) {
            currentParent = existingFolder.providerFileId;
          }
        }

        targetParentFolderId = currentParent;
      }

      // Upload to Google Drive
      const driveFile = await uploadFileToDrive(selectedAccount.id, {
        name: file.name,
        mimeType: file.type || "application/octet-stream",
        buffer,
        size: file.size,
        parentFolderId: targetParentFolderId,
      });

      const savedFile = await db.file.create({
        data: {
          userId: user.id,
          storageAccountId: selectedAccount.id,
          providerFileId: driveFile.id!,
          name: driveFile.name ?? file.name,
          mimeType: driveFile.mimeType ?? file.type,
          size: BigInt(driveFile.size ?? 0),
          parentProviderId: targetParentFolderId || null,
          webViewLink: driveFile.webViewLink,
          status: "active",
        },
      });

      await db.upload.update({
        where: { id: upload.id },
        data: {
          status: "completed",
          completedAt: new Date(),
        },
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

      await db.activityLog.create({
        data: {
          userId: user.id,
          storageAccountId: selectedAccount.id,
          activityType: "file_uploaded",
          description: `Uploaded "${file.name}" (${file.size} bytes) to ${selectedAccount.email} via ${strategy} strategy`,
        },
      });

      return c.json(
        safeSerialize({
          success: true,
          file: savedFile,
          account: {
            id: selectedAccount.id,
            email: selectedAccount.email,
          },
        })
      );
    } catch (err: any) {
      console.error("Upload error:", err);
      await db.upload.update({
        where: { id: upload.id },
        data: {
          status: "failed",
          errorMessage: err.message,
          completedAt: new Date(),
        },
      });
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
          const file = await db.file.findFirst({
            where: {
              userId: user.id,
              OR: [{ id }, { providerFileId: id }],
            },
          });

          if (file) {
            try {
              await deleteFileFromDrive(file.storageAccountId, file.providerFileId);
            } catch (err) {
              console.warn("Drive delete file warning:", err);
            }
            await db.file.update({
              where: { id: file.id },
              data: { status: "deleted" },
            });
            deletedCount++;
            return;
          }

          const folder = await db.folder.findFirst({
            where: {
              userId: user.id,
              OR: [{ id }, { providerFolderId: id }],
            },
          });

          if (folder) {
            try {
              await deleteFileFromDrive(folder.storageAccountId, folder.providerFolderId);
            } catch (err) {
              console.warn("Drive delete folder warning:", err);
            }
            await db.folder.delete({ where: { id: folder.id } });
            deletedCount++;
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
          const file = await db.file.findFirst({
            where: {
              userId: user.id,
              OR: [{ id }, { providerFileId: id }],
            },
          });

          if (file) {
            await moveFileInDrive(
              file.storageAccountId,
              file.providerFileId,
              destinationFolderId
            );
            await db.file.update({
              where: { id: file.id },
              data: { parentProviderId: destinationFolderId },
            });
            movedCount++;
            return;
          }

          const folder = await db.folder.findFirst({
            where: {
              userId: user.id,
              OR: [{ id }, { providerFolderId: id }],
            },
          });

          if (folder) {
            await moveFileInDrive(
              folder.storageAccountId,
              folder.providerFolderId,
              destinationFolderId
            );
            await db.folder.update({
              where: { id: folder.id },
              data: { parentFolderId: destinationFolderId },
            });
            movedCount++;
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

    const file = await db.file.findFirst({
      where: {
        userId: user.id,
        OR: [{ id }, { providerFileId: id }],
        status: "active",
      },
    });

    if (!file) {
      return c.json({ error: "File not found" }, 404);
    }

    try {
      const { stream, mimeType, extension } = await downloadFileStream(
        file.storageAccountId,
        file.providerFileId,
        file.mimeType || undefined
      );

      let fileName = file.name;
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
      if (file.size) {
        headers.set("Content-Length", file.size.toString());
      }

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

  // 4. Rename or Move File / Folder
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

      // Try finding in File table
      const file = await db.file.findFirst({
        where: {
          userId: user.id,
          OR: [{ id }, { providerFileId: id }],
        },
      });

      if (file) {
        const updateData: { name?: string; parentProviderId?: string } = {};

        if (name && typeof name === "string" && name.trim()) {
          const cleanName = name.trim();
          await renameFileInDrive(
            file.storageAccountId,
            file.providerFileId,
            cleanName
          );
          updateData.name = cleanName;
        }

        if (destinationFolderId && typeof destinationFolderId === "string") {
          await moveFileInDrive(
            file.storageAccountId,
            file.providerFileId,
            destinationFolderId
          );
          updateData.parentProviderId = destinationFolderId;
        }

        const updated = await db.file.update({
          where: { id: file.id },
          data: updateData,
        });

        return c.json(safeSerialize({ success: true, item: updated }));
      }

      // Try finding in Folder table
      const folder = await db.folder.findFirst({
        where: {
          userId: user.id,
          OR: [{ id }, { providerFolderId: id }],
        },
      });

      if (folder) {
        const updateData: { name?: string; parentFolderId?: string } = {};

        if (name && typeof name === "string" && name.trim()) {
          const cleanName = name.trim();
          await renameFileInDrive(
            folder.storageAccountId,
            folder.providerFolderId,
            cleanName
          );
          updateData.name = cleanName;
        }

        if (destinationFolderId && typeof destinationFolderId === "string") {
          await moveFileInDrive(
            folder.storageAccountId,
            folder.providerFolderId,
            destinationFolderId
          );
          updateData.parentFolderId = destinationFolderId;
        }

        const updated = await db.folder.update({
          where: { id: folder.id },
          data: updateData,
        });

        return c.json(safeSerialize({ success: true, item: updated }));
      }

      return c.json({ error: "Item not found" }, 404);
    }
  )

  // 5. Delete File / Folder
  .delete("/:id", async (c) => {
    const user = c.get("user");
    const id = c.req.param("id");

    const file = await db.file.findFirst({
      where: {
        userId: user.id,
        OR: [{ id }, { providerFileId: id }],
      },
    });

    if (file) {
      try {
        await deleteFileFromDrive(file.storageAccountId, file.providerFileId);
      } catch (err) {
        console.warn("Drive delete warning:", err);
      }
      await db.file.update({
        where: { id: file.id },
        data: { status: "deleted" },
      });
      return c.json({ success: true, message: "File moved to trash" });
    }

    const folder = await db.folder.findFirst({
      where: {
        userId: user.id,
        OR: [{ id }, { providerFolderId: id }],
      },
    });

    if (folder) {
      try {
        await deleteFileFromDrive(
          folder.storageAccountId,
          folder.providerFolderId
        );
      } catch (err) {
        console.warn("Drive delete folder warning:", err);
      }
      await db.folder.delete({ where: { id: folder.id } });
      return c.json({ success: true, message: "Folder moved to trash" });
    }

    return c.json({ error: "Item not found" }, 404);
  });
