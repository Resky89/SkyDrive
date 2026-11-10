"use client";

import { useState, useMemo, memo } from "react";
import {
  Zap,
  FolderOpen,
  ShieldCheck,
  BarChart2,
  CheckCircle2,
  FileCode,
  FileArchive,
  Image as ImageIcon,
} from "lucide-react";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { useLanguage } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const BentoFeatures = memo(function BentoFeatures() {
  const { t } = useLanguage();
  const [activeStrategy, setActiveStrategy] = useState<string>("balanced");

  const strategies = useMemo(
    () => [
      { id: "balanced", label: t.bento1Strat1Title, desc: t.bento1Strat1Desc },
      { id: "headroom", label: t.bento1Strat2Title, desc: t.bento1Strat2Desc },
      { id: "fastest", label: t.bento1Strat3Title, desc: t.bento1Strat3Desc },
    ],
    [t]
  );

  const securityChecks = useMemo(
    () => [
      { id: "pkce", text: t.bento2Check1 },
      { id: "aes", text: t.bento2Check2 },
      { id: "pipe", text: t.bento2Check3 },
      { id: "refresh", text: t.bento2Check4 },
    ],
    [t]
  );

  const mockFiles = useMemo(
    () => [
      {
        icon: FileArchive,
        name: "Client_Design_Sprint_2026.fig",
        size: "42.8 MB",
        drive: "Secondary Storage Node (2 TB)",
        color: "text-indigo-500",
      },
      {
        icon: ImageIcon,
        name: "Render_Hero_Atmosphere_4K.exr",
        size: "1.2 GB",
        drive: "Archive Storage Node (100 GB)",
        color: "text-sky-500",
      },
      {
        icon: FileCode,
        name: "skydrive-core-engine.tar.gz",
        size: "8.4 MB",
        drive: "Primary Storage Node (15 GB)",
        color: "text-emerald-500",
      },
    ],
    []
  );

  return (
    <div className="space-y-4">
      {/* Top Row: 2 Col Asymmetric (60% / 40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Card 1 (7 Cols): Smart Ingestion Engine */}
        <SpotlightCard className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="size-10 rounded-2xl bg-gradient-to-br from-sky-500/20 to-blue-600/20 border border-primary/30 flex items-center justify-center text-primary shadow-inner">
                <Zap className="size-5" />
              </div>
            </div>
            <h3 className="text-[length:var(--text-xl)] sm:text-[length:var(--text-2xl)] font-bold text-foreground">
              {t.bento1Title}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-[1.55] max-w-[54ch]">
              {t.bento1Desc}
            </p>
          </div>

          {/* Interactive Strategy Selector */}
          <div className="space-y-3 pt-4 border-t border-border/40 mt-auto">
            <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground">
              <span>{t.bento1ModeLabel}</span>
              <span className="text-primary font-semibold uppercase">{activeStrategy}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {strategies.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveStrategy(s.id)}
                  className={cn(
                    "p-3 rounded-2xl border text-left transition-all duration-150 cursor-pointer",
                    activeStrategy === s.id
                      ? "bg-card/90 border-primary text-foreground shadow-md ring-1 ring-primary/30"
                      : "bg-secondary/30 border-border/40 text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                  )}
                >
                  <div className="text-xs font-bold">{s.label}</div>
                  <div className="text-[10px] opacity-70 mt-0.5">{s.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </SpotlightCard>

        {/* Card 2 (5 Cols): Zero-Exposure Security */}
        <SpotlightCard className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="size-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shadow-inner">
              <ShieldCheck className="size-5" />
            </div>
            <h3 className="text-[length:var(--text-xl)] sm:text-[length:var(--text-2xl)] font-bold text-foreground">
              {t.bento2Title}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-[1.55]">
              {t.bento2Desc}
            </p>
          </div>

          {/* Security Checklist pills */}
          <div className="space-y-2.5 pt-4 border-t border-border/40 mt-auto">
            {securityChecks.map((item) => (
              <div key={item.id} className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </SpotlightCard>
      </div>

      {/* Bottom Row: 2 Col Asymmetric (40% / 60%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Card 3 (5 Cols): Real-time Storage Telemetry */}
        <SpotlightCard className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="size-10 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-sky-500/20 border border-primary/30 flex items-center justify-center text-primary shadow-inner">
              <BarChart2 className="size-5" />
            </div>
            <h3 className="text-[length:var(--text-xl)] sm:text-[length:var(--text-2xl)] font-bold text-foreground">
              {t.bento3Title}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-[1.55]">
              {t.bento3Desc}
            </p>
          </div>

          {/* Friendly Storage Capacity & Sync Widget */}
          <div className="p-4 rounded-2xl bg-secondary/30 border border-border/60 backdrop-blur-sm space-y-3 mt-auto">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground font-medium">Status Akun:</span>
              <span className="text-emerald-500 font-semibold flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                {t.bento3SyncHealth}
              </span>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{t.bento3Throughput} 14.2 GB / 45 GB</span>
                <span className="text-foreground font-semibold">30.8 GB Sisa</span>
              </div>
              <div className="h-2.5 rounded-full bg-muted/80 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-sky-500 via-blue-500 to-primary w-[32%] rounded-full" />
              </div>
            </div>
            <div className="text-[11px] text-muted-foreground flex items-center justify-between pt-1.5 border-t border-border/40">
              <span>3 Akun Terhubung</span>
              <span className="text-emerald-500 font-medium">Kapasitas Aman</span>
            </div>
          </div>
        </SpotlightCard>

        {/* Card 4 (7 Cols): Cross-Account File Explorer */}
        <SpotlightCard className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="size-10 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-sky-600/20 border border-primary/30 flex items-center justify-center text-primary shadow-inner">
                <FolderOpen className="size-5" />
              </div>
            </div>
            <h3 className="text-[length:var(--text-xl)] sm:text-[length:var(--text-2xl)] font-bold text-foreground">
              {t.bento4Title}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-[1.55] max-w-[52ch]">
              {t.bento4Desc}
            </p>
          </div>

          {/* Simulated File Explorer Strip */}
          <div className="rounded-2xl bg-secondary/20 border border-border/40 overflow-hidden divide-y divide-border/40 backdrop-blur-sm mt-auto">
            {mockFiles.map((file) => {
              const Icon = file.icon;
              return (
                <div
                  key={file.name}
                  className="p-3 flex items-center justify-between hover:bg-secondary/40 transition-colors text-xs font-mono"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={cn("size-4 shrink-0", file.color)} />
                    <span className="text-foreground font-medium truncate max-w-[200px] sm:max-w-[280px]">
                      {file.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground shrink-0 text-[11px]">
                    <span className="hidden sm:inline px-2 py-0.5 rounded-lg bg-secondary/60 border border-border/50 text-[10px]">
                      {file.drive}
                    </span>
                    <span className="font-semibold text-foreground">{file.size}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </SpotlightCard>
      </div>
    </div>
  );
});
