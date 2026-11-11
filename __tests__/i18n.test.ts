import { describe, it, expect } from "vitest";
import { LANGUAGES, VALID_LANGS } from "@/lib/languages";
import { translations } from "@/lib/i18n";

describe("lib/i18n & languages", () => {
  it("should have valid language definitions for all supported languages", () => {
    expect(VALID_LANGS).toEqual(["en", "id", "ja", "zh", "ko"]);
    expect(LANGUAGES.length).toBe(5);

    LANGUAGES.forEach((lang) => {
      expect(VALID_LANGS).toContain(lang.code);
      expect(lang.name).toBeDefined();
      expect(lang.nativeName).toBeDefined();
      expect(lang.flag).toBeDefined();
      expect(typeof lang.flag).toBe("string");
    });
  });

  it("should ensure all languages have core navigation and translation keys", () => {
    const supportedLangs = ["en", "id", "ja", "zh", "ko"] as const;
    const requiredKeys = [
      "navFeatures",
      "navHowItWorks",
      "navCalculator",
      "navSecurity",
      "navFaq",
      "navDashboard",
      "navLogin",
      "navRegister",
      "heroTitlePart1",
      "heroSubtitle",
      "menuOverview",
      "menuAccounts",
      "menuUploads",
      "menuFiles",
      "menuAnalytics",
      "menuSettings",
    ];

    supportedLangs.forEach((lang) => {
      const dict = translations[lang] as Record<string, string>;
      expect(dict, `Translation dictionary for ${lang} should exist`).toBeDefined();

      requiredKeys.forEach((key) => {
        expect(
          dict[key],
          `Missing key "${key}" in translation language "${lang}"`
        ).toBeDefined();
        expect(typeof dict[key]).toBe("string");
        expect(dict[key].trim().length).toBeGreaterThan(0);
      });
    });
  });

  it("should have matching key structures across english and indonesian", () => {
    const enKeys = Object.keys(translations.en);
    const idKeys = Object.keys(translations.id);

    // Core keys should be present in both
    const commonSampleKeys = [
      "sidebarWorkspace",
      "sidebarCategoryPhoto",
      "sidebarCategoryVideo",
      "sidebarCategoryDocument",
      "sidebarCategoryFree",
      "headerSearch",
      "headerSync",
      "headerUpload",
    ];

    commonSampleKeys.forEach((key) => {
      expect(enKeys).toContain(key);
      expect(idKeys).toContain(key);
    });
  });
});
