import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { getStorageQuota } from "@/lib/google-drive";
import { autoConnectPrimaryGoogleAccount } from "@/lib/auto-connect";

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Ensure login Google account is synced
  await autoConnectPrimaryGoogleAccount(session.user.id);

  const { accountId } = await request.json().catch(() => ({}));

  const where = accountId
    ? { id: accountId, userId: session.user.id, isActive: true }
    : { userId: session.user.id, isActive: true };

  const accounts = await db.storageAccount.findMany({ where });

  const results = await Promise.allSettled(
    accounts.map(async (acc) => {
      const quota = await getStorageQuota(acc.id);
      await db.storageAccount.update({
        where: { id: acc.id },
        data: {
          totalStorage: quota.total,
          usedStorage: quota.used,
          availableStorage: quota.available,
          usagePercentage: quota.percentage,
          lastSyncedAt: new Date(),
        },
      });

      // Record analytics snapshot
      await db.storageAnalytics.create({
        data: {
          storageAccountId: acc.id,
          usedStorage: quota.used,
          availableStorage: quota.available,
          totalStorage: quota.total,
          usagePercentage: quota.percentage,
        },
      });

      return {
        id: acc.id,
        email: acc.email,
        totalStorage: quota.total.toString(),
        usedStorage: quota.used.toString(),
        availableStorage: quota.available.toString(),
        usagePercentage: quota.percentage,
      };
    })
  );

  const synced = results
    .filter((r) => r.status === "fulfilled")
    .map((r) => (r as PromiseFulfilledResult<unknown>).value);

  const errors = results
    .filter((r) => r.status === "rejected")
    .map((r) => ((r as PromiseRejectedResult).reason?.message || "Sync failed"));

  return NextResponse.json({
    synced,
    count: synced.length,
    errors: errors.length > 0 ? errors : undefined,
  });
}
