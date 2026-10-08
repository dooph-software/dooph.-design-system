/*
 * Input — Figma `Input`: text or number, optionally with a leading icon.
 *
 * ## behavior
 * - `InputVariant.text` (default) renders a bare `<input>` carrying its own
 *   chrome. Every other variant renders a wrapper `<div>` with the chrome
 *   (border, background, hover, `focus-within` ring) around a transparent
 *   `<input>`. `className` always lands on the chrome element; every other
 *   prop, and `ref`, always land on the `<input>`.
 * - Number variants use the mono role, pad 12px both sides, never shrink below
 *   one button height (a square) and set `inputMode="decimal"` (a consumer's
 *   own `inputMode` wins). By default they are FIXED width like the text
 *   variant — they fill their container or take a consumer width — and
 *   left-align their content, icon included. The opt-in `autoWidth` prop makes
 *   them hug the value instead and centre their content. The icon variants
 *   require an `icon` element.
 * - `format` (number variants only, default off) formats the value for
 *   display with `Intl.NumberFormat` — `true` or an options object, in `locale`
 *   (default: the runtime's). Format on blur: while the field is focused it
 *   shows the raw value, and it shows the formatted one otherwise. The raw
 *   value is a plain numeric string with "." as the decimal point. Users never
 *   type separators: grouping separators and whitespace are stripped from typed
 *   or pasted text, and the locale's decimal separator is read as the decimal
 *   point (the focused field shows that separator, the raw value does not).
 *   Text that is not a plain number is shown as typed, never reformatted.
 * - `onValueChange(value)` fires on every change with the raw string — the
 *   input's own value, or the stripped numeric string when `format` is on.
 *   `onChange` keeps native semantics and always still runs; with `format` on,
 *   its `event.target.value` is the displayed text, so read `onValueChange`.
 *   `value` / `defaultValue` are raw values in both modes.
 * - Number variants filter at ENTRY: only digits, one decimal separator and a
 *   leading minus (only when `min` is undefined or negative) can be typed; a
 *   keystroke or paste that would add nothing valid is blocked in
 *   `onBeforeInput`, and whatever slips through (partly valid paste,
 *   autofill, IME) is sanitised in the change handler before `onChange` /
 *   `onValueChange` run — so a paste of "12ab3.4.5" becomes "123.45". The
 *   decimal separator is the `locale`'s when `format` is on, else "."; the
 *   comma (or the locale's group separator) and whitespace are stripped as
 *   grouping. Consumer `onBeforeInput`, `onChange` and `onPaste` still run.
 * - `min` / `max` (number variants, numbers) never clamp. When the committed
 *   value is outside [min, max] the field shows the danger chrome and sets
 *   `aria-invalid`. Committed means the value on blur when uncontrolled (the
 *   `defaultValue` until then) and the current `value` when controlled.
 *   Empty or half-typed text ("-", ".") is never out of range.
 * - `hasError` paints the danger chrome and sets `aria-invalid` on the
 *   `<input>` (a consumer's own `aria-invalid` wins). It is authoritative:
 *   `true` forces the error, `false` suppresses the range-derived one, and
 *   only when it is omitted does the range decide.
 * - Clicking the wrapper's chrome (padding, icon) focuses the input.
 *
 * ## constraints
 * - ONLY `autoWidth` number variants HUG their value, through a hidden mirror
 *   span that shares a grid cell with the input. A native `<input>` sizes from
 *   its `size` attribute, never its value, so neither flex nor `width: auto`
 *   can make it hug; `field-sizing: content` is not in Safari or Firefox.
 *   Deleting the "invisible" span collapses an `autoWidth` field to the
 *   browser's ~20ch default. Without `autoWidth` there is no mirror span and
 *   the field must not hug: dashboards must not shift layout under typing.
 * - The mirror follows the text the field displays: the formatted value when
 *   `format` is on and the field is blurred, else the raw value — `value` when
 *   controlled, its own state (fed by `onChange`) when not. Writing
 *   `input.value` imperatively through the ref bypasses it — set `value`
 *   instead. The consumer's `onChange` always still runs.
 * - With `format` on the `<input>` is always controlled by this component (the
 *   displayed text differs from the raw value), so the DOM `value` is the
 *   display text and `defaultValue` is never passed down. Raw state stays
 *   `value` or the component's own state, never the display text, or blur
 *   would re-parse formatted text.
 * - Input filtering happens at entry, never as a validation error after the
 *   fact: an invalid character must not reach the DOM value, `onChange` or
 *   `onValueChange`. Range errors are DERIVED from the committed value on
 *   every render and never stored, and `hasError` always overrides them, so
 *   a consumer's own validation can't be fought by the automatic one. Never
 *   clamp `value`: the consumer decides what to do with an out-of-range number.
 * - `InputVariant.text` without `icon` stays a bare `<input>`: existing
 *   consumers style and measure that element directly, and wrapping it would
 *   move their `className` onto a different node.
 * - An icon variant without an `icon` element (null, false, "" included)
 *   throws. The props union is the real guard (`icon` is a `ReactElement`);
 *   the throw covers JavaScript consumers and runtime-computed variants —
 *   rendering a variant with an empty icon slot would silently misreport what
 *   was asked for (same rule as SliderVariant.custom).
 */
"use client";

import {
  forwardRef,
  isValidElement,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type InputEvent as ReactInputEvent,
  type InputHTMLAttributes,
  type PointerEvent,
  type ReactElement,
} from "react";
import { cn } from "../../utils/cn";
import { BaseText, ButtonText, TextVariant } from "../Text";
import { useComposedRefs } from "../../utils/composeRefs";
import { InputVariant } from "./constants";

type InputBaseProps = Omit<InputHTMLAttributes<HTMLInputElement>, "min" | "max"> & {
  /**
   * Forces the error chrome and `aria-invalid` on (`true`) or off (`false`).
   * Omit it to let `min` / `max` decide on number variants.
   */
  hasError?: boolean;
  /**
   * Number variants: lowest allowed value. Also decides whether a leading minus
   * can be typed (only when `min` is undefined or negative). Out-of-range
   * committed values show the error state; the value is never clamped.
   */
  min?: number;
  /** Number variants: highest allowed value; out-of-range shows the error state, never clamps. */
  max?: number;
  /** Number variants: hug the value instead of filling the container. Default off. */
  autoWidth?: boolean;
  /**
   * Number variants: show the value formatted with `Intl.NumberFormat` while the
   * field is not focused (raw while focused). `true` keeps every fraction digit;
   * pass options to control them. Default off.
   */
  format?: boolean | Intl.NumberFormatOptions;
  /** BCP 47 locale for `format`. Pass it for SSR-stable output. Default: the runtime's. */
  locale?: string;
  /** Fires on every change with the raw string (separators stripped when `format` is on). */
  onValueChange?: (value: string) => void;
};

type NumberSeparators = { group: string; decimal: string };

const NUMBER_PATTERN = /^-?\d+(\.\d+)?$/;
const WHITESPACE = /[\s  ]/g;
const escapeRegExp = (text: string) =>
  text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const DEFAULT_SEPARATORS: NumberSeparators = { group: ",", decimal: "." };

/**
 * Keeps only what a number field may show: digits, one decimal separator and,
 * when allowed, a leading minus. Grouping separators and whitespace are
 * stripped. The decimal stays the locale's (display form).
 */
function sanitizeNumberText(
  text: string,
  { group, decimal }: NumberSeparators,
  allowNegative: boolean,
) {
  let rest = text.replace(WHITESPACE, "");
  if (group) rest = rest.replace(new RegExp(escapeRegExp(group), "g"), "");
  let out = "";
  let hasDecimal = false;
  for (const char of rest) {
    if (char >= "0" && char <= "9") out += char;
    else if (char === decimal && !hasDecimal) {
      hasDecimal = true;
      out += char;
    } else if ((char === "-" || char === "\u2212") && allowNegative && out === "") {
      out = "-";
    }
  }
  return out;
}

/** Display text (locale decimal) to a raw numeric string ("." decimal). */
function toRaw(text: string, { decimal }: NumberSeparators) {
  return decimal === "." ? text : text.replace(decimal, ".");
}

function isOutOfRange(raw: string, min?: number, max?: number) {
  if (raw.trim() === "") return false;
  const n = Number(raw);
  if (!Number.isFinite(n)) return false;
  return (min !== undefined && n < min) || (max !== undefined && n > max);
}

export type InputProps =
  | (InputBaseProps & {
      variant?: typeof InputVariant.text | typeof InputVariant.number;
      icon?: never;
    })
  | (InputBaseProps & {
      variant: typeof InputVariant.iconText | typeof InputVariant.iconNumber;
      /** Leading icon, e.g. <PencilIcon />. Sized by the icon itself (14px default). */
      icon: ReactElement;
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
      onBeforeInput,
      onValueChange,
      min,
      max,
      onFocus,
      onBlur,
      autoWidth,
      format,
      locale,
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
    const setRefs = useComposedRefs(inputEl, ref);

    const isControlled = value !== undefined;
    const [uncontrolledValue, setUncontrolledValue] = useState(() =>
      String(defaultValue ?? ""),
    );

    // Format on blur — see the header. Off unless asked, and number variants only.
    const formatOn = isNumber && !!format;
    const formatKey = typeof format === "object" ? JSON.stringify(format) : !!format;
    const formatting = useMemo(() => {
      if (!formatOn) return null;
      const options: Intl.NumberFormatOptions =
        typeof format === "object" ? format : { maximumFractionDigits: 20 };
      const parts = new Intl.NumberFormat(locale, {
        minimumFractionDigits: 1,
        useGrouping: true,
      }).formatToParts(11111.1);
      return {
        formatter: new Intl.NumberFormat(locale, options),
        separators: {
          group: parts.find((part) => part.type === "group")?.value ?? "",
          decimal: parts.find((part) => part.type === "decimal")?.value ?? ".",
        },
      };
      // formatKey stands in for `format`: an inline options object changes identity every render.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formatOn, formatKey, locale]);
    const [focused, setFocused] = useState(false);
    // The value as of the last blur (uncontrolled range check) — see the header.
    const [committedValue, setCommittedValue] = useState(() =>
      String(defaultValue ?? ""),
    );

    // Entry filter — see the header. Number variants only.
    const separators = formatting?.separators ?? DEFAULT_SEPARATORS;
    const allowNegative = min === undefined || min < 0;

    const handleBeforeInput = (event: ReactInputEvent<HTMLInputElement>) => {
      onBeforeInput?.(event);
      if (event.defaultPrevented || (event.nativeEvent as InputEvent).isComposing) {
        return;
      }
      const { data } = event;
      const input = event.currentTarget;
      if (!data || input.selectionStart === null || input.selectionEnd === null) {
        return;
      }
      const before = input.value.slice(0, input.selectionStart);
      const after = input.value.slice(input.selectionEnd);
      // Block only an insertion that adds nothing valid; a partly valid paste
      // goes through and handleChange sanitises it.
      const kept = sanitizeNumberText(before + after, separators, allowNegative);
      const next = sanitizeNumberText(before + data + after, separators, allowNegative);
      if (next === kept) event.preventDefault();
    };

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      let display = event.target.value;
      if (isNumber) {
        const caret = event.target.selectionStart ?? display.length;
        const clean = sanitizeNumberText(display, separators, allowNegative);
        if (clean !== display) {
          const cleanCaret = sanitizeNumberText(
            display.slice(0, caret),
            separators,
            allowNegative,
          ).length;
          // Before onChange, so the consumer reads the sanitised text.
          event.target.value = clean;
          event.target.setSelectionRange(cleanCaret, cleanCaret);
          display = clean;
        }
      }
      const raw = formatting ? toRaw(display, formatting.separators) : display;
      if (!isControlled) setUncontrolledValue(raw);
      onChange?.(event);
      onValueChange?.(raw);
    };
    const handleFocus = (event: FocusEvent<HTMLInputElement>) => {
      if (formatting) setFocused(true);
      onFocus?.(event);
    };
    const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
      if (formatting) setFocused(false);
      setCommittedValue(rawValue);
      onBlur?.(event);
    };

    const rawValue = isControlled ? String(value) : uncontrolledValue;
    // Range errors are derived, and hasError always wins — see the header.
    const outOfRange =
      isNumber &&
      isOutOfRange(isControlled ? rawValue : committedValue, min, max);
    const showError = hasError ?? outOfRange;
    let displayValue: string | undefined;
    if (formatting) {
      if (focused) {
        displayValue =
          formatting.separators.decimal === "."
            ? rawValue
            : rawValue.replace(".", formatting.separators.decimal);
      } else {
        displayValue = NUMBER_PATTERN.test(rawValue)
          ? formatting.formatter.format(rawValue as unknown as number)
          : rawValue;
      }
    }

    if (hasIcon && !isValidElement(icon)) {
      throw new Error(
        `[Input] variant "${variant}" requires an \`icon\` element, e.g. icon={<PencilIcon />}.`,
      );
    }

    const fieldProps = {
      // Before ...props, so a consumer's explicit aria-invalid still wins
      // (the CodeDigitInput order).
      "aria-invalid": showError || undefined,
      ...(isNumber
        ? { inputMode: "decimal" as const, onBeforeInput: handleBeforeInput }
        : { onBeforeInput, min, max }),
      ...props,
      ref: setRefs,
      // With `format` the input is always controlled by the display text — see the header.
      value: formatting ? displayValue : value,
      defaultValue: formatting ? undefined : defaultValue,
      onChange: handleChange,
      onFocus: handleFocus,
      onBlur: handleBlur,
      placeholder,
      disabled,
    };

    if (!isNumber && !hasIcon) {
      return (
        <ButtonText
          as="input"
          {...fieldProps}
          className={cn(
            "flex h-button w-full rounded-tight border border-solid border-border-primary bg-secondary",
            "ds-pl-ui-md ds-pr-ui-rg",
            "text-text placeholder:text-text-tertiary",
            "ds-motion-state ds-focus-ring-on-focus",
            // `enabled:` keeps a disabled input from lifting; `not-focus:` keeps the
            // focus border winning over the hover border, as the plain `hover:`
            // did by coming earlier in the sheet.
            "enabled:hover:not-focus:border-input-border-hover enabled:hover:shadow-button-secondary",
            "focus:border-input-border-focus",
            "disabled:bg-secondary-disabled disabled:border-secondary-border-disabled ds-disabled-state",
            showError &&
              "border-danger-primary focus:border-input-border-danger-focus ds-focus-ring-danger-on-focus",
            className,
          )}
        />
      );
    }

    const fieldRole = isNumber ? TextVariant.mono : TextVariant.button;
    const innerInputClass = cn(
      "min-w-0 bg-transparent outline-none",
      "text-text placeholder:text-text-tertiary ds-disabled-state",
    );

    // Chrome clicks focus the field; the input handles its own pointer events.
    const focusFromChrome = (event: PointerEvent<HTMLDivElement>) => {
      if (disabled || event.target === inputEl.current) return;
      event.preventDefault();
      inputEl.current?.focus();
    };

    const hugs = isNumber && !!autoWidth;
    const mirrorText = (displayValue ?? rawValue) || placeholder || "";

    return (
      <div
        onPointerDown={focusFromChrome}
        data-disabled={disabled ? "" : undefined}
        className={cn(
          "h-button items-center rounded-tight border border-solid border-border-primary bg-secondary",
          "ds-motion-state ds-focus-within-ring",
          hugs
            ? "inline-flex min-w-button justify-center ds-pl-ui-md ds-pr-ui-md"
            : isNumber
              ? "flex w-full min-w-button ds-pl-ui-md ds-pr-ui-md"
              : "flex w-full ds-pl-ui-md ds-pr-ui-rg",
          hasIcon && (isNumber ? "gap-xxs" : "gap-sm"),
          "cursor-text data-[disabled]:cursor-not-allowed data-[disabled]:bg-secondary-disabled",
          // The error border wins over the disabled one here, as it did when
          // this was a class ternary (the error classes came later in cn).
          !showError && "data-[disabled]:border-secondary-border-disabled",
          !showError &&
            "[&:hover:not(:focus-within):not([data-disabled])]:border-input-border-hover [&:hover:not(:focus-within):not([data-disabled])]:shadow-button-secondary",
          "focus-within:border-input-border-focus",
          showError &&
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
        {hugs ? (
          <span className="inline-grid min-w-0">
            {/* Sizes the cell to the value — see the header. */}
            <BaseText
              aria-hidden
              variant={fieldRole}
              className="invisible whitespace-pre [grid-area:1/1] pr-px"
            >
              {mirrorText}
            </BaseText>
            <BaseText
              as="input"
              variant={fieldRole}
              {...fieldProps}
              // w-0 + min-w-full: contributes nothing to the cell's size (its
              // ~20ch intrinsic width would prop the cell open), then fills it.
              className={cn(innerInputClass, "[grid-area:1/1] w-0 min-w-full")}
            />
          </span>
        ) : (
          <BaseText
            as="input"
            variant={fieldRole}
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
