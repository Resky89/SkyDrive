"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Folder,
  FolderPlus,
  File,
  Loader2,
  UploadCloud,
  ChevronRight,
  Home,
  Users2,
  HardDrive,
  Layers,
} from "lucide-react";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { CloudItem, StorageAccountSummary, BreadcrumbItem } from "@/components/dashboard/files/types";
import { useFileSelection } from "@/components/dashboard/files/use-file-selection";
import { FileFilterBar } from "@/components/dashboard/files/file-filter-bar";
import { FolderCard } from "@/components/dashboard/files/folder-card";
import { FileCard } from "@/components/dashboard/files/file-card";
import { FilesTableView } from "@/components/dashboard/files/files-table-view";
import { FloatingBulkBar } from "@/components/dashboard/files/floating-bulk-bar";
import { MoveModal } from "@/components/dashboard/files/modals/move-modal";
import { BulkDeleteModal } from "@/components/dashboard/files/modals/bulk-delete-modal";
import { DeleteModal } from "@/components/dashboard/files/modals/delete-modal";
import { RenameModal } from "@/components/dashboard/files/modals/rename-modal";
import { NewFolderModal } from "@/components/dashboard/files/modals/new-folder-modal";
import { PreviewModal } from "@/components/dashboard/files/modals/preview-modal";
import { MarqueeOverlay } from "@/components/dashboard/files/marquee-overlay";

export default function FileExplorerPage() {
  // Navigation & Scope
  const [scope, setScope] = useState<"all" | "mydrive" | "sharedWithMe">("all");
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([
    { id: "root", name: "Semua File & Dibagikan" },
  ]);
  const currentFolderId = breadcrumbs[breadcrumbs.length - 1]?.id || "root";

  // Data & Pagination
  const [folders, setFolders] = useState<CloudItem[]>([]);
  const [files, setFiles] = useState<CloudItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [accounts, setAccounts] = useState<StorageAccountSummary[]>([]);

  // Filter States
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [sortFilter, setSortFilter] = useState("name_asc");
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Modals & Active Actions
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<CloudItem | null>(null);
  const [renameItem, setRenameItem] = useState<CloudItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<CloudItem | null>(null);
  const [moveItems, setMoveItems] = useState<CloudItem[]>([]);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);

  // Upload, Download & Drag State
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState("");
  const [draggedItem, setDraggedItem] = useState<CloudItem | null>(null);
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const loadMoreSentinelRef = useRef<HTMLDivElement>(null);

  const allCurrentItems = [...folders, ...files];
  const isAnyModalOpen = Boolean(
    isNewFolderOpen ||
      previewItem ||
      renameItem ||
      deleteItem ||
      moveItems.length > 0 ||
      isBulkDeleteOpen
  );

  // Google Drive Style Selection Hook (Click, Ctrl+Click, Shift+Click, Marquee Lasso, Shortcuts)
  const {
    selectedIds,
    setSelectedIds,
    selectedItems,
    explorerContainerRef,
    isMarqueeActive,
    marqueeRect,
    registerItemRef,
    handleItemClick,
    handleItemPointerDown,
    handleSelectAll,
    handleClearSelection,
    handleContainerMouseDown,
  } = useFileSelection({
    items: allCurrentItems,
    isModalOpen: isAnyModalOpen,
    onBulkDeleteRequest: () => setIsBulkDeleteOpen(true),
  });

  // Fetch Items from Backend API
  const fetchItems = useCallback(
    async (pageToFetch = 1, isAppending = false) => {
      try {
        if (isAppending) setLoadingMore(true);
        else setLoading(true);

        const params = new URLSearchParams();
        params.append("page", pageToFetch.toString());
        params.append("limit", "24");
        params.append("scope", scope);
        if (query) params.append("q", query);
        if (selectedAccountId) params.append("accountId", selectedAccountId);
        if (typeFilter !== "all") params.append("type", typeFilter);
        if (dateFilter !== "all") params.append("date", dateFilter);
        if (sortFilter) params.append("sort", sortFilter);
        if (currentFolderId && currentFolderId !== "root") {
          params.append("folderId", currentFolderId);
        }

        const res = await fetch(`/api/files?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          const deduplicate = (items: CloudItem[]) => {
            const seen = new Set<string>();
            return (items || []).filter((item) => {
              if (!item?.id || seen.has(item.id)) return false;
              seen.add(item.id);
              return true;
            });
          };

          if (isAppending) {
            setFolders((prev) => deduplicate([...prev, ...(data.folders || [])]));
            setFiles((prev) => deduplicate([...prev, ...(data.files || [])]));
          } else {
            setFolders(deduplicate(data.folders || []));
            setFiles(deduplicate(data.files || []));
          }

          setTotalItems(data.total || 0);
          setHasMore(Boolean(data.hasMore));
          setPage(pageToFetch);

          if (data.accounts) {
            setAccounts(data.accounts);
          }
        }
      } catch {
        toast.error("Gagal memuat file dari Google Drive");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [currentFolderId, dateFilter, query, scope, selectedAccountId, sortFilter, typeFilter]
  );

  useEffect(() => {
    fetchItems(1, false);
    setSelectedIds(new Set());
  }, [fetchItems, currentFolderId, scope, query, typeFilter, dateFilter, sortFilter, selectedAccountId, setSelectedIds]);

  useEffect(() => {
    const handleRefresh = () => fetchItems(1, false);
    window.addEventListener("skydrive:refresh", handleRefresh);
    return () => window.removeEventListener("skydrive:refresh", handleRefresh);
  }, [fetchItems]);

  // Lazy Loading Observer
  useEffect(() => {
    if (!hasMore || loading || loadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          fetchItems(page + 1, true);
        }
      },
      { threshold: 0.1, rootMargin: "150px" }
    );

    const target = loadMoreSentinelRef.current;
    if (target) observer.observe(target);
    return () => {
      if (target) observer.unobserve(target);
    };
  }, [hasMore, loading, loadingMore, page, fetchItems]);

  // Navigation Handlers
  const handleOpenFolder = (folder: CloudItem) => {
    setBreadcrumbs((prev) => [...prev, { id: folder.driveFileId, name: folder.name }]);
  };

  const handleNavigateBreadcrumb = (index: number) => {
    setBreadcrumbs((prev) => prev.slice(0, index + 1));
  };

  const handleSwitchScope = (newScope: "all" | "mydrive" | "sharedWithMe") => {
    if (scope === newScope) return;
    setScope(newScope);
    const rootName =
      newScope === "all"
        ? "Semua File & Dibagikan"
        : newScope === "mydrive"
        ? "Drive Saya"
        : "Dibagikan kepada saya";
    setBreadcrumbs([{ id: "root", name: rootName }]);
  };

  // Upload Handlers
  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    setIsUploading(true);
    let successCount = 0;

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      setUploadProgressText(`Mengunggah (${i + 1}/${selectedFiles.length}): ${file.name}`);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("strategy", "LARGEST_AVAILABLE");
      if (selectedAccountId) formData.append("targetAccountId", selectedAccountId);
      if (currentFolderId && currentFolderId !== "root") {
        formData.append("parentFolderId", currentFolderId);
      }
      if (file.webkitRelativePath) {
        formData.append("relativePath", file.webkitRelativePath);
      }

      try {
        const res = await fetch("/api/files/upload", {
          method: "POST",
          body: formData,
        });
        if (res.ok) successCount++;
      } catch (err) {
        console.error("Upload error:", err);
      }
    }

    setIsUploading(false);
    setUploadProgressText("");
    e.target.value = "";
    toast.success(`Berhasil mengunggah ${successCount} item ke cloud pool`);
    fetchItems(1, false);
  };

  // File Download Handler
  const handleDownloadFile = (file: CloudItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      setDownloadingId(file.id);
      toast.info(`Memulai pengunduhan ${file.name}...`);
      const link = document.createElement("a");
      link.href = `/api/files/${file.id}/download`;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      toast.error("Gagal mengunduh file");
    } finally {
      setTimeout(() => setDownloadingId(null), 1500);
    }
  };

  // Drag and Drop Internal Move Handlers
  const handleDragStartItem = (e: React.DragEvent, item: CloudItem) => {
    e.stopPropagation();
    let itemsToDrag: CloudItem[] = [];
    if (!selectedIds.has(item.id)) {
      setSelectedIds(new Set([item.id]));
      itemsToDrag = [item];
    } else {
      itemsToDrag = selectedItems;
    }

    setDraggedItem(item);
    e.dataTransfer.setData("application/skydrive-items", JSON.stringify(itemsToDrag));
    e.dataTransfer.setData("application/skydrive-item", JSON.stringify(item));
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEndItem = () => {
    setDraggedItem(null);
    setDragOverFolderId(null);
  };

  const handleDragOverTargetFolder = (e: React.DragEvent, folderId: string) => {
    if (!draggedItem || draggedItem.id === folderId || selectedIds.has(folderId)) return;
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    if (dragOverFolderId !== folderId) setDragOverFolderId(folderId);
  };

  const handleDragLeaveTargetFolder = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverFolderId(null);
  };

  const handleDropOnTargetFolder = async (
    e: React.DragEvent,
    destinationId: string,
    destinationName: string
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverFolderId(null);

    const rawData =
      e.dataTransfer.getData("application/skydrive-items") ||
      e.dataTransfer.getData("application/skydrive-item");
    if (!rawData) return;

    try {
      let itemsToMove: CloudItem[] = [];
      const parsed = JSON.parse(rawData);
      if (Array.isArray(parsed)) itemsToMove = parsed;
      else itemsToMove = [parsed];

      itemsToMove = itemsToMove.filter(
        (i) => i.id !== destinationId && i.driveFileId !== destinationId
      );
      if (itemsToMove.length === 0) return;

      toast.loading(`Memindahkan ${itemsToMove.length} item ke "${destinationName}"...`, {
        id: "drag-move-toast",
      });

      if (itemsToMove.length === 1) {
        const item = itemsToMove[0];
        const res = await fetch(`/api/files/${item.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ destinationFolderId: destinationId }),
        });

        if (res.ok) {
          toast.success(`Berhasil memindahkan "${item.name}" ke "${destinationName}"`, {
            id: "drag-move-toast",
          });
          setSelectedIds((prev) => {
            const next = new Set(prev);
            next.delete(item.id);
            return next;
          });
          fetchItems(1, false);
        } else {
          toast.error("Gagal memindahkan item di Google Drive", { id: "drag-move-toast" });
        }
      } else {
        const res = await fetch("/api/files/bulk-move", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            itemIds: itemsToMove.map((i) => i.id),
            destinationFolderId: destinationId,
          }),
        });

        const data = await res.json();
        if (res.ok && data.success) {
          toast.success(`Berhasil memindahkan ${data.movedCount} item ke "${destinationName}"`, {
            id: "drag-move-toast",
          });
          setSelectedIds(new Set());
          fetchItems(1, false);
        } else {
          toast.error(data.error || "Gagal memindahkan beberapa item", { id: "drag-move-toast" });
        }
      }
    } catch {
      toast.error("Gagal memproses pemindahan item", { id: "drag-move-toast" });
    } finally {
      setDraggedItem(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 pb-16">
      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Hidden Inputs for File/Folder Upload */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFilesSelected}
        />
        <input
          ref={folderInputRef}
          type="file"
          // @ts-expect-error webkitdirectory is standard for folder upload
          webkitdirectory=""
          directory=""
          multiple
          className="hidden"
          onChange={handleFilesSelected}
        />

        {/* Top Header Controls Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Drive Scope Switcher */}
          <div className="flex items-center gap-1 p-1 bg-muted/60 border border-border rounded-xl">
            <button
              type="button"
              onClick={() => handleSwitchScope("all")}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                scope === "all"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Layers className="size-3.5 text-indigo-500" />
              <span>Semua</span>
            </button>

            {/* Divider */}
            <div className="w-px h-5 bg-border/80 shrink-0" />

            <button
              type="button"
              onClick={() => handleSwitchScope("mydrive")}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                scope === "mydrive"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <HardDrive className="size-3.5 text-primary" />
              <span>Drive Saya</span>
            </button>
            <button
              type="button"
              onClick={() => handleSwitchScope("sharedWithMe")}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                scope === "sharedWithMe"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Users2 className="size-3.5 text-blue-500" />
              <span>Dibagikan ke Saya</span>
            </button>
          </div>

          {/* Action Buttons: New Folder, Upload File, Upload Folder */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsNewFolderOpen(true)}
              className="gap-1.5 text-xs h-9 shadow-xs"
            >
              <FolderPlus className="size-3.5 text-primary" />
              <span>Folder Baru</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => folderInputRef.current?.click()}
              disabled={isUploading}
              className="gap-1.5 text-xs h-9 shadow-xs hidden md:inline-flex"
            >
              <UploadCloud className="size-3.5" />
              <span>Upload Folder</span>
            </Button>

            <Button
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="gap-1.5 text-xs h-9 font-semibold shadow-xs"
            >
              {isUploading ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span className="truncate max-w-[120px]">{uploadProgressText || "Mengunggah…"}</span>
                </>
              ) : (
                <>
                  <UploadCloud className="size-3.5" />
                  <span>Upload File</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Breadcrumb Navigation Bar */}
        <div className="flex items-center gap-1.5 text-xs font-medium bg-card border border-border p-2.5 rounded-xl shadow-xs overflow-x-auto">
          {breadcrumbs.map((b, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <div key={b.id} className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => handleNavigateBreadcrumb(idx)}
                  onDragOver={(e) => {
                    if (!draggedItem) return;
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                  }}
                  onDrop={(e) => handleDropOnTargetFolder(e, b.id, b.name)}
                  className={cn(
                    "flex items-center gap-1.5 px-2 py-1 rounded-lg transition-colors cursor-pointer",
                    isLast
                      ? "bg-accent font-bold text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                  title={draggedItem ? `Pindahkan ke ${b.name}` : undefined}
                >
                  {idx === 0 ? <Home className="size-3.5" /> : <Folder className="size-3.5 text-primary" />}
                  <span>{b.name}</span>
                </button>
                {!isLast && <ChevronRight className="size-3 text-muted-foreground shrink-0" />}
              </div>
            );
          })}
        </div>

        {/* Modular Filter Bar */}
        <FileFilterBar
          query={query}
          onQueryChange={setQuery}
          selectedAccountId={selectedAccountId}
          onAccountIdChange={setSelectedAccountId}
          dateFilter={dateFilter}
          onDateFilterChange={setDateFilter}
          sortFilter={sortFilter}
          onSortFilterChange={setSortFilter}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          accounts={accounts}
        />

        {/* Main Content Explorer */}
        {loading ? (
          <SpotlightCard className="p-16 text-center flex flex-col items-center justify-center space-y-3 shadow-xs border border-border">
            <Loader2 className="size-8 text-primary animate-spin" />
            <p className="text-xs font-mono text-muted-foreground">
              Menghubungkan & menyinkronkan data Google Drive…
            </p>
          </SpotlightCard>
        ) : folders.length === 0 && files.length === 0 ? (
          /* Empty State */
          <SpotlightCard className="p-16 text-center flex flex-col items-center justify-center space-y-4 shadow-xs border border-border">
            <div className="size-14 rounded-2xl bg-muted border border-border flex items-center justify-center text-muted-foreground shadow-xs">
              {scope === "sharedWithMe" ? <Users2 className="size-7" /> : <Folder className="size-7" />}
            </div>
            <div className="space-y-1 max-w-sm">
              <h3 className="text-sm font-bold text-foreground">
                {scope === "sharedWithMe"
                  ? "Tidak Ada File yang Dibagikan"
                  : "Tidak Ada Item di Direktori Ini"}
              </h3>
              <p className="text-xs text-muted-foreground">
                {scope === "sharedWithMe"
                  ? "File atau folder yang dibagikan oleh orang lain ke akun Google Anda akan muncul di sini."
                  : "Unggah file atau buat folder baru untuk mengatur penyimpanan cloud pool Anda."}
              </p>
            </div>
            {scope === "mydrive" && (
              <div className="flex items-center gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsNewFolderOpen(true)}
                  className="gap-1.5 text-xs"
                >
                  <FolderPlus className="size-3.5" />
                  <span>Buat Folder</span>
                </Button>
                <Button
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-1.5 text-xs font-semibold shadow-xs"
                >
                  <UploadCloud className="size-3.5" />
                  <span>Upload File</span>
                </Button>
              </div>
            )}
          </SpotlightCard>
        ) : (
          <div
            ref={explorerContainerRef}
            onMouseDown={handleContainerMouseDown}
            className="space-y-6 select-none min-h-[500px] pb-32"
          >
            {/* 1. Folders Section */}
            {folders.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <Folder className="size-3.5 text-primary" />
                    Folder ({folders.length})
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 items-stretch">
                  {folders.map((folder, idx) => (
                     <FolderCard
                      key={`folder-${folder.id}-${idx}`}
                      folder={folder}
                      index={idx}
                      isSelected={selectedIds.has(folder.id)}
                      isDragOver={dragOverFolderId === folder.id}
                      isBeingDragged={draggedItem?.id === folder.id}
                      onItemClick={(f, i, e) =>
                        handleItemClick(f, i, e, () => handleOpenFolder(f))
                      }
                      onItemDoubleClick={handleOpenFolder}
                      onItemPointerDown={handleItemPointerDown}
                      onOpenFolder={handleOpenFolder}
                      onOpenMove={(f, e) => {
                        e?.stopPropagation();
                        setMoveItems([f]);
                      }}
                      onOpenRename={(f, e) => {
                        e?.stopPropagation();
                        setRenameItem(f);
                      }}
                      onOpenDelete={(f, e) => {
                        e?.stopPropagation();
                        setDeleteItem(f);
                      }}
                      onDragStart={handleDragStartItem}
                      onDragEnd={handleDragEndItem}
                      onDragOver={handleDragOverTargetFolder}
                      onDragLeave={handleDragLeaveTargetFolder}
                      onDrop={handleDropOnTargetFolder}
                      registerRef={registerItemRef}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 2. Files Section */}
            {files.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <File className="size-3.5 text-primary" />
                    File ({files.length})
                  </span>
                </div>

                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 items-stretch">
                    {files.map((file, idx) => (
                      <FileCard
                        key={`grid-${file.id}-${idx}`}
                        file={file}
                        index={folders.length + idx}
                        isSelected={selectedIds.has(file.id)}
                        isBeingDragged={draggedItem?.id === file.id}
                        downloadingId={downloadingId}
                        onItemClick={(f, i, e) =>
                          handleItemClick(f, i, e, () => setPreviewItem(f))
                        }
                        onItemDoubleClick={setPreviewItem}
                        onItemPointerDown={handleItemPointerDown}
                        onPreview={setPreviewItem}
                        onDownload={handleDownloadFile}
                        onOpenMove={(f, e) => {
                          e?.stopPropagation();
                          setMoveItems([f]);
                        }}
                        onOpenRename={(f, e) => {
                          e?.stopPropagation();
                          setRenameItem(f);
                        }}
                        onOpenDelete={(f, e) => {
                          e?.stopPropagation();
                          setDeleteItem(f);
                        }}
                        onDragStart={handleDragStartItem}
                        onDragEnd={handleDragEndItem}
                        registerRef={registerItemRef}
                      />
                    ))}
                  </div>
                ) : (
                  <FilesTableView
                    files={files}
                    foldersOffset={folders.length}
                    selectedIds={selectedIds}
                    draggedItemId={draggedItem?.id || null}
                    downloadingId={downloadingId}
                    onItemClick={(f, i, e) =>
                      handleItemClick(f, i, e, () => setPreviewItem(f))
                    }
                    onItemDoubleClick={setPreviewItem}
                    onItemPointerDown={handleItemPointerDown}
                    onPreview={setPreviewItem}
                    onDownload={handleDownloadFile}
                    onOpenMove={(f, e) => {
                      e?.stopPropagation();
                      setMoveItems([f]);
                    }}
                    onOpenRename={(f, e) => {
                      e?.stopPropagation();
                      setRenameItem(f);
                    }}
                    onOpenDelete={(f, e) => {
                      e?.stopPropagation();
                      setDeleteItem(f);
                    }}
                    onDragStart={handleDragStartItem}
                    onDragEnd={handleDragEndItem}
                    registerRef={registerItemRef}
                  />
                )}

                {/* Google Drive-Style Marquee (Lasso) Selection Box */}
                <MarqueeOverlay isActive={isMarqueeActive} rect={marqueeRect} />

                {/* Lazy Loading Sentinel and Load More indicator */}
                <div ref={loadMoreSentinelRef} className="py-6 flex items-center justify-center">
                  {loadingMore ? (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                      <Loader2 className="size-4 animate-spin text-primary" />
                      <span>Memuat batch file berikutnya…</span>
                    </div>
                  ) : hasMore ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchItems(page + 1, true)}
                      className="text-xs gap-1.5 shadow-xs"
                    >
                      <span>Muat Lebih Banyak File</span>
                    </Button>
                  ) : totalItems > 0 ? (
                    <span className="text-[11px] font-mono text-muted-foreground">
                      ✓ Semua {totalItems} file telah dimuat
                    </span>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Floating Bulk Action Bar */}
        <FloatingBulkBar
          selectedItems={selectedItems}
          totalCurrentItems={allCurrentItems.length}
          onSelectAll={handleSelectAll}
          onOpenBulkMove={() => setMoveItems(selectedItems)}
          onOpenBulkDelete={() => setIsBulkDeleteOpen(true)}
          onClearSelection={handleClearSelection}
        />

        {/* Modals */}
        <MoveModal
          items={moveItems}
          accounts={accounts}
          onClose={() => setMoveItems([])}
          onSuccess={() => {
            fetchItems(1, false);
            handleClearSelection();
          }}
        />

        <BulkDeleteModal
          isOpen={isBulkDeleteOpen}
          items={selectedItems}
          onClose={() => setIsBulkDeleteOpen(false)}
          onSuccess={() => {
            fetchItems(1, false);
            handleClearSelection();
          }}
        />

        <DeleteModal
          item={deleteItem}
          onClose={() => setDeleteItem(null)}
          onSuccess={() => {
            if (deleteItem?.isFolder) {
              setFolders((prev) => prev.filter((f) => f.id !== deleteItem.id));
            } else if (deleteItem) {
              setFiles((prev) => prev.filter((f) => f.id !== deleteItem.id));
            }
            setTotalItems((prev) => Math.max(0, prev - 1));
          }}
        />

        <RenameModal
          item={renameItem}
          onClose={() => setRenameItem(null)}
          onSuccess={(updatedName) => {
            if (renameItem?.isFolder) {
              setFolders((prev) =>
                prev.map((f) => (f.id === renameItem.id ? { ...f, name: updatedName } : f))
              );
            } else if (renameItem) {
              setFiles((prev) =>
                prev.map((f) => (f.id === renameItem.id ? { ...f, name: updatedName } : f))
              );
            }
          }}
        />

        <NewFolderModal
          isOpen={isNewFolderOpen}
          accounts={accounts}
          defaultAccountId={selectedAccountId}
          currentFolderId={currentFolderId}
          onClose={() => setIsNewFolderOpen(false)}
          onSuccess={() => fetchItems(1, false)}
        />

        <PreviewModal
          item={previewItem}
          onClose={() => setPreviewItem(null)}
          onDownload={handleDownloadFile}
        />
      </main>
    </div>
  );
}
