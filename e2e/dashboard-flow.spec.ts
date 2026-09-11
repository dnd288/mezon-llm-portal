import { test, expect } from "./fixtures/auth";

test.describe("Dashboard Flow & Features", () => {
  test.beforeEach(async ({ authedPage, request }) => {
    await request.post("http://localhost:3099/__test_reset");
    await authedPage.goto("/dashboard");
  });

  test("displays user greeting and live quota balance", async ({ authedPage }) => {
    // Check personalized greeting
    await expect(
      authedPage.getByRole("heading", { name: /Xin chào,/i }),
    ).toBeVisible();

    // Check balance section
    await expect(authedPage.getByText("Số dư khả dụng")).toBeVisible();
    await expect(authedPage.getByText(/mzđ · Mezon Đồng/i)).toBeVisible();

    // The mock backend returns 5,000,000 mzđ quota formatted as 5.00M
    await expect(authedPage.getByText("5.00M")).toBeVisible();
  });

  test("displays usage statistics correctly", async ({ authedPage }) => {
    // Usage stats component shows quota and request count
    await expect(authedPage.getByText("Đã sử dụng")).toBeVisible();
    await expect(authedPage.getByText("Lượt gọi")).toBeVisible();
    await expect(authedPage.getByText("42").first()).toBeVisible();
  });

  test("switches between setup guide tabs and renders corresponding instructions", async ({
    authedPage,
  }) => {
    const card = authedPage.locator("text=Hướng dẫn cài đặt").locator("..");
    await expect(card).toBeVisible();

    // Default tab is Claude Code
    await expect(authedPage.getByRole("tab", { name: "Claude Code" })).toBeVisible();
    await expect(authedPage.getByText(/claude config set/i)).toBeVisible();

    // Switch to OpenCode
    await authedPage.getByRole("tab", { name: "OpenCode" }).click();
    await expect(authedPage.getByText(/Thêm vào file cấu hình opencode/i)).toBeVisible();

    // Switch to OMP
    await authedPage.getByRole("tab", { name: "OMP" }).click();
    await expect(authedPage.getByText(/omp --model gpt-4o/i)).toBeVisible();

    // Switch to Cursor
    await authedPage.getByRole("tab", { name: "Cursor" }).click();
    await expect(authedPage.getByText(/Trong Cursor Settings/i)).toBeVisible();

    // Switch to Hermes
    await authedPage.getByRole("tab", { name: "Hermes" }).click();
    await expect(authedPage.getByText(/Hermes sẽ tự động sử dụng/i)).toBeVisible();
  });

  test("navigates via quick action cards to /tokens and /logs", async ({ authedPage }) => {
    // Click on API Keys shortcut
    const tokensLink = authedPage.getByRole("link", { name: "Mở API Keys" });
    await expect(tokensLink).toBeVisible();
    await tokensLink.click();
    await expect(authedPage).toHaveURL(/\/tokens/);

    // Return to dashboard and click on Logs shortcut
    await authedPage.goto("/dashboard");
    const logsLink = authedPage.getByRole("link", { name: "Mở lịch sử sử dụng" });
    await expect(logsLink).toBeVisible();
    await logsLink.click();
    await expect(authedPage).toHaveURL(/\/logs/);
  });

  test("opens and closes the Voucher dialog from dashboard header", async ({ authedPage }) => {
    const openVoucherBtn = authedPage.getByRole("button", { name: /Nhập Voucher/i });
    await expect(openVoucherBtn).toBeVisible();
    await openVoucherBtn.click();

    // Dialog should be open
    await expect(
      authedPage.getByRole("heading", { name: "Nhập mã Voucher" }),
    ).toBeVisible();
    await expect(authedPage.locator("#voucher-code")).toBeVisible();

    // Click cancel to close
    await authedPage.getByRole("button", { name: "Hủy" }).click();
    await expect(
      authedPage.getByRole("heading", { name: "Nhập mã Voucher" }),
    ).not.toBeVisible();
  });
});
