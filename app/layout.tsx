import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({ subsets: ["latin"], variable: "--font-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: {
    default: "SkyDrive",
    template: "%s · SkyDrive",
  },
  description:
    "One workspace. Multiple clouds. Smarter storage. Connect and manage all your Google Drive accounts from a single dashboard.",
  keywords: ["cloud storage", "google drive", "multi-account", "storage management"],
  authors: [{ name: "SkyDrive" }],
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
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "var(--bg-surface)",
                border: "1px solid var(--border-color)",
                color: "var(--text-main)",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
