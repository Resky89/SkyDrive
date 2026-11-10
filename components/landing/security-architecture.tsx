"use client";

import { useState, memo } from "react";
import {
  ShieldCheck,
  Lock,
  Server,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Database,
  KeyRound,
  Check,
  Laptop,
  Cloud,
  Sparkles,
} from "lucide-react";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { useLanguage } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type SecurityTab = "data-plane" | "token-vault" | "comparison";

export const SecurityArchitecture = memo(function SecurityArchitecture() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<SecurityTab>("data-plane");

  return (
    <div className="space-y-8 font-sans">
      {/* ── Section Title (Clean, Anti-Slop, No Badge) ── */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
          {t.secTitle}
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          {t.secDesc}
        </p>
      </div>

      {/* ── Interactive Architecture Card ── */}
      <SpotlightCard className="p-6 sm:p-9 border border-border/80 relative overflow-hidden shadow-2xl">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between pb-6 mb-8 border-b border-border/60 gap-4">
          <div className="flex items-center gap-2 p-1 rounded-xl bg-secondary/80 border border-border">
            <button
              type="button"
              onClick={() => setActiveTab("data-plane")}
              className={cn(
                "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5",
                activeTab === "data-plane"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Server className="size-3.5" />
              <span>Aliran Data Langsung</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("token-vault")}
              className={cn(
                "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5",
                activeTab === "token-vault"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <KeyRound className="size-3.5" />
              <span>Privasi & Izin Google</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("comparison")}
              className={cn(
                "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5",
                activeTab === "comparison"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <ShieldCheck className="size-3.5" />
              <span>Perbandingan Keamanan</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-500">
            <span className="size-2 rounded-full bg-emerald-500 shadow-xs" />
            <span>100% Proteksi Google Drive</span>
          </div>
        </div>

        {/* ── Tab 1: Aliran Data Langsung ── */}
        {activeTab === "data-plane" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Pillar 1 */}
              <div className="p-5 rounded-2xl bg-secondary/30 border border-border/70 space-y-3">
                <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Server className="size-5" />
                </div>
                <h4 className="text-sm font-bold text-foreground">File Langsung ke Akun Anda</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  File yang Anda upload langsung dikirim ke akun Google Drive Anda. SkyDrive tidak pernah menyimpan salinan fisik file di server perantara.
                </p>
                <div className="text-[11px] text-emerald-500 font-semibold pt-2 border-t border-border/50 flex items-center gap-1.5">
                  <Check className="size-3" />
                  <span>Nol penyimpanan sementara</span>
                </div>
              </div>

              {/* Pillar 2 */}
              <div className="p-5 rounded-2xl bg-secondary/30 border border-border/70 space-y-3">
                <div className="size-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-500">
                  <ShieldCheck className="size-5" />
                </div>
                <h4 className="text-sm font-bold text-foreground">Akses Izin Minimal</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  SkyDrive hanya meminta izin untuk mengelola file yang Anda upload di sini. Kami sama sekali tidak bisa membaca email Gmail, kontak, atau file pribadi lainnya.
                </p>
                <div className="text-[11px] text-sky-500 font-semibold pt-2 border-t border-border/50 flex items-center gap-1.5">
                  <Check className="size-3" />
                  <span>Izin terbatas drive.file</span>
                </div>
              </div>

              {/* Pillar 3 */}
              <div className="p-5 rounded-2xl bg-secondary/30 border border-border/70 space-y-3">
                <div className="size-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
                  <Database className="size-5" />
                </div>
                <h4 className="text-sm font-bold text-foreground">Privasi Sepenuhnya Terjaga</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Hanya informasi nama file dan ukuran yang ditampilkan di dashboard untuk pencarian mudah. Isi dokumen Anda tidak pernah diintip ataupun dijual.
                </p>
                <div className="text-[11px] text-indigo-500 font-semibold pt-2 border-t border-border/50 flex items-center gap-1.5">
                  <Check className="size-3" />
                  <span>File Anda tetap milik Anda</span>
                </div>
              </div>
            </div>

            {/* Visual Stream Pipe Diagram (Clean & Human-friendly) */}
            <div className="p-5 rounded-2xl bg-secondary/20 border border-border/60 text-xs text-muted-foreground">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/50 text-[11px]">
                <span className="font-semibold text-foreground">Alur Pengunggahan File Anda:</span>
                <span className="text-emerald-500 font-medium">Jalur Aman & Terenkripsi</span>
              </div>

              <div className="flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4 py-2 w-full">
                {/* Step 1 */}
                <div className="flex-1 w-full p-4 rounded-xl bg-card/80 border border-border flex items-center gap-3 text-left shadow-xs">
                  <div className="size-9 rounded-lg bg-secondary flex items-center justify-center shrink-0 text-muted-foreground">
                    <Laptop className="size-4.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wide">
                      1. Perangkat Anda
                    </span>
                    <span className="font-semibold text-foreground text-xs sm:text-sm block truncate">
                      Pilih File untuk Diunggah
                    </span>
                  </div>
                </div>

                {/* Connector 1 */}
                <div className="shrink-0 text-primary flex items-center justify-center p-1">
                  <ArrowRight className="size-4 rotate-90 md:rotate-0" />
                </div>

                {/* Step 2 */}
                <div className="flex-1 w-full p-4 rounded-xl bg-primary/10 border border-primary/30 flex items-center gap-3 text-left shadow-xs">
                  <div className="size-9 rounded-lg bg-primary/15 flex items-center justify-center shrink-0 text-primary">
                    <Sparkles className="size-4.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-primary/90 block text-[10px] uppercase font-bold tracking-wide">
                      2. SkyDrive Smart Hub
                    </span>
                    <span className="font-semibold text-foreground text-xs sm:text-sm block truncate">
                      Arahkan ke Drive Terluang
                    </span>
                  </div>
                </div>

                {/* Connector 2 */}
                <div className="shrink-0 text-emerald-500 flex items-center justify-center p-1">
                  <ArrowRight className="size-4 rotate-90 md:rotate-0" />
                </div>

                {/* Step 3 */}
                <div className="flex-1 w-full p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center gap-3 text-left shadow-xs">
                  <div className="size-9 rounded-lg bg-emerald-500/15 flex items-center justify-center shrink-0 text-emerald-500">
                    <Cloud className="size-4.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-emerald-500 block text-[10px] uppercase font-bold tracking-wide">
                      3. Google Drive Anda
                    </span>
                    <span className="font-semibold text-foreground text-xs sm:text-sm block truncate">
                      Tersimpan Aman di Google
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Tab 2: Privasi & Izin Google (Layman Friendly Trust Cards) ── */}
        {activeTab === "token-vault" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* Card 1: Jaminan Privasi */}
            <div className="p-6 rounded-2xl bg-secondary/30 border border-border/70 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="size-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                  <Lock className="size-5" />
                </div>
                <h4 className="text-lg font-bold text-foreground">Perlindungan Kunci Enkripsi Standar Tinggi</h4>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Setiap kunci integrasi akun Google Anda diamankan menggunakan enkripsi berlapis AES-256 (standar yang dipakai perbankan). Data akses Anda tidak dapat dibuka oleh pihak luar.
                </p>
              </div>

              <div className="space-y-2.5 pt-4 border-t border-border/60 text-xs">
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                  <span>Kunci terenkripsi otomatis sebelum disimpan</span>
                </div>
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                  <span>Tidak ada kunci mentah yang dapat diakses sembarang staf</span>
                </div>
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                  <span>Sistem otentikasi resmi langsung dari Google</span>
                </div>
              </div>
            </div>

            {/* Card 2: Kontrol Pengguna */}
            <div className="p-6 rounded-2xl bg-secondary/30 border border-border/70 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="size-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-500">
                  <KeyRound className="size-5" />
                </div>
                <h4 className="text-lg font-bold text-foreground">Kendali Penuh Selalu di Tangan Anda</h4>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  SkyDrive tidak pernah meminta kata sandi Anda. Anda login langsung melalui sistem keamanan Google, dan Anda bebas memutuskan akun kapan saja.
                </p>
              </div>

              <div className="space-y-2.5 pt-4 border-t border-border/60 text-xs">
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <CheckCircle2 className="size-4 text-sky-500 shrink-0" />
                  <span>1-Klik putuskan akun langsung dari dashboard</span>
                </div>
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <CheckCircle2 className="size-4 text-sky-500 shrink-0" />
                  <span>Bisa dicabut kapan pun lewat myaccount.google.com</span>
                </div>
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <CheckCircle2 className="size-4 text-sky-500 shrink-0" />
                  <span>File di Google Drive Anda tetap 100% utuh</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Tab 3: Perbandingan Keamanan ── */}
        {activeTab === "comparison" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Layanan Cloud Konvensional */}
            <div className="p-5 sm:p-6 rounded-2xl bg-destructive/5 border border-destructive/20 space-y-4">
              <div className="flex items-center gap-2 text-destructive font-bold text-sm">
                <XCircle className="size-4.5" />
                <span>Penyedia Cloud Agregator Biasa</span>
              </div>

              <div className="space-y-3 text-xs sm:text-sm text-muted-foreground">
                <div className="flex items-start gap-2.5">
                  <XCircle className="size-4 text-destructive shrink-0 mt-0.5" />
                  <span>File Anda ditampung dulu di hard drive server perantara sebelum dikirim.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <XCircle className="size-4 text-destructive shrink-0 mt-0.5" />
                  <span>Risiko file bocor atau tertinggal jika server mereka mengalami masalah.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <XCircle className="size-4 text-destructive shrink-0 mt-0.5" />
                  <span>Sering meminta izin akses penuh ke seluruh isi akun Google Anda.</span>
                </div>
              </div>
            </div>

            {/* SkyDrive Way */}
            <div className="p-5 sm:p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/25 space-y-4">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="size-4.5" />
                <span>Pendekatan Aman SkyDrive</span>
              </div>

              <div className="space-y-3 text-xs sm:text-sm text-muted-foreground">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>File langsung mengalir dari browser Anda ke Google Drive tanpa mampir ke server fisik kami.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Kunci enkripsi aman dan akses dapat diputus kapan saja dengan 1 klik.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Hanya mengelola file yang diunggah melalui SkyDrive; file pribadi lainnya tidak disentuh.</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </SpotlightCard>
    </div>
  );
});
