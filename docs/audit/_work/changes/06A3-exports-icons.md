# 06A3 — Vestigial default exports, drifted shape SVG copies, BaseIcon colour (brief 06 wave A, agent A3)

## Progress (write-to-disk-first)
- [x] 0. Read rules, brief A3, WI-001 / WI-025 / WI-076; baseline scoreboard (default exports = 74)
- [x] 1. WI-001 default-export removal by script (`docs/audit/_work/scratch/waveA/remove-default-exports.mjs`)
- [x] 2. WI-025 delete the drifted `Shapes/svgs/` copies (kept the maintainer's new `eightleafclover.svg`)
- [x] 3. WI-076 BaseIcon `color` → CSS `color`; dropped HeartFill / StopFilled re-wiring; Icon Colors story
- [x] 4. lint + scoreboard after; icon barrel regenerated (byte-identical)

---

### Icon leaves, BaseShape and SidebarWithHoverIcon export by name only [WI-001, F-075]
- files (88, all by one script — `docs/audit/_work/scratch/waveA/remove-default-exports.mjs`, dry run / `--write` / `--verify`):
  - 74 lose their `export default <Name>;` line (and the blank line before it): 72 `src/components/Icons/*Icon.tsx` leaves, `src/components/Shapes/BaseShape.tsx`, `src/components/SidebarWithHoverIcon/SidebarWithHoverIcon.tsx`.
  - `src/components/Icons/FiltersSlidersIcon.tsx`: also drops `import ArrowUpLeftIcon from "./ArrowUpLeftIcon";`, which only fed its wrong default (the default export was `ArrowUpLeftIcon`).
  - Default imports → named: `src/components/Menu/DropdownMenu.tsx` (that one import line only; the script aborts if any other line in the file would change), `src/components/Icons/Icons.stories.tsx`, and line 1 of 12 shape leaves (`Arrow, Capsule, Clover, Cookie, Diamond, Double, EightLeafClover, Pixircle, Puff, Squircle, Star, Triple`Shape.tsx): `import BaseShape, { … }` → `import { BaseShape, … }`.
  - `EightLeafCloverShape.tsx` is the maintainer's new, still-untracked file; it had the same default import, so it got the same one-line switch (lint would fail otherwise).
- what changed: one export convention for these files — named only. The script has a lane guard (aborts if it would touch anything outside Icons/, Shapes/, SidebarWithHoverIcon/, DropdownMenu.tsx's import line).
- consumer impact: none. The package `exports` map only exposes "." and the barrels re-export named bindings, so the defaults were unreachable.
- breaking: no.
- verified:
  - script `--verify`: no `export default` in any non-story module under src/, no relative default import left; story files keep their 46 `export default meta` lines (unchanged).
  - `npm run generate-icon-exports` → `src/components/Icons/index.ts` byte-identical (88 icon exports); generator needed no change.
  - `npm run lint` exit 0. Scoreboard "Vestigial default exports" 74 → 0.
- docs owed: contribution SKILL.md `*Icon.tsx` row: "Keep filename and const in sync; named export only (no `export default`)".

### Drifted `Shapes/svgs/` copies deleted; new eightleafclover.svg kept [WI-025, F-108]
- files: deleted `src/components/Shapes/svgs/{arrow,capsule,clover,cookie,diamond,double,pentagon,pixircle,puff,squircle,triple}.svg` (plain `rm`, unstaged — 11 tracked files). No `*Shape.tsx` touched.
- KEPT: `src/components/Shapes/svgs/eightleafclover.svg` — the maintainer's new, untracked export (its path matches `EIGHT_LEAF_CLOVER_SHAPE_PATH`). Per the brief it stays; so the folder still exists with that one file. Nothing in src/, scripts/, Storybook config or package.json references `svgs` (only the codebase skill line, and the audit scratch `U10/verify-shape-svgs.mjs`).
- baseline drift confirmed before deleting: Pentagon and Puff svgs differed from their constants, Star had no svg, the rest matched.
- consumer impact: none (folder never shipped; `files` = dist, skills, bin).
- breaking: no.
- verified: lint exit 0; `grep -rn svgs src scripts` → nothing.
- docs owed: codebase SKILL.md line 140 — replace the "lifted verbatim from the Figma export kept alongside in `Shapes/svgs/`" clause with the WI-025 wording naming the `*_SHAPE_PATH` constants as canonical. Maintainer decision owed: whether `eightleafclover.svg` should also go (WI-025 intent) once the new shape is committed — the constant is canonical either way.

### Icon `color` now sets CSS `color`, so filled parts follow it [WI-076, F-063]
- files: `src/components/Icons/BaseIcon.tsx` (style gains `color: color ?? undefined`; `stroke` is now `strokeColor ?? "currentColor"`), `HeartFillIcon.tsx` and `StopFilledIcon.tsx` (no longer destructure `color`; fill is plain `currentColor`; StopFilled comment rewritten), `Icons.stories.tsx` (Icon Colors story adds HeartFill, StopFilled and a 0.5-stroke Tag in prominent colour).
- what changed: `color` reaches every `currentColor` paint in the icon, not just the stroke. `strokeColor` still wins for the stroke. Without `color`, nothing changes (no inline `color`, inheritance as before).
- consumer impact: `TagIcon`'s centre dot now follows `color` (visible below stroke-width 1); any consumer icon built on BaseIcon with `currentColor` fills now follows `color` too — a bug fix. HeartFill / StopFilled render the same colours as before.
- breaking: no (patch-level fix).
- verified (esbuild render of HEAD vs working tree, `docs/audit/_work/scratch/waveA/a3-render/{head,work}.txt`): `TagIcon color=red` svg style now has `color:red;stroke:currentColor` (HEAD: `stroke:red`, no `color`); HeartFill/StopFilled resolve to the same red; `StopFilled color=red strokeColor=blue` keeps the blue stroke; `SquircleShape size=24` markup byte-identical to HEAD (shapes unaffected). `grep "fill={color" src/components/Icons` → none. Lint exit 0.
- docs owed: CHANGELOG `[Unreleased]` → Fixed: "`color` on any icon now sets CSS `color`, so filled parts drawn with `currentColor` (e.g. `TagIcon`'s dot) follow it."

### Scoreboard
- Vestigial default exports 74 → 0 (this change).
- Moved by other agents' in-flight Toast work, not A3: motion literals 0 → 1 (Toast/Toast.tsx), JS timers 6 → 5.

## DONE
