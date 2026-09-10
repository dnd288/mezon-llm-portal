URL: https://raw.githubusercontent.com/dnd288/agent-kit/main/cli/kit/templates/CONTEXT.md
Content-Type: text/plain
Method: text

---

# Context glossary

A glossary keeps people and agents from using the same word for different concepts. Add terms here when a domain word collides with everyday language, another technical domain, a vendor name, or a nearby product concept.

Use this file before inventing names. If two terms feel similar, write the distinction here before encoding it in code.

## How to add an entry

Use this format:

```md
### Term

Definition: One or two sentences defining the term in this project.

Use when: The situations where this term is the correct one.

Do not use for: Similar concepts that need another word.

Related: Links to specs, ADRs, code modules, or external standards.
```

## Example entries

### Account

Definition: A login identity that can authenticate to the product.

Use when: Describing sign-in, sessions, profile settings, and ownership of actions.

Do not use for: A customer organization, billing entity, tenant, or workspace unless the project explicitly treats those as the same concept.

Related: `docs/engineering/authentication.md`, `docs/adr/0001-identity-model.md`

### Workspace

Definition: A shared area where a group collaborates on project resources.

Use when: Describing membership, shared settings, invitations, and resource grouping.

Do not use for: A local package directory in a monorepo. Use "package" or "project workspace" for that if needed.

Related: `docs/product/workspaces.md`

### Theme

Definition: A named set of visual tokens that changes the application's appearance.

Use when: Describing colour, typography, radius, shadow, spacing, and dark/light variants.

Do not use for: A user-selected content style, category, template, or mood.

Related: `docs/engineering/design-system.md`

### Token

Definition: A design-system value or machine-readable credential, depending on context. Always qualify the word when both meanings exist in the project.

Use when: Writing "design token", "access token", "refresh token", or "API token".

Do not use for: An unspecified string with special powers.

Related: `docs/engineering/security.md`, `docs/engineering/design-system.md`

## Common disambiguation patterns

- If a word names both a person and a software component, rename one in code or always qualify it.
- If a word names both a customer concept and an internal implementation detail, reserve the plain word for the customer concept.
- If a vendor uses a term differently from the product, write both definitions and cite the vendor context.
- If a term changed during the project, record the old term as deprecated and point to the replacement.
- If two teams use different names for the same thing, pick the canonical product term and list aliases.
- If a term appears in URLs, database tables, or API fields, document whether it can be renamed and what migration would be required.

## Project terms


### Quota

Definition: Internal billing currency in the new-api backend. 500,000 quota ≈ $1 USD.

Use when: Displaying user balance, token usage costs, voucher amounts.

Do not use for: Rate limits, concurrency caps, or API call counts.

Related: `src/lib/quota.ts`, `src/lib/api.ts`, `docs/product/prd.md` (FR-3, FR-6), `docs/engineering/backend-api.md`

### Token (API Key)

Definition: An API key (prefixed `sk-`) issued to a user for authenticating requests against the LLM gateway.

Use when: Describing API key management — creation, listing, revocation, quota limits.

Do not use for: LLM tokens (input/output text units), JWT session tokens, or OAuth access tokens.

Related: `src/app/(portal)/tokens/`, `src/app/api/portal/tokens/`, `docs/product/prd.md` (FR-4), `docs/engineering/backend-api.md`

### Token (LLM)

Definition: A unit of text processed by a language model, used for billing. Measured as prompt_tokens (input) and completion_tokens (output).

Use when: Displaying usage statistics in logs and dashboard.

Do not use for: API keys or session credentials.

Related: `src/app/(portal)/logs/`, `docs/product/prd.md` (FR-5), `docs/engineering/backend-api.md`

### Voucher / Redemption Code

Definition: A one-time-use code that adds quota to a user's account. Created by admins in the new-api backend.

Use when: The voucher input dialog, voucher history page, or top-up API.

Do not use for: Subscription plans, payment transactions, or affiliate codes.

Related: `src/components/voucher-dialog.tsx`, `src/app/(portal)/vouchers/`, `docs/product/prd.md` (FR-6), `docs/engineering/backend-api.md`

### new-api

Definition: The Go backend (mezon-llm) that this portal communicates with. Provides user management, token management, model routing, usage logging, and billing.

Use when: Referring to the backend API, its endpoints, or its data model.

Do not use for: This Next.js portal application itself.

Related: `~/src/mezon-llm`, `src/lib/api.ts`, `docs/engineering/architecture.md`, `docs/engineering/backend-api.md`

### Channel

Definition: An upstream AI provider connection in new-api (e.g. OpenAI, Anthropic, Google). Not visible to portal users.

Use when: Backend context only. Portal users see "models" not "channels".

Do not use for: A chat room, communication channel, or Discord channel.

### Session

Definition: A JWT stored in an httpOnly cookie (`session`) after Mezon OAuth login. Contains userId, accessToken, username, mezonUserId.

Use when: Authentication flow, middleware guards, API route authorization.

Do not use for: Browser sessionStorage, OAuth session state, or new-api login sessions.

Related: `src/lib/auth.ts`, `src/middleware.ts`, `docs/product/prd.md` (FR-1, FR-7), `docs/engineering/authentication.md`