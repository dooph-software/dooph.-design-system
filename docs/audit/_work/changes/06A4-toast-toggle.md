# 06A4 — Toast exit animation, toast description colour, shared toggle never-clear rule (brief 06 wave A, agent A4)

## Progress (write-to-disk-first)
- [x] 0. Read rules, brief, WI-096 / WI-100 blocks, F-035 / F-086, motion scale, Toast + Toggle files and contracts
- [x] 1. Baseline scoreboard (m3 Tailwind numeric spacing 36 — Toast.tsx 13; m7 "use client" 28; m8 timers 6)
- [x] 2. WI-096 toast exit on `animationend`
- [x] 3. WI-100 description colour keyed off `data-variant`
- [x] 4. Toggle: shared never-clear hook
- [x] 5. lint + scoreboard after

---

### Every provider-rendered toast plays its exit animation; removal follows `animationend`, not a 200ms timer [WI-096, F-035]
- files: `src/components/Toast/Toast.tsx`
- what changed:
  - `dismiss(id)` only sets the item's `open` to false. The `setTimeout(…, 200)` that removed it is gone.
  - The provider's `onOpenChange(false)` (timer, close button, `ToastDismiss`, Escape, swipe end) now calls `dismiss` instead of filtering the item out at once. Before, the `<li>` unmounted before Radix `Presence` could play the `data-[state=closed]` exit.
  - New `onAnimationEnd` on each provider `ToastRoot` removes the item from state, only when `event.target === event.currentTarget` and the `<li>` has `data-state="closed"`. A descendant's bubbling animation or the enter animation can't prune it. Radix spreads root props onto the `<li>` (`@radix-ui/react-toast` 1.2.23 `dist/index.mjs:394-399`, checked). `Presence` (1.1.10) listens with its own native listener and dispatches through `useReducer`, not `flushSync`, so the node is still mounted when React's delegated handler runs.
  - Reduced motion (checked in the CSS): the toast's exit duration is `.ds-motion-overlay[data-state="closed"] { animation-duration: var(--ui-motion-duration-fast) }`. The single reduce block in `tokens.css` sets `--ui-motion-duration-fast` to `1ms`, not `0ms` (its comment says that is load-bearing for event-driven components). The keyframe animation still runs and `animationend` fires. No `animation: none` reduce rule anywhere in `src/styles/` matches the toast. (Note: `motion-scale.md` says `0ms`; the shipped token block says `1ms`. A 0s CSS animation also dispatches `animationend`, so either way the toast is pruned.)
- consumer impact: toasts closed by their timer, close button, Escape or a swipe now animate out instead of vanishing. `dismiss()` no longer waits a fixed 200ms; the exit timing comes only from the motion token. Known edge: in a hidden tab the closed item stays in the provider's array (invisible) until the tab is shown and the event is delivered.
- breaking: no
- verified: see the end of this record.
- docs owed: CHANGELOG `[Unreleased]` → `### Fixed`: "- Toasts closed by their timer, close button, Escape or a swipe now play their exit animation; they used to vanish at once. `dismiss()` no longer waits on a 200ms timer."

### The prominent toast description colour moves into `ToastDescription`, keyed off a new `data-variant` on `ToastRoot` [WI-100, F-086]
- files: `src/components/Toast/Toast.tsx`, `src/components/Toast/Toast.stories.tsx`
- what changed:
  - `ToastRoot` renders `data-variant={variant ?? ToastVariant.simple}` on its `<li>` (before the consumer's props, so a consumer value still wins). `simple` matches the cva default.
  - `ToastDescription` base classes: `text-text-secondary group-data-[variant=prominent]:text-prominent-fg`. It reads the root's existing `group` class.
  - The provider's simple/prominent/danger template no longer branches on the variant: title and description are just `block wrap-break-word`. The title inherits the root's colour (BaseText sets none): `text-text` on simple/danger, `text-prominent-fg` on prominent, as before. The complex branch is untouched.
  - New story `Overlays/Toast › Composed Prominent`: a `ToastRoot` + `ToastTitle` + `ToastDescription` composed by hand, prominent variant (`data-testid="composed-desc"` on the description).
- consumer impact: a hand-composed `<ToastRoot variant={ToastVariant.prominent}>` now gets a legible white description (was #4a4a4a on #340fd9, about 1.07:1). Provider-rendered toasts compute the same colours as before. `ToastRoot` now carries `data-variant`. On a prominent root, the group variant outranks a consumer's plain text-colour class on `ToastDescription`.
- breaking: no
- verified: see the end of this record.
- docs owed: CHANGELOG `[Unreleased]` → `### Fixed`: "- `ToastDescription` inside a prominent `ToastRoot` uses the prominent foreground colour, so custom-composed prominent toasts are legible. `ToastRoot` now renders `data-variant`."

### ToggleSwitch and FancyToggleSwitch share one "single selection can never be cleared" hook instead of two copies [follow-up to 05e, maintainer's reuse request]
- files: `src/components/Toggle/Toggle.tsx`, `src/components/Toggle/FancyToggleSwitch.tsx`
- what changed:
  - New internal hook `useNeverClearedValue({ value, defaultValue, onValueChange })` in `Toggle.tsx`. It holds the uncontrolled state, lets a controlled `value` win, and drops Radix's `""` (the active option clicked again) before it reaches state or the callback. It returns `{ value, onValueChange }` to hand straight to a Radix `type="single"` group. It is exported from `Toggle.tsx` for FancyToggleSwitch only; `Toggle/index.ts` does not re-export it, so it is not public.
  - `ToggleSwitch` and `FancyToggleSwitch` (single mode) both call it. FancyToggleSwitch calls it above its mode branch, fed nothing in multi mode, so the hook order never depends on `selectType` (same as the old `useState` placement).
  - Why the hook sits in `Toggle.tsx` and not its own file: this repo marks a hook module `"use client"` (as `useChangeSwap.ts` is), so a separate file would add a client module (scoreboard "use client" 28 → 29). `Toggle.tsx` is already a client module. The header says so.
  - No other duplicated selection logic found: multi mode is plain Radix passthrough, and the two presentation contexts carry different data.
  - Header contracts: Toggle.tsx's `## behavior` now says the rule lives in `useNeverClearedValue` and FancyToggleSwitch calls it; a new constraint records why it stays in this module. FancyToggleSwitch.tsx no longer says "change this one with it; they must not drift". It now points to the shared hook, and the hook-order constraint names the hook instead of `useState`.
- consumer impact: none. Same behaviour, same public exports.
- breaking: no
- verified: see below.
- docs owed: `.agents/skills/dooph-ds-codebase` Toggle folder note: the never-clear rule is `useNeverClearedValue` in `Toggle.tsx`, shared by both rows (internal, not exported).

---

### Verification (all three items)
- `npm run lint` (tsc) → exit 0.
- `rg "setTimeout" src/components/Toast/Toast.tsx` → none. `rg "ToastVariant.prominent" src/components/Toast/Toast.tsx` → none (the template no longer branches on it).
- Scoreboard before → after: JS timers/animation loops 6 → 5 (Toast's `setTimeout` gone). Motion literals 0 → 0, "use client" files 28 → 28, Tailwind numeric spacing 36 → 36. Default exports 74 → 0 is agent A3's work, not this one. No metric rose. (A first draft comment in Toast.tsx said "1ms" and tripped the motion-literal counter; reworded.)
- Runtime harness (scratch, outside the repo): esbuild bundle of the real `src/` Toast + Toggle modules under React 19 `StrictMode`, Tailwind CLI compile of `src/styles/index.css`, served on localhost and driven in the Browser pane. The pane was hidden, which freezes CSS animations, so exits were driven with `document.getAnimations().forEach(a => a.finish())`, per the known hidden-pane caveat. Provider state was read from the React fiber.
  - Close button, `dismiss()`, Escape on the focused toast, and the auto-dismiss timer: in each case the `<li>` stays mounted with `data-state="closed"` and an `exit` animation running at 150ms. The provider array holds the item with `open: false`. When the exit ends, the `<li>` is removed with `state-at-removal=closed` and the array empties. Before the fix, the close button, Escape and the timer removed it at once while still `open`.
  - Reduced-motion stand-in: with `--ui-motion-duration-fast` set to `1ms` on `:root` (what the reduce block sets), the exit animation ran at 1ms and the toast was pruned from DOM and state without manual help, even in the hidden pane.
  - Colours: the composed prominent description computes `rgb(255,255,255)` = `--ui-color-prominent-foreground`, and its `<li>` has `data-variant="prominent"`. Provider prominent title and description are white too. Provider simple title = `--ui-color-text` (rgb 22,22,22) and description = `--ui-color-text-secondary` (rgb 74,74,74), unchanged. The compiled rule is `.group-data-[variant=prominent]:text-prominent-fg:is(:where(.group)[data-variant="prominent"] *)` at (0,2,0), which beats `.text-text-secondary`.
  - Toggles: ToggleSwitch uncontrolled/controlled and FancyToggleSwitch uncontrolled/controlled: clicking the active option again leaves it `on` and never calls `onValueChange("")`. Clicking the other option selects it (uncontrolled) or reports it while the controlled `value` wins. Fancy multi still clears to `[]` and toggles freely.
- Not run: Storybook, the build, dark theme, true `prefers-reduced-motion` emulation (the pane tools cannot set it), the 600ms retune check from the WI. The orchestrator verifies visually: Overlays/Toast › Persistent / Standard / All Variants and the new Composed Prominent.

## DONE
