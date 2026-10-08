# 06D3 — Leaf cleanups (WI-083, WI-119, WI-049, WI-027)

Agent D3, wave D. Baseline scoreboard (before): m1 0 · m2 0 · m3 0 · m4 5 ·
m5 3 · m6 2 · use-client 27 · timers 5 · m9 0 · m10 0.

## Checklist
- [x] WI-083 Sticker inner wrapper removed; header bullet rewritten
- [ ] WI-083 purposeful-wrapper comments (DropdownMenu, AIModelSelect) — outside lane, NOT done, reported
- [x] WI-119 Sticker: StickerBase displayName, dead prominent fallback
- [x] WI-119 Table: barrel imports, blank line (CSSProperties had already landed)
- [x] WI-119 DatePicker: open delegated to Popover, `defaultOpen`
- [x] WI-119 RollingDigitsText: stray `style`, cast `className`
- [~] WI-119 one number→px helper: `src/utils/length.ts` + textStyle done; UnderlineLinkText outside lane, NOT done, reported
- [x] WI-049 ProgressIndicator JSDoc
- [~] WI-027 folder indexes + src/index.ts routing done; AIContextGauge/ChatDivider deep imports (AIChat, D1's) NOT done, reported
- [x] lint, scoreboard after, markup/export diffs

## Entries

## 2026-10-03

### Sticker lays its children out on the root; no inner wrapper [F-024, WI-083]
- files: `src/components/Sticker/Sticker.tsx`
- what changed: the inner `<div className="flex flex-row items-center gap-sm">`
  around `{children}` is gone. `gap-sm` (the old `gap-xs` before the spacing
  rename, 8px) moved onto the root in `stickerVariants`' base. The header's
  `## behavior` children bullet is rewritten to say the children sit directly
  in the root row. `## constraints` unchanged.
- consumer impact: a `gap-*` or child selector (`[&>svg]:…`) on `<Sticker
  className>` now reaches the icon and label (cn/tailwind-merge drops the base
  `gap-sm` when a consumer passes another `gap-*`). With the default gap the
  layout is the same (the audit's render showed it pixel-identical). A consumer
  who targeted the old inner div (`[&>div]:…`) loses it. `stickerVariants` is
  exported from Sticker.tsx, so anyone applying it to their own element now
  also gets `gap-sm`.
- breaking: no (DOM depth changes by one level; no prop or type change)
- verified: SSR diff (esbuild bundle of src, react-dom/server). Only the three
  Sticker cases changed: inner div removed, `gap-sm` on the root; with
  `className="gap-lg"` the root carries `gap-lg` only. Every other case is
  byte-identical. `rg "flex flex-row items-center gap-" src/components/Sticker` → none.
- docs owed: CHANGELOG `[Unreleased]` → Fixed: "`Sticker` renders its children
  directly in the root row, so a `gap-*` or child selector on `className` now
  applies." Architecture skill Rule 3 wrapper examples: drop Sticker if listed.

### Sticker: distinct base name, no dead prominent fallback [F-113 items 6-7, WI-119]
- files: `src/components/Sticker/Sticker.tsx`
- what changed: `StickerBase.displayName = "StickerBase"` (was "Sticker"; the
  public `Sticker.displayName` stays "Sticker"). The custom-colour resolve no
  longer names `var(--ui-color-prominent)` as a fallback. It passes `""`, with
  a comment that the throw above guarantees `color`. The throw and the header
  constraint ("custom with no color throws") are unchanged.
- consumer impact: React DevTools shows `Sticker` > `StickerBase` instead of
  two `Sticker` nodes. Rendering unchanged.
- breaking: no
- verified: SSR `variant="custom" color="danger"` still paints
  `color:var(--ui-color-danger-primary)`; inner base displayName = StickerBase;
  `rg ui-color-prominent Sticker.tsx` → none; type probe: `custom` without
  `color` is still a type error.
- docs owed: none

### Table imports through the Icons and Text barrels [F-113 item 8, WI-119]
- files: `src/components/Table/Table.tsx`
- what changed: the three chevron icon deep imports become one
  `from "../Icons"`; `ButtonText` comes `from "../Text"`; the double blank line
  before `/* ── Table ── */` is now one. The `CSSProperties` part had already
  landed (WI-106), so it was skipped.
- consumer impact: none (markup byte-identical).
- breaking: no
- verified: SSR of `Table` and `TableHeaderCell` (ascend / descend / none)
  byte-identical; `rg 'from "\.\./(Icons|Text)/' Table.tsx` → none.
- docs owed: none

### DatePicker lets Radix Popover own its open state, and takes `defaultOpen` [F-113 item 9, WI-119]
- files: `src/components/DatePicker/DatePicker.tsx`
- what changed: the hand-rolled `useState` open state (`uncontrolledOpen` /
  `isOpen` / `setOpen`) is deleted. `open`, the new optional `defaultOpen` and
  `onOpenChange` pass straight to `<Popover>` (the Radix Root). It is
  controlled when `open` is defined and uncontrolled otherwise. The `useState`
  import is dropped. The `"use client"` directive is kept (decision D-05 owns
  that). The file has no header contract.
- consumer impact: `<DatePicker defaultOpen>` now opens initially when
  uncontrolled. Controlled and uncontrolled use behave as before. One nuance:
  switching a mounted picker between controlled and uncontrolled now gets
  Radix's development warning (the old code silently ignored it).
- breaking: no (additive prop)
- verified: type probe (`docs/audit/_work/scratch/waveD/d3-probe`, `tsc -p` →
  exit 0) accepts `defaultOpen` and the controlled `open` + `onOpenChange`
  form. SSR of closed and `open` pickers is byte-identical to before.
  `rg useState DatePicker.tsx` → none. Not checked in a browser (no Storybook
  in this wave): opening on click and closing on outside click and Escape are
  left to the orchestrator's visual pass.
- docs owed: CHANGELOG `[Unreleased]` → Added: "`DatePicker` `defaultOpen`
  (uncontrolled initial open state)." Consumer DatePicker skill/reference: list
  `defaultOpen`.

### RollingDigitsText passes `style` through with the rest [F-113 item 10, WI-119]
- files: `src/components/AnimatedText/RollingDigitsText.tsx`
- what changed: `style` is no longer destructured and passed back as
  `style={style}`; it reaches the root `<span>` through `{...rest}`. The cast's
  redundant `className?: string` is dropped (`className` is already in
  `HTMLAttributes`). The header constraints are about rendering, so they are
  untouched.
- consumer impact: none.
- breaking: no
- verified: SSR of `RollingDigitsText` with `className`, `style` and `data-x`,
  and with `smallDecimals`, is byte-identical.
- docs owed: none

### One number→px helper, `src/utils/length.ts` (partial) [F-113 item 11, WI-119]
- files: `src/utils/length.ts` (new), `src/components/Text/textStyle.ts`
- what changed: new internal `toPxLength(value: string | number): string`
  (numbers → `${n}px`, strings pass through). It is not exported from
  `src/index.ts`. `textStyle.ts` drops its private `toLength` and calls
  `toPxLength` for `fontSize` and `letterSpacing` (both already behind
  `!== undefined`). `toUnitless` is kept.
- NOT done: `src/components/AnimatedText/UnderlineLinkText.tsx` still has its
  own `toLength` (lines 21-22, used at :51 and :54). It is outside this agent's
  file list. To finish: import `toPxLength` from `"../../utils/length"`,
  delete the local `toLength`, and call `toPxLength(thickness)` /
  `toPxLength(offset)`.
- consumer impact: none.
- breaking: no
- verified: SSR of `BodyText` with numeric and string `fontSize` /
  `letterSpacing` is byte-identical; lint exit 0.
- docs owed: none

### ProgressIndicator's `wavy` and `progress` JSDoc tell the truth [F-050, WI-049]
- files: `src/components/ProgressIndicator/constants.ts`,
  `src/components/ProgressIndicator/ProgressIndicator.tsx`
- what changed: the `ProgressIndicatorVariant.wavy` JSDoc now describes one
  stable Material 3 rounded-star path, revealed by a normalized stroke dash
  that is not transitioned. It used to say "polar sine-wave … point count
  changes". The `progress` prop JSDoc now says it throws below 0, above 1 or
  on NaN, in every build; it used to say "throws in development". The guard is
  `!(progress >= 0 && progress <= 1)`, so NaN is included; the WI's wording
  predates the NaN guard.
- consumer impact: IntelliSense text only (ships in the .d.ts).
- breaking: no
- verified: `rg "Polar sine-wave|point count changes|Throws in development"
  src/components/ProgressIndicator` → none; lint exit 0.
- docs owed: none

### LoadingSpinner, ProgressIndicator and WavyDivider get folder indexes [F-064, WI-027]
- files: `src/components/LoadingSpinner/index.ts`,
  `src/components/ProgressIndicator/index.ts`,
  `src/components/WavyDivider/index.ts` (all new), `src/index.ts`
- what changed: each folder has an index of named re-exports: the component,
  its `*Props`, and its const+type objects. `src/index.ts` exports the three
  folders instead of their component and constants files. The
  ProgressIndicator index exports `ProgressIndicatorVariant` once; the const
  and the type now share that name, so the WI's separate type line is not
  needed. `spinnerGeometry` stays internal.
- NOT done: `src/components/AIChat/AIContextGauge.tsx:25`
  (`from "../ProgressIndicator/ProgressIndicator"`) and
  `src/components/AIChat/ChatDivider.tsx:11`
  (`from "../WavyDivider/WavyDivider"`) still deep-import. AIChat is D1's.
  To finish: `from "../ProgressIndicator"` and `from "../WavyDivider"`.
- consumer impact: none. The package root's runtime export list is identical.
- breaking: no
- verified: the runtime keys of an esbuild bundle of `src/index.ts` are
  identical before and after (part of the SSR dump diff). The type probe
  imports every type and const through the root → exit 0. Every
  `src/components/*/` has an `index.ts`. `src/index.ts` has no
  `components/(WavyDivider|LoadingSpinner|ProgressIndicator)/` deep path.
- docs owed: the codebase skill line "Components and their `*Props` types come
  from the component's `index.ts`" is now true for these three. Contribution
  skill: record named re-exports as the one folder-index form.

### Not done — outside this agent's files [WI-083 step 4]
- `src/components/Menu/DropdownMenu.tsx`: the MultiSelectItem wrapper
  `<span className="flex flex-1 items-center gap-rg">{children}</span>` needs
  the comment "flex-1 fills the row beside the leading checkbox, so the label
  takes the remaining width." The WI's :326 anchor has drifted: that class now
  appears at :238, :342 and :400, so pick the MultiSelectItem one by reading.
- `src/components/AIChat/AIModelSelect.tsx` :72 and :108 need the two comments
  from WI-083 step 4 (D1's file).

### Verification summary
- `npm run lint` → exit 0.
- Scoreboard before → after: no metric rose. Hand-rolled focus went 3 → 0
  during this run from D1's work, not this agent's.
- SSR/export dump: scratchpad `d3/render.cjs` (esbuild bundle of src +
  react-dom/server). The before/after diff shows only the intended Sticker
  change and the StickerBase name.
- Type probe: `docs/audit/_work/scratch/waveD/d3-probe/` (`tsc -p` → exit 0).

## DONE
