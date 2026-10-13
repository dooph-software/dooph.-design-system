# Claim check, batch 3: codebase map and loading indicators

Checker: fresh, read-only. I checked the working tree as of 2026-10-11, on `main` with uncommitted changes.
Read-only commands run: the five generator `--check` modes. All exited 0: `sync-theme`, `generate-icon-exports`, `generate-shape-morph-ease`, `generate-docs` ("generated doc references are fresh") and `sync-skills` ("9 skills x 2 mirrors").
Recomputed from source constants:
- every number in the per-size table (13 columns × 4 sizes)
- the spring's cut-off and duration
- the ease token's stop count and peak
- the Material keyframe rescale
- the star fit scale
- Pentagon's measured symmetry
- the frame-fit spill per shape

The scratch scripts that bundle `src/` with esbuild are in the session scratchpad, not the repo.

## Summary

| Doc | Claims | TRUE | FALSE | UNVERIFIABLE |
|---|---|---|---|---|
| `.agents/skills/dooph-ds-codebase-map/SKILL.md` | 30 | 30 | 0 | 0 |
| `.agents/skills/dooph-ds-codebase-map/references/build-and-scripts.md` | 64 | 63 | 1 | 0 |
| `.agents/skills/dooph-ds-codebase-map/references/inventory.md` (spot-check: 5 rows and the 3 header counts) | 8 | 8 | 0 | 0 |
| `.agents/skills/dooph-ds-loading-indicators/SKILL.md` | 36 | 35 | 1 | 0 |
| `.agents/skills/dooph-ds-loading-indicators/references/shape-morph.md` | 44 | 42 | 2 | 0 |
| `.agents/skills/dooph-ds-loading-indicators/references/spinner-and-progress-geometry.md` | 62 | 61 | 1 | 0 |
| **Total** | **244** | **239** | **5** | **0** |

## FALSE

### 1. shape-morph.md:40, story frame class
> "(the stories use `inset-[11px]` in a 120px box)"

**Evidence:** `MorphRotationShape.stories.tsx:24-26` defines `FRAME = { width: 120, height: 120 }` and `INSET = { inset: 11 }`. Lines 41 and 111 apply it as `style={INSET}`. `grep -rn "inset-\[11" src/` returns nothing. The class survives only in old plans and audit scratch files.

**Fix:** "(the stories inset the shape 11px, as inline `style={{ inset: 11 }}`, in a 120px box: ≈9% a side)".

### 2. shape-morph.md:40, frame-fit spill figure
> "Rotation and overshoot spill about 9% past the box, so frames reserve that as padding"

**Evidence:** I measured with `polygonFromSvgPath` + `Morph` from `src/`, at frame fit and centre (0.5, 0.5). A step turns each point through at least one axis direction, so the spill past the box edge is the radius minus 0.5.

Rotation alone, per shape, as a percentage of the box:

| Shape | Spill |
|---|---|
| triple | 13.5 |
| double | 10.0 |
| squircle | 7.8 |
| cookie | 6.2 |
| arrow | 5.9 |
| pixircle | 5.4 |
| clover | 4.5 |
| capsule | 2.9 |
| eightLeafClover | 2.7 |
| pentagon | 2.0 |
| puff | 2.0 |
| diamond | 0 |
| star | inside |

The worst morph over any pair at the 1.095 overshoot is 16.6%. So ~9% holds only for the low-spill shapes, such as the caret's squircle/pixircle and clover/eightLeafClover (`DropdownCaret.tsx:49-52`). It does not hold in general: Triple and Double exceed it from rotation alone. The same "~9%" figure is in the source header `MorphRotationShape.tsx:25-26`, which is outside this batch. It is flagged here for whoever owns it.

**Fix:** "Rotation and overshoot spill past the box by an amount that depends on the shapes. Rotation alone goes up to 13.5% of the box (Triple) or 10% (Double), and 8% or less for the rest; overshoot adds more. The caret's shapes stay within about 9%. Size the frame's padding for the shapes in play."

### 3. spinner-and-progress-geometry.md:67, star fit arithmetic
> "`STAR_FIT_SCALE` (≈ 0.905 = 0.79 × 24 / 20.99)"

**Evidence:** `spinnerGeometry.ts:89-91` computes `ACTIVE_INDICATOR_SCALE * 24 / (22.4936 − 1.5)` = (38/48) × 24 / 20.9936 = **0.9050**. The expression as written, 0.79 × 24 / 20.99, gives **0.9033**. The value is right, but anyone who recomputes it from the written expression gets a different number.

**Fix:** "(≈ 0.905 = (38/48) × 24 / 20.9936)".

### 4. loading-indicators SKILL.md:8, rendered size scope
> "The rendered size is always the `--ui-size-spinner-*` token."

**Evidence:** Two members of "the family" the skill covers are not sized by that token:
- MorphRotationShape fills whatever box it is given. Its header (`MorphRotationShape.tsx:29-30`) says "It fills the box it is given and sizes nothing itself".
- WavyDivider is `width="100%"`, `height={12}` (`WavyDivider.tsx:62-63`).

Only LoadingSpinner, ProgressIndicator and ShapeMorphSpinner use the token.

**Fix:** "The rendered size of LoadingSpinner, ProgressIndicator and ShapeMorphSpinner is always the `--ui-size-spinner-*` token."

### 5. build-and-scripts.md:72, init-skills output
> "after copying prints the `styles.css` import line"

**Evidence:** `bin/init.mjs:170-185` prints two forms and a pointer:
- a JS-entry form: `import '@dooph-software/design-system/styles.css';`
- a CSS-entry form with three lines: `@import "tailwindcss";`, `…/styles.css`, `…/theme.css`
- a pointer to the dooph-design-system-setup skill

So it prints more than one line, and the CSS form includes `theme.css`.

**Fix:** "after copying it prints the stylesheet imports: a JS-entry `styles.css` import, or a CSS-entry block of `tailwindcss`, `styles.css` and `theme.css`. It then points to the setup skill."

## UNVERIFIABLE

None.

## TRUE (claim → evidence)

### codebase-map SKILL.md

**Overview and inventory**
- `dist/` is compiled from `src/`, and generators write parts of `src/` → `package.json` build script; generator headers.
- The inventory lists exports, header contract and "use client" status → `inventory.md:5-13`.

**`src/index.ts`**
- It is the only public entry (`exports["."]`) → `package.json` `exports`.
- It re-exports every `src/components/<Folder>/index.ts`, plus `cn`, `DS_TW_MERGE_CONFIG`, `DS_COLOR_TOKENS`, `resolveDsColor`, `DsColor` and `DsColorToken`. Evidence: all 42 folders have an `index.ts`, each exported once (loop check), and `src/index.ts:46-49`.

**Component folders and utils**
- `IconSize` is in `Icons/BaseIcon.tsx` → `BaseIcon.tsx:38,44`.
- `Modal/dialogShell.tsx` and `MorphRotationShape/engine/` exist → `ls`.
- Public utils `cn.ts` and `color.ts`; internal `composeRefs.ts` (`useComposedRefs`, `composeRefs.ts:18`) and `length.ts` (`toPxLength`, `length.ts:2`), which are not in `src/index.ts`; generated `twMergeTheme.ts` (header line 1).

**Stylesheets**
- `build.css` is `@import "./index.css"` plus `@source not "../**/*.stories.tsx"` → `build.css:6-7`.
- `index.css` holds:
  - `@property` registrations (31-78)
  - custom variants (12-13)
  - the generated `@theme` block between markers (89-229)
  - the `.text-style-*` roles (248-348)
  - keyframes (1135-1252)
  - `.ds-expr-caret-shape` (1013)
- `dooph-component-tokens.css` holds `ds-*` helpers for motion, focus, disabled, overlay, slider, progress-ring, sizing and `.ds-chat-prose`. `ds-*` rules also sit in `index.css` (`.ds-spinner-*`, `.ds-shape-morph`).

**Skills**
- `skills/` ships → `package.json` `files`.
- `.claude/skills` and `.agent/skills` are generated copies → the `sync-skills.mjs` header; `git ls-files -s` shows all 156 entries at mode 100644, no symlinks.

**Generated-files table** (every lint check name verbatim at `check-conventions.mjs:681-709`)

| Row | Evidence |
|---|---|
| theme | `sync-theme.mjs:1-25`; triggers listed in `twMergeTheme.ts:2-3` |
| icons | `generate-icon-exports.mjs` |
| shape-morph | markers at `tokens.css:330,333` |
| docs | four outputs at `generate-docs.mjs:714-717,668` |
| mirrors | `sync-skills.mjs` |

**Build**
- The build order is icons → shape-morph ease → sync-tokens → `build:js` → `package.json`. tsup `onSuccess` runs `add-use-client` and `emit-css` → `tsup.config.ts:63-67`.
- `index.css:1,3` has `source(none)` plus `@source "../**/*.{js,ts,jsx,tsx}"`.
- Storybook compiles `index.css` → `.storybook/preview.ts:2`.
- Only non-story `src` classes ship → `build.css:7`.

**Rules**
- `build`, `build:watch` and `prepublishOnly` rewrite tracked files, because each generator writes unconditionally (`generate-icon-exports.mjs` writeFile; `generate-shape-morph-ease.mjs` writeFileSync; `sync-theme.mjs` `emit`). They run no lint.
- `build:js`, `build:css` and `build-storybook` write only to `dist/` and `storybook-static/`, both gitignored (`.gitignore:5,9`).
- `prep-release:*` runs `npm version`, then build, then `git push --follow-tags`.

**Common mistakes and verification**
- The `SegmentedTabSelect.tsx:67` comment exists, and the file has no header contract.
- The blast-radius recipe is in `dooph-ds-editing-tokens/references/recipes.md:48`.
- `lint` is `tsc --noEmit && node scripts/check-conventions.mjs`.
- Storybook ports are 6006 (`package.json`) and 6007 (`.claude/launch.json`).

### build-and-scripts.md

**npm scripts table (12 rows)**
- Every row matches `package.json` `scripts` word for word in effect.
- tsc scope is the tsconfig `include` (`["src","tsup.config.ts"]`), which leaves `.storybook` out.

**Tests:** there is no `test` script, and `find src scripts -name "*.test.*"` finds nothing.

**Commands without npm scripts**
- `generate-docs` regenerates 4 files, and only the marked block of client-references (`generate-docs.mjs:9-35`).
- `sync-skills` copies into the two mirrors.
- `--fixtures` runs over `scripts/check-conventions.fixtures/` and must catch exactly its own fixtures (header lines 11-17). Nuance: only checks that have fixtures run; repo-level checks are skipped.
- The `--check` behaviour of all five generators (stale line, CRLF=LF, exit 1) is confirmed in each header, and by running them.
- `surface.mjs` and `surface-diff.mjs` usage matches their headers.

**Build steps**
- The icon barrel's format, sort and `export const` failure are confirmed (`generate-icon-exports.mjs:18-46`).
- Shape-morph markers, and the throw when a marker is missing (`generate-shape-morph-ease.mjs:22`).
- sync-theme:
  - first `:root` block only
  - prefix rules (`sync-theme.mjs:266-290`) and the `ui-font-(body|button|…)` families
  - `ALIASES` / `EXCLUDED`
  - three outputs
- tsup:
  - `entry` and its excludes
  - esm+cjs, dts, splitting, metafile, sourcemap, clean
  - externals
  - `treeshake` left unset, with the reason given
- `add-use-client`:
  - prologue rule, and the throw on a stray line (`add-use-client.mjs:85-90`)
  - metafiles
  - `.map` shift (139-145)
  - metafiles deleted (151-154)
- `dropCjsSourceMaps`.
- `emit-css` runs `npx tailwindcss -i src/styles/build.css -o dist/styles.css` and copies `theme.css`.
- The build never runs lint, docs or skills.

**Tailwind scan:** `index.css` lines 1-3; the `build.css` content.

**Package surface**
- `exports`
- main = cjs, module = js, types = d.ts
- `files` list and negations
- `sideEffects`
- peers `>=19`
- bin

**init-skills**
- Three targets, Y/n each, merge (`cp force`).
- Nothing selected → returns before copying or printing.
- `--yes` / `-y`.
- On stdin close, "" means yes (`init.mjs:54-57,129`).
- It modifies nothing else.

**Mirrors:** canonical source, copy and remove, real files, root unlink, `--check` byte-for-byte with CRLF as LF, `skills/` not mirrored (`sync-skills.mjs:5-35`).

**Header contracts**
- The four scripts carry `## behavior` / `## constraints`.
- Check names and whys are a contract.
- A new check is appended to `CHECKS` with a fixture.
- Three allowlists (`check-conventions.mjs:145,205,215`).
- `generate-docs` reads source, never `dist/`, and its output is deterministic.
- The `lib/surface.mjs` roles.

**Storybook**
- `main.ts`: stories glob, framework, addon-docs, `tailwindcss()` plugin, `STORYBOOK_BASE_PATH` sets `base`.
- `preview.ts` imports `index.css`; its Theme toolbar toggles `.dark`; there is no `color` matcher.
- The four font families come from `preview-head.html`, which `files` excludes.
- Ports.

**CI:** both workflows run `npm ci`, then lint, then build-storybook or publish, as described.

### inventory.md (spot-check)
- `318 files; 40 open with a header contract; 27 are on the "use client" allowlist`:
  - `find src -type f | wc -l` returns 318
  - `grep -rl "## behavior\|## constraints" src` returns 40
  - the `USE_CLIENT_ALLOWLIST` block has 27 entries
- `spinnerGeometry.ts` row: 13 exports, matching the source.
- `MorphRotationShape.tsx` row: 2 exports, behavior and constraints, allowlist `yes` (`check-conventions.mjs:182`).
- `waveGeometry.ts` row: 4 exports.
- `ShapeMorphSpinner.tsx` row: 3 exports, no header contract, not on the allowlist.
- `composeRefs.ts` row: `useComposedRefs`.
- `generate-docs --check` reports the file fresh.

### loading-indicators SKILL.md
- **Geometry and clocks:** geometry is TS numbers in user units, and clocks are CSS on tokens → `LoadingSpinner.tsx`, `ProgressIndicator.tsx` and `MorphRotationShape.tsx` headers.

**Family table**
- LoadingSpinner: `flat`/`spokes`/`star`, CSS only.
- ProgressIndicator: `flat`/`wavy`; flat moves one transitioned `--ds-pi-progress`, wavy is driven by the consumer.
- ShapeMorphSpinner = autoplay.
- MorphRotationShape: 3 modes, a CSS transition sampled by rAF. It is the only real `"use client"` in these 5 folders: a prologue grep finds only `MorphRotationShape.tsx:56`.
- WavyDivider: 20/40 tiles, static.

**Shared props:** `LoadingSpinnerSize` is 16/22/32/40 (`SPINNER_DIAMETERS`, tokens at 517-520). Colour defaults to primary through `resolveDsColor`. Tracks are `--ui-color-border-primary`. ProgressIndicator throws on out-of-range values and NaN (`ProgressIndicator.tsx:314`).

**Rules 1-11, each against code and lint**
1. No clock in JS. Lint names are verbatim (`check-conventions.mjs:469,675`).
2. The token goes through `style`, and the numbers stay in attributes and the `viewBox`. The cited lint check exists (595). Nuance: the lint catches `var()` in attributes, not a JS size table.
3. One open two-lap path (`twoLapCirclePathFrom`, no `Z`).
4. `1 − 0.72 − 2·4/43.98 = 0.098` at `sm` (recomputed).
5. Only `--ds-pi-progress` transitions, and gap-on is unregistered (`dooph-component-tokens.css:280-292`).
6. Flat fades through opacity; wavy returns a `null` track and omits the path at 0.
7. `d` and `transform` are set only on the first render (`initial` ref).
8. `widenRange` and `segmentAt`, with no clamping of v.
9. Listeners sit only on its own span, filtered by `e.target === span`.
10. The spring is in `shapeMorphSpring.mjs` and the token is generated.
11. The vendored headers say fixes go in `./svgPath.ts`.

**Common mistakes:** the "`SPINNER_DIAMETERS` is viewBox" row, the 1.095 peak (recomputed as 1.0947), and the 1ms global block (`tokens.css:926-930`).

**Verify section:** all ten stories exist under `Progress/` or `Bits & Pieces/`. The reduced-motion outcomes come from `index.css:874-883,974-984`.

### shape-morph.md

**Motion model table**
- step registered, `inherits: false` (46-50)
- lean registered (56-60)
- clock registered, with keyframes (1135-1141)
- target and nudge unregistered
- `.ds-shape-morph` declarations and transitions (857-864)

**Drawn value and sampling**
- The drawn value v = step + lean, and the target = target + nudge.
- The sampling loop starts on own-span `transitionrun` (step or lean), and on `animationstart`/`animationiteration` of `ds-shape-morph-clock`, which also increments `autoTarget`.
- Each frame makes one `getComputedStyle` call.
- The loop stops at an EPSILON of 0.001 against both the target and the previous value.
- `onStepComplete` fires on a new whole stop only.
- In controlled mode the loop also starts directly.

**Segment logic**
- `widenRange` takes the floor/ceil of settled and target, resetting on landing.
- `segmentAt` clamps into `[lo, hi−1]`.
- The morph uses `asCubics(v − segment)`, with a linear angle.

**Modes**
- autoplay turns 90° and has no `restingAngle` prop.
- controlled requires an integer, always moves forward, and goes directly.
- embedded: DropdownCaret open sets the target to 1 (`index.css:1042-1043`).
- `shapes` needs at least two, or it throws.
- Keys are the form a Server Component can pass.
- A remount happens on an element change (`useShapesKey`).

**`restingAngle`**
- `stepTurn(prev, restingAngle, symmetry, 90)`.
- Symmetry is measured about (0.5, 0.5), with a maximum of 12 and a tolerance of 0.01.
- The turn is the nearest non-negative candidate and never 0.
- Pentagon's measured symmetry is 1, so it steps 360°.

**Fit**
- `toPathD(cubics, 100)` with `toFixed(2)`, `viewBox 0 0 100 100`, `overflow-visible`, `currentColor`.
- `rotationSafeScale` formula and `ACTIVE_INDICATOR_SCALE` 38/48 re-centred (`geometry.ts:4,38-81`).
- Passive spin `<g>`.
- `rotate(angle 50 50)` only, for frame fit.
- `polygonFromSvgPath` normalises by viewBox 24. Pentagon measured 23.29 units tall.

**Timing table**

| Value | Source | Recomputed |
|---|---|---|
| duration | 498ms | `buildEase().durationMs` = 498 |
| ease stops | 65 | 65 |
| ease peak | — | 1.0947 |
| interval | 650ms | — |
| passive spin | 4666ms | — |
| nudge | 0.15 | — |

- The `timing` prop maps to `timingVars`; a number means ms.

**Spring**
- Constants: 0.6 / 200 / 0.1 / 200 / 64.
- Cut-off is 297.66ms ≈ 298ms, so 298 + 200 = 498ms.
- Hermite settle.

**Reduced motion:** transitions run at `var(--ui-motion-duration-fast)`, which collapses to 1ms; autoplay and spin get `animation: none`. The spinner rests on shape 0 (cookie).

**ShapeMorphSpinner:** role, label default "Loading", class `inline-block shrink-0`, size vars, `resolveDsColor`, 6 default keys in order, `SHAPE_MORPH_SPINNER_SHAPES` as components, no directive.

**Engine:** four vendored files with the faithful-port constraint, cited in `THIRD_PARTY_NOTICES.md:72-112`. The `svgPath` convexity fix, and its throw on `a` commands (`svgPath.ts:51`).

### spinner-and-progress-geometry.md

**Size spaces and roles**
- Two size spaces → the `spinnerGeometry.ts` header, with width/height attributes and the token in style.
- ShapeMorphSpinner has no unit table.
- Roles and ARIA: LoadingSpinner (`LoadingSpinner.tsx:283-290`) and ProgressIndicator (`ProgressIndicator.tsx:323-334`). `aria-labelledby` drops the default label.

**Per-size table:** every cell matches, recomputed from `SPINNER_DIAMETERS`, `SPINNER_STROKE_WIDTHS`, `SPINNER_MAX_SWEEP`, `SPINNER_SPIN_EXPONENT`, `MATERIAL_WAVELENGTH`/`MIN_WAVE_COUNT` and `ACTIVE_INDICATOR_SCALE`:

| Size | r | C | gap/C | track at max sweep | factor | turn | waves | track gone from | star px |
|---|---|---|---|---|---|---|---|---|---|
| sm | 7 | 43.98 | 0.0909 | 0.098 | 0.853 | 1535 | 5 | 0.818 | 12.67 |
| rg | 9.75 | 61.26 | 0.0816 | 0.117 | 1 | 1800 | 5 | 0.837 | 17.42 |
| md | 14.5 | 91.11 | 0.0659 | 0.148 | 1.206 | 2171 | 6 | 0.868 | 25.33 |
| xl | 18.5 | 116.24 | 0.0516 | 0.177 | 1.348 | 2427 | 8 | 0.897 | 31.67 |

**Formula bullets:** the track-gone threshold follows from `trackLen ≤ 0` (`dooph-component-tokens.css:290`).

**Flat spinner**
- Path start `−π/2 − gap/r`, with four `A` commands and no `Z`.
- Inline vars.
- Keyframes 0/0, 1/0.118, 1/0.985 (`index.css:1163-1176`). 15/126.9 = 0.1182 and 125/126.9 = 0.9850. 126.9 = 2π·20.2, the 44-unit, 3.6-stroke circle the source comment names.
- `--ui-spinner-duration` 1400ms on `ease-standard`.
- Five dash formulas (`index.css:927-965`).
- Both dashes stay inside (0, 2) laps: the end positions are at most 1 + gap and tail + 1 ≤ 1.985.
- Dash-pattern gap is 2C.
- Turn: 1400ms, linear.
- Reduced motion: grow 1, tail 0, sweep 0.72.

**Spokes and star**
- Spokes: eight paths, stroke `var(--ui-icon-stroke-width)`.
- Star: bounds as in the source comment; the transform is about (12, 12); `StarStaysInBox` exists.
- `.ds-spinner-spin` duration × time-scale.

**ProgressIndicator flat**
- Four inline vars, gap-on from the target.
- `--ds-pi-progress` registered (`dooph-component-tokens.css:25-29`) and transitioned at slow (300ms) on standard.
- Both circles rotated −90° and always mounted.
- Every formula, including the `1e6` opacity clamp.
- At p=0 the track is the full circle.
- The global 1ms.

**ProgressIndicator wavy**
- `pathLength={1}`, dasharray `{progress} 1`, not rendered at 0.
- Star of `2·waveCount` vertices at radii 1 and 0.66, starting at −π/2.
- `waveCount` formula.
- Cut formula; outer corners 0.35 with smoothing 0.4, inner corners 0.5.
- A global `cutScale`, so every lobe is identical.
- Peak normalised to r; starts at the first lobe's midpoint.
- Track: the `getWavyTrackGeometry` branches, `null` at length 0.

**WavyDivider**
- `width="100%"`, `height=12`, `<rect>` with a `userSpaceOnUse` pattern, id from `useId`.
- Tiles of 20/40; trough then crest about y = 6.
- Amplitude 2.88, controls at ×4/3. The midpoint is (3/4)·(4/3)·A = A.
- `strokeWeight` defaults to 2, with round caps and `currentColor`.
- `role="presentation"`, `aria-hidden`.

## Old false-claims register (FINDINGS.md §4): reappearances

Phrases I grepped in §4, then compared against the current docs:
- build pipeline (C-CB-216)
- icon stroke 1.5 (C-CB-147)
- track "clamps to 0, disappears" (C-LI-22, C-LI-36)
- `ds-spinner-rotate` only for spokes (C-JSDOC-index.css-5)
- 1.4s spokes timing (C-JSDOC-spinnerGeometry-2)
- no test command (C-JSDOC-waveGeometry.test-1)
- `../svgPath.ts` (C-HDR-cubic-2)
- `.brand` colour (C-LIC-2/4)
- missing `index.ts` (C-CB-223)
- mirror symlinks (C-CB-30)
- add-use-client first 5 lines (F-011)
- neutral modules passing components (F-012)

**None reappears.** Each doc now states the corrected fact:

| Old claim | Current doc |
|---|---|
| C-CB-216, build pipeline | Includes shape-morph ease and add-use-client |
| C-LI-22, C-LI-36, track at 100% | Track fades (flat) or is `null` (wavy) |
| C-CB-30, mirror symlinks | Mirrors are real files |
| F-011, first 5 lines | Directive-prologue rule |
| F-012, neutral modules | ShapeMorphSpinner and DropdownCaret pass `Shapes` keys |

## Cross-doc contradictions

1. **Main-checkout guidance for `build:js` / `build:css`.**
   - codebase-map SKILL.md:43: "Run them in a scratch worktree; `build:js`, `build:css` and `build-storybook` write only gitignored output." This reads as: safe in the main checkout.
   - build-and-scripts.md:16-17 labels `build:js` "Scratch worktree only" and `build:css` "CSS-only rebuild of `dist/`; scratch worktree only".

   The code backs the SKILL: tsup, `add-use-client` and `emit-css` write only to `dist/`, which is gitignored. Align the reference: drop "Scratch worktree only" from those two rows, or state why it applies.
2. **Frame-fit spill figure.** shape-morph.md:40 and the source header `MorphRotationShape.tsx:25-26` both say ~9%. The measurement in FALSE item 2 shows this holds only for low-spill shapes. Fix both together.

There are no contradictions with the maintainer decisions. The loading-indicator docs keep motion in CSS on tokens, describe ShapeMorphSpinner, ProgressIndicator, LoadingSpinner and WavyDivider as directive-free, and let the consumer's `style` merge last (`ShapeMorphSpinner.tsx:66`, `ProgressIndicator.tsx:137`).

## Fixes

All re-verified against the code before editing.

1. shape-morph.md:40 story frame class: FIXED. Now "the stories inset the shape 11px, as inline `style={{ inset: 11 }}`, in a 120px box: about 9% a side" (stories use `INSET = { inset: 11 }`).
2. shape-morph.md:40 spill figure: FIXED. Now says spill depends on the shapes (rotation alone 13.5% Triple, 10% Double, 8% or less for the rest; overshoot adds more; the caret's shapes within about 9%) and to size padding for the shapes in play. Contradiction 2 also FIXED in the source header `MorphRotationShape.tsx:25-27` (comment only): "~9%" replaced by the same shape-dependent wording.
3. spinner-and-progress-geometry.md:67 star fit arithmetic: FIXED. Now "(≈ 0.905 = (38/48) × 24 / 20.9936)".
4. loading-indicators SKILL.md:8 size scope: FIXED. Now "The rendered size of LoadingSpinner, ProgressIndicator and ShapeMorphSpinner is always the `--ui-size-spinner-*` token."
5. build-and-scripts.md:72 init-skills output: FIXED. Now lists the JS-entry `styles.css` import or the CSS-entry block of `tailwindcss`, `styles.css` and `theme.css`, then the pointer to the setup skill (matches `bin/init.mjs:175-188`).
6. Contradiction 1 (build:js / build:css "Scratch worktree only"): FIXED. The `build:js` row now says "Writes only gitignored `dist/`" and the `build:css` row "CSS-only rebuild of `dist/` (gitignored)". `build`, `build:watch` rows keep "scratch worktree only" (they run the tracked-file generators), which agrees with SKILL.md:43. `package.json`: `build:js` is plain tsup, `build:css` is `emit-css.mjs`.

Claims files updated: dooph-ds-loading-indicators.md (3 claims), dooph-ds-codebase-map.md (1 claim).

## Fix verification

Checked 2026-10-11 against the working tree. `npm run lint` exit 0 (30 checks); `sync-skills --check` exit 0 (9 skills x 2 mirrors).

- FALSE 1 (story frame class): VERIFIED. shape-morph.md:40 now says inline `style={{ inset: 11 }}` in a 120px box; MorphRotationShape.stories.tsx:24-26 defines `INSET = { inset: 11 }`, `FRAME` 120x120. 11/120 = 9.2%, so "about 9% a side" is true.
- FALSE 2 (spill figure): VERIFIED. shape-morph.md:40 and the MorphRotationShape.tsx:25-27 header comment now give the shape-dependent figures from the checker's measurement (Triple 13.5, Double 10, others at most 8), with the caret's shapes (DropdownCaret.tsx:49-52) "within about 9%". I did not re-measure; the wording is soft and consistent with the earlier measurement. The header edit is comment-only and does not contradict any constraint.
- FALSE 3 (star fit arithmetic): VERIFIED. geometry.md:67 now reads (38/48) x 24 / 20.9936, which matches spinnerGeometry.ts:89-91 (STAR_EXTENT = 22.4936 - 1.5 = 20.9936).
- FALSE 4 (rendered size scope): VERIFIED. SKILL.md:8 now limits the claim to LoadingSpinner, ProgressIndicator and ShapeMorphSpinner; MorphRotationShape.tsx:29-30 says it sizes nothing itself.
- FALSE 5 (init-skills output): VERIFIED. build-and-scripts.md:72 matches bin/init.mjs:170-185 (JS-entry styles.css import; CSS-entry tailwindcss/styles.css/theme.css; pointer to the setup skill) and still says nothing is printed if all targets are deselected.
- Contradiction 1 (build:js / build:css): VERIFIED. build-and-scripts.md:16-17 now says they write only gitignored `dist/`; package.json:55-56 (plain tsup, emit-css). build and build:watch keep "scratch worktree only", which is right because they run the tracked-file generators.
