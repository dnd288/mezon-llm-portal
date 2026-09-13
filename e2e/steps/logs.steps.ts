import { When, Then, expect } from "./fixtures";

Then("I should see the logs table with headers {string}, {string}, {string}, {string}, and {string}", async ({ page }, h1: string, h2: string, h3: string, _h4: string, _h5: string) => {
  await expect(page.getByRole("columnheader", { name: h1 })).toBeVisible();
  await expect(page.getByRole("columnheader", { name: h2 })).toBeVisible();
  await expect(page.getByRole("columnheader", { name: h3 })).toBeVisible();
});

Then("I should see log entries displayed with model badges", async ({ page }) => {
  await expect(page.getByText("claude-3-5-sonnet")).toBeVisible();
  await expect(page.getByText("gpt-4o")).toBeVisible();
});

Then("I should see the pagination controls", async ({ page }) => {
  await expect(page.getByText(/Trang \d+ \/ \d+/i)).toBeVisible();
});

When("I click the next page button", async ({ page, request }) => {
  // Seed pagination data to ensure page 2 exists
  await request.post("http://localhost:3099/__test_set_state", {
    data: { seedPagination: true },
  });
  await page.goto("/logs");
  const nextBtn = page.getByRole("link", { name: /Sau/i });
  await nextBtn.click();
});

Then("the page number should indicate page 2", async ({ page }) => {
  await expect(page.getByText(/Trang 2/i)).toBeVisible();
});

When("I click the previous page button", async ({ page }) => {
  const prevBtn = page.getByRole("link", { name: /Trước/i });
  await prevBtn.click();
});

Then("the page number should indicate page 1", async ({ page }) => {
  await expect(page.getByText(/Trang 1/i)).toBeVisible();
});
