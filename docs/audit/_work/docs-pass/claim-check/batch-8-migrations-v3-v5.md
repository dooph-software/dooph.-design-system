# Claim check, batch 8: v3 and v5 migration skills

Checker: fresh, read-only. Truth source for historical claims: release tags
(`git show <tag>:<path>`, `git diff <tagA> <tagB>`). v3 scope v2.1.0 (last v2) → v3.4.0
(last v3). v5 scope v4.x (v4.0.0 … v4.8.2) → v5.3.0 (latest release). Forward notes
checked against the working tree (unreleased v6; no v6 skill under `skills/`).

Method notes:
- Token sets per tag: every `--ui-*:` declaration in `src/styles/tokens.css` +
  `dooph-component-tokens.css`, diffed tag to tag.
- Export sets per tag: every `export const|function|type|…` and `export { … }` name
  under `src/` (stories excluded), diffed tag to tag.
- Codemod: copied to the scratchpad, run against throw-away fixtures (dry run,
  `--write`, missing path, single file, `node_modules` skip, doc comment vs `* {`).
- v3 done-check `rg` commands run against a scratch fixture (ripgrep 14.1.1).

## Summary

| doc | claims | TRUE | FALSE | UNVERIFIABLE |
|---|---|---|---|---|
| skills/dooph-design-system-v3-migration/SKILL.md | 46 | 41 | 4 | 1 |
| skills/dooph-design-system-v5-migration/SKILL.md | 26 | 23 | 3 | 0 |
| skills/dooph-design-system-v5-migration/codemod.mjs | 10 | 10 | 0 | 0 |
| **total** | **82** | **74** | **7** | **1** |

No pointer to `src/`, `scripts/`, `docs/` or other repo-only paths in any of the three
files. The only path is the codemod's install path
`node_modules/@dooph-software/design-system/skills/…/codemod.mjs`, which is in the
published `files` (`skills`, package.json at HEAD and at every tag checked).

---

## FALSE

### v3-1. The intro undercounts what step 3 changes
- **Where:** v3 SKILL.md:10-16
- **Claim:** "This is a mechanical rename sweep across three surfaces: … 3. `ButtonVariant.destructive` in your TSX."
- **Evidence:** Step 3 (:162-163) itself says "Five things changed": the button
  variant, `ToastTypes.standard/action` (v3.1.0, `src/components/Toast/constants.ts`
  at v3.0.0 vs v3.1.0), `TextFontFamily/TextFontSize/TextFontWeight` + `fontFamily` prop
  (removed v3.4.0), the four sidebar icons (removed v3.0.0), `ThinkingIcon` (removed
  v3.2.0). The sidebar change is called "a semantic change, not a rename" (:210), so
  "mechanical rename sweep" is also wrong for it.
- **Fix:** "…across three surfaces: … 3. The component API in your TSX
  (`ButtonVariant.destructive`, `ToastTypes`, the Text constants, three icon names).
  One of these, the sidebar icons, is a semantic change, not a rename (step 3)."

### v3-2. The done-check passes with silent leftovers
- **Where:** v3 SKILL.md:256-277 (Pass A, Pass B, "Zero hits from both passes + a clean build = migration complete")
- **Evidence:** Scratch fixture containing
  `--ui-color-focus-ring: x; --ui-width-toast: 1px; --ui-width-toast-action: 2px;` and
  `className="border-border"`: Pass A exit 1 (no hit), Pass B exit 1 (no hit). All
  four are removed v2 names (token diff v2.1.0→v3.0.0 removes `--ui-color-focus-ring`,
  `--color-border`; v3.0.1→v3.1.0 removes `--ui-width-toast`,
  `--ui-width-toast-action`). None of them breaks the build: an override of a deleted
  token and a class with no rule both fail silently. The skill's own caution at
  :154-156 names `border-border` as needing a bare-name match, but Pass B never greps
  it.
- **Fix:** Pass B pattern:
  `rg -nP -e "--ui-color-border(?![-\w])|--ui-color-surface(?![-\w])|--ui-color-focus-ring(?![-\w])|--ui-width-toast(?![-\w])|--ui-width-toast-action|bg-surface(?![-\w])|border-border(?![-\w])" .`
  and add `border-border`, `--ui-color-focus-ring`, `--ui-width-toast` to the no-`-P`
  fallback sentence (:271-274).

### v3-3. Danger text does not "use" the primary text token
- **Where:** v3 SKILL.md:233-234
- **Claim:** "Danger button text is now dark-on-red in light mode (uses the primary text token; …)"
- **Evidence:** `git show v3.0.0:src/styles/tokens.css:60`
  `--ui-color-danger-foreground: #161616; /* Figma: Text/primaryText */` is a literal
  hex, not `var(--ui-color-text)`. It equals `--ui-color-text` (:97 `#161616`) only by
  value, so retuning `--ui-color-text` does not move it. The rest of the bullet is TRUE
  (dark `.dark` value `#ffffff` at :253; v2.1.0 light `#ffffff` :62 and no dark override,
  so white in both).
- **Fix:** "(`#161616`, the same colour as the primary text token; white in dark mode)".

### v3-4. The utility table recommends typography utilities the maintainer has ruled out
- **Where:** v3 SKILL.md:61-73 (rows "font role" and "font size", and the text-style
  aside), and :228-232
- **Claim:** "Once imported, use the ergonomic utilities instead of arbitrary values" with
  `font-body`, `font-label`, `text-body`, `text-heading`…, plus "Composite typography
  classes like `text-style-button` ship precompiled … and work with or without the
  preset"; :228-232 tells readers to audit `leading-*`/`tracking-*` on Text components
  rather than move them.
- **Evidence:** The utilities do generate (v3.4.0 `theme.css` `--font-*`/`--text-*`, still
  at HEAD theme.css:97-112; `.text-style-button` at HEAD index.css:248), so the facts
  hold. The advice contradicts the maintainer decision (text is always set by a Text
  component; typography is props only, for consumers too) and the shipped usage skill,
  skills/dooph-design-system-usage/SKILL.md:17: "No … `tracking-*`, `leading-*`,
  `text-style-*`, the preset's `text-body` / `font-label`". The props that replace them
  exist since v3.4.0 (`fontSize`, `fontWeight`, `lineHeight`, `letterSpacing`).
- **Fix:** Drop the "font role" and "font size" rows and the text-style aside. Add one
  line: "Set typography through Text component props (`font`, `fontSize`, `fontWeight`,
  `lineHeight`, `letterSpacing`), not utilities; see the usage skill." At :231-232,
  replace "Audit those call sites" with "Move them to the `lineHeight` /
  `letterSpacing` props".

### v5-1. "Put `BarChartIcon` back" and "the codemod must exit 0" cannot both hold
- **Where:** v5 SKILL.md:40-41 against :86 ("must exit 0") and the description (:3,
  "No longer applies once the codemod exits 0 and tsc passes"); :25-27 ("works as a CI gate")
- **Evidence:** Scratch run: after `--write` the dry run exits 0. Appending
  `import { BarChartIcon } from "x";` (a deliberate use of v5's axis-less chart, as
  :40-41 invites) makes every later dry run print
  `BarChartIcon -> BarChartAxesIcon (1 use)` and exit 1 (codemod.mjs:104-112, 170-174:
  any `BarChartIcon` identifier counts as a pending rename). So an app that follows :40-41
  can never pass the done-check, and a CI gate on the codemod fails for good.
- **Fix (doc only):** At :40-41, add: "The codemod cannot tell a deliberate
  `BarChartIcon` from a stale one, so after you put one back it exits 1 on every dry run.
  Do this only after the migration is done, and do not keep the codemod as a CI gate."
  Change :86 to "must exit 0 (or report only the `BarChartIcon` call sites you restored
  on purpose)". The other option is a code change: an allow comment the codemod
  honours. Changing the code is a design decision for the maintainer.

### v5-2. "Reports every occurrence" covers only seven file types
- **Where:** v5 SKILL.md:59-60 ("the codemod reports every occurrence with `file:line`"),
  and the description's expiry condition "once the codemod exits 0"
- **Evidence:** codemod.mjs:31 scans only `.ts .tsx .js .jsx .mjs .cjs .css`.
  codemod.mjs:27-30 skips `node_modules .git dist build .next out coverage .turbo .cache
  storybook-static`. codemod.mjs:118 skips doc-comment lines (` * …`). Danger tokens or
  classes in `.scss`, `.less`, `.html`, `.vue`, `.svelte`, `.astro` or `.mdx` files are
  never read, so exit 0 does not show the palette is gone from those files.
- **Fix:** "…reports every occurrence it finds with `file:line`. It reads `.ts`, `.tsx`,
  `.js`, `.jsx`, `.mjs`, `.cjs` and `.css` files only, skipping `node_modules`, `dist`,
  `build`, `.next`, `out` and other build folders. Grep any other file types yourself
  for `danger`."

### v5-3. "Four breaking changes" is incomplete for a v4.0 to v4.3 starting point
- **Where:** v5 SKILL.md:10 (with the description's scope "from … v4.x"); also the v3
  forward note v3 SKILL.md:25-27, which sends a v3 app straight to the v5 skill
- **Evidence:** From v4.8.2 the count is exact. Export diff v4.8.2→v5.3.0 removes only
  `SiloIcon` (plus internal `generateWavyArcPath`, never in the barrel). Token diff
  removes only the nine `--ui-color-danger*`. Constants diff removes only
  `ShapeButtons.pentagon`. But within v4, `FundingIcon` and `ReviewQueueIcon` were
  removed with no note anywhere: their source files were deleted in v4.2.0 (commit
  a042a60, `git ls-tree v4.2.0`), and their export lines were dropped in v4.4.0
  (`git diff v4.3.0 v4.4.0 -- src/components/Icons/index.ts`). v3.4.0→v4.0.0 has no
  export or token change, so v3 needs no v4 skill. An app on v3.4–v4.1 that uses either
  icon loses it on the way to v5, and no migration skill mentions this. tsc catches it.
- **Fix:** Add under §3 or as a fifth short item: "On v4.0–v4.1? `FundingIcon` and
  `ReviewQueueIcon` were removed during v4, with no replacement. `tsc` flags them; pick
  another icon."

---

## UNVERIFIABLE

### v3-U1. Fixed-height controls are unaffected by the line-height change
- **Where:** v3 SKILL.md:226-227 ("fixed-height controls (buttons, inputs) are unaffected either way")
- **Why:** This is a rendering claim. The v3.4.0 source shows fixed `--ui-height-*` on
  buttons and inputs, but whether text inside them still centres the same without
  `line-height: 1` can only be seen in a render.
- **What would verify it:** Render a v3.3.0 and a v3.4.0 Button and Input in a
  preflight Tailwind page, then compare box heights and text baselines.

---

## TRUE (compact)

### v3 SKILL.md
- :3 symptoms (bare border/surface, destructive/logo/accent tokens, `ButtonVariant.destructive`) → all removed in v3.0.0 (token diff v2.1.0→v3.0.0; Button/constants.ts).
- :10-11 no aliases; tokens + `destructive` deleted → token diff v2.1.0→v3.0.0 shows plain removals; Button/constants.ts `-destructive +danger`.
- :22 v3.4.0 is the last v3 → `git tag`: v3.4.0 then v4.0.0.
- :22-23 later-minor changes are labelled → every label checked: toast widths and ToastTypes v3.1.0; ThinkingIcon v3.2.0; RollHoverText v3.3.0; Text constants, line-height and layer v3.4.0; DropdownMenuVariant v3.1.0. Everything unlabelled landed in v3.0.0.
- :25-28 forward note → v5 skill exists; no v6 skill in `skills/`; "when it ships" makes no present-tense claim. "v5 removes the danger family" → v4.8.2 18 `--ui-color-danger` lines, v5.0.0 0.
- :32-35 preset needed for renamed utilities → v3.4.0 theme.css registers `--color-danger`, `--color-surface-primary`, `--color-border-primary`.
- :43-45 `theme.css` export, standalone `@theme inline` → v3.4.0 package.json exports `./theme.css`; theme.css:20 `@theme inline {`.
- :47-54 import order → v3.4.0 theme.css:6-11 header gives the same order.
- :56-59 no config or `@source` change; utilities emit `var(--ui-*)` → `@theme inline` with `var()` values.
- :63-69 utilities exist (spacing xxs…xxl, radius tight/standard/soft, `bg-primary`, `text-danger-fg`, font roles, font sizes) → v3.4.0 theme.css:21, 53, 82-104. (Advice part is FALSE v3-4.)
- :83-84 "as before" → `./theme.css` already exported at v2.1.0.
- :89-91 blanket destructive→danger except focus ring → `--ui-color-destructive-focus-ring` → `--ui-color-focus-ring-error`.
- :92-111 all 18 token rows → removed/added pairs in token diffs; `--ui-brand-color-alt` keeps accent's `#44c0e5`; toast widths in v3.1.0.
- :115-117 `logo-alt` gone, alt slot repurposed from accent → v2.1.0 `--ui-color-logo-alt`, `--ui-accent-color: #44c0e5`; v3.0.0 `--ui-brand-color-alt: #44c0e5`.
- :118-122 Avatar derivation → v3.0.0 Avatar.tsx:21-22 `bg-surface-secondary border … border-border-secondary`, `text-brand-color`.
- :124-130 unchanged list → every name present at v2.1.0 and v3.4.0. focus-ring-primary value moved 0.17→0.25.
- :132-135 new optional tokens → added in v3.0.0. `--ui-color-trigger-border-error-focus: var(--ui-color-danger-border)` (v3.0.0:94).
- :141-151 class rows → v2.1.0 theme.css `--color-destructive*`, `--color-surface`, `--color-surface-page`, `--color-border`, `--color-logo`, `--shadow-focus-destructive`; v3.0.0 counterparts present.
- :153-158 cautions and `border-border(?![-\w])` → correct bare-name regex (tested).
- :162-163 "Five things changed" → export diff v2.1.0→v3.4.0 removes exactly the sidebar four, `ThinkingIcon` and the `TextFont*` three; enum members changed: Button and Toast only.
- :167 `ButtonVariant.danger` → v3.0.0 Button/constants.ts:12.
- :169-179 Toast `simple`/`complex` since v3.1.0, `variant` prop, `toast()` options → Toast/constants.ts v3.0.0 vs v3.1.0; v3.4.0 Toast.tsx:24-28 `ToastOptions.variant`.
- :181-184 `ThinkingIcon` → `AIThinkingIcon`, removed v3.2.0, same glyph → v3.1.0 exports `ThinkingIcon`; v3.1.1 alias; v3.2.0 gone; `<path>` lines identical to v2.1.0 ThinkingIcon.tsx.
- :186-193 `Fonts`/`FontSizes`/`FontWeights`/`font` since v3.4.0 → export diff v3.3.0→v3.4.0; v3.4.0 Text/constants.ts.
- :195-198 values are `var()` strings applied inline; v2 props did nothing → v3.4.0 constants.ts header; textStyle.ts:5-10 records the v2 failure.
- :198-200 raw values; `lineHeight`, `letterSpacing`, `axes`, `unstyled` new → constants.ts:117-125 (`| number`); BaseText.tsx:17-18, 66-74; none in v2.1.0 BaseText.
- :200 usage skill Text section → skills/dooph-design-system-usage/references/components.md:1976 `## Text`.
- :202-208 sidebar icons → files removed and added v2.1.0→v3.0.0.
- :210-216 semantic change → old names encode open/closed, new ones rest/hover.
- :218-219 only changed exports → full export diff v2.1.0→v3.4.0 (see :162).
- :223-226 no line-height since v3.4.0 → v3.3.0 index.css 6× `line-height: 1;`, v3.4.0 0. 1.5 is Tailwind v4 preflight's `html` line-height.
- :228-232 role class moved to `components` layer in v3.4.0 → v3.3.0 `@layer utilities {` before `.text-style-*`, v3.4.0 `@layer components {` (index.css:128).
- :236-238 red shift `#e93b3b` → `#ec5555`; border tone → v2.1.0:56/98, v3.0.0:54/89 (`#dfe3e5` → `#dddddd`).
- :242-246 new in v3 → absent at v2.1.0. Present at v3.0.0, except RollHoverText (v3.3.0) and DropdownMenuVariant (v3.1.0, Menu/constants.ts:13). All reachable from v3.4.0 `src/index.ts`.
- :247-248 Radix deps transitive → v3.4.0 package.json `dependencies` has react-slider and react-progress.
- :252-254 lookahead needs `-P` → rg without PCRE2 has no lookaround.
- :259 Pass A command runs as written → tested.
- :265-269 Pass B needs `-e` → tested: without it, `rg: unrecognized flag --ui-color-border(?![-\w])`.
- :271-274 allowed longer names → v3.4.0 border names: focus, popovers, primary, secondary. Surface names: primary, secondary.

### v5 SKILL.md
- :3 symptoms → danger tokens gone at v5.0.0. `BarChartIcon` redrawn at v5.1.0. `SiloIcon` gone from exports at v5.1.0.
- :10-11 the four are 2 renames + 1 redesign + 1 compile-caught removal → see v5-3 evidence (exact from v4.4+).
- :13-15 two silent → the danger palette (no rule, no error) and `BarChartIcon` (still exported). `SiloIcon` and pentagon are compile errors.
- :17 forward note → no v6 skill exists. The wording claims nothing beyond "when it ships".
- :22 install path → `skills` is in `files` at v5.3.0 and HEAD; codemod.mjs ships at v5.1.0+.
- :25 dry run by default, `--write` applies → codemod.mjs:24, 114; tested.
- :25-27 exit 1 / 2 → tested: pending renames exit 1, danger hits exit 1, `--write` with only renames exit 0, missing path exit 2. Exit 2 also fires for an unreadable folder or source file under the path (codemod.mjs:56-60, 69-73, 96-100), which the skill does not mention.
- :33 `SiloIcon` pure rename → `<path>` lines identical, v4.8.2 SiloIcon.tsx vs v5.3.0 DiscPlatterDBIcon.tsx.
- :34-38 `BarChartIcon` reused for the axis-less chart; `BarChartAxesIcon` is the v4 glyph → v4.8.2 BarChartIcon paths = v5.3.0 BarChartAxesIcon paths. v5.3.0 BarChartIcon has 3 bars, no axis path. (Landed v5.1.0; the skill itself first ships in v5.1.0, so every reader has it.)
- :43-45 name-only matching; strings rewritten → codemod.mjs:106 regex only; tested (`"silo-icon"` and `BarChartIconWrapper` untouched).
- :49-51 nine tokens and their classes gone → v4.8.2 nine distinct `--ui-color-danger*`, and theme.css 9 `--color-danger*`. v5.0.0 0.
- :53-54 both silent → no rule, no error.
- :56-59 danger redesigned → v4.8.2 Button.tsx:43-47 `bg-danger …`. v5.0.0 Button.tsx:61-65 `bg-secondary text-error-primary border-secondary-border`, hover `bg-error-secondary`, active `bg-error-primary`.
- :64-68 table → same lines (also hover border `error-secondary`, active border `error-primary`, hover/active text `secondary-fg`; not wrong, just not listed).
- :70-71 `bg-/text-/border-error-primary` → v5.0.0 and v5.3.0 theme.css:47 `--color-error-primary`.
- :71-73 no equivalent for `-fg`, `-disabled`, border trio → v5.3.0 tokens only `error-primary` and `error-secondary`.
- :77-79 pentagon removed, compile error → ShapeButton/constants.ts v4.8.2 vs v5.0.0. v5.3.0 ShapeButton.tsx:28 `shape?: ShapeButtons`.
- :79-81 remaining values; `PentagonShape` exists → v5.3.0 constants; Shapes/index.ts:6.
- :87 `npx tsc --noEmit` catches the compile-error half → `SiloIcon` and pentagon are type errors.
- :90-92 both failures visual → see :13-15.
- :96-99 new in v5 → absent at v4.8.2. Popover, Calendar, DatePicker, VerificationCodeInput and SubheadingText at v5.0.0. SidebarWithHoverIcon, RollingDigitsText, MonoText and `tabular` at v5.1.0. "Nothing existing changed to accommodate them" holds narrowly; see the observation below.
- :101-102 `exports`, `files`, peers unchanged → identical JSON at v3.4.0, v4.8.2, v5.0.0, v5.3.0.

### codemod.mjs
- :5-9 AUTO vs REPORT split → :38-41 RENAMES, :46-48 REPORT regexes.
- :11-13 usage → :23-25.
- :15-18 exit codes → :174; tested.
- :33-37 same glyph; reused name → see SKILL :33-38.
- :43-45 danger redesign → see SKILL :56-59.
- :50-51 unreadable path fails with 2 → tested (`codemod: cannot read nope (ENOENT)`, exit 2).
- :69-70 only a source file fails the run on a stat error → :71.
- :105 boundaries keep `BarChartIconWrapper` and `"silo-icon"` safe → tested.
- :117 doc-comment lines skipped, `* {` not → tested: ` * --ui-color-danger…` skipped, `* { color: var(--ui-color-danger) }` reported.
- :149-162 report text → nine tokens; retune list matches v5.3.0 Button.tsx.

---

## §4 register: reappearances

- **C-V3-6, C-V3-13 / F-009 (`surface-page` both kept and renamed):** fixed. The current
  file renames it consistently (:106, :149, :158), and Pass A greps it. That is
  historically correct for v2→v3. Still a forward hazard: HEAD brings
  `--ui-color-surface-page` / `bg-surface-page` back (tokens.css:113, theme.css:67;
  CHANGELOG [Unreleased] "page-background → surface-page"). Pass A therefore flags
  valid v6 names if it runs after the v6 renames. The forward note's "do this first,
  then later skills in order" keeps it safe only if readers follow that order.
- **C-V3-9 / C-V3-11 (`ShapeButtons.star`, `DropdownMenuVariant`, "only changed exports"):**
  the text reappears unchanged (:218-219, :245-246). It is TRUE for v3.4.0, which is
  the scope :22 now states. Both names are removed at HEAD (ShapeButton/constants.ts
  has no `star`; Menu/constants.ts has no `DropdownMenuVariant`). That belongs in the
  coming v6 skill, not here.
- **C-V3-4, C-V5-2, C-V5-6, C-V5CM-1 ("5.4" labels):** gone. No "5.4" anywhere in the
  three files.
- **C-V5-3 / F-007 (codemod always exits 0):** fixed. The codemod now exits 1 and 2 as
  documented (tested). A new gate defect replaces it: v5-1.
- **C-V5-1 caveat (icon renames shipped in 5.1.0):** still unlabelled. Harmless, since
  the skill and codemod first ship in 5.1.0.

## Cross-doc contradictions and forward-compat notes

1. **v3 SKILL.md:61-73 vs skills/dooph-design-system-usage/SKILL.md:17:** the v3 skill
   says to use `font-label` / `text-body`, and the usage skill forbids them (v3-4).
2. **v5 SKILL.md guidance vs HEAD (unreleased v6):** HEAD renames
   `--ui-color-error-primary/secondary` → `--ui-color-danger-primary/secondary` and brings
   back a `--ui-color-danger-*` state family (tokens.css:87-104; CHANGELOG [Unreleased]
   :160, :256). The v5 codemod's `DANGER_TOKEN` / `DANGER_CLASS` match all of those, so
   if it runs after the v6 renames it reports valid v6 code as "needs a human" and exits
   1. The v5 skill's §2 retune table names tokens that v6 removes. Both are correct for
   v5. They are safe only under the "in order" rule in the v3 forward note, and the v5
   forward note (:17) does not repeat it. Suggested addition for :17: "Finish this
   skill, including its done-check, before you start the v6 one; v6 reuses the
   `danger` names." Whether to say so before v6 ships is the maintainer's call.
3. **v5 SKILL.md:79-80 vs HEAD:** HEAD's `ShapeButtons` has no `arrow`, `gem` or `star`
   (CHANGELOG [Unreleased] "Shapes: GemShape is removed…"). This is correct for v5 and
   belongs to the v6 skill.
4. **Undocumented v5 visual changes (not breaking, not counted):** PuffShape and
   PentagonShape outlines were redrawn in v5.3.0. Checkbox disabled+checked is painted
   `primary-disabled` from v5.0.0. RollChangeText motion moved to tokens in v5.1.0. The
   v3 skill has a "Visual changes to expect" section; the v5 skill has none.
5. README.md:88-90 describes both skills consistently with their scope.

## Fixes

All findings re-verified first; none rejected. codemod.mjs unchanged (its exit-code contract is self-consistent; the skill text was what conflicted), so its fixtures needed no re-run. Forward-note lines (v3 :25-28, v5 :19) untouched.

- **v3-1 FIXED.** Intro now: "This is mostly a rename sweep across three surfaces: … 3. The component API in your TSX (`ButtonVariant.destructive`, `ToastTypes`, the Text constants, and some icon names). One of these, the sidebar icons, is a semantic change, not a rename (step 3)."
- **v3-2 FIXED.** Pass B is now `rg -nP -e "--ui-color-border(?![-\w])|--ui-color-surface(?![-\w])|--ui-color-focus-ring(?![-\w])|--ui-width-toast(?![-\w])|--ui-width-toast-action|bg-surface(?![-\w])|border-border(?![-\w])" .` (tested on a fixture: removed names hit, v3.4.0 longer names do not). The no-`-P` fallback names all six plain patterns and the allowed longer names per family, including `--ui-width-toast-viewport` (exists at v3.4.0). The section adds: "A clean build alone proves nothing here: an override of a deleted token and a class with no rule both fail silently."
- **v3-3 FIXED.** "(`#161616`, the same colour as the primary text token but set separately, so retuning `--ui-color-text` does not move it; white in dark mode)".
- **v3-4 FIXED.** Font role and font size rows, the `text-style-button` aside and the `font-label` example removed (not needed for the step: v2.1.0 and v3.4.0 have identical `--font-*`/`--text-*` theme keys). New paragraph: typography was not renamed in v2 → v3; set it through Text component props (`font`, `fontSize`, `fontWeight`, `lineHeight`, `letterSpacing`), not utility classes; later majors set typography only through those props, see `dooph-design-system-v6-migration`. The `leading-*`/`tracking-*` bullet now ends "Check each one: delete it if you do not want the effect, or move it to the Text component's `lineHeight` / `letterSpacing` prop if you do."
- **v5-1 FIXED (doc only).** Step 1: restore `BarChartIcon` "only after the done-check in step 5 has passed. The codemod cannot tell a deliberate `BarChartIcon` from a stale one: from then on a dry run reports it and exits `1`, and `--write` turns it back into `BarChartAxesIcon`. So do not run the codemod again after that, and do not keep it as a CI gate." Run section: "so it can gate CI while the migration is in progress. Drop that gate once the migration is done". Verify: "Run this before you put any `BarChartIcon` back (step 1)". Description unchanged (its done-condition is reachable in that order).
- **v5-2 FIXED.** "reports every occurrence it finds (in the file types it reads)", plus a paragraph under the run command: reads `.ts .tsx .js .jsx .mjs .cjs .css` only, skips `node_modules`, `dist`, `build`, `.next`, `out` and other build folders; search other file types for `danger`, `SiloIcon` and `BarChartIcon` yourself.
- **v5-3 FIXED.** Verified: files deleted in v4.2.0 (a042a60); tracked export lines dropped in v4.4.0, but every v4 `build` runs `generate-icon-exports` first, which rebuilds index.ts from the folder, so the published v4.2.0 already lacked them. Nothing else removed within v4 (tree, tokens, constants diffs v4.0.0→v4.8.2). Intro adds "If you start from v4.0 or v4.1, two icons removed in v4.2 also need replacing (step 4)"; new step 4 "`FundingIcon` and `ReviewQueueIcon` — only if you start on v4.0 or v4.1"; Verify renumbered to 5.
- **v3-U1 FIXED (verified by render, narrowed).** Built v3.3.0 and v3.4.0 CSS with the Tailwind CLI in the scratchpad (no worktree, no build in the checkout; removed afterwards), rendered Button default/sm and Input classes: heights 38/34/38 px in both; button text box shifts 0.5 px. Now: "`Button` and `Input` keep their fixed height either way, and their text stays centred to within half a pixel."
- **Cross-doc 1** resolved by v3-4. **Cross-doc 2-4** left for the v6 skill writer (forward notes are theirs).

## Fix verification

Verifier: fresh, read-only. `npm run lint` exit 0 (30 conventions checks passed);
`node scripts/sync-skills.mjs --check` exit 0 (9 skills x 2 mirrors). Both descriptions
are single-quoted YAML scalars with no undoubled `'` (v3 has `skill''s`, doubled).

- **v3-1 VERIFIED.** Intro (:11-18) now reads "mostly a rename sweep" and lists the
  component API incl. the sidebar semantic change; matches step 3 "Five things changed".
- **v3-2 VERIFIED.** Scratch fixture in the scratchpad (never the repo): the new Pass B
  hits `--ui-color-focus-ring`, `--ui-width-toast`, `--ui-width-toast-action`, bare
  `--ui-color-border`, `--ui-color-surface`, `border-border`, `bg-surface`; it hits nothing
  on a file holding every v3.4.0 longer name (focus-ring-brand/error/primary,
  toast-simple/complex/viewport, border-primary/secondary/popovers/focus, surface-primary/
  secondary). Pass A also clean on that file. The fallback sentence's allowed-name lists
  match the v3.4.0 `tokens.css` token set exactly. "A clean build alone proves nothing"
  is true (removed names fail silently).
- **v3-3 VERIFIED.** `git show v3.0.0:src/styles/tokens.css`: `--ui-color-danger-foreground:
  #161616` (:60, literal), `--ui-color-text: #161616` (:97), dark `#ffffff` (:253). New
  wording ("same colour ... but set separately ... white in dark mode") is true.
- **v3-4 VERIFIED, one note.** No font-role/font-size rows, no `text-style-*` aside, no
  `font-label` anywhere; the new paragraph (:74-78) steers to Text props. "v2 -> v3 renamed
  no font or text utility" is true (`--font-*`/`--text-*` lines of theme.css hash-identical
  at v2.1.0 and v3.4.0). The leading/tracking bullet now says move to `lineHeight` /
  `letterSpacing` props (exist since v3.4.0). Note: the paragraph points at
  `dooph-design-system-v6-migration`; at verification time `skills/dooph-design-system-v6-migration/`
  exists as an untracked directory but has no SKILL.md yet (parallel work in progress), so
  the pointer resolves only once that lands. "Later majors set typography only through those
  props" is consistent with CHANGELOG [Unreleased] ("Text is always set by a Text component")
  but not checkable against the v6 skill yet.
- **v3-U1 VERIFIED (narrowed).** New text claims fixed heights and centring within half a
  pixel. Source: v3.4.0 `Button.tsx:61-62` `h-button` / `h-button-sm`, `inline-flex
  items-center`; `Input.tsx:16` `flex h-button`. The sub-pixel figure rests on the fixer's
  render; the source is consistent with it (fixed height, centred line box).
- **v5-1 VERIFIED.** Step 1 (:50-55) and the run section (:27-31) now agree. Scratch
  fixture, codemod copied nowhere (run in place against the scratchpad): fresh dry run
  exit 1; `--write` exit 0; dry run after write exit 0; after adding `import { BarChartIcon }`
  the dry run reports `BarChartIcon -> BarChartAxesIcon (1 use)` and exits 1, exactly as the
  skill states. "Restore only after the done-check (step 5)" is the only order that keeps
  step 5's "must exit 0" reachable.
- **v5-2 VERIFIED.** Skill's file-type list (:33-37) = `codemod.mjs:31` EXT
  (`.ts .tsx .js .jsx .mjs .cjs .css`); skipped folders listed are a subset of `codemod.mjs:27-30`
  SKIP ("and other build folders" covers coverage/.turbo/.cache/storybook-static loosely, `.git`
  not a build folder but harmless). A `.scss` file with `--ui-color-danger` in the fixture was
  not reported (confirmed).
- **v5-3 VERIFIED.** `git ls-tree`: `FundingIcon.tsx` / `ReviewQueueIcon.tsx` present at
  v4.0.0 and v4.1.0, absent at v4.2.0 (commit a042a60 deletes both). Tracked `index.ts` still
  exports them at v4.2.0 and v4.3.0, dropped at v4.4.0, but v4.2.0 `package.json` build is
  `npm run generate-icon-exports && ...`, and `scripts/generate-icon-exports.mjs` emits one
  line per `*Icon.tsx` on disk, so published v4.2.0 already lacked them. Skill text ("removed
  in v4.2.0 ... compile error ... only if you start on v4.0 or v4.1") is true; numbering
  (steps 1-5, "step 4" intro reference, "step 1" in Verify) is consistent.

Counts: 7 FALSE findings + 1 UNVERIFIABLE: 8 VERIFIED, 0 STILL FALSE (v3: 5 verified incl. U1;
v5: 3 verified).
