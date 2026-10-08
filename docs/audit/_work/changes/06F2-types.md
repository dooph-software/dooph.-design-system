# 06F2 — Types say what the runtime does (WI-030, WI-126, WI-091)

Checklist:
- [x] baseline scoreboard + lint
- [x] WI-030 polymorphic render functions typed at concrete element
- [x] WI-126 Button variant/size, SheetContent side, Checkbox variant, TabsTrigger size/variant from consts
- [x] WI-091 CTAButton children only with asChild
- [x] type probe (both directions)
- [x] before/after render (esbuild bundle)
- [x] lint + scoreboard after

## Baseline (before any edit)
- scoreboard: raw var 5, "use client" 27, JS timers 5, all others 0.
- render snapshot: scratchpad `f2/entry.tsx` + `f2/snap.mjs` (esbuild bundle of the
  touched components, renderToStaticMarkup, 99 cases) → `f2/before.json`, 0 throws.
- type probe `.tmp-probe/f2.probe.tsx`: every must-compile line compiles. Exactly the 10
  new WI expect-errors are TS2578 "unused": Button variant/size null ×3, SheetContent
  side null, Checkbox variant null, TabsTrigger size and variant null, CTAButton children
  without asChild, asChild with no child, asChild with a string child.
- mutation check (copy of src, `const probe: number = <binding>` in each polymorphic
  render body: Button variant, OutlineButton glowing, ShapeButton shape,
  DropdownTrigger asChild, TextDropdownTrigger size, BaseText fontSize) → tsc exit 0:
  every binding is `any`.

---

### Polymorphic components type-check their own props again [F-036, WI-030]
- files: `src/components/Button/Button.tsx`, `src/components/OutlineButton/OutlineButton.tsx`,
  `src/components/ShapeButton/ShapeButton.tsx`, `src/components/DropdownTrigger/DropdownTrigger.tsx`,
  `src/components/Text/BaseText.tsx`
- what changed: the inner `forwardRef` render functions of Button, OutlineButton,
  ShapeButton, DropdownTrigger, TextDropdownTrigger and BaseText are now typed at their
  default element (`Props<"button">`). BaseText gets a local `BaseTextRenderProps`: own
  props + `as?: ElementType` + span attributes. Before, they were typed as
  `Props<ElementType>`, which made every destructured prop `any`. The casts this made
  redundant are gone: ShapeButton's `shape as ShapeButtons` and
  `variant as ShapeButtonVariant` (`resolvedVariant` removed; the class maps index by
  `variant`), and BaseText's `variant as TextVariant`. The exported generic cast
  signatures are unchanged. The only `Props<ElementType>` left is
  `RoleTextProps<ElementType>`, the pass-through in BaseText's role factory, which
  destructures nothing.
- consumer impact: none. Public signatures and runtime behaviour are unchanged. The
  repo's own render bodies now catch a renamed or mistyped prop at compile time.
- breaking: no
- verified: mutation check on a copy of `src` (`const probe: number = <binding>` in
  each render body). Before: tsc exit 0. After: 6 × TS2322 (Button `variant`,
  OutlineButton `glowing`, ShapeButton `shape`, DropdownTrigger `asChild`,
  TextDropdownTrigger `size`, BaseText `fontSize`). The probe compiles
  `<OutlineButton<"a"> href glowing>`, `<DropdownTrigger<"a"> href>`,
  `<TextDropdownTrigger<"a"> href>`, `<ShapeButton<"a"> href>`,
  `<BaseText as="label" htmlFor>`, `<BodyText as="p" fontSize>`, a typed
  `onMouseMove` on OutlineButton, and button refs. `<OutlineButton glowing="yes">` still
  fails. Render snapshot identical (see Verification below).
- docs owed: none (internal typing).

### Button `variant`/`size`, SheetContent `side`, Checkbox `variant`, TabsTrigger `size`/`variant` no longer accept `null` [F-037, WI-126]
- files: `src/components/Button/Button.tsx`, `src/components/Sheet/Sheet.tsx`,
  `src/components/Checkbox/Checkbox.tsx`, `src/components/Tabs/Tabs.tsx`
- what changed: these props are now typed from their exported consts (`ButtonVariant`,
  `ButtonSize`, `SheetSide`, `CheckboxVariant`, `TabSize`, `TabVariant`). Before, they
  used cva's `VariantProps`, which admits `null`. cva reads `null` as "no variant", so
  it rendered an unstyled button, an unpositioned sheet, an unfilled checkbox or an
  unsized tab, with no warning. Button keeps the batch-05 pill restriction: its
  `ButtonVariantSizeProps` union is now built from the consts
  (`Extract<ButtonVariant, …>` / `Extract<ButtonSize, …>`), so
  `variant="danger" size="big"` still fails. The `VariantProps` imports are dropped from
  all four files. The exported cva helpers (`buttonVariants`, `checkboxVariants`,
  `tabTriggerVariants`) are cva functions, so their own argument still accepts `null`.
  That is cva's signature, not a component prop.
- header: a new bullet in Button.tsx `## constraints`: props are typed from the consts,
  never `VariantProps`, because `null` would compile and render unstyled. Checkbox's
  header is unaffected. Sheet and Tabs have no header.
- consumer impact: a TypeScript call that passes `null` for one of these props stops
  compiling. Const members, string literals and `undefined` all still compile.
  Runtime unchanged.
- breaking: yes — v6 (type-level only). Exact old → new:
  - `<Button variant={null}>` / `variant={cond ? X : null}` → `variant={undefined}` / `variant={cond ? X : undefined}`
  - `<Button size={null}>` → `size={undefined}` (or omit)
  - `<SheetContent side={null}>` → `side={undefined}` (or omit; default `right`)
  - `<Checkbox variant={null}>` → `variant={undefined}` (or omit; default `prominent`)
  - `<TabsTrigger size={null}>` / `variant={null}` → `undefined` (or omit; defaults `standard` / `ghost`)
  - The exported prop types change to match. `ButtonProps['variant'|'size']`,
    `SheetContentProps['side']`, `CheckboxProps['variant']` and
    `TabsTriggerProps['size'|'variant']` lose `| null`.
  - finder: `rg -n "(variant|size|side)=\{[^}]*\bnull\b" src`
- verified: probe. These were unused `@ts-expect-error`s before and are errors now:
  `<Button variant={null}>`, `<Button size={null}>`,
  `variant={cond ? ButtonVariant.primary : null}`, `<SheetContent side={null}>`,
  `<Checkbox variant={null}>`, `<TabsTrigger size={null}>`, `<TabsTrigger variant={null}>`.
  These compile: `variant="ghost"`, `size={ButtonSize.iconSm}`, `cond ? X : undefined`
  (Button, Sheet, Checkbox), `variant="primary" size="big"`, `size="medium"`,
  `Button<"a"> asChild`, TabsTrigger `size="fill"`, and
  `buttonVariants({ variant: ButtonVariant.primary, size: ButtonSize.sm })`.
  `variant="danger" size="big"` still fails. Declarations emitted into the scratchpad:
  the component prop types carry no `| null` (only the cva helper signatures do).
  `npm run lint` exit 0, which covers Toast's `buttonVariants` calls, CopyButton and all
  stories.
- docs owed: CHANGELOG `[Unreleased]` → Changed: "**Breaking (types):** `Button`
  `variant`/`size`, `SheetContent` `side`, `Checkbox` `variant` and `TabsTrigger`
  `variant`/`size` are typed from their exported consts and no longer accept `null`;
  pass `undefined` for the default." v6 migration skill: a hard-bucket row and step,
  with the finder above.

### CTAButton `children` type-checks only with `asChild` [F-093, WI-091]
- files: `src/components/CTAButton/CTAButton.tsx`
- what changed: the `forwardRef` const is now `CTAButtonBase` (displayName still
  "CTAButton"). The export is `CTAButtonBase as CTAButtonComponent`, a type with three
  call signatures:
  - `asChild: true` + one `ReactElement` child;
  - `asChild: boolean` + one `ReactElement` child;
  - anchor mode (`asChild?: false`, `children?: never`). It is listed last so
    `ComponentProps<typeof CTAButton>` and Storybook's `Meta` read it.
  `CTAButtonProps` stays one interface, so a consumer `extends` still works, and it
  gains a JSDoc on `children`. The ref type stays `HTMLElement`, as wave E left it.
  The render body is untouched.
- consumer impact: `<CTAButton text icon>Label</CTAButton>` is now a compile error
  (at runtime the children were silently dropped). So are `asChild` with no child and
  `asChild` with a non-element child, both of which throw at runtime today. Every working
  form still compiles.
- breaking: no (minor per the WI: only calls that rendered wrongly or threw stop compiling).
- verified: probe. The three bad forms were unused `@ts-expect-error`s before and are
  errors now. These compile: anchor with `href`, `asChild` + `<a>`,
  `asChild={isLink}` + `<a>`, `asChild={false}`, an `HTMLAnchorElement` ref,
  `interface X extends CTAButtonProps`, and `ComponentProps<typeof CTAButton>` args.
  CTAButton.stories.tsx (including `<CTAButton asChild {...args}>`) type-checks under
  `npm run lint`. The d.ts emitted into the scratchpad declares the three signatures.
- docs owed: CHANGELOG `[Unreleased]` → Changed: "`CTAButton` `children` now
  type-checks only with `asChild` (it was silently ignored otherwise); pass the label
  as `text`."

### Verification for all three
- No runtime change. An esbuild bundle of the 9 touched components, rendered with
  `renderToStaticMarkup`, covers 99 cases:
  - every Button variant × size, `null` at runtime, and asChild;
  - OutlineButton glow × inverse, and asChild;
  - every ShapeButton shape × variant;
  - DropdownTrigger and TextDropdownTrigger sizes, plus asChild;
  - every BaseText variant, `as`, unstyled, BodyText and HeadingText;
  - every Sheet side, plus the default;
  - Checkbox variant × state;
  - TabsTrigger size × variant;
  - CTAButton size × variant, asChild, and anchor + children.

  `before.json` and `after.json` are byte-identical. Harness: scratchpad
  `f2/entry.tsx` and `f2/snap.mjs`. Probe archived at scratchpad `f2/f2.probe.tsx`.
- `npm run lint` exit 0.
- scoreboard: no metric went up. Raw `var(--ui-*)` in className went 5 → 0 during the
  run; that is F3's parallel Slider work, not this change.
- `.tmp-probe/` was created and deleted; nothing is left in the repo root.
- Not done: no build in a scratch worktree, because the brief says no build. The d.ts
  was checked with `tsc --emitDeclarationOnly` into the scratchpad instead.
- Noticed, not touched: ShapeButton's header says `satisfies Record<string, Shapes>`,
  but the code is `satisfies Record<ShapeButtons, ComponentType<ShapeComponentProps>>`.
  The wording drift predates F2, and the meaning is unchanged.

## DONE
