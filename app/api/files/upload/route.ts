import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { uploadFileToDrive, createFolderInDrive } from "@/lib/google-drive";
import {
  selectStorageAccount,
  type UploadStrategy,
} from "@/lib/storage-algorithm";

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const strategy = (formData.get("strategy") as UploadStrategy) ?? "manual";
  const manualAccountId = (formData.get("accountId") as string) || (formData.get("targetAccountId") as string);
  const relativePath = (formData.get("relativePath") as string) || "";
  let targetParentFolderId = (formData.get("parentFolderId") as string) || undefined;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // Get all active accounts
  const accounts = await db.storageAccount.findMany({
    where: { userId: session.user.id, isActive: true },
  });

  if (accounts.length === 0) {
    return NextResponse.json(
      { error: "No connected storage accounts" },
      { status: 400 }
    );
  }

  const fileSize = BigInt(file.size);

  // Run smart allocation algorithm
  const selectedAccount = selectStorageAccount(
    accounts,
    fileSize,
    strategy,
    manualAccountId ?? undefined
  );

  if (!selectedAccount) {
    return NextResponse.json(
      { error: "No account has enough storage for this file" },
      { status: 400 }
    );
  }

  // Create upload record
  const upload = await db.upload.create({
    data: {
      userId: session.user.id,
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

    // If relativePath contains directories (e.g. "MyFolder/Subfolder/file.pdf")
    if (relativePath && relativePath.includes("/")) {
      const parts = relativePath.split("/").filter(Boolean);
      const directorySegments = parts.slice(0, parts.length - 1);

      let currentParent = targetParentFolderId;

      for (const segment of directorySegments) {
        // Check if folder already exists in DB
        let existingFolder = await db.file.findFirst({
          where: {
            userId: session.user.id,
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
                userId: session.user.id,
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

    // Save file metadata to DB
    const savedFile = await db.file.create({
      data: {
        userId: session.user.id,
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

    // Update upload record to completed
    await db.upload.update({
      where: { id: upload.id },
      data: {
        fileId: savedFile.id,
        status: "completed",
        completedAt: new Date(),
      },
    });

    // Trigger storage sync in background
    fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/google/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accountId: selectedAccount.id }),
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      uploadId: upload.id,
      file: {
        id: savedFile.id,
        name: savedFile.name,
        size: savedFile.size.toString(),
        account: selectedAccount.email,
        webViewLink: savedFile.webViewLink,
      },
    });
  } catch (err: any) {
    console.error("Upload error:", err);
    await db.upload.update({
      where: { id: upload.id },
      data: {
        status: "failed",
        errorMessage: err instanceof Error ? err.message : "Upload failed",
        completedAt: new Date(),
      },
    });

    return NextResponse.json({ error: err.message || "Upload failed" }, { status: 500 });
  }
}
