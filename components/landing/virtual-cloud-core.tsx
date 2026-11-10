"use client";

import { useState, useRef, useEffect, memo, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  RefreshCw,
  CheckCircle2,
  Cpu,
  Layers,
  ArrowRight,
  ShieldAlert,
  SlidersHorizontal,
} from "lucide-react";
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
  latencyMs: number;
  health: "optimal" | "warning" | "standby";
  color: string;
}

const DEFAULT_NODES: DriveNode[] = [
  {
    id: "node-1",
    nameKey: "vccPersonalDrive",
    email: "email.utama@gmail.com",
    tier: "Personal Google Account (15 GB)",
    used: 13.8,
    total: 15,
    latencyMs: 18,
    health: "warning",
    color: "from-sky-500 to-blue-600",
  },
  {
    id: "node-2",
    nameKey: "vccWorkspaceDrive",
    email: "email.kantor.kuliah@gmail.com",
    tier: "School / Work Account (2 TB)",
    used: 480,
    total: 2048,
    latencyMs: 12,
    health: "optimal",
    color: "from-blue-600 to-indigo-600",
  },
  {
    id: "node-3",
    nameKey: "vccVaultDrive",
    email: "email.cadangan@gmail.com",
    tier: "Backup Google Account (15 GB)",
    used: 2.5,
    total: 15,
    latencyMs: 15,
    health: "optimal",
    color: "from-cyan-400 to-sky-500",
  },
];

type RoutingStrategy = "best-fit" | "tiered-spillover" | "round-robin";

interface StrategyOption {
  id: RoutingStrategy;
  name: string;
  tag: string;
  desc: string;
}

const SIMULATION_PAYLOADS = [
  { name: "Video_Liburan_Keluarga_4K.mp4", size: "4.2 GB", sizeGB: 4.2, mime: "video/mp4" },
  { name: "Folder_Skripsi_dan_Dokumen_Final.zip", size: "1.4 GB", sizeGB: 1.4, mime: "application/zip" },
  { name: "Koleksi_Foto_Resolusi_Tinggi.zip", size: "680 MB", sizeGB: 0.68, mime: "application/zip" },
];

export const VirtualCloudCore = memo(function VirtualCloudCore() {
  const { t } = useLanguage();

  const mockNodes: DriveNode[] = useMemo(
    () => [
      {
        id: "node-1",
        nameKey: "vccPersonalDrive",
        email: "email.utama@gmail.com",
        tier: t.vccNode1Tier,
        used: 13.8,
        total: 15,
        latencyMs: 18,
        health: "warning",
        color: "from-sky-500 to-blue-600",
      },
      {
        id: "node-2",
        nameKey: "vccWorkspaceDrive",
        email: "email.kantor.kuliah@gmail.com",
        tier: t.vccNode2Tier,
        used: 480,
        total: 2048,
        latencyMs: 12,
        health: "optimal",
        color: "from-blue-600 to-indigo-600",
      },
      {
        id: "node-3",
        nameKey: "vccVaultDrive",
        email: "email.cadangan@gmail.com",
        tier: t.vccNode3Tier,
        used: 2.5,
        total: 15,
        latencyMs: 15,
        health: "optimal",
        color: "from-cyan-400 to-sky-500",
      },
    ],
    [t]
  );

  const routingStrategies: StrategyOption[] = useMemo(
    () => [
      {
        id: "best-fit",
        name: t.vccStrat1Name,
        tag: t.vccStrat1Tag,
        desc: t.vccStrat1Desc,
      },
      {
        id: "tiered-spillover",
        name: t.vccStrat2Name,
        tag: t.vccStrat2Tag,
        desc: t.vccStrat2Desc,
      },
      {
        id: "round-robin",
        name: t.vccStrat3Name,
        tag: t.vccStrat3Tag,
        desc: t.vccStrat3Desc,
      },
    ],
    [t]
  );

  const [activeStrategy, setActiveStrategy] = useState<RoutingStrategy>("best-fit");
  const [selectedNode, setSelectedNode] = useState<DriveNode>(DEFAULT_NODES[1]);
  const [selectedPayload, setSelectedPayload] = useState(SIMULATION_PAYLOADS[0]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [routedNodeId, setRoutedNodeId] = useState<string | null>(null);

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

  const executeRouting = (payload = selectedPayload) => {
    if (isSimulating) return;
    setIsSimulating(true);
    setRoutedNodeId(null);

    timer1Ref.current = setTimeout(() => {
      let target: DriveNode;

      if (activeStrategy === "tiered-spillover") {
        // Node 1 is primary node (used 12.8 / 15 = 85.3% -> triggers spillover!)
        const primary = mockNodes[0];
        if (primary.used + payload.sizeGB > primary.total * 0.85) {
          target = mockNodes[1]; // spillover to secondary high-capacity node
        } else {
          target = primary;
        }
      } else if (activeStrategy === "round-robin") {
        target = mockNodes[Math.floor(Math.random() * mockNodes.length)];
      } else {
        // best-fit: maximum available headroom
        target = mockNodes.reduce((prev, current) =>
          current.total - current.used > prev.total - prev.used ? current : prev
        );
      }

      setRoutedNodeId(target.id);
      setSelectedNode(target);

      timer2Ref.current = setTimeout(() => {
        setIsSimulating(false);
      }, 1200);
    }, 600);
  };

  return (
    <SpotlightCard className="p-6 sm:p-8 border border-border/80 shadow-2xl font-sans">
      {/* Subtle ambient lighting */}
      <div className="absolute -top-16 -right-16 size-48 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 size-48 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/60 pb-4 mb-6 gap-3 relative z-10">
        <div className="flex items-center gap-2.5">
          <span className="size-2 rounded-full bg-emerald-500 shadow-xs shrink-0" />
          <div>
            <span className="text-xs font-bold text-foreground tracking-wide uppercase">
              {t.vccSimHeader}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Cpu className="size-3.5 text-primary" />
            <span>{t.vccMultiAccountBadge}</span>
          </div>
          <span className="text-border">|</span>
          <span className="text-emerald-500 font-semibold flex items-center gap-1">
            <CheckCircle2 className="size-3.5" /> {t.vccDirectBadge}
          </span>
        </div>
      </div>

      {/* ── 1. Strategy Selector Tabs ── */}
      <div className="space-y-3 mb-6 relative z-10">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-muted-foreground flex items-center gap-1.5">
            <SlidersHorizontal className="size-3.5 text-primary" />
            {t.vccStratSelectorLabel}
          </span>
          <span className="text-xs text-primary font-medium">
            {t.vccStratSubLabel}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {routingStrategies.map((strat) => {
            const isActive = activeStrategy === strat.id;
            return (
              <button
                key={strat.id}
                type="button"
                onClick={() => {
                  setActiveStrategy(strat.id);
                  if (!isSimulating) setRoutedNodeId(null);
                }}
                className={cn(
                  "p-3 rounded-xl border text-left transition-all duration-150 cursor-pointer relative overflow-hidden",
                  isActive
                    ? "bg-card border-primary shadow-sm ring-1 ring-primary/40"
                    : "bg-secondary/40 border-border/70 hover:bg-secondary/70 hover:border-border"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={cn("text-xs font-bold", isActive ? "text-primary" : "text-foreground")}>
                    {strat.name}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary border border-border/80 text-muted-foreground">
                    {strat.tag}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                  {strat.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 2. Unified Virtual Storage Pool Overview ── */}
      <div className="rounded-2xl bg-secondary/30 border border-border/70 p-5 mb-6 space-y-4 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-2xl bg-primary/10 border border-primary/25 flex items-center justify-center p-2 shadow-inner shrink-0">
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
              </div>
              <span className="text-[11px] font-mono text-muted-foreground">
                {(totalPooledGB / 1024).toFixed(2)} TB Total Aggregated Capacity across 3 drives
              </span>
            </div>
          </div>

          <div className="text-left sm:text-right font-mono flex sm:flex-col items-center sm:items-end justify-between gap-1">
            <span className="text-xs font-bold text-foreground">
              {pooledPct}% Pooled Allocation
            </span>
            <span className="text-[10px] text-emerald-500 font-medium">
              {((totalPooledGB - usedPooledGB) / 1024).toFixed(2)} TB Unfragmented Headroom
            </span>
          </div>
        </div>

        {/* Multi-Account Segmented Gauge */}
        <div className="space-y-1.5">
          <div className="h-3 w-full rounded-full bg-secondary overflow-hidden flex p-0.5 border border-border/60">
            {mockNodes.map((node) => {
              const share = (node.total / totalPooledGB) * 100;
              const isTarget = routedNodeId === node.id;
              return (
                <div
                  key={node.id}
                  style={{ width: `${share}%` }}
                  className={cn(
                    "h-full rounded-full bg-gradient-to-r mr-1 last:mr-0 transition-all duration-300",
                    node.color,
                    isTarget ? "ring-2 ring-white scale-y-125 brightness-125 shadow-md" : "opacity-90"
                  )}
                  title={`${t[node.nameKey]}: ${node.used} GB / ${node.total} GB`}
                />
              );
            })}
          </div>

          <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
            <span>Node 1 (15 GB)</span>
            <span>Node 2 (2 TB)</span>
            <span>Node 3 (100 GB)</span>
          </div>
        </div>
      </div>

      {/* ── 3. Active Cloud Nodes Topology ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 relative z-10">
        {mockNodes.map((node) => {
          const isSelected = selectedNode.id === node.id;
          const isRouted = routedNodeId === node.id;
          const usagePct = ((node.used / node.total) * 100).toFixed(0);

          return (
            <button
              key={node.id}
              type="button"
              onClick={() => setSelectedNode(node)}
              className={cn(
                "p-3.5 rounded-2xl text-left border transition-all duration-200 cursor-pointer relative overflow-hidden",
                isRouted
                  ? "bg-card border-primary ring-2 ring-primary/50 shadow-lg shadow-primary/10"
                  : isSelected
                  ? "bg-card border-border shadow-xs"
                  : "bg-card/40 border-border/70 hover:bg-card/80 hover:border-border"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="size-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <FaGoogleDrive className="size-3.5" />
                  </div>
                  <span className="text-[10px] font-mono font-semibold text-foreground">
                    Node #{node.id.split("-")[1]}
                  </span>
                </div>
                {isRouted ? (
                  <span className="text-[10px] font-mono font-bold text-primary flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-primary" /> ROUTED
                  </span>
                ) : (
                  <span className="text-[9px] font-mono text-muted-foreground uppercase">
                    {node.latencyMs}ms pipe
                  </span>
                )}
              </div>

              <p className="text-xs font-bold text-foreground truncate">{t[node.nameKey]}</p>
              <p className="text-[10px] font-mono text-muted-foreground truncate">{node.email}</p>

              {/* Node Quota Progress */}
              <div className="mt-2.5 pt-2 border-t border-border/40 space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-muted-foreground">Usage ({usagePct}%):</span>
                  <span className="font-semibold text-foreground">
                    {node.used > 100 ? `${(node.used / 1024).toFixed(2)} TB` : `${node.used} GB`} /{" "}
                    {node.total >= 1024 ? `${node.total / 1024} TB` : `${node.total} GB`}
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div
                    style={{ width: `${usagePct}%` }}
                    className={cn(
                      "h-full rounded-full transition-all",
                      Number(usagePct) >= 85 ? "bg-amber-500" : "bg-primary"
                    )}
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── 4. Interactive Ingestion Pipeline & Visual Status Card ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 relative z-10">
        {/* Left: Ingest Trigger Controls */}
        <div className="lg:col-span-5 rounded-2xl bg-secondary/50 border border-border/80 p-4 space-y-3.5 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
              <Zap className="size-3.5 text-primary" />
              <span>{t.vccSimTestTitle}</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t.vccSimTestDesc}
            </p>
          </div>

          <div className="space-y-2">
            {SIMULATION_PAYLOADS.map((payload) => {
              const isSelected = selectedPayload.name === payload.name;
              return (
                <button
                  key={payload.name}
                  type="button"
                  disabled={isSimulating}
                  onClick={() => {
                    setSelectedPayload(payload);
                    executeRouting(payload);
                  }}
                  className={cn(
                    "w-full px-3 py-2.5 rounded-xl border text-xs flex items-center justify-between transition-all cursor-pointer shadow-2xs",
                    isSelected
                      ? "bg-primary/10 border-primary text-foreground font-semibold"
                      : "bg-card border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                  )}
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    <ArrowRight className="size-3 text-primary shrink-0" />
                    <span className="truncate">{payload.name}</span>
                  </div>
                  <span className="text-xs font-semibold text-primary shrink-0">
                    {payload.size}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            disabled={isSimulating}
            onClick={() => executeRouting()}
            className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs flex items-center justify-center gap-2 shadow-sm hover:bg-primary/90 transition-all cursor-pointer disabled:opacity-50"
          >
            {isSimulating ? (
              <>
                <RefreshCw className="size-3.5 animate-spin" />
                <span>{t.vccSimBtnChecking}</span>
              </>
            ) : (
              <>
                <Zap className="size-3.5" />
                <span>{t.vccSimBtnSubmit}</span>
              </>
            )}
          </button>
        </div>

        {/* Right: Human-Friendly Smart Decision Panel */}
        <div className="lg:col-span-7 rounded-2xl bg-card border border-border p-5 flex flex-col justify-between shadow-sm min-h-[190px]">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-500" />
                <span className="font-bold text-xs text-foreground uppercase tracking-wider">{t.vccDecisionTitle}</span>
              </div>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-medium">
                {t.vccDecisionBadge}
              </span>
            </div>

            {/* Smart Decision Summary Box */}
            <div className="p-3.5 rounded-xl bg-secondary/40 border border-border/70 space-y-2 text-xs">
              <div className="flex items-start gap-2.5">
                <div className="size-2 rounded-full bg-primary mt-1.5 shrink-0" />
                <p className="text-muted-foreground leading-relaxed">
                  <span className="font-semibold text-foreground">{t.vccDecisionFileLabel} </span>
                  <span className="text-foreground">{selectedPayload.name}</span> ({selectedPayload.size})
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="size-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <p className="text-muted-foreground leading-relaxed">
                  <span className="font-semibold text-foreground">{t.vccDecisionTargetLabel} </span>
                  {t.vccDecisionTargetPrefix} <span className="font-semibold text-emerald-600 dark:text-emerald-400">{selectedNode.email}</span> ({selectedNode.tier}) {t.vccDecisionTargetSuffix}
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="size-2 rounded-full bg-sky-500 mt-1.5 shrink-0" />
                <p className="text-muted-foreground leading-relaxed">
                  <span className="font-semibold text-foreground">{t.vccDecisionPrivacyLabel} </span>
                  {t.vccDecisionPrivacyText}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
            <span>{t.vccDecisionProxyNone}</span>
            <span>{t.vccDecisionStatusReady}</span>
          </div>
        </div>
      </div>
    </SpotlightCard>
  );
});
