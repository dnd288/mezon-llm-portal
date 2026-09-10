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
| Display | Geist 26px / 700 / −0.02em | Page headings |
| Heading | Geist 17px / 600 | Section titles |
| Body | Geist 14px / 400 | Default text |
| Mono | Geist Mono 13px / 500 | Key IDs, quota numbers, code snippets |
| Label | Geist 12px / 600 / 0.1em / uppercase | Table headers, category labels |

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
| 02 | Component kit | — | shadcn components, `src/components/` |
| 03 | Landing | FR-2.1 | `src/app/page.tsx` |
| 04 | Dashboard | FR-3.1 – FR-3.3 | `src/app/(portal)/dashboard/page.tsx`, `src/components/voucher-dialog.tsx` |
| 05 | API Keys + create dialog | FR-4.1 – FR-4.3 | `src/app/(portal)/tokens/page.tsx`, `src/components/create-token-dialog.tsx` |
| 06 | Usage logs + Voucher history | FR-5, FR-6 | `src/app/(portal)/logs/page.tsx`, `src/app/(portal)/vouchers/page.tsx` |
| 07 | Pricing / Models | FR-2.2 | `src/app/models/page.tsx` |
| 08 | Login + empty/error states | FR-1.1 | `src/app/login/page.tsx` |
| 09 | Mobile layouts | NFR-3 | `src/components/mobile-nav.tsx` |

## Key design decisions

### Dark-first, light-aware

The design is authored dark-first. Light mode redefines only the token values — no structural or layout changes. Both themes share the same gradient, the same tint formula for badges, and the same status semantics.

### Bilingual copy

Primary copy is Vietnamese; technical labels (model IDs, HTTP methods, field names) stay in English. Screen titles use both: "Nền tảng · Foundations", "Lịch sử sử dụng & Voucher".

### Gradient discipline

The brand gradient appears in exactly five places: primary CTA, balance card, active navigation item, brand badge, and focus rings. Everything else uses neutral surfaces. This preserves signal value — the gradient means "this is actionable or important."

### Usage advisory

The landing page carries a mandatory usage advisory warning users that this is a cost-optimized proxy, not a production service. The advisory uses `--warn` styling (amber border, tint background).

### Pricing card enrichment

Each model pricing card shows:
- Provider icon badge (letter + provider color)
- Model ID in monospace
- Health status badge (Ổn định / Chập chờn / Lỗi)
- Input and output price in mzđ / 1M tokens
- Access group (e.g., "default")
- 24h uptime sparkline, latency, and TPS

### Graceful degradation (FR-3.3)

When the backend is unreachable, the dashboard degrades to:
- Warning banner in `--warn` tint
- Stat cards show "—" instead of numbers
- Skeleton pulse animation for content areas
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
