import { test as base, type Page } from "@playwright/test";
import { SignJWT } from "jose";

export interface MockUserOptions {
  userId?: number;
  username?: string;
  mezonUserId?: string;
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
    backendAccessToken: "mock_backend_access_token",
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
