import { forwardRef, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../utils/cn";
// Deep sibling imports, so a later change to the Button barrel cannot break them.
import { buttonVariants } from "../Button/Button";
import { ButtonSize, ButtonVariant } from "../Button/constants";
import { ChevronDownIcon } from "../Icons";
import { ButtonText } from "../Text";

/* The split parts ARE secondary Buttons: paints, state guards, focus ring and
 * disabled treatment come from buttonVariants, and each part renders through
 * ButtonText (the recipe holds no typography). Only the split geometry is
 * local — one-sided radii, a single shared seam (the action drops its right
 * border), and no per-part shadow (the group carries shadow-button). The
 * one-sided `rounded-*-none` / `border-r-0` classes sit next to the recipe's
 * `rounded-tight` / `border` (twMerge keeps both) and win because Tailwind
 * emits longhands after their shorthand. */
const PART_SHADOW_NONE = [
  "shadow-none",
  "[&:not(:disabled):not([aria-disabled=true])]:hover:shadow-none",
  "[&:not(:disabled):not([aria-disabled=true])]:active:shadow-none",
];

/* SplitButtonAction (left part) */

export interface SplitButtonActionProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode;
}

const SplitButtonAction = forwardRef<HTMLButtonElement, SplitButtonActionProps>(
  ({ className, children, icon, ...props }, ref) => (
    <ButtonText
      as="button"
      ref={ref}
      className={cn(
        buttonVariants({ variant: ButtonVariant.secondary, size: ButtonSize.standard }),
        // 16px inline padding (the secondary Button's is 12px) and the seam.
        "px-lg rounded-r-none border-r-0",
        PART_SHADOW_NONE,
        className,
      )}
      {...props}
    >
      {icon && <span className="ds-size-icon-rg shrink-0">{icon}</span>}
      {children}
    </ButtonText>
  ),
);
SplitButtonAction.displayName = "SplitButtonAction";

/* SplitButtonTrigger (chevron) */

export interface SplitButtonTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Accessible name of the icon-only trigger. Defaults to "More options"
   * unless `aria-labelledby` is passed; pass a localised label to override. */
  "aria-label"?: string;
}

const SplitButtonTrigger = forwardRef<
  HTMLButtonElement,
  SplitButtonTriggerProps
>(({ className, "aria-label": ariaLabel, ...props }, ref) => (
  <ButtonText
    as="button"
    ref={ref}
    aria-label={ariaLabel ?? (props["aria-labelledby"] ? undefined : "More options")}
    className={cn(
      buttonVariants({ variant: ButtonVariant.secondary, size: ButtonSize.icon }),
      "rounded-l-none",
      PART_SHADOW_NONE,
      className,
    )}
    {...props}
  >
    <ChevronDownIcon />
  </ButtonText>
));
SplitButtonTrigger.displayName = "SplitButtonTrigger";

/* SplitButtonGroup (wrapper) — the composite's chrome as a part, so a split
 * button whose trigger opens a DropdownMenu (and must therefore be composed
 * by hand under DropdownMenuTrigger asChild) keeps the same radius and shadow. */

export type SplitButtonGroupProps = HTMLAttributes<HTMLDivElement>;

const SplitButtonGroup = forwardRef<HTMLDivElement, SplitButtonGroupProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("inline-flex rounded-tight shadow-button", className)}
      {...props}
    />
  ),
);
SplitButtonGroup.displayName = "SplitButtonGroup";

/* SplitButton (composite) */

export interface SplitButtonProps extends HTMLAttributes<HTMLDivElement> {
  /** Props for the action part. `disabled` here can only add to the
   * composite's `disabled`, never undo it. */
  actionProps?: SplitButtonActionProps;
  /** Props for the trigger part. `disabled` here can only add to the
   * composite's `disabled`, never undo it. */
  triggerProps?: SplitButtonTriggerProps;
  icon?: ReactNode;
  disabled?: boolean;
}

const SplitButton = forwardRef<HTMLDivElement, SplitButtonProps>(
  ({ actionProps, triggerProps, icon, children, className, disabled, ...props }, ref) => (
    <SplitButtonGroup ref={ref} className={className} {...props}>
      {/* `disabled` goes after the spread so a part's `disabled: false` cannot
          re-enable a disabled composite; `icon` stays before it so
          `actionProps.icon` still overrides. */}
      <SplitButtonAction icon={icon} {...actionProps} disabled={disabled || actionProps?.disabled}>
        {children}
      </SplitButtonAction>
      <SplitButtonTrigger {...triggerProps} disabled={disabled || triggerProps?.disabled} />
    </SplitButtonGroup>
  ),
);
SplitButton.displayName = "SplitButton";

export { SplitButton, SplitButtonAction, SplitButtonGroup, SplitButtonTrigger };
