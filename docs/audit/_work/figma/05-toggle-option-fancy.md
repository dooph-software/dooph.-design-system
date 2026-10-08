# Toggle Option — `Fancy` / `Fancy+Icon` variants

- Figma node: `826:1723` (frame "Toggle Option", file `Ue4w95t0OjmvpJPJ6EE9bn`)
- Surveyed: 2026-10-03
- Code counterpart: `src/components/Toggle/toggleOption.ts` (`toggleOptionVariants`, shared by `ToggleSwitchItem` and `TabsTrigger`) — this file carries a `## behavior` / `## constraints` contract header (see "New vs existing").
- Calls: get_metadata 0:1 (page, for this frame's children); get_variable_defs 826:1723, 907:3048, 907:3224, 907:3231; get_design_context 907:3048, 907:3147, 907:3168, 907:3175, 907:3182, 907:3224, 907:3231, 907:3238, 907:3245, 907:3252; icon SVGs fetched from the get_design_context asset URLs.

## Variant matrix

Properties (exact Figma spelling): `Variant`, `State`, `Size`, `Toggled`.
- `Variant`: `Primary`, `Ghost`, `Fancy` (NEW), `Fancy+Icon` (NEW)
- `State`: `Default`, `Hover`, `Active`, `Disabled`
- `Size`: `Standard`, `Small`, `Micro`, `Icon Standard`, `Icon Small`, `Icon Micro`
- `Toggled`: `True`, `False`, and one stray `Default` (907:2998 "Variant=Ghost, State=Default, Size=Icon Small, Toggled=Default")

Fancy symbols (all `Size=Standard`, all 54 tall):

| Symbol | id | W x H |
|---|---|---|
| Variant=Fancy, State=Default, Size=Standard, Toggled=True | 907:3048 | 103 x 54 |
| Variant=Fancy, State=Default, Size=Standard, Toggled=False | 907:3147 | 103 x 54 |
| Variant=Fancy, State=Hover, Size=Standard, Toggled=False | 907:3168 | 103 x 54 |
| Variant=Fancy, State=Active, Size=Standard, Toggled=False | 907:3175 | 103 x 54 |
| Variant=Fancy, State=Disabled, Size=Standard, Toggled=False | 907:3182 | 103 x 54 |
| Variant=Fancy+Icon, State=Default, Size=Standard, Toggled=True | 907:3224 | 97 x 54 |
| Variant=Fancy+Icon, State=Default, Size=Standard, Toggled=False | 907:3231 | 97 x 54 |
| Variant=Fancy+Icon, State=Hover, Size=Standard, Toggled=False | 907:3238 | 97 x 54 |
| Variant=Fancy+Icon, State=Active, Size=Standard, Toggled=False | 907:3245 | 97 x 54 |
| Variant=Fancy+Icon, State=Disabled, Size=Standard, Toggled=False | 907:3252 | 97 x 54 |

Only `Size=Standard` exists for Fancy; Hover / Active / Disabled exist only for `Toggled=False`.

### Geometry (both Fancy variants)

| Part | Value |
|---|---|
| Height | 54 (`buttonSizes/height-big-button`) |
| Border | 2px solid (paint per state, below) |
| Radius | 90 (literal, unbound → pill) |
| Overflow | clip |
| Padding | left 0, right 16 (`lg`), vertical 0 |
| Indicator slot | square, full inner height (54 − 2×2 border = 50 x 50), content centred |
| Indicator | 28 x 28 circle (`buttonSizes/height-micro-button` = 28), radius 90 |
| Indicator icon | 14 x 14 (`icon-rg`) |
| Content frame | gap 8 (`sm`), label only in samples |
| Label | `Hero Button Text` — Google Sans Flex 16, weight 500, lineHeight 100, letterSpacing 0; variation `"GRAD" 11, "ROND" 100, "wdth" 96`; colour `Text/text-primary` |
| Gap between indicator slot and content | 0 (none set) |

### Paints per state

| State | Outer border | Outer fill | Indicator (Fancy) | Indicator (Fancy+Icon) | Icon stroke | Label |
|---|---|---|---|---|---|---|
| Default, Toggled=True | `ButtonProminent/button-prominent` | none | filled `ButtonProminent/button-prominent`, white check | filled `ButtonProminent/button-prominent`, white custom icon | `ButtonProminent/color-content-brandButton:hover&active` (#ffffff) | `Text/text-primary` |
| Default, Toggled=False | `ButtonSecondary/button-secondary-border` | none | EMPTY ring: 2px border `ButtonSecondary/button-secondary-border`, no fill, no icon | filled `ButtonSecondary/button-secondary-border`, dark icon | `ButtonSecondary/color-content-secondaryButton` (#161616) | `Text/text-primary` |
| Hover, Toggled=False | `ButtonSecondary/button-secondary-border` | `ButtonGhost/button-ghost-hover` | empty ring as above | filled `ButtonSecondary/button-secondary-border`, dark icon | (as Default off) | `Text/text-primary` |
| Active, Toggled=False | `ButtonSecondary/button-secondary-border` | `ButtonGhost/button-ghost-active` | empty ring as above | filled `ButtonSecondary/button-secondary-border`, dark icon | (as Default off) | `Text/text-primary` |
| Disabled, Toggled=False | `ButtonSecondary/button-secondary-border` | none | empty ring as above (full opacity) | filled `ButtonSecondary/button-secondary-border` (full opacity); the 14px Icon frame at `opacity-disabled` (60%) | (as Default off, dimmed) | Content frame at `opacity-disabled` (60%) |

Note: in Disabled only the label `Content` frame (and, on Fancy+Icon, the icon) is dimmed to 60%; the outer border and the indicator circle/ring stay full strength.

## Bound variables

| Figma variable | Value | Code token |
|---|---|---|
| `buttonSizes/height-big-button` | 54 | NO CODE TOKEN |
| `buttonSizes/height-micro-button` | 28 | `--ui-height-tab-micro` (28px) — code name differs |
| `buttonSizes/height-button` | 38 | `--ui-height-button` |
| `buttonSizes/height-small-button` | 34 | `--ui-height-button-sm` |
| `lg` | 16 | `--ui-spacing-md` (16) — code `--ui-spacing-lg` is 20 |
| `sm` | 8 | `--ui-spacing-xs` |
| `rg` | 10 | `--ui-spacing-sm` (10) — code `--ui-spacing-rg` is 12 |
| `icon-rg` | 14 | `--ui-icon-rg` |
| `icon-md` | 16 | `--ui-icon-md` |
| `icon-lg` | 18 | `--ui-icon-lg` |
| `radius-tight` | 12 | `--ui-radius-tight` |
| `radius-mini` | 10 | `--ui-radius-mini` |
| `Body` | 14 | `--ui-text-body` |
| `Button Text` (style) | GSF 14/500 | `.text-style-button` |
| `Hero Button Text` (style) | GSF 16/500 | `.text-style-hero-button` |
| `opacity-disabled` | 60 | `--ui-opacity-disabled` (0.6) |
| `Text/text-primary` | #161616 | `--ui-color-text` |
| `Text/text-inverted` | #ffffff | NO CODE TOKEN |
| `ButtonProminent/button-prominent` | #340fd9 | `--ui-color-prominent` |
| `ButtonProminent/color-content-brandButton:hover&active` | #ffffff | NO CODE TOKEN (value = `--ui-color-prominent-foreground`) |
| `ButtonPrimary/button-primary` | #171717 | `--ui-color-primary` |
| `ButtonPrimary/button-primary-border` | #171717 | `--ui-color-primary-border` |
| `ButtonSecondary/button-secondary-border` | #e2e3e4 | `--ui-color-secondary-border` |
| `ButtonSecondary/color-content-secondaryButton` | #161616 | `--ui-color-secondary-foreground` |
| `ButtonGhost/button-ghost-hover` | #0000000a | `--ui-color-ghost-hover` |
| `ButtonGhost/button-ghost-active` | #00000014 | `--ui-color-ghost-active` |

(The set-level list includes variables used by the non-fancy variants too; the Fancy-specific ones are those in the paint table.)

## New vs existing

Existing code (`toggleOption.ts`): variants `primary`, `ghost`, `unselected`; sizes `default` 38, `sm` 34, `micro` 28, `fill`, `icon`, `icon-sm`, `icon-micro`; text role `.text-style-button` (14px); 1px transparent border; `rounded-tight` / `rounded-mini`.

NEW in Figma:
1. Variant `Fancy`: 54px pill option with a leading 28px radio-like indicator — empty 2px ring when off, prominent-filled circle with a white 14px check when on; whole option gets a 2px prominent border when on, 2px `#e2e3e4` border when off.
2. Variant `Fancy+Icon`: same shell, but the 28px indicator is always filled (secondary-border grey when off, prominent when on) and holds a consumer icon (14px) — dark when off, white when on.
3. New size: 54px (no code token; `buttonSizes/height-big-button`). Label uses `Hero Button Text` (16px) instead of `Button Text` (14px). Radius 90 (pill) — no code radius token.
4. Selected paint is PROMINENT (`ButtonProminent/*`), unlike the existing `primary` variant (filled primary #171717) and `ghost`.
5. Label stays `Text/text-primary` in every state (no inversion when selected).

Contract conflict to raise (not resolved here): the `## behavior` header of `src/components/Toggle/toggleOption.ts` states "The unselected look is ONE look shared by every variant: the base with no `selected:` rule applied — transparent, no border, text-text…" and "Disabled drops any fill". Figma's Fancy unselected look has a 2px `#e2e3e4` border and an indicator ring, and Fancy+Icon's unselected indicator has a grey fill — so adding these variants alters behaviour that header describes; the header would need updating in the same change. (The listed `## constraints` — neutral module; never prefix a package class with a variant — are not directly contradicted by the spec.)

## Visual spec of the new thing

Fancy, off: white-on-page pill, 54px tall, 2px light-grey (#e2e3e4) outline. On the left, a 50px square slot holds a 28px hollow circle with a 2px #e2e3e4 outline. Label "Grid" in 16px Google Sans Flex medium, #161616, 16px right padding. Hover adds a 4% black wash over the whole pill; press adds 8%. Disabled dims only the label to 60%.
Fancy, on: outline turns 2px #340fd9; the circle becomes solid #340fd9 with a white 14px check mark (stroke 2, round caps).
Fancy+Icon, off: same outline; the 28px circle is solid #e2e3e4 with a dark (#161616) 14px icon (stroke 1.25 in sample). On: outline and circle #340fd9, icon white.

## Geometry

Check mark (Fancy, Toggled=True) — viewBox `0 0 14 14`, stroke white, width 2, round caps/joins:
```
M11.6667 3.5L5.25 9.91667L2.33333 7
```
Fancy+Icon sample icon (consumer-supplied placeholder, "card with arrow-up"), viewBox `0 0 14 14`, stroke 1.25, round caps/joins:
```
M7 10.5H2.33333C2.02391 10.5 1.72717 10.3771 1.50838 10.1583C1.28958 9.9395 1.16667 9.64275 1.16667 9.33333V4.66667C1.16667 4.35725 1.28958 4.0605 1.50838 3.84171C1.72717 3.62292 2.02391 3.5 2.33333 3.5H11.6667C11.9761 3.5 12.2728 3.62292 12.4916 3.84171C12.7104 4.0605 12.8333 4.35725 12.8333 4.66667V7.58333
M10.5 7H10.507
M11.0833 12.8333V9.33333
M12.8333 11.0833L11.0833 9.33333L9.33333 11.0833
M3.5 7H3.50704
M7 8.16667C7.64433 8.16667 8.16667 7.64433 8.16667 7C8.16667 6.35567 7.64433 5.83333 7 5.83333C6.35567 5.83333 5.83333 6.35567 5.83333 7C5.83333 7.64433 6.35567 8.16667 7 8.16667Z
```
Indicator: circle, diameter 28 (ring stroke 2 inside when off).

## Open questions

1. Hover / Active / Disabled for `Toggled=True` are not drawn — what does a selected Fancy option look like on hover/press/disabled?
2. Fancy+Icon Disabled dims the icon to 60% but leaves the grey indicator fill at full strength, while Fancy Disabled leaves the ring untouched — intended difference?
3. Is Fancy only ever 54px (`Size=Standard`), or should it exist at 38 / 34 / 28?
4. Transition between off and on (ring → filled circle + check; border colour): animated? duration/easing? Figma has no motion.
5. Should the check mark be a fixed DS icon or consumer-supplied?
6. Fancy uses prominent for selection; should there be a primary-coloured Fancy too?
7. Focus-visible appearance for Fancy (existing options use `ds-focus-visible-ring` + `focus-visible:border-input-border-focus`; with a 2px always-on border this needs a decision).
8. Disabled: Figma dims only the label, not the border or ring — intended, given the existing `ds-disabled-control` opacity applies to the whole control?
9. Name the new 54px height token (Figma `buttonSizes/height-big-button`) — shared with Button Big?
10. Figma `Variant=Fancy+Icon` is a separate variant rather than an icon slot on `Fancy` — should code model it as one variant with an optional icon?
