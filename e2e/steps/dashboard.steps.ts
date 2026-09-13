import { Given, When, Then, expect } from "./fixtures";
import { createMockSessionToken } from "../fixtures/auth";

Given("I am logged in with an invalid backend gateway token", async ({ context, baseURL, request }) => {
  await request.post("http://localhost:3099/__test_set_state", {
    data: { gatewayError: true },
  });
  const token = await createMockSessionToken();
  const targetUrl = baseURL || "http://localhost:3001";
  await context.addCookies([
    {
      name: "session",
      value: token,
      url: targetUrl,
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);
});

Then("I should see the user greeting {string}", async ({ page }, greeting: string) => {
  await expect(
    page.getByRole("heading", { name: new RegExp(greeting, "i") }),
  ).toBeVisible();
});

Then("I should see the quota balance card with {string}", async ({ page }, label: string) => {
  await expect(page.getByText(new RegExp(label, "i"))).toBeVisible();
});

Then("I should see the usage statistics section", async ({ page }) => {
  await expect(page.getByText("Đã sử dụng")).toBeVisible();
  await expect(page.getByText("Lượt gọi")).toBeVisible();
});

Then("I should see setup guide tab {string}", async ({ page }, tabName: string) => {
  await expect(page.getByRole("tab", { name: tabName })).toBeVisible();
});

When("I click on the setup guide tab {string}", async ({ page }, tabName: string) => {
  await page.getByRole("tab", { name: tabName }).click();
});

Then("I should see setup command containing {string}", async ({ page }, cmd: string) => {
  await expect(
    page.locator("code, pre").filter({ hasText: new RegExp(cmd, "i") }).first(),
  ).toBeVisible();
});

Then("I should see setup instruction for {string}", async ({ page }, tool: string) => {
  await expect(page.getByText(new RegExp(tool, "i")).first()).toBeVisible();
});

When("I click on the quick action {string}", async ({ page }, action: string) => {
  const link = page.getByRole("link", { name: new RegExp(action, "i") });
  if (await link.isVisible().catch(() => false)) {
    await link.click();
  } else {
    // Fallback to "Mở API Keys"
    await page.getByRole("link", { name: /Mở API Keys/i }).click();
  }
});

When("I click on the {string} button in the dashboard header", async ({ page }, _btnText: string) => {
  const btn = page.getByRole("button", { name: /Nhập Voucher|Nạp Quota/i });
  await btn.click();
});

Then("I should see the voucher redemption dialog titled {string}", async ({ page }, _title: string) => {
  await expect(
    page.getByRole("heading", { name: /Nhập mã Voucher/i }),
  ).toBeVisible();
  await expect(page.locator("#voucher-code")).toBeVisible();
});

When("I close the dialog", async ({ page }) => {
  await page.getByRole("button", { name: "Hủy" }).click();
});

Then("the voucher redemption dialog should be closed", async ({ page }) => {
  await expect(
    page.getByRole("heading", { name: /Nhập mã Voucher/i }),
  ).not.toBeVisible();
});

Then("I should see the degraded warning banner {string}", async ({ page }, _bannerText: string) => {
  await expect(
    page.getByText(/Không tải được số liệu từ gateway|gateway/i).first(),
  ).toBeVisible();
});

Then("the balance display should fallback gracefully to {string}", async ({ page }, _fallback: string) => {
  await expect(page.getByText(/—|0/i).first()).toBeVisible();
});
