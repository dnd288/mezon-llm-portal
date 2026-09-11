import { test, expect } from "./fixtures/auth";

test.describe("Authenticated Portal Layout & Navigation", () => {
  test("redirects authenticated user away from /login to /dashboard", async ({
    authedPage,
  }) => {
    await authedPage.goto("/login");
    await expect(authedPage).toHaveURL(/\/dashboard/);
  });

  test("renders portal sidebar with user identity and navigation links", async ({
    authedPage,
    isMobile,
  }) => {
    await authedPage.goto("/dashboard");

    if (isMobile) {
      const menuBtn = authedPage.getByRole("button", { name: "Mở menu" });
      await expect(menuBtn).toBeVisible();
      await menuBtn.click();

      const drawer = authedPage.getByRole("dialog");
      await expect(drawer).toBeVisible();
      await expect(drawer.getByText("test_developer")).toBeVisible();
      await expect(drawer.getByText("ID: 9999")).toBeVisible();
      await expect(drawer.getByRole("link", { name: "Dashboard" })).toBeVisible();
      await expect(drawer.getByRole("link", { name: "API Keys" })).toBeVisible();
      await expect(drawer.getByRole("link", { name: "Lịch sử sử dụng" })).toBeVisible();
      await expect(drawer.getByRole("link", { name: "Voucher" })).toBeVisible();
      await expect(drawer.getByRole("link", { name: "Đăng xuất" })).toBeVisible();
      return;
    }

    // Check user info rendered in the sidebar
    await expect(authedPage.getByText("test_developer").first()).toBeVisible();
    await expect(authedPage.getByText("ID: 9999").first()).toBeVisible();

    // Check portal navigation items
    await expect(authedPage.getByRole("link", { name: "Dashboard" }).first()).toBeVisible();
    await expect(authedPage.getByRole("link", { name: "API Keys" }).first()).toBeVisible();
    await expect(authedPage.getByRole("link", { name: "Lịch sử sử dụng" }).first()).toBeVisible();
    await expect(authedPage.getByRole("link", { name: "Voucher" }).first()).toBeVisible();

    // Check logout action link
    await expect(authedPage.getByRole("link", { name: "Đăng xuất" })).toBeVisible();
  });

  test("renders /dashboard smoke test with balance, stats, and setup guides", async ({
    authedPage,
  }) => {
    await authedPage.goto("/dashboard");

    // Greeting and description
    await expect(
      authedPage.getByRole("heading", { name: /Xin chào,/i }),
    ).toBeVisible();
    await expect(
      authedPage.getByText("Tổng quan tài khoản và thống kê sử dụng."),
    ).toBeVisible();

    // Balance card & quick action
    await expect(authedPage.getByText("Số dư khả dụng")).toBeVisible();
    await expect(
      authedPage.getByRole("button", { name: /Nhập Voucher/i }),
    ).toBeVisible();

    // Setup guides tabs
    await expect(
      authedPage.getByRole("tab", { name: "Claude Code" }),
    ).toBeVisible();
    await expect(
      authedPage.getByRole("tab", { name: "OpenCode" }),
    ).toBeVisible();
  });

  test("renders /tokens smoke test with header, create button, and token table", async ({
    authedPage,
  }) => {
    await authedPage.goto("/tokens");

    await expect(
      authedPage.getByRole("heading", { name: "API Keys" }),
    ).toBeVisible();
    await expect(
      authedPage.getByText("Quản lý các API key để truy cập Mezon LLM."),
    ).toBeVisible();

    const createBtn = authedPage.getByRole("button", { name: /Tạo Key Mới/i });
    await expect(createBtn).toBeVisible();

    // Table header columns
    await expect(authedPage.getByRole("columnheader", { name: "Tên" })).toBeVisible();
    await expect(authedPage.getByRole("columnheader", { name: "Trạng thái" })).toBeVisible();
    await expect(authedPage.getByRole("columnheader", { name: "Hạn mức" })).toBeVisible();
  });

  test("renders /logs smoke test with header and log table", async ({
    authedPage,
  }) => {
    await authedPage.goto("/logs");

    await expect(
      authedPage.getByRole("heading", { name: "Nhật ký sử dụng" }),
    ).toBeVisible();
    await expect(
      authedPage.getByText("Xem lịch sử sử dụng API và quota đã tiêu thụ."),
    ).toBeVisible();

    // Log table columns
    await expect(authedPage.getByRole("columnheader", { name: "Thời gian" })).toBeVisible();
    await expect(authedPage.getByRole("columnheader", { name: "Model" })).toBeVisible();
    await expect(authedPage.getByRole("columnheader", { name: "Token Input" })).toBeVisible();
    await expect(authedPage.getByRole("columnheader", { name: "Token Output" })).toBeVisible();
    await expect(authedPage.getByRole("columnheader", { name: "Fee" })).toBeVisible();
  });

  test("renders /vouchers smoke test with header and voucher action", async ({
    authedPage,
  }) => {
    await authedPage.goto("/vouchers");

    await expect(authedPage.getByText("Lịch sử nạp")).toBeVisible();
    await expect(
      authedPage.getByRole("button", { name: /Nhập Voucher/i }),
    ).toBeVisible();
  });
});
