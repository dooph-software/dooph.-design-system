# Hero CTA Button

- Figma node: `759:1112` (frame "Hero CTA Button", file `Ue4w95t0OjmvpJPJ6EE9bn`)
- Surveyed: 2026-10-03
- Code counterpart: `src/components/CTAButton/CTAButton.tsx` (`CTAButton`, sizes `standard` / `big`, variants `primary` / `secondary`)
- Calls: get_metadata 759:1112; get_variable_defs 759:1112, 907:1791, 907:1820, 907:1771, 907:1827; get_design_context 759:1111, 759:1113, 759:1131, 759:1140; SVG assets fetched from the get_design_context asset URLs.

## Variant matrix

Properties (exact Figma spelling): `Variant` = `Primary`, `Secondary`; `Size` = `Default`, `Big`.

| Symbol | id | Outer frame |
|---|---|---|
| Variant=Primary, Size=Default | 759:1111 | 378 x 94 |
| Variant=Primary, Size=Big | 759:1113 | 391 x 100 |
| Variant=Secondary, Size=Default | 759:1131 | 378 x 94 |
| Variant=Secondary, Size=Big | 759:1140 | 391 x 100 |

No `State` property — no hover/active/disabled variants in Figma.

### Per-size geometry

| Part | Default | Big |
|---|---|---|
| Outer ring padding | 8 (`xs`) | 8 (`xs`) |
| Outer ring border | Primary: 2px solid rgba(56,56,56,0.5) (unbound literal); Secondary: none | same |
| Outer radius | 90 (literal) | 90 (literal) |
| Pill padding (all sides) | 16 (`md` — resolves 16 here) | 12 (`md` — resolves 12 on this node; see open questions) |
| Pill gap | 12 (`rg`) | 12 (`rg`) |
| Pill radius | 90 (literal) | 90 (literal) |
| Pill shadow | `Shadow Strong` (DROP_SHADOW `shadowBlackStrong` #38383826, offset 0,1, radius 4, spread 0) | same |
| Content frame | width 330 fixed, min-w 330, `justify-between`, padding-left 12 (`rg`) | Primary: width 351, min-w 330, `justify-between`, padding-left 16 (`lg`). Secondary: hug, min-w 330, gap 60 (literal), padding-left 16 (`lg`), label `flex: 1 0 0` |
| Label | Host Grotesk Medium, 24px, weight 500, line-height normal (no text style bound) | Host Grotesk Medium, 28px, weight 500 |
| End mark frame | 46 x 46 | 60 x 60 |
| End mark SHAPE | **8 Leaf Clover**, 46 x 46, centred | **Puff**, 50 x 50, placed at (5,5) inside the 60 frame |
| End mark icon | inset 26.09% → 22 x 22 (chevrons-right, stroke 2) | inset 28.33% → 26 x 26 (chevrons-right, stroke 2.5) |

Sample labels: Default "Get a Demo", Big "Become a Tester".

## Bound variables

| Figma variable | Value | Code token |
|---|---|---|
| `primaryButton/bg-primaryButton` | #171717 | `--ui-color-primary` (#171717) |
| `primaryButton/color-content-primaryButton` | #ffffff | `--ui-color-primary-foreground` |
| `secondaryButton/bg-secondaryButton` | #fcfcfc | NO CODE TOKEN with this value (`--ui-color-secondary` is #fdfdfd; `--ui-color-surface-secondary` is #fcfcfc) |
| `secondaryButton/color-content-secondaryButton` | #161616 | `--ui-color-secondary-foreground` |
| `ButtonSecondary/button-secondary` | #fdfdfd | `--ui-color-secondary` |
| `ButtonSecondary/color-content-secondaryButton` | #161616 | `--ui-color-secondary-foreground` |
| `ButtonSecondary/color-content-secondaryButton:hover&active` | #161616 | NO CODE TOKEN |
| `ButtonPrimary/color-content-primaryButton:hover&active` | #ffffff | NO CODE TOKEN |
| `xs` | 8 | `--ui-spacing-xs` |
| `rg` | 12 | `--ui-spacing-rg` |
| `md` | 16 (Default) / 12 (Big, per fallback in generated code) | `--ui-spacing-md` (16) / `--ui-spacing-rg` (12) |
| `lg` | 16 | `--ui-spacing-md` (16) — note code `--ui-spacing-lg` is 20 |
| `shadowBlackStrong` | #38383826 | NO CODE TOKEN (value matches `--ui-shadow-cta` colour rgba(56,56,56,0.15)) |
| `Shadow Strong` (effect) | 0 1 r4 #38383826 | `--ui-shadow-cta` (code: `0 1px 2px rgba(56,56,56,0.15)`) |

Paints per part (pill paints from generated code; shape/icon paints matched by value against the variables bound on the end-mark frames 907:1791 / 907:1771 / 907:1820 / 907:1827):

| Part | Primary | Secondary |
|---|---|---|
| Pill fill | `primaryButton/bg-primaryButton` #171717 | `ButtonSecondary/button-secondary` #fdfdfd |
| Label | `primaryButton/color-content-primaryButton` #ffffff | `ButtonSecondary/color-content-secondaryButton` #161616 |
| Shape fill (clover / puff) | `secondaryButton/bg-secondaryButton` #FCFCFC | `ButtonSecondary/color-content-secondaryButton:hover&active` #161616 |
| Icon stroke | `secondaryButton/color-content-secondaryButton` #161616 | `ButtonPrimary/color-content-primaryButton:hover&active` #ffffff |
| Outer ring border | 2px rgba(56,56,56,0.5) (unbound) | none |

## New vs existing

Existing code: `CTAButton` renders the end mark as a `rounded-full` chip (`bg-secondary` on primary / `bg-primary` on secondary) sized `--ui-size-cta-chip-standard` 46 / `--ui-size-cta-chip-big` 60, with a 20px icon (`--ui-size-cta-icon`) and `px-rg` padding.

NEW in Figma:
1. The circular chip is replaced by a FIXED shape per size: Default → **8 Leaf Clover** (46 x 46, fills the 46 frame); Big → **Puff** (50 x 50 drawn inside a 60 x 60 frame with 5px inset on every side).
2. Icon size is no longer 20: Default 22 x 22 (stroke 2), Big 26 x 26 (stroke 2.5). Code `--ui-size-cta-icon: 20px` does not match either.
3. Shape paints: primary shape is #FCFCFC (`secondaryButton/bg-secondaryButton`) where the code chip is `bg-secondary` (#fdfdfd); secondary shape is #161616 where the code chip is `bg-primary` (#171717).
4. Label font in Figma is **Host Grotesk Medium** (unbound); code uses `ButtonText` (button role, Google Sans Flex). Sizes 24 / 28 match `--ui-text-cta-standard` / `--ui-text-cta-big`.
5. Big pill gap is 12 in Figma; code big uses `gap-md` (16). Default content in Figma is fixed width 330 with `justify-between`; code uses `gap-xxl` (40) + min-width 330.

Existing shape code (observed in the working tree, untracked/modified, NOT verified against Figma by the maintainer):
- `src/components/Shapes/EightLeafCloverShape.tsx` + `svgs/eightleafclover.svg` exist (24 viewBox). Its path is the Figma 46-viewBox path scaled by 24/46 (e.g. 44.3589 → 23.1438). The file exports a constant named `CLOVER_SHAPE_PATH` holding the 4-leaf Clover path (same name as `CloverShape.tsx`'s export) and is not registered in `shapePaths.ts` / `index.ts`.
- `src/components/Shapes/PuffShape.tsx` path is the Figma 50-viewBox path scaled by 24/50 (19.5722 → 9.39467).

## Visual spec of the new thing

Default (Primary): a 2px grey-translucent ring (8px gap) around a near-black pill (#171717, fully rounded, 16px padding, soft 1px-offset 4px shadow). Inside: white 24px Host Grotesk label left (12px inset), and at the right end a 46px off-white eight-leaf clover with a dark 22px double-chevron ("»") centred on it.
Big (Primary): same ring; pill padding 12; label 28px with 16px left inset; right end a 60px frame holding a 50px off-white "puff" (scalloped circle with many shallow lobes) and a 26px dark double-chevron (stroke 2.5).
Secondary: no outer border; pill #fdfdfd; label #161616; shape #161616 with white chevrons.

## Geometry

### 8 Leaf Clover — viewBox `0 0 46 46` (node 907:1817 / 907:1821), verbatim from Figma asset

```
M44.3589 22.9997C48.0739 29.9236 45.2672 36.1921 38.1032 38.1025C36.1921 45.2672 29.9236 48.0732 22.9997 44.3589C16.0757 48.0739 9.80727 45.2672 7.89672 38.1032C0.732852 36.1921 -2.07388 29.9236 1.641 22.9997C-2.07388 16.0757 0.732852 9.80727 7.89672 7.89672C9.80727 0.732852 16.0757 -2.07388 22.9997 1.641C29.9236 -2.07388 36.1921 0.732852 38.1025 7.89672C45.2672 9.80727 48.0732 16.0757 44.3589 22.9997Z
```
Export wraps it in a `clipPath` rect 46x46; path overshoots the box slightly (min x -2.07, max x ~48.07), so the clip trims the leaf tips.

### Puff — viewBox `0 0 50 50` (node 907:1773 / 907:1828), verbatim from Figma asset

```
M19.5722 2.08995C19.8418 1.86717 19.9765 1.75578 20.0995 1.66175C22.9985 -0.553916 27.0015 -0.553916 29.9005 1.66175C30.0235 1.75578 30.1583 1.86717 30.4278 2.08995C30.5482 2.1894 30.6083 2.23914 30.6679 2.28647C32.0321 3.3717 33.7046 3.9867 35.4403 4.0412C35.5159 4.04358 35.5937 4.04456 35.7491 4.04651C36.0974 4.05087 36.2715 4.05306 36.4256 4.06092C40.056 4.24598 43.1227 6.84543 43.9335 10.4251C43.9679 10.577 44.0003 10.7499 44.065 11.0956C44.0938 11.2499 44.1083 11.327 44.1238 11.4019C44.4784 13.1191 45.3684 14.6763 46.6631 15.8452C46.7196 15.8961 46.7786 15.9473 46.8965 16.0497C47.1603 16.2792 47.2924 16.3939 47.4054 16.5C50.0688 18.9992 50.7639 22.9819 49.1074 26.2505C49.037 26.3892 48.9519 26.5427 48.7815 26.8495C48.7054 26.9866 48.6674 27.055 48.6316 27.1223C47.8105 28.668 47.5014 30.4387 47.7497 32.175C47.7605 32.2506 47.773 32.3281 47.7982 32.4831C47.8543 32.8303 47.8824 33.0039 47.9015 33.1586C48.3515 36.8025 46.35 40.3048 43.0011 41.7331C42.859 41.7938 42.6961 41.8559 42.3704 41.9803C42.2248 42.0359 42.1522 42.0636 42.0818 42.092C40.4694 42.743 39.1059 43.8987 38.1914 45.3898C38.1514 45.4548 38.1117 45.5223 38.0324 45.6575C37.8545 45.9598 37.7656 46.1111 37.6818 46.242C35.7079 49.3256 31.9461 50.7088 28.4719 49.6283C28.3245 49.5825 28.1602 49.5244 27.8315 49.4081C27.6847 49.3563 27.6113 49.3303 27.5394 49.3064C25.89 48.758 24.11 48.758 22.4606 49.3064C22.3887 49.3303 22.3154 49.3563 22.1687 49.4081C21.84 49.5244 21.6756 49.5825 21.5281 49.6283C18.0539 50.7088 14.2921 49.3256 12.3183 46.242C12.2345 46.1111 12.1455 45.9598 11.9677 45.6575C11.8883 45.5223 11.8486 45.4548 11.8087 45.3898C10.8942 43.8987 9.53065 42.743 7.91818 42.092C7.84786 42.0636 7.77514 42.0359 7.62972 41.9803C7.30397 41.8559 7.14108 41.7938 6.99895 41.7331C3.65008 40.3048 1.64849 36.8025 2.0985 33.1586C2.11759 33.0039 2.14571 32.8303 2.20191 32.4831C2.22701 32.3281 2.23955 32.2506 2.25039 32.175C2.49863 30.4387 2.18954 28.668 1.36848 27.1223C1.33266 27.055 1.29464 26.9866 1.21858 26.8495C1.04821 26.5427 0.963019 26.3892 0.892707 26.2505C-0.763874 22.9819 -0.0687258 18.9992 2.59461 16.5C2.70765 16.3939 2.83965 16.2792 3.10364 16.0497C3.22148 15.9473 3.2804 15.8961 3.33688 15.8452C4.63173 14.6763 5.52171 13.1191 5.87622 11.4019C5.89168 11.327 5.90614 11.2499 5.93503 11.0956C5.99977 10.7499 6.03215 10.577 6.06656 10.4251C6.87738 6.84543 9.94401 4.24598 13.5745 4.06092C13.7286 4.05306 13.9027 4.05087 14.2509 4.04651C14.4064 4.04456 14.4841 4.04358 14.5598 4.0412C16.2954 3.9867 17.9681 3.3717 19.3323 2.28647C19.3917 2.23914 19.4519 2.1894 19.5722 2.08995Z
```

### Placeholder icon (chevrons-right), for reference only — consumer-supplied in code
Default, viewBox `0 0 22 22`, stroke 2, round caps/joins:
`M5.5 15.5833L10.0833 11L5.5 6.41667` and `M11.917 15.5833L16.5003 11L11.917 6.41663`
Big, viewBox `0 0 26 26`, stroke 2.5:
`M6.5 18.4167L11.9167 13L6.5 7.58333` and `M14.083 18.4167L19.4997 13L14.083 7.58337`

## Open questions

1. Is the shape choice (clover for Default, puff for Big) locked per size, or should it be a prop with these as defaults?
2. Should the shape animate on hover (e.g. via the existing shape-morph / rotation tooling) or stay static? Figma shows no states.
3. Big pill padding: Figma binds a variable named `md` that resolves to 12 on Big and 16 on Default — two different `md` variables, or a mis-bind?
4. Big Primary content is a fixed 351 width with `justify-between`; Big Secondary is hug with a 60 gap. Which layout is intended?
5. Label font: Host Grotesk Medium (Figma, unbound) vs ButtonText / Google Sans Flex (code). Which role should the CTA label use?
6. Primary shape fill #FCFCFC (`secondaryButton/bg-secondaryButton`) has no code token — map to `--ui-color-secondary` (#fdfdfd), `--ui-color-surface-secondary` (#fcfcfc), or a new CTA token?
7. Should the icon size become per-size tokens (22 / 26) replacing `--ui-size-cta-icon` 20?
8. The legacy `secondaryButton/*` / `primaryButton/*` variable family is still bound here alongside the newer `ButtonSecondary/*` family — intended?
9. Dark-mode values for any of these variables were not returned by get_variable_defs.
