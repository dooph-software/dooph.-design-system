# WI-C4b — work items (continuation of WI-C4)

Continues `docs/audit/_work/final/WI-C4.md` @ b436647. The shared verification recipes **V-LINT**, **V-BUILD**, **V-RENDER** and **V-PROBE** are defined at the top of WI-C4.md and are used here by name, unchanged.

### WI-C4-22: Make BaseIcon's color prop drive currentColor, and drop the per-icon fill re-wiring
- status: todo
- addresses: [F-063]
- depends_on: []
- phase: P3
- risk: low — `color` is only applied as CSS `color` when the prop is given, so icons rendered without it (and every Shape, which never passes `color`; BaseShape.tsx:59-63) keep inheriting the surrounding text colour exactly as today. With the prop, every `currentColor` paint inside the icon now follows it: TagIcon's dot changes from the inherited text colour to the prop colour (visible only below stroke-width 1). HeartFillIcon and StopFilledIcon render identically (their fills already followed `color`).
- semver: patch
- files:
  - modify: `src/components/Icons/BaseIcon.tsx:56-62 @ b436647`
  - modify: `src/components/Icons/HeartFillIcon.tsx:3-7 @ b436647`
  - modify: `src/components/Icons/StopFilledIcon.tsx:3-14 @ b436647`
  - modify: `src/components/Icons/Icons.stories.tsx:2-18 @ b436647`, `:189-205`
  - modify: `CHANGELOG.md` `[Unreleased]`
- anchor:
  ```tsx
  // BaseIcon.tsx:56-62
      style={{
        width: size,
        height: size,
        fill: fillColor ?? undefined,
        stroke: strokeColor ?? color ?? "currentColor",
        strokeWidth: strokeWidth ?? "var(--ui-icon-stroke-width)",
      }}
  ```
  ```tsx
  // StopFilledIcon.tsx:3-14
  export const StopFilledIcon = ({ color, ...props }: IconProps) => (
    <BaseIcon {...props} color={color}>
      {/* BaseIcon maps `color` to stroke only, so the fill is wired up here to
          keep both in sync. Stroke is kept so the filled and outlined variants
          share the same outer bounds. */}
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="2"
        fill={color ?? "currentColor"}
  ```
- why: `color` reaches only the stroke, so every child painted with `currentColor` ignores it; two filled icons copy a workaround and TagIcon does not, and every future filled glyph inherits the trap (F-063). Setting CSS `color` once in BaseIcon makes stroke and `currentColor` fills agree by construction.
- steps:
  - [ ] 1. Reproduce (V-BUILD worktree from HEAD, before editing): V-RENDER `renderToStaticMarkup(React.createElement(ds.TagIcon,{color:'red',strokeWidth:0.5}))` prints an `<svg style="…stroke:red…">` with no `color:` in its style and `<circle … fill="currentColor">`, i.e. the dot paints the inherited text colour, not red. V-PROBE of that markup inside `<div style="color:blue">`: `getComputedStyle(circle).fill` → `rgb(0, 0, 255)`. Also save HEAD's V-RENDER output of `React.createElement(ds.SquircleShape,{size:24})` to `docs/audit/_work/scratch/WI-C4-22/squircle-head.html` for step 6.
  - [ ] 2. BaseIcon.tsx:56-62 — add CSS `color` from the prop (only when given, so inheritance is untouched otherwise):
    ```tsx
    // before
        style={{
          width: size,
          height: size,
          fill: fillColor ?? undefined,
          stroke: strokeColor ?? color ?? "currentColor",
          strokeWidth: strokeWidth ?? "var(--ui-icon-stroke-width)",
        }}
    // after
        style={{
          width: size,
          height: size,
          // `color` sets CSS color, so every `currentColor` paint in the icon —
          // the default stroke and any filled child — follows the prop.
          color: color ?? undefined,
          fill: fillColor ?? undefined,
          stroke: strokeColor ?? "currentColor",
          strokeWidth: strokeWidth ?? "var(--ui-icon-stroke-width)",
        }}
    ```
    `stroke` drops the `color` arm because `currentColor` now resolves to it; `strokeColor` still wins over `color` for the stroke, as before.
  - [ ] 3. Remove the two re-wirings:
    ```tsx
    // HeartFillIcon.tsx:3-7 before
    export const HeartFillIcon = ({ color, ...props }: IconProps) => (
      <BaseIcon {...props} color={color}>
        <path
          d="M15 6.375c0 …"
          fill={color ?? 'currentColor'}
    // after (the `d` string is unchanged)
    export const HeartFillIcon = (props: IconProps) => (
      <BaseIcon {...props}>
        <path
          d="M15 6.375c0 …"
          fill="currentColor"
    ```
    ```tsx
    // StopFilledIcon.tsx:3-14 before: the anchor above
    // after
    export const StopFilledIcon = (props: IconProps) => (
      <BaseIcon {...props}>
        {/* Filled with currentColor, which BaseIcon sets from `color`. Stroke is
            kept so the filled and outlined variants share the same outer bounds. */}
        <rect
          x="3"
          y="3"
          width="18"
          height="18"
          rx="2"
          fill="currentColor"
    ```
    TagIcon.tsx:7 (`fill="currentColor"`) stays as is; it is now correct.
  - [ ] 4. Icons.stories.tsx: add `import { HeartFillIcon } from "./HeartFillIcon";`, `import { StopFilledIcon } from "./StopFilledIcon";` and `import { TagIcon } from "./TagIcon";` to the import block (:2-18, alphabetical), and append to the `Colors` story's flex row (after :202) one filled and one mixed icon so a stroke/fill mismatch is visible:
    ```tsx
          <HeartFillIcon size={IconSizes.md} color="var(--color-prominent-color)" />
          <StopFilledIcon size={IconSizes.md} color="var(--color-prominent-color)" />
          <TagIcon size={IconSizes.md} strokeWidth={0.5} color="var(--color-prominent-color)" />
    ```
    If WI-C4-13 has landed first, the constant is `IconSize`, not `IconSizes`; use the name the file imports at that point.
  - [ ] 5. CHANGELOG.md `[Unreleased]` → `### Fixed`: "`color` on any icon now sets CSS `color`, so filled parts drawn with `currentColor` (e.g. `TagIcon`'s dot) follow it." No header contract, codebase-skill or consumer-skill line states the old stroke-only behaviour (`rg -n "stroke only" src skills .agents` → only StopFilledIcon.tsx:5, rewritten in step 3).
  - [ ] 6. Verify: V-LINT. `rg -n "fill=\{color" src/components/Icons` → 0 hits. V-BUILD (porcelain: the four source files + CHANGELOG.md; `src/components/Icons/index.ts` must not change, no icon file is added or removed). V-RENDER step 1's call → svg style contains `color:red`; V-PROBE → `getComputedStyle(circle).fill` = `rgb(255, 0, 0)`. V-RENDER `React.createElement(ds.SquircleShape,{size:24})` is byte-identical to `squircle-head.html` from step 1 (shapes unaffected). Storybook `Icons/BaseIcon` → `Icon Colors`: heart, stop and tag all render in the prominent colour, the tag's centre dot included.
  - [ ] 7. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: `rg -n "fill=\{color" src/components/Icons` → 0 hits; V-RENDER of `TagIcon` with `color:'red'` carries `color:red` on the svg; the `Icon Colors` story contains a filled icon.
- log:
  - 2026-10-02 — created by audit (continuation agent W4b)

### WI-C4-23: Make the danger focus shadow a token (--ui-shadow-focus-danger) and delete sync-theme's COMPUTED escape hatch
- status: todo
- addresses: [F-067]
- depends_on: [WI-C4-10]
- phase: P3
- risk: low — the `shadow-focus-danger` utility resolves to the same `0 0 0 4px var(--ui-color-focus-ring-danger)` in both modes; only its source moves from a script literal to a token consumers can override. No component uses the utility (`rg shadow-focus-danger src --glob '!styles/{index,theme}.css'` → 0 hits), so no component paint can change. The generated `@theme` block in index.css and theme.css changes shape (one entry moves up, the comment and blank line go), which is expected regenerated output.
- semver: minor
- files:
  - modify: `src/styles/tokens.css:557-558 @ b436647` (add one line after :558)
  - modify: `src/styles/tokens.css` `.dark` alias group created by WI-C4-10 (add one line)
  - modify: `scripts/sync-theme.mjs:232-245 @ b436647`
  - regenerate (via `npm run sync-tokens`, never by hand): `src/styles/index.css:191-207 @ b436647` (`__GENERATED_THEME_*__` block), `src/styles/theme.css:136-152 @ b436647`
  - modify: `skills/dooph-design-system-theming/references/token-contract.md:89 @ b436647`, `CHANGELOG.md` `[Unreleased]`
- anchor:
  ```js
  // scripts/sync-theme.mjs:232-245
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
  ```css
  /* src/styles/tokens.css:557-558 */
    --ui-shadow-focus-prominent: 0 0 0 4px var(--ui-color-focus-ring-prominent);
    --ui-shadow-focus-primary: 0 0 0 4px var(--ui-color-focus-ring-primary);
  ```
- why: Two of the three focus shadows are tokens; the danger one is a 4px literal in a build script whose header names tokens.css the "Single source of truth", so consumers cannot retune it and a maintainer changing ring geometry in tokens.css misses it (F-067). With the token in place the generic `ui-shadow-*` mapping (sync-theme.mjs:182-183) emits the utility and the one-entry escape hatch disappears.
- steps:
  - [ ] 1. Baseline: `rg -n "shadow-focus-danger" src/styles/index.css src/styles/theme.css` → `index.css:207` and `theme.css:152`, both `--shadow-focus-danger: 0 0 0 4px var(--ui-color-focus-ring-danger);`. `rg -n -- "--ui-shadow-focus-danger" src` → 0 hits.
  - [ ] 2. tokens.css `:root, .light` — after :558 add the sibling:
    ```css
      --ui-shadow-focus-prominent: 0 0 0 4px var(--ui-color-focus-ring-prominent);
      --ui-shadow-focus-primary: 0 0 0 4px var(--ui-color-focus-ring-primary);
      --ui-shadow-focus-danger: 0 0 0 4px var(--ui-color-focus-ring-danger);
    ```
    It aliases `--ui-color-focus-ring-danger`, which `.dark` overrides (tokens.css:688), so it joins WI-C4-10's `.dark` alias group directly under that group's `--ui-shadow-focus-primary` line, text identical to `:root`:
    ```css
      --ui-shadow-focus-primary: 0 0 0 4px var(--ui-color-focus-ring-primary);
      --ui-shadow-focus-danger: 0 0 0 4px var(--ui-color-focus-ring-danger);
    ```
  - [ ] 3. scripts/sync-theme.mjs:232-245 — delete the `COMPUTED` constant and its splice:
    ```js
    // after
    const generated = [
      GEN_START,
      "@theme inline {",
      ...entries.map((e) => `  ${e}`),
      "}",
      GEN_END,
    ].join("\n");
    ```
    `rg -n "COMPUTED" scripts` → 0 hits afterwards. The header's "Single source of truth: tokens.css" (:4) is now true without exception; no header text mentions COMPUTED, so nothing else in the script changes.
  - [ ] 4. Run `npm run sync-tokens`. Expected regenerated diff in both index.css and theme.css: `+  --shadow-focus-danger: var(--ui-shadow-focus-danger);` directly after the `--shadow-focus-primary` entry, and removal of the blank line, `/* Focus ring with danger */` and the literal `--shadow-focus-danger` line before the closing `}`. Nothing else in the block may change.
  - [ ] 5. Docs: token-contract.md:89 — append `` `--ui-shadow-focus-danger` `` to the shadow token list (after `` `--ui-shadow-focus-primary` ``). token-contract.md:209 and usage SKILL.md:232 already list the `shadow-focus-danger` utility and stay true. CHANGELOG.md `[Unreleased]` → `### Added`: "Token `--ui-shadow-focus-danger` (backs `shadow-focus-danger`, previously a fixed value)." If WI-C4-10 has not yet written its CHANGELOG line, nothing else changes; if it has, its "focus-shadow" wording already covers the new alias line.
  - [ ] 6. Verify: V-LINT. `rg -n "COMPUTED|0 0 0 4px var\(--ui-color-focus-ring-danger\)" scripts src/styles/index.css src/styles/theme.css` → 0 hits. `rg -n -- "--ui-shadow-focus-danger" src/styles/tokens.css` → 2 hits (`:root` and `.dark`). `node docs/audit/_work/scratch/C4/alias-dark.cjs` → `NOT re-declared in .dark: 0` (the alias-line count rises by one over WI-C4-10's 30). V-BUILD (porcelain: tokens.css, sync-theme.mjs, index.css, theme.css, token-contract.md, CHANGELOG.md — `npm run build` re-runs sync-tokens and must leave index.css/theme.css identical to the committed regeneration). V-PROBE with `<div id="a" class="shadow-focus-danger">` under light `<html>` and inside `<div class="dark">`: `getComputedStyle(a).boxShadow` → `rgba(234, 63, 63, 0.35) 0px 0px 0px 4px` light and `rgba(234, 63, 63, 0.15) 0px 0px 0px 4px` in the island; adding `style="--ui-shadow-focus-danger: 0 0 0 2px red"` on `a` changes it to `rgb(255, 0, 0) 0px 0px 0px 2px`.
  - [ ] 7. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: `rg -n "COMPUTED" scripts/sync-theme.mjs` → 0 hits; `--shadow-focus-danger: var(--ui-shadow-focus-danger);` is the only `shadow-focus-danger` line in index.css and theme.css; V-PROBE override of `--ui-shadow-focus-danger` changes the utility's box-shadow.
- log:
  - 2026-10-02 — created by audit (continuation agent W4b)

### WI-C4-24: Record where ds-* helpers and motion systems live, and make the two straddling systems whole in one stylesheet
- status: todo
- addresses: [F-068]
- depends_on: [WI-C3-07, WI-C3-09]
- phase: P2
- risk: low — two at-rules move between files that are both plain `@import`s into one compiled sheet (index.css:5 imports dooph-component-tokens.css), and both stay outside any `@layer`, so the compiled rules are the same; only their position in dist/styles.css changes. `@keyframes` and `@property` are not order-sensitive against selectors. What could regress: putting either at-rule INSIDE dooph-component-tokens.css's `@layer utilities { … }` (the codebase skill's reason, :569-571: a layered `@keyframes` is not reachable from an inline-style animation). Step 5 checks they compile unlayered.
- semver: none
- files:
  - modify: `src/styles/index.css:16-22 @ b436647` (remove; comment as rewritten by WI-C3-09)
  - modify: `src/styles/index.css:1029-1045 @ b436647` (remove)
  - modify: `src/styles/dooph-component-tokens.css:9-11 @ b436647` (insert the `@property` before `@layer utilities {`), `:126-127` (comment), `:668` (append the `@keyframes` after the closing `}`)
  - modify: `.agents/skills/dooph-ds-codebase/SKILL.md:34,36,569,577 @ b436647` (:34 as left by WI-C3-07)
  - modify: `.agents/skills/dooph-ds-contribution/SKILL.md:109 @ b436647`
- anchor:
  ```css
  /* src/styles/index.css:16-21 */
  /* Register so --progress-pct interpolates when LinearProgressIndicator value changes. */
  @property --progress-pct {
    syntax: "<number>";
    inherits: true;
    initial-value: 0;
  }
  ```
  ```css
  /* src/styles/index.css:1030-1045 */
  /* AI chat streaming animation (AITextPart / AIThinkingPart `streamingAnimation`).
   * Each block of streamed prose rises into place out of a blur. Every value is a
   * --ui-chat-stream-* token. Lives outside @layer with the package's other
   * keyframes. */
  @keyframes ds-chat-stream-in {
    from {
      opacity: 0;
      filter: blur(var(--ui-chat-stream-blur));
      transform: translateY(var(--ui-chat-stream-rise));
    }
    to {
      opacity: 1;
      filter: blur(0);
      transform: translateY(0);
    }
  }
  ```
  ```md
  <!-- .agents/skills/dooph-ds-codebase/SKILL.md:36 -->
      dooph-component-tokens.css ← @layer utilities: ds-* helpers (spacing, disabled states, radix origin)
  <!-- .agents/skills/dooph-ds-contribution/SKILL.md:109 -->
  3. If the token needs a `ds-*` helper class (for values that Tailwind can't express as a utility), add it to `dooph-component-tokens.css` under `@layer utilities`.
  ```
- why: Motion systems of one kind land in either stylesheet, two systems already straddle both (the chat stream class in dooph-component-tokens.css with its keyframes in index.css; `.ds-progress-*` with its `@property` in index.css), and no rule decides placement, so the next helper has two live precedents (F-068). Writing the rule down and making each system whole is cheaper than moving every system.
- steps:
  - [ ] 1. Baseline (V-BUILD worktree from HEAD): `rg -c "@keyframes ds-chat-stream-in|@property --progress-pct" dist/styles.css` → 2. V-PROBE with the worktree's dist/styles.css and `<div class="ds-chat-prose" data-streaming-animation><p id="p">x</p></div>`: `getComputedStyle(p).animationName` → `ds-chat-stream-in`; `[...document.styleSheets[0].cssRules].filter(r => r.constructor.name === 'CSSKeyframesRule' || r.constructor.name === 'CSSPropertyRule').map(r => r.name)` (top-level rules only, so unlayered) includes `ds-chat-stream-in` and `--progress-pct`. Save the output to `docs/audit/_work/scratch/WI-C4-24/baseline.txt`.
  - [ ] 2. The placement rule. codebase SKILL.md:569 — `` **Keyframes live OUTSIDE `@layer`** in `index.css`, deliberately — `` → `` **Keyframes live OUTSIDE `@layer`**, in the same stylesheet as the system that uses them, deliberately — `` (:570-571 unchanged; WI-C3-04 may rewrite :570-571, which does not overlap). Then insert after :577 (end of the sidebar-rail paragraph):
    ```md

    **Placement rule.** `dooph-component-tokens.css` holds token helpers (R8.26: a `ds-*` class for a token value Tailwind cannot express). A component motion system — its `ds-*` classes, its `@keyframes` and its `@property` registrations — lives WHOLE in one stylesheet, never split across the two; its at-rules go outside any `@layer` in that file. Systems in `index.css`: ShimmerText, RollHoverText, RollChange/FadeChangeText, UnderlineLinkText, RollingDigitsText, RevealChangeText, SidebarWithHoverIcon, MorphRotationShape / ShapeMorphSpinner (`.ds-shape-morph`, `.ds-shape-morph-passive-spin`, `@property --ds-shape-morph-step/-clock/-lean`, `@keyframes ds-shape-morph-clock/-spin`) and DropdownCaret (`.ds-dropdown-caret`, `-frame`, `-chevron`, state read from the nearest `.ds-dropdown-caret-host`). Systems in `dooph-component-tokens.css`: Slider, LinearProgressIndicator (`.ds-progress-*` + `@property --progress-pct`), CopyButton's icon swap and the AI-chat family (`.ds-chat-*` + `@keyframes ds-chat-stream-in`). A new system goes in the file that already holds its family; a new family goes in `index.css`.
    ```
  - [ ] 3. File map. codebase SKILL.md:36 →
    ```md
        dooph-component-tokens.css ← ds-* token helpers in @layer utilities (disabled states, focus rings, radix origin, menu/tooltip/toast widths, spacing) plus whole component systems: Slider, LinearProgressIndicator, CopyButton swap, AI chat (ds-chat-*); their @property / @keyframes sit outside the layer in this file
    ```
    codebase SKILL.md:34 (the index.css line, as WI-C3-07 leaves it): remove `ds-chat-*` from its list of index.css motion rules (the chat classes were never in index.css, and after step 4 neither are their keyframes) and add `ds-dropdown-caret*` if that list lacks it. contrib:109 → append one sentence: `` A component motion system (its classes plus its `@keyframes`/`@property`) is not a token helper: keep it whole in one stylesheet — see the codebase skill's "Placement rule". ``
  - [ ] 4. Move the two at-rules (cut, then paste unchanged except the comments shown):
    - index.css: delete :16-21 (the `--progress-pct` comment + `@property`, with the comment as WI-C3-09 left it) and the blank line :22, so the SidebarWithHoverIcon comment (:23) follows the blank line after `@plugin` (:14-15). Delete :1029-1045 (the blank line, the chat comment and the keyframes); the file then ends at the `ds-underline-wipe` keyframes' `}` (:1028).
    - dooph-component-tokens.css: between the header comment's closing ` */` (:9) and `@layer utilities {` (:11), insert:
      ```css

      /* LinearProgressIndicator — registered so --progress-pct is typed as a
       * <number>; .ds-progress-* below transition width/left from it. Outside
       * @layer: an at-rule, kept with its system (codebase skill, Placement rule). */
      @property --progress-pct {
        syntax: "<number>";
        inherits: true;
        initial-value: 0;
      }
      ```
      If WI-C3-09 has already rewritten the comment, carry its wording instead and change only "(.ds-progress-* in dooph-component-tokens.css)" to "(.ds-progress-* below)". dooph-component-tokens.css:126-127 (or WI-C3-09's rewrite of it): if it still says "registered @property in index.css", change "in index.css" to "at the top of this file".
    - dooph-component-tokens.css: after the final `}` (:668) append the chat keyframes, comment adjusted:
      ```css

      /* AI chat streaming animation (AITextPart / AIThinkingPart `streamingAnimation`).
       * Each block of streamed prose rises into place out of a blur. Every value is a
       * --ui-chat-stream-* token. Outside @layer (an inline-style animation cannot
       * reach a layered @keyframes), and in this file beside .ds-chat-prose. */
      @keyframes ds-chat-stream-in {
        from {
          opacity: 0;
          filter: blur(var(--ui-chat-stream-blur));
          transform: translateY(var(--ui-chat-stream-rise));
        }
        to {
          opacity: 1;
          filter: blur(0);
          transform: translateY(0);
        }
      }
      ```
    LinearProgressIndicator.tsx:8-9 ("via registered `@property --progress-pct`") names no file, so its header contract stays true.
  - [ ] 5. Verify: V-LINT. `rg -n "@property --progress-pct|@keyframes ds-chat-stream-in" src/styles` → exactly 2 hits, both in `dooph-component-tokens.css`. `rg -nF "ds-* helpers (spacing, disabled states, radix origin)" .agents/skills` → 0 hits. `rg -c "ds-shape-morph" .agents/skills/dooph-ds-codebase/SKILL.md` and `rg -c "ds-dropdown-caret" .agents/skills/dooph-ds-codebase/SKILL.md` → ≥ 1 each. `npm run sync-tokens` → generated block unchanged (no token touched). V-BUILD (porcelain: index.css, dooph-component-tokens.css and the two skill files). Re-run step 1 in the new worktree: output identical to `baseline.txt` (same `animationName`; both at-rules still top-level). Storybook `AI/AITextPart` streaming story: blocks still rise out of blur; `LinearProgressIndicator` story: changing `value` still animates the fill.
  - [ ] 6. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: `@property --progress-pct` and `@keyframes ds-chat-stream-in` each appear once in src/styles, both in dooph-component-tokens.css outside `@layer`; the codebase skill states the placement rule and its file map no longer limits dooph-component-tokens.css to "spacing, disabled states, radix origin"; the step-1 probe output equals the baseline.
- log:
  - 2026-10-02 — created by audit (continuation agent W4b)

### WI-C4-25: Fix or document the non-breaking dead CSS: document .ds-selection, drop the dead dark sticker opacity, keep one TableRow divider rule, make ToastClose's colour override win
- status: todo
- addresses: [F-076]
- depends_on: []
- phase: P3
- risk: low — four independent edits. (1) Docs only. (2) Deletes a `.dark` declaration nothing reads (`rg sticker-bg-opacity-secondary src` → the `:root` definition, its one light reader at tokens.css:613, the `.dark` line and a comment), so no computed paint changes. (3) Visible: the last TableRow loses its bottom border, so the table's bottom edge drops from 2px (row border + Table border, Table.tsx:27) to the Table's own 1px, matching its top and sides. A consumer who renders TableRows outside a bordered `Table` loses the line under the last row. (4) Visible: on hover/press, ToastClose keeps the toast's text colour instead of switching to `--ui-color-ghost-foreground-active`; the ghost hover wash still shows.
- semver: patch
- files:
  - modify: `skills/dooph-design-system-theming/references/token-contract.md:23-24 @ b436647` (insert a section), `:112`
  - modify: `src/styles/tokens.css:707-708 @ b436647`, `:711`
  - modify: `src/components/Table/Table.tsx:112-113 @ b436647`
  - modify: `src/components/Toast/Toast.tsx:169 @ b436647`
  - modify: `CHANGELOG.md` `[Unreleased]`
- anchor:
  ```css
  /* src/styles/tokens.css:707-711 (.dark) */
    /* Secondary's own opacity variable drops to 60%, but the dark sticker WASH
     * does not use it — Figma binds `color-sticker-bg-secondary` to the shared
     * 20% opacity in dark. Danger stops being a composite at all: both the
     * content and the wash are a literal white, not danger-primary/secondary. */
    --ui-sticker-bg-opacity-secondary: 60%;
  ```
  ```tsx
  // src/components/Table/Table.tsx:112-113
          "grid border-b border-border-primary",
          "not-last:border-b",
  // src/components/Toast/Toast.tsx:169
        "shrink-0 text-current hover:text-current active:text-current",
  ```
- why: Each item reads as if it does something it does not (F-076): `.ds-selection` is a consumer feature no consumer doc mentions; a documented `.dark` override has no reader, so tuning it under `.dark` changes nothing; TableRow's `not-last:` modifier is defeated by the unconditional `border-b` beside it, doubling the table's bottom edge; ToastClose's colour override (specificity 0,2,0) loses to the ghost variant's guarded hover/active text (0,4,0), so on the prominent toast the close icon turns near-invisible #161616 on #340fd9 while the code reads as if that were handled.
- steps:
  - [ ] 1. Reproduce (V-BUILD worktree from HEAD):
    - ToastClose: `node docs/audit/_work/scratch/U8/toastclose-merge.mjs` (edit its import path to the worktree's `dist/index.js`) → the merged class list still contains `[&:not(:disabled):not([aria-disabled=true])]:hover:text-ghost-fg-active` beside `hover:text-current`. Storybook `Overlays/Toast` → `Brand`: hover the close button; the icon turns dark on the purple surface.
    - TableRow: V-PROBE with `<div class="flex flex-col w-full border border-border-primary rounded-normal"><div id="r1" class="grid border-b border-border-primary not-last:border-b">a</div><div id="r2" class="grid border-b border-border-primary not-last:border-b">b</div></div>` → `getComputedStyle(r2).borderBottomWidth` = `1px` (expected `0px`). Storybook `Bits & Pieces/Table` → `Rows`: the bottom edge is visibly heavier than the top.
  - [ ] 2. Document `.ds-selection` and its tokens. token-contract.md: insert after :23 (the focus-ring bullet, before `## Button Borders` at :25):
    ```md

    ## Text Selection

    - `--ui-color-selection`, `--ui-color-selection-foreground` — the `::selection` background and text. They alias `--ui-color-primary` / `--ui-color-primary-foreground`, so they follow a rebrand and invert with the palette; override both for a fixed colour. Tailwind: `bg-selection`, `text-selection-fg`.
    - The package never restyles selection globally. Opt in with the `ds-selection` class on `<body>` (or any subtree root): it styles the element's own selection and every descendant's. Or write your own `::selection` rule that reads the two tokens.
    ```
    (Facts: dooph-component-tokens.css:180-189, tokens.css:98-108, index.css:122-123.)
  - [ ] 3. Drop the dead dark override. tokens.css `.dark`: delete :711 (`  --ui-sticker-bg-opacity-secondary: 60%;`) and rewrite only the secondary half of the comment above it, :707-708, keeping :709-710 (the danger sentences, which WI-C4-01 owns) untouched:
    ```css
    /* before (:707-708) */
      /* Secondary's own opacity variable drops to 60%, but the dark sticker WASH
       * does not use it — Figma binds `color-sticker-bg-secondary` to the shared
    /* after */
      /* The dark secondary WASH does not read --ui-sticker-bg-opacity-secondary
       * (80%, light only) — Figma binds `color-sticker-bg-secondary` to the shared
    ```
    :709 still begins `   * 20% opacity in dark.`, so the sentence stays whole whichever of WI-C4-01 / this WI lands first. token-contract.md:112 → `` - `--ui-sticker-bg-opacity-secondary` — 80%. Only the light secondary wash reads it; the dark secondary wash uses `--ui-sticker-bg-opacity` (see above) ``. Sticker/constants.ts:11-13 ("except the light secondary wash, which uses `--ui-sticker-bg-opacity-secondary`") stays true. `--ui-sticker-bg-opacity-secondary` stays in sync-theme.mjs's EXCLUDED list (:162) because the `:root` token remains.
  - [ ] 4. TableRow: one border rule, dividers between rows only (the `not-last:` modifier's intent):
    ```tsx
    // before (Table.tsx:112-113)
            "grid border-b border-border-primary",
            "not-last:border-b",
    // after
            "grid border-border-primary",
            "not-last:border-b",
    ```
    The `hover:… transition-colors duration-100` line (:114) belongs to WI-C4-05; leave it as found.
  - [ ] 5. ToastClose: give the override the ghost variant's guarded selector (Button.tsx:75-76) so tailwind-merge sees the same variant chain, drops the ghost classes, and the specificity matches:
    ```tsx
    // before (Toast.tsx:169)
          "shrink-0 text-current hover:text-current active:text-current",
    // after
          "shrink-0 text-current [&:not(:disabled):not([aria-disabled=true])]:hover:text-current [&:not(:disabled):not([aria-disabled=true])]:active:text-current",
    ```
  - [ ] 6. CHANGELOG.md `[Unreleased]` → `### Fixed`: "`ToastClose` keeps the toast's text colour on hover and press (the icon was near-invisible on the prominent toast)." and "`TableRow` no longer draws a divider under the last row, so a `Table`'s bottom edge matches its other sides."
  - [ ] 7. Verify: V-LINT. `rg -n "sticker-bg-opacity-secondary: 60%" src/styles` → 0 hits. `rg -n "ds-selection" skills` → ≥ 1 hit. `rg -n '"grid border-b border-border-primary"' src/components/Table/Table.tsx` → only TableHeader (:49). V-BUILD (porcelain: tokens.css, Table.tsx, Toast.tsx, token-contract.md, CHANGELOG.md; `npm run sync-tokens` leaves the generated block unchanged). Re-run step 1: the merge script prints no `text-ghost-fg-active` class; the TableRow probe (with the new class string on both rows) gives `r1` `1px` and `r2` `0px`; V-PROBE under `<html class="dark">` with `<div id="s" class="bg-sticker-bg-secondary">` gives the same `backgroundColor` as before the change. Storybook `Overlays/Toast` → `Brand`: the close icon stays light on hover/press; `Bits & Pieces/Table` → `Rows`: the bottom edge is 1px like the top.
  - [ ] 8. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: `rg -n "sticker-bg-opacity-secondary: 60%" src` → 0 hits; token-contract.md documents `ds-selection` and `--ui-color-selection*`; the last TableRow's computed `border-bottom-width` is `0px`; `cn(buttonVariants({variant:'ghost',size:'icon-sm'}), <ToastClose classes>)` contains no `text-ghost-fg-active`.
- log:
  - 2026-10-02 — created by audit (continuation agent W4b)

### WI-C4-26: Bring ds-chat-prose's heading and code rules back in line with the text-style roles they copy, and mark both sides "keep in sync"
- status: todo
- addresses: [F-084]
- depends_on: []
- phase: P3
- risk: low — visible only inside `.ds-chat-prose` (AITextPart, AIThinkingPart transcript). Inline and block code tighten from the container's inherited body tracking (`--ui-tracking-body`, 0.01em, via AITextPart.tsx:35's `text-style-body`) to the mono role's -0.03em, matching `MonoText`. h2/h3/code gain `font-optical-sizing: auto` and `font-style: normal`, which change glyphs only where the face has an `opsz` axis or the prose sits in inherited italic. h1 is unchanged on purpose (see step 2). Nothing outside the prose is touched.
- semver: patch
- files:
  - modify: `src/styles/dooph-component-tokens.css:580-597 @ b436647`, `:636-644`
  - modify: `src/styles/index.css:223 @ b436647` (insert a comment after `@layer components {`)
  - modify: `CHANGELOG.md` `[Unreleased]`
- anchor:
  ```css
  /* src/styles/dooph-component-tokens.css:580-597 */
    .ds-chat-prose h1 {
      font-family: var(--ui-font-title);
      font-size: var(--ui-text-title);
      font-weight: var(--ui-weight-title);
      font-variation-settings: normal;
    }
    .ds-chat-prose h2 {
      font-family: var(--ui-font-heading);
      font-size: var(--ui-text-heading);
      font-weight: var(--ui-weight-heading);
      font-variation-settings: var(--ui-font-var-heading);
    }
    .ds-chat-prose h3 {
      font-family: var(--ui-font-heading);
      font-size: var(--ui-text-subheading);
      font-weight: var(--ui-weight-subheading);
      font-variation-settings: var(--ui-font-var-heading);
    }
  /* src/styles/dooph-component-tokens.css:636-644 */
    .ds-chat-prose code {
      font-family: var(--ui-font-mono);
      font-size: var(--ui-text-mono);
      font-weight: var(--ui-weight-mono);
      font-variation-settings: var(--ui-font-var-mono);
      background-color: var(--ui-color-surface-secondary);
      border-radius: var(--ui-chat-prose-code-radius);
      padding: 1px var(--ui-spacing-xxs);
    }
  ```
- why: The four prose copies of the title/heading/subheading/mono roles cannot `@apply` the roles (the roles sit in `@layer components`, the prose deliberately in `utilities`, dooph-component-tokens.css:542-549), but nothing says they are copies, and they have drifted: prose code lacks the mono role's -3% tracking and optical sizing, so code in AI answers sits differently from `MonoText` beside it (F-084). Every future role change has to be made twice with no pointer either way.
- steps:
  - [ ] 1. Baseline (V-BUILD worktree from HEAD): V-PROBE with the worktree's dist/styles.css and `<div class="ds-chat-prose text-style-body"><p>a <code id="c">x</code></p><h2 id="h2">b</h2><h3 id="h3">c</h3></div><span id="m" class="text-style-mono">x</span>`: `getComputedStyle(c).letterSpacing` ≠ `getComputedStyle(m).letterSpacing` (body's 0.01em vs mono's -0.03em, in px at the computed size); `getComputedStyle(h2).fontOpticalSizing` → `auto` only by inheritance from body. Save to `docs/audit/_work/scratch/WI-C4-26/baseline.txt`.
  - [ ] 2. dooph-component-tokens.css — insert this comment directly above `.ds-chat-prose h1 {` (:580), and edit the three rules:
    ```css
      /* Hand copies of four text-style-* roles (index.css @layer components):
       * h1 ← .text-style-title, h2 ← .text-style-heading, h3 ←
       * .text-style-subheading, code ← .text-style-mono. They cannot @apply the
       * roles — those sit in `components`, which a renderer's utilities beat (see
       * above). Keep them property-for-property in sync by hand when a role
       * changes. One deliberate difference: h1 resets font-variation-settings to
       * `normal`, because the title role sets no axes and the prose container
       * usually carries the body role's, which h1 would otherwise inherit. */
      .ds-chat-prose h1 {
        font-family: var(--ui-font-title);
        font-size: var(--ui-text-title);
        font-weight: var(--ui-weight-title);
        font-variation-settings: normal;
      }
      .ds-chat-prose h2 {
        font-family: var(--ui-font-heading);
        font-optical-sizing: auto;
        font-size: var(--ui-text-heading);
        font-style: normal;
        font-weight: var(--ui-weight-heading);
        font-variation-settings: var(--ui-font-var-heading);
      }
      .ds-chat-prose h3 {
        font-family: var(--ui-font-heading);
        font-optical-sizing: auto;
        font-size: var(--ui-text-subheading);
        font-style: normal;
        font-weight: var(--ui-weight-subheading);
        font-variation-settings: var(--ui-font-var-heading);
      }
    ```
    `.ds-chat-prose code` (:636-644) — add the three missing role properties, keep the chip paint:
    ```css
      /* ← .text-style-mono (see the note above h1); the last three lines are the
       * inline-code chip, which the role does not have. */
      .ds-chat-prose code {
        font-family: var(--ui-font-mono);
        font-optical-sizing: auto;
        font-size: var(--ui-text-mono);
        font-style: normal;
        font-weight: var(--ui-weight-mono);
        font-variation-settings: var(--ui-font-var-mono);
        letter-spacing: var(--ui-tracking-mono);
        background-color: var(--ui-color-surface-secondary);
        border-radius: var(--ui-chat-prose-code-radius);
        padding: 1px var(--ui-spacing-xxs);
      }
    ```
    The h1 rule's text is unchanged; only the comment above it is new. The h4-h6 rule (:598-601) copies no role and stays.
  - [ ] 3. index.css — after `@layer components {` (:223) insert the reverse pointer, so an editor of a role sees the copies:
    ```css
      /* .ds-chat-prose (dooph-component-tokens.css) re-spells four of these roles
       * by hand — title (h1), heading (h2), subheading (h3), mono (code). A
       * property added to one of those roles must be added there too. */
    ```
  - [ ] 4. CHANGELOG.md `[Unreleased]` → `### Fixed`: "Code in `AITextPart` / `AIThinkingPart` prose now uses the mono role's tracking and optical sizing, matching `MonoText`." No header contract, skill or token-contract line describes the prose's per-property make-up, so no doc changes.
  - [ ] 5. Verify: V-LINT. `rg -n "letter-spacing: var\(--ui-tracking-mono\)" src/styles` → 2 hits (index.css `.text-style-mono`, dooph-component-tokens.css `.ds-chat-prose code`). `rg -c "font-optical-sizing: auto" src/styles/dooph-component-tokens.css` → 3. V-BUILD (porcelain: the two stylesheets + CHANGELOG.md). Re-run step 1's probe: `letterSpacing` of `#c` equals `#m`'s; `fontFamily`, `fontSize`, `fontWeight`, `fontVariationSettings`, `fontOpticalSizing` and `fontStyle` of `#c` equal `#m`'s, and those of `#h2`/`#h3` equal a `<div class="text-style-heading">` / `<div class="text-style-subheading">` placed outside the prose. Storybook `AI Chat/Parts` → `TextPart`: the inline `ISO 2768-m` code chip reads at the same tracking as a `MonoText` sample.
  - [ ] 6. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: for h2, h3 and code the probe shows every role property equal to its `.text-style-*` counterpart; both stylesheets carry the "keep in sync" pointer (`rg -n "re-spells four|Hand copies of four" src/styles` → 2 hits).
- log:
  - 2026-10-02 — created by audit (continuation agent W4b)

### WI-C4-27: In 6.0.0, remove the unused ds-focus-ring, ds-my-ui-xs and ds-disabled-control helpers from styles.css (recommended D-15 option)
- status: blocked(D-15)
- addresses: [F-076]
- depends_on: [WI-RELEASE-OPEN, WI-C4-15]
- phase: P4
- risk: low for the package, breaking for a consumer who copied a helper — no DS component uses any of the three once WI-C4-15 has moved toggleOption.ts:32 and AIPromptInput.tsx:227 to `ds-disabled-state` (`ds-focus-ring` and `ds-my-ui-xs` have no user at b436647). All three ship in dist/styles.css, so a consumer who put one on their own markup silently loses the rule (no compile error, just a missing outline / margin / disabled fade). That is why this ships only in the major, with migration-skill rows and no shim (repo practice). If D-15 chooses "document" instead, mark this item `dropped(D-15 chose document)`; documenting the three in token-contract.md is then a separate WI the orchestrator drafts.
- semver: major
- files:
  - modify: `src/styles/dooph-component-tokens.css:26-33 @ b436647` (`.ds-disabled-control`), `:97-101` (`.ds-focus-ring`), `:103-105` (comment), `:359-361` (`.ds-my-ui-xs`)
  - modify: `src/components/DatePicker/DatePickerTrigger.tsx:66 @ b436647` (comment)
  - modify: `src/components/DropdownTrigger/DropdownTrigger.tsx:204 @ b436647` (comment, as WI-C4-15 left it)
  - modify: `src/components/DropdownTrigger/DropdownTrigger.stories.tsx:43 @ b436647` (doc comment)
  - modify: `.agents/skills/dooph-ds-codebase/SKILL.md:529,531,540 @ b436647` (as left by WI-C4-15, WI-C3-07 and WI-C4-09)
  - modify: `skills/dooph-design-system-v6-migration/SKILL.md` (created by WI-RELEASE-OPEN; "Removed `ds-*` helpers" rows)
  - modify: `CHANGELOG.md` `[Unreleased]` → `### Removed`
- anchor:
  ```css
  /* src/styles/dooph-component-tokens.css:27-33 */
    /*
     * Native disabled only — for controls that don't use aria-disabled.
     */
    .ds-disabled-control:disabled {
      cursor: not-allowed;
      opacity: var(--ui-opacity-disabled);
    }
  /* :98-101 */
    .ds-focus-ring {
      outline: 4px solid var(--ui-color-focus-ring-prominent);
      outline-offset: 0;
    }
  /* :359-361 */
    .ds-my-ui-xs {
      margin-block: var(--ui-spacing-xs);
    }
  ```
- why: `ds-focus-ring` and `ds-my-ui-xs` ship in styles.css with no user and are still listed as available in the codebase skill (:531, :540), so agents reach for a helper whose only historical use was the broken `data-[state=open]:` composition (F-076). `ds-disabled-control` joins them once WI-C4-15 folds its two users into `ds-disabled-state` (WI-C4-15 step 4 hands its removal to this item). None is in a consumer doc, so removing them is D-15's "undocumented internals" question; this drafts the recommended "remove in the major" option.
- steps:
  - [ ] 1. Confirm D-15 = remove, D-01 = 6.0.0 and that WI-C4-15 has landed: `rg -n "ds-disabled-control|ds-my-ui-xs" src --glob '!styles/**'` → only the toggleOption.ts header line WI-C4-15 rewrote, or 0 hits; `rg -n 'ds-focus-ring([^-\w]|$)' src --glob '!styles/**'` → only the three comment lines in step 3. Baseline (V-BUILD worktree): `rg -o '\.ds-(focus-ring|my-ui-xs|disabled-control)[^-]' dist/styles.css | sort -u` → 3 distinct selectors.
  - [ ] 2. dooph-component-tokens.css: delete :26-33 (the blank line, the "Native disabled only" comment and the `.ds-disabled-control:disabled` rule), :97-101 (the blank line and the `.ds-focus-ring` rule) and :359-361 (the `.ds-my-ui-xs` rule). Rewrite the open-ring comment (:103-105) so it no longer names the removed class:
    ```css
    /* before */
      /* Open-state ring for popover/menu triggers. The state lives in the SELECTOR,
       * not in a Tailwind variant: `data-[state=open]:ds-focus-ring` composes a
       * variant with a package class, which emits no rule at all. */
    /* after */
      /* Open-state ring for popover/menu triggers. The state lives in the SELECTOR,
       * not in a Tailwind variant: `data-[state=open]:<any ds-* class>` composes a
       * variant with a package class, which emits no rule at all. */
    ```
  - [ ] 3. The same wording in the three source comments: DatePickerTrigger.tsx:66 `` // own selector — a `data-[state=open]:ds-focus-ring` variant would `` → `` // own selector — a `data-[state=open]:ds-*` variant would ``; DropdownTrigger.tsx:204 `` // `data-[state=open]:ds-focus-ring` variant composes a Tailwind `` → `` // `data-[state=open]:ds-*` variant composes a Tailwind ``; DropdownTrigger.stories.tsx:43 `/** Menu-open chrome (border + ds-focus-ring), not keyboard focus — see TypeableFocused. */` → `/** Menu-open chrome (border + ds-focus-ring-on-open), not keyboard focus — see TypeableFocused. */`.
  - [ ] 4. Codebase skill: delete the `ds-disabled-control` bullet (:529, which WI-C4-15 marked "unused; scheduled for removal"); in the focus-ring bullet (:531) delete `` , `ds-focus-ring` `` from the list; in the spacing bullet (:540) delete `` , `ds-my-ui-xs` ``.
  - [ ] 5. v6 migration skill (WI-RELEASE-OPEN's file), under "Removed `ds-*` helpers" (create the heading under `## Changes added by later 6.0 work items` if absent), bucket **silent** (R13.6: the class stops matching, nothing fails to compile):
    | Removed class | Replace with |
    |---|---|
    | `ds-focus-ring` | `ds-focus-ring-on-open` for a menu/popover trigger's open state, `ds-focus-visible-ring` for keyboard focus; or your own `outline: 4px solid var(--ui-color-focus-ring-prominent)` |
    | `ds-my-ui-xs` | `my-xs` (Tailwind, `margin-block: var(--ui-spacing-xs)`) |
    | `ds-disabled-control` | `ds-disabled-state` (covers `:disabled` and `[aria-disabled="true"]`) |
    Detection (R13.9, no PCRE2 needed): `rg -n -e 'ds-focus-ring([^-\w]|$)' -e 'ds-my-ui-xs([^-\w]|$)' -e 'ds-disabled-control([^-\w]|$)' --glob '!node_modules'`. CHANGELOG.md `[Unreleased]` → `### Removed`: "`ds-focus-ring`, `ds-my-ui-xs`, `ds-disabled-control` utility classes (unused; see `dooph-design-system-v6-migration`)."
  - [ ] 6. Verify: V-LINT. `rg -n -e 'ds-focus-ring([^-\w]|$)' -e 'ds-my-ui-xs' -e 'ds-disabled-control' src .agents skills/dooph-design-system-theming skills/dooph-design-system-usage` → 0 hits (the v6 migration skill and CHANGELOG.md are expected to mention them). V-BUILD (porcelain: the files listed above); in the worktree step 1's `rg -o` → no match (exit 1) and `rg -c 'ds-focus-ring-on-open' dist/styles.css` → ≥ 1 (the sibling helpers survive). Storybook `Menus/DropdownTriggers` → `TypeableOpen` still shows the open ring; Toggle / Tabs disabled stories still fade (via `ds-disabled-state`, WI-C4-15).
  - [ ] 7. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: the three classes are absent from src/styles and dist/styles.css; the codebase skill no longer lists them; the v6 migration skill has a row and detection pattern for each.
- log:
  - 2026-10-02 — created by audit (continuation agent W4b)

## DONE
