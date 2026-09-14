URL: https://raw.githubusercontent.com/dnd288/agent-kit/main/cli/kit/templates/CONTRIBUTING.md
Content-Type: text/plain
Method: text

---

# Contributing

This template describes a generic contribution workflow for projects scaffolded with agent-kit. Replace placeholder commands and paths with the commands your repository actually supports.

## Before you start

Install the project prerequisites and confirm the local toolchain works.

- Runtime: **Bun 1.x** (see `.tool-versions` or `package.json` → `packageManager`)
- Package manager: **bun** (`bun --version`)
- Database or service dependencies: none — this project is a frontend-only Next.js customer portal that proxies to the `mezon-llm` (new-api) Go backend; no local database
- Browser or mobile tooling: **Chromium** (installed once via `bunx playwright install chromium`) for e2e browser tests
- Secrets: copy `.env.example` to `.env.local` and fill `MEZON_CLIENT_ID`, `MEZON_CLIENT_SECRET`, `JWT_SECRET`, `NEW_API_BASE_URL`, `NEW_API_ADMIN_TOKEN`, etc. (full list in `.env.example`)

Run the bootstrap command once:

```sh
bun install
bun run validate          # typecheck + lint must pass
bun run test              # vitest unit tests
bun run test:e2e           # playwright-bdd e2e (installs browser if needed)
```

If setup fails, fix setup before writing feature code. A broken local loop makes every later result suspect.

## Workflow

Use the same shape for human and agent-driven changes.

1. **Branch** from the default branch.
2. **Specify** the behaviour when the change is user-visible, cross-workspace, or ambiguous.
3. **Build** the smallest vertical slice that proves the behaviour.
4. **Validate** with the right test modes and repository checks.
5. **Open a pull request** that links the issue, explains the change, and lists the evidence.

Do not mix unrelated layers in one pull request unless the specification says the integration is the change. Prefer small PRs that retire one uncertainty at a time.

## Day-to-day development commands

```sh
bun install              # install dependencies
bun run dev              # run the local development server (Turbopack)
bun run lint             # lint files (eslint)
bun run typecheck        # typecheck (tsc --noEmit)
bun run test             # run unit tests (vitest, jsdom)
bunx playwright install chromium  # first-time browser setup
bun run test:e2e         # run end-to-end tests (playwright-bdd, mock backend on :3099, dev server on :3001)
bun run bddgen           # generate Playwright specs from e2e/features/*.feature
bun run test:all         # run both vitest + playwright
bun run validate         # run the common ready check (typecheck + lint)
bun run build            # production build (next build)
```

Keep commands deterministic. If a command needs external services, document the service and the expected local URL.

## Frontend development

Frontend changes should keep rendering, data ownership, and copy ownership separate.

- Presentational components receive data through props.
- Application routes or screens own data loading and mutation wiring.
- User-facing copy comes from the catalogue when the project has i18n.
- Theme values come from tokens rather than raw colours or spacing values.
- Behaviour changes need tests at the layer that can observe them.

Run the component or browser test mode for changed interactions, responsive behaviour, accessibility states, or visual states.

## Backend development

Backend changes should keep transport and business logic separate.

- Route handlers validate input, call services, and return declared response shapes.
- Services hold business rules and should not depend on framework request/response objects.
- Database migrations must be backward compatible with the previous release unless the deployment plan says otherwise.
- External calls need typed failures, timeouts, and test doubles.
- Auth, authorization, webhooks, uploads, and secrets require a security pass.

Run unit tests for services, contract tests for API boundaries, and integration tests for persistence or external-system behaviour.

## Fixing a bug

A bug fix starts with a diagnosis.

1. Reproduce or observe the failure.
2. Identify the smallest code path that explains it.
3. Check what else relies on the behaviour you are about to change.
4. Fix the cause, not only the symptom.
5. Add or update the test that would have caught it.
6. Validate the affected slice.

If the cause is not obvious, write a short bugfix specification or issue note before changing code: observation, hypothesis, impact, fix, and verification.

## Testing

Use the cheapest mode that can prove the claim during development, then run the required ready checks before PR.

- **Static checks**: formatting, linting, type checking, repository guards.
- **Unit tests**: pure functions, services, reducers, validators, and utilities.
- **Component tests**: component states, events, accessibility contracts, and rendering branches.
- **Integration tests**: persistence, API contracts, queues, external clients, and framework wiring.
- **End-to-end tests**: full user journeys, cross-service flows, auth/session behaviour, and deployment-sensitive paths.
- **Security tests**: permissions, secret handling, dependency risk, injection, upload handling, and untrusted input.

Do not say a mode passed unless you ran it. If a mode is unavailable locally, record why and how CI or a reviewer should run it.

## Ready checklist

Before marking work ready:

- [ ] The change has an issue, task, or written reason.
- [ ] User-visible or cross-workspace behaviour has a specification (`openspec/changes/`).
- [ ] Non-obvious technical choices have an ADR.
- [ ] Tests cover the claim at the right layer (`bun run test` for logic; e2e slice for user flows).
- [ ] Static checks and guards pass (`bun run validate`).
- [ ] Documentation no longer describes shipped work as planned — `docs/`, `README.md`, `CONTEXT.md` updated in the same change when they describe changed behaviour (or an explicit N/A is recorded).
- [ ] The e2e slice for the changed flow has been run (`bun run test:e2e <slice>`), with the slice name, result, and skips recorded in the PR body or `verification.md`.
- [ ] Migrations and rollout steps are documented (N/A: no database in this repo).
- [ ] Security-sensitive changes had a security review.
- [ ] The PR description lists commands run and results.

## Working with a coding agent

Keep project knowledge portable across tools.

- Put durable rules in `AGENTS.md`, workspace `AGENTS.md` files, docs, specs, and ADRs.
- Put task procedures in skills.
- Do not rely on a single vendor's memory feature for rules another agent must obey.
- Skills should route to owning documents instead of duplicating them.
- If an agent changes a rule in docs, it should check the skills that cite that rule in the same change.
- Ask agents to report checks they ran and checks they could not run.

## Commits

Use conventional commits:

```text
feat(scope): add new behaviour
fix(scope): correct broken behaviour
docs(scope): update documentation
test(scope): add or repair tests
refactor(scope): change structure without behaviour change
chore(scope): maintain tooling or dependencies
```

The scope should usually be the workspace, package, service, or layer. Keep commits coherent: one reason per commit.

## Pull requests

A pull request should include:

- Linked issue or task
- Summary of the change
- Test plan with commands and results
- Screenshots or recordings for UI changes when useful
- Migration, rollout, and rollback notes when applicable
- Labels that trigger optional CI suites when the repository uses label-driven checks
- Known follow-up work, with owners or issue links

Do not hide risk in the body text. Call out compatibility breaks, data migrations, new secrets, permission changes, and operational dependencies near the top.

## Decisions

Use ADRs for decisions that future maintainers would otherwise re-litigate.

File name:

```text
docs/adr/NNNN-short-title.md
```

Recommended sections:

- Title
- Status
- Context
- Decision
- Consequences
- What would reverse this

Every ADR needs an exit condition. If the decision is later reversed, update the old ADR's status and link the replacement.

## Secrets

Never commit credentials, tokens, private keys, production data, or customer data.

- Keep local secrets in ignored files.
- Provide example environment files with placeholder values only.
- Run secret scanners in CI and, where practical, pre-commit or pre-push hooks.
- If a secret is committed, treat it as compromised: rotate it, remove it from history according to project policy, and document the incident.
- Do not paste secrets into issues, PRs, logs, screenshots, or agent prompts.