## Why

The portal's 9 screens are functional but wear stock shadcn/ui defaults — grayscale oklch tokens,
generic radii, no brand identity. The design document (`docs/design/README.md` + the interactive
Design Component HTML) defines a complete visual identity: dark-first brand gradient, custom token
system, component kit, and per-screen specifications. None of it is implemented. Applying the
design system now brings the portal from "works" to "looks like a product" before any Phase 2
features land.

## What Changes

- **Replace the entire CSS token system** in `globals.css`: swap shadcn's oklch neutrals for the
  design-doc palette (`--g1`/`--g2` gradient, `--bg`/`--surf`/`--surf2` surfaces, `--tx`/`--mut`
  ink, `--bd`/`--bdS` borders, `--acc` accent, `--ok`/`--warn`/`--bad` status, `--code`/`--codeTx`,
  `--r`/`--rs` radii). Both dark (default) and light themes via `data-theme` attribute.
- **Wire dark/light theme switching** via `next-themes` ThemeProvider with `data-theme` attribute
  on `<html>`.
- **Customize shadcn/ui components** to match the design kit: primary button with brand gradient +
  glow shadow, secondary with `--surf2` + `--bdS`, ghost, destructive with `--bad`, disabled at
  55% opacity. Badge tint via `color-mix(in oklab)`. Pill-style tabs. Input focus with `--g2` +
  violet glow. Code surface with `--code` bg + traffic lights.
- **Update all 9 screens** to use design tokens instead of hardcoded Tailwind utilities.
- **Apply typography scale** (Display 26px/700, Heading 17px/600, Body 14px/400, Mono 13px/500,
  Label 12px/600/uppercase) — Geist fonts are already loaded.

## Capabilities

### New Capabilities
- `design-tokens`: CSS custom property system — brand gradient, surface/ink/border/status palette,
  radius scale, typography tokens, dark/light theme definitions, and `next-themes` ThemeProvider
  wiring.
- `component-kit`: Customized shadcn/ui variants — gradient primary button, status-tinted badges
  via `color-mix`, pill tabs, styled inputs with violet focus glow, code surface with traffic lights.
- `screen-design`: All 9 screens updated to consume design tokens — landing, dashboard, API keys,
  logs, vouchers, pricing/models, login, and mobile layouts.

### Modified Capabilities
_(none — no existing specs)_

## Impact

- `src/app/globals.css` — full rewrite of custom properties
- `src/app/layout.tsx` — add ThemeProvider, dark-mode attribute wiring
- `src/components/ui/button.tsx` — gradient primary, destructive, disabled variants
- `src/components/ui/badge.tsx` — status tint formula
- `src/components/ui/tabs.tsx` — pill style
- `src/components/ui/input.tsx` — focus glow
- `src/app/page.tsx` — landing page tokens
- `src/app/(portal)/dashboard/page.tsx` — balance card gradient, stat cards, sidebar
- `src/app/(portal)/tokens/page.tsx` — table styling, dialog
- `src/app/(portal)/logs/page.tsx` — table styling
- `src/app/(portal)/vouchers/page.tsx` — table styling, voucher dialog
- `src/app/models/page.tsx` — model cards with provider badges, health, sparklines
- `src/app/login/page.tsx` — brand identity
- `src/components/mobile-nav.tsx` — hamburger overlay, 16px mobile radius
- No new dependencies beyond `next-themes` (already installed).
- No backend / API changes.
- No new routes.
