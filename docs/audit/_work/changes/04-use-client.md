# 04 — `"use client"`: prologue-aware stamping, directive only where needed (batch 04, agent C)

Status: done. One item left to the orchestrator (ShapeMorphSpinner / DropdownCaret, trigger 4 → WI-034).

## Progress (write-to-disk-first)
- [x] 0. Baseline scoreboard: m7 = 40
- [x] 1. WI-033: prologue reader in scripts/add-use-client.mjs
- [x] 2. WI-037: per-module trigger audit of all 40 directive modules (+ AIModelSelect)
- [x] 3. Apply directive removals / additions
- [x] 4. Headers mentioning the directive — none of the touched files' `## behavior`/`## constraints` blocks mention it; no header edits needed
- [x] 5. lint exit 0; scoreboard m7 40 → 28, nothing else moved
- [x] 6. Scratch worktree build + stamp check + RSC check; worktree removed

---
### The build now stamps every client module, even when a header comment comes first [WI-033, F-011]
- files: `scripts/add-use-client.mjs`
- what changed: the post-build stamper used to look for `"use client"` only in
  the first 5 lines of each source file, so any module whose header contract
  (R11.9 puts it first) pushed the directive lower shipped unstamped — 16 of 40
  at HEAD. It now reads the module's directive prologue the way a JS parser does
  (skips BOM, whitespace, `//` and `/* */` comments, collects leading string
  statements). A `"use client"` line that sits anywhere outside the prologue
  (e.g. below an import) now fails the build with the file named, instead of
  being silently ignored. The script's top comment states the new rule.
- consumer impact: every module that keeps the directive is now a real client
  boundary in dist. Before this, RSC consumers hit `createContext is not a
  function` on the root import. No effect on Vite/non-RSC consumers.
- breaking: no
- verified: parser unit cases (header-then-directive, BOM, `'use strict'` first,
  directive after an import → not detected, directive inside a comment → not
  detected) all pass; guard regex detects a misplaced directive line and ignores
  `const s = "use client"`. `prologue-scan.mjs` at HEAD: 40 lines / 24 old / 40 new.
  Build checks: see the verification section below.
- docs owed: none for this script beyond what WI-037's rule text covers (codebase
  SKILL.md:627-636 and README.md:30-48 become true as written).

### `"use client"` only where a module truly needs it [WI-037, D-05 (a) strict, F-027, F-012]
Rule applied (the maintainer's four triggers): the module itself (1) calls a
client-only React hook (useState/useEffect/useLayoutEffect/useRef/useReducer/
useContext/createContext/… or a custom hook built on them), (2) touches a browser
API (window/document/navigator/timers/rAF/observers/getComputedStyle), (3) creates
an event-handler closure on a host element, or (4) creates a function and passes
it to a client component. `forwardRef`, `useId`, `useMemo`, `useCallback`, and
passing a consumer's own prop through unchanged do not count. Each of the 40
directive modules plus every neutral module was checked (scripted survey for
hooks / browser globals / `on*={() =>` / `on*={localFn}` / function-valued JSX
props, then read by hand).

**Lost the directive (13) — no trigger applies:**
| module | why neutral |
|---|---|
| `Button/Button.tsx` | forwardRef + cva + Radix Slot; no hooks, no closures |
| `Checkbox/Checkbox.tsx` | forwardRef around Radix Checkbox (Radix carries its own boundary) |
| `ShapeButton/ShapeButton.tsx` | forwardRef + Slot; renders neutral Shapes directly |
| `VerificationCode/CodeDigitInput.tsx` | forwardRef `<input>`; `onFocus`/`onBlur` are the consumer's props passed through |
| `Modal/Modal.tsx` | forwardRef wrappers around Radix Dialog parts |
| `Popover/Popover.tsx` | forwardRef wrapper around Radix Popover parts |
| `Sheet/Sheet.tsx` | forwardRef wrappers around Radix Dialog parts |
| `Tooltip/Tooltip.tsx` | wrappers around Radix Tooltip parts |
| `Tabs/Tabs.tsx` | forwardRef wrappers around Radix Tabs parts |
| `SearchBox/SearchBox.tsx` | forwardRef `<input>` + HotkeyIndicator; no handlers created |
| `SplitButton/SplitButton.tsx` | forwardRef `<button>`s; props spread through |
| `LinearProgressIndicator/LinearProgressIndicator.tsx` | forwardRef around Radix Progress; value maths only (directive was on line 1 above the header — header is now first) |
| `DatePicker/DatePickerTrigger.tsx` | forwardRef around (client) DropdownTrigger; no function props created |

**Gained the directive (1):**
| module | trigger |
|---|---|
| `AIChat/AIModelSelect.tsx` | (4) `AIThinkingEffortSelector` creates `onValueChange={([next]) => …}` and passes it to client `SliderLabeled`. Inserted below the header contract (R11.9), which only the WI-033 prologue reader honours. |

**Kept the directive (27) — trigger per module:**
- (1) hooks: `AIChat/AIPromptInput` (createContext/useState/useRef/useLayoutEffect), `AIChat/AIThinkingPart` (useState), `AnimatedText/FadeChangeText`, `AnimatedText/RollChangeText` (useChangeSwap), `AnimatedText/RevealChangeText` (useState/useRef/useEffect + ResizeObserver), `AnimatedText/RollingDigitsText` (useState), `AnimatedText/useChangeSwap.ts` (useState/useRef/useEffect), `Calendar/Calendar` (useState/useRef/useEffect), `CopyButton/CopyButton` (+ navigator.clipboard, setTimeout), `DatePicker/DatePicker` (useState), `DropdownTrigger/DropdownTrigger` (useRef), `Input/Input` (useRef/useState), `LoadingSpinner/LoadingSpinner` (useRef/useEffect + rAF), `Menu/DropdownMenu` (createContext/useContext + document), `MorphRotationShape/MorphRotationShape` (useState/useRef/useLayoutEffect + rAF), `OutlineButton/OutlineButton` (useRef), `SegmentedTabSelect/SegmentedTabSelect` (createContext/useContext), `SidebarWithHoverIcon/SidebarWithHoverIcon` (useRef/useLayoutEffect + rAF), `Slider/Slider` (useState), `Toast/Toast` (createContext/useState + setTimeout), `Toggle/Toggle` (createContext/useState), `VerificationCode/VerificationCodeInput` (useState/useRef).
- (3) closure on a host element: `Calendar/CalendarCaption` (`onClick={() => onMonthChange(…)}`), `Calendar/CalendarGrid` (`onClick={() => onDayClick(date)}`), `Calendar/CalendarPresetsPanel` (`onClick={(event) => …}`), `Menu/DropdownMenuSearch` (`onKeyDown={handleKeyDown}`, a local closure).
- (4) closure to a client component: `DatePicker/DatePickerSplitTrigger` (`onValueChange={handlePresetChange}` on the client SegmentedTabSelect).

**Trigger (4) applies but NOT added — left to WI-034 (not this lane):**
`ShapeMorphSpinner/ShapeMorphSpinner.tsx` and `DropdownCaret/DropdownCaret.tsx`
pass shape *components* (functions) to the client `MorphRotationShape`, so a
Server Component rendering either fails at Flight serialisation. WI-034's
planned fix passes serialisable `Shapes` keys instead, which removes the trigger
without a directive; adding the directive now would be a stopgap WI-034 undoes.
Orchestrator/maintainer: pick one (WI-034, or a directive on both now).

- consumer impact: in React Server Components, the 13 wrappers render on the
  server (their Radix internals stay client); `buttonVariants`, `checkboxVariants`,
  `tabTriggerVariants` and `formatTriggerLabel` can be called from server code;
  `AIThinkingEffortSelector` (and the rest of AIModelSelect's parts) are now a
  client boundary. Vite/non-RSC consumers: no change.
- breaking: no
- docs owed: rule text in `.agents/skills/dooph-ds-contribution/SKILL.md:71` and
  `.agents/skills/dooph-ds-codebase/SKILL.md:619-636` (the four triggers + the
  "Current split" list above); CHANGELOG `[Unreleased] → Fixed` line from WI-037
  step 6. Stale mid-file comments that remain *true* (e.g. Button.tsx:108
  "constants … kept server-safe (no "use client")") left untouched — outside lane.

### Verification (both items)
- `npm run lint` → exit 0.
- Scoreboard: m7 `"use client" files` **40 → 28**; no other metric moved.
- Scratch worktree `../ds-wi-agentC` (removed afterwards; `git worktree list` shows only main):
  - **before** (HEAD b436647 as-is, `npm ci && npm run build`): build log
    `stamped "use client" on 48 output chunk(s) from 24 client source module(s)`;
    `dist-stamp-check.mjs` → ESM 24/40, CJS 24/40, 16 unstamped, `FAIL`;
    `rsc-root.mjs` → `root import FAIL TypeError: createContext is not a function`.
  - **after** (main's working tree `src/` + `scripts/` copied in, so batches 01–03
    are included): build log `stamped "use client" on 56 output chunk(s) from 28
    client source module(s)`; `dist-stamp-check.mjs` → ESM 28/28, CJS 28/28,
    unstamped 0, `PASS`; inverse check (scratchpad script: every stamped dist file's
    bundled `src/` modules all carry the directive) → 84 stamped dist files
    (56 chunks), 0 containing a neutral module, `PASS`; `prologue-scan.mjs` → 28 / 28;
    `rsc-root.mjs` → `root import OK; exports: 318`; `rsc-boundaries.mjs` →
    `ALL PASS` (13 wrappers neutral; AIThinkingEffortSelector, AIModelSelectTrigger,
    Calendar/DatePicker closure parts, Input, ToggleSwitch client references;
    `tabTriggerVariants()` and `buttonVariants()` return strings;
    `checkboxVariants`/`formatTriggerLabel` SKIP — no longer root-exported after batch 03).
  - Guard: `import "x";` inserted above the directive in the worktree's Input.tsx →
    `node scripts/add-use-client.mjs` throws naming `src/components/Input/Input.tsx`.
    Reverted. Worktree `src/`/`scripts/` identical to main after the build (no generated drift).
  - Windows note for re-running the RSC probes: pass `--import` as a `file:///C:/…`
    URL; a bare `C:/…` path fails with `ERR_UNSUPPORTED_ESM_URL_SCHEME`.
- Not done: Storybook interaction pass (Tooltip/Modal/Sheet/Popover/Tabs/Checkbox/
  Button/DatePicker). The directive has no effect outside an RSC bundler, so
  Storybook (Vite) behaviour cannot change; left for the maintainer's routine check.

## DONE
