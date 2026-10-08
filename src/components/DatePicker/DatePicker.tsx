"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "../../utils/cn";
import { Popover, PopoverContent, PopoverTrigger } from "../Popover";
import {
  Calendar,
  DatePickerMode,
  type CalendarDayRenderProps,
  type CalendarLabels,
  type CalendarPreset,
  type DateMatcher,
  type DateRange,
} from "../Calendar";
import { DatePickerSplitTrigger } from "./DatePickerSplitTrigger";
import { DatePickerTrigger } from "./DatePickerTrigger";

/** The picker is the one owner of these trigger props. */
type DatePickerTriggerOwnedProps = "mode" | "value" | "disabled" | "today" | "locale";

type DatePickerSharedProps = {
  open?: boolean;
  /** Initial open state when uncontrolled (`open` omitted). Default false. */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: DateMatcher | DateMatcher[];
  /** Disables the trigger control itself, distinct from disabled days. */
  triggerDisabled?: boolean;
  today?: Date;
  locale?: string;
  /** Accessible names for the calendar's month arrows; pair with `locale`. */
  labels?: CalendarLabels;
  /** Bounds for the calendar's own navigation and its year dropdown. */
  yearBounds?: { from?: Date; to?: Date };
  /** Slot the day's CONTENT. The button, handlers and ARIA stay with Calendar. */
  renderDay?: (day: CalendarDayRenderProps) => ReactNode;
  /** Controlled displayed month; omit for uncontrolled navigation. */
  month?: Date;
  onMonthChange?: (month: Date) => void;
  /** Panel content composed alongside the calendar — e.g. CalendarPresetsPanel. */
  children?: ReactNode;
  className?: string;
  /** Props for the trigger button — `id` (for `<label htmlFor>`), `aria-*`,
   *  handlers, `className`. The picker owns mode/value/disabled/today/locale. */
  triggerProps?: Omit<
    ComponentPropsWithoutRef<typeof DatePickerTrigger>,
    DatePickerTriggerOwnedProps
  >;
  /** Props for the popover panel — `align`, `side`, `sideOffset`, `aria-*`, `className`. */
  contentProps?: ComponentPropsWithoutRef<typeof PopoverContent>;
};

export type DatePickerProps = DatePickerSharedProps &
  (
    | {
        mode: typeof DatePickerMode.singleDay;
        value: Date;
        onValueChange: (date: Date) => void;
        /** Not available in single-day mode. */
        splitPresets?: never;
      }
    | {
        mode: typeof DatePickerMode.dateRange;
        value: DateRange;
        onValueChange: (range: DateRange) => void;
        /** Render the split trigger with these inline preset shortcuts. */
        splitPresets?: readonly CalendarPreset[];
      }
  );

function DatePicker(props: DatePickerProps) {
  const {
    open,
    defaultOpen,
    onOpenChange,
    disabled,
    triggerDisabled,
    today,
    locale,
    labels,
    yearBounds,
    renderDay,
    month,
    onMonthChange,
    children,
    className,
    triggerProps,
    contentProps,
    mode,
  } = props;

  const useSplit =
    mode === DatePickerMode.dateRange && props.splitPresets !== undefined;

  return (
    // Radix Popover owns the open state: controlled when `open` is defined,
    // otherwise uncontrolled from `defaultOpen`.
    <Popover open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      {useSplit && mode === DatePickerMode.dateRange ? (
        <DatePickerSplitTrigger
          value={props.value}
          presets={props.splitPresets}
          onValueChange={props.onValueChange}
          today={today}
          locale={locale}
          disabled={triggerDisabled}
          className={className}
          // Radix positions PopoverContent off its Trigger (or Anchor). Only
          // the left control is the trigger — wrapping the presets too would
          // make every preset click toggle the panel.
          trigger={
            <PopoverTrigger asChild>
              <DatePickerTrigger
                {...triggerProps}
                mode={DatePickerMode.dateRange}
                value={props.value}
                disabled={triggerDisabled}
                today={today}
                locale={locale}
                // The picker's `className` goes on the split container above.
                className={triggerProps?.className}
              />
            </PopoverTrigger>
          }
        />
      ) : (
        <PopoverTrigger asChild>
          {mode === DatePickerMode.singleDay ? (
            <DatePickerTrigger
              {...triggerProps}
              mode={DatePickerMode.singleDay}
              value={props.value}
              disabled={triggerDisabled}
              today={today}
              locale={locale}
              className={cn(className, triggerProps?.className)}
            />
          ) : (
            <DatePickerTrigger
              {...triggerProps}
              mode={DatePickerMode.dateRange}
              value={props.value}
              disabled={triggerDisabled}
              today={today}
              locale={locale}
              className={cn(className, triggerProps?.className)}
            />
          )}
        </PopoverTrigger>
      )}

      <PopoverContent {...contentProps}>
        {mode === DatePickerMode.singleDay ? (
          <Calendar
            mode={DatePickerMode.singleDay}
            value={props.value}
            onValueChange={props.onValueChange}
            disabled={disabled}
            today={today}
            locale={locale}
            labels={labels}
            yearBounds={yearBounds}
            renderDay={renderDay}
            month={month}
            onMonthChange={onMonthChange}
          >
            {children}
          </Calendar>
        ) : (
          <Calendar
            mode={DatePickerMode.dateRange}
            value={props.value}
            onValueChange={props.onValueChange}
            disabled={disabled}
            today={today}
            locale={locale}
            labels={labels}
            yearBounds={yearBounds}
            renderDay={renderDay}
            month={month}
            onMonthChange={onMonthChange}
          >
            {children}
          </Calendar>
        )}
      </PopoverContent>
    </Popover>
  );
}

DatePicker.displayName = "DatePicker";

export { DatePicker };
