# 06C2 — Shapes: key-based MorphRotationShape, one `createShape` factory (WI-034 → WI-115)

Agent C2, wave C. Folders: `src/components/{Shapes,MorphRotationShape,ShapeMorphSpinner,DropdownCaret}/**`.
(Resumed after a usage-limit cut; the first run wrote only this skeleton and a baseline. No code had been edited.)

Scratch (session scratchpad `c2/`): `build.cjs` (esbuild bundle of the four folders + ShapeButton from the
working tree, CJS, react external), `dump.cjs` (SSR markup: 13 shapes × 5 prop sets, spinner ×3, carets ×2,
MorphRotationShape ×3 modes = 73 lines), `compare.cjs` (before/after line diff), `leaves.cjs` (the leaf
rewrite, with `--verify`), `53-shapes-local.cjs` (the audit's 53-shapes check pointed at these bundles, plus
EightLeafClover), `probe/` (type probe), `before/`, `after/`, `*-before.txt`, `*-after.txt`.

## Checklist
- [x] Scoreboard baseline (`c2/score-before.txt`; C1 is sweeping concurrently, so compare only this lane's files)
- [x] Before-snapshot: bundle + 73-line markup dump. `shapes-serializable.mjs` on it → 3 FAIL, SSR sha1
      d5aef932fc2c / 28ba2db06d6e / 253074aea2c3 (identical to the b436647 values in WI-034 step 1)
- [x] WI-034 — `Shapes` keys in `shapes`; spinner and caret pass keys (code + ShapeKeys story)
- [x] WI-115 — `createShape` factory, clipPaths gone, `DsShapeComponent` brand (leaves rewritten by `c2/leaves.cjs`, `--verify` OK)
- [x] After-snapshot diff, serialisable check, type probe
- [x] lint, scoreboard after

## MorphRotationShape takes `Shapes` keys; the spinner and caret pass keys [WI-034, F-012]
- files: `src/components/Shapes/shapePaths.ts`, `src/components/MorphRotationShape/MorphRotationShape.tsx`,
  `src/components/ShapeMorphSpinner/ShapeMorphSpinner.tsx`, `src/components/DropdownCaret/DropdownCaret.tsx`,
  `src/components/MorphRotationShape/MorphRotationShape.stories.tsx`
- what changed:
  - shapePaths.ts: one table keyed by `Shapes` key → [component, outline], typed
    `satisfies Record<Shapes, …>`, so a new shape without a row is a compile error (the WI's array form
    could not catch that). It includes EightLeafClover. New `ShapeInput` type (a DS shape component or a
    `Shapes` key); `getShapePath` takes either and still throws for anything else; new
    `getShapeComponent(key)`. Neither is re-exported from the package (same as before).
  - MorphRotationShape: `shapes: ShapeInput[]`; the error text says "components or Shapes keys". Keys
    compare by value, so an inline key array no longer remounts the inner component. Header unchanged:
    its constraints still hold, including "Changing `shapes` remounts the inner component".
  - ShapeMorphSpinner: the default sequence is an internal key list; `SHAPE_MORPH_SPINNER_SHAPES` stays
    exported, same order, derived from the keys; `shapes?: ShapeInput[]`, default = the keys.
  - DropdownCaret: `CARET_SHAPES` are keys (`squircle`/`pixircle`, `clover`/`puff`). Header unchanged.
  - Story: `ControlledDemo` takes `MorphRotationShapeProps["shapes"]`; new `ShapeKeys` story
    (clover → puff → squircle, by key).
  - "use client" re-check (agent-rules §6): ShapeMorphSpinner and DropdownCaret now hand the client
    MorphRotationShape only strings and plain objects, so batch 04's deferred trigger 4 is gone and both
    stay neutral (no directive). shapePaths.ts and createShape.tsx have no hooks or closures, so neutral.
    MorphRotationShape keeps its directive (hooks + rAF).
- consumer impact: ShapeMorphSpinner and DropdownCaret now render from a React Server Component (before,
  Flight failed serialising the shape functions). `shapes` accepts `Shapes.*` keys as well as components.
  Drawing is unchanged.
- breaking: no (additive; both `shapes` props are under CHANGELOG [Unreleased])
- verified:
  - `shapes-serializable.mjs` on the after bundle → three PASS lines (`"cookie", "clover", "puff",
    "squircle", "pentagon", "capsule"`; `"squircle", "pixircle"`; `"clover", "puff"`), ALL PASS.
    SSR sha1 d5aef932fc2c / 28ba2db06d6e / 253074aea2c3, equal to before (drawing unchanged).
  - Markup dump: spinner ×3, caret ×2, MorphRotationShape controlled/embedded/autoplay lines byte-identical.
  - Not run: `dist-stamp-check.mjs` and Storybook (no build in this checkout; the orchestrator verifies visually).
- docs owed: usage SKILL.md (`shapes` takes components or `Shapes` keys; keys are RSC-safe);
  loading-indicators SKILL.md, both copies (the RSC bullet in WI-034 step 6); CHANGELOG [Unreleased] →
  Added: "`MorphRotationShape` / `ShapeMorphSpinner` `shapes` also accept `Shapes` keys (the RSC-safe
  form); `ShapeMorphSpinner` and `DropdownCaret` now pass keys."; the codebase skill's use-client
  "current split" can drop the ShapeMorphSpinner / DropdownCaret caveat from batch 04.

## One `createShape` factory for all 13 shapes; Figma clipPaths gone; `DsShapeComponent` brand [WI-115, F-080, F-089]
- files: new `src/components/Shapes/createShape.tsx` (not re-exported); `src/components/Shapes/BaseShape.tsx`;
  the 13 leaves `src/components/Shapes/{Arrow,Capsule,Clover,Cookie,Diamond,Double,EightLeafClover,Pentagon,Pixircle,Puff,Squircle,Star,Triple}Shape.tsx`;
  `shapePaths.ts` and `ShapeMorphSpinner.tsx` (types, as above)
- what changed:
  - Every leaf is now three statements: `import { createShape }`, the unchanged `<NAME>_SHAPE_PATH`
    constant (lines 3-4 byte-for-byte), and `export const XShape = createShape(X_SHAPE_PATH, "XShape")`.
    One render body: `<BaseShape {...props} fillColor={fillColor ?? "currentColor"}><path d/></BaseShape>`.
  - Arrow, Clover and Cookie no longer emit `<g clip-path="url(#clip…)">` wrappers or
    `<defs><clipPath id="clip0_504_97x">`. Those static ids duplicated when two were on one page.
  - Arrow, Clover, Cookie and EightLeafClover lose the redundant `fill=` on the `<path>`. The path
    inherits the same value from the `<svg style="fill:…">` that BaseIcon already sets (checked for every
    prop set: path fill == svg fill in all 20 before-lines). EightLeafClover is the maintainer's 13th
    shape and is not in the WI; it carried the same redundant attribute.
  - BaseShape.tsx: new exported type `DsShapeComponent` = `FunctionComponent<ShapeProps>` plus a
    type-only brand (a `declare const … unique symbol`; no runtime marker). `ShapeClipPath` and
    `SHAPE_VIEWBOX_SIZE` stay exported and unchanged (removing them is a public-surface trim, not this WI).
  - `ShapeInput` = `DsShapeComponent | Shapes`, so `shapes={[memo(CloverShape), …]}` or a hand-written
    component is a compile error instead of a render-time throw; the runtime throw stays.
    `SHAPE_MORPH_SPINNER_SHAPES` is typed `DsShapeComponent[]`.
- consumer impact: identical paint. Two Arrow/Clover/Cookie shapes on a page no longer share ids. The only
  possible pixel difference is a sub-pixel sliver of stroke at the 24-unit box edge that the clip used to
  trim (Arrow/Clover/Cookie with a visible stroke); the orchestrator should compare them in Storybook.
  Each shape's type is now `DsShapeComponent` (still assignable to `ComponentType<ShapeProps>`; renders as JSX).
- breaking: no. Edge only: code that calls a shape as a plain function and types the result
  `JSX.Element` now gets `ReactNode` (FunctionComponent's return type). The `shapes` narrowing is on
  unreleased props.
- verified:
  - `c2/compare.cjs` over 73 SSR lines: 53 byte-identical (the 9 other shapes × 5 prop sets, spinner,
    carets, MorphRotationShape). The 20 Arrow/Clover/Cookie/EightLeafClover lines are byte-identical once
    the clip groups, `<defs>` and path `fill=` are stripped from the before markup. ALL OK.
  - All 13 `*_SHAPE_PATH` exports equal before/after; display names unchanged; export lists identical.
  - The audit's 53-shapes check (pointed at the bundles, plus EightLeafClover): before 5 FAIL; after 27 PASS, exit 0.
  - Type probe (`c2/probe`, against the working-tree source): components, keys, mixed lists,
    `SHAPE_MORPH_SPINNER_SHAPES`, assignment to `ComponentType<ShapeProps>` and JSX use all compile;
    `memo(CloverShape)`, a hand-written component, an unknown key and an unbranded
    `ComponentType<ShapeProps>` are rejected (every `@ts-expect-error` is used) → tsc exit 0.
  - `clip0_|clip1_|ShapeClipPath|clipPath` in `src/components/Shapes` outside BaseShape.tsx → none;
    `createShape(` once in each of the 13 leaves; `ComponentType<ShapeProps>` left only in Shapes.stories.tsx.
  - `npm run lint` → exit 0. Scoreboard before → after: no metric moved.
- docs owed: codebase SKILL.md:140 (every leaf is `createShape(<NAME>_SHAPE_PATH, "<Name>Shape")`;
  `DsShapeComponent` is a type-only brand that `shapes` props require). CHANGELOG [Unreleased] → Added:
  "Type `DsShapeComponent` — the type of the DS shape components; `MorphRotationShape`/`ShapeMorphSpinner`
  `shapes` accept only these (or `Shapes` keys), so a wrapped shape is a compile error instead of a
  render-time throw." → Fixed: "`ArrowShape`, `CloverShape` and `CookieShape` no longer emit a Figma
  clipPath with a fixed `id`; two of them on one page no longer duplicate ids." (WI-057's Pentagon/Puff
  fill fix had already landed before this run, so its CHANGELOG line belongs to that record.)

## DONE
