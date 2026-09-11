## ADDED Requirements

### Requirement: All screens consume design tokens

Every screen SHALL use design-doc CSS custom properties instead of hardcoded Tailwind color
utilities. No `bg-gray-*`, `text-gray-*`, `border-gray-*` or oklch values outside `globals.css`.

*Flow:* Layer-internal — verified by `bun run validate` + `bun run build`.

#### Scenario: No hardcoded color utilities in screens
- **WHEN** a screen file is reviewed
- **THEN** colors reference design tokens (`--bg`, `--surf`, `--tx`, etc.) through CSS classes
  or Tailwind utilities mapped to those tokens

### Requirement: Landing page matches design section 03

The landing page SHALL render hero with brand gradient accent, usage advisory with `--warn` tint,
quick-start code surface, and ecosystem section.

*Flow:* Layer-internal — verified by visual comparison with design document section 03.

#### Scenario: Landing page brand identity
- **WHEN** the landing page loads
- **THEN** it shows Mezon branding with gradient accent, advisory warning, and code block with
  traffic lights

### Requirement: Dashboard matches design section 04

The dashboard SHALL render a sidebar (236px), balance card on brand gradient, stat cards on
`--surf` surface, and setup tabs in pill style.

*Flow:* Layer-internal — verified by visual comparison with design document section 04.

#### Scenario: Balance card gradient
- **WHEN** the dashboard loads
- **THEN** the balance card has `--g1` to `--g2` gradient background

#### Scenario: Stat cards surface
- **WHEN** stat cards render
- **THEN** they use `--surf` background with `--bd` border

### Requirement: API keys page matches design section 05

The API keys page SHALL render a table with 6 columns, status badges using tint formula, and
a 2-step create dialog.

*Flow:* Layer-internal — verified by visual comparison with design document section 05.

#### Scenario: Token status badges
- **WHEN** a token row renders
- **THEN** its status badge uses the correct tint variant (active/expired/revoked)

### Requirement: Logs and vouchers match design section 06

Usage logs and voucher history SHALL render tables on `--surf` surface with `--bd` borders.
Voucher input dialog uses design-doc input styling.

*Flow:* Layer-internal — verified by visual comparison with design document section 06.

#### Scenario: Table styling
- **WHEN** the logs or vouchers table renders
- **THEN** it uses `--surf` background, `--surf2` headers, and `--bd` borders

### Requirement: Pricing page matches design section 07

Model pricing cards SHALL show provider icon badge, model ID in monospace, health status badge,
input/output price, access group, and (where data exists) uptime sparkline, latency, and TPS.

*Flow:* Layer-internal — verified by visual comparison with design document section 07.

#### Scenario: Model card enrichment
- **WHEN** a model card renders
- **THEN** it shows provider badge, health status, and pricing in mzđ / 1M tokens

### Requirement: Login page matches design section 08

The login page SHALL show Mezon brand identity, login button, and graceful error states using
`--warn` tint for warning banners and `--bad` tint for errors.

*Flow:* Layer-internal — verified by visual comparison with design document section 08.

#### Scenario: Login brand identity
- **WHEN** the login page loads
- **THEN** it shows Mezon logo, brand colors, and styled login button

### Requirement: Mobile layouts match design section 09

On mobile viewports, the sidebar SHALL collapse to a hamburger overlay. Cards stack single-column.
Mobile card radius increases to 16px. Balance card and stat grid go full-width.

*Flow:* Layer-internal — verified by browser resize to 375px width.

#### Scenario: Mobile sidebar
- **WHEN** viewport is below the mobile breakpoint
- **THEN** sidebar is hidden and hamburger menu is available

#### Scenario: Mobile card stacking
- **WHEN** viewport is mobile
- **THEN** cards stack vertically at full width with 16px border-radius
