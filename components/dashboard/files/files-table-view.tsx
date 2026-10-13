"use client";

import React, { memo } from "react";
import {
  Download,
  ExternalLink,
  Eye,
  MoreVertical,
  Pencil,
  FolderInput,
  Trash2,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { formatBytes, cn } from "@/lib/utils";
import { CloudItem } from "./types";
import { getFileIconComponent } from "./file-icon";

interface FilesTableViewProps {
  files: CloudItem[];
  foldersOffset: number;
  selectedIds: Set<string>;
  draggedItemId: string | null;
  downloadingId: string | null;
  onItemClick: (file: CloudItem, index: number, e: React.MouseEvent) => void;
  onItemDoubleClick?: (file: CloudItem, e: React.MouseEvent) => void;
  onItemPointerDown?: (file: CloudItem, e: React.PointerEvent) => void;
  onPreview: (file: CloudItem) => void;
  onDownload: (file: CloudItem, e?: React.MouseEvent) => void;
  onOpenMove: (file: CloudItem, e?: React.MouseEvent) => void;
  onOpenRename: (file: CloudItem, e?: React.MouseEvent) => void;
  onOpenDelete: (file: CloudItem, e?: React.MouseEvent) => void;
  onDragStart: (e: React.DragEvent, file: CloudItem) => void;
  onDragEnd: () => void;
  registerRef: (id: string, el: HTMLElement | null) => void;
}

export const FilesTableView = memo(function FilesTableView({
  files,
  foldersOffset,
  selectedIds,
  draggedItemId,
  downloadingId,
  onItemClick,
  onItemDoubleClick,
  onItemPointerDown,
  onPreview,
  onDownload,
  onOpenMove,
  onOpenRename,
  onOpenDelete,
  onDragStart,
  onDragEnd,
  registerRef,
}: FilesTableViewProps) {
  return (
    <SpotlightCard className="border-border overflow-hidden shadow-sm rounded-2xl select-none">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
              <th className="py-3 px-4 font-semibold">Nama Item</th>
              <th className="py-3 px-4 font-semibold">Storage Pool</th>
              <th className="py-3 px-4 font-semibold">Ukuran</th>
              <th className="py-3 px-4 font-semibold">Dimodifikasi</th>
              <th className="py-3 px-4 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {files.map((file, idx) => {
              const Icon = getFileIconComponent(file.mimeType);
              const isSelected = selectedIds.has(file.id);

              return (
                <tr
                  key={`list-${file.id}-${idx}`}
                  data-item-card="true"
                  ref={(el) => registerRef(file.id, el)}
                  draggable={isSelected}
                  onDragStart={(e) => isSelected && onDragStart(e, file)}
                  onDragEnd={onDragEnd}
                  onPointerDown={(e) => onItemPointerDown?.(file, e)}
                  onClick={(e) => onItemClick(file, foldersOffset + idx, e)}
                  onDoubleClick={(e) => onItemDoubleClick?.(file, e)}
                  className={cn(
                    "hover:bg-accent/40 transition-colors cursor-pointer",
                    isSelected &&
                      "bg-primary/15 hover:bg-primary/20 text-foreground font-semibold border-l-4 border-l-primary",
                    draggedItemId === file.id && "opacity-50 bg-muted/40"
                  )}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3 max-w-md">
                      <button
                        type="button"
                        data-select-checkbox="true"
                        onClick={(e) => {
                          e.stopPropagation();
                          onItemClick(file, foldersOffset + idx, e);
                        }}
                        className="size-9 rounded-lg bg-muted border border-border flex items-center justify-center text-muted-foreground shrink-0 overflow-hidden relative cursor-pointer hover:border-primary/40"
                        title={isSelected ? "Batalkan pilihan file" : "Pilih file"}
                      >
                        {file.thumbnailLink ? (
                          <img
                            src={file.thumbnailLink}
                            alt={file.name}
                            referrerPolicy="no-referrer"
                            className="size-full object-cover object-top"
                          />
                        ) : (
                          <Icon className={cn("size-4", isSelected ? "text-primary" : "")} />
                        )}
                        {isSelected && (
                          <div className="absolute inset-0 bg-primary/25 flex items-center justify-center text-primary">
                            <CheckCircle2 className="size-4" />
                          </div>
                        )}
                      </button>
                      <span
                        className={cn(
                          "truncate transition-colors",
                          isSelected
                            ? "text-primary font-bold"
                            : "text-foreground font-medium hover:text-primary"
                        )}
                      >
                        {file.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 pointer-events-none">
                    <Badge variant="info" className="text-[10px] font-mono">
                      {file.account.email}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-muted-foreground pointer-events-none">
                    {formatBytes(Number(file.size))}
                  </td>
                  <td className="py-3 px-4 text-muted-foreground text-[11px] pointer-events-none">
                    {new Date(file.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 rounded-lg text-muted-foreground hover:text-primary transition-colors"
                        title="Unduh file"
                        onClick={(e) => onDownload(file, e)}
                        disabled={downloadingId === file.id}
                      >
                        {downloadingId === file.id ? (
                          <Loader2 className="size-3.5 animate-spin text-primary" />
                        ) : (
                          <Download className="size-3.5" />
                        )}
                      </Button>

                      <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        title="Buka di Google Drive"
                      >
                        <a
                          href={
                            file.webViewLink ||
                            `https://drive.google.com/file/d/${file.driveFileId}/view`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="size-3.5" />
                        </a>
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 rounded-lg text-muted-foreground hover:text-foreground"
                            title="Opsi File"
                          >
                            <MoreVertical className="size-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem
                            onClick={() => onPreview(file)}
                            className="gap-2 text-xs font-semibold"
                          >
                            <Eye className="size-3.5 text-primary" />
                            <span>Preview</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => onDownload(file, e)}
                            className="gap-2 text-xs font-semibold text-primary focus:text-primary"
                          >
                            <Download className="size-3.5 text-primary" />
                            <span>Unduh</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild className="gap-2 text-xs">
                            <a
                              href={
                                file.webViewLink ||
                                `https://drive.google.com/file/d/${file.driveFileId}/view`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="size-3.5 text-muted-foreground" />
                              <span>Buka di Google Drive</span>
                            </a>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => onOpenMove(file, e)} className="gap-2 text-xs">
                            <FolderInput className="size-3.5 text-muted-foreground" />
                            <span>Pindahkan</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => onOpenRename(file, e)} className="gap-2 text-xs">
                            <Pencil className="size-3.5 text-muted-foreground" />
                            <span>Ganti Nama</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={(e) => onOpenDelete(file, e)}
                            className="gap-2 text-xs text-destructive focus:text-destructive focus:bg-destructive/10"
                          >
                            <Trash2 className="size-3.5 text-destructive" />
                            <span>Hapus</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </SpotlightCard>
  );
});
