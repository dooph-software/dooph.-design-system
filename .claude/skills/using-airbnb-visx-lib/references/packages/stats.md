# @visx/stats

<a title="@visx/stats npm downloads" href="https://www.npmjs.com/package/@visx/stats">
  <img src="https://img.shields.io/npm/dm/@visx/stats.svg?style=flat-square" />
</a>

SVG distribution glyphs — `BoxPlot` and `ViolinPlot` — plus a `computeStats` helper that derives
five-number box-plot stats and histogram bins from a numeric array.

## Installation

```
npm install --save @visx/stats
```

Peers: `react` (`^18 || ^19`), and `@types/react` if you use TypeScript.

## Exports

- **Components:** `BoxPlot`, `ViolinPlot`
- **Helper:** `computeStats(numbers)` → `{ boxPlot, binData }` (whiskers use 1.5×IQR; bins use
  Freedman–Diaconis width)
- **Types:** `BoxPlotProps`, `ViolinPlotProps`, plus `BoxPlot` (an interface — collides by name with
  the component, which wins in the value namespace), `BinDatum`, `LineCoords`, `ChildRenderProps`,
  `SharedProps`

## Usage

Both glyphs require a `valueScale` (stat value → pixels) and are positioned along the categorical
axis manually via `left`/`top` — there is no built-in band scale. `BoxPlot` takes the five-number
summary; `ViolinPlot` takes binned `data` (default accessors read `d.count`/`d.value`).

```tsx
import { BoxPlot, ViolinPlot, computeStats } from '@visx/stats';
import { scaleLinear } from '@visx/scale';

const values = [4, 8, 15, 16, 23, 42, 7, 19, 30, 11];
const { boxPlot, binData } = computeStats(values);
const valueScale = scaleLinear<number>({
  domain: [Math.min(...values), Math.max(...values)],
  range: [300, 0], // inverted so larger values sit higher
});

<svg width={200} height={300}>
  <ViolinPlot data={binData} valueScale={valueScale} left={40} width={40}
    fill="#b3cde3" stroke="#2b8cbe" />
  <BoxPlot valueScale={valueScale} left={120} boxWidth={40}
    min={boxPlot.min} firstQuartile={boxPlot.firstQuartile} median={boxPlot.median}
    thirdQuartile={boxPlot.thirdQuartile} max={boxPlot.max} outliers={boxPlot.outliers}
    fill="#fff" stroke="#2b8cbe" strokeWidth={2} />
</svg>
```

## Notes (v4)

- Glyphs need explicit `left`/`top` positioning — compute it from a band/point scale outside, wrap
  per-category in a `<Group>`, and combine with `@visx/axis`.
- `horizontal` swaps which of `left`/`top` is the cross-axis offset.
- `ViolinPlot`'s default `count`/`value` accessors silently yield `0` for non-numbers — pass explicit
  accessors for other datum shapes; `data` should be ordered by value.
- `BoxPlot` `container`/`containerProps` render a transparent full-range `<rect>` for attaching
  `@visx/tooltip` handlers; `children` on either glyph fully overrides rendering.
- Uses `@visx/vendor/d3-shape` (ViolinPlot only). Import only from the package root (`@visx/stats`).
