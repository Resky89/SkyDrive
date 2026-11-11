import { test, expect } from "@playwright/test";

test.describe("Authentication Guards & Auth Pages", () => {
  test("should redirect unauthenticated users from /dashboard to /login", async ({ page }) => {
    await page.goto("/dashboard");
    // Should be redirected to /login by middleware
    await expect(page).toHaveURL(/\/login/);
  });

  test("should redirect unauthenticated users from /dashboard/files to /login", async ({ page }) => {
    await page.goto("/dashboard/files");
    await expect(page).toHaveURL(/\/login/);
  });

  test("should redirect unauthenticated users from /dashboard/uploads to /login", async ({ page }) => {
    await page.goto("/dashboard/uploads");
    await expect(page).toHaveURL(/\/login/);
  });

  test("should render login page with form inputs and Google OAuth button", async ({ page }) => {
    await page.goto("/login");

    // Check login form elements
    await expect(page.getByRole("textbox", { name: /email/i })).toBeVisible();
    await expect(page.getByLabel(/password/i).or(page.locator("input[type='password']"))).toBeVisible();

    // Check Google Login button exists
    const googleBtn = page.getByRole("button", { name: /google/i });
    await expect(googleBtn).toBeVisible();
  });

  test("should render registration page with required fields", async ({ page }) => {
    await page.goto("/register");

    await expect(page.getByRole("textbox", { name: /name|nama/i })).toBeVisible();
    await expect(page.getByRole("textbox", { name: /email/i })).toBeVisible();
    await expect(page.locator("input[type='password']").first()).toBeVisible();
  });
});

