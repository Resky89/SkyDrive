import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { db } from "@/lib/db";
import { authMiddleware, type Env } from "../middleware/auth";
import { createFolderInDrive, getGoogleDriveClient } from "@/lib/google-drive";

export const createFolderSchema = z.object({
  name: z.string().trim().min(1, { message: "Folder name is required" }),
  accountId: z.string().optional(),
  parentFolderId: z.string().optional(),
});

export const listFoldersSchema = z.object({
  accountId: z.string().optional(),
  parentFolderId: z.string().optional().default("root"),
});

export type CreateFolderInput = z.infer<typeof createFolderSchema>;

export const foldersRouter = new Hono<Env>()
  .use("*", authMiddleware)

  // 1. List Folders for a given account and parent folder (Independent of UI search/filter)
  .get("/", zValidator("query", listFoldersSchema), async (c) => {
    const user = c.get("user");
    const { accountId, parentFolderId } = c.req.valid("query");

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
      return c.json({ folders: [], accounts: [] });
    }

    const currentParent = parentFolderId && parentFolderId !== "root" ? parentFolderId : "root";

    const driveResults = await Promise.allSettled(
      accounts.map(async (acc) => {
        try {
          const drive = await getGoogleDriveClient(acc.id);
          const parentQuery =
            currentParent === "root" ? "'root' in parents" : `'${currentParent}' in parents`;

          const { data } = await drive.files.list({
            q: `trashed = false and mimeType = 'application/vnd.google-apps.folder' and ${parentQuery}`,
            pageSize: 100,
            orderBy: "name",
            fields: "files(id, name, mimeType, webViewLink, parents, modifiedTime)",
          });

          return (data.files || []).map((f) => ({
            id: f.id!,
            driveFileId: f.id!,
            name: f.name!,
            mimeType: f.mimeType!,
            parentFolderId: currentParent,
            isFolder: true,
            updatedAt: f.modifiedTime || new Date().toISOString(),
            account: {
              id: acc.id,
              email: acc.email,
              displayName: acc.displayName,
            },
          }));
        } catch (err) {
          console.warn(`Could not list folders for ${acc.email}:`, err);
          return [];
        }
      })
    );

    const folders = driveResults
      .filter((r) => r.status === "fulfilled")
      .flatMap((r) => (r as PromiseFulfilledResult<any[]>).value);

    return c.json({
      folders,
      accounts: accounts.map((a) => ({
        id: a.id,
        email: a.email,
        displayName: a.displayName,
        availableStorage: a.availableStorage.toString(),
        usagePercentage: a.usagePercentage,
      })),
    });
  })

  // 2. Create Folder
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

        return c.json({
          success: true,
          folder: {
            id: driveFolder.id,
            name: driveFolder.name ?? name.trim(),
            driveFileId: driveFolder.id,
            mimeType: "application/vnd.google-apps.folder",
            parentFolderId: parentFolderId || null,
            webViewLink: driveFolder.webViewLink,
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
