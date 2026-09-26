# @visx/visx

<a title="@visx/visx npm downloads" href="https://www.npmjs.com/package/@visx/visx">
  <img src="https://img.shields.io/npm/dm/@visx/visx.svg?style=flat-square" />
</a>

The one-stop umbrella install that bundles all visx packages and re-exports each as a **namespace** (`Shape`, `Scale`, `Axis`, …), so you can `import { Shape } from '@visx/visx'` instead of installing packages individually.

## Installation

```
npm install --save @visx/visx
```

Peers: `react` (`^18 || ^19`), `react-dom`, and `@types/react` (+`@types/react-dom`) if you use TypeScript.

## Exports

- **31 namespaced re-exports:** `Annotation`, `Axis`, `Bounds`, `Brush`, `ClipPath`, `Curve`, `Drag`, `Event`, `Geo`, `Glyph`, `Gradient`, `Grid`, `Group`, `Heatmap`, `Hierarchy`, `Legend`, `Marker`, `MockData`, `Network`, `Pattern`, `Point`, `Responsive`, `Scale`, `Shape`, `Text`, `Threshold`, `Tooltip`, `Voronoi`, `Wordcloud`, `XYChart`, `Zoom`
- Members are reached **two levels deep**: `Shape.LinePath`, `Scale.scaleLinear`, `Axis.AxisBottom`, `Group.Group`, `Tooltip.useTooltip`.

## Usage

Every member is accessed through its namespace — importing a flat `LinePath` from `@visx/visx` does **not** work.

```tsx
import { Shape, Scale, Group, Axis } from '@visx/visx';

const data = [{ x: 0, y: 1 }, { x: 1, y: 3 }, { x: 2, y: 2 }];
const xScale = Scale.scaleLinear({ domain: [0, 2], range: [0, 300] });
const yScale = Scale.scaleLinear({ domain: [0, 3], range: [200, 0] });

<svg width={340} height={240}>
  <Group.Group left={20} top={20}>
    <Shape.LinePath data={data} x={(d) => xScale(d.x)} y={(d) => yScale(d.y)} stroke="#222" />
    <Axis.AxisLeft scale={yScale} />
    <Axis.AxisBottom scale={xScale} top={200} />
  </Group.Group>
</svg>;
```

## Notes (v4)

- Prefer installing individual `@visx/*` packages in production for smaller bundles; namespace imports can defeat tree-shaking in some bundlers.
- `@visx/delaunay` and `@visx/sankey` ship as dependencies but are **not** re-exported as namespaces — import them from their own roots (`@visx/delaunay`, `@visx/sankey`).
- `@visx/react-spring` (animation) is **not** in the umbrella — install it + `@react-spring/web` separately for animated axis/grid.
- Cross-package composition is identical to standalone usage, just namespaced.
