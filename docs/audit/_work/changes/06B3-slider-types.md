# 06B3 — Slider / LPI / CopyButton / CTAButton types, Slider keyboard, LPI colour docs

Checklist:
- [x] Types say what the runtime does (LPI value, Slider extras, CopyButton ref, CTAButton ref) + story [WI-116]
- [x] Stepped slider keyboard: PageUp/PageDown and Shift+Arrow move 10 dots + story description [WI-105]
- [x] LPI `color` JSDoc + header transition bullet, LPI/Slider "Color prop" stories [WI-046]
- [x] lint, scoreboard, type probe, Slider behaviour script

## Types match the runtime [WI-116, F-089]
- files: `src/components/LinearProgressIndicator/LinearProgressIndicator.tsx`, `src/components/Slider/Slider.tsx`, `src/components/Slider/Slider.stories.tsx`, `src/components/CopyButton/CopyButton.tsx`, `src/components/CTAButton/CTAButton.tsx`
- what changed:
  - LinearProgressIndicator: props now `Omit<…Root props, 'value'>` plus `value?: number` (JSDoc: determinate only; Radix's `null` not supported). Runtime unchanged. Header unchanged (it already says "determinate bar"), per the WI.
  - Slider: Radix is handed `[value[0]]` only. A new `withExtras` helper re-attaches the consumer's `value[1…]` on every path (continuous change/commit, stepped drag change/commit, stepped keyboard commit). Extras pass through as given, not snapped. JSDoc on `SliderProps` says single thumb. New story `Extra values pass through` (after `Controlled (stepped)`), using `gap-md` rather than the WI's `gap-3`. `highlightedStep` / `SliderSteppedProps` untouched.
  - CopyButton: `forwardRef<HTMLButtonElement, …>`, cast on `ref` removed.
  - CTAButton: `forwardRef<HTMLElement, …>`; the `<a>` branch casts to `ForwardedRef<HTMLAnchorElement>` with a comment; `type ForwardedRef` added to the react import. Header contract (shape-by-size) not touched; no conflict.
- consumer impact: single-value sliders behave exactly as before. A multi-value `[a, b]` now comes back `[a', b]` instead of being truncated or having `b` moved/re-sorted by Radix's closest-thumb logic.
- breaking: `yes — v6` (type-level only):
  - `LinearProgressIndicator value={null}` → compile error (pass a number).
  - `CopyButton` ref `HTMLElement` → `HTMLButtonElement` (`useRef<HTMLElement>` no longer assigns).
  - `CTAButton` ref `HTMLAnchorElement` → `HTMLElement` (reading `ref.current.href` now needs narrowing).
- verified:
  - `npm run lint` exit 0.
  - Type probe `docs/audit/_work/scratch/W7b/types-probe/probe54.tsx`, retargeted at `src/index.ts` (scratchpad tsconfig, no build): exit 0. Sanity negatives in the same run error as expected (CTAButton ref is `HTMLElement`; a `HTMLDivElement` ref on CopyButton is rejected).
  - Scratchpad esbuild script (Radix slider stubbed to capture Root props; rendered via react-dom/server; handlers called directly): Root gets `[1]` for `[1,3]`; ArrowRight `[1,3]`→`[2,3]`; Home→`[0,3]`; End→`[4,3]`; stepped drag change `[2.37]`→`[2,3]`, commit `[3.6]`→`[4,3]`; continuous change/commit `[62]`→`[62,80]`; off-grid extra `3.3` kept; single-value paths unchanged. All PASS.
  - `rg "as React.Ref<HTMLButtonElement>" src/components/CopyButton` → none.
  - Not verified here (orchestrator, Storybook): pointer drag on the new story, CTAButton `AsChildButton` story.
- docs owed: usage SKILL.md (single-thumb note on the Slider entry), codebase SKILL.md LPI row ("determinate only — `value` is `number`"), CHANGELOG `[Unreleased]` Changed (LPI `value` number-only; CopyButton/CTAButton ref types) and Fixed (Slider extra values no longer dropped or moved).

## Stepped slider keyboard x10 [WI-105, F-022]
- files: `src/components/Slider/Slider.tsx`, `src/components/Slider/Slider.stories.tsx`
- what changed: `handleKeyDown` computes `isSkipKey` (PageUp/PageDown, or Shift+Arrow) and moves `step * 10` for those keys; plain Arrow/Home/End unchanged; the existing clamp keeps the result in range. Comment explains it mirrors Radix's multiplier. "Keyboard interaction" story description rewritten per the WI. (`const big = step * (isSkipKey ? 10 : 1)` — one hit for the WI's grep.)
- consumer impact: on SliderStepped / SliderLabeled `stepped`, PageUp/PageDown and Shift+Arrow now move 10 dots (clamped), matching SliderContinuous.
- breaking: no
- verified: same esbuild script — 0..4 slider from 2: PageUp→4, Shift+ArrowLeft→0; 0..100 from 50: PageUp 60, PageDown 40, Shift+ArrowRight/Up 60, Shift+ArrowDown 40, plain ArrowRight 51, rtl Shift+ArrowRight 40, inverted Shift+ArrowLeft 60, Shift+Home 0; unrelated key (Tab) not prevented. All PASS. Lint exit 0.
- docs owed: arch SKILL.md sanction sub-bullet for SliderBase's `preventDefault` (text in WI-105 step 4); codebase SKILL.md Slider keyboard sentence; CHANGELOG `[Unreleased]` Fixed line.

## LPI colour docs and "Color prop" stories [WI-046, F-010, F-047, F-117]
- files: `src/components/LinearProgressIndicator/LinearProgressIndicator.tsx`, `src/components/LinearProgressIndicator/LinearProgressIndicator.stories.tsx`, `src/components/Slider/Slider.stories.tsx`
- what changed: header `## behavior` bullet now credits the `width`/`left` transitions (`ds-progress-fill` / `ds-progress-remainder`, off under reduced motion) instead of `@property` registration (confirmed in dooph-component-tokens.css); both `## constraints` untouched. `color` JSDoc names `DS_COLOR_TOKENS` keys ('primary', 'prominent', 'text', 'danger-primary', …). Both "Color prop" stories iterate `primary/prominent/text/danger-primary`; LPI "Brand - Animated" → "Prominent - Animated"; Slider Color story description now states the per-variant track opacity token (50% light / 60% dark, confirmed in tokens.css).
- consumer impact: none at runtime; IntelliSense and stories no longer offer colour names that paint transparent.
- breaking: no
- verified: `rg "'brand'|error-primary|Brand - Animated|at 45%"` over both folders → no output. Lint exit 0. Visual "every sample paints" check left to the orchestrator.
- docs owed: none beyond the skill/CHANGELOG parts the brief defers.

## Scoreboard
Before → after: identical on every metric (diff of the two runs is empty).

## DONE
