"use client";

import React, { useRef, useState, useCallback, forwardRef, useImperativeHandle } from "react";
import { cn } from "@/lib/utils";

export interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
}

export const SpotlightCard = forwardRef<HTMLDivElement, SpotlightCardProps>(
  function SpotlightCard(
    {
      children,
      className = "",
      spotlightColor = "rgba(90, 182, 231, 0.22)",
      onMouseMove,
      onFocus,
      onBlur,
      onMouseEnter,
      onMouseLeave,
      ...props
    },
    ref
  ) {
    const divRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => divRef.current as HTMLDivElement);

    const [isFocused, setIsFocused] = useState(false);
    const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [opacity, setOpacity] = useState(0);

    const handleMouseMove = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (!divRef.current || isFocused) return;

        const rect = divRef.current.getBoundingClientRect();
        setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        onMouseMove?.(e);
      },
      [isFocused, onMouseMove]
    );

    const handleFocus = useCallback(
      (e: React.FocusEvent<HTMLDivElement>) => {
        setIsFocused(true);
        setOpacity(0.6);
        onFocus?.(e);
      },
      [onFocus]
    );

    const handleBlur = useCallback(
      (e: React.FocusEvent<HTMLDivElement>) => {
        setIsFocused(false);
        setOpacity(0);
        onBlur?.(e);
      },
      [onBlur]
    );

    const handleMouseEnter = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        setOpacity(0.6);
        onMouseEnter?.(e);
      },
      [onMouseEnter]
    );

    const handleMouseLeave = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        setOpacity(0);
        onMouseLeave?.(e);
      },
      [onMouseLeave]
    );

    return (
      <div
        ref={divRef}
        onMouseMove={handleMouseMove}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={cn(
          "relative rounded-3xl border border-border bg-card text-card-foreground overflow-hidden",
          className
        )}
        {...props}
      >
        {children}
        <div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 ease-in-out z-20"
          style={{
            opacity,
            background: `radial-gradient(circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 80%)`,
          }}
        />
      </div>
    );
  }
);

SpotlightCard.displayName = "SpotlightCard";

export default SpotlightCard;
