// @vitest-environment node
import { createHmac, createHash } from "crypto";
import { describe, it, expect } from "vitest";
import { createSession, isBackendTokenExpiring, verifySession, sessionCookieOptions } from "./auth";
import { deriveSyncPassword } from "./api";
import { validateMezonChannelAppData } from "./mezon-auth";
import { SignJWT } from "jose";

describe("Auth Library (src/lib/auth.ts)", () => {
  const mockPayload = {
    userId: 1234,
    accessToken: "mezon_access_token_abc",
    backendUsername: "john_doe",
    backendAccessToken: "backend_token_xyz",
    backendExpiresAt: Math.floor(Date.now() / 1000) + 3600,
    username: "john_doe",
    mezonUserId: "mezon_999",
  };

  it("creates a signed JWT and verifies valid session successfully", async () => {
    const token = await createSession(mockPayload);
    expect(typeof token).toBe("string");
    expect(token.split(".").length).toBe(3);

    const verified = await verifySession(token);
    expect(verified).not.toBeNull();
    expect(verified?.userId).toBe(1234);
    expect(verified?.username).toBe("john_doe");
    expect(verified?.backendAccessToken).toBe("backend_token_xyz");
  });

  it("returns null when verifying an expired session token", async () => {
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || "change-me-to-a-random-64-char-string",
    );

    const expiredToken = await new SignJWT(mockPayload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt(Math.floor(Date.now() / 1000) - 7200)
      .setExpirationTime(Math.floor(Date.now() / 1000) - 3600)
      .sign(secret);

    const result = await verifySession(expiredToken);
    expect(result).toBeNull();
  });

  it("returns null when verifying a token signed with a different secret", async () => {
    const wrongSecret = new TextEncoder().encode("different-secret-key-that-does-not-match-at-all");

    const forgedToken = await new SignJWT(mockPayload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(wrongSecret);

    const result = await verifySession(forgedToken);
    expect(result).toBeNull();
  });

  it("returns null for malformed or empty token strings", async () => {
    expect(await verifySession("")).toBeNull();
    expect(await verifySession("not.a.valid.jwt")).toBeNull();
    expect(await verifySession("random-gibberish-string")).toBeNull();
  });

  it("returns security-hardened session cookie options", () => {
    const options = sessionCookieOptions();
    expect(options.name).toBe("session");
    expect(options.httpOnly).toBe(true);
    expect(options.sameSite).toBe("lax");
    expect(options.path).toBe("/");
    expect(options.maxAge).toBeGreaterThan(0);
  });

  it("detects backend tokens that need renewal", () => {
    const now = 1_700_000_000_000;
    expect(isBackendTokenExpiring({ backendExpiresAt: undefined }, now)).toBe(true);
    expect(isBackendTokenExpiring({ backendExpiresAt: 1_700_000_100 }, now)).toBe(true);
    expect(isBackendTokenExpiring({ backendExpiresAt: 1_700_000_600 }, now)).toBe(false);
  });
});

describe("Deterministic Password Sync (deriveSyncPassword)", () => {
  it("derives deterministic hash for same user ID", async () => {
    const pass1 = await deriveSyncPassword("mezon_user_123");
    const pass2 = await deriveSyncPassword("mezon_user_123");
    expect(pass1).toBe(pass2);
    expect(pass1).toMatch(/^[0-9a-f]{64}$/); // SHA-256 hex string
  });

  it("derives different passwords for different user IDs", async () => {
    const passA = await deriveSyncPassword("user_A");
    const passB = await deriveSyncPassword("user_B");
    expect(passA).not.toBe(passB);
  });
});

describe("Mezon Channel App hash authentication", () => {
  const appSecret = "test-channel-app-secret";
  const now = 1_700_000_000;

  function signedPayload(overrides: Record<string, string> = {}) {
    const user = JSON.stringify({
      id: 123456789,
      username: "mezon_dev",
      display_name: "Mezon Dev",
      avatar_url: "https://cdn.mezon.ai/avatar.jpg",
      mezon_id: "mezon.dev@ncc.asia",
    });
    const params = new URLSearchParams({
      query_id: "AAHdF6UqAAAAAB0XpSoKhRAd",
      user,
      auth_date: String(now),
      signature: "abc123def456",
      ...overrides,
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
    return `${queryData}&hash=${hash}`;
  }

  it("accepts a valid signed Channel App payload", () => {
    const result = validateMezonChannelAppData(appSecret, signedPayload(), now);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.user).toEqual({
        id: "123456789",
        username: "mezon_dev",
        displayName: "Mezon Dev",
        avatarUrl: "https://cdn.mezon.ai/avatar.jpg",
        mezonId: "mezon.dev@ncc.asia",
      });
    }
  });

  it("rejects a tampered Channel App signature", () => {
    const payload = signedPayload().replace("mezon_dev", "attacker");

    expect(validateMezonChannelAppData(appSecret, payload, now)).toEqual({
      ok: false,
      error: "invalid_hash_signature",
    });
  });

  it("rejects stale Channel App payloads", () => {
    const payload = signedPayload({ auth_date: String(now - 90_000) });

    expect(validateMezonChannelAppData(appSecret, payload, now)).toEqual({
      ok: false,
      error: "stale_hash_data",
    });
  });

  it("rejects malformed Channel App user data", () => {
    const payload = signedPayload({ user: JSON.stringify({ username: "missing_id" }) });

    expect(validateMezonChannelAppData(appSecret, payload, now)).toEqual({
      ok: false,
      error: "invalid_user",
    });
  });
});
