/*
 * Internal dialog shell shared by Modal and Sheet. Not exported from
 * Modal/index.ts or src/index.ts: the public parts in Modal.tsx and
 * Sheet.tsx wrap these and pass only what differs (overlay motion, panel
 * geometry and motion, which overlay to render).
 */
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ComponentRef,
  type ReactNode,
} from "react";
import { cn } from "../../utils/cn";

/** Backdrop base; the caller's className carries its open/close motion. */
export const DialogShellOverlay = forwardRef<
  ComponentRef<typeof DialogPrimitive.Overlay>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn("fixed inset-0 z-50", "bg-modal-backdrop", className)}
    {...props}
  />
));
DialogShellOverlay.displayName = "DialogShellOverlay";

export const DialogShellTitle = forwardRef<
  ComponentRef<typeof DialogPrimitive.Title>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-style-heading text-text", className)}
    {...props}
  />
));
DialogShellTitle.displayName = "DialogShellTitle";

export const DialogShellDescription = forwardRef<
  ComponentRef<typeof DialogPrimitive.Description>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-style-body text-text-secondary", className)}
    {...props}
  />
));
DialogShellDescription.displayName = "DialogShellDescription";

export interface DialogShellContentProps
  extends ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  /** The caller's overlay element, or null for none. */
  overlay: ReactNode;
  /** Render through a portal (the default) or in place. */
  portal?: boolean;
  /** Props for the portal, e.g. `container` or `forceMount`. */
  portalProps?: ComponentPropsWithoutRef<typeof DialogPrimitive.Portal>;
}

/**
 * Panel surface shared by ModalContent and SheetContent. The overlay and the
 * panel go to the portal as two children, never one Fragment: Radix
 * DialogPortal wraps each child in Presence, which clones it with a ref.
 */
export const DialogShellContent = forwardRef<
  ComponentRef<typeof DialogPrimitive.Content>,
  DialogShellContentProps
>(
  (
    { overlay, portal = true, portalProps, className, children, ...props },
    ref,
  ) => {
    const panel = (
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "bg-modal-surface border-solid border-border-popovers",
          "shadow-menu overflow-hidden",
          "focus-visible:outline-none",
          className,
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    );

    if (!portal) {
      return (
        <>
          {overlay}
          {panel}
        </>
      );
    }

    return (
      <DialogPrimitive.Portal {...portalProps}>
        {overlay}
        {panel}
      </DialogPrimitive.Portal>
    );
  },
);
DialogShellContent.displayName = "DialogShellContent";
