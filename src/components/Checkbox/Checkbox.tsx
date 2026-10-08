/*
 * Checkbox — Radix checkbox with prominent/primary checked fills.
 *
 * ## behavior
 * - Unchecked hover/active use secondary surface tokens; a checked or
 *   indeterminate box keeps its fill while pressed.
 * - Checked/indeterminate fill follows `CheckboxVariant` (prominent | primary).
 * - Disabled unchecked paints secondary-disabled; disabled checked/indeterminate
 *   paints primary-disabled bg/border with secondary-fg checkmark (theme-
 *   matching, not inverse white). The press shadow (`shadow-press-*`) and
 *   focus ring are gated off while `data-disabled` so a click cannot flash them.
 *
 * ## constraints
 * - Style states via Radix `data-[state]` / `data-[disabled]` only — no JS
 *   class toggling for checked/disabled.
 * - Indicator SVGs stay decorative (`aria-hidden`) — an interactive element
 *   inside the checkbox button is a nested control that assistive tech
 *   cannot reach. Custom indicator content goes through the `children`
 *   escape hatch.
 */
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { cva } from "class-variance-authority";
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ComponentRef,
} from "react";
import { cn } from "../../utils/cn";
import type { CheckboxVariant } from "./constants";

// CheckboxChecked / CheckboxVariant (+ their types) live in ./constants — kept
// server-safe (no "use client") so RSC code can read the enum values.
// Re-exported via index.ts.

const checkboxVariants = cva(
  [
    "group inline-flex size-checkbox shrink-0 items-center justify-center overflow-hidden align-middle",
    "rounded-checkbox border border-solid border-border-primary bg-transparent text-primary-fg",
    "cursor-pointer select-none ds-motion-state",
    "data-[state=unchecked]:hover:bg-secondary-hover data-[state=unchecked]:hover:border-border-primary data-[state=unchecked]:hover:shadow-button-secondary",
    // press darkens only an unchecked box, like hover — never while disabled.
    // A checked box keeps its fill so the on-fill check stays legible.
    "data-[state=unchecked]:[&:not([data-disabled])]:active:bg-secondary-hover",
    "focus-visible:border-input-border-focus ds-focus-visible-ring ds-focus-ring-sm",
    "data-[disabled]:focus-visible:border-secondary-border-disabled",
    "data-[disabled]:data-[state=unchecked]:bg-secondary-disabled data-[disabled]:data-[state=unchecked]:border-secondary-border-disabled",
    "data-[disabled]:data-[state=checked]:bg-primary-disabled data-[disabled]:data-[state=checked]:border-primary-border-disabled data-[disabled]:data-[state=checked]:text-secondary-fg data-[disabled]:data-[state=checked]:focus-visible:border-primary-border-disabled",
    "data-[disabled]:data-[state=indeterminate]:bg-primary-disabled data-[disabled]:data-[state=indeterminate]:border-primary-border-disabled data-[disabled]:data-[state=indeterminate]:text-secondary-fg data-[disabled]:data-[state=indeterminate]:focus-visible:border-primary-border-disabled",
    "ds-radix-data-disabled",
  ],
  {
    variants: {
      variant: {
        prominent: [
          "data-[state=checked]:bg-prominent data-[state=checked]:border-prominent data-[state=checked]:text-prominent-fg",
          "data-[state=indeterminate]:bg-prominent data-[state=indeterminate]:border-prominent data-[state=indeterminate]:text-prominent-fg",
          // active border matches the typeable trigger's hover border
          "[&:not([data-disabled])]:active:border-input-border-hover [&:not([data-disabled])]:active:shadow-press-prominent",
        ],
        primary: [
          "data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-primary-fg",
          "data-[state=indeterminate]:bg-primary data-[state=indeterminate]:border-primary data-[state=indeterminate]:text-primary-fg",
          "[&:not([data-disabled])]:active:border-primary [&:not([data-disabled])]:active:shadow-press-primary",
        ],
      },
    },
    defaultVariants: {
      variant: "prominent",
    },
  },
);

/* `variant` is typed from the `CheckboxVariant` const, not cva's
 * `VariantProps`: that admits `null`, which cva reads as "no variant" (no
 * checked fill). */
export interface CheckboxProps
  extends ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  /** Checked / indeterminate fill. Defaults to `prominent`. */
  variant?: CheckboxVariant;
}

const CheckboxIndicator = forwardRef<
  ComponentRef<typeof CheckboxPrimitive.Indicator>,
  ComponentPropsWithoutRef<typeof CheckboxPrimitive.Indicator>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Indicator
    ref={ref}
    className={cn("flex size-checkbox-icon items-center justify-center", className)}
    {...props}
  >
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      aria-hidden
      className="hidden size-checkbox-icon group-data-[state=checked]:block"
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
      className="hidden size-checkbox-icon group-data-[state=indeterminate]:block"
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
