---
name: dooph-ds-architecture
description: Load this skill whenever working inside the @dooph-software/design-system repository itself — maintaining, extending, or refactoring it. Enforces the four core architectural decisions that must never drift: (1) dot-accessible variant enums, (2) idiomatic Radix UI usage, (3) TSX composability, (4) framework-agnostic font system. Use this BEFORE writing any component code, making any API change, or reviewing a PR against this repo.
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
  destructive: "destructive",
  ghost: "ghost",
  text: "text",
} as const;
export type ButtonVariant = (typeof ButtonVariant)[keyof typeof ButtonVariant];
```

The type is always derived from the const — never a hand-written union type that duplicates the keys.

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
| `TextVariant`      | `variant`    | `<BaseText variant={TextVariant.body} />`                          |
| `TextFontFamily`   | `fontFamily` | `<BaseText fontFamily={TextFontFamily.heading} />`                 |
| `TextFontSize`     | `fontSize`   | `<BaseText fontSize={TextFontSize.label} />`                       |
| `TextFontWeight`   | `fontWeight` | `<BaseText fontWeight={TextFontWeight.semibold} />`                |
| `CheckboxChecked`  | `checked`    | `<Checkbox checked={CheckboxChecked.indeterminate} />`             |

### Invariants

- Const keys are **camelCase** (e.g. `iconSm`, not `IconSm` or `icon-sm`). The string VALUE may differ (`"icon-sm"` to match cva key).
- The const object and the derived type share the **same identifier** (TypeScript allows a value and a type to share a name).
- All these exports must be re-exported from `src/index.ts`.
- Prop name is always `variant` (not `styleVariant`, not `type`, not `kind`). Size prop is always `size`. Shape is the only exception (`shape`).

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
- **`matchTriggerWidth`** defaults to `true` on `DropdownMenuContent` — sets width to the Radix trigger width with `--ui-min-w-menu` as floor (`ds-radix-dropdown-match-trigger-width`).
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

- `--ui-font-sans`, `--ui-font-label`, `--ui-font-heading` in `tokens.css` — font family stacks pointing to named families the consumer is responsible for loading.
- `--ui-font-var-button/body/heading` — `font-variation-settings` values for Google Sans Flex axes (`GRAD`, `ROND`, `slnt`, `wdth`).
- `text-style-*` utility classes in `index.css` — composite font utilities that reference the tokens above.

### What the package must never do

- Import from `next/font/google` or `next/font/local`.
- `@font-face` declarations in any `.css` file that ships in the package.
- Fetch or reference any font file URL in component code.

### Storybook font loading (`preview-head.html`)

Storybook loads fonts via Google Fonts CDN for internal review. This file is NOT shipped. The Google Sans Flex URL MUST include all custom axes used by the design system:

```
GRAD,ROND,opsz,slnt,wdth,wght@0..100,0..100,6..144,-10..0,25..151,1..1000
```

Omitting any of these axes causes `font-variation-settings` to silently fail in Storybook.

### Consuming project responsibilities

- Load Google Sans Flex (all axes), IBM Plex Sans, and Bricolage Grotesque by any means appropriate to their framework.
- Map the loaded font family names into `--ui-font-sans`, `--ui-font-label`, `--ui-font-heading` in their root CSS.
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
