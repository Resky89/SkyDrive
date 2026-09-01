import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/lib/i18n";

const geistSans = Geist({ subsets: ["latin"], variable: "--font-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: {
    default: "SkyDrive · Unified Multi-Account Cloud Storage Pool",
    template: "%s · SkyDrive",
  },
  description:
    "One workspace. Multiple clouds. Smarter storage. Connect and manage all your Google Drive accounts from a single virtual storage pool.",
  keywords: ["cloud storage", "google drive", "multi-account", "storage management", "virtual drive"],
  authors: [{ name: "SkyDrive" }],
  icons: {
    icon: [
      { url: "/SkyDrive.svg", type: "image/svg+xml" },
    ],
    shortcut: "/SkyDrive.svg",
    apple: "/SkyDrive.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <LanguageProvider>
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
