import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { createFolderInDrive } from "@/lib/google-drive";

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, accountId, parentFolderId } = await request.json().catch(() => ({}));

  if (!name || !name.trim()) {
    return NextResponse.json({ error: "Folder name is required" }, { status: 400 });
  }

  // Get target storage account
  let targetAccount = null;
  if (accountId) {
    targetAccount = await db.storageAccount.findFirst({
      where: { id: accountId, userId: session.user.id, isActive: true },
    });
  } else {
    // Pick the account with the most available storage
    targetAccount = await db.storageAccount.findFirst({
      where: { userId: session.user.id, isActive: true },
      orderBy: { availableStorage: "desc" },
    });
  }

  if (!targetAccount) {
    return NextResponse.json({ error: "No connected storage account found" }, { status: 400 });
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
        userId: session.user.id,
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

    return NextResponse.json({
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
    return NextResponse.json(
      { error: err.message || "Failed to create folder on Google Drive" },
      { status: 500 }
    );
  }
}
