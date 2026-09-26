# @visx/drag

<a title="@visx/drag npm downloads" href="https://www.npmjs.com/package/@visx/drag">
  <img src="https://img.shields.io/npm/dm/@visx/drag.svg?style=flat-square" />
</a>

Make chart and interface elements draggable, tracking position (`x`/`y`) and delta (`dx`/`dy`) with
optional box or SVG-path restrictions.

## Installation

```
npm install --save @visx/drag
```

Peers: `react` (`^18 || ^19`), and `@types/react` if you use TypeScript.

## Exports

- **`Drag`** — render-prop component; calls `useDrag` and (while dragging) renders a full-size
  capture `<rect>` so movement is tracked across the whole `width × height` area.
- **`useDrag`** — hook returning `{ x, y, dx, dy, isDragging, dragStart, dragMove, dragEnd }`.
- **`raise`** — `raise(items, index)` returns a copy with that item moved to the end (z-order).
- **Types:** `DragProps`, `UseDrag`, `UseDragOptions`, `DragState`, `HandlerArgs`,
  `MouseTouchOrPointerEvent`.

## Usage

The dragged element must wire `onPointerDown/Move/Up` to `dragStart/dragMove/dragEnd` itself.
Position it at `x + dx`, `y + dy`. `x`/`y` are `number | undefined` (start position), so guard them.

```tsx
import { Drag, raise } from '@visx/drag';

<svg width={width} height={height}>
  <Drag width={width} height={height}>
    {({ x, y, dx, dy, isDragging, dragStart, dragMove, dragEnd }) => (
      <circle
        cx={(x ?? width / 2) + dx}
        cy={(y ?? height / 2) + dy}
        r={20}
        fill={isDragging ? 'red' : 'steelblue'}
        onPointerDown={dragStart}
        onPointerMove={dragMove}
        onPointerUp={dragEnd}
      />
    )}
  </Drag>
</svg>;

// hook form
const { dx, dy, isDragging, dragStart, dragMove, dragEnd } = useDrag({ resetOnStart: true });
```

## Notes (v4)

- `snapToPointer` defaults to `true` (in both `useDrag` and `Drag`); set `false` to drag from where
  you grabbed rather than snapping the element origin to the cursor.
- `restrict` clamps to a `{ xMin, xMax, yMin, yMax }` box; `restrictToPath` (an `SVGGeometryElement`)
  overrides `restrict` entirely.
- `captureDragArea` (default `true`) only covers movement while already dragging — the element still
  needs its own pointer handlers to start a drag.
- Built on `@visx/event` (`localPoint`). Import only from the package root (`@visx/drag`).
