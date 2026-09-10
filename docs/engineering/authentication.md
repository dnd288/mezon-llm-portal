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

## User sync (first login)

Callback exchanges the Mezon identity for a new-api user using the admin token:

1. `adminSearchUsers(mezonUserId)` — find existing.
2. Miss ⇒ `adminCreateUser({username: "mezon_<mezonUserId>", display_name, password: random UUID})`.
3. The selected new-api user id plus the Mezon OAuth access token from the exchange become JWT claims.

The admin token (`NEW_API_ADMIN_TOKEN`) is used **only** on this path. It never appears in a response, log, or client payload.

## Session cookie

| Property | Value |
|---|---|
| Name | `session` |
| Signing | `jose` HS256, `JWT_SECRET` |
| Lifetime | `SESSION_MAX_AGE` (default 86400s = 24h) |
| Flags | httpOnly, SameSite=Lax, `secure` in production, path `/` |
| Claims | `userId` (new-api numeric id), `accessToken` (Mezon OAuth access token), `username`, `mezonUserId` |

The embedded `accessToken` is passed to user-scoped new-api calls as `src/lib/api.ts` `ApiOptions.accessToken`.

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
| Unexpected callback error | Redirect `/login?error=internal_error` |
| Expired/tampered session cookie | `getSession()` → null → page redirects to login; middleware alone would pass presence |

## Environment

See `.env.example`. All of: `MEZON_CLIENT_ID`, `MEZON_CLIENT_SECRET`, `MEZON_REDIRECT_URI`, `MEZON_AUTH_URL`, `MEZON_TOKEN_URL`, `MEZON_USERINFO_URL`, `NEW_API_BASE_URL`, `NEW_API_ADMIN_TOKEN`, `JWT_SECRET`, `SESSION_MAX_AGE`.

## Hardening backlog

- OQ4: session-bound `state` + timing-safe compare.
- Consider token refresh / rotation; the callback currently stores the Mezon OAuth access token in the portal session for the session lifetime (24h default).
