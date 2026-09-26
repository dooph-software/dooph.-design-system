# @visx/bounds

<p>
  <a title="@visx/bounds npm downloads" href="https://www.npmjs.com/package/@visx/bounds">
    <img src="https://img.shields.io/npm/dm/@visx/bounds.svg?style=flat-square" />
  </a>
</p>

A single HOC, `withBoundingRects`, that injects a component's own bounding rect plus its parent's —
used to keep tooltips/overlays from overflowing their container.

## Installation

```
npm install --save @visx/bounds
```

Peers: `react` (`^18 || ^19`), `react-dom`, and `@types/react`(+`@types/react-dom`) if you use
TypeScript.

## Exports

- **`withBoundingRects`** — HOC injecting `rect`, `parentRect`, `getRects`, and `nodeRef`.
- **Type:** `WithBoundingRectsProps`.

## Usage

The wrapped component receives a `nodeRef` and **must** attach it to the DOM element it wants
measured. `rect`/`parentRect` are `undefined` until after mount, so guard before using them.

```tsx
import { withBoundingRects, WithBoundingRectsProps } from '@visx/bounds';

type TooltipProps = Omit<WithBoundingRectsProps, 'nodeRef'> & {
  left: number;
  top: number;
  nodeRef?: React.Ref<HTMLDivElement>;
  children?: React.ReactNode;
};

function Tooltip({ left: initialLeft, top: initialTop, rect, parentRect, nodeRef, children }: TooltipProps) {
  let left = initialLeft;
  let top = initialTop;
  if (rect && parentRect) {
    left = rect.right > parentRect.right ? left - rect.width : left;
    top = rect.bottom > parentRect.bottom ? top - rect.height : top;
  }
  return (
    <div ref={nodeRef} style={{ position: 'absolute', top, left }}>
      {children}
    </div>
  );
}

export default withBoundingRects(Tooltip); // nodeRef MUST be attached above
```

## Notes (v4)

- **Breaking:** the HOC no longer uses `findDOMNode`. It measures `nodeRef.current`, so the wrapped
  component must forward `nodeRef` to a real DOM node — otherwise `rect`/`parentRect` never populate.
- `rect`/`parentRect` are `undefined` on first render; guard with `if (rect && parentRect)`.
- Call the injected `getRects()` to recompute on demand (feed the result into state to re-render).
- `parentRect` is measured from the attached node's `parentNode`. Import only from the package root
  (`@visx/bounds`).
