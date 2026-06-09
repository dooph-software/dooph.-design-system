---
name: dooph-design-system-composition
description: Use when building or extending UI with @dooph-software/design-system components and you need guardrails for composing, wrapping, or adding local components without damaging design consistency.
metadata:
  short-description: Compose dooph UI system without visual drift
---

# dooph Design System Composition

Use package primitives as the interaction and visual baseline. Extend by composition first, wrapper components second, and package changes only when a pattern repeats across products.

## Decision Order

1. Use an exported component directly.
2. Compose exported components with layout utilities.
3. Create a local wrapper when a product repeats a domain-specific pattern.
4. Add to the design system package only when the primitive is generic, reusable, and token-driven.

## Composition Rules

- Layout classes are fine: `flex`, `grid`, `gap-*`, `items-*`, `w-*`, responsive variants.
- State/brand classes should use package tokens: `bg-surface`, `text-text`, `border-border`, `shadow-menu`, `text-style-*`
- Prefer `Button` variants over custom color classes.
- Prefer `DropdownMenu*` and `Tabs*` over hand-rolled ARIA interactions.
- Use `DropdownMenuContent portalProps` or `portal={false}` for special mount contexts rather than replacing menu internals.
- Use `TwoWayToggle variant` and `size` on the root for group-level defaults; item props may override locally.
- Use `Modal` / `ModalContent` for all dialog-style overlays. Always include a `ModalTitle` for screen readers; use `className="sr-only"` when the design has no visible title. Do not build custom overlays with `position: fixed` and manual focus traps.
- Use `SearchBox` for search inputs — it composes the icon, input, and optional hotkey indicator as a unit.
- Use `OutlineSection` as a composable shell for toolbars or grouped controls that need the double-border treatment.
- Use `OutlineButton` for hero-level CTAs with the accent blur hover effect. Override `--ui-accent-color` in the app theme to match the brand. Use `glowColor1`/`glowColor2` for per-instance orb color overrides; use `glowing` for an always-visible (non-hover) glow driven by app logic; use `inverseTheme` when the button sits on a surface where the default secondary surface would blend in.
- Use `ShapeButton` with the `ShapeButtons` enum (`Clover`, `Cookie`, `Pentagon`, `Gem`) for icon buttons requiring an organic shape background.

## Wrapper Pattern

```tsx
import { Button, ButtonVariant, type ButtonProps, cn } from '@dooph-software/design-system';

type SaveButtonProps = ButtonProps & {
  busy?: boolean;
};

export function SaveButton({ busy, className, children = 'Save', ...props }: SaveButtonProps) {
  return (
    <Button
      variant={ButtonVariant.primary}
      className={cn(className)}
      aria-busy={busy || undefined}
      disabled={busy || props.disabled}
      {...props}
    >
      {children}
    </Button>
  );
}
```

Do not bake brand colors, pixel shadows, or private font stacks into wrappers. If the wrapper needs a visual distinction, add or map tokens in the app theme first.

### Using `cn` from the package

Always import `cn` from `@dooph-software/design-system` rather than creating an independent `tailwind-merge` instance. The package configures tailwind-merge with a dedicated conflict group for `text-style-*` typographic utilities. Without this configuration, tailwind-merge's catch-all rule classifies any unknown `text-{word}` class as a text-color utility — so `text-style-button` gets silently erased whenever a color class like `text-primary-fg` or `text-text` appears later in the same class string.

If your project uses its own merge utility alongside the package `cn`, replicate the same registration:

```ts
import { extendTailwindMerge } from 'tailwind-merge';

export const twMerge = extendTailwindMerge<'text-style'>({
  extend: {
    classGroups: {
      'text-style': [
        'text-style-button',
        'text-style-body',
        'text-style-label',
        'text-style-title',
        'text-style-heading',
        'text-style-hero',
      ],
    },
  },
});
```

Without this, any local component that applies a `text-style-*` class alongside a `text-{color}` class will silently lose its typography — correct 14px body size, font-variation-settings, and optical sizing axes will all be missing.

### TypeableDropdownTrigger

`TypeableDropdownTrigger` must always be composed as the child of `DropdownMenuTrigger asChild`. Do not render it standalone.

```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <TypeableDropdownTrigger
      placeholder="Search…"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  </DropdownMenuTrigger>
  <DropdownMenuContent focusOnOpen={false}>
    {/* items */}
  </DropdownMenuContent>
</DropdownMenu>
```

Key constraints:

- **`type` is not a prop.** The input is always `type="text"`. Omitting `type` from the prop surface is intentional: Radix's `DropdownMenuTrigger asChild` uses `Slot` which injects `type="button"` from its internal primitive. If `type` were accepted, that injected value would reach the `<input>` and make it a non-typeable button field. Do not attempt to work around this.
- **Always set `focusOnOpen={false}` on `DropdownMenuContent`** when using `TypeableDropdownTrigger`. This prevents Radix from stealing focus from the input when the menu opens.
- The component exposes `inputRef` for imperative access to the underlying `<input>` element when you need to focus or read it programmatically.

## Review Checklist

- Does this duplicate an exported dooph component?
- Are all colors, radii, shadows, typography, and component heights token-based?
- Is `@dooph-software/design-system/styles.css` imported before app theme CSS?
- Does the component still work under `.dark` and root token overrides?
- Are Radix components still responsible for menu/tab/toggle accessibility?
- Is this product-specific enough to live in the app, or generic enough to contribute upstream?

## Anti-Patterns

- `style={{ color: '#...' }}` or inline CSS variables on individual components.
- Arbitrary Tailwind values for brand styling, e.g. `bg-[#123456]`, when a token should exist.
- Copying internal package class strings into local components as a fork.
- Replacing Radix-backed behavior with custom click/focus code.
- Creating one-off variants that should be root token overrides.
