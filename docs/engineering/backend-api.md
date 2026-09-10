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
| `getTokens` | `GET /api/token/` | `Token[]`: id, name, status, remain_quota, unlimited_quota, expired_time, created_time, accessed_time |
| `createToken` | `POST /api/token/` | payload: name, expired_time, remain_quota, unlimited_quota |
| `deleteToken` | `DELETE /api/token/:id` | revoke |
| `getTokenKey` | `POST /api/token/:id/key` | returns raw `sk-...`; requested by the creation dialog immediately after creation |

Status semantics (portal rendering): `1` = Active; otherwise Revoked; `expired_time > 0 && < now` = Hết hạn.

## Voucher / top-up

| Function | Endpoint | Notes |
|---|---|---|
| `redeemVoucher` | `POST /api/user/topup` | `{key}`; returns backend `message` plus granted `quota` |
| `getUserTopUps` | `GET /api/user/topup/self` | `TopUpRecord[]`: id, amount, money, trade_no, status, create_time |

## Usage logs

| Function | Endpoint | Notes |
|---|---|---|
| `getUserLogs` | `GET /api/log/self?p=&size=` | `LogsResponse`: `{data: LogEntry[], total}`; p is 0-indexed; page size 20 (FR-5.1) |
| `getUserLogsStat` | `GET /api/log/self/stat` | aggregate stats (currently unused by pages) |

`LogEntry`: created_at, model_name, prompt_tokens, completion_tokens, quota, elapsed_time.

## Models / pricing (public, no token)

| Function | Endpoint | Notes |
|---|---|---|
| `getModels` | `GET /api/user/models` | authenticated `ModelInfo[]` |
| `getPricing` | `GET /api/pricing` | public `PricingModel[]`: model_name, quota_type, model_ratio, owned_by — pricing page source (FR-2.2) |
| `getModelStatus` | `GET /api/status/models` | public `ModelStatus[]` |

Price derivation (models page): quota per 1M tokens = `model_ratio × 500_000`; USD = quota ÷ 500_000.

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

Routes return `{success, data}` / `{success, error}`. Missing sessions return 401; malformed portal input returns 400; upstream failure is normally 502, except logs currently return 500.

Conventions when adding an endpoint:

- Session check first, input validation second, `api.ts` call third — no business logic in the route.
- Error messages user-facing Vietnamese where they originate in the portal; backend messages pass through as-is (OQ3).
