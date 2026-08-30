export interface UploadData {
  id: string;
  userId: string;
  storageAccountId: string;
  storageAccountEmail: string;
  originalFilename: string;
  fileSize: bigint;
  mimeType?: string | null;
  uploadStrategy: string;
  status: "pending" | "in_progress" | "completed" | "failed";
  errorMessage?: string | null;
  startedAt?: Date | null;
  completedAt?: Date | null;
  createdAt: Date;
}

export type UploadStrategy = "manual" | "largest_available" | "least_used" | "balanced";
