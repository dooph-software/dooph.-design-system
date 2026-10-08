# 01 — Motion scale (batch 01)

Status: complete. Spec: `docs/audit/motion-scale.md` (signed off 2026-10-03).

## Decisions taken while implementing
- **Reduced motion collapses to 1ms, not 0ms.** The spec §1 says `0ms`; the
  brief says `1ms`, and the code agrees with the brief. RevealChangeText's
  header contract requires its transition to *run* under reduced motion, because
  its content swap and `onSettled` hang off `transitionend`, which a 0ms
  transition never fires. MorphRotationShape starts sampling on `transitionrun`,
  which a 0ms transition also never fires. So the global block sets every
  `--ui-motion-duration-*` to `1ms` and the two staggers to `0ms`.
- **Overlays get the enter/exit curves.** The brief asked for the `enter` curve
  on open and the `exit` curve on close. Menu, tooltip, popover, toast and modal
  used tailwindcss-animate's default `ease` before; Sheet already used these two
  curves as literals.
- **`ds-motion-state` has zero specificity** (`:where()`), so a consumer's own
  `transition-*` / `duration-*` class on the same element still wins, as it did
  when the component carried those utilities.

## Progress (write-to-disk-first)
- [x] tokens.css: scale + shimmer loop token + global reduce block; 29 tokens removed
- [x] sync-theme.mjs EXCLUDED: new tokens added, removed tokens dropped
- [x] dooph-component-tokens.css: ds-motion-state, ds-motion-overlay(-dialog/-sheet), ds-progress-arc, ds-outline-orb-1/-2; helpers rewired; redundant reduce blocks removed
- [x] index.css: helpers rewired; redundant reduce blocks removed
- [x] components
- [x] headers
- [x] verify

---

### Motion runs on one shared scale [F-016, F-020, F-021, F-035; WI-058/064/070/082/050]

- **files** (33)
  - Build: `scripts/sync-theme.mjs` (`EXCLUDED` only).
  - Styles: `src/styles/tokens.css`, `src/styles/index.css` (outside the
    generated block), `src/styles/dooph-component-tokens.css`.
  - Components: `AIChat/AITextPart.tsx`, `AIChat/AIThinkingPart.tsx`,
    `AnimatedText/{FadeChangeText,RevealChangeText,RollChangeText,RollingDigitsText}.tsx`,
    `AnimatedText/useChangeSwap.ts`, `Button/Button.tsx`, `Checkbox/Checkbox.tsx`,
    `DropdownTrigger/DropdownTrigger.tsx`, `HotkeyIndicator/HotkeyIndicator.tsx`,
    `Input/Input.tsx`, `Menu/DropdownMenu.tsx`, `Modal/Modal.tsx`,
    `MorphRotationShape/MorphRotationShape.tsx`, `OutlineButton/OutlineButton.tsx`,
    `Popover/Popover.tsx`, `ProgressIndicator/ProgressIndicator.tsx`,
    `SearchBox/SearchBox.tsx`, `Sheet/Sheet.tsx`,
    `SidebarWithHoverIcon/SidebarWithHoverIcon.tsx`, `Slider/Slider.tsx`,
    `SplitButton/SplitButton.tsx`, `Table/Table.tsx`, `TextLink/TextLink.tsx`,
    `Toast/Toast.tsx`, `Toggle/toggleOption.ts`, `Tooltip/Tooltip.tsx`,
    `VerificationCode/CodeDigitInput.tsx` (all under `src/components/`).
  - Not touched: `LoadingSpinner/**` and `spinnerGeometry.ts` (a later batch
    rebuilds the spinner).

- **what changed**
  - Every duration and curve in the package now comes from one scale in
    `tokens.css`. Changing one scale token retunes that step everywhere.
  - Components no longer write `duration-N`, `ease-*`, `cubic-bezier(…)` or
    `Nms` anywhere. They use `ds-*` helper classes, and CSS helpers read the
    scale through `var()`.
  - Inline-style transitions moved into classes: the OutlineButton orbs and
    the ProgressIndicator arcs.
  - Reduced motion is handled in ONE place: a global block at the end of
    `tokens.css`. The per-component overrides are gone.
  - 29 per-component motion tokens were removed. They only restated a scale
    value.

  **New tokens** (raw `var()` only, never Tailwind theme keys; all are in
  `EXCLUDED` in `sync-theme.mjs`; declared on `:root, .light`)

  | token | value |
  |---|---|
  | `--ui-motion-duration-fast` | 150ms |
  | `--ui-motion-duration-base` | 200ms |
  | `--ui-motion-duration-slow` | 300ms |
  | `--ui-motion-duration-slower` | 420ms |
  | `--ui-motion-duration-slowest` | 600ms |
  | `--ui-motion-ease-standard` | `cubic-bezier(0.4, 0, 0.2, 1)` |
  | `--ui-motion-ease-enter` | `cubic-bezier(0.32, 0.72, 0, 1)` |
  | `--ui-motion-ease-exit` | `cubic-bezier(0.4, 0, 1, 1)` |
  | `--ui-motion-ease-linear` | `linear` |
  | `--ui-shimmer-duration` | 2000ms (loop; was the literal `2s` in `ds-shimmer-text`) |

  Kept off the scale, unchanged: `--ui-shape-morph-duration/-ease/-interval/-passive-spin-duration`
  (generated spring), `--ui-roll-hover-stagger` 35ms, `--ui-rolling-digits-stagger` 0ms.
  The two spinner loop tokens in spec §2 belong to the later spinner batch.

  **Global reduced-motion block** (`tokens.css`, end of file)
  - `@media (prefers-reduced-motion: reduce) { :root, .light { … } }`.
  - It sets all five `--ui-motion-duration-*` to `1ms`, and
    `--ui-roll-hover-stagger` and `--ui-rolling-digits-stagger` to `0ms`.
  - Why 1ms and not 0: a 0ms transition never fires `transitionrun` or
    `transitionend`. RevealChangeText swaps its content and calls `onSettled`
    on `transitionend`. MorphRotationShape starts sampling on `transitionrun`.
    1ms reads as instant and still fires every event (`animationend` too, which
    retires the roll/fade change halves and the rolling-digit slots).
  - `.light` is listed because it redeclares the scale. Without it, a `.light`
    subtree would get full-length motion back.
  - Loop cycle times are deliberately left out (a loop at 1ms would strobe).
    Each loop keeps its own reduce rule.

  **Reduce rules removed** (the global block now covers them)
  - The 15 `motion-reduce:…duration-0` utilities: Menu ×2, Modal ×4, Sheet ×4,
    Toast ×2, Tooltip ×3.
  - The per-helper `@media (prefers-reduced-motion)` blocks for:
    `ds-progress-fill/-remainder`, `ds-slider-glide`,
    `ds-copy-icon-clipboard/-check`, the chat reveal/lift/chevron/disclosure
    and stream-in, `ds-underline-link`, `ds-rolling-digits-*`,
    `ds-roll-change-*`, `ds-fade-change-*`, `ds-sidebar-rail` and
    `ds-reveal-change`.
  - Several of those used `transition: none` or `animation: none` (progress,
    slider, copy icon, chat, underline wipe). Those now run at 1ms instead.
    That looks the same (instant) and keeps the end events firing.

  **Reduce rules kept** (they do more than shorten)
  - `ds-shimmer-text`: stops the loop and shows plain colour.
  - `ds-roll-hover-*`: static frame; the rest face only.
  - `ds-shape-morph` autoplay and passive spin: loops, stopped outright.
  - `ds-shape-morph` and `ds-dropdown-caret(-chevron)`: their spring duration
    is off the scale, so the global block can't reach it. These rules now set
    `transition-duration: var(--ui-motion-duration-fast)`. Inside the reduce
    query that resolves to the collapsed 1ms, so the old `1ms` literal is gone.

  **New `ds-*` helpers** (`dooph-component-tokens.css`)

  | helper | what it does | replaced |
  |---|---|---|
  | `ds-motion-state` | Hover/press/focus transition, `:where()` (zero specificity). Property list: color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, opacity, box-shadow, filter, transform, translate, scale, rotate. Uses `fast` + `standard`. Layout properties are deliberately left out. | `transition-all duration-150 ease-out` (Button, Checkbox, DropdownTrigger ×3, OutlineButton, toggleOption); `transition-all duration-100` (Input ×2, SearchBox, SplitButton ×2, CodeDigitInput); `transition-colors duration-100` (HotkeyIndicator, `menuItemClassName` → menu items + CalendarPresetItem, Table rows, TextLink) |
  | `ds-motion-overlay` | `animation-duration` and `animation-timing-function` keyed off `data-state`. Open (including Tooltip's `delayed-open`/`instant-open`) = `fast` + `enter`; closed = `fast` + `exit`. Under `[data-swipe="cancel"]` it also sets a transform/translate transition (`fast` + `standard`). | the `data-[state=*]:duration-100/150` + `motion-reduce:` classes on DropdownMenuContent, TooltipContent, Toast root; Popover's implicit tailwindcss-animate default (150ms); Toast's `data-[swipe=cancel]:transition-transform` |
  | `ds-motion-overlay-dialog` | open = `base` + `enter`; closed = `fast` + `exit` | ModalOverlay / ModalContent `duration-200` / `duration-150` + `motion-reduce:` classes |
  | `ds-motion-overlay-sheet` | open = `slow` + `enter`; closed = `base` + `exit` | SheetOverlay / sheet panel `duration-300` / `duration-200`, the panel's arbitrary `[animation-timing-function:cubic-bezier(…)]` pair, and the `motion-reduce:` classes |
  | `ds-progress-arc` | `stroke-dasharray, stroke-dashoffset` over `slow` + `standard` | ProgressIndicator's inline `style={{ transition }}` (300ms `cubic-bezier(0.4,0,0.2,1)`) on both arcs |
  | `ds-outline-orb-1` | opacity `slow` + `standard`; transform `fast` + `enter` | OutlineButton orb 1's inline `opacity 0.36s ease-out, transform 0.16s ease-out` |
  | `ds-outline-orb-2` | opacity `slower` + `standard`; transform `base` + `enter` | OutlineButton orb 2's inline `opacity 0.42s ease-out, transform 0.22s ease-out` |

  The keyframe utilities (`animate-in`, `fade-*`, `zoom-*`, `slide-*`) stay on
  the components; the overlay helpers set only the duration and the curve.

  **Existing helpers rewired onto the scale** (literal or removed token → scale):
  - `ds-shape-button-shadow` → `fast` + `standard`.
  - `ds-progress-fill/-remainder` → `slow` + `standard`.
  - `ds-slider-glide` → `base` + `enter`.
  - `ds-copy-icon-*` → `fast` + `standard` (opacity) and `fast` + `enter`
    (transform).
  - `ds-chat-reveal`, `ds-chat-lift` → `fast` + `standard`.
  - `ds-chat-chevron` → `base` + `standard` (transform) and `fast` + `standard`
    (opacity).
  - `ds-chat-disclosure` → `base` + `standard`.
  - `ds-chat-prose` stream-in → `slower` + `standard`.
  - `ds-shimmer-text` → `--ui-shimmer-duration` + `linear`.
  - `ds-roll-hover-in/-out` → `slower` + `enter`.
  - `ds-underline-link` → `slowest` + `enter`.
  - `ds-rolling-digits-col` → `base` + `enter`.
  - Rolling-digits slot enter → `slow` + `enter`; exit → `base` + `enter`.
  - `ds-roll-change-out` and `ds-fade-change-out` → `base` + `exit`.
  - `ds-roll-change-in` and `ds-fade-change-in` → `slow` + `enter`.
  - `ds-sidebar-rail` → `slow` (traverse) and `base` (hover), both `enter`.
  - `ds-shape-morph` lean → `base` + `enter`.
  - `ds-dropdown-caret(-chevron)` colour → `base` + `enter`.
  - `ds-reveal-change` → out `slow`, in `slower`, both `enter`.

- **consumer impact**
  - Most motion keeps its exact value. The timings that changed are listed
    below; they match spec §4.
  - Overlay curves changed from `ease` to `enter` on open and `exit` on close.
  - Hover sites that used `transition-colors` now also ease opacity, shadow,
    filter and transform.
  - Hover sites that used `transition-all` no longer ease layout properties.
    None of them animated layout.
  - A consumer can now retune all motion by overriding one of nine
    `--ui-motion-*` tokens. Reduced motion follows automatically.
  - A consumer who overrode any of the 29 removed tokens loses that override
    silently. There is no per-component motion knob any more: the only knob is
    the shared scale step.

  **Every timing whose value changed** (= motion-scale.md §4)

  | where | before | now | change |
  |---|---|---|---|
  | 10 hover sites: HotkeyIndicator, Input ×2, menu items + CalendarPresetItem, SearchBox, SplitButton ×2, Table rows, TextLink, CodeDigitInput | 100ms | `fast` 150ms, `standard` | +50ms |
  | 7 hover sites: Button, Checkbox, DropdownTrigger ×3, OutlineButton, toggleOption | 150ms ease-out | `fast` 150ms, `standard` | curve only |
  | Menu open, Tooltip open | 100ms | `fast` 150ms | +50ms |
  | Modal close | 150ms | `fast` 150ms | none |
  | CopyButton icon swap | opacity 120ms ease-out, transform 160ms | both `fast` 150ms | +30 / −10ms |
  | OutlineButton orbs | opacity 360 / 420ms, transform 160 / 220ms, ease-out | `slow` 300 / `slower` 420, `fast` 150 / `base` 200 | inner orb opacity −60ms; others ≤20ms; 2-orb stagger kept |
  | Slider glide | 180ms `cubic-bezier(0.22,1,0.36,1)` | `base` 200ms, `enter` | +20ms |
  | Chat stream | 400ms ease-out | `slower` 420ms, `standard` | +20ms |
  | Chat disclosure | 200ms ease-in-out | `base` 200ms, `standard` | curve only |
  | Chat hover reveal / lift | 150ms ease-out | `fast` 150ms, `standard` | curve only |
  | Reveal-change out | 320ms | `slow` 300ms | −20ms |
  | RollingDigits roll / enter / exit | 240 / 260 / 200ms | `base` 200 / `slow` 300 / `base` 200 | −40 / +40 / 0ms |
  | SidebarWithHoverIcon traverse / hover | 260 / 180ms | `slow` 300 / `base` 200 | +40 / +20ms |
  | Shape-morph hover lean + dropdown caret colour | 180ms `cubic-bezier(0.2,0,0,1)` | `base` 200ms, `enter` | +20ms |
  | RollHoverText | 500ms | `slower` 420ms | −80ms |
  | ProgressIndicator, LinearProgressIndicator | 300ms (`standard` / ease-out) | `slow` 300ms, `standard` | LPI curve only |
  | Popover, Toast swipe-cancel | implicit 150ms (library default) | `fast` 150ms, explicit | none |
  | Overlay curves (menu, tooltip, popover, toast, modal) | `ease` | `enter` in / `exit` out | curve only |

  Unchanged values (now on the scale):
  - roll/fade change 200 / 300ms;
  - underline wipe 600ms;
  - reveal-change in 420ms;
  - Modal open 200ms;
  - Sheet 300 / 200ms;
  - Toast 150 / 150ms;
  - Tooltip / Menu close 150ms;
  - shimmer 2000ms.

- **breaking:** yes — v6. These 29 tokens were removed. Each maps to its
  replacement scale token:

  | removed | replacement |
  |---|---|
  | `--ui-chat-reveal-duration` | `--ui-motion-duration-fast` |
  | `--ui-chat-reveal-ease` | `--ui-motion-ease-standard` |
  | `--ui-chat-stream-duration` | `--ui-motion-duration-slower` |
  | `--ui-chat-stream-ease` | `--ui-motion-ease-standard` |
  | `--ui-chat-disclosure-duration` | `--ui-motion-duration-base` |
  | `--ui-chat-disclosure-ease` | `--ui-motion-ease-standard` |
  | `--ui-roll-hover-duration` | `--ui-motion-duration-slower` (curve was a literal; now `--ui-motion-ease-enter`) |
  | `--ui-roll-change-out-duration` | `--ui-motion-duration-base` |
  | `--ui-roll-change-in-duration` | `--ui-motion-duration-slow` |
  | `--ui-roll-change-out-ease` | `--ui-motion-ease-exit` |
  | `--ui-roll-change-in-ease` | `--ui-motion-ease-enter` |
  | `--ui-fade-change-out-duration` | `--ui-motion-duration-base` |
  | `--ui-fade-change-in-duration` | `--ui-motion-duration-slow` |
  | `--ui-fade-change-out-ease` | `--ui-motion-ease-exit` |
  | `--ui-fade-change-in-ease` | `--ui-motion-ease-enter` |
  | `--ui-shape-morph-nudge-duration` | `--ui-motion-duration-base` |
  | `--ui-shape-morph-nudge-ease` | `--ui-motion-ease-enter` |
  | `--ui-rolling-digits-duration` | `--ui-motion-duration-base` |
  | `--ui-rolling-digits-enter-duration` | `--ui-motion-duration-slow` |
  | `--ui-rolling-digits-exit-duration` | `--ui-motion-duration-base` |
  | `--ui-rolling-digits-ease` | `--ui-motion-ease-enter` |
  | `--ui-sidebar-icon-duration` | `--ui-motion-duration-slow` |
  | `--ui-sidebar-icon-hover-duration` | `--ui-motion-duration-base` |
  | `--ui-sidebar-icon-ease` | `--ui-motion-ease-enter` |
  | `--ui-underline-link-duration` | `--ui-motion-duration-slowest` |
  | `--ui-underline-link-ease` | `--ui-motion-ease-enter` |
  | `--ui-reveal-change-in-duration` | `--ui-motion-duration-slower` |
  | `--ui-reveal-change-out-duration` | `--ui-motion-duration-slow` |
  | `--ui-reveal-change-ease` | `--ui-motion-ease-enter` |

  The replacement is shared, not per component. Overriding it retunes every
  component on that step. A consumer who needs one component alone to differ
  must target that component's `ds-*` class in their own CSS. None of the 29
  was a Tailwind theme key, so no utility class disappears. `theme.css` is
  unchanged.

  Header contracts touched (comment text only, updated in the same edit as the
  code; no constraint was contradicted or removed):
  - `AITextPart`, `## behavior`: stream-in is timed by the motion scale; blur
    and rise stay `--ui-chat-stream-*`.
  - `AIThinkingPart`, `## behavior` and the chevron's inline comment: the
    disclosure is timed by the motion scale.
  - `FadeChangeText`, `## constraints`: timing is on the scale; depth is
    `--ui-fade-change-depth`; reduced motion is the global collapse.
  - `RollChangeText`, `## constraints`: same. "out (200ms) / in (300ms)"
    became "out (`base`) / in (`slow`)".
  - `RevealChangeText`, `## constraints`: reduced motion is the global
    collapse to a non-zero instant. Its rationale (transitionend must fire) is
    kept and extended to cover zero durations.
  - `RollingDigitsText`, `## updating`: timing is on the scale; stagger and
    fade ratio stay `--ui-rolling-digits-*`.
  - `useChangeSwap`, `## constraints`: "timing lives in each wrapper's CSS
    classes, on the motion scale".
  - `MorphRotationShape`, `## behavior` (the lean is on the motion scale) and
    `## constraints` (the step stays `--ui-shape-morph-*`; the lean is
    `--ui-motion-*`).
  - `SidebarWithHoverIcon`, `## constraints`: durations are scale tokens read
    by `.ds-sidebar-rail`; reduced motion is the global collapse.
  - Plain doc comments (no contract block):
    - Sheet's `sheetVariants` JSDoc (`slow`/`enter` in, `base`/`exit` out, via
      `ds-motion-overlay-sheet`; the timing-function workaround note dropped);
    - ProgressIndicator's `FlatProgressIndicator` JSDoc (`.ds-progress-arc`);
    - OutlineButton's controlled-orb comment;
    - Slider's step-dot comment ("over 150ms" → "at all");
    - a new Toast comment that `ds-motion-overlay` also carries swipe-cancel.
  - CSS comments:
    - the tokens.css motion legend, reduce-block rationale and the
      roll-hover, roll-change, fade-change, nudge, rolling-digits, chat and
      underline comments;
    - the index.css sidebar-rail, shape-morph, roll/fade-change,
      rolling-digits, reveal-change and shimmer comments.
  - Final sweep (this pass): re-read all 33 files and every other motion
    component (ShimmerText, RollHoverText, UnderlineLinkText, CopyButton,
    ShapeButton, CalendarPresetsPanel). No comment still states an old
    duration or curve, names a removed token, or describes a replaced
    reduced-motion mechanism. `rg` for the 29 names over `src/` and `scripts/`
    finds nothing.

- **verified**
  - `npm run sync-tokens` run after the `tokens.css` edits.
  - `npm run lint` exit 0.
  - Scoreboard m1 (hardcoded motion): 102 → 0. No other metric rose; m8
    (JS timers) is unaffected.
  - The 29 removed names: zero hits in `src/` and `scripts/`.
  - All-320-stories computed-style snapshot, before and after: only the §4
    timing/curve changes; no layout or colour change.
  - Overlays opened in Storybook animate at these timings:
    - menu, popover, toast and tooltip: 150ms on the `enter` curve;
    - modal: 200ms in, 150ms out;
    - sheet: 300ms in, 200ms out;
    - every overlay uses the `exit` curve on close.

- **docs owed**
  - CHANGELOG `[Unreleased]`:
    - **Changed:** "Motion runs on one shared scale (`--ui-motion-duration-{fast,base,slow,slower,slowest}` 150/200/300/420/600ms, `--ui-motion-ease-{standard,enter,exit,linear}`). Retune all motion by overriding these." List the §4 timing changes. Overlays now use the enter/exit curves.
    - **Changed:** "Reduced motion is one global rule. Every scale duration collapses to 1ms and the staggers to 0."
    - **Removed (v6):** the 29 tokens, with the table above.
    - **Added:** `--ui-shimmer-duration`.
  - `skills/dooph-design-system-theming/references/token-contract.md`, Motion section:
    - Add the scale and the reduced-motion rule.
    - Remove `--ui-rolling-digits-duration/-enter-duration/-exit-duration/-ease`, `--ui-roll-change-{out,in}-{duration,ease}` and `--ui-sidebar-icon-*`.
    - Keep `--ui-rolling-digits-stagger/-opacity-ratio/…` and `--ui-roll-change-depth/-blur`.
    - Rewrite the "retunes the component, including under `prefers-reduced-motion`" sentence (line ~144).
  - `.agents/skills/dooph-ds-architecture/SKILL.md` Rule 6 (~l.311–344):
    - The token list (`--ui-underline-link-*`, `--ui-rolling-digits-*`, `--ui-sidebar-icon-*`) becomes the scale.
    - "Reduced motion is a `@media` block in CSS" becomes "the single global block in tokens.css; component CSS adds a reduce rule only to stop a loop or show a static frame".
    - Name the `ds-motion-*` helpers as the only way a className reaches timing.
  - `.agents/skills/dooph-ds-codebase/SKILL.md`:
    - RevealChangeText row (~l.347): `--ui-reveal-change-*` → scale; the 1ms is now global.
    - SidebarWithHoverIcon (~l.421, ~l.489): `--ui-sidebar-icon-*` → scale.
    - Token list (~l.463).
    - CopyButton helpers (~l.543): "skipped under reduced motion" → "collapsed to 1ms".
    - Reveal timing (~l.562).
    - Add `ds-motion-state`, `ds-motion-overlay(-dialog/-sheet)`, `ds-progress-arc` and `ds-outline-orb-1/-2` to the helper inventory.
  - `.agents/skills/dooph-ds-loading-indicators/SKILL.md` (~l.270): the "transition-duration 0 under reduced motion" note for the shape-morph should say 1ms via the scale. This can wait for the spinner batch.
  - `.agents/skills/dooph-ds-contribution/SKILL.md`: add to the anti-patterns table "`duration-N` / `ease-*` / `transition-all` / inline timing in a component → `ds-motion-state` / `ds-motion-overlay*`" and "`motion-reduce:` utility → nothing (global block)".
  - v6 migration skill: the 29-token table; overriding a scale token is global; overlay curve change.

## DONE
