# @visx/brush

<a title="@visx/brush npm downloads" href="https://www.npmjs.com/package/@visx/brush">
  <img src="https://img.shields.io/npm/dm/@visx/brush.svg?style=flat-square" />
</a>

A React/SVG brush for selecting a sub-region of a chart or axis. On selection it inverts pixel
coordinates back to scale **domain** values and fires callbacks.

## Installation

```
npm install --save @visx/brush
```

Peers: `react` (`^18 || ^19`), and `@types/react` if you use TypeScript.

## Exports

- **`Brush`** — the only mountable component (a class component).
- **Types:** `BrushProps`, `Bounds`, `BrushShape`, `ResizeTriggerAreas`, `BrushHandleRenderProps`,
  `BaseBrushProps`, `BaseBrush` (type-only, e.g. for `useRef<BaseBrush | null>`), etc.

## Usage

Render `Brush` inside an `<svg>` over your chart; `width`/`height` are the inner (margin-subtracted)
plotting area and the scales' ranges should match. `onChange`/`onBrushEnd` receive `Bounds | null`
with **domain** values: continuous scales fill `x0`/`x1`/`y0`/`y1` (via `.invert`); band/ordinal
scales fill `xValues`/`yValues` arrays instead (with `x0`/`x1` falling back to `0`).

```tsx
import { Brush } from '@visx/brush';
import type { Bounds } from '@visx/brush';
import { scaleTime, scaleLinear } from '@visx/scale';

const xScale = scaleTime<number>({ range: [0, width], domain: [start, end] });
const yScale = scaleLinear<number>({ range: [height, 0], domain: [0, 100] });

<svg width={width} height={height}>
  <Brush
    xScale={xScale}
    yScale={yScale}
    width={width}
    height={height}
    brushDirection="horizontal"
    resizeTriggerAreas={['left', 'right']}
    onChange={(bounds: Bounds | null) => setSelection(bounds)} // { x0, x1, y0, y1, ... } | null
    onBrushEnd={(bounds) => console.log('end', bounds)}
  />
</svg>;
```

## Notes (v4)

- `initialBrushPosition` is in **pixel/range** coords (compute with `scale(value)`), while callbacks
  return **domain** values — this asymmetry is intentional.
- `brushDirection` defaults to `'horizontal'`; in that mode `y0`/`y1` span the full domain.
- Callbacks receive `null` when the selection is cleared (idle extent).
- For band/ordinal scales (no `.invert`), read `xValues`/`yValues` arrays, not `x0`/`x1`.
- For imperative control (`reset`, `updateBrush`, `getExtent`) pass `innerRef`
  (`MutableRefObject<BaseBrush | null>`). Set `useWindowMoveEvents` so a drag survives the pointer
  leaving the stage. Import only from the package root (`@visx/brush`).
