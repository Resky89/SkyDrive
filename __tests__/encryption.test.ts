import { describe, it, expect, beforeAll } from "vitest";
import crypto from "crypto";
import { encrypt, decrypt } from "@/lib/encryption";

describe("lib/encryption", () => {
  beforeAll(() => {
    // Generate valid 32-byte (64 hex characters) encryption key for testing
    process.env.ENCRYPTION_KEY = crypto.randomBytes(32).toString("hex");
  });

  it("should encrypt and decrypt plaintext accurately (roundtrip)", () => {
    const secretMessage = "ya29.a0AfH6SMB_secret_google_drive_refresh_token_12345";
    const cipherText = encrypt(secretMessage);

    expect(cipherText).not.toBe(secretMessage);
    expect(typeof cipherText).toBe("string");

    const decrypted = decrypt(cipherText);
    expect(decrypted).toBe(secretMessage);
  });

  it("should generate different ciphertexts for the same plaintext due to random IV", () => {
    const text = "consistent-payload";
    const cipher1 = encrypt(text);
    const cipher2 = encrypt(text);

    expect(cipher1).not.toBe(cipher2);
    expect(decrypt(cipher1)).toBe(text);
    expect(decrypt(cipher2)).toBe(text);
  });

  it("should throw error when decrypting tampered ciphertext", () => {
    const original = encrypt("sensitive-token");
    const buffer = Buffer.from(original, "base64");

    // Tamper with one byte in the ciphertext payload
    buffer[buffer.length - 1] ^= 0xff;
    const tampered = buffer.toString("base64");

    expect(() => decrypt(tampered)).toThrow();
  });
});

