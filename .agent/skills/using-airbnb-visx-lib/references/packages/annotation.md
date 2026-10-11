# @visx/annotation

<a title="@visx/annotation npm downloads" href="https://www.npmjs.com/package/@visx/annotation">
  <img src="https://img.shields.io/npm/dm/@visx/annotation.svg?style=flat-square" />
</a>

Composable SVG annotation primitives — Subject + Connector + Label — for calling out points,
thresholds, or regions of a chart, optionally drag-editable.

## Installation

```
npm install --save @visx/annotation
```

Peers: `react` (`^18 || ^19`), and `@types/react` if you use TypeScript.

## Exports

- **Container:** `Annotation` (context provider), `EditableAnnotation` (drag-editable wrapper)
- **Subjects:** `CircleSubject`, `LineSubject`
- **Connector:** `Connector`
- **Labels:** `Label` (SVG title/subtitle), `HtmlLabel` (arbitrary HTML in a `<foreignObject>`)
- **Context:** `AnnotationContext` (use via `useContext`; no hook exported)
- **Types:** `AnnotationProps`, `CircleSubjectProps`, `LineSubjectProps`, `ConnectorProps`,
  `LabelProps`, `HtmlLabelProps`, `EditableAnnotationProps`, `AnnotationContextType`

## Usage

`Annotation` renders no SVG itself — it provides `{ x, y, dx, dy }` via context. `(x, y)` is the
subject position; `(dx, dy)` is the label offset. Children read context (explicit props win). Place
it inside an `<svg>`.

```tsx
import { Annotation, EditableAnnotation, Connector, CircleSubject, Label } from '@visx/annotation';

// Static
<svg width={400} height={300}>
  <Annotation x={150} y={120} dx={60} dy={-40}>
    <Connector type="elbow" />
    <CircleSubject radius={14} />
    <Label title="Peak value" subtitle="June 2026" />
  </Annotation>
</svg>

// Editable (drag) — width/height required
<svg width={400} height={300}>
  <EditableAnnotation x={150} y={120} dx={60} dy={-40} width={400} height={300}
    onDragEnd={({ x, y, dx, dy }) => save({ x, y, dx, dy })}>
    <Connector />
    <CircleSubject />
    <Label title="Drag me" />
  </EditableAnnotation>
</svg>
```

## Notes (v4)

- `Connector` defaults to `type='elbow'` (`'line'` for a straight subject→label segment); arrowhead
  markers are not yet supported.
- `Label`/`HtmlLabel` auto-measure via `ResizeObserver` — inject `resizeObserverPolyfill` if it isn't
  global, or sizing breaks. `Label` returns `null` when both `title` and `subtitle` are empty.
- `LineSubject` requires `min`/`max`; `EditableAnnotation` requires `width`/`height`.
- Subjects use a truthy check (`x || context.x`), so an explicit `x={0}` falls back to context —
  pass non-zero coords or omit. Without a wrapper, give each child explicit `x/y/dx/dy`.
- All parts set `pointerEvents="none"`; only `EditableAnnotation`'s handles capture interaction.
  Import only from the package root.
