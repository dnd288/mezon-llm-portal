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

    // Check search input placeholder and type without conditional assertion
    const searchInput = page.getByPlaceholder(/Tìm kiếm mô hình|Search/i);
    await expect(searchInput).toBeVisible();
    await searchInput.fill("gpt");
    await expect(searchInput).toHaveValue("gpt");
  });

  test("filters models by search query and displays empty state when no match", async ({ page }) => {
    await page.goto("/models");

    const searchInput = page.getByPlaceholder(/Tìm kiếm mô hình|Search/i);
    await expect(searchInput).toBeVisible();

    // Filter for claude
    await searchInput.fill("claude");
    await expect(page.getByText("claude-3-5-sonnet").first()).toBeVisible();
    await expect(page.getByText("gpt-4o")).not.toBeVisible();

    // Search for non-existent model to verify empty state
    await searchInput.fill("nonexistent-model-xyz");
    await expect(page.getByText("Không tìm thấy model phù hợp.")).toBeVisible();

    // Clear search to restore all models
    await searchInput.fill("");
    await expect(page.getByText("claude-3-5-sonnet").first()).toBeVisible();
    await expect(page.getByText("gpt-4o").first()).toBeVisible();
  });

  test("filters models using provider category chips", async ({ page }) => {
    await page.goto("/models");

    // Click on 'anthropic' provider filter chip
    const anthropicBtn = page.getByRole("button", { name: /anthropic/i });
    await expect(anthropicBtn).toBeVisible();
    await anthropicBtn.click();
    await expect(page.getByText("claude-3-5-sonnet").first()).toBeVisible();
    await expect(page.getByText("gpt-4o")).not.toBeVisible();

    // Click 'Tất cả' chip to reset filter
    const allBtn = page.getByRole("button", { name: /Tất cả/i }).first();
    await expect(allBtn).toBeVisible();
    await allBtn.click();
    await expect(page.getByText("gpt-4o").first()).toBeVisible();
  });

  test("copies model name to clipboard on button click", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/models");

    // Click copy button on a model card
    const copyBtn = page.getByRole("button", { name: /Sao chép/i }).first();
    await expect(copyBtn).toBeVisible();
    await copyBtn.click();
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText.length).toBeGreaterThan(0);
  });
});
