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

// ToastTypes (+ its type) lives in ./constants (server-safe), re-exported via
// index.ts; imported here for internal variant resolution.
import { ToastTypes } from "./constants";

type ToastOptions = {
  title?: string;
  description?: string;
  variant?: ToastTypes;
  duration?: number;
  action?: {
    label: string;
    altText?: string;
    onClick: () => void;
  };
  dismissLabel?: string;
};

type ToastItem = ToastOptions & {
  id: string;
  open: boolean;
  variant: ToastTypes;
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
    "group pointer-events-auto relative flex w-full overflow-hidden rounded-standard shadow-menu",
    "data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]",
    "data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition-transform",
    "data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)]",
    "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-right-2 data-[state=open]:duration-150",
    "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-right-2 data-[state=closed]:duration-150",
    "motion-reduce:data-[state=open]:duration-0 motion-reduce:data-[state=closed]:duration-0",
  ],
  {
    variants: {
      variant: {
        standard:
          "ds-toast-width flex-row items-center gap-xxl border border-solid border-modal-border bg-modal-surface py-2 pl-4 pr-2 text-text",
        brand:
          "ds-toast-width flex-row items-center gap-xxl border border-solid border-brand bg-brand py-2 pl-4 pr-2 text-brand-fg",
        error:
          "ds-toast-width flex-row items-center gap-xxl bg-destructive py-2 pl-4 pr-2 text-text",
        action:
          "ds-toast-action-width flex-col gap-md border border-solid border-modal-border bg-modal-surface pb-3 pl-[14px] pr-3 pt-[14px] text-text",
      },
    },
    defaultVariants: {
      variant: "standard",
    },
  },
);

export interface ToastRootProps
  extends ComponentPropsWithoutRef<typeof ToastPrimitive.Root> {
  variant?: ToastTypes;
}

const ToastRoot = forwardRef<
  ComponentRef<typeof ToastPrimitive.Root>,
  ToastRootProps
>(({ className, variant, ...props }, ref) => (
  <ToastPrimitive.Root
    ref={ref}
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
      "ds-toast-viewport fixed bottom-md right-md z-60 m-0 flex list-none flex-col items-end gap-xs p-0 outline-none",
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
        className={cn("text-text-secondary", className)}
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
      "shrink-0 text-current hover:text-current active:text-current",
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
}

function ToastProvider({
  children,
  viewportProps,
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
        variant: options.variant ?? ToastTypes.standard,
      },
    ]);
    return id;
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, open: false } : item)),
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 200);
  }, []);

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastPrimitive.Provider swipeDirection="right" {...props}>
      <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
      {toasts.map((item) => (
        <ToastRoot
          key={item.id}
          open={item.open}
          duration={item.duration ?? 4000}
          variant={item.variant}
          onOpenChange={(open) => {
            if (!open) {
              setToasts((prev) =>
                prev.filter((toastItem) => toastItem.id !== item.id),
              );
            }
          }}
        >
          {item.variant === ToastTypes.action ? (
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
                  <ToastTitle
                    className={cn(
                      "block wrap-break-word",
                      item.variant === ToastTypes.brand
                        ? "text-brand-fg"
                        : "text-text",
                    )}
                  >
                    {item.title}
                  </ToastTitle>
                )}
                {item.description && (
                  <ToastDescription
                    className={cn(
                      "block wrap-break-word",
                      item.variant === ToastTypes.brand
                        ? "text-brand-fg"
                        : "text-text-secondary",
                    )}
                  >
                    {item.description}
                  </ToastDescription>
                )}
              </div>
              <ToastClose aria-label="Close" />
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
