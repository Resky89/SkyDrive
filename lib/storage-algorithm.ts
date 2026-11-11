import { type StorageAccount } from "@prisma/client";

export type UploadStrategy =
  | "manual"
  | "largest_available"
  | "least_used"
  | "balanced";

export type AccountWithStorage = Pick<
  StorageAccount,
  "id" | "email" | "availableStorage" | "usedStorage" | "totalStorage" | "usagePercentage" | "isActive"
> & {
  displayName?: string | null;
};

/**
 * Select the best storage account based on the chosen strategy.
 * Always validates that the account has enough space for the file.
 */
export function selectStorageAccount<T extends AccountWithStorage>(
  accounts: T[],
  fileSizeBytes: bigint,
  strategy: UploadStrategy,
  manualAccountId?: string
): T | null {
  // Filter only active accounts with enough storage
  const eligible = accounts.filter(
    (acc) => acc.isActive && acc.availableStorage >= fileSizeBytes
  );

  if (eligible.length === 0) return null;

  switch (strategy) {
    case "manual": {
      if (!manualAccountId) return null;
      return eligible.find((acc) => acc.id === manualAccountId) ?? null;
    }

    case "largest_available": {
      // Account with the most free space
      return eligible.sort(
        (a, b) => Number(b.availableStorage - a.availableStorage)
      )[0];
    }

    case "least_used": {
      // Account with lowest usage percentage
      return eligible.sort((a, b) => a.usagePercentage - b.usagePercentage)[0];
    }

    case "balanced": {
      // Account that brings storage distribution closer to equal
      // Pick the account with the lowest usage percentage (same as least_used but intention differs)
      return eligible.sort((a, b) => a.usagePercentage - b.usagePercentage)[0];
    }

    default:
      return eligible[0];
  }
}

/**
 * Check if any account has storage usage above the alert threshold.
 */
export function getStorageAlerts(
  accounts: AccountWithStorage[],
  threshold = 90
): AccountWithStorage[] {
  return accounts.filter((acc) => acc.usagePercentage >= threshold);
}

/**
 * Calculate aggregate storage stats across all connected accounts.
 */
export function calculateAggregateStats(accounts: AccountWithStorage[]) {
  const activeAccounts = accounts.filter((acc) => acc.isActive);

  const totalStorage = activeAccounts.reduce(
    (sum, acc) => sum + acc.totalStorage,
    BigInt(0)
  );
  const usedStorage = activeAccounts.reduce(
    (sum, acc) => sum + acc.usedStorage,
    BigInt(0)
  );
  const availableStorage = activeAccounts.reduce(
    (sum, acc) => sum + acc.availableStorage,
    BigInt(0)
  );
  const overallPercentage =
    totalStorage > BigInt(0)
      ? Math.min((Number(usedStorage) / Number(totalStorage)) * 100, 100)
      : 0;

  return {
    totalStorage,
    usedStorage,
    availableStorage,
    overallPercentage,
    accountCount: activeAccounts.length,
  };
}
