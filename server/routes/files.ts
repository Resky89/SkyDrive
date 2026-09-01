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

export const patchFileSchema = z.object({
  name: z.string().trim().min(1).optional(),
  destinationFolderId: z.string().optional(),
});

export const searchFilesSchema = z.object({
  q: z.string().optional(),
});

export const filesRouter = new Hono<Env>()
  .use("*", authMiddleware)

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

  // 3. Download File Stream
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
