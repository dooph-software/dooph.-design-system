---
name: dooph-design-system-usage
description: Use whenever you build, implement, edit, or style ANY UI — a page, screen, component, form, button, text, menu, modal, layout — in a project that depends on @dooph-software/design-system. This system is opinionated: text goes through BaseText (never raw <p>/<span>/<h1>), interactive controls go through its components (never hand-rolled <button>), and visual values come from tokens via Tailwind utilities (never hardcoded px/hex or bespoke CSS). Load this before writing JSX or CSS so the UI matches the system the first time. For initial install, fonts, dark mode, or rebranding token values, use dooph-design-system-theming instead.
metadata:
  short-description: Build UI with dooph components, not one-off markup
---

# Using the dooph Design System

`@dooph-software/design-system` is an **opinionated** React + Tailwind v4 component
package. Its value comes from routing every piece of UI through shared primitives
and tokens so apps stay visually consistent and re-theme in one place. The most
common failure when an agent first touches this package is to ignore that and
write "normal" React: raw text tags, hand-built buttons, hardcoded pixels and
hex, and a hand-written `index.css`. That produces UI that *looks* fine in
isolation but silently breaks theming, dark mode, typography axes, and
consistency. This skill exists to prevent exactly that.

```tsx
import { Button, ButtonVariant, BodyText, DropdownMenu } from "@dooph-software/design-system";
import "@dooph-software/design-system/styles.css"; // required once, at the app entry
```

## Golden Rules

1. **Text → a Text component.** Every visible string renders through `BaseText`
   or a pre-composed variant (`BodyText`, `LabelText`, `HeadingText`, `TitleText`,
   `HeroText`, `ButtonText`). Never a bare `<p>`, `<span>`, `<h1>`, `<label>` for
   styled copy, and never reach for `font-sans` / `text-sm` to style text by hand.
2. **Controls → a package component.** Buttons, inputs, menus, tabs, toggles,
   modals, tooltips, search fields already exist with full states and a11y. Use
   them. Do not author a `<button>` with your own classes.
3. **Visual values → tokens via Tailwind utilities.** Color, spacing, radius,
   shadow, and type come from the token-backed utilities (`bg-primary`, `text-text`,
   `p-md`, `gap-sm`, `rounded-standard`, `shadow-menu`, `text-style-body`). Never
   hardcode `#hex`, `px`, `style={{…}}`, or arbitrary `bg-[#…]` for things a token
   covers.
4. **Style in JSX with utilities, not in a stylesheet.** Layout and composition
   live as Tailwind classes on the element. Do not create a bespoke `index.css` /
   `app.css` full of hand-written rules to style screens — that is the pattern this
   system replaces.
5. **`className` is for layout, not rebranding.** Use it for `flex`, `grid`,
   `gap-*`, sizing, positioning. To change how a component *looks* across the app,
   override `--ui-*` tokens (see `dooph-design-system-theming`), don't fork classes.

## Anti-Patterns → Fixes

Text:

```tsx
// ✗ raw element + manual font/size
<p className="font-sans text-sm text-gray-700">Saved automatically</p>
<h1 className="text-3xl font-bold">Dashboard</h1>

// ✓ Text components carry the right family, size, weight, tracking, and axes
<BodyText className="text-text-secondary">Saved automatically</BodyText>
<HeroText>Dashboard</HeroText>
```

Buttons / controls:

```tsx
// ✗ hand-rolled button with bespoke styling
<button
  className="rounded-md bg-black px-4 py-2 text-white hover:bg-zinc-800"
  onClick={save}
>
  Save
</button>

// ✓ the Button component owns variants, sizes, states, focus ring, shadow
<Button variant={ButtonVariant.primary} onClick={save}>Save</Button>
```

Hardcoded values:

```tsx
// ✗ pixels, hex, inline styles, arbitrary values
<div style={{ padding: 16, borderRadius: 18, background: "#fff" }}>
<div className="p-[16px] rounded-[18px] bg-[#ffffff] shadow-[0_1px_4px_rgba(0,0,0,.15)]">

// ✓ token-backed utilities — these re-theme and support dark mode for free
<div className="p-md rounded-standard bg-surface shadow-menu">
```

Bespoke stylesheet:

```css
/* ✗ src/styles/app.css — recreating layout the system already expresses inline */
.card { padding: 16px; border-radius: 18px; background: #fff; gap: 8px; }
.card__title { font-family: "Bricolage Grotesque"; font-size: 23px; }
```

```tsx
// ✓ express it in JSX with utilities + Text components; no app-authored CSS rules
<div className="flex flex-col gap-xs p-md rounded-standard bg-surface">
  <TitleText>Card title</TitleText>
</div>
```

The only CSS an app should author is the `theme.css` token layer (`--ui-*`
overrides) covered by the theming skill — not per-component style rules.

## Component Inventory

Reach for these before writing local UI:

- **Actions:** `Button` (`ButtonVariant`: `primary` | `secondary` | `brand` |
  `destructive` | `ghost` | `text`; `ButtonSize`: `default` | `sm` | `icon` |
  `iconSm`), `SplitButton` (+ `SplitButtonAction`, `SplitButtonTrigger`),
  `OutlineButton` (`inverseTheme`, `glowing`, `glowColor1`/`glowColor2`),
  `ShapeButton` (`ShapeButtons`: `Clover` | `Cookie` | `Pentagon` | `Gem`).
- **Inputs:** `Input`, `SearchBox`, `Checkbox`, `TwoWayToggle` (+ `TwoWayToggleItem`).
- **Menus:** `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`,
  `DropdownMenuItem`, `DropdownMenuCheckboxItem`, `DropdownMenuLabel`,
  `DropdownMenuSeparator`, `DropdownMenuSection`.
- **Triggers:** `DropdownTrigger`, `TypeableDropdownTrigger`, `TextDropdownTrigger`.
- **Navigation:** `Tabs` (+ `TabsList`, `TabsTrigger`, `TabsContent`),
  `SegmentedTabSelect` (+ `SegmentedTabItem`).
- **Overlays:** `Modal`, `ModalTrigger`, `ModalContent`, `ModalOverlay`,
  `ModalClose`, `ModalTitle`, `ModalDescription`; `Tooltip` family.
- **Layout / surfaces:** `OutlineSection`, `Avatar`, `HotkeyIndicator`.
- **Text & icons:** `BaseText` (+ `ButtonText`, `BodyText`, `LabelText`,
  `HeadingText`, `TitleText`, `HeroText`), `BaseIcon`, `ChevronDownIcon`,
  `SearchIcon`.
- **Feedback / motion:** `Toast` family, `LoadingSpinner`, `ProgressIndicator`,
  `WavyDivider`.
- **Utility:** `cn`.

If something genuinely doesn't exist, compose it from these primitives and
tokens — don't rebuild a styled lookalike.

## Styling With Tokens

Use the semantic, token-backed utilities. The common ones:

- Color: `bg-primary` / `text-primary-fg`, `bg-secondary`, `bg-surface`,
  `bg-surface-secondary`, `text-text` / `text-text-secondary` / `text-text-tertiary`,
  `border-border`, `bg-brand`, `bg-destructive`.
- Spacing (named, not numeric): `p-md`, `px-rg`, `gap-xs`, `m-lg` … stems are
  `xxs xs sm rg md lg xl xxl`.
- Radius: `rounded-tight` (controls), `rounded-standard` (triggers/inputs),
  `rounded-soft` (panels/modals).
- Shadow: `shadow-button`, `shadow-menu`, `shadow-focus`.
- Typography: prefer a Text component. If you must apply a type style to an
  existing element, use `text-style-body` / `-label` / `-heading` / `-title` /
  `-hero` / `-button` (these also set `font-variation-settings`, which no plain
  Tailwind class can).

### `cn` and the `text-style-*` merge trap

Import `cn` from the package, never a local `tailwind-merge`. The package
registers a `text-style` conflict group; without it, a later color class like
`text-text` silently erases a `text-style-body` on the same element (the default
catch-all treats `text-style-body` as a text-color utility and drops it). If your
app keeps its own merge helper, replicate the group:

```ts
import { extendTailwindMerge } from "tailwind-merge";
export const twMerge = extendTailwindMerge<"text-style">({
  extend: {
    classGroups: {
      "text-style": [
        "text-style-button", "text-style-body", "text-style-label",
        "text-style-title", "text-style-heading", "text-style-hero",
      ],
    },
  },
});
```

## Composition: Extend Without Drift

Work in this order — stop at the first that fits:

1. Use an exported component directly.
2. Compose exported components with layout utilities.
3. Wrap into a local component when a product-specific pattern repeats.
4. Contribute upstream only when the primitive is generic and token-driven.

Wrappers forward props and tokens; they never bake in brand colors, pixel
shadows, or private font stacks:

```tsx
import { Button, ButtonVariant, type ButtonProps } from "@dooph-software/design-system";

export function SaveButton({ busy, disabled, children = "Save", ...props }: ButtonProps & { busy?: boolean }) {
  return (
    <Button variant={ButtonVariant.primary} aria-busy={busy || undefined} disabled={busy || disabled} {...props}>
      {children}
    </Button>
  );
}
```

### Component constraints worth knowing

- **`Modal`:** use it for every dialog/overlay; never `position: fixed` +
  manual focus trap. Always include a `ModalTitle` (add `className="sr-only"`
  when there's no visible title) for screen readers.
- **`TypeableDropdownTrigger`:** only as a child of `DropdownMenuTrigger asChild`,
  and set `focusOnOpen={false}` on `DropdownMenuContent`. It has no `type` prop
  by design — don't try to add one.
- **Radix-backed components** (menu, tabs, toggle, tooltip, modal) own
  accessibility. Don't replace them with div/button click handlers.
- **`OutlineButton`:** override `--ui-accent-color` for the brand glow, or pass
  `glowColor1`/`glowColor2` per instance.

## Review Checklist

Before finishing UI work, confirm:

- [ ] No raw `<p>/<span>/<h1>/<label>` for styled text — Text components instead.
- [ ] No hand-rolled `<button>` or duplicated control — package components instead.
- [ ] No `#hex`, `px`, `style={{}}`, or `*-[…]` arbitrary values where a token exists.
- [ ] No app-authored per-component CSS rules — utilities in JSX instead.
- [ ] `cn` imported from the package; `text-style-*` not clobbered by color classes.
- [ ] Works under `.dark` and root token overrides (because it uses tokens).

For install order, font loading, dark-mode wiring, the Tailwind `theme.css`
preset, and rebranding token values, use **dooph-design-system-theming**.
