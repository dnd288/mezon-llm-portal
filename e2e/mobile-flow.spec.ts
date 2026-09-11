import { test, expect } from "./fixtures/auth";

test.describe("Mobile Viewport & Navigation Drawer Flow", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test.beforeEach(async ({ authedPage }) => {
    await authedPage.goto("/dashboard");
  });

  test("hides desktop sidebar and renders mobile hamburger menu", async ({
    authedPage,
  }) => {
    // Desktop aside is hidden on mobile
    await expect(authedPage.locator("aside")).toBeHidden();

    // Mobile hamburger menu button is visible
    const menuBtn = authedPage.getByRole("button", { name: "Mở menu" });
    await expect(menuBtn).toBeVisible();
  });

  test("opens drawer sheet, verifies user identity, and navigates to API Keys", async ({
    authedPage,
  }) => {
    // Open hamburger drawer
    await authedPage.getByRole("button", { name: "Mở menu" }).click();

    // Drawer content is displayed
    const drawer = authedPage.getByRole("dialog");
    await expect(drawer).toBeVisible();

    // User identity in drawer
    await expect(drawer.getByText("test_developer")).toBeVisible();
    await expect(drawer.getByText("ID: 9999")).toBeVisible();

    // Nav links inside drawer
    await expect(drawer.getByRole("link", { name: "Dashboard" })).toBeVisible();
    await expect(drawer.getByRole("link", { name: "API Keys" })).toBeVisible();
    await expect(drawer.getByRole("link", { name: "Lịch sử sử dụng" })).toBeVisible();
    await expect(drawer.getByRole("link", { name: "Voucher" })).toBeVisible();
    await expect(drawer.getByRole("link", { name: "Đăng xuất" })).toBeVisible();

    // Navigate to API Keys from mobile menu
    await drawer.getByRole("link", { name: "API Keys" }).click();
    await expect(authedPage).toHaveURL(/\/tokens/);

    // Close the sheet if still open
    await authedPage.keyboard.press("Escape");
    await expect(drawer).not.toBeVisible();

    await expect(
      authedPage.getByRole("heading", { name: "API Keys" }),
    ).toBeVisible();
  });
});
