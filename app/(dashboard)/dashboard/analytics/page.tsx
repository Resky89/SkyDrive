"use client";

import { useState, useEffect } from "react";
import {
  BarChart2,
  PieChart as PieIcon,
  TrendingUp,
  HardDrive,
  Layers,
  Zap,
  Loader2,
} from "lucide-react";
import { Header } from "@/components/header";
import { formatBytes } from "@/lib/utils";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

const COLORS = ["#0284c7", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4"];

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/storage/analytics");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch {
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const accounts = data?.accounts || [];
  const chartData = accounts.map((acc: any) => ({
    name: acc.email.split("@")[0],
    email: acc.email,
    usedGB: Number((Number(acc.usedStorage) / (1024 * 1024 * 1024)).toFixed(2)),
    availableGB: Number((Number(acc.availableStorage) / (1024 * 1024 * 1024)).toFixed(2)),
    totalGB: Number((Number(acc.totalStorage) / (1024 * 1024 * 1024)).toFixed(2)),
  }));

  const pieData = accounts.map((acc: any) => ({
    name: acc.email.split("@")[0],
    value: Number((Number(acc.usedStorage) / (1024 * 1024 * 1024)).toFixed(2)),
  }));

  return (
    <div className="flex-1 flex flex-col min-w-0 pb-16">
      <Header accounts={accounts} onRefresh={fetchAnalytics} />

      <main className="px-8 py-7 max-w-6xl w-full mx-auto space-y-6 animate-fade-in">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Storage Pool Analytics & Distribution
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time visual breakdown of storage usage across your pooled Google Drive accounts.
          </p>
        </div>

        {loading ? (
          <div className="py-24 text-center flex flex-col items-center justify-center space-y-3">
            <Loader2 className="size-5 text-primary animate-spin" />
            <span className="text-xs text-muted-foreground">Calculating storage metrics...</span>
          </div>
        ) : accounts.length === 0 ? (
          <Card className="p-12 text-center flex flex-col items-center justify-center space-y-3 shadow-sm">
            <BarChart2 className="size-8 text-muted-foreground" />
            <p className="text-sm font-semibold text-foreground">No Data to Display</p>
            <p className="text-xs text-muted-foreground">Connect at least one Google Drive account to visualize analytics.</p>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Top Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="p-5 space-y-1 shadow-sm">
                <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                  Total Pooled Storage
                </span>
                <p className="text-2xl font-extrabold font-mono text-foreground">
                  {formatBytes(Number(data?.summary?.totalStorage || data?.aggregate?.totalStorage || 0))}
                </p>
              </Card>

              <Card className="p-5 space-y-1 shadow-sm">
                <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                  Aggregate Used Space
                </span>
                <p className="text-2xl font-extrabold font-mono text-primary">
                  {formatBytes(Number(data?.summary?.usedStorage || data?.aggregate?.usedStorage || 0))}
                </p>
              </Card>

              <Card className="p-5 space-y-1 shadow-sm">
                <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                  Available Headroom
                </span>
                <p className="text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                  {formatBytes(Number(data?.summary?.availableStorage || data?.aggregate?.availableStorage || 0))}
                </p>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Usage Distribution Bar Chart */}
              <Card className="p-5 space-y-4 shadow-sm">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider font-mono">
                  Storage Allocation Per Account (GB)
                </h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          borderColor: "hsl(var(--border))",
                          borderRadius: "12px",
                          fontSize: "12px",
                          color: "hsl(var(--foreground))",
                        }}
                      />
                      <Bar dataKey="usedGB" name="Used (GB)" fill="#0284c7" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="availableGB" name="Free (GB)" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Usage Distribution Pie Chart */}
              <Card className="p-5 space-y-4 shadow-sm">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider font-mono">
                  Storage Pool Share
                </h3>
                <div className="h-64 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={85}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((_: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          borderColor: "hsl(var(--border))",
                          borderRadius: "12px",
                          fontSize: "12px",
                          color: "hsl(var(--foreground))",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
