# HA — horizontal pass: H1 public API + H8 type safety + H9 dead code & duplication

Audited commit `b436647`. Scripts: `docs/audit/_work/scratch/HA/*.cjs` (TypeScript 5.9.3 compiler API from `../dooph-ds-audit-build/node_modules/typescript`). Raw script outputs: `docs/audit/_work/scratch/HA/*.out.txt`.

(Sections are appended as the pass proceeds; final order is 1 Findings, 2 Const table, 3 Type-safety verdicts, 4 Dead-code table, 5 Already covered.)

Section order on disk follows work order (per coordinator): §2 Const table, §2b Public surface, §3 Type-safety verdicts, §4 Dead code & duplication, §1 Findings, §5 Already covered.

## 2. Const table (H1, Rule 1)

Method: `node docs/audit/_work/scratch/HA/consts.cjs` (TS compiler API; every `export const X = <object literal>` in non-story/non-test `src/**`, unwrapping `as const`/`satisfies`) → `scratch/HA/consts.out.txt`. "srv-safe" = the declaring file has no `"use client"` prologue. "same-id type" = an exported type alias named X exists (R1.9). "canonical" = that alias is exactly `(typeof X)[keyof typeof X]` (R1.2). "dist" = name present in `docs/audit/_work/dist-index.d.ts` export lists (R1.10). Props = every PropertySignature whose type references X or a type derived from X, plus a grep for props typed through cva `VariantProps`.

**Counts.** 58 exported object consts. 6 are internal tables, not Rule-1 enums and not public (`SPINNER_DIAMETERS`, `SPINNER_SIZE_VARS`, `SPINNER_STROKE_WIDTHS` spinnerGeometry.ts:28/35/43; `unrounded` engine/polygon.ts:39; `ROLE_AXIS_TOKEN`, `TEXT_VARIANT_CLASS` Text/constants.ts:109/122). The other **52 are public**. Of the 52 (CalendarPresets n/a on the type/prop columns, so /51 there): server-safe 52/52; in dist 52/52; camelCase keys 51/52; same-identifier derived type 44/51; canonical `(typeof X)[keyof typeof X]` form (any name) 49/51; consumed by a prop typed FROM the const 43/51; prop name `variant`/`size`/sanctioned 42/51. **27/52 conform on every column.** Of the 25 others: 9 fail only R1.11 prop naming (`state`/`direction`/`mode`/`sortDirection`/`side`/`checked` — all RC-1, U14-F10), 6 are typed through cva instead of the const (U6-F14 + HA-F1), 6 fail R1.9 identifier (U3-F4, U9-F11), and IconSizes, DS_COLOR_TOKENS, Shapes, CalendarPresets are special cases flagged in the row. Every non-conforming row carries a flag with its owning finding. Two value catalogues (`CalendarPresets`, `DS_COLOR_TOKENS`) are not option enums; columns that do not apply say n/a.

| const | file:line | srv-safe | keys camel | same-id type | canonical | dist | consuming prop(s) | prop name (R1.11) | flag |
|---|---|---|---|---|---|---|---|---|---|
| AIToolPartVariant | AIChat/constants.ts:14 | Y | Y | Y | Y | Y | AIToolPart.variant | ok | |
| AIToolPartState | AIChat/constants.ts:28 | Y | Y | Y | Y | Y | AIToolPart.state | `state` ✗ | U11-F1, U14-F10 |
| AIThinkingPartState | AIChat/constants.ts:43 | Y | Y | Y | Y | Y | AIThinkingPart.state | `state` ✗ | U11-F1 |
| RollDirection | AnimatedText/constants.ts:12 | Y | Y | Y | Y | Y | Fade/Roll/RollHover·Text.direction | `direction` ✗ | U14-F10 |
| RevealDirection | AnimatedText/constants.ts:27 | Y | Y | Y | Y | Y | RevealChangeText.direction | `direction` ✗ | U14-F10 |
| AvatarSize | Avatar/Avatar.tsx:4 | Y (not constants.ts) | Y | Y | Y | Y | Avatar.size | ok | U12-F14 |
| ButtonVariant | Button/constants.ts:8 | Y | Y | Y | Y | Y | Button.variant — typed from `VariantProps<typeof buttonVariants>`, NOT the const | ok | **HA-F1** |
| ButtonSize | Button/constants.ts:18 | Y | Y | Y | Y | Y | Button.size — via VariantProps | ok | **HA-F1** |
| DatePickerMode | Calendar/constants.ts:13 | Y | Y | Y | Y | Y | Calendar.mode, DatePicker.mode (discriminant `typeof DatePickerMode.x`) | `mode` ✗ | U7-F6 |
| CalendarPresets | Calendar/constants.ts:89 | Y | Y (nested `days.three`…) | n/a (catalogue of `CalendarPreset` objects) | n/a | Y | CalendarPresetItem.preset, `presets` (as values) | n/a | |
| CheckboxChecked | Checkbox/constants.ts:4 | Y | Y | Y | Y | Y | **none** — `Checkbox.checked` is Radix `CheckedState`; the const is only value-compatible | `checked` (RC-1) | U6-F25 |
| CheckboxVariant | Checkbox/constants.ts:12 | Y | Y | Y | Y | Y | Checkbox.variant — via VariantProps | ok | U6-F14 |
| CopyButtonVariant | CopyButton/constants.ts:8 | Y | Y | Y | Y | Y | CopyButton.variant | ok | |
| CTAButtonVariant | CTAButton/constants.ts:4 | Y | Y | Y | Y | Y | CTAButton.variant | ok | |
| CTAButtonSize | CTAButton/constants.ts:11 | Y | Y | Y | Y | Y | CTAButton.size | ok | |
| DropdownCaretVariant | DropdownCaret/constants.ts:3 | Y | Y | Y | Y | Y | DropdownCaret.variant | ok | |
| TextDropdownSize | DropdownTrigger/constants.ts:8 | Y | Y | Y | Y | Y | TextDropdownTrigger.size | ok | |
| IconSizes (public as `IconSize`) | Icons/BaseIcon.tsx:9 | Y (not constants.ts) | Y | Y (`IconSizes`), public name set by alias | ✗ `… \| string` | Y | IconProps.size (`IconSizes \| number`) | ok | U10-F8 |
| InputVariant | Input/constants.ts:13 | Y | Y | Y | Y | Y | Input.variant (discriminated) | ok | |
| LoadingSpinnerVariant | LoadingSpinner/constants.ts:4 | Y | Y | Y | Y | Y | LoadingSpinner.variant | ok | |
| LoadingSpinnerColor | LoadingSpinner/constants.ts:16 | Y | Y | Y | Y | Y | LoadingSpinner/ShapeMorphSpinner/ProgressIndicator.color (`X \| (string & {})`) | `color` (R1.4) | keys are names, not `var()` strings: U2-F3, U9-F7 |
| LoadingSpinnerSize | LoadingSpinner/constants.ts:23 | Y | Y | Y | Y | Y | LoadingSpinner/ShapeMorphSpinner/ProgressIndicator/AIContextGauge.size | ok | |
| DropdownMenuSelectType | Menu/constants.ts:15 | Y | Y | Y | Y | Y | DropdownMenu.selectType, TypeableDropdownTrigger.selectType | sanctioned | |
| DropdownMenuItemVariant | Menu/constants.ts:26 | Y | Y | Y | Y | Y | DropdownMenuItem.variant | ok | |
| DropdownMenuSegmentVariant | Menu/constants.ts:37 | Y | Y | Y | Y | Y | DropdownMenuSegment.variant | ok | |
| MorphRotationShapeMode | MorphRotationShape/constants.ts:3 | Y | Y | Y | Y | Y | MorphRotationShape.mode (discriminant) | `mode` ✗ | U14-F10 |
| ProgressIndicatorVariants | ProgressIndicator/constants.ts:8 | Y | Y | ✗ (`ProgressIndicatorVariant`) | form ok, other name | Y | ProgressIndicator.variant | ok | U9-F11 |
| SegmentedVariant | SegmentedTabSelect/constants.ts:13 | Y | Y | Y | Y | Y | SegmentedTabSelect.variant | ok | |
| SegmentedSize | SegmentedTabSelect/constants.ts:26 | Y | Y | Y | Y | Y | SegmentedTabSelect.size | ok | |
| ShapeButtons | ShapeButton/constants.ts:14 | Y | Y | Y | Y | Y | ShapeButton.shape | sanctioned | |
| ShapeButtonVariant | ShapeButton/constants.ts:27 | Y | Y | Y | Y | Y | ShapeButton.variant | ok | |
| Shapes | Shapes/index.ts:15 | Y (barrel) | Y | Y | Y | Y | **none** — value never read; type only bounds `ShapeButtons` (`satisfies Record<string, Shapes>`) | n/a | U10-F12; §4 row D3 |
| SheetSide | Sheet/constants.ts:8 | Y | Y | Y | Y | Y | SheetContent.side — via VariantProps | sanctioned | **HA-F1** |
| SidebarIconSide | SidebarWithHoverIcon/constants.ts:8 | Y | Y | Y | Y | Y | SidebarWithHoverIcon.side | `side` (list names SheetContent only) | U14-F10 |
| SliderVariant | Slider/constants.ts:22 | Y | Y | Y | Y | Y | Slider*.variant (discriminated) | ok | |
| StickerVariant | Sticker/constants.ts:21 | Y | Y | Y | Y | Y | Sticker.variant (discriminated) | ok | |
| StickerSize | Sticker/constants.ts:38 | Y | Y | Y | Y | Y | Sticker.size | ok | |
| TableSortDirection | Table/constants.ts:4 | Y | Y | Y | Y | Y | TableHeaderCell.sortDirection | `sortDirection` ✗ | U14-F10 |
| TabSize | Tabs/constants.ts:8 | Y | Y | Y | Y | Y | TabsTrigger.size — via VariantProps | ok | U6-F14 |
| TabVariant | Tabs/constants.ts:36 | Y | Y | Y | Y | Y | TabsTrigger.variant — via VariantProps | ok | U6-F14 |
| TextVariant | Text/constants.ts:17 | Y | Y | Y | Y | Y | BaseText.variant | ok | |
| Fonts | Text/constants.ts:32 | Y | Y | ✗ (`Font`) | form ok | Y | BaseText.font (open) | R1.4 | U3-F4 |
| FontSizes | Text/constants.ts:44 | Y | Y | ✗ (`FontSize`) | form ok | Y | BaseText.fontSize (open) | R1.4 | U3-F4 |
| FontWeights | Text/constants.ts:58 | Y | Y | ✗ (`FontWeight`) | form ok | Y | BaseText.fontWeight (open) | R1.4 | U3-F4 |
| Tracking | Text/constants.ts:67 | Y | Y | ✗ (`TrackingValue`) | form ok | Y | BaseText.letterSpacing (open) | R1.4 | U3-F4 |
| FontAxes | Text/constants.ts:88 | Y | Y | ✗ (`FontAxis`) | form ok | Y | BaseText.axes keys | R1.4 | U3-F4 |
| ToastTypes | Toast/constants.ts:4 | Y | Y | Y | Y | Y | ToastRoot.variant, `toast({variant})` | ok (const name ≠ `*Variant`) | U8-F10 |
| ToggleVariant | Toggle/constants.ts:16 | Y | Y | Y | Y | Y | ToggleSwitch/ToggleSwitchItem.variant | ok | |
| ToggleSize | Toggle/constants.ts:28 | Y | Y | Y | Y | Y | ToggleSwitch/ToggleSwitchItem.size | ok | |
| TooltipTypes | Tooltip/constants.ts:4 | Y | Y | Y | Y | Y | TooltipContent.variant | ok (const name ≠ `*Variant`) | U8-F10 |
| WavyDividerVariant | WavyDivider/constants.ts:4 | Y | Y | Y | Y | Y | WavyDivider.variant | ok | |
| DS_COLOR_TOKENS | utils/color.ts:18 | Y | ✗ 12/17 kebab (`danger-primary`, `text-secondary`, `surface-page`, `prominent-color-alt`, …) | ✗ (`DsColorToken = keyof typeof …` — the KEYS) | ✗ | Y | Slider/Sticker(custom)/LinearProgressIndicator/AIModelSelect.color via `DsColor` | `color` (R1.4) | U2-F3 (lookup-table design; the kebab keys are why `color="danger-primary"` has to be a string literal) |

**Hand-written string-literal union types (R1.2 / R9.5).** Exported: 1 — `DayRangePosition` (Calendar/rangeSelection.ts:40, `"none" | "start" | "middle" | "end" | "single"`), an internal return type, not a prop, not public. Local: `RevealPhase` (RevealChangeText.tsx:71, state machine). Inline literal unions on prop signatures: `TypeableDropdownTriggerProps["data-state"]` (DropdownTrigger.tsx:137, mirrors Radix's attribute) and `IconProps["aria-hidden"]` (BaseIcon.tsx:25, DOM type). **Verdict: no public discrete-option prop is a hand-written union — clean.**

**Discrete props typed via cva `VariantProps` instead of the const:** Button.variant + Button.size (Button.tsx:110), SheetContent.side (Sheet.tsx:123), Checkbox.variant (Checkbox.tsx:73), TabsTrigger.variant + TabsTrigger.size (Tabs.tsx:36). U6-F14 recorded the last two; Button and SheetContent are new → HA-F1. Every other const-backed prop is typed from the const.

## 2b. Public surface (H1)

Method: `node docs/audit/_work/scratch/HA/surface.cjs` → `scratch/HA/surface.out.txt`. It takes `checker.getExportsOfModule(src/index.ts)`, resolves each alias to its declaration, classifies it, and records the non-story `src` modules that import it plus the consumer docs (`skills/**/*.md`, `README.md`) that name it (word-boundary match).

**Root vs dist.** `src/index.ts` resolves to **443** names, and `dist/index.d.ts` exports the same **443** (0 missing, 0 extra). Shape: 245 components (88 icons, 12 shapes + `BaseShape`/`ShapeClipPath`), 52 enum consts, 117 types, 8 functions, 4 cva recipes, 16 data tables/literals, 1 hook. `src/index.ts` bypasses a folder barrel for 3 folders (6 deep paths: WavyDivider, LoadingSpinner, ProgressIndicator component + constants files; owned by U2-F14/U9-F12).

**Non-component, non-enum VALUE exports (the "is this internal?" list).** 29 rows. "docs" = consumer docs naming it.

| export | kind | defined | src importers (non-story) | docs | verdict / owner |
|---|---|---|---|---|---|
| `cn` | fn | utils/cn.ts:31 | ~60 | usage SKILL.md | intended public |
| `resolveDsColor` | fn | utils/color.ts:52 | AIModelSelect, LinearProgressIndicator, Slider, Sticker | — | explicit in src/index.ts:51; undocumented (U2-F3, U13-F10) |
| `buttonVariants` | cva | Button.tsx:37 | Toast.tsx | — | **HA-F2** |
| `stickerVariants` | cva | Sticker.tsx:31 | — | — | **HA-F2** |
| `checkboxVariants` | cva | Checkbox.tsx:33 | — | — | U6-F14 (+ HA-F2 pattern) |
| `tabTriggerVariants` | cva | Tabs.tsx:28 | — | — | U6-F14 (+ HA-F2 pattern) |
| `serializeAxes` | fn | Text/textStyle.ts:37 | — (textStyle.ts only) | — | U3-F7 |
| 12 × `*_SHAPE_PATH` | string | Shapes/*Shape.tsx:3 | shapePaths.ts | — | U2-F4 |
| `SHAPE_VIEWBOX_SIZE` | number | Shapes/BaseShape.tsx:15 | — (own file) | — | U2-F4 |
| `SHAPE_MORPH_SPINNER_SHAPES` | array | ShapeMorphSpinner.tsx:24 | — (own default) | — | named deliberately in its barrel; mutable default → §3 row T9 |
| `DEFAULT_CALENDAR_PRESETS` | array | Calendar/constants.ts:118 | — | usage SKILL.md | intended; mutable (U7-F11) |
| `DEFAULT_SPLIT_TRIGGER_PRESETS` | array | Calendar/constants.ts:128 | DatePickerSplitTrigger | usage SKILL.md | intended; mutable (U7-F11) |
| `isSameDay`, `startOfDay` | fn | Calendar/dateUtils.ts:31,19 | Calendar/*, DatePicker/* | — | U7-F2 / U2-F4 |
| `formatRangeLabel`, `formatSingleLabel` | fn | Calendar/dateFormat.ts:42,30 | DatePicker/* | — | U7-F2 / U2-F4 |
| `formatTriggerLabel` | fn | DatePickerTrigger.tsx:40 | — | — | U7-F2 / U2-F4 |
| `useToast` | hook | Toast.tsx:317 | — (stories only) | — | intended public; undocumented (U8-F9) |

Beyond what units recorded, the repo-wide scan adds **`buttonVariants` and `stickerVariants`**: all four exported cva recipes, not just the two U6-F14 lists, are undocumented public API. `stickerVariants` also bypasses Sticker's R1.6 guard (see HA-F2). No exported hook, geometry helper or engine function leaks: `useChangeSwap`, `getSpinnerGeometry`, `waveGeometry`, `getShapePath` and `engine/*` are all absent from the 443.

**`<Name>Props` check.** 245 exported components; 90 have a matching exported `<Name>Props`. The other 155 break down as follows:
- **Share a family props type (fine, 105):** `BaseIcon` + 88 icons use `IconProps`; 12 shapes use `ShapeProps`; `SliderContinuous`/`SliderStepped` use `SliderProps`; `AIPromptInputToolbarStart`/`End` use `AIPromptInputToolbarProps`.
- **Pure pass-through (fine, 43):** each is a Radix primitive re-bound under a DS name, or a `forwardRef` whose props are exactly Radix's or `HTMLAttributes<HTMLDivElement>`. Members: CheckboxIndicator; Tabs, TabsList, TabsContent; DropdownMenuTrigger, Portal, Group, Sub, RadioGroup, MultiSelectItem, Label, PlainItem, RadioSelectItem, Separator; Modal, ModalTrigger, Portal, Overlay, Close, Title, Description; Sheet, SheetTrigger, Close, Portal, Overlay, Title, Description; Popover, PopoverTrigger, Anchor, Close, Portal; TableHeader, TableRow, TableCell, TablePlaceholder; ToastAction, ToastClose, ToastViewport; Tooltip, TooltipProvider, TooltipTrigger. `ComponentPropsWithoutRef<typeof X>` loses nothing for these.
- **Internal leaks (2):** `BaseShape`, `ShapeClipPath` (U2-F4).
- **DS-authored props with no exported type (5):**

| component | DS-added props | where |
|---|---|---|
| DropdownMenu | `selectType` | DropdownMenu.tsx:58-61 |
| DropdownMenuContent | `dismissOnFocusLoss`, `focusOnOpen`, `matchTriggerWidth`, `onOpenAutoFocus`, `portal`, `portalProps` | DropdownMenu.tsx:96-104 |
| DropdownMenuItem | `variant` | DropdownMenu.tsx:204-206 |
| ModalContent | `withOverlay` | Modal.tsx:59-62 |
| SheetContent | `side`, `withOverlay` | Sheet.tsx:122-127 |

Their overlay siblings do export one (`PopoverContentProps`, `TooltipContentProps`, `ToastRootProps`, `DropdownMenuSectionProps`, `DropdownMenuSegmentProps`). U8-F14 (S4 batch) recorded Modal/Sheet. The three Menu parts are new, and they are the ones with the most DS-authored props (DropdownMenuContent has 6). Folded into HA-F3 (S4).

## 3. Type-safety verdicts (H8)

Method. The grep file `greps/h8-typesafety.txt` (133 lines) is mostly prose. 71 of its lines are comments, the word "any" in docs, or `import * as`. To cover everything, the verdicts below come from an AST scan: `node scratch/HA/escapes.cjs` → `escapes.out.txt`. It lists every `as` (excluding `as const`), `as unknown as`, non-null `!`, `any` keyword and `@ts-*` directive in non-story `src`. Every real hatch in the grep file is included. `node scratch/HA/casttypes.cjs` then classifies each non-CSS cast by source type vs target type (REDUNDANT / FROM-ANY / UPCAST / NARROW). Stories: only trivial hatches (AIChatStreaming.stories.tsx:240 `m.parts.at(-1)!`, AIModelSelect.stories.tsx:113 `id as StoryModelId`, OutlineButton.stories.tsx:90 CSS-var cast), all justified.

**Totals (non-story src):** `any` keyword 0; `@ts-ignore` 0; `@ts-expect-error` 1; `as unknown as` 1; non-null `!` 4 (2 lines); `as X` 62 (15 CSSProperties, 11 ref, 11 component/ElementType, 25 other).

| # | pattern | sites | verdict |
|---|---|---|---|
| T1 | `{ "--x": … } as CSSProperties` | 15: AIModelSelect.tsx:90, FadeChangeText.tsx:69, RevealChangeText.tsx:233, RollChangeText.tsx:65, RollHoverText.tsx:55,81, RollingDigitsText.tsx:123, UnderlineLinkText.tsx:49, LinearProgressIndicator.tsx:49, LoadingSpinner.tsx:255, MorphRotationShape.tsx:347, SidebarWithHoverIcon.tsx:140, Slider.tsx:330, Table.tsx:31, BaseText.tsx:95 | **Justified** for 13: `CSSProperties` has no index signature for custom properties, so this is the standard idiom. LoadingSpinner.tsx:255 carries no custom property (cast is a no-op). BaseText.tsx:95 is needed only because `style` is `any` there (T4). Both harmless. |
| T2 | `(asChild ? Slot : "button") as ElementType` + `XBase as XComponent` + `ref as ForwardedRef<HTMLElement>` (polymorphic scaffold) | 6 components × 2–3 casts: Button.tsx:126,129,139; DropdownTrigger.tsx:53,56,80,314,317,345; OutlineButton.tsx:86,155,297; ShapeButton.tsx:116,122,160; BaseText.tsx:88,106,130; RollingDigitsText.tsx:306 | **Justified individually.** `forwardRef` cannot carry a generic, so the base is cast to a generic call signature (TS limitation). `casttypes` shows the 5 `ref as ForwardedRef<HTMLElement>` casts are REDUNDANT (source already `ForwardedRef<HTMLElement>`). **The scaffold's real cost is T4 → HA-F4.** |
| T3 | lookup-table narrowing `color as LoadingSpinnerColor` / `color as DsColorToken` then `?? color` | LoadingSpinner.tsx:35, ShapeMorphSpinner.tsx:67, utils/color.ts:57 | **Justified given the design:** the fallback makes a miss safe. The design itself is U2-F3 (and U9-F7 for the private copies). |
| T4 | props that are `any` inside the component body (implicit, no keyword) | `node scratch/HA/polyany.cjs`: Button.tsx:125 (4/5 bindings `any`), CopyButton.tsx:30 (5/6), DropdownTrigger.tsx:52 (3/4), :304 (4/5), OutlineButton.tsx:73 (7/8), ShapeButton.tsx:105 (5/6), BaseText.tsx:62 (12/13) — 40 bindings | **Finding HA-F4.** Three casts exist only to re-type `any`: ShapeButton.tsx:117-118 and BaseText.tsx:80 are FROM-ANY. U4-F2 saw this for CopyButton's public type only. |
| T5 | redundant enum casts | Slider.tsx:296 `variant as SliderVariant` (REDUNDANT); ProgressIndicator.tsx:298 `size as SpinnerSizeKey` (REDUNDANT); LoadingSpinner.tsx:300 `size as SpinnerSizeKey` (same union) | **S4, folded into HA-F5.** These are no-ops today. Because `as` accepts either direction of assignability, the two `SpinnerSizeKey` casts would also silence the missing-geometry error if a key were added to `LoadingSpinnerSize` without a `SPINNER_DIAMETERS` entry. |
| T6 | `e as never`, `ref as React.Ref<HTMLButtonElement>` | CopyButton.tsx:52,72 | Covered: U4-F2, U4-F12. |
| T7 | `ref as { current: T \| null }`, `ref as RefCallback`, `ref as MutableRefObject` (hand-rolled ref merge) | AIPromptInput.tsx:177; OutlineButton.tsx:95,97 | Covered: U11-F7 (ref merging hand-rolled four ways). |
| T8 | `props as RollingDigitsTextBaseProps & {…}` | RollingDigitsText.tsx:237 | UPCAST (safe). The union it reads is covered by U3-F6. |
| T9 | mutable public default arrays | `SHAPE_MORPH_SPINNER_SHAPES: ComponentType<ShapeProps>[]` (ShapeMorphSpinner.tsx:24, default of `shapes` at :50); `DEFAULT_CALENDAR_PRESETS`/`DEFAULT_SPLIT_TRIGGER_PRESETS` (Calendar/constants.ts:118,128) | Calendar pair covered by U7-F11. The spinner array is the same defect, not in U7-F11: a consumer `.reverse()`/`.push()` rewrites every spinner's default. Added to HA-F5. |
| T10 | `{ onOpenAutoFocus } as ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>` | DropdownMenu.tsx:155-158 (+ redeclared prop :102) | **Justified, but it is a private-API dependency. Corrects U5-F11.** Radix 2.1.24 lists `onOpenAutoFocus` in `MenuContentImplPrivateProps` and removes it from Content's public props (`node_modules/@radix-ui/react-menu/dist/index.d.ts:51,57-58`). `tsc -p scratch/HA/tsconfig.radix.json` → `TS2322 … Property 'onOpenAutoFocus' does not exist … Did you mean 'onCloseAutoFocus'?` (`probe-radix.out.txt`). So U5-F11's premise ("redeclares a prop Radix Content already has") and its fix ("pass `onOpenAutoFocus` directly") are wrong: the direct form does not compile. The cast works because Radix spreads the private prop through at runtime (`react-menu/dist/index.mjs:179,266`), and a Radix minor can remove that silently. |
| T11 | `event.target as Node \| null` | DropdownMenu.tsx:143 | **Justified** (DOM `EventTarget`→`Node` for `document.contains`). |
| T12 | `children as ReactElement` after `isValidElement` | CTAButton.tsx:122 | **Justified** (narrows off `ReactPortal`). |
| T13 | vendored engine casts | engine/cubic.ts:80-86 (`b as number` ×7), engine/polygon.ts:172-174 (`null as Cubic \| null`, `[] as Cubic[]`) | **Justified:** faithful port, polygon.ts:6-9 / cubic.ts header "Keep this file a faithful port" (R12.9). |
| T14 | `bounds!.from!`, `bounds!.to!` | Calendar/dateFormat.ts:91-92 | Guarded by `hasFrom`/`hasTo` computed from the same expressions. Covered by U7-F11. |
| T15 | `// @ts-expect-error TS5097` + `waveGeometryModule as unknown as Record<string, unknown>` | ProgressIndicator/waveGeometry.test.ts:5,42 | Covered: U2-F10, U9-F13. |
| T16 | cva `VariantProps` admitting `null` on discrete props | Button.tsx:110, Sheet.tsx:123 (+ Checkbox.tsx:73, Tabs.tsx:36) | **Finding HA-F1.** |

**Discriminated unions vs runtime guards (R1.6).** For each union: does the runtime guard test exactly the condition the union encodes?

| union | union condition | runtime guard | match? |
|---|---|---|---|
| Input icon variants (Input.tsx:51-60 / :99) | icon variant ⇒ `icon: ReactNode` present | `hasIcon && icon == null` throws | **No.** U6-F23: `icon={null}` passes the union and throws; `icon={false}` passes both and renders an empty slot. |
| Slider `custom` (Slider.tsx:27-43 / :288) | `custom` ⇒ `color: DsColor` | `custom && !color` throws | **No.** U6-F23: `color=""` passes the union and throws. |
| Sticker `custom` (Sticker.tsx:58-69 / :104-109) | `custom` ⇒ `color: DsColor`; other variants `color?: never` | `custom && !color` throws | **No — same gap as Slider, not in U6-F23's locations:** `<Sticker variant={StickerVariant.custom} color="" />` compiles (`DsColor` = token \| `string & {}`) and throws. Add Sticker.tsx:64-69,104 to U6-F23. |
| ProgressIndicator `progress` (ProgressIndicator.tsx:44-49 / :292) | `progress: number` (doc: 0..1) | `progress < 0 \|\| progress > 1` throws | **No:** NaN passes (U9-F10); JSDoc still says "throws in development" (U9-F9). |
| Calendar / DatePicker `mode` (Calendar.tsx:47-58, DatePicker.tsx:35-50) | `mode` discriminates `selected`/`value` shape | warn, then incidental TypeError | **No:** U7-F1. |
| MorphRotationShape `mode` (MorphRotationShape.tsx:94-120 / :143-153) | 3-arm union on `mode` | `!Object.values(Mode).includes(mode)` throws; `shapes.length < 2` throws; controlled + non-integer `activeIndex` throws | **Mode guard exact.** The other two check constraints a type cannot express (integer, min length), so they are correctly stricter than the union. `shapes` identity is U10-F14. |
| RollingDigitsText `smallDecimals` (RollingDigitsText.tsx:76-85) | `smallDecimals` ⇒ `smallDecimalsComponent` | none (renders inline decimals) | **No guard:** U3-F6. |
| cva `variant`/`size`/`side` (Button, SheetContent, Checkbox, TabsTrigger) | typed `… \| null` | none; cva treats `null` as "no variant" | **No:** HA-F1. |

## 4. Dead code & duplication (H9)

### 4a. Dead-code table

| # | check | method | result | verdict |
|---|---|---|---|---|
| D1 | unused NON-exported functions/consts/params | `tsconfig.json` sets `noUnusedLocals: true` + `noUnusedParameters: true`; baseline `npm run lint` (= `tsc --noEmit`) exits 0 (`_work/baseline.md`) | 0 | **clean** (compiler-enforced) |
| D2 | exported, NOT public, never imported by another src module | `node scratch/HA/deadexports.cjs` → `deadexports.out.txt` (TS checker; public set = resolved exports of src/index.ts; importers = every import/re-export declaration in src incl. stories) | 36 symbols. Two groups follow. | see D2a / D2b |
| D2a | …with **0 references anywhere** | same | engine/polygon.ts:556 `createCircle`, :573 `createRectangle`, :614 `createStar`; engine/utils.ts:31 `ptDistanceSquared`, :141 `findMinimum`, :16 `twoPi` | **Not a finding.** Vendored upstream API kept for diffability. The file contracts say "Keep this file a faithful port" (polygon.ts:6-9, utils.ts:6-9; R12.9). |
| D2b | …used only inside their own file (unneeded `export`) | same (`own-file-refs ≥ 1`) | 30. Includes: `daysInMonth`, `firstWeekdayOfMonth`, `WEEK_STARTS_ON`, `WEEKS_IN_GRID`, `CELLS_IN_GRID` (Calendar/dateUtils.ts:12-45); `RangeClickResult`, `DayRangePosition` (rangeSelection.ts:13,40); `SPINNER_DIAMETERS`, `SPINNER_SIZE_VARS`, `SPINNER_STROKE_WIDTHS`, `SPINNER_SPOKES_DURATION` (spinnerGeometry.ts:28-71); `ParsedDigits`, `ChangeSwapKey`, `ChangeSwap`; `ACTIVE_INDICATOR_SCALE`, `Segment` (MorphRotationShape/geometry.ts:5,7); `ToggleOptionVariantProps`; `MaterialWaveGeometry`, `WavyTrackGeometry` (test-only); 11 engine helpers | **Not a finding.** Nothing reaches the package root (all behind barrels that don't list them). Cost is nil. |
| D3 | public export whose VALUE is never read and no DS API accepts | `surface.cjs` + `rg -n "Shapes\.[a-z]" src skills` → 0 | `Shapes` const (Shapes/index.ts:15-28). Its type is used once, as the `satisfies` bound in ShapeButton/constants.ts:20. No component takes a `Shapes` value: MorphRotationShape/ShapeMorphSpinner take components, ShapeButton takes `ShapeButtons`. | **S4, in HA-F5.** A dot-access enum that selects nothing invites `<ShapeButton shape={Shapes.arrow}>`, a value ShapeButton does not support (only its 5-key subset). U10-F12 owns the const's location only. |
| D4 | DS-declared props never read by the component | `node scratch/HA/deadprops2.cjs` → `deadprops2.out.txt`. For every component function (forwardRef callback or PascalCase fn returning JSX): param type's src-declared props vs destructured bindings (symbol-reference count incl. shorthand) / `props.x` reads / rest destination. Polymorphic bases (all props `any`, HA-F4) checked by hand against their `*OwnProps`. | After triage **0**. Six raw hits were artefacts: RollingDigitsText.tsx:229 (destructured via `props as …` at :237), BaseIcon `aria-hidden` (string-key binding, read at :46), DropdownTrigger.tsx:144 `data-*` and VerificationCodeInput.tsx:47 `aria-label` (intentionally forwarded to the DOM root). No DS-declared prop reaches a Radix primitive or DOM element through `...rest`. | **clean.** Props that are READ but have no effect cannot be seen by a read-scan and remain the units' findings: U8-F1 (`ToastProvider duration`), U10-F1 (`fillColor` on Pentagon/Puff), U4-F18 (CTAButton `children`), U9-F17 (`value: null`). |
| D5 | `ds-*` classes in `src/styles/*.css` used by no src module | node one-off over 98 `.ds-*` selectors (word-boundary, excluding `-` continuation) vs non-story `src/**/*.ts(x)`, stories, `skills/**` + README | 3: `ds-selection` (docs 0), `ds-my-ui-xs` (docs 0), `ds-focus-ring` (only comment mentions: DropdownTrigger.tsx:204, DatePickerTrigger.tsx:66) | Already covered: **U1-F9** (same three). Independently confirmed. |
| D6 | src files imported by nothing | `deadexports.cjs` file graph (import + re-export edges, resolved with `ts.resolveModuleName`) | `src/components/ProgressIndicator/waveGeometry.test.ts` only. (`Shapes/svgs/*.svg` are not code: U10-F2.) | Already covered: U2-F10, U9-F13. |
| D7 | vestigial default exports | out of scope here | — | Already covered: U2-F5, U10-F4. |

### 4b. Duplication

Method: `node scratch/HA/similarity.cjs` → `similarity.out.txt`. The TS scanner tokenizes every non-story src file; identifiers become ID, strings STR, numbers NUM, comments are dropped. It then computes Jaccard and containment over 12-token shingles for file pairs, and 8-token shingles for every function of 40+ tokens. Icons, barrels and the vendored engine are excluded. Also run: `smallhelpers.cjs` (exact normalized body match, top-level helpers ≥15 tokens) and `smallhelpers2.cjs` (5-shingle Jaccard ≥0.6, helpers 12–400 tokens).

| pair | score | verdict |
|---|---|---|
| FadeChangeText.tsx ~ RollChangeText.tsx (file and forwardRef body) | J=1.00 (260 tokens each; function J=1.00) | real duplicate. Already covered: **U3-F8**. |
| 11 of 12 `Shapes/*Shape.tsx` (three identical-template groups) | J=1.00 within group | real duplicate. Already covered: **U10-F3**. |
| Modal.tsx ~ Sheet.tsx | J=0.40, C=0.73 | real duplicate (Overlay/Title/Description/content shell). Already covered: **U8-F7**. |
| LoadingSpinner.tsx:34 `resolveColor` ~ ProgressIndicator.tsx:38 `resolveColor` (+ ShapeMorphSpinner inline) | J=0.60 | real duplicate. Already covered: **U2-F3 / U9-F7**. The only cross-file helper pair the fuzzy scan finds. |
| all `*/constants.ts` pairs (J 0.4–1.0) | — | **not a duplicate:** the mandated `X = {…} as const; type X = (typeof X)[keyof typeof X]` template (R1.2/R1.9). |
| UserMessageHeader.tsx ~ ShimmerText.tsx (J=0.74); DropdownMenuLabel ~ SheetOverlay (fn J=0.74); ToastAction ~ ToastDismiss (Toast.tsx:143 vs :182, fn J=1.00) | — | **not a duplicate:** the 10-line `forwardRef` + `cn(base, className)` + spread wrapper that R2.1 prescribes. The class strings and primitives differ. |
| intra-function pairs (CalendarGrid.tsx:126/128, LoadingSpinner.tsx:128/135, MorphRotationShape.tsx:267/269, RollingDigitsText.tsx:215/216) | 0.77–0.92 | scan artefact (a callback nested inside its parent). |
| polymorphic scaffold: `forwardRef<HTMLElement, P<ElementType>>` + `(asChild ? Slot : "button") as ElementType` + `ref as ForwardedRef<HTMLElement>` + `Base as XComponent` | hand-copied in Button, DropdownTrigger, TextDropdownTrigger, OutlineButton, ShapeButton, BaseText (+RoleText) | **real duplicate with a named cost:** every copy carries the `any` collapse (HA-F4). One shared generic helper type would remove 6 copies and the bug class together. Folded into HA-F4's recommendation. |

No other near-identical helper pairs: `smallhelpers.cjs` found 0 exact matches, and `smallhelpers2.cjs` found only the `resolveColor` pair.

## 1. Findings

### HA-F1: `Button` (`variant`, `size`) and `SheetContent` (`side`) type their discrete props from cva `VariantProps`, which admits `null`. cva treats `null` as "no variant", so `<Button variant={null}>` compiles and renders with no colour classes, and `<SheetContent side={null}>` renders with no position.
- severity: S2
- category: type-safety
- rules: [R1.2, R1.1]
- scope: consumer-visible
- confidence: plausible
- verified_by: "(1) consts.cjs + `rg -n VariantProps src` → props typed via VariantProps: Button.tsx:110, Sheet.tsx:123, Checkbox.tsx:73, Tabs.tsx:36; every other const-backed prop is typed from the const. (2) Built d.ts: dist/components/Button/Button.d.ts:6-7 `variant?: \"text\" | … | \"ghost\" | null | undefined; size?: … | null | undefined`; dist/components/Sheet/Sheet.d.ts:34 `side?: \"bottom\" | \"left\" | \"right\" | \"top\" | null | undefined`. (3) In ../dooph-ds-audit-build: `node -e` with dist/index.cjs: `buttonVariants({variant:null,size:null})` → no bg-/text- colour class, no h-button; `renderToStaticMarkup(<Button variant={null}>x</Button>)` → `<button class=\"… text-style-button h-button px-3\">` (base + default size only, no variant classes). cva semantics: `cva('base',{variants:{variant:{a:'va'}},defaultVariants:{variant:'a'}})({variant:null})` → `\"base\"` (default dropped)."
- locations:
  - src/components/Button/Button.tsx:110-116
  - src/components/Button/Button.tsx:124-131
  - src/components/Sheet/Sheet.tsx:120-141
  - (same pattern, already U6-F14) src/components/Checkbox/Checkbox.tsx:70-73, src/components/Tabs/Tabs.tsx:33-36
- evidence: |
    Button.tsx:110  type ButtonOwnProps = VariantProps<typeof buttonVariants> & {
    Button.tsx:130        className={cn(buttonVariants({ variant, size }), className)}
    Sheet.tsx:123       VariantProps<typeof sheetVariants> & {
    Sheet.tsx:131       side = SheetSide.right,          ← default applies to undefined only; null passes through
    Sheet.tsx:139       className={cn(sheetVariants({ side }), className)}
    Toggle.tsx:53-54    variant?: ToggleVariant;  size?: ToggleSize;   ← the const-typed pattern the other 40+ props use
- impact: The type that consumers see is the recipe's, not the const's, so `null` is a documented-valid value. It is also a natural one (`variant={active ? ButtonVariant.primary : null}`). It produces a transparent, colourless Button, or a `fixed z-50` Sheet with no inset, width or slide animation. Nothing warns. The const and the cva keys are also two sources of truth. A key added to `buttonVariants` becomes a valid prop value with no `ButtonVariant` member, so callers must write a string literal (R1.1). U6-F14 recorded TabsTrigger/Checkbox typing but not the runtime consequence. Button is the most-used component in the package.
- recommendation: Type `variant`/`size`/`side` from the consts (`variant?: ButtonVariant; size?: ButtonSize; side?: SheetSide`), as Toggle/Sticker/Slider already do, and keep cva as an implementation detail. Sticker.tsx:70-73 already records why intersecting `VariantProps` is wrong. Merge with U6-F14 at dedupe.
- breaking: minor
- contract: src/components/Button/Button.tsx "`variant` + `size` map through `buttonVariants` (cva)" → consistent (the header describes mapping, not prop typing)
- remediation: tbd
- related: [U6-F14, U14-F14]

### HA-F2: All four exported cva recipes (`buttonVariants`, `stickerVariants`, `checkboxVariants`, `tabTriggerVariants`) are undocumented public API. `stickerVariants({ variant: "custom" })` returns a colourless class string, bypassing the R1.6 throw that `Sticker` enforces.
- severity: S3
- category: api-design
- rules: [R1.6, R8.19]
- scope: consumer-visible
- confidence: plausible
- verified_by: "surface.cjs → kind `cva-recipe`: 4 exports, docs=[] for all four (skills/**/*.md + README.md, word-boundary); src importers: buttonVariants ← Toast.tsx only; the other three ← none. Sticker.tsx:38-45 shows `custom: \"\"` in the recipe; the throw lives only in the component (Sticker.tsx:104-109)."
- locations:
  - src/components/Button/index.ts:1
  - src/components/Sticker/index.ts:1
  - src/components/Sticker/Sticker.tsx:31-56
  - src/components/Sticker/Sticker.tsx:104-109
  - (already U6-F14) src/components/Checkbox/index.ts:1, src/components/Tabs/index.ts:1
- evidence: |
    Button/index.ts:1    export { Button, buttonVariants } from './Button';
    Sticker/index.ts:1   export { Sticker, stickerVariants } from "./Sticker";
    Sticker.tsx:44            custom: "",
    Sticker.tsx:104      if (variant === StickerVariant.custom && !color) {
    Sticker.tsx:105        throw new Error(
    dist-index.d.ts      export { Sticker, StickerProps, stickerVariants } … export { Button, ButtonProps, buttonVariants } …
- impact: The unit pass saw two recipes. The package exports four, each a cva function whose argument type is the recipe's string keys plus `null` (see HA-F1), not the consts. None is documented, so their public status is accidental. Removing or reshaping any of them is still a breaking change. A consumer who styles a link with `stickerVariants({ variant: "custom" })` (the shadcn habit) gets a colourless sticker with no error. That is exactly the silent fallback R1.6 says "would make an explicit choice look like it had been honoured".
- recommendation: Decide per recipe. Either document the recipe as public, with the const-typed wrapper signature and no `custom` path, or stop re-exporting it at the next major. `buttonVariants` is the only one with a reuse case today (Toast), and Toast can import it from `../Button/Button`. Merge with U6-F14's export half.
- breaking: major (if un-exported)
- contract: n/a
- remediation: tbd
- related: [U6-F14, U2-F4, HA-F1]

### HA-F3: Five components with DS-authored props export no props type — three Menu parts are new beyond U8-F14 (S4 batch)
- severity: S4
- category: inconsistency
- rules: [R8.19]
- scope: consumer-visible
- confidence: plausible
- verified_by: "surface.cjs: 245 components, 90 with `<Name>Props` exported; of the 155 without, 105 share a family type, 43 are pure Radix/HTML pass-throughs, 2 are internal leaks (U2-F4), and these 5 add DS props"
- locations:
  - src/components/Menu/DropdownMenu.tsx:54-61 (DropdownMenu: `selectType`)
  - src/components/Menu/DropdownMenu.tsx:94-105 (DropdownMenuContent: `dismissOnFocusLoss`, `focusOnOpen`, `matchTriggerWidth`, `onOpenAutoFocus`, `portal`, `portalProps`)
  - src/components/Menu/DropdownMenu.tsx:202-206 (DropdownMenuItem: `variant`)
  - (already U8-F14) src/components/Modal/Modal.tsx:57-62, src/components/Sheet/Sheet.tsx:120-127
- evidence: |
    DropdownMenu.tsx:96   ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content> & {
    DropdownMenu.tsx:98     dismissOnFocusLoss?: boolean;
    Menu/index.ts         export type { DropdownMenuSectionProps, DropdownMenuSegmentProps } from './DropdownMenu';   ← siblings in the same file do export theirs
- impact: A consumer wrapping DropdownMenuContent (the part with the most DS-only props) has to write `ComponentPropsWithoutRef<typeof DropdownMenuContent>`, while its siblings `PopoverContentProps`/`TooltipContentProps`/`DropdownMenuSectionProps` are importable. There is no functional loss, but the next contributor has no precedent to copy.
- recommendation: Extract and export `DropdownMenuProps`, `DropdownMenuContentProps`, `DropdownMenuItemProps` (and Modal/Sheet per U8-F14) when those files are next touched.
- breaking: none
- contract: n/a
- remediation: tbd
- related: [U8-F14]

### HA-F4: In every polymorphic component body, all props are typed `any`: 40 destructured bindings across Button, CopyButton, DropdownTrigger, TextDropdownTrigger, OutlineButton, ShapeButton and BaseText. A misspelled or renamed prop compiles.
- severity: S2
- category: type-safety
- rules: []
- scope: internal
- confidence: plausible
- verified_by: "node docs/audit/_work/scratch/HA/polyany.cjs (TS checker: type of each destructured binding in component params) → Button.tsx:125 4/5 any, CopyButton.tsx:30 5/6, DropdownTrigger.tsx:52 3/4, DropdownTrigger.tsx:304 4/5, OutlineButton.tsx:73 7/8, ShapeButton.tsx:105 5/6, BaseText.tsx:62 12/13. Probe: `tsc -p docs/audit/_work/scratch/HA/tsconfig.polyany.json` on probe-polyany.tsx. With `PropsWithoutRef<ButtonProps<ElementType>>` (what forwardRef passes its render fn), `const { varaint } = b`, `const n: number = b.variant`, `const n2: number = t.fontSize` (BaseText) and `const d: Date = s.shape` (ShapeButton) all compile. Only the control `PropsWithoutRef<ButtonProps<\"button\">>` errors (probe-polyany.out.txt: 1 error, line 16). casttypes.cjs: ShapeButton.tsx:117-118 and BaseText.tsx:80 are FROM-ANY casts."
- locations:
  - src/components/Button/Button.tsx:124-131
  - src/components/CopyButton/CopyButton.tsx:29-31
  - src/components/DropdownTrigger/DropdownTrigger.tsx:51-53
  - src/components/DropdownTrigger/DropdownTrigger.tsx:303-305
  - src/components/OutlineButton/OutlineButton.tsx:72-83
  - src/components/ShapeButton/ShapeButton.tsx:104-118
  - src/components/Text/BaseText.tsx:61-80
- evidence: |
    Button.tsx:124  const ButtonBase = forwardRef<HTMLElement, ButtonProps<ElementType>>(
    Button.tsx:114-116  ButtonProps<TElement> = ButtonOwnProps & Omit<ComponentPropsWithoutRef<TElement>, keyof ButtonOwnProps>;
                    → at TElement = ElementType the Omit is an index signature of `any`; React's
                      PropsWithoutRef<P> then Omit<P,"ref">s it, which erases the named own props
    ShapeButton.tsx:117  const Shape = shapeComponents[shape as ShapeButtons];      (src type: any)
    ShapeButton.tsx:118  const resolvedVariant = variant as ShapeButtonVariant;     (src type: any)
    BaseText.tsx:80      const role = unstyled ? undefined : (variant as TextVariant);   (src type: any)
- impact: The public call signatures are cast back to a generic, so consumers keep checking (CopyButton excepted, U4-F2). Inside the seven bodies, though, `strict` checks nothing: wrong-type uses, typos and stale names all compile. The trap is the next rename. U4-F13 recommends renaming OutlineButton's `inverseTheme` → `themeInverse`. Done in `OutlineButtonOwnProps` alone, the body's `inverseTheme` destructure still compiles, is always `undefined`, and the flag silently stops working. The same holds for any of BaseText's 12 style props. The FROM-ANY casts above look like checks but assert over `any`. The scaffold that causes this is hand-copied six times (§4b).
- recommendation: Type each base's render function against the own props plus a concrete element, e.g. `forwardRef<HTMLElement, ButtonOwnProps & ComponentPropsWithoutRef<"button">>`, and keep the generic only on the exported cast signature. Or share one polymorphic helper type across the six. Then drop the FROM-ANY casts. Removes the bug class at 7 sites and 6 scaffold copies.
- breaking: none
- contract: n/a
- remediation: tbd
- related: [U4-F2, U4-F12, U4-F13, U11-F7]

### HA-F5: Type/dead-code nits the repo-wide scans surfaced (S4 batch)
- severity: S4
- category: type-safety
- rules: []
- scope: consumer-visible
- confidence: plausible
- verified_by: "casttypes.cjs (REDUNDANT/UPCAST classification); deadexports.cjs + rg for `Shapes.`; read ShapeMorphSpinner.tsx:24-50"
- locations:
  - src/components/LoadingSpinner/LoadingSpinner.tsx:300
  - src/components/ProgressIndicator/ProgressIndicator.tsx:298
  - src/components/Slider/Slider.tsx:296
  - src/components/ShapeMorphSpinner/ShapeMorphSpinner.tsx:24,50
  - src/components/Shapes/index.ts:15-29
  - src/components/LoadingSpinner/LoadingSpinner.tsx:254-263
- evidence: |
    LoadingSpinner.tsx:300  getSpinnerGeometry(size as SpinnerSizeKey)   (LoadingSpinnerSize ≡ keyof SPINNER_DIAMETERS today; the cast would still compile if a size were added to the const but not the table)
    ProgressIndicator.tsx:298 same cast; Slider.tsx:296 `variant as SliderVariant` (source already SliderVariant)
    ShapeMorphSpinner.tsx:24  export const SHAPE_MORPH_SPINNER_SHAPES: ComponentType<ShapeProps>[] = [   (mutable, public, and the `shapes` default at :50)
    Shapes/index.ts:15        export const Shapes = { arrow: "arrow", … }   (value read nowhere; no DS prop accepts it; type used once as a `satisfies` bound)
    LoadingSpinner.tsx:263    } as React.CSSProperties   (object holds no custom property — no-op cast)
- impact: (a) The two `SpinnerSizeKey` casts turn the "size added to `LoadingSpinnerSize` but not `SPINNER_DIAMETERS`" mistake from a compile error into a NaN-geometry render. (b) A consumer who calls `.reverse()`/`.push()` on `SHAPE_MORPH_SPINNER_SHAPES` rewrites every spinner's default (U7-F11 found the same for the Calendar preset arrays). (c) `Shapes.*` is a dot-access enum that selects nothing, and suggests `ShapeButton shape={Shapes.arrow}`, which the ShapeButton type rejects. (d) Noise.
- recommendation: Drop the no-op casts; type the default array `readonly` (as U7-F11 proposes for its pair); either give `Shapes` a consumer (a `shape` prop) or keep it type-only.
- breaking: none
- contract: n/a
- remediation: tbd
- related: [U7-F11, U10-F12, U9-F2]

## 5. Already covered (not re-filed)

| HA observation | owning unit finding | HA adds |
|---|---|---|
| TabsTrigger/Checkbox `variant`/`size` typed from cva; `tabTriggerVariants`/`checkboxVariants` public | U6-F14 | Button + SheetContent share the typing defect, with the demonstrated `null` runtime effect (HA-F1). `buttonVariants` + `stickerVariants` share the export defect, and `stickerVariants` bypasses R1.6 (HA-F2). Merge at dedupe. |
| Date helpers, `*_SHAPE_PATH`, `SHAPE_VIEWBOX_SIZE`, `ShapeClipPath`, `BaseShape`, `serializeAxes` public | U2-F4, U7-F2, U3-F7 | Surface count: 29 non-component value exports classified (§2b); no hook, geometry or engine helper leaks beyond those. |
| Open-value consts' identifiers ≠ derived type (`Fonts`/`Font` …) | U3-F4 | — (all 5 confirmed) |
| `ProgressIndicatorVariants` / `ProgressIndicatorVariant` | U9-F11 | — |
| `IconSizes` + `\| string` + alias rename | U10-F8 | — |
| `Shapes` const lives in a barrel | U10-F12 | Its value also has no reader (HA-F5 c). |
| `AvatarSize` inline in Avatar.tsx | U12-F14 | — |
| `state`/`direction`/`mode`/`sortDirection`/`side`/`checked` outside R1.11 list | U14-F10 (RC-1), U11-F1, U7-F6, U6-F25 | Const table gives the complete list: 9 consts (§2). |
| `ToastTypes`/`TooltipTypes` naming | U8-F10 | — |
| `DS_COLOR_TOKENS` name-keyed lookup; 3 private `COLOR_TOKENS` copies | U2-F3, U9-F7 | Kebab keys: 12/17 (§2). The fuzzy helper scan finds `resolveColor` ×2 as the only cross-file helper duplicate. |
| `CopyButtonProps` resolves to `any`; `as never` cast | U4-F2, U4-F12 | Root cause generalised to 7 component bodies (HA-F4). |
| Hand-rolled ref merging casts (AIPromptInput.tsx:177, OutlineButton.tsx:95-97) | U11-F7 | — |
| Unions vs runtime guards: Input `icon`, Slider `custom` | U6-F23 | **Add location:** Sticker has the same gap (Sticker.tsx:64-69 union `color: DsColor`; :104 guard `!color`; `color=""` compiles and throws). |
| ProgressIndicator NaN passes guard; JSDoc "throws in development" | U9-F10, U9-F9 | — |
| Calendar invalid-value path | U7-F1 | — |
| RollingDigitsText union without throw | U3-F6 | — |
| MorphRotationShape `shapes` typed as any ComponentType | U10-F14 | Mode guard verified exact (§3). |
| Mutable `DEFAULT_*_PRESETS`; `bounds!` non-nulls | U7-F11 | `SHAPE_MORPH_SPINNER_SHAPES` has the same defect (HA-F5 b). |
| `@ts-expect-error` + `as unknown as` in waveGeometry.test.ts; file imported by nothing | U2-F10, U9-F13 | — |
| Unused `ds-focus-ring`, `ds-selection`, `ds-my-ui-xs` | U1-F9 | Independently reproduced (98 `.ds-*` selectors scanned). |
| FadeChangeText ≡ RollChangeText | U3-F8 | Token-level J=1.00. |
| 12 Shapes copy-pasted | U10-F3 | — |
| Modal/Sheet shell duplicated | U8-F7 | File containment 0.73. |
| Modal/Sheet content props not exported | U8-F14 | Three Menu parts added (HA-F3). |
| Vestigial default exports incl. FiltersSlidersIcon | U2-F5, U10-F4 | — |
| add-use-client 5-line window; cn hero roles / DS scales; tabTriggerVariants; Text const/type identifier mismatch; serializeAxes/TextStyleProps | U2-F1, U2-F6/F7, U6-F14, U3-F4, U3-F7 | out of scope per brief |

**Correction to a unit finding (for Phase 4).** U5-F11 says DropdownMenu.tsx:102 "redeclares a prop Radix Content already has" and recommends "pass `onOpenAutoFocus` directly". Both claims are false at Radix 2.1.24. `onOpenAutoFocus` is in `MenuContentImplPrivateProps` and is `Omit`ted from Content's public props (`node_modules/@radix-ui/react-menu/dist/index.d.ts:51,57-58`). The direct form fails with `TS2322 … Property 'onOpenAutoFocus' does not exist … Did you mean 'onCloseAutoFocus'?` (`tsc -p docs/audit/_work/scratch/HA/tsconfig.radix.json` → `probe-radix.out.txt`). The cast-spread at DropdownMenu.tsx:155-158 is the only way to pass it. The real issue is a dependency on a private Radix prop that a Radix minor may drop silently; `focusOnOpen={false}` (arch:163 TypeableDropdownTrigger pairing) relies on it.

## DONE
