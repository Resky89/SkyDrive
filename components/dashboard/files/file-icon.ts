import {
  Folder,
  File,
  FileText,
  FileSpreadsheet,
  Presentation,
  Image as ImageIcon,
  Video,
  Music,
  Archive,
  LucideIcon,
} from "lucide-react";

export function getFileIconComponent(mimeType: string): LucideIcon {
  if (mimeType === "application/vnd.google-apps.folder") return Folder;
  if (mimeType.includes("image/")) return ImageIcon;
  if (mimeType.includes("video/")) return Video;
  if (mimeType.includes("audio/")) return Music;
  if (
    mimeType.includes("sheet") ||
    mimeType.includes("excel") ||
    mimeType.includes("csv")
  ) {
    return FileSpreadsheet;
  }
  if (
    mimeType.includes("presentation") ||
    mimeType.includes("powerpoint")
  ) {
    return Presentation;
  }
  if (
    mimeType.includes("document") ||
    mimeType.includes("word") ||
    mimeType.includes("pdf") ||
    mimeType.includes("text")
  ) {
    return FileText;
  }
  if (
    mimeType.includes("zip") ||
    mimeType.includes("rar") ||
    mimeType.includes("tar") ||
    mimeType.includes("7z")
  ) {
    return Archive;
  }
  return File;
}
