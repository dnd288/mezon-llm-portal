import { test, expect, MOCK_URL } from "./fixtures/auth";

test.describe("Vouchers & Top-up History Flow", () => {
  test.beforeEach(async ({ authedPage, request }) => {
    // Reset mock backend state
    await request.post(`${MOCK_URL}/__test_reset`);
    await authedPage.goto("/vouchers");
  });

  test("renders top-up transaction history", async ({ authedPage }) => {
    await expect(authedPage.getByText("Lịch sử nạp")).toBeVisible();

    // Verify parsed transaction labels
    await expect(authedPage.getByText("Nạp bằng voucher")).toBeVisible();
    await expect(authedPage.getByText("+500.0K")).toBeVisible();

    await expect(authedPage.getByText("Nạp qua Mezon")).toBeVisible();
    await expect(authedPage.getByText("+1.00M")).toBeVisible();
  });

  test("shows error toast when submitting invalid voucher code", async ({ authedPage }) => {
    await authedPage.getByRole("button", { name: /Nhập Voucher/i }).click();

    await expect(
      authedPage.getByRole("heading", { name: "Nhập mã Voucher" }),
    ).toBeVisible();

    // Fill invalid code
    await authedPage.locator("#voucher-code").fill("INVALID_CODE");
    await authedPage.getByRole("button", { name: "Xác nhận" }).click();

    // Error toast appears with 'Lỗi'
    await expect(authedPage.getByText("Lỗi")).toBeVisible();
  });

  test("successfully redeems valid voucher code and refreshes transactions", async ({
    authedPage,
  }) => {
    await authedPage.getByRole("button", { name: /Nhập Voucher/i }).click();

    // Fill valid code
    await authedPage.locator("#voucher-code").fill("MZ-FREE-250K-PROMO");
    await authedPage.getByRole("button", { name: "Xác nhận" }).click();

    // Dialog closes and page reloads with the new +250.0K top-up entry
    await expect(authedPage.getByText("+250.0K")).toBeVisible({ timeout: 10000 });
  });
});
