# 05c — LoadingSpinner: CSS-driven rebuild + `star` variant (batch 05, agent c)

Status: done.

## Progress (write-to-disk-first)
- [x] 0. Baseline scoreboard: m1 0 · m7 ("use client") 28 · m8 (JS timers) 8, LoadingSpinner.tsx 2
- [x] 1. Tokens: `--ui-spinner-duration`, `--ui-spinner-spokes-duration` in tokens.css (+ sync-tokens; no theme key — the name maps to nothing, so sync-theme needed no EXCLUDED entry)
- [x] 2. CSS helpers + `@property --ds-spinner-phase` + reduce rules in index.css
- [x] 3. spinnerGeometry.ts: drop JS durations, add spin-scale / star-fit geometry
- [x] 4. LoadingSpinner.tsx rebuild (no rAF, no hooks, no "use client") + `star`
- [x] 5. constants.ts `LoadingSpinnerVariant.star`; stories
- [x] 6. lint exit 0; scoreboard after: m8 8 → 6, m7 −1 from this change (see verified)

---
### The loading spinner now animates in CSS, on two spinner tokens, and holds still under reduced motion [WI-050, F-034]
- files: `src/components/LoadingSpinner/LoadingSpinner.tsx`,
  `src/components/LoadingSpinner/spinnerGeometry.ts`,
  `src/components/LoadingSpinner/constants.ts` (flat JSDoc only),
  `src/styles/tokens.css` (two tokens), `src/styles/index.css`
  (`@property --ds-spinner-phase`, `.ds-spinner-*` helpers, `ds-spinner-phase` keyframes,
  the keyframes comment).
- what changed:
  - The flat spinner used to run an endless `requestAnimationFrame` loop that
    rewrote both arc paths every frame, with its cycle (1800ms) and cosine easing
    in JS, and no reduced-motion path. It is now pure CSS on the Rule 6 escape
    hatch MorphRotationShape uses: one registered number, `--ds-spinner-phase`,
    runs 0 → 1 per `--ui-spinner-duration` on `--ui-motion-ease-linear`. The
    arc's length is computed from it in CSS with the SAME cosine
    (`min + (max − min) × (1 − cos(phase turn)) / 2`, via CSS `cos()`), and the
    arc group turns `phase × 2turn`, so length and turn cannot drift apart.
    Both arcs are dashes on one open circle path that starts half a gap past
    12 o'clock (inside the head gap, which never moves in the turning frame), so
    neither dash ever crosses the path's seam — the round-cap flash the rAF
    version was built to avoid stays avoided. Checked numerically: at all four
    sizes and 200 phases, every arc end matches the old JS arc ends to ~1e-15 rad
    and both dashes stay strictly inside the path.
  - Spokes: its turn was an inline-style `animation` with a JS-computed duration
    (1280ms × √(diameter/22), rounded). It is now the `.ds-spinner-spin` helper:
    `--ui-spinner-spokes-duration × --ds-spinner-time-scale`, where the factor
    (still √(diameter/22)) is geometry passed as a number. The turn moved from the
    root `<svg>` to an inner `<g>` (same centre), so a consumer's own `transform`
    on the root no longer fights the animation.
  - New tokens: `--ui-spinner-duration: 1800ms`, `--ui-spinner-spokes-duration: 1280ms`
    (loop cycle times, off the scale like `--ui-shimmer-duration`).
    Removed internal JS constants `SPINNER_ANIM_DURATION`, `SPINNER_SPOKES_DURATION`
    and the `spokesDuration` geometry field (replaced by `spinTimeScale` and
    `SPINNER_SPIN_EXPONENT`). None was public (spinnerGeometry is not exported
    from `src/index.ts`; the package exports only `.`).
  - Reduced motion (new): flat holds a static frame at mid-cycle (longest arc,
    72% of a turn, head at 12 o'clock, track filling the rest); spokes stop
    turning. The rule lives in the helper, as loops' reduce rules do.
  - Colours now go on via `style` (`stroke: …`) instead of the `stroke`
    presentation attribute, so `var(--ui-*)` colours never depend on a browser
    resolving `var()` inside an SVG attribute. Still through `resolveDsColor`.
  - `"use client"` removed: no hook, timer or listener remains (batch 04 policy).
    A header contract was added (the seam rule and the "track never reaches zero
    length" rule are invariants a reasonable edit would break).
- what should look the SAME (orchestrator visual check):
  - flat, every size and colour: arc shape, stroke widths, round caps, the
    one-stroke-width gaps at both ends, the grey track, the grow/shrink rhythm,
    two head turns per cycle, cycle length. Compare `Default`, `AllSizes`,
    `Colors`, `AllVariantsAndColors` against the previous build frame-for-frame
    in feel; the maths is identical.
  - spokes: identical look and speed per size.
- what DIFFERS:
  - flat now paints on the server-rendered/first frame (before: empty paths
    until the first rAF tick after hydration).
  - spokes turn durations are no longer rounded to whole ms (sm 1091.6 vs 1092,
    md 1543.9 vs 1544) — invisible.
  - under `prefers-reduced-motion: reduce`, flat is a still three-quarter ring and
    spokes are still (before: both kept spinning).
  - needs CSS `cos()` and `@property` (same baseline MorphRotationShape already
    requires). Without the DS stylesheet the flat variant draws two full
    overlapping rings instead of arcs.
- consumer impact: none at the API. Retuning speed is now a token override
  (`--ui-spinner-duration`, `--ui-spinner-spokes-duration`).
- breaking: no
- verified: `npm run lint` exit 0. Scoreboard m8 (JS timers) 8 → 6
  (LoadingSpinner.tsx's two rAF uses gone; 0 left there). m7 ("use client") reads
  28 → 28 overall: LoadingSpinner.tsx −1, while agent 05e's new
  `Toggle/FancyToggleSwitch.tsx` +1 landed at the same time. m1 stays 0 (no `Nms`
  literal outside tokens.css). Numeric equivalence check of the dash model vs
  the old JS arcs (script run in scratch, all sizes). No Storybook/build run, per
  brief.
- docs owed:
  - `.agents/skills/dooph-ds-loading-indicators/SKILL.md`: rewrite "LoadingSpinner —
    Animation Architecture" (rAF model → CSS phase model), the component-map row
    and enum list (add `star`), "LoadingSpinner is the only one … client module"
    (no longer), the CSS Notes ("ds-spinner-rotate is the only keyframe"; now
    also `ds-spinner-phase`), and the anti-patterns that forbid CSS animation on
    the flat spinner and require `cancelAnimationFrame`. Keep the `<circle>` seam
    anti-pattern (still true).
  - architecture Rule 6: name LoadingSpinner beside MorphRotationShape as a CSS
    escape-hatch user (WI-050's rule-text step).
  - shipped usage skill + CHANGELOG: `LoadingSpinnerVariant.star`, the two new
    tokens, reduced-motion behaviour.
  - REMEDIATION: WI-050 can move to `review` (not edited here; outside this lane).

### New `LoadingSpinnerVariant.star` — a spinning star [Figma 907:2182, maintainer answers]
- files: `src/components/LoadingSpinner/constants.ts`, `LoadingSpinner.tsx`,
  `spinnerGeometry.ts`, `LoadingSpinner.stories.tsx`.
- what changed: a third variant renders `STAR_SHAPE_PATH` (reused from
  `Shapes/StarShape`, not a copy of Figma's 18-unit path), filled with `color`
  through `resolveDsColor`, turning at a constant linear rate on the same
  `.ds-spinner-spin` helper and per-size factor as spokes. All four sizes.
  Static under reduced motion.
  - Fit: the star's bounds are scaled to `ACTIVE_INDICATOR_SCALE` (38/48) of the
    box — imported from `MorphRotationShape/geometry`, the ratio ShapeMorphSpinner
    draws its shapes at, so the two cannot drift. The star's farthest points
    from its centre are its tips, which also set its bounds (checked: max
    radius 10.4968 = half-extent 10.4968), so no extra rotation-safe reduction
    is needed and the turn stays inside the box. Star size per box: sm 12.7px,
    rg 17.4px, md 25.3px, xl 31.7px (79% of the box; Figma's single 24 frame
    showed 18/24 = 75% — the maintainer chose the shape-morph ratio instead).
- open, for the maintainer:
  - turn speed: the star uses the spokes' rate (`--ui-spinner-spokes-duration`
    scaled per size), because no speed was given. If it should differ, add a
    `--ui-spinner-star-duration` token.
  - colour default is `LoadingSpinnerColor.primary` (`--ui-color-primary`,
    #171717) like the other variants; Figma bound `text-primary` (#161616).
- stories: `Star`, `AllSizesStar`, `StarStaysInBox` (each size inside a 1px
  border drawn on its box — the turning star must never touch it), and a `star`
  row in `AllVariantsAndColors` with primary, prominent and an arbitrary
  `color="#e05252"` override.
- breaking: no (new option).
- verified: lint exit 0; geometry check above.
- docs owed: loading-indicators skill (variant + fit rule), shipped usage skill,
  CHANGELOG.

## DONE
