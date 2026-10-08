import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ComponentRef,
} from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '../../utils/cn';
import {
  DialogShellContent,
  DialogShellDescription,
  DialogShellOverlay,
  DialogShellTitle,
} from './dialogShell';

/* ── Root / Trigger / Portal / Close (thin pass-throughs) ─────────── */

const Modal = DialogPrimitive.Root;
const ModalTrigger = DialogPrimitive.Trigger;
const ModalPortal = DialogPrimitive.Portal;
const ModalClose = DialogPrimitive.Close;

/* ── Overlay (full-screen backdrop) ────────────────────────────────── */

const ModalOverlay = forwardRef<
  ComponentRef<typeof DialogPrimitive.Overlay>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogShellOverlay
    ref={ref}
    className={cn(
      'data-[state=open]:animate-in data-[state=open]:fade-in-0',
      'data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
      'ds-motion-overlay-dialog',
      className
    )}
    {...props}
  />
));
ModalOverlay.displayName = 'ModalOverlay';

/* ── Content (the modal panel itself) ──────────────────────────────── */

export interface ModalContentProps
  extends ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  /** When true, renders the overlay behind the modal. Defaults to true. */
  withOverlay?: boolean;
  /** Render through a portal (the default) or in place. */
  portal?: boolean;
  /** Props for the portal, e.g. `container` or `forceMount`. */
  portalProps?: ComponentPropsWithoutRef<typeof DialogPrimitive.Portal>;
}

/**
 * Raw modal primitive — no internal padding or flex layout.
 * Compose content directly inside:
 *
 * @example
 * <Modal>
 *   <ModalTrigger asChild><Button>Open</Button></ModalTrigger>
 *   <ModalContent aria-label="Settings">
 *     <ModalTitle className="sr-only">Settings</ModalTitle>
 *     <p>Your custom content here.</p>
 *   </ModalContent>
 * </Modal>
 *
 * IMPORTANT: Always include a ModalTitle for screen-reader accessibility.
 * Use className="sr-only" to visually hide it when the design doesn't show a title.
 */
const ModalContent = forwardRef<
  ComponentRef<typeof DialogPrimitive.Content>,
  ModalContentProps
>(({ className, withOverlay = true, ...props }, ref) => (
  <DialogShellContent
    ref={ref}
    overlay={withOverlay ? <ModalOverlay /> : null}
    className={cn(
      'fixed left-1/2 top-1/2 z-50',
      '-translate-x-1/2 -translate-y-1/2',
      'border rounded-soft',
      'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
      'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
      'ds-motion-overlay-dialog',
      className
    )}
    {...props}
  />
));
ModalContent.displayName = 'ModalContent';

/* ── Title & Description (a11y helpers) ─────────────────────────────── */

const ModalTitle = forwardRef<
  ComponentRef<typeof DialogPrimitive.Title>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>((props, ref) => <DialogShellTitle ref={ref} {...props} />);
ModalTitle.displayName = 'ModalTitle';

const ModalDescription = forwardRef<
  ComponentRef<typeof DialogPrimitive.Description>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>((props, ref) => <DialogShellDescription ref={ref} {...props} />);
ModalDescription.displayName = 'ModalDescription';

export {
  Modal,
  ModalTrigger,
  ModalPortal,
  ModalOverlay,
  ModalContent,
  ModalClose,
  ModalTitle,
  ModalDescription,
};
