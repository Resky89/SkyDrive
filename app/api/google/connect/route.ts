import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getAuthorizationUrl } from "@/lib/google-drive";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const state = Buffer.from(
    JSON.stringify({ userId: session.user.id, ts: Date.now() })
  ).toString("base64");

  const url = getAuthorizationUrl(state);
  return NextResponse.redirect(url);
}
