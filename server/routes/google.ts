import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import crypto from "crypto";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
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

interface OAuthStatePayload {
  userId: string;
  email?: string;
  nonce: string;
  ts: number;
}

function getOAuthSigningSecret(): string {
  const secret = process.env.ENCRYPTION_KEY || process.env.BETTER_AUTH_SECRET;
  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("Missing ENCRYPTION_KEY or BETTER_AUTH_SECRET in production.");
  }
  return secret || "skydrive-oauth-state-signing-fallback";
}

export function signOAuthState(payload: OAuthStatePayload): string {
  const secret = getOAuthSigningSecret();
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", secret).update(data).digest("base64url");
  return `${data}.${signature}`;
}

export function verifyAndParseOAuthState(signedState: string): OAuthStatePayload | null {
  try {
    const parts = signedState.split(".");
    if (parts.length !== 2) return null;
    const [data, signature] = parts;
    if (!data || !signature) return null;

    const secret = getOAuthSigningSecret();
    const expectedSig = crypto.createHmac("sha256", secret).update(data).digest("base64url");

    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSig);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }

    const json = Buffer.from(data, "base64url").toString("utf-8");
    const payload = JSON.parse(json) as OAuthStatePayload;

    // Check expiration (max 10 minutes)
    const TEN_MINUTES_MS = 10 * 60 * 1000;
    if (Date.now() - payload.ts > TEN_MINUTES_MS) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export const syncGoogleSchema = z.object({
  accountId: z.string().optional(),
});

export const disconnectGoogleSchema = z.object({
  accountId: z.string().min(1, { message: "accountId is required" }),
});

export const googleRouter = new Hono<Env>()
  // 1. Generate Google OAuth Connect URL with CSRF Nonce & HMAC Signature
  .get("/connect", authMiddleware, async (c) => {
    const user = c.get("user");
    const email = c.req.query("email");
    const nonce = crypto.randomBytes(24).toString("hex");

    // Set secure HTTP-only cookie containing nonce
    setCookie(c, "skydrive_oauth_nonce", nonce, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 600, // 10 minutes
    });

    const state = signOAuthState({
      userId: user.id,
      email,
      nonce,
      ts: Date.now(),
    });

    const url = getAuthorizationUrl(state, email);
    return c.redirect(url);
  })

  // 2. OAuth Callback with Anti-CSRF, Signature & Session Verification
  .get("/callback", async (c) => {
    const code = c.req.query("code");
    const state = c.req.query("state");
    const error = c.req.query("error");
    const cookieNonce = getCookie(c, "skydrive_oauth_nonce");

    // Clean up nonce cookie
    deleteCookie(c, "skydrive_oauth_nonce", { path: "/" });

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ??
      process.env.BETTER_AUTH_URL ??
      (process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000");

    if (error || !code || !state) {
      return c.redirect(`${appUrl}/dashboard/accounts?error=oauth_denied`);
    }

    // A. Verify HMAC Signature and freshness
    const parsedState = verifyAndParseOAuthState(state);
    if (!parsedState) {
      console.error("OAuth Callback Security Error: Invalid or expired state signature.");
      return c.redirect(`${appUrl}/dashboard/accounts?error=invalid_state`);
    }

    // B. Verify Nonce against HttpOnly Cookie (Anti-CSRF)
    if (!cookieNonce || cookieNonce !== parsedState.nonce) {
      console.error("OAuth Callback Security Error: Nonce mismatch or missing cookie (CSRF detected).");
      return c.redirect(`${appUrl}/dashboard/accounts?error=csrf_detected`);
    }

    // C. Verify Active Session matches State User ID
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session?.user || session.user.id !== parsedState.userId) {
      console.error("OAuth Callback Security Error: Active session does not match state userId.");
      return c.redirect(`${appUrl}/dashboard/accounts?error=session_mismatch`);
    }

    try {
      const { userId } = parsedState;

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
