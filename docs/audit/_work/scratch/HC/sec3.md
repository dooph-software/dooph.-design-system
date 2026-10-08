## 3. Findings

Only patterns that no unit filed whole: consolidations of piecemeal unit findings (they name the subsumed IDs in `related:`), plus two NEW items (HC-F7, and the unfiled sites inside HC-F5/HC-F8). Location lists are in the §2 tallies and are not repeated beyond the representative lines.

### HC-F1: Motion timing is hardcoded in 30 of 40 animated components through four mechanisms; only 10 carry the `--ui-<component>-*` duration + ease family R6.1 requires
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
- impact: Retuning a spacing or size token moves some of the DS and not the rest. Every one of the 32 token-equal numeric utilities silently decouples from its token, so a consumer override of `--ui-spacing-rg` resizes `px-rg` buttons but not `px-3` ones (Button's own size map, Button.tsx:85-86). Table's header/body alignment already depends on a token and a numeric step coinciding (U12-F12). Nine unit findings file slices of this, each with its own "add a token or use the scale" recommendation. Applied piecemeal, the same value (4 px, 8 px, 28 px, 160 px) gets different fixes in different folders.
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
    tokens.css:35-38       .ds-shape-button-focus-visible:focus-visible { outline: 2px solid var(--ui-color-focus-ring-prominent); outline-offset: 2px; }
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
