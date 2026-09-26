# @visx/pattern

<a title="@visx/pattern npm downloads" href="https://www.npmjs.com/package/@visx/pattern">
  <img src="https://img.shields.io/npm/dm/@visx/pattern.svg?style=flat-square" />
</a>

React wrappers for SVG `<pattern>` (rendered inside `<defs>`) plus prebuilt texture patterns (lines,
circles, waves, hexagons, custom path), all referenced by `url(#id)` as a fill.

## Installation

```
npm install --save @visx/pattern
```

Peers: `react` (`^18 || ^19`), and `@types/react` if you use TypeScript.

## Exports

- **Low-level:** `Pattern` (arbitrary children)
- **Texture patterns:** `PatternLines`, `PatternCircles`, `PatternWaves`, `PatternHexagons`,
  `PatternPath`
- **Constant:** `PatternOrientation` (`{ horizontal, vertical, diagonal, diagonalRightToLeft }`)
- **Types:** `PatternProps`, `PatternLinesProps`, `PatternCirclesProps`, `PatternWavesProps`,
  `PatternHexagonsProps`, `PatternPathProps`, `PatternOrientationType`

## Usage

Define a pattern with a unique `id`, then reference it via `fill="url(#id)"`. Each component renders
its own `<defs>` — don't wrap them. `PatternLines.orientation` is an **array**. `PatternHexagons`
takes `height` + `size` and has **no `width`** prop (width is derived from `size`).

```tsx
import { PatternLines, PatternCircles, PatternHexagons, PatternOrientation } from '@visx/pattern';

<svg width={400} height={300}>
  {/* each renders its own <defs><pattern> */}
  <PatternLines id="lines" width={6} height={6} stroke="black" strokeWidth={1}
    orientation={[PatternOrientation.diagonal]} />
  <PatternCircles id="circles" width={6} height={6} stroke="black" strokeWidth={1} complement />
  <PatternHexagons id="hexes" height={6} size={8} stroke="red" strokeWidth={1} />

  <rect width={400} height={300} fill="url(#lines)" />
</svg>;
```

## Notes (v4)

- Each component renders its own `<defs>` — do not wrap in your own `<defs>` (no double-wrap).
- `patternUnits` is hardcoded to `userSpaceOnUse` (tile sized in absolute user units).
- `PatternLines.orientation` is an ARRAY — pass `['diagonal']`, not `'diagonal'`.
- `PatternHexagons` takes `height` + `size`, **not `width`** (unlike the other patterns).
- `PatternWaves`/`PatternHexagons` wrap `PatternPath`; `PatternPath` defaults `fill="transparent"` —
  set `fill`/`stroke` to see anything. Import only from `@visx/pattern`.
