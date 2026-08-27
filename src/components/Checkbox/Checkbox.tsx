/*
 * Checkbox — Radix checkbox with brand/primary checked fills.
 *
 * ## behavior
 * - Unchecked hover/active use secondary surface tokens.
 * - Checked/indeterminate fill follows `CheckboxVariant` (brand | primary).
 * - Disabled unchecked paints secondary-disabled; disabled checked/indeterminate
 *   paints primary-disabled bg/border with secondary-fg checkmark (theme-
 *   matching, not inverse white). Active/focus rings are gated off while
 *   `data-disabled` so a click cannot flash the focus shadow.
 *
 * ## constraints
 * - Style states via Radix `data-[state]` / `data-[disabled]` only — no JS
 *   class toggling for checked/disabled.
 * - Indicator SVGs stay decorative (`aria-hidden`); do not replace with
 *   interactive children unless composing via the `children` escape hatch.
 */
"use client";

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { cva, type VariantProps } from "class-variance-authority";
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ComponentRef,
} from "react";
import { cn } from "../../utils/cn";

// CheckboxChecked / CheckboxVariant (+ their types) live in ./constants — kept
// server-safe (no "use client") so RSC code can read the enum values.
// Re-exported via index.ts.

const checkboxVariants = cva(
  [
    "group inline-flex size-checkbox shrink-0 items-center justify-center overflow-hidden align-middle",
    "rounded-checkbox border border-solid border-border-primary bg-transparent text-primary-fg",
    "cursor-pointer select-none transition-all duration-150 ease-out",
    "data-[state=unchecked]:hover:bg-secondary-hover data-[state=unchecked]:hover:border-border-primary data-[state=unchecked]:hover:shadow-button-secondary",
    // active bg stays at hover color intentionally — never while disabled
    "[&:not([data-disabled])]:active:bg-secondary-hover",
    "focus-visible:border-border-focus ds-focus-visible-ring",
    "data-[disabled]:focus-visible:border-secondary-border-disabled",
    "data-[disabled]:data-[state=unchecked]:bg-secondary-disabled data-[disabled]:data-[state=unchecked]:border-secondary-border-disabled",
    "data-[disabled]:data-[state=checked]:bg-primary-disabled data-[disabled]:data-[state=checked]:border-primary-border-disabled data-[disabled]:data-[state=checked]:text-secondary-fg data-[disabled]:data-[state=checked]:focus-visible:border-primary-border-disabled",
    "data-[disabled]:data-[state=indeterminate]:bg-primary-disabled data-[disabled]:data-[state=indeterminate]:border-primary-border-disabled data-[disabled]:data-[state=indeterminate]:text-secondary-fg data-[disabled]:data-[state=indeterminate]:focus-visible:border-primary-border-disabled",
    "ds-radix-data-disabled",
  ],
  {
    variants: {
      variant: {
        brand: [
          "data-[state=checked]:bg-brand data-[state=checked]:border-brand data-[state=checked]:text-brand-fg",
          "data-[state=indeterminate]:bg-brand data-[state=indeterminate]:border-brand data-[state=indeterminate]:text-brand-fg",
          // active border matches typeabletrigger hover, not brand
          "[&:not([data-disabled])]:active:border-trigger-border-hover [&:not([data-disabled])]:active:shadow-focus-brand",
        ],
        primary: [
          "data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-primary-fg",
          "data-[state=indeterminate]:bg-primary data-[state=indeterminate]:border-primary data-[state=indeterminate]:text-primary-fg",
          "[&:not([data-disabled])]:active:border-primary [&:not([data-disabled])]:active:shadow-focus-primary",
        ],
      },
    },
    defaultVariants: {
      variant: "brand",
    },
  },
);

export interface CheckboxProps
  extends
    ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>,
    VariantProps<typeof checkboxVariants> {}

const CheckboxIndicator = forwardRef<
  ComponentRef<typeof CheckboxPrimitive.Indicator>,
  ComponentPropsWithoutRef<typeof CheckboxPrimitive.Indicator>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Indicator
    ref={ref}
    className={cn("flex size-2.5 items-center justify-center", className)}
    {...props}
  >
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      aria-hidden
      className="hidden size-2.5 group-data-[state=checked]:block"
    >
      <path
        d="M1.75 5.15L3.85 7.25L8.25 2.75"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      aria-hidden
      className="hidden size-2.5 group-data-[state=indeterminate]:block"
    >
      <path
        d="M2.25 5H7.75"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  </CheckboxPrimitive.Indicator>
));
CheckboxIndicator.displayName = "CheckboxIndicator";

const Checkbox = forwardRef<
  ComponentRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, variant, children, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(checkboxVariants({ variant }), className)}
    {...props}
  >
    {children ?? <CheckboxIndicator />}
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = "Checkbox";

export { Checkbox, CheckboxIndicator, checkboxVariants };
