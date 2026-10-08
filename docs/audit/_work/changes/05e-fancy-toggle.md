# 05e — FancyToggleSwitch + FancyToggleSwitchItem (brief 05, agent 05e)

## Progress (write-to-disk-first)
- [x] 0. Read rules, brief, figma-additions answers, specs 05/06, motion scale, Toggle folder + contracts
- [x] 1. Baseline scoreboard (m7 "use client" = 28)
- [x] 2. `FancyToggleSelectType` const (appended to `Toggle/constants.ts`)
- [x] 3. `fancyToggleOption.ts` (neutral cva: option + indicator, header contract)
- [x] 4. `FancyToggleSwitch.tsx` (root + item, header contract)
- [x] 5. Barrel exports (`Toggle/index.ts`; `src/index.ts` already does `export * from './components/Toggle'`, so no edit)
- [x] 6. Stories (`FancyToggleSwitch.stories.tsx`)
- [x] 7. lint + scoreboard after

---

### New `FancyToggleSwitch` + `FancyToggleSwitchItem`: the Figma "Fancy" toggle row [Figma 826:2149 / 826:1723]
- files:
  - NEW `src/components/Toggle/FancyToggleSwitch.tsx` (root + item, `"use client"`, header contract)
  - NEW `src/components/Toggle/fancyToggleOption.ts` (neutral cva for the option, the indicator slot, the indicator and the check; header contract)
  - NEW `src/components/Toggle/FancyToggleSwitch.stories.tsx` (`Inputs/FancyToggleSwitch`)
  - `src/components/Toggle/constants.ts` (appended `FancyToggleSelectType`)
  - `src/components/Toggle/index.ts` (exports)
  - NOT touched: `Toggle.tsx`, `toggleOption.ts`, `tokens.css`, `src/index.ts`.
- what changed:
  - A dedicated row of 54px pill options (`h-button-big`, shared with Button big), 12px apart (`gap-md`). Labels use `text-style-hero-button` (16px), `text-text` in every state, 16px right padding (`pr-lg`).
  - Each option has a 2px border (hardcoded `border-2`, by maintainer decision): grey `secondary-border` (#e2e3e4, Figma `button-secondary-border`) unselected, `prominent` selected. Prominent colour only; no variant or size props.
  - A leading 50px square slot (full inner height) holds a 28px indicator circle (`size-button-micro`, the token Figma binds). Without an item `icon` it is a stroke-only 2px grey ring that fills prominent and shows the DS `CheckIcon` (white) when selected. With an `icon` it is a filled circle: grey with a dark icon, prominent with a white icon when selected. The icon is per item, so a row can mix both.
  - Selected options have no hover or pressed look (washes are gated on `unselected:`). Unselected hover/press = `ghost-hover` / `ghost-active`, as in Figma.
  - Disabled = `ds-disabled-control`. Focus = `ds-focus-visible-ring`. All state changes (border, fill, icon colour, check fade) run on `ds-motion-state` (`fast`, `standard`); reduced motion via the global token rule.
  - `selectType` (`FancyToggleSelectType.single` default | `.multi`). Single: `value: string`, can never be cleared — the same guard as `ToggleSwitch` (Radix's "" dropped, Radix kept controlled). Multi: `value: string[]`, any number including none, Radix owns uncontrolled state. Props are a discriminated union, so `selectType=multi value="x"` (or single with an array) fails to compile. Items read `selectType` from context (the ToggleSwitch context pattern); in single mode the chosen option gets the default cursor, in multi it keeps the pointer because a click still deselects it.
- decisions where Figma is silent (open questions answered by default, not by the maintainer):
  - Disabled dims the whole option (the existing helper, as the brief says). Figma dims only the label and icon; the border and indicator stay full strength there.
  - A disabled SELECTED option keeps its prominent border and filled indicator (dimmed). ToggleSwitch's options drop their fill when disabled; that rule was not copied, so a disabled fancy row still shows which option is chosen.
  - The check uses the DS `CheckIcon` at its default 14px and the DS default stroke width (Figma draws a 2px stroke in a 14px box).
  - Multi mode: "a selected option is not interactive" can't fully hold, because clicking it is how you deselect. It still has no hover or pressed look.
- reuse vs ToggleSwitch: the never-clear guard is a copy (~8 lines), not shared. ToggleSwitch couldn't be composed: its root hard-codes `gap-xxs`, and cn's tailwind-merge does not dedupe DS spacing keys (`cn("gap-xxs", "gap-md")` keeps both, so CSS order would decide the gap). Both headers now say the two rules must change together. A shared hook would need an edit to `Toggle.tsx` (outside this lane).
- consumer impact: new exports `FancyToggleSwitch`, `FancyToggleSwitchItem`, `FancyToggleSelectType` (+ type), `FancyToggleSwitchProps`, `FancyToggleSwitchItemProps`. Existing ToggleSwitch / Tabs are unchanged.
- breaking: no
- verified:
  - `npm run lint` (tsc): no errors in any Toggle file. At hand-back time the only errors are in `LoadingSpinner/LoadingSpinner.tsx` (agent 05c's work in progress).
  - Type checks: single with a string array and multi with a string both fail to compile (`@ts-expect-error` probe file, deleted afterwards).
  - Server render (`react-dom/server`, esbuild scratch bundle): single → `role=radiogroup`, `data-state` on/off, chosen option gets `selected:enabled:cursor-default`; no-icon indicator renders the ring classes + CheckIcon with `group-unselected/fancy-option:opacity-0`; icon item renders the filled-circle classes and the consumer svg; multi → `role=toolbar`, two `aria-pressed=true`, a disabled item with `disabled` + `data-disabled`.
  - Tailwind compile of `src/styles/index.css` (`@tailwindcss/node`) with every class the component emits: all generate a rule. `group-selected/fancy-option:` / `group-unselected/fancy-option:` compile against the `selected` / `unselected` custom variants. `pr-lg` → `--ui-spacing-lg` (16), `gap-md` → `--ui-spacing-md` (12).
  - Not run: Storybook and the build (per the brief).
  - Scoreboard: m7 "use client" files 28 → 29 (the new `FancyToggleSwitch.tsx`, which needs `useState` and `createContext`/`useContext`; `fancyToggleOption.ts` and `constants.ts` stay neutral). No other metric rose because of this change (m2 fell 19 → 18 from another agent).
- docs owed:
  - CHANGELOG `[Unreleased]` → Added: "`FancyToggleSwitch` / `FancyToggleSwitchItem` — 54px prominent pill toggle row with a leading indicator (ring + check, or a filled circle with an item `icon`), single or multi select via `FancyToggleSelectType`."
  - Consumer skill (`skills/` design-system usage): a FancyToggleSwitch section — when to choose it over ToggleSwitch, `selectType` and value shapes, `icon` per item, selected options have no hover/press, no variant/size props.
  - `.agents/skills/dooph-ds-codebase`: list `FancyToggleSwitch.tsx` / `fancyToggleOption.ts` in the Toggle folder; add `FancyToggleSelectType` to the constants table.
  - `.agents/skills/dooph-ds-architecture` line ~122 (sanctioned non-variant prop names: `shape`, `side`, `selectType`): `selectType` is now on FancyToggleSwitch as well as DropdownMenu.
  - Follow-up to consider: register `text-style-hero-button` in `src/utils/cn.ts`'s text-style group (today `cn("text-style-hero-button", "text-text")` drops the text style; this component avoids it by keeping them on separate elements).

## DONE
