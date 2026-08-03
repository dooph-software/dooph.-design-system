---
name: dooph-ds-codebase
description: Use when working inside the @dooph-software/design-system repo and you need to find something or confirm how it currently works — where a file lives, whether a component or token already exists, which CSS layer a class sits in, or how the build emits its assets. Pair with dooph-ds-architecture, which holds the rules that govern changes.
---

# dooph Design System — Codebase Map

Package: `@dooph-software/design-system`
Build: tsup (ESM + CJS + `.d.ts`); tsup `onSuccess` emits `dist/styles.css` (Tailwind CLI) and copies `dist/theme.css` (the consumer Tailwind preset)
React peerDep: `>=19`
Tailwind: v4 with `@theme inline`
Package exports: `.` (JS), `./styles.css` (compiled), `./theme.css` (raw `@theme` preset for consumer Tailwind builds)
Radix deps (`dependencies`, not devDependencies): `@radix-ui/react-checkbox`, `@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-progress`, `@radix-ui/react-slider`, `@radix-ui/react-slot`, `@radix-ui/react-tabs`, `@radix-ui/react-toast`, `@radix-ui/react-toggle-group`, `@radix-ui/react-tooltip` — `react-progress` and `react-slider` are v3 additions backing `LinearProgressIndicator` and the `Slider*` family.

---

## Directory Structure

```
src/
  index.ts                    ← barrel: all public exports
  utils/cn.ts                 ← clsx + tailwind-merge helper
  styles/
    index.css                 ← Tailwind build entry: @import chain, generated @theme inline block, text-style-* role classes (@layer components), h-button/size-* utilities
    tokens.css                ← SOURCE OF TRUTH: all --ui-* CSS custom properties (light in :root/.light, dark in .dark)
    dooph-component-tokens.css ← @layer utilities: ds-* helpers (spacing, disabled states, radix origin)
    theme.css                 ← GENERATED preset (sync-theme.mjs): standalone @theme inline block shipped as ./theme.css for consumer Tailwind builds. Do not hand-edit.
  components/
    Avatar/
    Button/
    Checkbox/
    CopyButton/                 ← v3: clipboard-copy Button wrapper; CopyButtonVariant
    DropdownTrigger/
    HotkeyIndicator/
    Icons/
    Input/
    LinearProgressIndicator/    ← v3: Radix Progress; `color` prop
    LoadingSpinner/
    Menu/
    Modal/
    OutlineButton/
    OutlineSection/
    ProgressIndicator/
    SearchBox/
    SegmentedTabSelect/
    ShapeButton/
    Shapes/                     ← v3 adds StarShape (ShapeButtons.star)
    Sheet/
    Slider/                     ← v3: Radix Slider; SliderContinuous/Stepped/Labeled; `color` prop
    SplitButton/
    Table/
    Tabs/
    Text/                       ← BaseText + roles, constants.ts (Fonts/FontSizes/FontWeights/Tracking/FontAxes), textStyle.ts; ShimmerText, RollChangeText, RollHoverText
    TextLink/                   ← v3: anchor-styled body text
    Toast/
    Toggle/
    Tooltip/
    WavyDivider/
.storybook/
  main.ts                     ← @storybook/react-vite + @tailwindcss/vite
  preview.ts                  ← decorator: .dark toggle on <html>, body bg
  preview-head.html           ← Google Fonts CDN (NOT shipped in package)
skills/                       ← distributed skills for consuming projects (NOT this repo's maintenance); shipped via npm + init-skills
  dooph-design-system-usage/  ← consumer skill: build UI with components/tokens (replaces old orientation + composition)
  dooph-design-system-theming/← consumer skill: install, fonts, dark mode, theme.css preset, rebranding
  dooph-design-system-v3-migration/← consumer skill: one-time v2→v3 breaking-rename sweep (destructive→danger, border/surface split, brand-color)
.agents/skills/               ← authoring-side skills for this repo (canonical source)
  dooph-ds-architecture/      ← architecture rules skill
  dooph-ds-codebase/          ← this file
  dooph-ds-contribution/      ← contribution guide skill
  dooph-ds-loading-indicators/← loading indicator component skill
  radix-ui-design-system/     ← Radix UI patterns skill
.claude/skills/               ← Claude-specific skill directory
  dooph-ds-architecture  →    symlink → ../../.agents/skills/dooph-ds-architecture
  dooph-ds-codebase      →    symlink → ../../.agents/skills/dooph-ds-codebase
  dooph-ds-contribution  →    symlink → ../../.agents/skills/dooph-ds-contribution
  dooph-ds-loading-indicators/← real copy (not symlinked)
bin/init.mjs                  ← init-skills CLI shipped with npm package
scripts/
  generate-icon-exports.mjs   ← regenerates Icons/index.ts from svg components
  sync-theme.mjs              ← from tokens.css, regenerates the @theme inline block in index.css AND the standalone theme.css preset
  copy-theme.mjs              ← copies src/styles/theme.css → dist/theme.css (used by build:css; tsup onSuccess does the same)
```

---

## Component Inventory

### Button family

| Component            | File                              | Radix  | Variants/Sizes                 | asChild |
| -------------------- | --------------------------------- | ------ | ------------------------------ | ------- |
| `Button`             | `Button/Button.tsx`               | `Slot` | `ButtonVariant` × `ButtonSize` | ✅      |
| `SplitButton`        | `SplitButton/SplitButton.tsx`     | –      | none                           | ❌      |
| `SplitButtonAction`  | same                              | –      | –                              | ❌      |
| `SplitButtonTrigger` | same                              | –      | –                              | ❌      |
| `OutlineButton`      | `OutlineButton/OutlineButton.tsx` | `Slot` | `inverseTheme` bool; `glowing` bool; `glowColor1`/`glowColor2` strings | ✅      |
| `ShapeButton`        | `ShapeButton/ShapeButton.tsx`     | `Slot` | `ShapeButtons` (shape)         | ✅      |
| `CopyButton`         | `CopyButton/CopyButton.tsx`       | –      | `CopyButtonVariant` (`ghost`\|`secondary`) — wraps `Button` (ghost→`ButtonSize.iconMicro`, secondary→`ButtonSize.iconSm`) | via `Button` |

`ButtonVariant` (v3): `primary`\|`secondary`\|`brand`\|`danger`\|`ghost`\|`text` — `danger` replaces the removed `destructive` key. `ButtonSize` (v3): `default`\|`sm`\|`icon`\|`icon-sm`\|`icon-micro` (`ButtonSize.iconMicro`, backs `--ui-height-button-micro` via `size-button-micro`).

`Shapes/` (`src/components/Shapes/`): `ArrowShape`, `CloverShape`, `CookieShape`, `GemShape`, `PentagonShape`, `PuffShape`, `StarShape` (v3) — plain SVG shape primitives (`size`, `strokeColor`, `fillColor`, `strokeWeight` props). `Shapes` const (from `Shapes/index.ts`) enumerates the same keys (`arrow`\|`clover`\|`cookie`\|`gem`\|`pentagon`\|`puff`\|`star`) and types the shared `Shapes` type. `ShapeButtons` (from `ShapeButton/constants.ts`) is the dot-accessible const consumers pass to `ShapeButton shape=`, `satisfies Record<string, Shapes>` against the same keys.

### Input / control family

| Component          | File                      | Radix                          | Variants                       |
| ------------------ | ------------------------- | ------------------------------ | ------------------------------ |
| `Input`            | `Input/Input.tsx`         | –                              | `hasError` bool                |
| `SearchBox`        | `SearchBox/SearchBox.tsx` | –                              | `shortcut` string[]            |
| `TwoWayToggle`     | `Toggle/Toggle.tsx`       | `@radix-ui/react-toggle-group` | `ToggleVariant` × `ToggleSize` |
| `TwoWayToggleItem` | same                      | same                           | same (inherits via context)    |
| `Checkbox`         | `Checkbox/Checkbox.tsx`   | `@radix-ui/react-checkbox`     | `CheckboxChecked`              |

### Navigation / tab family

| Component            | File                                        | Radix                  | Variants/Sizes           |
| -------------------- | ------------------------------------------- | ---------------------- | ------------------------ |
| `Tabs` (Root)        | `Tabs/Tabs.tsx`                             | `@radix-ui/react-tabs` | –                        |
| `TabsList`           | same                                        | same                   | –                        |
| `TabsTrigger`        | same                                        | same                   | `TabVariant` × `TabSize` |
| `TabsContent`        | same                                        | same                   | –                        |
| `SegmentedTabSelect` | `SegmentedTabSelect/SegmentedTabSelect.tsx` | wraps Tabs             | `SegmentedVariant`       |
| `SegmentedTabItem`   | same                                        | same                   | inherits from context    |

### Dropdown / menu family

| Component                                                                                                     | File                                  | Radix                                                                               |
| ------------------------------------------------------------------------------------------------------------- | ------------------------------------- | ----------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `DropdownMenu` (Root)                                                                                         | `Menu/DropdownMenu.tsx`               | `@radix-ui/react-dropdown-menu`                                                     |
| `DropdownMenuContent`                                                                                         | same                                  | same — portal toggle; `focusOnOpen` (default true, set false with typeable trigger) |
| `DropdownMenuItem`                                                                                            | same                                  | same                                                                                |
| `DropdownMenuCheckboxItem`                                                                                    | same                                  | same                                                                                |
| `DropdownMenuLabel`                                                                                           | same                                  | same                                                                                |
| `DropdownMenuSeparator`                                                                                       | same                                  | same                                                                                |
| `DropdownMenuSection`                                                                                         | same                                  | layout div — horizontal inset for items/labels; separators sit outside sections     |
| `DropdownMenuGroup`, `DropdownMenuSub`, `DropdownMenuRadioGroup`, `DropdownMenuTrigger`, `DropdownMenuPortal` | same                                  | pass-throughs                                                                       |
| `DropdownTrigger`                                                                                             | `DropdownTrigger/DropdownTrigger.tsx` | `Slot`                                                                              | asChild                                                              |
| `DropdownTriggerContent`                                                                                      | same                                  | –                                                                                   | optional `<div className="flex flex-row gap-xs">` wrapper for consumer-composed trigger content |
| `TextDropdownTrigger`                                                                                         | same                                  | `Slot`                                                                              | `TextDropdownSize`                                                   |
| `TypeableDropdownTrigger`                                                                                     | same                                  | –                                                                                   | `<div>` root; `inputRef`; compose with `DropdownMenuTrigger asChild`; `onPointerDown` is state-aware (opens when closed, suppresses toggle when open) |

### Overlay / modal

| Component                                     | File                  | Radix                                                                     |
| --------------------------------------------- | --------------------- | ------------------------------------------------------------------------- |
| `Modal`                                       | `Modal/Modal.tsx`     | `@radix-ui/react-dialog`                                                  |
| `ModalTrigger`, `ModalPortal`, `ModalClose`   | same                  | pass-throughs                                                             |
| `ModalOverlay`                                | same                  | styled backdrop                                                           |
| `ModalContent`                                | same                  | panel; `withOverlay` bool                                                 |
| `ModalTitle`, `ModalDescription`              | same                  | a11y helpers                                                              |
| `Sheet`                                       | `Sheet/Sheet.tsx`     | `@radix-ui/react-dialog` — edge-anchored panel counterpart to Modal       |
| `SheetTrigger`, `SheetPortal`, `SheetClose`   | same                  | pass-throughs                                                             |
| `SheetOverlay`                                | same                  | styled backdrop; fade synced to panel (300ms in / 200ms out)              |
| `SheetContent`                                | same                  | panel; `side` = `SheetSide.left/right/top/bottom` (default right); `withOverlay` bool; settle-tail push: enters from 20% offset + fade via `slide-*-[20%]` + `fade-in-0` (explicit value required — unsuffixed `slide-*` resolves to 0.25rem in Tailwind v4); 300ms in `cubic-bezier(0.32,0.72,0,1)`, 200ms out; timing set as arbitrary `[animation-timing-function:…]` property |
| `SheetTitle`, `SheetDescription`              | same                  | a11y helpers                                                              |
| `Tooltip`                                     | `Tooltip/Tooltip.tsx` | `@radix-ui/react-tooltip`                                                 |
| `TooltipContent`                              | same                  | variants: `TooltipTypes.simple/rich/complex`; token-driven `themeInverse` |
| `ToastProvider`, `ToastRoot`, `ToastViewport` | `Toast/Toast.tsx`     | `@radix-ui/react-toast`                                                   |
| `ToastAction`, `ToastClose`                   | same                  | reuse `buttonVariants`; action toasts use text dismiss + primary action   |

### Slider family (v3 — Radix Slider)

| Component          | File                | Radix                     | Notes |
| ------------------ | ------------------- | ------------------------- | ----- |
| `SliderContinuous` | `Slider/Slider.tsx` | `@radix-ui/react-slider`  | `SliderBase` with `showSteps={false}` |
| `SliderStepped`    | same                | same                      | `SliderBase` with `showSteps={true}`; step dots (`ds-slider-dot`, `[data-active]` for the filled side) |
| `SliderLabeled`    | same                | same                      | wraps either in a column with `labels: { start, end }` rendered as `LabelText` below the track; optional `stepped` bool |

`color` (token name or any CSS color, default `primary`) paints the handle solid
and the active fill at 45% via `.ds-slider-fill` reading `--ds-slider-color`.
There is no `SliderVariant` — it was removed in favour of `color`.

Geometry uses literal `calc()` class strings (not concatenated) keyed to
`--ui-slider-track-gap` / `--ui-width-slider-handle` / `--ui-height-slider-handle`,
and is thumb-aligned: dots, both fills and the handle share one percent formula.
The stepped variant carries two behaviours worth knowing before editing it:

- **End inset.** An outer wrapper adds `px-xs`, shrinking the Radix root so the
  handle's travel and the end dots sit `--ui-spacing-xs` off the ends; the fills
  bleed back out over that padding via `--ds-slider-pad` (`0px` on continuous, so
  its geometry is untouched). Radix maps both pointer and handle against the
  root's own box, so shrinking the root is the only way to inset travel — padding
  the root itself does nothing.
- **Smooth drag, snapped value.** Radix is driven at `step / DRAG_SUBDIVISIONS`
  while dragging so the handle tracks the pointer, and the public value is
  snapped back to the real step on change and commit. Keyboard is handled
  explicitly for that reason (a fine step would move a hundredth of a dot).
  `.ds-slider-glide` applies the settle transition to the handle and both fills
  from one declaration; it is off mid-drag and until first interaction, because
  Radix re-positions the handle by half its width once it measures it.

### Progress indicators

| Component                 | File                                             | Radix                       | Notes |
| -------------------------- | ------------------------------------------------ | ---------------------------- | ----- |
| `LinearProgressIndicator` | `LinearProgressIndicator/LinearProgressIndicator.tsx` | `@radix-ui/react-progress` (v3) | `color` (same contract as `Slider*`, default `primary`) via `--ds-progress-color`; no `LinearProgressVariant`; clamps `value` into `[0, max]` before computing `--progress-pct`; remainder track hides itself via `data-hidden` once `pct >= 100` so it never overlaps the 0% nub |
| `LoadingSpinner`           | `LoadingSpinner/LoadingSpinner.tsx`              | –                             | see `dooph-ds-loading-indicators` skill for the wave/geometry model |
| `ProgressIndicator`        | `ProgressIndicator/ProgressIndicator.tsx`        | –                             | see `dooph-ds-loading-indicators` skill |

### Links

| Component  | File                     | Radix   | Notes |
| ---------- | ------------------------ | ------- | ----- |
| `TextLink` | `TextLink/TextLink.tsx`  | `Slot`  | body-text anchor; ghost foreground at rest, primary text on hover/active, color change only (no underline); `asChild` for `<Link>` composition |

### Text

| Export                                                                        | Description                                                                                                             |
| ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `BaseText`                                                                    | `variant` = `TextVariant` picks the role class; typography props (`font`, `fontSize`, `fontWeight`, `lineHeight`, `letterSpacing`, `axes`) resolve to **inline style** in `textStyle.ts`; `unstyled` drops the role class; `as` is polymorphic and typed off the element |
| `ButtonText`, `BodyText`, `LabelText`, `HeadingText`, `TitleText`, `HeroText` | Role components built by the `createRoleText` factory in `BaseText.tsx`                                                  |
| `Fonts`, `FontSizes`, `FontWeights`, `Tracking`, `FontAxes`                   | `Text/constants.ts` (server-safe). Values are the `var(--ui-*)` string itself, not a lookup key — resolution is a no-op and consumer token overrides survive. `FontAxes` holds axis TAGS (`GRAD`, `ROND`, …) |
| `serializeAxes`, `TextStyleProps`                                             | `Text/textStyle.ts` — axis-record → `font-variation-settings` string, and the shared prop shape |
| `ShimmerText` (v3)                                                            | `<span>` wrapper applying `ds-shimmer-text` (animated gradient masked to glyphs via `background-clip: text`); children keep their own typography but must not set an explicit text color while shimmering; tune via `--ui-shimmer-base`/`--ui-shimmer-highlight`; respects `prefers-reduced-motion` |
| `RollChangeText` (v3)                                                         | `<span>` wrapper that animates old content rolling down + blurring out while new content rolls in from above on `changeKey` (or string/number `children`) change; keyframes `ds-roll-out`/`ds-roll-in` |
| `RollHoverText`                                                               | `<span>` wrapper rolling each character on hover (`ds-roll-hover*` classes) |

`ShimmerText` / `RollChangeText` / `RollHoverText` stay wrappers rather than
`BaseText` props on purpose: they must be able to wrap icons and arbitrary
children, not just text.

### Icons

All icons live in `src/components/Icons/`. They extend `BaseIcon` with an `IconSize` enum (`tiny`, `standard`, `medium`). The `Icons/index.ts` is auto-generated by `scripts/generate-icon-exports.mjs`.

### Layout

| Component         | Description                                                                    |
| ----------------- | ------------------------------------------------------------------------------ |
| `HotkeyIndicator` | `<kbd>` key display, `keys: string[]`, `pressed` bool                          |
| `OutlineSection`  | Double-border shell: outer dashed ring + inner surface card                    |
| `Avatar`          | Composable square shell; `children` only, size via `AvatarSize.standard/small` |

---

## Styling System

### Token layer (`tokens.css`)

All values live in `--ui-*` CSS custom properties on `:root`/`.light` (light) and `.dark`. Consuming projects override these. Components reference values only through Tailwind utilities or `ds-*` helpers — never via `var(--ui-*)` directly in className strings.

Notable component tokens:

- Tooltip themes: `--ui-color-tooltip-inverse-*` and `--ui-color-tooltip-matching-*`. `TooltipContent themeInverse` switches between `ds-tooltip-inverse-theme` and `ds-tooltip-matching-theme`; there is no runtime theme detection.
- Toast widths: `--ui-width-toast-simple`, `--ui-width-toast-complex`, `--ui-width-toast-viewport`, consumed by `ds-toast-width-simple`, `ds-toast-width-complex`, and `ds-toast-viewport`. Widths are pinned per variant, matching `ToastTypes.simple`/`.complex`.
- Tooltip/menu widths: `--ui-width-tooltip-rich` (pinned) and `--ui-min-w-tooltip-complex` back `ds-width-tooltip-rich`/`ds-min-w-tooltip-complex`; the simple tooltip intentionally hugs its text. `--ui-min-w-menu` (160) / `-action` (144) / `-complex` (324) back `ds-menu-w-standard`/`-action`/`-complex`, selected by `DropdownMenuVariant` on the menu root.
- Avatar surface (v3): no dedicated `--ui-color-avatar-bg` token — `Avatar` composes `bg-surface-secondary` + `border-border-secondary` + `text-brand-color`; brand/logo content is supplied by consumers as children, not via a package provider.
- **v3 token vocabulary** (see `tokens.css` and the theming skill's `token-contract.md` for the full list): `--ui-color-danger*` (replaces `destructive*`), `--ui-color-border-primary`/`-secondary` (replaces the single `--ui-color-border`), `--ui-color-surface-primary`/`--ui-color-page-background` (replaces `surface`/`surface-page`), `--ui-brand-color`/`--ui-brand-color-alt` (the brand-identity pair; `OutlineButton`'s `glowColor1`/`glowColor2` now default to `var(--ui-brand-color-alt)` — the old standalone `--ui-accent-color` token no longer exists in `tokens.css`), `--ui-color-focus-ring-brand`/`-primary`/`-error` (replaces the single `--ui-color-focus-ring`), `--ui-color-trigger-border-error-focus`, slider sizing tokens (`--ui-height-slider-track`, `--ui-radius-slider-inner`, `--ui-slider-track-gap`, `--ui-width-slider-handle`, `--ui-height-slider-handle`), `--ui-height-button-micro`, and shimmer tokens (`--ui-shimmer-base`, `--ui-shimmer-highlight`).

### Tailwind theme (`@theme inline` in `index.css`)

Maps `--ui-*` tokens into Tailwind utility namespaces:

- `--color-primary` → `bg-primary`, `text-primary`, `border-primary`
- `--font-body` → `font-body` (also `font-button`, `font-heading`, `font-label`, `font-title`, `font-hero`)
- `--shadow-button` → `shadow-button`
- `--radius-tight` → `rounded-tight`
- etc. (full map in `index.css` between `__GENERATED_THEME_START__` and `__GENERATED_THEME_END__`)

The `__GENERATED_*__` block is managed by `scripts/sync-theme.mjs` — do not hand-edit it; run `npm run sync-tokens` after adding new `--ui-*` tokens.

### Consumer Tailwind preset (`theme.css`)

`styles.css` is compiled Tailwind: it ships tokens + the exact utility classes dooph components use, but a consuming app's own Tailwind build has no knowledge of the dooph token namespace. So app-authored classes (`p-md`, `gap-sm`, `rounded-standard`, `font-label`) never generate, and colliding Tailwind defaults (`font-sans`, numeric spacing) win. `theme.css` is the standalone `@theme inline` block, shipped as `./theme.css`, that consumers import into their own Tailwind so every dooph utility resolves. It is **generated by `sync-theme.mjs` from the same entries as the index.css block** — never hand-edit it, and never let it drift from index.css (running `sync-tokens` keeps both in step).

### Component token helpers (`dooph-component-tokens.css`)

`@layer utilities` containing `ds-*` classes:

- `ds-disabled-state` — `cursor-not-allowed; opacity: var(--ui-opacity-disabled)` for `:disabled, [aria-disabled="true"]`
- `ds-radix-data-disabled` — same but for `[data-disabled]` (Radix menu items)
- `ds-disabled-control` — native `:disabled` only
- `ds-shape-button-focus-visible` — custom focus outline for ShapeButton
- Focus ring helpers: `ds-focus-visible-ring`, `ds-focus-within-ring`, `ds-focus-ring-on-focus`, `ds-focus-ring-error-on-focus`, `ds-focus-ring` — token-backed outline rings for controls that need external focus affordances without `box-shadow` overflow clipping (the error variant is named `-error-`, not `-destructive-`, matching the v3 `--ui-color-focus-ring-error` token)
- `ds-radix-dropdown-content-origin` — `transform-origin: var(--radix-dropdown-menu-content-transform-origin)`
- `ds-radix-dropdown-match-trigger-width` — trigger width, floored by `--ds-menu-min-w`
- `ds-min-w-menu` — `min-width: var(--ui-min-w-menu)` (fallback when `matchTriggerWidth` is off)
- Menu width variants: `ds-menu-w-standard`, `ds-menu-w-action`, `ds-menu-w-complex` — each only sets `--ds-menu-min-w`; the width helper above consumes it, so the floor applies in both width modes
- Toast helpers: `ds-toast-viewport`, `ds-toast-width-simple`, `ds-toast-width-complex`
- Tooltip helpers: `ds-tooltip-inverse-theme`, `ds-tooltip-matching-theme`, `ds-width-tooltip-rich`, `ds-min-w-tooltip-complex`
- Spacing helpers: `ds-gap-ui-xs`, `ds-p-ui-xs`, `ds-px-ui-xs`, `ds-px-ui-sm`, `ds-py-ui-xs`, `ds-py-ui-xxs`, `ds-py-ui-rg`, `ds-pl-ui-md`, `ds-pl-ui-rg`, `ds-pr-ui-rg`, `ds-pr-ui-sm`, `ds-my-ui-xs`
- Slider: `ds-slider-fill` (45% of `--ds-slider-color` — Figma applies alpha over the color, which Tailwind's `bg-primary/45` shorthand can't express against a custom property), `ds-slider-dot` + `ds-slider-dot[data-active]` (inactive `--ui-color-secondary-border`, active `--ui-color-text` at 40%), `ds-slider-glide` + `ds-slider-part` (shared settle transition). The dot split is a plain attribute selector, **not** a `data-[active]:` Tailwind variant — a variant only composes with generated utilities, so pairing one with a class defined here emits no rule at all (that bug shipped once already)
- CopyButton icon-swap helpers (v3): `ds-copy-icon-clipboard`, `ds-copy-icon-check` — both icons share one grid cell; `[data-copied]` cross-fades/scales between them (skipped under `prefers-reduced-motion`)

### Composite text utilities (in `index.css`)

`text-style-button`, `text-style-body`, `text-style-label`, `text-style-title`, `text-style-heading`, `text-style-hero` — apply a role's full typographic intent (family, size, weight, optical sizing, variation settings, tracking) in a single class. Components apply these directly; `BaseText` applies one per `variant`.

They live in **`@layer components`, not `utilities`** — that is load-bearing, not incidental. It makes a consumer's own utility (`leading-*`, `text-2xl`) override a role, while `BaseText`'s props still win because they are inline. Moving them back into `utilities` silently re-breaks every consumer override.

**No role sets `line-height`.** Leading is the consuming app's to own; do not reintroduce a hardcoded value here.

`BaseText` typography props are emitted as inline style, never as classes. The previous class-based approach (`ds-font-weight-*` plus `font-*`/`text-*` utilities) is deleted: two of its three props silently did nothing, because the role class was emitted ~50kB later in the compiled sheet and won on source order, and `fontSize` was additionally dropped by tailwind-merge as a colour conflict. Do not reintroduce class-based text props.

`ds-shimmer-text` (v3, also in `index.css`, not `dooph-component-tokens.css`) — animated gradient `background-clip: text` utility backing `ShimmerText`; `@keyframes ds-shimmer` plus the reduced-motion fallback live alongside it. `ds-roll-out`/`ds-roll-in` keyframes back `RollChangeText`.

### Height/size utilities (in `index.css`)

`h-button`, `h-button-sm`, `size-button`, `size-button-sm` — keyed to `--ui-height-button` and `--ui-height-button-sm` tokens. v3 adds `size-button-micro` (keyed to `--ui-height-button-micro`, backs `ButtonSize.iconMicro`) and `h-slider-track` (keyed to `--ui-height-slider-track`, used by the `Slider*` track).

---

## Build Pipeline

```
npm run build
  → generate-icon-exports  (regenerate Icons/index.ts)
  → sync-tokens            (regenerate @theme inline block in index.css AND theme.css)
  → tsup (build:js)        (ESM + CJS + .d.ts; clean:true wipes dist first)
       └ onSuccess         → tailwindcss CLI → dist/styles.css, then copy src/styles/theme.css → dist/theme.css

npm run build:css          → standalone: tailwindcss → dist/styles.css, then copy-theme → dist/theme.css (CSS-only rebuilds)
npm run storybook          → @storybook/react-vite dev server (port 6006)
npm run lint               → tsc --noEmit (TypeScript check only, no eslint)
```

CSS assets (`styles.css` + `theme.css`) are emitted together by tsup's `onSuccess`, so any build path that runs tsup produces both — they cannot drift or go missing on publish. `build` does not call `build:css` (tsup already covers it); use `build:css` only for CSS-only iterations.

---

## Public Exports (src/index.ts)

`src/index.ts` is the single public surface — every component, variant const, type
and utility must be re-exported there, or consumers cannot reach it.

Read the current surface from the source rather than from this file; a hand-kept
list here goes stale on every release:

```bash
grep -n "export" src/index.ts          # what the barrel intends
grep -o "export {[^}]*}" dist/index.d.ts   # what actually shipped
```

Conventions that hold across the surface:

- Components and their `*Props` types come from the component's `index.ts`.
### `"use client"` — only where a client-only hook forces it

React 19's server build exports `forwardRef`, `memo`, `useId`, `useMemo` and
`useCallback`, so a component using only those is **neutral**: no directive, and
it renders in either graph. Only `useState` / `useEffect` / `useRef` (and browser
APIs, timers, rAF) require the directive. A neutral module may freely import and
render a client component — that is composition, not a boundary.

Check with `head -1` before assuming; current split among the non-obvious ones:
`LoadingSpinner` is client (`useRef` + `useEffect` + rAF); `ProgressIndicator`
(`useMemo`), `WavyDivider` (`useId`) and `Table` (no hooks) are neutral.
`add-use-client.mjs` stamps dist chunks purely from source directives, so
deleting the line from a source file is the whole change.

- Dot-accessible consts live in a sibling **`constants.ts` with no `"use client"`**
  so RSC code can read their values; the component file imports them and stays
  client. Every component with consts follows this, except `Avatar` and
  `BaseIcon`, which declare theirs inline in server-safe modules — equivalent.
  A const declared inside a `"use client"` file is a client reference, not a
  value, so `LoadingSpinnerSize.md` in a Server Component would break.
- Adding a component means: component + consts + types in the folder `index.ts`,
  then re-export from `src/index.ts`. tsup globs `src/**/*.{ts,tsx}`, so no build
  config change is needed.


---

## Maintenance Skills: Canonical Source & Mirroring

`.agents/skills/` is the **canonical source** for this repo's authoring-side skills
(`dooph-ds-architecture`, `dooph-ds-codebase`, `dooph-ds-contribution`,
`dooph-ds-loading-indicators`, plus the general `radix-ui-design-system` and
`skill-creator`). **Always edit here.** The `.claude/` and `.agent/` skill
directories are meant to be directory symlinks back into `.agents/skills/` so a
single edit serves every agent framework.

`core.symlinks = false` on this repo (and Windows checkouts generally) means git
often materializes those mode-`120000` links as empty/real directories instead —
so a mirror may be missing or stale. Check actual state before trusting it:

```powershell
cmd /c dir /AL ".claude\skills"   # entries should show <SYMLINKD> / <JUNCTION>
```

To (re)establish a mirror after it materializes wrong, remove the stray entry and
recreate the link (repeat per skill, per target root that should mirror):

```powershell
Remove-Item -Recurse -Force ".claude\skills\dooph-ds-codebase"
cmd /c mklink /D ".claude\skills\dooph-ds-codebase" "..\..\.agents\skills\dooph-ds-codebase"
```

If a mirror is a real copy rather than a link (e.g. `.claude/skills/dooph-ds-loading-indicators`),
edits made in `.agents/` won't propagate — re-copy or relink it after changing the source.
