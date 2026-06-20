---
name: dooph-ds-loading-indicators
description: Use when building, modifying, or debugging WavyDivider, LoadingSpinner, or ProgressIndicator. Covers the two-component model, animation architecture, polar wave path generation, shared geometry, and key constraints that prevent common mistakes.
---

# dooph Design System — Loading Indicators & WavyDivider

Three components form the M3E-inspired indicator family. They share geometry helpers and wave-path logic but are deliberately separate: `LoadingSpinner` is indeterminate (no `progress` prop), `ProgressIndicator` is determinate.

---

## Component Map

| Component           | Variant          | Prop surface                                               |
| ------------------- | ---------------- | ---------------------------------------------------------- |
| `WavyDivider`       | `high` \| `low`  | `variant`, `strokeWeight`, `className` + SVG spread        |
| `LoadingSpinner`    | `flat` \| `wavy` | `variant`, `color`, `size`, + SVG spread                   |
| `ProgressIndicator` | `flat` \| `wavy` | `progress` (0–1), `variant`, `color`, `size`, + SVG spread |

All enums follow the dot-accessible pattern required by architecture Rule 1:

```ts
LoadingSpinnerVariant.flat / .wavy
LoadingSpinnerColor.primary / .brand   // or arbitrary hex via color prop
LoadingSpinnerSize.sm / .rg / .md / .xl  // 16px / 22px / 32px / 40px diameter
WavyDividerVariant.high / .low
```

`ProgressIndicator` imports `LoadingSpinnerVariant`, `LoadingSpinnerColor`, and `LoadingSpinnerSize` directly — the same const objects, not copies.

---

## Sizes & Geometry

| Token                  | Size key | Diameter | Stroke width |
| ---------------------- | -------- | -------- | ------------ |
| `--ui-size-spinner-sm` | `sm`     | 16 px    | 2 px         |
| `--ui-size-spinner-rg` | `rg`     | 22 px    | 2.5 px       |
| `--ui-size-spinner-md` | `md`     | 32 px    | 3 px         |
| `--ui-size-spinner-xl` | `xl`     | 40 px    | 3 px         |

Values live in both `tokens.css` (`--ui-size-spinner-*`) and `spinnerGeometry.ts` (`SPINNER_DIAMETERS`, `SPINNER_STROKE_WIDTHS`). **Keep them in sync.**

**CRITICAL:** The CSS tokens are a consumer-facing contract, but the components render `<svg width={diameter}>` from the JS constants. **Changing tokens.css alone has no effect on rendered size.** You must update `SPINNER_DIAMETERS` (and `SPINNER_STROKE_WIDTHS`) in `spinnerGeometry.ts` to match.

`getSpinnerGeometry(size: SpinnerSizeKey)` in `spinnerGeometry.ts` computes everything a component needs. **Never hardcode pixel values or recompute geometry in components.**

Key derived values:

- `trackRadius = (diameter − strokeWidth) / 2`
- `indicatorRadius = trackRadius` (same — visual separation comes from round linecaps)
- `circumference = 2π × indicatorRadius`
- `waveAmplitude = strokeWidth × 0.4` — M3 ref: 1.6 px / 4 px stroke
- `waveBaseRadius = trackRadius − waveAmplitude` — outer peaks reach trackRadius exactly
- `gapLength = strokeWidth × 2` — mathematical gap so visual gap ≈ strokeWidth with round linecaps
- `waveFrequency`, `waveSteps` — per-size (see Wave Geometry below)

---

## M3 Discrete Arc Pattern

**Both LoadingSpinner and ProgressIndicator, flat and wavy alike, render two discrete arcs — never a full-circle background ring.**

The M3 gap spec: visual space between indicator arc endpoints and track arc endpoints = one stroke width. Because `strokeLinecap="round"` extends each arc end by `strokeWidth/2`, the mathematical gap must be `2 × strokeWidth` to achieve the correct visual gap. This value is pre-computed as `gapLength` in `getSpinnerGeometry`.

### Positioning formula

For a dash of length `L` starting at path-length `D` using pattern `[L, G]` (period = `L + G`):

```
strokeDasharray  = `${L} ${G}`
strokeDashoffset = L + G − D
```

**Why `L + G − D` and not `C − D`?** The incorrect `C − D` formula only works when the pattern period equals `C` (i.e., `[L, C−L]`). With pattern `[L, C]` (dash `L`, gap `C`), the period is `L + C`, so the offset must account for the full `L + C` period to correctly place the dash start at position `D`.

### Track arc derivation

```
activeLength = sweepFraction × circumference        // or progress × circumference for determinate
trackLength  = max(0, circumference − activeLength − 2 × gapLength)
trackStart   = activeLength + gapLength
// Correct formula: L + G − D where L=trackLength, G=circumference, D=trackStart
trackOffset  = trackLength + circumference − trackStart
```

At 0% progress: track covers almost the full circle (minus two small gaps at 12 o'clock).
At 100% progress: trackLength clamps to 0, track disappears.

---

## Wave Geometry

### Amplitude — subtle texture, not a dominant shape

```
waveAmplitude  = strokeWidth × WAVE_AMP_SCALE    // WAVE_AMP_SCALE = 0.4
waveBaseRadius = trackRadius − waveAmplitude      // outer peaks reach trackRadius
```

M3 reference at 48 px: 1.6 px amplitude / 4 px stroke = 0.4 ratio. This keeps the wave as a subtle texture. **Do not use the old formula `waveAmplitude = trackRadius × ratio` — it produces an overly aggressive wave at all sizes.**

### Per-size wave parameters

| Size | Frequency | Steps | Notes         |
| ---- | --------- | ----- | ------------- |
| `sm` | 3         | 30    | 10 steps/bump |
| `rg` | 5         | 50    | 10 steps/bump |
| `md` | 6         | 60    | 10 steps/bump |
| `xl` | 9         | 90    | 10 steps/bump |

Lower frequency = longer wavelength = more stretched, less frenetic wave appearance.

`WAVE_PARAMS` in `spinnerGeometry.ts`; exposed via `geo.waveFrequency` and `geo.waveSteps`. **There is no global `SPINNER_WAVE_FREQ` constant** — do not add one.

---

## WavyDivider

Pure SVG with a `<pattern>` element. No React state or animation.

- `width="100%"` fills any container without JS.
- `currentColor` for stroke — tint with `className="text-border"` or any text-color utility.
- `strokeWeight` passes through to the repeated path's `strokeWidth` and defaults to `var(--ui-stroke-border)`.
- The design wavelength is 15 units. The SVG high-frequency tile is 20 units, so design amplitude 6 scales to SVG amplitude 8.
- Two cubic bezier segments per tile are generated from the geometry constants; the control points overshoot by `4 / 3` so the actual midpoint peak/trough reaches the scaled amplitude.
- `useId()` generates a unique pattern ID per instance. **Never use a static `id` string.**

---

## LoadingSpinner — Animation Architecture

### Flat variant (rAF-driven, `<path>`-based)

Both arcs are `<path>` elements (`SVGPathElement` refs) whose `d` attribute is replaced every frame via `requestAnimationFrame` + direct `setAttribute`. **No `<circle>` elements, no `strokeDashoffset`.**

**Why `<path>` and not `<circle>` + dashoffset:**
SVG clips a dashed stroke at the path endpoint for `<circle>` elements. When the rotating arc position crosses 12 o'clock (the circle path's seam), the dash gets clipped to zero and re-appears on the other side as a new dash — producing a visual contraction/flash artefact with round linecaps. Direct arc coordinates have no seam.

**`flatArcPath(cx, cy, r, startAngle, sweepAngle)`** (module-level helper in `LoadingSpinner.tsx`):
```ts
function flatArcPath(cx, cy, r, startAngle, sweepAngle) {
  if (sweepAngle <= 0) return '';
  const sweep = Math.min(sweepAngle, 2 * Math.PI - 0.0001); // avoid degenerate full-circle
  const endAngle = startAngle + sweep;
  const x1 = cx + r * Math.cos(startAngle), y1 = cy + r * Math.sin(startAngle);
  const x2 = cx + r * Math.cos(endAngle),   y2 = cy + r * Math.sin(endAngle);
  return `M ${x1} ${y1} A ${r} ${r} 0 ${sweep > Math.PI ? 1 : 0} 1 ${x2} ${y2}`;
}
```

**Animation model (all angles, no path-lengths):**
```ts
const twoPi = 2 * Math.PI;
const gapAngle = gapLength / trackRadius;            // arc-length ÷ r = subtended angle

const sweepAngle = (MIN_SWEEP + (MAX_SWEEP - MIN_SWEEP) * easedPhase) * twoPi;
const arcEndAngle = SPINNER_START_ANGLE + (elapsed / DURATION) * 2 * twoPi; // 2 revs/cycle
const arcStartAngle = arcEndAngle - sweepAngle;

activeRef.setAttribute('d', flatArcPath(cx, cy, r, arcStartAngle, sweepAngle));

const trackSweep = twoPi - sweepAngle - 2 * gapAngle;
if (trackSweep > 0) {
  trackRef.setAttribute('d', flatArcPath(cx, cy, r, arcEndAngle + gapAngle, trackSweep));
} else {
  trackRef.setAttribute('d', '');
}
```

useEffect deps: `[cx, cy, trackRadius, gapLength]`

### Wavy variant (rAF + CSS rotation)

The SVG element rotates via `ds-spinner-rotate` (still needed — only keyframe that remains). The rAF loop updates **both** the wave `<path>` (`d` attribute) and the track `<circle>` (`stroke-dasharray` / `stroke-dashoffset`).

**Fixed-leading-edge animation:** the arc's leading edge is pinned at `SPINNER_START_ANGLE` (12 o'clock) in the SVG local frame. The arc sweeps *backward* from it by `sweepFraction × 2π`, so the trailing edge oscillates while the front stays put. CSS rotation then carries the leading edge forward continuously. This gives the same back-compact behaviour as the flat variant. Uses `SPINNER_WAVY_MAX_SWEEP` (0.50) — lower than the flat variant's 0.72 so the wave texture reads clearly at peak length.

```ts
// Fixed leading edge — arc ends at SPINNER_START_ANGLE, starts behind it:
const arcStart = SPINNER_START_ANGLE - sweepFraction * 2 * Math.PI;
pathRef.setAttribute('d',
  generateWavyArcPath(cx, cy, waveBaseRadius, sweepFraction, arcStart, ...));

// Track: leading edge is at position 0; track starts gapLength after it.
// Correct dashoffset: L + G − D where D = gapLength:
const sweepLength = sweepFraction * circumference;
const trackLength = Math.max(0, circumference - sweepLength - 2 * gapLength);
const trackOffset = trackLength + circumference - gapLength;
trackRef.setAttribute('stroke-dasharray', `${trackLength} ${circumference}`);
trackRef.setAttribute('stroke-dashoffset', String(trackOffset));
```

The track `<circle>` uses `transform={rotate(-90 cx cy)}` so position 0 = 12 o'clock = `SPINNER_START_ANGLE`.

useEffect deps: `[cx, cy, waveBaseRadius, waveAmplitude, waveFrequency, waveSteps, circumference, gapLength]`

**Why direct DOM mutation?** Path recomputation / dashoffset updates at 60 fps with React state would cause 60 React renders per second per component. `ref.setAttribute` skips the virtual DOM entirely. **Do not use `setState` inside a rAF loop.**

**Cleanup:** Always return `() => cancelAnimationFrame(frameId)` from `useEffect`. The rAF loop is infinite and leaks on unmount if not cancelled.

---

## ProgressIndicator

### Flat variant

Indicator arc: standard `[C, C]` dasharray pattern — `strokeDashoffset = C × (1 − progress)` makes the visible dash cover `[0, progress × C]`. Both `<circle>` elements carry a `300ms cubic-bezier(0.4, 0, 0.2, 1)` CSS transition so they animate smoothly together on `progress` change.

Track arc: computed in render (not rAF). Correct formula:
```
trackLength = max(0, circumference − activeLength − 2 × gapLength)
trackOffset = trackLength + circumference − (activeLength + gapLength)
```

At `progress = 0`: dashoffset = C → nothing visible for indicator. Track covers almost full circle.
At `progress = 1`: dashoffset = 0 → full-circle indicator. trackLength clamps to 0 → no track.

### Wavy variant

`generateWavyArcPath(cx, cy, waveBaseRadius, progress, SPINNER_START_ANGLE, waveAmplitude, waveFrequency, waveSteps)` in `useMemo`. Track arc computed in render alongside the path.

No CSS transition on the path (point count changes with progress; CSS cannot interpolate). Consumers that need smooth animation should drive `progress` gradually from a spring/animation loop.

useMemo deps: `[cx, cy, waveBaseRadius, progress, waveAmplitude, waveFrequency, waveSteps]`

---

## Wave Path Generation — `generateWavyArcPath`

In `src/components/LoadingSpinner/waveUtils.ts`. Polar sine wave polyline:

```
r(θ) = waveBaseRadius + waveAmplitude × sin(waveFrequency × θ)
x(θ) = cx + r(θ) × cos(θ)
y(θ) = cy + r(θ) × sin(θ)
```

Always pass `waveBaseRadius` as `baseRadius` (not `indicatorRadius` or `trackRadius`). Pass `SPINNER_START_ANGLE` as `startAngle`. `waveSteps` is full-circle sample count; the function scales it to the actual sweep fraction internally (min 8 samples).

Returns an empty string for `sweepFraction ≤ 0`. Guard before using as `<path d>`.

---

## Color System

```ts
LoadingSpinnerColor.primary  → var(--ui-color-primary)
LoadingSpinnerColor.brand    → var(--ui-color-brand)
<LoadingSpinner color="#e05252" />  // arbitrary hex passes through
```

Track always uses `var(--ui-color-border)` — never the indicator color.

---

## CSS Notes

`ds-spinner-rotate` in `src/styles/index.css` is the **only** loading-indicator keyframe. It is used exclusively by `WavySpinner` for SVG rotation. `ds-spinner-arc` was removed when `FlatSpinner` was converted to rAF. Do not re-add it.

Four size tokens in `tokens.css` (not `@theme inline`):
```css
--ui-size-spinner-sm: 16px;
--ui-size-spinner-rg: 22px;
--ui-size-spinner-md: 32px;
--ui-size-spinner-xl: 40px;
```

---

## Anti-Patterns

- **Do not render a full-circle track.** Both track and indicator must be discrete arcs with `gapLength` gaps. The full-circle track was replaced by the M3 discrete-arc pattern.
- **Do not use `trackRadius` or `indicatorRadius` as wave base radius.** Use `waveBaseRadius`. The old `amplitude = radius × ratio` formula clips the SVG viewBox.
- **Do not use `amplitude = indicatorRadius × 0.3` or any trackRadius-derived amplitude.** Amplitude must be `strokeWidth × 0.4`.
- **Do not use a global wave frequency constant.** `SPINNER_WAVE_FREQ` was removed. Use `geo.waveFrequency` and `geo.waveSteps`.
- **Do not use `<circle>` + `strokeDashoffset` for the flat spinner arcs.** SVG clips dashed strokes at the `<circle>` path endpoint (12 o'clock after rotate(-90)). When the rotating arc crosses this seam, the round-linecap ends produce a flash/contraction artefact. Use `<path>` elements with `flatArcPath()` instead.
- **Do not add `animation` CSS to the flat spinner or its paths.** The flat spinner is fully rAF-driven; CSS animation on those elements will fight the rAF loop.
- **Do not call `getSpinnerGeometry` multiple times per render.** Call once, destructure, pass as props.
- **Do not use React `setState` in any rAF loop.** Use `ref.setAttribute` for frame-by-frame mutations.
- **Do not forget `cancelAnimationFrame(frameId)` in every `useEffect` cleanup.**
- **Do not use a static SVG `id` for `<pattern>` or `<defs>`.** Always `useId()`.
