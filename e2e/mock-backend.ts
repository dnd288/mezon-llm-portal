/**
 * Mock new-api Backend Server for Playwright E2E Tests
 * Runs on port 3002 via `Bun.serve`
 */

interface MockToken {
  id: number;
  user_id: number;
  key: string;
  status: number;
  name: string;
  created_time: number;
  accessed_time: number;
  expired_time: number;
  remain_quota: number;
  unlimited_quota: boolean;
  used_quota: number;
  models: string[];
  subnet: string;
  group: string;
}

interface MockLog {
  id: number;
  user_id: number;
  created_at: number;
  type: number;
  content: string;
  username: string;
  token_name: string;
  model_name: string;
  quota: number;
  prompt_tokens: number;
  completion_tokens: number;
  channel_id: number;
  use_time: number;
}

const initialUser = {
  id: 9999,
  username: "test_developer",
  display_name: "Test Developer",
  email: "test@mezon.ai",
  role: 1,
  status: 1,
  quota: 5000000,
  used_quota: 120000,
  request_count: 42,
  group: "default",
  aff_code: "AFF123",
  inviter_id: 0,
};

let user = { ...initialUser };

const initialTokens: MockToken[] = [
  {
    id: 1,
    user_id: 9999,
    key: "sk-mock-production-key-12345",
    status: 1, // Active
    name: "Production App",
    created_time: Math.floor(Date.now() / 1000) - 86400 * 5,
    accessed_time: Math.floor(Date.now() / 1000) - 3600,
    expired_time: Math.floor(Date.now() / 1000) + 86400 * 30,
    remain_quota: 500000,
    unlimited_quota: false,
    used_quota: 25000,
    models: ["*"],
    subnet: "",
    group: "default",
  },
  {
    id: 2,
    user_id: 9999,
    key: "sk-mock-expired-key-67890",
    status: 1,
    name: "Old Demo Key",
    created_time: Math.floor(Date.now() / 1000) - 86400 * 60,
    accessed_time: Math.floor(Date.now() / 1000) - 86400 * 40,
    expired_time: Math.floor(Date.now() / 1000) - 86400 * 10, // Expired
    remain_quota: 0,
    unlimited_quota: false,
    used_quota: 100000,
    models: ["*"],
    subnet: "",
    group: "default",
  },
  {
    id: 3,
    user_id: 9999,
    key: "sk-mock-revoked-key-99999",
    status: 2, // Revoked
    name: "Revoked Test Key",
    created_time: Math.floor(Date.now() / 1000) - 86400 * 20,
    accessed_time: Math.floor(Date.now() / 1000) - 86400 * 15,
    expired_time: 0,
    remain_quota: 0,
    unlimited_quota: true,
    used_quota: 5000,
    models: ["*"],
    subnet: "",
    group: "default",
  },
];

let tokens: MockToken[] = [...initialTokens];

const initialLogs: MockLog[] = [
  {
    id: 101,
    user_id: 9999,
    created_at: Math.floor(Date.now() / 1000) - 120,
    type: 2, // API call
    content: "",
    username: "test_developer",
    token_name: "Production App",
    model_name: "claude-3-5-sonnet",
    quota: 1500,
    prompt_tokens: 350,
    completion_tokens: 120,
    channel_id: 1,
    use_time: 850,
  },
  {
    id: 102,
    user_id: 9999,
    created_at: Math.floor(Date.now() / 1000) - 600,
    type: 2,
    content: "",
    username: "test_developer",
    token_name: "Production App",
    model_name: "gpt-4o",
    quota: 2200,
    prompt_tokens: 500,
    completion_tokens: 220,
    channel_id: 2,
    use_time: 1420,
  },
  {
    id: 103,
    user_id: 9999,
    created_at: Math.floor(Date.now() / 1000) - 3600,
    type: 1, // Top-up log
    content: "通过兑换码充值 500000.000000 mzđ 额度，兑换码ID 97",
    username: "test_developer",
    token_name: "",
    model_name: "",
    quota: 500000,
    prompt_tokens: 0,
    completion_tokens: 0,
    channel_id: 0,
    use_time: 0,
  },
  {
    id: 104,
    user_id: 9999,
    created_at: Math.floor(Date.now() / 1000) - 86400,
    type: 1,
    content: "Mezon top-up successful: transferred 1000000 dong, credited 1000000 mzđ (1:1), tx 0xabcdef",
    username: "test_developer",
    token_name: "",
    model_name: "",
    quota: 1000000,
    prompt_tokens: 0,
    completion_tokens: 0,
    channel_id: 0,
    use_time: 0,
  },
];

let logs: MockLog[] = [...initialLogs];
let isGatewayError = false;

function resetState() {
  user = { ...initialUser };
  tokens = [...initialTokens];
  logs = [...initialLogs];
  isGatewayError = false;
}

const mockPricing = [
  {
    model_name: "gpt-4o",
    vendor_id: 1,
    model_ratio: 2.5,
    model_price: 0,
    completion_ratio: 3.0,
    quota_type: 0,
    owner_by: "openai",
    enable_groups: ["default"],
  },
  {
    model_name: "claude-3-5-sonnet",
    vendor_id: 2,
    model_ratio: 3.0,
    model_price: 0,
    completion_ratio: 5.0,
    quota_type: 0,
    owner_by: "anthropic",
    enable_groups: ["default"],
  },
  {
    model_name: "deepseek-chat",
    vendor_id: 3,
    model_ratio: 0.14,
    model_price: 0,
    completion_ratio: 0.28,
    quota_type: 0,
    owner_by: "deepseek",
    enable_groups: ["default"],
  },
  {
    model_name: "gpt-6-astra",
    vendor_id: 1,
    model_ratio: 0.04,
    model_price: 0,
    completion_ratio: 5.0,
    quota_type: 0,
    owner_by: "openai",
    enable_groups: ["default"],
    billing_mode: "tiered_expr",
    billing_expr: 'tier("base", p * 0.08 + c * 0.4)',
  },
  {
    model_name: "claude-fable-5-1",
    vendor_id: 2,
    model_ratio: 37.5,
    model_price: 0,
    completion_ratio: 1.0,
    quota_type: 0,
    owner_by: "anthropic",
    enable_groups: ["default"],
    billing_mode: "tiered_expr",
    billing_expr: 'tier("base", p * 0.04 + c * 0.2)',
  },
];

const mockModelStatus = [
  {
    name: "gpt-4o",
    request_count: 1250,
    success_rate: 98.5,
    avg_latency_ms: 650,
    probe: { checked: true, alive: true, test_time: Date.now(), latency_ms: 650 },
  },
  {
    name: "claude-3-5-sonnet",
    request_count: 850,
    success_rate: 99.2,
    avg_latency_ms: 540,
    probe: { checked: true, alive: true, test_time: Date.now(), latency_ms: 540 },
  },
  {
    name: "deepseek-chat",
    request_count: 320,
    success_rate: 94.0,
    avg_latency_ms: 420,
    probe: { checked: true, alive: true, test_time: Date.now(), latency_ms: 420 },
  },
];

declare const Bun: {
  serve: (options: {
    port: number;
    fetch: (req: Request) => Response | Promise<Response>;
  }) => { port: number };
};

const PORT = Number(process.env.MOCK_PORT || "3099");

const server = Bun.serve({
  port: PORT,
  async fetch(req: Request) {
    const url = new URL(req.url);
    const path = url.pathname;
    const method = req.method;

    const json = (data: unknown, status = 200) =>
      new Response(JSON.stringify(data), {
        status,
        headers: { "Content-Type": "application/json" },
      });

    // Reset state endpoint for tests
    if (method === "POST" && path === "/__test_reset") {
      resetState();
      return json({ success: true, message: "Reset complete" });
    }

    // Set custom mock state for specific test scenarios
    if (method === "POST" && path === "/__test_set_state") {
      const body = (await req.json().catch(() => ({}))) as {
        emptyTokens?: boolean;
        emptyLogs?: boolean;
        gatewayError?: boolean;
        seedPagination?: boolean;
      };

      if (body.emptyTokens) {
        tokens = [];
      }
      if (body.emptyLogs) {
        logs = [];
      }
      if (body.gatewayError != null) {
        isGatewayError = body.gatewayError;
      }
      if (body.seedPagination) {
        logs = Array.from({ length: 25 }, (_, i) => ({
          id: 300 + i,
          user_id: 9999,
          created_at: Math.floor(Date.now() / 1000) - i * 60,
          type: 2,
          content: "",
          username: "test_developer",
          token_name: `Key ${i + 1}`,
          model_name: i % 2 === 0 ? "gpt-4o" : "claude-3-5-sonnet",
          quota: 1000 + i * 10,
          prompt_tokens: 100,
          completion_tokens: 50,
          channel_id: 1,
          use_time: 500,
        }));
      }

      return json({ success: true, message: "State set" });
    }

    if (method === "GET" && path === "/api/user/search") {
      const keyword = url.searchParams.get("keyword") || "";
      const items = user.username === keyword ? [user] : [];
      return json({ success: true, data: { items, page: 1, page_size: 10, total: items.length } });
    }

    if (method === "POST" && path === "/api/user/") {
      const body = (await req.json().catch(() => ({}))) as {
        username?: string;
        display_name?: string;
      };
      user = {
        ...initialUser,
        username: body.username || initialUser.username,
        display_name: body.display_name || body.username || initialUser.display_name,
      };
      return json({ success: true, message: "Created" });
    }

    if (method === "PUT" && path === "/api/user/") {
      const body = (await req.json().catch(() => ({}))) as {
        username?: string;
        display_name?: string;
      };
      user = {
        ...user,
        username: body.username || user.username,
        display_name: body.display_name || user.display_name,
      };
      return json({ success: true, message: "Updated" });
    }

    if (method === "POST" && path === "/api/user/login") {
      return json({
        success: true,
        data: {
          access_token: "mock-backend-session-token",
          access_expires_at: Math.floor(Date.now() / 1000) + 86400,
        },
      });
    }

    // GET /api/user/self
    if (method === "GET" && path === "/api/user/self") {
      if (isGatewayError) {
        return json({ success: false, message: "Gateway connection error" }, 502);
      }
      return json({ success: true, data: user });
    }

    // GET /api/token/?page_size=100
    if (method === "GET" && path === "/api/token/") {
      if (isGatewayError) {
        return json({ success: false, message: "Gateway connection error" }, 502);
      }
      return json({
        success: true,
        data: {
          items: tokens,
          page: 1,
          page_size: 100,
          total: tokens.length,
        },
      });
    }

    // POST /api/token/ (create token)
    if (method === "POST" && path === "/api/token/") {
      const body = (await req.json().catch(() => ({}))) as {
        name?: string;
        remain_quota?: number;
        expired_time?: number;
        unlimited_quota?: boolean;
      };

      const newId = tokens.length > 0 ? Math.max(...tokens.map((t) => t.id)) + 1 : 1;
      const newToken: MockToken = {
        id: newId,
        user_id: 9999,
        key: `sk-mock-new-${newId}-${Date.now()}`,
        status: 1,
        name: body.name || `Key ${newId}`,
        created_time: Math.floor(Date.now() / 1000),
        accessed_time: 0,
        expired_time: body.expired_time ?? 0,
        remain_quota: body.remain_quota ?? 0,
        unlimited_quota: body.unlimited_quota ?? true,
        used_quota: 0,
        models: ["*"],
        subnet: "",
        group: "default",
      };

      tokens.unshift(newToken);
      return json({ success: true, data: newToken });
    }

    // POST /api/token/:id/key
    const tokenKeyMatch = path.match(/^\/api\/token\/(\d+)\/key$/);
    if (method === "POST" && tokenKeyMatch) {
      const id = Number(tokenKeyMatch[1]);
      const found = tokens.find((t) => t.id === id);
      if (!found) {
        return json({ success: false, message: "Token not found" }, 404);
      }
      return json({ success: true, data: found.key });
    }

    // DELETE /api/token/:id
    const tokenDeleteMatch = path.match(/^\/api\/token\/(\d+)$/);
    if (method === "DELETE" && tokenDeleteMatch) {
      const id = Number(tokenDeleteMatch[1]);
      tokens = tokens.filter((t) => t.id !== id);
      return json({ success: true, message: "Deleted" });
    }

    // POST /api/user/topup (voucher redemption)
    if (method === "POST" && path === "/api/user/topup") {
      const body = (await req.json().catch(() => ({}))) as { key?: string };
      const code = body.key?.trim() || "";

      if (code === "INVALID_CODE" || code.toLowerCase().includes("fail") || code.length < 5) {
        return json(
          {
            success: false,
            message: "Mã voucher không hợp lệ hoặc đã hết hạn",
            data: 0,
          },
          400,
        );
      }

      // Successful redemption
      const creditedQuota = 250000;
      user.quota += creditedQuota;
      logs.unshift({
        id: Date.now(),
        user_id: 9999,
        created_at: Math.floor(Date.now() / 1000),
        type: 1,
        content: `通过兑换码充值 ${creditedQuota}.000000 mzđ 额度，兑换码ID ${Date.now() % 1000}`,
        username: "test_developer",
        token_name: "",
        model_name: "",
        quota: creditedQuota,
        prompt_tokens: 0,
        completion_tokens: 0,
        channel_id: 0,
        use_time: 0,
      });

      return json({
        success: true,
        message: "Nạp thành công",
        data: creditedQuota,
      });
    }

    // GET /api/log/self
    if (method === "GET" && path === "/api/log/self") {
      const typeParam = url.searchParams.get("type");
      const pageParam = Number(url.searchParams.get("p") || "1");
      const sizeParam = Number(url.searchParams.get("size") || "20");

      let filtered = logs;
      if (typeParam != null) {
        const typeNum = Number(typeParam);
        filtered = logs.filter((l) => l.type === typeNum);
      }

      const startIndex = (pageParam - 1) * sizeParam;
      const paginatedItems = filtered.slice(startIndex, startIndex + sizeParam);

      return json({
        success: true,
        data: {
          items: paginatedItems,
          page: pageParam,
          page_size: sizeParam,
          total: filtered.length,
        },
      });
    }

    // GET /api/log/self/stat
    if (method === "GET" && path === "/api/log/self/stat") {
      return json({
        success: true,
        data: {
          quota: user.used_quota,
          rpm: 12,
          tpm: 2400,
        },
      });
    }

    // GET /api/pricing
    if (method === "GET" && path === "/api/pricing") {
      return json({ success: true, data: mockPricing });
    }

    // GET /api/status/models
    if (method === "GET" && path === "/api/status/models") {
      return json({ success: true, data: { models: mockModelStatus } });
    }

    return json({ success: false, message: `Mock route ${method} ${path} not found` }, 404);
  },
});

console.log(`[Mock Backend] Running on http://localhost:${server.port}`);
