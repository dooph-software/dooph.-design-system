# Theming proof (browser)

Measured 2026-10-11 for the consumer skill dooph-design-system-theming.

## Method

- Build: scratch worktree `../ds-t6-theming` (HEAD 0dac153 plus the main checkout's working tree, overlaid as tree `f3e9c37a`), `npm ci && npm run build`, both exit 0. Worktree removed afterwards.
- Page: `proof/index.html` in that worktree, served by a local static server on 127.0.0.1, opened in the desktop app's built-in browser (Chromium). It links the built `dist/styles.css` and has one `<style id="consumer">` AFTER it, UNLAYERED, as a consumer's global CSS is. The built file declares `@layer theme, base, components, utilities;` (dist/styles.css:3) and then `@layer ds.tokens, ds.expression;` (:1611), the same order a consumer's Tailwind build gets when it imports tailwindcss and then the package.
- Elements: `html` (class set to none, `light` or `dark`), `#inDark` (a child of `<div class="dark">`), `#inLight` (a child of `<div class="light">`), `#panel` (`<div class="panel">`), `#practicalIsland` (`<div data-ds-expression="practical">`).
- Reading: `getComputedStyle(el).getPropertyValue(token)` via the javascript tool, for each html class. Under html `(none)` or `light`, `inDark` is "a `.dark` island in a light page". Under html `dark`, `inLight` is "a `.light` island in a dark page".
- Reduced motion: the pane cannot emulate `prefers-reduced-motion`, so the page rewrites the media condition of every `@media (prefers-reduced-motion: reduce)` rule to `all` through the CSSOM (`CSSMediaRule.media.mediaText`), measures, and restores it. The rule keeps its layer, position and declarations; only the condition changes. 7 DS rules were flipped (8 when the consumer added its own).
- Tokens: `--ui-color-secondary` has a DS dark value (`#fdfdfd` light, `#1d1d1f` dark). `--ui-color-prominent` has none (Dark = `same`, `#340fd9`). `--ui-color-prominent-border` is a DS alias `var(--ui-color-prominent)` with Dark = `same`. `--ui-color-primary-border` is a DS alias with Dark = `repeated`.

## Baseline (no consumer CSS): the DS's own dark and islands are correct

| html | element | secondary | prominent | prominent-border | primary-border | caret-shape-scale | caret-nudge | motion-fast |
|---|---|---|---|---|---|---|---|---|
| none / light | html | #fdfdfd | #340fd9 | #340fd9 | #171717 | 1 | 0.15 | 150ms |
| none / light | inDark | #1d1d1f | #340fd9 | #340fd9 | #f9f9f9 | 1 | 0.15 | 150ms |
| none / light | inLight | #fdfdfd | #340fd9 | #340fd9 | #171717 | 1 | 0.15 | 150ms |
| dark | html | #1d1d1f | #340fd9 | #340fd9 | #f9f9f9 | 1 | 0.15 | 150ms |
| dark | inDark | #1d1d1f | #340fd9 | #340fd9 | #f9f9f9 | 1 | 0.15 | 150ms |
| dark | inLight | #fdfdfd | #340fd9 | #340fd9 | #171717 | 1 | 0.15 | 150ms |

No DS bug found: islands re-theme both ways, and the `repeated` alias (primary-border) re-resolves in a `.dark` island.

## Light-only overrides

Brand values: secondary `#aaaaaa`, prominent `#6d28d9`. Columns: secondary / prominent / prominent-border. A correct light-only result is: brand on every light row, DS value (`#1d1d1f` / `#340fd9` / `#340fd9`) on every dark row.

| html | element | S1 `:root, .light` | S2 `:root` | S3 `:root:not(.dark)` | S4 `.light` | S5 S3+`.light`, `.dark` restates prominent | S6 S5 + `.dark` restates prominent-border |
|---|---|---|---|---|---|---|---|
| none | html | aaa / 6d28d9 / 6d28d9 | aaa / 6d28d9 / 6d28d9 | aaa / 6d28d9 / 6d28d9 | **fdfdfd / 340fd9 / 340fd9** | aaa / 6d28d9 / 6d28d9 | aaa / 6d28d9 / 6d28d9 |
| none | inDark (dark island) | 1d1d1f / **6d28d9 / 6d28d9** | 1d1d1f / **6d28d9 / 6d28d9** | 1d1d1f / **6d28d9 / 6d28d9** | 1d1d1f / 340fd9 / 340fd9 | 1d1d1f / 340fd9 / **6d28d9** | 1d1d1f / 340fd9 / 340fd9 |
| none | inLight | aaa / 6d28d9 / 6d28d9 | **fdfdfd / 340fd9 / 340fd9** | **fdfdfd / 340fd9 / 340fd9** | aaa / 6d28d9 / 6d28d9 | aaa / 6d28d9 / 6d28d9 | aaa / 6d28d9 / 6d28d9 |
| light | html | aaa / 6d28d9 / 6d28d9 | aaa / 6d28d9 / 6d28d9 | aaa / 6d28d9 / 6d28d9 | aaa / 6d28d9 / 6d28d9 | aaa / 6d28d9 / 6d28d9 | aaa / 6d28d9 / 6d28d9 |
| light | inDark (dark island) | 1d1d1f / **6d28d9 / 6d28d9** | 1d1d1f / **6d28d9 / 6d28d9** | 1d1d1f / **6d28d9 / 6d28d9** | 1d1d1f / **6d28d9 / 6d28d9** | 1d1d1f / 340fd9 / **6d28d9** | 1d1d1f / 340fd9 / 340fd9 |
| light | inLight | aaa / 6d28d9 / 6d28d9 | **fdfdfd / 340fd9 / 340fd9** | **fdfdfd / 340fd9 / 340fd9** | aaa / 6d28d9 / 6d28d9 | aaa / 6d28d9 / 6d28d9 | aaa / 6d28d9 / 6d28d9 |
| dark | html | **aaa / 6d28d9 / 6d28d9** | **aaa / 6d28d9 / 6d28d9** | 1d1d1f / 340fd9 / 340fd9 | 1d1d1f / 340fd9 / 340fd9 | 1d1d1f / 340fd9 / 340fd9 | 1d1d1f / 340fd9 / 340fd9 |
| dark | inDark | 1d1d1f / **6d28d9 / 6d28d9** | 1d1d1f / **6d28d9 / 6d28d9** | 1d1d1f / 340fd9 / 340fd9 | 1d1d1f / 340fd9 / 340fd9 | 1d1d1f / 340fd9 / 340fd9 | 1d1d1f / 340fd9 / 340fd9 |
| dark | inLight (light island) | aaa / 6d28d9 / 6d28d9 | **fdfdfd / 340fd9 / 340fd9** | **fdfdfd / 340fd9 / 340fd9** | aaa / 6d28d9 / 6d28d9 | aaa / 6d28d9 / 6d28d9 | aaa / 6d28d9 / 6d28d9 |

Bold = wrong for a light-only intent. Exact CSS:

- S1 `:root, .light { --ui-color-secondary: #aaaaaa; --ui-color-prominent: #6d28d9; }` (the baseline agent's recipe)
- S2 `:root { … }`
- S3 `:root:not(.dark) { … }`
- S4 `.light { … }`
- S5 `:root:not(.dark), .light { … }` + `.dark { --ui-color-prominent: #340fd9; }`
- S6 S5, with the `.dark` rule also holding `--ui-color-prominent-border: var(--ui-color-prominent);`

What this proves:

1. On `<html class="dark">` an unlayered `:root` rule wins over the DS `.dark` value, EVEN FOR A TOKEN THAT HAS A DARK VALUE (S1, S2: secondary is `#aaaaaa` in dark). `:root` and `.dark` are the same element there, and unlayered beats `@layer ds.tokens`. The plan's first hypothesis ("dark keeps the DS dark value") is false for html-level dark; it holds only inside a `.dark` island (secondary `#1d1d1f` there in every recipe).
2. A token with no DS dark value (prominent) leaks into every `.dark` island in a light page under any light-scoped selector (S1–S4), because the island inherits it. Only a consumer `.dark` rule restating the value stops it (S5, S6).
3. `:root` alone, and `:root:not(.dark)` alone, are undone inside a `.light` island: the DS `.light` block redeclares the token on the island (S2, S3 inLight = DS value).
4. `.light` alone does nothing on a page whose `<html>` has no theme class (S4, none/html = DS value).
5. A DS alias whose Dark column is `same` (prominent-border) is resolved on `:root` and inherited as a resolved colour, so a consumer `.dark` rule that changes the base token leaves the alias on the old colour inside a `.dark` island (S5: prominent `#340fd9`, border `#6d28d9`). Restating the alias in the same `.dark` rule fixes it (S6).
6. S6 is correct in all nine cases.

Painted check (real utilities from the built CSS, `bg-prominent border-prominent-border`, on probes in html, the dark island and the light island):

| recipe | html | probe | background-color | border-color |
|---|---|---|---|---|
| S1 | none | root | rgb(109, 40, 217) | rgb(109, 40, 217) |
| S1 | none | dark island | rgb(109, 40, 217) | rgb(109, 40, 217) |
| S1 | dark | root | rgb(109, 40, 217) | rgb(109, 40, 217) |
| S6 | none | root | rgb(109, 40, 217) | rgb(109, 40, 217) |
| S6 | none | dark island | rgb(52, 15, 217) | rgb(52, 15, 217) |
| S6 | none | light island | rgb(109, 40, 217) | rgb(109, 40, 217) |
| S6 | dark | root | rgb(52, 15, 217) | rgb(52, 15, 217) |
| S6 | dark | dark island | rgb(52, 15, 217) | rgb(52, 15, 217) |
| S6 | dark | light island | rgb(109, 40, 217) | rgb(109, 40, 217) |

(S1 light island and S1 dark/dark island also painted rgb(109, 40, 217).) rgb(109, 40, 217) = `#6d28d9`, rgb(52, 15, 217) = `#340fd9`.

## Source order does not matter for unlayered overrides

O1: the S6 recipe in a `<style>` placed BEFORE the DS stylesheet gives exactly the S6 column (all nine cases correct).

## Layered override loses

S7 `@layer base { :root { --ui-color-secondary: #aaaaaa; --ui-color-prominent: #6d28d9; } }`: every row equals the baseline (DS values). An override inside Tailwind's `base` layer changes nothing.

## Dark-only and per-mode overrides

Columns: secondary / prominent / prominent-border.

| html | element | S8 `.dark { secondary #101010; prominent #8c7bff }` | S9 S8 + `.dark` restates prominent-border |
|---|---|---|---|
| none / light | html | fdfdfd / 340fd9 / 340fd9 | fdfdfd / 340fd9 / 340fd9 |
| none / light | inDark | 101010 / 8c7bff / **340fd9** | 101010 / 8c7bff / 8c7bff |
| none / light | inLight | fdfdfd / 340fd9 / 340fd9 | fdfdfd / 340fd9 / 340fd9 |
| dark | html | 101010 / 8c7bff / 8c7bff | 101010 / 8c7bff / 8c7bff |
| dark | inDark | 101010 / 8c7bff / 8c7bff | 101010 / 8c7bff / 8c7bff |
| dark | inLight | fdfdfd / 340fd9 / 340fd9 | fdfdfd / 340fd9 / 340fd9 |

R1 `.dark { --ui-color-primary: #ff0000; }`: primary-border (Dark = `repeated`) follows it to `#ff0000` in the dark island and on html.dark; light rows stay `#171717`. A `repeated` alias needs no restating.

R2 `.panel { --ui-color-primary: #ff0000; --ui-color-prominent: #00ff00; }` on a wrapper div: primary `#ff0000` but primary-border `#171717` (html none) / `#f9f9f9` (html dark); prominent `#00ff00` but prominent-border `#340fd9`. On an element that is not `:root`, `.light` or `.dark`, no DS alias re-resolves.

Per-mode values for secondary (light `#aaaaaa`, dark `#222222`):

| html | element | G1 `:root:not(.dark), .light` then `.dark` | G2 same, `.dark` written first | G3 `.dark` first, then `:root, .light` | G4 `:root, .light, .dark` one value (#aaaaaa; prominent #6d28d9) |
|---|---|---|---|---|---|
| none / light | html | aaaaaa | aaaaaa | aaaaaa | aaaaaa / 6d28d9 / 6d28d9 |
| none / light | inDark | 222222 | 222222 | 222222 | aaaaaa / 6d28d9 / 6d28d9 |
| none / light | inLight | aaaaaa | aaaaaa | aaaaaa | aaaaaa / 6d28d9 / 6d28d9 |
| dark | html | 222222 | 222222 | **aaaaaa** | aaaaaa / 6d28d9 / 6d28d9 |
| dark | inDark | 222222 | 222222 | 222222 | aaaaaa / 6d28d9 / 6d28d9 |
| dark | inLight | aaaaaa | aaaaaa | aaaaaa | aaaaaa / 6d28d9 / 6d28d9 |

`:root:not(.dark), .light` + `.dark` is order-independent (G1 = G2). `:root, .light` + `.dark` depends on source order: with `.dark` first, `<html class="dark">` gets the light value (G3).

## Consumer aliases

`--app-surface: var(--ui-color-secondary)`; columns `--app-surface` / `--ui-color-secondary`:

| html | element | A1 on `:root` | A2 on `:root, .dark` | A3 on `:root, .light, .dark` |
|---|---|---|---|---|
| none / light | html | fdfdfd / fdfdfd | fdfdfd / fdfdfd | fdfdfd / fdfdfd |
| none / light | inDark | **fdfdfd** / 1d1d1f | 1d1d1f / 1d1d1f | 1d1d1f / 1d1d1f |
| none / light | inLight | fdfdfd / fdfdfd | fdfdfd / fdfdfd | fdfdfd / fdfdfd |
| dark | html | 1d1d1f / 1d1d1f | 1d1d1f / 1d1d1f | 1d1d1f / 1d1d1f |
| dark | inDark | 1d1d1f / 1d1d1f | 1d1d1f / 1d1d1f | 1d1d1f / 1d1d1f |
| dark | inLight | **1d1d1f** / fdfdfd | **1d1d1f** / fdfdfd | fdfdfd / fdfdfd |

`:root` and `.dark` is enough for dark islands in a light page; a light island in a dark page also needs `.light` (A3).

## Expression preset

Columns: `--ui-caret-shape-scale` / `--ui-caret-nudge`.

| html | element | E1 no attribute | E2 html `data-ds-expression="practical"` | E3 E2 + consumer `:root { --ui-caret-shape-scale: 1 }` |
|---|---|---|---|---|
| any class | html | 1 / 0.15 | 0 / 0 | 1 / 0 |
| any class | inDark | 1 / 0.15 | 0 / 0 | 1 / 0 |
| any class | inLight | 1 / 0.15 | 0 / 0 | 1 / 0 |
| any class | practicalIsland (nested attribute) | 0 / 0 | 0 / 0 | 0 / 0 |

(Values identical for html none, light and dark.) The preset reaches through `.dark` and `.light` islands; a nested attribute works; an unlayered consumer `:root` rule beats the preset on the element it matches. E4: with practical on, consumer `:root { --ui-shape-morph-nudge: 0.3 }` leaves `--ui-caret-nudge` at 0. E5: without the attribute the same override moves `--ui-caret-nudge` to 0.3 (it aliases the shape-morph nudge).

## Motion and reduced motion

`--ui-motion-duration-fast`; DS default 150ms. Rows identical for html none / light / dark unless noted.

| case | html | inDark | inLight | panel |
|---|---|---|---|---|
| M0 reduced forced, no consumer CSS | 1ms | 1ms | 1ms | 1ms |
| M1a `:root { 500ms }`, not reduced | 500ms | 500ms | **150ms** | 500ms |
| M1b `:root { 500ms }`, reduced forced | 1ms | 1ms | 1ms | 1ms |
| M5 `:root { 500ms !important }`, reduced forced | 1ms | 1ms | 1ms | 1ms |
| M6a `:root, .light { 500ms }`, not reduced | 500ms | 500ms | 500ms | 500ms |
| M6b `:root, .light { 500ms }`, reduced forced | 1ms | 1ms | 1ms | 1ms |
| M2 `.dark { 500ms }`, reduced forced | 1ms | **500ms** | 1ms | 1ms |
| M7 `:root, .light, .dark { 500ms }`, reduced forced | 1ms | **500ms** | 1ms | 1ms |
| M3 `.panel { 500ms }`, reduced forced | 1ms | 1ms | 1ms | **500ms** |
| M4 `.panel { 500ms }` + `@media (prefers-reduced-motion: reduce) { .panel { 1ms } }`, reduced forced | 1ms | 1ms | 1ms | 1ms |

The DS reduced-motion block (`:root, .light`, layered `!important`) beats a consumer override on `:root` or `.light`, even an unlayered `!important` one (M1b, M5, M6b). A consumer override on any other selector (`.dark`, a component class) keeps full-length motion under reduced motion (M2, M7, M3) unless the consumer adds its own reduced-motion block (M4). A `:root`-only motion override is undone in a `.light` island (M1a); `:root, .light` reaches it (M6a).

## Portals

P1: under html `light`, a plain div appended to `<body>` reads secondary `#fdfdfd`; a div with class `dark` appended to `<body>` reads `#1d1d1f`. Radix portals mount into `document.body` when no container is given (node_modules/@radix-ui/react-portal/dist/index.mjs:16 in the worktree), so content portalled out of a `.dark` island is light unless the content itself carries `dark` (or is rendered in place / into a container inside the island).

## Worked recipe: light-only brand prominent, with every alias

W2 (the recipe in the skill's `references/overrides.md`):

```css
:root:not(.dark), .light {
  --ui-color-prominent: #6d28d9;
  --ui-color-prominent-hover: #5b21b6;
  --ui-color-prominent-active: #4c1d95;
}
.dark {
  --ui-color-prominent: #340fd9;
  --ui-color-prominent-hover: #2406ac;
  --ui-color-prominent-active: #1a0189;
  --ui-color-prominent-border: var(--ui-color-prominent);
  --ui-color-prominent-border-hover: var(--ui-color-prominent-hover);
  --ui-color-prominent-border-active: var(--ui-color-prominent-active);
  --ui-color-sticker-bg-prominent: color-mix(in srgb, var(--ui-color-prominent) var(--ui-sticker-bg-opacity), transparent);
}
```

Columns: prominent-hover / prominent-border-hover / input-border-focus / sticker-prominent / the colour inside sticker-bg-prominent's `color-mix`.

| html | element | W0 baseline | W1 = W2 without the sticker-bg line | W2 |
|---|---|---|---|---|
| none / light | html | 2406ac / 2406ac / 2406ac / 340fd9 / 340fd9 | 5b21b6 / 5b21b6 / 5b21b6 / 6d28d9 / 6d28d9 | 5b21b6 / 5b21b6 / 5b21b6 / 6d28d9 / 6d28d9 |
| none / light | inDark | 2406ac / 2406ac / 1a0189 / 8c7bff / 340fd9 | 2406ac / 2406ac / 1a0189 / 8c7bff / **6d28d9** | 2406ac / 2406ac / 1a0189 / 8c7bff / 340fd9 |
| none / light | inLight | 2406ac / 2406ac / 2406ac / 340fd9 / 340fd9 | 5b21b6 / 5b21b6 / 5b21b6 / 6d28d9 / 6d28d9 | 5b21b6 / 5b21b6 / 5b21b6 / 6d28d9 / 6d28d9 |
| dark | html | 2406ac / 2406ac / 1a0189 / 8c7bff / 340fd9 | 2406ac / 2406ac / 1a0189 / 8c7bff / 340fd9 | 2406ac / 2406ac / 1a0189 / 8c7bff / 340fd9 |
| dark | inDark | same as dark/html | same as dark/html | same as dark/html |
| dark | inLight | 2406ac / 2406ac / 2406ac / 340fd9 / 340fd9 | 5b21b6 / 5b21b6 / 5b21b6 / 6d28d9 / 6d28d9 | 5b21b6 / 5b21b6 / 5b21b6 / 6d28d9 / 6d28d9 |

A `derived` token whose Dark column is `same` (sticker-bg-prominent) leaks exactly like an `alias` one (W1). Tokens the DS gives a dark value or a `repeated` line (input-border-focus, sticker-prominent) need nothing. W2 is correct in all nine cases.

## Fix round 1 measurements

Same method, on a fresh build of HEAD plus the working tree at the time (temp-index tree `e4600de2`, `npm ci` and `npm run build` exit 0). Page elements as before, plus `#inPanel` inside `<div class="panel">`.

### Any token, not only colours: `:root` alone is lost in a `.light` island

F1 `:root { --ui-font-body: "Test Font", serif; --ui-spacing-md: 99px; --ui-caret-shape-scale: 0.5; }`

| html | element | font-body | spacing-md | caret-shape-scale |
|---|---|---|---|---|
| none / light / dark | html | "Test Font", serif | 99px | 0.5 |
| none / light / dark | inDark | "Test Font", serif | 99px | 0.5 |
| none / light / dark | inLight | **"Google Sans Flex", system-ui, sans-serif** | **12px** | 0.5 |

F2: the same declarations on `:root, .light` give the override in all nine cases. The DS light block (`:root, .light`) redeclares every token except the two expression tokens, which are declared on `:root` only, so those survive in a `.light` island (caret-shape-scale 0.5 there).

### Consumer reduced-motion block: `!important` makes it order-independent

`--ui-motion-duration-fast`, reduced motion forced (8 rules flipped: 7 DS + 1 consumer):

| case | html | inDark | inLight | inPanel |
|---|---|---|---|---|
| MR0 media block `.panel { 1ms }` (no `!important`) written BEFORE `.panel { 500ms }` | 1ms | 1ms | 1ms | **500ms** |
| MR1 media block `.panel { 1ms !important }` BEFORE the override | 1ms | 1ms | 1ms | 1ms |
| MR2 the same block AFTER the override | 1ms | 1ms | 1ms | 1ms |
| MR4 `.dark { 1ms !important }` block BEFORE `.dark { 500ms }` | 1ms | 1ms | 1ms | 1ms |

MR3 (MR1 without reduced motion): inPanel 500ms, others 150ms; the `!important` applies only under reduced motion. Rows are the same for html none, light and dark.

### Wrapper class: `repeated` aliases go stale too, and so do app aliases

WA1 `:root, .light, .dark { --app-ink: var(--ui-color-primary); }` + `.panel { --ui-color-primary: #ff0000; }`, read inside `.panel`:

| html | primary | primary-border (Dark `repeated`) | --app-ink |
|---|---|---|---|
| none | #ff0000 | **#171717** | **#171717** |
| dark | #ff0000 | **#f9f9f9** | **#f9f9f9** |

WA2: adding `--ui-color-primary-border: var(--ui-color-primary); --app-ink: var(--ui-color-primary);` to the `.panel` rule gives `#ff0000` for all three in both modes.
