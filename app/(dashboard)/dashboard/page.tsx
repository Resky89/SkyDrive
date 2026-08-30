"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  HardDrive,
  UploadCloud,
  FolderOpen,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Activity,
  Layers,
  Plus,
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
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface StorageAnalyticsData {
  summary: {
    totalAccounts: number;
    activeAccounts: number;
    totalFiles: number;
    totalStorage: string;
    usedStorage: string;
    availableStorage: string;
    usagePercentage: number;
  };
  accounts: Array<{
    id: string;
    email: string;
    displayName?: string | null;
    totalStorage: string;
    usedStorage: string;
    availableStorage: string;
    usagePercentage: number;
  }>;
  recentUploads: Array<{
    id: string;
    name: string;
    size: string;
    mimeType: string;
    status: string;
    createdAt: string;
    account?: { email: string };
  }>;
}

export default function DashboardOverviewPage() {
  const [data, setData] = useState<StorageAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/storage/analytics");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch {
      toast.error("Failed to load dashboard overview data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const total = Number(data?.summary?.totalStorage || 0);
  const used = Number(data?.summary?.usedStorage || 0);
  const available = Number(data?.summary?.availableStorage || 0);
  const usagePct = total > 0 ? (used / total) * 100 : Number(data?.summary?.usagePercentage || 0);

  return (
    <div className="flex-1 flex flex-col min-w-0 pb-16">
      <Header accounts={data?.accounts || []} onRefresh={fetchData} />

      <main className="px-8 py-7 max-w-6xl w-full mx-auto space-y-6 animate-fade-in">
        {/* Top Metric Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Unified Storage Pool
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Aggregating multiple Google Drive quotas into a single virtual volume.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm" className="gap-1.5 shadow-sm">
              <Link href="/dashboard/accounts">
                <Plus className="size-3.5" />
                <span>Link Account</span>
              </Link>
            </Button>

            <Button asChild size="sm" className="gap-1.5 shadow-sm">
              <Link href="/dashboard/uploads">
                <UploadCloud className="size-3.5" />
                <span>Smart Upload</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Aggregate Pool Hero Card */}
        <Card className="p-6 border-border shadow-sm space-y-5 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-mono font-medium text-muted-foreground uppercase tracking-wider">
                Total Pooled Capacity
              </span>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-extrabold tracking-tight text-foreground font-mono">
                  {formatBytes(used)}
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  of {formatBytes(total)} allocated
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="info" className="text-xs font-mono">
                {data?.summary?.totalAccounts || 0} Connected Accounts
              </Badge>
              <Badge variant="success" className="text-xs font-mono">
                {formatBytes(available)} Available
              </Badge>
            </div>
          </div>

          {/* Precision Storage Meter */}
          <div className="space-y-2">
            <Progress
              value={used > 0 ? Math.max(usagePct, 8) : 0}
              className="h-3 bg-muted/80 dark:bg-secondary/60 border border-border/80 rounded-full"
              indicatorColor="bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500"
            />

            <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
              <span className="font-semibold text-foreground">
                {used > 0
                  ? usagePct < 1
                    ? `${usagePct.toFixed(2)}% Capacity Used`
                    : `${usagePct.toFixed(1)}% Capacity Used`
                  : "0.0% Capacity Used"}
              </span>
              <span>
                {used > 0
                  ? (100 - usagePct) > 99 && (100 - usagePct) < 100
                    ? `${(100 - usagePct).toFixed(2)}% Headroom Remaining`
                    : `${(100 - usagePct).toFixed(1)}% Headroom Remaining`
                  : "100.0% Headroom Remaining"}
              </span>
            </div>
          </div>

          {/* Segmented Account Previews */}
          {data?.accounts && data.accounts.length > 0 && (
            <div className="pt-3 border-t border-border grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {data.accounts.map((acc) => (
                <div
                  key={acc.id}
                  className="p-3 rounded-xl border border-border bg-muted/30 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="size-2 rounded-full bg-emerald-500 shrink-0" />
                    <span className="font-mono text-[11px] truncate text-foreground">
                      {acc.email}
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-muted-foreground shrink-0 ml-2">
                    {formatBytes(Number(acc.usedStorage))}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Feature Grid & Action Modules */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Tile 1: Connected Accounts */}
          <Link
            href="/dashboard/accounts"
            className="group"
          >
            <Card className="card-hover p-5 flex flex-col justify-between h-full space-y-4">
              <div className="space-y-2">
                <div className="size-8 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
                  <HardDrive className="size-4" />
                </div>
                <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors flex items-center justify-between">
                  <span>Storage Pools</span>
                  <ArrowUpRight className="size-3.5 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Connect and synchronize personal and work Google accounts with quota auto-balancing.
                </p>
              </div>

              <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                <span>{data?.summary?.activeAccounts || 0} active</span>
                <span className="text-primary font-medium">Manage &rarr;</span>
              </div>
            </Card>
          </Link>

          {/* Tile 2: Smart Router */}
          <Link
            href="/dashboard/uploads"
            className="group"
          >
            <Card className="card-hover p-5 flex flex-col justify-between h-full space-y-4">
              <div className="space-y-2">
                <div className="size-8 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
                  <Zap className="size-4" />
                </div>
                <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors flex items-center justify-between">
                  <span>Smart Upload Engine</span>
                  <ArrowUpRight className="size-3.5 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Intelligently routes every file to the optimal drive based on available space and strategy.
                </p>
              </div>

              <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                <span>4 Routing Modes</span>
                <span className="text-primary font-medium">Upload &rarr;</span>
              </div>
            </Card>
          </Link>

          {/* Tile 3: File Explorer */}
          <Link
            href="/dashboard/files"
            className="group"
          >
            <Card className="card-hover p-5 flex flex-col justify-between h-full space-y-4">
              <div className="space-y-2">
                <div className="size-8 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
                  <FolderOpen className="size-4" />
                </div>
                <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors flex items-center justify-between">
                  <span>Unified File Explorer</span>
                  <ArrowUpRight className="size-3.5 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Browse, search, and download files from all connected drives in one unified view.
                </p>
              </div>

              <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                <span>{data?.summary?.totalFiles || 0} indexed files</span>
                <span className="text-primary font-medium">Browse &rarr;</span>
              </div>
            </Card>
          </Link>
        </div>

        {/* Recent Activity Table */}
        <Card className="p-5 border-border space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="size-4 text-primary" />
              <h3 className="text-sm font-bold text-foreground">Recent Uploads</h3>
            </div>
            <Link
              href="/dashboard/files"
              className="text-xs text-primary hover:underline font-semibold"
            >
              View all files &rarr;
            </Link>
          </div>

          {!data?.recentUploads || data.recentUploads.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No recent file uploads recorded. Start uploading to see activity here.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {data.recentUploads.map((file) => (
                <div
                  key={file.id}
                  className="py-2.5 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="size-7 rounded-lg bg-muted border border-border flex items-center justify-center text-muted-foreground shrink-0">
                      <FolderOpen className="size-3.5" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-medium text-foreground truncate">
                        {file.name}
                      </span>
                      <span className="text-[11px] text-muted-foreground font-mono truncate">
                        {file.account?.email || "Google Drive"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 font-mono text-[11px] text-muted-foreground">
                    <span>{formatBytes(Number(file.size))}</span>
                    <Badge variant="success" className="text-[10px]">
                      {file.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}
