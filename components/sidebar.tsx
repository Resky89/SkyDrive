"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Cloud,
  LayoutDashboard,
  HardDrive,
  UploadCloud,
  FolderOpen,
  BarChart2,
  Settings,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { signOut, useSession } from "@/lib/auth-client";
import { cn, getInitials } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Connected Accounts", href: "/dashboard/accounts", icon: HardDrive },
  { name: "Smart Upload", href: "/dashboard/uploads", icon: UploadCloud },
  { name: "File Explorer", href: "/dashboard/files", icon: FolderOpen },
  { name: "Storage Analytics", href: "/dashboard/analytics", icon: BarChart2 },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col shrink-0 h-screen sticky top-0 z-30 select-none transition-colors duration-200">
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center gap-3 border-b border-border shrink-0">
        <div className="size-8 rounded-xl bg-primary flex items-center justify-center shadow-sm text-primary-foreground font-bold shrink-0">
          <Cloud className="size-4" />
        </div>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-sm tracking-tight text-foreground">
              SkyDrive
            </span>
            <Badge variant="outline" className="px-1 py-0 text-[9px] font-mono border-primary/30 text-primary">
              v1.0
            </Badge>
          </div>
          <span className="text-[11px] text-muted-foreground truncate font-medium">
            Unified Cloud Pool
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-2 mb-2">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
            WORKSPACE
          </span>
        </div>
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150",
                  isActive
                    ? "bg-primary text-primary-foreground font-bold shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={cn("size-4", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                  <span>{item.name}</span>
                </div>
                {isActive && <ChevronRight className="size-3.5 opacity-80" />}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Status & Profile */}
      <div className="p-3 space-y-2.5 shrink-0 border-t border-border bg-muted/30">
        {/* Engine Status Capsule */}
        <div className="p-2.5 rounded-xl bg-card border border-border space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-foreground text-[11px]">Storage Engine</span>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-500">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Online
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground leading-tight">
            Multi-Account sync active & ready.
          </p>
        </div>

        {/* User Footer Card */}
        <div className="p-2 rounded-xl bg-card border border-border flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2 min-w-0 pr-1">
            <Avatar className="size-8">
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
              <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                {session?.user?.email || "user@skydrive.app"}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSignOut}
            title="Sign Out"
            className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
          >
            <LogOut className="size-3.5" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
