import { createHmac, createHash } from "crypto";
import { Given, When, Then, expect } from "./fixtures";
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

function createChannelAppPayload(tamper = false): string {
  const appSecret = process.env.MEZON_APP_SECRET || process.env.MEZON_CLIENT_SECRET || "e2e-channel-secret";
  const user = JSON.stringify({
    id: 123456789,
    username: "channel_user",
    display_name: "Channel User",
    mezon_id: "channel.user@ncc.asia",
  });
  const params = new URLSearchParams({
    query_id: "AAHdF6UqAAAAAB0XpSoKhRAd",
    user,
    auth_date: String(Math.floor(Date.now() / 1000)),
    signature: "abc123def456",
  });
  const queryData = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
  const hashedSecret = createHash("md5").update(appSecret).digest("hex");
  const secretKey = createHmac("sha256", hashedSecret)
    .update("WebAppData")
    .digest();
  const hash = createHmac("sha256", secretKey)
    .update(queryData)
    .digest("hex");
  const rawPayload = `${queryData}&hash=${hash}`;
  return tamper ? rawPayload.replace("channel_user", "attacker") : rawPayload;
}

Given("Mezon Channel App opens login with a valid signed payload", async ({ page }) => {
  await page.goto(`/login?data=${encodeURIComponent(createChannelAppPayload())}`);
});

Given("Mezon Channel App opens login with a tampered signed payload", async ({ page }) => {
  await page.goto(`/login?data=${encodeURIComponent(createChannelAppPayload(true))}`);
});

When("the Channel App login completes", async ({ page }) => {
  await expect(page).toHaveURL(/\/dashboard/);
});

When("the Channel App login fails", async ({ page }) => {
  await expect(page.getByText(/Đăng nhập Channel App thất bại/)).toBeVisible();
});

Then("I should see the Channel App login error", async ({ page }) => {
  await expect(page.getByText(/invalid_hash_signature/)).toBeVisible();
});

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
