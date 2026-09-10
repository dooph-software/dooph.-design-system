---
name: dooph-ds-loading-indicators
description: Use when building, modifying, or debugging WavyDivider, LoadingSpinner, or ProgressIndicator. Covers spinner animation, Material-style rounded-wave geometry, shared sizing, and key constraints that prevent common mistakes.
---

# dooph Design System — Loading Indicators & WavyDivider

Three components form the M3E-inspired indicator family. `LoadingSpinner` is indeterminate (no `progress` prop), while `ProgressIndicator` is determinate and exclusively owns the circular rounded-wave geometry.

---

## Component Map

| Component           | Variant          | Prop surface                                               |
| ------------------- | ---------------- | ---------------------------------------------------------- |
| `WavyDivider`       | `high` \| `low`  | `variant`, `strokeWeight`, `className` + SVG spread        |
| `LoadingSpinner`    | `flat` \| `spokes` | `variant`, `color`, `size`, + SVG spread                  |
| `ProgressIndicator` | `flat` \| `wavy` | `progress` (0–1), `variant`, `color`, `size`, + SVG spread |

All enums follow the dot-accessible pattern required by architecture Rule 1:

```ts
LoadingSpinnerVariant.flat / .spokes
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
- `gapLength = strokeWidth × 2` — mathematical gap so visual gap ≈ strokeWidth with round linecaps

---

## M3 Discrete Arc Pattern

At non-zero progress, LoadingSpinner and both ProgressIndicator variants render two discrete arcs. ProgressIndicator deliberately renders a complete smooth circular track at 0%, then uses round-capped complementary track arcs above 0%.

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

At 0% progress: ProgressIndicator special-cases the track to a complete smooth circle.
At 100% progress: trackLength clamps to 0, track disappears.

---

## ProgressIndicator Wave Geometry

`src/components/ProgressIndicator/waveGeometry.ts` owns the wave. It ports the
shape model used by Material's `CircularWavyProgressIndicator`: a rounded star
with alternating outer and inner radii, not a sampled polar sine.

- Wavelength is 15 user units; wave count is `max(5, round(2πr / 15))`.
- The inner radius is `0.66 × outerRadius`; after corner rounding this keeps the
  wave readable at component scale without sharpening the vertices.
- Each alternating vertex is cut back along its adjoining edges and replaced
  with a tangent cubic curve. Outer corners use Material's `0.35` radius /
  `0.4` smoothing values; inner corners use the `0.5` radius.
- The full closed path is stable across progress values. `<path pathLength={1}>`
  plus a normalized dash reveals progress, avoiding changing point counts and
  asymmetric partial polylines.
- The first outer-corner cubic is split at its midpoint so the wave starts
  exactly at its rounded peak at 12 o'clock and proceeds clockwise.
- The empty/remainder track is always a separate smooth `<circle>` with round
  linecaps; it is never a gray copy of the wave.

---

## WavyDivider

Pure SVG with a `<pattern>` element. No React state or animation.

- `width="100%"` fills any container without JS.
- `currentColor` for stroke — tint with `className="text-border"` or any text-color utility.
- `strokeWeight` passes through to the repeated path's `strokeWidth` and defaults to `2` (px).
- Tile widths match the Figma node exactly: `high` = 20px period, `low` = 40px period. Both render in a fixed 12px band (`HEIGHT`).
- `AMPLITUDE` is a fixed `2.88` px (centerline peak from baseline, ~5.76px peak-to-peak) and is **not** a prop — keep it shallow per the Figma spec. The 12px band gives enough vertical headroom that strokes up to ~6px never clip the host container.
- Two cubic bezier segments per tile form one trough + one crest; the control points overshoot by `4 / 3` so the curve's midpoint peak/trough reaches `AMPLITUDE` exactly (independent of control-point x positions).
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

`createMaterialWaveGeometry(diameter, strokeWidth)` is memoized by those two
values. Its stable full path uses `pathLength={1}` and
`strokeDasharray="${progress} 1"` to reveal the active section.
`getWavyTrackGeometry` computes the circular remainder and returns `null` at
completion: a zero-length SVG dash with round linecaps still paints a dot, so
the 100% state must omit the track element.

---

## Color System

```ts
LoadingSpinnerColor.primary  → var(--ui-color-primary)
LoadingSpinnerColor.brand    → var(--ui-color-brand)
<LoadingSpinner color="#e05252" />  // arbitrary hex passes through
```

Track always uses `var(--ui-color-border-primary)` — never the indicator color.

---

## CSS Notes

`ds-spinner-rotate` in `src/styles/index.css` is the **only** loading-indicator keyframe. It is used by the spokes spinner. `ds-spinner-arc` was removed when `FlatSpinner` was converted to rAF. Do not re-add it.

Four size tokens in `tokens.css` (not `@theme inline`):
```css
--ui-size-spinner-sm: 16px;
--ui-size-spinner-rg: 22px;
--ui-size-spinner-md: 32px;
--ui-size-spinner-xl: 40px;
```

---

## Anti-Patterns

- **Do not render the wavy track as a gray wave.** The track is always an independent smooth circle with round linecaps.
- **Do not rebuild a partial wave path from sampled points.** Keep one closed rounded-star path and reveal it with the normalized dash.
- **Do not move wave fields back into LoadingSpinner geometry.** LoadingSpinner has only flat and spokes variants; wave geometry belongs to ProgressIndicator.
- **Do not use `<circle>` + `strokeDashoffset` for the flat spinner arcs.** SVG clips dashed strokes at the `<circle>` path endpoint (12 o'clock after rotate(-90)). When the rotating arc crosses this seam, the round-linecap ends produce a flash/contraction artefact. Use `<path>` elements with `flatArcPath()` instead.
- **Do not add `animation` CSS to the flat spinner or its paths.** The flat spinner is fully rAF-driven; CSS animation on those elements will fight the rAF loop.
- **Do not call `getSpinnerGeometry` multiple times per render.** Call once, destructure, pass as props.
- **Do not use React `setState` in any rAF loop.** Use `ref.setAttribute` for frame-by-frame mutations.
- **Do not forget `cancelAnimationFrame(frameId)` in every `useEffect` cleanup.**
- **Do not use a static SVG `id` for `<pattern>` or `<defs>`.** Always `useId()`.
