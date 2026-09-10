"use client";

import React, { memo } from "react";
import { formatBytes } from "@/lib/utils";
import { useCountUp } from "@/hooks/use-count-up";
import { Progress } from "@/components/ui/progress";

interface AnimatedBytesProps {
  value: number;
  enabled: boolean;
  duration?: number;
  className?: string;
  decimals?: number;
}

export const AnimatedBytes = memo(function AnimatedBytes({
  value,
  enabled,
  duration = 1400,
  className,
  decimals = 2,
}: AnimatedBytesProps) {
  const animated = useCountUp({ end: value, duration, enabled });
  return <span className={className}>{formatBytes(animated, decimals)}</span>;
});

interface AnimatedPctProps {
  value: number;
  enabled: boolean;
  duration?: number;
  className?: string;
}

export const AnimatedPct = memo(function AnimatedPct({
  value,
  enabled,
  duration = 1200,
  className,
}: AnimatedPctProps) {
  const animated = useCountUp({ end: Math.round(value * 100), duration, enabled });
  const display = animated / 100;
  return (
    <span className={className}>
      {display < 1 ? display.toFixed(2) : display.toFixed(1)}%
    </span>
  );
});

interface AnimatedProgressProps {
  value: number;
  enabled: boolean;
  duration?: number;
  indicatorColor?: string;
  className?: string;
}

export const AnimatedProgress = memo(function AnimatedProgress({
  value,
  enabled,
  duration = 1600,
  indicatorColor,
  className,
}: AnimatedProgressProps) {
  const animated = useCountUp({ end: Math.round(value), duration, enabled });
  return (
    <Progress
      value={animated}
      indicatorColor={indicatorColor}
      className={className}
    />
  );
});
