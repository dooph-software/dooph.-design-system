# 05a — Button `medium` and `big` sizes (batch 05, agent 05a)

## Progress (write-to-disk-first)
- [x] 0. Baseline scoreboard (m3 Tailwind numeric spacing 36, Button.tsx 6; m2 arbitrary 19; m4 raw var 5)
- [x] 1. Tokens: `--ui-spacing-button-medium-x` 22px, `--ui-spacing-button-big-x` 32px (tokens.css) + EXCLUDED (sync-theme.mjs) + sync-tokens
- [x] 2. Helpers `ds-px-button-medium` / `ds-px-button-big` (dooph-component-tokens.css)
- [x] 3. `text-style-hero-button` registered in cn's text-style group (cn.ts)
- [x] 4. `ButtonSize.medium` / `ButtonSize.big` (constants.ts) + cva sizes + type restriction (Button.tsx) + header
- [x] 5. Stories
- [x] 6. lint + scoreboard after

---
### Button gets `medium` (46px) and `big` (54px) pill sizes [figma 01-button, node 5:369]
- files:
  - `src/components/Button/constants.ts`: `ButtonSize.big` = `"big"`, `ButtonSize.medium` = `"medium"`, with JSDoc.
  - `src/components/Button/Button.tsx`: two new cva sizes; the base radius moved into each size; a type restriction on the props; the header contract updated (one behaviour bullet, two constraints).
  - `src/components/Button/Button.stories.tsx`: new `Medium` and `Big` stories and a `PillSizes` story (both pill sizes × prominent/primary/secondary, at rest and disabled, icon + label). `AllSizes` now shows big and medium, and its "Default" label reads "Standard".
  - `src/styles/tokens.css`: `--ui-spacing-button-medium-x: 22px` and `--ui-spacing-button-big-x: 32px`, next to the button heights.
  - `scripts/sync-theme.mjs`: both tokens added to `EXCLUDED` (raw-var only, so no Tailwind theme key). `npm run sync-tokens` run; it emitted no new theme key.
  - `src/styles/dooph-component-tokens.css`: the `.ds-px-button-medium` / `.ds-px-button-big` helpers (padding-inline from the tokens above).
  - `src/utils/cn.ts`: `text-style-hero-button` registered in the `text-style` merge group.
- what changed:
  - `medium` = `h-button-medium ds-px-button-medium rounded-full text-style-hero-button`.
  - `big` = `h-button-big ds-px-button-big rounded-full text-style-hero-button`.
  - Big prominent is 54px like the others (Figma's 52 is a mistake, per the maintainer). Labels use the hero button text role (16px, button weight and axes; `wdth` stays 100). Each variant keeps the shadow it has at standard size.
  - `rounded-tight` moved from the cva base into every existing size. tailwind-merge does not treat `rounded-tight` and `rounded-full` as one group, so a base radius would have survived next to the pill radius. The existing sizes render exactly the same classes, only in a different order.
  - **Type-level restriction (chosen over a dev warning):** the props are now a union. Prominent, primary, secondary or an omitted variant (which defaults to secondary) accept every size. Danger, ghost and text accept every size except `medium` and `big`. So `<Button variant="danger" size="big">` fails to compile, and so does a `variant` typed as the whole `ButtonVariant` union combined with a pill size. There is no `any`, and the polymorphic `Button<"a">` / `asChild` typing is unchanged. `buttonVariants()` itself, the raw cva function, is not restricted.
  - cn registration: without it, tailwind-merge treats `text-style-hero-button` as a text colour. It then strips the variant's `text-prominent-fg` / `text-primary-fg` / `text-secondary-fg`, and pill labels lose their colour. Checked with tailwind-merge directly: before, the merged class string had no `text-prominent-fg`; after, it keeps `text-prominent-fg` and drops the base `text-style-button` in favour of the hero role. The fix also helps the `Text` component, which can apply `text-style-hero-button`.
- consumer impact: `<Button size={ButtonSize.medium | ButtonSize.big}>` is available for prominent, primary and secondary. Existing sizes look the same. Code that passes a `variant` typed as the whole `ButtonVariant` union together with a size typed as the whole `ButtonSize` union (which now includes the pill sizes) gets a type error and must narrow one of the two.
- breaking: no. Every new option is additive; no existing prop, value or token changes meaning.
- verified:
  - `npm run lint` (tsc) exit 0.
  - A throwaway tsc project (since deleted) proved the type rules with `@ts-expect-error`. Allowed: pills on prominent, primary, secondary and an omitted variant; danger/ghost at small sizes; the whole `ButtonVariant` union at non-pill sizes; `Button<"a"> asChild`. Rejected: danger+big, ghost+medium, text+big, and the whole union + big.
  - Scoreboard before → after: nothing went up. Arbitrary values went 19 → 18 from another agent's change; Button.tsx's numeric spacing stays 6 (the existing `gap-2`/`px-3`/`p-0`, unchanged).
  - Not checked in Storybook (the brief said not to run it).
- docs owed:
  - CHANGELOG `[Unreleased]` → Added: "`ButtonSize.medium` (46px) and `ButtonSize.big` (54px): pill buttons with the 16px hero button label, for the prominent, primary and secondary variants. Danger, ghost and text don't support them, and the types reject that combination."
  - Usage skill (Button section): list the two sizes and the variant restriction. Say there is no icon-only pill.
  - token-contract.md: `--ui-spacing-button-medium-x` (22px) and `--ui-spacing-button-big-x` (32px), raw-var-only, read by `ds-px-button-medium` / `ds-px-button-big`.
  - Architecture/codebase skill: `text-style-hero-button` is in cn's `text-style` group (any new `text-style-*` class must be registered there too; `text-style-hero-body` is still NOT registered and has the same latent colour-stripping bug).

## DONE
