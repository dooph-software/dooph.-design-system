# H2 — Consistency matrix (horizontal pass HB) @ b436647

Inputs: §3 Fingerprints of units U3–U12 (all 10 units ended with `## DONE` when this pass ran, U10 included), normalized by hand into `docs/audit/_work/scratch/HB/matrix.psv`, cross-checked against two mechanical extractions over the source:
- `node docs/audit/_work/scratch/HB/facts.cjs > scratch/HB/facts.tsv` — per exported component (the 245 `COMP` rows of `scratch/HA/surface.out.txt`): directive line, forwardRef, ref type argument, displayName, className position in `cn`, style order.
- `node docs/audit/_work/scratch/HB/props.cjs > scratch/HB/props.tsv` — whether `<Name>Props` is declared and exported in the defining file, interface or type.
- `node docs/audit/_work/scratch/HB/render.cjs table|counts` renders the matrix below and every count in §2.

Populations (weights `n`; 245 exported components in total, matching the 245 `COMP` rows):
- **A = 122 authored components**: every exported component whose props, ref and classes the DS itself defines. All counts in §2 are over A unless stated.
- **R = 20 Radix aliases** (`const Modal = DialogPrimitive.Root` and the like). They carry Radix's own props, ref and displayName, so most columns are n/a.
- **L = 103 icon/shape leaves** (BaseIcon + 88 icons, BaseShape + ShapeClipPath + 12 shapes). Every one is templated and gets the same values (no forwardRef, no displayName, closed props). Their defects belong to U10 (U10-F3, F4, F7), so they are reported as one block and never counted as outliers.

Normalized vocabulary (the unit tables use different wording for the same things):
- uc: `L<n>·need` directive on line n, needed · `L<n>·not` present, not needed by U2's criterion · `—·ok` absent, not needed · `—·NEED` absent but the module hands a function to a client component (§2.1) · `—·borderline` see §2.1.
- ref: `CR` = `ComponentRef<typeof Primitive.X>` · `CR(DS)` = `ComponentRef<typeof DsComponent>` · `HTMLElement` = the generic element on polymorphic/cast components · `Div/Span/Button/Input/Anchor/SVG/Form/TextArea` = the concrete `HTML*Element`/`SVGSVGElement`.
- props: `I+` = exported `interface <Name>Props` · `T+` = exported `type <Name>Props =` · `inline` = no named type · `shared:X` = reuses another exported props type. `CPWR` = `ComponentPropsWithoutRef`, `P` = the wrapped Radix primitive, `poly` = generic `TElement` polymorphic type.
- cn: `last` = `cn(base…, className)`, consumer last · `last@wrapper` / `last@inner List` = merged correctly, but on a different element than `ref`/`...props` · `pass` = handed to a child DS component that merges it.
- style: `n/a` = the component sets no style, so the consumer's passes through · `cw` = merged, consumer wins (`{...own, ...style}`) · `pw` = merged, component/prop wins (`{...style, ...own}`) · `CLOBBER` = component style replaced by (or replacing) the consumer's · `split` = `style` lands on a different element than `className` · `closed` = no `style` accepted.
- rest (`...props` target): `root` · `radix` (onto the primitive) · `inner` (an inner element, not the one that gets className) · `child` (a child DS component) · `NONE` (unnamed props dropped or not accepted).
- disabled: `state` = `ds-disabled-state` · `radix-data` = `ds-radix-data-disabled` · `control` = `ds-disabled-control` · `JS` = class ternary on a boolean.
- focus: `visible` = `ds-focus-visible-ring` · `within` = `ds-focus-within-ring` · `on-focus` / `on-open` = `ds-focus-ring-on-focus` / `-on-open` · `own` = component-specific helper · `shadow` = `shadow-focus-*` box-shadow.
- motion: `css-token` = CSS driven by a `--ui-<component>-*` family · `tw-dur` = Tailwind `duration-*`/`ease-*` utilities in className · `css-literal` = a ds-* helper with hard-coded timing · `js` = timing decided in JS.
- header: `S` = sectioned `## behavior`/`## constraints` contract · `S*` = constraints only · `(file)` = shared file header.

## 1. Merged matrix

| pop | n | component | file | uc | fwd | ref | dn | props | cn | style | rest | asChild | consts | cva | ctrl | state | disabled | focus | typo | token | motion | outside | header | story | index | unit |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| A | 1 | AITextPart | AIChat/AITextPart.tsx | —·ok | yes | Div | set | I+ HTMLAttrs | last | n/a | root | — | — | — | — | data→CSS | n/a | n/a | ts-class | utils+ds | css-token | none | S | own | named | U11 |
| A | 1 | AIToolPart | AIChat/AIToolPart.tsx | —·ok | yes | Div | set | I+ HTMLAttrs | last | n/a | root | — | AIToolPartVariant, AIToolPartState | hand:ternary | — | JS ternary (data-* emitted, unread) | n/a | n/a | ts-class | utils+ds | css-token | none | S | own | named | U11 |
| A | 1 | AIThinkingPart | AIChat/AIThinkingPart.tsx | L24·need | yes | Div | set | I+ Omit<HTMLAttrs> | last | n/a | root | — | AIThinkingPartState | — | open/defaultOpen/onOpenChange (hand-rolled) | data-state (2 meanings) | n/a | via Button | ts-class | utils+ds | css-token | none | S | own | named | U11 |
| A | 1 | AITurnSummary | AIChat/AITurnSummary.tsx | —·ok | yes | Div | set | I+ Omit<HTMLAttrs> | last | n/a | root | — | — | — | — | css hover/focus-within | n/a | n/a | ts-class | utils+ds | css-token | none | S | own | named | U11 |
| A | 1 | UserMessageHeader | AIChat/UserMessageHeader.tsx | —·ok | yes | Div | set | T+ HTMLAttrs | last | n/a | root | — | — | — | — | — | n/a | n/a | ts-class | utils | — | none | S | own | named | U11 |
| A | 1 | ChatDivider | AIChat/ChatDivider.tsx | —·ok | yes | Div | set | T+ HTMLAttrs | last | n/a | root | — | — | — | — | — | n/a | n/a | ts-class | utils+num | — | none | S | own | named | U11 |
| A | 1 | AIContextGauge | AIChat/AIContextGauge.tsx | —·ok | yes | SVG | set | T+ Omit<ProgressIndicatorProps> | pass | cw (via PI) | child | — | LoadingSpinnerSize/Color (reused) | — | — | — | n/a | n/a | n/a | inline var (via PI) | js (via PI) | none | S | own | named | U11 |
| A | 1 | AIPromptInput | AIChat/AIPromptInput.tsx | L29·need | yes | Form | set | I+ Omit<FormHTMLAttrs> | last | n/a | root | — | — | — | value/defaultValue/onValueChange (hand-rolled) | data-state/data-disabled (unstyled) | n/a | within | n/a | utils | — | none | S | own | named | U11 |
| A | 1 | AIPromptInputTextarea | AIChat/AIPromptInput.tsx | L29·need | yes | TextArea | set | T+ Omit<TextareaHTMLAttrs> | last | CLOBBER (height, layout effect) | root | — | — | — | via context | — | control | outline-none (card owns ring) | ts-class | utils+ds | — | none | S (file) | family | named | U11 |
| A | 1 | AIPromptInputToolbar | AIChat/AIPromptInput.tsx | L29·need | yes | Div | set | T+ HTMLAttrs | last | n/a | root | — | — | — | — | — | n/a | n/a | n/a | utils | — | none | S (file) | family | named | U11 |
| A | 1 | AIPromptInputToolbarStart | AIChat/AIPromptInput.tsx | L29·need | yes | Div | set | shared:AIPromptInputToolbarProps | last | n/a | root | — | — | — | — | — | n/a | n/a | n/a | utils | — | none | S (file) | family | named | U11 |
| A | 1 | AIPromptInputToolbarEnd | AIChat/AIPromptInput.tsx | L29·need | yes | Div | set | shared:AIPromptInputToolbarProps | last | n/a | root | — | — | — | — | — | n/a | n/a | n/a | utils | — | none | S (file) | family | named | U11 |
| A | 1 | AIPromptInputSubmit | AIChat/AIPromptInput.tsx | L29·need | yes | Button | set | I+ closed (no base) | pass | closed | NONE | — | ButtonVariant/Size (internal) | via:Button | — | JS variant switch | via Button | via Button | via Button | via Button | via Button | none | S (file) | family | named | U11 |
| A | 1 | AIModelSelectTrigger | AIChat/AIModelSelect.tsx | —·ok | yes | Button | set | I+ Omit<CPWR<"button">> | pass | n/a | child | — | ButtonVariant/Size (internal) | via:Button | — | radix (on Button) | via Button | via Button | ts-class + Button | utils | via Button | none | S* | own | named | U11 |
| A | 1 | AIModelSelectItem | AIChat/AIModelSelect.tsx | —·ok | yes | CR(DS) | set | I+ CPWR<DS item> | pass | pw (--ds-chat-model-color wins) | child | — | — (DsColor open value) | — | radio via RadioGroup | radix | via item | via item | via item | inline var | — | none | S* | own | named | U11 |
| A | 1 | AIThinkingEffortSelector | AIChat/AIModelSelect.tsx | —·borderline | yes | Div | set | I+ closed (no base) | last | closed | NONE | — | SliderVariant (internal) | — | value/onValueChange (controlled only) | — | via Slider | via Slider | role-comp | utils | via RollChangeText | none | S* | own | named | U11 |
| A | 1 | AIModelTooltipContent | AIChat/AIModelSelect.tsx | —·ok | yes | CR(DS) | set | I+ Omit<CPWR<TooltipContent>> | last | n/a | child | — | TooltipTypes (internal) | — | — | radix | n/a | n/a | role-comp | utils+ds+inline colour | via TooltipContent | none | S* | own | named | U11 |
| A | 1 | ShimmerText | AnimatedText/ShimmerText.tsx | —·ok | yes | Span | set | T+ HTMLAttrs | last | n/a | root | — | — | — | — | — | n/a | n/a | inherit | ds | css-literal | none | — | own | named | U3 |
| A | 1 | RollHoverText | AnimatedText/RollHoverText.tsx | —·ok | yes | Span | set | I+ Omit<HTMLAttrs> | last | cw | root | — | RollDirection | — | active (force state) | data-active + group | n/a | n/a | inherit | ds | css-token (no ease) | none | — | own | named | U3 |
| A | 1 | RollChangeText | AnimatedText/RollChangeText.tsx | L24·need | yes | Span | set | I+ HTMLAttrs | last | cw | root | — | RollDirection | — | changeKey | JS class (anim lifecycle) | n/a | n/a | inherit | ds | css-token | none | S | own | named | U3 |
| A | 1 | FadeChangeText | AnimatedText/FadeChangeText.tsx | L28·need | yes | Span | set | I+ HTMLAttrs | last | cw | root | — | RollDirection | — | changeKey | JS class (anim lifecycle) | n/a | n/a | inherit | ds | css-token | none | S | own | named | U3 |
| A | 1 | RevealChangeText | AnimatedText/RevealChangeText.tsx | L33·need | yes | Span | set | I+ HTMLAttrs | last | cw | root | — | RevealDirection | — | changeKey/onSettled | data-open/data-direction | n/a | n/a | inherit | ds | css-token | none | S | own | named | U3 |
| A | 1 | RollingDigitsText | AnimatedText/RollingDigitsText.tsx | L42·need | yes+cast | Span | set(base) | T+ union | last | pass-through | root | — | — | — | smallDecimals | data-entering/exiting | n/a | n/a | inherit | ds | css-token | none | S | own | named | U3 |
| A | 1 | UnderlineLinkText | AnimatedText/UnderlineLinkText.tsx | —·ok | yes | Span | set | I+ HTMLAttrs | last | cw | root | — | — (open-value thickness/offset) | — | active (force state) | data-active + group | n/a | n/a | inherit | ds | css-token | none | — | own | named | U3 |
| A | 1 | Avatar | Avatar/Avatar.tsx | —·ok | yes | Div | set | I+ HTMLAttrs | last | n/a | root | — | AvatarSize (inline in .tsx) | hand:&& | — | — | none | none | none | utils+arb px | — | none | — | own | named | U12 |
| A | 1 | Button | Button/Button.tsx | L23·not | yes+cast | HTMLElement | set(base) | T+ poly + VariantProps<cva> | last | n/a | root | Slot | ButtonVariant, ButtonSize | cva·exp | — | css pseudo + aria-disabled | state | visible | ts-class | utils+ds+num | tw-dur | none | S | own | named | U4 |
| A | 1 | CTAButton | CTAButton/CTAButton.tsx | —·ok | yes | Anchor | set | I+ Omit<AnchorHTMLAttrs> | last | n/a | root | Slot+clone | CTAButtonVariant, CTAButtonSize | hand:map+ternary | — | group (RollHoverText) | none | visible | role-comp (fontSize) | utils+ds | via RollHoverText | none | — | own | named | U4 |
| A | 1 | CopyButton | CopyButton/CopyButton.tsx | L1·need | yes | HTMLElement | set | I+ Omit<CPWR<Button>> (resolves any) | pass | n/a | child | omit | CopyButtonVariant | via:Button | — (onCopied) | data-copied | via Button | via Button | via Button | ds | css-literal + js (REVERT_MS) | none | — | own | named | U4 |
| A | 1 | Calendar | Calendar/Calendar.tsx | L1·need | no | none | set | T+ union (no DOM base) | last | closed | NONE | — | DatePickerMode | — | selected/onSelect; month/onMonthChange | data-mode | n/a | n/a | — | utils+ds | — | none | — | own | named | U7 |
| A | 1 | CalendarGrid | Calendar/CalendarGrid.tsx | L1·need | yes | Div | set | T+ closed (no DOM base) | last | closed | NONE | — | — | — | parent-controlled | data-* + JS classes | state | visible | role-comp | utils | — | none | — | family | named | U7 |
| A | 1 | CalendarCaption | Calendar/CalendarCaption.tsx | L1·need | no | none | set | T+ closed | last | closed | NONE | — | — (consumes Button/TextDropdown consts) | — | viewMonth/onMonthChange | — | via Button | via Button | role-comp | utils | — | none | — | family | named | U7 |
| A | 1 | CalendarPresetsPanel | Calendar/CalendarPresetsPanel.tsx | L1·need | yes | Div | set | T+ CPWR<"div"> | last | n/a | root | — | — | — | — | — | n/a | n/a | — | utils+ds | — | none | — | family | named | U7 |
| A | 1 | CalendarPresetItem | Calendar/CalendarPresetsPanel.tsx | L1·need | yes | Button | set | T+ Omit<CPWR<"button">> | last | n/a | root | — | — | — | selected/onSelect | data-active + JS class | radix-data (on native button) | visible | role-comp + ts-class | utils | tw-dur | none | — | family | named | U7 |
| A | 1 | Checkbox | Checkbox/Checkbox.tsx | L18·not | yes | CR | set | I+ CPWR<P> + VariantProps<cva> | last | n/a | radix | radix | CheckboxVariant, CheckboxChecked | cva·exp | checked/defaultChecked/onCheckedChange | radix | radix-data | visible + shadow (active) | n/a | utils | tw-dur | none | S | own | named | U6 |
| A | 1 | CheckboxIndicator | Checkbox/Checkbox.tsx | L18·not | yes | CR | set | inline CPWR<P> | last | n/a | radix | radix | — | — | — | group-data | n/a | n/a | n/a | utils+num | — | none | S (file) | none | named | U6 |
| A | 1 | DatePicker | DatePicker/DatePicker.tsx | L1·need | no | none | set | T+ union | pass | closed | NONE | — | DatePickerMode | — | value/onChange; open/onOpenChange (hand-rolled, no defaultOpen) | — | JS (triggerDisabled) | via trigger | — | utils | via Popover | none | — | own | named | U7 |
| A | 1 | DatePickerTrigger | DatePicker/DatePickerTrigger.tsx | L1·not | yes | Button | set | T+ Omit<CPWR<"button">> union | last | n/a | child | — | DatePickerMode | — | value (display only) | radix | via DropdownTrigger | on-open + visible | role-comp | utils+ds | via DropdownTrigger | none | — | family | named | U7 |
| A | 1 | DatePickerSplitTrigger | DatePicker/DatePickerSplitTrigger.tsx | L1·need | yes | Div | set | T+ Omit<CPWR<"div">> | last | n/a | root | — | — (consumes Segmented/Tab consts) | — | value/onSelect | JS class (disabled) | JS | via children | role-comp | utils+ds+arb variant | via children | none | — | family | named | U7 |
| A | 1 | DropdownCaret | DropdownCaret/DropdownCaret.tsx | —·NEED | no | none | — | I+ closed (variant, className) | last | closed | NONE | — | DropdownCaretVariant | hand:map | — | css host selectors | css host | n/a | n/a | ds | css-token | css host ancestor (R7.3 group, ok) | S | own | named | U5 |
| A | 1 | DropdownTrigger | DropdownTrigger/DropdownTrigger.tsx | L1·need | yes+cast | HTMLElement | set(base) | T+ poly | last | n/a | root | Slot·THROWS | — | — | — | css pseudo | state | visible | ts-class | utils+ds+num | tw-dur | none | — | own | named | U5 |
| A | 1 | DropdownTriggerContent | DropdownTrigger/DropdownTrigger.tsx | L1·need | yes | Div | set | T+ CPWR<"div"> | last | n/a | root | — | — | — | — | — | n/a | n/a | — | utils | — | none | — | own | named | U5 |
| A | 1 | TypeableDropdownTrigger | DropdownTrigger/DropdownTrigger.tsx | L1·need | yes | Div | set | T+ Pick<input props> | last | n/a | root | — | DropdownCaretVariant (internal) | hand:ternary | value/defaultValue/onChange (native) + displayValue | radix + focus-within + JS ternary | JS + state (input) + opacity-disabled (icon) | within + on-open | ts-class | utils+ds+num | tw-dur | none | — (block comment) | own | named | U5 |
| A | 1 | TextDropdownTrigger | DropdownTrigger/DropdownTrigger.tsx | L1·need | yes+cast | HTMLElement | set(base) | T+ poly | last | n/a | root | Slot·THROWS | TextDropdownSize | hand:ternary | — | css pseudo | state | visible | ts-class | utils+ds+arb px | tw-dur | none | — | own | named | U5 |
| A | 1 | HotkeyIndicator | HotkeyIndicator/HotkeyIndicator.tsx | —·ok | no | none | — | I+ HTMLAttrs | last | n/a | root | — | — | — | pressed (force state) | JS ternary | — | — | ts-class | utils+arb px+num | tw-dur | none | — | own | named | U5 |
| A | 1 | Input | Input/Input.tsx | L33·need | yes | Input | set | T+ union | last@wrapper (documented) | split (documented) | inner | — | InputVariant | hand:ternary | value/defaultValue/onChange (native) + hasError (hand-rolled) | css pseudo (bare) / JS ternary (wrapper) | state / JS | on-focus + within | ts-class | utils+ds | tw-dur | none | S | own | named | U6 |
| A | 1 | LinearProgressIndicator | LinearProgressIndicator/LinearProgressIndicator.tsx | L1·not | yes | CR | set | I+ CPWR<P> | last | pw (vars win) | radix | — | — (DsColor open value) | — | value/max | data-hidden | n/a | n/a | n/a | utils+ds+raw var+arb px | css-literal | none | S (below directive) | own | named | U9 |
| A | 1 | LoadingSpinner | LoadingSpinner/LoadingSpinner.tsx | L1·need | yes | SVG | set | T+ Omit<CPWR<"svg">> | last (no base) | cw | inner | — | LoadingSpinnerVariant/Color/Size | hand:switch | — | — | n/a | n/a | n/a | inline var + private colour table | js | none | — | own | NO-INDEX | U9 |
| A | 1 | DropdownMenu | Menu/DropdownMenu.tsx | L1·need | no (root, no DOM) | n/a | — (fn DropdownMenuRoot) | inline CPWR<Root> + selectType | n/a | n/a | radix | n/a | DropdownMenuSelectType | — | open/defaultOpen/onOpenChange (radix) | — | n/a | n/a | n/a | n/a | — | none | S | own | named | U5 |
| A | 1 | DropdownMenuTrigger | Menu/DropdownMenu.tsx | L1·need | yes | CR | set | inline CPWR<P> | none | n/a | radix | radix | — | — | — | data-select-type | n/a | n/a | n/a | n/a | — | none | S (file) | own | named | U5 |
| R | 4 | DropdownMenuPortal / Group / Sub / RadioGroup | Menu/DropdownMenu.tsx | L1·need (module) | alias | n/a | radix | radix | n/a | n/a | radix | radix | — | — | radix | — | n/a | n/a | n/a | n/a | — | none | S (file) | partial | named | U5 |
| A | 1 | DropdownMenuContent | Menu/DropdownMenu.tsx | L1·need | yes | CR | set | inline CPWR<P> + 6 DS props | last | n/a | radix | — | — | — | portal/portalProps | radix | n/a | n/a | — | utils+ds | tw-dur | document.hasFocus at event time (ok) | S (file) | own | named | U5 |
| A | 1 | DropdownMenuItem | Menu/DropdownMenu.tsx | L1·need | yes | CR | set | inline CPWR<P> + variant | last | n/a | radix | — | DropdownMenuItemVariant | hand:&& | — | radix | radix-data | outline-none (highlight is cue) | ts-class | utils+ds | tw-dur | none | S (file) | own | named | U5 |
| A | 1 | DropdownMenuMultiSelectItem | Menu/DropdownMenu.tsx | L1·need | yes | CR | set | inline CPWR<P> | last | n/a | radix | — | — | — | checked/onCheckedChange (radix) | radix | radix-data | n/a | ts-class | utils | tw-dur | none | S (file) | own | named | U5 |
| A | 1 | DropdownMenuRadioSelectItem | Menu/DropdownMenu.tsx | L1·need | yes | CR | set | inline CPWR<P> | last | n/a | radix | — | — | — | via RadioGroup value/onValueChange | radix | radix-data | n/a | ts-class | utils | tw-dur | none | S (file) | own | named | U5 |
| A | 1 | DropdownMenuLabel | Menu/DropdownMenu.tsx | L1·need | yes | CR | set | inline CPWR<P> | last | n/a | radix | — | — | — | — | — | n/a | n/a | ts-class | utils+arb px | — | none | S (file) | own | named | U5 |
| A | 1 | DropdownMenuSeparator | Menu/DropdownMenu.tsx | L1·need | yes | CR | set | inline CPWR<P> | last | n/a | radix | — | — | — | — | — | n/a | n/a | n/a | utils | — | none | S (file) | own | named | U5 |
| A | 1 | DropdownMenuPlainItem | Menu/DropdownMenu.tsx | L1·need | yes | Div | set | inline HTMLAttrs | last | n/a | root | — | — | — | — | — | n/a | n/a | ts-class | utils+ds | — | none | S (file) | own | named | U5 |
| A | 1 | DropdownMenuSegment | Menu/DropdownMenu.tsx | L1·need | yes | Div | set | I+ HTMLAttrs | last | n/a | root | — | DropdownMenuSegmentVariant | hand:render switch | — | — | n/a | n/a | via Label | utils+ds | — | none | S (file) | own | named | U5 |
| A | 1 | DropdownMenuSection | Menu/DropdownMenu.tsx | L1·need | yes | Div | set | I+ HTMLAttrs | last | pw (width prop wins) | root | — | — (open-value width) | — | — | — | n/a | n/a | — | ds | — | none | S (file) | own | named | U5 |
| A | 1 | DropdownMenuSearch | Menu/DropdownMenuSearch.tsx | L15·need | yes | Input | set | I+ Omit<InputHTMLAttrs> | last@wrapper | split | inner | — | — | — | native value/defaultValue | — | none | outline-none (no ring) | ts-class | utils+ds+[&_kbd] | — | none | S | own | named | U5 |
| R | 4 | Modal / ModalTrigger / ModalPortal / ModalClose | Modal/Modal.tsx | L1·not (module) | alias | n/a | radix | radix | n/a | n/a | radix | radix | — | — | radix | — | n/a | n/a | n/a | n/a | — | none | — | partial | star | U8 |
| A | 1 | ModalOverlay | Modal/Modal.tsx | L1·not | yes | CR | set | inline CPWR<P> | last | n/a | radix | radix | — | — | — | radix | n/a | n/a | n/a | utils | tw-dur | none | — | family | star | U8 |
| A | 1 | ModalContent | Modal/Modal.tsx | L1·not | yes | CR | set | inline CPWR<P> + withOverlay | last | n/a | radix | radix | — | — | withOverlay | radix | n/a | outline-none (focus-visible) | n/a | utils | tw-dur | none | — | own | star | U8 |
| A | 1 | ModalTitle | Modal/Modal.tsx | L1·not | yes | CR | set | inline CPWR<P> | last | n/a | radix | radix | — | — | — | — | n/a | n/a | ts-class | utils | — | none | — | own | star | U8 |
| A | 1 | ModalDescription | Modal/Modal.tsx | L1·not | yes | CR | set | inline CPWR<P> | last | n/a | radix | radix | — | — | — | — | n/a | n/a | ts-class | utils | — | none | — | own | star | U8 |
| A | 1 | MorphRotationShape | MorphRotationShape/MorphRotationShape.tsx | L54·need | no | none | — | T+ Omit<CPWR<"span">> union | last | cw | root | — | MorphRotationShapeMode | — | activeIndex/onStepComplete (mode) | data-mode | n/a | n/a | n/a | ds + inline vars | css-token | none | S | own | named | U10 |
| A | 1 | OutlineButton | OutlineButton/OutlineButton.tsx | L1·need | yes+cast | HTMLElement | set(base) | T+ poly | last@wrapper | split (style → inner) | inner | Slot·THROWS | — | hand:ternary | glowing (force state) | group-* + inline vars | state | visible | ts-class | utils+ds+arb px+inline design values | inline + tw-dur | none (own rect) | — | own | star | U4 |
| A | 1 | OutlineSection | OutlineSection/OutlineSection.tsx | —·ok | yes | Div | set | I+ HTMLAttrs (empty) | last | n/a | root | — | — | — | — | — | — | — | — | utils+ds+arb px | — | none | — | own | star | U12 |
| R | 5 | Popover / PopoverTrigger / PopoverAnchor / PopoverPortal / PopoverClose | Popover/Popover.tsx | L1·not (module) | alias | n/a | radix | radix | n/a | n/a | radix | radix | — | — | radix | — | n/a | n/a | n/a | n/a | — | none | — | partial | named | U7 |
| A | 1 | PopoverContent | Popover/Popover.tsx | L1·not | yes | CR | set | T+ CPWR<P> + portal/portalProps | last | n/a | radix | radix | — | — | portal/portalProps | radix | n/a | n/a | — | utils+ds | tw-animate (no reduced motion) | none | — | own | named | U7 |
| A | 1 | ProgressIndicator | ProgressIndicator/ProgressIndicator.tsx | —·ok | yes | SVG | set | T+ Omit<CPWR<"svg">> | last (no base) | cw | inner | — | ProgressIndicatorVariants + LoadingSpinnerColor/Size | hand:switch | progress (controlled only) | — | n/a | n/a | n/a | inline var + private colour table | js (inline 300ms) | none | — | own | NO-INDEX | U9 |
| A | 1 | SearchBox | SearchBox/SearchBox.tsx | L1·not | yes | Input | set | I+ InputHTMLAttrs | last@wrapper | split | inner | — | — | — | native value | css hover/focus-within | none | within | ts-class | utils+ds+num+svg px | tw-dur | none | — | own | star | U5 |
| A | 1 | SegmentedTabSelect | SegmentedTabSelect/SegmentedTabSelect.tsx | L1·need | yes | CR | set | I+ CPWR<P> + const-typed | last@inner List | split (style → Root) | radix | — | SegmentedVariant, SegmentedSize | hand:map | value/defaultValue/onValueChange (radix) | via items | none | none | — | utils+ds | — | none | — | own | named | U6 |
| A | 1 | SegmentedTabItem | SegmentedTabSelect/SegmentedTabSelect.tsx | L1·need | yes | CR | set | I+ extends TabsTriggerProps (empty) | pass | n/a | child | — | via context | via:TabsTrigger | radix value | radix | control | visible | ts-class | utils+ds | tw-dur | none | — | own | named | U6 |
| A | 1 | ShapeButton | ShapeButton/ShapeButton.tsx | L18·not | yes+cast | HTMLElement | set(base) | T+ poly | last | n/a | root | Slot·THROWS | ShapeButtons, ShapeButtonVariant | hand:map (satisfies) | — | group-* | state (no aria-disabled) | own (ds-shape-button-focus-visible) | — | utils+ds+arb px+JS size | css-literal | none | S | own | star | U4 |
| A | 1 | ShapeMorphSpinner | ShapeMorphSpinner/ShapeMorphSpinner.tsx | —·NEED | no | none | — | T+ Omit<CPWR<"span">> | last | cw | child | — | SHAPE_MORPH_SPINNER_SHAPES + LoadingSpinnerSize/Color (reused) | — | — | data-mode (via MRS) | n/a | n/a | n/a | inline var + private colour table | css-token (via MRS) | none | prose | own | named | U9 |
| R | 4 | Sheet / SheetTrigger / SheetPortal / SheetClose | Sheet/Sheet.tsx | L1·not (module) | alias | n/a | radix | radix | n/a | n/a | radix | radix | — | — | radix | — | n/a | n/a | n/a | n/a | — | none | — | partial | star | U8 |
| A | 1 | SheetOverlay | Sheet/Sheet.tsx | L1·not | yes | CR | set | inline CPWR<P> | last | n/a | radix | radix | — | — | — | radix | n/a | n/a | n/a | utils | tw-dur | none | — | family | star | U8 |
| A | 1 | SheetContent | Sheet/Sheet.tsx | L1·not | yes | CR | set | inline CPWR<P> + VariantProps<cva> + withOverlay | last | n/a | radix | radix | SheetSide | cva·int | side, withOverlay | radix | n/a | outline-none (focus-visible) | n/a | utils+arb | tw-dur + arb cubic-bezier | none | — | own | star | U8 |
| A | 1 | SheetTitle | Sheet/Sheet.tsx | L1·not | yes | CR | set | inline CPWR<P> | last | n/a | radix | radix | — | — | — | — | n/a | n/a | ts-class | utils | — | none | — | own | star | U8 |
| A | 1 | SheetDescription | Sheet/Sheet.tsx | L1·not | yes | CR | set | inline CPWR<P> | last | n/a | radix | radix | — | — | — | — | n/a | n/a | ts-class | utils | — | none | — | own | star | U8 |
| A | 1 | SidebarWithHoverIcon | SidebarWithHoverIcon/SidebarWithHoverIcon.tsx | L40·need | no | none | — | I+ extends IconProps (closed) | pass | closed | child | — | SidebarIconSide | — | hovered (force state) | — | n/a | n/a | n/a | ds + inline vars | css-token | none | S | own | named | U10 |
| A | 1 | SliderContinuous | Slider/Slider.tsx | L1·need | yes | CR | set | shared:SliderProps (T+) | last@wrapper | pw + split (defaults win; style → Root) | radix | — | SliderVariant | hand:map | value/defaultValue/onValueChange/onValueCommit (radix) | data-* + JS class | radix-data | visible | n/a | utils+ds+raw var | css-literal | none (CSS targets Radix thumb wrapper) | — | own | named | U6 |
| A | 1 | SliderStepped | Slider/Slider.tsx | L1·need | yes | CR | set | shared:SliderProps (T+) | last@wrapper | pw + split | radix | — | SliderVariant | hand:map | as SliderContinuous | data-* + JS class | radix-data | visible | n/a | utils+ds+raw var | css-literal | none | — | own | named | U6 |
| A | 1 | SliderLabeled | Slider/Slider.tsx | L1·need | yes | CR | set | T+ SliderProps & labels | last@wrapper | pw + split | child | — | SliderVariant | hand:map | as SliderContinuous | data-* + JS class | radix-data | visible | role-comp | utils+ds+raw var | css-literal | none | — | own | named | U6 |
| A | 1 | SplitButton | SplitButton/SplitButton.tsx | L1·not | no | none | — | I+ closed (no HTML base) | last | closed | NONE | — | — | — | disabled fan-out | via parts | via parts | via parts | via parts | utils | via parts | none | — | own | named | U4 |
| A | 1 | SplitButtonAction | SplitButton/SplitButton.tsx | L1·not | yes | Button | set | I+ ButtonHTMLAttrs | last | n/a | root | — | — | hand (dup of Button secondary) | — | css hover:enabled/disabled: | state | visible | ts-class | utils+ds+num+arb px | tw-dur | none | — | family | named | U4 |
| A | 1 | SplitButtonTrigger | SplitButton/SplitButton.tsx | L1·not | yes | Button | set | I+ ButtonHTMLAttrs (empty) | last | n/a | root | — | — | hand (dup of Button secondary) | — | css hover:enabled/disabled: | state | visible | — | utils | tw-dur | none | — | family | named | U4 |
| A | 1 | Sticker | Sticker/Sticker.tsx | —·ok | yes | Div | set (base + public both "Sticker") | T+ union & Omit<HTMLAttrs> | last | pw (custom paints win) | root | — | StickerVariant, StickerSize | cva·exp | — | — | — | — | ts-class | utils + inline color-mix | — | none | S | own | named | U12 |
| A | 1 | Table | Table/Table.tsx | —·ok | yes | Div | set | I+ HTMLAttrs | last | cw | root | — | — | — | — | — | — | — | — | utils + inline vars | — | none | // note | own | named | U12 |
| A | 1 | TableHeader | Table/Table.tsx | —·ok | yes | Div | set | inline HTMLAttrs | last | CLOBBER | root | — | — | — | — | — | — | — | — | utils + inline var | — | none | — | own | named | U12 |
| A | 1 | TableHeaderCell | Table/Table.tsx | —·ok | yes | Div | set | I+ HTMLAttrs | last | n/a | root (wrapper div; sortable Button unreachable) | — | TableSortDirection | — | sortDirection/onSort (controlled only) | JS (icon swap) | none | via Button | role-comp (sortable branch only) | utils+num | via Button | none | — | own | named | U12 |
| A | 1 | TableRow | Table/Table.tsx | —·ok | yes | Div | set | inline HTMLAttrs | last | CLOBBER | root | — | — | — | — | css hover | — | — | — | utils + inline var | tw-dur | none | — | own | named | U12 |
| A | 1 | TableCell | Table/Table.tsx | —·ok | yes | Div | set | inline HTMLAttrs | last | n/a | root | — | — | — | — | — | — | — | — | utils+num | — | none | — | own | named | U12 |
| A | 1 | TablePlaceholder | Table/Table.tsx | —·ok | yes | Div | set | inline HTMLAttrs | last | n/a | root | — | — | — | — | — | — | — | — | utils+num | — | none | — | own | named | U12 |
| R | 1 | Tabs | Tabs/Tabs.tsx | L1·not (module) | alias | n/a | radix | radix | n/a | n/a | radix | radix | — | — | value/defaultValue/onValueChange (radix) | — | n/a | n/a | n/a | n/a | — | none | — | own | named | U6 |
| A | 1 | TabsList | Tabs/Tabs.tsx | L1·not | yes | CR | set | inline CPWR<P> | last | n/a | radix | radix | — | — | — | — | n/a | n/a | n/a | utils+num | — | none | — | own | named | U6 |
| A | 1 | TabsTrigger | Tabs/Tabs.tsx | L1·not | yes | CR | set | I+ CPWR<P> + VariantProps<cva> | last | n/a | radix | radix | TabVariant, TabSize (not used for prop type) | cva·exp (alias of toggleOptionVariants) | radix value | radix | control | visible | ts-class | utils+ds | tw-dur | none | S (toggleOption.ts) | own | named | U6 |
| A | 1 | TabsContent | Tabs/Tabs.tsx | L1·not | yes | CR | set | inline CPWR<P> | last | n/a | radix | radix | — | — | — | — | n/a | outline-none (no replacement) | n/a | utils | — | none | — | own | named | U6 |
| A | 1 | BaseText | Text/BaseText.tsx | —·ok | yes+cast | HTMLElement | set(base) | T+ poly | last | cw (documented) | root | as (polymorphic) | TextVariant, Fonts, FontSizes, FontWeights, Tracking, FontAxes | — | — | — | n/a | n/a | defines role | inline var consts | — | none | — (JSDoc) | own | named | U3 |
| A | 10 | ButtonText, HeadingText, SubheadingText, HeroText, TitleText, BodyText, HeroBodyText, HeroButtonText, LabelText, MonoText | Text/BaseText.tsx | —·ok | yes (factory) | HTMLElement | factory | T+ RoleTextProps alias | via BaseText | cw (via BaseText) | root | as (polymorphic) | TextVariant (fixed) | — | — | — | n/a | n/a | ts-class (role) | via BaseText | — | none | — | own | named | U3 |
| A | 1 | TextLink | TextLink/TextLink.tsx | —·ok | yes | Anchor | set | I+ AnchorHTMLAttrs + asChild | last | n/a | root | Slot | — | — | — | css hover:/active: | — | visible | ts-class | utils | tw-dur | none | — | own | named | U3 |
| A | 1 | ToastRoot | Toast/Toast.tsx | L1·need | yes | CR | set | I+ CPWR<P> + variant | last | n/a | radix | radix | ToastTypes | cva·int | open/defaultOpen/onOpenChange (radix), duration | radix + swipe | — | — | — | utils+ds+arb px+num | tw-dur | none | — | family | named | U8 |
| A | 1 | ToastViewport | Toast/Toast.tsx | L1·need | yes | CR | set | inline CPWR<P> | last | n/a | radix | radix | — | — | — | — | — | outline-none | — | utils+ds | — | none | — | family | named | U8 |
| A | 1 | ToastTitle | Toast/Toast.tsx | L1·need | yes | HTMLElement | set | T+ Omit<BaseTextProps> | pass | n/a | child | radix (wraps in Title asChild) | — | — | — | JS ternary (in provider) | — | — | BaseText | — | — | none | — | family | named | U8 |
| A | 1 | ToastDescription | Toast/Toast.tsx | L1·need | yes | HTMLElement | set | T+ Omit<BaseTextProps> | last | n/a | child | radix (wraps in Description asChild) | — | — | — | JS ternary (in provider) | — | — | BaseText | — | — | none | — | family | named | U8 |
| A | 1 | ToastAction | Toast/Toast.tsx | L1·need | yes | CR | set | inline CPWR<P> | last | n/a | radix | radix | ButtonVariant/Size (internal) | via:buttonVariants | — | css (Button) | state (via buttonVariants) | visible (via buttonVariants) | ts-class (via buttonVariants) | via buttonVariants | tw-dur | none | — | family | named | U8 |
| A | 1 | ToastClose | Toast/Toast.tsx | L1·need | yes | CR | set | inline CPWR<P> | last | n/a | radix | radix | ButtonVariant/Size (internal) | via:buttonVariants | — | — | state (via buttonVariants) | visible (via buttonVariants) | — | via buttonVariants | — | none | — | family | named | U8 |
| A | 1 | ToastProvider | Toast/Toast.tsx | L1·need | no | none | — | I+ CPWR<Provider> + viewportProps | n/a | n/a | radix | n/a | ToastTypes | — | internal queue; duration prop dead | JS ternary (colour) | — | — | — | — | js (setTimeout mirrors CSS) | none | — | own | named | U8 |
| A | 1 | ToggleSwitch | Toggle/Toggle.tsx | L1·need | yes | CR | set | I+ Omit<CPWR<P>> + const-typed | last | n/a | radix | — | ToggleVariant, ToggleSize | — | value/defaultValue/onValueChange (hand-rolled) | n/a | none | none | — | utils | — | none (context) | S (header below directive) | own | named | U6 |
| A | 1 | ToggleSwitchItem | Toggle/Toggle.tsx | L1·need | yes | CR | set | I+ CPWR<P> + const-typed | last | n/a | radix | — | ToggleVariant, ToggleSize | cva·int (toggleOptionVariants) | radix value | radix (selected:/unselected:) | control | visible + border | ts-class | utils+ds | tw-dur | none (context) | S | own | named | U6 |
| R | 2 | Tooltip / TooltipTrigger | Tooltip/Tooltip.tsx | L1·not (module) | alias | n/a | radix | radix | n/a | n/a | radix | radix | — | — | radix | — | n/a | n/a | n/a | n/a | — | none | — | own | named | U8 |
| A | 1 | TooltipProvider | Tooltip/Tooltip.tsx | L1·not | no (no DOM) | n/a | — (arrow) | inline CPWR<Provider> | n/a | n/a | radix | n/a | — | — | — | — | n/a | n/a | n/a | n/a | — | none | — | decorator only | named | U8 |
| A | 1 | TooltipContent | Tooltip/Tooltip.tsx | L1·not | yes | CR | set | I+ CPWR<P> | last | n/a | radix | radix | TooltipTypes | hand:&& | portal/portalProps/themeInverse | radix | n/a | outline-none (non-focusable) | ts-class | utils+ds+num | tw-dur | none | — | own | named | U8 |
| A | 1 | TooltipTitle | Tooltip/Tooltip.tsx | L1·not | yes | HTMLElement | set | T+ Omit<BaseTextProps> | pass | n/a | child | as (BaseText) | — | — | — | — | n/a | n/a | BaseText | — | — | none | — | own | named | U8 |
| A | 1 | TooltipBody | Tooltip/Tooltip.tsx | L1·not | yes | HTMLElement | set | T+ Omit<BaseTextProps> | pass (className={className}) | n/a | child | as (BaseText) | — | — | — | — | n/a | n/a | BaseText | — | — | none | — | own | named | U8 |
| A | 1 | VerificationCodeInput | VerificationCode/VerificationCodeInput.tsx | L15·need | yes | Div | set | I+ Omit<HTMLAttrs> | last | n/a | root | — | — | — | value/defaultValue/onChange(string) (hand-rolled) | via cells | JS (fan-out to cells) | via cells | via cells | utils | — | none | S | own | named | U6 |
| A | 1 | CodeDigitInput | VerificationCode/CodeDigitInput.tsx | L15·not | yes | Input | set | I+ Omit<InputHTMLAttrs> | last@wrapper | split | inner | — | — | — | value + native onChange + hasError | JS ternary (data-* emitted, unread) | state (on a div: inert) | shadow (focus-within) | BaseText fontSize + raw text-[18px] | utils+arb px | tw-dur | none | S | own | named | U6 |
| A | 1 | WavyDivider | WavyDivider/WavyDivider.tsx | —·ok | yes | SVG | set | T+ Omit<CPWR<"svg">> | last | n/a | root | — | WavyDividerVariant | hand:switch | — | — | n/a | n/a | n/a | currentColor + JS geometry | — | none | — (JSDoc) | own | NO-INDEX | U9 |
| L | 1 | BaseIcon | Icons/BaseIcon.tsx | —·ok | no | none | — | I+ IconProps (closed; name ≠ BaseIconProps) | last | closed | NONE | — | IconSizes (in .tsx; aliased IconSize by generator) | — | — | — | n/a | n/a | n/a | inline var | — | none | — (JSDoc) | own | generated | U10 |
| L | 88 | 88 icon leaves (4 file templates) | Icons/*Icon.tsx | —·ok | no | none | — | shared:IconProps | via BaseIcon | closed | child (BaseIcon, closed) | — | — | — | — | — | n/a | n/a | n/a | none | — | none | — | 16/88 in stories | generated | U10 |
| L | 2 | BaseShape, ShapeClipPath | Shapes/BaseShape.tsx | —·ok | no | none | — | local type, not exported (ShapeProps exported) | none (no className) | closed | NONE | — | SHAPE_VIEWBOX_SIZE | — | — | — | n/a | n/a | n/a | — | — | none | — | family | star+decl | U10 |
| L | 12 | 12 shape leaves (3 render bodies) | Shapes/*Shape.tsx | —·ok | no | none | — | shared:ShapeProps | none (no className) | closed | NONE | — | <NAME>_SHAPE_PATH; Shapes (in index.ts) | — | — | — | n/a | n/a | n/a | raw colour strings | — | none | — | family | star+decl | U10 |

## 2. Per-column analysis

Counts are over population A (122 authored components, weighted), from `node scratch/HB/render.cjs counts`, unless stated. "JUSTIFIED" names the rule or header that sanctions an outlier. "DRIFT" means no rule or header does; its owning finding is given (a unit finding, or an HB finding in §3).

### 2.1 `"use client"` (present / needed)

- Component level (A): present·needed **55**, absent·ok **37**, present·NOT-needed **27**, absent·NEEDED **2**, absent·borderline **1**.
- Module level (from U2 §2, re-checked): 40 source modules declare the directive. 27 need it under U2's criterion and 13 do not (U2-F2). U2 found that 0 of the 212 neutral modules need it. HB disagrees for one module (below).
- **Dominant pattern: none.** Three criteria for "needed" are in use, and the matrix shows the result:
  1. R8.21 as written (contrib:71): `useState`/`useEffect`/`useRef`, a browser API, or a timer.
  2. U2's scan (U2 §2 "Method") adds context hooks, `useLayoutEffect` and closures attached to host elements. U7-F15 argues the rule needs that extension.
  3. U9-F1 / U11-F5 add any function value (a component reference or a closure) that the module passes to a client component. React Flight cannot serialize functions. Under criterion 2 these modules count as neutral, so U2's table lists DropdownCaret and ShapeMorphSpinner as "neutral ... use no client-only API".
- Outliers:
  - present·NOT-needed (13 modules / 27 components): Button, Checkbox(+Indicator), ShapeButton, CodeDigitInput, Modal (4 authored), Popover(Content), Sheet (4), Tooltip (Provider/Content/Title/Body), Tabs (3), SearchBox, SplitButton (3), LinearProgressIndicator, DatePickerTrigger. **DRIFT** per R8.21. Already owned as one cross-cutting finding: **U2-F2** (+ U4-F8, U6-F20, U8-F16, U9-F16).
  - absent·NEEDED: **ShapeMorphSpinner** (U9-F1). **DropdownCaret is NEW, filed by no unit.** U5's fingerprint says "no / no (MorphRotationShape carries its own)". Spot-check:
    `src/components/DropdownCaret/DropdownCaret.tsx:1` `/*` (no directive in the file; `:25-31` imports)
    `DropdownCaret.tsx:34-37` `const CARET_SHAPES = { dropdown: [SquircleShape, PixircleShape], typeable: [CloverShape, PuffShape], } satisfies …`
    `DropdownCaret.tsx:52-55` `<MorphRotationShape mode={MorphRotationShapeMode.embedded} shapes={CARET_SHAPES[variant]} …`
    `../dooph-ds-audit-build/dist/chunk-FDLT5UZN.js:1-3` `import { MorphRotationShape } from "./chunk-PWLXGSXJ.js";` (no directive) and `:51` `shapes: CARET_SHAPES[variant],`
    The usage skill tells consumers to render it themselves (`skills/dooph-design-system-usage/SKILL.md:211` "a custom trigger adds the `ds-dropdown-caret-host` class to its root"). → **HB-F1**.
  - absent·borderline: AIThinkingEffortSelector (AIModelSelect.tsx:167 `onValueChange={([next]) => {` closure into client `SliderLabeled`). U2 argues that its required `onValueChange` function prop means every caller is already a client module, so a server render can never reach it. HB agrees: **JUSTIFIED in practice**, owned by U11-F5.
- Placement (directive vs header contract): 16 modules put the contract first and the directive below it, as R11.9 requires. All 16 are unstamped in dist (U2-F1, owner; U6-F28). Three put the directive on line 1 above the contract, against R11.9: `Menu/DropdownMenu.tsx:1`, `LinearProgressIndicator.tsx:1`, `Toggle/Toggle.tsx:1`. Those three are stamped. Already owned (U2-F1, U6-F28, U5-F11, U9-F16). It is the R11.9 ↔ `add-use-client.mjs` conflict, not a new HB item.
- Newcomer: copying CTAButton teaches "never mark a forwardRef wrapper", copying Button teaches "always mark", and copying DropdownCaret teaches that handing component functions to a client child is server-safe.

### 2.2 forwardRef

- **Dominant: forwardRef 110/122** (103 plain + 7 forwardRef-then-cast polymorphic bases: Button, BaseText, RollingDigitsText, DropdownTrigger, TextDropdownTrigger, OutlineButton, ShapeButton). R aliases: 20/20 n/a. L leaves: 0/103, a template decision (U10-F7).
- 12 outliers:
  - **JUSTIFIED (render no DOM element of their own):** `DropdownMenu` (Menu/DropdownMenu.tsx:54 `function DropdownMenuRoot({`, the Radix Root), `TooltipProvider` (Tooltip.tsx:24, the Provider), `ToastProvider` (Toast.tsx:204, Provider + Viewport). R8.5 covers "every wrapped Radix part" that renders an element.
  - **DRIFT, owned:** `Calendar` (Calendar.tsx:124 `function Calendar(props: CalendarProps) {`) and `CalendarCaption` (CalendarCaption.tsx:30) render a `<div>` root with no ref and no rest; `DatePicker` (DatePicker.tsx:53) has no trigger/content pass-through. All three → U7-F8. `ShapeMorphSpinner` (ShapeMorphSpinner.tsx:47 `export const ShapeMorphSpinner = ({`) → U9-F14. `SidebarWithHoverIcon` (SidebarWithHoverIcon.tsx:83) → U10-F7.
  - **DRIFT, unowned:**
    - `HotkeyIndicator` (HotkeyIndicator.tsx:9 `function HotkeyIndicator({ keys, pressed = false, className, ...props }: HotkeyIndicatorProps)`). Under React ≥19 (package.json:58) a ref reaches the span at runtime through `...props`, but `HotkeyIndicatorProps extends HTMLAttributes<HTMLSpanElement>` has no `ref`, so `ref=` fails to type-check.
    - `DropdownCaret` (DropdownCaret.tsx:44, props `{ variant, className }` only).
    - `SplitButton` (SplitButton.tsx:80): its group `<div>` takes no ref.
    - `MorphRotationShape` (MorphRotationShape.tsx:165, not forwardRef). It keeps a private `spanRef` and then spreads the rest after it: `:343` `ref={spanRef}` … `:348` `{...spanProps}`. Under React 19 a ref injected by a Radix `Slot` (e.g. `<TooltipTrigger asChild><MorphRotationShape …/></TooltipTrigger>`) arrives in `spanProps` and replaces `spanRef`. Then `:301-302` `const span = spanRef.current; if (!span) return;` skips the listener setup and `:270-273` ends the sampling loop, so the morph never animates, silently. This is reasoning from the code; it was not executed.
  → **HB-F2** (with the `...props` column, §2.8).

### 2.3 ref type helper

- 110 forwardRef components: concrete `HTML*Element`/`SVGSVGElement` **53**, `ComponentRef<typeof Primitive.X>` **34**, generic `HTMLElement` **21**, `ComponentRef<typeof DsComponent>` **2**.
- `ElementRef`: **0** (`rg -n ElementRef src` → no hits; R8.15 ✓).
- Every Radix-wrapping forwardRef uses `ComponentRef`, including LinearProgressIndicator, SegmentedTabSelect, Slider×3 and Toggle×2. Every plain-DOM forwardRef uses its concrete element. `HTMLElement` appears only on polymorphic/cast components and on the four BaseText wrappers (ToastTitle/Description, TooltipTitle/Body), where the element is chosen by `as`. **The pattern follows R2.1/R8.15.**
- Outliers:
  - `CopyButton` `forwardRef<HTMLElement, …>` for an always-`<button>` (CopyButton.tsx:29), and `CTAButton` `HTMLAnchorElement` even under `asChild` → **DRIFT, owned by U4-F12**.
  - Wrapping a DS (non-Radix) component is spelled two ways: `ComponentRef<typeof DsComp>` (AIModelSelectItem, AIModelTooltipContent) vs the concrete element (AIModelSelectTrigger/AIPromptInputSubmit `HTMLButtonElement` over Button; DatePickerTrigger `HTMLButtonElement` over DropdownTrigger; AIContextGauge `SVGSVGElement` over ProgressIndicator). The concrete form is forced where the child is the polymorphic `Button`/`DropdownTrigger`, whose `ComponentRef` would resolve through a generic. **JUSTIFIED** by the child's type. No cost found. No finding.

### 2.4 displayName

- **forwardRef → displayName: 110/110** (`for f in $(grep -rl forwardRef src --include=*.tsx | grep -v stories)`: comparing forwardRef count to `.displayName =` count per file gives 0 mismatches). R8.8 ✓.
- Breakdown: set on the export 96, set on the `*Base` with the public name 7, set by the role factory 10 (`BaseText.tsx:129` `Role.displayName = displayName`).
- Plain-function components: 3/12 set one (`Calendar.displayName` Calendar.tsx:362, CalendarCaption, `DatePicker.displayName` DatePicker.tsx:167); 9 do not. R8.8 only requires it on forwardRef, and a function's own name already shows in devtools. **Cosmetic, no cost → no finding.**
- Name mismatches:
  - `DropdownMenu` shows as `DropdownMenuRoot`, its function name (U5 table).
  - `StickerBase` and public `Sticker` both carry `"Sticker"`, while Slider's internal base is `"SliderBase"` (U12 table). Neither is exported under the other name, so no consumer-visible cost.

### 2.5 props type (name, exported, interface/type, base)

- **Dominant: an exported `<Name>Props` for 90/122** (46 `type` alias, 44 `interface`), plus 4 that reuse another exported type (SliderContinuous/SliderStepped → `SliderProps`; AIPromptInputToolbarStart/End → `AIPromptInputToolbarProps`). `scratch/HB/props.tsv`.
- **28 inline / unnamed:**

  | folder | components |
  |---|---|
  | Checkbox | CheckboxIndicator |
  | Tabs | TabsList, TabsContent |
  | Menu | DropdownMenu, DropdownMenuTrigger, Content, Item, MultiSelectItem, RadioSelectItem, Label, Separator, PlainItem |
  | Modal | ModalOverlay, ModalContent, ModalTitle, ModalDescription |
  | Sheet | SheetOverlay, SheetContent, SheetTitle, SheetDescription |
  | Table | TableHeader, TableRow, TableCell, TablePlaceholder |
  | Toast | ToastAction, ToastClose, ToastViewport |
  | Tooltip | TooltipProvider |

  - **JUSTIFIED (pure pass-through of the primitive's props):** 22 of them, which add no DS prop, so `ComponentPropsWithoutRef<typeof X>` is the whole type.
  - **DRIFT:** 5 add DS-owned props inline that a consumer can only reach by re-deriving the type:
    - `DropdownMenu` (`selectType`, DropdownMenu.tsx:58-60)
    - `DropdownMenuContent` (`dismissOnFocusLoss`, `focusOnOpen`, `matchTriggerWidth`, `onOpenAutoFocus`, `portal`, `portalProps`, :96-105)
    - `DropdownMenuItem` (`variant`, :204-205)
    - `ModalContent` (`withOverlay`, Modal.tsx:59-61)
    - `SheetContent` (`side`, `withOverlay`, Sheet.tsx:122-126)

    The same shape (Radix Content + `portal`/`portalProps`) is named and exported for `PopoverContentProps` (Popover.tsx) and `TooltipContentProps` (Tooltip.tsx:31). → **already filed as HA-F3** (S4 batch). No HB finding.
- `interface` vs `type`: 44 vs 46, mixed inside one folder (AIChat 10/5, AnimatedText 5/2, Toast 2/2, Tooltip 1/2). No rule covers it and no cost found → not a finding.
- Base type for plain DOM: `HTMLAttributes<X>` (AIChat, Avatar, Table, Menu) vs `ComponentPropsWithoutRef<"x">` (Calendar, DatePicker, DropdownTriggerContent). Equivalent for these elements → not a finding.
- Closed props with no DOM base: AIPromptInputSubmit, AIThinkingEffortSelector (U11-F4); SplitButton, DropdownCaret (unowned); Calendar, CalendarGrid, CalendarCaption (U7-F8); IconProps/ShapeProps (U10-F7) → part of **HB-F2**.
- Variant/size props typed from a cva recipe (`VariantProps<typeof …>`) instead of the const: Button.tsx:110, Checkbox.tsx:73, Tabs.tsx:36, Sheet.tsx:123 → **already filed**: HA-F1 (Button, SheetContent) + U6-F14 (Tabs, Checkbox).

### 2.6 className merge

- **Dominant: consumer className last, 119/119 components that accept className** (DropdownMenuTrigger adds no class of its own, so className reaches Radix untouched; the 3 n/a are Root/Provider components): `last` 88, `last@wrapper`/`last@inner` 9, `pass` to a DS child that merges last 11, via BaseText 10. R8.7 ✓ everywhere.
  - facts.tsv flagged `CTAButton` "NOT-last". Spot-read CTAButton.tsx:106-112: `const rootClassName = cn( … isPrimary && "border-2 border-solid border-border-cta", className, );`. That is consumer-last; the flag was a regex false positive.
  - `TooltipBody` passes `className={className}` with no `cn` (Tooltip.tsx:107). BaseText merges it last anyway → no behavioural drift (cosmetic, U8-F14).
- **Outliers: className lands on a different element than `ref`/`...props`**, in 9 components with three different splits:
  - **JUSTIFIED:** `Input` documents "`className` always lands on the chrome element; every other prop, and `ref`, always land on the `<input>`" (Input.tsx:8-9).
  - **DRIFT** (undocumented; each needs a quote here because the split is the defect):
    - `SearchBox` (SearchBox.tsx:24-35 `<div className={cn(…, className)}>` vs :65-73 `<input ref={ref} … {...props} />`)
    - `DropdownMenuSearch` (DropdownMenuSearch.tsx:36-42 destructures `className` for the wrapper `cn(…, className)` vs :64-72 `<input ref={ref} … {...props}`)
    - `CodeDigitInput` (U6-F16)
    - `OutlineButton` (U4-F3)
    - `SliderContinuous`/`SliderStepped`/`SliderLabeled` (U6-F16)
    - `SegmentedTabSelect` (className → inner List, ref/style → Root; U6-F16)
  - Spot-check correction: the U12 table and the first draft of this matrix said `TableHeaderCell` splits too. Re-reading Table.tsx:70-100: className, ref and `...props` all land on the wrapper `<div>`, so it does not split. Its defect is that the interactive Button is unreachable (§2.8).

  → **HB-F3**.

### 2.7 style handling

- **Dominant: the component sets no style, so the consumer's passes through: 74/122.** Of the 41 that set or route `style`, four different behaviours exist:

  | behaviour | count | components (file:line) |
  |---|---|---|
  | merged, **consumer wins** `{...own, ...style}` | 22 | BaseText + 10 roles (BaseText.tsx:93-97), RollHoverText (:54-57), RollChangeText (:64-67), FadeChangeText (:68-71), RevealChangeText (:232-237), UnderlineLinkText (:48-56), MorphRotationShape (:347 `style={{ ...(styleVars as CSSProperties), ...style }}`), ShapeMorphSpinner (:64-68), LoadingSpinner (:194 `style={{ width: cssSize, height: cssSize, ...style }}`), ProgressIndicator (:137, :229), Table (:30-35), AIContextGauge (via ProgressIndicator) |
  | merged, **prop/component wins** `{...style, ...own}` | 7 | LinearProgressIndicator (:48-52 `...style, '--progress-pct': pct, '--ds-progress-color': …`), DropdownMenuSection (DropdownMenu.tsx:395 `style={width === undefined ? style : { ...style, width }}`), Sticker (:120-127 `...style, color: customColor, backgroundColor: …`), AIModelSelectItem (AIModelSelect.tsx:89-95), SliderContinuous/Stepped/Labeled (Slider.tsx:329-341; here the *variant defaults* win, U6-F21) |
  | **CLOBBER** | 3 | TableHeader (Table.tsx:50-51 `style={{ gridTemplateColumns: "var(--table-cols)" }}` then `{...props}`), TableRow (:117-122 same order; U12-F5), AIPromptInputTextarea (`el.style.height` rewritten in a layout effect, AIPromptInput.tsx:192-196) |
  | **split** (style lands on another element than className) | 6 (+3 Sliders) | Input (documented), DropdownMenuSearch, SearchBox, CodeDigitInput, OutlineButton, SegmentedTabSelect (§2.6) |

  Also: 9 `closed` (no `style` accepted; §2.8) and 1 pass-through (`RollingDigitsText` `style={style}`, :274).
- The only written rule on precedence is BaseText.tsx:49-51: "a prop is explicit and must never lose to cascade order … `style` still outranks props, as the last-resort escape hatch". R8.12 says "Merge a consumer's own `style` rather than replacing it" and gives no order.
  - The 22 consumer-wins components follow BaseText.
  - The 7 prop-wins components do the opposite for their explicit props (`width`, `color`, `value`), and Slider does it for non-explicit variant defaults.
  - TableHeader and TableRow drop the merge entirely.
- **DRIFT:** CLOBBER rows → U12-F5. Slider defaults beating consumer style → U6-F21. The precedence split itself → **HB-F4**.
- JUSTIFIED: AIPromptInputTextarea's autosize must own `height` (its header covers autosize). Input's split is documented (Input.tsx:8-9).

### 2.8 `...props` target

- **Dominant: rest props reach the element that owns the component's role, 114/122**: `root` 58, onto the Radix primitive 35, a DS child that forwards them 14, an inner `<input>`/`<button>` 7 (the className-split components of §2.6). LoadingSpinner and ProgressIndicator forward to the variant sub-component's root `<svg>` together with className, which is effectively root.
- **Outliers: 8 components drop or refuse unnamed props (`NONE`)**, with three different shapes:
  - Named-only destructure, the rest silently discarded:
    - `AIPromptInputSubmit` (AIPromptInput.tsx:299 `{ sendLabel = "Send message", stopLabel = "Stop response", className },`)
    - `AIThinkingEffortSelector` (AIModelSelect.tsx:137 `{ steps, value, onValueChange, label, labels, color, className },`)
    - → owned by **U11-F4**
  - Closed props types:
    - `Calendar`, `CalendarGrid`, `CalendarCaption`, `DatePicker` → **U7-F8**
    - `DropdownCaret` (DropdownCaret.tsx:44 `({ variant = DropdownCaretVariant.dropdown, className }: DropdownCaretProps)`) → unowned
    - L: BaseIcon, every icon and shape, `SidebarWithHoverIcon` → **U10-F7**
  - Routed sub-props: `SplitButton` (SplitButton.tsx:80 `function SplitButton({ actionProps, …`; the group `<div>` takes nothing). Partly U4-F16.
- One more reachability gap: `TableHeaderCell` puts `ref`/`...props` on a non-interactive wrapper `<div>` (Table.tsx:74-77). The sortable `<Button>` gets only fixed props (:79-83 `variant={ButtonVariant.text} … className="w-full justify-start gap-1 text-text-primary" onClick={onSort}`), so a consumer's `aria-*`, `onKeyDown` or `disabled` never reach the control (cf. U12-F11 for `aria-sort`).
- Together with §2.2 (12 components with no forwardRef) this is one concern: *can a consumer reach the rendered element?* Five answers are in use: forwardRef + spread (110), React-19 ref-through-spread with no `ref` in the type (HotkeyIndicator), internal ref overridden by the spread (MorphRotationShape), named-only (2), closed (6 + 103 L). → **HB-F2**.

### 2.9 asChild

- Seven components implement `asChild`. They follow three implementation shapes, and four of the seven are broken:
  - **Slot around `children` only**, works (2): Button (Button.tsx:126-131 `const Comp = (asChild ? Slot : "button") …`), TextLink (TextLink.tsx:16-27).
  - **Slot + `cloneElement` to inject internal content**, works (1): CTAButton (CTAButton.tsx:113-124 `{cloneElement(children as ReactElement, undefined, content)}`).
  - **Slot around children + injected siblings**, throws (4): OutlineButton, ShapeButton, DropdownTrigger, TextDropdownTrigger.
- Explicitly omitted (1): CopyButton (CopyButton.tsx:18-21 `Omit<… "variant" | "size" | "children" | "asChild">`).
- Radix's own `asChild` on 22 parts. `as` polymorphism on the BaseText family (13).
- R3.2 (arch:221) names five asChild components; four of them are the throwing shape. **DRIFT, already the cross-cutting finding U4-F1 + U5-F1 = HC-F6**. CTAButton's clone shape is the working template for the four throwers. **No new HB finding.**
- Leaf interactive components without asChild: SplitButtonAction/Trigger (the codebase skill marks SplitButton ❌), CalendarPresetItem, AIModelSelectTrigger, AIPromptInputSubmit, DatePickerTrigger. arch:221 closes the list at five. contrib:42 (R8.4) generalises it to "interactive/polymorphic leaf components". The two texts disagree; the missing cases cost little because each part already composes *under* a Radix `asChild` trigger. Noted, not filed.
- `as` vs `asChild`: BaseText chooses an element; buttons merge behaviour into a child. Different jobs → **JUSTIFIED**.

### 2.10 variant/size consts

- Owned by HA (H1 const table: every const's file, key casing, identifier pairing, prop name). The matrix adds the component view only. The unit findings already cover every outlier:
  - location: AvatarSize inline in Avatar.tsx (U12-F14); `Shapes` declared in Shapes/index.ts (U10-F12); `IconSizes` in BaseIcon.tsx, aliased to `IconSize` by the generator (U10-F8)
  - identifier pairing: U3-F4, U9-F11
  - key vocabulary `standard`/`default`, `small`/`sm`: U12-F15
  - prop names outside R1.11 (`state`, `side`, `mode`, `checked`, `sortDirection`; `TooltipTypes`/`ToastTypes` naming): U11-F1, U7-F6, U6-F25, U8-F10, U14-F10 (RC-1)
- **No HB finding.**

### 2.11 cva (variant → class resolution)

- Population: the 16 components whose discrete `variant`/`size`/`side` prop selects *classes*. Excluded as **JUSTIFIED**, because the prop selects geometry, a sub-component or inline paints rather than a class string:
  - LoadingSpinner, ProgressIndicator, WavyDivider (variant → geometry/sub-component switch)
  - DropdownMenuSegment (render switch)
  - DropdownCaret (shape map)
  - Slider (VARIANT_PAINTS → inline vars, the R1.6 `custom` bundle)
  - components that reuse another recipe: CopyButton/AIPromptInputSubmit/AIModelSelectTrigger via Button; ToastAction/ToastClose via `buttonVariants`; SegmentedTabItem via TabsTrigger
- **No dominant pattern: cva 7/16, hand-built 9/16.**
  - cva (7): Button (`buttonVariants`, Button.tsx:37), Checkbox (`checkboxVariants`, :33), TabsTrigger + ToggleSwitchItem (shared `toggleOptionVariants`, toggleOption.ts:25), SheetContent (`sheetVariants`, Sheet.tsx:67), ToastRoot (`toastRootVariants`, Toast.tsx:56), Sticker (`stickerVariants`, Sticker.tsx:31).
  - hand-built (9), in four idioms:
    - `&&` chains: Avatar.tsx:23-24 `size === AvatarSize.standard && "size-[38px] rounded-avatar p-xs",`; Tooltip.tsx:67-71 `variant === TooltipTypes.simple && …`; DropdownMenu.tsx:212 `variant === DropdownMenuItemVariant.danger && [`
    - ternaries: Input.tsx:79-81; DropdownTrigger.tsx:324-326 (TextDropdownTrigger `size === TextDropdownSize.default &&`); AIToolPart.tsx:48 `const isSkill = variant === AIToolPartVariant.skill;` + :71-73
    - lookup maps: ShapeButton.tsx:78 / :84 `} satisfies Record<ShapeButtonVariant, string[]>;` + :128 `contentClasses[resolvedVariant]`; SegmentedTabSelect.tsx:36 `const ITEM_SIZE: Record<SegmentedSize, TabSize> = {`
    - table + ternary: CTAButton.tsx:65-66 `const s = SIZES[size]; const isPrimary = variant === CTAButtonVariant.primary;`
  - Plus SplitButtonAction/Trigger, which re-create Button's secondary look by hand (U4-F9).
- Within the cva group, two more splits:
  - **Prop typing:**
    - from the recipe (`VariantProps`, admits `null`): Button.tsx:110 `type ButtonOwnProps = VariantProps<typeof buttonVariants> & {`, Checkbox.tsx:73, Tabs.tsx:36, Sheet.tsx:123
    - from the consts (R1.2): Sticker (its comment at Sticker.tsx:72 explains why VariantProps was avoided), ToggleSwitchItem, ToastRoot (`variant?: ToastTypes`)
  - **Export:**
    - public (dist-index.d.ts:1, :8, :10, :106): `buttonVariants`, `stickerVariants`, `checkboxVariants`, `tabTriggerVariants`
    - internal: `sheetVariants`, `toastRootVariants`, `toggleOptionVariants` (Sheet.tsx:178-187 exports components only)
- The contribution skill assumes cva: contrib:97 "Tailwind utility changes → edit the `cva` variant maps", contrib:98 "Remove deprecated variants/sizes from both the `cva` map AND the exported const". In the 9 hand-built components there is no map to edit.
- **DRIFT.** The typing and export halves are already filed: HA-F1 (VariantProps on Button/SheetContent) + U6-F14 (Tabs/Checkbox), HA-F2 + U2-F4 (public recipes), U4-F9 (SplitButton duplicate). The remaining half, cva vs four hand-built idioms, → **HB-F5**.

### 2.12 controlled / uncontrolled API names

- Value-holding controls and their change callback:

  | callback | components |
  |---|---|
  | `onValueChange` (dominant, Radix convention) | ToggleSwitch (Toggle.tsx:58), SegmentedTabSelect, Tabs, Slider×3 (Radix), DropdownMenuRadioGroup (Radix), AIPromptInput (AIPromptInput.tsx:77), AIThinkingEffortSelector (AIModelSelect.tsx:117) |
  | `onChange(value)` (not an event) | VerificationCodeInput (VerificationCodeInput.tsx:34 `onChange?: (value: string) => void;`), DatePicker (DatePicker.tsx:40/:47 `onChange: (date: Date) => void;`) |
  | `onSelect(value)` + `selected` | Calendar (Calendar.tsx:49-50 `selected: Date; onSelect: (date: Date) => void;`), CalendarPresetItem (CalendarPresetsPanel.tsx:37-39), DatePickerSplitTrigger (`value` + `onSelect`, DatePickerSplitTrigger.tsx:28-31) |
  | native `onChange(event)` | Input, TypeableDropdownTrigger, SearchBox, DropdownMenuSearch, CodeDigitInput. **JUSTIFIED**: these are native inputs. |
  | `onCheckedChange` | Checkbox, DropdownMenuMultiSelectItem. **JUSTIFIED** (Radix). |
  | `onSort` + `sortDirection` | TableHeaderCell. **JUSTIFIED** (an action, not a value). |
  | `onStepComplete` + `activeIndex` | MorphRotationShape. **JUSTIFIED** (a completion event, not a value change). |

- Open state: `open`/`defaultOpen`/`onOpenChange` on Radix roots and AIThinkingPart (AIThinkingPart.tsx:55-57). DatePicker re-implements it without `defaultOpen` (DatePicker.tsx:16-17, :70-75; U7-F12).
- Forced visual state ("render as if hovered/pressed"), four names:
  - `active`: RollHoverText.tsx:12 "Force the rolled state regardless of hover", UnderlineLinkText.tsx:6 "Force the wipe regardless of hover"
  - `hovered`: SidebarWithHoverIcon.tsx:63 "Whether the control holding this icon is hovered or keyboard-focused"
  - `glowing`: OutlineButton.tsx:33
  - `pressed`: HotkeyIndicator.tsx:6
- **DRIFT** → **HB-F6**. The date-family part is U7-F5 and the VerificationCodeInput part is U6-F10. HB adds the package-wide view and the forced-state names.
- Observation, below threshold: controllable state is hand-rolled 6 times:
  - `isControlled = value !== undefined`: AIPromptInput.tsx:105, Input.tsx:90, Toggle.tsx:81, VerificationCodeInput.tsx:62
  - `prop ?? uncontrolled`: AIThinkingPart.tsx:78, DatePicker.tsx:71

  Each copy is 3-5 lines wrapping a component-specific transform (Toggle ignores `""`, VerificationCode clips digits, Input tracks only for placeholder sizing). The only bug among them is DatePicker's missing `defaultOpen` (U7-F12). Not filed: no shared helper would remove a demonstrated bug class.

### 2.13 state styling

- **Dominant: CSS reads state from attributes or pseudo-classes: 47/65 components that style a state** (matrix `state` column). Breakdown:
  - Radix `data-[state]`/`data-[disabled]`/`data-[highlighted]`: 19
  - the component's own `data-*` or `group-*` read by CSS: 17 (e.g. RollHoverText/UnderlineLinkText `data-active`, RevealChangeText `data-open`, CopyButton `data-copied`, LinearProgressIndicator `data-hidden`, MorphRotationShape `data-mode`)
  - CSS pseudo-classes / host selectors: 11
- 18 use a JS class or ternary:
  - **JUSTIFIED** (8). JS picks content, a lifecycle class or layout, not a style state:
    - RollChangeText/FadeChangeText animation-lifecycle class (header-sanctioned)
    - SliderContinuous/Stepped/Labeled `ds-slider-glide`
    - CalendarGrid range-position classes
    - AIPromptInputSubmit icon/variant swap
    - TableHeaderCell icon swap
  - **DRIFT** (10). A visual state is decided by a JS ternary:
    - the component **also emits the data attribute that nothing reads** (4):
      - AIToolPart (`data-state` + `data-variant` emitted; colour from `state === AIToolPartState.error ? "text-danger-primary" : "text-ghost-fg"`, AIToolPart.tsx:71-73)
      - Input wrapper (`data-disabled` unread; U6-F12)
      - CodeDigitInput (`data-filled`/`data-error` unread; U6-F12)
      - CalendarPresetItem (`data-active` + `isActive && "bg-ghost-active"`; U7-F12)
    - **no attribute at all** (6):
      - TypeableDropdownTrigger disabled (U5-F2)
      - DatePickerSplitTrigger disabled shell
      - HotkeyIndicator `pressed` (HotkeyIndicator.tsx:22-24 `pressed ? 'bg-ghost-active border-border-primary' : 'bg-surface-page border-border-primary'`)
      - ToastProvider per-variant colour for ToastTitle/ToastDescription (U8-F8, 3 matrix rows)
  - AIPromptInput emits `data-state`/`data-disabled` and styles none of them. Presumably a consumer hook; not counted.
- R2.2/R8.9 require attribute-driven state for Radix-wrapped parts. Every Radix part complies. The JS-ternary outliers are all native or composite components, which the rule does not cover. Even so, four of them emit the attribute that would make the ternary unnecessary. → **already filed as HC-F5**, which lists every DRIFT row above except DatePickerSplitTrigger's JS disabled shell (DatePickerSplitTrigger.tsx; add at dedupe). No HB finding.

### 2.14 disabled helper

- Helper definitions (src/styles/dooph-component-tokens.css):
  - :13 `.ds-disabled-state:is(:disabled, [aria-disabled="true"])`
  - :22 `.ds-radix-data-disabled[data-disabled]`
  - :30 `.ds-disabled-control:disabled`
  - :324 `.ds-opacity-disabled`
- R8.16 (contrib:59) sanctions only the first two.
- Over the components that draw their own disabled look:

  | mechanism | count | components |
  |---|---|---|
  | `ds-disabled-state` (dominant) | 12 | Button (Button.tsx:43), DropdownTrigger (:67), TextDropdownTrigger (:323), TypeableDropdownTrigger's inner input (:272), OutlineButton (:164), ShapeButton (:127), SplitButtonAction/Trigger (SplitButton.tsx:28/:59), Input bare (:126/:139), CalendarGrid days (:242), CodeDigitInput (:53, on a `<div>`) |
  | `ds-radix-data-disabled` | 8 | Checkbox (:46), DropdownMenuItem/MultiSelect/RadioSelect (DropdownMenu.tsx:197/:292), Slider×3 (:351), CalendarPresetItem (via deep-imported `menuItemClassName`, on a native `<button>`) |
  | `ds-disabled-control` | 4 | ToggleSwitchItem, TabsTrigger, SegmentedTabItem (toggleOption.ts:32), AIPromptInputTextarea (AIPromptInput.tsx:227) |
  | JS ternary / boolean fan-out | 4 | TypeableDropdownTrigger wrapper, Input wrapper, DatePickerSplitTrigger, DatePicker (`triggerDisabled`) |
  | `ds-opacity-disabled` on an icon | 2 (beside another helper) | DropdownTrigger.tsx:250, Input.tsx:181 |
  | **none, though disableable** | 2 | SearchBox (U5-F2), DropdownMenuSearch |

- Outliers:
  - **DRIFT with a rendering bug, owned:**
    - CodeDigitInput `ds-disabled-state` on a `<div>` never matches (U6-F2)
    - CalendarPresetItem uses the `data-disabled` helper on a native `<button>` that never gets `data-disabled` (U7-F14)
  - **DRIFT, owned:**
    - `ds-disabled-control`, an undocumented third helper that is a strict subset of `ds-disabled-state` (U6-F13)
    - JS-ternary disabled (U5-F2, U6-F12)
    - Button's guard covers `aria-disabled` but the others do not (U4-F10)
  - Unowned: DropdownMenuSearch draws no disabled state.
- → **already filed as HC-F4** (the same cross-cutting view, with the same locations). No HB finding.

### 2.15 focus helper

- R8.14 (contrib:57) sanctions `ds-focus-visible-ring`, `ds-focus-within-ring` and `ds-focus-ring-on-focus`. The codebase also uses `ds-focus-ring-on-open`.
- **Dominant: `ds-focus-visible-ring`, 19 own + 12 inherited via Button/recipes = 31/45** components that draw a focus indicator.
- Other sanctioned helpers (**JUSTIFIED**, they match the element):
  - `ds-focus-within-ring`: SearchBox, AIPromptInput, TypeableDropdownTrigger, Input wrapper. For a field whose `<input>` is inside a chrome wrapper.
  - `ds-focus-ring-on-focus`: Input bare.
  - `ds-focus-ring-on-open`: DatePickerTrigger, TypeableDropdownTrigger.
- **DRIFT:**
  - own helper: ShapeButton `outline-none ds-shape-button-focus-visible` (U4-F11)
  - `shadow-focus-*` box-shadow: Checkbox active state, CodeDigitInput `focus-within:shadow-focus-prominent` (U6-F4)
  - `outline-none` with no replacement on an element Radix makes focusable:
    - TabsContent (Tabs.tsx `focus-visible:outline-none`, U6-F22)
    - DropdownMenuSearch input (`outline-none`, DropdownMenuSearch.tsx:69; cf. U5-F7)
    - ModalContent (Modal.tsx:74 `'focus-visible:outline-none',`) and SheetContent (Sheet.tsx:72). Radix Dialog focuses the Content itself when it has no tabbable child.
    - ToastViewport (Toast.tsx:109 `… gap-xs p-0 outline-none`). Radix focuses the viewport on its F8 hotkey.
    - The last three are unowned. Their cost is plausible but unexercised.
- **JUSTIFIED `outline-none`:**
  - DropdownMenuItem: Radix `data-highlighted` background is the focus cue (arch Rule 2 styling).
  - AIPromptInputTextarea: the card draws `ds-focus-within-ring`.
  - TooltipContent: not focusable.
- → **already filed as HC-F3** (Checkbox, CodeDigitInput, ShapeButton, TabsContent). HC judged ModalContent/SheetContent/ToastViewport `outline-none` compliant (tabIndex −1 fallback focus targets outside the tab order). HB's concern is narrower: Radix focuses these programmatically after keyboard activation, and that can match `:focus-visible`. It is recorded here for Phase-4 verification, not filed.

### 2.16 typography

- **Dominant: the role's `.text-style-*` class, applied directly (44) or through a role component that applies the same class (10 role-comp + 5 BaseText-backed parts) = all 59 components that set type**, one of which (CodeDigitInput) adds raw size/weight utilities on top. BaseText.tsx:89 `className={cn(role && TEXT_VARIANT_CLASS[role], className)}`, so `<BodyText>` and `className="text-style-body"` emit the same class. Mixing the two, even within one file (AIModelSelect.tsx role components + a raw `text-style-body` span; CalendarPresetItem `BodyText` + `menuItemClassName`'s `text-style-body`), is **JUSTIFIED**: one mechanism, two spellings, both sanctioned by R8.17.
- AnimatedText (7) inherits by design (it wraps text it does not style).
- Outliers:
  - CodeDigitInput `BaseText fontSize={18}` + `text-[18px] font-medium` (raw utilities beside the role; U6-F3) → DRIFT, owned.
  - TableHeaderCell applies `ButtonText` only on the sortable branch (U12-F16) → DRIFT, owned.
  - `ds-chat-prose` re-spells four roles in CSS (U1-F14) → DRIFT, owned.
  - CTAButton passes `fontSize` with a `var(--ui-text-cta-*)` string to `ButtonText`. **JUSTIFIED**: open-value prop, R1.4.
- **No HB finding.**

### 2.17 token access

- Owned by HC (H3 residual counts across every className). The matrix confirms that every authored component uses token utilities + `ds-*` helpers as its base. The outlier categories and their unit owners:
  - arbitrary px (`+arb px`, 12 components): U4-F7, U5-F4, U6-F3, U8-F6, U12-F7, U9-F15
  - Tailwind's numeric scale beside spacing tokens (`+num`, 12): U4-F7, U5-F4, U8-F6, U12-F12, U11-F13, U6-F26
  - raw `var(--ui-*)` inside className (SliderContinuous/Stepped/Labeled, LinearProgressIndicator): U6-F3, U9-F15
  - private name→var colour tables (LoadingSpinner, ProgressIndicator, ShapeMorphSpinner) beside `resolveDsColor`: U9-F7, U2-F3
- **No HB finding**: HC-F2 owns it (62 sites, 21 files); a matrix-level duplicate would add nothing.

### 2.18 motion

- Over the 55 components that animate or transition something (excluding 10 that only inherit a child's motion), four mechanisms are in use and **none is a majority**:

  | mechanism | count | components |
  |---|---|---|
  | Tailwind `duration-*`/`ease-*`/`animate-*` literals in className (`tw-dur`) | 28 (+PopoverContent's tw-animate = 29) | Button, CalendarPresetItem, Checkbox, DropdownTrigger, TypeableDropdownTrigger, TextDropdownTrigger, HotkeyIndicator, Input, DropdownMenuContent/Item/MultiSelect/RadioSelect, ModalOverlay/Content, SearchBox, SegmentedTabItem, SheetOverlay/Content, SplitButtonAction/Trigger, TableRow, TabsTrigger, TextLink, ToastRoot, ToastAction, ToggleSwitchItem, TooltipContent, CodeDigitInput |
  | CSS driven by a `--ui-<component>-*` token family (`css-token`, R6.1 ✓) | 14 | RollHoverText (no ease token), RollChangeText, FadeChangeText, RevealChangeText, RollingDigitsText, UnderlineLinkText, AITextPart, AIToolPart, AIThinkingPart, AITurnSummary, MorphRotationShape, ShapeMorphSpinner, SidebarWithHoverIcon, DropdownCaret |
  | ds-* helper with hard-coded timing (`css-literal`) | 7 | ShimmerText (`2s linear`), CopyButton (120/160ms + cubic-bezier), LinearProgressIndicator (`300ms ease-out`), ShapeButton (150ms), Slider×3 (`.ds-slider-glide` 180ms) |
  | timing decided in JS (+ OutlineButton inline orb durations) | 4 + 1 | LoadingSpinner (rAF 1800ms cosine), ProgressIndicator (inline `300ms cubic-bezier(0.4, 0, 0.2, 1)`), AIContextGauge (via PI), ToastProvider (`setTimeout(…, 200)` mirroring the CSS exit); also CopyButton `REVERT_MS = 2000` (counted under css-literal; a behaviour delay) |

- R6.1/R6.5 (arch:317-321, :351-353) make the token-family row the rule and the other three DRIFT. The orchestrator's open question (progress.md "decide R6.5 applicability" for hover `duration-*` utilities) is the decision this column needs.
- All outliers are owned piecemeal: U1-F6, U3-F2, U3-F9, U4-F5, U5-F3, U6-F5, U7-F3, U8-F2, U8-F3, U9-F2, U9-F4, U12-F13 (and HC's residual counts). → **already filed as HC-F1** (same four mechanisms, same related IDs). No HB finding; this table is the component-level view for that merge.

### 2.19 outside-subtree access

- **122/122 clean** (no `closest`/`parentElement` binding, no document/window listeners in any authored component).
- **JUSTIFIED** edge cases:
  - DropdownMenuContent reads `document.hasFocus()`/`document.contains()` at event time with no listener (U5 table, R7 clean).
  - DropdownCaret reads its host through CSS `.ds-dropdown-caret-host` (header DropdownCaret.tsx:9-12; the R7.3 group pattern).
- One structural coupling worth a note: `.ds-slider-glide > span:last-child` (dooph-component-tokens.css:166, :174) styles Radix Slider's thumb wrapper by DOM position. That is not a Rule-7 breach, but it is the same fragility R2.13 bans for Radix class names. Recorded only (no unit raised it; a single location, cost limited to Radix upgrades).
- **No HB finding.**

### 2.20 header contract

- Coverage:
  - **27 of 61** component `.tsx` files (outside Icons/Shapes) carry a sectioned contract, plus ShapeMorphSpinner in prose form. Weighted over A: 44 components in a sectioned file, 4 constraints-only (AIModelSelect), 1 prose, 1 `//` note (Table), 72 none.
  - fhc:37-45 (R11.1) targets "~1 file in 15" and skips "components whose whole story is variant → token mapping". R10.5: "Do not add a contract to a file that has none unless it now carries an invariant".
- **Presence does not track invariant density:**
  - Every AIChat file is contracted, including UserMessageHeader.tsx (33 lines) and ChatDivider.tsx (51) (U11-F12).
  - Files whose invariants the units had to reconstruct from inline comments or JSDoc have none: Slider.tsx (455 lines; its in-code comment at :345-350 records a twice-broken disabled selector), DropdownTrigger.tsx (352; Typeable's R2.8 invariants sit in a non-`##` block comment), OutlineButton.tsx (299), Calendar.tsx (364), LoadingSpinner.tsx (326), ProgressIndicator.tsx (332), BaseText.tsx (the style-precedence invariant is JSDoc, :46-51).
- Form, five variants:
  - sectioned (27)
  - constraints-only (AIModelSelect, U11-F12)
  - prose (ShapeMorphSpinner)
  - `//` note (Table.tsx:1-3)
  - block comment without `##` (DropdownTrigger.tsx, Typeable)
- Placement: 16 header-above-directive vs 3 directive-above-header (§2.1; U2-F1/U6-F28).
- Accuracy: unit claim checks found a false or stale present-tense claim in at least 8 of the 28 contracted files:
  - Checkbox (U6-F1, U6-F15)
  - CodeDigitInput (U6-F1, U6-F2)
  - Input (U6-F23)
  - Sticker (U12-F2, U12-F10)
  - AIModelSelect (U11-F11)
  - Roll/Fade/RevealChangeText (U3-F13)
  - LinearProgressIndicator (U9-F19 item 5)
  - SidebarWithHoverIcon (U10-F13)

  Per-claim consolidation belongs to HD.
- → **HB-F7** (coverage and form).

### 2.21 story

- **Every component folder has a story file** (45 story files across 42 folders: `for d in src/components/*/; do ls $d*.stories.tsx; done`). 99 components have their own story, 21 appear only inside a family story, CheckboxIndicator appears in none, and TooltipProvider only as a decorator.
- **Conventions fail in every unit:**
  - R9.23, an override prop never contradicting its default: U3-F11, U4-F15, U5-F12, U6-F19, U7-F13, U8-F13, U9-F18, U10-F11, U11-F14, U12-F17. 10 of 10 component units.
  - R9.24, raw elements where a DS component exists: U3-F12, U4-F19, U6-F19, U8-F12, U9-F18, U10-F11, U12-F18.
  - Removed `brand` spelling still in stories: U4-F17 (story names), U6-F18 (`color="brand"`), U9-F8 (LinearProgressIndicator `'brand'` demo).
- The cost is demonstrated, not hypothetical. The two S1-class defects in the button/menu family (asChild throws, U4-F1/U5-F1) and the dead `ToastProvider` `duration` (U8-F1) each sit exactly where U4-F15/U8-F13 found no contradicting story.
- → **HB-F8** (merge vehicle).

### 2.22 folder index shape

- **Dominant: named re-exports, 32/42 folders** (107/122 components).
- Outliers:
  - `export *` only: Modal, OutlineButton, OutlineSection, SearchBox, ShapeButton, Sheet (6)
  - `export *` + a const declared in the barrel: Shapes (Shapes/index.ts:1-13 `export * from "./ArrowShape";` …, :15 `export const Shapes = {`)
  - generated named: Icons (93 lines)
  - **no index.ts**: LoadingSpinner, ProgressIndicator, WavyDivider, which src/index.ts:37-43 deep-imports
- Named indexes also differ in what they let through: Calendar re-exports four date helpers, DatePicker re-exports `formatTriggerLabel`, Text `serializeAxes`, and Tabs `tabTriggerVariants` (U7-F2, U3-F7, U6-F14).
- **DRIFT, already filed as the cross-cutting finding U2-F14** (+ U9-F12, U10-F12, U2-F4). **No new HB finding.**

## 3. Findings

Columns with no HB finding, and where they are owned instead:
- ref type (§2.3): follows R2.1/R8.15; outliers are U4-F12.
- displayName (§2.4): 110/110.
- props type (§2.5): HA-F3.
- asChild (§2.9): U4-F1+U5-F1 = HC-F6.
- consts (§2.10): HA.
- state styling (§2.13): HC-F5.
- disabled (§2.14): HC-F4.
- focus (§2.15): HC-F3.
- typography (§2.16): one mechanism.
- token access (§2.17): HC-F2.
- motion (§2.18): HC-F1.
- outside-subtree (§2.19): clean.
- folder index (§2.22): U2-F14.

HB files only where the cross-cutting view was not already filed, or where the matrix surfaced a location no pass had: HB-F1 (DropdownCaret) and HB-F2 (MorphRotationShape ref override, HotkeyIndicator/DropdownCaret/SplitButton refs).

### HB-F1: Two neutral modules hand component functions to the client `MorphRotationShape` — `DropdownCaret` (filed by no unit) and `ShapeMorphSpinner` (U9-F1) — because R8.21's trigger list omits "passes a function to a client component" and the unit scans applied it as written
- severity: S1
- category: build-packaging
- rules: [R8.21, R11.9]
- scope: consumer-visible
- confidence: plausible
- verified_by: |
    Read DropdownCaret.tsx 1-62 in full (no directive anywhere). `rg -n "<MorphRotationShape|<DropdownCaret|<ShapeMorphSpinner" src --glob '!*.stories.tsx'` → renderers: DropdownCaret.tsx, ShapeMorphSpinner.tsx, DropdownTrigger.tsx (client).
    Built output: ../dooph-ds-audit-build/dist/chunk-FDLT5UZN.js:1-3 imports MorphRotationShape from chunk-PWLXGSXJ.js, with no directive at byte 0; :51 `shapes: CARET_SHAPES[variant],`. dist/index.js:210-211 re-exports DropdownCaret from that chunk.
    Scan of every neutral component module for function-valued JSX props: DropdownCaret.tsx:55 and ShapeMorphSpinner.tsx:59 (`shapes=`), plus AIModelSelect.tsx:167 (closure; U11-F5, borderline, see §2.1). Everything else passes through consumer props.
    Not executed in an RSC runtime. Reasoning from React Flight serialization rules, the same as U9-F1.
- locations:
  - src/components/DropdownCaret/DropdownCaret.tsx:25-37
  - src/components/DropdownCaret/DropdownCaret.tsx:44-60
  - src/components/ShapeMorphSpinner/ShapeMorphSpinner.tsx:24-31,57-59 (U9-F1)
  - .agents/skills/dooph-ds-contribution/SKILL.md:71 (R8.21 trigger list)
  - docs/audit/_work/units/U5.md:389 (fingerprint "no / no (MorphRotationShape carries its own)")
  - docs/audit/_work/units/U2.md §2 (client table lists DropdownCaret among neutral modules that "use no client-only API")
- evidence: |
    DropdownCaret.tsx:1      /*                        ← file opens with the header; no "use client" anywhere in the file
    DropdownCaret.tsx:34-37  const CARET_SHAPES = { dropdown: [SquircleShape, PixircleShape], typeable: [CloverShape, PuffShape], } satisfies Record<DropdownCaretVariant, ComponentType<ShapeProps>[]>;
    DropdownCaret.tsx:52-55  <MorphRotationShape mode={MorphRotationShapeMode.embedded} shapes={CARET_SHAPES[variant]} restingAngle={0} …
    MorphRotationShape.tsx:54 "use client";            ← below a 53-line header, so unstamped in dist (U2-F1)
    contrib:71  "`"use client"` added only if the module actually uses `useState`/`useEffect`/`useRef`, a browser API, or a timer."
    skills/dooph-design-system-usage/SKILL.md:211  "a custom trigger adds the `ds-dropdown-caret-host` class to its root" (consumers render DropdownCaret themselves)
- impact: |
    Scenario: a consumer builds a custom trigger in a Next.js App Router server component, as the usage skill invites, and renders `<DropdownCaret />` in it.
    Today: MorphRotationShape's chunk is unstamped (U2-F1), so its `useRef`/`useState`/`useLayoutEffect` run in the react-server graph and the render fails.
    After U2-F1 is fixed: MorphRotationShape becomes a client reference, and DropdownCaret, still neutral, tries to serialize `[SquircleShape, PixircleShape]` (plain functions) across the boundary. That fails with "Functions cannot be passed directly to Client Components". Fixing the stamp script alone therefore does not fix DropdownCaret, and the same holds for ShapeMorphSpinner.
    Why both units missed it: U2 and U5 applied R8.21's trigger list (plus host-element closures, U7-F15), and that list has no entry for "hands a function value to a client component". So U2 lists DropdownCaret as neutral and U9 lists ShapeMorphSpinner as needing the directive, under the same rule.
- recommendation: |
    Mark DropdownCaret.tsx (and ShapeMorphSpinner.tsx, per U9-F1) as client modules, placing the directive however the U2-F1 fix requires.
    Amend R8.21's trigger list to name both cases U7-F15 and this finding found: closures attached to host elements, and any function or component value passed to a client component. Then one criterion produces one answer.
- breaking: none
- contract: src/components/DropdownCaret/DropdownCaret.tsx:23 "No state props and no listeners (Rule 7): hosts drive it through CSS only." → consistent (a directive adds neither). Placement interacts with R11.9 (header first) and the 5-line stamp window (U2-F1).
- remediation: tbd
- related: [U9-F1, U2-F1, U2-F2, U7-F15, U11-F5, U5-F11, U6-F28]

### HB-F2: Whether a consumer can reach a component's rendered element is answered five ways — forwardRef+spread (110), ref-through-spread with no `ref` in the type, an internal ref that a passed ref silently replaces, named-only destructures, and closed props — and the four that cannot be reached are spread across five units
- severity: S2
- category: api-design
- rules: [R8.5, R8.6, R3.1]
- scope: consumer-visible
- confidence: plausible
- verified_by: |
    `node docs/audit/_work/scratch/HB/facts.cjs` → 110/122 authored components use forwardRef. Read the 12 non-forwardRef bodies, the 2 named-only destructures and TableHeaderCell.
    package.json:58 peer `"react": ">=19"`, so a ref given to a function component arrives as an ordinary prop.
    MorphRotationShape.tsx:165-181, 262-310, 338-358 read in full for the override path. The override itself was not executed; it is reasoning from React 19 ref-as-prop plus spread order.
- locations:
  - src/components/HotkeyIndicator/HotkeyIndicator.tsx:4-11
  - src/components/MorphRotationShape/MorphRotationShape.tsx:165-181,343-348,270-273,301-302
  - src/components/DropdownCaret/DropdownCaret.tsx:39-44
  - src/components/SplitButton/SplitButton.tsx:71-80
  - src/components/Table/Table.tsx:74-84 (TableHeaderCell)
  - owned elsewhere: Calendar.tsx:124, CalendarCaption.tsx:30, DatePicker.tsx:53 (U7-F8); ShapeMorphSpinner.tsx:47 (U9-F14); AIPromptInput.tsx:294-300, AIModelSelect.tsx:132-138 (U11-F4); BaseIcon.tsx:38, BaseShape.tsx:4-9, SidebarWithHoverIcon.tsx:83 (U10-F7)
- evidence: |
    | convention | example (path:line) | components |
    |---|---|---|
    | forwardRef + spread onto the root | WavyDivider.tsx:55 `export const WavyDivider = forwardRef<SVGSVGElement, WavyDividerProps>(` | 110 |
    | no forwardRef; React 19 ref rides `...props` at runtime, but the type has no `ref` | HotkeyIndicator.tsx:9 `function HotkeyIndicator({ keys, pressed = false, className, ...props }: HotkeyIndicatorProps)`, :11 `<span className={…} {...props}>`, :4 `extends HTMLAttributes<HTMLSpanElement>` | 1 |
    | private ref, then the rest spread AFTER it | MorphRotationShape.tsx:343 `ref={spanRef}` … :348 `{...spanProps}`; :301-302 `const span = spanRef.current; if (!span) return;` | 1 (+ShapeMorphSpinner, which spreads `...rest` into it) |
    | named-only destructure, rest dropped | AIPromptInput.tsx:299 `{ sendLabel = "Send message", stopLabel = "Stop response", className },` | 2 (U11-F4) |
    | closed props | DropdownCaret.tsx:44 `({ variant = DropdownCaretVariant.dropdown, className }: DropdownCaretProps)`; SplitButton.tsx:80 `function SplitButton({ actionProps, …` | 6 + 103 icon/shape leaves |
    | props on a non-interactive wrapper | Table.tsx:74-77 `<div ref={ref} className={cn("flex items-center", className)} {...props}>`; :79-83 the sortable `<Button variant={ButtonVariant.text} … onClick={onSort}>` gets fixed props only | 1 |
- impact: |
    Consumer: Radix `asChild` triggers (TooltipTrigger, PopoverTrigger, DropdownMenuTrigger) merge a ref and event handlers into their child. Around the 110 forwardRef+spread components this works. Around the others:
    - Handlers and ref vanish silently: DropdownCaret, SplitButton, Calendar, icons/shapes.
    - TS rejects a direct `ref=` while Slot still injects one: HotkeyIndicator.
    - MorphRotationShape: the injected ref replaces `spanRef`, the layout effect returns early (:302), the sampling loop stops (:270-273), and the shape renders frozen with no error.
    - TableHeaderCell: `aria-*`/`onKeyDown`/`disabled` meant for the sort control land on a `<div>` (cf. U12-F11).
    Next agent: copying WavyDivider teaches forwardRef+spread. Copying MorphRotationShape teaches "own a private ref and spread the rest after it", which is the bug. Copying HotkeyIndicator teaches "React 19 makes forwardRef unnecessary" without the matching type. The four unit findings each see one family, so each fix would settle on a different convention.
- recommendation: |
    One convention for every component that renders its own element: accept a `ref` (forwardRef, or the React-19 `ref` prop typed via `ComponentPropsWithRef`) and spread the rest onto the element that owns the component's role.
    Where the component also needs its own ref (MorphRotationShape, and later Calendar), compose the two with the single shared helper U11-F7 proposes, instead of letting spread order decide.
    TableHeaderCell: route rest props (or a `buttonProps`) to the sort control when it is sortable.
- breaking: none
- contract: src/components/MorphRotationShape/MorphRotationShape.tsx header → consistent (it constrains motion and `d` writes, not ref ownership); src/components/DropdownCaret/DropdownCaret.tsx:23 "No state props and no listeners" → consistent (accepting rest/ref adds neither).
- remediation: tbd
- related: [U7-F8, U9-F14, U10-F7, U11-F4, U11-F7, U12-F11, U4-F16]

### HB-F3: In 9 components `className` styles a different element than `ref`/`style`/`...props`, using three different splits, and only Input documents its split
- severity: S3
- category: api-design
- rules: [R2.1, R8.6, R8.7]
- scope: consumer-visible
- confidence: plausible
- verified_by: "Matrix `cn`/`style`/`rest` columns (scratch/HB/matrix.psv); each body re-read for where `className`, `ref`, `style` and `{...props}` land: SearchBox.tsx:22-73, DropdownMenuSearch.tsx:34-84, OutlineButton.tsx:144-172, plus the unit-cited lines below. TableHeaderCell, flagged by the first draft, was re-read and does not split (§2.6)."
- locations:
  - src/components/SearchBox/SearchBox.tsx:24-35,65-73
  - src/components/Menu/DropdownMenuSearch.tsx:36-42,64-72
  - src/components/OutlineButton/OutlineButton.tsx:144-152,154-172 (U4-F3)
  - src/components/SegmentedTabSelect/SegmentedTabSelect.tsx:61-69 (U6-F16)
  - src/components/Slider/Slider.tsx:306-313,329-331,444-446 (U6-F16)
  - src/components/VerificationCode/CodeDigitInput.tsx:44-57,74-90 (U6-F16)
  - src/components/Input/Input.tsx:8-9 (the documented reference)
- evidence: |
    | split | components | quote |
    |---|---|---|
    | className → chrome wrapper; ref/style/props → inner native control | Input (documented), SearchBox, DropdownMenuSearch, CodeDigitInput | SearchBox.tsx:24 `<div className={cn(` … :35 `className` … :65-66 `<input ref={ref}` … :72 `{...props}` |
    | className → outer layout div; ref/style/props → the Radix Root inside | SliderContinuous, SliderStepped, SliderLabeled | Slider.tsx:306 `<div className={cn('relative flex w-full items-center', showSteps && 'px-xs', className)}>`; :313 `<SliderPrimitive.Root ref={ref}` |
    | className → inner List; ref/style/props → the Radix Root outside | SegmentedTabSelect | SegmentedTabSelect.tsx:61 `<TabsPrimitive.Root ref={ref} {...props}>`; :63-69 `<TabsList className={cn('gap-xxs', …, className)}` |
    | className → outer frame; ref/style/props → inner interactive element | OutlineButton | OutlineButton.tsx:144-150 `<div className={cn(` … `className,`; :154-155 `<Comp ref={composedRef …`; :171 `{...props}` |
    Input.tsx:8-9  "`className` always lands on the chrome element; every other prop, and `ref`, always land on the `<input>`."
- impact: |
    Consumer: `className="w-60"` and `style={{ width: 240 }}` size different boxes, and which box each one hits depends on the component.
    - SearchBox/DropdownMenuSearch: `style` sizes the bare input, not the field.
    - Slider: `style` shrinks the Root inside the padded wrapper.
    - SegmentedTabSelect: `style` hits the Root while the visible shell is the List.
    Next agent: each split is a reasonable choice in isolation, but only Input wrote its choice down. Copying Button teaches "everything on one root", copying Input "className to chrome, the rest to the control", copying SegmentedTabSelect "className to the inner element". U4-F3 and U6-F16 each propose a local fix with no shared rule, so the next "chrome + control" component gets a fifth variant.
- recommendation: State one convention for "chrome wrapper + interactive core" components, in the arch skill next to R2.1. Input's ("className and style to the chrome, ref and the rest to the control") is the only documented candidate. Apply it to the 8 undocumented components, or document each deviation in a header line as Input does.
- breaking: minor
- contract: src/components/Input/Input.tsx:8-9 → consistent (Input is the reference); src/components/Menu/DropdownMenuSearch.tsx header → consistent (it states no target rule)
- remediation: tbd
- related: [U6-F16, U4-F3, U5-F5, U6-F21]

### HB-F4: Inline-style precedence is decided three ways — 22 components let the consumer's `style` win, 7 let their own props or defaults win, 2 discard it — and the only written rule ("`style` still outranks props") is scoped to Text
- severity: S3
- category: inconsistency
- rules: [R8.12, R1.7]
- scope: consumer-visible
- confidence: plausible
- verified_by: "facts.cjs `styleOrder` column + `rg -n 'style=|\.\.\.style' src/components --glob '!*.stories.tsx'`; every merge site read (table in §2.7). Usage-skill rule read at skills/dooph-design-system-usage/SKILL.md:291-294 (Typography section)."
- locations:
  - src/components/Text/BaseText.tsx:46-51,93-97 (the stated rule)
  - skills/dooph-design-system-usage/SKILL.md:291-294 (the shipped rule, typography section only)
  - src/components/Menu/DropdownMenu.tsx:395
  - src/components/Sticker/Sticker.tsx:120-127
  - src/components/LinearProgressIndicator/LinearProgressIndicator.tsx:48-52
  - src/components/AIChat/AIModelSelect.tsx:89-95
  - src/components/Slider/Slider.tsx:329-341 (U6-F21)
  - src/components/Table/Table.tsx:50-51,117-122 (U12-F5)
  - consumer-wins sites: LoadingSpinner.tsx:194,254-262; ProgressIndicator.tsx:137,229; ShapeMorphSpinner.tsx:64-68; MorphRotationShape.tsx:347; Table.tsx:30-35; AnimatedText ×5 (§2.7)
- evidence: |
    BaseText.tsx:49-51      a prop is explicit and must never lose to cascade order, while a role default is ambient and must stay overridable. `style` still outranks props, as the last-resort escape hatch.
    LoadingSpinner.tsx:194  style={{ width: cssSize, height: cssSize, ...style }}                      ← consumer beats the `size` prop
    DropdownMenu.tsx:395    style={width === undefined ? style : { ...style, width }}                    ← `width` prop beats consumer
    LinearProgressIndicator.tsx:50-51  ...style, '--progress-pct': pct,                                  ← `value`/`color` beat consumer
    Slider.tsx:331-333      ...style, '--slider-pct': pct, '--ds-slider-color': resolveDsColor(color, paints.color),   ← variant DEFAULTS beat consumer (U6-F21)
    Table.tsx:50-51         style={{ gridTemplateColumns: "var(--table-cols)" }} {...props}              ← consumer style replaces it (U12-F5)
- impact: |
    Consumer: the usage skill teaches "A `style` prop still outranks props, as the last resort" (skill:293-294). That holds for the 22 consumer-wins components and silently fails for the other 9:
    - Escape hatch fails: a consumer cannot override LinearProgressIndicator's colour or Slider's track opacity through `style`.
    - Whole merge lost: a `style` on TableRow or TableHeader drops the column grid.
    Next agent: copying LoadingSpinner teaches `{...own, ...style}`, copying DropdownMenuSection `{...style, ...own}`, copying TableRow "set style, then spread". R8.12 ("merge … rather than replacing it") gives no order, so each choice looks compliant.
- recommendation: Pick one order package-wide and write it into R8.12. BaseText's documented order (component values first, consumer `style` last) matches the shipped skill. Where a component value must win (an explicit prop the consumer can simply change), say so in a header line. Fix TableHeader/TableRow per U12-F5.
- breaking: minor
- contract: src/components/Text/BaseText.tsx:49-51 → consistent (the recommendation generalises it). src/components/Sticker/Sticker.tsx header → consistent: it states that `custom` paints are inline, not their precedence.
- remediation: tbd
- related: [U12-F5, U6-F21, U3-F14, U6-F16]

### HB-F5: Variant → class resolution is cva in 7 components and hand-built in 9, using four idioms (`&&` chains, ternaries, `satisfies` lookup maps, a JS size table), while the contribution workflow assumes a cva map exists
- severity: S3
- category: inconsistency
- rules: [R8.24]
- scope: internal
- confidence: plausible
- verified_by: "`rg -n 'cva\(' src` → 6 recipes (Button.tsx:37, Checkbox.tsx:33, toggleOption.ts:25, Sheet.tsx:67, Toast.tsx:56, Sticker.tsx:31). `rg -n 'size === |variant === |satisfies Record|SIZES\[|ITEM_SIZE' src/components` → the hand-built sites below, each read. Population and exclusions in §2.11."
- locations:
  - src/components/Avatar/Avatar.tsx:23-24
  - src/components/Tooltip/Tooltip.tsx:67-71
  - src/components/Menu/DropdownMenu.tsx:212
  - src/components/DropdownTrigger/DropdownTrigger.tsx:324-326
  - src/components/Input/Input.tsx:79-81
  - src/components/AIChat/AIToolPart.tsx:48,71-73
  - src/components/ShapeButton/ShapeButton.tsx:78,84,128
  - src/components/SegmentedTabSelect/SegmentedTabSelect.tsx:36-58
  - src/components/CTAButton/CTAButton.tsx:65-66,110
  - .agents/skills/dooph-ds-contribution/SKILL.md:97-98
- evidence: |
    contrib:97              4. Tailwind utility changes → edit the `cva` variant maps or base class strings in the component file.
    contrib:98              5. Remove deprecated variants/sizes from both the `cva` map AND the exported const object.
    Avatar.tsx:23           size === AvatarSize.standard && "size-[38px] rounded-avatar p-xs",
    Tooltip.tsx:67          variant === TooltipTypes.simple &&
    ShapeButton.tsx:78      } satisfies Record<ShapeButtonVariant, string[]>;
    CTAButton.tsx:65-66     const s = SIZES[size]; const isPrimary = variant === CTAButtonVariant.primary;
- impact: |
    Next agent: the Figma-sync step (contrib:97) and the deprecation step (contrib:98, R8.24) say to edit "the cva map". In 9 of the 16 class-selecting components there is none.
    - Removing a key from the const leaves a dead `&&` branch (Avatar, Tooltip, DropdownMenuItem) or a `satisfies` map that stops compiling (ShapeButton). The agent must find each component's idiom by reading it.
    - Neither the contribution nor the architecture skill gives a precedent: copying Avatar teaches `&&` chains, copying ShapeButton `satisfies` maps, copying Sticker cva.
    - SplitButtonAction/Trigger already drifted from Button's look by re-building it by hand instead of reusing the recipe (U4-F9).
    The typing and export halves of the cva column are filed separately (HA-F1, HA-F2, U6-F14).
- recommendation: Adopt cva as the one mechanism for a discrete prop that selects classes (the skills already assume it): convert the 9 when next touched, typing their props from the consts (HA-F1), not from `VariantProps`. Prop-to-geometry/sub-component switches (LoadingSpinner, ProgressIndicator, WavyDivider, DropdownMenuSegment, DropdownCaret, Slider paints) stay as they are. Record that exclusion in the arch skill.
- breaking: none
- contract: src/components/ShapeButton/ShapeButton.tsx header → consistent (it covers shape/icon behaviour, not the class-map mechanism); src/components/Toggle/toggleOption.ts header → consistent (shared cva recipe)
- remediation: tbd
- related: [HA-F1, HA-F2, U6-F14, U4-F9, U2-F4, U12-F14]

### HB-F6: Value-holding controls name their change callback three ways (`onValueChange`, `onChange(value)`, `onSelect(value)` + `selected`), and the "force the hover/active look" boolean four ways (`active`, `hovered`, `glowing`, `pressed`)
- severity: S2
- category: naming
- rules: []
- scope: consumer-visible
- confidence: plausible
- verified_by: "`rg -n '^\s*(value|defaultValue|onValueChange|onChange|selected|onSelect|open|defaultOpen|onOpenChange)\??:' src/components --glob '!*.stories.tsx'` over every non-native value control; boolean force-state props read at their declarations"
- locations:
  - src/components/VerificationCode/VerificationCodeInput.tsx:32-34 (U6-F10)
  - src/components/DatePicker/DatePicker.tsx:16-17,39-40,46-47 (U7-F5, U7-F12)
  - src/components/Calendar/Calendar.tsx:49-50,55-56 (U7-F5)
  - src/components/Calendar/CalendarPresetsPanel.tsx:37-39
  - src/components/DatePicker/DatePickerSplitTrigger.tsx:28-31 (U7-F5)
  - src/components/AnimatedText/RollHoverText.tsx:11-12
  - src/components/AnimatedText/UnderlineLinkText.tsx:5-6
  - src/components/SidebarWithHoverIcon/SidebarWithHoverIcon.tsx:60-63
  - src/components/OutlineButton/OutlineButton.tsx:30-33
  - src/components/HotkeyIndicator/HotkeyIndicator.tsx:6
  - dominant-pattern references: Toggle.tsx:55-58, AIPromptInput.tsx:75-77, AIModelSelect.tsx:116-117
- evidence: |
    Toggle.tsx:58                 onValueChange?: (value: string) => void;          ← also AIPromptInput:77, AIModelSelect:117, every Radix value root
    VerificationCodeInput.tsx:34  onChange?: (value: string) => void;               ← a value, not an event
    DatePicker.tsx:40             onChange: (date: Date) => void;
    Calendar.tsx:49-50            selected: Date; onSelect: (date: Date) => void;
    DatePickerSplitTrigger.tsx:28,31  value: DateRange; … onSelect: (range: DateRange) => void;   ← mixes both vocabularies
    RollHoverText.tsx:12 `active?: boolean;` · SidebarWithHoverIcon.tsx:63 `hovered?: boolean;` · OutlineButton.tsx:33 `glowing?: boolean;` · HotkeyIndicator.tsx:6 `pressed?: boolean;`
- impact: |
    Consumer:
    - Moving from `ToggleSwitch`/`SegmentedTabSelect`/`AIPromptInput` (`onValueChange`) to `VerificationCodeInput` (`onChange`) means renaming the callback.
    - `onChange` on VerificationCodeInput receives a string, while `onChange` on `Input`, two rows away in the same form, receives a `ChangeEvent`. Code written for one silently misreads the other wherever types are loose (e.g. a shared form adapter).
    - DatePicker → inline Calendar renames both props (`value`/`onChange` → `selected`/`onSelect`), and DatePickerSplitTrigger mixes the two.
    - "Drive the hover look from outside" is `active` on two text components, `hovered` on SidebarWithHoverIcon, and `glowing` on OutlineButton. TS catches a wrong guess, but no name can be guessed from a sibling.
    Next agent: copying Toggle teaches the Radix triple, copying VerificationCodeInput teaches `onChange(value)`, copying Calendar teaches `selected`/`onSelect`. No rule names the convention (R1.11 covers `variant`/`size` only).
- recommendation: |
    Write the convention down next to R1.11: `value`/`defaultValue`/`onValueChange` for every non-native value control (Radix's names, already the majority); native `onChange(event)` only where the root is a native input; one boolean name for a forced interaction look.
    Rename at the next major (alias the old names for one release if a minor ships first). The six hand-rolled controllable-state blocks (§2.12) are where each rename lands.
- breaking: major
- contract: src/components/VerificationCode/VerificationCodeInput.tsx:5-6 "Controlled via `value` + `onChange`" (## behavior) → consistent; a rename must update it in the same commit (R10.4). src/components/SidebarWithHoverIcon/SidebarWithHoverIcon.tsx:19 "`hovered` is CONTROLLED. The component must not go looking for an…" → consistent; the constraint is about controlled-ness, so a rename keeps it and only updates the identifier.
- remediation: tbd
- related: [U6-F10, U7-F5, U7-F12, U4-F13]

### HB-F7: Component invariants are recorded in five different forms, and only the `## behavior`/`## constraints` header is covered by AGENTS.md's stop-and-raise rule — so equally load-bearing rules in a `//` note, a mid-file block comment, JSDoc or an inline comment carry no protection
- severity: S3
- category: inconsistency
- rules: [R10.1, R10.2, R11.3, R11.9, R11.13]
- scope: internal
- confidence: plausible
- verified_by: "`grep -l '## constraints'` over the 61 component .tsx files outside Icons/Shapes → 27; first-40-line read of every remaining component file for invariant-bearing comments. fhc:37-47 read for the triggers. Header accuracy taken from the unit claim tables (consolidated by HD)."
- locations:
  - src/components/Table/Table.tsx:1-3
  - src/components/DropdownTrigger/DropdownTrigger.tsx:82-97
  - src/components/Slider/Slider.tsx:345-350
  - src/components/Text/BaseText.tsx:46-51
  - src/components/AIChat/AIModelSelect.tsx (constraints-only header; U11-F12)
  - src/components/ShapeMorphSpinner/ShapeMorphSpinner.tsx:1-6 (prose form)
  - src/components/Menu/DropdownMenu.tsx:1-3, src/components/LinearProgressIndicator/LinearProgressIndicator.tsx:1-3, src/components/Toggle/Toggle.tsx:1-3 (directive above the header; U2-F1/U6-F28/U5-F11)
- evidence: |
    AGENTS.md:3-4               Some source files open with a block comment stating `## behavior` and `## constraints`. Read it before editing that file.
    fhc:39-43                   An invariant a reasonable edit would violate … A deliberate choice that looks like a mistake — … a missing `"use client"` … A history of churn — you have already fixed it twice.
    Table.tsx:1-2               // No "use client": no hooks, and onSort is a consumer-supplied passthrough. / // Neutral module — it renders in either graph. …   ← fhc trigger 2, as a `//` note
    DropdownTrigger.tsx:83-86   * Root is a div (Radix merges button trigger props). Radix toggles the menu on every / * trigger pointerDown — we skip that when the target is the input … pair / * with DropdownMenuContent focusOnOpen={false} …   ← R2.8's invariants, mid-file; :94-95 "Long-term fix: a combobox …" (a TODO, R11.13)
    Slider.tsx:345-347          /* ds-radix-data-disabled, NOT `data-[disabled]:ds-disabled-state`. / * That form was broken twice over: …   ← fhc trigger 5 ("fixed it twice"), as an inline comment
    BaseText.tsx:49-51          (JSDoc) a prop is explicit and must never lose to cascade order … `style` still outranks props   ← an invariant (HB-F4), as JSDoc
- impact: |
    Next agent: AGENTS.md tells it to read the header and to stop and raise before contradicting a constraint. Those obligations attach only to the sectioned header (27 files). The Typeable trigger's pointer-down suppression, Table's deliberate missing directive, Slider's twice-broken disabled selector and BaseText's precedence order are exactly fhc's triggers, but each sits in a form the rule does not cover. A "simplify" edit can reverse any of them without tripping anything.
    The forms also drift in practice: three files put the directive above the header (R11.9), which is what keeps them stamped (U2-F1). Unit claim checks found false or stale statements in at least 8 of the 28 contracted files (§2.20; HD consolidates).
    AIChat contracts all 9 of its files while Slider, Calendar, DropdownTrigger, OutlineButton, LoadingSpinner and ProgressIndicator contract none. That fits fhc's "file size is not a trigger", but it leaves the units, not the code, to rediscover their invariants.
- recommendation: For the four invariant-bearing comments above, either move the invariant into a sectioned header (Typeable's block comment is one already, minus the TODO), or decide that they are explanations, not contracts, and say so. Resolve placement with the U2-F1 fix (one placement rule that both R11.9 and the stamp script accept). Finally, have the format findings (U11-F12, U3-F3, U4-F19, U6-F26, U10-F13) land as one pass.
- breaking: none
- contract: n/a (concerns the contract mechanism itself; AGENTS.md:3-4 and fhc:37-47 are the measuring sticks, not contradicted)
- remediation: tbd
- related: [U11-F12, U3-F3, U4-F19, U6-F26, U10-F13, U5-F11, U2-F1, U6-F28, U9-F16]

### HB-F8: Story conventions fail in all ten component units — override props never contradicted (R9.23) and raw elements or removed spellings in stories (R9.24, R1.3) — and the uncovered props are exactly where three shipped defects hid
- severity: S3
- category: stories
- rules: [R9.23, R9.24, R8.22, R1.3]
- scope: internal
- confidence: plausible
- verified_by: "Each unit's §5 Stories check plus its story findings (listed in related). Story-file presence: `for d in src/components/*/; do ls $d*.stories.tsx; done` → 45 files, 42/42 folders."
- locations:
  - src/components/Button/Button.stories.tsx:12-22,34-35 (U4-F15, U4-F17)
  - src/components/OutlineButton/OutlineButton.stories.tsx:28-34 (U4-F15)
  - src/components/ShapeButton/ShapeButton.stories.tsx:12-22,28-31 (U4-F15, U4-F17)
  - src/components/Toast/Toast.stories.tsx (U8-F13: no provider-level `duration` story)
  - src/components/Slider/Slider.stories.tsx:212 (U6-F18)
  - src/components/TextLink/TextLink.stories.tsx:45-46 (U3-F12)
  - per-unit lists: U3-F11, U5-F12, U6-F19, U7-F13, U9-F18, U10-F11, U11-F14, U12-F17, U12-F18, U8-F12, U9-F8
- evidence: |
    Button.stories.tsx:12-22         argTypes: { variant, size, disabled }   (no asChild; same for ShapeButton :12-22, OutlineButton :28-34)
    Button.stories.tsx:34            export const Brand: Story = {           (removed spelling as a story name; ShapeButton.stories.tsx:28 likewise)
    Toast.stories.tsx (U8-F13 table) ToastProvider duration … | none |
    Slider.stories.tsx:212           {(['primary', 'brand', 'text', 'error-primary'] as const).map((c) => (
    TextLink.stories.tsx:45-46       <TextLink asChild> <button onClick={() => alert("Button clicked!")}>
- impact: |
    R9.23 exists so a dead or broken override shows up in Storybook. The three places where it was skipped are where shipped defects sit:
    - `asChild` throws on OutlineButton/ShapeButton/DropdownTrigger/TextDropdownTrigger (U4-F1/U5-F1), and no story sets `asChild` on them.
    - `ToastProvider`'s `duration` is ignored (U8-F1), and no story sets it.
    - `color="brand"` renders an invalid colour (U6-F18).
    Each unit filed its slice as S3/S4. Together they show that no family follows the story rules consistently, so the next contributor copying any story file learns the gap.
- recommendation: One sweep, ordered by risk: first a contradicting story for every override prop whose dead/broken state is already known (asChild ×4, ToastProvider `duration`, Sheet `withOverlay`, Tooltip `portal`), then the rest of each unit's list. Fold the `brand` spellings into the same pass (R1.3).
- breaking: none
- contract: n/a
- remediation: tbd
- related: [U3-F11, U3-F12, U4-F15, U4-F17, U4-F19, U5-F12, U6-F18, U6-F19, U7-F13, U8-F12, U8-F13, U9-F8, U9-F18, U10-F11, U11-F14, U12-F17, U12-F18]

## 4. Newcomer test

Could an agent infer each convention correctly from any single component?

**Pass** (any exemplar teaches the rule):
- forwardRef → displayName (110/110)
- ref type helper (ComponentRef on every Radix part, the concrete element on DOM parts, no `ElementRef`)
- `cn(base…, className)` with the consumer last (119/119)
- attribute-driven state on Radix parts
- outside-subtree discipline (122/122 clean)
- typography: role components and `text-style-*` emit the same class

**Fail.** The exemplar decides the lesson:
- `"use client"`: copying CTAButton teaches "never mark a forwardRef wrapper", Button teaches "always mark", DropdownCaret teaches "handing component functions to a client child is server-safe" (HB-F1).
- Whether a ref and rest props reach the element: WavyDivider vs HotkeyIndicator vs MorphRotationShape vs DropdownCaret (HB-F2).
- Whether a props type is exported: Popover vs Modal (HA-F3).
- Which element `className` styles: Button vs Input vs Slider vs SegmentedTabSelect (HB-F3).
- Who wins an inline-style conflict: LoadingSpinner vs DropdownMenuSection vs TableRow (HB-F4).
- How a variant selects classes:
  - copying Tabs: a cva recipe borrowed from Toggle, exported under an alias, with `variant`/`size` typed from `VariantProps`
  - copying Checkbox: its own exported recipe, typed the same way
  - copying Toggle: the same recipe, typed from the consts
  - copying Avatar: an `&&` chain
  - copying ShapeButton: `satisfies` maps (HB-F5, HA-F1, HA-F2)
- The value callback: Toggle `onValueChange`, VerificationCodeInput `onChange(value)`, Calendar `selected`/`onSelect` (HB-F6).
- The disabled helper: Checkbox `ds-radix-data-disabled`, Tabs/Toggle `ds-disabled-control`, Button `ds-disabled-state`, Input a JS ternary (HC-F4).
- The focus ring: ShapeButton's own helper and Checkbox's press shadow vs everyone else's `ds-focus-visible-ring` (HC-F3).
- Motion: a token family (AnimatedText, AIChat, MorphRotationShape), Tailwind duration literals (Button, overlays), hard-coded helpers (Slider, ShapeButton), or JS (LoadingSpinner, Toast) (HC-F1).
- Where a header contract goes and what form invariants take (HB-F7).
- Whether stories contradict overrides: none does consistently (HB-F8).
- Barrel shape: named vs `export *` vs none (U2-F14).
- Where consts live: constants.ts vs inline vs the barrel (HA, U12-F14, U10-F12).

The rules that pass are exactly the ones R2.1/R8.5-R8.8/R8.15 spell out mechanically. Every failing column is one where the rulebook is silent (callback names, style order, className target, class-resolution mechanism, invariant form) or incomplete (R8.21's trigger list, R8.16's helper list, R6.5's scope for hover transitions).

### Corrections to unit fingerprint rows (for dedupe)

- U5 §3 DropdownCaret `"use client"`: "no / no (MorphRotationShape carries its own)" → **needed** (passes component functions to a client component; HB-F1). U2 §2 lists the same module as neutral.
- U12 §3 TableHeaderCell: className is not split from `ref`/`...props` (Table.tsx:74-77 puts all three on the wrapper). Its defect is that the sort Button is unreachable (HB-F2).
- U10 §3 MorphRotationShape ref column: "none (… so no consumer ref)". Under React 19 a ref injected by `Slot` reaches `spanProps` and overrides the internal `spanRef` (HB-F2).

## DONE
