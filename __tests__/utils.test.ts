import { describe, it, expect } from "vitest";
import { formatBytes, getInitials, cn } from "@/lib/utils";

describe("lib/utils", () => {
  describe("formatBytes", () => {
    it("should format 0 bytes correctly", () => {
      expect(formatBytes(0)).toBe("0 B");
      expect(formatBytes(0n)).toBe("0 B");
    });

    it("should format small bytes (< 1024) as B", () => {
      expect(formatBytes(1)).toBe("1 B");
      expect(formatBytes(512)).toBe("512 B");
      expect(formatBytes(1023)).toBe("1023 B");
    });

    it("should transition accurately at 1 KB, 1 MB, 1 GB, 1 TB boundaries", () => {
      expect(formatBytes(1024)).toBe("1 KB");
      expect(formatBytes(1024 * 1024)).toBe("1 MB");
      expect(formatBytes(1024 * 1024 * 1024)).toBe("1 GB");
      expect(formatBytes(1024 * 1024 * 1024 * 1024)).toBe("1 TB");
    });

    it("should handle BigInt values correctly", () => {
      const fifteenGBBigInt = 15n * 1024n * 1024n * 1024n;
      expect(formatBytes(fifteenGBBigInt)).toBe("15 GB");

      const twoTBBigInt = 2n * 1024n * 1024n * 1024n * 1024n;
      expect(formatBytes(twoTBBigInt)).toBe("2 TB");
    });

    it("should honor custom decimals parameter", () => {
      const bytes = 1.256 * 1024 * 1024; // ~1.256 MB
      expect(formatBytes(bytes, 1)).toBe("1.3 MB");
      expect(formatBytes(bytes, 2)).toBe("1.26 MB");
      expect(formatBytes(bytes, 0)).toBe("1 MB");
    });
  });

  describe("getInitials", () => {
    it("should return single uppercase initial for single word name", () => {
      expect(getInitials("SkyDrive")).toBe("S");
      expect(getInitials("resky")).toBe("R");
    });

    it("should return two initials for full names", () => {
      expect(getInitials("Resky Prabowo")).toBe("RP");
      expect(getInitials("takahashi otoha")).toBe("TO");
    });

    it("should cap initials at maximum 2 characters", () => {
      expect(getInitials("Andrean Dwi Sahara")).toBe("AD");
      expect(getInitials("First Middle Last Name")).toBe("FM");
    });

    it("should handle extra spaces gracefully", () => {
      expect(getInitials("   Alice    Bob   ")).toBe("AB");
    });
  });

  describe("cn (tailwind merge + clsx)", () => {
    it("should combine simple class names", () => {
      const result = cn("flex", "items-center", "justify-between");
      expect(result).toBe("flex items-center justify-between");
    });

    it("should resolve conflicting Tailwind utility classes", () => {
      // p-4 should override p-2
      const result = cn("p-2 text-sm", "p-4 font-bold");
      expect(result).toContain("p-4");
      expect(result).not.toContain("p-2");
      expect(result).toContain("text-sm");
      expect(result).toContain("font-bold");
    });

    it("should filter out falsy and conditional values", () => {
      const isActive = false;
      const isPending = true;
      const result = cn(
        "btn",
        isActive && "btn-active",
        isPending && "btn-pending",
        null,
        undefined
      );
      expect(result).toBe("btn btn-pending");
    });
  });
});

