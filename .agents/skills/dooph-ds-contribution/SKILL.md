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
- [ ] No hardcoded hex colors, px values for shadows/radii, or `style={{}}` objects
- [ ] Theme-dependent behavior is expressed via `--ui-*` tokens and CSS classes/helpers, not runtime JS theme detection
- [ ] Uses `rounded-tight`, `rounded-standard`, or `rounded-soft` for corner radius
- [ ] Focus ring uses token-backed `ds-focus-*` outline helpers (`ds-focus-visible-ring`, `ds-focus-within-ring`, `ds-focus-ring-on-focus`) — not `shadow-focus` in component class strings; use `border-border-focus`/`border-destructive` alongside the ring where the focused border should change
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
3. Token changes (new or updated `--ui-*` values) → edit `tokens.css`, then run `npm run sync-tokens` to update the `@theme inline` block in `index.css`.
4. Tailwind utility changes → edit the `cva` variant maps or base class strings in the component file.
5. Remove deprecated variants/sizes from both the `cva` map AND the exported const object.
6. Update stories to remove deprecated demos and add new ones.
7. Document breaking changes in a comment at the top of the component file if any API surface was removed.

---

## Modifying the Token System

When adding a new `--ui-*` token:
1. Add it to `tokens.css` in `:root`/`.light`; add a `.dark` override only if the value changes in dark mode.
2. Run `npm run sync-tokens` — this script reads `tokens.css` and regenerates the `@theme inline` block in `index.css`.
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
| Using raw `<button>` or `<div>` in stories when `Button`/`ButtonVariant` exists | Bypasses the design system inside its own stories; creates a visual inconsistency in Storybook | Import and use `Button` with the appropriate `ButtonVariant` and `ButtonSize` |

---

## Storybook Font Verification

After any change to `text-style-*` utilities or `--ui-font-var-*` tokens, verify in Storybook that:
1. Button labels render with correct glyph weight (Google Sans Flex, `wdth 100, GRAD 11`)
2. Body text has slightly heavier optical weight than button text (`GRAD 19`)
3. Label text (IBM Plex Sans) renders at 12px, correct weight
4. Title/hero text (Bricolage Grotesque) renders at 23px/36px

The `preview-head.html` Google Fonts URL must include all axes: `GRAD,ROND,opsz,slnt,wdth,wght`. If any axis is missing from the URL, `font-variation-settings` will silently fail for that axis.
