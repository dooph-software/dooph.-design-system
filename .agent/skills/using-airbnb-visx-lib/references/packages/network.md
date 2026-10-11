# @visx/network

<a title="@visx/network npm downloads" href="https://www.npmjs.com/package/@visx/network">
  <img src="https://img.shields.io/npm/dm/@visx/network.svg?style=flat-square" />
</a>

Render a pre-laid-out network/graph (nodes + links) as SVG. `@visx/network` does **not** compute a
layout — you supply each node's `x`/`y` coordinates.

## Installation

```
npm install --save @visx/network
```

Peers: `react` (`^18 || ^19`), and `@types/react` if you use TypeScript.

## Exports

- **Components:** `Graph` (renders `Links` then `Nodes`), `Links`, `Nodes`
- **Default renderers:** `DefaultNode` (circle), `DefaultLink` (line)
- **Types:** `GraphProps`, `LinksProps`, `NodesProps`, plus data types `Graph`, `Link`,
  `DefaultNode`, `LinkProvidedProps`, `NodeProvidedProps`

## Usage

Pass `Graph` a `graph={{ nodes, links }}` object. Each link's `source`/`target` are the resolved
**node objects** (not indices/ids), and every node needs `x`/`y`. Customize rendering with
`nodeComponent`/`linkComponent` (each receives `{ node }` / `{ link }`).

```jsx
import { Graph, DefaultLink, DefaultNode } from '@visx/network';

const nodes = [{ x: 50, y: 20 }, { x: 200, y: 300 }, { x: 300, y: 40 }];
const graph = {
  nodes,
  links: [
    { source: nodes[0], target: nodes[1] },
    { source: nodes[1], target: nodes[2] },
    { source: nodes[2], target: nodes[0] },
  ],
};

<svg width={400} height={400}>
  <Graph graph={graph} linkComponent={DefaultLink} nodeComponent={DefaultNode} />
</svg>
```

## Notes (v4)

- No layout engine — precompute node `x`/`y` (e.g. with `d3-force`) before rendering.
- Links reference resolved node objects, so a custom node datum must still expose `x`/`y` for default link/node rendering.
- `Graph` forwards only `graph`, `top`, `left`, `nodeComponent`, `linkComponent`; use `Nodes`/`Links` directly for `x`/`y`/`className` accessors.
- A custom node component receives only `{ node }`; positioning is handled by the wrapping `Group`, so draw at local origin `(0,0)`.
- CSS hooks: `.visx-network-link`, `.visx-network-node`. Import only from the package root.
