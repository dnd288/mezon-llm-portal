# Testing & validation

Current state: **Vitest (Unit/Integration) + Playwright (E2E Browser)** test suites are active.

## Commands

| Command | What it proves |
|---|---|
| `bun run typecheck` | TypeScript compiles (`tsc --noEmit`) |
| `bun run lint` | ESLint (eslint-config-next) |
| `bun run test` | Vitest unit tests under `src/` (jsdom environment, fast) |
| `bun run test:watch` | Vitest interactive watch mode |
| `bun run bddgen` | Generates Playwright test specs from Gherkin feature files |
| `bun run test:e2e` | `bddgen && playwright test` — BDD Gherkin E2E browser tests (Desktop Chromium & Mobile Chrome) |
| `bun run test:e2e:ui` | `bddgen && playwright test --ui` — interactive UI runner |
| `bun run test:all` | Runs both Vitest and Playwright BDD test suites |
| `bun run validate` | `typecheck` + `lint` — static checks gate |
| `bun run build` | Next.js production build succeeds |

## Test Suite Structure

### 1. Unit & Logic Tests (`vitest.config.mts`)
- Located in `src/**/*.{test,spec}.ts(x)`.
- Runs with Vitest in `jsdom` environment with native tsconfig path alias `@/*` resolution.
- Covers formatting utilities (`src/lib/quota.test.ts`), business logic, and helper functions.

### 2. End-to-End BDD Browser Tests (`playwright.config.ts`, `playwright-bdd`)
- Scenarios are authored in human-readable Gherkin syntax under `e2e/features/*.feature`.
- Step definitions reside under `e2e/steps/*.steps.ts` with custom fixtures in `e2e/steps/fixtures.ts`.
- Automatically compiles `.feature` files into `.features-gen/` via `bddgen`.
- Boots local dev server on port 3001 (`PORT=3001 bun run dev`) and in-memory mock backend on port 3099 (`e2e/mock-backend.ts`).
- Tested across Desktop Chromium and Mobile Chrome (Pixel 7) viewports.
- Feature files mapped directly to PRD functional requirements:
  - **FR-1 & FR-7 Auth Guard & Session Security** (`e2e/features/auth.feature`): Protected route redirects, callbackUrl preservation, expired/tampered JWT rejection.
  - **FR-2 Public Discovery & Models Pricing** (`e2e/features/discovery.feature`): Landing page ecosystem, pricing catalog, search, provider filters, clipboard copy.
  - **FR-3 Dashboard & Quota Overview** (`e2e/features/dashboard.feature`): Quota balance, usage metrics, tool setup tabs (Claude Code, OpenCode, Cursor, Hermes), degraded gateway fallback.
  - **FR-4 API Key Lifecycle Management** (`e2e/features/tokens.feature`): Token listing, status badges, name validation, secret key reveal (`sk-...`), token revocation with confirmation.
  - **FR-5 Usage Logs & Pagination** (`e2e/features/logs.feature`): Table columns, model badges, pagination forward/backward.
  - **FR-6 Voucher Redemption & History** (`e2e/features/vouchers.feature`): Top-up transactions, invalid voucher error toasts, successful voucher redemption.
  - **Complete User Journey** (`e2e/features/full-journey.feature`): Full user flow from visitor landing to active token creation, voucher redemption, usage inspection, and logout.

### 3. Mezon OAuth Handling in Tests (`e2e/fixtures/auth.ts`)
- To avoid flakiness, 2FA, rate limits, and external network dependencies, tests against protected portal pages use the `authedPage` fixture.
- The fixture generates a signed JWT session cookie using the test environment's `JWT_SECRET` and injects it directly into the browser context via `context.addCookies()`.

## What each change owes

| Change type | Minimum proof | Docs to update |
|---|---|---|
| Pure styling / copy | `bun run validate` | `docs/design/README.md` if a token or design rule changes; otherwise none, but state N/A explicitly |
| Utility / lib changes | `bun run test` + `bun run validate` | `docs/` only if the utility's behaviour is documented there |
| Server Component data flow | `bun run test:all` + `bun run build` + e2e slice covering the flow | `docs/engineering/architecture.md` if data flow changes |
| Auth / session changes | `bun run test:all` + security review per `AGENTS.md` | `docs/engineering/authentication.md` + `docs/engineering/architecture.md` |
| API route / `api.ts` changes | `bun run test:all` + e2e slice for the route | `docs/engineering/backend-api.md` |
| User-visible behaviour (any FR) | above + the `e2e/features/*.feature` slice for the FR, recorded in `verification.md`; full suite on CI | `docs/product/prd.md` and any `docs/product/open-questions.md` gating it, plus the screen entry in `docs/design/README.md` if layout changes |

### Docs sync gate

If a change ships behaviour that any of `docs/`, `README.md`, `CONTEXT.md`, or `openspec/` describes in old terms, the doc must be updated in the same change. A review should block a PR whose diff touches a documented behaviour without a matching doc edit (or an explicit "N/A — no documented behaviour changes" in the PR body / `verification.md`).

### E2E slice gate

- **Slice over suite locally.** Each PR need only run the slice relevant to the changed FR(s). The slice name is the feature file or the tag: e.g. `bun run test:e2e e2e/features/tokens.feature`, or `bun run test:e2e --grep @tokens`.
- **Record evidence.** In `openspec/changes/<id>/verification.md` or the PR body, state: which slice was run, what passed, what failed, and what was skipped and why. "Started and killed" is **unrun**.
- **Full suite verifies on CI.** The `e2e` job in `.github/workflows/ci.yml` runs `bun run test:e2e` across all features. A green local slice does not absolve a red CI suite.
- **Docs-only / copy-only changes** explicitly skip e2e — but must say so.
