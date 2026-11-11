import { describe, it, expect } from "vitest";
import app from "@/server/index";

describe("Hono In-Memory API Routes", () => {
  describe("GET /api/health", () => {
    it("should return status 200 with healthy payload", async () => {
      const res = await app.request("/api/health");
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.status).toBe("healthy");
      expect(json.timestamp).toBeDefined();
    });
  });

  describe("404 Not Found Handler", () => {
    it("should return JSON 404 for non-existent endpoints", async () => {
      const res = await app.request("/api/unknown-random-route");
      expect(res.status).toBe(404);

      const json = await res.json();
      expect(json.error).toBe("Endpoint Not Found");
    });
  });

  describe("Authentication Guard on Protected Routes", () => {
    it("should reject unauthenticated requests to /api/files with 401", async () => {
      const res = await app.request("/api/files", {
        method: "GET",
      });

      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toBe("Unauthorized");
    });

    it("should reject unauthenticated upload initiation requests with 401", async () => {
      const res = await app.request("/api/files/initiate-upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName: "test.pdf",
          fileSize: 1024,
          mimeType: "application/pdf",
        }),
      });

      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toBe("Unauthorized");
    });

    it("should reject unauthenticated requests to /api/storage/analytics with 401", async () => {
      const res = await app.request("/api/storage/analytics", {
        method: "GET",
      });

      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toBe("Unauthorized");
    });
  });

  describe("CORS Handling on API Requests", () => {
    it("should reflect allowed origin header for trusted domain", async () => {
      const res = await app.request("/api/health", {
        method: "OPTIONS",
        headers: {
          Origin: "https://skydrive.web.id",
          "Access-Control-Request-Method": "GET",
        },
      });

      expect(res.headers.get("access-control-allow-origin")).toBe(
        "https://skydrive.web.id"
      );
      expect(res.headers.get("access-control-allow-credentials")).toBe("true");
    });

    it("should not reflect allowed origin header for untrusted origin", async () => {
      const res = await app.request("/api/health", {
        method: "OPTIONS",
        headers: {
          Origin: "https://malicious-attacker.com",
          "Access-Control-Request-Method": "GET",
        },
      });

      expect(res.headers.get("access-control-allow-origin")).toBeNull();
    });
  });
});

