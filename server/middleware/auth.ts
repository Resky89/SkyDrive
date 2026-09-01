import { createMiddleware } from "hono/factory";
import { auth } from "@/lib/auth";

export type Env = {
  Variables: {
    user: {
      id: string;
      email: string;
      name: string;
      image?: string | null;
    };
    session: {
      id: string;
      userId: string;
      expiresAt: Date;
    };
  };
};

export const authMiddleware = createMiddleware<Env>(async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session || !session.user) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  c.set("session", session.session);
  c.set("user", session.user);
  await next();
});
