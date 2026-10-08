# 02 — Value callbacks, inverse-theme flag, Calendar/DatePicker guards (batch 02, agent A)

Status: done. Brief: `docs/audit/_work/briefs/02-callbacks-guards.md`.

## Progress (write-to-disk-first)
- [x] VerificationCodeInput rename
- [x] Calendar rename + guard (Calendar.tsx, dateUtils.ts, dateFormat.ts, rangeSelection.ts)
- [x] CalendarPresetItem rename
- [x] DatePicker / DatePickerSplitTrigger rename + label guards
- [x] OutlineButton themeInverse
- [x] Input icon ReactElement + guard
- [x] Stories
- [x] Verify (lint, tsc probe, scoreboard)

Note on the folder diffs: the working-tree diff of these five folders also carries
other batches' scripted edits (spacing-scale renames such as `gap-md` → `gap-lg`,
`ds-motion-state` replacing `transition-all duration-*`, OutlineButton orb
transitions moving to `ds-outline-orb-*`, and `formatTriggerLabel` dropped from
`DatePicker/index.ts`, which is batch 03). None of those are recorded here.

---

## 2026-10-03

### Value controls are named `value` / `onValueChange` [WI-127, D-13]
- files:
  - `src/components/VerificationCode/VerificationCodeInput.tsx`
  - `src/components/Calendar/Calendar.tsx`, `CalendarPresetsPanel.tsx`, `rangeSelection.ts` (comment only)
  - `src/components/DatePicker/DatePicker.tsx`, `DatePickerSplitTrigger.tsx`
  - stories: `VerificationCode.stories.tsx`, `Calendar.stories.tsx`, `DatePicker.stories.tsx`
- what changed: every date/code value control now takes `value` and reports
  through `onValueChange(value)`, like the rest of the DS. Internal forwarding in
  DatePicker (`selected={props.value}` / `onSelect={props.onChange}`) is gone; it
  passes `value` / `onValueChange` straight through. Rename only: no
  uncontrolled `defaultValue` was added where none existed. The old names stay
  omitted from the native-attribute base types (`onChange` on
  VerificationCodeInput's div props, `onSelect` on DatePickerSplitTrigger and
  CalendarPresetItem), so a pre-v6 call site is a type error rather than a
  silently attached DOM handler. CalendarPresetItem also omits the native
  `value` button attribute so its `value` can be the range.
- consumer impact: call sites using the old names stop compiling and must be
  renamed. Behaviour and callback arguments are unchanged.
- breaking: yes — v6. Exact old → new, per component:
  - `VerificationCodeInput`: `onChange` → `onValueChange` (still `(value: string) => void`; `value` and `defaultValue` unchanged).
  - `DatePicker`: `onChange` → `onValueChange` (both modes; `value` unchanged).
  - `Calendar`: `selected` → `value`; `onSelect` → `onValueChange` (both modes).
  - `DatePickerSplitTrigger`: `onSelect` → `onValueChange` (`value` unchanged).
  - `CalendarPresetItem`: `selected` → `value`; `onSelect` → `onValueChange`.
  - Codemod-safe: each is a pure prop rename on that JSX element; argument types are identical.
- verified: see "Verification" below.
- docs owed:
  - CHANGELOG v6 → Changed (breaking): the five renames above.
  - v6 migration skill: the old → new list above, verbatim.
  - Usage skill / any Calendar, DatePicker, VerificationCode examples: switch to `value` / `onValueChange`.

### OutlineButton `inverseTheme` → `themeInverse` [WI-127]
- files: `src/components/OutlineButton/OutlineButton.tsx`, `OutlineButton.stories.tsx`
- what changed: the prop is renamed to match Tooltip and AIModelSelect. JSDoc
  now says "Same flag as Tooltip's `themeInverse`". The story `InverseTheme` is
  now `ThemeInverse` (Storybook id changes from `…--inverse-theme` to `…--theme-inverse`).
- consumer impact: `<OutlineButton inverseTheme>` stops compiling; rename the prop.
- breaking: yes — v6. `OutlineButton`: `inverseTheme` → `themeInverse`.
- verified: see "Verification" below.
- docs owed: CHANGELOG v6 breaking; migration skill entry; usage skill OutlineButton prop table.

### Input icon variants require an icon element [WI-128]
- files: `src/components/Input/Input.tsx` (stories unchanged — they already pass `icon={<UserIcon />}` / `icon={<TagIcon />}`)
- what changed: on `InputVariant.iconText` / `iconNumber`, `icon` is typed
  `ReactElement` instead of `ReactNode`, so `null`, `undefined`, `false` and
  `""` are compile errors. The runtime guard now uses `isValidElement`, so a
  JavaScript consumer passing a non-element also hits the throw; the message is
  `[Input] variant "<variant>" requires an \`icon\` element, e.g. icon={<PencilIcon />}.`
- consumer impact: an icon variant given a string, number or falsy icon now
  fails to compile (TS) or throws (JS). Passing an element is unchanged.
- breaking: yes — v6. `Input` (`variant` iconText / iconNumber): `icon: ReactNode` → `icon: ReactElement`; non-element values (string, number, null, false) now throw at render instead of rendering an empty/odd icon slot.
- verified: see "Verification" below.
- docs owed: CHANGELOG v6 breaking; migration skill ("wrap text icons in an element"); usage skill Input notes.

### Calendar renders nothing on an invalid value or unknown mode [WI-128, D-12]
- files: `src/components/Calendar/Calendar.tsx`, `dateUtils.ts`, `Calendar.stories.tsx`
- what changed: `Calendar` validates before any hook or date maths runs. In
  single-day mode `value` must be a valid Date; in date-range mode it must be
  `{ from: Date, to: Date }` with both valid. A `mode` other than the two
  `DatePickerMode` values is invalid too (before, it silently ran the range
  branch). Invalid → development `console.warn("[dooph] Calendar: … Rendering
  nothing.")` and the component returns `null`. Before, it warned and then
  crashed with a TypeError. A reversed range still renders and still warns. The
  view lives in an inner `CalendarView`, so an invalid value unmounts it (view
  month/focus reset when a valid value returns). New helpers `isValidDate` /
  `isValidRange` in `dateUtils.ts` (internal, not exported from the barrel).
  Out-of-bounds warning text now says `value` instead of `selected`.
- consumer impact: a bad value no longer crashes the tree; the calendar simply
  is not shown, with a dev warning saying why.
- breaking: no (crash → render nothing).
- verified: see "Verification" below. Stories added:
  `Dates/Calendar` → "Invalid Single Day Value Renders Nothing",
  "Invalid Range Value Renders Nothing", "Unknown Mode Renders Nothing".
- docs owed: CHANGELOG → Fixed: "Calendar no longer crashes on an invalid
  `value` or unknown `mode`; it warns in development and renders nothing."

### DatePicker / trigger labels tolerate an invalid value [WI-128, D-12]
- files: `src/components/Calendar/dateFormat.ts`, `src/components/DatePicker/DatePickerSplitTrigger.tsx`, `DatePicker.stories.tsx`
- what changed: `formatSingleLabel` / `formatRangeLabel` return `""` for an
  invalid value, so `DatePickerTrigger` and `DatePickerSplitTrigger` show an
  empty label instead of throwing. The split trigger's active-preset lookup
  skips a value whose ends are not Dates. Opening the panel shows no calendar
  (Calendar renders nothing, above).
- consumer impact: an invalid value no longer crashes the DatePicker.
- breaking: no.
- verified: see "Verification" below. Story added: `Dates/DatePicker` → "Invalid Value Empty Label" (single-day and split range trigger).
- docs owed: CHANGELOG → Fixed, folded into the Calendar line above.

### Header contracts touched
- `src/components/VerificationCode/VerificationCodeInput.tsx` — `## behavior`: "Controlled via `value` + `onChange`" → "`onValueChange`".
- `src/components/Input/Input.tsx` — `## behavior`: "The icon variants require an `icon` element."; `## constraints`: "An icon variant without an `icon` element (null, false, "" included) throws. The props union is the real guard (`icon` is a `ReactElement`) …".
- Calendar, DatePicker, OutlineButton files carry no `## behavior` / `## constraints` header; the render-nothing rule is documented in the JSDoc on `hasValidValue` and the outer `Calendar` in `Calendar.tsx`. No new header added (rule 3).
- `CodeDigitInput.tsx` has a header but batch 02 did not change it (its diff is the motion batch).

### Verification
- `npm run lint` (tsc --noEmit): exit 0 (run after the final story edit).
- tsc probe in `.tmp-probe-A/` (own tsconfig extending the root; deleted after):
  - `good.tsx` — 0 errors: VerificationCodeInput `value`/`defaultValue`/`onValueChange`; DatePicker both modes `onValueChange`; Calendar both modes `value`/`onValueChange`; CalendarPresetItem `value`/`onValueChange`; DatePickerSplitTrigger `value`/`onValueChange`; OutlineButton `themeInverse`; Input iconText/iconNumber with `icon={<span />}`.
  - `bad.tsx` — 14/14 lines fail with TS2322: VerificationCodeInput `onChange`; DatePicker `onChange` ×2 modes; Calendar `selected`/`onSelect` ×2 modes; CalendarPresetItem `selected`/`onSelect`; DatePickerSplitTrigger `onSelect`; OutlineButton `inverseTheme`; Input iconText `icon={null}`, `icon={false}`, `icon=""`, no icon; Input iconNumber `icon={null}`, `icon={false}`.
- Scoreboard m9 (value callbacks not named `onValueChange`): 7 at `b436647` (Calendar.tsx 2, DatePicker.tsx 2, CalendarPresetsPanel.tsx 1, DatePickerSplitTrigger.tsx 1, VerificationCodeInput.tsx 1) → 0 now. No hits remain anywhere in `src/`. No other metric rose from batch 02 (it adds no classes, timers or `"use client"`).
- Not done here, per the brief: browser check and `npm run build`. The invalid-value stories are untested at runtime; their non-crash is by code reading (guard runs before any date maths; label formatters short-circuit).

## DONE
