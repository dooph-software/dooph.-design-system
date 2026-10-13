# Claims: AGENTS.md

One factual claim per line, with its evidence. A = `AGENTS.md` at the repo root (61 lines). Line numbers are for the working tree on 2026-10-11.

## Source of truth (A:1-3)
- A:3: the code and the skills (`.agents/skills/`, `skills/`) are the only source of truth about this repo. Evidence: constraints.md ("Re-derive every fact from code at HEAD"; the target doc set has AGENTS.md carry "the code and skills are the only truth"); `ls .agents/skills/ skills/`.
- A:3: `docs/future/` holds proposals, never instructions. Evidence: docs/future/ holds only responsive-type.md, whose line 3 reads "Not implemented. Not current behaviour" and calls itself a design note for a possible future version.
- A:3: nothing in `docs/audit/` is current guidance. Evidence: constraints.md (docs/audit holds working records and is deleted at the end of the pass; "Working files: docs/audit/_work/docs-pass/, deleted with docs/audit").

## File contracts (A:5-23)
- Verbatim copy of the maintainer's section. Evidence: `diff <(git show HEAD:AGENTS.md) <(sed -n 5,23p AGENTS.md)` prints nothing.

## Guardrails (A:25-37)
- A:25 `$name` = `.agents/skills/<name>/SKILL.md`. Evidence: `ls .agents/skills/*/SKILL.md` (one SKILL.md per skill directory).
- A:27 text always through a Text component, `as` for roots; never a bare element or font utility. Evidence: .agents/skills/dooph-ds-writing-components/SKILL.md:27 ("Text always goes through a Text component. A root that owns its text renders through one with `as`"; lint checks "typography utilities or inline font styles").
- A:28 the DS owns no data, fetching, timers or control; state arrives as props. Evidence: dooph-ds-writing-components/SKILL.md:8 ("The consuming app owns data, fetching, timers and control"), :20 ("State arrives as props").
- A:28 asked for a component that fetches or polls, build the presentational part and hand the app the polling code (task 11, 2026-10-11). Evidence: dooph-ds-writing-components/SKILL.md:11 (failure 1), references/recipes.md §8; green/SCORES-maint-1.md service-status-polling (the run read only AGENTS.md and stopped instead of building).
- A:29 `"use client"` only when the module itself needs it, never on `constants.ts` or a thin Radix wrapper. Evidence: dooph-ds-writing-components/SKILL.md:21.
- A:30 no hard-coded colour, spacing, radius, shadow or motion; every value from a token; every flourish on a practical component switches off under the practical preset. Evidence: .agents/skills/dooph-ds-styling/SKILL.md:8 ("Every visual value comes from a token ... every flourish on a practical component must be switchable off by `data-ds-expression=\"practical\"`"), plus its rules on colour/radius/shadow, spacing and motion.
- A:31 dark-only values are `.dark` token lines in tokens.css, nowhere else. Evidence: .agents/skills/dooph-ds-editing-tokens/SKILL.md:26 (rule 1).
- A:32 changing a token's value means listing its dependents and flagging, never rewording, every comment that states the old value (task 11, 2026-10-11). Evidence: dooph-ds-editing-tokens/SKILL.md rule 3 and recipes §3; dooph-ds-codebase-map/SKILL.md Rules ("After a value change…"); green/SCORES-maint-2.md button-height-40 (no skill loaded; the comment was reworded).
- A:33 a new component is one change: files, constants, exports, stories, lint. Evidence: .agents/skills/dooph-ds-adding-a-component/SKILL.md:8-12.
- A:34 where a file lives and whether it is generated. Evidence: .agents/skills/dooph-ds-codebase-map/SKILL.md:8-10 and its "Generated files: never hand-edit" table.
- A:35 spinner and progress geometry is plain numbers in TypeScript; every clock in CSS tokens. Evidence: .agents/skills/dooph-ds-loading-indicators/SKILL.md:8.
- A:36 a migration skill only when the maintainer asks, from a diff of built trees. Evidence: .agents/skills/dooph-ds-writing-version-migrations/SKILL.md:14-15 (rules 1-2).
- A:37 surface every design decision in the hand-back: open values, comment sums that no longer balance. Evidence: dooph-ds-writing-components/SKILL.md:8 ("report every design value you chose"), :42 (hand-back slots); dooph-ds-adding-a-component/SKILL.md:21, :95; dooph-ds-codebase-map/SKILL.md:46 ("Flag broken arithmetic in the hand-back; never quietly reword it").
- Each `$skill` name matches a directory in .agents/skills/ (`ls .agents/skills/`).

## Before you hand back (A:39-41)
- `npm run lint` = `tsc --noEmit`, then `scripts/check-conventions.mjs`. Evidence: package.json:61.
- The convention checks also fail on stale generated files. Evidence: scripts/check-conventions.mjs:679-713 (theme-fresh, icons-fresh, shape-morph-ease-fresh, docs-fresh, skills-mirrored; each runs its generator's `--check`).
- Type-checking alone is not passing. Evidence: dooph-ds-codebase-map/SKILL.md:59 ("REQUIRED before any hand-back: `npm run lint` exits 0"). Why the section exists: in the RED baseline none of 13 agents ran `npm run lint`, and four handed back claiming a clean result while lint was red (docs/audit/_work/docs-pass/baseline/SCORES.md, "Did the agent run `npm run lint`? No, in all 13 runs").

## Generated files (A:43-51)
- `index.css` `__GENERATED_THEME_*__` block, `theme.css`, `twMergeTheme.ts` from `npm run sync-tokens`. Evidence: package.json `sync-tokens` = `node scripts/sync-theme.mjs`; scripts/sync-theme.mjs:50-55 (paths), :76-77 (markers); marker at src/styles/index.css:89.
- `src/components/Icons/index.ts` from `npm run generate-icon-exports`. Evidence: scripts/generate-icon-exports.mjs:15-16, :67.
- tokens.css `__SHAPE_MORPH_EASE_*__` block from `npm run generate-shape-morph-ease`. Evidence: scripts/generate-shape-morph-ease.mjs:15-17, :40; marker at src/styles/tokens.css:330.
- components.md, token-contract.md, inventory.md and the client-references block from `node scripts/generate-docs.mjs`. Evidence: scripts/generate-docs.mjs:668-670 (block markers), :714-719 (OUTPUTS); markers at skills/dooph-design-system-setup/references/client-references.md:46, :77.
- `.claude/skills/`, `.agent/skills/` from `node scripts/sync-skills.mjs`. Evidence: scripts/sync-skills.mjs:6-7, :43.
- The set is complete: check-conventions.mjs runs `--check` on exactly these five generators (:679-713), and they write nothing else. `dist/` is build output and gitignored, so it is not listed.

## Skill mirrors (A:53-55)
- Edit only `.agents/skills/`; a sync overwrites mirror edits. Evidence: scripts/sync-skills.mjs:8-12 (copies every canonical file that is missing or different), :32-33 ("A mirror edit is overwritten on the next sync"); dooph-ds-codebase-map/SKILL.md:45.

## Never (A:57-61)
- A:59 no commit, push or tag unless the maintainer asks. Evidence: constraints.md ("Never commit, stage or push"; the maintainer commits).
- A:60 never change the `package.json` version or run `npm version` / `prep-release:*`; the maintainer cuts releases. Evidence: constraints.md ("Never bump package.json version. The maintainer commits and cuts v6"); dooph-ds-writing-version-migrations/SKILL.md:14 (never run `npm version`, `prep-release:*` or edit the version); dooph-ds-codebase-map/SKILL.md:44; package.json:51-53 (`prep-release:*` = `npm version <x> && npm run build && git push --follow-tags`).
- A:61 never run `npm run build`, `build:watch` or `prepublishOnly` in the main checkout: they rewrite tracked files and run no lint. Evidence: package.json:57-58, :62 (all three run the generators, none runs lint); dooph-ds-codebase-map/SKILL.md:43.
