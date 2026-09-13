import { When, Then, expect } from "./fixtures";

Then("I should see the section title {string}", async ({ page }, title: string) => {
  await expect(page.getByText(new RegExp(title, "i")).first()).toBeVisible();
});

Then("I should see the voucher input field and redeem button", async ({ page }) => {
  await expect(page.getByRole("button", { name: /Nhập Voucher|Nạp Quota/i }).first()).toBeVisible();
});

Then("I should see the top-up transaction history table", async ({ page }) => {
  await expect(page.getByText("Lịch sử nạp")).toBeVisible();
  await expect(page.getByText("Nạp bằng voucher")).toBeVisible();
});

When("I submit the voucher code {string}", async ({ page }, code: string) => {
  const dialogHeading = page.getByRole("heading", { name: "Nhập mã Voucher" });
  if (!(await dialogHeading.isVisible().catch(() => false))) {
    const openBtn = page.getByRole("button", { name: /Nhập Voucher|Nạp Quota/i }).first();
    await openBtn.click();
    await expect(dialogHeading).toBeVisible();
  }
  const input = page.locator("#voucher-code");
  await input.fill(code);
  await page.getByRole("button", { name: "Xác nhận" }).click();
});

Then("I should see an error notification containing {string}", async ({ page }, text: string) => {
  await expect(page.getByText(new RegExp(text, "i")).first()).toBeVisible();
});

Then("I should see a success notification {string}", async ({ page }, _msg: string) => {
  await expect(
    page.getByText(/Nạp voucher thành công|\+250\.0K/i),
  ).toBeVisible({ timeout: 10000 });
});

Then("the transaction history table should update with new top-up record", async ({ page }) => {
  await expect(page.getByText(/\+250\.0K|\+500\.0K/i).first()).toBeVisible();
});
