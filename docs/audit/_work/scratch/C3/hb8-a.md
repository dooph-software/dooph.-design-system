### U3-F11: Story docs contradict the code, and FadeChangeText's `direction` prop has no story that contradicts its default
- severity: S3
- category: stories
- rules: [R9.23, R8.22]
- scope: docs
- confidence: plausible
- verified_by: "read AnimatedText.stories.tsx in full; grep 'FadeChangeText' stories → only lines 384 and 420, neither passes direction"
- locations:
  - src/components/AnimatedText/AnimatedText.stories.tsx:211-213
  - src/components/AnimatedText/AnimatedText.stories.tsx:253-254
  - src/components/AnimatedText/AnimatedText.stories.tsx:367-435
  - src/components/Text/BaseText.stories.tsx:161-162
- evidence: |
    AnimatedText.stories.tsx:212  "`direction` flips the barrel roll. `up` (default) rolls each glyph upward; `down` rolls it " +
    RollHoverText.tsx:37          direction = RollDirection.down,
    AnimatedText.stories.tsx:254   * text rolls in and settles into focus. Respects `prefers-reduced-motion`
    AnimatedText.stories.tsx:255   * (animation classes are `motion-safe:` scoped). …   ← CSS uses @media reduce → 1ms (index.css:727-731), no motion-safe
    AnimatedText.stories.tsx:384  <FadeChangeText changeKey={statuses[index]} data-testid="fade-status">   (no direction)
    BaseText.stories.tsx:161  <Row label="MonoText fontSize={20} fontWeight={700}">
    BaseText.stories.tsx:162    <MonoText fontSize={20} fontWeight={FontWeights.bold}>
- impact: The RollHoverText docs page tells readers the default is `up` when it is `down`. The RollChangeText note describes a reduced-motion mechanism that no longer exists: it was replaced because `animation: none` stranded content. So an agent reading stories as documentation would reintroduce it. FadeChangeText's `direction` shares `--ds-roll-dir` with RollChangeText, but no story would show if its `up` path broke. The BaseText label misstates the code it annotates.
- recommendation: Correct the three texts. Add a FadeChangeText up/down story mirroring `RollChangeDirectionUpVsDown`.
- breaking: none
- contract: n/a
- remediation: tbd
- related: []

-----
### U5-F12: Several override props in the family have no story that contradicts their default, so a dead prop would stay invisible
- severity: S3
- category: stories
- rules: [R9.23, R8.22, R9.24]
- scope: tooling
- confidence: plausible
- verified_by: "Read all five story files in full; `rg -n 'modal|portal|dismissOnFocusLoss|asChild|showShortcut|shortcut=' src/components/{Menu,DropdownTrigger,SearchBox}/*.stories.tsx` → only `DropdownMenuTrigger asChild` (the Radix trigger's own prop) and SearchBox `shortcut` args."
- locations:
  - src/components/Menu/DropdownMenu.stories.tsx:1-461
  - src/components/DropdownTrigger/DropdownTrigger.stories.tsx:87-104
  - src/components/SearchBox/SearchBox.stories.tsx:19-43
  - src/components/HotkeyIndicator/HotkeyIndicator.stories.tsx:27
- evidence: |
    DropdownMenu.tsx:55      modal = false,            // no story passes modal={true}
    DropdownMenu.tsx:110     dismissOnFocusLoss = false, // no story passes true
    DropdownMenu.tsx:117     portal = true,            // no story passes portal={false} or portalProps
    DropdownMenuSearch.tsx:38-39  shortcut = ["Esc"], showShortcut = true,   // stories:434 only ever renders <DropdownMenuSearch />
    DropdownTrigger.tsx:309  asChild = false,          // no story with asChild (would have caught U5-F1)
    HotkeyIndicator.stories.tsx:27  <span className="text-style-label text-ghost-fg w-20">Single</span>   // raw styled span where LabelText exists
- impact: R9.23 exists so a prop that silently stops working shows up in Storybook; U5-F1 is exactly such a case (`asChild` throws and no story renders it). `modal`, `portal`/`portalProps`, `dismissOnFocusLoss`, `DropdownMenuSearch`'s `shortcut`/`showShortcut` and a disabled `TextDropdownTrigger` are likewise never exercised against their defaults. Minor: HotkeyIndicator stories label rows with raw styled `<span>`s, and menu stories use `gap-[2px]` (DropdownMenu.stories.tsx:410,416,439,445,452) and Tailwind numeric gaps.
- recommendation: Add one story per override prop that contradicts its default (non-portalled content, modal menu, custom/hidden search shortcut, asChild triggers, disabled text trigger); use Text components for story labels.
- breaking: none
- contract: n/a
- remediation: tbd
- related: [U5-F1]

-----
### U7-F13: No date-family story contradicts the `locale` default or passes non-default split-trigger presets, and the two trigger components and `CalendarPresets.custom` have no story of their own
- severity: S3
- category: stories
- rules: [R9.23, R8.22]
- scope: tooling
- confidence: plausible
- verified_by: "Read Calendar.stories.tsx, DatePicker.stories.tsx, Popover.stories.tsx in full; `rg -n 'locale|custom\\(|triggerProps|trigger=' src/components --glob '*.stories.tsx'` → 0 hits in these files"
- locations:
  - src/components/Calendar/Calendar.stories.tsx:24-159
  - src/components/DatePicker/DatePicker.stories.tsx:83-98,127-134
  - src/components/DatePicker/DatePickerSplitTrigger.tsx:53
- evidence: |
    DatePicker.stories.tsx:93    splitPresets={DEFAULT_SPLIT_TRIGGER_PRESETS}
    DatePickerSplitTrigger.tsx:53  presets = DEFAULT_SPLIT_TRIGGER_PRESETS,     // the only value any story passes IS the default
    (no story sets `locale`, `open`/`onOpenChange`, `month` on DatePicker, `yearBounds`/`disabled`/`renderDay` on DatePicker, `triggerProps`, or uses `CalendarPresets.custom`)
- impact: If `locale` stopped being threaded (it passes through DatePicker → Calendar → Caption/Grid, and DatePicker → both triggers) or `splitPresets` stopped reaching the split trigger, every story would still render identically — the dead-prop class R9.23 exists to expose. U7-F7's `triggerProps` clobbering would likewise be visible in a story.
- recommendation: Add one story with a non-English `locale` and a split trigger with custom presets (e.g. built via `CalendarPresets.custom`); optionally standalone DatePickerTrigger / DatePickerSplitTrigger stories.
- breaking: none
- contract: n/a
- remediation: tbd
- related: [U7-F7]

-----
### U8-F13: Several overlay override props have no story that contradicts their default (R9.23), including the one that would have exposed U8-F1
- severity: S3
- category: stories
- rules: [R9.23, R8.22]
- scope: internal
- confidence: plausible
- verified_by: "rg -n 'withOverlay|portal|sideOffset|delayDuration|dismissLabel|viewportProps|altText|duration' src/components/{Sheet,Tooltip,Toast}/*.stories.tsx → only `duration: Infinity` (Toast.stories.tsx:109) and `themeInverse={false}` (Tooltip.stories.tsx:123)"
- locations:
  - src/components/Sheet/Sheet.stories.tsx:59-165
  - src/components/Tooltip/Tooltip.stories.tsx:43-128
  - src/components/Toast/Toast.stories.tsx:42-169
- evidence: |
    | prop (default) | contradicting story? |
    | SheetContent withOverlay (true) Sheet.tsx:133 | none (Modal has NoOverlay, Modal.stories.tsx:118-141) |
    | TooltipContent portal (true) / sideOffset (6) Tooltip.tsx:49,51 | none |
    | TooltipProvider delayDuration (250) Tooltip.tsx:25 | none |
    | ToastProvider duration / viewportProps / swipeDirection ("right") Toast.tsx:201,237 | none |
    | toast() dismissLabel ("Dismiss") / action.altText Toast.tsx:267,271 | none |
- impact: A prop whose override has no story can be dead without anyone seeing it — `ToastProvider duration` is dead today (U8-F1) and no story exercises it. `ToastRoot`/`ToastViewport`/`ToastTitle`/`ToastDescription` are exported for manual composition but never rendered directly in any story, which is how U8-F8 went unnoticed.
- recommendation: Add one story per listed override (Sheet without overlay, inline tooltip, provider-level toast duration, custom dismiss label, a hand-composed `ToastRoot` in each variant).
- breaking: none
- contract: n/a
- remediation: tbd
- related: [U8-F1, U8-F8]

-----
### U9-F18: Loading-family stories leave override props uncontradicted and use raw elements where DS components exist
- severity: S3
- category: stories
- rules: [R9.23, R9.24]
- scope: internal
- confidence: plausible
- verified_by: "Read all five story files in full."
- locations:
  - src/components/ProgressIndicator/ProgressIndicator.stories.tsx:21-24, 35-133
  - src/components/ProgressIndicator/ProgressIndicator.stories.tsx:119-127
  - src/components/WavyDivider/WavyDivider.stories.tsx:28-90
  - src/components/ShapeMorphSpinner/ShapeMorphSpinner.stories.tsx:18-42
  - src/components/LoadingSpinner/LoadingSpinner.stories.tsx:103, 116
- evidence: |
    PI.stories:39   color: LoadingSpinnerColor.primary,     <- the only `color` in the file = the default
    PI.stories:119  <input
    PI.stories:120    type="range"                          <- SliderContinuous exists
    WD.stories      (no story sets `strokeWeight`; default 2 at WD.tsx:57)
    SMS.stories     (no story sets `timing`)
    LS.stories:103  <span className="w-12 text-style-label text-text-secondary">flat</span>   <- LabelText exists (used by LPI.stories)
- impact: A dead `color` on ProgressIndicator, a dead `strokeWeight` on WavyDivider or a dead `timing` on ShapeMorphSpinner would render identically to the passing stories — the exact failure R9.23 was written after. The raw range input bypasses the DS inside its own Storybook.
- recommendation: Add one contradicting story per override prop (PI colour incl. a raw colour, WD `strokeWeight`, SMS `timing`); use `SliderContinuous` and `LabelText`.
- breaking: none
- contract: n/a
- remediation: tbd
- related: [U9-F8]

-----
### U11-F14: Stories leave override defaults and meaningful states unexercised: AIPromptInput `disabled`, `responding` without `onStop`, AIContextGauge `size`, and AIModelTooltipContent's silently flipped `themeInverse` default
- severity: S3
- category: stories
- rules: [R8.22, R9.23, R9.24]
- scope: tooling
- confidence: plausible
- verified_by: "Read all 4 story files in full: no AIPromptInput `disabled`, no `themeInverse`, no gauge `size`. Composer always passes `onStop` (AIPromptInput.stories.tsx:83). FauxChat does the same (AIChatStreaming.stories.tsx:621)."
- locations:
  - src/components/AIChat/AIPromptInput.tsx:84,96
  - src/components/AIChat/AIPromptInput.tsx:305
  - src/components/AIChat/AIContextGauge.tsx:39
  - src/components/AIChat/AIModelSelect.tsx:212
  - src/components/Tooltip/Tooltip.tsx:48
  - src/components/AIChat/AIModelSelect.stories.tsx:211
- evidence: |
    AIPromptInput.tsx:84     disabled?: boolean;                                   (no story)
    AIPromptInput.tsx:305    if (responding && onStop) {                           (the no-onStop branch has no story)
    AIContextGauge.tsx:39    ({ used, budget, size = LoadingSpinnerSize.sm, ...props }, ref) => (   (ProgressIndicator default is rg; no story overrides)
    AIModelSelect.tsx:212    themeInverse = false,                                 (TooltipContent default at Tooltip.tsx:48 is `themeInverse = true`; flip undocumented; no story)
    AIModelSelect.stories.tsx:211  <span className="text-style-body text-text">Claude Sonnet 5</span>  (raw span where BodyText exists)
- impact: A dead `disabled`, `size` or `themeInverse` would be invisible in Storybook. `AIModelTooltipContent` reverses the Tooltip family's default with no JSDoc or header note, so a consumer who knows TooltipContent gets the opposite theme, and no story shows either case.
- recommendation: Add Disabled and Responding-without-stop composer stories, a gauge size override, and a `themeInverse` story. Note the flipped default in AIModelTooltipContent's JSDoc.
- breaking: none
- contract: n/a
- remediation: tbd
- related: []

-----
