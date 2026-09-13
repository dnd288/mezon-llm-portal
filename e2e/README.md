# E2E BDD Tests

End-to-end tests use **Playwright + playwright-bdd** with Gherkin feature files. They boot a mock backend (`:3099`) and a Next.js dev server (`:3001`) automatically.

## Quick start

```bash
bun install                        # first time
bunx playwright install chromium   # first time — installs Chromium
bun run test:e2e                   # run all features (Desktop Chrome + Mobile Chrome)
```

## Running a slice (preferred locally)

The full suite runs on CI. Locally, narrow to the slice your change touches:

```bash
bun run test:e2e e2e/features/auth.feature          # one feature
bun run test:e2e e2e/features/tokens.feature         # another feature
bun run test:e2e --grep "@tokens"                    # by tag
bun run test:e2e --grep "Full user journey"          # by scenario title
bun run test:e2e --last-failed                       # re-run what just failed
```

A slice is **enough for local proof**. The full suite verifies on CI.

## Architecture

| Layer | Path | Role |
|---|---|---|
| Features | `e2e/features/*.feature` | Gherkin scenarios, human-readable |
| Steps | `e2e/steps/*.steps.ts` | Step definitions implementing the Gherkin |
| Fixtures | `e2e/steps/fixtures.ts` + `e2e/fixtures/auth.ts` | `authedPage` fixture (JWT injection) + mock portal API routes |
| Mock backend | `e2e/mock-backend.ts` | `Bun.serve` on `MOCK_PORT=3099`; simulates all `/api/user/*`, `/api/token/*`, `/api/log/*`, `/api/pricing`, `/api/status/models` endpoints with controllable test state |
| Config | `playwright.config.ts` (root) | Projects: `chromium` + `Mobile Chrome` (Pixel 7); `webServer` boots mock backend then dev server |

## Auth in tests

Protected pages use the `authedPage` fixture (defined in `e2e/fixtures/auth.ts`). It generates a signed JWT session cookie (HS256 via `jose`) and injects it via `context.addCookies()`, bypassing the real Mezon OAuth flow.

## Mock backend state control

The mock backend exposes endpoints to reset or modify test state between scenarios:

| Endpoint | Effect |
|---|---|
| `POST /__test_reset` | Resets all state to defaults |
| `POST /__test_set_state` | Accepts flags: `emptyTokens`, `emptyLogs`, `gatewayError`, `seedPagination` (25 logs) |

## Mapping features → PRD requirements

| Feature | PRD FR | Tags |
|---|---|---|
| `auth.feature` | FR-1.4, FR-1.5, FR-7 | `@auth @security` |
| `discovery.feature` | FR-2.1, FR-2.2 | `@discovery @public` |
| `dashboard.feature` | FR-3.1–FR-3.3 | `@dashboard @portal` |
| `tokens.feature` | FR-4.1–FR-4.4 | `@tokens @portal` |
| `logs.feature` | FR-5.1, FR-5.2 | `@logs @portal` |
| `vouchers.feature` | FR-6.1–FR-6.3 | `@vouchers @portal` |
| `full-journey.feature` | Cross-FR | `@journey @full` |

## E2E slice gate (for changes)

When a change touches user-facing code (`src/app/**`, `src/components/**`, `src/lib/api.ts`, `src/middleware.ts`), run the e2e slice for the affected FR. Record the result in `openspec/changes/<id>/verification.md` or the PR body:

```md
E2E slice: e2e/features/tokens.feature
Result: 4 scenarios passed, 0 failed
Skipped: none
```

## Troubleshooting

| Symptom | Fix |
|---|---|
| `Executable doesn't exist` | Run `bunx playwright install chromium` |
| Tests time out on first route | Next.js dev server compiles per route; wait for `webServer.timeout` (120s). Cold start can take ~35s. |
| `PORT 3001 in use` | Kill dev server: `lsof -ti :3001 \| xargs kill` |
| `PORT 3099 in use` | Kill mock backend: `lsof -ti :3099 \| xargs kill` |
| Flaky layout assertions | Run with `--workers 1` (default locally); Chromium renders differently under headed mode — always run headless in CI. |
