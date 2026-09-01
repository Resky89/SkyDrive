"use client";

import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "right" | "none";
  duration?: number;
}

/**
 * Wraps children in a scroll-triggered reveal.
 * Uses CSS transitions only (transform + opacity) — no library overhead.
 * Reduced motion: skips transform, keeps opacity fade.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  direction = "up",
  duration = 550,
}: RevealProps) {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>({ threshold: 0.12 });

  const translateMap = {
    up: "translate-y-5",
    left: "-translate-x-5",
    right: "translate-x-5",
    none: "",
  };

  return (
    <div
      ref={ref}
      className={cn(
        "motion-safe:transition-[opacity,transform] will-change-[opacity,transform]",
        isVisible
          ? "opacity-100 translate-y-0 translate-x-0"
          : cn("opacity-0", translateMap[direction]),
        className
      )}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: isVisible ? `${delay}ms` : "0ms",
        transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)",
      }}
    >
      {children}
    </div>
  );
}
