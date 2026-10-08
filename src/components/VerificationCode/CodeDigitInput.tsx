/*
 * CodeDigitInput — single verification-code cell (visual + optional input).
 *
 * ## behavior
 * - 46px (`size-code-digit`), `rounded-tight`, secondary surface/border.
 * - Digit glyph is always `BaseText` at `--ui-text-code-digit` (18px) /
 *   medium (body role) — never SubheadingText and never a raw HTML text node.
 *   The input's transparent glyph uses the same token (`text-code-digit`).
 * - `hasError` paints danger-primary border + text; `disabled` uses secondary
 *   disabled tokens + `ds-radix-data-disabled` on the cell (the inner `<input>`
 *   carries `disabled`); focus uses the prominent focus ring.
 * - `className` styles the cell `<div>` (the chrome); `ref`, `style` and every
 *   other prop land on the `<input>`.
 *
 * ## constraints
 * - Compose multi-digit flows through VerificationCodeInput — a hand-built
 *   row of cells loses its auto-advance, backspace, arrow navigation, paste
 *   and sequential entry.
 * - Do not hardcode Host Grotesk here; body role + size/weight props own it.
 */
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
          "ds-motion-state",
          "group/code-digit border-secondary-border bg-secondary text-text",
          // Error border yields to the disabled border, as the old class order did.
          "data-[error]:text-danger-primary [&[data-error]:not([data-disabled])]:border-danger-primary",
          disabled &&
            "border-secondary-border-disabled bg-secondary-disabled ds-radix-data-disabled",
          !disabled && "ds-focus-within-ring",
          !disabled && !hasError && "focus-within:border-input-border-focus",
          !disabled && hasError && "ds-focus-within-ring-danger",
          className,
        )}
        data-filled={filled || undefined}
        data-disabled={disabled || undefined}
        data-error={hasError || undefined}
      >
        <BaseText
          aria-hidden
          fontSize="var(--ui-text-code-digit)"
          fontWeight={FontWeights.medium}
          className={cn(
            "pointer-events-none absolute inset-0 flex items-center justify-center",
            "opacity-0 group-data-[filled]/code-digit:opacity-100",
            "group-data-[error]/code-digit:text-danger-primary",
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
            "text-code-digit font-medium text-transparent caret-transparent outline-none",
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
