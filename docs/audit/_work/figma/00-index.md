# Figma survey — index

- File: `Ue4w95t0OjmvpJPJ6EE9bn` (page `0:1` "Page 1")
- Surveyed: 2026-10-03, via Figma MCP (get_metadata / get_variable_defs / get_design_context / get_motion_context; SVG paths from the design-context asset URLs). Read-only on code.

| File | Node | Summary |
|---|---|---|
| [01-button.md](01-button.md) | 5:369 | New `Size=Big` (54, px 32, pill r90, 16px Hero Button Text) and `Size=Medium` (46, px 22, pill r90) for Prominent/Primary/Secondary only; no content variant property — one `Content` slot, gap 8. Big Prominent is an unbound 52 vs 54 elsewhere; also flags ghost-fg #161616 vs code #4a4a4a and `wdth` 96 vs 100. Open questions: 9. |
| [02-hero-cta.md](02-hero-cta.md) | 759:1112 | CTA end chip becomes a fixed shape: Default = 8 Leaf Clover (46, viewBox 46), Big = Puff (50 in a 60 frame); icon 22 / 26. Both paths captured verbatim; label is Host Grotesk Medium in Figma vs ButtonText in code. Open questions: 9. |
| [03-spinner-star.md](03-spinner-star.md) | 907:2182 | Loading Spinner set (478:832) gains `Variant=Variant2`: a filled 4-point star 18 in a 24 box, fill `Text/text-primary`; path captured, same outline as existing `StarShape`. No sizes and no motion defined in Figma (UNREADABLE). Open questions: 7. |
| [04-slider-tall-step.md](04-slider-tall-step.md) | 577:962 | Slider Step gains `Selection=CurrentlySelected`: 6 x 12 capsule (in a 6 x 10 frame) vs the 6 x 6 dot, for Active/Inactive x Primary/Prominent; paints unchanged and already tokenised. Which step is tall / animation are behavioural unknowns. Open questions: 8. |
| [05-toggle-option-fancy.md](05-toggle-option-fancy.md) | 826:1723 | New `Fancy` and `Fancy+Icon` options: 54 pill, 2px border (prominent when on, #e2e3e4 off), leading 28px indicator (empty ring / check, or filled circle + icon), 16px label. Conflicts with the `toggleOption.ts` behavior header ("one shared unselected look"). Open questions: 10. |
| [06-toggle-switch-fancy.md](06-toggle-switch-fancy.md) | 826:2149 | New switch variants `Fancy`, `Fancy+Icon`, `Fancy Cusotm` (sic): rows of Fancy options with a 12px gap (vs 4 in code's hard-coded `gap-xxs`). Only Standard / Toggled=False drawn. Open questions: 8. |

UNREADABLE values: Button `Size=Small` icon size (no icon in sample); spinner star size per size step and motion (Figma defines a single 24px instance and no keyframes).

## DONE
