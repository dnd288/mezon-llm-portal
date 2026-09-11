import { test as base, type Page } from "@playwright/test";
import { SignJWT } from "jose";

export interface MockUserOptions {
  userId?: number;
  username?: string;
  mezonUserId?: string;
  backendAccessToken?: string;
}

export async function createMockSessionToken(
  options?: MockUserOptions,
): Promise<string> {
  const secret = new TextEncoder().encode(
    process.env.JWT_SECRET || "change-me-to-a-random-64-char-string",
  );

  const payload = {
    userId: options?.userId ?? 9999,
    accessToken: "mock_mezon_access_token",
    backendAccessToken:
      options?.backendAccessToken ||
      process.env.NEW_API_TEST_TOKEN ||
      "mock_backend_access_token",
    username: options?.username ?? "test_developer",
    mezonUserId: options?.mezonUserId ?? "123456",
  };

  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(secret);
}

/**
 * Route-level mock for client-side `/api/portal/*` requests.
 * Allows testing portal pages without running an external mock backend.
 */
export async function mockPortalApiRoutes(page: Page) {
  await page.route("**/api/portal/tokens*", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: [
            {
              id: 1,
              name: "Default Test Key",
              status: 1,
              key: "sk-test-mock-key-12345",
              remain_quota: 500000,
              unlimited_quota: false,
              used_quota: 12000,
              created_time: Math.floor(Date.now() / 1000) - 86400,
              expired_time: 0,
            },
          ],
        }),
      });
    } else if (route.request().method() === "POST") {
      const data = route.request().postDataJSON() || {};
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            id: 2,
            name: data.name || "New Key",
            key: "sk-new-mock-key-99999",
            status: 1,
            remain_quota: data.remain_quota ?? 0,
            unlimited_quota: data.unlimited_quota ?? false,
            used_quota: 0,
            created_time: Math.floor(Date.now() / 1000),
            expired_time: data.expired_time ?? 0,
          },
        }),
      });
    } else {
      await route.continue();
    }
  });

  await page.route("**/api/portal/voucher*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        message: "Nạp voucher thành công",
      }),
    });
  });
}

/**
 * Custom Playwright test fixture extending base test with pre-authenticated page.
 * Injecting the mock session cookie bypasses external Mezon OAuth for fast, reliable tests.
 */
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

export { expect } from "@playwright/test";
