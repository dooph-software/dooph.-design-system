Section order on disk follows work order (per coordinator): §2 Const table, §2b Public surface, §3 Type-safety verdicts, §4 Dead code & duplication, §1 Findings, §5 Already covered.

## 2. Const table (H1, Rule 1)

Method: `node docs/audit/_work/scratch/HA/consts.cjs` (TS compiler API; every `export const X = <object literal>` in non-story/non-test `src/**`, unwrapping `as const`/`satisfies`) → `scratch/HA/consts.out.txt`. "srv-safe" = the declaring file has no `"use client"` prologue. "same-id type" = an exported type alias named X exists (R1.9). "canonical" = that alias is exactly `(typeof X)[keyof typeof X]` (R1.2). "dist" = name present in `docs/audit/_work/dist-index.d.ts` export lists (R1.10). Props = every PropertySignature whose type references X or a type derived from X, plus a grep for props typed through cva `VariantProps`.

**Counts.** 58 exported object consts. 6 are internal tables, not Rule-1 enums and not public (`SPINNER_DIAMETERS`, `SPINNER_SIZE_VARS`, `SPINNER_STROKE_WIDTHS` spinnerGeometry.ts:28/35/43; `unrounded` engine/polygon.ts:39; `ROLE_AXIS_TOKEN`, `TEXT_VARIANT_CLASS` Text/constants.ts:109/122). The other **52 are public**. Of the 52: server-safe 52/52; in dist 52/52; camelCase keys 51/52; same-identifier derived type 45/52 (+1 n/a); canonical derivation 44/52; consumed by a prop typed FROM the const 42/52. **36/52 conform on every column**; each non-conforming row carries a flag with its owning finding. Two value catalogues (`CalendarPresets`, `DS_COLOR_TOKENS`) are not option enums; columns that do not apply say n/a.

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

