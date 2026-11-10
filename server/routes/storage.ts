import { Hono } from "hono";
import { db } from "@/lib/db";
import { calculateAggregateStats } from "@/lib/storage-algorithm";
import { autoConnectPrimaryGoogleAccount } from "@/lib/auto-connect";
import { authMiddleware, type Env } from "../middleware/auth";

export const storageRouter = new Hono<Env>()
  .use("*", authMiddleware)

  .get("/analytics", async (c) => {
    const user = c.get("user");

    // Automatically connect login Google Account if available
    await autoConnectPrimaryGoogleAccount(user.id);

    // Last 30 days analytics
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [accounts, analytics] = await Promise.all([
      db.storageAccount.findMany({
        where: { userId: user.id, isActive: true },
        orderBy: { createdAt: "desc" },
      }),
      db.storageAnalytics.findMany({
        where: {
          storageAccount: { userId: user.id },
          recordedAt: { gte: thirtyDaysAgo },
        },
        include: { storageAccount: { select: { email: true } } },
        orderBy: { recordedAt: "asc" },
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
      totalFiles: 0,
      totalStorage: aggregate.totalStorage.toString(),
      usedStorage: aggregate.usedStorage.toString(),
      availableStorage: aggregate.availableStorage.toString(),
      usagePercentage: aggregate.overallPercentage,
      accountCount: aggregate.accountCount,
      breakdown: {
        photosSize: "0",
        videosSize: "0",
        documentsSize: "0",
        othersSize: "0",
        freeStorage: aggregate.availableStorage.toString(),
        usedStorage: aggregate.usedStorage.toString(),
        totalStorage: aggregate.totalStorage.toString(),
      },
    };

    return c.json({
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
        lastSyncedAt: a.lastSyncedAt,
      })),
      recentUploads: [],
      byAccount,
      filesByCategory: {
        photos: "0",
        videos: "0",
        documents: "0",
        others: "0",
      },
    });
  });
