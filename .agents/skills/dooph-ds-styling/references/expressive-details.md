# Expressive details: the full recipe

Read SKILL.md first. This file walks through DropdownCaret, the only component that ships expressive details (two of them), and then sketches the same mechanism for a new detail.

## Is it an expressive detail?

Ask: *would a product that sets `data-ds-expression="practical"` on `<html>` expect this to be gone?* If yes, it is an expressive detail. Typical cases are a hover lean, tilt or nudge, a decorative shape behind an icon, and an always-on decoration such as a mark beside a label, all on a component people use for its function. A static detail counts as much as a moving one.

If it is a detail, a utility in the component's className is never the answer. The practical preset sets only custom properties, so it can't reach a hard-wired utility.

If the request names "our X", X exists somewhere in the DS. Search `src/` for it and reuse its geometry and tokens. If nothing matches, ask what X is instead of inventing it.

## The precedent: DropdownCaret

DropdownCaret has two details, its shape and its hover nudge.

**1. Tokens.** They live in `src/styles/tokens.css`, in the expression `:root` block inside `@layer ds.tokens`, each with the marker:

```css
:root {
  --ui-caret-shape-scale: 1; /* expression */
  --ui-caret-nudge: var(--ui-shape-morph-nudge); /* expression */
}
```

The practical preset in `@layer ds.expression` gives each one its neutral value:

```css
[data-ds-expression="practical"] {
  --ui-caret-shape-scale: 0;
  --ui-caret-nudge: 0;
}
```

The block is `:root` only, not `:root, .light`, so that a theme-class subtree cannot quietly bring back a detail the preset turned off. A consumer's own unlayered tokens still beat both blocks. Adding, marking and syncing a token is covered by dooph-ds-editing-tokens.

**2. Helper rules.** They sit in `src/styles/index.css`, inside `@layer utilities` and beside the component's other rules. Every read of a token happens in a `.ds-expr-*` rule:

- `.ds-expr-caret-shape` multiplies geometry by the scale. At 1 the root is a square the height of the trigger, and at 0 it is the chevron plus a trailing inset. The frame is sized by `scale × frame`, so at 0 it draws nothing and leaves no empty box. The chevron's colour is mixed by the scale, so at 0 it takes the trigger's text colour.
- `.ds-expr-caret-nudge` bridges the token into the morph engine's private input. The hover and disabled conditions live in the selector, not in a Tailwind variant:

```css
.ds-dropdown-caret-host:hover:not(:disabled):not([aria-disabled="true"]):not([data-disabled])
  .ds-expr-caret-nudge {
  --ds-shape-morph-nudge: var(--ui-caret-nudge);
}
```

**3. Component.** `DropdownCaret.tsx` adds the classes and nothing more: `"ds-dropdown-caret ds-expr-caret-shape ds-expr-caret-nudge …"`. It has no inline style, no prop and no listener for either detail. Its state comes from the nearest `.ds-dropdown-caret-host` ancestor.

**4. Header contract.** It is the block comment that opens `DropdownCaret.tsx` (`/*` on line 1, with `## behavior` and `## constraints` spelled that way); a file with none gets one. Never put it inside the component's JSDoc: that comment is published to components.md, and the inventory does not count it as a contract. The behaviour section names both details, their tokens, their helpers and what the practical preset leaves behind. The constraints section says why: "The shape and the nudge must stay neutralisable by the practical preset", and it names the failures this prevents, a practical product still showing the signature shape, or an empty frame beside the chevron.

**5. Story.** `Practical` in `DropdownCaret.stories.tsx` renders the same triggers twice: once plain, and once inside `<div data-ds-expression="practical">`, labelled "Default (signature)" and "Practical".

## Designing the token

- Choose a value whose neutral form switches the detail off cleanly, and check that it draws nothing. Some properties have a floor (a zero line thickness can still paint one device pixel), so switch a detail off through a value that draws nothing, not a size of zero, and look at it. If you have not seen the Practical story, say so in the hand-back; never call it clean. Both caret tokens are neutral at `0`. One is a magnitude (the nudge is a lean of 0). The other is a 0–1 scale that the helper multiplies into sizes and colour mixes, so values in between interpolate.
- Write the helper so that the neutral value leaves a finished component. Work out the geometry at neutral, just as `.ds-expr-caret-shape` works out the width the chevron needs at 0.
- Take any value or angle from the spec or the maintainer. Never guess a design value, and never fall back to a bracket utility.
- Take motion from the scale. `ds-motion-state` on the moving element already transitions `rotate`, `scale`, `translate` and `transform` at `--ui-motion-duration-fast`. The caret's lean is eased by the morph engine's own rule, also on the scale, with the `base` duration and the `enter` curve. Reduced motion needs nothing extra, because the global block collapses the scale.

## Sketch: a hover lean on a practical component's icon

The token and the classes below (`--ui-toast-close-lean`, `ds-toast-close-host`, `ds-expr-toast-close-lean`) are **hypothetical**, and the angle is a placeholder for the spec value. `ToastClose` (in `Toast.tsx`), `BaseText`, `ToastPrimitive.Close` and `CloseCancelIcon` are real; the sketch shows where each piece would go, for a lean on ToastClose's close icon.

```css
/* tokens.css, expression :root block (steps: dooph-ds-editing-tokens) */
--ui-toast-close-lean: <angle from the spec>; /* expression */
/* tokens.css, [data-ds-expression="practical"] */
--ui-toast-close-lean: 0deg;

/* index.css, @layer utilities: the token's only reader; state in the selector */
.ds-toast-close-host:not(:disabled):hover .ds-expr-toast-close-lean {
  rotate: var(--ui-toast-close-lean);
}
```

```tsx
// Toast.tsx, ToastClose: classes only, with no token, style or handler
<BaseText as={ToastPrimitive.Close} className={cn(…, "ds-toast-close-host", className)} …>
  {children ?? <CloseCancelIcon className="ds-motion-state ds-expr-toast-close-lean" />}
```

Then add `"ui-toast-close-lean"` to the "Expression tokens" group of `EXCLUDED` in `scripts/sync-theme.mjs`, the header-contract lines at the top of the file, and a `Practical` story built like the caret's.

## Checklist

- [ ] One token per detail, marked `/* expression */`, with its neutral value in the preset and its name in the "Expression tokens" group of `EXCLUDED` in `scripts/sync-theme.mjs` (dooph-ds-editing-tokens).
- [ ] Only `.ds-expr-*` rules read the token, and any state is in the rule's selector.
- [ ] The component adds classes only. Lint check: "expression tokens set or read outside the expression system".
- [ ] Neutralised, the component is complete, with no empty frame or gap.
- [ ] The header contract, in the block comment that opens the file (never the JSDoc), has a behaviour line and a "must stay neutralisable by the practical preset" constraint.
- [ ] A `Practical` story shows the default beside a `data-ds-expression="practical"` wrapper.
- [ ] The JSDoc describes the new default look.
- [ ] `npm run lint` exits 0. In the Practical story, the practical column shows no trace of the detail; if you could not look, the hand-back says so.
