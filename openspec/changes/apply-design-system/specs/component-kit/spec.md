## ADDED Requirements

### Requirement: Primary button with brand gradient

The primary button variant SHALL render white text on a linear gradient from `--g1` to `--g2`,
with a glow box-shadow. Font weight 600 at 13.5px.

*Flow:* Layer-internal — verified by visual inspection of "Tạo Key Mới" button.

#### Scenario: Primary button appearance
- **WHEN** a primary Button renders
- **THEN** it has a gradient background from `--g1` to `--g2`, white text, and a glow shadow

#### Scenario: Primary button disabled state
- **WHEN** a primary Button is disabled
- **THEN** it renders at 55% opacity with no pointer events

### Requirement: Secondary button

The secondary button variant SHALL render on `--surf2` background with `--bdS` border.

*Flow:* Layer-internal — verified by visual inspection.

#### Scenario: Secondary button appearance
- **WHEN** a secondary Button renders
- **THEN** it has `--surf2` background, `--bdS` border, and foreground text

### Requirement: Ghost button

The ghost button SHALL render with muted text, no border, hover transitions to foreground color.

*Flow:* Layer-internal — verified by "Hủy" button inspection.

#### Scenario: Ghost button appearance
- **WHEN** a ghost Button renders
- **THEN** it has no background, no border, and muted text color

### Requirement: Destructive button

The destructive button SHALL render with `--bad` text and `--bad` border.

*Flow:* Layer-internal — verified by "Thu hồi" button inspection.

#### Scenario: Destructive button appearance
- **WHEN** a destructive Button renders
- **THEN** it has `--bad` colored text and border

### Requirement: Status-tinted badges via color-mix

Badge variants (active, expired, revoked) SHALL use `color-mix(in oklab, <status> 14%, transparent)`
for background and `color-mix(in oklab, <status> 34%, transparent)` for border. Brand badge uses
full gradient background with white text.

*Flow:* Layer-internal — verified by token status badges on API keys page.

#### Scenario: Active badge
- **WHEN** a badge with variant "active" renders
- **THEN** it uses `--ok` tinted at 14% for background and 34% for border

#### Scenario: Brand badge
- **WHEN** a badge with variant "brand" renders
- **THEN** it uses the `--g1` to `--g2` gradient background with white text

### Requirement: Pill-style tabs

Tabs SHALL render in a `--surf2` container with 4px padding and pill border-radius. The active
tab SHALL use brand gradient background with white text at weight 600. Inactive tabs use muted
text at weight 500.

*Flow:* Layer-internal — verified by dashboard setup tabs.

#### Scenario: Tab container
- **WHEN** a TabsList renders
- **THEN** it has `--surf2` background, pill radius, and 4px padding

#### Scenario: Active tab
- **WHEN** a tab is selected
- **THEN** it has brand gradient background and white text

### Requirement: Input focus glow

Inputs SHALL have `--bg` background, `--bdS` border, and `--rs` radius. On focus, border color
changes to `--g2` with a `0 0 0 3px rgba(124,58,237,.22)` box-shadow.

*Flow:* Layer-internal — verified by create-token dialog input.

#### Scenario: Input focus state
- **WHEN** an input receives focus
- **THEN** border becomes `--g2` and a violet glow shadow appears

### Requirement: Code surface component

Code blocks SHALL use `--code` background, `rgba(255,255,255,.07)` border, macOS-style traffic
light dots at top, and `--codeTx` text in Geist Mono 12.5px with 1.85 line-height.

*Flow:* Layer-internal — verified by landing page code block.

#### Scenario: Code surface rendering
- **WHEN** a code surface renders
- **THEN** it has dark background, traffic light dots, and monospace font
