# Claim check, batch 6: the consumer usage skill and the Text props-only decision

Checker: fresh, read-only. I checked the working tree on 2026-10-11, on `main` with uncommitted changes.

Read-only commands run:
- `node scripts/generate-docs.mjs --check` exited 0 ("generated doc references are fresh").
- `node scripts/sync-skills.mjs --check` exited 0 ("9 skills x 2 mirrors").
- I ran the verification grep from SKILL.md:67 against two scratch files. The compliant file used every class from patterns.md. The violating file had 19 forbidden forms. Results: 0 hits on the compliant file, 19 of 19 caught on the violating file. `style={{ fontSize }}`, `text-indigo-500` and a bare `"#333"` slipped past, as SKILL.md:69 says they would.
- I checked Tailwind 4.3.3 `dist/lib.js`: `max-w` resolves `["--max-width","--spacing","--container"]`, so spacing beats container.

## Summary

| Doc | Claims | TRUE | FALSE | UNVERIFIABLE |
|---|---|---|---|---|
| `skills/dooph-design-system-usage/SKILL.md` | 42 | 39 | 3 | 0 |
| `skills/dooph-design-system-usage/references/patterns.md` | 39 | 38 | 1 | 0 |
| `skills/dooph-design-system-usage/references/responsive-sheet-modal.md` | 17 | 17 | 0 | 0 |
| `skills/dooph-design-system-usage/references/components.md` (generated; spot-check of 8 rows) | 8 | 8 | 0 | 0 |
| Props-only cross-check: `src/components/Text/BaseText.tsx` JSDoc, `BaseText.stories.tsx` notes, `src/styles/index.css` role-layer comments | 13 | 9 | 4 | 0 |
| **Total** | **119** | **111** | **8** | **0** |

Four of the eight FALSE items are wording. They say props "always win" or "beat everything", when `style` beats them. The other four would steer an agent wrong:
- SKILL.md:18 (the loophole around responsive type)
- SKILL.md:26 (where className lands)
- patterns.md:107 (CTAButton's `asChild`)
- BaseText.stories.tsx:394 / index.css:271 (className or text-style classes as a typography path)

## FALSE

### 1. SKILL.md:17: props "always win"
- **Claim:** "Props are inline, so they always win, and the consts keep sizes on the token scale."
- **Evidence:** `src/components/Text/BaseText.tsx:107-111` spreads `style` after the props' typography (`{ ...typography, ...style }`). `BaseText.stories.tsx:314-317` ("style beats props") demonstrates it. SKILL.md:26 itself says "your `style` wins". This matches the maintainer decision that the consumer's `style` merges last and wins.
- **Fix:** "Props are inline, so they beat every class (only `style` outranks them), and the consts keep sizes on the token scale."

### 2. SKILL.md:18: props "can't change per breakpoint"
- **Claim:** "Text components take props only, and props can't change per breakpoint."
- **Evidence:** every typography prop also takes a raw CSS string, and the string passes through unchanged:
  - the types at `src/components/Text/constants.ts:142-150`, e.g. `FontSizeValue = FontSize | (string & {}) | number`
  - `src/utils/length.ts:1-3`: "strings ... pass through"
  - `textStyle.ts:94`

  So `fontSize="clamp(1rem, 4vw, 3rem)"` resizes with the viewport. So does `fontSize="var(--app-title)"` with `--app-title` redefined in an app media query. The rule's conclusion (no responsive type) matches the maintainer decision. Its stated reason is false, though, and the gap it leaves is exactly the workaround the rule is meant to stop.
- **Fix:** "Text components take props only, and a prop holds one value with no per-breakpoint form. Don't work around it with className utilities, duplicated hidden copies, JS width checks, or a `clamp()`, `vw` or media-query-driven `var()` passed as a prop."

### 3. SKILL.md:26: components.md says where className lands
- **Claim:** "When `className` lands off the root, components.md says where."
- **Evidence:** components.md shows only the first sentence of a component's JSDoc (components.md:11). Input and the three Sliders now open with the placement sentence, but five components with the same split do not, so their components.md entries say nothing about it:
  - `SearchBox`: placement at `SearchBox.tsx:19`, fifth sentence. components.md:1400 shows only "A search input field styled per the design system."
  - `OutlineButton`: placement at `OutlineButton.tsx:62-63`, a later paragraph. components.md shows only "An outlined pill-shaped button with an inner elevated surface."
  - `DropdownMenuSearch`: placement in the file header at `DropdownMenuSearch.tsx:10-11`. components.md:1086 shows "Slim search row…".
  - `CodeDigitInput`: placement in the file header at `CodeDigitInput.tsx:13-14`. components.md:2366 has no description at all.
  - `DatePicker`: `className` goes on the split container (`DatePicker.tsx:120`). components.md:678 has no description.

  In each of these, `ref`, `style` and the other props go to an inner element while `className` styles the outer one.
- **Fix:** move each placement sentence to the start of the component's JSDoc (above the `forwardRef`), the way Input, Slider* and SegmentedTabSelect do, and regenerate components.md. Otherwise, weaken the skill to "components.md says where for Input, Slider*, SegmentedTabSelect; SearchBox, OutlineButton, DropdownMenuSearch, CodeDigitInput and DatePicker split it too (see their source)".

### 4. patterns.md:107: CTAButton "the same way"
- **Claim:** "`CTAButton`, `ShapeButton`, `DropdownTrigger` and `TextDropdownTrigger` take `asChild` the same way."
- **Evidence:** CTAButton's `asChild` is not the Button pattern above it.
  - It requires `text` and `icon` (`CTAButton.tsx:77-80`).
  - It clones the child with the CTA content as its children: `cloneElement(children, undefined, content)` at `CTAButton.tsx:215-218`.
  - Its JSDoc says to leave the Link empty (`CTAButton.tsx:84-88`, 90-93).

  If you copy the Button example (`<CTAButton asChild><Link href="/pricing">See pricing</Link></CTAButton>`), it fails to type-check, because `text`/`icon` are missing. Once you add them, "See pricing" is silently replaced. ShapeButton, DropdownTrigger and TextDropdownTrigger do match (`Slottable child={children}` at ShapeButton.tsx:148, DropdownTrigger.tsx:78 and :331).
- **Fix:** "`ShapeButton`, `DropdownTrigger` and `TextDropdownTrigger` take `asChild` the same way. `CTAButton` takes it too but supplies its own content: pass `text` and `icon` and leave the child empty (`<CTAButton asChild text="See pricing" icon={…}><Link href="/pricing" /></CTAButton>`)."

### 5. BaseText.tsx:56-58 (JSDoc): props "beat everything"
- **Claim:** "1. props — written as inline style, so they beat everything"
- **Evidence:** the same JSDoc says at :66-67 "`style` still outranks props", and the code agrees (`BaseText.tsx:107-111`). The two lines contradict each other.
- **Fix:** "1. props — written as inline style, so they beat every class (only the `style` prop outranks them)".

### 6. BaseText.stories.tsx:34: props "always win"
- **Claim:** "Typography comes from **props** (written inline, so they always win) over the **role class**"
- **Evidence:** the story file's own Precedence note at :303 says "a style prop still beats both". The row at :314-317 shows `style` beating `fontSize`.
- **Fix:** "(written inline, so they beat the role class; only `style` outranks them)".

### 7. BaseText.stories.tsx:394: className as a typography path
- **Claim:** "Drops the role class entirely — no family, size, weight, tracking or axes. Props and className still apply, so it is the starting point for typography the system does not describe."
- **Evidence:** the sentence makes className a way to set typography on an `unstyled` text. That contradicts:
  - the props-only decision
  - the edited `unstyled` JSDoc at BaseText.tsx:17 ("style from props alone")
  - BaseText.tsx:64-66 ("`className` carries colour and layout, never typography")

  This is the old precedence claim (prop > className > role) coming back; see the old-register section below.
- **Fix:** "Drops the role class entirely — no family, size, weight, tracking or axes. Props still apply, so props alone set typography the system does not describe; className still carries colour and layout."

### 8. index.css:270-272: consumers applying `.text-style-*` directly
- **Claim:** "they are spelled out rather than composed because a role class has to stand alone for `unstyled` and for consumers applying `.text-style-*` directly."
- **Evidence:** consumers may not apply `.text-style-*`. These sources all say so:
  - SKILL.md:17: "No … `text-style-*`"
  - the SKILL.md:67 grep, which flags `text-style-`
  - BaseText.tsx:53-54: "a `text-style-*` class never appears outside src/components/Text/"
  - the role-layer comment 30 lines above (index.css:237-239): "typography utilities are not a supported override, in DS code or in a consuming app"

  The `unstyled` half of the reason is also wrong: `unstyled` drops the role class (BaseText.tsx:93, `role = unstyled ? undefined : variant`), so no role class is applied there. The real reason a role class must stand alone is that BaseText applies exactly one of them per element.
- **Fix:** "they are spelled out rather than composed because BaseText applies exactly one role class per element, so each must stand alone."

## UNVERIFIABLE

None.

## TRUE

### SKILL.md

| Line | Claim | Evidence |
|---|---|---|
| :8 | DS draws; app owns data, fetching, timers, state | No `fetch(`/`setInterval` in src/components. The timer allowlist (check-conventions.mjs TIMER_ALLOWLIST) holds only presentation timers: CopyButton's 2 s revert and two rAF loops. |
| :10 | Setup skill covers install/imports/fonts/preset; theming skill covers overrides/dark | skills/dooph-design-system-setup/SKILL.md:3; skills/dooph-design-system-theming/SKILL.md:3 |
| :10 | components.md lists every export's props, defaults, consts | components.md:5; `generate-docs --check` fresh |
| :16 | The Text components listed exist; `as` picks the element; `<LabelText as="label" htmlFor>` type-checks | BaseText.tsx:21-27 (polymorphic `as` admits the element's props), :145-182 |
| :16 | A raw `<p>`/`<span>` gets no role tokens | The role class is applied only by BaseText (BaseText.tsx:103) |
| :17 | `fontSize={FontSizes.subheading}`, `fontWeight={FontWeights.semibold}`, `letterSpacing={Tracking.label}`, `lineHeight`, `tabular` | constants.ts FontSizes/FontWeights/Tracking; textStyle.ts:41-62 |
| :17 | Line height is the app's to set | index.css:241-242; no `line-height` in any `.text-style-*` (index.css:248-357) |
| :17 | The preset has `text-body` / `font-label` | theme.css `--text-body`, `--font-label` |
| :17 | Colour classes such as `text-text-secondary` are fine | `--color-text-secondary` in theme; cn keeps text-style and colour in separate groups (cn.ts:39) |
| :17 | The consts keep sizes on the token scale | Every const is a `var(--ui-*)` (constants.ts header) |
| :17 | A class silently loses to a prop | Props are inline style (textStyle.ts:1-9) |
| :17 | `text-sm` is off the scale | No `--text-sm` in the DS theme (index.css:94-103, 138-139) |
| :18 | Responsive type isn't supported | docs/future/responsive-type.md:3 ("Not implemented"); no per-breakpoint prop form |
| :19 | DS controls set their own text role | Button renders through BaseText `variant=buttonTextVariant(size)` (Button.tsx:191-196) |
| :19 | ModalContent, SheetContent, PopoverContent, OutlineSection, TableCell set none | dialogShell.tsx:72-109; Popover.tsx:40-58; OutlineSection.tsx:16-38; Table.tsx:154-166 |
| :20 | The spacing words and `bg-surface-page`, `border-border-primary`, `rounded-tight`, `shadow-menu` exist | index.css @theme lines (`--spacing-*`, `--color-surface-page`, `--color-border-primary`, `--radius-tight`, `--shadow-menu`) |
| :21 | `max-w-md` is 12px | Tailwind 4.3.3 max-w resolves `--spacing` before `--container`; `--ui-spacing-md: 12px` (tokens.css:586); FINDINGS F-015 |
| :22 | Option props take dot consts `ButtonVariant.prominent`, `SheetSide.bottom` | Button/constants.ts:11; Sheet/constants.ts |
| :23 | Controls take `value`+`onValueChange`, Radix `checked`/`onCheckedChange`, `open`/`onOpenChange`, or `defaultValue` | Input.tsx:196-213; Toggle.tsx:12-13; Radix roots |
| :23 | No component fetches or ticks | As at :8. "Tick" here means app time; CopyButton's 2 s revert is presentation only. |
| :24 | The page stays a Server Component and passes serialisable props | Matches the maintainer decision; baseline pricing-rsc-buttons PASS (docs-pass/baseline/SCORES.md:473) |
| :25 | `<Button asChild><Link>`; every Radix trigger takes `asChild`; one child element | Button.tsx:189 (Slot); Modal/Sheet triggers are `DialogPrimitive.Trigger` |
| :26 | A conflicting class replaces the component's (`rounded-full` beats `rounded-tight`) | cn.ts (DS_TW_MERGE_THEME radius scale) |
| :26 | `style` merges last and wins | BaseText.tsx:107-111; Table.tsx:30-36 |
| :32-45 | Every component in the job table is exported | Checked against src/index.ts and the barrels; all present |
| :35 | There is no on/off switch | No Switch export; Toggle/index.ts exports only ToggleSwitch/FancyToggleSwitch (segmented rows) |
| :36 | ToggleSwitch selection never clears | Toggle.tsx:8-11 |
| :39 | Tooltip needs a TooltipProvider ancestor | Radix tooltip creates its context with no default (react-tooltip dist:26-29) and react-context throws "must be used within" |
| :40 | ToastProvider + useToast | Toast.tsx:344-347 |
| :41 | TableHeaderCell sorts with `sortDirection` + `onSort` | Table.tsx:88-110 |
| :45 | AI* parts, ChatDivider, UserMessageHeader; `#8-ai-chat` anchor | AIChat/index.ts; patterns.md:209 |
| :51 | Spacing px values 2…42 | tokens.css:581-590 |
| :53 | Links to patterns.md and responsive-sheet-modal.md | Both files exist |
| :59-60 | Rationalization rows | Consistent with patterns.md 1 and the "use client" decision |
| :67 | The grep prints nothing on compliant code and catches the listed forms | Scratch test: 0 / 19 of 19 |
| :69 | It is partial (inline style, other palettes, most hex slip past) | Scratch test: `style={{fontSize}}`, `text-indigo-500`, `"#333"` not caught |

### patterns.md

| Line | Claim | Evidence |
|---|---|---|
| :3 | Routes are App Router | Descriptive |
| :9-84 | Page and form use real exports and props | Names in src/index.ts; Input/Checkbox/Button props as below |
| :87 | Input puts `id`/`ref`/other props on `<input>`; `className` on the chrome; `onValueChange` gets the raw string | Input.tsx:339-356, 358-377, 293 |
| :88 | Checkbox is Radix, takes `checked`/`onCheckedChange`, draws its own indicator; `id` sits on the box | Checkbox.tsx:126-136 (`children ?? <CheckboxIndicator/>`, props on Root) |
| :89 | A Server Component can't pass functions; a Server Action is the exception | React RSC serialisation; matches the setup skill |
| :90 | A Server Component can render DS components with plain props (TitleText) | Text has no "use client" |
| :107 | `asChild` makes your element the root with the classes, handlers and ref; exactly one child; Link-in-Button nests | Radix Slot (react-slot dist:9-57) |
| :107 | ShapeButton, DropdownTrigger, TextDropdownTrigger take `asChild` the same way | Slottable at ShapeButton.tsx:148, DropdownTrigger.tsx:78, :331 |
| :107 | OutlineButton slots its inner button; `className` stays on the frame div | OutlineButton.tsx:62-63, 90, 145-151 |
| :107 | Radix triggers get `asChild` from Radix | Pass-throughs (Modal.tsx:17, Sheet.tsx:20) |
| :109 | A link-only screen needs no "use client"; Button and TextLink render on the server | No directive in Button.tsx/TextLink.tsx; Slot uses only RSC-safe `useCallback`; baseline pricing-rsc-buttons built a server `<Button asChild><Link>` (SCORES.md:438, 473) |
| :126-145 | Menu example APIs | DropdownMenu.tsx exports; DropdownMenuItemVariant.danger (constants.ts:24-31) |
| :148 | DropdownMenuSection gives the inset | DropdownMenu.tsx:474-481 (`px-sm`) |
| :148 | Non-modal by default; `modal` traps focus | DropdownMenu.tsx:75-83 |
| :148 | RadioGroup + RadioSelectItem; `selectType` multi + MultiSelectItem | DropdownMenu.tsx:111, 329-412 |
| :155 | Table `columns` is a grid-template string | Table.tsx:14-15, 32 |
| :169 | TableHeaderCell sets ButtonText | Table.tsx:107, 121 |
| :169 | TableCell, ModalContent, SheetContent, PopoverContent, OutlineSection set no text role; Modal/Sheet content add no padding | As SKILL:19 |
| :169 | ModalTitle/SheetTitle are HeadingText; descriptions are BodyText | dialogShell.tsx:30-53 |
| :173 | ToastProvider is a client component and can wrap Server Component children | Toast.tsx:1 "use client"; children prop |
| :181 | `useToast()` returns `{ toast }`; `toast({ title })` | Toast.tsx:24-50 |
| :185 | Provider `duration` default 4000; per-toast override; `Infinity` keeps it open | Toast.tsx:223-232, 264, 272 (F-005 fixed) |
| :189 | cn = clsx + tailwind-merge for DS scales and roles; `p-lg` replaces `p-md`; a colour class never erases a role | cn.ts:33-53; twMergeTheme.ts:65-77 (all 11 roles) |
| :199-202 | `extendTailwindMerge<"text-style">(DS_TW_MERGE_CONFIG)` | cn.ts:51; src/index.ts:47 |
| :207 | Tokens are custom properties in styles.css; the three names exist; token-contract.md path | build.css imports index.css, which imports tokens.css; tokens.css:154, 584, 612 |
| :230 | AIPromptInput `onSubmit(text)`, `responding`, `onStop` | AIPromptInput.tsx:85-101 |
| :246 | Submit sends when idle and stops while responding | AIPromptInput.tsx:318-353 (the stop needs `onStop`, which the example passes) |
| :246 | `onClick` runs before `onStop`; `preventDefault` cancels | AIPromptInput.tsx:326-330 |
| :246 | Forwards its other props, so works under `TooltipTrigger asChild` | forwardRef + `{...props}` (AIPromptInput.tsx:321-323) |

### responsive-sheet-modal.md

| Line | Claim | Evidence |
|---|---|---|
| :5-6 | No prebuilt swapping component | No ResponsiveDialog in src |
| :6-8, :21 | Both wrap Radix Dialog; parts map 1:1 | Modal.tsx:17-20; Sheet.tsx:19-22 |
| :14 | Same root props | Both are `DialogPrimitive.Root` |
| :15, :17 | Trigger/Close take `asChild` | Radix pass-throughs |
| :16 | Sheet adds `side` (default right); both have `withOverlay`, `portal`, `portalProps` | Sheet.tsx:121-130, 150; Modal.tsx:43-52 |
| :18-19 | Title names the panel; Description optional | dialogShell.tsx:30-53; Modal.tsx:65-66 |
| :21-23 | Same focus, dismissal, portal; only geometry and animation differ | Both render DialogShellContent (dialogShell.tsx:70-110) |
| :25-26 | Both are raw; ModalContent sets no width | Modal.tsx:73-81 (no padding/width); Sheet.tsx:63-100 |
| :27-28 | Left/right `w-3/4 max-w-96`; top/bottom size to content | Sheet.tsx:72-91 |
| :52 | The hook module needs no "use client" | Imported only by a client module |
| :35-101 | Hook, wrapper and usage compile | Exports unchanged since C-RSM-7 (U8 tsc probe) |
| :112-114 | Elements cross into the client wrapper; functions only from client code | RSC rule |
| :121-123 | Crossing the breakpoint closes an uncontrolled dialog | C-RSM-8; separate Radix roots |
| :124 | The third `useSyncExternalStore` argument is the server snapshot | React API |
| :118-120 | Set text with Text components | Consistent with the decision |

### components.md (spot-check)

| Row | Claim | Evidence |
|---|---|---|
| SliderContinuous :1725 | Single thumb, only `value[0]`; `className` on the outer box; ref/style/props to the Root | Slider.tsx:342-393 (`value={[display[0] ?? min]}`, `className` on the div, `ref`/`style`/`...props` on Root) |
| SliderStepped :1752 | Same, plus the box owns the end-dot inset | Slider.tsx:344-348 (`showSteps && 'px-sm'`) |
| SliderLabeled :1737 | `className` on the outer column; the rest to the Root | Slider.tsx:499-501 |
| SplitButtonTrigger `aria-label` :1813 | "More options" unless `aria-labelledby` | SplitButton.tsx:63 |
| BaseIcon `aria-hidden` :875 | Hidden by default; labelled icons not hidden | BaseIcon.tsx:102-104 |
| Table :1870 | ARIA-role divs; `columns` is the template; `aria-sort` follows `sortDirection`; `style` merges after the variables | Table.tsx:25, 30-36, 93. `aria-sort` is set on TableHeaderCell, not Table; the sentence describes the family. Optional precision: "…`aria-sort` on each TableHeaderCell follows its `sortDirection`…". |
| TableHeaderCell.sortDirection :1893 | Renders a sort button and sets `aria-sort` | Table.tsx:88-110 |
| Input :908 | `className` on the chrome (input for text, wrapper otherwise); ref/style/props on input | Input.tsx:339-377, 395-420 |

### Props-only cross-check (Text and styles)

| Location | Claim | Evidence |
|---|---|---|
| BaseText.tsx:17 | `unstyled` styles from props alone | Agrees with the decision |
| BaseText.tsx:51-54 | BaseText is the only way DS code sets text; `text-style-*` never appears outside Text/ | grep: only comments outside src/components/Text/ |
| BaseText.tsx:62-66 | Props are the one supported way; className is colour/layout only | Agrees |
| BaseText.tsx:66-67 | `style` outranks props | :107-111 |
| BaseText.tsx:69-75 | The consts resolve to `var(--ui-*)`; the examples are valid (`FontAxis.grade`) | constants.ts:89-99, 118-170 |
| stories :303 | Precedence note: prop > role, style beats both, never className | Agrees |
| stories :305-319 | Precedence rows use props, not classes | Agrees (the className rows were removed) |
| index.css:235-239 | Role classes are defaults in `components`; props outrank them; utilities are unsupported for DS and apps | Agrees |
| index.css:241-242 | Nothing sets line-height | Verified |

## Old false claims (FINDINGS §4) re-checked

| Old claim | Status |
|---|---|
| C-USAGE-54: precedence "prop > className > role" | Gone from the skill. It reappears in BaseText.stories.tsx:394 (FALSE 7) and in index.css:271's "consumers applying `.text-style-*` directly" (FALSE 8). |
| C-USAGE-55/56 (F-006): cn's text-style group incomplete | Not reappearing. twMergeTheme.ts:65-77 lists all 11 roles, so patterns.md:189 is now TRUE. |
| C-USAGE-51 (F-008): typography example missing the HeroText import | Not reappearing; the example is gone. |
| F-003: `asChild` throws on OutlineButton/ShapeButton/DropdownTrigger/TextDropdownTrigger | Fixed in code (Slottable), and patterns.md:107 states it correctly, except for CTAButton (FALSE 4). |
| F-005: ToastProvider `duration` ignored | Fixed (Toast.tsx:272 passes `item.duration` unset); patterns.md:185 TRUE. |
| F-015: preset remaps `max-w-*` | SKILL.md:21 states it correctly. |
| C-RSM-1..8 | All still TRUE. |

## Cross-doc contradictions

1. **SKILL.md:17 vs SKILL.md:26.** ":17 props always win" against ":26 your style wins". The same split is inside BaseText.tsx's own JSDoc (:56-58 vs :66-67). Fixed by FALSE 1, 5 and 6.
2. **Usage skill vs index.css:270-272.** SKILL.md:17 and BaseText.tsx:53 forbid `text-style-*` outside Text/, but index.css:270-272 speaks of consumers applying it directly. See FALSE 8.
3. **BaseText.tsx:17 vs BaseText.stories.tsx:394.** BaseText.tsx:17 says "from props alone"; the story says "Props and className". See FALSE 7.
4. **SKILL.md:18 vs docs/future/responsive-type.md:6.** Both say inline style makes responsive type impossible. Raw `clamp()`/`var()` strings pass through the props (length.ts:1-3). The future doc is a proposal, so only the skill needs fixing (FALSE 2), but the proposal's "nothing can make a title smaller on a phone" has the same gap.
5. **theme.css vs usage skill (tension, not graded).** `src/styles/theme.css:13-15` names `font-label` as an example utility the preset generates. The header is written by scripts/sync-theme.mjs. The usage skill bans `font-label` and every other typography utility. The header is true about what generates, but it advertises a class the skill forbids. Suggest naming a non-typography example (e.g. `shadow-menu`) in sync-theme.mjs's header template.
6. **Incidental, outside this batch.** The `Tracking` JSDoc at `src/components/Text/constants.ts:67` says "Only these three roles ship a tracking token", but `Tracking` has four keys (body, label, hero, mono).
7. **Setup skill vs SKILL.md:21 (incomplete, not a contradiction).** The setup skill (rule 2) also lists `inline-`, `min-inline-` and `max-inline-` as remapped. SKILL.md:21 names only `w`, `max-w`, `min-w` and `basis`.

## Fixes

I re-verified every FALSE item against the code before editing it. All 8 hold. Edits are text, comment and story-note only; no rendered props or behaviour changed. None of the touched files has a `## behavior` / `## constraints` header. `node scripts/generate-docs.mjs` reports everything fresh. `npm run lint` exited 0 ("conventions: 30 checks passed").

1. **FIXED**, SKILL.md:17 (failure column): "Props are inline, so they beat every class (only `style` outranks them), and the consts keep sizes on the token scale."
2. **FIXED**, SKILL.md:18: "Text components take props only, and the props take no per-breakpoint values. Don't work around it with className utilities, duplicated hidden copies, JS width checks, or a viewport-driven string passed to a prop (`clamp()`, `vw`, a `var()` redefined in a media query): the props accept any CSS string, but such a value is off the role scale and breaks this rule." This keeps the maintainer decision: responsive type is not supported, and the raw-string arm is named as off-scale, not as a feature.
3. **FIXED**, SKILL.md:26, by narrowing the skill. components.md is not hand-edited and no JSDoc moved. New text: "On some components `className` styles a different element from the one that gets `ref`, `style` and the other props (`Input`, `SearchBox`, `OutlineButton`, `SegmentedTabSelect` and the Sliders among them); check the component's components.md entry and its JSDoc before overriding." Evidence: SearchBox.tsx:19 and OutlineButton.tsx:62-63 are in the JSDoc but not its first sentence. DropdownMenuSearch.tsx:10-11 and CodeDigitInput.tsx:13-14 do the same split and are covered by "among them". DatePicker takes no `ref`/rest props, so it is not this case.
4. **FIXED**, patterns.md:107: "`ShapeButton`, `DropdownTrigger` and `TextDropdownTrigger` take `asChild` the same way. `CTAButton` takes it too but supplies its own content: pass `text` and `icon` and leave the child empty (`<CTAButton asChild text="See pricing" icon={…}><Link href="/pricing" /></CTAButton>`)."
5. **FIXED**, BaseText.tsx JSDoc: "1. props — written as inline style, so they beat every class (only the `style` prop outranks them)".
6. **FIXED**, BaseText.stories.tsx:34 (component description): "(written inline, so they beat the role class; only `style` outranks them)".
7. **FIXED**, BaseText.stories.tsx:394 (Unstyled note): "Drops the role class entirely — no family, size, weight, tracking or axes. Props still apply, so props alone set typography the system does not describe; className still carries colour and layout." This is note text only; the story's rendered props are unchanged.
8. **FIXED**, index.css:270-272: "they are spelled out rather than composed because BaseText applies exactly one role class per element, so each must stand alone." The comment sits outside the generated block (`__GENERATED_THEME_END__` is at index.css:229), so I edited it directly; sync-theme.mjs was not involved.

Cross-doc contradictions:
- 1, 2 and 3 are resolved by fixes 1, 5, 6, 7 and 8.
- 4: only the skill was fixed. docs/future/ is a proposal, not guidance.
- 5, 6 and 7 are outside this batch's FALSE list and were left as they are:
  - theme.css's `font-label` example
  - the `Tracking` JSDoc's "three roles" (four keys)
  - the setup skill's `inline-` remaps

Claims file `docs/audit/_work/docs-pass/claims/dooph-design-system-usage.md`: I updated the precedence, responsive-type, className-placement and stories claims, and added a "Fix round 4" section.

## Fix verification

Verifier: fresh, read-only. Checked the working tree on 2026-10-11.

1. SKILL.md:17 "beat every class (only `style` outranks them)": VERIFIED. BaseText.tsx:107-111 spreads `{ ...typography, ...style }`.
2. SKILL.md:18 responsive type: VERIFIED. It says the props take no per-breakpoint values, names `clamp()`, `vw` and a media-query `var()` as forbidden workarounds, and does not present them as supported. "The props accept any CSS string" is true (length.ts / constants.ts types).
3. SKILL.md:26 className placement: VERIFIED. SearchBox.tsx:19 and OutlineButton.tsx:62-63 state the split in JSDoc; Input and the Sliders were confirmed in the original check. The new wording only tells the reader to check components.md and the JSDoc, so it makes no false claim.
4. patterns.md:107 CTAButton: VERIFIED. It matches CTAButton.tsx:77-93 (`text` and `icon` required, child's children replaced via `cloneElement` at :215-218, JSDoc example with an empty Link).
5. BaseText.tsx:56-57 JSDoc: VERIFIED. It now agrees with :65-66 and with the code at :107-111.
6. BaseText.stories.tsx:34: VERIFIED. It agrees with the Precedence note at :303.
7. BaseText.stories.tsx:394 Unstyled note: VERIFIED. It matches the `unstyled` JSDoc at BaseText.tsx:17 and the props-only rule.
8. index.css:270-272: VERIFIED. `role = unstyled ? undefined : variant` and `cn(role && TEXT_VARIANT_CLASS[role], className)` apply exactly one role class per element.

Counts: 8 VERIFIED, 0 STILL FALSE.

Extra checks:
- Commands: `node scripts/generate-docs.mjs --check` exit 0; `node scripts/sync-skills.mjs --check` exit 0 (9 skills x 2 mirrors); `npm run lint` exit 0 (tsc, then "conventions: 30 checks passed").
- Precedence wording sweep (skills/, .agents/skills/, src/components/Text/, src/styles/index.css): one leftover. `src/components/Text/textStyle.ts:9` says "Inline style outranks every layer, so a prop that is set always wins." In context it is about cascade layers and classes, so it is true there, but it omits that `style` outranks props. It is a minor wording gap, not a contradiction of a fixed claim; the suggested tweak is "...so a prop that is set beats every class (only `style` outranks it)". Everything else agrees: BaseText.tsx:56-66, the stories :34 and :303, index.css:237 ("outrank the role class") and SKILL.md:17 and :26. The v3-migration skill (line 196) only says props apply as inline style and is not contradictory.
- Raw `clamp()`/`var()` in the usage SKILL.md: appears only at :18, as a forbidden workaround. It is not presented as supported.
- `git diff` of BaseText.tsx and index.css: comment/JSDoc text only (BaseText.tsx:17, :56-57; index.css:270-272). BaseText.stories.tsx: description (:34) and notes (:303, :394) are text. Also, the Precedence story's rows changed from `className` demos to prop demos (`fontSize={FontSizes.hero}`, `letterSpacing={Tracking.hero}`; the "className + fontSize" row was removed). That is a story demo edit, needed to make the note true, and it type-checks. No component, prop or class in rendered library code changed. None of these three files has a `## behavior` / `## constraints` header, so there is no contract to keep consistent.
