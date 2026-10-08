/*
 * Input — Figma `Input`: text or number, optionally with a leading icon.
 *
 * ## behavior
 * - `InputVariant.text` (default) renders a bare `<input>` carrying its own
 *   chrome. Every other variant renders a wrapper `<div>` with the chrome
 *   (border, background, hover, `focus-within` ring) around a transparent
 *   `<input>`. `className` always lands on the chrome element; every other
 *   prop, and `ref`, always land on the `<input>`.
 * - Number variants use the mono role, pad 12px both sides, centre their
 *   content, never shrink below one button height (a square) and grow with the
 *   value. The icon variants require `icon`.
 * - Clicking the wrapper's chrome (padding, icon) focuses the input.
 *
 * ## constraints
 * - The number variants HUG their value through a hidden mirror span that
 *   shares a grid cell with the input. A native `<input>` sizes from its `size`
 *   attribute, never its value, so neither flex nor `width: auto` can make it
 *   hug; `field-sizing: content` is not in Safari or Firefox. Deleting the
 *   "invisible" span collapses the field to the browser's ~20ch default.
 * - The mirror follows the value the component can see: `value` when
 *   controlled, its own state (fed by `onChange`) when not. Writing
 *   `input.value` imperatively through the ref bypasses it — set `value`
 *   instead. The consumer's `onChange` always still runs.
 * - `InputVariant.text` without `icon` stays a bare `<input>`: existing
 *   consumers style and measure that element directly, and wrapping it would
 *   move their `className` onto a different node.
 * - An icon variant without `icon` throws. The props union is the real guard;
 *   the throw covers JavaScript consumers and runtime-computed variants —
 *   rendering a variant with an empty icon slot would silently misreport what
 *   was asked for (same rule as SliderVariant.custom).
 */
"use client";

import {
  forwardRef,
  useRef,
  useState,
  type ChangeEvent,
  type InputHTMLAttributes,
  type PointerEvent,
  type ReactNode,
} from "react";
import { cn } from "../../utils/cn";
import { InputVariant } from "./constants";

type InputBaseProps = InputHTMLAttributes<HTMLInputElement> & {
  hasError?: boolean;
};

export type InputProps =
  | (InputBaseProps & {
      variant?: typeof InputVariant.text | typeof InputVariant.number;
      icon?: never;
    })
  | (InputBaseProps & {
      variant: typeof InputVariant.iconText | typeof InputVariant.iconNumber;
      /** Leading icon, e.g. <PencilIcon />. Sized by the icon itself (14px default). */
      icon: ReactNode;
    });

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      hasError,
      variant = InputVariant.text,
      icon,
      value,
      defaultValue,
      onChange,
      placeholder,
      disabled,
      ...props
    },
    ref,
  ) => {
    const isNumber =
      variant === InputVariant.number || variant === InputVariant.iconNumber;
    const hasIcon =
      variant === InputVariant.iconText || variant === InputVariant.iconNumber;

    const inputEl = useRef<HTMLInputElement | null>(null);
    const setRefs = (node: HTMLInputElement | null) => {
      inputEl.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    };

    const isControlled = value !== undefined;
    const [uncontrolledValue, setUncontrolledValue] = useState(() =>
      String(defaultValue ?? ""),
    );
    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) setUncontrolledValue(event.target.value);
      onChange?.(event);
    };

    if (hasIcon && icon == null) {
      throw new Error(
        `Input: variant "${variant}" requires an \`icon\` prop.`,
      );
    }

    const fieldProps = {
      ...props,
      ref: setRefs,
      value,
      defaultValue,
      onChange: handleChange,
      placeholder,
      disabled,
    };

    if (!isNumber && !hasIcon) {
      return (
        <input
          {...fieldProps}
          className={cn(
            "flex h-button w-full rounded-tight border border-solid border-border-primary bg-secondary",
            "ds-pl-ui-rg ds-pr-ui-sm",
            "text-style-button text-text placeholder:text-text-tertiary",
            "transition-all duration-100 ds-focus-ring-on-focus",
            "hover:border-input-border-hover hover:shadow-button-secondary",
            "focus:border-input-border-focus",
            "disabled:bg-secondary-disabled disabled:border-secondary-border-disabled ds-disabled-state",
            hasError &&
              "border-danger-primary focus:border-input-border-danger-focus ds-focus-ring-danger-on-focus",
            className,
          )}
        />
      );
    }

    const fieldText = isNumber ? "text-style-mono" : "text-style-button";
    const innerInputClass = cn(
      "min-w-0 bg-transparent outline-none",
      fieldText,
      "text-text placeholder:text-text-tertiary ds-disabled-state",
    );

    // Chrome clicks focus the field; the input handles its own pointer events.
    const focusFromChrome = (event: PointerEvent<HTMLDivElement>) => {
      if (disabled || event.target === inputEl.current) return;
      event.preventDefault();
      inputEl.current?.focus();
    };

    const mirrorText =
      (isControlled ? String(value) : uncontrolledValue) || placeholder || "";

    return (
      <div
        onPointerDown={focusFromChrome}
        data-disabled={disabled ? "" : undefined}
        className={cn(
          "h-button items-center rounded-tight border border-solid border-border-primary bg-secondary",
          "transition-all duration-100 ds-focus-within-ring",
          isNumber
            ? "inline-flex min-w-button justify-center ds-pl-ui-rg ds-pr-ui-rg"
            : "flex w-full ds-pl-ui-rg ds-pr-ui-sm",
          hasIcon && (isNumber ? "gap-xxs" : "gap-xs"),
          disabled
            ? "cursor-not-allowed bg-secondary-disabled border-secondary-border-disabled"
            : [
                "cursor-text",
                !hasError &&
                  "[&:hover:not(:focus-within)]:border-input-border-hover [&:hover:not(:focus-within)]:shadow-button-secondary",
                "focus-within:border-input-border-focus",
              ],
          hasError &&
            "border-danger-primary focus-within:border-input-border-danger-focus ds-focus-within-ring-danger",
          className,
        )}
      >
        {hasIcon && (
          <span
            aria-hidden
            className={cn(
              "flex shrink-0 text-text",
              disabled && "ds-opacity-disabled",
            )}
          >
            {icon}
          </span>
        )}
        {isNumber ? (
          <span className="inline-grid min-w-0">
            {/* Sizes the cell to the value — see the header. */}
            <span
              aria-hidden
              className={cn(
                "invisible whitespace-pre [grid-area:1/1] pr-px",
                fieldText,
              )}
            >
              {mirrorText}
            </span>
            <input
              {...fieldProps}
              // w-0 + min-w-full: contributes nothing to the cell's size (its
              // ~20ch intrinsic width would prop the cell open), then fills it.
              className={cn(innerInputClass, "[grid-area:1/1] w-0 min-w-full")}
            />
          </span>
        ) : (
          <input
            {...fieldProps}
            className={cn("h-full flex-1", innerInputClass)}
          />
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export { Input };
