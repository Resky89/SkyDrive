"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  HardDrive,
  ShieldCheck,
  Lock,
  ChevronRight,
  Zap,
  Sparkles,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { SkyDriveFooter } from "@/components/ui/footer-15";
import { SmoothScrollProvider } from "@/components/smooth-scroll-provider";
import { DashboardHero3D } from "@/components/landing/dashboard-hero-3d";
import { VirtualCloudCore } from "@/components/landing/virtual-cloud-core";
import { BentoFeatures } from "@/components/landing/bento-features";
import { StorageCalculator } from "@/components/landing/storage-calculator";
import { LogoMarquee } from "@/components/ui/marquee";
import { SpotlightCard } from "@/components/ui/spotlight-card";
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
        {/* ── Subtle Engineering Dot Grid (Clean, non-AI-slop backdrop) ── */}
        <div className="absolute inset-0 bg-[radial-gradient(hsl(var(--muted-foreground)/0.18)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_65%_45%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-10" />

        {/* ── Refined Atmospheric Horizon Glow ── */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[350px] bg-gradient-to-b from-primary/15 via-sky-500/10 to-transparent blur-3xl rounded-full pointer-events-none -z-10" />

        {/* ── Fixed Floating Glass AppBar ── */}
        <header className="sticky top-0 z-40 w-full px-4 sm:px-8 py-3.5 transition-all">
          <div className="max-w-7xl mx-auto rounded-2xl glass-pill px-5 sm:px-6 h-14 flex items-center justify-between border border-border/80 shadow-lg shadow-black/[0.03]">
            {/* Left: Official SkyDrive Logo */}
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="flex items-center gap-2 group transition-transform active:scale-95"
              >
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
              <a
                href="#preview"
                className="hover:text-foreground transition-colors"
              >
                Dashboard
              </a>
              <a
                href="#features"
                className="hover:text-foreground transition-colors"
              >
                {t.navFeatures}
              </a>
              <a
                href="#routing"
                className="hover:text-foreground transition-colors"
              >
                Smart Engine
              </a>
              <a
                href="#calculator"
                className="hover:text-foreground transition-colors"
              >
                {t.navCalculator}
              </a>
              <a
                href="#security"
                className="hover:text-foreground transition-colors"
              >
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
                  className="flex items-center gap-2 pl-2 pr-3.5 py-1 rounded-full bg-primary/10 border border-primary/30 hover:bg-primary/20 transition-all group cursor-pointer shadow-xs ml-1"
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
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="text-xs h-8.5 font-medium"
                  >
                    <Link href="/login">{t.navLogin}</Link>
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    className="text-xs h-8.5 font-semibold px-4 shadow-xs"
                  >
                    <Link href="/register">{t.navRegister}</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 space-y-20 sm:space-y-28 relative z-10">
          {/* ── Hero Section (Senior Developer / Linear & Vercel Aesthetic) ── */}
          <section className="relative px-4 sm:px-8 pt-10 sm:pt-16 pb-6 max-w-7xl mx-auto text-center">
            {/* High-Impact Master Headline */}
            <div className="max-w-4xl mx-auto space-y-4">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.08]">
                {t.heroTitlePart1}{" "}
                <span className="brand-text-gradient">{t.heroTitlePart2}</span>{" "}
                {t.heroTitlePart3}
              </h1>

              {/* Precise Subtitle */}
              <p className="text-base sm:text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto pt-2">
                {t.heroSubtitle}
              </p>
            </div>

            {/* Action CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              {user ? (
                <>
                  <Button
                    asChild
                    size="lg"
                    className="h-12 px-8 text-sm font-semibold gap-2 shadow-md"
                  >
                    <Link href="/dashboard">
                      {t.heroCtaDashboard}
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="h-12 px-6 text-sm font-medium border-border/80"
                  >
                    <Link href="/dashboard/accounts">{t.heroCtaManage}</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    asChild
                    size="lg"
                    className="h-12 px-8 text-sm font-semibold gap-2 shadow-md bg-foreground text-background hover:bg-foreground/90 transition-all"
                  >
                    <Link href="/register">
                      {t.heroCtaPrimary}
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="h-12 px-6 text-sm font-medium border-border/80 bg-card/50 hover:bg-accent transition-colors"
                  >
                    <Link href="/login">{t.heroCtaSecondary}</Link>
                  </Button>
                </>
              )}
            </div>

            {/* Architectural Trust Signals */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs font-mono text-muted-foreground">
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

            {/* ── 3D Perspective Dashboard Showcase (Dark & Light Adaptive) ── */}
            <div id="preview" className="mt-12 sm:mt-16">
              <DashboardHero3D
                lightImageSrc="/dashboard-light.webp"
                darkImageSrc="/dashboard-dark.webp"
              />
            </div>
          </section>

          {/* ── Multi-Cloud Provider Logo Marquee ── */}
          <div className="w-full border-y border-border/40 bg-secondary/15 backdrop-blur-md overflow-hidden relative z-10 py-3.5">
            <LogoMarquee />
          </div>

          {/* ── Section: Interactive Smart Routing Engine Sandbox ── */}
          <section id="routing" className="px-4 sm:px-8 max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
              <span className="text-xs font-mono uppercase tracking-wider text-primary font-semibold">
                Autonomous Traffic Dispatch
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
                {t.vccSimTitle}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t.vccSimDesc}
              </p>
            </div>

            <VirtualCloudCore />
          </section>

          {/* ── Section: Bento 2.0 Capabilities ── */}
          <section
            id="features"
            className="px-4 sm:px-8 max-w-7xl mx-auto space-y-10"
          >
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-mono uppercase tracking-wider text-primary font-semibold">
                {t.featuresSectionTag}
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
                {t.featuresSectionTitle}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-[58ch] mx-auto">
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
                  {[
                    "AES-256-GCM",
                    "OAuth 2.0 PKCE",
                    "No File Caching",
                    "Direct API Pipe",
                  ].map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] font-mono px-3 py-1 rounded-xl bg-secondary/80 border border-border/80 text-foreground font-medium"
                    >
                      {tag}
                    </span>
                  ))}
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
