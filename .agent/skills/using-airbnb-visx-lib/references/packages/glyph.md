# @visx/glyph

<a title="@visx/glyph npm downloads" href="https://www.npmjs.com/package/@visx/glyph">
  <img src="https://img.shields.io/npm/dm/@visx/glyph.svg?style=flat-square" />
</a>

Small SVG marks/symbols (circle, cross, diamond, square, star, triangle, wye, dot) for plotting
points in charts. Most are thin wrappers over d3-shape symbol generators.

## Installation

```
npm install --save @visx/glyph
```

Peers: `react` (`^18 || ^19`), and `@types/react` if you use TypeScript.

## Exports

- **Container:** `Glyph` (a positioned `<g>`)
- **d3-symbol glyphs:** `GlyphCircle`, `GlyphCross`, `GlyphDiamond`, `GlyphSquare`, `GlyphStar`,
  `GlyphTriangle`, `GlyphWye`
- **Plain SVG circle:** `GlyphDot`
- **Types:** `GlyphProps`, `GlyphDotProps`, and per-glyph generic `…Props<Datum>` (e.g.
  `GlyphCircleProps`, `GlyphStarProps`)

## Usage

Position with `left`/`top` (the symbol is centered at the `<g>` origin). `size` is the d3-symbol
**area** in px² — values look small, so use 100+. `GlyphDot` is the odd one out: a plain `<circle>`
using `r`/`cx`/`cy`. Render inside an `<svg>` (glyphs emit `<g>`/`<path>`/`<circle>`, no wrapper).

```tsx
import { GlyphCircle, GlyphStar, GlyphDot } from '@visx/glyph';

<svg width={200} height={100}>
  <GlyphDot left={30} top={50} r={6} fill="#f00" />
  <GlyphCircle left={70} top={50} size={120} fill="#26deb0" />
  <GlyphStar left={120} top={50} size={200} fill="#fa9e22" />
</svg>;
```

## Notes (v4)

- `size` is area (px²), not radius/diameter — small numbers render tiny.
- d3 glyphs center the symbol at `0,0`; place them with `left`/`top` (or your own transform). They do
  not default `top`/`left`; `GlyphDot` defaults both to `0`.
- A render-prop `children={({ path }) => …}` short-circuits all built-in rendering — `className`,
  `top`, `left` are then ignored and you draw with the d3 `path` generator yourself.
- Symbol functions come from `@visx/vendor/d3-shape` (vendored). Import only from `@visx/glyph`.
