import { test, expect, MOCK_URL } from "./fixtures/auth";

test.describe("Usage Logs & Pagination Flow", () => {
  test.beforeEach(async ({ authedPage, request }) => {
    // Reset mock backend state
    await request.post(`${MOCK_URL}/__test_reset`);
    await authedPage.goto("/logs");
  });

  test("renders usage logs table with details and model badges", async ({ authedPage }) => {
    await expect(
      authedPage.getByRole("heading", { name: "Nhật ký sử dụng" }),
    ).toBeVisible();
    await expect(
      authedPage.getByText("Xem lịch sử sử dụng API và quota đã tiêu thụ."),
    ).toBeVisible();

    // Verify table headers
    await expect(authedPage.getByRole("columnheader", { name: "Thời gian" })).toBeVisible();
    await expect(authedPage.getByRole("columnheader", { name: "Model" })).toBeVisible();
    await expect(authedPage.getByRole("columnheader", { name: "Key" })).toBeVisible();
    await expect(authedPage.getByRole("columnheader", { name: "Token Input" })).toBeVisible();
    await expect(authedPage.getByRole("columnheader", { name: "Token Output" })).toBeVisible();
    await expect(authedPage.getByRole("columnheader", { name: "Fee" })).toBeVisible();
    await expect(authedPage.getByRole("columnheader", { name: "Total Time" })).toBeVisible();

    // Verify model entries
    await expect(authedPage.getByText("claude-3-5-sonnet")).toBeVisible();
    await expect(authedPage.getByText("gpt-4o")).toBeVisible();

    // Verify associated token name
    await expect(authedPage.getByRole("cell", { name: "Production App" }).first()).toBeVisible();
  });

  test("displays pagination controls with correct initial state", async ({ authedPage }) => {
    // Pagination indicator
    await expect(authedPage.getByText(/Trang 1 \/ 1/i)).toBeVisible();

    // 'Trước' and 'Sau' buttons should be disabled for single page
    const prevBtn = authedPage.getByRole("link", { name: /Trước/i });
    const nextBtn = authedPage.getByRole("link", { name: /Sau/i });

    await expect(prevBtn).toHaveAttribute("aria-disabled", "true");
    await expect(nextBtn).toHaveAttribute("aria-disabled", "true");
  });

  test("navigates forward and backward between pages when records exceed page size", async ({
    authedPage,
    request,
  }) => {
    // Seed 25 log records (PAGE_SIZE is 20, creating 2 pages)
    await request.post(`${MOCK_URL}/__test_set_state`, {
      data: { seedPagination: true },
    });

    await authedPage.goto("/logs");

    // Expect Page 1 / 2
    await expect(authedPage.getByText(/Trang 1 \/ 2/i)).toBeVisible();

    const prevBtn = authedPage.getByRole("link", { name: /Trước/i });
    const nextBtn = authedPage.getByRole("link", { name: /Sau/i });

    // On page 1: Prev is disabled, Next is enabled
    await expect(prevBtn).toHaveAttribute("aria-disabled", "true");
    await expect(nextBtn).not.toHaveAttribute("aria-disabled", "true");

    // Click 'Sau' to navigate to page 2
    await nextBtn.click();
    await expect(authedPage).toHaveURL(/\/logs\?page=2/);
    await expect(authedPage.getByText(/Trang 2 \/ 2/i)).toBeVisible();

    // On page 2: Prev is enabled, Next is disabled
    await expect(authedPage.getByRole("link", { name: /Trước/i })).not.toHaveAttribute("aria-disabled", "true");
    await expect(authedPage.getByRole("link", { name: /Sau/i })).toHaveAttribute("aria-disabled", "true");

    // Click 'Trước' to return to page 1
    await authedPage.getByRole("link", { name: /Trước/i }).click();
    await expect(authedPage).toHaveURL(/\/logs\?page=1/);
    await expect(authedPage.getByText(/Trang 1 \/ 2/i)).toBeVisible();
  });
});
