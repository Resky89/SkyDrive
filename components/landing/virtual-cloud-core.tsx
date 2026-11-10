"use client";

import { useState, useRef, useEffect, memo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  RefreshCw,
  CheckCircle2,
  Cpu,
  Layers,
  Terminal,
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

const mockNodes: DriveNode[] = [
  {
    id: "node-1",
    nameKey: "vccPersonalDrive",
    email: "primary.storage@gmail.com",
    tier: "Primary Storage Node (15 GB)",
    used: 12.8,
    total: 15,
    latencyMs: 18,
    health: "warning", // near 90%
    color: "from-sky-500 to-blue-600",
  },
  {
    id: "node-2",
    nameKey: "vccWorkspaceDrive",
    email: "secondary.cloud@gmail.com",
    tier: "High-Capacity Storage Node (2 TB)",
    used: 480,
    total: 2048,
    latencyMs: 12,
    health: "optimal",
    color: "from-blue-600 to-indigo-600",
  },
  {
    id: "node-3",
    nameKey: "vccVaultDrive",
    email: "archive.vault@gmail.com",
    tier: "Archive Storage Node (100 GB)",
    used: 24.5,
    total: 100,
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

const ROUTING_STRATEGIES: StrategyOption[] = [
  {
    id: "best-fit",
    name: "Max Headroom (Best-Fit)",
    tag: "Capacity-Driven",
    desc: "Evaluates real-time drive free capacity and routes directly to the node with the highest available storage space.",
  },
  {
    id: "tiered-spillover",
    name: "Tiered Spillover",
    tag: "Cost-Optimized",
    desc: "Fills primary storage node until 85% safety threshold, then seamlessly overflows into high-capacity secondary storage.",
  },
  {
    id: "round-robin",
    name: "API Rate-Limit Balancing",
    tag: "High-Throughput",
    desc: "Distributes concurrent multipart streams evenly across accounts to evade Google Drive 10 QPS per-user quotas.",
  },
];

const SIMULATION_PAYLOADS = [
  { name: "Raw_Production_Footage.mov", size: "4.2 GB", sizeGB: 4.2, mime: "video/quicktime" },
  { name: "Neural_Weights_Checkpoint.bin", size: "1.4 GB", sizeGB: 1.4, mime: "application/octet-stream" },
  { name: "PostgreSQL_Dump_Archive.sql.gz", size: "320 MB", sizeGB: 0.32, mime: "application/gzip" },
];

export const VirtualCloudCore = memo(function VirtualCloudCore() {
  const { t } = useLanguage();
  const [activeStrategy, setActiveStrategy] = useState<RoutingStrategy>("best-fit");
  const [selectedNode, setSelectedNode] = useState<DriveNode>(mockNodes[1]);
  const [selectedPayload, setSelectedPayload] = useState(SIMULATION_PAYLOADS[0]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [routedNodeId, setRoutedNodeId] = useState<string | null>(null);
  const [telemetryLogs, setTelemetryLogs] = useState<string[]>([
    "SYS_INIT: Multi-Drive Traffic Dispatcher online.",
    "HEALTH: 3 cloud nodes registered via OAuth 2.0 PKCE.",
    "READY: Listening for incoming streaming multipart payloads...",
  ]);

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

    const logPrefix = `[${new Date().toLocaleTimeString("en-US", { hour12: false })}]`;
    setTelemetryLogs((prev) => [
      `${logPrefix} INGEST: Incoming ${payload.name} (${payload.size}, ${payload.mime})`,
      `${logPrefix} EVAL: Strategy [${activeStrategy.toUpperCase()}] assessing 3 Drive pools...`,
      ...prev.slice(0, 4),
    ]);

    timer1Ref.current = setTimeout(() => {
      let target: DriveNode;

      if (activeStrategy === "tiered-spillover") {
        // Node 1 is primary node (used 12.8 / 15 = 85.3% -> triggers spillover!)
        const primary = mockNodes[0];
        if (primary.used + payload.sizeGB > primary.total * 0.85) {
          target = mockNodes[1]; // spillover to secondary high-capacity node
          setTelemetryLogs((prev) => [
            `${logPrefix} SPILLOVER: Primary node at ${((primary.used / primary.total) * 100).toFixed(1)}% capacity. Safety threshold breached!`,
            `${logPrefix} ROUTE: Overflow routed to high-capacity secondary node. Zero drop.`,
            ...prev.slice(0, 4),
          ]);
        } else {
          target = primary;
        }
      } else if (activeStrategy === "round-robin") {
        target = mockNodes[Math.floor(Math.random() * mockNodes.length)];
        setTelemetryLogs((prev) => [
          `${logPrefix} RATE_BALANCER: Dispatched to node [${target.email}] (QPS load: 1.2/10)`,
          ...prev.slice(0, 4),
        ]);
      } else {
        // best-fit: maximum available headroom
        target = mockNodes.reduce((prev, current) =>
          current.total - current.used > prev.total - prev.used ? current : prev
        );
        setTelemetryLogs((prev) => [
          `${logPrefix} BEST_FIT: Selected ${target.email} with ${((target.total - target.used) / 1024).toFixed(2)} TB free headroom.`,
          `${logPrefix} PIPE: Direct in-memory stream active (0 bytes disk written).`,
          ...prev.slice(0, 4),
        ]);
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
            <span className="text-xs font-mono font-bold text-foreground tracking-wider uppercase">
              Autonomous Traffic Dispatch Engine
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-mono text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Cpu className="size-3.5 text-primary" />
            <span>Multi-Drive Pooling</span>
          </div>
          <span className="text-border">|</span>
          <span className="text-emerald-500 font-semibold flex items-center gap-1">
            <CheckCircle2 className="size-3" /> Zero Server Caching
          </span>
        </div>
      </div>

      {/* ── 1. Strategy Selector Tabs (Engineering Controls) ── */}
      <div className="space-y-3 mb-6 relative z-10">
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono font-semibold text-muted-foreground flex items-center gap-1.5">
            <SlidersHorizontal className="size-3.5 text-primary" />
            Active Routing Strategy:
          </span>
          <span className="text-[10px] font-mono text-primary font-medium">
            Dynamic Heuristic Dispatcher
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {ROUTING_STRATEGIES.map((strat) => {
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
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-secondary border border-border/80 text-muted-foreground">
                    {strat.tag}
                  </span>
                </div>
                <p className="text-[10.5px] text-muted-foreground leading-relaxed line-clamp-2">
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

      {/* ── 4. Interactive Ingestion Pipeline & Telemetry Console ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 relative z-10">
        {/* Left: Ingest Trigger Controls */}
        <div className="lg:col-span-5 rounded-2xl bg-secondary/50 border border-border/80 p-4 space-y-3.5 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
              <Zap className="size-3.5 text-primary" />
              <span>Test Streaming Payload Ingestion</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Select a test file to trigger the heuristic router and observe direct in-memory stream allocation.
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
                    "w-full px-3 py-2 rounded-xl border text-xs font-mono flex items-center justify-between transition-all cursor-pointer shadow-2xs",
                    isSelected
                      ? "bg-primary/10 border-primary text-foreground font-semibold"
                      : "bg-card border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                  )}
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    <ArrowRight className="size-3 text-primary shrink-0" />
                    <span className="truncate">{payload.name}</span>
                  </div>
                  <span className="text-[10px] font-semibold text-primary shrink-0">
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
                <span>Routing Stream...</span>
              </>
            ) : (
              <>
                <Zap className="size-3.5" />
                <span>Dispatch Active Payload</span>
              </>
            )}
          </button>
        </div>

        {/* Right: Live Telemetry Terminal */}
        <div className="lg:col-span-7 rounded-2xl bg-neutral-950 border border-neutral-800 p-4 font-mono text-[11px] flex flex-col justify-between shadow-inner min-h-[170px]">
          <div>
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-800 text-neutral-400">
              <div className="flex items-center gap-2">
                <Terminal className="size-3.5 text-emerald-400" />
                <span className="font-bold text-neutral-200">REALTIME DISPATCH TELEMETRY</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px]">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-emerald-400">PIPE ACTIVE</span>
              </div>
            </div>

            <div className="space-y-1.5 text-neutral-300">
              {telemetryLogs.map((log, i) => (
                <div
                  key={i}
                  className={cn(
                    "transition-opacity font-mono leading-relaxed truncate",
                    i === 0 ? "text-emerald-300 font-semibold" : "text-neutral-400"
                  )}
                >
                  <span className="text-neutral-600 mr-1.5">&gt;</span>
                  {log}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2.5 mt-2 border-t border-neutral-800/80 flex items-center justify-between text-[10px] text-neutral-500">
            <span>Buffer: 0 Bytes (Direct Stream)</span>
            <span>Target: {selectedNode.email}</span>
          </div>
        </div>
      </div>
    </SpotlightCard>
  );
});
