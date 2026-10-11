# MorphRotationShape and ShapeMorphSpinner

Sources: `src/components/MorphRotationShape/` (`MorphRotationShape.tsx` and its header contract, `geometry.ts`, `timing.ts`, `constants.ts`, `engine/`), `src/components/ShapeMorphSpinner/ShapeMorphSpinner.tsx`, the `.ds-shape-morph*` rules and `@property` registrations in `src/styles/index.css`, the `--ui-shape-morph-*` tokens in `src/styles/tokens.css`, and `scripts/shapeMorphSpring.mjs` + `scripts/generate-shape-morph-ease.mjs`.

## The motion model

CSS owns every duration and curve; the component samples one value and writes geometry.

| Custom property | Registered? | Who sets it | Meaning |
|---|---|---|---|
| `--ds-shape-morph-target` | no (inherits) | inline (`controlled`), the clock handler (`autoplay`), an ancestor's CSS (`embedded`) | the stop to go to |
| `--ds-shape-morph-step` | yes, `<number>`, not inherited | `.ds-shape-morph`: `var(--ds-shape-morph-target, 0)` | transitioned over `--ui-shape-morph-duration` on `--ui-shape-morph-ease`. Integer part = stop, fraction = morph progress |
| `--ds-shape-morph-nudge` | no | a host's hover CSS | the hover lean input |
| `--ds-shape-morph-lean` | yes | `.ds-shape-morph`: `var(--ds-shape-morph-nudge, 0)` | transitioned over `--ui-motion-duration-base` on `--ui-motion-ease-enter` |
| `--ds-shape-morph-clock` | yes | keyframes `ds-shape-morph-clock` | exists only so autoplay has an animation whose iterations mark each step |

Drawn value `v = step + lean`; target = `target + nudge`. Two properties, because a click while hovered and a hover while open end in the same final style, and only separate transitions can give them different feels.

**Sampling loop.** On its own span's `transitionrun` (for `step` or `lean`), and in autoplay on `animationstart`/`animationiteration` of `ds-shape-morph-clock` (which also increments the target), the component starts a `requestAnimationFrame` loop. Each frame does one `getComputedStyle`, widens the motion range, and draws. It stops when `v` is within 0.001 of the target and of the previous frame. `onStepComplete` fires only on landing on a new whole stop. In controlled mode it also starts the loop directly, in case `transitionrun` is not delivered.

**Segment.** `widenRange` keeps `[lo, hi]` = floor/ceil of every target and settled value seen, and resets only on landing. `segmentAt(v, lo, hi)` clamps `floor(v)` into `[lo, hi − 1]`, so overshoot past the far stop stays on its own segment. The drawn morph is `Morph(shape[segment], shape[segment + 1]).asCubics(v − segment)`. The angle interpolates linearly between the two stops' angles.

## Modes

| Mode | Steps when | Stops are | Turn per step |
|---|---|---|---|
| `autoplay` | every `--ui-shape-morph-interval`, from the clock | shape indices, cycling | 90° |
| `controlled` | `activeIndex` changes (integer required) | one new stop per change, always forward, directly to the new shape | 90°, or derived from `restingAngle` |
| `embedded` | an ancestor's CSS sets `--ds-shape-morph-target` (DropdownCaret: `[data-state="open"]` sets 1) | shape indices: a target two away passes through the shape between; a lower target plays the morph and turn in reverse | 90°, or derived from `restingAngle` |

`shapes` takes DS shape components or `Shapes` keys, at least two; the keys are the form a Server Component can pass. Changing the array's elements remounts the inner component, back to stop 0, without animation.

`restingAngle`: each step's turn comes from `stepTurn(from, restingAngle, symmetry, 90)`. `symmetry` is the shape's measured rotational order about the frame centre (0.5, 0.5), up to 12, tolerance 0.01. The turn is the clockwise candidate nearest 90° that lands on `restingAngle` modulo `360 / symmetry`, and never 0. A shape with no symmetry (Pentagon) therefore steps 360°.

## Fit

Paths are drawn in 0..100 units (`toPathD(cubics, 100)`, 2 decimals) in a `viewBox="0 0 100 100"` with `overflow: visible`, filled with `currentColor`.

- **autoplay (loader fit)**: each shape is bounds-normalized; `rotationSafeScale` = the minimum over all shapes of `max(boundsW / maxBoundsW, boundsH / maxBoundsH)`, so every shape survives any rotation. The scale is `rotationSafeScale × ACTIVE_INDICATOR_SCALE` (38/48, Compose's 38dp indicator in a 48dp box), re-centred on each frame's bounds. The outer `<g>` also spins once per `--ui-shape-morph-passive-spin-duration`.
- **controlled / embedded (frame fit)**: shapes keep the 24-unit viewBox scale about a FIXED centre (`rotate(angle 50 50)` only), so at rest the shape is pixel-identical to the static Shape component. Rotation and overshoot spill about 9% past the box, so frames reserve that as padding (the stories use `inset-[11px]` in a 120px box).
- `polygonFromSvgPath` normalizes by the source viewBox (24), centred at (0.5, 0.5), never by the path's own bounds: bounds scaling stretches a shape that does not touch all four edges (Pentagon is 23 units tall), and the resting morph would stop matching the static Shape.

## Timing

| Token | Default | Notes |
|---|---|---|
| `--ui-shape-morph-duration` | 498ms | GENERATED |
| `--ui-shape-morph-ease` | `linear(…)`, 65 stops | GENERATED; peaks ≈ 1.095 (the backspin) |
| `--ui-shape-morph-interval` | 650ms | time between autoplay step starts |
| `--ui-shape-morph-passive-spin-duration` | 4666ms | one passive revolution (autoplay) |
| `--ui-shape-morph-nudge` | 0.15 | hover lean, a fraction of one step |

The `timing` prop writes these as inline custom properties for one instance: `duration` and `ease` (all modes), plus `interval` and `passiveSpinDuration` (autoplay). A number is milliseconds.

**The spring.** `scripts/shapeMorphSpring.mjs` holds `SPRING` (damping 0.6, stiffness 200, visibility threshold 0.1), `SETTLE_MS` 200 and `EASE_SAMPLES` 64. It ports Compose's analytic spring and its duration estimate (cut-off ≈ 298ms), then replaces Compose's one-frame snap with a cubic-Hermite settle carrying position and velocity to rest: 298 + 200 ≈ 498ms. `scripts/generate-shape-morph-ease.mjs` (`npm run generate-shape-morph-ease`, also part of `npm run build`) writes the two tokens between the `__SHAPE_MORPH_EASE_START__` / `__SHAPE_MORPH_EASE_END__` markers in `tokens.css`.

**Reduced motion.** `.ds-shape-morph` transitions shorten to `var(--ui-motion-duration-fast)`, which the global block has already collapsed to 1ms. The 1ms is deliberately not 0: a 0ms transition fires no `transitionrun`, and embedded mode has no other signal that its target moved. The autoplay clock and the passive spin stop (`animation: none`), so ShapeMorphSpinner rests on its first shape.

## ShapeMorphSpinner

MorphRotationShape in `autoplay`, `role="progressbar"`, `aria-label` default "Loading" (the consumer's wins), `inline-block shrink-0`, `width`/`height` = `var(--ui-size-spinner-<size>)` (default `rg`), and `color` through `resolveDsColor` (default `primary`). The default sequence is `Shapes` keys: cookie, clover, puff, squircle, pentagon, capsule (exported as components in `SHAPE_MORPH_SPINNER_SHAPES`). Keys keep the module free of `"use client"`, so it renders from a Server Component.

## Engine

`engine/cubic.ts`, `morph.ts`, `polygon.ts` and `utils.ts` are vendored (shape-morph, MIT, itself a port of AOSP androidx.graphics.shapes, Apache 2.0; see `THIRD_PARTY_NOTICES.md`). Their contract: stay a faithful port, so it can be diffed against upstream. Behaviour fixes go in `engine/svgPath.ts`, which re-derives sharp-corner convexity from the tangents (without it, Morph pairs a staircase's inner steps with outer ones). `svgPath.ts` throws on arc commands; no DS shape uses them.
