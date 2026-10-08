"use client";

import { Slot, Slottable } from "@radix-ui/react-slot";
import {
  forwardRef,
  useRef,
  type ComponentPropsWithoutRef,
  type ComponentPropsWithRef,
  type ElementType,
  type ForwardedRef,
  type ReactElement,
  type Ref,
} from "react";
import { cn } from "../../utils/cn";
import { BaseText, ButtonText, TextVariant } from "../Text";
import { useComposedRefs } from "../../utils/composeRefs";
import { DropdownCaret, DropdownCaretVariant } from "../DropdownCaret";
import { ChevronDownIcon, IconSize, SearchIcon } from "../Icons";
import type { DropdownMenuSelectType } from "../Menu/constants";
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
  <div ref={ref} className={cn("flex flex-row gap-sm", className)} {...props} />
));
DropdownTriggerContent.displayName = "DropdownTriggerContent";

/* Typed at the default element so the render body's bindings keep their
 * types; only the exported cast is polymorphic. */
const DropdownTriggerBase = forwardRef<
  HTMLElement,
  DropdownTriggerProps<"button">
>(({ className, children, asChild = false, ...props }, ref) => {
  const Comp = (asChild ? Slot : "button") as ElementType;
  return (
    <ButtonText
      as={Comp}
      ref={ref as ForwardedRef<HTMLElement>}
      className={cn(
        "inline-flex h-button items-center justify-center ds-gap-ui-sm",
        "min-w-menu rounded-tight border border-solid border-border-primary",
        "bg-secondary text-secondary-fg",
        "ds-dropdown-caret-host ds-pl-ui-md",
        "cursor-pointer select-none",
        "ds-motion-state",
        "[&:not(:disabled):not([aria-disabled=true])]:hover:bg-secondary-hover [&:not(:disabled):not([aria-disabled=true])]:hover:shadow-button-secondary",
        "[&:not(:disabled):not([aria-disabled=true])]:active:bg-secondary-active",
        "ds-focus-visible-ring",
        "ds-disabled-state",
        "disabled:bg-secondary-disabled disabled:border-secondary-border-disabled aria-disabled:bg-secondary-disabled aria-disabled:border-secondary-border-disabled",
        className,
      )}
      {...props}
    >
      {/* flex-1 pushes the caret to the far edge; Slottable marks the asChild target. */}
      <Slottable child={children}>
        {(child) => <span className="flex-1 text-left">{child}</span>}
      </Slottable>
      <DropdownCaret variant={DropdownCaretVariant.dropdown} />
    </ButtonText>
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
 * displayValue renders the selection summary (Figma Single/Multi) in the primary
 * tone; placeholder is the empty (Figma Placeholder) state.
 *
 * Known limitation (multi): after toggling an item with the pointer, focus sits
 * on that item, so further typing goes to Radix typeahead. Click the input to
 * resume filtering. Refocusing from content trips the non-modal focus-outside
 * dismissal.
 * Long-term fix: a combobox (focus stays on the input, aria-activedescendant)
 * rather than a menu.
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
  "children" | "onChange" | "onInput"
> &
  TypeableInputProps & {
    inputClassName?: string;
    inputRef?: Ref<HTMLInputElement>;
    placeholder?: string;
    /**
     * The current selection's summary (Figma Single: the chosen label; Multi:
     * e.g. "2 Selected"). Shown in the primary text tone while the input is
     * empty; the plain `placeholder` (tertiary tone) shows when this is unset.
     */
    displayValue?: string;
    /** Forwarded by DropdownMenuTrigger from the root's selectType; re-emitted for CSS. */
    "data-select-type"?: DropdownMenuSelectType;
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
      displayValue,
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
      "data-select-type": dataSelectType,
      ...rest
    },
    ref,
  ) => {
    const inputElRef = useRef<HTMLInputElement>(null);
    const setInputRef = useComposedRefs(inputElRef, inputRef);

    // Radix Trigger's Slot merges type="button"; a <div> has no type.
    const { type: _slotType, ...triggerProps } = rest as typeof rest & { type?: string };

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex h-button items-center ds-gap-ui-sm",
          "min-w-menu rounded-tight border border-solid border-border-primary",
          "bg-secondary ds-dropdown-caret-host ds-pl-ui-md",
          "ds-motion-state",
          "cursor-text data-[disabled]:cursor-not-allowed data-[disabled]:bg-secondary-disabled data-[disabled]:border-secondary-border-disabled",
          "[&:hover:not(:focus-within):not([data-disabled])]:border-input-border-hover [&:hover:not(:focus-within):not([data-disabled])]:shadow-button-secondary",
          "focus-within:border-input-border-focus ds-focus-within-ring",
          // The ring carries its state in its own selector — a
          // `data-[state=open]:ds-*` variant composes a Tailwind
          // variant with a package class and emits no rule at all.
          "data-[state=open]:border-input-border-focus ds-focus-ring-on-open",
          className,
        )}
        onPointerDown={(event) => {
          if (disabled) {
            return;
          }
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
          if (disabled) {
            return;
          }
          if (event.target === inputElRef.current) {
            if (event.key === "ArrowDown") {
              onKeyDown?.(event);
            }
            return;
          }
          onKeyDown?.(event);
        }}
        {...triggerProps}
        data-state={dataState}
        data-select-type={dataSelectType}
        aria-disabled={disabled || undefined}
        data-disabled={disabled ? "" : undefined}
      >
        <SearchIcon className={cn(disabled && "ds-opacity-disabled")} />
        <ButtonText
          as="input"
          ref={setInputRef}
          disabled={disabled}
          placeholder={displayValue ?? placeholder}
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
            "h-full min-w-0 flex-1 bg-transparent text-left text-text",
            "placeholder:text-text-tertiary outline-none",
            displayValue !== undefined && "placeholder:text-text",
            "ds-disabled-state",
            inputClassName,
          )}
        />
        <DropdownCaret variant={DropdownCaretVariant.typeable} />
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

/* Typed at the default element, as DropdownTriggerBase above. */
const TextDropdownTriggerBase = forwardRef<
  HTMLElement,
  TextDropdownTriggerProps<"button">
>(
  (
    {
      className,
      children,
      size = TextDropdownSize.standard,
      asChild = false,
      ...props
    },
    ref,
  ) => {
    const Comp = (asChild ? Slot : "button") as ElementType;
    return (
      <BaseText
        as={Comp}
        ref={ref as ForwardedRef<HTMLElement>}
        variant={
          size === TextDropdownSize.sm ? TextVariant.label : TextVariant.button
        }
        className={cn(
          "inline-flex items-center ds-gap-ui-sm",
          "rounded-tight border border-transparent bg-transparent",
          "cursor-pointer select-none ds-motion-state",
          "ds-focus-visible-ring",
          "ds-disabled-state",
          size === TextDropdownSize.standard &&
            "h-text-trigger text-ghost-fg [&:not(:disabled):not([aria-disabled=true])]:hover:text-ghost-fg-active",
          size === TextDropdownSize.sm &&
            "text-ghost-fg [&:not(:disabled):not([aria-disabled=true])]:hover:text-ghost-fg-active",
          className,
        )}
        {...props}
      >
        {/* Keeps multi-node children one inline run, so the root's gap sits
         * only between the label and the chevron. Slottable marks the asChild target. */}
        <Slottable child={children}>{(child) => <span>{child}</span>}</Slottable>
        <ChevronDownIcon
          size={
            size === TextDropdownSize.sm ? IconSize.sm : IconSize.rg
          }
        />
      </BaseText>
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
