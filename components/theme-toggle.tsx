"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
  variant?: "circle" | "square" | "triangle" | "diamond" | "hexagon" | "rectangle" | "star";
  duration?: number;
}

export function ThemeToggle({
  className,
  variant = "circle",
  duration = 450,
}: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="size-8 rounded-xl border border-border bg-muted/40 opacity-50" />
    );
  }

  const currentTheme = (resolvedTheme || theme) as "light" | "dark";

  return (
    <AnimatedThemeToggler
      theme={currentTheme}
      onThemeChange={(next) => setTheme(next)}
      variant={variant}
      duration={duration}
      title={currentTheme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
      className={cn(
        "size-8 rounded-xl border border-border bg-card hover:bg-accent",
        "flex items-center justify-center transition-colors duration-150",
        "shadow-sm active:scale-95 cursor-pointer text-foreground",
        "[&_svg]:size-4",
        className
      )}
    />
  );
}
