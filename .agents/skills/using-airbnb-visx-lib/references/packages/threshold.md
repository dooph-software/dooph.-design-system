# @visx/threshold

<a title="@visx/threshold npm downloads" href="https://www.npmjs.com/package/@visx/threshold">
  <img src="https://img.shields.io/npm/dm/@visx/threshold.svg?style=flat-square" />
</a>

Renders a difference chart / threshold area that highlights the delta between two bounds (upper `y1`,
lower `y0`), splitting the fill into above- and below-threshold regions that are styled independently.

## Installation

```
npm install --save @visx/threshold
```

Peers: `react` (`^18 || ^19`), and `@types/react` if you use TypeScript.

## Exports

- **Component:** `Threshold`
- **Types:** `ThresholdProps<Datum>` is exported from `./Threshold` but **not** re-exported at the
  package root — it is not importable from `@visx/threshold`.

## Usage

You compute geometry from scales. `x`, `y0`, `y1`, `clipAboveTo`, and `clipBelowTo` are all required
(the in-code defaults are inert — pass them explicitly). Give `id` a unique value: the internal
clipPath ids derive from it and collide otherwise. Style each region via `aboveAreaProps` /
`belowAreaProps`. `curve` comes from `@visx/curve`.

```tsx
import { Threshold } from '@visx/threshold';
import { scaleLinear } from '@visx/scale';
import { curveBasis } from '@visx/curve';

type Row = { date: number; ny: number; sf: number };
const data: Row[] = [/* ... */];
const xScale = scaleLinear({ domain: [0, 10], range: [0, 400] });
const yScale = scaleLinear({ domain: [0, 100], range: [300, 0] });

<svg width={400} height={300}>
  <Threshold<Row>
    id="threshold-1"
    data={data}
    x={(d) => xScale(d.date)}
    y0={(d) => yScale(d.sf)}
    y1={(d) => yScale(d.ny)}
    clipAboveTo={0}
    clipBelowTo={300}
    curve={curveBasis}
    belowAreaProps={{ fill: 'violet', fillOpacity: 0.4 }}
    aboveAreaProps={{ fill: 'green', fillOpacity: 0.4 }}
  />
</svg>;
```

## Notes (v4)

- `ThresholdProps` is NOT root-exported — type the component generic instead (`<Threshold<Row> …>`).
- `id` must be unique; clipPath ids (`threshold-clip-above|below-${id}`) collide otherwise.
- `aboveAreaProps`/`belowAreaProps` are spread last, so they override the internal `strokeWidth={0}`
  default; they accept full `@visx/shape` `AreaProps` plus SVG `<path>` attributes.
- Depends on `@visx/shape` (`Area`) and `@visx/clip-path` (`ClipPath`). Draw the source line series on
  top yourself with `@visx/shape` `LinePath`. Import only from `@visx/threshold`.
