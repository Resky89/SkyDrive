"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  HardDrive,
  UploadCloud,
  FolderOpen,
  ArrowUpRight,
  Zap,
  Activity,
  Plus,
  Sparkles,
} from "lucide-react";
import { formatBytes, cn, getInitials } from "@/lib/utils";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useLanguage } from "@/lib/i18n";
import {
  AnimatedBytes,
  AnimatedPct,
  AnimatedProgress,
} from "@/components/dashboard/stat-counters";

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
    avatarUrl?: string | null;
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

function DashboardOverviewSkeleton() {
  return (
    <div className="flex-1 flex flex-col min-w-0 pb-16 animate-pulse">
      <main className="px-6 sm:px-8 py-7 max-w-6xl w-full mx-auto space-y-7">
        {/* Page Heading Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-5 w-24 rounded-full bg-muted/60" />
            <div className="h-8 w-56 rounded-xl bg-muted/70" />
            <div className="h-4 w-72 rounded-lg bg-muted/50" />
          </div>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-28 rounded-xl bg-muted/60" />
            <div className="h-9 w-32 rounded-xl bg-muted/60" />
          </div>
        </div>

        {/* Hero Storage Card Skeleton */}
        <div className="p-6 sm:p-7 rounded-3xl border border-border/80 bg-card shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="h-3.5 w-32 rounded bg-muted/60" />
              <div className="h-9 w-60 rounded-xl bg-muted/70" />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-6 w-28 rounded-full bg-muted/60" />
              <div className="h-6 w-32 rounded-full bg-muted/60" />
            </div>
          </div>
          <div className="h-3.5 rounded-full bg-muted/60" />
          <div className="flex justify-between">
            <div className="h-4 w-40 rounded bg-muted/50" />
            <div className="h-4 w-44 rounded bg-muted/50" />
          </div>
        </div>

        {/* Feature Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-5 rounded-3xl border border-border/80 bg-card shadow-md space-y-4 h-44 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="size-9 rounded-2xl bg-muted/70" />
                <div className="h-4 w-32 rounded bg-muted/60" />
                <div className="h-3 w-48 rounded bg-muted/50" />
              </div>
              <div className="pt-2 border-t border-border/60 flex justify-between">
                <div className="h-3 w-16 rounded bg-muted/50" />
                <div className="h-3 w-16 rounded bg-muted/50" />
              </div>
            </div>
          ))}
        </div>

        {/* Recent Uploads Skeleton */}
        <div className="p-6 rounded-3xl border border-border/80 bg-card shadow-lg space-y-4">
          <div className="flex justify-between items-center">
            <div className="h-5 w-36 rounded bg-muted/60" />
            <div className="h-4 w-20 rounded bg-muted/50" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 rounded-2xl bg-muted/40" />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function DashboardOverviewPage() {
  const { t } = useLanguage();
  const [data, setData] = useState<StorageAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [animEnabled, setAnimEnabled] = useState(false);

  const fetchData = useCallback(async (retryCount = 0) => {
    try {
      const res = await fetch("/api/storage/analytics");
      if (res.ok) {
        const json = await res.json();
        setData(json);
        setLoading(false);
        setAnimEnabled(true);
        return;
      }

      // Retry up to 2 times to absorb any initial cookie propagation race condition
      if (retryCount < 2) {
        setTimeout(() => {
          fetchData(retryCount + 1);
        }, 350 * (retryCount + 1));
        return;
      }
    } catch {
      if (retryCount < 2) {
        setTimeout(() => {
          fetchData(retryCount + 1);
        }, 350 * (retryCount + 1));
        return;
      }
      toast.error("Gagal memuat analitik penyimpanan dashboard");
    } finally {
      if (retryCount >= 2) {
        setLoading(false);
        setAnimEnabled(true);
      }
    }
  }, []);

  useEffect(() => {
    fetchData();
    const timer = setTimeout(() => setAnimEnabled(true), 100);
    return () => clearTimeout(timer);
  }, [fetchData]);

  useEffect(() => {
    const handleRefresh = () => fetchData();
    window.addEventListener("skydrive:refresh", handleRefresh);
    return () => window.removeEventListener("skydrive:refresh", handleRefresh);
  }, [fetchData]);

  const total = Number(data?.summary?.totalStorage || 0);
  const used = Number(data?.summary?.usedStorage || 0);
  const available = Number(data?.summary?.availableStorage || 0);
  const usagePct = total > 0 ? (used / total) * 100 : Number(data?.summary?.usagePercentage || 0);
  const displayPct = used > 0 ? Math.max(usagePct, 6) : 0;

  const featureCards = useMemo(
    () => [
      {
        href: "/dashboard/accounts",
        icon: HardDrive,
        title: t.overviewPoolsCardTitle,
        desc: t.overviewPoolsCardDesc,
        meta: `${data?.summary?.activeAccounts || 0} ${t.overviewPoolsCardActive}`,
        cta: t.overviewPoolsCardManage,
        color: "from-sky-500/20 to-blue-600/20",
        delay: 0,
      },
      {
        href: "/dashboard/uploads",
        icon: Zap,
        title: t.overviewSmartUploadCardTitle,
        desc: t.overviewSmartUploadCardDesc,
        meta: t.overviewSmartUploadCardMeta,
        cta: t.overviewSmartUploadCardUpload,
        color: "from-indigo-500/20 to-sky-500/20",
        delay: 80,
      },
      {
        href: "/dashboard/files",
        icon: FolderOpen,
        title: t.overviewExplorerCardTitle,
        desc: t.overviewExplorerCardDesc,
        meta: `${data?.summary?.totalFiles || 0} ${t.overviewExplorerCardMeta}`,
        cta: t.overviewExplorerCardBrowse,
        color: "from-cyan-500/20 to-sky-600/20",
        delay: 160,
      },
    ],
    [data?.summary?.activeAccounts, data?.summary?.totalFiles, t]
  );

  // Render skeleton while initial fetch is loading
  if (loading && !data) {
    return <DashboardOverviewSkeleton />;
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 pb-16">
      <main className="px-6 sm:px-8 py-7 max-w-6xl w-full mx-auto space-y-7">
        {/* Page heading */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-card-in">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-mono text-primary font-semibold">
                <Sparkles className="size-3" />
                {t.overviewTag}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
              {t.overviewTitle}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t.overviewSubtitle}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button asChild variant="outline" size="sm" className="gap-1.5 shadow-sm border-border/80 bg-card/80">
              <Link href="/dashboard/accounts">
                <Plus className="size-3.5" />
                <span>{t.overviewLinkBtn}</span>
              </Link>
            </Button>
            <Button asChild size="sm" className="gap-1.5 shadow-md font-semibold">
              <Link href="/dashboard/uploads">
                <UploadCloud className="size-3.5" />
                <span>{t.overviewUploadBtn}</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Hero Storage Card with Spotlight */}
        <SpotlightCard
          className="p-6 sm:p-7 border-border/80 shadow-xl space-y-6 relative overflow-hidden animate-card-in transition-colors duration-150"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-widest">
                {t.overviewTotalPooled}
              </span>
              <div className="flex items-baseline gap-3">
                <AnimatedBytes
                  value={used}
                  enabled={animEnabled}
                  duration={1400}
                  className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground font-mono tabular-nums"
                />
                <span className="text-xs sm:text-sm text-muted-foreground font-mono">
                  {t.overviewOf}{" "}
                  <AnimatedBytes
                    value={total}
                    enabled={animEnabled}
                    duration={1400}
                  />{" "}
                  {t.overviewAllocated}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 relative z-10">
              <Badge variant="outline" className="text-xs font-mono border-primary/30 text-primary bg-primary/10">
                {data?.summary?.totalAccounts || 0} {t.overviewDrivesLinked}
              </Badge>
              <Badge variant="success" className="text-xs font-mono">
                <AnimatedBytes value={available} enabled={animEnabled} duration={1400} />{" "}
                {t.overviewAvailable}
              </Badge>
            </div>
          </div>

          {/* Precision Storage Meter */}
          <div className="space-y-2.5 relative z-10">
            <AnimatedProgress
              value={displayPct}
              enabled={animEnabled}
              className="h-3.5 bg-secondary/80 border border-border/80 rounded-full overflow-hidden"
              indicatorColor="bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-600 shadow-sm"
            />

            <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <AnimatedPct value={usagePct} enabled={animEnabled} duration={1200} />
                {` ${t.overviewCapacityAllocated}`}
              </span>
              <span>
                {used > 0
                  ? (100 - usagePct) > 99 && (100 - usagePct) < 100
                    ? `${(100 - usagePct).toFixed(2)}% ${t.overviewHeadroomRemaining}`
                    : `${(100 - usagePct).toFixed(1)}% ${t.overviewHeadroomRemaining}`
                  : `100.0% ${t.overviewHeadroomRemaining}`}
              </span>
            </div>
          </div>

          {/* Segmented Linked Drive Cards */}
          {data?.accounts && data.accounts.length > 0 && (
            <div className="pt-4 border-t border-border/70 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 relative z-10">
              {data.accounts.map((acc, i) => (
                <div
                  key={acc.id}
                  className="p-3.5 rounded-2xl border border-border/80 bg-card/60 hover:bg-card/90 flex items-center justify-between text-xs transition-colors duration-150 shadow-sm group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar className="size-7 rounded-xl border border-primary/20 shrink-0 shadow-sm">
                      {acc.avatarUrl && (
                        <AvatarImage
                          src={acc.avatarUrl}
                          alt={acc.displayName || acc.email}
                          referrerPolicy="no-referrer"
                          className="object-cover rounded-xl"
                        />
                      )}
                      <AvatarFallback className="rounded-xl text-[9px] font-bold bg-primary/10 text-primary">
                        {acc.displayName ? getInitials(acc.displayName) : acc.email[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                      <span className="font-mono text-[11px] truncate text-foreground font-semibold">
                        {acc.displayName || acc.email.split("@")[0]}
                      </span>
                      <span className="text-[9px] font-mono text-muted-foreground truncate">
                        {acc.email}
                      </span>
                    </div>
                  </div>
                  <AnimatedBytes
                    value={Number(acc.usedStorage)}
                    enabled={animEnabled}
                    duration={1000 + i * 100}
                    className="font-mono text-[11px] font-bold text-muted-foreground shrink-0 ml-2 tabular-nums"
                  />
                </div>
              ))}
            </div>
          )}
        </SpotlightCard>

        {/* Feature Grid with Spotlight Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {featureCards.map(({ href, icon: Icon, title, desc, meta, cta, color, delay }) => (
            <Link key={href} href={href} className="group block h-full">
              <SpotlightCard
                className="p-5 flex flex-col justify-between h-full space-y-4 border border-border/80 hover:border-primary/40 transition-colors duration-150 shadow-md animate-card-in"
                style={{ animationDelay: `${delay}ms` }}
              >
                <div className="space-y-2.5">
                  <div className={`size-9 rounded-2xl bg-gradient-to-br ${color} text-primary border border-primary/30 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform`}>
                    <Icon className="size-4.5" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors flex items-center justify-between">
                    <span>{title}</span>
                    <ArrowUpRight className="size-3.5 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                </div>
                <div className="pt-2.5 border-t border-border/70 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                  <span>{meta}</span>
                  <span className="text-primary font-semibold">{cta} &rarr;</span>
                </div>
              </SpotlightCard>
            </Link>
          ))}
        </div>

        {/* Recent Uploads Stream */}
        <SpotlightCard
          className="p-6 border-border/80 space-y-4 shadow-lg animate-card-in transition-colors duration-150"
          style={{ animationDelay: "200ms" }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="size-4 text-primary" />
              <h3 className="text-sm font-bold text-foreground">{t.overviewRecentTitle}</h3>
            </div>
            <Link
              href="/dashboard/files"
              className="text-xs text-primary hover:underline font-semibold font-mono"
            >
              {t.overviewViewAll} &rarr;
            </Link>
          </div>

          {!data?.recentUploads || data.recentUploads.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground font-mono">
              {t.overviewNoRecent}
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {data.recentUploads.map((file) => (
                <div
                  key={file.id}
                  className="py-3 flex items-center justify-between text-xs transition-colors duration-150 hover:bg-secondary/40 px-2 rounded-xl"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                      <FolderOpen className="size-4" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-foreground truncate">{file.name}</span>
                      <span className="text-[10px] text-muted-foreground font-mono truncate">
                        {file.account?.email || "Google Drive"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 font-mono text-[11px]">
                    <span className="text-muted-foreground">{formatBytes(Number(file.size))}</span>
                    <Badge variant="success" className="text-[10px]">
                      {file.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SpotlightCard>
      </main>
    </div>
  );
}
