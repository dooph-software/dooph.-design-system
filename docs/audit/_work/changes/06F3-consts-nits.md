# 06F3 — constants placement, geometry helpers, type nits (WI-032, WI-071, WI-120)

Agent F3, wave F. Started 2026-10-03.

## Checklist
- [x] Baseline scoreboard (raw var(--ui-*) in className = 5, all Slider.tsx)
- [x] WI-032 AvatarSize + Shapes → constants.ts
- [x] WI-071 Slider / LinearProgressIndicator geometry → helpers
- [x] WI-120 type nits (in-lane parts)
- [x] lint, scoreboard after, probes

## Notes as I go
- Lane: Avatar, Shapes, Slider, LinearProgressIndicator, LoadingSpinner,
  ProgressIndicator, Calendar, ShapeMorphSpinner, MorphRotationShape,
  OutlineSection, and the slider/progress helpers in dooph-component-tokens.css.
  NOT in lane: tokens.css, sync-theme.mjs, index.css, DatePicker/**.

## Entry 1 — `AvatarSize` and `Shapes` live in sibling `constants.ts` files [WI-032, F-065]
- **files:** new `src/components/Avatar/constants.ts`, new
  `src/components/Shapes/constants.ts`; `Avatar/Avatar.tsx` (imports the
  const), `Avatar/index.ts` (re-exports it from `./constants`),
  `Shapes/index.ts` (`export * from "./constants"` replaces the inline const),
  `Shapes/shapePaths.ts` (imports `Shapes` from `./constants` instead of the
  barrel `./index` — removes an index ↔ shapePaths cycle; the
  `satisfies Record<Shapes, …>` check on the shape table is unchanged),
  `Avatar/Avatar.stories.tsx` (imports from `.`),
  `OutlineSection/OutlineSection.stories.tsx` (imports from `../Avatar`).
- **what changed:** the two discrete-option consts moved out of component /
  barrel modules into server-safe `constants.ts` files, so `AvatarSize.sm`
  stays readable from a Server Component even if Avatar later gains client
  state. Values unchanged (`AvatarSize` keys are `standard` / `sm` today — the
  WI's `small` predates the size-word rename).
- **consumer impact:** none. Same names, same values, same `src/index.ts`
  `export *` paths.
- **breaking:** no.
- **verified:** the step-1 search (`export const` + PascalCase in components,
  excluding constants.ts and stories) now lists only `Icons/BaseIcon.tsx`.
  Lint below.
- **docs owed:** `.agents/skills/dooph-ds-codebase/SKILL.md` — the "every
  component with consts uses constants.ts" exception list should name only
  `BaseIcon` (declares `IconSize` inline in a module that must stay
  server-safe), dropping `Avatar`.

## Entry 2 — Slider and LinearProgressIndicator geometry moves into helper classes [WI-071, F-017]
- **files:** `src/styles/dooph-component-tokens.css` (slider/progress helpers),
  `src/components/Slider/Slider.tsx`,
  `src/components/LinearProgressIndicator/LinearProgressIndicator.tsx`.
- **state found:** wave C had already given the progress root the mergeable
  `h-linear-progress` utility (+ `--ui-height-linear-progress: 4px`) and moved
  the slider dot's size into `.ds-slider-dot` (`--ui-size-slider-step`). Kept
  both. Left: 5 raw `var(--ui-*)` class strings in Slider.tsx plus the
  `var(--ds-*)` / `4px` / `2px` arbitraries in both files.
- **what changed:**
  - New helpers `.ds-slider-root` (height), `.ds-slider-active-part`
    (left/width), `.ds-slider-inactive-part` (right/left), `.ds-slider-thumb`
    (width/height/background). `.ds-progress-fill` gains width + background,
    `.ds-progress-remainder` gains left.
  - Slider.tsx / LinearProgressIndicator.tsx use those class names instead of
    the arbitrary values. Slider's "calc() class strings must stay single
    literals" comment now points at the CSS helpers that share
    thumbAlignedLeft()'s formula.
  - Helpers, not mergeable utilities, on purpose: none of these elements
    receives the consumer's className (Slider's goes to the outer box; the
    progress root keeps its `h-linear-progress` utility), so no override is
    lost.
- **deviation from the WI:** the WI added three tokens to tokens.css
  (`--ui-size-slider-dot`, `--ui-height-linear-progress`,
  `--ui-linear-progress-gap`). tokens.css and sync-theme.mjs are outside this
  lane. The first two already exist (as `--ui-size-slider-step` and
  `--ui-height-linear-progress`). For the gap I used the existing 4px spacing
  token: `var(--ui-spacing-xxs) / 2` either side. The progress nub's minimum is
  `var(--ui-height-linear-progress)` (4px). If the maintainer wants a dedicated
  `--ui-linear-progress-gap`, it is a one-line token + EXCLUDED entry and a
  swap in the two helper declarations.
- **consumer impact:** none visible. Every moved declaration is
  character-identical to what Tailwind emitted for the old class (compiled the
  old classes with tailwindcss 4.3.3 `compile().build()` and diffed against the
  helpers, substituting the two token values: ALL EQUAL, 11/11 declarations).
  The new `ds-slider-*` / `ds-progress-*` names ship in styles.css.
- **breaking:** no.
- **verified:** see bottom (lint, scoreboard).
- **docs owed:** none new (no new tokens). If a dedicated gap token is added
  later: token-contract.md "Linear Progress" bullet + CHANGELOG Added.

## Entry 3 — Type nits: no-op casts dropped, shape-list types readonly, date and event types spelled directly [WI-120, F-115]
- **files:** `LoadingSpinner/LoadingSpinner.tsx`,
  `ProgressIndicator/ProgressIndicator.tsx`, `Slider/Slider.tsx`,
  `Calendar/dateFormat.ts`, `Calendar/CalendarGrid.tsx`,
  `ShapeMorphSpinner/ShapeMorphSpinner.tsx`,
  `MorphRotationShape/MorphRotationShape.tsx`.
- **what changed:**
  - `getSpinnerGeometry(size as SpinnerSizeKey)` → `getSpinnerGeometry(size)`
    in LoadingSpinner and ProgressIndicator (and the unused `SpinnerSizeKey`
    import removed). `LoadingSpinnerSize` and `SPINNER_DIAMETERS` keys are now
    tied at compile time again: a size added to one and not the other fails
    `npm run lint` instead of rendering NaN geometry. They match today
    (sm/rg/md/xl).
  - Slider: `VARIANT_PAINTS[variant as SliderVariant]` → `VARIANT_PAINTS[variant]`.
  - `SHAPE_MORPH_SPINNER_SHAPES` is `readonly DsShapeComponent[]`; the internal
    default key list is `readonly Shapes[]`; `ShapeMorphSpinner`'s `shapes`
    and `MorphRotationShape`'s `shapes` (and its `useShapesKey`) take
    `readonly ShapeInput[]`. MorphRotationShape's header ("changing `shapes`
    remounts the inner component") still holds: type-only, the identity
    comparison is unchanged.
  - `buildYearOptions` reads `bounds?.from` / `bounds?.to` into locals instead
    of `bounds!.from!` / `bounds!.to!` (same truthiness, narrowed by the
    existing `hasFrom` / `hasTo`).
  - CalendarGrid imports `KeyboardEvent` by name instead of `React.KeyboardEvent`.
- **skipped (as it applies now):**
  - LoadingSpinner `as CSSProperties` style casts: the WI called the spokes
    cast a no-op because its object "holds no custom property". It now spreads
    `vars` (`--ds-spinner-time-scale`), as do the flat and star objects, so the
    cast is no longer a no-op on a custom-property-free literal. Left all three.
  - `DEFAULT_CALENDAR_PRESETS` / `DEFAULT_SPLIT_TRIGGER_PRESETS` → `readonly`,
    and the two DatePicker steps (`DatePickerSplitTrigger` `presets?: readonly
    CalendarPreset[]`; `DatePicker` `splitPresets?: readonly CalendarPreset[]`
    instead of `Parameters<typeof DatePickerSplitTrigger>[0]["presets"]`).
    `DatePicker/**` is outside this lane (F1 is editing DatePickerSplitTrigger),
    and making either default readonly before that prop is widened breaks
    `<DatePickerSplitTrigger presets={DEFAULT_…}>` (the constants doc tells
    consumers to do exactly that). Order to land: widen the two DatePicker props
    first, then flip both consts in Calendar/constants.ts:118 and :128.
- **consumer impact:** `SHAPE_MORPH_SPINNER_SHAPES.push()/.reverse()` etc. is
  now a type error (it would have rewritten every instance's default). A
  consumer annotation `const s: DsShapeComponent[] = SHAPE_MORPH_SPINNER_SHAPES`
  now fails; copy it (`[...SHAPE_MORPH_SPINNER_SHAPES]`). Every value the
  `shapes` props accepted before still compiles, plus readonly / `as const`
  arrays now do too. No emitted JS changes.
- **breaking:** no (map: patch). Type-level edge: the annotation case above —
  list it in the CHANGELOG `Changed` note.
- **verified:** lint exit 0. Source-level type probe
  (scratchpad `probe/probe.tsx`, paths → `src/index.ts`): the
  `@ts-expect-error` on `SHAPE_MORPH_SPINNER_SHAPES.reverse()` is used, and
  every "must keep compiling" line from W7b `probe60.tsx` (mutable arrays,
  the defaults passed back in, spreads, both DatePicker forms with today's
  `onValueChange`) plus `as const` key arrays into ShapeMorphSpinner and
  MorphRotationShape compile; exit 0. `rg "as SpinnerSizeKey|as SliderVariant|
  bounds!|React\.KeyboardEvent"` over LoadingSpinner/ProgressIndicator/Slider/
  Calendar → none.
- **docs owed:** CHANGELOG `[Unreleased]` → Changed:
  `SHAPE_MORPH_SPINNER_SHAPES` is a `readonly` array, so one consumer can no
  longer mutate the default for every instance; copy it to get a mutable
  array. `ShapeMorphSpinner` / `MorphRotationShape` `shapes` accept readonly
  arrays. (Add the two calendar defaults to the same note when they land.)

## Verification (whole batch)
- `npm run lint` → exit 0.
- Scoreboard before → after: raw `var(--ui-*)` inside className brackets
  5 → 0 (all were Slider.tsx). Every other number unchanged.
- WI-071 rg (`\[var\(--ui-|\[var\(--ds-|-\[[0-9]+px\]|max\(4px|calc\(-1` in
  Slider.tsx / LinearProgressIndicator.tsx) → 0 hits.
- WI-071 equivalence: old classes compiled with tailwindcss 4.3.3 vs the new
  helper declarations → 11/11 identical (scratchpad `cmp.cjs`).
- esbuild bundle of `src/index.ts` (scratchpad `bundle.cjs`): `AvatarSize.sm`
  → `sm`, `Shapes.clover` → `clover` (13 keys), `SHAPE_MORPH_SPINNER_SHAPES`
  length 6. SSR render of SliderStepped / LinearProgressIndicator shows the
  helper classes and no arbitrary values; a consumer `h-sm` on the progress
  root still replaces `h-linear-progress`.
- Not run: Storybook / build (per brief). Visual check owed to the
  orchestrator: Inputs/Slider (stepped glide, drag), Progress/
  LinearProgressIndicator, Avatar, OutlineSection, Progress/LoadingSpinner.

## DONE

### Orchestrator follow-up after wave F (2026-10-04): WI-120 readonly presets
- `DEFAULT_CALENDAR_PRESETS` and `DEFAULT_SPLIT_TRIGGER_PRESETS` are now `readonly CalendarPreset[]`.
- `DatePickerSplitTrigger` `presets` and `DatePicker` `splitPresets` accept `readonly CalendarPreset[]`; the `Parameters<…>` form is dropped. F3 could not reach these files from its lane.
- breaking: no. Widening a prop to readonly accepts every array it accepted before.
- verified: lint exits 0.
