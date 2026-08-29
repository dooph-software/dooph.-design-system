# Date Selector Family Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a hand-rolled `Calendar` panel and `DatePicker` trigger family to `@dooph-software/design-system`, supporting single-day and date-range selection with instant commit, composable presets, and full `--ui-*` token styling.

**Architecture:** Zero calendar dependencies. The month grid is computed from native `Date` in a pure, server-safe module; all selection state is owned by the consumer (props in, callbacks out) except one transient `pendingAnchor` during range selection. The floating panel is a new thin `Popover` wrapper over `@radix-ui/react-popover` — **not** `DropdownMenu`, whose ARIA menu pattern would hijack the grid's arrow keys. Presets are plain data objects shared by both the panel rail and the split trigger.

**Tech Stack:** React 19, TypeScript 5.9, Tailwind v4 (`@theme inline`), Radix Popover, tsup, Storybook 10.

**Background:** `.claude/research/2026-08-27-date-picker-foundation-research.md` — read §§5, 6, 9, 10 before starting. §10.3 is the authoritative range-interaction model and supersedes §9.3.

## Global Constraints

- **Every discrete option is a dot-accessible `const` object** with a derived type of the same identifier, declared in a sibling `constants.ts` with **no** `"use client"` (Architecture Rule 1).
- **Prop names:** `variant` for variants, `size` for sizes, `mode` for `DatePickerMode`. Never `type`/`kind`/`styleVariant`.
- **`"use client"` only** where `useState`/`useEffect`/`useRef`/browser APIs are used. `forwardRef`, `useId`, `useMemo`, `useCallback` are neutral.
- **Styling:** Tailwind utilities or `ds-*` helpers only. No `var(--ui-*)` in className strings, no hex, no arbitrary px for colors/radii/shadows.
- **No raw HTML text elements.** All text goes through `BodyText` / `LabelText` / `ButtonText` / `BaseText`. Day numbers use **`BodyText`**; weekday headers use **`LabelText`**.
- **Spacing t-shirt scale only:** `xxs` 4px, `xs` 8px, `sm` 10px, `rg` 12px, `md` 16px, `lg` 20px, `xl` 28px, `xxl` 40px.
- **Colors:** range band = `bg-ghost-active`; selected endpoints = `bg-primary text-primary-fg`.
- **Week starts Sunday.** Fixed constant, never a prop.
- **Grid:** `grid-cols-7`, zero gap, each cell `aspect-square p-xxs`, columns `minmax(0,1fr)`.
- **Fixed 6 rows (42 cells)** so the panel height never changes between months.
- **Value is required.** No empty state. Dev-time `console.warn` on malformed input, never throw.
- **`forwardRef` + `...props` spread + `cn(internal, className)` + `displayName`** on every component.
- **Radix ref types use `ComponentRef`**, not `ElementRef`.
- **Assumed to already exist:** `CalendarIcon` and `ChevronRightIcon` in `src/components/Icons/` (the user adds these before implementation). Import them from `../Icons`.
- **After adding any `--ui-*` token:** run `npm run sync-tokens`.
- **Verify every task with `npm run lint`** (`tsc --noEmit`) — the repo has no test runner, by design. Correctness is verified by `npm run lint`, `npm run build`, and the Storybook stories in Tasks 13 and 16, which the maintainer reviews manually. **Do not add a test framework.**
- **Never bump the package version.** No `npm version`, no edit to `"version"` in `package.json`, no tags. The maintainer releases manually.
- **Never commit on the maintainer's behalf beyond the commits this plan specifies**, and never push.

## File Structure

```
src/components/Popover/
  Popover.tsx              ← Radix Popover wrapper (client)
  index.ts
  Popover.stories.tsx
src/components/Calendar/
  constants.ts             ← DatePickerMode, DateRange, CalendarPreset, CalendarPresets (server-safe)
  dateUtils.ts             ← month grid math, day keys, matcher evaluation (server-safe, pure)
  rangeSelection.ts        ← restart-on-click resolution (server-safe, pure)
  dateFormat.ts            ← Intl label formatting (server-safe, pure)
  CalendarGrid.tsx         ← weekday header + 42 day cells (client)
  CalendarCaption.tsx      ← month/year TextDropdownTriggers + nav buttons (client)
  Calendar.tsx             ← root: composition, month state, keyboard (client)
  CalendarPresetsPanel.tsx ← preset rail (client)
  index.ts
  Calendar.stories.tsx
src/components/DatePicker/
  DatePickerTrigger.tsx    ← single + range trigger (client)
  DatePickerSplitTrigger.tsx ← trigger joined to inline preset group (client)
  DatePicker.tsx           ← Popover + trigger + Calendar wiring (client)
  index.ts
  DatePicker.stories.tsx
src/styles/tokens.css       ← modify: 3 new tokens
src/index.ts                ← modify: barrel exports
package.json                ← modify: @radix-ui/react-popover
```

**Boundary rationale:** the four pure modules (`dateUtils`, `rangeSelection`, `dateFormat`, `constants`) contain every decision that can be silently wrong — grid math, DST, year boundaries, click resolution — and are unit-tested. The `.tsx` files contain only markup and token classes, verified visually in Storybook. `Calendar` never imports from `DatePicker`; the dependency runs one way.

---

## Task 1: Streamline tsconfig

**Files:**
- Modify: `tsconfig.json`

**Interfaces:**
- Consumes: nothing.
- Produces: the type-check contract every later task's `npm run lint` step runs under.

The current config is healthy — `strict`, `noUnusedLocals`, `noUnusedParameters`
and `isolatedModules` are all on, which is what you want. Two entries restate
TypeScript's own defaults, and three emit flags are inert because `lint` runs
`tsc --noEmit` and `tsup` owns the actual build. This task removes the dead
weight **without** touching a single behavioural setting.

> **Do not** relax `noUnusedLocals`, `noUnusedParameters`, or `strict` to make a
> later task compile. If a task fails on an unused import, the import is the bug.

- [ ] **Step 1: Confirm the current build output as a baseline**

Run: `npm run build`
Expected: completes; `dist/index.d.ts` exists.

Run: `ls dist/index.d.ts dist/index.js dist/index.cjs`
Expected: all three listed. Note this — Step 3 must reproduce it exactly.

- [ ] **Step 2: Remove the redundant defaults**

In `tsconfig.json`, delete these two lines:

```json
    "allowImportingTsExtensions": false,
    "exactOptionalPropertyTypes": false
```

Both restate the compiler default, so removing them changes nothing and stops
them reading as deliberate opt-outs. The result:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "strict": true,
    "moduleResolution": "bundler",
    "module": "ESNext",
    "isolatedModules": true,
    "skipLibCheck": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  },
  "include": ["src", "tsup.config.ts"],
  "exclude": ["node_modules", "dist", ".storybook"]
}
```

- [ ] **Step 3: Verify nothing moved**

Run: `npm run lint`
Expected: no output.

Run: `npm run build`
Expected: completes; `dist/index.d.ts`, `dist/index.js`, `dist/index.cjs` all
present exactly as in Step 1.

> `declaration`, `declarationMap` and `sourceMap` are deliberately **kept**.
> They are inert under `--noEmit`, but tsup's `dts` step reads this config, and
> removing them risks changing what ships for no benefit. Streamlining stops at
> the redundant defaults.

- [ ] **Step 4: Commit**

```bash
git add tsconfig.json
git commit -m "chore: drop redundant tsconfig defaults"
```

---

## Task 2: Month grid math (`dateUtils.ts`)

**Files:**
- Create: `src/components/Calendar/dateUtils.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `DAYS_IN_WEEK: 7`, `WEEKS_IN_GRID: 6`, `CELLS_IN_GRID: 42`, `WEEK_STARTS_ON: 0`
  - `startOfDay(date: Date): Date`
  - `toDayKey(date: Date): string` — `"YYYY-MM-DD"` in local time
  - `isSameDay(a: Date, b: Date): boolean`
  - `daysInMonth(year: number, month: number): number`
  - `firstWeekdayOfMonth(year: number, month: number): number`
  - `startOfMonth(date: Date): Date`
  - `addMonths(date: Date, delta: number): Date` — always first-of-month
  - `buildMonthGrid(year: number, month: number): Date[]` — always 42 entries
  - `isOutsideMonth(date: Date, month: number): boolean`

- [ ] **Step 1: Write the implementation**

Create `src/components/Calendar/dateUtils.ts`:

```ts
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
```

- [ ] **Step 2: Type-check**

Run: `npm run lint`
Expected: no output (success).

- [ ] **Step 3: Commit**

```bash
git add src/components/Calendar/dateUtils.ts
git commit -m "feat(calendar): add pure month-grid date utilities"
```

---

## Task 3: Disabled-date matcher

**Files:**
- Modify: `src/components/Calendar/dateUtils.ts`

**Interfaces:**
- Consumes: `startOfDay`, `isSameDay` from Task 2.
- Produces:
  - `type DateMatcher = Date | { from: Date; to: Date } | { before: Date } | { after: Date } | ((date: Date) => boolean)`
  - `isDateDisabled(date: Date, disabled?: DateMatcher | DateMatcher[]): boolean`

- [ ] **Step 1: Append the implementation**

Add to the end of `src/components/Calendar/dateUtils.ts`:

```ts
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
```

> Note: comparing `.getTime()` here is safe and deliberate — both sides are passed through `startOfDay` first, so the values are midnight-normalized. The rule against `getTime()` applies to raw consumer dates, which is exactly what `startOfDay` neutralizes.

- [ ] **Step 2: Type-check**

Run: `npm run lint`
Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/components/Calendar/dateUtils.ts
git commit -m "feat(calendar): add disabled-date matcher"
```

---

## Task 4: Mode, range type and presets (`constants.ts`)

**Files:**
- Create: `src/components/Calendar/constants.ts`

**Interfaces:**
- Consumes: `startOfDay` from Task 2.
- Produces:
  - `DatePickerMode` const + type (`singleDay: "single-day"`, `dateRange: "date-range"`)
  - `type DateRange = { from: Date; to: Date }`
  - `type CalendarPreset = { id: string; label: string; getRange: (now: Date) => DateRange }`
  - `CalendarPresets` — `today`, `days.three|seven|fourteen|thirty`, `months.three|six`, `custom(...)`
  - `DEFAULT_CALENDAR_PRESETS: CalendarPreset[]` (the six from the Figma rail)
  - `DEFAULT_SPLIT_TRIGGER_PRESETS: CalendarPreset[]` (the three inline ones)

- [ ] **Step 1: Write the implementation**

Create `src/components/Calendar/constants.ts`:

```ts
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
```

- [ ] **Step 2: Type-check**

Run: `npm run lint`
Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/components/Calendar/constants.ts
git commit -m "feat(calendar): add DatePickerMode, DateRange and CalendarPresets"
```

---

## Task 5: Range click resolution (`rangeSelection.ts`)

**Files:**
- Create: `src/components/Calendar/rangeSelection.ts`

**Interfaces:**
- Consumes: `startOfDay` (Task 2), `DateRange` (Task 4).
- Produces:
  - `type RangeClickResult = { kind: "pending"; anchor: Date } | { kind: "commit"; range: DateRange }`
  - `resolveRangeClick(clicked: Date, pendingAnchor: Date | null): RangeClickResult`
  - `previewRange(anchor: Date, hovered: Date): DateRange`
  - `type DayRangePosition = "none" | "start" | "middle" | "end" | "single"`
  - `getDayRangePosition(day: Date, range: DateRange | null): DayRangePosition`

- [ ] **Step 1: Write the implementation**

Create `src/components/Calendar/rangeSelection.ts`:

```ts
// Server-safe pure selection logic — no client APIs, intentionally NO "use client".
//
// The interaction model is RESTART ON CLICK (research doc §10.3): with a range
// committed, the next click anchors a brand-new range and the one after it
// completes. One rule, no discoverable gestures, every selection two clicks.
// Nearest-edge adjustment was evaluated and rejected: it cannot relocate a
// range to a distant window, because no rule based on a single click's
// position can both extend outward in one click and relocate in two.

import type { DateRange } from "./constants";
import { isSameDay, startOfDay } from "./dateUtils";

export type RangeClickResult =
  | { kind: "pending"; anchor: Date }
  | { kind: "commit"; range: DateRange };

/**
 * `onChange` must fire only for a "commit" result. A "pending" result leaves
 * the consumer's committed value untouched, so an incomplete range is never
 * emitted and never rendered.
 */
export function resolveRangeClick(
  clicked: Date,
  pendingAnchor: Date | null,
): RangeClickResult {
  const day = startOfDay(clicked);
  if (!pendingAnchor) {
    return { kind: "pending", anchor: day };
  }
  return { kind: "commit", range: previewRange(pendingAnchor, day) };
}

/** Orders two days into a range. Also drives the hover preview while pending. */
export function previewRange(anchor: Date, hovered: Date): DateRange {
  const a = startOfDay(anchor);
  const b = startOfDay(hovered);
  return a.getTime() <= b.getTime() ? { from: a, to: b } : { from: b, to: a };
}

export type DayRangePosition = "none" | "start" | "middle" | "end" | "single";

/** Drives the band rounding in CalendarGrid — see the layer model in Task 9. */
export function getDayRangePosition(
  day: Date,
  range: DateRange | null,
): DayRangePosition {
  if (!range) return "none";

  const time = startOfDay(day).getTime();
  const from = startOfDay(range.from).getTime();
  const to = startOfDay(range.to).getTime();

  if (time < from || time > to) return "none";
  if (isSameDay(range.from, range.to)) return "single";
  if (time === from) return "start";
  if (time === to) return "end";
  return "middle";
}
```

- [ ] **Step 2: Type-check**

Run: `npm run lint`
Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/components/Calendar/rangeSelection.ts
git commit -m "feat(calendar): add restart-on-click range selection logic"
```
---

## Task 6: Trigger label formatting (`dateFormat.ts`)

**Files:**
- Create: `src/components/Calendar/dateFormat.ts`

**Interfaces:**
- Consumes: `DateRange` (Task 4).
- Produces:
  - `formatSingleLabel(date: Date, now: Date, locale?: string): string`
  - `formatRangeLabel(range: DateRange, now: Date, locale?: string): string`
  - `formatMonthName(date: Date, locale?: string): string`
  - `formatDayAriaLabel(date: Date, locale?: string): string`
  - `buildYearOptions(viewMonth: Date, value: Date, now: Date, bounds?: { from?: Date; to?: Date }): number[]`
  - `clampMonthToYearBounds(month: Date, bounds?: { from?: Date; to?: Date }): Date`

- [ ] **Step 1: Write the implementation**

Create `src/components/Calendar/dateFormat.ts`:

```ts
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
```

- [ ] **Step 2: Type-check**

Run: `npm run lint`
Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/components/Calendar/dateFormat.ts
git commit -m "feat(calendar): add Intl-based label formatting"
```

---

## Task 7: Calendar tokens

**Files:**
- Modify: `src/styles/tokens.css`
- Modify (generated): `src/styles/index.css`, `src/styles/theme.css` — via `npm run sync-tokens`, never by hand

**Interfaces:**
- Consumes: nothing.
- Produces: `rounded-calendar-day`, and the widths consumed by Tasks 9 and 12.

- [ ] **Step 1: Add the tokens**

In `src/styles/tokens.css`, in the `:root`/`.light` block, add beside the other radius tokens (near `--ui-radius-avatar`):

```css
  --ui-radius-calendar-day: 8px;
```

And beside the other width tokens:

```css
  --ui-width-calendar-presets: 144px;
  --ui-min-w-calendar-panel: 240px;
```

Do **not** add `.dark` overrides — none of these three values change between themes.

- [ ] **Step 2: Regenerate the theme**

Run: `npm run sync-tokens`
Expected: `src/styles/index.css` and `src/styles/theme.css` both updated inside their `__GENERATED_*__` markers.

- [ ] **Step 3: Verify the radius utility generated**

Run: `grep -n "calendar-day" src/styles/index.css`
Expected: a `--radius-calendar-day: var(--ui-radius-calendar-day);` line inside the generated block.

If it is absent, add an `ALIASES` entry in `scripts/sync-theme.mjs` mapping `--ui-radius-calendar-day` → `--radius-calendar-day`, then re-run `npm run sync-tokens`.

- [ ] **Step 4: Add the width helpers**

The `--ui-width-*` tokens do not reliably auto-derive into a Tailwind namespace, so add explicit helpers — the same pattern the Toast and Tooltip widths use. In `src/styles/dooph-component-tokens.css`, inside the existing `@layer utilities` block, add:

```css
  .ds-calendar-presets-w {
    width: var(--ui-width-calendar-presets);
    flex: none;
  }

  .ds-calendar-panel-w {
    min-width: var(--ui-min-w-calendar-panel);
  }
```

- [ ] **Step 5: Verify the build**

Run: `npm run build:css`
Expected: completes, `dist/styles.css` written.

Run: `grep -c "ds-calendar-presets-w" dist/styles.css`
Expected: `1` or greater.

- [ ] **Step 6: Commit**

```bash
git add src/styles/tokens.css src/styles/index.css src/styles/theme.css src/styles/dooph-component-tokens.css
git commit -m "feat(tokens): add calendar day radius and panel width tokens"
```

---

## Task 8: Popover component

**Files:**
- Modify: `package.json`
- Create: `src/components/Popover/Popover.tsx`
- Create: `src/components/Popover/index.ts`
- Create: `src/components/Popover/Popover.stories.tsx`
- Modify: `src/index.ts`

**Interfaces:**
- Consumes: `cn` from `../../utils/cn`.
- Produces: `Popover`, `PopoverTrigger`, `PopoverAnchor`, `PopoverPortal`, `PopoverClose`, `PopoverContent`, `PopoverContentProps`.

> **Why Popover and not a DropdownMenu variant:** `DropdownMenu.Content` implements the WAI-ARIA *menu* pattern and owns arrow-key roving focus plus typeahead for its descendants. A 42-button calendar grid inside it would never receive those keys, and neutralizing that means intercepting Radix's own handlers — forbidden by Architecture Rule 2. This is a semantics problem, not a styling one, so no variant can solve it.

- [ ] **Step 1: Install the primitive**

```bash
npm install @radix-ui/react-popover
```

Confirm it landed in `"dependencies"` (not `devDependencies`) in `package.json`.

- [ ] **Step 2: Write the component**

Create `src/components/Popover/Popover.tsx`:

```tsx
"use client";

import * as PopoverPrimitive from "@radix-ui/react-popover";
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ComponentRef,
} from "react";
import { cn } from "../../utils/cn";

const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;
const PopoverAnchor = PopoverPrimitive.Anchor;
const PopoverPortal = PopoverPrimitive.Portal;
const PopoverClose = PopoverPrimitive.Close;

export type PopoverContentProps = ComponentPropsWithoutRef<
  typeof PopoverPrimitive.Content
> & {
  /** Render into a portal. Default true; set false to keep the panel inline. */
  portal?: boolean;
  portalProps?: ComponentPropsWithoutRef<typeof PopoverPrimitive.Portal>;
};

const PopoverContent = forwardRef<
  ComponentRef<typeof PopoverPrimitive.Content>,
  PopoverContentProps
>(
  (
    {
      className,
      align = "start",
      sideOffset = 4,
      collisionPadding = 8,
      portal = true,
      portalProps,
      ...props
    },
    ref,
  ) => {
    const content = (
      <PopoverPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        className={cn(
          "z-50 overflow-hidden rounded-standard",
          "border border-solid border-border-primary bg-surface-primary shadow-button",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
          "data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95",
          "ds-radix-popover-content-origin",
          className,
        )}
        {...props}
      />
    );

    return portal ? (
      <PopoverPrimitive.Portal {...portalProps}>{content}</PopoverPrimitive.Portal>
    ) : (
      content
    );
  },
);
PopoverContent.displayName = "PopoverContent";

export {
  Popover,
  PopoverAnchor,
  PopoverClose,
  PopoverContent,
  PopoverPortal,
  PopoverTrigger,
};
```

- [ ] **Step 3: Add the transform-origin helper**

`ds-radix-dropdown-content-origin` reads the *dropdown menu* CSS variable, which Popover does not set. In `src/styles/dooph-component-tokens.css`, inside `@layer utilities`, add beside the existing origin helper:

```css
  .ds-radix-popover-content-origin {
    transform-origin: var(--radix-popover-content-transform-origin);
  }
```

- [ ] **Step 4: Write the barrel**

Create `src/components/Popover/index.ts`:

```ts
export {
  Popover,
  PopoverAnchor,
  PopoverClose,
  PopoverContent,
  PopoverPortal,
  PopoverTrigger,
} from "./Popover";
export type { PopoverContentProps } from "./Popover";
```

- [ ] **Step 5: Add to the public barrel**

In `src/index.ts`, add beside the other component exports (alphabetical neighbours are `OutlineSection` and `SearchBox`):

```ts
export * from './components/Popover';
```

- [ ] **Step 6: Write stories**

Create `src/components/Popover/Popover.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, ButtonVariant } from "../Button";
import { BodyText } from "../Text";
import { Popover, PopoverContent, PopoverTrigger } from "./Popover";

const meta: Meta<typeof Popover> = {
  title: "Overlays/Popover",
  component: Popover,
};
export default meta;

type Story = StoryObj<typeof Popover>;

export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant={ButtonVariant.secondary}>Open popover</Button>
      </PopoverTrigger>
      <PopoverContent className="p-md">
        <BodyText>Anchored panel content.</BodyText>
      </PopoverContent>
    </Popover>
  ),
};

export const AlignedEnd: Story = {
  render: () => (
    <div className="flex justify-end">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant={ButtonVariant.secondary}>Aligned end</Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="p-md">
          <BodyText>Right-aligned to the trigger.</BodyText>
        </PopoverContent>
      </Popover>
    </div>
  ),
};

export const Inline: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant={ButtonVariant.secondary}>Not portalled</Button>
      </PopoverTrigger>
      <PopoverContent portal={false} className="p-md">
        <BodyText>Rendered in place rather than in a portal.</BodyText>
      </PopoverContent>
    </Popover>
  ),
};
```

- [ ] **Step 7: Verify**

Run: `npm run lint`
Expected: no output.

Run: `npm run storybook`, open **Overlays/Popover**. Confirm all three stories open a panel, that Escape closes it, that clicking outside closes it, and that the panel is not focus-trapped (the page behind stays interactive).

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json src/components/Popover src/styles/dooph-component-tokens.css src/index.ts
git commit -m "feat(popover): add Radix Popover wrapper"
```

---

## Task 9: Calendar grid

**Files:**
- Create: `src/components/Calendar/CalendarGrid.tsx`

**Interfaces:**
- Consumes: `buildMonthGrid`, `toDayKey`, `isSameDay`, `isOutsideMonth`, `isDateDisabled`, `DateMatcher` (Tasks 2–3); `DateRange` (Task 4); `getDayRangePosition`, `DayRangePosition` (Task 5); `formatDayAriaLabel` (Task 6).
- Produces:
  - `type CalendarDayRenderProps = { date: Date; isSelected: boolean; isRangeStart: boolean; isRangeMiddle: boolean; isRangeEnd: boolean; isToday: boolean; isOutside: boolean; isDisabled: boolean; isFocused: boolean }`
  - `CalendarGrid` with props `{ viewMonth, selectedRange, previewedRange, today, focusedDay, disabled, onDayClick, onDayHover, onDayHoverEnd, onDayKeyDown, dayRef, renderDay, locale }`

**The band layer model.** The continuous range highlight comes from putting the
spacing *inside* the cell rather than in the grid gap. With a grid gutter,
adjacent cells cannot touch and the band breaks at every day — which is exactly
the segmented look in the Figma mock. Three layers:

| Layer | Element | Role |
|---|---|---|
| back | grid cell (`<td>`) background | the continuous band (`bg-ghost-active`) |
| middle | day button, inset by the cell's `p-xxs` | hover / focus states |
| front | endpoint fill | `bg-primary text-primary-fg`, drawn above the band |

Rounding: `middle` is square on both sides so it butts against its neighbours;
`start` rounds only the leading edge, `end` only the trailing edge; and the
first and last cell of every row round their outer corners regardless, so a
multi-week band terminates cleanly at each week boundary.

- [ ] **Step 1: Write the component**

Create `src/components/Calendar/CalendarGrid.tsx`:

```tsx
"use client";

import { forwardRef, type ReactNode } from "react";
import { cn } from "../../utils/cn";
import { BodyText, LabelText } from "../Text";
import type { DateRange } from "./constants";
import { formatDayAriaLabel } from "./dateFormat";
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
};

/** Seven narrow weekday names taken from any known week — no lookup table. */
function getWeekdayNames(locale: string | undefined): string[] {
  const formatter = new Intl.DateTimeFormat(locale, { weekday: "short" });
  // 2026-05-31 is a Sunday, so this walks Sun..Sat in order.
  return Array.from({ length: DAYS_IN_WEEK }, (_, index) =>
    formatter.format(new Date(2026, 4, 31 + index)),
  );
}

const CalendarGrid = forwardRef<HTMLTableElement, CalendarGridProps>(
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
      <table
        ref={ref}
        role="grid"
        className="w-full border-collapse table-fixed select-none"
      >
        <thead>
          <tr role="row">
            {weekdays.map((name) => (
              <th key={name} scope="col" className="pb-xs">
                <LabelText className="text-ghost-fg">{name}</LabelText>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week) => (
            <tr key={toDayKey(week[0])} role="row">
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
                  <td
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
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    );
  },
);
CalendarGrid.displayName = "CalendarGrid";

export { CalendarGrid };
```

- [ ] **Step 2: Type-check**

Run: `npm run lint`
Expected: no output.

> If `rounded-l-calendar-day` fails to apply visually later, the `--radius-calendar-day` entry from Task 7 Step 3 did not generate. Tailwind's `rounded-l-*` requires the radius namespace entry; re-check that step before working around it.

- [ ] **Step 3: Commit**

```bash
git add src/components/Calendar/CalendarGrid.tsx
git commit -m "feat(calendar): add month grid with continuous range band"
```

---

## Task 10: Calendar caption

**Files:**
- Create: `src/components/Calendar/CalendarCaption.tsx`

**Interfaces:**
- Consumes: `formatMonthName`, `buildYearOptions` (Task 6); `addMonths` (Task 2).
- Produces: `CalendarCaption` with props `{ viewMonth, value, today, yearBounds, onMonthChange, locale }`.

The caption uses the existing dropdown family: `TextDropdownTrigger` at
`TextDropdownSize.sm` (ghost foreground, `text-style-label`, tiny chevron) for
both month and year, and `Button` at `ButtonSize.iconMicro` — 26px, matching
the Figma nav buttons exactly — with `IconSize.standard` (14px) chevrons.

- [ ] **Step 1: Write the component**

Create `src/components/Calendar/CalendarCaption.tsx`:

```tsx
"use client";

import { Button, ButtonSize, ButtonVariant } from "../Button";
import { ChevronLeftIcon, ChevronRightIcon, IconSize } from "../Icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSection,
  DropdownMenuTrigger,
  DropdownMenuVariant,
} from "../Menu";
import { TextDropdownSize, TextDropdownTrigger } from "../DropdownTrigger";
import { BodyText } from "../Text";
import { addMonths } from "./dateUtils";
import { buildYearOptions, formatMonthName } from "./dateFormat";

export type CalendarCaptionProps = {
  /** First day of the displayed month. */
  viewMonth: Date;
  /** The current selection anchor, so the year list always contains it. */
  value: Date;
  today: Date;
  yearBounds?: { from?: Date; to?: Date };
  onMonthChange: (month: Date) => void;
  locale?: string;
};

function CalendarCaption({
  viewMonth,
  value,
  today,
  yearBounds,
  onMonthChange,
  locale,
}: CalendarCaptionProps) {
  const years = buildYearOptions(viewMonth, value, today, yearBounds);
  const months = Array.from({ length: 12 }, (_, index) => index);

  return (
    <div className="flex items-center justify-between gap-xs">
      <div className="flex items-center gap-xs">
        <DropdownMenu variant={DropdownMenuVariant.action}>
          <DropdownMenuTrigger asChild>
            <TextDropdownTrigger size={TextDropdownSize.sm}>
              {formatMonthName(viewMonth, locale)}
            </TextDropdownTrigger>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuSection>
              {months.map((month) => (
                <DropdownMenuItem
                  key={month}
                  onSelect={() =>
                    onMonthChange(new Date(viewMonth.getFullYear(), month, 1))
                  }
                >
                  <BodyText>
                    {formatMonthName(new Date(2026, month, 1), locale)}
                  </BodyText>
                </DropdownMenuItem>
              ))}
            </DropdownMenuSection>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu variant={DropdownMenuVariant.action}>
          <DropdownMenuTrigger asChild>
            <TextDropdownTrigger size={TextDropdownSize.sm}>
              {viewMonth.getFullYear()}
            </TextDropdownTrigger>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuSection>
              {years.map((year) => (
                <DropdownMenuItem
                  key={year}
                  onSelect={() =>
                    onMonthChange(new Date(year, viewMonth.getMonth(), 1))
                  }
                >
                  <BodyText>{year}</BodyText>
                </DropdownMenuItem>
              ))}
            </DropdownMenuSection>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center">
        <Button
          variant={ButtonVariant.ghost}
          size={ButtonSize.iconMicro}
          aria-label="Previous month"
          onClick={() => onMonthChange(addMonths(viewMonth, -1))}
        >
          <ChevronLeftIcon size={IconSize.standard} />
        </Button>
        <Button
          variant={ButtonVariant.ghost}
          size={ButtonSize.iconMicro}
          aria-label="Next month"
          onClick={() => onMonthChange(addMonths(viewMonth, 1))}
        >
          <ChevronRightIcon size={IconSize.standard} />
        </Button>
      </div>
    </div>
  );
}

export { CalendarCaption };
```

- [ ] **Step 2: Type-check**

Run: `npm run lint`
Expected: no output.

> If `ChevronRightIcon` is unresolved, the icon has not been added yet — it is a Global Constraint prerequisite. Add it to `src/components/Icons/` and run `npm run generate-icon-exports` before continuing.

- [ ] **Step 3: Commit**

```bash
git add src/components/Calendar/CalendarCaption.tsx
git commit -m "feat(calendar): add caption with month/year dropdowns and nav"
```
---

## Task 11: Calendar root

**Files:**
- Create: `src/components/Calendar/Calendar.tsx`

**Interfaces:**
- Consumes: everything from Tasks 2–6, `CalendarGrid` (Task 9), `CalendarCaption` (Task 10).
- Produces:
  - `CalendarProps` — a discriminated union on `mode`
  - `Calendar`

**Behaviour contract (research doc §10):**
- Fully controlled value; the component holds no committed value of its own.
- `mode` is required. Single-day: one click commits. Range: **restart on click** — first click anchors (no `onChange`), second commits.
- Escape or closing the panel abandons a pending anchor; the committed value is untouched.
- A missing or malformed value is a dev-time `console.warn`, never a throw.
- Roving `tabIndex`: exactly one day is tabbable. ←→ ±1 day, ↑↓ ±7 days, Enter/Space select (native button behaviour). Disabled days are skipped by navigation, not merely unclickable.

- [ ] **Step 1: Write the component**

Create `src/components/Calendar/Calendar.tsx`:

```tsx
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
```

> `tsconfig.json` sets `noUnusedLocals: true` — import only what the file's body
> actually uses. Anything neighbouring components need (`isSameDay`,
> `startOfDay`) is re-exported from the barrel in Task 13, not from here.

- [ ] **Step 2: Type-check**

Run: `npm run lint`
Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/components/Calendar/Calendar.tsx
git commit -m "feat(calendar): add Calendar root with restart-on-click ranges"
```

---

## Task 12: Presets rail

**Files:**
- Modify: `src/components/Menu/DropdownMenu.tsx` (export the item class string)
- Create: `src/components/Calendar/CalendarPresetsPanel.tsx`

**Interfaces:**
- Consumes: `CalendarPreset`, `DateRange` (Task 4); `isSameDay` (Task 2).
- Produces: `CalendarPresetsPanel`, `CalendarPresetItem`, `menuItemClassName`.

> **Why not `DropdownMenuItem`:** Radix's `DropdownMenu.Item` requires a
> `DropdownMenu.Root` context. Inside a Popover panel there is none, so it would
> fail at runtime. The rail is built from plain buttons that reuse the *same
> class string* as menu items, which is why Step 1 exports it rather than
> duplicating it — a copy would drift the first time menu styling changes.
>
> **Naming:** the repo uses flat compound names (`DropdownMenuContent`,
> `SheetContent`), not dot-namespaced statics, so this is `CalendarPresetsPanel`
> rather than `Calendar.PresetsPanel`.

- [ ] **Step 1: Export the shared item class string**

In `src/components/Menu/DropdownMenu.tsx`, change the `itemBase` declaration (line ~184) from a module-private const to an exported one, keeping the value byte-identical:

```ts
/**
 * Shared menu-item styling. Exported so surfaces that cannot host a Radix
 * `DropdownMenu.Item` — such as the calendar presets rail inside a Popover —
 * render visually identical items without duplicating the string.
 * Internal: not re-exported from src/index.ts.
 */
export const menuItemClassName =
  "relative flex h-button w-full cursor-pointer select-none items-center rounded-tight ds-pl-ui-rg ds-pr-ui-sm ds-radix-data-disabled gap-[10px] text-style-body text-ghost-fg-active outline-none transition-colors duration-100 hover:bg-ghost-hover data-highlighted:bg-ghost-hover active:bg-ghost-active data-highlighted:active:bg-ghost-active";

const itemBase = menuItemClassName;
```

Leaving `itemBase` as an alias means no other line in that file changes.

- [ ] **Step 2: Write the panel**

Create `src/components/Calendar/CalendarPresetsPanel.tsx`:

```tsx
"use client";

import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { cn } from "../../utils/cn";
import { menuItemClassName } from "../Menu/DropdownMenu";
import { BodyText } from "../Text";
import type { CalendarPreset, DateRange } from "./constants";
import { isSameDay, startOfDay } from "./dateUtils";

export type CalendarPresetsPanelProps = ComponentPropsWithoutRef<"div"> & {
  children?: ReactNode;
};

/** The left rail. Compose `CalendarPresetItem` children into it. */
const CalendarPresetsPanel = forwardRef<HTMLDivElement, CalendarPresetsPanelProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex flex-col gap-xxs p-xs",
        "ds-calendar-presets-w",
        "border-r border-solid border-border-primary",
        className,
      )}
      {...props}
    />
  ),
);
CalendarPresetsPanel.displayName = "CalendarPresetsPanel";

export type CalendarPresetItemProps = Omit<
  ComponentPropsWithoutRef<"button">,
  "onSelect" | "children"
> & {
  preset: CalendarPreset;
  /** The live committed range, used to derive the active state. */
  selected?: DateRange | null;
  today?: Date;
  onSelect: (range: DateRange) => void;
};

/**
 * An ACTION item, not a checkable option: clicking it replaces the range.
 * Active state is derived by comparing the live range to this preset's own
 * `getRange`, so the calendar stays the single source of truth.
 */
const CalendarPresetItem = forwardRef<HTMLButtonElement, CalendarPresetItemProps>(
  ({ className, preset, selected, today, onSelect, ...props }, ref) => {
    const now = startOfDay(today ?? new Date());
    const presetRange = preset.getRange(now);
    const isActive =
      !!selected &&
      isSameDay(selected.from, presetRange.from) &&
      isSameDay(selected.to, presetRange.to);

    return (
      <button
        ref={ref}
        type="button"
        data-active={isActive ? "" : undefined}
        onClick={() => onSelect(preset.getRange(now))}
        className={cn(
          menuItemClassName,
          "ds-focus-visible-ring",
          isActive && "bg-ghost-active",
          className,
        )}
        {...props}
      >
        <BodyText>{preset.label}</BodyText>
      </button>
    );
  },
);
CalendarPresetItem.displayName = "CalendarPresetItem";

export { CalendarPresetItem, CalendarPresetsPanel };
```

- [ ] **Step 3: Type-check**

Run: `npm run lint`
Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add src/components/Menu/DropdownMenu.tsx src/components/Calendar/CalendarPresetsPanel.tsx
git commit -m "feat(calendar): add composable presets rail"
```

---

## Task 13: Calendar barrel and stories

**Files:**
- Create: `src/components/Calendar/index.ts`
- Create: `src/components/Calendar/Calendar.stories.tsx`
- Modify: `src/index.ts`

**Interfaces:**
- Consumes: Tasks 2–12.
- Produces: the public `Calendar` surface.

- [ ] **Step 1: Write the barrel**

Create `src/components/Calendar/index.ts`:

```ts
export { Calendar } from "./Calendar";
export type { CalendarProps } from "./Calendar";
export { CalendarGrid } from "./CalendarGrid";
export type { CalendarDayRenderProps, CalendarGridProps } from "./CalendarGrid";
export { CalendarCaption } from "./CalendarCaption";
export type { CalendarCaptionProps } from "./CalendarCaption";
export { CalendarPresetItem, CalendarPresetsPanel } from "./CalendarPresetsPanel";
export type {
  CalendarPresetItemProps,
  CalendarPresetsPanelProps,
} from "./CalendarPresetsPanel";
export {
  CalendarPresets,
  DatePickerMode,
  DEFAULT_CALENDAR_PRESETS,
  DEFAULT_SPLIT_TRIGGER_PRESETS,
} from "./constants";
export type { CalendarPreset, DateRange } from "./constants";
export type { DateMatcher } from "./dateUtils";
// Re-exported for sibling components (DatePickerSplitTrigger) so nothing deep-imports.
export { isSameDay, startOfDay } from "./dateUtils";
export { formatRangeLabel, formatSingleLabel } from "./dateFormat";
```

- [ ] **Step 2: Add to the public barrel**

In `src/index.ts`, beside the other component exports:

```ts
export * from './components/Calendar';
```

- [ ] **Step 3: Write the stories**

Create `src/components/Calendar/Calendar.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Calendar } from "./Calendar";
import { CalendarPresetItem, CalendarPresetsPanel } from "./CalendarPresetsPanel";
import {
  CalendarPresets,
  DatePickerMode,
  DEFAULT_CALENDAR_PRESETS,
  type DateRange,
} from "./constants";
import { BodyText } from "../Text";

/** Fixed so the grid never changes shape between runs. May 1 2026 is a Friday. */
const TODAY = new Date(2026, 4, 15);

const meta: Meta<typeof Calendar> = {
  title: "Inputs/Calendar",
  component: Calendar,
};
export default meta;

type Story = StoryObj<typeof Calendar>;

export const SingleDay: Story = {
  render: () => {
    const [selected, setSelected] = useState<Date>(TODAY);
    return (
      <Calendar
        mode={DatePickerMode.singleDay}
        selected={selected}
        onSelect={setSelected}
        today={TODAY}
      />
    );
  },
};

export const DateRangeMode: Story = {
  render: () => {
    const [selected, setSelected] = useState<DateRange>({
      from: new Date(2026, 4, 15),
      to: new Date(2026, 4, 22),
    });
    return (
      <Calendar
        mode={DatePickerMode.dateRange}
        selected={selected}
        onSelect={setSelected}
        today={TODAY}
      />
    );
  },
};

export const WithPresets: Story = {
  render: () => {
    const [selected, setSelected] = useState<DateRange>(
      CalendarPresets.days.seven.getRange(TODAY),
    );
    return (
      <Calendar
        mode={DatePickerMode.dateRange}
        selected={selected}
        onSelect={setSelected}
        today={TODAY}
      >
        <CalendarPresetsPanel>
          {DEFAULT_CALENDAR_PRESETS.map((preset) => (
            <CalendarPresetItem
              key={preset.id}
              preset={preset}
              selected={selected}
              today={TODAY}
              onSelect={setSelected}
            />
          ))}
        </CalendarPresetsPanel>
      </Calendar>
    );
  },
};

export const DisabledFutureDates: Story = {
  render: () => {
    const [selected, setSelected] = useState<Date>(TODAY);
    return (
      <Calendar
        mode={DatePickerMode.singleDay}
        selected={selected}
        onSelect={setSelected}
        today={TODAY}
        disabled={{ after: TODAY }}
      />
    );
  },
};

export const CustomRenderDay: Story = {
  render: () => {
    const [selected, setSelected] = useState<Date>(TODAY);
    return (
      <Calendar
        mode={DatePickerMode.singleDay}
        selected={selected}
        onSelect={setSelected}
        today={TODAY}
        renderDay={({ date }) => (
          <div className="flex flex-col items-center">
            <BodyText>{date.getDate()}</BodyText>
            {date.getDate() % 5 === 0 && (
              <span className="size-1 rounded-full bg-primary" aria-hidden />
            )}
          </div>
        )}
      />
    );
  },
};

/** Edge months: 6-row May, Sunday-aligned Feb, leap Feb, century non-leap Feb. */
export const EdgeMonths: Story = {
  render: () => {
    const months = [
      new Date(2026, 4, 1),
      new Date(2026, 1, 1),
      new Date(2024, 1, 1),
      new Date(2100, 1, 1),
    ];
    return (
      <div className="flex flex-wrap gap-md">
        {months.map((month) => (
          <Calendar
            key={month.toISOString()}
            mode={DatePickerMode.singleDay}
            selected={month}
            onSelect={() => {}}
            month={month}
            today={TODAY}
          />
        ))}
      </div>
    );
  },
};
```

- [ ] **Step 4: Verify**

Run: `npm run lint`
Expected: no output.

Run: `npm run storybook`, open **Inputs/Calendar** and confirm each of these by looking:

1. `SingleDay` — May 2026 shows **6 rows**, the 31st is visible, the 15th is a filled dark square with light text.
2. `DateRangeMode` — the band from the 15th to the 22nd is **one continuous strip**, not segmented per day; both endpoints are dark, the middle is light.
3. `DateRangeMode` — click the 10th: the committed band disappears and only the 10th is anchored, then click the 18th and the range commits. Press Escape after a single click and the original 15–22 range is still there.
4. `WithPresets` — "7 Days" is highlighted on load; clicking "30 Days" moves the band and the highlight.
5. `DisabledFutureDates` — days after the 15th are dimmed and unclickable; pressing → from the 15th does not move focus into them.
6. `EdgeMonths` — all four calendars are exactly the same height (6 rows each).
7. Tab into the grid: only one day receives focus; arrow keys move by day and week; arrowing off the month edge pages the month.

- [ ] **Step 5: Commit**

```bash
git add src/components/Calendar/index.ts src/components/Calendar/Calendar.stories.tsx src/index.ts
git commit -m "feat(calendar): export Calendar family with stories"
```

---

## Task 14: DatePicker triggers

**Files:**
- Create: `src/components/DatePicker/DatePickerTrigger.tsx`
- Create: `src/components/DatePicker/DatePickerSplitTrigger.tsx`

**Interfaces:**
- Consumes: `DateRange`, `CalendarPreset`, `DatePickerMode` (Task 4); `formatRangeLabel`, `formatSingleLabel` (Task 6); `isSameDay`, `startOfDay` (Task 2).
- Produces: `DatePickerTrigger`, `DatePickerTriggerProps`, `DatePickerSplitTrigger`, `DatePickerSplitTriggerProps`.

> **On the split variant:** the existing `SplitButton` cannot be reused. Its
> anatomy is `SplitButtonAction` (text, rounded-left) + `SplitButtonTrigger`
> (chevron-only 38×38 square, rounded-right). The Figma date split trigger is
> the inverse: the chevron sits on the *left* part, and the right side is a
> three-segment preset group. This is a new composite that borrows the
> joined-border styling and leaves `SplitButton` untouched.

- [ ] **Step 1: Write the base trigger**

Create `src/components/DatePicker/DatePickerTrigger.tsx`:

```tsx
"use client";

import { forwardRef, type ComponentPropsWithoutRef } from "react";
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
        className={className}
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
```

- [ ] **Step 2: Write the split trigger**

Create `src/components/DatePicker/DatePickerSplitTrigger.tsx`:

```tsx
"use client";

import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { cn } from "../../utils/cn";
import { DropdownTrigger, DropdownTriggerContent } from "../DropdownTrigger";
import { CalendarIcon, IconSize } from "../Icons";
import { ButtonText } from "../Text";
import {
  DEFAULT_SPLIT_TRIGGER_PRESETS,
  formatRangeLabel,
  isSameDay,
  startOfDay,
  type CalendarPreset,
  type DateRange,
} from "../Calendar";

export type DatePickerSplitTriggerProps = Omit<
  ComponentPropsWithoutRef<"div">,
  "onSelect"
> & {
  value: DateRange;
  /** Inline shortcuts. Defaults to the three from the Figma spec. */
  presets?: CalendarPreset[];
  onSelect: (range: DateRange) => void;
  today?: Date;
  locale?: string;
  disabled?: boolean;
  /** Props forwarded to the left trigger — e.g. Radix PopoverTrigger props. */
  triggerProps?: ComponentPropsWithoutRef<"button">;
};

const DatePickerSplitTrigger = forwardRef<
  HTMLDivElement,
  DatePickerSplitTriggerProps
>(
  (
    {
      className,
      value,
      presets = DEFAULT_SPLIT_TRIGGER_PRESETS,
      onSelect,
      today,
      locale,
      disabled,
      triggerProps,
      ...props
    },
    ref,
  ) => {
    const now = startOfDay(today ?? new Date());

    return (
      <div
        ref={ref}
        className={cn("inline-flex rounded-tight shadow-button", className)}
        {...props}
      >
        <DropdownTrigger
          disabled={disabled}
          className="rounded-r-none border-r-0"
          {...triggerProps}
        >
          <DropdownTriggerContent className="items-center">
            <CalendarIcon size={IconSize.standard} />
            <ButtonText>{formatRangeLabel(value, now, locale)}</ButtonText>
          </DropdownTriggerContent>
        </DropdownTrigger>

        <div className="inline-flex">
          {presets.map((preset, index) => {
            const presetRange = preset.getRange(now);
            const isActive =
              isSameDay(value.from, presetRange.from) &&
              isSameDay(value.to, presetRange.to);
            const isLast = index === presets.length - 1;

            return (
              <button
                key={preset.id}
                type="button"
                disabled={disabled}
                data-active={isActive ? "" : undefined}
                onClick={() => onSelect(preset.getRange(now))}
                className={cn(
                  "inline-flex h-button items-center justify-center",
                  "ds-px-ui-sm border border-solid border-border-primary",
                  "bg-secondary text-style-button text-secondary-fg",
                  "cursor-pointer select-none transition-all duration-100",
                  "ds-focus-visible-ring ds-disabled-state",
                  "disabled:bg-secondary-disabled disabled:border-secondary-border-disabled",
                  !isLast && "border-r-0",
                  isLast ? "rounded-l-none rounded-r-tight" : "rounded-none",
                  "[&:not(:disabled)]:hover:bg-secondary-hover",
                  isActive && "bg-ghost-active",
                )}
              >
                <ButtonText>{preset.label}</ButtonText>
              </button>
            );
          })}
        </div>
      </div>
    );
  },
);
DatePickerSplitTrigger.displayName = "DatePickerSplitTrigger";

export { DatePickerSplitTrigger };
```

- [ ] **Step 3: Type-check**

Run: `npm run lint`
Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add src/components/DatePicker/DatePickerTrigger.tsx src/components/DatePicker/DatePickerSplitTrigger.tsx
git commit -m "feat(datepicker): add trigger and split trigger"
```

---

## Task 15: DatePicker root

**Files:**
- Create: `src/components/DatePicker/DatePicker.tsx`
- Create: `src/components/DatePicker/index.ts`
- Modify: `src/index.ts`

**Interfaces:**
- Consumes: `Popover`/`PopoverTrigger`/`PopoverContent` (Task 8); `Calendar` (Task 11); triggers (Task 14).
- Produces: `DatePicker`, `DatePickerProps`.

**Behaviour:** clicking a day commits immediately; the panel **stays open** and
closes only on outside click or Escape. There is no Apply button and no draft
value.

- [ ] **Step 1: Write the component**

Create `src/components/DatePicker/DatePicker.tsx`:

```tsx
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
```

- [ ] **Step 2: Write the barrel**

Create `src/components/DatePicker/index.ts`:

```ts
export { DatePicker } from "./DatePicker";
export type { DatePickerProps } from "./DatePicker";
export { DatePickerTrigger, formatTriggerLabel } from "./DatePickerTrigger";
export type { DatePickerTriggerProps } from "./DatePickerTrigger";
export { DatePickerSplitTrigger } from "./DatePickerSplitTrigger";
export type { DatePickerSplitTriggerProps } from "./DatePickerSplitTrigger";
```

- [ ] **Step 3: Add to the public barrel**

In `src/index.ts`:

```ts
export * from './components/DatePicker';
```

- [ ] **Step 4: Type-check**

Run: `npm run lint`
Expected: no output.

- [ ] **Step 5: Commit**

```bash
git add src/components/DatePicker/DatePicker.tsx src/components/DatePicker/index.ts src/index.ts
git commit -m "feat(datepicker): add DatePicker root over Popover"
```

---

## Task 16: DatePicker stories and full verification

**Files:**
- Create: `src/components/DatePicker/DatePicker.stories.tsx`

**Interfaces:**
- Consumes: everything.
- Produces: the visual verification surface.

- [ ] **Step 1: Write the stories**

Create `src/components/DatePicker/DatePicker.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import {
  CalendarPresetItem,
  CalendarPresets,
  CalendarPresetsPanel,
  DatePickerMode,
  DEFAULT_CALENDAR_PRESETS,
  DEFAULT_SPLIT_TRIGGER_PRESETS,
  type DateRange,
} from "../Calendar";
import { DatePicker } from "./DatePicker";

const TODAY = new Date(2026, 4, 15);

const meta: Meta<typeof DatePicker> = {
  title: "Inputs/DatePicker",
  component: DatePicker,
};
export default meta;

type Story = StoryObj<typeof DatePicker>;

export const SingleDay: Story = {
  render: () => {
    const [value, setValue] = useState<Date>(new Date(2026, 4, 14));
    return (
      <DatePicker
        mode={DatePickerMode.singleDay}
        value={value}
        onChange={setValue}
        today={TODAY}
      />
    );
  },
};

export const DateRangeMode: Story = {
  render: () => {
    const [value, setValue] = useState<DateRange>({
      from: new Date(2026, 4, 14),
      to: new Date(2026, 5, 14),
    });
    return (
      <DatePicker
        mode={DatePickerMode.dateRange}
        value={value}
        onChange={setValue}
        today={TODAY}
      />
    );
  },
};

export const WithPresetsPanel: Story = {
  render: () => {
    const [value, setValue] = useState<DateRange>(
      CalendarPresets.days.seven.getRange(TODAY),
    );
    return (
      <DatePicker
        mode={DatePickerMode.dateRange}
        value={value}
        onChange={setValue}
        today={TODAY}
      >
        <CalendarPresetsPanel>
          {DEFAULT_CALENDAR_PRESETS.map((preset) => (
            <CalendarPresetItem
              key={preset.id}
              preset={preset}
              selected={value}
              today={TODAY}
              onSelect={setValue}
            />
          ))}
        </CalendarPresetsPanel>
      </DatePicker>
    );
  },
};

export const SplitTrigger: Story = {
  render: () => {
    const [value, setValue] = useState<DateRange>(
      CalendarPresets.days.seven.getRange(TODAY),
    );
    return (
      <DatePicker
        mode={DatePickerMode.dateRange}
        value={value}
        onChange={setValue}
        splitPresets={DEFAULT_SPLIT_TRIGGER_PRESETS}
        today={TODAY}
      />
    );
  },
};

export const CrossingAYearBoundary: Story = {
  render: () => {
    const [value, setValue] = useState<DateRange>({
      from: new Date(2025, 11, 28),
      to: new Date(2026, 0, 4),
    });
    return (
      <DatePicker
        mode={DatePickerMode.dateRange}
        value={value}
        onChange={setValue}
        today={TODAY}
      />
    );
  },
};

export const DisabledTrigger: Story = {
  render: () => (
    <div className="flex flex-col gap-sm">
      <DatePicker
        mode={DatePickerMode.singleDay}
        value={new Date(2026, 4, 14)}
        onChange={() => {}}
        triggerDisabled
        today={TODAY}
      />
      <DatePicker
        mode={DatePickerMode.dateRange}
        value={{ from: new Date(2026, 4, 14), to: new Date(2026, 5, 14) }}
        onChange={() => {}}
        splitPresets={DEFAULT_SPLIT_TRIGGER_PRESETS}
        triggerDisabled
        today={TODAY}
      />
    </div>
  ),
};
```

- [ ] **Step 2: Type-check**

Run: `npm run lint`
Expected: no output.

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: completes; `dist/index.js`, `dist/index.cjs`, `dist/index.d.ts`, `dist/styles.css`, `dist/theme.css` all present.

- [ ] **Step 4: Confirm the public surface shipped**

Run: `grep -o "DatePickerMode\|CalendarPresets\|DatePickerSplitTrigger\|PopoverContent" dist/index.d.ts | sort -u`
Expected: all four names present.

- [ ] **Step 5: Storybook sweep**

Run: `npm run storybook`, open **Inputs/DatePicker** and confirm:

1. `SingleDay` — trigger reads `May 14`; clicking a day updates the label and the panel **stays open**; Escape and outside click both close it.
2. `DateRangeMode` — trigger reads `May 14 - June 14`, **no year**.
3. `CrossingAYearBoundary` — trigger reads `December 28, 2025 - January 4, 2026`, year on **both** endpoints.
4. `WithPresetsPanel` — the rail sits left of the grid with a divider; "7 Days" highlighted; clicking "30 Days" updates the trigger label and the band together.
5. `SplitTrigger` — the trigger and the three preset buttons read as one joined control with a single shadow, no doubled borders at the seams; the active preset is highlighted.
6. `DisabledTrigger` — both variants are dimmed and non-interactive.
7. Toggle the Storybook dark mode decorator on `DateRangeMode`: the band and endpoints both invert correctly and stay legible.

- [ ] **Step 6: Commit**

```bash
git add src/components/DatePicker/DatePicker.stories.tsx
git commit -m "feat(datepicker): add stories and verify build"
```

---

## Task 17: Focus reachability and bounds symmetry

**Files:**
- Modify: `src/components/Calendar/dateUtils.ts` (append one function)
- Modify: `src/components/Calendar/dateFormat.ts` (append one function)
- Modify: `src/components/Calendar/Calendar.tsx`
- Modify: `src/components/Calendar/CalendarCaption.tsx`

**Interfaces:**
- Consumes: `daysInMonth`, `isDateDisabled`, `DateMatcher`, `startOfMonth`, `addMonths` (Tasks 2–3); `clampMonthToYearBounds` (Task 6).
- Produces:
  - `firstEnabledDayOfMonth(month: Date, disabled?: DateMatcher | DateMatcher[]): Date | undefined`
  - `isYearOutOfBounds(date: Date, bounds?: { from?: Date; to?: Date }): boolean`

This task fixes two defects found in review of Task 11. Neither is cosmetic.

**Defect 1 — the grid can lose its only tab stop.** `focusedDay` is seeded once and
moves only on a day click or an arrow key. The caption's nav buttons and dropdowns
change `viewMonth` without touching it. `CalendarGrid` gives `tabIndex={0}` to
whichever cell satisfies `isSameDay(date, focusedDay)` — so once `focusedDay` is not
among the 42 rendered cells, **every** cell is `tabIndex={-1}` and the grid drops out
of the tab order. With the default May 2026, June's grid runs May 31 → July 11, so a
single click of "next month" is enough to trigger it.

The fix is not to re-sync `focusedDay` to `selected`. It is to stop treating it as
authoritative: it is a *preference*, and the rendered month decides what can actually
hold the roving tabIndex.

**Defect 2 — bounds are applied asymmetrically.** A controlled `month` prop outside
`yearBounds` is silently clamped, so the consumer's state and the displayed month
diverge permanently with nothing in the console — while `selected` in the same
situation is respected and warned about. The rule that resolves it:

> **Bounds clamp what the component decides. They never override what the consumer passes.**

| State | Owner | Bounds behaviour |
| --- | --- | --- |
| `uncontrolledMonth` initial value | component | clamp |
| `changeMonth` from nav / dropdown | component | clamp |
| `month` prop | consumer | respect, warn in dev |
| `selected` | consumer | respect, warn in dev (already correct) |

Clamping also makes "previous month" at the floor a click that does nothing with no
feedback, so this task disables the nav buttons at the bounds.

> **Note on granularity:** `yearBounds` is year-level — `clampMonthToYearBounds` floors
> to January and ceilings to December of the bound years. Every month of a boundary
> year is therefore in bounds, so the month dropdown needs no filtering. Only the
> nav buttons and the year dropdown are affected.

- [ ] **Step 1: Add the enabled-day scan to `dateUtils.ts`**

Append to `src/components/Calendar/dateUtils.ts`:

```ts
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
```

- [ ] **Step 2: Add the bounds predicate to `dateFormat.ts`**

Append to `src/components/Calendar/dateFormat.ts`:

```ts
/**
 * Whether a date's YEAR falls outside explicit bounds. `yearBounds` is
 * year-granular, so this is the single test behind the out-of-bounds warnings
 * and the nav-button disabling.
 */
export function isYearOutOfBounds(
  date: Date,
  bounds?: { from?: Date; to?: Date },
): boolean {
  if (!bounds) return false;
  const year = date.getFullYear();
  if (bounds.from && year < bounds.from.getFullYear()) return true;
  if (bounds.to && year > bounds.to.getFullYear()) return true;
  return false;
}
```

- [ ] **Step 3: Update the imports in `Calendar.tsx`**

Replace the two import lines:

```ts
import { clampMonthToYearBounds } from "./dateFormat";
```

with:

```ts
import { clampMonthToYearBounds, isYearOutOfBounds } from "./dateFormat";
```

and add `firstEnabledDayOfMonth` to the existing `./dateUtils` import so it reads:

```ts
import {
  DAYS_IN_WEEK,
  firstEnabledDayOfMonth,
  isDateDisabled,
  startOfDay,
  startOfMonth,
  type DateMatcher,
} from "./dateUtils";
```

- [ ] **Step 4: Simplify the value warning and add the month warning**

In `Calendar.tsx`, replace the body of `warnOnOutOfBoundsValue` and add a sibling.
The existing function's inline year comparison becomes a call to the shared
predicate; the new one covers the controlled `month` prop.

```ts
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
```

- [ ] **Step 5: Respect a controlled month, clamp only our own**

In `Calendar.tsx`, replace the `viewMonth` derivation:

```ts
  const viewMonth = clampMonthToYearBounds(
    month ? startOfMonth(month) : uncontrolledMonth,
    yearBounds,
  );
```

with:

```ts
  // Bounds clamp what the component decides, never what the consumer passes.
  const viewMonth = month
    ? startOfMonth(month)
    : clampMonthToYearBounds(uncontrolledMonth, yearBounds);
```

The lazy `useState` initialiser and `changeMonth` keep their `clampMonthToYearBounds`
calls unchanged — both are component-owned.

Then add the new warning call immediately after the existing one:

```ts
  warnOnOutOfBoundsValue(anchorDate, yearBounds);
  warnOnOutOfBoundsMonth(month, yearBounds);
```

- [ ] **Step 6: Derive the effective focused day**

In `Calendar.tsx`, immediately after the `focusedDay` state declaration, add:

```ts
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
```

Month equality is a sufficient in-view test: `moveFocus` already calls `changeMonth`
whenever it crosses a month boundary, so `focusedDay` and `viewMonth` stay in lockstep
on the arrow-key path.

- [ ] **Step 7: Read through the effective value everywhere**

Three read sites change; the two `setFocusedDay` write sites do not.

In `handleDayKeyDown`, the `moveFocus` call and its dependency array:

```ts
      moveFocus(effectiveFocusedDay, delta);
    },
    [effectiveFocusedDay, moveFocus],
  );
```

And the prop passed to `CalendarGrid`:

```ts
          focusedDay={effectiveFocusedDay}
```

- [ ] **Step 8: Disable the nav buttons at the bounds**

In `CalendarCaption.tsx`, add to the imports:

```ts
import { buildYearOptions, formatMonthName, isYearOutOfBounds } from "./dateFormat";
```

Inside the component, after the `months` array, add:

```ts
  // Clamping already prevents navigating out of bounds — disabling the button
  // tells the user that, instead of letting them click into a no-op.
  //
  // Guarded on the CURRENT view being in bounds. Step 5 makes an out-of-bounds
  // `viewMonth` reachable for the first time (a controlled `month` prop is now
  // respected rather than clamped), and in that state BOTH neighbours are also
  // out of bounds — so an unguarded test would disable both arrows, including
  // the one pointing back toward the bounds, stranding the user exactly where
  // they most need to navigate.
  const viewInBounds = !isYearOutOfBounds(viewMonth, yearBounds);
  const atFloor =
    viewInBounds && isYearOutOfBounds(addMonths(viewMonth, -1), yearBounds);
  const atCeiling =
    viewInBounds && isYearOutOfBounds(addMonths(viewMonth, 1), yearBounds);
```

Then add `disabled` to each nav `Button`:

```tsx
        <Button
          variant={ButtonVariant.ghost}
          size={ButtonSize.iconMicro}
          aria-label="Previous month"
          disabled={atFloor}
          onClick={() => onMonthChange(addMonths(viewMonth, -1))}
        >
          <ChevronLeftIcon size={IconSize.standard} />
        </Button>
        <Button
          variant={ButtonVariant.ghost}
          size={ButtonSize.iconMicro}
          aria-label="Next month"
          disabled={atCeiling}
          onClick={() => onMonthChange(addMonths(viewMonth, 1))}
        >
          <ChevronRightIcon size={IconSize.standard} />
        </Button>
```

- [ ] **Step 9: Add a story that exercises the bounds**

In `src/components/Calendar/Calendar.stories.tsx`, add:

```tsx
export const YearBounds: Story = {
  render: () => {
    const [selected, setSelected] = useState<Date>(TODAY);
    return (
      <Calendar
        mode={DatePickerMode.singleDay}
        selected={selected}
        onSelect={setSelected}
        today={TODAY}
        yearBounds={{ from: new Date(2026, 0, 1), to: new Date(2026, 11, 31) }}
      />
    );
  },
};
```

- [ ] **Step 10: Verify**

Run: `npm run lint`
Expected: no output.

Run: `npm run build`
Expected: completes.

- [ ] **Step 11: Commit**

```bash
git add src/components/Calendar/dateUtils.ts src/components/Calendar/dateFormat.ts src/components/Calendar/Calendar.tsx src/components/Calendar/CalendarCaption.tsx src/components/Calendar/Calendar.stories.tsx
git commit -m "fix(calendar): keep a tab stop in view and respect controlled month"
```

**Maintainer's visual check for this task** (deferred, as with all story work):
1. Open `Inputs/Calendar` → `SingleDay`, click "next month" once, then press Tab from the page — a day cell in the displayed month should receive focus. Before this fix, focus skipped the grid entirely.
2. `DisabledFutureDates` → navigate forward a month; the tab stop should land on nothing focusable (whole month disabled) but the caption nav must still be reachable.
3. `YearBounds` → navigate to January 2026; "previous month" should be visibly disabled. Same for December 2026 and "next month".

---

## Plan Self-Review

**Spec coverage** — every decision in the research doc maps to a task:

| Research § | Requirement | Task |
|---|---|---|
| §5 | Month grid math, 6 fixed rows, DST/UTC/rollover traps | 2 |
| §6.1 | Instant apply, no Apply button | 11, 15 |
| §6.2 | Controlled value, `{from,to}` structural type, `renderDay` escape hatch | 4, 9, 11 |
| §6.3 | Presets as data, composed children, shared with trigger | 4, 12, 14 |
| §6.4 | Popover not DropdownMenu | 8 |
| §6.5 | grid-cols-7, `p-xxs`, fixed 6 rows, day states, caption dropdowns | 7, 9, 10 |
| §6.6 | Single / range / split triggers, conditional year | 6, 14 |
| §6.7 | Roving tabIndex, ←→↑↓, Enter/Space, `aria-label`, `role="grid"` | 9, 11 |
| §9.1 | Year shown outside the current year, both endpoints | 6 |
| §9.2 | Year bounds derived, past-weighted default, widened for the value | 6, 10 |
| §9.4 | `DateMatcher` union, enforced in click *and* keyboard | 3, 9, 11 |
| §9.5 | Content slot, not button swap | 9 |
| §9.6 | Continuous band: gap-0, band on the cell, week-boundary rounding | 7, 9 |
| §10.1 | `DatePickerMode` required, kebab values | 4 |
| §10.2 | Required value, non-nullable `to`, warn not throw | 4, 11 |
| §10.3 | Restart on click, abandon on dismiss, committed label while pending | 5, 11 |
| §10.4 | Panel stays open; Escape and outside click close | 15 |

**Task 17** was added after Task 11's review surfaced two defects: the roving tabIndex could leave the grid with no tab stop after a single month navigation, and `yearBounds` was applied asymmetrically (clamping a consumer-controlled `month` while merely warning about `selected`). It also disables the nav buttons at the bounds so clamping is never a silent no-op.

**Known gaps, deliberately deferred** (§11 of the research doc): whether the caption dropdowns should hide months/years containing no selectable day once `disabled` is in play; and whether the split trigger's preset highlight should sync with a panel rail rendered at the same time. Both are additive and neither blocks v1.

**Type consistency check:** `DateRange` is `{ from: Date; to: Date }` in every task. `DateMatcher` is defined once in Task 3 and imported everywhere. `CalendarPreset.getRange(now: Date): DateRange` matches its call sites in Tasks 12 and 14. `CalendarDayRenderProps` is defined in Task 9 and consumed unchanged in Tasks 11 and 13. `menuItemClassName` is exported in Task 12 Step 1 before its first use in Step 2.

**Ordering note:** Tasks 1–7 have no UI dependencies and can be done in one sitting. Task 8 (Popover) is independent of Tasks 2–7 and could run in parallel with them. Tasks 9–16 are strictly sequential.
