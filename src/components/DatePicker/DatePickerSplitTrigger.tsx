"use client";

import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { cn } from "../../utils/cn";
import { DropdownTrigger, DropdownTriggerContent } from "../DropdownTrigger";
import { CalendarIcon, IconSize } from "../Icons";
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
  /** Props forwarded to the left trigger — e.g. Radix PopoverTrigger props. */
  triggerProps?: ComponentPropsWithoutRef<"button">;
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
      ...props
    },
    ref,
  ) => {
    const now = startOfDay(today ?? new Date());

    return (
      <div
        ref={ref}
        className={cn("inline-flex rounded-tight shadow-button", className)}
        {...props}
      >
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

        <div className="inline-flex">
          {presets.map((preset, index) => {
            const presetRange = preset.getRange(now);
            const isActive =
              isSameDay(value.from, presetRange.from) &&
              isSameDay(value.to, presetRange.to);
            const isLast = index === presets.length - 1;

            return (
              <button
                key={preset.id}
                type="button"
                disabled={disabled}
                data-active={isActive ? "" : undefined}
                onClick={() => onSelect(preset.getRange(now))}
                className={cn(
                  "inline-flex h-button items-center justify-center",
                  "ds-px-ui-sm border border-solid border-border-primary",
                  "bg-secondary text-style-button text-secondary-fg",
                  "cursor-pointer select-none transition-all duration-100",
                  "ds-focus-visible-ring ds-disabled-state",
                  "disabled:bg-secondary-disabled disabled:border-secondary-border-disabled",
                  !isLast && "border-r-0",
                  isLast ? "rounded-l-none rounded-r-tight" : "rounded-none",
                  "[&:not(:disabled)]:hover:bg-secondary-hover",
                  isActive && "bg-ghost-active",
                )}
              >
                <ButtonText>{preset.label}</ButtonText>
              </button>
            );
          })}
        </div>
      </div>
    );
  },
);
DatePickerSplitTrigger.displayName = "DatePickerSplitTrigger";

export { DatePickerSplitTrigger };
