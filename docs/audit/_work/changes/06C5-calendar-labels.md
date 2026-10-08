# 06C5 — Calendar & DatePicker element access; overridable accessible names

Checklist:
- [x] Calendar `forwardRef` + root rest props; DatePicker `triggerProps` / `contentProps` [WI-109]
- [x] Calendar/DatePicker/CalendarCaption `labels` (month arrows) [WI-101]
- [x] Toast `closeLabel` + export `ToastOptions` [WI-101]
- [x] Slider `aria-labelledby` / `aria-describedby` on the thumb [WI-101]
- [x] VerificationCodeInput `digitLabel` [WI-101]
- [x] lint, scoreboard, type probe, render script


## Calendar and DatePicker: reach the element, label the trigger, place the panel [WI-109, F-039]

- **files:** `src/components/Calendar/Calendar.tsx`, `src/components/DatePicker/DatePicker.tsx`
- **what changed:**
  - `Calendar` now forwards `ref` to its root `<div>` and spreads the div's other props (`id`, `aria-*`, `data-*`, `style`, handlers) onto it. Its own `data-mode`, `className` merge (consumer class last) and Escape handler are written after the spread, so a consumer can't override them by accident. A consumer `onKeyDown` runs first; if it calls `preventDefault()`, the pending-range-anchor reset is skipped. The div's native `onSelect` / `defaultValue` are left out of the type, so a pre-v6 `onSelect` is still a type error and never becomes a DOM handler. `value` / `onValueChange` are kept off the root. The ref goes through the validating outer `Calendar` (batch 02's "invalid value renders nothing") to the inner view.
  - `DatePicker` takes `triggerProps` (spread first onto the trigger button: `id` for `<label htmlFor>`, `aria-*`, handlers, `className`) and `contentProps` (spread onto `PopoverContent`: `align`, `side`, `sideOffset`, `aria-*`, `className`). The picker still owns the trigger's `mode` / `value` / `disabled` / `today` / `locale`; the type omits them. On the plain triggers the class is `cn(className, triggerProps.className)`; on the split trigger the picker's `className` stays on the split container and `triggerProps.className` goes on the button.
- **consumer impact:** additive. Nothing renders differently unless the new props are passed.
- **breaking:** no
- **verified:** see Verification below.
- **docs owed:** codebase SKILL Calendar row (append "`ref` + `<div>` rest props on the root") and DatePicker row (append "`triggerProps` (trigger button) and `contentProps` (PopoverContent)"); usage SKILL dates paragraph (label the trigger with `triggerProps={{ id }}` + `<label htmlFor>`, place the panel with `contentProps={{ align: "end" }}`, Calendar takes `ref`/`id`/`aria-*`); CHANGELOG `### Added`: "`DatePicker` `triggerProps` / `contentProps`; `Calendar` forwards `ref` and root `<div>` props."

## Overridable accessible names [WI-101, F-090]

- **files:** `src/components/Calendar/CalendarCaption.tsx`, `src/components/Calendar/Calendar.tsx`, `src/components/Calendar/index.ts`, `src/components/DatePicker/DatePicker.tsx`, `src/components/Toast/Toast.tsx`, `src/components/Slider/Slider.tsx`, `src/components/VerificationCode/VerificationCodeInput.tsx`
- **what changed:**
  - Month arrows: new `labels?: { previousMonth?, nextMonth? }` on `CalendarCaption`, `Calendar` and `DatePicker` (passed down). Defaults stay "Previous month" / "Next month". New exported type `CalendarLabels` (from the Calendar barrel, so from the package root).
  - Toast: `ToastOptions` is now exported from `Toast.tsx` and gains `closeLabel` (accessible name of the simple/prominent/danger close X; default "Close"). `dismissLabel` got a doc comment.
  - Slider: `aria-labelledby` and `aria-describedby` are taken out of the rest props and put on the `role="slider"` thumb instead of the role-less Root span. The thumb's "Value" fallback name now applies only when there is neither `aria-label` nor `aria-labelledby`. Covers `SliderContinuous`, `SliderStepped`, `SliderLabeled` (all render `SliderBase`).
  - VerificationCodeInput: new `digitLabel?: (index, length) => string` for each cell's name; default stays `Digit N of M`. It's destructured, so it never reaches the DOM. The header contract is unaffected (a label prop, not a layout).
- **consumer impact:** every new prop is optional with today's English default, so markup is unchanged when none is passed. One deliberate change: a Slider given `aria-labelledby` / `aria-describedby` now has them on the thumb (where assistive tech reads them), not the Root span, and that thumb no longer also says "Value".
- **breaking:** no
- **verified:** see Verification below.
- **NOT done — outside C5's lane:** `src/components/Toast/index.ts` needs `ToastOptions,` added to its `export type { … } from "./Toast"` list (after `ToastDescriptionProps,`). Until then `ToastOptions` is exported from the module but NOT from the package root, and WI-101's done_when ("`ToastOptions` imports from the package root") isn't met. It's a one-line edit for the orchestrator.
- **docs owed:** CHANGELOG `### Added`: "Overridable accessible names: `labels` on `Calendar`/`DatePicker`/`CalendarCaption` (month arrows), `closeLabel` on `toast()` options, `digitLabel` on `VerificationCodeInput`; `ToastOptions` and `CalendarLabels` are exported." `### Fixed`: "Slider `aria-labelledby` / `aria-describedby` now land on the `role=\"slider\"` thumb, which no longer falls back to the name \"Value\" when labelled by reference."

## Verification

- `npm run lint` → exit 0.
- Scoreboard after: motion 0, arbitrary px 18, numeric spacing 36, raw var 5 (all in Slider's thumb class, untouched), focus 3, disabled 2, "use client" 29, timers 5, value callbacks 0, default exports 0. C5's edits add no class strings, motion, timers or `"use client"`, so no number moved because of them. (The pre-resume agent recorded no "before" figure.)
- Type probe (scratchpad `c5/probe.tsx`, tsc against `src`) → 0 errors. It covers: Calendar `id`/`aria-label`/`ref`/`labels`/`onKeyDown`; DatePicker `labels`/`triggerProps`/`contentProps`; CalendarCaption `labels`; Slider `aria-labelledby`/`aria-describedby`; VerificationCodeInput `digitLabel`; `ToastOptions` with `closeLabel` (imported from the module). Two `@ts-expect-error` cases still error as they should: Calendar `onSelect`, and `triggerProps.value`.
- SSR check (scratchpad `c5/check.cjs`, esbuild bundle of `src`, react-dom/server) → ALL PASS, 21 checks. It ports all of `wi-c6-09-check.cjs` (Calendar labels, Slider thumb ×6, digitLabel) and `render.cjs` case 07 (Calendar root props, DatePicker `triggerProps`) to the value/onValueChange names. It also checks: CalendarCaption labels, Calendar keeps its own `data-mode` with the consumer class last, `value` is not on the root, triggerProps on the range and split triggers with the split container keeping `className`, and no React unknown-prop warnings.
- Default-name grep: every "Previous month" / "Next month" / "Close" / `Digit ${index` is the right side of a `??`, the `defaultDigitLabel` template, or a doc comment.
- NOT verified here (no Browser pane, no build, per the brief): the ref attaching in a live DOM; Escape still clearing a pending range anchor; a toast shown with `closeLabel`; `contentProps` placing an open panel. These need the orchestrator's Storybook pass.

## DONE

### Orchestrator follow-up
- Added `ToastOptions` to the type re-exports in `src/components/Toast/index.ts`. `src/index.ts` re-exports the Toast barrel, so it is now importable from the package root. Lint exits 0.
