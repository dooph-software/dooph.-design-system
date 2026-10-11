# Building a Chart from Primitives (Path A) — v4.0.0

The canonical recipe. All code below is adapted from REAL v4.0.0 demo sandboxes (cited), verified
against the tag — not invented. This is the reference for hand-composed visx charts.

## The 5-step recipe

1. **Dimensions & margins** → derive the inner drawing area (`xMax`/`yMax`).
2. **Scales** (`@visx/scale`) → map data domain → pixel range. Note y-range is inverted.
3. **Accessors** → functions pulling x/y values from each datum.
4. **Marks** inside a `<Group>` offset by the margins (`@visx/shape`, etc.).
5. **Chrome** → axes (`@visx/axis`), grid (`@visx/grid`), legend, tooltip as needed.

## Step 1-4: minimal bar chart (verbatim pattern from `visx-bars` sandbox)

```tsx
import { useMemo } from 'react';
import { Bar } from '@visx/shape';
import { Group } from '@visx/group';
import { scaleBand, scaleLinear } from '@visx/scale';
import { letterFrequency } from '@visx/mock-data';

const data = letterFrequency;
const getLetter = (d) => d.letter;            // x accessor (categorical)
const getFrequency = (d) => Number(d.frequency) * 100; // y accessor (numeric)

function BarChart({ width, height }) {
  const margin = { top: 20, right: 20, bottom: 40, left: 40 };
  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  // SCALES — object-config (NOT d3's chained API)
  const xScale = useMemo(
    () => scaleBand<string>({ range: [0, xMax], round: true, domain: data.map(getLetter), padding: 0.4 }),
    [xMax],
  );
  const yScale = useMemo(
    () => scaleLinear<number>({ range: [yMax, 0], round: true, // NOTE: [yMax, 0] — SVG y grows downward
        domain: [0, Math.max(...data.map(getFrequency))] }),
    [yMax],
  );

  if (width < 10) return null;
  return (
    <svg width={width} height={height}>
      <Group left={margin.left} top={margin.top}>
        {data.map((d) => {
          const letter = getLetter(d);
          const barWidth = xScale.bandwidth();
          const barHeight = yMax - (yScale(getFrequency(d)) ?? 0); // ?? 0 guards undefined scale output
          const barX = xScale(letter);
          const barY = yMax - barHeight;
          return <Bar key={`bar-${letter}`} x={barX} y={barY} width={barWidth} height={barHeight} fill="rgba(23,233,217,.5)" />;
        })}
      </Group>
    </svg>
  );
}
```

**Critical correctness points (all verified):**
- `@visx/shape` `Bar` is an **accessor-free styled `<rect>`** — YOU compute x/y/width/height from scales.
  (Other marks like `LinePath` DO take data+accessors — see below.)
- **y-range is inverted `[yMax, 0]`** because SVG y increases downward. Bars measure up from `yMax`.
- **Always guard scale output with `?? 0`** — `scaleLinear`/`scaleBand` can return `undefined`.
- `scaleBand` provides `.bandwidth()` for category width; categorical scales take `domain: string[]`.
- Memoize scales on their range/domain deps.

## Step 5: add axes (from `visx-threshold` sandbox)

```tsx
import { AxisLeft, AxisBottom } from '@visx/axis';

// inside the <Group> (or a Group positioned at the axis location):
<AxisLeft scale={yScale} />
<AxisBottom top={yMax} scale={xScale} />
```
- Axis components take a `scale` and position via `top`/`left`. `AxisBottom` is usually pushed to the
  chart bottom with `top={yMax}`.
- Style tick labels via `tickLabelProps` — **object form merges with defaults (your props win);
  function form `(value, index) => ({...})` BYPASSES defaults.** Per-orientation default label props differ.
- Directional axes (`AxisLeft/Right/Top/Bottom`) do NOT accept `orientation` (only the base `Axis` does).

## Lines & areas (from `visx-threshold` + `visx-area` sandboxes)

```tsx
import { LinePath, AreaClosed } from '@visx/shape';
import { curveBasis, curveMonotoneX } from '@visx/curve';
import { scaleTime, scaleLinear } from '@visx/scale';

// LinePath: data + x/y accessors + optional curve
<LinePath
  data={cityTemperature}
  curve={curveBasis}
  x={(d) => timeScale(date(d)) ?? 0}
  y={(d) => tempScale(value(d)) ?? 0}
  stroke="#222" strokeWidth={1.5}
/>

// AreaClosed: ALSO requires a `yScale` prop (to compute the baseline)
<AreaClosed
  data={stock}
  x={(d) => dateScale(getDate(d)) ?? 0}
  y={(d) => valueScale(getValue(d)) ?? 0}
  yScale={valueScale}           // <-- REQUIRED for AreaClosed, not for LinePath
  curve={curveMonotoneX}
  fill="url(#area-gradient)" stroke="url(#area-gradient)"
/>
```
- `curve` comes from `@visx/curve` (import the specific factory, e.g. `curveMonotoneX`). Default linear.
- `LinePath`/`Area` take `data` + accessor props `x`/`y`/`defined`. `AreaClosed` additionally needs `yScale`.

## Responsive sizing (`@visx/responsive`)

Charts need explicit width/height. Wrap in `ParentSize` to fill the container (from `visx-responsive`):

```tsx
import { ParentSize } from '@visx/responsive';

<div style={{ width: '100%', height: 400 }}>
  <ParentSize debounceTime={10}>
    {({ width, height }) => <BarChart width={width} height={height} />}
  </ParentSize>
</div>
```
- `ParentSize` is a **render-prop** giving `{ width, height }` (also `top`, `left`, `ref`).
- **v4 changes:** `ParentSize` now renders a two-div structure (fixes flex/grid infinite-growth);
  the hook `useParentSize` is a callback ref, returns `node`, and accepts `externalRef`. There's also
  `useScreenSize` (viewport) and `ScaleSVG` (uniform-scale an SVG).

## Tooltips (`@visx/tooltip` + `@visx/event`) — the canonical interactive pattern

Two wiring styles: the `useTooltip` hook or the `withTooltip` HOC. Real pattern from `visx-area`:

```tsx
import { withTooltip, TooltipWithBounds, defaultStyles } from '@visx/tooltip';
import { localPoint } from '@visx/event';
import { bisector } from '@visx/vendor/d3-array';

const bisectDate = bisector((d) => new Date(d.date)).left;

// 1) An invisible <Bar> over the plot captures pointer events:
<Bar x={margin.left} y={margin.top} width={innerWidth} height={innerHeight} fill="transparent"
     onMouseMove={handleTooltip} onMouseLeave={() => hideTooltip()}
     onTouchStart={handleTooltip} onTouchMove={handleTooltip} />

// 2) Handler converts pointer → data via localPoint + scale.invert:
const handleTooltip = (event) => {
  const { x } = localPoint(event) || { x: 0 };
  const x0 = dateScale.invert(x);              // pixel → domain (continuous scales have .invert)
  const index = bisectDate(stock, x0, 1);
  const d = /* nearest of stock[index-1], stock[index] */;
  showTooltip({ tooltipData: d, tooltipLeft: x, tooltipTop: valueScale(getValue(d)) });
};

// 3) Render the tooltip (positioned by tooltipLeft/tooltipTop), OUTSIDE the <svg>:
{tooltipData && (
  <TooltipWithBounds top={tooltipTop - 12} left={tooltipLeft + 12} style={{...defaultStyles}}>
    {`$${getValue(tooltipData)}`}
  </TooltipWithBounds>
)}
```
Equivalent with the hook: `const { tooltipData, tooltipLeft, tooltipTop, tooltipOpen, showTooltip, hideTooltip } = useTooltip();`

**Tooltip facts (verified):**
- `useTooltip()` → `{ tooltipOpen, tooltipLeft, tooltipTop, tooltipData, showTooltip, hideTooltip, updateTooltip }`.
- `withTooltip(Component)` injects those same values as props (`WithTooltipProvidedProps<TData>`).
- `localPoint(event)` → `{ x, y }` in the target SVG's coords; pair with `scale.invert(x)` (continuous scales only).
- **Categorical / band charts (bars):** `scaleBand` has **no `.invert`**, so the bisector+invert pattern
  above does NOT apply. Instead attach `onMouseMove`/`onMouseLeave` (and `onTouchMove`) to **each mark**
  (e.g. each `<Bar>`), and in the handler call `localPoint(event)` for position and pass that mark's
  bound datum straight to `showTooltip({ tooltipData: d, tooltipLeft, tooltipTop })`. The
  invert+bisector approach is only for continuous scales (time/linear) where you map a pointer x back
  to the nearest datum.
- `TooltipWithBounds` auto-flips near edges; plain `Tooltip` does not. `defaultStyles` is a base style object.
- For tooltips inside scrolled/overflow containers, use `useTooltipInPortal({ detectBounds: true })` →
  `{ containerRef (a CALLBACK ref), TooltipInPortal, containerBounds, forceRefreshBounds }`; attach
  `containerRef` to the wrapper and render `<TooltipInPortal top left>`.
- `@visx/tooltip/floating` is **4.1 — do not use** (absent in 4.0.0).

## SVG defs: gradients / patterns / clip-paths (id + url(#id))

```tsx
import { GradientTealBlue, LinearGradient } from '@visx/gradient';
<GradientTealBlue id="teal" />
<rect fill="url(#teal)" .../>
```
- Gradient/pattern/clip-path components render their OWN `<defs>` — **do not nest them in an outer `<defs>`**.
  Give each a unique `id`, reference via `fill={`url(#id)`}` / `clipPath={`url(#id)`}`.

## Composition order (typical render tree)
`<svg>` → defs (gradient/pattern/clip) → `<Group left top>` → grid → marks → axes → (overlay `<Bar>` for events).
Tooltip JSX renders **as a sibling of `<svg>`** (HTML div), not inside it.
