# Slider Step — tall ("CurrentlySelected") variant

- Figma node: `577:962` (frame "Slider Step", file `Ue4w95t0OjmvpJPJ6EE9bn`)
- Surveyed: 2026-10-03
- Code counterpart: step dots inside `SliderBase` in `src/components/Slider/Slider.tsx` (used by `SliderStepped` and `SliderLabeled stepped`)
- Calls: get_metadata 0:1 (page, to read this frame's children); get_variable_defs 577:962; get_design_context 577:962 (whole set, all 8 variants).

## Variant matrix

Properties (exact Figma spelling): `State` = `Active`, `Inactive`; `SliderVariant` = `Primary`, `Prominent`; `Selection` = `Default`, `CurrentlySelected` (NEW).

| Symbol | id | Frame | Painted pill |
|---|---|---|---|
| State=Active, SliderVariant=Primary, Selection=Default | 577:990 | 6 x 6 | 6 x 6, radius 90 |
| State=Inactive, SliderVariant=Primary, Selection=Default | 577:963 | 6 x 6 | 6 x 6, radius 90 |
| State=Active, SliderVariant=Prominent, Selection=Default | 761:3409 | 6 x 6 | 6 x 6, radius 90 |
| State=Inactive, SliderVariant=Prominent, Selection=Default | 761:3411 | 6 x 6 | 6 x 6, radius 90 |
| State=Active, SliderVariant=Primary, Selection=CurrentlySelected | 907:3008 | 6 x 10 | **6 x 12**, radius 90 |
| State=Inactive, SliderVariant=Primary, Selection=CurrentlySelected | 907:3010 | 6 x 10 | **6 x 12**, radius 90 |
| State=Active, SliderVariant=Prominent, Selection=CurrentlySelected | 907:3012 | 6 x 10 | **6 x 12**, radius 90 |
| State=Inactive, SliderVariant=Prominent, Selection=CurrentlySelected | 907:3014 | 6 x 10 | **6 x 12**, radius 90 |

Structure of every variant: an outer frame plus one child pill, the child spanning the full frame width (`left: 0; right: 0`), vertically centred (`top: 50%; translateY(-50%)`), radius 90 (literal, unbound → fully round).
- Default: child height follows `aspect-ratio 6/6` → 6px dot.
- CurrentlySelected: child height is a fixed **12px** inside a **10px** frame — the pill overflows its frame by 1px top and bottom while staying centred. Width stays 6.

## Bound variables

| Figma variable | Value | Code token |
|---|---|---|
| `SliderPrimary/step-active` | #16161680 (rgba 22,22,22,0.5) | `--ui-color-slider-step-primary-active` (rgba(22,22,22,0.5)) |
| `SliderProminent/step-active` | #16161699 (rgba 22,22,22,0.6) | `--ui-color-slider-step-prominent-active` (rgba(22,22,22,0.6)) |
| `ButtonSecondary/button-secondary-border` | #e2e3e4 | `--ui-color-slider-step-inactive` (aliases `--ui-color-secondary-border`, #e2e3e4) |

Paint per variant (same for Default and CurrentlySelected):
- Active + Primary → `SliderPrimary/step-active`
- Active + Prominent → `SliderProminent/step-active`
- Inactive (either variant) → `ButtonSecondary/button-secondary-border`

No new variable is bound on the CurrentlySelected variants — only geometry changes.

## New vs existing

Existing code: every step dot is `size-[6px] rounded-full`, centred on the track, coloured by `data-active` (value ≤ current) via `.ds-slider-dot` / `--ds-slider-step-active`. No per-step "selected" state, no height change, no prop for it.

NEW in Figma:
1. A `Selection` axis with `CurrentlySelected`: the step is a 6 x 12 vertical pill (vs 6 x 6 dot), centred on the same point, same paint as its Active/Inactive state.
2. It applies to BOTH Active and Inactive steps and both slider variants, so the tall step can sit on either side of the fill.
3. No token exists for the 12px height (or the 10px frame). Dot size 6 is also a literal in code (`size-[6px]`) and in Figma.

Maintainer intent (from brief, not from Figma): which step is tall is driven by a controlled prop — showing what is currently / previously selected while changing.

## Visual spec of the new thing

On the 22px stepped track, the regular steps are 6px round dots. The designated step is drawn as a 6px-wide, 12px-tall capsule (fully rounded ends), vertically centred on the track's midline, in the same colour its dot would have (translucent #161616 at 50% Primary / 60% Prominent when on the filled side; #e2e3e4 when on the unfilled side).

## Geometry

No path data — the step is a rounded rectangle: width 6, height 12, corner radius 3 (radius 90 clamped to half-width). Frame 6 x 10 (pill overflows by 1px each end).

## Open questions

1. Prop API: which step(s) are tall is controlled by what prop (a value, an array, "previous value" vs "current value")? Can more than one step be tall at once?
2. Is the tall step the one at the currently committed value, the value before the drag began, or both (brief says "currently/previously selected")?
3. Does the tall step change while dragging or only on commit?
4. Transition: does the height animate between 6 and 12 (duration/easing), or switch discretely like the current dot colour does deliberately?
5. Is the 10px frame vs 12px pill overflow intentional (hit/layout box 10, visual 12), or should the visual be 10?
6. When the thumb sits exactly on the tall step, is the step hidden under the 6 x 42 handle, or should it remain visible/offset?
7. Should 12 (and 6) become tokens (e.g. alongside `--ui-height-slider-track` / `--ui-width-slider-handle`)?
8. Does the `custom` slider variant (code-only, no Figma counterpart) get the same tall step behaviour?
