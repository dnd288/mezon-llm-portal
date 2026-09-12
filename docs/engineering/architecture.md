# Architecture

One page: topology, data flow, and the boundaries that keep this codebase flat. Glossary terms live in [`CONTEXT.md`](../../CONTEXT.md); requirements in [`product/prd.md`](../product/prd.md).

## Topology

```
Browser
  │  (no new-api traffic, ever)
  ▼
Next.js 16 App Router ──── Mezon OAuth (oauth2.mezon.ai)
  │  Server Components            │ code exchange / userinfo
  │  /api routes                  ▼
  │                     new-api (mezon-llm, Go)
  └── src/lib/api.ts ───────────▶ REST /api/*
        session access token       user-scoped calls
        admin token (callback only) user sync
```

Two external systems, one rule: **all new-api traffic goes through `src/lib/api.ts`**, invoked from Server Components (reads) or `/api/portal/*` routes (mutations). The browser never holds a new-api credential.

## Rendering model

| Layer | Location | Role |
|---|---|---|
| Public pages | `src/app/page.tsx`, `src/app/models/`, `src/app/login/` | Server Components; pricing fetches public endpoints, no session required |
| Portal pages | `src/app/(portal)/**` | Server Components; layout guards session, pages call `src/lib/api.ts` with the session's access token |
| Client islands | `src/components/*` (dialogs, delete button, mobile nav, portal nav, usage stats, model pricing grid) | `'use client'`; interaction only — receive data via props, mutate via `/api/portal/*` fetch, never import `src/lib/api.ts` |
| API routes | `src/app/api/auth/*`, `src/app/api/portal/*` | Transport adapters: session check → validate input → call `src/lib/api.ts` → `{success, data|error}` JSON |
| Middleware | `src/middleware.ts` | Cookie-presence gate for protected prefixes; redirect to `/login` with `callbackUrl` |

## Data flow (read)

```
new-api ─▶ src/lib/api.ts (typed fn, access token)
        ─▶ Server Component (page) ─▶ props ─▶ presentational components
```

## Data flow (write)

```
Client island ─▶ fetch /api/portal/<resource> (session cookie)
             ─▶ route: getSession → validate → api.ts → new-api
             ─▶ {success:true,data} / {success:false,error}
             ─▶ island shows toast, then refreshes or reloads the page
```

State placement: **server is the source of truth**. Pages read through `api.ts` on every request; client state is transient UI state (dialog open, pending). There is no client store and no cache layer to invalidate — the correct home for new state is a Server Component read or a URL parameter (e.g. `?page=` on logs).

## Session model

JWT (`jose`, HS256) in httpOnly cookie `session`, 24h. Claims: `userId` (new-api), `accessToken` (Mezon OAuth token — userinfo only), `backendAccessToken` (new-api login session token — authorizes all user-scoped calls), `backendExpiresAt`, `username`, `mezonUserId`. Detailed flow: [authentication.md](authentication.md).

Critical property: `backendAccessToken` is the credential passed to user-scoped new-api calls; it is minted at OAuth callback time via a deterministic server-derived login and leaves the cookie only inside server code.

## Package layout

```
src/
├── app/            # routes only — no business logic beyond guard + fetch + render
├── components/     # client islands + shadcn/ui primitives
├── lib/            # api.ts (backend gateway), auth.ts (session), quota.ts (formatters)
└── middleware.ts   # route protection by cookie presence
```

Dependencies are deliberately thin: `next`, `react`, `jose`, shadcn/ui (base-ui) + tailwind, `lucide-react`, `sonner`. No data-fetching library, no state library, no ORM — the backend owns persistence.

## Invariants reviewers apply

1. No import of `src/lib/api.ts` from a Client Component (`'use client'`).
2. No `NEW_API_ADMIN_TOKEN` usage outside the OAuth callback's user-sync path (`src/app/api/auth/callback/route.ts` + `api.ts` admin functions).
3. No Go code, migrations, or relay logic in this repo — backend lives in `~/src/mezon-llm`.
4. New user-visible page ⇒ must be reachable via middleware/layout guard rules consistent with FR-1.4/FR-1.5.
5. Quota display always flows through `src/lib/quota.ts` formatters — 500,000 quota = $1, don't re-derive.

## Known limitations (accepted)

- Middleware checks cookie **presence**, not signature; pages re-verify via `getSession()` and redirect themselves.
- No test suite yet (OQ1); `bun run validate` is the only automated gate.
- Copy is inline Vietnamese, no i18n catalogue (see PRD out-of-scope).
