"use client";

import { useState } from "react";
import {
  Settings,
  Shield,
  Sliders,
  Bell,
  HardDrive,
  Save,
  CheckCircle2,
  Globe,
  Check,
} from "lucide-react";
import { Header } from "@/components/header";
import { ThemeToggle } from "@/components/theme-toggle";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useLanguage, LANGUAGES, Language } from "@/lib/i18n";
import { CountryFlag } from "@/components/ui/country-flag";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { language, setLanguage, t } = useLanguage();
  const [defaultStrategy, setDefaultStrategy] = useState("LARGEST_AVAILABLE");
  const [alertThreshold, setAlertThreshold] = useState("90");
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success(
        language === "id"
          ? "Pengaturan berhasil disimpan"
          : language === "ja"
          ? "設定が正常に保存されました"
          : language === "zh"
          ? "设置已成功保存"
          : language === "ko"
          ? "설정이 성공적으로 저장되었습니다"
          : "Preferences updated successfully"
      );
    }, 400);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 pb-16">
      <Header />

      <main className="px-6 sm:px-8 py-7 max-w-4xl w-full mx-auto space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            {t.settingsTitle}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t.settingsSubtitle}
          </p>
        </div>

        <div className="space-y-4">
          {/* Language Selection Card */}
          <SpotlightCard className="p-5 sm:p-6 space-y-4 border border-border/80 shadow-md">
            <div className="flex items-center gap-2">
              <Globe className="size-4 text-primary" />
              <div>
                <h3 className="text-sm font-bold text-foreground">{t.languageTitle}</h3>
                <p className="text-xs text-muted-foreground">
                  {t.languageDesc}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-2">
              {LANGUAGES.map((lang) => {
                const isSelected = language === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      setLanguage(lang.code);
                      toast.success(`Language set to ${lang.nativeName}`);
                    }}
                    className={cn(
                      "p-3 rounded-2xl border text-left flex flex-col justify-between space-y-1.5 cursor-pointer transition-all duration-200",
                      isSelected
                        ? "border-primary bg-primary/15 ring-2 ring-primary/40 shadow-sm"
                        : "border-border/80 bg-secondary/40 hover:bg-secondary hover:border-border"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <CountryFlag code={lang.code} className="w-7 h-5 shadow-xs" />
                      {isSelected && <Check className="size-3.5 text-primary" />}
                    </div>
                    <div>
                      <span className={cn("text-xs font-bold block", isSelected ? "text-primary" : "text-foreground")}>
                        {lang.nativeName}
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {lang.name}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </SpotlightCard>

          {/* Appearance Card */}
          <SpotlightCard className="p-5 sm:p-6 space-y-3 border border-border/80 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground">{t.appearanceTitle}</h3>
                <p className="text-xs text-muted-foreground">
                  {t.appearanceDesc}
                </p>
              </div>
              <ThemeToggle />
            </div>
          </SpotlightCard>

          {/* Allocation Strategy */}
          <SpotlightCard className="p-5 sm:p-6 space-y-4 border border-border/80 shadow-md">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-foreground">
                {t.allocationTitle}
              </h3>
              <p className="text-xs text-muted-foreground">
                {t.allocationDesc}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: "LARGEST_AVAILABLE", label: "Largest Free Space", desc: "Selects drive with most free bytes" },
                { id: "LEAST_USED", label: "Least Used %", desc: "Selects drive with lowest percentage" },
                { id: "BALANCED", label: "Round-Robin", desc: "Evenly balances files across all accounts" },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setDefaultStrategy(s.id)}
                  className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between space-y-1 cursor-pointer transition-all ${
                    defaultStrategy === s.id
                      ? "border-primary bg-primary/15 ring-2 ring-primary/40 shadow-sm"
                      : "border-border/80 bg-secondary/40 hover:bg-secondary"
                  }`}
                >
                  <span className={`text-xs font-bold ${defaultStrategy === s.id ? "text-primary" : "text-foreground"}`}>
                    {s.label}
                  </span>
                  <span className="text-[11px] text-muted-foreground">{s.desc}</span>
                </button>
              ))}
            </div>
          </SpotlightCard>

          {/* Capacity Alert Threshold */}
          <SpotlightCard className="p-5 sm:p-6 space-y-4 border border-border/80 shadow-md">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-foreground">
                {t.alertTitle}
              </h3>
              <p className="text-xs text-muted-foreground">
                {t.alertDesc}
              </p>
            </div>

            <div className="flex items-center gap-4 pt-1">
              <input
                type="range"
                min="70"
                max="98"
                step="2"
                value={alertThreshold}
                onChange={(e) => setAlertThreshold(e.target.value)}
                className="w-64 accent-primary cursor-pointer h-2 bg-secondary rounded-lg"
              />
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-xl bg-secondary border border-border text-foreground">
                {alertThreshold}%
              </span>
            </div>
          </SpotlightCard>

          {/* Save Button */}
          <div className="pt-2 flex justify-end">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="gap-2 px-6 shadow-md font-semibold"
            >
              <Save className="size-4" />
              <span>{saving ? "Saving..." : t.saveBtn}</span>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
