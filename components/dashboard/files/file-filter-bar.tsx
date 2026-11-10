"use client";

import React from "react";
import {
  Search,
  LayoutGrid,
  List as ListIcon,
  Layers,
  Folder,
  FileText,
  FileSpreadsheet,
  Presentation,
  Image as ImageIcon,
  Video,
  Archive,
  User,
  Cloud,
  Check,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { StorageAccountSummary, TypeFilterItem } from "./types";

export const TYPE_FILTERS: TypeFilterItem[] = [
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

interface FileFilterBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  selectedAccountId: string;
  onAccountIdChange: (accountId: string) => void;
  dateFilter: string;
  onDateFilterChange: (dateFilter: string) => void;
  sortFilter: string;
  onSortFilterChange: (sortFilter: string) => void;
  typeFilter: string;
  onTypeFilterChange: (typeFilter: string) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (viewMode: "grid" | "list") => void;
  accounts: StorageAccountSummary[];
}

export function FileFilterBar({
  query,
  onQueryChange,
  selectedAccountId,
  onAccountIdChange,
  dateFilter,
  onDateFilterChange,
  sortFilter,
  onSortFilterChange,
  typeFilter,
  onTypeFilterChange,
  viewMode,
  onViewModeChange,
  accounts,
}: FileFilterBarProps) {
  const selectedAccount = accounts.find((a) => a.id === selectedAccountId);

  return (
    <div className="space-y-3">
      {/* Account Source Switcher Pills */}
      {accounts.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-0.5">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider shrink-0 mr-1 hidden sm:inline">
            Sumber Akun:
          </span>

          {/* All Accounts Button */}
          <button
            type="button"
            onClick={() => onAccountIdChange("")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 cursor-pointer border",
              !selectedAccountId
                ? "bg-primary text-primary-foreground border-primary shadow-xs font-semibold"
                : "bg-card border-border text-muted-foreground hover:text-foreground hover:bg-secondary/60"
            )}
          >
            <Layers className="size-3.5" />
            <span>Semua Akun ({accounts.length})</span>
          </button>

          {/* Individual Account Buttons */}
          {accounts.map((acc) => {
            const isSelected = selectedAccountId === acc.id;
            return (
              <button
                key={acc.id}
                type="button"
                onClick={() => onAccountIdChange(acc.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 cursor-pointer border group",
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary shadow-xs font-semibold"
                    : "bg-card border-border text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                )}
                title={acc.email}
              >
                {acc.isLoginAccount ? (
                  <User className={cn("size-3.5", isSelected ? "text-primary-foreground" : "text-sky-500")} />
                ) : (
                  <Cloud className={cn("size-3.5", isSelected ? "text-primary-foreground" : "text-emerald-500")} />
                )}
                <span className="max-w-[130px] truncate">{acc.email.split("@")[0]}</span>
                {acc.isLoginAccount ? (
                  <span
                    className={cn(
                      "text-[9px] px-1.5 py-0.2 rounded-md font-mono uppercase font-bold",
                      isSelected
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30"
                    )}
                  >
                    Login
                  </span>
                ) : (
                  <span
                    className={cn(
                      "text-[9px] px-1.5 py-0.2 rounded-md font-mono uppercase font-bold",
                      isSelected
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                    )}
                  >
                    Drive
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Top Controls: Search, Select Filters, View Mode Toggle */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Cari di seluruh file & folder..."
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            className="pl-8 text-xs h-9"
          />
        </div>

        {/* Dropdown Filters (Account, Date, Sort, View Toggle) */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {/* Account Pool Dropdown */}
          <select
            value={selectedAccountId}
            onChange={(e) => onAccountIdChange(e.target.value)}
            className="h-9 rounded-xl border border-input bg-card px-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer max-w-[180px] sm:max-w-[220px] truncate"
          >
            <option value="">Semua Akun ({accounts.length})</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.isLoginAccount ? "👤 Login: " : "☁️ Drive: "}
                {acc.email}
              </option>
            ))}
          </select>

          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => onDateFilterChange(e.target.value)}
            className="h-9 rounded-xl border border-input bg-card px-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
          >
            <option value="all">Kapan saja</option>
            <option value="today">Hari ini</option>
            <option value="week">7 hari terakhir</option>
            <option value="month">30 hari terakhir</option>
            <option value="year">Tahun ini</option>
          </select>

          {/* Sort Filter */}
          <select
            value={sortFilter}
            onChange={(e) => onSortFilterChange(e.target.value)}
            className="h-9 rounded-xl border border-input bg-card px-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
          >
            <option value="name_asc">Nama (A ke Z)</option>
            <option value="name_desc">Nama (Z ke A)</option>
            <option value="date_desc">Terakhir diubah (terbaru)</option>
            <option value="date_asc">Terakhir diubah (terlama)</option>
            <option value="size_desc">Ukuran (terbesar)</option>
            <option value="size_asc">Ukuran (terkecil)</option>
          </select>

          {/* View Mode Toggle */}
          <div className="border border-border rounded-xl p-0.5 bg-card flex items-center shrink-0">
            <button
              type="button"
              onClick={() => onViewModeChange("grid")}
              className={cn(
                "p-1.5 rounded-lg transition-colors cursor-pointer",
                viewMode === "grid"
                  ? "bg-accent text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Grid View"
            >
              <LayoutGrid className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange("list")}
              className={cn(
                "p-1.5 rounded-lg transition-colors cursor-pointer",
                viewMode === "list"
                  ? "bg-accent text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="List View"
            >
              <ListIcon className="size-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Type Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {TYPE_FILTERS.map((tf) => {
          const Icon = tf.icon;
          const isActive = typeFilter === tf.id;
          return (
            <button
              key={tf.id}
              type="button"
              onClick={() => onTypeFilterChange(tf.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 cursor-pointer border",
                isActive
                  ? "bg-primary/10 text-primary border-primary/40 shadow-xs font-semibold"
                  : "bg-card border-border text-muted-foreground hover:text-foreground hover:bg-secondary/60"
              )}
            >
              <Icon className={cn("size-3.5", isActive ? "text-primary" : "text-muted-foreground")} />
              <span>{tf.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Account Filter Chip / Reset Banner */}
      {selectedAccount && (
        <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/25 text-xs text-primary">
          <div className="flex items-center gap-2">
            {selectedAccount.isLoginAccount ? <User className="size-3.5" /> : <Cloud className="size-3.5" />}
            <span>
              Menampilkan file dari:{" "}
              <strong className="text-foreground">{selectedAccount.email}</strong>{" "}
              ({selectedAccount.isLoginAccount ? "Akun Login Utama" : "Akun Tambahan"})
            </span>
          </div>
          <button
            type="button"
            onClick={() => onAccountIdChange("")}
            className="flex items-center gap-1 text-[11px] font-semibold hover:underline cursor-pointer"
          >
            <span>Tampilkan Semua Akun</span>
            <X className="size-3" />
          </button>
        </div>
      )}
    </div>
  );
}
