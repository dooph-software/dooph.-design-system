"use client";

import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { cn } from "../../utils/cn";
import { DropdownTrigger, DropdownTriggerContent } from "../DropdownTrigger";
import { CalendarIcon, IconSize } from "../Icons";
import {
  SegmentedTabItem,
  SegmentedTabSelect,
  SegmentedVariant,
} from "../SegmentedTabSelect";
import { TabSize } from "../Tabs";
import { ButtonText } from "../Text";
import {
  DEFAULT_SPLIT_TRIGGER_PRESETS,
  formatRangeLabel,
  isSameDay,
  startOfDay,
  type CalendarPreset,
  type DateRange,
} from "../Calendar";

export type DatePickerSplitTriggerProps = Omit<
  ComponentPropsWithoutRef<"div">,
  "onSelect"
> & {
  value: DateRange;
  /** Inline shortcuts. Defaults to the three from the Figma spec. */
  presets?: CalendarPreset[];
  onSelect: (range: DateRange) => void;
  today?: Date;
  locale?: string;
  disabled?: boolean;
  /** Props forwarded to the INTERNAL left trigger. Ignored when `trigger` is set. */
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
      onSelect,
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

    // Active state stays derived from the live range rather than stored, so the
    // calendar remains the single source of truth. Radix Tabs treats "" as
    // "nothing selected", which is exactly the case where the range matches no
    // preset.
    const activePresetId =
      presets.find((preset) => {
        const presetRange = preset.getRange(now);
        return (
          isSameDay(value.from, presetRange.from) &&
          isSameDay(value.to, presetRange.to)
        );
      })?.id ?? "";

    const handlePresetChange = (id: string) => {
      const preset = presets.find((candidate) => candidate.id === id);
      if (preset) onSelect(preset.getRange(now));
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
            disabled={disabled}
            className="rounded-r-none border-r-0"
            {...triggerProps}
          >
            <DropdownTriggerContent className="items-center">
              <CalendarIcon size={IconSize.standard} />
              <ButtonText>{formatRangeLabel(value, now, locale)}</ButtonText>
            </DropdownTriggerContent>
          </DropdownTrigger>
        )}

        {/*
          The inline shortcuts are a Micro segmented select (Figma "Micro"),
          not bespoke buttons — so they inherit the segmented family's active
          treatment and keyboard behaviour. The Micro variant is shell-less, so
          the joined shell and its seam live on this wrapper.
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
            variant={SegmentedVariant.micro}
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
