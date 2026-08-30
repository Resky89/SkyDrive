export interface StorageAccountData {
  id: string;
  email: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  provider: string;
  totalStorage: bigint;
  usedStorage: bigint;
  availableStorage: bigint;
  usagePercentage: number;
  isActive: boolean;
  lastSyncedAt?: Date | null;
  createdAt: Date;
}

export interface StorageStats {
  totalStorage: bigint;
  usedStorage: bigint;
  availableStorage: bigint;
  overallPercentage: number;
  accountCount: number;
}

export interface StorageAlert {
  accountId: string;
  email: string;
  usagePercentage: number;
  availableStorage: bigint;
}
