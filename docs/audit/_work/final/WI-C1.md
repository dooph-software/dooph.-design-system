# WI-C1 — draft work items (composer C1) @ b436647

Scratch tools referenced below live in the main checkout at `docs/audit/_work/scratch/C1/` (and `scratch/V1/` for the RSC approximation). A "scratch worktree" means: `git worktree add ../dooph-ds-wi-<nn> HEAD`, then in it `npm ci && npm run build`. The worktree is removed afterwards and nothing is committed by the agent.

### WI-C1-01: Make add-use-client.mjs read the directive prologue instead of the first 5 lines
- status: todo
- addresses: [F-011]
- depends_on: []
- phase: P3
- risk: medium — 16 more modules become client references in dist. For the 12 that need it this is the fix. For the 4 hook-free ones (Button, Checkbox, ShapeButton, CodeDigitInput) it makes `buttonVariants`/`checkboxVariants` client references, so a Server Component that calls them (undocumented, F-087) would start to throw. Ship WI-C1-05 first if D-05 is decided by then, otherwise call this out in the release note. ShapeMorphSpinner/DropdownCaret keep failing in RSC (now at Flight serialization instead of hooks) until WI-C1-02.
- semver: patch
- files:
  - modify: `scripts/add-use-client.mjs:10-17 @ b436647`
  - modify: `scripts/add-use-client.mjs:36-50 @ b436647`
  - modify: `scripts/add-use-client.mjs:53-65 @ b436647`
- anchor:
  ```js
  /** True if a source file declares the directive within its prologue. */
  function hasDirective(contents) {
    // Inspect the first handful of non-empty lines; the directive must precede
    // imports, but allow a leading BOM/comment-free blank prologue.
    const lines = contents.split('\n').slice(0, 5);
    return lines.some((line) => {
      const t = line.trim();
      return (
        t === `"${DIRECTIVE}";` ||
        t === `'${DIRECTIVE}';` ||
        t === `"${DIRECTIVE}"` ||
        t === `'${DIRECTIVE}'`
      );
    });
  }
  ```
- why: R11.9 puts every header contract above `"use client"`, so the 5-line window silently drops 16 client modules from the stamp. 12 of them then fail in React Server Components, and the root import throws `createContext is not a function`, the error README.md:44 promises cannot happen. The fix is in the script. R11.9 stays exactly as it is, and this change does not conflict with it.
- steps:
  - [ ] 1. Reproduce (fails before the fix). In a scratch worktree at the current HEAD: `npm ci && npm run build`. Observe the build log line `[add-use-client] stamped "use client" on 48 output chunk(s) from 24 client source module(s).` Then from the main checkout run:
    - `node docs/audit/_work/scratch/C1/prologue-scan.mjs` (cwd = the worktree root, so `src` resolves there). Expected: `src modules with a "use client" line (non-story): 40`, `detected by shipped 5-line window: 24`, and the 16 missed files listed.
    - `node <main>/docs/audit/_work/scratch/C1/dist-stamp-check.mjs <worktree>`. Expected: `ESM: 24/40 … unstamped: 16`, `CJS: 24/40 … unstamped: 16`, `FAIL` (exit 1).
    - `NODE_ENV=production node --conditions=react-server --import <main>/docs/audit/_work/scratch/V1/rsc-register2.mjs <main>/docs/audit/_work/scratch/V1/rsc-root.mjs <worktree>/dist/index.js`. Expected: `root import FAIL TypeError: createContext is not a function`.
  - [ ] 2. Replace `hasDirective` (`scripts/add-use-client.mjs:36-50`) with a prologue reader:
    ```js
    /** String-literal statements at the top of a module (its directive prologue),
     *  after a BOM, whitespace and comments — the same rule a JS parser applies. */
    function prologueDirectives(contents) {
      const src = contents.replace(/^﻿/, '');
      const found = [];
      let i = 0;
      for (;;) {
        const ws = /\s*/y;
        ws.lastIndex = i;
        ws.exec(src);
        i = ws.lastIndex;
        if (src.startsWith('//', i)) {
          const nl = src.indexOf('\n', i);
          i = nl === -1 ? src.length : nl + 1;
          continue;
        }
        if (src.startsWith('/*', i)) {
          const end = src.indexOf('*/', i + 2);
          if (end === -1) return found;
          i = end + 2;
          continue;
        }
        const lit = /(["'])([^"'\\\n]*)\1[ \t]*;?/y;
        lit.lastIndex = i;
        const m = lit.exec(src);
        if (!m) return found;
        found.push(m[2]);
        i = lit.lastIndex;
      }
    }

    /** True if a source file declares the directive in its prologue. */
    function hasDirective(contents) {
      return prologueDirectives(contents).includes(DIRECTIVE);
    }

    /** A `"use client"` line anywhere in the file (used to catch misplaced directives). */
    const DIRECTIVE_LINE = /^\s*(["'])use client\1;?\s*$/m;
    ```
  - [ ] 3. Make a misplaced directive fail the build. In `collectClientSources` (`:53-65`), replace the `else if` body:
    ```js
    // before
    } else if (/\.(ts|tsx|js|jsx)$/.test(entry)) {
      if (hasDirective(readFileSync(full, 'utf8'))) {
        acc.add(toPosix(path.relative(cwd, full)));
      }
    }
    // after
    } else if (/\.(ts|tsx|js|jsx)$/.test(entry)) {
      const contents = readFileSync(full, 'utf8');
      if (hasDirective(contents)) {
        acc.add(toPosix(path.relative(cwd, full)));
      } else if (DIRECTIVE_LINE.test(contents)) {
        throw new Error(
          `[add-use-client] ${toPosix(path.relative(cwd, full))} has a "use client" line outside its directive prologue (only comments may precede it).`,
        );
      }
    }
    ```
  - [ ] 4. Update the script's own description so it states the new rule. At `scripts/add-use-client.mjs:11-12`, replace `// 1. Scan src/ for modules whose first lines carry a "use client" directive` / `//    (the source of truth — kept in lockstep with the component files).` with `// 1. Scan src/ for modules whose directive prologue (after any header comment,` / `//    which R11.9 puts first) carries "use client". A "use client" line anywhere` / `//    else fails the build.` No other doc changes are needed. README.md:30-48, codebase SKILL.md:627-629 ("still a valid directive prologue") and :635-636 ("stamps dist chunks purely from source directives") and tsup.config.ts:26-32 become true as written; recheck them in step 5. The codebase skill's build-pipeline omission of this script belongs to F-099.
  - [ ] 5. Verify in a fresh scratch worktree with the change applied (`npm ci && npm run build`):
    - `npm run lint` → exit 0.
    - Build log: `[add-use-client] stamped "use client" on 80 output chunk(s) from 40 client source module(s).` If WI-C1-05 landed first, it reads `2N` chunks from `N` modules, where N is the first line of `prologue-scan.mjs` output.
    - `node <main>/docs/audit/_work/scratch/C1/dist-stamp-check.mjs <worktree>` → `ESM: 40/40 …; unstamped: 0; no chunk found: 0`, `CJS: 40/40 …`, `PASS` (exit 0). Same N rule as above.
    - `NODE_ENV=production node --conditions=react-server --import <main>/docs/audit/_work/scratch/V1/rsc-register2.mjs <main>/docs/audit/_work/scratch/V1/rsc-root.mjs <worktree>/dist/index.js` → `root import OK; exports: …`.
    - Guard check: temporarily add `import "x";` above the directive in a copy of `src/components/Input/Input.tsx` inside the worktree, run `node scripts/add-use-client.mjs` after a build → throws naming that file. Revert the copy.
    - `git -C <worktree> status --porcelain` → only `scripts/add-use-client.mjs` modified (no generated drift).
  - [ ] 6. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: `dist-stamp-check.mjs` prints `PASS` with `40/40` (or N/N) for ESM and CJS on a fresh build; the build log's client-module count equals `prologue-scan.mjs`'s first-line count; the react-server root import of dist/index.js succeeds; `rg -n "slice\(0, 5\)" scripts/add-use-client.mjs` → no match.
- log:
  - 2026-10-01 — created by audit

### WI-C1-02: Let MorphRotationShape take Shapes keys, and have ShapeMorphSpinner and DropdownCaret pass keys
- status: todo
- addresses: [F-012]
- depends_on: []
- phase: P3
- risk: low — `shapes` widens additively (components still accepted), so existing callers compile unchanged. The drawn output is unchanged because the same path strings reach the engine (SSR hashes are compared in step 7). A string compares by value where a component compared by identity, so an inline key-array literal no longer remounts the inner component on every render; that only removes spurious remounts.
- semver: minor
- files:
  - modify: `src/components/Shapes/shapePaths.ts:1-41 @ b436647`
  - modify: `src/components/MorphRotationShape/MorphRotationShape.tsx:86-92,130-163 @ b436647`
  - modify: `src/components/ShapeMorphSpinner/ShapeMorphSpinner.tsx:7-31,42-50 @ b436647`
  - modify: `src/components/DropdownCaret/DropdownCaret.tsx:25-37 @ b436647`
  - modify: `src/components/MorphRotationShape/MorphRotationShape.stories.tsx:59-76 @ b436647` (add one story after `RestingAngle`)
  - modify: `skills/dooph-design-system-usage/SKILL.md:209-210 @ b436647`
  - modify: `.agents/skills/dooph-ds-loading-indicators/SKILL.md:246-250 @ b436647`, plus the same section of the real-directory copy `.claude/skills/dooph-ds-loading-indicators/SKILL.md` until D-10 settles mirroring
  - modify: `CHANGELOG.md:12-18 @ b436647` ([Unreleased] → Added)
- anchor:
  ```tsx
  // src/components/DropdownCaret/DropdownCaret.tsx:25-37
  import type { ComponentType } from "react";
  import { cn } from "../../utils/cn";
  import { ChevronDownIcon, IconSize } from "../Icons";
  import { MorphRotationShape, MorphRotationShapeMode } from "../MorphRotationShape";
  import { CloverShape, PixircleShape, PuffShape, SquircleShape } from "../Shapes";
  import type { ShapeProps } from "../Shapes/BaseShape";
  import { DropdownCaretVariant } from "./constants";

  /** [closed, open] per variant. Module-level so the array identity is stable. */
  const CARET_SHAPES = {
    dropdown: [SquircleShape, PixircleShape],
    typeable: [CloverShape, PuffShape],
  } satisfies Record<DropdownCaretVariant, ComponentType<ShapeProps>[]>;
  ```
- why: Both neutral modules hand plain function components to the client MorphRotationShape. React Flight cannot serialize those, so both public components fail in RSC even after WI-C1-01. MorphRotationShape only ever turns a shape into its path string (`getShapePath`), so a serialisable key carries the same information.
- steps:
  - [ ] 1. Reproduce (fails before the fix): `node docs/audit/_work/scratch/C1/shapes-serializable.mjs ../dooph-ds-audit-build/dist` (or a scratch-worktree build of HEAD) → three `FAIL … function CookieShape …` lines and `FAILURES: 3`. Note the three `SSR … sha1=` values. At b436647 they are ShapeMorphSpinner `d5aef932fc2c`, DropdownCaret `28ba2db06d6e` and DropdownCaret typeable `253074aea2c3`.
  - [ ] 2. `src/components/Shapes/shapePaths.ts`: replace the component-keyed `SHAPE_PATHS` map (`:16-31`) with one table and its lookups, and widen `getShapePath` (`:33-41`). Import the `Shapes` const from `./index`, where it is declared at b436647 (`Shapes/index.ts:15`). If the F-065 work item has moved it to `Shapes/constants.ts`, import from there instead. index.ts does not import shapePaths, so there is no cycle.
    ```ts
    import { Shapes } from "./index";

    /** A DS shape as MorphRotationShape accepts it: the component, or its `Shapes` key
     * (the serialisable form a Server Component can pass to the client MorphRotationShape). */
    export type ShapeInput = ComponentType<ShapeProps> | Shapes;

    /** name, component, outline in the 24-unit viewBox — one row per DS shape. Lets
     * MorphRotationShape take components or keys without rendering them. */
    const SHAPE_TABLE: ReadonlyArray<readonly [Shapes, ComponentType<ShapeProps>, string]> = [
      [Shapes.arrow, ArrowShape, ARROW_SHAPE_PATH],
      [Shapes.capsule, CapsuleShape, CAPSULE_SHAPE_PATH],
      [Shapes.clover, CloverShape, CLOVER_SHAPE_PATH],
      [Shapes.cookie, CookieShape, COOKIE_SHAPE_PATH],
      [Shapes.diamond, DiamondShape, DIAMOND_SHAPE_PATH],
      [Shapes.double, DoubleShape, DOUBLE_SHAPE_PATH],
      [Shapes.pentagon, PentagonShape, PENTAGON_SHAPE_PATH],
      [Shapes.pixircle, PixircleShape, PIXIRCLE_SHAPE_PATH],
      [Shapes.puff, PuffShape, PUFF_SHAPE_PATH],
      [Shapes.squircle, SquircleShape, SQUIRCLE_SHAPE_PATH],
      [Shapes.star, StarShape, STAR_SHAPE_PATH],
      [Shapes.triple, TripleShape, TRIPLE_SHAPE_PATH],
    ];
    const PATH_BY_COMPONENT = new Map(SHAPE_TABLE.map(([, component, d]) => [component, d]));
    const PATH_BY_NAME = new Map<string, string>(SHAPE_TABLE.map(([name, , d]) => [name, d]));
    const COMPONENT_BY_NAME = new Map<string, ComponentType<ShapeProps>>(SHAPE_TABLE.map(([name, component]) => [name, component]));

    export function getShapePath(shape: ShapeInput): string {
      const d = typeof shape === "string" ? PATH_BY_NAME.get(shape) : PATH_BY_COMPONENT.get(shape);
      if (!d) {
        const label = typeof shape === "string" ? `"${shape}"` : shape.displayName || shape.name || "component";
        throw new Error(`${label} is not a DS shape; pass a component from Shapes/ or a Shapes key.`);
      }
      return d;
    }

    /** The component for a `Shapes` key (lets one key list also serve as a component list). */
    export function getShapeComponent(name: Shapes): ComponentType<ShapeProps> {
      const component = COMPONENT_BY_NAME.get(name);
      if (!component) throw new Error(`"${name}" is not a DS shape name.`);
      return component;
    }
    ```
  - [ ] 3. `src/components/MorphRotationShape/MorphRotationShape.tsx`:
    - Replace `type ShapeComponent = ComponentType<ShapeProps>;` (`:86`) with `ShapeInput`, imported by extending the `:67` import to `import { getShapePath, type ShapeInput } from "../Shapes/shapePaths";`. Drop the `ComponentType`/`ShapeProps` imports if nothing else uses them.
    - Rename `ShapeComponent` → `ShapeInput` at `:91` (`shapes: ShapeInput[];`), `:130` (`new Map<ShapeInput, ShapeData>()`), `:131-134` (`function shapeData(shape: ShapeInput)` … `getShapePath(shape)`) and `:156` (`useShapesKey(shapes: ShapeInput[])`).
    - JSDoc at `:90` → `/** DS shapes in play order: components (`[CloverShape, PuffShape]`) or `Shapes` keys (`[Shapes.clover, Shapes.puff]`, the form a Server Component can pass). At least two. */`.
    - Error at `:148` → ``"MorphRotationShape: `shapes` needs at least two DS shapes (components or Shapes keys)"``.
    - The header's `## constraints` line `:50-51` ("Changing `shapes` remounts the inner component (key)") stays true, so the header is unchanged.
  - [ ] 4. `src/components/ShapeMorphSpinner/ShapeMorphSpinner.tsx`:
    - Drop the six component imports (`:14-21`) and the `ShapeProps`/`ComponentType` imports if unused.
    - Keep `SHAPE_MORPH_SPINNER_SHAPES` exported with the same type and sequence, derived from one internal key list:
      ```tsx
      import { Shapes } from "../Shapes";
      import { getShapeComponent, type ShapeInput } from "../Shapes/shapePaths";

      /** Default loader sequence as `Shapes` keys (serialisable, so this module stays neutral). */
      const DEFAULT_SHAPE_KEYS: Shapes[] = [
        Shapes.cookie, Shapes.clover, Shapes.puff, Shapes.squircle, Shapes.pentagon, Shapes.capsule,
      ];
      /** Default loader sequence. */
      export const SHAPE_MORPH_SPINNER_SHAPES: ComponentType<ShapeProps>[] = DEFAULT_SHAPE_KEYS.map(getShapeComponent);
      ```
      (keep the `ComponentType`/`ShapeProps` type imports for this declaration)
    - Prop at `:42-43` → `/** DS shapes (components or `Shapes` keys), at least two. Keys are the form a Server Component can pass. */ shapes?: ShapeInput[];`.
    - Default at `:50` → `shapes = DEFAULT_SHAPE_KEYS,`.
  - [ ] 5. `src/components/DropdownCaret/DropdownCaret.tsx:25-37` →
    ```tsx
    import { cn } from "../../utils/cn";
    import { ChevronDownIcon, IconSize } from "../Icons";
    import { MorphRotationShape, MorphRotationShapeMode } from "../MorphRotationShape";
    import { Shapes } from "../Shapes";
    import { DropdownCaretVariant } from "./constants";

    /** [closed, open] per variant, as `Shapes` keys so this neutral module hands the client
     * MorphRotationShape only serialisable props. Module-level so the array identity is stable. */
    const CARET_SHAPES = {
      dropdown: [Shapes.squircle, Shapes.pixircle],
      typeable: [Shapes.clover, Shapes.puff],
    } satisfies Record<DropdownCaretVariant, Shapes[]>;
    ```
    The header (`:1-24`) is unchanged; constraint `:23` ("No state props and no listeners") still holds.
  - [ ] 6. Docs and story:
    - `MorphRotationShape.stories.tsx`: widen the demo's prop type at `:29` from `{ shapes: typeof CloverShape[]; … }` to `{ shapes: MorphRotationShapeProps["shapes"]; … }` (import the type from `"./MorphRotationShape"`). Then, after `RestingAngle` (`:69-71`), add `export const ShapeKeys: Story = { render: () => <ControlledDemo shapes={[Shapes.clover, Shapes.puff, Shapes.squircle]} /> };` and import `Shapes` from `"../Shapes"`.
    - usage SKILL.md:209: after "optional `shapes`" insert "(DS shape components or `Shapes` keys; pass keys from a Server Component)". At :210, in the MorphRotationShape entry, add "`shapes`: at least two DS shapes, as components or `Shapes.*` keys (keys are RSC-safe)".
    - loading-indicators SKILL.md, both copies, in the section that starts at :246: add the bullet "- **RSC:** MorphRotationShape is client. From neutral or server modules pass `shapes` as `Shapes` keys (ShapeMorphSpinner and DropdownCaret do); component functions cannot cross the server→client boundary."
    - CHANGELOG.md [Unreleased] → Added: "- `MorphRotationShape` / `ShapeMorphSpinner` `shapes` also accept `Shapes` keys (the RSC-safe form); `ShapeMorphSpinner` and `DropdownCaret` now pass keys."
  - [ ] 7. Verify in a scratch-worktree build:
    - `npm run lint` → exit 0.
    - `node <main>/docs/audit/_work/scratch/C1/shapes-serializable.mjs <worktree>/dist` → three `PASS` lines (`"cookie", "clover", …`; `"squircle", "pixircle"`; `"clover", "puff"`) and `ALL PASS`. The three `SSR … sha1=` values must equal step 1's (drawing unchanged).
    - If WI-C1-01 has landed: `node <main>/docs/audit/_work/scratch/C1/dist-stamp-check.mjs <worktree>` → `PASS`. MorphRotationShape is then a client reference that receives strings only.
    - Storybook (`npm run storybook`): MorphRotationShape › ShapeKeys morphs clover → puff → squircle on each step exactly like Controlled. ShapeMorphSpinner's default story and the DropdownTrigger stories (caret hover lean, open morph) look unchanged.
    - `rg -n "ComponentType<ShapeProps>" src/components/DropdownCaret/DropdownCaret.tsx` → no match.
  - [ ] 8. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: `shapes-serializable.mjs` exits 0 on a fresh build with SSR hashes equal to the pre-change build; `npm run lint` exits 0; usage SKILL.md, both loading-indicators SKILL.md copies and CHANGELOG [Unreleased] mention `Shapes` keys.
- log:
  - 2026-10-01 — created by audit

### WI-C1-03: Register every text-style role and the DS theme scales in cn, from one generated list, and ship that config to consumers
- status: todo
- addresses: [F-014, F-055]
- depends_on: []
- phase: P3
- risk: low — cn now merges DS-vs-stock conflicts, so internal class strings could in principle change. C1's SSR harness (scratch/C1/cn-hook.mjs + cn-render-diff.mjs; 441 renders of every root component × its variant/size consts plus menu/tooltip/tabs/table/calendar/toast/AI compositions) found 12 internal cn() calls whose result changes. In every one the dropped class already loses on stylesheet order (dist/styles.css: `.gap-1`:740 / `.gap-2`:743 < `.gap-xs`:776; `.px-3`:1115 < `.px-rg`:1127; `.shadow-button-secondary`:1448 < `.shadow-none`:1468), so nothing changes visually. The components are AIModelSelectTrigger (gap-2 px-3), Button size icon/icon-sm/icon-micro and CopyButton secondary (shadow-button-secondary), and SegmentedTabSelect (gap-1). Consumer overrides that silently did nothing (`className="rounded-full"`) now take effect, which is the fix.
- semver: minor
- files:
  - modify: `scripts/sync-theme.mjs:30-33 @ b436647` (output path constant)
  - modify: `scripts/sync-theme.mjs:230-246 @ b436647` (collect the four scales)
  - modify: `scripts/sync-theme.mjs:305-308 @ b436647` (write the new output, log line)
  - create: `src/utils/twMergeTheme.ts` (GENERATED by `npm run sync-tokens`; never written by hand)
  - modify: `src/utils/cn.ts:1-33 @ b436647`
  - modify: `src/index.ts:49-50 @ b436647`
  - modify: `skills/dooph-design-system-usage/SKILL.md:320-337 @ b436647`
  - modify: `.agents/skills/dooph-ds-codebase/SKILL.md:28 @ b436647`, `:111 @ b436647`
  - modify: `.agents/skills/dooph-ds-contribution/SKILL.md:96 @ b436647`, `:108 @ b436647`
  - modify: `CHANGELOG.md:10-22 @ b436647`
- anchor:
  ```ts
  // src/utils/cn.ts:14-29
  const twMerge = extendTailwindMerge<'text-style'>({
    extend: {
      classGroups: {
        'text-style': [
          'text-style-button',
          'text-style-body',
          'text-style-label',
          'text-style-title',
          'text-style-heading',
          'text-style-subheading',
          'text-style-hero',
          'text-style-mono',
        ],
      },
    },
  });
  ```
- why: The hand list has drifted twice: at v5.3.0 it held 6 of 8 roles, and at HEAD it holds 8 of 10. So `<HeroBodyText className="text-text-secondary">`, the usage skill's own idiom, renders with no role typography (F-014). No DS size, radius, spacing or shadow scale is registered either, so `className="text-body"` erases a Button's colour and `className="rounded-full"` cannot override `rounded-tight` (F-055). The skill's copy-paste replica is a third list that drifts too.
- steps:
  - [ ] 1. Reproduce (fails before the fix): `node docs/audit/_work/scratch/C1/cn-verify.mjs ../dooph-ds-audit-build/dist` (or a scratch-worktree build of HEAD) → 15 `FAIL` lines, among them `cn("text-style-hero-body", "text-text") -> "text-text"`, `<HeroBodyText className="text-text-secondary"> -> <span class="text-text-secondary">x</span>`, `cn("rounded-tight", "rounded-full") -> "rounded-tight rounded-full"` and `DS_TW_MERGE_CONFIG not exported`; ends `FAILURES: 15`.
  - [ ] 2. Generator, `scripts/sync-theme.mjs`:
    - After `:33` add `const TW_MERGE_THEME_PATH = resolve(__dirname, "../src/utils/twMergeTheme.ts");`.
    - After the `generated` block (`:238-246`) add:
      ```js
      // ── tailwind-merge theme scales (read by src/utils/cn.ts) ─────────────────────
      // Same entries as the @theme block, so cn() learns every DS size/radius/spacing/
      // shadow name the moment a token is added — the hand-kept list drifted twice.
      const twMergeTheme = { text: [], radius: [], spacing: [], shadow: [] };
      for (const line of [...entries, ...COMPUTED]) {
        const m = line.match(/^--(text|radius|spacing|shadow)-([a-z0-9]+(?:-[a-z0-9]+)*):/);
        if (m) twMergeTheme[m[1]].push(m[2]);
      }
      const twMergeThemeTs = [
        "// AUTO-GENERATED by scripts/sync-theme.mjs. Do not edit by hand.",
        "// DS theme scales for tailwind-merge, from the same tokens as the @theme block.",
        "export const DS_TW_MERGE_THEME: Record<\"text\" | \"radius\" | \"spacing\" | \"shadow\", string[]> = " +
          JSON.stringify(twMergeTheme, null, 2) + ";",
        "",
      ].join("\n");
      ```
    - After `writeFileSync(THEME_PRESET_PATH, themePreset, "utf8");` (`:305`) add `writeFileSync(TW_MERGE_THEME_PATH, twMergeThemeTs, "utf8");`, and change the log message (`:306-308`) to `` `✓  @theme inline regenerated — ${entries.length} tokens mapped (index.css + theme.css + utils/twMergeTheme.ts).` ``.
    - Extend the file's header comment (`:4-5`, "Generated output:") with `src/utils/twMergeTheme.ts (tailwind-merge scales for cn)`.
  - [ ] 3. Run `npm run sync-tokens`. Expected: `src/utils/twMergeTheme.ts` is created with text = `label, body, hero-body, hero-button, mono, subheading, heading, title, hero, cta-standard, cta-big` (11), radius = 9 names (`slider-inner … calendar-day`), spacing = 10 (`xxxs … xxl, sticker-y`) and shadow = 10 (`button … focus-primary, focus-danger`). `git diff --stat src/styles` → no change (index.css and theme.css are untouched by this edit).
  - [ ] 4. Replace `src/utils/cn.ts:14-33` (keep the `:4-13` doc comment and extend it with the second paragraph below):
    ```ts
    import { clsx, type ClassValue } from 'clsx';
    import {
      extendTailwindMerge,
      type ConfigExtension,
      type DefaultClassGroupIds,
      type DefaultThemeGroupIds,
    } from 'tailwind-merge';
    import { DS_TW_MERGE_THEME } from './twMergeTheme';

    /* (existing :4-13 text) …
     *
     * The DS theme scales (text sizes, radius, spacing, shadow) come from tokens via
     * DS_TW_MERGE_THEME, so `rounded-full` overrides `rounded-tight` and `text-body` is a
     * size, not a colour. Custom height/size utilities live in index.css @layer utilities
     * (`.h-button` … `.min-w-button`), so they are listed here by hand.
     */
    export const DS_TW_MERGE_CONFIG: ConfigExtension<DefaultClassGroupIds | 'text-style', DefaultThemeGroupIds> = {
      extend: {
        theme: DS_TW_MERGE_THEME,
        classGroups: {
          // Every text-style-* role class, present and future — no list to drift.
          'text-style': [{ 'text-style': [() => true] }],
          h: [{ h: ['button', 'button-sm', 'tab-micro', 'slider-track'] }],
          size: [{ size: ['button', 'button-sm', 'button-micro', 'checkbox', 'code-digit', 'tab-micro'] }],
          'min-h': [{ 'min-h': ['button'] }],
          'min-w': [{ 'min-w': ['button'] }],
        },
      },
    };

    const twMerge = extendTailwindMerge<'text-style'>(DS_TW_MERGE_CONFIG);

    export function cn(...inputs: ClassValue[]) {
      return twMerge(clsx(inputs));
    }
    ```
    The hand-listed custom utilities are exactly the `.h-*`/`.size-*`/`.min-h-*`/`.min-w-*` rules at `src/styles/index.css:322-365`. Re-check that range when editing and add any new one.
  - [ ] 5. `src/index.ts:50` → `export { cn, DS_TW_MERGE_CONFIG } from './utils/cn';`.
  - [ ] 6. Docs (all in this change):
    - usage SKILL.md:320-337 — keep the first sentence, then replace "registers a `text-style` conflict group … replicate the group:" and the snippet with: "It registers every `text-style-*` role and the DS size/radius/spacing/shadow scales with tailwind-merge, so `text-text` cannot erase a role class and `rounded-full` overrides `rounded-tight`. If your app keeps its own merge helper, build it from the package config instead of copying names:" followed by
      ```ts
      import { extendTailwindMerge } from "tailwind-merge";
      import { DS_TW_MERGE_CONFIG } from "@dooph-software/design-system";
      export const twMerge = extendTailwindMerge<"text-style">(DS_TW_MERGE_CONFIG);
      ```
    - codebase SKILL.md:28 → `utils/cn.ts ← clsx + tailwind-merge helper; DS_TW_MERGE_CONFIG = text-style group + DS scales`. Add after it `utils/twMergeTheme.ts ← GENERATED (sync-theme.mjs): DS theme scales for cn. Do not hand-edit.` At :111 append "and src/utils/twMergeTheme.ts" to the sync-theme.mjs line.
    - contribution SKILL.md:96 and :108 — "regenerates the `@theme inline` block in `index.css` AND the `theme.css` preset" → "… AND the `theme.css` preset AND `src/utils/twMergeTheme.ts` (cn's merge scales)".
    - CHANGELOG.md [Unreleased]: under Added, "- `DS_TW_MERGE_CONFIG`: the package's tailwind-merge config, for apps that keep their own merge helper." Add a `### Fixed` section with "- `cn` keeps every `text-style-*` role beside a colour class (HeroBodyText/HeroButtonText lost theirs) and merges DS size/radius/spacing/shadow classes with their Tailwind counterparts (`rounded-full` now overrides `rounded-tight`; `text-body` no longer erases a text colour)."
  - [ ] 7. Verify in a scratch-worktree build (`npm ci && npm run build`; the build runs sync-tokens):
    - `npm run lint` → exit 0.
    - `git -C <worktree> status --porcelain` after the build → only the files listed above (twMergeTheme.ts regenerated identically; no drift in index.css/theme.css/Icons/index.ts).
    - `node <main>/docs/audit/_work/scratch/C1/cn-verify.mjs <worktree>/dist` → every line `PASS` (10 roles kept beside `text-text`; `cn('rounded-tight','rounded-full')` → `"rounded-full"`; `cn(buttonVariants({variant: primary}), 'text-body')` keeps text-primary-fg; `<HeroBodyText className="text-text-secondary">` → `class="text-style-hero-body text-text-secondary"`), `INFO DS_TW_MERGE_CONFIG exported`, `ALL PASS`.
    - Regression scan: copy `<main>/docs/audit/_work/scratch/C1/cn-hook.mjs`, point its chunk regex at the worktree's cn chunk (`grep -l extendTailwindMerge <worktree>/dist/chunk-*.js`) and set its OLD config to the b436647 config. Run `NODE_ENV=production node --import <copy of cn-register.mjs> <main>/docs/audit/_work/scratch/C1/cn-render-diff.mjs` with `B` set to the worktree → the same 12 entries listed under risk, and no others.
    - Storybook: Button (icon sizes), CopyButton, SegmentedTabSelect, AIModelSelect trigger, Text › HeroBodyText with a colour className — unchanged except the HeroBody/HeroButton text, which now has its role typography.
  - [ ] 8. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: `cn-verify.mjs` prints `ALL PASS` on a fresh build; `rg -n "'text-style-hero'" src/utils/cn.ts` → no match (no hand list); `src/utils/twMergeTheme.ts` begins `// AUTO-GENERATED by scripts/sync-theme.mjs`; usage SKILL.md contains `DS_TW_MERGE_CONFIG` and no `"text-style-button", "text-style-body"` list.
- log:
  - 2026-10-01 — created by audit

### WI-C1-04: Generate container-width guards in the theme preset so max-w/w/min-w/basis keep Tailwind's container scale
- status: blocked(D-02)
- addresses: [F-015]
- depends_on: []
- phase: P3
- risk: low — the change adds 20 `@theme inline` keys (4 namespaces × the 5 colliding names). DS components use none of these utilities (U1: rg over src finds none), so dist/styles.css should not change (checked in step 5). For consumers, `max-w-md`/`w-lg`/`min-w-sm`/`basis-md` go back to Tailwind's meaning. An app that had adapted to the 8–28px remap would see those classes widen; that remap was never documented, so this is a bug fix. `inline-*`/`max-inline-*`/`min-inline-*` stay remapped (no dedicated namespace) and get documented instead.
- semver: patch
- files:
  - modify: `scripts/sync-theme.mjs:230-246 @ b436647`
  - modify (GENERATED via `npm run sync-tokens`): `src/styles/index.css` `__GENERATED_THEME_*__` block, `src/styles/theme.css`
  - modify: `skills/dooph-design-system-theming/references/token-contract.md:216-228 @ b436647`
  - modify: `README.md:185-192 @ b436647`
  - modify: `.agents/skills/dooph-ds-codebase/SKILL.md:519-521 @ b436647`
  - modify: `CHANGELOG.md:10-22 @ b436647`
- anchor:
  ```js
  // scripts/sync-theme.mjs:230-246
  const entries = vars.map(toThemeEntry).filter(Boolean);

  // Computed entries that can't be derived from token names alone
  const COMPUTED = [
    "/* Focus ring with danger */",
    "--shadow-focus-danger: 0 0 0 4px var(--ui-color-focus-ring-danger);",
  ];

  const generated = [
    GEN_START,
    "@theme inline {",
    ...entries.map((e) => `  ${e}`),
    "",
    ...COMPUTED.map((l) => `  ${l}`),
    "}",
    GEN_END,
  ].join("\n");
  ```
- why: Tailwind 4.3 resolves `max-w-*`, `w-*`, `min-w-*` and `basis-*` through `--max-width`/`--width`/`--min-width`/`--flex-basis`, then `--spacing`, then `--container`. The preset's `--spacing-xs…xl` therefore silently turns a consumer's container widths (20–36rem) into 8–28px. Dedicated keys pointing back at `--container-*` win the lookup (C1 compile, scratch/C1/tw/fixed.css) while `p-md`/`gap-sm` keep the DS scale. This is option A of D-02; options B and C (rename or drop the keys) are breaking and are not drafted.
- steps:
  - [ ] 1. Reproduce (fails before the fix). In a scratch worktree build of HEAD, copy `<main>/docs/audit/_work/scratch/C1/tw/{preset.css,content.html}` into a temp dir. In preset.css, point the `@import`s at `<worktree>/node_modules/tailwindcss/index.css` and `<worktree>/dist/theme.css`, then run `<worktree>/node_modules/.bin/tailwindcss -i preset.css -o out.css`. Check `awk '/\.max-w-md \{/{getline; print}' out.css` → `max-width: var(--ui-spacing-md);`; the same for `.w-md`, `.min-w-sm`, `.basis-md`.
  - [ ] 2. In `scripts/sync-theme.mjs`, between `COMPUTED` (`:233-236`) and `generated` (`:238`), add:
    ```js
    // Tailwind looks up max-w/w/min-w/basis in --max-width/--width/--min-width/
    // --flex-basis first, then --spacing, then --container. A DS spacing key that
    // shares a container name (xs…xl) would otherwise turn `max-w-md` into 16px in
    // every consumer build that imports theme.css. Point those namespaces back at
    // the container scale. inline-/max-inline-/min-inline- have no namespace of
    // their own and stay on DS spacing (documented in token-contract.md).
    const TAILWIND_CONTAINERS = ["3xs", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl", "5xl", "6xl", "7xl"];
    const CONTAINER_NAMESPACES = ["max-width", "width", "min-width", "flex-basis"];
    const CONTAINER_GUARDS = entries
      .map((e) => e.match(/^--spacing-([a-z0-9-]+):/)?.[1])
      .filter((name) => name && TAILWIND_CONTAINERS.includes(name))
      .flatMap((name) => CONTAINER_NAMESPACES.map((ns) => `--${ns}-${name}: var(--container-${name});`));
    ```
    and in `generated` add after `...COMPUTED.map((l) => \`  ${l}\`),`:
    ```js
      "",
      "  /* Keep Tailwind's container widths for max-w/w/min-w/basis (DS spacing shares xs…xl) */",
      ...CONTAINER_GUARDS.map((l) => `  ${l}`),
    ```
  - [ ] 3. Run `npm run sync-tokens`. Expected: index.css's generated block and theme.css each gain the comment plus 20 lines (`--max-width-xs: var(--container-xs);` … `--flex-basis-xl: var(--container-xl);`). Never hand-edit either file.
  - [ ] 4. Docs:
    - token-contract.md, after :228, add: "The preset changes these stock utilities: `p-*`, `m-*`, `gap-*`, `size-*`, `h-*`, `max-h-*` and the rest of the spacing family accept the DS names (`xxxs`…`xxl`, `rg`). `max-w-*`, `w-*`, `min-w-*` and `basis-*` keep Tailwind's container widths for `xs`–`xl` (the preset re-points them). The logical sizes `inline-{xs…xl}`, `max-inline-*` and `min-inline-*` resolve to DS spacing; use `max-w-*`/`w-*` or `max-inline-(--container-md)` when you need a container width there."
    - README.md after the import block at :189-192: "The preset maps DS spacing names onto Tailwind's spacing scale; container widths (`max-w-md` etc.) keep their Tailwind meaning — see token-contract.md for the full list."
    - codebase SKILL.md:521: append "It also emits `--max-width/--width/--min-width/--flex-basis-{xs…xl}: var(--container-*)` guards so the DS spacing names do not shadow Tailwind's container scale."
    - CHANGELOG [Unreleased] → `### Fixed`: "- Importing `theme.css` no longer remaps `max-w-*`/`w-*`/`min-w-*`/`basis-*` `xs`–`xl` from container widths to DS spacing."
  - [ ] 5. Verify in a scratch-worktree build:
    - `npm run lint` → exit 0.
    - `git -C <worktree> status --porcelain` → scripts/sync-theme.mjs, src/styles/index.css, src/styles/theme.css and the docs only.
    - Diff the worktree `dist/styles.css` against a build of HEAD: no utility rule differs. Only `--max-width-*`/`--width-*`/… theme variables may appear, and only if Tailwind emits unused theme variables; record which.
    - Repeat step 1 → `.max-w-md` `max-width: var(--container-md);`, `.w-md` `width: var(--container-md);`, `.min-w-sm` `var(--container-sm)`, `.basis-md` `var(--container-md)`, while `.p-md` stays `padding: var(--ui-spacing-md);` and `.gap-sm` stays `var(--ui-spacing-sm)`.
    - Storybook smoke: any story (layout unchanged).
  - [ ] 6. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: a consumer compile of the worktree's dist/theme.css yields `--container-*` for `max-w-md`, `w-md`, `min-w-sm`, `basis-md` and `--ui-spacing-*` for `p-md`, `gap-sm`; `rg -c "var\(--container-" src/styles/theme.css` → 20; token-contract.md lists the affected utilities.
- log:
  - 2026-10-01 — created by audit

### WI-C1-05: State one "use client" rule (hooks/browser APIs or closures passed on) and apply it: drop 13 directives, add AIModelSelect's
- status: blocked(D-05)
- addresses: [F-027]
- depends_on: [WI-C1-01]
- phase: P3
- risk: medium — 13 public modules move from client references to neutral modules. V3's RSC approximation rendered each one clean with the directive stripped, and the Radix primitives they render keep their own boundary, so a Server Component still gets client behaviour where it matters. A wrapper that later gains a closure or hook without regaining the directive would break in RSC; the rule text in step 2 is what prevents that. AIModelSelect.tsx gains the directive below its header, which only WI-C1-01's prologue-aware stamp honours, hence the dependency.
- semver: patch
- files:
  - modify: `.agents/skills/dooph-ds-contribution/SKILL.md:71 @ b436647`
  - modify: `.agents/skills/dooph-ds-codebase/SKILL.md:619-636 @ b436647`
  - modify (remove the directive line, and the blank line after it where one follows): `src/components/Button/Button.tsx:23`, `src/components/Checkbox/Checkbox.tsx:18`, `src/components/ShapeButton/ShapeButton.tsx:18`, `src/components/VerificationCode/CodeDigitInput.tsx:15`, `src/components/Modal/Modal.tsx:1`, `src/components/Popover/Popover.tsx:1`, `src/components/Sheet/Sheet.tsx:1`, `src/components/Tooltip/Tooltip.tsx:1`, `src/components/Tabs/Tabs.tsx:1`, `src/components/SearchBox/SearchBox.tsx:1`, `src/components/SplitButton/SplitButton.tsx:1`, `src/components/LinearProgressIndicator/LinearProgressIndicator.tsx:1`, `src/components/DatePicker/DatePickerTrigger.tsx:1` (all `@ b436647`)
  - modify: `src/components/AIChat/AIModelSelect.tsx:19-20 @ b436647`
  - modify: `src/components/Table/Table.tsx:1 @ b436647` (comment wording only)
  - modify: `CHANGELOG.md:10-22 @ b436647`
- anchor:
  ```md
  <!-- .agents/skills/dooph-ds-contribution/SKILL.md:71 -->
  - [ ] `"use client"` added only if the module actually uses `useState`/`useEffect`/`useRef`, a browser API, or a timer. `forwardRef`, `memo`, `useId`, `useMemo` and `useCallback` all work in React's server build, and importing a client component from a neutral one is fine
  ```
- why: The rule names three hooks, the code follows two contradictory precedents (13 hook-free modules marked, 6 not), and the four Calendar/DatePicker modules need the directive for a reason the rule omits. The result is two public helpers (`tabTriggerVariants`, `formatTriggerLabel`) that throw when a Server Component calls them, and one module (AIModelSelect) that should be marked and is not. This drafts D-05's recommended option. If D-05 instead chooses "Radix wrappers always carry the directive", replace steps 3-4 with: keep the 13, move `tabTriggerVariants`/`formatTriggerLabel` into server-safe modules (R8.20), and still do step 5.
- steps:
  - [ ] 1. Reproduce (needs WI-C1-01 in the build, otherwise the root import fails first). In a scratch worktree build: `NODE_ENV=production node --conditions=react-server --import <main>/docs/audit/_work/scratch/V1/rsc-register2.mjs <main>/docs/audit/_work/scratch/C1/rsc-boundaries.mjs <worktree>/dist` → `FAIL` for the 13 wrappers ("client reference (want neutral)"), `FAIL AIThinkingEffortSelector: neutral (want client)`, and `FAIL tabTriggerVariants() threw TypeError` / `FAIL formatTriggerLabel() threw TypeError` (plus buttonVariants/checkboxVariants once WI-C1-01 stamps Button/Checkbox). Pre-WI-C1-01 evidence of the same facts: V3's `rsc-sample-asis.txt` / `rsc-sample-neutral.txt`.
  - [ ] 2. Rule text (both skills, same words). contribution SKILL.md:71 →
    ```md
    - [ ] `"use client"` added exactly when the module (1) calls a client-only React API — `useState`, `useEffect`, `useLayoutEffect`, `useRef`, `useReducer`, `useContext`, `createContext`, `useImperativeHandle`, `useSyncExternalStore`, or a hook built on them — or a browser API, timer, rAF or observer; or (2) creates a function and passes it to a host element (`onClick={() => …}`) or to a client component (`onValueChange={…}` on a Radix/DS client part). Passing a consumer's own prop through unchanged does not count. Nothing else needs it: `forwardRef`, `memo`, `useId`, `useMemo`, `useCallback` work in React's server build, and a hook-free wrapper around a Radix part stays neutral because the Radix package carries its own directive. Place it below the header contract (R11.9); the build stamps it from the directive prologue.
    ```
    codebase SKILL.md:619-636: retitle `:619` to ``### `"use client"` — hooks/browser APIs, or a closure handed on`` and replace the trigger sentence at `:623-624` with the same two triggers. Rewrite the "Current split" list at `:630-635`: client = `LoadingSpinner`, `Calendar`, `CalendarGrid`, `CalendarCaption`, `CalendarPresetsPanel` (closures), `DatePicker`, `DatePickerSplitTrigger` (closure), `VerificationCodeInput`, `RollingDigitsText`, `RollChangeText`, `FadeChangeText`, `RevealChangeText`, `SidebarWithHoverIcon`, `AIModelSelect` (closure to SliderLabeled); neutral = `Button`, `Checkbox`, `ShapeButton`, `CodeDigitInput`, `Modal`, `Popover`, `Sheet`, `Tooltip`, `Tabs`, `SearchBox`, `SplitButton`, `LinearProgressIndicator`, `DatePickerTrigger`, plus the existing `ProgressIndicator`, `WavyDivider`, `Table`, `CTAButton`, `ShimmerText`, `RollHoverText`, `UnderlineLinkText`. `:635-636` ("stamps … purely from source directives") stays, since it is true after WI-C1-01.
  - [ ] 3. Delete the directive from the 13 files listed under `files` (exact line numbers there; each line reads `"use client";`, LinearProgressIndicator's reads `'use client';`). No header contract among them mentions the directive (checked: Button, Checkbox, ShapeButton, CodeDigitInput, LinearProgressIndicator). LinearProgressIndicator's header then becomes the first thing in the file, as R11.9 wants. Before deleting each one, re-run the closure grep on the file: `rg -n "on[A-Z][A-Za-z]*=\{\s*\(" <file>` → no match (a match means trigger (2) applies; keep that directive and report it).
  - [ ] 4. Leave the four closure modules marked (CalendarGrid.tsx:1, CalendarCaption.tsx:1, CalendarPresetsPanel.tsx:1, DatePickerSplitTrigger.tsx:1). Now the rule names their reason.
  - [ ] 5. `src/components/AIChat/AIModelSelect.tsx`: between the header's closing ` */` (`:19`) and `import {` (`:20`), insert `"use client";` and a blank line. The header's `## constraints` (`:11-19`) covers data, colour and radio semantics only, so it is unaffected.
  - [ ] 6. `src/components/Table/Table.tsx:1`: `// No "use client": no hooks, and onSort is a consumer-supplied passthrough.` stays accurate; leave it. CHANGELOG [Unreleased] → `### Fixed`: "- `tabTriggerVariants` and `formatTriggerLabel` can be called from Server Components; hook-free wrappers (Button, Checkbox, Tabs, Tooltip, Modal, Sheet, Popover, …) are no longer client boundaries; `AIThinkingEffortSelector` is."
  - [ ] 7. Verify in a scratch-worktree build that includes WI-C1-01:
    - `npm run lint` → exit 0.
    - `rsc-boundaries.mjs` (command in step 1) → `ALL PASS`: the 13 wrappers are neutral, AIThinkingEffortSelector/AIModelSelectTrigger and the Calendar/DatePicker closure parts are client references, and the four helpers return strings.
    - `node <main>/docs/audit/_work/scratch/C1/dist-stamp-check.mjs <worktree>` → `PASS` with `N/N` where N = 28 (40 − 13 + 1).
    - `rg -l '^\s*["'"'"']use client' src/components --glob '!*.stories.tsx' | wc -l` → 28.
    - Storybook: Tooltip, Modal, Sheet, Popover, Tabs, Checkbox, Button, DatePicker stories behave as before (open/close, keyboard).
  - [ ] 8. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: `rsc-boundaries.mjs` prints `ALL PASS`; 28 source modules carry the directive and all 28 are stamped; both skills state the same two triggers.
- log:
  - 2026-10-01 — created by audit

### WI-C1-06: Ship THIRD_PARTY_NOTICES.md with the full shape-morph MIT notice and the Apache 2.0 text, and complete its dependency table
- status: todo
- addresses: [F-056]
- depends_on: []
- phase: P3
- risk: low — documentation and packaging only. The tarball gains one file, and no code changes. The licence texts must be copied from upstream verbatim, never retyped from memory.
- semver: patch
- files:
  - modify: `THIRD_PARTY_NOTICES.md:51-63 @ b436647` (dependency table)
  - modify: `THIRD_PARTY_NOTICES.md:67-85 @ b436647` (engine section + licence texts)
  - modify: `package.json:35-39 @ b436647` (`files`)
  - modify: `src/components/MorphRotationShape/engine/svgPath.ts:1-2 @ b436647` (provenance line)
  - modify: `CHANGELOG.md:10-22 @ b436647`
- anchor:
  ```json
  "files": [
    "dist",
    "skills",
    "bin"
  ],
  ```
- why: Every tarball redistributes the vendored shape-morph engine (MIT, ported from AOSP androidx under Apache 2.0) in `dist/` chunks, yet it carries no copyright notice, no MIT permission text and no Apache licence. The source headers point at THIRD_PARTY_NOTICES.md, which is not shipped and does not reproduce the MIT text either.
- steps:
  - [ ] 1. Reproduce: `grep -c THIRD_PARTY docs/audit/_work/pack.txt` → 0, and `grep -c "Permission is hereby granted" THIRD_PARTY_NOTICES.md` → 0.
  - [ ] 2. `THIRD_PARTY_NOTICES.md`:
    - In the table at `:51-63`, add three rows in alphabetical position: `| @radix-ui/react-popover | MIT | https://github.com/radix-ui/primitives |`, `| @radix-ui/react-progress | MIT | https://github.com/radix-ui/primitives |`, `| @radix-ui/react-slider | MIT | https://github.com/radix-ui/primitives |`. The table then lists 14 packages, matching package.json `dependencies`.
    - Under `### shape-morph` (`:76-79`), add `- **License text:**` followed by the upstream LICENSE file at commit f4d2697 (`https://github.com/Thereallo1026/shape-morph/blob/f4d2697/LICENSE`), copied verbatim into a fenced block.
    - Add a closing section `## Apache License 2.0` holding the verbatim text of `https://www.apache.org/licenses/LICENSE-2.0.txt`. Check androidx `graphics/graphics-shapes` (and the Compose animation-core / material3 sources named at `:70-74`) for a NOTICE file; if one exists, reproduce its attribution lines under the androidx entry (`:81-85`), as Apache 2.0 §4(d) requires.
  - [ ] 3. `package.json:35-39` → `"files": [ "dist", "skills", "bin", "THIRD_PARTY_NOTICES.md" ],`.
  - [ ] 4. `engine/svgPath.ts:2`: after `* SVG path `d` -> morphable RoundedPolygon.` add the line ` * Ported from AOSP androidx.graphics.shapes (Apache 2.0). See THIRD_PARTY_NOTICES.md.` This sits above `## behavior`, so the file's contract is untouched; its siblings already carry this provenance line.
  - [ ] 5. CHANGELOG [Unreleased] → `### Fixed`: "- The npm package now ships THIRD_PARTY_NOTICES.md with the shape-morph MIT notice and the Apache 2.0 licence for the vendored morph engine."
  - [ ] 6. Verify:
    - In a scratch worktree with the change: `npm pack --dry-run 2>&1 | grep -c THIRD_PARTY_NOTICES.md` → 1.
    - `grep -c "Permission is hereby granted" THIRD_PARTY_NOTICES.md` → ≥ 1; `grep -c "Apache License" THIRD_PARTY_NOTICES.md` → ≥ 1.
    - `grep -c "^| @radix-ui/" THIRD_PARTY_NOTICES.md` → 11, and the table has 14 package rows.
    - `npm run lint` → exit 0.
  - [ ] 7. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: `npm pack --dry-run` lists THIRD_PARTY_NOTICES.md; the file contains the verbatim shape-morph MIT text and the Apache 2.0 text; its dependency table lists all 14 runtime dependencies.
- log:
  - 2026-10-01 — created by audit

### WI-C1-07: Make init-skills work off a TTY: buffer piped answers, apply the default on EOF, add --yes
- status: todo
- addresses: [F-057]
- depends_on: []
- phase: P3
- risk: low — interactive runs behave as before (each prompt still waits for a line). A run with closed stdin now installs into all three directories, which is the documented default ("Press Enter (or y) to install"), instead of silently doing nothing. A CI job that relied on the old no-op would now write skills into its checkout; that behaviour was never documented.
- semver: minor
- files:
  - modify: `bin/init.mjs:39-42 @ b436647`
  - modify: `bin/init.mjs:5-8 @ b436647` (usage comment)
  - modify: `README.md:52-58 @ b436647`
  - modify: `CHANGELOG.md:10-22 @ b436647`
- anchor:
  ```js
  // ── Readline prompt ───────────────────────────────────────────────────────────
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const ask = (q) =>
    new Promise((res) => rl.question(q, (ans) => res(ans.trim())));
  ```
- why: Each prompt is a `rl.question` promise and nothing listens for `close`. When stdin hits EOF, or when piped answers are consumed before the next prompt registers, the promise never settles and Node exits 0 before copying anything. The command then reports success to an agent shell, CI or `yes |` while installing nothing.
- steps:
  - [ ] 1. Reproduce (fails before the fix). In an empty temp dir run `node <repo>/bin/init.mjs < /dev/null; echo exit=$?; ls -A | wc -l` → the first `[Y/n]:` prompt, `exit=0`, `0`. Then `printf 'y\ny\ny\n' | node <repo>/bin/init.mjs; ls -A | wc -l` → `0`.
  - [ ] 2. Replace `bin/init.mjs:39-42` with:
    ```js
    // ── Readline prompt ───────────────────────────────────────────────────────────
    // Answers are queued from 'line' events (piped input can arrive before the next
    // prompt is asked) and every pending prompt settles on 'close', so a run with
    // no terminal never exits mid-prompt with nothing copied. EOF = the default.
    const ASSUME_YES = process.argv.slice(2).some((a) => a === "--yes" || a === "-y");
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    const queued = [];
    const waiting = [];
    let stdinClosed = false;
    rl.on("line", (line) => {
      const next = waiting.shift();
      if (next) next(line.trim());
      else queued.push(line.trim());
    });
    rl.on("close", () => {
      stdinClosed = true;
      while (waiting.length) waiting.shift()("");
    });
    const ask = (q) => {
      process.stdout.write(q);
      if (ASSUME_YES) {
        process.stdout.write("y (--yes)\n");
        return Promise.resolve("y");
      }
      if (queued.length) return Promise.resolve(queued.shift());
      if (stdinClosed) {
        process.stdout.write(dim("(no input — using the default)") + "\n");
        return Promise.resolve("");
      }
      return new Promise((res) => waiting.push(res));
    };
    ```
    Move the block below the ANSI helpers (`:31-37`) if it is not already below them, because it uses `dim`. At b436647 it already is.
  - [ ] 3. Usage comment `bin/init.mjs:5-8`: add ` *   npx @dooph-software/design-system init-skills --yes   (no prompts: install into every directory)`. README.md after :56: "Add `--yes` to skip the prompts and install into all three directories (for agents, CI and scripted setups). Without a terminal the prompts take their default (install)." CHANGELOG [Unreleased]: under Added, "- `init-skills --yes`."; under `### Fixed`, "- `init-skills` no longer exits 0 having installed nothing when stdin is not a terminal."
  - [ ] 4. Verify, each in a fresh empty temp dir:
    - `node <repo>/bin/init.mjs < /dev/null; echo exit=$?` → three `✓` result lines, `exit=0`, and `.agents/skills`, `.claude/skills`, `.agent/skills` exist.
    - `printf 'y\nn\nn\n' | node <repo>/bin/init.mjs` → only `.agents/skills` created.
    - `printf 'n\nn\nn\n' | node <repo>/bin/init.mjs` → "Nothing selected. No files were changed." and the dir stays empty.
    - `node <repo>/bin/init.mjs --yes < /dev/null` → all three created; the prompts print `y (--yes)`.
    - In an interactive terminal: press Enter, n, Enter → `.agents/skills` and `.agent/skills` created (unchanged behaviour).
    - Remove the temp dirs afterwards.
  - [ ] 5. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: the four non-interactive runs above produce exactly the stated directories; `rg -n "rl.question" bin/init.mjs` → no match; README documents `--yes`.
- log:
  - 2026-10-01 — created by audit. Step 2's code was prototyped on a scratch copy (docs/audit/_work/scratch/C1/init-patch.cjs + init-ask.js.txt). The four non-interactive runs gave `< /dev/null` → .agent .agents .claude; `y n n` → .agents; `n n n` → "Nothing selected", empty; `--yes` → all three; all exit 0.

### WI-C1-08: Give LoadingSpinner, ProgressIndicator and WavyDivider a named folder index and route src/index.ts through it
- status: todo
- addresses: [F-064]
- depends_on: []
- phase: P2
- risk: low — the public names must stay exactly the same; step 4 diffs the runtime and type export lists of the root before and after. ProgressIndicator's import of the internal `spinnerGeometry` stays a module path on purpose, so the new index does not publish it.
- semver: none
- files:
  - create: `src/components/LoadingSpinner/index.ts`
  - create: `src/components/ProgressIndicator/index.ts`
  - create: `src/components/WavyDivider/index.ts`
  - modify: `src/index.ts:37-43 @ b436647`
  - modify: `src/components/AIChat/AIContextGauge.tsx:22-25 @ b436647`
  - modify: `src/components/AIChat/ChatDivider.tsx:17 @ b436647`
  - modify: `.agents/skills/dooph-ds-codebase/SKILL.md:618 @ b436647`
- anchor:
  ```ts
  // src/index.ts:37-43
  export * from './components/WavyDivider/WavyDivider';
  export * from './components/WavyDivider/constants';
  export * from './components/LoadingSpinner/LoadingSpinner';
  export * from './components/LoadingSpinner/constants';
  export * from './components/ShapeMorphSpinner';
  export * from './components/ProgressIndicator/ProgressIndicator';
  export * from './components/ProgressIndicator/constants';
  ```
- why: These three folders are the only component folders without an index.ts (R8.3). So src/index.ts must know their file names, two public siblings deep-import them, and anything later exported from those files becomes public with no reviewed list.
- steps:
  - [ ] 1. Baseline: in a scratch worktree build of HEAD, record `node -e "import('file:///<worktree>/dist/index.js').then(m=>console.log(Object.keys(m).sort().join('\n')))" > /tmp/c1-keys-before.txt` and `grep -oE "export \{[^}]*\}" <worktree>/dist/index.d.ts | sed -E 's/export \{|\}//g' | tr ',' '\n' | sed -E 's/.* as //; s/^ +| +$//g' | sort -u > /tmp/c1-types-before.txt`.
  - [ ] 2. Create the three indexes (named re-exports only — the form 32 of 39 folder indexes use, e.g. Button/index.ts):
    ```ts
    // src/components/LoadingSpinner/index.ts
    export { LoadingSpinner } from "./LoadingSpinner";
    export type { LoadingSpinnerProps } from "./LoadingSpinner";
    export { LoadingSpinnerColor, LoadingSpinnerSize, LoadingSpinnerVariant } from "./constants";
    ```
    ```ts
    // src/components/ProgressIndicator/index.ts
    export { ProgressIndicator } from "./ProgressIndicator";
    export type { ProgressIndicatorProps } from "./ProgressIndicator";
    export { ProgressIndicatorVariants } from "./constants";
    export type { ProgressIndicatorVariant } from "./constants";
    ```
    ```ts
    // src/components/WavyDivider/index.ts
    export { WavyDivider } from "./WavyDivider";
    export type { WavyDividerProps } from "./WavyDivider";
    export { WavyDividerVariant } from "./constants";
    ```
    (Each `LoadingSpinner*`/`WavyDividerVariant` const and its same-named type are exported together by the value export; ProgressIndicator's const `ProgressIndicatorVariants` and type `ProgressIndicatorVariant` differ in name — F-045/D-14 — so the type is listed separately.) Before saving, run `grep -n "^export" src/components/{LoadingSpinner,ProgressIndicator,WavyDivider}/*.ts*` and confirm every listed name exists and no other export of those files was public before (at b436647 the components export only the component + `*Props`).
  - [ ] 3. Wire-up:
    - `src/index.ts:37-43` →
      ```ts
      export * from './components/WavyDivider';
      export * from './components/LoadingSpinner';
      export * from './components/ShapeMorphSpinner';
      export * from './components/ProgressIndicator';
      ```
    - `AIContextGauge.tsx:22-25` → `import { ProgressIndicator, type ProgressIndicatorProps } from "../ProgressIndicator";`.
    - `ChatDivider.tsx:17` → `import { WavyDivider } from "../WavyDivider";`.
    - Leave the `../X/constants` imports (AIContextGauge.tsx:21,26, ChatDivider.tsx:18, ShapeMorphSpinner.tsx:9, ProgressIndicator.tsx:20) and `ProgressIndicator.tsx:15` (`../LoadingSpinner/spinnerGeometry`, internal) as they are. Both headers (AIContextGauge, ChatDivider) are untouched; an import path change alters no described behaviour.
    - codebase SKILL.md:618 (`Components and their *Props types come from the component's index.ts`) is now true. No edit is needed beyond checking it.
  - [ ] 4. Verify:
    - `npm run lint` → exit 0.
    - Rebuild the worktree and repeat step 1's two commands into `…-after.txt`; `diff /tmp/c1-keys-before.txt /tmp/c1-keys-after.txt` → empty; `diff /tmp/c1-types-before.txt /tmp/c1-types-after.txt` → empty.
    - `for d in src/components/*/; do [ -f $d/index.ts ] || echo $d; done` → no output.
    - `rg -n "components/(WavyDivider|LoadingSpinner|ProgressIndicator)/" src/index.ts` → no match.
  - [ ] 5. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: every component folder has an index.ts; the root runtime and type export lists are byte-identical before and after; lint passes.
- log:
  - 2026-10-01 — created by audit

### WI-C1-09: Remove the vestigial default exports from icon leaves, BaseShape and SidebarWithHoverIcon
- status: todo
- addresses: [F-075]
- depends_on: []
- phase: P1
- risk: low — default exports are unreachable to consumers (`exports` maps only "." and the barrel re-exports named bindings). All 14 in-repo default imports (3 icon imports + 11 shape leaves importing BaseShape) are switched in the same change, and lint catches any missed one. Story files keep `export default meta`, which Storybook CSF requires.
- semver: none
- files:
  - modify: the 72 `src/components/Icons/*Icon.tsx` leaves whose last statement is `export default <Name>;` (list: `rg -l "^export default" src/components/Icons --glob '*Icon.tsx'` @ b436647)
  - modify: `src/components/Icons/FiltersSlidersIcon.tsx:1,20 @ b436647`
  - modify: `src/components/Shapes/BaseShape.tsx:70 @ b436647`
  - modify: `src/components/SidebarWithHoverIcon/SidebarWithHoverIcon.tsx:150 @ b436647`
  - modify: `src/components/Menu/DropdownMenu.tsx:35 @ b436647`
  - modify: `src/components/Icons/Icons.stories.tsx:4 @ b436647`
  - modify: line 1 of `src/components/Shapes/{Arrow,Capsule,Clover,Cookie,Diamond,Double,Pixircle,Puff,Squircle,Star,Triple}Shape.tsx @ b436647`
  - modify: `.agents/skills/dooph-ds-contribution/SKILL.md:138 @ b436647`
- anchor:
  ```tsx
  // src/components/Icons/FiltersSlidersIcon.tsx:1,4,20
  import ArrowUpLeftIcon from "./ArrowUpLeftIcon";
  export const FiltersSlidersIcon = (props: IconProps) => {
  export default ArrowUpLeftIcon;
  // src/components/Menu/DropdownMenu.tsx:35
  import CheckIcon from "../Icons/CheckIcon";
  ```
- why: There are two export conventions for one kind of file, and nobody reads the defaults: FiltersSlidersIcon's default export is ArrowUpLeftIcon. The default-import form that DropdownMenu.tsx:35 uses would render the wrong glyph with no type error, and the R9.21 filename check cannot see it.
- steps:
  - [ ] 1. Baseline: `rg -l "^export default" src --glob '!*.stories.tsx' | wc -l` → 74; `rg -n "^import [A-Za-z_]\w*\s*(,|from)\s*.*from [\"']\.\.?/|^import [A-Za-z_]\w* from [\"']\.\.?/" src` → 14 lines: FiltersSlidersIcon.tsx:1, Icons.stories.tsx:4, DropdownMenu.tsx:35 and line 1 of the 11 shape leaves (`import BaseShape, { … } from "./BaseShape";`).
  - [ ] 2. Delete each `export default <Name>;` line (and the blank line before it, if one is left trailing) in the 72 icon leaves, `BaseShape.tsx:70` and `SidebarWithHoverIcon.tsx:150`. Mechanical form: `rg -l "^export default \w+;$" src --glob '!*.stories.tsx' | xargs sed -i '/^export default [A-Za-z]*;$/d'`, then check `git diff --stat` touches exactly 74 files. SidebarWithHoverIcon.tsx's header (`:1-39`) says nothing about exports, so it stays as is.
  - [ ] 3. `FiltersSlidersIcon.tsx`: delete line 1 (`import ArrowUpLeftIcon from "./ArrowUpLeftIcon";`), which only fed the wrong default. `DropdownMenu.tsx:35` → `import { CheckIcon } from "../Icons/CheckIcon";`. `Icons.stories.tsx:4` → `import { CheckIcon } from "./CheckIcon";`. In each of the 11 shape leaves, line 1 `import BaseShape, { ShapeClipPath, ShapeProps } from "./BaseShape";` (or `import BaseShape, { ShapeProps } …`) → `import { BaseShape, ShapeClipPath, ShapeProps } from "./BaseShape";` (or `import { BaseShape, ShapeProps } …`). BaseShape.tsx:51 already exports `BaseShape` by name.
  - [ ] 4. contribution SKILL.md:138 (the `*Icon.tsx` row): extend the "Keep filename and const in sync" cell to "Keep filename and const in sync; named export only (no `export default`)".
  - [ ] 5. Verify:
    - `npm run lint` → exit 0.
    - The step-1 default-import grep → no output.
    - `rg -l "^export default" src --glob '!*.stories.tsx'` → no output; `rg -c "^export default" src --glob '*.stories.tsx'` is unchanged (45 story files keep `export default meta`).
    - `npm run generate-icon-exports && git status --porcelain src/components/Icons/index.ts` → empty (the generator reads named consts only).
    - Storybook: Icons › gallery shows FiltersSlidersIcon as sliders; a DropdownMenu radio/multi-select story still shows the check icon.
  - [ ] 6. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: no non-story module in src has `export default`; lint passes; the icon barrel regenerates unchanged.
- log:
  - 2026-10-01 — created by audit

### WI-C1-10: Give the CSS emit step one implementation that both tsup onSuccess and build:css call
- status: todo
- addresses: [F-077]
- depends_on: []
- phase: P1
- risk: low — the shipped path keeps the exact `npx tailwindcss -i src/styles/index.css -o dist/styles.css` invocation and the copy. Only `build:css` changes to that same code. Steps 4-5 check that the generated dist CSS is byte-identical.
- semver: none
- files:
  - rename+modify: `scripts/copy-theme.mjs:1-24 @ b436647` → `scripts/emit-css.mjs` (`git mv`, then edit)
  - modify: `tsup.config.ts:1-23,54-57 @ b436647`
  - modify: `package.json:48-49 @ b436647`
  - modify: `.agents/skills/dooph-ds-codebase/SKILL.md:112,594,599 @ b436647`
- anchor:
  ```ts
  // tsup.config.ts:12-23
  function emitCssAssets() {
    execSync('npx tailwindcss -i src/styles/index.css -o dist/styles.css', {
      stdio: 'inherit',
      cwd: process.cwd(),
    });
    // theme.css ships as raw @theme source (the consumer's Tailwind compiles it),
    // so it is copied, not compiled. Kept in sync by scripts/sync-theme.mjs.
    copyFileSync(
      resolve(process.cwd(), 'src/styles/theme.css'),
      resolve(process.cwd(), 'dist/theme.css'),
    );
  }
  ```
- why: Two implementations of the CSS emit step exist and they already invoke Tailwind differently. Only tsup's ships, while `build:css`, which the codebase skill recommends for CSS-only iterations, runs the other one, so an edit to one silently diverges from the published sheet.
- steps:
  - [ ] 1. Baseline: in a scratch worktree, `npm ci && npm run build`, then `sha1sum dist/styles.css dist/theme.css > /tmp/c1-css-before.txt`.
  - [ ] 2. `git mv scripts/copy-theme.mjs scripts/emit-css.mjs`. Replace its contents with:
    ```js
    /**
     * emit-css.mjs — the one CSS emit step. Called by tsup's onSuccess (every build)
     * and by `npm run build:css` (CSS-only iterations), so both produce the same files.
     *
     * 1. Compiles src/styles/index.css with the Tailwind CLI → dist/styles.css.
     * 2. Copies the generated preset src/styles/theme.css → dist/theme.css. It ships as
     *    raw `@theme inline` source that the CONSUMER's Tailwind compiles, so it is copied,
     *    not compiled. Kept in sync with index.css by scripts/sync-theme.mjs.
     */
    import { execSync } from "child_process";
    import { copyFileSync, mkdirSync } from "fs";
    import { dirname, resolve } from "path";
    import { fileURLToPath } from "url";

    const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
    const DIST_DIR = resolve(ROOT, "dist");

    mkdirSync(DIST_DIR, { recursive: true });
    execSync("npx tailwindcss -i src/styles/index.css -o dist/styles.css", { stdio: "inherit", cwd: ROOT });
    copyFileSync(resolve(ROOT, "src/styles/theme.css"), resolve(DIST_DIR, "theme.css"));
    console.log("✓  dist/styles.css compiled, dist/theme.css copied.");
    ```
  - [ ] 3. `tsup.config.ts`:
    - Delete `emitCssAssets` (`:12-23`) and the now-unused imports `copyFileSync` (`:2`) and `resolve` (`:3`); lint runs `noUnusedLocals` over this file.
    - In `onSuccess` (`:54-57`), replace `emitCssAssets();` with `execSync('node scripts/emit-css.mjs', { stdio: 'inherit', cwd: process.cwd() });`.
    - Rewrite the comment at `:7-11` to: `// tsup runs with clean: true, which wipes dist/ before each build. onSuccess re-emits both CSS assets through scripts/emit-css.mjs (the same script build:css runs), so dist/styles.css and dist/theme.css are always regenerated together on any path that runs tsup.`
    - `package.json:48-49`: `"build:css": "node scripts/emit-css.mjs",` and delete the `"copy-theme"` line.
    - codebase SKILL.md:112 → `emit-css.mjs ← compiles dist/styles.css and copies dist/theme.css; run by tsup onSuccess and by build:css`. :594 → `npm run build:css → scripts/emit-css.mjs (the same step tsup's onSuccess runs) — CSS-only rebuilds`. :599: keep the text and add "(both go through scripts/emit-css.mjs)".
  - [ ] 4. Verify:
    - `npm run lint` → exit 0.
    - `npm run build` in the worktree → `sha1sum dist/styles.css dist/theme.css` equals `/tmp/c1-css-before.txt`.
    - `rm dist/styles.css dist/theme.css && npm run build:css` → the same two hashes again.
    - `rg -n "copy-theme" --glob '!docs/**' --glob '!.superpowers/**' .` → no match outside dated plan/report files.
  - [ ] 5. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: both `npm run build` and `npm run build:css` produce byte-identical dist/styles.css and dist/theme.css through scripts/emit-css.mjs; scripts/copy-theme.mjs no longer exists; lint passes.
- log:
  - 2026-10-01 — created by audit

### WI-C1-11: Name the existing zero-dependency test command (`npm test` = node --test) and drop the test's scaffolding cast
- status: blocked(D-18)
- addresses: [F-078]
- depends_on: []
- phase: P1
- risk: low — adds a script and removes a cast in a file that does not ship. `node --test` with a glob and unflagged type stripping needs Node ≥ 22.18 (or ≥ 23.6); local Node 24 passes today.
- semver: none
- files:
  - modify: `package.json:40-56 @ b436647` (scripts)
  - modify: `src/components/ProgressIndicator/waveGeometry.test.ts:3-8,40-45 @ b436647`
  - modify: `.agents/skills/dooph-ds-contribution/SKILL.md:84-88 @ b436647`
- anchor:
  ```ts
  // src/components/ProgressIndicator/waveGeometry.test.ts:3-8, 40-45
  // Node's built-in strip-types runner requires the source extension; the package
  // compiler intentionally does not enable allowImportingTsExtensions.
  // @ts-expect-error TS5097 -- required by the zero-dependency Node test command.
  import * as waveGeometryModule from "./waveGeometry.ts";

  const { createMaterialWaveGeometry } = waveGeometryModule;
  …
  test("omits the round-capped inactive track when progress is complete", () => {
    const getWavyTrackGeometry = (
      waveGeometryModule as unknown as Record<string, unknown>
    ).getWavyTrackGeometry;
    assert.equal(typeof getWavyTrackGeometry, "function");
    if (typeof getWavyTrackGeometry !== "function") return;
  ```
- why: The repo's only regression test guards the wavy-indicator geometry, yet it runs only for someone who already knows the invocation. Its escape hatch cites a "Node test command" that no script defines. This is D-18's recommended option (no framework, zero dependencies). The other option, deleting the file, needs no WI.
- steps:
  - [ ] 1. Baseline: `node --test "src/**/*.test.ts"` → `pass 3`, `fail 0` (confirmed by C1 on Node 24.19.0); `npm test` → "Missing script: test".
  - [ ] 2. `package.json` scripts: add `"test": "node --test \"src/**/*.test.ts\"",` after `"lint"` (`:54`).
  - [ ] 3. `waveGeometry.test.ts`:
    - `:5` → `// @ts-expect-error TS5097 -- the .ts extension is required by \`npm test\` (node --test, type stripping).`
    - `:8` → `const { createMaterialWaveGeometry, getWavyTrackGeometry } = waveGeometryModule;`
    - Delete `:41-45` (the cast, the `typeof` assertion and the early return); `getWavyTrackGeometry` is a plain export (waveGeometry.ts:135).
  - [ ] 4. contribution SKILL.md Step 6 block (`:84-88`): add the line `npm test              # node --test over src/**/*.test.ts (needs Node ≥ 22.18)` after `npm run lint`.
  - [ ] 5. Verify: `npm test` → `pass 3`, `fail 0`, exit 0; `npm run lint` → exit 0 (the remaining `@ts-expect-error` is still consumed, so TS5097 still fires without it); `rg -n "as unknown as" src/components/ProgressIndicator/waveGeometry.test.ts` → no match.
  - [ ] 6. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: `npm test` runs the geometry tests and exits 0; lint passes; the test has no cast.
- log:
  - 2026-10-01 — created by audit

### WI-C1-12: In 6.0.0, stop exporting the undocumented internals from the root and document the five intended names
- status: blocked(D-15)
- addresses: [F-087]
- depends_on: [WI-RELEASE-OPEN, WI-C1-05]
- phase: P4
- risk: medium — removes 11 root exports that shipped in v5.3.0 (`isSameDay`, `startOfDay`, `formatRangeLabel`, `formatSingleLabel`, `formatTriggerLabel`, `serializeAxes`, `stickerVariants`, `checkboxVariants`, `tabTriggerVariants`, `ShapeClipPath`, `SHAPE_VIEWBOX_SIZE`). A consumer importing any of them gets a compile error after upgrading, which is why this ships only in the major, with migration-skill entries and no deprecation shim (repo practice). Internal callers keep working through module-path imports, and lint proves it. WI-C1-05 goes first so `formatTriggerLabel`'s module is neutral when siblings import it by path.
- semver: major
- files:
  - modify: `src/components/Calendar/index.ts:20-22 @ b436647`
  - modify: `src/components/DatePicker/DatePickerSplitTrigger.tsx:15-22 @ b436647`
  - modify: `src/components/DatePicker/DatePickerTrigger.tsx:8-13 @ b436647`
  - modify: `src/components/DatePicker/index.ts:3 @ b436647`
  - modify: `src/components/Text/index.ts:49 @ b436647`
  - modify: `src/components/Sticker/index.ts:1 @ b436647`
  - modify: `src/components/Checkbox/index.ts:1 @ b436647`
  - modify: `src/components/Tabs/index.ts:1 @ b436647`, `src/components/Tabs/Tabs.tsx:62 @ b436647`
  - modify: `src/components/Shapes/index.ts:2 @ b436647`
  - modify: `.agents/skills/dooph-ds-codebase/SKILL.md:187-189,202,323 @ b436647`
  - modify: `skills/dooph-design-system-usage/SKILL.md` (component inventory: document `buttonVariants`, `CheckboxIndicator`, `DateMatcher`, `TextStyleProps`, `*_SHAPE_PATH`)
  - modify: the v6 migration skill created by WI-RELEASE-OPEN (`skills/dooph-design-system-v6-migration/SKILL.md`, "Removed exports" inventory rows)
  - modify: `CHANGELOG.md:10-22 @ b436647` ([Unreleased] → `### Removed`)
- anchor:
  ```ts
  // src/components/Calendar/index.ts:20-22
  // Re-exported for sibling components (DatePickerSplitTrigger) so nothing deep-imports.
  export { isSameDay, startOfDay } from "./dateUtils";
  export { formatRangeLabel, formatSingleLabel } from "./dateFormat";
  ```
- why: Folder indexes double as the sibling-sharing boundary, and `export *` in src/index.ts publishes them, so internal helpers became undocumented semver surface. Two of them misbehave when used directly: `formatTriggerLabel` is a client reference (F-027) and `stickerVariants({variant:"custom"})` skips Sticker's R1.6 throw. This drafts D-15's recommended per-name split.
- steps:
  - [ ] 1. Baseline (scratch worktree build of HEAD): `node -e "import('file:///<worktree>/dist/index.js').then(m=>{for (const n of ['isSameDay','startOfDay','formatRangeLabel','formatSingleLabel','formatTriggerLabel','serializeAxes','stickerVariants','checkboxVariants','tabTriggerVariants','ShapeClipPath','SHAPE_VIEWBOX_SIZE','buttonVariants','CheckboxIndicator','COOKIE_SHAPE_PATH']) console.log(n, n in m)})"` → all `true`.
  - [ ] 2. Calendar: delete `src/components/Calendar/index.ts:20-22`. Siblings import by module path instead (the mechanism `menuItemClassName` already uses):
    - `DatePickerSplitTrigger.tsx:15-22` → keep `DEFAULT_SPLIT_TRIGGER_PRESETS`, `type CalendarPreset`, `type DateRange` from `"../Calendar"`, and add `import { formatRangeLabel } from "../Calendar/dateFormat";` and `import { isSameDay, startOfDay } from "../Calendar/dateUtils";`.
    - `DatePickerTrigger.tsx:8-13` → keep `DatePickerMode` and `type DateRange` from `"../Calendar"`, and add `import { formatRangeLabel, formatSingleLabel } from "../Calendar/dateFormat";`.
    - `DateMatcher` (Calendar/index.ts:19) stays public: it types Calendar's `disabled` prop.
  - [ ] 3. Other indexes:
    - `DatePicker/index.ts:3` → `export { DatePickerTrigger } from "./DatePickerTrigger";`.
    - `Text/index.ts:49`: delete the `serializeAxes` line and keep `:50` `export type { TextStyleProps }`.
    - `Sticker/index.ts:1` → `export { Sticker } from "./Sticker";`.
    - `Checkbox/index.ts:1` → `export { Checkbox, CheckboxIndicator } from './Checkbox';`.
    - `Tabs/index.ts:1` → `export { Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs';`, and `Tabs.tsx:62` → `export { TabsRoot as Tabs, TabsContent, TabsList, TabsTrigger };`. The local `tabTriggerVariants` alias at `:28` stays; it is used at `:36` and `:44`.
    - `Shapes/index.ts:2` `export * from "./BaseShape";` → `export { BaseShape } from "./BaseShape";` plus `export type { ShapeProps } from "./BaseShape";`. The shape leaves keep importing `ShapeClipPath` from `./BaseShape` directly.
    - Leave `Button/index.ts:1` (`buttonVariants`) as is; it is documented instead (step 4).
    - Before each edit, `rg -n "<name>" src --glob '!*.stories.tsx'` to confirm no other importer goes through the barrel. At b436647 the only barrel importers are the two DatePicker files in step 2.
  - [ ] 4. Docs:
    - usage SKILL.md: in the component inventory, document `buttonVariants({ variant, size })` ("style a link or custom element as a Button; pass `ButtonVariant`/`ButtonSize` members"), `CheckboxIndicator` (Checkbox's `children` slot), `DateMatcher` (type of Calendar/DatePicker `disabled`), `TextStyleProps`, and the `<NAME>_SHAPE_PATH` strings (24-unit viewBox outlines; CHANGELOG.md:16).
    - codebase SKILL.md:187-189: replace "re-exported from `Calendar/index.ts` so `DatePicker` never deep-imports a sibling" with "imported by module path (`../Calendar/dateUtils`, `../Calendar/dateFormat`); folder indexes list only public names, so a sibling-shared internal is imported by path, never re-exported".
    - codebase SKILL.md:202: delete "`tabTriggerVariants` stays exported under its old name as an alias".
    - codebase SKILL.md:323: mark `serializeAxes` internal.
    - Migration skill (WI-RELEASE-OPEN's v6 skill), "Removed exports", one row each: `isSameDay`, `startOfDay`, `formatRangeLabel`, `formatSingleLabel`, `formatTriggerLabel`, `serializeAxes`, `checkboxVariants`, `tabTriggerVariants`, `ShapeClipPath` → "internal; no replacement — copy the helper if you used it". `stickerVariants` → "render `<Sticker>`". `SHAPE_VIEWBOX_SIZE` → "the DS shape viewBox is 24". Give each a word-boundary detection pattern (R13.9).
    - CHANGELOG [Unreleased] → `### Removed`: the same 11 names.
  - [ ] 5. Verify (scratch worktree build):
    - `npm run lint` → exit 0.
    - Step 1's command → the 11 removed names `false`; `buttonVariants`, `CheckboxIndicator`, `COOKIE_SHAPE_PATH` `true`.
    - `grep -cE "\b(isSameDay|startOfDay|formatRangeLabel|formatSingleLabel|formatTriggerLabel|serializeAxes|stickerVariants|checkboxVariants|tabTriggerVariants|ShapeClipPath|SHAPE_VIEWBOX_SIZE)\b" <worktree>/dist/index.d.ts` → 0.
    - Storybook: Calendar, DatePicker (single, range, split presets), Tabs, Checkbox and Sticker stories render as before.
  - [ ] 6. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: the 11 names are absent from dist/index.js and dist/index.d.ts; the five kept names are documented in the usage skill; the v6 migration skill lists every removal; lint passes.
- log:
  - 2026-10-01 — created by audit

### WI-C1-13: Stop publishing unreachable per-module stubs and self-referencing CJS maps, and shift each map when the stamp prepends a line
- status: todo
- addresses: [F-104]
- depends_on: [WI-C1-01]
- phase: P3
- risk: low — nothing in the package imports the per-module `.js`/`.cjs` stubs (dist/index.* import chunks directly) and `exports` exposes only ".", so removing them from the tarball breaks no supported import. A consumer deep-importing `@dooph-software/design-system/dist/components/...` was already unsupported (Node's `exports` blocks it) and still fails. The `.d.ts` files stay because dist/index.d.ts references them. `require` consumers lose the CJS maps, which today map each file to itself, so nothing usable is lost.
- semver: patch
- files:
  - modify: `package.json:35-39 @ b436647` (`files`)
  - modify: `scripts/add-use-client.mjs:104-109 @ b436647` (map shift; apply on top of WI-C1-01)
  - modify: `tsup.config.ts:54-57 @ b436647` (drop CJS maps after the stamp)
- anchor:
  ```js
  // scripts/add-use-client.mjs:104-109
      const full = path.resolve(cwd, outPath);
      if (!existsSync(full)) continue;
      const contents = readFileSync(full, 'utf8');
      if (alreadyStamped(contents)) continue;
      writeFileSync(full, `"${DIRECTIVE}";\n${contents}`);
      stamped.add(toPosix(outPath));
  ```
- why: About 40% of the 2519 packed files are 500 unreachable entry stubs and their 500 maps. Every CJS map lists only its own output file by an absolute build-machine path. Every stamped chunk's map is one line off because the stamp prepends a line without shifting `mappings`.
- steps:
  - [ ] 1. Baseline: in a scratch worktree build of HEAD (with WI-C1-01), run `npm pack --dry-run --json > /tmp/c1-pack-before.json` and count with `node -e "const f=require('/tmp/c1-pack-before.json')[0].files.map(x=>x.path);const c=(r)=>f.filter(p=>r.test(p)).length;console.log({total:f.length, stubs:c(/^dist\/(components|utils)\/.*\.c?js$/), stubMaps:c(/^dist\/(components|utils)\/.*\.map$/), cjsMaps:c(/\.cjs\.map$/), dts:c(/\.d\.c?ts$/)})"`. At b436647 (pack.txt): total 2519, stubs 500, stubMaps 500, all CJS maps self-referencing.
  - [ ] 2. `package.json:35-39` →
    ```json
    "files": [
      "dist",
      "!dist/components/**/*.js",
      "!dist/components/**/*.cjs",
      "!dist/components/**/*.map",
      "!dist/utils/**/*.js",
      "!dist/utils/**/*.cjs",
      "!dist/utils/**/*.map",
      "!dist/**/*.cjs.map",
      "skills",
      "bin"
    ],
    ```
    (if WI-C1-06 has landed, keep its `"THIRD_PARTY_NOTICES.md"` entry). If `npm pack --dry-run` on the npm version CI uses (11.5.1, release-package.yml:30) still lists files matched by a negation, delete those files at the end of the build instead (step 4's function, extended to the stub globs). Record which mechanism was used.
  - [ ] 3. Map shift in `scripts/add-use-client.mjs`. Replace the write at `:108` with:
    ```js
    writeFileSync(full, `"${DIRECTIVE}";\n${contents}`);
    // The directive adds one line at the top; shift the paired source map by one
    // generated line (a leading ';' in `mappings`) so stack traces stay aligned.
    const mapPath = `${full}.map`;
    if (existsSync(mapPath)) {
      const map = JSON.parse(readFileSync(mapPath, 'utf8'));
      map.mappings = `;${map.mappings}`;
      writeFileSync(mapPath, JSON.stringify(map));
    }
    ```
  - [ ] 4. Drop the CJS maps. tsup's CJS splitting emits maps whose only source is the output file itself (dist/index.cjs.map:1 `"sources":["c:\\…\\dist\\index.cjs"]`). In `tsup.config.ts` `onSuccess`, after the add-use-client call, run a small inline pass: for every `dist/**/*.cjs`, remove a trailing `//# sourceMappingURL=…` line, then delete `dist/**/*.cjs.map`. Use `readdirSync(…, { recursive: true })` (Node ≥ 20) and add `readdirSync`, `readFileSync`, `writeFileSync`, `rmSync` to the `node:fs` import. Keep `sourcemap: true` (`:46`), since ESM maps point at `../src` with `sourcesContent`. Update the tsup.config.ts comment above `sourcemap` to "ESM maps only; the CJS maps tsup emits map each file to itself, so onSuccess removes them."
  - [ ] 5. Verify (fresh scratch worktree build):
    - `npm run lint` → exit 0.
    - `node <main>/docs/audit/_work/scratch/C1/dist-stamp-check.mjs <worktree>` → `PASS` (the stamp still works).
    - `node -e "const fs=require('fs');let bad=0,n=0;for(const f of fs.readdirSync('dist')){if(!/^chunk-.*\.js$/.test(f))continue;const c=fs.readFileSync('dist/'+f,'utf8');if(!c.startsWith('\"use client\"'))continue;n++;const m=JSON.parse(fs.readFileSync('dist/'+f+'.map','utf8'));if(!m.mappings.startsWith(';'))bad++;}console.log({stamped:n,unshifted:bad})"` → `unshifted: 0`.
    - `ls dist/*.cjs.map 2>/dev/null | wc -l` → 0; `grep -l "sourceMappingURL" dist/*.cjs | wc -l` → 0.
    - Repeat step 1 → `stubs: 0`, `stubMaps: 0`, `cjsMaps: 0`, `dts` unchanged; `total` ≈ 2519 − 1251 = 1268 (+1 with THIRD_PARTY_NOTICES.md).
    - Consumer smoke in a temp dir: `npm pack` the worktree, `npm i <tarball> react react-dom`, then `node -e "import('@dooph-software/design-system').then(m=>console.log(Object.keys(m).length))"` and `node -e "console.log(Object.keys(require('@dooph-software/design-system')).length)"` → both print the same export count as the pre-change build.
  - [ ] 6. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: the packed file list has no `dist/components|utils/**/*.{js,cjs,map}` and no `*.cjs.map`; ESM and CJS root imports work from the packed tarball; every stamped chunk's map `mappings` starts with `;`.
- log:
  - 2026-10-01 — created by audit

### WI-C1-14: Import Storybook types from the declared @storybook/react-vite everywhere
- status: todo
- addresses: [F-107]
- depends_on: []
- phase: P1
- risk: low — `@storybook/react-vite` re-exports the renderer package (its dist/index.d.ts:3 is `export * from "@storybook/react";`), so `Meta`, `StoryObj` and `Preview` resolve to the same types. This is a type-only import change in non-shipped files.
- semver: none
- files:
  - modify: `.storybook/preview.ts:1 @ b436647`
  - modify: the 40 `src/**/*.stories.tsx` files that import from `@storybook/react` (list: `rg -l "from ['\"]@storybook/react['\"]" src --glob '*.stories.tsx'` @ b436647; 25 use double quotes, 15 single)
- anchor:
  ```ts
  // .storybook/preview.ts:1
  import type { Preview } from '@storybook/react';
  ```
- why: 40 stories and the preview config resolve their types only through a hoisted transitive dependency, so a stricter installer or a dedupe change breaks them all at once. Two import sources for the same types also leave contributors without a canonical one.
- steps:
  - [ ] 1. Baseline: `rg -l "from ['\"]@storybook/react['\"]" src .storybook | wc -l` → 41 (40 stories + preview.ts); `rg -l "from ['\"]@storybook/react-vite['\"]" src | wc -l` → 5.
  - [ ] 2. Replace the module specifier, keeping each file's quote style: `rg -l "from ['\"]@storybook/react['\"]" src .storybook | xargs sed -i -E "s#from (['\"])@storybook/react\1#from \1@storybook/react-vite\1#"`. `git diff --stat` must show exactly 41 files, each with a one-line change.
  - [ ] 3. Verify:
    - `npm run lint` → exit 0 (type-checks the 40 stories).
    - `rg -l "from ['\"]@storybook/react['\"]" src .storybook` → no output.
    - `npm run build-storybook` → completes. It compiles `.storybook/preview.ts`, which `tsconfig.json:18` excludes from lint.
  - [ ] 4. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: no file imports `@storybook/react` directly; lint and build-storybook pass.
- log:
  - 2026-10-01 — created by audit

### WI-C1-15: Fix the S4 tooling nits: release workflow comments and double build, unused Plex font, icon-barrel header, build:watch, color.ts consumer list
- status: todo
- addresses: [F-119]
- depends_on: []
- phase: P1
- risk: low — comments, a dev-only font request, a dev script, and one CI step. The only behavioural change is that the release workflow builds once (in `prepublishOnly`) instead of twice, and `npm publish` still fails on a build error. If F-032's colour-mechanism work item (D-06) rewrites `src/utils/color.ts` first, apply item (f) inside that rewrite instead.
- semver: none
- files:
  - modify: `.github/workflows/release-package.yml:35-36,43,45 @ b436647`
  - modify: `.storybook/preview-head.html:10 @ b436647`
  - modify: `scripts/generate-icon-exports.mjs:39-40 @ b436647` (then regenerate `src/components/Icons/index.ts` with the generator; never hand-edit it)
  - modify: `package.json:51 @ b436647`
  - modify: `src/utils/color.ts:1-2 @ b436647`
  - modify: `.agents/skills/dooph-ds-codebase/SKILL.md:29-32 @ b436647`
  - modify: `.agents/skills/dooph-ds-architecture/SKILL.md:78 @ b436647`
- anchor:
  ```yaml
  # .github/workflows/release-package.yml:35-36, 43, 45
        - name: Build
          run: npm run build
        #   → Org: dooph-software  Repo: dooph-Design-System  Workflow: release-package.yml
        # For the very first publish, use the TOKEN FALLBACK below, then switch here.
  ```
- why: Each item misleads or wastes a little. The workflow names the wrong repository for the trusted-publisher form and points to a fallback step that does not exist, and it builds twice per release. Storybook downloads an unused font family on every load. The icon barrel's header lacks the R11.12 do-not-edit wording. `build:watch` skips the generators. color.ts and two skills under-report who uses the colour util.
- steps:
  - [ ] 1. (a) `release-package.yml:43` → `#   → Org: dooph-software  Repo: dooph.-Design-System  Workflow: release-package.yml` (the canonical name `git remote -v` shows; package.json:10 has it lower-cased). Delete `:45` (the package has been on npm since before 5.3.0, so the first-publish note is obsolete and its "TOKEN FALLBACK below" does not exist).
  - [ ] 2. (b) Delete the `Build` step (`:35-36`). `npm publish` runs `prepublishOnly` (`package.json:55` → `npm run build`), so the release still builds exactly once before packing.
  - [ ] 3. (c) `.storybook/preview-head.html:10`: remove the URL segment `&family=IBM+Plex+Sans:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,100;1,200;1,300;1,400;1,500;1,600;1,700` and leave the other families and axes untouched (R4.7 governs those). Check first: `rg -n "Plex" src skills .agents .storybook --glob '!preview-head.html'` → no output.
  - [ ] 4. (d) `scripts/generate-icon-exports.mjs:39-40` → `'// AUTO-GENERATED by scripts/generate-icon-exports.mjs. Do not edit by hand.',` / `'// Run \`npm run generate-icon-exports\` after adding or removing icon files.',`. Then run `npm run generate-icon-exports`; `git diff src/components/Icons/index.ts` must show only the first header line changed.
  - [ ] 5. (e) `package.json:51` → `"build:watch": "npm run generate-icon-exports && npm run generate-shape-morph-ease && npm run sync-tokens && node --max-old-space-size=8192 node_modules/tsup/dist/cli-default.js --watch",`.
  - [ ] 6. (f) `src/utils/color.ts:1-2` → `/* Shared color resolution for components that take a free-form `color` prop` / ` * (Slider*, LinearProgressIndicator, Sticker custom variant, AIModelSelect parts).`. codebase SKILL.md:29-32 → "backs the `color` prop on Slider*/LinearProgressIndicator/Sticker (custom)/AIModelSelect …". At arch:78, change `(`Slider*`, `LinearProgressIndicator`)` to `(`Slider*`, `LinearProgressIndicator`, `Sticker`, `AIModelSelect` parts)`.
  - [ ] 7. Verify:
    - `npm run lint` → exit 0.
    - `rg -n "TOKEN FALLBACK|Repo: dooph-Design-System|IBM\+Plex" .github .storybook` → no output.
    - `head -1 src/components/Icons/index.ts` → `// AUTO-GENERATED by scripts/generate-icon-exports.mjs. Do not edit by hand.`
    - `npm run build:watch` starts after the three generators run (stop it with Ctrl-C).
    - `npm run storybook` → fonts load; the Network tab shows no IBM Plex request.
    - `rg -n "resolveDsColor" src --glob '!*.stories.tsx' -l` lists exactly the components named in color.ts:1-2.
  - [ ] 8. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: the release workflow has one build path and the correct repository name; preview-head requests no IBM Plex; Icons/index.ts carries the R11.12 header via its generator; build:watch runs the generators; color.ts and both skills list all four consumers.
- log:
  - 2026-10-01 — created by audit

## DONE
