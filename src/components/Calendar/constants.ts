// Server-safe constants — no client APIs, intentionally NO "use client" directive
// so these dot-accessible enums can be read from React Server Components.

import { startOfDay } from "./dateUtils";

/**
 * Dot-accessible date picker mode.
 * Required, never inferred from the value shape — the two modes have different
 * value types and different interaction models.
 *
 * Usage: <DatePicker mode={DatePickerMode.dateRange} />
 */
export const DatePickerMode = {
  singleDay: "single-day",
  dateRange: "date-range",
} as const;
export type DatePickerMode =
  (typeof DatePickerMode)[keyof typeof DatePickerMode];

/**
 * The complete range contract. Structural, not nominal: any consumer object
 * with these two fields satisfies it, so nothing needs importing to use it.
 * `to` is non-nullable — an incomplete range is never a public state.
 */
export type DateRange = {
  from: Date;
  to: Date;
};

/**
 * A preset is data with a function. Consumer-authored presets satisfy this
 * structurally, and the same object works in both the panel rail and the
 * split trigger.
 */
export type CalendarPreset = {
  id: string;
  label: string;
  getRange: (now: Date) => DateRange;
};

/** N days INCLUSIVE of today: "7 Days" is today and the six before it. */
function lastDays(id: string, label: string, days: number): CalendarPreset {
  return {
    id,
    label,
    getRange: (now) => {
      const to = startOfDay(now);
      return {
        from: new Date(to.getFullYear(), to.getMonth(), to.getDate() - (days - 1)),
        to,
      };
    },
  };
}

/**
 * N whole months back from today, clamped to the target month's last day so
 * "3 months before May 31" is Feb 28 rather than rolling into March.
 */
function lastMonths(id: string, label: string, months: number): CalendarPreset {
  return {
    id,
    label,
    getRange: (now) => {
      const to = startOfDay(now);
      const targetLastDay = new Date(
        to.getFullYear(),
        to.getMonth() - months + 1,
        0,
      ).getDate();
      return {
        from: new Date(
          to.getFullYear(),
          to.getMonth() - months,
          Math.min(to.getDate(), targetLastDay),
        ),
        to,
      };
    },
  };
}

/**
 * Built-in presets, dot-accessible. Pass them to <CalendarPresetsPanel> or to
 * <DatePickerSplitTrigger presets={...}>.
 *
 * Usage: <CalendarPresetItem preset={CalendarPresets.days.seven} />
 */
export const CalendarPresets = {
  today: {
    id: "today",
    label: "Today",
    getRange: (now: Date) => ({ from: startOfDay(now), to: startOfDay(now) }),
  } satisfies CalendarPreset,
  days: {
    three: lastDays("days-3", "3 Days", 3),
    seven: lastDays("days-7", "7 Days", 7),
    fourteen: lastDays("days-14", "14 Days", 14),
    thirty: lastDays("days-30", "30 Days", 30),
  },
  months: {
    three: lastMonths("months-3", "3 Months", 3),
    six: lastMonths("months-6", "6 Months", 6),
  },
  /** Escape hatch for a preset the built-ins don't cover. */
  custom: ({
    id,
    label,
    days,
  }: {
    id: string;
    label: string;
    days: number;
  }): CalendarPreset => lastDays(id, label, days),
} as const;

/** The six presets in the Figma panel rail, in design order. */
export const DEFAULT_CALENDAR_PRESETS: CalendarPreset[] = [
  CalendarPresets.days.three,
  CalendarPresets.days.seven,
  CalendarPresets.days.fourteen,
  CalendarPresets.days.thirty,
  CalendarPresets.months.three,
  CalendarPresets.months.six,
];

/** The three inline presets in the Figma split trigger, in design order. */
export const DEFAULT_SPLIT_TRIGGER_PRESETS: CalendarPreset[] = [
  CalendarPresets.days.seven,
  CalendarPresets.days.thirty,
  CalendarPresets.months.three,
];
