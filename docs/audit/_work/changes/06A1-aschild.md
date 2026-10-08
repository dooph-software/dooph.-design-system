# 06A1 — `asChild` on decorated leaves + OutlineButton consumer mouse handlers

Agent A1, wave A. WI-081, WI-087.

## Checklist
- [x] Baseline scoreboard
- [x] Baseline render snapshot (asChild repro + non-asChild markup) from current source — 5 THROW, as the audit found
- [x] OutlineButton: Slottable (WI-081) + composed mouse handlers (WI-087)
- [x] ShapeButton: Slottable
- [x] DropdownTrigger + TextDropdownTrigger: Slottable (+ one-line span reasons)
- [x] Harness after edits: 7/7 OK, non-asChild markup byte-identical
- [x] Stories: Button, OutlineButton (AsChild + ConsumerMouseHandlers), ShapeButton, DropdownTrigger (2)
- [x] Verify: lint, scoreboard, WI grep checks

---

### `asChild` now works on OutlineButton, ShapeButton, DropdownTrigger and TextDropdownTrigger [F-003, F-024, WI-081]
- files: `src/components/OutlineButton/OutlineButton.tsx`,
  `src/components/ShapeButton/ShapeButton.tsx`,
  `src/components/DropdownTrigger/DropdownTrigger.tsx`,
  `src/components/Button/Button.stories.tsx`,
  `src/components/OutlineButton/OutlineButton.stories.tsx`,
  `src/components/ShapeButton/ShapeButton.stories.tsx`,
  `src/components/DropdownTrigger/DropdownTrigger.stories.tsx`
- what changed: each of the four components rendered its decoration (orbs,
  shape, caret, chevron) beside `children`, so Radix `Slot` had two candidates
  and threw. The label wrapper is now a Radix `Slottable` in its render-prop
  form (`<Slottable child={children}>{(child) => <span…>{child}</span>}</Slottable>`):
  Slot targets the consumer's element, and the label span wraps that element's
  own children. The two DropdownTrigger label spans got a one-line comment
  saying why they exist. Button.tsx needed no change (it already worked).
  New stories: `Button/As Child`, `OutlineButton/As Child`,
  `ShapeButton/As Child`, `DropdownTriggers/Secondary As Child`,
  `DropdownTriggers/Text As Child`.
- consumer impact: `<OutlineButton asChild><a href…>…</a></OutlineButton>` (and
  the same on the other three) no longer throws "Slot failed to slot onto its
  children". The consumer's element becomes the interactive root and receives
  the root classes, handlers and ref; the decoration renders inside it.
  OutlineButton keeps its outer frame `<div>`. Without `asChild` the markup is
  byte-identical. A non-element `asChild` child now throws Radix's descriptive
  "failed to slot onto its `Slottable`" error instead of the generic one.
  ShapeButton stays server-safe: `Slottable` is a plain function component and
  `@radix-ui/react-slot` has no `"use client"`, so the render-prop never crosses
  a client boundary.
- breaking: no
- verified: a scratch esbuild harness (source bundled to the scratchpad, no
  repo build) running the audit's `aschild-repro` and `nonaschild-snapshot`
  cases. Before: OutlineButton, OutlineButton glowing, ShapeButton,
  DropdownTrigger, TextDropdownTrigger THROW; Button and CTAButton OK. After:
  all 7 OK, the `<a>` is the root (inside OutlineButton's frame div) with the
  label span and decoration inside it. Non-asChild markup diff before → after:
  empty. `<Slottable child=` counts: OutlineButton 1, ShapeButton 1,
  DropdownTrigger 2. `npm run lint` exit 0. Storybook not run (orchestrator
  verifies visually).
- docs owed:
  - `.agents/skills/dooph-ds-architecture/SKILL.md` (the asChild paragraph,
    ~:221 at b436647): list the leaves that support `asChild` (Button,
    CTAButton, TextLink, DropdownTrigger, TextDropdownTrigger, OutlineButton,
    ShapeButton) and say a leaf that renders decoration beside `children`
    puts it next to a `Slottable` in its render-prop form, so the Slot has one
    target and the label wrapper survives slotting.
  - `.agents/skills/dooph-ds-codebase/SKILL.md` (~:129): the last cell
    "via `Button`" → "❌ (omitted — always a `<button>`)".
  - CHANGELOG `[Unreleased]` → Fixed: "`asChild` on `OutlineButton`,
    `ShapeButton`, `DropdownTrigger` and `TextDropdownTrigger` no longer throws
    'Slot failed to slot onto its children'; the child element becomes the
    interactive root and the decoration renders inside it."

### OutlineButton runs a consumer's `onMouseMove` / `onMouseLeave` alongside its glow tracking [F-062, WI-087]
- files: `src/components/OutlineButton/OutlineButton.tsx`,
  `src/components/OutlineButton/OutlineButton.stories.tsx`
- what changed: `onMouseMove` and `onMouseLeave` are destructured out of the
  rest props. The internal handlers call the consumer's first, then do the
  glow tracking / centre reset, and list the consumer callbacks as
  `useCallback` dependencies. Event types are `MouseEvent<HTMLButtonElement>`.
  New story `OutlineButton/Consumer Mouse Handlers` (a move counter).
- consumer impact: before, a consumer `onMouseMove` arrived in `...props` after
  the internal one and replaced it, so the orbs never tracked the cursor and
  the leave-reset stopped. Now both run. With no consumer handler nothing
  changes.
- breaking: no
- verified: harness with an `asChild` probe child that captures the merged
  props and receives a fake element through the ref. Hover mode: consumer
  move 1 call, leave 1 call; `--gx 0.250 / --gy 0.500 / --bw 200px / --bh 50px`
  written on move, `--gx/--gy` reset to `0.5` on leave. `glowing` mode:
  consumer callbacks run, no custom properties written. The destructure grep
  gives exactly 2 lines. `npm run lint` exit 0.
- docs owed: CHANGELOG `[Unreleased]` → Fixed: "`OutlineButton` runs a
  consumer's `onMouseMove`/`onMouseLeave` alongside its glow tracking instead
  of losing the tracking."

### Scoreboard
No metric moved because of this change. Between my before and after runs,
motion literals went 0 → 1 (Toast/Toast.tsx), JS timers 6 → 5 and default
exports 74 → 0; all three are in other agents' folders. OutlineButton's 5
arbitrary px values are unchanged (WI-082 owns them).

## DONE
