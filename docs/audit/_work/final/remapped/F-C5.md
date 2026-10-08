# F-C5 — final findings (composer C5) @ b436647

### F-002: CopyButtonProps resolves every inherited prop to any, so `<CopyButton />` with no `value` compiles and the shipped button copies the string "undefined"
- severity: S1
- category: type-safety
- rules: []
- scope: consumer-visible
- confidence: confirmed
- verified_by: "U4: tsc probes (scratch/U4/probe.tsx, probe2.tsx) against the built dist → `IsAny<CopyButtonProps['onClick']>` = any, `<CopyButton value=\"x\" href=\"/nope\" />` compiles. V7 (UPGRADE S1): tsc against dist/index.d.ts → `<CopyButton />`, `<CopyButton value={123} variant=\"bogus\" onCopied={42} />`, `foo={1}`, `onClick={(n: number) => n}` all compile; `IsAny<ComponentProps<typeof CopyButton>['value']>` = any; the exported component's props are an index-signature any-bag. C5 (scratch/C5/tsc, copies of Button/CopyButton): today, under `strict`, `onCopied={(v) => v.length}` and `onClick={(e) => …}` on CopyButton also fail with TS7006 (implicit any); with `CopyButtonProps` built on `ComponentPropsWithoutRef<\"button\">` the seven misuse calls error and those callbacks type-check (fixed.out.txt: 0 errors)."
- locations:
  - src/components/CopyButton/CopyButton.tsx:18-27
  - src/components/CopyButton/CopyButton.tsx:29
  - src/components/CopyButton/CopyButton.tsx:52-54
  - src/components/CopyButton/CopyButton.tsx:72
  - src/components/Button/Button.tsx:114-116
  - src/components/Button/Button.tsx:124
- evidence: |
    CopyButton.tsx:18  export interface CopyButtonProps
    CopyButton.tsx:19    extends Omit<
    CopyButton.tsx:20      ComponentPropsWithoutRef<typeof Button>,
    CopyButton.tsx:21      "variant" | "size" | "children" | "asChild"
    CopyButton.tsx:24    value: string;
    CopyButton.tsx:52        onClick?.(e as never);
    CopyButton.tsx:53        void navigator.clipboard
    CopyButton.tsx:54          .writeText(value)
    CopyButton.tsx:72          ref={ref as React.Ref<HTMLButtonElement>}
    Button.tsx:124     const ButtonBase = forwardRef<HTMLElement, ButtonProps<ElementType>>(
    (built copy, not in repo) dist/components/CopyButton/CopyButton.d.ts:14 declare const CopyButton: react.ForwardRefExoticComponent<Omit<CopyButtonProps, "ref"> & react.RefAttributes<HTMLElement>>;
- impact: `ComponentPropsWithoutRef<typeof Button>` instantiates the generic `Button` at its `ElementType` constraint, whose props collapse to `any`; `Omit` over that yields a string index signature, and the `Omit<CopyButtonProps, "ref">` in the emitted declaration then drops even the declared `value`/`variant`/`onCopied` keys. The published interface says `value: string` is required and `variant` is closed, but the exported component enforces neither: a consumer can ship `<CopyButton />` (it copies `"undefined"`), `onCopied={42}` (throws inside the clipboard promise, so the icon never reverts), a mistyped `onClick`, or unknown attributes that land on the DOM `<button>`, all with a clean `tsc` — while a strict consumer's correctly written inline `onCopied`/`onClick` callback gets no contextual type and fails with TS7006. Inside the file the same looseness is why `as never` (line 52) and the ref cast (line 72) are needed; they hide real mismatches from the next editor. CopyButton is the only component that derives its props from a generic component (V7: 1 grep hit).
- recommendation: Derive `CopyButtonProps` from the concrete element (`Omit<ComponentPropsWithoutRef<"button">, "children">` plus `value: string`, `variant?`, `onCopied?`), so the exported component checks every prop and requires `value`; then drop the `as never` cast. Leave the ref element type to F-089. The tighter type rejects only calls that contradict the published declaration (missing `value`, non-string `value`, `size`/`asChild`/`children` that the interface already omits, unknown or mistyped props), so it is a minor release with a CHANGELOG note.
- breaking: minor
- contract: src/components/Button/Button.tsx:5-6 "`variant` + `size` map through `buttonVariants` (cva) onto token-backed Tailwind utilities; `asChild` swaps the root for Radix `Slot`." → consistent (Button is cited as the cause; the fix does not touch Button.tsx)
- remediation: [WI-080]
- related: [F-036, F-089]

### F-003: `asChild` throws on OutlineButton, ShapeButton, DropdownTrigger and TextDropdownTrigger — 4 of the 5 leaves arch:221 promises it for — and no story exercises it
- severity: S1
- category: api-design
- rules: [R3.2, R8.4, R9.23, R8.22]
- scope: consumer-visible
- confidence: confirmed
- verified_by: "U4/U5/HC: react-dom/server renders of dist/index.cjs (scratch/U4/aschild.cjs, U5/aschild.cjs, HC/aschild.cjs). V2 (CONFIRMED S1): independent harness scratch/V2/aschild.cjs, @radix-ui/react-slot 1.3.3 → `THROW OutlineButton|OutlineButton glowing|ShapeButton|DropdownTrigger|TextDropdownTrigger -> Slot failed to slot onto its children. Expected a single React element child or \`Slottable\`.`; controls `OK Button -> <a href=\"/x\" …>`, `OK CTAButton -> <a href=\"/x\" …>`; all four render without asChild. `grep asChild` over the four components' stories → 0 hits."
- locations:
  - src/components/OutlineButton/OutlineButton.tsx:86
  - src/components/OutlineButton/OutlineButton.tsx:173
  - src/components/OutlineButton/OutlineButton.tsx:286-288
  - src/components/ShapeButton/ShapeButton.tsx:116
  - src/components/ShapeButton/ShapeButton.tsx:134
  - src/components/ShapeButton/ShapeButton.tsx:150-152
  - src/components/DropdownTrigger/DropdownTrigger.tsx:53
  - src/components/DropdownTrigger/DropdownTrigger.tsx:73-74
  - src/components/DropdownTrigger/DropdownTrigger.tsx:314
  - src/components/DropdownTrigger/DropdownTrigger.tsx:332-337
  - src/components/DatePicker/DatePickerTrigger.tsx:55-71
  - .agents/skills/dooph-ds-architecture/SKILL.md:221
  - .agents/skills/dooph-ds-codebase/SKILL.md:127-129
  - .agents/skills/dooph-ds-codebase/SKILL.md:220
  - .agents/skills/dooph-ds-codebase/SKILL.md:222
  - src/components/Button/Button.stories.tsx:12-22
  - src/components/OutlineButton/OutlineButton.stories.tsx:28-34
  - src/components/ShapeButton/ShapeButton.stories.tsx:12-22
  - src/components/DropdownTrigger/DropdownTrigger.stories.tsx:11-15
- evidence: |
    OutlineButton.tsx:86    const Comp = (asChild ? Slot : "button") as ElementType;
    OutlineButton.tsx:173   {glowing ? (                      ← child 1 of Comp: the orb spans
    OutlineButton.tsx:286   <span className="relative z-10 inline-flex items-center gap-2">   ← child 2
    ShapeButton.tsx:134     <span                             ← child 1: `ds-shape-button-shadow absolute inset-0 …`
    ShapeButton.tsx:150     <span className="relative z-10 inline-flex items-center justify-center">   ← child 2
    DropdownTrigger.tsx:73  <span className="flex-1 text-left">{children}</span>
    DropdownTrigger.tsx:74  <DropdownCaret variant={DropdownCaretVariant.dropdown} />
    DropdownTrigger.tsx:332 <span>{children}</span>
    DropdownTrigger.tsx:333 <ChevronDownIcon
    react-slot 1.3.3 dist/index.mjs  `!hasSlottable && React.Children.count(children) === 1 && React.isValidElement(children)` else `throw new Error(createSlotError(ownerName))`
    arch SKILL.md:221       Leaf interactive components (Button, DropdownTrigger, TextDropdownTrigger, OutlineButton, ShapeButton) support `asChild` via `@radix-ui/react-slot`.
    Claims register: C-ARCH-22 (arch:221), C-CB-36/C-CB-37 (codebase:127-128 "asChild ✅"), C-CB-86/C-CB-88 (codebase:220/222 "Slot … asChild") — all FALSE; C-CB-39 (codebase:129 CopyButton "asChild via Button") FALSE — CopyButton omits `asChild` (CopyButton.tsx:21).
    Stories: argTypes of Button (:12-22), OutlineButton (:28-34), ShapeButton (:12-22) have no asChild; DropdownTrigger meta (:11-15) has no `component` and no asChild story; only CTAButton.stories.tsx:71-83 sets asChild.
- impact: `asChild?: boolean` is in the public prop type of all four components and the architecture and codebase skills advertise it, but every one of them renders its decoration (orbs, shape span, caret, chevron) as a sibling of `children` inside the `Slot`, so the documented `<X asChild><Link/></X>` pattern throws during render and takes down the React tree (error boundary or blank page). DatePickerTrigger spreads its rest props onto DropdownTrigger (DatePickerTrigger.tsx:55,71), so `asChild` there throws too. Even a non-throwing Slot would not merge onto the consumer's element, which sits inside the content span. It shipped because no story contradicts `asChild`'s default on Button, OutlineButton, ShapeButton or the triggers (R9.23); one story would have thrown in Storybook. The skill rows that mark them ✅ are repo-internal, but the typed prop itself is the consumer-facing promise.
- recommendation: One pattern for decorated leaves: render the decoration as siblings of a Radix `Slottable` inside the `Comp` root, using `Slottable`'s render-prop form (`child={children}`, available from react-slot 1.3.3, which is the package's floor) so the content span that layers or lays out the label wraps the consumer element's own children; the non-`asChild` DOM is unchanged and the public API is unchanged. Add an `AsChild` story for each of the four components and Button, and correct the skill rows (including CopyButton's "via Button").
- breaking: none
- contract: src/components/ShapeButton/ShapeButton.tsx:9-10 "The icon slot carries the CONTENT color separately, because the shape span has already spent `currentColor` on the fill." and :13-14 "`shapeComponents` must stay keyed by `ShapeButtons`" → consistent (the icon-slot span and the shape span are kept; only their position relative to `Slottable` changes)
- remediation: [WI-081]
- related: [F-105, F-024, F-036]

### F-024: Sticker wraps its children in an inner div the root already lays out, so a consumer gap override on Sticker does nothing
- severity: S2
- category: rule-violation
- rules: [R3.3, R3.4, R9.11]
- scope: consumer-visible
- confidence: confirmed
- verified_by: "U12: read Sticker.tsx (root already `inline-flex … items-center`, single child). V7 (M56 PARTIAL): rendered `<Sticker><CheckIcon /> Verified</Sticker>` from dist in the Browser pane, unwrapped the inner div and put `gap-xs` on the root → pixel-identical (`root [92.6, 33]`, `svg@10.0,9.5 w14.0`, `\" Verified\"@32.0,7.0 w50.6` both ways). HC-F8's TextDropdownTrigger leg REFUTED: removing its bare span adds an 8px flex gap between mixed children (`Sort by <b>Name</b>`: root 113.4 → 118.3px) — that span is purposeful."
- locations:
  - src/components/Sticker/Sticker.tsx:131
  - src/components/Sticker/Sticker.tsx:33
  - src/components/Sticker/Sticker.tsx:10-12
  - .agents/skills/dooph-ds-architecture/SKILL.md:232-236
  - src/components/DropdownTrigger/DropdownTrigger.tsx:73
  - src/components/DropdownTrigger/DropdownTrigger.tsx:332
  - src/components/Menu/DropdownMenu.tsx:326
  - src/components/AIChat/AIModelSelect.tsx:64
  - src/components/AIChat/AIModelSelect.tsx:100
- evidence: |
    Sticker.tsx:33   "inline-flex w-fit items-center overflow-clip",
    Sticker.tsx:131  <div className="flex flex-row items-center gap-xs">{children}</div>
    Sticker.tsx:10   * - Children are the content. They are wrapped in a row with `gap-xs` so an
    Sticker.tsx:11   *   icon and a text node sit beside each other without a wrapper at the call
    Sticker.tsx:12   *   site. The wrapper is layout, not an interactive element.
    arch SKILL.md:232  Wrapping children in a layout span is acceptable ONLY when visually required and the wrapper is not interactive. Examples:
    (cf.) Button.tsx:39  "inline-flex items-center justify-center gap-2 whitespace-nowrap",   ← gap on the root, children direct
    Purposeful but undocumented wrappers (V7 render / HC §2(j)):
    DropdownTrigger.tsx:73   <span className="flex-1 text-left">{children}</span>        (pushes the caret to the far edge)
    DropdownTrigger.tsx:332  <span>{children}</span>                                  (keeps multi-node children one inline run)
    DropdownMenu.tsx:326     <span className="flex flex-1 items-center gap-sm">{children}</span>   (MultiSelectItem: fills beside the checkbox)
    AIModelSelect.tsx:64     <span className="whitespace-nowrap text-text">{children}</span>
    AIModelSelect.tsx:100    <span className="min-w-0 flex-1 truncate">{children}</span>
- impact: arch Rule 3 allows a wrapper around children only when it is "visually required"; the render shows Sticker's is not: a gap on the root produces the identical layout, as Button already does. Because the only flex container that holds the children is the private inner div, a consumer's `className="gap-sm"` or `[&>svg]:…` on `<Sticker>` lands on the root and silently does nothing, and the package has two ways to space an icon and a label in a chip-like leaf. The header documents the wrapper (R3.4's "documented" is met) but not why it is needed, because it is not. Separately, the arch list at :232-236 is introduced as "Examples:", so it is not a whitelist, but the other load-bearing wrappers (the trigger spans, MultiSelectItem's row, AIModelSelect's two spans) carry no note of their reason at the site, so an agent enforcing R3.4 cannot tell them from Sticker's; deleting TextDropdownTrigger's span, as HC-F8 proposed, would change how mixed children render (V7).
- recommendation: Move `gap-xs` onto `stickerVariants`' base and render `{children}` directly; rewrite the header's children bullet in the same change. Keep TextDropdownTrigger's span and the other purposeful wrappers, and give each a one-line comment stating its layout reason so the R3.4 "documented" test has something to read.
- breaking: none
- contract: src/components/Sticker/Sticker.tsx:10-12 "They are wrapped in a row with `gap-xs` … The wrapper is layout, not an interactive element." (## behavior, not a constraint; the constraints at :17-23 concern the wash and `custom`) → consistent, provided the behavior bullet is rewritten in the same change (R10.4); src/components/AIChat/AIModelSelect.tsx (has a header) → consistent (comment-only addition)
- remediation: [WI-083, WI-081]
- related: [F-111, F-074, F-003, F-001]

### F-036: The seven polymorphic components type all 40 destructured props as `any` inside their bodies, so misspelled or renamed props compile
- severity: S2
- category: type-safety
- rules: []
- scope: consumer-visible
- confidence: confirmed
- verified_by: "HA: scratch/HA/polyany.cjs (TS checker type of each destructured binding) + tsc probe. V6 (CONFIRMED S2): scratch/V6/polyany.cjs → `total named bindings 40 any 40` (Button.tsx:125 ×4, CopyButton.tsx:30 ×5, DropdownTrigger.tsx:52 ×3 and :304 ×4, OutlineButton.tsx:73 ×7, ShapeButton.tsx:105 ×5, BaseText.tsx:62 ×12); typo, stale-name and wrong-type destructures compile, the `ButtonProps<\"button\">` control errors. C5 (scratch/C5/tsc, patch-f036.cjs on copies of all seven files): with each render function typed against its concrete element, `tsc --noUnusedLocals` → 0 errors and every public generic call (`<OutlineButton<\"a\"> href>`, `<BaseText as=\"label\" htmlFor>`) still compiles."
- locations:
  - src/components/Button/Button.tsx:124-125
  - src/components/CopyButton/CopyButton.tsx:29-38
  - src/components/DropdownTrigger/DropdownTrigger.tsx:49-52
  - src/components/DropdownTrigger/DropdownTrigger.tsx:300-311
  - src/components/OutlineButton/OutlineButton.tsx:69-83
  - src/components/ShapeButton/ShapeButton.tsx:104-118
  - src/components/Text/BaseText.tsx:61-80
- evidence: |
    Button.tsx:124         const ButtonBase = forwardRef<HTMLElement, ButtonProps<ElementType>>(
    Button.tsx:114-116     export type ButtonProps<TElement …> = ButtonOwnProps & Omit<ComponentPropsWithoutRef<TElement>, keyof ButtonOwnProps>;
                           → at TElement = ElementType the Omit is an `any` index signature; forwardRef's PropsWithoutRef<P> then Omits "ref" from it, erasing the named own props
    OutlineButton.tsx:71   OutlineButtonProps<ElementType>
    DropdownTrigger.tsx:51 DropdownTriggerProps<ElementType>     DropdownTrigger.tsx:302  TextDropdownTriggerProps<ElementType>
    ShapeButton.tsx:117    const Shape = shapeComponents[shape as ShapeButtons];       (cast from any)
    ShapeButton.tsx:118    const resolvedVariant = variant as ShapeButtonVariant;     (cast from any)
    BaseText.tsx:61        const BaseTextBase = forwardRef<HTMLElement, BaseTextProps<ElementType>>(
    BaseText.tsx:80        const role = unstyled ? undefined : (variant as TextVariant);   (cast from any)
- impact: The exported components are cast back to a generic call signature, so consumers keep call-site checking (CopyButton excepted, F-002), but inside these seven bodies `strict` checks nothing: wrong-type uses, typos and stale names all compile, and the three `as` casts above look like checks while asserting over `any`. The trap is the next rename: renaming OutlineButton's `inverseTheme` (F-031 proposes it) or any of BaseText's twelve style props in the own-props type alone leaves the body's old destructure compiling as `undefined`, and the flag silently stops working; only a React unknown-prop warning in development hints at it. The scaffold that produces this is hand-copied in six files, so each new polymorphic leaf inherits it.
- recommendation: Type each base's render function against its own props plus the concrete default element (`ButtonProps<"button">`, `OutlineButtonProps<"button">`, `ShapeButtonProps<"button">`, `DropdownTriggerProps<"button">`, `TextDropdownTriggerProps<"button">`, and for BaseText the own props plus `as?: ElementType` over span attributes), keep the generic only on the exported cast, and drop the casts-from-any. This is a one-type-argument change per file, so no shared helper type is needed; CopyButton is fixed by F-002's props change.
- breaking: none
- contract: src/components/Button/Button.tsx:5-6 "`variant` + `size` map through `buttonVariants` (cva) … `asChild` swaps the root for Radix `Slot`." → consistent (typing only); src/components/ShapeButton/ShapeButton.tsx:13-14 "`shapeComponents` must stay keyed by `ShapeButtons`, which `satisfies Record<string, Shapes>`" → consistent (dropping the cast indexes the same map by the now-typed `shape`)
- remediation: [WI-030, WI-080]
- related: [F-002, F-031, F-037, F-003]

### F-037: cva-derived prop types admit `null`, so `<Button variant={null}>` compiles and renders with no variant classes (and `<SheetContent side={null}>` with no position)
- severity: S2
- category: type-safety
- rules: [R1.2, R1.1]
- scope: consumer-visible
- confidence: confirmed
- verified_by: "HA: built d.ts read + `buttonVariants({variant:null,size:null})` and SSR of `<Button variant={null}>` from dist. V6 (CONFIRMED S2): tsc probe against dist types (scratch/V6/null-variant.tsx) → `<Button variant={null} size={null}>`, `<SheetContent side={null}>`, `variant={cond ? ButtonVariant.primary : null}` compile (exit 0; the `variant=\"nope\"` control errors); SSR (scratch/V6/null-variant.cjs): default Button → `bg-secondary text-secondary-fg h-button px-3`, `variant={null} size={null}` → no colour, height or padding classes; real cva with the sheet recipe: `side:null` → `\"fixed z-50\"` (every inset/width/border/slide class dropped)."
- locations:
  - src/components/Button/Button.tsx:110-112
  - src/components/Button/Button.tsx:125
  - src/components/Button/Button.tsx:130
  - src/components/Sheet/Sheet.tsx:120-127
  - src/components/Sheet/Sheet.tsx:132
  - src/components/Sheet/Sheet.tsx:142
  - src/components/Checkbox/Checkbox.tsx:70-73
  - src/components/Tabs/Tabs.tsx:33-36
- evidence: |
    Button.tsx:110   type ButtonOwnProps = VariantProps<typeof buttonVariants> & {
    Button.tsx:130   className={cn(buttonVariants({ variant, size }), className)}
    Sheet.tsx:123    VariantProps<typeof sheetVariants> & {
    Sheet.tsx:132    side = SheetSide.right,          ← the default replaces undefined only; null reaches the recipe
    Sheet.tsx:142    className={cn(sheetVariants({ side }), className)}
    Checkbox.tsx:73  VariantProps<typeof checkboxVariants> {}
    Tabs.tsx:36      VariantProps<typeof tabTriggerVariants> {}
    (built copy) dist/components/Button/Button.d.ts  variant?: "text" | … | "ghost" | null | undefined;
- impact: The type consumers see is the recipe's, not the const's, so `null` is a type-valid value and a natural one (`variant={active ? ButtonVariant.primary : null}`). cva treats `null` as "no variant" and drops the default, so the result is a transparent, unsized Button, or a `fixed z-50` Sheet with no inset, width, border or slide animation, with no warning. The const and the cva keys also become two sources of truth: a key added to a recipe is a valid prop value with no const member, which pushes callers to string literals (R1.1). Button is the most-used component in the package. Checkbox and TabsTrigger use the same typing (recorded by U6-F14 under F-087); Sticker.tsx:71-74 already documents why intersecting `VariantProps` is wrong.
- recommendation: Type `variant`/`size`/`side` from the exported consts (`variant?: ButtonVariant; size?: ButtonSize`, `side?: SheetSide`, and `CheckboxVariant`/`TabSize`/`TabVariant` for the other two), as Toggle, Sticker and Slider already do, and keep cva an implementation detail. Removing `null` from the accepted types breaks TypeScript call sites that pass it, so it ships in the next major with a migration line.
- breaking: minor
- contract: src/components/Button/Button.tsx:5-6 "`variant` + `size` map through `buttonVariants` (cva) onto token-backed Tailwind utilities" → consistent (the header describes the mapping, not the prop typing); src/components/Checkbox/Checkbox.tsx:12-14 "Style states via Radix `data-[state]` / `data-[disabled]` only" → consistent (typing only)
- remediation: [WI-126]
- related: [F-087, F-036, F-002]

### F-041: SplitButtonTrigger renders an icon-only button with no accessible name, and nothing tells consumers to supply one
- severity: S2
- category: api-design
- rules: []
- scope: consumer-visible
- confidence: confirmed
- verified_by: "U4: SSR of `<SplitButton>Save</SplitButton>` from dist → trigger `<button class=\"inline-flex size-button …\"><svg … aria-hidden=\"true\" …>` with no aria-label or text. V7 (CONFIRMED S2): rendered from dist in the Browser pane, accessibility tree `button \"Save\"` followed by an unnamed `button`; `grep -n aria SplitButton.stories.tsx` → 0; no skill mentions naming the trigger."
- locations:
  - src/components/SplitButton/SplitButton.tsx:44-66
  - src/components/SplitButton/SplitButton.tsx:93
  - src/components/Icons/BaseIcon.tsx:46
  - src/components/SplitButton/SplitButton.stories.tsx:25
  - src/components/SplitButton/SplitButton.stories.tsx:48
  - src/components/SplitButton/SplitButton.stories.tsx:57
  - skills/dooph-design-system-usage/SKILL.md:112
  - .agents/skills/dooph-ds-codebase/SKILL.md:124-126
- evidence: |
    SplitButton.tsx:62   {...props}
    SplitButton.tsx:63   >
    SplitButton.tsx:64     <ChevronDownIcon />
    SplitButton.tsx:93   <SplitButtonTrigger disabled={disabled} {...triggerProps} />
    BaseIcon.tsx:46      "aria-hidden": ariaHidden = true,
    SplitButton.stories.tsx:57  <SplitButtonTrigger />
    usage SKILL.md:112   `SplitButton` (+ `SplitButtonAction`, `SplitButtonTrigger`),
    (cf.) CopyButton.tsx:83  aria-label={copied ? "Copied" : "Copy to clipboard"}
- impact: Every default `SplitButton`, and every story including `WithDropdown` (where `DropdownMenuTrigger asChild` adds `aria-haspopup`/`aria-expanded` but no name), ships a focusable control that screen readers announce only as "button" (WCAG 4.1.2 name, role, value). A consumer can fix it with `triggerProps={{ "aria-label": … }}` or `aria-label` on the part, but no doc, story or prop comment says so. CopyButton in the same family supplies its own default name, so the family disagrees about icon-only controls.
- recommendation: Give `SplitButtonTrigger` a default `aria-label` that a consumer's `aria-label`/`aria-labelledby` overrides, document the override on the props type, and show a localised label in the stories.
- breaking: none
- contract: n/a
- remediation: [WI-084]
- related: [F-081, F-092, F-090]

### F-044: RollHoverText puts `aria-label` on a role-less span whose content is all `aria-hidden`, so in body copy its words can drop out for assistive technology
- severity: S2
- category: api-design
- rules: []
- scope: consumer-visible
- confidence: confirmed
- verified_by: "U3: read RollHoverText.tsx:48-90 vs RollingDigitsText.tsx:277-281. V7 (CONFIRMED S2): rendered `<BodyText>… hover <RollHoverText>Deploy piggyback</RollHoverText> and confirm.</BodyText>` from dist in the Browser pane; the accessibility read gives the paragraph as `generic \"Inline in a paragraph hover and confirm.\"` (phrase missing) and the phrase only as a separate `generic \"Deploy piggyback\"` name — a name on a role ARIA 1.2 prohibits naming. Inside a Button, name-from-content does pick up the label, so the button case works."
- locations:
  - src/components/AnimatedText/RollHoverText.tsx:49-53
  - src/components/AnimatedText/RollHoverText.tsx:62-89
  - src/components/AnimatedText/RollHoverText.tsx:28
  - src/components/AnimatedText/RollingDigitsText.tsx:277-281
  - src/components/AnimatedText/AnimatedText.stories.tsx:192-204
- evidence: |
    RollHoverText.tsx:49   <span
    RollHoverText.tsx:51     aria-label={children}
    RollHoverText.tsx:66     <span key={segmentIndex} aria-hidden="true">
    RollHoverText.tsx:74     aria-hidden="true"
    RollHoverText.tsx:28   * upward. Inherits all typography; compose it inside ButtonText/BodyText or a Button.
    RollingDigitsText.tsx:280  <span className="sr-only">{children}</span>
    RollingDigitsText.tsx:281  <span aria-hidden="true" className="ds-rolling-digits-figure">
    AnimatedText.stories.tsx:199  <RollHoverText>Deploy piggyback jerky</RollHoverText> and confirm the
- impact: The `aria-hidden` on every glyph is required (each character renders twice, `ds-roll-hover-out` and `ds-roll-hover-in`), so the words reach assistive technology only through `aria-label` on a `generic` span. ARIA 1.2 prohibits naming that role, and screen readers in reading mode commonly ignore such a name, so in the documented body-copy use (the JSDoc names BodyText; the `RollHoverInBodyCopy` story renders it inline in a paragraph) the phrase can vanish from the sentence. The sibling RollingDigitsText in the same folder already solves the same problem with an `sr-only` copy and records why, so the folder now teaches two patterns for one problem.
- recommendation: Use RollingDigitsText's pattern in RollHoverText: render the string once in an `sr-only` span as the root's first child and remove the root's `aria-label`; the existing per-segment `aria-hidden` stays, and the `ds-roll-hover*` classes and the nesting the CSS selects on are unchanged.
- breaking: none
- contract: src/components/AnimatedText/RollingDigitsText.tsx (header present; cited only as the precedent) → consistent (the file is not changed)
- remediation: [WI-086]
- related: [F-079]

### F-062: In 9 components `className` styles a different element than `ref`/`style`/rest props, only Input documents its split, and OutlineButton's consumer mouse handlers replace its glow handlers
- severity: S3
- category: inconsistency
- rules: []
- scope: consumer-visible
- confidence: confirmed
- verified_by: "U4/U6/HB: each forwardRef body re-read for where `className`, `ref`, `style` and `{...props}` land (scratch/HB/matrix.psv). V7 (M52, DOWNGRADE S3): Browser-pane render of `<OutlineButton id=\"OB\" className=\"CONSUMER-CLASS\" style={{outline:\"2px solid red\"}} data-x=\"1\" onMouseMove={…}>` from dist → `<div class=\"… rounded-[28px] ds-p-ui-xs CONSUMER-CLASS\"><button class=\"group relative …\" id=\"OB\" data-x=\"1\" style=\"outline: red solid 2px;\">`; after a dispatched mousemove `{consumerMoveCalls: 1, OB_gx: \"(unset)\", OB2_gx: \"0.100\"}` — the internal handler never ran. U6-F16 sites confirmed as written. Correction applied: the chrome/core split is a deliberate, documented DS pattern (Input), not an OutlineButton-only outlier."
- locations:
  - src/components/OutlineButton/OutlineButton.tsx:144-152
  - src/components/OutlineButton/OutlineButton.tsx:154-171
  - src/components/OutlineButton/OutlineButton.tsx:73-83
  - src/components/SearchBox/SearchBox.tsx:25-36
  - src/components/SearchBox/SearchBox.tsx:65-72
  - src/components/Menu/DropdownMenuSearch.tsx:52-57
  - src/components/Menu/DropdownMenuSearch.tsx:64-72
  - src/components/SegmentedTabSelect/SegmentedTabSelect.tsx:61-70
  - src/components/Slider/Slider.tsx:306-313
  - src/components/Slider/Slider.tsx:329-331
  - src/components/Slider/Slider.tsx:444-446
  - src/components/VerificationCode/CodeDigitInput.tsx:44-57
  - src/components/VerificationCode/CodeDigitInput.tsx:74-90
  - src/components/Input/Input.tsx:8-9
- evidence: |
    | split | components | quote |
    |---|---|---|
    | className → chrome wrapper; ref/style/rest → inner native control | Input (documented), SearchBox, DropdownMenuSearch, CodeDigitInput | SearchBox.tsx:25 `<div` … :35 `className` … :66 `ref={ref}` … :72 `{...props}`; CodeDigitInput.tsx:57 `className,` … :75 `ref={ref}` … :90 `{...props}` |
    | className → outer layout div; ref/style/rest → the Radix Root inside | SliderContinuous, SliderStepped, SliderLabeled | Slider.tsx:310 `className,` (outer div) … :313-314 `<SliderPrimitive.Root ref={ref}` … :331 `...style,`; :445 `<div className={cn('flex w-full flex-col gap-xxs', className)}>` :446 `<SliderBase ref={ref} showSteps={stepped} {...props} />` |
    | className → inner List; ref/style/rest → the Radix Root outside | SegmentedTabSelect | SegmentedTabSelect.tsx:61 `<TabsPrimitive.Root ref={ref} {...props}>` … :69 `className` (on TabsList) |
    | className → outer frame; ref/style/rest → inner interactive element | OutlineButton | OutlineButton.tsx:150 `className,` (frame div) … :155 `ref={composedRef as ForwardedRef<HTMLElement>}` … :171 `{...props}` |
    Input.tsx:8-9          `className` always lands on the chrome element; every other prop, and `ref`, always land on the `<input>`.
    OutlineButton.tsx:169  onMouseMove={handleMouseMove}
    OutlineButton.tsx:170  onMouseLeave={handleMouseLeave}
    OutlineButton.tsx:171  {...props}          ← onMouseMove/onMouseLeave are not destructured (:73-83), so a consumer value wins
    (cf.) CopyButton.tsx:35,52  destructures `onClick` and calls it inside its own handler
- impact: A consumer's `className="w-60"` and `style={{ width: 240 }}` size different boxes, and which box each hits depends on the component: on SearchBox/DropdownMenuSearch `style` sizes the bare input, not the field; on the stepped Slider it shrinks the Root inside the padded wrapper, bypassing the inset the fills depend on; on SegmentedTabSelect it hits the Root while the visible shell is the List; on OutlineButton `className="w-full"` stretches the ring but not the button. Each split is a reasonable chrome/core choice, and Input states its own, but the other eight say nothing in JSDoc, header or skill, so neither a consumer nor the next agent can tell deliberate from accidental, and copying Button, Input or SegmentedTabSelect teaches three different rules. Separately, adding analytics or a hover handler (`onMouseMove={track}`) to OutlineButton silently disables the glow tracking: the orbs stay at the CSS centre fallback and never move, and a consumer `onMouseLeave` stops the drift-back reset; CopyButton in the same family chains the consumer's `onClick` instead.
- recommendation: Document the `className` target per component, Input-style, in each undocumented component's JSDoc (or its existing header) and in the codebase skill; the rulebook-level convention for chrome + core components is decision D-17. In OutlineButton, destructure `onMouseMove`/`onMouseLeave` and call the consumer's handler from the internal one.
- breaking: none
- contract: src/components/Input/Input.tsx:8-9 "`className` always lands on the chrome element; every other prop, and `ref`, always land on the `<input>`." → consistent (Input is the reference); src/components/Menu/DropdownMenuSearch.tsx:10-13 (constraints: opt-in mount; typography on the input) → consistent (a behavior line is added, nothing constrained changes); src/components/VerificationCode/CodeDigitInput.tsx:11-12 "Prefer composing through VerificationCodeInput" → consistent
- remediation: [WI-087, WI-088] + decision D-17 (rule text for the convention)
- related: [F-029, F-082, F-039]

### F-069: There are two competing ways to widen a menu to the complex width, and the stories hardcode 324 beside the token the search row uses
- severity: S3
- category: inconsistency
- rules: [R8.1]
- scope: internal
- confidence: confirmed
- verified_by: "U5: read DropdownMenu.stories.tsx in full, codebase SKILL.md:535, arch SKILL.md:159, tokens.css:563. V8 (CONFIRMED S3): `grep -rn \"ds-min-w-menu-complex\" src` → only DropdownMenuSearch.tsx:54; stories :224, :407, :436 all `<DropdownMenuSection width={324}>`; DropdownMenu.tsx:395 writes the width inline, and an explicit width beats flex-col stretch, so raising the token leaves the results section narrower than the search row in ComplexWithSearch. Correction applied: R9.13 is about variant consts; the hardcoded-324 point rests on R8.1."
- locations:
  - .agents/skills/dooph-ds-codebase/SKILL.md:535
  - .agents/skills/dooph-ds-architecture/SKILL.md:159
  - src/components/Menu/DropdownMenu.stories.tsx:221-224
  - src/components/Menu/DropdownMenu.stories.tsx:407
  - src/components/Menu/DropdownMenu.stories.tsx:434-436
  - src/components/Menu/DropdownMenuSearch.tsx:54
  - src/components/Menu/DropdownMenu.tsx:386
  - src/components/Menu/DropdownMenu.tsx:395
  - src/styles/tokens.css:563
  - src/styles/tokens.css:568
- evidence: |
    codebase SKILL.md:535  - `ds-min-w-menu-complex` — `min-width: var(--ui-min-w-menu-complex)` (324px); apply directly to a wide `DropdownMenuSection`
    arch SKILL.md:159      … `DropdownMenuSection width` is the explicit override for a wider ("complex") menu. …
    DropdownMenu.tsx:386   width?: string | number;
    DropdownMenu.tsx:395   style={width === undefined ? style : { ...style, width }}
    stories:434            <DropdownMenuSearch />
    stories:436            <DropdownMenuSection width={324}>
    DropdownMenuSearch.tsx:54  "flex ds-min-w-menu-complex items-center gap-xs",
    tokens.css:563         --ui-min-w-menu-complex: 324px;
    tokens.css:568         --ui-min-w-search-box: var(--ui-min-w-menu-complex);
- impact: One internal skill says to put the token-backed `ds-min-w-menu-complex` class on the section, the other says to use the `width` prop, and every story uses the prop with the literal 324, so an agent copying a story duplicates a value a token already holds. In `ComplexWithSearch` the two mechanisms already sit side by side: the search row floors at `--ui-min-w-menu-complex` while the section below is pinned at 324px, so a consumer who retunes the token (the theming skill invites it) gets a search row wider than its results. `width` itself is a legitimate prop for bespoke widths, which is why this is S3.
- recommendation: Sanction one mechanism and state it identically in both skills: a section's width always comes through the `width` prop, and the complex width is the token passed through it (`width="var(--ui-min-w-menu-complex)"` — a fixed width, so long items keep wrapping exactly as with `324`, and a token retune moves the section and the search row together); `ds-min-w-menu-complex` stays the search row's floor and is not advertised for sections, because as a min-width it would let long items widen the menu. The two Complex stories pass the token, and the width-override story uses a bespoke, non-token number.
- breaking: none
- contract: src/components/Menu/DropdownMenu.tsx:11 "Items hold the 160px width floor; sections and the panel hug." → consistent (no component change; `width` remains the section's explicit override, now fed the token); src/components/Menu/DropdownMenuSearch.tsx:11 "Do not mount this inside DropdownMenuContent by default — consumers opt in." → consistent
- remediation: [WI-024]
- related: [F-017, F-094, F-082]

### F-079: RollChangeText and FadeChangeText are line-for-line copies of one render shell apart from two class strings
- severity: S3
- category: duplication
- rules: []
- scope: internal
- confidence: plausible: S3 outside the 29% Phase-4 sample; facts re-checked by U3 (file diff) and by C5 (`diff RollChangeText.tsx FadeChangeText.tsx` @ b436647)
- verified_by: "U3: diff of the two files from `\"use client\"` down. C5: `diff` @ b436647 → the bodies differ only in the component/props names, one JSDoc example, one prop-comment wording, `ds-roll-change-{out,in}` vs `ds-fade-change-{out,in}` (Roll :76/:86 vs Fade :80/:90), and a two-line will-change comment present only in RollChangeText (:88-89)."
- locations:
  - src/components/AnimatedText/RollChangeText.tsx:46-97
  - src/components/AnimatedText/FadeChangeText.tsx:50-99
  - src/components/AnimatedText/useChangeSwap.ts:11-14
- evidence: |
    RollChangeText.tsx:58   const { exiting, entering } = useChangeSwap(changeKey, children);
    FadeChangeText.tsx:62   const { exiting, entering } = useChangeSwap(changeKey, children);
    RollChangeText.tsx:63   className={cn("inline-grid overflow-hidden", className)}
    FadeChangeText.tsx:67   className={cn("inline-grid overflow-hidden", className)}
    RollChangeText.tsx:66   "--ds-roll-dir": direction === RollDirection.up ? -1 : 1,
    FadeChangeText.tsx:70   "--ds-roll-dir": direction === RollDirection.up ? -1 : 1,
    RollChangeText.tsx:76   className="[grid-area:1/1] ds-roll-change-out"
    FadeChangeText.tsx:80   className="[grid-area:1/1] ds-fade-change-out"
    RollChangeText.tsx:88-89  /* Drops the class once the roll lands, so `will-change` does not strand a compositor layer on every settled node. */   (absent from Fade)
    useChangeSwap.ts:13-14  The wrapper renders both in one grid cell and spreads these onto its two spans.
- impact: The engine was extracted into `useChangeSwap` precisely because "two copies drift" (RollChangeText.tsx:16-18), but the structural shell around it — the grid cell, overflow clip, signed `--ds-roll-dir`, the keyed `aria-hidden` exit span, the style merge and the `onAnimationEnd` wiring — is still duplicated, and drift has begun (the will-change comment exists in one copy only). Any accessibility or layout fix to the shell (for example the exit span's `aria-hidden`, or a style-precedence change) has to be made twice, and a third on-change wrapper would copy it again. Both headers claim the file "owns only the look", which is true of the engine but not of the shell.
- recommendation: Move the shell into one internal, non-exported render component in the AnimatedText folder that takes the out/in class pair and renders the grid, the exit span and the entering span from `useChangeSwap`; reduce each wrapper to its props, its class pair and its header. The public components, their props and the rendered DOM stay identical.
- breaking: none
- contract: src/components/AnimatedText/RollChangeText.tsx:15-18 "The swap engine lives in `useChangeSwap` … Do not re-inline it here … This file owns only the roll's look." → consistent (the change moves more out of the wrapper, not back in); src/components/AnimatedText/FadeChangeText.tsx (constraints: no blur; opacity keeps its own keyframe offsets; no duration here) → consistent (class names and keyframes unchanged); src/components/AnimatedText/useChangeSwap.ts:11-14 (behavior: "The wrapper renders both in one grid cell") → consistent if that bullet is updated in the same change to name the shared shell (R10.4); its constraints (no duration/timer, render-phase reconcile, keyed exit, independent retirement, target guard) are untouched
- remediation: [WI-031]
- related: [F-044]

### F-081: SplitButtonAction/Trigger rebuild the secondary Button look by hand and have drifted from it
- severity: S3
- category: duplication
- rules: []
- scope: internal
- confidence: plausible: S3 outside the 29% Phase-4 sample; facts re-checked by U4 (side-by-side read, `rg -n buttonVariants src`) and C5 (SplitButton.tsx, Button.tsx, tokens.css read @ b436647)
- verified_by: "U4: `rg -n buttonVariants src` → reused by Toast.tsx:17,147,165,186, not by SplitButton; side-by-side read of SplitButton.tsx:18-28,50-60 vs Button.tsx:55-59. C5: re-read @ b436647; tokens.css:36 `--ui-color-secondary-border: #e2e3e4` vs :124 `--ui-color-border-primary: #dddddd` — the two parts paint a different border token from the secondary Button."
- locations:
  - src/components/SplitButton/SplitButton.tsx:17-30
  - src/components/SplitButton/SplitButton.tsx:50-61
  - src/components/Button/Button.tsx:55-59
  - src/components/Toast/Toast.tsx:17
  - src/styles/tokens.css:36
  - src/styles/tokens.css:124
- evidence: |
    SplitButton.tsx:21  "border border-solid border-border-primary border-r-0",
    SplitButton.tsx:22  "bg-secondary text-secondary-fg",
    SplitButton.tsx:24  "transition-all duration-100",
    SplitButton.tsx:25  "hover:enabled:bg-secondary-hover",
    SplitButton.tsx:28  "ds-disabled-state disabled:border-secondary-border-disabled",
    SplitButton.tsx:53  "border border-solid border-border-primary",     (Trigger: same classes again, :51-59)
    Button.tsx:56       "bg-secondary text-secondary-fg border-secondary-border shadow-button-secondary",
    Button.tsx:57       "[&:not(:disabled):not([aria-disabled=true])]:hover:bg-secondary-hover [&:not(:disabled):not([aria-disabled=true])]:hover:border-secondary-border-hover …",
    Button.tsx:59       "disabled:bg-secondary-disabled disabled:border-secondary-border-disabled aria-disabled:bg-secondary-disabled aria-disabled:border-secondary-border-disabled",
    Toast.tsx:17        import { ButtonSize, ButtonVariant, buttonVariants } from "../Button";
- impact: The two copies already disagree with the secondary Button on the border token (`border-primary` #dddddd vs `secondary-border` #e2e3e4), the hover border (Button changes it, the parts do not), the transition (100ms vs 150ms), the disabled fill (Button paints `bg-secondary-disabled`, the parts only the border) and `aria-disabled` handling (F-026). A SplitButton beside a secondary Button renders two different "secondary" buttons, and a retune of `--ui-color-secondary-border` or of the secondary hover/disabled tokens misses SplitButton. Toast shows the reuse path already exists (`buttonVariants`), and the parts are also where F-041's naming fix lands.
- recommendation: Compose both parts from `buttonVariants({ variant: ButtonVariant.secondary, size })` plus only the split-specific classes (one-sided radii, the shared inner border, the action's icon slot), so the secondary look, its state guards and its tokens come from one recipe; drop the hand-written state classes.
- breaking: none
- contract: src/components/Button/Button.tsx:7-9 "Disabled styling paints each variant's own explicit disabled bg/border tokens … plus `ds-disabled-state` opacity" → consistent (reusing the recipe brings that behaviour to the parts; Button.tsx itself is unchanged)
- remediation: [WI-084]
- related: [F-041, F-092, F-026, F-016, F-017, F-087]

### F-082: SearchBox and DropdownMenuSearch are parallel implementations of one search row, and the family draws its search glyph three different ways
- severity: S3
- category: duplication
- rules: []
- scope: internal
- confidence: plausible: S3 outside the 29% Phase-4 sample; facts re-checked by U5 (both files read in full) and C5 (both files plus SearchIcon.tsx and BaseIcon.tsx re-read @ b436647)
- verified_by: "U5: read SearchBox.tsx and DropdownMenuSearch.tsx in full; SearchIcon.tsx:5-6 (`<circle cx=\"11\" cy=\"11\" r=\"7\" />`, 24-unit BaseIcon); BaseIcon default `size = IconSizes.rg`. C5: re-read @ b436647 — SearchBox.tsx:39-62 hand-draws a 16-unit glyph (`r=\"4.25\"`), DropdownMenuSearch.tsx:59-60 uses `SearchIcon size={IconSize.md}`, DropdownTrigger.tsx:250 uses `SearchIcon` at the default size."
- locations:
  - src/components/SearchBox/SearchBox.tsx:7-12
  - src/components/SearchBox/SearchBox.tsx:23
  - src/components/SearchBox/SearchBox.tsx:39-62
  - src/components/SearchBox/SearchBox.tsx:65-78
  - src/components/Menu/DropdownMenuSearch.tsx:26-32
  - src/components/Menu/DropdownMenuSearch.tsx:36-42
  - src/components/Menu/DropdownMenuSearch.tsx:59-79
  - src/components/DropdownTrigger/DropdownTrigger.tsx:250
  - src/components/Icons/SearchIcon.tsx:5-6
- evidence: |
    SearchBox.tsx:9-11        shortcut?: string[]; /** Whether the hotkey indicator is shown. Defaults to true when shortcut is provided. */ showShortcut?: boolean;
    DropdownMenuSearch.tsx:29-31  shortcut?: string[]; /** Whether the hotkey indicator is shown. Defaults to true when shortcut is set. */ showShortcut?: boolean;
    SearchBox.tsx:23          ({ className, shortcut, showShortcut = !!shortcut, placeholder = 'Search', ...props }, ref) => {
    DropdownMenuSearch.tsx:38-40  shortcut = ["Esc"], / showShortcut = true, / placeholder = "Search",
    SearchBox.tsx:39-42       <svg width="16" height="16" viewBox="0 0 16 16" …>     SearchBox.tsx:51  r="4.25"
    SearchIcon.tsx:5          <circle cx="11" cy="11" r="7" />
    DropdownMenuSearch.tsx:59-60  <SearchIcon size={IconSize.md}
    DropdownTrigger.tsx:250   <SearchIcon className={cn(disabled && "ds-opacity-disabled")} />
    SearchBox.tsx:69-70 / DropdownMenuSearch.tsx:69-70   identical input classes: "…min-w-0 … bg-transparent outline-none", "text-style-button text-text placeholder:text-text-tertiary"
- impact: Both components are "search icon + transparent native input with the same classes + optional `HotkeyIndicator`", both send `className` to the wrapper and `ref`/rest to the input, and both expose `shortcut`/`showShortcut`, but they are maintained separately: a fix to one — the disabled treatment SearchBox lacks (F-026), the keyboard reachability of the menu search (F-094), the hotkey styling (F-088) — will not reach the other. SearchBox also hand-draws a search glyph with different geometry from the `SearchIcon` the other two search-style controls use, so a change to the DS search glyph silently misses it. The intended difference (no bordered chrome in the menu, DropdownMenuSearch.tsx:5-6) does not require two implementations of the inner row.
- recommendation: Render `SearchIcon` in SearchBox, write the two `showShortcut` defaults the same way, and add a one-line cross-reference in each file naming its twin so a fix to the shared row is applied to both. Folding both into one internal row component is optional and only worth it if a third search control appears.
- breaking: none
- contract: src/components/Menu/DropdownMenuSearch.tsx:5-6 "no bordered chrome (unlike SearchBox)" and :11-13 (opt-in mount; typography via `text-style-button` on the input) → consistent (the chrome difference and the input typography are kept)
- remediation: [WI-089]
- related: [F-026, F-088, F-094, F-062]

### F-088: DropdownMenuSearch restyles HotkeyIndicator's internal `<kbd>` markup through five descendant overrides
- severity: S3
- category: coupling
- rules: []
- scope: internal
- confidence: confirmed
- verified_by: "U5: dist-styles.css:2169-2182 emits `.\[\&_kbd\]\:h-6 kbd {…}` etc.; HotkeyIndicator.tsx:13-26 renders the `<kbd>` elements with their own classes. V8 (CONFIRMED S3, low end): `grep -rn \"\[&_\" src --include=*.tsx | grep -v stories | wc -l` → 1 (the only descendant-variant site in src); the five emitted rules have specificity 0,1,1 and beat the kbd's own 0,1,0 classes; SearchBox.tsx:77 uses HotkeyIndicator plain; HotkeyIndicator has no header warning that its markup is depended on. Side note: `h-6`/`min-h-6` resolve to Tailwind's numeric `calc(var(--spacing) * 6)`, not a DS token."
- locations:
  - src/components/Menu/DropdownMenuSearch.tsx:75-78
  - src/components/HotkeyIndicator/HotkeyIndicator.tsx:4-7
  - src/components/HotkeyIndicator/HotkeyIndicator.tsx:13-25
- evidence: |
    DropdownMenuSearch.tsx:77  className="shrink-0 [&_kbd]:h-6 [&_kbd]:min-h-6 [&_kbd]:bg-secondary-hover [&_kbd]:border-secondary-border-hover [&_kbd]:text-text-tertiary"
    HotkeyIndicator.tsx:13     <kbd
    HotkeyIndicator.tsx:18       'text-style-label text-ghost-fg',
    HotkeyIndicator.tsx:21       keys.length === 1 && 'min-w-[23px] min-h-[23px]',
    HotkeyIndicator.tsx:22-24    pressed ? 'bg-ghost-active border-border-primary' : 'bg-surface-page border-border-primary'
- impact: The in-menu look of the hotkey chip is a second visual variant of HotkeyIndicator that exists only as selectors in a sibling component, keyed on HotkeyIndicator's internal tag. If HotkeyIndicator changes its element (`kbd` → `span`), its sizing classes or their specificity, the menu search silently reverts to the default look, and nothing in HotkeyIndicator.tsx points at the dependency. A consumer who wants the in-menu look elsewhere must copy five arbitrary variants, and the override also bypasses the token scale (`h-6`).
- recommendation: Give HotkeyIndicator a dot-accessible variant for the menu-surface look (a `variant` prop backed by a `HotkeyIndicatorVariant` const in a server-safe `constants.ts`), render it from HotkeyIndicator's own classes, and use it from DropdownMenuSearch in place of the descendant overrides. Replacing the numeric `h-6` with a token is F-017's job (no 24px height token exists today).
- breaking: none
- contract: src/components/Menu/DropdownMenuSearch.tsx:10-13 (opt-in mount; typography on the input) → consistent
- remediation: [WI-090]
- related: [F-082, F-017]

### F-092: The SplitButton composite cannot host a menu trigger, and the only worked dropdown example re-assembles the parts without the composite's group chrome
- severity: S3
- category: api-design
- rules: []
- scope: consumer-visible
- confidence: confirmed
- verified_by: "U4: read SplitButton.tsx:71-96 and SplitButton.stories.tsx:51-69. V8 (CONFIRMED S3): no `DropdownMenuAnchor` part exists to position a menu off a composite-rendered trigger; the composite is a plain function with no ref, no rest spread and no trigger slot, so neither the trigger nor the whole composite can sit under `DropdownMenuTrigger asChild`; `WithDropdown` hand-assembles `<div className=\"inline-flex\">` without `rounded-tight shadow-button` (tokens.css:548 `--ui-shadow-button: 0 1px 2px rgba(0,0,0,0.1)`, visible). Correction applied: the only documentation of the pattern is the story; no skill describes it."
- locations:
  - src/components/SplitButton/SplitButton.tsx:71-96
  - src/components/SplitButton/SplitButton.stories.tsx:51-69
  - .agents/skills/dooph-ds-codebase/SKILL.md:124-126
  - skills/dooph-design-system-usage/SKILL.md:112
- evidence: |
    SplitButton.tsx:71-78  export interface SplitButtonProps { actionProps?; triggerProps?; icon?; children?; className?; disabled? }
    SplitButton.tsx:89     <div className={cn("inline-flex rounded-tight shadow-button", className)}>
    SplitButton.tsx:93       <SplitButtonTrigger disabled={disabled} {...triggerProps} />
    SplitButton.stories.tsx:54  <div className="inline-flex">
    SplitButton.stories.tsx:56    <DropdownMenuTrigger asChild>
    SplitButton.stories.tsx:57      <SplitButtonTrigger />
- impact: A split button exists to open a menu, but the composite renders its trigger internally, so the only ways to attach a `DropdownMenu` are `triggerProps.onClick` plus a hand-managed popover, or abandoning the composite. The story does the latter, and its hand-written wrapper omits the composite's `rounded-tight shadow-button`, so the "with dropdown" form renders without the group shadow the default form has; consumers copying the story inherit the divergence, and the next chrome change to the composite will miss every hand-assembled copy.
- recommendation: Export the group wrapper as a part (`SplitButtonGroup`: a ref-forwarding div carrying `inline-flex rounded-tight shadow-button` with className merge and rest spread), render the composite through it, and rewrite the dropdown story as `SplitButtonGroup` + `SplitButtonAction` + `DropdownMenuTrigger asChild` around `SplitButtonTrigger`, so the hand-assembled form keeps the composite's chrome by construction. List the new part in the usage and codebase skills.
- breaking: none
- contract: n/a
- remediation: [WI-085]
- related: [F-081, F-041]

### F-093: CTAButton accepts `children` in every mode but discards them unless `asChild` is set
- severity: S3
- category: api-design
- rules: []
- scope: consumer-visible
- confidence: confirmed
- verified_by: "U4: read CTAButton.tsx:44 (children typed unconditionally), :60 (destructured), :127-130 (anchor branch renders `{content}` only). V8 (CONFIRMED S3): `grep -rn \"<CTAButton\" src` → only stories; no dev warning anywhere; :115-119 already throws for a bad asChild child. C5 (scratch/C5/tsc, overloaded public signature on a copy of CTAButton.tsx): `<CTAButton text icon>Limited offer</CTAButton>` compiles today and errors with the overloads, while href, asChild-with-element, a runtime-boolean `asChild` with an element child, a ref, and a consumer `interface X extends CTAButtonProps` all still compile (fixed.out.txt: 0 errors)."
- locations:
  - src/components/CTAButton/CTAButton.tsx:30-45
  - src/components/CTAButton/CTAButton.tsx:60
  - src/components/CTAButton/CTAButton.tsx:114-125
  - src/components/CTAButton/CTAButton.tsx:127-130
  - src/components/CTAButton/CTAButton.stories.tsx:79-81
- evidence: |
    CTAButton.tsx:30-31  export interface CTAButtonProps
                           extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children"> {
    CTAButton.tsx:44       children?: ReactNode;          (no JSDoc)
    CTAButton.tsx:114    if (asChild) {
    CTAButton.tsx:122        {cloneElement(children as ReactElement, undefined, content)}
    CTAButton.tsx:127    <a ref={ref} className={rootClassName} {...props}>
    CTAButton.tsx:128      {content}
- impact: `<CTAButton text="Buy" icon={i}>Limited offer</CTAButton>` type-checks and renders without "Limited offer", with no warning; the interface re-adds `children` (after omitting the anchor's own) with no comment, and the contract — children are only the element to slot onto — appears only in the `asChild` JSDoc (:38-42). The file already refuses a bad `asChild` child with a throw (:115-119), so silently ignoring an explicit input in the other mode is inconsistent within the same component.
- recommendation: Document `children` on the props interface, and give the exported component overloaded call signatures (the cast pattern Button already uses) so `children` type-checks only together with `asChild` and must then be an element; keep `CTAButtonProps` an interface so consumer `extends` keeps working, and leave runtime behaviour and the ref type (F-089) unchanged.
- breaking: minor
- contract: n/a
- remediation: [WI-091]
- related: [F-089, F-003]
- note-to-orchestrator: map `breaking` is `none`; the recommended overloads stop compiling only call sites whose children are discarded at runtime, so this block records `minor` (type-only), matching how F-002 is treated.

### F-094: DropdownMenuSearch is unreachable by keyboard inside the menu, and unlike DropdownMenuPlainItem this limitation is undocumented
- severity: S3
- category: api-design
- rules: []
- scope: consumer-visible
- confidence: plausible: S3 outside the 29% Phase-4 sample; facts re-checked by U5 (Radix source read) and C5 (@radix-ui/react-menu 2.1.24 dist/index.mjs:313-318 and the DropdownMenuSearch/PlainItem sources re-read @ b436647)
- verified_by: "U5: read @radix-ui/react-menu 2.1.24 dist/index.mjs:309-318 in the built copy — inside content `if (event.key === \"Tab\") event.preventDefault();` and arrow navigation runs only when `event.target` is the content node or a roving item; the search `<input>` is neither. C5: re-read the same lines (313 Tab, 318 FIRST_LAST_KEYS guard) and DropdownMenuSearch.tsx:46-49 — the input's own keydown stops propagation, so neither ArrowDown nor Tab from the input reaches Radix; `grep DropdownMenuSearch skills/ .agents/skills/` → no mention of the limitation (only a width-token line, codebase SKILL.md:457)."
- locations:
  - src/components/Menu/DropdownMenuSearch.tsx:4-8
  - src/components/Menu/DropdownMenuSearch.tsx:46-49
  - src/components/Menu/DropdownMenu.tsx:223-232
  - src/components/Menu/DropdownMenu.stories.tsx:433-434
- evidence: |
    DropdownMenuSearch.tsx:7   * - Forwards ref to the input. Stops keydown propagation so Radix typeahead
    DropdownMenuSearch.tsx:8   *   does not steal keystrokes while typing.
    DropdownMenuSearch.tsx:47  event.stopPropagation();
    DropdownMenu.tsx:226-231   … interactive children (e.g. a ToggleSwitch) are pointer-only inside a Radix menu: Radix's roving focus skips this plain div, Tab is prevented by the menu content, arrow keys are only handled when the content itself is the target … Consumers must provide a keyboard-reachable equivalent …
    DropdownMenu.stories.tsx:433  <DropdownMenuContent matchTriggerWidth={false} focusOnOpen={false}>
    DropdownMenu.stories.tsx:434  <DropdownMenuSearch />
    react-menu 2.1.24 dist/index.mjs:313  if (event.key === "Tab") event.preventDefault();
- impact: With `focusOnOpen` (default true) focus lands on the menu content, where Radix swallows Tab, and the input is not in the roving group, so a keyboard user cannot focus the search; if the input is focused another way, ArrowDown from it does not move into the results because its keydown never reaches Radix. The `stopPropagation` is on the DS's own input, not a Radix handler, so it is not an R2.10 breach; it only fixes typeahead. DropdownMenuPlainItem documents exactly this class of limitation and tells consumers to provide a keyboard-reachable equivalent; DropdownMenuSearch's header, JSDoc and the skills do not, so a consumer shipping the `ComplexWithSearch` composition ships a search that keyboard users cannot use, and an agent cannot tell that from the docs.
- recommendation: Document the limitation where PlainItem documents its own — a header behavior bullet and the component's JSDoc (which ships in the d.ts) naming the keyboard-reachable alternatives (filter from the trigger, e.g. `TypeableDropdownTrigger`, or a search outside the menu) — and note it on the `ComplexWithSearch` story. A real keyboard path (focus management between the input and Radix's roving items, or a combobox) is a design change that R2.10/R2.11 constrain and is not part of this fix.
- breaking: none
- contract: src/components/Menu/DropdownMenuSearch.tsx:11 "Do not mount this inside DropdownMenuContent by default — consumers opt in." and :12-13 (typography on the input) → consistent (documentation only; the behavior section gains one bullet); src/components/Menu/DropdownMenu.tsx:19-20 (no hardcoded search; data-attribute styling) → consistent (file not changed)
- remediation: [WI-092]
- related: [F-082, F-099, F-069]

## DONE
