import { Given, Then, expect } from "./fixtures";
import { SignJWT } from "jose";

async function createExpiredMockToken(): Promise<string> {
  const secret = new TextEncoder().encode(
    process.env.JWT_SECRET || "change-me-to-a-random-64-char-string",
  );
  return new SignJWT({
    userId: 9999,
    accessToken: "expired_token",
    backendUsername: "test_developer",
    backendAccessToken: "expired_token",
    backendExpiresAt: Math.floor(Date.now() / 1000) - 3600,
    username: "test_developer",
    mezonUserId: "123456",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt(Math.floor(Date.now() / 1000) - 7200)
    .setExpirationTime(Math.floor(Date.now() / 1000) - 3600)
    .sign(secret);
}

Then("I should be redirected to {string} with callbackUrl to {string}", async ({ page }, target: string, callbackUrl: string) => {
  const pattern = new RegExp(`${target.replace(/\//g, "\\/")}\\?callbackUrl=.*${encodeURIComponent(callbackUrl)}`);
  await expect(page).toHaveURL(pattern);
});

Then("I should see the login heading {string}", async ({ page }, heading: string) => {
  await expect(page.getByRole("heading", { name: heading })).toBeVisible();
});

Then("I should see the Mezon login link", async ({ page }) => {
  await expect(page.getByRole("link", { name: /Đăng nhập bằng/i })).toBeVisible();
});

Given("I have an expired session cookie", async ({ context, baseURL }) => {
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
});

Given("I have an invalid tampered session cookie", async ({ context, baseURL }) => {
  const targetUrl = baseURL || "http://localhost:3001";
  await context.addCookies([
    {
      name: "session",
      value: "tampered.jwt.cookie.string",
      url: targetUrl,
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);
});
