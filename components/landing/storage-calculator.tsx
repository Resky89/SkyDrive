"use client";

import { useState, memo } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { FaGoogleDrive } from "react-icons/fa6";
import { useLanguage } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const StorageCalculator = memo(function StorageCalculator() {
  const { t } = useLanguage();
  const [accountCount, setAccountCount] = useState<number>(3);
  const [hasWorkspace, setHasWorkspace] = useState<boolean>(true);

  // 15 GB free per personal account + optional 2TB Workspace
  const freeGB = accountCount * 15;
  const totalPooledGB = hasWorkspace ? freeGB + 2048 : freeGB;
  const formattedCapacity =
    totalPooledGB >= 1024
      ? `${(totalPooledGB / 1024).toFixed(2)} TB`
      : `${totalPooledGB} GB`;

  return (
    <SpotlightCard className="p-6 sm:p-10 border border-border/80 relative overflow-hidden shadow-2xl">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch relative z-10">
        {/* Left Side: Interactive Controls */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-medium mb-3">
              <Sparkles className="size-3" />
              <span>{t.calcTag}</span>
            </div>
            <h3 className="text-[length:var(--text-2xl)] sm:text-[length:var(--text-3xl)] font-bold text-foreground">
              {t.calcTitle}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-[1.6] max-w-[54ch]">
              {t.calcSubtitle}
            </p>
          </div>

          {/* Slider for Accounts */}
          <div className="space-y-3 bg-secondary/50 p-5 rounded-2xl border border-border/70 shadow-inner">
            <div className="flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <FaGoogleDrive className="size-4 text-sky-500" />
                <span className="text-foreground font-semibold">{t.calcSliderLabel}</span>
              </div>
              <span className="text-primary font-bold text-sm px-2.5 py-0.5 rounded-xl bg-primary/10 border border-primary/30 shadow-sm">
                {accountCount} {t.calcAccounts}
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
              <span>2 {t.calcAccounts} (30 GB)</span>
              <span>5 {t.calcAccounts} (75 GB)</span>
              <span>10 {t.calcAccounts} (150 GB)</span>
            </div>
          </div>

          {/* Workspace Toggle */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-secondary/40 border border-border/70">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-foreground block">
                {t.calcWorkspaceToggle}
              </span>
              <span className="text-[11px] text-muted-foreground block">
                {t.calcWorkspaceDesc}
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

        {/* Right Side: Visual Pool Result */}
        <div className="lg:col-span-5 flex flex-col justify-between p-6 sm:p-7 rounded-2xl bg-secondary/35 border border-border/80 space-y-6 shadow-sm relative overflow-hidden h-full backdrop-blur-xs">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider font-semibold">
              {t.calcResultTitle}
            </span>
            <div className="text-[length:var(--text-4xl)] sm:text-[length:var(--text-5xl)] font-bold text-foreground brand-text-gradient">
              {formattedCapacity}
            </div>
            <p className="text-[11px] text-muted-foreground font-mono">
              {accountCount} {t.calcAccounts} {hasWorkspace ? "+ 1 Workspace Tier" : ""}
            </p>
          </div>

          {/* Segmented Pool Breakdown */}
          <div className="space-y-2.5 pt-4 border-t border-border/70 text-xs font-mono">
            <div className="flex justify-between text-muted-foreground">
              <span>{t.calcBreakdownPersonal} ({accountCount} × 15 GB):</span>
              <span className="font-semibold text-foreground">{freeGB} GB</span>
            </div>
            {hasWorkspace && (
              <div className="flex justify-between text-muted-foreground">
                <span>{t.calcBreakdownWorkspace}:</span>
                <span className="font-semibold text-foreground">2,048 GB</span>
              </div>
            )}
            <div className="flex justify-between text-emerald-500 font-semibold pt-1.5 border-t border-border/40">
              <span>{t.calcEfficiencyLabel}</span>
              <span>{t.calcEfficiencyValue}</span>
            </div>
          </div>

          <Button asChild size="lg" className="w-full font-semibold gap-2 shadow-md mt-auto">
            <Link href="/register">
              {t.calcCta}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </SpotlightCard>
  );
});
