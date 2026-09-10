"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Folder,
  FolderInput,
  FolderPlus,
  Home,
  ChevronRight,
  Search,
  CheckCircle2,
  HardDrive,
  Layers,
  File,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { formatBytes, cn } from "@/lib/utils";
import { CloudItem, StorageAccountSummary, BreadcrumbItem } from "../types";

interface MoveModalProps {
  items: CloudItem[];
  accounts: StorageAccountSummary[];
  onClose: () => void;
  onSuccess: () => void;
}

export function MoveModal({
  items,
  accounts,
  onClose,
  onSuccess,
}: MoveModalProps) {
  const isOpen = items.length > 0;
  const [moveAccountId, setMoveAccountId] = useState<string>("");
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([
    { id: "root", name: "Drive Utama (Root)" },
  ]);
  const currentFolderId = breadcrumbs[breadcrumbs.length - 1]?.id || "root";

  const [subfolders, setSubfolders] = useState<CloudItem[]>([]);
  const [loadingSubfolders, setLoadingSubfolders] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [isMoving, setIsMoving] = useState(false);

  // Initialize account selection when opened
  useEffect(() => {
    if (isOpen) {
      const defaultAccId = items[0]?.account?.id || accounts[0]?.id || "";
      setMoveAccountId(defaultAccId);
      setBreadcrumbs([{ id: "root", name: "Drive Utama (Root)" }]);
      setSearchQuery("");
      setIsCreatingFolder(false);
      setNewFolderName("");
    }
  }, [isOpen, items, accounts]);

  // Fetch folders directly from Google Drive
  const fetchMoveFolders = useCallback(async (accId: string, parentId: string) => {
    if (!accId) return;
    setLoadingSubfolders(true);
    try {
      const params = new URLSearchParams();
      params.append("accountId", accId);
      params.append("parentFolderId", parentId && parentId !== "root" ? parentId : "root");

      const res = await fetch(`/api/folders?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setSubfolders(data.folders || []);
      }
    } catch {
      toast.error("Gagal memuat folder tujuan");
    } finally {
      setLoadingSubfolders(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen && moveAccountId) {
      fetchMoveFolders(moveAccountId, currentFolderId);
    }
  }, [isOpen, moveAccountId, currentFolderId, fetchMoveFolders]);

  const handleNavigateFolder = (folder: CloudItem) => {
    setBreadcrumbs((prev) => [...prev, { id: folder.driveFileId, name: folder.name }]);
    setSearchQuery("");
  };

  const handleNavigateBreadcrumb = (index: number) => {
    setBreadcrumbs((prev) => prev.slice(0, index + 1));
    setSearchQuery("");
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim() || !moveAccountId) return;

    try {
      const res = await fetch("/api/folders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newFolderName.trim(),
          accountId: moveAccountId,
          parentFolderId: currentFolderId !== "root" ? currentFolderId : undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Folder "${newFolderName.trim()}" berhasil dibuat`);
        setNewFolderName("");
        setIsCreatingFolder(false);
        fetchMoveFolders(moveAccountId, currentFolderId);
      } else {
        toast.error(data.error || "Gagal membuat folder");
      }
    } catch {
      toast.error("Terjadi kesalahan saat membuat folder");
    }
  };

  const handleConfirmMove = async () => {
    if (items.length === 0) return;

    setIsMoving(true);
    try {
      const targetFolderObj = breadcrumbs[breadcrumbs.length - 1];
      const targetFolderName = targetFolderObj ? targetFolderObj.name : "Drive Utama";

      if (items.length === 1) {
        const item = items[0];
        const res = await fetch(`/api/files/${item.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ destinationFolderId: currentFolderId }),
        });

        if (res.ok) {
          toast.success(`Berhasil memindahkan "${item.name}" ke ${targetFolderName}`);
          onSuccess();
          onClose();
        } else {
          toast.error("Gagal memindahkan item di Google Drive");
        }
      } else {
        const res = await fetch("/api/files/bulk-move", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            itemIds: items.map((i) => i.id),
            destinationFolderId: currentFolderId,
          }),
        });

        const data = await res.json();
        if (res.ok && data.success) {
          toast.success(`Berhasil memindahkan ${data.movedCount} item ke ${targetFolderName}`);
          onSuccess();
          onClose();
        } else {
          toast.error(data.error || "Gagal memindahkan beberapa item");
        }
      }
    } catch {
      toast.error("Kesalahan jaringan saat memindahkan item");
    } finally {
      setIsMoving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl border border-border bg-card p-6 shadow-2xl rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-primary/10 text-primary border border-primary/25 flex items-center justify-center shadow-inner shrink-0">
              <FolderInput className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                {items.length > 1
                  ? `Pindahkan ${items.length} Item`
                  : `Pindahkan "${items[0]?.name}"`}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Pilih akun Google Drive dan folder tujuan untuk memindahkan item Anda.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {/* Source Item Summary Card */}
          <div className="p-3 rounded-xl bg-secondary/40 border border-border flex items-center justify-between gap-3 text-xs shadow-2xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="size-8 rounded-lg bg-card border border-border/80 flex items-center justify-center shrink-0 shadow-2xs">
                {items.length > 1 ? (
                  <Layers className="size-4 text-primary" />
                ) : items[0]?.isFolder ? (
                  <Folder className="size-4 text-primary" />
                ) : (
                  <File className="size-4 text-sky-500" />
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-semibold text-foreground truncate">
                  {items.length > 1 ? `${items.length} item terpilih` : items[0]?.name}
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {items.length > 1
                    ? `${items.filter((i) => i.isFolder).length} folder, ${
                        items.filter((i) => !i.isFolder).length
                      } file`
                    : items[0]?.isFolder
                    ? "Folder Direktori"
                    : formatBytes(Number(items[0]?.size || 0))}
                </span>
              </div>
            </div>
            {items[0]?.account?.email && (
              <Badge
                variant="outline"
                className="text-[10px] font-mono shrink-0 bg-card border-border"
              >
                {items[0].account.email.split("@")[0]}
              </Badge>
            )}
          </div>

          {/* Account Switcher */}
          {accounts.length > 1 && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-foreground flex items-center gap-1.5">
                <HardDrive className="size-3.5 text-primary" />
                <span>Pilih Akun Penyimpanan Google Drive</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {accounts.map((acc) => {
                  const isCurrentAcc = moveAccountId === acc.id;
                  return (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => {
                        if (moveAccountId !== acc.id) {
                          setMoveAccountId(acc.id);
                          setBreadcrumbs([{ id: "root", name: "Drive Utama (Root)" }]);
                          setSearchQuery("");
                        }
                      }}
                      className={cn(
                        "flex items-center justify-between p-2.5 rounded-xl border text-xs text-left transition-all cursor-pointer",
                        isCurrentAcc
                          ? "border-primary bg-primary/10 font-semibold text-foreground ring-1 ring-primary/40 shadow-2xs"
                          : "border-border bg-card/60 hover:bg-secondary/60 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className={cn(
                            "size-6 rounded-lg flex items-center justify-center shrink-0 text-[10px] font-bold font-mono",
                            isCurrentAcc
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {acc.email.charAt(0).toUpperCase()}
                        </div>
                        <span className="truncate text-xs">{acc.email}</span>
                      </div>
                      {isCurrentAcc && (
                        <CheckCircle2 className="size-3.5 text-primary shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Directory Breadcrumbs Navigator */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Folder className="size-3.5 text-primary" />
                <span>Lokasi Folder Saat Ini</span>
              </label>
              <span className="text-[10px] font-mono text-muted-foreground">
                {subfolders.length} subfolder
              </span>
            </div>

            {/* Breadcrumb Path Bar */}
            <div className="flex items-center gap-1 p-2 rounded-xl bg-secondary/40 border border-border text-xs overflow-x-auto">
              {breadcrumbs.map((crumb, idx) => {
                const isLast = idx === breadcrumbs.length - 1;
                return (
                  <div key={crumb.id} className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleNavigateBreadcrumb(idx)}
                      className={cn(
                        "flex items-center gap-1.5 px-2 py-1 rounded-lg transition-colors cursor-pointer text-xs",
                        isLast
                          ? "bg-card text-foreground font-bold shadow-2xs border border-border"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                    >
                      {idx === 0 ? <Home className="size-3" /> : <Folder className="size-3 text-primary" />}
                      <span>{crumb.name}</span>
                    </button>
                    {!isLast && <ChevronRight className="size-3 text-muted-foreground shrink-0" />}
                  </div>
                );
              })}
            </div>

            {/* Toolbar inside Modal: Search & + New Folder Button */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="size-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  type="text"
                  placeholder="Cari folder di lokasi ini..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 text-xs h-8 bg-card"
                />
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCreatingFolder(!isCreatingFolder)}
                className="h-8 text-xs gap-1.5 shrink-0 shadow-2xs"
              >
                <FolderPlus className="size-3.5 text-primary" />
                <span>Folder Baru</span>
              </Button>
            </div>

            {/* Inline New Folder Creator */}
            {isCreatingFolder && (
              <form
                onSubmit={handleCreateFolder}
                className="p-3 rounded-xl bg-primary/5 border border-primary/30 flex items-center gap-2 animate-in fade-in zoom-in-95"
              >
                <Input
                  type="text"
                  placeholder="Nama folder baru..."
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  autoFocus
                  required
                  className="text-xs h-8 bg-card flex-1"
                />
                <Button type="submit" size="sm" className="h-8 text-xs px-3 font-semibold shadow-2xs">
                  Buat
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsCreatingFolder(false);
                    setNewFolderName("");
                  }}
                  className="h-8 text-xs"
                >
                  Batal
                </Button>
              </form>
            )}

            {/* Subfolder List Explorer */}
            <div className="border border-border rounded-xl bg-card overflow-hidden">
              {loadingSubfolders ? (
                <div className="p-8 text-center flex flex-col items-center justify-center space-y-2">
                  <Loader2 className="size-5 text-primary animate-spin" />
                  <span className="text-xs text-muted-foreground">Memuat folder dari Google Drive…</span>
                </div>
              ) : subfolders.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground space-y-1">
                  <p className="font-medium text-foreground">Tidak ada subfolder di sini</p>
                  <p className="text-[11px]">
                    Anda dapat memindahkan item langsung ke folder ini (
                    {breadcrumbs[breadcrumbs.length - 1]?.name}) atau buat folder baru di atas.
                  </p>
                </div>
              ) : (
                <div className="max-h-52 overflow-y-auto divide-y divide-border">
                  {subfolders
                    .filter(
                      (f) =>
                        !searchQuery ||
                        f.name.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((folder) => {
                      const isMovingThisFolder = items.some(
                        (i) => i.id === folder.id || i.driveFileId === folder.driveFileId
                      );

                      return (
                        <div
                          key={folder.id}
                          className={cn(
                            "flex items-center justify-between p-2.5 text-xs transition-colors",
                            isMovingThisFolder
                              ? "opacity-40 cursor-not-allowed bg-muted/40"
                              : "hover:bg-secondary/60 cursor-pointer"
                          )}
                          onClick={() => {
                            if (!isMovingThisFolder) {
                              handleNavigateFolder(folder);
                            }
                          }}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="size-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                              <Folder className="size-3.5" />
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="font-medium text-foreground truncate">{folder.name}</span>
                              <span className="text-[10px] text-muted-foreground font-mono">
                                {isMovingThisFolder
                                  ? "Item sedang dipindahkan"
                                  : new Date(folder.updatedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          {!isMovingThisFolder && (
                            <div className="flex items-center gap-1 text-muted-foreground hover:text-primary">
                              <span className="text-[11px] font-semibold">Buka</span>
                              <ChevronRight className="size-3.5" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>

          {/* Target Confirmation Bar */}
          <div className="p-3 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <CheckCircle2 className="size-4 text-primary shrink-0" />
              <span className="text-foreground truncate font-medium">
                Pindahkan ke:{" "}
                <strong className="text-primary">
                  {breadcrumbs[breadcrumbs.length - 1]?.name}
                </strong>
              </span>
            </div>
            {breadcrumbs.length > 1 && (
              <button
                type="button"
                onClick={() => handleNavigateBreadcrumb(0)}
                className="text-[11px] text-primary hover:underline font-semibold shrink-0 cursor-pointer"
              >
                Pindah ke Root
              </button>
            )}
          </div>

          {/* Footer Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={isMoving}
              className="text-xs"
            >
              Batal
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleConfirmMove}
              disabled={isMoving}
              className="gap-1.5 text-xs font-semibold shadow-xs"
            >
              {isMoving ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Memindahkan…</span>
                </>
              ) : (
                <>
                  <FolderInput className="size-3.5" />
                  <span>
                    Pindahkan ke Sini ({breadcrumbs[breadcrumbs.length - 1]?.name})
                  </span>
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
