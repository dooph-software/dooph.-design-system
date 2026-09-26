# v4.0.0 Rules, Peer Deps & Migration Cheatsheet

The "don't generate broken code" reference. All verified against the tag.

## Import discipline (the #1 footgun)

- **ROOT IMPORTS ONLY.** `import { Bar, LinePath } from '@visx/shape'`. Deep imports
  (`@visx/shape/lib/...`, `@visx/foo/esm/...`) are **dead in v4** — every package's `exports` field
  exposes only `"."`.
- **The sole multi-subpath package is `@visx/vendor`** — use it to import bundled d3 utilities:
  `import { extent, bisector, max } from '@visx/vendor/d3-array'` (also `@visx/vendor/d3-shape`,
  `/d3-scale`, `/d3-time-format`, `/internmap`, etc.). Don't add your own `d3-array` dep just for this.
- **Prop types import from the root too** (mostly): `import type { AxisProps } from '@visx/axis'`.
  BUT several `*Props`/components are NOT root-exported — verify before importing. Known gaps
  (see [../key-findings.md](../key-findings.md) §A): `GroupProps`, `ThresholdProps`,
  `GridProps`/`GridAngleProps`/`GridRadialProps`/`GridPolarProps`, geo base `Projection`,
  `@visx/wordcloud` types (none exported), `@visx/delaunay` `PolygonProps`, `@visx/brush` `BaseBrush`
  (type-only). The umbrella `@visx/visx` does NOT re-export `Delaunay` or `Sankey` namespaces.
- **`@visx/visx` is namespaced:** `import { Shape, Scale } from '@visx/visx'` → `Shape.LinePath`,
  `Scale.scaleLinear`. Prefer individual packages for tree-shaking.

## Peer dependencies — what to install alongside each package

| You install | Also need (peers) |
|---|---|
| Most `@visx/*` React packages (shape, axis, group, scale-less ones) | `react` (`^18 \|\| ^19`); `@types/react` if TS (optional peer) |
| `@visx/bounds`, `@visx/tooltip` | `react`, **`react-dom`**, `@types/react`(+`@types/react-dom` if TS) |
| `@visx/xychart` | `react`, **`react-dom`**, **`@react-spring/web`** (`^9.7.5 \|\| ^10`), `@types/react`(+dom) |
| `@visx/react-spring` | `react`, **`@react-spring/web`** (NOT the `react-spring` package), `@types/react` |
| `@visx/visx` (umbrella) | `react`, `react-dom`, `@types/react`, `@types/react-dom` |
| `@visx/scale`, `@visx/curve`, `@visx/vendor`, `@visx/point`, `@visx/mock-data` | **no React peer** (non-React/pure) |

Notes (verified):
- `@types/react`/`@types/react-dom` are now **optional peer deps** (not bundled). TS users install the
  major matching their React. Non-TS users see no missing-peer warnings.
- `@react-spring/web` is the correct package name for animation peers (READMEs sometimes say
  `react-spring` — that's wrong for v4).
- If your app used `lodash`/`prop-types`/`d3-shape` only transitively via visx, you must now declare
  them yourself (visx removed those transitive deps in v4).

## v4.0.0 migration cheatsheet (from v3)

| Change | What to do |
|---|---|
| **React 18/19 only** (peer `^18 \|\| ^19`) | Upgrade React first; React ≤17 → stay on visx 3. |
| **Deep imports removed** (`exports` field) | Replace `@visx/x/lib/y` → `@visx/x`. Import `*Props` from root. |
| **Runtime PropTypes removed** | No `Component.propTypes`; use TS/static checks. Add `prop-types` yourself if you relied on it. |
| **`@types/react(-dom)` are peers** | Install matching majors as devDeps for TS. |
| **d3-shape v3 / d3-path v3 via `@visx/vendor`** | Direct d3 imports are your responsibility; declare `d3-shape`/`d3-path` if you import them. |
| **lodash de-vendored** (responsive/text/xychart/shape) | Declare `lodash` yourself if you imported it transitively. |
| **`@visx/bounds` `withBoundingRects` needs `nodeRef`** | Attach injected `nodeRef` to the measured DOM element (no more `findDOMNode`). |
| **`@visx/responsive` ParentSize two-div + callback ref** | If you queried the old single wrapper div or used `parentRef.current`, update: use returned `node`; `externalRef` available. |
| **`@visx/xychart` BaseAxis null-until-data** | Axis hidden until a non-empty series registers; render a placeholder `@visx/axis` Axis if you need it sooner. |
| **`@visx/xychart` `withRegisteredData` removed** | Use public series components (they self-register). |
| **Strict ESM output** (`.js` extensions, `esm/package.json`) | Fixes Vite SSR/Deno/edge `ERR_MODULE_NOT_FOUND`; upgrade all `@visx/*` to `^4` together. |
| **IE11 dropped** | Need IE11? stay on visx 3. |
| Building the repo itself | Node 24+, Yarn 4 via Corepack, Lerna v9 (contributors only). |

**Golden rule:** upgrade ALL `@visx/*` packages to `^4.0.0` together — mixing v3 and v4 is unsupported
(entry points, peer ranges, internal deps changed together).

## Common correctness pitfalls when generating visx code (Path A)
- y-range is inverted `[yMax, 0]`; guard every scale call with `?? 0`.
- `@visx/shape` `Bar` is accessor-free (you compute geometry); `LinePath`/`Area` take accessors;
  `AreaClosed` additionally needs a `yScale` prop.
- Tooltip JSX renders as an HTML sibling of `<svg>`, not inside it; use `localPoint` + `scale.invert`.
- gradient/pattern/clip-path render their own `<defs>` — reference by `url(#id)`, don't double-wrap.
- `@visx/zoom` has no `useZoom`/`zoomIn`/`zoomOut`; `@visx/tooltip/floating` doesn't exist in 4.0.0.
- Trust tag SOURCE over package READMEs (several READMEs drift — see key-findings §H).
