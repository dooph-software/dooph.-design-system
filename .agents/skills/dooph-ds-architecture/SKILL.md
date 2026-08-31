---
name: dooph-ds-architecture
description: Use when writing, changing, or reviewing any code inside the @dooph-software/design-system repository itself — adding a component, changing a prop or API, editing tokens or styles, or reviewing a PR against this repo. Read it before writing the code, not after. Not for consuming projects; those use the shipped skills/ folder.
---

# dooph Design System — Architecture Rules

This is the authoring-side skill for the `@dooph-software/design-system` package. It governs how the package itself is built and maintained. It is NOT the skill for consuming projects (those use the distributed `skills/` folder).

---

## Rule 1: Dot-Accessible Variant/Size Enums

Every component with discrete options MUST export a `const` object that callers can dot-access for IntelliSense. No string literals in consuming code, ever.

### Required pattern

```ts
export const ButtonVariant = {
  primary: "primary",
  secondary: "secondary",
  brand: "brand",
  danger: "danger",
  ghost: "ghost",
  text: "text",
} as const;
export type ButtonVariant = (typeof ButtonVariant)[keyof typeof ButtonVariant];
```

The type is always derived from the const — never a hand-written union type that duplicates the keys.

v3 renamed `ButtonVariant.destructive` → `ButtonVariant.danger` (matching the Figma `dangerButton` token group and `--ui-color-danger*`). `destructive` no longer exists — do not reintroduce it.

### Naming conventions

| Object name        | Prop name | Example usage                                                 |
| ------------------ | --------- | ------------------------------------------------------------- |
| `ButtonVariant`    | `variant` | `<Button variant={ButtonVariant.primary} />`                  |
| `ButtonSize`       | `size`    | `<Button size={ButtonSize.sm} />`                             |
| `TabVariant`       | `variant` | `<TabsTrigger variant={TabVariant.ghost} />`                  |
| `TabSize`          | `size`    | `<TabsTrigger size={TabSize.icon} />`                         |
| `ToggleVariant`    | `variant` | `<TwoWayToggleItem variant={ToggleVariant.primary} />`        |
| `ToggleSize`       | `size`    | `<TwoWayToggle size={ToggleSize.sm} />`                       |
| `SegmentedVariant` | `variant` | `<SegmentedTabSelect variant={SegmentedVariant.secondary} />` |
| `TextDropdownSize` | `size`    | `<TextDropdownTrigger size={TextDropdownSize.sm} />`          |
| `ShapeButtons`     | `shape`   | `<ShapeButton shape={ShapeButtons.gem} />`                    |
| `SheetSide`        | `side`    | `<SheetContent side={SheetSide.right} />`                     |
| `TextVariant`      | `variant`    | `<BaseText variant={TextVariant.body} />`                          |
| `CheckboxChecked`  | `checked`    | `<Checkbox checked={CheckboxChecked.indeterminate} />`             |
| `CopyButtonVariant` | `variant` | `<CopyButton variant={CopyButtonVariant.secondary} value="npm install" />` |
| `DropdownMenuVariant` | `variant` | `<DropdownMenu variant={DropdownMenuVariant.complex} />` (width floor, inherited by content via context) |

### The open-value exception

A closed set of choices uses the enum above. A prop whose value is a **design
value** — a colour, a size, a weight — must ALSO accept a raw value, because the
set cannot be closed: a provider brand colour or a 450 weight will never be in
our const. Those props take a const of `var(--ui-*)` **strings** instead of keys:

```ts
export const FontWeights = {
  regular: 'var(--ui-weight-regular)',
  medium: 'var(--ui-weight-medium)',
} as const;
export type FontWeightValue = FontWeight | (string & {}) | number;
```

- The value IS the var reference, so resolution is a no-op and a consumer's token
  override still applies. No lookup table to silently mis-map.
- `(string & {})` keeps dot-access in autocomplete while admitting any CSS value.
- Numbers resolve per property (`fontSize` → px, `lineHeight` → unitless ratio).

Used by `Fonts` / `FontSizes` / `FontWeights` / `Tracking` (`BaseText`) and
`DS_COLOR_TOKENS` via the `color` prop (`Slider*`, `LinearProgressIndicator`).
When a variant enum would only ever wrap design values, prefer this — it is why
`SliderVariant` and `LinearProgressVariant` were deleted rather than extended.

### Props that are design values are inline style, not classes

A prop like `fontSize` or `color` MUST be emitted as inline style. Class-based
props lose to whichever class the bundler emits later, which is not something the
package controls — the old class-based `fontSize`/`fontFamily` silently did
nothing for two releases for exactly this reason. Role/variant DEFAULTS stay
classes (so consumers can override them); explicit props go inline.

### Invariants

- Const keys are **camelCase** (e.g. `iconSm`, not `IconSm` or `icon-sm`). The string VALUE may differ (`"icon-sm"` to match cva key).
- The const object and the derived type share the **same identifier** (TypeScript allows a value and a type to share a name).
- All these exports must be re-exported from `src/index.ts`.
- Prop name is always `variant` (not `styleVariant`, not `type`, not `kind`). Size prop is always `size`. The only exceptions are geometry props with established Radix/industry names: `shape` (ShapeButton) and `side` (SheetContent, matching Radix's own `side` convention).

---

## Rule 2: Radix UI — Idiomatic Usage

This package wraps Radix UI primitives. The wrappers are thin and must never fight the primitives.

### Required patterns

```tsx
// Always forwardRef + spread all props + merge className
const DropdownMenuItem = forwardRef<
  ComponentRef<typeof DropdownMenuPrimitive.Item>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(baseStyles, className)}
    {...props}
  />
));
DropdownMenuItem.displayName = "DropdownMenuItem";
```

### State styling via data attributes (not JavaScript)

Radix sets these automatically — style against them, never toggle classes in JS:

- `data-[state=open]`, `data-[state=closed]`
- `data-[state=checked]`, `data-[state=unchecked]`, `data-[state=indeterminate]`
- `data-[state=active]`, `data-[state=on]`, `data-[state=off]`
- `data-[disabled]`, `data-[highlighted]`

### DropdownMenu defaults

- **`modal={false}`** on `DropdownMenu` root (package default; Radix default is `true`). Keeps the rest of the page interactable while a menu is open. Pass `modal={true}` when dialog-like focus trapping is required.
- **`matchTriggerWidth`** defaults to `true` on `DropdownMenuContent` — sets width to the Radix trigger width, floored by `--ds-menu-min-w` (`ds-radix-dropdown-match-trigger-width`). `DropdownMenuVariant` on the root sets that floor via `ds-menu-w-standard`/`-action`/`-complex` and flows down through context; `DropdownMenuContent variant` overrides one panel.
- **`DropdownMenuSection`** wraps item groups with horizontal inset (`ds-px-ui-xs`). `DropdownMenuContent` has no horizontal padding so `DropdownMenuSeparator` spans edge-to-edge.
- **`TypeableDropdownTrigger`**: render as child of `DropdownMenuTrigger asChild`. The component root is a `<div>` (ref + Radix trigger props); the nested `<input>` receives typing. `onPointerDown` is state-aware and pre-focuses the input before calling Radix's handler: for input or chrome clicks that **open** the menu, `inputElRef.current.focus()` is called first (synchronously), then Radix's handler opens the menu. For input clicks when the menu is **already open**, the handler is suppressed entirely (preserves typing without toggling). Chrome clicks when the menu is open call Radix directly (closing). Pair with **`DropdownMenuContent focusOnOpen={false}`** so open does not steal focus to the panel. Pre-focusing before Radix is critical — Radix's non-modal `DismissableLayer` closes the menu when `focusin` fires outside the content after mount; focusing before the open means the `focusin` fires before the layer exists and is ignored. Optional `inputRef` for imperative input access. Open/focus styling uses `data-[state=open]` and `focus-within:` — no `open` prop.

### Portal pattern

Overlay/floating content defaults to portalled (`portal={true}` on `DropdownMenuContent`). Always expose an escape hatch:

```tsx
const DropdownMenuContent = forwardRef(
  ({ portal = true, portalProps, ...props }, ref) => {
    const content = <DropdownMenuPrimitive.Content ref={ref} {...props} />;
    return portal ? (
      <DropdownMenuPrimitive.Portal {...portalProps}>
        {content}
      </DropdownMenuPrimitive.Portal>
    ) : (
      content
    );
  },
);
```

### Never do

- `e.stopPropagation()` / `e.preventDefault()` on Radix internal event handlers
- Replace Radix focus management with custom JS focus traps
- Use `forceMount` unless integrating an external animation library
- Hard-code Radix internal class names

### Installing new Radix primitives

Add to `dependencies` in `package.json` (runtime dep, not devDependency). Follow the exact same forwardRef wrapper pattern as `Modal.tsx` or `DropdownMenu.tsx`.

---

## Rule 3: TSX Composability

Components must not lock consumers into a fixed internal content structure. Children must flow freely into the underlying interactive element.

### Required

```tsx
// Children reach the real DOM element
<Button variant={ButtonVariant.primary}>
  <StarIcon />
  <ButtonText>Save draft</ButtonText>
</Button>

// Inset layout in menu items
<DropdownMenuItem>
  <div className="flex w-full justify-between">
    <ButtonText>Settings</ButtonText>
    <LabelText>⌘,</LabelText>
  </div>
</DropdownMenuItem>
```

### Polymorphism via `asChild`

Leaf interactive components (Button, DropdownTrigger, TextDropdownTrigger, OutlineButton, ShapeButton) support `asChild` via `@radix-ui/react-slot`. This lets consumers render them as `<Link>`, `<a>`, or any other element without losing interaction behavior.

```tsx
// Consumer can do:
<Button asChild variant={ButtonVariant.primary}>
  <Link href="/settings">Settings</Link>
</Button>
```

### Layout-necessity exceptions

Wrapping children in a layout span is acceptable ONLY when visually required and the wrapper is not interactive. Examples:

- `OutlineButton` wraps children in `<span className="relative z-10 ...">` to layer above blur orbs — acceptable.
- `DropdownMenuCheckboxItem` wraps text children in `<span className="flex flex-1">` to push indicator right — acceptable.
- `Avatar` is a composable display shell; consumers pass logo/img/icon content as `children`. Do not add app-level logo providers or asset URL props to the package component.

### Never

- Render an intermediate `div` or `span` around `children` unless it's for a documented layout necessity.
- Put interactive elements inside the wrapper that would create nested button/button or button/link issues.

---

## Rule 4: Framework-Agnostic Font System

The package defines font tokens but loads NO font files.

### What the package owns

- Per-role font family tokens in `tokens.css` — `--ui-font-body`, `--ui-font-button`, `--ui-font-heading`, `--ui-font-label`, `--ui-font-title`, `--ui-font-hero`, `--ui-font-mono` — stacks pointing to named families the consumer is responsible for loading. Each text role is independently overridable (defaults: body/button/heading → Google Sans Flex, label → Host Grotesk, title/hero → Bricolage Grotesque, mono → Google Sans Code). The mono stack falls back to `ui-monospace` and friends rather than bare `monospace`, whose browser default is both smaller than surrounding text and, on Windows, Courier New.
- Per-role size and weight tokens. `--ui-text-mono` and `--ui-weight-mono` ALIAS `--ui-text-body` and `--ui-weight-button`, so a consumer who retunes button type keeps mono at the same optical scale; overriding either token directly breaks the link on purpose.
- `--ui-font-var-button/body/heading` — `font-variation-settings` values for Google Sans Flex axes (`GRAD`, `ROND`, `slnt`, `wdth`) — and `--ui-font-var-mono`, which names Google Sans Code's `MONO` axis at 1. Naming MONO is load-bearing rather than decorative: the family has a proportional cut at MONO 0, so trusting the family default does not get you fixed advances. Roles whose faces implement no axes (label/title/hero) ship no token. `BaseText`'s `axes` prop APPENDS to the role token (duplicate axes resolve last-wins) so naming one axis keeps the rest — which is also why a role with no token must emit axes standalone: `var(--undefined), "GRAD" 20` invalidates the whole declaration.
- `text-style-*` role classes in `index.css`, in **`@layer components`** — composite font classes referencing the tokens above. The layer is deliberate: it loses to `utilities`, so consumer overrides work.

### What the package deliberately does NOT own

**Line height.** No leading token, no role sets `line-height`. A single hardcoded
value cannot serve both display type and reading copy across every consumer, and
when it was pinned at `1` it also silently beat every consumer override. Leading
belongs to the consuming app; `BaseText`'s `lineHeight` prop covers the per-call
case. Do not reintroduce it.

### What the package must never do

- Import from `next/font/google` or `next/font/local`.
- `@font-face` declarations in any `.css` file that ships in the package.
- Fetch or reference any font file URL in component code.

### Storybook font loading (`preview-head.html`)

Storybook loads fonts via Google Fonts CDN for internal review. This file is NOT shipped. Every axis a `--ui-font-var-*` token names MUST appear in the URL, **as a range**:

```
Google+Sans+Flex:GRAD,ROND,opsz,slnt,wdth,wght@0..100,0..100,6..144,-10..0,25..151,1..1000
Google+Sans+Code:MONO,ital,wght@0..1,0,300..800
```

Omit an axis, or pin it to a single value (`MONO@1` rather than `MONO@0..1`), and Google Fonts serves a file that does not carry the axis at all — `font-variation-settings` then fails silently and the face renders in its default cut. Axes are ordered uppercase-first, then lowercase, each alphabetically; get the order wrong and the request 404s, which at least fails loudly.

### Consuming project responsibilities

- Load Google Sans Flex (all axes), Host Grotesk, Bricolage Grotesque, and Google Sans Code (with its `MONO` axis) by any means appropriate to their framework.
- Map the loaded font family names into the per-role tokens (`--ui-font-body`, `--ui-font-button`, `--ui-font-heading`, `--ui-font-label`, `--ui-font-title`, `--ui-font-hero`, `--ui-font-mono`) in their root CSS. Overriding a single role (e.g. only `--ui-font-button`) is supported and leaves the others at their defaults.
- In Next.js: use `next/font/google` with `variable` option + `axes` array, then map the CSS variable to the dooph token.

---

## Rule 5: Theme Logic Belongs In Tokens, Not Components

The package ships CSS tokens and semantic component helpers. It must not detect app theme state at runtime.

### Required

- Express theme-dependent component behavior through `--ui-*` tokens on `:root`/`.light` and `.dark`.
- Use Tailwind utilities generated from tokens or `ds-*` helpers for token combinations that Tailwind cannot express cleanly.
- Keep mode-invariant tokens only in `:root`/`.light`; add `.dark` overrides only when the value actually changes.
- For inverse surfaces such as `TooltipContent`, define semantic tokens (`--ui-color-tooltip-inverse-*`, `--ui-color-tooltip-matching-*`) and switch classes, not theme state.

### Never

- Read `document.documentElement`, `classList`, `matchMedia`, or `localStorage` inside package components to infer theme.
- Use `MutationObserver` to watch app theme classes.
- Add React context providers for app-owned branding assets such as logos.
- Import or assume framework-specific asset systems (`next/image`, Vite public URLs, env vars) in package components.

---

## Rule 6: Motion Belongs In Tokens And CSS, Not In JavaScript

Same shape as Rule 5. A duration, an easing curve, or a reduced-motion decision
is a design value, so it lives in `tokens.css` and is consumed by CSS. A
component may own the *geometry* of a motion; it must not own its *timing*.

### Required

- Every animated component gets a `--ui-<component>-*` family: at minimum a
  duration and an ease. Existing families: `--ui-roll-hover-*`,
  `--ui-underline-link-*`, `--ui-rolling-digits-*`, `--ui-sidebar-icon-*`.
- Reduced motion is a `@media (prefers-reduced-motion: reduce)` block in CSS,
  never a `matchMedia` call in a component. (Rule 5 already forbids `matchMedia`
  for theme; this is the same prohibition for motion.)
- Prefer a **transition** for a value that changes repeatedly, and an
  **animation** for something that happens once in an element's life.
  Re-applying a class that is already present does not restart an animation, so
  a keyframe used for a repeating change fires on roughly every other change. A
  transition on a changed value always runs, and an interrupted one retargets
  from wherever it currently sits. Conversely, a mount animation needs no
  JavaScript at all to start — reach for it before reaching for a frame
  callback.

### The escape hatch, for properties CSS cannot interpolate

Some things genuinely cannot be transitioned everywhere — SVG path `d` is the
live example. The pattern is to keep CSS in charge of the timing anyway:

1. Register the animation's inputs as numbers: `@property --ds-thing-t { syntax: "<number>"; inherits: false; initial-value: 0; }`. Unregistered custom properties are token strings and jump rather than interpolate.
2. Transition them in a `ds-*` class using the component's tokens.
3. Set the TARGET values as inline style from props.
4. Sample the interpolated values in a self-terminating `requestAnimationFrame` loop and write the un-interpolatable attribute.

The component then holds no duration, no easing and no reduced-motion branch;
interruption is handled natively by the transition; and where `@property` is
unsupported the value jumps to target, the loop writes once and stops, degrading
cleanly to instant.

### Never

- Hardcode a duration or easing curve in a component (`const DURATION_MS = 220`,
  a hand-rolled `easeOutCubic`). Both have shipped here and both had to be
  removed.
- Mirror a CSS duration in a JS constant in order to stage two motions against
  each other. The mirror desyncs — `RollingDigitsText` staged a fade against a
  roll this way and the roll overran the fade. Motion that must agree with a CSS
  duration is expressed in CSS.
- Reach for a timer, a frame callback or a `transitionend` before checking
  whether a mount animation or a plain transition already does the job.

---

## Rule 7: A Component Owns Only Its Own Subtree

A component may attach listeners to elements it renders. It must not go looking
up the tree for one it does not own.

### Never

- `el.closest("button, a, [role=button]")` (or any ancestor query) to find
  something to bind to. `SidebarWithHoverIcon` did exactly this to detect hover
  on whatever button happened to contain it: implicit, silently inert when the
  icon sat in a plain `<div>`, and it leaked six listeners onto a node whose
  lifetime it did not control.
- `addEventListener` on `document` or `window` for anything other than a genuine
  global concern (an open overlay's dismissal, which Radix already owns).

### Instead

State that belongs to an interactive ancestor is a **controlled prop**. If the
icon needs to know the button is hovered, the button tells it:

```tsx
<Button onPointerEnter={() => setHovered(true)} onPointerLeave={() => setHovered(false)}>
  <SidebarWithHoverIcon side={side} hovered={hovered} />
</Button>
```

Three lines at the call site, versus a component that reaches outside itself.
Where the state is purely visual and CSS can see it, prefer `.group` +
`group-hover:` and no JavaScript at all.
