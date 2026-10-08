# 06B5 — AIChat parts + Checkbox (WI-018, WI-052, WI-054, WI-094, WI-097, WI-103, WI-104)

Checklist:
- [x] Header contracts brought into format (Checkbox, CodeDigitInput, RollingDigitsText, AIChat) [WI-018]
- [x] Checkbox press gated to unchecked [WI-052]
- [x] AIPromptInputSubmit / AIThinkingEffortSelector forward props; unknown effort throws [WI-094]
- [x] AIThinkingPart `data-phase` [WI-103]
- [x] ChatDivider `h-3` / AIThinkingPart `h-auto!` dropped [WI-104]
- [x] Reduced-motion chat shimmer tone [WI-097]
- [x] Model tooltip title via `--ds-chat-model-color` [WI-054]
- [x] lint + scoreboard

Scoreboard before: motion 0, arbitrary px 18, numeric spacing 36, raw var 5, focus 3, disabled 2, use client 28, JS timers 5, onValueChange 0, default exports 0.
Scoreboard after: identical (no metric moved).

How "before" was measured: no build in this checkout, so `src/` was bundled with esbuild (cjs, packages external) into a scratch "build root" (dist/index.cjs plus a junction to node_modules). The "before" root is a copy of `src/` with this batch's code edits reversed by script. The audit check scripts (`W6/wi-c6-02-check.cjs`, `W6b/wi-c6-11-check.cjs`, `W6b/wi-c6-12-check.cjs`) ran against both. CSS was compiled with `tailwindcss -i src/styles/index.css -o <scratchpad>/b5-styles.css` (output outside the repo; `git status` unchanged).

## Header contracts brought into the file-header format and current vocabulary [WI-018]
- files: `src/components/Checkbox/Checkbox.tsx`, `src/components/VerificationCode/CodeDigitInput.tsx` (header only), `src/components/AnimatedText/RollingDigitsText.tsx` (header only), `src/components/AIChat/{AIThinkingPart,AIToolPart,AITurnSummary,ChatDivider,UserMessageHeader,AIModelSelect}.tsx` (headers only).
- what changed:
  - Checkbox: title and variant bullet say `prominent | primary` (there is no `brand` member). Inline comment "matches typeabletrigger hover, not brand" → "matches the typeable trigger's hover border".
  - CodeDigitInput: `error-primary` → `danger-primary`, "brand focus ring" → "the prominent focus ring" (substrings only; its `disabled` clause left for WI-066).
  - RollingDigitsText: the `## updating` section is gone. Its three rules are now `## constraints` bullets, each with its failure: no duration in JS (it desyncs and the fade overruns the roll); no timer/rAF/transitionend; the reconcile stays in render. Drift: the first bullet keeps today's mention of the motion scale (`--ui-motion-*`) beside `--ui-rolling-digits-*`, which the WI text predates. The header closes at line 38 (≤ 42).
  - AIThinkingPart: "Transcript colour is inherited by `ds-chat-prose`" moved from `## constraints` to `## behavior` (it is behaviour).
  - AIToolPart: the AI-SDK-state constraint now names its failure (it would tie the package to one SDK's vocabulary and version).
  - AITurnSummary: "Render it only once a turn has settled" moved to `## behavior`, reworded as consumer guidance.
  - ChatDivider, UserMessageHeader: rewritten as prose headers with no `## behavior` / `## constraints`, since neither has an invariant beyond layout. Every rule is kept in the prose: ChatDivider's "when to draw one is the consumer's decision", UserMessageHeader's "NOT sticky" and its reason.
  - AIModelSelect: `## behavior` added over the parts table. The provider-colour constraint gains its failure ("a class cannot carry an arbitrary consumer colour").
- consumer impact: none (comments only).
- breaking: no
- verified: lint exit 0. `brand|error-primary` → no hits in Checkbox/CodeDigitInput. `## updating|almost always|hasCents|an earlier version` → no hits in RollingDigitsText. `## behavior` ×1 in AIModelSelect. No `## constraints` in ChatDivider/UserMessageHeader.
- docs owed: none. Maintainer note: AGENTS.md says removing a constraint is its own commit, with the reasoning stated. The ChatDivider/UserMessageHeader change drops the `## constraints` heading but keeps both rules as prose. If you read that as a removal, commit it separately (reason: R11.5 prose form, for files with no invariant a reasonable edit would violate).

## Checkbox keeps its fill while a checked box is pressed [WI-052]
- files: `src/components/Checkbox/Checkbox.tsx`
- what changed: the press background `active:bg-secondary-hover` is now gated to `data-[state=unchecked]`, like hover. Header `## behavior`: "Unchecked hover/active use secondary surface tokens; a checked or indeterminate box keeps its fill while pressed." The inline comment no longer calls the old behaviour intentional.
- consumer impact: pressing a checked or indeterminate Checkbox no longer flashes the secondary-hover background over the fill, so the check stays legible. Unchecked press is unchanged. The pressed border/shadow on checked boxes is unchanged.
- breaking: no
- verified: SSR shows the class `data-[state=unchecked]:[&:not([data-disabled])]:active:bg-secondary-hover`. The compiled CSS has exactly one rule for it, with selector `…[data-state="unchecked"]:not([data-disabled]):active`. The forced-`:active` browser check is left to the orchestrator.
- docs owed: CHANGELOG Fixed: "`Checkbox`: a checked or indeterminate box keeps its fill while pressed."

## AIPromptInputSubmit and AIThinkingEffortSelector forward their props; an unknown effort value throws [WI-094]
- files: `src/components/AIChat/AIPromptInput.tsx`, `src/components/AIChat/AIModelSelect.tsx`
- what changed:
  - `AIPromptInputSubmitProps` extends `ComponentPropsWithoutRef<"button">` minus `children | type | disabled | aria-label`. The rest props spread FIRST on both buttons, so the part's `type`, variant, `size` (iconSm), `disabled` and accessible name always win. In the stop state a consumer `onClick` runs before `onStop`, and `event.preventDefault()` cancels the stop (documented in the component JSDoc).
  - `AIThinkingEffortSelectorProps` extends `ComponentPropsWithoutRef<"div">` minus `children | color | onChange | defaultValue` (the part's own `color` is a `DsColor`). Rest props spread first on the root.
  - The selector throws `[AIThinkingEffortSelector] value "<v>" is not one of steps: a, b` when `value` is not in a non-empty `steps`, instead of silently drawing step 0. Empty `steps` still renders as before.
  - The AIModelSelect header's `## constraints` gains: "AIThinkingEffortSelector THROWS when `value` is not one of `steps` …".
  - Policy note: the WI said to switch to a dev warning if D-12 chose that. D-12 chose "render nothing after a dev warning" for Calendar/DatePicker only, and kept a throw for ProgressIndicator's own guard. This selector's guard is a component-level bad-value guard like ProgressIndicator's, so the throw was kept. The maintainer may overrule.
- consumer impact: `<TooltipTrigger asChild>` / `<DropdownMenuTrigger asChild>` now work around both parts (the tooltip opens, `data-state` lands). `id`, `data-*`, `aria-*` and handlers reach the DOM. An effort `value` missing from `steps` now throws during render.
- breaking: no per the WI (semver minor). But the new throw fails a render that used to "work", so the maintainer may want it listed under v6.
- verified: `wi-c6-02-check.cjs` before `FAILURES: 6` → after `ALL PASS`. Its `BASELINE:` line (a valid selector render) is byte-identical before and after. tsc probe: `<AIPromptInputSubmit type="button" />`, `disabled` and the selector's `onChange` each error (TS2322). `id`/`data-testid`/`onClick`/`aria-describedby` on the submit and `id`/`style`/`className`/`color` on the selector → no error.
- docs owed: CHANGELOG Fixed: "`AIPromptInputSubmit` and `AIThinkingEffortSelector` forward their remaining props, so `asChild` triggers (Tooltip, DropdownMenu) and `id`/`data-*`/`aria-*` attributes work on them." CHANGELOG Changed: "`AIThinkingEffortSelector` throws when `value` is not one of `steps`, instead of drawing the first step." Usage skill, AI chat notes: the stop-click `preventDefault()` hook.

## AIThinkingPart exposes its phase as `data-phase` [WI-103]
- files: `src/components/AIChat/AIThinkingPart.tsx`
- what changed: every root branch renders `data-phase={state}` beside its existing `data-state`. `data-state` is unchanged: the phase on the live and plain rows, `open`/`closed` on the disclosure row. Both are set before `...props`, so a consumer value still wins. The header's `## behavior` gains the "Root attributes" bullet, which explains both attributes and says not to change what `data-state` holds.
- consumer impact: a phase can be styled with `data-[phase=thought]:…` on every row; `data-state` selectors keep working.
- breaking: no
- verified: `wi-c6-11-check.cjs` before `FAILURES: 4` → after `ALL PASS`. `data-phase={state}` appears 3 times in the file.
- docs owed: CHANGELOG Added: "`AIThinkingPart` renders `data-phase` (the `state` prop) on its root in every variant; `data-state` is unchanged."

## Chat parts stop restating sibling sizes [WI-104]
- files: `src/components/AIChat/ChatDivider.tsx`, `src/components/AIChat/AIThinkingPart.tsx`
- what changed: ChatDivider's wavy rules drop `h-3`, because WavyDivider's own `height="12"` sizes them. AIThinkingPart's disclosure button uses plain `h-auto` instead of `h-auto!`, and the three-line workaround comment is gone (`cn` now replaces `h-button`).
- consumer impact: none at a 16px root. At other root sizes the divider keeps WavyDivider's 12px band.
- breaking: no
- verified: `wi-c6-12-check.cjs` before `FAILURES: 3` (the `cn` line already passed) → after `ALL PASS`. Button height classes before `h-auto! h-button px-sm py-xxs` → after `h-auto px-sm py-xxs`. No `h-auto!`/`h-3` is left in non-story AIChat files. The only `*-button` height left is AITurnSummary's `h-button-sm`, as the WI expects. The Storybook height arrays are left to the orchestrator.
- docs owed: CHANGELOG Fixed: "`ChatDivider`'s wavy rules keep WavyDivider's 12px band at any root font size."

## Live chat labels keep their tone under reduced motion [WI-097]
- files: `src/styles/dooph-component-tokens.css`
- what changed: after `.ds-chat-thinking-shimmer`, a `prefers-reduced-motion: reduce` block paints `.ds-shimmer-text.ds-chat-tool-shimmer` with `--ui-chat-tool-shimmer-base` and `.ds-shimmer-text.ds-chat-thinking-shimmer` with `--ui-chat-thinking-shimmer-base`. The selectors use two classes so they beat index.css's later `color: inherit`. index.css and ShimmerText are untouched; no header changes.
- consumer impact: with reduced motion, live AIToolPart / AIThinkingPart labels show the chat tone instead of the container's text colour. Nothing changes with motion allowed.
- breaking: no
- verified: the compiled CSS contains both rules inside the reduced-motion media block (2 matches). The browser computed-colour check is left to the orchestrator.
- docs owed: CHANGELOG Fixed: "Under `prefers-reduced-motion: reduce`, a live `AIToolPart` / `AIThinkingPart` label keeps its chat tone instead of inheriting the container's text colour."

## Model tooltip title takes the provider colour through the custom property [WI-054]
- files: `src/components/AIChat/AIModelSelect.tsx`, `src/styles/dooph-component-tokens.css`
- what changed: `AIModelTooltipContent` sets `--ds-chat-model-color` on the tooltip root, merged after a consumer `style` as AIModelSelectItem does. The title is `<ButtonText className="ds-chat-model-name">` with no inline style. New rule `.ds-chat-model-name { color: var(--ds-chat-model-color, currentColor); }` after `.ds-chat-model-swatch`. The header's colour constraint (made explicit in WI-018) is now true at every sink.
- consumer impact: the title colour is unchanged with and without `color`. Edge: an unportalled tooltip with no `color`, nested in an element that sets `--ds-chat-model-color`, now inherits that colour.
- breaking: no
- verified: SSR with Radix's Portal stubbed. Before: the title has `style="color:…"`. After: no inline style on the title; the root style carries `--ds-chat-model-color:<value>` plus the consumer's `opacity` and Radix's own variables; with no `color`, there is no custom property. `{ color: resolveDsColor` → no hits in `src`. The compiled CSS has `.ds-chat-model-name` (1).
- docs owed: none beyond an optional CHANGELOG Fixed line ("`AIModelTooltipContent`'s title reads the provider colour from `--ds-chat-model-color`").

## Verification summary
- `npm run lint`: exit 0 (after all edits).
- Scoreboard: no metric moved.
- Not done, per the brief: Storybook/browser checks (Checkbox forced `:active`, reduced-motion computed colours, divider/disclosure heights, tooltip on the submit).
- Observed, not mine: in SSR, `resolveDsColor("ai-anthropic", "")` returned the raw string `ai-anthropic` (same before and after). That story value may not be a DS token name.

## DONE
