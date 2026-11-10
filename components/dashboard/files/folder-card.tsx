"use client";

import React, { memo } from "react";
import { Folder, MoreVertical, FolderInput, Pencil, Trash2, CheckCircle2 } from "lucide-react";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { CloudItem } from "./types";

interface FolderCardProps {
  folder: CloudItem;
  index: number;
  isSelected: boolean;
  isDragOver: boolean;
  isBeingDragged: boolean;
  onItemClick: (folder: CloudItem, index: number, e: React.MouseEvent) => void;
  onItemDoubleClick?: (folder: CloudItem, e: React.MouseEvent) => void;
  onItemPointerDown?: (folder: CloudItem, e: React.PointerEvent) => void;
  onOpenFolder: (folder: CloudItem) => void;
  onOpenMove: (folder: CloudItem, e?: React.MouseEvent) => void;
  onOpenRename: (folder: CloudItem, e?: React.MouseEvent) => void;
  onOpenDelete: (folder: CloudItem, e?: React.MouseEvent) => void;
  onDragStart: (e: React.DragEvent, folder: CloudItem) => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent, folderId: string) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, destinationId: string, destinationName: string) => void;
  registerRef: (id: string, el: HTMLElement | null) => void;
}

export const FolderCard = memo(function FolderCard({
  folder,
  index,
  isSelected,
  isDragOver,
  isBeingDragged,
  onItemClick,
  onItemDoubleClick,
  onItemPointerDown,
  onOpenFolder,
  onOpenMove,
  onOpenRename,
  onOpenDelete,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  registerRef,
}: FolderCardProps) {
  return (
    <SpotlightCard
      data-item-card="true"
      ref={(el) => registerRef(folder.id, el)}
      draggable={isSelected}
      onDragStart={(e) => isSelected && onDragStart(e, folder)}
      onDragEnd={onDragEnd}
      onDragOver={(e) => onDragOver(e, folder.id)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, folder.driveFileId || folder.id, folder.name)}
      onPointerDown={(e) => onItemPointerDown?.(folder, e)}
      onClick={(e) => onItemClick(folder, index, e)}
      onDoubleClick={(e) => onItemDoubleClick?.(folder, e)}
      className={cn(
        "p-3.5 flex items-center justify-between gap-3 border transition-all cursor-pointer group card-hover relative h-full rounded-2xl select-none",
        isSelected
          ? "border-primary bg-primary/15 ring-2 ring-primary/70 shadow-lg font-semibold"
          : "border-border hover:border-primary/40 hover:bg-accent/40 shadow-xs",
        isDragOver && "ring-2 ring-primary border-primary bg-primary/20 scale-[1.02] shadow-xl",
        isBeingDragged && "opacity-50 border-dashed"
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          data-select-checkbox="true"
          onClick={(e) => {
            e.stopPropagation();
            onItemClick(folder, index, e);
          }}
          className={cn(
            "size-9 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform cursor-pointer",
            isSelected
              ? "bg-primary text-primary-foreground shadow-sm ring-2 ring-primary/40"
              : "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20"
          )}
          title={isSelected ? "Batalkan pilihan folder" : "Pilih folder"}
        >
          {isSelected ? (
            <CheckCircle2 className="size-4.5" />
          ) : (
            <Folder className="size-4.5" />
          )}
        </button>
        <div className="flex flex-col min-w-0 pointer-events-none">
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className={cn(
                "text-xs truncate transition-colors",
                isSelected ? "text-primary font-bold" : "text-foreground font-semibold group-hover:text-primary"
              )}
            >
              {folder.name}
            </span>
            {folder.isShared && (
              <span className="text-[9px] font-medium text-blue-600 dark:text-blue-400 shrink-0">
                · Dibagikan
              </span>
            )}
          </div>
          <span className="text-[10px] text-muted-foreground font-mono truncate">
            {folder.isShared && folder.sharedBy
              ? `${folder.sharedBy} → ${folder.account.email}`
              : folder.account.email}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-7 rounded-lg text-muted-foreground hover:text-foreground"
              title="Opsi Folder"
            >
              <MoreVertical className="size-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => onOpenFolder(folder)} className="gap-2 text-xs font-semibold">
              <Folder className="size-3.5 text-primary" />
              <span>Buka Folder</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => onOpenMove(folder, e)} className="gap-2 text-xs">
              <FolderInput className="size-3.5 text-muted-foreground" />
              <span>Pindahkan</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => onOpenRename(folder, e)} className="gap-2 text-xs">
              <Pencil className="size-3.5 text-muted-foreground" />
              <span>Ganti Nama</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(e) => onOpenDelete(folder, e)}
              className="gap-2 text-xs text-destructive focus:text-destructive focus:bg-destructive/10"
            >
              <Trash2 className="size-3.5 text-destructive" />
              <span>Hapus</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </SpotlightCard>
  );
});
