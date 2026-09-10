"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  HardDrive,
  ShieldCheck,
  Zap,
  Lock,
  ChevronRight,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { SkyDriveFooter } from "@/components/ui/footer-15";
import { SmoothScrollProvider } from "@/components/smooth-scroll-provider";
import { VirtualCloudCore } from "@/components/landing/virtual-cloud-core";
import { BentoFeatures } from "@/components/landing/bento-features";
import { StorageCalculator } from "@/components/landing/storage-calculator";
import { Particles } from "@/components/ui/particles";
import { Meteors } from "@/components/ui/meteors";
import { LogoMarquee } from "@/components/ui/marquee";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { FaGoogleDrive } from "react-icons/fa6";
import { useLanguage } from "@/lib/i18n";

interface LandingViewProps {
  user?: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
}

export function LandingView({ user }: LandingViewProps) {
  const { t } = useLanguage();

  return (
    <SmoothScrollProvider>
      <div className="min-h-[100dvh] bg-background text-foreground flex flex-col font-sans selection:bg-primary/20 selection:text-primary relative overflow-x-clip">
        {/* Magic UI Interactive Stardust Particles Canvas */}
        <Particles quantity={45} ease={60} size={0.6} staticity={40} className="z-0" />

        {/* Magic UI Meteors (Celestial Streaks Across The Sky) */}
        <Meteors number={16} className="opacity-80" />

        {/* Ambient Atmospheric Cloud Glows */}
        <div className="ambient-sky-orb top-[-100px] left-1/2 -translate-x-1/2 w-[850px] h-[450px] bg-gradient-to-b from-sky-500/20 via-blue-600/10 to-transparent pointer-events-none" />
        <div className="ambient-sky-orb top-[800px] right-[-100px] w-[550px] h-[550px] bg-sky-400/15 pointer-events-none" />
        <div className="ambient-sky-orb top-[1700px] left-[-150px] w-[650px] h-[650px] bg-indigo-600/15 pointer-events-none" />

        {/* ── Fixed Floating Glass AppBar (Without Badge) ── */}
        <header className="sticky top-0 z-40 w-full px-4 sm:px-8 py-3.5 transition-all">
          <div className="max-w-7xl mx-auto rounded-2xl glass-pill px-5 sm:px-6 h-14 flex items-center justify-between border border-border/80 shadow-lg shadow-black/[0.03]">
            {/* Left: Official SkyDrive1 Logo */}
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2 group transition-transform active:scale-95">
                <Image
                  src="/SkyDrive1.svg"
                  alt="SkyDrive"
                  width={130}
                  height={30}
                  priority
                  className="h-7 w-auto object-contain"
                />
              </Link>
            </div>

            {/* Center: Navigation Anchors */}
            <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-muted-foreground">
              <a href="#features" className="hover:text-foreground transition-colors">
                {t.navFeatures}
              </a>
              <a href="#calculator" className="hover:text-foreground transition-colors">
                {t.navCalculator}
              </a>
              <a href="#security" className="hover:text-foreground transition-colors">
                {t.navSecurity}
              </a>
            </nav>

            {/* Right: Controls, Language Switcher, Theme & Auth */}
            <div className="flex items-center gap-2">
              <LanguageSwitcher variant="pill" />
              <ThemeToggle />

              {user ? (
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 pl-2 pr-3.5 py-1 rounded-full bg-primary/10 border border-primary/30 hover:bg-primary/20 transition-all group cursor-pointer shadow-sm ml-1"
                >
                  <Avatar className="size-6 border border-primary/30">
                    {user.image && (
                      <AvatarImage
                        src={user.image}
                        alt={user.name || "User"}
                        referrerPolicy="no-referrer"
                      />
                    )}
                    <AvatarFallback className="text-[9px] font-bold bg-primary text-primary-foreground">
                      {user.name ? getInitials(user.name) : "SD"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                    {t.navDashboard}
                  </span>
                  <ChevronRight className="size-3 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                </Link>
              ) : (
                <div className="flex items-center gap-2 ml-1">
                  <Button asChild variant="ghost" size="sm" className="text-xs h-8.5 font-medium">
                    <Link href="/login">{t.navLogin}</Link>
                  </Button>
                  <Button asChild size="sm" className="text-xs h-8.5 font-semibold px-4 shadow-sm">
                    <Link href="/register">{t.navRegister}</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 space-y-20 sm:space-y-24 relative z-10">
          {/* ── Hero Section (Without Badge, Pure Headline & Drive wording) ── */}
          <section className="relative px-4 sm:px-8 pt-8 sm:pt-14 pb-4 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              {/* Left Column (6 Cols): Bespoke Headline & Value Prop */}
              <div className="lg:col-span-6 space-y-7 relative z-10 text-left">
                {/* Main Headline (Clean, no 'Google' mention) */}
                <h1 className="text-[length:var(--text-4xl)] sm:text-[length:var(--text-5xl)] font-bold text-foreground">
                  {t.heroTitlePart1}
                  <br />
                  <span className="brand-text-gradient">{t.heroTitlePart2}</span>
                  <br />
                  {t.heroTitlePart3}
                </h1>

                {/* Subtitle */}
                <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-[48ch]">
                  {t.heroSubtitle}
                </p>

                {/* Primary Action Buttons with Magic UI Shimmer */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                  {user ? (
                    <>
                      <Button asChild size="lg" className="h-12 px-7 text-sm font-semibold gap-2 shadow-md">
                        <Link href="/dashboard">
                          {t.heroCtaDashboard}
                          <ArrowRight className="size-4" />
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="lg" className="h-12 px-6 text-sm font-medium">
                        <Link href="/dashboard/accounts">{t.heroCtaManage}</Link>
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link href="/register" className="inline-block">
                        <ShimmerButton className="h-12 px-8 text-sm font-semibold gap-2">
                          <span>{t.heroCtaPrimary}</span>
                          <ArrowRight className="size-4" />
                        </ShimmerButton>
                      </Link>
                      <Button asChild variant="outline" size="lg" className="h-12 px-6 text-sm font-medium">
                        <Link href="/login">{t.heroCtaSecondary}</Link>
                      </Button>
                    </>
                  )}
                </div>

                {/* Trust & Architecture Signals */}
                <div className="pt-6 border-t border-border/70 flex flex-wrap items-center gap-6 text-xs font-medium text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="size-4 text-emerald-500" />
                    <span>{t.trustOauth}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <HardDrive className="size-4 text-sky-500" />
                    <span>{t.trustUnlimited}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Lock className="size-4 text-indigo-500" />
                    <span>{t.trustVault}</span>
                  </div>
                </div>
              </div>

              {/* Right Column (6 Cols): Clean Multi-Drive Core Stage */}
              <div className="lg:col-span-6 relative z-10">
                <VirtualCloudCore />
              </div>
            </div>
          </section>

          {/* ── Multi-Cloud Provider Logo Marquee (Google Drive, Dropbox, OneDrive, AWS S3, Cloudflare R2) ── */}
          <div className="w-full border-y border-border/40 bg-secondary/20 backdrop-blur-md overflow-hidden relative z-10 py-3 my-6">
            <LogoMarquee />
          </div>

          {/* ── Section: Bento 2.0 Capabilities ── */}
          <section id="features" className="px-4 sm:px-8 max-w-7xl mx-auto space-y-10">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-sm font-medium text-primary">
                {t.featuresSectionTag}
              </span>
              <h2 className="text-[length:var(--text-3xl)] sm:text-[length:var(--text-4xl)] font-bold text-foreground">
                {t.featuresSectionTitle}
              </h2>
              <p className="text-sm text-muted-foreground leading-[1.65] max-w-[58ch] mx-auto">
                {t.featuresSectionDesc}
              </p>
            </div>

            <BentoFeatures />
          </section>

          {/* ── Section: Storage Pool Capacity Calculator ── */}
          <section id="calculator" className="px-4 sm:px-8 max-w-7xl mx-auto">
            <StorageCalculator />
          </section>

          {/* ── Section: Security & Zero-Exposure Banner ── */}
          <section id="security" className="px-4 sm:px-8 max-w-7xl mx-auto">
            <SpotlightCard className="p-8 sm:p-10 border border-border/80 relative overflow-hidden">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                <div className="flex items-start gap-4 max-w-2xl">
                  <div className="size-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 text-primary mt-1 shadow-inner">
                    <ShieldCheck className="size-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg sm:text-xl font-bold text-foreground">
                      {t.secTitle}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {t.secDesc}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2.5 shrink-0">
                  {["AES-256-GCM", "OAuth 2.0 PKCE", "No File Caching", "Direct API Pipe"].map(
                    (tag) => (
                      <span
                        key={tag}
                        className="text-[11px] font-mono px-3 py-1 rounded-xl bg-secondary/80 border border-border/80 text-foreground font-medium"
                      >
                        {tag}
                      </span>
                    )
                  )}
                </div>
              </div>
            </SpotlightCard>
          </section>
        </main>

        {/* ── Footer ── */}
        <div className="mt-24 sm:mt-32">
          <SkyDriveFooter showCta={!user} ctaHref="/register" />
        </div>
      </div>
    </SmoothScrollProvider>
  );
}
