"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  User,
  ShieldCheck,
  HardDrive,
  Mail,
  Calendar,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  Settings,
  Plus,
  Loader2,
  CheckCircle2,
  Info,
  Sparkles,
  Save,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { formatBytes, getInitials } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { useLanguage } from "@/lib/i18n";
import { toast } from "sonner";

interface ProfileAnalytics {
  summary: {
    totalAccounts: number;
    activeAccounts: number;
    totalFiles: number;
    totalStorage: string;
    usedStorage: string;
    availableStorage: string;
    usagePercentage: number;
  };
  accounts: Array<{
    id: string;
    email: string;
    displayName?: string | null;
    avatarUrl?: string | null;
    totalStorage: string;
    usedStorage: string;
    availableStorage: string;
    usagePercentage: number;
  }>;
}

interface UserProfileData {
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    createdAt: string;
  };
  isGoogleUser: boolean;
  isCredentialUser: boolean;
  providers: string[];
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const { t } = useLanguage();
  
  const [data, setData] = useState<ProfileAnalytics | null>(null);
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  // Identity Form State
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isSavingIdentity, setIsSavingIdentity] = useState(false);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const fetchProfileInfo = async () => {
    try {
      setLoading(true);
      const [analyticsRes, profileRes] = await Promise.all([
        fetch("/api/storage/analytics"),
        fetch("/api/user/profile"),
      ]);

      if (analyticsRes.ok) {
        const analyticsJson = await analyticsRes.json();
        setData(analyticsJson);
      }

      if (profileRes.ok) {
        const profileJson = await profileRes.json();
        setProfileData(profileJson);
        setDisplayName(profileJson.user.name || "");
        setAvatarUrl(profileJson.user.image || "");
      }
    } catch {
      toast.error("Gagal memuat data profil");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileInfo();
  }, []);

  useEffect(() => {
    const handleRefresh = () => fetchProfileInfo();
    window.addEventListener("skydrive:refresh", handleRefresh);
    return () => window.removeEventListener("skydrive:refresh", handleRefresh);
  }, []);

  const handleUpdateIdentity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      toast.error("Nama tampilan tidak boleh kosong");
      return;
    }

    setIsSavingIdentity(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: displayName.trim(),
          image: avatarUrl.trim() || null,
        }),
      });

      const json = await res.json();
      if (res.ok) {
        toast.success(t.profileIdentitySuccess);
        if (profileData) {
          setProfileData({
            ...profileData,
            user: {
              ...profileData.user,
              name: json.user.name,
              image: json.user.image,
            },
          });
        }
      } else {
        toast.error(json.error || "Gagal memperbarui data diri");
      }
    } catch {
      toast.error("Terjadi kesalahan koneksi saat menyimpan profil");
    } finally {
      setIsSavingIdentity(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword) {
      toast.error("Password saat ini dan password baru wajib diisi");
      return;
    }

    if (newPassword.length < 8) {
      toast.error(t.profilePasswordMinLength);
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error(t.profilePasswordMismatch);
      return;
    }

    setIsSavingPassword(true);
    try {
      const res = await fetch("/api/user/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const json = await res.json();
      if (res.ok) {
        toast.success(t.profilePasswordSuccess);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(json.error || "Gagal memperbarui password");
      }
    } catch {
      toast.error("Terjadi kesalahan saat mengganti password");
    } finally {
      setIsSavingPassword(false);
    }
  };

  const currentUser = profileData?.user || session?.user;
  const isGoogle = profileData?.isGoogleUser ?? false;
  const isCredential = profileData?.isCredentialUser ?? true;

  return (
    <div className="flex-1 flex flex-col min-w-0 pb-16">
      <main className="px-6 sm:px-8 py-7 max-w-5xl w-full mx-auto space-y-6 animate-fade-in">
        {/* Title */}
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            {t.profileTitle}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t.profileSubtitle}
          </p>
        </div>

        {/* User Identity Card */}
        <SpotlightCard className="p-6 sm:p-8 border border-border shadow-md relative overflow-hidden bg-card">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <Avatar className="size-20 rounded-3xl border-2 border-primary/40 shadow-lg shadow-primary/10">
                {currentUser?.image ? (
                  <AvatarImage
                    src={currentUser.image}
                    alt={currentUser.name || "User Avatar"}
                    referrerPolicy="no-referrer"
                    className="object-cover rounded-3xl"
                  />
                ) : null}
                <AvatarFallback className="rounded-3xl text-xl font-bold bg-primary/20 text-primary">
                  {currentUser?.name ? getInitials(currentUser.name) : "SD"}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-extrabold text-foreground tracking-tight">
                    {currentUser?.name || "Cloud User"}
                  </h2>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
                  <Mail className="size-3.5" />
                  <span>{currentUser?.email || "user@skydrive.app"}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground pt-0.5">
                  <Calendar className="size-3.5" />
                  <span>
                    Member Since {currentUser?.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : "2026"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-stretch sm:self-auto">
              <Button asChild variant="outline" size="sm" className="gap-1.5 shadow-xs flex-1 sm:flex-initial">
                <Link href="/dashboard/settings">
                  <Settings className="size-3.5" />
                  <span>{t.menuSettings}</span>
                </Link>
              </Button>
            </div>
          </div>
        </SpotlightCard>

        {/* 2-Column Forms: Update Identity & Password Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Identity Update Form (7 Cols if Password enabled, or Full Width) */}
          <SpotlightCard className={isCredential ? "lg:col-span-7 p-6 space-y-5 border border-border shadow-xs bg-card h-full flex flex-col justify-between" : "lg:col-span-12 p-6 space-y-5 border border-border shadow-xs bg-card h-full flex flex-col justify-between"}>
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
                  <User className="size-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    {t.profilePersonal}
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    {isGoogle ? "Ubah nama tampilan Anda di dalam aplikasi SkyDrive" : "Perbarui informasi nama dan avatar profil Anda"}
                  </p>
                </div>
              </div>
            </div>

            {/* Google Notice Banner if logged in via Google */}
            {isGoogle && (
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-foreground flex items-start gap-2.5 leading-relaxed">
                <Info className="size-4 text-blue-500 shrink-0 mt-0.5" />
                <span className="text-[11px] text-muted-foreground">
                  {t.profileGoogleNote}
                </span>
              </div>
            )}

            <form onSubmit={handleUpdateIdentity} className="space-y-4 flex flex-col justify-between flex-1">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    {t.profileNameLabel}
                  </label>
                  <Input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Nama Lengkap / Tampilan"
                    required
                    className="text-xs h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    {t.profileEmailLabel}
                  </label>
                  <Input
                    type="email"
                    value={currentUser?.email || ""}
                    disabled
                    className="text-xs h-9 opacity-70 cursor-not-allowed bg-muted/40 font-mono"
                  />
                  <span className="text-[10px] text-muted-foreground">
                    Email akun utama terikat dengan autentikasi SkyDrive
                  </span>
                </div>

                {/* Avatar URL option for credential accounts or custom avatar */}
                {!isGoogle && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      {t.profileAvatarLabel}
                    </label>
                    <Input
                      type="url"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="https://example.com/avatar.jpg"
                      className="text-xs h-9 font-mono"
                    />
                    <span className="text-[10px] text-muted-foreground">
                      URL gambar publik untuk foto profil Anda
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-3 flex justify-end mt-auto">
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSavingIdentity || !displayName.trim()}
                  className="gap-1.5 text-xs font-semibold shadow-xs"
                >
                  {isSavingIdentity ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      <span>Menyimpan…</span>
                    </>
                  ) : (
                    <>
                      <Save className="size-3.5" />
                      <span>{t.profileSaveIdentityBtn}</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </SpotlightCard>

          {/* Password Update Form (5 Cols) - Rendered ONLY for Credential / Non-Google Only Accounts */}
          {isCredential ? (
            <SpotlightCard className="lg:col-span-5 p-6 space-y-5 border border-border shadow-xs bg-card h-full flex flex-col justify-between">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center">
                    <Lock className="size-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">
                      {t.profilePasswordSectionTitle}
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      {t.profilePasswordSectionDesc}
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleUpdatePassword} className="space-y-3.5 flex flex-col justify-between flex-1">
                <div className="space-y-3.5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      {t.profileCurrentPassword}
                    </label>
                    <div className="relative">
                      <Input
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="text-xs h-9 pr-8"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        {showCurrentPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      {t.profileNewPassword}
                    </label>
                    <div className="relative">
                      <Input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Min. 8 karakter"
                        required
                        className="text-xs h-9 pr-8"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        {showNewPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      {t.profileConfirmPassword}
                    </label>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Ulangi password baru"
                      required
                      className="text-xs h-9"
                    />
                  </div>
                </div>

                <div className="pt-3 flex justify-end mt-auto">
                  <Button
                    type="submit"
                    variant="default"
                    size="sm"
                    disabled={isSavingPassword || !currentPassword || !newPassword || !confirmPassword}
                    className="gap-1.5 text-xs font-semibold shadow-xs"
                  >
                    {isSavingPassword ? (
                      <>
                        <Loader2 className="size-3.5 animate-spin" />
                        <span>Memperbarui…</span>
                      </>
                    ) : (
                      <>
                        <KeyRound className="size-3.5" />
                        <span>{t.profileBtnChangePassword}</span>
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </SpotlightCard>
          ) : (
            /* Google OAuth Security Info Card */
            <SpotlightCard className="lg:col-span-12 p-6 space-y-4 border border-border shadow-xs bg-card">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center">
                  <ShieldCheck className="size-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Autentikasi Aman Terkelola Google
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    {t.profileGoogleSecurityNote}
                  </p>
                </div>
              </div>
            </SpotlightCard>
          )}
        </div>

        {/* 2-Column Details: Storage Pool + Security Enclave */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Storage Pool Snapshot (7 cols) */}
          <SpotlightCard className="lg:col-span-7 p-6 space-y-4 border border-border shadow-md bg-card h-full flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="size-4 text-primary" />
                <h3 className="text-sm font-bold text-foreground">
                  {t.profileLinkedDrives}
                </h3>
              </div>
              <Badge variant="outline" className="text-xs font-mono border-primary/30 text-primary">
                {data?.summary?.totalAccounts || 0} Drives
              </Badge>
            </div>

            {loading ? (
              <div className="py-8 flex justify-center">
                <Loader2 className="size-5 animate-spin text-primary" />
              </div>
            ) : !data?.accounts || data.accounts.length === 0 ? (
              <div className="p-6 text-center space-y-3 rounded-2xl bg-secondary/30 border border-border/60">
                <p className="text-xs text-muted-foreground">No accounts linked yet.</p>
                <Button asChild size="sm" className="gap-1.5 shadow-sm">
                  <Link href="/dashboard/accounts">
                    <Plus className="size-3.5" />
                    <span>Link Google Account</span>
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {data.accounts.map((acc) => (
                  <div
                    key={acc.id}
                    className="p-3 rounded-2xl bg-secondary/40 border border-border/70 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="size-8 rounded-xl border border-border/70">
                        {acc.avatarUrl && (
                          <AvatarImage
                            src={acc.avatarUrl}
                            alt={acc.displayName || acc.email}
                            referrerPolicy="no-referrer"
                            className="object-cover rounded-xl"
                          />
                        )}
                        <AvatarFallback className="rounded-xl text-[10px] font-bold bg-primary/10 text-primary">
                          {acc.email[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-foreground truncate">
                          {acc.displayName || acc.email.split("@")[0]}
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground truncate">
                          {acc.email}
                        </span>
                      </div>
                    </div>

                    <div className="text-right font-mono text-[11px] shrink-0">
                      <span className="font-semibold text-foreground">
                        {formatBytes(Number(acc.usedStorage))}
                      </span>
                      <span className="text-muted-foreground block text-[9px]">
                        / {formatBytes(Number(acc.totalStorage))}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SpotlightCard>

          {/* Security & Enclave Status (5 cols) */}
          <SpotlightCard className="lg:col-span-5 p-6 space-y-4 border border-border shadow-md flex flex-col justify-between bg-card h-full">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-emerald-500" />
                <h3 className="text-sm font-bold text-foreground">
                  {t.profileSecurity}
                </h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                OAuth access & refresh tokens are encrypted at rest using AES-256-GCM enclaves. No file binaries are cached on intermediary proxies.
              </p>

              <div className="space-y-2 pt-2 border-t border-border/60">
                {[
                  "OAuth 2.0 PKCE Enclave",
                  "AES-256-GCM Token Encryption",
                  "Zero File Binary Retention",
                  "Direct Google API Transport",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground">
                    <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-border/60 mt-auto">
              <Button asChild variant="outline" size="sm" className="w-full text-xs font-medium">
                <Link href="/dashboard/accounts">Manage Enclave & Drives</Link>
              </Button>
            </div>
          </SpotlightCard>
        </div>
      </main>
    </div>
  );
}
