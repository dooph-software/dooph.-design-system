# 06C3 — AnimatedText: one change-text render shell; RollHoverText sr-only words

Checklist
- [x] Baseline: scoreboard + SSR probe of RollChangeText / FadeChangeText / RollHoverText (before)
- [x] One shared render shell for RollChangeText and FadeChangeText [WI-031]
- [x] RollHoverText reads its words from an sr-only copy, not aria-label [WI-086]
- [x] Verify: lint, SSR diff, scoreboard after

## Resume note
The first run was cut off after creating `ChangeSwapShell.tsx` and nothing else.
Reviewed it against the plan's step 2: same structure, classes merged with `cn`
in the same order, both `key`s and both `onAnimationEnd`s wired exactly as the
wrappers wired them, and a header contract stating that wiring invariant (a
reasonable edit — "merge the two handlers" — would break the swap). Kept as is.

## 1. RollChangeText and FadeChangeText share one render shell [WI-031, F-079]
- files:
  - `src/components/AnimatedText/ChangeSwapShell.tsx` (new, internal — not
    re-exported from `AnimatedText/index.ts` or `src/index.ts`)
  - `src/components/AnimatedText/RollChangeText.tsx`
  - `src/components/AnimatedText/FadeChangeText.tsx`
  - `src/components/AnimatedText/useChangeSwap.ts` (header only)
- what changed: the grid cell, keyed exiting copy and entering span that both
  wrappers copied line for line now live once, in `ChangeSwapShell`. Each wrapper
  is a single `<ChangeSwapShell ref {...props} outClassName inClassName />`
  render passing only its class pair (the pair goes after the spread, so a stray
  runtime prop cannot replace the wrapper's look). The drift the finding named —
  the `will-change` comment existing only in RollChangeText — is gone: the shell
  carries it once. Public names, props interfaces and `displayName`s unchanged.
- `"use client"`: the shell carries it (it calls `useChangeSwap` and wires
  handlers). Both wrappers DROP it: they now use no hooks, no browser APIs, no
  handler closures, and pass only strings to the client shell, so agent-rules
  §6 says they must not carry it. (The plan item said to keep both lines,
  deferring to the then-open directive question; that question has since been
  settled by the §6 policy, which a brief cannot override.) In dist, any chunk
  that bundles the shell is still stamped by `scripts/add-use-client.mjs`, so
  client consumers see no difference; Server Components can now render the
  wrappers as server elements with the shell as the client boundary.
- headers (same change): RollChangeText constraints gain "The render shell
  (grid cell, keyed exit, entry span) lives in `ChangeSwapShell` for the same
  reason. This file owns only the roll's look: its class pair." FadeChangeText
  constraints gain "the render shell lives in `ChangeSwapShell`; this file owns
  only the look: its class pair." useChangeSwap behavior: "The wrapper renders
  both…" → "`ChangeSwapShell` renders both in one grid cell and spreads these
  onto its two spans; the wrappers pass only their class pair." No constraint
  removed or narrowed. RevealChangeText untouched (its reduced-motion
  `transitionend` notes are unaffected; the shell holds no duration or timer).
- consumer impact: none. Rendered DOM is byte-identical (see verified).
- breaking: no.

## 2. RollHoverText exposes its words through an sr-only copy [WI-086, F-044]
- files: `src/components/AnimatedText/RollHoverText.tsx`
- what changed: the root no longer carries `aria-label={children}` (a name on a
  role-less span, which ARIA prohibits and reading-mode screen readers drop).
  Its first child is now `<span className="sr-only">{children}</span>`, the same
  pattern RollingDigitsText uses. The glyph spans, their `aria-hidden` and every
  `ds-roll-hover*` class are unchanged, so the index.css rules select the same
  elements (none of them use child/first-child selectors).
- consumer impact: in body copy the phrase is now read as part of the sentence.
  CTAButton's link (and any Button wrapping RollHoverText) is still named by the
  text — now via name-from-content instead of the label. Layout unchanged:
  `sr-only` is clipped and out of flow. A consumer-passed `aria-label` still
  spreads onto the root as before.
- breaking: no (patch).

## Verified
- `npm run lint` (tsc --noEmit) → exit 0.
- Before/after render probe (scratchpad, esbuild-bundled from `src/`, no build
  in this checkout), three prop sets per wrapper (up + className + style;
  defaults; down + id/data-/aria- props + style overriding `--ds-roll-dir` +
  element child):
  - real `renderToStaticMarkup` at rest: Roll/Fade output identical before vs
    after;
  - with `useChangeSwap` stubbed to a mid-flight swap: identical markup with
    `ds-*-change-out` / `ds-*-change-in` applied, AND an element-tree dump
    (wrappers expanded through their render functions) identical — same keys
    (`out-7`, content key), same `onAnimationEnd` handler on each span, same
    forwarded ref on the root.
  - RollHoverText: before `<span aria-label="Deploy now" class="ds-roll-hover"…`,
    after `<span class="ds-roll-hover" style="--ds-roll-dir:1"><span
    class="sr-only">Deploy now</span>…`; the rest of the markup unchanged.
- `inline-grid overflow-hidden` appears in code once (ChangeSwapShell.tsx);
  `ChangeSwapShell` absent from `AnimatedText/index.ts` and `src/index.ts`;
  no `aria-label` left in RollHoverText.tsx.
- Scoreboard: `"use client"` files 28 → 27 for this change (shell +1, two
  wrappers −2; read 29 at resume because the unused shell was already on disk).
  No other metric moved.
- Not done here (orchestrator): Storybook check that roll/fade swaps still
  animate both directions, and that the body-copy story's accessibility tree
  reads the full sentence and CTAButton links keep their names.

## Docs owed
- `.agents/skills/dooph-ds-codebase/SKILL.md`: name `ChangeSwapShell.tsx` beside
  `useChangeSwap.ts` as the shared internal render shell, and list it with the
  non-re-exported internals ("each wrapper owns only its class pair and
  keyframes"). Note RollChangeText/FadeChangeText no longer carry `"use client"`.
- CHANGELOG (patch): RollHoverText's text is now exposed through a visually
  hidden copy instead of `aria-label`, so screen readers read it in the flow of
  surrounding text.

## DONE
