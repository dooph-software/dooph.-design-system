# Claims: dooph-ds-writing-version-migrations

Every factual claim in `.agents/skills/dooph-ds-writing-version-migrations/SKILL.md` (S), `references/surface-diff.md` (D) and `references/migration-skill-shape.md` (M), with evidence. Line numbers are against the working tree on 2026-10-10. Statements that are rules the skill sets (what to do), not facts about the repo, are not listed unless they rest on a fact.

## SKILL.md

| # | Claim | Evidence |
|---|---|---|
| S1 | A migration skill is followed by a consuming project's agent after installing a new major | skills/dooph-design-system-v5-migration/SKILL.md:3 ("Use when upgrading a consuming project … after the new version is installed"); skills/dooph-design-system-v3-migration/SKILL.md:3 |
| S2 | Written right before the maintainer cuts a major, when the maintainer asks | docs/audit/doc-refresh.md:28-30 ("written right before the maintainer cuts v6 … The maintainer asks for it; nobody starts it early") |
| S3 | Minor/patch never get one (a change needing consumer action is a major) | CHANGELOG.md:6 (Semantic Versioning); doc-refresh.md:28-30 (skill tied to the major) |
| S4 | `npm version` / `prep-release:*` bump, tag and push | package.json:51-53 (`npm version <level> && npm run build && git push --follow-tags`) |
| S4a | `package.json` `version` is the release number the maintainer cuts | package.json:3 (`"version": "5.3.0"`), :51-53 (`npm version` bumps it) |
| S5 | The record is the CHANGELOG `[Unreleased]` section | CHANGELOG.md:10; .superpowers/sdd/docs-pass-plan/constraints.md:4 (CHANGELOG becomes the record the migration skill is written from) |
| S6 | `scripts/surface.mjs` extracts a built tree's surface (through `scripts/lib/surface.mjs`) and `scripts/surface-diff.mjs` diffs two | scripts/surface.mjs:1-20, 40; scripts/surface-diff.mjs:1-10; lib: scripts/lib/surface.mjs:122-141 (`createDistProgram` reads `<tree>/dist/index.d.ts`), :244, :288, :507, :538, :595, :761, :777, :804 |
| S7 | `npm run build` rewrites tracked files | package.json:57 (build runs generate-icon-exports, generate-shape-morph-ease, sync-tokens); scripts/generate-icon-exports.mjs:16,67 (writes src/components/Icons/index.ts); scripts/generate-shape-morph-ease.mjs:15,40 (writes src/styles/tokens.css); scripts/sync-theme.mjs:3-7 (writes index.css, theme.css, twMergeTheme.ts); all tracked (`git ls-files` lists them) |
| S8 | Over-claims: items called breaking that only changed things added after the last release | docs/audit/_work/docs-pass/gaps.md:209-236 (§3.2: Input icon variants, number Input, `iconSm`, 12 motion tokens, `stickerVariants`, AIThinkingEffortSelector never released) |
| S9 | Under-claims: breaks the record omits or calls minor | gaps.md:165-191 (§3.1, U1–U12), :193-198 (SegmentedTabItem named elsewhere) |
| S10 | A props type that became a union breaks `interface X extends ButtonProps`; an intersection does not | gaps.md:181 (U2: `extends ButtonProps` passes at v5.3.0, fails at HEAD), :204-205 (`IconProps` intersection still extends); docs/audit/_work/scratch/surface-probe-extends.ts:6, :27; .superpowers/sdd/docs-pass-plan/task-1-report.md:97-100 |
| S11 | Breaks the diff cannot see: throws, ARIA roles, defaults, layout, values behind unchanged class names | gaps.md:187-191 (U8 NaN throw, U9 role, U10 aria-label, U11 cn, U12 px layout), :239-242 (class names only diffed; `.ds-pl-ui-md` value changed); task-1-report.md:69 (SegmentedTabSelect default found by reading the commit) |
| S12 | `init-skills` copies all of `skills/` and never deletes | bin/init.mjs:29 (`PKG_SKILLS = ../skills`), :113, :155 (`cp(PKG_SKILLS, dest, { recursive: true, force: true })` — a merge; no removal anywhere in the file) |
| S13 | Older migration skills ship in the new package | package.json:44 (`files` includes `skills`) |
| S14 | The checker collapses `DsColor` to `string`; renames show in `DS_COLOR_TOKENS` keys; an old name still compiles | scripts/lib/surface.mjs:24-27; src/utils/color.ts:43, :47 (`DsColorToken \| (string & {})`), :59-60 (unknown name passed through) |
| S15 | Generated utilities are not consumer surface (a class no `src/` file writes is a leak); hand-written utility classes in `src/styles/` (`h-button` …) are consumer surface | src/styles/theme.css:6-17 (consumers running their own Tailwind get utilities from the preset); scripts/emit-css.mjs:22; src/styles/index.css:1-3; src/styles/index.css:358-432 (`@layer utilities` with `.h-button`, `.size-avatar`, `.min-w-menu` …); skills/dooph-design-system-usage/SKILL.md:211 (consumer told to add `h-button`) |
| S16 | A class no `src/` file writes means the Tailwind source scope leaked | src/styles/index.css:1-3 (`source(none)` + `@source "../**/*.{js,ts,jsx,tsx}"`); gaps.md:56-94 (§1.1: 187 harvested lines from docs when `source(...)` was absent) |
| S17 | Token overrides and colour strings fail silently | color.ts:59-60; v5 SKILL.md:13-15 (two of three fail silently: no build error); v3 SKILL.md:24-28 (utilities never generate without the preset — no error) |
| S18 | `npm run lint` is the verify command | package.json:61 |
| S19 | Worktrees removed with `git worktree remove --force` | task-1-report.md:23, :83 (procedure used) |
| S20 | dooph-ds-codebase-map covers the build and Tailwind source scope; dooph-ds-editing-tokens covers token → theme-key mapping | .superpowers/sdd/docs-pass-plan/task-5-brief.md:43, :45 (scope table) |

## references/surface-diff.md

| # | Claim | Evidence |
|---|---|---|
| D1 | `git tag` lists the release tags | `git tag` → v3.4.0 … v5.3.0 |
| D2 | Build steps rewrite tracked files (icon exports, shape-morph ease, sync-tokens) | as S7 |
| D3 | A tree whose Tailwind import lacks `source(none)` scans every file under it, so a nested tree leaks | task-1-report.md:83 (b436647 export placed after the v5.3.0 build "That ordering matters because Tailwind's automatic source detection would otherwise scan the export"); gaps.md:67-75 |
| D3a | Copy every modified or untracked file that will ship (`git status`) into the candidate tree | rule; the brief's copy list (task-1-brief.md Step 1) named only src/, scripts/, package.json, which misses e.g. skills/ (shipped: package.json:44) |
| D4 | A build is good if it exits 0 and holds dist/index.d.ts, styles.css, theme.css | package.json:22,26,27 (exports name these files); tsup.config.ts:63-66 + scripts/emit-css.mjs:22-23 (CSS emitted on every build); surface.mjs:123-141 (requires dist/index.d.ts, throws `missing` at :94) |
| D5 | `loadTs` prefers the tree's own TypeScript | surface.mjs:41-49 |
| D6 | `createDistProgram` reads `<tree>/dist/index.d.ts` | surface.mjs:123-141 |
| D7 | Pass 1 → `probeSpecs` → pass 2 with probe → `readProbe` returns `{ probeTypes, probeTypeAliases }` | surface.mjs:165-185, :187-198; scripts/surface.mjs:46-52 (the driver) |
| D8 | `scripts/surface.mjs` writes exports, components, consts, types, functions, tokens (by block, with its layer), themeVars, classes (ds, textStyle, utilities) and pkg, reading the tree's dist/index.d.ts, src/styles/tokens.css, dist/theme.css, dist/styles.css and package.json | scripts/surface.mjs:43-78 (extractSurface), :63-69 (per-export calls), :72-76 (files read); lib surface.mjs:244-279, :288, :507, :595, :538 |
| D8a | Run from the main checkout, once per tree (`node scripts/surface.mjs ../ds-old old.json`); every map sorted by key, same tree gives same bytes | scripts/surface.mjs:70 (`sortObj` on the five maps), :80-92 (CLI: `<treeDir> <out.json>`); lib surface.mjs:28-29; verified 2026-10-10: run on a built scratch worktree it wrote 456 exports / 252 components, byte-identical to the scratch driver it replaces |
| D9 | Tokens from `<tree>/src/styles/tokens.css` by block with layer; theme vars via prefix `--`; classes split ds / textStyle / utilities; package fields | surface.mjs:749-775, :777-803, :804-820; scripts/surface.mjs:72-76 |
| D10 | Sort every map; same tree gives same bytes; don't change an existing function's output, add a new one or opt-in parameter | surface.mjs:28-34 |
| D11 | generate-docs.mjs shares the lib | surface.mjs:2-3; scripts/generate-docs.mjs:15-17 |
| D12 | The probe resolves `ComponentProps<typeof X>` at a generic component's defaults; without it inherited DOM props vanish | surface.mjs:88-90, :160-164 |
| D13 | Diff sections and comparisons (exports kind/deprecated; props added/removed/still-inherited, type + expanded union, optional, deprecated, inherited-from, ref type, generic; consts; types expansion/generics/declaredAs/members; functions; tokens per block + layer; theme vars; three class groups; package fields) | surface.mjs:369-377 (props output: generic, refType, props {type, expanded, optional, deprecated}, inheritedFrom, inherited); :586-592 (types: declaredAs, generics, members); :749-759 (layer recorded separately); scripts/surface-diff.mjs:85-101, :104-161, :164-181, :184-213, :215-225, :228-242, :245-252, :255-275 |
| D14 | Blocks: `light` = `:root, .light`, `dark` = `.dark`, others by selector | surface.mjs:749-755 |
| D15 | A change repeated identically across four or more components of a folder comes out as one line (every icon gaining `ref`) | scripts/surface-diff.mjs:64-82, :307 ("four or more components of one module is one line"); task-1-report.md:12 (88 icons gaining `ref`) |
| D16 | "Declared in a different folder": package-root import unchanged | scripts/surface-diff.mjs:96; gaps.md:153-156 |
| D17 | Removed prop may still be accepted as inherited (VerificationCodeInput `aria-label`) | gaps.md:200-204; task-1-report.md:101 |
| D18 | Ref retype breaks callback refs typed to the old element; `RefObject` may still compile | gaps.md:206-207 (CTAButton) |
| D19 | `DS_COLOR_TOKENS` key removal is silent | color.ts:47, :59-60 |
| D20 | Token removed → consumer override no longer read (silent) | v5 SKILL.md:3 ("theme overrides … that stopped having any effect") |
| D21 | Token block cascade layer change → precedence changes | gaps.md:186 (U7: tokens moved into `@layer ds.tokens`; unlayered override now always wins) |
| D22 | Theme var removed → consumer utility stops generating, silently | src/styles/theme.css:13-15; v3 SKILL.md:24-28 |
| D23 | Generated utilities are the classes components use internally; consumers running their own Tailwind get utilities from theme.css | src/styles/theme.css:6-17; src/styles/index.css:1-3; scripts/emit-css.mjs:22 |
| D23a | Hand-written utility classes in `src/styles/index.css` `@layer utilities` (`h-button`, `size-avatar`, `min-w-menu` …) ship in styles.css, have no theme line, and consumers use them | src/styles/index.css:358-432; scripts/emit-css.mjs:22 + src/styles/build.css:6 (index.css compiled into dist/styles.css through build.css); skills/dooph-design-system-usage/SKILL.md:211 |
| D23b | `extractClasses` files them under `utilities` (anything not `ds-*` / `text-style-*`) | scripts/lib/surface.mjs:799-803 |
| D23c | A native ESM import of a removed export throws at load; CJS and some bundlers give `undefined` | package.json:20-25 (`import` → dist/index.js ESM, `require` → dist/index.cjs); Node ESM link-time "does not provide an export named" SyntaxError (language behaviour) |
| D24 | `exports`/`files`/`bin` removal or narrower peer range breaks install or import | package.json:17-19, :20-28, :35-47, :64-67 (the fields consumers resolve) |
| D25 | "Pre/post" split via a third tree | scratch/surface-reconcile.mjs:4-10, :21-27; gaps.md:13-22 |
| D26 | `git show vX.Y.Z:<path>` reads OLD's source | standard git; used in gaps.md:222 judgement ("Input had no `variant` in v5.3.0") |
| D27 | A props type that `extends` another inherits its break (SegmentedTabItem) | gaps.md:193-198 |
| D28 | Probe tsconfig options match `createDistProgram` (strict, react-jsx, bundler, esnext, es2022, skipLibCheck, noEmit, `types: []`) | surface.mjs:124-133 |
| D29 | `node node_modules/typescript/bin/tsc -p __probe__/tsconfig.json`, probes import `../dist/index.js` | task-1-report.md:97; scratch/surface-probe-extends.ts:2; scratch/surface-probe-usage.tsx:9 |
| D30 | `extends` probe shape; some fail already at OLD | scratch/surface-probe-extends.ts:3-72; task-1-report.md:98 (four already failing at v5.3.0) |
| D31 | Usage probe examples (whole-union variant × size, removed value, RefObject, callback ref, default presets to mutable array) | scratch/surface-probe-usage.tsx:23, :25-26, :30; gaps.md:181-183, :206-207 |
| D32 | Merged-symbol reading: DsColor prints `string`, a props union reads as one arm | surface.mjs:24-27; task-1-report.md:64 (bug (a)), :87-90 |
| D33 | The lib reads member types from each declaration's type node | surface.mjs:339-347, :568-569 |
| D34 | Tailwind import keeps `source(none)` + explicit `@source` | src/styles/index.css:1-3 |
| D35 | Allow sub-candidates of a longer token | gaps.md:58-66 (9 sub-candidates) |
| D35a | In OLD (released), leaked lines are not consumer surface; in NEW fix the scope | src/styles/index.css:1-3 (NEW has `source(none)`); gaps.md:56-94 (leak lines were not breaking: "match no element the package renders") |
| D36 | A story-only utility is not consumer surface: a tree whose emit-css compiles build.css leaves it out; an older tree compiled index.css, whose scan included stories | src/styles/build.css:6-7; scripts/emit-css.mjs:22; `git show 0dac153:scripts/emit-css.mjs` (HEAD) compiles `src/styles/index.css`; src/styles/index.css:2-3; gaps.md:96-101 |
| D36a | `node scripts/surface-diff.mjs old.json new.json diff.md diff.json`; diff.json keeps each line's JSON paths; `getPath()` is exported | scripts/surface-diff.mjs:1-10, :34-42 (`export function getPath`), :294-317 (CLI, writes the optional out.json) |
| D37 | Class names only diffed; a `ds-*` helper keeps its name and changes value | scripts/surface-diff.mjs:245-252; gaps.md:239-242 |
| D38 | Defaults are not in `dist`; components.md lists defaults from source | scripts/generate-docs.mjs:3-4, :16-23; surface.mjs:15-17 (`extractDefaults` source programs only) |
| D38a | Mechanical defaults route: `createSourceProgram(ts, tree)`, `extractExports(…, <tree>/src)`, `extractDefaults(ts, findRenderFunction(…))`; cva `defaultVariants` not covered by these two | surface.mjs:145-159 (createSourceProgram reads src/index.ts + tree tsconfig), :244 (moduleBase param), :441-481, :483-504; scripts/generate-docs.mjs:231-235, :282-283 (same calls), :187-192 (cva defaults handled separately in generate-docs) ; `git show v5.3.0:tsconfig.json` exists |
| D39 | components.md path | generate-docs.mjs:4 |
| D40 | Behaviour examples (throw, ARIA role, `cn` merge output, rem → px) | gaps.md:187-191; src/utils/cn.ts:3, :50-52 (`extendTailwindMerge` config) |
| D41 | `git worktree remove --force` then `git worktree list` | task-1-report.md:23, :83 |

## references/migration-skill-shape.md

| # | Claim | Evidence |
|---|---|---|
| M1 | v3 skill is a SKILL.md only; v5 has SKILL.md + codemod.mjs | `ls skills/dooph-design-system-v3-migration` → SKILL.md; `ls …-v5-migration` → SKILL.md, codemod.mjs |
| M2 | `files` includes `skills` | package.json:44 |
| M3 | init-skills copies the whole `skills/` folder into `.agents/skills`, `.claude/skills`, `.agent/skills`; merges, never deletes | bin/init.mjs:29, :80-96, :113, :151-157 |
| M4 | Consumer runs the codemod from node_modules path | v5 SKILL.md:26-28 |
| M5 | Shipped skills are not mirrored by the skill-mirror sync | scripts/sync-skills.mjs:5-7 (canonical `.agents/skills`, mirrors `.claude/skills`, `.agent/skills` only) |
| M6 | `npx @dooph-software/design-system init-skills` command | bin/init.mjs:6-7; package.json:17-19 |
| M7 | Frontmatter: name, description (version pair, after install, symptoms, expiry), `metadata.short-description` | v5 SKILL.md:1-6; v3 SKILL.md:1-6 |
| M8 | Opening: count of breaks, which fail silently, run the codemod even if it compiles | v5 SKILL.md:10-15 |
| M9 | Forward note slot | v5 SKILL.md:17-22; v3 SKILL.md:125-132 |
| M10 | Prerequisites slot (`theme.css` preset import) | v3 SKILL.md:22-51 |
| M11 | Codemod-first slot: command, dry-run default, `--write` | v5 SKILL.md:24-31 |
| M12 | Steps ordered token overrides → utility classes → component API, tables before → after (→ why) | v3 SKILL.md:78, :134, :156; v5 SKILL.md:35-38 (v4 \| v5 \| Why) |
| M13 | Visual-changes slot | v3 SKILL.md:200-216 |
| M14 | New-in-vN slot; link usage skill by name | v3 SKILL.md:218-226; v5 SKILL.md:93-98 |
| M15 | Verify: codemod, `npx tsc --noEmit`, `-P` grep + fallback, browser look; zero hits + clean build = done | v5 SKILL.md:79-91; v3 SKILL.md:228-255 |
| M16 | A token removed with no replacement: say what now produces the look, delete the line | v3 SKILL.md:102-111 |
| M17 | `dist/theme.css` lines are `--<key>: var(--ui-…)`; aliases rename keys (`--ui-color-primary-foreground` → `--color-primary-fg`) | src/styles/theme.css:21, :27 (copied to dist by scripts/emit-css.mjs:23); scripts/sync-theme.mjs:84 (ALIASES), :259-293 |
| M18 | Namespaces: `--color-*`, `--spacing-*`, `--radius-*`, `--shadow-*`, `--text-*`, `--font-*` | sync-theme.mjs:266-291; theme.css:21, :94, :101, :111, :112, :133 |
| M19 | A token with no theme line gets no generated utility; hand-written `@layer utilities` classes in index.css may still use it, and consumers use those directly | sync-theme.mjs:261 (EXCLUDED → null), :293 (no rule → skipped); src/styles/index.css:358-432; skills/dooph-design-system-usage/SKILL.md:211 |
| M20 | Old `color` string still compiles | color.ts:47, :59-60 |
| M21 | Prefix trap example `--ui-color-border` vs `--ui-color-border-primary`; lookahead `(?![-\w])`; `rg -P` | v3 SKILL.md:96, :149-154, :240-252 |
| M22 | Grepping a still-current name makes the done-check unreachable | v3 SKILL.md:115 (`--ui-color-surface-page` listed unchanged) vs :237 (done-check greps `surface-page`) |
| M23 | Same name, new value → visual changes | v3 SKILL.md:214-216 |
| M24 | Const-key rename (`ButtonVariant.old`), string form `variant="old"` | v3 SKILL.md:161-163; v5 codemod.mjs:39-42 (AUTO renames identifiers only) |
| M25 | Props type became a union → `type X = Props & {…}` | gaps.md:135 (B12), :181 (U2) |
| M26 | Union forbids combinations → narrow with `Exclude<…>` | gaps.md:181 (U2b) |
| M27 | Default changed → pass the old value explicitly | gaps.md:133 (B10 "pass the old look explicitly") |
| M28 | Meaning changed → never AUTO (no mapping) | v3 SKILL.md:189-195 |
| M29 | Codemod shape: zero deps (`node:` imports), why-header, dry-run default, `--write`, extension allowlist, skip list, identifier boundaries, doc-comment lines skipped | v5 codemod.mjs:2-20, :21-22, :24-26, :28-32, :81-82, :92-93 |
| M30 | A codemod that always exits 0 passes "must exit 0" before any work | v5 codemod.mjs:141-144 (`process.exit(0)` even with pending renames) vs v5 SKILL.md:30-31 ("works as a CI gate"), :82 |
| M31 | A swallowed read error makes a missing path look like a clean app | v5 codemod.mjs:51-57 (`catch { return out; }`) |
| M32 | Older skills' codemods run against the new install | v5 SKILL.md:27 (path under the installed package) |
| M33 | Version numbers must exist in `git tag` | `git tag` (latest v5.3.0); v5 SKILL.md:17, :49 and v3 SKILL.md:125 name a 5.4 that no tag has (see report) |
| M34 | Re-verify an older codemod's exit code | v5 codemod.mjs:141-144 (exit code is part of its shipped behaviour; SKILL.md:82 relies on it) |
