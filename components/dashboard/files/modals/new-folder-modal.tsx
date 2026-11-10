"use client";

import React, { useState } from "react";
import { FolderPlus, Loader2 } from "lucide-react";
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
import { formatBytes } from "@/lib/utils";
import { StorageAccountSummary } from "../types";

interface NewFolderModalProps {
  isOpen: boolean;
  accounts: StorageAccountSummary[];
  defaultAccountId: string;
  currentFolderId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function NewFolderModal({
  isOpen,
  accounts,
  defaultAccountId,
  currentFolderId,
  onClose,
  onSuccess,
}: NewFolderModalProps) {
  const [folderName, setFolderName] = useState("");
  const [targetAccountId, setTargetAccountId] = useState(defaultAccountId);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) return;

    setIsCreating(true);
    try {
      const res = await fetch("/api/folders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: folderName.trim(),
          accountId: targetAccountId || undefined,
          parentFolderId: currentFolderId !== "root" ? currentFolderId : undefined,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(`Folder "${folderName.trim()}" berhasil dibuat`);
        setFolderName("");
        onSuccess();
        onClose();
      } else {
        toast.error(data.error || "Gagal membuat folder");
      }
    } catch {
      toast.error("Terjadi kesalahan saat membuat folder");
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md border-border bg-card p-6 shadow-2xl rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
              <FolderPlus className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-sm font-bold text-foreground">
                Buat Folder Baru
              </DialogTitle>
              <DialogDescription className="text-[11px] text-muted-foreground mt-0.5">
                Folder akan otomatis dibuat di Google Drive Anda.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleCreate} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Nama Folder</label>
            <Input
              type="text"
              placeholder="Contoh: Dokumen Kerja, Foto Liburan..."
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              required
              autoFocus
              className="text-xs h-9"
            />
          </div>

          {accounts.length > 1 && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Target Storage Pool</label>
              <select
                value={targetAccountId}
                onChange={(e) => setTargetAccountId(e.target.value)}
                className="w-full h-9 rounded-xl border border-input bg-card px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Auto-Route (Akun dengan sisa ruang terbanyak)</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.isLoginAccount ? "👤 Akun Login: " : "☁️ Akun Tambahan: "}
                    {acc.email} ({formatBytes(Number(acc.availableStorage))} tersisa)
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={isCreating}
              className="text-xs"
            >
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={!folderName.trim() || isCreating}
              className="gap-1.5 text-xs font-semibold shadow-sm"
            >
              {isCreating ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Membuat…</span>
                </>
              ) : (
                <>
                  <FolderPlus className="size-3.5" />
                  <span>Buat Folder</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
