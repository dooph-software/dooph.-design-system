# Token recipes

## 1. One surface changes in dark mode only

The request: make the chat code-block well darker in dark mode, and keep light mode and every other `surface-secondary` user as they are.

`.ds-chat-prose pre` paints `var(--ui-color-surface-secondary)`. So do inline `code` in the same prose, Avatar's `bg-surface-secondary`, and the `surface-secondary` name in `DS_COLOR_TOKENS`. Retuning the shared token would repaint all of them. A `.dark .ds-chat-prose pre { background: #… }` rule would hard-wire the look. Add a token instead:

```css
/* tokens.css, light block `:root, .light`, beside the other chat-prose tokens */
  /* Code-block well inside ds-chat-prose. */
  --ui-color-chat-code-surface: var(--ui-color-surface-secondary);

/* tokens.css, `.dark` block, with the other dark paints (NOT the alias group) */
  --ui-color-chat-code-surface: <the dark value you were given>;
```

```css
/* dooph-component-tokens.css: point only the block well at it */
  .ds-chat-prose pre {
    background-color: var(--ui-color-chat-code-surface);
  }
```

- Light resolves exactly as before, through the alias, and follows any consumer retune of `surface-secondary`.
- `.dark` declares its own value. The alias therefore needs no copy in the alias group, and the dark check is satisfied.
- Scope: the request names code *blocks*, so inline `code` keeps `surface-secondary`. Say so in the report.
- A `--ui-color-*` token maps to a `--color-chat-code-surface` theme key, which would generate `bg-chat-code-surface` and the other colour utilities. Only CSS reads this token, so add `"ui-color-chat-code-surface"` to `EXCLUDED` in `scripts/sync-theme.mjs`, beside the other raw-var colours such as the slider paints.
- If no dark value was given, ask for one, or name it as an open question in the report. Never invent one.
- Run `npm run sync-tokens`, `node scripts/generate-docs.mjs` and `npm run lint`. Then, in Storybook with Theme set to Dark, read `--ui-color-chat-code-surface` on a `pre` inside the prose.

## 2. An expression token, end to end

An expressive detail inside a practical component, such as "like the caret does" or "our wavy underline", gets a token that the practical preset can switch off. The dropdown caret is the working precedent: `--ui-caret-shape-scale` and `--ui-caret-nudge`.

1. **Default**, in the `:root`-only block at the end of `@layer ds.tokens`. Put the whole declaration and its marker on ONE line, because lint finds the marker only when it follows the `;` on the same line:
   ```css
     --ui-<detail>: <signature value>; /* expression */
   ```
   Never declare it beside `.light` or `.dark`. A theme-class subtree would then restore a detail that the preset turned off.
2. **Neutral value**, in the preset `[data-ds-expression="practical"]` inside `@layer ds.expression`. That value turns the detail off. Lint fails when a marked token is missing here, and when the preset sets an unmarked one.
3. **`EXCLUDED`**: add the name to the "Expression tokens" group in `scripts/sync-theme.mjs`. sync-theme never reads the expression block, so the entry is a record that the token is raw-var-only, not a filter. Keep the group complete.
4. **The read**: only a CSS rule whose selector contains `.ds-expr-` may read it (see `.ds-expr-caret-shape` / `.ds-expr-caret-nudge` in `src/styles/index.css`). The component adds the `ds-expr-*` class. Components never set or read the token: no inline style, no arbitrary-property class, no `setProperty`.
5. **Neutralised, the component is still complete**: no empty frame and no gap where the detail was. Lint cannot check this; check it in the Practical story (see dooph-ds-adding-a-component).

The lint check is "expression tokens set or read outside the expression system".

## 3. Blast radius of an existing token

Before you retune `--ui-x`, list:

```sh
# aliases and derived values in tokens.css, plus raw var() reads in the helper stylesheets
# (repeat for each alias you find: its dependents move too)
grep -rnE -e "--ui-x([ ,)]|$)" src/styles   # also catches a var( whose name wraps to the next line
# its theme utility in class strings (pick the families that apply)
grep -rnE "(bg|text|border|fill|stroke|outline|ring|shadow|rounded|p|px|py|gap|m)-x([^a-z0-9-]|$)" src --include=*.ts --include=*.tsx
# the DS_COLOR_TOKENS name lookup behind `color` props
grep -n "var(--ui-x)" src/utils/color.ts
```

The utility name is the token minus its family prefix (`--ui-color-surface-secondary` becomes `bg-surface-secondary`, `text-…`, `border-…`). `ALIASES` in sync-theme renames the `-foreground` tokens to `-fg`. Report each dependent and say whether it moves on purpose. If only one of them should move, use recipe 1.

## 4. The motion scale

- Durations are `--ui-motion-duration-{fast,base,slow,slower,slowest}` and curves are `--ui-motion-ease-{standard,enter,exit,linear}`. The comment above them in tokens.css says which job each step serves. They map to no theme key, and `EXCLUDED` lists them all. Components read them through the `ds-motion-*` helpers and `var()` in CSS, never through `duration-N` or `ease-*` utilities.
- Under reduced motion, every scale duration collapses to `1ms`, not `0ms`. A 0ms transition never fires `transitionrun` or `transitionend`, and some components rely on those events. Staggers go to `0ms`. Loop cycle times are deliberately absent, because each loop's own reduce rule stops it.
- The block's `!important` is load-bearing. The tokens are layered, so without it a consumer's unlayered motion override would beat the user's reduced-motion setting. The guarantee covers overrides on `:root`/`.light` only. A consumer override on another selector needs its own reduced-motion block (see dooph-design-system-theming).
- `--ui-shape-morph-duration` and `--ui-shape-morph-ease` are generated from `scripts/shapeMorphSpring.mjs` by `npm run generate-shape-morph-ease`.

## 5. Structural limits of the scripts

- sync-theme reads the FIRST `:root` / `:root, .light` block. Keep the light block first in the file.
- The dark check finds the blocks by `:root, .light {` and `.dark {` at the start of a line. Keep both selectors as they are.
- generate-docs fails on a block it does not know (`TOKEN_BLOCKS` in `scripts/generate-docs.mjs`). A new kind of block needs an entry there.
