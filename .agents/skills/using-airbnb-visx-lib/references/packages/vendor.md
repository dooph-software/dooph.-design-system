# @visx/vendor

Internal vendoring package that re-exports pinned `d3-*` modules (plus `internmap`) under
`@visx/vendor/<pkg>` subpaths, with dual ESM + CommonJS builds so other visx packages don't depend on
ESM-only upstream d3 directly. Heavily based on `victory-vendor`.

## Installation

```
npm install --save @visx/vendor
```

No React peer dependency. `@visx/vendor` re-exports bundled d3 modules via subpaths (e.g.
`@visx/vendor/d3-array`, `/d3-shape`, `/d3-scale`, `/internmap`).

## Exports

There is **no `.` root entry** — you import from a subpath. Each subpath re-exports the unmodified
upstream module (paired `@types/*` ship alongside, except `internmap`):

- `@visx/vendor/d3-array` (d3-array 3.2.1)
- `@visx/vendor/d3-color` (d3-color 3.1.0)
- `@visx/vendor/d3-delaunay` (d3-delaunay 6.0.2)
- `@visx/vendor/d3-format` (d3-format 3.1.0)
- `@visx/vendor/d3-geo` (d3-geo 3.1.0)
- `@visx/vendor/d3-interpolate` (d3-interpolate 3.0.1)
- `@visx/vendor/d3-path` (d3-path 3.1.0)
- `@visx/vendor/d3-scale` (d3-scale 4.0.2)
- `@visx/vendor/d3-shape` (d3-shape 3.2.0)
- `@visx/vendor/d3-time` (d3-time 3.1.0)
- `@visx/vendor/d3-time-format` (d3-time-format 4.1.0)
- `@visx/vendor/internmap` (internmap 2.0.3)

## Usage

Import named exports from the subpath, exactly as you would from the upstream d3 package. The subpath
*is* the entry point for this package.

```ts
import { extent } from '@visx/vendor/d3-array';
import { scaleLinear } from '@visx/vendor/d3-scale';
import { interpolate } from '@visx/vendor/d3-interpolate';
import { curveBasis } from '@visx/vendor/d3-shape';

extent([3, 1, 2]); // [1, 3]
```

## Notes (v4)

- No `.` root export — `import … from '@visx/vendor'` does not resolve. Always use a `@visx/vendor/<pkg>` subpath.
- Do NOT reach into `/lib/` or `/esm/` directly; the `<pkg>` subpath picks the right build (ESM vs CJS) automatically.
- This is an INTERNAL dependency — app code normally imports `@visx/scale`, `@visx/curve`, etc.; the subpaths are usable but rarely needed directly.
- d3 pins here (mostly d3 v3, d3-scale 4, d3-delaunay 6, d3-time-format 4) are the exact versions every other visx package transitively uses.
- `internmap` has no bundled types condition.
