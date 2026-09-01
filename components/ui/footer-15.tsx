"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { FaArrowRight, FaGithub, FaXTwitter } from "react-icons/fa6";
import { useLanguage } from "@/lib/i18n";

// ── Animation Variants ──────────────────────────────────────────────────────

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.09, delayChildren: 0.05 },
  },
};

const navStagger: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.02 },
  },
};

const riseItem: Variants = {
  hidden: { opacity: 0, y: 18, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { type: "spring", duration: 0.6, bounce: 0 },
  },
};

const linkStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
};

const linkItem: Variants = {
  hidden: { opacity: 0, y: 5 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", duration: 0.4, bounce: 0 },
  },
};

const heroBrandVariant: Variants = {
  hidden: { opacity: 0, y: 40, filter: "blur(12px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { type: "spring", duration: 1.1, bounce: 0 },
  },
};

const ctaVariant: Variants = {
  hidden: { opacity: 0, y: 10, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { type: "spring", duration: 0.5, bounce: 0 },
  },
};

// ── Component ──────────────────────────────────────────────────────────────

interface SkyDriveFooterProps {
  showCta?: boolean;
  ctaHref?: string;
}

export function SkyDriveFooter({
  showCta = true,
  ctaHref = "/register",
}: SkyDriveFooterProps) {
  const { t } = useLanguage();

  const columns = [
    {
      title: t.footerColProducts,
      links: [
        { label: t.navDashboard, href: "/dashboard" },
        { label: t.menuFiles, href: "/dashboard/files" },
        { label: t.menuUploads, href: "/dashboard/uploads" },
        { label: t.menuAnalytics, href: "/dashboard/analytics" },
        { label: t.menuAccounts, href: "/dashboard/accounts" },
      ],
    },
    {
      title: t.footerColResources,
      links: [
        { label: t.footerLinkHowItWorks, href: "#" },
        { label: t.footerLinkSecurity, href: "#security" },
        { label: t.footerLinkFeatures, href: "#features" },
        { label: "GitHub", href: "https://github.com" },
      ],
    },
    {
      title: t.footerColLegal,
      links: [
        { label: t.footerLinkPrivacy, href: "#" },
        { label: t.footerLinkTerms, href: "#" },
      ],
    },
    {
      title: t.footerColSocial,
      links: [
        { label: "GitHub", href: "https://github.com" },
        { label: "Twitter / X", href: "https://twitter.com" },
      ],
    },
  ];

  return (
    <footer className="w-full overflow-hidden rounded-t-[2rem] sm:rounded-t-[2.5rem] md:rounded-t-[3rem] bg-card border border-border font-sans antialiased">
      {/* ── Top section: brand + nav columns ── */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        className="px-8 pt-12 pb-0 sm:px-12 sm:pt-16 lg:px-16 xl:px-20"
      >
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-10 lg:flex-row lg:gap-16 xl:gap-20">
          {/* Brand column */}
          <motion.div
            variants={riseItem}
            className="flex shrink-0 flex-col gap-5 lg:max-w-[240px] xl:max-w-[260px]"
          >
            {/* Logo */}
            <div className="flex items-center">
              <Image
                src="/SkyDrive1.svg"
                alt="SkyDrive"
                width={140}
                height={33}
                className="h-8 w-auto object-contain"
              />
            </div>

            <p className="text-sm leading-[1.65] font-light text-pretty text-muted-foreground">
              {t.footerDesc}
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-2.5 mt-1">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="size-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors duration-200"
              >
                <FaGithub className="size-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter / X"
                className="size-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors duration-200"
              >
                <FaXTwitter className="size-4" />
              </a>
            </div>

            {/* CTA */}
            {showCta && (
              <motion.a
                href={ctaHref}
                variants={ctaVariant}
                whileTap={{ scale: 0.96 }}
                className="group mt-1 inline-flex w-fit items-center gap-2.5 rounded-full bg-primary py-0.5 pr-1 pl-5 shadow-sm transition-[background-color,box-shadow] duration-200 hover:opacity-90 hover:shadow-md"
              >
                <span className="text-sm font-medium text-primary-foreground">
                  {t.heroCtaPrimary}
                </span>
                <span className="flex size-9 items-center justify-center rounded-full bg-background/20">
                  <FaArrowRight className="size-3.5 text-primary-foreground transition-transform duration-200 group-hover:translate-x-0.5" />
                </span>
              </motion.a>
            )}
          </motion.div>

          {/* Nav columns */}
          <motion.nav
            variants={navStagger}
            aria-label="Footer navigation"
            className="grid w-full max-w-[560px] grid-cols-2 gap-y-10 sm:grid-cols-4"
          >
            {columns.map((col) => (
              <motion.div key={col.title} variants={riseItem}>
                <h3 className="text-[10px] font-mono font-semibold uppercase tracking-[0.13em] text-muted-foreground">
                  {col.title}
                </h3>
                <motion.ul variants={linkStagger} className="mt-4 flex flex-col gap-3">
                  {col.links.map((link) => (
                    <motion.li key={link.label} variants={linkItem}>
                      <Link
                        href={link.href}
                        className="inline-block text-sm leading-none font-light text-muted-foreground/70 transition-colors duration-200 hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    </motion.li>
                  ))}
                </motion.ul>
              </motion.div>
            ))}
          </motion.nav>
        </div>
      </motion.div>

      {/* ── Hero logo (large SVG) ── */}
      <motion.div
        variants={heroBrandVariant}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        className="relative flex items-end justify-center overflow-hidden px-8 pt-12 sm:pt-14 md:pt-16 pb-0"
      >
        <Image
          src="/SkyDrive1.svg"
          alt="SkyDrive"
          width={900}
          height={210}
          className="w-full max-w-4xl h-auto select-none translate-y-[15%]"
          aria-hidden="true"
          priority={false}
        />
      </motion.div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-border/50 px-8 sm:px-12 lg:px-16 xl:px-20 py-5 mt-0">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <span className="text-[11px] font-mono text-muted-foreground/50">
            © {new Date().getFullYear()} {t.footerCopyright}
          </span>
          <div className="flex items-center gap-5 text-[11px] font-mono text-muted-foreground/40">
            <span className="inline-flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              {t.footerOperational}
            </span>
            <span>v1.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
