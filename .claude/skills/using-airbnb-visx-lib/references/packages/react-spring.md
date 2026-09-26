# @visx/react-spring

<a title="@visx/react-spring npm downloads" href="https://www.npmjs.com/package/@visx/react-spring">
  <img src="https://img.shields.io/npm/dm/@visx/react-spring.svg?style=flat-square" />
</a>

Animated versions of `@visx/axis` and `@visx/grid` primitives, with tick/grid-line motion powered by react-spring. Keeps react-spring isolated to one package so the rest of visx stays animation-free.

## Installation

```
npm install --save @visx/react-spring
```

Peers: `react` (`^18 || ^19`), `@react-spring/web` (`^9.7.5 || ^10`), and `@types/react` if you use TypeScript.

## Exports

- **Components:** `AnimatedAxis`, `AnimatedGridRows`, `AnimatedGridColumns`, `AnimatedTicks`
- **Types:** `AnimationTrajectory` (`'outside' | 'center' | 'min' | 'max'`)
- Note: there is **no** `AnimatedGrid` (use `AnimatedGridRows` + `AnimatedGridColumns`) and no animated series — those live in `@visx/xychart`.

## Usage

Each component is a drop-in replacement for its `@visx/axis`/`@visx/grid` counterpart (same props: `scale`, `orientation`, `numTicks`, etc.) plus one optional `animationTrajectory` prop controlling where ticks/lines animate from. Scales come from `@visx/scale`.

```tsx
import { scaleLinear } from '@visx/scale';
import { AnimatedAxis, AnimatedGridRows, AnimatedGridColumns } from '@visx/react-spring';

const xScale = scaleLinear({ domain: [0, 10], range: [0, 400] });
const yScale = scaleLinear({ domain: [0, 100], range: [300, 0] });

<svg width={440} height={340}>
  <AnimatedGridRows scale={yScale} width={400} animationTrajectory="center" />
  <AnimatedGridColumns scale={xScale} height={300} animationTrajectory="center" />
  <AnimatedAxis scale={xScale} top={300} orientation="bottom" animationTrajectory="outside" />
  <AnimatedAxis scale={yScale} orientation="left" animationTrajectory="outside" />
</svg>;
```

## Notes (v4)

- The peer is `@react-spring/web` (not `react-spring`); it is **not** bundled — install it yourself or the `Animated*` components fail.
- Only axis + grid are animated here at v4.0.0; no animated shapes or series.
- `AnimatedAxis` controls `ticksComponent` internally — customize per-tick rendering via `tickComponent`, not `ticksComponent`.
- `animationTrajectory` is optional on every component.
- Import only from the package root (`@visx/react-spring`).
