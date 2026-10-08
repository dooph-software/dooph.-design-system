# F-C4 — final findings (composer C4) @ b436647

### F-001: In dark mode a danger Sticker paints white content on an opaque white wash and is invisible
- severity: S1
- category: inconsistency
- rules: []
- scope: consumer-visible
- confidence: confirmed
- verified_by: "U12: rendered the danger class string with the built CSS under html.dark → root color and background both rgb(255,255,255). V2 (M10) searched for any translucency layer (no /NN alpha, no opacity-* in the variant string, unlayered .dark block later in source) — none; painted result 1:1 contrast; CONFIRMED S1."
- locations:
  - src/styles/tokens.css:707-718
  - src/components/Sticker/Sticker.tsx:43
  - src/components/Sticker/Sticker.tsx:18-20
  - src/styles/index.css:198
  - src/styles/index.css:203
  - skills/dooph-design-system-theming/references/token-contract.md:109-110
- evidence: |
    tokens.css:709   * 20% opacity in dark. Danger stops being a composite at all: both the
    tokens.css:710   * content and the wash are a literal white, not danger-primary/secondary. */
    tokens.css:717   --ui-color-sticker-danger: #ffffff;
    tokens.css:718   --ui-color-sticker-bg-danger: #ffffff;
    Sticker.tsx:43           danger: "bg-sticker-bg-danger text-sticker-danger",
    Sticker.tsx:18   * - Do not bake the wash alpha into a hex. `custom` has to retint an arbitrary
    index.css:198    --color-sticker-danger: var(--ui-color-sticker-danger);
    index.css:203    --color-sticker-bg-danger: var(--ui-color-sticker-bg-danger);
    token-contract.md:110  ... Dark secondary mixes at the shared 20% rather than the secondary opacity; dark danger is a solid `#ffffff`, not a mix
- impact: Every consumer rendering `<Sticker variant={StickerVariant.danger}>` under `.dark` gets an empty white pill. Text colour equals background colour (1:1 contrast), and icons inherit `currentColor`, so they vanish too. The shipped theming reference documents both values as white, so a consumer agent reading the docs cannot tell it is broken. The `Danger` story (Sticker.stories.tsx:85) shows it as soon as Storybook is switched to dark. The same token file overrides a Figma export for exactly this reason elsewhere (tokens.css:45-52: prominent content "black on #340fd9 is 2.2:1 and unreadable"), so "per Figma" does not establish intent here. The opaque wash also breaks Sticker's own constraint that no wash bakes its alpha into a hex.
- recommendation: The maintainer decides the intended dark danger look (D-07). The recommended option keeps the white content (`tokens.css:717`) and deletes the dark wash override (`:718`), so the wash falls back to the `:root` `color-mix` of `--ui-color-danger-secondary` at `--ui-sticker-bg-opacity`. Both inputs are mode-invariant, so no `.dark` line is needed. That gives white on a 20% red wash, about 13:1 over the dark page surface. Then update the tokens.css:707-710 comment and token-contract.md:110 to match.
- breaking: none
- contract: src/components/Sticker/Sticker.tsx:18-20 "Do not bake the wash alpha into a hex. `custom` has to retint an arbitrary colour, and a consumer overriding the opacity token has to move every built-in wash that references it." → consistent (the recommended option restores the opacity-driven wash; keeping a solid `#ffffff` wash would conflict)
- remediation: decision D-07 (+ blocked WI-055)
- related: [F-054, F-076, F-019, F-106]

### F-004: fillColor does nothing on PentagonShape and PuffShape because their path hard-codes fill="currentColor"
- severity: S1
- category: api-design
- rules: []
- scope: consumer-visible
- confidence: confirmed
- verified_by: "U10: SSR of dist PentagonShape/PuffShape with fillColor='red' → svg style fill:red but path fill=\"currentColor\"; browser getComputedStyle(path).fill = inherited text colour. V2 (M11): looked for a refuting path (BaseShape/BaseIcon setting CSS color, a CSS override) — none; SquircleShape inherits red, Clover is explicit; CONFIRMED S1."
- locations:
  - src/components/Shapes/PentagonShape.tsx:19-22
  - src/components/Shapes/PuffShape.tsx:19-22
  - src/components/Shapes/BaseShape.tsx:59-63
  - src/components/Icons/BaseIcon.tsx:59
  - src/components/Shapes/Shapes.stories.tsx:158-170
- evidence: |
    PentagonShape.tsx:9    fillColor = "currentColor",
    PentagonShape.tsx:20-21    d={PENTAGON_SHAPE_PATH}
                                fill="currentColor"
    PuffShape.tsx:20-21        d={PUFF_SHAPE_PATH}
                                fill="currentColor"
    SquircleShape.tsx:19     <path d={SQUIRCLE_SHAPE_PATH} />                  (inherits the svg fill — honours fillColor)
    BaseIcon.tsx:59          fill: fillColor ?? undefined,                    (on the <svg> only; nothing sets CSS `color`)
    Shapes.stories.tsx:167      index % 2 === 0 ? "var(--color-primary)" : "var(--color-prominent-color-alt)"
- impact: A consumer who writes `<PuffShape fillColor={…} />` or `<PentagonShape fillColor={…} />` gets the inherited text colour instead. A presentation attribute on the child path beats the value inherited from the svg's `fill`. That includes `fillColor="none"` for an outline-only shape. The other ten shapes honour the prop, so the defect stays invisible until someone picks one of these two. The `Colors` story passes a fill to every shape, and these two silently render text colour. ShapeButton is unaffected because it always passes `fillColor="currentColor"` (ShapeButton.tsx:145).
- recommendation: Drop the hard-coded `fill` from the two paths so they inherit the svg fill like SquircleShape. Folding the three shape render bodies together belongs to F-080.
- breaking: none
- contract: n/a
- remediation: [WI-057]
- related: [F-080, F-108, F-063]

### F-016: Motion timing is hardcoded in 17 component files and as 12 literals in 6 ds-* helpers; 30 of 41 animated components have no --ui-<component>-* duration/ease family
- severity: S2
- category: rule-violation
- rules: [R6.1, R6.2, R6.5, R9.14]
- scope: consumer-visible
- confidence: confirmed
- verified_by: "HC: motion-tally.cjs + comment-stripped CSS scan; units U1/U3/U4/U5/U6/U8/U9/U12 each filed a slice. V5 (own scanner scratch/V5/motion.cjs): `duration-N total 47 reduce carve-outs 15 hardcoded 32 in files 17`; 7 ease-*, 2 arbitrary timing functions, tokens.css motion families = 10; no ## constraints block grants a motion carve-out; CONFIRMED S2 with the hover subset raised as a decision."
- locations:
  - src/components/Button/Button.tsx:41
  - src/components/OutlineButton/OutlineButton.tsx:162
  - src/components/SplitButton/SplitButton.tsx:24
  - src/components/SplitButton/SplitButton.tsx:55
  - src/components/Checkbox/Checkbox.tsx:37
  - src/components/Toggle/toggleOption.ts:30
  - src/components/Input/Input.tsx:123
  - src/components/Input/Input.tsx:158
  - src/components/VerificationCode/CodeDigitInput.tsx:48
  - src/components/DropdownTrigger/DropdownTrigger.tsx:63
  - src/components/DropdownTrigger/DropdownTrigger.tsx:196
  - src/components/DropdownTrigger/DropdownTrigger.tsx:321
  - src/components/Menu/DropdownMenu.tsx:197
  - src/components/SearchBox/SearchBox.tsx:32
  - src/components/HotkeyIndicator/HotkeyIndicator.tsx:19
  - src/components/TextLink/TextLink.tsx:22
  - src/components/Table/Table.tsx:114
  - src/components/Menu/DropdownMenu.tsx:168-169
  - src/components/Modal/Modal.tsx:29-30
  - src/components/Modal/Modal.tsx:75-76
  - src/components/Sheet/Sheet.tsx:37-38
  - src/components/Sheet/Sheet.tsx:73-74
  - src/components/Tooltip/Tooltip.tsx:62-64
  - src/components/Toast/Toast.tsx:60-63
  - src/components/Popover/Popover.tsx:50-52
  - src/components/OutlineButton/OutlineButton.tsx:192
  - src/components/OutlineButton/OutlineButton.tsx:206
  - src/components/OutlineButton/OutlineButton.tsx:257-258
  - src/components/OutlineButton/OutlineButton.tsx:278-279
  - src/components/ProgressIndicator/ProgressIndicator.tsx:123-124
  - src/components/ProgressIndicator/ProgressIndicator.tsx:151
  - src/components/ProgressIndicator/ProgressIndicator.tsx:165
  - src/styles/index.css:380
  - src/styles/index.css:421-424
  - src/styles/dooph-component-tokens.css:42-44
  - src/styles/dooph-component-tokens.css:128-133
  - src/styles/dooph-component-tokens.css:166-171
  - src/styles/dooph-component-tokens.css:372-374
- evidence: |
    (a.1) hover/state transitions — 17 sites in 13 files; 7 are `duration-150 ease-out`, 10 are `duration-100`:
      Button.tsx:41                "transition-all duration-150 ease-out cursor-pointer select-none",
      Menu/DropdownMenu.tsx:197    "... outline-none transition-colors duration-100 hover:bg-ghost-hover ..."   (menuItemClassName; also CalendarPresetItem)
      Table.tsx:114                "hover:bg-ghost-hover transition-colors duration-100",
    (a.2) overlay enter/exit — 15 durations in 5 files + 2 arbitrary easings + 2 implicit 150ms defaults:
      Sheet.tsx:73                 "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:duration-300 data-[state=open]:[animation-timing-function:cubic-bezier(0.32,0.72,0,1)]",
      Popover.tsx:50               "data-[state=open]:animate-in data-[state=closed]:animate-out",   (no duration: tw-animate default 150ms)
      Toast.tsx:60                 "data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition-transform",   (implicit 150ms)
    (a.3) inline style — no stylesheet or reduced-motion rule can reach these:
      OutlineButton.tsx:258        "opacity 0.36s ease-out, transform 0.16s ease-out",
      ProgressIndicator.tsx:123    const easing = "cubic-bezier(0.4, 0, 0.2, 1)";
      ProgressIndicator.tsx:124    const transition = `stroke-dasharray 300ms ${easing}, stroke-dashoffset 300ms ${easing}`;
      ProgressIndicator.tsx:165    style={{ transition: `stroke-dashoffset 300ms ${easing}` }}
    (a.5) ds-* helpers — 12 literals in 6 helpers:
      index.css:380                animation: ds-shimmer 2s linear infinite;                                   (ShimmerText)
      index.css:422                transform var(--ui-roll-hover-duration) cubic-bezier(0.32, 0.72, 0, 1),     (RollHoverText; ×3 at :422-424)
      dooph-component-tokens.css:43-44   color 150ms, / filter 150ms;                                      (ShapeButton)
      dooph-component-tokens.css:129     transition: width 300ms ease-out;                                 (LinearProgressIndicator; :132 left)
      dooph-component-tokens.css:169-170 transition-duration: 180ms; / transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1);   (Slider glide)
      dooph-component-tokens.css:373-374 opacity 120ms ease-out, / transform 160ms cubic-bezier(0.32, 0.72, 0, 1);   (CopyButton swap)
    tokens.css motion families (10): chat-reveal/-stream/-disclosure, roll-hover (duration, no ease), roll-change, fade-change, shape-morph, rolling-digits, sidebar-icon, underline-link, reveal-change.
- impact: A consumer theme can retune motion for 10 components and none of the other 30. Those 30 include every overlay (DropdownMenuContent, Modal, Sheet, Tooltip, Toast, Popover), both progress indicators, the Slider glide, ShimmerText, CopyButton's swap and the ShapeButton shadow. The shipped codebase skill says the opposite (C-CB-169 FALSE, "Every animated component owns a `--ui-<component>-*` family"; C-ARCH-35 STALE family list). The OutlineButton orb and ProgressIndicator arc transitions are inline styles, so no `@media (prefers-reduced-motion)` rule can reach them. Sheet's 300/200ms plus two cubic-beziers are an untokenised copy of exactly `--ui-roll-change-*` (tokens.css:245-248), and RollHoverText's curve is written three times. The hover family also disagrees with itself (150ms + ease-out at 7 sites, 100ms + default curve at 10). Without one decision, remediation lands as many inconsistent per-file fixes. Scope note (V5): R6.1's text plausibly excludes the 17 hover/state colour transitions in a.1. Its heading is "Not In JavaScript", its "Never" examples are both JS, and every family it names is a component whose motion is the feature. That subset is decision D-03. If D-03 rules hover transitions out, about 15–16 of the 30 components leave the R6.1 list and the remainder still stands at S2. The remaining JS-side motion is filed separately: LoadingSpinner's rAF timing (F-034) and Toast's 200ms unmount mirror (F-035). CopyButton's `REVERT_MS` is a dwell timer, not a motion duration, and is not counted.
- recommendation: (1) Give every component whose motion IS the feature a `--ui-<component>-*` duration + ease family consumed by CSS. That covers the overlays, Slider glide, ShimmerText, RollHoverText's ease, ShapeButton, CopyButton's swap, and LinearProgressIndicator plus ProgressIndicator through one shared `--ui-progress-*` pair. Move the inline transition strings into `ds-*` classes so reduced motion can reach them. Alias house curves rather than copying them. (2) Decide D-03 for the a.1 hover/state transitions: one shared token pair behind a `ds-*` helper, or a written carve-out in arch Rule 6. (3) Regenerate the arch:317-321 / codebase "existing families" lists from tokens.css.
- breaking: none
- contract: Button.tsx, Checkbox.tsx, Input.tsx, toggleOption.ts, ShapeButton.tsx, CodeDigitInput.tsx, DropdownMenu.tsx, LinearProgressIndicator.tsx carry headers, and no `## constraints` line mentions motion → consistent; src/components/Toggle/toggleOption.ts:21 "Never prefix a package class (h-button, size-*, ds-*) with a variant." → consistent (any new motion helper is applied unprefixed); src/components/LinearProgressIndicator/LinearProgressIndicator.tsx:8-9 "Fill width animates when that percentage changes via registered `@property --progress-pct`" (## behavior) → consistent (the transition stays; only its timing is tokenised)
- remediation: [WI-064, WI-070, WI-082] + decision D-03 (+ blocked WI-058)
- related: [F-020, F-021, F-034, F-035, F-099, F-073]
- note-to-orchestrator: map title said "12 ds-* helpers"; V5 corrected HC's a.5 to 12 literal timings in 6 helpers, so the title is tightened to say that.

### F-017: Token bypass: 21 arbitrary px/opacity literals, 32 Tailwind numeric-scale utilities equal to an existing token, and 5 raw var(--ui-*) in Slider className
- severity: S2
- category: rule-violation
- rules: [R8.1, R8.10, R8.11, R9.2, R5.2]
- scope: consumer-visible
- confidence: confirmed
- verified_by: "HC: pcre2 arbitrary-literal + numeric-scale scans (scratch/HC/*.txt), values compared to tokens.css. V5 (own scanner scratch/V5/tokbypass.cjs): `NUMERIC SCALE total 99 non-zero 37`, 32 token-equal (5 have no token), `RAW var(--ui-*) in class strings 5`; HC's '25 arbitrary px' corrected to 21 (19 px + 2 opacity); tokens and replacement utilities confirmed in dist; PARTIAL, S2 stands."
- locations:
  - src/components/OutlineSection/OutlineSection.tsx:22
  - src/components/OutlineButton/OutlineButton.tsx:147
  - src/components/OutlineButton/OutlineButton.tsx:158-159
  - src/components/OutlineButton/OutlineButton.tsx:244
  - src/components/OutlineButton/OutlineButton.tsx:265
  - src/components/OutlineButton/OutlineButton.tsx:286
  - src/components/ShapeButton/ShapeButton.tsx:64
  - src/components/ShapeButton/ShapeButton.tsx:125
  - src/components/SplitButton/SplitButton.tsx:19
  - src/components/SplitButton/SplitButton.tsx:33
  - src/components/Button/Button.tsx:39
  - src/components/Button/Button.tsx:85-86
  - src/components/Avatar/Avatar.tsx:23-24
  - src/components/VerificationCode/CodeDigitInput.tsx:64
  - src/components/VerificationCode/CodeDigitInput.tsx:85
  - src/components/Slider/Slider.tsx:344
  - src/components/Slider/Slider.tsx:368
  - src/components/Slider/Slider.tsx:380
  - src/components/Slider/Slider.tsx:398
  - src/components/Slider/Slider.tsx:408
  - src/components/Menu/DropdownMenu.tsx:339
  - src/components/Menu/DropdownMenuSearch.tsx:77
  - src/components/DropdownTrigger/DropdownTrigger.tsx:59
  - src/components/DropdownTrigger/DropdownTrigger.tsx:194
  - src/components/DropdownTrigger/DropdownTrigger.tsx:325
  - src/components/HotkeyIndicator/HotkeyIndicator.tsx:11
  - src/components/HotkeyIndicator/HotkeyIndicator.tsx:21
  - src/components/SearchBox/SearchBox.tsx:27
  - src/components/Toast/Toast.tsx:70-76
  - src/components/Tooltip/Tooltip.tsx:70
  - src/components/Table/Table.tsx:82
  - src/components/Table/Table.tsx:134
  - src/components/Table/Table.tsx:151
  - src/components/Tabs/Tabs.tsx:21
  - src/components/Checkbox/Checkbox.tsx:81
  - src/components/Checkbox/Checkbox.tsx:90
  - src/components/Checkbox/Checkbox.tsx:106
  - src/components/AIChat/ChatDivider.tsx:28
  - src/components/Sheet/Sheet.tsx:81
  - src/components/Sheet/Sheet.tsx:85
  - src/components/LinearProgressIndicator/LinearProgressIndicator.tsx:55
  - src/components/LinearProgressIndicator/LinearProgressIndicator.tsx:61
  - src/components/LinearProgressIndicator/LinearProgressIndicator.tsx:69
- evidence: |
    Arbitrary design-value literals (21 = 19 px + 2 opacity), representative:
      OutlineSection.tsx:22   'border border-solid border-border-primary rounded-[28px]',      (= radius-soft 20 + spacing-xs 8; same literal OutlineButton.tsx:147)
      OutlineButton.tsx:159   "h-[54px] min-w-[160px] px-3",                                   (160 = --ui-min-w-menu)
      OutlineButton.tsx:244   "opacity-0 group-hover:opacity-[0.38]",                          (also :265 opacity-[0.22])
      ShapeButton.tsx:125     "size-[46px] cursor-pointer select-none",                        (= --ui-size-code-digit / --ui-size-cta-chip-standard; JS mirror SHAPE_SIZE = 46 at :64)
      SplitButton.tsx:33      {icon && <span className="size-[14px] shrink-0">{icon}</span>}  (= --ui-icon-rg)
      Avatar.tsx:23-24        "size-[38px] rounded-avatar p-xs" / "size-[22px] rounded-avatar-sm p-xxs"
      CodeDigitInput.tsx:85   "text-[18px] font-medium text-transparent caret-transparent outline-none",   (glyph also fontSize={18} at :64)
      Slider.tsx:398          'absolute top-1/2 size-[6px] -translate-x-1/2 -translate-y-1/2 rounded-full',
      DropdownMenu.tsx:339    "flex h-[30px] items-center px-xs",                              (same 30px at DropdownTrigger.tsx:325)
      HotkeyIndicator.tsx:21  keys.length === 1 && 'min-w-[23px] min-h-[23px]',
      Toast.tsx:76            "... bg-modal-surface pb-3 pl-[14px] pr-3 pt-[14px] text-text",
      LinearProgressIndicator.tsx:55/61/69  'relative h-[4px] w-full' / 'w-[max(4px,calc(var(--progress-pct)*1%-2px))]' / 'left-[max(4px,min(100%,calc(var(--progress-pct)*1%+2px)))]'
    Numeric-scale utilities equal to a token (32 of 37 non-zero; dist-styles.css:15 `--spacing: 0.25rem`):
      Button.tsx:39 gap-2 (xs 8) | Button.tsx:85-86 px-3 (rg 12) | OutlineButton.tsx:158,159,286 gap-2/px-3/gap-2 | SplitButton.tsx:19 pl-4 pr-4 (md 16)
      SearchBox.tsx:27 gap-2 | HotkeyIndicator.tsx:11 gap-1 (xxs 4) | DropdownTrigger.tsx:59,194 min-w-40 (= --ui-min-w-menu 160) | Tooltip.tsx:70 px-3
      Toast.tsx:70,72,74 py-2 pl-4 pr-2 ×3 | Toast.tsx:76 pb-3 pr-3 | Table.tsx:82 gap-1 | Table.tsx:134 px-4 py-3 | Tabs.tsx:21 gap-1 (Toggle.tsx:99 spells it gap-xxs)
      spacing token used as a size (4 of the 32): ChatDivider.tsx:28 h-3; Checkbox.tsx:81/90/106 size-2.5
      no equal token (5): DropdownMenuSearch.tsx:77 h-6 min-h-6; Sheet.tsx:81/85 max-w-96; Table.tsx:151 py-8
    Raw var(--ui-*) in className (R8.10), all Slider:
      Slider.tsx:344          'h-[var(--ui-height-slider-handle)]',
      Slider.tsx:368          'w-[max(0px,calc(var(--slider-pct)/100*(100%-var(--ui-width-slider-handle))-var(--ui-slider-track-gap)+var(--ds-slider-pad)))]',
      Slider.tsx:380          'left-[min(100%,calc(var(--slider-pct)/100*(100%-var(--ui-width-slider-handle))+var(--ui-width-slider-handle)+var(--ui-slider-track-gap)))]',
      Slider.tsx:408          'block h-[var(--ui-height-slider-handle)] w-[var(--ui-width-slider-handle)]',
- impact: Retuning a spacing or size token moves part of the DS and leaves the rest. A consumer override of `--ui-spacing-rg` re-spaces every `px-rg` user but not Button's own `px-3` (Button.tsx:85-86), Tooltip's rich padding or Toast's insets. Overriding `--ui-min-w-menu` leaves every DropdownTrigger at Tailwind's 160px. The two spellings also diverge without any override: Tailwind's scale is rem-based (`--spacing: 0.25rem`) while DS tokens are px, so `px-3` equals `--ui-spacing-rg` only at a 16px root font size (V5). Table's header/body alignment already depends on a token and a numeric step coinciding (4+12 vs `px-4`). The 28px concentric radius is a sum of two overridable tokens written as one literal, so retuning either input breaks concentricity on OutlineSection and OutlineButton. `SHAPE_SIZE = 46` and `size-[46px]` must be edited together with nothing linking them. The shipped codebase skill says components never put `var(--ui-*)` in className (C-CB-162 FALSE), but Slider does it 5 times. Nine unit findings filed slices of this with different local fixes, so the same value (4, 8, 28, 160px) would get different treatments per folder.
- recommendation: One sweep in three parts. (1) Replace the 28 token-equal numeric utilities with the DS scale (`gap-xs`, `px-rg`, `pl-md`, `ds-min-w-menu`, …). Do not map the 4 spacing-as-size sites mechanically: Checkbox's 10px glyph box gets its own size token, and ChatDivider's `h-3` belongs to F-114. (2) Map literals that equal a token to that token, and add tokens only for values that repeat or are genuine design values with no token: the 28px outline frame radius as `calc(radius-soft + spacing-xs)`, the 30px row height, avatar sizes, the kbd minimum, the 14px complex-toast inset, the slider dot, the progress track height, the code-digit glyph size and the ShapeButton box. (3) Move Slider's and LinearProgressIndicator's geometry formulas out of className into `ds-slider-*` / `ds-progress-*` helpers, which removes the 5 raw `var(--ui-*)` and the formula literals. The 5 no-token numeric values stay or are justified in place.
- breaking: none
- contract: src/components/VerificationCode/CodeDigitInput.tsx:6-7 "Digit glyph is always `BaseText` at 18px / medium (body role) — never SubheadingText" (## behavior) → consistent if the 18px becomes a dedicated glyph token; conflicts if mapped onto `--ui-text-subheading`; src/components/LinearProgressIndicator/LinearProgressIndicator.tsx:7 "`value` / `max` clamp into a percentage stored on `--progress-pct`" (## behavior) → consistent (helpers keep reading `--progress-pct`); src/components/Checkbox/Checkbox.tsx:13-14 "Style states via Radix `data-[state]` / `data-[disabled]` only" → consistent; src/components/Toggle/toggleOption.ts:21 "Never prefix a package class (h-button, size-*, ds-*) with a variant." → consistent (new size utilities are applied unprefixed)
- remediation: [WI-059, WI-071, WI-060, WI-082]
- related: [F-021, F-114, F-116, F-099, F-029, F-074]

### F-018: Focus indication bypasses ds-focus-* three ways, and TabsContent and an error-state CodeDigitInput show no focus indicator at all
- severity: S2
- category: rule-violation
- rules: [R8.14]
- scope: consumer-visible
- confidence: confirmed
- verified_by: "HC: rg focus-class scan (scratch/HC/focus.txt, 42 hits), 23 correct ds-focus-* uses, the deviations read in place. V5: read Checkbox, CodeDigitInput, ShapeButton, Tabs and the helper rules, checked Radix TabsContent renders role=tabpanel tabIndex 0 in the audit build, and found the CodeDigitInput error-state gap; CONFIRMED S2, with the Checkbox mechanism corrected (its keyboard ring is ds-focus-visible-ring)."
- locations:
  - src/components/VerificationCode/CodeDigitInput.tsx:54-56
  - src/components/VerificationCode/CodeDigitInput.tsx:85
  - src/components/Tabs/Tabs.tsx:56
  - src/components/ShapeButton/ShapeButton.tsx:126
  - src/styles/dooph-component-tokens.css:35-38
  - src/styles/dooph-component-tokens.css:59-68
  - src/components/Checkbox/Checkbox.tsx:41
  - src/components/Checkbox/Checkbox.tsx:55
  - src/components/Checkbox/Checkbox.tsx:60
- evidence: |
    CodeDigitInput.tsx:54   !disabled &&
    CodeDigitInput.tsx:55     !hasError &&
    CodeDigitInput.tsx:56     "focus-within:border-input-border-focus focus-within:shadow-focus-prominent",
    CodeDigitInput.tsx:85   "text-[18px] font-medium text-transparent caret-transparent outline-none",   (inner <input>: no outline either)
    Tabs.tsx:56             className={cn("focus-visible:outline-none", className)}   (TabsContent; Radix renders role="tabpanel", tabIndex: 0)
    ShapeButton.tsx:126     "outline-none ds-shape-button-focus-visible",
    dooph-component-tokens.css:35-37  .ds-shape-button-focus-visible:focus-visible { outline: 2px solid var(--ui-color-focus-ring-prominent); outline-offset: 2px;
    dooph-component-tokens.css:60/64  outline: 4px solid transparent; / .ds-focus-visible-ring:focus-visible:not(:disabled):not([data-disabled]):not(
    Checkbox.tsx:41         "focus-visible:border-input-border-focus ds-focus-visible-ring",   (keyboard ring — correct)
    Checkbox.tsx:55         "[&:not([data-disabled])]:active:border-input-border-hover [&:not([data-disabled])]:active:shadow-focus-prominent",   (press ring; :60 -primary)
- impact: Two keyboard-reachable elements show no focus indicator (WCAG 2.4.7). Every `TabsContent` is a tab stop, because Radix gives the panel `tabIndex: 0`, and the DS strips its outline with no replacement. A focused CodeDigitInput in `hasError` is indistinguishable from an unfocused one: the `!hasError` guard drops the only ring (a box-shadow) and the inner input is `outline-none`. In the non-error case CodeDigitInput's ring is a `shadow-focus-prominent` box-shadow, which any `overflow-hidden` ancestor clips. That is the failure the outline helpers exist to avoid. ShapeButton uses a private helper with different geometry (2px + 2px offset vs the shared 4px flush) that, unlike `ds-focus-visible-ring`, does not suppress the ring on disabled or aria-disabled elements. Checkbox's keyboard ring is already correct (V5). Its `active:shadow-focus-*` is a press ring that breaks only the letter of R8.14 ("not `shadow-focus-prominent`/`shadow-focus-primary` in component class strings"). Three unit findings proposed three local fixes, so the next focus variant would get a fourth spelling.
- recommendation: Route focus through `ds-focus-*`. CodeDigitInput → `ds-focus-within-ring` on the cell, with `ds-focus-within-ring-danger` in the error state, the pattern Input already uses. TabsContent → `ds-focus-visible-ring`. ShapeButton → `ds-focus-visible-ring`, or, if the offset ring is a deliberate non-rectangular-shape design, a shared `ds-focus-visible-ring-offset` variant with the same disabled exclusions, named in contrib:57. Checkbox's press ring → either a named press token + `ds-*` helper or removal, decided in the same change, with its header bullet updated.
- breaking: none
- contract: src/components/Checkbox/Checkbox.tsx:9-10 "Active/focus rings are gated off while `data-disabled` so a click cannot flash the focus shadow." (## behavior) → consistent if the bullet is updated in the same commit when the press ring changes; src/components/Checkbox/Checkbox.tsx:13-14 "Style states via Radix `data-[state]` / `data-[disabled]` only" → consistent; src/components/VerificationCode/CodeDigitInput.tsx:9 "focus uses brand focus ring" (## behavior) → consistent (the fix keeps the prominent ring; the stale "brand" spelling is F-054's); src/components/ShapeButton/ShapeButton.tsx:13-16 (shape primitives) → consistent (unrelated)
- remediation: [WI-062]
- related: [F-054, F-026, F-061, F-099]

### F-019: 28 alias tokens are not re-declared in .dark, so inside a nested .dark region they keep their light values
- severity: S2
- category: rule-violation
- rules: [R5.1]
- scope: consumer-visible
- confidence: confirmed
- verified_by: "V5 (M29 block, out-of-scope observation): scratch/V5/aliasisland.cjs → 27; browser: island --ui-color-primary-border-hover #2c2c2c (light) beside --ui-color-primary-hover #f0f0f0 (dark). C4 re-derived: scratch/C4/alias-dark.cjs → 28 (V5's regex missed the line-wrapped var( at tokens.css:62-64); probe scratch/C4/alias-island-probe.html (shipped dist token blocks) → island keeps the light value for 28/28."
- locations:
  - src/styles/tokens.css:23-27
  - src/styles/tokens.css:61-64
  - src/styles/tokens.css:71-85
  - src/styles/tokens.css:98-108
  - src/styles/tokens.css:115-120
  - src/styles/tokens.css:166-191
  - src/styles/tokens.css:509
  - src/styles/tokens.css:557-558
  - src/styles/tokens.css:597
  - src/styles/tokens.css:642-648
  - skills/dooph-design-system-theming/references/token-contract.md:11
- evidence: |
    token-contract.md:11  **Subtree islands.** Any ancestor with **`class="light"`** or **`class="dark"`** re-establishes the corresponding **`--ui-*`** palette for itself and descendants (inheritance).
    tokens.css:73-75  * to. Every value is an ALIAS, which is also what makes a .dark block / * unnecessary: the aliased tokens are themselves redefined per mode, so these / * follow along for free. ...
    tokens.css:105-106  override both tokens if you need a fixed colour. No .dark block: the alias / already resolves per palette. */
    tokens.css:647  --ui-color-primary-disabled: var(--ui-color-secondary-disabled);   (the only 2 aliases .dark re-declares: :647-648)
    The 28 (scratch/C4/alias-dark.out.txt). "island" = value inside <div class="dark"> under a light root; "dark" = value under <html class="dark">:
    | token (tokens.css line) | value | island | dark |
    | --ui-color-primary-border (:23) | var(--ui-color-primary) | #171717 | #f9f9f9 |
    | --ui-color-primary-border-hover (:25) | var(--ui-color-primary-hover) | #2c2c2c | #f0f0f0 |
    | --ui-color-primary-border-active (:27) | var(--ui-color-primary-active) | #3d3d3d | #cdcdcd |
    | --ui-color-prominent-disabled (:61) | var(--ui-color-secondary-disabled) | #f5f5f5 | #222224 |
    | --ui-color-prominent-border-disabled (:62-64) | var(--ui-color-secondary-border-disabled) | #e9e9e9 | #1f1f21 |
    | --ui-color-danger (:76) | var(--ui-color-secondary) | #fdfdfd | #1d1d1f |
    | --ui-color-danger-border (:77) | var(--ui-color-secondary-border) | #e2e3e4 | #303235 |
    | --ui-color-danger-foreground-active (:83) | var(--ui-color-secondary-foreground) | #161616 | #ffffff |
    | --ui-color-danger-disabled (:84) | var(--ui-color-secondary-disabled) | #f5f5f5 | #222224 |
    | --ui-color-danger-border-disabled (:85) | var(--ui-color-secondary-border-disabled) | #e9e9e9 | #1f1f21 |
    | --ui-color-selection (:107) | var(--ui-color-primary) | #171717 | #f9f9f9 |
    | --ui-color-selection-foreground (:108) | var(--ui-color-primary-foreground) | #ffffff | #000000 |
    | --ui-color-tooltip-inverse-surface (:115) | var(--ui-color-primary) | #171717 | #f9f9f9 |
    | --ui-color-tooltip-inverse-text (:116) | var(--ui-color-primary-foreground) | #ffffff | #000000 |
    | --ui-color-tooltip-inverse-border (:117) | var(--ui-color-primary) | #171717 | #f9f9f9 |
    | --ui-color-tooltip-matching-surface (:118) | var(--ui-color-secondary) | #fdfdfd | #1d1d1f |
    | --ui-color-tooltip-matching-text (:119) | var(--ui-color-secondary-foreground) | #161616 | #ffffff |
    | --ui-color-tooltip-matching-border (:120) | var(--ui-color-border-primary) | #dddddd | #333437 |
    | --ui-shimmer-base (:166) | var(--ui-color-text-tertiary) | #606060 | #717171 |
    | --ui-shimmer-highlight (:167-171) | color-mix(in srgb, var(--ui-color-text-tertiary) 35%, transparent) | mix of #606060 | mix of #717171 |
    | --ui-chat-tool-shimmer-base (:180) | var(--ui-color-ghost-foreground-active) | #161616 | #ffffff |
    | --ui-chat-tool-shimmer-highlight (:181-185) | color-mix(in srgb, var(--ui-color-ghost-foreground-active) 35%, transparent) | mix of #161616 | mix of #ffffff |
    | --ui-chat-thinking-shimmer-base (:186) | var(--ui-color-ghost-foreground) | #4a4a4a | #afafaf |
    | --ui-chat-thinking-shimmer-highlight (:187-191) | color-mix(in srgb, var(--ui-color-ghost-foreground) 35%, transparent) | mix of #4a4a4a | mix of #afafaf |
    | --ui-color-slider-step-inactive (:509) | var(--ui-color-secondary-border) | #e2e3e4 | #303235 |
    | --ui-shadow-focus-prominent (:557) | 0 0 0 4px var(--ui-color-focus-ring-prominent) | rgba(36, 6, 172, 0.35) | rgba(52, 15, 217, 0.15) |
    | --ui-shadow-focus-primary (:558) | 0 0 0 4px var(--ui-color-focus-ring-primary) | rgba(23, 23, 23, 0.25) | rgba(249, 249, 249, 0.15) |
    | --ui-color-sticker-secondary (:597) | var(--ui-color-text-tertiary) | #606060 | #717171 |
- impact: The shipped theming contract tells consumers that any ancestor with `class="dark"` re-establishes the dark palette for its subtree (token-contract.md:11). For these 28 tokens it does not. A `var()` inside a custom property is substituted on the element that declares it (`:root`), and the island inherits the already-resolved light value. Inside a dark card, sidebar or preview pane under a light app root, the danger Button keeps its light surface and border (`--ui-color-danger*`), inverse and matching Tooltips paint their light palette, Checkbox and CodeDigitInput focus/press rings use the light ring colour, ShimmerText and the AI-chat shimmer use light tones, the Slider's inactive dots use the light border, primary borders on hover and press stay light, and `.ds-selection` selects light-on-dark. The base tokens beside them do switch, so one control mixes palettes, for example a dark `--ui-color-primary-hover` fill with a light `--ui-color-primary-border-hover` border. The reverse island (`.light` under `html.dark`) is unaffected, because `.light` shares the `:root` block. Two comments in tokens.css (:73-75, :105-106) state the opposite as the reason no `.dark` lines exist, and `.dark` already re-declares the two `primary-disabled` aliases for exactly this reason (V5: deleting them regresses islands). The next agent therefore sees no consistent rule.
- recommendation: Re-declare all 28 aliases in the `.dark` block, unchanged, in one commented group explaining why: a `var()` alias is resolved where it is declared, so a `.dark` subtree only re-evaluates aliases it re-declares. Keep the declarations in `:root, .light` too, because sync-theme.mjs maps only that block into `@theme`, so moving them to a shared selector would drop their utilities. Correct the two tokens.css comments, and state in contrib:107 / arch:297 that "the value changes" means the resolved value, so an alias over a dark-changed token is re-declared. Verify with a getComputedStyle island probe.
- breaking: none
- contract: n/a
- remediation: [WI-061]
- related: [F-059, F-067, F-001]
- note-to-orchestrator: map title says 27. V5's regex `var\((--` required no whitespace after `var(`, so it missed `--ui-color-prominent-border-disabled`, whose `var(` wraps onto the next line (tokens.css:62-64). The re-derived count is 28 (scratch/C4/alias-dark.cjs), confirmed 28/28 in the browser probe. The title is corrected to 28.

### F-020: PopoverContent is the only overlay content with no reduced-motion override
- severity: S2
- category: rule-violation
- rules: [R6.1]
- scope: consumer-visible
- confidence: confirmed
- verified_by: "U7: rg animate-in|motion-reduce over components; dist rule sets animation-duration 150ms with no reduced-motion branch. V5 (M44): per-file motion-reduce counts (DropdownMenu 2, Modal 4, Sheet 4, Tooltip 3, Toast 2, Popover 1 = the animate-in line only); listed every selector in all 15 shipped @media (prefers-reduced-motion) blocks — none reaches animate-in/out or [data-state] generically; CONFIRMED (fact exact), rule fit corrected."
- locations:
  - src/components/Popover/Popover.tsx:50-53
  - src/components/Menu/DropdownMenu.tsx:170
  - src/components/Modal/Modal.tsx:31
  - src/components/Modal/Modal.tsx:77
  - src/components/Sheet/Sheet.tsx:39
  - src/components/Sheet/Sheet.tsx:75
  - src/components/Tooltip/Tooltip.tsx:65
  - src/components/Toast/Toast.tsx:64
  - src/components/DatePicker/DatePicker.tsx:130
- evidence: |
    Popover.tsx:50   "data-[state=open]:animate-in data-[state=closed]:animate-out",
    Popover.tsx:51   "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
    Popover.tsx:52   "data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95",
    Popover.tsx:53   "ds-radix-popover-content-origin",          (transform-origin only)
    DropdownMenu.tsx:170  "motion-reduce:data-[state=open]:duration-0 motion-reduce:data-[state=closed]:duration-0",   (same pair: Modal.tsx:31/77, Sheet.tsx:39/75, Toast.tsx:64; Tooltip.tsx:65 for its three states)
    DatePicker.tsx:130    <PopoverContent>
- impact: Users with `prefers-reduced-motion: reduce` get a 150ms fade plus a scale from 95% every time a Popover opens or closes. That includes every DatePicker panel, while the month/year DropdownMenus opened inside that same panel respect the preference. Popover is the one overlay template without the opt-out, so the next overlay copied from it ships without one too. Rule fit (V5): R6.2 governs the reduced-motion mechanism (CSS, never `matchMedia`), not presence, so Popover does not breach its letter. The violation rests on Rule 6's lead, which treats "a reduced-motion decision" as a design value consumed by CSS (arch:311-313), and on every sibling overlay following the convention. User harm is small. The grade is kept as an inconsistency that makes the next edit go wrong.
- recommendation: Add the same `motion-reduce:` pair to PopoverContent now. The overlay token family in F-016 then replaces the per-file pairs with one CSS reduced-motion rule.
- breaking: none
- contract: n/a
- remediation: [WI-063]
- related: [F-016, F-071, F-039]

### F-021: OutlineButton emits component-decided blur radii and opacities as inline style
- severity: S2
- category: rule-violation
- rules: [R8.12, R8.11, R8.1]
- scope: consumer-visible
- confidence: confirmed
- verified_by: "U4: read the orb spans; rg blur|opacity in tokens.css → no outline/glow tokens. V5 (M53): read OutlineButton.tsx:1-30 (no header), :125-140, :176-290 and contrib:54; tried to refute via the in-code comment (inline opacity 'so it can be transitioned') — a class-set opacity transitions equally and the comment does not cover blur; CONFIRMED S2, wording corrected (override needs !important, not impossible)."
- locations:
  - src/components/OutlineButton/OutlineButton.tsx:174-179
  - src/components/OutlineButton/OutlineButton.tsx:188-193
  - src/components/OutlineButton/OutlineButton.tsx:202-207
  - src/components/OutlineButton/OutlineButton.tsx:243-249
  - src/components/OutlineButton/OutlineButton.tsx:264-270
  - src/components/OutlineButton/OutlineButton.tsx:137-140
- evidence: |
    OutlineButton.tsx:190  filter: "blur(18px)",
    OutlineButton.tsx:191  opacity: 0.38,
    OutlineButton.tsx:204  filter: "blur(24px)",
    OutlineButton.tsx:205  opacity: 0.22,
    OutlineButton.tsx:244  "opacity-0 group-hover:opacity-[0.38]",   / :249 filter: "blur(20px)",
    OutlineButton.tsx:265  "opacity-0 group-hover:opacity-[0.22]",   / :270 filter: "blur(26px)",
    OutlineButton.tsx:177-178  * tracking was introduced. Opacity is set inline so it can be transitioned / * if `glowing` flips at runtime.
    OutlineButton.tsx:138  "group-disabled:!opacity-0",   (the component itself needs !important to beat its own inline opacity)
- impact: contrib:54 allows `style={{}}` only for caller-supplied or token-referencing values: "Never for a design value the component itself decided; that is a token". `background: color1/color2` (the `glowColor*` props, or a `var()` default, :133-134) is the sanctioned part. The blur radii and orb opacities are neither. A consumer cannot retheme the glow intensity or softness through tokens, and can override it with CSS only by using `!important`, against spans with no part className. The glow intensity (0.38 / 0.22) is written twice through two mechanisms: inline for `glowing`, arbitrary class for hover. The blur also differs between the two modes (18/24 vs 20/26) with nothing recording whether that is intended, so a retune touches one mode and misses the other. The inline comment's reason (transitioning opacity when `glowing` flips) does not require an inline literal, because a class-set opacity transitions the same way, and it does not cover `filter`. The orbs' inline `transition` strings are the same defect for timing (F-016).
- recommendation: Move orb paint into `--ui-outline-button-glow-*` tokens: per-orb opacity, and per-orb blur for each mode if the 18/24 vs 20/26 split is intended, otherwise one pair. Read them from `ds-outline-button-orb-*` classes shared by both modes, together with the orb transition timing. Keep only `background` (glowColor) and the cursor targets (`--gx/--gy/--bw/--bh`, transform) inline.
- breaking: none
- contract: n/a
- remediation: [WI-082]
- related: [F-016, F-017, F-062, F-003]

### F-023: The public IconSize type collapses to string, and the shipped JSDoc names IconSizes, which is not exported
- severity: S2
- category: rule-violation
- rules: [R1.4]
- scope: consumer-visible
- confidence: confirmed
- verified_by: "U10: read BaseIcon, Icons/index.ts, generate-icon-exports.mjs; dist BaseIcon.d.ts:7 ships the IconSizes usage line. V6 (M32): tsc probe against the built dist (scratch/V6/iconsize-probe.ts) → `import { IconSizes }` TS2724, `const a: \"x\" = … as IconSize` → 'Type string is not assignable', `(string & {})` control keeps the literals, `IconSize.md` still yields the literal; CONFIRMED S2 (R1.4 form, not R1.2)."
- locations:
  - src/components/Icons/BaseIcon.tsx:3-15
  - src/components/Icons/BaseIcon.tsx:18
  - scripts/generate-icon-exports.mjs:41
  - src/components/Icons/index.ts:3
  - src/components/Icons/Icons.stories.tsx:2
  - src/components/Icons/Icons.stories.tsx:50
  - src/components/Icons/Icons.stories.tsx:169
  - src/components/Icons/Icons.stories.tsx:193-202
  - src/components/LoadingSpinner/spinnerGeometry.ts:32
- evidence: |
    BaseIcon.tsx:7   * Usage: <ChevronDownIcon size={IconSizes.md} />
    BaseIcon.tsx:9   export const IconSizes = {
    BaseIcon.tsx:15  export type IconSizes = (typeof IconSizes)[keyof typeof IconSizes] | string;
    BaseIcon.tsx:18    size?: IconSizes | number;
    generate-icon-exports.mjs:41  'export { BaseIcon, IconSizes as IconSize } from "./BaseIcon";',
    Icons/index.ts:3   export { BaseIcon, IconSizes as IconSize } from "./BaseIcon";   (generated)
    Icons.stories.tsx:2  import { BaseIcon, IconProps, IconSizes } from "./BaseIcon";
    (audit build) dist/index.d.ts:13  export { BaseIcon, IconProps, IconSizes as IconSize } from './components/Icons/BaseIcon.js';
- impact: The `| string` arm sits inside the derived type, so the public `IconSize` type is plain `string`. It offers no literal suggestions on `size=`, and it is not the open-value form R1.4 prescribes (`X | (string & {})`, used elsewhere at utils/color.ts and Text/constants.ts). Hovering `IconSize` in a consumer IDE shows JSDoc that tells them to write `IconSizes.md`, a name the package does not export (package.json `exports` has only `"."`, so no deep import reaches it). Source, stories and a comment in spinnerGeometry.ts use `IconSizes`, while the public name and shipped skills (token-contract.md:87) use `IconSize`. A string literal in a generator script is the only link between them. V6 scoped the cost: dot-access (`IconSize.md`), the R1.1-sanctioned call form, still works, so the visible defect is mainly the JSDoc and the lost literal union.
- recommendation: Rename the source const and type to `IconSize`, with the plain derived type `(typeof IconSize)[keyof typeof IconSize]`. Put the open arm on the prop (`size?: IconSize | (string & {}) | number`). Drop the generator alias so it emits `export { BaseIcon, IconSize }`, then regenerate the barrel. Fix the JSDoc, the stories and the comment. Public surface: the exported name `IconSize` (value and type) is unchanged, and `size` accepts exactly the same values. The one public change is that the `IconSize` type narrows from `string` to the four `var(--ui-icon-*)` literals. Consumer code that annotates an arbitrary string as `IconSize` stops type-checking, so this is a type-only narrowing and ships as a minor. Typing the colour props (`color`/`strokeColor`/`fillColor: string`) is left to the D-06 colour-mechanism decision (F-032).
- breaking: minor
- contract: n/a
- remediation: [WI-065]
- related: [F-032, F-063, F-039, F-089]

### F-026: Disabled state is drawn four ways with three helpers; CalendarPresetItem and SearchBox show no disabled look and DropdownTrigger fades its chevron twice
- severity: S2
- category: inconsistency
- rules: [R8.16, R2.2]
- scope: consumer-visible
- confidence: confirmed
- verified_by: "HC: disabled-helper scan (scratch/HC/disabled.txt), helper rules read. V5 (render check): scratch/V5/render-disabled.cjs SSR-rendered CodeDigitInput, CalendarPresetItem, SearchBox and DropdownTrigger from the audit dist, inlined dist/styles.css, read getComputedStyle in the Browser pane → CalendarPresetItem and SearchBox identical enabled vs disabled; DropdownTrigger chevron 0.6×0.6 = 0.36 light / 0.25 dark; CodeDigitInput DOES change surface/border (only its ds-disabled-state is inert); CONFIRMED S2."
- locations:
  - src/components/Calendar/CalendarPresetsPanel.tsx:31-34
  - src/components/Calendar/CalendarPresetsPanel.tsx:57-73
  - src/components/Menu/DropdownMenu.tsx:190-197
  - src/components/SearchBox/SearchBox.tsx:25-36
  - src/components/SearchBox/SearchBox.tsx:65-73
  - src/components/DropdownTrigger/DropdownTrigger.tsx:64-68
  - src/components/DropdownTrigger/DropdownTrigger.tsx:197-207
  - src/components/DropdownTrigger/DropdownTrigger.tsx:247-250
  - src/components/DropdownTrigger/DropdownTrigger.tsx:272
  - src/styles/index.css:855-859
  - src/components/VerificationCode/CodeDigitInput.tsx:8-9
  - src/components/VerificationCode/CodeDigitInput.tsx:52-53
  - src/components/Input/Input.tsx:124-126
  - src/components/Input/Input.tsx:155
  - src/components/Input/Input.tsx:163-170
  - src/components/Input/Input.tsx:181
  - src/components/Toggle/toggleOption.ts:16
  - src/components/Toggle/toggleOption.ts:32
  - src/components/AIChat/AIPromptInput.tsx:227
  - src/styles/dooph-component-tokens.css:12-33
  - src/styles/dooph-component-tokens.css:322-326
  - src/components/Button/Button.tsx:51-53
  - src/components/SplitButton/SplitButton.tsx:25-28
  - src/components/SplitButton/SplitButton.tsx:56-59
  - src/components/ShapeButton/ShapeButton.tsx:67-77
  - src/components/ShapeButton/ShapeButton.tsx:138
- evidence: |
    No disabled look:
      CalendarPresetsPanel.tsx:57/68   <button / menuItemClassName,      (native button; disabled arrives via ...props :73 but no data-disabled is set)
      DropdownMenu.tsx:197             "... ds-radix-data-disabled ... hover:bg-ghost-hover data-highl…"   (every disabled rule keys on [data-disabled])
      DropdownMenu.tsx:191-193         * Shared menu-item styling (Figma Menu Item). Exported so surfaces that cannot / * host a Radix `DropdownMenu.Item` — such as the calendar presets rail inside a / * Popover — render visually identical items. ...
      SearchBox.tsx:33                 'hover:border-input-border-hover',      (no disabled treatment anywhere; `disabled` lands on the inner <input> via ...props :72)
    Double fade:
      DropdownTrigger.tsx:67           "ds-disabled-state",                    (root opacity var(--ui-opacity-disabled))
      index.css:855-858                .ds-dropdown-caret-host:is(:disabled, [aria-disabled="true"], [data-disabled]) / .ds-dropdown-caret-chevron { ... opacity: var(--ui-opacity-disabled);
    Inert helper:
      CodeDigitInput.tsx:52-53         disabled && / "border-secondary-border-disabled bg-secondary-disabled ds-disabled-state",   (on a <div>)
      dooph-component-tokens.css:13    .ds-disabled-state:is(:disabled, [aria-disabled="true"]) {
      CodeDigitInput.tsx:8-9           * - `hasError` paints error-primary border + text; `disabled` uses secondary / *   disabled tokens + `ds-disabled-state`; focus uses brand focus ring.
    JS ternary beside an emitted attribute:
      Input.tsx:155 / :163-164         data-disabled={disabled ? "" : undefined} / disabled / ? "cursor-not-allowed bg-secondary-disabled border-secondary-border-disabled"
      DropdownTrigger.tsx:197-198/248  disabled / ? "cursor-not-allowed bg-secondary-disabled border-secondary-border-disabled" / data-disabled={disabled ? "" : undefined}
      Input.tsx:124                    "hover:border-input-border-hover hover:shadow-button-secondary",   (bare Input: hover not gated while disabled)
    Third helper and three hover guards:
      toggleOption.ts:32 / AIPromptInput.tsx:227   "ds-disabled-control",   (dooph-component-tokens.css:30 `.ds-disabled-control:disabled`; not in contrib:59)
      Button.tsx:51   "[&:not(:disabled):not([aria-disabled=true])]:hover:bg-primary-hover ..."  vs  SplitButton.tsx:25 "hover:enabled:bg-secondary-hover",  vs  ShapeButton.tsx:70 "group-hover:text-prominent-hover",
- impact: There is no single answer to "how does a DS control look disabled", and the gaps are already visible. A disabled CalendarPresetItem (a preset outside the consumer's data) renders and hovers exactly like an enabled one. Its only helper is the Radix `[data-disabled]` one, and Chromium matches `:hover` on disabled buttons. A disabled SearchBox is byte-identical to the enabled one apart from the UA cursor (its `Disabled` story shows this). Functionally both stay inert (native `disabled`), which keeps this out of S1. DropdownTrigger fades the whole root and then the caret CSS fades the chevron again, to 0.36 in light and 0.25 in dark. TypeableDropdownTrigger fades only the chevron, so two triggers Figma pairs look different when disabled. The repo already treats this double fade as a bug for the Checkbox inside DropdownMenuMultiSelectItem. CodeDigitInput paints the disabled surface and border but not the `ds-disabled-state` fade and `not-allowed` cursor its header promises (C-HDR-CodeDigitInput-4 FALSE). Its helper is on a `<div>` that can never match `:disabled`. A disabled bare `Input` still lifts its shadow on hover, while the wrapper variants gate it. `ds-disabled-control` is a strict subset of `ds-disabled-state` and is missing from contrib:59, so an agent following R8.16 cannot choose between them. The Button family guards hover three ways, and only Button's guard covers `aria-disabled`, which leaves an `aria-disabled` SplitButton or ShapeButton painting hover colours. `menuItemClassName`'s JSDoc promises "visually identical items" to non-Radix surfaces (C-JSDOC-DropdownMenu-1 FALSE).
- recommendation: One rule, applied everywhere. Put `ds-disabled-state` on the element that is natively or aria-disabled. On wrappers and Radix-like surfaces, emit `data-disabled` and style from it (`ds-radix-data-disabled` already matches any `[data-disabled]`) instead of JS ternaries. Concretely: CalendarPresetItem sets `data-disabled` when `disabled`, which makes the existing menu-item rules apply. SearchBox and CodeDigitInput mark their wrapper with `data-disabled` and use `ds-radix-data-disabled` + disabled surface tokens. DropdownTrigger keeps one fade, either root or content-only, matching TypeableDropdownTrigger. Input/TypeableDropdownTrigger style from the `data-disabled` they already emit. Fold `ds-disabled-control` into `ds-disabled-state` and update R8.16's list. Use Button's guard for SplitButton and ShapeButton.
- breaking: none
- contract: src/components/Menu/DropdownMenu.tsx:20 "Style open/disabled/highlighted via Radix data attributes only." → consistent (the CalendarPresetItem fix sets `data-disabled` in CalendarPresetsPanel.tsx; adding native `:disabled` rules to `menuItemClassName` instead would conflict); src/components/VerificationCode/CodeDigitInput.tsx:8-9 (## behavior) → consistent (the fix makes it true; reword the helper name in the same commit); src/components/Toggle/toggleOption.ts:16 "Disabled drops any fill; opacity comes from ds-disabled-control." (## behavior) → consistent only if updated in the same commit when the helper is folded; src/components/DropdownCaret/DropdownCaret.tsx:21-22 "Colours live in the .ds-dropdown-caret CSS … do not move them into props or classes here." → consistent (the double fade is fixed in the trigger root, not the caret); src/components/Input/Input.tsx:25-27 "`InputVariant.text` without `icon` stays a bare `<input>`" → consistent; src/components/Button/Button.tsx:7-9 (## behavior, disabled paints + `ds-disabled-state`) → consistent
- remediation: [WI-066, WI-067]
- related: [F-061, F-018, F-054, F-081, F-087]

### F-032: Two colour-prop mechanisms compete, so color="text-secondary" and "danger" draw nothing on ProgressIndicator, LoadingSpinner and AIContextGauge
- severity: S2
- category: duplication
- rules: [R1.4]
- scope: consumer-visible
- confidence: confirmed
- verified_by: "U2/U9/U11: rg COLOR_TOKENS|resolveDsColor → 3 private copies + DS_COLOR_TOKENS; traced AIContextGauge → ProgressIndicator's private resolver. V5 (M49, render-verified): scratch/V5/colorprop.cjs SSR + Browser pane computed stroke → LinearProgressIndicator color='text-secondary' rgb(74,74,74); ProgressIndicator 'text-secondary', LoadingSpinner 'text-secondary', AIContextGauge 'danger' → stroke: none; var() in the stroke attribute resolves (control); CONFIRMED S2, R1.4 conflict flagged as a decision."
- locations:
  - src/utils/color.ts:1-15
  - src/utils/color.ts:18-58
  - src/components/LoadingSpinner/LoadingSpinner.tsx:28-36
  - src/components/LoadingSpinner/constants.ts:16-21
  - src/components/ProgressIndicator/ProgressIndicator.tsx:33-40
  - src/components/ProgressIndicator/ProgressIndicator.tsx:51-57
  - src/components/ShapeMorphSpinner/ShapeMorphSpinner.tsx:33-36
  - src/components/ShapeMorphSpinner/ShapeMorphSpinner.tsx:67
  - src/components/AIChat/AIContextGauge.tsx:6-9
  - src/components/AIChat/AIContextGauge.tsx:28-31
  - src/components/AIChat/AIModelSelect.tsx:80
  - src/components/AIChat/AIModelSelect.tsx:123
  - src/components/AIChat/AIModelSelect.tsx:193
  - .agents/skills/dooph-ds-architecture/SKILL.md:62
  - .agents/skills/dooph-ds-architecture/SKILL.md:72-78
  - skills/dooph-design-system-usage/SKILL.md:365-366
- evidence: |
    color.ts:8         *   color="text"                 -> a DS token name, resolved to its CSS var
    color.ts:57        return DS_COLOR_TOKENS[color as DsColorToken] ?? color;          (18 keys incl. 'text-secondary', 'danger')
    LoadingSpinner.tsx:28  const COLOR_TOKENS: Record<LoadingSpinnerColor, string> = {    (2 keys: primary, prominent)
    ProgressIndicator.tsx:33  const COLOR_TOKENS: Record<string, string> = {             (same 2 keys; :39 return COLOR_TOKENS[color] ?? color;)
    ShapeMorphSpinner.tsx:67  color: COLOR_TOKENS[color as LoadingSpinnerColor] ?? color,   (third copy)
    constants.ts:17    primary: "primary",                                              (LoadingSpinnerColor values are names, not var() strings)
    AIModelSelect.tsx:80  color?: DsColor;                                              (same family: DsColor vocabulary; also :123, :193)
    arch:72-73         - The value IS the var reference, so resolution is a no-op and a consumer's token / override still applies. No lookup table to silently mis-map.
    arch:77-78         Used by ... `DS_COLOR_TOKENS` via the `color` prop (`Slider*`, `LinearProgressIndicator`).
- impact: The same prop name `color` accepts different name sets depending on the component, and the types do not show it (`LoadingSpinnerColor | (string & {})` accepts any string). `<LinearProgressIndicator color="text-secondary">` paints `#4a4a4a`. `<ProgressIndicator color="text-secondary">` and `<LoadingSpinner color="text-secondary">` emit `stroke="text-secondary"`, an invalid paint, so the arc silently does not draw. In the AI family, `color="danger"` works on the three AIModelSelect parts (`DsColor`) and draws nothing on AIContextGauge, which forwards to ProgressIndicator's private resolver. AIContextGauge's documented form (`var(--ui-color-danger-primary)`, :9) does work. Breadth is not uniform: ShapeMorphSpinner sets CSS `color` inline, so an unknown name is a dropped declaration and the shape inherits the parent colour instead of vanishing. Four copies of the vocabulary must change together on a token rename, and the three private copies already differ in typing. The rule text is itself contradictory (V5). arch:72-73 rejects "a lookup table to silently mis-map", while arch:77-78 cites the name-keyed `DS_COLOR_TOKENS` as an R1.4 user. `utils/color.ts` cannot be graded as an R1.4 violation on its own until the maintainer resolves that (D-06). Related shipped docs are already stale on who uses the util (C-ARCH-10, C-CB-10, C-JSDOC-color-1 STALE).
- recommendation: The maintainer decides D-06: one colour-prop mechanism, and whether R1.4 permits its name lookup. The recommended, non-breaking option routes LoadingSpinner, ProgressIndicator and ShapeMorphSpinner through `resolveDsColor` and deletes the three private `COLOR_TOKENS` maps. `DS_COLOR_TOKENS` already maps `primary` and `prominent` to the same vars, so every existing `LoadingSpinnerColor` value keeps resolving. The colour props are typed `DsColor`, and arch:57-78 is amended to sanction the name-keyed resolver explicitly. The alternative (reshape every colour const to `var()` strings with no lookup) is breaking for `color="text"` callers and would need the v6 migration.
- breaking: none
- contract: src/components/AIChat/AIContextGauge.tsx:6-9 "`color` is the open design value (a LoadingSpinnerColor key or any CSS colour)" (## behavior) → consistent (widening to DsColor is additive; update the parenthetical in the same commit); src/components/LinearProgressIndicator/LinearProgressIndicator.tsx:10 "`color` accepts a DS token name or any CSS color (same contract as Slider)" (## behavior) → consistent
- remediation: decision D-06 (+ blocked WI-068)
- related: [F-010, F-023, F-034, F-051]

### F-033: Flat ProgressIndicator paints a stray track dot near completion (about 82–95% depending on size) because the track formula is duplicated and only the wavy copy guards zero length
- severity: S2
- category: duplication
- rules: []
- scope: consumer-visible
- confidence: confirmed
- verified_by: "U9: scratch/U9/flatdot.html replicated getSpinnerGeometry('md') + the flat formula and counted track-colour pixels (p=0.88/0.9/0.92 → 258/250/104 px; p=1 → 0). V2 (M17): independent geometry script (scratch/V2/pi-geo.cjs) + raster check (scratch/V2/flatdot.html, controls: track omitted → 0 px; bare round-cap `0 C` dash → 306 px, butt cap → 0); bands confirmed; DOWNGRADE to S2."
- locations:
  - src/components/ProgressIndicator/ProgressIndicator.tsx:106-121
  - src/components/ProgressIndicator/ProgressIndicator.tsx:139-152
  - src/components/ProgressIndicator/ProgressIndicator.tsx:212
  - src/components/ProgressIndicator/waveGeometry.ts:130-155
- evidence: |
    ProgressIndicator.tsx:117  trackLength = Math.max(0, circumference - activeLength - 2 * gapLength);
    ProgressIndicator.tsx:120  trackOffset = trackLength + circumference - (activeLength + gapLength);
    ProgressIndicator.tsx:147  strokeLinecap="round"
    ProgressIndicator.tsx:148  strokeDasharray={`${trackLength} ${circumference}`}      (track <circle> is always rendered; "0 C" with a round cap still paints a dot)
    waveGeometry.ts:132-133    * be painted. A zero-length round-capped SVG dash still renders a dot, so the / * complete state must omit the track rather than relying on a `0` dash.
    waveGeometry.ts:149        if (length === 0) return null;
    ProgressIndicator.tsx:212  const track = getWavyTrackGeometry(       (only the wavy variant uses the guarded copy)
- impact: A determinate flat ProgressIndicator whose value settles in the clamp band shows a track-coloured dot in the gap between the arc's head and 12 o'clock. Per V2 the bands are sm ≈0.82–0.91, rg ≈0.84–0.92, md ≈0.87–0.93 and xl ≈0.90–0.95. Streamed progress passes through them; a jump straight to 1 does not settle there. At p=1 the dot hides under an opaque indicator but shows through a translucent custom `color`. V2's nuance: just before the clamp the track is already a sub-stroke-width round-capped arc, so the dot is the tail of the designed shrinking track that fails to disappear and then drifts one gap forward. The flat and wavy variants compute the same track twice, and the zero-length fix landed in one copy only. That is exactly the edit the duplication invites again. AIContextGauge renders this flat variant, so the AI prompt's context dial shows the dot near a full context window.
- recommendation: Make the flat variant use `getWavyTrackGeometry` for its track length and offset, and omit the track `<circle>` when it returns `null`, as the wavy variant does. The function is already variant-neutral in what it computes. Do not add any further abstraction: removing the inline copy is the whole fix. Reproduce first with a render script that counts the track circle's dash at p=0.9 (md).
- breaking: none
- contract: n/a
- remediation: [WI-069]
- related: [F-016, F-034, F-078, F-050]
- note-to-orchestrator: title tightened from "near 88–92%" (md only) to the V2 bands across sizes (sm .82 … xl .95).

### F-043: HeartFillIcon is drawn on a 16-unit grid inside a 24-unit viewBox and renders at about 58% size in the top-left corner
- severity: S2
- category: api-design
- rules: []
- scope: consumer-visible
- confidence: confirmed
- verified_by: "U10: scratch/U10/icons-bbox.mjs SSR'd every exported *Icon at size 48, union getBBox() per svg in the browser → HeartFillIcon x 1..15, y 2.5..14.5 while every other icon is centred on 12,12. V2 (M31): read HeartFillIcon/BaseIcon for any scale/transform/viewBox override (none); getBBox → {x:1, y:2.5, w:14, h:11.998, cx:8, cy:8.499}; public export, no story, unchanged since a01e5e8; CONFIRMED S2."
- locations:
  - src/components/Icons/HeartFillIcon.tsx:3-9
  - src/components/Icons/BaseIcon.tsx:50
- evidence: |
    BaseIcon.tsx:50       viewBox="0 0 24 24"                 (no prop changes it; HeartFillIcon passes only {...props} color)
    HeartFillIcon.tsx:6   d="M15 6.375c0 4.375-6.487 7.916-6.763 8.063a.5.5 0 0 1-.474 0C7.487 14.291 1 10.75 1 6.375A3.879 3.879 0 0 1 4.875 2.5c1.291 0 2.42.555 3.125 1.493C8.705 3.055 9.834 2.5 11.125 2.5A3.879 3.879 0 0 1 15 6.375Z"
    HeartFillIcon.tsx:7   fill={color ?? 'currentColor'}
    getBBox (V2): {"x":1,"y":2.5,"w":14,"h":11.998,"cx":8,"cy":8.499}   (14×12 of 24×24 = 58% × 50%; centre (8, 8.5) instead of (12, 12))
- impact: A consumer rendering `<HeartFillIcon size={IconSize.md} />` next to any other icon gets a visibly smaller heart pushed up and to the left. At 16px the glyph is about 9×8px, anchored at the top-left of its box, so it misaligns in buttons, menu rows and inline text, and changing `size` only scales the error. No story renders it (Icons.stories.tsx does not import it), so nothing surfaces the defect, and it has been wrong since the initial commit.
- recommendation: Put the glyph on the 24-unit grid. The path's own 16-unit layout (1-unit inset) maps exactly by a uniform ×1.5 scale, giving a bbox of 1.5..22.5 × 3.75..21.75. Either re-export the path at 24 units from Figma or apply the scale to the path. Add the icon to the Icons gallery story so the next drift is visible.
- breaking: none
- contract: n/a
- remediation: [WI-072]
- related: [F-063, F-105]

### F-059: .dark re-declares 6 tokens with their :root values (2 are needed), which cancels :root overrides inside nested .dark regions
- severity: S3
- category: rule-violation
- rules: [R5.3]
- scope: consumer-visible
- confidence: confirmed
- verified_by: "U1/U12: token script → exactly six .dark values identical to :root. V5 (M29): scratch/V5/darkdup.cjs → `IDENTICAL in .dark (6)`; cascade probe on the shipped token blocks → a consumer `:root{--ui-radius-avatar:4px}` survives under html.dark and is lost only inside a .dark island; deleting the 2 alias lines regresses islands (#f5f5f5 vs #222224); PARTIAL → DOWNGRADE(S3). C4: scratch/C4/alias-dark.cjs reproduces 2 alias + 4 literal duplicates."
- locations:
  - src/styles/tokens.css:647-648
  - src/styles/tokens.css:720-723
  - src/styles/tokens.css:31-32
  - src/styles/tokens.css:451
  - src/styles/tokens.css:541-543
- evidence: |
    tokens.css:451  --ui-size-checkbox: 18px;        tokens.css:720  --ui-size-checkbox: 18px;
    tokens.css:541  --ui-radius-checkbox: 6px;       tokens.css:721  --ui-radius-checkbox: 6px;
    tokens.css:542  --ui-radius-avatar: 8px;         tokens.css:722  --ui-radius-avatar: 8px;
    tokens.css:543  --ui-radius-avatar-sm: 6px;      tokens.css:723  --ui-radius-avatar-sm: 6px;
    tokens.css:31   --ui-color-primary-disabled: var(--ui-color-secondary-disabled);         tokens.css:647 (identical text — NEEDED)
    tokens.css:32   --ui-color-primary-border-disabled: var(--ui-color-secondary-border-disabled);   tokens.css:648 (identical text — NEEDED)
- impact: Only the four literal size/radius lines (:720-723) are R5.3 violations: the values are genuinely mode-invariant, yet `.dark` re-pins them. A consumer who overrides `--ui-size-checkbox`, `--ui-radius-checkbox` or `--ui-radius-avatar(-sm)` on `:root` only (the documented override point) keeps it under `<html class="dark">`, because their later rule wins the specificity tie (V5 result A). They lose it inside a `.dark` subtree island, which token-contract.md:11 documents as supported (V5 results C/E). The two alias lines (:647-648) are not redundant even though their text matches `:root`. A `var()` is resolved where it is declared, so without them a `.dark` island inherits the light `#f5f5f5` disabled paint (V5, browser). The unit recommendation "delete all six" would have shipped that regression. They are the same mechanism F-019 needs for 28 more aliases, and they are currently uncommented, so a future R5.3 sweep would delete them.
- recommendation: Delete the four literal lines (`tokens.css:720-723`). Keep the two alias lines and move them into the commented alias re-declaration group F-019 introduces, so their purpose is stated and a text-equality R5.3 check does not flag them again.
- breaking: none
- contract: n/a
- remediation: [WI-073]
- related: [F-019, F-047]

### F-060: TableHeaderCell passes the nonexistent text-text-primary, which also makes cn strip the Button's text-ghost-fg
- severity: S3
- category: rule-violation
- rules: [R5.2]
- scope: internal
- confidence: confirmed
- verified_by: "U12: classcheck → `text-text-primary` MISSING (theme has --color-text, -secondary, -tertiary only); tailwind-merge drops text-ghost-fg. V5 (M36): `grep -c '\\.text-text-primary' dist-styles.css` → 0; dist cn('text-ghost-fg border-transparent','w-full text-text-primary') → 'border-transparent w-full text-text-primary'; rendered sortable header has no bare text-ghost-fg; mechanism CONFIRMED → DOWNGRADE(S3), visible impact minimal."
- locations:
  - src/components/Table/Table.tsx:79-86
  - src/components/Button/Button.tsx:78-80
- evidence: |
    Table.tsx:80   variant={ButtonVariant.text}
    Table.tsx:82   className="w-full justify-start gap-1 text-text-primary"
    Button.tsx:78  text: [
    Button.tsx:79    "text-ghost-fg border-transparent",
    Button.tsx:80    "[&:not(:disabled):not([aria-disabled=true])]:hover:text-ghost-fg-active",
    dist cn (V5): border-transparent w-full text-text-primary      (text-ghost-fg removed; text-text-primary emits no CSS)
- impact: The class looks like a token utility, but no `--color-text-primary` / `--ui-color-text-primary` exists, so it generates nothing in the package build or in a consumer build with the preset. tailwind-merge still treats it as a text-colour class and deletes the Button's own `text-ghost-fg`, so the sortable label inherits its ancestor's colour. V5 measured the visible effect as minimal. Nothing in Table sets a colour, so the label behaves like every sibling cell. `--ui-color-ghost-foreground-active` equals `--ui-color-text` in both modes, so rest and hover look the same in an app whose body colour is the text token. What remains is a copy-pasteable fake token utility, plus a silently lost `text-ghost-fg` (#4a4a4a) whose Figma intent is unrecorded. The next contributor who copies `text-text-primary` gets no colour and no error.
- recommendation: Replace `text-text-primary` with the real `text-text` utility. That matches the evident intent and the inherited result, and it still strips `text-ghost-fg` deliberately. If the Figma header spec wants the ghost foreground, drop the override instead. Applying header typography uniformly is F-074.
- breaking: none
- contract: n/a
- remediation: [WI-074]
- related: [F-074, F-055, F-017]

### F-061: About 8 components style state with JS class ternaries, and 6 emit data attributes that nothing reads
- severity: S3
- category: rule-violation
- rules: [R2.2]
- scope: internal
- confidence: confirmed
- verified_by: "HC: single-line + multiline ternary scans (scratch/HC/r22-ternaries.txt, ternaries-ml.txt), each hit read. V7 (HC-F5): re-read every site and grepped src (CSS + TSX) for a reader of each emitted attribute → data-filled/data-error, CalendarPresetItem data-active, AIToolPart data-state, Input data-disabled, CalendarGrid data-range/-today/-outside, AIPromptInput data-state/-disabled have zero readers; the 'dominant idiom' is an even ~8/8 split; PARTIAL, S3."
- locations:
  - src/components/VerificationCode/CodeDigitInput.tsx:49-51
  - src/components/VerificationCode/CodeDigitInput.tsx:59-60
  - src/components/VerificationCode/CodeDigitInput.tsx:67-69
  - src/components/Input/Input.tsx:155
  - src/components/Input/Input.tsx:163-170
  - src/components/Input/Input.tsx:181
  - src/components/DropdownTrigger/DropdownTrigger.tsx:197-207
  - src/components/DropdownTrigger/DropdownTrigger.tsx:248-250
  - src/components/Calendar/CalendarPresetsPanel.tsx:60
  - src/components/Calendar/CalendarPresetsPanel.tsx:70
  - src/components/Calendar/CalendarGrid.tsx:166
  - src/components/Calendar/CalendarGrid.tsx:173
  - src/components/Calendar/CalendarGrid.tsx:228-229
  - src/components/Calendar/CalendarGrid.tsx:246
  - src/components/AIChat/AIToolPart.tsx:54
  - src/components/AIChat/AIToolPart.tsx:71-73
  - src/components/AIChat/AIPromptInput.tsx:139-140
  - src/components/HotkeyIndicator/HotkeyIndicator.tsx:22-24
- evidence: |
    Attribute emitted, then styled by ternary instead:
      CodeDigitInput.tsx:59-60   data-filled={filled || undefined} / data-error={hasError || undefined}
      CodeDigitInput.tsx:50      ? "border-danger-primary bg-secondary text-danger-primary"        (and :68 !filled && "opacity-0", :69 hasError && "text-danger-primary")
      CalendarPresetsPanel.tsx:60/70   data-active={isActive ? "" : undefined} / isActive && "bg-ghost-active",
      AIToolPart.tsx:54/71-72    data-state={state} / state === AIToolPartState.error / ? "text-danger-primary"
      CalendarGrid.tsx:166/173   data-range={position} / !isEndpoint && position !== "none" && "bg-ghost-active",
      CalendarGrid.tsx:229/246   data-outside={isOutside ? "" : undefined} / isOutside && "text-ghost-fg",
      Input.tsx:155/163          data-disabled={disabled ? "" : undefined} / disabled
    Attribute read by nothing at all:
      AIPromptInput.tsx:139-140  data-state={responding ? "responding" : trimmed ? "filled" : "empty"} / data-disabled={disabled || undefined}
    No attribute at all:
      HotkeyIndicator.tsx:22-24  pressed / ? 'bg-ghost-active border-border-primary' / : 'bg-surface-page border-border-primary'
- impact: R2.2's letter binds only Radix-set attributes (`data-state`, `data-disabled`, `data-highlighted`), and none of these is Radix-owned, so this is competing-pattern debt rather than a breach. The package is split evenly: about 8 components style DS-set state from a data attribute read by CSS (CopyButton `data-copied`, RevealChangeText `data-open`, RollHoverText/UnderlineLinkText `data-active`, RollingDigitsText, Slider, LinearProgressIndicator `data-hidden`, AIThinkingPart), and about 8 use JS ternaries. Six components emit an attribute that nothing reads (V7). That attribute looks like a public styling hook. A consumer's `data-[error]:` override then competes with a JS-injected class instead of a DS rule, and the next editor either styles against it (a third mechanism) or keeps it believing it is load-bearing. Where no attribute exists (HotkeyIndicator `pressed`), consumers cannot target the state at all. Two of HC's own "attribute idiom" examples (CalendarGrid, AIPromptInput) turned out to be unread emitters. The Toast provider case is filed as F-086, and the Input/TypeableDropdownTrigger disabled ternaries as F-026.
- recommendation: State the idiom once (arch Rule 2): DS-set visual state is a data attribute on the element, styled by `data-[x]:` utilities or a `ds-*` selector. Then restyle from the attributes already emitted: CodeDigitInput `data-[error]:`/`data-[filled]:`, CalendarPresetItem `data-[active]:bg-ghost-active`, CalendarGrid `data-[outside]:`/`data-[range=…]:`, and AIToolPart's label via a `group-data-[state=error]:` on the root. Add `data-pressed` to HotkeyIndicator. Keep AIPromptInput's attributes only if they are documented as consumer styling hooks, otherwise drop them.
- breaking: none
- contract: src/components/AIChat/AIToolPart.tsx:5-7 "`state` picks the tone: … `error` paints the label danger." (## behavior) → consistent (same tone, different mechanism); src/components/AIChat/AIToolPart.tsx:18-19 "`state` is AIToolPartState, never an AI SDK state string." → consistent; src/components/AIChat/AIPromptInput.tsx:21-27 (no transport/hotkeys; one submit size) → consistent; src/components/VerificationCode/CodeDigitInput.tsx:8 "`hasError` paints error-primary border + text" (## behavior) → consistent; src/components/Checkbox/Checkbox.tsx:13-14 and src/components/Menu/DropdownMenu.tsx:20 (Radix attributes only) → consistent (the recommendation extends their rule to DS-set state)
- remediation: [WI-075, WI-067]
- related: [F-026, F-086, F-096, F-113]

### F-063: BaseIcon's color prop paints only strokes; filled icons must re-wire it, and TagIcon's dot does not (visible only below stroke-width 1)
- severity: S3
- category: inconsistency
- rules: []
- scope: consumer-visible
- confidence: confirmed
- verified_by: "U10: read every icon with a geometry fill; HeartFillIcon and StopFilledIcon destructure color into fill, TagIcon keeps fill=\"currentColor\"; nothing sets CSS color. V6 (M30): SSR'd <TagIcon color=\"red\" size={240}> (scratch/V6/tag-ssr.cjs) and viewed it: at the default stroke width 2 the inherited red stroke covers the r=.5 dot entirely; at strokeWidth 0.5 a blue (inherited text colour) centre shows; DOWNGRADE(S3)."
- locations:
  - src/components/Icons/BaseIcon.tsx:56-62
  - src/components/Icons/HeartFillIcon.tsx:3-7
  - src/components/Icons/StopFilledIcon.tsx:3-14
  - src/components/Icons/TagIcon.tsx:7
  - src/components/Icons/Icons.stories.tsx:189-205
- evidence: |
    BaseIcon.tsx:59-60      fill: fillColor ?? undefined, / stroke: strokeColor ?? color ?? "currentColor",   (no CSS `color` is set from the prop)
    StopFilledIcon.tsx:5-6  {/* BaseIcon maps `color` to stroke only, so the fill is wired up here to / keep both in sync. ...
    StopFilledIcon.tsx:14   fill={color ?? "currentColor"}
    HeartFillIcon.tsx:3/7   export const HeartFillIcon = ({ color, ...props }: IconProps) => ( / fill={color ?? 'currentColor'}
    TagIcon.tsx:7           <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
    Icons.stories.tsx:193   <LightModeIcon size={IconSizes.md} color="var(--color-text)" />   ("Icon Colors" story uses only LightModeIcon)
- impact: BaseIcon's `color` prop reaches the stroke only, so any child painted with `currentColor` ignores it. Every filled icon therefore has to copy the HeartFill/StopFilled workaround, and the one that did not (TagIcon) is wrong latently. V6 showed it is invisible at the shipped default: the inherited `stroke-width: 2` covers the r=0.5 dot, so `<TagIcon color="red" />` renders a red dot. A consumer who sets `strokeWidth` below 1, as for a hairline icon set, gets a red outline with a dot in the inherited text colour. The "Icon Colors" story renders only LightModeIcon, so it cannot surface the mismatch. The cost is maintainability: the next filled glyph added to the generator-driven icon set inherits the trap.
- recommendation: Have BaseIcon also set CSS `color` from `color` when it is given, so `currentColor` fills and strokes both follow the prop. Then delete the two per-icon re-wirings, so TagIcon and every future filled icon are correct by construction. Add a filled icon to the "Icon Colors" story.
- breaking: none
- contract: n/a
- remediation: [WI-076]
- related: [F-004, F-043, F-023]

### F-067: The danger focus shadow is a literal in sync-theme.mjs while its siblings are tokens
- severity: S3
- category: inconsistency
- rules: [R8.1]
- scope: internal
- confidence: plausible: S3 outside the 29% Phase-4 sample, so not adversarially verified; facts re-checked by U1 (read sync-theme.mjs:232-236 and tokens.css:557-558) and by C4 (re-read both at b436647; `rg shadow-focus-danger src` → only the generated index.css:207 / theme.css:152 lines; the utility ships in dist/styles.css:1452)
- verified_by: "U1: read scripts/sync-theme.mjs COMPUTED block and the sibling tokens. C4: rg over src/**/*.{ts,tsx,css} → no component uses shadow-focus-danger; it is generated into both the package @theme block and the consumer theme.css preset from the script literal."
- locations:
  - scripts/sync-theme.mjs:232-236
  - scripts/sync-theme.mjs:4
  - src/styles/tokens.css:557-558
  - src/styles/tokens.css:146
  - src/styles/index.css:206-207
  - src/styles/theme.css:152
- evidence: |
    tokens.css:557       --ui-shadow-focus-prominent: 0 0 0 4px var(--ui-color-focus-ring-prominent);
    tokens.css:558       --ui-shadow-focus-primary: 0 0 0 4px var(--ui-color-focus-ring-primary);
    sync-theme.mjs:233   const COMPUTED = [
    sync-theme.mjs:235     "--shadow-focus-danger: 0 0 0 4px var(--ui-color-focus-ring-danger);",
    sync-theme.mjs:4     * Single source of truth: tokens.css
    index.css:207 / theme.css:152   --shadow-focus-danger: 0 0 0 4px var(--ui-color-focus-ring-danger);   (generated)
- impact: The three focus shadows are one family, but only two are tokens. A consumer who retunes ring geometry by overriding `--ui-shadow-focus-prominent` / `-primary` has no `--ui-shadow-focus-danger` to override, so the `shadow-focus-danger` utility that the theme.css preset publishes keeps a 4px ring baked into a build script. The script's own header calls tokens.css the "Single source of truth", and the `COMPUTED` escape hatch exists for this one entry only. A maintainer changing ring geometry in tokens.css will miss it. No component uses the danger shadow today (the danger ring is the outline helper `ds-focus-ring-danger-on-focus`), so the cost is a consumer-facing utility with an un-overridable value plus one special case in the generator.
- recommendation: Add `--ui-shadow-focus-danger` to tokens.css beside its siblings. The generic `ui-shadow-*` mapping then emits `--shadow-focus-danger: var(--ui-shadow-focus-danger)`. Delete the `COMPUTED` entry and regenerate with `npm run sync-tokens`. Because it aliases a dark-changed ring colour, it also gets a `.dark` alias re-declaration (F-019's pattern).
- breaking: none
- contract: n/a
- remediation: [WI-077]
- related: [F-019, F-018]

### F-068: ds-* helpers are split across two stylesheets with no rule; 28 classes in 10 component systems live in index.css, and R8.26 only covers token helpers
- severity: S3
- category: inconsistency
- rules: [R8.26]
- scope: internal
- confidence: confirmed
- verified_by: "U1: scratch/U1/dsclasses.mjs → 28 ds-* classes defined outside dooph-component-tokens.css, all in index.css @layer utilities, none duplicated. V8: `grep -oE '^\\s*\\.ds-[a-z0-9-]+' src/styles/index.css | sort -u` → 28 in 10 systems; read contrib:104-110 and codebase SKILL.md:28-40, 543-580; found systems straddling both files; PARTIAL (R8.26 over-read), S3 holds."
- locations:
  - src/styles/index.css:322-919
  - src/styles/index.css:921-1045
  - src/styles/index.css:4-5
  - src/styles/dooph-component-tokens.css:126-133
  - src/styles/dooph-component-tokens.css:363-394
  - src/styles/dooph-component-tokens.css:488-492
  - .agents/skills/dooph-ds-codebase/SKILL.md:34-36
  - .agents/skills/dooph-ds-codebase/SKILL.md:557-577
  - .agents/skills/dooph-ds-contribution/SKILL.md:109
- evidence: |
    codebase SKILL.md:34   index.css ← Tailwind build entry: @import chain, generated @theme inline block, text-style-* role classes (@layer components), h-button/size-* utilities
    codebase SKILL.md:36   dooph-component-tokens.css ← @layer utilities: ds-* helpers (spacing, disabled states, radix origin)
    contrib:109            3. If the token needs a `ds-*` helper class (for values that Tailwind can't express as a utility), add it to `dooph-component-tokens.css` under `@layer utilities`.
    index.css:369 .ds-shimmer-text { / :398 .ds-roll-hover { / :493 .ds-underline-link / :553 .ds-rolling-digits / :789 .ds-shape-morph {     (component motion systems in index.css)
    dooph-component-tokens.css:368 .ds-copy-icon-clipboard, / :419 .ds-chat-reveal {                                                      (the same kind of system in the other file)
    dooph-component-tokens.css:490  animation: ds-chat-stream-in var(--ui-chat-stream-duration)   (its @keyframes is index.css:1034)
    dooph-component-tokens.css:126-127  /* Linear progress — width/left interpolate because --progress-pct is a / * registered @property in index.css. */
- impact: Component motion systems of the same kind land in either file. CopyButton's swap and the AI-chat animations are in dooph-component-tokens.css. ShimmerText, RollHoverText, UnderlineLinkText, RollingDigitsText, RollChange/FadeChange, SidebarWithHoverIcon, MorphRotationShape, DropdownCaret and RevealChangeText are in index.css. Two systems already straddle both files: the chat stream class with its keyframes in index.css, and `.ds-progress-fill` with its `@property` in index.css. The next agent adding a motion helper has two live precedents and no rule. V8 scoped this: R8.26 (contrib:109) governs a token's helper for an un-expressible value, not component animation systems, so the index.css systems do not violate it, and the honest finding is that no rule decides placement. The codebase skill's prose (:557-577) does locate most index.css systems; shape-morph and dropdown-caret are undocumented. Its file map (:34-36) describes neither file's real contents (C-CB-11 STALE). index.css carries the build entry, generated theme, role typography, size utilities, ten animation systems, 15 keyframes and six `@property` registrations.
- recommendation: Write the placement rule down rather than move code for its own sake. Recommended rule: token helpers in dooph-component-tokens.css (R8.26); component motion systems, their `@keyframes` and their `@property` registrations together in one file, each system in one place. Then move the two straddling systems so each lives whole in one file, and correct the codebase skill's file map (:34-36), adding shape-morph and dropdown-caret to its helper list. Keyframes and `@property` work outside a layer in either file, since both are plain `@import`s.
- breaking: none
- contract: n/a
- remediation: [WI-029]
- related: [F-016, F-099, F-076]
- note-to-orchestrator: title tightened per V8: "despite R8.26" over-reads the rule (it scopes token helpers only).

### F-076: Dead CSS: three unused ds-* helpers, a dead .dark override, a no-op TableRow class and an outranked ToastClose override
- severity: S3
- category: dead-code
- rules: [R5.3]
- scope: internal
- confidence: plausible: S3 outside the 29% Phase-4 sample, so not adversarially verified; facts re-checked by U1 (dsclasses.mjs unused list), U12 (rg + git log -L on TableRow), U8 (built cn + buttonVariants merge, dist specificity) and C4 (re-read every line at b436647; `rg "ds-focus-ring\b|ds-my-ui-xs|ds-selection" src skills` → definitions and comments only)
- verified_by: "U1: scratch/U1/dsclasses.mjs → ds-focus-ring, ds-selection, ds-my-ui-xs used by 0 components/stories/skills. U12: rg sticker-bg-opacity-secondary → no dark reader; twm keeps both TableRow border classes. U8: scratch/U8/toastclose-merge.mjs → merged class keeps the ghost hover text (0,4,0) and hover:text-current (0,2,0)."
- locations:
  - src/styles/dooph-component-tokens.css:98-101
  - src/styles/dooph-component-tokens.css:359-361
  - src/styles/dooph-component-tokens.css:180-189
  - src/styles/tokens.css:98-108
  - .agents/skills/dooph-ds-codebase/SKILL.md:531
  - .agents/skills/dooph-ds-codebase/SKILL.md:540
  - src/styles/tokens.css:707-716
  - skills/dooph-design-system-theming/references/token-contract.md:112
  - src/components/Table/Table.tsx:112-113
  - src/components/Table/Table.tsx:27
  - src/components/Toast/Toast.tsx:165-169
  - src/components/Button/Button.tsx:75-76
- evidence: |
    dooph-component-tokens.css:98   .ds-focus-ring {                       (no user; :103-105 says its variant composition emits no rule and was replaced by .ds-focus-ring-on-open)
    dooph-component-tokens.css:359  .ds-my-ui-xs {                         (no user)
    dooph-component-tokens.css:185  .ds-selection ::selection,             (consumer opt-in; documented only in tokens.css:99 and never in skills/)
    codebase SKILL.md:531           ... `ds-focus-ring-danger-on-focus`, `ds-focus-ring` — token-backed outline rings ...   (C-CB-190 STALE)
    tokens.css:707-708              /* Secondary's own opacity variable drops to 60%, but the dark sticker WASH / * does not use it ...
    tokens.css:711                  --ui-sticker-bg-opacity-secondary: 60%;    (nothing in dark scope reads it; the dark wash at :712-716 reads --ui-sticker-bg-opacity)
    Table.tsx:112-113               "grid border-b border-border-primary", / "not-last:border-b",
    Table.tsx:27                    "flex flex-col w-full border border-border-primary rounded-normal",
    Toast.tsx:169                   "shrink-0 text-current hover:text-current active:text-current",
    Button.tsx:75                   "[&:not(:disabled):not([aria-disabled=true])]:hover:bg-ghost-hover [&:not(:disabled):not([aria-disabled=true])]:hover:text-ghost-fg-active",
- impact: Each item reads as if it does something. (1) `ds-focus-ring` and `ds-my-ui-xs` ship in styles.css and the codebase skill lists both as available (:531, :540), so agents reach for a helper whose only historical use was the broken variant composition. `.ds-selection` and its two tokens are a consumer feature that no consumer doc mentions, so consumers cannot discover it. (2) `.dark { --ui-sticker-bg-opacity-secondary: 60% }` is a documented override with no reader (token-contract.md:112 admits "the dark wash does not"). A consumer tuning it under `.dark` sees nothing change. (3) TableRow's `not-last:border-b` suggests "no divider under the last row", but the unconditional `border-b` beside it always paints one. That gives the last row a 2px bottom edge against the Table's own 1px border (Table.tsx:27), unlike the 1px top and sides. (4) ToastClose's `hover:text-current active:text-current` (0,2,0) loses to the ghost variant's guarded hover/active text (0,4,0). On the prominent toast the close icon switches to `--ui-color-ghost-foreground-active` (#161616 light) on the #340fd9 surface on hover and press, near-invisible, while the code reads as if that case were handled.
- recommendation: Document `.ds-selection` and `--ui-color-selection*` in token-contract.md. Drop the dead `.dark` sticker opacity override and its "60% dark" note. Keep one TableRow border rule, dropping the unconditional `border-b` so dividers sit only between rows as the modifier intends. Give ToastClose's colour override the same guarded selector as the ghost variant so tailwind-merge replaces it and the specificity matches. Remove `ds-focus-ring` and `ds-my-ui-xs` and their codebase-skill mentions. They ship in styles.css with no consumer doc, so that removal follows D-15 (undocumented internals: remove in the major vs document).
- breaking: none
- contract: n/a
- remediation: [WI-078] + decision D-15 (+ blocked WI-125)
- related: [F-001, F-019, F-086, F-042, F-099]

### F-084: ds-chat-prose re-spells four role typographies by hand and has drifted from them
- severity: S3
- category: duplication
- rules: []
- scope: internal
- confidence: plausible: S3 outside the 29% Phase-4 sample, so not adversarially verified; facts re-checked by U1 (side-by-side read of index.css:224-318 and dooph-component-tokens.css:580-644) and C4 (re-read both at b436647)
- verified_by: "U1 + C4: compared each .ds-chat-prose heading/code rule with the text-style-* role it mirrors, property by property; code lacks letter-spacing (--ui-tracking-mono) and font-optical-sizing; no comment ties the copies to the roles."
- locations:
  - src/styles/dooph-component-tokens.css:580-597
  - src/styles/dooph-component-tokens.css:636-644
  - src/styles/index.css:272-280
  - src/styles/index.css:289-311
  - src/styles/index.css:243-248
  - src/styles/tokens.css:442-445
- evidence: |
    index.css:272-279   .text-style-mono { font-family: var(--ui-font-mono); font-optical-sizing: auto; font-size: var(--ui-text-mono); ... letter-spacing: var(--ui-tracking-mono);
    dooph-component-tokens.css:636-640  .ds-chat-prose code { / font-family: var(--ui-font-mono); / font-size: var(--ui-text-mono); / font-weight: var(--ui-weight-mono); / font-variation-settings: var(--ui-font-var-mono);   (no letter-spacing, no font-optical-sizing)
    tokens.css:442-443  /* Figma "Mono Text" style: -3%. Tightens Google Sans Code's fixed advances / * to sit with the button role beside it; ...
    dooph-component-tokens.css:580-584  .ds-chat-prose h1 { / font-family: var(--ui-font-title); / font-size: var(--ui-text-title); / font-weight: var(--ui-weight-title); / font-variation-settings: normal;
    dooph-component-tokens.css:592-596  .ds-chat-prose h3 { / font-family: var(--ui-font-heading); / font-size: var(--ui-text-subheading); / font-weight: var(--ui-weight-subheading); / font-variation-settings: var(--ui-font-var-heading);
    index.css:245-246   * same voice set larger, not as a second one. Keep them in sync by hand if a / * base role gains a property; ...   (the hero copies are commented; the prose copies are not)
- impact: Inline code in AI answers renders without the role's -3% "Mono Text" tracking, so it sits differently from `MonoText` and from a mono button label beside it, with no stated reason. Every future change to a role (a new axis token, tracking, optical sizing) has to be made twice, and nothing tells the editor so. The hero-role copies in index.css carry a "keep in sync by hand" note; these four copies (title, heading, subheading, mono) do not. They cannot simply `@apply` the role classes, because the roles live in `@layer components` and the prose deliberately sits in `utilities` to beat markdown renderers (dooph-component-tokens.css:542-549). So the copy is justified, but its drift is not.
- recommendation: Add the missing `letter-spacing: var(--ui-tracking-mono)` and `font-optical-sizing: auto` to `.ds-chat-prose code`, add `font-optical-sizing: auto` to the h2/h3 copies, and add a "mirrors `.text-style-*` (index.css); keep in sync" note above the heading/code rules, matching the hero-role precedent. If prose code is meant to differ, say so in that comment instead.
- breaking: none
- contract: n/a
- remediation: [WI-079]
- related: [F-016, F-068, F-073]

## DONE
