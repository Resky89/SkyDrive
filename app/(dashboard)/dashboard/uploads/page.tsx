"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  UploadCloud,
  File as FileIcon,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  X,
} from "lucide-react";
import { formatBytes, cn } from "@/lib/utils";
import { toast } from "sonner";
import { useDropzone } from "react-dropzone";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface StorageAccount {
  id: string;
  email: string;
  availableStorage: string;
  usagePercentage: number;
}

interface UploadResult {
  name: string;
  success: boolean;
  accountEmail?: string;
  error?: string;
}

const STRATEGIES = [
  {
    id: "LARGEST_AVAILABLE",
    name: "Largest Free Space",
    desc: "Directs to drive with the most bytes remaining.",
  },
  {
    id: "LEAST_USED",
    name: "Least Used %",
    desc: "Prioritizes accounts with lowest % capacity.",
  },
  {
    id: "BALANCED",
    name: "Round-Robin Balanced",
    desc: "Evenly distributes files across all drives.",
  },
  {
    id: "MANUAL",
    name: "Manual Destination",
    desc: "You explicitly choose the target Google Drive.",
  },
];

export default function SmartUploadsPage() {
  const [accounts, setAccounts] = useState<StorageAccount[]>([]);
  const [strategy, setStrategy] = useState("LARGEST_AVAILABLE");
  const [selectedAccount, setSelectedAccount] = useState("");
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);

  const fetchAccounts = useCallback(async () => {
    try {
      const res = await fetch("/api/storage/analytics");
      if (res.ok) {
        const data = await res.json();
        setAccounts(data.accounts || []);
        if (data.accounts?.length > 0) {
          setSelectedAccount(data.accounts[0].id);
        }
      }
    } catch {
      toast.error("Failed to load accounts for routing");
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  useEffect(() => {
    const handleRefresh = () => fetchAccounts();
    window.addEventListener("skydrive:refresh", handleRefresh);
    return () => window.removeEventListener("skydrive:refresh", handleRefresh);
  }, [fetchAccounts]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFilesToUpload((prev) => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
  });

  const removeFile = useCallback((index: number) => {
    setFilesToUpload((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleStartUpload = async () => {
    if (filesToUpload.length === 0) return;
    setUploading(true);
    setUploadResults([]);

    const results: UploadResult[] = [];

    for (let i = 0; i < filesToUpload.length; i++) {
      const file = filesToUpload[i];

      try {
        // 1. Direct-to-Google Resumable Upload (Bypasses Vercel 4.5MB limit & 0 RAM usage)
        const initRes = await fetch("/api/files/initiate-upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: file.name,
            size: file.size,
            mimeType: file.type || "application/octet-stream",
            strategy: strategy,
            targetAccountId: strategy === "MANUAL" ? selectedAccount : undefined,
          }),
        });

        if (initRes.ok) {
          const { uploadUrl, account } = await initRes.json();

          // Direct streaming from browser to Google API
          const googleUploadRes = await fetch(uploadUrl, {
            method: "PUT",
            headers: {
              "Content-Type": file.type || "application/octet-stream",
            },
            body: file,
          });

          if (googleUploadRes.ok || googleUploadRes.status === 200 || googleUploadRes.status === 201) {
            results.push({
              name: file.name,
              success: true,
              accountEmail: account?.email,
            });
            continue;
          } else {
            const googleError = await googleUploadRes.text().catch(() => "");
            console.warn("Direct upload to Google failed, retrying via fallback...", googleError);
          }
        }

        // 2. Fallback to server streaming endpoint if direct initiation was not possible
        const formData = new FormData();
        formData.append("file", file);
        formData.append("strategy", strategy);
        if (strategy === "MANUAL" && selectedAccount) {
          formData.append("targetAccountId", selectedAccount);
        }

        const res = await fetch("/api/files/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (res.ok) {
          results.push({
            name: file.name,
            success: true,
            accountEmail: data.account?.email,
          });
        } else {
          results.push({
            name: file.name,
            success: false,
            error: data.error || "Upload failed",
          });
        }
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : "Network error";
        results.push({
          name: file.name,
          success: false,
          error: errMsg,
        });
      }
    }

    setUploadResults(results);
    setUploading(false);
    setFilesToUpload([]);
    toast.success("Upload batch process completed!");
    fetchAccounts();
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 pb-16">
      <main className="px-3.5 sm:px-6 lg:px-8 py-5 sm:py-7 max-w-5xl w-full mx-auto space-y-6 animate-fade-in">
        {/* Title */}
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Smart Storage Upload Engine
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Files are automatically dispatched to the optimal Google Drive account according to your allocation strategy.
          </p>
        </div>

        {/* Strategy Selector Strip */}
        <SpotlightCard className="p-5 sm:p-6 space-y-4 shadow-sm border border-border/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground uppercase tracking-wider font-mono">
              1. Select Routing Strategy
            </span>
            <Badge variant="info" className="text-[10px]">
              ALGORITHM ACTIVE
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 items-stretch">
            {STRATEGIES.map((strat) => {
              const isSelected = strategy === strat.id;
              return (
                <button
                  key={strat.id}
                  type="button"
                  onClick={() => setStrategy(strat.id)}
                  className={cn(
                    "p-3 rounded-xl border text-left flex flex-col justify-between h-full space-y-2 transition-all cursor-pointer",
                    isSelected
                      ? "border-primary bg-primary/10 shadow-sm ring-1 ring-primary"
                      : "border-border bg-card hover:bg-accent"
                  )}
                >
                  <div className="space-y-1">
                    <span className={cn("text-xs font-bold block", isSelected ? "text-primary" : "text-foreground")}>
                      {strat.name}
                    </span>
                    <span className="text-[11px] text-muted-foreground leading-tight block">
                      {strat.desc}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {strategy === "MANUAL" && (
            <div className="pt-3 border-t border-border flex items-center gap-3">
              <label className="text-xs font-semibold text-foreground shrink-0">
                Target Account:
              </label>
              <select
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
                className="input text-xs max-w-sm"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.email} ({formatBytes(Number(acc.availableStorage))} free)
                  </option>
                ))}
              </select>
            </div>
          )}
        </SpotlightCard>

        {/* Drag and Drop Zone */}
        <SpotlightCard className="p-6 sm:p-7 space-y-4 shadow-sm border border-border/80">
          <span className="text-xs font-bold text-foreground uppercase tracking-wider font-mono">
            2. Drop Files
          </span>

          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-2xl p-6 sm:p-10 text-center flex flex-col items-center justify-center space-y-3 cursor-pointer transition-all",
              isDragActive
                ? "border-primary bg-primary/5 scale-[0.99]"
                : "border-border hover:border-border/80 bg-muted/20"
            )}
          >
            <input {...getInputProps()} />
            <div className="size-12 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
              <UploadCloud className="size-6" />
            </div>

            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">
                {isDragActive
                  ? "Drop files here to queue"
                  : "Drag and drop files here, or click to browse"}
              </p>
              <p className="text-xs text-muted-foreground">
                Supports all file types (documents, images, videos, archives)
              </p>
            </div>
          </div>

          {/* Queue List */}
          {filesToUpload.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground">
                  Queued Files ({filesToUpload.length})
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilesToUpload([])}
                  className="text-muted-foreground hover:text-destructive text-xs h-7"
                >
                  Clear all
                </Button>
              </div>

              <div className="divide-y divide-border max-h-60 overflow-y-auto border border-border rounded-xl bg-card">
                {filesToUpload.map((file, idx) => (
                  <div
                    key={idx}
                    className="p-3 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileIcon className="size-4 text-muted-foreground shrink-0" />
                      <div className="flex flex-col min-w-0">
                        <span className="font-medium text-foreground truncate">
                          {file.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {formatBytes(file.size)}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="p-1 rounded text-muted-foreground hover:text-destructive cursor-pointer"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <Button
                onClick={handleStartUpload}
                disabled={uploading}
                className="w-full py-2.5 text-xs font-semibold gap-2 justify-center shadow-sm"
              >
                {uploading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Uploading & Routing via {strategy}...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="size-4" />
                    <span>Dispatch {filesToUpload.length} Files to Cloud Pool</span>
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Results Summary */}
          {uploadResults.length > 0 && (
            <div className="space-y-2 pt-3 border-t border-border">
              <span className="text-xs font-bold text-foreground block">
                Upload Results:
              </span>
              <div className="space-y-1.5">
                {uploadResults.map((res, i) => (
                  <div
                    key={i}
                    className={cn(
                      "p-2.5 rounded-xl border flex items-center justify-between text-xs",
                      res.success
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                        : "bg-destructive/10 border-destructive/20 text-destructive"
                    )}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {res.success ? (
                        <CheckCircle2 className="size-4 shrink-0" />
                      ) : (
                        <AlertTriangle className="size-4 shrink-0" />
                      )}
                      <span className="font-medium truncate">{res.name}</span>
                    </div>

                    <span className="text-[11px] font-mono shrink-0 ml-2">
                      {res.success
                        ? `Stored on ${res.accountEmail}`
                        : res.error}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </SpotlightCard>
      </main>
    </div>
  );
}
