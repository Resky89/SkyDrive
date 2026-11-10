import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider, type Language } from "@/lib/i18n";

const geistSans = Geist({ subsets: ["latin"], variable: "--font-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  metadataBase: new URL("https://skydrive.web.id"),
  title: {
    default: "SkyDrive · Unified Multi-Account Cloud Storage Pool",
    template: "%s · SkyDrive",
  },
  description:
    "Merge all your Google Drive accounts into one unified virtual storage pool. Smart upload routing, multi-account search, and true zero-retention privacy without subscriptions.",
  applicationName: "SkyDrive",
  authors: [{ name: "SkyDrive Team", url: "https://skydrive.web.id" }],
  creator: "Resky Prabowo",
  publisher: "SkyDrive",
  keywords: [
    "cloud storage pool",
    "multi account google drive",
    "gabung akun google drive",
    "merge multiple google drives",
    "virtual cloud drive",
    "smart upload dispatcher",
    "zero retention cloud storage",
    "free cloud storage aggregator",
    "penyimpanan cloud gratis",
  ],
  alternates: {
    canonical: "https://skydrive.web.id",
    languages: {
      "id-ID": "https://skydrive.web.id/id",
      "en-US": "https://skydrive.web.id/en",
      "ja-JP": "https://skydrive.web.id/ja",
      "zh-CN": "https://skydrive.web.id/zh",
      "ko-KR": "https://skydrive.web.id/ko",
      "x-default": "https://skydrive.web.id/en",
    },
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    alternateLocale: ["en_US", "ja_JP", "zh_CN", "ko_KR"],
    url: "https://skydrive.web.id",
    title: "SkyDrive · Unified Multi-Account Cloud Storage Pool",
    description:
      "Merge multiple Google Drive accounts into one workspace. Unlock 45GB - 100GB+ of unified storage with smart routing and zero-retention privacy.",
    siteName: "SkyDrive",
    images: [
      {
        url: "/dashboard-dark.webp",
        width: 1200,
        height: 630,
        alt: "SkyDrive Unified Cloud Storage Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SkyDrive · Unified Multi-Account Cloud Storage Pool",
    description:
      "One workspace for all your Google Drives. Smart upload routing with true zero-retention privacy.",
    images: ["/dashboard-dark.webp"],
    creator: "@reskyprabowo89",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/SkyDrive.svg", type: "image/svg+xml" },
    ],
    shortcut: "/SkyDrive.svg",
    apple: "/SkyDrive.svg",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const rawLang = cookieStore.get("skydrive_lang")?.value;
  const initialLanguage: Language =
    rawLang && ["en", "id", "ja", "zh", "ko"].includes(rawLang)
      ? (rawLang as Language)
      : "id";

  return (
    <html
      lang={initialLanguage}
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <LanguageProvider initialLanguage={initialLanguage}>
            {children}
            <Toaster
              position="bottom-right"
              richColors
              theme="system"
              duration={3500}
              toastOptions={{
                style: {
                  background: "hsl(var(--card))",
                  color: "hsl(var(--card-foreground))",
                  border: "1px solid hsl(var(--border))",
                  boxShadow: "0 12px 32px -8px rgba(0, 0, 0, 0.4)",
                  borderRadius: "1rem",
                  cursor: "pointer",
                },
              }}
            />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
