# Claims: dooph-ds-editing-tokens

Every factual claim in `.agents/skills/dooph-ds-editing-tokens/SKILL.md` (S) and `references/recipes.md` (R), with evidence. Line numbers are against the working tree on 2026-10-10.

## SKILL.md

| # | Claim | Evidence |
|---|---|---|
| S0a | A `.dark .x` rule in component CSS still applies inside a `.light` island under `<html class="dark">` (descendant selector matches any `.dark` ancestor), and no consumer token override reaches a literal paint | tokens.css:7-11 (`.light` / `.dark` classes as theme scopes); tokens.css:19-22 (consumer overrides act on `--ui-*`, which a literal bypasses) |
| S1 | tokens.css holds every `--ui-*` value, one block per mode and preset | src/styles/tokens.css:35-36 (light), :765 (dark), :923-934 (reduced motion), :939-947 (expression defaults), :957-962 (practical preset); scripts/generate-docs.mjs:369-375 (these five blocks are the only kinds allowed) |
| S2 | The theme utilities, theme.css and cn's merge lists are generated from tokens.css | scripts/sync-theme.mjs:3-7, :50, :316-319, :353, :386, :457 |
| S3 | The token contract is generated from tokens.css | scripts/generate-docs.mjs:5, :24-25, :394-396 |
| S4 | Light block selector `:root, .light`, layer `ds.tokens` | tokens.css:33-36 |
| S5 | sync-theme reads only the light block | sync-theme.mjs:20-23, :295-313 (regex takes the first `:root`/`:root, .light` match) |
| S6 | Dark block `.dark`, layer `ds.tokens`, holds dark values then the alias re-declaration group | tokens.css:765-847 (values), :849-891 (alias group), :949 (layer closes after) |
| S7 | Reduced-motion block is `@media (prefers-reduced-motion: reduce)` → `:root, .light`; scale durations 1ms, staggers 0ms, all `!important` | tokens.css:923-934 |
| S8 | Expression defaults: `:root` only, in `ds.tokens`, one line per expressive detail with `/* expression */` | tokens.css:936-947; tokens.css:24-28 |
| S9 | Practical preset `[data-ds-expression="practical"]` in `ds.expression` holds each expression token's neutral value | tokens.css:951-962 |
| S10 | Authority: consumer (unlayered) > expression preset > DS defaults, from the layers; the exception is the reduced-motion `!important`, which beats consumer overrides on `:root`/`.light` only, so a consumer override on another selector needs its own reduced-motion block | tokens.css:1, :15-22, :917-934 (block matches `:root, .light`); browser: docs/audit/_work/docs-pass/theming-proof.md M1b/M5/M6b (consumer `:root`, `:root, .light`, and `:root` `!important` → 1ms), M2/M3/M7 (`.dark` island and `.panel` stay 500ms), MR1/MR2 (own block with `!important` → 1ms in either order) (fix round 1, 2026-10-11) |
| S11 | Lint check "hex colour literals in components and stories" catches a hex in .ts/.tsx (stories included); "dark-mode rules or hex colours outside tokens.css" catches a hex in a component stylesheet | scripts/check-conventions.mjs:546-552 (name :548; scans `tsx`, :125), :661-666 (name :663), :353-390 (`darkOutsideTokens`), :351-352 (component stylesheets: styles/ minus tokens.css and theme.css); allowlist :215-220 (the two `#000` mask stops in index.css) |
| S12 | Lint check "dark-mode rules or hex colours outside tokens.css" catches a `.dark` selector in a component stylesheet and a `dark:` variant (in an `@apply` line or a class string) | scripts/check-conventions.mjs:356-357 (`.dark` selector), :358-361 (`@apply … dark:`), :368-369 (`dark:` in class strings); fixtures `scripts/check-conventions.fixtures/styles/dark-outside-tokens*.css`, `dark-outside-tokens.variant.tsx`. The dark-alias check still reads only the token blocks (check-conventions.mjs:290-291) |
| S12a | The same check catches a dark variant (`@variant dark`, `@custom-variant dark`) in a component stylesheet, and `prefers-color-scheme` in any stylesheet under src/styles, tokens.css included; `prefers-reduced-motion` does not match | scripts/check-conventions.mjs:362-363 (variant), :364-367 (`prefers-color-scheme` over every non-generated stylesheet, tokens.css included), :663-664 (name, why); fixtures `styles/dark-outside-tokens.variant.css`, `styles/dark-outside-tokens.scheme.css` (its reduced-motion block is a near-miss), `styles/tokens.css` (reduced-motion near-miss); src/styles/tokens.css:923 (`@media (prefers-reduced-motion: reduce)`, passes lint) |
| S12b | "System mode is the app's job": tokens.css does no `prefers-color-scheme` remapping | src/styles/tokens.css:12-13 (header: "There is NO `prefers-color-scheme` remapping here: system mode is the consuming app's job") |
| S12c | An allowlisted stylesheet hex line counts only in comment-blanked code, so a commented-out line reads as stale | scripts/check-conventions.mjs:370-372 (`codeLines` from `f.code`), :375, :385; fixture `styles/dark-outside-tokens.commented.css` |
| S13 | No `.dark` selector exists in src/ CSS outside tokens.css (red flag basis) | `grep -rn "\.dark\b" src --include=*.css` → only src/styles/tokens.css |
| S14 | A light-block alias to the current paint leaves light unchanged | tokens.css:859-891 comment at :849-856 (aliases resolve where declared); worked precedent: the disabled aliases tokens.css:49, :80 |
| S15 | Blast radius items: aliases, utility, raw var() reads, `DS_COLOR_TOKENS` | tokens.css (aliases e.g. :48-49, :94-103); sync-theme.mjs:259-293 (utility mapping); dooph-component-tokens.css:911, :918 (raw reads); src/utils/color.ts:21-38 |
| S16 | Alias/color-mix/shadow reaching a dark-changed token must be repeated verbatim in `.dark` | check-conventions.mjs:323-342 (any `var(--ui-` in the value counts; transitive via `reachesDark`); tokens.css:849-856 |
| S17 | A `.dark` literal equal to its light value fails lint | check-conventions.mjs:336-339 |
| S18 | Failure prevented: islands keep light values / a redundant `.dark` line pins a consumer's `:root` override out of `.dark` islands (it cannot block it on `<html class="dark">`, where the unlayered `:root` rule wins) | check-conventions.mjs:658 (`why` of the dark check); browser: theming-proof.md S1/S2 dark/html (an unlayered `:root` override beats the DS `.dark` value on `<html class="dark">`), S2 none/inDark secondary `#1d1d1f` (a DS `.dark` line on the island element beats the inherited `:root` override) (fix round 1, 2026-10-11) |
| S19 | Lint check name "dark aliases missing from .dark, and redundant .dark lines" | check-conventions.mjs:657 |
| S20 | `npm run sync-tokens` runs sync-theme | package.json:54 |
| S21 | It writes index.css's `__GENERATED_THEME_*__` block, src/styles/theme.css, src/utils/twMergeTheme.ts | sync-theme.mjs:3-7, :76-77, :334-353, :363-386, :441-457; index.css:86-89 |
| S22 | Lint check name "generated theme out of date" | check-conventions.mjs:681 |
| S23 | Only `--ui-color-*`, `--ui-shadow-*`, `--ui-radius-*`, `--ui-font-<role>`, `--ui-text-*`, `--ui-spacing-*`, plus the names in `ALIASES`, map to theme keys | sync-theme.mjs:259-293 (prefix rules); :84-98 (ALIASES, incl. the `ui-prominent-color*` trio at :94-97), checked before the prefix rules at :264 |
| S24 | `EXCLUDED` keeps a token out of the theme | sync-theme.mjs:100-104, :261 |
| S25 | Expression lint check name "expression tokens set or read outside the expression system" | check-conventions.mjs:651 |
| S26 | Failure prevented: a detail the practical preset cannot switch | check-conventions.mjs:652 |
| S27 | A component's own motion token only for loops, staggers, the generated spring | tokens.css:193-195 |
| S28 | A new scale step or stagger goes in the reduced-motion block; a loop cycle time never does (its own reduce rule stops it) | tokens.css:894-901, :909-912 (loops deliberately absent; 1ms would strobe), :219-221, :923-934 |
| S29 | Never edit between `__SHAPE_MORPH_EASE_*__` markers; run `npm run generate-shape-morph-ease` | tokens.css:325-333; package.json:50 |
| S30 | Lint check name "motion timing literals outside tokens.css" | check-conventions.mjs:469, :474 (tokens.css excluded) |
| S31 | The comment above a token is published in the token contract | scripts/generate-docs.mjs:507 (Comment column = first sentence of the comment above), :414-419 (`above`) |
| S32 | `node scripts/generate-docs.mjs` regenerates it; lint check "generated doc references out of date" | generate-docs.mjs:9-10; check-conventions.mjs:702 |
| S33 | Values marked PLACEHOLDER in tokens.css are the maintainer's to tune, pending the dark pass | tokens.css:803-806, :833-836, :843-847 (each "PLACEHOLDER … pending the maintainer's dark pass" / "until the dark pass") |
| S34 | Rationalization quotes (chat-code-well-dark thinking [26] in full, text [29], final; disabled-fill-darker text [45]) | docs/audit/_work/docs-pass/baseline/SCORES.md:174-176, :157 |
| S35 | Storybook runs via `npm run storybook` | package.json:59 |
| S36 | The Theme toolbar's Dark toggles `.dark` on `<html>` | .storybook/preview.ts:6-24 |
| S37 | `data-ds-expression="practical"` is the preset attribute | tokens.css:958 |
| S38 | `npm run lint` = tsc then check-conventions | package.json:61 |

## references/recipes.md

| # | Claim | Evidence |
|---|---|---|
| R1 | `.ds-chat-prose pre` paints `var(--ui-color-surface-secondary)` | src/styles/dooph-component-tokens.css:915-918 |
| R2 | Inline `code` in the prose paints it too | dooph-component-tokens.css:903, :911 |
| R3 | Avatar uses `bg-surface-secondary` | src/components/Avatar/Avatar.tsx:16; index.css:136 maps it |
| R4 | `surface-secondary` is a `DS_COLOR_TOKENS` name | src/utils/color.ts:34 |
| R5 | Chat-prose tokens sit in the light block (placement "beside the other chat-prose tokens") | tokens.css:278-282 |
| R6 | A `.dark` line with its own (different) value satisfies the dark check without an alias-group copy | check-conventions.mjs:335-342 (only identical non-alias literals or missing aliases fail) |
| R7 | `pre code` is transparent, so only `pre` paints the block well | dooph-component-tokens.css:922-923 |
| R8 | `--ui-color-*` maps to `--color-*` | sync-theme.mjs:266-268 |
| R9 | Slider paints are raw-var colours listed in `EXCLUDED` | sync-theme.mjs:149-154 |
| R10 | Never invent a design value | docs/audit/_work/agent-rules.md:42 rule text ("Never guess a design value") — maintainer intent |
| R11 | The caret is the precedent: `--ui-caret-shape-scale`, `--ui-caret-nudge` | tokens.css:943, :946; index.css:1012-1040 |
| R12 | Expression `:root` block is at the end of `@layer ds.tokens` | tokens.css:936-949 |
| R13 | Lint finds the marker only on the same line, after the `;` | check-conventions.mjs:250 (`[^;\n]*;[ \t]*\/\*\s*expression\s*\*\/`) |
| R14 | Never beside `.light`/`.dark`: a theme-class subtree would restore the detail | tokens.css:936-938 |
| R15 | Lint fails when a marked token is missing from the preset, and when the preset sets an unmarked one | check-conventions.mjs:274-276 |
| R16 | Preset must sit inside `@layer ds.expression` | check-conventions.mjs:260 |
| R17 | `EXCLUDED` has an "Expression tokens" group | sync-theme.mjs:214-217 |
| R18 | sync-theme never reads the expression block, so the entry records rather than filters | sync-theme.mjs:20-23, :100-103, :300 |
| R19 | Only a CSS rule whose selector contains `.ds-expr-` may read it | check-conventions.mjs:269-271 |
| R20 | Components never set or read it (inline style, arbitrary-property class, setProperty) | check-conventions.mjs:277-284; tokens.css:27-28 |
| R21 | `.ds-expr-caret-shape` / `.ds-expr-caret-nudge` live in src/styles/index.css | index.css:1012, :1022, :1026, :1038 |
| R22 | The component adds the `ds-expr-*` class | src/components/DropdownCaret/DropdownCaret.tsx:63 |
| R23 | Neutralised component must be complete (no empty frame/gap); lint cannot check it | docs/audit/_work/agent-rules.md:61 (maintainer rule); no such check in check-conventions.mjs:466-714 |
| R24 | The grep `--ui-x([ ,)]|$)` catches a var( whose name wraps lines | tokens.css:81-83 (wrapped `var(`); verified by running it on `--ui-color-secondary-border-disabled` |
| R25 | Utility name = token minus family prefix | sync-theme.mjs:266-290 |
| R26 | `ALIASES` renames `-foreground` tokens to `-fg` | sync-theme.mjs:84-93 |
| R27 | Motion scale: durations fast/base/slow/slower/slowest, eases standard/enter/exit/linear | tokens.css:205-218 |
| R28 | The comment above them says each step's job | tokens.css:188-204, :210-214 |
| R29 | Motion tokens map to no theme key and are all in `EXCLUDED` | sync-theme.mjs:185-196, :259-293 (no `ui-motion` rule) |
| R30 | Components read them through `ds-motion-*` helpers and `var()`, never `duration-N`/`ease-*` | tokens.css:191-193; dooph-component-tokens.css:48, :71 (ds-motion-* helpers); check-conventions.mjs:468-475 |
| R31 | Reduced motion: 1ms not 0ms because 0ms never fires transitionrun/transitionend, which components rely on | tokens.css:902-907; RevealChangeText.tsx:28; MorphRotationShape.tsx:326 |
| R32 | Staggers go to 0ms; loop cycle times deliberately absent, each loop's own reduce rule stops it | tokens.css:909-912, :931-932 |
| R33 | The `!important` is load-bearing against unlayered consumer motion overrides on `:root`/`.light`; an override on another selector needs its own reduced-motion block | tokens.css:917-934; browser: theming-proof.md M1b, M5, M6b vs M2, M3, M7, MR1 (fix round 1, 2026-10-11) |
| R34 | Shape-morph duration/ease generated from scripts/shapeMorphSpring.mjs by `npm run generate-shape-morph-ease` | tokens.css:326-329; package.json:50; scripts/shapeMorphSpring.mjs exists |
| R35 | sync-theme reads the FIRST `:root` / `:root, .light` block | sync-theme.mjs:300 (`String.match`, first match) |
| R36 | Dark check finds blocks by `:root, .light {` and `.dark {` at line start | check-conventions.mjs:290-291 |
| R37 | generate-docs fails on an unknown block; `TOKEN_BLOCKS` | generate-docs.mjs:369-375, :441 |
