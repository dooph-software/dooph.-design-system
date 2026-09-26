# @visx/scale

<a title="@visx/scale npm downloads" href="https://www.npmjs.com/package/@visx/scale">
  <img src="https://img.shields.io/npm/dm/@visx/scale.svg?style=flat-square" />
</a>

Thin wrapper around `d3-scale` that creates and updates scales from a plain **object config**
(`{ type, domain, range, ... }`) instead of d3's fluent builder API.

## Installation

```
npm install --save @visx/scale
```

No React peer dependency.

## Exports

- **Factories** (each takes one object config): `scaleLinear`, `scaleLog`, `scalePower`, `scaleSqrt`,
  `scaleSymlog`, `scaleRadial`, `scaleTime`, `scaleUtc`, `scaleBand`, `scalePoint`, `scaleOrdinal`,
  `scaleQuantize`, `scaleQuantile`, `scaleThreshold`
- **Functions:** `createScale` (dispatches on `config.type`, defaults to linear), `updateScale`
  (applies a config to a copy of an existing scale), `inferScaleType`, `getTicks`, `coerceNumber`,
  `scaleCanBeZeroed`, `toString`
- **Types:** `ScaleType`, `ScaleConfig`, `ScaleConfigToD3Scale`, `D3Scale`, `AnyD3Scale`,
  `PickD3Scale`, `ScaleInput`, `ContinuousScaleType`, `DiscreteScaleType`, etc.

## Usage

Factories return a live d3 scale you call to map data → pixels. Config fields are per-type (a band
scale takes `padding`, a linear scale takes `nice`/`clamp`, etc.); all share `type`, `domain`,
`range`, `reverse`.

```ts
import { scaleLinear, scaleBand, scaleOrdinal } from '@visx/scale';

const xScale = scaleBand<string>({ domain: ['a', 'b', 'c'], range: [0, 500], padding: 0.2, round: true });

// svg y is top-down, so range goes high → low
const yScale = scaleLinear<number>({ domain: [0, 100], range: [400, 0], nice: true, round: true });

const color = scaleOrdinal({ domain: ['a', 'b', 'c'], range: ['#f00', '#0f0', '#00f'] });

xScale('a'); // pixel position
yScale(50);  // pixel position
```

## Notes (v4)

- Call style is **object config**, not d3 chaining (`.domain().range()`).
- d3-scale comes through `@visx/vendor/d3-scale` (pinned 4.0.2) for dual ESM/CJS.
- `updateScale(scale, config)` is non-mutating — it returns a mutated `scale.copy()`.
- Log scales: the domain must not include or cross zero.
- Pure functions — no React, no propTypes. Pair `scaleOrdinal` with `d3-scale-chromatic` schemes for color.
