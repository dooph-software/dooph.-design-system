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

