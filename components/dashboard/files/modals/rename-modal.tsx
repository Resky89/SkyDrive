"use client";

import React, { useState, useEffect } from "react";
import { Pencil, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { CloudItem } from "../types";

interface RenameModalProps {
  item: CloudItem | null;
  onClose: () => void;
  onSuccess: (updatedName: string) => void;
}

export function RenameModal({ item, onClose, onSuccess }: RenameModalProps) {
  const [renameValue, setRenameValue] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);

  useEffect(() => {
    if (item) {
      setRenameValue(item.name);
    }
  }, [item]);

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item || !renameValue.trim() || renameValue.trim() === item.name) return;

    setIsRenaming(true);
    try {
      const res = await fetch(`/api/files/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: renameValue.trim() }),
      });

      if (res.ok) {
        toast.success(`Berhasil mengubah nama menjadi "${renameValue.trim()}"`);
        onSuccess(renameValue.trim());
        onClose();
      } else {
        toast.error("Gagal mengubah nama item di Google Drive");
      }
    } catch {
      toast.error("Terjadi kesalahan jaringan saat mengubah nama");
    } finally {
      setIsRenaming(false);
    }
  };

  if (!item) return null;

  return (
    <Dialog open={!!item} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md border-border bg-card p-6 shadow-2xl rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
              <Pencil className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-sm font-bold text-foreground">
                Ganti Nama {item.isFolder ? "Folder" : "File"}
              </DialogTitle>
              <DialogDescription className="text-[11px] text-muted-foreground mt-0.5">
                Masukkan nama baru untuk item ini.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleConfirm} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Input
              type="text"
              placeholder="Nama baru..."
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              required
              autoFocus
              className="text-xs h-9"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={isRenaming}
              className="text-xs"
            >
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={!renameValue.trim() || isRenaming || renameValue.trim() === item.name}
              className="gap-1.5 text-xs font-semibold shadow-sm"
            >
              {isRenaming ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Menyimpan…</span>
                </>
              ) : (
                <span>Simpan</span>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
