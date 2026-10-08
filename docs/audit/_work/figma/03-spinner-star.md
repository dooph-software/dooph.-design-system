# Loading Spinner — star variant

- Figma node: `907:2182` (symbol "Variant=Variant2", file `Ue4w95t0OjmvpJPJ6EE9bn`)
- Parent component set: `478:832` "Loading Spinner" (found via page metadata of `0:1`)
- Surveyed: 2026-10-03
- Code counterpart: `src/components/LoadingSpinner/` (`LoadingSpinnerVariant.flat` / `.spokes`)
- Calls: get_metadata 907:2182, 0:1; get_variable_defs 907:2182, 478:832; get_design_context 907:2182, 478:831; get_motion_context 907:2182 (recursive), 478:832 (recursive); star SVG fetched from the get_design_context asset URL.

## Variant matrix

Component set `478:832` "Loading Spinner" has ONE property, `Variant`, with two values (exact Figma spelling):

| Value | id | Size |
|---|---|---|
| `Primary` | 478:831 | 24 x 24 (single vector image) |
| `Variant2` | 907:2182 | 24 x 24 |

There is **no size property** and no colour property in Figma for either variant — only a single 24 x 24 instance. Size per size step: **UNREADABLE** (Figma defines only 24).

`Variant2` structure: 24 x 24 frame, `overflow: clip`, containing one instance named `Star` (907:2191), 18 x 18, centred (offset 3,3).

## Bound variables

| Figma variable | Value | Code token |
|---|---|---|
| `Text/text-primary` (bound on 907:2182; the star fill exports as #161616) | #161616 | `--ui-color-text` (#161616) |
| `stroke-width-icon` (bound in the set, on `Primary` only) | 2 | `--ui-icon-stroke-width` |

Note: code's spinner `primary` colour resolves to `--ui-color-primary` (#171717), not `--ui-color-text` (#161616).

## New vs existing

Existing code: `LoadingSpinnerVariant` = `flat` (rAF arc) and `spokes` (eight-spoke icon, CSS `ds-spinner-rotate` linear rotation); `LoadingSpinnerColor` = `primary` / `prominent` (or any CSS colour); `LoadingSpinnerSize` = `sm` 16 / `rg` 22 / `md` 32 / `xl` 40 (`--ui-size-spinner-*`).

NEW in Figma:
1. A third spinner look: a filled four-point star (sparkle), 18 x 18 inside a 24 x 24 box (star = 75% of the box), fill `Text/text-primary`.
2. Figma's name for it is `Variant2` — a placeholder name, not a design-intended prop value.
3. No new tokens are bound beyond `Text/text-primary`.

Existing geometry already in code: `src/components/Shapes/StarShape.tsx` (`STAR_SHAPE_PATH`, 24 viewBox) is the same four-point star, scaled ~1.1663 and offset 1.5 (e.g. Figma 17.156 → code 21.5093; 18,9 → 22.4936,12). So the star outline exists in code as a Shape; it is not used by LoadingSpinner today.

## Visual spec of the new thing

A solid, near-black (#161616 / `Text/text-primary`) four-pointed star with concave sides and softly rounded tips, centred in a 24px square with 3px clear on every side. No stroke, no track, no secondary element.

## Geometry

Star — viewBox `0 0 18 18` (node 907:2191), fill `#161616`, verbatim from Figma asset:

```
M18 9C18.002 9.26384 17.9218 9.52176 17.7706 9.73791C17.6193 9.95406 17.4045 10.1177 17.156 10.2061L12.0566 12.061L10.203 17.1612C10.1116 17.4074 9.94712 17.6197 9.73158 17.7697C9.51605 17.9196 9.2598 18 8.99726 18C8.73472 18 8.47847 17.9196 8.26293 17.7697C8.0474 17.6197 7.8829 17.4074 7.79154 17.1612L5.93795 12.0602L0.838557 10.2061C0.592426 10.1147 0.380152 9.95015 0.23025 9.73455C0.080348 9.51895 0 9.26262 0 9C0 8.73738 0.080348 8.48105 0.23025 8.26545C0.380152 8.04985 0.592426 7.8853 0.838557 7.79391L5.93795 5.93976L7.79154 0.838812C7.8829 0.592607 8.0474 0.380268 8.26293 0.23032C8.47847 0.0803725 8.73472 0 8.99726 0C9.2598 0 9.51605 0.0803725 9.73158 0.23032C9.94712 0.380268 10.1116 0.592607 10.203 0.838812L12.0574 5.93976L17.156 7.79391C17.4045 7.8823 17.6193 8.04594 17.7706 8.26209C17.9218 8.47824 18.002 8.73616 18 9Z
```

Placement in the 24 box: translate(3, 3).

## Motion

`get_motion_context` returned `{"nodes":[]}` for both 907:2182 and the set 478:832 — no keyframe animation is defined in Figma. No prototype interactions or annotations were surfaced by get_design_context. Motion: **UNREADABLE** (not specified in Figma).

## Open questions

1. What is the motion? (constant rotation like `spokes`, pulse/scale, twinkle, rotation + scale, shape morph?) Duration and easing are not in Figma.
2. What is the prop value name? Figma calls it `Variant2`.
3. How does it scale across `sm` 16 / `rg` 22 / `md` 32 / `xl` 40? Is the 18/24 (75%) star-to-box ratio kept at every size?
4. Does it honour the `color` prop (`primary` / `prominent` / arbitrary)? Figma binds `Text/text-primary` (#161616), whereas the code's `primary` resolves to `--ui-color-primary` (#171717).
5. Should it reuse `StarShape`'s existing `STAR_SHAPE_PATH`, or carry the Figma 18-viewBox path as its own geometry?
6. Reduced-motion behaviour?
7. Is there a track/background element in any state? Figma shows none.
