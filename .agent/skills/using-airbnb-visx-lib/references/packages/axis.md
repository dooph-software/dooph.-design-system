# @visx/axis

<a title="@visx/axis npm downloads" href="https://www.npmjs.com/package/@visx/axis">
  <img src="https://img.shields.io/npm/dm/@visx/axis.svg?style=flat-square" />
</a>

SVG axis components — a line plus ticks, tick labels, and an axis label — for any `@visx/scale` or
d3 scale.

## Installation

```
npm install --save @visx/axis
```

Peers: `react` (`^18 || ^19`), and `@types/react` if you use TypeScript.

## Exports

- **Components:** `Axis` (base, configurable via `orientation`), and pre-oriented
  `AxisTop`/`AxisRight`/`AxisBottom`/`AxisLeft`
- **Constants:** `Orientation` — `{ top, left, right, bottom }`
- **Types:** `AxisProps`, `AxisScale`, `TickFormatter`, `TickLabelProps`, `TickRendererProps`,
  `SharedAxisProps`, `CommonProps`, `ComputedTick`, `AxisRendererProps`

## Usage

Place each axis yourself with `top`/`left` (they offset the whole group; nothing auto-detects chart
bounds). Pass any `@visx/scale` scale. The directional components set `orientation` for you and do
**not** accept it — only base `Axis` does.

```tsx
import { AxisBottom, AxisLeft } from '@visx/axis';
import { scaleLinear } from '@visx/scale';

const width = 400, height = 300;
const margin = { top: 20, right: 20, bottom: 40, left: 50 };
const xScale = scaleLinear({ domain: [0, 100], range: [margin.left, width - margin.right] });
const yScale = scaleLinear({ domain: [0, 50], range: [height - margin.bottom, margin.top] });

<svg width={width} height={height}>
  <AxisBottom top={height - margin.bottom} scale={xScale} numTicks={5} label="X axis" />
  <AxisLeft left={margin.left} scale={yScale} numTicks={5} label="Y axis"
    tickLabelProps={{ fontSize: 11, fill: '#555' }} />
</svg>
```

## Notes (v4)

- `tickLabelProps` **object form** merges over the per-orientation defaults (so `{ fontSize: 14 }`
  keeps the rest); **function form** `(value, index, values) => Partial<TextProps>` is called per
  tick and bypasses that merge — return the full prop set yourself.
- `numTicks` is approximate (d3 `ticks()`) and ignored once `tickValues` is given.
- `hideTicks` hides tick **lines** only; labels still render. Use `tickValues`/`hideZero`/`tickFormat`
  to drop labels.
- Tick labels and axis label are `@visx/text` `<Text>` — `tickLabelProps`/`labelProps` accept full
  `TextProps` (`angle`, `width`, `dx`, `dy`, …), not just raw SVG attrs.
- Animated `AnimatedAxis` lives in `@visx/react-spring`, not here. Import only from the package root.
