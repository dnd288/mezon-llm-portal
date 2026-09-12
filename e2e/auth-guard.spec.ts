import { test, expect } from "@playwright/test";
import { SignJWT } from "jose";

async function createExpiredMockToken(): Promise<string> {
  const secret = new TextEncoder().encode(
    process.env.JWT_SECRET || "change-me-to-a-random-64-char-string",
  );
  return new SignJWT({
    userId: 9999,
    accessToken: "expired_token",
    backendAccessToken: "expired_token",
    username: "test_developer",
    mezonUserId: "123456",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt(Math.floor(Date.now() / 1000) - 7200)
    .setExpirationTime(Math.floor(Date.now() / 1000) - 3600)
    .sign(secret);
}

test.describe("Authentication Guard & Session Security", () => {
  const protectedRoutes = ["/dashboard", "/tokens", "/logs", "/vouchers"];

  for (const route of protectedRoutes) {
    test(`redirects unauthenticated user from ${route} to /login`, async ({
      page,
    }) => {
      await page.goto(route);

      // Verify redirect to login page with callbackUrl parameter
      await expect(page).toHaveURL(new RegExp(`/login\\?callbackUrl=.*`));

      // Verify login UI components
      await expect(
        page.getByRole("heading", { name: "Đăng nhập" }),
      ).toBeVisible();
      await expect(
        page.getByRole("link", { name: /Đăng nhập bằng/i }),
      ).toBeVisible();
    });
  }

  test("rejects expired session JWT and redirects to /login", async ({ page, context, baseURL }) => {
    const targetUrl = baseURL || "http://localhost:3001";
    const expiredToken = await createExpiredMockToken();

    await context.addCookies([
      {
        name: "session",
        value: expiredToken,
        url: targetUrl,
        httpOnly: true,
        sameSite: "Lax",
      },
    ]);

    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole("heading", { name: "Đăng nhập" })).toBeVisible();
  });

  test("rejects malformed/tampered session cookie and redirects to /login", async ({
    page,
    context,
    baseURL,
  }) => {
    const targetUrl = baseURL || "http://localhost:3001";

    await context.addCookies([
      {
        name: "session",
        value: "malformed.tampered.session-token-signature",
        url: targetUrl,
        httpOnly: true,
        sameSite: "Lax",
      },
    ]);

    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole("heading", { name: "Đăng nhập" })).toBeVisible();
  });
});
