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
