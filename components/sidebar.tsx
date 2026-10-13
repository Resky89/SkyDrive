"use client";

import { useState, useEffect, useMemo, memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  HardDrive,
  UploadCloud,
  FolderOpen,
  BarChart2,
  Settings,
  LogOut,
  Image as ImageIcon,
  Video,
  FileText,
  LucideIcon,
} from "lucide-react";
import { signOut, useSession } from "@/lib/auth-client";
import { cn, getInitials, formatBytes } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/lib/i18n";

interface SidebarStorageBreakdown {
  photosSize: string;
  videosSize: string;
  documentsSize: string;
  othersSize: string;
  freeStorage: string;
  usedStorage: string;
  totalStorage: string;
}

interface SidebarStorageData {
  totalStorage: string;
  usedStorage: string;
  availableStorage: string;
  usagePercentage: number;
  breakdown?: SidebarStorageBreakdown;
}

interface StorageCategoryItem {
  id: string;
  label: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  sizeBytes: number;
}

export const Sidebar = memo(function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const { t } = useLanguage();
  const [storageData, setStorageData] = useState<SidebarStorageData | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchStorage = async () => {
      try {
        const res = await fetch("/api/storage/analytics");
        if (res.ok) {
          const json = await res.json();
          if (isMounted && json.summary) {
            setStorageData({
              totalStorage: json.summary.totalStorage || "0",
              usedStorage: json.summary.usedStorage || "0",
              availableStorage: json.summary.availableStorage || "0",
              usagePercentage: json.summary.usagePercentage || 0,
              breakdown: json.summary.breakdown,
            });
          }
        }
      } catch {
        // ignore errors
      }
    };

    fetchStorage();
    const handleRefresh = () => fetchStorage();
    window.addEventListener("skydrive:refresh", handleRefresh);
    const interval = setInterval(fetchStorage, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener("skydrive:refresh", handleRefresh);
    };
  }, []);

  const navigation = useMemo(
    () => [
      { name: t.menuOverview, href: "/dashboard", icon: LayoutDashboard },
      { name: t.menuAccounts, href: "/dashboard/accounts", icon: HardDrive },
      { name: t.menuUploads, href: "/dashboard/uploads", icon: UploadCloud },
      { name: t.menuFiles, href: "/dashboard/files", icon: FolderOpen },
      { name: t.menuAnalytics, href: "/dashboard/analytics", icon: BarChart2 },
      { name: t.menuSettings, href: "/dashboard/settings", icon: Settings },
    ],
    [t]
  );

  const categories: StorageCategoryItem[] = useMemo(
    () => [
      {
        id: "photos",
        label: t.sidebarCategoryPhoto,
        icon: ImageIcon,
        iconBg: "bg-lime-500/15",
        iconColor: "text-lime-500",
        sizeBytes: Number(storageData?.breakdown?.photosSize || 0),
      },
      {
        id: "videos",
        label: t.sidebarCategoryVideo,
        icon: Video,
        iconBg: "bg-amber-500/15",
        iconColor: "text-amber-500",
        sizeBytes: Number(storageData?.breakdown?.videosSize || 0),
      },
      {
        id: "documents",
        label: t.sidebarCategoryDocument,
        icon: FileText,
        iconBg: "bg-sky-500/15",
        iconColor: "text-sky-500",
        sizeBytes: Number(storageData?.breakdown?.documentsSize || 0),
      },
      {
        id: "free",
        label: t.sidebarCategoryFree,
        icon: HardDrive,
        iconBg: "bg-orange-500/15",
        iconColor: "text-orange-500",
        sizeBytes: Number(
          storageData?.availableStorage ||
            storageData?.breakdown?.freeStorage ||
            0
        ),
      },
    ],
    [storageData, t]
  );

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/login";
  };

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col shrink-0 h-screen sticky top-0 z-30 select-none transition-colors duration-200 shadow-md">
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center gap-3 border-b border-border/70 shrink-0">
        <Link href="/dashboard" className="flex items-center gap-3 min-w-0 group">
          <div className="size-9 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center p-1.5 shadow-inner group-hover:scale-105 transition-transform">
            <Image
              src="/SkyDrive.svg"
              alt="SkyDrive"
              width={32}
              height={32}
              className="size-full object-contain"
            />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm brand-text-gradient">
                SkyDrive
              </span>
              <Badge
                variant="outline"
                className="px-1 py-0 text-[9px] font-mono border-primary/30 text-primary bg-primary/5"
              >
                v1.0
              </Badge>
            </div>
            <span className="text-[10px] text-muted-foreground truncate font-mono">
              Multi-Drive Pool
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation List */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 mb-2 flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            {t.sidebarWorkspace}
          </span>
          <span className="size-1.5 rounded-full bg-primary/60" />
        </div>
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 group relative",
                  isActive
                    ? "bg-gradient-to-r from-sky-500/15 to-indigo-600/15 border border-primary/40 text-foreground font-bold shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/60 hover:border hover:border-border/60"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={cn(
                      "size-4 transition-colors",
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                  <span>{item.name}</span>
                </div>
                {isActive && (
                  <span className="size-1.5 rounded-full bg-primary shadow-sm shadow-primary/80 animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Storage Telemetry & Profile */}
      <div className="p-3 shrink-0 border-t border-border/70 bg-secondary/30 space-y-2.5">
        {/* Storage Breakdown & Total Progress Bar */}
        <div className="p-3.5 rounded-2xl bg-card border border-border shadow-xs space-y-3.5">
          {/* DRY List of Storage Categories */}
          <div className="space-y-2.5 text-xs">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <div key={cat.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "size-5 rounded-md flex items-center justify-center shrink-0 shadow-2xs",
                        cat.iconBg,
                        cat.iconColor
                      )}
                    >
                      <Icon className="size-3" />
                    </div>
                    <span className="font-medium text-foreground text-xs">
                      {cat.label}
                    </span>
                  </div>
                  <span className="font-bold text-foreground text-xs tracking-tight font-mono">
                    {formatBytes(cat.sizeBytes, 2)}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-border/70 space-y-2">
            {/* Usage Summary */}
            <div className="text-xs text-muted-foreground flex items-center gap-1 font-medium font-mono">
              <span className="font-bold text-foreground">
                {formatBytes(Number(storageData?.usedStorage || 0), 2)}
              </span>
              <span>
                {t.sidebarUsedOf}{" "}
                {formatBytes(Number(storageData?.totalStorage || 0), 2)}
              </span>
            </div>

            {/* Blue Progress Bar */}
            <Progress
              value={storageData?.usagePercentage || 0}
              className="h-1.5 bg-muted rounded-full overflow-hidden"
              indicatorColor="bg-blue-600 dark:bg-blue-500"
            />
          </div>
        </div>

        {/* User Card with Sign Out */}
        <div className="p-2 rounded-xl bg-card border border-border flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0 pr-1 flex-1">
            <Avatar className="size-8 border border-border/60 shrink-0">
              {session?.user?.image && (
                <AvatarImage
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  referrerPolicy="no-referrer"
                />
              )}
              <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                {session?.user?.name ? getInitials(session.user.name) : "SD"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-foreground truncate max-w-[120px]">
                {session?.user?.name || "Cloud User"}
              </span>
              <span className="text-[10px] text-muted-foreground truncate max-w-[120px] font-mono">
                {session?.user?.email || "user@skydrive.app"}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSignOut}
            title="Sign Out"
            className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer shrink-0"
          >
            <LogOut className="size-3.5" />
          </Button>
        </div>
      </div>
    </aside>
  );
});
