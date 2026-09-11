"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, useSpring, useMotionValue } from "framer-motion";
import { Cloud } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardHero3DProps {
  className?: string;
  lightImageSrc?: string;
  darkImageSrc?: string;
}

export const DashboardHero3D: React.FC<DashboardHero3DProps> = ({
  className,
  lightImageSrc = "/dashboard-light.webp",
  darkImageSrc = "/dashboard-dark.webp",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // ── 1. Scroll-driven 3D animation (Levels out & scales up seamlessly as user scrolls) ──
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 85%", "center 45%"],
  });

  const scrollRotateX = useTransform(scrollYProgress, [0, 1], [14, 0]);
  const scrollScale = useTransform(scrollYProgress, [0, 1], [0.93, 1]);
  const scrollTranslateY = useTransform(scrollYProgress, [0, 1], [35, 0]);
  const scrollOpacity = useTransform(scrollYProgress, [0, 0.4], [0.85, 1]);

  // ── 2. Interactive Tactile Cursor 3D Tilt (Apple / Linear style micro-interaction) ──
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 180, mass: 0.6 };
  const mouseTiltX = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]), springConfig);
  const mouseTiltY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn("relative w-full max-w-6xl mx-auto [perspective:1400px]", className)}
    >
      {/* ── 3D Ambient Lighting Glow Behind Frame ── */}
      <div className="absolute -inset-2 sm:-inset-4 bg-gradient-to-tr from-sky-500/20 via-primary/15 to-indigo-500/20 dark:from-sky-500/15 dark:via-blue-600/20 dark:to-indigo-600/20 rounded-[28px] blur-2xl sm:blur-3xl opacity-75 -z-10 pointer-events-none transition-opacity duration-500 group-hover:opacity-100" />

      {/* ── Motion 3D Perspective Card Container ── */}
      <motion.div
        style={{
          rotateX: isHovered ? mouseTiltX : scrollRotateX,
          rotateY: isHovered ? mouseTiltY : 0,
          scale: scrollScale,
          y: scrollTranslateY,
          opacity: scrollOpacity,
          transformStyle: "preserve-3d",
        }}
        transition={{ type: "spring", damping: 20, stiffness: 100 }}
        className="relative rounded-2xl sm:rounded-3xl p-1.5 sm:p-2.5 bg-gradient-to-b from-border/90 via-border/40 to-border/10 dark:from-neutral-700/80 dark:via-neutral-800/40 dark:to-neutral-900/10 border border-border/80 dark:border-neutral-800 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.12)] dark:shadow-[0_30px_90px_-20px_rgba(0,0,0,0.85)] will-change-transform"
      >
        {/* Main Application Window Frame */}
        <div className="overflow-hidden rounded-xl sm:rounded-2xl border border-border/70 dark:border-neutral-800/90 bg-card text-card-foreground shadow-2xl relative">
          
          {/* ── Modern macOS-Style Window Header Bar ── */}
          <div className="flex items-center justify-between px-3 sm:px-5 py-2.5 sm:py-3 border-b border-border/70 dark:border-neutral-800/80 bg-muted/50 dark:bg-neutral-900/80 backdrop-blur-md select-none">
            {/* Window Controls */}
            <div className="flex items-center gap-2 sm:gap-2.5">
              <span className="size-2.5 sm:size-3 rounded-full bg-[#FF5F56] border border-[#E0443E]/50 shadow-2xs" />
              <span className="size-2.5 sm:size-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]/50 shadow-2xs" />
              <span className="size-2.5 sm:size-3 rounded-full bg-[#27C93F] border border-[#1AAB29]/50 shadow-2xs" />
              
              {/* Clean Address Bar Pill */}
              <div className="hidden sm:flex items-center gap-2 ml-3 px-3 py-1 rounded-full bg-background/80 dark:bg-neutral-800/80 border border-border/70 text-[11px] font-mono text-muted-foreground shadow-2xs">
                <Cloud className="size-3 text-sky-500" />
                <span className="font-medium text-foreground">skydrive.app</span>
                <span className="text-muted-foreground/60">/</span>
                <span>dashboard</span>
              </div>
            </div>

            {/* Right Status Badge */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/25 text-[10px] sm:text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-medium">AES-256 E2E Active</span>
              </div>
            </div>
          </div>

          {/* ── Dual Theme Image Viewport (Lossless Crisp Rendering) ── */}
          <div className="relative w-full aspect-[16/9] bg-muted overflow-hidden [transform:translateZ(0)]">
            {/* Light Mode Screenshot */}
            <div className="relative w-full h-full block dark:hidden">
              <Image
                src={lightImageSrc}
                alt="SkyDrive Unified Storage Dashboard (Light Mode)"
                fill
                priority
                unoptimized
                quality={100}
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1200px"
                className="object-cover object-top select-none [image-rendering:-webkit-optimize-contrast] [backface-visibility:hidden] [transform:translateZ(0)]"
              />
            </div>

            {/* Dark Mode Screenshot */}
            <div className="relative w-full h-full hidden dark:block">
              <Image
                src={darkImageSrc}
                alt="SkyDrive Unified Storage Dashboard (Dark Mode)"
                fill
                priority
                unoptimized
                quality={100}
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1200px"
                className="object-cover object-top select-none [image-rendering:-webkit-optimize-contrast] [backface-visibility:hidden] [transform:translateZ(0)]"
              />
            </div>

            {/* Subtle Glass Glare Overlay */}
            <div className="absolute inset-0 z-20 bg-gradient-to-b from-white/10 via-transparent to-black/15 pointer-events-none" />
          </div>
        </div>
      </motion.div>
    </div>
  );
};
