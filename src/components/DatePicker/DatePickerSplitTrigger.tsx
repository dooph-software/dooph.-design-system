"use client";

import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { cn } from "../../utils/cn";
import { DropdownTrigger, DropdownTriggerContent } from "../DropdownTrigger";
import { CalendarIcon, IconSize } from "../Icons";
import {
  SegmentedSize,
  SegmentedTabItem,
  SegmentedTabSelect,
  SegmentedVariant,
} from "../SegmentedTabSelect";
import { TabSize } from "../Tabs";
import { ButtonText } from "../Text";
import {
  DEFAULT_SPLIT_TRIGGER_PRESETS,
  type CalendarPreset,
  type DateRange,
} from "../Calendar";
// Internal helpers: imported from their modules, not the public Calendar barrel.
import { formatRangeLabel } from "../Calendar/dateFormat";
import { isSameDay, startOfDay } from "../Calendar/dateUtils";

// `onSelect` stays omitted although the callback is now `onValueChange`: a
// pre-v6 `onSelect` must stay a type error, not silently become the root div's
// native DOM handler that never receives a range.
export type DatePickerSplitTriggerProps = Omit<
  ComponentPropsWithoutRef<"div">,
  "onSelect"
> & {
  value: DateRange;
  /** Inline shortcuts. Defaults to the three from the Figma spec. */
  presets?: readonly CalendarPreset[];
  onValueChange: (range: DateRange) => void;
  today?: Date;
  locale?: string;
  disabled?: boolean;
  /** Props forwarded to the INTERNAL left trigger. Ignored when `trigger` is set.
   *  `className` is merged after the seam classes; `disabled` here can only add
   *  to the component's `disabled` (which also disables the presets). */
  triggerProps?: ComponentPropsWithoutRef<"button">;
  /**
   * Replaces the internal left trigger — e.g. a `PopoverTrigger asChild`
   * element, so Radix owns the anchoring and the open/close toggle. The seam
   * classes are applied by the slot wrapper, so callers pass a plain trigger.
   */
  trigger?: ReactNode;
};

const DatePickerSplitTrigger = forwardRef<
  HTMLDivElement,
  DatePickerSplitTriggerProps
>(
  (
    {
      className,
      value,
      presets = DEFAULT_SPLIT_TRIGGER_PRESETS,
      onValueChange,
      today,
      locale,
      disabled,
      triggerProps,
      trigger,
      ...props
    },
    ref,
  ) => {
    const now = startOfDay(today ?? new Date());

    // Consumer trigger props spread first; the seam classes and the
    // component-level `disabled` are merged in after, so neither can be undone.
    const {
      className: triggerClassName,
      disabled: triggerDisabled,
      ...restTriggerProps
    } = triggerProps ?? {};

    // Active state stays derived from the live range rather than stored, so the
    // calendar remains the single source of truth. Radix Tabs treats "" as
    // "nothing selected", which is exactly the case where the range matches no
    // preset.
    const activePresetId =
      presets.find((preset) => {
        // An invalid value matches no preset; Calendar warns about it.
        if (!(value?.from instanceof Date) || !(value?.to instanceof Date)) return false;
        const presetRange = preset.getRange(now);
        return (
          isSameDay(value.from, presetRange.from) &&
          isSameDay(value.to, presetRange.to)
        );
      })?.id ?? "";

    const handlePresetChange = (id: string) => {
      const preset = presets.find((candidate) => candidate.id === id);
      if (preset) onValueChange(preset.getRange(now));
    };

    return (
      <div
        ref={ref}
        className={cn("inline-flex rounded-tight shadow-button", className)}
        {...props}
      >
        {trigger ? (
          // Same layout slot as the internal trigger. The seam classes go on
          // the wrapper's child so the slotted element still loses its right
          // radius and right border, and the joined border is not doubled
          // where it meets the first preset button.
          <div className="inline-flex [&>*]:rounded-r-none [&>*]:border-r-0">
            {trigger}
          </div>
        ) : (
          <DropdownTrigger
            {...restTriggerProps}
            disabled={disabled || triggerDisabled}
            className={cn("rounded-r-none border-r-0", triggerClassName)}
          >
            <DropdownTriggerContent className="items-center">
              <CalendarIcon size={IconSize.rg} />
              <ButtonText>{formatRangeLabel(value, now, locale)}</ButtonText>
            </DropdownTriggerContent>
          </DropdownTrigger>
        )}

        {/*
          The inline shortcuts are a shell-less ghost segmented select — so
          they inherit the segmented family's active treatment and keyboard
          behaviour. The shell and its seam live on this wrapper.
        */}
        <div
          className={cn(
            // xxs inset all round, height pinned to the trigger so the two
            // halves of the split control stay flush. `items-stretch` is what
            // lets the tabs take the remaining height rather than centring at
            // their own.
            "inline-flex h-button items-stretch p-xxs",
            "rounded-l-none rounded-r-tight",
            "border border-solid border-border-primary bg-secondary",
            disabled &&
              "bg-secondary-disabled border-secondary-border-disabled",
          )}
        >
          <SegmentedTabSelect
            variant={SegmentedVariant.ghost}
            size={SegmentedSize.standard}
            value={activePresetId}
            onValueChange={handlePresetChange}
            className="h-full items-stretch"
          >
            {presets.map((preset) => (
              <SegmentedTabItem
                key={preset.id}
                value={preset.id}
                disabled={disabled}
                size={TabSize.fill}
                // Nested-radius formula: the shell's `tight` radius less the
                // xxs inset, so the tab's curve stays concentric with it.
                className="ds-radius-tight-inset-xxs"
              >
                <ButtonText>{preset.label}</ButtonText>
              </SegmentedTabItem>
            ))}
          </SegmentedTabSelect>
        </div>
      </div>
    );
  },
);
DatePickerSplitTrigger.displayName = "DatePickerSplitTrigger";

export { DatePickerSplitTrigger };
