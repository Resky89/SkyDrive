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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CloudItem } from "../types";

interface DeleteModalProps {
  item: CloudItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeleteModal({ item, onClose, onSuccess }: DeleteModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    if (!item) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/files/${item.id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(`Berhasil menghapus "${item.name}"`);
        onSuccess();
        onClose();
      } else {
        toast.error("Gagal menghapus item dari Google Drive");
      }
    } catch {
      toast.error("Terjadi kesalahan jaringan saat menghapus");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!item) return null;

  return (
    <Dialog open={!!item} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md border-border bg-card p-6 shadow-2xl rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 flex items-center justify-center shrink-0">
              <AlertTriangle className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-sm font-bold text-foreground">
                Hapus {item.isFolder ? "Folder" : "File"}?
              </DialogTitle>
              <DialogDescription className="text-[11px] text-muted-foreground mt-0.5">
                Item akan dipindahkan ke tempat sampah Google Drive.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="p-3 rounded-xl bg-destructive/5 border border-destructive/20 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              {item.isFolder ? (
                <Folder className="size-4 text-primary shrink-0" />
              ) : (
                <File className="size-4 text-muted-foreground shrink-0" />
              )}
              <span className="font-semibold text-foreground truncate">{item.name}</span>
            </div>
            <Badge variant="outline" className="text-[10px] font-mono shrink-0">
              {item.account.email.split("@")[0]}
            </Badge>
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
                  <span>Menghapus…</span>
                </>
              ) : (
                <>
                  <Trash2 className="size-3.5" />
                  <span>Hapus</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
