# Claim check, batch 7: theming skill and the responsive-type proposal

A fresh, read-only check, run against the working tree on 2026-10-11. It covers:
- `skills/dooph-design-system-theming/SKILL.md`
- `skills/dooph-design-system-theming/references/overrides.md`
- `skills/dooph-design-system-theming/references/token-contract.md`. This file is generated, so I did not split it into claims. I checked that it is fresh and that the other two docs agree with it.
- `docs/future/responsive-type.md`. This is a proposal, so I checked only its claims about current behaviour and how clearly it is labelled.

The theming skill ships to consuming apps. Its reader has only the installed package, so any pointer to `src/` or to a repo script is false for that reader. I accepted the browser facts recorded in `docs/audit/_work/docs-pass/theming-proof.md` wherever a doc relies on them, and I cite them by case ID (S1–S9, G1–G4, A1–A3, M*, MR*, E*, F1/F2, R1/R2, WA1/2, W0–W2, P1, O1). I re-derived from the code every claim that the repo itself can settle.

`node scripts/generate-docs.mjs --check` printed "generated doc references are fresh." and exited 0. A script cross-check of the token contract found these things:
- It has 291 token rows. That equals the 291 distinct `--ui-*` names declared in `src/styles/tokens.css`, with no name missing on either side.
- No alias or derived token whose Dark column says `same` reads a token that changes in dark.
- No token marked `repeated` reads a token that stays the same in dark.

## Summary

| Doc | Claims | TRUE | FALSE | UNVERIFIABLE |
|---|---|---|---|---|
| theming SKILL.md | 45 | 43 | 2 | 0 |
| theming references/overrides.md | 50 | 48 | 2 | 0 |
| theming references/token-contract.md (generated; freshness and pointers only) | 3 | 2 | 1 | 0 |
| docs/future/responsive-type.md (current-behaviour claims only) | 13 | 11 | 2 | 0 |
| **Total** | **111** | **104** | **7** | **0** |

No statement goes beyond the theming proof on override scoping, `.dark`/`.light` islands, `<html class="dark">`, aliases or reduced motion. Each one maps to a recorded case. The one exception is the alias wording, which skips `--ui-caret-nudge`; see FALSE #2 and #4. The proof did not check the portal remedies in a browser. Those statements are TRUE on code evidence, and overrides.md:3 should stop claiming a browser check for them (FALSE #3).

---

## FALSE

### 1. SKILL.md:8, "Every DS colour, size and motion value is a `--ui-*` custom property"

- **Claim (verbatim):** "Every DS colour, size and motion value is a `--ui-*` custom property in `@dooph-software/design-system/styles.css`."
- **Evidence:** the shipped CSS contains sizes that are not tokens. Examples:
  - `outline: 2px solid …; outline-offset: 2px` (src/styles/dooph-component-tokens.css:128-129)
  - 1px hairline borders and padding (dooph-component-tokens.css:898, :913, :931)
  - `+ 1px` in the caret geometry (src/styles/index.css:1016, :1020)
  - Tailwind's fixed scale in component classes, such as `border` (1px) and `-my-px` (DropdownCaret.tsx:63)

  A consumer can't retune any of these through a token.
- **Fix:** "The DS's colours, type, spacing, radii, shadows, component sizes and motion are `--ui-*` custom properties in `@dooph-software/design-system/styles.css` (hairline borders and a few fixed offsets are not)."

### 2. SKILL.md:39, "resolves where the DS declares it: in `:root, .light`"

- **Claim (verbatim):** "A token that reads another one (Alias `alias` or `derived`) resolves where the DS declares it: in `:root, .light`, and again in `.dark` when marked `repeated`."
- **Evidence:** one alias breaks this. `--ui-caret-nudge: var(--ui-shape-morph-nudge)` is declared on `:root` only (tokens.css:939-947), not on `.light`. The token contract marks it `alias` (token-contract.md:574). Overriding `--ui-shape-morph-nudge` on `.light` or on a wrapper therefore doesn't reach the caret nudge, even inside a `.light` element. Proof E5 shows only the `:root` case.
- **Fix:** append "(the two expression tokens are declared on `:root` only, so `--ui-caret-nudge` re-resolves only on `<html>`)". This is a minor fix. It doesn't change any recipe.

### 3. overrides.md:3, "Every rule in the theming skill was checked in a browser"

- **Claim (verbatim):** "Every rule in the theming skill was checked in a browser against the built `styles.css`."
- **Evidence:** the proof did not check every rule in a browser.
  - **Portals:** proof P1 only shows that a plain `<body>` child reads light tokens and a `.dark` one reads dark tokens. Three rules have no browser case: `portalProps={{ container }}`, `portal={false}`, and "the island class on `className` misses the backdrop". They are true from the code: dialogShell.tsx:93-106 renders the overlay and the panel as siblings inside the portal, and node_modules/@radix-ui/react-portal/dist/index.mjs:16 uses `container`.
  - **Caret:** the proof measured the caret's token values (E1-E3), not the rendered shape.
  - **Transitions:** the "1ms, not 0ms" rule comes from the spec and from the code (RevealChangeText.tsx:28, :130-241), not from a browser.
- **Fix:** "Every cascade rule in the theming skill (selectors, layers, aliases, reduced motion, the expression preset) was checked in a browser against the built `styles.css`. The portal remedies follow from the component code."

### 4. overrides.md:28, "The DS declares its aliases in its light block (`:root` and `.light`)"

- **Claim (verbatim):** "The DS declares its aliases in its light block (`:root` and `.light`)."
- **Evidence:** this is the same exception as #2. `--ui-caret-nudge` is an alias declared only in the `:root` expression block (tokens.css:939-947).
- **Fix:** "The DS declares its aliases in its light block (`:root` and `.light`), except `--ui-caret-nudge`, which sits on `:root` only with the other expression token."

### 5. token-contract.md:1, :5 (generated), pointers into the repo

- **Claim (verbatim):** ":5 Every custom property declared in `src/styles/tokens.css` … Generated by `scripts/generate-docs.mjs`; `npm run lint` fails when this file is out of date." Line :1 says "GENERATED by scripts/generate-docs.mjs", and :23 says "in tokens.css".
- **Evidence:** this file ships in the package, under `skills/` (package.json `files`). The installed package contains no `src/styles/tokens.css`, `scripts/generate-docs.mjs` or `npm run lint`, because `files` holds only dist, skills, bin and THIRD_PARTY_NOTICES.md. For the consumer reader, all of these pointers are false. The text comes from the generator, at scripts/generate-docs.mjs:499 and :512.
- **Fix (in the generator, then regenerate):** ":5 Every `--ui-*` custom property the DS declares in `styles.css`, under the DS's own section headings and in its order." Drop the generator and lint sentence from the shipped text, or move it into the HTML comment on line 1. ":23 … for a token marked `/* expression */` in the DS's token source" can become "… for an expression token (set by the practical preset)".
- **Not a fix:** freshness is TRUE (`--check` passes). The SKILL.md and overrides.md statements about this file also agree with it: the Dark legend (`same`, `repeated`) at token-contract:17-18 matches SKILL:66, the Alias legend at :20 matches SKILL:67, and the Light/Dark values cited in overrides.md:43-60 match rows :62-67 and :550.

### 6. responsive-type.md:6, "So nothing can make a title smaller on a phone. An app's only workarounds are …"

- **Claim (verbatim):** "So nothing can make a title smaller on a phone. An app's only workarounds are rendering two copies and hiding one per breakpoint …, or reading the window width in JS …"
- **Evidence:** a role's size is a token read at paint time, in two places:
  - `.text-style-title { font-size: var(--ui-text-title) }` (src/styles/index.css:313-316)
  - the `FontSizes` consts, which are `var(--ui-text-*)` strings (src/components/Text/constants.ts:45-52)

  The theming skill, for its part, documents unlayered `--ui-*` overrides. A consumer rule such as `@media (width < 40rem) { :root, .light { --ui-text-title: 28px } }` therefore shrinks titles on a phone today. It is a global, per-role lever, not a per-instance one, and no doc sanctions or forbids it.
- **Fix:** "Props can't change per breakpoint, so no single Text instance can change size with the width. The one width-dependent lever today is overriding a role token (e.g. `--ui-text-title`) inside a media query in app CSS. That changes every title at once and is not a documented pattern. Short of that, an app's workarounds are rendering two copies … or reading the window width in JS …"
- **Maintainer decision needed:** should the usage or theming skill name this lever as allowed or forbidden? usage SKILL.md:18 lists only className utilities, hidden copies and JS width checks as the workarounds to avoid.

### 7. responsive-type.md:6, "(double DOM, both read by screen readers)"

- **Claim (verbatim):** "rendering two copies and hiding one per breakpoint (double DOM, both read by screen readers)"
- **Evidence:** the usual way to hide one copy per breakpoint is Tailwind's `hidden` / `md:hidden`, which is `display: none`, and `display: none` removes the element from the accessibility tree. Screen readers read both copies only when the hidden one stays in the tree, for example under `opacity`, `visibility` or off-screen hiding.
- **Fix:** "(double DOM: the text ships twice, and any copy hidden by anything other than `display: none` is read twice by screen readers)".

## UNVERIFIABLE

None.

---

## TRUE (claim → evidence)

### theming SKILL.md
- :8 the app themes by overriding `--ui-*` in its global CSS → tokens.css:20-22 header; proof S1-S9
- :8 token-contract.md lists every token → 291 rows = 291 distinct names in tokens.css (script diff empty)
- :10 setup covers imports, fonts and the preset; usage covers tokens in `className` → setup SKILL:8-30; usage SKILL:20
- :14 two layers: `ds.tokens` (defaults, dark, reduced motion), then `ds.expression` → tokens.css:1, :33 (layer opens), :765 `.dark`, :923 reduced-motion block, :949 (layer closes), :957-962
- :14-16 unlayered CSS beats both, whatever the import order or specificity → CSS cascade layers; proof O1 (a `<style>` before the DS sheet gives the same result); tokens.css:14-22
- :18 an override inside `@layer base` changes nothing → proof S7 (with the setup's import order, `theme, base, …` comes before `ds.tokens`, proof:8)
- :19 a `node_modules` edit is lost on reinstall, and a hex in `className` ignores dark mode → rule; consistent with usage SKILL:20
- :20 reduced motion is a layered `!important` that beats your `!important` → tokens.css:923-933; proof M5
- :24 dark is the `dark` class, and the DS has no `prefers-color-scheme` rule → tokens.css:9-13; no `prefers-color-scheme` in src/**/*.css|ts|tsx; no `dark:` variant in src (non-stories)
- :25 `dark` / `light` on any element re-themes its subtree → tokens.css:35-36, :765 are class selectors; proof baseline table
- :26 Modal, Sheet, Popover, menu and Tooltip content mounts in `<body>` → @radix-ui/react-portal index.mjs:16; the only portals in src are in DropdownMenu.tsx:209/:271, dialogShell.tsx:104, Popover.tsx:60 and Tooltip.tsx:89
- :26 `portalProps={{ container }}` and `portal={false}` exist on each → DropdownMenu.tsx:132-133, :254-255; dialogShell.tsx:61-63; Modal.tsx:48-50; Sheet.tsx:111-113; Popover.tsx:19-20; Tooltip.tsx:34-35
- :26 the island class on `className` misses the Modal and Sheet backdrop, which renders beside the content → dialogShell.tsx:79-88 (className goes on Content only), :104-106 (overlay is a sibling); the backdrop token has a dark value (token-contract:123)
- :30 `:root` is `<html>` even when it has `dark` → proof S1/S2 dark/html rows
- :30 the DS redeclares every token on `.light` except the two expression tokens → the light block holds 289 tokens on `:root, .light` (token-contract:11), plus 2 on `:root` only (tokens.css:939-947)
- :30 a `:root`-only override of any token is lost in a `.light` island → proof F1 (font, spacing), M1a (motion), S2 (colour)
- :34 light-only recipe, plus `.dark` restating `same` tokens → proof S5/S6, W2
- :35 dark-only `.dark { … }` → proof S8/S9
- :36 per-mode recipe → proof G1, G2
- :37 every-mode `:root, .light, .dark` → proof G4; the motion exception is M7
- :39 a reader declared elsewhere inherits the colour it already resolved to → proof S8 (prominent-border), R2
- :39 the example `--ui-color-prominent-border: var(--ui-color-prominent);` is the DS's own text → tokens.css:73
- :41 in a `.dark` rule, restate the `same` readers; `repeated` ones follow → proof R1, S9; token-contract:35
- :42 in a wrapper rule, restate every reader, `repeated` included → proof R2, WA1, WA2
- :44 the prominent states (hover, active, border) are separate from the focus ring and from `--ui-prominent-color` → tokens.css:72-77, :167, :175
- :48 app aliases resolve where declared; `:root` alone shows the light value in a dark island; use `:root, .light, .dark` → proof A1-A3
- :48 a DS token retuned on a wrapper class needs your aliases restated there → proof WA1/WA2
- :52 a motion override on `:root, .light` stays under the collapse; on `.dark` islands or component classes it runs at full length → proof M6b, M2, M7, M3
- :52-55 your own reduced-motion block with `!important` wins in any source order → proof MR1, MR2
- :58 use 1ms, not 0ms, because a 0ms transition fires no `transitionend` and components wait on it → RevealChangeText.tsx:28, :130, :209, :241; tokens.css:905-912
- :62 the default is the signature look, and practical sets both caret tokens to 0 → tokens.css:939-947, :957-961
- :62 where the attribute goes (Next.js `app/layout.tsx`, Vite `index.html`) → tokens.css:952-954
- :62 the caret in DropdownTrigger and TypeableDropdownTrigger becomes a plain chevron with no lean → DropdownTrigger.tsx:81, :269; index.css:1013-1040; DropdownCaret.tsx:18-20, :63. The standalone exported `DropdownCaret` (src/index.ts:26) is affected too; the text leaves it unnamed.
- :62 OutlineButton, CTAButton and the shapes are opt-in by use → src/index.ts:3, :22-25; the preset touches only the caret tokens (tokens.css:957-961; no other `data-ds-expression` rule in src)
- :62 your unlayered CSS beats the preset → proof E3
- :66-68 the column legend for Dark, Alias, Reduced motion, Practical preset and Expression → token-contract.md:15-23
- :74 `:root, .light` gives dark the light value even for tokens that have a dark value → proof S1 (secondary `#aaaaaa` on html.dark)
- :75 with `:root:not(.dark)`, a `same` token leaks into dark islands and a `.light` island drops the override → proof S3
- :80-84 verify with `getComputedStyle(...).getPropertyValue` → the proof's own method (proof:10)
- :86 overrides.md holds the measured matrix → file exists and maps to the proof
- :90 the related skills exist → skills/dooph-design-system-setup, skills/dooph-design-system-usage

### theming references/overrides.md
- :3 test method: an unlayered consumer sheet, `<html>`, a dark island and a light island → proof:8-10
- :7 `<html>` is `:root` when dark, and unlayered beats the layered DS on the same element → proof fact 1 (proof:54)
- :7 the DS redeclares light tokens on every `.light` and dark tokens on every `.dark` → tokens.css:35-36, :765
- :7 a declared value beats the inherited one → CSS inheritance; proof S2/S3 inLight
- :9 secondary has a dark value and prominent is `same` → token-contract:48, :62
- :13 row `:root, .light` → proof S1
- :14 row `:root` → proof S2
- :15 row `:root:not(.dark)` → proof S3
- :16 row `.light` (including the leak under html `light`) → proof S4
- :17 row `:root:not(.dark), .light` + `.dark` prominent ("but see aliases") → proof S5
- :21 a DS dark value survives only inside a `.dark` island → proof fact 1
- :22 a `same` token inherits into a `.dark` island → proof fact 2
- :24 font and spacing overrides on `:root` alone are lost in `.light`, and `:root, .light` reaches them → proof F1, F2
- :24 the expression tokens are the exception, declared on `:root` alone → tokens.css:939-947; proof F1 caret 0.5 in inLight
- :28 `var()` resolves on the declaring element, and descendants inherit the result → proof R2, S8
- :28 `.dark` repeats only the aliases whose targets change in dark → script: 0 `same` aliases with a changing target, 0 `repeated` ones without
- :32-34 in `.dark`: `repeated` readers follow and `same` ones stay; the `#8c7bff` example → proof R1, S8 (inDark `8c7bff / 340fd9`)
- :35-36 on a wrapper, no reader follows; the `.panel` example `#171717` / `#f9f9f9` → proof R2
- :37 `--app-*` aliases behave the same → proof WA1
- :39 the fix is to restate the readers → proof S6, S9, WA2
- :43 the prominent family has no DS dark values; its border aliases and sticker wash are `same` → token-contract:62-68, :550
- :45-60 the worked recipe's `.dark` values are the DS defaults → tokens.css:72-77, :728-732
- :62 the recipe measured correct in all cases → proof W2
- :62 without the last line, a prominent Sticker in a dark island keeps the violet wash → proof W1; Sticker.tsx:41 uses `bg-sticker-bg-prominent`
- :62 `--ui-color-input-border-focus` and `--ui-color-sticker-prominent` need nothing → tokens.css:812, :847; proof W2
- :64 search the contract for `var(--ui-your-token)` → contract Light column holds the DS text
- :68 per-mode recipe works in either order, while `:root, .light` + `.dark` depends on order → proof G1/G2, G3
- :76-78 the three alias rows → proof A1, A2, A3
- :82 durations collapse to 1ms and staggers to 0ms on `:root, .light`, as a layered `!important` → tokens.css:923-933
- :86 the `:root` / `:root, .light` row (even with `!important`) → proof M1b, M5, M6b
- :87 the `.dark` row (500ms in islands, not on html.dark) → proof M2
- :88 the `.panel` row → proof M3
- :89 the `.panel` + `!important` block, in either order → proof MR1, MR2
- :90 a block without `!important`, written before the override, loses → proof MR0
- :92 with reduced motion off, a `:root`-only motion override misses `.light`; `:root, .light` reaches it → proof M1a, M6a
- :96 `@layer base` changes nothing; before or after the import gives the same result → proof S7, O1
- :102 no attribute gives 1 / follows the nudge (0.15) → proof E1, E5; tokens.css:341, :946
- :103 practical gives 0 / 0 → proof E2; tokens.css:958-961
- :104 practical plus `:root { scale: 1 }` gives 1 / 0 → proof E3
- :106 the preset reaches islands; a nested attribute works for its subtree only; the DS discourages nesting → proof E table; tokens.css:953-955
- :110 portalled content mounts in `<body>` unless given a container → react-portal index.mjs:16
- :110 a `<body>` child reads light tokens on a light page, and dark ones with class `dark` → proof P1
- :112 a `container` inside the island makes the portal inherit its tokens; `portal={false}` also works → the props are spread into Radix Portal (dialogShell.tsx:104, Popover.tsx:60, Tooltip.tsx:89, DropdownMenu.tsx:209), and the portal uses `container` (index.mjs:16). This is code-derived; the proof has no browser case for it.
- :112 the island class on `className` themes only the panel; the backdrop is a sibling and stays on the page theme → dialogShell.tsx:79-88, :104-106; `--ui-color-modal-backdrop` has a dark value (token-contract:123)

### token-contract.md (generated)
- Fresh → `node scripts/generate-docs.mjs --check` exited 0
- The SKILL.md and overrides.md statements about it agree with it → see FALSE #5, "Not a fix"

### docs/future/responsive-type.md (current behaviour only)
- :1, :3 it is clearly marked "Not implemented. Not current behaviour.", "future idea" → file header
- :3 typography today is Text component props only → BaseText.tsx:56-65, :95-111; maintainer decision
- :3 there is no responsive mechanism in the DS API → no breakpoint prop on BaseText; no `@media (width …)` or `@container` in src/styles/*.css; no `ds-text-*` or `at` prop in src/components/Text/. The token lever is covered under FALSE #6.
- :6 hero 55px, title 40px, heading 20px → tokens.css:441-443
- :6 props render as inline style → BaseText.tsx:105-111; textStyle.ts:1-9
- :6 inline style can't contain a media query → CSS (the `style` attribute holds declarations only)
- :6 reading the window width in JS is client-only and flickers on first paint → true for server-rendered apps (no width on the server). A client-only SPA can read it before its first paint, so this is TRUE with that qualifier.
- :11 the consumer's Tailwind breakpoints are 40/48/64/80rem → node_modules/tailwindcss/theme.css:327-330; the DS preset doesn't change `--breakpoint-*` (none in src/styles/theme.css)
- :11 media queries can't read CSS variables → CSS (`var()` is not allowed in media conditions)
- :19 `--ui-text-title` is a real token → tokens.css:442
- :18 the candidate names don't exist yet (`at` prop, `ds-text-<bp>-<role>`) → grep of src/components/Text: none

---

## §4 reappearances (`docs/audit/FINDINGS.md` §4, C-THEME-*, C-TC-*)

I grepped §4 for theming, token-contract, island, dark/light, alias, reduced motion, layer, expression, portal and responsive. Results:
- **C-THEME-3** ("preset registers every `--ui-*` token", FALSE): it does not reappear in the theming skill. Its cousin does reappear in SKILL.md:8 ("Every DS colour, size and motion value is a `--ui-*` custom property"), as an overreach of the same "every" kind; see FALSE #1.
- **C-THEME-10** (portals: "decorate the portalled content or container", partly FALSE because ModalContent/SheetContent had no `container` and the overlay took no className): fixed. The code now has `portalProps` on every overlay content (dialogShell.tsx:61-63), and the doc now says that `className` misses the backdrop. It does not reappear.
- **C-THEME-12** ("mode-invariant tokens defined once on `:root`", FALSE): it does not reappear. The current doc says the opposite, and that is correct: everything except the two expression tokens is on `:root, .light`.
- **C-THEME-20** ("token-contract is the exhaustive list", FALSE then): it is TRUE now (291 = 291).
- **F-019** (28 aliases not redeclared in `.dark`): resolved. The script found no `same` alias whose target changes in dark.
- **C-THEME-1, C-TC-3/9/11/17/19/29** (v3 contract, "renamed in 5.4", eight text roles, stroke 1.5, `rounded-l-standard`): none of them appears in the current files.

## Cross-doc contradictions

None found between the theming skill and these docs:
- setup SKILL.md:30 and fonts-and-preset.md:70: fonts go on `:root, .light`, never `.dark`. They have no dark value, so this agrees with theming SKILL:30/:37.
- editing-tokens SKILL.md:18, :22: the layers and the reduced-motion `!important` match theming :14-20.
- styling references/expressive-details.md:35: the expression block is on `:root` only.
- loading-indicators SKILL.md:48 and editing-tokens references/recipes.md:67: 1ms, not 0ms.
- writing-components SKILL.md:26: overlays take `portal` / `portalProps`.

One gap, not a contradiction:
- **The media-query token lever:** usage SKILL.md:18 and responsive-type.md:6 both list the responsive-type workarounds, and neither one mentions the token lever from FALSE #6. The maintainer should decide whether a skill names it as allowed or forbidden.

Side note:
- **Stale `dist/` in the main checkout:** `dist/styles.css` (dated Sep 28) contains a `@media (prefers-color-scheme: dark)` rule at :2094, generated for `.dark:bg-[#...]` from text that has since left src. The current src has no `dark:` and no `prefers-color-scheme`, so a fresh build agrees with SKILL.md:24. The stale dist is not shipped (builds run in scratch worktrees), but a reader grepping the checkout's dist could be misled.

## Fixes

Each finding was re-verified against the code before editing.

1. **SKILL.md:8**, FIXED. Re-verified: `outline: 2px` / `outline-offset: 2px` (dooph-component-tokens.css:128-129), 1px borders and padding, and `+ 1px` in the caret geometry (index.css:1016, :1020) are not tokens. New text: "The DS's colours, type, spacing, radii, shadows, component sizes and motion are `--ui-*` custom properties in `@dooph-software/design-system/styles.css` (hairline borders and a few fixed offsets are not)."
2. **SKILL.md:39**, FIXED. Re-verified: `--ui-caret-nudge: var(--ui-shape-morph-nudge)` sits in the `:root`-only block (tokens.css:939-947); `.ds-expr-caret-nudge` reads it (index.css:1039-1040). New sentence after "so a new fill gets the old border.": "One alias is declared on `:root` only: `--ui-caret-nudge`, which reads `--ui-shape-morph-nudge`. It resolves on `<html>` alone, so a `--ui-shape-morph-nudge` override on any element below `<html>` doesn't move the caret's hover lean." tokens.css unchanged.
3. **overrides.md:3**, FIXED. Narrowed to what theming-proof.md measured: "The theming skill's cascade rules (selectors, islands, layers, aliases, reduced motion and the expression preset's token values) were checked in a browser against the built `styles.css`. Three things were not. The portal remedies (`portalProps={{ container }}`, `portal={false}`, and the backdrop staying on the page's theme) and the `1ms`-not-`0ms` rule follow from the component code. The caret was measured as token values, not as a rendered shape. The browser test used …"
4. **overrides.md:28**, FIXED. New text: "The DS declares its aliases in its light block (`:root` and `.light`), except `--ui-caret-nudge`, which sits on `:root` only with the other expression token, so it re-resolves only on `<html>`."
5. **token-contract.md:5, :23 (generated)**, FIXED in scripts/generate-docs.mjs (:499-501, :514), then regenerated. :5 is now "Every DS token (a custom property) in `@dooph-software/design-system/styles.css`, under the DS's own section headings and in its source order." The generator and lint sentence is dropped. :23 is now "`yes` for an expression token, one the practical preset sets to its neutral value." The maintainer outputs (inventory.md, components.md) are untouched. Kept on purpose: the line-1 HTML comment banner `GENERATED by scripts/generate-docs.mjs — do not edit`, which the generator shares with every output and which the checker's fix allowed as the place for the generator note.
6. **responsive-type.md:6, "nothing can make a title smaller"**, FIXED. Re-verified: `.text-style-title` and `FontSizes.title` both read `var(--ui-text-title)` (index.css:313-316, Text/constants.ts:45-52). New text: "So no Text prop and no DS mechanism changes a size with the width. The one lever an app has today is redefining a role token (e.g. `--ui-text-title`) inside a media query in its own CSS. That moves every use of the role at once, never one instance, and it is not a documented responsive mechanism." The doc neither endorses nor forbids the lever; that decision stays with the maintainer. Header :3 now reads "the DS has no responsive mechanism"; the "Not implemented. Not current behaviour." marker is kept.
7. **responsive-type.md:6, "both read by screen readers"**, FIXED. New text: "(double DOM: the text ships twice and the two copies must be kept in sync; a copy hidden with `display: none` is not read by screen readers)".

Claims file updated: `docs/audit/_work/docs-pass/claims/dooph-design-system-theming.md` (S1, S16, new R0, R6, and the must-not-reappear note on token-contract.md:5). responsive-type.md has no claims file; it is a proposal.

## Fix verification

Run 2026-10-11, read-only. `node scripts/generate-docs.mjs --check` exit 0 ("fresh"). `node scripts/sync-skills.mjs --check` exit 0 (9 skills x 2 mirrors). `npm run lint` exit 0 ("conventions: 30 checks passed").

1. SKILL.md:8 (every colour/size/motion value): VERIFIED. New text is hedged to colours, type, spacing, radii, shadows, component sizes, motion, and says hairline borders and a few fixed offsets are not tokens; the non-token 2px outline and 1px items it concedes exist (dooph-component-tokens.css:128-129, index.css:1016-1020). No new false statement.
2. SKILL.md:39 (alias rule exception): VERIFIED. `--ui-caret-nudge: var(--ui-shape-morph-nudge)` is in the `:root`-only block (tokens.css:939-947). Neither token is `@property`-registered (the only `@property` entries are `--progress-pct`, `--ds-*`; none is `--ui-*`), so the `var()` is substituted at computed-value time on `<html>` and descendants inherit the resolved number. The caret reads it only through `--ds-shape-morph-nudge: var(--ui-caret-nudge)` on the caret element (index.css:1039-1040), an inherited value. So a `--ui-shape-morph-nudge` override on an element below `<html>` does not move the hover lean, and one on `:root` does (proof E5). Reasoned from code (standard custom-property inheritance plus the absent `@property` registration); no browser run, since the wrapper case is not covered by the proof and a built-CSS page adds nothing beyond the code reading. The wording "resolves on `<html>` alone" is accurate; one corner: a `.light` island re-declares `--ui-shape-morph-nudge` (tokens.css:341) but the caret still inherits html's resolved value, consistent with the text.
3. overrides.md:3 (browser-check claim): VERIFIED. Now limited to cascade rules, with portal remedies, the 1ms rule and the caret rendered shape named as not browser-tested; all three match the original evidence.
4. overrides.md:28 (alias declaration): VERIFIED. The `--ui-caret-nudge` exception is accurate (tokens.css:939-947) and "re-resolves only on `<html>`" matches finding 2.
5. token-contract.md:5, :23 (generated): VERIFIED. Generator text (scripts/generate-docs.mjs:499-501, :514) and shipped file agree and are fresh. The shipped file, SKILL.md and overrides.md contain no pointer to `src/`, `scripts/`, `npm run lint` or `tokens.css` (grep found only the accepted line-1 banner). Line 23 now reads "an expression token, one the practical preset sets to its neutral value", which is true (tokens.css:957-961).
6. responsive-type.md:6 (nothing can make a title smaller): VERIFIED. New text is true (`.text-style-title` and the `FontSizes` consts read `var(--ui-text-title)`; no `@media` width or `@container` in src/styles; none of the `clamp()` hits are text sizes). It neither endorses nor forbids the media-query lever ("not a documented responsive mechanism" only describes status). The "Not implemented. Not current behaviour." banner is intact at line 3, and the header sentence "the DS has no responsive mechanism" is true.
7. responsive-type.md:6 (screen readers): VERIFIED. "A copy hidden with `display: none` is not read by screen readers" is correct, and the double-DOM and keep-in-sync parts are plainly true.

Counts: 7 VERIFIED, 0 STILL FALSE. Lint exit 0.
