"use client";

/*
 * FancyToggleSwitch / FancyToggleSwitchItem — Figma Toggle Switch `Fancy`
 * (826:2149) built from Toggle Option `Fancy` / `Fancy+Icon` (826:1723).
 * A dedicated row, separate from ToggleSwitch by maintainer decision
 * (2026-10-03) so ToggleSwitch's 4px gap and toggleOption's shared unselected
 * look stay true. Option styling lives in ./fancyToggleOption.
 *
 * ## behavior
 * - Radix ToggleGroup wiring, like ToggleSwitch. Options sit 12px apart (md).
 * - Single select only, the same behaviour as ToggleSwitch (maintainer
 *   decision 2026-10-04: multi-select was removed). `value` is a string and
 *   selection can never be cleared — Radix's "" on a second click is dropped.
 *   This is ToggleSwitch's own code, not a copy: both call
 *   `useNeverClearedValue` from ./Toggle. Controlled (`value` +
 *   `onValueChange`) and uncontrolled (`defaultValue`) both work; a controlled
 *   `value` always wins.
 * - The chosen option gets the default cursor (it cannot be clicked off). An
 *   item `icon` switches its indicator from the stroke-only ring + DS check to
 *   a filled circle holding that icon.
 *
 * ## constraints
 * - Keep Radix fully controlled — passing `defaultValue` through would let
 *   Radix's own state clear itself regardless of the callback (the same
 *   constraint as Toggle.tsx). The never-clear rule itself is
 *   `useNeverClearedValue` in ./Toggle; change it there, not with a local
 *   copy, so the two rows cannot drift.
 */

import * as ToggleGroup from "@radix-ui/react-toggle-group";
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ComponentRef,
  type ReactNode,
} from "react";
import { cn } from "../../utils/cn";
import { CheckIcon } from "../Icons/CheckIcon";
import { BaseText, TextVariant } from "../Text";
import {
  fancyToggleCheckClass,
  fancyToggleIndicatorSlot,
  fancyToggleIndicatorVariants,
  fancyToggleOptionVariants,
} from "./fancyToggleOption";
import { useNeverClearedValue } from "./Toggle";

// Figma Fancy Toggle Switch: md (12px) between options.
const ROOT_CLASS = "inline-flex items-center gap-md";

export interface FancyToggleSwitchProps extends Omit<
  ComponentPropsWithoutRef<typeof ToggleGroup.Root>,
  "type" | "value" | "onValueChange" | "defaultValue"
> {
  /** Exactly one option is chosen, and it can never be cleared. */
  value?: string;
  defaultValue?: string;
  /** Never called with "" — the selected option cannot be toggled off. */
  onValueChange?: (value: string) => void;
}

const FancyToggleSwitch = forwardRef<
  ComponentRef<typeof ToggleGroup.Root>,
  FancyToggleSwitchProps
>(
  (
    { className, value, defaultValue, onValueChange, children, ...props },
    ref,
  ) => {
    const single = useNeverClearedValue({ value, defaultValue, onValueChange });

    return (
      <ToggleGroup.Root
        ref={ref}
        type="single"
        value={single.value}
        onValueChange={single.onValueChange}
        className={cn(ROOT_CLASS, className)}
        {...props}
      >
        {children}
      </ToggleGroup.Root>
    );
  },
);
FancyToggleSwitch.displayName = "FancyToggleSwitch";

export interface FancyToggleSwitchItemProps extends ComponentPropsWithoutRef<
  typeof ToggleGroup.Item
> {
  /**
   * Optional icon in the leading 28px indicator (DS icons default to 14px and
   * paint with currentColor). With an icon the indicator is a filled circle;
   * without one it is a stroke-only ring that shows the DS check when selected.
   */
  icon?: ReactNode;
}

const FancyToggleSwitchItem = forwardRef<
  ComponentRef<typeof ToggleGroup.Item>,
  FancyToggleSwitchItemProps
>(({ className, icon, children, ...props }, ref) => {
  const hasIcon = icon !== undefined && icon !== null && icon !== false;

  return (
    <ToggleGroup.Item
      ref={ref}
      className={cn(fancyToggleOptionVariants(), className)}
      {...props}
    >
      <span aria-hidden className={fancyToggleIndicatorSlot}>
        <span
          className={fancyToggleIndicatorVariants({
            indicator: hasIcon ? "icon" : "check",
          })}
        >
          {hasIcon ? icon : <CheckIcon className={fancyToggleCheckClass} />}
        </span>
      </span>
      {/* <span className="text-style-hero-button">{children}</span> */}
      <BaseText variant={TextVariant.button}>{children}</BaseText>
    </ToggleGroup.Item>
  );
});
FancyToggleSwitchItem.displayName = "FancyToggleSwitchItem";

export { FancyToggleSwitch, FancyToggleSwitchItem };
