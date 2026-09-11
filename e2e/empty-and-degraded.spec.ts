import { test, expect, MOCK_URL } from "./fixtures/auth";

test.describe("Empty States & Degraded Gateway Handling", () => {
  test.afterEach(async ({ request }) => {
    // Reset state after each test
    await request.post(`${MOCK_URL}/__test_reset`);
  });

  test("displays empty state on /tokens when user has no API keys", async ({
    authedPage,
    request,
  }) => {
    await request.post(`${MOCK_URL}/__test_set_state`, {
      data: { emptyTokens: true },
    });

    await authedPage.goto("/tokens");
    await expect(authedPage.getByRole("heading", { name: "API Keys" })).toBeVisible();
    await expect(
      authedPage.getByText("Bạn chưa có API key nào. Tạo key đầu tiên để bắt đầu."),
    ).toBeVisible();
  });

  test("displays empty state on /logs when user has no usage history", async ({
    authedPage,
    request,
  }) => {
    await request.post(`${MOCK_URL}/__test_set_state`, {
      data: { emptyLogs: true },
    });

    await authedPage.goto("/logs");
    await expect(authedPage.getByRole("heading", { name: "Nhật ký sử dụng" })).toBeVisible();
    await expect(authedPage.getByText("Chưa có dữ liệu sử dụng.")).toBeVisible();
  });

  test("displays empty state on /vouchers when user has no top-ups", async ({
    authedPage,
    request,
  }) => {
    await request.post(`${MOCK_URL}/__test_set_state`, {
      data: { emptyLogs: true },
    });

    await authedPage.goto("/vouchers");
    await expect(authedPage.getByText("Lịch sử nạp")).toBeVisible();
    await expect(authedPage.getByText("Chưa có giao dịch nạp nào.")).toBeVisible();
  });

  test("renders degraded warning banner and balance fallback on /dashboard when gateway is down", async ({
    authedPage,
    request,
  }) => {
    await request.post(`${MOCK_URL}/__test_set_state`, {
      data: { gatewayError: true },
    });

    await authedPage.goto("/dashboard");

    // Gateway failure banner is visible
    await expect(
      authedPage.getByText("Không tải được số liệu từ gateway. Trang vẫn dùng được — thử tải lại sau ít phút."),
    ).toBeVisible();

    // Balance and stats show fallback "—"
    await expect(authedPage.getByText("Số dư khả dụng")).toBeVisible();
    await expect(authedPage.getByText("—").first()).toBeVisible();
  });

  test("renders error container on /tokens when gateway fails", async ({
    authedPage,
    request,
  }) => {
    await request.post(`${MOCK_URL}/__test_set_state`, {
      data: { gatewayError: true },
    });

    await authedPage.goto("/tokens");
    await expect(authedPage.getByRole("heading", { name: "API Keys" })).toBeVisible();
    await expect(authedPage.getByText(/Không thể tải|API 502/i)).toBeVisible();
  });
});
