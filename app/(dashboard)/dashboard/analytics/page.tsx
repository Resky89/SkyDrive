"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  BarChart2,
  Loader2,
  Sparkles,
} from "lucide-react";
import { formatBytes } from "@/lib/utils";
import { toast } from "sonner";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";

interface StorageAccountItem {
  id: string;
  email: string;
  displayName?: string | null;
  totalStorage: string;
  usedStorage: string;
  availableStorage: string;
  usagePercentage: number;
}

interface AnalyticsResponse {
  summary?: {
    totalAccounts: number;
    activeAccounts: number;
    totalFiles: number;
    totalStorage: string;
    usedStorage: string;
    availableStorage: string;
    usagePercentage: number;
  };
  aggregate?: {
    totalStorage: string;
    usedStorage: string;
    availableStorage: string;
  };
  accounts: StorageAccountItem[];
}

const CHART_COLORS = ["#38bdf8", "#818cf8", "#34d399", "#fbbf24", "#f472b6", "#22d3ee"];

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/storage/analytics");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch {
      toast.error("Gagal memuat data analitik");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  useEffect(() => {
    const handleRefresh = () => fetchAnalytics();
    window.addEventListener("skydrive:refresh", handleRefresh);
    return () => window.removeEventListener("skydrive:refresh", handleRefresh);
  }, [fetchAnalytics]);

  const accounts = useMemo(() => data?.accounts || [], [data?.accounts]);

  const chartData = useMemo(
    () =>
      accounts.map((acc) => ({
        name: acc.email.split("@")[0],
        email: acc.email,
        usedGB: Number((Number(acc.usedStorage) / (1024 * 1024 * 1024)).toFixed(2)),
        availableGB: Number((Number(acc.availableStorage) / (1024 * 1024 * 1024)).toFixed(2)),
        totalGB: Number((Number(acc.totalStorage) / (1024 * 1024 * 1024)).toFixed(2)),
      })),
    [accounts]
  );

  const pieData = useMemo(
    () =>
      accounts.map((acc) => ({
        name: acc.email.split("@")[0],
        value: Number((Number(acc.usedStorage) / (1024 * 1024 * 1024)).toFixed(2)),
      })),
    [accounts]
  );

  const totalStorage = Number(
    data?.summary?.totalStorage || data?.aggregate?.totalStorage || 0
  );
  const usedStorage = Number(
    data?.summary?.usedStorage || data?.aggregate?.usedStorage || 0
  );
  const availableStorage = Number(
    data?.summary?.availableStorage || data?.aggregate?.availableStorage || 0
  );

  return (
    <div className="flex-1 flex flex-col min-w-0 pb-16">
      <main className="px-6 sm:px-8 py-7 max-w-6xl w-full mx-auto space-y-7">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-mono text-primary font-semibold">
              <Sparkles className="size-3" />
              Live Telemetry
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            Storage Pool Analytics & Distribution
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time visual breakdown of storage usage across your pooled Google Drive accounts.
          </p>
        </div>

        {loading ? (
          <div className="py-24 text-center flex flex-col items-center justify-center space-y-3">
            <Loader2 className="size-5 text-primary animate-spin" />
            <span className="text-xs text-muted-foreground font-mono">Calculating storage metrics...</span>
          </div>
        ) : accounts.length === 0 ? (
          <SpotlightCard className="p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-lg">
            <BarChart2 className="size-10 text-muted-foreground" />
            <p className="text-sm font-bold text-foreground">No Data to Display</p>
            <p className="text-xs text-muted-foreground">Connect at least one Google Drive account to visualize analytics.</p>
          </SpotlightCard>
        ) : (
          <div className="space-y-6">
            {/* Top Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-stretch">
              <SpotlightCard className="p-5 space-y-1.5 shadow-md h-full flex flex-col justify-between">
                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest font-semibold">
                  Total Pooled Storage
                </span>
                <p className="text-2xl font-extrabold font-mono text-foreground">
                  {formatBytes(totalStorage)}
                </p>
              </SpotlightCard>

              <SpotlightCard className="p-5 space-y-1.5 shadow-md h-full flex flex-col justify-between">
                <span className="text-[10px] font-mono text-primary uppercase tracking-widest font-semibold">
                  Aggregate Used Space
                </span>
                <p className="text-2xl font-extrabold font-mono text-primary brand-text-gradient">
                  {formatBytes(usedStorage)}
                </p>
              </SpotlightCard>

              <SpotlightCard className="p-5 space-y-1.5 shadow-md h-full flex flex-col justify-between">
                <span className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest font-semibold">
                  Available Headroom
                </span>
                <p className="text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                  {formatBytes(availableStorage)}
                </p>
              </SpotlightCard>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              {/* Usage Distribution Bar Chart */}
              <SpotlightCard className="p-6 space-y-4 shadow-xl border border-border/80 relative h-full flex flex-col justify-between">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider font-mono">
                  Storage Allocation Per Account (GB)
                </h3>
                <div className="h-64 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          borderColor: "hsl(var(--border))",
                          borderRadius: "1rem",
                          fontSize: "12px",
                        }}
                      />
                      <Bar dataKey="usedGB" name="Used GB" fill="#38bdf8" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </SpotlightCard>

              {/* Pie Distribution Chart */}
              <SpotlightCard className="p-6 space-y-4 shadow-xl border border-border/80 relative h-full flex flex-col justify-between">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider font-mono">
                  Capacity Share Breakdown
                </h3>
                <div className="h-64 w-full flex items-center justify-center pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={85}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {pieData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          borderColor: "hsl(var(--border))",
                          borderRadius: "1rem",
                          fontSize: "12px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </SpotlightCard>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
