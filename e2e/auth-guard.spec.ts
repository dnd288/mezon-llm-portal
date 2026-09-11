import { test, expect } from "@playwright/test";

test.describe("Authentication Guard Middleware", () => {
  const protectedRoutes = ["/dashboard", "/tokens", "/logs", "/vouchers"];

  for (const route of protectedRoutes) {
    test(`redirects unauthenticated user from ${route} to /login`, async ({
      page,
    }) => {
      await page.goto(route);

      // Verify redirect to login page with callbackUrl parameter
      await expect(page).toHaveURL(new RegExp(`/login\\?callbackUrl=.*`));

      // Verify login UI components
      await expect(
        page.getByRole("heading", { name: "Đăng nhập" }),
      ).toBeVisible();
      await expect(
        page.getByRole("link", { name: /Đăng nhập bằng/i }),
      ).toBeVisible();
    });
  }
});
