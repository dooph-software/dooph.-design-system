# @visx/chord

<a title="@visx/chord npm downloads" href="https://www.npmjs.com/package/@visx/chord">
  <img src="https://img.shields.io/npm/dm/@visx/chord.svg?style=flat-square" />
</a>

React wrappers over `d3-chord`: `Chord` computes a chord layout from an n×n matrix and exposes it
via a children render-prop; `Ribbon` renders a single chord's ribbon `<path>`.

## Installation

```
npm install --save @visx/chord
```

Peers: `react` (`^18 || ^19`), and `@types/react` if you use TypeScript.

## Exports

- **Components:** `Chord` (render-prop), `Ribbon`
- **Types:** `ChordProps`, `RibbonProps`

## Usage

`Chord` takes a square `matrix` (`matrix[i][j]` = flow from i to j) and a **required** `children`
render-prop receiving `{ chords }`. Draw the outer arc groups with `@visx/shape`'s `Arc` (chord
ships ribbons only), and a `Ribbon` per chord. `Chord` emits no transform — center it yourself with
a `Group`.

```jsx
import { Chord, Ribbon } from '@visx/chord';
import { Arc } from '@visx/shape';
import { Group } from '@visx/group';
import { scaleOrdinal } from '@visx/scale';

const matrix = [[11975, 5871, 8916], [1951, 10048, 2060], [8010, 16145, 8090]];
const color = scaleOrdinal({ domain: [0, 1, 2], range: ['#ff2fab', '#dc04ff', '#52f091'] });

<svg width={300} height={300}>
  <Group top={150} left={150}>
    <Chord matrix={matrix} padAngle={0.05}>
      {({ chords }) => (
        <g>
          {chords.groups.map((group, i) => (
            <Arc key={`g-${i}`} data={group} innerRadius={100} outerRadius={120} fill={color(i)} />
          ))}
          {chords.map((chord, i) => (
            <Ribbon key={`r-${i}`} chord={chord} radius={100}
              fill={color(chord.target.index)} fillOpacity={0.75} />
          ))}
        </g>
      )}
    </Chord>
  </Group>
</svg>
```

## Notes (v4)

- `Chord.children` is required; without it the component renders an empty `<g />` (a react-docgen guard).
- All `Chord` options apply only when truthy — `padAngle={0}` / `sortGroups={null}` won't override d3 defaults.
- `Chord` emits no transform; wrap it in a `@visx/group` `Group` with `top`/`left` to center.
- Render the arc groups (`chords.groups`) with `@visx/shape`'s `Arc` — `@visx/chord` provides ribbons only.
- `Ribbon` spreads arbitrary `SVGProps` (events, styling) onto its `<path>`. Import only from the package root.
