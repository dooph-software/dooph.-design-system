# WI-C5 — draft work items (composer C5) @ b436647

Ordering note: WI-C5-01 and WI-C5-04 both touch the polymorphic typing pattern (WI-C5-01 CopyButton's public props, WI-C5-04 the other six render functions); they edit different files and can land in either order. WI-C5-02 (asChild) and WI-C5-04 both edit OutlineButton/ShapeButton/DropdownTrigger, on different lines (render body vs `forwardRef` type argument); whichever lands second re-reads its anchors. WI-C5-07 depends on WI-C5-06 (same file). WI-C5-09 and WI-C5-10 both edit OutlineButton.tsx; WI-C5-10 depends on WI-C5-09. Probe and repro files named below live in a throwaway directory (`.tmp-probe/` at the repo root, deleted before the checkpoint) — never commit them. Prior-art probes for every typing claim are in `docs/audit/_work/scratch/C5/tsc/` (orig vs fixed copies; `orig.out.txt` / `fixed.out.txt`).

### WI-C5-01: Type CopyButton's props from the concrete `<button>` element
- status: todo
- addresses: [F-002, F-036]
- depends_on: []
- phase: P3
- risk: low — type-only change to one public interface plus removal of one cast; runtime output is identical. Calls that contradict the published declaration stop compiling (missing `value`, non-string `value`, `size`/`asChild`/`children`, unknown or mistyped props); that is the intended effect and is announced in the CHANGELOG.
- semver: minor
- files:
  - modify: `src/components/CopyButton/CopyButton.tsx:18-27,52 @ b436647`
  - modify: `CHANGELOG.md:20-21 @ b436647`
  - modify: `skills/dooph-design-system-usage/SKILL.md:115-116 @ b436647`
- anchor:
  ```tsx
  export interface CopyButtonProps
    extends Omit<
      ComponentPropsWithoutRef<typeof Button>,
      "variant" | "size" | "children" | "asChild"
    > {
    /** Text written to the clipboard. */
    value: string;
    variant?: CopyButtonVariant;
    onCopied?: (value: string) => void;
  }
  …
          onClick?.(e as never);
  ```
- why: `ComponentPropsWithoutRef<typeof Button>` resolves the generic Button at `ElementType`, so every CopyButton prop — including the required `value` — is `any` on the exported component; `<CopyButton />` compiles and copies `"undefined"` (F-002, S1), and the body's destructure is the CopyButton site of F-036.
- steps:
  - [ ] 1. Reproduce. Create `.tmp-probe/tsconfig.json`:
    ```json
    { "extends": "../tsconfig.json",
      "compilerOptions": { "noEmit": true, "declaration": false, "declarationMap": false, "sourceMap": false, "noUnusedLocals": false },
      "include": ["copybutton.probe.tsx"] }
    ```
    and `.tmp-probe/copybutton.probe.tsx`:
    ```tsx
    import { CopyButton, CopyButtonVariant } from "../src/components/CopyButton";
    export const ok1 = <CopyButton value="npm install" />;
    export const ok2 = <CopyButton variant={CopyButtonVariant.secondary} value="x" onCopied={(v) => v.length} />;
    export const ok3 = <CopyButton value="x" className="ml-auto" disabled aria-label="Copy command" onClick={(e) => e.currentTarget.blur()} data-testid="c" />;
    // @ts-expect-error value is required
    export const bad1 = <CopyButton />;
    // @ts-expect-error value must be a string
    export const bad2 = <CopyButton value={123} />;
    // @ts-expect-error variant is closed
    export const bad3 = <CopyButton value="x" variant="bogus" />;
    // @ts-expect-error onCopied must be a function
    export const bad4 = <CopyButton value="x" onCopied={42} />;
    // @ts-expect-error unknown prop
    export const bad5 = <CopyButton value="x" foo={1} />;
    // @ts-expect-error size is omitted by design
    export const bad6 = <CopyButton value="x" size="icon" />;
    ```
    Run `node node_modules/typescript/bin/tsc -p .tmp-probe/tsconfig.json --pretty false` → today it fails: TS7006 on `(v)` and `(e)` and TS2578 "Unused '@ts-expect-error'" on all six `bad*` lines.
  - [ ] 2. Replace the interface head (CopyButton.tsx:18-22):
    ```tsx
    // before
    export interface CopyButtonProps
      extends Omit<
        ComponentPropsWithoutRef<typeof Button>,
        "variant" | "size" | "children" | "asChild"
      > {
    // after
    export interface CopyButtonProps
      extends Omit<ComponentPropsWithoutRef<"button">, "children"> {
    ```
    (`value: string` legally narrows the button attribute `value`; `variant`/`size`/`asChild` are not button attributes, so the old Omit list collapses to `"children"`.)
  - [ ] 3. CopyButton.tsx:52 `onClick?.(e as never);` → `onClick?.(e);`. Leave `forwardRef<HTMLElement, …>` and the `ref as React.Ref<HTMLButtonElement>` cast (:72) as they are — the ref element type is F-089's.
  - [ ] 4. CHANGELOG.md `[Unreleased]` — under `### Changed` (after :21) add: `- \`CopyButtonProps\` is now typed from the native \`<button>\` attributes. \`value\` is required and must be a string, \`variant\`/\`onCopied\` are checked, and props CopyButton never accepted (\`size\`, \`asChild\`, \`children\`, unknown attributes) are compile errors; previously every prop was \`any\`.`
  - [ ] 5. skills/dooph-design-system-usage/SKILL.md:115 — `\`CopyButton\` (writes \`value\` to the clipboard,` → `\`CopyButton\` (writes the required \`value\` string to the clipboard,` (R13.2: a minor edits the usage skill).
  - [ ] 6. Verify: rerun the step-1 command → exit 0, no output. `npm run lint` → exit 0. `rg -n "as never|typeof Button>" src/components/CopyButton` → no output. Build in a scratch worktree carrying the change: `npm run build`, then `git status --porcelain` → empty, and `dist/components/CopyButton/CopyButton.d.ts` contains `extends Omit<ComponentPropsWithoutRef<"button">, "children">`. Storybook `Buttons/CopyButton` → every story renders; clicking `Secondary` swaps to the check icon and back. Delete `.tmp-probe/`.
  - [ ] 7. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: the step-1 probe exits 0 with all six `@ts-expect-error` lines consumed; `npm run lint` exits 0; `rg -n "typeof Button>" src` → no output.
- log:
  - 2026-10-01 — created by audit

### WI-C5-02: Make `asChild` work on the four decorated leaves with Radix `Slottable`, and add the missing asChild stories
- status: todo
- addresses: [F-003, F-024]
- depends_on: []
- phase: P3
- risk: medium — the render tree of four components changes shape (decoration and label now sit beside a `Slottable` marker). Without `asChild` the emitted DOM must be byte-identical (step 7 diffs it); with `asChild` the consumer element becomes the root and receives the root classes, handlers and ref. A non-element `asChild` child now throws Radix's descriptive "failed to slot onto its `Slottable`" instead of the generic error.
- semver: patch
- files:
  - modify: `src/components/OutlineButton/OutlineButton.tsx:3,285-288 @ b436647`
  - modify: `src/components/ShapeButton/ShapeButton.tsx:20,149-152 @ b436647`
  - modify: `src/components/DropdownTrigger/DropdownTrigger.tsx:3,73,332 @ b436647`
  - modify: `src/components/Button/Button.stories.tsx` (append one story; file ends at :137)
  - modify: `src/components/OutlineButton/OutlineButton.stories.tsx` (append one story; ends at :97)
  - modify: `src/components/ShapeButton/ShapeButton.stories.tsx` (append one story; ends at :96)
  - modify: `src/components/DropdownTrigger/DropdownTrigger.stories.tsx` (append two stories; ends at :104)
  - modify: `.agents/skills/dooph-ds-architecture/SKILL.md:221 @ b436647`
  - modify: `.agents/skills/dooph-ds-codebase/SKILL.md:129 @ b436647`
  - modify: `CHANGELOG.md:20-22 @ b436647`
- anchor:
  ```tsx
  // OutlineButton.tsx:285-288
            {/* Content sits above the blur layer */}
            <span className="relative z-10 inline-flex items-center gap-2">
              {children}
            </span>
  // ShapeButton.tsx:149-152
          {/* Icon slot — centered within the shape */}
          <span className="relative z-10 inline-flex items-center justify-center">
            {children}
          </span>
  // DropdownTrigger.tsx:73-74
        <span className="flex-1 text-left">{children}</span>
        <DropdownCaret variant={DropdownCaretVariant.dropdown} />
  // DropdownTrigger.tsx:332-333
          <span>{children}</span>
          <ChevronDownIcon
  ```
- why: All four render decoration as a sibling of `children` inside `Comp`, so Radix `Slot` throws for every `asChild` use the prop type and arch:221 promise (F-003, S1). `Slottable`'s render-prop form (`child` + function children, present in `@radix-ui/react-slot` ^1.3.3, the package's declared floor) marks the slot target while keeping each label wrapper around the consumer element's own children; a prototype with the real react-slot 1.3.3 (`docs/audit/_work/scratch/C5/slottable-proto.cjs`) renders `<button>` mode unchanged and `asChild` mode as `<a href class="root consumer"><span orb/><span z-10>Go</span></a>`, and the exact edits below type-check under the repo's `strict` + `noUnusedLocals` on copies of the three files (`scratch/C5/tsc/patch-aschild.cjs`, 0 errors). The two DropdownTrigger spans also get the one-line reason F-024 asks for.
- steps:
  - [ ] 1. Reproduce (fails today). Create `.tmp-probe/aschild-repro.cjs` (copy of `docs/audit/_work/scratch/C5/aschild-repro.cjs`):
    ```js
    // Usage: node aschild-repro.cjs <package-root-with-dist-and-node_modules>
    const { createRequire } = require("module");
    const path = require("path");
    const root = path.resolve(process.argv[2] || ".") + "/";
    const r = createRequire(root + "package.json");
    const React = r("react");
    const { renderToStaticMarkup } = r("react-dom/server");
    const ds = r(root + "dist/index.cjs");
    const h = React.createElement;
    const a = () => h("a", { href: "/x" }, "Go");
    const cases = [
      ["Button", () => h(ds.Button, { asChild: true }, a())],
      ["CTAButton", () => h(ds.CTAButton, { asChild: true, text: "Go", icon: h("span", null, ">") }, h("a", { href: "/x" }))],
      ["OutlineButton", () => h(ds.OutlineButton, { asChild: true }, a())],
      ["OutlineButton glowing", () => h(ds.OutlineButton, { asChild: true, glowing: true }, a())],
      ["ShapeButton", () => h(ds.ShapeButton, { asChild: true }, a())],
      ["DropdownTrigger", () => h(ds.DropdownTrigger, { asChild: true }, a())],
      ["TextDropdownTrigger", () => h(ds.TextDropdownTrigger, { asChild: true }, a())],
    ];
    console.error = () => {};
    let failed = 0;
    for (const [name, fn] of cases) {
      try {
        const out = renderToStaticMarkup(fn());
        // The <a> must be the interactive root (OutlineButton keeps its outer frame <div>).
        const rooted = out.includes("<a href=\"/x\"") && !out.includes("<button");
        if (!rooted) failed++;
        console.log((rooted ? "OK    " : "NOT-A ") + name + " -> " + out.slice(0, 160));
      } catch (e) {
        failed++;
        console.log("THROW " + name + " -> " + String(e.message).split("\n")[0]);
      }
    }
    process.exitCode = failed ? 1 : 0;
    ```
    and `.tmp-probe/nonaschild-snapshot.cjs` (copy of `docs/audit/_work/scratch/C5/nonaschild-snapshot.cjs`: the same preamble, then it renders `OutlineButton` "Go", `OutlineButton glowing` "Go", `ShapeButton` with an `<svg>` child, and `DropdownTrigger`/`TextDropdownTrigger` with children `"Sort by ", <b>Name</b>`, printing `name<TAB>markup` per line). In a scratch worktree at the current HEAD run `npm run build`, then `node .tmp-probe/aschild-repro.cjs <worktree>` → exit 1 with `THROW` for OutlineButton, OutlineButton glowing, ShapeButton, DropdownTrigger and TextDropdownTrigger and `OK` for Button and CTAButton (the audit's run on the built copy: `docs/audit/_work/scratch/C5/repro.before.txt`); then `node .tmp-probe/nonaschild-snapshot.cjs <worktree> > .tmp-probe/before.txt`.
  - [ ] 2. OutlineButton.tsx — :3 `import { Slot } from "@radix-ui/react-slot";` → `import { Slot, Slottable } from "@radix-ui/react-slot";`; replace :285-288 with:
    ```tsx
            {/* Content sits above the blur layer. Slottable marks the asChild
             * target, and the span wraps that element's own children, so the
             * label still layers above the orbs when slotted. */}
            <Slottable child={children}>
              {(child) => (
                <span className="relative z-10 inline-flex items-center gap-2">
                  {child}
                </span>
              )}
            </Slottable>
    ```
    The orb block (:173-283) stays the first child, unchanged.
  - [ ] 3. ShapeButton.tsx — :20 import `Slot, Slottable`; replace :149-152 with:
    ```tsx
          {/* Icon slot — centered within the shape. Slottable marks the asChild
           * target; the span wraps that element's own children. */}
          <Slottable child={children}>
            {(child) => (
              <span className="relative z-10 inline-flex items-center justify-center">
                {child}
              </span>
            )}
          </Slottable>
    ```
    (The header's behavior bullet "The icon slot carries the CONTENT color separately" stays true; no header edit.)
  - [ ] 4. DropdownTrigger.tsx — :3 import `Slot, Slottable`; then:
    ```tsx
    // :73 before
          <span className="flex-1 text-left">{children}</span>
    // :73 after
          {/* flex-1 pushes the caret to the far edge; Slottable marks the asChild target. */}
          <Slottable child={children}>
            {(child) => <span className="flex-1 text-left">{child}</span>}
          </Slottable>
    // :332 before
            <span>{children}</span>
    // :332 after
            {/* Keeps multi-node children one inline run, so the root's gap sits
             * only between the label and the chevron. Slottable marks the asChild target. */}
            <Slottable child={children}>{(child) => <span>{child}</span>}</Slottable>
    ```
  - [ ] 5. Stories (R9.23 — contradict `asChild`'s default once per component). Append:
    - Button.stories.tsx: `export const AsChild: Story = { render: () => (<Button asChild variant={ButtonVariant.primary}><a href="#settings">Settings</a></Button>) };`
    - OutlineButton.stories.tsx: `export const AsChild: Story = { render: () => (<OutlineButton asChild><a href="#find">Find anything</a></OutlineButton>) };`
    - ShapeButton.stories.tsx: `export const AsChild: Story = { render: () => (<ShapeButton asChild shape={ShapeButtons.squircle}><a href="#send" aria-label="Send"><SendIcon /></a></ShapeButton>) };`
    - DropdownTrigger.stories.tsx: `export const SecondaryAsChild: Story = { render: () => <DropdownTrigger asChild><a href="#sort">Sort by name</a></DropdownTrigger> };` and `export const TextAsChild: Story = { render: () => <TextDropdownTrigger asChild><a href="#sort">Sort by name</a></TextDropdownTrigger> };`
  - [ ] 6. Docs. arch SKILL.md:221 → `Leaf interactive components (Button, CTAButton, TextLink, DropdownTrigger, TextDropdownTrigger, OutlineButton, ShapeButton) support \`asChild\` via \`@radix-ui/react-slot\`. A leaf that renders decoration beside \`children\` (orbs, a shape, a caret) puts that decoration next to a \`Slottable\` in its render-prop form (\`<Slottable child={children}>{(child) => <span>{child}</span>}</Slottable>\`), so the Slot has exactly one target and the label wrapper survives slotting. This lets consumers render them as \`<Link>\`, \`<a>\`, or any other element without losing interaction behavior.` codebase SKILL.md:129 last cell `via \`Button\`` → `❌ (omitted — always a \`<button>\`)` (claim C-CB-39). CHANGELOG.md `[Unreleased]`: add a `### Fixed` section after `### Changed` (:20-21) with `- \`asChild\` on \`OutlineButton\`, \`ShapeButton\`, \`DropdownTrigger\` and \`TextDropdownTrigger\` no longer throws "Slot failed to slot onto its children"; the child element becomes the interactive root and the decoration renders inside it.`
  - [ ] 7. Verify: `npm run lint` → exit 0. Rebuild the scratch worktree with the change; `node .tmp-probe/aschild-repro.cjs <worktree>` → exit 0, seven `OK` lines; `node .tmp-probe/nonaschild-snapshot.cjs <worktree> | diff .tmp-probe/before.txt -` → no output; `git status --porcelain` in the worktree → empty. `rg -c "<Slottable child=" src/components` → `OutlineButton.tsx:1`, `ShapeButton.tsx:1`, `DropdownTrigger.tsx:2`. Storybook: `Buttons/Button/As Child`, `Buttons/OutlineButton/As Child`, `Buttons/ShapeButton/As Child`, `Menus/DropdownTriggers/Secondary As Child` and `Text As Child` render with no error overlay; in the OutlineButton story the `<a>` carries `group relative overflow-hidden` and hovering it fades the orbs in; in the DropdownTrigger story the `<a>` carries `ds-dropdown-caret-host` and the caret leans on hover. Delete `.tmp-probe/`.
  - [ ] 8. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: `aschild-repro.cjs` exits 0 against a build of the change; the non-asChild snapshot diff is empty; each of the four components has an asChild story; `rg -n "via \`Button\`" .agents/skills/dooph-ds-codebase/SKILL.md` → no output.
- log:
  - 2026-10-01 — created by audit

### WI-C5-03: Remove Sticker's inner children wrapper and record the reason at the other purposeful wrappers
- status: todo
- addresses: [F-024]
- depends_on: []
- phase: P3
- risk: low — one DOM level is removed from Sticker; the audit's render (V7) shows the layout is pixel-identical when `gap-xs` moves to the root. A consumer who targeted the old inner div with a descendant selector (`[&>div]:…`) loses it. `stickerVariants` is a public export (F-087), so a consumer applying it to their own element now also gets `gap-xs`. The other edits are comments.
- semver: patch
- files:
  - modify: `src/components/Sticker/Sticker.tsx:10-12,33,131 @ b436647`
  - modify: `src/components/Menu/DropdownMenu.tsx:326 @ b436647`
  - modify: `src/components/AIChat/AIModelSelect.tsx:64,100 @ b436647`
- anchor:
  ```tsx
  // Sticker.tsx:10-12
   * - Children are the content. They are wrapped in a row with `gap-xs` so an
   *   icon and a text node sit beside each other without a wrapper at the call
   *   site. The wrapper is layout, not an interactive element.
  // Sticker.tsx:33
      "inline-flex w-fit items-center overflow-clip",
  // Sticker.tsx:131
          <div className="flex flex-row items-center gap-xs">{children}</div>
  // DropdownMenu.tsx:326
        <span className="flex flex-1 items-center gap-sm">{children}</span>
  // AIModelSelect.tsx:64, :100
      <span className="whitespace-nowrap text-text">{children}</span>
      <span className="min-w-0 flex-1 truncate">{children}</span>
  ```
- why: Sticker's root is already the `inline-flex items-center` row, so the inner div is not "visually required" (R3.3) and it swallows a consumer's `gap-*`/child selectors (F-024). The other wrappers are load-bearing but give no reason at the site, so an agent enforcing R3.4 cannot tell them from Sticker's (TextDropdownTrigger's and DropdownTrigger's spans get their comments in WI-C5-02).
- steps:
  - [ ] 1. Reproduce: in Storybook `Bits & Pieces/Sticker/Prominent`, run in the console `const s = document.querySelector('[class*="bg-sticker-bg-prominent"]'); [s.children.length, s.firstElementChild.tagName]` → `[1, "DIV"]`; then add `gap-lg` to it (`s.classList.add("gap-lg")`) and note the icon-to-label distance does not change.
  - [ ] 2. Sticker.tsx:33 `"inline-flex w-fit items-center overflow-clip",` → `"inline-flex w-fit items-center gap-xs overflow-clip",`; Sticker.tsx:131 `<div className="flex flex-row items-center gap-xs">{children}</div>` → `{children}`.
  - [ ] 3. Header, same change (R10.4) — replace :10-12 with:
    ```
     * - Children are the content and sit directly in the root, which is the
     *   row: `gap-xs` on the root spaces an icon and a text node, so a consumer's
     *   `gap-*` or child selectors on `className` reach them.
    ```
    The `## constraints` block (:17-23) is unchanged.
  - [ ] 4. Comments on the purposeful wrappers (no code change):
    - DropdownMenu.tsx, above :326: `{/* flex-1 fills the row beside the leading checkbox, so the label takes the remaining width. */}`
    - AIModelSelect.tsx, above :64: `{/* Keeps the model name on one line in the primary text tone; the detail span below uses the ghost tone. */}`
    - AIModelSelect.tsx, above :100: `{/* min-w-0 + truncate lets a long model name ellipsize beside the swatch instead of widening the menu. */}`
  - [ ] 5. Verify: `npm run lint` → exit 0. `rg -n "flex flex-row items-center gap-xs" src/components/Sticker` → no output. Storybook `Bits & Pieces/Sticker/AllVariants` and `Sizes` look unchanged against the pre-change screenshots; the step-1 console check on `Prominent` now gives `[2, "svg"]` (the `AIPlanIcon` and the `ButtonText` span are direct children of the root) and `getComputedStyle(s).columnGap` → `8px`; `s.classList.add("gap-lg")` now visibly widens the icon-to-label gap. Build in a scratch worktree carrying the change → `git status --porcelain` empty.
  - [ ] 6. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: Sticker renders `{children}` directly with `gap-xs` on the root; the header's children bullet describes that; `rg -n "flex flex-row items-center gap-xs" src` → no output; the three comments exist.
- log:
  - 2026-10-01 — created by audit

### WI-C5-04: Type the polymorphic render functions against their concrete element and drop the casts-from-any
- status: todo
- addresses: [F-036]
- depends_on: []
- phase: P2
- risk: low — type-only; emitted JS is unchanged and every exported component keeps its generic cast signature (the audit probe compiled `<OutlineButton<"a"> href>`, `<DropdownTrigger<"a"> href>`, `<BaseText as="label" htmlFor>` and `<BodyText as="p" fontSize>` against the patched copies with 0 errors). If a body somewhere relied on an `any` prop, `npm run lint` surfaces it — fix the use, never re-widen the type.
- semver: none
- files:
  - modify: `src/components/Button/Button.tsx:124 @ b436647`
  - modify: `src/components/OutlineButton/OutlineButton.tsx:71 @ b436647`
  - modify: `src/components/ShapeButton/ShapeButton.tsx:104,117-118,128,137 @ b436647`
  - modify: `src/components/DropdownTrigger/DropdownTrigger.tsx:51,302 @ b436647`
  - modify: `src/components/Text/BaseText.tsx:61,80 @ b436647`
- anchor:
  ```tsx
  Button.tsx:124         const ButtonBase = forwardRef<HTMLElement, ButtonProps<ElementType>>(
  OutlineButton.tsx:71     OutlineButtonProps<ElementType>
  ShapeButton.tsx:104    const ShapeButtonBase = forwardRef<HTMLElement, ShapeButtonProps<ElementType>>(
  ShapeButton.tsx:117        const Shape = shapeComponents[shape as ShapeButtons];
  ShapeButton.tsx:118        const resolvedVariant = variant as ShapeButtonVariant;
  ShapeButton.tsx:128              contentClasses[resolvedVariant],
  ShapeButton.tsx:137                shapeFillClasses[resolvedVariant],
  DropdownTrigger.tsx:51   DropdownTriggerProps<ElementType>
  DropdownTrigger.tsx:302    TextDropdownTriggerProps<ElementType>
  BaseText.tsx:61        const BaseTextBase = forwardRef<HTMLElement, BaseTextProps<ElementType>>(
  BaseText.tsx:80            const role = unstyled ? undefined : (variant as TextVariant);
  ```
- why: Instantiating each props type at `ElementType` turns every destructured binding into `any` (40/40, F-036), so the next prop rename compiles with the old name and silently disables the prop. Typing the render function at the default element restores checking with a one-argument change per site; no shared helper type is needed. CopyButton, the seventh site, is fixed by WI-C5-01.
- steps:
  - [ ] 1. Reproduce (mutation check): temporarily insert `const probe: number = variant; void probe;` as the first line of the Button render body (after Button.tsx:125) and the same with `glowing` in OutlineButton's body (after :85) and `fontSize` in BaseText's body (after :79); run `npm run lint` → exit 0 today (each binding is `any`, so a boolean/string/size assigned to `number` compiles). Remove the three lines.
  - [ ] 2. Edits (the same script the audit ran on copies: `docs/audit/_work/scratch/C5/tsc/patch-f036.cjs`):
    - Button.tsx:124 → `const ButtonBase = forwardRef<HTMLElement, ButtonProps<"button">>(`
    - OutlineButton.tsx:71 → `  OutlineButtonProps<"button">`
    - ShapeButton.tsx:104 → `const ShapeButtonBase = forwardRef<HTMLElement, ShapeButtonProps<"button">>(`; :117-118 → the single line `    const Shape = shapeComponents[shape];`; :128 `contentClasses[resolvedVariant],` → `contentClasses[variant],`; :137 `shapeFillClasses[resolvedVariant],` → `shapeFillClasses[variant],`
    - DropdownTrigger.tsx:51 → `  DropdownTriggerProps<"button">`; :302 → `  TextDropdownTriggerProps<"button">`
    - BaseText.tsx: insert above :61
      ```tsx
      /* The render function sees the own props plus span attributes; only the
       * exported cast below is polymorphic. `as` stays ElementType so any tag
       * can render. */
      type BaseTextRenderProps = BaseTextOwnProps & { as?: ElementType } & Omit<
        ComponentPropsWithoutRef<"span">,
        keyof BaseTextOwnProps | "as"
      >;
      ```
      then :61 → `const BaseTextBase = forwardRef<HTMLElement, BaseTextRenderProps>(` and :80 → `    const role = unstyled ? undefined : variant;`
  - [ ] 3. No header changes: Button.tsx:1-22 and ShapeButton.tsx:1-17 describe mapping and shape keying, not prop typing; ShapeButton's constraint (`shapeComponents` keyed by `ShapeButtons`) is still what the uncast index relies on.
  - [ ] 4. Verify: `npm run lint` → exit 0. Repeat the step-1 mutation → `npm run lint` now fails with three TS2322 errors (`variant`, `glowing`, `fontSize` not assignable to `number`); remove the lines again. `rg -n "Props<ElementType>" src/components` → exactly one line, the `RoleTextProps<ElementType>` pass-through in BaseText's role factory (it destructures nothing, so it carries no `any` binding); `rg -n "as ShapeButtons\]|as ShapeButtonVariant|variant as TextVariant" src/components` → no output. Public signatures: create `.tmp-probe/poly.probe.tsx` with `<OutlineButton<"a"> href="/x" glowing>Go</OutlineButton>`, `<DropdownTrigger<"a"> href="/x">Go</DropdownTrigger>`, `<BaseText as="label" htmlFor="id">x</BaseText>`, `<BodyText as="p" fontSize={16}>x</BodyText>` and `// @ts-expect-error` above `<OutlineButton glowing="yes">Go</OutlineButton>`, compiled with the WI-C5-01 `.tmp-probe/tsconfig.json` (include `poly.probe.tsx`) → exit 0. Build in a scratch worktree carrying the change → `git status --porcelain` empty and `diff` of `dist/index.js` against a HEAD build → only chunk-hash/sourcemap noise (no code change). Delete `.tmp-probe/`.
  - [ ] 5. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: `npm run lint` exits 0; the step-1 mutation fails `npm run lint`; the only `Props<ElementType>` left in src is the RoleText pass-through.
- log:
  - 2026-10-01 — created by audit

### WI-C5-05: Type Button `variant`/`size` and SheetContent `side` from their consts instead of cva `VariantProps`
- status: blocked(D-01)
- addresses: [F-037]
- depends_on: [WI-RELEASE-OPEN]
- phase: P4
- risk: low at runtime (no emitted-JS change), but a TypeScript break: any consumer call passing `null` (typically `cond ? X : null`) stops compiling and must pass `undefined` instead. Calls with const members or the string values keep compiling (audit probe: `variant="ghost"`, `size={ButtonSize.iconSm}`, `cond ? ButtonVariant.primary : undefined` compile; `variant={null}`/`size={null}` error).
- semver: major
- files:
  - modify: `src/components/Button/Button.tsx:26,35,110-112 @ b436647`
  - modify: `src/components/Sheet/Sheet.tsx:4,122-126 @ b436647`
  - modify: `src/components/Checkbox/Checkbox.tsx:21,70-73 @ b436647` (conditional, step 4)
  - modify: `src/components/Tabs/Tabs.tsx:4,33-36 @ b436647` (conditional, step 4)
  - modify: `CHANGELOG.md:10-22 @ b436647`
- anchor:
  ```tsx
  // Button.tsx:110-112
  type ButtonOwnProps = VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };
  // Sheet.tsx:122-126
    ComponentPropsWithoutRef<typeof DialogPrimitive.Content> &
      VariantProps<typeof sheetVariants> & {
        /** When true, renders the overlay behind the sheet. Defaults to true. */
        withOverlay?: boolean;
      }
  ```
- why: cva's `VariantProps` admits `null`, which cva reads as "no variant", so `<Button variant={null}>` renders colourless and unsized and `<SheetContent side={null}>` renders unpositioned, with no warning (F-037). Typing from the consts (as Toggle, Sticker and Slider already do) removes `null` and makes the const the single source of truth. Removing an accepted value is a breaking type change, so it waits for the major (D-01).
- steps:
  - [ ] 1. Reproduce: `.tmp-probe/null.probe.tsx` (tsconfig as in WI-C5-01) with `import { Button } from "../src/components/Button"; import { SheetContent } from "../src/components/Sheet";` and three lines each preceded by `// @ts-expect-error`: `<Button variant={null}>x</Button>`, `<Button size={null}>x</Button>`, `<SheetContent side={null}>x</SheetContent>` → today `tsc -p .tmp-probe/tsconfig.json` reports three TS2578 "Unused '@ts-expect-error'".
  - [ ] 2. Button.tsx — :26 `import { cva, type VariantProps } from "class-variance-authority";` → `import { cva } from "class-variance-authority";`; after :35 add `import type { ButtonSize, ButtonVariant } from "./constants";`; :110-112 →
    ```tsx
    type ButtonOwnProps = {
      variant?: ButtonVariant;
      size?: ButtonSize;
      asChild?: boolean;
    };
    ```
    (The comment at :107-108 about the consts living in ./constants stays true.)
  - [ ] 3. Sheet.tsx — drop `type VariantProps` from the :4 import (keep `cva`); :122-126 →
    ```tsx
      ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
        side?: SheetSide;
        /** When true, renders the overlay behind the sheet. Defaults to true. */
        withOverlay?: boolean;
      }
    ```
    (`SheetSide` is already in scope — it is the default at :132.)
  - [ ] 4. Checkbox and TabsTrigger use the same typing (U6-F14, owned by F-087). Run `rg -n "VariantProps<typeof (checkbox|tabTrigger)Variants>" src`; for each hit still present, apply the same change: Checkbox.tsx:70-73 → `export interface CheckboxProps extends ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> { variant?: CheckboxVariant; }` (import the type from `./constants`); Tabs.tsx:33-36 → `export interface TabsTriggerProps extends ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> { size?: TabSize; variant?: TabVariant; }` (import the types from `./constants`); drop each now-unused `VariantProps` import.
  - [ ] 5. CHANGELOG.md `[Unreleased]` — `### Changed`: `- **Breaking (types):** \`Button\` \`variant\`/\`size\`, \`SheetContent\` \`side\` (and \`Checkbox\` \`variant\`, \`TabsTrigger\` \`variant\`/\`size\`) are typed from their exported consts and no longer accept \`null\`; pass \`undefined\` for "use the default".` In `skills/dooph-design-system-v6-migration/SKILL.md` (created by WI-RELEASE-OPEN) add a hard-bucket inventory row and step: "`variant={cond ? X : null}` → `variant={cond ? X : undefined}` on Button / SheetContent (`side`) / Checkbox / TabsTrigger (`size` too)", with the finder `rg -n "(variant|size|side)=\{[^}]*\bnull\b" src`.
  - [ ] 6. Verify: rerun step 1 → exit 0 (all three expect-errors consumed). `npm run lint` → exit 0 (Toast's `buttonVariants({ variant: ButtonVariant.*, size: ButtonSize.* })` calls and CopyButton still compile). `rg -n "VariantProps" src --glob '!Toggle/**'` → only the Sticker.tsx:72-74 comment. Build in a scratch worktree → `git status --porcelain` empty; `dist/components/Button/Button.d.ts` no longer contains `| null`. Storybook `Buttons/Button` and `Overlays/Sheet` stories render unchanged. Delete `.tmp-probe/`.
  - [ ] 7. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: `<Button variant={null}>` and `<SheetContent side={null}>` fail `tsc`; `npm run lint` exits 0; no public component prop is typed from `VariantProps`.
- log:
  - 2026-10-01 — created by audit


### WI-C5-06: Build the SplitButton parts on the secondary `buttonVariants` recipe and give the trigger a default accessible name
- status: todo
- addresses: [F-041, F-081]
- depends_on: []
- phase: P3
- risk: medium (visual) — the parts take the secondary Button's paints, so in light mode the border moves from `--ui-color-border-primary` (#dddddd) to `--ui-color-secondary-border` (#e2e3e4), hover now also changes the border, disabled now paints `bg-secondary-disabled`, `aria-disabled` is honoured and the transition is 150ms instead of 100ms. That convergence is the fix; geometry (16px inline padding, one shared seam border, one-sided radii, group shadow on the composite) is kept. The trigger gains `aria-label="More options"` unless the consumer passes one.
- semver: patch
- files:
  - modify: `src/components/SplitButton/SplitButton.tsx:3-5,13-37,42-66 @ b436647`
  - modify: `src/components/SplitButton/SplitButton.stories.tsx:57 @ b436647`
  - modify: `.agents/skills/dooph-ds-codebase/SKILL.md:124-126 @ b436647`
  - modify: `skills/dooph-design-system-usage/SKILL.md:112 @ b436647`
  - modify: `CHANGELOG.md:20-22 @ b436647`
- anchor:
  ```tsx
  // SplitButton.tsx:17-30 (Action)
        className={cn(
          "inline-flex h-button items-center",
          "ds-gap-ui-xs pl-4 pr-4",
          "rounded-l-tight rounded-r-none",
          "border border-solid border-border-primary border-r-0",
          "bg-secondary text-secondary-fg",
          "text-style-button cursor-pointer select-none",
          "transition-all duration-100",
          "hover:enabled:bg-secondary-hover",
          "active:enabled:bg-secondary-active",
          "ds-focus-visible-ring",
          "ds-disabled-state disabled:border-secondary-border-disabled",
          className,
        )}
  // SplitButton.tsx:42-64 (Trigger)
  export interface SplitButtonTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {}
  …
  >(({ className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex size-button items-center justify-center",
        "rounded-r-tight rounded-l-none",
        "border border-solid border-border-primary",
        "bg-secondary text-secondary-fg",
        "cursor-pointer select-none transition-all duration-100",
        "hover:enabled:bg-secondary-hover",
        "active:enabled:bg-secondary-active",
        "ds-focus-visible-ring",
        "ds-disabled-state disabled:border-secondary-border-disabled",
        className,
      )}
      {...props}
    >
      <ChevronDownIcon />
  ```
- why: The hand-built parts have drifted from the secondary Button on border token, hover border, transition, disabled fill and `aria-disabled` (F-081), and the icon-only trigger has no accessible name in any default render (F-041, WCAG 4.1.2). Reusing the recipe Toast already reuses fixes the drift at its source; the default label fixes the name without forcing every consumer to know about it.
- steps:
  - [ ] 1. Reproduce: in a scratch-worktree build of HEAD, `node -e` with the WI-C5-02 preamble rendering `h(ds.SplitButton, null, "Save")` → the second `<button>` has no `aria-label` and contains only the `aria-hidden` svg; in Storybook `Buttons/SplitButton/Default`, the accessibility pane (or `document.querySelectorAll("button")[1].getAttribute("aria-label")`) → `null`, and `getComputedStyle(<action>).borderTopColor` differs from a secondary `Button`'s (`Buttons/Button/Default`).
  - [ ] 2. Imports (:3-5): add `import { buttonVariants } from "../Button/Button";` and `import { ButtonSize, ButtonVariant } from "../Button/constants";` (deep sibling imports, as Toast and AIContextGauge do, so a later change to the Button barrel cannot break them).
  - [ ] 3. Add above `SplitButtonAction`:
    ```tsx
    /* The split parts ARE secondary Buttons: paints, state guards, focus ring and
     * disabled treatment come from buttonVariants. Only the split geometry is
     * local — one-sided radii, a single shared seam (the action drops its right
     * border), and no per-part shadow (the group carries shadow-button). */
    const PART_SHADOW_NONE = [
      "shadow-none",
      "[&:not(:disabled):not([aria-disabled=true])]:hover:shadow-none",
      "[&:not(:disabled):not([aria-disabled=true])]:active:shadow-none",
    ];
    ```
  - [ ] 4. Action className (:17-30) →
    ```tsx
        className={cn(
          buttonVariants({ variant: ButtonVariant.secondary, size: ButtonSize.default }),
          "px-md gap-xs rounded-r-none border-r-0",
          PART_SHADOW_NONE,
          className,
        )}
    ```
    (`cn`'s tailwind-merge replaces `px-3`/`gap-2`/`shadow-button-secondary` and the hover/active shadow classes; `rounded-r-none` and `border-r-0` sort after `rounded-tight`/`border` in the built CSS — dist-styles.css :849/:872 and :884/:904 — so they win.) The `size-[14px]` icon slot at :33 is unchanged.
  - [ ] 5. Trigger (:42-66) →
    ```tsx
    export interface SplitButtonTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
      /** Accessible name of the icon-only trigger. Defaults to "More options";
       * pass a localised label, or `aria-labelledby`. */
      "aria-label"?: string;
    }

    const SplitButtonTrigger = forwardRef<
      HTMLButtonElement,
      SplitButtonTriggerProps
    >(({ className, "aria-label": ariaLabel = "More options", ...props }, ref) => (
      <button
        ref={ref}
        aria-label={ariaLabel}
        className={cn(
          buttonVariants({ variant: ButtonVariant.secondary, size: ButtonSize.icon }),
          "rounded-l-none",
          PART_SHADOW_NONE,
          className,
        )}
        {...props}
      >
        <ChevronDownIcon />
      </button>
    ));
    ```
  - [ ] 6. Story: SplitButton.stories.tsx:57 `<SplitButtonTrigger />` → `<SplitButtonTrigger aria-label="More save options" />` (shows the override; `Default`/`WithIcon`/`Disabled` keep exercising the default label).
  - [ ] 7. Docs: codebase SKILL.md:126 (`SplitButtonTrigger` row) Variants cell `–` → `secondary \`buttonVariants\` (icon size); default \`aria-label="More options"\``; :125 (`SplitButtonAction`) → `secondary \`buttonVariants\``. usage SKILL.md:112 → `` `SplitButton` (+ `SplitButtonAction`, `SplitButtonTrigger` — icon-only, named "More options" unless you pass a localised `aria-label`), ``. CHANGELOG.md `[Unreleased]` `### Fixed` (create it if WI-C5-02 has not): `- \`SplitButtonTrigger\` has a default accessible name ("More options", overridable with \`aria-label\`), and the split parts now share the secondary \`Button\`'s paints and disabled/\`aria-disabled\` states.`
  - [ ] 8. Verify: `npm run lint` → exit 0. Scratch-worktree build: the step-1 render now shows `aria-label="More options"` on the trigger, and `h(ds.SplitButtonTrigger, { "aria-label": "Weitere Optionen" })` renders that label. `git status --porcelain` → empty. Storybook `Buttons/SplitButton/*`: the accessibility tree names the trigger; `getComputedStyle` border-top-color of the action equals the secondary Button's; `Disabled` paints the disabled fill; the inline padding is still 16px (`getComputedStyle(action).paddingLeft` → `16px`) and the group shadow is the only shadow at rest and on hover. `rg -n "hover:enabled|border-border-primary" src/components/SplitButton/SplitButton.tsx` → no output.
  - [ ] 9. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: every default SplitButton trigger has an accessible name; both parts compose `buttonVariants({ variant: ButtonVariant.secondary })`; the step-8 rg assertion holds; `npm run lint` exits 0.
- log:
  - 2026-10-01 — created by audit

### WI-C5-07: Export a `SplitButtonGroup` part so a menu-hosting split button keeps the composite's chrome
- status: todo
- addresses: [F-092]
- depends_on: [WI-C5-06]
- phase: P3
- risk: low — additive public part; the composite renders through it with identical classes, so its DOM is unchanged. The `WithDropdown` story gains the group's `rounded-tight shadow-button`, which is the intended visual fix.
- semver: minor
- files:
  - modify: `src/components/SplitButton/SplitButton.tsx:3,69-98 @ b436647`
  - modify: `src/components/SplitButton/index.ts:1-2 @ b436647`
  - modify: `src/components/SplitButton/SplitButton.stories.tsx:2-6,51-69 @ b436647`
  - modify: `.agents/skills/dooph-ds-codebase/SKILL.md:124-126 @ b436647`
  - modify: `skills/dooph-design-system-usage/SKILL.md:112 @ b436647`
  - modify: `CHANGELOG.md:12-18 @ b436647`
- anchor:
  ```tsx
  // SplitButton.tsx:88-95
    return (
      <div className={cn("inline-flex rounded-tight shadow-button", className)}>
        <SplitButtonAction icon={icon} disabled={disabled} {...actionProps}>
          {children}
        </SplitButtonAction>
        <SplitButtonTrigger disabled={disabled} {...triggerProps} />
      </div>
    );
  // SplitButton.stories.tsx:54-59
        <div className="inline-flex">
          <SplitButtonAction>Save</SplitButtonAction>
          <DropdownMenuTrigger asChild>
            <SplitButtonTrigger />
          </DropdownMenuTrigger>
        </div>
  ```
- why: The composite renders its trigger internally, so it cannot sit under `DropdownMenuTrigger asChild`, and the only worked dropdown example re-assembles the parts in a bare `inline-flex` div that drops the group's radius and shadow (F-092). A group part gives the hand-assembled form the composite's chrome by construction; one source for the chrome also replaces the two copies (composite + story) that already disagree.
- steps:
  - [ ] 1. Reproduce: Storybook `Buttons/SplitButton/With Dropdown` vs `Default` — `getComputedStyle(<the wrapper div>).boxShadow` is `none` in `With Dropdown` and the `--ui-shadow-button` value in `Default`.
  - [ ] 2. SplitButton.tsx — :3 add `type HTMLAttributes` to the react import. Insert before the composite (:69):
    ```tsx
    /* SplitButtonGroup (wrapper) — the composite's chrome as a part, so a split
     * button whose trigger opens a DropdownMenu (and must therefore be composed
     * by hand under DropdownMenuTrigger asChild) keeps the same radius and shadow. */

    export type SplitButtonGroupProps = HTMLAttributes<HTMLDivElement>;

    const SplitButtonGroup = forwardRef<HTMLDivElement, SplitButtonGroupProps>(
      ({ className, ...props }, ref) => (
        <div
          ref={ref}
          className={cn("inline-flex rounded-tight shadow-button", className)}
          {...props}
        />
      ),
    );
    SplitButtonGroup.displayName = "SplitButtonGroup";
    ```
    Replace the composite's `<div className={cn("inline-flex rounded-tight shadow-button", className)}>` … `</div>` (:89, :94) with `<SplitButtonGroup className={className}>` … `</SplitButtonGroup>`, and :98 → `export { SplitButton, SplitButtonAction, SplitButtonGroup, SplitButtonTrigger };`.
  - [ ] 3. index.ts → `export { SplitButton, SplitButtonAction, SplitButtonGroup, SplitButtonTrigger } from './SplitButton';` and add `SplitButtonGroupProps` to the type export line (src/index.ts:20 re-exports the folder with `export *`, so nothing else changes).
  - [ ] 4. Story — import `SplitButtonGroup` (:2-6) and rewrite `WithDropdown`'s wrapper (:54-59):
    ```tsx
          <SplitButtonGroup>
            <SplitButtonAction>Save</SplitButtonAction>
            <DropdownMenuTrigger asChild>
              <SplitButtonTrigger aria-label="More save options" />
            </DropdownMenuTrigger>
          </SplitButtonGroup>
    ```
    and add `component: SplitButton` to the meta (:15-19) so autodocs shows the props table.
  - [ ] 5. Docs: codebase SKILL.md — add a row after :126: `| \`SplitButtonGroup\` | same | – | – | ❌ |` and append to the `SplitButton` row's Variants cell `; renders through \`SplitButtonGroup\` — compose \`SplitButtonGroup\` + \`SplitButtonAction\` + \`DropdownMenuTrigger asChild\`/\`SplitButtonTrigger\` to open a menu`. usage SKILL.md:112 → name `SplitButtonGroup` among the parts with "(use it, not a bare div, when the trigger opens a `DropdownMenu`)". CHANGELOG.md `[Unreleased]` `### Added`: `- \`SplitButtonGroup\` — the SplitButton chrome as a part, for split buttons whose trigger opens a \`DropdownMenu\`.`
  - [ ] 6. Verify: `npm run lint` → exit 0. Scratch-worktree build: `dist/index.d.ts` (or the SplitButton chunk's d.ts) exports `SplitButtonGroup`; a react-dom/server render of `h(ds.SplitButton, null, "Save")` is byte-identical to the HEAD build's (the composite's wrapper classes are unchanged); `git status --porcelain` → empty. Storybook `With Dropdown`: the wrapper's `boxShadow` now equals `Default`'s, the menu opens from the trigger and the trigger is named "More save options".
  - [ ] 7. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: `SplitButtonGroup` is a public export used by the composite and by the dropdown story; `rg -n 'className="inline-flex"' src/components/SplitButton` → no output.
- log:
  - 2026-10-01 — created by audit

### WI-C5-08: Expose RollHoverText's words through an `sr-only` copy instead of `aria-label` on a generic span
- status: todo
- addresses: [F-044]
- depends_on: []
- phase: P3
- risk: low — one `sr-only` span is added as the root's first child and the root's `aria-label` is removed. Visual layout is unchanged (`sr-only` is absolutely positioned and clipped, exactly as RollingDigitsText already uses it inside an inline root). Accessible names that came from the label (CTAButton's `<a>`, a Button containing RollHoverText) now come from the `sr-only` text, which name-from-content includes, so they are unchanged.
- semver: patch
- files:
  - modify: `src/components/AnimatedText/RollHoverText.tsx:48-62 @ b436647`
- anchor:
  ```tsx
        <span
          ref={ref}
          aria-label={children}
          data-active={active ? "true" : undefined}
          className={cn("ds-roll-hover", className)}
          …
          {...props}
        >
          {children.split(/(\s+)/).map((segment, segmentIndex) => {
  ```
- why: Every glyph is `aria-hidden` (each renders twice), so the words reach assistive technology only through a name on a role-less span — a name ARIA 1.2 prohibits for `generic` and that screen readers in reading mode drop; in body copy the phrase disappears from the sentence (F-044, V7 accessibility read). RollingDigitsText in the same folder already solves this with an `sr-only` copy.
- steps:
  - [ ] 1. Reproduce: Storybook `Text/AnimatedText/In body copy (wrapping + descenders)` — the Browser/DevTools accessibility tree shows the paragraph's text without "Deploy piggyback jerky", and the phrase only as the name of a separate `generic` node. SSR check in a scratch-worktree build (WI-C5-02 preamble): `renderToStaticMarkup(h(ds.RollHoverText, null, "Deploy now"))` starts with `<span aria-label="Deploy now" class="ds-roll-hover"`.
  - [ ] 2. RollHoverText.tsx — delete :51 `aria-label={children}`; directly after the root's opening tag (:61 `>`) insert:
    ```tsx
          {/* Every glyph below renders twice and is aria-hidden, so the readable
           * text is this copy — a name on the role-less root would be dropped by
           * screen readers in reading mode. Same pattern as RollingDigitsText. */}
          <span className="sr-only">{children}</span>
    ```
    The segment map, its `aria-hidden` spans and every `ds-roll-hover*` class are unchanged, so the `.ds-roll-hover*` rules in index.css (from :398) still select the same elements.
  - [ ] 3. Verify: `npm run lint` → exit 0. `rg -n "aria-label" src/components/AnimatedText/RollHoverText.tsx` → no output. SSR of the step-1 element now starts `<span class="ds-roll-hover" style="--ds-roll-dir:1"><span class="sr-only">Deploy now</span>`. Storybook: the step-1 story's accessibility tree now reads the full sentence including the phrase; the hover roll still runs (hover the phrase; the hidden Browser pane freezes motion, so check visibly or by reading `getComputedStyle(…ds-roll-hover-out).transform` while hovered); in `Buttons/CTAButton/*` each link is still named by its `text` in the accessibility tree. Build in a scratch worktree → `git status --porcelain` empty.
  - [ ] 4. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: RollHoverText carries no `aria-label`; its first child is an `sr-only` copy of the string; the body-copy story's paragraph is read in full.
- log:
  - 2026-10-01 — created by audit

### WI-C5-09: Compose OutlineButton's glow handlers with a consumer's `onMouseMove`/`onMouseLeave`
- status: todo
- addresses: [F-062]
- depends_on: []
- phase: P3
- risk: low — the consumer's handler still runs (first, as CopyButton runs its consumer `onClick` first) and the glow tracking now runs too; with no consumer handler nothing changes. The handlers gain the consumer callbacks as `useCallback` dependencies, so an inline consumer arrow re-creates them per render (harmless: they are plain props on the button).
- semver: patch
- files:
  - modify: `src/components/OutlineButton/OutlineButton.tsx:73-83,103-131 @ b436647`
  - modify: `src/components/OutlineButton/OutlineButton.stories.tsx:1-2` (imports) and append one story (file ends at :97)
  - modify: `CHANGELOG.md:20-22 @ b436647`
- anchor:
  ```tsx
  // OutlineButton.tsx:79-83
        glowColor2,
        children,
        ...props
      },
      ref,
  // :103-105
      const handleMouseMove = useCallback(
        (event: React.MouseEvent<HTMLElement>) => {
          if (glowing) return; // controlled mode — no cursor tracking needed
  // :121-125
        [glowing],
      );

      const handleMouseLeave = useCallback(() => {
        if (glowing) return;
  // :130-131
        el.style.setProperty("--gy", "0.5");
      }, [glowing]);
  // :169-171
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            {...props}
  ```
- why: `onMouseMove`/`onMouseLeave` are not destructured, so a consumer's handler arrives in `...props` after the internal ones and replaces them: the orbs never track (they sit at the CSS centre fallback) and the leave-reset stops (F-062, V7 browser run: `consumerMoveCalls: 1, OB_gx: "(unset)"`).
- steps:
  - [ ] 1. Reproduce: append to OutlineButton.stories.tsx (add `import { useState } from "react";` and `import { LabelText } from "../Text";` at the top):
    ```tsx
    /** A consumer's mouse handlers run AND the glow keeps tracking the cursor. */
    export const ConsumerMouseHandlers: Story = {
      render: function Render() {
        const [moves, setMoves] = useState(0);
        return (
          <div className="flex flex-col items-center gap-sm">
            <OutlineButton onMouseMove={() => setMoves((n) => n + 1)}>Track me</OutlineButton>
            <LabelText>{`onMouseMove calls: ${moves}`}</LabelText>
          </div>
        );
      },
    };
    ```
    In Storybook `Buttons/OutlineButton/Consumer Mouse Handlers`, move the pointer over the button: the counter rises but the orbs stay centred, and `document.querySelector("button").style.getPropertyValue("--gx")` → `""` (never written).
  - [ ] 2. OutlineButton.tsx — destructure the two handlers (:79-81):
    ```tsx
          glowColor2,
          children,
          onMouseMove,
          onMouseLeave,
          ...props
    ```
    and compose them (:103-131):
    ```tsx
        const handleMouseMove = useCallback(
          (event: React.MouseEvent<HTMLButtonElement>) => {
            onMouseMove?.(event);
            if (glowing) return; // controlled mode — no cursor tracking needed
            … (lines 106-119 unchanged)
          },
          [glowing, onMouseMove],
        );

        const handleMouseLeave = useCallback(
          (event: React.MouseEvent<HTMLButtonElement>) => {
            onMouseLeave?.(event);
            if (glowing) return;
            … (lines 126-130 unchanged)
          },
          [glowing, onMouseLeave],
        );
    ```
    :169-171 stay as they are (the internal handlers are attached before `{...props}`, which no longer carries the two mouse props). The event type is `HTMLButtonElement` so it also type-checks after WI-C5-04 types the render props from `"button"` (the audit type-checked both orders: `docs/audit/_work/scratch/C5/tsc/patch-handlers.cjs`, 0 errors).
  - [ ] 3. CHANGELOG.md `[Unreleased]` `### Fixed` (create it if absent): `- \`OutlineButton\` runs a consumer's \`onMouseMove\`/\`onMouseLeave\` alongside its glow tracking instead of losing the tracking.`
  - [ ] 4. Verify: `npm run lint` → exit 0. Storybook story from step 1: the counter rises AND the orbs follow the pointer; `--gx`/`--gy` on the button change with the pointer; leaving the button resets them to `0.5`. (If the Browser pane is hidden, motion is frozen — check the custom properties rather than the animation.) `Default` and `Glowing` stories behave as before. Build in a scratch worktree → `git status --porcelain` empty.
  - [ ] 5. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: with a consumer `onMouseMove`, both the consumer callback and the `--gx`/`--gy` writes happen; `rg -n "onMouseMove,|onMouseLeave," src/components/OutlineButton/OutlineButton.tsx` → 2 lines (the destructure).
- log:
  - 2026-10-01 — created by audit

### WI-C5-10: Document which element `className` styles in the eight chrome + core components that split it from `ref`/`style`/rest props
- status: todo
- addresses: [F-062]
- depends_on: [WI-C5-09]
- phase: P1
- risk: low — comments, JSDoc and one skill paragraph; no code change. The JSDoc lines ship in the d.ts, so consumers see them in IntelliSense. If decision D-17 later picks one routing convention that moves `style` or `className`, that change rewrites these lines with the code (R10.4).
- semver: none
- files:
  - modify: `src/components/OutlineButton/OutlineButton.tsx:58 @ b436647` (JSDoc; after WI-C5-09)
  - modify: `src/components/SearchBox/SearchBox.tsx:17 @ b436647` (JSDoc)
  - modify: `src/components/Menu/DropdownMenuSearch.tsx:7-8 @ b436647` (header ## behavior)
  - modify: `src/components/VerificationCode/CodeDigitInput.tsx:8-9 @ b436647` (header ## behavior)
  - modify: `src/components/SegmentedTabSelect/SegmentedTabSelect.tsx:48 @ b436647` (JSDoc)
  - modify: `src/components/Slider/Slider.tsx:421,427,441 @ b436647` (JSDoc)
  - modify: `.agents/skills/dooph-ds-codebase/SKILL.md:117-118 @ b436647`
- anchor:
  ```tsx
  Input.tsx:8-9             `className` always lands on the chrome element; every other prop, and `ref`, always land on the `<input>`.   ← the model, already documented
  OutlineButton.tsx:56-58    * In controlled mode (`glowing`) the orbs sit at the bottom of the frame and
                             * stay visible without any hover condition — useful for a persistent "lit" state
                             * driven by application logic.
  SearchBox.tsx:16-17        * Larger corner radius (rounded-soft) and leading search icon distinguish it from Input.
                             * Accepts an optional keyboard shortcut indicator on the trailing edge.
  DropdownMenuSearch.tsx:7-8  * - Forwards ref to the input. Stops keydown propagation so Radix typeahead
                              *   does not steal keystrokes while typing.
  CodeDigitInput.tsx:8-9     * - `hasError` paints error-primary border + text; `disabled` uses secondary
                             *   disabled tokens + `ds-disabled-state`; focus uses brand focus ring.
  SegmentedTabSelect.tsx:48  const SegmentedTabSelect = forwardRef<
  Slider.tsx:421             const SliderContinuous = forwardRef<
  Slider.tsx:427             const SliderStepped = forwardRef<
  Slider.tsx:441             const SliderLabeled = forwardRef<
  ```
- why: In these eight components `className="w-60"` and `style={{ width: 240 }}` size different boxes, and only Input says which (F-062). Writing each split down — Input-style, where consumers and agents read — turns an apparently accidental split into a stated one and gives D-17 the inventory it needs.
- steps:
  - [ ] 1. OutlineButton.tsx JSDoc — after :58 add ` *` and ` * \`className\` styles the outer pill frame \`<div>\`; \`ref\`, \`style\`, handlers and every other prop go to the inner button (the slotted element under \`asChild\`).`
  - [ ] 2. SearchBox.tsx JSDoc — after :17 add ` * \`className\` styles the bordered field \`<div>\`; \`ref\`, \`style\` and every other prop go to the \`<input>\`.`
  - [ ] 3. DropdownMenuSearch.tsx header — after :8 add ` * - \`className\` styles the row \`<div>\`; \`ref\`, \`style\` and every other prop land on the \`<input>\`.` (a behavior bullet; the constraints at :10-13 are unchanged)
  - [ ] 4. CodeDigitInput.tsx header — after :9 add ` * - \`className\` styles the cell \`<div>\` (the chrome); \`ref\`, \`style\` and every other prop land on the \`<input>\`.`
  - [ ] 5. SegmentedTabSelect.tsx — above :48 add `/** Props, \`ref\` and \`style\` go to the Radix Tabs Root; \`className\` styles the visible shell, the inner TabsList. */`
  - [ ] 6. Slider.tsx — above :421 and :427 add `/** \`className\` styles the outer box, which owns the width (and, when stepped, the end-dot inset); \`ref\`, \`style\` and every other prop go to the Radix Root inside it. */`; above :441 add `/** \`className\` styles the outer column (track + labels); \`ref\`, \`style\` and every other prop go to the slider's Radix Root. */`
  - [ ] 7. codebase SKILL.md — after the `## Component Inventory` heading (:117) insert:
    ```md
    **`className` target.** Most components put `className`, `ref`, `style` and rest props on one element. Nine "chrome + core" components split them, each stating its split in its JSDoc or header: `Input`, `SearchBox`, `DropdownMenuSearch`, `CodeDigitInput` (className → the chrome `<div>`; the rest → the `<input>`); `SliderContinuous` / `SliderStepped` / `SliderLabeled` (className → the outer box; the rest → the Radix Root); `SegmentedTabSelect` (className → the inner `TabsList` shell; the rest → the Tabs Root); `OutlineButton` (className → the outer frame; the rest → the inner button). Whether this becomes a rule is decision D-17.
    ```
  - [ ] 8. Verify: `npm run lint` → exit 0. `rg -n "className\` styles|className\` always lands" src/components` → 9 lines (Input + the 8 added; Slider has 3). Build in a scratch worktree → `git status --porcelain` empty, and `dist/components/Slider/Slider.d.ts` carries the new JSDoc above `SliderContinuous`. No story changes.
  - [ ] 9. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: each of the eight undocumented components states its `className` target where IntelliSense or the header shows it, and the codebase skill lists all nine.
- log:
  - 2026-10-01 — created by audit

### WI-C5-11: Give the complex menu width one sanctioned spelling — the token through `DropdownMenuSection width` — in both skills and the stories
- status: todo
- addresses: [F-069]
- depends_on: []
- phase: P1
- risk: low — docs and stories only. The Complex stories keep a fixed 324px section at default tokens (`width="var(--ui-min-w-menu-complex)"` resolves to 324px), so long items wrap exactly as now; the only rendered change is the `SectionWidthOverride` story, which moves to a bespoke 280px.
- semver: none
- files:
  - modify: `.agents/skills/dooph-ds-architecture/SKILL.md:159 @ b436647`
  - modify: `.agents/skills/dooph-ds-codebase/SKILL.md:457,535 @ b436647`
  - modify: `src/components/Menu/DropdownMenu.stories.tsx:221,224,407,436 @ b436647`
- anchor:
  ```md
  arch SKILL.md:159      … `DropdownMenuSection width` is the explicit override for a wider ("complex") menu. …
  codebase SKILL.md:535  - `ds-min-w-menu-complex` — `min-width: var(--ui-min-w-menu-complex)` (324px); apply directly to a wide `DropdownMenuSection`
  stories:221            <Button variant={ButtonVariant.secondary}>Width 324</Button>
  stories:224            <DropdownMenuSection width={324} data-testid="wide-section">
  stories:407            <DropdownMenuSection width={324}>
  stories:436            <DropdownMenuSection width={324}>
  ```
- why: One skill says "class", the other says "`width` prop", and every story hardcodes 324 beside the token the search row reads, so a token retune desyncs `ComplexWithSearch` (F-069, V8). Passing the token through the existing `width` prop keeps one mechanism for section width, keeps the fixed-width wrapping the stories rely on, and ties the section to the same token as `DropdownMenuSearch`. `ds-min-w-menu-complex` is a min-width, so advertising it for sections would let long items widen the menu.
- steps:
  - [ ] 1. Reproduce: Storybook `Menus/DropdownMenu/Complex With Search` (open the menu) — run `document.documentElement.style.setProperty("--ui-min-w-menu-complex", "360px")`; the search row grows to 360px and the results section stays 324px. Remove the property again.
  - [ ] 2. Stories: :436 and :407 `<DropdownMenuSection width={324}>` → `<DropdownMenuSection width="var(--ui-min-w-menu-complex)">`; :224 `width={324}` → `width={280}` and :221 `Width 324` → `Width 280` (this story demonstrates a bespoke width, so it must not use the token's value).
  - [ ] 3. arch SKILL.md:159 — replace the sentence `` `DropdownMenuSection width` is the explicit override for a wider ("complex") menu. `` with `` `DropdownMenuSection width` is the one override for a wider menu: for the complex width pass the token, `width="var(--ui-min-w-menu-complex)"` (a fixed width, so long items wrap); a number is for bespoke widths. `ds-min-w-menu-complex` is `DropdownMenuSearch`'s floor, not a section helper — as a min-width it would let long items widen the menu. ``
  - [ ] 4. codebase SKILL.md:535 → `` - `ds-min-w-menu-complex` — `min-width: var(--ui-min-w-menu-complex)` (324px); `DropdownMenuSearch`'s floor. A wide `DropdownMenuSection` takes the token through its `width` prop instead (`width="var(--ui-min-w-menu-complex)"`) ``; in :457 replace `is a standalone width for a wide \`DropdownMenuSection\` / \`DropdownMenuSearch\`` with `is the complex menu width: \`DropdownMenuSearch\`'s floor, and passed as \`width\` to a wide \`DropdownMenuSection\``.
  - [ ] 5. Verify: `rg -n "width=\{324\}" src` → no output; `rg -n "apply directly to a wide" .agents/skills` → no output. Storybook `Complex With Search` and `Complex Without Search`: `getComputedStyle(<section>).width` → `324px`; repeat the step-1 property change → the search row and the section are both 360px. `Section Width Override` → `[data-testid=wide-section]` width `280px`. `npm run lint` → exit 0.
  - [ ] 6. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: both skills give the same single answer for the complex width; no story hardcodes 324; retuning `--ui-min-w-menu-complex` moves the search row and the section together.
- log:
  - 2026-10-01 — created by audit

### WI-C5-12: Move the RollChangeText/FadeChangeText render shell into one internal component
- status: todo
- addresses: [F-079]
- depends_on: []
- phase: P2
- risk: low — internal restructuring with identical output: the shell is moved verbatim, each wrapper passes only its class pair, and public names, props types and the rendered DOM do not change (step 5 diffs the SSR markup). Both wrappers keep their `"use client"` directive (whether pure render wrappers need it is D-05's question, not this item's).
- semver: none
- files:
  - create: `src/components/AnimatedText/ChangeSwapShell.tsx`
  - modify: `src/components/AnimatedText/RollChangeText.tsx:12-18,25-33,46-97 @ b436647`
  - modify: `src/components/AnimatedText/FadeChangeText.tsx:13-14,29-37,50-99 @ b436647`
  - modify: `src/components/AnimatedText/useChangeSwap.ts:11-14 @ b436647`
  - modify: `.agents/skills/dooph-ds-codebase/SKILL.md:44-46,332-334 @ b436647`
- anchor:
  ```tsx
  // RollChangeText.tsx:58-94 (FadeChangeText.tsx:62-96 is the same apart from the two class names)
      const { exiting, entering } = useChangeSwap(changeKey, children);

      return (
        <span
          ref={ref}
          className={cn("inline-grid overflow-hidden", className)}
          style={
            {
              "--ds-roll-dir": direction === RollDirection.up ? -1 : 1,
              ...style,
            } as CSSProperties
          }
          {...props}
        >
          {exiting != null && (
            <span
              key={exiting.key}
              aria-hidden
              className="[grid-area:1/1] ds-roll-change-out"
              onAnimationEnd={exiting.onAnimationEnd}
            >
              {exiting.node}
            </span>
          )}
          <span
            key={entering.key}
            className={cn(
              "[grid-area:1/1]",
              entering.animating && "ds-roll-change-in",
            )}
  ```
- why: The engine is shared (`useChangeSwap`) precisely because "two copies drift", but the shell around it is still copied line for line and has already drifted (the will-change comment exists only in RollChangeText) (F-079). One shell makes "this file owns only the look" true for both wrappers. It removes two real duplicates, so a new internal module is justified.
- steps:
  - [ ] 1. Baseline: in a scratch-worktree build of HEAD, SSR (WI-C5-02 preamble) `h(ds.RollChangeText, { changeKey: 1, direction: "up", className: "x", style: { color: "red" } }, "A")` and the same for `ds.FadeChangeText`, saving both lines to `.tmp-probe/change-before.txt`.
  - [ ] 2. Create `src/components/AnimatedText/ChangeSwapShell.tsx` (not re-exported from `AnimatedText/index.ts`):
    ```tsx
    /*
     * ChangeSwapShell — the internal render shell behind RollChangeText and
     * FadeChangeText: one grid cell holding the keyed, aria-hidden exiting copy
     * and the entering copy, wired to `useChangeSwap`. Each wrapper passes only
     * its out/in classes. Keep both `key`s and both `onAnimationEnd`s exactly as
     * wired — they are how useChangeSwap retires each half (see its constraints).
     */
    "use client";
    import {
      forwardRef,
      type CSSProperties,
      type HTMLAttributes,
      type ReactNode,
    } from "react";
    import { cn } from "../../utils/cn";
    import { RollDirection } from "./constants";
    import { useChangeSwap } from "./useChangeSwap";

    export interface ChangeSwapShellProps extends HTMLAttributes<HTMLSpanElement> {
      changeKey?: string | number;
      direction?: RollDirection;
      children: ReactNode;
      /** The wrapper's exit animation class (on the outgoing copy). */
      outClassName: string;
      /** The wrapper's entry animation class (on the incoming copy while it animates). */
      inClassName: string;
    }

    export const ChangeSwapShell = forwardRef<HTMLSpanElement, ChangeSwapShellProps>(
      (
        {
          changeKey,
          children,
          className,
          direction = RollDirection.down,
          style,
          outClassName,
          inClassName,
          ...props
        },
        ref,
      ) => {
        const { exiting, entering } = useChangeSwap(changeKey, children);

        return (
          <span
            ref={ref}
            className={cn("inline-grid overflow-hidden", className)}
            style={
              {
                "--ds-roll-dir": direction === RollDirection.up ? -1 : 1,
                ...style,
              } as CSSProperties
            }
            {...props}
          >
            {exiting != null && (
              <span
                key={exiting.key}
                aria-hidden
                className={cn("[grid-area:1/1]", outClassName)}
                onAnimationEnd={exiting.onAnimationEnd}
              >
                {exiting.node}
              </span>
            )}
            <span
              key={entering.key}
              className={cn("[grid-area:1/1]", entering.animating && inClassName)}
              /* Drops the in-class once the animation lands, so `will-change`
               * does not strand a compositor layer on every settled node. */
              onAnimationEnd={entering.onAnimationEnd}
            >
              {children}
            </span>
          </span>
        );
      },
    );
    ChangeSwapShell.displayName = "ChangeSwapShell";
    ```
  - [ ] 3. RollChangeText.tsx — replace :46-97 with
    ```tsx
    const RollChangeText = forwardRef<HTMLSpanElement, RollChangeTextProps>(
      (props, ref) => (
        <ChangeSwapShell
          ref={ref}
          outClassName="ds-roll-change-out"
          inClassName="ds-roll-change-in"
          {...props}
        />
      ),
    );
    ```
    and the imports (:25-33) with `import { forwardRef, type HTMLAttributes, type ReactNode } from "react";`, `import { ChangeSwapShell } from "./ChangeSwapShell";`, `import { RollDirection } from "./constants";` (still used by the props interface). FadeChangeText.tsx — the same at :50-99 with `ds-fade-change-out` / `ds-fade-change-in`, and its imports (:29-37) likewise. Keep both `"use client"` lines, both props interfaces and both `displayName`s.
  - [ ] 4. Headers, same change (R10.4). RollChangeText.tsx constraints (:15-18): after "…and two copies drift." add `The render shell (grid cell, keyed exit, entry span) lives in \`ChangeSwapShell\` for the same reason.` FadeChangeText.tsx (:13-14): after "Do not re-inline it here;" add `the render shell lives in \`ChangeSwapShell\`;`. useChangeSwap.ts behavior (:13-14) `The wrapper renders both in one grid cell and spreads these onto its two spans.` → `\`ChangeSwapShell\` renders both in one grid cell and spreads these onto its two spans; the wrappers pass only their class pair.` No constraint is removed or narrowed. codebase SKILL.md:44-46 → name `ChangeSwapShell.tsx` beside `useChangeSwap.ts` as the shared internal shell; :332-334 → add "and `ChangeSwapShell.tsx` (the shared render shell) are NOT re-exported — each wrapper owns only its class pair and keyframes".
  - [ ] 5. Verify: `npm run lint` → exit 0. Rebuild the scratch worktree; rerun step 1 into `.tmp-probe/change-after.txt`; `diff .tmp-probe/change-before.txt .tmp-probe/change-after.txt` → no output. `rg -n "inline-grid overflow-hidden" src/components/AnimatedText` → 1 line (ChangeSwapShell.tsx). `rg -n "ChangeSwapShell" src/components/AnimatedText/index.ts src/index.ts` → no output. `git status --porcelain` in the worktree → empty. Storybook `Text/AnimatedText` roll-change and fade-change stories: the swaps still animate in both directions (visible pane; the hidden pane freezes motion). Delete `.tmp-probe/`.
  - [ ] 6. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: both wrappers are a single `ChangeSwapShell` render with their class pair; the SSR diff is empty; the shell exists once.
- log:
  - 2026-10-01 — created by audit

### WI-C5-13: Draw SearchBox's glyph with `SearchIcon`, align its twin's defaults, and cross-reference the two search rows
- status: todo
- addresses: [F-082]
- depends_on: []
- phase: P3
- risk: low (visual) — SearchBox's hand-drawn 16-unit glyph (`r=4.25`, 1.5 stroke) becomes the DS `SearchIcon` at `IconSize.md` (16px, `--ui-icon-stroke-width` 2), the same glyph DropdownMenuSearch already shows; the box size is unchanged. The `showShortcut` edit is behaviour-neutral (both defaults already evaluate to "show when there are keys").
- semver: patch
- files:
  - modify: `src/components/SearchBox/SearchBox.tsx:3-5,14-17,38-62 @ b436647`
  - modify: `src/components/Menu/DropdownMenuSearch.tsx:4-6,39 @ b436647`
  - modify: `CHANGELOG.md:20-22 @ b436647`
- anchor:
  ```tsx
  // SearchBox.tsx:38-47
          {/* Search icon */}
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden
            focusable="false"
            className="shrink-0 text-text-tertiary"
          >
  // DropdownMenuSearch.tsx:38-39, 59-63
        shortcut = ["Esc"],
        showShortcut = true,
        <SearchIcon
          size={IconSize.md}
          className="shrink-0 text-text-tertiary"
          aria-hidden
        />
  ```
- why: SearchBox and DropdownMenuSearch are one "icon + transparent input + optional HotkeyIndicator" row maintained twice, and SearchBox hand-draws a glyph that a change to the DS search icon would miss (F-082). Using the shared icon removes the visible divergence; writing the twins' defaults the same way and naming each twin in the other's docs makes the next fix (F-026 disabled, F-094 keyboard, F-088 hotkey look) reach both. A shared internal row component is not proposed: two copies with different chrome do not yet justify one.
- steps:
  - [ ] 1. Reproduce: Storybook `Inputs/SearchBox/Default` vs `Menus/DropdownMenu/Complex With Search` — zoom on the two glyphs: different circle radius and stroke weight; `document.querySelector("svg circle").getAttribute("r")` in the SearchBox story → `4.25`.
  - [ ] 2. SearchBox.tsx — add `import { IconSize, SearchIcon } from '../Icons';` after :5; replace :38-62 (the comment and the whole `<svg>…</svg>`) with
    ```tsx
            {/* Search icon — the DS glyph, the same one DropdownMenuSearch draws */}
            <SearchIcon size={IconSize.md} className="shrink-0 text-text-tertiary" />
    ```
    (`BaseIcon` defaults `aria-hidden` to true.) In the JSDoc after :17 add ` * Twin of \`DropdownMenuSearch\` (same icon + input + hotkey row, no menu): apply row fixes to both.`
  - [ ] 3. DropdownMenuSearch.tsx — :39 `showShortcut = true,` → `showShortcut = !!shortcut,` (same expression as SearchBox; `shortcut` defaults to `["Esc"]`, so the result is unchanged); header :5-6 → ` * - Renders icon + native input + optional Esc hotkey; no bordered chrome` / ` *   (unlike its twin SearchBox — apply row fixes to both). Compose above a separator inside DropdownMenuContent.` (behavior bullet only; constraints :10-13 unchanged).
  - [ ] 4. CHANGELOG.md `[Unreleased]` `### Changed`: `- \`SearchBox\` draws the DS \`SearchIcon\` (16px) in place of its own glyph.`
  - [ ] 5. Verify: `npm run lint` → exit 0. `rg -n "<svg|r=\"4.25\"" src/components/SearchBox/SearchBox.tsx` → no output. Storybook: both glyphs now match; `Inputs/SearchBox/*` keep their size (`getBoundingClientRect().height` of the field unchanged from step 1); `WithShortcut` still shows the hotkey and `Default` does not; `Complex With Search` still shows `Esc`. Build in a scratch worktree → `git status --porcelain` empty.
  - [ ] 6. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: SearchBox renders `SearchIcon`; both components spell `showShortcut = !!shortcut`; each names the other as its twin.
- log:
  - 2026-10-01 — created by audit

### WI-C5-14: Give HotkeyIndicator a `menu` variant and drop DropdownMenuSearch's descendant overrides
- status: todo
- addresses: [F-088]
- depends_on: [WI-C5-13]
- phase: P3
- risk: low — the in-menu chip must compute to the same styles as today (step 5 compares them); the default variant is unchanged. New public const + prop (additive).
- semver: minor
- files:
  - create: `src/components/HotkeyIndicator/constants.ts`
  - modify: `src/components/HotkeyIndicator/HotkeyIndicator.tsx:1-26 @ b436647`
  - modify: `src/components/HotkeyIndicator/index.ts:1-2 @ b436647`
  - modify: `src/components/HotkeyIndicator/HotkeyIndicator.stories.tsx:2,19 @ b436647`
  - modify: `src/components/Menu/DropdownMenuSearch.tsx:23,75-78 @ b436647`
  - modify: `skills/dooph-design-system-usage/SKILL.md:154 @ b436647`
  - modify: `.agents/skills/dooph-ds-codebase/SKILL.md:441 @ b436647`
  - modify: `CHANGELOG.md:12-18 @ b436647`
- anchor:
  ```tsx
  // DropdownMenuSearch.tsx:75-78
          <HotkeyIndicator
            keys={shortcut}
            className="shrink-0 [&_kbd]:h-6 [&_kbd]:min-h-6 [&_kbd]:bg-secondary-hover [&_kbd]:border-secondary-border-hover [&_kbd]:text-text-tertiary"
          />
  // HotkeyIndicator.tsx:15-25
            className={cn(
              'inline-flex items-center justify-center',
              'rounded-tight border border-border-primary',
              'text-style-label text-ghost-fg',
              'transition-colors duration-100',
              'ds-px-ui-xs ds-py-ui-xxs',
              keys.length === 1 && 'min-w-[23px] min-h-[23px]',
              pressed
                ? 'bg-ghost-active border-border-primary'
                : 'bg-surface-page border-border-primary'
            )}
  ```
- why: The in-menu chip is a second look of HotkeyIndicator that exists only as five `[&_kbd]:` selectors in a sibling, keyed on HotkeyIndicator's internal tag — the only descendant-variant site in src — so any change to HotkeyIndicator's element or classes silently reverts it, and nobody else can reuse it (F-088). R1.1 makes a discrete look a dot-accessible variant.
- steps:
  - [ ] 1. Baseline: Storybook `Menus/DropdownMenu/Complex With Search`, open the menu, select the `Esc` `<kbd>`, record `getComputedStyle(kbd)` `height`, `minHeight`, `backgroundColor`, `borderTopColor`, `color` (expected 24px / 24px / the `--ui-color-secondary-hover` value / the `--ui-color-secondary-border-hover` value / the `--ui-color-text-tertiary` value).
  - [ ] 2. Create `src/components/HotkeyIndicator/constants.ts`:
    ```ts
    // Server-safe constants — no client APIs, intentionally NO "use client" directive
    // so this dot-accessible enum can be read from React Server Components.

    /**
     * Dot-accessible HotkeyIndicator variant constant.
     * `default` sits on the page surface; `menu` is the chip on a menu row
     * (DropdownMenuSearch).
     * Usage: <HotkeyIndicator keys={["Esc"]} variant={HotkeyIndicatorVariant.menu} />
     */
    export const HotkeyIndicatorVariant = {
      default: "default",
      menu: "menu",
    } as const;
    export type HotkeyIndicatorVariant =
      (typeof HotkeyIndicatorVariant)[keyof typeof HotkeyIndicatorVariant];
    ```
  - [ ] 3. HotkeyIndicator.tsx — import `{ HotkeyIndicatorVariant } from './constants'`; add to the props `/** \`menu\` is the chip on a menu row; \`pressed\` applies to both. */ variant?: HotkeyIndicatorVariant;`; destructure `variant = HotkeyIndicatorVariant.default`; replace :15-25 with
    ```tsx
            className={cn(
              'inline-flex items-center justify-center',
              'rounded-tight border',
              'text-style-label',
              'transition-colors duration-100',
              'ds-px-ui-xs ds-py-ui-xxs',
              keys.length === 1 && 'min-w-[23px] min-h-[23px]',
              variant === HotkeyIndicatorVariant.menu
                ? 'h-6 min-h-6 text-text-tertiary'
                : 'text-ghost-fg',
              pressed
                ? 'bg-ghost-active border-border-primary'
                : variant === HotkeyIndicatorVariant.menu
                  ? 'bg-secondary-hover border-secondary-border-hover'
                  : 'bg-surface-page border-border-primary'
            )}
    ```
    (`cn`'s tailwind-merge keeps the later `min-h-6` over `min-h-[23px]`, matching today's override; the numeric `h-6`/`min-h-6` move unchanged — tokenising them is F-017's.) index.ts: add `export { HotkeyIndicatorVariant } from './constants';` (src/index.ts:8 re-exports the folder with `export *`).
  - [ ] 4. DropdownMenuSearch.tsx — after :23 add `import { HotkeyIndicatorVariant } from "../HotkeyIndicator/constants";`; :75-78 →
    ```tsx
          <HotkeyIndicator
            keys={shortcut}
            variant={HotkeyIndicatorVariant.menu}
            className="shrink-0"
          />
    ```
    Story: HotkeyIndicator.stories.tsx — import the const (:2) and after :19 add `export const Menu: Story = { args: { keys: ['Esc'], variant: HotkeyIndicatorVariant.menu } };` (R9.23). Docs: usage SKILL.md:154 `\`HotkeyIndicator\`` → `\`HotkeyIndicator\` (\`HotkeyIndicatorVariant\`: \`default\` | \`menu\`)`; codebase SKILL.md:441 row → append `; \`variant\` (\`HotkeyIndicatorVariant.default\`\|\`.menu\`, the menu-row chip)`; CHANGELOG `### Added`: `- \`HotkeyIndicatorVariant\` / \`HotkeyIndicator\` \`variant\` — \`menu\` is the chip used on menu rows.`
  - [ ] 5. Verify: `npm run lint` → exit 0. `rg -n "\[&_" src --glob '!*.stories.tsx'` → no output. Repeat step 1 → identical five values. `Bits & Pieces/HotkeyIndicator/Menu` shows the menu chip; `Single`/`Pressed` unchanged. Build in a scratch worktree → `git status --porcelain` empty; `dist/index.d.ts` exports `HotkeyIndicatorVariant`, and the chunk holding it starts with no `"use client"`.
  - [ ] 6. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: DropdownMenuSearch uses `variant={HotkeyIndicatorVariant.menu}` and no descendant selector; the in-menu chip computes to the step-1 values.
- log:
  - 2026-10-01 — created by audit

### WI-C5-15: Make CTAButton's `children` type-check only together with `asChild`
- status: todo
- addresses: [F-093]
- depends_on: []
- phase: P3
- risk: low — type-only (no emitted-JS change). Call sites that pass children in anchor mode — which render nothing today — stop compiling; every working form keeps compiling, including a runtime-boolean `asChild` with an element child, refs, Storybook's `Meta<typeof CTAButton>` args, and a consumer `interface X extends CTAButtonProps` (the audit type-checked all of these, plus the unmodified CTAButton.stories.tsx, against the patched copy: `docs/audit/_work/scratch/C5/tsc/cta.diff`, 0 errors). The ref type stays `HTMLAnchorElement` (changing it is F-089's).
- semver: minor
- files:
  - modify: `src/components/CTAButton/CTAButton.tsx:6-8,43-45,51,134-136 @ b436647`
  - modify: `CHANGELOG.md:20-22 @ b436647`
- anchor:
  ```tsx
  // CTAButton.tsx:43-45
    asChild?: boolean;
    children?: ReactNode;
  }
  // :51
  const CTAButton = forwardRef<HTMLAnchorElement, CTAButtonProps>(
  // :134-136
  CTAButton.displayName = "CTAButton";

  export { CTAButton };
  ```
- why: `children` is typed in every mode but read only under `asChild`, so `<CTAButton text icon>Limited offer</CTAButton>` type-checks and silently renders without the label (F-093), while the same file throws for a bad `asChild` child. Overloaded call signatures — the cast-to-public-signature pattern Button already uses — move the contract into the type without turning `CTAButtonProps` into a union (which would break consumer `extends`).
- steps:
  - [ ] 1. Reproduce: `.tmp-probe/cta.probe.tsx` (tsconfig as in WI-C5-01) with `import { CTAButton } from "../src/components/CTAButton";`, `const icon = <span />;`, the line `// @ts-expect-error children without asChild are discarded` above `export const bad = <CTAButton text="Buy" icon={icon}>Limited offer</CTAButton>;`, and the must-compile lines `<CTAButton text="Buy" icon={icon} href="/buy" />`, `<CTAButton asChild text="Buy" icon={icon}><a href="/buy" /></CTAButton>`, and (with `declare const isLink: boolean;`) `<CTAButton asChild={isLink} text="Buy" icon={icon}><a href="/buy" /></CTAButton>` → today: one TS2578 "Unused '@ts-expect-error'".
  - [ ] 2. CTAButton.tsx — add `type RefAttributes,` to the react import (:6-8); give `children` (:44) a JSDoc:
    ```tsx
      /**
       * Read only with `asChild`: the single element CTAButton slots onto (its own
       * children are replaced by the CTA content). Without `asChild` there is no
       * place to render children — pass the label as `text`.
       */
      children?: ReactNode;
    ```
    and insert after the interface (after :45):
    ```tsx
    /* Public call signatures: `children` type-checks only together with
     * `asChild`, so a label passed as children in anchor mode (which renders
     * nothing) is a compile error rather than silently dropped. */
    type CTAButtonComponent = {
      (
        props: Omit<CTAButtonProps, "asChild" | "children"> & {
          asChild: true;
          children: ReactElement;
        } & RefAttributes<HTMLAnchorElement>,
      ): ReactElement | null;
      /* A runtime boolean (`asChild={isLink}`) needs an element child to slot onto. */
      (
        props: Omit<CTAButtonProps, "asChild" | "children"> & {
          asChild: boolean;
          children: ReactElement;
        } & RefAttributes<HTMLAnchorElement>,
      ): ReactElement | null;
      /* Anchor mode — listed LAST because ComponentProps (and so Storybook's
       * Meta<typeof CTAButton>) reads the last call signature. */
      (
        props: Omit<CTAButtonProps, "asChild" | "children"> & {
          asChild?: false;
          children?: never;
        } & RefAttributes<HTMLAnchorElement>,
      ): ReactElement | null;
      displayName?: string;
    };
    ```
    Rename the forwardRef const (:51) to `CTAButtonBase`, its displayName line (:134) to `CTAButtonBase.displayName = "CTAButton";`, and add `const CTAButton = CTAButtonBase as CTAButtonComponent;` before `export { CTAButton };`. The render body is unchanged.
  - [ ] 3. CHANGELOG.md `[Unreleased]` `### Changed`: `- \`CTAButton\` \`children\` now type-checks only with \`asChild\` (it was silently ignored otherwise); pass the label as \`text\`.`
  - [ ] 4. Verify: rerun step 1 → exit 0. `npm run lint` → exit 0 (this also type-checks CTAButton.stories.tsx, including `AsChildButton`'s `<CTAButton asChild {...args}>`). Storybook `Buttons/CTAButton/*` render as before; the props table still lists `text`, `icon`, `size`, `variant`, `asChild`. Build in a scratch worktree → `git status --porcelain` empty and `dist/components/CTAButton/CTAButton.d.ts` declares the three call signatures. Delete `.tmp-probe/`.
  - [ ] 5. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: anchor-mode `children` is a compile error; every form in step 1 and the existing stories compile; `npm run lint` exits 0.
- log:
  - 2026-10-01 — created by audit

### WI-C5-16: Document that DropdownMenuSearch is not keyboard-reachable inside the menu, as DropdownMenuPlainItem documents its own limit
- status: todo
- addresses: [F-094]
- depends_on: [WI-C5-10, WI-C5-13]
- phase: P1
- risk: low — comments, JSDoc and a story doc comment; no behaviour change. The JSDoc ships in the d.ts, so consumers see the limit in IntelliSense. A real keyboard path (focus hand-off between the input and Radix's roving items, or a combobox) is a design change that R2.10/R2.11 constrain and is out of scope here.
- semver: none
- files:
  - modify: `src/components/Menu/DropdownMenuSearch.tsx:4-9,34 @ b436647` (header `## behavior` list; JSDoc above the component)
  - modify: `src/components/Menu/DropdownMenu.stories.tsx:427 @ b436647`
- anchor:
  ```tsx
  // DropdownMenuSearch.tsx:4-9
   * ## behavior
   * - Renders icon + native input + optional Esc hotkey; no bordered chrome
   *   (unlike SearchBox). Compose above a separator inside DropdownMenuContent.
   * - Forwards ref to the input. Stops keydown propagation so Radix typeahead
   *   does not steal keystrokes while typing.
   *
  // DropdownMenuSearch.tsx:34
  const DropdownMenuSearch = forwardRef<HTMLInputElement, DropdownMenuSearchProps>(
  // DropdownMenu.tsx:226-231 (the precedent)
   * but interactive children (e.g. a ToggleSwitch) are pointer-only inside a
   * Radix menu: Radix's roving focus skips this plain div, Tab is prevented by
   * the menu content, arrow keys are only handled when the content itself is
   * the target, and letter keys start typeahead instead of reaching the child.
   * Consumers must provide a keyboard-reachable equivalent (e.g. radio-select
   * items, or a control outside the menu).
  ```
- why: Inside `DropdownMenuContent` Radix prevents Tab and moves focus only among its own items, and the search input stops keydown propagation, so a keyboard user can neither reach the field nor arrow from it into the results (F-094). DropdownMenuPlainItem documents the same class of limit; DropdownMenuSearch, its header, its JSDoc and the `ComplexWithSearch` story that consumers copy do not.
- steps:
  - [ ] 1. Reproduce: Storybook `Menus/DropdownMenu/Complex With Search` — open the menu with the keyboard (focus the trigger, press Enter/ArrowDown) and try to reach the search with Tab or arrows: focus never lands on the input, and from a pointer-focused input ArrowDown does not move into the list.
  - [ ] 2. DropdownMenuSearch.tsx header — append as the LAST bullet of `## behavior` (before the ` *` line that precedes `## constraints`; WI-C5-10 and WI-C5-13 edit earlier bullets of the same list):
    ```
     * - Not keyboard-reachable inside DropdownMenuContent: Radix prevents Tab
     *   there and moves focus only among its own items, and this input stops
     *   keydown propagation, so ArrowDown never reaches the menu. As with
     *   DropdownMenuPlainItem, consumers must give keyboard users another path —
     *   filter from the trigger (TypeableDropdownTrigger) or search outside the menu.
    ```
    The `## constraints` block is unchanged.
  - [ ] 3. Above :34 add a JSDoc that ships in the d.ts:
    ```tsx
    /**
     * Slim search row for complex dropdown compositions (opt-in; place above a
     * separator inside DropdownMenuContent).
     *
     * Keyboard limit: inside a Radix menu this input cannot be reached with Tab
     * or the arrow keys, and ArrowDown from it does not move into the items.
     * Provide a keyboard path too — filter from the trigger
     * (`TypeableDropdownTrigger`) or put the search outside the menu.
     */
    ```
  - [ ] 4. DropdownMenu.stories.tsx — above :427 `export const ComplexWithSearch: Story = {` add `/** Pointer-first composition: \`DropdownMenuSearch\` is not keyboard-reachable inside the menu (see its JSDoc) — ship a keyboard path alongside it. */`.
  - [ ] 5. Verify: `npm run lint` → exit 0. `rg -n "Keyboard limit|Not keyboard-reachable" src/components/Menu` → 2 lines (DropdownMenuSearch.tsx). Build in a scratch worktree → `git status --porcelain` empty and `dist/components/Menu/DropdownMenuSearch.d.ts` contains "Keyboard limit". Storybook `Complex With Search` docs panel shows the new story description.
  - [ ] 6. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: the limitation is stated in the header, in the shipped JSDoc and on the story; no code changed.
- log:
  - 2026-10-01 — created by audit

## DONE
