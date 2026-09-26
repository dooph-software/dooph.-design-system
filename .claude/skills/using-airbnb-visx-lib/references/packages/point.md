# @visx/point

<a title="@visx/point npm downloads" href="https://www.npmjs.com/package/@visx/point">
  <img src="https://img.shields.io/npm/dm/@visx/point.svg?style=flat-square" />
</a>

A minimal class representing an `{ x, y }` coordinate, plus two pure helpers to add and subtract points.

## Installation

```
npm install --save @visx/point
```

No React peer dependency.

## Exports

- **Class:** `Point` — `{ x, y }` coordinate (doubles as a type)
- **Functions:** `sumPoints(a, b)`, `subtractPoints(a, b)` — both return a fresh `Point`

## Usage

The constructor takes a single object `{ x, y }` (both default to `0`), not positional args.

```ts
import { Point, sumPoints, subtractPoints } from '@visx/point';

const a = new Point({ x: 2, y: 3 });
const b = new Point({ x: 1, y: 1 });

a.value();   // { x: 2, y: 3 }
a.toArray(); // [2, 3]

sumPoints(a, b).value();      // { x: 3, y: 4 }
subtractPoints(a, b).value(); // { x: 1, y: 2 }

const origin = new Point({}); // { x: 0, y: 0 }
```

## Notes (v4)

- Constructor arg is a single object literal: `new Point({ x, y })`, never `new Point(x, y)`.
- `new Point()` with no argument **throws** (it destructures `undefined`) — use `new Point({})` for an origin.
- `toArray()` returns `number[]`, not a fixed-length tuple.
- No type-only exports — import `Point` for both the value and the type annotation (`p: Point`).
- Helpers are pure/immutable; `x` and `y` are public mutable fields on an instance.
