---
name: dooph-ds-loading-indicators
description: Use when editing or debugging LoadingSpinner, ShapeMorphSpinner, ProgressIndicator, WavyDivider or MorphRotationShape; when touching spinnerGeometry.ts, waveGeometry.ts, MorphRotationShape/engine, the .ds-spinner-*, .ds-progress-ring* or .ds-shape-morph CSS, the --ui-spinner-*, --ui-size-spinner-* or --ui-shape-morph-* tokens, or shapeMorphSpring.mjs; or when a spinner arc flashes, a track shows a stray dot or jumps back, or a morph snaps.
---

# Loading indicators

Geometry lives in TypeScript as plain numbers in the SVG's user units; every clock lives in CSS, on tokens. The rendered size of LoadingSpinner, ProgressIndicator and ShapeMorphSpinner is always the `--ui-size-spinner-*` token.

**Not for** LinearProgressIndicator (its own header contract), general motion and SVG rules (dooph-ds-styling), or editing tokens (dooph-ds-editing-tokens).

## The family

| Component | Looks | What moves it |
|---|---|---|
| LoadingSpinner | `flat`, `spokes`, `star` | CSS only (`.ds-spinner-*`) |
| ProgressIndicator | `flat`, `wavy` | flat: one transitioned number, `--ds-pi-progress`; wavy: the consumer's `progress` |
| ShapeMorphSpinner | MorphRotationShape in `autoplay` | the shape-morph clock |
| MorphRotationShape | `autoplay`, `controlled`, `embedded` | a CSS transition of `--ds-shape-morph-step`, sampled by a rAF loop (the only `"use client"` module here) |
| WavyDivider | `high` (20px period), `low` (40px) | static |

The three indicators share `LoadingSpinnerSize` (`sm` 16, `rg` 22 default, `md` 32, `xl` 40 px) and `color` (a DS colour name or any CSS colour, default `primary`). Tracks are always `--ui-color-border-primary`. ProgressIndicator throws on `progress` outside [0, 1] or NaN.

Formulas and numbers: [references/spinner-and-progress-geometry.md](references/spinner-and-progress-geometry.md), [references/shape-morph.md](references/shape-morph.md).

## Rules

1. **No duration, easing curve or timer in these files;** per-size factors reach CSS as plain numbers. The one loop is MorphRotationShape's allowlisted rAF sampler, which only reads transitioned values. *Prevents:* a JS clock that desyncs from its token and reduced motion. Lint checks: "motion timing literals outside tokens.css", "JS timers and animation loops outside their allowlist".
2. **Size through the token, as CSS `width`/`height`;** the numeric diameter stays in the intrinsic attributes (and the `viewBox` for flat and ProgressIndicator). *Prevents:* dead size tokens. Lint check: "var() in SVG geometry attributes".
3. **The flat spinner's arcs are dashes on one OPEN two-lap path**, never one lap, never a `<circle>`. *Prevents:* a dash crossing the seam, splitting and flashing its round caps.
4. **Keep `1 − SPINNER_MAX_SWEEP − 2·gap/C > 0` at every size** (`sm` is tightest: 0.098 turn). *Prevents:* a zero-length track dash, which a round cap paints as a dot.
5. **The flat ring transitions ONLY `--ds-pi-progress`;** every dash value is a `calc()` of it, and `--ds-pi-gap-on` stays unregistered, set from the target. *Prevents:* independent dash transitions restarting mid-flight, so the track slides back or vanishes.
6. **A zero-length arc fades (flat) or is omitted (wavy: `null` track, no indicator at 0).** *Prevents:* a round-cap dot, or a remount mid-animation.
7. **MorphRotationShape: React writes `d` and `transform` on the first render only.** *Prevents:* a re-render mid-step snapping the shape.
8. **Never clamp the step or round a target;** the range comes from `widenRange`. *Prevents:* losing the backspin, drawing the wrong morph while overshooting, erasing a resting hover nudge.
9. **Listen only on the shape's own span;** `embedded` gets state through inherited CSS. *Prevents:* a listener on a host the shape does not own, which breaks inside a consumer's custom trigger.
10. **Retune the spring in `scripts/shapeMorphSpring.mjs`, then run `npm run generate-shape-morph-ease`.** *Prevents:* `npm run build` overwriting a hand-edited token.
11. **Fix the vendored engine only in `engine/svgPath.ts`.** *Prevents:* a port that can no longer be diffed against upstream.

## Common mistakes

| Thought | Reality |
|---|---|
| "A `<circle>` with a dashoffset is simpler." | A one-lap path cuts a dash at the seam. |
| "Transition the ring's dasharray and dashoffset." | Interrupted, four transitions disagree. |
| "`SPINNER_DIAMETERS` is the rendered size." | It is the `viewBox` space. The token is the rendered size. |
| "Clamp the overshoot, it looks like a glitch." | The ease peaks at ≈ 1.095 on purpose: that is the backspin. |
| "Reduced motion should be 0ms." | 0ms fires no `transitionrun`, so the shape never samples. The global block uses 1ms. |

## Verify

1. `npm run lint`.
2. Storybook, under **Progress/**: LoadingSpinner `AllSizes`, `AllSizesSpokes`, `AllSizesStar`, `StarStaysInBox`; ProgressIndicator `Interactive` (drag fast), `WavyProgressSteps`; ShapeMorphSpinner `AllSizes`; MorphRotationShape `Controlled`, `RestingAngle`. WavyDivider is under **Bits & Pieces/**.
3. A hidden browser pane freezes rAF and CSS animations: a stuck frame proves nothing. Step motion yourself: `el.getAnimations()`, `pause()`, set `currentTime`; for MorphRotationShape, swap `requestAnimationFrame` for a queue you pump.
4. With reduced motion on, the flat arc rests at its longest from 12 o'clock, and the spokes, star and autoplay shape stand still.

## Related skills

dooph-ds-styling, dooph-ds-editing-tokens, dooph-ds-writing-components, dooph-ds-codebase-map.
