---
name: test
description: "Running the Mezon LLM Portal test stacks on demand — bun validate, vitest, and Playwright BDD e2e. Load this when asked to run tests, decide which test mode a change needs, run an e2e slice, or report test results. Routes to docs/engineering/testing.md and AGENTS.md for the Definition of Done."
---

# Running the project test stacks

This project has three real test/validation layers:

| Mode | Command | Needs | What it proves |
|---|---|---|---|
| Static validation | `bun run validate` | nothing | `tsc --noEmit` + ESLint |
| Unit / logic | `bun run test` | nothing | Vitest tests under `src/**/*.{test,spec}.{ts,tsx}` in jsdom |
| End to end | `bun run test:e2e` or `bun run test:e2e <slice>` | Chromium | Playwright BDD scenarios under `e2e/features/` against the mock backend + Next dev server |

There are no separate Storybook, quality, pixel, visual, Postgres, turbo, or monorepo test stacks in this repository. If another skill mentions those as required project checks, this file and `docs/engineering/testing.md` win.

## What to run

Use the cheapest layer that can observe the claim while developing, then run the required ready checks before PR.

| Change surface | Minimum proof |
|---|---|
| Docs-only / instructions-only | `bun run validate`; verify docs are internally consistent |
| Utility / pure library logic | `bun run test` + `bun run validate` |
| `src/lib/api.ts` or API route proxy changes | `bun run test` + affected `bun run test:e2e <slice>` + `bun run validate` |
| Auth/session/middleware changes | `bun run test` + `bun run test:e2e e2e/features/auth.feature` + security review + `bun run validate` |
| User-facing route/component behaviour | affected `bun run test:e2e <slice>` + `bun run validate` |
| Broad user flow changes | `bun run test:all` locally if practical; CI runs the full e2e suite |

## E2E stack

`playwright.config.ts` owns the stack:

- `bddgen` compiles `e2e/features/*.feature` into `.features-gen/` before Playwright starts.
- The mock backend starts on `MOCK_PORT=3099` via `bun run e2e/mock-backend.ts`.
- The Next.js dev server starts on `PORT=3001` with `NEW_API_BASE_URL=http://localhost:3099`.
- Projects: Desktop Chromium and Mobile Chrome (Pixel 7).
- Workers: `1`, to avoid dev-server contention.
- `reuseExistingServer: !CI`; locally, an already-running server on the same port may be reused.

Generated `.features-gen/` output is build output: never edit it, never commit it.

## Browser setup

Run once per machine if Playwright reports a missing executable:

```bash
bunx playwright install chromium
```

CI installs Chromium with dependencies:

```bash
bunx playwright install --with-deps chromium
```

## Running a slice

Prefer a slice locally. The full suite is CI's job.

```bash
bun run test:e2e e2e/features/auth.feature
bun run test:e2e e2e/features/tokens.feature
bun run test:e2e --grep "@tokens"
bun run test:e2e --grep "Authenticated user visiting login page"
bun run test:e2e --last-failed
```

A slice is evidence only for the flow it covers. A run that was started and killed is **unrun**, not green.

## Feature map

| Feature | Requirement area |
|---|---|
| `e2e/features/auth.feature` | FR-1 auth guard + FR-7 session security |
| `e2e/features/discovery.feature` | FR-2 public landing + model discovery |
| `e2e/features/dashboard.feature` | FR-3 dashboard + quota overview |
| `e2e/features/tokens.feature` | FR-4 API key lifecycle |
| `e2e/features/logs.feature` | FR-5 usage logs |
| `e2e/features/vouchers.feature` | FR-6 voucher redemption |
| `e2e/features/full-journey.feature` | cross-FR smoke journey |

## Docs sync check

No command can prove docs are semantically correct. The check is manual:

1. Identify the behaviour the change alters.
2. Search `docs/`, `README.md`, `CONTEXT.md`, `AGENTS.md`, and `openspec/` for the old terms or affected requirement ID.
3. Update docs that describe shipped behaviour in old terms.
4. Record either the docs changed or `N/A — no documented behaviour changed` in `verification.md` or the PR body.

A review should block a user-facing change that changes behaviour without docs evidence or an explicit N/A.

## Reporting results

Report exact commands and verdicts:

```md
Validation:
- bun run validate — pass (0 errors, 1 existing warning in src/components/model-pricing-grid.tsx)
- bun run test — 26 passed
- bun run test:e2e e2e/features/auth.feature — 14 passed
Docs: e2e/README.md and docs/engineering/testing.md updated
Skipped: full e2e suite locally; CI runs it
```

Do not write "tests pass" unless the command produced a terminal verdict.

## Verification

- [ ] The change's surface is mapped to the smallest command that can observe it.
- [ ] `bun run validate` ran before work was called ready.
- [ ] `bun run test` ran for changed logic, API mapping, auth/session helpers, or utilities.
- [ ] An e2e slice under `e2e/features/` ran for changed user flows, and the slice name + result are recorded.
- [ ] Docs that describe this behaviour were checked and updated, or explicitly marked N/A.
- [ ] Any skipped check is named with the reason.
