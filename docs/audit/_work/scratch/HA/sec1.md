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

