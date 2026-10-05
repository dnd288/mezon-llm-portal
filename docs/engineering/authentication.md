# Authentication

Mezon OAuth 2.0 or Mezon Channel App hash auth → JWT session → new-api user. Requirements: [FR-1](../product/prd.md), [FR-7](../product/prd.md).

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

Channel App login uses the same session target without an OAuth redirect:

```
User ─▶ Mezon Channel App ─▶ /login?data=<signed hash payload>
                               │ client leaf posts payload only
                               ▼
                         POST /api/auth/channel-app
                               │ decodes base64 payload
                               │ verifies MD5(app secret) + HMAC-SHA256 hash
                               │ rejects stale auth_date
                               │ parses user identity
                               │ user sync (same rules below)
                               │ signs session JWT
                               ▼
                         Set-Cookie session (httpOnly, SameSite=Lax, secure in prod)
                         JSON redirectTo=/dashboard
```

Direct server entry is also supported at `GET /api/auth/channel-app?data=<base64 payload>` for environments that prefer redirect-only handoff.

Logout: `GET /api/auth/logout` clears the session cookie. Session introspection: `GET /api/auth/session` → `{userId, username, mezonUserId}` or 401.

## User sync and backend credentials

OAuth callback and Channel App auth both exchange a verified Mezon identity for a new-api user, then ask new-api for a backend access token for that user ([ADR 0002](../adr/0002-admin-issued-backend-sessions.md)):

1. Build candidate new-api usernames in anchor order:
   - the **Mezon username** (`duong.nguyen`) when it fits new-api's 20-char + charset constraints — attaches to hand-created team accounts;
   - `mezon_<user_id>` when it fits (legacy short-id accounts);
   - `mz_<sha256(mezonUserId)>` (deterministic last resort).
2. For each candidate, `adminSearchUsers`; an **exact** username match adopts that account. Substring matches from the backend's LIKE search are rejected. Adoption refuses accounts with `role !== 1` (would leak elevated rights into the portal) or `status !== 1` (disabled).
3. Adopt ⇒ use the account as is. Its password is left untouched.
4. Miss on all candidates ⇒ `adminCreateUser` under the highest-priority anchor with a random throwaway password (new-api requires one; Portal never signs in with it).
5. `adminIssueUserSession(<new-api user id>)` → `POST /api/user/:id/session` → backend `access_token` + `access_expires_at` (15 minutes). new-api reuses the user's live `portal` login session and refuses admins and disabled users.

No password is derived, reset, or used. Login never touches new-api's step-up-protected admin password reset.

The admin token (`NEW_API_ADMIN_TOKEN`) is used only on the sync path and the backend-token renewal path. `MEZON_CLIENT_SECRET`, `MEZON_APP_SECRET`, `JWT_SECRET`, backend session tokens, and admin tokens never appear in a response, log, or client payload.

## Session cookie

| Property | Value |
|---|---|
| Name | `session` |
| Signing | `jose` HS256, `JWT_SECRET` |
| Lifetime | `SESSION_MAX_AGE` (default 7776000s = 90 days) |
| Flags | httpOnly, SameSite=Lax, `secure` in production, path `/` |
| Claims | `userId` (new-api numeric id), `accessToken` (Mezon OAuth token — userinfo only), `backendUsername`, `backendAccessToken` (new-api session token — authorizes all user-scoped calls), `backendExpiresAt`, `username`, `mezonUserId` |

All new-api calls from pages and `/api/portal/*` routes pass `backendAccessToken`. When the backend token is missing, expired, or within the refresh skew, Portal calls `adminIssueUserSession(session.userId)` server-side, issues a new Portal session cookie, and keeps browser credentials unchanged. The user signs in again only when the Portal session itself expires (`SESSION_MAX_AGE`) or new-api refuses the user (disabled, or promoted to admin).

## Route protection — two layers

1. **Middleware** (`src/middleware.ts`): cookie presence only, redirects `/dashboard|/tokens|/logs|/vouchers` → `/login?callbackUrl=<path>`; sends `/login` → `/dashboard` when a cookie exists. Fast, runs before rendering.
2. **Layout/pages** (`(portal)/layout.tsx`, each page): `getSession()` verifies the signature and redirects to `/login` on failure. Authoritative.

Matchers: `/dashboard/:path*`, `/tokens/:path*`, `/logs/:path*`, `/vouchers/:path*`, `/login`.

Note `/models` is public and unguarded (FR-2.2); `/vouchers` is guarded.

## Failure modes

| Failure | Behavior |
|---|---|
| Missing/incorrect OAuth `state` | Redirect `/login?error=invalid_state` |
| Missing OAuth `code` | Redirect `/login?error=missing_code` |
| OAuth env not configured (client id/secret/redirect) | Redirect `/login?error=oauth_not_configured` |
| OAuth token exchange | Redirect `/login?error=token_exchange_failed` |
| OAuth userinfo | Redirect `/login?error=userinfo_failed` |
| Channel App env not configured (`MEZON_APP_SECRET`, falling back to `MEZON_CLIENT_SECRET`) | 500 JSON `channel_app_not_configured` |
| Channel App payload missing/malformed/stale/tampered | 400/401 JSON error; login page displays Channel App failure and keeps OAuth login available |
| User sync | Redirect `/login?error=user_sync_failed` or 500 JSON `user_sync_failed` |
| Backend session issuance after sync | Redirect `/login?error=user_sync_failed` or 500 JSON `user_sync_failed` |
| Backend session renewal refused (user disabled or promoted) | Pages redirect `/login?error=backend_refresh_failed`; `/api/portal/*` returns 401 |
| Unexpected callback error | Redirect `/login?error=internal_error` |
| Expired/tampered session cookie | `getSession()` → null → page redirects to login; middleware alone would pass presence |

## Environment

See `.env.example`. All of: `MEZON_CLIENT_ID`, `MEZON_CLIENT_SECRET`, `MEZON_APP_SECRET` (Channel App hash verification; falls back to `MEZON_CLIENT_SECRET` for compatible deployments), `MEZON_REDIRECT_URI`, `MEZON_AUTH_URL`, `MEZON_TOKEN_URL`, `MEZON_USERINFO_URL`, `NEW_API_BASE_URL`, `NEW_API_ADMIN_TOKEN`, `JWT_SECRET`, `SESSION_MAX_AGE`. Optional: `MEZON_CHANNEL_APP_AUTH_MAX_AGE_SECONDS` (default 86400).

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
- Consider Mezon OAuth token rotation; the callback currently stores the Mezon OAuth access token in the portal session for the session lifetime (90 days default).
