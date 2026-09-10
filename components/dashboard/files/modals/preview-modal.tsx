"use client";

import React from "react";
import { Download, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatBytes } from "@/lib/utils";
import { CloudItem } from "../types";
import { getFileIconComponent } from "../file-icon";

interface PreviewModalProps {
  item: CloudItem | null;
  onClose: () => void;
  onDownload: (item: CloudItem) => void;
}

export function PreviewModal({ item, onClose, onDownload }: PreviewModalProps) {
  if (!item) return null;
  const Icon = getFileIconComponent(item.mimeType);

  return (
    <Dialog open={!!item} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl border-border bg-card p-6 shadow-2xl rounded-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1 max-w-md">
              <DialogTitle className="text-sm font-bold text-foreground truncate">
                {item.name}
              </DialogTitle>
              <DialogDescription className="text-[11px] text-muted-foreground font-mono">
                {formatBytes(Number(item.size))} • {item.account.email}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Preview Viewer Container */}
        <div className="w-full h-80 rounded-2xl bg-muted/60 border border-border flex items-center justify-center overflow-hidden p-2">
          {item.thumbnailLink ? (
            <img
              src={item.thumbnailLink}
              alt={item.name}
              referrerPolicy="no-referrer"
              className="max-w-full max-h-full object-contain rounded-xl shadow-sm"
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center space-y-3 text-muted-foreground">
              <div className="size-16 rounded-2xl bg-card border border-border flex items-center justify-center text-primary shadow-xs">
                <Icon className="size-8" />
              </div>
              <div className="text-center">
                <p className="text-xs font-semibold text-foreground">{item.name}</p>
                <p className="text-[10px] font-mono text-muted-foreground">{item.mimeType}</p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs">
            <a
              href={
                item.webViewLink ||
                `https://drive.google.com/file/d/${item.driveFileId}/view`
              }
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="size-3.5" />
              <span>Buka di Google Drive</span>
            </a>
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-xs"
            >
              Tutup
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => onDownload(item)}
              className="gap-1.5 text-xs font-semibold shadow-xs"
            >
              <Download className="size-3.5" />
              <span>Unduh File</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
