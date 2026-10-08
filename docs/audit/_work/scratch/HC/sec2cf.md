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

