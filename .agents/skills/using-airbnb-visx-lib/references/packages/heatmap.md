# @visx/heatmap

<a title="@visx/heatmap npm downloads" href="https://www.npmjs.com/package/@visx/heatmap">
  <img src="https://img.shields.io/npm/dm/@visx/heatmap.svg?style=flat-square" />
</a>

SVG heatmap primitives that render a grid of color/opacity-scaled circles (`HeatmapCircle`) or rects
(`HeatmapRect`) from columnar bin data.

## Installation

```
npm install --save @visx/heatmap
```

Peers: `react` (`^18 || ^19`), and `@types/react` if you use TypeScript.

## Exports

- **Components:** `HeatmapCircle`, `HeatmapRect`
- **Types:** `HeatmapCircleProps`, `HeatmapRectProps`, `CircleCell`, `RectCell`, `GenericCell`,
  `ColorScale`, `OpacityScale`

## Usage

`data` is an array of columns, each with a `bins` array of rows. `xScale`/`yScale` are required and
receive **integer bin indices** (column/row), not data values — so size their `domain` to the bin
counts. `colorScale`/`opacityScale` receive each bin's `count`.

```tsx
import { HeatmapRect } from '@visx/heatmap';
import { scaleLinear } from '@visx/scale';

const data = [
  { bin: 0, bins: [{ bin: 0, count: 5 }, { bin: 1, count: 12 }] },
  { bin: 1, bins: [{ bin: 0, count: 8 }, { bin: 1, count: 3 }] },
];
const xMax = 200, yMax = 200;
const xScale = scaleLinear({ domain: [0, data.length], range: [0, xMax] });
const yScale = scaleLinear({ domain: [0, data[0].bins.length], range: [0, yMax] });
const colorScale = scaleLinear({ domain: [0, 12], range: ['#fff', '#1f77b4'] });
const opacityScale = scaleLinear({ domain: [0, 12], range: [0.1, 1] });

<svg width={xMax} height={yMax}>
  <HeatmapRect
    data={data}
    xScale={(i) => xScale(i) ?? 0}
    yScale={(i) => yScale(i) ?? 0}
    colorScale={colorScale}
    opacityScale={opacityScale}
    binWidth={xMax / data.length}
    binHeight={yMax / data[0].bins.length}
    gap={2}
  />
</svg>
```

## Notes (v4)

- `xScale`/`yScale` receive 0-based **indices**, not domain values — size the scale `domain` to bin counts.
- `colorScale` default is `() => undefined` (no fill unless you pass one); `opacityScale` default is `() => 1`.
- `gap` shrinks drawn size: circle `r = radius - gap`; rect `width = binWidth - gap`. A large `gap` can produce zero/negative dimensions.
- There is **no** `step` prop in v4.0.0 (an older README example shows one — it is ignored).
- The `children` render-prop receives a 2D `cells[column][row]` array and replaces default rendering. Import only from the package root.
