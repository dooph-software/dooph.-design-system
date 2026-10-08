# 07R2 — loader review fixes (Material spinner, progress-to-0 flash, WI-113)

Agent R2. Started 2026-10-04.

## Checklist
- [x] Baseline scoreboard (motion literals 0, "use client" 27, timers 5)
- [x] WI-113 ShapeMorphSpinner default size md → rg
- [x] WI-113 LoadingSpinner role status → progressbar
- [x] LoadingSpinner flat → Material circular indeterminate (CSS only) — code + header + tokens + sync-tokens done
- [x] ProgressIndicator flat: clean animation back to 0 — track offset now −(active+gap) (waveGeometry.ts)
- [x] lint exit 0; scoreboard unchanged (all metrics equal before → after); probe scripts

## Entry 1 — LoadingSpinner `flat` now runs Material's circular indeterminate animation
- **files:** `src/components/LoadingSpinner/LoadingSpinner.tsx` (header
  contract rewritten for the new behaviour; path is now two laps, starting one
  gap before 12 o'clock), `src/components/LoadingSpinner/spinnerGeometry.ts`
  (`SPINNER_MIN_SWEEP` 0.07 → 0.008; `SPINNER_MAX_SWEEP` stays 0.72, comment
  says why), `src/styles/index.css` (`@property --ds-spinner-phase` replaced by
  `--ds-spinner-grow` + `--ds-spinner-tail`; `.ds-spinner-flat*` rules;
  `ds-spinner-phase` keyframes replaced by `ds-spinner-dash`; reduced-motion
  rule also stops `.ds-spinner-flat-turn`), `src/styles/tokens.css`,
  `scripts/sync-theme.mjs` (the three spinner duration tokens recorded in
  `EXCLUDED`), `npm run sync-tokens` run (no spinner theme key emitted).
- **what changed:** the old flat arc grew/shrank on a cosine while its head
  made two turns per cycle, which made the tail look stuck while the head ran
  on. It is replaced by Material/MUI's recipe, CSS only: the arc group turns at
  a constant rate (`--ui-spinner-rotate-duration`, linear), and on the <svg>
  two registered numbers animate per `--ui-spinner-duration` on the standard
  curve per keyframe segment — grow 0 → 1 → 1 (min → max sweep) and tail
  0 → 0.118 → 0.985 of a turn (Material's offsets 0/−15/−125 rescaled from its
  126.9-unit circle). Sweep is clipped to 1 − tail, which is Material's "dash
  slides off the path end": the head holds while the tail chases it to a dot.
  The grey track is kept as the complement, a gap clear of each end. Both
  dashes stay strictly inside a two-lap open path (probe: path span 0.05–1.985
  turns at every size, track never shorter than 0.098 turn, never overlaps the
  arc), so no dash is ever cut by the seam. Max sweep kept at 0.72 rather than
  Material's ≈0.79: at `sm` 0.79 leaves the track ≈3 % of a turn (a dot). The
  dash easing is `--ui-motion-ease-standard` (0.4,0,0.2,1) — the scale has no
  plain ease-in-out, and Material's own standard curve is this one.
  Reduced motion: the arc freezes at its longest with its tail at 12 o'clock,
  no turn. Spokes and star are unchanged.
- **consumer impact:** the flat spinner looks and times like Material's.
  `--ui-spinner-duration` default 1800ms → 1400ms and now means one dash
  cycle (not "grow+shrink while the head makes two turns"). New token
  `--ui-spinner-rotate-duration: 1400ms` (one turn of the flat arc group).
  A consumer who overrode `--ui-spinner-duration` keeps a working spinner; the
  number now times the dash cycle only.
- **breaking:** no (token kept; one token added; value/feel change only).
- **verified:** lint exit 0; scoreboard unchanged; postcss parse of index.css
  lists the new rules/keyframes/@property; scratch probe of the dash maths over
  1001 frames at all four sizes (inside (0,2) laps, no overlap, track > 0).
  Not visually checked (orchestrator to check the Storybook Flat stories).
- **docs owed:** loading-indicators skill (`.agents` + `.claude` copies, and
  the consumer skill if it describes the flat arc): replace the "cosine sweep,
  head makes two turns" description with the Material recipe above, the
  two-lap path rule, and the new `--ui-spinner-rotate-duration` token; token
  contract / theming docs: add `--ui-spinner-rotate-duration`, update
  `--ui-spinner-duration`'s meaning and default (1400ms); CHANGELOG
  `[Unreleased]` → Changed: "LoadingSpinner flat now uses Material's circular
  indeterminate motion; `--ui-spinner-duration` is 1400ms and a new
  `--ui-spinner-rotate-duration` times the turn."

## Entry 2 — ProgressIndicator flat no longer flashes when progress returns to 0
- **files:** `src/components/ProgressIndicator/waveGeometry.ts`
  (`getWavyTrackGeometry` offset, plus its doc comment).
- **what changed:** cause: the track's dashoffset for progress > 0 was written
  as a positive wrap, `length + C − (active + gap)` (≈2C − 2·active), while the
  full circle at 0 uses offset 0. Statically identical, but `.ds-progress-arc`
  transitions dashoffset, so going back to 0 interpolated the offset across
  ≈2C: the track dash vanished mid-transition and regrew clockwise from
  12 o'clock over the shrinking indicator (probe: at rg, 0.3 → 0, the track is
  [0, 1.8] at 40 % and [0, 21.6] at 60 % while the indicator is still [0, 7–11]).
  This predates wave A (the old inline formula was the same); wave A's
  null-track change was not involved (null only near 1). Fix: offset is now
  the negative start, `−(active + gap)`, which is continuous with 0: the gap
  at the indicator's end closes as the indicator shrinks (probe: track
  [11.7, 58.8] at 50 % for 0.3 → 0, never over the indicator). The zero-length
  rule is untouched (track still `null` when its length is 0). Static renders,
  wavy included, are pixel-identical (same start modulo the dash period).
- **consumer impact:** animating flat ProgressIndicator to 0 is clean.
- **breaking:** no.
- **verified:** lint exit 0; scratch probe simulating the CSS lerp of
  dasharray/dashoffset, old vs new, at 0.1/0.3/0.6 → 0. Not visually checked.
- **docs owed:** loading-indicators skill, where it states the track offset
  formula (`L + G − D`): replace with `−(active + gap)` and the reason.

## Entry 3 — Both indeterminate loaders: role `progressbar`, default size `rg` [WI-113, F-072]
- **files:** `src/components/LoadingSpinner/LoadingSpinner.tsx` (role
  `status` → `progressbar`, header documents it),
  `src/components/ShapeMorphSpinner/ShapeMorphSpinner.tsx` (default `size`
  `md` → `rg`; its header names no default size, so it stays true).
- **what changed:** LoadingSpinner now renders `role="progressbar"` with no
  `aria-valuenow` (indeterminate, ARIA 1.2); `aria-label="Loading"` still sits
  before `...props`, so a consumer's label wins. ShapeMorphSpinner defaults to
  22 px like LoadingSpinner and ProgressIndicator.
- **consumer impact:** tests using `getByRole("status")` for LoadingSpinner
  must query `getByRole("progressbar")`; screen readers no longer announce it
  as a live region. ShapeMorphSpinner without `size` renders 22 px instead of
  32 px (unreleased component, so no shipped consumer is affected).
- **breaking:** no (minor, per WI-113: the role change is behavioural;
  ShapeMorphSpinner's default never shipped).
- **verified:** lint exit 0. WI-113's probe (`W7b/51-loaders.cjs`) needs a
  build of this tree; not run (no build in this checkout).
- **docs owed:** WI-113 steps 4–5: both loading-indicators SKILL.md copies get
  "Both indeterminate loaders render `role="progressbar"` with no
  `aria-valuenow` and default to `size={LoadingSpinnerSize.rg}` (22 px)."
  after line 8; CHANGELOG `[Unreleased]` → Changed: "`LoadingSpinner` renders
  `role="progressbar"` (was `role="status"`), matching `ShapeMorphSpinner` and
  `ProgressIndicator`. A test that finds the spinner with
  `getByRole("status")` should query `getByRole("progressbar")`." REMEDIATION
  board: WI-113 → review.

## DONE
