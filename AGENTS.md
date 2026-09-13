URL: https://raw.githubusercontent.com/dnd288/agent-kit/main/cli/kit/templates/AGENTS.md
Content-Type: text/plain
Method: text

---

# Agent instructions

This file is the root instruction template for coding agents working in this repository. Workspace-specific rules live beside the code they govern, usually in `AGENTS.md` files under each application, package, service, or tool workspace. This root file states the conventions that should stay true everywhere.

## Golden rules

**Compound engineering: the codebase gets simpler as the product gets larger.** Business growth is data growth. A new customer, plan, tenant, locale, provider, workflow, or product variant should usually be a row, configuration record, or extension point — not a branch, flag, copy, or one-off module. If shipping a feature required a new concept, that is the finding, not merely the deliverable.

1. **Leave it easier to change than you found it.** The test is not "is this good code" but "is the next change cheaper than this one was".
2. **A new abstraction earns its place by deleting.** If it adds a layer and removes nothing, say what it will remove and when — or do not add it.
3. **Two is a coincidence; three is a missing abstraction** — and the abstraction *replaces* all three. One that sits beside them made things worse.
4. **Delete the special case; do not flag it.** Accumulated flags are how a codebase stops being readable in one pass.
5. **An exception is written down and bounded, or it becomes the rule.** Every exception records why it exists, what owns it, and what would remove it.

These rules are enforced by review. A guard can catch a forbidden import or a raw token; it cannot decide whether an abstraction earned its place.

## Orientation

Start here before changing code:

- [README.md](README.md) — project overview, stack, setup, commands, and troubleshooting
- [CONTEXT.md](CONTEXT.md) — glossary for project terms that collide with everyday language or other domains
- [docs/README.md](docs/README.md) — documentation index
- [docs/product/](docs/product/) — product requirements, open questions, and decisions that are not code-shaped
- [docs/engineering/](docs/engineering/) — architecture, data flow, testing, security, and operational notes
- [docs/adr/](docs/adr/) — architecture decision records
- [openspec/](openspec/) — specifications for user-visible or cross-workspace changes
- Workspace `AGENTS.md` files — layer-specific rules beside the code they govern

If a document describes planned work and you ship it, update or remove the "planned" language in the same change.

## Skills

Task-specific procedure lives in skills. The CLI may generate this table from the skills installed for the project.

| Skill | Owns |
|---|---|
| `mlp-review` | Five-axis code review gate |
| `mlp-verify` | Adversarial claim verification against specifications |
| `mlp-tdd` | RED→GREEN discipline with mode-to-claim mapping |
| `mlp-bugfix` | inspect→debug→impact→fix→verify loop |
| `mlp-refactor` | MEASURE→PIN→MOVE→PROVE→RECORD loop |
| `mlp-simplicity` | Simplest-sufficient-shape decision — the rung ladder |
| `mlp-spec-workflow` | Typed changes with end-to-end-first ordering |
| `mlp-pr` | Five PR types with checklists and conventions |
| `mlp-component-development` | Primitive component development patterns |
| `mlp-ui-development` | Feature-folder composite UI patterns |
| `mlp-app-development` | Application routing, data flow, access control |
| `mlp-state-management` | State placement decision ladder |
| `mlp-design` | Design system methodology |
| `mlp-test` | Test mode taxonomy and operational runbook |
| `mlp-security` | Surface-aware security review |
| `mlp-local-dev` | Local development environment setup |
| `mlp-optimization-loop` | BASELINE→CHANGE→MEASURE→KEEP-OR-REVERT performance loop |
| `mlp-scenario-explorer` | Enumerate the case space before writing tests |

**Skills route; they do not restate.** A skill should name the procedure, point to the document that owns the rule, and keep the execution checklist close to the tool. If a skill and a document disagree, trust the owning document and fix the disagreement.

## Before marking work ready

Run the project's standard validation command before calling work ready. At minimum, a ready change should have passed:

- **Formatting, linting, and type checking** — `bun run validate` (typecheck + lint)
- **Unit tests for changed logic** — `bun run test` (vitest, jsdom)
- **E2E slice for changed user flows** — `bun run test:e2e <slice>` — required if the change touches `src/app/**`, `src/components/**`, `src/lib/api.ts`, `src/middleware.ts`, or any `FR-*` from `docs/product/prd.md`. State which slice, the result, and what was skipped and why. The full suite is not expected locally; the slice must cover the change.
- **Docs in sync** — if `docs/`, `README.md`, `CONTEXT.md`, `openspec/`, or `AGENTS.md` describe shipped behaviour that the change alters, update the doc in the same change. Do not leave "planned" language for shipped work. If docs are not relevant, say so explicitly.
- **Guards & invariants** — run `bun run lint` and `bun run typecheck` (both part of `bun run validate`). No separate guard suite is wired yet; lint and typecheck are the automated floor.
- **Security checks** — for changes touching auth, authorization, secrets, uploads, webhooks, dependencies, or external input, run the security review per `mlp-security`. CI runs Gitleaks and `npm-audit` on PRs (`.github/workflows/security.yml`).

Do not claim a check passed unless you ran it. If a check could not run, say which one and why. Prefer the smallest test slice that proves the claim during development, then run the full required validation before PR. The canonical source of "done" for this project is this section; skills route here rather than restating the criteria.

## Boundaries

Fill in project-specific package names and directories, but keep the boundaries explicit.

- **Client and API never import each other.** Shared request and response contracts belong in a neutral package or schema layer. The browser reaches the API through the application's approved topology, not by bypassing it.
- **UI composites are presentational.** Reusable UI components receive data through props and emit events through callbacks. They do not fetch, mutate, read global application state, or know about routing unless that is their explicit layer.
- **State goes where the decision ladder puts it.** Database state belongs in the database and is read at the appropriate server/data boundary. URL state belongs in the URL. Cache state belongs in the data-fetching layer. Screen-local state stays local. Global stores need a written reason.
- **Business logic lives in services, not route handlers.** Routes adapt transport to application calls: validate input, call services, map success and failure to schemas. Framework request/response types should not leak into domain services.
- **Copy lives in the i18n catalogue.** Components should not hide user-facing strings in implementation code when the project has a catalogue. Callers own copy they pass into slots.
- **Theme tokens only in components.** Use named tokens for colour, spacing, typography, radius, and shadows. Raw values in UI code are exceptions that need a documented reason.

Add boundaries for data ownership, background jobs, generated files, migrations, observability, and deployment once the project needs them.

## Specifications and decisions

User-visible changes and changes spanning more than one workspace get a specification before code. The specification states the behaviour, scenarios, non-goals, and verification plan. Code implements the specification; it should not be the first place the requirement appears.

Non-obvious technical choices get an ADR in `docs/adr/`:

- One decision per record
- Name files `NNNN-short-title.md`
- Include status, context, decision, consequences, and **what would reverse this**
- Link ADRs from specs, docs, and code comments where the decision explains an otherwise surprising constraint
- Update or supersede the ADR when the decision changes

A defect with an obvious cause can go straight to a fix. A defect whose cause is not obvious gets a short written diagnosis: observation, impact, fix, and verification.

## Git

Use conventional commits. Prefer scopes that name the workspace or layer, not the feature story:

- `feat(scope): add new behaviour`
- `fix(scope): correct broken behaviour`
- `docs(scope): update written guidance`
- `test(scope): defend behaviour`
- `refactor(scope): change shape without changing behaviour`
- `chore(scope): maintain tooling or dependencies`

Branch names should identify the work and its type, for example:

- `feature/123-short-name`
- `fix/123-short-name`
- `docs/123-short-name`
- `chore/123-short-name`

Pull requests should link the issue or task they finish, state the user-visible change, list the validation run, and call out migrations, feature flags, security implications, or follow-up work. Do not commit credentials. Do not bypass hooks unless a human explicitly instructs you to and the reason is recorded.

---

## Project-specific boundaries — Mezon LLM Portal

### Architecture

- **Frontend-only Next.js app.** This project is a customer portal that communicates with the mezon-llm (new-api) Go backend via its REST API. It does NOT contain Go code, database models, or relay logic.
- **Backend is at `~/src/mezon-llm`.** API routes in `src/app/api/` proxy requests to the new-api backend, keeping secrets server-side. Never expose `NEW_API_ADMIN_TOKEN` or `MEZON_CLIENT_SECRET` to the browser.
- **Server Components fetch data; Client Components handle interaction.** Pages under `src/app/(portal)/` are Server Components that call `src/lib/api.ts`. Interactive elements (dialogs, forms) are Client Components under `src/components/`.

### Auth flow

- **Mezon OAuth 2.0 → JWT session.** Users authenticate via Mezon OAuth, which produces a session JWT stored in an httpOnly cookie named `session`. The JWT contains `userId`, `accessToken`, `username`, and `mezonUserId`.
- **User sync.** On first login, the callback route creates a corresponding user in new-api via the admin token. Subsequent logins look up the existing user.
- **Middleware guards.** `src/middleware.ts` protects `/dashboard`, `/tokens`, `/logs`, `/vouchers` routes.

### API client

- `src/lib/api.ts` is the single gateway to the new-api backend. All new-api calls go through this module.
- Every function accepts `ApiOptions` with `accessToken` (for user-scoped calls) or `adminToken` (for privileged calls).
- Never import `api.ts` from Client Components. Use API routes under `src/app/api/portal/` as intermediaries.

### Packages and naming

- Package manager: **bun**. Install command: `bun install`. Dev server: `bun run dev`.
- UI components: shadcn/ui v5 (base-ui). Button does NOT support `asChild` — use `buttonVariants()` + `<Link>` or `<a>` for link-buttons, or `render` prop on `DialogTrigger`.
- Icons: `lucide-react`.
- Formatting utilities: `src/lib/quota.ts` for quota, token, and date formatting.

### Do not

- Do not add Go files, database migrations, or relay logic to this repo.
- Do not bypass the API route proxy layer — browser code must not call new-api directly.
- Do not store raw new-api admin tokens in client-accessible locations.
- Do not use `asChild` prop on shadcn v5 components.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
