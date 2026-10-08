# F-C7b — final findings @ b436647

### F-072: ShapeMorphSpinner diverges from its indeterminate sibling LoadingSpinner — default size `md` vs `rg`, `role="progressbar"` vs `role="status"`
- severity: S3
- category: inconsistency
- rules: []
- scope: internal
- confidence: plausible: S3 outside the Phase-4 sample; facts re-checked by U9 (read SMS.tsx 1-72, LS.tsx 289-326, PI.tsx 277-332) and by H2-matrix (ref/rest axis, which moved the forwardRef part to F-039); re-opened @ b436647 by C7b
- verified_by: "U9 read of the four loader components side by side; C7b re-read ShapeMorphSpinner.tsx 1-72, LoadingSpinner.tsx 289-326, ProgressIndicator.tsx:286/302 and the loading-indicators skill:8/19/249-250 @ b436647."
- locations:
  - src/components/ShapeMorphSpinner/ShapeMorphSpinner.tsx:1-6
  - src/components/ShapeMorphSpinner/ShapeMorphSpinner.tsx:47-62
  - src/components/LoadingSpinner/LoadingSpinner.tsx:294
  - src/components/LoadingSpinner/LoadingSpinner.tsx:303-305
  - src/components/ProgressIndicator/ProgressIndicator.tsx:286
  - src/components/ProgressIndicator/ProgressIndicator.tsx:302
  - .agents/skills/dooph-ds-loading-indicators/SKILL.md:8
  - .agents/skills/dooph-ds-loading-indicators/SKILL.md:249-250
- evidence: |
    ShapeMorphSpinner.tsx:2-3   * ShapeMorphSpinner — the indeterminate loader: MorphRotationShape in
                                * `autoplay` mode with role="progressbar", the spinner size scale, and the
    ShapeMorphSpinner.tsx:48    size = LoadingSpinnerSize.md,
    ShapeMorphSpinner.tsx:61    role="progressbar"
    LoadingSpinner.tsx:294      size = LoadingSpinnerSize.rg,
    LoadingSpinner.tsx:304      role: "status",
    ProgressIndicator.tsx:286   size = LoadingSpinnerSize.rg,
    ProgressIndicator.tsx:302   role: "progressbar",
    loading-indicators SKILL.md:8  `LoadingSpinner` and `ShapeMorphSpinner` are indeterminate (no `progress` prop), while `ProgressIndicator` is determinate …
    (LoadingSpinner constants.ts:26-29: rg = 22 px, md = 32 px)
- impact: The skill presents LoadingSpinner and ShapeMorphSpinner as the two interchangeable indeterminate loaders, but swapping one for the other with no `size` prop changes the rendered diameter (22 px → 32 px) and the accessible role (live-region `status` → `progressbar`), so a consumer's layout shifts and assistive tech announces two different things for the same "Loading" state. The family has no stated rule for which role an indeterminate loader carries. (The missing forwardRef/displayName on ShapeMorphSpinner is part of F-039, not this finding.)
- recommendation: Make the two indeterminate loaders agree on both axes, using the values the rest of the family already uses: (1) ShapeMorphSpinner.tsx:48 — default `size = LoadingSpinnerSize.rg` (matches LoadingSpinner:294 and ProgressIndicator:286). (2) LoadingSpinner.tsx:304 — `role: "progressbar"` (ARIA 1.2 indeterminate progressbar: no aria-valuenow; already ShapeMorphSpinner's role, ProgressIndicator's role, and stated in the ShapeMorphSpinner header, so that header stays true); keep `"aria-label": "Loading"` before the `...props` spread so it stays overridable. (3) loading-indicators skill (both `.agents/` and `.claude/` copies, per the repo's mirroring) — add one line under the line-8 paragraph: "Both indeterminate loaders render `role=\"progressbar\"` with no aria-valuenow and default to `size=rg`." (4) CHANGELOG.md `[Unreleased]` — note both consumer-visible changes (default ShapeMorphSpinner size, LoadingSpinner role). Verify: an SSR render script (react-dom/server against a scratch-worktree build) of `<LoadingSpinner />` and `<ShapeMorphSpinner />` shows `role="progressbar"` on both and `var(--ui-size-spinner-rg)` in ShapeMorphSpinner's width; `npm run lint` exit 0.
- breaking: none
- contract: src/components/ShapeMorphSpinner/ShapeMorphSpinner.tsx "MorphRotationShape in `autoplay` mode with role=\"progressbar\", the spinner size scale" → consistent (role unchanged; no default size is stated). LoadingSpinner.tsx has no header contract.
- remediation: [WI-113]
- related: [F-039]
- note-to-orchestrator: both changes are observable (a consumer test querying `getByRole("status")`, or a layout sized around the 32 px default, changes); the map lists breaking none and U9 said minor — kept none, but the WI should land as semver minor with the CHANGELOG entry.

### F-074: TableHeaderCell applies header typography only on the sortable branch, and the DS's own stories label plain headers with ButtonText in some tables and BodyText in others
- severity: S3
- category: inconsistency
- rules: [R8.17]
- scope: consumer-visible
- confidence: plausible: S3 outside the Phase-4 sample; facts re-checked by U12 (read Table.tsx:70-101 and every header cell in Table.stories.tsx) and re-opened @ b436647 by C7b
- verified_by: "U12 read of Table.tsx and Table.stories.tsx; C7b re-read Table.tsx:70-103, the header cells at stories 43-60/142-150/193-199/235-240/281-286, and Text/constants.ts:123 (`button: 'text-style-button'`) @ b436647."
- locations:
  - src/components/Table/Table.tsx:72-99
  - src/components/Table/Table.stories.tsx:49-60
  - src/components/Table/Table.stories.tsx:142-150
  - src/components/Table/Table.stories.tsx:193-199
  - src/components/Table/Table.stories.tsx:235-240
  - src/components/Table/Table.stories.tsx:281-286
- evidence: |
    Table.tsx:72        if (sortDirection !== undefined) {
    Table.tsx:85                <ButtonText>{children}</ButtonText>
    Table.tsx:95          className={cn("flex items-center px-rg py-xs", className)}
    Table.tsx:98          {children}
    Table.stories.tsx:50            <ButtonText>Status</ButtonText>
    Table.stories.tsx:143           <BodyText>Column A</BodyText>
    Table.stories.tsx:195           <ButtonText>Name</ButtonText>
    Table.stories.tsx:236           <BodyText>Person</BodyText>
    Table.stories.tsx:282           <BodyText>Name</BodyText>
- impact: A table that mixes sortable and plain columns renders two text roles in one header row unless the consumer knows to wrap every plain label in `ButtonText` — and the DS's own stories do it both ways (ButtonText in two tables, BodyText in three), so the intended header typography cannot be learned from the reference. Plain header cells also inherit whatever text style the surrounding page sets. (Passing Button props to the sort button is F-039's `buttonProps`, not this finding.)
- recommendation: Make TableHeaderCell own the header role in both branches: in the plain branch (Table.tsx:98) render `<ButtonText>{children}</ButtonText>`, mirroring line 85, so every header label carries `text-style-button`. A consumer who wraps a label in another role component still wins, since the inner span's class is closer. Then make the stories pass bare strings to every TableHeaderCell (stories 49-60, 142-150, 193-199, 235-240, 281-286), dropping the ButtonText/BodyText wrappers, and remove imports that become unused. If the Table rewrite in WI-106 (F-029/F-039/F-042) lands first, apply the same change to its header-cell shape. Verify: an SSR render (react-dom/server, scratch-worktree build) of `<TableHeaderCell>Name</TableHeaderCell>` and `<TableHeaderCell sortDirection="none" onSort={f}>Name</TableHeaderCell>` both contain `text-style-button`; `rg -n "<TableHeaderCell>\s*$" -A1 src/components/Table/Table.stories.tsx | rg "Text>"` → no output; `npm run lint` exit 0; Storybook Table stories show one header style.
- breaking: none
- contract: n/a (Table.tsx opens with a "use client" rationale comment, not a `## behavior`/`## constraints` contract; the change adds no hook, so the "No \"use client\"" note stays true)
- remediation: [WI-114]
- related: [F-029, F-039, F-042]

### F-080: The 12 shape components are one component copy-pasted with three render bodies, and three of them emit a vestigial Figma clipPath with static ids that collide when a shape renders twice
- severity: S3
- category: duplication
- rules: []
- scope: internal
- confidence: plausible: S3 outside the Phase-4 sample; facts re-checked by U10 (read all 12 *Shape.tsx; SSR scratch/U10/ssr-shapes.mjs) and re-opened @ b436647 by C7b
- verified_by: "U10 read of all 12 shape files + SSR of ArrowShape → `<g clip-path=\"url(#clip0_504_971)\">…<clipPath id=\"clip0_504_971\"><rect width=\"24\" height=\"24\" fill=\"red\">`. C7b @ b436647: `rg clip0_|clip1_ src` → only Arrow/Clover/Cookie; every shape file has the same props block at :6-11; dist-index.d.ts:186 exports ShapeClipPath."
- locations:
  - src/components/Shapes/BaseShape.tsx:15-33
  - src/components/Shapes/BaseShape.tsx:51-68
  - src/components/Shapes/ArrowShape.tsx:6-30
  - src/components/Shapes/CloverShape.tsx:6-33
  - src/components/Shapes/CookieShape.tsx:6-33
  - src/components/Shapes/PentagonShape.tsx:6-25
  - src/components/Shapes/PuffShape.tsx:6-25
  - src/components/Shapes/SquircleShape.tsx:6-22
  - src/components/Shapes/CapsuleShape.tsx:19 · DiamondShape.tsx:19 · DoubleShape.tsx:19 · PixircleShape.tsx:19 · StarShape.tsx:19 · TripleShape.tsx:19 (bare `<path d>` body, same as Squircle)
  - docs/audit/_work/dist-index.d.ts:186
- evidence: |
    body A — clip groups + per-path fill (Arrow, Clover, Cookie):
      ArrowShape.tsx:19   <g clipPath="url(#clip0_504_971)">
      ArrowShape.tsx:26   <ShapeClipPath id="clip0_504_971" fillColor={fillColor} />
      CloverShape.tsx:28-29  <ShapeClipPath id="clip0_504_974" fillColor={fillColor} />  <ShapeClipPath id="clip1_504_974" fillColor={fillColor} />
    body B — hard-coded fill (Pentagon, Puff; the fillColor bug is F-004):
      PentagonShape.tsx:21   fill="currentColor"
    body C — inherit from BaseIcon's svg (the other 7):
      SquircleShape.tsx:19   <path d={SQUIRCLE_SHAPE_PATH} />
    BaseShape.tsx:26-31  <clipPath id={id}> <rect width={SHAPE_VIEWBOX_SIZE} height={SHAPE_VIEWBOX_SIZE} fill={fillColor} /> </clipPath>
    dist-index.d.ts:186  export { BaseShape, SHAPE_VIEWBOX_SIZE, ShapeClipPath, ShapeProps } from './components/Shapes/BaseShape.js';
- impact: Two ArrowShapes (or two clover/cookie ShapeButtons) on one page emit duplicate `id="clip0_504_971"` elements, an invalid document whose `url(#…)` resolves to the first copy; the clip itself does no work (a full 24-unit rect whose `fill` a clipPath ignores) but can trim stroke that the inset transform leaves at the box edge. For maintainers, a fill/stroke behaviour change must be made in 12 files, and the three bodies have already diverged once (F-004). Because Shapes/index.ts does `export * from "./BaseShape"`, the Figma-residue helper `ShapeClipPath` is public API that no doc mentions.
- recommendation: One path-driven render. (1) Add a non-exported factory in a new `src/components/Shapes/createShape.tsx` (not re-exported from Shapes/index.ts): `export const createShape = (d: string, displayName: string) => { const Shape = ({ size, strokeColor, fillColor = "currentColor", strokeWeight }: ShapeProps) => (<BaseShape size={size} strokeColor={strokeColor} fillColor={fillColor} strokeWeight={strokeWeight}><path d={d} /></BaseShape>); Shape.displayName = displayName; return Shape; };` — the path inherits fill from BaseIcon's svg (body C). (2) Reduce each of the 12 `*Shape.tsx` to its `X_SHAPE_PATH` export plus `export const XShape = createShape(X_SHAPE_PATH, "XShape");` — the path constants, component identities used by shapePaths.ts's map, and the `ShapeProps` signature stay the same. (3) Remove every `clipPath`/`<defs>`/`ShapeClipPath` use from Arrow, Clover and Cookie; keep the `ShapeClipPath` export itself in BaseShape.tsx unchanged (removing it is public-surface removal, D-15's call in the major). (4) If F-039's BaseShape className/rest/ref change lands, add it once in the factory, not per file. Depends on F-004's fix (WI-057) or subsumes it (Pentagon/Puff lose the hard-coded fill either way). Verify: `rg -n "clip0_|clip1_|ShapeClipPath" src/components/Shapes --glob '!BaseShape.tsx'` → no output; SSR (react-dom/server, scratch-worktree build) of two `<ArrowShape size={24}/>` in one tree → no `id=` attribute and no `clip-path`; SSR of every shape with `fillColor="red"` → `fill:red` on the svg and no `fill=` on the path; Shapes and ShapeButton stories render unchanged (compare the stroke on Arrow/Clover/Cookie at the box edge); `npm run lint` exit 0.
- breaking: none
- contract: n/a (no Shapes file carries a `## behavior`/`## constraints` header)
- remediation: [WI-115]
- related: [F-004, F-039, F-065, F-089, F-108]

### F-089: Public prop types are wider than the runtime honours — MorphRotationShape `shapes`, LinearProgressIndicator `value: null`, Slider `number[]`, CTAButton/CopyButton ref element types
- severity: S3
- category: type-safety
- rules: []
- scope: consumer-visible
- confidence: confirmed
- verified_by: "U10/U9/U6/U4 reads of each prop type against its render path. V8 (M79) CONFIRMED: shapePaths.ts identity Map throws 'is not a DS shape' for any wrapper; LPI :39/:41 coerce null to 0; `grep -c SliderPrimitive.Thumb Slider.tsx` → 1, :251 emits a 1-element array; CTAButton :51 anchor ref vs story :79-81 `<button>`, CopyButton :29 HTMLElement vs :72 cast. C7b re-read every line @ b436647."
- locations:
  - src/components/MorphRotationShape/MorphRotationShape.tsx:86-92
  - src/components/Shapes/shapePaths.ts:33-41
  - src/components/ShapeMorphSpinner/ShapeMorphSpinner.tsx:24
  - src/components/ShapeMorphSpinner/ShapeMorphSpinner.tsx:43
  - src/components/LinearProgressIndicator/LinearProgressIndicator.tsx:27-28
  - src/components/LinearProgressIndicator/LinearProgressIndicator.tsx:39-46
  - src/components/Slider/Slider.tsx:17
  - src/components/Slider/Slider.tsx:45
  - src/components/Slider/Slider.tsx:169-175
  - src/components/Slider/Slider.tsx:222
  - src/components/Slider/Slider.tsx:251-254
  - src/components/Slider/Slider.tsx:273
  - src/components/Slider/Slider.tsx:405
  - src/components/CTAButton/CTAButton.tsx:51
  - src/components/CTAButton/CTAButton.stories.tsx:79-81
  - src/components/CopyButton/CopyButton.tsx:29
  - src/components/CopyButton/CopyButton.tsx:72
- evidence: |
    MorphRotationShape.tsx:86  type ShapeComponent = ComponentType<ShapeProps>;
    MorphRotationShape.tsx:91    shapes: ShapeComponent[];
    shapePaths.ts:34-37  const d = SHAPE_PATHS.get(Component); if (!d) { throw new Error( `${…} is not a DS shape; pass a component from Shapes/.`,
    LinearProgressIndicator.tsx:28  extends ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {      (Radix: value?: number | null)
    LinearProgressIndicator.tsx:39  >(({ className, style, value = 0, max = 100, color, ...props }, ref) => {
    LinearProgressIndicator.tsx:41    const clamped = Math.min(Math.max(value ?? 0, 0), safeMax);
    Slider.tsx:45   export type SliderProps = RootProps & SliderPaintProps;                     (RootProps value/defaultValue: number[])
    Slider.tsx:222        const from = snap(display[0] ?? min);
    Slider.tsx:251        const committed = [snap(Math.min(max, Math.max(min, next)))];
    Slider.tsx:254        onValueCommit?.(committed);
    CTAButton.tsx:51  const CTAButton = forwardRef<HTMLAnchorElement, CTAButtonProps>(
    CTAButton.stories.tsx:80        <button type="button" onClick={() => alert("CTA clicked")} />
    CopyButton.tsx:29  const CopyButton = forwardRef<HTMLElement, CopyButtonProps>(
    CopyButton.tsx:72          ref={ref as React.Ref<HTMLButtonElement>}
- impact: Four typed inputs the runtime narrows silently or by throwing. (1) `shapes={[memo(CloverShape), PuffShape]}` — or any wrapper — compiles, then throws during render and takes the subtree down. (2) LinearProgressIndicator `value={null}` (Radix's documented indeterminate state) compiles and renders an empty determinate bar. (3) Slider `defaultValue={[20, 80]}` (Radix's range API) compiles; the consumer gets one thumb painted from `[0]`, and on SliderStepped the first arrow key replaces their two-element state with `[x]` through `onValueChange`/`onValueCommit` — silent truncation of the consumer's own state. (4) CTAButton `asChild` onto a `<button>` (as its story does) gives a ref typed as an anchor (`ref.current.href` type-checks, is undefined); CopyButton consumers must cast to reach HTMLButtonElement members. Severity: the map's S3 is kept for the cluster; V8 notes item (3) alone could justify S2 (silent data loss in consumer state) and item (4) is S3/S4 borderline (a cast works around it).
- recommendation: Make each type say what the runtime does, without breaking the inputs that already work. (1) Shapes: add to BaseShape.tsx `declare const dsShape: unique symbol; export type DsShapeComponent = ComponentType<ShapeProps> & { readonly [dsShape]: true };`, have F-080's `createShape` factory return `DsShapeComponent` (type-only brand, no runtime marker), and type MorphRotationShape.tsx:86 `type ShapeComponent = DsShapeComponent;`, shapePaths.ts's Map key/`getShapePath` parameter, and ShapeMorphSpinner.tsx:24/:43 (`SHAPE_MORPH_SPINNER_SHAPES: DsShapeComponent[]`, `shapes?: DsShapeComponent[]`) with it; keep the runtime throw (MorphRotationShape's contract is untouched — no motion or geometry change). (2) LinearProgressIndicatorProps: `extends Omit<ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>, "value">` plus `/** 0…max; determinate only (null/indeterminate is not supported). */ value?: number;` — leave the `?? 0` (harmless) or drop it. (3) Slider: keep the `number[]` type (narrowing to `[number]` would reject `useState([50])`, which infers `number[]`), but stop truncating: at :251 build `const committed = [snap(Math.min(max, Math.max(min, next))), ...settled.slice(1)];`, add JSDoc on `SliderProps` "Single thumb: only the first value is rendered and edited; extra values are passed through untouched", and add the same sentence to the consumer skill's Slider entry (skills/dooph-design-system-usage/SKILL.md:121-126). Coordinate with F-022's edit to the same handleKeyDown (WI-105). (4) CopyButton.tsx:29 `forwardRef<HTMLButtonElement, CopyButtonProps>` and drop the `as React.Ref<HTMLButtonElement>` cast at :72; CTAButton.tsx:51 `forwardRef<HTMLElement, CTAButtonProps>` (asChild admits any element; an existing `RefObject<HTMLAnchorElement>` still assigns). Verify: a tsc probe against a scratch-worktree build rejects `<MorphRotationShape shapes={[memo(CloverShape), PuffShape]} …>` and `<LinearProgressIndicator value={null}/>`, and accepts `<MorphRotationShape shapes={[CloverShape, PuffShape]} …>`, `<SliderStepped defaultValue={[50]} …>`, `const r = useRef<HTMLButtonElement>(null); <CopyButton ref={r} value="x"/>`, `const a = useRef<HTMLAnchorElement>(null); <CTAButton ref={a} …>`; in the Slider KeyboardInteraction story with `defaultValue={[20, 80]}` and an `onValueChange` logger, ArrowRight logs `[x, 80]`; `npm run lint` exit 0.
- breaking: none
- contract: src/components/MorphRotationShape/MorphRotationShape.tsx "Motion belongs to CSS, geometry belongs here (architecture Rule 6)" / "Changing `shapes` remounts the inner component (key)" → consistent (type-only change; key and geometry untouched). src/components/LinearProgressIndicator/LinearProgressIndicator.tsx "`value` / `max` clamp into a percentage stored on `--progress-pct`" → consistent. Slider, CTAButton, CopyButton, shapePaths.ts carry no contract header.
- remediation: [WI-115, WI-116]
- related: [F-022, F-038, F-039, F-080]
- note-to-orchestrator: per V8 the Slider sub-item (silent truncation of a consumer's `[a, b]` state on the first stepped arrow key) is arguably S2 on its own and the ref-type sub-item S3/S4 borderline; the map's S3 is kept. Narrowing the CopyButton ref to HTMLButtonElement rejects a consumer `useRef<HTMLElement>` — record it in CHANGELOG `[Unreleased]`.

### F-095: DatePickerSplitTrigger spreads `triggerProps` after its seam className and `disabled`, so a consumer's `triggerProps.className` or `.disabled` replaces them
- severity: S3
- category: api-design
- rules: [R8.7]
- scope: consumer-visible
- confidence: plausible: S3 outside the Phase-4 sample; facts re-checked by U7 (read DatePickerSplitTrigger.tsx:99-103 against DropdownTrigger.tsx:52-71) and re-opened @ b436647 by C7b
- verified_by: "U7 read of the spread order and DropdownTrigger's className merge; C7b re-read DatePickerSplitTrigger.tsx:24-60/85-128 and DropdownTrigger.tsx:52-69 @ b436647 (DropdownTrigger merges only the className prop it receives, so the last-spread className wins)."
- locations:
  - src/components/DatePicker/DatePickerSplitTrigger.tsx:35-36
  - src/components/DatePicker/DatePickerSplitTrigger.tsx:99-103
  - src/components/DatePicker/DatePickerSplitTrigger.tsx:125-126
  - src/components/DropdownTrigger/DropdownTrigger.tsx:52
  - src/components/DropdownTrigger/DropdownTrigger.tsx:69
  - src/components/SplitButton/SplitButton.tsx:89
  - src/components/SplitButton/SplitButton.tsx:93
- evidence: |
    DatePickerSplitTrigger.tsx:35    /** Props forwarded to the INTERNAL left trigger. Ignored when `trigger` is set. */
    DatePickerSplitTrigger.tsx:36    triggerProps?: ComponentPropsWithoutRef<"button">;
    DatePickerSplitTrigger.tsx:100            disabled={disabled}
    DatePickerSplitTrigger.tsx:101            className="rounded-r-none border-r-0"
    DatePickerSplitTrigger.tsx:102            {...triggerProps}
    DatePickerSplitTrigger.tsx:125-126  disabled && "bg-secondary-disabled border-secondary-border-disabled",   ← preset half keyed on `disabled` only
    DropdownTrigger.tsx:52   >(({ className, children, asChild = false, ...props }, ref) => {
    DropdownTrigger.tsx:69           className,
- impact: `triggerProps` is the documented way to customise the internal trigger (line 35), so this is the expected path to hit it. `triggerProps={{ className: "w-60" }}` drops `rounded-r-none border-r-0`: the left half regains its right radius and right border and the seam with the preset half doubles. `disabled` on the split trigger plus `triggerProps={{ disabled: false }}` leaves the left trigger enabled while the preset half paints disabled; the reverse (`triggerProps.disabled` only) disables the left half and leaves the presets live. Violates R8.7's internal-first, consumer-last className merge.
- recommendation: In DatePickerSplitTrigger, pull `className` and `disabled` out of `triggerProps` and merge them instead of letting the spread replace them: `const { className: triggerClassName, disabled: triggerDisabled, ...restTriggerProps } = triggerProps ?? {};` then render `<DropdownTrigger {...restTriggerProps} disabled={disabled || triggerDisabled} className={cn("rounded-r-none border-r-0", triggerClassName)}>` (spread first, the merged props after). Keep the component-level `disabled` as the single switch for the preset half (line 125) and document on `triggerProps` (line 35): "`className` is merged after the seam classes; `disabled` here only adds to the component's `disabled`." Verify: an SSR render (react-dom/server, scratch-worktree build) of `<DatePickerSplitTrigger value={r} onSelect={f} triggerProps={{ className: "w-60" }} />` contains `rounded-r-none border-r-0` and `w-60` on the left button; `<DatePickerSplitTrigger disabled triggerProps={{ disabled: false }} … />` renders the left button with `disabled`; `npm run lint` exit 0. SplitButton.tsx:89 (`<SplitButtonAction icon={icon} disabled={disabled} {...actionProps}>`) and :93 (`<SplitButtonTrigger disabled={disabled} {...triggerProps} />`) have the same `disabled`-replacement shape; apply `disabled={disabled || actionProps?.disabled}` / `disabled={disabled || triggerProps?.disabled}` after the spread there in the same WI.
- breaking: none
- contract: n/a (DatePickerSplitTrigger.tsx and SplitButton.tsx carry no `## behavior`/`## constraints` header)
- remediation: [WI-117]
- related: [F-029, F-039]

### F-098: Naming vocabulary splits — base size is `standard` in some size consts and `default` in others, `ToggleSize.iconSm` and `TabSize.iconSm` render different sizes, and `TooltipTypes`/`ToastTypes` break the `*Variant` pattern
- severity: S3
- category: naming
- rules: [R1.1]
- scope: consumer-visible
- confidence: plausible: S3 outside the Phase-4 sample; facts re-checked by U12 (scratch/U12/sizes.mjs key sets), U6 (Toggle/Tabs constants against toggleOption.ts) and U8 (`rg '^export const [A-Z]\w* = \{' src/components/*/constants.ts`), and re-opened @ b436647 by C7c
- verified_by: "U12/U6/U8 reads of every exported size/variant const. C7c @ b436647: `rg -n 'export const \w*Size = \{' src` → 9 size consts (Avatar, Button, CTAButton, TextDropdown, LoadingSpinner, Segmented, Sticker, Tab, Toggle); re-read Toggle.tsx:37-42, toggleOption.ts:60/62, Tabs/constants.ts:20-25, arch SKILL.md:36-55."
- locations:
  - src/components/Avatar/Avatar.tsx:4-8
  - src/components/Sticker/constants.ts:38-41
  - src/components/CTAButton/constants.ts:11-14
  - src/components/SegmentedTabSelect/constants.ts:26-31
  - src/components/Button/constants.ts:18-24
  - src/components/DropdownTrigger/constants.ts:8-11
  - src/components/Toggle/constants.ts:23-33
  - src/components/Toggle/Toggle.tsx:37-42
  - src/components/Toggle/toggleOption.ts:60
  - src/components/Toggle/toggleOption.ts:62
  - src/components/Tabs/constants.ts:22-25
  - src/components/Tooltip/constants.ts:4-9
  - src/components/Toast/constants.ts:4-10
  - src/components/Tooltip/Tooltip.tsx:34
  - src/components/Toast/Toast.tsx:28
  - src/components/Toast/Toast.tsx:87
  - .agents/skills/dooph-ds-architecture/SKILL.md:36-55
- evidence: |
    base/small size keys (const → keys):
      AvatarSize {standard, small}                  Avatar.tsx:4-7
      StickerSize {standard, micro}                 Sticker/constants.ts:38-41
      CTAButtonSize {standard, big}                 CTAButton/constants.ts:11-14
      SegmentedSize {container, standard, containerIcon, icon}   SegmentedTabSelect/constants.ts:26-31
      ButtonSize {default, sm, icon, iconSm, iconMicro}           Button/constants.ts:18-24
      TextDropdownSize {default, sm}                DropdownTrigger/constants.ts:8-11
      TabSize {default, sm, micro, fill, icon, iconSm, iconMicro} / ToggleSize {default, sm, icon, iconSm}
    iconSm collision:
      Toggle/constants.ts:25-26  default 38 · sm 34 · icon 38×38 · iconSm = Figma "Icon Small", the 28×28 / MICRO icon option (not the 34×34 one).
      Toggle/constants.ts:32     iconSm: "icon-sm",
      Toggle.tsx:41              "icon-sm": "icon-micro",
      Tabs/constants.ts:22-23    /** 34×34 icon-only tab, pairing with the small variants. */ / iconSm: "icon-sm",
      toggleOption.ts:60         "icon-sm": "size-button-sm p-0 rounded-tight",
      toggleOption.ts:62         "icon-micro": "size-tab-micro p-0 rounded-mini",
    *Types consts:
      Tooltip/constants.ts:4     export const TooltipTypes = {
      Toast/constants.ts:4       export const ToastTypes = {
      Tooltip.tsx:34             variant?: TooltipTypes;
      Toast.tsx:87               variant?: ToastTypes;
      arch SKILL.md:38           | `ButtonVariant`    | `variant` | `<Button variant={ButtonVariant.primary} />`                  |
- impact: Dot-accessible consts exist so the next key is guessable; three splits defeat that. (1) A consumer or agent who knows `ButtonSize.default`/`ButtonSize.sm` types `StickerSize.default` or `AvatarSize.sm` and gets a compile error — friction, not a runtime bug, but the newest const (Sticker) chose `standard`, so the split is widening. (2) `TabSize.iconSm` and `ToggleSize.iconSm` share key and value (`"icon-sm"`) on the same Toggle Option recipe, yet a TabsTrigger renders 34×34 and a ToggleSwitch 28×28 (Toggle.tsx:41 remaps to `icon-micro`); matching a tab row and a toggle row by the shared name yields mismatched controls, and a ToggleSwitch can never reach the 34×34 option. The collision is in the public value space, not just the JSDoc. (3) Every other const that drives a `variant` prop is `*Variant` (arch:36-55); `TooltipTypes`/`ToastTypes` are absent from that table, so `TooltipVariant`/`ToastVariant` — the names the convention predicts — do not exist, and the plural `*Types` reads like the `type` prop name arch:122 bans.
- recommendation: D-16 decides. Recommended option (per remediation-decisions.md D-16), for the blocked WI: in the 6.0.0 major (P4; depends on D-01, WI-122, WI-122), no alias shims. (1) Rename `TooltipTypes` → `TooltipVariant` (Tooltip/constants.ts:4/:9, Tooltip/index.ts:9, Tooltip.tsx:12/:14/:34 and its other uses, Tooltip.stories.tsx:13/:23/:60/:76, AIChat/AIModelSelect.tsx:39/:219) and `ToastTypes` → `ToastVariant` (Toast/constants.ts:4/:10, Toast/index.ts:11, Toast.tsx:21/:23/:28/:41/:87/:219/:253/:286/:298, Toast.stories.tsx:5/:21 and every `ToastTypes.` use); add both rows to the arch naming table (arch:36-55); update codebase SKILL.md:240 and :456. (2) Rename `ToggleSize.iconSm` → `ToggleSize.iconMicro` with value `"icon-micro"` (Toggle/constants.ts:25-26/:32, Toggle.tsx:41 becomes `"icon-micro": "icon-micro"`, codebase SKILL.md:150, the Toggle stories, and the constants.ts:6 usage example) so `iconSm`/`"icon-sm"` means 34×34 in every const; do not add a new 34×34 ToggleSwitch size in the same change. (3) Per D-16(b), keep `standard`/`default` as is and record it: add one line under arch:119 — "Base-size key: `default` for controls on the Button height scale (Button, Tab, Toggle, TextDropdown); `standard` for fixed-shape or content-hugging surfaces (Avatar, Sticker, CTAButton, Segmented). Small is always `sm`, except `AvatarSize.small` (kept for compatibility)." If the maintainer instead picks D-16(a) for sizes, extend the same WI with `AvatarSize.standard/small` → `default/sm`, `StickerSize.standard` → `default`, `CTAButtonSize.standard` → `default`, `SegmentedSize.standard` → `default`. List every rename in the v6 migration skill. Verify: `rg -n 'TooltipTypes|ToastTypes' src skills .agents/skills .claude/skills` → 0 hits outside the migration skill; `rg -n 'iconSm' src/components/Toggle` → 0 hits; SSR (react-dom/server, scratch-worktree build) of `<ToggleSwitch size={ToggleSize.iconMicro}>` with one item → `size-tab-micro`; `npm run lint` exit 0; scratch-worktree build + `git status --porcelain` empty.
- breaking: major
- contract: src/components/AIChat/AIModelSelect.tsx:11-18 (## constraints: "No model catalogue, provider enum or reasoning levels live here" / provider colour is a custom property / AIModelSelectItem IS a DropdownMenuRadioSelectItem) → consistent (the rename touches only the `TooltipTypes` import at :39 and its use at :219). Avatar.tsx, the Toggle/Tabs/Tooltip/Toast/Sticker/CTAButton/SegmentedTabSelect constants, Toggle.tsx, toggleOption.ts, Tooltip.tsx and Toast.tsx carry no `## behavior`/`## constraints` header.
- remediation: decision D-16 (+ blocked WI-130)
- related: [F-048, F-062, F-065, F-087, F-110]
- note-to-orchestrator: U8-F10 originally graded the `*Types` rename `breaking: minor` (add `*Variant`, keep `*Types` as aliases); the map fixes the cluster as major, and the repo's practice is no alias shims, so the block keeps major. If D-01 resolves to 5.4.0, the minor-safe subset is: add `TooltipVariant`/`ToastVariant` as new exports alongside the old names and the arch-table rows.

### F-108: `Shapes/svgs/` is not the source of the shape path constants — Pentagon and Puff differ and Star has no svg — though the codebase skill says every path was "lifted verbatim" from it
- severity: S3
- category: repo-hygiene
- rules: []
- scope: internal
- confidence: plausible: S3 outside the Phase-4 sample; facts re-checked by U10 (scratch/U10/verify-shape-svgs.mjs) and by the claims register (C-CB-46 FALSE), and re-run @ b436647 by C7c
- verified_by: "C7c @ b436647: `node docs/audit/_work/scratch/U10/verify-shape-svgs.mjs .` → 9 MATCH; PENTAGON DIFFERS (svg d 330 chars `M9.47822 2.46207…`, const 320 `M9.3101 0.863758…`); PUFF DIFFERS (svg 2011 `M8.67211 2.15868…`, const 2596 `M9.39467 1.00318…`); StarShape `NO SVG FILE`. `rg -n svgs` outside docs/audit and .superpowers → only codebase SKILL.md:140; package.json:35-39 `files` = dist, skills, bin."
- locations:
  - .agents/skills/dooph-ds-codebase/SKILL.md:140
  - src/components/Shapes/svgs/pentagon.svg:2
  - src/components/Shapes/svgs/puff.svg:4
  - src/components/Shapes/PentagonShape.tsx:3-4
  - src/components/Shapes/PuffShape.tsx:3-4
  - src/components/MorphRotationShape/engine/svgPath.ts:12-14
  - package.json:35-39
- evidence: |
    codebase SKILL.md:140  … each one `<path d>` lifted verbatim from the Figma export kept alongside in `Shapes/svgs/`.
    pentagon.svg:2         <path d="M9.47822 2.46207C10.9819 1.42931 13.0181 1.42931 14.5218 2.46207L21.4812 7.24185 …
    PentagonShape.tsx:3-4  export const PENTAGON_SHAPE_PATH = / "M9.3101 0.863758C10.914 -0.28792 13.086 -0.287919 14.6899 0.863759L22.1133 6.19394 …
    puff.svg:4             <path d="M8.67211 2.15868C8.92334 1.93477 9.04891 1.82281 9.16437 1.73227 …
    PuffShape.tsx:3-4      export const PUFF_SHAPE_PATH = / "M9.39467 1.00318C9.52407 0.896242 9.58874 0.842774 9.64778 0.797639 …
    svgPath.ts:12-14       - Normalize by the viewBox, never by the path's own bounds. Bounds scaling / stretches any shape that does not touch all four edges (Pentagon is 23 / units tall), so the resting morph would stop matching the static Shape.
    ls src/components/Shapes/svgs → 11 files (arrow … triple); no star.svg.   Claims register C-CB-46: FALSE.
- impact: The skill line 140 tells the next agent the svg files are the verbatim source of every `*_SHAPE_PATH`. An agent "re-syncing from the Figma export" would replace Pentagon and Puff with the svg geometry and silently change two public shapes — and with them the MorphRotationShape poses, symmetry and the svgPath.ts constraint's own premise ("Pentagon is 23 units tall" holds for the constant, not for pentagon.svg). Star cannot be checked at all. Nothing reads the folder and it does not ship (package.json `files`), so it is an unmaintained second copy of the geometry that has already drifted.
- recommendation: Treat the `*_SHAPE_PATH` constants as canonical (they ship, shapePaths.ts maps them, and the svgPath.ts constraint reasons about them) and remove the drifted copy. (1) `git rm -r src/components/Shapes/svgs/` (11 files; no code, script, story or build config references them). (2) Rewrite the clause in .agents/skills/dooph-ds-codebase/SKILL.md:140 from "each one `<path d>` lifted verbatim from the Figma export kept alongside in `Shapes/svgs/`." to "each one a single `<path d>` in a 24×24 viewBox, exported as `<NAME>_SHAPE_PATH` from its own file — those constants are the canonical geometry (MorphRotationShape and the svgPath.ts constraints depend on them); re-export from Figma only by replacing the constant and checking the MorphRotationShape stories." Edit the `.agents/` file only (`.claude/skills/dooph-ds-codebase` is a symlink to it); leave the "`GemShape` was REMOVED in 5.4" sentence on the same line to F-013's WI-124. Alternative if the maintainer wants the Figma exports kept: replace pentagon.svg and puff.svg with `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="<CONST>"/></svg>` built from the constants, add star.svg the same way, and word line 140 as "kept alongside in `Shapes/svgs/` as reference copies of the constants". Verify: `test ! -d src/components/Shapes/svgs` (or, for the alternative, `node docs/audit/_work/scratch/U10/verify-shape-svgs.mjs .` → 12 MATCH, no DIFFERS, no NO SVG FILE); `rg -n "lifted verbatim|Shapes/svgs" .agents/skills skills` → 0 hits (or 1 hit with the new wording for the alternative); MorphRotationShape and Shapes stories render unchanged; `npm run lint` exit 0.
- breaking: none
- contract: src/components/MorphRotationShape/engine/svgPath.ts:12-14 (## constraints: "Normalize by the viewBox, never by the path's own bounds … (Pentagon is 23 units tall)") → consistent (the constants it describes are kept unchanged; only the drifted copies go). PentagonShape.tsx and PuffShape.tsx carry no header contract and are not edited.
- remediation: [WI-025]
- related: [F-004, F-013, F-080]

### F-113: S4 batch: small code inconsistencies in the menu/trigger family, Sticker, Table, DatePicker and the text helpers — including DropdownMenuContent's reliance on Radix's private `onOpenAutoFocus` prop
- severity: S4
- category: inconsistency
- rules: [R11.7, R11.8]
- scope: internal
- confidence: plausible: S4 batch outside the Phase-4 sample; facts re-checked by U3, U5, U7 and U12 reads and by HA (T10: a tsc probe against Radix 2.1.24, which corrected U5-F11), and re-read @ b436647 by C7c
- verified_by: "HA T10: `tsc -p docs/audit/_work/scratch/HA/tsconfig.radix.json` → `TS2322 … Property 'onOpenAutoFocus' does not exist … Did you mean 'onCloseAutoFocus'?`; react-menu 2.1.24 dist/index.d.ts:51/57-58 (`Omit<MenuContentImplProps, keyof MenuContentImplPrivateProps>`, `onOpenAutoFocus?:`); dist/index.mjs:179/266 spreads it at runtime. C7c re-read every quoted line @ b436647; react-dropdown-menu dist/index.mjs:67 `type: \"button\"`; package.json:82 `\"@radix-ui/react-dropdown-menu\": \"^2.1.24\"`."
- locations:
  - src/components/Menu/DropdownMenu.tsx:12-15
  - src/components/Menu/DropdownMenu.tsx:18-20
  - src/components/Menu/DropdownMenu.tsx:94-105
  - src/components/Menu/DropdownMenu.tsx:123-128
  - src/components/Menu/DropdownMenu.tsx:155-159
  - src/components/Menu/DropdownMenu.tsx:360-377
  - src/components/Menu/DropdownMenuSearch.tsx:10-13
  - src/components/DropdownCaret/DropdownCaret.tsx:21-23
  - src/components/DropdownTrigger/DropdownTrigger.tsx:83-87
  - src/components/DropdownTrigger/DropdownTrigger.tsx:106-109
  - src/components/DropdownTrigger/DropdownTrigger.tsx:168
  - src/components/DropdownTrigger/DropdownTrigger.tsx:244
  - src/components/Sticker/Sticker.tsx:111-114
  - src/components/Sticker/Sticker.tsx:136
  - src/components/Sticker/Sticker.tsx:141
  - src/components/Table/Table.tsx:4-14
  - src/components/Table/Table.tsx:35
  - src/components/DatePicker/DatePicker.tsx:16-17
  - src/components/DatePicker/DatePicker.tsx:70-75
  - src/components/DatePicker/DatePicker.tsx:81
  - src/components/AnimatedText/RollingDigitsText.tsx:234-241
  - src/components/AnimatedText/RollingDigitsText.tsx:273-274
  - src/components/AnimatedText/UnderlineLinkText.tsx:21-22
  - src/components/Text/textStyle.ts:25-27
  - (no-action here, owned elsewhere) src/components/Menu/DropdownMenu.tsx:1-3 · src/components/Menu/DropdownMenuSearch.tsx:30 · src/components/SearchBox/SearchBox.tsx:1 · src/utils/color.ts:1-2 · src/components/Calendar/CalendarPresetsPanel.tsx:60,70 · src/components/OutlineSection/index.ts:1
- evidence: |
    # | path:line | snippet (verbatim @ b436647) | reality | disposition
    1 | DropdownMenu.tsx:102 · :155-158 | onOpenAutoFocus?: (event: Event) => void; · {...(handleOpenAutoFocus / ? ({ / onOpenAutoFocus: handleOpenAutoFocus, / } as ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>) | Radix 2.1.24 omits `onOpenAutoFocus` from Content's public props (MenuContentImplPrivateProps); the cast passes it anyway and Radix spreads it at runtime. `focusOnOpen={false}` (TypeableDropdownTrigger, DropdownTrigger.tsx:86-87) depends on it, under a caret range. U5-F11's "redeclares a prop Radix Content already has / pass it directly" is wrong (TS2322) | WI-118
    2 | DropdownMenu.tsx:13-15 | is always `ghost-fg-active` (primary), never the faded `ghost-fg` rest / tone — except `DropdownMenuItemVariant.danger`, which paints | "never … except" in one sentence (R11.8 form) | WI-118
    3 | DropdownMenu.tsx:19-20 · DropdownMenuSearch.tsx:11-13 · DropdownCaret.tsx:21-23 | - Do not hardcode a search field into `DropdownMenuContent`. / - Style open/disabled/highlighted via Radix data attributes only. | constraints that name no failure (R11.7) | WI-118
    4 | DropdownMenu.tsx:367-374 | ({ className, variant = DropdownMenuSegmentVariant.divider, children, ...props }, ref) => ( … {variant === DropdownMenuSegmentVariant.labeled ? ( | `children` on a divider segment is accepted and silently dropped | WI-118
    5 | DropdownTrigger.tsx:168 · :244 | ...triggerProps · {...triggerProps} | Radix Trigger's Slot-merged `type: "button"` (react-dropdown-menu index.mjs:67) lands on the root `<div>` as an invalid attribute; :106-109 already keeps it off the input for the same reason | WI-118
    6 | Sticker.tsx:136 · :141 | StickerBase.displayName = "Sticker"; · Sticker.displayName = "Sticker"; | two DevTools nodes named "Sticker" (Slider names its base "SliderBase", Slider.tsx:419) | WI-119
    7 | Sticker.tsx:113 | ? resolveDsColor(color, "var(--ui-color-prominent)") | unreachable after the :104 throw; reads as the prominent fallback the header forbids | WI-119
    8 | Table.tsx:8-11 · :13-14 · :35 | import { ChevronDownIcon } from "../Icons/ChevronDownIcon"; … import { ButtonText } from "../Text/BaseText"; · (two blank lines) · } as React.CSSProperties | deep imports where siblings use `../Icons` / `../Text`; a double blank line; the UMD-global `React.` namespace in a file that imports its React types by name (:4) | WI-119
    9 | DatePicker.tsx:70-71 · :81 | const [uncontrolledOpen, setUncontrolledOpen] = useState(false); / const isOpen = open ?? uncontrolledOpen; · <Popover open={isOpen} onOpenChange={setOpen}> | re-implements Radix Popover's controllable `open` and cannot take `defaultOpen` | WI-119
    10 | RollingDigitsText.tsx:235 · :240 · :274 | style, · className?: string; · style={style} | `style` destructured only to be passed straight back; the cast re-declares `className`, already in HTMLAttributes | WI-119
    11 | UnderlineLinkText.tsx:21-22 · textStyle.ts:26-27 | const toLength = (value: string | number) => / typeof value === "number" ? `${value}px` : value; | the number→px rule is written twice | WI-119
    12 | DropdownMenu.tsx:1-3 | "use client"; / (blank) / /* | header below the directive (R11.9) | no-action here: F-103 (WI-053 moves the directive below the header)
    13 | SearchBox.tsx:1 | "use client"; | hook-free module (R8.21) | no-action here: F-027 (decision D-05, WI-037)
    14 | DropdownMenuSearch.tsx:30 | /** Whether the hotkey indicator is shown. Defaults to true when shortcut is set. */ | the default is an unconditional `true` (:39) | no-action here: F-082 (WI-089 rewrites the default as `!!shortcut`)
    15 | color.ts:1-2 | (Slider, LinearProgressIndicator). | Sticker and AIModelSelect also consume it | no-action here: F-119 (WI-005)
    16 | CalendarPresetsPanel.tsx:60 · :70 | data-active={isActive ? "" : undefined} · isActive && "bg-ghost-active", | attribute emitted, JS class used | no-action here: F-061 (WI-075, WI-067)
    17 | OutlineSection/index.ts:1 | export * from './OutlineSection'; | barrel shape differs from siblings | no-action here: F-064 (WI-027)
- impact: Individually small. Item 1 has the real failure mode: the typed API says `onOpenAutoFocus` is not a Content prop, so the DS reaches Radix internals through a cast. Under the `^2.1.24` range a Radix minor can drop the runtime spread with no compile error, and TypeableDropdownTrigger then loses focus to the panel on open. Nothing in the file records the dependency, so the next editor "cleans up" the cast into the direct form, which does not compile (U5-F11 recommended exactly that). Items 2-3 weaken header contracts that the AGENTS.md rules protect. Items 4-5 accept input and silently drop or misplace it. Items 6-11 are noise that implies behaviour that is not there: a prominent fallback, special `style` handling, and two number→px rules that can drift.
- recommendation: Two WIs. WI-118 (menu/trigger family): (a) keep the cast-spread (the only form that compiles) and record the dependency — add a `## constraints` bullet to DropdownMenu.tsx: "`focusOnOpen={false}` and `onOpenAutoFocus` reach Radix's PRIVATE `onOpenAutoFocus` (react-menu `MenuContentImplPrivateProps`, 2.1.24) through the cast at the Content spread; the public Content type does not have it. On every @radix-ui/react-dropdown-menu bump, `rg -n onOpenAutoFocus node_modules/@radix-ui/react-menu/dist/index.mjs` must still show it spread into FocusScope's onMountAutoFocus, or TypeableDropdownTrigger loses focus to the panel on open." and give :102 the JSDoc `/** Radix-private prop, passed through by cast — see ## constraints. */`. (b) Split :13-15 into two sentences: "Content is always `ghost-fg-active` (primary), never the faded `ghost-fg` rest tone. `DropdownMenuItemVariant.danger` is the one exception: it paints danger-primary on hover and active." (c) Append each constraint's failure: DropdownMenu.tsx:19 "— every menu would carry a search row and lose free-form composition"; :20 "— a JS-toggled class drifts from Radix's state (keyboard highlight and pointer hover disagree)"; DropdownMenuSearch.tsx:11 "— a menu that never asked for search would grow one"; :12-13 "— a bare text node escapes the text-style system"; DropdownCaret.tsx:21-22 "— a prop or class bypasses the CSS's light/dark token choices"; :23 "— a listener on the host breaks when the host is a consumer's custom trigger". (d) DropdownMenuSegmentProps: add `/** Rendered only when `variant` is `labeled`; the divider ignores it. */ children?: ReactNode;` (tightening to a discriminated union is D-12's call). (e) TypeableDropdownTrigger: rename the :168 rest to `...rest` and, before the return, `const { type: _slotType, ...triggerProps } = rest as typeof rest & { type?: string };` with the comment "Radix Trigger's Slot merges type=\"button\"; a <div> has no type." WI-119 (leaf components): Sticker.tsx:136 → `StickerBase.displayName = "StickerBase";`; Sticker.tsx:113 → `? resolveDsColor(color, "")` with the comment "fallback unreachable: the throw above guarantees `color`" (no prominent token in the render path); Table.tsx:8-11 → `import { ChevronDownIcon, ChevronsUpDownIcon, ChevronUpIcon } from "../Icons";` and `import { ButtonText } from "../Text";`, delete the blank line at :14, import `type CSSProperties` at :4 and write `} as CSSProperties` at :35 (fold into WI-106 if that Table rewrite lands first); DatePicker.tsx → add `defaultOpen?: boolean;` after `open?` (:16), destructure it, delete :70-75, render `<Popover open={open} onOpenChange={onOpenChange} defaultOpen={defaultOpen}>` and drop the unused `useState` import; RollingDigitsText.tsx → drop `style` from the :235 destructure and `style={style}` at :274 (it flows through `...rest`), and drop `className?: string;` from the :240 cast; move the number→px helper to a new `src/utils/length.ts` (`export const toPxLength = (value: string | number): string => typeof value === "number" ? `${value}px` : value;`, not exported from src/index.ts) and import it in UnderlineLinkText.tsx and textStyle.ts (textStyle keeps its `undefined` pass-through: `value === undefined ? undefined : toPxLength(value)`). Verify: `npm run lint` exit 0; SSR (react-dom/server, scratch-worktree build) of `<DropdownMenu><DropdownMenuTrigger asChild><TypeableDropdownTrigger placeholder="x"/></DropdownMenuTrigger></DropdownMenu>` → the root `<div` carries no `type=` attribute; SSR of `<Sticker variant="custom" color="danger">x</Sticker>` → `color:var(--ui-color-danger-primary)`; `rg -n "ui-color-prominent" src/components/Sticker/Sticker.tsx` → no hit; `rg -n "toLength" src` → 0 hits; DatePicker stories open and close (uncontrolled and controlled); the TypeableDropdownTrigger story keeps focus in the input on open.
- breaking: none
- contract: src/components/Menu/DropdownMenu.tsx "Do not hardcode a search field into `DropdownMenuContent`." / "Style open/disabled/highlighted via Radix data attributes only." → consistent (both kept; failures appended; one constraint added). src/components/Menu/DropdownMenuSearch.tsx and src/components/DropdownCaret/DropdownCaret.tsx (## constraints) → consistent (each gains its failure; no rule removed or relaxed). src/components/Sticker/Sticker.tsx:21-23 "`custom` with no `color` throws. Silently falling back to prominent would make an explicit choice look like it had been honoured." → consistent (the dead prominent fallback goes; the throw stays). src/components/AnimatedText/RollingDigitsText.tsx (## constraints: US format only; tabular figures; no 3D; union-enforced smallDecimalsComponent) → consistent (prop plumbing only). DropdownTrigger.tsx, Table.tsx, DatePicker.tsx, UnderlineLinkText.tsx and textStyle.ts carry no `## behavior`/`## constraints` header.
- remediation: [WI-118, WI-119]; no-action for items 12-17, owned by the findings named in the table
- related: [F-027, F-029, F-061, F-064, F-082, F-102, F-103, F-119]
- note-to-orchestrator: U5-F11's recommendation ("pass `onOpenAutoFocus` directly") is replaced per HA T10; the remaining issue is the undocumented private-API dependency, not a redundant prop.

### F-115: S4 batch: type nits — no-op and masking casts, mutable public default arrays, non-null assertions, and three DropdownMenu parts with DS props but no exported props type
- severity: S4
- category: type-safety
- rules: [R8.19]
- scope: internal
- confidence: plausible: S4 batch outside the Phase-4 sample; facts re-checked by U7 (read in full), HA (casttypes.cjs REDUNDANT/UPCAST classification; surface.cjs: 245 components, 90 with an exported `<Name>Props`) and re-read @ b436647 by C7c
- verified_by: "HA casttypes.cjs + surface.cjs; U7 reads. C7c @ b436647: re-read every quoted line; `rg -n SpinnerSizeKey src` → spinnerGeometry.ts:73 `keyof typeof SPINNER_DIAMETERS` + the two casts; `rg -n 'DEFAULT_(CALENDAR|SPLIT_TRIGGER)_PRESETS' src` → constants.ts:118/128, Calendar/index.ts:15-16, DatePickerSplitTrigger.tsx:16/53; Menu/index.ts exports only `DropdownMenuSectionProps`, `DropdownMenuSegmentProps` (+ Search)."
- locations:
  - src/components/LoadingSpinner/LoadingSpinner.tsx:254-263
  - src/components/LoadingSpinner/LoadingSpinner.tsx:300
  - src/components/ProgressIndicator/ProgressIndicator.tsx:298
  - src/components/LoadingSpinner/spinnerGeometry.ts:73
  - src/components/Slider/Slider.tsx:296
  - src/components/ShapeMorphSpinner/ShapeMorphSpinner.tsx:24-31
  - src/components/ShapeMorphSpinner/ShapeMorphSpinner.tsx:43
  - src/components/ShapeMorphSpinner/ShapeMorphSpinner.tsx:50
  - src/components/MorphRotationShape/MorphRotationShape.tsx:91
  - src/components/MorphRotationShape/MorphRotationShape.tsx:156
  - src/components/Calendar/constants.ts:118-132
  - src/components/DatePicker/DatePickerSplitTrigger.tsx:30
  - src/components/DatePicker/DatePickerSplitTrigger.tsx:53
  - src/components/DatePicker/DatePicker.tsx:49
  - src/components/Calendar/dateFormat.ts:89-92
  - src/components/Calendar/CalendarGrid.tsx:50
  - src/components/Calendar/Calendar.tsx:8
  - src/components/Menu/DropdownMenu.tsx:54-61
  - src/components/Menu/DropdownMenu.tsx:94-105
  - src/components/Menu/DropdownMenu.tsx:202-206
  - src/components/Menu/index.ts
  - (no-action here, owned elsewhere) src/components/Shapes/index.ts:15-29 · src/components/Modal/Modal.tsx:57-62 · src/components/Sheet/Sheet.tsx:120-127
- evidence: |
    # | path:line | snippet (verbatim @ b436647) | reality | disposition
    1 | LoadingSpinner.tsx:300 · ProgressIndicator.tsx:298 | const geo = getSpinnerGeometry(size as SpinnerSizeKey); | LoadingSpinnerSize ≡ `keyof typeof SPINNER_DIAMETERS` today, so the cast is a no-op; if a size is added to the const but not the table, the cast turns that compile error into a NaN-geometry render | WI-120
    2 | LoadingSpinner.tsx:263 | } as React.CSSProperties | the object (:254-262) holds no custom property; no-op cast | WI-120
    3 | Slider.tsx:296 | const paints = VARIANT_PAINTS[variant as SliderVariant]; | `variant` is already `SliderVariant`; no-op cast | WI-120
    4 | ShapeMorphSpinner.tsx:24 · Calendar/constants.ts:118 · :128 | export const SHAPE_MORPH_SPINNER_SHAPES: ComponentType<ShapeProps>[] = [ · export const DEFAULT_CALENDAR_PRESETS: CalendarPreset[] = [ · export const DEFAULT_SPLIT_TRIGGER_PRESETS: CalendarPreset[] = [ | public, mutable, and used as prop defaults (ShapeMorphSpinner.tsx:50, DatePickerSplitTrigger.tsx:53): a consumer `.push()`/`.reverse()` rewrites every instance's default | WI-120
    5 | dateFormat.ts:91-92 | let first = hasFrom ? bounds!.from!.getFullYear() : nowYear - YEARS_BACK; / let last = hasTo ? bounds!.to!.getFullYear() : nowYear + YEARS_FORWARD; | non-null assertions where a narrowed local works | WI-120
    6 | DatePicker.tsx:49 | splitPresets?: Parameters<typeof DatePickerSplitTrigger>[0]["presets"]; | an indirect spelling of `CalendarPreset[]` that hides the type from IntelliSense readers | WI-120
    7 | CalendarGrid.tsx:50 · Calendar.tsx:8 | onDayKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => void; · type KeyboardEvent, | UMD-global `React.` namespace in one module, named type import in its sibling | WI-120
    8 | DropdownMenu.tsx:58-61 · :96-105 · :204-206 | }: ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Root> & { … selectType?: DropdownMenuSelectType; · ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content> & { dismissOnFocusLoss?: boolean; … · ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & { variant?: DropdownMenuItemVariant; | three parts with DS-authored props export no props type, while their siblings `DropdownMenuSectionProps`/`DropdownMenuSegmentProps` do (R8.19) | WI-118
    9 | Shapes/index.ts:15 | export const Shapes = { | the value is read nowhere | no-action here: F-012's WI-034 gives `Shapes` keys a consumer (`shapes` accepts them)
    10 | Modal.tsx:57-62 · Sheet.tsx:120-127 | (Modal/Sheet content parts with DS props) | no exported props type | no-action here: F-116 (U8-F14)
- impact: None changes behaviour today. The casts in items 1-3 are worse than noise only in item 1, where the cast removes the compile-time link between `LoadingSpinnerSize` and `SPINNER_DIAMETERS`, so a future size added to one and not the other renders NaN geometry instead of failing `npm run lint`. Item 4 lets one consumer mutate a package-wide default for every other instance on the page. Items 5-7 are inconsistent spelling. Item 8 makes a consumer wrapping DropdownMenuContent, the part with the most DS-only props, write `ComponentPropsWithoutRef<typeof DropdownMenuContent>` while its siblings' props types import by name, and leaves the next contributor no precedent to copy.
- recommendation: WI-120: (1) LoadingSpinner.tsx:300 and ProgressIndicator.tsx:298 → `getSpinnerGeometry(size)` (drop the cast; if `npm run lint` then fails, the const and table have drifted and that is the bug to fix); drop `as React.CSSProperties` at LoadingSpinner.tsx:263 (keep the object literal); Slider.tsx:296 → `VARIANT_PAINTS[variant]`. (2) Type the three default arrays `readonly`: `export const DEFAULT_CALENDAR_PRESETS: readonly CalendarPreset[] = [` and the same at :128; `SHAPE_MORPH_SPINNER_SHAPES: readonly <element type>[]` on top of whatever element type F-012's WI-034 and F-089's WI-115/54 leave; widen the props that receive them to accept readonly arrays — DatePickerSplitTrigger.tsx:30 `presets?: readonly CalendarPreset[];`, ShapeMorphSpinner.tsx:43 `shapes?: readonly …[]`, MorphRotationShape.tsx:91 `shapes: readonly ShapeComponent[];` and :156 `useShapesKey(shapes: readonly ShapeComponent[])` (a mutable array still assigns to every widened prop). (3) dateFormat.ts:89-92 → `const from = bounds?.from; const to = bounds?.to; const hasFrom = from !== undefined; const hasTo = to !== undefined; let first = from ? from.getFullYear() : nowYear - YEARS_BACK; let last = to ? to.getFullYear() : nowYear + YEARS_FORWARD;`. (4) DatePicker.tsx:49 → `splitPresets?: readonly CalendarPreset[];` importing `type CalendarPreset` from "../Calendar". (5) CalendarGrid.tsx:3 → add `type KeyboardEvent` to the react import and write `(event: KeyboardEvent<HTMLButtonElement>) => void` at :50. WI-118 (same file as F-113's menu edits): extract `export type DropdownMenuProps = ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Root> & { /** Selection mode for the whole menu. Default single. */ selectType?: DropdownMenuSelectType; };`, `export type DropdownMenuContentProps = ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content> & { …the six DS props at :97-104, JSDoc kept… };` and `export type DropdownMenuItemProps = ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & { variant?: DropdownMenuItemVariant; };`, use them at :58, :96 and :204, and add the three names to the `export type { … } from './DropdownMenu';` block in Menu/index.ts (src/index.ts:18 `export * from './components/Menu'` publishes them). Verify: `npm run lint` exit 0; `rg -n "as SpinnerSizeKey|as SliderVariant" src` → 0 hits; a tsc probe against a scratch-worktree build rejects `DEFAULT_CALENDAR_PRESETS.push(x)` and `SHAPE_MORPH_SPINNER_SHAPES.reverse()` and accepts `<DatePickerSplitTrigger presets={[CalendarPresets.days.seven]} …/>`, `<ShapeMorphSpinner shapes={[CloverShape, PuffShape]}/>` and `import type { DropdownMenuContentProps } from "@dooph-software/design-system"`; scratch-worktree build + `git status --porcelain` empty.
- breaking: none
- contract: src/components/Menu/DropdownMenu.tsx (## constraints: no hardcoded search field; state via Radix data attributes only) → consistent (type extraction only). src/components/MorphRotationShape/MorphRotationShape.tsx:50 "Changing `shapes` remounts the inner component (key)" → consistent (`readonly` is type-only; useShapesKey's identity comparison is unchanged). LoadingSpinner.tsx, ProgressIndicator.tsx, Slider.tsx, ShapeMorphSpinner.tsx, Calendar/constants.ts, dateFormat.ts, CalendarGrid.tsx, DatePicker.tsx and DatePickerSplitTrigger.tsx carry no `## behavior`/`## constraints` header.
- remediation: [WI-118, WI-120]; no-action for items 9-10, owned by the findings named in the table
- related: [F-012, F-089, F-113, F-116]
- note-to-orchestrator: U7-F11 graded the readonly change `breaking: minor`: a consumer who annotates a mutable variable from a default (`const p: CalendarPreset[] = DEFAULT_CALENDAR_PRESETS`) gets a compile error. The map's `breaking: none` is kept because the widened props accept every existing input; record the readonly defaults in CHANGELOG `[Unreleased]`.

### F-116: S4 batch: naming and cosmetic nits — misfiled token comments, unlabeled generated region, CSS literals with no token, header constraints that hedge or name no failure, stray destructures and redeclared props, `Error` story names, an unprefixed inline custom property, and an undocumented Figma `Variant` → `state` mapping
- severity: S4
- category: naming
- rules: [R1.1, R8.1, R11.7, R11.8]
- scope: internal
- confidence: plausible: S4 batch outside the Phase-4 sample; facts re-checked by U1, U6, U8 and U11 reads; U11-F1 was DOWNGRADED from S2 to S4 by V4 (M26: "Both parts use `state` for lifecycle and `variant` for kind — consistent"); re-read @ b436647 by C7c
- verified_by: "U1/U6/U8/U11 reads (U1 tokens.mjs for the inert dark value). V4 M26: AIChat/constants.ts:21-26 `AIToolPartState` = lifecycle, :36-41 `AIThinkingPartState` = phase, :4-12 `AIToolPartVariant` = kind → the API is consistent; only the Figma label differs. C7c re-read every quoted line @ b436647; index.css:74 `/* __GENERATED_THEME_START__ */` (the :68-73 comment sits outside the generated block); `rg -n slider-pct src` → Slider.tsx:332/368/380 only."
- locations:
  - src/styles/tokens.css:470-475
  - src/styles/tokens.css:544
  - src/styles/dooph-component-tokens.css:620
  - src/styles/dooph-component-tokens.css:626
  - src/styles/index.css:68-74
  - src/components/Toast/Toast.tsx:80
  - src/components/Tooltip/Tooltip.tsx:101-108
  - src/components/Checkbox/Checkbox.tsx:15-16
  - src/components/VerificationCode/CodeDigitInput.tsx:12
  - src/components/VerificationCode/VerificationCodeInput.tsx:12-13
  - src/components/VerificationCode/VerificationCodeInput.tsx:38
  - src/components/SegmentedTabSelect/SegmentedTabSelect.tsx:24-28
  - src/components/Slider/Slider.tsx:332
  - src/components/Slider/Slider.tsx:368
  - src/components/Slider/Slider.tsx:380
  - src/components/Input/Input.stories.tsx:25
  - src/components/VerificationCode/VerificationCode.stories.tsx:31
  - src/components/AIChat/constants.ts:37-38
  - src/components/AIChat/AIThinkingPart.tsx:43
  - src/components/AIChat/AIToolPart.tsx:29-30
  - (no-action here, owned elsewhere) src/styles/tokens.css:711 · src/styles/dooph-component-tokens.css:35-38 · src/styles/dooph-component-tokens.css:260-273 · src/components/Toast/Toast.stories.tsx:50,58 · src/components/Modal/Modal.tsx:57-63 · src/components/Sheet/Sheet.tsx:120-127 · src/components/Toggle/Toggle.tsx:1-5 · src/components/Tabs/Tabs.tsx:21 · src/components/VerificationCode/CodeDigitInput.tsx:88-89
- evidence: |
    # | path:line | snippet (verbatim @ b436647) | reality | disposition
    1 | tokens.css:470 · :475 | /* Calendar — day-cell corner radius, presets rail width, panel min-width. */ · --ui-height-button-micro: 26px; | the day-cell radius lives at :544; a button height is filed under the Calendar heading | WI-026
    2 | index.css:68-73 | * @theme inline — maps --ui-* tokens into Tailwind utility namespaces. | the generated region (:74 `/* __GENERATED_THEME_START__ */` … :209) has no "generated by scripts/sync-theme.mjs — do not edit" line; theme.css:4 has one | WI-026
    3 | dooph-component-tokens.css:620 · :626 | text-underline-offset: 3px; · border-left: 2px solid var(--ui-color-border-primary); | design values with no `--ui-*` token in the chat-prose helper (R8.1) | WI-026
    4 | Toast.tsx:80 | variant: "simple", | string literal in the cva defaultVariants where `ToastTypes.simple` exists (R1.1) | WI-026
    5 | Tooltip.tsx:102 · :106 | ({ className, ...props }, ref) => ( · className={className} | destructured only to be passed straight back (TooltipTitle just spreads) | WI-026
    6 | Checkbox.tsx:15-16 | - Indicator SVGs stay decorative (`aria-hidden`); do not replace with / interactive children unless composing via the `children` escape hatch. | a qualified prohibition with no failure named (R11.8, R11.7) | WI-026
    7 | CodeDigitInput.tsx:12 · VerificationCodeInput.tsx:12-13 | - Prefer composing through VerificationCodeInput for multi-digit flows. · - Do not ship a package-level “verification section” layout — compose in / stories / apps with role text + Button. | constraints that name no failure (R11.7) | WI-026
    8 | VerificationCodeInput.tsx:38 | "aria-label"?: string; | already in HTMLAttributes<HTMLDivElement> (:30) | WI-026
    9 | SegmentedTabSelect.tsx:24-28 | // SegmentedVariant/SegmentedSize (+ their types) live in ./constants … import { SegmentedSize, SegmentedVariant } from './constants'; | an import after a declaration (:20-22) | WI-026
    10 | Slider.tsx:332 | '--slider-pct': pct, | unprefixed, beside `--ds-slider-color`/`--ds-slider-track-opacity` and the other `--ds-slider-*` inline properties | WI-026
    11 | Input.stories.tsx:25 · VerificationCode.stories.tsx:31 | export const Error: Story = { args: { placeholder: 'Error state', hasError: true } }; · export const Error: Story = { | shadows the global `Error` constructor in module scope | WI-026
    12 | AIChat/constants.ts:37 · AIThinkingPart.tsx:43 · AIToolPart.tsx:29-30 | * AIThinkingPart phase (Figma 761:1345 `Variant`). … · state?: AIThinkingPartState; · state?: AIToolPartState; / variant?: AIToolPartVariant; | V4: consistent (state = lifecycle, variant = kind); only the Figma label `Variant` differs, and nothing records why it maps to `state` | WI-026 (JSDoc); the arch:122 `state` entry is F-110's (decision D-08)
    13 | tokens.css:711 | --ui-sticker-bg-opacity-secondary: 60%; | inert in dark | no-action here: F-076
    14 | dooph-component-tokens.css:35-37 | outline: 2px solid var(--ui-color-focus-ring-prominent); outline-offset: 2px; | the offset ring variant | no-action here: F-018 (WI-C4 records it as the organic-shape variant)
    15 | dooph-component-tokens.css:267 | .ds-toast-width-simple { | component-first helper name vs token `--ui-width-toast-simple` | no-action: `ds-*` helpers ship in styles.css, so a rename is a public break for a cosmetic gain; revisit only if D-16 normalises names in 6.0
    16 | Toast.stories.tsx:50 · :58 | export const Brand: Story = { · export const Error: Story = { | retired `brand` spelling; shadows `Error` | no-action here: F-105 (WI-020 renames both to Prominent/Danger)
    17 | Modal.tsx:59 · Sheet.tsx:122 | inline intersection prop types | no exported `ModalContentProps`/`SheetContentProps` | no-action here: F-030 (WI-095 exports both)
    18 | Toggle.tsx:4-5 | * (two or more). Renamed from TwoWayToggle / TwoWayToggleItem (BREAKING, major). | changelog line in a contract (R11.13/RC-3) | no-action here: F-112 (decision D-09)
    19 | Tabs.tsx:21 | "inline-flex items-center gap-1" | `gap-xxs` elsewhere | no-action here: F-017 (WI-C4 maps it to `gap-xxs`)
    20 | CodeDigitInput.tsx:88-89 | onFocus={onFocus} · onBlur={onBlur} | destructured only to be re-passed | no-action here: F-040's WI rewrites the cell focus path
- impact: Each is individually trivial; together they are the drift that makes the next contributor copy the wrong sibling. The misfiled token comment sends a reader to the wrong place for the calendar radius; the unlabeled generated region invites a hand edit that `npm run sync-tokens` silently reverts; the two hedged or failure-less header constraints are exactly the wording AGENTS.md says to treat as load-bearing without telling the editor why; the unprefixed `--slider-pct` is the one inline property outside the `--ds-*` namespace; the undocumented `Variant` → `state` mapping invited U11-F1's S2 misreading, and the next chat part could repeat it.
- recommendation: One WI (WI-026), all no-behaviour-change. (1) tokens.css:470 → `/* Calendar — presets rail width and panel min-width (the day-cell radius is with the radii, --ui-radius-calendar-day). */`; move `--ui-height-button-micro: 26px;` (:475) up to follow `--ui-height-button-sm` (:450), keeping its value. (2) index.css: append to the :68-73 comment `* Everything between the __GENERATED_THEME_*__ markers is written by scripts/sync-theme.mjs (npm run sync-tokens) — do not edit it by hand.` (the comment is outside the markers, so this is not a generated-file edit). (3) Add `--ui-chat-prose-link-offset: 3px;` and `--ui-chat-prose-quote-border-width: 2px;` to tokens.css next to the `--ui-chat-*` block (:180-193), use them at dooph-component-tokens.css:620 (`text-underline-offset: var(--ui-chat-prose-link-offset);`) and :626 (`border-left: var(--ui-chat-prose-quote-border-width) solid var(--ui-color-border-primary);`), run `npm run sync-tokens` (no family prefix matches `ui-chat-`, so theme.css and the generated block must not change), (no consumer doc lists the `--ui-chat-*` tokens today; token-doc coverage is F-048's). (4) Toast.tsx:80 → `variant: ToastTypes.simple,` (if F-098's rename lands first, `ToastVariant.simple`). (5) Tooltip.tsx:102-106 → `(props, ref) => (<BaseText ref={ref} variant={TextVariant.body} {...props} />)`. (6) Checkbox.tsx:15-16 → "- Indicator SVGs stay decorative (`aria-hidden`) — an interactive element inside the checkbox button is a nested control that assistive tech cannot reach. Custom indicator content goes through the `children` escape hatch." (7) CodeDigitInput.tsx:12 → "- Compose multi-digit flows through VerificationCodeInput — a hand-built row of cells loses its auto-advance, backspace, arrow navigation and paste."; VerificationCodeInput.tsx:12-13 → append "— a packaged layout would fix copy and a Button arrangement that each app has to own." (8) VerificationCodeInput.tsx:38 → delete the `"aria-label"?: string;` line. (9) SegmentedTabSelect.tsx: move the :24-28 comment and import up to the import block after :13. (10) Slider.tsx:332/:368/:380 → rename `--slider-pct` to `--ds-slider-pct` (if WI-071 has moved :368/:380 into `ds-slider-*` CSS, rename it there too: `rg -n "slider-pct" src` must show only `--ds-slider-pct`). (11) Input.stories.tsx:25 and VerificationCode.stories.tsx:31 → `export const HasError: Story = {` (names the prop it demonstrates; avoids shadowing `Error`). (12) AIChat/constants.ts:37 → append to the JSDoc: "Figma labels this property `Variant`, but it is a lifecycle phase, so the prop is `state` — the same split as AIToolPart (`state` = lifecycle, `variant` = kind of work)." Verify: `npm run lint` exit 0; `npm run sync-tokens` then `git status --porcelain src/styles/theme.css` empty and the generated block unchanged; `rg -n '"simple"' src/components/Toast/Toast.tsx` → 0 hits; `rg -n "slider-pct" src | rg -v ds-slider-pct` → 0 hits; `rg -n "export const Error" src` → only Toast.stories.tsx until WI-020 lands; getComputedStyle of a `.ds-chat-prose a` in the AIChatParts story → `text-underline-offset: 3px` and of `.ds-chat-prose blockquote` → `border-left-width: 2px` (unchanged).
- breaking: none
- contract: src/components/Checkbox/Checkbox.tsx:15-16 "Indicator SVGs stay decorative (`aria-hidden`); do not replace with interactive children unless composing via the `children` escape hatch." → consistent (same rule and exception, split into two sentences with its failure named; nothing relaxed). src/components/VerificationCode/CodeDigitInput.tsx:12 "Prefer composing through VerificationCodeInput for multi-digit flows." → consistent (failure added; the guidance is unchanged). src/components/VerificationCode/VerificationCodeInput.tsx:12-13 "Do not ship a package-level “verification section” layout" → consistent (failure appended). src/components/Slider/Slider.tsx, Tooltip.tsx, Toast.tsx, SegmentedTabSelect.tsx, AIChat/constants.ts and the stylesheets carry no `## behavior`/`## constraints` header (AIThinkingPart.tsx and AIToolPart.tsx have headers but are not edited).
- remediation: [WI-026]; no-action for items 13-20, owned by the findings named in the table (item 15: no-action, reason given)
- related: [F-017, F-018, F-030, F-040, F-048, F-076, F-098, F-105, F-110, F-112]

### F-118: S4 batch: story hygiene — hand-drawn icons and raw text elements where the DS ships them, a raw `<button>` asChild demo, a duplicate story, dead `args`, a story meta without `component`, theme-blind fills, and redundant overrides and wrappers
- severity: S4
- category: stories
- rules: [R9.24, R8.11, R11.7]
- scope: internal
- confidence: plausible: S4 batch outside the Phase-4 sample; facts re-checked by U3, U4 and U12 (each story file read in full) and re-read @ b436647 by C7c
- verified_by: "U3/U4/U12 full reads; U4: `SearchIcon`, `PlusIcon` exported from src/components/Icons. C7c @ b436647: re-read every quoted line; `ls src/components/Icons | rg 'Plus|Search'` → PlusIcon.tsx, SearchIcon.tsx; Icons/index.ts:3 `export { BaseIcon, IconSizes as IconSize }`; tokens.css:152 `--ui-prominent-color: #390ef8;`, :517 `--ui-spacing-rg: 12px;`; .storybook/main addons = ['@storybook/addon-docs'] only (no pseudo-state addon)."
- locations:
  - src/components/TextLink/TextLink.stories.tsx:27-40
  - src/components/TextLink/TextLink.stories.tsx:42-51
  - src/components/TextLink/TextLink.tsx:12
  - src/components/OutlineButton/OutlineButton.stories.tsx:4-21
  - src/components/SplitButton/SplitButton.stories.tsx:15-19
  - src/components/SplitButton/SplitButton.stories.tsx:31-40
  - src/components/CopyButton/CopyButton.stories.tsx:61-72
  - src/components/Button/Button.stories.tsx:88-91
  - src/components/Button/Button.tsx:21
  - src/components/Avatar/Avatar.stories.tsx:15
  - src/components/Avatar/Avatar.stories.tsx:19
  - src/components/Avatar/Avatar.stories.tsx:62
  - src/components/Avatar/Avatar.stories.tsx:79
  - src/components/Sticker/Sticker.stories.tsx:127
  - src/components/Sticker/Sticker.stories.tsx:141
  - src/components/Table/Table.stories.tsx:40
  - src/components/Table/Table.stories.tsx:83-86
  - src/components/Table/Table.stories.tsx:104-107
  - src/components/Table/Table.stories.tsx:244-267
  - (no-action) src/components/Table/Table.stories.tsx:279 · src/components/Button/Button.tsx:19-20
- evidence: |
    # | path:line | snippet (verbatim @ b436647) | reality | disposition
    1 | TextLink.stories.tsx:45-46 | <TextLink asChild> / <button onClick={() => alert("Button clicked!")}> | demos a TextLink-styled `<button>`; TextLink.tsx:12 documents asChild for a router link (`<TextLink asChild><Link href="…">Changelog</Link></TextLink>`); R9.24 | WI-121
    2 | TextLink.stories.tsx:27-28 · :36-39 | export const Interactive: Story = { / name: "Interactive (Hover/Active)", · args: { href: "#", children: "Hover or click to see state change", }, | no forced state (no pseudo-state addon), so it renders exactly like Default | WI-121
    3 | OutlineButton.stories.tsx:4-5 | const SearchIcon = () => ( / <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden> | re-draws an icon the DS exports (`SearchIcon`) | WI-121
    4 | SplitButton.stories.tsx:32 | <svg viewBox="0 0 14 14" fill="none" width="14" height="14"> | re-draws `PlusIcon` | WI-121
    5 | SplitButton.stories.tsx:15-19 | const meta = { / title: "Buttons/SplitButton", / parameters: { layout: "centered" }, / tags: ["autodocs"], / } satisfies Meta; | no `component`, so the autodocs page has no props table | WI-121
    6 | CopyButton.stories.tsx:62-63 · :70 | <div className="flex items-center gap-2 rounded-tight border border-solid border-secondary-border bg-secondary px-3 py-2"> · <code className="text-style-body">{snippet}</code> · <p className="text-style-body"> | raw text elements where `MonoText`/`BodyText` exist; numeric spacing where tokens exist (R9.24) | WI-121
    7 | Button.stories.tsx:91 | ) as (typeof ButtonVariant)[keyof typeof ButtonVariant][] | re-derives the exported `ButtonVariant` type | WI-121
    8 | Button.tsx:21 | * - Keep `ButtonVariant.prominent` in the API even if icon stories omit it. | a constraint that names no failure (R11.7) | WI-121
    9 | Avatar.stories.tsx:15 · :19 | fill="#0A0A0A" · fill="#390EF8" | hard-coded fills (R8.11); the near-black glyph is illegible on dark `--ui-color-surface-secondary`; the dot duplicates `--ui-prominent-color` | WI-121
    10 | Avatar.stories.tsx:62 · :79 | <div className="flex items-center gap-3"> · <span className="text-style-label text-text">⌘</span> | numeric gap (12px = `gap-rg`); raw span where `LabelText` exists | WI-121
    11 | Sticker.stories.tsx:127 · :141 | args: { children: "Milestones" }, | ignored: both stories use `render` with their own children | WI-121
    12 | Table.stories.tsx:40 | className="h-[420px] border border-border-primary rounded-soft" | re-declares Table's own border and replaces its default `rounded-normal`, so the canonical story never shows the default radius | WI-121
    13 | Table.stories.tsx:83 (also :104, :244, :250, :258, :264) | <div> | TableCell is already `flex flex-col` (Table.tsx:134); the wrapper teaches one consumers do not need | WI-121
    14 | Table.stories.tsx:279 | <Table columns="1fr 1fr" className="h-[300px]"> | a story container height is the consumer's layout value, not a token bypass (V8's correction to the same charge in F-105) | no-action
    15 | Button.tsx:19-20 | * - `prominent` was called `brand` before 5.4, in both the variant key and the / *   token family (`--ui-color-brand-*`). Neither spelling survives. | history in a contract | no-action here: F-112 (decision D-09) and F-013 (WI-124, the "5.4" label)
- impact: The stories are the DS's reference for consumers and agents. Each item teaches a pattern the system exists to prevent: hand-drawn icons and raw text nodes instead of the shipped components, a TextLink rendered as a `<button>` that its own JSDoc never describes, hex fills that break in the dark theme, a wrapper `<div>` TableCell does not need, a border/radius override on the canonical Table. The SplitButton docs page has no props table, the duplicate TextLink story hides that no story shows the hover colour, and the Button constraint gives an editor no reason to keep `prominent`.
- recommendation: One WI (WI-121), stories plus one header line. (1) TextLink.stories.tsx: delete `Interactive` (:27-40); replace `WithAsChild` (:42-51) with `name: "asChild with a router link"` rendering `<TextLink asChild><RouterLink href="#changelog">Changelog</RouterLink></TextLink>`, where `const RouterLink = forwardRef<HTMLAnchorElement, AnchorHTMLAttributes<HTMLAnchorElement>>((props, ref) => <a ref={ref} {...props} />);` is declared in the story file with the comment "stands in for Next.js `Link`". (2) OutlineButton.stories.tsx: delete the local `SearchIcon` (:4-21), `import { IconSize, SearchIcon } from "../Icons";`, and render `<SearchIcon size={IconSize.md} />` at each former use (:49, :63, :82, :92). (3) SplitButton.stories.tsx: replace the :32-39 svg with `<PlusIcon size={IconSize.rg} />` (14px, the slot's `size-[14px]`), importing both from "../Icons"; meta → `{ title: "Buttons/SplitButton", component: SplitButton, parameters: { layout: "centered" }, tags: ["autodocs"] } satisfies Meta<typeof SplitButton>` with `type Story = StoryObj<typeof meta>`. (4) CopyButton.stories.tsx:61-72: `gap-3 p-4` → `gap-rg p-md`, `gap-2 … px-3 py-2` → `gap-xs … px-rg py-xs`, `<code className="text-style-body">` → `<MonoText>`, `<p className="text-style-body">` → `<BodyText>`, importing both from "../Text". (5) Button.stories.tsx:91 → `) as ButtonVariant[]` (add `type ButtonVariant` to the constants import if needed). (6) Button.tsx:21 → "- Keep `ButtonVariant.prominent` in the API although the icon-size stories omit it — the stories are not the inventory, and dropping the key breaks every consumer's prominent call to action." (7) Avatar.stories.tsx: :15 `fill="#0A0A0A"` → `className="fill-text"`, :19 `fill="#390EF8"` → `className="fill-prominent-color"` (both utilities exist: Avatar.tsx:22 uses `text-prominent-color`, and `text-text` is the text token); :62 `gap-3` → `gap-rg`; :79 → `<LabelText className="text-text">⌘</LabelText>` importing it from "../Text". (8) Sticker.stories.tsx: delete `args: { children: "Milestones" },` at :127 and :141 (if `npm run lint` then reports a missing required arg, move `children: "Milestones"` into meta `args` instead). (9) Table.stories.tsx: :40 → `className="h-[420px]"`; remove the wrapper `<div>`/`</div>` pairs at :83-86, :104-107, :244-247, :250-253, :258-261, :264-267, leaving the two `BodyText` children directly in each TableCell; land this with or after WI-114 (F-074), which edits the same file's header cells. Verify: `npm run lint` exit 0; `rg -n "<svg" src/components/OutlineButton/OutlineButton.stories.tsx src/components/SplitButton/SplitButton.stories.tsx` → 0 hits; `rg -n 'fill="#' src/components/Avatar/Avatar.stories.tsx` → 0 hits; `rg -n "<button" src/components/TextLink/TextLink.stories.tsx` → 0 hits; Storybook: the SplitButton Docs page shows a props table, Avatar `AllSizes` is legible in dark theme, Table `Default` shows `rounded-normal` corners and the two-line cells unchanged.
- breaking: none
- contract: src/components/Button/Button.tsx:21 "Keep `ButtonVariant.prominent` in the API even if icon stories omit it." → consistent (the rule is kept and gains its failure; :19-20 are left to F-112). Story files and TextLink.tsx carry no `## behavior`/`## constraints` header (TextLink.tsx is not edited).
- remediation: [WI-121]; no-action for items 14-15 (reasons in the table)
- related: [F-013, F-074, F-089, F-105, F-112]

## DONE
