# Design system — Mezon LLM Portal

Status: shipped v1 (baseline, covers all Phase 1 screens).

Source of truth: [`Mezon LLM Portal.dc.html`](./Mezon%20LLM%20Portal.dc.html) — an interactive design component covering foundations, component kit, and every portal screen in both dark and light themes. Open it in a browser or a Design Component viewer to browse.

## Visual identity

The portal's identity extends Mezon's brand palette into a dark-first, developer-tool aesthetic.

### Brand gradient

| Token | Value | Role |
|---|---|---|
| `--g1` (magenta) | `#C41FC9` | Gradient start — primary buttons, active nav, balance card |
| `--g2` (violet) | `#7C3AED` | Gradient end — same surfaces, focus rings |

Usage rule: gradient is reserved for **primary actions, balance display, active navigation, and logo accent**. All other surfaces are neutral. Overusing the gradient dilutes its signaling power.

### Surfaces and ink

| Token | Dark | Light | Role |
|---|---|---|---|
| `--bg` | `#0B0A11` | `#F7F6FA` | Page background |
| `--surf` | `#151221` (80% α) | `#FFFFFF` | Card / elevated surface |
| `--surfS` | `#151221` | `#FFFFFF` | Card (solid, no transparency) |
| `--surf2` | `#1E1A2F` | `#F2F0F7` | Muted surface — table headers, sidebar, secondary cards |
| `--bd` | `rgba(255,255,255,.10)` | `rgba(22,14,40,.11)` | Default border |
| `--bdS` | `rgba(255,255,255,.16)` | `rgba(22,14,40,.18)` | Strong border — inputs, interactive edges |
| `--tx` | `#F6F4FB` | `#171123` | Primary text |
| `--mut` | `#A49EB8` | `#655E78` | Muted text — labels, secondary copy |
| `--acc` | `#D9A0FF` | `#8A1DB8` | Accent text — links, brand subtitle |
| `--code` | `#0A0912` | `#12101C` | Code block background |
| `--codeTx` | `#EDEAF6` | `#EDEAF6` | Code text |
| `--shadow` | heavy | subtle | Card elevation |

### Status colors

| Token | Dark | Light | Semantics |
|---|---|---|---|
| `--ok` | `#3FD08A` | `#0E9C63` | Active, success, stable health |
| `--warn` | `#F5B544` | `#A96A05` | Expired, processing, degraded health |
| `--bad` | `#FF6B6B` | `#D33A3A` | Revoked, failure, error health |

Accessibility rule: status is always communicated with **text alongside color** — never color alone.

### Typography

| Style | Spec | Use |
|---|---|---|
| Display | Geist 22px / 700 / −0.015em | Dashboard greeting only |
| Heading | Geist 17px / 700 | Page titles, section headings |
| Body | Geist 14px / 400 | Default text |
| Caption | Geist 13px / 400 | Page subtitles, descriptions |
| Mono | Geist Mono 13px / 500 | Key IDs, quota numbers, code snippets |
| Label | Geist 12px / 600 / 0.1em / uppercase | Table headers, category labels |

### Page layout

All portal pages share a consistent structure via the `(portal)/layout.tsx` shell (sidebar + header + main area). Individual pages follow this pattern:

| Element | Convention | Component |
|---|---|---|
| Root wrapper | `<div className="flex flex-col gap-6">` | — |
| Page header | Title (17px/700) + optional subtitle (13px muted) + optional action slot | `<PageHeader>` |
| Content area | Tables, cards, or custom content directly — no extra Card wrapper for the page body | — |
| Empty state | Centered text with icon, `rounded-[var(--rs)] border border-[var(--bd)]` container | — |

The `<PageHeader>` component (`src/components/page-header.tsx`) enforces the shared title pattern:

```tsx
<PageHeader title="API Keys" subtitle="Quản lý các API key.">
  <CreateTokenDialog />   {/* action slot, right-aligned */}
</PageHeader>
```

**Dashboard exception:** The dashboard uses a personalized greeting at 22px instead of `PageHeader`. This is the only page with a display-size heading.

**Layout provides padding:** `<main>` in the portal layout already applies `p-4 md:p-6`. Pages must not add their own padding.

### Radius

| Token | Value | Use |
|---|---|---|
| `--r` | `14px` | Cards, dialogs, panels |
| `--rs` | `10px` | Buttons, inputs, badges, code blocks |
| pill | `999px` | Badges, tab chips, search inputs |

## Component kit

The design defines the following reusable patterns. Implementation uses shadcn/ui v5 components mapped to these styles.

### Buttons

| Variant | Appearance | Example |
|---|---|---|
| Primary | White text on brand gradient, glow shadow | "Tạo Key Mới" |
| Secondary | Text on `--surf2` with `--bdS` border | "Nhập Voucher" |
| Ghost | Muted text, no border, hover → foreground | "Hủy" |
| Destructive | `--bad` text with `--bad` border | "Thu hồi" |
| Disabled | 55% opacity, no pointer events | "Đang tạo…" |

### Badges

| Variant | Style |
|---|---|
| Active | `--ok` tint background + border |
| Expired | `--warn` tint background + border |
| Revoked | `--bad` tint background + border |
| Default | `--surf2` background, `--bd` border |
| Brand | Brand gradient background, white text |

Tint formula: `color-mix(in oklab, <status> 14%, transparent)` for background, `34%` for border.

### Inputs

- Background: `--bg`, border: `--bdS`, radius: `--rs`
- Focus state: `border-color: var(--g2)`, box-shadow: `0 0 0 3px rgba(124,58,237,.22)`
- Helper text below in 11.5px muted

### Tabs (pill style)

- Container: `--surf2` with 4px padding, pill radius
- Active tab: brand gradient background, white text, 600 weight
- Inactive tab: muted text, 500 weight

### Code surface

- Background: `--code`, border: `rgba(255,255,255,.07)`
- macOS-style traffic light dots at top
- Text: `--codeTx`, Geist Mono 12.5px/1.85

## Screen inventory

Each section in the design document maps to a screen or screen state. FR identifiers reference [`product/prd.md`](../product/prd.md).

| # | Section | FR | Repo files |
|---|---|---|---|
| 01 | Foundations | — | `src/app/globals.css`, `src/app/layout.tsx` |
| 02 | Component kit | — | shadcn components, `src/components/page-header.tsx`, `src/components/usage-stats.tsx` |
| 03 | Landing | FR-2.1 | `src/app/page.tsx` |
| 04 | Dashboard | FR-3.1 – FR-3.3 | `src/app/(portal)/dashboard/page.tsx`, `src/components/voucher-dialog.tsx`, `src/components/usage-stats.tsx` |
| 05 | API Keys + create dialog | FR-4.1 – FR-4.3 | `src/app/(portal)/tokens/page.tsx`, `src/components/create-token-dialog.tsx` |
| 06 | Usage logs | FR-5 | `src/app/(portal)/logs/page.tsx` |
| 06b | Voucher / top-up history | FR-6 | `src/app/(portal)/vouchers/page.tsx` |
| 07 | Pricing / Models | FR-2.2 | `src/app/models/page.tsx` |
| 08 | Login + empty/error states | FR-1.1 | `src/app/login/page.tsx` |
| 09 | Mobile layouts | NFR-3 | `src/components/mobile-nav.tsx` |

## Key design decisions

### Dark-first, light-aware

The design is authored dark-first. Light mode redefines only the token values — no structural or layout changes. Both themes share the same gradient, the same tint formula for badges, and the same status semantics.

### Bilingual copy

Primary UI copy is Vietnamese; technical labels (model IDs, HTTP methods, field names) stay in English. Some public/design document headings use bilingual labels for orientation, but shipped app screens should prefer concise Vietnamese titles.

### Gradient discipline

The brand gradient appears in exactly five places: primary CTA, balance card, active navigation item, brand badge, and focus rings. Everything else uses neutral surfaces. This preserves signal value — the gradient means "this is actionable or important."

### Usage advisory

The landing page carries a mandatory usage advisory warning users that this is a cost-optimized proxy, not a production service. The advisory uses `--warn` styling (amber border, tint background).

### Pricing card enrichment

Each model pricing card shows:
- Provider icon badge (letter badge, brand accent)
- Model ID in monospace, with a copy button
- Health status badge (Ổn định / Chập chờn / Lỗi), derived from the gateway's live success rate; "Không khả dụng" when the probe reports the model down
- Input and output price in mzđ / 1M tokens
- Access group (first enabled group, e.g. "default")
- Measured latency from the health probe and performance metrics. Uptime sparklines are rendered from the performance-metrics endpoint's `recent_success_series` when available; empty buckets show neutral dots.

### Graceful degradation (FR-3.3)

When the backend is unreachable, the dashboard degrades to:
- Warning banner in `--warn` tint
- Stat cards show "—" instead of numbers
- Page remains navigable

## Brand assets

The `public/` directory contains Mezon brand SVGs imported into the design:

| File | Use |
|---|---|
| `mezon-logo-icon.svg` | Compact logo — sidebar, mobile nav, login, favicon |
| `mezon-logo-horizontal.svg` | Horizontal lockup — header contexts |
| `mezon-logo-full.svg` | Full lockup — marketing contexts |
| `mezon-brand.svg` | "Mezon" wordmark — login button |

## Next steps (design-only, not committed)

Noted at the bottom of the design document — these are candidates, not requirements:

- Usage chart (per-day) on dashboard
- Individual key detail page
- Model comparison view on pricing page
- Low-quota warning (< 10% remaining)
