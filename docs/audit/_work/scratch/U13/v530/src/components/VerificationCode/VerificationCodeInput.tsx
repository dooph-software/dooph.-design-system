/*
 * VerificationCodeInput — multi-digit OTP / verification group.
 *
 * ## behavior
 * - Renders `length` (default 6) CodeDigitInput cells. Controlled via `value` +
 *   `onChange`, or uncontrolled via `defaultValue`.
 * - Digits only; auto-advance, backspace to previous, arrow navigation, paste.
 * - `hasError` paints every cell with error-primary; `disabled` disables all.
 *
 * ## constraints
 * - Digit glyphs go through CodeDigitInput → BaseText (18 / medium / body).
 * - Do not ship a package-level “verification section” layout — compose in
 *   stories / apps with role text + Button.
 */
"use client";

import {
  forwardRef,
  useCallback,
  useRef,
  useState,
  type ClipboardEvent,
  type KeyboardEvent,
  type HTMLAttributes,
} from "react";
import { cn } from "../../utils/cn";
import { CodeDigitInput } from "./CodeDigitInput";

export interface VerificationCodeInputProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  length?: number;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  hasError?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  "aria-label"?: string;
}

const onlyDigits = (s: string) => s.replace(/\D/g, "");

const VerificationCodeInput = forwardRef<
  HTMLDivElement,
  VerificationCodeInputProps
>(
  (
    {
      className,
      length = 6,
      value: valueProp,
      defaultValue = "",
      onChange,
      hasError = false,
      disabled = false,
      autoFocus = false,
      "aria-label": ariaLabel = "Verification code",
      ...props
    },
    ref,
  ) => {
    const isControlled = valueProp !== undefined;
    const [internal, setInternal] = useState(() =>
      onlyDigits(defaultValue).slice(0, length),
    );
    const value = (
      isControlled ? onlyDigits(valueProp) : internal
    ).slice(0, length);
    const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

    const setValue = useCallback(
      (next: string) => {
        const clipped = onlyDigits(next).slice(0, length);
        if (!isControlled) setInternal(clipped);
        onChange?.(clipped);
      },
      [isControlled, length, onChange],
    );

    const focusAt = (index: number) => {
      const el = inputsRef.current[Math.max(0, Math.min(length - 1, index))];
      el?.focus();
      el?.select();
    };

    const writeDigit = (index: number, raw: string) => {
      const digit = onlyDigits(raw).slice(-1);
      const next = Array.from({ length }, (_, i) => value[i] ?? "");
      next[index] = digit;
      setValue(next.join(""));
      if (digit && index < length - 1) focusAt(index + 1);
    };

    const onKeyDown = (
      index: number,
      event: KeyboardEvent<HTMLInputElement>,
    ) => {
      if (event.key === "Backspace") {
        event.preventDefault();
        const next = Array.from({ length }, (_, i) => value[i] ?? "");
        if (next[index]) {
          next[index] = "";
          setValue(next.join(""));
        } else if (index > 0) {
          next[index - 1] = "";
          setValue(next.join(""));
          focusAt(index - 1);
        }
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        focusAt(index - 1);
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        focusAt(index + 1);
      }
    };

    const onPaste = (event: ClipboardEvent<HTMLInputElement>) => {
      event.preventDefault();
      const pasted = onlyDigits(event.clipboardData.getData("text")).slice(
        0,
        length,
      );
      if (!pasted) return;
      setValue(pasted);
      focusAt(Math.min(pasted.length, length - 1));
    };

    return (
      <div
        ref={ref}
        role="group"
        aria-label={ariaLabel}
        className={cn("flex items-center gap-xs", className)}
        {...props}
      >
        {Array.from({ length }, (_, index) => (
          <CodeDigitInput
            key={index}
            ref={(el) => {
              inputsRef.current[index] = el;
            }}
            value={value[index] ?? ""}
            hasError={hasError}
            disabled={disabled}
            autoFocus={autoFocus && index === 0}
            onChange={(e) => writeDigit(index, e.target.value)}
            onKeyDown={(e) => onKeyDown(index, e)}
            onPaste={onPaste}
            aria-label={`Digit ${index + 1} of ${length}`}
          />
        ))}
      </div>
    );
  },
);
VerificationCodeInput.displayName = "VerificationCodeInput";

export { VerificationCodeInput };
