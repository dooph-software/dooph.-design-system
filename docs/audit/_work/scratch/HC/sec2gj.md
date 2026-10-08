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
| ShapeButton (ShapeButton.tsx:150) | `<span class="relative z-10 inline-flex …">` | layers above the absolutely-positioned shape (:131-146) | no (same reason as OutlineButton, unlisted) | — |
| DropdownMenuMultiSelectItem (DropdownMenu.tsx:326) | `<span class="flex flex-1 items-center gap-sm">` | fills beside the leading checkbox | no (same reason as RadioSelectItem, unlisted) | — |
| DropdownTrigger (DropdownTrigger.tsx:73) | `<span class="flex-1 text-left">` | pushes the caret to the far edge | no | — (its sibling is the U5-F1 crash) |
| TextDropdownTrigger (DropdownTrigger.tsx:332) | `<span>` (no class) | **none** | no | — (U5-F1 crash context) |
| Sticker (Sticker.tsx:131) | `<div class="flex flex-row items-center gap-xs">` | none (root is already `inline-flex items-center`) | no | U12-F10 |
| AIModelSelectTrigger (AIModelSelect.tsx:64) | `<span class="whitespace-nowrap text-text">` | typography + nowrap | no | — |
| AIModelSelectItem (AIModelSelect.tsx:100) | `<span class="min-w-0 flex-1 truncate">` | truncation beside swatch | no | — |
| TableHeaderCell sortable (Table.tsx:85) | `<ButtonText>{children}</ButtonText>` inside Button | typography applied on one branch only | no | U12-F16 |

arch:232-235 sanctions 2 wrappers. The code has 10: 7 have a real layout or typography reason but are undocumented, 1 (TextDropdownTrigger) has none, and 1 is filed (Sticker, U12-F10). → **HC-F8**.

