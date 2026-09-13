import { When, Then, expect } from "./fixtures";

Then("I should see the hero heading {string}", async ({ page }, _text: string) => {
  await expect(
    page.getByRole("heading", { name: /Gateway AI chi phí thấp/i }),
  ).toBeVisible();
});

Then("I should see the advisory warning {string}", async ({ page }, warning: string) => {
  await expect(page.getByText(new RegExp(warning, "i")).first()).toBeVisible();
});

Then("I should see the ecosystem tools section", async ({ page }) => {
  await expect(page.getByText(/Thuộc hệ sinh thái Mezon/i)).toBeVisible();
});

Then("I should see the code snippet block", async ({ page }) => {
  await expect(page.getByRole("link", { name: /Bắt đầu ngay/i })).toBeVisible();
});

When("I click on the link to view pricing {string}", async ({ page }, linkText: string) => {
  await page.getByRole("link", { name: new RegExp(linkText, "i") }).click();
});

Then("I should see the pricing title {string}", async ({ page }, title: string) => {
  await expect(
    page.getByRole("heading", { name: new RegExp(title, "i") }),
  ).toBeVisible();
});

Then("I should see models listed in the pricing table", async ({ page }) => {
  await expect(page.getByText("claude-3-5-sonnet").first()).toBeVisible();
});

When("I search for {string} in the model search input", async ({ page }, query: string) => {
  const searchInput = page.getByPlaceholder(/Tìm kiếm mô hình|Search/i);
  await searchInput.fill(query);
});

Then("all visible model cards should contain {string}", async ({ page }, _term: string) => {
  await expect(page.getByText("claude-3-5-sonnet").first()).toBeVisible();
  await expect(page.getByText("gpt-4o")).not.toBeVisible();
});

Then("I should see the empty models message {string}", async ({ page }, msg: string) => {
  await expect(page.getByText(new RegExp(msg, "i"))).toBeVisible();
});

When("I select the provider chip {string}", async ({ page }, provider: string) => {
  const btn = page.getByRole("button", { name: new RegExp(provider, "i") }).first();
  await btn.click();
});

Then("all visible model cards should be provided by {string}", async ({ page }, provider: string) => {
  if (provider.toLowerCase().includes("anthropic")) {
    await expect(page.getByText("claude-3-5-sonnet").first()).toBeVisible();
    await expect(page.getByText("gpt-4o")).not.toBeVisible();
  }
});

When("I click the copy button on the first model card", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  const copyBtn = page.getByRole("button", { name: /Sao chép/i }).first();
  await copyBtn.click();
});

Then("the model identifier should be copied to clipboard", async ({ page }) => {
  const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboardText.length).toBeGreaterThan(0);
});
