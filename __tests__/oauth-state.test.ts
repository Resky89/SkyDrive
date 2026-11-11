import { describe, it, expect, beforeAll } from "vitest";
import crypto from "crypto";
import { signOAuthState, verifyAndParseOAuthState } from "@/server/routes/google";

describe("OAuth State HMAC Signing & Verification", () => {
  beforeAll(() => {
    process.env.ENCRYPTION_KEY = crypto.randomBytes(32).toString("hex");
  });

  it("should sign state and verify valid payload", () => {
    const payload = {
      userId: "user_test_123",
      email: "test@example.com",
      nonce: "random-nonce-abc",
      ts: Date.now(),
    };

    const signed = signOAuthState(payload);
    expect(signed).toContain(".");

    const verified = verifyAndParseOAuthState(signed);
    expect(verified).not.toBeNull();
    expect(verified?.userId).toBe(payload.userId);
    expect(verified?.nonce).toBe(payload.nonce);
    expect(verified?.email).toBe(payload.email);
  });

  it("should reject tampered signature", () => {
    const payload = {
      userId: "user_test_123",
      nonce: "nonce_123",
      ts: Date.now(),
    };

    const signed = signOAuthState(payload);
    const [data, sig] = signed.split(".");

    // Alter the signature
    const tamperedSig = sig.slice(0, -1) + (sig.endsWith("a") ? "b" : "a");
    const tampered = `${data}.${tamperedSig}`;

    const verified = verifyAndParseOAuthState(tampered);
    expect(verified).toBeNull();
  });

  it("should reject tampered payload data", () => {
    const payload = {
      userId: "user_legitimate",
      nonce: "nonce_123",
      ts: Date.now(),
    };

    const signed = signOAuthState(payload);
    const [, sig] = signed.split(".");

    // Tampered data attempting to impersonate victim
    const attackerPayload = {
      userId: "victim_user_456",
      nonce: "nonce_123",
      ts: Date.now(),
    };
    const attackerData = Buffer.from(JSON.stringify(attackerPayload)).toString("base64url");
    const forged = `${attackerData}.${sig}`;

    const verified = verifyAndParseOAuthState(forged);
    expect(verified).toBeNull();
  });

  it("should reject expired state (older than 10 minutes)", () => {
    const elevenMinutesAgo = Date.now() - 11 * 60 * 1000;
    const expiredPayload = {
      userId: "user_test_123",
      nonce: "nonce_123",
      ts: elevenMinutesAgo,
    };

    const signed = signOAuthState(expiredPayload);
    const verified = verifyAndParseOAuthState(signed);
    expect(verified).toBeNull();
  });

  it("should reject malformed state strings", () => {
    expect(verifyAndParseOAuthState("")).toBeNull();
    expect(verifyAndParseOAuthState("invalid-no-dot")).toBeNull();
    expect(verifyAndParseOAuthState("part1.part2.part3")).toBeNull();
  });
});

