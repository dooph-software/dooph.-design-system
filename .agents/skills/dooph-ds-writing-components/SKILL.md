---
name: dooph-ds-writing-components
description: 'Use when writing or changing component code under src/components in the dooph design system - props, variant or size consts, constants.ts, forwardRef and refs, asChild or Slot, Radix wrappers, value and onValueChange, Text components and `as`, "use client", hooks, timers, fetching or polling inside a component, a file''s ## constraints header, or a size or recipe change where the spec leaves a design value open.'
---

# Writing dooph DS components

**A component presents. The consuming app owns data, fetching, timers and control.** Reuse existing names; report every design value you chose.

Agents fail here in three ways:
1. **Data or timers in a component.** Build the presentational part; the app gets the polling code ([recipe 8](references/recipes.md#8-consumer-owned-data-the-polling-request)).
2. **Silent design choices** (a radius "by pattern", a broken sum reworded). Report them.
3. **"All clean" from `tsc` alone.** Run `npm run lint`.

Covers any edit to a component, its constants, recipe or stories. Not token values (dooph-ds-editing-tokens), class rules (dooph-ds-styling) or the new-component steps (dooph-ds-adding-a-component).

## Rules
| Rule | Failure it prevents |
|---|---|
| No `fetch`, URL or interval prop, clock or polling. State arrives as props. Hooks hold only the component's own UI state (an uncontrolled value, an open flag, focus). A request does not lift it. Lint check: JS timers and animation loops outside their allowlist. | Transport and timing the app can't control |
| Add `"use client"` only when the module itself calls a client-only hook (`useState`, `useRef`, an effect, context), touches browser APIs, puts event-handler closures on host elements, or passes a function prop to a client component. `useCallback`, `useMemo`, `useId` and `forwardRef` run in React's server build and need none. Never on a thin Radix wrapper or `constants.ts`. Lint check: "use client" outside its allowlist. | Constants a Server Component can't read |
| Option sets are a const plus a same-named type in `constants.ts` (`IconSize`, in `Icons/BaseIcon.tsx`, is the one exception; leave it there). Type props from them, never from cva's `VariantProps`. | `variant={null}` compiles and renders unstyled |
| `forwardRef` with `displayName`. Refs typed `ComponentRef<typeof X.Root>`. If you need the node too, use `useComposedRefs`. Lint checks: forwardRef without displayName; ElementRef instead of ComponentRef. | A dropped or displaced consumer ref |
| `asChild` swaps the root for `Slot`; with children of your own, wrap the consumer's in `Slottable`. CTAButton is the exception: with `asChild` it replaces the slotted element's children with its own content (`cloneElement`). | A slotted element that loses its label |
| `cn(recipe, className)` on the element that owns the role. Otherwise the JSDoc says where `className`, `ref` and `style` go. The consumer's `style` spreads last. | Overrides that land nowhere or lose |
| Radix states via `data-[state=…]` and `data-[disabled]`. Overlays portal by default, with `portal` and `portalProps` props. | State styles that drift from Radix |
| Text always goes through a Text component. A root that owns its text renders through one with `as`. A wrapping `<label>` around a control and its text is such a root: `<LabelText as="label">`, never `<label><LabelText>`. A span, div or p that holds text is itself a Text component, even inside such a root (`<BodyText as="span">`, `<LabelText as="span">`); it states its role, never overrides it with utilities. The one exception is the AnimatedText family (RollHoverText, RollingDigitsText and their kin): their per-character spans inherit the role of the Text component around them by design. Stories are not precedent. Lint checks: text-style classes outside Text components; typography utilities or inline font styles. | Typography outside the role system. Lint can't see `<span>{label}</span>` |
| Header contracts: read them first. On a conflict, stop and raise it. When your change alters behaviour the header describes, update the header in the same change. A contract is the block comment that opens the file (as in `DropdownCaret/DropdownCaret.tsx`), never the component's JSDoc, which is published to components.md. Rules bind without a header, and no contract may enshrine what they forbid. | A rule ignored as "not in the header" |

## Quick reference
| Need | Use |
|---|---|
| Option props | `variant`, `size`; also `shape`, `side`, `selectType`, `mode`, `direction`, `sortDirection`, `state` |
| Const names | For a new const: `<Component><Prop>` (`ButtonVariant`, `ButtonSize`, `SheetSide`, `TableSortDirection`, `AIToolPartState`), never `*Type`; `DropdownMenuSelectType` is the one exception. Lint check: variant constants named *Type. Existing names stay as they are (e.g. `CheckboxChecked`, `ShapeButtons`, `RollDirection`); renaming an exported const is a breaking change |
| Size keys | Where a scale has a base size it is `standard`, then `sm`, `iconSm: "icon-sm"`; never `default` or `small`. (`LoadingSpinnerSize` is a diameter scale, `sm`/`rg`/`md`/`xl`, with no `standard`.) Lint check: size keys named default or small |
| Heights | `h-button-micro` 28, `h-button-sm` 34, `h-button` 38, `h-button-medium` 46, `h-button-big` 54 |
| Values | `value` / `defaultValue` / `onValueChange(value)`. Controlled `value` wins. Radix's `checked`/`onCheckedChange`, `open`/`onOpenChange` pass through. Lint check: value callbacks not named onValueChange |
| Force-the-look flags | `active`, `hovered`, `glowing`, `pressed`; the inverse surface is `themeInverse` |

Recipes: [references/recipes.md](references/recipes.md).

## Hand-back: every slot is REQUIRED
```
Changed:       files
Decisions:     each value the spec didn't give: chosen, alternative, open or settled ("none").
               For a new size: radius, padding and text role, one line each,
               even when copied from a sibling size
Also affected: components sharing the recipe/const/token you touched, and whether they change
Flagged:       what doesn't add up (a broken sum in a comment, a stale doc line), not reworded
Lint:          the last line of `npm run lint`
```
Worked example: [recipe 9](references/recipes.md#9-surfacing-a-decision-a-worked-hand-back).

## Rationalizations
| Said | Reality |
|---|---|
| "observations, not hard file-header constraints, so since the user explicitly wants polling behavior, I'll build it" | A request doesn't lift a rule. Answer with recipe 8 (the component plus app-side code). If the user insists, that changes the maintainer's rule: stop and raise it, and don't build it. |
| "Some components in the DS do use hooks (Toggle, Slider, Toast, etc.), so it's not forbidden" | None of them fetches, polls or runs an interval. |
| "... follows the pattern ... so I'll stay consistent" | A value copied from a sibling size is still a choice: radius, padding and text role each go under Decisions. |
| "the equation in the comment no longer balances ... I should update the comment" | That goes under Flagged. |
| "Everything passes — type-check and build are clean." / "All clean." | `tsc` is half of lint. Lint was red. |

**Red flags:** "the user explicitly asked", "follows the pattern", "update the comment", "type-check passes", an allowlist entry so a component can fetch or poll.

## Verification
1. Changed a JSDoc, a const or an export? Run `node scripts/generate-docs.mjs`, then `node scripts/sync-skills.mjs` (after `npm run sync-tokens`, if a token or size rule changed).
2. Run `npm run lint` (`tsc --noEmit`, then `node scripts/check-conventions.mjs`). It must end `conventions: N checks passed`; paste that line.
3. View every touched variant and size in Storybook (see dooph-ds-codebase-map).

## Related
dooph-ds-styling, dooph-ds-editing-tokens, dooph-ds-adding-a-component, dooph-ds-codebase-map; [inventory](../dooph-ds-codebase-map/references/inventory.md) (header contracts, allowlist) and [components.md](../../../skills/dooph-design-system-usage/references/components.md) (props, defaults, consts).
