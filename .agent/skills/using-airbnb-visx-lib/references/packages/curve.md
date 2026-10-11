# @visx/curve

<a title="@visx/curve npm downloads" href="https://www.npmjs.com/package/@visx/curve">
  <img src="https://img.shields.io/npm/dm/@visx/curve.svg?style=flat-square" />
</a>

A curated set of `d3-shape` curve factories, re-exported for use as the `curve` prop on visx
line/area shapes.

## Installation

```
npm install --save @visx/curve
```

No React peer dependency.

## Exports

Eighteen `d3-shape` curve factories (no wrapping, no defaults, no types):

- **Basis:** `curveBasis`, `curveBasisClosed`, `curveBasisOpen`
- **Step:** `curveStep`, `curveStepAfter`, `curveStepBefore`
- **Cardinal:** `curveCardinal`, `curveCardinalClosed`, `curveCardinalOpen`
- **Catmull-Rom:** `curveCatmullRom`, `curveCatmullRomClosed`, `curveCatmullRomOpen`
- **Monotone:** `curveMonotoneX`, `curveMonotoneY`
- **Other:** `curveLinear`, `curveLinearClosed`, `curveBundle`, `curveNatural`

## Usage

Pass a factory straight to the `curve` prop. Tunable variants expose d3 builders
(`.alpha()`, `.beta()`, `.tension()`).

```tsx
import { LinePath } from '@visx/shape';
import { curveCatmullRom } from '@visx/curve';

<LinePath data={data} x={(d) => xScale(d.x) ?? 0} y={(d) => yScale(d.y) ?? 0}
  curve={curveCatmullRom} stroke="#222" />

// tuned variant
<LinePath data={data} x={/* … */} y={/* … */} curve={curveCatmullRom.alpha(0.5)} />
```

## Notes (v4)

- Zero logic of its own — just curated d3-shape re-exports routed through `@visx/vendor/d3-shape` (d3-shape 3.2.0) for dual ESM/CJS.
- This is a curated subset of d3-shape curves; e.g. `curveStepBefore`/`curveStepAfter` are present but there are no closed step variants (none exist in d3).
- `curveMonotoneX`, `curveMonotoneY`, and `curveBundle` are line-only curve factories.
- No React, no propTypes. Curves operate on already-scaled data, so they pair with `@visx/scale`.
