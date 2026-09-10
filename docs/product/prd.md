# Mezon LLM Portal — Product Requirements

Status: shipped v0.1 (baseline documented post-hoc; new features must cite these identifiers before code).

Mezon LLM Portal is the customer portal for [Mezon LLM](https://llm.mrdnd.dev), an LLM gateway (new-api) that fronts 100+ models behind one OpenAI-compatible endpoint. The portal is the self-service surface where a Mezon user manages credentials and money: keys, quota, vouchers, usage.

## Users

- **Mezon user** — anyone with a Mezon account. Authenticates via Mezon OAuth, owns API keys and quota. The only persona the portal serves today.
- **new-api admin** — operates the backend (channels, vouchers, users). Not a portal persona; interacts with the new-api admin UI directly.

## Problems being solved

1. new-api's own UI is not Mezon-aware; users need one login they already have (Mezon) and an account provisioned automatically on first login.
2. Users need to create and revoke `sk-` keys without an operator in the loop.
3. Users top up quota with voucher codes bought outside the portal; they need to redeem them and see history.
4. Usage cost is denominated in backend quota units; users need it in units they understand (tokens, dollars).
5. Users configure coding agents (Claude Code, OpenCode, OMP, Cursor, Hermes) against the gateway; the portal is where the endpoint + key instructions live.

## Release phases

- **Phase 1 (shipped)** — auth, dashboard, API keys, pricing page, usage logs, voucher redemption + history.
- **Phase 2 (candidate, not committed)** — see [open-questions.md](open-questions.md). Nothing in Phase 2 is in scope until its question is answered.

## Functional requirements

### FR-1 Authentication & account provisioning

- **FR-1.1** The portal SHALL authenticate users via Mezon OAuth 2.0 (authorization code flow) with `openid offline` scope and CSRF `state` verification.
- **FR-1.2** On first login the portal SHALL provision a corresponding user in new-api via the admin token; subsequent logins SHALL look up the existing user by Mezon identity.
- **FR-1.3** The portal SHALL issue a signed JWT session in an httpOnly `session` cookie (24h default) and expose it only to server code.
- **FR-1.4** Protected routes (`/dashboard`, `/tokens`, `/logs`, `/vouchers`) SHALL redirect unauthenticated visitors to `/login` preserving the original path as `callbackUrl`.
- **FR-1.5** A logged-in user visiting `/login` SHALL be redirected to `/dashboard`.

### FR-2 Landing & discovery (public)

- **FR-2.1** The landing page SHALL present the product value proposition, a quick-start code snippet, and the list of compatible tools, with a distinct CTA depending on session presence (login vs dashboard).
- **FR-2.2** The pricing page SHALL list all gateway models grouped by provider, with per-million-token price in both quota and USD, searchable by name, and public (no login).

### FR-3 Dashboard (authenticated)

- **FR-3.1** The dashboard SHALL display current quota balance (quota units + USD), lifetime used quota, and lifetime request count.
- **FR-3.2** The dashboard SHALL provide voucher redemption inline (dialog) and setup instructions for supported coding tools.
- **FR-3.3** When the backend is unreachable the dashboard SHALL degrade to zeros with the rest of the page intact, not error out.

### FR-4 API key management

- **FR-4.1** The user SHALL create keys with a name, optional expiry, and quota limit (or unlimited), via a dialog.
- **FR-4.2** Immediately after creating a key, the portal SHALL request its raw `sk-...` value, display it in the creation dialog, and provide a copy button.
- **FR-4.3** The key list SHALL show per-key status (Active / Hết hạn / Revoked), remaining quota, and creation time, and SHALL let the user revoke a key with a confirmation step.
- **FR-4.4** Key operations SHALL go through portal API routes using the session's access token — the browser never talks to new-api directly.

### FR-5 Usage history

- **FR-5.1** The logs page SHALL list the user's requests with model, input/output tokens, quota cost, and timestamp, paginated (20/page).
- **FR-5.2** Empty or failed loads SHALL show an empty state, not a broken page.

### FR-6 Voucher redemption & history

- **FR-6.1** The user SHALL redeem a voucher code from the dashboard or vouchers page; invalid/used codes SHALL surface the backend's error message.
- **FR-6.2** The vouchers page SHALL list redemption history newest-first with status badges and amounts.
- **FR-6.3** Successful redemption SHALL refresh the portal so current quota and history can update.

### FR-7 Session utilities

- **FR-7.1** The portal SHALL expose `/api/auth/session` returning the current session identity (or 401) and `/api/auth/logout` clearing the session cookie.

## Non-functional requirements

- **NFR-1 Language** — UI copy is Vietnamese; code and docs are English.
- **NFR-2 Secrets** — `NEW_API_ADMIN_TOKEN`, `MEZON_CLIENT_SECRET`, `JWT_SECRET` live only in server env; never reach the browser bundle.
- **NFR-3 Responsiveness** — every page works mobile-first; portal navigation collapses to a sheet below `md`.
- **NFR-4 Proxy topology** — all new-api calls flow `Server Component / API route → src/lib/api.ts → new-api`. No direct browser→new-api traffic.

## Out of scope (current baseline)

- Payments or card top-up (vouchers only).
- Admin surfaces (channel management, user administration, voucher issuance) — new-api's own UI owns those.
- Per-key usage breakdown, usage charts, notifications.
- i18n catalogue (copy is inline Vietnamese for now).

## Verification plan

- Static: `bun run validate` (typecheck + eslint) gates every change.
- Behavioral: this baseline shipped without a test suite; new user-visible changes require an OpenSpec change with scenarios per `openspec/config.yaml` rules. See [engineering/testing.md](../engineering/testing.md).

## Requirement-to-source map

| Requirement group | Primary implementation |
|---|---|
| FR-1, FR-7 | `src/app/api/auth/*`, `src/lib/auth.ts`, `src/middleware.ts` |
| FR-2 | `src/app/page.tsx`, `src/app/models/page.tsx` |
| FR-3 | `src/app/(portal)/dashboard/page.tsx`, `src/components/voucher-dialog.tsx` |
| FR-4 | `src/app/(portal)/tokens/page.tsx`, `src/components/create-token-dialog.tsx`, `src/app/api/portal/tokens/**` |
| FR-5 | `src/app/(portal)/logs/page.tsx`, `src/app/api/portal/logs/route.ts` |
| FR-6 | `src/app/(portal)/vouchers/page.tsx`, `src/app/api/portal/voucher/route.ts` |
