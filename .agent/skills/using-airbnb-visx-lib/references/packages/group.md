# @visx/group

<a title="@visx/group npm downloads" href="https://www.npmjs.com/package/@visx/group">
  <img src="https://img.shields.io/npm/dm/@visx/group.svg?style=flat-square" />
</a>

A thin wrapper around SVG `<g/>` that positions children via `top`/`left` offsets (instead of
writing `transform="translate(...)"`) and applies a `visx-group` className.

## Installation

```
npm install --save @visx/group
```

Peers: `react` (`^18 || ^19`), and `@types/react` if you use TypeScript.

## Exports

- **Component:** `Group` — translated `<g/>` container

(`GroupProps` is defined in `Group.tsx` but is not re-exported from the package root.)

## Usage

`top`/`left` become `translate(left, top)`. Children render in the translated coordinate space. Extra
SVG `<g>` attributes pass straight through.

```tsx
import { Group } from '@visx/group';

<svg width={400} height={300}>
  <Group top={20} left={40}>
    <rect width={100} height={100} fill="steelblue" />
  </Group>
</svg>
```

## Notes (v4)

- `top`/`left` default to `0`. Passing `transform` overrides them entirely — they are mutually exclusive in practice.
- The `visx-group` className is always applied; a passed `className` is appended, not replaced.
- Extra SVG `<g>` props (`opacity`, `onClick`, `clipPath`, …) pass through via `...restProps`.
- Use `innerRef` to get a ref to the underlying `<g/>` element.
- Only runtime dependency is `classnames`.
