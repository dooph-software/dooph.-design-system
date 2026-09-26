# @visx/responsive

<a title="@visx/responsive npm downloads" href="https://www.npmjs.com/package/@visx/responsive">
  <img src="https://img.shields.io/npm/dm/@visx/responsive.svg?style=flat-square" />
</a>

Hooks, enhancers, and components for making charts responsive to their parent container or to the
browser window.

## Installation

```
npm install --save @visx/responsive
```

Peers: `react` (`^18 || ^19`), and `@types/react` if you use TypeScript.

## Exports

- **Components:** `ParentSize` (render-prop `({ width, height }) => ...`), `ScaleSVG`
  (viewBox-scaling SVG wrapper).
- **Hooks:** `useParentSize`, `useScreenSize`.
- **HOCs:** `withParentSize` (injects `parentWidth`/`parentHeight`), `withScreenSize` (injects
  `screenWidth`/`screenHeight`).
- **Util:** `debounce`. Plus config/result types (`UseParentSizeConfig`, `ParentSizeProps`, etc.).

## Usage

`ParentSize` measures the container it renders into; give that container an explicit size or the
measured dimensions collapse to 0. `useParentSize` returns a **callback ref** (`parentRef`) plus
`node` and the measured dimensions.

```tsx
import { ParentSize } from '@visx/responsive';

<div style={{ width: '100%', height: 400 }}>
  <ParentSize>{({ width, height }) => <MyChart width={width} height={height} />}</ParentSize>
</div>;

// hook form
import { useParentSize } from '@visx/responsive';
const { parentRef, width, height } = useParentSize({ debounceTime: 150 });
<div ref={parentRef} style={{ width: '100%', height: 400 }}>
  <svg width={width} height={height}>{/* ... */}</svg>
</div>;
```

## Notes (v4)

- **Breaking:** `ParentSize`/`withParentSize` now render a two-div structure (outer relative, inner
  absolute) to avoid an infinite-growth feedback loop inside flex/grid parents.
- **Breaking:** `useParentSize`'s `parentRef` is now a callback ref and the hook also returns `node`;
  it accepts an optional `externalRef` that also receives the measured node.
- `ParentSize`'s render-prop `ref` is the DOM `node`, not an attach callback — use the hook's
  `parentRef` to attach a ref yourself.
- `useParentSize`/`ParentSize`/`withParentSize` need a global `ResizeObserver` or an injected
  `resizeObserverPolyfill`. Import only from the package root (`@visx/responsive`).
