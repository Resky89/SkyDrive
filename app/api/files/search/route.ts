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

  const q = request.nextUrl.searchParams.get("q");
  if (!q || q.trim().length < 2) {
    return NextResponse.json({ results: [] });
  }

  // Get all active accounts
  const accounts = await db.storageAccount.findMany({
    where: { userId: session.user.id, isActive: true },
    select: { id: true, email: true },
  });

  if (accounts.length === 0) {
    return NextResponse.json({ results: [] });
  }

  // Search across all accounts in parallel
  const searchResults = await Promise.allSettled(
    accounts.map(async (account) => {
      const { files } = await listFiles(account.id, { query: q, pageSize: 20 });
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

  return NextResponse.json({ results, query: q });
}
