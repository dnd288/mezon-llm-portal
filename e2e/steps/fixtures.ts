import { test as base, createBdd } from "playwright-bdd";
import type { Page } from "@playwright/test";
import { createMockSessionToken } from "../fixtures/auth";

export const test = base.extend<{
  authedPage: Page;
}>({
  authedPage: async ({ page, context, baseURL }, provide) => {
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
    await provide(page);
  },
});

export const { Given, When, Then, Step, Before, After, BeforeScenario, AfterScenario } = createBdd(test);
export { expect } from "@playwright/test";
