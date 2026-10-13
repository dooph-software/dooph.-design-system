# Claims: dooph-design-system-v5-migration

Skill: `skills/dooph-design-system-v5-migration/SKILL.md` and `codemod.mjs` as they stood at HEAD (commit 0dac153) before this pass. One atomic claim per line, with verdict and evidence.

**Baseline.** OLD = `v4.8.2` (last v4 tag). NEW = `v5.0.0` and the v5 line up to `v5.3.0` (the latest release), because the skill says "v4.x to v5.x" and was first shipped in `v5.1.0` (commit 66a8ba1), the release that made the icon renames. Where a claim only became true in a v5 minor, the evidence says which.

Method: `git show <tag>:<path>`, read-only. Token and theme-key lists from `src/styles/tokens.css` / `theme.css`; exports by following `src/index.ts`; option-const keys from `export const X = {…}`; icon geometry by hashing each icon's path attributes.

**What "5.4" is.** No 5.4 tag exists (`git tag`: the last release is v5.3.0). Every "5.4" sentence was added by commit 8a946e5, which is after v5.3.0 and in no tag (`git tag --contains 8a946e5` is empty). It describes the unreleased v6 work at HEAD: the danger family reinstated under its v4 names with new alias defaults, and the renames `--ui-color-brand*` → `--ui-color-prominent*`, `--ui-color-error*` → `--ui-color-danger*`, `--ui-color-page-background` → `--ui-color-surface-page`, `--ui-radius-standard` → `--ui-radius-normal`, `--ui-color-border-focus` / `--ui-color-trigger-border-*` → `--ui-color-input-border-*`, `ButtonVariant.brand` → `.prominent`. At v5.3.0 none of the target names exists (`--ui-color-danger`, `--ui-color-danger-primary`, `--ui-prominent-color`, `--ui-color-surface-page`, `--ui-radius-normal`, `--ui-color-input-border-danger-focus`: all 0 definitions). Those claims were removed and replaced by the forward note "Upgrading beyond v5: see the v6 migration skill when it ships."

## Counts

TRUE 28 · FALSE 19 · UNVERIFIABLE 1 (48 claims). Every FALSE claim was fixed: the "5.4" ones by restoring the text that shipped in v5.1.0–v5.3.0 (re-verified below), the rest by the edits named.

## Frontmatter and opening

- TRUE — Symptom: a red danger button that no longer looks red. Evidence: v4.8.2 Button danger `bg-danger text-danger-fg border-danger-border`; v5.0.0 Button.tsx:61-65 `bg-secondary text-error-primary border-secondary-border`.
- TRUE — Symptom: a bar-chart icon that changed shape on its own. Evidence: v5.1.0 `BarChartIcon` paths differ from v4.8.2's (below).
- TRUE — Symptom: `SiloIcon` failing to resolve. Evidence: exported at v4.8.2 and v5.0.0, not at v5.1.0–v5.3.0.
- TRUE — Symptom: overrides on `--ui-color-danger-*` stopped having any effect. Evidence: all nine removed at v5.0.0, absent through v5.3.0.
- FALSE — "No longer applies once the codemod exits 0." HEAD codemod.mjs:144 is `process.exit(0)`, so it always holds. **Fixed:** the codemod now exits non-zero while work is pending; the description adds "and tsc passes" (for the pentagon item below, which the codemod does not scan).
- FALSE — "Three breaking changes." v5.0.0 also removed `ShapeButtons.pentagon` (const keys v4.8.2 `arrow,clover,cookie,gem,pentagon,puff,star` → v5.0.0 `arrow,clover,cookie,gem,puff,star`; ShapeButton.tsx:61 "Pentagon remains in `Shapes/` but is not offered on ShapeButton"; `shape?: ShapeButtons`, so both the const and the string form are compile errors). **Fixed:** "Four breaking changes", a new step 3, and "Two of the four fail silently".
- TRUE — Two are renames the codemod applies. Evidence: codemod `RENAMES`.
- TRUE — One is a redesign the codemod refuses to guess at. Evidence: codemod REPORT for the danger palette.
- TRUE — Two fail silently (the danger palette, `BarChartIcon`). Evidence: both compile at v5; `SiloIcon` and the pentagon do not.
- FALSE — Forward note "Coming from v4 and landing on 5.4 or later … the 5.4 token renames". No 5.4 release; the renames are unreleased (top). **Removed;** forward note added.

## Run the codemod first

- TRUE — The command path `node_modules/@dooph-software/design-system/skills/dooph-design-system-v5-migration/codemod.mjs`. Evidence: package.json `files` includes `skills` at v5.0.0–v5.3.0; codemod present from v5.1.0.
- TRUE — Dry run by default; `--write` applies the renames. Evidence: codemod `WRITE = args.includes("--write")`; fixture test.
- FALSE — "It works as a CI gate." HEAD codemod.mjs:144 always exits 0, and `walk()` returns `[]` on any `readdirSync` error, so a missing path also exits 0. Fixture test: the HEAD codemod exits 0 on the full fixture and on a missing path. **Fixed in the codemod** (exit 1 / 2 / 0, per writing-version-migrations, migration-skill-shape.md §4); the sentence now states the codes.
- FALSE — "The danger-palette list it prints is advisory." In v5.x the nine tokens and their classes do not exist, so every hit is a silent break. **Fixed:** restored the shipped wording; REPORT items fail the run.

## Step 1: icon renames

- TRUE — `SiloIcon` → `DiscPlatterDBIcon`, identical glyph. Evidence: path-attribute hash `8518867a` for v4.8.2 `SiloIcon` and v5.1.0/v5.3.0 `DiscPlatterDBIcon`.
- TRUE — v5 reused `BarChartIcon` for a different icon; `BarChartAxesIcon` is the v4 glyph. Evidence: v4.8.2 `BarChartIcon` and v5.1.0/v5.3.0 `BarChartAxesIcon` hash `5cf4db86`; v5.1.0 `BarChartIcon` hash `16f7f333`.
- TRUE — The new `BarChartIcon` is axis-less; the old one has axes. Evidence: v5.1.0 BarChartIcon paths are three bars (`M5 21v-6`, `M12 21V3`, `M19 21V9`); BarChartAxesIcon adds the axis path `M3 3v16a2 2 0 0 0 2 2h16`.
- TRUE — The codemod points `BarChartIcon` at `BarChartAxesIcon`. Evidence: `RENAMES`; fixture test.

## Step 2: the danger palette (HEAD text)

- FALSE — "5.4 brought the entire family back under the same v4 names." No 5.4; no `--ui-color-danger*` token at v5.0.0–v5.3.0. **Removed.**
- TRUE — v5 deleted all nine `--ui-color-danger*` tokens. Evidence: token diff v4.8.2 → v5.0.0.
- FALSE — "The codemod … no longer fails the run." In v5 it must fail while danger usage remains (writing-version-migrations rule 7). **Removed.**
- TRUE — `ButtonVariant.danger` was redesigned: v4 solid red; v5 a secondary surface with coloured text that fills on hover and active. Evidence: Button danger classes at v4.8.2 vs v5.0.0 (unchanged at v5.3.0).
- FALSE — "Today it is … danger-coloured text". In v5 the text and fills come from `--ui-color-error-primary` / `-secondary` (v5.0.0 Button.tsx:62-64). **Fixed:** the shipped "error-coloured" wording.
- FALSE — "The tokens survived that change in name only." They were removed in v5. **Removed.**
- FALSE — The "Default in 5.4" alias table (danger → secondary family, danger-hover → danger-secondary, danger-active/-foreground → danger-primary, danger-foreground-active → secondary-foreground). None of these tokens exists in a release. **Removed.**
- FALSE — "A v4 override still applies." In v5 it is silently ignored. **Removed.**
- FALSE — "Override the two raw paints `--ui-color-danger-primary`, `--ui-color-danger-secondary`." In v5 they are `--ui-color-error-primary` / `-secondary`. **Fixed:** the shipped retune table.
- FALSE — "The full utility set is back: `bg-danger`, `text-danger-fg`, … `bg-danger-primary`." v5.0.0–v5.3.0 theme keys have no `--color-danger*`. **Removed.**

## Step 2: the danger palette (the shipped text, restored and re-verified)

- TRUE — The nine tokens are gone along with `bg-danger`, `text-danger-fg`, `border-danger-border` and the `-hover` / `-active` / `-disabled` variants. Evidence: theme keys `--color-danger`, `-fg`, `-border`, `-hover`, `-active`, `-disabled`, `-border-*` removed v4.8.2 → v5.0.0.
- TRUE — Both failure modes are silent (an override of a missing token; a class with no rule).
- TRUE — `ButtonVariant.danger` still exists. Evidence: const key at v5.0.0–v5.3.0.
- TRUE — `--ui-color-error-primary` is the resting text and active fill; `--ui-color-error-secondary` the hover fill; `--ui-color-secondary*` the surface and border. Evidence: v5.0.0 Button.tsx:62-65.
- TRUE — Nearest utilities `bg-error-primary`, `text-error-primary`, `border-error-primary`. Evidence: v5.0.0 theme key `--color-error-primary`.
- TRUE — No equivalent for `*-danger-fg`, `*-danger-disabled`, the `*-danger-border-*` trio. Evidence: v5.0.0 adds only `--ui-color-error-primary` / `-secondary`.

## Verify

- FALSE — "codemod must exit 0" as the done-check. With the HEAD codemod it always does, so the check passes before any work is done. **Fixed in the codemod.**
- TRUE — `npx tsc --noEmit` must pass. It catches `SiloIcon` and the pentagon.
- FALSE — "On 5.4+ the codemod exits 0 once the icon renames are applied." No 5.4; and the HEAD codemod exits 0 even with renames pending (fixture test). **Removed.**
- TRUE — Look at one danger button and one bar-chart icon; both silent failures are visual.

## New in v5

- TRUE — `Popover`, `Calendar`, `DatePicker`, `VerificationCodeInput`, `SubheadingText` (v5.0.0); `SidebarWithHoverIcon`, `RollingDigitsText`, `MonoText` (v5.1.0). Evidence: export lists.
- TRUE — A `tabular` prop on `BaseText`. Evidence: v5.3.0 src/components/Text/textStyle.ts:65 `tabular?: boolean` (absent at v4.8.2).
- UNVERIFIABLE — "Nothing existing changed to accommodate them." Too broad to check mechanically. Left as is.
- TRUE — `exports`, `files` and peer dependencies unchanged from v4. Evidence: identical at v4.8.2, v5.0.0, v5.3.0.

## codemod.mjs (HEAD)

- TRUE — AUTO renames render identically and use identifier boundaries (`BarChartIconWrapper`, `silo-icon`, `$SiloIcon` survive). Evidence: fixture test.
- FALSE — Header: "5.4 reinstated every `--ui-color-danger*` token under its v4 name." No release did. **Fixed:** the shipped header text plus the exit-code contract.
- FALSE — Header: "The danger report is ADVISORY and does not fail the run." In v5 it is a removal. **Fixed.**
- FALSE — Printed text "These tokens and classes EXIST again as of 5.4 … nothing here is broken", with the alias list. **Fixed:** the shipped v5 text.
- FALSE — Exit behaviour: `process.exit(0)` unconditionally (line 144); `walk()` swallows `readdirSync`/`statSync` errors, so a missing or mistyped path reports "nothing to rename / none found" and exits 0. **Fixed:** exit 1 for pending renames (dry run) or remaining REPORT items, 2 for an unreadable path (stderr names it), 0 otherwise.
- TRUE — Skip list, extension allowlist, and doc-comment lines are not reported. Evidence: fixture test (`node_modules` untouched; a `*` comment line with `bg-danger` not reported).

## Gaps and concerns (not fixed here)

- Forward compatibility, for whoever writes the v6 skill: this codemod ships in the v6 tarball, where `--ui-color-danger*` and `bg-danger` are current names again. Run against a migrated v6 app it reports them and exits 1, and the skill's "danger tokens are gone" is false for v6. That is what the 8a946e5 edit tried to say. The v6 skill must handle it (writing-version-migrations, migration-skill-shape.md §5.2–5.3), and the CHANGELOG `[Unreleased]` breaking list must carry the danger reinstatement and the renames listed at the top.
- The rename can create a duplicate import when a file already imports `BarChartAxesIcon` (fixture: `import { DiscPlatterDBIcon, BarChartAxesIcon, BarChartAxesIcon }`). `tsc` reports it; the codemod does not. Pre-existing behaviour, not changed.
- Behaviour breaks (defaults, ARIA roles, throws) were not hunted; only the public surface (exports, const keys, tokens, theme keys, CSS class selectors) was diffed.

## Claim-check fixes (batch 8)

Re-verified each finding from docs/audit/_work/docs-pass/claim-check/batch-8-migrations-v3-v5.md before editing. codemod.mjs unchanged: its exit-code contract ("1 a dry run found AUTO renames still to apply") is self-consistent; the skill's invitation to restore `BarChartIcon` was what conflicted.

- FALSE → fixed — "Put `BarChartIcon` back afterwards" vs "must exit 0" and "works as a CI gate". Scratch fixture: after `--write` a dry run exits 0; adding a deliberate `BarChartIcon` makes the dry run report `BarChartIcon -> BarChartAxesIcon` and exit 1, and `--write` rewrites it to `BarChartAxesIcon` again (codemod.mjs:104-112, 170-174). Now: restore `BarChartIcon` only after the step 5 done-check passes, then do not run the codemod again or keep it as a CI gate; the codemod "can gate CI while the migration is in progress. Drop that gate once the migration is done"; the Verify step says to run before restoring any `BarChartIcon`. The description's "No longer applies once the codemod exits 0 and tsc passes" is reachable under that order and is unchanged.
- FALSE → fixed — "the codemod reports every occurrence". codemod.mjs:31 reads only `.ts .tsx .js .jsx .mjs .cjs .css`; :27-30 skip build folders; a `.scss` danger token in the scratch fixture was not reported (exit 0). Now: "every occurrence it finds (in the file types it reads)", plus a paragraph naming the file types and skipped folders and telling the reader to search other file types for `danger`, `SiloIcon` and `BarChartIcon`.
- FALSE → fixed — "Four breaking changes" is incomplete from v4.0/v4.1. `git ls-tree` v4.1.0 has `Icons/FundingIcon.tsx` and `Icons/ReviewQueueIcon.tsx`; v4.2.0 does not (commit a042a60). The tracked `Icons/index.ts` kept their export lines until v4.4.0, but every v4 build runs `generate-icon-exports` first (v4.2.0 package.json `build`), which rebuilds index.ts from the folder (v4.2.0 scripts/generate-icon-exports.mjs:11-12, :47), so the published v4.2.0 no longer exported them. No other component file, token or constants key was removed between v4.0.0 and v4.8.2 (tree, tokens.css and constants.ts diffs). Now: the intro adds "If you start from v4.0 or v4.1, two icons removed in v4.2 also need replacing (step 4)", and a new step 4 says both were removed in v4.2.0 with no replacement, `tsc` finds them, the codemod does not touch them. Verify is renumbered to step 5.
