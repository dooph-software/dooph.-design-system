# 10 — ProgressIndicator flat gap from target; CTAButton hover tilt

Resumed agent (the first one was cut off before writing a record). Baseline
scoreboard: motion 0, "use client" 27, timers 5.

## Entry A — ProgressIndicator flat: end gaps follow the TARGET value, rest look is the old ring again
- **files:** `src/components/ProgressIndicator/ProgressIndicator.tsx` (one more
  inline custom property + JSDoc), `src/styles/dooph-component-tokens.css`
  (`.ds-progress-ring-indicator` / `-track`).
- **what changed:** the 08 fix ramped the track's end gaps in over 0 < p < 1 %,
  so tiny values looked different from the old ring. Now the svg also sets
  `--ds-pi-gap-on` (0 or 1, from `progress > 0` — the target, not the animated
  value). It is a plain (unregistered) custom property, so it never transitions:
  the gaps switch at once while only `--ds-pi-progress` animates. Track gap =
  `--ds-pi-gap × --ds-pi-gap-on`. The race fix (one animated scalar, both circles
  always mounted) is untouched. The opacity cut-off factor went 1000 → 1000000 so
  a track/indicator shorter than 1e-6 units, not 1e-3, is what fades (a drawn dot
  is otherwise the old behaviour at any positive length). Reviewed the cut-off
  agent's edit: correct, kept as is (only the JSDoc sentence "From any value
  above 0" reflowed by hand — left).
- **consumer impact:** rest rendering equals the pre-08 ring at every progress
  value, including 0 < p < 0.01 (08's "gaps ramp in" note no longer applies).
  During a transition to 0 the gaps drop at once; to > 0 from 0 they appear at
  once. A consumer `style` can still override the `--ds-pi-*` vars (unsupported).
- **breaking:** no.
- **verified:** `npm run lint` exit 0. Rest proof in Chromium (real CSS in the
  live Storybook, computed styles of svgs built exactly as the component does)
  vs the pre-08 formulas (`getWavyTrackGeometry` + indicator dash, from the
  07-review-round-1 tree): sm/rg/md/xl x p = 0, 0.001, 0.005, 0.01, 0.25, 0.5,
  0.99, 1 — dash length, dash offset, and track/indicator present-vs-omitted all
  match; max numeric difference 4.6e-4 = Chromium's 3-decimal serialisation of
  computed lengths. Track on exactly where the old track existed (off at 0.99
  and 1 for every size at these samples), indicator invisible only at p = 0.
  Live "Interactive" story: real slider key events (React path), animations
  stepped manually at 16.7 ms (hidden-pane rule), keys every 50 ms: 0→1→0 over
  640 frames plus a 501-frame random burst incl. 142 frames above 87 %: track
  never vanished while it had positive length, never overlapped the indicator,
  and its leading end never moved against the progress direction (0 backward
  frames). The gap switch is the only discontinuity (once per direction change).
- **docs owed:** 08 record's "gaps ramp in over the first 1 %" is superseded —
  the loading-indicators skill note should say "end gaps switch on at once when
  progress > 0 (target-driven `--ds-pi-gap-on`)". CHANGELOG [Unreleased] Fixed
  line from 08 is unchanged.

## Entry B — CTAButton: end shape tilts on hover / focus-visible (header contract reworded)
- **files:** `src/components/CTAButton/CTAButton.tsx` (class on the shape
  wrapper + header + JSDoc), `src/styles/dooph-component-tokens.css` (new
  `.ds-cta-shape-tilt`).
- **what changed:** the header said the shape was "never animated" and that a
  hover morph is a design change. REWORDED WITH MAINTAINER APPROVAL
  (2026-10-07): the shape is fixed per size (clover standard, puff big) and
  never morphs; its only motion is a hover tilt matching DropdownCaret's hover
  nudge amount, on the motion scale, via one named helper `.ds-cta-shape-tilt`.
  Per AGENTS.md the contract change must be its OWN commit (maintainer commits).
  `.ds-cta-shape-tilt`: `rotate: calc(var(--ui-shape-morph-nudge) * 90deg)` =
  13.5deg clockwise when the root `.group` is hovered or focus-visible
  (`:is(:where(.group):is(:hover, :focus-visible) *)`, same pattern as the
  outline-button orbs); `transition: rotate var(--ui-motion-duration-base)
  var(--ui-motion-ease-enter)`. CSS only, no listeners. Nudge amount: the token
  is a fraction of one step (0.15) and MorphRotationShape's step turns 90deg
  (`NOMINAL_TURN_DEG`, not a token — hence the literal 90deg in the calc).
- **consumer impact:** the CTA's end shape leans 13.5deg on hover/keyboard
  focus. Reduced motion is covered by the global rule (durations collapse).
- **breaking:** no.
- **verified:** lint exit 0; scoreboard unchanged (motion 0, "use client" 27,
  timers 5, all other 0). Chromium on the live Storybook `all-variants` story:
  real mouse hover on the first CTA -> only that CTA's shape computes
  `rotate: 13.5deg`; others `none`; Tab focus (keyboard) -> 13.5deg; transition
  computes `rotate 0.2s cubic-bezier(0.32, 0.72, 0, 1)` (base / enter). Not
  checked: dark mode, clipping of the rotated shape beyond its chip (nothing
  clips; looked fine in the screenshot).
- **docs owed:** CHANGELOG [Unreleased] Added: "CTAButton: the end shape tilts
  on hover and keyboard focus." Any skill text that says the CTA hover is
  label-only.

## DONE
