/*
 * Button — primary interactive leaf for labeled and icon-only actions.
 *
 * ## behavior
 * - `variant` + `size` map through `buttonVariants` (cva) onto token-backed
 *   Tailwind utilities; `asChild` swaps the root for Radix `Slot`.
 * - Disabled styling paints each variant's own explicit disabled bg/border
 *   tokens (primary, prominent and danger all alias secondary-disabled by
 *   default) plus `ds-disabled-state` opacity — not opacity alone.
 *
 * ## constraints
 * - The `danger` variant paints the `--ui-color-danger-*` STATE family
 *   (bg-danger / border-danger-border / text-danger-fg / ...), not the raw
 *   `--ui-color-danger-primary`/`-secondary` palette. Those two are still the
 *   raw paints and the state family aliases them — the indirection is the
 *   point: a consumer can retune the danger button without dragging every
 *   other danger-tinted surface along. Do not collapse it back to the raw
 *   tokens.
 * - `prominent` was called `brand` before 5.4, in both the variant key and the
 *   token family (`--ui-color-brand-*`). Neither spelling survives.
 * - Keep `ButtonVariant.prominent` in the API even if icon stories omit it.
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
        prominent: [
          "bg-prominent text-prominent-fg border-prominent-border shadow-button",
          "[&:not(:disabled):not([aria-disabled=true])]:hover:bg-prominent-hover [&:not(:disabled):not([aria-disabled=true])]:hover:border-prominent-border-hover [&:not(:disabled):not([aria-disabled=true])]:hover:shadow-button-hover",
          "[&:not(:disabled):not([aria-disabled=true])]:active:bg-prominent-active [&:not(:disabled):not([aria-disabled=true])]:active:border-prominent-border-active [&:not(:disabled):not([aria-disabled=true])]:active:shadow-button-active",
          "disabled:bg-prominent-disabled disabled:border-prominent-border-disabled disabled:text-secondary-fg aria-disabled:bg-prominent-disabled aria-disabled:border-prominent-border-disabled aria-disabled:text-secondary-fg",
        ],
        danger: [
          "bg-danger text-danger-fg border-danger-border shadow-button-secondary",
          "[&:not(:disabled):not([aria-disabled=true])]:hover:bg-danger-hover [&:not(:disabled):not([aria-disabled=true])]:hover:border-danger-border-hover [&:not(:disabled):not([aria-disabled=true])]:hover:text-danger-fg-active [&:not(:disabled):not([aria-disabled=true])]:hover:shadow-button-hover",
          "[&:not(:disabled):not([aria-disabled=true])]:active:bg-danger-active [&:not(:disabled):not([aria-disabled=true])]:active:border-danger-border-active [&:not(:disabled):not([aria-disabled=true])]:active:text-danger-fg-active [&:not(:disabled):not([aria-disabled=true])]:active:shadow-button-active",
          "disabled:bg-danger-disabled disabled:border-danger-border-disabled disabled:text-secondary-fg aria-disabled:bg-danger-disabled aria-disabled:border-danger-border-disabled aria-disabled:text-secondary-fg",
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
