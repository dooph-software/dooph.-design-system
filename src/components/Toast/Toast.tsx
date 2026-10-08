"use client";

import * as ToastPrimitive from "@radix-ui/react-toast";
import { cva } from "class-variance-authority";
import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ComponentPropsWithoutRef,
  type ComponentRef,
  type ReactNode,
} from "react";
import { cn } from "../../utils/cn";
import { ButtonSize, ButtonVariant, buttonVariants } from "../Button";
import { BaseText, TextVariant, type BaseTextProps } from "../Text";
import { CloseCancelIcon } from "../Icons";

// ToastVariant (+ its type) lives in ./constants (server-safe), re-exported via
// index.ts; imported here for internal variant resolution.
import { ToastVariant } from "./constants";

export type ToastOptions = {
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  action?: {
    label: string;
    altText?: string;
    onClick: () => void;
  };
  /** Visible label of the complex toast's dismiss button. Default "Dismiss". */
  dismissLabel?: string;
  /** Accessible name of the other variants' close (X) button. Default "Close". */
  closeLabel?: string;
};

type ToastItem = ToastOptions & {
  id: string;
  open: boolean;
  variant: ToastVariant;
};

type ToastFn = (options: ToastOptions) => string;

type ToastContextValue = {
  toast: ToastFn;
  dismiss: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

let toastId = 0;
const createToastId = () => `toast-${Date.now()}-${toastId++}`;

const toastRootVariants = cva(
  [
    "group pointer-events-auto relative flex w-full overflow-hidden rounded-normal shadow-menu",
    "data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]",
    "data-[swipe=cancel]:translate-x-0",
    "data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)]",
    "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-right-2",
    "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-right-2",
    // Enter/exit timing AND the swipe-cancel spring-back both come from here.
    "ds-motion-overlay",
  ],
  {
    variants: {
      variant: {
        simple:
          "ds-toast-width-simple flex-row items-center gap-xxxl border border-solid border-border-popovers bg-modal-surface py-sm pl-lg pr-sm text-text",
        prominent:
          "ds-toast-width-simple flex-row items-center gap-xxxl border border-solid border-prominent bg-prominent py-sm pl-lg pr-sm text-prominent-fg",
        danger:
          "ds-toast-width-simple flex-row items-center gap-xxxl bg-danger-secondary py-sm pl-lg pr-sm text-text",
        complex:
          "ds-toast-width-complex flex-col gap-lg border border-solid border-border-popovers bg-modal-surface pb-md pl-toast-inset pr-md pt-toast-inset text-text",
      },
    },
    defaultVariants: {
      variant: ToastVariant.simple,
    },
  },
);

export interface ToastRootProps
  extends ComponentPropsWithoutRef<typeof ToastPrimitive.Root> {
  variant?: ToastVariant;
}

const ToastRoot = forwardRef<
  ComponentRef<typeof ToastPrimitive.Root>,
  ToastRootProps
>(({ className, variant, ...props }, ref) => (
  <ToastPrimitive.Root
    ref={ref}
    // The parts key their per-variant text colour off this (the root's `group`
    // class), so a custom-composed toast matches the provider's template.
    data-variant={variant ?? ToastVariant.simple}
    className={cn(toastRootVariants({ variant }), className)}
    {...props}
  />
));
ToastRoot.displayName = "ToastRoot";

const ToastViewport = forwardRef<
  ComponentRef<typeof ToastPrimitive.Viewport>,
  ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Viewport
    ref={ref}
    className={cn(
      "ds-toast-viewport fixed bottom-lg right-lg z-60 m-0 flex list-none flex-col items-end gap-sm p-0 outline-none",
      className,
    )}
    {...props}
  />
));
ToastViewport.displayName = "ToastViewport";

export type ToastTitleProps = Omit<BaseTextProps, "variant">;
const ToastTitle = forwardRef<HTMLElement, ToastTitleProps>((props, ref) => (
  <ToastPrimitive.Title asChild>
    <BaseText ref={ref} variant={TextVariant.body} {...props} />
  </ToastPrimitive.Title>
));
ToastTitle.displayName = "ToastTitle";

export type ToastDescriptionProps = Omit<BaseTextProps, "variant">;
const ToastDescription = forwardRef<HTMLElement, ToastDescriptionProps>(
  ({ className, ...props }, ref) => (
    <ToastPrimitive.Description asChild>
      <BaseText
        ref={ref}
        variant={TextVariant.body}
        className={cn(
          "text-text-secondary group-data-[variant=prominent]:text-prominent-fg",
          className,
        )}
        {...props}
      />
    </ToastPrimitive.Description>
  ),
);
ToastDescription.displayName = "ToastDescription";

const ToastAction = forwardRef<
  ComponentRef<typeof ToastPrimitive.Action>,
  ComponentPropsWithoutRef<typeof ToastPrimitive.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Action
    ref={ref}
    className={cn(
      buttonVariants({
        variant: ButtonVariant.primary,
        size: ButtonSize.sm,
      }),
      className,
    )}
    {...props}
  />
));
ToastAction.displayName = "ToastAction";

const ToastClose = forwardRef<
  ComponentRef<typeof ToastPrimitive.Close>,
  ComponentPropsWithoutRef<typeof ToastPrimitive.Close>
>(({ className, children, ...props }, ref) => (
  <ToastPrimitive.Close
    ref={ref}
    className={cn(
      buttonVariants({
        variant: ButtonVariant.ghost,
        size: ButtonSize.iconSm,
      }),
      // The ghost variant's own guarded selector, so cn() drops its
      // hover/active text colour and this one wins (a bare hover:text-current
      // loses on specificity and the icon vanished on the prominent toast).
      "shrink-0 text-current [&:not(:disabled):not([aria-disabled=true])]:hover:text-current [&:not(:disabled):not([aria-disabled=true])]:active:text-current",
      className,
    )}
    {...props}
  >
    {children ?? <CloseCancelIcon />}
  </ToastPrimitive.Close>
));
ToastClose.displayName = "ToastClose";

const ToastDismiss = forwardRef<
  ComponentRef<typeof ToastPrimitive.Close>,
  ComponentPropsWithoutRef<typeof ToastPrimitive.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Close
    ref={ref}
    className={cn(
      buttonVariants({
        variant: ButtonVariant.ghost,
        size: ButtonSize.sm,
      }),
      className,
    )}
    {...props}
  />
));
ToastDismiss.displayName = "ToastDismiss";

export interface ToastProviderProps extends ComponentPropsWithoutRef<
  typeof ToastPrimitive.Provider
> {
  children: ReactNode;
  viewportProps?: ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>;
  /**
   * Auto-dismiss delay in ms for every toast this provider renders. A
   * `toast({ duration })` overrides it for that toast; pass `Infinity` to keep
   * one open. Default 4000.
   */
  duration?: number;
}

function ToastProvider({
  children,
  viewportProps,
  duration = 4000,
  ...props
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback<ToastFn>((options) => {
    const id = createToastId();
    setToasts((prev) => [
      ...prev,
      {
        ...options,
        id,
        open: true,
        variant: options.variant ?? ToastVariant.simple,
      },
    ]);
    return id;
  }, []);

  // Closing only flips `open`; the item leaves state when its own exit
  // animation ends (onAnimationEnd below), so the CSS owns the exit timing.
  const dismiss = useCallback((id: string) => {
    setToasts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, open: false } : item)),
    );
  }, []);

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastPrimitive.Provider
      swipeDirection="right"
      duration={duration}
      {...props}
    >
      <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
      {toasts.map((item) => (
        <ToastRoot
          key={item.id}
          open={item.open}
          duration={item.duration}
          variant={item.variant}
          onOpenChange={(open) => {
            if (!open) dismiss(item.id);
          }}
          onAnimationEnd={(event) => {
            // Prune only on this toast's own exit animation. Radix Presence
            // keeps the <li> mounted until the data-[state=closed] animation
            // ends, so the CSS is the only source of the exit timing. Under
            // reduced motion the scale collapses to a near-zero duration (see
            // the reduce block in tokens.css), which still dispatches
            // animationend.
            if (
              event.target === event.currentTarget &&
              event.currentTarget.dataset.state === "closed"
            ) {
              setToasts((prev) =>
                prev.filter((toastItem) => toastItem.id !== item.id),
              );
            }
          }}
        >
          {item.variant === ToastVariant.complex ? (
            <>
              <div className="flex w-full items-center justify-center pr-xxs">
                <ToastTitle className="min-w-0 flex-1 wrap-break-word text-text">
                  {item.title}
                </ToastTitle>
              </div>
              {item.description && (
                <ToastDescription className="text-text-secondary">
                  {item.description}
                </ToastDescription>
              )}
              <div className="flex w-full items-center justify-end gap-xxs">
                <ToastDismiss>
                  {item.dismissLabel ?? "Dismiss"}
                </ToastDismiss>
                {item.action && (
                  <ToastAction
                    altText={item.action.altText ?? item.action.label}
                    onClick={item.action.onClick}
                  >
                    {item.action.label}
                  </ToastAction>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="min-w-0 flex-1">
                {item.title && (
                  <ToastTitle className="block wrap-break-word">
                    {item.title}
                  </ToastTitle>
                )}
                {item.description && (
                  <ToastDescription className="block wrap-break-word">
                    {item.description}
                  </ToastDescription>
                )}
              </div>
              <ToastClose aria-label={item.closeLabel ?? "Close"} />
            </>
          )}
        </ToastRoot>
      ))}
      <ToastViewport {...viewportProps} />
    </ToastPrimitive.Provider>
  );
}

function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export {
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastRoot,
  ToastTitle,
  ToastViewport,
  useToast,
};
