"use client";

import { useState, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Layers,
  AlertOctagon,
  CheckCircle2,
  DollarSign,
  TrendingDown,
  HardDrive,
  Split,
  Maximize2,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { FaGoogleDrive } from "react-icons/fa6";
import { useLanguage } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type CalcMode = "fragmentation" | "capacity-roi";

export const StorageCalculator = memo(function StorageCalculator() {
  const { t } = useLanguage();
  const [activeMode, setActiveMode] = useState<CalcMode>("fragmentation");

  // Capacity & ROI state
  const [accountCount, setAccountCount] = useState<number>(3);
  const [googleOneCount, setGoogleOneCount] = useState<number>(1);
  const [hasWorkspace, setHasWorkspace] = useState<boolean>(true);

  // Calculations
  const personalGB = accountCount * 15;
  const googleOneGB = googleOneCount * 100;
  const workspaceGB = hasWorkspace ? 2048 : 0;
  const totalPooledGB = personalGB + googleOneGB + workspaceGB;

  // Real world Google One pricing: $1.99/mo ($24/yr) for 100GB, $9.99/mo ($120/yr) for 2TB
  const annualSavedUSD = Math.round(
    (accountCount * 24) + (hasWorkspace ? 120 : 0)
  );

  const formattedCapacity =
    totalPooledGB >= 1024
      ? `${(totalPooledGB / 1024).toFixed(2)} TB`
      : `${totalPooledGB} GB`;

  return (
    <SpotlightCard className="p-6 sm:p-10 border border-border/80 relative overflow-hidden shadow-2xl font-sans">
      {/* ── Mode Switcher Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-border/60 gap-4 relative z-10">
        <div>
          <h3 className="text-2xl sm:text-3xl font-bold text-foreground">
            {activeMode === "fragmentation"
              ? "The Storage Fragmentation Dilemma"
              : "Pooled Capacity & Savings Matrix"}
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-[62ch]">
            {activeMode === "fragmentation"
              ? "See how isolated Drive quotas trap your free storage, and how SkyDrive unifies them into an unfragmented volume."
              : "Calculate your aggregated storage pool across multiple connected Google Drive accounts without redundant subscriptions."}
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center p-1 rounded-xl bg-secondary/80 border border-border shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveMode("fragmentation")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5",
              activeMode === "fragmentation"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Split className="size-3.5" />
            <span>Fragmentation Dilemma</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode("capacity-roi")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5",
              activeMode === "capacity-roi"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <DollarSign className="size-3.5" />
            <span>Capacity & ROI</span>
          </button>
        </div>
      </div>

      {/* ── Mode 1: The Fragmentation Dilemma ── */}
      {activeMode === "fragmentation" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch relative z-10">
          {/* Left: The Old Way (Fragmented Quotas) */}
          <div className="lg:col-span-6 rounded-2xl bg-destructive/5 border border-destructive/20 p-5 sm:p-6 flex flex-col justify-between space-y-5">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-destructive/15">
                <div className="flex items-center gap-2 text-destructive font-bold text-xs uppercase tracking-wider font-mono">
                  <AlertOctagon className="size-4 shrink-0" />
                  <span>Isolated Google Drives (Default)</span>
                </div>
                <span className="text-[10px] font-mono font-semibold text-destructive px-2 py-0.5 rounded bg-destructive/10">
                  UPLOAD FAILS
                </span>
              </div>

              <div className="mt-4 space-y-3">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Scenario: You have 3 Google accounts with <span className="font-semibold text-foreground">9.8 GB total free space</span>. You want to upload a <span className="font-semibold text-destructive">5.0 GB 4K Project Video</span>:
                </p>

                {/* Account 1 */}
                <div className="p-3 rounded-xl bg-card/60 border border-border/80 space-y-1.5">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-foreground font-semibold">drive.alpha@gmail.com</span>
                    <span className="text-muted-foreground">3.1 GB Free (of 15 GB)</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div style={{ width: "79%" }} className="h-full bg-amber-500 rounded-full" />
                  </div>
                  <span className="text-[10px] text-destructive font-mono block">
                    ❌ 5.0 GB exceeds 3.1 GB headroom → Upload Rejected
                  </span>
                </div>

                {/* Account 2 */}
                <div className="p-3 rounded-xl bg-card/60 border border-border/80 space-y-1.5">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-foreground font-semibold">drive.beta@gmail.com</span>
                    <span className="text-muted-foreground">4.5 GB Free (of 15 GB)</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div style={{ width: "70%" }} className="h-full bg-amber-500 rounded-full" />
                  </div>
                  <span className="text-[10px] text-destructive font-mono block">
                    ❌ 5.0 GB exceeds 4.5 GB headroom → Upload Rejected
                  </span>
                </div>

                {/* Account 3 */}
                <div className="p-3 rounded-xl bg-card/60 border border-border/80 space-y-1.5">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-foreground font-semibold">drive.gamma@gmail.com</span>
                    <span className="text-muted-foreground">2.2 GB Free (of 15 GB)</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div style={{ width: "85%" }} className="h-full bg-destructive rounded-full" />
                  </div>
                  <span className="text-[10px] text-destructive font-mono block">
                    ❌ 5.0 GB exceeds 2.2 GB headroom → Upload Rejected
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-destructive/15 text-[11px] text-muted-foreground font-mono">
              Result: You are forced to pay Google One subscription or split/zip files manually despite having 9.8 GB available.
            </div>
          </div>

          {/* Right: The SkyDrive Way (Unified Virtual Pool) */}
          <div className="lg:col-span-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/25 p-5 sm:p-6 flex flex-col justify-between space-y-5">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider font-mono">
                  <CheckCircle2 className="size-4 shrink-0" />
                  <span>SkyDrive Unified Volume</span>
                </div>
                <span className="text-[10px] font-mono font-semibold text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/15">
                  ZERO-LOSS STREAM
                </span>
              </div>

              <div className="mt-4 space-y-4">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  SkyDrive aggregates all 3 quotas into a single virtual mount with unified indexing and intelligent traffic routing:
                </p>

                <div className="p-4 rounded-xl bg-card border border-emerald-500/30 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-foreground font-bold">Unified Virtual Quota Pool</span>
                    <span className="text-emerald-500 font-bold">9.8 GB Unfragmented</span>
                  </div>

                  <div className="w-full h-3 rounded-full bg-secondary overflow-hidden flex p-0.5 border border-border">
                    <div style={{ width: "51%" }} className="h-full bg-emerald-500 rounded-full" />
                  </div>

                  <div className="flex justify-between text-[11px] font-mono text-muted-foreground pt-1">
                    <span>Target 5.0 GB File</span>
                    <span className="text-emerald-500 font-semibold">Allocates seamlessly</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong className="text-foreground">Global ⌘K File Explorer:</strong> Search and view all files across your 3 accounts in one unified window.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong className="text-foreground">Zero Proxy Overhead:</strong> Stream chunks directly to Google API with 0 bytes cached on intermediate servers.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong className="text-foreground">No Duplicate Subscriptions:</strong> Maximize 100% of the storage you already own.</span>
                  </div>
                </div>
              </div>
            </div>

            <Button asChild size="lg" className="w-full font-semibold gap-2 shadow-md mt-4">
              <Link href="/register">
                Start Pooling Accounts Free
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        /* ── Mode 2: Capacity & ROI Matrix ── */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch relative z-10">
          {/* Left Controls */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Standard Accounts Slider */}
              <div className="space-y-3 bg-secondary/50 p-4.5 rounded-2xl border border-border/70">
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <FaGoogleDrive className="size-4 text-sky-500" />
                    <span className="text-foreground font-semibold">Standard Google Accounts (15 GB each)</span>
                  </div>
                  <span className="text-primary font-bold text-sm px-2.5 py-0.5 rounded-xl bg-primary/10 border border-primary/30">
                    {accountCount} Accounts ({personalGB} GB)
                  </span>
                </div>

                <input
                  type="range"
                  min="2"
                  max="10"
                  value={accountCount}
                  onChange={(e) => setAccountCount(Number(e.target.value))}
                  className="w-full accent-sky-500 cursor-pointer h-2.5 rounded-lg bg-secondary"
                />

                <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
                  <span>2 Accounts (30 GB)</span>
                  <span>5 Accounts (75 GB)</span>
                  <span>10 Accounts (150 GB)</span>
                </div>
              </div>

              {/* Google One Tier Slider */}
              <div className="space-y-3 bg-secondary/50 p-4.5 rounded-2xl border border-border/70">
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <HardDrive className="size-4 text-indigo-500" />
                    <span className="text-foreground font-semibold">Google One 100 GB Tiers</span>
                  </div>
                  <span className="text-indigo-500 font-bold text-sm px-2.5 py-0.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30">
                    {googleOneCount} Account ({googleOneGB} GB)
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="3"
                  value={googleOneCount}
                  onChange={(e) => setGoogleOneCount(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer h-2.5 rounded-lg bg-secondary"
                />

                <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
                  <span>0 Accounts (0 GB)</span>
                  <span>1 Account (100 GB)</span>
                  <span>3 Accounts (300 GB)</span>
                </div>
              </div>

              {/* Workspace Toggle */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-secondary/40 border border-border/70">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-foreground block">
                    Include Google Workspace Node (+2 TB)
                  </span>
                  <span className="text-[11px] text-muted-foreground block">
                    Connect high-capacity organizational or enterprise drives to your unified pool
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setHasWorkspace(!hasWorkspace)}
                  className={cn(
                    "w-12 h-6 rounded-full transition-colors duration-200 relative cursor-pointer",
                    hasWorkspace ? "bg-primary" : "bg-muted"
                  )}
                >
                  <motion.div
                    animate={{ x: hasWorkspace ? 26 : 2 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="size-5 rounded-full bg-white shadow-md absolute top-0.5"
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Right Result Card */}
          <div className="lg:col-span-5 flex flex-col justify-between p-6 sm:p-7 rounded-2xl bg-secondary/35 border border-border/80 space-y-6 shadow-sm relative overflow-hidden h-full backdrop-blur-xs">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider font-semibold">
                Total Unified Virtual Volume
              </span>
              <div className="text-4xl sm:text-5xl font-bold text-foreground brand-text-gradient">
                {formattedCapacity}
              </div>
              <p className="text-[11px] text-muted-foreground font-mono">
                {accountCount + googleOneCount + (hasWorkspace ? 1 : 0)} Total Accounts Aggregated
              </p>
            </div>

            {/* Savings & ROI Metric */}
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                  <TrendingDown className="size-4" />
                  Estimated Annual Savings:
                </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                  ~${annualSavedUSD}/year
                </span>
              </div>
              <p className="text-[10.5px] text-muted-foreground leading-relaxed">
                Compared to paying redundant Google One monthly tiers for separate accounts.
              </p>
            </div>

            {/* Breakdown */}
            <div className="space-y-2 pt-3 border-t border-border/70 text-xs font-mono">
              <div className="flex justify-between text-muted-foreground">
                <span>Standard Drives:</span>
                <span className="font-semibold text-foreground">{personalGB} GB</span>
              </div>
              {googleOneCount > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Google One Addons:</span>
                  <span className="font-semibold text-foreground">{googleOneGB} GB</span>
                </div>
              )}
              {hasWorkspace && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Workspace Capacity:</span>
                  <span className="font-semibold text-foreground">2,048 GB</span>
                </div>
              )}
            </div>

            <Button asChild size="lg" className="w-full font-semibold gap-2 shadow-md mt-auto">
              <Link href="/register">
                Assemble Your Storage Pool
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      )}
    </SpotlightCard>
  );
});
