---
name: spec-workflow
description: "Specification-driven workflow for Mezon LLM Portal changes — decide whether a change needs OpenSpec, write flows first, keep docs/e2e in the Definition of Done, then verify and archive. Load this when starting user-visible work, changing an FR, updating openspec artifacts, or deciding what a task must prove."
---

# Specification workflow

Anything user-visible, cross-cutting, or ambiguous gets an OpenSpec change before code. `AGENTS.md` owns that rule; this skill is the working procedure.

Copy-only tweaks and defects with an obvious cause can go straight to a pull request. A defect whose cause is not obvious gets a bugfix change and a diagnosis.

## First: pick the change type

OpenSpec schemas live in `openspec/schemas/`. Change folders live in `openspec/changes/<id>/`.

| Type | Owns | Proven by |
|---|---|---|
| `ui` | presentational components in `src/components/` and primitives in `src/components/ui/` | `bun run validate` + the affected e2e slice when the UI is user-visible |
| `fe` | Next.js routes, Server Components, Client Components, route state, proxy wiring in `src/app/` | `bun run test`, `bun run test:e2e <slice>`, `bun run validate` |
| `be` | portal API proxy routes in `src/app/api/` and gateway calls in `src/lib/api.ts`; the real backend is `~/src/mezon-llm` and is not edited here | `bun run test`, affected e2e slice, backend docs update |
| `integration` | a full user journey across pages, auth, proxy routes, and the mock backend | `bun run test:e2e <slice>` or full CI e2e |
| `bugfix` | a defect at any layer | failing reproduction first, then fixed slice passing |
| `cross-cutting` | docs, workflows, skills, CI, config, or work that intentionally spans layers | the checks named by the change |

```bash
openspec new change <id> --schema <type>
```

Pass `--schema` every time. The default in `openspec/config.yaml` is `cross-cutting`; omitted schemas can silently select the wrong workflow.

## Sequence

The order is **proposal → flows → specs/design/tasks → code → verification → archive**.

| Phase | Artifact | Rule |
|---|---|---|
| Propose | `openspec/changes/<id>/proposal.md` | cite FR- identifiers from `docs/product/prd.md`, name open questions from `docs/product/open-questions.md`, and name docs expected to change |
| Flows | `openspec/changes/<id>/flows.md` | write the user/business flow before code; state what this change can and cannot prove end-to-end |
| Specs | `openspec/changes/<id>/specs/*/spec.md` | one `#### Scenario:` per claim; each scenario maps to an e2e feature, unit test, or explicit N/A |
| Design | `openspec/changes/<id>/design.md` | only when implementation choices are not obvious; cite `AGENTS.md`, `docs/engineering/*`, and ADRs |
| Tasks | `openspec/changes/<id>/tasks.md` | first task is the flow barrier; last task is docs sync + verification evidence |
| Apply | code/docs/config | implement the smallest slice; keep docs with code when behaviour changes |
| Verify | `openspec/changes/<id>/verification.md` | paste `bun run validate`, `bun run test` when relevant, `bun run test:e2e <slice>`, docs changed/N/A, skipped checks |
| Archive | `openspec archive <id>` | after implementation and review; sync living specs if the archive process requires it |

## Flow-first rule

A flow written after the code proves only that the code can pass that flow. A flow written first is a disproof attempt: it says what would fail if the code were wrong.

For Mezon LLM Portal, flows become Gherkin under `e2e/features/*.feature` with step definitions under `e2e/steps/*.ts`. A sentence with no step behind it fails `bddgen` before the browser starts; that is an unfinished flow, not a red product test.

If a single-layer change cannot turn the flow green yet, write the flow anyway and record why it is pending in `flows.md`. Do not call a pending flow a pass.

## Task contract

A task in `tasks.md` is hand-off ready when it names:

- the scenario or FR it implements
- the files/areas it may touch
- the skill to load (`mlp-ui-development`, `mlp-app-development`, `mlp-tdd`, etc.)
- the command that proves it (`bun run validate`, `bun run test`, `bun run test:e2e <slice>`)
- the docs it must update, or `N/A — no documented behaviour changes`

The last task in every change is verification:

```md
- [ ] Verify and record evidence
  - Run `bun run validate`
  - Run `bun run test` if logic changed
  - Run `bun run test:e2e <slice>` if a user flow changed
  - Update docs or record N/A
  - Paste results into `verification.md`
```

## Surface table

| Surface | Location | Must ship |
|---|---|---|
| UI primitive | `src/components/ui/<name>.tsx` | component, variants, any unit test needed, exported API, docs/design update if tokens/variants change |
| UI composite | `src/components/<name>.tsx` or feature folder under `src/components/` | props-only component, no direct backend calls, e2e slice if user-visible, docs/design update if layout/behaviour changes |
| App route | `src/app/**/page.tsx` | Server Component data loading, DTO→props mapping, links/routes, e2e slice for the page flow |
| Client leaf | `src/components/**` or client file under `src/app/**` | `'use client'`, local interaction, API calls only through `src/app/api/portal/*`, e2e slice for changed behaviour |
| API proxy route | `src/app/api/**/route.ts` | request parsing, session/admin-token handling, call into `src/lib/api.ts`, error mapping, unit/e2e coverage |
| API client | `src/lib/api.ts` | typed new-api call, response normalization, docs/engineering/backend-api.md update |
| Auth/session | `src/lib/auth.ts`, `src/middleware.ts`, `src/app/api/auth/*` | unit coverage, `e2e/features/auth.feature`, security review, docs/engineering/authentication.md update |
| Flow | `e2e/features/*.feature` + `e2e/steps/*.ts` | one business-readable scenario per user-facing claim; `bddgen` must pass |
| Docs | `docs/`, `README.md`, `CONTEXT.md`, `AGENTS.md` | changed in the same PR as code when shipped behaviour changes |
| CI/workflow | `.github/workflows/*.yml`, `.husky/*`, skills | validation result, docs update, explicit rollout/skip notes |

## Verification gate

Before a change is marked ready, `verification.md` or the PR body states:

```md
Validation:
- bun run validate — <pass/fail summary>
- bun run test — <pass/fail summary or N/A>
- bun run test:e2e <slice> — <pass/fail summary or N/A>
Docs: <files updated or N/A with reason>
Skipped: <checks skipped and why>
```

A killed or timed-out run is unrun unless it produced a terminal verdict.

## Common rationalizations

| Rationalization | Reality |
|---|---|
| "The screen is small, I'll skip the spec" | The spec is what links scenario, test, docs, and review. |
| "I'll update docs later" | Later leaves shipped behaviour documented in old terms; review blocks it. |
| "CI is green, so e2e is covered" | CI now runs e2e, but the local slice still proves the specific claim during development. |
| "The flow belongs only in integration" | The flow belongs as soon as the user-visible claim exists; pending is a state, not an excuse to omit it. |
| "A docs-only change needs no verification" | It still needs `bun run validate` and a read for internal consistency. |

## Verification

- [ ] The change type matches the surface that owns the behaviour.
- [ ] `flows.md` exists and states what can/cannot be proven end-to-end.
- [ ] Specs cite FR- identifiers from `docs/product/prd.md` and open questions from `docs/product/open-questions.md`.
- [ ] `tasks.md` starts with the flow barrier and ends with docs sync + verification evidence.
- [ ] User-facing scenarios map to `e2e/features/*.feature` or explicitly state why e2e is not needed.
- [ ] `verification.md` records `bun run validate`, relevant `bun run test`, relevant `bun run test:e2e <slice>`, docs changed/N/A, and skipped checks.
