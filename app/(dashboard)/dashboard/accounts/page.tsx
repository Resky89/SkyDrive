"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Plus,
  RefreshCw,
  Trash2,
  AlertTriangle,
  ShieldCheck,
  Loader2,
  Layers,
  Sparkles,
} from "lucide-react";
import { formatBytes, cn, getInitials } from "@/lib/utils";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useLanguage } from "@/lib/i18n";

interface StorageAccount {
  id: string;
  email: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  totalStorage: string;
  usedStorage: string;
  availableStorage: string;
  usagePercentage: number;
  isActive: boolean;
  lastSyncedAt?: string | null;
  createdAt: string;
}

export default function ConnectedAccountsPage() {
  const { t } = useLanguage();
  const [accounts, setAccounts] = useState<StorageAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [disconnectingId, setDisconnectingId] = useState<string | null>(null);

  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/storage/analytics");
      if (res.ok) {
        const data = await res.json();
        setAccounts(data.accounts || []);
      }
    } catch {
      toast.error("Failed to load connected storage accounts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  useEffect(() => {
    const handleRefresh = () => fetchAccounts();
    window.addEventListener("skydrive:refresh", handleRefresh);
    return () => window.removeEventListener("skydrive:refresh", handleRefresh);
  }, [fetchAccounts]);

  // Handle URL redirect query params from OAuth callback
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const success = params.get("success");
      const error = params.get("error");
      if (success === "connected") {
        toast.success("Akun Google Drive berhasil terhubung!");
        fetchAccounts();
        window.dispatchEvent(new CustomEvent("skydrive:refresh"));
        window.history.replaceState({}, "", window.location.pathname);
      } else if (error) {
        toast.error(
          error === "oauth_denied"
            ? "Izin akses Google Drive ditolak."
            : "Gagal menghubungkan akun Google Drive."
        );
        window.history.replaceState({}, "", window.location.pathname);
      }
    }
  }, [fetchAccounts]);

  const handleSyncAccount = async (id: string) => {
    setSyncingId(id);
    try {
      const res = await fetch("/api/google/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId: id }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.success && (data.count > 0 || !data.error)) {
        toast.success("Akun berhasil disinkronkan!");
        await fetchAccounts();
        window.dispatchEvent(new CustomEvent("skydrive:refresh"));
      } else {
        const errorMsg =
          data?.error || "Gagal sinkronisasi akun. Silakan coba lagi.";
        toast.error(errorMsg);
        await fetchAccounts();
        window.dispatchEvent(new CustomEvent("skydrive:refresh"));
      }
    } catch {
      toast.error("Network error syncing account");
    } finally {
      setSyncingId(null);
    }
  };

  const handleDisconnect = async (id: string, email: string) => {
    if (
      !confirm(
        `Are you sure you want to disconnect ${email}? Your files on Google Drive will NOT be deleted.`
      )
    ) {
      return;
    }

    setDisconnectingId(id);
    try {
      const res = await fetch("/api/google/disconnect", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId: id }),
      });
      if (res.ok) {
        toast.success(`Disconnected ${email}`);
        await fetchAccounts();
        window.dispatchEvent(new CustomEvent("skydrive:refresh"));
      } else {
        toast.error("Failed to disconnect account");
      }
    } catch {
      toast.error("Network error disconnecting account");
    } finally {
      setDisconnectingId(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 pb-16">
      <main className="px-3.5 sm:px-6 lg:px-8 py-5 sm:py-7 max-w-6xl w-full mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-mono text-primary font-semibold">
                <Sparkles className="size-3" />
                {t.accountsTag}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
              {t.accountsTitle}
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              {t.accountsSubtitle}
            </p>
          </div>

          <Button asChild size="sm" className="gap-1.5 shadow-md font-semibold w-full sm:w-auto">
            <Link href="/api/google/connect">
              <Plus className="size-3.5" />
              <span>{t.accountsConnectBtn}</span>
            </Link>
          </Button>
        </div>

        {/* Security & Token Banner Card */}
        <SpotlightCard className="p-4 flex items-center justify-between shadow-md border-border/80 relative">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 flex items-center justify-center shrink-0 shadow-inner">
              <ShieldCheck className="size-4.5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground">
                {t.accountsAesTitle}
              </h4>
              <p className="text-[11px] text-muted-foreground mt-0.5 font-mono">
                {t.accountsAesDesc}
              </p>
            </div>
          </div>
          <Badge variant="success" className="shrink-0 text-[10px] font-mono">
            {t.accountsEncrypted}
          </Badge>
        </SpotlightCard>

        {/* Accounts List / Empty State */}
        {loading ? (
          <div className="py-24 text-center flex flex-col items-center justify-center space-y-3">
            <Loader2 className="size-5 text-primary animate-spin" />
            <span className="text-xs text-muted-foreground font-mono">{t.accountsLoading}</span>
          </div>
        ) : accounts.length === 0 ? (
          <SpotlightCard className="p-10 text-center flex flex-col items-center justify-center space-y-6 shadow-xl">
            <div className="size-16 rounded-3xl bg-primary/10 text-primary border border-primary/30 flex items-center justify-center shadow-lg shadow-primary/15">
              <Layers className="size-8" />
            </div>

            <div className="max-w-md space-y-1.5">
              <h3 className="text-lg font-bold text-foreground">
                {t.accountsEmptyTitle}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t.accountsEmptyDesc}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-lg text-left pt-2">
              <div className="p-3.5 rounded-2xl border border-border/80 bg-secondary/40 text-xs space-y-1">
                <span className="font-semibold text-foreground block">{t.accountsStep1Title}</span>
                <span className="text-[10px] text-muted-foreground block font-mono">{t.accountsStep1Desc}</span>
              </div>
              <div className="p-3.5 rounded-2xl border border-border/80 bg-secondary/40 text-xs space-y-1">
                <span className="font-semibold text-foreground block">{t.accountsStep2Title}</span>
                <span className="text-[10px] text-muted-foreground block font-mono">{t.accountsStep2Desc}</span>
              </div>
              <div className="p-3.5 rounded-2xl border border-border/80 bg-secondary/40 text-xs space-y-1">
                <span className="font-semibold text-foreground block">{t.accountsStep3Title}</span>
                <span className="text-[10px] text-muted-foreground block font-mono">{t.accountsStep3Desc}</span>
              </div>
            </div>

            <Button asChild size="default" className="gap-2 shadow-md font-semibold">
              <Link href="/api/google/connect">
                <Plus className="size-4" />
                <span>{t.accountsConnectBtn}</span>
              </Link>
            </Button>
          </SpotlightCard>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
            {accounts.map((acc) => {
              const used = Number(acc.usedStorage);
              const total = Number(acc.totalStorage);
              const available = Number(acc.availableStorage);
              const pct = total > 0 ? (used / total) * 100 : Number(acc.usagePercentage || 0);
              const isWarning = pct >= 90;

              return (
                <SpotlightCard
                  key={acc.id}
                  className="p-5 flex flex-col justify-between h-full space-y-4 relative overflow-hidden border border-border/80 shadow-md group"
                >
                  {isWarning && (
                    <div className="absolute top-0 right-0 left-0 h-1 bg-destructive" />
                  )}

                  {/* Header Row */}
                  <div className="flex items-start justify-between gap-3 relative z-10">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="size-10 rounded-2xl border border-primary/25 shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                        {acc.avatarUrl && (
                          <AvatarImage
                            src={acc.avatarUrl}
                            alt={acc.displayName || acc.email}
                            referrerPolicy="no-referrer"
                            className="object-cover rounded-2xl"
                          />
                        )}
                        <AvatarFallback className="rounded-2xl bg-primary/15 text-primary font-bold text-xs">
                          {acc.displayName ? getInitials(acc.displayName) : acc.email[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-foreground truncate">
                          {acc.displayName || acc.email.split("@")[0]}
                        </span>
                        <span className="text-[11px] text-muted-foreground truncate font-mono">
                          {acc.email}
                        </span>
                      </div>
                    </div>

                    <Badge
                      variant={
                        total === 0
                          ? "secondary"
                          : isWarning
                          ? "destructive"
                          : pct >= 70
                          ? "warning"
                          : "info"
                      }
                      className="text-[10px] font-mono font-semibold"
                    >
                      {total === 0
                        ? "UNSYNCED"
                        : pct > 0
                        ? `${pct < 1 ? pct.toFixed(2) : pct.toFixed(1)}% USED`
                        : "0% USED"}
                    </Badge>
                  </div>

                  {/* Storage Progress */}
                  <div className="space-y-1.5 relative z-10">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-muted-foreground text-[11px]">
                        {formatBytes(used)} / {formatBytes(total)}
                      </span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-[11px]">
                        {formatBytes(available)} {t.accountsFree}
                      </span>
                    </div>

                    <Progress
                      value={used > 0 ? Math.max(pct, 8) : 0}
                      className="h-2.5 bg-secondary border border-border/80 rounded-full"
                      indicatorColor={
                        isWarning
                          ? "bg-destructive"
                          : pct >= 70
                          ? "bg-amber-500"
                          : "bg-gradient-to-r from-sky-500 to-blue-600 shadow-sm"
                      }
                    />
                  </div>

                  {/* Warning Callout */}
                  {isWarning && (
                    <div className="p-2.5 rounded-xl bg-destructive/10 border border-destructive/25 flex items-center gap-2 text-xs text-destructive">
                      <AlertTriangle className="size-3.5 shrink-0" />
                      <span>{t.accountsWarning}</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-border/70 text-xs relative z-10 mt-auto">
                    <span className="text-[10px] font-mono text-muted-foreground">
                      Google Drive API v3
                    </span>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSyncAccount(acc.id)}
                        disabled={syncingId === acc.id}
                        className="gap-1.5 text-xs h-7.5 px-3 rounded-xl border border-border/80 bg-secondary/50 hover:bg-secondary text-foreground"
                      >
                        <RefreshCw
                          className={cn(
                            "size-3",
                            syncingId === acc.id && "animate-spin text-primary"
                          )}
                        />
                        <span>{t.accountsSync}</span>
                      </Button>

                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDisconnect(acc.id, acc.email)}
                        disabled={disconnectingId === acc.id}
                        className="gap-1.5 text-xs h-7.5 px-3 rounded-xl"
                      >
                        <Trash2 className="size-3" />
                        <span>{t.accountsDisconnect}</span>
                      </Button>
                    </div>
                  </div>
                </SpotlightCard>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
