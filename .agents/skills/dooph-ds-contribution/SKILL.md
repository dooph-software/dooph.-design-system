---
name: dooph-ds-contribution
description: Use when adding a new component, modifying an existing component's API, updating tokens, or syncing a component with a Figma spec inside the @dooph-software/design-system repository. Provides the step-by-step process, required checklists, and anti-patterns to avoid. Always load alongside dooph-ds-architecture and dooph-ds-codebase.
---

# dooph Design System — Contribution Guide

How to correctly add or change things inside the `@dooph-software/design-system` package.

---

## Adding a New Component

### Step 1 — Read the Figma spec first
Before writing code, pull the design from Figma:
- Use `mcp__Figma__get_design_context` with the node ID from the Figma URL (`node-id=403-825` → nodeId `403:825`).
- Note: every state (rest, hover, active, focus, disabled), sizing (exact px from Figma), corner radius (map to `--ui-radius-tight/standard/soft`), color tokens, and typography class.
- If a value doesn't map to an existing token, add a new `--ui-*` token to `tokens.css` — never hardcode.

### Step 2 — Decide on the Radix primitive
Check https://www.radix-ui.com/primitives for whether a matching accessible primitive exists. Prefer:
- Interactive controls (checkbox, radio, switch, slider) → always use Radix
- Overlays, popovers, tooltips → always use Radix
- Custom display-only components → plain elements are fine

If adding a new Radix primitive: add to `dependencies` in `package.json`.

### Step 3 — File structure
```
src/components/MyComponent/
  MyComponent.tsx         ← implementation
  index.ts                ← re-exports everything public from MyComponent.tsx
  MyComponent.stories.tsx ← Storybook stories, one per variant/state
```

### Step 4 — Implementation checklist

**API surface:**
- [ ] All variant options have a dot-accessible `const` object exported (see `dooph-ds-architecture` Rule 1)
- [ ] All const types are derived from the const object with `(typeof X)[keyof typeof X]`
- [ ] Prop name for discrete variants is always `variant`, for sizes always `size`
- [ ] For interactive/polymorphic leaf components: include `asChild?: boolean` via `Slot` from `@radix-ui/react-slot`

**Radix wrapping (if applicable):**
- [ ] `forwardRef` on every wrapped Radix part
- [ ] `...props` spread onto the Radix element
- [ ] `className={cn(internalStyles, className)}` — always accept className override
- [ ] `displayName` set on every forwardRef component
- [ ] Hover/focus/active/disabled states use `data-[state]` and `data-[disabled]` selectors only

**Styling:**
- [ ] Only Tailwind utilities or `ds-*` helpers in className — no `var(--ui-*)` direct references
- [ ] No hardcoded hex colors or px values for shadows/radii
- [ ] `style={{}}` only to carry a **caller-supplied or token-referencing** value that cannot be a class — a `color`/`fontSize` prop, or a `--ds-*` custom property the component's CSS reads (`BaseText`, `Slider*`). Never for a design value the component itself decided; that is a token. Merge a consumer's own `style` rather than replacing it
- [ ] Theme-dependent behavior is expressed via `--ui-*` tokens and CSS classes/helpers, not runtime JS theme detection
- [ ] Uses `rounded-tight`, `rounded-standard`, or `rounded-soft` for corner radius
- [ ] Focus ring uses token-backed `ds-focus-*` outline helpers (`ds-focus-visible-ring`, `ds-focus-within-ring`, `ds-focus-ring-on-focus`) — not `shadow-focus-brand`/`shadow-focus-primary` in component class strings; use `border-border-focus`/`border-danger` alongside the ring where the focused border should change
- [ ] Radix ref types use `ComponentRef`, not deprecated `ElementRef`
- [ ] Disabled state uses `ds-disabled-state` (for native + aria-disabled) or `ds-radix-data-disabled` (for Radix data-disabled)
- [ ] Typography uses `text-style-*` composite utility classes

**Composability:**
- [ ] `TypeableDropdownTrigger` uses a `<div>` root with an inner `<input>`; focus the input on chrome `pointerDown` before Radix trigger handlers so typing is not blocked; do not forward Radix `onKeyDown` for printable keys when the input is focused
- [ ] Children flow freely into the underlying interactive element with no forced wrapper
- [ ] If a layout wrapper IS necessary, it is `aria-hidden` and absolutely positioned (like OutlineButton's blur orbs)

**Exports:**
- [ ] Component, variant consts, types all exported from `index.ts`
- [ ] All public exports added to `src/index.ts` barrel
- [ ] Dot-accessible consts declared in a sibling `constants.ts` with **no** `"use client"` — a const declared in a client module is a reference, not a value, so RSC code cannot read `Thing.key`
- [ ] `"use client"` added only if the module actually uses `useState`/`useEffect`/`useRef`, a browser API, or a timer. `forwardRef`, `memo`, `useId`, `useMemo` and `useCallback` all work in React's server build, and importing a client component from a neutral one is fine

### Step 5 — Stories
Every variant and meaningful state needs a Storybook story:
```tsx
export const Checked: Story = { render: () => <Checkbox defaultChecked /> };
export const Unchecked: Story = { render: () => <Checkbox /> };
export const Indeterminate: Story = { render: () => <Checkbox checked="indeterminate" /> };
export const Disabled: Story = { render: () => <Checkbox disabled /> };
export const AllStates: Story = { render: () => <div className="flex gap-4">...</div> };
```

### Step 6 — Verify build
```bash
npm run lint          # must pass (tsc --noEmit)
npm run build         # must produce dist/ without errors
npm run storybook     # smoke check new stories
```

---

## Syncing a Component with an Updated Figma Spec

1. Access the Figma node via MCP before making any change.
2. Diff the Figma spec against the current implementation: sizing, spacing, colors, states.
3. Token changes (new or updated `--ui-*` values) → edit `tokens.css`, then run `npm run sync-tokens` to regenerate the `@theme inline` block in `index.css` AND the standalone `theme.css` consumer preset (one command updates both).
4. Tailwind utility changes → edit the `cva` variant maps or base class strings in the component file.
5. Remove deprecated variants/sizes from both the `cva` map AND the exported const object.
6. Update stories to remove deprecated demos and add new ones.
7. Document breaking changes in a comment at the top of the component file if any API surface was removed.

---

## Modifying the Token System

When adding a new `--ui-*` token:
1. Add it to `tokens.css` in `:root`/`.light`; add a `.dark` override only if the value changes in dark mode.
2. Run `npm run sync-tokens` — reads `tokens.css` and regenerates the `@theme inline` block in `index.css` AND the `theme.css` preset. If the auto-derived Tailwind name is wrong, add an `ALIASES` entry in `sync-theme.mjs`; if the token should not become a utility (raw `var()` use only), add it to `EXCLUDED`.
3. If the token needs a `ds-*` helper class (for values that Tailwind can't express as a utility), add it to `dooph-component-tokens.css` under `@layer utilities`.
4. Reference the new Tailwind utility (e.g. `h-tab`) in the component — never the raw `var(--ui-*)`.

---

## Anti-Patterns — Never Do These

| Anti-pattern | Why it's wrong | Correct approach |
|---|---|---|
| `style={{ color: '#3d3d3d' }}` inline style | Bypasses token system; breaks dark mode | Use `text-primary` or appropriate token utility |
| `bg-[#171717]` arbitrary Tailwind value | Hardcoded; not overridable by consuming apps | Use `bg-primary` or define a new `--ui-*` token |
| Prop named `styleVariant` or `type` for discrete options | Inconsistent with the rest of the codebase | Use `variant` |
| Const key in PascalCase (`ShapeButtons.Clover`) | Inconsistent; all keys must be camelCase | `ShapeButtons.clover` |
| Union type string for variant instead of derived type | No dot-access, consumers write raw strings | Export a const object, derive the type |
| `e.stopPropagation()` inside a Radix event handler | Breaks Radix's internal event handling | Remove; let Radix manage events |
| `import { ... } from 'next/font/google'` in `src/` | Breaks Vite and non-Next consumers | Only in consuming projects, never in the package |
| `@font-face` in any `src/styles/*.css` | Fonts are the consuming app's responsibility | Document the font contract in the skills |
| `document.documentElement.classList`, `matchMedia`, `localStorage`, or `MutationObserver` in package components for theme | Duplicates consuming app theme logic and breaks subtheme islands/SSR assumptions | Use semantic `--ui-*` tokens and `ds-*` helpers |
| Package context/provider for app-owned logos or asset URLs | Pollutes the tree and assumes branding ownership | Make the component composable; consumers pass assets as children/content |
| Nesting a `<div>` around `children` without layout necessity | Blocks free composition | Let children flow directly to the interactive element |
| Forgetting `displayName` on `forwardRef` components | Poor DX in React DevTools | Set `ComponentName.displayName = "ComponentName"` |
| Hard-coding `className` values in stories instead of using variant consts | Tests the wrong API surface | `variant={ButtonVariant.primary}` in stories |
| `const DURATION_MS = 220` or a hand-rolled easing function in a component | Motion timing is a design value; a consumer cannot retune it, and it silently disagrees with the CSS it is staged against | Add a `--ui-<component>-duration`/`-ease` token pair and let CSS drive (architecture Rule 6) |
| A JS constant that mirrors a CSS duration so two motions can be sequenced | The mirror desyncs — this shipped once, and the roll overran the fade | Express the relationship in CSS, e.g. a `calc()` on a ratio token |
| `matchMedia("(prefers-reduced-motion: reduce)")` in a component | Same class of mistake as runtime theme detection | `@media (prefers-reduced-motion: reduce)` in the stylesheet |
| `el.closest("button, ...")` to find an ancestor to bind listeners to | The component reaches outside its own subtree, leaks listeners onto a node it does not own, and is silently inert in other markup | Take the state as a controlled prop (architecture Rule 7) |
| Hand-editing `src/components/Icons/index.ts` (e.g. adding an `X as Y` alias) | The file is generated, and `npm run build` regenerates it first — the edit is deleted on the next build | Rename the file, or teach `generate-icon-exports.mjs` an alias map |
| `width="var(--ui-…)"` (or any `var()`) as an SVG **attribute** | Attributes are parsed as SVG lengths and cannot resolve custom properties, so the value is silently ignored | Set it as a CSS property instead — `style={{ width: 'var(--ui-…)' }}` — and leave the numeric attribute as the pre-CSS fallback |
| A JS table of sizes that a token is documented as controlling | The token becomes inert: it exists, it is in the contract, and overriding it does nothing. Shipped this way for the spinner sizes | Render from the token and keep the JS number for the viewBox / geometry only |
| A `*Icon.tsx` whose exported const does not match its filename | `generate-icon-exports.mjs` hard-fails, taking down step one of the build | Keep filename and const in sync |
| A Tailwind variant on a package class — `data-[active]:ds-slider-dot-active`, `[&_h1]:text-style-title` | Variants only compose with GENERATED utilities, so this emits **no rule at all**, silently. Has shipped as a bug twice | Put the state in the CSS rule itself (`.ds-slider-dot[data-active]`), or spell the role out in real utilities (`font-title text-title`) |
| Stories that only exercise prop combinations matching the variant's own defaults | Cannot catch a prop that does nothing — this is exactly how two dead text props shipped | Include at least one story where each override CONTRADICTS the role default |
| Using raw `<button>` or `<div>` in stories when `Button`/`ButtonVariant` exists | Bypasses the design system inside its own stories; creates a visual inconsistency in Storybook | Import and use `Button` with the appropriate `ButtonVariant` and `ButtonSize` |

---

## Storybook Font Verification

After any change to `text-style-*` classes or `--ui-font-var-*` tokens, verify in Storybook that:
1. Button labels render with correct glyph weight (Google Sans Flex, `wdth 100, GRAD 11`)
2. Body text has slightly heavier optical weight than button text (`GRAD 19`)
3. Label text (Host Grotesk) renders at 12px, correct weight
4. Title/hero text (Bricolage Grotesque) renders at 23px/36px
5. Mono text (Google Sans Code) renders at the button role's size and weight with `font-variation-settings: "MONO" 1` — and is actually fixed pitch

Verify by reading computed style, not by eye — `getComputedStyle(el).fontSize` /
`.fontFamily` / `.fontVariationSettings` on a rendered story. A class that never
generated and a token that resolves to the same value look identical on screen.

For mono, computed style is not sufficient on its own: `"MONO" 1` reports as set
even when the served font file has no MONO axis to apply it to. Measure instead —
render `iiiiiiiiii`, `WWWWWWWWWW` and `0000000000` in the role and confirm all
three advance identically.

The `preview-head.html` Google Fonts URLs must carry every axis a
`--ui-font-var-*` token names, **as a range**: `GRAD,ROND,opsz,slnt,wdth,wght`
for Google Sans Flex and `MONO@0..1` for Google Sans Code. An omitted axis — or
one pinned to a single value — makes Google Fonts serve a file without that axis,
and `font-variation-settings` then fails silently.
