---
name: using-airbnb-visx-lib
description: >-
  Use when building, editing, or debugging data visualizations with visx v4 — any @visx/* React
  packages (charts, scales, axes, shapes, bars, lines, areas, pies, arcs, tooltips, legends,
  gradients, patterns, brush, zoom, drag, hierarchy/tree/treemap, geo maps, network, sankey, chord,
  heatmap, wordcloud, voronoi, XYChart) — or migrating visx to v4. Also use whenever you import from
  @visx/* or suspect your visx knowledge may predate v4.
license: MIT
---

# visx v4

## Overview

visx is a collection of low-level React visualization primitives: **d3 does the math, React renders
the SVG**, and you assemble charts from parts. This skill is the **v4.0.0** reference — a router to
verified per-package docs (`references/packages/`) and build recipes (`references/recipes/`).

**Core principle: treat your own visx knowledge as possibly stale.** v4 is a modernization release
with breaking changes; "it worked in an older visx" is not evidence it is correct in v4. Use the
references here, and confirm exact signatures against the installed package's TypeScript types.

## v4 ground rules (apply to ALL visx code)

- **React 18 or 19 required** (peer `^18 || ^19`). React ≤17 must stay on visx 3.
- **Root imports only:** `import { Bar } from '@visx/shape'`. Deep imports (`@visx/shape/lib/...`)
  were removed — every package's `exports` field exposes only the root. Prop types usually import
  from the root too (e.g. `import type { AxisProps } from '@visx/axis'`); some are not re-exported
  (see `references/recipes/04-v4-rules-and-peers.md`).
- **d3 utilities come from the bundle:** `import { extent, bisector } from '@visx/vendor/d3-array'`.
- **Peers:** `@types/react`(+`-dom`) are optional peers (install majors matching your React).
  `@visx/bounds`, `@visx/tooltip`, `@visx/xychart` need `react-dom`; `@visx/xychart` and
  `@visx/react-spring` need `@react-spring/web`. Runtime PropTypes were removed; d3-shape/path are v3.
- **Don't use 4.1 APIs here:** `@visx/a11y`, `@visx/chart`, `@visx/kernel`, `@visx/theme`,
  `@visx/registry`, any `/react` hook subpath, and `@visx/tooltip/floating` are NOT part of v4.0.0.

## Choosing an approach (read the matching recipe first)

- **Custom / non-cartesian / full control** → build from primitives:
  `references/recipes/02-building-from-primitives.md`
- **Standard cartesian chart, fast** → `@visx/xychart`: `references/recipes/03-xychart-path.md`
- **New to the model / picking packages** → `references/recipes/01-mental-model-and-decision.md`
- **Migrating v3 → v4** → `references/recipes/04-v4-rules-and-peers.md`

## Build-pattern index (task → read these)

| Task | Read |
|---|---|
| Bar / line / area / scatter chart from scratch | `recipes/02` + `packages/{shape,scale,axis,group}.md` |
| Quick standard chart (series + axes + tooltip) | `recipes/03` + `packages/xychart.md` |
| Add a tooltip | `recipes/02` (tooltip section) + `packages/{tooltip,event}.md` |
| Make a chart responsive | `packages/responsive.md` |
| Curved lines / custom curve | `packages/{shape,curve}.md` |
| Gradients / patterns / clip-paths (`url(#id)`) | `packages/{gradient,pattern,clip-path}.md` |
| Pan / zoom / drag / brush selection | `packages/{zoom,drag,brush}.md` |
| Tree / treemap / pack / partition / cluster | `packages/hierarchy.md` |
| Map / projection | `packages/geo.md` |
| Network graph / sankey / chord | `packages/{network,sankey,chord}.md` |
| Heatmap / boxplot+violin / wordcloud | `packages/{heatmap,stats,wordcloud}.md` |
| Voronoi / delaunay (incl. nearest-point) | `packages/{voronoi,delaunay}.md` |
| Annotations / legends / gridlines / glyphs / markers | `packages/{annotation,legend,grid,glyph,marker}.md` |
| Animated axes/grid | `packages/react-spring.md` (needs `@react-spring/web`) |
| Sample data to prototype with | `packages/mock-data.md` |
| Cross-cutting gotchas / which `*Props` aren't exported | `references/key-findings.md` |

## Package catalog (job → references/packages/<file>.md)

- **scales/math/data:** scale, curve, vendor (bundled d3), point, mock-data
- **containers/text:** group, text
- **marks:** shape (Bar/Line/Area/Arc/Pie/stacks/links), glyph, marker, threshold
- **SVG defs (`url(#id)`):** gradient, pattern, clip-path
- **chart chrome:** axis, grid, legend, annotation
- **layouts (render-prop):** hierarchy, network, sankey, chord, heatmap, stats, wordcloud, geo,
  voronoi, delaunay
- **interaction/measure:** event, drag, zoom, brush, tooltip, bounds, responsive
- **high-level/animation:** xychart, react-spring · **umbrella:** visx (namespaced)

## Verify before shipping

- This bundle documents **v4.0.0**. Confirm exact prop names/signatures against the **installed
  package's TypeScript types** (`.d.ts`) — published `node_modules/@visx/*/Readme.md` files are
  minimal stubs, so rely on this bundle plus the types, not those READMEs.
- Common slips this bundle prevents: assuming v3 == v4, deep `/lib/` imports, importing a `*Props`
  that isn't root-exported, missing `react-dom`/`@react-spring/web` peers, and the v4 `withBoundingRects`
  `nodeRef` / `ParentSize` two-div changes (see `recipes/04` and `key-findings.md`).
