# Design System Updates — 2026-08-26

Approved design for token remaps, text roles, component API tweaks, and new verification / rolling-money / menu-search pieces.

## Tokens

### Error palette
- Add `--ui-color-error-primary: #EA3F3F` and `--ui-color-error-secondary: #FF5858` on `:root`/`.light` only (no `.dark` yet).
- Do **not** reintroduce `--ui-color-danger*` (already removed).
- Fallout:
  - Input / trigger error borders → `error-primary`
  - `--ui-color-trigger-border-error-focus` → `var(--ui-color-error-primary)`
  - Error toast background → `error-secondary`
  - `DS_COLOR_TOKENS.danger` → `var(--ui-color-error-primary)` (or add `error-primary` / `error-secondary` keys)

### Disabled aliases
Keep existing names; retarget defaults:
- `--ui-color-primary-disabled` → `var(--ui-color-secondary-disabled)`
- `--ui-color-primary-border-disabled` → `var(--ui-color-secondary-border-disabled)`
Wire primary (and icon) button disabled classes to paint these tokens. Secondary already uses secondary-disabled. Danger button disabled uses the same secondary-disabled family.

### Danger button (no danger tokens)
`ButtonVariant.danger` classes map directly:
- default: secondary bg/border, `text-error-primary`
- hover: error-secondary bg/border, secondary foreground
- active: error-primary bg/border, secondary foreground
- disabled: secondary disabled

### Text size tokens
- `--ui-text-heading: 20px` (was 18)
- `--ui-text-title: 40px` (was 23)
- `--ui-text-hero: 55px` (was 36)
- Add `--ui-text-subheading: 18px` (heading font family + heading weight/axes)
- Verification digits: `BaseText` at 18px / medium / body role — **not** SubheadingText

Run `npm run sync-tokens` after token edits.

## Text roles
- Add `TextVariant.subheading`, `SubheadingText`, `text-style-subheading` (same font stack as heading, 18px).
- Verification digit glyphs use `BaseText` at `fontSize={18}` + `FontWeights.medium` with default (body) role — **not** `SubheadingText`, even though both are 18px.

## Deletions / story cleanup
- Icon button stories: remove brand rows; keep `ButtonVariant.brand` in API.
- `ShapeButtons`: remove `pentagon`; leave `PentagonShape` in `Shapes/`. Type ShapeButton `shape` off `ShapeButtons`.

## Checkbox
- Disabled unchecked: secondary disabled (existing).
- Disabled checked/indeterminate: primary-disabled bg/border; indicator opacity via `--ui-opacity-disabled`.

## Dropdown menu
- `DropdownMenuItemVariant = { default, danger }` on `DropdownMenuItem`.
- Danger: ghost surfaces; rest content = ghost; hover content `error-secondary`; active/highlighted content `error-primary`.
- New `DropdownMenuSearch` (Figma 11:1296): slim row — search icon, input, optional Esc hotkey. Not baked into complex content; compose optionally. Stories for complex with/without search.

## RollingMoneyText
Superseded in full by `2026-08-26-rolling-money-text-design.md`. Summary: a
transition-driven 0–9 digit wheel keyed by place value, `smallCents` +
`smallCentsComponent` enforced by a discriminated union, stagger off by default.

## Verification code
- `CodeDigitInput` — 46px, `rounded-tight`; states empty/filled/focused/error/disabled.
- `VerificationCodeInput` — `length` default 6; `value` / `defaultValue` / `onChange`; `hasError`; `disabled`. Paste, arrows, backspace. Error paints all cells error-primary.
- Digits via `BaseText` (18 / medium / body). Pre-rolled section = story only.

## Linear progress
Animate fill on value change (`@property` on `--progress-pct` or equivalent).

## Stories + frontmatter
Update/add stories for every change. Markdown-style frontmatter block comments on new/meaningfully touched components.
