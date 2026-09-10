## Flows

This change is a visual reskin of existing screens — no new routes, no new user flows, no new
API calls. The observable behavior (navigation, data display, forms, dialogs) does not change;
only the visual appearance aligns with the design document.

**This change is not user-visible in a functional sense** — it changes appearance, not behavior.
There is no end-to-end feature file to write. The proof is:

1. `bun run validate` — typecheck + lint pass, confirming the token wiring compiles.
2. `bun run build` — production build clean, confirming no runtime CSS errors.
3. Visual inspection — each screen matches `docs/design/README.md` token table in both dark
   and light themes.

## What this change cannot prove end to end

- **No test suite exists** (OQ1). Visual correctness is verified by inspection against the
  design document, not by automated tests.
- **No Playwright / component tests** to capture regressions. A visual snapshot test would be
  the ideal pin, but is out of scope for this change.
- **Responsive behavior at all viewports** — verified by manual browser resize; no automated
  viewport matrix test.
- **Theme persistence across sessions** — `next-themes` handles this via localStorage; no
  integration test covers it.
