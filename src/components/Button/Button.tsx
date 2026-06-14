import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ComponentPropsWithRef,
  type ElementType,
  type ForwardedRef,
  type ReactElement,
} from "react";
import { cn } from "../../utils/cn";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "border border-solid rounded-tight",
    "transition-all duration-150 ease-out cursor-pointer select-none",
    "ds-focus-ring",
    "ds-disabled-state",
    "text-style-button",
  ],
  {
    variants: {
      variant: {
        primary: [
          "bg-primary text-primary-fg border-primary shadow-button",
          "[&:not(:disabled):not([aria-disabled=true])]:hover:bg-primary-hover [&:not(:disabled):not([aria-disabled=true])]:hover:border-primary-hover [&:not(:disabled):not([aria-disabled=true])]:hover:shadow-button-hover",
          "[&:not(:disabled):not([aria-disabled=true])]:active:bg-primary-active [&:not(:disabled):not([aria-disabled=true])]:active:border-primary-active [&:not(:disabled):not([aria-disabled=true])]:active:shadow-button-active",
        ],
        secondary: [
          "bg-secondary text-secondary-fg border-border shadow-button-secondary",
          "[&:not(:disabled):not([aria-disabled=true])]:hover:bg-secondary-hover [&:not(:disabled):not([aria-disabled=true])]:hover:shadow-button-hover",
          "[&:not(:disabled):not([aria-disabled=true])]:active:bg-secondary-active [&:not(:disabled):not([aria-disabled=true])]:active:shadow-button-active",
          "disabled:bg-secondary-disabled disabled:border-border-disabled aria-disabled:bg-secondary-disabled aria-disabled:border-border-disabled",
        ],
        brand: [
          "bg-brand text-brand-fg border-brand shadow-button",
          "[&:not(:disabled):not([aria-disabled=true])]:hover:bg-brand-hover [&:not(:disabled):not([aria-disabled=true])]:hover:border-brand-hover [&:not(:disabled):not([aria-disabled=true])]:hover:shadow-button-hover",
          "[&:not(:disabled):not([aria-disabled=true])]:active:bg-brand-active [&:not(:disabled):not([aria-disabled=true])]:active:border-brand-active [&:not(:disabled):not([aria-disabled=true])]:active:shadow-button-active",
        ],
        destructive: [
          "bg-destructive text-destructive-fg border-destructive",
          "[&:not(:disabled):not([aria-disabled=true])]:hover:bg-destructive-hover [&:not(:disabled):not([aria-disabled=true])]:hover:border-destructive-hover",
          "[&:not(:disabled):not([aria-disabled=true])]:active:bg-destructive-active",
          "disabled:bg-destructive-disabled disabled:border-destructive-disabled aria-disabled:bg-destructive-disabled aria-disabled:border-destructive-disabled",
        ],
        ghost: [
          "bg-transparent text-ghost-fg border-transparent",
          "[&:not(:disabled):not([aria-disabled=true])]:hover:bg-ghost-hover [&:not(:disabled):not([aria-disabled=true])]:hover:text-ghost-fg-active",
          "[&:not(:disabled):not([aria-disabled=true])]:active:bg-ghost-active [&:not(:disabled):not([aria-disabled=true])]:active:text-ghost-fg-active",
        ],
        text: [
          "bg-transparent text-ghost-fg border-transparent",
          "[&:not(:disabled):not([aria-disabled=true])]:hover:text-ghost-fg-active",
          "[&:not(:disabled):not([aria-disabled=true])]:active:text-ghost-fg-active",
        ],
      },
      size: {
        default: "h-button px-3",
        sm: "h-button-sm px-3",
        icon: "size-button p-0",
        "icon-sm": "size-button-sm p-0",
      },
    },
    compoundVariants: [
      { variant: "secondary", size: "icon", className: "shadow-none" },
      { variant: "secondary", size: "icon-sm", className: "shadow-none" },
    ],
    defaultVariants: {
      variant: "secondary",
      size: "default",
    },
  },
);

/**
 * Dot-accessible button variant and size constants.
 * Usage: <Button variant={ButtonVariant.primary} size={ButtonSize.sm} />
 */
export const ButtonVariant = {
  primary: "primary",
  secondary: "secondary",
  brand: "brand",
  destructive: "destructive",
  ghost: "ghost",
  text: "text",
} as const;
export type ButtonVariant = (typeof ButtonVariant)[keyof typeof ButtonVariant];

export const ButtonSize = {
  default: "default",
  sm: "sm",
  icon: "icon",
  iconSm: "icon-sm",
} as const;
export type ButtonSize = (typeof ButtonSize)[keyof typeof ButtonSize];

type ButtonOwnProps = VariantProps<typeof buttonVariants> & {
  asChild?: boolean;
};

export type ButtonProps<TElement extends ElementType = "button"> =
  ButtonOwnProps &
    Omit<ComponentPropsWithoutRef<TElement>, keyof ButtonOwnProps>;

type ButtonComponent = <TElement extends ElementType = "button">(
  props: ButtonProps<TElement> & {
    ref?: ComponentPropsWithRef<TElement>["ref"];
  },
) => ReactElement | null;

const ButtonBase = forwardRef<HTMLElement, ButtonProps<ElementType>>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = (asChild ? Slot : "button") as ElementType;
    return (
      <Comp
        ref={ref as ForwardedRef<HTMLElement>}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);

ButtonBase.displayName = "Button";

const Button = ButtonBase as ButtonComponent;

export { Button, buttonVariants };
