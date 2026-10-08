"use client";

import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { cn } from "../../utils/cn";
import { menuItemClassName } from "../Menu/DropdownMenu";
import { BodyText } from "../Text";
import type { CalendarPreset, DateRange } from "./constants";
import { isSameDay, startOfDay } from "./dateUtils";

export type CalendarPresetsPanelProps = ComponentPropsWithoutRef<"div"> & {
  children?: ReactNode;
};

/** The left rail. Compose `CalendarPresetItem` children into it. */
const CalendarPresetsPanel = forwardRef<HTMLDivElement, CalendarPresetsPanelProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex flex-col gap-xxs p-sm",
        "ds-calendar-presets-w",
        "border-r border-solid border-border-primary",
        className,
      )}
      {...props}
    />
  ),
);
CalendarPresetsPanel.displayName = "CalendarPresetsPanel";

// `value` is omitted because the native button attribute would collide with
// the range. `onSelect` stays omitted so a pre-v6 `onSelect` is a type error
// rather than a silently-attached native DOM handler.
export type CalendarPresetItemProps = Omit<
  ComponentPropsWithoutRef<"button">,
  "value" | "onSelect" | "children"
> & {
  preset: CalendarPreset;
  /** The live committed range, used to derive the active state. */
  value?: DateRange | null;
  today?: Date;
  /** Called with this preset's range when the item is clicked. */
  onValueChange: (range: DateRange) => void;
};

/**
 * An ACTION item, not a checkable option: clicking it replaces the range.
 * Active state is derived by comparing the live range to this preset's own
 * `getRange`, so the calendar stays the single source of truth.
 */
const CalendarPresetItem = forwardRef<HTMLButtonElement, CalendarPresetItemProps>(
  ({ className, preset, value, today, onValueChange, onClick, ...props }, ref) => {
    const now = startOfDay(today ?? new Date());
    const presetRange = preset.getRange(now);
    const isActive =
      !!value &&
      isSameDay(value.from, presetRange.from) &&
      isSameDay(value.to, presetRange.to);

    return (
      <button
        ref={ref}
        type="button"
        data-active={isActive ? "" : undefined}
        data-disabled={props.disabled ? "" : undefined}
        onClick={(event) => {
          // Compose rather than let a consumer `onClick` silently replace
          // preset selection: theirs runs first, selection always follows.
          onClick?.(event);
          onValueChange(preset.getRange(now));
        }}
        className={cn(
          menuItemClassName,
          "ds-focus-visible-ring",
          // Zero specificity (:where) so menuItemClassName's hover / press /
          // disabled fills still win over the active fill, as they did over
          // the plain `bg-ghost-active` this replaced.
          "[:where(&[data-active])]:bg-ghost-active",
          className,
        )}
        {...props}
      >
        <BodyText>{preset.label}</BodyText>
      </button>
    );
  },
);
CalendarPresetItem.displayName = "CalendarPresetItem";

export { CalendarPresetItem, CalendarPresetsPanel };
