// Server-safe pure date math — no client APIs, intentionally NO "use client".
//
// Every value here is a LOCAL calendar day at midnight. Three rules keep that
// true and are the reason this module exists rather than inline helpers:
//   1. Never parse date-only strings — `new Date("2026-05-15")` is UTC midnight
//      and renders as the 14th in negative-offset zones.
//   2. Never add milliseconds to move by days — a DST boundary makes
//      `t + 86400000` land on 01:00, not the next midnight. Always construct.
//   3. Never compare with `getTime()` — compare y/m/d, or compare day keys.

/** Sunday. Fixed by design; the calendar does not expose a week-start prop. */
export const WEEK_STARTS_ON = 0;
export const DAYS_IN_WEEK = 7;
/** Fixed 6 rows so the panel height never changes between months. */
export const WEEKS_IN_GRID = 6;
export const CELLS_IN_GRID = WEEKS_IN_GRID * DAYS_IN_WEEK;

/** Midnight on the same local calendar day. */
export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Stable `YYYY-MM-DD` identity for a local calendar day. */
export function toDayKey(date: Date): string {
  const year = String(date.getFullYear()).padStart(4, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Day 0 of the next month is the last day of this one — leap years included. */
export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/** Column index (0-6) the 1st of the month falls in. */
export function firstWeekdayOfMonth(year: number, month: number): number {
  return (new Date(year, month, 1).getDay() - WEEK_STARTS_ON + DAYS_IN_WEEK) % DAYS_IN_WEEK;
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * Navigate by whole months. Anchored to day 1 so a 31st never rolls forward
 * into the month after next (`new Date(2026, 1, 31)` is March 3).
 */
export function addMonths(date: Date, delta: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

/**
 * The 42 cells of a month view: leading days from the previous month, the
 * month itself, then trailing days from the next. Out-of-range day numbers
 * normalize themselves, so no branch is needed at either boundary.
 */
export function buildMonthGrid(year: number, month: number): Date[] {
  const lead = firstWeekdayOfMonth(year, month);
  const total = daysInMonth(year, month);
  const cells: Date[] = [];

  for (let i = 0; i < lead; i += 1) {
    cells.push(new Date(year, month, i - lead + 1));
  }
  for (let day = 1; day <= total; day += 1) {
    cells.push(new Date(year, month, day));
  }
  let next = 1;
  while (cells.length < CELLS_IN_GRID) {
    cells.push(new Date(year, month + 1, next));
    next += 1;
  }

  return cells;
}

export function isOutsideMonth(date: Date, month: number): boolean {
  return date.getMonth() !== month;
}

/**
 * A day-matching rule. The predicate form is the escape hatch, so this union
 * never needs to grow: weekends, holidays and sparse-data days all fit there.
 */
export type DateMatcher =
  | Date
  | { from: Date; to: Date }
  | { before: Date }
  | { after: Date }
  | ((date: Date) => boolean);

function matchesOne(day: Date, matcher: DateMatcher): boolean {
  if (typeof matcher === "function") return matcher(day);
  if (matcher instanceof Date) return isSameDay(day, matcher);

  const time = startOfDay(day).getTime();
  if ("from" in matcher) {
    return (
      time >= startOfDay(matcher.from).getTime() &&
      time <= startOfDay(matcher.to).getTime()
    );
  }
  if ("before" in matcher) return time < startOfDay(matcher.before).getTime();
  return time > startOfDay(matcher.after).getTime();
}

/**
 * Must be consulted by BOTH click handling and keyboard navigation. Enforcing
 * it only on click is the standard bug in hand-rolled calendars.
 */
export function isDateDisabled(
  date: Date,
  disabled?: DateMatcher | DateMatcher[],
): boolean {
  if (!disabled) return false;
  const matchers = Array.isArray(disabled) ? disabled : [disabled];
  return matchers.some((matcher) => matchesOne(date, matcher));
}

/**
 * The first selectable day of a month, or `undefined` when every day in it is
 * disabled.
 *
 * Used to place the roving tabIndex. A disabled button cannot take focus, so
 * falling back to day 1 unconditionally can still leave the grid with no tab
 * stop — e.g. a forward month under `disabled={{ after: today }}`.
 */
export function firstEnabledDayOfMonth(
  month: Date,
  disabled?: DateMatcher | DateMatcher[],
): Date | undefined {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const total = daysInMonth(year, monthIndex);

  for (let day = 1; day <= total; day += 1) {
    const candidate = new Date(year, monthIndex, day);
    if (!isDateDisabled(candidate, disabled)) return candidate;
  }
  return undefined;
}
