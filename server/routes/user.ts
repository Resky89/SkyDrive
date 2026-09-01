import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { authMiddleware, type Env } from "../middleware/auth";

export const updateProfileSchema = z.object({
  name: z.string().trim().min(1).optional(),
  image: z.string().nullable().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, { message: "Current password is required" }),
  newPassword: z.string().min(8, { message: "Password must be at least 8 characters" }),
});

export const userRouter = new Hono<Env>()
  .use("*", authMiddleware)

  // 1. Get User Profile & Providers
  .get("/profile", async (c) => {
    const sessionUser = c.get("user");

    const user = await db.user.findUnique({
      where: { id: sessionUser.id },
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
      return c.json({ error: "User not found" }, 404);
    }

    const isGoogleUser = user.accounts.some(
      (acc) => acc.providerId === "google"
    );
    const isCredentialUser = user.accounts.some(
      (acc) => acc.providerId === "credential"
    );

    return c.json({
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
  })

  // 2. Update Profile Name / Image
  .patch(
    "/profile",
    zValidator("json", updateProfileSchema),
    async (c) => {
      const sessionUser = c.get("user");
      const { name, image } = c.req.valid("json");

      const updateData: { name?: string; image?: string | null } = {};

      if (typeof name === "string" && name.trim()) {
        updateData.name = name.trim();
      }

      if (image !== undefined) {
        updateData.image = typeof image === "string" && image.trim() ? image.trim() : null;
      }

      if (Object.keys(updateData).length === 0) {
        return c.json({ error: "No fields to update provided" }, 400);
      }

      const updatedUser = await db.user.update({
        where: { id: sessionUser.id },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      });

      return c.json({
        success: true,
        user: updatedUser,
        message: "Profil berhasil diperbarui",
      });
    }
  )

  // 3. Change Password
  .post(
    "/password",
    zValidator("json", changePasswordSchema),
    async (c) => {
      const sessionUser = c.get("user");

      const user = await db.user.findUnique({
        where: { id: sessionUser.id },
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
        return c.json({ error: "User not found" }, 404);
      }

      const isCredentialUser = user.accounts.some(
        (acc) => acc.providerId === "credential"
      );
      if (!isCredentialUser) {
        return c.json(
          { error: "Akun login via Google tidak menggunakan password lokal" },
          400
        );
      }

      const { currentPassword, newPassword } = c.req.valid("json");

      try {
        const result = await auth.api.changePassword({
          body: {
            currentPassword,
            newPassword,
            revokeOtherSessions: false,
          },
          headers: c.req.raw.headers,
        });

        return c.json({
          success: true,
          message: "Password berhasil diperbarui",
          result,
        });
      } catch (error: any) {
        console.error("Change password error:", error);
        const msg =
          error?.message ||
          "Gagal mengubah password. Pastikan password saat ini benar.";
        return c.json({ error: msg }, 400);
      }
    }
  );
