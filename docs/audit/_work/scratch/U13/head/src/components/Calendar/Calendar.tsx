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
import { clampMonthToYearBounds, isYearOutOfBounds } from "./dateFormat";
import {
  DAYS_IN_WEEK,
  firstEnabledDayOfMonth,
  isDateDisabled,
  startOfDay,
  startOfMonth,
  toDayKey,
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
    `[dooph] Calendar: \`selected\` is in ${anchorDate.getFullYear()}, outside ` +
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
  warnOnOutOfBoundsMonth(month, yearBounds);

  // Explicit yearBounds are hard limits on NAVIGATION. The view month is
  // component-owned state, so clamping it is legitimate — the consumer's
  // committed value is never rewritten (see warnOnBadValue for that case).
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
      ? toDayKey(props.selected)
      : `${toDayKey(props.selected.from)}|${toDayKey(props.selected.to)}`;
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
        mode === DatePickerMode.singleDay ? props.selected : props.selected.to;
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
        const committed = startOfDay(date);
        committedKey.current = toDayKey(committed);
        props.onSelect(committed);
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
      moveFocus(effectiveFocusedDay, delta);
    },
    [effectiveFocusedDay, moveFocus],
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
}

Calendar.displayName = "Calendar";

export { Calendar };
