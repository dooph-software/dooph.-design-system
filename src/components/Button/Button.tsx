/*
 * Button — primary interactive leaf for labeled and icon-only actions.
 *
 * ## behavior
 * - `variant` + `size` map through `buttonVariants` (cva) onto token-backed
 *   Tailwind utilities; `asChild` swaps the root for Radix `Slot`.
 * - Disabled styling paints explicit disabled bg/border tokens (primary and
 *   danger alias secondary-disabled by default) plus `ds-disabled-state`
 *   opacity — not opacity alone.
 *
 * ## constraints
 * - Do NOT reintroduce `--ui-color-danger*` tokens; the danger variant paints
 *   secondary + error-primary/secondary utilities directly so consumers can
 *   still override those families independently.
 * - Keep `ButtonVariant.brand` in the API even if icon stories omit it.
 */
"use client";

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
    "ds-focus-visible-ring",
    "ds-disabled-state",
    "text-style-button",
  ],
  {
    variants: {
      variant: {
        primary: [
          "bg-primary text-primary-fg border-primary-border shadow-button",
          "[&:not(:disabled):not([aria-disabled=true])]:hover:bg-primary-hover [&:not(:disabled):not([aria-disabled=true])]:hover:border-primary-border-hover [&:not(:disabled):not([aria-disabled=true])]:hover:shadow-button-hover",
          "[&:not(:disabled):not([aria-disabled=true])]:active:bg-primary-active [&:not(:disabled):not([aria-disabled=true])]:active:border-primary-border-active [&:not(:disabled):not([aria-disabled=true])]:active:shadow-button-active",
          "disabled:bg-primary-disabled disabled:border-primary-border-disabled disabled:text-secondary-fg aria-disabled:bg-primary-disabled aria-disabled:border-primary-border-disabled aria-disabled:text-secondary-fg",
        ],
        secondary: [
          "bg-secondary text-secondary-fg border-secondary-border shadow-button-secondary",
          "[&:not(:disabled):not([aria-disabled=true])]:hover:bg-secondary-hover [&:not(:disabled):not([aria-disabled=true])]:hover:border-secondary-border-hover [&:not(:disabled):not([aria-disabled=true])]:hover:shadow-button-hover",
          "[&:not(:disabled):not([aria-disabled=true])]:active:bg-secondary-active [&:not(:disabled):not([aria-disabled=true])]:active:border-secondary-border-active [&:not(:disabled):not([aria-disabled=true])]:active:shadow-button-active",
          "disabled:bg-secondary-disabled disabled:border-secondary-border-disabled aria-disabled:bg-secondary-disabled aria-disabled:border-secondary-border-disabled",
        ],
        brand: [
          "bg-brand text-brand-fg border-brand-border shadow-button",
          "[&:not(:disabled):not([aria-disabled=true])]:hover:bg-brand-hover [&:not(:disabled):not([aria-disabled=true])]:hover:border-brand-border-hover [&:not(:disabled):not([aria-disabled=true])]:hover:shadow-button-hover",
          "[&:not(:disabled):not([aria-disabled=true])]:active:bg-brand-active [&:not(:disabled):not([aria-disabled=true])]:active:border-brand-border-active [&:not(:disabled):not([aria-disabled=true])]:active:shadow-button-active",
          "disabled:bg-primary-disabled disabled:border-primary-border-disabled disabled:text-secondary-fg aria-disabled:bg-primary-disabled aria-disabled:border-primary-border-disabled aria-disabled:text-secondary-fg",
        ],
        danger: [
          "bg-secondary text-error-primary border-secondary-border shadow-button-secondary",
          "[&:not(:disabled):not([aria-disabled=true])]:hover:bg-error-secondary [&:not(:disabled):not([aria-disabled=true])]:hover:border-error-secondary [&:not(:disabled):not([aria-disabled=true])]:hover:text-secondary-fg [&:not(:disabled):not([aria-disabled=true])]:hover:shadow-button-hover",
          "[&:not(:disabled):not([aria-disabled=true])]:active:bg-error-primary [&:not(:disabled):not([aria-disabled=true])]:active:border-error-primary [&:not(:disabled):not([aria-disabled=true])]:active:text-secondary-fg [&:not(:disabled):not([aria-disabled=true])]:active:shadow-button-active",
          "disabled:bg-secondary-disabled disabled:border-secondary-border-disabled disabled:text-secondary-fg aria-disabled:bg-secondary-disabled aria-disabled:border-secondary-border-disabled aria-disabled:text-secondary-fg",
        ],
        ghost: [
          "text-ghost-fg border-transparent",
          "[&:not(:disabled):not([aria-disabled=true])]:hover:bg-ghost-hover [&:not(:disabled):not([aria-disabled=true])]:hover:text-ghost-fg-active",
          "[&:not(:disabled):not([aria-disabled=true])]:active:bg-ghost-active [&:not(:disabled):not([aria-disabled=true])]:active:text-ghost-fg-active",
        ],
        text: [
          "text-ghost-fg border-transparent",
          "[&:not(:disabled):not([aria-disabled=true])]:hover:text-ghost-fg-active",
          "[&:not(:disabled):not([aria-disabled=true])]:active:text-ghost-fg-active",
        ],
      },
      size: {
        default: "h-button px-3",
        sm: "h-button-sm px-3",
        icon: "size-button p-0",
        "icon-sm": "size-button-sm p-0",
        "icon-micro": "size-button-micro p-0",
      },
    },
    compoundVariants: [
      { variant: "secondary", size: "icon", className: "shadow-none" },
      { variant: "secondary", size: "icon-sm", className: "shadow-none" },
      { variant: "secondary", size: "icon-micro", className: "shadow-none" },
      { variant: "danger", size: "icon", className: "shadow-none" },
      { variant: "danger", size: "icon-sm", className: "shadow-none" },
      { variant: "danger", size: "icon-micro", className: "shadow-none" },
    ],
    defaultVariants: {
      variant: "secondary",
      size: "default",
    },
  },
);

// ButtonVariant / ButtonSize (+ their types) live in ./constants — kept server-safe
// (no "use client") so RSC code can read the enum values. Re-exported via index.ts.

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
