# 06F1 — SplitButton (WI-084 → WI-085 → WI-117)

Checklist
- [x] baseline: scoreboard captured; esbuild "before" bundle + SSR render reproduces
  the three WI-117 FAILs and the unnamed trigger
- [x] WI-084 split parts on secondary `buttonVariants` + default trigger name
- [x] WI-085 `SplitButtonGroup` part
- [x] WI-117 merge order of triggerProps / part-level disabled
- [x] verify: lint, scoreboard after, class diff, 55-split-triggers equivalent, type probe

---

### SplitButton parts are built on the secondary Button recipe, and the trigger has a default name [F-041, F-081, WI-084]
- files: `src/components/SplitButton/SplitButton.tsx`, `src/components/SplitButton/SplitButton.stories.tsx`
- what changed: `SplitButtonAction` and `SplitButtonTrigger` now compose
  `buttonVariants({ variant: secondary, size: standard | icon })` (deep imports
  from `../Button/Button` and `../Button/constants`) plus only the split
  geometry: one-sided radius (`rounded-r-none` / `rounded-l-none`), the shared
  seam (`border-r-0` on the action), the action's 16px inline padding (`px-lg`),
  and a `PART_SHADOW_NONE` list that cancels the recipe's rest/hover/active
  shadows (the group keeps `shadow-button`). The hand-written paint and state
  classes are gone. `SplitButtonTrigger` renders `aria-label="More options"`
  unless the consumer passes `aria-label` (overrides) or `aria-labelledby`
  (then no default label is set). The prop is declared with JSDoc on
  `SplitButtonTriggerProps`.
- class diff (computed by `cn` from an esbuild bundle, SSR before vs after; all
  three stories' renders: Default, WithIcon, Disabled):
  - Action — removed `ds-gap-ui-sm` → added `gap-sm` (same 8px, `--spacing-sm` =
    `--ui-spacing-sm`; the recipe's spelling). Removed `pl-lg pr-lg` → `px-lg`
    (same 16px). Removed `rounded-l-tight` → `rounded-tight` + kept
    `rounded-r-none` (same geometry; Tailwind 4.3 emits `rounded-r-none` after
    `rounded-tight`, confirmed by compiling a probe with the repo's tailwindcss).
  - Trigger — removed `rounded-r-tight` → `rounded-tight` + `rounded-l-none`
    (same geometry, same ordering proof). Added `p-0` (preflight already zeroes
    button padding: no change). Added `text-style-button` (icon-only, fixed
    `size-button` box, centred svg: no visible change).
  - Both — `border-border-primary` → `border-secondary-border` (light #dddddd →
    #e2e3e4, dark #333437 → #303235): FIX, the parts painted a different
    border token from the secondary Button they sit beside.
  - Both — added hover/active `border-secondary-border-hover/-active`: FIX,
    the secondary Button changes its border on hover/press, the parts did not.
  - Both — added `disabled:bg-secondary-disabled`: FIX, Button's contract is
    "each variant paints its own disabled bg/border tokens", the parts only
    dimmed the rest fill.
  - Both — added `aria-disabled:bg-secondary-disabled
    aria-disabled:border-secondary-border-disabled`: FIX, `aria-disabled` parts
    had no disabled paint (the hover/active guards already honoured it).
  - Both — added `whitespace-nowrap` (action label can no longer wrap inside the
    fixed 38px height) and, on the action, `justify-center` (no visible change
    at content width; centres the label if a consumer widens the part, like
    Button). Convergence with Button.
  - Both — added `shadow-none` + hover/active `shadow-none`: keeps today's look
    (parts had no shadow); they override the recipe's per-part shadows, which
    `cn` removes from the output (`shadow-button-secondary`,
    hover `shadow-button-hover`, active `shadow-button-active` do not appear).
  - Unchanged: group wrapper classes (byte-identical), `h-button`/`size-button`,
    `bg-secondary text-secondary-fg`, hover/active bg, `ds-motion-state`
    (transition was already converged by the motion wave, so the WI's
    100ms→150ms item no longer applies), `ds-focus-visible-ring`,
    `ds-disabled-state`, `disabled:border-secondary-border-disabled`, the
    action's `ds-size-icon-rg` icon slot.
  - No correct state's look was kept back: every visible change above is one
    the WI names as the drift fix.
- story: `WithDropdown`'s trigger passes `aria-label="More save options"` (the
  override); Default/WithIcon/Disabled exercise the default label.
- consumer impact: SplitButton now matches a secondary Button exactly in border
  colour, hover/press border, disabled fill and `aria-disabled` paint. Screen
  readers announce the trigger as "More options" by default.
- breaking: no
- verified: SSR from an esbuild bundle of the source: trigger renders
  `aria-label="More options"`; `aria-label="Weitere Optionen"` overrides it;
  `aria-labelledby="x"` renders no `aria-label`. `rg "hover:enabled|border-border-primary"`
  on SplitButton.tsx → no output. `npm run lint` exit 0. Type probe (temp file
  under src/, removed): `aria-label`, `aria-labelledby` compile;
  `aria-label={3}` fails.
- docs owed:
  - codebase SKILL (`.agents/skills/dooph-ds-codebase/SKILL.md`, the SplitButton
    rows): `SplitButtonAction` Variants → "secondary `buttonVariants`";
    `SplitButtonTrigger` → "secondary `buttonVariants` (icon size); default
    `aria-label="More options"`".
  - usage SKILL (`skills/dooph-design-system-usage/SKILL.md`, SplitButton line):
    "`SplitButtonTrigger` — icon-only, named "More options" unless you pass a
    localised `aria-label`".
  - CHANGELOG `[Unreleased]` → Fixed: "`SplitButtonTrigger` has a default
    accessible name ("More options", overridable with `aria-label`), and the
    split parts now share the secondary `Button`'s paints and
    disabled/`aria-disabled` states."

### New `SplitButtonGroup` part [F-092, WI-085]
- files: `src/components/SplitButton/SplitButton.tsx`, `src/components/SplitButton/index.ts`, `src/components/SplitButton/SplitButton.stories.tsx`
- what changed: exported `SplitButtonGroup` (forwardRef div, `displayName`,
  `inline-flex rounded-tight shadow-button` merged with consumer `className`,
  rest spread) and `SplitButtonGroupProps`. The composite renders through it
  (ref and rest props forwarded as before). `src/index.ts` re-exports the
  folder with `export *`, so it is public with no further edit. The
  `WithDropdown` story uses `SplitButtonGroup` instead of a bare
  `<div className="inline-flex">`; meta already had `component: SplitButton`.
- consumer impact: a split button whose trigger opens a `DropdownMenu` can be
  composed by hand and keep the composite's radius and group shadow. The
  composite's DOM is unchanged (wrapper classes byte-identical in the SSR diff).
- breaking: no (additive)
- verified: SSR of `SplitButtonGroup` with `className="x"` →
  `inline-flex rounded-tight shadow-button x`; composite wrapper identical
  before/after; `rg 'className="inline-flex"' src/components/SplitButton` → no
  output; type probe: `<SplitButtonGroup ref={divRef} />` and
  `SplitButtonGroupProps` import from the package root compile.
- docs owed:
  - codebase SKILL: add a `SplitButtonGroup` row (`same | – | – | ❌`); append
    to the `SplitButton` row: "renders through `SplitButtonGroup` — compose
    `SplitButtonGroup` + `SplitButtonAction` + `DropdownMenuTrigger
    asChild`/`SplitButtonTrigger` to open a menu".
  - usage SKILL: name `SplitButtonGroup` among the parts, "(use it, not a bare
    div, when the trigger opens a `DropdownMenu`)".
  - CHANGELOG `[Unreleased]` → Added: "`SplitButtonGroup` — the SplitButton
    chrome as a part, for split buttons whose trigger opens a `DropdownMenu`."

### Split controls: consumer trigger props merge instead of replacing, and a part cannot re-enable a disabled control [F-095, WI-117]
- files: `src/components/DatePicker/DatePickerSplitTrigger.tsx`, `src/components/SplitButton/SplitButton.tsx`
- what changed:
  - DatePickerSplitTrigger pulls `className` and `disabled` out of
    `triggerProps`, spreads the rest first, then sets
    `disabled={disabled || triggerDisabled}` and
    `className={cn("rounded-r-none border-r-0", triggerClassName)}`. JSDoc on
    `triggerProps` documents both. The preset half still follows only the
    component-level `disabled`.
  - SplitButton composite: `{...actionProps} disabled={disabled ||
    actionProps?.disabled}` and `{...triggerProps} disabled={disabled ||
    triggerProps?.disabled}` (`icon` stays before the spread, so
    `actionProps.icon` still overrides). Inline comment explains the order.
    `actionProps`/`triggerProps` JSDoc states it.
- consumer impact: `triggerProps={{ className: "w-60" }}` on
  DatePickerSplitTrigger now keeps the seam (no doubled border / stray right
  radius). `disabled` on DatePickerSplitTrigger or SplitButton can no longer be
  undone by a part's `disabled: false`. A part-level `disabled: true` still
  disables just that part.
- breaking: no
- verified: equivalent of `docs/audit/_work/scratch/W7b/55-split-triggers.cjs`
  run against esbuild bundles of the source (callback renamed to
  `onValueChange`): before → 3 FAIL / 2 PASS (reproduced); after → 5 PASS,
  plus an extra check that `triggerProps.disabled: true` alone disables only
  the trigger. DatePickerSplitTrigger SSR with no props / `disabled` /
  `triggerProps={{id}}` is byte-identical before and after.
  `rg "\{\.\.\.triggerProps\}\s*$"` on DatePickerSplitTrigger.tsx → no output.
- docs owed: CHANGELOG `[Unreleased]` → Fixed: "`DatePickerSplitTrigger` merges
  `triggerProps.className` after its seam classes instead of replacing them,
  and `disabled` on `DatePickerSplitTrigger` / `SplitButton` can no longer be
  undone by a part's `disabled: false`."

### Verification summary
- `npm run lint` → exit 0.
- scoreboard before → after: no metric rose. (Raw `var(--ui-*)` in className
  went 5 → 0 during the run — Slider, F3's lane, not this change.)
- Neither SplitButton.tsx nor DatePickerSplitTrigger.tsx has a header contract;
  none added (inline comments cover the seam ordering and the disabled-after-
  spread order).
- Not done here (orchestrator): Storybook visual check of
  `Buttons/SplitButton/*` and `Dates/DatePicker` SplitTrigger.

## DONE
