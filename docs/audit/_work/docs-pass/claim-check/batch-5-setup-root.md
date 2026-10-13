# Claim check, batch 5: setup skill and root docs

Fresh, read-only check of `skills/dooph-design-system-setup/` (SKILL.md, references/fonts-and-preset.md, references/client-references.md), README.md, AGENTS.md, CONTRIBUTING.md and SECURITY.md against the working tree on 2026-10-11. `npm run lint` was run during the check: exit 0, "conventions: 30 checks passed" (so every generated file, including the client-references block, matches its generator). External URLs: the recorded browser checks in `docs/audit/_work/docs-pass/claims/*.md` are accepted, except where noted. Scratch-app results (Next.js builds, browser `getComputedStyle`) come from the recorded rig in `claims/dooph-design-system-setup.md`; I re-derived every claim that the repo itself can settle.

## Summary

| Doc | Claims | TRUE | FALSE | UNVERIFIABLE |
|---|---|---|---|---|
| setup SKILL.md | 30 | 30 | 0 | 0 |
| setup references/fonts-and-preset.md | 26 | 25 | 1 | 0 |
| setup references/client-references.md | 17 | 17 | 0 | 0 |
| README.md | 34 | 33 | 1 | 0 |
| AGENTS.md | 26 | 26 | 0 | 0 |
| CONTRIBUTING.md | 5 | 5 | 0 | 0 |
| SECURITY.md | 4 | 3 | 0 | 1 |
| **Total** | **142** | **139** | **2** | **1** |

Not counted: the legal and policy statements written by the maintainer (README:10 IP disclaimer, README:99-100 trademark line, CONTRIBUTING:3-4 "no pull requests", SECURITY:5 "only the latest release receives security fixes"). Code can't confirm or refute them.

---

## FALSE

### 1. fonts-and-preset.md:90: "It maps every DS token to a utility"

- **Claim (verbatim):** "`theme.css` is `@theme inline` source for the app's own Tailwind v4 build. It maps every DS token to a utility, so the names resolve to `var(--ui-…)` and follow token overrides at runtime."
- **Evidence:** `scripts/sync-theme.mjs:104-` `EXCLUDED` skips every `--ui-weight-*`, `--ui-font-var-*`, `--ui-tracking-*`, `--ui-icon-*` and more, and the header says (:25) "EXCLUDED names and names no rule matches are skipped". tokens.css declares 291 distinct `--ui-*` names, and `src/styles/theme.css` references 137 of them. It defines only `--color-*` (83), `--font-*` (7), `--text-*` (12), `--radius-*` (10), `--shadow-*` (12) and `--spacing-*` (13). Unmapped examples: `--ui-caret-shape-scale`, `--ui-chat-*`, `--ui-color-focus-ring-danger`, `--ui-weight-body`.
- **Old false claim reappearing:** this is the old register's C-README-13 ("preset learns every `--ui-*` token") and C-THEME-3 ("preset registers every `--ui-*` token"), both FALSE.
- **Fix:** "It maps the DS's colour, font-family, text-size, radius, shadow and spacing tokens to utilities (not every token: weights, font axes, tracking, icon sizes and component-only tokens have no utility), so those names resolve to `var(--ui-…)` and follow token overrides at runtime."
- **Side note, out of batch:** the generated header of `src/styles/theme.css:13` says "This registers every --ui-* token in your Tailwind build". That's the same false claim, and it comes from the header template in `scripts/sync-theme.mjs` (~:367). It ships in `dist/theme.css`.

### 2. README.md:96-97: "bundled dependencies are listed in THIRD_PARTY_NOTICES.md"

- **Claim (verbatim):** "Third-party icon sources and bundled dependencies are listed in [THIRD_PARTY_NOTICES.md]"
- **Evidence:** the 14 npm packages that THIRD_PARTY_NOTICES.md:46-67 lists are external, not bundled. tsup externalizes `dependencies` by default (`tsup.config.ts:57` adds react/react-dom), and `dist/chunk-*.js` keep `from "@radix-ui/react-tabs"` imports. The notices file itself says "bundled or linked". The code that really is bundled is the vendored shape-morph engine (listed, :70-) and Tailwind's preflight and utilities, which `scripts/emit-css.mjs:22` compiles into `dist/styles.css`. Tailwind is not listed anywhere in THIRD_PARTY_NOTICES.md (only `tailwind-merge`, and Heroicons' Tailwind Labs copyright).
- **Fix:** "Third-party icon sources, runtime npm dependencies and vendored code are listed in [THIRD_PARTY_NOTICES.md]". Separately, for the maintainer to decide (not a doc fix): whether the Tailwind CSS output compiled into `dist/styles.css` needs a notices entry.

## UNVERIFIABLE

### 1. SECURITY.md:11-12: "Use GitHub's private vulnerability disclosure: Report a vulnerability (…/security/advisories/new)"

- **Why:** the recorded browser check (`claims/SECURITY.md`) was signed out, and the URL redirected to sign-in. The repo's Security tab loads and shows the policy, but it had no "Report a vulnerability" button, and that button appears only when private vulnerability reporting is enabled. The slug is right (it matches package.json:10, :12). Whether the form exists is a repo setting.
- **What would verify it:** the maintainer checks Settings → Code security → "Private vulnerability reporting" = enabled, or opens the URL while signed in and sees the form.

---

## TRUE (claim → evidence)

### setup SKILL.md
- S:8 package ships components, `styles.css` (tokens + the DS's own classes), optional preset `theme.css`, skills → package.json:20-28, :35-46; src/styles/build.css:6-7; src/styles/index.css:1-4
- S:8 loads no font → no `@font-face`/font URL in src/styles; tokens.css:407-408 "Consumers load fonts"; .storybook/preview-head.html:1-6 "NEVER shipped"
- S:8 paints no page → no `body` rule in src/styles/*.css (grep)
- S:14 install command; peers react/react-dom ≥19 → package.json:2, :64-67
- S:15-20 the three-line Tailwind import order → src/styles/theme.css:6-11; bin/init.mjs:180-183
- S:21 no Tailwind: `styles.css` from the JS entry, no theme.css → theme.css:17; bin/init.mjs:175-177
- S:23 body paint snippet uses real tokens → tokens.css `--ui-color-surface-page`, `--ui-color-text`, `--ui-font-body`
- S:24 `init-skills`, `--yes` skips prompts → package.json:17-19; bin/init.mjs:44, :58-63
- S:28 DS utilities need theme.css; `p-md`, `gap-lg`, `bg-primary`, `text-text-secondary` are preset names → theme.css:21, :85, :117-118; recorded tw rig (no preset → not generated)
- S:28 styles.css holds only classes the DS uses → index.css:1-3 (`source(none)`, `@source "../**/*"`), build.css:7
- S:29 xs 6 / sm 8 / md 12 / lg 16 / xl 20 px → tokens.css:583-588
- S:29 the seven utilities (w, min-w, max-w, basis, inline, min-inline, max-inline) read `--spacing` before `--container` → node_modules/tailwindcss/dist/lib.js (`["max-w",["--max-width","--spacing","--container"]`, the same for w, min-w, basis, inline, min-inline, max-inline); `h`/`size`/`block` have no `--container` (so they're correctly left out)
- S:29 `max-w-md` 12px, not 28rem → tokens.css:586; tailwindcss/theme.css:337
- S:29 `font-mono` becomes the DS stack → theme.css:100; it's the only key theme.css shares with tailwindcss/theme.css (`comm`)
- S:29 `2xl`+ unchanged → theme.css has no `--spacing-2xl`
- S:29 the grep command → ran it on a sample: it matches `max-w-md`, `w-xl`, `min-inline-sm`, `basis-lg`, and not `max-w-2xl`, `p-md`, `max-w-xxl`, `size-md`, `md:w-full`
- S:29 no typecheck or build reports it → recorded scratch app (typecheck and build exit 0)
- S:30 DS font defaults on `:root, .light`, never `.dark` → tokens.css:35-36, :409-420; no `font` in the `.dark` block (:765-938)
- S:30 fallback to system-ui; a missing axis is ignored silently → tokens.css:409-414; Text/constants.ts:79-83
- S:30 `:root`-only mapping reverts inside `.light` → follows from :35-36 (`.light` redeclares); recorded browser probe
- S:31 root import is server-safe → add-use-client.mjs stamps only chunks containing client modules; recorded `grep -c "use client" dist/index.js` = 0
- S:31 no function props from a Server Component except `"use server"`; error text → recorded scratch builds neg-a/b/d
- S:31 `Shapes` keys vs shape components → Shapes/constants.ts:5; shapePaths.ts:23 (`ShapeInput = DsShapeComponent | Shapes`); ShapeMorphSpinner.tsx:39; recorded `/neg-d` vs `/ok-d`
- S:31 server-safe `Button` with `onClick` fails too → Button.tsx has no directive; recorded `/neg-a`
- S:32 a const from a client file is a reference at render → recorded `/neg-c` TypeError
- S:32 every exported const, variant function and util is server-safe → generated block line 71 (only `useToast`), fresh per lint
- S:33 init-skills overwrites and never deletes → bin/init.mjs:155 (`cp … force: true`), no rm anywhere
- S:37 `next typegen` / global `LayoutProps` from Next.js 15.5; raw tsc error text → Next.js 15.5 release notes (typegen and route-type helpers); recorded scratch app
- S:38 build prerenders only static routes; dynamic errors only on request → recorded `/dyn-neg`
- S:47-49 rationalization quotes → recorded SCORES.md references (baseline transcripts)

### fonts-and-preset.md
- F:5 no font files or `@font-face` → as S:8
- F:9-15 family per role → tokens.css:409-420
- F:9-15 weights (body 400, button 500, CTA 600, heading 600, label 400, title/hero 700, mono 500) → tokens.css:446-461
- F:9-11, :15 axes (body GRAD 19, button/heading GRAD 11, wdth 100, ROND 100, slnt 0; mono `MONO 1`) → tokens.css:464-471
- F:12-14 label/title/hero set no axes → index.css `.text-style-label/title/hero` have no `font-variation-settings`
- F:17 `BaseText` `fontWeight` and `axes` props → BaseText.tsx:85-96; Text/constants.ts:89-100
- F:17 Flex defaults GRAD 0, ROND 0 → ds-consumer-template next font-data.json (GRAD default 0, ROND default 0)
- F:23-26 axis ranges for all four families → font-data.json (exact matches: Flex GRAD 0-100, ROND 0-100, opsz 6-144, slnt -10-0, wdth 25-151, wght 1-1000; Code MONO 0-1, wght 300-800; Host wght 300-800; Bricolage opsz 12-96, wdth 75-100, wght 200-800)
- F:24 request MONO as a range → .storybook/preview-head.html:21-28
- F:34-37 next/font block (families exist, axes valid) → font-data.json; recorded scratch build exit 0
- F:42 `opsz` matters because Text sets `font-optical-sizing: auto` → index.css:250, :259, :275, :285, :298, :321, :330, :350
- F:42 `next build` font-override warning → recorded build logs
- F:47-49 `<link>` URLs → preview-head.html:10, :18, :28 (same axes; the Bricolage/Host URL is a superset); recorded curl HTTP 200
- F:52 links load under the DS family names → tokens.css:409-420 name the same families
- F:56-68 mapping block, unlayered beats DS defaults → tokens.css:15-21
- F:70 `:root, .light` reasoning; font tokens have no dark value → as S:30
- F:74 preflight sets the system stack on `<html>`, no background → index.css:1 imports full `tailwindcss` (preflight)
- F:86 Text components set their own role font → index.css `.text-style-*` `font-family: var(--ui-font-<role>)`
- F:90 `@theme inline`, names resolve to `var(--ui-…)` → theme.css:20 (only the "every token" part is FALSE, above)
- F:91 where names collide, DS wins → lookup order in lib.js; theme.css:100
- F:94 container values 20/24/28/32/36rem → tailwindcss/theme.css:335-339
- F:94 DS values 6/8/12/16/20px → tokens.css:583-588
- F:95 `font-mono` row → theme.css:100
- F:97 unchanged: 2xl+, `text-sm`, `rounded-md`, `shadow-md`, `md:`, `@md:` → theme.css defines no `--text-sm/--radius-md/--shadow-md/--breakpoint-*/--container-*` (grep)
- F:99 new names `p-md`, `gap-md`, `m-md`, `h-md`, `size-md`, `inset-md`, `translate-x-md`; rg 10, xxs 4, xxxs 2, xxl 26, xxxl 42 → lib.js (`h` = `--height,--spacing`, `size` = `--size,--spacing`, `gap` = `--gap,--spacing`); tokens.css:581-590
- F:103-106 escape hatches → Tailwind still emits `--container-md` (tailwindcss/theme.css:337); recorded rig

### client-references.md
- C:3 `dist/index.js` has no directive; exports come from chunks; a chunk with `"use client"` as its first line makes client references → add-use-client.mjs:1-19; dist/index.js format (`import { … } from "./chunk-….js"`, checked on the local dist)
- C:3 `buttonVariants`, `tabTriggerVariants`, `cn`, `resolveDsColor`, `DS_COLOR_TOKENS` are server-safe → Button.tsx and Tabs.tsx have no directive; src/index.ts:47-48 (utils)
- C:7-11 render with serialisable props, no function props, Server Action exception, Button too, `useToast` is a hook, `shapes` keys → as S:31; Toast.tsx:344 (`function useToast`)
- C:15-42 pricing example → `BodyText` with `as`, `ButtonVariant.secondary` exist (Button/constants.ts:8-15); recorded `/pricing` build
- C:48 "328 runtime exports: 65 client references, 263 server-safe" → generator fresh (lint docs-fresh passes); the table rows add up to 65
- Spot-checked rows (5 + useToast):
  - `CopyButton` → CopyButton.tsx carries `"use client"`
  - `Input` → Input.tsx:84 `"use client"` (first statement, after the header comment); allowlisted check-conventions.mjs:176
  - `Slider`: `SliderContinuous`, `SliderLabeled`, `SliderStepped` → Slider/index.ts:1, Slider.tsx has the directive; `SliderVariant` (constants.ts) is correctly absent
  - `Toast`: 7 components + `useToast` → Toast/index.ts:1-10, Toast.tsx has the directive; `ToastVariant` correctly absent
  - `VerificationCode`: only `VerificationCodeInput` → VerificationCodeInput.tsx:26 directive; `CodeDigitInput` has none and is correctly in the server-safe list
  - Server-safe list includes `Button`, `Tabs`, `Tooltip`, `ShapeMorphSpinner` → no directive in those files; ShapeMorphSpinner passes `Shapes` keys (ShapeMorphSpinner.tsx:21-27)
- C:71 only `useToast` is a non-component client export → generated, fresh
- C:79 Radix-wrapping server-safe components keep their client part behind its own boundary → recorded `/server-safe` build
- C:83 how to check one name in the installed copy → dist/index.js format as above

### README.md
- R:3-5 components, `--ui-*` tokens, Tailwind v4 preset, skills → src/index.ts; tokens.css; theme.css:2; package.json:44
- R:7-8 Storybook and npm URLs → accepted recorded browser checks; .github/workflows/deploy-storybook.yml exists
- R:15, :18 install; React 19 peer → package.json:2, :64-67
- R:22-29 import order → theme.css:6-11; bin/init.mjs:180-183
- R:31-38 no Tailwind: styles.css from JS entry or global CSS → theme.css:17; bin/init.mjs:175-177; package.json:26
- R:40-42 theme.css registers tokens; `p-md`, `bg-primary` → theme.css:21, :117
- R:42-43 registers `xs`…`xl`; Tailwind reads them before container widths → theme.css:114-119; lib.js lookup order
- R:44 `max-w-md` 12px, not 28rem → tokens.css:586; tailwindcss/theme.css:337
- R:44-46 `w`, `min-w`, `basis`, `inline`, `min-inline`, `max-inline` too → lib.js
- R:46 `font-mono` → Google Sans Code stack → theme.css:100; tokens.css:418-420
- R:49 package loads no fonts → as S:8
- R:49-53 four default faces by role → tokens.css:409-420
- R:50-53 four specimen links → accepted recorded browser check
- R:54-55 Flex axes GRAD, ROND, opsz, slnt, wdth, wght → tokens.css:464-466 + `font-optical-sizing` + weights; matches setup F:34 and F:47
- R:55 Bricolage opsz → matches setup F:37; title/hero leave `font-optical-sizing` at its initial value `auto`
- R:55 Google Sans Code MONO, `MonoText` sets the fixed-pitch cut → tokens.css:467-471; BaseText.tsx:175
- R:56-57 setup skill has details; each role is an overridable token → fonts-and-preset.md; tokens.css:407-408
- R:59 dark mode via `dark` class on `<html>`, app sets it → tokens.css:9-13
- R:60-61 `data-ds-expression="practical"` on `<html>` turns off the caret shape → tokens.css:939-962
- R:64-66 `Button`, `ButtonVariant.primary` → src/index.ts:2; Button/index.ts:1-2; Button/constants.ts:8-9; Button.tsx:191 (renders through BaseText)
- R:69-70 setup skill covers axes, server components, checks → setup SKILL Rules 3-5, Verify
- R:75 `npx … init-skills` → package.json:17-19
- R:78-79 copies into `.agents/skills`, `.claude/skills`, `.agent/skills`, asking about each → bin/init.mjs:80-96, :131-142
- R:80 `--yes` → all three without asking → bin/init.mjs:44, :60-63
- R:80 changes no other files → bin/init.mjs:16-19, only `mkdirSync`/`cp` into targets
- R:82-90 five skills and their scopes → `ls skills/`; usage components.md and theming token-contract.md are generated; token-contract covers all 291 tokens.css names (`comm` → 0 missing)
- R:88-90 v3/v5 migration skills = upgrades across those majors → their frontmatter (v2→v3, v4→v5)
- R:92 CHANGELOG link → CHANGELOG.md exists
- R:96 MIT; LICENSE.txt link → package.json:6; LICENSE.txt:1
- R:96 third-party icon sources listed → THIRD_PARTY_NOTICES.md:8-42
- R:104-105 CONTRIBUTING.md, AGENTS.md exist → `ls`
- (README relative skill links: all five `skills/*/SKILL.md` exist, including setup)

### AGENTS.md
- A:3 code and skills are the source of truth; `docs/future/` is proposals → docs/future/ holds only responsive-type.md, line 3 "Not implemented. Not current behaviour"
- A:3 nothing in `docs/audit/` is current guidance → maintainer decision (the pass's working records)
- A:5-23 file contracts → same text as the injected project instructions (verbatim)
- A:25 `$name` = `.agents/skills/<name>/SKILL.md` → every named skill has a dir with SKILL.md (`ls .agents/skills/`)
- A:27 Text component, `as` for roots, no bare element or font utility → writing-components SKILL.md rule "Text always goes through a Text component…" (lint checks named there); matches the maintainer decision (props only)
- A:28 DS owns no data, fetching, timers, control; state as props → writing-components SKILL.md:8, rules row 1
- A:29 `"use client"` only when the module needs it; never on `constants.ts` or a thin Radix wrapper → writing-components SKILL.md rules row 2; allowlist check-conventions.mjs:145-202
- A:30 no hard-coded colour/spacing/radius/shadow/motion; token-only; flourishes switch off under practical → dooph-ds-styling SKILL.md:8
- A:31 dark-only values are `.dark` lines in tokens.css → dooph-ds-editing-tokens SKILL.md rule 1
- A:32 a new component is one change: files, constants, exports, stories, lint → dooph-ds-adding-a-component SKILL.md:8-12
- A:33 where a file lives / generated → dooph-ds-codebase-map SKILL.md:8, generated table
- A:34 geometry is plain numbers in TS; clocks in CSS tokens → dooph-ds-loading-indicators SKILL.md:8
- A:35 migration skill only when asked, from built-tree diff → dooph-ds-writing-version-migrations SKILL.md:10, rules 1-2
- A:36 surface every design decision in the hand-back → writing-components SKILL.md:8, :10, hand-back "Decisions" slot; codebase-map rule "Flag broken arithmetic in the hand-back"
- A:40 `npm run lint` = `tsc --noEmit` then check-conventions.mjs → package.json:61
- A:40 lint fails on any stale generated file in the table → check-conventions.mjs:679-713 (theme-fresh, icons-fresh, shape-morph-ease-fresh, docs-fresh, skills-mirrored, each calling the generator's `--check`, :132-138)
- A:40 must exit 0 → ran: exit 0
- A:46 index.css generated block, theme.css, twMergeTheme.ts ← `npm run sync-tokens` → package.json:54; sync-theme.mjs:50-55, :59-62, :76-77; markers index.css:89, :229
- A:47 Icons/index.ts ← `npm run generate-icon-exports` → package.json:49; generate-icon-exports.mjs:7, :67
- A:48 tokens.css `__SHAPE_MORPH_EASE_*__` block ← `npm run generate-shape-morph-ease` → package.json:50; generate-shape-morph-ease.mjs:15-17, :40; markers tokens.css:330, :333
- A:49 four doc outputs ← `node scripts/generate-docs.mjs` → generate-docs.mjs:714-719 (exactly these four); markers client-references.md:46, :77
- A:50 `.claude/skills/`, `.agent/skills/` ← sync-skills.mjs → sync-skills.mjs:6-7, :43-44
- A:42-50 the list is complete → the scripts that write tracked files are exactly these five generators (`grep writeFile scripts/`: add-use-client writes dist only, surface/surface-diff write only their out arg); dist/ is gitignored (.gitignore:5)
- A:54 edit only `.agents/skills/`; sync overwrites mirror edits → sync-skills.mjs:8-12, :32-33; mirrors are tracked real files (`git ls-files`)
- A:58 no commit/push/tag unless asked → maintainer decision; also writing-version-migrations rule 1
- A:59 no version change, `npm version`, `prep-release:*` → package.json:51-53; codebase-map rule; version-migrations rule 1
- A:60 build, build:watch, prepublishOnly rewrite tracked files and run no lint → package.json:57-58, :62 (generators that write Icons/index.ts, tokens.css, index.css, theme.css, twMergeTheme.ts; no lint); matches codebase-map rule 1

### CONTRIBUTING.md
- C:6 SECURITY.md link → file exists
- C:7 issues link → accepted recorded browser check; slug matches package.json:10, :12
- C:11-12 AGENTS.md holds agent rules and names a skill per job → AGENTS.md:25-36
- C:12-14 maintainer skills in `.agents/skills/`, consumer skills in `skills/` → `ls`; package.json:44; bin/init.mjs:29
- C:14 run `npm run lint` → package.json:61

### SECURITY.md
- S:9 do not open public issues (instruction, consistent with CONTRIBUTING:6)
- S:12 advisory URL slug correct → package.json:10; recorded check (Security tab loads with this policy)
- S:14 CONTRIBUTING.md link → file exists

---

## Old false-claims register (FINDINGS.md §4): reappearances

Grepped the FALSE/STALE roll-up (FINDINGS.md:6633-6822) for import order, theme.css/preset, max-w/container, font axes, MONO/opsz, init-skills, "use client", LICENSE, issues/advisory links, notices, generated files and build.

- **Reappears:** C-README-13 / C-THEME-3, "preset learns/registers every `--ui-*` token". It's back as fonts-and-preset.md:90 "It maps every DS token to a utility" (FALSE 1 above). The same claim also survives in the generated `src/styles/theme.css:13` header (from the sync-theme.mjs template), which is not in this batch.
- **Fixed, not reappearing:** C-README-5/6 (per-module "use client" preserved; createContext error): README no longer makes RSC claims, and the setup skill's are backed by scratch builds. C-README-10 (Flex axes only GRAD/ROND/wdth): README:54-55 now lists all six. C-README-12 (`rounded-standard`): absent. C-README-15 (LICENSE link): now `LICENSE.txt`, which exists. C-CONTRIBUTING-2 / C-SECURITY-2 (wrong slug): now `dooph.-design-system`. C-NOTICES-2 (3 of 14 runtime packages missing): all 14 `dependencies` are now listed. C-THEME-20 (token-contract not exhaustive): it now covers all 291 tokens.css names, so README:87 "full token list" holds.

## Cross-doc consistency

- **README vs setup skill:** they agree on import order (README:26-28 = SKILL:17-19 = theme.css:9-11 = bin/init.mjs:181-183), on the size-name takeover (same seven utilities, `xs`…`xl`, 12px vs 28rem, `font-mono`, `2xl`+ untouched) and on the font axes (README's Flex/Bricolage/Code axes match the next/font block F:34-37; the `<link>` F:47-49 requests a superset). README also offers `@import` of styles.css in global CSS for non-Tailwind apps, while the skill names only the JS entry. That's a superset, not a contradiction.
- **Setup skill vs usage skill:** usage SKILL.md:21 names only `w-*`, `max-w-*`, `min-w-*`, `basis-*` for the takeover, while setup and README add `inline-*`, `min-inline-*`, `max-inline-*`. Usage isn't wrong, just incomplete. Usage is out of this batch.
- **AGENTS.md vs maintainer skills:** the guardrails, the generated-files table and the "Never" list match `.agents/skills/` (codebase-map's generated table lists the same five generators and lint check names; its build rule names the same three scripts). No contradiction.
- **AGENTS.md:54 wording (ambiguity, not FALSE):** "Edit skills in `.agents/skills/` only" is under "Skill mirrors" and means maintainer skills. Read alone, it could suggest consumer skills in `skills/` are also edited there. They're edited in place and aren't mirrored. Optional fix: "Edit maintainer skills in `.agents/skills/` only (consumer skills in `skills/` have no mirror)…".
- **Maintainer decisions:** nothing in the batch contradicts them. Text is props-only through Text components (AGENTS:27). The DS owns no data or timers (AGENTS:28). `"use client"` follows the allowlist (AGENTS:29). Practical goes on `<html>` (README:61). Nothing claims responsive type or a v6 release.

## Fixes

- FALSE 1 (fonts-and-preset.md:90 "maps every DS token"): FIXED. Text now: "It maps the DS's colour, font-family, text-size, radius, shadow and spacing tokens to utilities (not every token: weights, font axes, tracking, icon sizes and component-only tokens have no utility), so those names resolve to `var(--ui-…)` and follow token overrides at runtime." The same false sentence in the theme.css header was corrected at its source, the template in scripts/sync-theme.mjs; `npm run sync-tokens` regenerated; the only diff in src/styles is the theme.css header comment; `node scripts/sync-theme.mjs --check` exit 0 (137 tokens mapped, unchanged).
- FALSE 2 (README:96-97 "bundled dependencies"): FIXED. README now reads "Third-party icon sources, runtime npm dependencies and vendored or compiled-in code are listed in THIRD_PARTY_NOTICES.md". THIRD_PARTY_NOTICES.md: the npm section no longer says "bundled or linked" (it says installed from npm and imported at runtime, not copied into the package's files), and a new "Compiled-in CSS" section credits Tailwind CSS (MIT, Copyright (c) Tailwind Labs, Inc., text verbatim from node_modules/tailwindcss/LICENSE) and tailwindcss-animate (MIT, Copyright (c) 2020 Jamie Kyle, from node_modules/tailwindcss-animate/LICENSE; its utilities are in dist/styles.css via `@plugin` in src/styles/index.css:14). No other third-party CSS is imported by src/styles/*.css (build.css imports index.css only; index.css imports tailwindcss, tokens.css, dooph-component-tokens.css).
- UNVERIFIABLE 1 (SECURITY.md private vulnerability reporting): FIXED by rewording so it is true either way: named "private vulnerability reporting" with the link, plus a fallback of opening an issue that says only that a security report exists (no details), after which the maintainer arranges a private channel. No address invented: package.json has no author/bugs/email and no other doc holds one.

## Fix verification

Verified 2026-10-11, read-only. `npm run lint` exit 0 ("conventions: 30 checks passed"); `node scripts/sync-skills.mjs --check` exit 0; `node scripts/sync-theme.mjs --check` exit 0 ("index.css, theme.css and utils/twMergeTheme.ts are fresh").

- **FALSE 1 (fonts-and-preset.md:90): VERIFIED.** New sentence lists colour, font-family, text-size, radius, shadow and spacing and says weights, font axes, tracking, icon sizes and component-only tokens have no utility. That matches theme.css (--color/--font/--text/--radius/--shadow/--spacing only) and the sync-theme.mjs EXCLUDED set (weights at :111-119, and the font-var, tracking and icon groups). The regenerated theme.css header (lines 12-19) says the same, and `git diff --stat src/styles` shows only theme.css changed (6 insertions, 3 deletions). The header's "(plus a few named aliases)" matches ALIASES in sync-theme.mjs.
- **FALSE 2 (README.md:96-97 and THIRD_PARTY_NOTICES.md): VERIFIED.** README now says "runtime npm dependencies and vendored or compiled-in code". The npm section now says the packages are installed from npm and imported at runtime, not copied in; package.json `dependencies` has 14 entries and the table has 14 rows. The new Compiled-in CSS section is true: src/styles/build.css imports index.css, which imports `tailwindcss` (preflight) and loads `@plugin "tailwindcss-animate"` (index.css:14). The two licence texts are byte-identical to node_modules/tailwindcss/LICENSE and node_modules/tailwindcss-animate/LICENSE (diffed after CRLF normalisation; copyright lines match: "Tailwind Labs, Inc." and "2020 Jamie Kyle").
- **UNVERIFIABLE 1 (SECURITY.md:11-13): STILL FALSE.** The reworded text still tells readers to "Use GitHub's private vulnerability reporting", links the advisory form, and says it is "also under 'Report a vulnerability' on the repository's Security tab". I queried the GitHub API unauthenticated (`GET /repos/dooph-software/dooph.-design-system/private-vulnerability-reporting`) and it returned `{"enabled":false}`. So the feature the paragraph points to is off, and the form and the Security-tab button do not exist. The fallback sentence ("If that form is not available to you, open an issue ...") is true, but the text above it asserts the feature. Fix: either the maintainer turns on Settings > Code security > Private vulnerability reporting, or SECURITY.md drops the form link and the Security-tab sentence and keeps only the open-an-issue-with-no-details route.

Counts: 2 VERIFIED, 1 STILL FALSE.
