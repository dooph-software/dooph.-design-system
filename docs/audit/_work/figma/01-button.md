# Button

- Figma node: `5:369` (frame "Button", file `Ue4w95t0OjmvpJPJ6EE9bn`)
- Surveyed: 2026-10-03
- Calls: get_metadata 5:369; get_variable_defs 5:369; get_design_context on 907:1834, 907:2222, 907:2250, 907:2362, 907:2376, 907:2195, 907:2212, 5:370, 6:9, 5:372, 677:976, 677:1009, 38:1947, 38:674, 499:1261, 290:707

## Variant matrix

Variant properties (exact Figma spelling): `Size`, `Style`, `State`.
There is **no content variant property** any more — every symbol has one child frame named `Content` (auto-layout, gap `sm` = 8px) holding icon and/or label. Confirms the maintainer note.

- `Size`: `Big`, `Medium`, `Standard`, `Small`, `Icon`, `Icon Small`, `Icon Micro`
- `Style`: `Prominent`, `Primary`, `Secondary`, `Ghost`, `Danger`, `Text`
- `State`: `Default`, `Hover`, `Active`, `Disabled`

Size x Style coverage actually present in the component set:

| Size | Prominent | Primary | Secondary | Ghost | Danger | Text |
|---|---|---|---|---|---|---|
| Big | yes | yes | yes | — | — | — |
| Medium | yes | yes | yes | — | — | — |
| Standard | yes | yes | yes | yes | yes | yes |
| Small | yes | yes | yes | yes | yes | — |
| Icon | yes | yes | yes | yes | — | — |
| Icon Small | yes | yes | yes | yes | — | — |
| Icon Micro | — | — | — | yes | — | — |

(Prominent Small/Standard: only Default/Hover/Active/Disabled exist — all four present. Every listed cell has all 4 states.)

### Per-size geometry

| Size | Height (bound var) | Horizontal padding | Content gap | Radius | Icon size | Typography role |
|---|---|---|---|---|---|---|
| Big | **54** (`buttonSizes/height-big-button`) on Primary/Secondary; **52, UNBOUND literal** on Prominent (all 4 states) | 32 (literal, unbound) | 8 (`sm`) | 90 (literal, unbound → pill) | 16 | `Hero Button Text` (Google Sans Flex, 16, weight 500, lineHeight 100, letterSpacing 0) |
| Medium | 46 (`buttonSizes/height-medium-button`) | 22 (literal, unbound) | 8 (`sm`) | 90 (literal, unbound → pill) | 16 | `Hero Button Text` (16px) |
| Standard | 38 (`buttonSizes/height-button`) | 12 (`md`) | 8 (`sm`) | 12 (`radius-tight`) | 16 | `Button Text` (Google Sans Flex, size `Body`=14, weight 500, lineHeight 100, letterSpacing 0) |
| Small | 34 (`buttonSizes/height-small-button`) | 12 (`md`) | 8 (`sm`) | 12 (`radius-tight`) | (sample has text only) UNREADABLE | `Button Text` (14px) |
| Standard / Text style | 30 (literal, unbound) | 8 (`sm`) | 8 (`sm`) | 12 (`radius-tight`) | — (text only in sample) | `Button Text` (14px) |
| Icon (square) | 38 x 38 (`buttonSizes/height-button`) | 12 (`md`) declared, content centred | 8 | 12 (`radius-tight`) | 18 | — |
| Icon Small (square) | 34 x 34 (`buttonSizes/height-small-button`) | 12 (`md`) declared | 8 | 12 (`radius-tight`) | 16 | — |
| Icon Micro (square) | 26 x 26 (no height var; derived from padding 6 all sides + 14 icon) | padding 6 (literal) all sides | 8 | 12 (`radius-tight`) | 14 | — |

Rendered widths in the sample ("New Chat" + icon): Big 161, Medium 141, Standard 113, Small 89 (text only), Danger Standard 126 / Small 102, Text 81.

Font variation settings in every label: `"GRAD" 11, "ROND" 100, "wdth" 96`. Label line-height in the generated code is `normal` (style says lineHeight 100).

Border: 1px solid on all filled styles (Prominent/Primary/Secondary/Danger). Ghost / Text / Icon Micro Ghost: no border, no fill at rest.

Shadow per sample:
- Prominent / Primary (Big, Medium, Standard, Small, Icon) Default and Hover: effect style `Shadow Button` (DROP_SHADOW #0000001A, offset 0,1, radius 3.5, spread 0). Note: Big Prominent **Hover** still shows `Shadow Button`, not `Shadow Button:hover`.
- Secondary Standard: `Shadow Secondary Button` (DROP_SHADOW `shadow-black` #3838381a, offset 0,1, radius 4, spread 0).
- Secondary **Big/Medium**: `Shadow Button` (#0000001A, r 3.5) — NOT `Shadow Secondary Button`.
- Icon Small Prominent: **no shadow**. Icon Prominent: `Shadow Button`.
- Disabled (Big Prominent sample): no shadow.
- `Shadow Button:hover` (DROP_SHADOW #00000030, offset 0,1, radius 2.5) exists in the file's variables but which variants use it was not observed in the sampled nodes.

Disabled (Big Prominent sample): fill `ButtonProminent/button-prominent-disabled`, border `ButtonProminent/button-prominent-border-disabled`, the `Content` frame at opacity `opacity-disabled` (60%), label colour `ButtonSecondary/color-content-secondaryButton`.

## Bound variables

| Figma variable | Value | Code token |
|---|---|---|
| `buttonSizes/height-big-button` | 54 | NO CODE TOKEN |
| `buttonSizes/height-medium-button` | 46 | NO CODE TOKEN |
| `buttonSizes/height-button` | 38 | `--ui-height-button` |
| `buttonSizes/height-small-button` | 34 | `--ui-height-button-sm` |
| (Icon Micro 26 — not a variable in Figma) | 26 | `--ui-height-button-micro` |
| `sm` | 8 | `--ui-spacing-xs` (8px) |
| `md` | 12 | `--ui-spacing-rg` (12px) |
| `radius-tight` | 12 | `--ui-radius-tight` |
| `Body` | 14 | `--ui-text-body` |
| `icon-md` | 16 | `--ui-icon-md` |
| `icon-lg` | 18 | `--ui-icon-lg` |
| `icon-rg` | 14 | `--ui-icon-rg` |
| `stroke-width-icon` | 2 | `--ui-icon-stroke-width` |
| `opacity-disabled` | 60 | `--ui-opacity-disabled` (0.6) |
| `Button Text` (style) | GSF 14/500 | `.text-style-button` |
| `Hero Button Text` (style) | GSF 16/500 | `.text-style-hero-button` (`--ui-text-hero-button` 16px) |
| `Shadow Button` (effect) | 0 1 r3.5 #0000001A | `--ui-shadow-button` (code: `0 1px 2px rgba(0,0,0,0.1)`) |
| `Shadow Button:hover` (effect) | 0 1 r2.5 #00000030 | `--ui-shadow-button-hover` (code: `0 1px 2px rgba(0,0,0,0.2)`) |
| `Shadow Secondary Button` (effect) | 0 1 r4 `shadow-black` | `--ui-shadow-button-secondary` (code: `0 1px 4px rgba(0,0,0,0.1)`) |
| `shadow-black` | #3838381a | NO CODE TOKEN |
| `Text/text-primary` | #161616 | `--ui-color-text` |
| `ButtonProminent/button-prominent` | #340fd9 | `--ui-color-prominent` |
| `ButtonProminent/button-prominent-border` | #340fd9 | `--ui-color-prominent-border` |
| `ButtonProminent/button-prominent-hover` | #2406ac | `--ui-color-prominent-hover` |
| `ButtonProminent/button-prominent-border-hover` | #2406ac | `--ui-color-prominent-border-hover` |
| `ButtonProminent/button-prominent-active` | #1a0189 | `--ui-color-prominent-active` |
| `ButtonProminent/button-prominent-border-active` | #1a0189 | `--ui-color-prominent-border-active` |
| `ButtonProminent/button-prominent-disabled` | #f5f5f5 | `--ui-color-prominent-disabled` |
| `ButtonProminent/button-prominent-border-disabled` | #e9e9e9 | `--ui-color-prominent-border-disabled` |
| `ButtonProminent/color-content-brandButton` | #ffffff | `--ui-color-prominent-foreground` |
| `ButtonProminent/color-content-brandButton:hover&active` | #ffffff | NO CODE TOKEN (code reuses `--ui-color-prominent-foreground`) |
| `ButtonPrimary/button-primary` | #171717 | `--ui-color-primary` |
| `ButtonPrimary/button-primary-border` | #171717 | `--ui-color-primary-border` |
| `ButtonPrimary/button-primary-hover` | #2c2c2c | `--ui-color-primary-hover` |
| `ButtonPrimary/button-primary-border-hover` | #2c2c2c | `--ui-color-primary-border-hover` |
| `ButtonPrimary/button-primary-active` | #3d3d3d | `--ui-color-primary-active` |
| `ButtonPrimary/button-primary-border-active` | #3d3d3d | `--ui-color-primary-border-active` |
| `ButtonPrimary/color-content-primaryButton` | #ffffff | `--ui-color-primary-foreground` |
| `ButtonPrimary/color-content-primaryButton:hover&active` | #ffffff | NO CODE TOKEN |
| `ButtonSecondary/button-secondary` | #fdfdfd | `--ui-color-secondary` |
| `ButtonSecondary/button-secondary-border` | #e2e3e4 | `--ui-color-secondary-border` |
| `ButtonSecondary/button-secondary-hover` | #efefef | `--ui-color-secondary-hover` |
| `ButtonSecondary/button-secondary-border-hover` | #e2e3e4 | `--ui-color-secondary-border-hover` |
| `ButtonSecondary/button-secondary-active` | #e3e3e3 | `--ui-color-secondary-active` |
| `ButtonSecondary/border-secondary-border-active` (sic, "border-" prefix) | #e2e3e4 | `--ui-color-secondary-border-active` |
| `ButtonSecondary/button-secondary-disabled` | #f5f5f5 | `--ui-color-secondary-disabled` |
| `ButtonSecondary/button-secondary-border-disabled` | #e9e9e9 | `--ui-color-secondary-border-disabled` |
| `ButtonSecondary/color-content-secondaryButton` | #161616 | `--ui-color-secondary-foreground` |
| `ButtonSecondary/color-content-secondaryButton:hover&active` | #161616 | NO CODE TOKEN |
| `ButtonGhost/color-content-ghostButton` | **#161616** | `--ui-color-ghost-foreground` (code value **#4a4a4a** — MISMATCH) |
| `ButtonGhost/color-content-ghostButton:hover&active` | #161616 | `--ui-color-ghost-foreground-active` |
| `ButtonGhost/button-ghost-hover` | #0000000a | `--ui-color-ghost-hover` |
| `ButtonGhost/button-ghost-active` | #00000014 | `--ui-color-ghost-active` |
| `ButtonDanger/color-content-errorButton` | #ea3f3f | `--ui-color-danger-foreground` |
| `ButtonDanger/color-content-errorButton:hover&active` | #161616 | `--ui-color-danger-foreground-active` |
| `ButtonDanger/button-danger` | #fdfdfd | `--ui-color-danger` |
| `ButtonDanger/button-danger-border` | #e2e3e4 | `--ui-color-danger-border` |
| `ButtonDanger/button-danger-hover` | #ff5858 | `--ui-color-danger-hover` |
| `ButtonDanger/button-danger-border-hover` | #ff5858 | `--ui-color-danger-border-hover` |
| `ButtonDanger/button-danger-border-active` | #ea3f3f | `--ui-color-danger-border-active` |
| `ButtonDanger/button-danger-disabled` | #f5f5f5 | `--ui-color-danger-disabled` |
| `ButtonDanger/button-danger-border-disabled` | #e9e9e9 | `--ui-color-danger-border-disabled` |

(Values are the light/default-mode resolution returned by get_variable_defs; dark values were not returned.)

## New vs existing

Current code (`src/components/Button/Button.tsx`, `constants.ts`): `ButtonSize` = `default`, `sm`, `icon`, `icon-sm`, `icon-micro`; all sizes use `rounded-tight` and `.text-style-button`; base gap `gap-2` (8px). No content-variant prop exists in code already (children only), so the Figma "single Content slot, 8px gap" matches the current code shape.

NEW in Figma:
1. `Size=Big` — height 54 (52 on Prominent, see open questions), px 32, pill radius 90, 16px icon, 16px Hero Button Text. Styles: Prominent, Primary, Secondary only.
2. `Size=Medium` — height 46, px 22, pill radius 90, 16px icon, 16px Hero Button Text. Styles: Prominent, Primary, Secondary only.
3. Tokens needed: height 54 and 46 (`buttonSizes/height-big-button`, `buttonSizes/height-medium-button` → NO CODE TOKEN). Paddings 32 and 22 are literals in Figma (no spacing token: code scale has 28 `xl` and 20 `lg`, neither matches). Radius 90 is a literal (no `--ui-radius-*` full/pill token).
4. Typography: big/medium use `Hero Button Text` → `.text-style-hero-button` already exists.

Existing-but-different (observed, not requested):
- Ghost content colour: Figma `#161616` vs code `--ui-color-ghost-foreground: #4a4a4a`.
- Label `wdth` axis: Figma 96 vs code `--ui-font-var-button` `"wdth" 100`.
- Shadow blur: Figma `Shadow Button` radius 3.5 vs code `--ui-shadow-button` 2px blur; `Shadow Button:hover` radius 2.5 / alpha 0x30 (≈0.19) vs code 2px / 0.2.
- Standard/Text button: Figma 30px high, 8px horizontal padding; code `text` variant uses size `default` (38px, px-3) unless the consumer changes size.
- Icon Micro in Figma exists only as Ghost style.
- Icon Small Prominent has no shadow in Figma; code applies `shadow-button` to prominent at every size.
- Secondary Big/Medium use `Shadow Button`, Secondary Standard uses `Shadow Secondary Button`.

## Visual spec of the new thing (Big / Medium)

Big, Prominent, Default (907:1834): pill (radius 90) filled `ButtonProminent/button-prominent`, 1px border `ButtonProminent/button-prominent-border`, height 52 (literal), padding 0 x 32, content centred, `Content` row with gap 8: 16px icon + label "New Chat" in `Hero Button Text` 16/500, colour `ButtonProminent/color-content-brandButton`; shadow `Shadow Button`.
Big, Prominent, Hover (907:2195): fill/border `-hover` variants, text `ButtonProminent/color-content-brandButton:hover&active`, shadow `Shadow Button`. Same geometry.
Big, Prominent, Disabled (907:2212): fill `button-prominent-disabled`, border `button-prominent-border-disabled`, no shadow, Content opacity 60%, text `ButtonSecondary/color-content-secondaryButton`.
Big, Primary, Default (907:2222): as above with `ButtonPrimary/*` paints, height 54 bound to `buttonSizes/height-big-button`.
Big, Secondary, Default (907:2250): `ButtonSecondary/*` paints, height 54 bound, shadow `Shadow Button`.
Medium, Prominent/Secondary Default (907:2362, 907:2376): height 46 bound to `buttonSizes/height-medium-button`, padding 0 x 22, radius 90, rest identical to Big.

## Geometry

No new shapes. Icon assets are placeholder "plus in circle" icons (Figma asset URLs only; not captured, not part of the spec).

## Open questions

1. Big Prominent is 52px tall with an unbound height, while Big Primary/Secondary are 54px bound to `buttonSizes/height-big-button`. Which is intended?
2. Big/Medium horizontal paddings (32, 22) and pill radius (90) are unbound literals. Should they become tokens, and under what names?
3. Should Ghost, Danger and Text styles exist at Big/Medium? Figma has none.
4. Should Big/Medium have icon-only (square) counterparts? Figma has none.
5. Shadow mapping per state is inconsistent in Figma (Big Prominent Hover keeps `Shadow Button`; Secondary Big/Medium use `Shadow Button` not `Shadow Secondary Button`; Icon Small Prominent has none). Intended or drift?
6. Ghost content colour #161616 in Figma vs #4a4a4a in code — which wins?
7. Label `wdth` 96 in Figma vs 100 in code — intended change?
8. Small size icon dimension — sample variant has no icon, so UNREADABLE.
9. Text style is only defined at a 30px Standard size; is a 30px height intended as its own size in code?
