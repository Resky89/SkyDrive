import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import {
  deleteFileFromDrive,
  renameFileInDrive,
  moveFileInDrive,
} from "@/lib/google-drive";

function safeSerialize<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (_, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // 1. Try finding in File table by id or providerFileId
  const file = await db.file.findFirst({
    where: {
      userId: session.user.id,
      OR: [{ id }, { providerFileId: id }],
    },
  });

  if (file) {
    try {
      await deleteFileFromDrive(file.storageAccountId, file.providerFileId);
    } catch (err) {
      console.warn("Drive delete warning:", err);
    }
    await db.file.update({ where: { id: file.id }, data: { status: "deleted" } });
    return NextResponse.json({ success: true, message: "File moved to trash" });
  }

  // 2. Try finding in Folder table by id or providerFolderId
  const folder = await db.folder.findFirst({
    where: {
      userId: session.user.id,
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
    return NextResponse.json({ success: true, message: "Folder moved to trash" });
  }

  return NextResponse.json({ error: "Item not found" }, { status: 404 });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { name, destinationFolderId } = body;

  if (!name && !destinationFolderId) {
    return NextResponse.json(
      { error: "Provide a name to rename or destinationFolderId to move" },
      { status: 400 }
    );
  }

  // 1. Try updating File
  const file = await db.file.findFirst({
    where: {
      userId: session.user.id,
      OR: [{ id }, { providerFileId: id }],
    },
  });

  if (file) {
    const updateData: { name?: string; parentProviderId?: string } = {};

    if (name && typeof name === "string" && name.trim()) {
      const cleanName = name.trim();
      await renameFileInDrive(file.storageAccountId, file.providerFileId, cleanName);
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

    return NextResponse.json(safeSerialize({ success: true, item: updated }));
  }

  // 2. Try updating Folder
  const folder = await db.folder.findFirst({
    where: {
      userId: session.user.id,
      OR: [{ id }, { providerFolderId: id }],
    },
  });

  if (folder) {
    const updateData: { name?: string; parentFolderId?: string } = {};

    if (name && typeof name === "string" && name.trim()) {
      const cleanName = name.trim();
      await renameFileInDrive(folder.storageAccountId, folder.providerFolderId, cleanName);
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

    return NextResponse.json(safeSerialize({ success: true, item: updated }));
  }

  return NextResponse.json({ error: "Item not found" }, { status: 404 });
}
