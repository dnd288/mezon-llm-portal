import { test, expect } from "./fixtures/auth";

test.describe("Authenticated Portal Layout & Navigation", () => {
  test("redirects authenticated user away from /login to /dashboard", async ({
    authedPage,
  }) => {
    await authedPage.goto("/login");
    await expect(authedPage).toHaveURL(/\/dashboard/);
  });

  test("renders portal sidebar with user identity and navigation links", async ({
    authedPage,
  }) => {
    await authedPage.goto("/dashboard");

    // Check user info rendered in the sidebar
    await expect(authedPage.getByText("test_developer").first()).toBeVisible();
    await expect(authedPage.getByText("ID: 9999").first()).toBeVisible();

    // Check portal navigation items
    await expect(authedPage.getByRole("link", { name: "Dashboard" }).first()).toBeVisible();
    await expect(authedPage.getByRole("link", { name: "API Keys" }).first()).toBeVisible();
    await expect(authedPage.getByRole("link", { name: "Lịch sử sử dụng" }).first()).toBeVisible();
    await expect(authedPage.getByRole("link", { name: "Voucher" }).first()).toBeVisible();

    // Check logout action link
    await expect(authedPage.getByRole("link", { name: "Đăng xuất" })).toBeVisible();
  });
});
