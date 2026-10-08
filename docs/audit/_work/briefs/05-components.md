# Brief 05 — New components from Figma (five agents in parallel; each takes ONE section)

Every agent reads first:
1. `docs/audit/_work/agent-rules.md` (mandatory).
2. `docs/audit/figma-additions.md`. It holds the maintainer's answers and accepted defaults, which OVERRIDE the open questions in the specs.
3. Your section's spec in `docs/audit/_work/figma/`.
4. `docs/audit/motion-scale.md`, because all motion uses `--ui-motion-*`.
5. The existing code in your folder. Follow its patterns: constants file, cva, forwardRef + displayName, stories, header contract.

**Build on what exists.** By the time you run, these are already done:
- spacing renamed to the new scale; size words (`standard`, never `default`);
- the button height tokens `h-button-medium` / `h-button-big`;
- the motion scale (`ds-motion-*` helpers, `--ui-motion-*` tokens);
- value callbacks (`value` / `defaultValue` / `onValueChange`);
- the shared colour lookup `resolveDsColor`.

Every new discrete option is a dot-accessible const plus a same-named type, re-exported from `src/index.ts`. Add stories that show every new option. Where an override prop exists, add one story where it contradicts the default.

Change record: `docs/audit/_work/changes/05<letter>-<name>.md`.

New components or options are `breaking: no`, unless an existing prop or token changes meaning.

**Shared files.** `src/styles/tokens.css`, `src/styles/index.css`, `src/styles/dooph-component-tokens.css`, `src/index.ts` and `src/utils/cn.ts` are edited by several agents AT THE SAME TIME.
- Only make small, anchored Edit-tool insertions in your own section of those files.
- Never rewrite or reformat them, and never use Write on them.
- If an edit fails because the file changed, re-read it and retry.
- Run `npm run sync-tokens` after token edits. It is safe to run repeatedly.

---

## 05a — Button `medium` and `big` sizes
- **Files:** `src/components/Button/**`, `src/index.ts` (exports only), `src/styles/tokens.css` (new button tokens only).
- **Spec:** `_work/figma/01-button.md` + answers.
- **Sizes:**
  - `ButtonSize.medium`: 46px, `h-button-medium`.
  - `ButtonSize.big`: 54px, `h-button-big`.
  - Horizontal padding 22 / 32px, pill radius. The paddings are not on the spacing scale, so add component tokens (e.g. `--ui-spacing-button-medium-x`, `--ui-spacing-button-big-x`) and consume them via a `ds-*` helper, never arbitrary values.
  - Labels use `text-style-hero-button` (16px).
  - Big Prominent is 54, not Figma's 52.
- **Variants:** only Prominent, Primary and Secondary support medium/big; Danger and Ghost intentionally don't.
  - Prefer a type-level restriction, so `variant=danger size=big` fails to compile, if it can be done without `any` and without breaking the polymorphic typing.
  - Otherwise use a development warning, and say which you chose.
  - No icon-only medium/big.
- **Shadows:** keep the code's existing per-variant shadows.

## 05b — Hero CTA: fixed shapes
- **Files:** `src/components/CTAButton/**`, `src/components/Shapes/**` (to register `EightLeafCloverShape`: the maintainer has fixed its file; add it to the barrel and to `shapePaths.ts` if the other shapes are there), `src/styles/tokens.css` and `src/styles/index.css` (CTA tokens and the new text style only), `src/utils/cn.ts` (to register the new text-style class), `src/index.ts`.
- **Spec:** `_work/figma/02-hero-cta.md` + answers.
- **Shape and colour:**
  - The circle becomes a FIXED shape: eight-leaf clover at standard, puff at big. Static on hover.
  - Primary CTA's shape fill uses the secondary-button bg token; secondary CTA's shape fill uses the primary-button bg token. Find the exact token names in tokens.css.
- **Icon:** 22px at standard and 26px at big, as tokens, replacing the single `--ui-size-cta-icon`. Breaking only if that token is removed; record it.
- **Layout:** both sizes hug their content with a 60px gap and 16px padding (`lg`).
- **Label:** a new text style `text-style-cta`, with the same properties as `text-style-button` but semibold, 24px at standard and 28px at big. Add its tokens following how the existing text-style roles are built, and register it in `cn`'s text-style group.

## 05c — LoadingSpinner: CSS-driven rebuild + `star` variant
- **Files:** `src/components/LoadingSpinner/**`, `src/styles/tokens.css` and `src/styles/index.css` / `dooph-component-tokens.css` (spinner tokens and helpers only), `src/index.ts`.
- **Spec:** `_work/figma/03-spinner-star.md` + answers. Background: REMEDIATION WI-050 (rewritten by decision D-03/D-04 to the motion scale) and FINDINGS F-034.
- **Rebuild:**
  - The flat spinner currently runs an infinite `requestAnimationFrame` loop, a JS 1800ms duration and cosine easing, with no reduced-motion path. Rebuild it CSS-driven, on the Rule 6 escape hatch `MorphRotationShape` already uses: CSS-transitioned or animated inputs, tokens, and no infinite JS loop. If a JS sampler is genuinely needed, it must self-terminate like MorphRotationShape's.
  - The cycle time becomes `--ui-spinner-duration` (1800ms). The spokes base becomes `--ui-spinner-spokes-duration` (1280ms), still scaled per size.
  - Add a reduced-motion static frame.
  - **Keep the visual result as close as possible** to today's (arc shape, gap behaviour). Describe any visible difference in the change record.
- **New `LoadingSpinnerVariant.star`:**
  - a constant linear spin of the existing `StarShape` outline;
  - sized so the star sits in the box at the SAME shape-to-box ratio the shape-morph button (ShapeButton / ShapeMorphSpinner) uses, so the spin stays inside the box;
  - honours `color` through `resolveDsColor`;
  - static under reduced motion;
  - all four sizes.
- **Verify:** scoreboard m8 (JS timers) must drop by at least the spinner's rAF uses.

## 05d — Slider: tall highlighted step
- **Files:** `src/components/Slider/**`, `src/styles/tokens.css` and `dooph-component-tokens.css` (slider step tokens and helpers only).
- **Spec:** `_work/figma/04-slider-tall-step.md` + answers.
- **Behaviour:**
  - New optional controlled prop `highlightedStep?: number`, a step index. When set, that step's dot is drawn tall (10px instead of the 6px dot; same width; token it).
  - Not every slider needs it, so the default is none.
  - The height change animates on the motion scale (`base` duration, `standard` curve). Reduced motion comes from the global rule.
  - It applies to every stepped variant, including `custom`.
  - Paints are unchanged.

## 05e — `FancyToggleSwitch` + `FancyToggleSwitchItem` (new dedicated components)
- **Files:**
  - NEW files in `src/components/Toggle/`: e.g. `FancyToggleSwitch.tsx`, `fancyToggleOption.ts`, constants additions in a NEW `fancyConstants.ts` or appended to `constants.ts`, stories.
  - `src/components/Toggle/index.ts`, `src/index.ts`, `src/styles/tokens.css` (fancy tokens only).
  - Do NOT change `ToggleSwitch` / `toggleOption.ts` behaviour or their header contracts. They are deliberately separate; the maintainer chose a dedicated component so the existing one's contract ("one shared unselected look", 4px gap) stays true.
- **Spec:** `_work/figma/05-toggle-option-fancy.md`, `_work/figma/06-toggle-switch-fancy.md` + answers.
- **Reuse as much as possible so they don't drift:** the same Radix ToggleGroup wiring, single and multiple `selectType`, `value` / `defaultValue` / `onValueChange`, context patterns, and shared constants where they mean the same thing.
- **Look:**
  - 54px pills (`h-button-big`, shared with Button big), 16px labels, a 12px gap between options.
  - Prominent colour only.
  - The 2px selected border is hardcoded (`border-2`). Unselected has a 2px grey border; use the Figma colour's matching token, or add one.
  - A leading 28px indicator. With an item `icon`, the circle is FILLED; without one, it is stroke-only.
- **States:**
  - Selected: shows the DS `CheckIcon`. Selected options are NOT interactive: no hover or pressed look.
  - Disabled: use the existing disabled helper.
  - Focus: the standard `ds-focus-visible-ring` outline.
  - State changes animate on the motion scale.
- **Variants:** one fancy variant with an optional per-item icon. Figma's "Fancy Cusotm" is just a demo.
