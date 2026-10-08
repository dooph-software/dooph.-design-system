# Brief 01 — Motion scale (one batch)

Read first, in full: `docs/audit/_work/agent-rules.md` (mandatory), then `docs/audit/motion-scale.md` (the signed-off spec: implement it exactly). Background: FINDINGS.md F-016 (motion inventory), F-020 (Popover reduced motion), F-021 (OutlineButton), F-035 (Toast).

Change record: `docs/audit/_work/changes/01-motion.md` (write as you go; `## DONE` at the end).

## Your files (only these)
- `src/styles/tokens.css`, `src/styles/index.css` (outside the generated block), `src/styles/dooph-component-tokens.css`, `scripts/sync-theme.mjs` (`EXCLUDED` only).
- Every component with motion. Find them with the scoreboard m1 regex, or with
  `rg -n "duration-\d+|ease-(in|out|in-out|linear)\b|cubic-bezier|\d+ms|\d+(\.\d+)?s ease|transition:" src --glob '!*.stories.tsx'`.
  That covers, among others: Button, Checkbox, DropdownTrigger, HotkeyIndicator, Input, Menu/DropdownMenu, Modal, Sheet, OutlineButton, ProgressIndicator, LinearProgressIndicator, SearchBox, SplitButton, Table, TextLink, Toast, Toggle/toggleOption, Tooltip, Popover, VerificationCode/CodeDigitInput, ShapeButton, CopyButton, Slider, AnimatedText (roll/fade/reveal/rolling digits, shimmer, roll hover), SidebarWithHoverIcon, MorphRotationShape (nudge only), AIChat parts.
- Their `*.stories.tsx` only if a story hardcodes timing that should come from tokens.
- **NOT yours:** `src/components/LoadingSpinner/**` and `spinnerGeometry.ts`. A later batch rebuilds the spinner. Leave its JS timing alone.

## What to build
1. **Scale tokens in `tokens.css`**, exactly as in motion-scale.md §1:
   - 5 durations, `--ui-motion-duration-{fast,base,slow,slower,slowest}` = 150/200/300/420/600ms;
   - 4 curves, `--ui-motion-ease-{standard,enter,exit,linear}`;
   - the new loop token `--ui-shimmer-duration: 2000ms`.

   These are raw-var tokens: add them to `EXCLUDED` in `scripts/sync-theme.mjs` so they don't become Tailwind theme keys. Run `npm run sync-tokens`.
2. **ONE global reduced-motion block in `tokens.css`:** `@media (prefers-reduced-motion: reduce) { :root { --ui-motion-duration-*: 1ms; the staggers: 0ms } }`. Use **1ms**, not 0: some code waits for `animationend`/`transitionend` (Toast exit, change-swap), and those events need a non-zero duration to fire. Check them before choosing.
   - Then remove the per-component reduce overrides the global block makes redundant: the 15 `motion-reduce:…duration-0` utilities, and the per-helper `@media (prefers-reduced-motion)` blocks in index.css / dooph-component-tokens.css that only zero a duration.
   - KEEP reduce rules that do something else: stop a loop (`animation: none`), show a static frame, swap a shimmer for a solid colour.
3. **`ds-*` helpers** (in `index.css` `@layer utilities` or `dooph-component-tokens.css`, next to the existing ones) so components never write timing literals:
   - `ds-motion-state`: the hover/state transition. `transition-property` covering colors, background, border, box-shadow, opacity, filter; duration `--ui-motion-duration-fast`; ease `--ui-motion-ease-standard`. It replaces `transition-all duration-150 ease-out`, `transition-all duration-100` and `transition-colors duration-100`.
     - **Keep `transition-all` semantics where a site actually animates layout or transform.** Check each site's hover classes. If a site animates transform (e.g. a press scale), include `transform` in the helper's property list rather than dropping it.
   - Overlay enter/exit helpers keyed off `data-state`. They set `animation-duration` and `animation-timing-function`, and keep the existing `animate-in fade-in-0 zoom-in-95 slide-*` keyframe utilities. Per the table in §4:
     - menu / tooltip / popover / toast: fast in, fast out;
     - modal: base in, fast out;
     - sheet: slow in, base out;
     - enter curve on open, exit curve on close.
     - Tooltip has `delayed-open` and `instant-open` states.
     - Name the helpers by role (e.g. `ds-motion-overlay`, `ds-motion-overlay-dialog`, `ds-motion-overlay-sheet`). Keep the set minimal.
4. **Rewire every consumer** to the scale per §4's "becomes" column:
   - Replace removed per-component tokens with scale tokens wherever they are read: CSS, and also any JS that reads a CSS var by name (MorphRotationShape, SidebarWithHoverIcon, useChangeSwap, RollingDigitsText, AIChat; grep each removed token name in `src/`).
   - Move inline-style transitions into `ds-*` classes so the reduce rule reaches them: OutlineButton orbs, ProgressIndicator arcs.
   - Toast's implicit swipe-cancel transition and Popover's implicit tw-animate default become explicit via the helpers.
   - `ds-shimmer` uses `--ui-shimmer-duration` and `--ui-motion-ease-linear`.
5. **Remove the 29 tokens listed in §3** from `tokens.css`, and from `.dark` if they're there. Afterwards `rg` must find none of them anywhere in `src/` or `scripts/`.
6. **Header contracts:** where a header describes timing ("fades over 150ms…") or a reduced-motion mechanism you changed, update it in the same edit. If a `## constraints` line forbids what you're doing, stop that part and report it.

## Verify
- Run `npm run sync-tokens`, then `npm run lint` (exit 0).
- Scoreboard: m1 (hardcoded motion) must fall from 102 to ≈0. Remaining hits are acceptable only inside the global reduce block or loop tokens; list any left and why. No other metric may rise. Note that m8 (JS timers) is unaffected.
- `rg -n "duration-\d+|ease-(in|out|in-out)\b|cubic-bezier" src --glob '*.tsx' --glob '*.ts' --glob '!*.stories.tsx'` → no output, except LoadingSpinner files.
- Do NOT run Storybook or a browser; the orchestrator does the visual check. Do not run `npm run build` in this checkout.

## Change record must include
- The full list of removed tokens → replacement (for the v6 migration skill).
- The new helpers and what they replace.
- Every timing whose value changed (should equal motion-scale.md §4).
- Header contracts touched.
