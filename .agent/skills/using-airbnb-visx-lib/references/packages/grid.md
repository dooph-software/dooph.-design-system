# @visx/grid

<a title="@visx/grid npm downloads" href="https://www.npmjs.com/package/@visx/grid">
  <img src="https://img.shields.io/npm/dm/@visx/grid.svg?style=flat-square" />
</a>

Chart gridlines — cartesian rows/columns and polar angle/radial — driven by `@visx/scale` or d3
scales.

## Installation

```
npm install --save @visx/grid
```

Peers: `react` (`^18 || ^19`), and `@types/react` if you use TypeScript.

## Exports

- **Cartesian:** `GridRows` (horizontal lines), `GridColumns` (vertical lines), `Grid` (both at once)
- **Polar:** `GridAngle` (spokes), `GridRadial` (concentric arcs), `GridPolar` (angle + radial)
- **Types:** `GridRowsProps`/`AllGridRowsProps`, `GridColumnsProps`/`AllGridColumnsProps`,
  `GridScale`, `GridLines`, `CommonGridProps` (note: `GridProps` and the polar prop types are **not**
  root-exported — rely on inference)

## Usage

`GridRows` takes `width` (line length); `GridColumns` takes `height`; `Grid` takes both plus `xScale`
and `yScale`. Band scales auto-center lines within each band. All grids accept a render-prop
`({ lines }) => …` to fully replace the default `<Line>` rendering.

```tsx
import { Grid, GridRows, GridColumns } from '@visx/grid';
import { scaleLinear } from '@visx/scale';

const xScale = scaleLinear({ domain: [0, 100], range: [0, 400] });
const yScale = scaleLinear({ domain: [0, 50], range: [200, 0] });

// Both axes at once
<Grid xScale={xScale} yScale={yScale} width={400} height={200}
  numTicksRows={5} numTicksColumns={5} stroke="#e0e0e0" />

// Or individually
<GridRows scale={yScale} width={400} numTicks={5} />
<GridColumns scale={xScale} height={200} numTicks={5} />
```

## Notes (v4)

- Defaults: `stroke='#eaf0f6'`, `strokeWidth=1`, `numTicks=10`.
- `tickValues` overrides `numTicks` (which is approximate, d3 algorithm).
- `Grid` uses per-axis prop names — `numTicksRows`/`numTicksColumns`, `rowTickValues`/
  `columnTickValues`, `xOffset`/`yOffset`, `rowLineStyle`/`columnLineStyle` — and wraps its output in
  a `<Group>` honoring `top`/`left`.
- `GridAngle`/`GridPolar` require a non-optional `outerRadius`; `GridRadial` renders `@visx/shape`
  `Arc`. Import only from the package root.
