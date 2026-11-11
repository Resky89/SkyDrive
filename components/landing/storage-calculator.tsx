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
    <SpotlightCard className="p-4 sm:p-8 lg:p-10 border border-border/80 relative overflow-hidden shadow-2xl font-sans">
      {/* ── Mode Switcher Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-border/60 gap-4 relative z-10">
        <div>
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
            {activeMode === "fragmentation"
              ? "Masalah Akun Terpisah vs Solusi SkyDrive"
              : "Hitung Kapasitas & Penghematan Biaya"}
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-[62ch]">
            {activeMode === "fragmentation"
              ? "Lihat bagaimana kuota Google Drive yang terpisah membuat Anda kesulitan mengunggah file, dan bagaimana SkyDrive menyatukannya."
              : "Hitung total kapasitas penyimpanan gratis dari semua akun Google Anda tanpa perlu membayar biaya langganan bulanan."}
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="grid grid-cols-2 sm:flex items-center p-1 rounded-xl bg-secondary/80 border border-border shrink-0 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveMode("fragmentation")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5",
              activeMode === "fragmentation"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Split className="size-3.5 shrink-0" />
            <span className="truncate">{t.calcMode1Tab}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode("capacity-roi")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5",
              activeMode === "capacity-roi"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <DollarSign className="size-3.5 shrink-0" />
            <span className="truncate">{t.calcMode2Tab}</span>
          </button>
        </div>
      </div>

      {/* ── Mode 1: Perbandingan Nyata ── */}
      {activeMode === "fragmentation" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch relative z-10">
          {/* Left: Cara Lama (Akun Terpisah-pisah) */}
          <div className="lg:col-span-6 rounded-2xl bg-destructive/5 border border-destructive/20 p-5 sm:p-6 flex flex-col justify-between space-y-5">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-destructive/15">
                <div className="flex items-center gap-2 text-destructive font-bold text-xs uppercase tracking-wider">
                  <AlertOctagon className="size-4 shrink-0" />
                  <span>{t.calcProblemHeader}</span>
                </div>
                <span className="text-[10px] font-semibold text-destructive px-2 py-0.5 rounded bg-destructive/10">
                  UPLOAD GAGAL
                </span>
              </div>

              <div className="mt-4 space-y-3">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {t.calcProblemSub}
                </p>

                {/* Account 1 */}
                <div className="p-3 rounded-xl bg-card/60 border border-border/80 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-foreground font-semibold">{t.calcAccountPersonal}</span>
                    <span className="text-muted-foreground">{t.calcAccountRem1}</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div style={{ width: "79%" }} className="h-full bg-amber-500 rounded-full" />
                  </div>
                  <span className="text-[11px] text-destructive block">
                    ❌ 5.0 GB &gt; 1.2 GB
                  </span>
                </div>

                {/* Account 2 */}
                <div className="p-3 rounded-xl bg-card/60 border border-border/80 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-foreground font-semibold">{t.calcAccountWork}</span>
                    <span className="text-muted-foreground">{t.calcAccountRem2}</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div style={{ width: "70%" }} className="h-full bg-amber-500 rounded-full" />
                  </div>
                  <span className="text-[11px] text-destructive block">
                    ❌ 5.0 GB &gt; 2.8 GB
                  </span>
                </div>

                {/* Account 3 */}
                <div className="p-3 rounded-xl bg-card/60 border border-border/80 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-foreground font-semibold">{t.calcAccountVault}</span>
                    <span className="text-muted-foreground">{t.calcAccountRem3}</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div style={{ width: "85%" }} className="h-full bg-destructive rounded-full" />
                  </div>
                  <span className="text-[11px] text-destructive block">
                    ❌ 5.0 GB &gt; 0.5 GB
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-destructive/15 text-xs text-muted-foreground">
              {t.calcProblemAlert}
            </div>
          </div>

          {/* Right: Solusi SkyDrive */}
          <div className="lg:col-span-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/25 p-5 sm:p-6 flex flex-col justify-between space-y-5">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
                  <CheckCircle2 className="size-4 shrink-0" />
                  <span>{t.calcSolutionHeader}</span>
                </div>
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/15">
                  OTOMATIS BERHASIL
                </span>
              </div>

              <div className="mt-4 space-y-4">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {t.calcSolutionSub}
                </p>

                <div className="p-4 rounded-xl bg-card border border-emerald-500/30 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-foreground font-bold">{t.calcSolutionPoolLabel}</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">45 GB Total</span>
                  </div>

                  <div className="w-full h-3 rounded-full bg-secondary overflow-hidden flex p-0.5 border border-border">
                    <div style={{ width: "51%" }} className="h-full bg-emerald-500 rounded-full" />
                  </div>

                  <div className="flex justify-between text-xs text-muted-foreground pt-1">
                    <span>{t.calcSolutionFileInfo}</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{t.calcSolutionFileSuccess}</span>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong className="text-foreground">{t.calcFeature1Title}</strong> {t.calcFeature1Desc}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong className="text-foreground">{t.calcFeature2Title}</strong> {t.calcFeature2Desc}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong className="text-foreground">{t.calcFeature3Title}</strong> {t.calcFeature3Desc}</span>
                  </div>
                </div>
              </div>
            </div>

            <Button asChild size="lg" className="w-full font-semibold gap-2 shadow-md mt-4">
              <Link href="/register">
                {t.calcCtaBtn}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        /* ── Mode 2: Kalkulator Hemat & Kapasitas ── */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch relative z-10">
          {/* Left Controls */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Standard Accounts Slider */}
              <div className="space-y-3 bg-secondary/50 p-4.5 rounded-2xl border border-border/70">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <FaGoogleDrive className="size-4 text-sky-500" />
                    <span className="text-foreground font-semibold">{t.calcAccountsLabel}</span>
                  </div>
                  <span className="text-primary font-bold text-sm px-2.5 py-0.5 rounded-xl bg-primary/10 border border-primary/30">
                    {accountCount} {t.calcAccounts} ({personalGB} GB)
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

                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>2 {t.calcAccounts} (30 GB)</span>
                  <span>5 {t.calcAccounts} (75 GB)</span>
                  <span>10 {t.calcAccounts} (150 GB)</span>
                </div>
              </div>

              {/* Google One Tier Slider */}
              <div className="space-y-3 bg-secondary/50 p-4.5 rounded-2xl border border-border/70">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <HardDrive className="size-4 text-indigo-500" />
                    <span className="text-foreground font-semibold">{t.calcGoogleOneLabel}</span>
                  </div>
                  <span className="text-indigo-500 font-bold text-sm px-2.5 py-0.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30">
                    {googleOneCount} {t.calcAccounts} ({googleOneGB} GB)
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

                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>0 {t.calcAccounts} (0 GB)</span>
                  <span>1 {t.calcAccounts} (100 GB)</span>
                  <span>3 {t.calcAccounts} (300 GB)</span>
                </div>
              </div>

              {/* Workspace Toggle */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-secondary/40 border border-border/70">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-foreground block">
                    {t.calcWorkspaceLabel}
                  </span>
                  <span className="text-[11px] text-muted-foreground block">
                    {t.calcWorkspaceSub}
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
              <span className="text-xs uppercase text-muted-foreground tracking-wider font-semibold">
                {t.calcSolutionPoolLabel}
              </span>
              <div className="text-4xl sm:text-5xl font-bold text-foreground brand-text-gradient">
                {formattedCapacity}
              </div>
              <p className="text-xs text-muted-foreground">
                {accountCount + googleOneCount + (hasWorkspace ? 1 : 0)} {t.calcAccounts}
              </p>
            </div>

            {/* Savings Metric */}
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                  <TrendingDown className="size-4" />
                  {t.calcSavingsLabel}
                </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                  ${annualSavedUSD}/yr
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {t.calcSavingsValue}
              </p>
            </div>

            {/* Breakdown */}
            <div className="space-y-2 pt-3 border-t border-border/70 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>{t.calcBreakdownFree}:</span>
                <span className="font-semibold text-foreground">{personalGB} GB</span>
              </div>
              {googleOneCount > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>{t.calcBreakdownOne}:</span>
                  <span className="font-semibold text-foreground">{googleOneGB} GB</span>
                </div>
              )}
              {hasWorkspace && (
                <div className="flex justify-between text-muted-foreground">
                  <span>{t.calcBreakdownWork}:</span>
                  <span className="font-semibold text-foreground">2.048 GB (2 TB)</span>
                </div>
              )}
            </div>

            <Button asChild size="lg" className="w-full font-semibold gap-2 shadow-md mt-auto">
              <Link href="/register">
                {t.calcCtaBtn}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      )}
    </SpotlightCard>
  );
});
