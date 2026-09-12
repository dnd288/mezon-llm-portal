# ADR 0001: Mezon OAuth with JWT session; portal as pure proxy to new-api

Status: Accepted (2026-09-10)
Deciders: maintainer

## Context

The product ships one login users already have — Mezon — and must present new-api (a Go LLM gateway we do not control here) as the account/quota/keys backend. Constraints given rather than chosen:

- new-api owns users, tokens, quota, vouchers, and pricing; the portal must not fork that state.
- `NEW_API_ADMIN_TOKEN` and `MEZON_CLIENT_SECRET` must never reach the browser.
- The portal is frontend-only (Next.js App Router); no server-side data store of our own.

## Decision
1. **Auth**: Mezon OAuth 2.0 authorization-code flow (`scope="openid offline"`, `state` cookie check). On callback, exchange code → userinfo, sync the user into new-api via the admin token (search, else create), mint a new-api login session with the deterministic sync password, then issue a `jose` HS256 JWT in an httpOnly cookie carrying `{userId, accessToken (Mezon OAuth), backendAccessToken (new-api), backendExpiresAt, username, mezonUserId}`.
2. **Data plane**: every new-api call flows through `src/lib/api.ts`, invoked from Server Components (reads) or `/api/portal/*` API routes (mutations). The browser never calls new-api and never imports `api.ts`.
3. **State**: server is the source of truth; no client store, no cache layer. Mutations refresh or reload the page after completion.

## Consequences

- The session JWT embeds both the Mezon OAuth access token (for userinfo) and a new-api `backendAccessToken` (minted via deterministic login at callback time) used for all user-scoped new-api calls. The backend session's expiry (`backendExpiresAt`) is not actively refreshed; if it expires before the portal cookie, affected calls fail softly or 401 — re-login mints a fresh one.
- Middleware gates on cookie presence only; signature verification happens in layout/pages via `getSession()` — fast edge, authoritative origin.
- Any new-api behavior change (response shapes, endpoint moves) lands in `api.ts` and is fixed in one place, but is not caught by any test today (OQ1).
- User provisioning is happy-path only: an existing new-api account not linked to a Mezon identity is invisible to the search (keyword = mezon user id).

## Alternatives considered

- **NextAuth/Auth.js with a Mezon provider** — rejected: the session must carry the new-api access token for server-side calls anyway; an auth framework adds ceremony without removing that coupling.
- **Portal-owned database mirroring new-api state** — rejected: forks the money state; violates the "backend owns persistence" constraint.
- **Proxying new-api through Next.js rewrites (transparent proxy)** — rejected: cannot inject per-user access tokens or shape error copy; explicit typed functions in `api.ts` give one seam to review.

## What would change our mind

- new-api grows a first-party OIDC/Mezon integration: drop the admin-token sync path.
- Upstream token expiry shorter than session lifetime in practice: move to a server-side token store with refresh.
- The portal needing offline features (no backend): then a local data layer becomes justified and this decision is superseded.
