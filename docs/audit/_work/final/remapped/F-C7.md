# F-C7 — final findings @ b436647

### F-022: SliderStepped calls preventDefault in Radix's onKeyDown and re-implements stepping, dropping Radix's x10 PageUp/PageDown/Shift+Arrow jumps
- severity: S2
- category: rule-violation
- rules: [R2.10, R9.6]
- scope: consumer-visible
- confidence: confirmed
- verified_by: "U6 read of Slider.tsx:212-255 plus the built copy's @radix-ui/react-slider index.mjs:161-163 (multiplier). V6 re-read Slider.tsx:142-255/:313-321 and Radix 1.4.7 index.mjs:158-173, :331-352: composeEventHandlers skips Radix's onStepKeyDown once the DS handler calls preventDefault (:250); SliderContinuous returns early at :214 and keeps Radix's x10."
- locations:
  - src/components/Slider/Slider.tsx:83-87
  - src/components/Slider/Slider.tsx:212-255
  - src/components/Slider/Slider.tsx:317
  - src/components/Slider/Slider.stories.tsx:304
  - .agents/skills/dooph-ds-architecture/SKILL.md:160
  - .agents/skills/dooph-ds-architecture/SKILL.md:186
- evidence: |
    Slider.tsx:87       const DRAG_SUBDIVISIONS = 100;
    Slider.tsx:214      if (!showSteps || event.defaultPrevented || props.disabled) return;
    Slider.tsx:232-234  case 'ArrowDown': / case 'PageDown': / next = from - step;
    Slider.tsx:236-238  case 'ArrowUp': / case 'PageUp': / next = from + step;
    Slider.tsx:250      event.preventDefault(); // stops Radix moving by the fine drag step
    Slider.tsx:317      step={showSteps ? step / DRAG_SUBDIVISIONS : step}
    Slider.stories.tsx:304  'Focus the handle (Tab) then use Left/Right (or Up/Down) to move by one step; … The stepped slider handles it itself, … so a key press must still move exactly one dot.'
    arch SKILL.md:186   - `e.stopPropagation()` / `e.preventDefault()` on Radix internal event handlers
    Radix 1.4.7 dist/index.mjs:161-163 (build copy)  const isPageKey = PAGE_KEYS.includes(event.key); const isSkipKey = isPageKey || event.shiftKey && ARROW_KEYS.includes(event.key); const multiplier = isSkipKey ? 10 : 1;
- impact: On SliderContinuous, PageUp/PageDown and Shift+Arrow move 10 steps (Radix); on SliderStepped every one of those keys moves exactly one dot, because the DS switch maps PageUp/PageDown to `from ± step` and never reads `event.shiftKey` (Shift+Arrow falls through the plain Arrow cases). A keyboard user meets two sliders on one page that answer the same keys differently, and the stepped slider carries a second keyboard implementation that will not pick up future Radix fixes. The override is load-bearing — Root is fed a step 100x finer than the real one (:317) so drag tracks the pointer — and it uses Radix's designed opt-out (consumer onKeyDown composed ahead of Radix), documented at :217-220 and in the story; but arch:186 bans preventDefault on Radix handlers and, unlike DropdownMenuMultiSelectItem (arch:160, R2.5), this case has no sanction. User-facing cost is modest (WAI-ARIA APG makes the large increment optional; stepped sliders usually have few dots, so x10 mostly clamps to an end) — V6 notes a reviewer could call it S3.
- recommendation: Keep the fine-step drag mechanism and the DS keyboard handler, but make it match Radix's semantics: in handleKeyDown compute `const multiplier = event.key === 'PageUp' || event.key === 'PageDown' || (event.shiftKey && event.key.startsWith('Arrow')) ? 10 : 1;` and use `step * multiplier` in the four Arrow/Page cases (the existing clamp at :251 keeps the result in range). Then record the sanction: add a sentence to arch SKILL.md beside :160/:186 stating that SliderStepped's handleKeyDown pre-empts Radix's step keys via preventDefault in the consumer-composed onKeyDown because Root runs at `step / DRAG_SUBDIVISIONS`, and that it must mirror Radix's multiplier; update rulebook-facing text (R2.10 exception list) accordingly. Update the KeyboardInteraction story description (:304) to mention PageUp/PageDown/Shift+Arrow moving 10 dots. Verify in the Slider KeyboardInteraction story: PageUp and Shift+ArrowRight on the stepped and the continuous slider both move 10 steps (or clamp to the end).
- breaking: none
- contract: n/a (Slider.tsx opens with `'use client';` and has no `## behavior`/`## constraints` header)
- remediation: [WI-105]
- related: [F-089]

### F-029: Inline-style precedence is decided three ways, and a consumer style on TableHeader or TableRow wipes out the column grid
- severity: S2
- category: inconsistency
- rules: [R8.12, R1.7]
- scope: consumer-visible
- confidence: confirmed
- verified_by: "U12 read of Table.tsx (style not destructured in TableHeader/TableRow). HB facts.cjs styleOrder column + rg of every `style=`/`...style` merge site. V6 scratch/V6/style-merge.cjs SSR from dist/index.cjs: TableRow with no style → `grid-template-columns:var(--table-cols);height:var(--table-row-height, auto)`; with style={{opacity:.5}} → `opacity:0.5` (grid and height gone); Table merges (`--table-cols:1fr 2fr;opacity:0.5`)."
- locations:
  - src/components/Table/Table.tsx:22-37
  - src/components/Table/Table.tsx:45-52
  - src/components/Table/Table.tsx:107-122
  - src/components/Text/BaseText.tsx:49-51
  - src/components/Text/BaseText.tsx:90-97
  - src/components/LoadingSpinner/LoadingSpinner.tsx:194
  - src/components/Menu/DropdownMenu.tsx:395
  - src/components/LinearProgressIndicator/LinearProgressIndicator.tsx:48-53
  - src/components/Sticker/Sticker.tsx:120-127
  - src/components/AIChat/AIModelSelect.tsx:89-96
  - .agents/skills/dooph-ds-contribution/SKILL.md:54
  - skills/dooph-design-system-usage/SKILL.md:291-294
- evidence: |
    Table.tsx:23    ({ className, columns, rowHeight, style, ...props }, ref) => (      Table.tsx:34  ...style,      ← root merges, consumer last
    Table.tsx:46    ({ className, ...props }, ref) => (
    Table.tsx:50        style={{ gridTemplateColumns: "var(--table-cols)" }}
    Table.tsx:51        {...props}                                                       ← a consumer `style` in props replaces the object
    Table.tsx:108   ({ className, ...props }, ref) => (
    Table.tsx:117-121   style={{ / gridTemplateColumns: "var(--table-cols)", / height: "var(--table-row-height, auto)", / }} / {...props}
    | order | site |
    | own values, then consumer `style` (consumer wins) | BaseText.tsx:95 `? ({ ...typography, ...style } as CSSProperties)`; LoadingSpinner.tsx:194 `style={{ width: cssSize, height: cssSize, ...style }}`; Table.tsx:30-35 |
    | consumer `style`, then own values (component wins) | DropdownMenu.tsx:395 `style={width === undefined ? style : { ...style, width }}`; LinearProgressIndicator.tsx:50-52 `...style, / '--progress-pct': pct, / '--ds-progress-color': resolveDsColor(color, DEFAULT_COLOR),`; Sticker.tsx:123-125 `...style, / color: customColor,`; AIModelSelect.tsx:91-93 `...style, / ...(color / ? { "--ds-chat-model-color": resolveDsColor(color, "") }` |
    | set `style=`, then spread props (consumer replaces) | Table.tsx:50-51, :117-121 |
    BaseText.tsx:51   overridable. `style` still outranks props, as the last-resort escape hatch.
    usage SKILL.md:293-294  (`leading-[1.4]`, `text-2xl`) can override it. A `style` prop still outranks / props, as the last resort.
    contribution SKILL.md:54  … Never for a design value the component itself decided; that is a token. Merge a consumer's own `style` rather than replacing it
    HB tally across src/components: 22 components consumer-wins, 7 component-wins, 2 replace (TableHeader, TableRow).
- impact: A consumer who dims a pending row with `<TableRow style={{ opacity: 0.5 }}>` or tints it with `style={{ background }}` silently loses `grid-template-columns` and the row height, so the row's cells stop lining up with the header columns — no type error, no warning, while `<Table style>` in the same 164-line file merges correctly. That breaks contribution SKILL.md:54's "Merge a consumer's own `style` rather than replacing it". Beyond Table, R8.12 states that styles merge but not in which order, so each of the three idioms looks compliant: copying LoadingSpinner teaches `{...own, ...style}`, copying DropdownMenuSection teaches `{...style, ...own}`, copying TableRow teaches "set style, then spread props". The only written order (BaseText:51, shipped at usage SKILL.md:293-294) is scoped to typography, and it holds for the consumer-wins components only. (V6 refuted the companion claim that Slider's style merge stops consumers overriding its track defaults: those defaults are `var(--ui-*)` references the consumer can retune per instance, so Slider is not part of this finding's harm.)
- recommendation: (1) Fix the bug: in TableHeader and TableRow destructure `style` and merge it last, matching Table — `({ className, style, ...props }, ref)` and `style={{ gridTemplateColumns: "var(--table-cols)", ...style }}` (TableHeader) / `style={{ gridTemplateColumns: "var(--table-cols)", height: "var(--table-row-height, auto)", ...style }}` (TableRow). (2) Write the order into contribution SKILL.md:54: "Spread the consumer's `style` last, after the component's own values. Only a value driven by an explicit prop the consumer controls (e.g. DropdownMenuSection `width`, LinearProgressIndicator `value`/`color`, Sticker `custom` `color`, AIModelSelect `color`) may be written after it; name that exception in the component's header." This leaves the four component-wins sites' behaviour unchanged (each value comes from an explicit prop). Verify with an SSR script against a scratch-worktree build: `<TableRow style={{opacity:.5}}>` renders a style containing both `grid-template-columns:var(--table-cols)` and `opacity:0.5`; `rg -n '^\s+style=\{\{' src/components/Table/Table.tsx` shows every object ending in `...style`.
- breaking: none
- contract: src/components/Text/BaseText.tsx:49-51 "`style` still outranks props, as the last-resort escape hatch" → consistent (the recommendation generalises it). src/components/Sticker/Sticker.tsx:13-15 "`color` (inline, so it beats class order) is the content colour" → consistent (about class order, not `style` order; the explicit-prop exception covers it). src/components/LinearProgressIndicator/LinearProgressIndicator.tsx:6-14, src/components/Menu/DropdownMenu.tsx:8-20 and src/components/AIChat/AIModelSelect.tsx:11-20 headers say nothing about `style` precedence → consistent. Table.tsx has no `## behavior`/`## constraints` header.
- remediation: [WI-106]
- related: [F-062, F-113]

### F-031: Value-holding controls name their change callback three ways and the force-active boolean four ways
- severity: S2
- category: inconsistency
- rules: []
- scope: consumer-visible
- confidence: confirmed
- verified_by: "HB rg of value/defaultValue/onValueChange/onChange/selected/onSelect declarations over every non-native value control, plus force-state booleans at their declarations. V7 M45: grep of every `on*Change|onChange|onSelect` prop + Radix roots wrapped → 7 controls on value/onValueChange, 4 deviators (Calendar, DatePicker, DatePickerSplitTrigger, VerificationCodeInput); `onChange` carries 3 payload types; no skill names the convention."
- locations:
  - src/components/Toggle/Toggle.tsx:55-58
  - src/components/AIChat/AIModelSelect.tsx:116-117
  - src/components/VerificationCode/VerificationCodeInput.tsx:5-6
  - src/components/VerificationCode/VerificationCodeInput.tsx:29-34
  - src/components/DatePicker/DatePicker.tsx:39-40
  - src/components/DatePicker/DatePicker.tsx:46-47
  - src/components/DatePicker/DatePicker.tsx:134-135
  - src/components/DatePicker/DatePicker.tsx:149-150
  - src/components/Calendar/Calendar.tsx:49-50
  - src/components/Calendar/Calendar.tsx:55-56
  - src/components/Calendar/rangeSelection.ts:18
  - src/components/DatePicker/DatePickerSplitTrigger.tsx:28-31
  - src/components/AnimatedText/RollHoverText.tsx:11-12
  - src/components/AnimatedText/UnderlineLinkText.tsx:5-6
  - src/components/SidebarWithHoverIcon/SidebarWithHoverIcon.tsx:19
  - src/components/SidebarWithHoverIcon/SidebarWithHoverIcon.tsx:60-63
  - src/components/OutlineButton/OutlineButton.tsx:21-26
  - src/components/OutlineButton/OutlineButton.tsx:33
  - src/components/HotkeyIndicator/HotkeyIndicator.tsx:6
  - src/components/Tooltip/Tooltip.tsx:35
  - src/components/AIChat/AIModelSelect.tsx:212
  - .agents/skills/dooph-ds-codebase/SKILL.md:127
  - skills/dooph-design-system-usage/SKILL.md:113
- evidence: |
    Toggle.tsx:58                    onValueChange?: (value: string) => void;     ← also AIModelSelect.tsx:117 (AIThinkingEffortSelector), Slider/Tabs/SegmentedTabSelect/DropdownMenuRadioGroup via Radix roots
    VerificationCodeInput.tsx:30     extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
    VerificationCodeInput.tsx:34     onChange?: (value: string) => void;          ← a string, while Input's onChange is a ChangeEvent
    DatePicker.tsx:39-40             value: Date; / onChange: (date: Date) => void;
    DatePicker.tsx:134-135           selected={props.value} / onSelect={props.onChange}   ← renamed on forward
    Calendar.tsx:49-50               selected: Date; / onSelect: (date: Date) => void;
    DatePickerSplitTrigger.tsx:28,31 value: DateRange; / onSelect: (range: DateRange) => void;   ← mixes both vocabularies
    rangeSelection.ts:18             * `onChange` must fire only for a "commit" result. …   ← comment about Calendar's onSelect
    RollHoverText.tsx:12 `active?: boolean;` · UnderlineLinkText.tsx:6 `active?: boolean;` · SidebarWithHoverIcon.tsx:63 `hovered?: boolean;` · OutlineButton.tsx:33 `glowing?: boolean;` · HotkeyIndicator.tsx:6 `pressed?: boolean;`
    OutlineButton.tsx:24-26          * would blend in. Mirrors the `themeInverse` pattern on Tooltip. */ / inverseTheme?: boolean;     vs Tooltip.tsx:35 `themeInverse?: boolean;`, AIModelSelect.tsx:212 `themeInverse = false,`
- impact: A consumer moving from ToggleSwitch, SegmentedTabSelect or AIPromptInput (`onValueChange`) to VerificationCodeInput must rename the callback, and `onChange` there receives a string while Input's `onChange` two rows away in the same form receives a ChangeEvent — a shared form adapter written for one misreads the other wherever types are loose. Going from DatePicker to an inline Calendar renames both props (`value`/`onChange` → `selected`/`onSelect`), and DatePickerSplitTrigger mixes the two; the drift already confuses maintainers (rangeSelection.ts:18 calls Calendar's `onSelect` "onChange"). "Force the hover/active look from outside" is `active` on two text components, `hovered`, `glowing` and `pressed` elsewhere, and OutlineButton spells the inverse-surface flag `inverseTheme` while its own JSDoc says it mirrors Tooltip's `themeInverse`. TypeScript catches each wrong guess (V7: no silent misuse, low-end S2), but no name can be predicted from a sibling, and the next DS author has three conventions to copy and no rule (R1.11 covers only `variant`/`size`). (V7 corrections applied: AIModelSelect.tsx:117 is AIThinkingEffortSelector; CalendarPresetItem's `onSelect` is an action callback, not a value pair, and is not counted.)
- recommendation: Decision D-13 chooses the convention and whether to rename in the major. Recommended option, for the blocked WI: (1) write the rule beside R1.11 in arch SKILL.md — "DS-owned value controls use `value`/`defaultValue`/`onValueChange(value)` (Radix's names); native `onChange(event)` only where the root is a native input; a forced interaction look is the boolean `active`; an inverse-surface flag is `themeInverse`". (2) In the 6.0.0 major, rename with no alias shims (repo practice): VerificationCodeInput `onChange` → `onValueChange` (keep `"onChange"` in its `Omit<HTMLAttributes<HTMLDivElement>, …>` so the native div handler stays excluded); DatePicker `onChange` → `onValueChange` (both union arms); Calendar `selected`/`onSelect` → `value`/`onValueChange` (both arms; DatePicker.tsx:134-135/:149-150 forward `value`/`onValueChange`); DatePickerSplitTrigger `onSelect` → `onValueChange`; SidebarWithHoverIcon `hovered`, OutlineButton `glowing`, HotkeyIndicator `pressed` → `active`; OutlineButton `inverseTheme` → `themeInverse`. (3) Update in the same commits: VerificationCodeInput.tsx:5-6 header, SidebarWithHoverIcon.tsx:19 header identifier, rangeSelection.ts:18 comment, codebase SKILL.md:127, usage SKILL.md:113 and :203-205, every story, and list each rename in the v6 migration skill (depends on WI-122, WI-122, D-01). Verify with `rg -n '^\s+(onChange|onSelect|selected|hovered|glowing|pressed|inverseTheme)\??:' src/components --glob '!*.stories.tsx'` → only native-input `onChange` and CalendarPresetItem's action `onSelect` remain, plus `npm run lint` exit 0.
- breaking: major
- contract: src/components/VerificationCode/VerificationCodeInput.tsx:5-6 "Controlled via `value` + / `onChange`, or uncontrolled via `defaultValue`." (## behavior) → consistent if the header is updated in the same commit (AGENTS.md: code and contract ship together). src/components/SidebarWithHoverIcon/SidebarWithHoverIcon.tsx:19 "`hovered` is CONTROLLED. The component must not go looking for an" → consistent: the constraint is about controlled-ness; a rename keeps it and updates only the identifier.
- remediation: decision D-13 (WI-127 blocked)
- related: [F-040, F-061, F-070, F-101, F-113]

### F-038: Discriminated-union guards don't match runtime: icon={null}/false and color="" compile, Calendar warns then TypeErrors, NaN progress draws a full ring
- severity: S2
- category: type-safety
- rules: [R1.6]
- scope: consumer-visible
- confidence: confirmed
- verified_by: "U6 tsc probe on the built dist/index.d.ts; U7 code trace Calendar.tsx:61-151 → dateUtils.ts:50; U9 reasoning on PI.tsx:292. V4 M42: tsc probe (only the omitted-prop cases error; icon={null|undefined|false}, color=\"\", progress={NaN} compile), react-dom/server runs of dist/index.cjs in dev and production (Calendar warns then `TypeError … 'getFullYear'`; DatePicker TypeErrors with no warning; mode \"single\" renders as range), and a Browser-pane render of NaN progress (flat variant paints a full ring)."
- locations:
  - src/components/Input/Input.tsx:28-31
  - src/components/Input/Input.tsx:56-60
  - src/components/Input/Input.tsx:99-103
  - src/components/Slider/Slider.tsx:38-43
  - src/components/Slider/Slider.tsx:286-294
  - src/components/Calendar/Calendar.tsx:61-85
  - src/components/Calendar/Calendar.tsx:138-152
  - src/components/Calendar/dateUtils.ts:49-50
  - src/components/DatePicker/DatePickerTrigger.tsx:45-47
  - src/components/ProgressIndicator/ProgressIndicator.tsx:45-47
  - src/components/ProgressIndicator/ProgressIndicator.tsx:269
  - src/components/ProgressIndicator/ProgressIndicator.tsx:292-296
  - src/components/ProgressIndicator/ProgressIndicator.tsx:303
  - src/components/AIChat/AIContextGauge.tsx:12-18
  - .agents/skills/dooph-ds-architecture/SKILL.md:101-107
  - .agents/skills/dooph-ds-codebase/SKILL.md:259-263
  - .claude/research/2026-08-27-date-picker-foundation-research.md:576
- evidence: |
    Input.tsx:59     icon: ReactNode;                     ← ReactNode admits null | undefined | false | ""
    Input.tsx:99     if (hasIcon && icon == null) {       ← null/undefined throw; false/""/0 render an empty icon span (V4)
    Input.tsx:101    `Input: variant "${variant}" requires an \`icon\` prop.`,
    Input.tsx:28     * - An icon variant without `icon` throws. The props union is the real guard;
    Slider.tsx:41    color: DsColor;                      ← DsColor = token | (string & {}), admits ""
    Slider.tsx:288   if (variant === SliderVariant.custom && !color) {        Slider.tsx:290  '[Slider] variant="custom" has no palette of its own and requires a ' +
    Calendar.tsx:62  if (process.env.NODE_ENV === "production") return;
    Calendar.tsx:71      return;                          ← returns from the warn helper; render continues
    Calendar.tsx:142   mode === DatePickerMode.singleDay ? props.selected : props.selected.from;   ← any other mode string is treated as range
    Calendar.tsx:151   clampMonthToYearBounds(startOfMonth(anchorDate), yearBounds),
    dateUtils.ts:50  return new Date(date.getFullYear(), date.getMonth(), 1);   ← TypeError on undefined
    DatePickerTrigger.tsx:46  ? formatSingleLabel(props.value, today, locale)   ← crashes first, no warning
    research:576     Enforcement: `console.warn` in development on a missing or malformed value … and render nothing rather than crashing.
    PI.tsx:47        * Throws in development if the value is outside this range.      vs PI.tsx:269 `* Throws if `progress` is outside [0, 1] — invalid values are always a bug.`
    PI.tsx:292       if (progress < 0 || progress > 1) {   ← NaN passes
    PI.tsx:303       "aria-valuenow": Math.round(progress * 100),
    V4 runtime: progress={NaN} → aria-valuenow="NaN", stroke-dashoffset="NaN" (React warning); computed style on the default flat variant: indicator dasharray 61.2611px, dashoffset 0px → a FULL primary ring.
- impact: Arch:101-107, codebase:259-263 and Input.tsx:28 promise that the union is the real guard and the throw covers only JS consumers and runtime-computed variants. In fact a TypeScript consumer forwarding an optional icon (`icon={props.icon}`) or an empty colour compiles cleanly and crashes the render tree, while `icon={cond && <Icon/>}` evaluating to `false` neither errors nor throws and renders the empty icon slot the header says the throw prevents. For Calendar, a JS consumer or a cast/runtime value passing `selected={undefined}` gets a dev warning and then an incidental `Cannot read properties of undefined (reading 'getFullYear')` (production: TypeError only), against the recorded decision to render nothing (research:576); DatePicker crashes in its trigger before the Calendar warning can run, and an unknown `mode` string silently renders range behaviour. `progress={done / total}` with `total === 0` — the common runtime slip — slips past the throw and the default flat ProgressIndicator paints a complete ring, telling the user the task is done, with `aria-valuenow="NaN"`. The two throw guards also differ in test (`== null` vs falsy) and message prefix (`Input:` vs `[Slider]`). (V4 corrections applied: arch cites CalendarProps for the union only, not for the throw, so there is no arch-vs-research conflict; U3-F6's RollingDigitsText claim is refuted by its own header and is not part of this finding; NaN paints a full ring on flat, an empty one only on wavy.)
- recommendation: D-12 fixes the policy (tighten types; Calendar invalid value: throw vs render nothing). Recommended option, for the blocked WI: (1) Input: type the icon arms `icon: ReactElement` (usage is `<PencilIcon />`, Input.tsx:58) and guard `if (hasIcon && !isValidElement(icon)) throw new Error('[Input] variant "…" requires an `icon` element.')`; Slider keeps `!color` (a non-empty string is not expressible in TS — say so in the `color` JSDoc at :40) and both messages use the `[Component]` prefix. (2) Calendar: implement research:576 — make the validator return a boolean (also rejecting a `mode` that is neither `DatePickerMode.singleDay` nor `.dateRange`), and `return null` from Calendar before any date maths when it fails; keep the dev-only warning. DatePickerTrigger/DatePicker: same check before `formatSingleLabel`/`formatRangeLabel`, rendering the trigger with an empty label instead of crashing. (3) ProgressIndicator: guard `if (!(progress >= 0 && progress <= 1))` so NaN throws (the stale "Throws in development" JSDoc at :47 is F-050's fix; do not duplicate it). (4) If D-12 picks throw for Calendar instead, replace step 2 with an unconditional `throw new Error('[Calendar] …')` and amend research:576. Verify with a react-dom/server script against a scratch-worktree build: Calendar `selected={undefined}` renders "" (no TypeError); `<ProgressIndicator progress={NaN}>` throws `[ProgressIndicator]`; a tsc probe shows `icon={null}`/`icon={false}` now error.
- breaking: minor
- contract: src/components/Input/Input.tsx:28-31 "An icon variant without `icon` throws. The props union is the real guard; the throw covers JavaScript consumers and runtime-computed variants — rendering a variant with an empty icon slot would silently misreport what was asked for" → consistent (tightening the type makes "the union is the real guard" true; the empty-slot case the constraint forbids is what the fix removes). src/components/AIChat/AIContextGauge.tsx:12-18 "an out-of-range ratio reaches ProgressIndicator — which THROWS … 0/0 is NaN, which would otherwise slip past the range guard and render garbage" → consistent (the header already records the NaN hole; its own `budget <= 0` guard keeps the gauge from ever passing NaN, so making ProgressIndicator throw on NaN changes nothing for it). Calendar.tsx, Slider.tsx, ProgressIndicator.tsx and DatePickerTrigger.tsx have no `## behavior`/`## constraints` header.
- remediation: decision D-12 (WI-128 blocked)
- related: [F-050]
- note-to-orchestrator: typing the icon arms as `ReactElement` rejects string/number icons that compile today (map says breaking: minor); if D-12 treats that narrowing as breaking, the type change moves to P4 while the runtime guard, Calendar and NaN fixes stay non-breaking.

### F-039: Whether a consumer can reach a component's element is answered five ways; four of them block ref or rest props
- severity: S2
- category: api-design
- rules: [R8.5, R8.6, R3.1]
- scope: consumer-visible
- confidence: confirmed
- verified_by: "HB facts.cjs → 110/122 authored components use forwardRef; the 12 non-forwardRef bodies, 2 named-only destructures and TableHeaderCell read; MRS override path reasoned from React 19 ref-as-prop + spread order (not executed). V8 M78 (U7-F8, U10-F7) CONFIRMED: DatePickerSharedProps is a closed list, Calendar.tsx:124 takes no ref and its root (:319-321) spreads nothing, BaseIcon/BaseShape take closed props; forwardRef<SVGSVGElement> precedents at AIContextGauge.tsx:38, LoadingSpinner.tsx:289, WavyDivider.tsx:55."
- locations:
  - src/components/WavyDivider/WavyDivider.tsx:55
  - src/components/HotkeyIndicator/HotkeyIndicator.tsx:4-11
  - src/components/MorphRotationShape/MorphRotationShape.tsx:165-181
  - src/components/MorphRotationShape/MorphRotationShape.tsx:270-273
  - src/components/MorphRotationShape/MorphRotationShape.tsx:300-302
  - src/components/MorphRotationShape/MorphRotationShape.tsx:342-348
  - src/components/ShapeMorphSpinner/ShapeMorphSpinner.tsx:38
  - src/components/ShapeMorphSpinner/ShapeMorphSpinner.tsx:47-56
  - src/components/ShapeMorphSpinner/ShapeMorphSpinner.tsx:70
  - src/components/DropdownCaret/DropdownCaret.tsx:39-44
  - src/components/SplitButton/SplitButton.tsx:71-89
  - src/components/Table/Table.tsx:70-88
  - src/components/DatePicker/DatePicker.tsx:15-33
  - src/components/DatePicker/DatePicker.tsx:107-130
  - src/components/Calendar/Calendar.tsx:124
  - src/components/Calendar/Calendar.tsx:319-321
  - src/components/Calendar/CalendarCaption.tsx:30-38
  - src/components/Icons/BaseIcon.tsx:17-26
  - src/components/Icons/BaseIcon.tsx:38-62
  - src/components/Shapes/BaseShape.tsx:4-9
  - src/components/SidebarWithHoverIcon/SidebarWithHoverIcon.tsx:56
  - src/components/SidebarWithHoverIcon/SidebarWithHoverIcon.tsx:83-87
  - src/components/SidebarWithHoverIcon/SidebarWithHoverIcon.tsx:133
  - .agents/skills/dooph-ds-contribution/SKILL.md:44-46
- evidence: |
    | convention | path:line | snippet |
    | forwardRef + spread (110 components) | WavyDivider.tsx:55 | `export const WavyDivider = forwardRef<SVGSVGElement, WavyDividerProps>(` |
    | no forwardRef; React 19 ref rides `...props` but the type has no `ref` | HotkeyIndicator.tsx:4, :9, :11 | `export interface HotkeyIndicatorProps extends HTMLAttributes<HTMLSpanElement> {` / `function HotkeyIndicator({ keys, pressed = false, className, ...props }: HotkeyIndicatorProps) {` / `<span className={cn('inline-flex items-center gap-1', className)} {...props}>` |
    | private ref, rest spread AFTER it | MorphRotationShape.tsx:343, :348, :301-302 | `ref={spanRef}` … `{...spanProps}`; `const span = spanRef.current;` / `if (!span) return;` |
    | same, inherited | ShapeMorphSpinner.tsx:47, :55, :70 | `export const ShapeMorphSpinner = ({` … `...rest` … `{...rest}` (plain function, no forwardRef; rest flows into MorphRotationShape) |
    | closed props | DropdownCaret.tsx:44 | `export const DropdownCaret = ({ variant = DropdownCaretVariant.dropdown, className }: DropdownCaretProps) => (` |
    | closed props | SplitButton.tsx:80, :89 | `function SplitButton({` … `<div className={cn("inline-flex rounded-tight shadow-button", className)}>` |
    | closed props | DatePicker.tsx:15, :130 | `type DatePickerSharedProps = {` (open … className only); `<PopoverContent>` with no props |
    | closed props | Calendar.tsx:124, :319-321 | `function Calendar(props: CalendarProps) {` / `<div` / `data-mode={mode}` / `className={cn("flex items-stretch", className)}` (no spread) |
    | closed props | BaseIcon.tsx:17-26, :56 | `export interface IconProps {` size/color/strokeWidth/strokeColor/fillColor/className/children/"aria-hidden" only; `style={{` built internally, no rest |
    | closed props | BaseShape.tsx:4-9 | `export interface ShapeProps {` size/strokeColor/fillColor/strokeWeight (not even className) |
    | props on a non-interactive wrapper | Table.tsx:74-83 | `<div` / `ref={ref}` / `className={cn("flex items-center", className)}` / `{...props}` … `<Button` … `onClick={onSort}` (sort control gets fixed props only) |
    contrib SKILL.md:45-46  - [ ] `forwardRef` on every wrapped Radix part / - [ ] `...props` spread onto the Radix element   ← scoped to Radix parts; nothing governs the other components
- impact: Radix `asChild` triggers (TooltipTrigger, PopoverTrigger, DropdownMenuTrigger) merge a ref and event handlers into their child. Around the 110 forwardRef+spread components that works; around the rest it fails four different ways. Handlers and ref vanish silently on DropdownCaret, SplitButton, Calendar, every icon and shape and SidebarWithHoverIcon (an icon placed directly under `asChild` never opens its trigger). TypeScript rejects a direct `ref=` on HotkeyIndicator while Slot still injects one. On MorphRotationShape (and ShapeMorphSpinner, which spreads `...rest` into it) a ref arriving as a React 19 prop lands after `ref={spanRef}`, so `spanRef` stays null: the layout effect returns early (:302), sampling stops (:270-273) and the shape renders frozen with no error (reasoned, not executed). A consumer cannot give the DatePicker trigger an `id` for `<label htmlFor>`, an `aria-label` or `aria-describedby`, nor set PopoverContent `align`/`side`; Calendar's root cannot take `id`/`aria-*`/`data-*`/`style`/ref; a meaningful icon cannot get an accessible name. On a sortable TableHeaderCell, `aria-*`/`onKeyDown` meant for the sort control land on a `<div>`. For the next agent, copying WavyDivider teaches forwardRef+spread, copying MorphRotationShape teaches "private ref, spread after it" (the bug), copying HotkeyIndicator teaches "React 19 makes forwardRef unnecessary" without the type — and R8.5/R8.6 cover only wrapped Radix parts (V8 keeps the composite/SVG members at S3 for that reason; the cluster is S2).
- recommendation: One convention for every component that renders its own element: `forwardRef` + rest props spread onto the element that owns the component's role, consumer `className` merged and consumer `style` merged last. Concretely: (1) contribution SKILL.md:44-46 — widen the two checklist lines from "every wrapped Radix part" to "every component that renders its own element", and add "if the component also needs its own ref, compose the two with the shared ref-merge helper (F-085), never by spread order". (2) HotkeyIndicator: `forwardRef<HTMLSpanElement, HotkeyIndicatorProps>` + displayName. (3) MorphRotationShape: forwardRef through the outer component to the inner one and compose the forwarded ref with `spanRef` (F-085's helper) so `spanRef.current` is always the span; ShapeMorphSpinner: forwardRef<HTMLSpanElement> passed to MorphRotationShape, plus displayName (its role/size divergence stays with F-072). (4) BaseIcon: forwardRef<SVGSVGElement> + rest typed `Omit<SVGProps<SVGSVGElement>, keyof IconProps | "ref">` spread onto `<svg>`, consumer `style` merged after the size/stroke values; SidebarWithHoverIcon forwards its ref and rest to BaseIcon; BaseShape gains `className` and the same rest/ref. (5) Calendar: forwardRef<HTMLDivElement> + `Omit<HTMLAttributes<HTMLDivElement>, "onSelect" | "defaultValue">` rest spread on the root `<div>` (merge the internal `onKeyDown` by calling the consumer's first); DatePicker: add `triggerProps?: Omit<ComponentPropsWithoutRef<typeof DatePickerTrigger>, "mode" | "value">` and `contentProps?: ComponentPropsWithoutRef<typeof PopoverContent>`, mirroring DatePickerSplitTrigger's `triggerProps`. (6) SplitButton: forwardRef<HTMLDivElement> + `HTMLAttributes<HTMLDivElement>` rest on the root `<div>`. (7) TableHeaderCell: add `buttonProps?: ComponentPropsWithoutRef<typeof Button>` spread onto the sort Button (done in the Table WI). (8) DropdownCaret stays closed: it is an aria-hidden decorative part whose header forbids state props and listeners — name it as the one exception in the new checklist line. Verify: a tsc probe against a scratch-worktree build accepts `<HotkeyIndicator ref={r}>`, `<CheckIcon aria-label="ok" onClick={f} ref={s}>`, `<Calendar id="c" … ref={d}>`, `<SplitButton ref={e} data-x="1">`; an SSR script renders `<Calendar id="c" aria-label="x" …>` with both attributes on the root and `<DatePicker triggerProps={{ id: "dp" }} …>` with `id="dp"` on the trigger button; the MorphRotationShape and ShapeMorphSpinner stories still animate with a ref attached; `npm run lint` exit 0.
- breaking: none
- contract: src/components/MorphRotationShape/MorphRotationShape.tsx:41-44 "Sampling starts from this element's OWN transitionrun / animationstart / animationiteration events and stops when the value lands. Never listen on an ancestor (Rule 7)" → consistent (a composed ref keeps the listeners on the span itself). MorphRotationShape.tsx:38-40 "`d` and the transform are in JSX only for the FIRST render … After that React must never touch them" → consistent (a ref adds no `d`/transform writes). src/components/DropdownCaret/DropdownCaret.tsx:23 "No state props and no listeners (Rule 7): hosts drive it through CSS only." → consistent only because the recommendation leaves DropdownCaret closed; opening it to rest props would admit listeners and must be raised, not done.
- remediation: [WI-106, WI-107, WI-108, WI-109]
- related: [F-028, F-042, F-063, F-072, F-085, F-092, F-095]

### F-040: VerificationCodeInput stores a gapless string, so a digit typed into a later empty cell lands in the first one and deleting a middle digit shifts the rest
- severity: S2
- category: api-design
- rules: []
- scope: consumer-visible
- confidence: confirmed
- verified_by: "U6 hand trace of VerificationCodeInput.tsx:86-92 with value \"\" and a keystroke in cell 3. V6 M41: read the whole file and CodeDigitInput (only a pass-through onFocus and maxLength={1}, nothing stops focusing any cell); no jsdom in the build copy, so traced by hand: cell 3 + \"7\" → value \"7\" shown in cell 0, focus to cell 4; Backspace on cell 2 of \"123456\" → \"12456\", digits shift left, focus stays on cell 2 now showing 4; sequential typing (control) works."
- locations:
  - src/components/VerificationCode/VerificationCodeInput.tsx:4-8
  - src/components/VerificationCode/VerificationCodeInput.tsx:62-68
  - src/components/VerificationCode/VerificationCodeInput.tsx:86-92
  - src/components/VerificationCode/VerificationCodeInput.tsx:98-108
  - src/components/VerificationCode/VerificationCodeInput.tsx:116-119
  - src/components/VerificationCode/VerificationCodeInput.tsx:141-155
  - src/components/VerificationCode/CodeDigitInput.tsx:79
  - src/components/VerificationCode/CodeDigitInput.tsx:88
- evidence: |
    VerificationCodeInput.tsx:63-64   const [internal, setInternal] = useState(() => / onlyDigits(defaultValue).slice(0, length),
    VerificationCodeInput.tsx:67      isControlled ? onlyDigits(valueProp) : internal        ← both stores are gapless digit strings
    VerificationCodeInput.tsx:88-91   const next = Array.from({ length }, (_, i) => value[i] ?? ""); / next[index] = digit; / setValue(next.join("")); / if (digit && index < length - 1) focusAt(index + 1);
    VerificationCodeInput.tsx:101-103 if (next[index]) { / next[index] = ""; / setValue(next.join(""));
    VerificationCodeInput.tsx:147     value={value[index] ?? ""}
    CodeDigitInput.tsx:88             onFocus={onFocus}            ← pass-through only; any cell can take focus (tap, Tab, ArrowRight at :116-119)
    VerificationCodeInput.tsx:7       * - Digits only; auto-advance, backspace to previous, arrow navigation, paste.
- impact: `join("")` drops empty slots, so a cell's position is not preserved. A user who taps the fourth box first — common on touch — types 7 and sees it appear in box 1 while the caret jumps to box 5; the same happens after ArrowRight into an empty cell. Backspace on box 3 of "123456" yields "12456" displayed shifted left, with focus on a box that now shows 4. Consumers cannot work around it: the public value shape (a plain digit string) has no way to express a hole. This is shipped, user-facing mis-entry in a sign-in/verification flow (V6: S2; not S1 because the header does not promise positional behaviour).
- recommendation: Keep the public value a gapless digit string (no API change) and make entry sequential so a hole can never be requested: (1) add an `onFocus` handler per cell that, when `index > value.length` (an empty cell past the first empty one), calls `focusAt(value.length)`; (2) in `writeDigit` write at `const at = Math.min(index, value.length)` and advance focus to `at + 1`, so a stale focus can never place a digit out of position; (3) keep Backspace on a filled middle cell as "delete this digit, later digits shift left" (the only behaviour a gapless string can express) but leave focus on the same index, and document it. Update the `## behavior` header (:5-8) in the same commit: "Entry is sequential: focusing an empty cell beyond the first empty one moves focus to the first empty cell. Deleting a middle digit shifts later digits left." Add a story `NonSequentialEntry` with that description. Verify in Storybook: on `Empty`, click cell 4 → focus lands on cell 1; type 1-2-3 then click cell 6 → focus on cell 4; Backspace on cell 2 of `Filled` → value "12456", focus remains on cell 2. `npm run lint` exit 0.
- breaking: none
- contract: src/components/VerificationCode/VerificationCodeInput.tsx:7 "Digits only; auto-advance, backspace to previous, arrow navigation, paste." → consistent (arrow navigation among filled cells is unchanged; the header gains the sequential-entry rule in the same commit). :10-13 "## constraints … Do not ship a package-level “verification section” layout" → consistent. src/components/VerificationCode/CodeDigitInput.tsx:11-13 "Prefer composing through VerificationCodeInput for multi-digit flows." → consistent (the fix lives in VerificationCodeInput; CodeDigitInput already passes `onFocus` through).
- remediation: [WI-110]
- related: [F-031, F-070]

### F-042: Table renders plain divs with no table roles, and sortDirection never reaches aria-sort
- severity: S2
- category: api-design
- rules: []
- scope: consumer-visible
- confidence: confirmed
- verified_by: "U12 rg of role=/aria- in Table.tsx → 0; every part renders a bare <div>. V7 M57: rendered a sortable Table from the built dist/ in the Browser pane → `roles: 0, ariaSort: 0`, accessibility tree shows the header only as `generic \"Name\"`; noted TableSortDirection values are `ascend`/`descend`, not ARIA's `ascending`/`descending`."
- locations:
  - src/components/Table/Table.tsx:22-38
  - src/components/Table/Table.tsx:45-52
  - src/components/Table/Table.tsx:59-102
  - src/components/Table/Table.tsx:107-122
  - src/components/Table/Table.tsx:129-140
  - src/components/Table/Table.tsx:145-154
  - src/components/Table/constants.ts:4-8
  - skills/dooph-design-system-usage/SKILL.md:161-163
- evidence: |
    Table.tsx:24, :47, :74, :93, :109, :131, :149   <div        ← every part; `rg -n "role=|aria-" src/components/Table/Table.tsx` → no matches
    Table.tsx:64-67   const SortIcon = ({ direction }: { direction: TableSortDirection }) => { / if (direction === TableSortDirection.ascend) return <ChevronUpIcon />; …
    Table.tsx:72      if (sortDirection !== undefined) {
    Table.tsx:83              onClick={onSort}          ← sortDirection selects the icon only; nothing maps it to aria-sort
    constants.ts:5-7  none: "none", / ascend: "ascend", / descend: "descend",      ← ARIA's aria-sort tokens are none | ascending | descending | other
    usage SKILL.md:161-163  - **Data:** `Table` (+ `TableHeader`, `TableHeaderCell`, `TableRow`, `TableCell`, / `TablePlaceholder`; sortable headers via `TableSortDirection`) — use this / before hand-rolling a grid of divs for tabular data.
    V7 Browser render (dist/): `<div style="--table-cols…"><div style="grid-template-columns…"><div><button><span>Name</span><svg aria-hidden…></svg></button></div><div>Role</div></div>…` → roles: 0, ariaSort: 0.
- impact: Screen-reader users get a flat run of text: no table announced, no row/column navigation, no header-to-cell association, and a sortable header announces only as a button with no sort state even though the component holds `sortDirection`. Every consumer must know to add `role="table"`/`"row"`/`"columnheader"`/`"cell"` (the parts spread `...props`, so they can, but no story or doc says so) and must re-derive `aria-sort` by translating `ascend`→`ascending` and `descend`→`descending`, because the DS values are not ARIA's tokens. The shipped usage skill steers consumers to Table precisely for tabular data. Not S1: it renders and works for sighted users, and consumers can patch it with props (V7).
- recommendation: Give the parts table semantics by default, placed before `{...props}` so a consumer can still override: Table `role="table"`; TableHeader and TableRow `role="row"`; TableHeaderCell `role="columnheader"` on its outer `<div>` in both branches, plus `aria-sort` derived through a local map `const ARIA_SORT = { [TableSortDirection.none]: "none", [TableSortDirection.ascend]: "ascending", [TableSortDirection.descend]: "descending" } as const` when `sortDirection !== undefined`; TableCell `role="cell"`; TablePlaceholder `role="row"` with its children wrapped in `<div role="cell" className="contents">` so layout is unchanged. Do not rename the TableSortDirection values (that would be a P4 rename; the map is the translation). Add one line to usage SKILL.md:161-163: the parts carry table/row/columnheader/cell roles and `aria-sort`, so consumers need not add them. Land this in the same WI as F-029's TableHeader/TableRow style merge and F-039's TableHeaderCell `buttonProps` (all in Table.tsx). Verify: an SSR script on a scratch-worktree build renders a sortable Table and asserts `role="table"`, two `role="row"`, `role="columnheader"` with `aria-sort="ascending"` for `TableSortDirection.ascend`, and `role="cell"`; in the Browser pane the Table `HeaderCellSortStates` story's accessibility tree (read_page) shows `table` → `row` → `columnheader` with the sort state. `npm run lint` exit 0.
- breaking: none
- contract: n/a (Table.tsx opens with a `// No "use client"…` note, not a `## behavior`/`## constraints` header; constants.ts has none)
- remediation: [WI-106]
- related: [F-017, F-029, F-039]

### F-045: FontAxes and ProgressIndicatorVariants break R1.9, and the architecture skill names Fonts/FontSizes/FontWeights/Tracking as its own counter-example
- severity: S2
- category: naming
- rules: [R1.9]
- scope: consumer-visible
- confidence: confirmed
- verified_by: "U3 read of Text/constants.ts:17-151 vs arch:120 and arch:65-69; U9 read of ProgressIndicator/constants.ts. V7 M50: R1.9 sweep over every constants.ts plus Icons/BaseIcon.tsx (`export const X = {` without `export type X`) → mismatches ProgressIndicatorVariants, Fonts→Font, FontSizes→FontSize, FontWeights→FontWeight, Tracking→TrackingValue, FontAxes→FontAxis (CalendarPresets is a factory, out of scope); every other const matches, incl. ShapeButtons/ToastTypes/TooltipTypes/IconSizes."
- locations:
  - .agents/skills/dooph-ds-architecture/SKILL.md:65-69
  - .agents/skills/dooph-ds-architecture/SKILL.md:77-78
  - .agents/skills/dooph-ds-architecture/SKILL.md:120
  - src/components/Text/constants.ts:32-41
  - src/components/Text/constants.ts:55
  - src/components/Text/constants.ts:64
  - src/components/Text/constants.ts:67-73
  - src/components/Text/constants.ts:88-99
  - src/components/Text/constants.ts:139-149
  - src/components/Text/index.ts:29
  - src/components/Text/index.ts:47
  - src/components/ProgressIndicator/constants.ts:8-19
  - src/components/ProgressIndicator/ProgressIndicator.tsx:22
  - src/components/ProgressIndicator/ProgressIndicator.tsx:273
  - src/components/ProgressIndicator/ProgressIndicator.tsx:284
  - src/components/ProgressIndicator/ProgressIndicator.tsx:311
  - src/components/AIChat/AIContextGauge.tsx:26
  - src/components/AIChat/AIContextGauge.tsx:43
  - src/components/Text/BaseText.tsx:59
  - .agents/skills/dooph-ds-loading-indicators/SKILL.md:37-38
  - .agents/skills/dooph-ds-codebase/SKILL.md:80
  - .agents/skills/dooph-ds-codebase/SKILL.md:322
  - skills/dooph-design-system-usage/SKILL.md:255
  - skills/dooph-design-system-usage/SKILL.md:269
- evidence: |
    arch:120     - The const object and the derived type share the **same identifier** (TypeScript allows a value and a type to share a name).
    arch:65      export const FontWeights = {
    arch:69      export type FontWeightValue = FontWeight | (string & {}) | number;      ← the rule's own example relies on a separate singular `FontWeight`
    arch:77-78   Used by `Fonts` / `FontSizes` / `FontWeights` / `Tracking` (`BaseText`) and / `DS_COLOR_TOKENS` via the `color` prop (`Slider*`, `LinearProgressIndicator`).
    Text/constants.ts:41   export type Font = (typeof Fonts)[keyof typeof Fonts];
    Text/constants.ts:55   export type FontSize = (typeof FontSizes)[keyof typeof FontSizes];
    Text/constants.ts:64   export type FontWeight = (typeof FontWeights)[keyof typeof FontWeights];
    Text/constants.ts:73   export type TrackingValue = (typeof Tracking)[keyof typeof Tracking];   ← closed token union named `*Value`
    Text/constants.ts:139  export type FontValue = Font | (string & {});                           ← `*Value` = open prop union
    Text/constants.ts:147  export type LetterSpacingValue = TrackingValue | (string & {}) | number;   ← both meanings of `*Value` on one line
    Text/constants.ts:88   export const FontAxes = {      (axis TAGS 'wght' … 'MONO' — a closed set, not a design value; not listed at arch:77)
    Text/constants.ts:99   export type FontAxis = (typeof FontAxes)[keyof typeof FontAxes];
    ProgressIndicator/constants.ts:8   export const ProgressIndicatorVariants = {
    ProgressIndicator/constants.ts:18-19  export type ProgressIndicatorVariant = / (typeof ProgressIndicatorVariants)[keyof typeof ProgressIndicatorVariants];
    AIContextGauge.tsx:26  import { ProgressIndicatorVariants } from "../ProgressIndicator/constants";
    li SKILL.md:37-38      Note `ProgressIndicator`'s const is plural / (`ProgressIndicatorVariants`) while its type is singular (`ProgressIndicatorVariant`).
    Siblings comply: LoadingSpinner/constants.ts:4,13 `LoadingSpinnerVariant`; WavyDivider/constants.ts:4,10 `WavyDividerVariant`; open-value `IconSizes` (BaseIcon.tsx:9,15).
- impact: Two separate defects share one rule. (1) Plain R1.9 violations: `ProgressIndicatorVariants` is a closed variant enum whose siblings (`LoadingSpinnerVariant`, `WavyDividerVariant`) share one identifier, so a consumer or agent writing `ProgressIndicatorVariant.wavy` by analogy hits "only refers to a type"; the loading-indicators skill records the mismatch as a note to remember, which entrenches it. `FontAxes` is a closed set of axis tags, not a design value and not covered by arch:77, so its `FontAxes`/`FontAxis` split is the same violation. (2) Rulebook conflict for the four open-value consts: arch:120 demands one identifier, but Rule 1's own open-value example (arch:65-69) depends on a plural const plus a singular closed type, and arch:77-78 names `Fonts`/`FontSizes`/`FontWeights`/`Tracking` as the sanctioned instances — an editor who obeys arch:120 renames exactly what arch:65-77 sanctions, and one who obeys arch:65-77 keeps violating arch:120. Within that family `*Value` means the open prop union (`FontValue`, `FontSizeValue`, `FontWeightValue`, `LetterSpacingValue`) except `TrackingValue`, which is the closed token union, so a reader guessing by analogy picks the wrong type. (V7: four consts are a rulebook conflict, FontAxes and ProgressIndicatorVariants plain violations; U3-F4's "four of five" title corrected.)
- recommendation: D-14 decides between renaming the types and amending R1.9 + fixing the arch example. Recommended option, for the blocked WI: (1) Amend the rule rather than the four open-value consts: add a named exception directly under arch:120 — "Exception: the plural open-value consts `Fonts`, `FontSizes` and `FontWeights` name their closed token union in the singular (`Font`, `FontSize`, `FontWeight`); the open prop type is always `<Singular>Value`. Any other const, including open-value `IconSizes` and `Tracking`, shares one identifier with its type." (A named list, so the exception cannot be stretched to new consts.) Extend the arch:65-69 example with the missing `export type FontWeight = (typeof FontWeights)[keyof typeof FontWeights];` line so it shows the full pattern, and update rulebook R1.9's text to cite the exception. (2) In the 6.0.0 major (P4; depends on D-01, WI-122, WI-122), fix the remaining violations with no alias shims: rename `ProgressIndicatorVariants` → `ProgressIndicatorVariant` (constants.ts:8 and :19, ProgressIndicator.tsx:22/:273/:284/:311, AIContextGauge.tsx:26/:43, stories) and delete the li SKILL.md:37-38 note; rename the `FontAxes` const → `FontAxis` (constants.ts:88/:99/:148, Text/index.ts:29, BaseText.tsx:59, codebase SKILL.md:80/:322, usage SKILL.md:255/:269, stories) so const and type share `FontAxis`; rename the closed `TrackingValue` type → `Tracking` so it shares the const's identifier (constants.ts:73/:147, Text/index.ts:47) — `Tracking` is already singular, so it follows arch:120 directly. Keep `FontAxesValue` and the other open `*Value` prop types. List all three renames in the v6 migration skill. Verify: rerun V7's sweep (for each `export const X = {` in src/components/**/constants.ts and BaseIcon.tsx, `rg -n "export type X\b"`) → mismatches only Fonts/FontSizes/FontWeights (the documented exception) and CalendarPresets; `rg -n 'ProgressIndicatorVariants|FontAxes\b|TrackingValue' src skills .agents/skills` → 0 outside the migration skill; `npm run lint` exit 0.
- breaking: major
- contract: src/components/AIChat/AIContextGauge.tsx:11-18 (## constraints: not clamped; budget <= 0 draws empty) → consistent (the rename touches only the import identifier at :26/:43). Text/constants.ts, ProgressIndicator/constants.ts, ProgressIndicator.tsx, BaseText.tsx and Text/index.ts carry no `## behavior`/`## constraints` header.
- remediation: decision D-14 (WI-129 blocked)
- related: [F-023, F-098]

### F-065: Shapes and AvatarSize declare consts outside a constants.ts, an exception the docs list only partly
- severity: S3
- category: inconsistency
- rules: [R8.20]
- scope: internal
- confidence: confirmed
- verified_by: "U10/U12: for every component folder without constants.ts, rg for `export const \w+ = {` → Avatar/Avatar.tsx, Icons/BaseIcon.tsx, Shapes/index.ts; U12 scratch/U12/sizes.mjs. V8 M82 PARTIAL: same 3-file grep; build worktree dist chunks for Shapes (chunk-6N72QK3C.js, starts `// src/components/Shapes/index.ts` / `var Shapes = {`) and AvatarSize (chunk-XKWNNEIZ.js, starts `import {`) carry no directive; add-use-client.mjs stamps by bundled inputs."
- locations:
  - src/components/Avatar/Avatar.tsx:1-8
  - src/components/Avatar/index.ts:1
  - src/components/Shapes/index.ts:1-29
  - src/components/ShapeButton/constants.ts:4
  - .agents/skills/dooph-ds-codebase/SKILL.md:638-643
  - .agents/skills/dooph-ds-contribution/SKILL.md:70
- evidence: |
    Avatar.tsx:1     import { forwardRef, type HTMLAttributes } from "react";      (no "use client" today)
    Avatar.tsx:4-8   export const AvatarSize = { / standard: "standard", / small: "small", / } as const; / export type AvatarSize = (typeof AvatarSize)[keyof typeof AvatarSize];
    Avatar/index.ts:1  export { Avatar, AvatarSize } from "./Avatar";
    Shapes/index.ts:1-13   export * from "./ArrowShape"; … export * from "./TripleShape";
    Shapes/index.ts:15     export const Shapes = {        (declared in the barrel, below 13 re-exports)
    ShapeButton/constants.ts:4  import type { Shapes } from "../Shapes";
    codebase SKILL.md:640-641  client. Every component with consts follows this, except `Avatar` and / `BaseIcon`, which declare theirs inline in server-safe modules — equivalent.
    codebase SKILL.md:642-643  A const declared inside a `"use client"` file is a client reference, not a / value, so `LoadingSpinnerSize.md` in a Server Component would break.
    contribution SKILL.md:70   - [ ] Dot-accessible consts declared in a sibling `constants.ts` with **no** `"use client"` — a const declared in a client module is a reference, not a value, so RSC code cannot read `Thing.key`
- impact: The cluster's S3 rests on AvatarSize. It is server-safe only while Avatar.tsx has no `"use client"`, and Avatar is the component most likely to gain client state (image-load fallback, initials on error). The day it does, `AvatarSize.small` read from a Server Component becomes a client reference and breaks — the exact failure codebase SKILL.md:642-643 describes — while that same skill tells the editor the inline form is "equivalent" and the contribution checklist (:70) forbids it, so the two skills disagree and nothing in Avatar.tsx warns. The Shapes part is S4 on its own (V8): `export *` does not bundle a client module into the barrel's chunk and add-use-client.mjs stamps by bundled inputs, so there is no RSC hazard; its only cost is that the codebase skill's exception list omits it.
- recommendation: Move both consts to a sibling `constants.ts` and remove the exceptions from the skill. (1) Create `src/components/Avatar/constants.ts` (server-safe header comment like the other constants files) holding `AvatarSize` const + type; Avatar.tsx imports it; Avatar/index.ts becomes `export { Avatar } from "./Avatar"; export { AvatarSize } from "./constants";` — public surface unchanged. (2) Create `src/components/Shapes/constants.ts` holding `Shapes` const + type; Shapes/index.ts replaces the inline block with `export * from "./constants";` (ShapeButton/constants.ts:4 keeps importing from "../Shapes"). (3) codebase SKILL.md:640-641: change the exception list to `BaseIcon` only. Verify: `rg -l "^export const [A-Z]\w* = \{" src/components --glob '!**/constants.ts' --glob '!*.stories.tsx'` → only Icons/BaseIcon.tsx; a scratch-worktree build + `git status --porcelain` empty; `npm run lint` exit 0; the scratch build's dist/index.d.ts still exports both (`grep -nE "AvatarSize|Shapes" dist/index.d.ts` → at least one hit each).
- breaking: none
- contract: n/a (Avatar.tsx and Shapes/index.ts have no `## behavior`/`## constraints` header)
- remediation: [WI-032]
- related: [F-012, F-023, F-098]

### F-070: hasError sets aria-invalid on CodeDigitInput but only repaints Input
- severity: S3
- category: inconsistency
- rules: []
- scope: consumer-visible
- confidence: plausible: S3 outside the Phase-4 verification sample; facts re-checked by C7 (rg of `aria-invalid|hasError` over src/components/{Input,VerificationCode} non-story files → `aria-invalid` only at CodeDigitInput.tsx:82; Input.tsx:105-113 builds the input's props with no aria-invalid)
- verified_by: "U6 rg -n 'aria-invalid|hasError' src/components/{Input,VerificationCode}/*.tsx (non-story): aria-invalid appears only at CodeDigitInput.tsx:82. C7 re-read Input.tsx:47-49, :62-75, :105-131, :152-175 and CodeDigitInput.tsx:22-26, :74-91 @ b436647."
- locations:
  - src/components/Input/Input.tsx:4-13
  - src/components/Input/Input.tsx:47-49
  - src/components/Input/Input.tsx:105-113
  - src/components/Input/Input.tsx:127-128
  - src/components/Input/Input.tsx:171-172
  - src/components/VerificationCode/CodeDigitInput.tsx:8
  - src/components/VerificationCode/CodeDigitInput.tsx:82
  - src/components/VerificationCode/CodeDigitInput.tsx:90
  - .agents/skills/dooph-ds-codebase/SKILL.md:148
- evidence: |
    Input.tsx:48         hasError?: boolean;
    Input.tsx:105-106    const fieldProps = { / ...props,              ← no aria-invalid anywhere in Input.tsx
    Input.tsx:127-128    hasError && / "border-danger-primary focus:border-input-border-danger-focus ds-focus-ring-danger-on-focus",
    Input.tsx:171-172    hasError && / "border-danger-primary focus-within:border-input-border-danger-focus ds-focus-within-ring-danger",
    CodeDigitInput.tsx:82  aria-invalid={hasError || undefined}
    CodeDigitInput.tsx:90  {...props}                                    ← consumer's own aria-invalid still wins
    CodeDigitInput.tsx:8   * - `hasError` paints error-primary border + text; `disabled` uses secondary
- impact: The same prop on the package's two text-entry components produces an announced error state in one (VerificationCodeInput's cells) and a purely visual one in the other. A consumer who relies on `hasError` for an accessible form — reasonable, since it works on CodeDigitInput — ships Inputs whose error state is invisible to assistive technology (no `aria-invalid`, so screen readers do not announce "invalid entry"), with nothing in the types or codebase SKILL.md:148 hinting at the difference.
- recommendation: Make Input set `aria-invalid` from `hasError`, ahead of the consumer's props so an explicit `aria-invalid` still wins (the CodeDigitInput order): in Input.tsx:105 change `const fieldProps = { ...props,` to `const fieldProps = { "aria-invalid": hasError || undefined, ...props,` — `fieldProps` feeds the `<input>` in all three branches. Add a `## behavior` bullet to Input.tsx's header: "`hasError` paints the danger chrome and sets `aria-invalid` on the `<input>`." Verify: an SSR script on a scratch-worktree build renders `<Input hasError />`, `<Input variant={InputVariant.iconText} icon={<span/>} hasError />` and `<Input variant={InputVariant.number} hasError />`, each with `aria-invalid="true"` on the `<input>`, and `<Input hasError aria-invalid={false} />` with `aria-invalid="false"`; `npm run lint` exit 0.
- breaking: none
- contract: src/components/Input/Input.tsx:8-9 "`className` always lands on the chrome element; every other prop, and `ref`, always land on the `<input>`." → consistent (aria-invalid goes on the `<input>`; the header gains the hasError bullet in the same commit). src/components/VerificationCode/CodeDigitInput.tsx:8 "`hasError` paints error-primary border + text" → consistent (unchanged).
- remediation: [WI-111]
- related: [F-026, F-031, F-038, F-040]

### F-071: PopoverContent's surface, border, shadow and offset diverge from every other floating panel
- severity: S3
- category: inconsistency
- rules: []
- scope: consumer-visible
- confidence: plausible: S3 outside the Phase-4 verification sample; facts re-checked by C7 (rg of `border-border-popovers|bg-modal-surface|shadow-menu` over src/components non-story → DropdownMenu, Modal, Sheet, Toast use the trio, Tooltip uses shadow-menu; Popover.tsx:49 uses none of them; token values re-read in src/styles/tokens.css)
- verified_by: "U7 rg of `border-popovers|bg-modal-surface|shadow-menu|bg-surface-primary` over src/components and of the date-picker research doc (no popover surface spec). C7 re-read Popover.tsx:25-58, DropdownMenu.tsx:116 and :160-163, Modal.tsx:71-73, Sheet.tsx:70-71, Toast.tsx:58/:70, tokens.css:111/:122-126/:666/:669/:674 @ b436647."
- locations:
  - src/components/Popover/Popover.tsx:33
  - src/components/Popover/Popover.tsx:47-49
  - src/components/Menu/DropdownMenu.tsx:116
  - src/components/Menu/DropdownMenu.tsx:161-163
  - src/components/Modal/Modal.tsx:71-73
  - src/components/Sheet/Sheet.tsx:70-71
  - src/components/Toast/Toast.tsx:58
  - src/components/Toast/Toast.tsx:70
  - src/styles/tokens.css:111
  - src/styles/tokens.css:122-126
  - src/styles/tokens.css:666
  - src/styles/tokens.css:669
  - .claude/research/2026-08-27-date-picker-foundation-research.md:314
- evidence: |
    Popover.tsx:33        sideOffset = 4,
    Popover.tsx:49        "border border-solid border-border-primary bg-surface-primary shadow-button",
    DropdownMenu.tsx:116  sideOffset = 6,
    DropdownMenu.tsx:161  "z-50 flex flex-col gap-xs overflow-hidden rounded-normal border border-solid border-border-popovers bg-modal-surface",
    DropdownMenu.tsx:163  "shadow-menu",
    Modal.tsx:71,73       'bg-modal-surface border border-solid border-border-popovers', … 'shadow-menu',
    Sheet.tsx:70-71       "bg-modal-surface border-solid border-border-popovers", / "shadow-menu overflow-hidden",
    tokens.css:122-123    /* Borders (Figma: border-primary / border-secondary; popovers is the DS name / * for Figma modal-border, shared by modal/menu/toast panels) */
    tokens.css:666        --ui-color-surface-primary: #000000;      (dark)
    tokens.css:669        --ui-color-modal-surface: #212124;        (dark)
    research:314          … The existing `DropdownMenuContent` wrapper — `portal` escape hatch, `matchTriggerWidth`, forwardRef, `cn` merge — ports over nearly verbatim.
- impact: Modal, Sheet, Toast and DropdownMenu share the popovers-border / modal-surface / menu-shadow trio that tokens.css:122-123 names as the shared floating-panel look; PopoverContent alone uses the control border, the page surface and `shadow-button` (the small control shadow), with a 4px offset where the menu uses 6px, and no comment or spec records why. The clash is visible inside the package itself: DatePicker's caption DropdownMenuContent opens on top of the PopoverContent with a different border colour, background (dark mode `#000000` vs `#212124`) and shadow. A consumer building a custom popover gets a panel that does not match the menus beside it, and the next agent adding a floating surface has two answers to copy.
- recommendation: Align PopoverContent with the shared floating-panel look: Popover.tsx:49 → `"border border-solid border-border-popovers bg-modal-surface shadow-menu"` and :33 `sideOffset = 6` (DropdownMenu.tsx:116). Before editing, open the DatePicker Figma frame referenced by the research doc; if Figma deliberately specifies the current border/surface/shadow, instead keep the classes and add a two-line comment above :47 naming the Figma node and stating that the popover is intentionally lighter than menus. Verify: Storybook DatePicker story with the caption month menu open, in light and dark — the popover panel and the menu share border colour, background and shadow (getComputedStyle on both `[data-radix-popper-content-wrapper] > *` elements: equal `background-color`, `border-top-color`, `box-shadow`); `npm run lint` exit 0.
- breaking: none
- contract: n/a (Popover.tsx has no `## behavior`/`## constraints` header; DropdownMenu.tsx's header is not touched)
- remediation: [WI-112]
- related: [F-020, F-039]

## DONE
