# Responsive Modal ↔ Sheet Pattern

A common consuming-project pattern: render dialog content in a **Modal** on
wide viewports and in a **Sheet** below a breakpoint (e.g. bottom sheet on
mobile). The design system does **not** ship a prebuilt swapping component:
breakpoints and swap behavior are app decisions. Because `Modal` and `Sheet`
both wrap the same Radix Dialog primitive, their parts map 1:1 and a thin
app-side wrapper is all you need.

## Part mapping

| Modal              | Sheet              | Notes                                   |
| ------------------ | ------------------ | --------------------------------------- |
| `Modal`            | `Sheet`            | Same root props (`open`, `onOpenChange`, `modal`) |
| `ModalTrigger`     | `SheetTrigger`     | Both support `asChild`                  |
| `ModalContent`     | `SheetContent`     | Sheet adds `side` (`SheetSide.*`, default `right`); both have `withOverlay`, `portal` and `portalProps` |
| `ModalClose`       | `SheetClose`       | Both support `asChild`                  |
| `ModalTitle`       | `SheetTitle`       | Names the panel for assistive tech; always include one (`className="sr-only"` if the design shows no title) |
| `ModalDescription` | `SheetDescription` | Optional                                |

Because the roots are both Radix `Dialog.Root`, controlled state, focus
management, dismissal, and portal behavior are identical — only the panel
geometry and animation differ. Children pass through unchanged.

Both contents are raw: no internal padding or flex layout, and `ModalContent`
sets no width. Give the content its own padding with the spacing words.
Left/right sheets default to `w-3/4 max-w-96`, so a custom width needs a
`max-w-*` too; top/bottom sheets size to their content.

## Implementation

### 1. Breakpoint hook (app-side)

```tsx
import { useSyncExternalStore } from "react";

const QUERY = "(min-width: 768px)"; // your breakpoint

export function useIsDesktop() {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(QUERY);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(QUERY).matches,
    () => true, // SSR fallback — pick the variant you prefer to hydrate as
  );
}
```

The hook module needs no `"use client"`: only the client wrapper below imports it.

### 2. Wrapper that swaps primitives

```tsx
"use client";
import type { ReactNode } from "react";
import {
  Modal, ModalTrigger, ModalContent, ModalTitle,
  Sheet, SheetTrigger, SheetContent, SheetTitle, SheetSide,
} from "@dooph-software/design-system";
import { useIsDesktop } from "./useIsDesktop";

export function ResponsiveDialog({
  trigger,
  title,
  children,
  open,
  onOpenChange,
}: {
  trigger: ReactNode;
  title: string;
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const isDesktop = useIsDesktop();

  if (isDesktop) {
    return (
      <Modal open={open} onOpenChange={onOpenChange}>
        <ModalTrigger asChild>{trigger}</ModalTrigger>
        <ModalContent>
          <ModalTitle className="sr-only">{title}</ModalTitle>
          {children}
        </ModalContent>
      </Modal>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side={SheetSide.bottom}>
        <SheetTitle className="sr-only">{title}</SheetTitle>
        {children}
      </SheetContent>
    </Sheet>
  );
}
```

### 3. Usage

```tsx
<ResponsiveDialog trigger={<Button>Filters</Button>} title="Filters">
  <div className="p-lg">{/* same content in both presentations */}</div>
</ResponsiveDialog>
```

This works from a Server Component page: `trigger` and `children` are elements,
which can cross into the client wrapper. `onOpenChange` is a function, so pass
it only from client code.

## Notes

- **Content is shared, chrome swaps.** Keep the children presentation-agnostic
  (no assumptions about panel width/height); style with tokens as usual, and
  set text with Text components.
- **Crossing the breakpoint while open** unmounts one Radix root and mounts the
  other, so the dialog closes on swap unless you control `open` yourself. In
  practice a resize-while-open is rare; controlled `open` covers it if needed.
- **SSR:** the third `useSyncExternalStore` argument is the server snapshot —
  choose the variant that matches your primary audience to minimize hydration
  flicker.
- Prefer `SheetSide.bottom` for mobile swaps (thumb-reachable, platform-familiar);
  `left`/`right` suit nav/inspector panels rather than dialog replacements.
