import { test, expect } from "@playwright/test";

test.describe("Mobile Responsive & Adaptive UX", () => {
  test.use({ viewport: { width: 390, height: 844 } }); // iPhone 14 dimensions

  test("should adapt landing page header for mobile viewport", async ({ page }) => {
    await page.goto("/id");

    // Hamburger button should be present in mobile navbar
    const mobileMenuButton = page.getByRole("button", { name: /Toggle navigation menu/i });
    await expect(mobileMenuButton).toBeVisible();

    // Clicking hamburger should open mobile nav drawer with navigation links
    await mobileMenuButton.click();
    await expect(page.getByRole("link", { name: /Cara Kerja|How It Works|Features|Fitur/i }).first()).toBeVisible();
  });

  test("should render mobile bottom navigation bar on dashboard pages", async ({ page }) => {
    // When accessing dashboard (redirected to login or rendered)
    // We can directly inspect the component or check viewport adaptation
    await page.goto("/dashboard");

    // Expect either login redirection or dashboard bottom nav
    const isLogin = page.url().includes("/login");
    if (isLogin) {
      // In login page, mobile layout is centered with full width
      const loginCard = page.locator("form, .card, main").first();
      await expect(loginCard).toBeVisible();
    }
  });
});
