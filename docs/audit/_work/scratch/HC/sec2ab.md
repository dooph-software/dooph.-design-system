## 2. Pattern tallies (for merging)

### (a) Hardcoded motion (R6.1 / R6.5 / R6.6)

Method: `node docs/audit/_work/scratch/HC/motion-tally.cjs` (skips comment lines; output in `scratch/HC/motion-tally.out.txt`) plus the comment-stripped CSS scan `scratch/HC/css-motion-literals.txt`. Totals in non-story TS/TSX: **47** `duration-N` utilities, of which 15 are `motion-reduce:…duration-0` reduced-motion carve-outs (compliant, R6.2). That leaves **32 hardcoded durations in 17 files**. There are also **7** `ease-*` utilities, **2** arbitrary `[animation-timing-function:cubic-bezier(…)]`, **7** inline `transition`/`animation` strings (4 OutlineButton, 2 ProgressIndicator, 1 LoadingSpinner), and **2** implicit Tailwind/tw-animate defaults (150 ms): Popover.tsx:50 `animate-in/out` with no duration, and Toast.tsx:60 `transition-transform`. `delay-N`: 0.

**a.1 State/hover transitions (`transition-* duration-100|150 [ease-out]`): 17 sites, 14 files**

| component | location(s) | literal | unit cover |
|---|---|---|---|
| Button (+ CopyButton, AIModelSelectTrigger, AIPromptInputSubmit, Table sort header via Button) | Button/Button.tsx:41 | `transition-all duration-150 ease-out` | U4-F5 |
| OutlineButton | OutlineButton/OutlineButton.tsx:162 | `transition-all duration-150 ease-out` | U4-F5 |
| SplitButton | SplitButton/SplitButton.tsx:24, 55 | `transition-all duration-100` | U4-F5 |
| Checkbox | Checkbox/Checkbox.tsx:37 | `transition-all duration-150 ease-out` | U6-F5 |
| Toggle / Tabs options (`toggleOption`) | Toggle/toggleOption.ts:30 | `transition-all duration-150 ease-out` | U6-F5 |
| Input | Input/Input.tsx:123, 158 | `transition-all duration-100` | U6-F5 |
| CodeDigitInput | VerificationCode/CodeDigitInput.tsx:48 | `transition-all duration-100` | U6-F5 |
| DropdownTrigger / TypeableDropdownTrigger / TextDropdownTrigger (+ DatePickerTrigger) | DropdownTrigger/DropdownTrigger.tsx:63, 196, 321 | `transition-all duration-150 ease-out` | U5-F3 |
| DropdownMenu items + CalendarPresetItem (`menuItemClassName`) | Menu/DropdownMenu.tsx:197 | `transition-colors duration-100` | U5-F3 |
| SearchBox | SearchBox/SearchBox.tsx:32 | `transition-all duration-100` | U5-F3 |
| HotkeyIndicator | HotkeyIndicator/HotkeyIndicator.tsx:19 | `transition-colors duration-100` | U5-F3 |
| TextLink | TextLink/TextLink.tsx:22 | `transition-colors duration-100` | U3-F9 |
| TableRow | Table/Table.tsx:114 | `transition-colors duration-100` | U12-F13 |

The family disagrees with itself: 150 ms + `ease-out` in 7 sites, 100 ms + the default curve in 10.

**a.2 Overlay enter/exit (tw-animate `animate-in/out`): 15 durations + 2 arbitrary easings + 2 implicit defaults**

| component | location(s) | literal | reduced motion | unit cover |
|---|---|---|---|---|
| DropdownMenuContent | Menu/DropdownMenu.tsx:168-169 | open `duration-100`, closed `duration-150` + `slide-out-to-bottom-1.5` | yes (:170) | U5-F3 |
| ModalOverlay / ModalContent | Modal/Modal.tsx:29-30, 75-76 | 200 / 150 | yes (:31, :77) | U8-F3 |
| SheetOverlay / SheetContent | Sheet/Sheet.tsx:37-38, 73-74 (+ `slide-*-[20%]` :82-94) | 300 / 200 + `[animation-timing-function:cubic-bezier(0.32,0.72,0,1)]` / `cubic-bezier(0.4,0,1,1)` | yes (:39, :75) | U8-F3 |
| TooltipContent | Tooltip/Tooltip.tsx:62-64 | 100 / 100 / 150 | yes (:65) | U8-F3 |
| ToastRoot | Toast/Toast.tsx:62-63; :60 `transition-transform` (implicit 150 ms) | 150 / 150 | yes for 62-63 (:64); **no** for :60 | U8-F3 (lists 62-63; :60 not listed) |
| PopoverContent | Popover/Popover.tsx:50-52 | implicit tw-animate 150 ms (`animation-duration: 150ms`, dist-styles.css:2005ff) | **no** | U7-F3 |

**a.3 Inline style motion strings (no stylesheet or reduced-motion rule can reach them): 7**

| component | location | literal | unit cover |
|---|---|---|---|
| OutlineButton orbs | OutlineButton/OutlineButton.tsx:192, 206, 257-258, 278-279 | `opacity 0.36s ease-out`, `opacity 0.42s ease-out`, `opacity 0.36s ease-out, transform 0.16s ease-out`, `opacity 0.42s ease-out, transform 0.22s ease-out` | U4-F5 |
| ProgressIndicator arcs | ProgressIndicator/ProgressIndicator.tsx:123-124 (const), 151, 165 | `300ms cubic-bezier(0.4, 0, 0.2, 1)` | U9-F4 |
| LoadingSpinner spokes | LoadingSpinner/LoadingSpinner.tsx:260 | `ds-spinner-rotate ${spokesDuration}ms linear infinite` | U9-F2 |

**a.4 JS timing constants / timers**

| component | location | literal | unit cover |
|---|---|---|---|
| LoadingSpinner | LoadingSpinner/spinnerGeometry.ts:52, 71; LoadingSpinner.tsx:137-148 | `SPINNER_ANIM_DURATION = 1800`, `SPINNER_SPOKES_DURATION = 1280`, cosine easing in JS | U9-F2 (li conflict U9-F3) |
| Toast | Toast/Toast.tsx:229-231 | `setTimeout(…, 200)` mirroring CSS `duration-150` | U8-F2 |
| CopyButton | CopyButton/CopyButton.tsx:16, 59 | `const REVERT_MS = 2000` | U4-F5 |

**a.5 Literal timings inside `ds-*` rules (src/styles, comment-stripped)**

| component | location | literal | unit cover |
|---|---|---|---|
| ShimmerText (+ AIToolPart/AIThinkingPart live labels) | src/styles/index.css:380 | `ds-shimmer 2s linear infinite` | U1-F6, U3-F2 |
| RollHoverText | src/styles/index.css:422-424 | `cubic-bezier(0.32, 0.72, 0, 1)` ×3 (duration is a token; ease is not) | U1-F6, U3-F2 |
| ShapeButton | src/styles/dooph-component-tokens.css:43-44 | `color 150ms, filter 150ms` | U1-F6, U4-F5 |
| LinearProgressIndicator | src/styles/dooph-component-tokens.css:129, 132 | `width 300ms ease-out`, `left 300ms ease-out` | U1-F6, U9-F4 |
| Slider glide | src/styles/dooph-component-tokens.css:169-170 | `180ms`, `cubic-bezier(0.22, 1, 0.36, 1)` | U1-F6, U6-F5 |
| CopyButton icon swap | src/styles/dooph-component-tokens.css:373-374 | `opacity 120ms ease-out`, `transform 160ms cubic-bezier(0.32, 0.72, 0, 1)` | U1-F6, U4-F5 |

Compliant literals, not counted: reduced-motion `0ms`/`1ms` (index.css:693, 699, 730, 752, 774, 808, 863, 916 — R6.2, R12.11), and `linear` on constant-rate clocks whose duration is a token (index.css:798, 804).

**a.6 R6.1 coverage — animated components by token family**

- **Have a `--ui-<component>-*` duration + ease family (10 components):** RollChangeText, FadeChangeText (aliases roll-change), RevealChangeText, RollingDigitsText, UnderlineLinkText, SidebarWithHoverIcon, MorphRotationShape, ShapeMorphSpinner and DropdownCaret (shared `--ui-shape-morph-*`), and the AIChat parts (`--ui-chat-reveal/stream/disclosure-*`).
- **Partial:** RollHoverText has `--ui-roll-hover-duration` but no ease token.
- **No family (28 components):** Button, OutlineButton, SplitButton (Action/Trigger), CopyButton, ShapeButton, Checkbox, Toggle options, Tabs triggers, Input, CodeDigitInput, Slider, DropdownTrigger, TypeableDropdownTrigger, TextDropdownTrigger, DropdownMenuContent, DropdownMenu items, CalendarPresetItem, SearchBox, HotkeyIndicator, TextLink, TableRow, ModalOverlay/ModalContent, SheetOverlay/SheetContent, TooltipContent, ToastRoot, PopoverContent, ProgressIndicator, LinearProgressIndicator, LoadingSpinner, ShimmerText.

**Consolidation.** 12 unit findings file this one pattern piecemeal: U1-F6, U3-F2, U3-F9, U4-F5, U5-F3, U6-F5, U7-F3 (motion part), U8-F2, U8-F3, U9-F2, U9-F4, U12-F13. U3-F9, U4-F5 and U12-F13 each independently ask the maintainer to "decide once" whether the micro-interaction hover transition is a system token or a sanctioned carve-out. → **HC-F1**.

### (b) Raw `var(--ui-*)` in `className`/cva strings (R8.10) vs sanctioned carriers

Method: `rg -o "\[[^\]]*var\(--ui-…"` over non-story TS/TSX (className arbitrary values), `rg -o "[\w:!-]+-\(--[\w-]+\)"` (TW4 `x-(--var)` shorthand: **0**), `rg -o "\[--[\w-]+:[^\]]*\]"` (arbitrary custom-property classes: **0**). Stories: 0.

**b.1 In className — R8.10 violations: 5 occurrences, 1 file**

| location | class | cover |
|---|---|---|
| src/components/Slider/Slider.tsx:344 | `h-[var(--ui-height-slider-handle)]` | U6-F3 |
| src/components/Slider/Slider.tsx:368 | `w-[max(0px,calc(var(--slider-pct)/100*(100%-var(--ui-width-slider-handle))-var(--ui-slider-track-gap)+var(--ds-slider-pad)))]` | U6-F3 |
| src/components/Slider/Slider.tsx:380 | `left-[min(100%,calc(var(--slider-pct)/100*(100%-var(--ui-width-slider-handle))+var(--ui-width-slider-handle)+var(--ui-slider-track-gap)))]` | U6-F3 |
| src/components/Slider/Slider.tsx:408 | `h-[var(--ui-height-slider-handle)] w-[var(--ui-width-slider-handle)]` (2) | U6-F3 |

These are not R8.10 but are the same shape, with non-`--ui` custom properties in arbitrary className values (R9.2): LinearProgressIndicator.tsx:61, 62 (`bg-[var(--ds-progress-color)]`), 69 (U9-F15); Slider.tsx:367, 379, 411 (`bg-[var(--ds-slider-color)]`) (U6-F3). Toast.tsx:59, 61 use `translate-x-[var(--radix-toast-swipe-*-x)]`. That is Radix's documented swipe-variable pattern: compliant, and R2.13 concerns class names, not vars.

**b.2 In inline style / JS carriers — sanctioned by R8.12 / R1.4 / R1.7 (not violations of R8.10)**

| location | carrier | note |
|---|---|---|
| src/utils/color.ts:19-37 | `DS_COLOR_TOKENS` name→var table | open-value resolver. Its shape (lookup table) is U2-F3 |
| LoadingSpinner.tsx:29-30; ProgressIndicator.tsx:34-35; ShapeMorphSpinner.tsx:34-35 | private `COLOR_TOKENS` copies | duplication: U2-F3, U9-F7 |
| LinearProgressIndicator.tsx:34 | `DEFAULT_COLOR` → inline custom property | U9-F7 context |
| spinnerGeometry.ts:36-39; ShapeMorphSpinner.tsx:65-66 | `var(--ui-size-spinner-*)` → inline width/height | R8.12 ok (U9 claims) |
| BaseIcon.tsx:10-13, 61 | icon size / stroke-width vars → inline style | R8.12 ok |
| CTAButton.tsx:20, 26 | `var(--ui-text-cta-*)` → `ButtonText fontSize` | R1.7 ok (U4 fingerprint) |
| Text/constants.ts:33-118 | open-value consts (`FontFamilies`, `FontSizes`, …) | R1.4 by design |
| OutlineButton.tsx:133-134 | glow default → inline `background` | R8.12 ok |
| Slider.tsx:58-75, 100, 339 | variant defaults → inline custom properties | inline **defaults** override consumer `style`: U6-F21 |
| Sticker.tsx:113, 125 | `resolveDsColor` default + `color-mix` inline | ok |
| LoadingSpinner.tsx:200; ProgressIndicator.tsx:145, 238 | `stroke="var(--ui-color-border-primary)"` as an **SVG attribute** | letter of R9.19; batched in U9-F19 |

No consolidation needed: R8.10 is one file, covered by U6-F3.

