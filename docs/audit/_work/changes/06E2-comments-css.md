# 06E2 — comments, stale descriptions, dead CSS (WI-010, WI-017, WI-026, WI-029, WI-078, WI-088)

Agent E2, wave E. Scoreboard before: raw var(--ui-*) in className 5 (Slider 5); "use client" 27; JS timers 5; all others 0.

## Checklist
- [x] WI-010 stale comments + no-op constructs
- [x] WI-017 stale comments (sync-theme, stylesheets, Calendar, OutlineButton, OutlineSection)
- [x] WI-026 naming/cosmetic sweep
- [x] WI-029 make the two straddling motion systems whole in one stylesheet
- [x] WI-078 dead CSS
- [x] WI-088 className-target JSDoc
- [x] lint, scoreboard after, Tailwind compile proof

Tailwind compile baseline: `src` snapshot copied to scratchpad before any edit, compiled with the repo's `tailwindcss` CLI (`before.css`, 3720 lines).

### Source comments that misdescribed the code, and three no-op constructs [F-117, F-047, WI-010]
- files: `src/components/AnimatedText/RollingDigitsText.tsx`, `src/components/Text/BaseText.tsx`, `src/components/Sheet/Sheet.tsx`, `src/components/Sheet/Sheet.stories.tsx`, `src/components/LoadingSpinner/spinnerGeometry.ts`, `src/components/MorphRotationShape/engine/{cubic,morph,polygon,utils}.ts`, `src/components/SidebarWithHoverIcon/SidebarWithHoverIcon.tsx`, `src/styles/dooph-component-tokens.css`, `src/components/Icons/ShowMoneyIcon.tsx`, `src/components/Icons/BaseIcon.tsx`, `src/components/Shapes/BaseShape.tsx`
- what changed:
  - RollingDigitsText: the wheel's `onAnimationEnd` guard comment no longer claims the column's roll fires there (it is a transition, so it fires `transitionend`, which never reaches `onAnimationEnd`); the guard is for a consumer's own animation bubbling up.
  - BaseText: no longer claims every visible string renders through it (DS controls such as Button apply `text-style-*` classes directly).
  - Sheet: the cross-axis comment and the "Custom width" story text now say left/right sheets are `w-3/4 max-w-96`, so a consumer width needs a `max-w-*` override too; top/bottom size to content.
  - spinnerGeometry: stroke widths are viewBox user units, not px.
  - Shape-morph engine headers (4 files, constraint wording only, rule unchanged): the fix file is `./svgPath.ts` (same folder), not `../svgPath.ts`.
  - SidebarWithHoverIcon header: "one `getComputedStyle` call (two property reads) per frame".
  - Slider fill CSS comment: the active track is at `--ds-slider-track-opacity` (the variant's token), not a fixed 45%; says which root var comes from which prop.
  - No-op code: ShowMoneyIcon loses Tabler's invisible `stroke="none" fill="none"` bounding-box path; BaseIcon `color ?? undefined` / `fillColor ?? undefined` → `color` / `fillColor`; BaseShape `strokeColor ?? undefined` → `strokeColor` (all typed `string | undefined`; React drops null style values either way).
  - Already done before this wave (re-derived, nothing to change): the Fade/Roll/RevealChangeText reduced-motion wording (now the motion scale's global collapse), the 1.4 s Material claim (the spinner clock is now a token), ProgressIndicator's `color` type (now `DsColor`), and the generated Icons/index.ts header.
- consumer impact: none. Rendered output is identical; ShowMoneyIcon's DOM has one fewer invisible `<path>`.
- breaking: no
- verified: see the verification section at the end.
- docs owed: none.

- resume note (2026-10-03): WI-010 re-checked against the wave-D tree — every item is in the code and its step-4 grep returns nothing. One fix-up: the Sheet comment's example `w-[540px] max-w-none` was counted by the scoreboard as an arbitrary px value (0 → 1), so it now reads "e.g. `max-w-none` next to the width" (scoreboard back to 0).

### Comments in the token script, the stylesheets, Calendar, OutlineButton and OutlineSection that pointed at the wrong thing [F-101, WI-017]
- files: `scripts/sync-theme.mjs`, `src/styles/index.css`, `src/styles/dooph-component-tokens.css`, `src/styles/tokens.css`, `src/components/Calendar/{rangeSelection.ts,CalendarCaption.tsx,dateUtils.ts,CalendarGrid.tsx}`, `src/components/OutlineButton/OutlineButton.tsx` (comment only), `src/components/OutlineSection/OutlineSection.tsx`
- what changed:
  - sync-theme.mjs header: wired into `npm run sync-tokens` (which `build` and `build:watch` run first), not a `prebuild` hook that does not exist; the mapping step names `toThemeEntry` (prefix rules + ALIASES) instead of a `TOKEN_MAP` that does not exist; adds step 4 (theme.css + twMergeTheme.ts); a new token goes in `:root`, with a `.dark` override only when the value differs. The EXCLUDED comment says only entries a prefix rule would map have an effect. Group comments: `.text-style-*` is `@layer components`; menu widths feed the custom `.min-w-menu` utility and the `ds-min-w-*` helpers; opacity feeds ds-* helpers and index.css rules (not arbitrary Tailwind values); focus-ring colours also feed the `ds-focus-*` outline helpers.
  - index.css: the `@property --progress-pct` comment no longer claims the registration makes the bar animate — the motion is the `.ds-progress-*` width/left transition. (The audit's spinner-keyframe item was already fixed: the comment now says "spokes and star variants".)
  - dooph-component-tokens.css: the disabled helper is "native :disabled + aria-disabled=\"true\"" (it never looked at aria-invalid); the linear-progress comment matches the index.css one.
  - tokens.css: the prompt-height cap is applied by CSS max-height (the component never reads it back with getComputedStyle); the radius legend lists the four real keys tight / mini / normal / soft (it said `standard`, which is not a radius).
  - Calendar: dropped references to a deleted plan ("Task 9", "Step 5"); dateUtils' rule 3 now allows `getTime()` after `startOfDay` (which the module itself does); weekday names are "short", matching `weekday: "short"`. (rangeSelection's `onSelect` and Calendar's `warnOnBadValue` items were already fixed by the onValueChange and earlier waves.)
  - OutlineButton hover-mode comment: no longer says the orb sits exactly at the cursor or that orb 2 tracks the diagonally opposite point; it defers to the exact mapping comment below it (both orbs follow the cursor with a fixed 30% offset).
  - OutlineSection JSDoc (ships in .d.ts): the outer ring is a solid 1px border, not dashed.
- consumer impact: none — comments only; OutlineSection's hover text in editors changes.
- breaking: no
- verified: WI-017 step-8 grep over `scripts src` → no matches. `npm run sync-tokens` re-run: theme.css, index.css and twMergeTheme.ts byte-identical before/after (md5).
- docs owed: none.

### Naming and cosmetic sweep: two chat-prose tokens, a "do not edit" line on the generated theme block, three header constraints that now name their failure, and small code nits [F-116, WI-026]
- files: `src/styles/tokens.css`, `src/styles/dooph-component-tokens.css`, `src/styles/index.css` (hand-written comment above the generated markers only), `src/components/Toast/Toast.tsx`, `src/components/Tooltip/Tooltip.tsx`, `src/components/Checkbox/Checkbox.tsx`, `src/components/VerificationCode/{CodeDigitInput,VerificationCodeInput}.tsx`, `src/components/SegmentedTabSelect/SegmentedTabSelect.tsx`, `src/components/Slider/Slider.tsx`, `src/components/AIChat/constants.ts` (comment only — E1's folder)
- what changed:
  - tokens.css: the Calendar heading no longer claims the day-cell radius (it lives with the radii, `--ui-radius-calendar-day`). The micro button height had already been moved next to the other button heights. New `--ui-chat-prose-link-offset: 3px` and `--ui-chat-prose-quote-border-width: 2px`, used by `.ds-chat-prose a` / `.ds-chat-prose blockquote` in place of the bare 3px / 2px.
  - index.css: the comment above `__GENERATED_THEME_START__` now says the block is written by sync-theme.mjs and must not be hand-edited.
  - Toast's cva default is `ToastVariant.simple`, not the string `"simple"`. TooltipBody no longer destructures `className` only to pass it back.
  - Header constraints, each keeping its rule and gaining its failure: Checkbox (an interactive indicator is a nested control assistive tech cannot reach), CodeDigitInput (a hand-built row loses auto-advance, backspace, arrows, paste and sequential entry — the last added because the current VerificationCodeInput header documents it), VerificationCodeInput (a packaged layout would fix copy and a Button arrangement each app owns).
  - VerificationCodeInput drops its redeclared `"aria-label"?: string` (already in `HTMLAttributes` via `AriaAttributes`; the `"Verification code"` default is unchanged).
  - SegmentedTabSelect's `./constants` import (and its comment) moves up into the import block.
  - Slider's inline `--slider-pct` is now `--ds-slider-pct` (the style key and both arbitrary width/left classes, each still one literal string).
  - AIThinkingPartState JSDoc records why Figma's `Variant` is the `state` prop.
- consumer impact: none visible. The two new `--ui-chat-*` tokens are overridable like any token (no Tailwind key — no `toThemeEntry` rule matches `ui-chat-`). A consumer stylesheet that read Slider's undocumented `--slider-pct` must read `--ds-slider-pct`.
- breaking: no (the `--slider-pct` rename touches an undocumented internal on Slider's own root).
- skipped — the two `Error` → `HasError` story renames (Input.stories.tsx, VerificationCode.stories.tsx): stories are E3's lane and this wave's E3 brief says not to rename existing story exports because it changes their URLs. Left for the maintainer to decide; the renames are trivial if wanted.
- verified: `npm run sync-tokens` → theme.css hash `61a5092…` and generated-block hash `43dd400…` identical before and after. `rg -n "slider-pct" src | rg -v ds-slider-pct` → none; `rg -n '"simple"' Toast.tsx` → none; no bare 3px/2px on the chat-prose underline/border. Tailwind compile proof in the verification section.
- docs owed: none (no consumer doc lists the `--ui-chat-*` tokens yet; that coverage gap is F-048's).

### The linear-progress and AI-chat-streaming motion systems each now live whole in one stylesheet [F-068, WI-029]
- files: `src/styles/index.css`, `src/styles/dooph-component-tokens.css`
- what changed: two at-rules moved, unchanged, from index.css into dooph-component-tokens.css, next to the classes that use them, both outside `@layer`:
  - `@property --progress-pct` (LinearProgressIndicator) now sits above `@layer utilities {`, with the `.ds-progress-*` transition classes;
  - `@keyframes ds-chat-stream-in` (AITextPart / AIThinkingPart streaming) now closes the file, after `.ds-chat-prose`; its comment says why it is outside `@layer` (an inline-style animation cannot reach a layered `@keyframes`).
  - Before this, each system had its classes in one sheet and its at-rule in the other. Every other motion system already lives whole in one file.
- consumer impact: none. Both files are plain `@import`s into one compiled sheet, so dist/styles.css has the same rules; only their position in it changes. `@property` and `@keyframes` do not depend on source order.
- breaking: no
- verified: `rg -n "@property --progress-pct|@keyframes ds-chat-stream-in" src/styles` → 2 hits, both in dooph-component-tokens.css, neither inside `@layer`. Tailwind compile proof in the verification section (both still top-level in the output).
- docs owed: WI-029 steps 2–3 — the placement rule and the file map in `.agents/skills/dooph-ds-codebase/SKILL.md` (keyframes "in the same stylesheet as the system that uses them"; dooph-component-tokens.css holds token helpers plus the Slider, LinearProgressIndicator, CopyButton swap and AI-chat systems, with their at-rules outside the layer there), and one sentence in `.agents/skills/dooph-ds-contribution/SKILL.md` (a motion system is not a token helper; keep it whole in one stylesheet). Skills are deferred.

### Dead CSS: an unread dark sticker opacity, a doubled table bottom edge, and a ToastClose colour override that never won [F-076, WI-078]
- files: `src/styles/tokens.css`, `src/components/Table/Table.tsx`, `src/components/Toast/Toast.tsx`
- what changed:
  - tokens.css `.dark`: deleted `--ui-sticker-bg-opacity-secondary: 60%`. Nothing reads it in dark — the dark secondary wash is redefined right below it on `--ui-sticker-bg-opacity` (20%). The comment above now says the 80% token is light-only.
  - TableRow: dropped the unconditional `border-b` that defeated `not-last:border-b`. Rows now draw a divider between rows only, so the last row no longer stacks its border on the Table's own 1px border (the bottom edge was 2px, now 1px like the top and sides).
  - ToastClose: the colour override now uses the ghost Button's own guarded selector (`[&:not(:disabled):not([aria-disabled=true])]:hover:text-current` / `:active:`). Checked with the repo's `cn()`: the old string kept the ghost `…:hover:text-ghost-fg-active` / `…:active:text-ghost-fg-active` classes (which out-specify a bare `hover:text-current`); the new one drops them. A comment says why the long selector is there.
- consumer impact (visible, both bug fixes):
  - On hover and press, the toast close (X) keeps the toast's text colour instead of turning ghost-foreground-active (near-invisible on the prominent toast). The ghost hover wash still shows.
  - The last TableRow has no bottom border. A consumer who renders TableRows outside a bordered `Table` loses the line under the last row.
- breaking: no
- verified: Tailwind compile in the scratchpad (current `src` vs. the same tree with only my stylesheet / Slider / Table / Toast files reverted to the pre-wave snapshot, each compiled from its own directory). The whole output diff is: the two chat-prose tokens and their two uses; the dark `60%` line removed; `@property --progress-pct` and `@keyframes ds-chat-stream-in` moved, both still top-level (brace depth 0, once each); the two Slider classes renamed to `--ds-slider-pct`; `active:text-current` removed and the two guarded `text-current` rules added. Nothing else changed. TableRow produces no CSS change (`border-b` is still used elsewhere); the change is which class the row carries. `npm run sync-tokens` → theme.css and the generated block unchanged.
- docs owed:
  - token-contract.md (`skills/dooph-design-system-theming/references/`): a "Text Selection" section documenting the opt-in `ds-selection` class and the `--ui-color-selection*` tokens (WI-078 step 2), and the `--ui-sticker-bg-opacity-secondary` line → "80%. Only the light secondary wash reads it; the dark secondary wash uses `--ui-sticker-bg-opacity`".
  - CHANGELOG `[Unreleased]` → Fixed: "`ToastClose` keeps the toast's text colour on hover and press (the icon was near-invisible on the prominent toast)." and "`TableRow` no longer draws a divider under the last row, so a `Table`'s bottom edge matches its other sides."

### Which element `className` styles, written down in the eight components that send it somewhere other than `ref`/`style` [F-062, WI-088]
- files: `src/components/OutlineButton/OutlineButton.tsx` (JSDoc only — E1's folder), `src/components/SearchBox/SearchBox.tsx`, `src/components/Menu/DropdownMenuSearch.tsx` (header `## behavior` bullet), `src/components/VerificationCode/CodeDigitInput.tsx` (header `## behavior` bullet), `src/components/SegmentedTabSelect/SegmentedTabSelect.tsx`, `src/components/Slider/Slider.tsx`
- what changed: each states its split, re-derived from the current render code:
  - OutlineButton: `className` → outer pill frame `<div>`; `ref`, `style`, handlers and the rest → the inner button (the slotted element under `asChild`).
  - SearchBox: `className` → bordered field `<div>`; the rest → `<input>`.
  - DropdownMenuSearch: `className` → row `<div>`; the rest → `<input>`.
  - CodeDigitInput: `className` → cell `<div>`; the rest → `<input>`.
  - SegmentedTabSelect: props, `ref` and `style` → Radix Tabs Root; `className` → inner TabsList (the visible shell at the container sizes).
  - SliderContinuous / SliderStepped: `className` → outer box (owns the width, and on the stepped slider the end-dot inset); the rest → Radix Root.
  - SliderLabeled: `className` → outer column (track + labels); the rest → the slider's Radix Root.
- consumer impact: none in behaviour; the JSDoc lines show in IntelliSense.
- breaking: no
- verified: `rg -n "className\` styles|className\` always lands" src/components` → 9 lines (Input plus the 8 added).
- docs owed: WI-088 step 7 — a "`className` target" paragraph in `.agents/skills/dooph-ds-codebase/SKILL.md` under Component Inventory, listing the nine split components and noting the rule is pending decision D-17.

## Verification (whole record)
- `npm run lint` (tsc --noEmit) → exit 0.
- Scoreboard after: identical to before (raw var(--ui-*) in className 5, all Slider; "use client" 27; JS timers 5; all others 0). During the resume the Sheet comment example briefly pushed "arbitrary px values" to 1; reworded, back to 0.
- Stale-text greps from WI-010 step 4 and WI-017 step 8 → no matches. `rg "slider-pct" src | rg -v ds-slider-pct`, `rg '"simple"' Toast.tsx`, `rg "sticker-bg-opacity-secondary: 60%" src` → none.
- `npm run sync-tokens` → theme.css (`61a5092…`), the generated `@theme` block (`43dd400…`) and twMergeTheme.ts unchanged.
- Tailwind compile proof: see the WI-078 entry. The only output changes are the ones listed there, and both moved at-rules are still top-level.
- Not run here (the orchestrator verifies visually): Storybook checks — chat-prose computed `3px` / `2px`, Slider fills tracking the handle, ToastClose on the prominent toast, Table bottom edge — and a scratch-worktree build.

## Skipped / for other lanes
- WI-026 `Error` → `HasError` story renames (Input.stories.tsx, VerificationCode.stories.tsx): stories are E3's lane, and E3's brief says not to rename existing story exports because it changes their URLs. Maintainer's call.

## DONE
