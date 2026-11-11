"use client";

import { useState, memo } from "react";
import {
  ShieldCheck,
  Lock,
  Server,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Database,
  KeyRound,
  Check,
  Laptop,
  Cloud,
  Sparkles,
} from "lucide-react";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { useLanguage } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type SecurityTab = "data-plane" | "token-vault" | "comparison";

export const SecurityArchitecture = memo(function SecurityArchitecture() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<SecurityTab>("data-plane");

  return (
    <div className="space-y-8 font-sans">
      {/* ── Section Title (Clean, Anti-Slop, No Badge) ── */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
          {t.secTitle}
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          {t.secDesc}
        </p>
      </div>

      {/* ── Interactive Architecture Card ── */}
      <SpotlightCard className="p-4 sm:p-7 lg:p-9 border border-border/80 relative overflow-hidden shadow-2xl">
        {/* Navigation Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-border/60 gap-4">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-secondary/80 border border-border overflow-x-auto max-w-full">
            <button
              type="button"
              onClick={() => setActiveTab("data-plane")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shrink-0",
                activeTab === "data-plane"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Server className="size-3.5" />
              <span>{t.secTabDirectFlow}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("token-vault")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shrink-0",
                activeTab === "token-vault"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <KeyRound className="size-3.5" />
              <span>{t.secTabPrivacy}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("comparison")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shrink-0",
                activeTab === "comparison"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <ShieldCheck className="size-3.5" />
              <span>{t.secTabComparison}</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-500 self-start sm:self-auto">
            <span className="size-2 rounded-full bg-emerald-500 shadow-xs" />
            <span>{t.secProtectionBadge}</span>
          </div>
        </div>

        {/* ── Tab 1: Aliran Data Langsung ── */}
        {activeTab === "data-plane" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Pillar 1 */}
              <div className="p-5 rounded-2xl bg-secondary/30 border border-border/70 space-y-3">
                <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Server className="size-5" />
                </div>
                <h4 className="text-sm font-bold text-foreground">{t.secPillar1Title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {t.secPillar1Desc}
                </p>
                <div className="text-[11px] text-emerald-500 font-semibold pt-2 border-t border-border/50 flex items-center gap-1.5">
                  <Check className="size-3" />
                  <span>{t.secPillar1Tag}</span>
                </div>
              </div>

              {/* Pillar 2 */}
              <div className="p-5 rounded-2xl bg-secondary/30 border border-border/70 space-y-3">
                <div className="size-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-500">
                  <ShieldCheck className="size-5" />
                </div>
                <h4 className="text-sm font-bold text-foreground">{t.secPillar2Title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {t.secPillar2Desc}
                </p>
                <div className="text-[11px] text-sky-500 font-semibold pt-2 border-t border-border/50 flex items-center gap-1.5">
                  <Check className="size-3" />
                  <span>{t.secPillar2Tag}</span>
                </div>
              </div>

              {/* Pillar 3 */}
              <div className="p-5 rounded-2xl bg-secondary/30 border border-border/70 space-y-3">
                <div className="size-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
                  <Database className="size-5" />
                </div>
                <h4 className="text-sm font-bold text-foreground">{t.secPillar3Title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {t.secPillar3Desc}
                </p>
                <div className="text-[11px] text-indigo-500 font-semibold pt-2 border-t border-border/50 flex items-center gap-1.5">
                  <Check className="size-3" />
                  <span>{t.secPillar3Tag}</span>
                </div>
              </div>
            </div>

            {/* Visual Stream Pipe Diagram (Clean & Human-friendly) */}
            <div className="p-5 rounded-2xl bg-secondary/20 border border-border/60 text-xs text-muted-foreground">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/50 text-[11px]">
                <span className="font-semibold text-foreground">{t.secFlowTitle}</span>
                <span className="text-emerald-500 font-medium">{t.secFlowBadge}</span>
              </div>

              <div className="flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4 py-2 w-full">
                {/* Step 1 */}
                <div className="flex-1 w-full p-4 rounded-xl bg-card/80 border border-border flex items-center gap-3 text-left shadow-xs">
                  <div className="size-9 rounded-lg bg-secondary flex items-center justify-center shrink-0 text-muted-foreground">
                    <Laptop className="size-4.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wide">
                      {t.secFlowStep1Title}
                    </span>
                    <span className="font-semibold text-foreground text-xs sm:text-sm block truncate">
                      {t.secFlowStep1Desc}
                    </span>
                  </div>
                </div>

                {/* Connector 1 */}
                <div className="shrink-0 text-primary flex items-center justify-center p-1">
                  <ArrowRight className="size-4 rotate-90 md:rotate-0" />
                </div>

                {/* Step 2 */}
                <div className="flex-1 w-full p-4 rounded-xl bg-primary/10 border border-primary/30 flex items-center gap-3 text-left shadow-xs">
                  <div className="size-9 rounded-lg bg-primary/15 flex items-center justify-center shrink-0 text-primary">
                    <Sparkles className="size-4.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-primary/90 block text-[10px] uppercase font-bold tracking-wide">
                      {t.secFlowStep2Title}
                    </span>
                    <span className="font-semibold text-foreground text-xs sm:text-sm block truncate">
                      {t.secFlowStep2Desc}
                    </span>
                  </div>
                </div>

                {/* Connector 2 */}
                <div className="shrink-0 text-emerald-500 flex items-center justify-center p-1">
                  <ArrowRight className="size-4 rotate-90 md:rotate-0" />
                </div>

                {/* Step 3 */}
                <div className="flex-1 w-full p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center gap-3 text-left shadow-xs">
                  <div className="size-9 rounded-lg bg-emerald-500/15 flex items-center justify-center shrink-0 text-emerald-500">
                    <Cloud className="size-4.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-emerald-500 block text-[10px] uppercase font-bold tracking-wide">
                      {t.secFlowStep3Title}
                    </span>
                    <span className="font-semibold text-foreground text-xs sm:text-sm block truncate">
                      {t.secFlowStep3Desc}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Tab 2: Privasi & Izin Google (Layman Friendly Trust Cards) ── */}
        {activeTab === "token-vault" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* Card 1: Jaminan Privasi */}
            <div className="p-6 rounded-2xl bg-secondary/30 border border-border/70 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="size-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                  <Lock className="size-5" />
                </div>
                <h4 className="text-lg font-bold text-foreground">{t.secVaultCard1Title}</h4>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {t.secVaultCard1Desc}
                </p>
              </div>

              <div className="space-y-2.5 pt-4 border-t border-border/60 text-xs">
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                  <span>{t.secVaultCheck1}</span>
                </div>
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                  <span>{t.secVaultCheck2}</span>
                </div>
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                  <span>{t.secVaultCheck3}</span>
                </div>
              </div>
            </div>

            {/* Card 2: Kontrol Pengguna */}
            <div className="p-6 rounded-2xl bg-secondary/30 border border-border/70 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="size-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-500">
                  <KeyRound className="size-5" />
                </div>
                <h4 className="text-lg font-bold text-foreground">{t.secVaultCard2Title}</h4>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {t.secVaultCard2Desc}
                </p>
              </div>

              <div className="space-y-2.5 pt-4 border-t border-border/60 text-xs">
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <CheckCircle2 className="size-4 text-sky-500 shrink-0" />
                  <span>{t.secVaultCheck4}</span>
                </div>
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <CheckCircle2 className="size-4 text-sky-500 shrink-0" />
                  <span>{t.secVaultCheck5}</span>
                </div>
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <CheckCircle2 className="size-4 text-sky-500 shrink-0" />
                  <span>{t.secVaultCheck6}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Tab 3: Perbandingan Keamanan ── */}
        {activeTab === "comparison" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Layanan Cloud Konvensional */}
            <div className="p-5 sm:p-6 rounded-2xl bg-destructive/5 border border-destructive/20 space-y-4">
              <div className="flex items-center gap-2 text-destructive font-bold text-sm">
                <XCircle className="size-4.5" />
                <span>{t.secCompOtherTitle}</span>
              </div>

              <div className="space-y-3 text-xs sm:text-sm text-muted-foreground">
                <div className="flex items-start gap-2.5">
                  <XCircle className="size-4 text-destructive shrink-0 mt-0.5" />
                  <span>{t.secCompOther1}</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <XCircle className="size-4 text-destructive shrink-0 mt-0.5" />
                  <span>{t.secCompOther2}</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <XCircle className="size-4 text-destructive shrink-0 mt-0.5" />
                  <span>{t.secCompOther3}</span>
                </div>
              </div>
            </div>

            {/* SkyDrive Way */}
            <div className="p-5 sm:p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/25 space-y-4">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="size-4.5" />
                <span>{t.secCompSkyDriveTitle}</span>
              </div>

              <div className="space-y-3 text-xs sm:text-sm text-muted-foreground">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{t.secCompSkyDrive1}</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{t.secCompSkyDrive2}</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{t.secCompSkyDrive3}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </SpotlightCard>
    </div>
  );
});
