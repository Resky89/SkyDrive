export interface FileData {
  id: string;
  userId: string;
  storageAccountId: string;
  storageAccountEmail: string;
  providerFileId: string;
  name: string;
  mimeType?: string | null;
  size: bigint;
  webViewLink?: string | null;
  thumbnailLink?: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchResult extends FileData {
  highlight?: string;
}
