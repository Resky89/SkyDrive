import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";

export async function GET(_request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
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
          accountId: true,
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const isGoogleUser = user.accounts.some((acc) => acc.providerId === "google");
  const isCredentialUser = user.accounts.some((acc) => acc.providerId === "credential");

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      createdAt: user.createdAt,
    },
    isGoogleUser,
    isCredentialUser,
    providers: user.accounts.map((acc) => acc.providerId),
  });
}

export async function PATCH(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, image } = body;

  const updateData: { name?: string; image?: string | null } = {};

  if (typeof name === "string" && name.trim()) {
    updateData.name = name.trim();
  }

  if (image !== undefined) {
    updateData.image = typeof image === "string" && image.trim() ? image.trim() : null;
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "No changes provided" }, { status: 400 });
  }

  const updatedUser = await db.user.update({
    where: { id: session.user.id },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({
    success: true,
    user: updatedUser,
    message: "Profile updated successfully",
  });
}
