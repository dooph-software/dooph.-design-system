---
name: dooph-ds-editing-tokens
description: Use when editing src/styles/tokens.css or the EXCLUDED/ALIASES lists in scripts/sync-theme.mjs; when adding, retuning or aliasing a --ui-* token; when something must look different in dark mode only, or in one place only while a shared token stays put; when adding an expression token or touching the practical preset or the motion scale; or when lint reports "generated theme out of date" or a dark-alias or expression-token failure.
---

# Editing tokens.css

`src/styles/tokens.css` defines every `--ui-*` token, one block per mode and preset. Elsewhere in `src/styles`, only the ShimmerText re-bases in `dooph-component-tokens.css` set one: they point `--ui-shimmer-*` at the chat's own tokens. The theme utilities, `theme.css` and the token contract are generated from tokens.css, and so are cn's merge lists, together with the class rules in `index.css`. A look that differs by mode or place is a token here, never a selector elsewhere.

**Not for:** how components consume tokens (see dooph-ds-styling), or consumer overrides (see dooph-design-system-theming).

## Quick reference: where a change goes

| Block | Selector (layer) | Put here |
|---|---|---|
| light | `:root, .light` (`ds.tokens`) | every token's light value (the only block sync-theme reads) |
| dark | `.dark` (`ds.tokens`) | values that resolve differently in dark; the alias re-declaration group |
| reduced motion | `@media (prefers-reduced-motion: reduce)` → `:root, .light` | scale durations `1ms`, staggers `0ms`, all `!important` |
| expression defaults | `:root` only (`ds.tokens`) | one line per expressive detail, marked `/* expression */` |
| practical preset | `[data-ds-expression="practical"]` (`ds.expression`) | each expression token's neutral value |

Authority comes from the layers: consumer (unlayered) > expression preset > DS defaults. The exception is the reduced-motion block's layered `!important`, which beats consumer overrides on `:root`/`.light`. A consumer override on another selector needs its own reduced-motion block (see dooph-design-system-theming). Keep every declaration inside its layer.

## Rules

1. **A dark-only look is a `.dark` token line.** Never write a `.dark` selector, a `dark:` variant or a hex paint outside tokens.css, nor `prefers-color-scheme` anywhere, tokens.css included: system mode is the app's job. *Prevents:* a paint that still reaches a `.light` island under `<html class="dark">` and that no consumer token override reaches. Lint checks: "dark-mode rules or hex colours outside tokens.css" (a `.dark` selector, a dark variant or hex in a component stylesheet, `prefers-color-scheme` in any stylesheet, a `dark:` variant in a class string) and "hex colour literals in components and stories".
2. **To change one place, add a token and leave the shared one alone.** Declare `--ui-new: var(--ui-shared)` in light, so light is unchanged, and give it its own `.dark` value. *Prevents:* the false choice between repainting every user and hard-wiring.
3. **Retuning an existing token? Report its blast radius**: aliases, utility, raw `var()` reads, `DS_COLOR_TOKENS` entry (recipes, section 3). Then grep the old literal across `src/`. Update every comment that only restates the old value, header contracts included (code and contract ship together). A comment whose sum no longer balances is a design decision: flag it in the hand-back, never reword it to balance. *Prevents:* repainting components nobody asked to change, stale values left in comments and contracts, and a sum quietly rewritten to hide the slack the new value leaves.
4. **Add a `.dark` line only when the *resolved* value changes.** An alias (or `color-mix()`, shadow) reaching a token `.dark` changes is repeated verbatim in the alias group; a literal equal to its light value is deleted. *Prevents:* dark islands keeping light values, or pinning a consumer's `:root` override out of `.dark` islands. The lint check is "dark aliases missing from .dark, and redundant .dark lines".
5. **Never hand-edit generated output. Run `npm run sync-tokens`.** It writes index.css's `__GENERATED_THEME_*__` block, `src/styles/theme.css` and `src/utils/twMergeTheme.ts`. *Prevents:* drift from the generator. The lint check is "generated theme out of date".
6. **Decide whether the token gets a utility.** Only the `--ui-color-*`, `-shadow-*`, `-radius-*`, `-font-<role>`, `-text-*` and `-spacing-*` families (plus the names in `ALIASES`) map to theme keys. If CSS reads one of these only through `var()`, add it to `EXCLUDED`. *Prevents:* a utility nothing should use.
7. **Build an expression token end to end, all four steps** (recipes, section 2): the declaration and its `/* expression */` marker on one line in the `:root` expression block; its neutral value in the practical preset; its name in the "Expression tokens" group of `EXCLUDED` in `scripts/sync-theme.mjs`; a read only in a `.ds-expr-*` rule. *Prevents:* a detail the practical preset cannot switch off, and an `EXCLUDED` group that no longer lists every expression token (no lint check sees that one). The lint check is "expression tokens set or read outside the expression system".
8. **Motion stays on the scale.** A component's own motion token is only for a loop, a stagger or the generated spring. A new scale step or stagger goes in the reduced-motion block; a loop cycle time never does (its own reduce rule stops it). Never edit the lines between the `__SHAPE_MORPH_EASE_*__` markers; run `npm run generate-shape-morph-ease`. *Prevents:* motion that drifts from the scale or ignores reduced motion. The lint check is "motion timing literals outside tokens.css".
9. **Write the comment above a token for consumers:** it is published in the token contract. *Prevents:* a misleading consumer reference. Run `node scripts/generate-docs.mjs`, then `node scripts/sync-skills.mjs`. The lint check is "generated doc references out of date".

Recipes: [references/recipes.md](references/recipes.md). Every token by block: [token-contract.md](../../../skills/dooph-design-system-theming/references/token-contract.md).

## Rationalizations

| Agent said | Reality |
|---|---|
| "I shouldn't change the token itself. Instead, I should add a dark-mode-specific override for the component's selectors." | Third option: a new token in both blocks. |
| "the cleanest approach is to override the background directly … inside a `.dark` selector." | A bypass; lint stays green, so nothing pushes back. |
| "Light mode is untouched since none of these rules apply without the `.dark` ancestor." | A light-block alias leaves light untouched too, and stays overridable. |
| "Now add the Tailwind aliases in both theme.css and index.css." | Those are generated. Run `npm run sync-tokens`. |

**Red flags:** you type `.dark ` outside tokens.css; you put a hex colour in `dooph-component-tokens.css` or `index.css`; you open `theme.css` or `twMergeTheme.ts` to edit them.

## Verify

1. Run `npm run sync-tokens`, then `node scripts/generate-docs.mjs`, then `node scripts/sync-skills.mjs` (generate-docs rewrites the codebase-map skill's inventory, so the skill mirrors go stale).
2. Run `npm run lint`. It must exit 0; paste its last line (`conventions: N checks passed`) in the hand-back. Never report "clean" from tsc alone.
3. In Storybook (`npm run storybook`), the Theme toolbar's Dark toggles `.dark` on `<html>`. Read `getComputedStyle(el).getPropertyValue('--ui-…')` in light, dark, a `<div class="dark">` island, and (expression tokens) under `data-ds-expression="practical"`.
4. Report each token added or changed, its light/dark values and its blast radius.

## Related

dooph-ds-styling, dooph-ds-codebase-map, dooph-ds-adding-a-component, dooph-design-system-theming.
