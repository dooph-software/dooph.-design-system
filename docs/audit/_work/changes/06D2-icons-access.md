# 06D2 — Icons and shapes: `IconSize` and element access

Wave D, section D2 (WI-065, WI-108 code part). Scratch: `docs/audit/_work/scratch/waveD/d2/`
and the rename script `docs/audit/_work/scratch/waveD/rename-iconsize.mjs`.

## Checklist
- [x] Read rules, briefs, WI-065 / WI-107 / WI-108
- [x] Scoreboard before → `scratch/waveD/d2/score-before.txt`
- [x] Before-render snapshot (current tree, not b436647: WI-076's `color` style has landed) + pre-edit copies in `d2/orig/`
- [x] WI-065 rename script (`scratch/waveD/rename-iconsize.mjs`, `--verify` → VERIFY OK)
- [x] WI-065 BaseIcon type shape + generator alias + regenerated barrel (`npm run generate-icon-exports`)
- [x] WI-108 BaseIcon forwardRef + rest props (+ header contract)
- [x] WI-108 BaseShape rest props (createShape already spreads; no edit)
- [x] After-render diff, access check, type probe, lint, scoreboard after

## Findings while scoping
- Every call site outside `src/components/Icons/` already imports `IconSize`
  from the `../Icons` barrel (the generator aliased it). So the rename touched
  NO other agent's files: only `BaseIcon.tsx`, `Icons.stories.tsx` and the
  generator (then the regenerated barrel).
- The 12 (now 13) shape leaves are `createShape(d, name)` one-liners (wave C),
  and `createShape` already spreads its props into `BaseShape`. WI-108 step 4's
  per-leaf `...rest` edits are not needed; `createShape.tsx` is unchanged.
- SidebarWithHoverIcon needed no edit (WI-108 step 5): it spreads `...iconProps`
  into BaseIcon, so `ref` and rest props ride through. Its header is unchanged.

---

### Icon size name is `IconSize` at source, and its type no longer widens to `string` [WI-065, F-023]
- **files:** `src/components/Icons/BaseIcon.tsx`, `src/components/Icons/Icons.stories.tsx`,
  `scripts/generate-icon-exports.mjs`, `src/components/Icons/index.ts` (generated, line 3 only).
- **what changed:** the const/type `IconSizes` is renamed `IconSize` in BaseIcon
  (the name the package already exported, via an alias). The type is now the
  union of the four `var(--ui-icon-*)` values; the open arm moved to the prop:
  `size?: IconSize | (string & {}) | number`. The generator emits
  `export { BaseIcon, IconSize } from "./BaseIcon";` with no alias. The JSDoc
  example now reads `size={IconSize.md}`. Done by one script
  (`rename-iconsize.mjs`, 1 + 7 + 12 anchored replacements with expected-count
  guards), then the type line was hand-edited.
- **consumer impact:** the exported `IconSize` value is unchanged; `size`
  accepts exactly what it did. The `IconSize` TYPE narrows from `string` to the
  four token literals, so code annotating an arbitrary string as `IconSize`
  stops type-checking. Editor hover now teaches the exported name.
- **breaking:** type-only. `yes — v6` if the release is cut as a major:
  `const x: IconSize = "<any string>"` → use `IconProps["size"]` or `string`.
  No runtime or rename change (`IconSizes` was never reachable from the package).
- **verified:** `node docs/audit/_work/scratch/waveD/rename-iconsize.mjs --verify`
  → VERIFY OK (0 `IconSizes` in src/scripts except the allow-listed three below).
  Type probe `d2/types/probe.tsx`: `const a: "x" = … as IconSize` and
  `const s: IconSize = "2rem"` now error; `{ size: "2rem" }`, `{ size: 20 }` compile.
- **left as is (not mine / not the identifier):**
  - `src/components/LoadingSpinner/spinnerGeometry.ts:36` comment "`Fonts`/`IconSizes`"
    → should read `IconSize` (WI-065 step 3). D3's folder; one-word comment edit owed.
  - `export const IconSizes: Story` in `Toggle/Toggle.stories.tsx:46` and
    `SegmentedTabSelect/SegmentedTabSelect.stories.tsx:46` are Storybook story
    names (they set the story id), not the const. They keep WI-065's literal
    `rg -n "IconSizes" src scripts → 0` done-when from holding; renaming them
    would change story URLs. Maintainer's call.
- **docs owed:** CHANGELOG `[Unreleased]` → Changed: "The `IconSize` type is now
  the union of its four values (was `string`); `size` still accepts any CSS
  length or number." If cut as a major, list it as type-only in the v6 inventory.

### Icons, shapes and SidebarWithHoverIcon forward `ref` and `<svg>` props [WI-108, F-039]
- **files:** `src/components/Icons/BaseIcon.tsx`, `src/components/Shapes/BaseShape.tsx`.
- **what changed:**
  - BaseIcon is `forwardRef<SVGSVGElement, IconProps>` with `displayName`.
    `IconProps` = own props + `Omit<SVGProps<SVGSVGElement>, own | "ref">` +
    `ref?: Ref<SVGSVGElement>` (declared because icon leaves are plain functions
    whose spread carries `ref` under React 19). The rest spread sits after the
    fixed attributes and before `ref`/`aria-hidden`/`className`/`style`; a
    consumer `style` merges last.
  - `aria-hidden` default: `true` unless the icon has `aria-label` or
    `aria-labelledby` (and no explicit `aria-hidden`).
  - `ShapeProps` now extends `Omit<IconProps, "size" | "strokeWidth" | "color" | "children">`
    (so `className`, `aria-*`, `id`, handlers, `style`, `ref`). BaseShape spreads
    `...rest` FIRST on `<BaseIcon>`, so its own size/stroke/fill still win.
  - BaseIcon gained a header contract (it now carries the spread-order and the
    non-widening `IconSize` invariants). BaseShape/createShape/SidebarWithHoverIcon
    headers: none needed / unchanged.
- **consumer impact:** additive. Every icon, every shape and
  SidebarWithHoverIcon accept `ref` and any `<svg>` attribute/handler; shapes
  accept `className`. A labelled icon is no longer `aria-hidden`. Markup with no
  new props is byte-identical.
- **breaking:** no.
- **verified:**
  - Markup: `d2/render.cjs` renders all 88 icons (3 prop sets each), BaseIcon,
    all 13 shapes (2 sets), BaseShape, SidebarWithHoverIcon (4 poses),
    ShapeButton (all shapes × variants), CTAButton (both sizes) — 308 lines.
    Before (pre-edit copies swapped into a copy of the current tree, so other
    agents' concurrent edits cancel out) vs after: **identical**.
  - Access: `node d2/access.cjs d2/out/after.cjs` → 14 PASS (W7c's four "06"
    checks, the aria-hidden rule, and a spy on BaseIcon's forwardRef render
    proving the consumer's `ref` arrives from CheckIcon, CloverShape,
    SidebarWithHoverIcon and BaseIcon). Against the before bundle: 11 FAIL.
  - Types: `tsc -p d2/types/tsconfig.json` → exit 0 (W7c probe lines 17-19
    equivalents compile; MorphRotationShape `shapes` still accepts shapes;
    span ref on an icon and `strokeWidth` on a shape are rejected). Against the
    before tree: 6 errors.
  - `npm run lint` → exit 0. Scoreboard: nothing went up from D2 (focus count
    3 → 0 between runs is D1's work).
  - Not done: a full `npm run build` in a scratch worktree (esbuild bundles of
    `src/index.ts` used instead, per the wave-D brief); Storybook visual check
    is the orchestrator's.
- **docs owed:**
  - codebase skill (icon section, ~SKILL.md:398): "`BaseIcon` forwards `ref` and
    every `<svg>` attribute; icon and shape leaves spread their props into it,
    so `ref`, `aria-*`, `id`, handlers and `style` (merged last) reach the
    `<svg>` of every icon, shape and `SidebarWithHoverIcon`. An icon with
    `aria-label` is not `aria-hidden`."
  - usage skill (~SKILL.md:191): "Icons and shapes take `ref` and any `<svg>`
    prop. Give a meaningful icon `aria-label` (plus `role="img"`) and it stops
    being `aria-hidden`."
  - CHANGELOG `[Unreleased]` Added: "Every icon, every shape and
    `SidebarWithHoverIcon` forward `ref` and `<svg>` props (`aria-*`, `id`,
    handlers, `style`); shapes accept `className`. A labelled icon is no longer
    `aria-hidden`."
  - The element-access RULE text (WI-107) stays with the docs pass.

## Files touched (all D2-lane)
- `src/components/Icons/BaseIcon.tsx`
- `src/components/Icons/Icons.stories.tsx`
- `src/components/Icons/index.ts` (regenerated)
- `src/components/Shapes/BaseShape.tsx`
- `scripts/generate-icon-exports.mjs`
- No other agent's files were touched.

## DONE
