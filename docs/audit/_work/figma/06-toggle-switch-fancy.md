# Toggle Switch — `Fancy` variants

- Figma node: `826:2149` (frame "Toggle Switch", file `Ue4w95t0OjmvpJPJ6EE9bn`)
- Surveyed: 2026-10-03
- Code counterpart: `ToggleSwitch` / `ToggleSwitchItem` in `src/components/Toggle/Toggle.tsx` (contract header present), options styled by `src/components/Toggle/toggleOption.ts` (contract header present). Option-level spec is in `05-toggle-option-fancy.md`.
- Calls: get_metadata 0:1 (page, for this frame's children); get_variable_defs 826:2149; get_design_context 907:3307, 907:3340, 907:3387, and 826:2159 (existing Primary switch, for comparison).

## Variant matrix

Properties (exact Figma spelling): `Variant`, `Size`, `Toggled`.
- `Variant`: `Primary`, `Ghost`, `Custom`, `Fancy` (NEW), `Fancy+Icon` (NEW), `Fancy Cusotm` (NEW — sic, misspelling of "Custom" in Figma)
- `Size`: `Standard`, `Small`, `Icon`, `Icon Small`
- `Toggled`: `True`, `False`, `Default` (the last only on `Variant=Custom`)

Fancy symbols (all `Size=Standard`, `Toggled=False`; no `Toggled=True` counterparts exist):

| Symbol | id | W x H | Options shown |
|---|---|---|---|
| Variant=Fancy, Size=Standard, Toggled=False | 907:3307 | 200 x 54 | 2: "On" (selected), "Off" |
| Variant=Fancy+Icon, Size=Standard, Toggled=False | 907:3340 | 237 x 54 | 2: "Pay" (selected, icon), "Recieve" (sic) (icon) |
| Variant=Fancy Cusotm, Size=Standard, Toggled=False | 907:3387 | 331 x 54 | 3: "Walk" (selected, icon), "Run" (icon), "Bike" (icon) |

### Container geometry

| Property | Fancy (all three) | Existing Primary/Ghost (826:2159, for comparison) |
|---|---|---|
| Layout | horizontal, `items-start` | horizontal, `items-start` |
| Gap between options | **12** (`md` = 12) | 4 (`xxs`) |
| Height | hug (54 from the options); no height bound | 38 (`buttonSizes/height-button`) |
| Overflow | clip | clip |
| Padding / fill / border / radius on the container | none | none |

Each child is a `Toggle Option` instance (Fancy or Fancy+Icon). In the instances the option height is a literal `54px` (instance override); the main component binds `buttonSizes/height-big-button` (54).

Option geometry/paints are identical to `05-toggle-option-fancy.md`: 2px border, radius 90, padding-right 16 (`lg`), 50 x 50 indicator slot, 28px indicator circle, 14px icon, `Hero Button Text` 16px label in `Text/text-primary`.
- Selected option: border `ButtonProminent/button-prominent`; indicator filled `ButtonProminent/button-prominent`; icon/check white (`ButtonProminent/color-content-brandButton:hover&active`).
- Unselected option (Fancy): border `ButtonSecondary/button-secondary-border`; indicator is an empty 2px `ButtonSecondary/button-secondary-border` ring.
- Unselected option (Fancy+Icon / Fancy Cusotm): border `ButtonSecondary/button-secondary-border`; indicator filled `ButtonSecondary/button-secondary-border`; icon dark (`ButtonSecondary/color-content-secondaryButton`).

## Bound variables

Set-level (826:2149) list, all variants:

| Figma variable | Value | Code token |
|---|---|---|
| `md` | 12 | `--ui-spacing-rg` (12) — used as the Fancy gap |
| `xxs` | 4 | `--ui-spacing-xxs` — existing switch gap |
| `sm` | 8 | `--ui-spacing-xs` |
| `rg` | 10 | `--ui-spacing-sm` (10) |
| `lg` | 16 | `--ui-spacing-md` (16) |
| `buttonSizes/height-big-button` | 54 | NO CODE TOKEN |
| `buttonSizes/height-button` | 38 | `--ui-height-button` |
| `buttonSizes/height-small-button` | 34 | `--ui-height-button-sm` |
| `buttonSizes/height-micro-button` | 28 | `--ui-height-tab-micro` |
| `radius-tight` | 12 | `--ui-radius-tight` |
| `radius-mini` | 10 | `--ui-radius-mini` |
| `icon-rg` | 14 | `--ui-icon-rg` |
| `icon-lg` | 18 | `--ui-icon-lg` |
| `Body` | 14 | `--ui-text-body` |
| `Button Text` (style) | GSF 14/500 | `.text-style-button` |
| `Hero Button Text` (style) | GSF 16/500 | `.text-style-hero-button` |
| `Text/text-primary` | #161616 | `--ui-color-text` |
| `Text/text-inverted` | #ffffff | NO CODE TOKEN |
| `ButtonPrimary/button-primary` | #171717 | `--ui-color-primary` |
| `ButtonPrimary/button-primary-border` | #171717 | `--ui-color-primary-border` |
| `ButtonPrimary/color-content-primaryButton:hover&active` | #ffffff | NO CODE TOKEN |
| `ButtonProminent/button-prominent` | #340fd9 | `--ui-color-prominent` |
| `ButtonProminent/color-content-brandButton:hover&active` | #ffffff | NO CODE TOKEN (value = `--ui-color-prominent-foreground`) |
| `ButtonSecondary/button-secondary-border` | #e2e3e4 | `--ui-color-secondary-border` |
| `ButtonSecondary/color-content-secondaryButton` | #161616 | `--ui-color-secondary-foreground` |
| `ButtonGhost/button-ghost-active` | #00000014 | `--ui-color-ghost-active` |

## New vs existing

Existing code: `ToggleVariant` = `primary`, `ghost`, `unselected`; `ToggleSize` = `default` 38, `sm` 34, `icon` 38, `icon-sm` (→ 28 micro icon option). `ToggleSwitch` root is `inline-flex items-center gap-xxs` with the inline comment "Figma Toggle Switch: xxs (4px) between options in every variant."

NEW in Figma:
1. Switch variants `Fancy`, `Fancy+Icon`, `Fancy Cusotm` composed of Fancy / Fancy+Icon Toggle Options (54px, pill, leading indicator).
2. Gap between options is **12** for the Fancy variants, not 4 — contradicts the code comment "xxs (4px) between options in every variant" (a comment, not a `## constraints` item).
3. Selected option paints with prominent (#340fd9 border + indicator), not primary/ghost fill.
4. `Fancy Cusotm` differs from `Fancy+Icon` only in having 3 options with different consumer icons (walk / run / bike) — i.e. it demonstrates N options with per-option icons, not a different look.
5. Behaviour from the `Toggle.tsx` header (selection can never be cleared; controlled/uncontrolled) is not contradicted by anything in Figma.

## Visual spec of the new thing

A row of 54px pill-shaped options spaced 12px apart. The chosen option has a 2px violet (#340fd9) outline and a solid violet 28px circle at its left holding a white check (Fancy) or white icon (Fancy+Icon). Each other option has a 2px light-grey (#e2e3e4) outline and either an empty grey ring (Fancy) or a solid grey circle with a dark icon (Fancy+Icon). Labels are 16px Google Sans Flex medium, #161616, in every option, 16px right padding.

## Geometry

No new geometry beyond `05-toggle-option-fancy.md` (check mark path, 28px indicator circle). Option icons in `Fancy+Icon` / `Fancy Cusotm` are consumer-supplied placeholders (card, walk, run, bike); not captured.

## Open questions

1. Is `Fancy Cusotm` a real third variant, or just a demo of `Fancy+Icon` with 3 options (and a typo)? Code likely needs only "fancy" with an optional per-item icon.
2. Fancy switch gap 12 vs 4 elsewhere — should the gap be per-variant in code (the root currently hard-codes `gap-xxs`)?
3. Only `Size=Standard` (54) exists for Fancy switches. Other sizes?
4. Selection change motion (border colour, ring → filled circle, check appearing) — not specified in Figma.
5. Hover / press / disabled appearance of the switch's options comes only from the option set (Toggled=False only); selected-state hover/press/disabled is undrawn (see 05).
6. Can Fancy be mixed with `ToggleVariant.unselected` per item, as the existing variants allow?
7. `Toggled` on the switch set is a single value per symbol (`False`) while the children show one selected option — the switch-level `Toggled` property appears meaningless for Fancy; confirm.
8. Keyboard / focus-visible styling for 2px-bordered pill options (existing options rely on `focus-visible:border-input-border-focus`, which would compete with the always-on 2px border).
