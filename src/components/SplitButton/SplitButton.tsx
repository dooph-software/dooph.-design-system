"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "../../utils/cn";
import { ChevronDownIcon } from "../Icons";

/* SplitButtonAction (left part) */

export interface SplitButtonActionProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode;
}

const SplitButtonAction = forwardRef<HTMLButtonElement, SplitButtonActionProps>(
  ({ className, children, icon, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex h-button items-center",
        "ds-gap-ui-xs pl-4 pr-4",
        "rounded-l-tight rounded-r-none",
        "border border-solid border-border border-r-0",
        "bg-secondary text-secondary-fg",
        "text-style-button cursor-pointer select-none",
        "transition-all duration-100",
        "hover:enabled:bg-secondary-hover",
        "active:enabled:bg-secondary-active",
        "ds-focus-visible-ring",
        "ds-disabled-state disabled:border-border-disabled",
        className,
      )}
      {...props}
    >
      {icon && <span className="size-[14px] shrink-0">{icon}</span>}
      {children}
    </button>
  ),
);
SplitButtonAction.displayName = "SplitButtonAction";

/* SplitButtonTrigger (chevron) */

export interface SplitButtonTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

const SplitButtonTrigger = forwardRef<
  HTMLButtonElement,
  SplitButtonTriggerProps
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "inline-flex size-button items-center justify-center",
      "rounded-r-tight rounded-l-none",
      "border border-solid border-border",
      "bg-secondary text-secondary-fg",
      "cursor-pointer select-none transition-all duration-100",
      "hover:enabled:bg-secondary-hover",
      "active:enabled:bg-secondary-active",
      "ds-focus-visible-ring",
      "ds-disabled-state disabled:border-border-disabled",
      className,
    )}
    {...props}
  >
    <ChevronDownIcon />
  </button>
));
SplitButtonTrigger.displayName = "SplitButtonTrigger";

/* SplitButton (composite) */

export interface SplitButtonProps {
  actionProps?: SplitButtonActionProps;
  triggerProps?: SplitButtonTriggerProps;
  icon?: ReactNode;
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
}

function SplitButton({
  actionProps,
  triggerProps,
  icon,
  children,
  className,
  disabled,
}: SplitButtonProps) {
  return (
    <div className={cn("inline-flex rounded-tight shadow-button", className)}>
      <SplitButtonAction icon={icon} disabled={disabled} {...actionProps}>
        {children}
      </SplitButtonAction>
      <SplitButtonTrigger disabled={disabled} {...triggerProps} />
    </div>
  );
}

export { SplitButton, SplitButtonAction, SplitButtonTrigger };
