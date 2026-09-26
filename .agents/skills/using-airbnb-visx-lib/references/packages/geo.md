# @visx/geo

<a title="@visx/geo npm downloads" href="https://www.npmjs.com/package/@visx/geo">
  <img src="https://img.shields.io/npm/dm/@visx/geo.svg?style=flat-square" />
</a>

React components for D3 geographic projections plus configurable graticules, wrapping
`@visx/vendor/d3-geo`.

## Installation

```
npm install --save @visx/geo
```

Peers: `react` (`^18 || ^19`), and `@types/react` if you use TypeScript.

## Exports

- **Projection presets** (6): `Albers`, `AlbersUsa`, `Mercator`, `Orthographic`, `NaturalEarth`,
  `EqualEarth`
- **Custom:** `CustomProjection` — pass `projection={() => geoConicConformal()}` (any d3-geo factory)
- **Graticule:** `Graticule` — standalone lat/long grid generator
- **Types:** `ProjectionProps`, `GraticuleProps`, `Projection`, `ProjectionPreset`,
  `GeoPermissibleObjects` (the base `Projection` component is NOT exported — only the presets and
  `CustomProjection`)

## Usage

Pass `data` (GeoJSON features) and projection config (`scale`, `translate`, etc.). With `children`
you render manually from `{ path, features, projection }`; without it, feature paths and graticules
render automatically. Props like `rotate`/`center` apply only when the underlying projection
supports them (e.g. `AlbersUsa` ignores `rotate`).

```tsx
import { Mercator, Graticule } from '@visx/geo';

<svg width={width} height={height}>
  <Mercator data={world.features} scale={(width / 630) * 100}
    translate={[width / 2, height / 2 + 50]}>
    {(mercator) => (
      <g>
        <Graticule graticule={(g) => mercator.path(g) || ''} stroke="rgba(33,33,33,0.05)" />
        {mercator.features.map(({ feature, path }, i) => (
          <path key={i} d={path || ''} fill="#ffb01d" stroke="#f9f7e8" strokeWidth={0.5} />
        ))}
      </g>
    )}
  </Mercator>
</svg>
```

## Notes (v4)

- Exactly 6 projection presets are implemented; for anything else use `CustomProjection` with a
  d3-geo factory function.
- In `children` render-prop mode, the auto-render extras (`graticule*`, `centroid`, `className`,
  `innerRef`) are bypassed — render the `<Graticule>` and feature paths yourself.
- `scale`/`translate`/`center`/`rotate`/`clipAngle` are applied only when truthy AND supported by the
  chosen projection, otherwise silently ignored.
- The render-prop exposes the raw `GeoProjection`, so call `.invert([x, y])` for interactivity.
- Demos convert TopoJSON → GeoJSON with `topojson-client` (a devDependency, not a runtime dep).
- Import only from the package root (`@visx/geo`).
