# 06E1 — Element access: one `useComposedRefs`, `forwardRef` + rest props (WI-099, WI-107)

Agent E1, wave E. Baseline scoreboard (before): m1 0 · m2 0 · m3 0 · m4 5 ·
m5 0 · m6 0 · use-client 27 · timers 5 · m9 0 · m10 0.

Before-markup captured: scratchpad `e1/before.html` (20 usages rendered from
`src/index.ts` with esbuild + `renderToStaticMarkup`), md5 `bcea7459…`.

## Checklist
- [x] WI-099 step 2: `src/utils/composeRefs.ts` created (no `"use client"`, see entry)
- [x] WI-099 step 3: AIPromptInput
- [x] WI-099 step 4: Input
- [x] WI-099 step 5: OutlineButton
- [x] WI-099 step 6: DropdownTrigger
- [x] WI-107 step 3: HotkeyIndicator
- [x] WI-107 step 4: MorphRotationShape (+ step 5 story)
- [x] WI-107 step 6: ShapeMorphSpinner
- [x] WI-107 step 7: SplitButton
- [x] lint, scoreboard after, markup before/after, type probe

## Entries

## 2026-10-03

### One memoized ref merge instead of four hand-rolled ones [WI-099, F-085]
- files: `src/utils/composeRefs.ts` (new), `src/components/AIChat/AIPromptInput.tsx`,
  `src/components/Input/Input.tsx`, `src/components/OutlineButton/OutlineButton.tsx`,
  `src/components/DropdownTrigger/DropdownTrigger.tsx`.
- what changed: a new internal hook `useComposedRefs(...refs)` returns one
  callback ref, memoized on the refs, that writes the node into every ref. The
  four components that merged their own internal ref with the consumer's
  (`AIPromptInputTextarea`'s inline arrow + `assignRef`, Input's `setRefs`,
  OutlineButton's and TypeableDropdownTrigger's `useCallback` merges) now call
  it. Dead imports removed (`Ref` in AIPromptInput; `MutableRefObject`,
  `RefCallback` in OutlineButton; `useCallback` in DropdownTrigger — it had no
  other use there; OutlineButton keeps `useCallback` for its mouse handlers).
  The hook is not exported from `src/index.ts`.
- `"use client"`: none on `composeRefs.ts`. It calls only `useCallback`, which
  the package's directive rule (agent-rules §6 / WI-037: "`useCallback` …
  do[es] not count") treats as neutral; every caller already carries its own
  directive. A header comment in the file says so. use-client count unchanged.
- consumer impact: same refs reach the same elements. A consumer callback ref
  on `AIPromptInputTextarea` and `Input` is no longer called with `null` and
  then the node on every re-render (every keystroke). OutlineButton and
  DropdownTrigger were already memoized: pure de-duplication.
- breaking: no.
- verified: see the verification section at the end.
- docs owed: codebase SKILL.md Directory Structure line for
  `utils/composeRefs.ts` (internal, not exported); CHANGELOG `[Unreleased]`
  `### Fixed`: "`AIPromptInputTextarea` and `Input` no longer detach and
  re-attach a callback `ref` on every keystroke."

### Four components now hand over their element and accept a ref [WI-107, F-039]
- files: `src/components/HotkeyIndicator/HotkeyIndicator.tsx`,
  `src/components/MorphRotationShape/MorphRotationShape.tsx`,
  `src/components/MorphRotationShape/MorphRotationShape.stories.tsx` (one story appended, import line),
  `src/components/ShapeMorphSpinner/ShapeMorphSpinner.tsx`,
  `src/components/SplitButton/SplitButton.tsx`.
- what changed:
  - HotkeyIndicator: `forwardRef<HTMLSpanElement>` with `displayName`; `ref` first on
    the root `<span>`. Body (data-pressed, `menu` variant) untouched. (The previous
    run had wrapped it but not yet passed `ref`, which is why lint failed.)
  - MorphRotationShape: outer component is `forwardRef` + `displayName`; it hands
    the ref to the inner as `forwardedRef`, which composes it with its own `spanRef`
    via `useComposedRefs` and puts `ref={composedRef}` LAST on the span, after
    `{...spanProps}`, with a comment saying why. Header unchanged: listeners stay
    on the span, nothing new writes `d`/transform.
  - ShapeMorphSpinner: `forwardRef` + `displayName`, passes `ref` to
    MorphRotationShape. Still no `"use client"` (forwardRef is not a client
    trigger). Default `shapes` stays `DEFAULT_SHAPE_KEYS` (current code, not the
    WI's older `SHAPE_MORPH_SPINNER_SHAPES`). Role/size divergence left to F-072.
  - SplitButton: props now extend `HTMLAttributes<HTMLDivElement>` (explicit
    `children`/`className` lines removed), `forwardRef<HTMLDivElement>` +
    `displayName`, rest props spread on the root `<div>` after `className`.
    WI-085's `SplitButtonGroup` has not landed, so the root is still the `<div>`.
  - Story `Progress/MorphRotationShape` → "Forwarded Ref" (WI step 5), with
    `gap-lg` instead of the WI's `gap-4`.
- consumer impact: `ref` works on all four (TypeScript used to reject it on
  HotkeyIndicator and SplitButton). SplitButton now passes `id`, `aria-*`,
  `data-*` and handlers to its root, so Radix `asChild` triggers work around it.
  A ref on MorphRotationShape / ShapeMorphSpinner no longer replaces the internal
  one, so the shape no longer freezes when a ref is attached.
- breaking: no (additive; the frozen-shape behaviour was a bug).
- docs owed: contribution SKILL.md element-access checklist (WI-107 step 2,
  verbatim text in the WI); CHANGELOG `[Unreleased]` `### Added`
  "`HotkeyIndicator`, `MorphRotationShape`, `ShapeMorphSpinner` and `SplitButton`
  forward their ref; `SplitButton` passes rest props (`id`, `aria-*`, handlers) to
  its root." and `### Fixed` "A ref on `MorphRotationShape`/`ShapeMorphSpinner` no
  longer freezes the shape."

## Verification (WI-099 + WI-107)
- `npm run lint` (tsc --noEmit) → exit 0, after all edits.
- Scoreboard after: m1 0 · m2 0 · m3 0 · m4 5 · m5 0 · m6 0 · use-client 27 ·
  timers 5 · m9 0 · m10 0. Identical to the baseline; nothing moved.
- Markup: the same 20-usage esbuild + `renderToStaticMarkup` harness (scratchpad
  `e1/entry.tsx`, all 8 touched components incl. refs, rest props, every
  MorphRotationShape mode, ShapeMorphSpinner, SplitButton) re-rendered as
  `e1/after.html`: md5 `bcea7459c26af794eb3641408b14630b` for both; `cmp` →
  byte-identical, 0 throws.
- Type probe: `docs/audit/_work/scratch/W7c/access-probe/probe.tsx` with its
  paths pointed at `src/index.ts` (no build) → no errors on lines 13-16
  (HotkeyIndicator, SplitButton, MorphRotationShape, ShapeMorphSpinner refs).
  The 2 remaining errors are lines 20-21 (Calendar / DatePicker: WI-109's).
- Rest props (WI-107 render check 05, run from src via esbuild): `PASS
  SplitButton rest props reach the root div` (`data-x`, `id`, `aria-label`),
  `PASS HotkeyIndicator rest props still reach the span`. All four have their
  `displayName`.
- Ref-freeze (DOM, Browser pane, rAF driven by timers because the pane was
  hidden): a controlled MorphRotationShape with a consumer `ref`, stepped to
  index 1 with `--ds-shape-morph-step: 1` and a `transitionrun` dispatched on the
  span. Before (tree `06D-wave-d` version): `ref=SPAN landed=[] pathChanged=false`,
  so the shape froze. After: `ref=SPAN landed=[1] pathChanged=true`.
- Not done here: worktree `npm run build` (the src probes above cover the same
  checks), Storybook "Forwarded Ref" visual check (orchestrator).

## DONE