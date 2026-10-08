# F-C1 — final findings (composer C1) @ b436647

### F-011: add-use-client.mjs reads only the first 5 lines, so 16 client modules (9 in published v5.3.0) ship in chunks without "use client" and fail inside React Server Components
- severity: S1
- category: build-packaging
- rules: [R8.21, R11.9]
- scope: consumer-visible
- confidence: confirmed
- verified_by: "U2 client-scan.cjs + dist-directive-check.cjs (40 src directives, 16 below line 5; 24 ESM + 24 CJS chunks stamped = build log's 48); U3/U6 head -1 of the cited chunks. V1: grep → 40 files (16 at lines 15-54); every cited chunk starts `import {`; RSC approximation (node --conditions=react-server + client-ref load hook) → `createContext is not a function` on AIPromptInput's chunk and on the root dist/index.js import, hooks-undefined render failures for 7 more; v5.3.0 script identical, 9 late directives."
- locations:
  - scripts/add-use-client.mjs:11-12
  - scripts/add-use-client.mjs:36-50
  - scripts/add-use-client.mjs:79
  - scripts/add-use-client.mjs:119-120
  - tsup.config.ts:26-32
  - src/components/Menu/DropdownMenuSearch.tsx:15
  - src/components/VerificationCode/CodeDigitInput.tsx:15
  - src/components/VerificationCode/VerificationCodeInput.tsx:15
  - src/components/Checkbox/Checkbox.tsx:18
  - src/components/ShapeButton/ShapeButton.tsx:18
  - src/components/Button/Button.tsx:23
  - src/components/AIChat/AIThinkingPart.tsx:24
  - src/components/AnimatedText/RollChangeText.tsx:24
  - src/components/AnimatedText/FadeChangeText.tsx:28
  - src/components/AIChat/AIPromptInput.tsx:29
  - src/components/AnimatedText/RevealChangeText.tsx:33
  - src/components/Input/Input.tsx:33
  - src/components/AnimatedText/useChangeSwap.ts:39
  - src/components/SidebarWithHoverIcon/SidebarWithHoverIcon.tsx:40
  - src/components/AnimatedText/RollingDigitsText.tsx:42
  - src/components/MorphRotationShape/MorphRotationShape.tsx:54
  - README.md:30-33
  - README.md:44
  - .agents/skills/dooph-ds-codebase/SKILL.md:627-629
  - .agents/skills/dooph-ds-codebase/SKILL.md:635-636
  - .agents/skills/file-header-contracts/SKILL.md:158
- evidence: |
    scripts/add-use-client.mjs:11  // 1. Scan src/ for modules whose first lines carry a "use client" directive
    scripts/add-use-client.mjs:12  //    (the source of truth — kept in lockstep with the component files).
    scripts/add-use-client.mjs:38  // Inspect the first handful of non-empty lines; the directive must precede
    scripts/add-use-client.mjs:40  const lines = contents.split('\n').slice(0, 5);
    scripts/add-use-client.mjs:79  const clientSources = collectClientSources(SRC_DIR, new Set());
    scripts/add-use-client.mjs:120 `[add-use-client] stamped "use client" on ${stamped.size} output chunk(s) from ${clientSources.size} client source module(s).`,
    tsup.config.ts:29-30  … per-module "use client" directives survive into dist — interactive / components keep the directive at the top of THEIR chunk, …
    .agents/skills/file-header-contracts/SKILL.md:158  - First thing in the file — above `"use client"`, above imports, below a license banner if one exists.
    The 16 src directives the 5-line window misses (each line reads `"use client";`, below a header comment):
    | path:line | needs it (V1 RSC run) | at v5.3.0 |
    | Menu/DropdownMenuSearch.tsx:15 | yes — local handleKeyDown closure on a host <input> (Flight rejects; not hook-based) | late |
    | VerificationCode/CodeDigitInput.tsx:15 | no (hook-free, see F-027) | late |
    | VerificationCode/VerificationCodeInput.tsx:15 | yes — render FAIL `useState is not a function` | late |
    | Checkbox/Checkbox.tsx:18 | no (F-027) | late |
    | ShapeButton/ShapeButton.tsx:18 | no (F-027) | — |
    | Button/Button.tsx:23 | no (F-027) | late (:17) |
    | AIChat/AIThinkingPart.tsx:24 | yes — useState | — |
    | AnimatedText/RollChangeText.tsx:24 | yes — `useRef is not a function` | late (Text/) |
    | AnimatedText/FadeChangeText.tsx:28 | yes — `useRef is not a function` | — |
    | AIChat/AIPromptInput.tsx:29 | yes — module-eval FAIL `createContext is not a function` | — |
    | AnimatedText/RevealChangeText.tsx:33 | yes — `useState is not a function` | late (Text/) |
    | Input/Input.tsx:33 | yes — `useRef is not a function` | — |
    | AnimatedText/useChangeSwap.ts:39 | yes — `useRef is not a function` | — |
    | SidebarWithHoverIcon/SidebarWithHoverIcon.tsx:40 | yes — `useRef is not a function` | late |
    | AnimatedText/RollingDigitsText.tsx:42 | yes — useState | late (Text/) |
    | MorphRotationShape/MorphRotationShape.tsx:54 | yes — useRef ×9, useLayoutEffect ×3 | — |
    Build copy (same SHA): dist/index.js has 0 `use client` and imports the unstamped chunks directly (`:124-126` Input from "./chunk-JXNRCALT.js", `:217-219` MorphRotationShape from "./chunk-PWLXGSXJ.js"); dist/chunk-6QQ7EYYD.js:32 `var PromptInputContext = createContext(null);` at module scope with no directive. The per-entry stubs (dist/components/Input/Input.js:1 `"use client";`) carry it but package.json `exports` exposes only ".".
    README.md:30-31  RSC support is built in. Interactive components ship a per-module `"use client"` / directive that is preserved into the published bundle, so you can import directly
    README.md:44     `next build` runs with no `createContext is not a function` error. Pure,
    .agents/skills/dooph-ds-codebase/SKILL.md:628-629  several files open with a doc comment and the directive follows it, / which is still a valid directive prologue because comments are not statements).
    .agents/skills/dooph-ds-codebase/SKILL.md:635-636  `add-use-client.mjs` stamps dist chunks purely from source / directives, so deleting the line from a source file is the whole change.
    Claims register: C-README-5, C-README-6, C-CB-225, C-CB-228, C-JSDOC-add-use-client-1, C-JSDOC-tsup.config-2 — all FALSE because of this defect.
- impact: A Next.js App Router consumer who imports any of the 12 modules that need the boundary (Input, VerificationCodeInput, SidebarWithHoverIcon, DropdownMenuSearch, AIPromptInput, AIThinkingPart, MorphRotationShape, RollingDigitsText, RollChangeText, FadeChangeText, RevealChangeText, useChangeSwap) from the package root gets a module the RSC bundler treats as server code; rendering it from a Server Component throws (`useRef`/`useState`/`useLayoutEffect` are undefined in React's react-server build, and DropdownMenuSearch hands a closure to a host element, which Flight rejects). AIPromptInput fails at module evaluation (`createContext is not a function`), and V1 reproduced the same error from evaluating dist/index.js itself, so a bundler that does not prune the unused chunk breaks every root import — exactly the error README.md:44 promises cannot happen (bundler-dependent, not run under Next). Published v5.3.0 already ships 9 late-directive files, 6 of which need the boundary (SidebarWithHoverIcon, VerificationCodeInput, RollChangeText, RevealChangeText, RollingDigitsText, DropdownMenuSearch); HEAD raises it to 16. The build log ("from 24 client source module(s)") looks healthy, and every future header contract added to a client file — R11.9 requires the contract above the directive — silently drops that file from the stamp, so maintainers who follow the header rule cause the regression.
- recommendation: Make the stamp script find the directive the way a JS parser does — read the directive prologue (skip a BOM, blank lines, `//` and `/* */` comments, then accept the leading string-literal statements) instead of a 5-line window — and fail the build when a src module contains a `"use client"` line the prologue scan did not classify. Keep R11.9 as it is: the header-first placement is correct and this fix does not conflict with it; do not "fix" by moving directives above headers. With the fix, README.md:30-48 and codebase SKILL.md:627-636 become true as written.
- breaking: none
- contract: .agents/skills/file-header-contracts/SKILL.md:158 "First thing in the file — above `"use client"`, above imports" → consistent (the script, not the rule, is wrong). The 16 src files' headers carry no constraint about the directive (grep of each header for client/server/RSC → 0) → consistent.
- remediation: [WI-C1-01]
- related: [F-012, F-027, F-087, F-104, F-102]

### F-012: ShapeMorphSpinner and DropdownCaret are neutral modules that pass component functions to the client MorphRotationShape, which React Server Components cannot serialize
- severity: S1
- category: build-packaging
- rules: [R8.21, R11.9]
- scope: consumer-visible
- confidence: confirmed
- verified_by: "U9 read of SMS + Shapes (no directive) and dist chunk-PWLXGSXJ.js head; HB rg of every <MorphRotationShape renderer + neutral-module scan for function-valued JSX props. V1 sms-props.mjs under the RSC approximation: as built the element is not a client reference (MRS hooks then fail); with MRS forced to a client reference the six `shapes` are plain functions (not client refs). C1 scratch/C1/shapes-serializable.mjs on the build copy → FAIL ×3 (functions, not strings)."
- locations:
  - src/components/ShapeMorphSpinner/ShapeMorphSpinner.tsx:1-7
  - src/components/ShapeMorphSpinner/ShapeMorphSpinner.tsx:24-31
  - src/components/ShapeMorphSpinner/ShapeMorphSpinner.tsx:50
  - src/components/ShapeMorphSpinner/ShapeMorphSpinner.tsx:57-59
  - src/components/DropdownCaret/DropdownCaret.tsx:25-37
  - src/components/DropdownCaret/DropdownCaret.tsx:53-55
  - src/components/MorphRotationShape/MorphRotationShape.tsx:54
  - src/components/MorphRotationShape/MorphRotationShape.tsx:90-91
  - src/components/Shapes/shapePaths.ts:16-18
  - src/components/Shapes/shapePaths.ts:33
  - src/components/Shapes/index.ts:15-29
  - .agents/skills/dooph-ds-contribution/SKILL.md:71
  - skills/dooph-design-system-usage/SKILL.md:209-211
- evidence: |
    ShapeMorphSpinner.tsx:7      import type { ComponentPropsWithoutRef, ComponentType } from "react";   (lines 1-6 are a comment; no "use client" anywhere)
    ShapeMorphSpinner.tsx:24     export const SHAPE_MORPH_SPINNER_SHAPES: ComponentType<ShapeProps>[] = [
    ShapeMorphSpinner.tsx:50       shapes = SHAPE_MORPH_SPINNER_SHAPES,
    ShapeMorphSpinner.tsx:57-59    <MorphRotationShape / mode={MorphRotationShapeMode.autoplay} / shapes={shapes}
    DropdownCaret.tsx:34-36      const CARET_SHAPES = { / dropdown: [SquircleShape, PixircleShape], / typeable: [CloverShape, PuffShape],   (file has no "use client")
    DropdownCaret.tsx:55               shapes={CARET_SHAPES[variant]}
    MorphRotationShape.tsx:54    "use client";        (below a 53-line header; unstamped in dist — F-011)
    MorphRotationShape.tsx:90-91   /** DS shape components in play order, e.g. `[CloverShape, PuffShape]`. At least two. */ / shapes: ShapeComponent[];
    shapePaths.ts:16-18          /** Component -> its outline in the 24-unit viewBox. Lets MorphRotationShape / * take components without rendering them. */ / const SHAPE_PATHS = new Map<ComponentType<ShapeProps>, string>([
    shapePaths.ts:33             export function getShapePath(Component: ComponentType<ShapeProps>): string {
    Shapes/index.ts:15           export const Shapes = {      (arrow … triple: one string key per shape, :16-27)
    contribution SKILL.md:71     - [ ] `"use client"` added only if the module actually uses `useState`/`useEffect`/`useRef`, a browser API, or a timer. …
    usage SKILL.md:211           … a custom trigger adds the `ds-dropdown-caret-host` class to its root …   (consumers render DropdownCaret themselves; no RSC caveat at :209-211)
    $ node docs/audit/_work/scratch/C1/shapes-serializable.mjs ../dooph-ds-audit-build/dist
      FAIL ShapeMorphSpinner(): shapes passed to MorphRotationShape = [function CookieShape, function CloverShape, …]
      FAIL DropdownCaret(dropdown): shapes passed to MorphRotationShape = [function SquircleShape, function PixircleShape]
- impact: A consumer renders `<ShapeMorphSpinner />` in a Next.js App Router server file — `loading.tsx` is its natural home — or builds a custom dropdown trigger in a Server Component with `<DropdownCaret />`, as usage SKILL.md:211 invites. Today the render fails because MorphRotationShape's chunk is unstamped and its hooks run in the react-server graph (F-011). After F-011 is fixed it still fails: the neutral module hands an array of plain function components to a client reference, and React Flight refuses to serialize functions ("Functions cannot be passed directly to Client Components" — React's documented rule; V1 did not run Flight). So fixing the stamp script alone leaves both public components broken in RSC. The units missed DropdownCaret because R8.21's trigger list has no entry for "passes a function to a client component", so the same rule classed one module as needing the directive and the other as neutral.
- recommendation: Make the shape selection serialisable. MorphRotationShape already turns each shape into a path string through `getShapePath` (shapePaths.ts imports all 12 shapes), so let `shapes` accept `Shapes` keys as well as components, resolve keys in shapePaths.ts, and have ShapeMorphSpinner and DropdownCaret pass keys. Both stay neutral and server-rendered, the change is additive (minor), it does not depend on D-05, and server components get an RSC-safe way to choose shapes. Keep `SHAPE_MORPH_SPINNER_SHAPES` exported unchanged for compatibility. The alternative — mark both modules `"use client"` — depends on F-011 and on D-05 adding "passes a function or component value to a client component" to R8.21. It would also force `SHAPE_MORPH_SPINNER_SHAPES` out to a neutral module (R8.20), and a server caller passing custom component `shapes` would still fail.
- breaking: none
- contract: src/components/DropdownCaret/DropdownCaret.tsx:23 "No state props and no listeners (Rule 7): hosts drive it through CSS only." → consistent (keys add neither). src/components/MorphRotationShape/MorphRotationShape.tsx:50-51 "Changing `shapes` remounts the inner component (key), resetting to stop 0 without animation." → consistent (string keys compare by value, so a stable key list keeps its identity semantics).
- remediation: [WI-C1-02]
- related: [F-011, F-027, F-065]

### F-014: cn's text-style group lists 8 of 10 roles, so HeroBodyText/HeroButtonText lose their role class when given a colour className
- severity: S1
- category: build-packaging
- rules: [R4.4, R8.17]
- scope: consumer-visible
- confidence: confirmed
- verified_by: "U2 rg of index.css role classes (10) vs cn.ts (8) + node probe of the built cn; U13 same probe. V1 cn-check.mjs on the build copy: cn('text-style-hero-body','text-text') → 'text-text' (other 8 roles kept), and react-dom/server renders <HeroBodyText className='text-text-secondary'> as `<span class=\"text-text-secondary\">`; re-created v5.3.0 group (6 roles) drops SubheadingText/MonoText the same way."
- locations:
  - src/utils/cn.ts:4-13
  - src/utils/cn.ts:14-29
  - src/components/Text/constants.ts:122-133
  - src/components/Text/BaseText.tsx:89
  - src/components/Text/BaseText.tsx:145-152
  - src/styles/index.css:249
  - src/styles/index.css:259
  - skills/dooph-design-system-usage/SKILL.md:58
  - skills/dooph-design-system-usage/SKILL.md:242-245
  - skills/dooph-design-system-usage/SKILL.md:320-336
- evidence: |
    cn.ts:11-12   * Registering the `text-style-*` classes in their own group tells twMerge they are an / * independent typographic intent, not a color, so they coexist with color utilities.
    cn.ts:17-25   'text-style': [ 'text-style-button', 'text-style-body', 'text-style-label', 'text-style-title', 'text-style-heading', 'text-style-subheading', 'text-style-hero', 'text-style-mono',   (no hero-body / hero-button)
    Text/constants.ts:124  heroButton: 'text-style-hero-button',
    Text/constants.ts:130  heroBody: 'text-style-hero-body',
    index.css:249 .text-style-hero-body {      index.css:259 .text-style-hero-button {      (10 role classes at index.css:224-313)
    BaseText.tsx:89        className={cn(role && TEXT_VARIANT_CLASS[role], className)}
    usage SKILL.md:58      <BodyText className="text-text-secondary">Saved automatically</BodyText>
    usage SKILL.md:320-322 **`cn` must come from the package.** It registers a `text-style` conflict group; / without it a later color class like `text-text` silently erases `text-style-body` / on the same element …
    usage SKILL.md:331-332 "text-style-button", "text-style-body", "text-style-label", / "text-style-title", "text-style-heading", "text-style-hero",   (6 of 10)
    V1 render (build copy): HeroBodyText → <span class="text-text-secondary">x</span>; BodyText → <span class="text-style-body text-text-secondary">x</span>
    Claims register: C-JSDOC-cn-1, C-USAGE-55, C-USAGE-56 — FALSE.
- impact: The usage skill's standard way to recolour a text role is `className="text-text-secondary"` on the role component (SKILL.md:58). On `HeroBodyText` or `HeroButtonText`, which the skill documents at :242-245, that call makes BaseText's own `cn` drop `text-style-hero-body`/`text-style-hero-button`. The 16px hero role then renders with none of its family, size, weight, tracking or axes, and nothing warns. This is the exact failure cn.ts:4-13 says the group exists to prevent. The hero roles are unreleased (8a946e5, after v5.3.0), but published v5.3.0 already has the same defect for `SubheadingText` and `MonoText` (its `cn` registered 6 of 8 roles). The shipped replica snippet for consumers with their own merge helper (SKILL.md:325-336) still lists v5.3.0's 6 roles, so it teaches a helper that drops 4 of today's 10. A hand-kept list has now drifted at two releases in a row.
- recommendation: Stop hand-listing role classes. Match the whole `text-style-*` family in `cn` with a class-group validator, so a new role cannot fall out of the group. Give consumers one source for the config instead of a replica that drifts: export it from the package and reduce the skill snippet to importing it. Ship this together with the DS theme-scale registration (F-055), which touches the same config object.
- breaking: none
- contract: n/a
- remediation: [WI-C1-03]
- related: [F-055, F-060]

### F-015: Importing dist/theme.css into a consumer Tailwind build remaps max-w/w/min-w/basis xs–xl from container widths to 8–28px spacing values
- severity: S1
- category: build-packaging
- rules: []
- scope: consumer-visible
- confidence: confirmed
- verified_by: "U1 compiled a probe with the audit-build Tailwind 4.3.3 CLI with/without src/styles/theme.css. V1 compiled without / with / full documented setup: with the preset `.max-w-md{max-width:var(--ui-spacing-md)}`, `.w-lg`, `.min-w-sm`, `.basis-md` likewise; same lines at v5.3.0. C1 scratch/C1/tw (same CLI): `inline-md`/`max-inline-md`/`min-inline-md` are remapped too, and an explicit `--max-width-*`/`--width-*`/`--min-width-*`/`--flex-basis-*` → `var(--container-*)` block restores the four families but not the three logical-size ones."
- locations:
  - src/styles/theme.css:111-119
  - scripts/sync-theme.mjs:199-201
  - scripts/sync-theme.mjs:230-246
  - skills/dooph-design-system-theming/references/token-contract.md:216-228
- evidence: |
    theme.css:113  --spacing-xs: var(--ui-spacing-xs);
    theme.css:114  --spacing-sm: var(--ui-spacing-sm);
    theme.css:116  --spacing-md: var(--ui-spacing-md);
    theme.css:117  --spacing-lg: var(--ui-spacing-lg);
    theme.css:118  --spacing-xl: var(--ui-spacing-xl);
    sync-theme.mjs:200-201  const spacingM = key.match(/^ui-spacing-(.+)$/); / if (spacingM) return `--spacing-${spacingM[1]}: var(${fullName});`;
    token-contract.md:228  This makes every dooph utility generate in the app build and overrides colliding defaults; values still resolve from `styles.css` at runtime. …
    Tailwind 4.3.3 lib.js theme-key order: "max-w" ["--max-width","--spacing","--container"], "w" ["--width","--spacing","--container"], min-w ["--min-width","--spacing","--container"], basis ["--flex-basis","--spacing","--container"], inline / max-inline / min-inline ["--spacing","--container"]  (spacing is consulted before container)
    Compiled (scratch/C1/tw, build-copy CLI):
    | class | stock Tailwind | + dist/theme.css | + theme.css + explicit --max-width/--width/--min-width/--flex-basis keys |
    | max-w-md | var(--container-md) | var(--ui-spacing-md) | var(--container-md) |
    | w-md | var(--container-md) | var(--ui-spacing-md) | var(--container-md) |
    | min-w-sm | var(--container-sm) | var(--ui-spacing-sm) | var(--container-sm) |
    | basis-md | var(--container-md) | var(--ui-spacing-md) | var(--container-md) |
    | inline-md / max-inline-md / min-inline-md | var(--container-md) | var(--ui-spacing-md) | var(--ui-spacing-md) |
    | p-md, gap-sm, w-xxl | (none) | DS spacing | DS spacing |
    | max-w-2xl | var(--container-2xl) | unchanged | unchanged |
    Values (dist/styles.css, V1): --ui-spacing-xs 8px, -sm 10px, -md 16px, -lg 20px, -xl 28px; Tailwind containers xs–xl are 20–36rem.
- impact: A consumer who follows the documented setup (README.md:189-191, token-contract.md:220-226) to make `p-md`/`gap-sm` work in their own Tailwind build silently changes every existing `max-w-{xs…xl}`, `w-{…}`, `min-w-{…}`, `basis-{…}` and logical `inline-{…}` class in their app from 20–36rem to 8–28px. A `max-w-md` article column collapses to 16px, there is no build error, and nothing in the docs warns: token-contract.md:228 presents "overrides colliding defaults" as a feature, with `font-sans` and numeric spacing as the only examples. DS components never use these classes, so the package's own build never shows the problem. This has been live on npm since at least v5.3.0. Keys `xxxs`, `xxs`, `rg` and `xxl`, and the 2xl+ containers, do not collide.
- recommendation: Decision D-02. Options: (A) generate, in the same `@theme inline` block, explicit `--max-width-*`, `--width-*`, `--min-width-*` and `--flex-basis-*` keys for every DS spacing name that is also a Tailwind container name, each pointing at `var(--container-<name>)`. These namespaces are consulted before `--spacing`, so the four families get their container widths back while `p-md`/`gap-sm` keep the DS scale. This is non-breaking (it restores Tailwind's own meaning) and is the recommended option. Its known residue is that `inline-*`/`max-inline-*`/`min-inline-*` have no dedicated namespace and stay remapped, which must be documented. (B) Rename the DS spacing keys out of Tailwind's container names. That fixes every family but is breaking (`p-md` and friends change in consumer code and in DS source; P4, migration skill). (C) Drop the colliding keys from theme.css only. Also breaking for consumers who use `p-md`. (D) Document the collision only, which leaves the silent remap in place. Whatever D-02 picks, token-contract.md's "Tailwind Consumer Preset" section must state exactly which stock utilities the preset changes.
- breaking: major (only if D-02 chooses B or C; the recommended option A is none)
- contract: n/a (theme.css is generated by scripts/sync-theme.mjs; neither file has a `## constraints` header)
- remediation: decision D-02 (+ blocked WI-C1-04)
- related: [F-013]

### F-027: "use client" placement follows no single rule: 13 hook-free modules carry it while AIModelSelect lacks it but passes a closure to a client component
- severity: S2
- category: inconsistency
- rules: [R8.21, R8.20]
- scope: consumer-visible
- confidence: confirmed
- verified_by: "U2 client-scan.cjs over 252 modules (40 directives; 13 with no client-only API); U4/U6/U8/U9 per-file import reads; U7/U11 closure greps. V3: static scan of the 13 → none; RSC approximation with the directive stripped renders Modal/Tooltip/Tabs/SearchBox/SplitButton/DatePickerTrigger/Popover/Sheet/LPI parts clean; as shipped `tabTriggerVariants` and `formatTriggerLabel` are client references that throw when called; stripping CalendarCaption/CalendarPresetItem/DatePickerSplitTrigger/CalendarGrid exposes handler closures; AIThinkingEffortSelector passes a closure to client SliderLabeled."
- locations:
  - .agents/skills/dooph-ds-contribution/SKILL.md:71
  - .agents/skills/dooph-ds-codebase/SKILL.md:619-625
  - .agents/skills/dooph-ds-codebase/SKILL.md:630-635
  - src/components/Button/Button.tsx:23
  - src/components/Checkbox/Checkbox.tsx:18
  - src/components/ShapeButton/ShapeButton.tsx:18
  - src/components/VerificationCode/CodeDigitInput.tsx:15
  - src/components/Modal/Modal.tsx:1
  - src/components/Popover/Popover.tsx:1
  - src/components/Sheet/Sheet.tsx:1
  - src/components/Tooltip/Tooltip.tsx:1
  - src/components/Tabs/Tabs.tsx:1
  - src/components/Tabs/Tabs.tsx:28
  - src/components/Tabs/Tabs.tsx:62
  - src/components/SearchBox/SearchBox.tsx:1
  - src/components/SplitButton/SplitButton.tsx:1
  - src/components/LinearProgressIndicator/LinearProgressIndicator.tsx:1
  - src/components/DatePicker/DatePickerTrigger.tsx:1
  - src/components/DatePicker/DatePickerTrigger.tsx:40
  - src/components/CTAButton/CTAButton.tsx:1
  - src/components/Table/Table.tsx:1
  - src/components/AIChat/AIModelSelect.tsx:20
  - src/components/AIChat/AIModelSelect.tsx:167-170
  - src/components/Calendar/CalendarGrid.tsx:230-233
  - src/components/Calendar/CalendarCaption.tsx:120
  - src/components/Calendar/CalendarPresetsPanel.tsx:61
  - src/components/DatePicker/DatePickerSplitTrigger.tsx:133
- evidence: |
    contribution SKILL.md:71  - [ ] `"use client"` added only if the module actually uses `useState`/`useEffect`/`useRef`, a browser API, or a timer. `forwardRef`, `memo`, `useId`, `useMemo` and `useCallback` all work in React's server build, …
    codebase SKILL.md:619     ### `"use client"` — only where a client-only hook forces it
    codebase SKILL.md:623-624 … Only `useState` / `useEffect` / `useRef` (and browser / APIs, timers, rAF) require the directive. …
    Hook-free modules that carry the directive (forwardRef / cn / cva / Radix parts only; V3 renders each clean with it stripped):
    | Button/Button.tsx:23 | Checkbox/Checkbox.tsx:18 | ShapeButton/ShapeButton.tsx:18 | VerificationCode/CodeDigitInput.tsx:15 |   ("use client"; — unstamped today by F-011, so inert in dist)
    | Modal/Modal.tsx:1 | Popover/Popover.tsx:1 | Sheet/Sheet.tsx:1 | Tooltip/Tooltip.tsx:1 | Tabs/Tabs.tsx:1 | SearchBox/SearchBox.tsx:1 | SplitButton/SplitButton.tsx:1 | DatePicker/DatePickerTrigger.tsx:1 |   ("use client";)
    | LinearProgressIndicator/LinearProgressIndicator.tsx:1 | 'use client'; |
    Same-shape wrappers WITHOUT it: CTAButton.tsx:1 `import { Slot } from "@radix-ui/react-slot";` · Table.tsx:1 `// No "use client": no hooks, and onSort is a consumer-supplied passthrough.` · also OutlineSection, Sticker, TextLink, Text/BaseText.
    Tabs.tsx:28   const tabTriggerVariants = toggleOptionVariants;      Tabs.tsx:62 export { TabsRoot as Tabs, TabsContent, TabsList, TabsTrigger, tabTriggerVariants };
    DatePickerTrigger.tsx:40  export function formatTriggerLabel(
    V3 (as shipped): `tabTriggerVariants is a CLIENT REFERENCE ($$id chunk-S6ZPA5G2.js#tabTriggerVariants) -> calling it: TypeError`; same for `formatTriggerLabel` (chunk-3B6W7IHC.js). Both are root exports.
    Hook-free modules that DO need it, only because they create closures (the rule text does not say so):
    CalendarGrid.tsx:230   onClick={() => onDayClick(date)}
    CalendarCaption.tsx:120  onClick={() => onMonthChange(addMonths(viewMonth, -1))}
    CalendarPresetsPanel.tsx:61  onClick={(event) => {        (in CalendarPresetItem)
    DatePickerSplitTrigger.tsx:133  onValueChange={handlePresetChange}
    The neutral module that needs it and lacks it:
    AIModelSelect.tsx:20      import {          (first statement after the header; no directive)
    AIModelSelect.tsx:167-169   onValueChange={([next]) => { / const step = steps[next]; / if (step && step.value !== value) onValueChange(step.value);
    Claims register: C-CB-224 FALSE (trigger list incomplete).
- impact: The rule text and the code teach different things, so the next edit goes wrong either way. An agent who tidies by R8.21 as written removes the directive from the four Calendar/DatePicker modules and breaks them in RSC ("Event handlers cannot be passed to Client Component props"), because the list omits the closure trigger. An agent who copies Button or Tooltip adds needless directives, and one who copies CTAButton or Table omits them, with 13 precedents against 6. The consumer cost today is two public helpers that live in stamped client chunks. `tabTriggerVariants(...)` and `formatTriggerLabel(...)` are client references, so a Server Component that calls them throws. Both are undocumented (F-087), which keeps this at S2. `buttonVariants` and `checkboxVariants` join them as soon as F-011 stamps Button and Checkbox. `AIThinkingEffortSelector`, rendered from a Server Component with a server action, would pass a fresh closure to the client `SliderLabeled`; the case is narrow because its required callback normally means the caller is already client. The hydration and bundle cost the units claimed is overstated: the Radix primitives these wrappers render are client components anyway, so dropping a wrapper's directive moves only the thin forwardRef + `cn` call to the server.
- recommendation: Decision D-05. Recommended option: state the trigger list completely and apply it everywhere. A module needs `"use client"` when (1) it calls a client-only React API (`useState`, `useEffect`, `useLayoutEffect`, `useRef`, `useReducer`, `useContext`, `createContext`, `useImperativeHandle`, `useSyncExternalStore`, or a hook built on them), a browser API, a timer, rAF or an observer, or (2) it creates a function and passes it to a host element or a client component. Hook-free wrappers around Radix parts are neutral, because the Radix package owns its own boundary. Then remove the directive from the 13 hook-free modules, which makes `tabTriggerVariants`, `formatTriggerLabel`, `buttonVariants` and `checkboxVariants` plain values, and add it to AIModelSelect.tsx below its header (this needs F-011's prologue-aware stamp). The alternative is to amend R8.21 so that Radix wrappers always carry the directive. That keeps the 13 directives, still requires adding AIModelSelect and the closure trigger, and leaves the two helpers as client references to move into server-safe modules (R8.20).
- breaking: none
- contract: Button.tsx, Checkbox.tsx, ShapeButton.tsx, CodeDigitInput.tsx, LinearProgressIndicator.tsx and AIModelSelect.tsx carry header contracts. None names the directive (header grep for client/server/RSC → 0; AIModelSelect.tsx:11-19 constrains data, colour and radio semantics only) → consistent.
- remediation: decision D-05 (+ blocked WI-C1-05)
- related: [F-011, F-012, F-087, F-102]

### F-055: cn registers none of the DS size/radius/spacing/shadow scales, so DS utilities and stock utilities either both survive or wrongly erase each other
- severity: S2
- category: build-packaging
- rules: []
- scope: consumer-visible
- confidence: confirmed
- verified_by: "U2 node probe of the built cn. V3 m6-cn.mjs against ../dooph-ds-audit-build/dist (tailwind-merge 3.6.0): buttonVariants(primary)+'text-body' drops text-primary-fg; rounded-tight+rounded-full and 7 other DS/stock pairs both kept; shadow-button+shadow-primary → 'shadow-primary'. C1 scratch/C1/twm-proto.mjs: registering the theme scales fixes all of them (31/31 cases + the buttonVariants case PASS)."
- locations:
  - src/utils/cn.ts:14-29
  - src/components/Button/Button.tsx:130
  - src/styles/theme.css:101-138
  - src/styles/index.css:322-365
  - skills/dooph-design-system-usage/SKILL.md:314
  - skills/dooph-design-system-usage/SKILL.md:320-336
  - README.md:189-191
- evidence: |
    cn.ts:14-17   const twMerge = extendTailwindMerge<'text-style'>({ / extend: { / classGroups: { / 'text-style': [      (the only registration; no `theme`)
    Button.tsx:130          className={cn(buttonVariants({ variant, size }), className)}
    theme.css:101-102       --text-label: var(--ui-text-label); / --text-body: var(--ui-text-body);   (11 --text-*, 9 --radius-*, 10 --spacing-*, 10 --shadow-* at :101-152)
    theme.css:120 --radius-tight: var(--ui-radius-tight);    theme.css:128 --shadow-button: var(--ui-shadow-button);
    index.css:324 .h-button {   … :330 .size-button { … :357 .min-h-button { … :360 .min-w-button {   (custom @layer utilities, unknown to tailwind-merge)
    usage SKILL.md:314      ✓ [&_h1]:font-title [&_h1]:text-title [&_h1]:[font-variation-settings:var(--ui-font-var-heading)]
    V3 probe (build copy):
      cn(buttonVariants({variant: primary}), 'text-body') -> dropped: [ 'text-primary-fg' ] added: [ 'text-body' ]
      ["text-label","text-body"] -> "text-body"   ["text-primary-fg","text-body"] -> "text-body"   ["text-sm","text-primary-fg"] -> both kept
      both kept: rounded-tight+rounded-full, rounded-normal+rounded-soft, px-3+px-md, h-button+h-8, size-button+size-8, shadow-button+shadow-none, gap-xs+gap-2, p-md+p-4   (control rounded-md+rounded-full -> "rounded-full")
      ["shadow-button","shadow-primary"] -> "shadow-primary"   (shadow-button read as a shadow COLOUR)
    dist/styles.css (build copy): .rounded-full at :831, .rounded-tight at :849, same @layer utilities; README.md:189-191 imports tailwindcss BEFORE styles.css, so the DS rule wins in both setups.
- impact: tailwind-merge classes every unknown `text-{word}` as a text colour, so the DS font-size utilities (`text-body`, `text-label`, `text-title` … the family the usage skill teaches at :314) share the colour group. `<Button className="text-body">` therefore silently deletes the Button's colour class (`text-primary-fg` on primary), and the label falls back to the inherited colour. The opposite failure hits the DS radius, spacing, shadow and height scales. tailwind-merge cannot tell that `rounded-tight` and `rounded-full` set the same property, so both stay, stylesheet order decides, and `<Button className="rounded-full">` keeps its tight radius. Likewise `className="h-8"` on a Button keeps `h-button` as well, and whichever rule comes later in the stylesheet wins. A shadow-colour utility (`shadow-primary`) deletes the DS elevation `shadow-button`. The defect sits in the consumer override path the usage skill documents ("`cn` must come from the package", SKILL.md:320). Internal class strings are unaffected today: C1's SSR harness found only 12 internal merges that would change, and each one drops a class that already loses on stylesheet order.
- recommendation: Register the DS theme scales with tailwind-merge (`extend.theme`: `text`, `radius`, `spacing` and `shadow` from the same token list sync-theme.mjs already parses, so they cannot drift), plus the custom `h-`/`size-`/`min-h-`/`min-w-` utilities in `classGroups`. Do this in the same config change as F-014 and expose that one config to consumers instead of a hand-copied snippet.
- breaking: none
- contract: n/a
- remediation: [WI-C1-03]
- related: [F-014, F-060]

### F-056: The vendored MIT/Apache shape-morph engine ships without its licence notices, and THIRD_PARTY_NOTICES.md is not in the tarball
- severity: S2
- category: build-packaging
- rules: []
- scope: consumer-visible
- confidence: confirmed
- verified_by: "U10/U13: package.json files + `grep -c THIRD_PARTY pack.txt` → 0; dist engine files carry no header. V1: non-map dist files containing Thereallo/Apache/androidx/Copyright/@license/'Permission is hereby' → 0 (only styles.css:1 has a /*! comment); engine code ships in 7 ESM + 3 CJS chunks; header text survives only in sourcesContent of 4 shipped .js.map files and even there has no copyright or permission text; 3 Radix rows missing from the notice table (S4 sub-point)."
- locations:
  - src/components/MorphRotationShape/engine/cubic.ts:1-4
  - src/components/MorphRotationShape/engine/morph.ts:1-4
  - src/components/MorphRotationShape/engine/polygon.ts:1-4
  - src/components/MorphRotationShape/engine/utils.ts:1-4
  - src/components/MorphRotationShape/engine/svgPath.ts:5
  - THIRD_PARTY_NOTICES.md:48-63
  - THIRD_PARTY_NOTICES.md:67-85
  - package.json:35-39
  - package.json:83-85
  - LICENSE.txt:1-3
- evidence: |
    cubic.ts:2-4   * Vendored from shape-morph (https://github.com/Thereallo1026/shape-morph, MIT, / * commit f4d2697), itself a TypeScript port of AOSP androidx.graphics.shapes / * (Apache 2.0). See THIRD_PARTY_NOTICES.md.      (identical in morph.ts, polygon.ts, utils.ts :1-4)
    svgPath.ts:5   * - Port of androidx.graphics.shapes SvgPathParser.parseFeatures:      (no licence mention)
    THIRD_PARTY_NOTICES.md:48  The following runtime npm packages are bundled or linked in distributed builds.
    THIRD_PARTY_NOTICES.md:76-79  ### shape-morph / - **License:** MIT / - **Copyright:** Copyright (c) 2026 Thereallo / - **Source:** https://github.com/Thereallo1026/shape-morph (commit f4d2697)
    THIRD_PARTY_NOTICES.md:82,85  - **License:** Apache 2.0 … - **License text:** https://www.apache.org/licenses/LICENSE-2.0      (MIT permission text reproduced nowhere; Apache text by URL only)
    package.json:35-39  "files": [ "dist", "skills", "bin" ],
    package.json:83-85  "@radix-ui/react-popover" / "@radix-ui/react-progress" / "@radix-ui/react-slider"   (absent from the :51-63 table)
    LICENSE.txt:1-3  MIT License / / Copyright (c) 2026 Dooph LLC      (the only licence file in the tarball, pack.txt:4)
    Claims register: C-NOTICES-2 FALSE (3 of 14 runtime packages missing).
- impact: Every published tarball redistributes the ported engine (shape-morph MIT, itself derived from AOSP androidx under Apache 2.0) in `dist/` chunks with no copyright notice, no MIT permission notice and no Apache licence copy. MIT requires the copyright and permission notice in "all copies or substantial portions", and Apache 2.0 §4 requires recipients to get a copy of the licence. The source headers point readers to THIRD_PARTY_NOTICES.md, a file consumers never receive. Even that file does not reproduce the MIT text, so adding it to `files` as it stands would not cure the gap. This is a compliance defect with no functional breakage, carried by every downstream app that bundles the package. The three Radix packages missing from the notice table are external dependencies that install with their own licences, so that part is only an inaccuracy (S4).
- recommendation: Ship the notices with the package. Put the full shape-morph MIT notice (copyright + permission text) and the Apache 2.0 licence text, or a shipped copy of it, into THIRD_PARTY_NOTICES.md, add the file to `files`, and add the three missing Radix rows. Give engine/svgPath.ts the same provenance line as its siblings. Do not rely on comments surviving in `dist` (esbuild drops them; V1).
- breaking: none
- contract: src/components/MorphRotationShape/engine/{cubic,morph,polygon,utils}.ts "Keep this file a faithful port. Behaviour fixes belong in ../svgPath.ts …" → consistent (the recommendation touches no engine code; svgPath.ts gains a provenance comment line only, outside its `## constraints`)
- remediation: [WI-C1-06]
- related: []

### F-057: init-skills exits 0 having installed nothing when stdin is not interactive
- severity: S2
- category: build-packaging
- rules: []
- scope: consumer-visible
- confidence: confirmed
- verified_by: "U2: `node bin/init.mjs < /dev/null; echo exit=$?` in an empty dir → banner + first prompt, exit=0, dir empty. V3 ran it four ways: `< /dev/null`, `printf 'y\ny\ny\n' |` and `yes | head -20 |` all exit 0 with nothing installed; only answers fed one per second install (.agent .agents .claude created). No process.argv read anywhere in the file."
- locations:
  - bin/init.mjs:40-42
  - bin/init.mjs:103-114
  - bin/init.mjs:123-130
  - README.md:17-21
  - README.md:50-58
- evidence: |
    init.mjs:40     const rl = createInterface({ input: process.stdin, output: process.stdout });
    init.mjs:41-42  const ask = (q) => / new Promise((res) => rl.question(q, (ans) => res(ans.trim())));
    init.mjs:106-108  const ans = await ask( / `  ${target.label}${existsNote}\n  ${dim("[Y/n]:")} `, / );
    init.mjs:127      await cp(PKG_SKILLS, dest, { recursive: true, force: true });      (never reached off-TTY)
    README.md:17    _(optional, for agents)_
    README.md:55    npx @dooph-software/design-system init-skills
    README.md:58    This copies the bundled skills into the agent directories of your choice (`.agents/`, `.claude/`, `.agent/`). …
    V3 run (a): banner, "4 skill(s) available: …", `.agents/ … [Y/n]:` then exit=0; `ls -A | wc -l` → 0.
    Claims register: C-README-3 graded TRUE "interactively; no-op when stdin is not a TTY".
- impact: Each prompt is a `rl.question` promise, and nothing listens for readline's `close`. When stdin reaches EOF, or readline has already consumed buffered piped lines before the next question is registered, the pending promise never settles. The event loop drains and Node exits 0 before the copy step, with no message. Any non-TTY run — an agent's shell tool, CI, a scripted setup, or the obvious workaround `yes | npx … init-skills` — therefore reports success and installs nothing, and there is no flag for non-interactive use. The README pitches the skills at agents (":17 for agents"), and :52 has the human run the command, so the interactive path works. The silent success is the defect: a setup script cannot tell the skills are missing.
- recommendation: Never exit 0 without either copying or saying why. Handle readline `close`/EOF by applying the documented default (Enter = install), read buffered answers from one line queue instead of per-prompt `question()` calls, and add an explicit non-interactive flag (e.g. `--yes`, optionally `--dir <path>`) documented next to README.md:55.
- breaking: none
- contract: n/a
- remediation: [WI-C1-07]
- related: []

### F-064: Barrel shape is split three ways; three folders have no index.ts and src/index.ts deep-imports them
- severity: S3
- category: inconsistency
- rules: [R8.3, R8.19]
- scope: internal
- confidence: confirmed
- verified_by: "U2/U9: `for d in src/components/*/; do [ -f $d/index.ts ] || echo $d; done` → LoadingSpinner, ProgressIndicator, WavyDivider. V3 (DOWNGRADE S3): same loop; 7 of 39 folder indexes are `export *`-only, 32 named-only; 23 cross-folder deep imports repo-wide, of which only 3 are forced by the missing indexes; the three files export only their component + *Props today."
- locations:
  - src/index.ts:37-43
  - src/components/AIChat/AIContextGauge.tsx:25
  - src/components/AIChat/ChatDivider.tsx:17
  - src/components/ProgressIndicator/ProgressIndicator.tsx:11-15
  - src/components/LoadingSpinner/spinnerGeometry.ts:2
  - src/components/Modal/index.ts:1
  - src/components/OutlineButton/index.ts:1
  - src/components/OutlineSection/index.ts:1
  - src/components/SearchBox/index.ts:1
  - src/components/ShapeButton/index.ts:1-2
  - src/components/Sheet/index.ts:1-2
  - src/components/Shapes/index.ts:1-13
  - .agents/skills/dooph-ds-contribution/SKILL.md:32
  - .agents/skills/dooph-ds-codebase/SKILL.md:618
  - .agents/skills/dooph-ds-codebase/SKILL.md:644-645
- evidence: |
    src/index.ts:37  export * from './components/WavyDivider/WavyDivider';
    src/index.ts:39  export * from './components/LoadingSpinner/LoadingSpinner';
    src/index.ts:41  export * from './components/ShapeMorphSpinner';          (a sibling in the same family, through its folder index)
    src/index.ts:42  export * from './components/ProgressIndicator/ProgressIndicator';
    Deep imports forced by the missing indexes:
    AIContextGauge.tsx:25   } from "../ProgressIndicator/ProgressIndicator";
    ChatDivider.tsx:17      import { WavyDivider } from "../WavyDivider/WavyDivider";
    ProgressIndicator.tsx:15  } from "../LoadingSpinner/spinnerGeometry";
    spinnerGeometry.ts:2    * Shared geometry constants and helpers for LoadingSpinner and ProgressIndicator.
    Folder index shapes: Modal/index.ts:1 `export * from './Modal';` (also OutlineButton, OutlineSection, SearchBox, ShapeButton, Sheet, Shapes) vs Button/index.ts `export { Button, buttonVariants } from './Button';` (32 named-only)
    contribution SKILL.md:32  index.ts                ← re-exports everything public from MyComponent.tsx
    codebase SKILL.md:618     - Components and their `*Props` types come from the component's `index.ts`.
    codebase SKILL.md:644     - Adding a component means: component + consts + types in the folder `index.ts`,
    Claims register: C-CB-223 FALSE.
- impact: A contributor adding a component cannot tell which barrel shape to copy. The three index-less folders skip R8.3, so src/index.ts has to know their internal file names, and three siblings reach them by deep paths. ProgressIndicator depends on LoadingSpinner's folder layout for geometry that both share. With `export *` straight from a component file, or from the 7 `export *` folder indexes, any export added to that file becomes public API with no review gate; that is how internal helpers already leak elsewhere (F-087). Nothing leaks from these three files today, and deep sibling imports are a repo-wide habit (23), not a trait of this family, so the cost is maintainability, not consumer-visible.
- recommendation: Give LoadingSpinner, ProgressIndicator and WavyDivider an `index.ts` with named re-exports, point src/index.ts at the folder, and switch the two deep imports of public components (AIContextGauge, ChatDivider) to the folder index. ProgressIndicator's import of the internal `spinnerGeometry` stays a module path, because routing it through an index would publish it. Record named re-exports as the one folder-index form, so each index is the reviewed list of public names. Converting the 7 `export *` indexes is a public-surface decision that belongs with D-15 (F-087).
- breaking: none
- contract: n/a
- remediation: [WI-C1-08]
- related: [F-087, F-099]

### F-075: 74 modules keep vestigial default exports, and FiltersSlidersIcon's default exports ArrowUpLeftIcon
- severity: S3
- category: dead-code
- rules: []
- scope: internal
- confidence: plausible: S3 outside the Phase-4 verification sample; facts re-checked independently by U2 (rg count) and U10 (verify-icons.mjs over all 88 icon leaves), and re-counted by C1 at b436647 (`grep -rln '^export default' src` non-stories → 74 = 72 icon leaves + BaseShape + SidebarWithHoverIcon)
- verified_by: "U2: rg 'export default' + default-import scan (FiltersSlidersIcon.tsx:1, DropdownMenu.tsx:35 only); U10: verify-icons.mjs → FiltersSlidersIcon `default export: ArrowUpLeftIcon <-- MISMATCH`, 6 file shapes; C1 recount: 74 files, 72 of 88 icon leaves; a wider default-import grep (`^import X,` as well as `^import X from`) finds 14: FiltersSlidersIcon.tsx:1, Icons.stories.tsx:4, DropdownMenu.tsx:35 and 11 Shapes/*Shape.tsx:1 that default-import BaseShape (the units' scan missed the `import X, { … }` form)."
- locations:
  - src/components/Icons/FiltersSlidersIcon.tsx:1
  - src/components/Icons/FiltersSlidersIcon.tsx:4
  - src/components/Icons/FiltersSlidersIcon.tsx:20
  - src/components/Menu/DropdownMenu.tsx:35
  - src/components/Icons/Icons.stories.tsx:4
  - src/components/Shapes/BaseShape.tsx:70
  - src/components/Shapes/ArrowShape.tsx:1 (and :1 of CapsuleShape, CloverShape, CookieShape, DiamondShape, DoubleShape, PixircleShape, PuffShape, SquircleShape, StarShape, TripleShape)
  - src/components/SidebarWithHoverIcon/SidebarWithHoverIcon.tsx:150
  - src/components/Icons/*Icon.tsx (72 leaves; last line `export default <Name>;`)
  - package.json:20-28
- evidence: |
    FiltersSlidersIcon.tsx:1   import ArrowUpLeftIcon from "./ArrowUpLeftIcon";
    FiltersSlidersIcon.tsx:4   export const FiltersSlidersIcon = (props: IconProps) => {
    FiltersSlidersIcon.tsx:20  export default ArrowUpLeftIcon;
    DropdownMenu.tsx:35        import CheckIcon from "../Icons/CheckIcon";        (the only icon default import in non-story src besides the FiltersSliders copy-paste)
    Icons.stories.tsx:4        import CheckIcon from "./CheckIcon";
    BaseShape.tsx:70           export default BaseShape;
    ArrowShape.tsx:1           import BaseShape, { ShapeClipPath, ShapeProps } from "./BaseShape";      (11 of 12 shape leaves default-import BaseShape this way; BaseShape.tsx:51 also exports it by name)
    SidebarWithHoverIcon.tsx:150  export default SidebarWithHoverIcon;
    package.json `exports` maps only ".", "./styles.css", "./theme.css", and src/index.ts re-exports named bindings, so no default export is reachable by a consumer. 16 of 88 icon leaves already have no default (U10's "template B").
- impact: There are two export conventions for one kind of file, applied to 72 of 88 icons, so the next icon author has no single template. Nobody reads the defaults, as the FiltersSlidersIcon copy-paste shows: its default export is ArrowUpLeftIcon. The generator's filename check (R9.21, generate-icon-exports.mjs) inspects only the named const, so it cannot catch this. Any in-repo `import FiltersSlidersIcon from "../Icons/FiltersSlidersIcon"` — the form DropdownMenu.tsx:35 already uses for CheckIcon — would render an arrow with no type error. Nothing ships wrong today, because consumers only see the named exports. BaseShape's default is the one that is not vestigial: 11 sibling shape files import it, so it has to be switched, not just deleted.
- recommendation: Remove every `export default` from non-story src (72 icon leaves, BaseShape, SidebarWithHoverIcon). Switch the 14 default imports to named imports (DropdownMenu.tsx:35, Icons.stories.tsx:4, and the 11 `import BaseShape, { … }` lines in Shapes/). Drop FiltersSlidersIcon's stray import, and state "named export only" next to the icon filename rule in the contribution skill. Story files keep `export default meta` (Storybook CSF).
- breaking: none
- contract: src/components/SidebarWithHoverIcon/SidebarWithHoverIcon.tsx header (lines 1-39) says nothing about exports → consistent
- remediation: [WI-C1-09]
- related: [F-063]
- note-to-orchestrator: the map title says 73 modules; a recount at b436647 gives 74 (72 icon leaves, as U10 found, + BaseShape + SidebarWithHoverIcon; U2 counted 71 icons). The heading uses 74.

### F-077: build:css and copy-theme.mjs duplicate what tsup onSuccess does, and no build or release path calls them
- severity: S3
- category: dead-code
- rules: []
- scope: tooling
- confidence: plausible: S3 outside the Phase-4 verification sample; U1's rg re-run by C1 at b436647 (`build:css|copy-theme` outside node_modules/docs/audit → package.json:48-49, copy-theme.mjs:2, tsup.config.ts:8, codebase SKILL.md:112/594/599, and dated plan/report files that run it by hand)
- verified_by: "U1: rg → only package.json:48-49, scripts/copy-theme.mjs:2, tsup.config.ts:8 comment; `build` = generators + build:js; prepublishOnly = build. C1: same rg plus the docs; .github/workflows run only npm ci / build / build-storybook / publish (U2 ledger)."
- locations:
  - scripts/copy-theme.mjs:1-24
  - package.json:48-50
  - tsup.config.ts:7-23
  - tsup.config.ts:54-57
  - .agents/skills/dooph-ds-codebase/SKILL.md:112
  - .agents/skills/dooph-ds-codebase/SKILL.md:594
  - .agents/skills/dooph-ds-codebase/SKILL.md:599
- evidence: |
    package.json:48  "build:css": "tailwindcss -i src/styles/index.css -o dist/styles.css && npm run copy-theme",
    package.json:49  "copy-theme": "node scripts/copy-theme.mjs",
    package.json:50  "build": "npm run generate-icon-exports && npm run generate-shape-morph-ease && npm run sync-tokens && npm run build:js",
    tsup.config.ts:13     execSync('npx tailwindcss -i src/styles/index.css -o dist/styles.css', {
    tsup.config.ts:19-22  copyFileSync( / resolve(process.cwd(), 'src/styles/theme.css'), / resolve(process.cwd(), 'dist/theme.css'), / );
    copy-theme.mjs:23     copyFileSync(SRC, DEST);
    codebase SKILL.md:112  copy-theme.mjs              ← copies src/styles/theme.css → dist/theme.css (used by build:css; tsup onSuccess does the same)
    codebase SKILL.md:594  npm run build:css          → standalone: tailwindcss → dist/styles.css, then copy-theme → dist/theme.css (CSS-only rebuilds)
- impact: The CSS emit step has two implementations, and only the tsup one is on the build and publish path. They already differ in how they invoke Tailwind (`npx tailwindcss` vs the npm-script bin). A maintainer who changes one invocation (adds `--minify`, a new asset, a different input) will miss the other, so a CSS-only rebuild via `build:css`, which the codebase skill (:594, :599) recommends and dated plans use by hand, produces a sheet from a different code path than the one that ships. The skill already has to explain the duplication (:112). The script is not dead in the sense of unused by people, so deleting `build:css` outright would break a documented workflow.
- recommendation: Keep one emit implementation and call it from both places. Move the Tailwind compile + theme copy into a single script, have tsup's `onSuccess` and `build:css` both run it, and delete scripts/copy-theme.mjs and the `copy-theme` npm script.
- breaking: none
- contract: n/a
- remediation: [WI-C1-10]
- related: [F-099, F-119]

### F-078: waveGeometry.test.ts is the repo's only test and nothing runs it
- severity: S3
- category: dead-code
- rules: []
- scope: tooling
- confidence: plausible: S3 outside the Phase-4 verification sample; found independently by U2 and U9, and re-run by C1 at b436647 (`node --test "src/**/*.test.ts"` on Node v24.19.0 → 3 pass, 0 fail)
- verified_by: "U2: Grep '\"test\"|vitest|node --test' package.json → none; workflows run only npm ci / build / build-storybook / publish; node --test in the build copy → 3 pass. U9: git ls-files '*.test.*|*.spec.*' → this file only; tsconfig includes src so lint type-checks it. C1: same glob command in the repo → 3 pass."
- locations:
  - src/components/ProgressIndicator/waveGeometry.test.ts:1-6
  - src/components/ProgressIndicator/waveGeometry.test.ts:40-45
  - src/components/ProgressIndicator/waveGeometry.ts:135
  - package.json:40-56
  - tsconfig.json:17
  - tsup.config.ts:33
  - .github/workflows/release-package.yml:26
- evidence: |
    waveGeometry.test.ts:2   import test from "node:test";
    waveGeometry.test.ts:3-4 // Node's built-in strip-types runner requires the source extension; the package / // compiler intentionally does not enable allowImportingTsExtensions.
    waveGeometry.test.ts:5   // @ts-expect-error TS5097 -- required by the zero-dependency Node test command.
    waveGeometry.test.ts:41-43  const getWavyTrackGeometry = ( / waveGeometryModule as unknown as Record<string, unknown> / ).getWavyTrackGeometry;
    waveGeometry.test.ts:45  if (typeof getWavyTrackGeometry !== "function") return;
    waveGeometry.ts:135      export function getWavyTrackGeometry(      (now a plain export; the cast/early-return is TDD scaffolding)
    package.json:40-56       scripts: no "test" entry
    tsconfig.json:17         "include": ["src", "tsup.config.ts"],      (so `npm run lint` type-checks the test and needs the @ts-expect-error)
    tsup.config.ts:33        entry: ['src/**/*.{ts,tsx}', '!src/**/*.stories.tsx', '!src/**/*.test.{ts,tsx}'],      (correctly unshipped)
    release-package.yml:26   node-version: "22"
    Claims register: C-JSDOC-waveGeometry.test-1 FALSE ("the zero-dependency Node test command" exists nowhere).
- impact: The one regression test for the wavy-indicator geometry runs only if someone already knows the invocation; no script, CI job or skill names it, so a geometry regression it would catch ships unnoticed. Its `@ts-expect-error` and `as unknown as` cast justify themselves by a command the repo does not define, which leaves the next agent unsure whether the file is live or leftover, and puts a suppressed compiler error into type-checked source.
- recommendation: Decision D-18. Recommended: name the command that already works — `"test": "node --test \"src/**/*.test.ts\""` (no framework, zero dependencies) — mention it in the contribution skill's verification step, and drop the cast by importing `getWavyTrackGeometry` directly. Type stripping is unflagged from Node 22.18 / 23.6, so CI's Node "22" must resolve to ≥22.18. The alternative is to delete the file and its escape hatch. The rule against adding a test framework is respected either way.
- breaking: none
- contract: n/a
- remediation: decision D-18 (+ blocked WI-C1-11)
- related: [F-033]

### F-087: Undocumented internal helpers and cva recipes are public through folder barrels; formatTriggerLabel is a client reference
- severity: S3
- category: coupling
- rules: [R8.19, R1.6]
- scope: consumer-visible
- confidence: confirmed
- verified_by: "U2 exports.cjs (TS checker over the 443 root names) + rg of skills/README; U7/U3/U6/HA surface scans. V6 (PARTIAL): for every name `grep -c` in dist-index.d.ts = 1 and `grep -rlw` over skills/ + README = none; `head -c 40` of the chunk holding formatTriggerLabel = `\"use client\";`; corrections — Calendar/index.ts:20 comment is accurate, DateMatcher and TextStyleProps are legitimately public, the tabTriggerVariants export is deliberate (codebase SKILL.md:202), deep sibling imports are the majority mechanism (38)."
- locations:
  - src/components/Calendar/index.ts:20-22
  - src/components/DatePicker/index.ts:3
  - src/components/DatePicker/DatePickerTrigger.tsx:1
  - src/components/DatePicker/DatePickerTrigger.tsx:40
  - src/components/Text/index.ts:49
  - src/components/Text/textStyle.ts:37
  - src/components/Shapes/index.ts:1-13
  - src/components/Shapes/BaseShape.tsx:15
  - src/components/Shapes/BaseShape.tsx:22
  - src/components/Button/index.ts:1
  - src/components/Sticker/index.ts:1
  - src/components/Sticker/Sticker.tsx:44
  - src/components/Sticker/Sticker.tsx:104-109
  - src/components/Checkbox/index.ts:1
  - src/components/Tabs/index.ts:1
  - src/components/Tabs/Tabs.tsx:28
  - src/components/Menu/DropdownMenu.tsx:194
  - src/components/Calendar/CalendarPresetsPanel.tsx:5
  - .agents/skills/dooph-ds-codebase/SKILL.md:187-189
  - .agents/skills/dooph-ds-codebase/SKILL.md:202
  - CHANGELOG.md:16
- evidence: |
    Calendar/index.ts:20  // Re-exported for sibling components (DatePickerSplitTrigger) so nothing deep-imports.
    Calendar/index.ts:21  export { isSameDay, startOfDay } from "./dateUtils";
    Calendar/index.ts:22  export { formatRangeLabel, formatSingleLabel } from "./dateFormat";
    DatePicker/index.ts:3 export { DatePickerTrigger, formatTriggerLabel } from "./DatePickerTrigger";
    DatePickerTrigger.tsx:1 "use client";      DatePickerTrigger.tsx:40 export function formatTriggerLabel(
    Text/index.ts:49      export { serializeAxes } from "./textStyle";
    Shapes/index.ts:1     export * from "./ArrowShape";   (×13 — also publishes ShapeClipPath (BaseShape.tsx:22), SHAPE_VIEWBOX_SIZE (BaseShape.tsx:15) and 12 `*_SHAPE_PATH` strings)
    Button/index.ts:1     export { Button, buttonVariants } from './Button';
    Sticker/index.ts:1    export { Sticker, stickerVariants } from "./Sticker";
    Sticker.tsx:44        custom: "",      Sticker.tsx:104 if (variant === StickerVariant.custom && !color) {   (the R1.6 throw lives only in the component)
    Checkbox/index.ts:1   export { Checkbox, CheckboxIndicator, checkboxVariants } from './Checkbox';
    Tabs/index.ts:1       export { Tabs, TabsList, TabsTrigger, TabsContent, tabTriggerVariants } from './Tabs';
    DropdownMenu.tsx:194  * presets rail is 144px wide. Internal: not re-exported from src/index.ts.      (the opposite mechanism: CalendarPresetsPanel.tsx:5 deep-imports menuItemClassName)
    codebase SKILL.md:187-189  … are re-exported from `Calendar/index.ts` so `DatePicker` / never deep-imports a sibling.
    CHANGELOG.md:16       - Every `Shapes` component exports its outline as `<NAME>_SHAPE_PATH`.      (the only record of any of these names being intended)
    V6: each of isSameDay, startOfDay, formatRangeLabel, formatSingleLabel, formatTriggerLabel, serializeAxes, tabTriggerVariants, buttonVariants, stickerVariants, checkboxVariants, CheckboxIndicator, ShapeClipPath, SHAPE_VIEWBOX_SIZE → `dist=1 docs=[]`; all 12 `*_SHAPE_PATH` in dist-index.d.ts, 0 in skills/README.
- impact: Every folder index is both the sibling-sharing boundary and, through `export *` in src/index.ts, the public surface. So anything re-exported "so nothing deep-imports" becomes semver-committed API that no consumer document mentions, and most of it shipped in v5.3.0. Consumers can come to depend on the date helpers, the raw SVG path strings or the cva recipes, and removing any of them later is a breaking change nobody planned. Two of them misbehave when used directly. `formatTriggerLabel` lives in a `"use client"` module, so a Server Component that calls it gets a client reference and throws (F-027). `stickerVariants({ variant: "custom" })` returns a colourless class string, skipping the throw R1.6 requires. The next agent who shares a helper has two precedents with opposite public effects (barrel re-export vs module-path import).
- recommendation: Decision D-15, one verdict per name. Recommended split: document as public in the usage skill the names with a real consumer use or a recorded intent — `DateMatcher` and `TextStyleProps` (types of public props), `CheckboxIndicator` (Checkbox's `children` slot), `buttonVariants` (styling a link as a button), and the 12 `*_SHAPE_PATH` strings (CHANGELOG.md:16). Remove from the root in the next major the rest: `isSameDay`, `startOfDay`, `formatRangeLabel`, `formatSingleLabel`, `formatTriggerLabel`, `serializeAxes`, `stickerVariants`, `checkboxVariants`, `tabTriggerVariants`, `ShapeClipPath`, `SHAPE_VIEWBOX_SIZE`. Siblings then import them by module path, the mechanism menuItemClassName already uses, and folder indexes list only public names. Record that rule in the codebase skill. Removal is P4 with a migration-skill entry and no deprecation shim, per repo practice.
- breaking: major
- contract: src/components/Sticker/Sticker.tsx, src/components/Checkbox/Checkbox.tsx and src/components/Menu/DropdownMenu.tsx carry header contracts. The recommendation changes only which names their folder index re-exports, not the files' behaviour → consistent.
- remediation: decision D-15 (+ blocked WI-C1-12)
- related: [F-027, F-064, F-037, F-013]

### F-104: About 40% of the tarball is unreachable per-module stubs and maps, and every CJS sourcemap maps to itself
- severity: S3
- category: build-packaging
- rules: []
- scope: consumer-visible
- confidence: plausible: S3 outside the Phase-4 verification sample; U2's counts re-checked by C1 at b436647 against docs/audit/_work/pack.txt (2519 files; 1000 dist/chunk-*; 502 non-chunk .js/.cjs + 502 maps + 502 .d.ts) and the build copy's maps (dist/index.cjs.map and dist/components/Button/Button.cjs.map list only themselves, by absolute path)
- verified_by: "U2: pack.txt counts; dist/index.js imports chunks only (never ./components/**); scan of 501 .cjs.map → each has one source = the .cjs file itself; 212/501 ESM maps point at ../src. C1: same pack.txt greps; head -c of the two CJS maps above."
- locations:
  - tsup.config.ts:33
  - tsup.config.ts:46
  - package.json:20-28
  - package.json:35-39
  - scripts/add-use-client.mjs:108
- evidence: |
    tsup.config.ts:33  entry: ['src/**/*.{ts,tsx}', '!src/**/*.stories.tsx', '!src/**/*.test.{ts,tsx}'],
    tsup.config.ts:46  sourcemap: true,
    package.json:20-27 "exports": { ".": { "types": "./dist/index.d.ts", "import": "./dist/index.js", "require": "./dist/index.cjs" }, "./styles.css": "./dist/styles.css", "./theme.css": "./dist/theme.css" },   (no ./components/* or ./utils/* subpath)
    add-use-client.mjs:108  writeFileSync(full, `"${DIRECTIVE}";\n${contents}`);      (the paired .map is not shifted)
    pack.txt: total files 2519 · 1000 `dist/chunk-*` · 502 non-chunk .js/.cjs (500 per-module stubs + index.js/index.cjs) · 502 non-chunk maps · 502 .d.ts/.d.cts
    build copy dist/index.cjs.map:              {"version":3,"sources":["c:\Users\stick\Github\dooph\dooph-ds-audit-build\dist\index.cjs"],…
    build copy dist/components/Button/Button.cjs.map: {"version":3,"sources":["c:\Users\stick\…\dist\components\Button\Button.cjs"],…
- impact: (1) `exports` exposes only ".", so the 500 per-module `.js`/`.cjs` entry stubs (`dist/components/**`, `dist/utils/**`) and their 500 maps cannot be imported by a consumer, and nothing inside the package imports them either. They are ~40% of the 2519 packed files, inflating every install. Their esbuild-kept `"use client"` lines also make a spot check of `dist/components/Input/Input.js` look correct while the chunk that holds the code is unstamped (F-011). (2) CJS maps give `require` consumers no route back to source: a stack trace resolves to the same compiled file. They also embed the absolute path of whatever machine ran the build, the CI runner's for published versions. (3) The stamp prepends a line to 24+24 chunks without shifting their maps, so every mapping in those chunks is one line off. After F-011 that will be 40+40 chunks.
- recommendation: Keep the per-module entry glob, because the RSC stamp depends on one module per chunk, but stop publishing the unreachable stubs and their maps: negate them in package.json `files`, keeping `.d.ts`. Emit sourcemaps for ESM only, or fix the CJS map generation. Make the stamp shift the paired map by prefixing `;` to `mappings` when it prepends the directive.
- breaking: none
- contract: n/a
- remediation: [WI-C1-13]
- related: [F-011]

### F-107: .storybook/preview.ts and 40 stories import @storybook/react, which is not a declared dependency
- severity: S3
- category: repo-hygiene
- rules: []
- scope: tooling
- confidence: plausible: S3 outside the Phase-4 verification sample; U2's counts re-checked by C1 at b436647 (`grep -rlE "from ['\"]@storybook/react['\"]" src --include=*.stories.tsx` → 40 files; 5 import `@storybook/react-vite`; package.json devDependencies lack `@storybook/react`)
- verified_by: "U2: rg import-source histogram over stories; package.json devDependencies; package-lock.json:3423 shows @storybook/react only as a dependency of @storybook/react-vite. C1: same counts; package-lock.json:3351 hoisted entry."
- locations:
  - .storybook/preview.ts:1
  - .storybook/main.ts:1
  - package.json:62-63
  - package.json:71
  - package-lock.json:3423
  - tsconfig.json:18
  - src/components/Calendar/Calendar.stories.tsx, DatePicker/DatePicker.stories.tsx, Icons/Icons.stories.tsx, Popover/Popover.stories.tsx, Shapes/Shapes.stories.tsx (the 5 using @storybook/react-vite)
- evidence: |
    .storybook/preview.ts:1  import type { Preview } from '@storybook/react';
    .storybook/main.ts:1     import type { StorybookConfig } from '@storybook/react-vite';
    package.json:62-63       "@storybook/addon-docs": "^10.5.10", / "@storybook/react-vite": "^10.5.10",
    package.json:71          "storybook": "^10.5.10",      (no "@storybook/react" anywhere in package.json)
    package-lock.json:3423   "@storybook/react": "10.5.10",      (inside node_modules/@storybook/react-vite's dependencies; hoisted to node_modules/@storybook/react at :3351)
    tsconfig.json:18         "exclude": ["node_modules", "dist", ".storybook"]      (so `npm run lint` never type-checks preview.ts/main.ts)
    stories import histogram: 40 × "@storybook/react", 5 × "@storybook/react-vite", 1 × "@storybook/addon-docs/blocks"
- impact: The story and preview type imports resolve only because npm hoists a transitive package. A stricter installer (pnpm without hoisting), a dedupe change, or a future `@storybook/react-vite` that stops depending on the renderer package would break all 40 stories' type checking (they are inside `npm run lint`'s `src`) and the preview config at once. Contributors and agents see two import sources for `Meta`/`StoryObj` with nothing saying which is canonical, so new stories keep splitting.
- recommendation: Use the declared framework package everywhere: import `Meta`/`StoryObj`/`Preview` from `@storybook/react-vite` in the 40 stories and .storybook/preview.ts (it re-exports the renderer types), or declare `@storybook/react` explicitly. Prefer the first; it adds no dependency.
- breaking: none
- contract: n/a
- remediation: [WI-C1-14]
- related: [F-105]

### F-119: S4 batch: tooling nits
- severity: S4
- category: repo-hygiene
- rules: [R11.12]
- scope: tooling
- confidence: plausible: S4 batch, outside the Phase-4 verification sample; each item re-read by C1 at b436647 (lines below), `git remote -v` → `dooph.-Design-System`, Grep 'Plex' over src/skills/.agents → 0
- verified_by: "U2: read of each file; Grep 'Plex' repo-wide → only .storybook/preview-head.html; .git/config remote; Grep resolveDsColor → Slider, LinearProgressIndicator, Sticker, AIModelSelect. C1: same reads and greps."
- locations:
  - .github/workflows/release-package.yml:43
  - .github/workflows/release-package.yml:45
  - .github/workflows/release-package.yml:35-36
  - package.json:55
  - .storybook/preview-head.html:10
  - scripts/generate-icon-exports.mjs:39-40
  - package.json:51
  - src/utils/color.ts:1-2
  - .agents/skills/dooph-ds-codebase/SKILL.md:29-32
  - .agents/skills/dooph-ds-architecture/SKILL.md:78
- evidence: |
    (a) release-package.yml:45  # For the very first publish, use the TOKEN FALLBACK below, then switch here.   (no fallback step exists; the file ends at :48)
        release-package.yml:43  #   → Org: dooph-software  Repo: dooph-Design-System  Workflow: release-package.yml   (`git remote -v` → https://github.com/dooph-software/dooph.-Design-System.git)
    (b) release-package.yml:35-36  - name: Build / run: npm run build   then :47 `npm publish --access public` → package.json:55 "prepublishOnly": "npm run build"   (the full build, generators included, runs twice per release)
    (c) preview-head.html:10  …&family=IBM+Plex+Sans:ital,wght@…   (no token, story or skill names IBM Plex)
    (d) generate-icon-exports.mjs:39-40  '// This file is generated by scripts/generate-icon-exports.mjs.', / '// Run `npm run generate-icon-exports` after adding or removing icon files.',   (R11.12 wording "AUTO-GENERATED by <script>. Do not edit by hand." is what theme.css:4 uses)
    (e) package.json:51  "build:watch": "tsup --watch",   vs :47 build:js `node --max-old-space-size=8192 node_modules/tsup/dist/cli-default.js` and :50 build running the three generators first
    (f) color.ts:1-2  /* Shared color resolution for components that take a free-form `color` prop / * (Slider, LinearProgressIndicator).   (also Sticker.tsx:28 and AIModelSelect.tsx:28; codebase SKILL.md:29-32 and arch:78 give the same two-component list)
    (U2-F12's item "build:css duplicates tsup onSuccess" is F-077 and is not repeated here.)
    Claims register: C-JSDOC-release-package-1, C-JSDOC-release-package-2 FALSE; C-JSDOC-color-1 STALE.
- impact: Each item misleads or costs a little. (a) sends a maintainer looking for a fallback that does not exist and gives the wrong repository name for the trusted-publisher form, which must match exactly. (b) doubles release CI time. (c) makes every Storybook load download an unused font family. (d) weakens the do-not-edit signal on a generated file that the contribution skill says never to hand-edit. (e) watch builds skip the generators and the memory flag the real build relies on. (f) under-reports the colour util's blast radius to the next editor.
- recommendation: Fix the two workflow comments, drop the redundant CI build step (prepublishOnly already builds), remove the IBM Plex request, use the R11.12 header wording in the icon generator, align `build:watch` with `build:js`, and list all four `resolveDsColor` consumers in color.ts and the two skills.
- breaking: none
- contract: n/a
- remediation: [WI-C1-15]
- related: [F-077, F-032, F-053]

## DONE
