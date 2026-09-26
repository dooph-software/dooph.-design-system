# @visx/shape

<a title="@visx/shape npm downloads" href="https://www.npmjs.com/package/@visx/shape">
  <img src="https://img.shields.io/npm/dm/@visx/shape.svg?style=flat-square" />
</a>

Shapes are the core marks of `visx` — bars, lines, areas, arcs, and links. Most of what you see on
screen is built from these primitives.

## Installation

```
npm install --save @visx/shape
```

Peers: `react` (`^18 || ^19`), and `@types/react` if you use TypeScript.

## Exports

- **Bars:** `Bar`, `BarRounded`, `BarGroup`, `BarGroupHorizontal`, `BarStack`, `BarStackHorizontal`, `Stack`
- **Lines/areas:** `Line`, `LinePath`, `LineRadial`, `SplitLinePath`, `Area`, `AreaClosed`, `AreaStack`
- **Arc/pie/poly:** `Arc`, `Pie`, `Circle`, `Polygon`
- **Links** (node-link edges): `LinkHorizontal`/`LinkVertical`/`LinkRadial` and their
  `…Curve`/`…Line`/`…Step` variants
- **Helpers:** `getX`, `getY`, `getSource`, `getTarget`, `stackOffset`, `stackOrder`,
  d3 factories `arc`, `area`, `line`, `pie`, `stack`, `radialLine`
- **Types:** every component's `…Props` (e.g. `BarProps`, `LinePathProps`, `AreaProps`), plus
  `Accessor`, `PositionScale`, `SeriesPoint`

## Usage

`Bar` is an accessor-free styled `<rect>` — you compute geometry from scales. `LinePath`/`Area` take
`data` plus `x`/`y` accessors. `AreaClosed` additionally needs a `yScale` prop (for the baseline).
Curves are imported from `@visx/curve`.

```tsx
import { Bar, LinePath, AreaClosed } from '@visx/shape';
import { curveMonotoneX } from '@visx/curve';
import { scaleLinear } from '@visx/scale';

// Bar — you compute x/y/width/height (note inverted y: bars grow up from yMax)
<Bar x={xScale(label)} y={yMax - barHeight} width={xScale.bandwidth()} height={barHeight} fill="#4f46e5" />

// LinePath — data + accessors (+ curve). Guard scale output with ?? 0
<LinePath data={data} x={(d) => xScale(getX(d)) ?? 0} y={(d) => yScale(getY(d)) ?? 0}
  curve={curveMonotoneX} stroke="#222" strokeWidth={1.5} />

// AreaClosed — also pass yScale
<AreaClosed data={data} x={(d) => xScale(getX(d)) ?? 0} y={(d) => yScale(getY(d)) ?? 0}
  yScale={yScale} curve={curveMonotoneX} fill="#4f46e5" />
```

## Notes (v4)

- `Bar` carries no accessors — for a bar chart, map over data and compute each `Bar`'s geometry.
- `AreaClosed` requires `yScale`; `LinePath`/`Area` do not.
- `curve` comes from `@visx/curve` (e.g. `curveBasis`, `curveMonotoneX`); default is linear.
- Uses `d3-shape` v3 via `@visx/vendor`. Import only from the package root (`@visx/shape`).
