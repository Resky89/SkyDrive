import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      accounts: {
        select: {
          id: true,
          providerId: true,
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const isCredentialUser = user.accounts.some((acc) => acc.providerId === "credential");
  if (!isCredentialUser) {
    return NextResponse.json(
      { error: "Akun login via Google tidak menggunakan password lokal" },
      { status: 400 }
    );
  }

  const body = await request.json();
  const { currentPassword, newPassword } = body;

  if (!currentPassword || !newPassword) {
    return NextResponse.json(
      { error: "Password saat ini dan password baru wajib diisi" },
      { status: 400 }
    );
  }

  if (newPassword.length < 8) {
    return NextResponse.json(
      { error: "Password baru minimal 8 karakter" },
      { status: 400 }
    );
  }

  try {
    const result = await auth.api.changePassword({
      body: {
        currentPassword,
        newPassword,
        revokeOtherSessions: false,
      },
      headers: reqHeaders,
    });

    return NextResponse.json({
      success: true,
      message: "Password berhasil diperbarui",
      result,
    });
  } catch (error: any) {
    console.error("Change password error:", error);
    const msg = error?.message || "Gagal mengubah password. Pastikan password saat ini benar.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
