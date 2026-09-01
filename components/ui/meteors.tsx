"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface MeteorsProps {
  number?: number;
  className?: string;
}

export function Meteors({ number = 20, className }: MeteorsProps) {
  const [meteorStyles, setMeteorStyles] = useState<Array<React.CSSProperties>>([]);

  useEffect(() => {
    const width = typeof window !== "undefined" ? window.innerWidth : 1400;
    const styles = [...new Array(number)].map(() => ({
      top: `${Math.floor(Math.random() * 500) - 200}px`,
      left: `${Math.floor(Math.random() * (width + 400)) - 100}px`,
      animationDelay: `${(Math.random() * 6).toFixed(2)}s`,
      animationDuration: `${(Math.random() * 4 + 3.5).toFixed(2)}s`,
    }));
    setMeteorStyles(styles);
  }, [number]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-[1]" aria-hidden="true">
      {meteorStyles.map((style, idx) => (
        <span
          key={idx}
          className={cn(
            "animate-meteor pointer-events-none absolute size-1 rotate-[215deg] rounded-full bg-sky-300 shadow-[0_0_8px_1px_#5ab6e7]",
            "before:absolute before:top-1/2 before:h-[1px] before:w-[65px] before:-translate-y-[50%] before:bg-gradient-to-r before:from-sky-400 before:via-sky-300 before:to-transparent before:content-['']",
            className
          )}
          style={style}
        />
      ))}
    </div>
  );
}
