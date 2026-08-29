"use client";

import { forwardRef, type ReactNode } from "react";
import { cn } from "../../utils/cn";
import { BodyText, LabelText } from "../Text";
import type { DateRange } from "./constants";
import { formatDayAriaLabel, formatMonthName } from "./dateFormat";
import {
  buildMonthGrid,
  DAYS_IN_WEEK,
  isDateDisabled,
  isOutsideMonth,
  isSameDay,
  toDayKey,
  type DateMatcher,
} from "./dateUtils";
import { getDayRangePosition } from "./rangeSelection";

/**
 * Every computed flag for one day cell. Handed to `renderDay` so a consumer
 * never recomputes state — and so they slot the day's CONTENT while the
 * component keeps the button, its handlers, and its ARIA.
 */
export type CalendarDayRenderProps = {
  date: Date;
  isSelected: boolean;
  isRangeStart: boolean;
  isRangeMiddle: boolean;
  isRangeEnd: boolean;
  isToday: boolean;
  isOutside: boolean;
  isDisabled: boolean;
  isFocused: boolean;
};

export type CalendarGridProps = {
  /** First day of the displayed month. */
  viewMonth: Date;
  /** The committed selection, or the pending preview while a range is forming. */
  selectedRange: DateRange | null;
  /** Hover preview during a pending range; overrides `selectedRange` visually. */
  previewedRange: DateRange | null;
  today: Date;
  /** The single day holding the roving tabIndex. */
  focusedDay: Date;
  disabled?: DateMatcher | DateMatcher[];
  onDayClick: (date: Date) => void;
  onDayHover: (date: Date) => void;
  onDayHoverEnd: () => void;
  onDayKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
  dayRef: (node: HTMLButtonElement | null) => void;
  renderDay?: (day: CalendarDayRenderProps) => ReactNode;
  locale?: string;
  className?: string;
};

/** Seven narrow weekday names taken from any known week — no lookup table. */
function getWeekdayNames(locale: string | undefined): string[] {
  const formatter = new Intl.DateTimeFormat(locale, { weekday: "short" });
  // 2026-05-31 is a Sunday, so this walks Sun..Sat in order.
  return Array.from({ length: DAYS_IN_WEEK }, (_, index) =>
    formatter.format(new Date(2026, 4, 31 + index)),
  );
}

const CalendarGrid = forwardRef<HTMLDivElement, CalendarGridProps>(
  (
    {
      viewMonth,
      selectedRange,
      previewedRange,
      today,
      focusedDay,
      disabled,
      onDayClick,
      onDayHover,
      onDayHoverEnd,
      onDayKeyDown,
      dayRef,
      renderDay,
      locale,
      className,
    },
    ref,
  ) => {
    const month = viewMonth.getMonth();
    const cells = buildMonthGrid(viewMonth.getFullYear(), month);
    const weekdays = getWeekdayNames(locale);
    const activeRange = previewedRange ?? selectedRange;

    const weeks: Date[][] = [];
    for (let index = 0; index < cells.length; index += DAYS_IN_WEEK) {
      weeks.push(cells.slice(index, index + DAYS_IN_WEEK));
    }

    return (
      // A CSS grid of divs, not a <table>: `aspect-ratio` does not apply to
      // internal table boxes, and browsers do not paint `border-radius` on
      // cells under `border-collapse: collapse` — which would silently kill
      // both the square cells and the whole range-band rounding model.
      //
      // The rows carry `display: contents`, so their boxes are not generated
      // and their day cells become direct grid items of this 7-column grid.
      // Without it each row would be a single grid item and the layout would
      // collapse to one column of rows. `display: contents` removes the box,
      // not the element: the ARIA role stays in the accessibility tree, so
      // grid/row/gridcell semantics are unaffected.
      <div
        ref={ref}
        role="grid"
        aria-label={`${formatMonthName(viewMonth, locale)} ${viewMonth.getFullYear()}`}
        className={cn("grid w-full grid-cols-7 select-none", className)}
      >
        <div role="row" className="contents">
          {weekdays.map((name) => (
            <div
              key={name}
              role="columnheader"
              className="flex items-center justify-center pb-xs"
            >
              <LabelText className="text-ghost-fg">{name}</LabelText>
            </div>
          ))}
        </div>

        {weeks.map((week) => (
          <div key={toDayKey(week[0])} role="row" className="contents">
            {week.map((date, columnIndex) => {
              const position = getDayRangePosition(date, activeRange);
              const isOutside = isOutsideMonth(date, month);
              const dayDisabled = isDateDisabled(date, disabled);
              const isFocused = isSameDay(date, focusedDay);
              const isFirstColumn = columnIndex === 0;
              const isLastColumn = columnIndex === DAYS_IN_WEEK - 1;
              const isEndpoint =
                position === "start" ||
                position === "end" ||
                position === "single";

              const renderProps: CalendarDayRenderProps = {
                date,
                isSelected: position !== "none",
                isRangeStart: position === "start" || position === "single",
                isRangeMiddle: position === "middle",
                isRangeEnd: position === "end" || position === "single",
                isToday: isSameDay(date, today),
                isOutside,
                isDisabled: dayDisabled,
                isFocused,
              };

              return (
                <div
                  key={toDayKey(date)}
                  role="gridcell"
                  aria-selected={position !== "none"}
                  data-range={position}
                  className={cn(
                    // Layer 1: the band. Zero gap between cells is what makes
                    // it continuous; the visual gutter is the padding below.
                    "aspect-square p-xxs",
                    position !== "none" && "bg-ghost-active",
                    position === "start" && "rounded-l-calendar-day",
                    position === "end" && "rounded-r-calendar-day",
                    position === "single" && "rounded-calendar-day",
                    // Terminate the band cleanly at each week boundary.
                    isFirstColumn && "rounded-l-calendar-day",
                    isLastColumn && "rounded-r-calendar-day",
                  )}
                >
                  <button
                    type="button"
                    ref={isFocused ? dayRef : undefined}
                    tabIndex={isFocused ? 0 : -1}
                    disabled={dayDisabled}
                    aria-label={formatDayAriaLabel(date, locale)}
                    aria-current={renderProps.isToday ? "date" : undefined}
                    data-today={renderProps.isToday ? "" : undefined}
                    data-outside={isOutside ? "" : undefined}
                    onClick={() => onDayClick(date)}
                    onPointerEnter={() => onDayHover(date)}
                    onPointerLeave={onDayHoverEnd}
                    onKeyDown={onDayKeyDown}
                    className={cn(
                      "flex size-full items-center justify-center",
                      "rounded-calendar-day cursor-pointer",
                      "transition-colors duration-100",
                      "ds-focus-visible-ring ds-disabled-state",
                      // Layer 2: resting + hover.
                      "text-ghost-fg-active",
                      "[&:not(:disabled)]:hover:bg-ghost-hover",
                      isOutside && "text-ghost-fg",
                      // Layer 3: endpoints sit above the band.
                      isEndpoint && "bg-primary text-primary-fg",
                      isEndpoint && "[&:not(:disabled)]:hover:bg-primary-hover",
                      renderProps.isToday && !isEndpoint && "border border-solid border-border-primary",
                    )}
                  >
                    {renderDay ? (
                      renderDay(renderProps)
                    ) : (
                      <BodyText>{date.getDate()}</BodyText>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  },
);
CalendarGrid.displayName = "CalendarGrid";

export { CalendarGrid };
