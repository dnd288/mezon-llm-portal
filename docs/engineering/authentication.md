# Authentication

Mezon OAuth 2.0 → JWT session → new-api user. Requirements: [FR-1](../product/prd.md), [FR-7](../product/prd.md).

## Flow

```
User ─▶ /login page ─▶ GET /api/auth/login
                          │ sets oauth_state cookie (httpOnly, 10 min, random 11 chars)
                          ▼
                    Mezon authorize endpoint (oauth2.mezon.ai/oauth2/auth)
                    client_id, redirect_uri, response_type=code, scope="openid offline", state
                          │ user consents
                          ▼
                    GET /api/auth/callback?code&state
                          │ verifies state === cookie value
                          │ exchanges code ─▶ token endpoint (client_secret, server-side)
                          │ fetches userinfo (sub, username, ...)
                          │ user sync (see below)
                          │ signs session JWT
                          ▼
                    Set-Cookie session (httpOnly, SameSite=Lax, secure in prod)
                    302 ─▶ /dashboard
```

Logout: `GET /api/auth/logout` clears the session cookie. Session introspection: `GET /api/auth/session` → `{userId, username, mezonUserId}` or 401.

## User sync and backend credentials

Callback exchanges the Mezon identity for a new-api user, then mints a backend login session:

1. Build candidate new-api usernames in anchor order:
   - the **Mezon username** (`duong.nguyen`) when it fits new-api's 20-char + charset constraints — attaches to hand-created team accounts;
   - `mezon_<user_id>` when it fits (legacy short-id accounts);
   - `mz_<sha256(mezonUserId)>` (deterministic last resort).
2. For each candidate, `adminSearchUsers`; an **exact** username match adopts that account. Substring matches from the backend's LIKE search are rejected. Adoption refuses accounts with `role !== 1` (would leak elevated rights into the portal) or `status !== 1` (disabled).
3. Adopt ⇒ `adminUpdateUserPassword` re-syncs the account password to the deterministic value (hand-created accounts and legacy portal ghosts included).
4. Miss on all candidates ⇒ `adminCreateUser` under the highest-priority anchor with `password = deriveSyncPassword(mezonUserId)`.
5. `loginUser(<adopted-or-created username>, deriveSyncPassword(mezonUserId))` → backend `access_token` + `access_expires_at`.

`deriveSyncPassword` = `HMAC-SHA256(NEW_API_SYNC_SECRET || JWT_SECRET, mezonUserId)` — deterministic, never stored: the server can always re-derive it and mint a fresh backend session.

**Adoption takes over credentials.** When a Mezon username matches a hand-created new-api account, the deterministic sync password replaces that account's old password — direct backend logins then require the admin to reset it. This is the linking mechanism, documented deliberately.

The admin token (`NEW_API_ADMIN_TOKEN`) is used **only** on the sync path. It never appears in a response, log, or client payload.

## Session cookie

| Property | Value |
|---|---|
| Name | `session` |
| Signing | `jose` HS256, `JWT_SECRET` |
| Lifetime | `SESSION_MAX_AGE` (default 86400s = 24h) |
| Flags | httpOnly, SameSite=Lax, `secure` in production, path `/` |
| Claims | `userId` (new-api numeric id), `accessToken` (Mezon OAuth token — userinfo only), `backendUsername`, `backendAccessToken` (new-api session token — authorizes all user-scoped calls), `backendExpiresAt`, `username`, `mezonUserId` |

All new-api calls from pages and `/api/portal/*` routes pass `backendAccessToken`. When the backend token is missing, expired, or within the refresh skew, Portal re-logins to new-api server-side with the deterministic sync password, issues a new Portal session cookie, and keeps browser credentials unchanged.

## Route protection — two layers

1. **Middleware** (`src/middleware.ts`): cookie presence only, redirects `/dashboard|/tokens|/logs|/vouchers` → `/login?callbackUrl=<path>`; sends `/login` → `/dashboard` when a cookie exists. Fast, runs before rendering.
2. **Layout/pages** (`(portal)/layout.tsx`, each page): `getSession()` verifies the signature and redirects to `/login` on failure. Authoritative.

Matchers: `/dashboard/:path*`, `/tokens/:path*`, `/logs/:path*`, `/vouchers/:path*`, `/login`.

Note `/models` is public and unguarded (FR-2.2); `/vouchers` is guarded.

## Failure modes

| Failure | Behavior |
|---|---|
| Missing/incorrect `state` | Redirect `/login?error=invalid_state` |
| Missing `code` | Redirect `/login?error=missing_code` |
| Env not configured (client id/secret/redirect) | Redirect `/login?error=oauth_not_configured` |
| Token exchange | Redirect `/login?error=token_exchange_failed` |
| Userinfo | Redirect `/login?error=userinfo_failed` |
| User sync | Redirect `/login?error=user_sync_failed` |
| Backend login after sync | Redirect `/login?error=backend_login_failed` |
| Unexpected callback error | Redirect `/login?error=internal_error` |
| Expired/tampered session cookie | `getSession()` → null → page redirects to login; middleware alone would pass presence |

## Environment

See `.env.example`. All of: `MEZON_CLIENT_ID`, `MEZON_CLIENT_SECRET`, `MEZON_REDIRECT_URI`, `MEZON_AUTH_URL`, `MEZON_TOKEN_URL`, `MEZON_USERINFO_URL`, `NEW_API_BASE_URL`, `NEW_API_ADMIN_TOKEN`, `NEW_API_SYNC_SECRET` (optional — falls back to `JWT_SECRET`), `JWT_SECRET`, `SESSION_MAX_AGE`.

## Userinfo claims (Mezon mapping)

Mezon documents the userinfo payload as:

| Claim | Meaning |
|---|---|
| `user_id` | Real Mezon user id (short, numeric) — preferred identity |
| `username` | Mezon username |
| `display_name` | Display name |
| `email` | Email |

The portal prefers `user_id` over Hydra's pairwise `sub` (long opaque string):
`mezonUserId = String(userinfo.user_id ?? userinfo.sub)`. This keeps
`mezon_<id>` usernames within new-api's 20-char limit and stable across logins.

Discovery: `https://oauth2.mezon.ai/.well-known/openid-configuration` (issuer
`oauth2.mezon.ai`; client auth `client_secret_post`; `end_session_endpoint`
available at `/oauth2/sessions/logout` if logout should also end the Mezon SSO
session).

## Hardening backlog

- OQ4: session-bound `state` + timing-safe compare.
- Consider Mezon OAuth token rotation; the callback currently stores the Mezon OAuth access token in the portal session for the session lifetime (24h default).
