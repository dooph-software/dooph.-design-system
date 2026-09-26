# @visx/zoom

<a title="@visx/zoom npm downloads" href="https://www.npmjs.com/package/@visx/zoom">
  <img src="https://img.shields.io/npm/dm/@visx/zoom.svg?style=flat-square" />
</a>

A render-prop component (`Zoom`) plus matrix utilities for applying pan / zoom / pinch / wheel
transforms to a viewport or chart via a 2D affine `TransformMatrix`.

## Installation

```
npm install --save @visx/zoom
```

Peers: `react` (`^18 || ^19`), and `@types/react` if you use TypeScript.

## Exports

- **`Zoom`** — render-prop component (generic over the container element type).
- **Matrix utils:** `identityMatrix`, `createMatrix`, `inverseMatrix`, `applyMatrixToPoint`,
  `applyInverseMatrixToPoint`, `scaleMatrix`, `translateMatrix`, `multiplyMatrices`, `composeMatrices`.
- **Types:** `ZoomProps`, `TransformMatrix`, `ProvidedZoom`, `ZoomState`, `Scale`, `Translate`, etc.

## Usage

Attach `zoom.containerRef` to your interactive element to auto-wire drag/pinch/wheel (via
`@use-gesture/react`); you can also manually wire the provided `handleWheel`/`dragStart`/`dragMove`/
`dragEnd` handlers. Wrap content in a `<g transform={zoom.toString()}>`. Zoom in/out by calling
`scale({ scaleX, scaleY })` with a factor `>1` / `<1` — there are no `zoomIn`/`zoomOut` methods.

```tsx
import { Zoom } from '@visx/zoom';

<Zoom<SVGSVGElement> width={width} height={height} scaleXMin={0.5} scaleXMax={4} scaleYMin={0.5} scaleYMax={4}>
  {(zoom) => (
    <svg
      width={width}
      height={height}
      ref={zoom.containerRef}
      style={{ cursor: zoom.isDragging ? 'grabbing' : 'grab', touchAction: 'none' }}
    >
      <g transform={zoom.toString()}>{/* chart content */}</g>
      <button onClick={() => zoom.scale({ scaleX: 1.2, scaleY: 1.2 })}>+</button>
      <button onClick={zoom.reset}>reset</button>
    </svg>
  )}
</Zoom>;
```

## Notes (v4)

- No `useZoom` hook — only the `Zoom` render-prop component. Pass the element generic
  (`Zoom<SVGSVGElement>`) so `containerRef` is typed correctly.
- The default `constrain` only clamps SCALE to `scaleX/Y` min/max. To bound panning/translation,
  supply a custom `constrain` prop (use the exported matrix utils to compute corners).
- `handleWheel` calls `preventDefault()`; set `touchAction: 'none'` for correct gesture behavior.
- `toString()` emits `matrix(scaleX, skewY, skewX, scaleY, translateX, translateY)` — note the skew
  ordering. Import only from the package root (`@visx/zoom`).
