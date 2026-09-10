import { LucideIcon } from "lucide-react";

export interface CloudItem {
  id: string;
  name: string;
  size: string;
  mimeType: string;
  driveFileId: string;
  parentFolderId?: string | null;
  isFolder: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
  webViewLink?: string;
  thumbnailLink?: string | null;
  iconLink?: string | null;
  account: {
    id: string;
    email: string;
    displayName?: string | null;
  };
}

export interface StorageAccountSummary {
  id: string;
  email: string;
  availableStorage: string;
  usagePercentage: number;
}

export interface BreadcrumbItem {
  id: string;
  name: string;
}

export interface TypeFilterItem {
  id: string;
  label: string;
  icon: LucideIcon;
}
