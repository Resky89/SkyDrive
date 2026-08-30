import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { encrypt } from "@/lib/encryption";
import {
  exchangeCodeForTokens,
  getUserInfo,
  getStorageQuota,
} from "@/lib/google-drive";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (error || !code || !state) {
    return NextResponse.redirect(
      `${appUrl}/dashboard/accounts?error=oauth_denied`
    );
  }

  try {
    const { userId } = JSON.parse(Buffer.from(state, "base64").toString());

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code);
    if (!tokens.access_token) throw new Error("No access token received");

    // Get Google user info
    const userInfo = await getUserInfo(tokens.access_token);
    if (!userInfo.email) throw new Error("Could not get user email");

    // Create or update storage account
    const accountData = {
      userId,
      provider: "google_drive",
      providerAccountId: userInfo.id ?? userInfo.email,
      email: userInfo.email,
      displayName: userInfo.name,
      avatarUrl: userInfo.picture,
      accessTokenEnc: encrypt(tokens.access_token),
      refreshTokenEnc: tokens.refresh_token ? encrypt(tokens.refresh_token) : "",
      tokenExpiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
      isActive: true,
    };

    const storageAccount = await db.storageAccount.upsert({
      where: { userId_email: { userId, email: userInfo.email } },
      update: accountData,
      create: { ...accountData, totalStorage: BigInt(0), usedStorage: BigInt(0), availableStorage: BigInt(0) },
    });

    // Sync storage quota
    try {
      const quota = await getStorageQuota(storageAccount.id);
      await db.storageAccount.update({
        where: { id: storageAccount.id },
        data: {
          totalStorage: quota.total,
          usedStorage: quota.used,
          availableStorage: quota.available,
          usagePercentage: quota.percentage,
          lastSyncedAt: new Date(),
        },
      });
    } catch (quotaErr) {
      console.warn("Initial quota sync skipped during callback:", quotaErr);
    }

    // Log activity
    await db.activityLog.create({
      data: {
        userId,
        storageAccountId: storageAccount.id,
        activityType: "account_connected",
        description: `Connected Google Drive account: ${userInfo.email}`,
      },
    });

    return NextResponse.redirect(
      `${appUrl}/dashboard/accounts?success=connected`
    );
  } catch (err) {
    console.error("Google OAuth callback error:", err);
    return NextResponse.redirect(
      `${appUrl}/dashboard/accounts?error=connection_failed`
    );
  }
}
