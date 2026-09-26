# @visx/clip-path

<a title="@visx/clip-path npm downloads" href="https://www.npmjs.com/package/@visx/clip-path">
  <img src="https://img.shields.io/npm/dm/@visx/clip-path.svg?style=flat-square" />
</a>

React helpers that render `<clipPath>` (inside `<defs>`) so any SVG element can be clip-masked via its
`clip-path` property, referenced by `url(#id)`.

## Installation

```
npm install --save @visx/clip-path
```

Peers: `react` (`^18 || ^19`), and `@types/react` if you use TypeScript.

## Exports

- **Components:** `ClipPath` (arbitrary children), `RectClipPath`, `CircleClipPath`
- **Types:** each component file exports its `*Props` (`ClipPathProps`, `RectClipPathProps`,
  `CircleClipPathProps`), but these are **not** re-exported from the package root.

## Usage

Define a clip path with a unique `id`, then reference it from the element you want to mask via
`clipPath="url(#id)"`. Each component renders its own `<defs>` — don't wrap them. `RectClipPath`
defaults `width`/`height` to `1`, so almost always pass explicit dimensions.

```tsx
import { ClipPath, RectClipPath, CircleClipPath } from '@visx/clip-path';

<svg width={400} height={300}>
  {/* 1. define (each renders its own <defs>) */}
  <RectClipPath id="rect-clip" x={0} y={0} width={200} height={150} rx={12} />
  <CircleClipPath id="circle-clip" cx={100} cy={100} r={60} />
  <ClipPath id="custom-clip">
    <polygon points="0,0 100,0 50,100" />
  </ClipPath>

  {/* 2. reference by url(#id) on the element to clip */}
  <image href="/photo.png" width={400} height={300} clipPath="url(#rect-clip)" />
  <rect width={400} height={300} fill="tomato" clipPath="url(#circle-clip)" />
</svg>;
```

## Notes (v4)

- Each component renders its own `<defs><clipPath>` — do not supply an outer `<defs>` (no double-wrap).
- `RectClipPath` defaults (`width=1`, `height=1`) are tiny — pass explicit dimensions.
- `id` must be unique across the page; duplicates apply the wrong mask.
- `clipPathUnits` defaults to `userSpaceOnUse` (native SVG `<clipPath>` semantics).
- `*Props` types are not root-exported. Import only from `@visx/clip-path`.
