import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";

export async function DELETE(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { accountId } = await request.json();
  if (!accountId) {
    return NextResponse.json({ error: "accountId is required" }, { status: 400 });
  }

  const account = await db.storageAccount.findFirst({
    where: { id: accountId, userId: session.user.id },
  });

  if (!account) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  await db.storageAccount.update({
    where: { id: accountId },
    data: { isActive: false, accessTokenEnc: "", refreshTokenEnc: "" },
  });

  await db.activityLog.create({
    data: {
      userId: session.user.id,
      storageAccountId: accountId,
      activityType: "account_disconnected",
      description: `Disconnected Google Drive account: ${account.email}`,
    },
  });

  return NextResponse.json({ success: true });
}
