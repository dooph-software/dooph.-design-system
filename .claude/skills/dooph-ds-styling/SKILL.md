---
name: dooph-ds-styling
description: Use when writing or reviewing a className, cva recipe or stylesheet rule for a design-system component (src/components, src/styles/index.css, dooph-component-tokens.css); when asked to add a hover lean, tilt, nudge, wiggle, underline, decoration, shape or other polish to an existing component, especially "like the caret does", "our <thing>" or "signature"; or when lint reports hex, spacing, motion, focus, disabled, var() or package-class failures.
---

# Styling inside components

Every visual value comes from a token, through a theme utility or a `ds-*` helper; every flourish on a practical component must be switchable off by `data-ds-expression="practical"`. Not for editing `tokens.css` (dooph-ds-editing-tokens) or props and API (dooph-ds-writing-components).

## Expressive details: read before any visual polish

**Test:** would a product on `data-ds-expression="practical"` expect it gone?

- **Base look:** state feedback that the spec defines, such as hover, pressed and open colours, borders, the focus ring and the disabled fade. Build it with utilities and helpers.
- **Expressive detail:** anything beyond that on a practical component (an input, a link, a trigger, a menu item), such as a lean, tilt, nudge, decoration or shape. A request that says "like the caret does", "our X" or "signature" also means one.
- **Unsure:** ask the maintainer.

Expressive *components* (OutlineButton, CTAButton, shapes) are opt-in by use and are never switched.

To build an expressive detail, copy DropdownCaret's mechanism:

1. Give the detail one token, marked `/* expression */`, with a neutral value in the practical preset. dooph-ds-editing-tokens covers the steps.
2. Read the token only in a `.ds-expr-<detail>` rule in `src/styles/index.css`. Any state goes in that rule's selector.
3. The component only adds the class. It never sets the token: no inline style, arbitrary-property class, `setProperty` or prop.
4. At the neutral value, the component must still be complete, with no empty frame or gap.
5. Add a header-contract line ("must stay neutralisable by the practical preset") and a Practical story. The contract is a block comment that opens the file, never the component's JSDoc, which is published to components.md.

This applies even when the file has no header. Lint checks only tokens that are already marked, so a hard-wired utility passes it. For the full recipe and a sketch, see [references/expressive-details.md](references/expressive-details.md).

## Rules: the rule, the failure it prevents, "the lint check"

- **Colour, radius and shadow come from theme utilities** (`bg-secondary`, `rounded-tight`, `shadow-menu`). A hex or a Tailwind default ignores dark mode and overrides. "hex colour literals in components and stories", "dark-mode rules or hex colours outside tokens.css", "Tailwind default radii and shadows".
- **Spacing uses the scale words.** An off-scale value gets a token, not a bracket, because a bracket ignores token changes. "numeric Tailwind spacing", "arbitrary px/rem/em/deg in classNames". Lint knows only those units, but any bracketed look value is a missing token.
- **A token with no theme utility goes behind a `ds-*` helper**, never `[var(--ui-…)]` or `(--ui-…)`. "raw var(--ui-*) in className brackets or (--ui-*) shorthand". Where a theme utility exists, use it, always on a root that takes `className`: cn() cannot merge a helper (`cn("ds-p-ui-sm", "p-lg")` keeps both), so a consumer's class could not replace it.
- **Motion comes from the scale**, through `ds-motion-*` or `var(--ui-motion-*)` in CSS. A literal drifts from every other animation and escapes the reduced-motion collapse. Write your own reduce rule only where that collapse isn't enough: for an off-scale value (a loop, the shape-morph spring), or for motion that must become a static frame, not a shorter one (RollHover). "motion timing literals outside tokens.css", "JS timers and animation loops outside their allowlist".
- **Focus and disabled looks come from the helpers.** Hand-rolled ones drift, and they double-fade nested controls. "hand-rolled focus rings", "hand-rolled disabled looks".
- **Variants go through cva, with `className` last in `cn(…)`**, so the consumer's class wins. cn() learns class names from generated lists. After adding a `.text-style-*` or `.h-*`/`.size-*`/`.min-w-*` … rule, run `npm run sync-tokens`. Otherwise cn() misfiles the class and can erase a role as a colour. "generated theme out of date".
- **Never put a Tailwind variant on a package class** (`hover:ds-*`). It emits no rule. Put the state in the helper's selector. "Tailwind variant on a DS package class".
- **Never put `var()` in an SVG geometry attribute (`width`, `r`, `cx`…).** SVG 2 parses a presentation attribute as a value, not a declaration, so `var()` there is not specified. Chromium draws it, but its SVG DOM reads the length as 0 (`circle.r.baseVal.value`). Keep a plain number attribute and set the token through `style` or a class. `fill` and `stroke` may take `var()`. "var() in SVG geometry attributes".
- **CSS goes in `src/styles/`**, with helpers in `@layer utilities`. A `.css` under `src/components` never ships, because emit-css compiles only `src/styles/build.css`, which imports `index.css`. Text roles sit in `@layer components`, so a utility would beat a role; typography still goes only through Text props (dooph-ds-writing-components).
- **Text goes through Text components** (dooph-ds-writing-components). "text-style classes outside Text components".

## Quick reference

| Need | Use |
|---|---|
| Spacing (px) | `xxxs` 2, `xxs` 4, `xs` 6, `sm` 8, `rg` 10, `md` 12, `lg` 16, `xl` 20, `xxl` 26, `xxxl` 42 |
| Motion scale (`--ui-motion-*`) | `fast`, `base`, `slow`, `slower`, `slowest`; eases `standard`, `enter`, `exit`, `linear` |
| Transitions | `ds-motion-state` (colours, `rotate`, `scale`, `translate`); `ds-motion-overlay(-dialog/-sheet)` |
| Focus | `ds-focus-visible-ring`, `ds-focus-within-ring(-danger)`, `ds-focus-ring-on-focus`, `ds-focus-ring-danger-on-focus`, `ds-focus-ring-on-open`, `ds-focus-ring-sm`, `ds-shape-button-focus-visible` |
| Disabled | `ds-disabled-state`, `ds-radix-data-disabled`, `ds-opacity-disabled` (content only) |
| Tokens | [token-contract.md](../../../skills/dooph-design-system-theming/references/token-contract.md) |
| Utilities | the generated `@theme inline` block in `src/styles/index.css`: `--color-x` → `bg-x`/`text-x`, `--spacing-x` → `p-x`/`gap-x`, `--radius-x` → `rounded-x`, `--shadow-x` → `shadow-x` |

## Rationalizations

| Said in baseline | Reality |
|---|---|
| "a simple CSS rotation on hover would be more appropriate" | Simple is the bug: no preset can remove a utility. |
| "The simplest approach: add the decoration's Tailwind classes to the component." | Same bug. "Our X" exists: find it, or ask. |
| "No contract header." | The rule applies across the repo. |
| "The effect mirrors the dropdown caret's hover lean" | It copied the look, not the token or the `.ds-expr-*` rule. |

**Red flags** on a practical component:
- `hover:` or `group-hover:` combined with `rotate-`, `translate-` or `scale-`;
- `underline` or `decoration-`;
- a bracketed value.

## Verify

If you added a token or a `.text-style-*`, `.h-*`, `.size-*` or `.min-w-*` rule, run `npm run sync-tokens`, then `node scripts/generate-docs.mjs`, then `node scripts/sync-skills.mjs`. Then run `npm run lint`. It must exit 0; paste its last line (`conventions: N checks passed`) in the hand-back. `tsc` passing on its own is not "clean". In Storybook (`npm run storybook`), check every variant and state in both themes, then check the Practical story for any trace of the detail.

## Related

dooph-ds-editing-tokens · dooph-ds-writing-components · dooph-ds-adding-a-component · dooph-ds-codebase-map
