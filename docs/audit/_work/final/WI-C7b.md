# WI-C7b — work items

### WI-C7-51: Give both indeterminate loaders one role (`progressbar`) and one default size (`rg`)
- status: todo
- addresses: [F-072]
- depends_on: []
- phase: P3
- risk: low — LoadingSpinner's accessible role changes from `status` (a polite live region) to `progressbar`. A consumer test that queries `getByRole("status")` for the spinner stops matching, and a screen reader no longer announces "Loading" as a live-region update; it reads it as a busy progress bar when focus or the virtual cursor reaches it. ShapeMorphSpinner is listed under CHANGELOG `[Unreleased]` → Added (CHANGELOG.md:14), so its default size has never shipped and changing it breaks no released consumer. MorphRotationShape is not touched.
- semver: minor
- files:
  - modify: `src/components/ShapeMorphSpinner/ShapeMorphSpinner.tsx:48 @ b436647`
  - modify: `src/components/LoadingSpinner/LoadingSpinner.tsx:304 @ b436647`
  - modify: `.agents/skills/dooph-ds-loading-indicators/SKILL.md:8 @ b436647`
  - modify: `.claude/skills/dooph-ds-loading-indicators/SKILL.md:8 @ b436647` (a tracked copy, not a symlink; its line 8 is identical)
  - modify: `CHANGELOG.md:20-21 @ b436647` (`## [Unreleased]` → `### Changed`)
- anchor:
  ```tsx
  // ShapeMorphSpinner.tsx:47-49
  export const ShapeMorphSpinner = ({
    size = LoadingSpinnerSize.md,
    color = LoadingSpinnerColor.primary,
  // LoadingSpinner.tsx:294, :303-308
        size = LoadingSpinnerSize.rg,
      const svgProps: InnerSvgProps = {
        role: "status",
        "aria-label": "Loading",
        className: cn(className),
        ref,
        ...props,
  ```
  ```md
  SKILL.md:8  Four components form the M3E-inspired indicator family. `LoadingSpinner` and `ShapeMorphSpinner` are indeterminate (no `progress` prop), while `ProgressIndicator` is determinate and exclusively owns the circular rounded-wave geometry.
  ```
- why: The skill presents the two loaders as interchangeable indeterminate siblings, but swapping one for the other with no `size` changes the diameter (22 px → 32 px) and the announced role (`status` → `progressbar`), so the layout shifts and assistive tech says two different things for the same "Loading" state (F-072). ProgressIndicator (:286 `rg`, :302 `progressbar`) and ShapeMorphSpinner's own header already use the target values.
- steps:
  - [ ] 1. Reproduce (fails today): `node docs/audit/_work/scratch/W7b/51-loaders.cjs` (defaults to the audit build `C:/Users/stick/Github/dooph/dooph-ds-audit-build`, which is b436647) → prints `FAIL LoadingSpinner role="progressbar"` and `FAIL ShapeMorphSpinner default size rg`, exit 1. The other four checks (aria-label kept and overridable, ShapeMorphSpinner role, LoadingSpinner 22 px) PASS today and must still PASS after the fix.
  - [ ] 2. ShapeMorphSpinner.tsx:48:
    ```diff
    -  size = LoadingSpinnerSize.md,
    +  size = LoadingSpinnerSize.rg,
    ```
    The header (:1-6) names role="progressbar" and "the spinner size scale" but no default size, so it stays true. If WI-C7-05 has already rewritten this component into `forwardRef`, make the same one-token change in its destructure.
  - [ ] 3. LoadingSpinner.tsx:304:
    ```diff
    -      role: "status",
    +      role: "progressbar",
    ```
    Keep `"aria-label": "Loading"` (:305) before `...props` (:308) so a consumer's `aria-label` still wins. Add no `aria-valuenow`: an indeterminate ARIA 1.2 progressbar omits it. LoadingSpinner.tsx has no header contract.
  - [ ] 4. Both loading-indicators SKILL.md copies, after line 8 (blank line, then):
    ```md
    Both indeterminate loaders render `role="progressbar"` with no `aria-valuenow` and default to `size={LoadingSpinnerSize.rg}` (22 px).
    ```
    Make the identical insertion in `.agents/skills/dooph-ds-loading-indicators/SKILL.md` and `.claude/skills/dooph-ds-loading-indicators/SKILL.md`. The two files already differ elsewhere (the `.claude` copy still says `.brand` at :25 and :202). That drift belongs to decision D-10; this WI does not reconcile it.
  - [ ] 5. CHANGELOG.md `[Unreleased]` → `### Changed`, after :21:
    ```md
    - `LoadingSpinner` renders `role="progressbar"` (was `role="status"`), matching `ShapeMorphSpinner` and `ProgressIndicator`. A test that finds the spinner with `getByRole("status")` should query `getByRole("progressbar")`.
    ```
    Do not add a line for ShapeMorphSpinner's default size, because the component first ships in this release (CHANGELOG.md:14).
  - [ ] 6. Verify:
    - `npm run lint` → exit 0
    - build in a scratch worktree (`git worktree add <scratch>/wt HEAD`, copy the working-tree changes in, `npm ci && npm run build` there), then `node docs/audit/_work/scratch/W7b/51-loaders.cjs <scratch>/wt` → six PASS, exit 0; `git -C <scratch>/wt status --porcelain` → empty apart from the copied edits (no generated drift)
    - `rg -n 'role: "status"' src/components/LoadingSpinner` → no output
    - `rg -c 'Both indeterminate loaders render' .agents/skills/dooph-ds-loading-indicators/SKILL.md .claude/skills/dooph-ds-loading-indicators/SKILL.md` → `1` for each file
    - Storybook `Progress/ShapeMorphSpinner` → `Default`: the spinner is 22 px square, the same size as the LoadingSpinner `Default` story
  - [ ] 7. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: `51-loaders.cjs` exits 0 against a build of the change; `rg -n 'role: "status"|size = LoadingSpinnerSize.md' src/components/LoadingSpinner src/components/ShapeMorphSpinner` → no output; both skill copies carry the new sentence; CHANGELOG `[Unreleased]` names the role change.
- log:
  - 2026-10-02 — created by audit

### WI-C7-52: Make TableHeaderCell render every label as ButtonText, and pass bare strings to the header cells in the stories
- status: todo
- addresses: [F-074]
- depends_on: []
- phase: P3
- risk: low — plain (non-sortable) header labels gain `text-style-button` where they used to inherit the page's text style. A consumer who already wraps labels in `ButtonText` sees no change. A consumer who wraps them in another role component (for example `BodyText`) also sees no change, because that inner span's class is closer than the new outer one. The only visible change is for bare-string labels, which now match the sortable header next to them. WI-C7-02 edits the same branch (it adds `role="columnheader"` after `ref={ref}` at :94). This WI changes only :98, so the two land in either order.
- semver: patch
- files:
  - modify: `src/components/Table/Table.tsx:98 @ b436647`
  - modify: `src/components/Table/Table.stories.tsx:3,49-60,142-150,193-199,235-240,281-286 @ b436647`
  - modify: `CHANGELOG.md:20-22 @ b436647` (`## [Unreleased]`)
- anchor:
  ```tsx
  // Table.tsx:79-99
          <Button
            variant={ButtonVariant.text}
            size={ButtonSize.default}
            className="w-full justify-start gap-1 text-text-primary"
            onClick={onSort}
          >
            <ButtonText>{children}</ButtonText>
            <SortIcon direction={sortDirection} />
          </Button>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn("flex items-center px-rg py-xs", className)}
        {...props}
      >
        {children}
  ```
  ```tsx
  // Table.stories.tsx:3, :49-50, :142-143, :193-194, :235-236, :281-282 (first cell of each run)
  import { BodyText, ButtonText } from "../Text/BaseText";
          <TableHeaderCell>
            <ButtonText>Status</ButtonText>
          <TableHeaderCell>
            <BodyText>Column A</BodyText>
          <TableHeaderCell>
            <ButtonText>Name</ButtonText>
          <TableHeaderCell>
            <BodyText>Person</BodyText>
          <TableHeaderCell>
            <BodyText>Name</BodyText>
  ```
- why: Only the sortable branch applies the header text role (:85). A row that mixes sortable and plain columns therefore shows two text styles unless the consumer knows to wrap each plain label in `ButtonText`. The DS's own stories do it both ways (ButtonText in two tables, BodyText in three), so the reference cannot teach the intended style (F-074, R8.17).
- steps:
  - [ ] 1. Reproduce (fails today): `node docs/audit/_work/scratch/W7b/52-table-header.cjs` (defaults to the audit build at b436647) → prints `plain => <div class="flex items-center px-rg py-xs">Name</div>` and `FAIL plain header label carries text-style-button`, exit 1. The sortable check and the "consumer role component stays innermost" check PASS today and must still PASS.
  - [ ] 2. Table.tsx:98, plain branch:
    ```diff
    -        {children}
    +        <ButtonText>{children}</ButtonText>
    ```
    This mirrors :85. Table.tsx opens with a `"use client"` rationale comment (:1-3), not a `## behavior`/`## constraints` contract. The change adds no hook, so the comment stays true.
  - [ ] 3. Table.stories.tsx: every TableHeaderCell gets its label as a bare string. Replace each wrapped label with the bare text and collapse the cell onto one line:
    ```diff
    -        <TableHeaderCell>
    -          <ButtonText>Status</ButtonText>
    -        </TableHeaderCell>
    +        <TableHeaderCell>Status</TableHeaderCell>
    ```
    Apply this to all 14 header cells: :49-51 Status, :52-54 Role, :55-57 Email, :58-60 Joined (ButtonText); :142-144 Column A, :145-147 Column B, :148-150 Column C (BodyText); :193-195 Name, :196-198 Value (ButtonText); :235-237 Person, :238-240 Contact (BodyText); :281-283 Name, :284-286 Status (BodyText). Leave the sortable cell at :43-48 (already a bare `Name`) and every `TableCell`/`TablePlaceholder` child as they are. Then :3 → `import { BodyText } from "../Text/BaseText";`, because `ButtonText` has no other use in the file. WI-C7-62 edits :40 and the TableCell wrappers in this file, and WI-C7-59 changes Table.tsx's import paths. Neither overlaps these lines.
  - [ ] 4. CHANGELOG.md `[Unreleased]`: add a `### Fixed` heading after the `### Changed` list (:20-21) if none exists yet, then under it:
    ```md
    - `TableHeaderCell` applies the button text style to plain (non-sortable) labels too, so a header row reads in one style. Pass header labels as plain strings.
    ```
  - [ ] 5. Verify:
    - `npm run lint` → exit 0
    - scratch-worktree build of the change, then `node docs/audit/_work/scratch/W7b/52-table-header.cjs <worktree>` → three PASS, exit 0; `git -C <worktree> status --porcelain` → only the copied edits
    - `rg -n -A1 "<TableHeaderCell>\s*$" src/components/Table/Table.stories.tsx` → no output (no multi-line header cell remains)
    - `rg -n "ButtonText" src/components/Table/Table.stories.tsx` → no output
    - Storybook `Bits & Pieces/Table` → `Default`, `Header`, `Rows`, `CellStackedContent` and `Placeholder`: every header label renders in the same button style as the sortable `Name` header
  - [ ] 6. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: `52-table-header.cjs` exits 0 against a build of the change; `rg -n "ButtonText" src/components/Table/Table.stories.tsx` → no output; `rg -c "<ButtonText>\{children\}</ButtonText>" src/components/Table/Table.tsx` → `2`.
- log:
  - 2026-10-02 — created by audit

### WI-C7-53: Build the 12 shapes from one `createShape` factory, drop the vestigial Figma clipPaths, and brand the result so `shapes` props accept DS shapes only
- status: todo
- addresses: [F-080, F-089]
- depends_on: [WI-C1-02]
- phase: P3
- risk: low.
  - The seven body-C shapes (Capsule, Diamond, Double, Pixircle, Squircle, Star, Triple) render byte-identical markup (step 6 diffs it).
  - Arrow, Clover and Cookie lose their `<g clip-path>` wrappers, their `<defs><clipPath id="clip…">` and the `fill=` on the path. Their fill still comes from BaseIcon's `<svg style="fill:…">`, so the colour is unchanged. The clip was a full 24-unit rect inside the stroke-inset `<g>`, so the only possible pixel change is a sliver of stroke at the box edge that the clip used to trim. Step 6 compares those three in Storybook.
  - Pentagon and Puff lose the hard-coded `fill="currentColor"`. That is WI-C4-02's fix, and this WI subsumes it (see step 2).
  - `getShapePath` keys on component identity. Each `XShape` export is still one module-level value created once, so shapePaths.ts's table and ShapeButton's map (ShapeButton.tsx:57-60) keep working.
  - The `DsShapeComponent` brand is type-only: no runtime marker, and the runtime throw in `getShapePath` stays. It narrows `shapes` on MorphRotationShape and ShapeMorphSpinner, which are both listed under CHANGELOG `[Unreleased]` → Added (CHANGELOG.md:13-14), so no released consumer type breaks.
  - Other WIs edit the 12 leaves line by line: WI-C4-02 (Pentagon/Puff fill), WI-C1-09 (leaf line 1 `import BaseShape, …`) and WI-C7-06 (adds `...rest` to each leaf). This WI rewrites every leaf whole, so whichever of those has not landed becomes a no-op for the leaves (step 2 says how). WI-C7-06's BaseShape/ShapeProps edits are unaffected: the factory forwards every prop through `...props`, so rest props and `ref` reach BaseShape once that WI lands.
- semver: minor
- files:
  - create: `src/components/Shapes/createShape.tsx`
  - modify: `src/components/Shapes/BaseShape.tsx:1,9-10 @ b436647` (one import, one new type after `ShapeProps`. `ShapeClipPath` stays: removing it is public-surface removal, D-15 / WI-C1's export trim)
  - modify: `src/components/Shapes/{Arrow,Capsule,Clover,Cookie,Diamond,Double,Pentagon,Pixircle,Puff,Squircle,Star,Triple}Shape.tsx @ b436647` (whole file; the `*_SHAPE_PATH` string is kept byte-for-byte)
  - modify: `src/components/Shapes/shapePaths.ts @ WI-C1-02` (b436647 :1-3, :16-18, :33)
  - modify: `src/components/ShapeMorphSpinner/ShapeMorphSpinner.tsx @ WI-C1-02` (b436647 :24)
  - modify: `.agents/skills/dooph-ds-codebase/SKILL.md:140 @ b436647` (append one sentence; `.claude/skills/dooph-ds-codebase` is a symlink to it)
  - modify: `CHANGELOG.md:10-22 @ b436647` (`## [Unreleased]`)
- anchor:
  ```tsx
  // ArrowShape.tsx:1, :6-30 (CloverShape.tsx and CookieShape.tsx: the same, with two nested clip groups and ids clip0_/clip1_504_974 and _972)
  import BaseShape, { ShapeClipPath, ShapeProps } from "./BaseShape";
  export const ArrowShape = ({
    size,
    strokeColor,
    fillColor = "currentColor",
    strokeWeight,
  }: ShapeProps) => {
    return (
      <BaseShape
        size={size}
        strokeColor={strokeColor}
        fillColor={fillColor}
        strokeWeight={strokeWeight}
      >
        <g clipPath="url(#clip0_504_971)">
          <path
            d={ARROW_SHAPE_PATH}
            fill={fillColor}
          />
        </g>
        <defs>
          <ShapeClipPath id="clip0_504_971" fillColor={fillColor} />
        </defs>
      </BaseShape>
    );
  };
  // PentagonShape.tsx:19-22 and PuffShape.tsx:19-22 (body B)
        <path
          d={PENTAGON_SHAPE_PATH}
          fill="currentColor"
        />
  // SquircleShape.tsx:19 (body C — also Capsule, Diamond, Double, Pixircle, Star, Triple at :19)
        <path d={SQUIRCLE_SHAPE_PATH} />
  // BaseShape.tsx:1, :4-9
  import type { ReactNode } from "react";
  export interface ShapeProps {
    size: number;
    strokeColor?: string;
    fillColor?: string;
    strokeWeight?: number | string;
  }
  // shapePaths.ts:16-18, :33
  /** Component -> its outline in the 24-unit viewBox. Lets MorphRotationShape
   * take components without rendering them. */
  const SHAPE_PATHS = new Map<ComponentType<ShapeProps>, string>([
  export function getShapePath(Component: ComponentType<ShapeProps>): string {
  // ShapeMorphSpinner.tsx:24
  export const SHAPE_MORPH_SPINNER_SHAPES: ComponentType<ShapeProps>[] = [
  ```
- why: The 12 shape files are one component pasted 12 times with three render bodies that have already diverged once (F-004). Arrow, Clover and Cookie emit a Figma clipPath with a static id, so two of them on a page produce duplicate `id`s and every `url(#…)` resolves to the first copy (F-080). Separately, `shapes` is typed `ComponentType<ShapeProps>[]`, so `shapes={[memo(CloverShape), PuffShape]}` compiles and then throws "is not a DS shape" during render, taking the subtree down (F-089 item 1). A factory gives one render body, and it is also the one place that can stamp a type brand on exactly the twelve DS shapes.
- steps:
  - [ ] 1. Reproduce (fails today):
    - `node docs/audit/_work/scratch/W7b/53-shapes.cjs` (audit build at b436647) → `FAIL two ArrowShapes emit no id= and no clip-path` and `FAIL` for ArrowShape, CloverShape, CookieShape, PentagonShape and PuffShape on "fill:red on the svg, no fill= on the path, one <path>", exit 1. The seven other shapes and all 12 displayName checks PASS.
    - `node docs/audit/_work/scratch/W7b/53-shapes.cjs --dump > <scratchpad>/shapes-head.txt` (baseline markup for step 6).
    - `C:/Users/stick/Github/dooph/dooph-ds-audit-build/node_modules/.bin/tsc -p docs/audit/_work/scratch/W7b/types-probe/tsconfig.53.json` → `probe53.tsx(11,1)` and `(13,1)`: `error TS2578: Unused '@ts-expect-error' directive`. The wide type accepts `memo(CloverShape)` and a hand-written component.
    - The brand's mechanism is modelled standalone in `docs/audit/_work/scratch/W7b/brand-model/` (`tsc -p …/brand-model` → exit 0: the branded factory output is accepted as `shapes`, is still assignable to `ComponentType<ShapeProps>` and renders as JSX; `memo(...)` and a hand-written component are rejected).
  - [ ] 2. Precondition: WI-C1-02 has landed (`rg -n "ShapeInput" src/components/Shapes/shapePaths.ts` → hits). If WI-C4-02 has not landed, mark it done by this WI: its two edits disappear with the rewrite in step 4. Carry its CHANGELOG line ("`fillColor` now applies to `PentagonShape` and `PuffShape`.") into step 8. If WI-C1-09 or WI-C7-06 has not landed, their per-leaf edits (line 1 import, `...rest` at :10/:13) no longer apply to the leaves. Their BaseShape.tsx edits still apply.
  - [ ] 3. BaseShape.tsx — add the brand. :1 `import type { ReactNode } from "react";` → `import type { FunctionComponent, ReactNode } from "react";`. After the `ShapeProps` interface (b436647 :9; after WI-C7-06, after its `ShapeProps` declaration), insert:
    ```tsx

    declare const dsShape: unique symbol;

    /** One of the twelve DS shapes, as built by createShape. The brand is
     *  type-only (no runtime marker). It lets `shapes` props reject components
     *  getShapePath cannot map, such as `memo(CloverShape)` or a hand-written
     *  shape, at compile time instead of throwing during render. */
    export type DsShapeComponent = FunctionComponent<ShapeProps> & {
      readonly [dsShape]: true;
    };
    ```
    Leave `ShapeClipPath` (:17-33) and `SHAPE_VIEWBOX_SIZE` exported and unchanged. `Shapes/index.ts:2` (`export * from "./BaseShape";`) publishes `DsShapeComponent`. If WI-C1's export-trim WI has narrowed that line to named exports, add `DsShapeComponent` to its `export type { … }` list.
  - [ ] 4. Create `src/components/Shapes/createShape.tsx`. It is not re-exported from `Shapes/index.ts`:
    ```tsx
    import type { FunctionComponent } from "react";
    import { BaseShape, type DsShapeComponent, type ShapeProps } from "./BaseShape";

    /** The one render for every DS shape: a single `<path d>` in the 24-unit
     *  viewBox. The path carries no `fill`; it inherits BaseIcon's
     *  `<svg style="fill: …">`, so `fillColor` always applies (F-004). Call it once
     *  per shape at module level: getShapePath keys on the returned identity. */
    export const createShape = (d: string, displayName: string): DsShapeComponent => {
      const Shape: FunctionComponent<ShapeProps> = ({ fillColor = "currentColor", ...props }) => (
        <BaseShape {...props} fillColor={fillColor}>
          <path d={d} />
        </BaseShape>
      );
      Shape.displayName = displayName;
      return Shape as DsShapeComponent;
    };
    ```
    Each of the 12 leaves becomes three statements: the import, the unchanged path constant, the component. For Arrow:
    ```tsx
    import { createShape } from "./createShape";

    export const ARROW_SHAPE_PATH =
      "M17.0922 5.94811C16.4447 4.90881 … 17.0922 5.94811Z"; // the b436647 string, byte-for-byte

    export const ArrowShape = createShape(ARROW_SHAPE_PATH, "ArrowShape");
    ```
    Do the same for Capsule, Clover, Cookie, Diamond, Double, Pentagon, Pixircle, Puff, Squircle, Star and Triple (`<NAME>_SHAPE_PATH`, `"<Name>Shape"`). Edit the files in place and keep lines 3-4 (the constant) untouched, so `git diff` shows no change to any path string. No leaf imports `BaseShape`, `ShapeClipPath` or `ShapeProps` any more.
  - [ ] 5. Narrow `shapes` to the brand. These are the WI-C1-02 texts, edited:
    - shapePaths.ts: `export type ShapeInput = ComponentType<ShapeProps> | Shapes;` → `export type ShapeInput = DsShapeComponent | Shapes;`. The `SHAPE_TABLE` element type `readonly [Shapes, ComponentType<ShapeProps>, string]` → `readonly [Shapes, DsShapeComponent, string]`. `COMPONENT_BY_NAME`'s `Map<string, ComponentType<ShapeProps>>` → `Map<string, DsShapeComponent>`. `getShapeComponent(name: Shapes): ComponentType<ShapeProps>` → `: DsShapeComponent`. Replace the `ComponentType`/`ShapeProps` imports with `import type { DsShapeComponent } from "./BaseShape";`. Keep the runtime `throw` in `getShapePath`, since a JS caller or an `as` cast can still pass anything.
    - MorphRotationShape.tsx needs no edit: after WI-C1-02 its `shapes`, `shapeCache` and `useShapesKey` are typed `ShapeInput`. Its header (`## constraints` "Changing `shapes` remounts the inner component (key)", "Motion belongs to CSS, geometry belongs here") is untouched by a type-only change.
    - ShapeMorphSpinner.tsx: `export const SHAPE_MORPH_SPINNER_SHAPES: ComponentType<ShapeProps>[] = DEFAULT_SHAPE_KEYS.map(getShapeComponent);` → `export const SHAPE_MORPH_SPINNER_SHAPES: DsShapeComponent[] = DEFAULT_SHAPE_KEYS.map(getShapeComponent);`, importing `type DsShapeComponent` from `"../Shapes/BaseShape"`. Drop the `ComponentType`/`ShapeProps` imports if nothing else uses them. Its `shapes?: ShapeInput[]` prop needs no edit. WI-C7-60 later makes this array `readonly`.
    - `rg -n "ComponentType<ShapeProps>" src` → only `Shapes.stories.tsx:27` and `:73` remain (a branded shape assigns to them; leave them).
  - [ ] 6. Verify:
    - `npm run lint` → exit 0.
    - Scratch-worktree build of the change (`git worktree add <scratchpad>/wt-shapes HEAD`, copy the changed files in, `npm ci && npm run build`). `git -C <scratchpad>/wt-shapes status --porcelain` → only the copied files; `src/components/Icons/index.ts` unchanged.
    - `node docs/audit/_work/scratch/W7b/53-shapes.cjs <scratchpad>/wt-shapes` → every line PASS, exit 0.
    - `node docs/audit/_work/scratch/W7b/53-shapes.cjs <scratchpad>/wt-shapes --dump > <scratchpad>/shapes-new.txt`, then `diff <(grep -E "^(Capsule|Diamond|Double|Pixircle|Squircle|Star|Triple)Shape " <scratchpad>/shapes-head.txt) <(grep -E "^(Capsule|Diamond|Double|Pixircle|Squircle|Star|Triple)Shape " <scratchpad>/shapes-new.txt)` → no output. Skip this diff if WI-C7-06 or WI-C4-22 landed between the two builds, because both change the `<svg>` markup on purpose.
    - Point the two dist paths in `docs/audit/_work/scratch/W7b/types-probe/tsconfig.53.json` at `<scratchpad>/wt-shapes`, then `tsc -p` it → exit 0. The `bad` lines are now rejected and the `ok` lines (components, `ComponentType<ShapeProps>` assignment, JSX use) still compile.
    - `rg -n "clip0_|clip1_|ShapeClipPath|clipPath" src/components/Shapes --glob '!BaseShape.tsx'` → no output.
    - `rg -c "createShape\(" src/components/Shapes` → 12 leaf files with `1` each.
    - Storybook `Bits & Pieces/Shapes` (all stories) and `Buttons/ShapeButton`: compare Arrow, Clover and Cookie against the pre-change Storybook at 100% and 400% zoom with a visible stroke. The outline matches; at most a sub-pixel stroke sliver at the box edge differs. `Progress/ShapeMorphSpinner` and `Progress/MorphRotationShape` stories morph exactly as before.
  - [ ] 7. codebase SKILL.md:140 — append after the sentence ending "…types the shared `Shapes` type.": `` Every leaf is `createShape(<NAME>_SHAPE_PATH, "<Name>Shape")` (`Shapes/createShape.tsx`, not exported): one render body for all twelve, so a fill, stroke or prop change is made there once. The factory's return type `DsShapeComponent` (BaseShape.tsx) is a type-only brand; `shapes` props accept it (or a `Shapes` key) and reject wrappers such as `memo(CloverShape)`. `` The rest of :140 belongs to WI-C7-57 ("lifted verbatim … `Shapes/svgs/`") and WI-C2-07 (the "5.4" label). Do not touch those clauses here.
  - [ ] 8. CHANGELOG.md `[Unreleased]`:
    - `### Added`: `` - Type `DsShapeComponent` — the type of the twelve DS shape components; `MorphRotationShape`/`ShapeMorphSpinner` `shapes` accept only these (or `Shapes` keys), so a wrapped shape is a compile error instead of a render-time throw. ``
    - `### Fixed` (create the heading after `### Changed` if none exists yet): `` - `ArrowShape`, `CloverShape` and `CookieShape` no longer emit a Figma clipPath with a fixed `id`; two of them on one page no longer duplicate ids. `` Add WI-C4-02's Pentagon/Puff line here as well if step 2 carried it over.
  - [ ] 9. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: `53-shapes.cjs` exits 0 against a build of the change; the seven body-C shapes' markup is byte-identical to b436647 (unless WI-C7-06/WI-C4-22 intervened); `tsconfig.53.json` against the build exits 0; `rg -n "clipPath|ShapeClipPath" src/components/Shapes --glob '!BaseShape.tsx'` → no output; `npm run lint` exits 0.
- log:
  - 2026-10-02 — created by audit

### WI-C7-54: Make LinearProgressIndicator, Slider, CopyButton and CTAButton types say what the runtime does — no `null` value, no silent loss of extra slider values, true ref element types
- status: todo
- addresses: [F-089]
- depends_on: []
- phase: P3
- risk: medium. Each part narrows or corrects a public type, or changes how Slider handles values it used to mangle:
  - LinearProgressIndicator: `value={null}` becomes a compile error. Today it compiles and draws an empty determinate bar, so any consumer who hits the new error was rendering the wrong thing. They pass `0` or a number instead.
  - CopyButton: the ref type narrows from `HTMLElement` to `HTMLButtonElement`. A consumer `useRef<HTMLElement>()` passed as `ref` stops compiling; `useRef<HTMLButtonElement>()` keeps compiling and loses its cast. The component always renders `Button` without `asChild` (CopyButton.tsx:21 omits it), so the element is always a `<button>`.
  - CTAButton: the ref type widens from `HTMLAnchorElement` to `HTMLElement`. Every existing ref still assigns. A consumer who reads `ref.current.href` with no narrowing must now narrow, because with `asChild` the element can be a `<button>` (the DS's own `AsChildButton` story does this).
  - Slider: the public type does not change. Radix is handed `[value[0]]` instead of the whole array. Single-value sliders (every DS story and the documented API) behave exactly as before. A consumer who passed `[a, b]` now gets `[a', b]` back from every interaction. Today they get `[a']` from a stepped key press, and a pointer press nearer to `b` moves the hidden value `b` and can re-sort the array (Radix `getClosestValueIndex` / `getNextSortedValues`, react-slider 1.4.7 dist/index.mjs:84/:102). WI-C7-01 edits the same `handleKeyDown` (:217-239) but keeps :251, so the two do not overlap.
- semver: minor
- files:
  - modify: `src/components/LinearProgressIndicator/LinearProgressIndicator.tsx:27-32 @ b436647`
  - modify: `src/components/Slider/Slider.tsx:45,177-203,251,318 @ b436647`
  - modify: `src/components/Slider/Slider.stories.tsx:287 @ b436647` (one story added after `ControlledStepped`)
  - modify: `src/components/CopyButton/CopyButton.tsx:29,72 @ b436647`
  - modify: `src/components/CTAButton/CTAButton.tsx:2-9,51,128 @ b436647`
  - modify: `skills/dooph-design-system-usage/SKILL.md:127 @ b436647`
  - modify: `.agents/skills/dooph-ds-codebase/SKILL.md:306 @ b436647`
  - modify: `CHANGELOG.md:10-22 @ b436647` (`## [Unreleased]`)
- anchor:
  ```tsx
  // LinearProgressIndicator.tsx:27-32
  export interface LinearProgressIndicatorProps
    extends ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
    /** Filled-bar color. Accepts a DS token name ('primary', 'brand', 'text') or
     * any CSS color. Defaults to the primary token. */
    color?: DsColor;
  }
  // Slider.tsx:45
  export type SliderProps = RootProps & SliderPaintProps;
  // Slider.tsx:177-203
    const handleValueChange = useCallback(
      (next: number[]) => {
        if (!showSteps) {
          setInternal(next);
          onValueChange?.(next);
          return;
        }
        setDrag(next);
        publish(next.map(snap));
      },
      [onValueChange, publish, showSteps, snap],
    );

    const handleValueCommit = useCallback(
      (next: number[]) => {
        setDragging(false);
        if (!showSteps) {
          onValueCommit?.(next);
          return;
        }
        const snapped = next.map(snap);
        setDrag(null);
        publish(snapped);
        onValueCommit?.(snapped);
      },
      [onValueCommit, publish, showSteps, snap],
    );
  // Slider.tsx:251, :318
      const committed = [snap(Math.min(max, Math.max(min, next)))];
            value={display}
  // CopyButton.tsx:29, :72
  const CopyButton = forwardRef<HTMLElement, CopyButtonProps>(
          ref={ref as React.Ref<HTMLButtonElement>}
  // CTAButton.tsx:51, :128
  const CTAButton = forwardRef<HTMLAnchorElement, CTAButtonProps>(
      <a ref={ref} className={rootClassName} {...props}>
  ```
- why: Each of these typed inputs is narrowed by the runtime, silently or by throwing, and the type does not say so (F-089 items 2-4). `value={null}`, Radix's documented indeterminate state, compiles and draws an empty determinate bar. Slider's `number[]` admits Radix's range form, which the single-thumb DS slider truncates (stepped arrow key) or edits invisibly (pointer), so the consumer's own state is lost with no error. CTAButton's `asChild` onto a `<button>` gives a ref typed as an anchor (`ref.current.href` type-checks and is undefined). CopyButton consumers must cast to reach `HTMLButtonElement` members. (F-089 item 1, `shapes`, is WI-C7-53.)
- steps:
  - [ ] 1. Reproduce (fails today):
    - `C:/Users/stick/Github/dooph/dooph-ds-audit-build/node_modules/.bin/tsc -p docs/audit/_work/scratch/W7b/types-probe/tsconfig.54.json` → `probe54.tsx(12,8): error TS2578: Unused '@ts-expect-error' directive` (`value={null}` accepted), `probe54.tsx(22,14): … Type 'true' is not assignable to type 'false'` (CopyButton's ref is not `HTMLButtonElement`) and `probe54.tsx(24,14): error TS2740` (CTAButton's ref cannot hold the `<button>` its own story renders); exit 2.
    - Slider: first add the story from step 4 to Slider.stories.tsx, then run `npm run storybook` and open `Inputs/Slider` → `Extra values pass through`. Focus the handle and press ArrowRight → the readout shows `[2]` (the second value is lost; defect). Reload, then press the pointer on the track just right of the `3` position → the handle does not follow the pointer and the readout's second value changes (the hidden value moved; defect).
  - [ ] 2. LinearProgressIndicator.tsx:27-32 →
    ```tsx
    export interface LinearProgressIndicatorProps
      extends Omit<ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>, 'value'> {
      /** 0…`max`. Determinate only: Radix's `null` (indeterminate) is not supported. */
      value?: number;
      /** Filled-bar color. Accepts a DS token name ('primary', 'brand', 'text') or
       * any CSS color. Defaults to the primary token. */
      color?: DsColor;
    }
    ```
    Keep :39-41 as they are (`value = 0` and `value ?? 0` are harmless). The header (:3-15) says "determinate bar" and "`value` / `max` clamp into a percentage", which stays true; it gains nothing. The `'brand'` in the color JSDoc belongs to the rename WIs, not this one.
  - [ ] 3. Slider.tsx — hand Radix one value and re-attach the consumer's extras on every path.
    - Before `handleValueChange` (:177), insert:
      ```tsx
      /* Single thumb: Radix is handed only value[0] (Root `value` below), so its
       * callbacks carry one value. Re-attach the consumer's extra values so an
       * `[a, b]` state comes back as `[a', b]`, never truncated, moved or
       * re-sorted by Radix's closest-thumb logic. */
      const withExtras = useCallback(
        (first: number) => [first, ...settled.slice(1)],
        [settled],
      );
      ```
    - :177-203 →
      ```tsx
      const handleValueChange = useCallback(
        (next: number[]) => {
          if (!showSteps) {
            const merged = withExtras(next[0] ?? min);
            setInternal(merged);
            onValueChange?.(merged);
            return;
          }
          setDrag(next);
          publish(withExtras(snap(next[0] ?? min)));
        },
        [min, onValueChange, publish, showSteps, snap, withExtras],
      );

      const handleValueCommit = useCallback(
        (next: number[]) => {
          setDragging(false);
          if (!showSteps) {
            onValueCommit?.(withExtras(next[0] ?? min));
            return;
          }
          const snapped = withExtras(snap(next[0] ?? min));
          setDrag(null);
          publish(snapped);
          onValueCommit?.(snapped);
        },
        [min, onValueCommit, publish, showSteps, snap, withExtras],
      );
      ```
      Extras are passed through as given. They are not snapped, so a value off the step grid stays the consumer's.
    - :251 → `const committed = withExtras(snap(Math.min(max, Math.max(min, next))));`
    - :318 → `value={[display[0] ?? min]}`. `drag` holds Radix's one-value array and `settled` holds the consumer's array; `display[0]` is already the only value drawn or read (:222, :273, :396).
    - :45 → add JSDoc above `export type SliderProps`:
      ```tsx
      /** Single thumb. Only `value[0]` / `defaultValue[0]` is drawn and edited; any
       *  further values are passed back unchanged in `onValueChange` / `onValueCommit`. */
      ```
    Slider.tsx has no `## behavior`/`## constraints` header.
  - [ ] 4. Slider.stories.tsx — after `ControlledStepped` (ends :287), add:
    ```tsx
    export const ExtraValuesPassThrough: Story = {
      name: 'Extra values pass through',
      parameters: {
        docs: {
          description: {
            story:
              'The sliders are single-thumb: only `value[0]` is drawn and edited. Further values in the array come back unchanged — press ArrowRight or drag, and the readout keeps its second value.',
          },
        },
      },
      render: () => {
        const [value, setValue] = useState([1, 3]);
        return (
          <div className="flex w-64 items-center gap-3">
            <SliderStepped min={0} max={4} step={1} value={value} onValueChange={setValue} />
            <LabelText className="w-12 text-text-tertiary">{JSON.stringify(value)}</LabelText>
          </div>
        );
      },
    };
    ```
  - [ ] 5. CopyButton.tsx:29 → `const CopyButton = forwardRef<HTMLButtonElement, CopyButtonProps>(`; :72 → `ref={ref}` (drop the `as React.Ref<HTMLButtonElement>` cast; `Button`'s polymorphic ref for the default `"button"` element is `Ref<HTMLButtonElement>`).
  - [ ] 6. CTAButton.tsx:51 → `const CTAButton = forwardRef<HTMLElement, CTAButtonProps>(` (`asChild` admits any element). :121 `<Slot ref={ref} …>` compiles unchanged (Slot's ref is `HTMLElement`). :128 → `<a ref={ref as ForwardedRef<HTMLAnchorElement>} className={rootClassName} {...props}>`, with the comment `{/* this branch always renders an <a>; the HTMLElement ref type is for asChild */}` above it, and add `type ForwardedRef,` to the react import at :2-9. Without the cast, `ForwardedRef<HTMLElement>` is not assignable to an anchor's `Ref<HTMLAnchorElement>` (TS2322, checked in `docs/audit/_work/scratch/W7b/brand-model/ref-model.tsx`).
  - [ ] 7. Docs and changelog:
    - usage SKILL.md:127: `` adds `labels: { start, end }`), `VerificationCodeInput` `` → `` adds `labels: { start, end }`; all three are single-thumb — only `value[0]` is drawn and edited, and further values come back unchanged), `VerificationCodeInput` ``.
    - codebase SKILL.md:306, in the LinearProgressIndicator row after `clamps \`value\` into \`[0, max]\` before computing \`--progress-pct\`` insert `; determinate only — \`value\` is \`number\`, Radix's \`null\` is not accepted`.
    - CHANGELOG `[Unreleased]` `### Changed`: `` - `LinearProgressIndicator` `value` is `number` only; `null` (Radix's indeterminate state, never supported) is now a compile error. `` / `` - `CopyButton` forwards an `HTMLButtonElement` ref (was `HTMLElement`); `CTAButton` forwards an `HTMLElement` ref (was `HTMLAnchorElement`), since `asChild` can render any element. ``; `### Fixed` (create after `### Changed` if missing): `` - `Slider*` no longer drops or moves extra values in a multi-value `value` array: only `value[0]` is edited and the rest come back unchanged. ``
  - [ ] 8. Verify:
    - `npm run lint` → exit 0.
    - Scratch-worktree build of the change; point the two dist paths of `docs/audit/_work/scratch/W7b/types-probe/tsconfig.54.json` at it; `tsc -p` → exit 0.
    - Storybook `Inputs/Slider` → `Extra values pass through`: ArrowRight from `[1,3]` → `[2,3]`; Home → `[0,3]`; dragging the handle to the far right → `[4,3]` and the handle follows the pointer the whole way. `Controlled (stepped)`, `Keyboard interaction` and `Stepped` behave as before (one value, one dot per key press, smooth drag, glide onto the dot on release).
    - Storybook `Buttons/CTAButton` → `AsChildButton` still renders and clicks.
    - `rg -n "as React.Ref<HTMLButtonElement>" src/components/CopyButton` → no output.
  - [ ] 9. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: `tsconfig.54.json` against a build of the change exits 0; the `Extra values pass through` story returns `[a', 3]` for every key and pointer interaction; `npm run lint` exits 0; CHANGELOG `[Unreleased]` names the three type changes and the Slider fix.
- log:
  - 2026-10-02 — created by audit

### WI-C7-55: Merge `triggerProps.className` after the split trigger's seam classes, and never let a part-level `disabled={false}` re-enable a disabled split control
- status: todo
- addresses: [F-095]
- depends_on: []
- phase: P3
- risk: low. Two combinations that render broken controls today now render correctly:
  - `triggerProps.className` used to replace the seam classes and now adds to them.
  - `disabled` on the composite combined with `disabled: false` on a part used to leave that part live; it now stays disabled.
  - A part-level `disabled: true` still disables that part, as today.
  - DatePickerSplitTrigger's preset half keeps following only the component-level `disabled` (:125-126). That is now documented on `triggerProps`.
  - WI-C7-05, WI-C5-06 and WI-C5-07 rewrite SplitButton's composite around the same two JSX lines. Match by content (`disabled={disabled} {...actionProps}` / `disabled={disabled} {...triggerProps}`), not by line number.
- semver: patch
- files:
  - modify: `src/components/DatePicker/DatePickerSplitTrigger.tsx:35-36,63-64,99-103 @ b436647`
  - modify: `src/components/SplitButton/SplitButton.tsx:90,93 @ b436647`
  - modify: `CHANGELOG.md:10-22 @ b436647` (`## [Unreleased]`)
- anchor:
  ```tsx
  // DatePickerSplitTrigger.tsx:35-36
    /** Props forwarded to the INTERNAL left trigger. Ignored when `trigger` is set. */
    triggerProps?: ComponentPropsWithoutRef<"button">;
  // DatePickerSplitTrigger.tsx:99-103
          <DropdownTrigger
            disabled={disabled}
            className="rounded-r-none border-r-0"
            {...triggerProps}
          >
  // SplitButton.tsx:90, :93
        <SplitButtonAction icon={icon} disabled={disabled} {...actionProps}>
        <SplitButtonTrigger disabled={disabled} {...triggerProps} />
  ```
- why: `triggerProps` is the documented way to customise the internal trigger (:35), but it is spread after the seam classes and `disabled`, so it replaces them. `triggerProps={{ className: "w-60" }}` drops `rounded-r-none border-r-0` and doubles the seam. `disabled` with `triggerProps={{ disabled: false }}` leaves the left half live while the preset half paints disabled. SplitButton's two parts have the same `disabled` shape (F-095, R8.7: internal classes first, consumer classes last, merged).
- steps:
  - [ ] 1. Reproduce (fails today): `node docs/audit/_work/scratch/W7b/55-split-triggers.cjs` (audit build at b436647) → `FAIL triggerProps.className keeps the seam classes`, `FAIL disabled + triggerProps.disabled=false keeps the left trigger disabled`, `FAIL SplitButton disabled wins over actionProps/triggerProps disabled=false`; exit 1. The two other checks (`w-60` applied; `triggerProps.disabled` alone disables) PASS today and must still PASS.
  - [ ] 2. DatePickerSplitTrigger.tsx. After `const now = startOfDay(today ?? new Date());` (:64), add:
    ```tsx
    // Consumer trigger props spread first; the seam classes and the
    // component-level `disabled` are merged in after, so neither can be undone.
    const {
      className: triggerClassName,
      disabled: triggerDisabled,
      ...restTriggerProps
    } = triggerProps ?? {};
    ```
    Replace :99-103 with:
    ```tsx
          <DropdownTrigger
            {...restTriggerProps}
            disabled={disabled || triggerDisabled}
            className={cn("rounded-r-none border-r-0", triggerClassName)}
          >
    ```
    `cn` is already imported (:4). DropdownTrigger merges the `className` it receives after its own classes (DropdownTrigger.tsx:52/:69), so the order is DropdownTrigger base, then seam, then consumer.
  - [ ] 3. DatePickerSplitTrigger.tsx:35 JSDoc →
    ```tsx
      /** Props forwarded to the INTERNAL left trigger. Ignored when `trigger` is set.
       *  `className` is merged after the seam classes; `disabled` here can only add
       *  to the component's `disabled` (which also disables the presets). */
    ```
    The file has no `## behavior`/`## constraints` header.
  - [ ] 4. SplitButton.tsx (match by content):
    ```diff
    -      <SplitButtonAction icon={icon} disabled={disabled} {...actionProps}>
    +      <SplitButtonAction icon={icon} {...actionProps} disabled={disabled || actionProps?.disabled}>
    -      <SplitButtonTrigger disabled={disabled} {...triggerProps} />
    +      <SplitButtonTrigger {...triggerProps} disabled={disabled || triggerProps?.disabled} />
    ```
    `icon` stays before the spread, so `actionProps.icon` still overrides it as today. SplitButton.tsx has no header contract.
  - [ ] 5. CHANGELOG.md `[Unreleased]` → `### Fixed` (create after `### Changed` if none exists yet): `` - `DatePickerSplitTrigger` merges `triggerProps.className` after its seam classes instead of replacing them, and `disabled` on `DatePickerSplitTrigger` / `SplitButton` can no longer be undone by a part's `disabled: false`. ``
  - [ ] 6. Verify:
    - `npm run lint` → exit 0.
    - Scratch-worktree build of the change; `node docs/audit/_work/scratch/W7b/55-split-triggers.cjs <worktree>` → five PASS, exit 0.
    - Storybook `Dates/DatePicker` → `SplitTrigger` and `Buttons/SplitButton` look unchanged (no story passes `triggerProps.className` or a part-level `disabled` today).
  - [ ] 7. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: `55-split-triggers.cjs` exits 0 against a build of the change; `rg -n "\{\.\.\.triggerProps\}\s*$" src/components/DatePicker/DatePickerSplitTrigger.tsx` → no output; `npm run lint` exits 0.
- log:
  - 2026-10-02 — created by audit

### WI-C7-56: In 6.0.0, rename `TooltipTypes`/`ToastTypes` to `TooltipVariant`/`ToastVariant` and `ToggleSize.iconSm` to `ToggleSize.iconMicro`, and record the `default`/`standard` base-size split (recommended D-16 option)
- status: blocked(D-16)
- addresses: [F-098]
- depends_on: [WI-RELEASE-OPEN]
- phase: P4
- risk: medium. Every rename is a hard compile error for a consumer who used the old name, which is the intended, visible failure.
  - The one quiet case is `size="icon-sm"` passed to `ToggleSwitch` as a raw string. It also fails to compile, because `"icon-sm"` is no longer a `ToggleSize`. A JavaScript consumer, though, gets no error: the value falls through `OPTION_SIZE` to `undefined`, cva applies its `defaultVariants` size (toggleOption.ts:65-67), and the switch silently renders at the 38px default size instead of 28px. The migration skill must list that row as silent.
  - No rendered output changes for code that compiles after the rename: `ToggleSize.iconMicro` paints exactly what `ToggleSize.iconSm` painted (`size-tab-micro`, 28×28).
  - Other WIs edit these files, so match by content, not line number: WI-C7-61 (Toast.tsx:80 `variant: "simple"` → `ToastTypes.simple`; if it lands first, rename that use too), WI-C3-15 (Toast story names `Brand`/`Error`), WI-C3-17 and WI-C7-03 (arch:122).
  - If D-01 resolves to 5.4.0 instead of a major, do not do this WI. Its minor-safe subset is: add `TooltipVariant`/`ToastVariant` as new exports next to the old names, plus the two arch-table rows.
- semver: major
- files:
  - modify: `src/components/Tooltip/constants.ts:4,9 @ b436647`
  - modify: `src/components/Tooltip/index.ts:9 @ b436647`
  - modify: `src/components/Tooltip/Tooltip.tsx:12,14,34,47,67,69,71 @ b436647`
  - modify: `src/components/Tooltip/Tooltip.stories.tsx:13,23,60,76 @ b436647`
  - modify: `src/components/AIChat/AIModelSelect.tsx:39,219 @ b436647`
  - modify: `src/components/Toast/constants.ts:4,10 @ b436647`
  - modify: `src/components/Toast/index.ts:11 @ b436647`
  - modify: `src/components/Toast/Toast.tsx:21,23,28,41,87,219,253,286,298 @ b436647`
  - modify: `src/components/Toast/Toast.stories.tsx:5,21,32,45,53,61,77,143,144,145,161 @ b436647`
  - modify: `src/components/Toggle/constants.ts:6,23-33 @ b436647`
  - modify: `src/components/Toggle/Toggle.tsx:36-42 @ b436647`
  - modify: `src/components/Toggle/Toggle.stories.tsx:45,50 @ b436647`
  - modify: `.agents/skills/dooph-ds-architecture/SKILL.md:55,119 @ b436647`
  - modify: `.agents/skills/dooph-ds-codebase/SKILL.md:150,240,456 @ b436647`
  - modify: `skills/dooph-design-system-v6-migration/SKILL.md` (created by WI-RELEASE-OPEN), and its `codemod.mjs` if WI-RELEASE-OPEN step 5 created one
  - modify: `CHANGELOG.md:10-22 @ b436647` (`## [Unreleased]`)
- anchor:
  ```ts
  // Tooltip/constants.ts:4-9
  export const TooltipTypes = {
    simple: "simple",
    rich: "rich",
    complex: "complex",
  } as const;
  export type TooltipTypes = (typeof TooltipTypes)[keyof typeof TooltipTypes];
  // Toast/constants.ts:4-10
  export const ToastTypes = {
    simple: "simple",
    prominent: "prominent",
    danger: "danger",
    complex: "complex",
  } as const;
  export type ToastTypes = (typeof ToastTypes)[keyof typeof ToastTypes];
  // Toggle/constants.ts:23-33
  /**
   * Named after the Figma Toggle Switch sizes.
   * default 38 · sm 34 · icon 38×38 · iconSm = Figma "Icon Small", the 28×28
   * MICRO icon option (not the 34×34 one).
   */
  export const ToggleSize = {
    default: "default",
    sm: "sm",
    icon: "icon",
    iconSm: "icon-sm",
  } as const;
  // Toggle.tsx:36-42
  /** Switch size → Toggle Option size. Figma's switch "Icon Small" is the micro icon option. */
  const OPTION_SIZE: Record<ToggleSize, ToggleOptionSize> = {
    default: "default",
    sm: "sm",
    icon: "icon",
    "icon-sm": "icon-micro",
  };
  ```
  ```md
  arch SKILL.md:55   | `DropdownMenuSegmentVariant` | `variant` | `<DropdownMenuSegment variant={DropdownMenuSegmentVariant.labeled}>Filter by</DropdownMenuSegment>` |
  arch SKILL.md:119  - Const keys are **camelCase** (e.g. `iconSm`, not `IconSm` or `icon-sm`). The string VALUE may differ (`"icon-sm"` to match cva key).
  ```
- why: Dot-accessible consts exist so the next key is guessable, and two splits defeat that (F-098). `TabSize.iconSm` and `ToggleSize.iconSm` share a key and a value (`"icon-sm"`) on the same Toggle Option recipe. Yet a tab renders 34×34 and a toggle 28×28 (Toggle.tsx:41 remaps it), so matching a tab row and a toggle row by name gives mismatched controls. Every other const that drives `variant` is `*Variant` (arch:36-55); `TooltipTypes`/`ToastTypes` are missing from that table, and the plural `*Types` reads like the `type` prop name arch:122 bans. D-16 recommends (a) for both of these, and (b) — record, do not rename — for `standard`/`default`.
- steps:
  - [ ] 1. Preconditions and baseline. Confirm D-16 is decided as recommended in `docs/audit/_work/remediation-decisions.md` and D-01 = 6.0.0, and that `skills/dooph-design-system-v6-migration/SKILL.md` exists (WI-RELEASE-OPEN). If D-16 chose (a) for sizes as well, also do step 6. Baseline: `rg -n "TooltipTypes|ToastTypes" src .agents/skills skills` → 41 lines at b436647 (39 in src, plus codebase SKILL.md:240 and :456). `rg -n "iconSm" src/components/Toggle` → constants.ts:6, :25, :32, Toggle.stories.tsx:45, :50.
  - [ ] 2. Tooltip and Toast renames (no alias shims; repo practice):
    - Tooltip/constants.ts:4 → `export const TooltipVariant = {`; :9 → `export type TooltipVariant = (typeof TooltipVariant)[keyof typeof TooltipVariant];`.
    - Toast/constants.ts:4 → `export const ToastVariant = {`; :10 → `export type ToastVariant = (typeof ToastVariant)[keyof typeof ToastVariant];`.
    - Replace the identifier everywhere else with a word-boundary edit over the listed files only: `rg -l "\bTooltipTypes\b" src | xargs sed -i 's/\bTooltipTypes\b/TooltipVariant/g'` and the same for `ToastTypes` → `ToastVariant`. This covers Tooltip/index.ts:9, Tooltip.tsx:12/:14/:34/:47/:67/:69/:71, Tooltip.stories.tsx:13/:23/:60/:76, AIModelSelect.tsx:39/:219, Toast/index.ts:11, Toast.tsx:21/:23/:28/:41/:87/:219/:253/:286/:298 and Toast.stories.tsx:5/:21/:32/:45/:53/:61/:77/:143-145/:161. The comments at Tooltip.tsx:12 and Toast.tsx:21 ("TooltipTypes (+ its type) lives in ./constants") are renamed with it.
    - AIModelSelect.tsx carries a header contract (:11-18: no model catalogue or provider enum, provider colour as a custom property, AIModelSelectItem IS a DropdownMenuRadioSelectItem). The rename touches only the import at :39 and its use at :219, so the contract is unaffected.
    - Do not edit CHANGELOG.md:46, a released-version entry that names `ToastTypes`/`TooltipTypes` as history.
  - [ ] 3. Toggle `iconSm` → `iconMicro`:
    - Toggle/constants.ts:23-33 →
      ```ts
      /**
       * Named after the Figma Toggle Switch sizes.
       * default 38 · sm 34 · icon 38×38 · iconMicro = Figma "Icon Small", the
       * 28×28 micro icon option. `iconSm`/"icon-sm" is 34×34 in every DS size
       * const (TabSize, ButtonSize), so the switch's 28px option is not called that.
       */
      export const ToggleSize = {
        default: "default",
        sm: "sm",
        icon: "icon",
        iconMicro: "icon-micro",
      } as const;
      ```
      :6 usage example → `` * Usage: <ToggleSwitch variant={ToggleVariant.ghost} size={ToggleSize.iconMicro} /> ``.
    - Toggle.tsx:36-42 → JSDoc `/** Switch size → Toggle Option size (identity today; kept so the two scales can diverge). */` and `"icon-micro": "icon-micro",` in place of `"icon-sm": "icon-micro",`.
    - Toggle.stories.tsx:45 → `` /** Icon switches — `iconMicro` is Figma "Icon Small": the 28px micro option. */ ``; :50 `ToggleSize.iconSm` → `ToggleSize.iconMicro`.
    - Do not add a 34×34 ToggleSwitch size in this change.
  - [ ] 4. Skills:
    - arch SKILL.md, after :55 add two rows:
      ```md
      | `TooltipVariant`   | `variant` | `<TooltipContent variant={TooltipVariant.rich} />`            |
      | `ToastVariant`     | `variant` | `useToast().toast({ title: "Saved", variant: ToastVariant.prominent })` (an option, not a prop; Toast.tsx:211-219) |
      ```
    - arch SKILL.md, after :119 add: `` - Base-size key: `default` for controls on the Button height scale (Button, Tab, Toggle, TextDropdown); `standard` for fixed-shape or content-hugging surfaces (Avatar, Sticker, CTAButton, Segmented). Small is always `sm`, except `AvatarSize.small` (kept for compatibility). `iconSm`/`"icon-sm"` is always the 34×34 icon size; the 28×28 one is `iconMicro`/`"icon-micro"`. ``
    - codebase SKILL.md:150 `` `ToggleSize` (`default`\|`sm`\|`icon`\|`iconSm`=28px micro) `` → `` `ToggleSize` (`default`\|`sm`\|`icon`\|`iconMicro`=28px micro) ``; :240 `` `TooltipTypes.simple/rich/complex` `` → `` `TooltipVariant.simple/rich/complex` ``; :456 `` `ToastTypes.simple`/`.complex` `` → `` `ToastVariant.simple`/`.complex` ``.
    - v6 migration skill, under `## Changes added by later 6.0 work items`, as hard renames with word-boundary detection patterns (R13.9): `TooltipTypes` → `TooltipVariant` (`\bTooltipTypes\b`), `ToastTypes` → `ToastVariant` (`\bToastTypes\b`), `ToggleSize.iconSm` → `ToggleSize.iconMicro` (`\bToggleSize\.iconSm\b`). Put one row in the silent bucket: a raw `size="icon-sm"` on `ToggleSwitch` → `size="icon-micro"` (pattern `<ToggleSwitch[^>]*size=["']icon-sm["']`), which in JavaScript silently renders the 38px default size. If WI-RELEASE-OPEN created `codemod.mjs`, add the three identifier renames to its AUTO list and the raw-string row to its REPORT list.
  - [ ] 5. CHANGELOG.md `[Unreleased]` → `### Changed` (breaking): `` - `TooltipTypes` → `TooltipVariant`, `ToastTypes` → `ToastVariant`, `ToggleSize.iconSm` → `ToggleSize.iconMicro` (value `"icon-micro"`) (see `dooph-design-system-v6-migration`). ``
  - [ ] 6. Only if D-16 chose (a) for sizes too: `AvatarSize.standard`/`.small` → `.default`/`.sm` (Avatar.tsx:4-8), `StickerSize.standard` → `.default` (Sticker/constants.ts:38-41), `CTAButtonSize.standard` → `.default` (CTAButton/constants.ts:11-14, CTAButton.tsx:15-16/:56 `SIZES` key and default), `SegmentedSize.standard` → `.default` (SegmentedTabSelect/constants.ts:26-31). Rename every use the same way: `rg -n "AvatarSize\.(standard|small)|StickerSize\.standard|CTAButtonSize\.standard|SegmentedSize\.standard" src skills .agents/skills` must reach 0. Update usage SKILL.md:119 (`` `CTAButtonSize`: `standard` | `big` ``), add one migration-skill row each, and replace step 4's "Base-size key" line with "Base size is always `default`; small is always `sm`."
  - [ ] 7. Verify:
    - `npm run lint` → exit 0.
    - `rg -n "TooltipTypes|ToastTypes" src skills .agents/skills .claude/skills --glob '!skills/dooph-design-system-v6-migration/**'` → no output.
    - `rg -n "iconSm|icon-sm" src/components/Toggle` → no output.
    - Scratch-worktree build; `git -C <worktree> status --porcelain` → only the copied edits. Then `node -e "const B='<worktree>';const R=require(B+'/node_modules/react'),S=require(B+'/node_modules/react-dom/server'),d=require(B+'/dist/index.cjs');const h=R.createElement;const o=S.renderToStaticMarkup(h(d.ToggleSwitch,{defaultValue:'a',size:d.ToggleSize.iconMicro},h(d.ToggleSwitchItem,{value:'a','aria-label':'A'},'x')));console.log(/size-tab-micro/.test(o)?'PASS iconMicro → size-tab-micro':'FAIL '+o);console.log('TooltipVariant' in d && 'ToastVariant' in d && !('TooltipTypes' in d) && !('ToastTypes' in d) ? 'PASS exports' : 'FAIL exports')"` → two PASS lines.
    - Storybook `Inputs/ToggleSwitch` → `IconSizes`: the second size of each variant is the 28px micro switch, as before. The Tooltip and Toast stories render as before.
  - [ ] 8. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: `rg -n "TooltipTypes|ToastTypes" src skills .agents/skills` → hits only in the v6 migration skill; `rg -n "iconSm" src/components/Toggle` → no output; the built `ToggleSize.iconMicro` renders `size-tab-micro`; the arch naming table lists `TooltipVariant` and `ToastVariant`; the migration skill lists all three renames plus the silent raw-string row.
- log:
  - 2026-10-02 — created by audit

### WI-C7-57: Delete the drifted `Shapes/svgs/` copies and make the codebase skill name the `*_SHAPE_PATH` constants as the canonical shape geometry
- status: todo
- addresses: [F-108]
- depends_on: []
- phase: P1
- risk: low. The folder does not ship (package.json:35-39 `files` = `dist`, `skills`, `bin`). No code, script, story, build entry or Storybook config reads it: tsup's entry is `src/**/*.{ts,tsx}`, and Storybook loads only `*.stories.*`. Deleting it changes no output. The one consumer of the files is the audit's own `docs/audit/_work/scratch/U10/verify-shape-svgs.mjs`, which will then report `NO SVG FILE` for every shape. That is expected, and the script is scratch. Line 140 of the codebase skill is also edited by WI-C7-53 (appends a sentence) and WI-C2-07 (the "5.4" label in the `GemShape` sentence). This WI rewrites only the "lifted verbatim … `Shapes/svgs/`" clause.
- semver: none
- files:
  - delete: `src/components/Shapes/svgs/` (11 files at b436647: arrow, capsule, clover, cookie, diamond, double, pentagon, pixircle, puff, squircle, triple `.svg`; there is no star.svg)
  - modify: `.agents/skills/dooph-ds-codebase/SKILL.md:140 @ b436647` (`.claude/skills/dooph-ds-codebase` is a symlink to it; edit the `.agents/` file only)
- anchor:
  ```md
  SKILL.md:140  `Shapes/` (`src/components/Shapes/`): `ArrowShape`, `CapsuleShape`, `CloverShape`, `CookieShape`, `DiamondShape`, `DoubleShape`, `PentagonShape`, `PixircleShape`, `PuffShape`, `SquircleShape`, `StarShape`, `TripleShape` — plain SVG shape primitives (`size`, `strokeColor`, `fillColor`, `strokeWeight` props), each one `<path d>` lifted verbatim from the Figma export kept alongside in `Shapes/svgs/`. `GemShape` was REMOVED in 5.4; do not reintroduce it. `Shapes` const (from `Shapes/index.ts`) enumerates the same twelve keys and types the shared `Shapes` type.
  ```
  ```xml
  pentagon.svg:2  <path d="M9.47822 2.46207C10.9819 1.42931 13.0181 1.42931 14.5218 2.46207L21.4812 7.24185 …
  PentagonShape.tsx:3-4  export const PENTAGON_SHAPE_PATH =
                           "M9.3101 0.863758C10.914 -0.28792 13.086 -0.287919 14.6899 0.863759L22.1133 6.19394 …
  ```
- why: The skill tells the next agent that the svg files are the verbatim source of every `*_SHAPE_PATH` (claims register C-CB-46: FALSE). Pentagon and Puff differ, and Star has no svg. An agent that "re-syncs from the Figma export" would silently change two public shapes, along with the MorphRotationShape poses and symmetry and the premise of the svgPath.ts constraint ("Pentagon is 23 units tall", which is true of the constant, not of pentagon.svg) (F-108). The constants are canonical: they ship, shapePaths.ts maps them, and the svgPath.ts constraint reasons about them. So the stale copy is removed rather than refreshed.
- steps:
  - [ ] 1. Baseline (shows the drift): `node docs/audit/_work/scratch/U10/verify-shape-svgs.mjs .` → 9 `MATCHES`, `PENTAGON_SHAPE_PATH DIFFERS (svg d len 330 vs const len 320 …)`, `PUFF_SHAPE_PATH DIFFERS (svg d len 2011 vs const len 2596 …)`, `StarShape.tsx | star.svg | NO SVG FILE`. `rg -n "svgs" --glob '!docs/audit/**' --glob '!.superpowers/**'` → only `.agents/skills/dooph-ds-codebase/SKILL.md:140`.
  - [ ] 2. `git rm -r src/components/Shapes/svgs/`, which removes 11 files. Do not touch any `*Shape.tsx`: the constants stay byte-for-byte. The svgPath.ts header (`## constraints` "Normalize by the viewBox, never by the path's own bounds … (Pentagon is 23 units tall)") describes those constants and stays true.
  - [ ] 3. codebase SKILL.md:140 — replace exactly this clause:
    ```diff
    -… `strokeWeight` props), each one `<path d>` lifted verbatim from the Figma export kept alongside in `Shapes/svgs/`. `GemShape` …
    +… `strokeWeight` props), each one a single `<path d>` in a 24×24 viewBox, exported as `<NAME>_SHAPE_PATH` from its own file — those constants are the canonical geometry (MorphRotationShape, shapePaths.ts and the svgPath.ts constraints depend on them); re-export from Figma only by replacing the constant and checking the MorphRotationShape stories. `GemShape` …
    ```
    Leave the `GemShape` sentence to WI-C2-07 and the rest of the line, including any sentence WI-C7-53 appended, as it is.
  - [ ] 4. Verify:
    - `test ! -d src/components/Shapes/svgs && echo GONE` → `GONE`.
    - `rg -n "lifted verbatim|Shapes/svgs" .agents/skills skills src` → no output.
    - `npm run lint` → exit 0. Scratch-worktree `npm run build` → `git -C <worktree> status --porcelain` shows only the deletion and the skill edit, so no generated file changed.
    - Storybook `Bits & Pieces/Shapes` and `Progress/MorphRotationShape` render as before (nothing read the files).
  - [ ] 5. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: `src/components/Shapes/svgs/` does not exist; `rg -n "Shapes/svgs|lifted verbatim" .agents/skills skills src` → no output; codebase SKILL.md:140 names the `*_SHAPE_PATH` constants as canonical.
- log:
  - 2026-10-02 — created by audit

### WI-C7-58: Menu/trigger family — record DropdownMenuContent's Radix-private `onOpenAutoFocus` dependency, give every header constraint its failure, keep Slot's `type` off TypeableDropdownTrigger's `<div>`, and export the three missing DropdownMenu props types
- status: todo
- addresses: [F-113, F-115]
- depends_on: []
- phase: P3
- risk: low.
  - Behaviour changes in one place only: TypeableDropdownTrigger's root `<div>` stops receiving Radix Slot's `type="button"`. `type` is not a valid `<div>` attribute; no CSS or script in `src` reads it on that element (`rg -n '\[type' src/styles` → no div selector). The inner `<input>` was already protected (:106-109), and every other Radix trigger attribute still flows through.
  - Everything else is comments, JSDoc and type extraction. The three new props types are additive exports.
  - The cast-spread at :155-159 is kept on purpose: it is the only form that compiles (HA T10 tsc probe, TS2322 on the direct prop). This WI documents it instead of "fixing" it.
  - DropdownMenu.tsx:1-3 (directive above the header) is WI-C3-14's. DropdownCaret.tsx:25-37 is WI-C1-02's. Both are untouched here.
- semver: minor
- files:
  - modify: `src/components/Menu/DropdownMenu.tsx:12-21,24-31,54-61,94-105,202-207,360-363 @ b436647`
  - modify: `src/components/Menu/DropdownMenuSearch.tsx:11-13 @ b436647`
  - modify: `src/components/DropdownCaret/DropdownCaret.tsx:21-23 @ b436647`
  - modify: `src/components/DropdownTrigger/DropdownTrigger.tsx:168,188-189,244 @ b436647`
  - modify: `src/components/Menu/index.ts:25-28 @ b436647`
  - modify: `CHANGELOG.md:10-22 @ b436647` (`## [Unreleased]`)
- anchor:
  ```tsx
  // DropdownMenu.tsx:12-21
   * - Items use ghost button surfaces (`ghost-hover` / `ghost-active`). Content
   *   is always `ghost-fg-active` (primary), never the faded `ghost-fg` rest
   *   tone — except `DropdownMenuItemVariant.danger`, which paints
   *   danger-primary on hover and active.
   * - Default `modal={false}`; portals on by default with an escape hatch.
   *
   * ## constraints
   * - Do not hardcode a search field into `DropdownMenuContent`.
   * - Style open/disabled/highlighted via Radix data attributes only.
   */
  // DropdownMenu.tsx:54-61
  function DropdownMenuRoot({
    modal = false,
    selectType = DropdownMenuSelectType.single,
    ...props
  }: ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Root> & {
    /** Selection mode for the whole menu. Default single. */
    selectType?: DropdownMenuSelectType;
  }) {
  // DropdownMenu.tsx:94-105
  const DropdownMenuContent = forwardRef<
    ComponentRef<typeof DropdownMenuPrimitive.Content>,
    ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content> & {
      /** When true, the menu closes when focus leaves the browser window (devtools, screenshot tools, alt-tab). Default false. */
      dismissOnFocusLoss?: boolean;
      /** When false, menu open does not move focus into the panel (required for TypeableDropdownTrigger). Default true. */
      focusOnOpen?: boolean;
      matchTriggerWidth?: boolean;
      onOpenAutoFocus?: (event: Event) => void;
      portal?: boolean;
      portalProps?: ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Portal>;
    }
  >(
  // DropdownMenu.tsx:155-159
          {...(handleOpenAutoFocus
            ? ({
                onOpenAutoFocus: handleOpenAutoFocus,
              } as ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>)
            : {})}
  // DropdownMenu.tsx:202-207
  const DropdownMenuItem = forwardRef<
    ComponentRef<typeof DropdownMenuPrimitive.Item>,
    ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
      variant?: DropdownMenuItemVariant;
    }
  >(({ className, variant = DropdownMenuItemVariant.default, ...props }, ref) => (
  // DropdownMenu.tsx:360-363
  export interface DropdownMenuSegmentProps extends HTMLAttributes<HTMLDivElement> {
    /** divider (default) or labeled — a labeled segment shows `children` as its label. */
    variant?: DropdownMenuSegmentVariant;
  }
  // DropdownMenuSearch.tsx:10-13
   * ## constraints
   * - Do not mount this inside DropdownMenuContent by default — consumers opt in.
   * - Keep typography on the input via `text-style-button`; do not introduce bare
   *   labeled HTML text nodes for the placeholder (placeholder attr is fine).
  // DropdownCaret.tsx:21-23
   * - Colours live in the .ds-dropdown-caret CSS, including the deliberate
   *   non-obvious token choices; do not move them into props or classes here.
   * - No state props and no listeners (Rule 7): hosts drive it through CSS only.
  // DropdownTrigger.tsx:166-171, :188-190, :244-245
        "data-state": dataState,
        "data-select-type": dataSelectType,
        ...triggerProps
      },
      ref,
    ) => {
      );

      return (
          {...triggerProps}
          data-state={dataState}
  // Menu/index.ts:25-28
  export type {
    DropdownMenuSectionProps,
    DropdownMenuSegmentProps,
  } from './DropdownMenu';
  ```
- why: F-113 items 1-5 and F-115 item 8.
  - Item 1: DropdownMenuContent reaches Radix's private `onOpenAutoFocus` (react-menu 2.1.24 `MenuContentImplPrivateProps`) through a cast. `focusOnOpen={false}` depends on it, under a `^2.1.24` range, and nothing records that. A Radix minor can drop the runtime spread with no compile error, and the next editor's "cleanup" into the direct prop does not compile (U5-F11 recommended exactly that).
  - Items 2-3: header lines in the "never … except" form, and constraints that name no failure, which AGENTS.md says to treat as load-bearing without saying why.
  - Item 4: a divider segment silently drops `children`.
  - Item 5: the Slot-merged `type="button"` lands on a `<div>`.
  - F-115 item 8: the three parts with the most DS-only props export no props type, while their siblings do (R8.19).
- steps:
  - [ ] 1. Reproduce (fails today):
    - `node docs/audit/_work/scratch/W7b/58-menu.cjs` (audit build at b436647) → prints the root `<div … type="button" id="radix-…" aria-haspopup="menu" …>` and `FAIL TypeableDropdownTrigger root <div> carries no type= attribute`, exit 1. The input-type and Radix-attribute checks PASS and must still PASS.
    - `C:/Users/stick/Github/dooph/dooph-ds-audit-build/node_modules/.bin/tsc -p docs/audit/_work/scratch/W7b/types-probe/tsconfig.58.json` → three `TS2724 … has no exported member named 'DropdownMenuProps' / 'DropdownMenuContentProps' / 'DropdownMenuItemProps'`, exit 2.
    - Confirm the private-prop facts the new constraint states: `rg -n "onOpenAutoFocus" C:/Users/stick/Github/dooph/dooph-ds-audit-build/node_modules/@radix-ui/react-menu/dist/index.mjs` → :179 (destructured) and :266 (`onMountAutoFocus: composeEventHandlers(onOpenAutoFocus, …`); `rg -n "MenuContentImplPrivateProps" …/react-menu/dist/index.d.ts` → :51 (`Omit<MenuContentImplProps, keyof MenuContentImplPrivateProps>`) and :57.
  - [ ] 2. DropdownMenu.tsx header (:12-21). These edits leave every rule in place: two sentences are split, failures are appended, and one constraint is added. The `## behavior` bullet :12-15 becomes:
    ```tsx
     * - Items use ghost button surfaces (`ghost-hover` / `ghost-active`). Content
     *   is always `ghost-fg-active` (primary), never the faded `ghost-fg` rest
     *   tone. `DropdownMenuItemVariant.danger` is the one exception: it paints
     *   danger-primary on hover and active.
    ```
    and `## constraints` (:18-20) becomes:
    ```tsx
     * ## constraints
     * - Do not hardcode a search field into `DropdownMenuContent` — every menu
     *   would carry a search row and lose free-form composition.
     * - Style open/disabled/highlighted via Radix data attributes only — a
     *   JS-toggled class drifts from Radix's state (keyboard highlight and
     *   pointer hover disagree).
     * - `focusOnOpen={false}` and `onOpenAutoFocus` reach Radix's PRIVATE
     *   `onOpenAutoFocus` (react-menu `MenuContentImplPrivateProps`, 2.1.24)
     *   through the cast at the Content spread; the public Content type does not
     *   have it, so passing it directly does not compile. On every
     *   @radix-ui/react-dropdown-menu bump, `rg -n onOpenAutoFocus
     *   node_modules/@radix-ui/react-menu/dist/index.mjs` must still show it
     *   spread into FocusScope's onMountAutoFocus, or TypeableDropdownTrigger
     *   loses focus to the panel on open.
    ```
  - [ ] 3. DropdownMenu.tsx props types (F-115 item 8). Add `type ReactNode,` to the react import (:24-31). Then:
    - Replace :54-61's inline type with a named one declared just above the function:
      ```tsx
      export type DropdownMenuProps = ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Root> & {
        /** Selection mode for the whole menu. Default single. */
        selectType?: DropdownMenuSelectType;
      };

      /** Non-modal by default … (the :53 JSDoc, unchanged) */
      function DropdownMenuRoot({
        modal = false,
        selectType = DropdownMenuSelectType.single,
        ...props
      }: DropdownMenuProps) {
      ```
    - Above `const DropdownMenuContent` (:94) declare `export type DropdownMenuContentProps = ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content> & { … };`, holding the six DS props from :97-104 with their JSDoc. Give `onOpenAutoFocus` the JSDoc `/** Radix-private prop, passed through by cast — see ## constraints. */`. Then :94-105 becomes `const DropdownMenuContent = forwardRef<ComponentRef<typeof DropdownMenuPrimitive.Content>, DropdownMenuContentProps>(`. Leave the cast-spread at :155-159 exactly as it is.
    - Above `const DropdownMenuItem` (:202) declare `export type DropdownMenuItemProps = ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & { variant?: DropdownMenuItemVariant; };`, then :202-206 becomes `const DropdownMenuItem = forwardRef<ComponentRef<typeof DropdownMenuPrimitive.Item>, DropdownMenuItemProps>(`.
    - DropdownMenuSegmentProps (:360-363): add after `variant`:
      ```tsx
        /** Rendered only when `variant` is `labeled`; the divider ignores it. */
        children?: ReactNode;
      ```
      Making this a discriminated union is D-12's call, not this WI's.
    - Menu/index.ts:25-28 →
      ```ts
      export type {
        DropdownMenuProps,
        DropdownMenuContentProps,
        DropdownMenuItemProps,
        DropdownMenuSectionProps,
        DropdownMenuSegmentProps,
      } from './DropdownMenu';
      ```
      `src/index.ts:18` (`export * from './components/Menu'`) publishes them.
  - [ ] 4. DropdownMenuSearch.tsx `## constraints` (:11-13) → append each failure:
    ```tsx
     * - Do not mount this inside DropdownMenuContent by default — consumers opt
     *   in; a menu that never asked for search would grow one.
     * - Keep typography on the input via `text-style-button`; do not introduce bare
     *   labeled HTML text nodes for the placeholder (placeholder attr is fine) —
     *   a bare text node escapes the text-style system.
    ```
  - [ ] 5. DropdownCaret.tsx `## constraints` (:21-23) → append each failure:
    ```tsx
     * - Colours live in the .ds-dropdown-caret CSS, including the deliberate
     *   non-obvious token choices; do not move them into props or classes here —
     *   a prop or class bypasses the CSS's light/dark token choices.
     * - No state props and no listeners (Rule 7): hosts drive it through CSS only
     *   — a listener on the host breaks when the host is a consumer's custom trigger.
    ```
  - [ ] 6. DropdownTrigger.tsx (TypeableDropdownTrigger; no header contract). :168 `...triggerProps` → `...rest`. Directly before `return (` (:189) insert:
    ```tsx
        // Radix Trigger's Slot merges type="button"; a <div> has no type.
        const { type: _slotType, ...triggerProps } = rest as typeof rest & { type?: string };
    ```
    :244 `{...triggerProps}` stays as it is (now the filtered object). `_slotType` passes `noUnusedLocals`: a binding that only exists to drop a key in an object-rest destructure is not reported. This was checked with the repo's tsconfig flags in `docs/audit/_work/scratch/W7b/brand-model/ref-model.tsx`.
  - [ ] 7. CHANGELOG.md `[Unreleased]`: `### Added` → `` - Types `DropdownMenuProps`, `DropdownMenuContentProps`, `DropdownMenuItemProps`. ``; `### Fixed` (create after `### Changed` if missing) → `` - `TypeableDropdownTrigger` no longer renders Radix's `type="button"` on its root `<div>`. ``
  - [ ] 8. Verify:
    - `npm run lint` → exit 0.
    - Scratch-worktree build; `node docs/audit/_work/scratch/W7b/58-menu.cjs <worktree>` → three PASS, exit 0. Retarget `types-probe/tsconfig.58.json` to the worktree and run `tsc -p` → exit 0.
    - `rg -n "never the faded .ghost-fg. rest$" src/components/Menu/DropdownMenu.tsx` → one hit, and `rg -n "tone — except" src/components/Menu/DropdownMenu.tsx` → no output.
    - Storybook `Menus/DropdownMenu` → `WithTypeableTrigger`, `TypeableInToolbar` and `TypeableMultiSelect`: click the field, the menu opens and the caret stays in the input, so typing filters. `Segments` renders unchanged.
  - [ ] 9. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: `58-menu.cjs` and `tsconfig.58.json` pass against a build of the change; the DropdownMenu, DropdownMenuSearch and DropdownCaret constraints each name a failure; DropdownMenu.tsx `## constraints` records the private `onOpenAutoFocus` dependency; `npm run lint` exits 0.
- log:
  - 2026-10-02 — created by audit

### WI-C7-59: Leaf-component cleanups — distinct `StickerBase` name and no dead prominent fallback, Table's barrel imports, DatePicker delegates `open` to Popover (and gains `defaultOpen`), RollingDigitsText's stray `style`, one number→px helper
- status: todo
- addresses: [F-113]
- depends_on: []
- phase: P3
- risk: low.
  - DatePicker gains an optional `defaultOpen` (additive). Its open state moves from a hand-rolled `useState` into Radix Popover's own controllable state. Both are "controlled when `open` is defined", so the controlled and uncontrolled stories behave the same.
  - One difference: today the hand-rolled state ignores a later switch between controlled and uncontrolled, and Radix's `useControllableState` warns in development on that switch. Nothing in the repo switches.
  - Everything else is markup-neutral; step 7 diffs SSR output. Sticker's custom paint is unchanged because the removed fallback was unreachable after the :104 throw. RollingDigitsText's `style` still reaches the root through `...rest`. Both px helpers return the same strings.
  - Other WIs edit these files, so match by content: WI-C7-02 (Table.tsx:4/:35 `CSSProperties`; if it has landed, skip step 3's `CSSProperties` part), WI-C7-52 (Table.tsx:98), WI-C7-03/WI-C7-04/WI-C7-07 (DatePicker), WI-C7-60 (DatePicker.tsx:49).
- semver: minor
- files:
  - modify: `src/components/Sticker/Sticker.tsx:111-114,136 @ b436647`
  - modify: `src/components/Table/Table.tsx:4,8-11,13-14,35 @ b436647`
  - modify: `src/components/DatePicker/DatePicker.tsx:3,15-17,54-56,70-75,81 @ b436647`
  - modify: `src/components/AnimatedText/RollingDigitsText.tsx:234-241,274 @ b436647`
  - create: `src/utils/length.ts`
  - modify: `src/components/AnimatedText/UnderlineLinkText.tsx:1-2,21-22,51,54 @ b436647`
  - modify: `src/components/Text/textStyle.ts:13-27,93,96 @ b436647`
  - modify: `CHANGELOG.md:10-22 @ b436647` (`## [Unreleased]`)
- anchor:
  ```tsx
  // Sticker.tsx:111-114, :136, :141
    const customColor =
      variant === StickerVariant.custom
        ? resolveDsColor(color, "var(--ui-color-prominent)")
        : undefined;
  StickerBase.displayName = "Sticker";
  Sticker.displayName = "Sticker";
  // Table.tsx:4, :8-14, :35
  import { forwardRef, type HTMLAttributes } from "react";
  import { ChevronDownIcon } from "../Icons/ChevronDownIcon";
  import { ChevronsUpDownIcon } from "../Icons/ChevronsUpDownIcon";
  import { ChevronUpIcon } from "../Icons/ChevronUpIcon";
  import { ButtonText } from "../Text/BaseText";
  import { TableSortDirection } from "./constants";


  /* ── Table ─────────────────────────────────────────────────────────────── */
        } as React.CSSProperties
  // DatePicker.tsx:3, :16-17, :70-75, :81
  import { useState, type ReactNode } from "react";
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
    const isOpen = open ?? uncontrolledOpen;
    const setOpen = (next: boolean) => {
      if (open === undefined) setUncontrolledOpen(next);
      onOpenChange?.(next);
    };
      <Popover open={isOpen} onOpenChange={setOpen}>
  // RollingDigitsText.tsx:230-241, :271-275
    const {
      children,
      smallDecimals = false,
      smallDecimalsComponent: SmallDecimals,
      className,
      style,
      ...rest
    } = props as RollingDigitsTextBaseProps & {
      smallDecimals?: boolean;
      smallDecimalsComponent?: SmallDecimalsComponent;
      className?: string;
    };
      <span
        ref={ref}
        className={cn("ds-rolling-digits", className)}
        style={style}
        {...rest}
  // UnderlineLinkText.tsx:21-22
  const toLength = (value: string | number) =>
    typeof value === "number" ? `${value}px` : value;
  // textStyle.ts:25-27, :93, :96
  /** Numbers mean px; strings (incl. `var(--ui-*)` tokens) pass through. */
  const toLength = (value: string | number | undefined) =>
    typeof value === 'number' ? `${value}px` : value;
    if (fontSize !== undefined) style.fontSize = toLength(fontSize);
    if (letterSpacing !== undefined) style.letterSpacing = toLength(letterSpacing);
  ```
- why: F-113 items 6-11 are noise that implies behaviour that is not there.
  - Item 6: two React DevTools nodes are both named "Sticker".
  - Item 7: a prominent fallback the Sticker header forbids. It is unreachable after the throw, but it reads as the behaviour.
  - Item 8: deep imports where siblings use the barrels, a double blank line, and the UMD `React.` namespace in a file that imports its React types by name.
  - Item 9: DatePicker re-implements Radix Popover's controllable `open`, and so cannot take `defaultOpen`.
  - Item 10: `style` is destructured only to be passed straight back, and a cast re-declares `className`, which is already in `HTMLAttributes`.
  - Item 11: the number→px rule is written twice and can drift.
- steps:
  - [ ] 1. Reproduce and baseline:
    - `node docs/audit/_work/scratch/W7b/59-leaf.cjs` (audit build at b436647) → `Sticker.displayName = Sticker | inner base displayName = Sticker` and `FAIL Sticker and its base have distinct displayNames (StickerBase)`, exit 1. The custom-colour check PASSes and must still PASS.
    - `C:/Users/stick/Github/dooph/dooph-ds-audit-build/node_modules/.bin/tsc -p docs/audit/_work/scratch/W7b/types-probe/tsconfig.59.json` → `probe59.tsx(5,96): error TS2322 … Property 'defaultOpen' does not exist`, exit 2. If WI-C7-03 has renamed DatePicker's `onChange` to `onValueChange`, edit the probe's two `onChange` props the same way first.
    - `node docs/audit/_work/scratch/W7b/59-leaf.cjs --dump > <scratchpad>/leaf-head.txt` (markup baseline for step 7).
  - [ ] 2. Sticker.tsx. Sticker's header `## constraints` (:21-23) says custom-with-no-color throws, and that falling back to prominent would dishonour the choice. This step removes the code that reads as that fallback and keeps the throw, so the header stays true unchanged.
    ```diff
         const customColor =
           variant === StickerVariant.custom
    -        ? resolveDsColor(color, "var(--ui-color-prominent)")
    +        ? // Fallback unreachable: the throw above guarantees `color` here.
    +          resolveDsColor(color, "")
             : undefined;
    ```
    :136 → `StickerBase.displayName = "StickerBase";` (Slider names its base `SliderBase`, Slider.tsx:419). Leave :141 `Sticker.displayName = "Sticker";`.
  - [ ] 3. Table.tsx (header is a `"use client"` rationale comment, not a contract):
    - :8-11 →
      ```tsx
      import { ChevronDownIcon, ChevronsUpDownIcon, ChevronUpIcon } from "../Icons";
      import { ButtonText } from "../Text";
      ```
    - Delete the second blank line (:14), so one blank line separates the imports from `/* ── Table ── */`.
    - Only if WI-C7-02 has not landed: :4 → `import { forwardRef, type CSSProperties, type HTMLAttributes } from "react";` and :35 `} as React.CSSProperties` → `} as CSSProperties`.
  - [ ] 4. DatePicker.tsx (no header contract):
    - :3 → `import type { ReactNode } from "react";`
    - :16-17 → keep `open?: boolean;`, then insert:
      ```tsx
        /** Initial open state when uncontrolled (`open` omitted). Default false. */
        defaultOpen?: boolean;
      ```
      before `onOpenChange?`.
    - Destructure it: add `defaultOpen,` after `open,` (:55).
    - Delete :70-75 (`uncontrolledOpen` … `setOpen`), plus the blank line that follows.
    - :81 → `<Popover open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>`. Radix Popover (`Popover = PopoverPrimitive.Root`, Popover.tsx:11) owns controlled and uncontrolled state.
    - The module keeps its `"use client"` directive. Without `useState` it holds no hook, but whether a hook-free module that renders client parts keeps the directive is decision D-05 (WI-C1-05). Do not change it here.
  - [ ] 5. RollingDigitsText.tsx. Its `## constraints` (US format, tabular figures, no 3D, union-enforced `smallDecimalsComponent`) is about rendering, and this step only touches prop plumbing.
    - Drop `style,` from the destructure at :235.
    - Drop `className?: string;` from the cast at :240, so the cast reads `props as RollingDigitsTextBaseProps & { smallDecimals?: boolean; smallDecimalsComponent?: SmallDecimalsComponent; }`. `className` comes from `HTMLAttributes<HTMLSpanElement>` (:68-69).
    - Delete `style={style}` at :274. `style` now reaches the `<span>` through `{...rest}`.
  - [ ] 6. One number→px helper. Create `src/utils/length.ts`. Do not export it from `src/index.ts`.
    ```ts
    /** Numbers mean px; strings (any CSS length, incl. `var(--ui-*)` tokens) pass through. */
    export const toPxLength = (value: string | number): string =>
      typeof value === "number" ? `${value}px` : value;
    ```
    - UnderlineLinkText.tsx: add `import { toPxLength } from "../../utils/length";` after the `cn` import (:2), delete :21-22 and the blank line after it, and change `toLength(thickness)` (:51) / `toLength(offset)` (:54) to `toPxLength(…)`.
    - textStyle.ts: add `import { toPxLength } from '../../utils/length';` after the `react` type import (:13), delete :25-27 (the JSDoc and `toLength`), and change :93 / :96 to `toPxLength(fontSize)` / `toPxLength(letterSpacing)`. Both calls already sit behind `!== undefined`, so `FontSizeValue`/`LetterSpacingValue` (constants.ts:141/:147, `… | (string & {}) | number`) narrow to `string | number`. Keep `toUnitless` (:29-31) as it is.
  - [ ] 7. Verify:
    - `npm run lint` → exit 0.
    - Scratch-worktree build of the change. `node docs/audit/_work/scratch/W7b/59-leaf.cjs <worktree>` → two PASS, exit 0. `node docs/audit/_work/scratch/W7b/59-leaf.cjs <worktree> --dump | diff <scratchpad>/leaf-head.txt -` → no output (Sticker, Table, RollingDigitsText, UnderlineLinkText and BodyText markup byte-identical). Skip the `tableHeaderSort` line if WI-C7-02 landed in between (it adds roles on purpose).
    - Retarget `types-probe/tsconfig.59.json` to the worktree and run `tsc -p` → exit 0.
    - `rg -n "toLength" src` → no output; `rg -n "ui-color-prominent" src/components/Sticker/Sticker.tsx` → no output; `rg -n 'from "\.\./(Icons|Text)/' src/components/Table/Table.tsx` → no output; `rg -n "useState" src/components/DatePicker/DatePicker.tsx` → no output.
    - Storybook `Dates/DatePicker` → `SingleDay`, `DateRangeMode`, `WithPresetsPanel` and `SplitTrigger` (all uncontrolled) open on trigger click and close on outside click and on Escape. No story is controlled. The controlled path is Radix Popover's own (`open` and `onOpenChange` pass straight through), and its typing is the `controlled` line of probe59.
  - [ ] 8. CHANGELOG.md `[Unreleased]` → `### Added`: `` - `DatePicker` `defaultOpen` (uncontrolled initial open state). ``
  - [ ] 9. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: `59-leaf.cjs` exits 0 against a build of the change, and its `--dump` output equals b436647's; `tsconfig.59.json` against the build exits 0; `rg -n "toLength|style=\{style\}" src/components/AnimatedText src/components/Text` → no output; `npm run lint` exits 0.
- log:
  - 2026-10-02 — created by audit

### WI-C7-60: Type nits — drop three no-op casts, make the shared default arrays `readonly` (and widen the props that take them), replace the date non-null assertions, and spell two types directly
- status: todo
- addresses: [F-115]
- depends_on: [WI-C7-53]
- phase: P3
- risk: low.
  - Compile-time only: no emitted JavaScript changes except the removed casts, which emit nothing.
  - The `readonly` defaults reject `DEFAULT_CALENDAR_PRESETS.push(…)`, `.reverse()` and so on, which is the point. They also reject a consumer annotation such as `const p: CalendarPreset[] = DEFAULT_CALENDAR_PRESETS` (U7-F11 called this `breaking: minor`). The map keeps `breaking: none` because every widened prop accepts every input it accepted before. Record it in CHANGELOG.
  - Dropping the `size as SpinnerSizeKey` cast restores the compile-time link between `LoadingSpinnerSize` and `SPINNER_DIAMETERS`. If lint then fails, the two have drifted, and that drift is the bug to fix here. Do not re-add the cast.
  - The DropdownMenu props-type extraction (F-115 item 8) is WI-C7-58's.
  - Depends on WI-C7-53, and through it on WI-C1-02, because the `shapes` element type it leaves (`ShapeInput`, `DsShapeComponent`) is what gets the `readonly` here.
- semver: patch
- files:
  - modify: `src/components/LoadingSpinner/LoadingSpinner.tsx:16-24,254-263,300 @ b436647`
  - modify: `src/components/ProgressIndicator/ProgressIndicator.tsx:11-16,298 @ b436647`
  - modify: `src/components/Slider/Slider.tsx:296 @ b436647`
  - modify: `src/components/Calendar/constants.ts:118,128 @ b436647`
  - modify: `src/components/ShapeMorphSpinner/ShapeMorphSpinner.tsx @ WI-C7-53` (b436647 :24, :43)
  - modify: `src/components/MorphRotationShape/MorphRotationShape.tsx @ WI-C1-02` (b436647 :91, :156)
  - modify: `src/components/DatePicker/DatePickerSplitTrigger.tsx:30 @ b436647`
  - modify: `src/components/DatePicker/DatePicker.tsx:5-11,49 @ b436647`
  - modify: `src/components/Calendar/dateFormat.ts:89-92 @ b436647`
  - modify: `src/components/Calendar/CalendarGrid.tsx:3,50 @ b436647`
  - modify: `CHANGELOG.md:10-22 @ b436647` (`## [Unreleased]`)
- anchor:
  ```tsx
  // LoadingSpinner.tsx:300 and ProgressIndicator.tsx:298
      const geo = getSpinnerGeometry(size as SpinnerSizeKey);
  // LoadingSpinner.tsx:254-263
        style={
          {
            width: cssSize,
            height: cssSize,
            stroke: strokeColor,
            strokeWidth: "var(--ui-icon-stroke-width)",
            animation: `ds-spinner-rotate ${spokesDuration}ms linear infinite`,
            transformOrigin: "center",
            ...style,
          } as React.CSSProperties
  // Slider.tsx:296
      const paints = VARIANT_PAINTS[variant as SliderVariant];
  // Calendar/constants.ts:118, :128
  export const DEFAULT_CALENDAR_PRESETS: CalendarPreset[] = [
  export const DEFAULT_SPLIT_TRIGGER_PRESETS: CalendarPreset[] = [
  // DatePickerSplitTrigger.tsx:30
    presets?: CalendarPreset[];
  // DatePicker.tsx:49
          splitPresets?: Parameters<typeof DatePickerSplitTrigger>[0]["presets"];
  // dateFormat.ts:89-92
    const hasFrom = bounds?.from !== undefined;
    const hasTo = bounds?.to !== undefined;
    let first = hasFrom ? bounds!.from!.getFullYear() : nowYear - YEARS_BACK;
    let last = hasTo ? bounds!.to!.getFullYear() : nowYear + YEARS_FORWARD;
  // CalendarGrid.tsx:3, :50
  import { forwardRef, type ReactNode } from "react";
    onDayKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
  ```
- why: F-115 items 1-7.
  - The spinner cast removes the compile-time tie between the size const and the geometry table, so a size added to one and not the other renders NaN geometry instead of failing `npm run lint`.
  - The other two casts are no-ops.
  - Three public, mutable arrays are used as prop defaults, so one consumer's `.push()`/`.reverse()` rewrites every instance's default on the page.
  - The rest are inconsistent spellings: non-null assertions where a narrowed local works, an indirect `Parameters<…>` type that hides `CalendarPreset[]`, and the UMD `React.` namespace beside a sibling that imports `KeyboardEvent` by name (Calendar.tsx:8).
- steps:
  - [ ] 1. Reproduce (fails today): `C:/Users/stick/Github/dooph/dooph-ds-audit-build/node_modules/.bin/tsc -p docs/audit/_work/scratch/W7b/types-probe/tsconfig.60.json` → `probe60.tsx(8,1)`, `(10,1)`, `(12,1)`: `error TS2578: Unused '@ts-expect-error' directive` (all three defaults are mutable); exit 2. Lines 14-22 (mutable arrays, the defaults passed back in, spreads) compile today and must keep compiling. If WI-C7-03 has renamed `onSelect`/`onChange`, edit the probe's props the same way first. Also `rg -n "as SpinnerSizeKey|as SliderVariant|as React.CSSProperties" src/components/LoadingSpinner src/components/ProgressIndicator src/components/Slider` → LoadingSpinner.tsx:263, :300, ProgressIndicator.tsx:298, Slider.tsx:296.
  - [ ] 2. Casts (item 1-3):
    - LoadingSpinner.tsx:300 and ProgressIndicator.tsx:298 → `const geo = getSpinnerGeometry(size);`. Remove `type SpinnerSizeKey,` from both import lists (LoadingSpinner.tsx:23, ProgressIndicator.tsx:14); `noUnusedLocals` would flag it otherwise. Leave `SpinnerSizeKey` exported from spinnerGeometry.ts:73, since it is the parameter type.
    - LoadingSpinner.tsx:254-263 → keep the object literal, drop the cast: replace `} as React.CSSProperties` with `}` and collapse `style={\n {` … `}\n }` to `style={{` … `}}`. The object holds no custom property.
    - Slider.tsx:296 → `const paints = VARIANT_PAINTS[variant];` (`variant` is `SliderVariant` from `SliderBaseProps`, and `VARIANT_PAINTS` `satisfies Record<SliderVariant, …>` at :76-79).
  - [ ] 3. `readonly` defaults (item 4):
    - Calendar/constants.ts:118 → `export const DEFAULT_CALENDAR_PRESETS: readonly CalendarPreset[] = [`; :128 → `export const DEFAULT_SPLIT_TRIGGER_PRESETS: readonly CalendarPreset[] = [`.
    - ShapeMorphSpinner.tsx (WI-C7-53 text): `export const SHAPE_MORPH_SPINNER_SHAPES: DsShapeComponent[] = …` → `export const SHAPE_MORPH_SPINNER_SHAPES: readonly DsShapeComponent[] = …`; prop `shapes?: ShapeInput[];` → `shapes?: readonly ShapeInput[];`; and WI-C1-02's internal `const DEFAULT_SHAPE_KEYS: Shapes[] = [` → `const DEFAULT_SHAPE_KEYS: readonly Shapes[] = [` (it is now the prop default).
    - MorphRotationShape.tsx (WI-C1-02 text): `shapes: ShapeInput[];` → `shapes: readonly ShapeInput[];` and `function useShapesKey(shapes: ShapeInput[]): number {` → `function useShapesKey(shapes: readonly ShapeInput[]): number {`. The header's "Changing `shapes` remounts the inner component (key)" still holds: `readonly` is type-only, and useShapesKey's identity comparison (b436647 :158-162) is unchanged.
    - DatePickerSplitTrigger.tsx:30 → `presets?: readonly CalendarPreset[];` (it only calls `.find`/`.map`).
    - A mutable array still assigns to every widened prop.
  - [ ] 4. dateFormat.ts:89-92 (item 5) →
    ```ts
      const from = bounds?.from;
      const to = bounds?.to;
      const hasFrom = from !== undefined;
      const hasTo = to !== undefined;
      let first = from ? from.getFullYear() : nowYear - YEARS_BACK;
      let last = to ? to.getFullYear() : nowYear + YEARS_FORWARD;
    ```
    `hasFrom`/`hasTo` stay because :95-96 read them.
  - [ ] 5. DatePicker.tsx:49 (item 6) → `splitPresets?: readonly CalendarPreset[];`, and add `type CalendarPreset,` to the `../Calendar` import (:5-11).
  - [ ] 6. CalendarGrid.tsx (item 7): :3 → `import { forwardRef, type KeyboardEvent, type ReactNode } from "react";`; :50 → `onDayKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;`. That is the file's only `React.` use at b436647.
  - [ ] 7. CHANGELOG.md `[Unreleased]` → `### Changed`: `` - `DEFAULT_CALENDAR_PRESETS`, `DEFAULT_SPLIT_TRIGGER_PRESETS` and `SHAPE_MORPH_SPINNER_SHAPES` are `readonly` arrays, so one consumer can no longer mutate a default for every instance; copy them (`[...DEFAULT_CALENDAR_PRESETS]`) to get a mutable array. The props that take them accept readonly arrays. ``
  - [ ] 8. Verify:
    - `npm run lint` → exit 0.
    - `rg -n "as SpinnerSizeKey|as SliderVariant" src` → no output; `rg -n "bounds!" src/components/Calendar` → no output; `rg -n "Parameters<typeof DatePickerSplitTrigger>" src` → no output.
    - Scratch-worktree build; `git -C <worktree> status --porcelain` → only the copied edits. Retarget `types-probe/tsconfig.60.json` to the worktree, then `tsc -p` → exit 0 (the three mutations are rejected; every other line compiles).
    - Storybook `Progress/LoadingSpinner` (all sizes, both variants), `Inputs/Slider` and `Dates/DatePicker` render unchanged.
  - [ ] 9. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: `tsconfig.60.json` against a build of the change exits 0; `rg -n "as SpinnerSizeKey|as SliderVariant|bounds!|React\.KeyboardEvent" src/components/{LoadingSpinner,ProgressIndicator,Slider,Calendar}` → no output; `npm run lint` exits 0.
- log:
  - 2026-10-02 — created by audit

### WI-C7-61: Naming and cosmetic sweep — file two tokens and two comments where they belong, label the generated theme region, tokenise the chat-prose literals, give three header constraints their failure, and drop stray destructures, redeclared props, `Error` story names and the unprefixed `--slider-pct`
- status: todo
- addresses: [F-116]
- depends_on: []
- phase: P1
- risk: low.
  - No behaviour change. The two new tokens carry the current literal values (3px, 2px). The moved token keeps its value and is in sync-theme.mjs's `EXCLUDED` set (scripts/sync-theme.mjs:91), so moving it changes no generated output. `--ui-chat-*` names match no family in `toThemeEntry` (sync-theme.mjs:170-208), so the new tokens generate nothing either.
  - Two story exports are renamed (`Error` → `HasError`), which changes their Storybook ids (`…--error` → `…--has-error`). A bookmarked story URL breaks; nothing in the repo links to them.
  - `--slider-pct` → `--ds-slider-pct` is an inline custom property on Slider's own root, read only by Slider's own classes. A consumer stylesheet that read `--slider-pct` was reading an undocumented internal.
  - Header-contract edits split or extend sentences. No rule is removed or relaxed: each keeps its rule and exception and gains its failure.
  - Other WIs touch these files, so match by content: WI-C4-07 (Slider :368/:380 into `ds-slider-*` CSS), WI-C7-54 and WI-C7-60 (Slider), WI-C7-56 (Toast `ToastTypes` → `ToastVariant`), WI-C7-03/08/11 (VerificationCodeInput), WI-C3-15 (Toast story names).
- semver: patch
- files:
  - modify: `src/styles/tokens.css:450,470,475,215 @ b436647`
  - modify: `src/styles/index.css:68-73 @ b436647` (the comment above the markers, not the generated block)
  - modify: `src/styles/dooph-component-tokens.css:620,626 @ b436647`
  - modify: `src/components/Toast/Toast.tsx:80 @ b436647`
  - modify: `src/components/Tooltip/Tooltip.tsx:102,106 @ b436647`
  - modify: `src/components/Checkbox/Checkbox.tsx:15-16 @ b436647`
  - modify: `src/components/VerificationCode/CodeDigitInput.tsx:12 @ b436647`
  - modify: `src/components/VerificationCode/VerificationCodeInput.tsx:12-13,38 @ b436647`
  - modify: `src/components/SegmentedTabSelect/SegmentedTabSelect.tsx:13,23-28 @ b436647`
  - modify: `src/components/Slider/Slider.tsx:332,368,380 @ b436647`
  - modify: `src/components/Input/Input.stories.tsx:25 @ b436647`
  - modify: `src/components/VerificationCode/VerificationCode.stories.tsx:31 @ b436647`
  - modify: `src/components/AIChat/constants.ts:39-40 @ b436647`
- anchor:
  ```css
  /* tokens.css:449-450, :470-475, :214-215 */
    --ui-height-button: 38px;
    --ui-height-button-sm: 34px;
    /* Calendar — day-cell corner radius, presets rail width, panel min-width. */
    --ui-width-calendar-presets: 144px;
    /* Panel width sets the day-cell size: cells are aspect-square across seven
     * equal columns, so widening the panel makes each day physically bigger. */
    --ui-min-w-calendar-panel: 300px;
    --ui-height-button-micro: 26px;
    /* Inline code inside ds-chat-prose. */
    --ui-chat-prose-code-radius: 4px;
  /* index.css:68-74 */
  /*
   * @theme inline — maps --ui-* tokens into Tailwind utility namespaces.
   * "inline" means Tailwind emits var(--ui-*) references instead of the
   * resolved values, so overriding --ui-* at :root automatically updates
   * all generated utilities.
   */
  /* __GENERATED_THEME_START__ */
  /* dooph-component-tokens.css:620, :626 */
      text-underline-offset: 3px;
      border-left: 2px solid var(--ui-color-border-primary);
  ```
  ```tsx
  // Toast.tsx:79-81
      defaultVariants: {
        variant: "simple",
      },
  // Tooltip.tsx:101-108
  const TooltipBody = forwardRef<HTMLElement, TooltipBodyProps>(
    ({ className, ...props }, ref) => (
      <BaseText
        ref={ref}
        variant={TextVariant.body}
        className={className}
        {...props}
      />
  // Checkbox.tsx:15-16
   * - Indicator SVGs stay decorative (`aria-hidden`); do not replace with
   *   interactive children unless composing via the `children` escape hatch.
  // CodeDigitInput.tsx:12
   * - Prefer composing through VerificationCodeInput for multi-digit flows.
  // VerificationCodeInput.tsx:12-13, :38
   * - Do not ship a package-level “verification section” layout — compose in
   *   stories / apps with role text + Button.
    "aria-label"?: string;
  // SegmentedTabSelect.tsx:24-28
  // SegmentedVariant/SegmentedSize (+ their types) live in ./constants
  // (server-safe), re-exported via index.ts; imported here for internal
  // variant/size resolution. See constants.ts for the Figma Tab Select
  // variant × size table.
  import { SegmentedSize, SegmentedVariant } from './constants';
  // Slider.tsx:332
                '--slider-pct': pct,
  // Input.stories.tsx:25
  export const Error: Story = { args: { placeholder: 'Error state', hasError: true } };
  // VerificationCode.stories.tsx:31
  export const Error: Story = {
  // AIChat/constants.ts:36-40
  /**
   * AIThinkingPart phase (Figma 761:1345 `Variant`). `thinking` is live — the
   * label shimmers and any transcript streams inline, always visible. `thought`
   * is settled — a transcript collapses behind a disclosure.
   *
  ```
- why: Each item is trivial; together they are the drift that makes the next contributor copy the wrong sibling (F-116 items 1-12).
  - The misfiled Calendar comment sends a reader to the wrong place for the day radius, and a button height sits under the Calendar heading.
  - The generated region has no "do not edit" line (theme.css:4 has one), which invites a hand edit that `npm run sync-tokens` silently reverts.
  - Two chat-prose literals have no token (R8.1), and a string literal stands where `ToastTypes.simple` exists (R1.1).
  - Three header constraints hedge or name no failure. These are exactly the lines AGENTS.md says to treat as load-bearing, with no reason given (R11.7, R11.8).
  - `--slider-pct` is the one inline property outside the `--ds-*` namespace, and two `Error` story exports shadow the global constructor.
  - Nothing records why Figma's `Variant` is the `state` prop, which invited U11-F1's S2 misreading.
- steps:
  - [ ] 1. Baseline: `rg -n "slider-pct" src` → Slider.tsx:332, :368, :380 (or those plus WI-C4-07's CSS); `rg -n "export const Error" src` → Input.stories.tsx:25, VerificationCode.stories.tsx:31, Toast.stories.tsx:58; `rg -n 'variant: "simple"' src/components/Toast/Toast.tsx` → :80. Save `src/styles/index.css` and `src/styles/theme.css` hashes: `git hash-object src/styles/theme.css` and `sed -n '/__GENERATED_THEME_START__/,/__GENERATED_THEME_END__/p' src/styles/index.css | git hash-object --stdin`.
  - [ ] 2. tokens.css:
    - :470 → `  /* Calendar — presets rail width and panel min-width (the day-cell radius is with the radii, --ui-radius-calendar-day). */`.
    - Move `  --ui-height-button-micro: 26px;` from :475 to directly after `  --ui-height-button-sm: 34px;` (:450), unchanged.
    - After `  --ui-chat-prose-code-radius: 4px;` (:215) add:
      ```css
        /* Links and blockquotes inside ds-chat-prose. */
        --ui-chat-prose-link-offset: 3px;
        --ui-chat-prose-quote-border-width: 2px;
      ```
  - [ ] 3. dooph-component-tokens.css:620 → `    text-underline-offset: var(--ui-chat-prose-link-offset);`; :626 → `    border-left: var(--ui-chat-prose-quote-border-width) solid var(--ui-color-border-primary);`.
  - [ ] 4. index.css:68-73. This comment sits above `/* __GENERATED_THEME_START__ */` (:74), so it is hand-written, not generated. Insert before its closing ` */` (:73):
    ```css
     *
     * Everything between the __GENERATED_THEME_*__ markers is written by
     * scripts/sync-theme.mjs (npm run sync-tokens) — do not edit it by hand.
    ```
  - [ ] 5. Run `npm run sync-tokens`. Then `git hash-object src/styles/theme.css` and the generated-block hash from step 1 → both unchanged.
  - [ ] 6. Toast.tsx:80 → `      variant: ToastTypes.simple,`. Use `ToastVariant.simple` if WI-C7-56 has landed. `ToastTypes` is already imported at :23.
  - [ ] 7. Tooltip.tsx:101-108 (TooltipBody) →
    ```tsx
    const TooltipBody = forwardRef<HTMLElement, TooltipBodyProps>((props, ref) => (
      <BaseText ref={ref} variant={TextVariant.body} {...props} />
    ));
    ```
  - [ ] 8. Header constraints (each keeps its rule and gains its failure):
    - Checkbox.tsx:15-16 →
      ```tsx
       * - Indicator SVGs stay decorative (`aria-hidden`) — an interactive element
       *   inside the checkbox button is a nested control that assistive tech
       *   cannot reach. Custom indicator content goes through the `children`
       *   escape hatch.
      ```
    - CodeDigitInput.tsx:12 →
      ```tsx
       * - Compose multi-digit flows through VerificationCodeInput — a hand-built
       *   row of cells loses its auto-advance, backspace, arrow navigation and paste.
      ```
    - VerificationCodeInput.tsx:12-13 →
      ```tsx
       * - Do not ship a package-level “verification section” layout — compose in
       *   stories / apps with role text + Button; a packaged layout would fix copy
       *   and a Button arrangement that each app has to own.
      ```
  - [ ] 9. VerificationCodeInput.tsx:38 → delete `  "aria-label"?: string;`. It is already in `HTMLAttributes<HTMLDivElement>` (:30), through `AriaAttributes`.
  - [ ] 10. SegmentedTabSelect.tsx: move the comment and import at :24-28 up to directly after `import { cn } from '../../utils/cn';` (:13), and delete the blank line left at :23. Nothing else changes.
  - [ ] 11. Slider.tsx: `'--slider-pct': pct,` (:332) → `'--ds-slider-pct': pct,`; in the two arbitrary classes at :368 and :380, `var(--slider-pct)` → `var(--ds-slider-pct)`. Keep each class a single literal string (the Slider.tsx:97-98 comment: Tailwind's scanner must see the whole name). If WI-C4-07 has moved those calcs into `ds-slider-*` CSS, rename them there too.
  - [ ] 12. Input.stories.tsx:25 → `export const HasError: Story = { args: { placeholder: 'Error state', hasError: true } };`; VerificationCode.stories.tsx:31 → `export const HasError: Story = {`. Toast.stories.tsx:58 is WI-C3-15's.
  - [ ] 13. AIChat/constants.ts. After :39 (`* is settled — a transcript collapses behind a disclosure.`) insert:
    ```ts
     *
     * Figma labels this property `Variant`, but it is a lifecycle phase, so the
     * prop is `state` — the same split as AIToolPart (`state` = lifecycle,
     * `variant` = kind of work).
    ```
    AIThinkingPart.tsx and AIToolPart.tsx have headers but are not edited. The arch:122 `state` entry belongs to F-110 / decision D-08.
  - [ ] 14. Verify:
    - `npm run lint` → exit 0.
    - Step 5's two hashes unchanged.
    - `rg -n "slider-pct" src | rg -v "ds-slider-pct"` → no output.
    - `rg -n '"simple"' src/components/Toast/Toast.tsx` → no output.
    - `rg -n "export const Error" src` → only Toast.stories.tsx:58, until WI-C3-15 lands.
    - `rg -n "3px;|2px solid" src/styles/dooph-component-tokens.css | rg -n "underline-offset|border-left"` → no output.
    - Storybook (`npm run storybook`), any `AI Chat/Parts` story. In the browser console run `const d=document.createElement('div');d.className='ds-chat-prose';d.innerHTML='<a href="#">x</a><blockquote>y</blockquote>';document.body.append(d);[getComputedStyle(d.querySelector('a')).textUnderlineOffset,getComputedStyle(d.querySelector('blockquote')).borderLeftWidth]` → `["3px","2px"]`, as before the change.
    - `Inputs/Slider` stories: the active and inactive fills track the handle exactly as before (drag and keyboard).
    - `Inputs/Input` → `Has Error` and `Inputs/VerificationCode` → `Has Error` render the error state.
  - [ ] 15. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: `npm run lint` exits 0; `npm run sync-tokens` leaves theme.css and the generated block byte-identical; `rg -n "slider-pct" src | rg -v ds-slider-pct` and `rg -n '"simple"' src/components/Toast/Toast.tsx` → no output; the three header constraints each name a failure; the chat-prose computed styles are unchanged.
- log:
  - 2026-10-02 — created by audit


### WI-C7-62: Story hygiene — DS icons and text roles instead of hand-drawn SVGs and raw text nodes, a router-link asChild demo, no duplicate or dead stories, theme-aware fills, no redundant Table overrides, and a Button constraint that names its failure
- status: todo
- addresses: [F-118]
- depends_on: [WI-C7-52]
- phase: P1
- risk: low.
  - Only story files change, plus one comment line in Button.tsx's header. Stories never ship (tsup does not build them).
  - Deleting `TextLink` `Interactive` removes the Storybook id `text-textlink--interactive`. Nothing in the repo links it: `git grep -n "textlink--" b436647 -- . ':!docs/audit'` → no output. `WithAsChild` keeps its export name, so its id is unchanged.
  - Some stories change how they look:
    - The OutlineButton stories draw the DS `SearchIcon` (24-unit Tabler geometry, token stroke width) in place of the local 16-unit glyph.
    - SplitButton `WithIcon` draws `PlusIcon`.
    - CopyButton's snippet renders in the mono role instead of the body role.
    - Table `Default` gains its default `rounded-normal` corners.
    - In Table `Default` and `CellStackedContent`, the two `BodyText` spans of each two-line cell sat inline inside a block `<div>`. Without the wrapper they are two flex items of TableCell's `flex flex-col` (Table.tsx:134), so they stack. Stacking is what `CellStackedContent` is named for.
  - Other WIs edit these files, so match by content, not line number:
    - Table.stories.tsx: WI-C7-52 edits the :3 import and every TableHeaderCell's label, and names this WI's :40 and wrapper edits as non-overlapping. WI-C3-15 appends `RowsCustomHeight`, a copy of `Rows` (:188-229), which has no wrapper `<div>`.
    - OutlineButton.stories.tsx: WI-C7-03 (argTypes :30-31, prose :59, `inverseTheme` :62, `glowing` :75), WI-C5-02 (appends `AsChild`), WI-C5-09 (adds imports at :1-2 and appends a story).
    - SplitButton.stories.tsx: WI-C5-07 (imports :2-6 and `WithDropdown` :51-69), WI-C5-06 (:57).
    - Button.stories.tsx: WI-C3-15 (:34 `Brand` → `Prominent`), WI-C5-02 (appends `AsChild`).
    - Button.tsx header: WI-C3-18 deletes :19-20 (the "5.4" history lines, F-112 / F-013), so :21 may already be :19.
    - Avatar.stories.tsx: WI-C7-10 (:3 import).
  - Overlap with WI-C3-15 (F-105's stories sweep), checked item by item: it covers none of F-118's sub-items. Its raw-element and override edits are in other files, or on other lines of Button.stories.tsx and Table.stories.tsx. Nothing here is skipped, and WI-C3-15 is not a dependency.
- semver: none
- files:
  - modify: `src/components/TextLink/TextLink.stories.tsx:1,27-51 @ b436647`
  - modify: `src/components/OutlineButton/OutlineButton.stories.tsx:2-21,49,63,82,92 @ b436647`
  - modify: `src/components/SplitButton/SplitButton.stories.tsx:13-22,31-40 @ b436647`
  - modify: `src/components/CopyButton/CopyButton.stories.tsx:4,61-72 @ b436647`
  - modify: `src/components/Button/Button.stories.tsx:91 @ b436647`
  - modify: `src/components/Button/Button.tsx:21 @ b436647` (header comment only)
  - modify: `src/components/Avatar/Avatar.stories.tsx:2,15,19,62,79 @ b436647`
  - modify: `src/components/Sticker/Sticker.stories.tsx:127,141 @ b436647`
  - modify: `src/components/Table/Table.stories.tsx:40,83-86,104-107,244-247,250-253,258-261,264-267 @ b436647`
- anchor:
  ```tsx
  // TextLink.stories.tsx:27-28, :36-39, :42-51
  export const Interactive: Story = {
    name: "Interactive (Hover/Active)",
    args: {
      href: "#",
      children: "Hover or click to see state change",
    },
  export const WithAsChild: Story = {
    name: "asChild with button",
    render: () => (
      <TextLink asChild>
        <button onClick={() => alert("Button clicked!")}>
          Click as button
        </button>
      </TextLink>
    ),
  };
  // OutlineButton.stories.tsx:4-5, :49
  const SearchIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <SearchIcon />
  // SplitButton.stories.tsx:15-22, :31-32
  const meta = {
    title: "Buttons/SplitButton",
    parameters: { layout: "centered" },
    tags: ["autodocs"],
  } satisfies Meta;

  export default meta;
  type Story = StoryObj;
      icon={
        <svg viewBox="0 0 14 14" fill="none" width="14" height="14">
  // CopyButton.stories.tsx:61-63, :70
          <div className="flex flex-col items-start gap-3 p-4">
            <div className="flex items-center gap-2 rounded-tight border border-solid border-secondary-border bg-secondary px-3 py-2">
              <code className="text-style-body">{snippet}</code>
            <p className="text-style-body">
  // Button.stories.tsx:91
        ) as (typeof ButtonVariant)[keyof typeof ButtonVariant][]
  // Button.tsx:21
   * - Keep `ButtonVariant.prominent` in the API even if icon stories omit it.
  // Avatar.stories.tsx:15, :19, :62, :79
        fill="#0A0A0A"
        fill="#390EF8"
      <div className="flex items-center gap-3">
        <span className="text-style-label text-text">⌘</span>
  // Sticker.stories.tsx:127 (and :141)
    args: { children: "Milestones" },
  // Table.stories.tsx:40, :83-86 (the same wrapper at :104-107, :244-247, :250-253, :258-261, :264-267)
        className="h-[420px] border border-border-primary rounded-soft"
            <div>
              <BodyText>Bob Chen</BodyText>
              <BodyText className="text-text-secondary">Engineering</BodyText>
            </div>
  ```
- why: The stories are the DS's reference for consumers and agents, and these teach patterns the system exists to prevent (F-118 items 1-13; items 14-15 are no-action there):
  - hand-drawn icons and raw text nodes where `SearchIcon`/`PlusIcon` and `MonoText`/`BodyText`/`LabelText` ship (R9.24);
  - a TextLink rendered as a `<button>`, a use TextLink's own JSDoc (TextLink.tsx:12) never describes;
  - hex fills that turn the logo glyph illegible on the dark surface (R8.11);
  - a wrapper `<div>` TableCell does not need;
  - a border/radius override on the canonical Table that hides its default radius.

  Three other gaps:
  - The SplitButton docs page has no props table, because its meta has no `component`.
  - The `Interactive` TextLink story renders exactly like `Default`, because there is no pseudo-state addon.
  - The Button constraint gives an editor no reason to keep `prominent` (R11.7).
- steps:
  - [ ] 1. Baseline:
    - `rg -n "<svg" src/components/OutlineButton/OutlineButton.stories.tsx src/components/SplitButton/SplitButton.stories.tsx` → OutlineButton :5, SplitButton :32.
    - `rg -n 'fill="#' src/components/Avatar/Avatar.stories.tsx` → :15, :19.
    - `rg -n "<button|export const Interactive" src/components/TextLink/TextLink.stories.tsx` → :27, :46.
    - `rg -n "^\s*<div>$" src/components/Table/Table.stories.tsx` → :83, :104, :244, :250, :258, :264.
  - [ ] 2. TextLink.stories.tsx:
    - Delete `Interactive` (:27-40) and the blank line after it.
    - Replace `WithAsChild` (:42-51) with:
      ```tsx
      /** Stands in for Next.js `Link`: a component that renders its own `<a>` and forwards the ref. */
      const RouterLink = forwardRef<
        HTMLAnchorElement,
        AnchorHTMLAttributes<HTMLAnchorElement>
      >((props, ref) => <a ref={ref} {...props} />);
      RouterLink.displayName = "RouterLink";

      export const WithAsChild: Story = {
        name: "asChild with a router link",
        render: () => (
          <TextLink asChild>
            <RouterLink href="#changelog">Changelog</RouterLink>
          </TextLink>
        ),
      };
      ```
    - After :1, add `import { forwardRef, type AnchorHTMLAttributes } from "react";`.
  - [ ] 3. OutlineButton.stories.tsx:
    - Delete the local `SearchIcon` (:4-21) and the blank line after it.
    - After `import { OutlineButton } from "./OutlineButton";` (:2), add `import { IconSize, SearchIcon } from "../Icons";`.
    - At each of the four uses (:49, :63, :82, :92), `<SearchIcon />` → `<SearchIcon size={IconSize.md} />` (16px, the old glyph's size).
  - [ ] 4. SplitButton.stories.tsx:
    - :15-22 →
      ```tsx
      const meta = {
        title: "Buttons/SplitButton",
        component: SplitButton,
        parameters: { layout: "centered" },
        tags: ["autodocs"],
      } satisfies Meta<typeof SplitButton>;

      export default meta;
      type Story = StoryObj<typeof meta>;
      ```
      Every `SplitButtonProps` field is optional (SplitButton.tsx:71-78), so the render-only stories still type-check.
    - :31-40 (the whole `icon={ <svg …>…</svg> }` value) → `icon={<PlusIcon size={IconSize.rg} />}`. `IconSize.rg` is 14px, the icon slot's `size-[14px]` (SplitButton.tsx:33).
    - After the `../Menu/DropdownMenu` import block (ends :13), add `import { IconSize, PlusIcon } from "../Icons";`. WI-C5-07 edits :2-6, so do not merge it into that block.
  - [ ] 5. CopyButton.stories.tsx:61-72:
    - :61 `gap-3 p-4` → `gap-rg p-md` (12px, 16px; tokens.css:517-518).
    - :62 `gap-2` → `gap-xs`, and `px-3 py-2` → `px-rg py-xs` (8px, 12px, 8px; tokens.css:515, :517). The rest of the class string is unchanged.
    - :63 `<code className="text-style-body">{snippet}</code>` → `<MonoText as="code">{snippet}</MonoText>`. The element stays `<code>`.
    - :70-72 `<p className="text-style-body">` … `</p>` → `<BodyText as="p">` … `</BodyText>`. The element stays `<p>`.
    - After `import { CopyButtonVariant } from "./constants";` (:4), add `import { BodyText, MonoText } from "../Text";`.
  - [ ] 6. Button.stories.tsx:91 → `      ) as ButtonVariant[]`. The import does not change: `ButtonVariant` is already imported from `./constants` (:5), which exports both a const and a type under that name (constants.ts:8, :16).
  - [ ] 7. Button.tsx header. The rule is kept and gains its failure. Replace the line `` * - Keep `ButtonVariant.prominent` in the API even if icon stories omit it.`` (:21 @ b436647, or :19 if WI-C3-18 has landed) with:
    ```tsx
     * - Keep `ButtonVariant.prominent` in the API although the icon-size stories
     *   omit it — the stories are not the inventory, and dropping the key breaks
     *   every consumer's prominent call to action.
    ```
    Leave :19-20 alone; they belong to WI-C3-18. No code changes.
  - [ ] 8. Avatar.stories.tsx:
    - :15 `fill="#0A0A0A"` → `className="fill-text"`; :19 `fill="#390EF8"` → `className="fill-prominent-color"`. Tailwind emits a `fill-*` utility for every `--color-*`, and theme.css:84 `--color-text` and :87 `--color-prominent-color` exist. The glyph now follows `--ui-color-text` in both themes, and the dot follows `--ui-prominent-color`.
    - :62 `gap-3` → `gap-rg`.
    - :79 `<span className="text-style-label text-text">⌘</span>` → `<LabelText className="text-text">⌘</LabelText>`.
    - After `import { OrganizationIcon } from "../Icons";` (:2), add `import { LabelText } from "../Text";`. WI-C7-10 edits :3.
  - [ ] 9. Sticker.stories.tsx:
    - Delete the line `  args: { children: "Milestones" },` in `Sizes` (:127) and in `AllVariants` (:141). Both stories render their own children.
    - Every `StickerProps` field is optional, so `StoryObj<typeof meta>` needs no args. A tsc probe of `Sizes` without `args`, against the b436647 types, exits 0.
    - If `npm run lint` still reports a missing arg, move `children: "Milestones"` into `meta.args` rather than restoring the per-story lines.
  - [ ] 10. Table.stories.tsx:
    - :40 `className="h-[420px] border border-border-primary rounded-soft"` → `className="h-[420px]"`. Table already applies `border border-border-primary rounded-normal` (Table.tsx:27). The height stays: it is the story's own layout value (F-118 item 14).
    - Remove the six wrapper pairs: the `<div>` and `</div>` lines at :83/:86, :104/:107, :244/:247, :250/:253, :258/:261 and :264/:267. Leave the two `BodyText` children directly in each `TableCell`, dedented by one level.
  - [ ] 11. Verify with commands:
    - `npm run lint` → exit 0.
    - `rg -n "<svg" src/components/OutlineButton/OutlineButton.stories.tsx src/components/SplitButton/SplitButton.stories.tsx` → no output.
    - `rg -n 'fill="#' src/components/Avatar/Avatar.stories.tsx` → no output.
    - `rg -n "<button|export const Interactive" src/components/TextLink/TextLink.stories.tsx` → no output.
    - `rg -n "^\s*<div>$" src/components/Table/Table.stories.tsx` → no output.
    - `rg -n "border-border-primary rounded-soft|typeof ButtonVariant\)\[keyof" src/components/Table/Table.stories.tsx src/components/Button/Button.stories.tsx` → no output.
    - `rg -n 'args: \{ children: "Milestones" \}' src/components/Sticker/Sticker.stories.tsx` → no output.
    - `rg -n "gap-[0-9]|p[xy]?-[0-9]|text-style-" src/components/CopyButton/CopyButton.stories.tsx src/components/Avatar/Avatar.stories.tsx` → no output.
    - `rg -n "stories are not the inventory" src/components/Button/Button.tsx` → 1 hit.
  - [ ] 12. Verify in Storybook (`npm run storybook`, pane visible):
    - `Buttons/SplitButton` Docs shows a props table (`actionProps`, `triggerProps`, `icon`, `children`, `className`, `disabled`), and `With Icon` shows a 14px plus.
    - `Buttons/OutlineButton/With Icon` shows a 16px magnifier.
    - `Text/TextLink/asChild with a router link`: the DOM inspector shows one `<a href="#changelog">` carrying TextLink's classes, and no `<button>`.
    - `Bits & Pieces/Avatar/All Sizes`: with the dark theme toggled, the logo glyph reads light on the dark avatar surface.
    - `Bits & Pieces/Table/Default` has rounded-normal corners. In `Default` and `Cell Stacked Content`, each two-line cell shows the secondary line under the primary one.
    - `Buttons/CopyButton`'s callback story renders the snippet in mono, and the "Copied" line updates on click.
  - [ ] 13. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: `npm run lint` exits 0. Every step 11 rg assertion holds. The SplitButton docs page lists its props. Button.tsx's prominent constraint names its failure.
- log:
  - 2026-10-02 — created by audit

## DONE
