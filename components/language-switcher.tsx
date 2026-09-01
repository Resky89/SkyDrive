"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { useLanguage, LANGUAGES, Language } from "@/lib/i18n";
import { CountryFlag } from "@/components/ui/country-flag";
import { cn } from "@/lib/utils";

interface LanguageSwitcherProps {
  className?: string;
  variant?: "ghost" | "outline" | "pill";
}

export function LanguageSwitcher({ className, variant = "pill" }: LanguageSwitcherProps) {
  const { language, setLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const current = LANGUAGES.find((l) => l.code === language) || LANGUAGES[1];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={cn("relative inline-block text-left", className)} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "inline-flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium rounded-xl transition-all cursor-pointer select-none",
          variant === "pill" &&
            "bg-secondary/60 hover:bg-secondary border border-border/80 text-foreground shadow-xs hover:border-border",
          variant === "outline" &&
            "border border-border bg-card hover:bg-secondary text-foreground shadow-xs",
          variant === "ghost" &&
            "hover:bg-secondary text-muted-foreground hover:text-foreground"
        )}
        aria-label="Change Language"
        title={current.nativeName}
      >
        <CountryFlag code={current.code} className="w-5 h-3.5" />
        <ChevronDown className={cn("size-3 text-muted-foreground transition-transform duration-200", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-2xl glass-panel border border-border/80 p-1.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-2.5 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground border-b border-border/60 mb-1">
            {t.labelLanguage}
          </div>
          <div className="space-y-0.5">
            {LANGUAGES.map((lang) => {
              const isSelected = lang.code === language;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    setLanguage(lang.code);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-xl transition-colors cursor-pointer text-left",
                    isSelected
                      ? "bg-primary/15 text-primary font-bold"
                      : "text-foreground hover:bg-secondary/80"
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <CountryFlag code={lang.code} className="w-5 h-3.5 shrink-0" />
                    <div className="flex flex-col min-w-0">
                      <span className="leading-tight font-medium truncate">{lang.nativeName}</span>
                      <span className="text-[9px] font-mono text-muted-foreground truncate">{lang.name}</span>
                    </div>
                  </div>
                  {isSelected && <Check className="size-3.5 text-primary shrink-0 ml-1.5" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
