# HC — horizontal pass: H6 Rules 5/6/7 · H7 Rules 2/3 · residual H3 token-bypass counts

Audited commit `b436647`. Inputs: `greps/h6-rules567.txt`, `greps/h6-timing.txt`, `greps/h7-radix.txt`, `greps/h3-*.txt`, `greps/h2-style.txt`. I widened the greps myself: `scratch/HC/h6-wide.txt` (timers, rAF, animation/transition events, observers, `getComputedStyle`, `document.`/`window.`, `closest`/`parent*`), `scratch/HC/h7-focus-dom.txt` (`.focus()`, `setAttribute`, `style.setProperty`, Radix outside/auto-focus callbacks), `scratch/HC/h7-wide.txt`, `scratch/HC/motion-utils.txt`, and `scratch/HC/css-motion-literals.txt` (comment-stripped CSS scan). All 14 units are DONE. Each unit ID below was checked against `docs/audit/_work/units/U*.md`.

Sections are appended in this order: 1 Verdict table, 2 Pattern tallies (a)–(j), 3 Findings.

## 1. Verdict table

Scope: every hit in `h6-rules567.txt` and `h7-radix.txt`, plus every timer, rAF, `transitionend`/`animationend` (including React `onAnimationEnd`/`onTransitionEnd`), DOM listener, observer, style read/write and imperative focus call in non-story `src/`. The "cover" column names the unit finding that already files a violation. `—` means compliant with nothing to file. `(table)` means a unit recorded the verdict in a non-finding table.

**Zero-hit checks (non-story `src/`).** Rule 5 (R5.5/R5.6/R9.9): `rg "matchMedia|classList|localStorage|sessionStorage|MutationObserver|documentElement" src --glob '!*.stories.tsx'` → **0**. Rule 7.2: `rg "(document|window)\.(add|remove)EventListener" src` → **0**. R7.1: the only `closest(` is inside a comment (SidebarWithHoverIcon.tsx:21), and there are no `parentElement`/`parentNode`/`offsetParent` hits. R2.12: `rg forceMount src` → **0**. R6.2: no `matchMedia("(prefers-reduced-motion…)")` anywhere. R5.8: the only env read is `process.env.NODE_ENV` (Calendar.tsx:62, 96, 114). That is React's dev-warning gate, not an asset system; U7-F1 cites it as context.

### 1a. Rules 5/6/7 — `h6-rules567.txt` rows (35) + widened hits

| path:line | api | verdict | cover |
|---|---|---|---|
| src/styles/tokens.css:241 | animationend | comment-only (documents roll-change retire mechanism) | — |
| src/styles/tokens.css:243 | setTimeout | comment-only (history of the removed JS mirror) | — |
| src/styles/index.css:535 | requestAnimationFrame | comment-only (history: double-rAF reveal deleted) | — |
| src/styles/index.css:606 | animationend | comment-only | — |
| src/styles/index.css:687 | animationend | comment-only | — |
| src/styles/index.css:706 | animationend | comment-only | — |
| src/styles/index.css:738 | animationend | comment-only | — |
| src/styles/index.css:910 | transitionend | comment-only | — |
| src/components/AnimatedText/useChangeSwap.ts:17 | requestAnimationFrame/timer | comment-only (header constraint) | — |
| src/components/AnimatedText/useChangeSwap.ts:18 | transitionend/animationend | comment-only (header constraint) | — |
| src/components/AnimatedText/useChangeSwap.ts:19 | setTimeout | comment-only (history) | — |
| src/components/AnimatedText/useChangeSwap.ts:34 | animationend | comment-only | — |
| src/components/AnimatedText/useChangeSwap.ts:66,73,153,158 | `onAnimationEnd` (React prop, own node) | compliant: R6.3 mount/exit animation + R6.7. The node that animated retires itself by its own `animationend`, with a descendant guard at :131/:140. Header constraint useChangeSwap.ts:17-21, :35-37 | — (U3 claims TRUE) |
| src/components/AnimatedText/RollChangeText.tsx:77,90 | `onAnimationEnd` (spread from hook) | compliant, as above | — |
| src/components/AnimatedText/FadeChangeText.tsx:81,92 | `onAnimationEnd` (spread from hook) | compliant, as above | — |
| src/components/AnimatedText/RollingDigitsText.tsx:34 | timer/rAF/transitionend | comment-only. The hard rule sits under `## updating`, not `## constraints` (see U3-F3) | U3-F3 (format) |
| src/components/AnimatedText/RollingDigitsText.tsx:36 | animationend | comment-only | — |
| src/components/AnimatedText/RollingDigitsText.tsx:129 | transitionend | comment-only. The comment is wrong: an `onAnimationEnd` handler never receives `transitionend` | U3-F13 |
| src/components/AnimatedText/RollingDigitsText.tsx:132 | `onAnimationEnd` on own wheel | compliant: R6.3 (exit is one `animationend`), with target guard. Header :34-36 | — |
| src/components/AnimatedText/RevealChangeText.tsx:27 | transitionend | comment-only (header constraint) | — |
| src/components/AnimatedText/RevealChangeText.tsx:153 | transitionend | comment-only | — |
| src/components/AnimatedText/RevealChangeText.tsx:170 | transitionend | comment-only | — |
| src/components/AnimatedText/RevealChangeText.tsx:129,208,240 | `onTransitionEnd` on own root | compliant. A plain `width` transition does the motion (R6.3). `transitionend` only sequences the content swap, is guarded to own target and `propertyName === "width"` (:209-210), and the consumer handler is chained first. Header :23-28 sanctions it (reduced motion = 1ms so the event still fires) | — (U3 claims TRUE) |
| src/components/AnimatedText/RevealChangeText.tsx:193 | ResizeObserver | comment-only | — |
| src/components/AnimatedText/RevealChangeText.tsx:199 | getBoundingClientRect (own content span) | compliant: geometry, own subtree (R6 "component may own geometry"; R7) | — |
| src/components/AnimatedText/RevealChangeText.tsx:201-202 | ResizeObserver on own `contentRef` | compliant: R7 ("may attach listeners to elements it renders"). Measures width, not timing | — |
| src/components/CopyButton/CopyButton.tsx:42,45,58 | `useRef<setTimeout>` / clearTimeout | compliant (cleanup on unmount/re-click) | — |
| src/components/CopyButton/CopyButton.tsx:59 | setTimeout(`REVERT_MS`) | timer: compliant under R6.7, since no CSS mechanism can flip `aria-label` or the live-region text. Value: violation R6.5/R9.14 (`const REVERT_MS = 2000` at :16 is the named anti-pattern shape; it is a hold time, not an easing) | U4-F5 |
| src/components/LoadingSpinner/LoadingSpinner.tsx:100 | requestAnimationFrame | comment-only | — |
| src/components/LoadingSpinner/LoadingSpinner.tsx:129 | performance.now | violation R6.5: clock for a JS-timed loop | U9-F2 |
| src/components/LoadingSpinner/LoadingSpinner.tsx:137-148 | JS duration (`SPINNER_ANIM_DURATION`) + cosine easing | violation R6.5/R6.4. The component owns duration and easing, and there is no reduced-motion path (R6.2). li:138/238 prescribes this — rulebook conflict | U9-F2, U9-F3 |
| src/components/LoadingSpinner/LoadingSpinner.tsx:176,179 | requestAnimationFrame | violation R6.4 (loop never self-terminates; not sampling a CSS-transitioned value) | U9-F2 |
| src/components/LoadingSpinner/LoadingSpinner.tsx:180 | cancelAnimationFrame | compliant R12.5 | — |
| src/components/LoadingSpinner/LoadingSpinner.tsx:152-172 | setAttribute `d` | geometry write, compliant on its own (li:138). Driven by the violating loop above | U9-F2 |
| src/components/LoadingSpinner/LoadingSpinner.tsx:260 | inline `animation: ds-spinner-rotate ${spokesDuration}ms linear infinite` | violation R6.5/R6.1/R6.2. JS-computed duration plus literal `linear` sit in inline style, so no `@media (prefers-reduced-motion)` rule can reach it | U9-F2 |
| src/components/LoadingSpinner/spinnerGeometry.ts:52,71,131 | `SPINNER_ANIM_DURATION = 1800`, `SPINNER_SPOKES_DURATION = 1280` | violation R6.5/R9.14 (`const *_DURATION` in component code) | U9-F2 |
| src/components/MorphRotationShape/MorphRotationShape.tsx:275 | getComputedStyle (own span) | compliant: R6.4 step 4. Header :52 | — |
| src/components/MorphRotationShape/MorphRotationShape.tsx:295,297 | requestAnimationFrame | compliant: R6.4. Self-terminating at :282-292 and samples the registered `--ds-shape-morph-step`/`-lean`. Header :33-37, :41-44 | — (U10 claim TRUE) |
| src/components/MorphRotationShape/MorphRotationShape.tsx:314 | style.setProperty (own span) | compliant: advances the CSS-clock target on own element (header :6-8) | — |
| src/components/MorphRotationShape/MorphRotationShape.tsx:317-327 | addEventListener `transitionrun`/`animationstart`/`animationiteration` on own span | compliant: R7 (own element). Header constraint :41-44 ("Never listen on an ancestor") | — |
| src/components/MorphRotationShape/MorphRotationShape.tsx:328 | cancelAnimationFrame | compliant (cleanup) | — |
| src/components/MorphRotationShape/MorphRotationShape.tsx:251-252 | setAttribute `d`/`transform` | compliant (header :38-40: React never re-commits them) | — |
| src/components/SidebarWithHoverIcon/SidebarWithHoverIcon.tsx:21 | closest( | comment-only (header constraint recording the removed R7.1 violation) | — |
| src/components/SidebarWithHoverIcon/SidebarWithHoverIcon.tsx:110 | getComputedStyle (own path) | compliant: R6.4 step 4. Header :31-32. The "pair" wording is off; the code makes one call | U10-F13 (wording) |
| src/components/SidebarWithHoverIcon/SidebarWithHoverIcon.tsx:115 | setAttribute `d` | compliant (header :27-30) | — |
| src/components/SidebarWithHoverIcon/SidebarWithHoverIcon.tsx:120 | requestAnimationFrame | compliant: R6.4. Self-terminating at :116-118. Header :24-26, :35-38 | — (U10 claim TRUE) |
| src/components/SidebarWithHoverIcon/SidebarWithHoverIcon.tsx:123,127 | cancelAnimationFrame | compliant | — |
| src/components/Toast/Toast.tsx:229 | setTimeout(…, 200) | violation R6.6 + R6.7. The 200 ms JS delay mirrors the CSS exit `data-[state=closed]:duration-150` (Toast.tsx:63) to stage unmount after the animation. Only the `dismiss()` path uses it | U8-F2 |
| src/components/Toast/Toast.tsx:54 | Date.now() | compliant (toast id, not motion) | — |
| src/components/Calendar/Calendar.tsx:35 | "window" | comment-only | — |
| src/components/Menu/DropdownMenu.tsx:136 | document.hasFocus() | compliant: R7.2's "genuine global concern (an open overlay's dismissal)". Read-only, inside Radix's public `onFocusOutside`; not theme (R5.5 n/a) | — (U5 table) |
| src/components/Menu/DropdownMenu.tsx:144 | document.contains(target) | compliant, as above (`onInteractOutside`) | — (U5 table) |
| src/components/OutlineButton/OutlineButton.tsx:108-119,129-130 | getBoundingClientRect + style.setProperty `--gx/--gy/--bw/--bh` on own inner element | compliant: R7 (own subtree). The cursor position is geometry, not timing (R6) | — (U4 fingerprint note) |
| src/components/AIChat/AIPromptInput.tsx:192-196 | el.style.height (own textarea auto-size) | compliant: geometry, own subtree. The CSS max-height is the cap (header :19) | — |

### 1b. Rule 2/3 event and portal hits — `h7-radix.txt` rows (39) + widened focus/prevent hits

| path:line | api | verdict | cover |
|---|---|---|---|
| src/components/Menu/index.ts:4 | DropdownMenuPortal (re-export) | compliant (pass-through part) | — |
| src/components/Menu/DropdownMenuSearch.tsx:47 | stopPropagation | compliant by R2.10's letter: it sits on the DS's own `<input>` keydown, not on a Radix handler. Header :7-8 documents the intent (block Radix typeahead). The side effect (unreachable by keyboard) is filed separately | U5-F7 (side effect); U5 table |
| src/components/Menu/DropdownMenu.tsx:89 | `DropdownMenuPortal = …Portal` | compliant | — |
| src/components/Menu/DropdownMenu.tsx:104 | `portalProps` | compliant: R2.9 | — |
| src/components/Menu/DropdownMenu.tsx:126 | preventDefault in `onOpenAutoFocus` | compliant: R2.10 scope. Radix's public preventable callback; `focusOnOpen={false}` is sanctioned by arch:163 | — (U5 table) |
| src/components/Menu/DropdownMenu.tsx:137 | preventDefault in `onFocusOutside` | compliant: public dismissal-prevention callback; consumer handler runs first | — (U5 table; skills gap U5-F10) |
| src/components/Menu/DropdownMenu.tsx:145 | preventDefault in `onInteractOutside` | compliant, as above | — (U5 table) |
| src/components/Menu/DropdownMenu.tsx:182,184 | `…Primitive.Portal {...portalProps}` (conditional on `portal`) | compliant: R2.9 | — |
| src/components/Menu/DropdownMenu.tsx:287 | preventDefault | comment-only | — |
| src/components/Menu/DropdownMenu.tsx:304-305 | defaultPrevented / preventDefault in MultiSelectItem `onSelect` | compliant: R2.5 (sanctioned keep-open API; consumer first; respects prior prevent) | — (U5 table) |
| src/components/Menu/DropdownMenu.tsx:410 | export DropdownMenuPortal | compliant | — |
| src/components/VerificationCode/VerificationCodeInput.tsx:99,112,117,123 | preventDefault (Backspace/Arrow keydown, paste) on native `<input>` | compliant: no Radix primitive, so outside R2.10's scope; own subtree | — (U6-F11 covers the cell-shift behaviour, not the calls) |
| src/components/VerificationCode/VerificationCodeInput.tsx:82-83 | `.focus()` / `.select()` on own cells | compliant: roving focus among own inputs, no Radix focus manager replaced (R2.11 n/a) | — |
| src/components/Input/Input.tsx:145-146 | preventDefault + `.focus()` on own wrapper pointerdown | compliant: native, own subtree | — |
| src/components/Tooltip/Tooltip.tsx:37 | `portalProps` | compliant: R2.9 | — |
| src/components/Tooltip/Tooltip.tsx:84,86 | `TooltipPrimitive.Portal {...portalProps}` | compliant: R2.9 | — |
| src/components/Popover/Popover.tsx:14 | `PopoverPortal` alias | compliant | — |
| src/components/Popover/Popover.tsx:22 | `portalProps` | compliant: R2.9 | — |
| src/components/Popover/Popover.tsx:61 | conditional Portal | compliant: R2.9 | — |
| src/components/Popover/Popover.tsx:74 | export | compliant | — |
| src/components/Popover/index.ts:6 | export PopoverPortal | compliant | — |
| src/components/Sheet/Sheet.tsx:13 | "Portal" | comment-only | — |
| src/components/Sheet/Sheet.tsx:17 | `SheetPortal` alias | compliant | — |
| src/components/Sheet/Sheet.tsx:138,147 | unconditional `<SheetPortal>` in SheetContent | violation R2.9 (no `portal`/`portalProps` escape hatch) | U8-F4 |
| src/components/Sheet/Sheet.tsx:184 | export | compliant | — |
| src/components/Slider/Slider.tsx:214 | `event.defaultPrevented` guard | part of the handler below | U6-F6 |
| src/components/Slider/Slider.tsx:250 | preventDefault in the handler composed into Radix Root `onKeyDown` | violation R2.10/R9.6. It suppresses Radix's own keyboard handling and re-implements it, dropping PageUp/PageDown ×10 | U6-F6 |
| src/components/AIChat/AIPromptInput.tsx:142 | preventDefault on native `<form>` submit | compliant (no Radix) | — |
| src/components/AIChat/AIPromptInput.tsx:150 | `.focus()` own textarea on own padding click | compliant: own subtree (U11 Rule 7 note) | — |
| src/components/AIChat/AIPromptInput.tsx:214,220 | defaultPrevented guard + preventDefault Enter on native `<textarea>` | compliant; consumer can pre-empt | — |
| src/components/Calendar/Calendar.tsx:312 | preventDefault arrow keys on native day `<button>` | compliant: no Radix; roving focus in own grid | — |
| src/components/Calendar/Calendar.tsx:233 | `.focus()` restore to own day button | compliant: own subtree; no Radix focus manager replaced (the grid is not Radix) | — |
| src/components/DropdownTrigger/DropdownTrigger.tsx:219,228 | `.focus()` own input before Radix handler | compliant: R2.8 (sanctioned pre-focus) | — (U5 table) |
| src/components/DropdownTrigger/DropdownTrigger.tsx:210-243 | conditionally skips Radix's Slot-merged `onPointerDown`/`onKeyDown` | compliant: R2.8 | — (U5 table) |
| src/components/Modal/Modal.tsx:11 | "Portal" | comment-only | — |
| src/components/Modal/Modal.tsx:15 | `ModalPortal` alias | compliant | — |
| src/components/Modal/Modal.tsx:64,84 | unconditional `<ModalPortal>` in ModalContent | violation R2.9 | U8-F4 |
| src/components/Modal/Modal.tsx:117 | export | compliant | — |
| src/components/Toast/Toast.tsx:103-115, 312 | `ToastPrimitive.Viewport`, never portalled | violation R2.9 (third portal behaviour) | U8-F4 |
| src/components/Menu/DropdownMenu.tsx:91, 416 | `DropdownMenuSub = …Primitive.Sub` exported with no `SubTrigger`/`SubContent` wrapper | Radix part shipped without its required siblings. Not graded by R2.9 (there is no sub-content to portal) | **NEW → HC-F7** |

**Rule 5/6/7 verdict summary.** There are 0 Rule 5 or Rule 7 violations in shipped code. Rule 6 JS-side violations come down to two components: LoadingSpinner (U9-F2/F3), plus the two JS mirrors, Toast.tsx:229 (U8-F2) and CopyButton `REVERT_MS` (U4-F5). The only R6.4 escape-hatch users (MorphRotationShape, SidebarWithHoverIcon) are compliant. Radix: 2 R2.9 violators (Modal, Sheet) plus the non-portalled Toast viewport (U8-F4), and 1 R2.10 violator (Slider, U6-F6). Every other `preventDefault` is either a Radix-documented preventable callback or sits on a native element.

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
- **No family (30 components):** Button, OutlineButton, SplitButton (Action/Trigger), CopyButton, ShapeButton, Checkbox, Toggle options, Tabs triggers, Input, CodeDigitInput, Slider, DropdownTrigger, TypeableDropdownTrigger, TextDropdownTrigger, DropdownMenuContent, DropdownMenu items, CalendarPresetItem, SearchBox, HotkeyIndicator, TextLink, TableRow, ModalOverlay/ModalContent, SheetOverlay/SheetContent, TooltipContent, ToastRoot, PopoverContent, ProgressIndicator, LinearProgressIndicator, LoadingSpinner, ShimmerText.

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

### (c) Arbitrary Tailwind values with numeric literals (R8.11 / R9.2 / R8.1), grouped by what they bypass

Method: `rg -o --pcre2 "(?<![\w-])!?-?[a-z][a-z0-9-]*-\[(?!var\()[^\]\s]*\d(?:px|rem|em|%)?[^\]\s]*\]"` over non-story TS/TSX, excluding `data-[…]`/`group-[…]` variants and `[grid-area:…]` (raw list: `scratch/HC/arbitrary-literals.txt`). Result: **45 literal-bearing arbitrary values in 13 files**. 8 are Sheet `slide-*-[20%]` motion distances (counted under (a), U8-F3). Of the remaining 37, 12 are OutlineButton orb geometry in % (decorative, relative to the button). That leaves **25 design-value literals**. Hex in `src/**/*.ts*`: 0 (`greps/h3-hex.txt` hits are comments/stories).

| bypassed token (value) | location | class | cover |
|---|---|---|---|
| `--ui-radius-soft` 20 + `--ui-spacing-xs` 8 (concentric outer radius; no token) | OutlineSection/OutlineSection.tsx:22; OutlineButton/OutlineButton.tsx:147 | `rounded-[28px]` ×2 | U12-F7, U4-F7 |
| `--ui-height-button` 38 (+ 2×`--ui-spacing-xs`) — no token for 54 | OutlineButton/OutlineButton.tsx:159 | `h-[54px]` | U4-F7 |
| `--ui-min-w-menu` 160 | OutlineButton/OutlineButton.tsx:159 | `min-w-[160px]` | U4-F7 |
| `--ui-size-code-digit` / `--ui-size-cta-chip-standard` 46 | ShapeButton/ShapeButton.tsx:125 | `size-[46px]` | U4-F7 |
| `--ui-icon-rg` 14 | SplitButton/SplitButton.tsx:33 | `size-[14px]` | U4-F7 |
| `--ui-height-button` 38 / (22 = no avatar token) | Avatar/Avatar.tsx:23, 24 | `size-[38px]`, `size-[22px]` | U12-F7 |
| `--ui-text-subheading` 18 (and BaseText `fontSize={18}` beside it) | VerificationCode/CodeDigitInput.tsx:85 | `text-[18px]` | U6-F3 |
| `--ui-width-slider-handle` 6 | Slider/Slider.tsx:398 | `size-[6px]` | U6-F3 |
| no token (30 px menu row / text trigger) | Menu/DropdownMenu.tsx:339; DropdownTrigger/DropdownTrigger.tsx:325 | `h-[30px]` ×2 | U5-F4 |
| no token (23 px single-key kbd) | HotkeyIndicator/HotkeyIndicator.tsx:21 | `min-w-[23px] min-h-[23px]` | U5-F4 |
| no spacing token for 14 (sm 10 / rg 12 / md 16) | Toast/Toast.tsx:76 | `pl-[14px] pt-[14px]` | U8-F6 |
| `--ui-spacing-xxs` 4 (as height; no track-height token) + 4/2 px calc insets | LinearProgressIndicator/LinearProgressIndicator.tsx:55, 61, 69 | `h-[4px]`, `w-[max(4px,calc(…-2px))]`, `left-[max(4px,…+2px)]` | U9-F15 |
| component opacity (duplicates the inline-style literals) | OutlineButton/OutlineButton.tsx:244, 265 | `opacity-[0.38]`, `opacity-[0.22]` | U4-F6 |
| decorative orb geometry (% of button, px bleed) | OutlineButton/OutlineButton.tsx:185, 199, 243, 264 | `bottom-[-18px] left-[4%] w-[62%] h-[72%]`, `bottom-[-14px] right-[6%] w-[48%] h-[64%]`, … (12) | U4-F6 (context) — relative geometry, not graded |

Every row is covered by a unit, filed piecemeal across U4, U5, U6, U8, U9 and U12. → merged with (d) into **HC-F2**.

### (d) Tailwind default-scale spacing/size utilities (`--spacing: 0.25rem`, dist-styles.css:15) where a DS token exists

Method: `rg -o --pcre2` for `(p|px|py|pt|pb|pl|pr|m*|gap*|inset*|top|left|right|bottom|w|h|size|min-*|max-*|translate-*)-<number>` in non-story TS/TSX (raw: `scratch/HC/numeric-scale.txt`, 102 hits). After dropping the 65 zero-valued utilities (`inset-0`, `min-w-0`, `p-0`, …), **37 non-zero utilities remain in 14 files**. 32 of them have a DS token of the identical value.

| location | utilities | px → DS token of same value | cover |
|---|---|---|---|
| Button/Button.tsx:39, 85, 86 | `gap-2`, `px-3` ×2 | 8 → `gap-xs`; 12 → `px-rg` | U4-F7 |
| OutlineButton/OutlineButton.tsx:158, 159, 286 | `gap-2`, `px-3`, `gap-2` | 8 / 12 → xs / rg | U4-F7 |
| SplitButton/SplitButton.tsx:19 | `pl-4 pr-4` | 16 → md | U4-F7 |
| SearchBox/SearchBox.tsx:27 | `gap-2` | 8 → xs | U5-F4 |
| HotkeyIndicator/HotkeyIndicator.tsx:11 | `gap-1` | 4 → xxs | U5-F4 |
| DropdownTrigger/DropdownTrigger.tsx:59, 194 | `min-w-40` | 160 → `--ui-min-w-menu` | U5-F4 |
| Menu/DropdownMenuSearch.tsx:77 | `h-6 min-h-6` | 24 → no token | U5-F4 |
| Tooltip/Tooltip.tsx:70 | `px-3` | 12 → rg | U8-F6 |
| Toast/Toast.tsx:70, 72, 74, 76 | `py-2 pl-4 pr-2` ×3, `pb-3 pr-3` | 8/16/12 → xs/md/rg | U8-F6 |
| Table/Table.tsx:82, 134, 151 | `gap-1`, `px-4 py-3`, `py-8` | 4/16/12 → xxs/md/rg; 32 → no token | U12-F12 |
| Tabs/Tabs.tsx:21 | `gap-1` (siblings Toggle.tsx:99 / SegmentedTabSelect.tsx:64 use `gap-xxs`) | 4 → xxs | U6-F26 |
| AIChat/ChatDivider.tsx:28 | `h-3` | 12 → WavyDivider band restated | U11-F13 |
| Checkbox/Checkbox.tsx:81, 90, 106 | `size-2.5` | 10 → `--ui-spacing-sm` (glyph box; no 10 px icon token) | **unfiled** (S4-level; folded into HC-F2) |
| Sheet/Sheet.tsx:81, 85 | `max-w-96` | 384 → no token; caps consumer widths | U8-F15 (context) |

Cost repeated across units: one visual value is spelled two ways (e.g. 4 px = `gap-1` in Tabs vs `gap-xxs` in Toggle/SegmentedTabSelect). Table's header/body alignment works only because a token and a numeric step happen to coincide (U12-F12). → **HC-F2**.

### (e) Focus indication not via `ds-focus-*` (R8.14)

Method: `rg -o "(shadow-focus…|focus-visible:ring…|ring-…|outline-none|focus-visible:outline…|ds-focus-…|ds-shape-button-focus…)"` (raw: `scratch/HC/focus.txt`, 42 hits). The dominant pattern is correct: `ds-focus-visible-ring` ×13 (Button, CTAButton, CalendarGrid, CalendarPresetsPanel, Checkbox, DropdownTrigger ×2, OutlineButton, Slider thumb, SplitButton ×2, TextLink, toggleOption), `ds-focus-within-ring` ×5, `ds-focus-ring-on-focus` ×1, `ds-focus-ring-on-open` ×2, and the `-danger` variants ×2.

| location | deviation | verdict | cover |
|---|---|---|---|
| Checkbox/Checkbox.tsx:55, 60 | `active:shadow-focus-prominent` / `-primary` press ring | violation R8.14 | U6-F4 |
| VerificationCode/CodeDigitInput.tsx:56 | `focus-within:shadow-focus-prominent` | violation R8.14 | U6-F4 |
| ShapeButton/ShapeButton.tsx:126 | `outline-none ds-shape-button-focus-visible` (private 2px+2px helper, dooph-component-tokens.css:35-38) | violation R8.14 (competing helper) | U4-F11 |
| Tabs/Tabs.tsx:56 | `focus-visible:outline-none` on TabsContent, which Radix puts in tab order (tabIndex 0), with no replacement | violation R8.14 | U6-F22 |
| Modal/Modal.tsx:74; Sheet/Sheet.tsx:72 | `focus-visible:outline-none` on Dialog Content | compliant: a fallback focus target with tabIndex −1, not in tab order; not a ring | — |
| Toast/Toast.tsx:109 | `outline-none` on ToastViewport (F8 hotkey target, tabIndex −1) | compliant, as above | — |
| Tooltip/Tooltip.tsx:61 | `outline-none` on TooltipContent (never focused) | compliant | — |
| AIPromptInput.tsx:225; DropdownTrigger.tsx:270; Input.tsx:137; SearchBox.tsx:69; CodeDigitInput.tsx:85 | `outline-none` on an inner `<input>`/`<textarea>` whose wrapper carries `ds-focus-within-ring` (AIPromptInput.tsx:155, DropdownTrigger.tsx:202, Input.tsx:158, SearchBox.tsx:34) or the shadow ring (CodeDigitInput:56) | compliant (ring moved to the wrapper) | — |
| Menu/DropdownMenu.tsx:197 | `outline-none` on menu items; focus = `data-highlighted:bg-ghost-hover` | compliant (Radix highlight is the focus indicator) | — |
| Menu/DropdownMenuSearch.tsx:69 | `outline-none` on the input; the row wrapper has no `ds-focus-within-ring` | no ring at all. Moot while the row is keyboard-unreachable | U5-F7 (context) |
| DatePickerTrigger.tsx:66; DropdownTrigger.tsx:204 | `data-[state=open]:ds-focus-ring` | comment-only (explains why the variant form emits nothing) | — |

Three unit findings, three spellings of the same R8.14 deviation (shadow ring, private outline helper, outline removal). → **HC-F3**.

### (f) Disabled not via `ds-disabled-state` / `ds-radix-data-disabled` (R8.16)

Helpers defined in dooph-component-tokens.css: `.ds-disabled-state:is(:disabled,[aria-disabled="true"])` :13, `.ds-radix-data-disabled[data-disabled]` :22, `.ds-disabled-control:disabled` :30 (not in R8.16's list), and `.ds-opacity-disabled` :324 (unconditional opacity) (raw: `scratch/HC/disabled.txt`).

| mechanism | locations | verdict | cover |
|---|---|---|---|
| `ds-disabled-state` on native/aria element | Button.tsx:43; SplitButton.tsx:28, 59; OutlineButton.tsx:164; ShapeButton.tsx:127; DropdownTrigger.tsx:67, 272, 323; Input.tsx:126, 139; CalendarGrid.tsx:242; Slider.tsx:348 (thumb) | compliant | — |
| `ds-radix-data-disabled` on Radix part | DropdownMenu.tsx:197 (items + CalendarPresetItem via `menuItemClassName`), 292; Checkbox.tsx:46; Slider.tsx:351 | compliant, **except** CalendarPresetItem: a native `<button>` gets only the `data-disabled` helper, so `disabled` renders as enabled | U7-F14 |
| `ds-disabled-state` on a `<div>` (can never match `:disabled`) | CodeDigitInput.tsx:53 | violation R8.16 (inert helper; the header claims otherwise) | U6-F2 |
| `ds-disabled-control` (third helper, subset of `ds-disabled-state`) | toggleOption.ts:32 (Toggle/Tabs options); AIPromptInput.tsx:227 | competing helper, not in R8.16's list | U6-F13 |
| JS ternary `disabled ? "cursor-not-allowed bg-…-disabled border-…" : […]` + `disabled && "ds-opacity-disabled"` | Input.tsx:163-181 (wrapper + icon); DropdownTrigger.tsx:197-207, 250 (Typeable wrapper + SearchIcon) | violation R8.16 (+ R2.2 spirit: both roots also emit `data-disabled`) | U6-F12, U5-F2 |
| hover/disabled guard spelled three ways (`[&:not(:disabled):not([aria-disabled=true])]:hover:`, `enabled:hover:`, ungated) | Button / SplitButton / OutlineButton family | inconsistency | U4-F10 |
| `data-disabled:opacity-100!` counter-override on the inert Checkbox | DropdownMenu.tsx:290, 324 | compliant (documented at :289-296) | — |
| comment-only mentions | Button.tsx:9; CodeDigitInput.tsx:9; toggleOption.ts:16; Slider.tsx:345 | comment-only | — |

Six unit findings (U4-F10, U5-F2, U6-F2, U6-F12, U6-F13, U7-F14) file one pattern: there are four disabled mechanisms and three helpers, and R8.16 names two. → **HC-F4**.

### (g) State styling via JS class ternaries instead of data attributes (R2.2 / R8.9)

Scope note: R2.2 and R8.9 bind Radix-set attributes (`data-state`, `data-disabled`, `data-highlighted`). None of the ternaries below toggles a Radix-owned state. Every Radix part styles against its data attributes (Checkbox.tsx:38-60, DropdownMenu.tsx:197/258-263, TypeableDropdownTrigger `data-[state=open]` :206). So the repo-wide question is a competing pattern. The package's own dominant idiom for non-Radix state is also a data attribute read by CSS: Slider `data-dragging`/`data-hidden`/`data-active` (:328, 363, 375, 396), CopyButton `data-copied` (:84), RevealChangeText `data-open` (:229), RollHoverText/UnderlineLinkText `data-active`, RollingDigitsText `data-entering`/`data-exiting`, CalendarGrid `data-today`/`data-outside`/`data-range`, AIPromptInput `data-state`/`data-disabled`, AIThinkingPart `data-state` → `.ds-chat-reveal-root[data-state="open"]` (dooph-component-tokens.css:426).

Method: single-line `rg` for `(state-name) (?|&&) "…(bg-|text-|border-|opacity|ds-…)"` plus a multiline pass (`scratch/HC/r22-ternaries.txt`, `scratch/HC/ternaries-ml.txt`), each hit read in place.

| location | ternary | also emits a data attr it does not style against? | cover |
|---|---|---|---|
| VerificationCode/CodeDigitInput.tsx:49-58, 68-69 | `hasError ? "border-danger-primary … text-danger-primary" : …`; `disabled && …`; `!filled && "opacity-0"`; `hasError && "text-danger-primary"` | yes: `data-filled` / `data-error` (:59-60) are read by nothing in src | U6-F12 (cites the dead attrs), U6-F2 |
| Input/Input.tsx:163-181 | `disabled ? "cursor-not-allowed bg-secondary-disabled …" : […]`; `disabled && "ds-opacity-disabled"` | yes: `data-disabled` (:155) | U6-F12 |
| DropdownTrigger/DropdownTrigger.tsx:197-207, 250 (Typeable) | `disabled ? "cursor-not-allowed …" : […]`; `disabled && "ds-opacity-disabled"` | yes: `data-disabled` (:248) | U5-F2 |
| Calendar/CalendarPresetsPanel.tsx:70 | `isActive && "bg-ghost-active"` | yes: `data-active` (:60) | U7-F12 |
| Toast/Toast.tsx:285-300 (ToastProvider template) | `item.variant === ToastTypes.prominent ? "text-prominent-fg" : "text-text[-secondary]"` on Title/Description | no attr on ToastRoot; the exported parts cannot reproduce it | U8-F8 |
| AIChat/AIToolPart.tsx:71-75, 84 | `state === AIToolPartState.error ? "text-danger-primary" : "text-ghost-fg"`; `!isActive && "ds-chat-reveal"` | yes: root `data-state` (:54) | **unfiled** |
| HotkeyIndicator/HotkeyIndicator.tsx:22-24 | `pressed ? "bg-ghost-active …" : "bg-surface-page …"` | no attr at all | **unfiled** |
| Slider/Slider.tsx:355 | `showSteps && interacted && !dragging && "ds-slider-glide"` | partial: `data-dragging` exists (:328); `interacted` has no attr | — (JS-only state `interacted`; acceptable) |
| not state (variant/prop mapping; out of scope) | CTAButton.tsx:75, 84, 95 (`isPrimary`); OutlineButton.tsx:165-167 (`inverseTheme`); Input.tsx:135, 160 (`isNumber`) | — | — |

Four unit findings (U5-F2, U6-F12, U7-F12, U8-F8) file this piecemeal, and two sites are unfiled. → **HC-F5**.

### (h) Portal escape hatch per overlay Content (R2.9)

| overlay content | portalled by default? | `portal` / `portalProps` | verdict | cover |
|---|---|---|---|---|
| DropdownMenuContent (DropdownMenu.tsx:94-188) | yes | yes (:103-104, 177-185) | compliant | — |
| PopoverContent (Popover.tsx:16-66) | yes | yes (:21-22, 58-63) | compliant | — |
| TooltipContent (Tooltip.tsx:30-90) | yes | yes (:36-37, 81-89) | compliant | — |
| AIModelTooltipContent (AIModelSelect.tsx:200-222) | via TooltipContent | yes (inherits through `...props`) | compliant | — |
| ModalContent (Modal.tsx:57-85) | always (`<ModalPortal>` :64) | **no** | violation | U8-F4 |
| SheetContent (Sheet.tsx:120-149) | always (`<SheetPortal>` :138) | **no** | violation | U8-F4 |
| ToastViewport (Toast.tsx:102-115, rendered by ToastProvider :312) | **never** | no | third behaviour | U8-F4 |
| DatePicker's internal PopoverContent (DatePicker.tsx:130) | yes | not reachable (DatePicker forwards nothing to it) | gap | U7-F8 |
| CalendarCaption's internal DropdownMenuContent ×2 (CalendarCaption.tsx:69, 96) | yes | not reachable (Calendar takes no content props) | gap (same shape as U7-F8) | U7-F8 (context) |
| DropdownMenuSub (DropdownMenu.tsx:91, 416) | — | there is no `DropdownMenuSubContent` at all | exported root with no content part | **NEW → HC-F7** |

Raw portal pass-throughs exported: `DropdownMenuPortal`, `PopoverPortal`, `ModalPortal`, `SheetPortal` (no `TooltipPortal`/`ToastPortal`). No consolidation needed: U8-F4 already groups the three overlay behaviours.

### (i) `asChild` coverage for interactive leaves vs R3.2

R3.2 (arch:221) names five leaves. contrib:42 generalises to "interactive/polymorphic leaf components".

| leaf | `asChild` accepted? | works? | why | cover |
|---|---|---|---|---|
| Button (Button.tsx:111-126) | yes | **yes** | Slot receives `props.children` untouched | — (no story: U4-F15) |
| DropdownTrigger (DropdownTrigger.tsx:26, 52-75) | yes | **throws** | Slot gets two children: `<span>{children}</span>` + `<DropdownCaret/>` (:73-74) | U5-F1 |
| TextDropdownTrigger (DropdownTrigger.tsx:287, 314-338) | yes | **throws** | `<span>{children}</span>` + `<ChevronDownIcon/>` (:332-337) | U5-F1 |
| OutlineButton (OutlineButton.tsx:19, 86) | yes | **throws** | orb spans + content span siblings (:180-289) | U4-F1 |
| ShapeButton (ShapeButton.tsx:46, 116) | yes | **throws** | shape span + content span (:131-152) | U4-F1 |
| DatePickerTrigger (wraps DropdownTrigger) | inherits via `...buttonProps` | would throw (same Comp) | — | U5-F1 (transitive) |
| TextLink (TextLink.tsx:6, 15-16) | yes | yes | single child | — |
| CTAButton (CTAButton.tsx:43, 114-117) | yes | yes (own `cloneElement` path with a guard) | — | U4-F18 (children dropped otherwise) |
| CopyButton (CopyButton.tsx:21) | `Omit<…, "asChild">` | n/a | deliberately always a button; defensible | — |
| SplitButtonAction / SplitButtonTrigger (SplitButton.tsx:15, 48) | no (raw `<button>`) | — | cannot host a menu trigger or link | U4-F16 (context) |
| AIModelSelectTrigger (AIModelSelect.tsx:44-66) | not typed (`ComponentPropsWithoutRef<"button">`), but `...props` reaches Button | untyped | intended as `DropdownMenuTrigger asChild` child | — |
| AIPromptInputSubmit (AIPromptInput.tsx:295-332) | no; drops all unnamed props | — | a `TooltipTrigger asChild` wrapper loses its handlers | U11-F4 |
| CalendarPresetItem (CalendarPresetsPanel.tsx:57) | no (native `<button>`) | — | internal rail item | — |
| Radix-wrapped parts (Checkbox, Tabs/Toggle items, menu items, *Trigger pass-throughs) | yes (Radix `asChild` via `...props`) | yes | — | — |

Four of R3.2's five named leaves crash on the prop R3.2 promises. It is one root cause (decoration rendered as a sibling of `children` inside `Comp`), filed twice. → **HC-F6** (consolidation of U4-F1 + U5-F1).

### (j) Wrappers around `children` (R3.3 / R3.4 / R9.11)

Method: `rg -B3 "\{children\}"` over non-story TSX; every hit read in place. Display shells whose root IS the wrapper (Avatar, OutlineSection, Modal/Sheet Content, Table cells, Toggle/Tabs roots, Calendar, the AnimatedText animation spans, AIChat prose regions, SplitButton composite) are not intermediate wrappers and are omitted.

| component | wrapper | layout reason in code | sanctioned by arch:232-235? | cover |
|---|---|---|---|---|
| OutlineButton (OutlineButton.tsx:286) | `<span class="relative z-10 inline-flex items-center gap-2">` | layers above blur orbs | **yes** (named) | — (RC-2: U14-F11) |
| DropdownMenuRadioSelectItem (DropdownMenu.tsx:268) | `<span class="flex flex-1 items-center gap-sm">` | pushes trailing check right | **yes** (named) | — |
| ShapeButton (ShapeButton.tsx:150) | `<span class="relative z-10 inline-flex …">` | layers above the absolutely-positioned shape (:131-146); own header ShapeButton.tsx:9-10 ("The icon slot carries the CONTENT color separately") | no (same reason as OutlineButton, unlisted in arch; documented in own header) | — |
| DropdownMenuMultiSelectItem (DropdownMenu.tsx:326) | `<span class="flex flex-1 items-center gap-sm">` | fills beside the leading checkbox | no (same reason as RadioSelectItem, unlisted) | — |
| DropdownTrigger (DropdownTrigger.tsx:73) | `<span class="flex-1 text-left">` | pushes the caret to the far edge | no | — (its sibling is the U5-F1 crash) |
| TextDropdownTrigger (DropdownTrigger.tsx:332) | `<span>` (no class) | **none** | no | — (U5-F1 crash context) |
| Sticker (Sticker.tsx:131) | `<div class="flex flex-row items-center gap-xs">` | U12-F10: none (root is already `inline-flex items-center`); own header Sticker.tsx:10-12 claims it as layout | no (documented in own header only) | U12-F10 |
| AIModelSelectTrigger (AIModelSelect.tsx:64) | `<span class="whitespace-nowrap text-text">` | typography + nowrap | no | — |
| AIModelSelectItem (AIModelSelect.tsx:100) | `<span class="min-w-0 flex-1 truncate">` | truncation beside swatch | no | — |
| TableHeaderCell sortable (Table.tsx:85) | `<ButtonText>{children}</ButtonText>` inside Button | typography applied on one branch only | no | U12-F16 |

arch:232-235 sanctions 2 wrappers. The code has 10: 7 have a real layout or typography reason but are undocumented, 1 (TextDropdownTrigger) has none, and 1 is filed (Sticker, U12-F10). → **HC-F8**.

## 3. Findings

Only patterns that no unit filed whole: consolidations of piecemeal unit findings (they name the subsumed IDs in `related:`), plus two NEW items (HC-F7, and the unfiled sites inside HC-F5/HC-F8). Location lists are in the §2 tallies and are not repeated beyond the representative lines.

### HC-F1: Motion timing is hardcoded in 30 of 41 animated components through four mechanisms (RollHoverText lacks only its ease); only 10 carry the `--ui-<component>-*` duration + ease family R6.1 requires
- severity: S2
- category: rule-violation
- rules: [R6.1, R6.2, R6.5, R6.6, R9.14]
- scope: consumer-visible
- confidence: plausible
- verified_by: "node docs/audit/_work/scratch/HC/motion-tally.cjs (comment lines skipped) → 47 duration-N utilities, 15 of them motion-reduce:duration-0 → 32 hardcoded in 17 files; 7 ease-* utilities; 2 arbitrary [animation-timing-function]; 7 inline transition/animation strings; comment-stripped CSS scan (scratch/HC/css-motion-literals.txt) → 11 literal timings in 6 ds-* helpers; rg of tokens.css for --ui-*-(duration|ease) → 10 families (chat ×3, roll-hover (no ease), roll-change, fade-change, shape-morph, rolling-digits, sidebar-icon, underline-link, reveal-change)."
- locations:
  - §2(a) a.1 — 17 hover/state transition sites in 14 files (Button.tsx:41 … Table.tsx:114)
  - §2(a) a.2 — 5 overlays: DropdownMenu.tsx:168-169, Modal.tsx:29-30,75-76, Sheet.tsx:37-38,73-74,82-94, Tooltip.tsx:62-64, Toast.tsx:60,62-63, Popover.tsx:50-52
  - §2(a) a.3 — inline: OutlineButton.tsx:192,206,257-258,278-279; ProgressIndicator.tsx:123-124,151,165; LoadingSpinner.tsx:260
  - §2(a) a.4 — JS: spinnerGeometry.ts:52,71; LoadingSpinner.tsx:137-148; Toast.tsx:229-231; CopyButton.tsx:16,59
  - §2(a) a.5 — CSS: index.css:380, 422-424; dooph-component-tokens.css:43-44, 129, 132, 169-170, 373-374
- evidence: |
    Button/Button.tsx:41                 "transition-all duration-150 ease-out cursor-pointer select-none",
    Menu/DropdownMenu.tsx:197            "... outline-none transition-colors duration-100 hover:bg-ghost-hover ..."
    Sheet/Sheet.tsx:73                   "... data-[state=open]:duration-300 data-[state=open]:[animation-timing-function:cubic-bezier(0.32,0.72,0,1)]",
    OutlineButton/OutlineButton.tsx:258  "opacity 0.36s ease-out, transform 0.16s ease-out",
    Toast/Toast.tsx:229-231              setTimeout(() => { setToasts(...filter...) }, 200);   // CSS exit is duration-150 (:63)
    dooph-component-tokens.css:169-170   transition-duration: 180ms; transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
- impact: A consumer theme can retune motion for 10 components and none of the other 30, including every overlay, every button, and every form control. The unit reports disagree on the size of the hover-utility habit (U3-F9 "30 hits / 16 files", U4-F5 and U12-F13 "38 / 16"). The measured figure is 32 non-reduced durations in 17 files (31 in 16 `.tsx` plus `toggleOption.ts`). The family is also internally split: 150 ms + `ease-out` at 7 sites, 100 ms + the default curve at 10. Three units independently ask for the same repo-wide decision, which should be made once. Otherwise remediation will land 12 inconsistent per-unit fixes, or an agent applying R6.5 literally will "fix" 32 sites one by one. The inline and JS cases also escape `prefers-reduced-motion`: OutlineButton orbs, ProgressIndicator arcs, both LoadingSpinner variants, and Popover (no `motion-reduce:`). Toast's 200 ms timer is the R6.6 mirror that desyncs if the exit is retuned.
- recommendation: A maintainer decision first, then one sweep. (1) Either sanction colour/shadow state transitions as a system concern, with one shared `--ui-*` duration/ease pair read by a `ds-*` helper (a.1: 17 sites), or record an explicit carve-out in arch Rule 6. (2) Give overlays a family (shared or per overlay) read by `ds-*` enter/exit helpers (a.2). (3) Tokenise the per-component literals in a.3/a.5 (move the inline strings into `ds-*` classes so reduced motion can reach them). (4) Retire the JS mirrors: Toast unmount on `animationend`; LoadingSpinner per U9-F2, pending the li conflict U9-F3. The arch "Existing families" list (arch:318-320) should then be regenerated from tokens.css.
- breaking: none
- contract: src/components/SidebarWithHoverIcon/SidebarWithHoverIcon.tsx:24-26 and src/components/MorphRotationShape/MorphRotationShape.tsx:33-37 "Nothing in this file may hold a duration or an easing curve" → consistent (both comply; they are the model). `.agents/skills/dooph-ds-loading-indicators/SKILL.md:138,238` (flat spinner fully rAF-driven) → conflicts for the LoadingSpinner part (see U9-F3)
- remediation: tbd
- related: [U1-F6, U3-F2, U3-F9, U4-F5, U5-F3, U6-F5, U7-F3, U8-F2, U8-F3, U9-F2, U9-F3, U9-F4, U12-F13, U1-F15, U14-F6]

### HC-F2: Component class strings bypass the spacing/size/radius tokens 62 times in 21 files — 25 arbitrary px literals and 37 Tailwind numeric-scale utilities, 32 of which equal an existing DS token
- severity: S2
- category: rule-violation
- rules: [R8.1, R8.11, R9.2, R5.2]
- scope: consumer-visible
- confidence: plausible
- verified_by: "rg -o --pcre2 arbitrary-literal pattern (scratch/HC/arbitrary-literals.txt: 45 hits; minus 8 Sheet slide distances and 12 decorative OutlineButton orb geometry = 25); rg -o --pcre2 numeric-scale pattern (scratch/HC/numeric-scale.txt: 102 hits; minus 65 zero-valued = 37); values compared against tokens.css:449-544 (spacing xxs 4 / xs 8 / sm 10 / rg 12 / md 16; radius-soft 20; height-button 38; icon-rg 14; size-code-digit 46; min-w-menu 160; width-slider-handle 6); --spacing: 0.25rem at dist-styles.css:15."
- locations:
  - §2(c) table — OutlineSection.tsx:22; OutlineButton.tsx:147,159,244,265; ShapeButton.tsx:125; SplitButton.tsx:33; Avatar.tsx:23-24; CodeDigitInput.tsx:85; Slider.tsx:398; DropdownMenu.tsx:339; DropdownTrigger.tsx:325; HotkeyIndicator.tsx:21; Toast.tsx:76; LinearProgressIndicator.tsx:55,61,69
  - §2(d) table — Button.tsx:39,85,86; OutlineButton.tsx:158,159,286; SplitButton.tsx:19; SearchBox.tsx:27; HotkeyIndicator.tsx:11; DropdownTrigger.tsx:59,194; DropdownMenuSearch.tsx:77; Tooltip.tsx:70; Toast.tsx:70,72,74,76; Table.tsx:82,134,151; Tabs.tsx:21; ChatDivider.tsx:28; Checkbox.tsx:81,90,106; Sheet.tsx:81,85
- evidence: |
    OutlineSection.tsx:22   'border border-solid border-border-primary rounded-[28px]',     (= radius-soft 20 + spacing-xs 8; same literal OutlineButton.tsx:147)
    ShapeButton.tsx:125     "size-[46px] cursor-pointer select-none",                       (= --ui-size-code-digit / --ui-size-cta-chip-standard)
    SplitButton.tsx:33      <span className="size-[14px] shrink-0">                          (= --ui-icon-rg)
    Tabs.tsx:21             "inline-flex items-center gap-1"                                (Toggle.tsx:99 / SegmentedTabSelect.tsx:64 spell the same 4px `gap-xxs`)
    Toast.tsx:70            "... py-2 pl-4 pr-2 ..."                                        (= xs / md / xs)
    DropdownTrigger.tsx:59  "... min-w-40 ..."                                              (= --ui-min-w-menu 160)
- impact: Retuning a spacing or size token moves some of the DS and not the rest. Every one of the 32 token-equal numeric utilities silently decouples from its token, so a consumer override of `--ui-spacing-rg` moves every `px-rg` / `ds-*-ui-rg` user but not Button's own padding, which is `px-3` (Button.tsx:85-86). Table's header/body alignment already depends on a token and a numeric step coinciding (U12-F12). Nine unit findings file slices of this, each with its own "add a token or use the scale" recommendation. Applied piecemeal, the same value (4 px, 8 px, 28 px, 160 px) gets different fixes in different folders.
- recommendation: One sweep. (1) Mechanically replace the 32 token-equal numeric utilities with the DS scale (`gap-xs`, `px-rg`, `pl-md`, `ds-min-w-menu`, …). (2) Map literals that equal a token to that token (`size-[14px]` → icon-rg, `min-w-[160px]` → min-w-menu, `size-[6px]` → slider handle). (3) Add tokens only for values that repeat and have no token: the 28 px concentric radius ×2, which can follow the existing `ds-radius-mini-outset-xxs` pattern, and the 30 px row height ×2. Everything else maps to the nearest existing token or is justified in place.
- breaking: none
- contract: src/components/VerificationCode/CodeDigitInput.tsx:6-7 "Digit glyph is always `BaseText` at 18px / medium (body role) — never SubheadingText" → consistent if `text-[18px]` becomes a dedicated glyph token; conflicts if it is mapped onto `--ui-text-subheading` (couples the glyph to the subheading role the header rules out)
- remediation: tbd
- related: [U4-F6, U4-F7, U5-F4, U6-F3, U6-F26, U8-F6, U8-F15, U9-F15, U11-F13, U12-F7, U12-F12, U1-F1]

### HC-F3: Focus indication leaves the `ds-focus-*` helpers three different ways in four components
- severity: S2
- category: inconsistency
- rules: [R8.14]
- scope: consumer-visible
- confidence: plausible
- verified_by: "rg -o focus-class pattern over non-story TS/TSX (scratch/HC/focus.txt, 42 hits); each outline-none read in place. 23 sites use ds-focus-* correctly; the four below do not. Modal/Sheet/Toast/Tooltip outline-none reviewed compliant (tabIndex −1 fallback focus targets, not in tab order); inner-input outline-none compliant (ring on wrapper)."
- locations:
  - src/components/Checkbox/Checkbox.tsx:55
  - src/components/Checkbox/Checkbox.tsx:60
  - src/components/VerificationCode/CodeDigitInput.tsx:56
  - src/components/ShapeButton/ShapeButton.tsx:126
  - src/styles/dooph-component-tokens.css:35-38
  - src/components/Tabs/Tabs.tsx:56
- evidence: |
    Checkbox.tsx:55        [&:not([data-disabled])]:active:shadow-focus-prominent     (box-shadow press ring)
    CodeDigitInput.tsx:56  "focus-within:border-input-border-focus focus-within:shadow-focus-prominent",
    ShapeButton.tsx:126    "outline-none ds-shape-button-focus-visible",
    dooph-component-tokens.css:35-38  .ds-shape-button-focus-visible:focus-visible { outline: 2px solid var(--ui-color-focus-ring-prominent); outline-offset: 2px; }
    Tabs.tsx:56            className={cn("focus-visible:outline-none", className)}   (TabsContent; Radix gives it tabIndex 0)
- impact: The focus ring looks and behaves differently by component: box-shadow vs outline, and a 2px offset on ShapeButton only. A panel in the tab order shows no ring at all. Three unit findings each propose a local fix, and none of them states the rule they converge on, so the next focus variant gets a fourth spelling.
- recommendation: Route all four through `ds-focus-*`. CodeDigitInput → `ds-focus-within-ring`. TabsContent → `ds-focus-visible-ring`. ShapeButton → either an offset variant of the shared helper or a header line justifying its offset. Checkbox press ring → keep it only as a named design element (token + `ds-*`), otherwise drop it.
- breaking: none
- contract: src/components/Checkbox/Checkbox.tsx:9-10 "Active/focus rings are gated off while `data-disabled` so a click cannot flash the focus shadow" (## behavior) → consistent if updated in the same commit; src/components/VerificationCode/CodeDigitInput.tsx:9 "focus uses brand focus ring" (stale spelling, U6-F1)
- remediation: tbd
- related: [U6-F4, U4-F11, U6-F22, U6-F1]

### HC-F4: Disabled state is rendered by four mechanisms and three helpers while R8.16 names two — and two controls end up with no disabled styling at all
- severity: S2
- category: inconsistency
- rules: [R8.16]
- scope: consumer-visible
- confidence: plausible
- verified_by: "rg -o disabled-helper pattern (scratch/HC/disabled.txt); helper definitions read at dooph-component-tokens.css:13-33, 324-326. `.ds-radix-data-disabled[data-disabled]` matches ANY element carrying data-disabled, and Input.tsx:155 and DropdownTrigger.tsx:248 already emit it."
- locations:
  - src/components/VerificationCode/CodeDigitInput.tsx:53
  - src/components/Calendar/CalendarPresetsPanel.tsx:57-70
  - src/components/Toggle/toggleOption.ts:32
  - src/components/AIChat/AIPromptInput.tsx:227
  - src/components/Input/Input.tsx:155
  - src/components/Input/Input.tsx:163-181
  - src/components/DropdownTrigger/DropdownTrigger.tsx:197-207
  - src/components/DropdownTrigger/DropdownTrigger.tsx:248-250
  - src/styles/dooph-component-tokens.css:13-33
- evidence: |
    CodeDigitInput.tsx:53   "border-secondary-border-disabled bg-secondary-disabled ds-disabled-state",   (on a <div>: :is(:disabled,[aria-disabled]) never matches)
    Menu/DropdownMenu.tsx:197 menuItemClassName = "... ds-radix-data-disabled ..."                   (reused by a native <button> preset item → disabled renders enabled)
    toggleOption.ts:32      "ds-disabled-control"                                                     (third helper, :disabled only)
    Input.tsx:163-164       disabled ? "cursor-not-allowed bg-secondary-disabled border-secondary-border-disabled" : [ ...
    Input.tsx:155           data-disabled={disabled ? "" : undefined}                                (already matches ds-radix-data-disabled)
- impact: Six unit findings describe one gap: there is no single answer to "how does a DS control look disabled". The concrete consequences are already visible. CodeDigitInput's helper is inert (U6-F2). A disabled CalendarPresetItem renders and hovers as enabled (U7-F14). DropdownTrigger's chevron fades twice (U5-F2). A disabled bare Input still lifts on hover (U6-F12). The Button family guards hover three ways (U4-F10). The contribution checklist omits `ds-disabled-control`, so an agent following R8.16 cannot choose between the helpers in use.
- recommendation: One rule, applied everywhere. Use `ds-disabled-state` on the element that is natively or aria-disabled. On wrappers and Radix parts, emit `data-disabled` and use `ds-radix-data-disabled`, which already matches any `[data-disabled]`, instead of JS ternaries (Input and TypeableDropdownTrigger emit the attribute today). Either fold `ds-disabled-control` into `ds-disabled-state` or add it to R8.16 with its reason. Give CalendarPresetItem the native-button helper.
- breaking: none
- contract: src/components/VerificationCode/CodeDigitInput.tsx:8-9 "`disabled` uses secondary disabled tokens + `ds-disabled-state`" → consistent (the fix makes it true); src/components/Toggle/toggleOption.ts:16 "opacity comes from ds-disabled-control" (## behavior) → update in the same commit if folded
- remediation: tbd
- related: [U4-F10, U5-F2, U6-F2, U6-F12, U6-F13, U7-F14, HC-F5]

### HC-F5: Non-Radix state is styled two ways — data attributes read by CSS (dominant) vs JS class ternaries — and three components emit data attributes that nothing styles against
- severity: S3
- category: inconsistency
- rules: [R2.2]
- scope: consumer-visible
- confidence: plausible
- verified_by: "rg single-line + multiline ternary scans (scratch/HC/r22-ternaries.txt, ternaries-ml.txt), each hit read; rg -n 'data-filled|data-error|data-\\[filled|data-\\[error' src → only the emitting lines CodeDigitInput.tsx:59-60; CalendarPresetsPanel data-active has no CSS/variant reader (the `data-active` selectors in index.css:450-512 / dooph-component-tokens.css:154 target ds-roll-hover/ds-underline-link/ds-slider-dot only)."
- locations:
  - src/components/VerificationCode/CodeDigitInput.tsx:49-60
  - src/components/VerificationCode/CodeDigitInput.tsx:68-69
  - src/components/Input/Input.tsx:155-181
  - src/components/DropdownTrigger/DropdownTrigger.tsx:197-207
  - src/components/DropdownTrigger/DropdownTrigger.tsx:248-250
  - src/components/Calendar/CalendarPresetsPanel.tsx:60
  - src/components/Calendar/CalendarPresetsPanel.tsx:70
  - src/components/Toast/Toast.tsx:285-300
  - src/components/AIChat/AIToolPart.tsx:54
  - src/components/AIChat/AIToolPart.tsx:71-75
  - src/components/HotkeyIndicator/HotkeyIndicator.tsx:22-24
- evidence: |
    CodeDigitInput.tsx:59-60   data-filled={filled || undefined} / data-error={hasError || undefined}   (read by nothing)
    CodeDigitInput.tsx:49-50   hasError ? "border-danger-primary bg-secondary text-danger-primary" : ...
    CalendarPresetsPanel.tsx:60/70   data-active={isActive ? "" : undefined} ... isActive && "bg-ghost-active",
    AIToolPart.tsx:54/71-73    data-state={state} ... state === AIToolPartState.error ? "text-danger-primary" : "text-ghost-fg",
    HotkeyIndicator.tsx:22-24  pressed ? 'bg-ghost-active border-border-primary' : 'bg-surface-page border-border-primary'
    Toast.tsx:286-288          item.variant === ToastTypes.prominent ? "text-prominent-fg" : "text-text",
- impact: R2.2's letter covers Radix-set attributes, and none of these is Radix-owned. But the package's own idiom for DS-set state is a data attribute read by CSS: Slider, CopyButton, RevealChangeText, RollHoverText, RollingDigitsText, CalendarGrid, AIPromptInput, AIThinkingPart. Components that emit an attribute and then style by ternary publish a styling hook that does nothing (`data-error`, `data-filled`, `data-active`). A consumer's `data-[error]:` override then competes with a JS-injected class instead of the DS rule. Where no attribute exists (HotkeyIndicator `pressed`, Toast variant), consumers cannot target the state at all, and the exported Toast parts cannot reproduce the provider's look (U8-F8). Four units filed slices; AIToolPart and HotkeyIndicator are unfiled.
- recommendation: Style from the attributes already emitted (`data-[error]:`, `data-[active]:`, `group-data-[state=error]:` on AIToolPart's label). Add `data-pressed` to HotkeyIndicator and `data-variant` to ToastRoot (U8-F8's fix). Drop attributes nothing will read. State the idiom once, in arch Rule 2 or 5, for DS-set state.
- breaking: none
- contract: src/components/Checkbox/Checkbox.tsx:13-14 and src/components/Menu/DropdownMenu.tsx:20 ("Style … via Radix data attributes only") → consistent (both comply; the recommendation extends their rule to DS-set state)
- remediation: tbd
- related: [U5-F2, U6-F12, U7-F12, U8-F8, U11-F3, HC-F4]

### HC-F6: `asChild` throws on four of the five leaves R3.2 promises it for — one root cause, filed twice
- severity: S1
- category: rule-violation
- rules: [R3.2, R8.4]
- scope: consumer-visible
- confidence: plausible
- verified_by: "node docs/audit/_work/scratch/HC/aschild.cjs run in ../dooph-ds-audit-build against dist/index.cjs (react-dom/server renderToString, child <a href>) → Button OK, TextLink OK; DropdownTrigger, TextDropdownTrigger, OutlineButton, ShapeButton THROW 'Slot failed to slot onto its children. Expected a single React element child or `Slottable`.' Matches U4-F1 and U5-F1."
- locations:
  - src/components/DropdownTrigger/DropdownTrigger.tsx:53
  - src/components/DropdownTrigger/DropdownTrigger.tsx:73-74
  - src/components/DropdownTrigger/DropdownTrigger.tsx:314
  - src/components/DropdownTrigger/DropdownTrigger.tsx:332-337
  - src/components/OutlineButton/OutlineButton.tsx:86
  - src/components/OutlineButton/OutlineButton.tsx:180-289
  - src/components/ShapeButton/ShapeButton.tsx:116
  - src/components/ShapeButton/ShapeButton.tsx:131-152
  - .agents/skills/dooph-ds-architecture/SKILL.md:221
- evidence: |
    DropdownTrigger.tsx:53      const Comp = (asChild ? Slot : "button") as ElementType;
    DropdownTrigger.tsx:73-74   <span className="flex-1 text-left">{children}</span> / <DropdownCaret variant={DropdownCaretVariant.dropdown} />
    DropdownTrigger.tsx:332-333 <span>{children}</span> / <ChevronDownIcon ... />
    ShapeButton.tsx:131,150     <span className="ds-shape-button-shadow absolute inset-0 ..."> ... <span className="relative z-10 ...">{children}</span>
    arch:221                    Leaf interactive components (Button, DropdownTrigger, TextDropdownTrigger, OutlineButton, ShapeButton) support `asChild`
- impact: The documented `<X asChild><Link/></X>` pattern crashes the render for 4 of 5 named leaves (and transitively DatePickerTrigger, which spreads props onto DropdownTrigger). Every one of them renders decoration as a sibling of `children` inside `Comp`. U4-F1 and U5-F1 each propose a fix in their own folder. One shared fix avoids two diverging patches.
- recommendation: One pattern for decorated leaves: wrap the consumer child in Radix `Slottable` (`<Comp><Slottable>{children}</Slottable><Decoration/></Comp>`), which is the Slot API for exactly this shape. Alternatively, drop `asChild` from the leaves that cannot support it and amend arch:221. Add the missing asChild stories (U4-F15).
- breaking: none
- contract: n/a
- remediation: tbd
- related: [U4-F1, U5-F1, U4-F15, HC-F8]

### HC-F7: `DropdownMenuSub` is exported without `DropdownMenuSubTrigger`/`DropdownMenuSubContent`, so the public submenu root cannot be used without importing Radix directly and hand-styling it
- severity: S3
- category: api-design
- rules: []
- scope: consumer-visible
- confidence: plausible
- verified_by: "rg -n 'SubTrigger|SubContent' src docs/audit/_work/dist-index.d.ts → 0; dist-index.d.ts:124 exports DropdownMenuSub; git log -S 'SubContent' -- src → no commit ever added one; git log -S 'DropdownMenuSub = ' -- src → a01e5e8 (initial commit); dist/chunk-CA2GD74E.js imports @radix-ui/react-dropdown-menu as an external; no story or consumer doc uses DropdownMenuSub (the codebase skill:218 lists it as a pass-through)."
- locations:
  - src/components/Menu/DropdownMenu.tsx:91
  - src/components/Menu/DropdownMenu.tsx:416
  - src/components/Menu/index.ts:7
  - .agents/skills/dooph-ds-codebase/SKILL.md:218
- evidence: |
    DropdownMenu.tsx:91    const DropdownMenuSub = DropdownMenuPrimitive.Sub;
    DropdownMenu.tsx:402-418  export { DropdownMenuRoot as DropdownMenu, DropdownMenuContent, ..., DropdownMenuSub, DropdownMenuTrigger };   (no SubTrigger / SubContent)
- impact: A consumer who sees `DropdownMenuSub` in IntelliSense has an export that renders nothing useful on its own. To build a submenu they must add `@radix-ui/react-dropdown-menu` as a direct dependency and import `SubTrigger`/`SubContent` from it. That only works while their copy dedupes to the DS's (a second copy means a second context), and the result bypasses the DS item styling and portal escape hatch. Every other public DropdownMenu part is styled; this one is a vestigial pass-through that has been there since the initial commit.
- recommendation: Either ship styled `DropdownMenuSubTrigger`/`DropdownMenuSubContent` (the latter with the R2.9 `portal`/`portalProps` hatch, reusing `itemBase` and the content shell) or remove `DropdownMenuSub` from the public surface.
- breaking: minor (only if removed)
- contract: src/components/Menu/DropdownMenu.tsx:16 "portals on by default with an escape hatch" (## behavior) → consistent (a SubContent would have to follow it)
- remediation: tbd
- related: [U5-F10]

### HC-F8: R3.4's documented-necessity list names 2 children-wrappers; the code has 10 — 7 with a real but unlisted reason, 1 (TextDropdownTrigger) with none
- severity: S3
- category: doc-drift
- rules: [R3.3, R3.4, R9.11]
- scope: internal
- confidence: plausible
- verified_by: "rg -B3 '\\{children\\}' over non-story TSX, every wrapper read in place (§2(j)); compared with arch SKILL.md:232-235."
- locations:
  - .agents/skills/dooph-ds-architecture/SKILL.md:232-235
  - src/components/ShapeButton/ShapeButton.tsx:150
  - src/components/Menu/DropdownMenu.tsx:326
  - src/components/DropdownTrigger/DropdownTrigger.tsx:73
  - src/components/DropdownTrigger/DropdownTrigger.tsx:332
  - src/components/AIChat/AIModelSelect.tsx:64
  - src/components/AIChat/AIModelSelect.tsx:100
  - src/components/Sticker/Sticker.tsx:131
  - src/components/Table/Table.tsx:85
- evidence: |
    arch:233-234              OutlineButton `<span className="relative z-10 ...">` — acceptable; DropdownMenuRadioSelectItem `<span className="flex flex-1">` — acceptable
    ShapeButton.tsx:150       <span className="relative z-10 inline-flex items-center justify-center">   (same reason as OutlineButton; unlisted)
    DropdownMenu.tsx:326      <span className="flex flex-1 items-center gap-sm">{children}</span>      (MultiSelectItem; same reason as RadioSelectItem; unlisted)
    DropdownTrigger.tsx:332   <span>{children}</span>                                                   (root is already `inline-flex items-center ds-gap-ui-xs` :319 — no layout effect)
- impact: R3.4 forbids a wrapper "unless it's for a documented layout necessity", and the only documentation is a two-item list. An agent enforcing it will either strip load-bearing wrappers (ShapeButton's `z-10` keeps the icon above the shape; MultiSelectItem's `flex-1` fills the row) or cannot tell which are sanctioned. The one wrapper with no function survives. Sticker's is contested (U12-F10 vs its own header). The wrappers also sit on the HC-F6 crash path (decoration siblings under `Slot`).
- recommendation: Replace arch's example list with the criterion plus the actual set (or a per-file header line where the reason is local). Remove TextDropdownTrigger's bare span. Resolve Sticker per U12-F10.
- breaking: minor (TextDropdownTrigger loses one DOM level)
- contract: src/components/ShapeButton/ShapeButton.tsx:9-10 "The icon slot carries the CONTENT color separately" (## behavior) → consistent (documents the ShapeButton wrapper); src/components/Sticker/Sticker.tsx:10-12 "They are wrapped in a row with `gap-xs` … The wrapper is layout" → conflicts with U12-F10's recommendation (maintainer decides)
- remediation: tbd
- related: [U12-F10, U12-F16, U14-F11, HC-F6]

### Already covered — not re-filed

- R2.9 portal escape hatch → U8-F4 (Modal, Sheet, Toast viewport, already consolidated) + U7-F8 (DatePicker pass-through).
- R2.10 → U6-F6 (Slider); every other `preventDefault` is compliant (§1b).
- R8.10 raw `var(--ui-*)` in className → U6-F3 (Slider only, 5 occurrences).
- R9.19 SVG `stroke="var(…)"` attributes → U9-F19.
- Rule 5 / Rule 7 → 0 violations (§1 zero-hit checks).

## DONE
