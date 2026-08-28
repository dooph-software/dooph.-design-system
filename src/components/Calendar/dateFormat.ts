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
 * Year dropdown options. Derived from explicit bounds when given, otherwise a
 * past-weighted window around today — this is a dashboard component, people
 * look backwards. Always widened to include the current value and view month,
 * or the caption would show a year the dropdown cannot select.
 */
export function buildYearOptions(
  viewMonth: Date,
  value: Date,
  now: Date,
  bounds?: { from?: Date; to?: Date },
): number[] {
  const nowYear = now.getFullYear();
  let first = bounds?.from ? bounds.from.getFullYear() : nowYear - YEARS_BACK;
  let last = bounds?.to ? bounds.to.getFullYear() : nowYear + YEARS_FORWARD;

  for (const year of [viewMonth.getFullYear(), value.getFullYear()]) {
    if (year < first) first = year;
    if (year > last) last = year;
  }

  const years: number[] = [];
  for (let year = first; year <= last; year += 1) years.push(year);
  return years;
}
