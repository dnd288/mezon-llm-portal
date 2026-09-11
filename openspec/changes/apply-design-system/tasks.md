## 1. Foundations — Token System + Theme Provider

- [x] 1.1 Rewrite `src/app/globals.css`: replace stock shadcn oklch tokens with design-doc palette.
  Define `--g1`, `--g2`, `--bg`, `--surf`, `--surfS`, `--surf2`, `--bd`, `--bdS`, `--tx`, `--mut`,
  `--acc`, `--code`, `--codeTx`, `--ok`, `--warn`, `--bad`, `--r`, `--rs` on `:root` (dark).
  Add `[data-theme="light"]` block with light values. Map design tokens to shadcn semantic slots
  (`--background`, `--foreground`, `--primary`, `--card`, `--muted`, `--border`, `--destructive`,
  `--ring`, `--input`, `--accent`, `--popover`, `--secondary`). Update `@custom-variant dark` to
  `&:is([data-theme="dark"] *)`. Update `@theme inline` radius scale.
  **Skill:** `mlp-design`. **Proves:** `bun run validate` passes.

- [x] 1.2 Wire `next-themes` ThemeProvider in `src/app/layout.tsx`: wrap children with
  `<ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem>`. Add
  `suppressHydrationWarning` on `<html>`.
  **Skill:** `mlp-design`. **Proves:** `bun run validate` passes, theme toggle works.

## 2. Component Kit — shadcn Overrides

- [x] 2.1 Update `src/components/ui/button.tsx`: primary variant uses brand gradient bg + white
  text + glow shadow. Secondary uses `--surf2` + `--bdS`. Ghost uses transparent + muted text.
  Destructive uses `--bad` text + border. Disabled state at 55% opacity.
  **Skill:** `mlp-component-development`. **Proves:** `bun run validate` passes.

- [x] 2.2 Update `src/components/ui/badge.tsx`: add active/expired/revoked/brand variants using
  `color-mix(in oklab)` tint formula (14% bg, 34% border). Brand variant uses gradient bg +
  white text.
  **Skill:** `mlp-component-development`. **Proves:** `bun run validate` passes.

- [x] 2.3 Update `src/components/ui/tabs.tsx`: pill-style container with `--surf2` bg, 4px padding,
  pill radius. Active tab: gradient bg + white text + 600 weight. Inactive: muted text + 500 weight.
  **Skill:** `mlp-component-development`. **Proves:** `bun run validate` passes.

- [x] 2.4 Update `src/components/ui/input.tsx`: `--bg` background, `--bdS` border, `--rs` radius.
  Focus state: `border-color: var(--g2)` + `box-shadow: 0 0 0 3px rgba(124,58,237,.22)`.
  **Skill:** `mlp-component-development`. **Proves:** `bun run validate` passes.

- [x] 2.5 Create or update code surface component for landing page: `--code` bg,
  `rgba(255,255,255,.07)` border, macOS traffic light dots, `--codeTx` text, Geist Mono
  12.5px/1.85.
  **Skill:** `mlp-component-development`. **Proves:** `bun run validate` passes.

## 3. Screen Updates — Apply Tokens

- [x] 3.1 Update `src/app/page.tsx` (landing): hero with gradient accent, advisory with `--warn`
  tint, quick-start code surface, ecosystem section. Replace all hardcoded colors.
  **Skill:** `mlp-ui-development`. **Proves:** `bun run validate` passes.

- [x] 3.2 Update `src/app/login/page.tsx`: brand identity, styled login button, error states.
  **Skill:** `mlp-ui-development`. **Proves:** `bun run validate` passes.

- [x] 3.3 Update `src/app/(portal)/dashboard/page.tsx`: sidebar surface, balance card on gradient,
  stat cards on `--surf`, setup tabs as pill style.
  **Skill:** `mlp-ui-development`. **Proves:** `bun run validate` passes.

- [x] 3.4 Update `src/app/(portal)/tokens/page.tsx` + `src/components/create-token-dialog.tsx` +
  `src/components/delete-token-button.tsx`: table with design tokens, status badges, dialog styling.
  **Skill:** `mlp-ui-development`. **Proves:** `bun run validate` passes.

- [x] 3.5 Update `src/app/(portal)/logs/page.tsx`: table styling with `--surf`, `--surf2` headers,
  `--bd` borders.
  **Skill:** `mlp-ui-development`. **Proves:** `bun run validate` passes.

- [x] 3.6 Update `src/app/(portal)/vouchers/page.tsx` + `src/components/voucher-dialog.tsx`: table
  + voucher input dialog with design tokens.
  **Skill:** `mlp-ui-development`. **Proves:** `bun run validate` passes.

- [x] 3.7 Update `src/app/models/page.tsx`: model cards with provider icon badge, health status
  badge, pricing display, `--surf` cards.
  **Skill:** `mlp-ui-development`. **Proves:** `bun run validate` passes.

- [x] 3.8 Update `src/components/mobile-nav.tsx`: hamburger overlay, mobile radius (16px), stacked
  card layout.
  **Skill:** `mlp-ui-development`. **Proves:** `bun run validate` passes.

## 4. Verification

- [x] 4.1 Run `bun run validate` — typecheck + lint clean.
  **Proves:** static analysis green.

- [x] 4.2 Run `bun run build` — production build clean.
  **Proves:** no runtime CSS or import errors.

- [x] 4.3 Record results in `verification.md`.
