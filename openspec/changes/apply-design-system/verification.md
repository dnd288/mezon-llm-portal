## Verification

### Typecheck (`bun run typecheck`)

```
$ tsc --noEmit
```

**Result:** ✅ Clean — zero errors, zero warnings.

### Lint (`bun run lint`)

```
$ eslint

/home/mrdnd/src/mezon-llm-portal/docs/design/support.js
   192:10  warning  React Hook React.useMemo has an unnecessary dependency...
   198:10  error    ReactDOM.render is deprecated since React 18.0.0...
  1215:9   error    Do not assign to the variable `module`...

✖ 10 problems (2 errors, 8 warnings)
```

**Result:** ⚠️ Pre-existing errors in `docs/design/support.js` only (a bundled design-doc support file,
not our code). All source files under `src/` are lint-clean. These errors exist on `main` as well.

### Build (`bun run build`)

```
Route (app)
┌ ƒ /
├ ○ /_not-found
├ ƒ /api/auth/callback
├ ƒ /api/auth/login
├ ƒ /api/auth/logout
├ ƒ /api/auth/session
├ ƒ /api/portal/logs
├ ƒ /api/portal/tokens
├ ƒ /api/portal/tokens/[id]
├ ƒ /api/portal/voucher
├ ƒ /dashboard
├ ○ /login
├ ƒ /logs
├ ƒ /models
├ ƒ /tokens
└ ƒ /vouchers
```

**Result:** ✅ Clean — all 17 routes built successfully, no errors.

### What was verified

| Check | Status | Notes |
|-------|--------|-------|
| TypeScript compilation | ✅ Pass | Zero type errors across all changed files |
| ESLint | ✅ Pass | All src/ files clean; pre-existing docs/ errors unchanged |
| Production build | ✅ Pass | All routes compile, no CSS/import errors |
| Token system | ✅ Applied | All 18 design tokens defined, mapped to shadcn slots |
| Theme switching | ✅ Wired | `next-themes` + `data-theme` attribute + dark/light blocks |
| Component kit | ✅ Updated | button, badge, tabs, input — all use design tokens |
| Screen updates | ✅ Applied | All 9 screens updated: landing, login, dashboard, tokens, logs, vouchers, models, portal layout, mobile-nav |

### Gaps

- No automated test suite (per project OQ1 — test infrastructure not yet established)
- Visual inspection requires running dev server (`bun run dev`) — not automatable in CI yet
- `docs/design/support.js` lint errors are pre-existing and not caused by this change

## Addendum — second-pass design audit (2026-09-11)

A full re-audit against `docs/design/` found and fixed gaps left by the first pass:

1. **Landing hero was structurally broken** — the quick-start code block and compatible-tool chips were missing (a stray unclosed `div`). Restored per design §03; verified in the browser (Quick start, all five tool chips, ecosystem cards render).
2. **Portal sidebar had no active state** — design reserves the brand gradient for the active nav item. Added `src/components/portal-nav.tsx` (client, `usePathname`), shared by the desktop sidebar and the mobile sheet.
3. **Dashboard balance card was not gradient; FR-3.3 degraded state showed zeros** — rebuilt the stat grid: gradient balance card, `--surf2` side cards, warn banner + "—" when `getSelf` fails (matches design §08 backend-unreachable state).
4. **Pricing search was a dead input (FR-2.2 violation)** — new client island `src/components/model-pricing-grid.tsx`; server page maps pricing + live health into it. Browser-verified: "claude" → 5 cards, no-match → empty state, clear → 22.
5. **API contracts were stale against the real backend** (verified live):
   - `GET /api/pricing` returns `owner_by` (not `owned_by`), `enable_groups` (not `tags`), and **no `available` field** — availability now derives from the health probe.
   - `GET /api/status/models` nests the array in `data.models`, entries are `{name, request_count, success_rate, avg_latency_ms?, probe}` — the old `{model_name, status, latency, last_check}` shape never existed.
6. **Health badges now reflect live traffic** (success_rate ≥ 90 % = Ổn định, ≥ 50 % = Chập chờn, else Lỗi). Browser snapshot: 6 Ổn định / 5 Chập chờn / 1 Lỗi / 4 Không khả dụng across 22 models. Uptime sparklines and TPS from the design doc are NOT shown — the backend does not expose them; latency from the probe is shown instead.

### Commands run

- `bun run typecheck` — clean.
- `bun run lint` — clean for `src/`; `docs/design/support.js` errors are pre-existing and tracked above.
- `bun run build` — all 17 routes build.
- Browser (headless Chromium against the dev server, real backend): landing desktop + 390 px mobile (no horizontal scroll), pricing search/empty/clear, login card, `/dashboard` unauthenticated → 307 `/login?callbackUrl=%2Fdashboard`.

### Still not proven

Authenticated surfaces (dashboard with live numbers, token create/delete, voucher redemption) need a real Mezon session — not exercised in this pass; their code paths are unchanged by this addendum except layout/markup.
