# Token overrides: the measured matrix

Every rule in the theming skill was checked in a browser against the built `styles.css`. The test used an unlayered consumer stylesheet and three places for each token: `<html>`, a `class="dark"` element inside a light page, and a `class="light"` element inside a dark page. This file gives the results, so you can see why each selector is or is not enough.

## Why the obvious selectors fail

`<html>` is `:root`, also when it has the `dark` class. Your unlayered rule outranks every DS declaration on the same element, because the DS's are layered. The DS also redeclares its light tokens on every `.light` element and its dark tokens on every `.dark` element. A custom property declared on an element beats the value inherited from its parent.

The test override set `--ui-color-secondary`, which has a DS dark value, and `--ui-color-prominent`, whose Dark column says `same`. For the intent "light mode only", these are the wrong results:

| Selector | `<html class="dark">` | `.dark` island in a light page | `.light` island in a dark page | `<html>` with no class |
|---|---|---|---|---|
| `:root, .light` | both tokens take the light override | prominent takes the light override | correct | correct |
| `:root` | both take the light override | prominent takes the light override | override lost (DS light value) | correct |
| `:root:not(.dark)` | correct | prominent takes the light override | override lost | correct |
| `.light` | correct | correct, or prominent leaks when `<html>` has `light` | correct | override missing |
| `:root:not(.dark), .light` + `.dark { --ui-color-prominent: #340fd9 }` | correct | correct (but see aliases) | correct | correct |

Two facts sit behind this table:

- A token that has a DS dark value is still overridden in dark by a rule that matches `<html class="dark">`. The DS dark value survives only inside a `.dark` island.
- A token whose Dark column says `same` has no DS `.dark` declaration. A `.dark` island therefore inherits whatever its parent holds, including your light override. Only a `.dark` rule of your own stops that.

The `.light` column holds for every token, not just colours. A `:root`-only override of `--ui-font-body` or `--ui-spacing-md` measured as the DS default inside a `.light` island, and `:root, .light` reached it. The only exceptions are the two expression tokens: the DS declares them on `:root` alone, so they never reset on `.light`.

## Aliases resolve where they are declared

A value such as `var(--ui-color-prominent)` is resolved on the element that declares it, and descendants inherit the finished colour. The DS declares its aliases in its light block (`:root` and `.light`). It repeats in `.dark` only the aliases whose targets change in dark; those rows say `repeated`.

So a DS token that reads one you override re-resolves only on an element where the DS declares it again:

- **In a `.dark` rule,** readers marked `repeated` follow, because the DS redeclares them on that element. Readers marked `same` keep the value they resolved higher up.
  - `.dark { --ui-color-primary: red; }`: `--ui-color-primary-border` (`repeated`) follows to red.
  - `.dark { --ui-color-prominent: #8c7bff; }` in a dark island: the fill is `#8c7bff`, but `--ui-color-prominent-border` (`same`) stays `#340fd9`.
- **In a rule on any other element (a wrapper class),** no reader follows, `repeated` ones included. The DS declares nothing on that element.
  - `.panel { --ui-color-primary: red; }`: inside `.panel`, `--ui-color-primary` is red but `--ui-color-primary-border` stays `#171717` (`#f9f9f9` in dark), even though it is `repeated`.
  - Your own `--app-*` aliases of that token behave the same way.

The fix is to restate the readers in your rule, using the DS's own text from the contract's Light column. In a `.dark` rule, restate the `same` ones. In a wrapper rule, restate all of them, and your own aliases too.

## Worked example: light-only brand violet

The prominent family has no DS dark values. Its border aliases and its sticker wash are `same` in dark, so they are restated under `.dark`. The `.dark` values are the DS defaults from token-contract.md.

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

This was measured correct on `<html>` with no class, with `light` and with `dark`, and inside dark and light islands. Leave out the last line and a prominent Sticker inside a dark island keeps the violet wash. Tokens that read the prominent family but have their own dark value (`--ui-color-input-border-focus`, `--ui-color-sticker-prominent`) need nothing.

To find the tokens that read a token you override, search token-contract.md for `var(--ui-your-token)`. Repeat the search for each token you find.

## Per-mode values and source order

`:root:not(.dark), .light { a }` plus `.dark { b }` is correct in every case and in either source order. `:root, .light { a }` plus `.dark { b }` depends on order: with the `.dark` rule written first, `<html class="dark">` gets `a`.

## Your own aliases

`--app-surface: var(--ui-color-secondary)`:

| Declared on | Dark island in a light page | Light island in a dark page |
|---|---|---|
| `:root` | light value (wrong) | dark value (wrong) |
| `:root, .dark` | correct | dark value (wrong) |
| `:root, .light, .dark` | correct | correct |

## Motion under reduced motion

The DS collapses its motion durations to `1ms` (and its staggers to `0ms`) under `prefers-reduced-motion: reduce`. It does this on `:root` and `.light`, as a layered `!important`.

| Your override | Reduced-motion result |
|---|---|
| `:root { …: 500ms }` or `:root, .light { … }` | `1ms` everywhere, even if your value is `!important` |
| `.dark { …: 500ms }` | `500ms` inside dark islands (not on `<html class="dark">`) |
| `.panel { …: 500ms }` | `500ms` inside `.panel` |
| `.panel` plus your own `@media (prefers-reduced-motion: reduce) { .panel { …: 1ms !important } }` | `1ms`, whether the block comes before or after the override |
| the same block without `!important`, written before the override | `500ms`: same specificity, so the later rule wins |

Without reduced motion, a `:root`-only motion override does not reach a `.light` island, because the DS redeclares the scale there. Use `:root, .light`.

## Layers

An override inside `@layer base { :root { … } }` changed nothing in any case. Put an unlayered rule before or after the DS import; both give the same result.

## Expression preset

| | `--ui-caret-shape-scale` | `--ui-caret-nudge` |
|---|---|---|
| No attribute | `1` | follows `--ui-shape-morph-nudge` (`0.15`) |
| `data-ds-expression="practical"` on `<html>` | `0` | `0` |
| practical, plus your `:root { --ui-caret-shape-scale: 1 }` | `1` | `0` |

The preset reaches into dark and light islands. Put the attribute on `<html>`. It also works on a nested element, for that subtree only, but the DS discourages nesting it.

## Portals

Portalled content (Modal, Sheet, Popover, menu and Tooltip content) mounts in `<body>` unless you give it a container. An element in `<body>` reads light tokens on a light page, whatever island opened it. The same element with class `dark` reads dark tokens.

The robust fix is `portalProps={{ container }}`, where the container is an element inside the island, so everything in the portal inherits the island's tokens. The other option is `portal={false}`. Putting the island's class (`dark` or `light`) on the content's `className` themes the panel only. Modal and Sheet render their backdrop as a sibling of the content inside the portal, so the backdrop stays on the page's theme.
