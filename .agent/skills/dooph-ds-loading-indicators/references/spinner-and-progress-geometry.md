# Spinner, progress ring and wavy divider geometry

All numbers are re-derivable: `src/components/LoadingSpinner/spinnerGeometry.ts` (`getSpinnerGeometry`), `src/components/ProgressIndicator/waveGeometry.ts`, `src/components/WavyDivider/WavyDivider.tsx`, and the CSS helpers named below.

## Two size spaces

- **User units**: `diameter` (`SPINNER_DIAMETERS`), and everything derived from it, goes into the `viewBox` and the numeric `width`/`height` attributes (the intrinsic size before CSS lands).
- **Rendered size**: `cssSize` = `var(--ui-size-spinner-<size>)`, applied as CSS `width`/`height` in `style`. Overriding the token resizes the whole drawing, because stroke, gaps and waves are fractions of the same user-unit space.

ShapeMorphSpinner has no user-unit table: it sets `width`/`height` to `var(--ui-size-spinner-<size>)` and MorphRotationShape fills that box.

## Roles

LoadingSpinner and ShapeMorphSpinner render `role="progressbar"` with no `aria-valuenow` (indeterminate) and `aria-label="Loading"`; a consumer's props override both. ProgressIndicator renders `role="progressbar"` with `aria-valuenow` = `round(progress × 100)`, `aria-valuemin` 0, `aria-valuemax` 100, and `aria-label="Progress"` by default. A consumer's `aria-label` replaces it; a consumer's `aria-labelledby` drops it, so the two names never compete.

## Per-size table (defaults)

`r = (d − stroke) / 2`, `C = 2πr`, `gap = 2 × stroke` (a visual gap of one stroke width once both round caps eat `stroke/2` each).

| Size | Token px | d (user units) | stroke | r | C | gap | gap / C | flat spinner track at max sweep (turns) | spokes/star factor | spokes/star turn | wave count | ring track gone from p ≥ | star (px) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| sm | 16 | 16 | 2 | 7 | 43.98 | 4 | 0.0909 | 0.098 | 0.853 | 1535 ms | 5 | 0.818 | 12.67 |
| rg | 22 | 22 | 2.5 | 9.75 | 61.26 | 5 | 0.0816 | 0.117 | 1 | 1800 ms | 5 | 0.837 | 17.42 |
| md | 32 | 32 | 3 | 14.5 | 91.11 | 6 | 0.0659 | 0.148 | 1.206 | 2171 ms | 6 | 0.868 | 25.33 |
| xl | 40 | 40 | 3 | 18.5 | 116.24 | 6 | 0.0516 | 0.177 | 1.348 | 2427 ms | 8 | 0.897 | 31.67 |

- Flat spinner track at max sweep = `1 − SPINNER_MAX_SWEEP − 2·gap/C`. It must stay above 0 at every size (header contract).
- Spokes/star factor = `(d / 22) ^ 0.5` (`SPINNER_SPIN_EXPONENT`); the turn is `--ui-spinner-spokes-duration` (1800ms) × factor, computed in CSS.
- Ring track gone from p ≥ `1 − 2·gap/C`: the progress at which the remainder track has no length (flat fades it, wavy omits it).
- Star = `ACTIVE_INDICATOR_SCALE` (38/48) of the box.

## LoadingSpinner, flat

**Path.** One OPEN path, two clockwise laps of the track circle (four half-arc `A` commands, no `Z`), starting one gap before 12 o'clock: start angle `−π/2 − gap/r`. Both arcs are dashes on this one path (`twoLapCirclePathFrom`).

**Inline numbers on the `<svg>`** (plain numbers, no units): `--ds-spinner-c` = C, `--ds-spinner-gap` = gap / C, `--ds-spinner-sweep-min` = 0.008, `--ds-spinner-sweep-max` = 0.72.

**Animated numbers** (registered `<number>`, inherited), keyframes `ds-spinner-dash` over `--ui-spinner-duration` (1400ms), on `--ui-motion-ease-standard` per segment:

| Keyframe | `--ds-spinner-grow` | `--ds-spinner-tail` (turns) |
|---|---|---|
| 0% | 0 | 0 |
| 50% | 1 | 0.118 |
| 100% | 1 | 0.985 |

These are Material's dash 1 → 100 → 100 and offset 0 → −15 → −125, rescaled from its 126.9-unit circle.

**Per path** (`.ds-spinner-flat-arc` and friends, `src/styles/index.css`):

```
sweep          = min(sweepMin + (sweepMax − sweepMin) × grow,  1 − tail)
indicator dash = sweep·C,                      gap of 2C
indicator off  = −(gap + tail)·C
track dash     = max(0, (1 − sweep − 2·gap)·C), gap of 2C
track off      = −(tail + sweep + 2·gap)·C
```

The `1 − tail` clip holds the head at the end of the first lap while the tail chases it. The arc covers path positions `[gap + tail, gap + tail + sweep]` and the track `[tail + sweep + 2·gap, tail + 1]`, both strictly inside `(0, 2)` laps, so neither dash reaches the path's ends. Each dash pattern's gap is 2C, so no second dash appears.

**Turn.** `.ds-spinner-flat-turn` rotates the `<g>` one turn per `--ui-spinner-rotate-duration` (1400ms), linear: a loop independent of the dash cycle.

**Reduced motion.** Both animations stop; `grow: 1`, `tail: 0`, so the arc rests at its longest (0.72) from 12 o'clock.

## LoadingSpinner, spokes and star

- Spokes: eight stroked paths in a 24-unit viewBox, stroke = `var(--ui-icon-stroke-width)`, colour on `stroke`.
- Star: `STAR_SHAPE_PATH` (24-unit box, bounds x 1.5–22.4936, y 1.5064–22.4937), filled with `color`, transformed by `STAR_FIT_TRANSFORM` = scale `STAR_FIT_SCALE` (≈ 0.905 = (38/48) × 24 / 20.9936) about (12, 12). Its tips are both its farthest points from the centre and its bounds, so it stays in the box at any angle (story `StarStaysInBox`).
- Both turn an inner `<g>` with `.ds-spinner-spin`: `ds-spinner-rotate` over `--ui-spinner-spokes-duration × --ds-spinner-time-scale`, linear. Reduced motion: no turn.

## ProgressIndicator, flat

The `<svg>` carries `.ds-progress-ring` and sets inline: `--ds-pi-progress` = progress, `--ds-pi-c` = C, `--ds-pi-gap` = gap (user units), `--ds-pi-gap-on` = `progress > 0 ? 1 : 0`.

- `--ds-pi-progress` is registered (`<number>`, `src/styles/dooph-component-tokens.css`) and is the ONLY transitioned value: `--ui-motion-duration-slow` (300ms), `--ui-motion-ease-standard`.
- `--ds-pi-gap-on` is unregistered, so it never transitions: the end gaps switch on or off at once, from the target value.
- Both `<circle>`s are rotated −90° (start at 12 o'clock) and always mounted.

```
indicator: dasharray C,  dashoffset C·(1 − p),  opacity clamp(0, C·p·1e6, 1)
gapNow   = gap × gapOn
trackLen = C·(1 − p) − 2·gapNow
track:     dasharray max(0, trackLen) C,  dashoffset −(C·p + gapNow),
           opacity clamp(0, trackLen·1e6, 1)
```

At p = 0 the track is the full circle (gapOn 0, offset 0). The offset is the negative start, `−(active + gap)`, which is continuous with the full circle at 0. Under reduced motion the global block collapses `slow` to 1ms.

## ProgressIndicator, wavy

- **Indicator**: one closed path for the whole circle from `createMaterialWaveGeometry(d, stroke)`, revealed by `pathLength={1}` and `strokeDasharray="{progress} 1"`. It is not rendered at p = 0 and has no transition: the consumer drives `progress` gradually for motion.
- **Wave path**: a star with `2 × waveCount` vertices alternating radius 1 and 0.66 (unit space), starting at 12 o'clock. `waveCount = max(5, round(2π·r / 15))`. Each vertex is cut back along both edges by `radius / tan(angle / 2) × (1 + smoothing)` and replaced by a tangent cubic: outer corners radius 0.35, smoothing 0.4; inner corners radius 0.5, no smoothing. Cut lengths that would cross on a shared edge are scaled down together, so every lobe is identical. The rounded shape is then scaled so each outer lobe's midpoint reaches `r`, and the path starts at the midpoint of the first outer lobe (12 o'clock).
- **Track**: a smooth `<circle>` from `getWavyTrackGeometry(p, C, gap)`. At p = 0: length C, offset 0. Otherwise: length `max(0, C − C·p − 2·gap)`, offset `−(C·p + gap)`. When the length is 0, it returns `null` and the track is not rendered.

## WavyDivider

- `<svg width="100%" height="12">` filled by a `<rect>` painted with a `<pattern>` (`patternUnits="userSpaceOnUse"`), so the wave tiles to any width with no measuring. The pattern id comes from `useId()`, so several dividers never collide.
- Tile width: `high` 20, `low` 40. One period per tile: a trough, then a crest, centred at y = 6.
- Amplitude 2.88. The cubic control points sit at `±2.88 × 4/3`, so each half-wave's midpoint peaks exactly at 2.88.
- `strokeWeight` (default 2) sets the path's `strokeWidth`; the stroke is `currentColor` with round caps. The root is `role="presentation"` and `aria-hidden`.
