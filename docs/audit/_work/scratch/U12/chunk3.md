
### U12-F17: No Table story sets `rowHeight`, so the only non-className override prop on `Table` is never exercised
- severity: S3
- category: stories
- rules: [R9.23, R8.22]
- scope: tooling
- confidence: plausible
- verified_by: "rg -n rowHeight src --glob '*.stories.tsx' → 0 matches. Table.tsx:19 declares `rowHeight?: string`; Table.tsx:33 writes `--table-row-height`; Table.tsx:119 reads it."
- locations:
  - src/components/Table/Table.tsx:17-20
  - src/components/Table/Table.stories.tsx:130-293
- evidence: |
    Table.tsx:19    rowHeight?: string;
    Table.tsx:33            ...(rowHeight ? { "--table-row-height": rowHeight } : {}),
    Table.tsx:119         height: "var(--table-row-height, auto)",
- impact: contrib requires at least one story contradicting each override prop's default so a dead prop is visible. `rowHeight` crosses two components through a private custom property (`--table-row-height`) — exactly the kind of wiring that breaks silently (e.g. U12-F5's style clobber drops it) — and nothing in Storybook would show it.
- recommendation: Add a story with a fixed `rowHeight` (e.g. dense rows) alongside the auto-height default.
- breaking: none
- contract: n/a
- remediation: tbd
- related: [U12-F5]

### U12-F18: Story nits across the four story files (batched)
- severity: S4
- category: stories
- rules: [R9.24, R8.11]
- scope: tooling
- confidence: plausible
- verified_by: "Read all four story files in full."
- locations:
  - src/components/Avatar/Avatar.stories.tsx:15
  - src/components/Avatar/Avatar.stories.tsx:19
  - src/components/Avatar/Avatar.stories.tsx:62
  - src/components/Avatar/Avatar.stories.tsx:79
  - src/components/Sticker/Sticker.stories.tsx:127
  - src/components/Sticker/Sticker.stories.tsx:141
  - src/components/Table/Table.stories.tsx:40
  - src/components/Table/Table.stories.tsx:83-86
  - src/components/Table/Table.stories.tsx:279
- evidence: |
    Avatar.stories.tsx:15        fill="#0A0A0A"            (logo glyph ignores Avatar's `text-prominent-color`; near-black on dark `--ui-color-surface-secondary` #242425)
    Avatar.stories.tsx:62      <div className="flex items-center gap-3">     (numeric gap; other stories use `gap-sm`)
    Avatar.stories.tsx:79        <span className="text-style-label text-text">⌘</span>   (raw span where `LabelText` exists)
    Sticker.stories.tsx:127    args: { children: "Milestones" },   (also :141 — ignored by `render`)
    Table.stories.tsx:40        className="h-[420px] border border-border-primary rounded-soft"   (re-declares Table's own border; the canonical story overrides the default `rounded-normal`)
    Table.stories.tsx:83          <div>    (TableCell is already `flex flex-col`; the wrapper is redundant — repeated at 104, 244, 250, 258, 264)
- impact: The Avatar logo story is illegible in the dark theme and teaches hard-coded fills where Avatar supplies `currentColor`; the Table `Default` story never shows the default radius; the redundant `<div>`s teach consumers a wrapper TableCell does not need. Each is small; together they make the stories a weaker reference.
- recommendation: `fill="currentColor"` (or keep the brand dot only), `LabelText`, token gaps, drop dead `args`, drop the redundant border/radius override and cell `<div>`s.
- breaking: none
- contract: n/a
- remediation: tbd
- related: [U12-F16]

### U12-F19: Code nits in scope (batched)
- severity: S4
- category: inconsistency
- rules: []
- scope: internal
- confidence: plausible
- verified_by: "Reads of the in-scope files; rg counts: `from \"../Icons\"` 13 component files vs Table's 3 deep icon imports; `from \"../Text\"` 10 vs `../Text/BaseText` 2; `export * from` in 7 of 39 folder index.ts."
- locations:
  - src/components/Sticker/Sticker.tsx:136
  - src/components/Sticker/Sticker.tsx:113
  - src/utils/color.ts:1-2
  - src/components/Table/Table.tsx:8-11
  - src/components/Table/Table.tsx:13-14
  - src/components/Table/Table.tsx:35
  - src/components/OutlineSection/OutlineSection.tsx:4
  - src/components/OutlineSection/index.ts:1
- evidence: |
    Sticker.tsx:136  StickerBase.displayName = "Sticker";          (and :141 Sticker.displayName = "Sticker"; Slider names its base 'SliderBase', Slider.tsx:419)
    Sticker.tsx:113        ? resolveDsColor(color, "var(--ui-color-prominent)")   (unreachable after the :104 throw; reads as the prominent fallback the header forbids)
    color.ts:1   /* Shared color resolution for components that take a free-form `color` prop
    color.ts:2    * (Slider, LinearProgressIndicator).                  (Sticker is now a third consumer)
    Table.tsx:8  import { ChevronDownIcon } from "../Icons/ChevronDownIcon";   (+ :9, :10, :11 `../Text/BaseText`; siblings mostly import barrels)
    Table.tsx:35        } as React.CSSProperties        (UMD-global namespace; the file imports `type HTMLAttributes` by name)
    OutlineSection.tsx:4  export interface OutlineSectionProps extends HTMLAttributes<HTMLDivElement> {}
    OutlineSection/index.ts:1  export * from './OutlineSection';   (the other three folders use named re-exports)
- impact: Two DevTools nodes both named "Sticker"; a dead fallback argument that contradicts the header on a skim; a stale consumer list in a shared util's header; barrel-bypassing imports and barrel shape that differ from siblings; a double blank line. None changes behaviour.
- recommendation: Name the base `StickerBase`; pass the resolved colour without a fallback (or assert); add Sticker to color.ts's list; import from `../Icons` / `../Text`; use named re-exports; drop the stray blank line.
- breaking: none
- contract: src/components/Sticker/Sticker.tsx:21-23 "`custom` with no `color` throws. Silently falling back to prominent would make an explicit choice look like it had been honoured." → consistent (the fallback is unreachable; removing it honours the constraint)
- remediation: tbd
- related: []
