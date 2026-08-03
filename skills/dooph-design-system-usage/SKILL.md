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
   styled copy, and never reach for `font-sans` / `text-sm` to style text by hand
   — adjust type with the Text props (`fontSize`, `fontWeight`, …) instead.
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
<div className="p-md rounded-standard bg-surface-primary shadow-menu">
```

Bespoke stylesheet:

```css
/* ✗ src/styles/app.css — recreating layout the system already expresses inline */
.card { padding: 16px; border-radius: 18px; background: #fff; gap: 8px; }
.card__title { font-family: "Bricolage Grotesque"; font-size: 23px; }
```

```tsx
// ✓ express it in JSX with utilities + Text components; no app-authored CSS rules
<div className="flex flex-col gap-xs p-md rounded-standard bg-surface-primary">
  <TitleText>Card title</TitleText>
</div>
```

The only CSS an app should author is the `theme.css` token layer (`--ui-*`
overrides) covered by the theming skill — not per-component style rules.

## Component Inventory

Reach for these before writing local UI:

- **Actions:** `Button` (`ButtonVariant`: `primary` | `secondary` | `brand` |
  `danger` | `ghost` | `text`; `ButtonSize`: `default` | `sm` | `icon` |
  `iconSm` | `iconMicro`), `SplitButton` (+ `SplitButtonAction`, `SplitButtonTrigger`),
  `OutlineButton` (`inverseTheme`, `glowing`, `glowColor1`/`glowColor2`),
  `ShapeButton` (`ShapeButtons`: `arrow` | `clover` | `cookie` | `gem` |
  `pentagon` | `puff` | `star`), `CopyButton` (writes `value` to the clipboard,
  swaps its icon to a checkmark for 2s; `CopyButtonVariant`: `ghost` | `secondary`).
- **Inputs:** `Input`, `SearchBox`, `Checkbox`, `TwoWayToggle` (+ `TwoWayToggleItem`),
  `SliderContinuous` / `SliderStepped` / `SliderLabeled` (Radix Slider; `color`
  takes a token name or any CSS color, default `primary`; `SliderLabeled` adds
  `labels: { start, end }`).
- **Menus:** `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`,
  `DropdownMenuItem`, `DropdownMenuCheckboxItem`, `DropdownMenuLabel`,
  `DropdownMenuSeparator`, `DropdownMenuSection`.
- **Triggers:** `DropdownTrigger`, optional `DropdownTriggerContent`, `TypeableDropdownTrigger`, `TextDropdownTrigger`.
- **Navigation:** `Tabs` (+ `TabsList`, `TabsTrigger`, `TabsContent`),
  `SegmentedTabSelect` (+ `SegmentedTabItem`).
- **Overlays:** `Modal`, `ModalTrigger`, `ModalContent`, `ModalOverlay`,
  `ModalClose`, `ModalTitle`, `ModalDescription`; `Sheet` family — edge-anchored
  panel counterpart to Modal (`SheetContent side={SheetSide.left/right/top/bottom}`,
  plus `SheetTrigger`/`SheetClose`/`SheetTitle`/`SheetDescription`; always include
  a `SheetTitle`, `sr-only` when the design shows none); `Tooltip` family.
  For rendering the same content as a Modal on desktop and a Sheet under a
  breakpoint, see `references/responsive-sheet-modal.md` (app-side wrapper —
  intentionally not a packaged component).
- **Layout / surfaces:** `OutlineSection`, `Avatar`, `HotkeyIndicator`.
- **Data:** `Table` (+ `TableHeader`, `TableHeaderCell`, `TableRow`, `TableCell`,
  `TablePlaceholder`; sortable headers via `TableSortDirection`) — use this
  before hand-rolling a grid of divs for tabular data.
- **Links:** `TextLink` (body-text anchor; ghost foreground at rest, primary
  text on hover/active, no underline; `asChild` for `<Link>` composition).
- **Text & icons:** `BaseText` + the six role components — see **Text** below.
  `ShimmerText` (animated "working" sheen masked to child glyphs — children must
  not set an explicit text color), `RollChangeText` (rolls old content out / new
  content in when `changeKey` or string/number children change), `RollHoverText`
  (per-character roll on hover), `BaseIcon`, `ChevronDownIcon`, `SearchIcon`.
- **Feedback / motion:** `Toast` family, `LoadingSpinner`, `ProgressIndicator`,
  `LinearProgressIndicator` (Radix Progress; `color` as above), `WavyDivider`.
- **Utility:** `cn`.

If something genuinely doesn't exist, compose it from these primitives and
tokens — don't rebuild a styled lookalike.

## Styling With Tokens

Use the semantic, token-backed utilities. The common ones:

- Color: `bg-primary` / `text-primary-fg`, `bg-secondary`, `bg-surface-primary`,
  `bg-surface-secondary`, `bg-page-background`, `text-text` / `text-text-secondary` /
  `text-text-tertiary`, `border-border-primary` / `border-border-secondary` /
  `border-border-popovers` / `border-border-focus`, `bg-brand`, `text-brand-color`,
  `bg-danger`.
- Spacing (named, not numeric): `p-md`, `px-rg`, `gap-xs`, `m-lg` … stems are
  `xxs xs sm rg md lg xl xxl`.
- Radius: `rounded-tight` (controls), `rounded-standard` (triggers/inputs),
  `rounded-soft` (panels/modals).
- Shadow: `shadow-button`, `shadow-button-secondary`, `shadow-menu`, `shadow-focus-brand`, `shadow-focus-primary`, `shadow-focus-error`.
- Typography: never a Tailwind type utility by hand — see **Text** below.

## Text

Six roles, each a `BaseText` with its `variant` fixed: `HeroText`, `TitleText`,
`HeadingText`, `BodyText`, `ButtonText`, `LabelText`. Reach for `BaseText`
directly only to set `variant` dynamically.

Typography is set with **props, never classes**:

```tsx
import { BodyText, Fonts, FontSizes, FontWeights, Tracking, FontAxes } from "@dooph-software/design-system";

<BodyText font={Fonts.title} fontSize={FontSizes.heading} fontWeight={FontWeights.bold} />
<BodyText fontSize={16} fontWeight={450} lineHeight={1.6} letterSpacing={2} />
<HeroText as="h1" lineHeight={1.05}>Dashboard</HeroText>
```

| Prop | Takes | Number means |
| --- | --- | --- |
| `font` | `Fonts.*` or any CSS family list | — |
| `fontSize` | `FontSizes.*`, any CSS length | px |
| `fontWeight` | `FontWeights.*`, any CSS weight | the number (`450` works) |
| `lineHeight` | any CSS line-height | unitless ratio |
| `letterSpacing` | `Tracking.*`, any CSS length | px |
| `axes` | `{ [FontAxes.grade]: 40 }` | — |
| `unstyled` | boolean — drop the role's typography entirely | — |
| `as` | any element; keeps that element's prop typing | — |

The constants resolve to `var(--ui-*)`, so a consuming project's token overrides
still apply. Strings pass through untouched (`fontSize="clamp(2rem,6vw,3rem)"`),
which is why a raw `style={{ fontSize }}` is never needed.

**Precedence — prop > className > role.** Props are written inline so they always
win; the role class sits in the `components` layer so your own utilities
(`leading-[1.4]`, `text-2xl`) can override it. A `style` prop still outranks
props, as the last resort.

**Line height is not set by the design system.** Every role leaves it inheriting.
Set a baseline in your app's CSS and use `lineHeight` per instance.

**Variable font axes.** `axes` merges with the role's own axes, so naming one
leaves the rest intact. Only some faces implement a given axis — Google Sans Flex
has grade, roundness, slant, width, optical size; most faces have none — and
setting an axis a font lacks is a harmless no-op. Never pass `wght` here:
`font-variation-settings` outranks `font-weight` and would disable `fontWeight`.

### Two traps

**A Tailwind variant cannot apply `text-style-*`.** Variants only compose with
generated utilities, and `text-style-*` is a plain class from the package, so
`[&_h1]:text-style-title` emits **no CSS at all** — silently, no error. This bites
markdown/HTML renderers. Spell the role out in real utilities instead:

```
✗ [&_h1]:text-style-title
✓ [&_h1]:font-title [&_h1]:text-title [&_h1]:[font-variation-settings:var(--ui-font-var-heading)]
```

Applying `text-style-*` directly to an element you don't control (a native
`<input>`, a third-party child) is fine — it is only the *variant* form that fails.

**`cn` must come from the package.** It registers a `text-style` conflict group;
without it a later color class like `text-text` silently erases `text-style-body`
on the same element (plain tailwind-merge reads `text-style-body` as a text
color). If your app keeps its own merge helper, replicate the group:

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

- **`color` on `Slider*` / `LinearProgressIndicator`:** the one sanctioned place
  for a non-token color. Pass a token name (`color="text"`) whenever the design
  is a DS color; pass a raw CSS color only when the value is genuinely external
  and data-driven (`color={model.providerColor}`). It is not a shortcut around
  rule 3 — don't hardcode a brand hex there that a token already covers.
- **`Modal`:** use it for every dialog/overlay; never `position: fixed` +
  manual focus trap. Always include a `ModalTitle` (add `className="sr-only"`
  when there's no visible title) for screen readers.
- **`TypeableDropdownTrigger`:** only as a child of `DropdownMenuTrigger asChild`,
  and set `focusOnOpen={false}` on `DropdownMenuContent`. It has no `type` prop
  by design — don't try to add one.
- **`DropdownTriggerContent`:** optional consumer wrapper for trigger labels/meta;
  triggers do not add it automatically.
- **Radix-backed components** (menu, tabs, toggle, tooltip, modal) own
  accessibility. Don't replace them with div/button click handlers.
- **`OutlineButton`:** override `--ui-brand-color-alt` for the brand glow (both
  `glowColor1`/`glowColor2` default to it), or pass `glowColor1`/`glowColor2`
  per instance.

## Review Checklist

Before finishing UI work, confirm:

- [ ] No raw `<p>/<span>/<h1>/<label>` for styled text — Text components instead.
- [ ] No hand-rolled `<button>` or duplicated control — package components instead.
- [ ] No `#hex`, `px`, `style={{}}`, or `*-[…]` arbitrary values where a token exists.
- [ ] No app-authored per-component CSS rules — utilities in JSX instead.
- [ ] Type set with Text props, not `leading-*` / `tracking-*` / `text-<size>` / `font-*`.
- [ ] No `[&_…]:text-style-*` variants — they emit nothing.
- [ ] `cn` imported from the package; `text-style-*` not clobbered by color classes.
- [ ] Works under `.dark` and root token overrides (because it uses tokens).

For install order, font loading, dark-mode wiring, the Tailwind `theme.css`
preset, and rebranding token values, use **dooph-design-system-theming**.
