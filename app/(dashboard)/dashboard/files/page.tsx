"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Folder,
  FolderPlus,
  File,
  Search,
  Download,
  Trash2,
  ExternalLink,
  Loader2,
  UploadCloud,
  FileText,
  FileSpreadsheet,
  Presentation,
  Image as ImageIcon,
  Video,
  Music,
  Archive,
  ChevronRight,
  Home,
  LayoutGrid,
  List as ListIcon,
  Users2,
  HardDrive,
  Layers,
  Eye,
  X,
} from "lucide-react";
import { Header } from "@/components/header";
import { formatBytes, cn } from "@/lib/utils";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface CloudItem {
  id: string;
  name: string;
  size: string;
  mimeType: string;
  driveFileId: string;
  parentFolderId?: string | null;
  isFolder: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
  webViewLink?: string;
  thumbnailLink?: string | null;
  iconLink?: string | null;
  account: {
    id: string;
    email: string;
    displayName?: string | null;
  };
}

const TYPE_FILTERS = [
  { id: "all", label: "Semua Tipe", icon: Layers },
  { id: "folders", label: "Folder", icon: Folder },
  { id: "documents", label: "Dokumen", icon: FileText },
  { id: "spreadsheets", label: "Spreadsheet", icon: FileSpreadsheet },
  { id: "presentations", label: "Presentasi", icon: Presentation },
  { id: "photos", label: "Gambar", icon: ImageIcon },
  { id: "videos", label: "Video", icon: Video },
  { id: "pdfs", label: "PDF", icon: FileText },
  { id: "archives", label: "Arsip", icon: Archive },
];

export default function FileExplorerPage() {
  // Scope: "mydrive" (Drive Saya) vs "sharedWithMe" (Dibagikan kepada saya)
  const [scope, setScope] = useState<"mydrive" | "sharedWithMe">("mydrive");

  const [folders, setFolders] = useState<CloudItem[]>([]);
  const [files, setFiles] = useState<CloudItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [sortFilter, setSortFilter] = useState("name_asc");
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [accounts, setAccounts] = useState<
    Array<{ id: string; email: string; availableStorage: string; usagePercentage: number }>
  >([]);

  // Folder navigation history: [{ id: "root", name: "Drive Saya" }]
  const [breadcrumbs, setBreadcrumbs] = useState<Array<{ id: string; name: string }>>([
    { id: "root", name: "Drive Saya" },
  ]);
  const currentFolderId = breadcrumbs[breadcrumbs.length - 1].id;

  // New Folder Modal
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [creatingFolder, setCreatingFolder] = useState(false);

  // Quick Preview Modal
  const [previewItem, setPreviewItem] = useState<CloudItem | null>(null);

  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  // Intersection observer sentinel for lazy loading
  const loadMoreSentinelRef = useRef<HTMLDivElement>(null);

  const fetchItems = useCallback(
    async (pageToFetch = 1, isAppending = false) => {
      try {
        if (isAppending) {
          setLoadingMore(true);
        } else {
          setLoading(true);
        }

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
          const deduplicateById = (items: CloudItem[]) => {
            const seen = new Set<string>();
            return (items || []).filter((item) => {
              if (!item?.id || seen.has(item.id)) return false;
              seen.add(item.id);
              return true;
            });
          };

          if (isAppending) {
            setFolders((prev) => deduplicateById([...prev, ...(data.folders || [])]));
            setFiles((prev) => deduplicateById([...prev, ...(data.files || [])]));
          } else {
            setFolders(deduplicateById(data.folders || []));
            setFiles(deduplicateById(data.files || []));
          }

          setTotalItems(data.total || 0);
          setHasMore(data.hasMore || false);
          setPage(pageToFetch);
          if (data.accounts) setAccounts(data.accounts);
        }
      } catch {
        toast.error("Gagal memuat item dari cloud pool");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [scope, query, selectedAccountId, typeFilter, dateFilter, sortFilter, currentFolderId]
  );

  // Initial fetch / Reset on filter change
  useEffect(() => {
    setPage(1);
    fetchItems(1, false);
  }, [fetchItems]);

  // Lazy loading observer
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

  // Navigate into a folder
  const handleOpenFolder = (folder: CloudItem) => {
    setBreadcrumbs((prev) => [...prev, { id: folder.driveFileId, name: folder.name }]);
  };

  // Navigate via breadcrumbs
  const handleNavigateBreadcrumb = (index: number) => {
    setBreadcrumbs((prev) => prev.slice(0, index + 1));
  };

  // Switch Scope (Drive Saya vs Dibagikan kepada Saya)
  const handleSwitchScope = (newScope: "mydrive" | "sharedWithMe") => {
    if (scope === newScope) return;
    setScope(newScope);
    setBreadcrumbs([{ id: "root", name: newScope === "mydrive" ? "Drive Saya" : "Dibagikan kepada saya" }]);
  };

  // Create new folder
  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    setCreatingFolder(true);
    try {
      const res = await fetch("/api/folders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newFolderName.trim(),
          accountId: selectedAccountId || undefined,
          parentFolderId: currentFolderId !== "root" ? currentFolderId : undefined,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(`Folder "${newFolderName}" berhasil dibuat`);
        setNewFolderName("");
        setIsNewFolderOpen(false);
        fetchItems(1, false);
      } else {
        toast.error(data.error || "Gagal membuat folder");
      }
    } catch {
      toast.error("Terjadi kesalahan saat membuat folder");
    } finally {
      setCreatingFolder(false);
    }
  };

  // Handle batch file / folder upload
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

  const handleDelete = async (item: CloudItem) => {
    if (!confirm(`Hapus "${item.name}"? Ini akan memindahkan item ke sampah Google Drive.`)) return;

    try {
      const res = await fetch(`/api/files/${item.id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(`Berhasil menghapus ${item.name}`);
        if (item.isFolder) {
          setFolders((prev) => prev.filter((f) => f.id !== item.id));
        } else {
          setFiles((prev) => prev.filter((f) => f.id !== item.id));
        }
        setTotalItems((prev) => Math.max(0, prev - 1));
      } else {
        toast.error("Gagal menghapus item dari Google Drive");
      }
    } catch {
      toast.error("Kesalahan jaringan saat menghapus");
    }
  };

  const getFileIconComponent = (mimeType: string) => {
    if (mimeType === "application/vnd.google-apps.folder") return Folder;
    if (mimeType.startsWith("image/")) return ImageIcon;
    if (mimeType.startsWith("video/")) return Video;
    if (mimeType.startsWith("audio/")) return Music;
    if (mimeType.includes("pdf")) return FileText;
    if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) return FileSpreadsheet;
    if (mimeType.includes("presentation") || mimeType.includes("powerpoint")) return Presentation;
    if (mimeType.includes("zip") || mimeType.includes("tar") || mimeType.includes("archive")) return Archive;
    return File;
  };

  const currentItemCount = folders.length + files.length;

  return (
    <div className="flex-1 flex flex-col min-w-0 pb-16">
      <Header accounts={accounts} onRefresh={() => fetchItems(1, false)} />

      <main className="px-8 py-7 max-w-6xl w-full mx-auto space-y-6 animate-fade-in">
        {/* Top Action & Navigation Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Unified File & Folder Explorer
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Jelajahi, cari, dan kelola seluruh file serta folder dari seluruh akun Google Drive Anda dengan live thumbnail.
            </p>
          </div>

          {/* Quick Action Upload Buttons */}
          <div className="flex items-center gap-2">
            {/* Hidden Input for Files */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFilesSelected}
              multiple
              className="hidden"
            />
            {/* Hidden Input for Folders */}
            <input
              type="file"
              ref={folderInputRef}
              onChange={handleFilesSelected}
              {...({ webkitdirectory: "", directory: "" } as any)}
              multiple
              className="hidden"
            />

            {/* New Folder Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsNewFolderOpen(true)}
              className="gap-1.5 text-xs shadow-sm"
            >
              <FolderPlus className="size-3.5 text-primary" />
              <span>New Folder</span>
            </Button>

            {/* Upload Folder Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => folderInputRef.current?.click()}
              disabled={isUploading}
              className="gap-1.5 text-xs shadow-sm"
            >
              <Folder className="size-3.5 text-amber-500" />
              <span>Upload Folder</span>
            </Button>

            {/* Upload Files Button */}
            <Button
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="gap-1.5 text-xs font-semibold shadow-sm"
            >
              <UploadCloud className="size-3.5" />
              <span>Upload Files</span>
            </Button>
          </div>
        </div>

        {/* Upload in Progress Alert Banner */}
        {isUploading && (
          <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between text-xs text-primary animate-pulse">
            <div className="flex items-center gap-2">
              <Loader2 className="size-4 animate-spin" />
              <span className="font-semibold">{uploadProgressText || "Mengunggah ke pool Google Drive…"}</span>
            </div>
            <span className="text-[11px] font-mono">Routing pintar ke storage dengan sisa ruang terbesar</span>
          </div>
        )}

        {/* Scope Tabs: Drive Saya vs Dibagikan kepada Saya */}
        <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
          <div className="flex items-center gap-2 bg-muted/60 p-1 rounded-xl border border-border">
            <button
              type="button"
              onClick={() => handleSwitchScope("mydrive")}
              className={cn(
                "flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
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
                "flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                scope === "sharedWithMe"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Users2 className="size-3.5 text-blue-500" />
              <span>Dibagikan kepada saya</span>
            </button>
          </div>

          {/* Item Counter Badge */}
          <div className="text-[11px] font-mono text-muted-foreground flex items-center gap-1.5">
            <span>Menampilkan</span>
            <Badge variant="outline" className="text-[11px] font-mono px-2 py-0.5">
              {currentItemCount} dari {totalItems} item
            </Badge>
          </div>
        </div>

        {/* Breadcrumb Navigation Bar */}
        <div className="flex items-center gap-1.5 text-xs font-medium bg-card border border-border p-2.5 rounded-xl shadow-sm overflow-x-auto">
          {breadcrumbs.map((b, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <div key={b.id} className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => handleNavigateBreadcrumb(idx)}
                  className={cn(
                    "flex items-center gap-1.5 px-2 py-1 rounded-lg transition-colors cursor-pointer",
                    isLast
                      ? "bg-accent font-bold text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  {idx === 0 ? <Home className="size-3.5" /> : <Folder className="size-3.5 text-primary" />}
                  <span>{b.name}</span>
                </button>
                {!isLast && <ChevronRight className="size-3 text-muted-foreground shrink-0" />}
              </div>
            );
          })}
        </div>

        {/* Google Drive-Style Filter Bar */}
        <div className="space-y-3">
          {/* Top Control Strip */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Cari di seluruh file & folder..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-8 text-xs h-9"
              />
            </div>

            {/* Dropdown Filters (Account, Date, Sort, View Toggle) */}
            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
              {/* Account Pool Dropdown */}
              <select
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className="h-9 rounded-xl border border-input bg-card px-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
              >
                <option value="">Semua Storage Pool</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.email}
                  </option>
                ))}
              </select>

              {/* Modified Date Filter */}
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="h-9 rounded-xl border border-input bg-card px-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
              >
                <option value="all">Kapan saja</option>
                <option value="today">Hari ini</option>
                <option value="week">7 hari terakhir</option>
                <option value="month">30 hari terakhir</option>
                <option value="year">Tahun ini</option>
              </select>

              {/* Sort By Dropdown */}
              <select
                value={sortFilter}
                onChange={(e) => setSortFilter(e.target.value)}
                className="h-9 rounded-xl border border-input bg-card px-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
              >
                <option value="name_asc">Nama (A ke Z)</option>
                <option value="name_desc">Nama (Z ke A)</option>
                <option value="date_desc">Terakhir diubah (terbaru)</option>
                <option value="date_asc">Terakhir diubah (terlama)</option>
                <option value="size_desc">Ukuran (terbesar)</option>
                <option value="size_asc">Ukuran (terkecil)</option>
              </select>

              {/* View Toggle */}
              <div className="border border-border rounded-xl p-0.5 bg-card flex items-center shrink-0">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "p-1.5 rounded-lg transition-colors cursor-pointer",
                    viewMode === "grid" ? "bg-accent text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                  title="Grid View"
                >
                  <LayoutGrid className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "p-1.5 rounded-lg transition-colors cursor-pointer",
                    viewMode === "list" ? "bg-accent text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                  title="List View"
                >
                  <ListIcon className="size-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Type Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {TYPE_FILTERS.map((tf) => {
              const Icon = tf.icon;
              const isSelected = typeFilter === tf.id;
              return (
                <button
                  key={tf.id}
                  type="button"
                  onClick={() => setTypeFilter(tf.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border",
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-card text-muted-foreground border-border hover:text-foreground hover:bg-accent"
                  )}
                >
                  <Icon className="size-3.5" />
                  <span>{tf.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Stream: Folders & Files */}
        {loading ? (
          <div className="py-24 text-center flex flex-col items-center justify-center space-y-3">
            <Loader2 className="size-6 text-primary animate-spin" />
            <span className="text-xs text-muted-foreground">Memuat file & folder dari cloud pool...</span>
          </div>
        ) : folders.length === 0 && files.length === 0 ? (
          /* Empty State */
          <Card className="p-16 text-center flex flex-col items-center justify-center space-y-4 shadow-sm border-border">
            <div className="size-14 rounded-2xl bg-muted border border-border flex items-center justify-center text-muted-foreground shadow-sm">
              {scope === "sharedWithMe" ? <Users2 className="size-7" /> : <Folder className="size-7" />}
            </div>
            <div className="space-y-1 max-w-sm">
              <h3 className="text-sm font-bold text-foreground">
                {scope === "sharedWithMe" ? "Tidak Ada File yang Dibagikan" : "Tidak Ada Item di Direktori Ini"}
              </h3>
              <p className="text-xs text-muted-foreground">
                {scope === "sharedWithMe"
                  ? "File atau folder yang dibagikan oleh orang lain ke akun Google Anda akan muncul di sini."
                  : "Unggah file, buat folder baru, atau upload satu folder utuh untuk mengatur penyimpanan Anda."}
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
                  className="gap-1.5 text-xs font-semibold shadow-sm"
                >
                  <UploadCloud className="size-3.5" />
                  <span>Upload File</span>
                </Button>
              </div>
            )}
          </Card>
        ) : (
          <div className="space-y-6">
            {/* 1. Folders Section */}
            {folders.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <Folder className="size-3.5 text-primary" />
                    Folder ({folders.length})
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {folders.map((folder, idx) => (
                    <Card
                      key={`folder-${folder.id}-${idx}`}
                      onClick={() => handleOpenFolder(folder)}
                      className="p-3.5 flex items-center justify-between gap-3 border-border hover:border-primary/40 hover:bg-accent/40 transition-all cursor-pointer group card-hover"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="size-8 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          <Folder className="size-4" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                            {folder.name}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono truncate">
                            {folder.account.email}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(folder)}
                          className="size-6 text-muted-foreground hover:text-destructive"
                          title="Hapus folder"
                        >
                          <Trash2 className="size-3" />
                        </Button>
                      </div>
                    </Card>
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
                  /* Grid View with Rich Live Thumbnails */
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {files.map((file, idx) => {
                      const Icon = getFileIconComponent(file.mimeType);
                      return (
                        <Card
                          key={`grid-${file.id}-${idx}`}
                          className="flex flex-col justify-between border-border card-hover group overflow-hidden shadow-sm hover:shadow-md transition-all"
                        >
                          {/* Live Thumbnail / Visual Preview Banner */}
                          <div
                            onClick={() => setPreviewItem(file)}
                            className="relative w-full h-36 bg-muted/50 border-b border-border flex items-center justify-center overflow-hidden cursor-pointer group/thumb"
                          >
                            {file.thumbnailLink ? (
                              <img
                                src={file.thumbnailLink}
                                alt={file.name}
                                referrerPolicy="no-referrer"
                                loading="lazy"
                                className="w-full h-full object-cover object-top transition-transform duration-300 group-hover/thumb:scale-105"
                                onError={(e) => {
                                  // Fallback to icon on image error
                                  (e.target as HTMLElement).style.display = "none";
                                }}
                              />
                            ) : (
                              <div className="flex flex-col items-center justify-center space-y-1.5 text-muted-foreground">
                                <Icon className="size-8 text-muted-foreground/70 group-hover/thumb:scale-110 group-hover/thumb:text-primary transition-all" />
                                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60">
                                  {file.mimeType.split("/")[1]?.split(".")[0] || "File"}
                                </span>
                              </div>
                            )}

                            {/* Hover Quick Preview Eye Overlay */}
                            <div className="absolute inset-0 bg-background/40 backdrop-blur-[2px] opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <span className="p-2 rounded-xl bg-background/80 text-foreground shadow-sm flex items-center gap-1.5 text-xs font-semibold">
                                <Eye className="size-3.5 text-primary" />
                                <span>Preview</span>
                              </span>
                            </div>

                            {/* Storage Account Badge */}
                            <div className="absolute top-2 right-2">
                              <Badge variant="info" className="text-[9px] font-mono bg-background/80 backdrop-blur-md shadow-sm border border-border">
                                {file.account.email.split("@")[0]}
                              </Badge>
                            </div>
                          </div>

                          {/* File Details & Metadata */}
                          <div className="p-3.5 space-y-2.5">
                            <div className="space-y-1 min-w-0">
                              <h4
                                className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors cursor-pointer"
                                title={file.name}
                                onClick={() => setPreviewItem(file)}
                              >
                                {file.name}
                              </h4>
                              <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                                <span>{formatBytes(Number(file.size))}</span>
                                <span>{new Date(file.updatedAt).toLocaleDateString()}</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-border">
                              <Button
                                asChild
                                variant="ghost"
                                size="sm"
                                className="text-[11px] h-7 px-2 gap-1 text-primary hover:text-primary"
                              >
                                <a
                                  href={file.webViewLink || `https://drive.google.com/file/d/${file.driveFileId}/view`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <ExternalLink className="size-3" />
                                  <span>Buka Drive</span>
                                </a>
                              </Button>

                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(file)}
                                className="size-7 text-muted-foreground hover:text-destructive"
                                title="Hapus file"
                              >
                                <Trash2 className="size-3" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  /* List View / Table with Mini Thumbnails */
                  <Card className="border-border overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-border bg-muted/40 text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                            <th className="py-3 px-4 font-semibold">Nama File</th>
                            <th className="py-3 px-4 font-semibold">Storage Pool</th>
                            <th className="py-3 px-4 font-semibold">Ukuran</th>
                            <th className="py-3 px-4 font-semibold">Dimodifikasi</th>
                            <th className="py-3 px-4 font-semibold text-right">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {files.map((file, idx) => {
                            const Icon = getFileIconComponent(file.mimeType);
                            return (
                              <tr key={`list-${file.id}-${idx}`} className="hover:bg-accent/40 transition-colors">
                                <td className="py-3 px-4">
                                  <div
                                    className="flex items-center gap-3 max-w-md cursor-pointer"
                                    onClick={() => setPreviewItem(file)}
                                  >
                                    <div className="size-9 rounded-lg bg-muted border border-border flex items-center justify-center text-muted-foreground shrink-0 overflow-hidden">
                                      {file.thumbnailLink ? (
                                        <img
                                          src={file.thumbnailLink}
                                          alt={file.name}
                                          referrerPolicy="no-referrer"
                                          className="size-full object-cover object-top"
                                        />
                                      ) : (
                                        <Icon className="size-4" />
                                      )}
                                    </div>
                                    <span className="font-medium text-foreground truncate hover:text-primary transition-colors">
                                      {file.name}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <Badge variant="info" className="text-[10px] font-mono">
                                    {file.account.email}
                                  </Badge>
                                </td>
                                <td className="py-3 px-4 font-mono text-[11px] text-muted-foreground">
                                  {formatBytes(Number(file.size))}
                                </td>
                                <td className="py-3 px-4 text-muted-foreground text-[11px]">
                                  {new Date(file.updatedAt).toLocaleDateString()}
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <Button asChild variant="ghost" size="icon" className="size-7" title="Buka di Google Drive">
                                      <a
                                        href={file.webViewLink || `https://drive.google.com/file/d/${file.driveFileId}/view`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        <ExternalLink className="size-3.5" />
                                      </a>
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleDelete(file)}
                                      className="size-7 text-muted-foreground hover:text-destructive"
                                      title="Hapus file"
                                    >
                                      <Trash2 className="size-3.5" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                )}

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
                      className="text-xs gap-1.5 shadow-sm"
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

        {/* Quick Preview Lightbox Modal */}
        <Dialog open={!!previewItem} onOpenChange={(open) => !open && setPreviewItem(null)}>
          <DialogContent className="max-w-2xl border-border bg-card p-6">
            {previewItem && (
              <div className="space-y-4">
                <DialogHeader>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1 max-w-md">
                      <DialogTitle className="text-sm font-bold text-foreground truncate">
                        {previewItem.name}
                      </DialogTitle>
                      <DialogDescription className="text-[11px] text-muted-foreground font-mono">
                        {formatBytes(Number(previewItem.size))} • {previewItem.account.email}
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>

                {/* Preview Image / Viewer Container */}
                <div className="w-full h-80 rounded-2xl bg-muted/60 border border-border flex items-center justify-center overflow-hidden p-2">
                  {previewItem.thumbnailLink ? (
                    <img
                      src={previewItem.thumbnailLink.replace(/=s\d+/, "=s1200")}
                      alt={previewItem.name}
                      referrerPolicy="no-referrer"
                      className="max-h-full max-w-full object-contain rounded-xl shadow-sm"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center space-y-2 text-muted-foreground">
                      {(() => {
                        const Icon = getFileIconComponent(previewItem.mimeType);
                        return <Icon className="size-16 text-primary/70" />;
                      })()}
                      <span className="text-xs font-mono">{previewItem.mimeType}</span>
                    </div>
                  )}
                </div>

                {/* Action footer */}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="text-[11px] text-muted-foreground">
                    Dimodifikasi: {new Date(previewItem.updatedAt).toLocaleString()}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPreviewItem(null)}
                      className="text-xs"
                    >
                      Tutup
                    </Button>
                    <Button
                      asChild
                      size="sm"
                      className="gap-1.5 text-xs font-semibold shadow-sm"
                    >
                      <a
                        href={previewItem.webViewLink || `https://drive.google.com/file/d/${previewItem.driveFileId}/view`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="size-3.5" />
                        <span>Buka di Google Drive</span>
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Modal Create New Folder */}
        <Dialog open={isNewFolderOpen} onOpenChange={setIsNewFolderOpen}>
          <DialogContent className="max-w-md border-border bg-card p-6">
            <DialogHeader>
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
                  <FolderPlus className="size-4" />
                </div>
                <div>
                  <DialogTitle className="text-sm font-bold text-foreground">Buat Folder Baru</DialogTitle>
                  <DialogDescription className="text-[11px] text-muted-foreground mt-0.5">
                    Buat direktori baru di dalam pool Google Drive Anda
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <form onSubmit={handleCreateFolder} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Nama Folder</label>
                <Input
                  type="text"
                  placeholder="Contoh: Dokumen Pekerjaan"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  required
                  autoFocus
                  className="text-xs"
                />
              </div>

              {accounts.length > 1 && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Target Storage Pool</label>
                  <select
                    value={selectedAccountId}
                    onChange={(e) => setSelectedAccountId(e.target.value)}
                    className="w-full h-9 rounded-xl border border-input bg-card px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Auto-Route (Akun dengan sisa ruang terbanyak)</option>
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
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
                  onClick={() => setIsNewFolderOpen(false)}
                  disabled={creatingFolder}
                  className="text-xs"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={!newFolderName.trim() || creatingFolder}
                  className="gap-1.5 text-xs font-semibold shadow-sm"
                >
                  {creatingFolder ? (
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
      </main>
    </div>
  );
}
