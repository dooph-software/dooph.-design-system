# @visx/sankey

<a title="@visx/sankey npm downloads" href="https://www.npmjs.com/package/@visx/sankey">
  <img src="https://img.shields.io/npm/dm/@visx/sankey.svg?style=flat-square" />
</a>

React wrapper over `d3-sankey`: computes a sankey layout from `{ nodes, links }` and either renders
default rects/paths or hands the computed graph to a children render-prop.

## Installation

```
npm install --save @visx/sankey
```

Peers: `react` (`^18 || ^19`), and `@types/react` if you use TypeScript.

## Exports

- **Component:** `Sankey`
- **d3-sankey re-exports:** `sankey`, `sankeyLinkHorizontal`, and alignment fns `sankeyLeft`,
  `sankeyRight`, `sankeyCenter`, `sankeyJustify`
- **Types:** `SankeyProps`, plus d3 types `SankeyGraph`, `SankeyNode`, `SankeyLink`,
  `SankeyExtraProperties`, `SankeyLayout`, …

## Usage

Pass `root={{ nodes, links }}` where each link's `source`/`target` are node indices or ids. Omit
`children` for default rects/paths, or provide `children={({ graph, createPath }) => …}` to draw
your own. Computed `graph.nodes` carry `x0/x1/y0/y1`; `graph.links` carry `width` and resolved
`source`/`target` node objects.

```jsx
import { Sankey, sankeyCenter } from '@visx/sankey';
import { LinkHorizontal, BarRounded } from '@visx/shape';
import { Group } from '@visx/group';

const data = {
  nodes: [{ name: 'a' }, { name: 'b' }, { name: 'c' }],
  links: [{ source: 0, target: 1, value: 10 }, { source: 1, target: 2, value: 5 }],
};

<svg width={300} height={200}>
  <Sankey root={data} nodeAlign={sankeyCenter} size={[300, 200]} nodeWidth={15}>
    {({ graph, createPath }) => (
      <>
        <Group>
          {graph.links.map((link, i) => (
            <LinkHorizontal key={i} data={link} path={createPath}
              fill="transparent" stroke="#f50057" strokeWidth={link.width} strokeOpacity={0.5} />
          ))}
        </Group>
        <Group>
          {graph.nodes.map(({ x0, x1, y0, y1 }, i) => (
            <BarRounded key={i} x={x0} y={y0} width={x1 - x0} height={y1 - y0} radius={3} all fill="#f50057" />
          ))}
        </Group>
      </>
    )}
  </Sankey>
</svg>
```

## Notes (v4)

- `nodeWidth` defaults to `2` and is **always** applied, overriding d3-sankey's default of 24 unless you set your own.
- All other options apply only when truthy: `nodePadding={0}`, `iterations={0}`, etc. are no-ops and won't override d3 defaults.
- Default node/link colors are hardcoded `#000`; recolor via `nodeProps`/`linkProps` or the children render-prop.
- `d3-sankey` mutates `root` in place — pass a fresh object if you reuse the input.
- Node/link datums must extend `SankeyExtraProperties`. Import only from the package root.
