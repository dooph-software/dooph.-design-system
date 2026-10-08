# 06C1 — Token sweep: numeric spacing and arbitrary px → DS tokens, plus OutlineButton tokens (WI-059, WI-060, WI-082 remaining part)

Agent C1, wave C (restarted run; the earlier C1 changed no file — it left only
`scratch/waveC/C1-hits.mjs` and `C1-score-before.txt`).

## Checklist
- [x] Scoreboard baseline: m2 (arbitrary px) 18, m3 (numeric spacing) 36 (`scratch/waveC/C1-score-before2.txt`)
- [x] Tokens + EXCLUDED + sync-tokens
- [x] Utilities / ds-* helpers
- [x] Mechanical swap script (`scratch/waveC/C1-sweep.mjs`, `--verify`)
- [x] OutlineButton tokens (WI-082)
- [x] Probes (compiled-CSS values unchanged; merge overrides; SSR markup)
- [x] lint, scoreboard after (`scratch/waveC/C1-score-after.txt`)

## Decisions
- Mapping is by PIXEL value on today's scale, so the WI tables' target names
  are re-derived: `gap-2`(8)→`gap-sm`, `gap-1`(4)→`gap-xxs`, `px-3`(12)→`px-md`,
  `pl-4`/`pr-4`/`px-4`(16)→`*-lg`, `py-2`/`pr-2`(8)→`*-sm`, `pb-3`/`pr-3`/`py-3`(12)→`*-md`.
  Per-utility swaps (SplitButton keeps `pl-lg pr-lg`, not a merged `px-*`).
- WI-060's concentric radius is soft (20) + **sm** (8) = 28px now (the frame
  inset `ds-p-ui-sm` is 8px, not xs).
- **Override safety beats the WI's helper choice.** A `ds-*` helper sits in no
  tailwind-merge group and its layer block comes after Tailwind's utilities, so
  on an element that also receives the consumer's `className` it silently beats
  `rounded-none` / `h-2` / `py-4` / `min-w-0`. Those roots therefore get
  merge-aware utilities (theme tokens or registered index.css utilities):
  OutlineSection/OutlineButton radius → `rounded-outline-frame`
  (`--ui-radius-outline-frame`, not WI-060's `ds-radius-soft-outset-xs`),
  TablePlaceholder → `py-table-placeholder-y`, LinearProgress → `h-linear-progress`
  (not WI-071's `ds-progress-track`), DropdownTrigger `min-w-40` → new
  `min-w-menu` utility (not WI-059's `ds-min-w-menu`). Internal-only spans keep
  `ds-*` helpers (kbd floor, SplitButton icon slot, OutlineButton inner box and orbs).
  The first draft used the helpers; the sweep script's RETARGET pass moved them.
- `ShapeProps.size` already accepts a string (batch 05b): no Shapes/ edit needed.
- WI-082's motion tokens are dropped: orb timing already lives on the motion
  scale (`.ds-outline-orb-1/2`). Only paint (opacity, blur), orb size/anchor and
  the inner box become tokens.
- Zero resets (`p-0`, `m-0`) are not spacing values and stay — see "Not done".

---

### Spacing and fixed sizes follow tokens (Button, SplitButton, SearchBox, HotkeyIndicator, DropdownTrigger, Tooltip, Toast, Table, Tabs, Avatar, ShapeButton, CodeDigitInput, DropdownMenuLabel, TextDropdownTrigger, Checkbox, OutlineSection, LinearProgressIndicator) [F-017, WI-059, WI-060]
- files: `src/styles/tokens.css`, `src/styles/index.css` (utilities + generated block), `src/styles/theme.css` (generated),
  `src/utils/twMergeTheme.ts` (generated), `src/styles/dooph-component-tokens.css`, `scripts/sync-theme.mjs` (EXCLUDED),
  `src/components/{Button/Button.tsx, SplitButton/SplitButton.tsx, SearchBox/SearchBox.tsx, HotkeyIndicator/HotkeyIndicator.tsx,
  DropdownTrigger/DropdownTrigger.tsx, Tooltip/Tooltip.tsx, Toast/Toast.tsx, Table/Table.tsx, Tabs/Tabs.tsx, Avatar/Avatar.tsx,
  ShapeButton/ShapeButton.tsx, VerificationCode/CodeDigitInput.tsx, Menu/DropdownMenu.tsx, Checkbox/Checkbox.tsx,
  OutlineSection/OutlineSection.tsx, LinearProgressIndicator/LinearProgressIndicator.tsx, Sheet/Sheet.tsx (doc comment only)}`
- what changed:
  - Tailwind numeric spacing → the DS scale at the same px (table above). TablePlaceholder's 32px → `py-table-placeholder-y`.
  - Arbitrary px → token classes: Avatar `size-avatar` / `size-avatar-sm`; ShapeButton `size-shape-button`, and its shape
    renders at `size="var(--ui-size-shape-button)"` (the `SHAPE_SIZE = 46` copy is gone); SplitButtonAction icon slot
    `ds-size-icon-rg`; CodeDigitInput `text-code-digit` + `fontSize="var(--ui-text-code-digit)"`; DropdownMenuLabel
    `h-menu-label`; TextDropdownTrigger `h-text-trigger`; single-key HotkeyIndicator `ds-min-size-kbd`; complex Toast
    `pl-toast-inset pt-toast-inset`; Checkbox glyph `size-checkbox-icon` (was `size-2.5`); OutlineSection
    `rounded-outline-frame`; LinearProgressIndicator `h-linear-progress`; DropdownTrigger `min-w-menu`.
  - New tokens (all `:root, .light`): `--ui-text-code-digit` 18px, `--ui-size-checkbox-icon` 10px, `--ui-size-avatar` 38px,
    `--ui-size-avatar-sm` 22px, `--ui-size-shape-button` 46px, `--ui-size-kbd` 23px, `--ui-height-menu-label` 30px,
    `--ui-height-text-trigger` (= menu-label), `--ui-height-linear-progress` 4px, `--ui-spacing-toast-inset` 14px,
    `--ui-spacing-table-placeholder-y` 32px, `--ui-radius-outline-frame` (= soft + sm, 28px).
  - New utilities: theme-generated `text-code-digit`, `*-toast-inset`, `*-table-placeholder-y`, `rounded-outline-frame`;
    index.css `.size-checkbox-icon`, `.size-avatar`, `.size-avatar-sm`, `.size-shape-button`, `.h-menu-label`,
    `.h-text-trigger`, `.h-linear-progress`, `.min-w-menu` (all registered in `cn` by the generator);
    helpers `.ds-size-icon-rg`, `.ds-min-size-kbd`.
  - Sheet's JSDoc example `p-6` → `p-lg` (comment only).
  - CodeDigitInput `## behavior` header now names the token.
- consumer impact: no visual change at a 16px root (every value probed equal). Overriding the new tokens now retunes
  these parts; spacing no longer scales with a non-16px root font size (it follows the px tokens, as everywhere else).
  Consumer `className` overrides keep working (verified via `cn`: `rounded-none`, `py-4`, `h-2`, `min-w-0`, `size-10`,
  `px-6` all replace the DS class). New public tokens and utilities listed above.
- breaking: no
- verified: `npm run lint` exit 0. `C1-sweep.mjs --verify` all 36 rows ok. Compiled before/after CSS with the Tailwind
  CLI into the scratchpad and resolved every old vs new class declaration: all identical (gap 8/4, paddings 8/12/16/32/14,
  sizes 38/22/46/14/10, font-size 18, heights 30/30/4, min 23/160, radius 28). `cn('text-code-digit … text-transparent')`
  keeps both. SSR markup: ShapeButton svg `width/height: var(--ui-size-shape-button)`; CodeDigitInput glyph
  `font-size: var(--ui-text-code-digit)`. Generated diff: exactly `--text-code-digit`, `--spacing-toast-inset`,
  `--spacing-table-placeholder-y`, `--radius-outline-frame` in index.css and theme.css, plus the twMergeTheme lists.
- docs owed: token-contract.md "Sizing And Shape": the twelve tokens above with defaults and their utility/helper.
  CHANGELOG `[Unreleased]` → Added: those tokens and utilities. Fixed: "Button, SplitButton, SearchBox, HotkeyIndicator,
  DropdownTrigger, Tooltip, Toast, Table, Tabs, Avatar, ShapeButton, CodeDigitInput, menu label, text trigger, Checkbox,
  OutlineSection and LinearProgressIndicator sizes and spacing now follow `--ui-*` overrides."

### OutlineButton box and glow orbs read `--ui-outline-button-*` tokens [F-016, F-017, F-021, WI-082]
- files: `src/components/OutlineButton/OutlineButton.tsx`, `src/styles/tokens.css`, `src/styles/dooph-component-tokens.css`,
  `scripts/sync-theme.mjs`
- what changed: frame radius `rounded-outline-frame`; inner box `ds-size-outline-button px-md gap-sm`, label `gap-sm`.
  Orbs: `glowing` mode uses `ds-outline-button-glow-1/2` (anchor, size, opacity, blur), hover mode
  `ds-outline-button-trail-1/2` (size, opacity 0 → token on group hover inside `@media (hover: hover)`, exactly like the
  `group-hover:` utilities they replace, blur). Inline `style` now holds only the glow colour (plus left/top/transform in
  hover mode; the transform's fallbacks are `var(--ui-min-w-outline-button)` / `var(--ui-height-outline-button)`).
  Timing stays on `.ds-outline-orb-*`. New tokens: `--ui-height-outline-button` 54px, `--ui-min-w-outline-button` 160px,
  `--ui-outline-button-orb-{1,2}-opacity` 0.38 / 0.22, `-orb-{1,2}-blur` 18 / 24px, `-orb-{1,2}-hover-blur` 20 / 26px,
  `-orb-{1,2}-width` 62% / 48%, `-orb-{1,2}-height` 72% / 64%, `-orb-1-bottom` -18px, `-orb-1-left` 4%,
  `-orb-2-bottom` -14px, `-orb-2-right` 6% (16 tokens, all EXCLUDED from the theme).
- consumer impact: looks the same; the glow is now retunable by token. Disabled still hides the orbs
  (`group-disabled:!opacity-0` is !important). Reduced motion already handled by the motion scale.
- breaking: no
- verified: compiled-CSS probe — glow-1 = bottom -18px, left 4%, 62%×72%, opacity 0.38, blur(18px); glow-2 = bottom
  -14px, right 6%, 48%×64%, 0.22, blur(24px); trail-1/2 = same sizes, opacity 0, blur 20 / 26px; hover rule 0.38 / 0.22 —
  each equal to the removed utility or inline value. WI-082 step-6 grep → 0 hits. SSR markup: orb `style` has only
  `background` (+ position/transform in hover mode).
- docs owed: token-contract.md: an OutlineButton bullet listing the 16 tokens. CHANGELOG → Added:
  `--ui-outline-button-*`, `--ui-height-outline-button`, `--ui-min-w-outline-button`.

## Not done / for the orchestrator
- **Scoreboard m3 stays at 8: zero resets.** `p-0` on Button `icon`/`icon-sm`/`icon-micro`, `p-0` on the same three
  toggleOption sizes, `m-0 p-0` on the Toast viewport `<ol>`. Zero is not a spacing value, there is no DS token for it,
  and renaming it to a helper would only dodge the regex. Options for the maintainer: exclude `-0` from the scoreboard
  pattern, or add a `--ui-spacing-none` to the scale (a design call, not mine).
- Not on the scoreboard and outside the three WIs, left as is: HotkeyIndicator `menu` variant `h-6 min-h-6` (24px),
  Sheet `max-w-96` ×2 (384px; WI-059 already listed Sheet as no-token).
- `.min-w-menu` (index.css, merge-aware) duplicates the value of `.ds-min-w-menu` (menu items). Menu items could move to
  it later; not done here (DropdownMenu.tsx only had the label edit in this pass).
- WI-071 (still todo) planned `ds-progress-track`; the bar height now ships as `h-linear-progress` /
  `--ui-height-linear-progress` (same token name WI-071 chose). WI-071 should reuse it, not add the helper.

## DONE
