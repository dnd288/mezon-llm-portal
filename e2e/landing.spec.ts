import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test("displays hero heading, branding, and ecosystem section", async ({
    page,
  }) => {
    await page.goto("/");

    // Verify brand logo & title
    await expect(page.getByText("MEZON LLM", { exact: true })).toBeVisible();
    await expect(page.getByText("API GATEWAY")).toBeVisible();

    // Verify hero heading
    await expect(
      page.getByRole("heading", { name: /Gateway AI chi phí thấp/i }),
    ).toBeVisible();

    // Verify CTAs exist
    const startCta = page.getByRole("link", { name: /Bắt đầu ngay/i });
    const pricingCta = page.getByRole("link", { name: /Xem bảng giá/i });
    await expect(startCta).toBeVisible();
    await expect(pricingCta).toBeVisible();

    // Verify ecosystem links
    await expect(page.getByText("Thuộc hệ sinh thái Mezon")).toBeVisible();
    await expect(page.getByAltText("CoBar Logo")).toBeVisible();
  });

  test("navigates to /models when clicking 'Xem bảng giá'", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /Xem bảng giá/i }).click();
    await expect(page).toHaveURL(/\/models/);
  });
});
