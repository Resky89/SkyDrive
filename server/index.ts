import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { filesRouter } from "./routes/files";
import { foldersRouter } from "./routes/folders";
import { googleRouter } from "./routes/google";
import { storageRouter } from "./routes/storage";
import { userRouter } from "./routes/user";

// Create root Hono instance with /api basePath
const app = new Hono()
  .basePath("/api")
  .use("*", logger())
  .use(
    "*",
    cors({
      origin: (origin) => origin || "*",
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
