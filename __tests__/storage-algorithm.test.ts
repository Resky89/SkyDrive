import { describe, it, expect } from "vitest";
import {
  selectStorageAccount,
  getStorageAlerts,
  calculateAggregateStats,
  type AccountWithStorage,
} from "@/lib/storage-algorithm";

describe("lib/storage-algorithm", () => {
  const mockAccounts: AccountWithStorage[] = [
    {
      id: "acc-1",
      email: "user1@gmail.com",
      displayName: "Drive One",
      availableStorage: BigInt(5 * 1024 * 1024 * 1024), // 5 GB free
      usedStorage: BigInt(10 * 1024 * 1024 * 1024), // 10 GB used
      totalStorage: BigInt(15 * 1024 * 1024 * 1024), // 15 GB total
      usagePercentage: 66.6,
      isActive: true,
    },
    {
      id: "acc-2",
      email: "user2@gmail.com",
      displayName: "Drive Two",
      availableStorage: BigInt(12 * 1024 * 1024 * 1024), // 12 GB free
      usedStorage: BigInt(3 * 1024 * 1024 * 1024), // 3 GB used
      totalStorage: BigInt(15 * 1024 * 1024 * 1024), // 15 GB total
      usagePercentage: 20.0,
      isActive: true,
    },
    {
      id: "acc-3",
      email: "inactive@gmail.com",
      displayName: "Inactive Account",
      availableStorage: BigInt(14 * 1024 * 1024 * 1024),
      usedStorage: BigInt(1 * 1024 * 1024 * 1024),
      totalStorage: BigInt(15 * 1024 * 1024 * 1024),
      usagePercentage: 6.6,
      isActive: false, // Inactive!
    },
  ];

  describe("selectStorageAccount", () => {
    const file1Gb = BigInt(1024 * 1024 * 1024);

    it("should pick account with largest available storage", () => {
      const selected = selectStorageAccount(mockAccounts, file1Gb, "largest_available");
      expect(selected?.id).toBe("acc-2"); // 12 GB available vs 5 GB
    });

    it("should pick account with least usage percentage", () => {
      const selected = selectStorageAccount(mockAccounts, file1Gb, "least_used");
      expect(selected?.id).toBe("acc-2"); // 20% vs 66.6% (inactive acc-3 ignored)
    });

    it("should honor manual account selection if account is active and has enough space", () => {
      const selected = selectStorageAccount(mockAccounts, file1Gb, "manual", "acc-1");
      expect(selected?.id).toBe("acc-1");
    });

    it("should reject inactive accounts even if they have the most space", () => {
      const selected = selectStorageAccount(mockAccounts, file1Gb, "manual", "acc-3");
      expect(selected).toBeNull();
    });

    it("should return null if file size exceeds all accounts' available storage", () => {
      const hugeFile = BigInt(20 * 1024 * 1024 * 1024); // 20 GB
      const selected = selectStorageAccount(mockAccounts, hugeFile, "largest_available");
      expect(selected).toBeNull();
    });
  });

  describe("getStorageAlerts", () => {
    it("should flag accounts that exceed threshold", () => {
      const accounts: AccountWithStorage[] = [
        { ...mockAccounts[0], usagePercentage: 92 },
        { ...mockAccounts[1], usagePercentage: 70 },
      ];
      const alerts = getStorageAlerts(accounts, 90);
      expect(alerts.length).toBe(1);
      expect(alerts[0].id).toBe("acc-1");
    });
  });

  describe("calculateAggregateStats", () => {
    it("should aggregate storage only across active accounts", () => {
      const stats = calculateAggregateStats(mockAccounts);
      expect(stats.accountCount).toBe(2);
      expect(stats.totalStorage).toBe(BigInt(30 * 1024 * 1024 * 1024)); // 15 + 15 GB
      expect(stats.usedStorage).toBe(BigInt(13 * 1024 * 1024 * 1024)); // 10 + 3 GB
      expect(stats.availableStorage).toBe(BigInt(17 * 1024 * 1024 * 1024)); // 5 + 12 GB
    });
  });
});

