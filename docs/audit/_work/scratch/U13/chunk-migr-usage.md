
<!-- chunk: item 4 (migration forward-compat) + item 9 (usage coverage) -->
### U13-F9: The v3 migration skill's forward-compat pass is incomplete: it still tells the consumer to rename `bg-surface-page` (today's correct utility), its done-check greps for `surface-page` (so it can never reach zero hits), and "New in v3" advertises two removed APIs
- severity: S1
- category: doc-drift
- rules: [R13.11]
- scope: consumer-visible
- confidence: plausible
- verified_by: "`git show v5.3.0:skills/dooph-design-system-v3-migration/SKILL.md` had rows `--ui-color-surface-page` → `--ui-color-page-background` (:98) and `bg-surface-page` → `bg-page-background` (:139); commit 8a946e5 deleted those rows (target = source again at HEAD) and moved `--ui-color-surface-page` to the 'Unchanged' list, but left the bullet and the grep. theme-keys-head.txt contains `--color-surface-page`; exports-head.tsv: `ShapeButtons` keys = clover,cookie,diamond,puff,squircle; no `DropdownMenuVariant`."
- locations:
  - skills/dooph-design-system-v3-migration/SKILL.md:153-154
  - skills/dooph-design-system-v3-migration/SKILL.md:237,254-255
  - skills/dooph-design-system-v3-migration/SKILL.md:115
  - skills/dooph-design-system-v3-migration/SKILL.md:222-224
  - skills/dooph-design-system-v3-migration/SKILL.md:197-198
- evidence: |
    v3:115      `--ui-color-surface-page`, `--ui-color-border-popovers`, ...   (under "Unchanged — do NOT rename")
    v3:153-154  - `bg-surface` — same: leave `bg-surface-secondary` alone; rename only bare
                  `bg-surface` and `bg-surface-page`.
    v3:237      rg -n -e "destructive|surface-page|accent-color|--ui-color-logo|avatar-bg|text-logo|shadow-focus-destructive"
    v3:254      Zero hits from both passes + a clean build = migration complete. This skill no
    v3:223      `ButtonSize.iconMicro`, `ShapeButtons.star`, and `DropdownMenuVariant` for menu
    v3:197      Those are the only changed exports — `ButtonSize`, every other variant enum, and
- impact: A v2 app on HEAD already uses `--ui-color-surface-page`/`bg-surface-page` (v2 names that are current again). Line 115 says keep them; lines 153-154 say rename `bg-surface-page` (with no target row left in the table, the nearest instruction is the bare-`bg-surface` → `bg-surface-primary` row — silently repainting the page background); line 237's done-check reports every correct `surface-page` use as a stale survivor, so "zero hits" is unreachable without breaking the app. "New in v3" sends the agent to `ShapeButtons.star` and `DropdownMenuVariant`, both removed at HEAD (compile errors), and :197 still claims no other variant enum changed although `ButtonVariant.brand`, `ToggleVariant.secondary`, `SegmentedVariant.*Small`, `IconSize.*` etc. moved since (U13-F1 inventory). R13.11: "An old migration skill always ends at the present."
- recommendation: Delete `bg-surface-page` from :154 and `surface-page` from the :237 grep; drop or annotate the two removed APIs in :223; qualify :197 with a pointer to the v6 (or "5.4") inventory.
- breaking: none
- contract: n/a
- remediation: tbd
- related: [U13-F1]

### U13-F10: The usage skill never mentions the AIChat family (18 components, 3 consts) or ~50 other public exports, including every variant const a Tabs/Toggle/SegmentedTabSelect/Input call needs
- severity: S2
- category: doc-drift
- rules: [R13.2, R1.1]
- scope: consumer-visible
- confidence: plausible
- verified_by: "node: every name in dist-index.d.ts export list (443) tested with `(?<![\\w$])Name(?![\\w$])` against usage SKILL.md + references/responsive-sheet-modal.md → 140 mentioned; 86 `*Icon` + 95 `*Props` + 122 other names absent. `grep -c AI skills/dooph-design-system-usage/SKILL.md` → 0."
- locations:
  - skills/dooph-design-system-usage/SKILL.md:106-212
- evidence: |
    Absent — components: AIContextGauge, AIModelSelectItem, AIModelSelectTrigger, AIModelTooltipContent, AIPromptInput, AIPromptInputSubmit, AIPromptInputTextarea, AIPromptInputToolbar, AIPromptInputToolbarStart, AIPromptInputToolbarEnd, AITextPart, AIThinkingEffortSelector, AIThinkingEffortStep, AIThinkingPart, AIToolPart, AITurnSummary, ChatDivider, UserMessageHeader; DropdownMenuSearch, DropdownMenuSub, DropdownMenuGroup, DropdownMenuPortal, ModalPortal, SheetOverlay, SheetPortal, CheckboxIndicator; the whole Shapes family (Shapes const, BaseShape, ArrowShape, CapsuleShape, CloverShape, CookieShape, DiamondShape, DoubleShape, PentagonShape, PixircleShape, PuffShape, SquircleShape, StarShape, TripleShape, ShapeClipPath, SHAPE_VIEWBOX_SIZE, 12 *_SHAPE_PATH, SHAPE_MORPH_SPINNER_SHAPES); Toast parts + useToast; Tooltip parts
    Absent — variant/size consts: AIToolPartVariant, AIToolPartState, AIThinkingPartState, TabVariant, TabSize, ToggleVariant, ToggleSize, SegmentedVariant, SegmentedSize, InputVariant, CheckboxVariant, CheckboxChecked, AvatarSize, TextDropdownSize, ToastTypes, TooltipTypes, LoadingSpinnerVariant, LoadingSpinnerSize, LoadingSpinnerColor, ProgressIndicatorVariant(s), WavyDividerVariant, DropdownMenuItemVariant, DropdownMenuSegmentVariant, TextVariant, IconSize, RollDirection, RevealDirection
    Absent — helpers/types: DS_COLOR_TOKENS, DsColor, DsColorToken, resolveDsColor, serializeAxes, formatRangeLabel, formatSingleLabel, formatTriggerLabel, isSameDay, startOfDay, DateMatcher, CssTime, Font*/Tracking*/LineHeight*/LetterSpacing* value types, buttonVariants, checkboxVariants, stickerVariants, tabTriggerVariants
    Absent — icons: 86 of 88 *Icon exports (only ChevronDownIcon, SearchIcon named; no statement that an icon set or IconSize exists)
- impact: The skill's contract is "Reach for these before writing local UI" (:108) and "If something genuinely doesn't exist, compose it" (:214). An agent building a chat surface in a consuming app is never told the AIChat family exists and will hand-roll it — the exact failure the skill exists to prevent. Components that ARE listed (`Tabs`, `ToggleSwitch`, `SegmentedTabSelect`, `Input`, `Checkbox`, `Toast`, `Tooltip`, `LoadingSpinner`) are listed without the const their `variant`/`size` takes, which pushes agents toward string literals (Rule 1: "No string literals in consuming code, ever"). R13.2: a minor that adds components must edit the usage skill; the AIChat, Shapes and Sticker-era additions were not all carried in.
- recommendation: Add an AIChat bullet (components + the three consts + the "consumer maps AI-SDK states" note), a Shapes bullet (needed for `MorphRotationShape.shapes`), an Icons line (`IconSize`, `BaseIcon`, "88 icons"), and the variant const per listed component.
- breaking: none
- contract: n/a
- remediation: tbd
- related: [U13-F4, U13-F8]
