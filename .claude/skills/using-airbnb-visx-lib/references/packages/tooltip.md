# @visx/tooltip

<a title="@visx/tooltip npm downloads" href="https://www.npmjs.com/package/@visx/tooltip">
  <img src="https://img.shields.io/npm/dm/@visx/tooltip.svg?style=flat-square" />
</a>

Tooltip state + rendering primitives for visx charts: a `useTooltip` hook for state, `Tooltip`/`TooltipWithBounds` for rendering, and a `Portal`-based variant that escapes z-index/overflow clipping.

## Installation

```
npm install --save @visx/tooltip
```

Peers: `react` (`^18 || ^19`), `react-dom`, and `@types/react` (+`@types/react-dom`) if you use TypeScript.

## Exports

- **Hooks:** `useTooltip` (state), `useTooltipInPortal` (portal + bounds + coord conversion), `useTooltipPosition` (read flip state)
- **Components:** `Tooltip`, `TooltipWithBounds` (auto-flips near edges), `Portal`, `TooltipPositionConsumer`
- **HOC:** `withTooltip` — injects `useTooltip` state as props (works with class components)
- **Styles/types:** `defaultStyles` (a `CSSProperties` object), plus every `…Props` type

## Usage

`useTooltip()` returns `{ tooltipOpen, tooltipLeft, tooltipTop, tooltipData, showTooltip, hideTooltip, updateTooltip }`. `useTooltipInPortal({ detectBounds })` returns `{ containerRef, TooltipInPortal, containerBounds, forceRefreshBounds }`. The canonical pattern pairs these with `localPoint` from `@visx/event`. Tooltips render `<div>`s — render them as siblings of the SVG, never inside it.

```tsx
import { useTooltip, useTooltipInPortal, defaultStyles } from '@visx/tooltip';
import { localPoint } from '@visx/event';

function ChartWithTooltip({ width, height }) {
  const { tooltipData, tooltipLeft, tooltipTop, tooltipOpen, showTooltip, hideTooltip } =
    useTooltip();
  // detectBounds:true => renders TooltipWithBounds; containerRef is a CALLBACK ref
  const { containerRef, TooltipInPortal } = useTooltipInPortal({ detectBounds: true, scroll: true });

  const handleMove = (event, datum) => {
    const coords = localPoint(event.target.ownerSVGElement, event) || { x: 0, y: 0 };
    showTooltip({ tooltipLeft: coords.x, tooltipTop: coords.y, tooltipData: datum });
  };

  return (
    <>
      <svg ref={containerRef} width={width} height={height}>
        {/* marks with onMouseMove={(e) => handleMove(e, datum)} onMouseLeave={hideTooltip} */}
      </svg>
      {tooltipOpen && (
        <TooltipInPortal key={Math.random()} top={tooltipTop} left={tooltipLeft} style={defaultStyles}>
          {String(tooltipData)}
        </TooltipInPortal>
      )}
    </>
  );
}
```

## Notes (v4)

- `containerRef` is a **callback ref** (attach via `ref={containerRef}`), not a mutable ref object.
- `showTooltip` always forces `tooltipOpen: true`; use `updateTooltip` to control `tooltipOpen` yourself.
- `key={Math.random()}` on the tooltip forces bounds to re-measure each render.
- `TooltipWithBounds` positions via CSS `transform`, so `style.left`/`style.top` overrides do nothing.
- `useTooltipInPortal`/`Portal` depend on `ResizeObserver` and `document`; pass a `polyfill` option for environments without `ResizeObserver`.
- Without a portal: wrap the chart in a `position: relative` div and render `<TooltipWithBounds>`/`<Tooltip>` directly with container-relative coords.
- Import only from the package root (`@visx/tooltip`).
