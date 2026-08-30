import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format bytes to human-readable string (KB, MB, GB) */
export function formatBytes(bytes: bigint | number, decimals = 1): string {
  const n = typeof bytes === "bigint" ? Number(bytes) : bytes;
  if (n === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(n) / Math.log(k));
  return `${parseFloat((n / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

/** Format bytes to GB with 2 decimal places */
export function formatGB(bytes: bigint | number): string {
  const n = typeof bytes === "bigint" ? Number(bytes) : bytes;
  return `${(n / (1024 ** 3)).toFixed(2)} GB`;
}

/** Get initials from a name string */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/** Get color class based on usage percentage */
export function getUsageColor(percentage: number): string {
  if (percentage >= 90) return "text-red-400";
  if (percentage >= 70) return "text-amber-400";
  return "text-emerald-400";
}

/** Get progress bar color based on usage percentage */
export function getProgressColor(percentage: number): string {
  if (percentage >= 90) return "bg-red-500";
  if (percentage >= 70) return "bg-amber-500";
  return "bg-emerald-500";
}

/** Get file type icon name based on MIME type */
export function getFileIcon(mimeType: string): string {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "music";
  if (mimeType.includes("pdf")) return "file-text";
  if (mimeType.includes("zip") || mimeType.includes("archive")) return "archive";
  if (mimeType.includes("folder")) return "folder";
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) return "table";
  if (mimeType.includes("presentation") || mimeType.includes("powerpoint")) return "presentation";
  if (mimeType.includes("document") || mimeType.includes("word")) return "file-text";
  return "file";
}

/** Strategy display labels */
export const STRATEGY_LABELS: Record<string, string> = {
  manual: "Manual Selection",
  largest_available: "Largest Available Storage",
  least_used: "Least Used Storage",
  balanced: "Balanced Distribution",
};

/** Status badge variants */
export const STATUS_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  completed: "default",
  pending: "secondary",
  in_progress: "secondary",
  failed: "destructive",
  active: "default",
};

/** Truncate email for display */
export function truncateEmail(email: string, maxLength = 28): string {
  if (email.length <= maxLength) return email;
  const [local, domain] = email.split("@");
  if (!domain) return email.slice(0, maxLength) + "…";
  const truncatedLocal = local.slice(0, maxLength - domain.length - 4) + "…";
  return `${truncatedLocal}@${domain}`;
}
