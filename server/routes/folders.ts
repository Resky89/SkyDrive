import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { db } from "@/lib/db";
import { authMiddleware, type Env } from "../middleware/auth";
import { createFolderInDrive } from "@/lib/google-drive";

export const createFolderSchema = z.object({
  name: z.string().trim().min(1, { message: "Folder name is required" }),
  accountId: z.string().optional(),
  parentFolderId: z.string().optional(),
});

export type CreateFolderInput = z.infer<typeof createFolderSchema>;

export const foldersRouter = new Hono<Env>()
  .use("*", authMiddleware)

  .post(
    "/create",
    zValidator("json", createFolderSchema),
    async (c) => {
      const user = c.get("user");
      const { name, accountId, parentFolderId } = c.req.valid("json");

      // Get target storage account
      let targetAccount = null;
      if (accountId) {
        targetAccount = await db.storageAccount.findFirst({
          where: { id: accountId, userId: user.id, isActive: true },
        });
      } else {
        // Pick account with most available storage
        targetAccount = await db.storageAccount.findFirst({
          where: { userId: user.id, isActive: true },
          orderBy: { availableStorage: "desc" },
        });
      }

      if (!targetAccount) {
        return c.json(
          { error: "No connected storage account found" },
          400
        );
      }

      try {
        const driveFolder = await createFolderInDrive(
          targetAccount.id,
          name.trim(),
          parentFolderId || undefined
        );

        if (!driveFolder.id) {
          throw new Error("Failed to create folder on Google Drive");
        }

        // Save to database
        const savedFolder = await db.file.create({
          data: {
            userId: user.id,
            storageAccountId: targetAccount.id,
            providerFileId: driveFolder.id,
            name: driveFolder.name ?? name.trim(),
            mimeType: "application/vnd.google-apps.folder",
            size: BigInt(0),
            parentProviderId: parentFolderId || null,
            webViewLink: driveFolder.webViewLink,
            status: "active",
          },
        });

        return c.json({
          success: true,
          folder: {
            id: savedFolder.id,
            name: savedFolder.name,
            driveFileId: savedFolder.providerFileId,
            mimeType: savedFolder.mimeType,
            account: {
              id: targetAccount.id,
              email: targetAccount.email,
            },
          },
        });
      } catch (err: any) {
        console.error("Create folder error:", err);
        return c.json(
          { error: err.message || "Failed to create folder on Google Drive" },
          500
        );
      }
    }
  );
