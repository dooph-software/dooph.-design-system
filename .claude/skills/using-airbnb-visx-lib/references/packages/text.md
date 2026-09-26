# @visx/text

<a title="@visx/text npm downloads" href="https://www.npmjs.com/package/@visx/text">
  <img src="https://img.shields.io/npm/dm/@visx/text.svg?style=flat-square" />
</a>

An enhanced SVG `<text>` component that adds the things native SVG text lacks: word-wrapping,
vertical alignment, rotation, and scale-to-fit.

## Installation

```
npm install --save @visx/text
```

Peers: `react` (`^18 || ^19`), and `@types/react` if you use TypeScript.

## Exports

- **Component:** `Text`
- **Functions:** `getStringWidth` (measures rendered text width; returns `null` under SSR),
  `useText` (the wrapping/scaling/anchor math hook behind `Text`)
- **Types:** `TextProps`, `WordsWithWidth`, `compareFunction`

## Usage

`verticalAnchor` defaults to `'end'`, so a plain `<Text>` at `0,0` sits on the baseline and is clipped
above the viewport — pass `verticalAnchor="start"`. Setting `width` enables word-wrapping (words are
never split). `scaleToFit` requires numeric `x`, `y`, and `width`.

```tsx
import { Text } from '@visx/text';

<svg width={300} height={100}>
  {/* width enables wrapping; verticalAnchor="start" keeps text inside the viewport */}
  <Text x={10} y={10} width={200} verticalAnchor="start">
    This is a long label that will wrap onto multiple lines within the width.
  </Text>
</svg>;
```

## Notes (v4)

- `verticalAnchor` defaults to `'end'` — plain `<Text>` at `0,0` renders on the baseline and may be
  clipped; use `verticalAnchor="start"` for top-aligned text.
- `width` enables wrapping (words are measured but never split — a too-long word overflows its line).
- `scaleToFit` (`true` | `'shrink-only'`) scales `fontSize` so the first line fills `width`; needs
  numeric `x`/`y`/`width`.
- Invalid `x`/`y` (NaN/Infinity) cause the component to render nothing.
- lodash was removed in v4; only `classnames` and `reduce-css-calc` remain as deps. Import from the
  package root (`@visx/text`).
