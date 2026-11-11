"use client";

import React, { memo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderOpen,
  UploadCloud,
  HardDrive,
  UserCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n";

export const MobileBottomNav = memo(function MobileBottomNav() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const navItems = [
    {
      label: t.menuOverview || "Ringkasan",
      href: "/dashboard",
      icon: LayoutDashboard,
      isActive: pathname === "/dashboard",
    },
    {
      label: t.menuFiles || "Files",
      href: "/dashboard/files",
      icon: FolderOpen,
      isActive: pathname.startsWith("/dashboard/files"),
    },
    {
      label: t.menuUploads || "Upload",
      href: "/dashboard/uploads",
      icon: UploadCloud,
      isActive: pathname.startsWith("/dashboard/uploads"),
      isCenter: true,
    },
    {
      label: t.menuAccounts || "Akun",
      href: "/dashboard/accounts",
      icon: HardDrive,
      isActive: pathname.startsWith("/dashboard/accounts"),
    },
    {
      label: "Profil",
      href: "/dashboard/profile",
      icon: UserCircle,
      isActive: pathname.startsWith("/dashboard/profile"),
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-border/80 px-2 py-1.5 shadow-lg select-none"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer min-w-[56px]",
                item.isActive
                  ? "text-primary font-bold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-center size-8 rounded-lg transition-transform",
                  item.isCenter && "bg-primary text-primary-foreground shadow-sm scale-105",
                  item.isActive && !item.isCenter && "bg-primary/10 text-primary"
                )}
              >
                <Icon className={cn("size-4.5", item.isCenter && "text-primary-foreground")} />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[64px]">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
});

