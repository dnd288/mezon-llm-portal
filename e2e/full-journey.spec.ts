import { test, expect } from "@playwright/test";
import { createMockSessionToken, MOCK_URL } from "./fixtures/auth";

test.describe("Complete End-to-End User Journey (Full Flow)", () => {
  test.beforeEach(async ({ request }) => {
    // Reset mock backend state before test
    await request.post(`${MOCK_URL}/__test_reset`);
  });

  test("unauthenticated visitor explores landing, logs in, manages tokens, redeems voucher, inspects logs, and logs out", async ({
    page,
    context,
    baseURL,
    isMobile,
  }) => {
    const targetUrl = baseURL || "http://localhost:3001";

    // ─── 1. Public Visitor Journey: Landing & Pricing ───────────────────
    await page.goto("/");
    await expect(page.getByText("MEZON LLM", { exact: true })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Gateway AI chi phí thấp/i }),
    ).toBeVisible();

    // Explore pricing
    await page.getByRole("link", { name: /Xem bảng giá/i }).click();
    await expect(page).toHaveURL(/\/models/);
    await expect(
      page.getByRole("heading", { name: "Bảng giá mô hình" }),
    ).toBeVisible();

    // Filter models
    const searchInput = page.getByPlaceholder(/Tìm model|Tìm kiếm mô hình|Search/i);
    await searchInput.fill("claude");
    await expect(page.getByText("claude-3-5-sonnet").first()).toBeVisible();

    // Return to landing
    await page.getByRole("link", { name: "← Về trang chủ" }).click();
    await expect(page).toHaveURL("/");

    // ─── 2. Auth Flow: Starting Login ────────────────────────────────────
    await page.getByRole("link", { name: /Bắt đầu ngay/i }).click();
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole("heading", { name: "Đăng nhập" })).toBeVisible();

    // Authenticate by injecting session token
    const token = await createMockSessionToken();
    await context.addCookies([
      {
        name: "session",
        value: token,
        url: targetUrl,
        httpOnly: true,
        sameSite: "Lax",
      },
    ]);

    // Navigate to /login while authenticated -> should auto-redirect to /dashboard
    await page.goto("/login");
    await expect(page).toHaveURL(/\/dashboard/);

    // ─── 3. Dashboard Experience ─────────────────────────────────────────
    await expect(page.getByRole("heading", { name: /Xin chào,/i })).toBeVisible();
    await expect(page.getByText("Số dư khả dụng")).toBeVisible();
    await expect(page.getByText("5.00M")).toBeVisible();
    await expect(page.getByText("42").first()).toBeVisible();

    // Switch guide tab to Cursor
    await page.getByRole("tab", { name: "Cursor" }).click();
    await expect(page.getByText(/Trong Cursor Settings/i)).toBeVisible();

    // Navigate to API Keys via quick action card
    await page.getByRole("link", { name: "Mở API Keys" }).click();
    await expect(page).toHaveURL(/\/tokens/);

    // ─── 4. API Key Lifecycle: Create, Copy, Delete ───────────────────────
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await expect(page.getByRole("heading", { name: "API Keys" })).toBeVisible();

    // Open create dialog
    await page.getByRole("button", { name: /Tạo Key Mới/i }).click();
    await page.locator("#token-name").fill("Full Journey Key");
    await page.locator("#token-quota").fill("100000");
    await page.getByRole("button", { name: "Tạo Key", exact: true }).click();

    // Verify key revealed and copy
    await expect(page.getByRole("heading", { name: "Key đã được tạo" })).toBeVisible();
    await page.getByRole("button", { name: "Sao chép key" }).click();
    await expect(page.getByText("Đã sao chép")).toBeVisible();

    // Close modal
    await page.getByRole("button", { name: "Đóng" }).click();
    await expect(page.getByRole("cell", { name: "Full Journey Key", exact: true })).toBeVisible();

    // Delete the key
    const deleteBtn = page.getByRole("button", { name: /Xóa key Full Journey Key/i });
    await deleteBtn.click();
    await page.getByRole("button", { name: "Xóa", exact: true }).click();
    await expect(page.getByText("Đã xóa key thành công")).toBeVisible();
    await expect(page.getByRole("cell", { name: "Full Journey Key", exact: true })).not.toBeVisible();

    // ─── 5. Voucher Flow: View History & Redeem ──────────────────────────
    if (isMobile) {
      await page.getByRole("button", { name: "Mở menu" }).click();
      await page.getByRole("link", { name: "Voucher" }).first().click();
      await page.keyboard.press("Escape");
    } else {
      await page.getByRole("link", { name: "Voucher" }).first().click();
    }
    await expect(page).toHaveURL(/\/vouchers/);
    await expect(page.getByText("Lịch sử nạp")).toBeVisible();
    await expect(page.getByText("Nạp bằng voucher")).toBeVisible();

    // Open Voucher Dialog
    await page.getByRole("button", { name: /Nhập Voucher/i }).click();
    await page.locator("#voucher-code").fill("MZ-FULL-JOURNEY-250K");
    await page.getByRole("button", { name: "Xác nhận" }).click();

    // Verifies new topup entry appears after reload
    await expect(page.getByText("+250.0K")).toBeVisible({ timeout: 10000 });

    // ─── 6. Usage Logs Flow ──────────────────────────────────────────────
    if (isMobile) {
      await page.getByRole("button", { name: "Mở menu" }).click();
      await page.getByRole("link", { name: "Lịch sử sử dụng" }).first().click();
      await page.keyboard.press("Escape");
    } else {
      await page.getByRole("link", { name: "Lịch sử sử dụng" }).first().click();
    }
    await expect(page).toHaveURL(/\/logs/);
    await expect(page.getByRole("heading", { name: "Nhật ký sử dụng" })).toBeVisible();
    await expect(page.getByText("claude-3-5-sonnet")).toBeVisible();

    // ─── 7. Logout Flow & Auth Guard ─────────────────────────────────────
    if (isMobile) {
      await page.getByRole("button", { name: "Mở menu" }).click();
    }
    const logoutBtn = page.getByRole("link", { name: "Đăng xuất" });
    await expect(logoutBtn).toBeVisible();
    await logoutBtn.click();

    // Redirected to landing page after logout
    await expect(page).toHaveURL("/");

    // Attempting to visit /dashboard now should be blocked by Auth Guard
    await page.goto("/dashboard");
    await expect(page).toHaveURL(new RegExp(`/login\\?callbackUrl=.*`));
    await expect(page.getByRole("heading", { name: "Đăng nhập" })).toBeVisible();
  });
});
