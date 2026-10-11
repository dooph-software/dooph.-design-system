# @visx/voronoi

<a title="@visx/voronoi npm downloads" href="https://www.npmjs.com/package/@visx/voronoi">
  <img src="https://img.shields.io/npm/dm/@visx/voronoi.svg?style=flat-square" />
</a>

A React wrapper around the legacy `d3-voronoi` package: a configured `voronoi()` layout factory plus
a `VoronoiPolygon` component for rendering cells as SVG paths.

## Installation

```
npm install --save @visx/voronoi
```

Peers: `react` (`^18 || ^19`), and `@types/react` if you use TypeScript.

## Exports

- **Factory:** `voronoi({ x, y, width, height })` → a configured `d3-voronoi` layout
- **Component:** `VoronoiPolygon` — renders a polygon coord array as an SVG `<path>`
- **Types:** `VoronoiPolygonProps`

## Usage

`voronoi({...})` returns a *layout*; call it with `data` to get a *diagram*, then `.polygons()`.
Each polygon is a coord array that also carries `.data` back to the original datum. Use
`.find(x, y, radius)` plus `.cells`/`.edges` for hover/neighbor hit-testing.

```tsx
import { voronoi, VoronoiPolygon } from '@visx/voronoi';

const diagram = voronoi<Datum>({
  x: (d) => d.x * innerWidth,
  y: (d) => d.y * innerHeight,
  width: innerWidth,
  height: innerHeight,
})(data); // call the layout with data → diagram

<svg width={width} height={height}>
  {diagram.polygons().map((polygon) => (
    <VoronoiPolygon key={`polygon-${polygon.data.id}`} polygon={polygon}
      fill="#eb6d88" stroke="#fff" strokeWidth={1} />
  ))}
</svg>
```

## Notes (v4)

- Built on the LEGACY `d3-voronoi`, not `d3-delaunay`. For the modern API use `@visx/delaunay` — the
  two have different methods (`.polygons()`/`.cells`/`.edges`/`.find(x,y,r)` here vs
  `.cellPolygons()`/`.delaunay.find()`/`.neighbors()` there).
- The factory returns a layout — call it with data (`voronoi({...})(data)`) to get the diagram;
  equivalently `layout.polygons(data)`.
- Extent is auto-padded ±1px on every side and is not overridable via props.
- `VoronoiPolygon` renders `null` for an undefined `polygon` (degenerate cells).
- Common use: overlay an invisible voronoi grid to enlarge hit targets for scatter points; pair with
  `@visx/event`'s `localPoint` for mouse → data lookup via `.find()`.
- Import only from the package root (`@visx/voronoi`).
