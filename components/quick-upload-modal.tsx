"use client";

import { useState, useCallback, memo } from "react";
import { useDropzone } from "react-dropzone";
import {
  UploadCloud,
  CheckCircle2,
  Loader2,
  HardDrive,
  Cpu,
  Layers,
  Sparkles,
  LucideIcon,
} from "lucide-react";
import { formatBytes, cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface StorageAccountSummary {
  id: string;
  email: string;
  availableStorage: string;
  usagePercentage: number;
}

interface QuickUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts?: StorageAccountSummary[];
  onSuccess?: () => void;
}

type StrategyType = "LARGEST_AVAILABLE" | "LEAST_USED" | "BALANCED" | "MANUAL";

interface StrategyOption {
  id: StrategyType;
  label: string;
  desc: string;
  icon: LucideIcon;
}

const STRATEGY_OPTIONS: StrategyOption[] = [
  { id: "LARGEST_AVAILABLE", label: "Largest Free", desc: "Drive with most space", icon: Sparkles },
  { id: "LEAST_USED", label: "Least Used %", desc: "Lowest % capacity", icon: HardDrive },
  { id: "BALANCED", label: "Balanced", desc: "Equalizes space", icon: Layers },
  { id: "MANUAL", label: "Manual", desc: "Choose drive", icon: HardDrive },
];

export const QuickUploadModal = memo(function QuickUploadModal({
  isOpen,
  onClose,
  accounts = [],
  onSuccess,
}: QuickUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [strategy, setStrategy] = useState<StrategyType>("LARGEST_AVAILABLE");
  const [selectedAccountId, setSelectedAccountId] = useState<string>(
    accounts[0]?.id || ""
  );
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
  });

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file to upload");
      return;
    }

    setUploading(true);
    setProgress(20);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("strategy", strategy);
    if (strategy === "MANUAL" && selectedAccountId) {
      formData.append("targetAccountId", selectedAccountId);
    }

    try {
      setProgress(50);
      const res = await fetch("/api/files/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setProgress(100);

      if (!res.ok) {
        throw new Error(data.error || "Failed to upload file");
      }

      toast.success(`Successfully uploaded "${file.name}" to ${data.account?.email || "cloud"}`);
      setFile(null);
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Upload failed";
      toast.error(errorMsg);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !uploading && onClose()}>
      <DialogContent className="max-w-lg border-border bg-card p-6 rounded-2xl shadow-2xl">
        <DialogHeader className="border-b border-border pb-4">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <UploadCloud className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-sm font-bold text-foreground">Quick File Upload</DialogTitle>
              <DialogDescription className="text-[11px] text-muted-foreground mt-0.5">
                Intelligent multi-account cloud destination
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Dropzone Area */}
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200",
            isDragActive
              ? "border-primary bg-primary/5"
              : file
              ? "border-emerald-500/50 bg-emerald-500/5"
              : "border-border hover:border-border/80 bg-muted/20"
          )}
        >
          <input {...getInputProps()} disabled={uploading} />
          {file ? (
            <div className="flex flex-col items-center gap-1.5">
              <div className="size-9 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="size-5" />
              </div>
              <span className="text-xs font-semibold text-foreground max-w-xs truncate">
                {file.name}
              </span>
              <span className="text-[10px] font-mono text-muted-foreground">{formatBytes(file.size)}</span>
              <span className="text-[10px] text-primary hover:underline mt-0.5">
                Click or drop another file to replace
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5">
              <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-1">
                <UploadCloud className="size-5" />
              </div>
              <span className="text-xs font-semibold text-foreground">
                Drag and drop file here
              </span>
              <span className="text-[11px] text-muted-foreground">or click to browse from device</span>
            </div>
          )}
        </div>

        {/* Strategy Selector */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-foreground uppercase tracking-wider font-mono flex items-center gap-1.5">
            <Cpu className="size-3.5 text-primary" />
            Routing Strategy
          </label>
          <div className="grid grid-cols-2 gap-2">
            {STRATEGY_OPTIONS.map((s) => {
              const Icon = s.icon;
              const isSelected = strategy === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStrategy(s.id)}
                  className={cn(
                    "p-2.5 rounded-xl border text-left flex flex-col gap-0.5 transition-all text-xs cursor-pointer",
                    isSelected
                      ? "border-primary bg-primary/10 text-primary shadow-sm ring-1 ring-primary"
                      : "border-border bg-card text-muted-foreground hover:border-border/80 hover:text-foreground"
                  )}
                >
                  <div className="flex items-center gap-1.5 font-medium">
                    <Icon className={cn("size-3.5", isSelected ? "text-primary" : "text-muted-foreground")} />
                    <span className="text-foreground font-semibold">{s.label}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{s.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Target Account Selector for Manual Strategy */}
        {strategy === "MANUAL" && accounts.length > 0 && (
          <div className="space-y-1.5 animate-in fade-in zoom-in-95 duration-200">
            <label className="text-xs font-semibold text-foreground">Select Target Drive</label>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="w-full h-9 rounded-xl border border-input bg-card px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.email} ({formatBytes(Number(acc.availableStorage))} available)
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={uploading}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleUpload}
            disabled={!file || uploading}
            className="gap-1.5 text-xs font-semibold"
          >
            {uploading ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Uploading ({progress}%)…</span>
              </>
            ) : (
              <>
                <UploadCloud className="size-3.5" />
                <span>Upload File</span>
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
});
