# Open questions

Unresolved questions that block or shape upcoming changes. A change proposal must name every question it is gated by (`openspec/config.yaml` proposal rule). Add owners and severities when known; close questions by moving them to the resolved section with a sentence of outcome.

Numbering: `OQ1`, `OQ2`, … never reused.

## Open

| # | Question | Blocks | Severity | Owner |
|---|---|---|---|---|
| OQ1 | Should the portal adopt a test stack (unit + browser/e2e) now, or defer until the first behavioral change demands it? Baseline shipped with `bun run validate` only. | Any change claiming user-visible behavior is proven | high | maintainer |
| OQ2 | Is Phase 2 scope (usage charts, per-key stats, email notifications, English UI) committed? Nothing may cite "Phase 2" as a reason until this is answered. | Roadmap changes | medium | maintainer |
| OQ3 | Voucher UX: when a code fails, is the backend message surfaced as-is acceptable, or should the portal map known failures (used, expired, not found) to friendly copy? | Voucher-related changes | low | maintainer |
| OQ4 | Should the OAuth `state` cookie check be hardened (session-bound state, timing-safe compare) before any security-sensitive feature lands on top of it? | Features extending the auth flow | medium | maintainer |

## Resolved

(none yet)
