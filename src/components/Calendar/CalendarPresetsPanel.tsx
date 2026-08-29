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
        "flex flex-col gap-xxs p-xs",
        "ds-calendar-presets-w",
        "border-r border-solid border-border-primary",
        className,
      )}
      {...props}
    />
  ),
);
CalendarPresetsPanel.displayName = "CalendarPresetsPanel";

export type CalendarPresetItemProps = Omit<
  ComponentPropsWithoutRef<"button">,
  "onSelect" | "children"
> & {
  preset: CalendarPreset;
  /** The live committed range, used to derive the active state. */
  selected?: DateRange | null;
  today?: Date;
  onSelect: (range: DateRange) => void;
};

/**
 * An ACTION item, not a checkable option: clicking it replaces the range.
 * Active state is derived by comparing the live range to this preset's own
 * `getRange`, so the calendar stays the single source of truth.
 */
const CalendarPresetItem = forwardRef<HTMLButtonElement, CalendarPresetItemProps>(
  ({ className, preset, selected, today, onSelect, onClick, ...props }, ref) => {
    const now = startOfDay(today ?? new Date());
    const presetRange = preset.getRange(now);
    const isActive =
      !!selected &&
      isSameDay(selected.from, presetRange.from) &&
      isSameDay(selected.to, presetRange.to);

    return (
      <button
        ref={ref}
        type="button"
        data-active={isActive ? "" : undefined}
        onClick={(event) => {
          // Compose rather than let a consumer `onClick` silently replace
          // preset selection: theirs runs first, selection always follows.
          onClick?.(event);
          onSelect(preset.getRange(now));
        }}
        className={cn(
          menuItemClassName,
          "ds-focus-visible-ring",
          isActive && "bg-ghost-active",
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
