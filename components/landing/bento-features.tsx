"use client";

import { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { useLanguage } from "@/lib/i18n";

export function BentoFeatures() {
  const { t } = useLanguage();
  const [activeStrategy, setActiveStrategy] = useState<string>("balanced");

  return (
    <div className="space-y-4">
      {/* Top Row: 2 Col Asymmetric (60% / 40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Card 1 (7 Cols): Smart Ingestion Engine */}
        <SpotlightCard className="lg:col-span-7 flex flex-col justify-between space-y-6 relative group">
          <div className="space-y-3 relative z-10">
            <div className="flex items-center justify-between">
              <div className="size-10 rounded-2xl bg-gradient-to-br from-sky-500/20 to-blue-600/20 border border-primary/30 flex items-center justify-center text-primary shadow-inner">
                <Zap className="size-5" />
              </div>
              <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary bg-primary/5">
                {t.bento1Tag}
              </Badge>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
              {t.bento1Title}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-[54ch]">
              {t.bento1Desc}
            </p>
          </div>

          {/* Interactive Strategy Selector */}
          <div className="space-y-3 pt-4 border-t border-border/60 relative z-10">
            <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
              <span>{t.bento1ModeLabel}</span>
              <span className="text-primary font-semibold uppercase">{activeStrategy}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "balanced", label: t.bento1Strat1Title, desc: t.bento1Strat1Desc },
                { id: "headroom", label: t.bento1Strat2Title, desc: t.bento1Strat2Desc },
                { id: "fastest", label: t.bento1Strat3Title, desc: t.bento1Strat3Desc },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveStrategy(s.id)}
                  className={`p-3 rounded-2xl border text-left transition-all duration-150 cursor-pointer ${
                    activeStrategy === s.id
                      ? "bg-card border-primary text-foreground shadow-md ring-1 ring-primary/30"
                      : "bg-secondary/40 border-border/60 text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  <div className="text-xs font-bold">{s.label}</div>
                  <div className="text-[10px] opacity-70 mt-0.5">{s.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </SpotlightCard>

        {/* Card 2 (5 Cols): Zero-Exposure Security */}
        <SpotlightCard className="lg:col-span-5 flex flex-col justify-between space-y-6 relative group">
          <div className="space-y-3">
            <div className="size-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shadow-inner">
              <ShieldCheck className="size-5" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
              {t.bento2Title}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {t.bento2Desc}
            </p>
          </div>

          {/* Security Checklist pills */}
          <div className="space-y-2.5 pt-4 border-t border-border/60">
            {[
              t.bento2Check1,
              t.bento2Check2,
              t.bento2Check3,
              t.bento2Check4,
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </SpotlightCard>
      </div>

      {/* Bottom Row: 2 Col Asymmetric (40% / 60%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Card 3 (5 Cols): Real-time Storage Telemetry */}
        <SpotlightCard className="lg:col-span-5 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="size-10 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-sky-500/20 border border-primary/30 flex items-center justify-center text-primary shadow-inner">
              <BarChart2 className="size-5" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
              {t.bento3Title}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {t.bento3Desc}
            </p>
          </div>

          {/* Telemetry preview widget */}
          <div className="p-4 rounded-2xl bg-secondary/50 border border-border/60 space-y-3">
            <div className="flex justify-between items-center text-[11px] font-mono">
              <span className="text-muted-foreground">Status:</span>
              <span className="text-emerald-500 font-semibold flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-emerald-500" />
                {t.bento3SyncHealth}
              </span>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
                <span>{t.bento3Throughput}</span>
                <span className="text-foreground font-semibold">148.6 MB/s</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-600 w-4/5 rounded-full" />
              </div>
            </div>
          </div>
        </SpotlightCard>

        {/* Card 4 (7 Cols): Cross-Account File Explorer */}
        <SpotlightCard className="lg:col-span-7 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="size-10 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-sky-600/20 border border-primary/30 flex items-center justify-center text-primary shadow-inner">
                <FolderOpen className="size-5" />
              </div>
              <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary bg-primary/5">
                {t.bento4Tag}
              </Badge>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
              {t.bento4Title}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-[52ch]">
              {t.bento4Desc}
            </p>
          </div>

          {/* Simulated File Explorer Strip */}
          <div className="rounded-2xl bg-card/80 border border-border/80 overflow-hidden divide-y divide-border/60">
            {[
              {
                icon: FileArchive,
                name: "Client_Design_Sprint_2026.fig",
                size: "42.8 MB",
                drive: "Workspace Drive (2 TB)",
                color: "text-indigo-500",
              },
              {
                icon: ImageIcon,
                name: "Render_Hero_Atmosphere_4K.exr",
                size: "1.2 GB",
                drive: "Media Vault Drive (100 GB)",
                color: "text-sky-500",
              },
              {
                icon: FileCode,
                name: "skydrive-core-engine.tar.gz",
                size: "8.4 MB",
                drive: "Personal Drive (15 GB)",
                color: "text-emerald-500",
              },
            ].map((file) => {
              const Icon = file.icon;
              return (
                <div
                  key={file.name}
                  className="p-3 flex items-center justify-between hover:bg-secondary/50 transition-colors text-xs font-mono"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`size-4 ${file.color} shrink-0`} />
                    <span className="text-foreground font-medium truncate max-w-[200px] sm:max-w-[280px]">
                      {file.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground shrink-0 text-[11px]">
                    <span className="hidden sm:inline px-2 py-0.5 rounded-lg bg-secondary border border-border/60 text-[10px]">
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
}
