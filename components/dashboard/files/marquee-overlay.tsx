"use client";

import React, { memo } from "react";

interface MarqueeRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface MarqueeOverlayProps {
  isActive: boolean;
  rect: MarqueeRect | null;
}

export const MarqueeOverlay = memo(function MarqueeOverlay({
  isActive,
  rect,
}: MarqueeOverlayProps) {
  if (!isActive || !rect || (rect.width === 0 && rect.height === 0)) {
    return null;
  }

  return (
    <div
      style={{
        left: `${rect.x}px`,
        top: `${rect.y}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
      }}
      className="fixed pointer-events-none z-50 border-2 border-primary/80 bg-primary/20 backdrop-blur-[0.5px] rounded-lg shadow-sm ring-1 ring-primary/30 transition-[border-color] duration-75"
    />
  );
});
