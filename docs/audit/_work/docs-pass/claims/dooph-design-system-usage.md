# Claims: dooph-design-system-usage

Every factual claim in `skills/dooph-design-system-usage/SKILL.md` (S), `references/patterns.md` (P) and
`references/responsive-sheet-modal.md` (M), with evidence. Line numbers are at the working tree on 2026-10-11.
"tsc" = the code blocks were extracted and type-checked against `src/index.ts` (scratch project, `paths`
mapping `@dooph-software/design-system` to `src/index.ts`, stubs for `next/link` and the app's own
functions): exit 0; a negative control (`<Button variant="danger" size="big">`, `onValueChange` typed
`(v: number)`) failed as expected.

## SKILL.md

- S: Components present; the app owns data, fetching, timers, state and control. Evidence: doc-refresh.md "The DS doesn't own data or control"; src/components/AIChat/AIThinkingPart.tsx:27, :52 ("Thought for 26s" is "the consumer's copy"); dooph-ds-writing-components claims file (no `fetch`/`setInterval` in non-story src).
- S: Text roles: TitleText, HeadingText, SubheadingText, BodyText, LabelText, MonoText, ButtonText, the hero roles, BaseText. Evidence: src/components/Text/index.ts:1-14; src/components/Text/BaseText.tsx:144-172.
- S: `as` picks the element, including `as="label"` + `htmlFor`. Evidence: src/components/Text/BaseText.tsx:21-27 ("lets TS infer the element from the value and admit its props (as="label" + htmlFor)"); tsc (P1 form).
- S: A raw element skips the role's family, size, weight and axes. Evidence: src/styles/index.css:247-353 (`.text-style-*` carry font-family, size, weight, font-variation-settings); BaseText.tsx:92-100 applies them only through a Text component.
- S: No typography classes or inline font styles; adjust with props `fontWeight`, `lineHeight`, `tabular`. Evidence: maintainer rule (doc-refresh.md "Text is always set by a Text component"; .agents/skills/dooph-ds-writing-components/SKILL.md:27); props at src/components/Text/textStyle.ts:43, :61 and components.md Text table; `FontWeights.semibold` at src/components/Text/constants.ts (FontWeights). Line-height is left to the consumer via the prop: src/styles/index.css:240-241.
- S: The preset makes `text-body` / `font-label` exist; `text-body` sets the size only. Evidence: src/styles/theme.css `--text-body`, `--font-label`; compiled with Tailwind CLI 4.3.3 (scratch): `.text-body { font-size: var(--ui-text-body) }`, `.font-label { font-family: var(--ui-font-label) }`.
- S: Colour classes like `text-text-secondary` are fine. Evidence: src/styles/theme.css `--color-text-secondary`; text roles set no colour (src/styles/index.css:247-353); DS itself does this (src/components/Modal/dialogShell.tsx:50).
- S: DS controls set their own text role: Button, DropdownMenuItem. Evidence: Button.tsx:189-197 (root renders through BaseText); DropdownMenu.tsx:286-287 (`BodyText as={DropdownMenuPrimitive.Item}`).
- S: ModalContent, SheetContent, PopoverContent, OutlineSection, TableCell set no text role. Evidence: dialogShell.tsx:77-95 (Content has no Text component); `grep -n Text` in Popover.tsx and OutlineSection.tsx finds nothing; Table.tsx:151-162.
- S: Spacing words and px: xxxs 2, xxs 4, xs 6, sm 8, rg 10, md 12, lg 16, xl 20, xxl 26, xxxl 42. Evidence: src/styles/tokens.css:581-590; theme.css `--spacing-*`.
- S: Utilities `bg-surface-page`, `border-border-primary`, `rounded-tight`, `shadow-menu`, `mt-xxxs`, `gap-sm`, `px-lg` exist. Evidence: theme.css `--color-surface-page`, `--color-border-primary`, `--radius-tight`, `--shadow-menu`, `--spacing-*`; compiled `.mt-xxxs { margin-top: var(--ui-spacing-xxxs) }`.
- S: Rule against numeric spacing, palette colours, hex in app code. Evidence: maintainer intent (dooph-ds-styling SKILL.md:32-33, written for app authors here); baseline consumer must-lines (SCORES.md (e) settings-notifications-form) and the secondary `mt-0.5` / `style={{ maxWidth: 640 }}` misses (SCORES.md (c) consumer items).
- S: In `w-*`, `max-w-*`, `min-w-*`, `basis-*`, DS size names are spacing; `max-w-md` is 12px, not 28rem; `max-w-[40rem]` is a literal. Evidence: node_modules/tailwindcss/dist/lib.js namespace order `max-w: ["--max-width","--spacing","--container"]`, same for `w`, `min-w`, `basis`; compiled (scratch, Tailwind CLI 4.3.3 + src/styles/theme.css): `.max-w-md { max-width: var(--ui-spacing-md) }`, `.w-xl`, `.min-w-sm`, `.basis-lg` → spacing vars, `.max-w-2xl { max-width: var(--container-2xl) }`, `.max-w-\[40rem\] { max-width: 40rem }`; tokens.css:586 md = 12px; doc-refresh.md "The DS owns its size names"; FINDINGS F-015.
- S: Option props take dot consts: `ButtonVariant.prominent`, `SheetSide.bottom`. Evidence: src/components/Button/constants.ts; src/components/Sheet/constants.ts:7-12.
- S: Controls use `value` + `onValueChange`, Radix parts `checked`/`onCheckedChange`, `open`/`onOpenChange`, or `defaultValue`. Evidence: .agents/skills/dooph-ds-writing-components/SKILL.md:37 (quick ref, maintainer rule); Input onValueChange (components.md Input); Toggle.tsx:12-13; Checkbox is Radix Root (Checkbox.tsx:127-135).
- S: `"use client"` on the smallest leaf; page stays a Server Component and passes serialisable props. Evidence: doc-refresh.md "use client only when unavoidable"; React Server Components cannot pass functions to client components or host elements; baseline pricing-rsc-buttons (async server page + one client leaf; post-run build 0, SCORES.md (e)). Counters SCORES.md (c) consumer item "Whole page made a client component".
- S: `asChild`: `<Button asChild><Link>`, `<TextLink asChild>`, Radix triggers; the child must be one element. Evidence: components.md (`asChild?` on Button, CTAButton, DropdownTrigger, TextDropdownTrigger, OutlineButton, ShapeButton, TextLink); TextLink.tsx:13; Modal.tsx:59 example `ModalTrigger asChild`; CHANGES.md "asChild" entry consumer impact (a non-element child throws Radix's Slottable error); tsc (P2).
- S: `className` merges with `cn`; a conflicting consumer class replaces the component's (`rounded-full` beats `rounded-tight`). Evidence: src/utils/cn.ts:26-28 (JSDoc); `cn(recipe, className)` in Button.tsx:195, Modal.tsx:69-87, BaseText.tsx:100.
- S: `style` merges last and wins. Evidence: doc-refresh.md "The consumer's `style` merges last and wins"; BaseText.tsx:101-110; CHANGES.md "consumer impact: a consumer `style` that sets the same property as a component prop … now wins".
- S: Where className lands off the root: Input chrome, SegmentedTabSelect list, sliders outer box. Evidence: Input.tsx:8; SegmentedTabSelect.tsx:47-48; Slider.tsx:463, :471, :490.
- S (table): CTAButton, OutlineButton, ShapeButton are expressive. Evidence: doc-refresh.md "Expressive components (OutlineButton, CTA, shapes…) are opt-in by use".
- S (table): `ButtonVariant.prominent` is the call to action. Evidence: Button.tsx:49-50 ("every consumer's prominent call to action").
- S (table): no on/off switch; ToggleSwitch is single-select over two or more options and its selection never clears; FancyToggleSwitch is the same behaviour. Evidence: Toggle.tsx:4-10; FancyToggleSwitch.tsx:12-17; src/index.ts exports (no Switch).
- S (table): `Input` with `InputVariant`; `SearchBox` for search. Evidence: components.md Input; SearchBox.tsx:24 JSDoc.
- S (table): Tabs, SegmentedTabSelect; DropdownMenu with DropdownMenuTrigger asChild around DropdownTrigger. Evidence: components.md Tabs/SegmentedTabSelect; DropdownMenu.stories.tsx:48-58.
- S (table): Modal, Sheet, Popover, Tooltip; ToastProvider + useToast. Evidence: src/components/Toast/index.ts (exports `useToast`); Toast.tsx:344-348.
- S (table): Table `columns` is the grid template; TableHeaderCell sorts with `sortDirection` + `onSort`. Evidence: Table.tsx:15-31 (`--table-cols`), :49 (`gridTemplateColumns`), :85 (sortable branch when `sortDirection !== undefined`, click is `onSort`).
- S (table): Sticker is a status chip. Evidence: Sticker.tsx:2 ("a non-interactive chip").
- S (table): ProgressIndicator 0–1; LinearProgressIndicator; spinners. Evidence: ProgressIndicator.tsx:64-65, :287; LinearProgressIndicator.tsx header; LoadingSpinner.tsx:278.
- S (table): DatePicker, Calendar, VerificationCodeInput, SliderContinuous/Stepped/Labeled; AI chat parts. Evidence: components.md headings.
- S: Rationalization quotes are verbatim. Evidence: SCORES.md (e) settings-notifications-form: Thinking [45] "1. A page at `app/settings/notifications/page.tsx` - client component with form state"; subagent "Client components would use "use client" and fetch/axios on client side".
- S: Verification regex catches typography utilities, numeric spacing and palette colours without false hits on DS words. Evidence: run on 13 bad and 6 good sample lines (scratch t6-usage/re-samples.txt): all 13 bad lines matched, no good line matched.
- S: token-contract.md path `../dooph-design-system-theming/references/token-contract.md`. Evidence: file exists; skills install side by side (bin/init.mjs:113, copies every skill dir).

## references/patterns.md

- P1: Page with no directive renders TitleText/BodyText and a client form; form uses Input `value`/`onValueChange`, Checkbox `checked`/`onCheckedChange`, LabelText `as="label"`, Button `type="submit"` `variant`. Evidence: tsc.
- P1: Input puts `id`, `ref` and every other prop on `<input>`, `className` on the chrome; `onValueChange` gets the raw string. Evidence: Input.tsx:5-9, header `onValueChange` bullet; components.md Input.
- P1: Checkbox draws its own indicator. Evidence: Checkbox.tsx:135.
- P1: A Server Component cannot pass a function to anything; with plain props it renders DS components. Evidence: React RSC serialisation rule; setup skill rule 4 (sibling, same fact); baseline pricing-rsc-buttons built with a server page rendering `<Button asChild><Link>`.
- P2: `asChild` root receives DS classes, handlers and ref; exactly one element child. Evidence: CHANGES.md asChild entry consumer impact; Button.tsx:189 (`Slot`).
- P2: Button and TextLink render from a Server Component. Evidence: no directive in Button.tsx, TextLink.tsx; @radix-ui/react-slot has no directive (CHANGES.md asChild entry); baseline pricing-rsc-buttons build 0.
- P3: Menu composition (DropdownMenuSection inset, DropdownMenuItemVariant.danger, onSelect). Evidence: tsc; DropdownMenu.tsx:474; components.md Menu consts.
- P3: Non-modal by default; `modal` for focus trapping. Evidence: DropdownMenu.tsx:75.
- P3: RadioGroup + RadioSelectItem; `selectType` multi + MultiSelectItem. Evidence: DropdownMenu.tsx:330, :376; components.md DropdownMenu `selectType`.
- P4: TableHeaderCell sets the button role; TableCell none; ModalContent/SheetContent no padding; titles HeadingText, descriptions BodyText. Evidence: Table.tsx:104, :118, :151-162; Modal.tsx:54; Sheet.tsx:117; dialogShell.tsx:34, :47; tsc.
- P5: ToastProvider is a client component; useToast needs the provider; `duration` default 4000, per-toast override, `Infinity` keeps open. Evidence: Toast.tsx:1, :221-232, :347.
- P6: `cn` is clsx + tailwind-merge with DS scales and roles; `p-lg` replaces `p-md`; colour never erases a role; `DS_TW_MERGE_CONFIG` recipe. Evidence: src/utils/cn.ts:14-30, :31-55; src/index.ts:49; CHANGES.md cn "docs owed" (the recipe text); tsc.
- P7: Tokens are CSS custom properties: `--ui-spacing-sm`, `--ui-color-text-secondary`, `--ui-radius-tight`. Evidence: token-contract.md:153, :420, :450.

## references/responsive-sheet-modal.md (kept; every claim checked)

- M: No swapping component ships. Evidence: src/index.ts (no such export).
- M: Modal and Sheet wrap Radix Dialog; roots, triggers, closes are Radix pass-throughs (`open`, `onOpenChange`, `modal`, `asChild`). Evidence: Modal.tsx:17-20; Sheet.tsx:19-22.
- M: Sheet adds `side` (default right); both have `withOverlay`, `portal`, `portalProps`. Evidence: Modal.tsx:44-51; Sheet.tsx:104-115, :137. (Fixed: the old line listed only `withOverlay`.)
- M: Title names the panel; include one, `sr-only` if undesigned. Evidence: Modal.tsx:64-65; Radix dialog 1.1.23 sets `aria-labelledby` only when a title is present (node_modules/@radix-ui/react-dialog/dist/index.mjs:233).
- M: Description optional. Evidence: same file :232 (`aria-describedby` omitted when absent; no warning in 1.1.23, :288-290).
- M: Shared state, focus, dismissal and portal; only geometry and animation differ. Evidence: dialogShell.tsx (shared shell), Modal.tsx:69-87, Sheet.tsx:68-100.
- M: Contents are raw (no padding/flex); ModalContent sets no width; left/right sheets `w-3/4 max-w-96`, top/bottom size to content. Evidence: Modal.tsx:54, :69-87; Sheet.tsx:64-67, :68-100. (Added.)
- M: Hook module needs no directive when only client code imports it. Evidence: React client-boundary semantics. (Changed: the old block had `"use client"` on the hook.)
- M: Code blocks compile. Evidence: tsc (hook, wrapper, usage).
- M: Usage example padding `p-lg`. (Fixed: the old example used numeric `p-6`.)
- M: Elements can cross into a client component from a Server Component; functions cannot. Evidence: RSC serialisation rule. (Added.)
- M: Crossing the breakpoint unmounts one root; controlled `open` survives; third `useSyncExternalStore` argument is the server snapshot. Evidence: React semantics; unchanged.

## Fix round 1 (2026-10-11)

Changed or added claims after review and two maintainer decisions (typography is props only, for consumers too; responsive type is not supported).

- S: Typography is props only, Text components included: `fontSize={FontSizes.subheading}`, `fontWeight={FontWeights.semibold}`, `letterSpacing={Tracking.label}`, `lineHeight`, `tabular`. Evidence: maintainer decision (fix round 1); props at src/components/Text/textStyle.ts:43, :61 and components.md BaseText table (`fontSize`, `fontWeight`, `letterSpacing`, `lineHeight`, `tabular`); consts at src/components/Text/constants.ts (FontSizes.subheading, FontWeights.semibold, Tracking.label). Replaces the earlier "half a role" failure text.
- S: Props are inline, so they beat every class (only `style` outranks them); the consts keep sizes on the token scale; a class loses to a prop, and `text-sm` is off the scale. Evidence: BaseText.tsx:107-111 (typography written as inline `style`, with `style` spread after it); constants.ts values are `var(--ui-*)`; src/styles/index.css role classes sit in `@layer components`; `text-sm` is Tailwind's default size, not a `--ui-text-*` token (theme.css registers no `--text-sm`).
- S: Line height is the app's, set with the `lineHeight` prop. Evidence: src/styles/index.css comment above `@layer components` (roles set no line-height).
- S: Responsive type isn't supported: props only, and the props take no per-breakpoint values; the props accept any CSS string, but a viewport-driven string (`clamp()`, `vw`, a media-query `var()`) is off the role scale and breaks the rule. Evidence: maintainer decision B; prop types at src/components/Text/constants.ts:142-150 (`(string & {})` arms), src/utils/length.ts:1-3 (strings pass through); no prop accepts a breakpoint map (textStyle.ts).
- S: `CTAText` is a role. Evidence: BaseText.tsx `export const CTAText`; src/components/Text/index.ts.
- S: On some components `className` styles a different element from the one that gets `ref`, `style` and the other props (Input, SearchBox, OutlineButton, SegmentedTabSelect, the Sliders among them); check the components.md entry and the JSDoc. Evidence: components.md:908 (Input), :1428 (SegmentedTabSelect), :1725, :1737, :1752 (Sliders); SearchBox.tsx:19; OutlineButton.tsx:62-63. components.md shows only a description's first sentence, so SearchBox and OutlineButton placement is in the JSDoc only; DropdownMenuSearch.tsx:10-11 and CodeDigitInput.tsx:13-14 split the same way ("among them").
- S: Tooltip needs a `TooltipProvider` ancestor; Radix throws without one. Evidence: src/components/Tooltip/Tooltip.tsx:14 (`Tooltip = TooltipPrimitive.Root`); node_modules/@radix-ui/react-tooltip/dist/index.mjs:29 (provider context) and @radix-ui/react-context `must be used within` throw.
- S: AI chat includes `ChatDivider` and `UserMessageHeader`. Evidence: src/components/AIChat/index.ts.
- S: Second rationalization quote restored verbatim with backticks. Evidence: SCORES.md (e) settings-notifications-form ("Client components would use `"use client"` and fetch/axios on client side").
- S: Verification grep extended (`font-[`, `text-[`, bracketed hex) and labelled partial. Evidence: rerun on 16 bad and 7 good sample lines: all 16 bad lines hit; one good-intent line (`text-[color:var(--app-x)]`) also hits, which is why it says "should print nothing" and "read the diff too".
- P1: Server Components cannot pass an event handler or other plain function to a client component or DOM element; a Server Action is the exception. Evidence: matches skills/dooph-design-system-setup/SKILL.md rule 4 and references/client-references.md:8.
- P2: OutlineButton `asChild` slots the inner button; `className` styles the outer frame. Evidence: src/components/OutlineButton/OutlineButton.tsx:62-63, :90.
- P4: TableHeaderCell sets the button text role (`ButtonText`). Evidence: Table.tsx:104, :118.
- P8: AIPromptInput takes `onSubmit`, `responding`, `onStop`; AIPromptInputSubmit sends when idle and stops while responding; a consumer `onClick` runs before `onStop` and `event.preventDefault()` cancels the stop; it forwards other props, so `TooltipTrigger asChild` works. Evidence: src/components/AIChat/AIPromptInput.tsx:292-297 (JSDoc); components.md AIPromptInput table; CHANGES.md:2211 docs owed and consumer impact line; tsc (chat.tsx, exit 0).
- DS comments (comment-only): src/components/Text/BaseText.tsx JSDoc and src/styles/index.css role-layer comment reworded so they no longer invite consumer typography utilities. Kept: roles sit in `@layer components`; props are inline and win; line height is set with the `lineHeight` prop.

## Fix round 2 (2026-10-11)

Removed from SKILL.md (for length; nothing removed was false):
- The Red flags line. Its LabelText item is folded into the Text rule ("a label beside its control always takes `as="label"`"; evidence: SCORES.md (e) "Weekly digest" bare LabelText). The other items stay covered by the rules (smallest-leaf, spacing, Text) and the verification grep.
- The Related section (line 10 names both siblings and components.md; token-contract.md is the theming skill's).
- The overview's Text/tokens sentence; the className row's per-component examples and its Input sentence (Input's placement stays in patterns.md P1; it is not in components.md, see report); the Table `columns` parenthetical (now in the Table JSDoc, so components.md carries it); the Menu row's `DropdownMenuTrigger asChild` clause (patterns.md P3 keeps it); `<TextLink asChild>` and the second plain-string example; `ProgressIndicator (0–1)` (components.md carries `progress`); the call-to-action note on `ButtonVariant.prominent`.
- Reworded, same facts: the Text-rule failure ("gets none of the role's type tokens"), the typography failure, the Tooltip note ("needs a `TooltipProvider` ancestor"), the partial-grep note, and the "use client" check.

Added to src (JSDoc and story text only; each now appears in components.md):
- SliderContinuous / SliderStepped / SliderLabeled first sentence: single thumb, only `value[0]` drawn and edited. Evidence: Slider.tsx:45-46 (`SliderProps` JSDoc), :197-200 (Radix handed only `value[0]`); components.md:1723, :1735, :1750.
- SplitButtonTrigger `aria-label`: '"More options" unless `aria-labelledby` is passed'. Evidence: SplitButton.tsx:65 (`ariaLabel ?? (props["aria-labelledby"] ? undefined : "More options")`); components.md:1811.
- BaseIcon `aria-hidden`: hidden by default; with `aria-label`/`aria-labelledby` not hidden unless passed. Evidence: BaseIcon.tsx:101-103; the file's behavior header lines 9-10 say the same; components.md:857 and other icon/shape tables.
- Table: ARIA-role divs, `columns` is the grid template, `aria-sort` follows `sortDirection`, `style` merges after the grid variables. Evidence: Table.tsx roles (`role="table"`, `"row"`, `"columnheader"`, `"cell"`), `--table-cols` then `...style`, `aria-sort={ARIA_SORT[sortDirection]}`; components.md:1868.
- TableHeaderCell `sortDirection`: makes the header sortable, renders a sort button and sets `aria-sort`. Evidence: Table.tsx branch `if (sortDirection !== undefined)` rendering `Button` with `onClick={onSort}` and `aria-sort`; components.md:1891.
- BaseText.stories.tsx docs description and Precedence note, plus BaseText.tsx `unstyled` JSDoc: props-only wording (maintainer decision). Kept facts: props are inline and beat the role class (only `style` outranks them); roles sit in `@layer components`.

## Fix round 3 (2026-10-11)

- Input component JSDoc: `className` on the field chrome (the `<input>` for the text variant, the wrapper otherwise); `ref`, `style` and other props on the `<input>`. Evidence: Input.tsx behavior header lines 5-9; `style` is not destructured in Input.tsx, so it reaches the `<input>` with the rest props; components.md:908. SKILL.md "When `className` lands off the root, components.md says where" now covers Input, SegmentedTabSelect (components.md:1426) and the sliders.
- BaseText.stories.tsx Precedence rows now use props only (`FontSizes.hero`, `Tracking.hero`).

## Fix round 4 (2026-10-11, claim-check batch 6)

- P: `ShapeButton`, `DropdownTrigger` and `TextDropdownTrigger` take `asChild` the way `Button` does; `CTAButton` takes it but supplies its own content: pass `text` and `icon`, leave the child empty. Evidence: `Slottable child={children}` at ShapeButton.tsx:148, DropdownTrigger.tsx:78, :332; CTAButton.tsx:77-80 (`text`, `icon` required), :84-93 (JSDoc), :215-218 (`cloneElement(children, undefined, content)`).
- BaseText.tsx JSDoc precedence list: props beat every class, only the `style` prop outranks them. Evidence: BaseText.tsx:107-111 (`{ ...typography, ...style }`).
- BaseText.stories.tsx component description: props beat the role class; only `style` outranks them. Evidence: as above; Precedence story row "style beats props".
- BaseText.stories.tsx Unstyled note: props alone set typography; className carries colour and layout. Evidence: BaseText.tsx:17 (`unstyled` styles from props alone), :64-66 (className never typography).
- src/styles/index.css hero-pair comment: role classes are spelled out because BaseText applies exactly one role class per element. Evidence: BaseText.tsx:93, :103 (`cn(role && TEXT_VARIANT_CLASS[role], className)`, one role or none when `unstyled`). The comment sits outside the generated theme block (markers end at index.css:229).

## Fix round 5 (2026-10-11, consumer GREEN skill gaps)

- S: Verification step 1 (SKILL.md:64) names the app's own `npm run typecheck` and `npm run build`, never raw `tsc`; in Next.js, raw `tsc` reporting `Cannot find name 'LayoutProps'` means `next typegen` was skipped, not a pre-existing error. Evidence: agrees with dooph-design-system-setup SKILL.md:37 (Verify 1: the app's own typecheck script, never raw `tsc`; `next typegen && tsc --noEmit` on Next 15.5+; the `LayoutProps` reading) and :47 (Rationalization "The layout error is pre-existing."); ../ds-consumer-template/package.json:7 (`"build": "next build"`), :9 (`"typecheck": "next typegen && tsc --noEmit"`). Baseline failure: SCORES-consumer.md settings-notifications-form and changelog-reading-column (raw `npx tsc --noEmit` → `Cannot find name 'LayoutProps'`, called pre-existing; the post-run `npm run typecheck` exits 0).
