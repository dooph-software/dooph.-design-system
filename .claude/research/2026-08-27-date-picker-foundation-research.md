# Date Picker Foundation — Research Brief

**For:** the agent implementing the dooph date selector family.
**Written:** 2026-08-27. Everything below was verified against the live web or by running code on this machine on that date. Model priors about this space are stale — v10 of DayPicker, the package rename, and Temporal's shipping status all post-date most training data.
**Status:** research only. No code was written and none is prescribed. Nothing here is a decision you must follow; it is the ground truth you need to make one.
**Revisions:** §§1–5 are the original landscape research and remain accurate. **§§6–11 supersede them** — the design and behaviour firmed up afterwards (rev 2: instant apply, no Apply button, composable presets, dedicated trigger component, relaxed a11y bar; rev 3: the interaction and formatting rules in §9; rev 4: mode discrimination, close behaviour, and v1 scope in §10; rev 5: range interaction settled as **restart-on-click**, §10.3). Where they disagree, the later section wins.

**If you read only one behavioural section, read §10.3.** It is the final range-interaction model and it supersedes §9.3 entirely.

**Week start is fixed at Sunday.** Not a prop, not configurable — decided. The `weekStartsOn` parameter in §5's formula stays in the code as a one-line constant, not an API surface.

---

## 1. Bottom line

**Radix has no calendar.** Not in `radix-ui`, not planned, no roadmap. The request has been open since 2021 with one maintainer reply ("we will introduce it eventually", Nov 2021) and zero movement since. There is nothing to wrap.

So the real question is which of five foundations to build on. Ranked by fit against dooph's constraints (strict token/style control, MIT/open source, minimal dependency surface, React 19, Tailwind v4):

| Rank | Option | One-line verdict |
|---|---|---|
| 1 | **Home-roll the grid** | The date math is ~40 lines and fully verified below. You own keyboard + ARIA. Zero deps, zero style fights. Strongest fit for a strict DS. |
| 2 | **`@daypicker/react` v10** | Best-supported library; slot-swappable down to every element; but ships its own CSS conventions and drags `date-fns` (~824 KB unpacked) in. |
| 3 | **Ark UI / `@zag-js/date-picker`** | Genuinely markup-agnostic (you write every tag), `data-part`/`data-state` styling, MIT. Heaviest dep tree. |
| 4 | **React Aria (`react-aria-components`)** | Gold-standard a11y + i18n calendars. Apache-2.0, big surface, its own value type. Overkill unless you need non-Gregorian calendars. |
| 5 | **Micro headless libs** | `@rehookify/datepicker` et al. Small and unstyled, but thin maintenance. Not worth the supply-chain risk when option 1 exists. |

The gap between #1 and #2 is small and it is a judgment call, not a fact. Read §5 before deciding — it exists to remove the fear of the grid, which is the only reason to reach for a library here.

**Revision 2 resolves it toward #1.** Once the constraints in §6 are applied — consumer-owned `Date` values, instant apply, full markup control, a scaled-down a11y bar — no package satisfies all of them (§7), and the library's remaining contribution narrows to two of nine pieces (§8).

---

## 2. What Radix actually offers (verified)

- **`radix-ui` React primitives ship no Calendar, DateField, DatePicker, or Time component.** [Discussion #969](https://github.com/radix-ui/primitives/discussions/969) is the standing request — closed as duplicate of #1503, 71+ reactions, last activity Jan 2025 was a user listing alternatives, not a maintainer update.
- **Radix Vue / Reka UI *does* have `Calendar`, `RangeCalendar`, `DateField`, `DatePicker`** built on `@internationalized/date`. Vue only. Useful as an *API design reference* — its anatomy is a clean model — but there is no React port.
- **Base UI (MUI, 39 components, v1.7.0) has no calendar either.** [mui/base-ui#1709](https://github.com/mui/base-ui/issues/1709) "Calendar and Date Fields primitives" is open since 2025-04-12, assigned, 0/10 subtasks complete, no timeline. Do not wait on it.

**What Radix *does* give you here — and one trap:**

The panel needs a floating surface. This repo has `@radix-ui/react-dropdown-menu` and `@radix-ui/react-dialog` in `dependencies`, but **not `@radix-ui/react-popover`**.

> ⚠️ **Do not put a calendar grid inside `DropdownMenu.Content`.** Radix's DropdownMenu implements the WAI-ARIA *menu* pattern: `role="menu"`/`role="menuitem"`, roving focus between items, arrow-key navigation, and typeahead — all bound at the Content level. A calendar is a `role="grid"` with its own two-dimensional arrow-key model. The two keyboard models fight, and the semantics are simply wrong for a date grid.
>
> The right shell is **Popover** (`Root / Trigger / Anchor / Portal / Content / Arrow / Close`; `Content` takes `side`, `align`, `sideOffset`, `collisionPadding`, `avoidCollisions`, `onOpenAutoFocus`). Adding `@radix-ui/react-popover` is a new runtime dependency — that is a Rule 2 decision, follow `dooph-ds-contribution` for it.
>
> The user's intent ("reuse the existing dropdown family") is still satisfiable: reuse `DropdownTrigger`'s **visual shell and sizing**, and swap the *content* mechanism to Popover. **See §6.4 — this was raised with the user and confirmed**, including why a DropdownMenu *variant* can't solve it.

---

## 3. The candidates, with facts

All figures below are from the npm registry and Bundlephobia on 2026-08-27.

### `@daypicker/react` v10.0.1 — *(formerly `react-day-picker`)*

The single most important stale-knowledge correction in this brief:

- **The package was renamed.** `@daypicker/react` is the current name. `react-day-picker` still publishes at the same version (10.0.1) and re-exports the same API for compatibility, but new work should use `@daypicker/react`.
- **v10 removed all the deprecated v9 aliases**: `fromMonth`/`toMonth`/`fromDate`/`toDate` → `startMonth`/`endMonth`; `initialFocus` and the `onDay*` handlers are gone (use custom components); `components.Button` → `PreviousMonthButton`/`NextMonthButton`; classNames keys `table`→`month_grid`, `nav_button`→`button_previous`/`button_next`, `day_selected`→`selected`, `day_disabled`→`disabled`.
- **Non-Gregorian calendars moved to add-on packages**: `@daypicker/persian|buddhist|ethiopic|hebrew|hijri`.
- License MIT. Peer `react >=16.8` (React 19 fine). Deps: `date-fns ^4.1.0` + `@date-fns/tz ^1.4.1`. **~19.3 KB gzipped self**, but `date-fns` is ~824 KB unpacked (tree-shakes, still a dependency this package currently doesn't have).

**Why it's the strong library pick:** the customization surface is unusually deep. `components` accepts a partial map of ~25 internal elements — `Root, Months, Month, Nav, PreviousMonthButton, NextMonthButton, Chevron, MonthCaption, CaptionLabel, DropdownNav, MonthsDropdown, YearsDropdown, Dropdown, Select, Option, MonthGrid, Weekdays, Weekday, WeekNumberHeader, Weeks, Week, WeekNumber, Day, DayButton, Footer`. Plus `classNames` (every UI key), `styles`, `formatters`, `labels`, and `useDayPicker()` for context inside your own components.

Rendered structure (this is the DOM you'd be theming):

```
Root → Months → Nav(PreviousMonthButton→Chevron, NextMonthButton→Chevron)
              → Month → MonthCaption(CaptionLabel | DropdownNav→Months/YearsDropdown)
                      → MonthGrid → Weekdays(WeekNumberHeader, Weekday)
                                  → Weeks → Week(WeekNumber, Day → DayButton)
       → Footer
```

Selection API: `mode="single" | "multiple" | "range"`, `selected`/`onSelect` (controlled), `required`. Range mode adds `min`/`max` (nights), `resetOnSelect`, `excludeDisabled`. `disabled` takes a `Matcher`: `boolean | Date | Date[] | DateRange | {before} | {after} | {from,to} | {dayOfWeek:[0,6]} | (date)=>boolean | Matcher[]`. Caption: `captionLayout="label"|"dropdown"|"dropdown-months"|"dropdown-years"`, `navLayout="around"|"after"`, `startMonth`/`endMonth`, `reverseYears`, `hideNavigation`, `disableNavigation`. Timezone: `timeZone` (IANA or `UTC±N`) plus an exported `TZDate`.

**Friction for this repo:**
- Its default look lives in `@daypicker/react/style.css`, driven by `--rdp-*` variables under `.rdp-root`. Importing that stylesheet would put a second, non-`--ui-*` token system into the package's CSS — directly against Rule 4/5. The supported escape is to import nothing and drive everything through `classNames` + `getDefaultClassNames()`, which is exactly what shadcn does. Workable, but you are then maintaining a ~30-key className map.
- It renders a `<table>` month grid. Your Figma grid is flex rows of 28px cells with 32px pitch; you'd be re-laying-out table elements or swapping `MonthGrid`/`Week`/`Day` wholesale — at which point you've replaced most of what you're paying for.
- Accessibility is real: WAI-ARIA APG-aligned, arrows / PageUp / PageDown (Shift for years) / Home / End / Enter / Space, `autoFocus`, `labels`, and a `footer` live region. Note their own guidance: set `role="application"` plus an accessible name including the month when the calendar lives in a dialog, or NVDA keeps arrow keys in browse mode.

### Ark UI `@ark-ui/react` v5.39.0 / `@zag-js/date-picker` v1.43.3

- MIT. Unstyled by default; styling hooks are `data-part` / `data-state` attributes; supports `asChild`. Built on `@internationalized/date`.
- Parts: `Root, Label, Control(Input, Trigger, ClearTrigger), Positioner, Content, View, ViewControl, Table(head/body/row/cell)`. Props: `selectionMode="single"|"multiple"|"range"`, `view="day"|"month"|"year"`, `min`/`max`, `numOfMonths`, `fixedWeeks`, `locale`.
- **You write every tag yourself** from `api.getDayTableCellProps()` etc., with `api.weeks` / `api.weekDays` handing you the grid. That is the best structural fit of any library here — no markup to fight.
- Cost: `@ark-ui/react` pulls 60+ `@zag-js/*` packages (tree-shakable, but a large lockfile). Going direct with `@zag-js/date-picker` + `@zag-js/react` is ~31.4 KB gzipped with 9 direct deps (incl. floating-ui). Peer React >=18.
- Ark's built-in `view` machine (day→month→year drilldown) is more than the Figma design asks for.

### React Aria — `react-aria-components` v1.20.0 / `@react-aria/*` hooks

- **Apache-2.0**, not MIT. Open source and permissive, but note the license differs from everything else in this repo.
- Anatomy: `DatePicker > Label, Group > (DateInput > DateSegment), Button, Popover > Dialog > Calendar > (Heading, CalendarGrid > CalendarCell)`. Also `DateRangePicker`, `RangeCalendar`, standalone `DateField`.
- Props: `value`/`defaultValue`, `minValue`/`maxValue`, `isDateUnavailable`, `granularity`, `isRequired`, `validate`/`validationBehavior`, `hideTimeZone`. Styling via className render-props (`DatePickerRenderProps`) or data attributes.
- Values are `@internationalized/date` objects (`CalendarDate`, `ZonedDateTime`), **not `Date`**. That type choice propagates into your public API and into every consuming app.
- Unique strengths nothing else matches: segmented typed entry (`DateSegment`) that is correct across locales, and real support for Buddhist/Hebrew/Islamic/Persian calendar systems.
- Only pick this if segmented text entry or non-Gregorian calendars are actual requirements. They are not in the Figma spec.

### `@internationalized/date` v3.12.3 (standalone)

- Apache-2.0, **11.1 KB gzipped, 1 dependency.** Immutable `CalendarDate`/`CalendarDateTime`/`ZonedDateTime`, `parseDate`, `today(getLocalTimeZone())`, `getWeeksInMonth`, calendar-system support.
- Worth knowing about independently: if you home-roll and later want bulletproof timezone/i18n date math without a full component library, this is the smallest credible upgrade path. It is what React Aria, Ark UI, and Reka UI all sit on.

### Micro headless libraries — checked, not recommended

| Package | Latest | Last publish | Note |
|---|---|---|---|
| `@rehookify/datepicker` | 6.6.8 | 2024-12-06 | MIT, zero deps, hook-based (`useDatePicker`), single/range/time. Cleanest of the micro options but ~20 months without a release. |
| `headless-react-datepicker` | 2.0.2 | 2026-08-24 | Actively published, BEM-style class hooks, multi-calendar. Very small user base. |
| `headless-datetimepicker` | 4.0.0 | 2025-01-13 | Fork/rename of `aliakbarazizi/headless-datepicker`. |
| `datepicker-interface`, `@zuruuh/react-date-picker`, `@wearepointers/react-datepicker` | — | — | Single-maintainer, low adoption. |

These are all technically "unstyled and composable" and would satisfy the styling constraint. The problem is that a design system published to npm inherits its dependencies' bus factor. If you're accepting a single-maintainer dependency for ~40 lines of date math, home-rolling is strictly better.

### Disqualified on the styling constraint

`@mui/x-date-pickers` (MIT core, but Emotion-styled and theme-coupled), `@mantine/dates` (ships its own CSS), `react-datepicker` (own stylesheet, jQuery-era API), `rsuite`, `antd`. All are "customizable" only in the sense of overriding someone else's cascade. Against a strict token system that is a permanent tax.

---

## 4. Fit against this repo's rules

Whatever you choose has to survive `dooph-ds-architecture`. The pressure points:

- **Rule 1 (dot-accessible enums).** Any library's string unions (`mode`, `captionLayout`, `selectionMode`) must be re-exported as dooph consts — e.g. a `DatePickerMode` const object with a derived type of the same name — never leaked as raw string literals into consuming code.
- **Rule 2 (thin Radix wrappers).** Applies to the Popover shell if you add one: `forwardRef`, spread all props, merge `className`, style against `data-[state=open]`, expose a `portal` escape hatch, never `stopPropagation` on Radix handlers.
- **Rule 4/5 (tokens own theming).** The package ships no external CSS and reads no theme state at runtime. A library stylesheet with `--rdp-*` variables on `.rdp-root` is a parallel token system — either don't import it, or map every variable to `--ui-*`. `@layer components` for role defaults so consumers can override; `@layer utilities` for helpers. Selected/range/today colors must resolve to `--ui-*` tokens, with `.dark` overrides only where the value actually changes.
- **Rule 3 (composability).** Presets rail, calendar, and footer should be separate composable parts, not a monolith with a `presets={[]}` prop — the repo's Menu/Modal families set that precedent.
- **Dependency posture.** Current runtime deps are 10 Radix packages plus `cva`/`clsx`/`tailwind-merge`. There is no date library. Adding `date-fns` or 60 `@zag-js/*` packages is a visible change in the package's weight, and consumers feel it.

---

## 5. Home-rolling: the grid is not scary

This section exists because the grid layout and "days move every year" is the stated fear. It is the least mysterious part of the whole component. **Everything in this section was executed on this machine on 2026-08-27 and the outputs are real, not recalled.**

### The entire month-grid algorithm

Three facts do all the work:

```js
// 1. How many days in this month? Day 0 of next month = last day of this month.
//    Handles leap years for free — the engine owns the rule, you never write it.
const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();

// 2. Which column does the 1st land in? getDay() is 0=Sun..6=Sat.
//    The modulo shifts it for a Monday-start (or any start) week.
const firstWeekday = (y, m, weekStartsOn = 0) =>
  (new Date(y, m, 1).getDay() - weekStartsOn + 7) % 7;

// 3. Build a flat cell array; JS Date auto-normalizes out-of-range day numbers,
//    so day 0 and day -1 walk backwards into the previous month by themselves.
function monthGrid(y, m, { weekStartsOn = 0, fixedWeeks = false } = {}) {
  const lead = firstWeekday(y, m, weekStartsOn);
  const total = daysInMonth(y, m);
  const cells = [];
  for (let i = 0; i < lead; i++) cells.push(new Date(y, m, i - lead + 1)); // outside, before
  for (let d = 1; d <= total; d++) cells.push(new Date(y, m, d));          // in-month
  const target = fixedWeeks ? 42 : Math.ceil(cells.length / 7) * 7;
  let n = 1;
  while (cells.length < target) cells.push(new Date(y, m + 1, n++));       // outside, after
  return cells; // always a multiple of 7 → chunk by 7 for rows
}
```

That is the whole thing. "Days are different every week and year" is handled entirely by `getDay()` and `daysInMonth` — you never encode a calendar rule yourself.

### Verified output

```
May 2026        | rows: 6 | lead: 5 | days: 31     Feb 2024 (leap) | rows: 5 | lead: 4 | days: 29
  26 27 28 29 30  1  2                               28 29 30 31  1  2  3
   3  4  5  6  7  8  9                                4  5  6  7  8  9 10
  10 11 12 13 14 15 16                               11 12 13 14 15 16 17
  17 18 19 20 21 22 23                               18 19 20 21 22 23 24
  24 25 26 27 28 29 30                               25 26 27 28 29  1  2
  31  1  2  3  4  5  6

Feb 2026 | rows: 4 | lead: 0 | days: 28   <- shortest possible month grid
Feb 2100 | rows: 5 | lead: 1 | days: 28   <- 2100 is NOT a leap year; handled correctly
```

**Row count is 4, 5, or 6. Never 7.** Worst case is a 31-day month starting on the last column: 6 + 31 = 37 cells → 42. Best case is a non-leap February starting on the first column: exactly 28. This is why `fixedWeeks` exists — see §6.

### The four traps (all reproduced, not theorized)

```js
new Date("2026-05-15")   // -> Thu May 14 2026   ISO date-only strings parse as UTC midnight,
new Date(2026, 4, 15)    // -> Fri May 15 2026   then render in local time. Off-by-one in the Americas.

new Date(t + 86400000)   // -> Mar 09 2026 01:00 "add 24h" is wrong across a DST boundary.
new Date(2026, 2, 9)     // -> Mar 09 2026 00:00 Always construct, never add milliseconds.

new Date(2026, 1, 31)    // -> Tue Mar 03 2026   Month overflow rolls forward silently. A feature
                         //                      for the grid's outside cells, a bug anywhere you
                         //                      meant "clamp to end of month".
```

Fourth trap, by construction: **never compare dates with `===` or `.getTime()` for "same day"** — two `Date`s for the same calendar day differ if either carries a time. Compare `getFullYear()/getMonth()/getDate()`, or normalize to a `YYYY-MM-DD` key string and compare that. The key-string approach also makes `selected`/`range` lookups O(1) via a `Set`.

Corollary: if the public API takes and returns `Date`, document that it means *local calendar day at midnight*, and normalize on the way in. If timezone-correctness across servers is a real requirement, that is the moment to reach for `@internationalized/date` (11 KB) rather than hand-rolling TZ math.

### What you'd actually own (this is the real cost, not the math)

1. **Keyboard model** — WAI-ARIA APG grid pattern: roving `tabIndex` (exactly one day is tabbable), ←→ ±1 day, ↑↓ ±7 days, Home/End week bounds, PageUp/PageDown ±1 month, Shift+PageUp/Down ±1 year, Enter/Space selects. Arrowing past a month edge must navigate the month *and* move focus to the right cell after render.
2. **ARIA semantics** — `role="grid"` / `rowgroup` / `row` / `gridcell`, `aria-selected`, `aria-disabled`, `aria-label` per day (a full readable date, not "15"), an `aria-live` region announcing the selection, and a labelled month caption.
3. **Locale weekday/month names** — `Intl.DateTimeFormat(locale, { weekday: 'narrow' })` over any known week; no lookup tables, no `date-fns`.
4. **Range interaction** — hover-preview of the in-progress range, start/end/middle modifiers, and the click-order rules (click before start → restart vs. extend).

Items 1 and 2 are where the library options genuinely earn their keep. Items 3 and 4 are ordinary component work. **Budget the home-roll decision on the keyboard/ARIA work, not on the date math.**

### Temporal, since it will come up

`Temporal` reached TC39 Stage 4 in March 2026 and is in ES2026. Chrome 144 (Jan 2026), Firefox 139+, Edge 144+ ship it natively; **Safari is still partial (Technology Preview behind a flag), so Baseline is blocked as of Jan 2026.** Do not depend on it in a published package yet. `@js-temporal/polyfill` exists but is not worth adding here — the `Date` arithmetic above is sufficient for a Gregorian month grid.

---

## 6. The decided shape (revision 2, 2026-08-27)

The design and behaviour firmed up after the first research pass. These are now **constraints, not options**, and they change the library calculus in §1–§3. Read this section before §7.

### 6.1 Behaviour: instant apply, no Apply button

The Apply button is gone from the Figma. Clicking a day commits immediately — the consumer's `onChange` fires, their data refetches, no draft, no outside-click-to-commit.

This is a simplifying decision and it is the right one. **One wrinkle survives it, and it is the single most important behavioural note in this document:**

> In **range** mode, the first click produces an *incomplete* range. If `onChange` fires then, the consuming app refetches with a half-defined range — a wasted request at best, a visibly broken dashboard at worst.
>
> The standard resolution: hold the pending start internally and fire `onChange` **only when the range completes** (second click). That is one piece of transient state — a `pendingStart`, not a draft *value* — and it is unavoidable. It does not violate "consumers own state": the committed value still lives entirely in the consumer, and the component never holds a value the consumer doesn't have.
>
> While a start is pending, the grid renders a hover-preview range. That's presentation, not state ownership.

Single mode has no such wrinkle: one click, one commit.

### 6.2 State contract: fully controlled, minimal structural types

The principle is right — this is a design system, not a UI library, so the consumer owns state. The practical shape:

```ts
// Props in, callbacks out. No value is ever held internally.
selected        // consumer-owned; the component reads it, never sets it
onSelect        // fires with the new value; consumer decides what to do
month           // optional controlled view month...
onMonthChange   // ...with an uncontrolled default (useState fallback) so the
                // common case doesn't force the consumer to wire navigation
```

**Where "leave the types entirely to consumers" needs a small correction.** A component can be agnostic about *storage*, but not about *structure* — the grid must be able to answer "is this day the start / inside / the end?" to render at all. If the range shape is fully consumer-defined, that question is unanswerable and the component can't do its one job.

The resolution is a **minimal structural contract, not a nominal type**:

```ts
type DateRange = { from: Date; to: Date | null };   // that is the whole contract
```

Structural typing means any consumer object with those two fields satisfies it — no import required, no branded type, no wrapper class. It is the smallest possible agreement that still lets the grid render, and it's the same shape DayPicker, Ark, and Reka all converged on independently.

`Date` is the right value type here (over `@internationalized/date`, ISO strings, or Temporal): zero dependencies, universally convertible, and every consuming project already has one. Document explicitly that a value means **local calendar day at midnight**, normalize on the way in, and compare by `y/m/d` or a `YYYY-MM-DD` key — never `.getTime()` (see §5 traps).

Anything richer than the structural minimum — a day's badge, a tooltip, an entry count — should reach the grid through a **render-level escape hatch**, not through the value type: either a `modifiers` map keyed by `YYYY-MM-DD`, or a `renderDay` / `DayButton` slot. That keeps `CalendarDayType` genuinely consumer-owned without the component needing to know about it.

Validation: prefer a dev-time `console.warn` on a malformed range (`to` before `from`, non-`Date` values) over throwing. A design system that crashes a consumer's dashboard over a prop shape is worse than one that complains.

### 6.3 Presets as data, composed as children

The intent — `<Calendar.PresetsPanel>` in children rather than a `presets` boolean, with dot-accessible built-ins — fits Rule 1 and Rule 3 cleanly. A preset is fundamentally **data with a function**:

```ts
// The whole interface. Consumer-authored presets satisfy it structurally.
type CalendarPreset = {
  id: string;
  label: string;
  getRange: (now: Date) => DateRange;
};
```

The built-ins are then just instances of that, exported dot-accessibly per Rule 1 — `CalendarPresets.today`, `CalendarPresets.weeks.two`, `CalendarPresets.months.six`. The "truly custom" escape hatch is a factory rather than a component:

```ts
CalendarPresets.custom({ label: "Last 3 hours", minutes: 180 })
```

**On `<CalendarPresets.Custom timeInMinutes={180} />` as a component:** it reads nicely but it's data wearing a component costume, and it creates a real problem — the split-button trigger variant needs the *same* presets, and you can't pass JSX children into a button's segmented control without the trigger having to introspect element types. A plain object works identically in both places:

```
<Calendar.PresetsPanel>            <DatePickerTrigger.Presets
  <Calendar.PresetItem                items={[CalendarPresets.weeks.one,
    preset={CalendarPresets.today} />           CalendarPresets.days.thirty,
  ...                                           CalendarPresets.months.three]} />
</Calendar.PresetsPanel>
```

You keep the composable children API where it earns its keep (the panel), and the same objects flow into the trigger. If the JSX form matters aesthetically, a `<Calendar.PresetItem preset={...} />` child that renders a Menu item is the middle ground — the *item* is a component, the *preset* stays data.

Semantics: presets are **actions**, not checkable options — clicking one sets the range. Reusing `MenuContent` / `MenuItem` (the `Action Menu Item` family) is correct. The calendar range remains the single source of truth; the highlighted preset is derived by comparing the current range against each preset's `getRange(now)`, not stored separately.

### 6.4 Popover: you do not already have one

Verified against the source, not assumed:

| Component | Primitive |
|---|---|
| `Modal`, `Sheet` | `@radix-ui/react-dialog` |
| `Tooltip` | `@radix-ui/react-tooltip` |
| `DropdownMenu`, `TypeableDropdownTrigger` | `@radix-ui/react-dropdown-menu` |

Imported Radix packages across `src/`: `checkbox, dialog, dropdown-menu, progress, slider, slot, tabs, toast, toggle-group, tooltip`. **No `popover`.** Modals are Dialog, which is modal + focus-trapped + overlay — wrong shell for a date panel anchored to a trigger.

**On "can't we just add a dropdown menu variant?"** — the obstacle isn't styling, so a variant can't clear it. `DropdownMenu.Content` implements the WAI-ARIA *menu* pattern at the Content level: it owns arrow-key roving focus and typeahead for its descendants. Drop a 42-button grid inside and arrow keys and letter keys are already spoken for by the menu before your grid ever sees them. Neutralizing that means intercepting Radix's own handlers — exactly what Rule 2 forbids.

Adding `@radix-ui/react-popover` is genuinely easy and idiomatic here: near-identical anatomy to DropdownMenu (`Root / Trigger / Anchor / Portal / Content / Arrow / Close`), same `data-[state=open]` styling hooks, same `side`/`align`/`sideOffset`/`collisionPadding` positioning props. The existing `DropdownMenuContent` wrapper — `portal` escape hatch, `matchTriggerWidth`, forwardRef, `cn` merge — ports over nearly verbatim.

Nuance worth keeping: the **presets rail** genuinely *is* a menu (action items). Nesting a real `MenuItem` list inside a Popover panel is fine and common — you get menu semantics for the rail and grid semantics for the grid, which is what each half actually is.

### 6.5 Grid layout

The Figma spacing is acknowledged as eyeballed. What the implementation should key off instead:

- **CSS Grid, seven equal columns**, `grid-template-columns: repeat(7, minmax(0, 1fr))`, cell sized from a token (e.g. `--ds-calendar-cell`) with `aspect-ratio: 1`. Column width then flexes to whatever the widest header needs — which satisfies "a 3-letter `LabelText` (Sun, Mon, Tue) must fit" without hardcoding 32px pitch.
- **Six fixed rows (`fixedWeeks`).** The standard the user asked to defer to: 4–6 rows is what the math produces (§5), but with instant-apply in a popover, a panel that changes height when you page months is jarring and can reposition itself mid-interaction. Always rendering 42 cells costs one row of outside days and buys a stable panel. The current Figma frame shows 5 rows — that number was eyeballed and should be re-derived from six rows × cell size + caption + header.
- **Day states** (from node `499:1603`): default, muted/outside, selected (filled dark, rounded), in-range (filled subtle), plus hover/focus. All must resolve to `--ui-*` tokens with `.dark` overrides only where the value actually changes (Rule 5).
- **Caption is now two dropdowns** — `May ⌄` and `2026 ⌄` — plus prev/next chevrons. Reuse the existing DropdownMenu family for both. Bound the year list with an explicit range; an unbounded year dropdown is a 200-item menu.

### 6.6 Trigger (node `499:1095`)

Three variants × four states (default, hover, focus ring, disabled):

- **Single** — calendar icon, `May 14`, chevron.
- **Range** — `May 14 - June 14`.
- **Split** — the range trigger with an attached segmented preset group (`7 Days | 30 Days | 3 Months`, one active), and its own disabled variant. This is where the shared `CalendarPreset` objects from §6.3 pay off.

> The labels show **no year** (`May 14 - June 14`). That's a display rule that needs deciding: omit the year always, or omit only when the range is within the current year and show it otherwise (`Dec 28, 2025 - Jan 4, 2026`)? The latter is standard and avoids a genuinely ambiguous label. This supersedes the earlier `MM DD, YYYY` note — `Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric' })` gives the Figma label with no formatting library.

### 6.7 Accessibility, scaled to this project

Stated bar: solo dev, personal projects, "reasonable" not enterprise. That is a legitimate scope decision, and it meaningfully shrinks the home-roll cost. A pragmatic tier:

**Worth doing (cheap, high value):**
- Roving `tabIndex` — exactly one day cell is tabbable, so Tab doesn't walk 42 buttons.
- ←→ ±1 day, ↑↓ ±7 days, Enter/Space to select, Escape closes the popover (Radix gives you Escape free).
- `aria-label` per day with a full readable date, `aria-selected` on selected cells, `aria-disabled` on disabled ones.
- Semantic `<table role="grid">` or a div grid with `role="grid"/"row"/"gridcell"`.

**Skippable at this scale:**
- PageUp/PageDown month paging, Shift+Page year paging, Home/End week bounds.
- `aria-live` selection announcements.
- The `role="application"` NVDA workaround.

The first list is roughly an afternoon. It's also the *entire* reason to prefer a library — so scoping it down this way is what makes home-rolling clearly viable.

---

## 7. Do any packages fit these constraints?

Re-scored against §6 rather than against the generic case:

| Package | Instant apply | Consumer-owned `Date` | Full markup control | No external CSS | Dep cost | Verdict |
|---|---|---|---|---|---|---|
| `@daypicker/react` v10 | ✅ controlled `selected`/`onSelect`, `month`/`onMonthChange` | ✅ native `Date` | ⚠️ `<table>` structure; swappable but you'd swap most of it | ⚠️ skip `style.css`, hand-maintain ~30 classNames keys | `date-fns` + `@date-fns/tz` | **Closest fit.** But once you swap `MonthGrid`/`Week`/`Day`/`Dropdown`/`Nav` to hit the Figma, what remains is the keyboard model and the grid math. |
| Ark UI / `@zag-js/date-picker` | ✅ | ❌ forces `@internationalized/date` values | ✅ best in class — you write every tag | ✅ | 9–60 packages | Value type conflicts head-on with §6.2. |
| React Aria | ✅ | ❌ same conflict, plus Apache-2.0 | ✅ | ✅ | large | Its strengths (segments, non-Gregorian) are all explicitly out of scope. |
| `@rehookify/datepicker` | ✅ | ✅ native `Date` | ✅ hook-only, you render everything | ✅ | zero deps | **On paper the perfect match.** No release since 2024-12; single maintainer. |
| Home-roll | ✅ | ✅ by definition | ✅ | ✅ | zero | — |

**Answer: no package cleanly satisfies all of §6, and the one that does on paper (`@rehookify`) is stale.** DayPicker is a near-miss whose remaining value, after the customization required to hit the design, narrows to "grid math + keyboard" — which §5 and §6.7 have now scoped at roughly a day of work.

Presets, the popover shell, the trigger, the caption dropdowns, and the styling are work you do yourself under *every* option, including the library ones. That's the decisive fact: the library only ever owned one of the seven pieces.

---

## 8. Is home-rolling realistic? Yes — with the scope now on the table

Honest inventory of what you'd write, in dependency order:

| Piece | Difficulty | Notes |
|---|---|---|
| Month grid math | **Trivial** | ~20 lines, verified in §5. Leap years and week alignment are handled by the engine, not by you. |
| Weekday / month names | **Trivial** | `Intl.DateTimeFormat` — no lookup tables, no library. |
| Day-state derivation (selected / in-range / today / outside / disabled) | **Easy** | Pure function over a `YYYY-MM-DD` key. |
| Grid rendering + tokens | **Easy** | CSS Grid, `--ui-*` tokens, `data-*` state attributes. Ordinary DS work. |
| Caption dropdowns + nav | **Easy** | Reuses the existing DropdownMenu family. |
| Popover shell | **Easy** | One new Radix dep; the existing DropdownMenu wrapper ports over. |
| Presets rail + trigger presets | **Easy** | Reuses Menu items; presets are plain objects. |
| Range interaction (pending start, hover preview, commit on completion) | **Moderate** | The only genuinely fiddly logic. §6.1. |
| Roving tabIndex + arrow keys | **Moderate** | The real cost. Scoped down in §6.7 to ←→↑↓ / Enter / Space. |
| Full APG keyboard + live regions | *Out of scope* | Explicitly descoped. |

Nothing on that list is research-grade. The two "moderate" rows are the whole risk, and both are well-trodden.

**Recommendation: home-roll.** Rationale, in order of weight:

1. Every constraint in §6 — consumer-owned `Date`, no external CSS, full markup control, minimal deps — is satisfied by construction rather than by fighting a library's defaults.
2. Six of the seven pieces are yours under any option; the library only ever supplied the grid and the keyboard.
3. Zero runtime dependency added beyond `@radix-ui/react-popover`, which the repo wants anyway and which follows patterns already established in `DropdownMenu.tsx`.
4. The a11y bar was consciously scaled (§6.7), which is precisely what would otherwise justify buying a library.

**When to reverse this:** if segmented typed entry, non-Gregorian calendars, or real timezone-correct scheduling ever enter scope, stop and adopt React Aria rather than growing the hand-rolled one into them. Those three things are where hand-rolling genuinely goes wrong, and none are in scope today.

---

## 9. Resolved decisions (revision 3)

These answer the open questions from revision 2. They are decided unless noted.

### 9.1 Trigger year display — conditional

Show the year when the range is **not entirely within the current year**. Two triggering conditions, both required to be handled:

- any endpoint falls in a year other than `today`'s year → show years
- the range spans a year boundary → show years (implied by the above, but state it explicitly since it's the case that produces genuinely ambiguous labels)

```
May 14 - June 14                    // both in the current year
Dec 28, 2025 - Jan 4, 2026          // spans a boundary
Mar 3, 2024 - Mar 9, 2024           // wholly in a past year
```

Build with `Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric' })` and conditionally add `year: 'numeric'`. One formatter decision, applied to both endpoints together — never show the year on one endpoint and not the other.

### 9.2 Year dropdown bounds — derive, don't hardcode

Recommended rule, in priority order:

1. **If `disabled` implies a min or max date** (an `{ after: … }` / `{ before: … }` matcher — see §9.4), derive the bounds from it. A year the consumer has disabled entirely should not be listed.
2. **Otherwise default to `[currentYear − 10, currentYear + 1]`.** Past-weighted, because this is a dashboard/analytics component — people look backward far more than forward. That's 12 entries: scannable in one menu, no scrolling, no search.
3. **Always expand the window to include the currently selected value and the currently viewed month**, whatever the bounds say. If a consumer passes a value in 1998, the dropdown must still be able to display 1998 or the caption lies.
4. Expose an override prop for the rare case (`yearRange={{ from, to }}` or equivalent).

The failure mode to avoid is DayPicker's default of "the last 100 years" — a 100-item menu that's slow to render and miserable to scan.

### 9.3 Range interaction — nearest-edge, with a restart gesture

> **Superseded by §10.3 — the final model is restart-on-click.** Nearest-edge cannot relocate a range to a distant window, and the gesture that would fix it isn't discoverable. §10.3 has the worked failure and the decision. This section is kept only for the reasoning it contains (why compare-to-end breaks on interior clicks, how the models trade off); its ruleset is not what gets built.

**Decided model — this modifies what was proposed.** The proposal was "clicked day becomes the new start or end depending on whether it falls before or after the current *end* date." That rule breaks on interior clicks: with May 10–20 selected, clicking May 18 is "before the end," so it would move the *start* to May 18 — producing May 18–20 when the user was plainly nudging the end inward. Comparing against one endpoint can't disambiguate the interior of the range.

The fix is small and it is what well-built dashboard pickers actually do:

> **Move whichever endpoint is nearer to the clicked day.**

That satisfies the stated goal exactly — adjust one edge without re-picking the other — and it resolves the interior case correctly in both directions. Full ruleset:

| State | Click | Result |
|---|---|---|
| No range / cleared | any day | Sets `pendingStart`. **No `onChange`.** |
| Pending start exists | any day | Completes the range, normalized so `from <= to`. **`onChange` fires.** |
| Complete range | day nearer to `from` | `from` moves there. `onChange` fires. |
| Complete range | day nearer to `to` | `to` moves there. `onChange` fires. |
| Complete range | exact midpoint (tie) | Move `from`. Deterministic tiebreak; just pick one and keep it. |
| Complete range | click exactly on `from` or `to` | **Clears to a pending selection anchored at that day.** This is the restart gesture. No `onChange` until the new range completes. |
| Any | preset click | Replaces the range wholesale. `onChange` fires. |

Always normalize so `from <= to` rather than rejecting a backwards selection.

**Where this differs from Airbnb, and why that's fine.** Airbnb (and Google Flights, and most booking UIs) use pure **restart-on-click**: once a range is complete, the next click always starts a new one. It's more predictable — every selection is exactly two clicks, one rule, nothing to learn — and it's the right call for booking, where users usually pick a fresh trip rather than nudge an existing one.

The cost of nearest-edge is real and worth naming: **selecting a distant new range takes more clicks.** With May 10–20 selected and Jun 1–5 wanted, every click keeps moving the nearer edge, and you drag the range across rather than replacing it. That's precisely why booking UIs restart.

The restart gesture in row 6 is what buys the escape hatch back: clicking an endpoint you can already see highlighted collapses to a fresh pending selection. It's discoverable (the endpoints are the most visually obvious cells in the grid), it needs no modifier key, and it also defines the click-on-endpoint case that would otherwise need an arbitrary rule. The preset rail is the other escape hatch — most "jump somewhere else entirely" intents are a preset click anyway.

So: nothing in the proposal violates a principle of the well-executed pattern. It picks a different point on a real trade-off — optimizing for *resizing a window* over *picking a fresh one* — which is the right optimization for this component's actual job. It just needs nearest-edge instead of compare-to-end, plus a way back out.

**Hover preview:** while a range is complete, hovering a day should preview the *result* of the adjustment — the moved edge in its new position. While a start is pending, preview the prospective range. Cheap to implement, and it's what makes nearest-edge legible without instruction.

**Reconciling with §6.1:** the "don't fire `onChange` on an incomplete range" rule applies only to the empty/pending path. Once a range is complete, every click keeps it complete, so every click commits. That's consistent — `onChange` never fires with a half-defined range.

### 9.4 Disabled days — a matcher, not an array

An array of ranges is close, but a small union covers strictly more with the same effort (~15 lines to evaluate):

```ts
type DateMatcher =
  | Date                          // a single day
  | { from: Date; to: Date }      // an inclusive range
  | { before: Date }              // everything strictly earlier  → min bound
  | { after: Date }               // everything strictly later    → max bound  ("no future dates")
  | ((date: Date) => boolean);    // anything else (weekends, holidays, sparse data)

disabled?: DateMatcher | DateMatcher[];   // array = union of all matchers
```

`{ after: today }` gives "no future dates" without a special prop, and the predicate form means you never have to extend the union later. This is DayPicker's `Matcher` minus the parts that aren't needed (`boolean`, `dayOfWeek` — the predicate covers the latter), so it's a proven shape rather than an invented one.

Three implementation notes:

- **Enforce in both places.** A disabled day must be unclickable *and* skipped by arrow-key navigation. Enforcing only on click is the common bug.
- **Ranges may span disabled days by default.** In analytics, a blackout day inside a 30-day window is normal and shouldn't block the selection. If a stricter policy is ever needed, that's an opt-in flag, not the default.
- **Feed the year bounds from it** (§9.2) and disable month/year dropdown entries that contain no selectable day.

### 9.5 Render-day slot — content slot, not button swap

Confirmed. The important design constraint: **slot the day's *content*, not the button.** The component keeps the `<button>`, its click handler, `tabIndex`, and ARIA; the consumer supplies what renders inside it, with all computed state handed in so nothing has to be recomputed:

```ts
renderDay?: (day: {
  date: Date;
  isSelected: boolean;
  isRangeStart: boolean;
  isRangeMiddle: boolean;
  isRangeEnd: boolean;
  isToday: boolean;
  isOutside: boolean;      // belongs to the previous/next month
  isDisabled: boolean;
  isFocused: boolean;      // holds the roving tabIndex
}) => ReactNode;
```

Swapping the whole button (DayPicker's `components.DayButton` approach) is more powerful and is how a consumer loses keyboard nav and ARIA in one line. The content slot covers the real use cases — a dot for "has data", a count, a badge — with no way to break the interaction model. If a full button swap is ever genuinely needed, add it then.

### 9.6 Continuous range highlight — the CSS that actually works

The segmented look in the Figma is a layout artifact, not a design choice, and it comes from putting the spacing in the wrong place. The fix is one inversion:

> **Spacing goes *inside* the cell as padding. The grid itself has `gap: 0`. The range background paints on the cell; the day button is an inset rounded square on top of it.**

With a grid gutter, adjacent cells can't touch, so the band is forced to break at every day. With `gap: 0` and interior padding, the backgrounds of neighbouring cells are flush and the band flows continuously — while the buttons still look 4px apart.

Layer model:

| Layer | Element | Role |
|---|---|---|
| 1 (back) | grid cell background | the continuous range band |
| 2 | day button | inset, rounded, hover/focus states |
| 3 (front) | endpoint fill / today ring | the dark selected square, drawn above the band |

Rounding rules for the band:

- `range_middle` — square on both sides, so it butts against its neighbours.
- `range_start` — rounded on the leading edge only; `range_end` — rounded on the trailing edge only.
- **First and last cell of every row** get rounded outer corners regardless of position in the range, so a multi-week band terminates cleanly at each week boundary instead of running to the panel edge.
- Mirror all of the above under RTL if that's ever in scope (it isn't today).

If visible gaps between day buttons are wanted *and* the band must stay continuous, bridge the gutter with a pseudo-element on the cell (`::before` with a negative horizontal inset) rather than reintroducing grid gap.

The selected endpoints keep their dark filled squares from node `499:1603`; they sit in layer 3, above the band, which is what makes "start and end are solid, the middle is a light continuous strip" read correctly.

---

## 10. Resolved decisions (revision 4) — supersedes §9.3

### 10.1 Mode is explicit — `DatePickerMode`

Decided. No inference from the value shape, no dual-purpose component:

```ts
export const DatePickerMode = {
  singleDay: "single-day",
  dateRange: "date-range",
} as const;
export type DatePickerMode = (typeof DatePickerMode)[keyof typeof DatePickerMode];
```

Per Rule 1: camelCase keys, derived type sharing the identifier, re-exported from `src/index.ts`. Kebab-case *values* so they drop straight into `data-mode="date-range"` for styling hooks. There is no `multiple` mode — it isn't in the design and shouldn't be invented.

`mode` is required, not defaulted. The two modes have different value types and different interaction models; making the consumer state which one they want costs one prop and removes an entire category of ambiguity.

### 10.2 A value is required — which removes the empty state entirely

Decided: **the component requires a value. There is no empty case.** The consumer defaults to today, or to their last stored value; a missing value is a dev-time error, not a rendered state.

This is a good decision and it simplifies the type from §6.2:

```ts
// mode="single-day"
selected: Date;

// mode="date-range" — `to` is no longer nullable
selected: { from: Date; to: Date };
```

The `to: Date | null` from §6.2 existed only to model "half-selected." With a required value, incompleteness is never a *public* state — it exists only transiently inside the component during a re-anchor (§10.3), and `onChange` never fires while it does. **§6.2's nullable `to` is superseded by this.**

Enforcement: `console.warn` in development on a missing or malformed value (`to` before `from`, non-`Date` values) and render nothing rather than crashing. A design system that hard-throws inside a consumer's dashboard is worse than one that complains loudly.

Downstream consequence: the "empty state" open question from §10 (what the trigger renders with no value) is dead. The trigger always has a range to format.

### 10.3 Range interaction — restart on click (FINAL)

**Decided: pure restart-on-click.** Nearest-edge and the endpoint re-anchor gesture are both dropped. This is the Airbnb / Google Flights model: one rule, nothing to discover, every selection is exactly two clicks.

Why the earlier models were abandoned is worth keeping, because it's the reasoning that makes this the right answer rather than a retreat:

- **Compare-to-end** (the first proposal) breaks on interior clicks — with May 10–20 selected, clicking May 18 is "before the end," so the start would jump to May 18 when the user was plainly nudging the end inward. One endpoint can't disambiguate the interior.
- **Nearest-edge** fixes that but cannot relocate a range. May 10–20 → wanting Jun 1–5: clicking Jun 1 moves `to`, clicking Jun 5 moves `to` again, and `from` never moves. The range stretches instead of relocating, and no further clicking fixes it. **No rule based purely on a single click's position can both extend outward in one click and relocate in two** — those intents are indistinguishable from position alone.
- **Nearest-edge + endpoint re-anchor** solves relocation but pays for it with a gesture nobody discovers unprompted, plus a second interaction mode to explain, style, and test.

Restart-on-click has none of those problems and costs only the one-click edge nudge — which the preset rail covers for the common cases anyway.

#### The complete ruleset

| State | Action | Result | `onChange` |
|---|---|---|---|
| Committed | click any day | Becomes the **pending anchor**. The committed range keeps rendering; the grid shows the anchor plus a hover preview. | does not fire |
| Pending | click any day | Completes the range, normalized so `from <= to`. Pending clears. | **fires** |
| Pending | click the anchor again | Zero-length range (`from === to`) — a valid single-day selection. | **fires** |
| Pending | Escape, or click outside | **Abandons the pending anchor. The committed range is untouched.** | does not fire |
| Pending | preset click | Replaces the range wholesale, pending clears. | **fires** |
| Any | popover closes | Pending always clears. Reopening starts clean — never resume a stale anchor. | does not fire |

Normalize rather than reject: a second click before the anchor swaps the two so `from <= to`. Clicking the same day twice is a legitimate one-day range, not an error — §6.1 already allows a zero-night range.

#### Abandon-on-dismiss

Confirmed: dismissing mid-selection (Escape or outside click) discards the pending anchor and falls back to the currently committed value. This is safe *because* §10.2 requires a value — there is always something to fall back to, so abandonment can never leave the component empty.

Note this is the one place where dismissal actually does something. In every other state, clicks have already committed, so closing the popover discards nothing.

#### Trigger label while pending

The trigger keeps showing the **committed** range while a selection is in progress. It should not render a half-state like `May 14 - …`.

Rationale: the committed range is what the consumer's data is currently filtered by, so it is the truthful label. The grid already communicates the in-progress selection through the anchor highlight and hover preview, which is the right place for provisional state. This also follows directly from "never emit or display an incomplete range."

#### Single-day mode

Unaffected — one click commits, no pending state ever exists. The pending machinery in this section applies only to `DatePickerMode.dateRange`.
### 10.4 Single-day mode: popover stays open

Decided: selecting a day commits and leaves the popover open; it closes on outside click.

One addition, not a contradiction: **Escape also closes it.** Radix's Popover gives that for free via `DismissableLayer`, every user expects it, and suppressing it means intercepting Radix's own dismiss handling — exactly what Rule 2 forbids. Treat outside-click and Escape as the two dismiss paths and don't fight either.

Since the value is committed on click, dismissing never discards anything — there's no draft to lose. The only case where dismissal matters is cancelling an in-progress re-anchor (§10.3), which Escape already handles.

### 10.5 "Clear" — dead question

That open item asked whether the panel needed an explicit *Clear* action beyond the endpoint gesture. §10.2 kills it: clearing would produce exactly the empty state that's been designed out.

If a "get me back to a known state" affordance is ever wanted, it's a **preset**, not a clear — `CalendarPresets.today` or a consumer-supplied "default" preset in the rail. Same mechanism as everything else in §6.3, no new concept.

### 10.6 `renderDay` and `disabled` — sequencing, not semantics

That open item was about **v1 scope**, not about what the features do. They're independent:

- **`disabled`** (the matcher from §9.4) — **ship in v1.** It changes the interaction model: click handling, arrow-key skipping, and month/year dropdown bounds all have to respect it. Retrofitting it into keyboard navigation afterwards means revisiting every one of those, which is how the "disabled on click but not on arrow keys" bug gets shipped.
- **`renderDay`** (the content slot from §9.5) — **defer without cost.** It's purely additive: no interaction consequences, no changes to anything already written. Add it the first time a consuming project actually needs a badge or a dot. YAGNI applies cleanly here, and adding it later breaks nothing.

If both are cheap on the day, doing them together is fine. The ordering only matters if v1 has to be cut short.

---

## 11. Still open

1. **Preset ↔ range sync direction** — when the live range happens to exactly match a preset's `getRange(now)`, does that preset render as active? (Deriving it is a few lines and makes the rail feel connected; the alternative is that the rail only ever highlights on click.)
3. **Split-button trigger presets** — do the three inline presets in the trigger share highlight state with the panel's rail, or are they independent shortcuts?
4. Whether the month/year caption dropdowns should hide entries that contain no selectable day once `disabled` is in play (§9.4), or just leave them clickable.

## Sources

- [radix-ui/primitives Discussion #969 — DatePicker Primitive](https://github.com/radix-ui/primitives/discussions/969)
- [Radix Primitives — Popover](https://www.radix-ui.com/primitives/docs/components/popover)
- [mui/base-ui#1709 — Calendar and Date Fields primitives](https://github.com/mui/base-ui/issues/1709)
- [Base UI — Quick start / component list](https://base-ui.com/react/overview/quick-start)
- React DayPicker: [Upgrading to v10](https://daypicker.dev/upgrading), [Anatomy](https://daypicker.dev/docs/anatomy), [Styling](https://daypicker.dev/docs/styling), [Custom Components](https://daypicker.dev/guides/custom-components), [Selection Modes](https://daypicker.dev/docs/selection-modes), [Accessibility](https://daypicker.dev/guides/accessibility), [Time Zones](https://daypicker.dev/docs/localization/setting-time-zone)
- [shadcn/ui Calendar source (react-day-picker integration reference)](https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/new-york-v4/ui/calendar.tsx)
- [Ark UI — Date Picker](https://ark-ui.com/docs/components/date-picker), [Zag.js — Date Picker machine](https://zagjs.com/components/react/date-picker)
- [React Aria — DatePicker](https://react-aria.adobe.com/DatePicker)
- npm registry: [`@daypicker/react`](https://www.npmjs.com/package/@daypicker/react), [`@ark-ui/react`](https://www.npmjs.com/package/@ark-ui/react), [`react-aria-components`](https://www.npmjs.com/package/react-aria-components), [`@internationalized/date`](https://www.npmjs.com/package/@internationalized/date), [`@rehookify/datepicker`](https://www.npmjs.com/package/@rehookify/datepicker)
- [Temporal ships in Chrome 144](https://socket.dev/blog/temporal-api-ships-in-chrome-144-major-shift-for-javascript-date-handling), [web-features: Temporal](https://web-platform-dx.github.io/web-features-explorer/features/temporal/)
- Figma: `Ue4w95t0OjmvpJPJ6EE9bn` node `499:1894` (Date Picker Menu)
