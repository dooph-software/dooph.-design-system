/*
 * VerificationCodeInput — multi-digit OTP / verification group.
 *
 * ## behavior
 * - Renders `length` (default 6) CodeDigitInput cells. Controlled via `value` +
 *   `onValueChange`, or uncontrolled via `defaultValue`.
 * - Digits only; auto-advance, backspace to previous, arrow navigation, paste.
 * - Entry is sequential: the value is a gapless digit string, so focusing an
 *   empty cell beyond the first empty one (tap, Tab, ArrowRight) moves focus to
 *   the first empty cell, and a digit is never written past it.
 *   Backspace on a filled middle cell deletes that digit; later digits shift
 *   left and focus stays on the same cell.
 * - `hasError` paints every cell with error-primary; `disabled` disables all.
 *
 * ## constraints
 * - Digit glyphs go through CodeDigitInput → BaseText (18 / medium / body).
 * - Do not ship a package-level “verification section” layout — compose in
 *   stories / apps with role text + Button; a packaged layout would fix copy
 *   and a Button arrangement that each app has to own.
 * - Focus moves made by this component (`focusAt`) skip the sequential-entry
 *   redirect. They run inside the same event as `setValue`, before the new
 *   value renders, so the redirect would read the stale value and bounce focus
 *   back (e.g. auto-advance after typing into the first empty cell). Every
 *   `focusAt` target must therefore already be a legal cell.
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
  onValueChange?: (value: string) => void;
  hasError?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  /** Accessible name of each digit cell. Default `Digit ${index + 1} of ${length}`. */
  digitLabel?: (index: number, length: number) => string;
}

const onlyDigits = (s: string) => s.replace(/\D/g, "");

const defaultDigitLabel = (index: number, length: number) =>
  `Digit ${index + 1} of ${length}`;

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
      onValueChange,
      hasError = false,
      disabled = false,
      autoFocus = false,
      "aria-label": ariaLabel = "Verification code",
      digitLabel = defaultDigitLabel,
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
    // True while focusAt moves focus, so the cell's onFocus redirect (which
    // reads the value from the last render) leaves component moves alone.
    const movingFocusRef = useRef(false);

    const setValue = useCallback(
      (next: string) => {
        const clipped = onlyDigits(next).slice(0, length);
        if (!isControlled) setInternal(clipped);
        onValueChange?.(clipped);
      },
      [isControlled, length, onValueChange],
    );

    const focusAt = (index: number) => {
      const el = inputsRef.current[Math.max(0, Math.min(length - 1, index))];
      movingFocusRef.current = true;
      try {
        el?.focus();
      } finally {
        movingFocusRef.current = false;
      }
      el?.select();
    };

    const writeDigit = (index: number, raw: string) => {
      const digit = onlyDigits(raw).slice(-1);
      // The value is a gapless string, so a digit can only go into a filled
      // cell or the first empty one. Clamp, so a stale focus cannot place it
      // out of position.
      const at = Math.min(index, value.length);
      const next = Array.from({ length }, (_, i) => value[i] ?? "");
      next[at] = digit;
      setValue(next.join(""));
      if (digit && at < length - 1) focusAt(at + 1);
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
        // Never past the first empty cell (sequential entry).
        focusAt(Math.min(index + 1, value.length));
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
        className={cn("flex items-center gap-sm", className)}
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
            // Entry is sequential: an empty cell past the first empty one cannot
            // hold a digit (the value has no holes), so focus moves back to it.
            onFocus={() => {
              if (!movingFocusRef.current && index > value.length)
                focusAt(value.length);
            }}
            aria-label={digitLabel(index, length)}
          />
        ))}
      </div>
    );
  },
);
VerificationCodeInput.displayName = "VerificationCodeInput";

export { VerificationCodeInput };
