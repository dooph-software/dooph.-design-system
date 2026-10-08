# Motion scale — proposal (2026-10-03, awaiting maintainer sign-off)

**Goal (maintainer):** motion is one cohesive language, so changing one token
retunes motion across the whole system. Every duration and curve in `src/`
comes from this scale. A component keeps its own motion token only when its
value cannot sit on the scale: loops, the generated shape-morph curve, staggers.

Inventory source: every duration and easing literal or token in `src/`
(scoreboard metric m1: 102 hardcoded sites, plus 35 motion tokens).

## 1. The scale

**Durations**

| token | value | used for |
|---|---|---|
| `--ui-motion-duration-fast` | 150ms | state feedback (hover, press, focus colour); small overlays in and out (menu, tooltip, popover, toast); quick swaps (CopyButton icon, chat reveal) |
| `--ui-motion-duration-base` | 200ms | large overlay in and out (modal in, sheet out); disclosure; content swap out; small transforms |
| `--ui-motion-duration-slow` | 300ms | content swap in; sheet in; progress fills; expressive hover settle |
| `--ui-motion-duration-slower` | 420ms | reveals; chat streaming; OutlineButton outer orb |
| `--ui-motion-duration-slowest` | 600ms | expressive hover (underline link, roll hover) |

**Curves**

| token | value | used for |
|---|---|---|
| `--ui-motion-ease-standard` | `cubic-bezier(0.4, 0, 0.2, 1)` | state feedback, fades, progress — anything that starts and ends on screen |
| `--ui-motion-ease-enter` | `cubic-bezier(0.32, 0.72, 0, 1)` | the house curve: entering, swapping in, expressive moves, glides |
| `--ui-motion-ease-exit` | `cubic-bezier(0.4, 0, 1, 1)` | leaving: overlay exits, swap out |
| `--ui-motion-ease-linear` | `linear` | loops (spinners, shimmer) |

**Reduced motion, in one place.** A single `@media (prefers-reduced-motion:
reduce)` block in `tokens.css` sets every `--ui-motion-duration-*` to `0ms`.
That replaces the 15 per-component `motion-reduce:duration-0` utilities (menu, modal, sheet, toast, tooltip) and the
per-helper reduce blocks. Loops get a static frame through their own existing
reduce rules.

**How components consume it.** Through `ds-*` helpers, e.g. `ds-motion-state`
(the hover/state transition) and `ds-motion-overlay` (enter/exit durations and
curves keyed off `data-state`), and through `var()` inside CSS helpers. Never
`duration-N` / `ease-*` literals and never inline-style timing. Inline-style
transitions (OutlineButton, ProgressIndicator) move into `ds-*` classes, so the
reduce rule reaches them.

## 2. What keeps its own token (not on the scale)

| token(s) | why |
|---|---|
| `--ui-shape-morph-duration` 498ms, `--ui-shape-morph-ease` (generated `linear(...)`), `--ui-shape-morph-interval` 650ms, `--ui-shape-morph-passive-spin-duration` 4666ms | generated from the upstream motion spec, and paired with each other |
| `--ui-spinner-duration` 1800ms (NEW; was a JS constant), `--ui-spinner-spokes-duration` 1280ms (NEW; was a JS constant, still scaled per size) | loop cycle times, not transitions |
| `--ui-shimmer-duration` 2000ms (NEW; was a literal) | loop |
| `--ui-roll-hover-stagger` 35ms, `--ui-rolling-digits-stagger` 0ms | staggers, not durations |

## 3. Tokens removed in v6 (they restate a scale value)

`--ui-chat-reveal-duration/-ease`, `--ui-chat-stream-duration/-ease`,
`--ui-chat-disclosure-duration/-ease`, `--ui-roll-hover-duration`,
`--ui-roll-change-{out,in}-{duration,ease}`,
`--ui-fade-change-{out,in}-{duration,ease}`,
`--ui-shape-morph-nudge-duration/-ease`,
`--ui-rolling-digits-duration/-enter-duration/-exit-duration/-ease`,
`--ui-sidebar-icon-duration/-hover-duration/-ease`,
`--ui-underline-link-duration/-ease`,
`--ui-reveal-change-{in,out}-duration/-ease`.
That is 29 tokens out and 9 scale tokens in (plus the 3 loop tokens above,
which replace JS constants and literals).

## 4. Every timing that changes feel

Everything not listed keeps its exact value.

| where | today | becomes | change |
|---|---|---|---|
| 10 hover/state sites: HotkeyIndicator, Input ×2, menu items + CalendarPresetItem, SearchBox, SplitButton ×2, Table rows, TextLink, CodeDigitInput | 100ms, browser-default curve | fast 150ms, standard | **+50ms**. Unifies with the 7 sites already at 150. |
| 7 hover/state sites: Button, Checkbox, DropdownTrigger ×3, OutlineButton, toggle option | 150ms ease-out | fast 150ms, standard | curve only (ease-out → standard; barely visible) |
| Menu open, Tooltip open | 100ms | fast 150ms | **+50ms** |
| Modal close | 150ms | fast 150ms | none |
| CopyButton icon swap | opacity 120ms ease-out, transform 160ms | both fast 150ms | +30 / −10ms |
| OutlineButton orbs | opacity 360 / 420ms, transform 160 / 220ms, ease-out | slow 300 / slower 420, fast 150 / base 200 | inner orb opacity **−60ms**; others ≤20ms. The 2-orb stagger is kept. |
| Slider glide | 180ms `cubic-bezier(0.22,1,0.36,1)` | base 200ms, enter | +20ms, near-identical curve |
| Chat stream | 400ms ease-out | slower 420ms, standard | +20ms |
| Chat disclosure | 200ms ease-in-out | base 200ms, standard | curve only |
| Reveal-change out | 320ms | slow 300ms | −20ms |
| RollingDigits | 240 / enter 260 / exit 200ms | base 200 / slow 300 / base 200 | **−40 / +40ms** |
| SidebarWithHoverIcon | 260 / hover 180ms | slow 300 / base 200 | +40 / +20ms |
| Shape-morph nudge | 180ms `(0.2,0,0,1)` | base 200ms, enter | +20ms, similar curve |
| RollHoverText | 500ms | slower 420ms | **−80ms** |
| ProgressIndicator, LinearProgressIndicator | 300ms (`(0.4,0,0.2,1)` / ease-out) | slow 300ms, standard | LPI curve only |
| Popover, Toast swipe-cancel | implicit 150ms (library default) | fast 150ms, explicit | none, but now on the token |

## 5. Questions for the maintainer
1. **The hover speed.** Is `fast` = 150ms right? The alternative is 100ms,
   which would make the 7 Button-family sites faster rather than the 10 others
   slower.
2. **The two notable changes.** RollHoverText 500 → 420ms and RollingDigits
   240/260 → 200/300ms. Accept them, or add one more step instead (e.g. a
   500ms `slower`)?

Once signed off: implement as one batch (WI-058/064/070/082/050, rewritten to
this scale). Verify by the all-stories snapshot (layout unchanged) plus the
scoreboard: m1 must fall to ~0, and the "use client"/timer counts must not rise.

## Sign-off
- 2026-10-03 — **approved by the maintainer as written.** `fast` = 150ms. The
  RollHoverText (500 → 420ms) and RollingDigits (240/260 → 200/300ms) changes
  are accepted. Implement as proposed.
