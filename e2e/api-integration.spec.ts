import { test, expect } from "@playwright/test";

test.describe("Backend Hono HTTP API Integration", () => {
  test("GET /api/health should respond with healthy status 200", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.status()).toBe(200);

    const data = await res.json();
    expect(data.status).toBe("healthy");
    expect(data.timestamp).toBeDefined();
  });

  test("GET /api/unknown-endpoint should respond with 404 JSON", async ({ request }) => {
    const res = await request.get("/api/non-existent-endpoint-test");
    expect(res.status()).toBe(404);

    const data = await res.json();
    expect(data.error).toBe("Endpoint Not Found");
  });

  test("Protected endpoints should enforce 401 when unauthenticated", async ({ request }) => {
    // Files route
    const filesRes = await request.get("/api/files");
    expect(filesRes.status()).toBe(401);

    // Initiate upload route
    const uploadRes = await request.post("/api/files/initiate-upload", {
      data: {
        fileName: "document.pdf",
        fileSize: 1024,
        mimeType: "application/pdf",
      },
    });
    expect(uploadRes.status()).toBe(401);

    // Storage analytics route
    const storageRes = await request.get("/api/storage/analytics");
    expect(storageRes.status()).toBe(401);
  });

  test("CORS headers should reflect trusted origins on OPTIONS", async ({ request }) => {
    const res = await request.fetch("/api/health", {
      method: "OPTIONS",
      headers: {
        Origin: "https://skydrive.web.id",
        "Access-Control-Request-Method": "GET",
      },
    });

    expect(res.headers()["access-control-allow-origin"]).toBe("https://skydrive.web.id");
    expect(res.headers()["access-control-allow-credentials"]).toBe("true");
  });
});

