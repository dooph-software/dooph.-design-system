"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ComponentRef,
} from "react";
import { cn } from "../../utils/cn";
import { SheetSide } from "./constants";

/* ── Root / Trigger / Portal / Close (thin pass-throughs) ─────────── */

const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;
const SheetPortal = DialogPrimitive.Portal;
const SheetClose = DialogPrimitive.Close;

/* ── Overlay (full-screen backdrop) ────────────────────────────────── */

/**
 * Shares the backdrop token + fade behavior with `ModalOverlay`
 * (bg-modal-backdrop, fade-in on open, fade-out on close) so sheets and
 * modals feel like one family. Durations match the panel slide so the
 * backdrop and panel arrive together.
 */
const SheetOverlay = forwardRef<
  ComponentRef<typeof DialogPrimitive.Overlay>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50",
      "bg-modal-backdrop",
      "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:duration-300",
      "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:duration-200",
      "motion-reduce:data-[state=open]:duration-0 motion-reduce:data-[state=closed]:duration-0",
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
 * of the way in) while fading in — 300ms on a long-deceleration curve — and
 * exits 20% back out while fading, 200ms accelerating.
 * The slide distance must be an explicit value (`slide-*-[20%]`) — under
 * Tailwind v4 the unsuffixed `slide-*` resolves to the 0.25rem translate
 * DEFAULT, not the plugin's 100%. The timing function is set as an arbitrary property because
 * `animation-timing-function` has no unambiguous utility (core `ease-*`
 * targets transitions).
 *
 * Uses the same surface/border/shadow tokens as `ModalContent`; the border
 * sits only on the panel's inner edge.
 *
 * Default cross-axis size (width for left/right, height for top/bottom) is a
 * sensible starting point and is fully overridable via `className`
 * (tailwind-merge lets consumer widths/heights win).
 */
const sheetVariants = cva(
  cn(
    "fixed z-50",
    "bg-modal-surface border-solid border-border-popovers",
    "shadow-menu overflow-hidden",
    "focus-visible:outline-none",
    "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:duration-300 data-[state=open]:[animation-timing-function:cubic-bezier(0.32,0.72,0,1)]",
    "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:duration-200 data-[state=closed]:[animation-timing-function:cubic-bezier(0.4,0,1,1)]",
    "motion-reduce:data-[state=open]:duration-0 motion-reduce:data-[state=closed]:duration-0",
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

/**
 * Raw sheet primitive — no internal padding or flex layout, mirroring
 * `ModalContent`. Compose content directly inside:
 *
 * @example
 * <Sheet>
 *   <SheetTrigger asChild><Button>Open</Button></SheetTrigger>
 *   <SheetContent side={SheetSide.right} aria-label="Filters">
 *     <SheetTitle className="sr-only">Filters</SheetTitle>
 *     <div className="p-6">Your custom content here.</div>
 *   </SheetContent>
 * </Sheet>
 *
 * IMPORTANT: Always include a SheetTitle for screen-reader accessibility.
 * Use className="sr-only" to visually hide it when the design has no title.
 */
const SheetContent = forwardRef<
  ComponentRef<typeof DialogPrimitive.Content>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Content> &
    VariantProps<typeof sheetVariants> & {
      /** When true, renders the overlay behind the sheet. Defaults to true. */
      withOverlay?: boolean;
    }
>(
  (
    {
      className,
      children,
      side = SheetSide.right,
      withOverlay = true,
      ...props
    },
    ref,
  ) => (
    <SheetPortal>
      {withOverlay && <SheetOverlay />}
      <DialogPrimitive.Content
        ref={ref}
        className={cn(sheetVariants({ side }), className)}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </SheetPortal>
  ),
);
SheetContent.displayName = "SheetContent";

/* ── Title & Description (a11y helpers) ─────────────────────────────── */

const SheetTitle = forwardRef<
  ComponentRef<typeof DialogPrimitive.Title>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-style-heading text-text", className)}
    {...props}
  />
));
SheetTitle.displayName = "SheetTitle";

const SheetDescription = forwardRef<
  ComponentRef<typeof DialogPrimitive.Description>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-style-body text-text-secondary", className)}
    {...props}
  />
));
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
