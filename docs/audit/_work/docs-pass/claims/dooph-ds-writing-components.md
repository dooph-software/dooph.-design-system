# Claims: dooph-ds-writing-components

Every factual claim in `.agents/skills/dooph-ds-writing-components/SKILL.md` (S) and
`references/recipes.md` (R), one per line, with evidence. Line numbers are at the
working tree on 2026-10-10. "Maintainer rule" = stated in docs/audit/doc-refresh.md
(rule text decided 2026-10-02) or docs/audit/_work/agent-rules.md; the code evidence
shows the rule is what the code does.

## SKILL.md

- S: Components present; the consuming app owns data, fetching, timers and control. Evidence: doc-refresh.md "The DS doesn't own data or control"; src/components/AIChat/AIToolPart.tsx:17-20 ("it holds no timer. Elapsed time is ticked by the consumer"); src/components/AIChat/AIPromptInput.tsx:25-28 ("No transport"); src/components/AIChat/AITurnSummary.tsx header constraints ("never reads a clock"); src/components/SidebarWithHoverIcon/SidebarWithHoverIcon.tsx:19-23 (`hovered` is CONTROLLED).
- S: No component fetches, polls or runs an interval (rationalization reply); no `fetch` or `setInterval` exists in non-story src code. Evidence: `grep -rn "fetch(\|setInterval(" src` (stories excluded) returns nothing.
- S: The no-data rule names lint check "JS timers and animation loops outside their allowlist". Evidence: scripts/check-conventions.mjs:675.
- S: A user's request does not lift the rule; if the user insists the DS own the polling, that changes the maintainer's rule, so stop and raise it. Evidence: doc-refresh.md "The DS doesn't own data or control" (a maintainer principle); AGENTS.md (a conflicting change is raised, not built); SCORES.md P2 target text.
- S: Baseline agent wrote `fetch`, `setInterval`, `useState` and a `url` prop. Evidence: docs/audit/_work/docs-pass/baseline/SCORES.md service-status-polling must-line 1 (diff.patch:205, 214, 223, 243).
- S: Hooks hold only the component's own UI state (uncontrolled value, open flag, focus). Evidence: scripts/check-conventions.mjs:176-177 (Input: uncontrolled value, focus), :150-151 (AIThinkingPart: uncontrolled disclosure open state), :160-161 (Calendar: focus restore), :192-193 (Slider: uncontrolled value); src/components/Toggle/Toggle.tsx:68-83.
- S: `"use client"` only when the module itself calls hooks, touches browser APIs, puts event-handler closures on host elements, or passes a function prop to a client component. Evidence: doc-refresh.md "`"use client"` only when unavoidable" (that exact list); agent-rules.md rule 6; scripts/check-conventions.mjs:670; allowlist reasons at scripts/check-conventions.mjs:162-171 (inline closures; DatePicker forwards onValueChange into Calendar), :168-169 (navigator.clipboard), :192-193 (useState). Hooks means client-only hooks: src/utils/composeRefs.ts:1-4 calls only useCallback and carries no directive.
- S: Never on a thin Radix wrapper or `constants.ts`. Evidence: doc-refresh.md ("Never use it as belt-and-braces on a thin Radix wrapper"); src/components/Button/constants.ts:1-2; Checkbox.tsx, Tabs.tsx, Popover.tsx, Tooltip.tsx carry no directive and are absent from USE_CLIENT_ALLOWLIST (scripts/check-conventions.mjs:145-202).
- S: Lint check name "\"use client\" outside its allowlist". Evidence: scripts/check-conventions.mjs:669.
- S: A file with `"use client"` makes its constants references a Server Component can't read. Evidence: scripts/check-conventions.mjs:670.
- S: Option sets are a const plus same-named type in `constants.ts`. Evidence: src/components/Button/constants.ts:8-16, 24-33; src/components/Tabs/constants.ts:8-27, 36-41; agent-rules.md rule 6 "Discrete options".
- S: `IconSize` is the one option const outside a constants module: it is declared in src/components/Icons/BaseIcon.tsx:38 and stays there (maintainer decision: moving it is churn). Evidence: BaseIcon.tsx:38-44; Icons/ has no constants.ts; `grep -rn "export const [A-Z][A-Za-z]* = {" src/components --include=*.tsx` (stories excluded) returns only BaseIcon.tsx:38.
- S: Props typed from the consts, never cva's `VariantProps`, because that admits null and `variant={null}` renders unstyled. Evidence: src/components/Button/Button.tsx:25-28; src/components/Checkbox/Checkbox.tsx:73-75; src/components/Tabs/Tabs.tsx:32-34.
- S: For a NEW const, names are `<Component><Prop>`: ButtonVariant, ButtonSize, SheetSide, TableSortDirection, AIToolPartState. Evidence: src/components/Button/constants.ts:8, 24; src/components/Sheet/Sheet.tsx:107 (`side?: SheetSide`); src/components/Table/Table.tsx:59; src/components/AIChat/AIToolPart.tsx:34; doc-refresh.md "A const and its type share one name", "Variant consts are named *Variant". Existing consts that deviate from the positive form (each verified as `export const` in src): ShapeButtons (src/components/ShapeButton/constants.ts:14) and Shapes, CalendarPresets, CheckboxChecked (src/components/Checkbox/constants.ts:4), LoadingSpinnerColor, RollDirection (src/components/AnimatedText/constants.ts:12), RevealDirection (src/components/AnimatedText/constants.ts:27), SidebarIconSide (src/components/SidebarWithHoverIcon/constants.ts:8), TextDropdownSize (src/components/DropdownTrigger/constants.ts:8), SegmentedVariant (src/components/SegmentedTabSelect/constants.ts:12), SegmentedSize (src/components/SegmentedTabSelect/constants.ts:25), DatePickerMode (src/components/Calendar/constants.ts:13), FontAxis (src/components/Text/constants.ts:89), and the open-value Fonts/FontSizes/FontWeights/Tracking, which doc-refresh.md names as the stated exception.
- S: Existing names stay as they are (e.g. CheckboxChecked, ShapeButtons, RollDirection); renaming an exported const is a breaking change. Evidence: each is public: src/components/Checkbox/index.ts:2, src/components/ShapeButton/index.ts:2 (`export * from './constants'`), src/components/AnimatedText/index.ts (re-exports RollDirection), all reached through `export * from './components/…'` in src/index.ts; removing a public export breaks consumer imports.
- S: Never `*Type`; DropdownMenuSelectType is the one exception. Evidence: scripts/check-conventions.mjs:463 (SANCTIONED_TYPE_CONSTS), :626-627.
- S: Lint check name "variant constants named *Type" (now on the const-name line, not the VariantProps line; lint does not guard VariantProps/null). Evidence: scripts/check-conventions.mjs:625, 627 (matches only `export const …Type(s) =`).
- S: `forwardRef` with `displayName`. Evidence: src/components/Button/Button.tsx:187, 202; src/components/Checkbox/Checkbox.tsx:126, 138; agent-rules.md rule 6 "Wrapper shape".
- S: Refs typed `ComponentRef<typeof X.Root>`. Evidence: src/components/Checkbox/Checkbox.tsx:126-128; src/components/Tabs/Tabs.tsx:14-16.
- S: `useComposedRefs` when the component needs the node too. Evidence: src/utils/composeRefs.ts:12-26; used at src/components/Input/Input.tsx:221, src/components/OutlineButton/OutlineButton.tsx:95, src/components/MorphRotationShape/MorphRotationShape.tsx:191.
- S: Lint check names "forwardRef without displayName" and "ElementRef instead of ComponentRef". Evidence: scripts/check-conventions.mjs:573, 567.
- S: `asChild` swaps the root for Radix `Slot`. Evidence: src/components/Button/Button.tsx:52, 189.
- S: When the component adds its own children, the consumer's child is wrapped in `Slottable`. Evidence: src/components/OutlineButton/OutlineButton.tsx:268-277; src/components/ShapeButton/ShapeButton.tsx:146-154; src/components/DropdownTrigger/DropdownTrigger.tsx:77-80.
- S: `cn(recipe, className)` with className last. Evidence: src/components/Button/Button.tsx:195; src/components/Checkbox/Checkbox.tsx:132; src/components/Tabs/Tabs.tsx:50; agent-rules.md rule 6 "Wrapper shape".
- S: className lands on the element that owns the role; when not the root, the JSDoc says where className, ref and style go. Evidence: doc-refresh.md "Write down the conventions"; src/components/Input/Input.tsx:8-9; src/components/OutlineButton/OutlineButton.tsx:62-63; src/components/SegmentedTabSelect/SegmentedTabSelect.tsx:47-48; src/components/SearchBox/SearchBox.tsx:19; src/components/Slider/Slider.tsx:463.
- S: The consumer's `style` spreads last. Status: TRUE (fixed in the code follow-up, 2026-10-11). Every component that merges its own inline values with the consumer's `style` spreads `style` last: src/components/LinearProgressIndicator/LinearProgressIndicator.tsx:50-56 (`...style` at :54), src/components/AIChat/AIModelSelect.tsx:98-104 (:103) and :252-258 (:257), src/components/Menu/DropdownMenu.tsx:480 (`{ width, ...style }`), src/components/Sticker/Sticker.tsx:124-131 (:129), src/components/Slider/Slider.tsx:366-377 (:376; a fifth one the follow-up found), src/components/Text/BaseText.tsx:106, src/components/MorphRotationShape/MorphRotationShape.tsx:355, src/components/ProgressIndicator/ProgressIndicator.tsx (flat and wavy svgs). `grep -rn -A2 "...style[,}]" src/components` (stories excluded) shows `...style` as the last key of every merge. The rule is absolute by maintainer decision (doc-refresh.md "The consumer's `style` merges last and wins").
- S: Radix states styled via `data-[state=…]` and `data-[disabled]`. Evidence: src/components/Checkbox/Checkbox.tsx:14-15 (constraint), :40-48, :55-63.
- S: Overlays portal by default and take `portal` and `portalProps`. Evidence: src/components/Popover/Popover.tsx:18-20, 33-34, 59-63; src/components/Tooltip/Tooltip.tsx:34-35, 47-48, 84-92; src/components/Modal/dialogShell.tsx:60-63, 76; src/components/Menu/DropdownMenu.tsx:132-133, 150, 254-257.
- S: Text always goes through a Text component; a root that owns its text renders through one with `as`. Evidence: src/components/Text/BaseText.tsx:48-52; src/components/Button/Button.tsx:191-197; src/components/Tabs/Tabs.tsx:47-48; src/components/Modal/dialogShell.tsx:34-35; agent-rules.md rule 13.
- S: Lint check names "text-style classes outside Text components" and "typography utilities or inline font styles". Evidence: scripts/check-conventions.mjs:534, 541.
- S: Lint can't see a bare `<span>{label}</span>`. Evidence: the two checks' regexes match only `text-style-*`, typography utilities and inline font style keys (scripts/check-conventions.mjs:537, 543-544); SCORES.md "Secondary misses" (radix `<span>{label}</span>`).
- S: Header contracts: read first, stop and raise on conflict; when the change alters behaviour the header describes, update the header in the same change. Evidence: AGENTS.md "File contracts" ("If your change alters behavior the header describes, update the header in the same commit").
- S: Baseline agent wrote polling into a header contract. Evidence: SCORES.md service-status-polling ("status-no-cache", "status-cleanup", ServiceStatus.tsx:16-19).
- S: Option props `variant`, `size`; also `shape`, `side`, `selectType`, `mode`, `direction`, `sortDirection`, `state`. Evidence: doc-refresh.md "Discrete-option prop names"; src/components/ShapeButton/ShapeButton.tsx:42; src/components/Sheet/Sheet.tsx:107; src/components/Menu/DropdownMenu.tsx:72; src/components/Calendar/Calendar.tsx:60; src/components/AnimatedText/RollChangeText.tsx:38; src/components/Table/Table.tsx:59; src/components/AIChat/AIToolPart.tsx:34.
- S: Size keys `standard` base, `sm`, `iconSm: "icon-sm"`. Evidence: src/components/Button/constants.ts:24-32.
- S: Lint check name "size keys named default or small". Evidence: scripts/check-conventions.mjs:631.
- S: Heights h-button-micro 28, h-button-sm 34, h-button 38, h-button-medium 46, h-button-big 54. Evidence: src/styles/tokens.css:484-487, 494; utilities src/styles/index.css:360, 363, 366, 369, 423.
- S: Value controls `value` / `defaultValue` / `onValueChange(value)`. Evidence: src/components/Toggle/Toggle.tsx:97-100; src/components/AIChat/AIPromptInput.tsx:81-83; src/components/VerificationCode/VerificationCodeInput.tsx:43-45.
- S: A controlled `value` wins. Evidence: src/components/Toggle/Toggle.tsx:12-13, 71, 81.
- S: Radix `checked` / `onCheckedChange` and `open` / `onOpenChange` pass through. Evidence: src/components/Checkbox/Checkbox.tsx:76-77 (props extend the Radix Root props); src/components/AIChat/AIThinkingPart.tsx:13-14, 65; src/components/DatePicker/DatePicker.tsx:25.
- S: Lint check name "value callbacks not named onValueChange". Evidence: scripts/check-conventions.mjs:522.
- S: Force-the-look flags `active`, `hovered`, `glowing`, `pressed`. Evidence: src/components/AnimatedText/RollHoverText.tsx:12; src/components/SidebarWithHoverIcon/SidebarWithHoverIcon.tsx:64; src/components/OutlineButton/OutlineButton.tsx:33; src/components/HotkeyIndicator/HotkeyIndicator.tsx:8.
- S: The inverse surface flag is `themeInverse`. Evidence: src/components/Tooltip/Tooltip.tsx:33; src/components/OutlineButton/OutlineButton.tsx:26.
- S: Rationalization quotes (polling, hooks, tabs, button-height, "Everything passes", "All clean"). Evidence: SCORES.md service-status-polling thinking [44], [51] and final text; tabs-medium-size text [18]; button-height-40 thinking [20]; radix-collapsible "All clean."
- S: Button's medium is a pill with the hero text role. Evidence: src/components/Button/Button.tsx:10-13, 117, 142-145.
- S: Lint was red in the runs that said "Everything passes" / "All clean". Evidence: SCORES.md Cross-cutting section (service-status and radix lint RED).
- S: `npm run lint` runs `tsc --noEmit` then `node scripts/check-conventions.mjs`. Evidence: package.json:61.
- S: A passing run ends `conventions: N checks passed`. Evidence: scripts/check-conventions.mjs:9-10, 754.
- S: Inventory lists header contracts and the allowlist. Evidence: .agents/skills/dooph-ds-codebase-map/references/inventory.md:9-13.
- S: components.md holds props, defaults and consts. Evidence: the brief's description of the generated reference; scripts/check-conventions.mjs:703.

## references/recipes.md

- R1: ButtonSize snippet (keys/values, camelCase key with kebab value). Evidence: src/components/Button/constants.ts:24-33.
- R1: constants.ts has no `"use client"` so Server Components can read the values. Evidence: src/components/Button/constants.ts:1-2.
- R1: TabsTriggerProps typed from TabSize/TabVariant; VariantProps would admit null (an unsized tab). Evidence: src/components/Tabs/Tabs.tsx:32-41.
- R2: Checkbox snippet, no directive, no state, forwardRef + displayName, ref from the primitive, recipe then className. Evidence: src/components/Checkbox/Checkbox.tsx:21-28, 126-138; absent from USE_CLIENT_ALLOWLIST.
- R2: Recipe reads state as `data-[state=checked]:bg-prominent`. Evidence: src/components/Checkbox/Checkbox.tsx:55.
- R2: `const PopoverTrigger = PopoverPrimitive.Trigger;`. Evidence: src/components/Popover/Popover.tsx:10.
- R2: TabsTrigger renders `ButtonText as={TabsPrimitive.Trigger}` with `cn(tabTriggerVariants({ size, variant }), className)`. Evidence: src/components/Tabs/Tabs.tsx:47-52.
- R3: `const Comp = (asChild ? Slot : "button") as ElementType;` and `<BaseText as={Comp}`. Evidence: src/components/Button/Button.tsx:189-192.
- R3: Slottable snippet. Evidence: src/components/OutlineButton/OutlineButton.tsx:268-277.
- R4: useComposedRefs is internal, writes the node into every ref, memoized so a callback ref is not detached/re-attached each render. Evidence: src/utils/composeRefs.ts:12-26.
- R4: MorphRotationShape snippet and "last so a spread cannot displace it". Evidence: src/components/MorphRotationShape/MorphRotationShape.tsx:190-191, 356-359.
- R5: Input / OutlineButton / SegmentedTabSelect split statements. Evidence: src/components/Input/Input.tsx:8-9; src/components/OutlineButton/OutlineButton.tsx:62-63; src/components/SegmentedTabSelect/SegmentedTabSelect.tsx:47-48.
- R5: BaseText merges `{ ...typography, ...style }`. Evidence: src/components/Text/BaseText.tsx:104-108.
- R6: Popover portals by default; `portal={false}` keeps it inline; snippet. Evidence: src/components/Popover/Popover.tsx:18-20, 33, 59-63.
- R6: Dialog overlay and panel go to the portal as two children, never one Fragment, because DialogPortal wraps each child in Presence. Evidence: src/components/Modal/dialogShell.tsx:66-70, 103-107.
- R7: USE_CLIENT_ALLOWLIST entries carry file, reason and `needs`; lint fails an entry whose file no longer uses them. Evidence: scripts/check-conventions.mjs:49-52, 142-145, 403-410.
- R7 table: Slider (uncontrolled value, drag state). Evidence: scripts/check-conventions.mjs:192-193.
- R7 table: SegmentedTabSelect (context). Evidence: scripts/check-conventions.mjs:187-188.
- R7 table: CopyButton (navigator.clipboard). Evidence: scripts/check-conventions.mjs:168-169.
- R7 table: CalendarGrid (per-day onClick closures). Evidence: scripts/check-conventions.mjs:164-165.
- R7 table: DatePicker forwards onValueChange into Calendar. Evidence: scripts/check-conventions.mjs:170-171.
- R7 table: composeRefs calls only useCallback, no directive. Evidence: src/utils/composeRefs.ts:1-5.
- R7 table: Checkbox, Tabs, Popover, Tooltip carry no directive. Evidence: first lines of each file; absent from scripts/check-conventions.mjs:145-202.
- R7 table: Button/constants.ts and Toggle/toggleOption.ts carry no directive. Evidence: src/components/Button/constants.ts:1-2; src/components/Toggle/toggleOption.ts:21-22.
- R7: The header contract comes first; the directive may follow it. Evidence: scripts/add-use-client.mjs:10-13; src/components/Input/Input.tsx:1-84.
- R7: A JS timer or rAF needs a TIMER_ALLOWLIST entry with its call count. Evidence: scripts/check-conventions.mjs:204-212, 414-434, 675.
- R7: Existing timer entries: CopyButton reverts its copied confirmation; two rAF loops redraw geometry; none fetches or polls. Evidence: scripts/check-conventions.mjs:206-211.
- R8: Sticker and StickerVariant are exported from ../Sticker; StickerVariant has secondary, alternate, danger; `custom` requires `color`. Evidence: src/components/Sticker/index.ts:1-3; src/components/Sticker/constants.ts (StickerVariant); src/components/Sticker/Sticker.tsx:60-71.
- R8: The ServiceStatus DS-side and app-side example typechecks (strict, react-jsx, bundler resolution, against the repo's Sticker and @types/react). Evidence: scratchpad tsc run on 2026-10-10, exit 0, no diagnostics.
- R9: Button medium is `h-button-medium ds-px-button-medium rounded-full` with the hero button text role. Evidence: src/components/Button/Button.tsx:117, 142-145.
- R9: Every tab size is rounded-tight or rounded-mini with px-rg or p-0; TabsTrigger renders ButtonText. Evidence: src/components/Toggle/toggleOption.ts:53-68; src/components/Tabs/Tabs.tsx:47.
- R9: toggleOptionVariants is shared by TabsTrigger and ToggleSwitchItem. Evidence: src/components/Toggle/toggleOption.ts:2-3; src/components/Tabs/Tabs.tsx:9, 27; src/components/Toggle/Toggle.tsx:42, 165.
- R9: ToggleSwitch reaches the recipe only through ToggleSize and OPTION_SIZE. Evidence: src/components/Toggle/Toggle.tsx:45-50, 145-150, 158, 167; src/components/Toggle/constants.ts:28-34.
- R9: ds-px-button-medium is 22px. Evidence: src/styles/dooph-component-tokens.css:596-597 (`padding-inline: var(--ui-spacing-button-medium-x)`); src/styles/tokens.css:491 (`--ui-spacing-button-medium-x: 22px`).
- R9: The TabSize JSDoc gives standard and sm `rg` (10px) horizontal padding, matching the recipe's `px-rg`, so the worked hand-back flags nothing. Evidence: src/components/Tabs/constants.ts:9, 11; src/components/Toggle/toggleOption.ts:55, 57; spacing scale rg = 10 (src/styles/tokens.css:585).
- R9: ButtonText is the 14px button role; the hero button role is 16px. Evidence: src/components/Button/Button.tsx:140-141.
