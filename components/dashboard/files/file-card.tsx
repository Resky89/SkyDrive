"use client";

import React, { memo } from "react";
import {
  Download,
  ExternalLink,
  Eye,
  MoreVertical,
  Pencil,
  FolderInput,
  Trash2,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { formatBytes, cn } from "@/lib/utils";
import { CloudItem } from "./types";
import { getFileIconComponent } from "./file-icon";

interface FileCardProps {
  file: CloudItem;
  index: number;
  isSelected: boolean;
  isBeingDragged: boolean;
  downloadingId: string | null;
  onItemClick: (file: CloudItem, index: number, e: React.MouseEvent) => void;
  onItemDoubleClick?: (file: CloudItem, e: React.MouseEvent) => void;
  onItemPointerDown?: (file: CloudItem, e: React.PointerEvent) => void;
  onPreview: (file: CloudItem) => void;
  onDownload: (file: CloudItem, e?: React.MouseEvent) => void;
  onOpenMove: (file: CloudItem, e?: React.MouseEvent) => void;
  onOpenRename: (file: CloudItem, e?: React.MouseEvent) => void;
  onOpenDelete: (file: CloudItem, e?: React.MouseEvent) => void;
  onDragStart: (e: React.DragEvent, file: CloudItem) => void;
  onDragEnd: () => void;
  registerRef: (id: string, el: HTMLElement | null) => void;
}

export const FileCard = memo(function FileCard({
  file,
  index,
  isSelected,
  isBeingDragged,
  downloadingId,
  onItemClick,
  onItemDoubleClick,
  onItemPointerDown,
  onPreview,
  onDownload,
  onOpenMove,
  onOpenRename,
  onOpenDelete,
  onDragStart,
  onDragEnd,
  registerRef,
}: FileCardProps) {
  const Icon = getFileIconComponent(file.mimeType);

  return (
    <SpotlightCard
      data-item-card="true"
      ref={(el) => registerRef(file.id, el)}
      draggable={isSelected}
      onDragStart={(e) => isSelected && onDragStart(e, file)}
      onDragEnd={onDragEnd}
      onPointerDown={(e) => onItemPointerDown?.(file, e)}
      onClick={(e) => onItemClick(file, index, e)}
      onDoubleClick={(e) => onItemDoubleClick?.(file, e)}
      className={cn(
        "flex flex-col justify-between border card-hover group overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer h-full rounded-2xl select-none relative",
        isSelected
          ? "border-primary bg-primary/15 ring-2 ring-primary/70 shadow-lg font-semibold"
          : "border-border hover:border-primary/40",
        isBeingDragged && "opacity-50 border-dashed"
      )}
    >
      {/* Selection Check Indicator / Button */}
      <button
        type="button"
        data-select-checkbox="true"
        onClick={(e) => {
          e.stopPropagation();
          onItemClick(file, index, e);
        }}
        className={cn(
          "absolute top-2 left-2 z-20 size-6 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md",
          isSelected
            ? "bg-primary text-primary-foreground opacity-100 scale-100 animate-in fade-in zoom-in-75 duration-150"
            : "bg-background/80 hover:bg-background text-muted-foreground border border-border/80 opacity-0 group-hover:opacity-100 hover:scale-105"
        )}
        title={isSelected ? "Batalkan pilihan file" : "Pilih file"}
      >
        <CheckCircle2 className={cn("size-4", !isSelected && "opacity-40")} />
      </button>

      {/* Live Thumbnail / Visual Preview Banner */}
      <div className="relative w-full h-36 bg-muted/50 border-b border-border flex items-center justify-center overflow-hidden cursor-pointer group/thumb shrink-0 pointer-events-none">
        {file.thumbnailLink ? (
          <img
            src={file.thumbnailLink}
            alt={file.name}
            referrerPolicy="no-referrer"
            loading="lazy"
            className="w-full h-full object-cover object-top transition-transform duration-300 group-hover/thumb:scale-105"
            onError={(e) => {
              (e.target as HTMLElement).style.display = "none";
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center space-y-1.5 text-muted-foreground">
            <Icon
              className={cn(
                "size-8 transition-all group-hover/thumb:scale-110",
                isSelected
                  ? "text-primary"
                  : "text-muted-foreground/70 group-hover/thumb:text-primary"
              )}
            />
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60">
              {file.mimeType.split("/")[1]?.split(".")[0] || "File"}
            </span>
          </div>
        )}

        {/* Storage Account & Shared Status Badges */}
        <div className="absolute top-2 right-2 z-10 flex items-center gap-1.5 max-w-[80%] justify-end">
          {file.isShared && (
            <Badge
              variant="outline"
              className="text-[9px] font-sans font-medium bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30 backdrop-blur-md px-1.5 py-0.5"
              title={file.sharedBy ? `Dibagikan oleh: ${file.sharedBy}` : "File yang dibagikan"}
            >
              Dibagikan
            </Badge>
          )}
          <Badge
            variant="info"
            className="text-[9px] font-mono bg-background/80 backdrop-blur-md shadow-sm border border-border truncate"
          >
            {file.account.email.split("@")[0]}
          </Badge>
        </div>
      </div>

      {/* File Details & Metadata */}
      <div className="p-3.5 space-y-2.5 flex flex-col justify-between flex-1">
        <div className="space-y-1 min-w-0 pointer-events-none">
          <h4
            className={cn(
              "text-xs truncate transition-colors",
              isSelected
                ? "text-primary font-bold"
                : "text-foreground font-semibold group-hover:text-primary"
            )}
            title={file.name}
          >
            {file.name}
          </h4>
          <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
            <span>{formatBytes(Number(file.size))}</span>
            <span>{new Date(file.updatedAt).toLocaleDateString()}</span>
          </div>
          {file.isShared && file.sharedBy && (
            <div className="text-[10px] text-blue-600 dark:text-blue-400 truncate">
              Oleh: {file.sharedBy}
            </div>
          )}
        </div>

        <div
          className="flex items-center justify-end pt-2 border-t border-border mt-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 rounded-lg text-muted-foreground hover:text-foreground"
                title="Opsi File"
              >
                {downloadingId === file.id ? (
                  <Loader2 className="size-3.5 animate-spin text-primary" />
                ) : (
                  <MoreVertical className="size-3.5" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem
                onClick={() => onPreview(file)}
                className="gap-2 text-xs font-semibold"
              >
                <Eye className="size-3.5 text-primary" />
                <span>Preview</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => onDownload(file, e)}
                disabled={downloadingId === file.id}
                className="gap-2 text-xs font-semibold text-primary focus:text-primary"
              >
                {downloadingId === file.id ? (
                  <Loader2 className="size-3.5 animate-spin text-primary" />
                ) : (
                  <Download className="size-3.5 text-primary" />
                )}
                <span>{downloadingId === file.id ? "Mengunduh..." : "Unduh"}</span>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="gap-2 text-xs">
                <a
                  href={
                    file.webViewLink ||
                    `https://drive.google.com/file/d/${file.driveFileId}/view`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="size-3.5 text-muted-foreground" />
                  <span>Buka di Google Drive</span>
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => onOpenMove(file, e)} className="gap-2 text-xs">
                <FolderInput className="size-3.5 text-muted-foreground" />
                <span>Pindahkan</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => onOpenRename(file, e)} className="gap-2 text-xs">
                <Pencil className="size-3.5 text-muted-foreground" />
                <span>Ganti Nama</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(e) => onOpenDelete(file, e)}
                className="gap-2 text-xs text-destructive focus:text-destructive focus:bg-destructive/10"
              >
                <Trash2 className="size-3.5 text-destructive" />
                <span>Hapus</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </SpotlightCard>
  );
});
