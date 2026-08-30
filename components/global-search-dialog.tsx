"use client";

import { useState, useEffect, useRef } from "react";
import { Search, ExternalLink, HardDrive, FileText, Loader2 } from "lucide-react";
import { formatBytes } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface SearchResultItem {
  providerFileId: string;
  name: string;
  mimeType: string;
  size: string;
  webViewLink?: string;
  thumbnailLink?: string;
  storageAccountId: string;
  storageAccountEmail: string;
}

interface GlobalSearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearchDialog({ isOpen, onClose }: GlobalSearchDialogProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/files/search?q=${encodeURIComponent(query.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || []);
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden border-border bg-card">
        <DialogHeader className="p-4 border-b border-border">
          <DialogTitle className="sr-only">Search files across all connected Google Drive accounts</DialogTitle>
          <div className="flex items-center gap-3">
            <Search className="size-4 text-primary shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search across all connected Google Drive accounts..."
              className="w-full bg-transparent text-foreground placeholder:text-muted-foreground text-xs focus:outline-none"
            />
            {loading && <Loader2 className="size-3.5 text-primary animate-spin shrink-0" />}
          </div>
        </DialogHeader>

        {/* Results Stream */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-1">
          {query.trim().length < 2 && (
            <div className="py-12 text-center text-muted-foreground text-xs">
              Type at least 2 characters to search across all pooled drives
            </div>
          )}

          {query.trim().length >= 2 && !loading && results.length === 0 && (
            <div className="py-12 text-center text-muted-foreground text-xs">
              No files found matching &quot;{query}&quot;
            </div>
          )}

          {results.map((file) => (
            <a
              key={`${file.storageAccountId}-${file.providerFileId}`}
              href={file.webViewLink || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-xl hover:bg-accent border border-transparent hover:border-border transition-colors group text-decoration-none"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="size-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <FileText className="size-4 text-primary" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                    {file.name}
                  </span>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
                    <span className="truncate">{file.storageAccountEmail}</span>
                    <span>•</span>
                    <span>{formatBytes(Number(file.size || 0))}</span>
                  </div>
                </div>
              </div>

              <ExternalLink className="size-3.5 text-muted-foreground group-hover:text-foreground shrink-0 ml-2" />
            </a>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
