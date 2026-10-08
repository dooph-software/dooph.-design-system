
### U12-F10: Sticker wraps `children` in an extra `<div class="flex flex-row items-center gap-xs">` that the root (`inline-flex items-center`) makes unnecessary; Button puts its gap on the root instead
- severity: S2
- category: rule-violation
- rules: [R3.4, R9.11, R3.3]
- scope: consumer-visible
- confidence: plausible
- verified_by: "Read Sticker.tsx: root is already `inline-flex … items-center` (line 33) with no other child; moving `gap-xs` onto the root yields the same row layout. Button.tsx:39 does exactly that (`inline-flex items-center justify-center gap-2`, children rendered directly)."
- locations:
  - src/components/Sticker/Sticker.tsx:131
  - src/components/Sticker/Sticker.tsx:10-12
  - src/components/Sticker/Sticker.tsx:33
- evidence: |
    Sticker.tsx:33      "inline-flex w-fit items-center overflow-clip",
    Sticker.tsx:131        <div className="flex flex-row items-center gap-xs">{children}</div>
    Sticker.tsx:10  * - Children are the content. They are wrapped in a row with `gap-xs` so an
    Sticker.tsx:11  *   icon and a text node sit beside each other without a wrapper at the call
    Sticker.tsx:12  *   site. The wrapper is layout, not an interactive element.
    (cf.) Button.tsx:39    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
- impact: arch Rule 3 allows a wrapper around children only when "visually required"; the header's justification (icon and text side by side without a call-site wrapper) is delivered by a gap on the root, as Button does. Cost: a consumer's `className="gap-sm"` or `[&>svg]:…` on `<Sticker>` targets the root and silently does nothing, because the only flex container holding the children is the private inner div; and the DS now has two ways of spacing icon+label in a chip-like leaf.
- recommendation: Move `gap-xs` (and `flex-row`) onto the cva base and render `{children}` directly; update the header's behavior bullet in the same change.
- breaking: none
- contract: src/components/Sticker/Sticker.tsx:10-12 (behavior, not a constraint) → consistent — no constraint protects the wrapper; the behavior bullet must be updated with the code (R10.4)
- remediation: tbd
- related: []

### U12-F11: `Table` is a grid of plain `<div>`s with no table/row/columnheader/cell roles, and `sortDirection` never reaches `aria-sort`; the shipped usage skill steers consumers to it "before hand-rolling a grid of divs"
- severity: S2
- category: api-design
- rules: []
- scope: consumer-visible
- confidence: plausible
- verified_by: "rg -n \"role=|aria-\" src/components/Table/Table.tsx → no matches. Every part renders a bare `<div>` (Table.tsx:24, 47, 74, 93, 109, 131, 149)."
- locations:
  - src/components/Table/Table.tsx:22-155
  - skills/dooph-design-system-usage/SKILL.md:161-163
- evidence: |
    Table.tsx:24      <div
    Table.tsx:72      if (sortDirection !== undefined) {
    Table.tsx:83              onClick={onSort}
    SKILL.md:161  - **Data:** `Table` (+ `TableHeader`, `TableHeaderCell`, `TableRow`, `TableCell`,
    SKILL.md:162    `TablePlaceholder`; sortable headers via `TableSortDirection`) — use this
    SKILL.md:163    before hand-rolling a grid of divs for tabular data.
- impact: Screen-reader users get a flat run of text: no row/column navigation, no header association, and a sortable header announces only as a button with no sort state (the component holds `sortDirection` but drops it). Every consumer must know to add `role="table"/"row"/"columnheader"/"cell"` (props spread lets them, but nothing tells them) and cannot put `aria-sort` on the header cell without duplicating the state. The usage skill actively recommends the component for tabular data.
- recommendation: Give the parts their ARIA roles by default (`table`, `row`, `columnheader`, `cell`) and emit `aria-sort` from `sortDirection` on the header cell; consumers can still override via props.
- breaking: none
- contract: n/a
- remediation: tbd
- related: [U12-F12]

### U12-F12: Table mixes DS spacing tokens with Tailwind's numeric scale, and header/body column alignment depends on the two coinciding (4px token + 12px token = numeric 16px)
- severity: S3
- category: wrong-layer
- rules: [R8.1, R5.2]
- scope: consumer-visible
- confidence: plausible
- verified_by: "dist-styles.css:15 `--spacing: 0.25rem`; :1118 `.px-4 { padding-inline: calc(var(--spacing) * 4) }`; :1127 `.px-rg { padding-inline: var(--ui-spacing-rg) }`; :1136 `.px-xxs { … var(--ui-spacing-xxs) }`; tokens.css:514 xxs 4px, :517 rg 12px, :518 md 16px."
- locations:
  - src/components/Table/Table.tsx:49
  - src/components/Table/Table.tsx:95
  - src/components/Table/Table.tsx:82
  - src/components/Table/Table.tsx:134
  - src/components/Table/Table.tsx:151
- evidence: |
    Table.tsx:49      className={cn("grid border-b border-border-primary py-xs px-xxs", className)}
    Table.tsx:95        className={cn("flex items-center px-rg py-xs", className)}
    Table.tsx:82            className="w-full justify-start gap-1 text-text-primary"   (+ Button size default = `px-3`)
    Table.tsx:134        "flex flex-col justify-center overflow-hidden px-4 py-3",
    Table.tsx:151    className={cn("flex flex-1 items-center justify-center py-8", className)}
- impact: Header text starts at `--ui-spacing-xxs` + `--ui-spacing-rg` (4+12) — or xxs + Button's numeric `px-3` for sortable columns — while body text starts at numeric `px-4` (16). A consumer who retunes `--ui-spacing-rg` or `-xxs` (documented override points) shifts header labels off their body columns; the numeric parts never move. Four of the five numeric values have token equivalents (`px-md`, `py-rg`, `gap-xxs`, and the Button's own padding); `py-8` (32px) has none.
- recommendation: Express TableCell/TablePlaceholder/sort-button spacing with the same tokens the header uses (or one `--ui-spacing-table-cell-x` token both sides read) so alignment is structural, not numeric coincidence.
- breaking: none
- contract: n/a
- remediation: tbd
- related: [U12-F11]

### U12-F13: `TableRow` hardcodes its hover transition timing (`transition-colors duration-100`) instead of a `--ui-*` motion token — one instance of a 38-occurrence / 16-file pattern
- severity: S3
- category: rule-violation
- rules: [R6.5, R6.1]
- scope: consumer-visible
- confidence: plausible
- verified_by: "rg -n \"duration-[0-9]+\" src --glob '*.tsx' --glob '!*.stories.tsx' | wc -l → 38 across 16 files (Input, OutlineButton, Button, Checkbox, DropdownTrigger, HotkeyIndicator, Modal, TextLink, DropdownMenu, Tooltip, Table, CodeDigitInput, Toast, SearchBox, SplitButton, Sheet)."
- locations:
  - src/components/Table/Table.tsx:114
- evidence: |
    Table.tsx:114        "hover:bg-ghost-hover transition-colors duration-100",
- impact: arch Rule 6 ("Never hardcode a duration or easing curve in a component"; "Every animated component gets a `--ui-<component>-*` family") is written for all motion, but the hover-transition idiom ignores it DS-wide, so a consumer cannot retune or disable row-hover motion and the rule's scope is ambiguous to the next agent. Kept at S3 here because the defect is the DS-wide idiom, not Table; synthesis should merge with other units' instances or record a rule exemption for hover state-colour transitions.
- recommendation: Decide once: a shared hover-transition token consumed via a `ds-*` helper, or an explicit Rule 6 exemption for state-colour transitions. Don't fix per file.
- breaking: none
- contract: n/a
- remediation: tbd
- related: []

### U12-F14: `AvatarSize` lives inline in `Avatar.tsx` rather than a sibling `constants.ts` — the codebase skill calls this "equivalent", contrib Step 5 does not allow it
- severity: S3
- category: inconsistency
- rules: [R8.20]
- scope: internal
- confidence: plausible
- verified_by: "rg -l \"use client\" src/components/Avatar → none (Avatar.tsx is server-safe today). node docs/audit/_work/scratch/U12/sizes.mjs → every other *Size const is in a constants.ts except Avatar.tsx and Icons/BaseIcon.tsx."
- locations:
  - src/components/Avatar/Avatar.tsx:4-8
  - .agents/skills/dooph-ds-codebase/SKILL.md:637-641
- evidence: |
    Avatar.tsx:4   export const AvatarSize = {
    Avatar.tsx:5     standard: "standard",
    Avatar.tsx:6     small: "small",
    Avatar.tsx:7   } as const;
    SKILL.md:639    Every component with consts follows this, except `Avatar` and
    SKILL.md:640    `BaseIcon`, which declare theirs inline in server-safe modules — equivalent.
- impact: It is equivalent only while Avatar.tsx has no `"use client"`. Avatar is the component most likely to gain client state (image-load fallback, initials on error); the day it does, `AvatarSize.small` read from a Server Component becomes a client reference and breaks — the exact failure SKILL.md:641 describes — and nothing in Avatar.tsx warns the editor. The skill's blessing teaches the next agent that inline consts are fine.
- recommendation: Move `AvatarSize` to `Avatar/constants.ts` (index.ts re-export unchanged, no consumer impact) and drop Avatar from the skill's exception list.
- breaking: none
- contract: n/a
- remediation: tbd
- related: [U12-F15]

### U12-F15: Size-const key vocabulary is split across the DS — base size is `standard` in 4 consts and `default` in 4; Avatar alone spells the small size `small` where 6 consts use `sm`
- severity: S3
- category: naming
- rules: [R1.1]
- scope: consumer-visible
- confidence: plausible
- verified_by: "node docs/audit/_work/scratch/U12/sizes.mjs (key sets below)."
- locations:
  - src/components/Avatar/Avatar.tsx:4-7
  - src/components/Sticker/constants.ts:38-41
- evidence: |
    AvatarSize = {standard, small}                 (Avatar/Avatar.tsx)
    StickerSize = {standard, micro}                (Sticker/constants.ts)
    CTAButtonSize = {standard, big}; SegmentedSize = {container, standard, containerIcon, icon}
    ButtonSize = {default, sm, icon, iconSm, iconMicro}; TextDropdownSize = {default, sm}
    TabSize = {default, sm, micro, fill, icon, iconSm, iconMicro}; ToggleSize = {default, sm, icon, iconSm}
    IconSizes = {sm, rg, md, lg}; LoadingSpinnerSize = {sm, rg, md, xl}
- impact: The point of dot-accessible consts is guessable IntelliSense; a consumer who knows `ButtonSize.sm` types `AvatarSize.sm`, and `ButtonSize.default` → `StickerSize.default` — both compile errors. Caught at compile time, so the cost is friction and a trap for agents generating code by analogy, not a runtime bug. Sticker (newest) chose `standard`, so the split is still widening.
- recommendation: Pick one base-size key and one small-size key for the next major; until then state the convention in the architecture skill so new consts follow it deliberately.
- breaking: major
- contract: n/a
- remediation: tbd
- related: [U12-F14]

### U12-F16: `TableHeaderCell` applies header typography only on the sortable branch — sortable cells auto-wrap `ButtonText` inside a Button, plain cells render raw children — and the stories use `ButtonText` in some headers and `BodyText` in others
- severity: S3
- category: inconsistency
- rules: [R8.17]
- scope: consumer-visible
- confidence: plausible
- verified_by: "Read Table.tsx:70-101 and Table.stories.tsx: `ButtonText` in headers at stories 50-59, 194-197; `BodyText` in headers at 143-149, 236-239, 282-285."
- locations:
  - src/components/Table/Table.tsx:72-99
  - src/components/Table/Table.stories.tsx:49-60
  - src/components/Table/Table.stories.tsx:142-150
  - src/components/Table/Table.stories.tsx:235-240
  - src/components/Table/Table.stories.tsx:281-286
- evidence: |
    Table.tsx:85              <ButtonText>{children}</ButtonText>
    Table.tsx:95        className={cn("flex items-center px-rg py-xs", className)}
    Table.tsx:98        {children}
    Table.stories.tsx:50          <ButtonText>Status</ButtonText>
    Table.stories.tsx:143          <BodyText>Column A</BodyText>
- impact: A table with mixed sortable and plain columns renders two header text roles unless the consumer remembers to wrap plain headers in `ButtonText` — and the DS's own stories do it both ways, so the intended header typography is undiscoverable. Sortable cells also cannot receive Button props (`aria-label`, `disabled`) because `...props` go to the wrapper div.
- recommendation: Make the header cell own its role class (`text-style-button` on the cell in both branches) and render header labels uniformly in the stories.
- breaking: none
- contract: n/a
- remediation: tbd
- related: [U12-F4, U12-F12]
