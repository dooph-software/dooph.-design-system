"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, hasError, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "flex h-button w-full rounded-tight border border-solid border-border bg-secondary",
          "ds-pl-ui-rg ds-pr-ui-sm",
          "text-style-button text-text placeholder:text-text-tertiary",
          "transition-all duration-100 ds-focus-ring-on-focus",
          "hover:border-border-hover hover:shadow-button-secondary",
          "focus:border-border-focus",
          "disabled:bg-secondary-disabled disabled:border-border-disabled ds-disabled-state",
          hasError &&
            "border-destructive focus:border-destructive ds-focus-ring-destructive-on-focus",
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";

export { Input };
