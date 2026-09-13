import { Given, When, Then, BeforeScenario, expect } from "./fixtures";
import { createMockSessionToken } from "../fixtures/auth";

BeforeScenario(async ({ request }) => {
  try {
    await request.post("http://localhost:3099/__test_reset");
  } catch {
    // Ignore if mock backend not yet reachable
  }
});

Given("I am an unauthenticated visitor", async ({ context }) => {
  await context.clearCookies();
});

Given("I am logged in with a valid session", async ({ context, baseURL }) => {
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

When("I visit {string}", async ({ page }, path: string) => {
  await page.goto(path);
});

Given("I am on the {string} page", async ({ page }, path: string) => {
  await page.goto(path);
});

Then("I should be on the {string} page", async ({ page }, path: string) => {
  await expect(page).toHaveURL(new RegExp(path.replace(/\//g, "\\/")));
});

Then("I should be redirected to {string}", async ({ page }, target: string) => {
  await expect(page).toHaveURL(new RegExp(target.replace(/\//g, "\\/")));
});

Then("I should see the page heading {string}", async ({ page }, heading: string) => {
  await expect(
    page.getByRole("heading", { name: new RegExp(heading, "i") }).first(),
  ).toBeVisible();
});

When("I click the logout button", async ({ page }) => {
  // Can click logout link or invoke logout endpoint
  const logoutBtn = page.getByRole("button", { name: /Đăng xuất|Logout/i });
  if (await logoutBtn.isVisible().catch(() => false)) {
    await logoutBtn.click();
  } else {
    await page.goto("/api/auth/logout");
  }
});

When("I authenticate with a valid session and visit {string}", async ({ page, context, baseURL }, path: string) => {
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
  await page.goto(path);
});
