# Claims: README.md

One factual claim per line, with its evidence. R = `README.md` at the repo root. Line numbers are for the working tree on 2026-10-11.

## What the package is
- R: ships React components, `--ui-*` tokens and a Tailwind v4 preset. Evidence: src/index.ts:2-44 (component re-exports); src/styles/tokens.css:1-32 (token layer); src/styles/theme.css:1-18 ("Tailwind v4 theme preset"); package.json:20-28 (`.`, `./styles.css`, `./theme.css`).
- R: ships agent skills for setup, usage and theming. Evidence: package.json:44 (`skills` in `files`); `ls skills/` (usage, theming, v3/v5 migration); `dooph-design-system-setup` is being written by a sibling task in parallel (not on disk at time of writing).
- R: Storybook is at https://dooph-software.github.io/dooph.-design-system/. Evidence: .github/workflows/deploy-storybook.yml (GitHub Pages deploy, `STORYBOOK_BASE_PATH: /${{ github.event.repository.name }}/`); browser: the URL loads, title "storybook - Storybook". The mixed-case path `/dooph.-Design-System/` 404s.
- R: npm page link. Evidence: browser: https://www.npmjs.com/package/@dooph-software/design-system loads, title "@dooph-software/design-system - npm".

## Install
- R: `npm install @dooph-software/design-system`. Evidence: package.json:2 (name), :13-16 (public registry).
- R: React 19 or later, `react` and `react-dom`, is a peer dependency. Evidence: package.json:64-67.

## Set up
- R: Tailwind v4 apps import `tailwindcss`, then `styles.css`, then `theme.css`. Evidence: src/styles/theme.css:6-11 (generated header, from scripts/sync-theme.mjs); package.json:26-27.
- R: apps without Tailwind import only `styles.css`, either from the JS entry (`app/layout.tsx`, `src/main.tsx`) or with `@import` in global CSS. Evidence: src/styles/theme.css:17 ("Apps that do not use Tailwind can ignore this file"); bin/init.mjs:176-183 (prints the import and those entry examples); scripts/emit-css.mjs:5-8, 22 (styles.css is a compiled stylesheet, needing no consumer Tailwind).
- R: `theme.css` registers DS tokens so `p-md` and `bg-primary` resolve to them. Evidence: src/styles/theme.css:13-17, :21 (`--color-primary`), :117 (`--spacing-md`).
- R: it registers spacing names `xs`, `sm`, `md`, `lg`, `xl`. Evidence: src/styles/theme.css:112-121 (also `xxxs`, `xxs`, `rg`, `xxl`, `xxxl`, which do not collide with Tailwind's container names).
- R: Tailwind reads `--spacing-*` before `--container-*` for `max-w`, `w`, `min-w`, `basis` and `inline`. Evidence: node_modules/tailwindcss/dist/lib.js (tailwindcss 4.3.3, minified): `["max-w",["--max-width","--spacing","--container"]`, `["w",["--width","--spacing","--container"]`, `["min-w",["--min-width","--spacing","--container"]`, `["basis",["--flex-basis","--spacing","--container"]`, `["inline",["--spacing","--container"],"inline-size"]` (also `min-inline`, `max-inline`).
- R: `min-inline-*` and `max-inline-*` change the same way. Evidence: node_modules/tailwindcss/dist/lib.js: `["min-inline",["--spacing","--container"],"min-inline-size"]`, `["max-inline",["--spacing","--container"],"max-inline-size"]`.
- R: `font-mono` becomes the Google Sans Code stack. Evidence: src/styles/theme.css:100 (`--font-mono: var(--ui-font-mono)`); src/styles/tokens.css:418-420.
- R: `max-w-md` becomes 12px instead of 28rem. Evidence: src/styles/tokens.css:586 (`--ui-spacing-md: 12px`); node_modules/tailwindcss/theme.css:337 (`--container-md: 28rem`). Maintainer intent: docs/audit/doc-refresh.md:63-68.
- R: the package loads no fonts. Evidence: src/styles/tokens.css:407-408 ("Consumers load fonts"); `grep -c font-face dist/styles.css` = 0; no `@font-face` or font URL under src/styles.
- R: default faces by role: Google Sans Flex (body, button, heading), Host Grotesk (label), Bricolage Grotesque (title, hero), Google Sans Code (mono). Evidence: src/styles/tokens.css:409-420.
- R: Google Sans Flex should be loaded with GRAD, ROND, opsz, slnt, wdth, wght. Evidence: src/styles/tokens.css:464-466 (`--ui-font-var-button/body/heading` set wdth, GRAD, ROND, slnt); src/styles/index.css:249, 258, 274, 284, 320, 329, 349 and dooph-component-tokens.css:848, 856 (`font-optical-sizing: auto` uses opsz); tokens.css:446-461 (weights 400 to 700 by role, through wght); src/components/Text/constants.ts:76-99 (FontAxis lists these; "Google Sans Flex has all of these").
- R: Bricolage Grotesque should be loaded with opsz. Evidence: src/components/Text/constants.ts:80 ("Bricolage Grotesque has opsz/wght"); src/styles/index.css:312-316 and :336-341 (the title and hero roles set no `font-optical-sizing`, so the CSS initial value `auto` applies and the browser picks opsz from the font size, but only if the loaded font carries the axis; there is no `font-optical-sizing: none` anywhere under src/styles). Requested by the setup skill, per the coordinator.
- R: Google Sans Code should be loaded with MONO, which MonoText sets to its fixed-pitch cut. Evidence: src/styles/tokens.css:467-471 (`--ui-font-var-mono: "MONO" 1`; 1 = fixed pitch); src/styles/index.css:295-301 (`.text-style-mono` applies it); src/components/Text/BaseText.tsx:172 (MonoText is the mono role).
- R: each role is a `--ui-font-*` token you can override. Evidence: src/styles/tokens.css:407-408.
- R: the four Google Fonts specimen links. Evidence: browser: each loads with the family name as its `h1` (Google Sans Flex, Host Grotesk, Bricolage Grotesque, Google Sans Code).
- R: dark mode follows a `dark` class on `<html>`, set by the app. Evidence: src/styles/tokens.css:9-12 (`.dark` on the app root, typically `<html>`; no `prefers-color-scheme` remapping; the app's theme provider decides).
- R: `data-ds-expression="practical"` on `<html>` turns off expressive details such as the dropdown caret's shape. Evidence: src/styles/tokens.css:951-962 (practical preset sets `--ui-caret-shape-scale: 0`, `--ui-caret-nudge: 0`; "put the attribute on the root element"); doc-refresh.md:74-81.
- R: `import { Button, ButtonVariant }` and `<Button variant={ButtonVariant.primary}>Save</Button>`. Evidence: src/index.ts:2; src/components/Button/index.ts:1-2; src/components/Button/constants.ts:8-9; Button.tsx:14-16 (root renders through BaseText, so plain text children get the button role).

## Agent skills
- R: `npx @dooph-software/design-system init-skills`. Evidence: package.json:17-19 (`bin.init-skills`); bin/init.mjs:6.
- R: copies the skills into `.agents/skills`, `.claude/skills`, `.agent/skills`, asking about each. Evidence: bin/init.mjs:80-96 (TARGETS), :131-142 (one prompt per target), :151-158 (copy).
- R: `--yes` installs into all three without asking. Evidence: bin/init.mjs:9, :44, :60-63.
- R: it changes no other files. Evidence: bin/init.mjs:16-19 ("does NOT: modify any project files, configure frameworks, fonts or Tailwind, install dependencies").
- R: usage skill has a full component reference; theming skill has the full token list. Evidence: skills/dooph-design-system-usage/references/components.md, skills/dooph-design-system-theming/references/token-contract.md (both generated by scripts/generate-docs.mjs).
- R: v3 and v5 migration skills cover upgrades across those majors. Evidence: skills/dooph-design-system-v3-migration/SKILL.md:3 (v2 → v3); skills/dooph-design-system-v5-migration/SKILL.md:3 (v4 → v5).
- R: release notes are in the CHANGELOG. Evidence: CHANGELOG.md exists.

## Licence and contributing
- R: MIT. Evidence: package.json:6; LICENSE.txt:1 ("MIT License").
- R: third-party icon sources and bundled dependencies are in THIRD_PARTY_NOTICES.md. Evidence: THIRD_PARTY_NOTICES.md:8-42 (icon libraries), :46-60 (npm dependencies); package.json:46 (shipped).
- R: CONTRIBUTING.md and AGENTS.md exist. Evidence: `ls` at the repo root.

- R: the dooph. name and logo are not covered by the MIT licence and remain trademarks of Dooph LLC. Evidence: kept from the old README (`git show HEAD:README.md`:209, which named "dooph software"), with the entity changed to match LICENSE.txt:3 ("Copyright (c) 2026 Dooph LLC"), as the coordinator directed. The statement itself is the maintainer's, not derived from code.

## Links checked
Relative (exist on disk): skills/dooph-design-system-usage/SKILL.md, skills/dooph-design-system-theming/SKILL.md, skills/dooph-design-system-v3-migration/SKILL.md, skills/dooph-design-system-v5-migration/SKILL.md, CHANGELOG.md, LICENSE.txt, THIRD_PARTY_NOTICES.md, CONTRIBUTING.md, AGENTS.md. NOT YET: skills/dooph-design-system-setup/SKILL.md (sibling task writes it).
External (browser): Storybook, npm page, four Google Fonts specimens. All load.

## IP disclaimer (added by the AGENTS, CONTRIBUTING and SECURITY task)
- R:10 the italic disclaimer reserving the trade name, brand names, wordmarks and logomarks. Evidence: `git show 0dac153:README.md` line 9, copied verbatim except the owning entity: "we use at dooph." became "we use at Dooph LLC.", "rights to dooph intellectual property" became "rights to Dooph LLC intellectual property", and "any and all dooph. intellectual property" became "any and all Dooph LLC intellectual property". The trade name "dooph." and "dooph. products" are brand names, not the entity, so they stay. The entity matches the README trademark line ("trademarks of Dooph LLC"), which the maintainer chose to keep.

## Claim-check fix (batch 5)

- R:96-97 (reworded): third-party icon sources, runtime npm dependencies and vendored or compiled-in code are listed in THIRD_PARTY_NOTICES.md. Evidence: the 14 npm packages are `dependencies`, imported from node_modules (not bundled); the vendored shape-morph engine is listed; `dist/styles.css` starts with `/*! tailwindcss v4.3.3 | MIT License */` and carries tailwindcss-animate utilities (`animate-in` etc., from `@plugin "tailwindcss-animate"` in src/styles/index.css:14), so THIRD_PARTY_NOTICES.md now has a "Compiled-in CSS" section with both MIT licence texts (copied from node_modules/tailwindcss/LICENSE and node_modules/tailwindcss-animate/LICENSE). No other third-party CSS is imported by src/styles/*.css.
