/*
 * CodeDigitInput — single verification-code cell (visual + optional input).
 *
 * ## behavior
 * - 46px (`size-code-digit`), `rounded-tight`, secondary surface/border.
 * - Digit glyph is always `BaseText` at 18px / medium (body role) — never
 *   SubheadingText and never a raw HTML text node.
 * - `hasError` paints error-primary border + text; `disabled` uses secondary
 *   disabled tokens + `ds-disabled-state`; focus uses brand focus ring.
 *
 * ## constraints
 * - Prefer composing through VerificationCodeInput for multi-digit flows.
 * - Do not hardcode Host Grotesk here; body role + size/weight props own it.
 */
"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "../../utils/cn";
import { BaseText } from "../Text/BaseText";
import { FontWeights } from "../Text/constants";

export interface CodeDigitInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "type" | "value"> {
  value?: string;
  hasError?: boolean;
}

const CodeDigitInput = forwardRef<HTMLInputElement, CodeDigitInputProps>(
  (
    {
      className,
      value = "",
      hasError = false,
      disabled,
      onFocus,
      onBlur,
      ...props
    },
    ref,
  ) => {
    const filled = value.length > 0;

    return (
      <div
        className={cn(
          "relative inline-flex size-code-digit shrink-0 items-center justify-center",
          "rounded-tight border border-solid",
          "transition-all duration-100",
          hasError
            ? "border-error-primary bg-secondary text-error-primary"
            : "border-secondary-border bg-secondary text-text",
          disabled &&
            "border-secondary-border-disabled bg-secondary-disabled ds-disabled-state",
          !disabled &&
            !hasError &&
            "focus-within:border-border-focus focus-within:shadow-focus-brand",
          className,
        )}
        data-filled={filled || undefined}
        data-error={hasError || undefined}
      >
        <BaseText
          aria-hidden
          fontSize={18}
          fontWeight={FontWeights.medium}
          className={cn(
            "pointer-events-none absolute inset-0 flex items-center justify-center",
            !filled && "opacity-0",
            hasError && "text-error-primary",
          )}
        >
          {filled ? value : "0"}
        </BaseText>
        <input
          ref={ref}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          disabled={disabled}
          value={value}
          aria-invalid={hasError || undefined}
          className={cn(
            "absolute inset-0 size-full appearance-none bg-transparent text-center",
            "text-[18px] font-medium text-transparent caret-transparent outline-none",
            "selection:bg-transparent",
          )}
          onFocus={onFocus}
          onBlur={onBlur}
          {...props}
        />
      </div>
    );
  },
);
CodeDigitInput.displayName = "CodeDigitInput";

export { CodeDigitInput };
