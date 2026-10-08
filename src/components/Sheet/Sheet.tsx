import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cva } from "class-variance-authority";
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ComponentRef,
} from "react";
import { cn } from "../../utils/cn";
import {
  DialogShellContent,
  DialogShellDescription,
  DialogShellOverlay,
  DialogShellTitle,
} from "../Modal/dialogShell";
import { SheetSide } from "./constants";

/* ── Root / Trigger / Portal / Close (thin pass-throughs) ─────────── */

const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;
const SheetPortal = DialogPrimitive.Portal;
const SheetClose = DialogPrimitive.Close;

/* ── Overlay (full-screen backdrop) ────────────────────────────────── */

/**
 * Backdrop: the shared dialog shell's base (`dialogShell.tsx`, which
 * `ModalOverlay` also uses), plus a fade on `ds-motion-overlay-sheet` so the
 * backdrop and the panel slide arrive together.
 */
const SheetOverlay = forwardRef<
  ComponentRef<typeof DialogPrimitive.Overlay>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogShellOverlay
    ref={ref}
    className={cn(
      "data-[state=open]:animate-in data-[state=open]:fade-in-0",
      "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
      "ds-motion-overlay-sheet",
      className,
    )}
    {...props}
  />
));
SheetOverlay.displayName = "SheetOverlay";

/* ── Content (the sliding panel itself) ────────────────────────────── */

/**
 * Per-side geometry + push animation. Like DropdownMenu, the panel shows only
 * the settle tail of the movement: it enters from a 20% offset (already 80%
 * of the way in) while fading in — the scale's `slow` step on the
 * long-deceleration `enter` curve — and exits 20% back out while fading,
 * `base` on the accelerating `exit` curve. Both come from
 * `ds-motion-overlay-sheet`, which the backdrop shares.
 * The slide distance must be an explicit value (`slide-*-[20%]`) — under
 * Tailwind v4 the unsuffixed `slide-*` resolves to the 0.25rem translate
 * DEFAULT, not the plugin's 100%.
 *
 * Takes the shared dialog surface (`dialogShell.tsx`) that `ModalContent`
 * also uses; the border sits only on the panel's inner edge.
 *
 * Default cross-axis size: left/right sheets are `w-3/4 max-w-96`, so a
 * consumer width needs a `max-w-*` override too (e.g. `max-w-none` next to the
 * width); top/bottom sheets size to their content (no default height).
 */
const sheetVariants = cva(
  cn(
    "fixed z-50",
    "data-[state=open]:animate-in data-[state=open]:fade-in-0",
    "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
    "ds-motion-overlay-sheet",
  ),
  {
    variants: {
      side: {
        left: cn(
          "inset-y-0 left-0 h-full w-3/4 max-w-96 border-r",
          "data-[state=open]:slide-in-from-left-[20%] data-[state=closed]:slide-out-to-left-[20%]",
        ),
        right: cn(
          "inset-y-0 right-0 h-full w-3/4 max-w-96 border-l",
          "data-[state=open]:slide-in-from-right-[20%] data-[state=closed]:slide-out-to-right-[20%]",
        ),
        top: cn(
          "inset-x-0 top-0 w-full border-b",
          "data-[state=open]:slide-in-from-top-[20%] data-[state=closed]:slide-out-to-top-[20%]",
        ),
        bottom: cn(
          "inset-x-0 bottom-0 w-full border-t",
          "data-[state=open]:slide-in-from-bottom-[20%] data-[state=closed]:slide-out-to-bottom-[20%]",
        ),
      },
    },
    defaultVariants: {
      side: SheetSide.right,
    },
  },
);

/* `side` is typed from the `SheetSide` const, not cva's `VariantProps`: that
 * admits `null`, which cva reads as "no variant" (an unpositioned sheet). */
export interface SheetContentProps
  extends ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  /** Edge the sheet slides in from. Defaults to `right`. */
  side?: SheetSide;
  /** When true, renders the overlay behind the sheet. Defaults to true. */
  withOverlay?: boolean;
  /** Render through a portal (the default) or in place. */
  portal?: boolean;
  /** Props for the portal, e.g. `container` or `forceMount`. */
  portalProps?: ComponentPropsWithoutRef<typeof DialogPrimitive.Portal>;
}

/**
 * Raw sheet primitive — no internal padding or flex layout, mirroring
 * `ModalContent`. Compose content directly inside:
 *
 * @example
 * <Sheet>
 *   <SheetTrigger asChild><Button>Open</Button></SheetTrigger>
 *   <SheetContent side={SheetSide.right} aria-label="Filters">
 *     <SheetTitle className="sr-only">Filters</SheetTitle>
 *     <div className="p-lg">Your custom content here.</div>
 *   </SheetContent>
 * </Sheet>
 *
 * IMPORTANT: Always include a SheetTitle for screen-reader accessibility.
 * Use className="sr-only" to visually hide it when the design has no title.
 */
const SheetContent = forwardRef<
  ComponentRef<typeof DialogPrimitive.Content>,
  SheetContentProps
>(
  (
    { className, side = SheetSide.right, withOverlay = true, ...props },
    ref,
  ) => (
    <DialogShellContent
      ref={ref}
      overlay={withOverlay ? <SheetOverlay /> : null}
      className={cn(sheetVariants({ side }), className)}
      {...props}
    />
  ),
);
SheetContent.displayName = "SheetContent";

/* ── Title & Description (a11y helpers) ─────────────────────────────── */

const SheetTitle = forwardRef<
  ComponentRef<typeof DialogPrimitive.Title>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>((props, ref) => <DialogShellTitle ref={ref} {...props} />);
SheetTitle.displayName = "SheetTitle";

const SheetDescription = forwardRef<
  ComponentRef<typeof DialogPrimitive.Description>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>((props, ref) => <DialogShellDescription ref={ref} {...props} />);
SheetDescription.displayName = "SheetDescription";

export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetOverlay,
  SheetPortal,
  SheetTitle,
  SheetTrigger,
};
