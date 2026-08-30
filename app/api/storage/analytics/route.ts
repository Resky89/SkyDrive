import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { calculateAggregateStats } from "@/lib/storage-algorithm";
import { autoConnectPrimaryGoogleAccount } from "@/lib/auto-connect";

export async function GET(_request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Automatically connect the login Google Account if available
  await autoConnectPrimaryGoogleAccount(session.user.id);

  // Last 30 days analytics per account
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [accounts, analytics, totalFiles, recentUploads] = await Promise.all([
    db.storageAccount.findMany({
      where: { userId: session.user.id, isActive: true },
      orderBy: { createdAt: "desc" },
    }),
    db.storageAnalytics.findMany({
      where: {
        storageAccount: { userId: session.user.id },
        recordedAt: { gte: thirtyDaysAgo },
      },
      include: { storageAccount: { select: { email: true } } },
      orderBy: { recordedAt: "asc" },
    }),
    db.file.count({
      where: { userId: session.user.id },
    }),
    db.upload.findMany({
      where: { userId: session.user.id },
      include: { storageAccount: { select: { email: true } } },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  const aggregate = calculateAggregateStats(accounts);

  // Group analytics by account
  const byAccount = analytics.reduce(
    (acc, a) => {
      const key = a.storageAccount.email;
      if (!acc[key]) acc[key] = [];
      acc[key].push({
        date: a.recordedAt,
        usedStorage: a.usedStorage.toString(),
        availableStorage: a.availableStorage.toString(),
        usagePercentage: a.usagePercentage,
      });
      return acc;
    },
    {} as Record<string, unknown[]>
  );

  const summaryData = {
    totalAccounts: accounts.length,
    activeAccounts: accounts.filter((a) => a.isActive).length,
    totalFiles,
    totalStorage: aggregate.totalStorage.toString(),
    usedStorage: aggregate.usedStorage.toString(),
    availableStorage: aggregate.availableStorage.toString(),
    usagePercentage: aggregate.overallPercentage,
    accountCount: aggregate.accountCount,
  };

  return NextResponse.json({
    summary: summaryData,
    aggregate: summaryData,
    accounts: accounts.map((a) => ({
      id: a.id,
      email: a.email,
      displayName: a.displayName,
      avatarUrl: a.avatarUrl,
      totalStorage: a.totalStorage.toString(),
      usedStorage: a.usedStorage.toString(),
      availableStorage: a.availableStorage.toString(),
      usagePercentage: a.usagePercentage,
      isActive: a.isActive,
      lastSyncedAt: a.lastSyncedAt?.toISOString() || null,
      createdAt: a.createdAt.toISOString(),
    })),
    recentUploads: recentUploads.map((u) => ({
      id: u.id,
      name: u.originalFilename,
      size: u.fileSize.toString(),
      mimeType: u.mimeType,
      status: u.status,
      createdAt: u.createdAt.toISOString(),
      account: u.storageAccount,
    })),
    trend: byAccount,
  });
}
