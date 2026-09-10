"use client";

import { useState, useRef, useEffect, memo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { FaGoogleDrive } from "react-icons/fa6";
import { useLanguage } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface DriveNode {
  id: string;
  nameKey: "vccPersonalDrive" | "vccWorkspaceDrive" | "vccVaultDrive";
  email: string;
  tier: string;
  used: number; // in GB
  total: number; // in GB
  color: string;
}

const mockNodes: DriveNode[] = [
  {
    id: "node-1",
    nameKey: "vccPersonalDrive",
    email: "alex.personal@gmail.com",
    tier: "Personal Drive (15 GB)",
    used: 11.2,
    total: 15,
    color: "from-sky-500 to-blue-600",
  },
  {
    id: "node-2",
    nameKey: "vccWorkspaceDrive",
    email: "alex@workspace-lab.edu",
    tier: "Google Workspace (2 TB)",
    used: 480,
    total: 2048,
    color: "from-blue-600 to-indigo-600",
  },
  {
    id: "node-3",
    nameKey: "vccVaultDrive",
    email: "media.vault@gmail.com",
    tier: "Google One (100 GB)",
    used: 24.5,
    total: 100,
    color: "from-cyan-400 to-sky-500",
  },
];

const SIMULATION_FILES = [
  { name: "Brand_Video_4K.mov", size: "3.8 GB" },
  { name: "SkyDrive_Source.zip", size: "140 MB" },
  { name: "Client_Database.sql", size: "820 MB" },
];

export const VirtualCloudCore = memo(function VirtualCloudCore() {
  const { t } = useLanguage();
  const [selectedNode, setSelectedNode] = useState<DriveNode>(mockNodes[1]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [routedNode, setRoutedNode] = useState<string | null>(null);

  const timer1Ref = useRef<NodeJS.Timeout | null>(null);
  const timer2Ref = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timer1Ref.current) clearTimeout(timer1Ref.current);
      if (timer2Ref.current) clearTimeout(timer2Ref.current);
    };
  }, []);

  // Total pooled calculation
  const totalPooledGB = mockNodes.reduce((acc, n) => acc + n.total, 0);
  const usedPooledGB = mockNodes.reduce((acc, n) => acc + n.used, 0);
  const pooledPct = ((usedPooledGB / totalPooledGB) * 100).toFixed(1);

  const triggerUploadSimulation = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setRoutedNode(null);

    // Smart auto-routing logic
    timer1Ref.current = setTimeout(() => {
      const best = mockNodes.reduce((prev, current) =>
        current.total - current.used > prev.total - prev.used ? current : prev
      );
      setRoutedNode(best.id);
      setSelectedNode(best);

      timer2Ref.current = setTimeout(() => {
        setIsSimulating(false);
      }, 1600);
    }, 600);
  };

  return (
    <SpotlightCard className="p-6 sm:p-8 border border-border/80 shadow-2xl font-sans">
      {/* Subtle ambient corner glows (static) */}
      <div className="absolute -top-16 -right-16 size-48 rounded-full bg-sky-500/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 size-48 rounded-full bg-indigo-600/15 blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-border/60 pb-4 mb-6 relative z-10">
        <div className="flex items-center gap-2.5">
          <span className="relative flex size-2.5">
            <span className="relative inline-flex rounded-full size-2.5 bg-emerald-500" />
          </span>
          <span className="text-[11px] font-mono font-bold text-foreground tracking-wider uppercase">
            Virtual Multi-Drive Core
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary bg-primary/10">
            3 Drives Linked
          </Badge>
          <span className="text-[10px] font-mono text-emerald-500 font-semibold hidden sm:inline">
            AES-256 Armed
          </span>
        </div>
      </div>

      {/* Virtual Storage Aggregation Stage */}
      <div className="relative rounded-2xl bg-secondary/30 border border-border/70 p-5 mb-6 space-y-4">
        {/* Core Cloud Identity */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-2xl bg-primary/10 border border-primary/25 flex items-center justify-center p-2 shadow-inner">
              <Image
                src="/SkyDrive.svg"
                alt="SkyDrive Cloud Engine"
                width={36}
                height={36}
                className="size-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-foreground">{t.vccCoreTitle}</span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                  {t.vccVirtualPool}
                </span>
              </div>
              <span className="text-[11px] font-mono text-muted-foreground">
                {(totalPooledGB / 1024).toFixed(2)} TB {t.vccCombinedVolume}
              </span>
            </div>
          </div>

          <div className="text-right font-mono">
            <span className="text-xs font-bold text-foreground block">
              {pooledPct}% {t.vccUsed}
            </span>
            <span className="text-[10px] text-emerald-500 font-medium">
              {((totalPooledGB - usedPooledGB) / 1024).toFixed(2)} TB {t.vccFree}
            </span>
          </div>
        </div>

        {/* Multi-Account Segmented Gauge */}
        <div className="space-y-1.5">
          <div className="h-3 w-full rounded-full bg-secondary overflow-hidden flex p-0.5 border border-border/60">
            {mockNodes.map((node) => {
              const share = (node.total / totalPooledGB) * 100;
              const isTarget = routedNode === node.id;
              return (
                <div
                  key={node.id}
                  style={{ width: `${share}%` }}
                  className={cn(
                    "h-full rounded-full bg-gradient-to-r mr-1 last:mr-0 transition-all",
                    node.color,
                    isTarget ? "ring-2 ring-white scale-y-110 brightness-125" : "opacity-90"
                  )}
                  title={`${t[node.nameKey]}: ${node.used} GB / ${node.total} GB`}
                />
              );
            })}
          </div>

          <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
            <span>{t.vccPersonalDrive} (15GB)</span>
            <span>{t.vccWorkspaceDrive} (2TB)</span>
            <span>{t.vccVaultDrive} (100GB)</span>
          </div>
        </div>
      </div>

      {/* Active Cloud Nodes Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-6">
        {mockNodes.map((node) => {
          const isSelected = selectedNode.id === node.id;
          const isRouted = routedNode === node.id;
          return (
            <button
              key={node.id}
              onClick={() => setSelectedNode(node)}
              className={cn(
                "p-3 rounded-2xl text-left border transition-all duration-200 cursor-pointer relative overflow-hidden",
                isSelected
                  ? "bg-card border-primary shadow-md shadow-primary/10 ring-1 ring-primary/40"
                  : "bg-card/40 border-border/70 hover:bg-card/80 hover:border-border"
              )}
            >
              {isRouted && (
                <div className="absolute inset-0 bg-primary/15 border-2 border-primary rounded-2xl pointer-events-none" />
              )}
              <div className="flex items-center justify-between mb-1.5">
                <div className="size-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <FaGoogleDrive className="size-3.5" />
                </div>
                <span className="text-[9px] font-mono text-muted-foreground uppercase">
                  {node.tier.split(" ")[0]}
                </span>
              </div>
              <p className="text-xs font-bold text-foreground truncate">{t[node.nameKey]}</p>
              <p className="text-[10px] font-mono text-muted-foreground truncate">{node.email}</p>
              <div className="mt-2 pt-2 border-t border-border/40 flex items-center justify-between text-[10px] font-mono">
                <span className="text-muted-foreground">{t.vccUsed}:</span>
                <span className="font-semibold text-foreground">
                  {node.used > 100 ? `${(node.used / 1024).toFixed(2)} TB` : `${node.used} GB`}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Smart Upload Simulation Sandbox */}
      <div className="rounded-2xl bg-secondary/50 border border-border/80 p-4 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Zap className="size-3.5 text-primary" />
            <span className="font-bold text-foreground text-[11px] uppercase tracking-wider">
              {t.vccSimTitle}
            </span>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground">
            {t.vccSimDesc}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {SIMULATION_FILES.map((file) => (
            <button
              key={file.name}
              disabled={isSimulating}
              onClick={triggerUploadSimulation}
              className="px-3 py-1.5 rounded-xl bg-card border border-border text-xs font-mono flex items-center gap-2 hover:border-primary hover:text-primary transition-all duration-150 active:scale-95 disabled:opacity-50 cursor-pointer shadow-sm"
            >
              <span className="truncate max-w-[130px]">{file.name}</span>
              <span className="text-[10px] text-muted-foreground">{file.size}</span>
            </button>
          ))}
        </div>

        {/* Live Ingest Feedback */}
        <AnimatePresence>
          {isSimulating && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="pt-2 border-t border-border/50 flex items-center justify-between text-[11px] font-mono text-primary"
            >
              <span className="flex items-center gap-1.5">
                <RefreshCw className="size-3 animate-spin text-primary" />
                {t.vccSimAnalyzing}
              </span>
              {routedNode && (
                <span className="text-emerald-500 font-bold flex items-center gap-1">
                  <CheckCircle2 className="size-3" /> {t.vccSimRoutedTo} {t[selectedNode.nameKey]}
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SpotlightCard>
  );
});
