# 03 — Const renames, one colour lookup, public-surface cleanup (batch 03, agent B)

Status: done, with one item blocked on agent A's lane (Calendar barrel date helpers, see 4).

## Progress (write-to-disk-first)
- [x] 1. Renames FontAxes → FontAxis, ProgressIndicatorVariants → ProgressIndicatorVariant
- [x] 2. One colour lookup (resolveDsColor) on ProgressIndicator / LoadingSpinner / ShapeMorphSpinner / AIContextGauge
- [x] 3. ProgressIndicator NaN guard
- [~] 4. Public surface: barrels + src/index.ts; three CSS helpers — all done EXCEPT the Calendar barrel's four date helpers (blocked, see entry)
- [x] 5. Headers
- [x] verify

---

### Const renames: `FontAxes` → `FontAxis`, `ProgressIndicatorVariants` → `ProgressIndicatorVariant` [WI-129, D-14]
- files: `src/components/Text/constants.ts`, `Text/index.ts`, `Text/BaseText.tsx`
  (JSDoc example), `Text/BaseText.stories.tsx`;
  `src/components/ProgressIndicator/constants.ts`, `ProgressIndicator.tsx`,
  `ProgressIndicator.stories.tsx`; `src/components/AIChat/AIContextGauge.tsx`.
- what changed: each const now shares its type's name, matching the repo's
  `export const X = {...} as const; export type X = ...` convention. The
  `FontAxis` type already existed; the const joined it. `FontAxesValue` (the
  axis→value record type) and `TrackingValue` are unchanged.
- consumer impact: imports of the old const names stop compiling.
- breaking: yes — v6
  - `FontAxes` → `FontAxis` (const; `FontAxis.grade` etc. — keys unchanged)
  - `ProgressIndicatorVariants` → `ProgressIndicatorVariant` (const; `.flat`, `.wavy` unchanged)
- verified: `rg -n "FontAxes\b|ProgressIndicatorVariants\b" src` → nothing.
- docs owed: v6 migration skill rename table; README/skills examples using the old names.

### One colour-name lookup for every progress and loader component [WI-068, D-06]
- files: `src/utils/color.ts` (header only), `src/components/ProgressIndicator/ProgressIndicator.tsx`,
  `src/components/LoadingSpinner/LoadingSpinner.tsx` (colour lookup only — animation
  untouched), `src/components/ShapeMorphSpinner/ShapeMorphSpinner.tsx`,
  `src/components/LinearProgressIndicator/LinearProgressIndicator.tsx` (JSDoc only:
  `'brand'` was never a token → `'prominent'`), `src/components/AIChat/AIContextGauge.tsx` (header).
- what changed: the three private `COLOR_TOKENS` tables (ProgressIndicator,
  LoadingSpinner, ShapeMorphSpinner — each knew only `primary`/`prominent`) are
  deleted. All three now call `resolveDsColor(color, "var(--ui-color-primary)")`
  and type `color` as `DsColor`. AIContextGauge forwards `color` to
  ProgressIndicator, so it inherits the lookup. LinearProgressIndicator already
  used it. `LoadingSpinnerColor` (`primary`, `prominent`) is kept; both keys are
  `DS_COLOR_TOKENS` names, so they resolve to the same vars as before.
- consumer impact — colour behaviour change: every `DS_COLOR_TOKENS` name now
  works on every progress/loader `color` prop. Names other than
  `primary`/`prominent` (e.g. `"text-secondary"`, `"danger"`, `"text"`,
  `"border-primary"`) used to be passed through as the literal string, an
  invalid CSS colour, so the ring/spinner drew **nothing**; they now draw in the
  named token colour. `primary`, `prominent` and any raw CSS colour render
  exactly as before.
- breaking: no (types widened from `LoadingSpinnerColor | string` to `DsColor`,
  which is also `name | string`).
- verified: tsc probe (temp `src/__probe03__/`, deleted) type-checked
  `color="text-secondary"` and `color="danger"` on ProgressIndicator,
  LoadingSpinner, ShapeMorphSpinner, LinearProgressIndicator and AIContextGauge;
  `rg -n "COLOR_TOKENS" src` → only `DS_COLOR_TOKENS` in `utils/color.ts`.
- docs owed: loading-indicators skill / README colour prop wording ("DS colour
  name or CSS colour", not "preset alias").

### ProgressIndicator throws on `progress={NaN}` [WI-128 part]
- files: `src/components/ProgressIndicator/ProgressIndicator.tsx`;
  `src/components/AIChat/AIContextGauge.tsx` (header constraint wording).
- what changed: the range guard is now `!(progress >= 0 && progress <= 1)`, so
  NaN (e.g. `done / total` with `total` 0) throws the same error as other
  out-of-range values instead of drawing a full ring. The component JSDoc says
  "outside [0, 1] or NaN". AIContextGauge still maps `budget <= 0` to 0, so it
  never hands NaN down; its header now says ProgressIndicator would reject it.
- consumer impact: code that passed NaN now throws (was a silently wrong full ring).
- breaking: no (was a bug) — call it out in release notes.
- verified: lint exit 0; guard read by inspection.
- docs owed: none beyond release note.

### Public-surface cleanup: helpers and recipes no longer exported [WI-123, WI-125, D-15]
- files: `src/components/DatePicker/index.ts`, `src/components/Text/index.ts`,
  `src/components/Sticker/index.ts`, `src/components/Checkbox/index.ts`,
  `src/styles/dooph-component-tokens.css`, `src/styles/index.css`.
  `src/index.ts` unchanged (it `export *`s the folder barrels).
- what changed:
  - Removed from the package surface: `formatTriggerLabel` (DatePicker barrel),
    `serializeAxes` (Text barrel), `stickerVariants` (Sticker barrel),
    `checkboxVariants` (Checkbox barrel). They remain module-level exports of
    their own files for in-folder use.
  - Recipes kept public: `buttonVariants` and `tabTriggerVariants` (the brief /
    D-15 keep them — consumers compose them onto their own elements).
    `stickerVariants` and `checkboxVariants` went private because no other
    component imports them (`rg` shows uses only inside `Sticker.tsx` /
    `Checkbox.tsx`; DropdownMenu imports `Checkbox` itself, not the recipe).
  - Types kept public: `DateMatcher`, `TextStyleProps`.
  - CSS helpers deleted: `.ds-focus-ring` (bare; the `-on-focus`,
    `-danger-on-focus`, `-on-open` variants stay) from
    `dooph-component-tokens.css`, and the unused margin helper (`.ds-my-ui-xs`,
    which the spacing pass would have named `ds-my-ui-sm`) from `index.css`.
    `rg` finds no class use of either in `src/` (only explanatory comments
    mentioning `data-[state=open]:ds-focus-ring`).
  - `.ds-disabled-control` **stays**: still used by
    `AIChat/AIPromptInput.tsx:227` and `Toggle/toggleOption.ts:32`. It goes with
    WI-067 (disabled-helper consolidation), not here.
  - **Blocked — not done:** `isSameDay`, `startOfDay`, `formatRangeLabel`,
    `formatSingleLabel` are still exported from `src/components/Calendar/index.ts:21-22`
    and therefore from the package. `DatePicker/DatePickerTrigger.tsx:8-13` and
    `DatePicker/DatePickerSplitTrigger.tsx:15-22` import them through the
    `../Calendar` barrel, so removing those two lines breaks `tsc`. Those files
    are agent A's lane. Owed: switch those imports to `../Calendar/dateFormat`
    and `../Calendar/dateUtils` (keeping the barrel imports for `DatePickerMode`,
    `DEFAULT_SPLIT_TRIGGER_PRESETS`, types), then delete Calendar/index.ts lines
    20-22 (the comment + both export lines).
- consumer impact: imports of the removed names stop compiling; classes
  `ds-focus-ring` / `ds-my-ui-xs` stop styling (neither was documented).
- breaking: yes — v6. Removed exports:
  - `formatTriggerLabel`, `serializeAxes`, `stickerVariants`, `checkboxVariants`
    (no replacement — internal helpers/recipes);
  - after the blocked step lands: `isSameDay`, `startOfDay`, `formatRangeLabel`,
    `formatSingleLabel`;
  - CSS classes `ds-focus-ring` (use `ds-focus-ring-on-focus` / `-on-open`),
    `ds-my-ui-xs`.
- verified: tsc probe confirmed `serializeAxes`, `formatTriggerLabel`,
  `stickerVariants`, `checkboxVariants` are not importable from `src/index`
  (`@ts-expect-error` consumed); brief's rg for date/label helpers → only the
  two blocked Calendar lines.
- docs owed: v6 migration skill removed-export list; codebase skill helper list
  (drop `ds-focus-ring`, `ds-my-ui-*`).

### Verification (whole batch)
- `npm run lint` → exit 0.
- `rg -n "FontAxes|ProgressIndicatorVariants\b" src` → nothing.
- `rg` date/label helpers in barrels → `Calendar/index.ts:21-22` only (blocked, above).
- Scoreboard (after): motion 0 · arbitrary px 19 · numeric spacing 36 · raw var 5 ·
  focus rings 3 · disabled looks 2 · "use client" 40 · JS timers 8 ·
  callback names 0 · default exports 74. This batch adds to none of them
  (renames, imports and lookups only; the deletions can only lower counts).
- Not mine but seen in the barrels' diff: `Toast/index.ts` (`ToastTypes` →
  `ToastVariant`) and `Tooltip/index.ts` (`TooltipTypes` → `TooltipVariant`),
  and ProgressIndicator's `.ds-progress-arc` motion change — from other batches.



### Unblocked by the orchestrator after both agents finished (2026-10-03)
- `DatePickerTrigger.tsx` and `DatePickerSplitTrigger.tsx` now import
  `formatRangeLabel` / `formatSingleLabel` from `../Calendar/dateFormat` and
  `isSameDay` / `startOfDay` from `../Calendar/dateUtils`.
- The four helpers' re-export lines are deleted from
  `src/components/Calendar/index.ts`.
- `npm run lint` exits 0. `rg` finds none of `isSameDay`, `startOfDay`,
  `formatRangeLabel`, `formatSingleLabel`, `formatTriggerLabel`,
  `serializeAxes`, `stickerVariants`, `checkboxVariants` in `src/index.ts` or
  any folder barrel.
- breaking: yes — v6. These names are no longer importable from the package.
  They were never documented.

## DONE
