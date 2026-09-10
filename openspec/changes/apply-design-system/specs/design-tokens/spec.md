## ADDED Requirements

### Requirement: Brand gradient tokens

The system SHALL define CSS custom properties `--g1` (#C41FC9 magenta) and `--g2` (#7C3AED violet)
on `:root`, available in both dark and light themes.

*Flow:* Layer-internal — verified by `bun run validate` (typecheck) and visual inspection.

#### Scenario: Gradient tokens resolve in dark theme
- **WHEN** the page loads with no `data-theme` attribute (dark default)
- **THEN** `--g1` resolves to `#C41FC9` and `--g2` resolves to `#7C3AED`

#### Scenario: Gradient tokens resolve in light theme
- **WHEN** `data-theme="light"` is set on `<html>`
- **THEN** `--g1` and `--g2` resolve to the same values (gradient is theme-invariant)

### Requirement: Surface and ink tokens

The system SHALL define surface tokens (`--bg`, `--surf`, `--surfS`, `--surf2`), ink tokens
(`--tx`, `--mut`, `--acc`), and border tokens (`--bd`, `--bdS`) with distinct values for dark
and light themes.

*Flow:* Layer-internal — verified by `bun run build` clean.

#### Scenario: Dark theme surface values
- **WHEN** the page is in dark theme
- **THEN** `--bg` is `#0B0A11`, `--surf` is `#151221` at 80% alpha, `--surf2` is `#1E1A2F`,
  `--tx` is `#F6F4FB`, `--mut` is `#A49EB8`

#### Scenario: Light theme surface values
- **WHEN** `data-theme="light"` is set
- **THEN** `--bg` is `#F7F6FA`, `--surf` is `#FFFFFF`, `--surf2` is `#F2F0F7`,
  `--tx` is `#171123`, `--mut` is `#655E78`

### Requirement: Status color tokens

The system SHALL define `--ok`, `--warn`, `--bad` tokens with dark and light values. Status
communication SHALL always pair color with text — never color alone.

*Flow:* Layer-internal — verified by badge component usage across screens.

#### Scenario: Status tokens in dark theme
- **WHEN** dark theme is active
- **THEN** `--ok` is `#3FD08A`, `--warn` is `#F5B544`, `--bad` is `#FF6B6B`

#### Scenario: Status tokens in light theme
- **WHEN** light theme is active
- **THEN** `--ok` is `#0E9C63`, `--warn` is `#A96A05`, `--bad` is `#D33A3A`

### Requirement: Radius scale

The system SHALL define `--r` (14px for cards/dialogs), `--rs` (10px for buttons/inputs), and
a pill radius (999px for badges/tabs).

*Flow:* Layer-internal — verified by component rendering.

#### Scenario: Radius tokens applied
- **WHEN** a card renders
- **THEN** it uses `border-radius: var(--r)` (14px)

### Requirement: Code surface tokens

The system SHALL define `--code` (background) and `--codeTx` (text) tokens for code blocks.

*Flow:* Layer-internal — verified by code surface component.

#### Scenario: Code block styling
- **WHEN** a code block renders in dark theme
- **THEN** background is `--code` (#0A0912), text is `--codeTx` (#EDEAF6)

### Requirement: Theme switching via next-themes

The system SHALL use `next-themes` ThemeProvider with `attribute="data-theme"` to toggle between
dark (default) and light themes. The provider SHALL be mounted in the root layout.

*Flow:* Layer-internal — verified by ThemeProvider presence in layout.tsx.

#### Scenario: Default dark theme
- **WHEN** the user has not set a preference
- **THEN** the portal renders in dark theme

#### Scenario: Theme toggle persists
- **WHEN** the user switches to light theme
- **THEN** `data-theme="light"` is set on `<html>` and the preference persists via localStorage
