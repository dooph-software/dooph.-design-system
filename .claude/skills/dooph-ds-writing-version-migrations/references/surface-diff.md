# The inventory: a mechanical public-surface diff

Two built trees, one JSON surface each, one diff, and a verdict for every line. `OLD` is the last release tag (`git tag` lists them). `NEW` is the release candidate.

## 1. Build both trees in scratch worktrees

```bash
git worktree add --detach ../ds-old vX.Y.Z      # the last release tag
git worktree add --detach ../ds-new <commit>    # the release candidate
(cd ../ds-old && npm ci && npm run build)
(cd ../ds-new && npm ci && npm run build)
```

- **Never build in the main checkout.** `npm run build` runs the icon-export generator, the shape-morph ease generator and `sync-tokens`, which rewrite tracked files.
- **The candidate is a commit.** If changes that will ship are still uncommitted, ask the maintainer to commit them. Failing that, copy every modified or untracked file that will ship (`git status`) into `../ds-new`, and say so in the inventory.
- **Keep the trees side by side, never nested.** A tree whose Tailwind import lacks `source(none)` scans every file under it, so a nested tree leaks into its CSS.
- A build is good only if it exits 0 and both trees hold `dist/index.d.ts`, `dist/styles.css` and `dist/theme.css`.

## 2. Extract each surface

Run the driver from the main checkout, once per tree:

```bash
node scripts/surface.mjs ../ds-old old.json
node scripts/surface.mjs ../ds-new new.json
```

`scripts/surface.mjs` reads the tree's `dist/index.d.ts` with the tree's own TypeScript, plus `src/styles/tokens.css`, `dist/theme.css`, `dist/styles.css` and `package.json`, and writes `exports`, `components`, `consts`, `types`, `functions`, `tokens` (by block, with its layer), `themeVars`, `classes` (`ds`, `textStyle`, `utilities`) and `pkg`. Every extraction step lives in `scripts/lib/surface.mjs`, and every map is sorted by key, so the same tree always gives the same bytes. Do not change what an existing lib function returns. `generate-docs.mjs` shares the lib, so add a new function or an opt-in parameter instead.

The two passes matter. The probe resolves `ComponentProps<typeof X>` at a generic component's type-parameter defaults. Without it, a polymorphic component's inherited DOM props vanish from the surface.

## 3. Diff the two surfaces

```bash
node scripts/surface-diff.mjs old.json new.json diff.md diff.json
```

It compares, for every section, the key sets (added, removed) and then each common key, and writes one line per difference. `diff.json` keeps, for every line, the JSON paths it is about. You need them to reconcile: `getPath()` (exported by the script) reads a path from a third surface.

| Section | Compare |
|---|---|
| exports | added, removed, kind (`component`/`const`/`type`/`function`, plus const-and-type), `@deprecated` |
| component props | own props added or removed (note when a removed prop is still accepted as an inherited one); type and expanded union (values added or removed); optional ↔ required; `@deprecated`; inherited-from packages; `ref` element type; generic or not |
| consts | keys added or removed; each value |
| types | expansion; type parameters; interface ↔ type alias; members added, removed or changed |
| functions | signatures |
| tokens | per block (`light` = `:root, .light`, `dark` = `.dark`, others by selector): added, removed, value; the block's cascade layer |
| theme vars | the same, over `dist/theme.css` |
| classes | `ds-*`, `text-style-*` and generated utilities, each added or removed |
| package | `exports`, `files`, `peerDependencies`, `bin`, `dependencies`, `sideEffects`, entry fields |

A change repeated identically across four or more components of a folder (every icon gaining `ref`) comes out as one line that names them all.

## 4. Triage each line

| Line | Consumer impact | Usual verdict |
|---|---|---|
| export removed or renamed | TS compile error; a native ESM import of it throws at load; CJS and some bundlers give `undefined` | breaking |
| export declared in a different folder | none (the package-root import is unchanged) | not breaking |
| prop removed | compile error, unless it is still accepted as an inherited prop | probe it |
| prop values removed, type narrowed, now required | compile error | breaking |
| prop values added, now optional | none | additive, unless a union now forbids some combinations (probe) |
| `ref` element type changed | breaks a callback ref typed to the old element; a `RefObject` may still compile | probe it |
| interface → type alias | `extends` fails for a union, and still compiles for an intersection | probe it |
| const key removed | compile error (`Const.key`) | breaking |
| `DS_COLOR_TOKENS` key removed | **silent**: `DsColor` accepts any string, and an unknown name is passed through as a CSS colour | breaking (silent) |
| token removed | **silent**: the consumer's override is no longer read | breaking (silent) |
| token value changed | visual | a "visual changes" note |
| token block's cascade layer changed | override precedence changes | breaking (behaviour) |
| theme var removed | **silent**: the consumer's utility stops generating | breaking (silent) |
| `ds-*` / `text-style-*` class removed | **silent**: unstyled markup | breaking (silent) |
| hand-written utility class removed or renamed (a selector in the tree's `src/styles/*.css` that is not `ds-*` or `text-style-*`, e.g. the `@layer utilities` block in `index.css`: `h-button`, `size-avatar`, `min-w-menu` …) | **silent**: consumers use these in markup; they ship in `styles.css` and no theme line backs them | breaking (silent). `extractClasses` files them under `utilities`, so grep the tree's `src/styles/` for each removed utility selector before calling it generated |
| generated utility added or removed | none: these are the classes components use internally; consumers running their own Tailwind get utilities from `theme.css` | not breaking; check for leaks (§7) |
| `exports`, `files` or `bin` entry removed; peer range narrowed | install or import failure | breaking |

## 5. Reconcile with the CHANGELOG

The CHANGELOG `[Unreleased]` breaking list is the record. Every diff line gets a verdict and a home: a breaking item, an Added line, or "not consumer-visible", with the reason.

- **Under-claim.** The diff (or a probe) shows a break that the list omits, calls minor, or files under a different component (a props type that `extends` another one inherits its break). Add the item.
- **Over-claim.** A "breaking" item whose before-state never shipped: it was added and then changed between OLD and NEW. Check the item against OLD's source (`git show vX.Y.Z:<path>`), not against the previous commit. Downgrade it.
- **No diff line.** A listed break with no diff line is either behaviour (§7), which you confirm by reading OLD's code, or a mistake.
- **A "pre" and "post" split helps.** When the list starts partway through the range, extract a third tree at that commit, and for each line ask whether the change is already in it. That tells you which record must explain the line.

Every breaking item ends as **before → after → consumer fix**.

## 6. TypeScript probes

Put a `__probe__/` folder in each tree. The probes import from `"../dist/index.js"`. Use a `tsconfig.json` with `strict`, `jsx: "react-jsx"`, `moduleResolution: "bundler"`, `module: "esnext"`, `target: "es2022"`, `skipLibCheck`, `noEmit` and `types: []` (the options `createDistProgram` uses). Run `node node_modules/typescript/bin/tsc -p __probe__/tsconfig.json` in each tree, one statement per line, so each error line names its probe.

- **The `extends` probe:** one `interface X_<P> extends <P> { __probe?: 1 }` for every exported `*Props` type present in both trees. Some fail already at OLD; only the new failures are breaks.
- **The usage probe:** code that is valid at OLD for each suspected break, such as a whole-union `variant` with a whole-union `size`, a removed value, a `RefObject`, a callback ref, or a default preset assigned to a mutable array. It must compile at OLD. Each line that fails at NEW is a break.
- **The fix probe:** each consumer fix as written in the skill. It must compile at NEW.

## 7. Breaks the diff cannot see, and the pitfalls

| Pitfall | Failure it causes | Do instead |
|---|---|---|
| Types read from the merged symbol | `DsColor` (a literal union plus `string & {}`) prints as `string`, and a props union reads as one arm, so real changes vanish and false ones appear | read member types from each declaration's type node, as the lib does |
| Tailwind's automatic source detection | docs, skills and planning text become "classes" in `dist/styles.css` and in the diff | the Tailwind import must keep `source(none)` plus the explicit `@source`. Any generated-utility line whose class no file under that tree's `src/` writes (allow sub-candidates of a longer token) is a leak. In NEW, fix the scope and rebuild. In OLD (an already-released tree), mark those lines "not consumer surface". Never document a leak. A story-only utility is not consumer surface either: a tree whose `emit-css.mjs` compiles `src/styles/build.css` leaves it out, while an older tree compiled `index.css`, whose scan included stories, so its CSS has them. |
| Class names only | a `ds-*` helper keeps its name but reads a different token value | check the token lines behind each surviving helper |
| Defaults are not in `dist` | a changed default silently changes the look of every no-prop caller | mechanically, run the same lib on each worktree's source: `createSourceProgram(ts, tree)`, `extractExports(ts, checker, sf, tree, <tree>/src)`, then `extractDefaults(ts, findRenderFunction(ts, checker, <export declaration>, tree))` per component, and diff the two maps (cva `defaultVariants` are not covered: check those in the diff of `src`). Or `git diff vX.Y.Z <commit> -- skills/dooph-design-system-usage/references/components.md` when both trees carry that generated file |
| Behaviour has no surface | a new throw, an ARIA role change, `cn` merge output, rem → px sizing | read `git diff vX.Y.Z <commit> -- src` for render bodies, `role=`, `throw`, and `cn`'s merge config |
| Trusting a change record's grade | breaks listed as "minor" ship unannounced; unreleased churn is listed as breaking | §5, both directions, with probes |
| A breaking item without a tested fix | the consumer's agent applies a fix that does not compile | the fix probe |

Finally, remove both worktrees with `git worktree remove --force ../ds-old` and `../ds-new`, then check `git worktree list`.
