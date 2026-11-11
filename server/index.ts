import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { filesRouter } from "./routes/files";
import { foldersRouter } from "./routes/folders";
import { googleRouter } from "./routes/google";
import { storageRouter } from "./routes/storage";
import { userRouter } from "./routes/user";

// Whitelist of allowed origins for CORS
const ALLOWED_ORIGIN_SET = new Set(
  [
    "https://skydrive.web.id",
    "http://localhost:3000",
    "http://localhost:3001",
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.BETTER_AUTH_URL,
  ]
    .filter(Boolean)
    .map((url) => url!.replace(/\/$/, ""))
);

const isAllowedOrigin = (origin: string): boolean => {
  if (!origin) return false;
  const cleanOrigin = origin.replace(/\/$/, "");
  if (ALLOWED_ORIGIN_SET.has(cleanOrigin)) return true;
  // Allow official Vercel preview deployments for this project
  if (
    cleanOrigin.endsWith(".vercel.app") &&
    (cleanOrigin.includes("skydrive") || cleanOrigin.includes("resky89"))
  ) {
    return true;
  }
  return false;
};

// Create root Hono instance with /api basePath
const app = new Hono()
  .basePath("/api")
  .use("*", logger())
  .use(
    "*",
    cors({
      origin: (origin) => (isAllowedOrigin(origin) ? origin : null),
      allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowHeaders: ["Content-Type", "Authorization", "Cookie"],
      credentials: true,
    })
  )
  .onError((err, c) => {
    console.error("Hono Global Server Error:", err);
    return c.json(
      {
        error: err.message || "Internal Server Error",
        status: 500,
      },
      500
    );
  })
  .notFound((c) => {
    return c.json({ error: "Endpoint Not Found" }, 404);
  })
  // Health check endpoint
  .get("/health", (c) => {
    return c.json({ status: "healthy", timestamp: new Date().toISOString() });
  })
  // Mount Modular Sub-Routers
  .route("/files", filesRouter)
  .route("/folders", foldersRouter)
  .route("/google", googleRouter)
  .route("/storage", storageRouter)
  .route("/user", userRouter);

export type AppType = typeof app;
export default app;
