import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  getGoogleRedirectUri,
  getAuthorizationUrl,
  SCOPES,
} from "@/lib/google-drive";

describe("lib/google-drive helpers", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.GOOGLE_CLIENT_ID = "mock-google-client-id.apps.googleusercontent.com";
    process.env.GOOGLE_CLIENT_SECRET = "mock-google-client-secret";
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("SCOPES configuration", () => {
    it("should include necessary google drive and profile scopes", () => {
      expect(SCOPES).toContain("https://www.googleapis.com/auth/drive");
      expect(SCOPES).toContain("https://www.googleapis.com/auth/drive.file");
      expect(SCOPES).toContain("https://www.googleapis.com/auth/userinfo.email");
      expect(SCOPES).toContain("https://www.googleapis.com/auth/userinfo.profile");
    });
  });

  describe("getGoogleRedirectUri", () => {
    it("should honor explicit GOOGLE_REDIRECT_URI if set", () => {
      process.env.GOOGLE_REDIRECT_URI = "https://custom-domain.com/auth/callback";
      expect(getGoogleRedirectUri()).toBe("https://custom-domain.com/auth/callback");
    });

    it("should use NEXT_PUBLIC_APP_URL when present", () => {
      delete process.env.GOOGLE_REDIRECT_URI;
      process.env.NEXT_PUBLIC_APP_URL = "https://skydrive.web.id";
      expect(getGoogleRedirectUri()).toBe("https://skydrive.web.id/api/google/callback");
    });

    it("should fallback to localhost:3000 callback when no domain envs are provided", () => {
      delete process.env.GOOGLE_REDIRECT_URI;
      delete process.env.NEXT_PUBLIC_APP_URL;
      delete process.env.BETTER_AUTH_URL;
      delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
      delete process.env.VERCEL_URL;

      expect(getGoogleRedirectUri()).toBe("http://localhost:3000/api/google/callback");
    });
  });

  describe("getAuthorizationUrl", () => {
    it("should generate a valid Google OAuth consent URL with offline access and prompt", () => {
      process.env.NEXT_PUBLIC_APP_URL = "https://skydrive.web.id";
      const authUrl = getAuthorizationUrl("mock-state-123", "user@gmail.com");

      expect(authUrl).toContain("accounts.google.com");
      expect(authUrl).toContain("client_id=mock-google-client-id");
      expect(authUrl).toContain("access_type=offline");
      expect(authUrl).toContain("state=mock-state-123");
      expect(authUrl).toContain("login_hint=user%40gmail.com");
    });
  });
});

