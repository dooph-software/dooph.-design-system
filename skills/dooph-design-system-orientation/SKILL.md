---
name: dooph-design-system-orientation
description: Use when working in a repo that consumes @dooph-software/design-system and you need to understand its purpose, component model, styling contract, or how to avoid one-off UI that bypasses the internal design system.
metadata:
  short-description: Use the dooph design system correctly
---

# dooph Design System Orientation

This design system is a React component package with framework-agnostic output. It should work in Next.js, Vite, and other React app shells. The app framework owns routing, data, server/client boundaries, fonts, and theme overrides; `@dooph-software/design-system` owns reusable primitives, interaction patterns, and tokenized visual styling.

## Import Contract

Use package components and CSS:

```tsx
import { Button, Input, DropdownMenu, DropdownMenuContent } from '@dooph-software/design-system';
import '@dooph-software/design-system/styles.css';
```

The CSS import is required. It defines default `--ui-*` tokens, Tailwind v4 `@theme inline` mappings, and composite utilities like `text-style-button`, `h-button`, and `shadow-button`. It does not load font files; consuming apps load fonts and map them into `--ui-font-sans`, `--ui-font-label`, and `--ui-font-heading`.

## Component Inventory

Prefer these exported pieces before creating local UI:

- Actions: `Button`, `SplitButton`, `SplitButtonAction`, `SplitButtonTrigger`, `OutlineButton` (`inverseTheme` bool; `glowing` bool; `glowColor1`/`glowColor2` strings — per-orb accent overrides), `ShapeButton` (`ShapeButtons` enum: `Clover` | `Cookie` | `Pentagon` | `Gem`)
- Inputs: `Input`, `SearchBox`, `TwoWayToggle`, `TwoWayToggleItem`
- Menus: `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuCheckboxItem`, `DropdownMenuLabel`, `DropdownMenuSeparator`, `DropdownMenuSection`
- Triggers: `DropdownTrigger`, `TypeableDropdownTrigger`, `TextDropdownTrigger`
- Navigation: `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`, `SegmentedTabSelect`, `SegmentedTabItem`
- Overlays: `Modal`, `ModalTrigger`, `ModalContent`, `ModalOverlay`, `ModalClose`, `ModalTitle`, `ModalDescription`
- Layout: `OutlineSection`
- Text and icons: `BaseText` (variant via `TextVariant`; optional `fontFamily`/`fontSize`/`fontWeight` overrides via `TextFontFamily`/`TextFontSize`/`TextFontWeight`), `ButtonText`, `BodyText`, `LabelText`, `BaseIcon`, `ChevronDownIcon`, `SearchIcon`
- Utility: `cn`

### Key variant surfaces

- `TabsTrigger` — `variant`: `ghost` (default) | `primary`; `size`: `default` | `sm` | `icon` | `icon-sm`
- `SegmentedTabSelect` — `variant`: `ghost` | `ghost-small` | `secondary` | `secondary-small` | `primary` | `primary-small`
- `TwoWayToggle` / `TwoWayToggleItem` — `variant`: `primary` | `secondary` | `ghost` (alias for secondary); `size`: `default` | `sm`
- `ModalContent` — `withOverlay`: boolean (default `true`); always include a `ModalTitle` (use `className="sr-only"` to visually hide it)

## Rules

- Do not recreate a local button/input/menu/tab that visually duplicates this package.
- Do not hardcode colors, shadows, radii, font stacks, or component dimensions in app components.
- Use exported variants and sizes first. Reach for `className` only for layout or rare state composition.
- Keep product-specific branding in tokens, not component forks.
- Keep font loading in the app shell. The package owns font tokens, not font delivery.
- For links or framework components, use polymorphic/as-child patterns where exposed.
- Treat Radix-backed components as accessibility primitives. Do not replace them with plain div/button menus unless the interaction is truly different.

## Mental Model

Default package styles are good enough for prototypes. Branded products should override the root token layer while continuing to use the same components. If UI starts drifting, fix the token contract or add a deliberate design-system component rather than sprinkling one-off Tailwind classes.
