
## 2. File ledger

| path | lines read | status | finding IDs |
| --- | --- | --- | --- |
| src/components/Avatar/Avatar.tsx | 1-36 (all) | findings | U12-F7, U12-F14, U12-F15 |
| src/components/Avatar/index.ts | 1-2 (all) | reviewed-clean | — |
| src/components/Avatar/Avatar.stories.tsx | 1-82 (all) | findings | U12-F18 |
| src/components/OutlineSection/OutlineSection.tsx | 1-43 (all) | findings | U12-F7, U12-F9, U12-F19 |
| src/components/OutlineSection/index.ts | 1 (all) | findings | U12-F19 |
| src/components/OutlineSection/OutlineSection.stories.tsx | 1-85 (all) | reviewed-clean | — |
| src/components/Sticker/Sticker.tsx | 1-143 (all) | findings | U12-F1, U12-F2, U12-F10, U12-F19 |
| src/components/Sticker/constants.ts | 1-42 (all) | findings | U12-F2, U12-F15 |
| src/components/Sticker/index.ts | 1-3 (all) | reviewed-clean | — |
| src/components/Sticker/Sticker.stories.tsx | 1-170 (all) | findings | U12-F18 |
| src/components/Table/Table.tsx | 1-164 (all) | findings | U12-F4, U12-F5, U12-F6, U12-F11, U12-F12, U12-F13, U12-F16, U12-F17, U12-F19 |
| src/components/Table/constants.ts | 1-10 (all) | reviewed-clean | — |
| src/components/Table/index.ts | 1-10 (all) | reviewed-clean | — |
| src/components/Table/Table.stories.tsx | 1-293 (all) | findings | U12-F16, U12-F17, U12-F18 |

Cross-referenced (outside scope, cited only): src/styles/tokens.css 575-724 (+ targeted greps) → U12-F1/F2/F3/F8; src/components/Button/Button.tsx 1-141 → U12-F4; src/components/OutlineButton/OutlineButton.tsx 138-175 → U12-F7; src/utils/cn.ts (all), src/utils/color.ts (all) → U12-F19; skills/dooph-design-system-theming/references/token-contract.md 105-113.

Class existence: every utility used by the four components and their stories resolves in `docs/audit/_work/dist-styles.css` (`node docs/audit/_work/scratch/U12/classcheck.mjs …` → OK) except `text-text-primary` (MISSING → U12-F4). `ds-p-ui-xs` is at src/styles/dooph-component-tokens.css:332; `text-style-button`/`-label` at src/styles/index.css:224/282; `h-tab-micro` is a hand-written utility at src/styles/index.css:350-351 reading `--ui-height-tab-micro`.

## 3. Fingerprints

| component | file | "use client" | forwardRef | ref type helper | displayName | props type | className merge | style handling | ...props target | asChild | variant/size consts | cva? | controlled/uncontrolled API | state styling | disabled helper | focus helper | typography | token access | motion | outside-subtree access | header contract | story file | folder index.ts shape |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Avatar | src/components/Avatar/Avatar.tsx | absent; not needed (forwardRef only) | yes | HTMLDivElement | set, "Avatar" (matches) | `AvatarProps` exported interface extends `HTMLAttributes<HTMLDivElement>` + `size?` | `cn(base…, size && …, className)` — consumer last | n/a — component sets no style; consumer `style` passes through `...props` | root `<div>` | no | `AvatarSize` {standard, small} INLINE in Avatar.tsx (not constants.ts), camelCase, derived type same identifier | no — `size === X && "…"` chain | none | none | none | none | none (colour only: `text-prominent-color`) | utilities; arbitrary `size-[38px]` / `size-[22px]` | none | none | absent | present; consts used; raw `<span>` + hex logo fills (F18) | named: `export { Avatar, AvatarSize }` + `export type { AvatarProps }` |
| OutlineSection | src/components/OutlineSection/OutlineSection.tsx | absent; not needed | yes | HTMLDivElement | set, "OutlineSection" | `OutlineSectionProps` exported EMPTY interface extends `HTMLAttributes<HTMLDivElement>` | `cn(base, className)` on OUTER ring only; inner card not reachable | n/a — passes via `...props` to outer | outer `<div>` | no | none | no | none | none | none | none | none (children) | utilities + `ds-p-ui-xs` + arbitrary `rounded-[28px]`; inner uses `bg-secondary` (button fill token) + `shadow-menu` | none | none | absent (JSDoc only; "dashed" is false → F9) | present; 2 stories; DS components + consts; no override props to contradict | `export * from './OutlineSection'` |
| Sticker (public) + StickerBase (internal) | src/components/Sticker/Sticker.tsx | absent; not needed (throw + forwardRef only) | yes ×2 — `Sticker` is a typing-only forwardRef around `StickerBase` (same pattern as Slider) | HTMLDivElement | both set to "Sticker" (base duplicates public name; Slider uses 'SliderBase') | `StickerProps` exported type alias: paint union & `Omit<HTMLAttributes<HTMLDivElement>,"color">` & `{size?}`; `StickerBaseProps` internal widened | `cn(stickerVariants({variant,size}), className)` — consumer last | merged — `custom`: `{...style, color, backgroundColor}` (component wins on the two paints it owns); else `style` passthrough; `style` destructured so `{...props}` after cannot clobber | root `<div>` | no | `StickerVariant` {prominent, alternate, secondary, tertiary, danger, custom}, `StickerSize` {standard, micro} in constants.ts (no "use client"), camelCase, derived types | yes — `stickerVariants`, exported publicly (like buttonVariants/checkboxVariants/tabTriggerVariants) | none | none | none | none | `text-style-button` on root (stories also wrap label in `ButtonText`) | utilities; `custom` → inline `color` + `color-mix(… var(--ui-sticker-bg-opacity) …)` string (caller-supplied, R8.12-compliant); `color` is open `DsColor` (R1.4) | none | none | present, sectioned, `/*`, first in file; accurate except dark-mode wash claims (F2) and wrapper necessity (F10) | present; consts; every variant + size + custom (raw hex, commented) | named: component + cva + type + consts |
| Table | src/components/Table/Table.tsx | absent; not needed (no hooks) — explained by top comment | yes | HTMLDivElement | set, "Table" | `TableProps` exported interface extends `HTMLAttributes<HTMLDivElement>` + `columns: string` (required) + `rowHeight?: string` | `cn(base, className)` | merged — `{ "--table-cols", "--table-row-height"?, ...style }` (consumer last) `as React.CSSProperties` | root `<div>` | no | none | no | none | none | none | none | none | utilities; inline caller-supplied custom properties | none | none | 3-line `//` note (not a contract), accurate | present | named re-exports (+ `TableSortDirection`, types) |
| TableHeader | Table.tsx | (file) neutral | yes | HTMLDivElement | set, matches | inline `HTMLAttributes<HTMLDivElement>` (no named type) | `cn(base, className)` | CLOBBERED — `style={{gridTemplateColumns}}` then `{...props}`; consumer style replaces it (F5) | root | no | none | no | none | none | none | none | none | tokens `py-xs px-xxs`; inline `var(--table-cols)` | none | none | — | Header story | — |
| TableHeaderCell | Table.tsx | (file) neutral; renders client `Button` | yes | HTMLDivElement | set, matches | `TableHeaderCellProps` exported interface + `sortDirection?: TableSortDirection`, `onSort?: () => void` | `cn(base, className)` on wrapper, both branches; inner Button className fixed | n/a — style passes to wrapper | wrapper `<div>` in both branches (never the Button) | no | `TableSortDirection` {none, ascend, descend} constants.ts, camelCase, derived; prop `sortDirection` (not variant/size — state enum, cf. RC-1) | no | controlled only: `sortDirection` + `onSort`; `undefined` = not sortable | JS branch on `sortDirection` (icon swap); no `aria-sort` (F11) | none of its own | Button's `ds-focus-visible-ring` (sortable only) | `ButtonText` auto-wrapped (sortable) / none (plain) — F16 | tokens `px-rg py-xs`; Button `px-3`; numeric `gap-1`; dead `text-text-primary` (F4) | Button's `duration-150 ease-out` | none | — | HeaderCellSortStates | — |
| TableRow | Table.tsx | (file) neutral | yes | HTMLDivElement | set, matches | inline `HTMLAttributes<HTMLDivElement>` | `cn(base…, className)` | CLOBBERED — `style={{gridTemplateColumns, height}}` then `{...props}` (F5) | root | no | none | no | none | CSS `hover:bg-ghost-hover` | none | none | none | utilities; `border-b` + no-op `not-last:border-b` (F6); inline `var(--table-cols)`, `var(--table-row-height, auto)` | `transition-colors duration-100` hardcoded (F13) | none | — | Rows | — |
| TableCell | Table.tsx | (file) neutral | yes | HTMLDivElement | set, matches | inline `HTMLAttributes<HTMLDivElement>` | `cn(base, className)` | n/a | root | no | none | no | none | none | none | none | none | numeric `px-4 py-3` (F12) | none | none | — | CellStackedContent | — |
| TablePlaceholder | Table.tsx | (file) neutral | yes | HTMLDivElement | set, matches | inline `HTMLAttributes<HTMLDivElement>` | `cn(base, className)` | n/a | root | no | none | no | none | none | none | none | none | numeric `py-8` (F12) | none | none | — | Placeholder | — |

Cross-component notes (U12): all four use `forwardRef<HTML*Element>` + `displayName` + `cn(internal, className)` with consumer last — consistent. Differences: variant-class strategy (Avatar `&&` chain vs Sticker cva vs none); consts location (Avatar inline vs Sticker/Table constants.ts — F14); props type naming (Avatar/OutlineSection/Table/TableHeaderCell exported named types vs four Table parts using inline `HTMLAttributes<HTMLDivElement>` with no exported props type); style handling (Sticker/Table merge vs TableHeader/TableRow clobber — F5); quote style (OutlineSection single quotes, others double; no formatter config in repo); barrel shape (OutlineSection `export *`, others named). Radius utilities: Avatar `rounded-avatar(-sm)`, OutlineSection `rounded-[28px]` + `rounded-soft`, Sticker `rounded-tight`/`rounded-mini`, Table `rounded-normal` — only the arbitrary one is a finding (F7; `rounded-mini`/`rounded-avatar` are real tokens, cf. RC-5).

## 4. Claim results

| claim-src path:line | claim (short quote) | result | evidence |
| --- | --- | --- | --- |
| src/components/Sticker/Sticker.tsx:5-6 | "`variant` maps through `stickerVariants` onto the content colour and the wash" | TRUE | Sticker.tsx:38-45, 119 |
| src/components/Sticker/Sticker.tsx:6-7 | "the wash is a color-mix at the sticker opacity" | FALSE (dark danger `#ffffff`; dark secondary ignores its opacity token) | tokens.css:711-718 → U12-F2 |
| src/components/Sticker/Sticker.tsx:7 | "the component does not apply alpha a second time" | TRUE | Sticker.tsx:31-56 (no opacity utility) |
| src/components/Sticker/Sticker.tsx:8 | "`standard` hugs its label" | TRUE | Sticker.tsx:33 `w-fit`, :47 `rounded-tight py-sticker-y` (no fixed height) |
| src/components/Sticker/Sticker.tsx:8-9 | "`micro` is a fixed `--ui-height-tab-micro` chip with the mini radius" | TRUE | Sticker.tsx:48 `h-tab-micro rounded-mini`; index.css:350-351; theme.css:121 |
| src/components/Sticker/Sticker.tsx:9 | "Paints do not change" (with size) | TRUE | Sticker.tsx:46-49 (no colour classes in size map) |
| src/components/Sticker/Sticker.tsx:10-12 | children "wrapped in a row with `gap-xs`"; "wrapper is layout, not an interactive element" | TRUE (as description; necessity disputed → U12-F10) | Sticker.tsx:131 |
| src/components/Sticker/Sticker.tsx:13-15 | `custom`: `color` inline is content colour; wash at `--ui-sticker-bg-opacity` | TRUE | Sticker.tsx:111-128 |
| src/components/Sticker/Sticker.tsx:18-20 | (constraint) wash alpha not baked into a hex | FALSE for dark danger (opaque hex, not opacity-driven) | tokens.css:718 → U12-F1/F2 |
| src/components/Sticker/Sticker.tsx:21 | "`custom` with no `color` throws" | TRUE | Sticker.tsx:104-109 |
| src/components/Sticker/Sticker.tsx:22-23 | "The prop union is the real guard" | TRUE | tsc on scratch/U12/tsc/check.tsx → line 2 TS2322 (custom w/o color), line 3 TS2322 (color on prominent) |
| src/components/Sticker/constants.ts:1-2 | server-safe, no "use client" | TRUE | grep → only the comment mentions it |
| src/components/Sticker/constants.ts:9-11 | secondary washes the secondary button's active border; danger washes danger-secondary, content danger-primary | TRUE light / FALSE dark (danger) | tokens.css:600, 612, 626-628 vs 717-718 |
| src/components/Sticker/constants.ts:11-13 | wash alpha is 20% except light secondary (`-opacity-secondary`) | TRUE light / FALSE dark danger (no alpha) | tokens.css:602-603, 718 |
| src/components/Sticker/constants.ts:15-19 | `custom` REQUIRES `color`; compile error + runtime throw | TRUE | tsc check (above); Sticker.tsx:104 |
| src/components/Sticker/constants.ts:35 | `standard` "6px vertical padding, tight radius" | TRUE | tokens.css:633; Sticker.tsx:47 |
| src/components/Sticker/constants.ts:36 | `micro` "fixed `--ui-height-tab-micro` (28px) chip with `radius-mini`" | TRUE | tokens.css:477, 538 |
| src/components/Table/Table.tsx:1-3 | no "use client": no hooks, `onSort` passthrough, may import client `Button` | TRUE | Table.tsx (no hooks); Button.tsx:23 `"use client"` |
| src/components/Table/constants.ts:1-2 | server-safe, re-exported via index.ts, imported by Table.tsx | TRUE | Table/index.ts:9; Table.tsx:12 |
| src/components/OutlineSection/OutlineSection.tsx:7 | "A double-border container shell" | TRUE | OutlineSection.tsx:22, 30 |
| src/components/OutlineSection/OutlineSection.tsx:8 | "Outer ring: dashed/thin border" | FALSE | OutlineSection.tsx:22 `border-solid` → U12-F9 |
| src/components/OutlineSection/OutlineSection.tsx:8 | "Inner card: bg-secondary surface with shadow" | TRUE | OutlineSection.tsx:30-31 |
| .agents/skills/dooph-ds-codebase/SKILL.md:442 | OutlineSection "outer dashed ring + inner surface card" | FALSE (solid) | OutlineSection.tsx:22 → U12-F9 |
| .agents/skills/dooph-ds-codebase/SKILL.md:443 | Avatar "Composable square shell; `children` only, size via `AvatarSize.standard/small`" | TRUE | Avatar.tsx:4-7, 10-12, 23-24 (`size-[…]` = square) |
| .agents/skills/dooph-ds-codebase/SKILL.md:458 | no `--ui-color-avatar-bg`; Avatar composes `bg-surface-secondary` + `border-border-secondary` + `text-prominent-color`; logo via children, no provider | TRUE | rg avatar src/styles → radius tokens only; Avatar.tsx:21-22; classcheck OK for all three |
| .agents/skills/dooph-ds-codebase/SKILL.md:630-631 | `Table` (no hooks) is neutral | TRUE | Table.tsx has no hooks and no directive |
| .agents/skills/dooph-ds-codebase/SKILL.md:637-641 | consts in constants.ts "except `Avatar` and `BaseIcon`, which declare theirs inline in server-safe modules — equivalent" | TRUE as fact (Avatar.tsx and BaseIcon.tsx have no directive); "equivalent" disputed → U12-F14 | grep -c '"use client"' BaseIcon.tsx → 0 |
| .agents/skills/dooph-ds-architecture/SKILL.md:236 | Avatar is a composable display shell; no logo providers or asset URL props | TRUE | Avatar.tsx:10-12 (only `size` added) |
| skills/dooph-design-system-usage/SKILL.md:154 | Layout/surfaces: `OutlineSection`, `Avatar`, `Sticker` | TRUE | dist-index.d.ts:7-9, 130 |
| skills/dooph-design-system-usage/SKILL.md:155-157 | `StickerVariant` / `StickerSize` keys; `micro` is `--ui-height-tab-micro` | TRUE | constants.ts:21-28, 38-41; index.css:350-351 |
| skills/dooph-design-system-usage/SKILL.md:157-158 | "Children are the label — an icon and text, laid out in a row" | TRUE | Sticker.tsx:131 |
| skills/dooph-design-system-usage/SKILL.md:158-159 | `custom` REQUIRES `color` (token name or any CSS color); wash at `--ui-sticker-bg-opacity` | TRUE | utils/color.ts `DsColor = DsColorToken \| (string & {})`; Sticker.tsx:125 |
| skills/dooph-design-system-usage/SKILL.md:159-160 | "Omitting `color` is a compile error, and the component throws at runtime" | TRUE | tsc check line 2; Sticker.tsx:104-109 |
| skills/dooph-design-system-usage/SKILL.md:161-162 | Table parts + sortable headers via `TableSortDirection` | TRUE | dist-index.d.ts:145-146 |
| skills/dooph-design-system-usage/SKILL.md:162-163 | use Table "before hand-rolling a grid of divs for tabular data" | TRUE as advice, but Table is itself an un-roled div grid | → U12-F11 |
| skills/dooph-design-system-theming/references/token-contract.md:109-110 | dark danger content and wash are `#ffffff` | TRUE (describes the tokens; the tokens are the defect) | tokens.css:717-718 → U12-F1 |
| skills/dooph-design-system-theming/references/token-contract.md:112 | `--ui-sticker-bg-opacity-secondary` 60% dark; "the dark wash does not" read it | TRUE (describes a dead override) | → U12-F3 |

## 5. Stories check

- **Avatar.stories.tsx** — consts used (`AvatarSize.small`, `Object.values(AvatarSize)`); the only override prop (`size`) is contradicted by `Small`/`WithIcon`. Nits (F18): logo SVG hard-codes `#0A0A0A`/`#390EF8` fills instead of inheriting Avatar's `text-prominent-color` (dark-theme illegible), raw `<span className="text-style-label …">` where `LabelText` exists (R9.24), numeric `gap-3`.
- **OutlineSection.stories.tsx** — clean: DS components throughout (Avatar, Button, Sticker, SegmentedTabSelect, LinearProgressIndicator, Text roles) with consts (`ButtonVariant`, `ButtonSize`, `AvatarSize`, `StickerVariant`, `SegmentedVariant`); no override props exist to contradict. Imports go to sibling files rather than barrels (stories only; not graded).
- **Sticker.stories.tsx** — consts for every variant and size; `custom` with a raw hex is deliberate and commented (demonstrates the open value, contradicting the default palette — R9.23 satisfied for `color`); `Sizes` covers `micro`. Nit (F18): `args: { children: "Milestones" }` on `Sizes`/`AllVariants` is ignored by their `render`. No dark-theme gate exists, which is how U12-F1 shipped.
- **Table.stories.tsx** — `TableSortDirection` consts used, all sort states shown, stories per part. Findings: `rowHeight` never exercised (F17, R9.23); header typography alternates `ButtonText`/`BodyText` (F16); `Default` re-declares the root border and overrides the default radius, redundant `<div>` wrappers inside `TableCell`, arbitrary `h-[420px]`/`h-[300px]` (F18). No raw `<button>` (R9.24 clean).

## DONE
