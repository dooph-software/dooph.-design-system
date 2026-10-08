# 05b — Hero CTA: fixed shapes (change record)

Checklist
- [x] Register `EightLeafCloverShape` (barrel, `Shapes` const, `shapePaths.ts`, Shapes stories)
- [x] CTA tokens (icon, shape and gap per size; label weight); helpers; sync-theme EXCLUDED; `npm run sync-tokens`
- [x] `text-style-cta` class + `cn` text-style group
- [x] CTAButton: fixed shape per size, paints, icon size, hug layout, label role, header contract
- [x] Stories
- [x] lint + scoreboard

## Hero CTA end mark becomes a fixed shape; new CTA label style

**Files**
- `src/components/CTAButton/CTAButton.tsx`, `CTAButton.stories.tsx`
- `src/components/Shapes/EightLeafCloverShape.tsx`, `BaseShape.tsx`, `index.ts`, `shapePaths.ts`, `Shapes.stories.tsx`
- `src/styles/tokens.css` (CTA section + one weight token), `src/styles/index.css` (`.text-style-cta`; generated block via sync-tokens), `src/styles/theme.css` (generated)
- `src/styles/dooph-component-tokens.css` (CTA helper section only)
- `scripts/sync-theme.mjs` (EXCLUDED list, CTA + weight entries only)
- `src/utils/cn.ts` (text-style group)

**What changed**
- The round end chip is replaced by a FIXED shape per size: the eight-leaf clover at `standard`
  (46px, fills its 46px frame) and the puff at `big` (50px, centred in its 60px frame). Static on
  hover; only the label rolls, as before. The shape is the `Shapes/` primitive, not a copy.
- Paints: primary CTA's shape uses the secondary-button bg (`text-secondary` → `--ui-color-secondary`);
  secondary CTA's shape uses the primary-button bg (`--ui-color-primary`). The icon now takes the
  matching content colour (`secondary-fg` / `primary-fg`); before, it inherited whatever colour the
  page gave the link.
- Icon slot: 22px standard / 26px big (`--ui-size-cta-icon-standard` / `-big`, helpers
  `.ds-size-cta-icon-standard` / `-big`), replacing the single 20px `--ui-size-cta-icon`.
- Layout: both sizes use 16px pill padding (`p-lg`; big was 12) and a 60px label → mark gap (new
  `--ui-spacing-cta-content-standard` 60px + `.ds-gap-cta-content-standard`; standard was 42px
  `gap-xxxl`). Content min-widths (330 / 350) kept. The big pill's 370px min-width is dropped —
  the pill now hugs.
- Label: new `.text-style-cta` (components layer) — the button role's family, axes and optical
  sizing at `--ui-weight-cta` (new, = semibold 600), sized `--ui-text-cta-standard` (24px). The big
  CTA sets 28px (`--ui-text-cta-big`) through BaseText's `fontSize` prop. Was ButtonText at medium
  (500). Registered in `cn`'s text-style group.
- `EightLeafCloverShape` registered: barrel export, `Shapes.eightLeafClover`, `shapePaths.ts`
  (so MorphRotationShape accepts it), Shapes stories. Its `EIGHT_LEAF_CLOVER_SHAPE_PATH` constant
  held the FOUR-leaf clover outline (same string as `CLOVER_SHAPE_PATH`) while the JSX drew the
  eight-leaf path inline; the constant now holds the drawn eight-leaf path and the JSX uses it. The
  rendered geometry is unchanged byte for byte. Note the path overshoots the 24 box (≈ −1.08…25.08),
  as Figma's does; the SVG's default overflow clip trims the leaf tips exactly as Figma's clipPath.
- `ShapeProps.size` widened `number` → `number | string` (BaseIcon already takes CSS lengths), so
  shapes can be sized from a token.
- CTAButton gained a header contract: the shape is fixed per size and static, by maintainer
  decision; shapes are the `Shapes/` primitives.

**Consumer impact**
- CTAs look different (by design): shape end mark, bigger icon, semibold label, wider standard gap,
  big pill padding 12 → 16. An `icon` sized for the old 20px slot now sits in a 22/26px slot; pass
  `size="100%"` (as the stories do) to fill it.
- New exports: `EightLeafCloverShape`, `EIGHT_LEAF_CLOVER_SHAPE_PATH`, `Shapes.eightLeafClover`.

**Breaking:** yes — v6 (removed tokens/helpers):
- `--ui-size-cta-icon` (20px) → `--ui-size-cta-icon-standard` (22px) / `--ui-size-cta-icon-big` (26px)
- `.ds-size-cta-icon` → `.ds-size-cta-icon-standard` / `.ds-size-cta-icon-big`
- `--ui-min-w-cta-pill-big` (370px) → removed, no replacement (the pill hugs)
- `.ds-min-w-cta-pill-big` → removed, no replacement
- New, non-breaking: `--ui-size-cta-shape-standard` (= chip-standard) / `--ui-size-cta-shape-big` (50px),
  `--ui-spacing-cta-content-standard` (60px), `--ui-weight-cta`, `.text-style-cta`,
  `.ds-gap-cta-content-standard`.

**Verified**
- `npm run lint` (tsc --noEmit) exit 0.
- `npm run sync-tokens` run; no new Tailwind theme keys from the new tokens.
- Scoreboard: no metric rose (before m2 19 / m8 8 → after m2 18 / m8 6; those drops are other agents').
- Not visually verified (Storybook not run, per brief).

**Judgment calls for the maintainer**
- Kept the content min-widths (Figma's chosen "hug" frame also has min-w 330). Code's big
  min-width is 350, Figma's is 330 — left at 350, not in this brief.
- `.text-style-cta` is a CSS class only; there is no `TextVariant.cta` / `CTAText` (Text/** was out
  of lane). CTAButton renders `<BaseText unstyled className="text-style-cta">`.

**Docs owed**
- CHANGELOG (v6 token removals above; new shape export; CTA look change).
- Skills/token docs listing text styles (`text-style-cta`) and CTA tokens; shapes list (eight-leaf clover).

## DONE
