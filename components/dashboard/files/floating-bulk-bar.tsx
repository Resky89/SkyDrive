"use client";

import React from "react";
import { FolderInput, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatBytes } from "@/lib/utils";
import { CloudItem } from "./types";

interface FloatingBulkBarProps {
  selectedItems: CloudItem[];
  totalCurrentItems: number;
  onSelectAll: () => void;
  onOpenBulkMove: () => void;
  onOpenBulkDelete: () => void;
  onClearSelection: () => void;
}

export function FloatingBulkBar({
  selectedItems,
  totalCurrentItems,
  onSelectAll,
  onOpenBulkMove,
  onOpenBulkDelete,
  onClearSelection,
}: FloatingBulkBarProps) {
  if (selectedItems.length === 0) return null;

  const folderCount = selectedItems.filter((i) => i.isFolder).length;
  const fileCount = selectedItems.filter((i) => !i.isFolder).length;
  const totalSizeBytes = selectedItems.reduce(
    (acc, i) => acc + (i.isFolder ? 0 : Number(i.size || 0)),
    0
  );

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-2xl animate-in slide-in-from-bottom-6 duration-300">
      <div className="p-3 sm:p-4 rounded-2xl bg-card/95 border border-primary/40 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-xl bg-primary/15 text-primary border border-primary/30 flex items-center justify-center shrink-0 font-bold font-mono">
            {selectedItems.length}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-foreground truncate">
              {selectedItems.length} Item Terpilih
            </span>
            <span className="text-[10px] text-muted-foreground font-mono truncate">
              {formatBytes(totalSizeBytes)} • {folderCount} folder, {fileCount} file
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onSelectAll}
            className="text-xs h-8 px-2.5 rounded-xl gap-1.5 hidden sm:inline-flex"
          >
            <span>
              {selectedItems.length === totalCurrentItems ? "Batal Semua" : "Pilih Semua"}
            </span>
          </Button>

          <Button
            size="sm"
            onClick={onOpenBulkMove}
            className="text-xs h-8 px-3 rounded-xl gap-1.5 font-semibold shadow-xs"
          >
            <FolderInput className="size-3.5" />
            <span>Pindahkan</span>
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={onOpenBulkDelete}
            className="text-xs h-8 px-3 rounded-xl gap-1.5 font-semibold shadow-xs"
          >
            <Trash2 className="size-3.5" />
            <span>Hapus</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onClearSelection}
            className="size-8 rounded-xl text-muted-foreground hover:text-foreground"
            title="Tutup Pilihan"
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
