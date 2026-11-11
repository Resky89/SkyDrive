import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { isAllowedOrigin } from "@/server/index";
import { getAuthSecret, getBaseUrl } from "@/lib/auth";

describe("Security & CORS & Auth Config", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("CORS isAllowedOrigin validator", () => {
    it("should allow production domain https://skydrive.web.id", () => {
      expect(isAllowedOrigin("https://skydrive.web.id")).toBe(true);
      expect(isAllowedOrigin("https://skydrive.web.id/")).toBe(true);
    });

    it("should allow local development origins", () => {
      expect(isAllowedOrigin("http://localhost:3000")).toBe(true);
      expect(isAllowedOrigin("http://localhost:3001")).toBe(true);
    });

    it("should allow official project vercel preview deployments", () => {
      expect(isAllowedOrigin("https://skydrive-preview-123.vercel.app")).toBe(true);
      expect(isAllowedOrigin("https://resky89-skydrive-deploy.vercel.app")).toBe(true);
    });

    it("should strictly reject unauthorized or spoofed domains", () => {
      expect(isAllowedOrigin("https://evil-skydrive.web.id")).toBe(false);
      expect(isAllowedOrigin("https://attacker.com")).toBe(false);
      expect(isAllowedOrigin("https://unrelated-app.vercel.app")).toBe(false);
      expect(isAllowedOrigin("http://localhost:8080")).toBe(false);
      expect(isAllowedOrigin("")).toBe(false);
    });
  });

  describe("getAuthSecret production protection", () => {
    it("should throw a fatal error when BETTER_AUTH_SECRET is missing in production", () => {
      delete process.env.BETTER_AUTH_SECRET;
      (process.env as Record<string, string | undefined>).NODE_ENV = "production";

      expect(() => getAuthSecret()).toThrowError(
        "FATAL: BETTER_AUTH_SECRET is not configured in production environment variables."
      );
    });

    it("should return the configured secret when present in production", () => {
      process.env.BETTER_AUTH_SECRET = "super-secret-key-32-chars-long-here";
      (process.env as Record<string, string | undefined>).NODE_ENV = "production";

      expect(getAuthSecret()).toBe("super-secret-key-32-chars-long-here");
    });

    it("should fallback to dev secret in development or test environment", () => {
      delete process.env.BETTER_AUTH_SECRET;
      (process.env as Record<string, string | undefined>).NODE_ENV = "test";

      expect(getAuthSecret()).toBe("skydrive-dev-only-secret-key-min-32-chars-long");
    });
  });

  describe("getBaseUrl resolution", () => {
    it("should prioritize BETTER_AUTH_URL if set", () => {
      process.env.BETTER_AUTH_URL = "https://custom-auth.skydrive.web.id";
      expect(getBaseUrl()).toBe("https://custom-auth.skydrive.web.id");
    });

    it("should use NEXT_PUBLIC_APP_URL if BETTER_AUTH_URL is not set", () => {
      delete process.env.BETTER_AUTH_URL;
      process.env.NEXT_PUBLIC_APP_URL = "https://skydrive.web.id";
      expect(getBaseUrl()).toBe("https://skydrive.web.id");
    });

    it("should fallback to localhost:3000 when no url env variables exist", () => {
      delete process.env.BETTER_AUTH_URL;
      delete process.env.NEXT_PUBLIC_APP_URL;
      delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
      delete process.env.VERCEL_URL;

      expect(getBaseUrl()).toBe("http://localhost:3000");
    });
  });
});
