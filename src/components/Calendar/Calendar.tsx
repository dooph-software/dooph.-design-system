"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { cn } from "../../utils/cn";
import { CalendarCaption } from "./CalendarCaption";
import { CalendarGrid, type CalendarDayRenderProps } from "./CalendarGrid";
import { DatePickerMode, type DateRange } from "./constants";
import { clampMonthToYearBounds } from "./dateFormat";
import {
  DAYS_IN_WEEK,
  isDateDisabled,
  startOfDay,
  startOfMonth,
  type DateMatcher,
} from "./dateUtils";
import { previewRange, resolveRangeClick } from "./rangeSelection";

/** Give up rather than loop forever if every remaining day is disabled. */
const MAX_NAV_SCAN = 400;

type CalendarSharedProps = {
  /** Controlled displayed month; omit for uncontrolled navigation. */
  month?: Date;
  onMonthChange?: (month: Date) => void;
  disabled?: DateMatcher | DateMatcher[];
  /** Bounds for the year dropdown; defaults to a past-weighted window. */
  yearBounds?: { from?: Date; to?: Date };
  /** Slot the day's CONTENT. The button, handlers and ARIA stay with Calendar. */
  renderDay?: (day: CalendarDayRenderProps) => ReactNode;
  locale?: string;
  /** Injectable for deterministic stories and tests. */
  today?: Date;
  /** Composed content rendered as a left rail — e.g. CalendarPresetsPanel. */
  children?: ReactNode;
  className?: string;
};

type CalendarSingleProps = CalendarSharedProps & {
  mode: typeof DatePickerMode.singleDay;
  selected: Date;
  onSelect: (date: Date) => void;
};

type CalendarRangeProps = CalendarSharedProps & {
  mode: typeof DatePickerMode.dateRange;
  selected: DateRange;
  onSelect: (range: DateRange) => void;
};

export type CalendarProps = CalendarSingleProps | CalendarRangeProps;

function warnOnBadValue(props: CalendarProps): void {
  if (process.env.NODE_ENV === "production") return;

  if (props.mode === DatePickerMode.singleDay) {
    if (!(props.selected instanceof Date) || Number.isNaN(props.selected.getTime())) {
      console.warn(
        "[dooph] Calendar: `selected` must be a valid Date in single-day mode. " +
          "A value is required — default to today rather than passing undefined.",
      );
    }
    return;
  }

  const range = props.selected;
  if (!range || !(range.from instanceof Date) || !(range.to instanceof Date)) {
    console.warn(
      "[dooph] Calendar: `selected` must be `{ from: Date, to: Date }` in " +
        "date-range mode. A value is required — there is no empty state.",
    );
    return;
  }
  if (startOfDay(range.to).getTime() < startOfDay(range.from).getTime()) {
    console.warn("[dooph] Calendar: `selected.to` is before `selected.from`.");
  }
}

/**
 * Explicit `yearBounds` are a hard limit, but the value belongs to the
 * consumer — so a value outside them is reported, never rewritten. Navigation
 * is clamped instead (see `clampMonthToYearBounds`).
 */
function warnOnOutOfBoundsValue(
  anchorDate: Date,
  yearBounds: { from?: Date; to?: Date } | undefined,
): void {
  if (process.env.NODE_ENV === "production" || !yearBounds) return;

  const year = anchorDate.getFullYear();
  const below = yearBounds.from && year < yearBounds.from.getFullYear();
  const above = yearBounds.to && year > yearBounds.to.getFullYear();
  if (below || above) {
    console.warn(
      `[dooph] Calendar: \`selected\` is in ${year}, outside \`yearBounds\`. ` +
        "The value is left as-is — navigation is clamped to the bounds. " +
        "Widen yearBounds or pass a value inside them.",
    );
  }
}

function Calendar(props: CalendarProps) {
  const {
    mode,
    month,
    onMonthChange,
    disabled,
    yearBounds,
    renderDay,
    locale,
    today: todayProp,
    children,
    className,
  } = props;

  warnOnBadValue(props);

  const today = startOfDay(todayProp ?? new Date());
  const anchorDate =
    mode === DatePickerMode.singleDay ? props.selected : props.selected.from;

  warnOnOutOfBoundsValue(anchorDate, yearBounds);

  // Explicit yearBounds are hard limits on NAVIGATION. The view month is
  // component-owned state, so clamping it is legitimate — the consumer's
  // committed value is never rewritten (see warnOnBadValue for that case).
  const [uncontrolledMonth, setUncontrolledMonth] = useState(() =>
    clampMonthToYearBounds(startOfMonth(anchorDate), yearBounds),
  );
  const viewMonth = clampMonthToYearBounds(
    month ? startOfMonth(month) : uncontrolledMonth,
    yearBounds,
  );

  const changeMonth = useCallback(
    (next: Date) => {
      const normalized = clampMonthToYearBounds(startOfMonth(next), yearBounds);
      if (!month) setUncontrolledMonth(normalized);
      onMonthChange?.(normalized);
    },
    [month, onMonthChange, yearBounds],
  );

  const [pendingAnchor, setPendingAnchor] = useState<Date | null>(null);
  const [hoveredDay, setHoveredDay] = useState<Date | null>(null);
  const [focusedDay, setFocusedDay] = useState<Date>(anchorDate);
  const shouldRestoreFocus = useRef(false);
  const focusedButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (shouldRestoreFocus.current) {
      focusedButtonRef.current?.focus();
      shouldRestoreFocus.current = false;
    }
  });

  const selectedRange: DateRange | null =
    mode === DatePickerMode.singleDay
      ? { from: props.selected, to: props.selected }
      : props.selected;

  const previewedRange =
    pendingAnchor && hoveredDay ? previewRange(pendingAnchor, hoveredDay) : null;

  const displayRange = pendingAnchor
    ? (previewedRange ?? { from: pendingAnchor, to: pendingAnchor })
    : selectedRange;

  const handleDayClick = useCallback(
    (date: Date) => {
      if (isDateDisabled(date, disabled)) return;
      setFocusedDay(date);

      if (mode === DatePickerMode.singleDay) {
        props.onSelect(startOfDay(date));
        return;
      }

      const result = resolveRangeClick(date, pendingAnchor);
      if (result.kind === "pending") {
        setPendingAnchor(result.anchor);
        return;
      }
      setPendingAnchor(null);
      setHoveredDay(null);
      props.onSelect(result.range);
    },
    [disabled, mode, pendingAnchor, props],
  );

  const moveFocus = useCallback(
    (from: Date, delta: number) => {
      const step = delta > 0 ? 1 : -1;
      let candidate = from;
      for (let scanned = 0; scanned < MAX_NAV_SCAN; scanned += 1) {
        const offset = scanned === 0 ? delta : step;
        candidate = new Date(
          candidate.getFullYear(),
          candidate.getMonth(),
          candidate.getDate() + offset,
        );
        if (!isDateDisabled(candidate, disabled)) {
          setFocusedDay(candidate);
          shouldRestoreFocus.current = true;
          if (
            candidate.getMonth() !== viewMonth.getMonth() ||
            candidate.getFullYear() !== viewMonth.getFullYear()
          ) {
            changeMonth(candidate);
          }
          return;
        }
      }
    },
    [changeMonth, disabled, viewMonth],
  );

  const handleDayKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>) => {
      const deltas: Record<string, number> = {
        ArrowLeft: -1,
        ArrowRight: 1,
        ArrowUp: -DAYS_IN_WEEK,
        ArrowDown: DAYS_IN_WEEK,
      };
      const delta = deltas[event.key];
      if (delta === undefined) return;
      event.preventDefault();
      moveFocus(focusedDay, delta);
    },
    [focusedDay, moveFocus],
  );

  return (
    <div
      data-mode={mode}
      className={cn("flex items-stretch", className)}
      onKeyDown={(event) => {
        if (event.key === "Escape" && pendingAnchor) {
          // Abandon the pending anchor; the committed value is untouched.
          setPendingAnchor(null);
          setHoveredDay(null);
        }
      }}
    >
      {children}
      <div className="flex flex-col gap-sm p-rg ds-calendar-panel-w">
        <CalendarCaption
          viewMonth={viewMonth}
          value={anchorDate}
          today={today}
          yearBounds={yearBounds}
          onMonthChange={changeMonth}
          locale={locale}
        />
        <CalendarGrid
          viewMonth={viewMonth}
          selectedRange={selectedRange}
          previewedRange={pendingAnchor ? displayRange : null}
          today={today}
          focusedDay={focusedDay}
          disabled={disabled}
          onDayClick={handleDayClick}
          onDayHover={setHoveredDay}
          onDayHoverEnd={() => setHoveredDay(null)}
          onDayKeyDown={handleDayKeyDown}
          dayRef={(node) => {
            focusedButtonRef.current = node;
          }}
          renderDay={renderDay}
          locale={locale}
        />
      </div>
    </div>
  );
}

export { Calendar };
