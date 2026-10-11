---
name: dooph-design-system-theming
description: Use when an app on @dooph-software/design-system needs a --ui-* token overridden, a brand colour changed, something different in light or dark mode only, a dark or light section, an app CSS variable that points at a DS token, a motion retune, or the practical expression; or when an override shows up in the wrong mode, is ignored inside a .dark or .light section, or changes nothing.
---

# Theming the dooph design system

Every DS colour, size and motion value is a `--ui-*` custom property in `@dooph-software/design-system/styles.css`. Theme an app by overriding them in your global CSS. `references/token-contract.md` lists every token.

**Not for:** imports, fonts and the Tailwind preset (see dooph-design-system-setup), or tokens in `className` (see dooph-design-system-usage).

## Authority

The DS's tokens sit in two cascade layers, `ds.tokens` (defaults, dark, reduced motion) and then `ds.expression` (the practical preset). **Unlayered** CSS outranks both, whatever the import order or specificity:

> your unlayered CSS > the expression preset > DS defaults

- **Write overrides at the top level of your global stylesheet.** Inside `@layer base`, the DS value wins and nothing changes.
- **Never edit `node_modules` or put a hex in `className`.** The edit is lost on reinstall, and the hex ignores dark mode.
- **The exception is reduced motion.** The DS collapse is a layered `!important`, which beats even your `!important` (see Motion).

## Dark mode and islands

- **Dark is the `dark` class on `<html>`, and your theme provider toggles it.** The DS has no `prefers-color-scheme` rule, so following the OS setting is the provider's job.
- **`className="dark"` on any element makes its subtree dark.** `className="light"` does the reverse inside a dark page.
- **Portalled content leaves the island.** Modal, Sheet, Popover, menu and Tooltip content mounts in `<body>`. Pass `portalProps={{ container }}` with an element inside the island, or `portal={false}`. Putting the island's class (`dark` or `light`) on the content's `className` misses the Modal and Sheet backdrop, which renders beside the content.

## Override recipes

`:root` is `<html>`, even when it carries `dark`. The DS redeclares every token except the two expression tokens on each `.light` element. So a `:root`-only override of any token (colour, font, spacing, motion) is lost inside a `.light` island. That is why the light recipes name `.light`. Pick the row for what should change:

| Want | CSS |
|---|---|
| Light only | `:root:not(.dark), .light { --ui-x: v; }`. If the token's Dark column says `same`, also add `.dark { --ui-x: <DS value>; }` |
| Dark only | `.dark { --ui-x: v; }` |
| Per mode | `:root:not(.dark), .light { --ui-x: a; }` `.dark { --ui-x: b; }` |
| Every mode | `:root, .light, .dark { --ui-x: v; }` (for motion tokens, see Motion) |

**The alias rule.** A token that reads another one (Alias `alias` or `derived`) resolves where the DS declares it: in `:root, .light`, and again in `.dark` when marked `repeated`. Anywhere else it inherits the colour it already resolved to, so a new fill gets the old border. Restate the readers of the token you override, using the DS's own text (for example `--ui-color-prominent-border: var(--ui-color-prominent);`):

- in a `.dark` rule, every reader whose Dark column says `same`. Those marked `repeated` follow on their own.
- in a rule on any other element (a wrapper class), every reader, `repeated` ones included.

**Change only what was asked.** For "the prominent colour", override that token and its states (hover, active, border). Don't touch the focus ring or `--ui-prominent-color`; name them in your report as candidates instead.

## Your own aliases

`--app-surface: var(--ui-color-secondary)` resolves where it is declared, then inherits as a fixed colour. Declare it on `:root, .light, .dark`. Declared on `:root` alone, it shows the light value inside a dark island. If you retune a DS token on a wrapper class, restate your aliases of it in that rule too.

## Motion

A motion override on `:root, .light` stays under the DS's reduced-motion collapse. On any other selector (a `.dark` island, a component class), it plays at full length for users who asked for less motion. Pair it with its own block. The `!important` makes the block win in any source order:

```css
@media (prefers-reduced-motion: reduce) { .panel { --ui-motion-duration-fast: 1ms !important; } }
```

Use `1ms`, not `0ms`. A 0ms transition fires no `transitionend`, and some components wait for that event.

## Expression

The default is the signature look. `<html data-ds-expression="practical">` (Next.js `app/layout.tsx`, Vite `index.html`) sets `--ui-caret-shape-scale` and `--ui-caret-nudge` to `0`. The caret in `DropdownTrigger` and `TypeableDropdownTrigger` becomes a plain chevron, with no shape and no hover lean. Expressive components (OutlineButton, CTAButton, the shapes) are opt-in by use. Your unlayered CSS beats the preset.

## Reading token-contract.md

- **Dark**: a value, `same` (no DS dark value), or `repeated` (the DS redeclares the alias in `.dark`).
- **Alias**: `alias` / `derived` mean the token reads another one. Search for `var(--ui-your-token)` to find what reads yours.
- **Reduced motion**, **Practical preset**, **Expression**: what those blocks set.

## Common mistakes

| Thought | Reality |
|---|---|
| "scoped to `:root, .light` so dark mode is untouched" | `:root` is `<html class="dark">`, so dark gets the light value, even for tokens that have a dark value |
| "`:root:not(.dark)` is enough" | A `same` token leaks into dark islands, and a `.light` island drops the override |
| "It builds, so it works" | Typecheck can't see the cascade; read the values |

## Verify

In the browser, read the token four times: on `<html>` in light, after toggling `dark` on `<html>`, inside a `dark` island on a light page, and inside a `light` island on a dark page:

```js
getComputedStyle(document.documentElement).getPropertyValue("--ui-color-prominent")
```

`references/overrides.md` holds the measured matrix behind these rules.

## Related skills

dooph-design-system-setup, dooph-design-system-usage.
