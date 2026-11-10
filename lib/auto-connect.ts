import { db } from "@/lib/db";
import { encrypt } from "@/lib/encryption";
import { getStorageQuota } from "@/lib/google-drive";

/**
 * Automatically syncs and connects the user's primary login Google Account
 * as a StorageAccount in SkyDrive if they authenticated via Google OAuth.
 */
export async function autoConnectPrimaryGoogleAccount(userId: string) {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        accounts: {
          where: { providerId: "google" },
        },
        storageAccounts: true,
      },
    });

    if (!user || user.accounts.length === 0) {
      return null;
    }

    const googleAuthAccount = user.accounts[0];
    if (!googleAuthAccount.accessToken) {
      return null;
    }

    // Check if this email is already connected in storageAccounts
    const existing = user.storageAccounts.find((sa) => sa.email === user.email);

    if (existing) {
      // Update access token, but NEVER overwrite existing refreshToken with empty value
      const updateData: {
        accessTokenEnc?: string;
        refreshTokenEnc?: string;
        tokenExpiresAt?: Date | null;
        isActive?: boolean;
      } = {
        isActive: true,
      };

      if (googleAuthAccount.accessToken) {
        updateData.accessTokenEnc = encrypt(googleAuthAccount.accessToken);
        updateData.tokenExpiresAt = googleAuthAccount.accessTokenExpiresAt;
      }

      if (googleAuthAccount.refreshToken) {
        updateData.refreshTokenEnc = encrypt(googleAuthAccount.refreshToken);
      }

      await db.storageAccount.update({
        where: { id: existing.id },
        data: updateData,
      });

      return existing;
    }

    // Create or update the storage account from the login credentials
    const updateAccountData: {
      displayName?: string | null;
      avatarUrl?: string | null;
      accessTokenEnc: string;
      refreshTokenEnc?: string;
      tokenExpiresAt?: Date | null;
      isActive: boolean;
    } = {
      displayName: user.name,
      avatarUrl: user.image,
      accessTokenEnc: encrypt(googleAuthAccount.accessToken),
      tokenExpiresAt: googleAuthAccount.accessTokenExpiresAt,
      isActive: true,
    };

    if (googleAuthAccount.refreshToken) {
      updateAccountData.refreshTokenEnc = encrypt(googleAuthAccount.refreshToken);
    }

    const storageAccount = await db.storageAccount.upsert({
      where: { userId_email: { userId: user.id, email: user.email } },
      update: updateAccountData,
      create: {
        userId: user.id,
        provider: "google_drive",
        providerAccountId: googleAuthAccount.accountId || user.email,
        email: user.email,
        displayName: user.name,
        avatarUrl: user.image,
        accessTokenEnc: encrypt(googleAuthAccount.accessToken),
        refreshTokenEnc: googleAuthAccount.refreshToken ? encrypt(googleAuthAccount.refreshToken) : "",
        tokenExpiresAt: googleAuthAccount.accessTokenExpiresAt,
        isActive: true,
        totalStorage: BigInt(0),
        usedStorage: BigInt(0),
        availableStorage: BigInt(0),
      },
    });

    // Fetch live storage quota from Google Drive API
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
      console.warn("Could not fetch initial quota for auto-connected account:", quotaErr);
    }

    return storageAccount;
  } catch (err) {
    console.error("Error auto-connecting primary Google account:", err);
    return null;
  }
}
