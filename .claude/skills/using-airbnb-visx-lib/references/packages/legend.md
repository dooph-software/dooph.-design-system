# @visx/legend

<a title="@visx/legend npm downloads" href="https://www.npmjs.com/package/@visx/legend">
  <img src="https://img.shields.io/npm/dm/@visx/legend.svg?style=flat-square" />
</a>

HTML/SVG legends that map a `@visx/scale` (or d3 scale) domain to rendered shape + label items, with
a preset per scale type.

## Installation

```
npm install --save @visx/legend
```

Peers: `react` (`^18 || ^19`), and `@types/react` if you use TypeScript.

## Exports

- **Base:** `Legend` (generic; all presets delegate here)
- **Presets:** `LegendOrdinal`, `LegendLinear`, `LegendQuantile`, `LegendThreshold`, `LegendSize`
- **Layout pieces:** `LegendItem`, `LegendLabel`, `LegendShape`
- **Shapes:** `RectShape`, `CircleShape`, `LineShape`
- **Types:** `LegendProps`, each preset's `…Props`, `LegendItemProps`, `LegendLabelProps`,
  `LegendShapeProps`, `FormattedLabel`, `LegendShape` (shape-spec), `FlexDirection`

## Usage

Pick the preset matching the scale type; pass `scale` (domain comes from `scale.domain()`). Legends
are plain HTML (`<div>` flex) — render them **outside** the chart `<svg>`. The `children` render-prop
on any legend receives the computed `labels` and fully replaces default item rendering.

```tsx
import { LegendOrdinal, LegendThreshold, LegendItem, LegendLabel } from '@visx/legend';
import { scaleOrdinal, scaleThreshold } from '@visx/scale';

const ordinal = scaleOrdinal({ domain: ['A', 'B', 'C'], range: ['#f00', '#0f0', '#00f'] });
<LegendOrdinal scale={ordinal} shape="circle" shapeWidth={12} direction="row" itemMargin="0 12px 0 0" />

const threshold = scaleThreshold({ domain: [0.02, 0.04], range: ['#eee', '#999', '#333'] });
<LegendThreshold scale={threshold} labelDelimiter="to" />

// Render-prop override
<LegendOrdinal scale={ordinal}>
  {(labels) => labels.map((label, i) => (
    <LegendItem key={i} margin="0 8px">
      <svg width={12} height={12}><circle r={6} cx={6} cy={6} fill={String(label.value)} /></svg>
      <LegendLabel align="left" margin="0 0 0 4px">{label.text}</LegendLabel>
    </LegendItem>
  ))}
</LegendOrdinal>
```

## Notes (v4)

- Default `fill`/`size` accessors read `label.value`, so for color legends the scale's **range**
  (output) must be the color string.
- `LegendLinear`/`LegendSize` split the domain into `steps` intervals (default `5`);
  `LegendThreshold`/`LegendQuantile` derive ranges via `invertExtent`.
- Default delimiters: `LegendThreshold` `'to'` (plus `'Less than '`/`'More than '` for open ends),
  `LegendQuantile` `'-'`.
- `LineShape.fill` is used as the line **stroke**; `CircleShape` ignores string dimensions — pass
  numeric `shapeWidth`/`shapeHeight`. Import only from the package root.
