# Testing & validation

Current state: **Vitest (Unit/Integration) + Playwright (E2E Browser)** test suites are active.

## Commands

| Command | What it proves |
|---|---|
| `bun run typecheck` | TypeScript compiles (`tsc --noEmit`) |
| `bun run lint` | ESLint (eslint-config-next) |
| `bun run test` | Vitest unit tests under `src/` (jsdom environment, fast) |
| `bun run test:watch` | Vitest interactive watch mode |
| `bun run test:e2e` | Playwright E2E browser tests under `e2e/` (Chromium desktop) |
| `bun run test:e2e:ui` | Playwright interactive UI runner |
| `bun run test:all` | Runs both Vitest and Playwright test suites |
| `bun run validate` | `typecheck` + `lint` — static checks gate |
| `bun run build` | Next.js production build succeeds |

## Test Suite Structure

### 1. Unit & Logic Tests (`vitest.config.mts`)
- Located in `src/**/*.{test,spec}.ts(x)`.
- Runs with Vitest in `jsdom` environment with native tsconfig path alias `@/*` resolution.
- Covers formatting utilities (`src/lib/quota.test.ts`), business logic, and helper functions.

### 2. End-to-End Browser Tests (`playwright.config.ts`)
- Located in `e2e/*.spec.ts`.
- Automatically boots local dev server on port 3001 (`PORT=3001 bun run dev`) to avoid port 3000 collision with the backend `new-api` Docker container.
- Covers:
  - **Landing page** (`e2e/landing.spec.ts`): Hero text, brand logos, ecosystem cards, CTA navigation.
  - **Public Models & Pricing** (`e2e/models.spec.ts`): Model catalog, pricing display, search input.
  - **Auth Guard Middleware** (`e2e/auth-guard.spec.ts`): Unauthenticated redirects for `/dashboard`, `/tokens`, `/logs`, `/vouchers`.
  - **Authenticated Portal** (`e2e/portal.spec.ts`): Sidebar user identity, navigation links, and redirects away from `/login`.

### 3. Mezon OAuth Handling in Tests (`e2e/fixtures/auth.ts`)
- To avoid flakiness, 2FA, rate limits, and external network dependencies, tests against protected portal pages use the `authedPage` fixture.
- The fixture generates a signed JWT session cookie using the test environment's `JWT_SECRET` and injects it directly into the browser context via `context.addCookies()`.

## What each change owes

| Change type | Minimum proof |
|---|---|
| Pure styling / copy | `bun run validate` + `bun run test:e2e` |
| Utility / lib changes | `bun run test` + `bun run validate` |
| Server Component data flow | `bun run test:all` + `bun run build` |
| Auth / session changes | `bun run test:all` + security review per `AGENTS.md` |
| API route / `api.ts` changes | `bun run test:all` |
