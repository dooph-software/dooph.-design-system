"use client";

import { useState, type ReactNode } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../Popover";
import { Calendar, DatePickerMode, type DateMatcher, type DateRange } from "../Calendar";
import { DatePickerSplitTrigger } from "./DatePickerSplitTrigger";
import { DatePickerTrigger } from "./DatePickerTrigger";

type DatePickerSharedProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: DateMatcher | DateMatcher[];
  /** Disables the trigger control itself, distinct from disabled days. */
  triggerDisabled?: boolean;
  today?: Date;
  locale?: string;
  /** Panel content composed alongside the calendar — e.g. CalendarPresetsPanel. */
  children?: ReactNode;
  className?: string;
};

export type DatePickerProps = DatePickerSharedProps &
  (
    | {
        mode: typeof DatePickerMode.singleDay;
        value: Date;
        onChange: (date: Date) => void;
        /** Not available in single-day mode. */
        splitPresets?: never;
      }
    | {
        mode: typeof DatePickerMode.dateRange;
        value: DateRange;
        onChange: (range: DateRange) => void;
        /** Render the split trigger with these inline preset shortcuts. */
        splitPresets?: Parameters<typeof DatePickerSplitTrigger>[0]["presets"];
      }
  );

function DatePicker(props: DatePickerProps) {
  const {
    open,
    onOpenChange,
    disabled,
    triggerDisabled,
    today,
    locale,
    children,
    className,
    mode,
  } = props;

  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isOpen = open ?? uncontrolledOpen;
  const setOpen = (next: boolean) => {
    if (open === undefined) setUncontrolledOpen(next);
    onOpenChange?.(next);
  };

  const useSplit =
    mode === DatePickerMode.dateRange && props.splitPresets !== undefined;

  return (
    <Popover open={isOpen} onOpenChange={setOpen}>
      {useSplit && mode === DatePickerMode.dateRange ? (
        <DatePickerSplitTrigger
          value={props.value}
          presets={props.splitPresets}
          onSelect={props.onChange}
          today={today}
          locale={locale}
          disabled={triggerDisabled}
          className={className}
          triggerProps={{
            onClick: () => setOpen(!isOpen),
            "aria-expanded": isOpen,
            "aria-haspopup": "dialog",
          }}
        />
      ) : (
        <PopoverTrigger asChild>
          {mode === DatePickerMode.singleDay ? (
            <DatePickerTrigger
              mode={DatePickerMode.singleDay}
              value={props.value}
              disabled={triggerDisabled}
              today={today}
              locale={locale}
              className={className}
            />
          ) : (
            <DatePickerTrigger
              mode={DatePickerMode.dateRange}
              value={props.value}
              disabled={triggerDisabled}
              today={today}
              locale={locale}
              className={className}
            />
          )}
        </PopoverTrigger>
      )}

      <PopoverContent>
        {mode === DatePickerMode.singleDay ? (
          <Calendar
            mode={DatePickerMode.singleDay}
            selected={props.value}
            onSelect={props.onChange}
            disabled={disabled}
            today={today}
            locale={locale}
          >
            {children}
          </Calendar>
        ) : (
          <Calendar
            mode={DatePickerMode.dateRange}
            selected={props.value}
            onSelect={props.onChange}
            disabled={disabled}
            today={today}
            locale={locale}
          >
            {children}
          </Calendar>
        )}
      </PopoverContent>
    </Popover>
  );
}

export { DatePicker };
