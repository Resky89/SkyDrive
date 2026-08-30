import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import {
  Cloud,
  HardDrive,
  UploadCloud,
  ShieldCheck,
  Zap,
  ArrowRight,
  CheckCircle2,
  Lock,
  Layers,
  Sparkles,
  ExternalLink,
  Users2,
  FolderTree,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

export default async function LandingPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-200 selection:bg-primary/20">
      {/* Apple-grade Glassmorphic Navigation */}
      <header className="h-16 border-b border-border/80 px-6 sm:px-10 flex items-center justify-between sticky top-0 bg-card/75 backdrop-blur-xl z-30 transition-all">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-sm">
            <Cloud className="size-4" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm tracking-tight text-foreground">
              SkyDrive
            </span>
            <Badge variant="outline" className="hidden sm:inline-flex text-[9px] font-mono border-primary/30 text-primary py-0 px-1.5">
              Unified Cloud
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />

          {user ? (
            /* Logged-in User Profile Header Pill */
            <div className="flex items-center gap-2.5">
              <Link
                href="/dashboard"
                className="flex items-center gap-2.5 pl-1.5 pr-3.5 py-1 rounded-full bg-muted/60 border border-border hover:bg-accent/70 hover:border-border/80 transition-all cursor-pointer shadow-sm group"
              >
                <Avatar className="size-7 border border-border/80">
                  {user.image && (
                    <AvatarImage
                      src={user.image}
                      alt={user.name || "User"}
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">
                    {user.name ? getInitials(user.name) : "SD"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors leading-tight">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono leading-tight truncate max-w-[120px]">
                    {user.email}
                  </span>
                </div>
              </Link>

              <Button asChild size="sm" className="text-xs font-semibold shadow-sm gap-1.5 hidden sm:inline-flex">
                <Link href="/dashboard">
                  <span>Dashboard</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </div>
          ) : (
            /* Guest / Unauthenticated Navigation */
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm" className="text-xs">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild size="sm" className="text-xs font-semibold shadow-sm">
                <Link href="/register">Get Started</Link>
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center max-w-5xl mx-auto space-y-10 animate-fade-in">
        <div className="space-y-4 max-w-3xl">
          <Badge variant="info" className="px-3.5 py-1 text-xs gap-2 shadow-sm inline-flex items-center">
            <Sparkles className="size-3.5 text-primary animate-pulse" />
            <span className="font-semibold tracking-wide">Multi-Account Google Drive Storage Pool</span>
          </Badge>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-[-0.03em] text-foreground leading-[1.08]">
            One Virtual Drive. <br />
            <span className="bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 bg-clip-text text-transparent">
              Infinite Cloud Accounts.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed pt-1">
            Hubungkan beberapa akun Google Drive Anda menjadi satu volume penyimpanan virtual berkecepatan tinggi dengan routing cerdas, live thumbnail, dan navigasi folder terintegrasi.
          </p>
        </div>

        {/* Dynamic CTA Buttons based on Auth State */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
          {user ? (
            <>
              <Button asChild size="lg" className="gap-2 shadow-sm text-sm font-semibold h-11 px-7">
                <Link href="/dashboard">
                  <span>Masuk ke Dashboard Virtual Drive</span>
                  <ArrowRight className="size-4" />
                </Link>
              </Button>

              <Button asChild variant="outline" size="lg" className="h-11 px-6 text-sm">
                <Link href="/dashboard/accounts">
                  <span>Kelola Akun Cloud ({user.email})</span>
                </Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild size="lg" className="gap-2 shadow-sm text-sm font-semibold h-11 px-7">
                <Link href="/register">
                  <span>Mulai Gabungkan Storage</span>
                  <ArrowRight className="size-4" />
                </Link>
              </Button>

              <Button asChild variant="outline" size="lg" className="h-11 px-6 text-sm">
                <Link href="/login">
                  <span>Sign In dengan Google</span>
                </Link>
              </Button>
            </>
          )}
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full text-left pt-10">
          <Card className="p-5 space-y-3 card-hover border-border shadow-sm">
            <div className="size-9 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
              <Layers className="size-4" />
            </div>
            <h3 className="text-sm font-bold text-foreground">
              Storage Aggregation
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Hubungkan akun Google Drive Anda (15GB, 5TB, dst.) dan nikmati satu ruang drive terpadu secara instan.
            </p>
          </Card>

          <Card className="p-5 space-y-3 card-hover border-border shadow-sm">
            <div className="size-9 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
              <FolderTree className="size-4" />
            </div>
            <h3 className="text-sm font-bold text-foreground">
              Unified File & Folder Explorer
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Jelajahi Drive Saya dan file yang dibagikan secara hierarkis dengan live preview thumbnail & folder upload.
            </p>
          </Card>

          <Card className="p-5 space-y-3 card-hover border-border shadow-sm">
            <div className="size-9 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
              <ShieldCheck className="size-4" />
            </div>
            <h3 className="text-sm font-bold text-foreground">
              Zero-Exposure Privacy
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Token OAuth dienkripsi dengan standar militer AES-256-GCM. File Anda tetap aman di server Google.
            </p>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/80 py-6 px-8 text-center text-xs text-muted-foreground">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Cloud className="size-4 text-primary" />
            <span className="font-semibold text-foreground">SkyDrive</span>
            <span>— Multi-Account Cloud Storage Pool</span>
          </div>
          <span className="font-mono text-[11px]">Next.js 16 • Better Auth • Google Drive API</span>
        </div>
      </footer>
    </div>
  );
}
