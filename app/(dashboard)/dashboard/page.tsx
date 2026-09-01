"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  HardDrive,
  UploadCloud,
  FolderOpen,
  ArrowUpRight,
  Zap,
  Activity,
  Plus,
  Layers,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { Header } from "@/components/header";
import { formatBytes, cn, getInitials } from "@/lib/utils";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useCountUp } from "@/hooks/use-count-up";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useLanguage } from "@/lib/i18n";

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

// ── Animated stat value ──
function AnimatedBytes({
  value,
  enabled,
  duration = 1400,
  className,
}: {
  value: number;
  enabled: boolean;
  duration?: number;
  className?: string;
}) {
  const animated = useCountUp({ end: value, duration, enabled });
  return <span className={className}>{formatBytes(animated)}</span>;
}

// ── Animated percentage ──
function AnimatedPct({
  value,
  enabled,
  duration = 1200,
  className,
}: {
  value: number;
  enabled: boolean;
  duration?: number;
  className?: string;
}) {
  const animated = useCountUp({ end: Math.round(value * 100), duration, enabled });
  const display = animated / 100;
  return (
    <span className={className}>
      {display < 1 ? display.toFixed(2) : display.toFixed(1)}%
    </span>
  );
}

// ── Animated progress bar ──
function AnimatedProgress({
  value,
  enabled,
  indicatorColor,
  className,
}: {
  value: number;
  enabled: boolean;
  indicatorColor?: string;
  className?: string;
}) {
  const animated = useCountUp({ end: Math.round(value), duration: 1600, enabled });
  return (
    <Progress
      value={animated}
      indicatorColor={indicatorColor}
      className={className}
    />
  );
}

export default function DashboardOverviewPage() {
  const { t } = useLanguage();
  const [data, setData] = useState<StorageAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [animEnabled, setAnimEnabled] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setAnimEnabled(false);
      const res = await fetch("/api/storage/analytics");
      if (res.ok) {
        const json = await res.json();
        setData(json);
        requestAnimationFrame(() => setTimeout(() => setAnimEnabled(true), 120));
      }
    } catch {
      toast.error("Gagal memuat analitik penyimpanan dashboard");
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
  const displayPct = used > 0 ? Math.max(usagePct, 6) : 0;

  return (
    <div className="flex-1 flex flex-col min-w-0 pb-16">
      <Header accounts={data?.accounts || []} onRefresh={fetchData} />

      <main className="px-6 sm:px-8 py-7 max-w-6xl w-full mx-auto space-y-7">
        {/* Page heading */}
        <div
          className={cn(
            "flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-500 ease-out",
            animEnabled ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
          )}
        >
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

        {/* ── Hero Storage Card with Spotlight ── */}
        <SpotlightCard
          className={cn(
            "p-6 sm:p-7 border-border/80 shadow-xl space-y-6 relative overflow-hidden transition-all duration-600 ease-out",
            animEnabled ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
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

          {/* Segmented Linked Drive Cards with Gmail Profile Pictures */}
          {data?.accounts && data.accounts.length > 0 && (
            <div className="pt-4 border-t border-border/70 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 relative z-10">
              {data.accounts.map((acc, i) => (
                <div
                  key={acc.id}
                  className={cn(
                    "p-3.5 rounded-2xl border border-border/80 bg-card/60 hover:bg-card/90 flex items-center justify-between text-xs transition-all duration-300 shadow-sm group",
                    animEnabled ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                  )}
                  style={{ transitionDelay: `${200 + i * 80}ms` }}
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
          {[
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
          ].map(({ href, icon: Icon, title, desc, meta, cta, color, delay }) => (
            <Link key={href} href={href} className="group">
              <SpotlightCard
                className={cn(
                  "p-5 flex flex-col justify-between h-full space-y-4 border border-border/80 hover:border-primary/40 transition-all duration-300 shadow-md",
                  animEnabled ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                )}
                style={{ transitionDelay: `${280 + delay}ms` }}
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
          className={cn(
            "p-6 border-border/80 space-y-4 shadow-lg transition-all duration-500 ease-out",
            animEnabled ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
          style={{ transitionDelay: "500ms" }}
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
              {data.recentUploads.map((file, i) => (
                <div
                  key={file.id}
                  className={cn(
                    "py-3 flex items-center justify-between text-xs transition-all duration-300 hover:bg-secondary/40 px-2 rounded-xl",
                    animEnabled ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"
                  )}
                  style={{ transitionDelay: `${520 + i * 60}ms` }}
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
