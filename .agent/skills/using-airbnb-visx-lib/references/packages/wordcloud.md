# @visx/wordcloud

<a title="@visx/wordcloud npm downloads" href="https://www.npmjs.com/package/@visx/wordcloud">
  <img src="https://img.shields.io/npm/dm/@visx/wordcloud.svg?style=flat-square" />
</a>

Render-prop word cloud built on `d3-cloud`: lays out words asynchronously and hands you positioned
word data to draw as SVG.

## Installation

```
npm install --save @visx/wordcloud
```

Peers: `react` (`^18 || ^19`), and `@types/react` if you use TypeScript.

## Exports

- **Component:** `Wordcloud` — renders its own `<svg>` and calls `children(words)` with laid-out
  `CloudWord[]`
- **Hook:** `useWordcloud(config)` — returns the same `CloudWord[]` so you can place words in your own
  SVG
- **Types:** none are exported from the package root (`BaseDatum`, `WordcloudConfig`, `CloudWord`,
  `WordcloudProps` exist internally but are not re-exported)

## Usage

`Wordcloud` renders its OWN `<svg>` (origin centered) — do NOT nest it inside another `<svg>`/`<Group>`.
Each word datum is `{ text }` (extend it, e.g. with `value`). Layout is async, so `words` is `[]` on
the first render and populates after.

```tsx
import { Wordcloud } from '@visx/wordcloud';
import { Text } from '@visx/text';

const words = [{ text: 'visx', value: 100 }, { text: 'react', value: 64 }, { text: 'd3', value: 36 }];
const colors = ['#143059', '#2F6B9A', '#82a6c2'];

<Wordcloud words={words} width={400} height={300} font="Impact" padding={2}
  spiral="archimedean" rotate={0} fontSize={(d) => Math.sqrt(d.value) * 6}>
  {(cloudWords) =>
    cloudWords.map((w, i) => (
      <Text key={w.text} fill={colors[i % colors.length]} textAnchor="middle"
        transform={`translate(${w.x}, ${w.y}) rotate(${w.rotate})`}
        fontSize={w.size} fontFamily={w.font}>
        {w.text}
      </Text>
    ))
  }
</Wordcloud>
```

## Notes (v4)

- Layout is **asynchronous** (canvas measurement) — expect an empty first frame before words appear.
- Word positions/order are non-deterministic by default (`Math.random`); pass a seeded `random` fn for
  stable, reproducible layouts.
- The default `fontSize` is `Math.sqrt(datum.value)`, but `value` is not part of `{ text }` — add it
  or supply your own `fontSize` accessor.
- `w.x`/`w.y` are relative to the centered group — apply them directly via `transform`.
- Heavy `words` arrays re-run the full layout on change; memoize `words` and accessor fns.
- To embed in an existing SVG, use `useWordcloud(config)` and render the returned words yourself.
