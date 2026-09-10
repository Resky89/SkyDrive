"use client";

import React, { useState } from "react";
import { AlertTriangle, Folder, File, Trash2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatBytes } from "@/lib/utils";
import { CloudItem } from "../types";

interface BulkDeleteModalProps {
  isOpen: boolean;
  items: CloudItem[];
  onClose: () => void;
  onSuccess: () => void;
}

export function BulkDeleteModal({
  isOpen,
  items,
  onClose,
  onSuccess,
}: BulkDeleteModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    if (items.length === 0) return;

    setIsDeleting(true);
    try {
      const res = await fetch("/api/files/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemIds: items.map((i) => i.id) }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Berhasil menghapus ${data.deletedCount} item`);
        onSuccess();
        onClose();
      } else {
        toast.error(data.error || "Gagal menghapus beberapa item");
      }
    } catch {
      toast.error("Kesalahan jaringan saat menghapus item");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md border-border bg-card p-6 shadow-2xl rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 flex items-center justify-center shrink-0">
              <AlertTriangle className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-sm font-bold text-foreground">
                Hapus {items.length} Item Terpilih?
              </DialogTitle>
              <DialogDescription className="text-[11px] text-muted-foreground mt-0.5">
                Item yang dihapus akan dipindahkan ke tempat sampah Google Drive.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 pt-2">
          {/* Selected Items Scroll List */}
          <div className="max-h-48 overflow-y-auto space-y-1.5 p-2 rounded-xl bg-destructive/5 border border-destructive/20">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-card/60 text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {item.isFolder ? (
                    <Folder className="size-3.5 text-primary shrink-0" />
                  ) : (
                    <File className="size-3.5 text-muted-foreground shrink-0" />
                  )}
                  <span className="font-medium text-foreground truncate">{item.name}</span>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                  {item.isFolder ? "Folder" : formatBytes(Number(item.size || 0))}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={isDeleting}
              className="text-xs"
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleConfirm}
              disabled={isDeleting}
              className="gap-1.5 text-xs font-semibold shadow-xs"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Menghapus {items.length} item…</span>
                </>
              ) : (
                <>
                  <Trash2 className="size-3.5" />
                  <span>Hapus Semua ({items.length} Item)</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
