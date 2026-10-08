# 07R1 — Maintainer review: toggles and icons (agent R1)

## Progress (write-to-disk-first)
- [x] 0. Rules read; scoreboard baseline (all hard metrics 0; "use client" 27; timers 5)
- [x] 1. FancyToggleSwitch: multi-select removed
- [x] 2. Disabled + selected fancy option with an icon
- [x] 3. ToggleSwitch `unselected` variant in the light/dark options
- [x] 4. Icon stroke widths from the token (script)
- [x] 5. HeartFillIcon on the 24-unit grid + gallery cell
- [x] 6. lint + scoreboard after

---

### FancyToggleSwitch is single-select only, like ToggleSwitch; multi-select and `FancyToggleSelectType` are gone [maintainer review]
- files: `src/components/Toggle/FancyToggleSwitch.tsx` (code + header), `src/components/Toggle/fancyToggleOption.ts` (code + header), `src/components/Toggle/constants.ts`, `src/components/Toggle/index.ts`, `src/components/Toggle/FancyToggleSwitch.stories.tsx`, `src/components/Toggle/Toggle.tsx` (header wording only)
- what changed:
  - Maintainer decision: the fancy row behaves exactly like ToggleSwitch. One option is always chosen and the user can never clear it. The root calls the shared `useNeverClearedValue` from `Toggle.tsx` and always hands Radix a controlled `type="single"` value.
  - Removed: the `selectType` prop, the per-mode prop union (`FancyToggleSwitchProps` is now one interface: `value?: string`, `defaultValue?: string`, `onValueChange?: (value: string) => void`), the item presentation context, and the `FancyToggleSelectType` const + type (constants.ts and the Toggle barrel; `src/index.ts` re-exports the folder, so it is gone from the package root too).
  - `fancyToggleOptionVariants` lost its `selectType` variant; `selected:enabled:cursor-default` is now in the base (the chosen option can't be clicked off, so it doesn't read as clickable).
  - Headers: FancyToggleSwitch's behaviour now says "single select only, same as ToggleSwitch"; the hook-order constraint about the mode branch is gone (there is no branch). fancyToggleOption's hover/cursor bullet no longer mentions modes. Toggle.tsx's header says "FancyToggleSwitch also calls" instead of "FancyToggleSwitch's single mode also calls".
  - Story `Inputs/FancyToggleSwitch › Multi Select` removed.
- consumer impact: none shipped — FancyToggleSwitch and `FancyToggleSelectType` are not in any release yet (absent from HEAD; package 5.3.0). Anyone on the working tree passing `selectType` gets a type error.
- breaking: no (never released)
- verified: see the end of this record.
- docs owed: whatever CHANGELOG `[Unreleased]` / skill text was drafted for FancyToggleSwitch (05e record) must drop `selectType`, `FancyToggleSelectType` and multi-select.

### Disabled + selected fancy option with an icon: story gap, not a code bug [maintainer review]
- files: `src/components/Toggle/FancyToggleSwitch.stories.tsx`
- what changed:
  - Finding: the old `Disabled` story's icon row had "Pay" SELECTED but ENABLED next to a disabled, unselected "Receive". So the only selected icon option on screen was not disabled; it rightly showed full colour. No story rendered a disabled + selected icon option.
  - The code already fades it the same way as the check mode: `ds-disabled-state` sits on the whole option button (`opacity: var(--ui-opacity-disabled)` on `:disabled`), and Radix puts `disabled` on the item button whether the root or the item is disabled. Opacity on the option composes over every child, the icon circle included; no indicator class sets its own opacity. No code change.
  - `Disabled` story now has four rows: whole row disabled (check mode), whole row disabled (icon mode — selected "Pay" disabled, `data-testid="disabled-icon-selected"`), only the selected icon option disabled, only an unselected icon option disabled.
- consumer impact: none.
- breaking: no
- verified: reasoning from the CSS (`src/styles/dooph-component-tokens.css` `.ds-disabled-state:is(:disabled, [aria-disabled="true"])`); orchestrator to confirm visually in the new rows.
- docs owed: none.

### ToggleSwitch `unselected` variant: story-only — Light and Dark were plain primary options [maintainer review]
- files: `src/components/Toggle/Toggle.stories.tsx`
- what changed:
  - Finding: "light" and "dark" in `UnselectedVariant` are option values, not themes. The story set `ToggleVariant.unselected` on the Auto item only, while the switch was `primary`, so choosing Light or Dark correctly showed the primary fill. `toggleOption.ts`'s contract defines `unselected` as per-option ("for an option that must never read as selected"), and the code already gives it no selected fill whatever the state. No code change.
  - Story now shows two rows: `variant={ToggleVariant.unselected}` on the switch (every option — Auto, Light, Dark — keeps the unselected look whichever is chosen; test ids `unsel-all-*`), and the original per-item row with a caption saying Light/Dark still take the switch's primary fill.
- consumer impact: none.
- breaking: no
- verified: see the end of this record.
- docs owed: none.

### Icon stroke widths: every icon leaf already takes the token; a guard script now proves it, and the gallery's odd 0.5 weight is gone [maintainer review]
- files: `docs/audit/_work/scratch/review1/icon-stroke-token.mjs` (new), `src/components/Icons/Icons.stories.tsx`
- what changed:
  - Finding: none of the 88 `src/components/Icons/*Icon.tsx` leaves sets `strokeWidth` / `stroke-width` (attribute, style key or default). They all inherit BaseIcon's `strokeWidth ?? "var(--ui-icon-stroke-width)"`, and the token is 2 in `tokens.css`. The only odd weight on screen came from the `Icons/BaseIcon › Icon Colors` story, which passed `strokeWidth={0.5}` to `TagIcon`. That override is removed (the story is about colour). The `Playground` story keeps its explicit `strokeWidth: 3` — that is the documented consumer-override demo.
  - The script strips any hardcoded stroke width from icon leaves and, with `--verify`, fails if one remains, if BaseIcon stops defaulting to the token, or if the token is not 2. Run: 0 files changed; `--verify` OK. Filled glyphs (HeartFill, StopFilled) carry no stroke and are untouched. BaseIcon is never edited, so a consumer `strokeWidth` still wins (probe: `<HeartFillIcon strokeWidth={3}/>` renders `stroke-width:3`; a default icon renders `stroke-width:var(--ui-icon-stroke-width)`).
  - Out of my lane, noted for the maintainer: `src/components/Checkbox/Checkbox.tsx` draws its own check and indeterminate glyphs as inline `<svg viewBox="0 0 10 10">` with `strokeWidth="1.5"`. They are not DS icons, so the token does not reach them.
- consumer impact: none.
- breaking: no
- verified: script run + `--verify`; server-render probe above.
- docs owed: none.

### HeartFillIcon fills the 24-unit icon grid and appears in the Icons gallery [WI-072, F-043]
- files: `src/components/Icons/HeartFillIcon.tsx`, `src/components/Icons/Icons.stories.tsx`
- what changed: the path was drawn on a 16-unit grid inside BaseIcon's 24-unit viewBox, so it rendered at about 58% size in the top-left corner. It is now the same outline scaled ×1.5 about the origin (the WI-072 path, bbox x 1.5–22.5, y 3.75–21.75). `fill="currentColor"` and `stroke="none"` are unchanged. The `Settings & System Icons` gallery story has a new `HeartFill` cell after `Check` (the import already existed).
- consumer impact: every `<HeartFillIcon>` is now full size and centred horizontally like its siblings; anyone who compensated with a bigger `size` or an offset will see it grow.
- breaking: no
- verified: `rg "M15 6.375" src` → 0; `HeartFillIcon` in Icons.stories.tsx → import + gallery cell + the existing Icon Colors use; probe render shows the new path.
- docs owed: CHANGELOG `[Unreleased]` → Fixed: "`HeartFillIcon` now fills the 24-unit icon grid (it rendered at about 58% size in the top-left corner)." REMEDIATION.md WI-072 status → review (not edited here).

### Verification (whole record)
- `npm run lint` (tsc --noEmit): exit 0.
- Scoreboard before → after: unchanged (hard metrics 0; "use client" 27 → 27; timers 5 → 5).
- esbuild + `renderToStaticMarkup` probe: `FancyToggleSelectType` no longer exported from the Toggle barrel; a disabled row's selected icon option renders `disabled=""` + `data-state="on"` + `ds-disabled-state` on its button, so the standard disabled opacity covers the icon circle.

## DONE
