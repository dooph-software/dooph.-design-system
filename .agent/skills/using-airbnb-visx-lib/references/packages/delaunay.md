# @visx/delaunay

<a title="@visx/delaunay npm downloads" href="https://www.npmjs.com/package/@visx/delaunay">
  <img src="https://img.shields.io/npm/dm/@visx/delaunay.svg?style=flat-square" />
</a>

A React wrapper around the modern `d3-delaunay` package: `delaunay()` (triangulation) and `voronoi()`
(Voronoi diagram) factories plus a single `Polygon` component for rendering cells or triangles.

## Installation

```
npm install --save @visx/delaunay
```

Peers: `react` (`^18 || ^19`), and `@types/react` if you use TypeScript.

## Exports

- **Factories:** `delaunay({ data, x, y })` → a `Delaunay` instance; `voronoi({ data, x, y, width,
  height })` → a `Voronoi` instance
- **Component:** `Polygon` — renders one coord array (a cell or a triangle) as an SVG `<path>`
- **Types:** none from the package root (`PolygonProps` is defined on the component but NOT
  re-exported)

## Usage

Unlike `@visx/voronoi`, `data` goes INTO the config object — the factory returns the diagram
directly. Iterate `.cellPolygons()`/`.cellPolygon(i)` for Voronoi cells or `.trianglePolygons()` for
Delaunay triangles. Hit-test with `.delaunay.find(x, y)` (Voronoi) or `.find(x, y)` (Delaunay).

```tsx
import { voronoi, Polygon } from '@visx/delaunay';

const diagram = voronoi<Datum>({
  data,
  x: (d) => d.x * innerWidth,
  y: (d) => d.y * innerHeight,
  width: innerWidth,
  height: innerHeight,
});

<svg width={width} height={height}>
  {data.map((d, i) => (
    <Polygon key={`polygon-${d.id}`} polygon={diagram.cellPolygon(i)}
      fill="#eb6d88" stroke="#fff" strokeWidth={1} />
  ))}
</svg>
```

## Notes (v4)

- Built on the MODERN `d3-delaunay` (`Delaunay.from`). API differs from legacy `@visx/voronoi`:
  `.cellPolygons()`/`.cellPolygon(i)` (not `.polygons()`), `.find()`/`.delaunay.find()` (not
  `.find(x,y,r)`), `.neighbors(i)` (not `.cells`/`.edges`).
- `data` is passed in the config here; in `@visx/voronoi` you call the returned layout with data —
  easy to confuse the two.
- `cellPolygon(i)` may return `null` for empty cells; `Polygon` renders `null` safely when `polygon`
  is undefined.
- The single `Polygon` component renders BOTH Voronoi cells and Delaunay triangles.
- With a margin/`<Group>` offset, subtract the margin before `find()` (e.g.
  `find(point.x - margin.left, point.y - margin.top)`).
- Import only from the package root (`@visx/delaunay`).
