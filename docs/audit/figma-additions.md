# Figma additions and token changes (maintainer brief, 2026-10-03)

The maintainer's own brief for new components and token changes made in Figma.
Figma file key `Ue4w95t0OjmvpJPJ6EE9bn`. Survey output, one spec per node, is in
[_work/figma/](_work/figma/). Every change made from this brief is logged in
[CHANGES.md](CHANGES.md).

**Hard rule:** if work here needs the Figma MCP and it is expired or failing,
STOP before writing anything else and tell the maintainer, loudly, to
reconnect it. Never guess a value.

## Order (agreed 2026-10-02/03)
1. **Token pass.** A deterministic rename script, never hand edits:
   - the spacing-scale rename;
   - the new button heights;
   - the tab-micro height moving into the button family;
   - size-word renames.
2. **Convention changes:**
   - the motion scale (proposal first, for the maintainer's sign-off);
   - callbacks → `value` / `defaultValue` / `onValueChange`;
   - `"use client"` only where unavoidable;
   - the const renames.
3. **The new components below**, built on the final conventions. Up to 5
   subagents in parallel, each on its own files.

## Items (maintainer's words, lightly condensed)
1. **Button family** — node `5:369`.
   - New `medium` and `big` sizes.
   - In Figma the button content variants (icon + text, text + icon) were
     removed. Every button has one content slot with a default 8px gap, so
     content can go anywhere. The code already works this way: `children`
     with `gap-2`, and no icon-position props (checked 2026-10-02).
2. **Hero CTA button** — node `759:1112`.
   - A shape replaces the circle. It is FIXED: the standard size uses the new
     **eight-leaf clover** shape (just added in Figma); the big size uses **puff**.
3. **Loading spinner, star variant** — node `907:2182`.
   - A second LoadingSpinner variant that is a star icon.
4. **Slider track step, tall variant** — node `577:962`.
   - A step is drawn tall according to a **controlled prop**, showing what is
     currently or previously selected while changing.
5. **Toggle option `fancy` variants** — node `826:1723`. The name is `fancy`.
6. **Toggle switch `fancy` variant** — node `826:2149`.
7. **Variables:**
   - `icon-md` = 16. The code already has `--ui-icon-md: 16px`.
   - `radius-mini` = 10. The code already has `--ui-radius-mini: 10px`.
   - The sizing/spacing collection comes from the export at
     `C:\Users\stick\Downloads\Sizing_Spacing.json`, which is not in the repo.

## Spacing scale — derived by Figma variable ID (old export in git @ b436647 → new export)

| Figma variable id | old name = px (code today) | new name = px (Figma) |
|---|---|---|
| 725:884 | — (code has `xxxs` = 2) | `xxxs` = 2 |
| 6:73 | `xxs` = 4 | `xxs` = 4 |
| 907:2003 | — | **`xs` = 6 (new)** |
| 6:75 | `xs` = 8 | `sm` = 8 |
| 6:76 | `sm` = 10 | `rg` = 10 |
| 6:77 | `rg` = 12 | `md` = 12 |
| 6:78 | `md` = 16 | `lg` = 16 |
| 6:79 | `lg` = 20 | `xl` = 20 |
| 60:867 | `xl` = 28 | `xxl` = **26** (value changed in Figma) |
| 60:868 | `xxl` = 40 | `xxxl` = **42** (value changed in Figma) |

## Button heights (Figma `buttonSizes/*`)

| Figma | px | code today |
|---|---|---|
| height-button | 38 | `--ui-height-button` 38 |
| height-small-button | 34 | `--ui-height-button-sm` 34 |
| height-micro-button | 28 | `--ui-height-tab-micro` 28 (to merge into the button family). `--ui-height-button-micro` is 26 today. |
| height-medium-button | 46 | new |
| height-big-button | 54 | new |
| focus-ring-spread | 4 | check against code |

## Size words (decided 2026-10-02)
- The base size key is `standard` everywhere.
- `AvatarSize.small` → `sm`.
- Button, Tab and Toggle: `sm` = 34px and `micro` = 28px, both on the
  button-height tokens.
- `TooltipTypes` / `ToastTypes` → `TooltipVariant` / `ToastVariant`.

## Status
- 2026-10-03 — Figma survey done. Specs are in `_work/figma/01…06`, with 51
  open questions, consolidated for the maintainer in chat.
- 2026-10-03 — spacing rename applied and verified (CHANGES.md). The rest of
  the token pass is not done yet:
  - size-word renames;
  - button heights medium 46 / big 54;
  - micro 26 → 28, merging tab-micro into button-micro.
- **Maintainer work in progress, do not touch:** untracked
  `src/components/Shapes/EightLeafCloverShape.tsx` and `svgs/eightleafclover.svg`.
  It exports `CLOVER_SHAPE_PATH` (the four-leaf path, same name as
  CloverShape's) and isn't in `shapePaths.ts` or `index.ts` yet.

## Maintainer answers (2026-10-03) — these override the open questions in `_work/figma/*`
- **EightLeafCloverShape:** fixed by the maintainer. The do-not-touch note above no longer applies.
- **Button**
  - `ButtonSize.medium` (46) and `ButtonSize.big` (54), for Prominent,
    Primary and Secondary only. Danger and Ghost are intentionally excluded.
    No icon-only medium or big sizes.
  - Use 54 for Big Prominent too (Figma's 52 is a mistake).
  - Medium and big labels use the **hero button text** role (same as button
    text, but 16px instead of 14px).
  - Ghost content colour at rest → points to the primary text colour (token
    change).
  - Ignore Figma's label `wdth` 96. Keep 100.
  - Keep the code's per-variant shadows (Figma's are wrong).
- **Hero CTA**
  - Static on hover.
  - Both sizes hug their content with a 60px gap, and both use 16px padding
    (the Figma `md` binding on Big is a mis-bind).
  - Label font: a bespoke role with the same properties as button text, but
    **semibold**, **24px** at standard and **28px** at big.
  - Shape fills: the primary CTA's shape uses the **secondary-button bg** token;
    the secondary CTA's shape uses the **primary-button bg** token.
  - Icon is 22px at standard and 26px at big, as tokens.
  - The shape is fixed per size: eight-leaf clover at standard, puff at big.
- **Star spinner**
  - Constant spin. Variant name: `star`, a spinning star.
  - Use the same shape-to-box size ratio as the shape-morph button, so the
    spin stays inside the box.
  - Reuse the existing `StarShape` outline.
  - The defaults also stand: honour `color`, static under reduced motion.
- **Tall slider step**
  - One optional, controlled step-index prop (not every slider needs it).
  - The height change is animated.
  - The tall height is **10px**. Figma's 12px pill is wonky.
- **Fancy toggle:** a **dedicated component**, not a variant of the existing
  toggle option. Extending the existing one would break too many principles.
  It must reuse as much as possible (shared constants, helpers and tokens) so
  the two don't drift.
  - A selected option has no hover or pressed state, because a selected option
    is not interactive.
  - Optional icon. With an icon, the indicator circle is **filled**; without
    one it is **stroke only**.
  - Defaults:
    - 54px only, sharing Button Big's height token;
    - the DS check icon;
    - prominent colour only;
    - standard focus outline;
    - animated on the motion scale;
    - same mixing rules as existing variants.
  - **Exception:** the 2px selected stroke is hardcoded.
  - The fancy switch is the matching dedicated row: a 12px gap, and one variant
    with an optional icon per option (Figma's "Fancy Cusotm" is a demo).
  - Being separate components, they don't amend `toggleOption.ts`'s "one
    shared unselected look" contract or `Toggle.tsx`'s 4px gap. Neither
    contract changes.
- 2026-10-03 — token pass COMPLETE: spacing rename; size words; one 28px micro
  height; medium/big height tokens and `.h-button-medium` / `.h-button-big`
  utilities; ghost foreground → text. Next: the motion-scale proposal for
  sign-off, then convention changes, then the components.

## Defaults accepted by the maintainer (2026-10-03, before the overnight run)
1. **Calendar/DatePicker:** `selected` → `value`; `onSelect` / `onChange` →
   `onValueChange`. Rename only. Do not add an uncontrolled `defaultValue`
   where none exists today.
2. **Fancy components:** `FancyToggleSwitch` + `FancyToggleSwitchItem`.
3. **Fancy selection:** single and multiple selection, like `ToggleSwitch`,
   reusing its logic.
4. **Tall slider step prop:** `highlightedStep?: number`.
5. **Hero CTA label:** new text style `text-style-cta` (button-text
   properties, semibold, 24px standard / 28px big).
6. **If Figma MCP expires overnight:** only the Figma-dependent item stops (flag
   it loudly). Everything else continues from the on-disk specs.
7. **After the agreed work:** continue down REMEDIATION's remaining `todo`
   items in phase order. Skip any that would change a component's look without
   a decision, and list them for the morning.
