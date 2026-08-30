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
} from "lucide-react";
import { Header } from "@/components/header";
import { ThemeToggle } from "@/components/theme-toggle";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function SettingsPage() {
  const [defaultStrategy, setDefaultStrategy] = useState("LARGEST_AVAILABLE");
  const [alertThreshold, setAlertThreshold] = useState("90");
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("Preferences updated successfully");
    }, 400);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 pb-16">
      <Header />

      <main className="px-8 py-7 max-w-4xl w-full mx-auto space-y-6 animate-fade-in">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Storage Engine & Application Settings
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure global default allocation algorithms, capacity warnings, and display options.
          </p>
        </div>

        <div className="space-y-4">
          {/* Appearance Card */}
          <Card className="p-5 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground">Appearance Theme</h3>
                <p className="text-xs text-muted-foreground">
                  Toggle between Light Mode (Titanium Studio) and Dark Mode (Deep Obsidian).
                </p>
              </div>
              <ThemeToggle />
            </div>
          </Card>

          {/* Allocation Strategy */}
          <Card className="p-5 space-y-4 shadow-sm">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-foreground">
                Default Upload Allocation Strategy
              </h3>
              <p className="text-xs text-muted-foreground">
                Governs which Google Drive account is selected by default when uploading new files.
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
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between space-y-1 cursor-pointer transition-all ${
                    defaultStrategy === s.id
                      ? "border-primary bg-primary/10 ring-1 ring-primary"
                      : "border-border bg-card hover:bg-accent"
                  }`}
                >
                  <span className={`text-xs font-bold ${defaultStrategy === s.id ? "text-primary" : "text-foreground"}`}>
                    {s.label}
                  </span>
                  <span className="text-[11px] text-muted-foreground">{s.desc}</span>
                </button>
              ))}
            </div>
          </Card>

          {/* Capacity Alert Threshold */}
          <Card className="p-5 space-y-4 shadow-sm">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-foreground">
                Capacity Warning Threshold
              </h3>
              <p className="text-xs text-muted-foreground">
                Trigger warning notifications and reroute priority when a storage account reaches this percentage.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <input
                type="range"
                min="50"
                max="95"
                step="5"
                value={alertThreshold}
                onChange={(e) => setAlertThreshold(e.target.value)}
                className="flex-1 cursor-pointer accent-primary"
              />
              <span className="font-mono text-sm font-bold text-foreground w-12 text-right">
                {alertThreshold}%
              </span>
            </div>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end pt-2">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="gap-1.5 shadow-sm text-xs font-semibold"
            >
              <Save className="size-3.5" />
              <span>{saving ? "Saving..." : "Save Preferences"}</span>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
