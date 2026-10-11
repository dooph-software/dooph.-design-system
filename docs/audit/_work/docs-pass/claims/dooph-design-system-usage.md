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
