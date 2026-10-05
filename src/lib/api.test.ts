// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

import { adminIssueUserSession, createToken, getTokenKey } from "./api";

describe("API client tokens", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends the backend default group, default expired_time -1, and retrieves the created token", async () => {
    const fetchMock = vi.fn<(url: string, init?: RequestInit) => Promise<Response>>(
      async (url, init) => {
        if (url.endsWith("/api/token/")) {
          return Response.json({
            success: true,
            message: "",
          });
        }
        if (url.includes("/api/token/?page_size=100")) {
          return Response.json({
            success: true,
            data: {
              items: [
                {
                  id: 123,
                  user_id: 456,
                  key: "sk-mask",
                  status: 1,
                  name: "Portal key",
                  created_time: 1,
                  accessed_time: 0,
                  expired_time: -1,
                  remain_quota: 0,
                  unlimited_quota: true,
                  used_quota: 0,
                  models: [],
                  subnet: "",
                  group: "default",
                },
              ],
              page: 1,
              page_size: 100,
              total: 1,
            },
          });
        }
        throw new Error(`Unexpected request: ${url}`);
      },
    );
    vi.stubGlobal("fetch", fetchMock);

    const token = await createToken(
      { name: "Portal key", unlimited_quota: true },
      { accessToken: "backend-token" },
    );

    expect(fetchMock).toHaveBeenCalledTimes(2);

    const [postUrl, postInit] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(postUrl).toContain("/api/token/");
    expect(JSON.parse(postInit.body as string)).toMatchObject({
      name: "Portal key",
      unlimited_quota: true,
      group: "default",
      expired_time: -1,
    });

    expect(token).toMatchObject({
      id: 123,
      name: "Portal key",
      group: "default",
      expired_time: -1,
    });
  });

  it("unwraps object key response from getTokenKey", async () => {
    const fetchMock = vi.fn<(url: string, init?: RequestInit) => Promise<Response>>(
      async () =>
        Response.json({
          success: true,
          message: "",
          data: { key: "sk-actual-unmasked-token" },
        }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const key = await getTokenKey(123, { accessToken: "backend-token" });

    expect(key).toBe("sk-actual-unmasked-token");
  });
});

describe("API client user session issuance", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("asks new-api for a session for the named user with the admin token", async () => {
    const fetchMock = vi.fn<(url: string, init?: RequestInit) => Promise<Response>>(
      async () =>
        Response.json({
          success: true,
          data: { access_token: "user-access", access_expires_at: 1_700_000_900 },
        }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const session = await adminIssueUserSession(42, { adminToken: "admin-token" });

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toMatch(/\/api\/user\/42\/session$/);
    expect(init.method).toBe("POST");
    expect(new Headers(init.headers).get("Authorization")).toBe("Bearer admin-token");
    expect(session).toEqual({ accessToken: "user-access", expiresAt: 1_700_000_900 });
  });

  it("throws when new-api refuses the user with an HTTP 200 business error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json({ success: false, message: "refused" })),
    );

    await expect(adminIssueUserSession(7, { adminToken: "admin-token" })).rejects.toThrow("refused");
  });
});
