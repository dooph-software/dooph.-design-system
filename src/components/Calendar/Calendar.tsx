"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { cn } from "../../utils/cn";
import { CalendarCaption, type CalendarLabels } from "./CalendarCaption";
import { CalendarGrid, type CalendarDayRenderProps } from "./CalendarGrid";
import { DatePickerMode, type DateRange } from "./constants";
import { clampMonthToYearBounds, isYearOutOfBounds } from "./dateFormat";
import {
  DAYS_IN_WEEK,
  firstEnabledDayOfMonth,
  isDateDisabled,
  isValidDate,
  isValidRange,
  startOfDay,
  startOfMonth,
  toDayKey,
  type DateMatcher,
} from "./dateUtils";
import { previewRange, resolveRangeClick } from "./rangeSelection";

/** Give up rather than loop forever if every remaining day is disabled. */
const MAX_NAV_SCAN = 400;

// The div's native `onSelect`/`defaultValue` are omitted so they cannot collide
// with the value props: a pre-v6 `onSelect` stays a type error instead of
// silently becoming a DOM handler that never receives a date.
type CalendarSharedProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "onSelect" | "defaultValue" | "children" | "className"
> & {
  /** Controlled displayed month; omit for uncontrolled navigation. */
  month?: Date;
  onMonthChange?: (month: Date) => void;
  disabled?: DateMatcher | DateMatcher[];
  /** Bounds for the year dropdown; defaults to a past-weighted window. */
  yearBounds?: { from?: Date; to?: Date };
  /** Slot the day's CONTENT. The button, handlers and ARIA stay with Calendar. */
  renderDay?: (day: CalendarDayRenderProps) => ReactNode;
  locale?: string;
  /** Accessible names for the month arrows; pair with `locale`. */
  labels?: CalendarLabels;
  /** Injectable for deterministic stories and tests. */
  today?: Date;
  /** Composed content rendered as a left rail — e.g. CalendarPresetsPanel. */
  children?: ReactNode;
  className?: string;
};

type CalendarSingleProps = CalendarSharedProps & {
  mode: typeof DatePickerMode.singleDay;
  value: Date;
  onValueChange: (date: Date) => void;
};

type CalendarRangeProps = CalendarSharedProps & {
  mode: typeof DatePickerMode.dateRange;
  value: DateRange;
  onValueChange: (range: DateRange) => void;
};

export type CalendarProps = CalendarSingleProps | CalendarRangeProps;

/**
 * A missing or malformed value warns in development and renders NOTHING
 * (research:576, D-12). It must never reach the date maths in CalendarView,
 * which would crash with an incidental TypeError instead. An unknown `mode` is
 * malformed too: it would otherwise run the range branch silently.
 */
function hasValidValue(props: CalendarProps): boolean {
  const value: unknown = props.value;
  let problem: string | null = null;

  if (props.mode === DatePickerMode.singleDay) {
    if (!isValidDate(value)) {
      problem =
        "`value` must be a valid Date in single-day mode. " +
        "A value is required — default to today rather than passing undefined.";
    }
  } else if (props.mode === DatePickerMode.dateRange) {
    if (!isValidRange(value)) {
      problem =
        "`value` must be `{ from: Date, to: Date }` in date-range mode. " +
        "A value is required — there is no empty state.";
    } else if (startOfDay(value.to).getTime() < startOfDay(value.from).getTime()) {
      // Reported, not rejected: a reversed range still renders.
      if (process.env.NODE_ENV !== "production") {
        console.warn("[dooph] Calendar: `value.to` is before `value.from`.");
      }
    }
  } else {
    problem =
      "`mode` must be DatePickerMode.singleDay or DatePickerMode.dateRange, " +
      `received ${JSON.stringify((props as { mode: unknown }).mode)}.`;
  }

  if (problem !== null && process.env.NODE_ENV !== "production") {
    console.warn(`[dooph] Calendar: ${problem} Rendering nothing.`);
  }
  return problem === null;
}

/**
 * Explicit `yearBounds` are a hard limit on the calendar's OWN navigation, but
 * the value belongs to the consumer — so a value outside them is reported,
 * never rewritten.
 */
function warnOnOutOfBoundsValue(
  anchorDate: Date,
  yearBounds: { from?: Date; to?: Date } | undefined,
): void {
  if (process.env.NODE_ENV === "production") return;
  if (!isYearOutOfBounds(anchorDate, yearBounds)) return;

  console.warn(
    `[dooph] Calendar: \`value\` is in ${anchorDate.getFullYear()}, outside ` +
      "`yearBounds`. The value is left as-is — bounds constrain the calendar's " +
      "own navigation, not values you supply.",
  );
}

/**
 * Same rule for a controlled `month`. Clamping a consumer-supplied prop would
 * make their state and the rendered month diverge silently and permanently.
 */
function warnOnOutOfBoundsMonth(
  month: Date | undefined,
  yearBounds: { from?: Date; to?: Date } | undefined,
): void {
  if (process.env.NODE_ENV === "production" || !month) return;
  if (!isYearOutOfBounds(month, yearBounds)) return;

  console.warn(
    `[dooph] Calendar: controlled \`month\` is in ${month.getFullYear()}, outside ` +
      "`yearBounds`. The prop is respected as passed — bounds constrain the " +
      "calendar's own navigation, not values you supply.",
  );
}

const CalendarView = forwardRef<HTMLDivElement, CalendarProps>(function CalendarView(
  props,
  ref,
) {
  const {
    mode,
    month,
    onMonthChange,
    disabled,
    yearBounds,
    renderDay,
    locale,
    labels,
    today: todayProp,
    children,
    className,
    onKeyDown,
    // Read through `props` below so the mode union still narrows them;
    // named here only to keep them off the root <div>.
    value: _value,
    onValueChange: _onValueChange,
    ...rest
  } = props;

  const today = startOfDay(todayProp ?? new Date());
  const anchorDate =
    mode === DatePickerMode.singleDay ? props.value : props.value.from;

  warnOnOutOfBoundsValue(anchorDate, yearBounds);
  warnOnOutOfBoundsMonth(month, yearBounds);

  // Explicit yearBounds are hard limits on NAVIGATION. The view month is
  // component-owned state, so clamping it is legitimate — the consumer's
  // committed value is never rewritten (see warnOnOutOfBoundsValue for that case).
  const [uncontrolledMonth, setUncontrolledMonth] = useState(() =>
    clampMonthToYearBounds(startOfMonth(anchorDate), yearBounds),
  );
  // Bounds clamp what the component decides, never what the consumer passes.
  const viewMonth = month
    ? startOfMonth(month)
    : clampMonthToYearBounds(uncontrolledMonth, yearBounds);

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

  // The presets rail is composed as `children` and calls the consumer's setter
  // directly, so the value can change without this component hearing about it.
  // Reconcile during RENDER rather than in an effect — an effect would paint
  // one frame of the stale month and the stale pending anchor first.
  //
  // The key covers BOTH endpoints so a change to either end is detected. It is
  // also what distinguishes our own commit from an external one: `handleDayClick`
  // records the key it is about to emit, and a matching key here means the
  // change is ours — an internal commit must not move the view or the focus.
  const selectionKey =
    mode === DatePickerMode.singleDay
      ? toDayKey(props.value)
      : `${toDayKey(props.value.from)}|${toDayKey(props.value.to)}`;
  const committedKey = useRef<string | null>(null);
  const [syncedSelectionKey, setSyncedSelectionKey] = useState(selectionKey);

  if (selectionKey !== syncedSelectionKey) {
    setSyncedSelectionKey(selectionKey);

    if (committedKey.current === selectionKey) {
      committedKey.current = null;
    } else {
      // External change: a half-drawn range must not survive it, or the next
      // click would commit a range built from an abandoned anchor.
      setPendingAnchor(null);
      setHoveredDay(null);
      setFocusedDay(anchorDate);

      // Only follow the selection when the view shows NEITHER endpoint. For a
      // preset like "6 Months" ending today, today's month is still on screen
      // and jumping to the start would hide the end the user cares about.
      const rangeEnd =
        mode === DatePickerMode.singleDay ? props.value : props.value.to;
      const showsEndpoint = [anchorDate, rangeEnd].some(
        (endpoint) =>
          endpoint.getFullYear() === viewMonth.getFullYear() &&
          endpoint.getMonth() === viewMonth.getMonth(),
      );
      if (!showsEndpoint && !month) {
        setUncontrolledMonth(
          clampMonthToYearBounds(startOfMonth(rangeEnd), yearBounds),
        );
      }
    }
  }

  // `focusedDay` is a preference; the rendered month decides what can actually
  // hold the roving tabIndex. When the preference scrolls out of view, fall back
  // to a day that is on screen — and to an ENABLED one, because a disabled
  // button cannot take focus and would leave the grid with no tab stop at all.
  const focusedDayInView =
    focusedDay.getFullYear() === viewMonth.getFullYear() &&
    focusedDay.getMonth() === viewMonth.getMonth();

  const effectiveFocusedDay = focusedDayInView
    ? focusedDay
    : (firstEnabledDayOfMonth(viewMonth, disabled) ?? startOfMonth(viewMonth));
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
      ? { from: props.value, to: props.value }
      : props.value;

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
        const committed = startOfDay(date);
        committedKey.current = toDayKey(committed);
        props.onValueChange(committed);
        return;
      }

      const result = resolveRangeClick(date, pendingAnchor);
      if (result.kind === "pending") {
        setPendingAnchor(result.anchor);
        return;
      }
      setPendingAnchor(null);
      setHoveredDay(null);
      committedKey.current = `${toDayKey(result.range.from)}|${toDayKey(result.range.to)}`;
      props.onValueChange(result.range);
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
      moveFocus(effectiveFocusedDay, delta);
    },
    [effectiveFocusedDay, moveFocus],
  );

  return (
    <div
      ref={ref}
      {...rest}
      data-mode={mode}
      className={cn("flex items-stretch", className)}
      onKeyDown={(event) => {
        // Consumer first; a consumer preventDefault() opts out (Radix's rule).
        onKeyDown?.(event);
        if (event.defaultPrevented) return;
        if (event.key === "Escape" && pendingAnchor) {
          // Abandon the pending anchor; the committed value is untouched.
          setPendingAnchor(null);
          setHoveredDay(null);
        }
      }}
    >
      {children}
      <div className="flex flex-col gap-rg p-md ds-calendar-panel-w">
        <CalendarCaption
          viewMonth={viewMonth}
          value={anchorDate}
          today={today}
          yearBounds={yearBounds}
          onMonthChange={changeMonth}
          locale={locale}
          labels={labels}
        />
        <CalendarGrid
          viewMonth={viewMonth}
          selectedRange={selectedRange}
          previewedRange={pendingAnchor ? displayRange : null}
          today={today}
          focusedDay={effectiveFocusedDay}
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
});

/**
 * Validates before any hook or date maths runs, so the view's hooks are never
 * skipped conditionally — an invalid value unmounts the view (its month and
 * focus state reset when a valid value comes back).
 */
const Calendar = forwardRef<HTMLDivElement, CalendarProps>(function Calendar(
  props,
  ref,
) {
  if (!hasValidValue(props)) return null;
  return <CalendarView {...props} ref={ref} />;
});

Calendar.displayName = "Calendar";

export { Calendar };
