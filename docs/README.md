# Documentation index

| Document | Owns |
|---|---|
| [`product/prd.md`](product/prd.md) | Product requirements — features, users, FR- identifiers, scope, non-goals |
| [`product/open-questions.md`](product/open-questions.md) | Unresolved questions that block or shape upcoming changes |
| [`engineering/architecture.md`](engineering/architecture.md) | System topology, data flow, boundaries, layering rules |
| [`engineering/authentication.md`](engineering/authentication.md) | OAuth flow, session model, route protection, user sync |
| [`engineering/backend-api.md`](engineering/backend-api.md) | new-api endpoints consumed by the portal, response shapes |
| [`engineering/testing.md`](engineering/testing.md) | Test modes, validation commands, what CI proves |
| [`../e2e/README.md`](../e2e/README.md) | E2E runbook — slices, mock backend, FR→feature mapping |
| [`design/README.md`](design/README.md) | Design system — tokens, component kit, screen inventory, brand assets |
| [`adr/`](adr/) | Architecture decision records, numbered |

Root-level context:

- [`../README.md`](../README.md) — overview, setup, commands
- [`../CONTEXT.md`](../CONTEXT.md) — glossary of project terms
- [`../AGENTS.md`](../AGENTS.md) — rules and boundaries for coding agents
- [`../CONTRIBUTING.md`](../CONTRIBUTING.md) — contribution workflow
- [`../openspec/`](../openspec/) — change specifications and schemas

Rules for this folder:

- A document here describes **shipped** behavior or an owned decision. Planned work lives in `openspec/changes/` until archived.
- If a doc and the code disagree, the code is right and the doc is stale — fix the doc in the same change.
- Requirement identifiers (`FR-x.y`) are minted only in `product/prd.md`; changes cite them, never invent them.
