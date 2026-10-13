"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Sparkles, RefreshCw, UploadCloud } from "lucide-react";
import { GlobalSearchDialog } from "@/components/global-search-dialog";
import { QuickUploadModal } from "@/components/quick-upload-modal";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useSession } from "@/lib/auth-client";
import { useLanguage } from "@/lib/i18n";
import { toast } from "sonner";
import { cn, getInitials } from "@/lib/utils";

interface HeaderProps {
  accounts?: Array<{ id: string; email: string; availableStorage: string; usagePercentage: number }>;
  onRefresh?: () => void;
}

export function Header({ accounts: initialAccounts, onRefresh }: HeaderProps) {
  const { data: session } = useSession();
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [accounts, setAccounts] = useState<Array<{ id: string; email: string; availableStorage: string; usagePercentage: number }>>(
    initialAccounts || []
  );

  const fetchAccounts = useCallback(async () => {
    try {
      const res = await fetch("/api/storage/analytics");
      if (res.ok) {
        const json = await res.json();
        if (json.accounts) {
          setAccounts(json.accounts);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    if (!initialAccounts || initialAccounts.length === 0) {
      fetchAccounts();
    } else {
      setAccounts(initialAccounts);
    }
  }, [initialAccounts, fetchAccounts]);

  useEffect(() => {
    const handleRefresh = () => fetchAccounts();
    window.addEventListener("skydrive:refresh", handleRefresh);
    return () => window.removeEventListener("skydrive:refresh", handleRefresh);
  }, [fetchAccounts]);

  const handleSyncAll = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch("/api/google/sync", { method: "POST" });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.success) {
        if (data.failedCount && data.failedCount > 0) {
          toast.warning(
            `Synchronized ${data.count || 0} accounts (${data.failedCount} failed${
              data.hasInvalidGrant ? " - token expired" : ""
            }). Buka halaman Akun untuk sambungkan ulang.`,
            {
              action: {
                label: "Buka Akun",
                onClick: () => {
                  window.location.href = "/dashboard/accounts";
                },
              },
            }
          );
        } else {
          toast.success(`Synchronized ${data.count || 0} storage account quotas`);
        }
        await fetchAccounts();
        onRefresh?.();
        window.dispatchEvent(new CustomEvent("skydrive:refresh"));
      } else {
        toast.error(data?.error || "Failed to sync account quotas");
      }
    } catch {
      toast.error("Sync request failed");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <>
      <header className="h-16 border-b border-border px-6 flex items-center justify-between bg-card sticky top-0 z-20 shadow-xs transition-colors duration-200 gap-4 shrink-0 w-full">
        {/* Logo (visible only on mobile where sidebar is hidden) */}
        <Link href="/dashboard" className="shrink-0 lg:hidden flex items-center gap-2">
          <Image
            src="/SkyDrive.svg"
            alt="SkyDrive"
            width={28}
            height={28}
            className="h-7 w-auto object-contain"
          />
          <span className="font-bold text-sm brand-text-gradient">
            SkyDrive
          </span>
        </Link>

        {/* Global Search Bar Trigger */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-muted/60 border border-border text-muted-foreground hover:text-foreground hover:border-border/80 transition-all text-xs w-64 sm:w-72 justify-between group shadow-sm cursor-pointer flex-1 max-w-sm"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="size-3.5 text-primary group-hover:scale-110 transition-transform" />
            <span className="truncate">{t.headerSearch}</span>
          </div>
          <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-card border border-border text-muted-foreground">
            ⌘K
          </kbd>
        </button>

        {/* Action Controls & User Profile */}
        <div className="flex items-center gap-2.5">
          {/* Language Switcher */}
          <LanguageSwitcher variant="pill" />

          {/* Light / Dark Mode Toggle */}
          <ThemeToggle />

          {/* Sync Quotas Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleSyncAll}
            disabled={isSyncing}
            className="gap-1.5 text-xs font-medium shadow-sm"
          >
            <RefreshCw className={cn("size-3.5", isSyncing && "animate-spin text-primary")} />
            <span className="hidden sm:inline">{t.headerSync}</span>
          </Button>

          {/* Quick Upload Button */}
          <Button
            size="sm"
            onClick={() => setIsUploadOpen(true)}
            className="gap-1.5 text-xs font-semibold shadow-sm"
          >
            <UploadCloud className="size-3.5" />
            <span>{t.headerUpload}</span>
          </Button>

          {/* User Profile Pill in Header */}
          {mounted && session?.user && (
            <Link
              href="/dashboard/profile"
              className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full bg-muted/60 border border-border hover:bg-accent/60 hover:border-border/80 transition-all cursor-pointer shadow-sm ml-1"
              title="Open Profile"
            >
              <Avatar className="size-6">
                {session.user.image && (
                  <AvatarImage
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    referrerPolicy="no-referrer"
                  />
                )}
                <AvatarFallback className="text-[9px] bg-primary/10 text-primary font-bold">
                  {session.user.name ? getInitials(session.user.name) : "SD"}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs font-semibold text-foreground truncate max-w-[110px] hidden md:inline">
                {session.user.name?.split(" ")[0] || "Account"}
              </span>
            </Link>
          )}
        </div>
      </header>

      {/* Global Multi-Account Search Dialog */}
      <GlobalSearchDialog isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Quick Upload Modal */}
      <QuickUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        accounts={accounts}
        onSuccess={() => {
          fetchAccounts();
          onRefresh?.();
          window.dispatchEvent(new CustomEvent("skydrive:refresh"));
        }}
      />
    </>
  );
}
