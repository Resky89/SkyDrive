"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, RefreshCw, UploadCloud, User as UserIcon } from "lucide-react";
import { GlobalSearchDialog } from "@/components/global-search-dialog";
import { QuickUploadModal } from "@/components/quick-upload-modal";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import { cn, getInitials } from "@/lib/utils";

interface HeaderProps {
  accounts?: Array<{ id: string; email: string; availableStorage: string; usagePercentage: number }>;
  onRefresh?: () => void;
}

export function Header({ accounts = [], onRefresh }: HeaderProps) {
  const { data: session } = useSession();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSyncAll = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch("/api/google/sync", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Synchronized ${data.count || 0} storage account quotas`);
        onRefresh?.();
      } else {
        toast.error("Failed to sync account quotas");
      }
    } catch {
      toast.error("Sync request failed");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <>
      <header className="h-16 border-b border-border px-6 flex items-center justify-between bg-card/80 backdrop-blur-md sticky top-0 z-20 transition-colors duration-200">
        {/* Global Search Bar Trigger */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-muted/60 border border-border text-muted-foreground hover:text-foreground hover:border-border/80 transition-all text-xs w-72 justify-between group shadow-sm cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Search className="size-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="truncate">Search across all clouds...</span>
          </div>
          <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-card border border-border text-muted-foreground">
            ⌘K
          </kbd>
        </button>

        {/* Action Controls & User Profile */}
        <div className="flex items-center gap-3">
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
            <span className="hidden sm:inline">Sync Quotas</span>
          </Button>

          {/* Quick Upload Button */}
          <Button
            size="sm"
            onClick={() => setIsUploadOpen(true)}
            className="gap-1.5 text-xs font-semibold shadow-sm"
          >
            <UploadCloud className="size-3.5" />
            <span>Upload</span>
          </Button>

          {/* User Profile Pill in Header */}
          {session?.user && (
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full bg-muted/60 border border-border hover:bg-accent/60 hover:border-border/80 transition-all cursor-pointer shadow-sm ml-1"
              title="Open Settings & Profile"
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
        onSuccess={() => onRefresh?.()}
      />
    </>
  );
}
