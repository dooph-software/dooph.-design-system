# @visx/event

<a title="@visx/event npm downloads" href="https://www.npmjs.com/package/@visx/event">
  <img src="https://img.shields.io/npm/dm/@visx/event.svg?style=flat-square" />
</a>

Utilities for turning a React/DOM mouse, touch, or pointer event into a local SVG coordinate
`{ x, y }` within the target SVG's coordinate system.

## Installation

```
npm install --save @visx/event
```

Peers: `react` (`^18 || ^19`), and `@types/react` if you use TypeScript.

## Exports

- **`localPoint`** — `localPoint(event)` or `localPoint(node, event)`. Returns a `Point` (`{ x, y }`)
  in the target SVG's local coords, or `null` if inputs are missing/unrecognized.
- **`touchPoint`** — strict two-arg `touchPoint(node, event)` form (no event-only overload).

## Usage

`localPoint(event)` uses `event.target` as the reference node; pass the node explicitly
(`localPoint(node, event)`) when the event target differs from the SVG you want to measure against.
Always guard for `null`. Pair the result with `scale.invert` to recover data values.

```tsx
import { localPoint } from '@visx/event';

<svg>
  <rect
    width={400}
    height={300}
    onMouseMove={(event) => {
      const point = localPoint(event) ?? { x: 0, y: 0 };
      const dataX = xScale.invert(point.x); // recover domain value
    }}
  />
</svg>;
```

Explicit-node form with a ref (more robust):

```tsx
const svgRef = useRef<SVGSVGElement>(null);
<svg ref={svgRef}>
  <rect onMouseMove={(e) => localPoint(svgRef.current!, e) ?? { x: 0, y: 0 }} />
</svg>;
```

## Notes (v4)

- Returns a `@visx/point` `Point` instance or `null` — always guard (`?? { x: 0, y: 0 }`).
- When an SVG with `getScreenCTM()` is found it uses matrix transforms; otherwise it falls back to
  bounding-box math, so non-SVG nodes still resolve rather than returning `null`.
- `touchPoint` is an alias of the generic two-arg form — it has no event-only convenience overload.
- Used internally by `@visx/drag` and `@visx/zoom`. Import only from the package root (`@visx/event`).
