// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

import { createToken } from "./api";

describe("API client tokens", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends the backend default group when creating a token", async () => {
    const fetchMock = vi.fn<(url: string, init: RequestInit) => Promise<Response>>(async () =>
      Response.json({
        success: true,
        data: {
          id: 123,
          user_id: 456,
          key: "",
          status: 1,
          name: "Portal key",
          created_time: 1,
          accessed_time: 0,
          expired_time: 0,
          remain_quota: 0,
          unlimited_quota: true,
          used_quota: 0,
          models: [],
          subnet: "",
          group: "default",
        },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await createToken(
      { name: "Portal key", unlimited_quota: true },
      { accessToken: "backend-token" },
    );

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(init.body as string)).toMatchObject({
      name: "Portal key",
      unlimited_quota: true,
      group: "default",
    });
  });
});
