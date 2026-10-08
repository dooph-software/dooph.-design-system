# 06B2 — Table (WI-106, WI-074, WI-114)

Checklist
- [x] WI-106 style merge, roles, aria-sort, buttonProps
- [x] WI-074 text-text-primary → text-text
- [x] WI-114 plain header labels as ButtonText; stories pass bare strings
- [x] lint, scoreboard, SSR probe, type probe

## 2026-10-03

### Table parts merge a consumer `style`, carry table roles and `aria-sort`, and TableHeaderCell takes `buttonProps` [F-029, F-042, F-039, WI-106]
- files: `src/components/Table/Table.tsx`
- what changed:
  - `TableHeader` and `TableRow` destructure `style` and spread it last
    (`{ gridTemplateColumns: …, ...style }`). Before, a consumer `style`
    replaced the whole object and wiped the column grid and row height.
  - Roles, all written before `{...props}` so a consumer's own `role` wins:
    `Table` `table`; `TableHeader`, `TableRow` `row`; `TableHeaderCell`
    `columnheader` (both branches); `TableCell` `cell`; `TablePlaceholder`
    `row`, with its children wrapped in `<div role="cell" className="contents">`
    (no layout change).
  - A sortable `TableHeaderCell` sets `aria-sort` through a local map
    (`none`→`none`, `ascend`→`ascending`, `descend`→`descending`). The
    `TableSortDirection` values are unchanged.
  - New optional `TableHeaderCellProps.buttonProps`, spread onto the sort
    `<Button>` after its variant/size; its `className` merges via `cn`; the
    click is always `onSort`. Type: `Omit<ButtonProps, "children" | "onClick" |
    "asChild" | "variant" | "size">`. **Deviation from the WI:** the WI omitted
    only children/onClick/asChild. `Omit` over Button's variant×size union
    collapses it, so spreading it failed to compile (`variant: … | null` not
    assignable to the text-variant branch) and would have widened the pill
    restriction Button's header contract protects. The header owns the sort
    button's look, so `variant` and `size` are omitted too.
  - `React.CSSProperties` → imported `CSSProperties`.
- consumer impact: `<TableRow style={{ opacity: 0.5 }}>` keeps its grid. Screen
  readers now announce a table with rows, column headers, cells and sort state.
  `buttonProps` lets `aria-*`, `id`, handlers and a `className` reach the sort
  button instead of the wrapping `<div>`.
- breaking: no
- verified: `npm run lint` exit 0. esbuild bundle of the Table module in the
  scratchpad (`b2build/`, node_modules junctioned to the repo's) →
  `docs/audit/_work/scratch/W7a/table-check.cjs` all 8 PASS, exit 0, no React
  unknown-prop warning. Extra SSR probe: consumer `role` and `style.gridTemplateColumns`
  win on `TableRow`; consumer `role` wins on a plain header; `buttonProps.className`
  and `id` reach the `<button>`; `aria-sort` is `none`/`descending` as expected.
  `^\s+style=\{\{` in Table.tsx → 2 hits, each ending in `...style`.
  Not yet checked in Storybook (orchestrator: `Bits & Pieces/Table` →
  "Header Cell Sort States" read_page should show table → row → columnheader,
  columns aligned as before).
- docs owed:
  - CHANGELOG `[Unreleased]` → Added: "`TableHeaderCell buttonProps` — props
    for the sort button (not `variant`/`size`/`onClick`)." Fixed:
    "`TableHeader` / `TableRow`: a consumer `style` merges instead of wiping the
    column grid." and "`Table` parts expose table/row/columnheader/cell roles;
    sortable headers set `aria-sort`."
  - contribution SKILL.md:54 — the style spread-order rule (WI-106 step 7, verbatim).
  - usage SKILL.md:163 — roles/`aria-sort`/`buttonProps`/style-merge sentence
    (WI-106 step 8).

### Sortable TableHeaderCell uses the real `text-text` utility [F-060, WI-074]
- files: `src/components/Table/Table.tsx`
- what changed: the sort button's `text-text-primary` (no such token; it emitted
  no CSS but still made `cn` drop the Button's `text-ghost-fg`) → `text-text`
  (`--color-text: var(--ui-color-text)`). Folded into the new
  `cn("w-full justify-start gap-1 text-text", buttonProps?.className)`.
- consumer impact: none in an app whose body colour is the text token. An app
  that sets a different colour on a Table ancestor now sees the sortable label
  in `--ui-color-text` instead of inheriting.
- breaking: no
- verified: SSR probe → the button's classes include `text-text`, and neither
  `text-text-primary` nor `text-ghost-fg`. `rg text-text-primary src` → 0.
- docs owed: CHANGELOG `[Unreleased]` → Fixed: "Sortable `TableHeaderCell`
  labels use the `text-text` token utility (the previous class did not exist)."

### Every TableHeaderCell label renders as ButtonText; stories pass bare strings [F-074, WI-114]
- files: `src/components/Table/Table.tsx`, `src/components/Table/Table.stories.tsx`
- what changed: the plain (non-sortable) branch renders
  `<ButtonText>{children}</ButtonText>`, mirroring the sortable branch. In the
  stories, all 13 wrapped header labels (the WI says 14 but lists 13) are now
  bare strings on one line; the unused `ButtonText` import is dropped.
- consumer impact: bare-string plain header labels now carry `text-style-button`
  (same size as body, button font/weight) instead of inheriting the page's
  style, matching the sortable header beside them. Labels already wrapped in
  `ButtonText` or another role component (e.g. `BodyText`) look the same — the
  inner span is closer. **Look change in the DS's own stories:** `Header`,
  `CellStackedContent` and `Placeholder` labelled their headers with
  `BodyText`; they now render in the button style like `Default` and `Rows`.
  I judged the BodyText rendering to be the inconsistency F-074 names, not
  "today's correct rendering", so I did not skip — orchestrator, please
  eyeball those three stories.
- breaking: no
- verified: `docs/audit/_work/scratch/W7b/52-table-header.cjs` against the
  scratch bundle → 3 PASS, exit 0. `rg ButtonText Table.stories.tsx` → 0;
  no multi-line `<TableHeaderCell>` remains; `<ButtonText>{children}</ButtonText>`
  appears twice in Table.tsx.
- docs owed: CHANGELOG `[Unreleased]` → Fixed: "`TableHeaderCell` applies the
  button text style to plain (non-sortable) labels too, so a header row reads
  in one style. Pass header labels as plain strings."

### Notes
- Scoreboard before → after: unchanged on every line. Table.tsx still holds 4
  Tailwind numeric spacing classes (`gap-1`, `px-4 py-3`, `py-8`); not in these
  WIs, left alone (`py-8` = 32px has no token).
- Table.tsx's line-1 "No use client" note stays true (no hook added).

## DONE
