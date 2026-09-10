# Testing & validation

Current honest state: **no test suite**. The only automated gate is static.

## Commands

| Command | What it proves |
|---|---|
| `bun run typecheck` | TypeScript compiles (`tsc --noEmit`) |
| `bun run lint` | ESLint (eslint-config-next) |
| `bun run validate` | both — the ready check |
| `bun run build` | production build succeeds |

## What each change owes today

| Change type | Minimum proof |
|---|---|
| Pure styling / copy | `bun run validate` |
| Server Component data flow | validate + `bun run build` + manual run against dev server (or a backend stub) |
| Auth / session changes | validate + build + manual login/logout cycle; a security review pass per `AGENTS.md` |
| API route / `api.ts` changes | validate + exercising the route with the dev server (`curl` with session cookie) |

Manual verification against the real backend requires `.env.local` (see `.env.example`); pricing/login can be exercised with public endpoints alone.

## Why there is no suite (OQ1)

The baseline shipped UI-first with a single validation command. Adopting a stack (e.g. vitest + Playwright) is an open question with maintainer ownership — [`product/open-questions.md`](../product/open-questions.md) OQ1. Until answered:

- New user-visible changes follow OpenSpec: scenarios are written as acceptance criteria even though no automated mode executes them; `verification.md` records exactly what ran and what did not.
- Do **not** claim "tests pass" — state the commands actually run.

## Rules that hold regardless

- A check that did not run is a gap, not a pass; say so in the PR.
- Any change touching auth, session, cookies, or secrets gets a security pass (see `AGENTS.md` boundaries; `mlp-security` skill).
- E2E/browser tests, when adopted, prove FR-1 (login → protected route), FR-4 (key lifecycle), FR-6 (voucher redemption) first — the money paths.
