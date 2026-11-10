import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { db } from "@/lib/db";
import { encrypt } from "@/lib/encryption";
import {
  getAuthorizationUrl,
  exchangeCodeForTokens,
  getUserInfo,
  getStorageQuota,
  refreshAccountAccessToken,
  isInvalidGrantError,
} from "@/lib/google-drive";
import { autoConnectPrimaryGoogleAccount } from "@/lib/auto-connect";
import { authMiddleware, type Env } from "../middleware/auth";

export const syncGoogleSchema = z.object({
  accountId: z.string().optional(),
});

export const disconnectGoogleSchema = z.object({
  accountId: z.string().min(1, { message: "accountId is required" }),
});

export const googleRouter = new Hono<Env>()
  // 1. Generate Google OAuth Connect URL
  .get("/connect", authMiddleware, async (c) => {
    const user = c.get("user");
    const email = c.req.query("email");
    const state = Buffer.from(
      JSON.stringify({ userId: user.id, email, ts: Date.now() })
    ).toString("base64");

    const url = getAuthorizationUrl(state, email);
    return c.redirect(url);
  })

  // 2. OAuth Callback
  .get("/callback", async (c) => {
    const code = c.req.query("code");
    const state = c.req.query("state");
    const error = c.req.query("error");

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    if (error || !code || !state) {
      return c.redirect(`${appUrl}/dashboard/accounts?error=oauth_denied`);
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
      const updateData: {
        displayName?: string | null;
        avatarUrl?: string | null;
        accessTokenEnc: string;
        refreshTokenEnc?: string;
        tokenExpiresAt?: Date | null;
        isActive: boolean;
      } = {
        displayName: userInfo.name,
        avatarUrl: userInfo.picture,
        accessTokenEnc: encrypt(tokens.access_token),
        tokenExpiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        isActive: true,
      };

      if (tokens.refresh_token) {
        updateData.refreshTokenEnc = encrypt(tokens.refresh_token);
      }

      const storageAccount = await db.storageAccount.upsert({
        where: { userId_email: { userId, email: userInfo.email } },
        update: updateData,
        create: {
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
          totalStorage: BigInt(0),
          usedStorage: BigInt(0),
          availableStorage: BigInt(0),
        },
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

      return c.redirect(`${appUrl}/dashboard/accounts?success=connected`);
    } catch (err) {
      console.error("Google OAuth callback error:", err);
      return c.redirect(`${appUrl}/dashboard/accounts?error=connection_failed`);
    }
  })

  // 3. Sync Quotas Across Accounts
  .post(
    "/sync",
    authMiddleware,
    zValidator("json", syncGoogleSchema.optional()),
    async (c) => {
      const user = c.get("user");
      await autoConnectPrimaryGoogleAccount(user.id);

      const validData = c.req.valid("json");
      const accountId = validData?.accountId;

      const where = accountId
        ? { id: accountId, userId: user.id, isActive: true }
        : { userId: user.id, isActive: true };

      const accounts = await db.storageAccount.findMany({ where });

      if (accounts.length === 0) {
        return c.json({
          success: true,
          count: 0,
          accounts: [],
          message: "No active accounts found",
        });
      }

      const results = await Promise.allSettled(
        accounts.map(async (acc) => {
          // Explicit on-demand token refresh & quota sync triggered by Sinkron action
          const quota = await getStorageQuota(acc.id, { forceRefresh: true });
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

      const successful = results
        .filter((r) => r.status === "fulfilled")
        .map((r) => (r as PromiseFulfilledResult<unknown>).value);

      const failed = results
        .filter((r) => r.status === "rejected")
        .map((r) => {
          const reason = (r as PromiseRejectedResult).reason;
          const msg = reason?.message || "Unknown error";
          const isInvalidGrant =
            isInvalidGrantError(reason) || msg.includes("invalid_grant");
          return {
            error: msg,
            isInvalidGrant,
          };
        });

      if (accountId && successful.length === 0) {
        const firstFailure = failed[0];
        return c.json(
          {
            success: false,
            error: firstFailure?.error || "Failed to sync account",
            isInvalidGrant: firstFailure?.isInvalidGrant || false,
            count: 0,
          },
          400
        );
      }

      return c.json({
        success: true,
        count: successful.length,
        failedCount: failed.length,
        hasInvalidGrant: failed.some((f) => f.isInvalidGrant),
        accounts: successful,
      });
    }
  )

  // 4. Disconnect Storage Account
  .delete(
    "/disconnect",
    authMiddleware,
    zValidator("json", disconnectGoogleSchema),
    async (c) => {
      const user = c.get("user");
      const { accountId } = c.req.valid("json");

      const account = await db.storageAccount.findFirst({
        where: { id: accountId, userId: user.id },
      });

      if (!account) {
        return c.json({ error: "Account not found" }, 404);
      }

      await db.storageAccount.update({
        where: { id: accountId },
        data: { isActive: false, accessTokenEnc: "", refreshTokenEnc: "" },
      });

      await db.activityLog.create({
        data: {
          userId: user.id,
          storageAccountId: accountId,
          activityType: "account_disconnected",
          description: `Disconnected Google Drive account: ${account.email}`,
        },
      });

      return c.json({ success: true });
    }
  );
