import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { cva, type VariantProps } from "class-variance-authority";
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ComponentRef,
} from "react";
import { cn } from "../../utils/cn";

export const CheckboxChecked = {
  checked: true,
  unchecked: false,
  indeterminate: "indeterminate",
} as const;
export type CheckboxChecked =
  (typeof CheckboxChecked)[keyof typeof CheckboxChecked];

export const CheckboxVariant = {
  brand: "brand",
  primary: "primary",
} as const;
export type CheckboxVariant =
  (typeof CheckboxVariant)[keyof typeof CheckboxVariant];

const checkboxVariants = cva(
  [
    "group inline-flex size-checkbox shrink-0 items-center justify-center overflow-hidden align-middle",
    "rounded-checkbox border border-solid border-border bg-transparent text-primary-fg",
    "cursor-pointer select-none transition-all duration-150 ease-out",
    "data-[state=unchecked]:hover:bg-secondary-hover data-[state=unchecked]:hover:border-border data-[state=unchecked]:hover:shadow-button-secondary",
    // active bg stays at hover color intentionally
    "active:bg-secondary-hover",
    "focus-visible:border-border-focus ds-focus-visible-ring",
    "data-[disabled]:bg-secondary-disabled data-[disabled]:border-border-disabled ds-radix-data-disabled",
  ],
  {
    variants: {
      variant: {
        brand: [
          "data-[state=checked]:bg-brand data-[state=checked]:border-brand data-[state=checked]:text-brand-fg",
          "data-[state=indeterminate]:bg-brand data-[state=indeterminate]:border-brand data-[state=indeterminate]:text-brand-fg",
          // active border matches typeabletrigger hover, not brand
          "active:border-border-hover active:shadow-focus-brand",
        ],
        primary: [
          "data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-primary-fg",
          "data-[state=indeterminate]:bg-primary data-[state=indeterminate]:border-primary data-[state=indeterminate]:text-primary-fg",
          "active:border-primary active:shadow-focus-primary",
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
