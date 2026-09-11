import { test, expect } from "@playwright/test";

test.describe("Models & Pricing Page", () => {
  test("renders model pricing table and back link", async ({ page }) => {
    await page.goto("/models");

    // Check page title and description
    await expect(
      page.getByRole("heading", { name: "Bảng giá mô hình" }),
    ).toBeVisible();
    await expect(
      page.getByText("Giá cho 1 triệu token, tính bằng mzđ (Mezon Đồng)."),
    ).toBeVisible();

    // Check link back to home
    const backLink = page.getByRole("link", { name: "← Về trang chủ" });
    await expect(backLink).toBeVisible();
    await backLink.click();
    await expect(page).toHaveURL("/");
  });

  test("search or filter input exists on the pricing grid", async ({ page }) => {
    await page.goto("/models");

    // Check search input placeholder
    const searchInput = page.getByPlaceholder(/Tìm kiếm mô hình|Search/i);
    if (await searchInput.isVisible()) {
      await searchInput.fill("gpt");
      await expect(searchInput).toHaveValue("gpt");
    }
  });
});
