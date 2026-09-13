import { When, Then, expect } from "./fixtures";

Then("I should see the create token button {string}", async ({ page }, _text: string) => {
  await expect(page.getByRole("button", { name: /Tạo Key Mới|Tạo API Key/i })).toBeVisible();
});

Then("I should see existing API keys in the tokens table", async ({ page }) => {
  await expect(page.getByRole("cell", { name: "Production App", exact: true })).toBeVisible();
});

When("I click the create token button {string}", async ({ page }, _text: string) => {
  await page.getByRole("button", { name: /Tạo Key Mới|Tạo API Key/i }).click();
});

Then("I should see the create token dialog titled {string}", async ({ page }, _title: string) => {
  await expect(
    page.getByRole("heading", { name: /Tạo API Key Mới|Tạo Key Mới/i }),
  ).toBeVisible();
});

When("I submit the create token form without entering a name", async ({ page }) => {
  await page.getByRole("button", { name: "Tạo Key", exact: true }).click();
});

Then("I should see the validation error {string}", async ({ page }, _err: string) => {
  await expect(page.getByText(/Vui lòng nhập tên/i)).toBeVisible();
});

When("I enter {string} in the key name input", async ({ page }, keyName: string) => {
  await page.locator("#token-name").fill(keyName);
});

When("I submit the create token form", async ({ page }) => {
  await page.getByRole("button", { name: "Tạo Key", exact: true }).click();
});

Then("I should see the secret token displayed starting with {string}", async ({ page }, prefix: string) => {
  await expect(
    page.getByRole("heading", { name: "Key đã được tạo" }),
  ).toBeVisible();
  const codeEl = page.locator("code");
  await expect(codeEl).toContainText(prefix);
});

Then("I should see the copy token button", async ({ page }) => {
  await expect(page.getByRole("button", { name: "Sao chép key" })).toBeVisible();
});

When("I finish and close the token creation dialog", async ({ page }) => {
  await page.getByRole("button", { name: "Đóng" }).click();
  await expect(
    page.getByRole("heading", { name: "Key đã được tạo" }),
  ).not.toBeVisible();
});

Then("I should see {string} in the API keys table", async ({ page }, keyName: string) => {
  await expect(
    page.getByRole("cell", { name: keyName, exact: true }),
  ).toBeVisible();
});

When("I click the delete action on the first API key", async ({ page }) => {
  const deleteBtn = page.getByRole("button", { name: /Xóa key/i }).first();
  await deleteBtn.click();
});

Then("I should see the confirmation dialog titled {string}", async ({ page }, _title: string) => {
  await expect(
    page.getByRole("heading", { name: /Xác nhận xóa|Xóa API Key/i }),
  ).toBeVisible();
});

When("I confirm the deletion", async ({ page }) => {
  await page.getByRole("button", { name: "Xóa", exact: true }).click();
  await expect(page.getByText("Đã xóa key thành công")).toBeVisible();
});

Then("the API key should be removed from the table", async ({ page }) => {
  await expect(page.getByRole("cell", { name: "Production App", exact: true })).not.toBeVisible();
});
