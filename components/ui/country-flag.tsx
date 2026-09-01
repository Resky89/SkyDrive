import React from "react";
import { cn } from "@/lib/utils";
import { Language } from "@/lib/i18n";

interface CountryFlagProps {
  code: Language;
  className?: string;
}

const FLAG_MAP: Record<Language, { src: string; alt: string }> = {
  id: { src: "/flags/id.svg", alt: "Bendera Indonesia" },
  en: { src: "/flags/gb.svg", alt: "United Kingdom Flag" },
  ja: { src: "/flags/jp.svg", alt: "Japanese Flag" },
  zh: { src: "/flags/cn.svg", alt: "Chinese Flag" },
  ko: { src: "/flags/kr.svg", alt: "South Korean Flag" },
};

export function CountryFlag({ code, className }: CountryFlagProps) {
  const flag = FLAG_MAP[code] || FLAG_MAP.id;

  return (
    <span
      className={cn(
        "relative inline-flex items-center justify-center rounded-[3px] overflow-hidden shrink-0 border border-black/15 dark:border-white/20 shadow-2xs aspect-[4/3]",
        className
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={flag.src}
        alt={flag.alt}
        className="w-full h-full object-cover select-none pointer-events-none"
        loading="eager"
      />
    </span>
  );
}
