# 06B4 — Menu family (wave B, section B4)

Checklist
- [x] SearchBox draws the DS search icon; the two search rows name each other as twins [WI-089]
- [x] HotkeyIndicator `menu` variant replaces DropdownMenuSearch's descendant overrides [WI-090]
- [x] DropdownMenuSearch documents its keyboard limit [WI-092]
- [x] Styled submenu parts: DropdownMenuSubTrigger / DropdownMenuSubContent [WI-102]
- [x] Menu/trigger contracts, props types, Slot `type` off the typeable trigger's div [WI-118]
- [x] Complex menu width through the token in stories [WI-024, stories only]

Verification tools used (no Browser pane, no build): `npm run lint`, an esbuild
bundle of `src/index.ts` rendered with `react-dom/server` (scratchpad
`b4/probe.tsx`, 30 checks, all PASS), a `tsc --strict` type probe against
`src/index.ts` (`b4/types.tsx`, exit 0), and a `cn` class-set comparison of the
root menu panel (`b4/panel.ts`).

### SearchBox draws the DS `SearchIcon`; SearchBox and DropdownMenuSearch name each other as twins [F-082, WI-089]
- files: `src/components/SearchBox/SearchBox.tsx`, `src/components/Menu/DropdownMenuSearch.tsx`
- what changed: SearchBox's hand-drawn 16-unit glyph (circle r=4.25, 1.5
  stroke) is replaced by `<SearchIcon size={IconSize.md} className="shrink-0 text-text-tertiary" />`
  — the glyph DropdownMenuSearch already draws. SearchBox JSDoc names
  DropdownMenuSearch as its twin; DropdownMenuSearch's header `## behavior`
  names SearchBox as its twin ("apply row fixes to both").
  DropdownMenuSearch's `showShortcut` default is now spelled `!!shortcut`, the
  same expression as SearchBox (`shortcut` defaults to `["Esc"]`, so the
  result is unchanged).
- consumer impact: SearchBox's leading icon is now the DS search glyph (16px,
  DS icon stroke width 2) instead of a slightly smaller, thinner custom one.
  Box size unchanged. The icon is still `aria-hidden` (BaseIcon default).
- breaking: no
- verified: render probe — no `r="4.25"` in SearchBox output, the svg is
  `aria-hidden="true"`; no `<kbd>` without `shortcut`, `<kbd>` with it;
  DropdownMenuSearch still shows `Esc` by default and hides it with
  `showShortcut={false}`. Lint exit 0. Visual glyph comparison owed to the
  orchestrator (Storybook `Inputs/SearchBox/*` vs `Complex With Search`).
- docs owed: CHANGELOG `[Unreleased]` → Changed: "`SearchBox` draws the DS
  `SearchIcon` (16px) in place of its own glyph."

### HotkeyIndicator gets a `menu` variant; DropdownMenuSearch drops its `[&_kbd]` overrides [F-088, WI-090]
- files: `src/components/HotkeyIndicator/constants.ts` (new),
  `src/components/HotkeyIndicator/HotkeyIndicator.tsx`,
  `src/components/HotkeyIndicator/index.ts`,
  `src/components/HotkeyIndicator/HotkeyIndicator.stories.tsx`,
  `src/components/Menu/DropdownMenuSearch.tsx`
- what changed: new server-safe `HotkeyIndicatorVariant` const + type
  (`default` | `menu`), re-exported from the HotkeyIndicator barrel (and so from
  the package root). `HotkeyIndicator` takes `variant` (default `default`).
  `menu` = `h-6 min-h-6 text-text-tertiary` plus `bg-secondary-hover
  border-secondary-border-hover` at rest; `pressed` still wins for both
  variants. DropdownMenuSearch passes `variant={HotkeyIndicatorVariant.menu}`
  and `className="shrink-0"` — the five `[&_kbd]:` descendant selectors are
  gone. New story `Bits & Pieces/HotkeyIndicator/Menu`.
- consumer impact: additive — a consumer can now render the menu-row chip
  themselves. The default chip and the in-menu chip render the same as before
  (refactor, not restyle).
- breaking: no
- verified: render probe — the default chip's class set is identical to the
  pre-change spelling for 1 and 2 keys, pressed and not (4 checks). The menu
  chip's classes contain `h-6 min-h-6 bg-secondary-hover
  border-secondary-border-hover text-text-tertiary` and lack `min-h-[23px]`,
  `bg-surface-page`, `border-border-primary`, `text-ghost-fg`, which is the
  effective result of the old overrides. `rg "\[&_" src` (non-stories) → no
  output. Type probe: `variant: "nope"` is rejected. Computed-style
  comparison in Storybook (step 1/5 of the WI) owed to the orchestrator.
- docs owed: usage SKILL.md (HotkeyIndicator line) → `HotkeyIndicator`
  (`HotkeyIndicatorVariant`: `default` | `menu`); codebase SKILL.md
  HotkeyIndicator row → append `; variant (HotkeyIndicatorVariant.default|.menu,
  the menu-row chip)`; CHANGELOG `[Unreleased]` → Added: "`HotkeyIndicatorVariant`
  / `HotkeyIndicator` `variant` — `menu` is the chip used on menu rows."

### DropdownMenuSearch documents that it is not keyboard-reachable inside the menu [F-094, WI-092]
- files: `src/components/Menu/DropdownMenuSearch.tsx`, `src/components/Menu/DropdownMenu.stories.tsx`
- what changed: new last `## behavior` bullet ("Not keyboard-reachable inside
  DropdownMenuContent … consumers must give keyboard users another path");
  new shipped JSDoc on `DropdownMenuSearch` with a "Keyboard limit" paragraph;
  a doc comment on the `ComplexWithSearch` story. No code change.
- consumer impact: IntelliSense on `DropdownMenuSearch` now states the limit
  and the two workarounds (TypeableDropdownTrigger, or search outside the menu).
- breaking: no
- verified: `rg "Keyboard limit|Not keyboard-reachable" src/components/Menu` →
  2 lines, both in DropdownMenuSearch.tsx. Lint exit 0.
- docs owed: none beyond what the shipped JSDoc carries.

### `DropdownMenuSubTrigger` and `DropdownMenuSubContent` [F-091, WI-102]
- files: `src/components/Menu/DropdownMenu.tsx`, `src/components/Menu/index.ts`,
  `src/components/Menu/DropdownMenu.stories.tsx`
- what changed: the root panel's classes moved into one module constant
  `menuPanelClassName` (the list as it stands after the motion batch, ending in
  `ds-motion-overlay`), used by `DropdownMenuContent` and the new
  `DropdownMenuSubContent`. `DropdownMenuSubTrigger` = `itemBase` +
  `data-[state=open]:bg-ghost-active` + a trailing `ChevronRightIcon`
  (`IconSize.rg`); its children sit in a `gap-rg` span (the WI's `gap-sm` is
  pre-rename; `gap-rg` matches the radio item's children span).
  `DropdownMenuSubContent` takes `portal` (default true) / `portalProps` like
  the root content. Both exported from the module and the Menu barrel. Header
  `## behavior` gains the submenu bullet. New story `Menus/DropdownMenu/Submenu`.
- consumer impact: a styled submenu without importing Radix. Root
  `DropdownMenuContent` output unchanged.
- breaking: no
- verified: `cn` class-set comparison — the root panel's merged class set is
  identical before/after with `matchTriggerWidth` true and false. Render probe
  (open, unportalled) renders the sub trigger with `aria-haspopup="menu"` and
  two `role="menu"` panels. Type probe imports both from `src/index.ts`, exit 0.
  Radix `SubContent` sets `--radix-dropdown-menu-content-transform-origin`
  too (react-dropdown-menu dist :226), so `ds-radix-dropdown-content-origin`
  works on the sub panel. Keyboard/hover behaviour (ArrowRight opens, Escape
  closes only the sub) owed to the orchestrator in Storybook.
- docs owed: codebase SKILL.md — remove `DropdownMenuSub` from the
  pass-through row; add a row `DropdownMenuSub`, `DropdownMenuSubTrigger`,
  `DropdownMenuSubContent` (Sub = pass-through; SubTrigger = itemBase + open
  fill + trailing ChevronRightIcon; SubContent shares `menuPanelClassName`,
  `portal`/`portalProps`). Usage SKILL.md menu paragraph — add
  "`DropdownMenuSub` + `DropdownMenuSubTrigger` + `DropdownMenuSubContent` (a
  nested submenu; the sub panel takes `portal`/`portalProps`)". CHANGELOG
  `[Unreleased]` → Added: "`DropdownMenuSubTrigger` and `DropdownMenuSubContent`,
  so `DropdownMenuSub` builds a styled submenu without importing Radix."

### Menu/trigger contracts name their failures; three props types exported; TypeableDropdownTrigger drops Slot's `type` [F-113, F-115, WI-118]
- files: `src/components/Menu/DropdownMenu.tsx`, `src/components/Menu/DropdownMenuSearch.tsx`,
  `src/components/DropdownCaret/DropdownCaret.tsx`,
  `src/components/DropdownTrigger/DropdownTrigger.tsx`, `src/components/Menu/index.ts`
- what changed:
  - DropdownMenu.tsx header: the danger exception is its own sentence; both
    constraints name their failure; a new constraint records that
    `focusOnOpen={false}` / `onOpenAutoFocus` reach Radix's private
    `onOpenAutoFocus` through the cast at the Content spread (checked against
    installed react-menu 2.1.24: dist/index.mjs :179 and :266). The cast-spread
    itself is untouched.
  - New exported types `DropdownMenuProps`, `DropdownMenuContentProps` (with a
    JSDoc on `onOpenAutoFocus` pointing at the constraint), `DropdownMenuItemProps`;
    `DropdownMenuSegmentProps` documents `children` ("rendered only when
    `variant` is `labeled`"). All re-exported from the Menu barrel.
  - DropdownMenuSearch.tsx and DropdownCaret.tsx constraints each append their
    failure (wording only, rules unchanged).
  - TypeableDropdownTrigger: the rest props are `rest`; `type` is dropped
    before spreading onto the root `<div>` (`const { type: _slotType, ...triggerProps } = rest …`).
    No header contract in DropdownTrigger.tsx; wave A's `asChild` work kept.
- consumer impact: three new type exports (additive). TypeableDropdownTrigger's
  root `<div>` no longer carries `type="button"`; every other Radix trigger
  attribute still flows through.
- breaking: no
- verified: render probe of `<DropdownMenuTrigger asChild><TypeableDropdownTrigger/>`
  — root div has no `type=`, still has `aria-haspopup="menu"` and the Radix
  `id`; the inner input keeps `type="text"`. Type probe with the three new
  types, exit 0. `rg "never the faded .ghost-fg. rest$"` → 1 hit; `rg "tone — except"`
  → none. Lint exit 0 (so `_slotType` passes the repo's tsc flags). Typeable
  open/focus behaviour in Storybook owed to the orchestrator.
- docs owed: CHANGELOG `[Unreleased]` → Added: "Types `DropdownMenuProps`,
  `DropdownMenuContentProps`, `DropdownMenuItemProps`."; Fixed:
  "`TypeableDropdownTrigger` no longer renders Radix's `type="button"` on its
  root `<div>`."

### Complex menu width goes through the token in the stories [F-069, WI-024 — stories only]
- files: `src/components/Menu/DropdownMenu.stories.tsx`
- what changed: `ComplexWithoutSearch` and `ComplexWithSearch` sections use
  `width="var(--ui-min-w-menu-complex)"` instead of `324`;
  `SectionWidthOverride` moves to a bespoke `280` (button label "Width 280").
- consumer impact: none (stories). Retuning `--ui-min-w-menu-complex` now moves
  the search row and the results section together.
- breaking: no
- verified: `rg "width=\{324\}" src` → no output. Lint exit 0. Rendered widths
  (324px / 280px) owed to the orchestrator.
- docs owed: architecture SKILL.md (the `DropdownMenuSection width` sentence)
  and codebase SKILL.md (`ds-min-w-menu-complex` bullet and the token
  description) per WI-024 steps 3–4: the complex width is passed as
  `width="var(--ui-min-w-menu-complex)"`; `ds-min-w-menu-complex` is
  DropdownMenuSearch's floor, not a section helper.

### Scoreboard
No metric moved (before and after runs identical). Noted, not touched: the
default HotkeyIndicator's `min-w-[23px] min-h-[23px]` (2 arbitrary px) and the
`h-6 min-h-6` moved verbatim into the `menu` variant (tokenising them is
F-017's); SearchBox `gap-2` and HotkeyIndicator `gap-1` (numeric spacing) are
outside these WIs.

## DONE
