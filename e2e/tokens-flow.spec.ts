import { test, expect } from "./fixtures/auth";

test.describe("API Keys (Tokens) Lifecycle Flow", () => {
  test.beforeEach(async ({ authedPage, request }) => {
    // Reset mock backend state before each test
    await request.post("http://localhost:3099/__test_reset");
    await authedPage.goto("/tokens");
  });

  test("renders existing API keys with appropriate status badges", async ({ authedPage }) => {
    await expect(authedPage.getByRole("heading", { name: "API Keys" })).toBeVisible();

    // Verify existing tokens rendered from mock backend
    await expect(authedPage.getByRole("cell", { name: "Production App", exact: true })).toBeVisible();
    await expect(authedPage.getByText("Active", { exact: true })).toBeVisible();

    await expect(authedPage.getByRole("cell", { name: "Old Demo Key", exact: true })).toBeVisible();
    await expect(authedPage.getByText("Hết hạn", { exact: true })).toBeVisible();

    await expect(authedPage.getByRole("cell", { name: "Revoked Test Key", exact: true })).toBeVisible();
    await expect(authedPage.getByText("Revoked", { exact: true })).toBeVisible();
  });

  test("validates required token name when creating a new key", async ({ authedPage }) => {
    await authedPage.getByRole("button", { name: /Tạo Key Mới/i }).click();

    await expect(
      authedPage.getByRole("heading", { name: "Tạo API Key Mới" }),
    ).toBeVisible();

    // Attempt submit with empty name
    await authedPage.getByRole("button", { name: "Tạo Key", exact: true }).click();

    // Verify error toast
    await expect(authedPage.getByText("Vui lòng nhập tên key")).toBeVisible();
  });

  test("creates a new API key, reveals secret key, and updates table", async ({
    authedPage,
  }) => {
    await authedPage.context().grantPermissions(["clipboard-read", "clipboard-write"]);
    await authedPage.getByRole("button", { name: /Tạo Key Mới/i }).click();

    // Fill form
    await authedPage.locator("#token-name").fill("Automated E2E Key");
    await authedPage.locator("#token-quota").fill("250000");

    // Submit form
    await authedPage.getByRole("button", { name: "Tạo Key", exact: true }).click();

    // Verify dialog transitions to 'Key đã được tạo'
    await expect(
      authedPage.getByRole("heading", { name: "Key đã được tạo" }),
    ).toBeVisible();
    await expect(
      authedPage.getByText(/Key này chỉ hiển thị một lần/i),
    ).toBeVisible();

    // Check key code block
    const codeEl = authedPage.locator("code");
    await expect(codeEl).toContainText("sk-mock-new-");

    // Copy button
    const copyBtn = authedPage.getByRole("button", { name: "Sao chép key" });
    await expect(copyBtn).toBeVisible();
    await copyBtn.click();
    await expect(authedPage.getByText("Đã sao chép")).toBeVisible();

    // Close dialog
    await authedPage.getByRole("button", { name: "Đóng" }).click();
    await expect(
      authedPage.getByRole("heading", { name: "Key đã được tạo" }),
    ).not.toBeVisible();

    // Verify new token is listed in the table
    await expect(authedPage.getByRole("cell", { name: "Automated E2E Key", exact: true })).toBeVisible();
  });

  test("deletes an API key with confirmation dialog", async ({ authedPage }) => {
    await expect(authedPage.getByRole("cell", { name: "Production App", exact: true })).toBeVisible();

    // Click delete trash icon for 'Production App'
    const deleteBtn = authedPage.getByRole("button", { name: /Xóa key Production App/i });
    await expect(deleteBtn).toBeVisible();
    await deleteBtn.click();

    // Confirm dialog opens
    await expect(
      authedPage.getByRole("heading", { name: "Xác nhận xóa" }),
    ).toBeVisible();
    await expect(
      authedPage.getByText(/Bạn có chắc chắn muốn xóa key "Production App"\?/i),
    ).toBeVisible();

    // Test Cancel first
    await authedPage.getByRole("button", { name: "Hủy" }).click();
    await expect(
      authedPage.getByRole("heading", { name: "Xác nhận xóa" }),
    ).not.toBeVisible();
    await expect(authedPage.getByRole("cell", { name: "Production App", exact: true })).toBeVisible();

    // Open again and confirm delete
    await deleteBtn.click();
    await authedPage.getByRole("button", { name: "Xóa", exact: true }).click();

    // Toast notification
    await expect(authedPage.getByText("Đã xóa key thành công")).toBeVisible();

    // Token should be removed from table
    await expect(authedPage.getByRole("cell", { name: "Production App", exact: true })).not.toBeVisible();
  });
});
