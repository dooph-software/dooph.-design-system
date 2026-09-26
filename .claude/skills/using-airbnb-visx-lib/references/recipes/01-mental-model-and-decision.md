# How visx Thinks — Mental Model & The Two Paths (v4.0.0)

The single most important orientation for an agent generating visx code. Everything else builds on this.

## What visx is

visx = a collection of **low-level, unopinionated React visualization primitives**. d3 does the
**math** (scales, shapes, layouts); React owns the **DOM** (you render SVG elements). visx wraps d3's
output in React components so you never touch d3 selections / `enter`/`exit`/`update`.

Consequences that shape every answer:
- **You assemble a chart from parts.** visx gives you scales, a `<Group>`, marks (`Bar`, `LinePath`,
  `AreaClosed`, `Arc`...), axes, gridlines, tooltips. There is no monolithic `<Chart data={...}/>` at
  the primitives level — YOU place each piece. (The exception is `@visx/xychart`, below.)
- **It's pick-and-choose / tree-shakeable.** Install only the packages you need. `@visx/visx` is a
  convenience umbrella but most apps import individual `@visx/*` packages.
- **No animation baked in by design.** Use React animation libs; visx ships `@visx/react-spring` for
  animated axes/grids and `@visx/xychart` animated series (both need `@react-spring/web`).
- **visx renders SVG.** Charts live inside an `<svg>` you control (width/height/viewBox).

## The two paths to a chart (the key decision)

### Path A — Build from primitives (full control, the visx "default")
You compute scales, dimensions, and place marks/axes yourself. Maximum flexibility; you write the
boilerplate. Use for custom/unusual charts, bespoke dashboards, or when you need total control.
→ Recipe: [02-building-from-primitives.md](02-building-from-primitives.md).

### Path B — `@visx/xychart` (opinionated, batteries-included)
A higher-level system: `<XYChart>` + `<DataProvider>` manage scales/data context; you drop in
`<BarSeries>`/`<LineSeries>`/`<Axis>`/`<Grid>`/`<Tooltip>`. Far less boilerplate, built-in tooltips,
crosshairs, theming, and animation. Less flexible for non-standard charts.
→ Recipe: [03-xychart-path.md](03-xychart-path.md).

**Decision rule for the agent:**
- Standard x/y chart (bars/lines/areas/scatter) with tooltips/legend, wants it fast → **Path B (xychart)**.
- Custom geometry, non-cartesian (radial, hierarchical, geo, network, sankey, chord), or fine control
  over every element → **Path A (primitives)**.
- Note: `@visx/xychart` is the v4.0.0 high-level API. (Do NOT confuse with `@visx/chart`, which is a
  4.1 package and OUT OF SCOPE here.)

## Package map by job (38 packages, grouped by what you reach for)

- **Scales & math:** `@visx/scale` (d3-scale object-config), `@visx/curve` (curve factories),
  `@visx/vendor` (the bundled d3 — import d3 utils like `d3-array` from here: `@visx/vendor/d3-array`).
- **Containers/text/utils:** `@visx/group` (`<Group>` = `<g transform>`), `@visx/text` (`<Text>` w/ wrap).
- **Marks:** `@visx/shape` (Bar, LinePath, Area/AreaClosed, Arc, Pie, BarStack/Group, Line, links…),
  `@visx/glyph` (point symbols), `@visx/marker` (line-end markers), `@visx/threshold` (band between lines).
- **SVG defs (id + url(#id)):** `@visx/gradient`, `@visx/pattern`, `@visx/clip-path`.
- **Chart chrome:** `@visx/axis`, `@visx/grid`, `@visx/legend`, `@visx/annotation`.
- **Layouts (render-prop, d3 layouts):** `@visx/hierarchy` (tree/treemap/pack/partition/cluster),
  `@visx/network`, `@visx/sankey`, `@visx/chord`, `@visx/heatmap`, `@visx/stats` (boxplot/violin),
  `@visx/wordcloud`, `@visx/geo` (maps), `@visx/voronoi`, `@visx/delaunay`.
- **Interaction & measurement:** `@visx/event` (`localPoint`), `@visx/drag`, `@visx/zoom`,
  `@visx/brush`, `@visx/tooltip`, `@visx/bounds`, `@visx/responsive` (`ParentSize`).
- **Data:** `@visx/mock-data` (sample datasets + generators), `@visx/point` (`Point` class).
- **High-level & animation:** `@visx/xychart`, `@visx/react-spring`.
- **Meta:** `@visx/visx` (namespaced umbrella).

See the per-package references in `../packages/` for each package's exports/props/examples, and
[../key-findings.md](../key-findings.md) for cross-cutting gotchas.

## Hard v4 rules that color every example
- **Root imports only:** `import { Bar } from '@visx/shape'` — never `@visx/shape/lib/...`.
- **React 18 or 19** is required (peer `^18 || ^19`).
- Pull d3 utilities from the bundled vendor: `import { extent, bisector } from '@visx/vendor/d3-array'`.
- Details + peer-dep table: [04-v4-rules-and-peers.md](04-v4-rules-and-peers.md).
