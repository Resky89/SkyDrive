import { hc } from "hono/client";
import type { AppType } from "@/server";

// Get base URL for RPC Client
const baseUrl =
  typeof window !== "undefined"
    ? window.location.origin
    : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// Export type-safe RPC client
export const client = hc<AppType>(baseUrl);
