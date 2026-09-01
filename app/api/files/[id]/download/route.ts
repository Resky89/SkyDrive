import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { downloadFileStream } from "@/lib/google-drive";
import { Readable } from "stream";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Find file belonging to authenticated user
  const file = await db.file.findFirst({
    where: {
      userId: session.user.id,
      OR: [{ id }, { providerFileId: id }],
      status: "active",
    },
  });

  if (!file) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
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

    // Convert Node Readable to Web ReadableStream
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

    const responseHeaders = new Headers();
    responseHeaders.set(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(fileName)}"; filename*=UTF-8''${encodeURIComponent(fileName)}`
    );
    responseHeaders.set("Content-Type", mimeType || "application/octet-stream");
    if (file.size) {
      responseHeaders.set("Content-Length", file.size.toString());
    }

    return new NextResponse(webStream, {
      status: 200,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("File download error:", error);
    return NextResponse.json(
      { error: "Failed to download file from Google Drive" },
      { status: 500 }
    );
  }
}
