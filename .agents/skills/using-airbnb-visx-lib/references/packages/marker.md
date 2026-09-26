# @visx/marker

<a title="@visx/marker npm downloads" href="https://www.npmjs.com/package/@visx/marker">
  <img src="https://img.shields.io/npm/dm/@visx/marker.svg?style=flat-square" />
</a>

SVG `<marker>` primitives (arrow, circle, cross, X, line, and a generic base) for decorating the
ends/vertices of a `<path>`, `<line>`, `<polyline>`, or `<polygon>`.

## Installation

```
npm install --save @visx/marker
```

Peers: `react` (`^18 || ^19`), and `@types/react` if you use TypeScript.

## Exports

- **Base:** `Marker` (generic, takes arbitrary `children`)
- **Concrete markers:** `MarkerArrow`, `MarkerCircle`, `MarkerCross`, `MarkerX`, `MarkerLine`
- **Types:** `MarkerProps`, `MarkerComponentProps`

## Usage

Give each marker a page-unique `id`, then reference it from a drawn element via `markerStart` /
`markerMid` / `markerEnd={'url(#id)'}`. The marker must live in the same `<svg>`. `size` is a geometry
hint, not a final pixel size. `MarkerArrow`/`MarkerCross` default `fill="none"` — set `stroke`.

```tsx
import { MarkerArrow, MarkerCircle } from '@visx/marker';

<svg width={200} height={100}>
  <MarkerArrow id="marker-arrow" stroke="#333" size={8} />
  <MarkerCircle id="marker-circle" fill="#333" size={2} />
  <line
    x1={20} y1={50} x2={180} y2={50}
    stroke="#333" strokeWidth={2}
    markerStart="url(#marker-circle)"
    markerEnd="url(#marker-arrow)"
  />
</svg>;
```

## Notes (v4)

- Each component emits its own `<defs><marker>` wrapper — don't add an outer `<defs>`.
- `id` must be unique across the whole page; duplicates cause cross-referencing bugs.
- `markerUnits` is `'strokeWidth'` on every concrete marker, so markers scale with the referencing
  element's stroke width. Fine-tune with `markerWidth`/`markerHeight`/`refX`/`refY` (they pass through).
- `MarkerX` is `MarkerCross` with `orient={45}`; it spreads props after, so an explicit `orient` wins.
- Import only from the package root (`@visx/marker`).
