# Claim check, batch 4: version-migration maintainer skill and the v6 migration skill

Checker: fresh, read-only on the repo. Truth for the v6 skill: tag `v5.3.0` against the
current working tree (no v6 release exists). Both trees were built in scratch worktrees
outside the repo (`../ds-cc4-old` at `v5.3.0`; `../ds-cc4-new` at HEAD plus a copy of every
modified tracked file in the working tree, byte-identical to it except for CRLF). Both
trees were built with `npm ci && npm run build` (exit 0), and both worktrees were removed
afterwards.

Method, all of it run (outputs in the session scratchpad):
- The maintainer skill's own procedure, end to end: `node scripts/surface.mjs` on each tree
  (old: 357 exports, new: 456), then `node scripts/surface-diff.mjs old.json new.json diff.md diff.json`,
  which gave 1468 lines. A second extraction of the new tree was byte-identical (`cmp`).
- The §7 defaults recipe (`createSourceProgram` → `extractExports(…, <tree>/src)` →
  `findRenderFunction` → `extractDefaults`) on both trees.
- TypeScript probes in `__probe__/` with the §6 tsconfig. A usage file compiles at OLD
  (exit 0), and each of its lines fails at NEW as the skill says. A fix file (every consumer
  fix and snippet in the v6 skill) compiles at NEW. An injected error proved the fix file
  is actually checked.
- `cn()` imported from each tree's `dist/index.js`.
- `npm pack --dry-run --json` in the new tree.
- The v6 codemod (from the repo, never run inside it) against fixtures in the scratchpad:
  with the preset, without it, with `--preset`, with an app-declared `--color-brand`, a
  missing path, `--write`, a rerun, a second `--spacing` run and `--force`.
- The step-6 `rg -nP` command, copied verbatim from the skill, run on a v5 fixture (25
  lines, one per v5 name family) and on a v6-only fixture.

The CHANGELOG changed while this check ran: `CHANGELOG.md` mtime was 17:43 on 2026-10-11,
and a snapshot was taken at 17:43:19. Statements about the CHANGELOG below refer to that
snapshot.

## Summary

| doc | claims | TRUE | FALSE | UNVERIFIABLE |
|---|---|---|---|---|
| .agents/skills/dooph-ds-writing-version-migrations/SKILL.md | 14 | 14 | 0 | 0 |
| …/references/surface-diff.md | 27 | 27 | 0 | 0 |
| …/references/migration-skill-shape.md | 14 | 14 | 0 | 0 |
| skills/dooph-design-system-v6-migration/SKILL.md | 93 | 84 | 8 | 1 |
| skills/dooph-design-system-v6-migration/codemod.mjs | 15 | 14 | 1 | 0 |
| **total** | **163** | **153** | **9** | **1** |

Consumer-reader check (v6 skill and codemod): there is no `src/`, `scripts/`, `docs/`,
`.agents/` or maintainer-skill reference. The only paths are under
`node_modules/@dooph-software/design-system/`, and the skill links only the consumer skills
`dooph-design-system-usage`, `-theming`, `-v5-migration` and `-v3-migration`. The
description is YAML-safe: a single-quoted scalar with no inner `'`, and the `: ` sequences
sit inside the quotes. All TRUE.

## FALSE

### v6 SKILL.md

**F1. skills/dooph-design-system-v6-migration/SKILL.md:10-11.** Claim: "v6 has 42 breaking changes. … **18 of them raise no compile error**".
- Evidence: The current CHANGELOG `[Unreleased]` Breaking list (snapshot) has 46 items
  plus the "No supported import breaks" package note. The 5 items it now has beyond the
  skill's count all hold in code:
  - `ShapeButton` default look. v5.3.0's `ShapeButton.tsx:60,88-94` paints with the
    secondary tokens. v6's `ShapeButton.tsx:107` sets `variant = ShapeButtonVariant.prominent`.
    The extractDefaults run gives `{shape}` → `{shape, variant: ShapeButtonVariant.prominent}`.
  - `CTAButton` ref. The surface diff shows `Ref<HTMLAnchorElement>` → `Ref<HTMLElement>`.
  - `PopoverContent` `sideOffset`. It is 4 in v5.3.0 `Popover.tsx:33` and 6 in v6
    `Popover.tsx:31`.
  - `CTAButton` measurement. The 20px `--ui-size-cta-icon` and the 370px
    `--ui-min-w-cta-pill-big` are gone; v6 has 22/26px icons.
  - Dropdown triggers end in `DropdownCaret`.

  The skill does not cover the ShapeButton default or the CTAButton ref at all. It
  mentions the 6px offset, the caret and the CTA icon only under "Visual changes".
- Fix: change the count to "v6 has 46 breaking changes … **22 of them raise no compile
  error**". That is the skill's 18, plus the ShapeButton default, the PopoverContent offset,
  the CTAButton measurement and the caret square. Add two items under step 5:
  - "`ShapeButton` defaults to `variant={ShapeButtonVariant.prominent}`, a violet shape
    (silent). For the old neutral look pass `variant={ShapeButtonVariant.primary}`."
  - "`CTAButton`'s ref is `HTMLElement`. Type an anchor ref `useRef<HTMLAnchorElement>(null)`,
    or annotate the callback."

  Also add the fix `sideOffset={4}` (on DatePicker, `contentProps={{ sideOffset: 4 }}`)
  next to the 6px note.

**F2. SKILL.md:3 (description).** Claim: "a --ui-spacing-* override stops working".
- Evidence: Every v5 step name still exists in v6 (`--ui-spacing-md` is in both
  tokens.css blocks), so the override is still read. It now lands on the step that means
  12px instead of 16px. The skill's own step 1 says: "Nothing errors: `p-md` still exists".
- Fix: "a --ui-spacing-* override lands on the wrong size".

**F3. SKILL.md:126-128.** Claim: "To retime one component, set `transition-duration` / `animation-duration` on your own class around it."
- Evidence: The durations sit on the DS's inner elements:
  - `index.css:490-496` `.ds-roll-hover-in/-out`
  - `index.css:794-800` `ds-roll-change`
  - `index.css:1107,1118` `.ds-reveal-change`
  - `index.css:580` underline
  - `index.css:834-837` sidebar rail

  `transition-duration` and `animation-duration` are not inherited, so a duration on a
  wrapper class changes nothing. The CHANGELOG gives the version the code supports: "to
  change one component alone, target its `ds-*` class".
- Fix: "To retime one component alone, override its `ds-*` class in your own unlayered
  CSS, scoped to a wrapper you own, for example
  `.my-cta .ds-roll-hover-in, .my-cta .ds-roll-hover-out { transition-duration: 300ms; }`.
  A literal duration also opts that rule out of the reduced-motion collapse."

**F4. SKILL.md:245-247 (and 250-251).** Claim: "Typography utilities (`font-*`, `text-*` sizes, `leading-*`, `tracking-*`) and the `text-style-*` classes are unchanged and still ship … The only typography change is the recipes one in step 5."
- Evidence: v6 `dist/styles.css` no longer carries the typography utilities v5's sheet had.
  These are in old.json `classes.utilities` and absent from new.json:
  - `font-title`, `font-label`, `font-body`, `font-button`, `font-heading`, `font-mono`,
    `font-sans`, `font-bold`, `font-medium`
  - `text-heading`, `text-title`, `text-label`, `text-sm`
  - `leading-[1.4]`, `tracking-wide`

  This is the same mechanism as the skill's next paragraph (line 241-243). What is
  unchanged: the `--font-*` / `--text-*` theme keys in `theme.css` (the surface diff shows
  no themeVars removal in those namespaces) and the `text-style-*` classes (3 added, none
  removed).
- Fix: "The typography theme keys (`--font-*`, `--text-*` in `theme.css`) and the
  `text-style-*` classes are unchanged, so with the preset those utilities still generate.
  Without your own Tailwind, the ones v5's sheet carried (`font-title`, `text-heading`,
  `font-label` …) no longer ship. Either way, set text through a Text component's props …"
  Then drop "The only typography change is the recipes one".

**F5. SKILL.md:351.** Claim: "Shape components are `DsShapeComponent` (they return `ReactNode`) | render them as JSX, or type the result `ReactNode`".
- Evidence: `DsShapeComponent = FunctionComponent<ShapeProps> & {…}` (`BaseShape.d.ts:21`).
  Under the candidate's `@types/react` 19.2.18 a function component returns
  `ReactNode | Promise<ReactNode>`. The probe `const s: ReactNode = StarShape({ size: 10 })`
  fails at NEW with TS2322 ("Type 'ReactNode | Promise<ReactNode>' is not assignable to
  type 'ReactNode'"). `ReturnType<DsShapeComponent>` compiles. The CHANGELOG (snapshot,
  line 240-244) already says `ReturnType<typeof StarShape>`.
- Fix: "Shape components are `DsShapeComponent`, a `FunctionComponent` (called as a
  function they return `ReactNode | Promise<ReactNode>`) | render them as JSX, or type the
  result `ReturnType<typeof StarShape>`".

**F6. SKILL.md:403-405.** Claim: "The per-module files under `dist/components/` and `dist/utils/` are gone".
- Evidence: `npm pack --dry-run` in the new tree lists 530 files under those folders
  (265 `.d.ts` + 265 `.d.cts`). `package.json` `files` excludes only
  `**/*.js`, `**/*.cjs`, `**/*.map` there, plus `dist/**/*.cjs.map`.
- Fix: "The per-module `.js` / `.cjs` files (and their source maps) under
  `dist/components/` and `dist/utils/` are gone".

**F7. SKILL.md:276.** Claim: "Toggle `variant="secondary"` → `"ghost"`".
- Evidence: there is no `Toggle` export. A probe of `<DS.Toggle …>` fails at NEW with
  TS2339. `ToggleVariant` types `ToggleSwitch` / `ToggleSwitchItem` `variant`
  (`dist/components/Toggle/Toggle.d.ts:22,31`). The string form on `ToggleSwitchItem` is
  a compile error, which is TRUE.
- Fix: "`ToggleSwitch` / `ToggleSwitchItem` `variant="secondary"` → `"ghost"`".

**F8. SKILL.md:411-412 (New in v6).** Claim: "the `DropdownMenuRadioSelectItem` / `DropdownMenuMultiSelectItem` / `DropdownMenuSub*` menu parts" are new.
- Evidence: `DropdownMenuSub` is exported at v5.3.0 (old.json `exports.DropdownMenuSub`).
  Only `DropdownMenuSubTrigger` and `DropdownMenuSubContent` are new.
- Fix: "… / `DropdownMenuSubTrigger` / `DropdownMenuSubContent` menu parts".

### v6 codemod.mjs

**C1. skills/dooph-design-system-v6-migration/codemod.mjs:45-46.** Claim: "A --spacing dry run always exits 0".
- Evidence: A second `--spacing` dry run on a fixture already shifted to `--ui-spacing-xxxl`
  printed "REFUSED" and exited 3 (`finish(3)` at :389 runs before the dry-run path).
  An unreadable path exits 2.
- Fix: "A --spacing dry run that is not refused exits 0: shifted and unshifted code look
  alike, so it cannot tell whether work is pending."

## UNVERIFIABLE

**U1. SKILL.md:378.** Claim: "`ProgressIndicator` throws on `progress={NaN}` (v5 drew a full ring)".
- The throw is TRUE: v6 `ProgressIndicator.tsx:313-315` uses a negated range test.
- That v5 drew a *full ring* is a browser fact. NaN passes v5.3.0's guard
  (`ProgressIndicator.tsx:292` `progress < 0 || progress > 1`), and the dash values become
  NaN, which suggests an ignored dash pattern and so a solid ring. No recorded render
  backs it.
- To verify: render v5.3.0's `ProgressIndicator progress={NaN}` in Storybook. The
  CHANGELOG makes the same claim.

## TRUE (compact)

### .agents/skills/dooph-ds-writing-version-migrations/SKILL.md (14)
- Items are inventoried from a diff of two built trees, reconciled with the CHANGELOG →
  the tools exist and ran (surface.mjs, surface-diff.mjs; 1468 lines).
- Rule 1 (never version, tag, publish or commit) → matches AGENTS.md "Never".
- Rule 2 commands (`git worktree add`, `npm ci && npm run build`, surface.mjs,
  surface-diff.mjs) → all ran, exit 0.
- Building in the main checkout rewrites tracked files → the `build` script runs
  generate-icon-exports, generate-shape-morph-ease and sync-tokens (package.json; outputs
  per the AGENTS.md generated table).
- A union props type breaks `extends`; an intersection does not → `interface X extends
  ButtonProps` gives TS2312 at NEW. `IconProps` (interface → type alias, an intersection)
  still extends.
- Rule 7 (codemod AUTO only for identical renders; exit = work pending) → the v6 codemod
  does both (fixture exits).
- Rule 8 (older skills ship in the new package) → pack lists 13 files under `skills/`,
  including v3, v5 and v6.
- Rule 9 (`init-skills` copies all of `skills/` and never deletes) → `bin/init.mjs:113`
  (readdirSync) and `:155` (`cp(…, {recursive, force})`); there is no rm.
- The quick-reference section pointers → surface-diff §1–4 / §5–7 and shape §1–5 exist
  as named.
- "The checker collapses DsColor to string; an old name still compiles" → lib header
  constraint (`scripts/lib/surface.mjs:24-27`); the probe `<LoadingSpinner color="brand"/>`
  compiles at NEW.
- Generated utilities are not consumer surface; hand-written ones are → of 276 removed
  utilities, only `h-tab-micro` is a hand-written selector in v5.3.0 `src/styles/`.
- Token overrides and colour strings fail silently → the token-removal and DsColor probes.
- Verify step 4 (`git worktree remove --force`) → used here.
- Related skills exist → `.agents/skills/dooph-ds-codebase-map`, `-editing-tokens`;
  `skills/dooph-design-system-usage`, `-theming`.

### references/surface-diff.md (27)
- OLD = the last tag → `git tag` ends at v5.3.0.
- §1 commands → ran.
- The build runs three generators → package.json `build`.
- A nested tree leaks without `source(none)` → v5.3.0 `index.css:1` has a bare
  `@import "tailwindcss";`, and its sheet holds `text-red-500` / `text-gray-700`.
- A good build holds `dist/index.d.ts`, `styles.css`, `theme.css` → both trees.
- §2 commands → ran.
- Reads the tree's own TypeScript and the listed inputs → `surface.mjs:45,72-76`;
  `lib:42-50`.
- Output keys → `surface.mjs:54-76` (it also writes `tree` and `tsVersion`).
- Every map is sorted; the same tree gives the same bytes → `sortObj`; the re-run `cmp`
  was identical.
- Do not change lib returns; generate-docs shares the lib → `lib:29-34`;
  `generate-docs.mjs:51`.
- The two passes and the probe → `surface.mjs:46-50`; `lib:132-156`.
- §3 command and outputs → ran.
- `diff.json` keeps paths; `getPath()` is exported → `surface-diff.mjs:34,315`.
- The section table (9 rows) → `diffExports`, `diffComponents`, `diffConsts`,
  `diffTypes`, `diffFunctions`, `diffTokenBlocks` ×2, `diffClasses` ×3, `diffPackage`
  (`surface-diff.mjs:85-276`).
- Repeated change across 4+ components becomes one line → `groupRepeated(recs, min = 4)`
  (`:67`); the Icons "88 components" lines.
- Triage rows → consistent with the probes; `DsColor` accepts any string (probe).
  Indexing `DS_COLOR_TOKENS` with a removed key is a compile error, but that is not this
  row's subject.
- `extractClasses` files hand-written utilities under `utilities` → `lib:777-794`.
- §5 reconcile rules → process, no factual conflict.
- §6 tsconfig equals `createDistProgram`'s options → `lib:123-131`.
- §6 tsc command → ran.
- §7 merged-symbol pitfall → lib header constraint.
- §7 `source(none)` plus an explicit `@source` → `index.css:1,3`.
- §7 `emit-css` compiles `build.css` minus stories; the older tree compiled `index.css`
  → `scripts/emit-css.mjs`; `build.css:6-7`; v5.3.0 `tsup.config.ts:13`.
- §7 defaults recipe → ran. SegmentedTabSelect `variant: secondary` →
  `primary + size: container`; PopoverContent `sideOffset` 4 → 6.
- cva `defaultVariants` not covered → `extractDefaults` reads destructuring only
  (`lib:483-505`).
- The `components.md` alternative is conditional on both trees carrying it → v5.3.0 has
  no such file, and the doc's condition says so.
- Cleanup commands → standard.

### references/migration-skill-shape.md (14)
- Worked examples (v3: SKILL only; v5: SKILL + codemod) → `ls skills/`.
- `files` includes `skills` → package.json.
- `init-skills` targets `.agents`, `.claude` and `.agent`; merges, never deletes →
  `init.mjs:80-96,155`.
- Consumer codemod path → in the tarball.
- The mirror sync never touches `skills/` → `sync-skills.mjs:42-43`.
- The CHANGELOG should name the skill and `init-skills` → the CHANGELOG snapshot now does
  (lines 22-24).
- Both shipped skills carry `metadata.short-description` → v3:5, v5:5.
- `--ui-color-primary-foreground` → `--color-primary-fg` → `theme.css:30`.
- Namespace → utility-prefix mapping → Tailwind v4.
- `h-button` / `size-avatar` hand-written in `@layer utilities` → `index.css:359,361,393,417`.
- Codemod shape (node: imports only, dry-run default, allowlist and skip list,
  identifier boundaries, doc lines skipped) → `v6 codemod.mjs:48-68,99,347`; fixture
  (the doc-comment line was not reported).
- Exit codes 1/2/0 → v6 codemod. It also has 3 for a refused `--spacing`, which the shape
  doc does not list (a note, not a conflict).
- Every `v*-migration` ships → pack.
- Forward notes exist → v3:31, v5:20.

### skills/dooph-design-system-v6-migration/SKILL.md (84)
- Description symptoms: `TwoWayToggle` / `ToastTypes` exports removed and
  `ButtonVariant.brand` key removed (diff); `--ui-color-brand` removed; `bg-brand`
  (`--color-brand` themeVar removed) and `ds-p-ui-xs` (class removed) paint nothing;
  `role="status"` → v5.3.0 `LoadingSpinner.tsx:304` vs v6 `:294`. YAML-safe.
- Older skills land on names v6 renames; `danger*` / `surface-page` come back → v5
  skill:85-91, v3 skill:115,158; v4.8.2 `tokens.css` had 9 `--ui-color-danger*`.
- With the preset `max-w-md` is the DS spacing; otherwise it is Tailwind's → tailwind
  4.3.3 `lib.js` `"max-w",["--max-width","--spacing","--container"]`.
- Spacing table → old `xxs 4, xs 8, sm 10, rg 12, md 16, lg 20, xl 28, xxl 40`; new
  `xxxs 2, xxs 4, xs 6, sm 8, rg 10, md 12, lg 16, xl 20, xxl 26, xxxl 42`.
- Codemod behaviour as described (fixtures):
  - the spacing shift works on overrides, `var(--spacing-*)` and utilities;
  - exit 3 on a second run that sees `xxxl`;
  - a second run without `xxl` is not detected ("cannot see every second run");
  - preset-gated, with `--preset`;
  - `xl`/`xxl` sites listed;
  - `ds-px-ui-sm` listed and untouched;
  - the normal mode lists NEEDS A HUMAN and CHECK BY EYE;
  - exits 1 (dry run pending, and `--write` with reports left), 2 (missing path), 0 (clean);
  - name-based identifier renames;
  - an own `--color-brand` left alone.
- `ds.tokens` layer → tokens diff "cascade layer: unlayered → ds.tokens".
- Renamed-token table → new tokens.css values:
  - `#340fd9`, `#390ef8`, `#44c0e5`, alt `#13c29f`;
  - danger-primary/-secondary unchanged;
  - surface-page `#fdfeff` / `#131c1d`;
  - input-border-focus = prominent-border-hover in light (prominent-border-active in dark);
  - input-border-hover `#b4b4b4` / `#3a3b3f`;
  - focus rings re-tinted;
  - radius-normal 18px;
  - icons 12/14/16/18;
  - stroke-width 2.
- Removed-token table: cta-icon 20 → 22/26; tab-micro 30 → button-micro 28 shared (v6
  `toggleOptionVariants` micro `h-button-micro`; Button icon-micro `size-button-micro`);
  min-w-menu-action 144 (min-w-menu 160); min-w-cta-pill-big 370.
- 17 motion tokens and their mapping → v6 `index.css` reveal 1107/1118, roll-change
  794-800, roll-hover 495-496, rolling-digits 662-720, sidebar 834-837, underline 580.
- `--ui-color-danger*` new meaning → `danger = var(--ui-color-secondary)`,
  `danger-foreground = var(--ui-color-danger-primary)`.
- Same-name value changes → button-micro 26 → 28, ghost-foreground → `var(--ui-color-text)`
  (was `#4a4a4a` / `#afafaf`), dark focus-ring-primary.
- Layer side effects and the reduced-motion collapse winning → the layered tokens and the
  `1ms !important` reduced-motion block.
- Theme-key table → themeVars removed/added (e.g. `--shadow-focus-error` →
  `--shadow-focus-danger`, `--radius-standard` → `--radius-normal`).
- Own keys are left alone → fixture c.
- `h-tab-micro` → `h-button-micro` 28px → v5.3.0 `index.css:264`, v6 `:424`.
- Spacing-helper table values, and `ds-py-ui-xxs` unchanged → `dooph-component-tokens.css`
  in both trees; v5.3.0 had 12 helpers.
- Other helpers → v5.3.0 `ds-disabled-control:disabled` (`:30`), `ds-focus-ring` always
  drawn (`:92-94`); the v6 classes exist.
- `cn` merge → old `"p-md p-lg"`, `"h-button h-8"`; new `"p-lg"`, `"h-8"`.
- `styles.css` holds only component utilities → `w-64`, `p-4`, `text-white` are in the
  old sheet and absent from the new one.
- Step-5 rename table → consts and exports diff (incl. `ToastTypes`
  `{brand, complex, error, simple}` → `ToastVariant` `{complex, danger, prominent, simple}`;
  `TooltipTypes`, `FontAxes`, `ProgressIndicatorVariants` keys identical).
- String forms are compile errors → probes (`variant="brand"`, `size="default"`,
  `size="small"`, ToggleSwitchItem `"secondary"`).
- Colour names silent; the codemod renames them on `color=` / `stepColor=` /
  `resolveDsColor` / `DS_COLOR_TOKENS[]` → probe compiles, `COLOR_RE`, fixture.
- Removed or redesigned items and their fixes (MultiSelectItem + selectType,
  RadioSelectItem in RadioGroup, Section width string/number, ShapeButtons set,
  Arrow/StarShape exist, SegmentedTabSelect table, the 38px shell at `SegmentedTabSelect.tsx`,
  helper snippet) → the fix probe compiles at NEW; consts diff.
- Prop and type table rows other than DsShapeComponent → the usage probe fails at NEW on
  each row and the fix probe compiles. CTAButton children were dropped in v5 → v5.3.0
  `CTAButton.tsx:126-130`.
- Union snippet and `size="sm"` literal → fix probe.
- `buttonVariants` / `tabTriggerVariants` lost `text-style-button` → v5.3.0
  `Button.tsx:38`, `Tabs.tsx:30`. `ButtonText as` and `HeroButtonText` compile.
- LoadingSpinner role and RollHoverText → v5.3.0 `RollHoverText.tsx:38` `aria-label`;
  v6 `AnimatedText/RollHoverText.tsx:64` `sr-only`.
- The NaN throw → v6 `ProgressIndicator.tsx:313-315`.
- Visual changes:
  - px instead of rem, with no change at a 16px root (spot check: Button `gap-2` → `gap-sm`,
    `px-3` → `px-md`);
  - violet prominent;
  - motion: `duration-100` → fast 150ms, roll-hover 500 → 420;
  - Popover look shared with `menuPanelClassName`, `sideOffset` 6;
  - SearchBox `SearchIcon`;
  - caret neutralised under practical (`tokens.css:959-960`);
  - dark text-tertiary `#8b8b8b`.
- Package `exports`, entries and peers unchanged → the pkg diff has only `files` lines.
- New-in-v6 exports (except F8) → added in the exports diff (32 AI exports, Sticker,
  FancyToggleSwitch, MorphRotationShape, ShapeMorphSpinner, DropdownCaret, SplitButtonGroup,
  DS_TW_MERGE_CONFIG, Button `medium` / `big`, Input `variant`).
- `init-skills` re-run → `bin/init.mjs`.
- Step-6 `rg` → all 25 v5 lines hit and the v6-only fixture has zero hits (exit 1). The
  no-PCRE2 fallback is consistent.

### skills/dooph-design-system-v6-migration/codemod.mjs (14)
- The two modes and their order, the AUTO/REPORT/ADVISORY split, "every v5 name here is
  gone in v6" (every TOKENS/KEYS/IDENTIFIERS/COLORS source is in the diff's removed set),
  preset detection, and own keys never renamed → fixtures a, b, c and s3.
- Exit 1 → dry run pending, and reports left after `--write`.
- Exit 2 → a missing path prints "cannot read nope/src (ENOENT)".
- Exit 3 → refused.
- `--force` bypasses the refusal.
- Skip list and extension allowlist → `:58-65`.
- Removed exports are reported only from DS imports → date-fns `isSameDay` was not reported.
- Doc-comment lines are skipped.
- `<SegmentedTabSelect>` without `variant` is advisory.
- The REPORT reasons match the code (button-micro 28, cta 22/26).

## Old false-claims register (FINDINGS.md §4) — reappearances

None. Phrases grepped in §4: init-skills, codemod, exits 0, never deletes, migration skill,
preset, spacing.
- C-VM-3 ("5.4 renamed tokens in a minor", FALSE): no "5.4" appears in any batch-4 doc.
- C-V5-3 / F-007 (a codemod that always exits 0): the v6 codemod exits 1 while work is
  pending (fixtures).
- F-006 (`rounded-standard` presented as current): the v6 skill lists it only as a v5
  name, which is correct, since v5.3.0 `dist/theme.css:102` has `--radius-standard`.

## CHANGELOG `[Unreleased]` Breaking against the v6 skill

The suspected CHANGELOG errors in `.superpowers/sdd/docs-pass-plan/changelog-issues-from-v6.md`,
against the snapshot (17:43:19):

1. **The CHANGELOG never names the v6 skill or `init-skills`.** This held when the check
   started (an earlier read of the section had neither). It is **resolved** in the
   snapshot: CHANGELOG.md:22-24.
2. **The spacing regex misses `var(--spacing-*)` and moves Tailwind's own `max-w-md`
   without the preset.** This held for the earlier text. Running the old snippet
   rewrote `max-w-md` → `max-w-lg` and left `var(--spacing-md)` unchanged. It is
   **resolved** in the snapshot: CHANGELOG.md:356-367 adds `DS_THEME` and the
   `(?<=var\(\s*)--spacing-` arm.
3. **`h-tab-micro` and `--ui-size-cta-icon` are presented as renames.** The code
   supports the skill: they are a merge (30 → 28px, shared with micro icon buttons) and a
   split (one 20px token for both CTA sizes → 22px / 26px). It is **resolved by caveat** in
   the snapshot. The token map still maps both (CHANGELOG.md:327-328) but now says they are
   not plain renames (:334-339), and the theme-key row reads "a merge, not a rename" (:449).
4. **The theme-key regex renames an app's own `--color-brand`.** This held for the earlier
   text. Running the old snippet renamed `--color-brand:` and `bg-brand` in an
   app-declared `@theme`. It is **resolved** in the snapshot: CHANGELOG.md:452-470 deletes
   app-declared keys first.

Remaining disagreements:
- **The 42/18 count, the ShapeButton default and the CTAButton ref.** The CHANGELOG is
  right and the skill is stale (F1).
- **Retiming a single component.** The CHANGELOG ("target its `ds-*` class") is right.
  The skill (a wrapper class) is wrong (F3).
- **The `DsShapeComponent` fix.** The CHANGELOG (`ReturnType<typeof StarShape>`) is
  right. The skill (`ReactNode`) does not compile (F5).
- **Package wording.** The CHANGELOG (".js / .cjs files … source maps") is right. The
  skill ("per-module files … gone") overstates it (F6).

The maintainer skill and the v6 skill agree everywhere else: render-identical renames
are AUTO and merges and splits are REPORT; the exit codes match; there are no repo
paths. One note: `migration-skill-shape.md` §4 lists exit codes 1/2/0 only, while the
v6 codemod adds 3 for the spacing refusal. This is an extension, not a conflict.

## Fixes

Re-verified against fresh builds in scratch worktrees `../ds-v6f-old` (v5.3.0) and
`../ds-v6f-new` (HEAD plus the working tree; `src/` and `package.json` identical to main),
both `npm ci && npm run build` exit 0, both removed afterwards. Probes compiled with the
§6 tsconfig (an injected error proved the fix file is checked).

- **F1 FIXED.** The count follows the CHANGELOG, which now has 47 Breaking items (one was
  added in round 2, below): "v6 has 47 breaking changes … **23 of them raise no compile
  error** … changed defaults, sizes, positions and roles", plus "some silent changes cannot
  be found by an old name … search for the token, component or test query the item names".
  Added the `ShapeButton` default (silent) under step 5, a `CTAButton` ref row (probe: a
  `ComponentRef<typeof CTAButton>` ref and an inline `(el) => el?.href` fail at NEW with
  TS2339; an anchor `useRef` and an annotated callback compile), and a new "Layout changes
  (silent)" section with the `sideOffset={4}` / `contentProps={{ sideOffset: 4 }}` fix
  (compiles at NEW), the CTAButton measurements and the wider dropdown triggers.
- **F2 FIXED.** Description: "a --ui-color-brand override stops working or a --ui-spacing-*
  one lands on the wrong size" (474 chars, single-quoted, no inner `'`).
- **F3 FIXED.** "The durations sit on the DS's inner elements and are not inherited … override
  its `ds-*` class in your own unlayered CSS, scoped to a wrapper you own:
  `.my-cta .ds-roll-hover-in, .my-cta .ds-roll-hover-out { transition-duration: 300ms; }` …"
  (the rule is in `@layer utilities`, index.css:359/490; the class is in the built chunk).
- **F4 FIXED.** "The typography theme keys … and the `text-style-*` classes are unchanged, so
  with the preset the typography utilities still generate. Without your own Tailwind, the
  ones v5's sheet carried (`font-title`, `font-label`, `text-heading`, `tracking-wide` …) no
  longer ship." (Each is in the v5.3.0 sheet and absent from the candidate's.)
- **F5 FIXED.** Row now: "`DsShapeComponent`, a `FunctionComponent`: called as a function
  they return `ReactNode | Promise<ReactNode>` | … `ReturnType<typeof StarShape>` (typing it
  `ReactNode` does not compile)". Probe: `ReactNode` fails TS2322 at NEW; `ReturnType` compiles.
- **F6 FIXED.** "The per-module `.js` / `.cjs` files (and their source maps) … are gone; the
  `exports` map never exposed them."
- **F7 FIXED.** "`ToggleSwitch` / `ToggleSwitchItem` `variant="secondary"` → `"ghost"`".
- **F8 FIXED.** "`DropdownMenuSubTrigger` / `DropdownMenuSubContent` menu parts".
- **C1 FIXED.** codemod header: "A --spacing dry run that is not refused exits 0".
- **U1 FIXED (narrowed).** "(v5's range check let NaN through, so it rendered without an
  error)": v5.3.0 `ProgressIndicator.tsx:292` tests `progress < 0 || progress > 1`, which NaN
  passes. The full-ring look is no longer claimed.

Mirror list (`.superpowers/sdd/docs-pass-plan/v6-mirror-from-changelog.md`), each checked at
both trees first:
1 ShapeButton default, 2 PopoverContent 4 → 6, 3 CTAButton measurements, 4 wider triggers,
5 CTAButton ref, 6 Button union rule (probe: `ButtonSize` and a 5-member union fail at NEW, a
4-member union compiles), 7 shape call, 11 ghost-foreground list (Tooltip removed: no
`ghost-fg` class in v6 Tooltip), 12 input-border-focus dark value, 13 base-size rename covers
SegmentedTabItem, 14 search by token/component/query, 15 init-skills (already there):
**MIRRORED**. 10 tab-micro merge / cta-icon split: **MIRRORED** as wording; the codemod keeps
them as NEEDS A HUMAN (rule 7: 30 → 28px and 20 → 22/26px do not render identically), so
the CHANGELOG's map entries for them are not copied into AUTO. 8 theme-key guards: the
codemod already behaves this way (`keyApplies`, `OWN_KEYS`); no change.
9 spacing **REJECTED in part**: the CHANGELOG snippet moves `var(--spacing-*)` reads but not
an app's own `--spacing-*` declarations. Run verbatim on `@theme { --spacing-md: 20px }` +
`.card { padding: var(--spacing-md) }` + `p-md`, it gives `--spacing-md: 20px`,
`var(--spacing-lg)`, `p-lg`: the readers leave the app's 20px for the DS 16px. The codemod
moves the declaration with them (`--spacing-lg: 20px`), so it is kept, and the skill now says
a key you declare moves with the utilities that read it. The CHANGELOG snippet is wrong for
that case.

Fixed 10 (8 FALSE, 1 FALSE in the codemod, 1 UNVERIFIABLE), rejected 0. No claims file
exists for the v6 skill or the CHANGELOG in `claims/`, so none was updated; the maintainer
skill's claims file is unchanged (all TRUE).

## Fix verification

Verifier, 2026-10-11. Truth = `git show v5.3.0:<path>` vs the working tree. No build was made; surface data came from the scratchpad `old.json` / `new.json` (src is the working tree's) and `@types/react` 19.2.18 in node_modules. Codemod run on a fresh copy of `scratchpad/v6/fx-pristine` (`scratchpad/vfy-fix/`).

- **F1: VERIFIED.** The SKILL says 47 / 23. CHANGELOG [Unreleased] > Breaking has 47 `- **` items (script count). 23 = the items that raise no compile error: 16 marked "(silent)" (ShapeButton, LoadingSpinner, RollHoverText, Slider, Icons, colour names, buttonVariants, micro height, cascade layers, spacing helpers, other ds helpers, px spacing, tabs, popover offset, CTA measure, dropdown caret) + 7 unmarked (ProgressIndicator NaN, colour tokens, spacing scale, motion tokens, removed tokens, Tailwind theme keys, `cn()`); SegmentedTabSelect is excluded because it also has compile errors. New text checked in code: `ShapeButton.tsx:107` defaults `variant` to `prominent`, v5.3.0 painted `text-secondary`; `Popover.tsx:31` `sideOffset = 6` vs v5.3.0 :33 `= 4`; DatePicker spreads `contentProps` onto `PopoverContent` (:152); CTAButton v5.3.0 `gap-xxl` (40px), `p-rg`, `ds-min-w-cta-pill-big` (370px), 20px icon vs v6 `ds-gap-cta-content-standard` 60px (`tokens.css:702`), `p-lg`, 22/26px icons (`tokens.css:696-697`); the CTA ref is `forwardRef<HTMLElement>` (v5.3.0 `HTMLAnchorElement`), so `ComponentRef` / an inline `el?.href` fail; dropdown triggers use `DropdownCaret`, `pl-md` only (v5.3.0 `ds-pr-ui-sm` + 14px `ChevronDownIcon`).
- **F2: VERIFIED.** Description is a single-quoted YAML scalar, 474 chars, no inner quote, one line. "a --ui-spacing-* one lands on the wrong size" is true (the step names survive).
- **F3: VERIFIED, with a nit.** `.ds-roll-hover-in/-out` carry `transition-duration` at `index.css:490-496`, so the wrapper-class claim and the `.my-cta .ds-roll-hover-in, ...` example are right. Nit: roll-hover also has its own reduced-motion block (`transition: none`, :537-541), so for that example a literal duration does not leave reduced-motion users animating. The sentence "a literal duration also opts that rule out of the reduced-motion collapse" is true only of the token collapse (`tokens.css:923-934`). Not false as worded; the maintainer may want to narrow it.
- **F4: VERIFIED.** `font-title`, `font-label`, `text-heading`, `tracking-wide` (and the rest) are in old.json `classes.utilities` and absent from new.json. No `--font-*` / `--text-*` themeVars were removed; textStyle: 3 added, none removed.
- **F5: VERIFIED.** `BaseShape.tsx:23` is `FunctionComponent<ShapeProps> & {...}`; `@types/react` `FunctionComponent` returns `ReactNode | Promise<ReactNode>` (index.d.ts:1061).
- **F6: VERIFIED.** `package.json` `files` excludes `.js` / `.cjs` / `.map` under `dist/components` and `dist/utils`; `.d.ts` / `.d.cts` remain (the scratchpad tgz shows 265 + 265); `exports` is `.`, `./styles.css`, `./theme.css`; v5.3.0 `files` was `dist, skills, bin` with per-module tsup entries.
- **F7: VERIFIED.** No `Toggle` export (new.json); `ToggleVariant` types `ToggleSwitch` / `ToggleSwitchItem` (`Toggle.tsx:87,95,148`); the text now says those.
- **F8: VERIFIED.** old.json exports only `DropdownMenuSub`; new has `...SubTrigger`, `...SubContent`. The New in v6 list names only those two.
- **C1: VERIFIED.** Header (codemod.mjs:53) reads "A --spacing dry run that is not refused exits 0". Run: first `--spacing` dry exit 0; after `--spacing --write` a second dry run printed REFUSED, exit 3; `--spacing --write` again, exit 3.
- **U1: VERIFIED (narrowed).** The SKILL now says v5's range check let NaN through; v5.3.0 `ProgressIndicator.tsx:292` is `progress < 0 || progress > 1`, v6 :313 is `!(progress >= 0 && progress <= 1)`. The unverifiable "full ring" is gone from the SKILL. It is NOT gone from CHANGELOG.md:134 ("Before: NaN drew a full ring"), so the two docs now differ on this one claim.

Codemod run (all as documented): normal dry exit 1; `--write`, then manual fixes (`scratchpad/v6/manual-fixes.mjs src`), then dry exit 0; missing path exit 2 ("cannot read"); `.claude`, `.agents`, `.agent`, `.next`, `node_modules` copies of a v5-name file were never listed or rewritten; two paths in one call (`styles comps`) renamed `bg-brand` in `comps` using the CSS entry in `styles` (exit 1), while `comps` alone left it alone (exit 0, preset not found); the new CHECK BY EYE entries for `getByRole("slider"` and a labelled `<StarIcon aria-label=` fire, and the `aria-hidden` and unlabelled icons do not. `--spacing` over a theme with `--spacing-md: 20px` gives `--spacing-lg: 20px` with `p-lg`.

CHANGELOG vs SKILL (every item of the 47 appears in both; nothing in one list is absent from the other). Differences:
- The CHANGELOG states no counts; "47 / 23" is in the SKILL only. The CHANGELOG marks 16 items "(silent)" (plus SegmentedTabSelect "default: silent"); the SKILL's 23 also counts the 7 unmarked no-compile-error items above. The CHANGELOG intro says "Items marked silent raise no compile error", which is true but not the converse.
- `ds-focus-ring`: the CHANGELOG maps it to `ds-focus-ring-on-focus`; the SKILL says no class draws the ring always and gives CSS to keep it. v6 `dooph-component-tokens.css:182-204` has no always-on class, so the SKILL is the more accurate.
- ProgressIndicator NaN: see U1.

Lint: `npm run lint` exit 0 (`conventions: 30 checks passed`); `node scripts/sync-skills.mjs --check` exit 0 (9 skills x 2 mirrors).

Totals: 10 VERIFIED, 0 STILL FALSE.
