---
name: dooph-ds-codebase
description: Authoritative map of the @dooph-software/design-system source repository. Load when working inside this repo to understand file layout, component inventory, styling system, build pipeline, and current exports. Use alongside dooph-ds-architecture for all maintenance and extension work.
---

# dooph Design System — Codebase Map

Package: `@dooph-software/design-system`
Build: tsup (ESM + CJS + `.d.ts`) + `@tailwindcss/cli` for `dist/styles.css`
React peerDep: `>=19`
Tailwind: v4 with `@theme inline`

---

## Directory Structure

```
src/
  index.ts                    ← barrel: all public exports
  utils/cn.ts                 ← clsx + tailwind-merge helper
  styles/
    index.css                 ← entry: @import chain, @theme inline, text-style-* utilities, h-button utilities
    tokens.css                ← all --ui-* CSS custom properties (light in :root/.light, dark in .dark)
    dooph-component-tokens.css ← @layer utilities: ds-* helpers (spacing, disabled states, radix origin)
  components/
    Button/
    DropdownTrigger/
    HotkeyIndicator/
    Icons/
    Input/
    Menu/
    Modal/
    OutlineButton/
    OutlineSection/
    SearchBox/
    SegmentedTabSelect/
    ShapeButton/
    SplitButton/
    Tabs/
    Text/
    Toast/
    Toggle/
    Tooltip/
    Avatar/
.storybook/
  main.ts                     ← @storybook/react-vite + @tailwindcss/vite
  preview.ts                  ← decorator: .dark toggle on <html>, body bg
  preview-head.html           ← Google Fonts CDN (NOT shipped in package)
skills/                       ← distributed skills for consuming projects (not for this repo's maintenance)
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
  sync-theme.mjs              ← syncs @theme inline block in index.css from tokens.css
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
| `Tooltip`                                     | `Tooltip/Tooltip.tsx` | `@radix-ui/react-tooltip`                                                 |
| `TooltipContent`                              | same                  | variants: `TooltipTypes.simple/rich/complex`; token-driven `themeInverse` |
| `ToastProvider`, `ToastRoot`, `ToastViewport` | `Toast/Toast.tsx`     | `@radix-ui/react-toast`                                                   |
| `ToastAction`, `ToastClose`                   | same                  | reuse `buttonVariants`; action toasts use text dismiss + primary action   |

### Text

| Export                                                                        | Description                                                                                                             |
| ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `BaseText`                                                                    | Generic text component; `variant` prop = `TextVariant` (composite style); optional `fontFamily`, `fontSize`, `fontWeight` overrides via `TextFontFamily`, `TextFontSize`, `TextFontWeight` — layered on top of the variant via tailwind-merge |
| `ButtonText`, `BodyText`, `LabelText`, `HeadingText`, `TitleText`, `HeroText` | Pre-composed variants of `BaseText`                                                                                     |

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
- Toast widths: `--ui-width-toast`, `--ui-width-toast-action`, `--ui-width-toast-viewport`, consumed by `ds-toast-width`, `ds-toast-action-width`, and `ds-toast-viewport`.
- Avatar surface: `--ui-color-avatar-bg`; brand/logo content is supplied by consumers as children, not via a package provider.

### Tailwind theme (`@theme inline` in `index.css`)

Maps `--ui-*` tokens into Tailwind utility namespaces:

- `--color-primary` → `bg-primary`, `text-primary`, `border-primary`
- `--font-sans` → `font-sans`
- `--shadow-button` → `shadow-button`
- `--radius-tight` → `rounded-tight`
- etc. (full map in `index.css` between `__GENERATED_THEME_START__` and `__GENERATED_THEME_END__`)

The `__GENERATED_*__` block is managed by `scripts/sync-theme.mjs` — do not hand-edit it; run `npm run sync-tokens` after adding new `--ui-*` tokens.

### Component token helpers (`dooph-component-tokens.css`)

`@layer utilities` containing `ds-*` classes:

- `ds-disabled-state` — `cursor-not-allowed; opacity: var(--ui-opacity-disabled)` for `:disabled, [aria-disabled="true"]`
- `ds-radix-data-disabled` — same but for `[data-disabled]` (Radix menu items)
- `ds-disabled-control` — native `:disabled` only
- `ds-shape-button-focus-visible` — custom focus outline for ShapeButton
- Focus ring helpers: `ds-focus-visible-ring`, `ds-focus-within-ring`, `ds-focus-ring-on-focus`, `ds-focus-ring-destructive-on-focus`, `ds-focus-ring` — token-backed outline rings for controls that need external focus affordances without `box-shadow` overflow clipping
- `ds-radix-dropdown-content-origin` — `transform-origin: var(--radix-dropdown-menu-content-transform-origin)`
- `ds-radix-dropdown-match-trigger-width` — trigger width with `--ui-min-w-menu` floor
- `ds-min-w-menu` — `min-width: var(--ui-min-w-menu)`
- Toast helpers: `ds-toast-viewport`, `ds-toast-width`, `ds-toast-action-width`
- Tooltip helpers: `ds-tooltip-inverse-theme`, `ds-tooltip-matching-theme`
- Spacing helpers: `ds-gap-ui-xs`, `ds-p-ui-xs`, `ds-px-ui-xs`, `ds-px-ui-sm`, `ds-py-ui-xs`, `ds-py-ui-xxs`, `ds-py-ui-rg`, `ds-pl-ui-md`, `ds-pl-ui-rg`, `ds-pr-ui-rg`, `ds-pr-ui-sm`, `ds-my-ui-xs`

### Composite text utilities (in `index.css`)

`text-style-button`, `text-style-body`, `text-style-label`, `text-style-title`, `text-style-heading`, `text-style-hero` — apply full typographic intent (family, size, weight, optical sizing, variation settings) in a single class. Use these everywhere instead of composing individual font utilities.

### Height/size utilities (in `index.css`)

`h-button`, `h-button-sm`, `size-button`, `size-button-sm` — keyed to `--ui-height-button` and `--ui-height-button-sm` tokens.

---

## Build Pipeline

```
npm run build
  → generate-icon-exports  (regenerate Icons/index.ts)
  → sync-tokens            (sync @theme inline block)
  → tsup                   (ESM + CJS + .d.ts)
  → tailwindcss CLI        (dist/styles.css, runs on tsup onSuccess)

npm run storybook          → @storybook/react-vite dev server (port 6006)
npm run lint               → tsc --noEmit (TypeScript check only, no eslint)
```

---

## Public Exports (src/index.ts)

All of the following must be exported. If adding a component, add it here.

Components: `Button`, `SplitButton`, `SplitButtonAction`, `SplitButtonTrigger`, `OutlineButton`, `ShapeButton`, `Input`, `SearchBox`, `TwoWayToggle`, `TwoWayToggleItem`, `Checkbox`, `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`, `SegmentedTabSelect`, `SegmentedTabItem`, `DropdownMenu`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuCheckboxItem`, `DropdownMenuLabel`, `DropdownMenuSeparator`, `DropdownMenuSection`, `DropdownMenuGroup`, `DropdownMenuSub`, `DropdownMenuRadioGroup`, `DropdownMenuTrigger`, `DropdownMenuPortal`, `DropdownTrigger`, `TextDropdownTrigger`, `TypeableDropdownTrigger`, `Modal`, `ModalTrigger`, `ModalPortal`, `ModalOverlay`, `ModalContent`, `ModalClose`, `ModalTitle`, `ModalDescription`, `ToastProvider`, `ToastRoot`, `ToastViewport`, `ToastAction`, `ToastClose`, `TooltipProvider`, `Tooltip`, `TooltipTrigger`, `TooltipContent`, `TooltipTitle`, `TooltipBody`, `Avatar`, `HotkeyIndicator`, `OutlineSection`, `BaseText`, `ButtonText`, `BodyText`, `LabelText`, `HeadingText`, `TitleText`, `HeroText`, all Icon components, `BaseIcon`

Variant/size consts: `ButtonVariant`, `ButtonSize`, `TabVariant`, `TabSize`, `ToggleVariant`, `ToggleSize`, `SegmentedVariant`, `TextDropdownSize`, `ShapeButtons`, `TextVariant`, `TextFontFamily`, `TextFontSize`, `TextFontWeight`, `CheckboxChecked`, `IconSize`, `ToastTypes`, `TooltipTypes`, `AvatarSize`

Types: `ButtonProps`, `TabsTriggerProps`, `TwoWayToggleProps`, `TwoWayToggleItemProps`, `SegmentedTabSelectProps`, `SegmentedTabItemProps`, `ShapeButtonProps`, `ShapeButtonShape`, `DropdownTriggerProps`, `TextDropdownTriggerProps`, `TypeableDropdownTriggerProps`, `InputProps`, `SearchBoxProps`, `ToastProviderProps`, `ToastRootProps`, `ToastTitleProps`, `ToastDescriptionProps`, `TooltipContentProps`, `TooltipTitleProps`, `TooltipBodyProps`, `AvatarProps`, `HotkeyIndicatorProps`, `OutlineSectionProps`, `OutlineButtonProps`, `BaseTextProps`, `ButtonTextProps`, `BodyTextProps`, `LabelTextProps`, `HeadingTextProps`, `TitleTextProps`, `HeroTextProps`

Utilities: `cn`, `buttonVariants`, `tabTriggerVariants`

---

## Skill Symlink Maintenance

Three entries under `.claude/skills/` are directory symlinks into `.agents/skills/`:

| Symlink | Target |
| ------- | ------ |
| `.claude/skills/dooph-ds-architecture` | `../../.agents/skills/dooph-ds-architecture` |
| `.claude/skills/dooph-ds-codebase` | `../../.agents/skills/dooph-ds-codebase` |
| `.claude/skills/dooph-ds-contribution` | `../../.agents/skills/dooph-ds-contribution` |

**Always edit skills in `.agents/skills/`** — the `.claude/` entries are read-only aliases.

### Restoring broken symlinks (Windows)

Git stores these as mode `120000` (symlink) blobs, but `core.symlinks = false` in this repo causes git to materialize them as real directories on checkout. If they appear as regular directories instead of symlinks, restore them:

```powershell
Remove-Item -Recurse -Force ".claude\skills\dooph-ds-architecture", ".claude\skills\dooph-ds-codebase", ".claude\skills\dooph-ds-contribution"
cmd /c mklink /D ".claude\skills\dooph-ds-architecture" "..\..\.agents\skills\dooph-ds-architecture"
cmd /c mklink /D ".claude\skills\dooph-ds-codebase" "..\..\.agents\skills\dooph-ds-codebase"
cmd /c mklink /D ".claude\skills\dooph-ds-contribution" "..\..\.agents\skills\dooph-ds-contribution"
```

Verify with `cmd /c dir /AL ".claude\skills"` — each entry should show `<SYMLINKD>`.
