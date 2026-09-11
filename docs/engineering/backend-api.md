# Backend API surface (new-api / mezon-llm)

What `src/lib/api.ts` consumes. Base URL: `NEW_API_BASE_URL` (default `https://llm.mrdnd.dev`). Auth header per call: `Authorization: Bearer <accessToken | adminToken>` (`ApiOptions`). Each typed function unwraps the backend's `{success, data}` envelope; `request()` throws `ApiError` (status, statusText, body) for non-2xx responses.

## User

| Function | Endpoint | Notes |
|---|---|---|
| `getSelf` | `GET /api/user/self` | `UserSelf`: id, username, display_name, quota, used_quota, request_count, etc. |
| `loginUser` | `POST /api/user/login` | `{username, password}` → `{access_token, access_expires_at, user}`; backend session token for user-scoped calls |
| `adminSearchUsers` | `GET /api/user/search?keyword` | admin token; keyword = derived portal username; **paginated envelope** — users live in `data.items`, not `data` |
| `adminCreateUser` | `POST /api/user/` | admin token; username, display_name, deterministic sync password; returns `{success, message}` — business failures arrive with HTTP 200 |
| `adminUpdateUserPassword` | `PUT /api/user/` | admin token; `{id, username, display_name, password}` — re-syncs portal-owned account passwords |

## Tokens (API keys)

| Function | Endpoint | Notes |
|---|---|---|
| `getTokens` | `GET /api/token/?page_size=100` | **Paginated envelope**: backend returns `{data: {items, page, page_size, total}}`; `api.ts` unwraps to `Token[]` via `res.data?.items ?? []` |
| `createToken` | `POST /api/token/` | payload: name, expired_time, remain_quota, unlimited_quota |
| `deleteToken` | `DELETE /api/token/:id` | revoke |
| `getTokenKey` | `POST /api/token/:id/key` | returns raw `sk-...`; requested by the creation dialog immediately after creation |

Status semantics (portal rendering): `1` = Active; otherwise Revoked; `expired_time > 0 && < now` = Hết hạn.

## Voucher / top-up

| Function | Endpoint | Notes |
|---|---|---|
| `redeemVoucher` | `POST /api/user/topup` | `{key}`; returns backend `message` plus granted `quota` |
| `getUserTopUps` | `GET /api/user/topup/self?page_size=100` | **Paginated envelope**: `{data: {items, total}}`; unwraps to `TopUpRecord[]`. Note: voucher redemptions do NOT create TopUp records — they only write `LogTypeTopup` log entries. This function returns payment top-ups only. |

## Usage logs

| Function | Endpoint | Notes |
|---|---|---|
| `getUserLogs` | `GET /api/log/self?p=&size=&type=&start_timestamp=&end_timestamp=` | **Paginated envelope**: `{data: {items, total}}`; unwraps to `LogsResponse {data: LogEntry[], total}`. `p` is 1-indexed (api.ts converts 0-indexed page param). Optional `type` filter (1=topup, 2=consume). Optional time range filters. |
| `getUserLogsStat` | `GET /api/log/self/stat?type=&start_timestamp=&end_timestamp=` | `UserLogsStat {quota, rpm, tpm}`; used by dashboard `UsageStats` component for time-filtered usage display |

`LogEntry`: created_at, model_name, prompt_tokens, completion_tokens, quota, use_time (total elapsed seconds), token_name.

## Models / pricing (public, no token)

| Function | Endpoint | Notes |
|---|---|---|
| `getModels` | `GET /api/user/models` | authenticated `ModelInfo[]` |
| `getPricing` | `GET /api/pricing` | public `PricingModel[]`: model_name, vendor_id, model_ratio, model_price, completion_ratio, quota_type, owner_by, enable_groups?, supported_endpoint_types? — pricing page source (FR-2.2) |
| `getModelStatus` | `GET /api/status/models` | public `ModelStatus[]` inside `data.models`: name, request_count, success_rate (null = no traffic yet), avg_latency_ms?, probe {checked, alive, test_time, latency_ms} |
| `getPerformanceMetrics` | `GET /api/perf-metrics/summary?hours=24` | public performance data inside `data.models`: model_name, avg_latency_ms, success_rate, avg_tps |

Price derivation (models page): for `quota_type: 0`, mzđ per 1M tokens = `model_ratio × 500_000`; output uses `completion_ratio`. For `quota_type: 1`, the backend price is USD per request (`model_price`), so the page converts it to mzđ per request as `model_price × 500_000` and leaves output as `—`. Health, latency, success rate, and TPS use the performance-metrics endpoint when present, with status probes as fallback. Uptime sparklines are not shown.

## Quota data

| Function | Endpoint | Notes |
|---|---|---|
| `getUserQuotaDates` | `GET /api/data/self` | unused by current pages |

## Portal proxy routes (browser-facing)

| Route | Method | Wraps |
|---|---|---|
| `/api/portal/tokens` | GET / POST | getTokens / createToken |
| `/api/portal/tokens/[id]` | DELETE / POST | deleteToken / getTokenKey |
| `/api/portal/logs` | GET | getUserLogs |
| `/api/portal/voucher` | POST | redeemVoucher |
| `/api/portal/stats` | GET | getUserLogsStat + getUserLogs (type=consume, size=1 for count); accepts `start`/`end` timestamp query params; returns `{usedQuota, requestCount}` |

Routes return `{success, data}` / `{success, error}`. Missing sessions return 401; malformed portal input returns 400; upstream failure is normally 502, except logs currently return 500.

Conventions when adding an endpoint:

- Session check first, input validation second, `api.ts` call third — no business logic in the route.
- Error messages user-facing Vietnamese where they originate in the portal; backend messages pass through as-is (OQ3).
