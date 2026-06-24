"use client";

import { Slot } from "@radix-ui/react-slot";
import {
  forwardRef,
  useCallback,
  useRef,
  type ComponentPropsWithoutRef,
  type ComponentPropsWithRef,
  type ElementType,
  type ForwardedRef,
  type ReactElement,
  type Ref,
} from "react";
import { cn } from "../../utils/cn";
import { ChevronDownIcon, IconSize, SearchIcon } from "../Icons";
// TextDropdownSize (+ its type) lives in ./constants (server-safe), re-exported
// via index.ts; imported here for internal size resolution.
import { TextDropdownSize } from "./constants";

/* DropdownTrigger (secondary button style) */

type TriggerOwnProps = {
  asChild?: boolean;
};

export type DropdownTriggerProps<TElement extends ElementType = "button"> =
  TriggerOwnProps &
    Omit<ComponentPropsWithoutRef<TElement>, keyof TriggerOwnProps>;

type DropdownTriggerComponent = <TElement extends ElementType = "button">(
  props: DropdownTriggerProps<TElement> & {
    ref?: ComponentPropsWithRef<TElement>["ref"];
  },
) => ReactElement | null;

export type DropdownTriggerContentProps = ComponentPropsWithoutRef<"div">;

const DropdownTriggerContent = forwardRef<
  HTMLDivElement,
  DropdownTriggerContentProps
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-row gap-xs", className)} {...props} />
));
DropdownTriggerContent.displayName = "DropdownTriggerContent";

const DropdownTriggerBase = forwardRef<
  HTMLElement,
  DropdownTriggerProps<ElementType>
>(({ className, children, asChild = false, ...props }, ref) => {
  const Comp = (asChild ? Slot : "button") as ElementType;
  return (
    <Comp
      ref={ref as ForwardedRef<HTMLElement>}
      className={cn(
        "inline-flex h-button items-center justify-center ds-gap-ui-xs",
        "min-w-40 rounded-tight border border-solid border-border",
        "bg-secondary text-secondary-fg",
        "ds-pl-ui-rg ds-pr-ui-sm",
        "text-style-button cursor-pointer select-none",
        "transition-all duration-150 ease-out",
        "[&:not(:disabled):not([aria-disabled=true])]:hover:bg-secondary-hover [&:not(:disabled):not([aria-disabled=true])]:hover:shadow-button-secondary",
        "[&:not(:disabled):not([aria-disabled=true])]:active:bg-secondary-active",
        "ds-focus-visible-ring",
        "ds-disabled-state",
        "disabled:bg-secondary-disabled disabled:border-border-disabled aria-disabled:bg-secondary-disabled aria-disabled:border-border-disabled",
        className,
      )}
      {...props}
    >
      <span className="flex-1 text-left">{children}</span>
      <ChevronDownIcon />
    </Comp>
  );
});
DropdownTriggerBase.displayName = "DropdownTrigger";

const DropdownTrigger = DropdownTriggerBase as DropdownTriggerComponent;

/*
 * TypeableDropdownTrigger — search-style field used with DropdownMenuTrigger asChild.
 * Root is a div (Radix merges button trigger props). Radix toggles the menu on every
 * trigger pointerDown — we skip that when the target is the input so the menu stays
 * open while typing. When the menu opens, content onOpenAutoFocus steals focus; pair
 * with DropdownMenuContent focusOnOpen={false} and we refocus the input on data-open.
 */

type TypeableInputProps = Pick<
  ComponentPropsWithoutRef<"input">,
  | "value"
  | "defaultValue"
  | "onChange"
  | "onInput"
  | "name"
  // "type" is intentionally omitted. DropdownMenuTrigger asChild uses Radix's Slot, which
  // merges its own type="button" onto this component's props. If "type" were accepted here
  // that injected value would reach the <input>, turning it into a non-typeable button field
  // (no placeholder, no text entry). The input is always type="text".
  | "disabled"
  | "autoComplete"
  | "autoFocus"
  | "readOnly"
  | "required"
  | "maxLength"
  | "minLength"
  | "pattern"
>;

export type TypeableDropdownTriggerProps = Omit<
  ComponentPropsWithoutRef<"div">,
  "children"
> &
  TypeableInputProps & {
    inputClassName?: string;
    inputRef?: Ref<HTMLInputElement>;
    placeholder?: string;
    /** Set by DropdownMenuTrigger when composed; used to refocus the input after open. */
    "data-state"?: "open" | "closed";
  };

const TypeableDropdownTrigger = forwardRef<
  HTMLDivElement,
  TypeableDropdownTriggerProps
>(
  (
    {
      className,
      inputClassName,
      inputRef,
      disabled,
      placeholder,
      value,
      defaultValue,
      onChange,
      onInput,
      name,
      autoComplete,
      autoFocus,
      readOnly,
      required,
      maxLength,
      minLength,
      pattern,
      onPointerDown,
      onKeyDown,
      "data-state": dataState,
      ...triggerProps
    },
    ref,
  ) => {
    const inputElRef = useRef<HTMLInputElement>(null);
    const setInputRef = useCallback(
      (node: HTMLInputElement | null) => {
        inputElRef.current = node;

        if (typeof inputRef === "function") {
          inputRef(node);
          return;
        }

        if (inputRef) {
          inputRef.current = node;
        }
      },
      [inputRef],
    );

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex h-button items-center ds-gap-ui-xs",
          "min-w-40 rounded-tight border border-solid border-border",
          "bg-secondary ds-pl-ui-rg ds-pr-ui-sm",
          "transition-all duration-150 ease-out",
          "[&:hover:not(:focus-within)]:border-border-hover [&:hover:not(:focus-within)]:shadow-button-secondary",
          "focus-within:border-border-focus ds-focus-within-ring",
          "data-[state=open]:border-border-focus data-[state=open]:ds-focus-ring",
          disabled ? "cursor-not-allowed" : "cursor-text",
          className,
        )}
        onPointerDown={(event) => {
          if (event.target === inputElRef.current) {
            if (dataState !== "open") {
              // Focus BEFORE calling Radix's handler. The DismissableLayer mounts
              // after this synchronous handler returns, so the focusin that fires
              // here has no listener and cannot trigger a focus-outside dismiss.
              inputElRef.current.focus();
              onPointerDown?.(event);
            }
            // Menu already open — stay open, let the user keep typing.
            return;
          }
          // Chrome click (icon, chevron, padding area)
          if (dataState !== "open") {
            // Same pre-focus trick: focus before Radix opens, not after.
            inputElRef.current?.focus();
          }
          onPointerDown?.(event);
        }}
        onKeyDown={(event) => {
          if (event.target === inputElRef.current) {
            if (event.key === "ArrowDown") {
              onKeyDown?.(event);
            }
            return;
          }
          onKeyDown?.(event);
        }}
        data-state={dataState}
        {...triggerProps}
      >
        <SearchIcon />
        <input
          ref={setInputRef}
          disabled={disabled}
          placeholder={placeholder}
          type="text"
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          onInput={onInput}
          name={name}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          readOnly={readOnly}
          required={required}
          maxLength={maxLength}
          minLength={minLength}
          pattern={pattern}
          className={cn(
            "h-full min-w-0 flex-1 bg-transparent text-left text-style-button text-text",
            "placeholder:text-text-tertiary outline-none",
            "ds-disabled-state",
            inputClassName,
          )}
        />
        <ChevronDownIcon />
      </div>
    );
  },
);
TypeableDropdownTrigger.displayName = "TypeableDropdownTrigger";

/* TextDropdownTrigger */

type TextDropdownTriggerOwnProps = {
  size?: TextDropdownSize;
  asChild?: boolean;
};

export type TextDropdownTriggerProps<TElement extends ElementType = "button"> =
  TextDropdownTriggerOwnProps &
    Omit<ComponentPropsWithoutRef<TElement>, keyof TextDropdownTriggerOwnProps>;

type TextDropdownTriggerComponent = <TElement extends ElementType = "button">(
  props: TextDropdownTriggerProps<TElement> & {
    ref?: ComponentPropsWithRef<TElement>["ref"];
  },
) => ReactElement | null;

const TextDropdownTriggerBase = forwardRef<
  HTMLElement,
  TextDropdownTriggerProps<ElementType>
>(
  (
    {
      className,
      children,
      size = TextDropdownSize.default,
      asChild = false,
      ...props
    },
    ref,
  ) => {
    const Comp = (asChild ? Slot : "button") as ElementType;
    return (
      <Comp
        ref={ref as ForwardedRef<HTMLElement>}
        className={cn(
          "inline-flex items-center ds-gap-ui-xs",
          "rounded-tight border border-transparent bg-transparent",
          "cursor-pointer select-none transition-all duration-150 ease-out",
          "ds-focus-visible-ring",
          "ds-disabled-state",
          size === TextDropdownSize.default &&
            "h-[30px] ds-px-ui-xs text-style-button text-ghost-fg [&:not(:disabled):not([aria-disabled=true])]:hover:text-ghost-fg-active",
          size === TextDropdownSize.sm &&
            "ds-px-ui-xs text-style-label text-ghost-fg [&:not(:disabled):not([aria-disabled=true])]:hover:text-ghost-fg-active",
          className,
        )}
        {...props}
      >
        <span>{children}</span>
        <ChevronDownIcon
          size={
            size === TextDropdownSize.sm ? IconSize.tiny : IconSize.standard
          }
        />
      </Comp>
    );
  },
);
TextDropdownTriggerBase.displayName = "TextDropdownTrigger";

const TextDropdownTrigger =
  TextDropdownTriggerBase as TextDropdownTriggerComponent;

export {
  DropdownTrigger,
  DropdownTriggerContent,
  TextDropdownTrigger,
  TypeableDropdownTrigger,
};
