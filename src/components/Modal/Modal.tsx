"use client";

import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ComponentRef,
} from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '../../utils/cn';

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
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50',
      'bg-modal-backdrop',
      'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:duration-200',
      'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:duration-150',
      'motion-reduce:data-[state=open]:duration-0 motion-reduce:data-[state=closed]:duration-0',
      className
    )}
    {...props}
  />
));
ModalOverlay.displayName = 'ModalOverlay';

/* ── Content (the modal panel itself) ──────────────────────────────── */

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
  ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    /** When true, renders the overlay behind the modal. Defaults to true. */
    withOverlay?: boolean;
  }
>(({ className, children, withOverlay = true, ...props }, ref) => (
  <ModalPortal>
    {withOverlay && <ModalOverlay />}
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed left-1/2 top-1/2 z-50',
        '-translate-x-1/2 -translate-y-1/2',
        'bg-modal-surface border border-solid border-modal-border',
        'rounded-soft overflow-hidden',
        'shadow-menu',
        'focus-visible:outline-none',
        'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:duration-200',
        'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:duration-150',
        'motion-reduce:data-[state=open]:duration-0 motion-reduce:data-[state=closed]:duration-0',
        className
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </ModalPortal>
));
ModalContent.displayName = 'ModalContent';

/* ── Title & Description (a11y helpers) ─────────────────────────────── */

const ModalTitle = forwardRef<
  ComponentRef<typeof DialogPrimitive.Title>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('text-style-heading text-text', className)}
    {...props}
  />
));
ModalTitle.displayName = 'ModalTitle';

const ModalDescription = forwardRef<
  ComponentRef<typeof DialogPrimitive.Description>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-style-body text-text-secondary', className)}
    {...props}
  />
));
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
