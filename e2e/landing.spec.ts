import { test, expect } from "@playwright/test";

test.describe("Landing Page & Public Experience", () => {
  test("should render the landing page hero with key elements", async ({ page }) => {
    await page.goto("/");

    // Verify main brand heading or logo is visible
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator("img[alt='SkyDrive']").first()).toBeVisible();

    // Verify Call to Action buttons exist
    const startFreeBtn = page.getByRole("link", { name: /Mulai Sekarang Gratis|Start Free Now/i }).first();
    await expect(startFreeBtn).toBeVisible();
  });

  test("should support multi-language routing (/en and /id)", async ({ page }) => {
    // English landing
    await page.goto("/en");
    await expect(page).toHaveURL(/\/en/);
    await expect(page.getByText(/Combine All Your Google Drives/i).first()).toBeVisible();

    // Indonesian landing
    await page.goto("/id");
    await expect(page).toHaveURL(/\/id/);
    await expect(page.getByText(/Gabungkan Semua/i).first()).toBeVisible();
  });

  test("should have functional storage calculator simulation", async ({ page }) => {
    await page.goto("/id");

    // Scroll down to Storage Calculator section
    const calcSection = page.locator("#kalkulator, #calculator, [data-section='calculator']").first();
    if (await calcSection.count() > 0) {
      await calcSection.scrollIntoViewIfNeeded();
      await expect(calcSection).toBeVisible();
    }

    // Verify storage volume indicators
    const volumeBadge = page.getByText(/15 GB|30 GB|45 GB|GB/i).first();
    await expect(volumeBadge).toBeVisible();
  });

  test("should have working legal links to privacy and terms", async ({ page }) => {
    await page.goto("/privacy");
    await expect(page).toHaveURL(/\/privacy/);
    await expect(page.getByText(/Privacy Policy|Kebijakan Privasi/i).first()).toBeVisible();

    await page.goto("/terms");
    await expect(page).toHaveURL(/\/terms/);
    await expect(page.getByText(/Terms of Service|Syarat & Ketentuan/i).first()).toBeVisible();
  });
});
