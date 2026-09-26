# @visx/hierarchy

<a title="@visx/hierarchy npm downloads" href="https://www.npmjs.com/package/@visx/hierarchy">
  <img src="https://img.shields.io/npm/dm/@visx/hierarchy.svg?style=flat-square" />
</a>

React render-prop layouts over `d3-hierarchy` — `Tree`, `Cluster`, `Treemap`, `Pack`, and
`Partition`. Each runs a d3 layout over a `root` hierarchy node and either renders default SVG or
hands the computed layout to a children render-prop.

## Installation

```
npm install --save @visx/hierarchy
```

Peers: `react` (`^18 || ^19`), and `@types/react` if you use TypeScript.

## Exports

- **Layouts:** `Tree`, `Cluster`, `Treemap`, `Pack`, `Partition`
- **Default renderers:** `HierarchyDefaultNode` (circle), `HierarchyDefaultRectNode` (rect),
  `HierarchyDefaultLink` (line)
- **d3-hierarchy re-exports:** `hierarchy`, `stratify`, and tiling fns `treemapSquarify`,
  `treemapBinary`, `treemapResquarify`, `treemapDice`, `treemapSlice`, `treemapSliceDice`
- **Types:** `TreeProps`, `ClusterProps`, `TreemapProps`, `PackProps`, `PartitionProps`, plus
  d3 node/link types (`HierarchyPointNode`, `HierarchyRectangularNode`, `HierarchyCircularNode`, …)

## Usage

Build `root` yourself with `hierarchy(data)`; for value layouts (Treemap/Pack/Partition) chain
`.sum()` (and optionally `.sort()`) — the components do not compute `value`. Pass `root` plus a
`size`; supply a `children` render-prop to draw your own SVG, or omit it for default rendering.

```tsx
import { Cluster, hierarchy } from '@visx/hierarchy';
import type { HierarchyPointLink, HierarchyPointNode } from '@visx/hierarchy';
import { LinkVertical } from '@visx/shape';
import { Group } from '@visx/group';

interface Node { name: string; children?: Node[]; }
const root = hierarchy<Node>({ name: 'root', children: [{ name: 'A' }, { name: 'B' }] });

<svg width={400} height={300}>
  <Cluster<Node> root={root} size={[400, 220]}>
    {(cluster) => (
      <Group top={40}>
        {cluster.links().map((link, i) => (
          <LinkVertical<HierarchyPointLink<Node>, HierarchyPointNode<Node>>
            key={i} data={link} stroke="#999" fill="none" />
        ))}
        {cluster.descendants().map((node, i) => (
          <circle key={i} cx={node.x} cy={node.y} r={12} fill="#21D4FD" />
        ))}
      </Group>
    )}
  </Cluster>
</svg>
```

A default-render Treemap is shorter: `<Treemap root={hierarchy(data).sum((d) => d.value)} size={[w, h]} />`.

## Notes (v4)

- Construct `root` and call `.sum()`/`.sort()` yourself; Treemap/Pack/Partition give zero-area output if `value` is unset.
- Coordinate fields differ: Tree/Cluster nodes expose `x`/`y` (+ `links()`); Treemap/Partition expose `x0/x1/y0/y1`; Pack exposes `x`/`y`/`r`.
- Only `Tree` and `Cluster` support `linkComponent` / `links()`. Pack/Treemap/Partition have no links concept.
- `tile` accepts a tiling fn from this package's d3 re-exports (e.g. `treemapSquarify`).
- Built on `d3-hierarchy` v1. Import only from the package root (`@visx/hierarchy`).
