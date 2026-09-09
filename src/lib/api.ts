/**
 * API client for the Mezon LLM (new-api) backend.
 *
 * All requests go through Next.js API routes to keep secrets server-side.
 * This client is used by React Server Components and API route handlers.
 */

const BASE_URL = process.env.NEW_API_BASE_URL || "https://llm.mrdnd.dev";

export interface ApiOptions {
  /** User's access token from new-api session */
  accessToken?: string;
  /** Admin token for privileged operations */
  adminToken?: string;
}

class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public body: unknown,
  ) {
    super(`API ${status}: ${statusText}`);
    this.name = "ApiError";
  }
}

async function request<T>(
  path: string,
  options: ApiOptions & RequestInit = {},
): Promise<T> {
  const { accessToken, adminToken, ...fetchOptions } = options;
  const headers = new Headers(fetchOptions.headers);

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  } else if (adminToken) {
    headers.set("Authorization", `Bearer ${adminToken}`);
  }

  if (!headers.has("Content-Type") && fetchOptions.body) {
    headers.set("Content-Type", "application/json");
  }

  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => res.text());
    throw new ApiError(res.status, res.statusText, body);
  }

  return res.json() as Promise<T>;
}

// ──────────────────────────────────────────────
// User / Self
// ──────────────────────────────────────────────

export interface UserSelf {
  id: number;
  username: string;
  display_name: string;
  email: string;
  role: number;
  status: number;
  quota: number;
  used_quota: number;
  request_count: number;
  group: string;
  aff_code: string;
  inviter_id: number;
}

export async function getSelf(opts: ApiOptions): Promise<UserSelf> {
  const res = await request<{ success: boolean; data: UserSelf }>(
    "/api/user/self",
    opts,
  );
  return res.data;
}

// ──────────────────────────────────────────────
// Tokens (API Keys)
// ──────────────────────────────────────────────

export interface Token {
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

export interface CreateTokenPayload {
  name: string;
  remain_quota?: number;
  expired_time?: number;
  unlimited_quota?: boolean;
  models?: string[];
  subnet?: string;
}

export async function getTokens(opts: ApiOptions): Promise<Token[]> {
  const res = await request<{ success: boolean; data: Token[] }>(
    "/api/token/",
    opts,
  );
  return res.data;
}

export async function createToken(
  payload: CreateTokenPayload,
  opts: ApiOptions,
): Promise<Token> {
  const res = await request<{ success: boolean; data: Token }>(
    "/api/token/",
    { ...opts, method: "POST", body: JSON.stringify(payload) },
  );
  return res.data;
}

export async function deleteToken(
  id: number,
  opts: ApiOptions,
): Promise<void> {
  await request(`/api/token/${id}`, { ...opts, method: "DELETE" });
}

export async function getTokenKey(
  id: number,
  opts: ApiOptions,
): Promise<string> {
  const res = await request<{ success: boolean; data: string }>(
    `/api/token/${id}/key`,
    { ...opts, method: "POST" },
  );
  return res.data;
}

// ──────────────────────────────────────────────
// Voucher / Top-up
// ──────────────────────────────────────────────

export async function redeemVoucher(
  key: string,
  opts: ApiOptions,
): Promise<{ message: string; quota: number }> {
  const res = await request<{
    success: boolean;
    message: string;
    data: number;
  }>("/api/user/topup", {
    ...opts,
    method: "POST",
    body: JSON.stringify({ key }),
  });
  return { message: res.message, quota: res.data };
}

export interface TopUpRecord {
  id: number;
  user_id: number;
  amount: number;
  money: number;
  trade_no: string;
  create_time: number;
  status: string;
}

export async function getUserTopUps(
  opts: ApiOptions,
): Promise<TopUpRecord[]> {
  const res = await request<{ success: boolean; data: TopUpRecord[] }>(
    "/api/user/topup/self",
    opts,
  );
  return res.data;
}

// ──────────────────────────────────────────────
// Usage Logs
// ──────────────────────────────────────────────

export interface LogEntry {
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
  elapsed_time: number;
}

export interface LogsResponse {
  data: LogEntry[];
  total: number;
}

export async function getUserLogs(
  opts: ApiOptions & { page?: number; size?: number },
): Promise<LogsResponse> {
  const page = opts.page ?? 0;
  const size = opts.size ?? 20;
  const res = await request<{ success: boolean; data: LogEntry[]; total: number }>(
    `/api/log/self?p=${page}&size=${size}`,
    opts,
  );
  return { data: res.data, total: res.total };
}

export async function getUserLogsStat(
  opts: ApiOptions,
): Promise<Record<string, unknown>> {
  const res = await request<{ success: boolean; data: Record<string, unknown> }>(
    "/api/log/self/stat",
    opts,
  );
  return res.data;
}

// ──────────────────────────────────────────────
// Models / Pricing
// ──────────────────────────────────────────────

export interface ModelInfo {
  id: string;
  object: string;
  created: number;
  owned_by: string;
}

export async function getModels(
  opts: ApiOptions,
): Promise<ModelInfo[]> {
  const res = await request<{ success: boolean; data: ModelInfo[] }>(
    "/api/user/models",
    opts,
  );
  return res.data;
}

export interface PricingModel {
  model_name: string;
  model_ratio: number;
  model_price: number;
  completion_ratio: number;
  group_ratio: number;
  quota_type: number;
  available: boolean;
  tags: string[];
  owned_by: string;
}

export async function getPricing(): Promise<PricingModel[]> {
  const res = await request<{ success: boolean; data: PricingModel[] }>(
    "/api/pricing",
  );
  return res.data;
}

export interface ModelStatus {
  model_name: string;
  status: string;
  latency: number;
  last_check: number;
}

export async function getModelStatus(): Promise<ModelStatus[]> {
  const res = await request<{ success: boolean; data: ModelStatus[] }>(
    "/api/status/models",
  );
  return res.data;
}

// ──────────────────────────────────────────────
// Quota Data
// ──────────────────────────────────────────────

export async function getUserQuotaDates(
  opts: ApiOptions,
): Promise<Record<string, unknown>[]> {
  const res = await request<{ success: boolean; data: Record<string, unknown>[] }>(
    "/api/data/self",
    opts,
  );
  return res.data;
}

// ──────────────────────────────────────────────
// Admin: User management (for OAuth sync)
// ──────────────────────────────────────────────

export async function adminCreateUser(
  payload: {
    username: string;
    display_name: string;
    password: string;
  },
  opts: ApiOptions,
): Promise<unknown> {
  return request("/api/user/", {
    ...opts,
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function adminSearchUsers(
  keyword: string,
  opts: ApiOptions,
): Promise<unknown[]> {
  const res = await request<{ success: boolean; data: unknown[] }>(
    `/api/user/search?keyword=${encodeURIComponent(keyword)}`,
    { ...opts },
  );
  return res.data;
}
