"use client";

import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { cn } from "../../utils/cn";
import { DropdownTrigger, DropdownTriggerContent } from "../DropdownTrigger";
import { CalendarIcon, IconSize } from "../Icons";
import { ButtonText } from "../Text";
import {
  DatePickerMode,
  formatRangeLabel,
  formatSingleLabel,
  type DateRange,
} from "../Calendar";

type DatePickerTriggerSharedProps = Omit<
  ComponentPropsWithoutRef<"button">,
  "value" | "children"
> & {
  today?: Date;
  locale?: string;
};

export type DatePickerTriggerProps = DatePickerTriggerSharedProps &
  (
    | { mode: typeof DatePickerMode.singleDay; value: Date }
    | { mode: typeof DatePickerMode.dateRange; value: DateRange }
  );

/**
 * The label shows the year only when the value is not entirely within the
 * current year, and then on both endpoints — never on one.
 *
 * Takes the INTACT props object on purpose. TypeScript narrows a discriminated
 * union through `props.mode`, but `Pick<Props, "mode" | "value">` does not
 * distribute over the union — it collapses to
 * `{ mode: "single-day" | "date-range"; value: Date | DateRange }`, and then
 * neither branch narrows `value`, so neither formatter accepts it. Destructuring
 * the pair out first has the same effect. Pass `props` whole.
 */
export function formatTriggerLabel(
  props: DatePickerTriggerProps,
  today: Date,
  locale?: string,
): string {
  return props.mode === DatePickerMode.singleDay
    ? formatSingleLabel(props.value, today, locale)
    : formatRangeLabel(props.value, today, locale);
}

const DatePickerTrigger = forwardRef<HTMLButtonElement, DatePickerTriggerProps>(
  (props, ref) => {
    // `value` is pulled out only to keep it off the DOM — `<button value>` is a
    // real HTML attribute and a Date there would be wrong. The label reads from
    // the intact union above, not from these widened bindings.
    const { className, today, locale, mode, value, ...buttonProps } = props;
    const label = formatTriggerLabel(props, today ?? new Date(), locale);

    return (
      <DropdownTrigger
        ref={ref}
        data-mode={mode}
        className={cn(
          // Radix's Popover.Trigger stamps data-state on this button, so the
          // trigger carries the focused border + ring while the panel is open.
          // The ring uses ds-focus-ring-on-open, which carries the state in its
          // own selector — a `data-[state=open]:ds-focus-ring` variant would
          // silently emit no rule at all.
          "data-[state=open]:border-border-focus ds-focus-ring-on-open",
          className,
        )}
        {...buttonProps}
      >
        <DropdownTriggerContent className="items-center">
          <CalendarIcon size={IconSize.standard} />
          <ButtonText>{label}</ButtonText>
        </DropdownTriggerContent>
      </DropdownTrigger>
    );
  },
);
DatePickerTrigger.displayName = "DatePickerTrigger";

export { DatePickerTrigger };
