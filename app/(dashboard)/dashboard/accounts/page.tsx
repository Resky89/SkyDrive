"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  HardDrive,
  Plus,
  RefreshCw,
  Trash2,
  AlertTriangle,
  ShieldCheck,
  Loader2,
  Layers,
  ArrowRight,
} from "lucide-react";
import { Header } from "@/components/header";
import { formatBytes, cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

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

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<StorageAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [disconnectingId, setDisconnectingId] = useState<string | null>(null);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/storage/analytics");
      if (res.ok) {
        const data = await res.json();
        setAccounts(data.accounts || []);
      }
    } catch {
      toast.error("Failed to load connected accounts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleSyncAccount = async (id: string) => {
    setSyncingId(id);
    try {
      const res = await fetch("/api/google/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId: id }),
      });
      if (res.ok) {
        toast.success("Account quota synchronized successfully");
        fetchAccounts();
      } else {
        toast.error("Failed to sync account");
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
        fetchAccounts();
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
      <Header accounts={accounts} onRefresh={fetchAccounts} />

      <main className="px-8 py-7 max-w-6xl w-full mx-auto space-y-6 animate-fade-in">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Connected Storage Pools
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Link multiple Google Drive accounts to automatically expand your aggregate storage capacity.
            </p>
          </div>

          <Button asChild size="sm" className="gap-1.5 shadow-sm">
            <Link href="/api/google/connect">
              <Plus className="size-3.5" />
              <span>Connect Google Account</span>
            </Link>
          </Button>
        </div>

        {/* Security & Token Banner Card */}
        <Card className="p-4 flex items-center justify-between shadow-sm bg-card border-border">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
              <ShieldCheck className="size-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-foreground">
                AES-256-GCM Token Encryption
              </h4>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                OAuth access tokens and refresh tokens are stored fully encrypted at rest and never exposed to the client.
              </p>
            </div>
          </div>
          <Badge variant="success" className="shrink-0 text-[10px]">
            ENCRYPTED
          </Badge>
        </Card>

        {/* Accounts List / Empty State */}
        {loading ? (
          <div className="py-24 text-center flex flex-col items-center justify-center space-y-3">
            <Loader2 className="size-5 text-primary animate-spin" />
            <span className="text-xs text-muted-foreground">Loading connected storage pools…</span>
          </div>
        ) : accounts.length === 0 ? (
          /* Handcrafted Distinctive Empty State */
          <Card className="p-10 text-center flex flex-col items-center justify-center space-y-6 shadow-sm">
            <div className="size-14 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shadow-sm">
              <Layers className="size-7" />
            </div>

            <div className="max-w-md space-y-1.5">
              <h3 className="text-base font-bold text-foreground">
                No Cloud Accounts Connected Yet
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Connect your first Google Drive account to activate smart file distribution and pool multiple free 15GB tiers into a single workspace.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-lg text-left pt-2">
              <div className="p-3 rounded-xl border border-border bg-muted/40 text-xs space-y-1">
                <span className="font-semibold text-foreground block">1. Connect Account</span>
                <span className="text-[11px] text-muted-foreground block">Sign in with Google OAuth</span>
              </div>
              <div className="p-3 rounded-xl border border-border bg-muted/40 text-xs space-y-1">
                <span className="font-semibold text-foreground block">2. Automatic Quota</span>
                <span className="text-[11px] text-muted-foreground block">Space is calculated live</span>
              </div>
              <div className="p-3 rounded-xl border border-border bg-muted/40 text-xs space-y-1">
                <span className="font-semibold text-foreground block">3. Smart Routing</span>
                <span className="text-[11px] text-muted-foreground block">Uploads choose best drive</span>
              </div>
            </div>

            <Button asChild size="default" className="gap-2 shadow-sm">
              <Link href="/api/google/connect">
                <Plus className="size-4" />
                <span>Connect Google Drive Account</span>
              </Link>
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {accounts.map((acc) => {
              const used = Number(acc.usedStorage);
              const total = Number(acc.totalStorage);
              const available = Number(acc.availableStorage);
              const pct = total > 0 ? (used / total) * 100 : Number(acc.usagePercentage || 0);
              const isWarning = pct >= 90;

              return (
                <Card
                  key={acc.id}
                  className="p-5 flex flex-col justify-between space-y-4 relative overflow-hidden card-hover"
                >
                  {isWarning && (
                    <div className="absolute top-0 right-0 left-0 h-1 bg-destructive" />
                  )}

                  {/* Header Row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="size-9 rounded-xl bg-muted border border-border flex items-center justify-center text-foreground font-bold text-xs shrink-0">
                        {acc.email[0].toUpperCase()}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-semibold text-foreground truncate">
                          {acc.displayName || acc.email.split("@")[0]}
                        </span>
                        <span className="text-[11px] text-muted-foreground truncate font-mono">
                          {acc.email}
                        </span>
                      </div>
                    </div>

                    <Badge
                      variant={total === 0 ? "secondary" : isWarning ? "destructive" : pct >= 70 ? "warning" : "info"}
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
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-muted-foreground text-[11px]">
                        {formatBytes(used)} / {formatBytes(total)}
                      </span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-[11px]">
                        {formatBytes(available)} free
                      </span>
                    </div>

                    <Progress
                      value={used > 0 ? Math.max(pct, 8) : 0}
                      className="h-2.5 bg-muted/80 dark:bg-secondary/60 border border-border/80 rounded-full"
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
                    <div className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/25 flex items-center gap-2 text-xs text-destructive">
                      <AlertTriangle className="size-3.5 shrink-0" />
                      <span>Capacity critical (&gt;90%). Smart engine routes to other drives.</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-border text-xs">
                    <span className="text-[11px] text-muted-foreground">
                      Google Drive API v3
                    </span>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSyncAccount(acc.id)}
                        disabled={syncingId === acc.id}
                        className="gap-1.5 text-xs h-7 px-2.5"
                      >
                        <RefreshCw
                          className={cn(
                            "size-3",
                            syncingId === acc.id && "animate-spin text-primary"
                          )}
                        />
                        <span>Sync</span>
                      </Button>

                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDisconnect(acc.id, acc.email)}
                        disabled={disconnectingId === acc.id}
                        className="gap-1.5 text-xs h-7 px-2.5"
                      >
                        <Trash2 className="size-3" />
                        <span>Disconnect</span>
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
