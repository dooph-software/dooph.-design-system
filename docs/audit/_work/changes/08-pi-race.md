# 08 — ProgressIndicator flat: track vanishes / backtracks under rapid progress changes

Agent 08-pi-race. Started 2026-10-04.

## Checklist
- [x] Baseline scoreboard (motion literals 0, "use client" 27, timers 5)
- [x] CSS: `@property --ds-pi-progress` + `.ds-progress-ring*` helpers replace `.ds-progress-arc`
- [x] ProgressIndicator.tsx flat variant: one inline scalar, both circles always mounted; JSDoc
- [x] waveGeometry.ts doc comment (flat no longer uses it)
- [x] rest-state proof (before vs after) + interrupted-transition probe (Chromium)
- [x] lint exit 0, scoreboard unchanged

## Entry — ProgressIndicator flat animates from one value, so rapid changes stay clean
- **files:** `src/styles/dooph-component-tokens.css` (new
  `@property --ds-pi-progress` next to `--progress-pct`; `.ds-progress-arc`
  removed; new `.ds-progress-ring`, `.ds-progress-ring-indicator`,
  `.ds-progress-ring-track` with the derivation in a comment),
  `src/components/ProgressIndicator/ProgressIndicator.tsx` (flat variant +
  its JSDoc), `src/components/ProgressIndicator/waveGeometry.ts` (doc comment
  of `getWavyTrackGeometry` only — no code change).
- **what changed:** cause confirmed: both flat arcs transitioned
  stroke-dasharray AND stroke-dashoffset independently. When `progress`
  changed mid-flight, each of the four transitions restarted from its own
  interpolated value, so the track's length/offset disagreed with the
  indicator; and the track element was unmounted whenever its target length
  was 0 (≈ p > 0.87 at md) and remounted with no transition. Chromium probe
  of the OLD code (md, progress stepped every 50 ms through 0→1→0 then a
  random burst, 339 frames): track overlapping the indicator in 101 frames by
  up to 35.8 units, track absent mid-range in 32 frames.
  Fix: the <svg> sets one number, `--ds-pi-progress` (0–1), plus the fixed
  `--ds-pi-c` (circumference) and `--ds-pi-gap` (M3 gap, round-cap allowance
  included) inline. `.ds-progress-ring` transitions only `--ds-pi-progress`
  (`--ui-motion-duration-slow`, `--ui-motion-ease-standard` — same timing as
  before). Both arcs' dasharray/dashoffset are calc()s of it, so every frame
  is one consistent drawing. Both circles are always mounted; each arc's
  stroke-opacity is `clamp(0, length × 1000, 1)`, so a zero-length arc paints
  no round-cap dot and nothing remounts. Wavy variant untouched: it has no
  transition, so it does not share the bug.
  One deliberate rest-state difference: today's static drawing jumps at 0
  (full circle at 0, two full gaps at any p > 0), and a continuous animated
  drawing cannot keep that jump. The gaps now ramp in linearly over
  0 < p < 0.01 (track identical to today at p = 0 and at every p ≥ 0.01).
  The old transitions closed the gaps progressively too, so this keeps the
  clean return to 0 from the earlier fix (07R2 entry 2).
- **consumer impact:** rapid `progress` updates on the flat ring no longer
  make the grey track jump back or blink. Rest rendering unchanged except for
  sub-1 % values (smaller gaps). The internal helper class
  `.ds-progress-arc` is gone (internal; nothing else used it). A consumer
  `style` still merges last on the svg (it could override the three
  `--ds-pi-*` vars, which is unsupported).
- **breaking:** no.
- **verified:** `npm run lint` exit 0; scoreboard unchanged (all metrics
  equal before → after). Chromium (real CSS rules extracted from the file,
  served locally): rest-state computed dasharray/dashoffset of NEW vs OLD at
  p = 0, 0.01, 0.03, 0.08, 0.25, 0.5, 0.9, 0.95, 0.99, 1 for sm/rg/md/xl —
  max difference 0; track opacity 1 exactly where the old track existed and
  0 exactly where it was omitted; indicator opacity 0 only at p = 0, where
  the old indicator painted 0 pixels (canvas check). Interrupted-transition
  probe (same 339-frame sequence, transitions paused and stepped 16.7 ms per
  frame): every frame's track length/offset equals the formula of that
  frame's scalar (max error 5e-5), the track never faded or reached length 0
  for 0 < p < 0.8, and its leading end moved monotonically with the scalar.
  Tailwind CLI compile (to scratch, normal and --minify) keeps the
  @property and the calc()/clamp()/max() rules verbatim. Not checked in the
  live Storybook "Interactive" story (no server running) — orchestrator
  should drag the slider fast there.
- **docs owed:** loading-indicators skill (`.agents` + `.claude` copies, and
  the consumer skill if it says the same): the ProgressIndicator section says
  both circles carry a 300 ms dasharray/dashoffset transition — replace with
  "one registered number `--ds-pi-progress` transitions (motion scale slow /
  standard); both arcs are calc()s of it; arcs fade (stroke-opacity) rather
  than unmount at zero length"; the 0 % note should add that the gaps ramp in
  over the first 1 %. CHANGELOG `[Unreleased]` → Fixed: "ProgressIndicator
  flat: the track no longer jumps back or disappears when progress changes
  rapidly."

## DONE
