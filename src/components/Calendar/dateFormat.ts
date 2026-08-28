// Server-safe formatting — no client APIs, intentionally NO "use client".
// Everything goes through Intl; the package ships no formatting dependency.

import type { DateRange } from "./constants";

const YEARS_BACK = 10;
const YEARS_FORWARD = 1;

// `month: "long"` matches the Figma trigger exactly ("May 14 - June 14").
// "short" would render "Jun 14"; if a more compact label is ever wanted, this
// is the single line to change.
function format(date: Date, locale: string | undefined, withYear: boolean): string {
  return new Intl.DateTimeFormat(locale, {
    month: "long",
    day: "numeric",
    ...(withYear ? { year: "numeric" } : {}),
  }).format(date);
}

export function formatSingleLabel(
  date: Date,
  now: Date,
  locale?: string,
): string {
  return format(date, locale, date.getFullYear() !== now.getFullYear());
}

/**
 * The year appears when the range is not entirely within the current year —
 * and it appears on BOTH endpoints or neither, never on one.
 */
export function formatRangeLabel(
  range: DateRange,
  now: Date,
  locale?: string,
): string {
  const currentYear = now.getFullYear();
  const withYear =
    range.from.getFullYear() !== currentYear ||
    range.to.getFullYear() !== currentYear;
  return `${format(range.from, locale, withYear)} - ${format(range.to, locale, withYear)}`;
}

export function formatMonthName(date: Date, locale?: string): string {
  return new Intl.DateTimeFormat(locale, { month: "long" }).format(date);
}

/** A full readable date for the day cell's accessible name — never just "15". */
export function formatDayAriaLabel(date: Date, locale?: string): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

/**
 * Year dropdown options.
 *
 * An explicit bound is a HARD limit — a consumer who passes `{ from, to }` is
 * stating which years their data covers, and the dropdown must not offer more.
 * A bound the caller omitted defaults to a past-weighted window around today
 * (this is a dashboard component; people look backwards) and DOES widen to
 * include the current value or view month, so a value far outside the default
 * window stays reachable.
 *
 * The caption can still name a year outside explicit bounds if the consumer's
 * value sits there. That is their data to fix — `Calendar` warns about it and
 * clamps navigation rather than silently rewriting the value.
 */
export function buildYearOptions(
  viewMonth: Date,
  value: Date,
  now: Date,
  bounds?: { from?: Date; to?: Date },
): number[] {
  const nowYear = now.getFullYear();
  const hasFrom = bounds?.from !== undefined;
  const hasTo = bounds?.to !== undefined;
  let first = hasFrom ? bounds!.from!.getFullYear() : nowYear - YEARS_BACK;
  let last = hasTo ? bounds!.to!.getFullYear() : nowYear + YEARS_FORWARD;

  for (const year of [viewMonth.getFullYear(), value.getFullYear()]) {
    if (!hasFrom && year < first) first = year;
    if (!hasTo && year > last) last = year;
  }

  // A caller can pass crossed bounds; degrade to a single year rather than [].
  if (last < first) last = first;

  const years: number[] = [];
  for (let year = first; year <= last; year += 1) years.push(year);
  return years;
}

/**
 * Clamp a month into explicit year bounds. The VIEW month is component-owned
 * state, so clamping it is legitimate; the consumer's committed value is never
 * rewritten. Used to pick the opening month and to bound navigation.
 */
export function clampMonthToYearBounds(
  month: Date,
  bounds?: { from?: Date; to?: Date },
): Date {
  if (!bounds) return month;

  if (bounds.from) {
    const floor = new Date(bounds.from.getFullYear(), 0, 1);
    if (month.getTime() < floor.getTime()) return floor;
  }
  if (bounds.to) {
    const ceiling = new Date(bounds.to.getFullYear(), 11, 1);
    if (month.getTime() > ceiling.getTime()) return ceiling;
  }
  return month;
}
