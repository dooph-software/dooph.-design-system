# Responsive Modal ↔ Sheet Pattern

A common consuming-project pattern: render dialog content in a **Modal** on
wide viewports and in a **Sheet** below a breakpoint (e.g. bottom sheet on
mobile). The design system deliberately does **not** ship a prebuilt
swapping component — breakpoints and swap behavior are app decisions — but
because `Modal` and `Sheet` both wrap the same Radix Dialog primitive, their
parts map 1:1 and a thin app-side wrapper is all you need.

## Part mapping

| Modal              | Sheet              | Notes                                   |
| ------------------ | ------------------ | --------------------------------------- |
| `Modal`            | `Sheet`            | Same root props (`open`, `onOpenChange`, `modal`) |
| `ModalTrigger`     | `SheetTrigger`     | Both support `asChild`                  |
| `ModalContent`     | `SheetContent`     | Sheet adds `side` (`SheetSide.*`); both have `withOverlay` |
| `ModalClose`       | `SheetClose`       | Both support `asChild`                  |
| `ModalTitle`       | `SheetTitle`       | Required for a11y (use `sr-only` if undesigned) |
| `ModalDescription` | `SheetDescription` | Optional                                |

Because the roots are both Radix `Dialog.Root`, controlled state, focus
management, dismissal, and portal behavior are identical — only the panel
geometry and animation differ. Children pass through unchanged.

## Implementation

### 1. Breakpoint hook (app-side)

```tsx
"use client";
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

### 2. Wrapper that swaps primitives

```tsx
"use client";
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
  trigger: React.ReactNode;
  title: string;
  children: React.ReactNode;
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
  <div className="p-6">{/* same content in both presentations */}</div>
</ResponsiveDialog>
```

## Notes

- **Content is shared, chrome swaps.** Keep the children presentation-agnostic
  (no assumptions about panel width/height); style with tokens as usual.
- **Crossing the breakpoint while open** unmounts one Radix root and mounts the
  other, so the dialog closes on swap unless you control `open` yourself. In
  practice a resize-while-open is rare; controlled `open` covers it if needed.
- **SSR:** the third `useSyncExternalStore` argument is the server snapshot —
  choose the variant that matches your primary audience to minimize hydration
  flicker.
- Prefer `SheetSide.bottom` for mobile swaps (thumb-reachable, platform-familiar);
  `left`/`right` suit nav/inspector panels rather than dialog replacements.
