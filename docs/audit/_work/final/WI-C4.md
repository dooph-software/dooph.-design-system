# WI-C4 — draft work items (composer C4) @ b436647

Shared verification recipes, referenced by name in the steps below. Each is a complete procedure.

- **V-LINT**: `npm run lint` (= `tsc --noEmit`) → exit 0.
- **V-BUILD** (scratch-worktree build + generated-drift check):
  ```sh
  git add -N <every new file this WI creates>        # so `git diff HEAD` carries it
  git worktree add ../dooph-wi-build HEAD
  git diff HEAD | git -C ../dooph-wi-build apply
  cd ../dooph-wi-build && npm ci && npm run build
  git status --porcelain                              # expect ONLY the paths listed under this WI's `files:`
  cd - && git worktree remove --force ../dooph-wi-build
  ```
  If a generated file (`src/components/Icons/index.ts`, the `__GENERATED_THEME_*__` block of `src/styles/index.css`, `src/styles/theme.css`) shows up that the WI did not regenerate and list, the WI is incomplete.
- **V-RENDER**: inside the V-BUILD worktree (before removing it), `node <script>.cjs` where the script does `const React=require('react'); const {renderToStaticMarkup}=require('react-dom/server'); const ds=require('./dist/index.cjs');` and prints the markup the step names.
- **V-PROBE**: write an HTML page into `docs/audit/_work/scratch/<wi-id>/` that inlines the V-BUILD worktree's `dist/styles.css` in a `<style>` element plus the markup under test, open it in the Browser pane (`file:///…`), and read `getComputedStyle(el)` / `getPropertyValue('--ui-…')` with the JavaScript tool.

### WI-C4-01: Restore an opacity-driven wash for the dark danger Sticker (recommended D-07 option)
- status: blocked(D-07)
- addresses: [F-001]
- depends_on: []
- phase: P3
- risk: low — changes only the dark danger wash paint; light mode and every other variant are untouched. If D-07 picks a different look, only the token value in step 2 changes.
- semver: patch
- files:
  - modify: `src/styles/tokens.css:707-718 @ b436647`
  - modify: `skills/dooph-design-system-theming/references/token-contract.md:110 @ b436647`
- anchor:
  ```css
    /* Secondary's own opacity variable drops to 60%, but the dark sticker WASH
     * does not use it — Figma binds `color-sticker-bg-secondary` to the shared
     * 20% opacity in dark. Danger stops being a composite at all: both the
     * content and the wash are a literal white, not danger-primary/secondary. */
    --ui-sticker-bg-opacity-secondary: 60%;
    --ui-color-sticker-bg-secondary: color-mix(
      in srgb,
      var(--ui-color-secondary-border-active) var(--ui-sticker-bg-opacity),
      transparent
    );
    --ui-color-sticker-danger: #ffffff;
    --ui-color-sticker-bg-danger: #ffffff;
  ```
- why: In dark mode the danger Sticker paints white on white (1:1), so the label and icon are invisible (F-001). The opaque wash also breaks Sticker.tsx:18-20 ("Do not bake the wash alpha into a hex").
- steps:
  - [ ] 1. Reproduce: Storybook `Bits & Pieces/Sticker` → `Danger`, toolbar theme = Dark (`?globals=theme:dark`). The pill is blank white. Or V-PROBE with `<html class="dark"><div id="s" class="bg-sticker-bg-danger text-sticker-danger">Danger</div>`: `getComputedStyle(s).color` and `.backgroundColor` are both `rgb(255, 255, 255)`.
  - [ ] 2. tokens.css: delete line 718 (`  --ui-color-sticker-bg-danger: #ffffff;`), so the `:root` wash (`color-mix(in srgb, var(--ui-color-danger-secondary) var(--ui-sticker-bg-opacity), transparent)`, tokens.css:626-630) applies in both modes. Its two inputs are mode-invariant, so no `.dark` line is needed (R5.3). Keep `:717` (white content). Replace the last two comment lines (:709-710):
    ```css
    /* before */
       * 20% opacity in dark. Danger stops being a composite at all: both the
       * content and the wash are a literal white, not danger-primary/secondary. */
    /* after */
       * 20% opacity in dark. Danger's CONTENT is a literal white in dark (Figma);
       * its wash stays the :root composite — danger-secondary at
       * --ui-sticker-bg-opacity, both mode-invariant — so it has no .dark line. */
    ```
    WI-C4-25 rewrites the secondary-wash half of this same comment and keeps the two danger lines verbatim. Whichever lands second edits only its own sentences.
  - [ ] 3. token-contract.md:110: replace `; dark danger is a solid \`#ffffff\`, not a mix` with `; danger's wash is the same mix in both modes (only its content turns white in dark)`. Line 109 ("except danger in dark, which is a literal `#ffffff`") stays true. Sticker.tsx:5-7 ("the wash is a color-mix at the sticker opacity") becomes true again. The remaining light-only wording in `Sticker/constants.ts:9-11` ("its content is danger-primary") belongs to the F-054 header WI (composer C3): tell that WI's owner the dark content is white.
  - [ ] 4. `npm run sync-tokens` (no token is added or renamed, so the generated block must not change). Run V-LINT. Run V-BUILD (expected porcelain: the two modified files only). Run V-PROBE with step 1's markup: `color` is `rgb(255, 255, 255)` and `backgroundColor` is a 20%-alpha colour (`color(srgb 1 0.345 0.345 / 0.2)` or the equivalent `rgba(255, 88, 88, 0.2)`), not opaque white. Re-check the Storybook `Danger` story in dark: white label on a pink-red wash.
  - [ ] 5. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: `rg -n "sticker-bg-danger: #ffffff" src/styles/tokens.css` → 0 hits; V-PROBE under `.dark` gives danger `color` ≠ `backgroundColor`; `rg -n "dark danger is a solid" skills` → 0 hits.
- log:
  - 2026-10-01 — created by audit

### WI-C4-02: Let PentagonShape and PuffShape inherit fillColor like the other shapes
- status: todo
- addresses: [F-004]
- depends_on: []
- phase: P3
- risk: low — ShapeButton always passes `fillColor="currentColor"` (ShapeButton.tsx:145), which is the same paint as today; only explicit `fillColor` values change (they start working).
- semver: patch
- files:
  - modify: `src/components/Shapes/PentagonShape.tsx:19-22 @ b436647`
  - modify: `src/components/Shapes/PuffShape.tsx:19-22 @ b436647`
- anchor:
  ```tsx
        <path
          d={PENTAGON_SHAPE_PATH}
          fill="currentColor"
        />
  ```
  ```tsx
        <path
          d={PUFF_SHAPE_PATH}
          fill="currentColor"
        />
  ```
- why: The hard-coded presentation attribute beats the fill inherited from BaseIcon's `<svg style="fill:…">`, so `fillColor` is silently ignored on two exported shapes (F-004).
- steps:
  - [ ] 1. Reproduce (V-BUILD worktree from HEAD, before editing): V-RENDER `renderToStaticMarkup(React.createElement(ds.PentagonShape,{size:24,fillColor:'red'}))` prints `fill:red` on the svg and `fill="currentColor"` on the `<path>`. Same for `ds.PuffShape`.
  - [ ] 2. Edit both files to match SquircleShape.tsx:19:
    ```tsx
    // before (PentagonShape.tsx:19-22)
          <path
            d={PENTAGON_SHAPE_PATH}
            fill="currentColor"
          />
    // after
          <path d={PENTAGON_SHAPE_PATH} />
    ```
    ```tsx
    // before (PuffShape.tsx:19-22)
          <path
            d={PUFF_SHAPE_PATH}
            fill="currentColor"
          />
    // after
          <path d={PUFF_SHAPE_PATH} />
    ```
  - [ ] 3. No header, skill or CHANGELOG line describes the old behaviour. Add one `CHANGELOG.md` `[Unreleased]` → Fixed line: "`fillColor` now applies to `PentagonShape` and `PuffShape`."
  - [ ] 4. Verify: V-LINT. V-BUILD (porcelain: the two shape files + CHANGELOG.md). V-RENDER as in step 1 prints a `<path d="…">` with no `fill` attribute for both shapes. `rg -n 'fill="currentColor"' src/components/Shapes/*Shape.tsx` → 0 hits. Storybook `Bits & Pieces/Shapes` → `Colors`: Pentagon and Puff now show the alternating primary / prominent-alt fills like their neighbours.
  - [ ] 5. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: `rg -n 'fill="currentColor"' src/components/Shapes` → 0 hits; V-RENDER of both shapes with `fillColor:'red'` shows no `fill` attribute on the path.
- log:
  - 2026-10-01 — created by audit

### WI-C4-03: Give the six overlays a --ui-<overlay>-* motion family read by ds-*-motion helpers
- status: todo
- addresses: [F-016]
- depends_on: [WI-C4-11]
- phase: P3
- risk: medium — every overlay's enter/exit timing moves from Tailwind utilities to helpers. A specificity or order mistake would silently revert to tw-animate's 150ms default or drop reduced motion. Values are unchanged, so any visible difference is a regression. Toast's `dismiss()` still unmounts on a 200ms `setTimeout` (Toast.tsx:229, F-035): retuning `--ui-toast-out-duration` above 200ms is unsafe until F-035's WI lands, and the token comment must say so.
- semver: minor
- files:
  - modify: `src/styles/tokens.css:371-373 @ b436647` (insert the family after the reveal-change block)
  - modify: `scripts/sync-theme.mjs:138-141 @ b436647` (EXCLUDED entries)
  - modify: `src/styles/dooph-component-tokens.css:191-199 @ b436647` (insert helpers after the Radix origin helpers)
  - modify: `src/components/Menu/DropdownMenu.tsx:168-170 @ b436647`
  - modify: `src/components/Popover/Popover.tsx:50-53 @ b436647` (the reduced-motion line WI-C4-11 adds)
  - modify: `src/components/Tooltip/Tooltip.tsx:62-65 @ b436647`
  - modify: `src/components/Modal/Modal.tsx:29-31 @ b436647`, `src/components/Modal/Modal.tsx:75-77 @ b436647`
  - modify: `src/components/Sheet/Sheet.tsx:37-39 @ b436647`, `src/components/Sheet/Sheet.tsx:50-58 @ b436647`, `src/components/Sheet/Sheet.tsx:73-75 @ b436647`
  - modify: `src/components/Toast/Toast.tsx:60-64 @ b436647`
  - modify: `skills/dooph-design-system-theming/references/token-contract.md:146-148 @ b436647`
  - modify: `.agents/skills/dooph-ds-codebase/SKILL.md:459-463 @ b436647`
  - modify: `.agents/skills/dooph-ds-architecture/SKILL.md:317-321 @ b436647`
  - modify: `CHANGELOG.md` `[Unreleased]`
  - generated (run, do not hand-edit): `src/styles/index.css` `__GENERATED_THEME_*__` block, `src/styles/theme.css`
- anchor:
  ```tsx
  // DropdownMenu.tsx:168-170
            "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:duration-100",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-bottom-1.5 data-[state=closed]:duration-150",
            "motion-reduce:data-[state=open]:duration-0 motion-reduce:data-[state=closed]:duration-0",
  // Sheet.tsx:73-75
      "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:duration-300 data-[state=open]:[animation-timing-function:cubic-bezier(0.32,0.72,0,1)]",
      "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:duration-200 data-[state=closed]:[animation-timing-function:cubic-bezier(0.4,0,1,1)]",
      "motion-reduce:data-[state=open]:duration-0 motion-reduce:data-[state=closed]:duration-0",
  // Toast.tsx:60-64
      "data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition-transform",
      "data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)]",
      "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-right-2 data-[state=open]:duration-150",
      "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-right-2 data-[state=closed]:duration-150",
      "motion-reduce:data-[state=open]:duration-0 motion-reduce:data-[state=closed]:duration-0",
  ```
- why: Overlay enter/exit is the motion these components exist to show, yet none of it is retunable. Sheet carries an untokenised copy of the roll-change curves, and the codebase skill claims every animated component owns a family (F-016, C-CB-169).
- steps:
  - [ ] 1. Record the baseline: V-BUILD from HEAD (no edits), then V-PROBE with one element per overlay state, using each component's current class string verbatim plus `data-state` (DropdownMenu.tsx:168-170, Popover.tsx:50-52, Tooltip.tsx:62-65, Modal.tsx:29-31/75-77, Sheet.tsx:37-39/73-75, Toast.tsx:62-64). Read `animationDuration` / `animationTimingFunction`. Expected: menu 0.1s/0.15s; popover 0.15s/0.15s; tooltip delayed-open 0.1s, instant-open 0.1s, closed 0.15s; modal overlay + content 0.2s/0.15s; sheet overlay 0.3s/0.2s `ease`; sheet content 0.3s `cubic-bezier(0.32, 0.72, 0, 1)` / 0.2s `cubic-bezier(0.4, 0, 1, 1)`; toast 0.15s/0.15s; all others `ease`. Save the page as `docs/audit/_work/scratch/WI-C4-03/overlay-motion-probe.html`.
  - [ ] 2. tokens.css: insert after line 373 (`--ui-reveal-change-ease: …;`), `:root, .light` only, because the values are mode-invariant:
    ```css

      /* Overlay enter/exit (DropdownMenuContent, PopoverContent, TooltipContent,
       * Modal*, Sheet*, ToastRoot). The tw-animate classes on each part pick the
       * GEOMETRY (fade / zoom / slide); these pick the timing, read only by the
       * ds-*-motion helpers in dooph-component-tokens.css. `ease` is the CSS
       * default these overlays animated with before. The sheet curves equal
       * --ui-roll-change-in/out-ease but stay separate so retuning text motion
       * never moves panels. Toast: keep out-duration <= 200ms until the
       * dismiss() unmount stops being a 200ms timer. */
      --ui-menu-in-duration: 100ms;
      --ui-menu-out-duration: 150ms;
      --ui-menu-ease: ease;
      --ui-popover-in-duration: 150ms;
      --ui-popover-out-duration: 150ms;
      --ui-popover-ease: ease;
      --ui-tooltip-in-duration: 100ms;
      --ui-tooltip-out-duration: 150ms;
      --ui-tooltip-ease: ease;
      --ui-modal-in-duration: 200ms;
      --ui-modal-out-duration: 150ms;
      --ui-modal-ease: ease;
      --ui-sheet-in-duration: 300ms;
      --ui-sheet-out-duration: 200ms;
      --ui-sheet-in-ease: cubic-bezier(0.32, 0.72, 0, 1);
      --ui-sheet-out-ease: cubic-bezier(0.4, 0, 1, 1);
      --ui-toast-in-duration: 150ms;
      --ui-toast-out-duration: 150ms;
      --ui-toast-ease: ease;
    ```
  - [ ] 3. sync-theme.mjs: after the sidebar-icon group (:138-141), add a group `// Overlay motion — raw var() in ds-*-motion helpers only` listing the 19 names above without the leading `--` (`"ui-menu-in-duration"`, … `"ui-toast-ease"`). None matches a mapping prefix, so nothing changes in the output; this follows contrib:107-108 and the file's existing motion groups. Then run `npm run sync-tokens`. The generated block and theme.css must be byte-identical (`git diff --stat src/styles/index.css src/styles/theme.css` → empty).
  - [ ] 4. dooph-component-tokens.css: insert after `.ds-radix-popover-content-origin { … }` (:197-199):
    ```css

      /* Overlay enter/exit timing (Rule 6). Each part keeps its tw-animate
       * geometry classes (animate-in/out, fade/zoom/slide); these set ONLY the
       * duration and easing, from --ui-<overlay>-*. They match the generated
       * `data-[state=…]:animate-in` rules' (0,2,0) specificity and come later in
       * the utilities layer, so they win; the reduced-motion block below repeats
       * that specificity for the same reason. */
      .ds-menu-motion[data-state="open"] { animation-duration: var(--ui-menu-in-duration); animation-timing-function: var(--ui-menu-ease); }
      .ds-menu-motion[data-state="closed"] { animation-duration: var(--ui-menu-out-duration); animation-timing-function: var(--ui-menu-ease); }
      .ds-popover-motion[data-state="open"] { animation-duration: var(--ui-popover-in-duration); animation-timing-function: var(--ui-popover-ease); }
      .ds-popover-motion[data-state="closed"] { animation-duration: var(--ui-popover-out-duration); animation-timing-function: var(--ui-popover-ease); }
      .ds-tooltip-motion:is([data-state="delayed-open"], [data-state="instant-open"]) { animation-duration: var(--ui-tooltip-in-duration); animation-timing-function: var(--ui-tooltip-ease); }
      .ds-tooltip-motion[data-state="closed"] { animation-duration: var(--ui-tooltip-out-duration); animation-timing-function: var(--ui-tooltip-ease); }
      .ds-modal-motion[data-state="open"] { animation-duration: var(--ui-modal-in-duration); animation-timing-function: var(--ui-modal-ease); }
      .ds-modal-motion[data-state="closed"] { animation-duration: var(--ui-modal-out-duration); animation-timing-function: var(--ui-modal-ease); }
      .ds-sheet-motion[data-state="open"] { animation-duration: var(--ui-sheet-in-duration); animation-timing-function: var(--ui-sheet-in-ease); }
      .ds-sheet-motion[data-state="closed"] { animation-duration: var(--ui-sheet-out-duration); animation-timing-function: var(--ui-sheet-out-ease); }
      /* The backdrop fades on the sheet's durations with the default curve. */
      .ds-sheet-overlay-motion[data-state="open"] { animation-duration: var(--ui-sheet-in-duration); }
      .ds-sheet-overlay-motion[data-state="closed"] { animation-duration: var(--ui-sheet-out-duration); }
      .ds-toast-motion[data-state="open"] { animation-duration: var(--ui-toast-in-duration); animation-timing-function: var(--ui-toast-ease); }
      .ds-toast-motion[data-state="closed"] { animation-duration: var(--ui-toast-out-duration); animation-timing-function: var(--ui-toast-ease); }
      /* A cancelled swipe snaps back on the exit duration. */
      .ds-toast-motion[data-swipe="cancel"] { transition-duration: var(--ui-toast-out-duration); }
      @media (prefers-reduced-motion: reduce) {
        .ds-menu-motion[data-state],
        .ds-popover-motion[data-state],
        .ds-tooltip-motion[data-state],
        .ds-modal-motion[data-state],
        .ds-sheet-motion[data-state],
        .ds-sheet-overlay-motion[data-state],
        .ds-toast-motion[data-state] {
          animation-duration: 0ms;
        }
        .ds-toast-motion[data-swipe="cancel"] {
          transition-duration: 0ms;
        }
      }
    ```
    (Expand each one-line rule to the file's multi-line style when pasting.)
  - [ ] 5. Components: drop every `data-[state=…]:duration-N`, the two `[animation-timing-function:…]` arbitrary properties and every `motion-reduce:` line, and add the helper. Keep the geometry utilities unchanged.
    ```tsx
    // DropdownMenu.tsx:168-170 after
            "data-[state=open]:animate-in data-[state=open]:fade-in-0",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-bottom-1.5",
            "ds-menu-motion",
    // Popover.tsx — replace the motion-reduce line WI-C4-11 added after :52 with
            "ds-popover-motion",
    // Tooltip.tsx:62-65 after
            "data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95",
            "data-[state=instant-open]:animate-in data-[state=instant-open]:fade-in-0 data-[state=instant-open]:zoom-in-95",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
            "ds-tooltip-motion",
    // Modal.tsx:29-31 after
        'data-[state=open]:animate-in data-[state=open]:fade-in-0',
        'data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
        'ds-modal-motion',
    // Modal.tsx:75-77 after
          'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
          'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
          'ds-modal-motion',
    // Sheet.tsx:37-39 after
        "data-[state=open]:animate-in data-[state=open]:fade-in-0",
        "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
        "ds-sheet-overlay-motion",
    // Sheet.tsx:73-75 after
      "data-[state=open]:animate-in data-[state=open]:fade-in-0",
      "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
      "ds-sheet-motion",
    // Toast.tsx:62-64 after (:60-61 unchanged)
      "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-right-2",
      "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-right-2",
      "ds-toast-motion",
    ```
    Sheet.tsx comment :50-58: replace "while fading in — 300ms on a long-deceleration curve — and / exits 20% back out while fading, 200ms accelerating." with "while fading in, and exits 20% back out while fading; timing is `--ui-sheet-*` via `ds-sheet-motion`." Delete the sentence "The timing function is set as an arbitrary property because `animation-timing-function` has no unambiguous utility (core `ease-*` targets transitions)." Keep the slide-distance sentence. DropdownMenu.tsx:20 ("Style open/disabled/highlighted via Radix data attributes only") stays true, because the helpers select on Radix `data-state`.
  - [ ] 6. Docs (made false by this change): token-contract.md:146-148 "Families:" list → append `--ui-menu-*`, `--ui-popover-*`, `--ui-tooltip-*`, `--ui-modal-*`, `--ui-sheet-*`, `--ui-toast-*` (overlay enter/exit) and list the 19 tokens with their defaults. codebase SKILL.md:459-463 and arch SKILL.md:317-321 "Current/Existing families" → add the same six. CHANGELOG `[Unreleased]` → Added: "Overlay motion tokens `--ui-{menu,popover,tooltip,modal,sheet,toast}-*`; timings unchanged."
  - [ ] 7. Verify: V-LINT. `rg -n "data-\[state=[a-z-]+\]:duration-|animation-timing-function:|motion-reduce:" src/components --glob '!*.stories.tsx'` → 0 hits. V-BUILD (porcelain = the files above). V-PROBE with step 1's page re-pointed at the new class strings: every value equals the step-1 baseline. Then inject `<style>:root{--ui-modal-in-duration:1s}</style>`: modal open `animationDuration` → `1s`. In the probe, `[...document.styleSheets].flatMap(s=>[...s.cssRules]).filter(r=>r.conditionText?.includes('prefers-reduced-motion')).some(r=>r.cssText.includes('.ds-modal-motion[data-state]'))` → true. Storybook `Overlays/Popover`, `Overlays/Toast`, Modal/Sheet/Tooltip/Menus stories open and close with the same timing as before.
  - [ ] 8. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: the step-7 `rg` returns 0 hits; V-PROBE timings equal the step-1 baseline for all 17 element states; a `:root` token override changes the probed duration; `rg -c "ds-(menu|popover|tooltip|modal|sheet|sheet-overlay|toast)-motion" src/components --glob '!*.stories.tsx'` → 8 lines across 6 files (Modal 2, Sheet 2).
- log:
  - 2026-10-01 — created by audit

### WI-C4-04: Tokenise the feature-motion literals in ShimmerText, RollHoverText, ShapeButton, CopyButton, Slider glide and both progress indicators
- status: todo
- addresses: [F-016]
- depends_on: [WI-C4-17]
- phase: P3
- risk: low — durations and curves keep their current values, with one deliberate exception. LinearProgressIndicator moves from `ease-out` to the shared progress curve `cubic-bezier(0.4, 0, 0.2, 1)` so the two progress siblings animate alike (U9-F4); over 300ms the difference is slight. ProgressIndicator gains a reduced-motion path it lacks today.
- semver: minor
- files:
  - modify: `src/styles/tokens.css:165-171 @ b436647` (shimmer), `src/styles/tokens.css:220-227 @ b436647` (roll-hover), `src/styles/tokens.css:371-373 @ b436647` (insert the new families after reveal-change; after WI-C4-03's overlay block if that landed first)
  - modify: `scripts/sync-theme.mjs:138-141 @ b436647` (EXCLUDED)
  - modify: `src/styles/index.css:380 @ b436647`, `src/styles/index.css:421-424 @ b436647`
  - modify: `src/styles/dooph-component-tokens.css:40-45 @ b436647`, `:126-139`, `:166-171`, `:368-375`
  - modify: `src/components/ProgressIndicator/ProgressIndicator.tsx:79-80 @ b436647`, `:123-124`, `:151`, `:165`
  - modify: `skills/dooph-design-system-theming/references/token-contract.md:133-148 @ b436647`
  - modify: `.agents/skills/dooph-ds-loading-indicators/SKILL.md:184 @ b436647`
  - modify: `.agents/skills/dooph-ds-codebase/SKILL.md:459-463 @ b436647`, `.agents/skills/dooph-ds-architecture/SKILL.md:317-321 @ b436647`
  - modify: `CHANGELOG.md` `[Unreleased]`
- anchor:
  ```css
  /* index.css:380 */      animation: ds-shimmer 2s linear infinite;
  /* index.css:421-424 */  transition:
        transform var(--ui-roll-hover-duration) cubic-bezier(0.32, 0.72, 0, 1),
        filter var(--ui-roll-hover-duration) cubic-bezier(0.32, 0.72, 0, 1),
        opacity var(--ui-roll-hover-duration) cubic-bezier(0.32, 0.72, 0, 1);
  /* dooph-component-tokens.css:42-44 */  transition:
        color 150ms,
        filter 150ms;
  /* :129 / :132 */  transition: width 300ms ease-out;  /  transition: left 300ms ease-out;
  /* :169-170 */     transition-duration: 180ms;
      transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
  /* :372-374 */     transition:
        opacity 120ms ease-out,
        transform 160ms cubic-bezier(0.32, 0.72, 0, 1);
  ```
  ```tsx
  // ProgressIndicator.tsx:123-124, :151, :165
    const easing = "cubic-bezier(0.4, 0, 0.2, 1)";
    const transition = `stroke-dasharray 300ms ${easing}, stroke-dashoffset 300ms ${easing}`;
          style={{ transition }}
          style={{ transition: `stroke-dashoffset 300ms ${easing}` }}
  ```
- why: These are motions that ARE the component's feature (F-016 part 1), yet none is retunable. ProgressIndicator's inline strings also escape every reduced-motion rule, and RollHoverText's curve is written three times.
- steps:
  - [ ] 1. Baseline V-PROBE (V-BUILD from HEAD): elements with `ds-shimmer-text`, `ds-roll-hover-out`, `ds-shape-button-shadow`, `ds-progress-fill`, `ds-progress-remainder`, `ds-copy-icon-check`, and `<div class="ds-slider-glide"><span class="ds-slider-part"></span></div>`. Record `animation` / `transitionDuration` / `transitionTimingFunction`. Record the flat ProgressIndicator's circle `style` via V-RENDER of `ds.ProgressIndicator({progress:0.5})`: both circles carry inline `transition`.
  - [ ] 2. tokens.css: after `--ui-shimmer-highlight` (:167-171) add `--ui-shimmer-duration: 2s;` and `--ui-shimmer-ease: linear;`. After `--ui-roll-hover-duration: 500ms;` (:220) add `--ui-roll-hover-ease: cubic-bezier(0.32, 0.72, 0, 1);`. After the reveal-change block (:373) add:
    ```css

      /* Feature motion with no family before (Rule 6). Values are the literals
       * the helpers used; progress is ONE pair shared by ProgressIndicator's arcs
       * and LinearProgressIndicator's fill so the two siblings move alike. */
      --ui-shape-button-duration: 150ms;
      --ui-shape-button-ease: ease;
      --ui-copy-button-fade-duration: 120ms;
      --ui-copy-button-fade-ease: ease-out;
      --ui-copy-button-scale-duration: 160ms;
      --ui-copy-button-scale-ease: cubic-bezier(0.32, 0.72, 0, 1);
      --ui-slider-glide-duration: 180ms;
      --ui-slider-glide-ease: cubic-bezier(0.22, 1, 0.36, 1);
      --ui-progress-duration: 300ms;
      --ui-progress-ease: cubic-bezier(0.4, 0, 0.2, 1);
    ```
    sync-theme.mjs EXCLUDED: add these 10 names plus `ui-shimmer-duration`, `ui-shimmer-ease` and `ui-roll-hover-ease` under a `// Component feature motion — raw var() in ds-* helpers only` comment. Run `npm run sync-tokens`. The generated block must not change.
  - [ ] 3. CSS (before → after):
    ```css
    /* index.css:380 */      animation: ds-shimmer 2s linear infinite;
                          →  animation: ds-shimmer var(--ui-shimmer-duration) var(--ui-shimmer-ease) infinite;
    /* index.css:422-424 */  cubic-bezier(0.32, 0.72, 0, 1)   (×3)  →  var(--ui-roll-hover-ease)   (×3)
    /* dooph-component-tokens.css:42-44 */
        transition:
          color var(--ui-shape-button-duration) var(--ui-shape-button-ease),
          filter var(--ui-shape-button-duration) var(--ui-shape-button-ease);
    /* :129 */  transition: width var(--ui-progress-duration) var(--ui-progress-ease);
    /* :132 */  transition: left var(--ui-progress-duration) var(--ui-progress-ease);
    /* :169-170 */  transition-duration: var(--ui-slider-glide-duration);
                    transition-timing-function: var(--ui-slider-glide-ease);
    /* :372-374 */  transition:
          opacity var(--ui-copy-button-fade-duration) var(--ui-copy-button-fade-ease),
          transform var(--ui-copy-button-scale-duration) var(--ui-copy-button-scale-ease);
    ```
    Add after `.ds-progress-remainder { … }` (:131-133), and extend the existing reduced-motion block at :134-139 to list `.ds-progress-arc` beside the two existing selectors:
    ```css
      /* ProgressIndicator flat arcs (track + indicator). */
      .ds-progress-arc {
        transition:
          stroke-dasharray var(--ui-progress-duration) var(--ui-progress-ease),
          stroke-dashoffset var(--ui-progress-duration) var(--ui-progress-ease);
      }
    ```
    Add a reduced-motion block after `.group:is(:disabled, [aria-disabled="true"]) .ds-shape-button-shadow { … }` (:55-57): `@media (prefers-reduced-motion: reduce) { .ds-shape-button-shadow { transition: none; } }`.
  - [ ] 4. ProgressIndicator.tsx: delete :123-124 (`easing`, `transition`). Replace `style={{ transition }}` (:151) and `style={{ transition: \`stroke-dashoffset 300ms ${easing}\` }}` (:165) with `className="ds-progress-arc"`. Rewrite the comment at :79-80 to "Both arcs carry the `ds-progress-arc` transition (`--ui-progress-duration` / `-ease`) so they animate together whenever `progress` changes." If WI-C4-17 has landed, the track `<circle>` is conditional; keep the class on it.
  - [ ] 5. Docs made false: li SKILL.md:184 "Both `<circle>` elements carry a `300ms cubic-bezier(0.4, 0, 0.2, 1)` CSS transition" → "Both `<circle>` elements carry `ds-progress-arc` (`--ui-progress-duration` / `--ui-progress-ease`, reduced motion off)". token-contract.md: add `--ui-shimmer-duration` / `-ease` to "Text Shimmer" (:133-139), and add `--ui-roll-hover-ease` plus the five new families to "Motion" (:146-148). codebase SKILL.md:459-463 and arch SKILL.md:317-321 family lists: add `--ui-shimmer-*`, `--ui-shape-button-*`, `--ui-copy-button-*`, `--ui-slider-glide-*`, `--ui-progress-*`. CHANGELOG `[Unreleased]`: Added (tokens), Changed ("LinearProgressIndicator's fill now eases on the shared progress curve; ProgressIndicator respects prefers-reduced-motion").
  - [ ] 6. Verify: V-LINT. `rg -n "cubic-bezier|\b[0-9]+m?s\b" src/styles/index.css src/styles/dooph-component-tokens.css` → no hits in rules outside `@keyframes` and reduced-motion `0ms`/`1ms` lines (compare against step 1's list: the 12 a.5 literals are gone). `rg -n "300ms|cubic-bezier" src/components/ProgressIndicator/ProgressIndicator.tsx` → 0 hits. V-BUILD. V-PROBE: every probed value equals the step-1 baseline, except LinearProgress timing function = `cubic-bezier(0.4, 0, 0.2, 1)`. V-RENDER: ProgressIndicator circles carry `class="ds-progress-arc"` and no inline `transition`. Storybook `Progress/ProgressIndicator` (change the progress control: arcs still glide), `Inputs/Slider` stepped glide, the CopyButton story, `Buttons/ShapeButton` hover, the ShimmerText and RollHoverText stories: motion unchanged.
  - [ ] 7. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: no duration/ease literal remains in the six helpers or in ProgressIndicator.tsx (step 6 `rg`); V-PROBE shows the token values; a `:root{--ui-slider-glide-duration:1s}` injection changes the probed glide duration.
- log:
  - 2026-10-01 — created by audit

### WI-C4-05: Route the 17 hover/state transitions through one --ui-interaction-* pair (recommended D-03 option)
- status: blocked(D-03)
- addresses: [F-016]
- depends_on: []
- phase: P3
- risk: low — colour, border and shadow fades only. With one pair at the majority value (150ms, `ease-out`), the 10 sites that use `duration-100` + Tailwind's default curve become 50ms slower. If D-03 instead picks the carve-out, this WI is replaced by a two-line arch Rule 6 amendment ("colour/shadow state transitions on hover/press may use Tailwind `duration-*`; motion that is the component's feature may not"), plus the same text in contrib:131.
- semver: minor
- files:
  - modify: `src/styles/tokens.css:373 @ b436647` (insert after the last motion family)
  - modify: `scripts/sync-theme.mjs:138-141 @ b436647` (EXCLUDED)
  - modify: `src/styles/dooph-component-tokens.css:57 @ b436647` (insert the helper after the ShapeButton shadow rules)
  - modify (one class swap each; lines @ b436647): `src/components/Button/Button.tsx:41`, `src/components/OutlineButton/OutlineButton.tsx:162`, `src/components/SplitButton/SplitButton.tsx:24`, `src/components/SplitButton/SplitButton.tsx:55`, `src/components/Checkbox/Checkbox.tsx:37`, `src/components/Toggle/toggleOption.ts:30`, `src/components/Input/Input.tsx:123`, `src/components/Input/Input.tsx:158`, `src/components/VerificationCode/CodeDigitInput.tsx:48`, `src/components/DropdownTrigger/DropdownTrigger.tsx:63`, `src/components/DropdownTrigger/DropdownTrigger.tsx:196`, `src/components/DropdownTrigger/DropdownTrigger.tsx:321`, `src/components/Menu/DropdownMenu.tsx:197`, `src/components/SearchBox/SearchBox.tsx:32`, `src/components/HotkeyIndicator/HotkeyIndicator.tsx:19`, `src/components/TextLink/TextLink.tsx:22`, `src/components/Table/Table.tsx:114`
  - modify: `.agents/skills/dooph-ds-architecture/SKILL.md:317-321 @ b436647`, `.agents/skills/dooph-ds-codebase/SKILL.md:459-463 @ b436647`, `skills/dooph-design-system-theming/references/token-contract.md:146-148 @ b436647`, `CHANGELOG.md` `[Unreleased]`
- anchor:
  ```tsx
  // Button.tsx:41
      "transition-all duration-150 ease-out cursor-pointer select-none",
  // Table.tsx:114
          "hover:bg-ghost-hover transition-colors duration-100",
  ```
- why: 17 hover/state transitions in 13 files hardcode two different timings (150ms ease-out at 7 sites, 100ms default curve at 10). None is retunable or reduced-motion aware, and three units asked for one repo-wide answer (F-016, decision D-03).
- steps:
  - [ ] 1. Baseline V-PROBE: for each of the 17 class strings, read `transitionDuration` / `transitionTimingFunction` (expect `0.15s cubic-bezier(0, 0, 0.2, 1)` ×7, `0.1s cubic-bezier(0.4, 0, 0.2, 1)` ×10).
  - [ ] 2. tokens.css (`:root, .light` only), after the last motion family:
    ```css

      /* Hover / press state transitions (colour, border, shadow) on every
       * interactive control — one pair so a theme retunes UI feedback at once.
       * Read by ds-interaction-motion; the transition PROPERTY stays the
       * component's own `transition-all` / `transition-colors` utility. */
      --ui-interaction-duration: 150ms;
      --ui-interaction-ease: cubic-bezier(0, 0, 0.2, 1);
    ```
    Add both names to sync-theme.mjs EXCLUDED, then run `npm run sync-tokens` (no generated change).
  - [ ] 3. dooph-component-tokens.css, after :55-57:
    ```css

      /* Hover/press feedback timing. Same (0,1,0) specificity as Tailwind's
       * `transition-all` / `transition-colors`, later in the layer, so it wins. */
      .ds-interaction-motion {
        transition-duration: var(--ui-interaction-duration);
        transition-timing-function: var(--ui-interaction-ease);
      }
      @media (prefers-reduced-motion: reduce) {
        .ds-interaction-motion {
          transition-duration: 0ms;
        }
      }
    ```
  - [ ] 4. At each of the 17 sites replace exactly `duration-150 ease-out` or `duration-100` with `ds-interaction-motion` and leave everything else in the string as it is. For example `Button.tsx:41` becomes `"transition-all ds-interaction-motion cursor-pointer select-none",` and `Table.tsx:114` becomes `"hover:bg-ghost-hover transition-colors ds-interaction-motion",`. toggleOption.ts:21 ("Never prefix a package class … with a variant") is respected: the helper is applied bare.
  - [ ] 5. Docs: arch:317-321 and codebase:459-463 family lists gain `--ui-interaction-*` (hover/press feedback, shared). token-contract.md Motion section lists the pair. CHANGELOG `[Unreleased]`: Added `--ui-interaction-duration/-ease`; Changed "hover feedback on SplitButton, Input, CodeDigitInput, menu items, SearchBox, HotkeyIndicator, TextLink and TableRow now runs at 150ms ease-out (was 100ms) and stops under prefers-reduced-motion".
  - [ ] 6. Verify: V-LINT. `rg -n "duration-(100|150)\b" src/components --glob '!*.stories.tsx'` → 0 hits (WI-C4-03 removes the overlay ones). `rg -c "ds-interaction-motion" src/components --glob '!*.stories.tsx'` → 17 occurrences in 13 files. V-BUILD. V-PROBE: all 17 → `0.15s cubic-bezier(0, 0, 0.2, 1)`; injecting `:root{--ui-interaction-duration:1s}` → `1s`. Storybook `Buttons/Button` and `Inputs/Input` hover: fades still play.
  - [ ] 7. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: no `duration-100|150` utility remains in non-story components; the 17 sites carry `ds-interaction-motion`; the probe reads the token values.
- log:
  - 2026-10-01 — created by audit

### WI-C4-06: Replace the 25 token-equal Tailwind numeric-scale utilities with the DS spacing scale
- status: todo
- addresses: [F-017]
- depends_on: [WI-C1-03]
- phase: P3
- risk: medium — two regressions are possible. (1) tailwind-merge must know the DS scale (`px-rg`, `gap-xs`, …), otherwise a consumer override such as `<Button className="px-6">` stops replacing the internal padding and both classes apply. WI-C1-03 registers the DS scales in `cn`, so this WI must not land before it. (2) Tailwind's scale is rem-based and the tokens are px, so at a non-16px root font size these paddings change. That is the intended fix (they then follow the tokens), but visible for those users. OutlineButton's three sites move in WI-C4-12; Checkbox's `size-2.5` ×3 and ChatDivider's `h-3` are not spacing and are handled by WI-C4-08 and F-114.
- semver: patch
- files:
  - modify (lines @ b436647): `src/components/Button/Button.tsx:39`, `src/components/Button/Button.tsx:85-86`, `src/components/SplitButton/SplitButton.tsx:19`, `src/components/SearchBox/SearchBox.tsx:27`, `src/components/HotkeyIndicator/HotkeyIndicator.tsx:11`, `src/components/DropdownTrigger/DropdownTrigger.tsx:59`, `src/components/DropdownTrigger/DropdownTrigger.tsx:194`, `src/components/Tooltip/Tooltip.tsx:70`, `src/components/Toast/Toast.tsx:70`, `src/components/Toast/Toast.tsx:72`, `src/components/Toast/Toast.tsx:74`, `src/components/Toast/Toast.tsx:76`, `src/components/Table/Table.tsx:82`, `src/components/Table/Table.tsx:134`, `src/components/Tabs/Tabs.tsx:21`
  - modify: `CHANGELOG.md` `[Unreleased]`
- anchor:
  ```tsx
  // Button.tsx:85-86
          default: "h-button px-3",
          sm: "h-button-sm px-3",
  // DropdownTrigger.tsx:59
          "min-w-40 rounded-tight border border-solid border-border-primary",
  // Table.tsx:134
          "flex flex-col justify-center overflow-hidden px-4 py-3",
  ```
- why: Each of these utilities equals a DS token only by coincidence (and only at a 16px root), so a consumer token override moves every other component but not these (F-017).
- steps:
  - [ ] 1. Baseline V-PROBE at a 16px root: read `padding*` / `gap` / `min-width` of each class string listed below; values must not change at 16px.
  - [ ] 2. Swap exactly these tokens and nothing else:
    | file:line | before | after |
    |---|---|---|
    | Button.tsx:39 | `gap-2` | `gap-xs` |
    | Button.tsx:85 | `px-3` | `px-rg` |
    | Button.tsx:86 | `px-3` | `px-rg` |
    | SplitButton.tsx:19 | `pl-4 pr-4` | `px-md` |
    | SearchBox.tsx:27 | `gap-2` | `gap-xs` |
    | HotkeyIndicator.tsx:11 | `gap-1` | `gap-xxs` |
    | DropdownTrigger.tsx:59 | `min-w-40` | `ds-min-w-menu` |
    | DropdownTrigger.tsx:194 | `min-w-40` | `ds-min-w-menu` |
    | Tooltip.tsx:70 | `px-3` | `px-rg` |
    | Toast.tsx:70, :72, :74 | `py-2 pl-4 pr-2` | `py-xs pl-md pr-xs` |
    | Toast.tsx:76 | `pb-3 … pr-3` | `pb-rg … pr-rg` (leave `pl-[14px] pt-[14px]` to WI-C4-08) |
    | Table.tsx:82 | `gap-1` | `gap-xxs` |
    | Table.tsx:134 | `px-4 py-3` | `px-md py-rg` |
    | Tabs.tsx:21 | `gap-1` | `gap-xxs` |
    `ds-min-w-menu` is the existing helper (dooph-component-tokens.css:206-208) for `--ui-min-w-menu`. Leave the 5 no-token numeric values in place (DropdownMenuSearch.tsx:77, Sheet.tsx:81/85, Table.tsx:151).
  - [ ] 3. Headers: Button.tsx (## behavior/## constraints) mentions no spacing, so it is consistent. CHANGELOG `[Unreleased]` → Fixed: "Button, SplitButton, SearchBox, HotkeyIndicator, DropdownTrigger, Tooltip, Toast, Table and Tabs spacing now follows `--ui-spacing-*` / `--ui-min-w-menu` overrides."
  - [ ] 4. Verify: V-LINT. `rg -n "\b(p[xytblr]?|gap|min-w)-(1|2|3|4|40)\b" src/components/{Button,SplitButton,SearchBox,HotkeyIndicator,DropdownTrigger,Tooltip,Toast,Table,Tabs} --glob '!*.stories.tsx'` → 0 hits. V-BUILD. V-PROBE: the step-1 values are unchanged at a 16px root. With `:root{--ui-spacing-rg:20px}` injected, Button `padding-inline` → 20px. Consumer override check (requires WI-C1-03): V-RENDER `ds.cn('h-button px-rg','px-6')` → `h-button px-6`.
  - [ ] 5. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: step-4 `rg` → 0 hits; `cn('px-rg','px-6')` → `px-6`; probe values unchanged at 16px and follow a token override.
- log:
  - 2026-10-01 — created by audit

### WI-C4-07: Move Slider and LinearProgressIndicator geometry out of className into ds-slider-* / ds-progress-* helpers
- status: todo
- addresses: [F-017]
- depends_on: [WI-C4-04]
- phase: P3
- risk: medium — the thumb-aligned formulas move from Tailwind arbitrary values to CSS and must stay character-equivalent. A slip shifts the fills off the thumb. Two new tokens (`--ui-size-slider-dot`, `--ui-height-linear-progress`) plus `--ui-linear-progress-gap` become consumer-visible. WI-C4-04 edits the transition lines of the same `ds-progress-*` / `ds-slider-*` rules, so land it first to avoid conflicts.
- semver: minor
- files:
  - modify: `src/styles/tokens.css:478-482 @ b436647` (slider sizing; insert the new tokens after `--ui-height-slider-handle`)
  - modify: `scripts/sync-theme.mjs:89-95 @ b436647` (EXCLUDED, beside the slider geometry entries)
  - modify: `src/styles/dooph-component-tokens.css:126-159 @ b436647`
  - modify: `src/components/Slider/Slider.tsx:94-98 @ b436647` (comment), `:342-344`, `:364-382`, `:397-399`, `:407-412`
  - modify: `src/components/LinearProgressIndicator/LinearProgressIndicator.tsx:55-71 @ b436647`
  - modify: `skills/dooph-design-system-theming/references/token-contract.md:92-104 @ b436647`
  - modify: `CHANGELOG.md` `[Unreleased]`
- anchor:
  ```tsx
  // Slider.tsx:344, :367-368, :379-380, :398, :408, :411
              'h-[var(--ui-height-slider-handle)]',
                  'left-[calc(-1*var(--ds-slider-pad))]',
                  'w-[max(0px,calc(var(--slider-pct)/100*(100%-var(--ui-width-slider-handle))-var(--ui-slider-track-gap)+var(--ds-slider-pad)))]',
                  'right-[calc(-1*var(--ds-slider-pad))]',
                  'left-[min(100%,calc(var(--slider-pct)/100*(100%-var(--ui-width-slider-handle))+var(--ui-width-slider-handle)+var(--ui-slider-track-gap)))]',
                    'absolute top-1/2 size-[6px] -translate-x-1/2 -translate-y-1/2 rounded-full',
                'block h-[var(--ui-height-slider-handle)] w-[var(--ui-width-slider-handle)]',
                'bg-[var(--ds-slider-color)]',
  // LinearProgressIndicator.tsx:55, :61-62, :69
        className={cn('relative h-[4px] w-full', className)}
            'w-[max(4px,calc(var(--progress-pct)*1%-2px))]',
            'bg-[var(--ds-progress-color)]',
            'left-[max(4px,min(100%,calc(var(--progress-pct)*1%+2px)))]',
  ```
- why: These are the package's only raw `var(--ui-*)` in className (R8.10, 5 occurrences, C-CB-162 FALSE). The geometry sits in a different layer and file from its transitions, and the 6px dot, 4px bar and 2px gap have no token (F-017).
- steps:
  - [ ] 1. Baseline: V-BUILD from HEAD. V-RENDER `SliderStepped` (value 40, 5 steps, `defaultValue`) and `LinearProgressIndicator` (value 40) into a V-PROBE page sized 300px wide. Record `getBoundingClientRect()` left/width of the active and inactive pills, each dot, the thumb, and the progress fill/remainder. Repeat at value 0 and 100.
  - [ ] 2. tokens.css, after `--ui-height-slider-handle: 42px;` (:482):
    ```css
      --ui-size-slider-dot: 6px;
      /* LinearProgressIndicator bar: its height is also the fill's minimum width
       * (a round nub at 0%), and `gap` is the space between fill and remainder. */
      --ui-height-linear-progress: 4px;
      --ui-linear-progress-gap: 4px;
    ```
    Add the three names to sync-theme.mjs EXCLUDED next to `ui-height-slider-handle` (:95), then run `npm run sync-tokens` (no generated change).
  - [ ] 3. dooph-component-tokens.css. Add width/height to `.ds-slider-dot` (:144-146): `width: var(--ui-size-slider-dot); height: var(--ui-size-slider-dot);`. Add after `.ds-slider-fill { … }` (:117-124):
    ```css
      /* Slider geometry. --slider-pct and --ds-slider-pad are set inline on the
       * Root. The thumb-aligned term (pct/100 × (100% − handle) …) is the same
       * formula as thumbAlignedLeft() in Slider.tsx — change them together. */
      .ds-slider-root {
        height: var(--ui-height-slider-handle);
      }
      .ds-slider-active-part {
        left: calc(-1 * var(--ds-slider-pad));
        width: max(0px, calc(var(--slider-pct) / 100 * (100% - var(--ui-width-slider-handle)) - var(--ui-slider-track-gap) + var(--ds-slider-pad)));
      }
      .ds-slider-inactive-part {
        right: calc(-1 * var(--ds-slider-pad));
        left: min(100%, calc(var(--slider-pct) / 100 * (100% - var(--ui-width-slider-handle)) + var(--ui-width-slider-handle) + var(--ui-slider-track-gap)));
      }
      .ds-slider-thumb {
        width: var(--ui-width-slider-handle);
        height: var(--ui-height-slider-handle);
        background-color: var(--ds-slider-color);
      }
    ```
    In `.ds-progress-fill` / `.ds-progress-remainder` (:128-133), add beside the transition:
    ```css
      .ds-progress-track { height: var(--ui-height-linear-progress); }
      /* .ds-progress-fill */      width: max(var(--ui-height-linear-progress), calc(var(--progress-pct) * 1% - var(--ui-linear-progress-gap) / 2));
                                   background-color: var(--ds-progress-color);
      /* .ds-progress-remainder */ left: max(var(--ui-height-linear-progress), min(100%, calc(var(--progress-pct) * 1% + var(--ui-linear-progress-gap) / 2)));
    ```
  - [ ] 4. Slider.tsx: `:344` → `'ds-slider-root',`. `:367-368` → `'ds-slider-active-part',` (keep `ds-slider-part` and `ds-slider-fill` on :365/:369). `:379-380` → `'ds-slider-inactive-part',`. `:398` → `'absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full',`. `:408` + `:411` → `'block ds-slider-thumb',` (keep :409-410). Comment :97-98: replace "IMPORTANT: the calc() class strings below MUST stay as single literal strings — Tailwind's scanner reads source text and cannot see concatenated names." with "The same formula backs `.ds-slider-active-part` / `.ds-slider-inactive-part` in dooph-component-tokens.css; change them together." LinearProgressIndicator.tsx: `:55` → `className={cn('relative w-full ds-progress-track', className)}`; delete `:61-62` (now in `.ds-progress-fill`); delete `:69`. The header (:7 "stored on `--progress-pct`", :14 `data-hidden`) stays true, so it is consistent.
  - [ ] 5. Docs: token-contract.md "Slider Sizing" (:92-104) add `--ui-size-slider-dot` (6px, step-dot diameter). Add a "Linear Progress" bullet for `--ui-height-linear-progress` (4px) and `--ui-linear-progress-gap` (4px). CHANGELOG `[Unreleased]` → Added: the three tokens.
  - [ ] 6. Verify: V-LINT. `rg -n "\[var\(--ui-|\[var\(--ds-|-\[[0-9]+px\]|max\(4px|calc\(-1" src/components/Slider/Slider.tsx src/components/LinearProgressIndicator/LinearProgressIndicator.tsx` → 0 hits. `rg -n "var\(--ui-" src --glob '*.tsx' --glob '!*.stories.tsx' | rg "className|'[^']*\[var"` → 0 hits (R8.10). V-BUILD. Re-run step 1: every rect equals the baseline (±0.01px) at values 0, 40 and 100. Storybook `Inputs/Slider` (stepped glide, drag) and `Progress/LinearProgressIndicator` look unchanged.
  - [ ] 7. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: no `var(--ui-*)`, `var(--ds-*)` or px arbitrary value remains in Slider.tsx / LinearProgressIndicator.tsx class strings; probe rects equal the baseline.
- log:
  - 2026-10-01 — created by audit

### WI-C4-08: Replace the remaining arbitrary px literals with tokens (Avatar, ShapeButton, SplitButton, CodeDigitInput, menu label / text trigger, HotkeyIndicator, Toast, Checkbox, OutlineSection)
- status: todo
- addresses: [F-017]
- depends_on: [WI-C1-03]
- phase: P3
- risk: medium — (1) `text-code-digit` and `pl-/pt-toast-inset` are new theme utilities that tailwind-merge must classify correctly, or `cn` drops `text-code-digit` as a text colour beside `text-transparent`. WI-C1-03 registers the generated DS scales, and step 6 checks the merge. (2) ShapeButton's shape is rendered at a fixed `SHAPE_SIZE = 46` via BaseShape's numeric `size`. Rendering it from the token means widening `ShapeProps.size` to `number | (string & {})`, which is additive. All values are unchanged at defaults.
- semver: minor
- files:
  - modify: `src/styles/tokens.css:449-452 @ b436647` (sizing), `:513-521` (spacing), `:392-410` (font sizes)
  - modify: `scripts/sync-theme.mjs:102-104 @ b436647` (EXCLUDED)
  - modify: `src/styles/index.css:338-345 @ b436647` (size utilities)
  - modify: `src/styles/dooph-component-tokens.css:316-320 @ b436647` (radius / size helpers)
  - modify: `src/components/OutlineSection/OutlineSection.tsx:22 @ b436647`
  - modify: `src/components/Avatar/Avatar.tsx:23-24 @ b436647`
  - modify: `src/components/ShapeButton/ShapeButton.tsx:64 @ b436647`, `:125`, `:143`
  - modify: `src/components/Shapes/BaseShape.tsx:4-9 @ b436647`
  - modify: `src/components/SplitButton/SplitButton.tsx:33 @ b436647`
  - modify: `src/components/VerificationCode/CodeDigitInput.tsx:6-7 @ b436647`, `:64`, `:85`
  - modify: `src/components/Menu/DropdownMenu.tsx:339 @ b436647`
  - modify: `src/components/DropdownTrigger/DropdownTrigger.tsx:325 @ b436647`
  - modify: `src/components/HotkeyIndicator/HotkeyIndicator.tsx:21 @ b436647`
  - modify: `src/components/Toast/Toast.tsx:76 @ b436647`
  - modify: `src/components/Checkbox/Checkbox.tsx:81 @ b436647`, `:90`, `:106`
  - modify: `skills/dooph-design-system-theming/references/token-contract.md:83-91 @ b436647`, `CHANGELOG.md` `[Unreleased]`
  - generated (run): `src/styles/index.css` generated block, `src/styles/theme.css`
- anchor:
  ```tsx
  // Avatar.tsx:23-24
            size === AvatarSize.standard && "size-[38px] rounded-avatar p-xs",
            size === AvatarSize.small && "size-[22px] rounded-avatar-sm p-xxs",
  // ShapeButton.tsx:64, :125, :143
  const SHAPE_SIZE = 46;
            "size-[46px] cursor-pointer select-none",
              size={SHAPE_SIZE}
  // CodeDigitInput.tsx:64, :85
            fontSize={18}
              "text-[18px] font-medium text-transparent caret-transparent outline-none",
  // Toast.tsx:76
            "ds-toast-width-complex flex-col gap-md border border-solid border-border-popovers bg-modal-surface pb-3 pl-[14px] pr-3 pt-[14px] text-text",
  ```
- why: These design values cannot be retuned by a consumer, and two of them are written twice (`SHAPE_SIZE` + `size-[46px]`, `fontSize={18}` + `text-[18px]`) with nothing linking the copies (F-017). OutlineSection's 28px radius is the sum of two overridable tokens written as a literal.
- steps:
  - [ ] 1. Baseline V-PROBE (V-BUILD from HEAD): computed `width/height`, `font-size`, `padding-left/top`, `min-width/min-height` and `border-radius` of each element above, rendered via V-RENDER (Avatar both sizes, ShapeButton, SplitButtonAction with an icon, CodeDigitInput, DropdownMenuLabel, TextDropdownTrigger, HotkeyIndicator single key, complex Toast, checked Checkbox, OutlineSection).
  - [ ] 2. tokens.css. Sizing (after :452): `--ui-size-avatar: 38px;` `--ui-size-avatar-sm: 22px;` `--ui-size-shape-button: 46px;` `--ui-size-checkbox-icon: 10px;` `--ui-size-kbd: 23px;` `--ui-height-menu-label: 30px;` and `/* Same row height as the menu label by design; own name so either retunes alone. */ --ui-height-text-trigger: var(--ui-height-menu-label);`. Font sizes (after `--ui-text-subheading: 18px;` :407): `/* The verification-code digit — 18px like subheading, but not that role (CodeDigitInput header). */ --ui-text-code-digit: 18px;`. Spacing (after :521): `/* Complex toast top/left inset (Figma), off the spacing scale like sticker-y. */ --ui-spacing-toast-inset: 14px;`. All are mode-invariant (`:root, .light` only). Add the seven `ui-size-*` / `ui-height-*` names to EXCLUDED (beside `ui-size-checkbox`, :103). Leave `ui-text-code-digit` and `ui-spacing-toast-inset` mapped (they generate `text-code-digit`, `pl-/pt-toast-inset`). Run `npm run sync-tokens`. Expected generated diff: exactly two added lines in index.css and theme.css (`--text-code-digit`, `--spacing-toast-inset`).
  - [ ] 3. index.css `@layer utilities`, after `.size-code-digit { … }` (:342-345): add `.size-avatar`, `.size-avatar-sm`, `.size-shape-button`, `.size-checkbox-icon` (width + height from the token, same shape as `.size-checkbox` :338-341), plus `.h-menu-label { height: var(--ui-height-menu-label); }` and `.h-text-trigger { height: var(--ui-height-text-trigger); }`. dooph-component-tokens.css after `.ds-radius-mini-outset-xxs` (:318-320):
    ```css

      /* Concentric outer radius for the Outline frame wrapping a `soft` surface
       * with an xs inset: soft (20) + xs (8) = 28px — OutlineSection/OutlineButton. */
      .ds-radius-soft-outset-xs {
        border-radius: calc(var(--ui-radius-soft) + var(--ui-spacing-xs));
      }

      .ds-size-icon-rg {
        width: var(--ui-icon-rg);
        height: var(--ui-icon-rg);
      }

      .ds-min-size-kbd {
        min-width: var(--ui-size-kbd);
        min-height: var(--ui-size-kbd);
      }
    ```
  - [ ] 4. Components (literal → class):
    | file:line | before | after |
    |---|---|---|
    | OutlineSection.tsx:22 | `rounded-[28px]` | `ds-radius-soft-outset-xs` |
    | Avatar.tsx:23 | `size-[38px]` | `size-avatar` |
    | Avatar.tsx:24 | `size-[22px]` | `size-avatar-sm` |
    | ShapeButton.tsx:125 | `size-[46px]` | `size-shape-button` |
    | ShapeButton.tsx:143 | `size={SHAPE_SIZE}` | `size="var(--ui-size-shape-button)"`; delete `const SHAPE_SIZE = 46;` (:64) |
    | BaseShape.tsx:5 | `size: number;` | `size: number \| (string & {});` (BaseIcon already accepts strings for `size`) |
    | SplitButton.tsx:33 | `size-[14px]` | `ds-size-icon-rg` |
    | CodeDigitInput.tsx:64 | `fontSize={18}` | `fontSize="var(--ui-text-code-digit)"` |
    | CodeDigitInput.tsx:85 | `text-[18px]` | `text-code-digit` |
    | DropdownMenu.tsx:339 | `h-[30px]` | `h-menu-label` |
    | DropdownTrigger.tsx:325 | `h-[30px]` | `h-text-trigger` |
    | HotkeyIndicator.tsx:21 | `'min-w-[23px] min-h-[23px]'` | `'ds-min-size-kbd'` |
    | Toast.tsx:76 | `pl-[14px] … pt-[14px]` | `pl-toast-inset … pt-toast-inset` |
    | Checkbox.tsx:81, :90, :106 | `size-2.5` | `size-checkbox-icon` |
  - [ ] 5. Header and docs made false. CodeDigitInput.tsx:6-7 `## behavior` "Digit glyph is always `BaseText` at 18px / medium (body role) — never SubheadingText" → "Digit glyph is always `BaseText` at `--ui-text-code-digit` (18px) / medium (body role) — never SubheadingText". The other CodeDigitInput, Checkbox, ShapeButton and DropdownMenu constraints are untouched (consistent). token-contract.md "Sizing And Shape" (:83-91): list the nine new tokens with defaults and their utilities/helpers. CHANGELOG `[Unreleased]` → Added (tokens, `ShapeProps.size` accepts a CSS length).
  - [ ] 6. Verify: V-LINT. `rg -n "\-\[[0-9.]+px\]|size-2\.5|SHAPE_SIZE" src/components --glob '!*.stories.tsx' --glob '!OutlineButton.tsx'` → 0 hits (OutlineButton's literals belong to WI-C4-12; LinearProgress/Slider to WI-C4-07). V-BUILD (porcelain = listed files + the two generated files). V-PROBE: every step-1 value is unchanged. With `:root{--ui-size-shape-button:60px}` injected, the ShapeButton root and its svg both measure 60px. V-RENDER `ds.cn('text-code-digit font-medium text-transparent')` keeps both `text-code-digit` and `text-transparent` (fails if WI-C1-03 has not landed). Storybook `Inputs/VerificationCode`, `Buttons/ShapeButton`, `Inputs/Checkbox`, `Overlays/Toast` (complex) look unchanged.
  - [ ] 7. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: step-6 `rg` → 0 hits; probe values unchanged; a token override moves ShapeButton's root and shape together; `cn` keeps `text-code-digit`.
- log:
  - 2026-10-01 — created by audit

### WI-C4-09: Give TabsContent and CodeDigitInput (incl. error state) a ds-focus-* ring; bring ShapeButton's ring and Checkbox's press ring into the sanctioned helpers/tokens
- status: todo
- addresses: [F-018]
- depends_on: [WI-C4-10]
- phase: P3
- risk: low — TabsContent gains a visible ring (intended). CodeDigitInput's ring moves from box-shadow to outline (same colour token, no longer clipped by `overflow-hidden`). ShapeButton's ring keeps its geometry and stops showing on disabled buttons. Checkbox's press ring keeps its look under new token names (aliases of the focus shadows, re-declared in `.dark` per WI-C4-10's pattern).
- semver: minor
- files:
  - modify: `src/components/Tabs/Tabs.tsx:56 @ b436647`
  - modify: `src/components/VerificationCode/CodeDigitInput.tsx:54-56 @ b436647`
  - modify: `src/styles/dooph-component-tokens.css:35-38 @ b436647`
  - modify: `src/components/Checkbox/Checkbox.tsx:9-10 @ b436647`, `:55`, `:60`
  - modify: `src/styles/tokens.css:557-558 @ b436647` (+ the `.dark` alias group WI-C4-10 creates)
  - modify: `.agents/skills/dooph-ds-contribution/SKILL.md:57 @ b436647`, `.agents/skills/dooph-ds-codebase/SKILL.md:530-531 @ b436647`, `CHANGELOG.md` `[Unreleased]`
  - generated (run): `src/styles/index.css` generated block, `src/styles/theme.css`
- anchor:
  ```tsx
  // Tabs.tsx:56
      className={cn("focus-visible:outline-none", className)}
  // CodeDigitInput.tsx:54-56
            !disabled &&
              !hasError &&
              "focus-within:border-input-border-focus focus-within:shadow-focus-prominent",
  // Checkbox.tsx:55, :60
            "[&:not([data-disabled])]:active:border-input-border-hover [&:not([data-disabled])]:active:shadow-focus-prominent",
            "[&:not([data-disabled])]:active:border-primary [&:not([data-disabled])]:active:shadow-focus-primary",
  ```
  ```css
  /* dooph-component-tokens.css:35-38 */
    .ds-shape-button-focus-visible:focus-visible {
      outline: 2px solid var(--ui-color-focus-ring-prominent);
      outline-offset: 2px;
    }
  ```
- why: TabsContent (tabIndex 0) and an error-state CodeDigitInput show no keyboard focus at all (WCAG 2.4.7). The other two deviations break R8.14's letter and the shared disabled exclusions (F-018).
- steps:
  - [ ] 1. Reproduce: Storybook `Navigation/Tabs` → `Ghost`. Click a trigger, press Tab: focus lands on the panel with no ring. `Inputs/VerificationCode` → `Error`: Tab into a cell and nothing marks it. V-PROBE equivalent: render TabsContent and an error CodeDigitInput, call `.focus()` on the panel and on the cell input, read `getComputedStyle(panel).outlineStyle` → `none` and the cell wrapper's `outlineColor` / `boxShadow` → transparent / `none`.
  - [ ] 2. Tabs.tsx:56: `className={cn("focus-visible:outline-none", className)}` → `className={cn("ds-focus-visible-ring", className)}`.
  - [ ] 3. CodeDigitInput.tsx:54-56 →
    ```tsx
            !disabled && "ds-focus-within-ring",
            !disabled && !hasError && "focus-within:border-input-border-focus",
            !disabled && hasError && "ds-focus-within-ring-danger",
    ```
    (`ds-focus-within-ring` / `-danger` are the Input wrapper's helpers, dooph-component-tokens.css:70-83.)
  - [ ] 4. ShapeButton's offset ring is kept as the sanctioned non-rectangular variant. Give it the shared disabled exclusions (dooph-component-tokens.css:35):
    ```css
      /* Offset variant of ds-focus-visible-ring for organic (non-rectangular)
       * shapes, where a flush ring would cut through the shape. */
      .ds-shape-button-focus-visible:focus-visible:not(:disabled):not([data-disabled]):not(
          [aria-disabled="true"]
        ) {
        outline: 2px solid var(--ui-color-focus-ring-prominent);
        outline-offset: 2px;
      }
    ```
    contrib:57: add "`ds-shape-button-focus-visible` (offset variant for organic shapes)" to the helper list. Update codebase SKILL.md:530 to match.
  - [ ] 5. Checkbox press ring → named press tokens. tokens.css after :558:
    ```css
      /* Checkbox press ring (Figma active state) — the focus-ring paint, named for
       * its job so component classes never use a focus shadow for a press. */
      --ui-shadow-press-prominent: var(--ui-shadow-focus-prominent);
      --ui-shadow-press-primary: var(--ui-shadow-focus-primary);
    ```
    Re-declare both, unchanged, in WI-C4-10's `.dark` alias group (they resolve through dark-changed ring colours). Run `npm run sync-tokens`: it generates `--shadow-press-prominent/-primary` → utilities `shadow-press-*`. Checkbox.tsx:55/:60: `active:shadow-focus-prominent` → `active:shadow-press-prominent`, `active:shadow-focus-primary` → `active:shadow-press-primary`. Header Checkbox.tsx:9-10 "Active/focus rings are gated off while `data-disabled` so a click cannot flash the focus shadow." → "The press shadow (`shadow-press-*`) and focus ring are gated off while `data-disabled` so a click cannot flash them." This changes the described behaviour's wording only; the constraint at :13-14 is unaffected (consistent).
  - [ ] 6. CHANGELOG `[Unreleased]` → Fixed: TabsContent and errored CodeDigitInput focus rings; ShapeButton ring hidden when disabled. Added: `--ui-shadow-press-*`.
  - [ ] 7. Verify: V-LINT. `rg -n "shadow-focus-(prominent|primary)|focus-visible:outline-none" src/components --glob '*.tsx' --glob '!*.stories.tsx'` → only Modal.tsx:74 and Sheet.tsx:72 remain (tabIndex −1 fallback targets, compliant per HC). V-BUILD. Re-run step 1: the panel gets `outline-color` = the prominent ring (`rgba(36, 6, 172, 0.35)` light); the error cell gets `rgba(234, 63, 63, 0.35)`; a normal cell gets the prominent ring via outline and `boxShadow: none`; a disabled ShapeButton with `.focus()` shows no outline; Checkbox `:active` box-shadow is identical to the baseline (V-PROBE with `.shadow-press-prominent` vs `.shadow-focus-prominent`).
  - [ ] 8. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: step-7 `rg` returns only the two compliant dialog lines; probe shows rings on TabsContent and on an error cell.
- log:
  - 2026-10-01 — created by audit

### WI-C4-10: Re-declare the 28 dark-dependent alias tokens in .dark so nested .dark regions resolve them to dark values
- status: todo
- addresses: [F-019]
- depends_on: []
- phase: P3
- risk: low — under `<html class="dark">` and in light mode every value is unchanged (verified by the simulated fix: light root 28/28 and html.dark 28/28 identical). Inside `.dark` islands the 28 tokens switch to their dark values, which is the documented contract. One trade-off: a consumer who overrides one of these aliases on `:root` ONLY now sees the package's alias win inside an island, just as for every base token today.
- semver: patch
- files:
  - modify: `src/styles/tokens.css:642-648 @ b436647` (move :647-648 into the new group)
  - modify: `src/styles/tokens.css:719-724 @ b436647` (append the group before the closing brace)
  - modify: `src/styles/tokens.css:45-47 @ b436647`, `:71-75`, `:102-106` (comments that this change makes false)
  - modify: `.agents/skills/dooph-ds-contribution/SKILL.md:107 @ b436647`, `.agents/skills/dooph-ds-architecture/SKILL.md:297 @ b436647`
  - modify: `skills/dooph-design-system-theming/references/token-contract.md:11 @ b436647`, `CHANGELOG.md` `[Unreleased]`
- anchor:
  ```css
  /* tokens.css:647-648 */
    --ui-color-primary-disabled: var(--ui-color-secondary-disabled);
    --ui-color-primary-border-disabled: var(--ui-color-secondary-border-disabled);
  /* tokens.css:73-75 */
     * to. Every value is an ALIAS, which is also what makes a .dark block
     * unnecessary: the aliased tokens are themselves redefined per mode, so these
     * follow along for free. Override any one of them to break that link. */
  /* tokens.css:105-106 */
     override both tokens if you need a fixed colour. No .dark block: the alias
     already resolves per palette. */
  ```
- why: A `var()` in a custom property is substituted where it is declared (`:root`). A nested `.dark` region therefore inherits these 28 aliases already resolved to light values, contradicting token-contract.md:11's subtree-island promise (F-019).
- steps:
  - [ ] 1. Reproduce: `node docs/audit/_work/scratch/C4/alias-dark.cjs` → `NOT re-declared in .dark: 28`. Browser: V-BUILD from HEAD, then build a V-PROBE page like `docs/audit/_work/scratch/C4/alias-island-probe.html` from the worktree's `dist/styles.css` (light `<html>`, element inside `<div class="dark">`). `getPropertyValue('--ui-color-danger')` on the island element → `#fdfdfd` (light).
  - [ ] 2. tokens.css `.dark`: delete :647-648, and insert this group immediately before the block's closing `}` (after :723, or after :719 once WI-C4-19 has removed :720-723):
    ```css

      /* ── Alias re-declarations ─────────────────────────────────────────────
       * A var() inside a custom property is resolved on the element that
       * DECLARES it. Under <html class="dark"> that is the same element as
       * :root, but a nested `.dark` region (token-contract.md: subtree islands)
       * inherits an alias already resolved to its LIGHT value unless `.dark`
       * declares it again. Every :root alias whose target changes in dark is
       * therefore repeated here verbatim. The text matching :root is the point:
       * R5.3's "value changes" means the RESOLVED value, so do not delete these
       * as unchanged. Add a line whenever a new alias points at a token this
       * block overrides. */
      --ui-color-primary-border: var(--ui-color-primary);
      --ui-color-primary-border-hover: var(--ui-color-primary-hover);
      --ui-color-primary-border-active: var(--ui-color-primary-active);
      --ui-color-primary-disabled: var(--ui-color-secondary-disabled);
      --ui-color-primary-border-disabled: var(--ui-color-secondary-border-disabled);
      --ui-color-prominent-disabled: var(--ui-color-secondary-disabled);
      --ui-color-prominent-border-disabled: var(--ui-color-secondary-border-disabled);
      --ui-color-danger: var(--ui-color-secondary);
      --ui-color-danger-border: var(--ui-color-secondary-border);
      --ui-color-danger-foreground-active: var(--ui-color-secondary-foreground);
      --ui-color-danger-disabled: var(--ui-color-secondary-disabled);
      --ui-color-danger-border-disabled: var(--ui-color-secondary-border-disabled);
      --ui-color-selection: var(--ui-color-primary);
      --ui-color-selection-foreground: var(--ui-color-primary-foreground);
      --ui-color-tooltip-inverse-surface: var(--ui-color-primary);
      --ui-color-tooltip-inverse-text: var(--ui-color-primary-foreground);
      --ui-color-tooltip-inverse-border: var(--ui-color-primary);
      --ui-color-tooltip-matching-surface: var(--ui-color-secondary);
      --ui-color-tooltip-matching-text: var(--ui-color-secondary-foreground);
      --ui-color-tooltip-matching-border: var(--ui-color-border-primary);
      --ui-shimmer-base: var(--ui-color-text-tertiary);
      --ui-shimmer-highlight: color-mix(in srgb, var(--ui-color-text-tertiary) 35%, transparent);
      --ui-chat-tool-shimmer-base: var(--ui-color-ghost-foreground-active);
      --ui-chat-tool-shimmer-highlight: color-mix(in srgb, var(--ui-color-ghost-foreground-active) 35%, transparent);
      --ui-chat-thinking-shimmer-base: var(--ui-color-ghost-foreground);
      --ui-chat-thinking-shimmer-highlight: color-mix(in srgb, var(--ui-color-ghost-foreground) 35%, transparent);
      --ui-color-slider-step-inactive: var(--ui-color-secondary-border);
      --ui-shadow-focus-prominent: 0 0 0 4px var(--ui-color-focus-ring-prominent);
      --ui-shadow-focus-primary: 0 0 0 4px var(--ui-color-focus-ring-primary);
      --ui-color-sticker-secondary: var(--ui-color-text-tertiary);
    ```
    (30 lines: the 28 plus the two moved primary-disabled lines.) Keep every declaration in `:root, .light` as well. sync-theme.mjs maps only that block, so moving them would drop their utilities.
  - [ ] 3. Comments made false. tokens.css:45-47 "Fully mode-invariant, so this family has no .dark override at all:" → "Its own paints are mode-invariant, so they have no .dark override (the two disabled aliases are re-declared in the .dark alias group):". :73-75 "which is also what makes a .dark block / unnecessary: the aliased tokens are themselves redefined per mode, so these / follow along for free." → "so they follow the secondary family per mode; they are repeated in the .dark alias group so nested `.dark` regions re-resolve them." :105-106 "No .dark block: the alias / already resolves per palette." → "Repeated in the .dark alias group so a nested .dark region re-resolves it." contrib:107 and arch:297: after "only if the value changes in dark mode" / "only when the value actually changes" add "— the RESOLVED value: an alias of a token `.dark` overrides is re-declared in the `.dark` alias group". token-contract.md:11: append "Consumer-defined aliases (`--app-x: var(--ui-…)`) need the same: declare them on both `:root` and `.dark`." CHANGELOG `[Unreleased]` → Fixed: "Nested `.dark` regions now resolve the danger-button, tooltip, selection, shimmer, focus-shadow and slider-step aliases to dark values."
  - [ ] 4. Verify: `node docs/audit/_work/scratch/C4/alias-dark.cjs` → `NOT re-declared in .dark: 0`, with `alias lines re-declared identically in .dark: 30`. `npm run sync-tokens`: generated block unchanged. V-LINT. V-BUILD (porcelain = tokens.css + the doc files). Re-run step 1's probe: 28/28 island values equal the `<html class="dark">` values, the light root is unchanged and html.dark is unchanged (`color-mix` rows may differ only in serialised whitespace). Storybook: wrap a danger Button and an inverse Tooltip trigger in `<div className="dark">` on a light page; both render their dark palette.
  - [ ] 5. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: alias-dark.cjs reports 0 missing; the island probe matches html.dark for 28/28.
- log:
  - 2026-10-01 — created by audit

### WI-C4-11: Add the reduced-motion opt-out to PopoverContent
- status: todo
- addresses: [F-020]
- depends_on: []
- phase: P3
- risk: low — affects only users with `prefers-reduced-motion: reduce`, whose Popover/DatePicker panel stops fading and scaling, matching every sibling overlay.
- semver: patch
- files:
  - modify: `src/components/Popover/Popover.tsx:50-53 @ b436647`
  - modify: `CHANGELOG.md` `[Unreleased]`
- anchor:
  ```tsx
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
            "data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95",
            "ds-radix-popover-content-origin",
  ```
- why: PopoverContent is the only overlay content with no reduced-motion override, so every DatePicker panel animates for users who asked for less motion while the menus inside it do not (F-020).
- steps:
  - [ ] 1. Reproduce: V-PROBE with the PopoverContent class string (Popover.tsx:48-53) on an element with `data-state="open"` inside a page that wraps the dist CSS. In the probe, `[...document.styleSheets].flatMap(s=>[...s.cssRules]).filter(r=>r.conditionText?.includes('prefers-reduced-motion')).some(r=>/animate-in|data-\\[state\\=open\\]\\:duration-0/.test(r.cssText) && r.cssText.includes('data-state="open"'))` finds the generic `motion-reduce:data-[state=open]:duration-0` rule, but the Popover element does not carry that class (`el.className.includes('motion-reduce')` → false).
  - [ ] 2. Insert after :52, matching DropdownMenu.tsx:170 / Modal.tsx:31 / Sheet.tsx:39 / Toast.tsx:64:
    ```tsx
            "data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95",
            "motion-reduce:data-[state=open]:duration-0 motion-reduce:data-[state=closed]:duration-0",
            "ds-radix-popover-content-origin",
    ```
    WI-C4-03 later replaces this line with `ds-popover-motion`.
  - [ ] 3. CHANGELOG `[Unreleased]` → Fixed: "PopoverContent (and DatePicker's panel) respects `prefers-reduced-motion`."
  - [ ] 4. Verify: V-LINT. `rg -c "motion-reduce:" src/components/Popover/Popover.tsx` → 1. V-BUILD. In the Browser pane, open Storybook `Overlays/Popover` with DevTools "Emulate CSS prefers-reduced-motion: reduce" (or the probe from step 1 with `matchMedia` emulation). The open content's `getComputedStyle(el).animationDuration` → `0s`. Without emulation it stays `0.15s`.
  - [ ] 5. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: Popover.tsx carries the `motion-reduce:` pair; under reduced-motion emulation the content's animation duration is 0s.
- log:
  - 2026-10-01 — created by audit

### WI-C4-12: Move OutlineButton's orb paint, orb timing and box geometry into --ui-outline-button-* tokens read by ds-* classes
- status: todo
- addresses: [F-021, F-016, F-017]
- depends_on: [WI-C4-08, WI-C5-02]
- phase: P3
- risk: medium — decorative glow. Values are preserved token-for-token, so any visible change is a regression. The orbs gain a reduced-motion path. WI-C5-02 restructures the same JSX for `asChild`/`Slottable`, so land after it and re-anchor the line numbers.
- semver: minor
- files:
  - modify: `src/styles/tokens.css:562-568 @ b436647` (insert the family after the menu min-widths)
  - modify: `scripts/sync-theme.mjs:145-148 @ b436647` (EXCLUDED)
  - modify: `src/styles/dooph-component-tokens.css:40-57 @ b436647` (insert after the ShapeButton helpers)
  - modify: `src/components/OutlineButton/OutlineButton.tsx:147 @ b436647`, `:158-159`, `:174-208`, `:240-281`, `:286`
  - modify: `skills/dooph-design-system-theming/references/token-contract.md:83-91 @ b436647`, `CHANGELOG.md` `[Unreleased]`
- anchor:
  ```tsx
  // OutlineButton.tsx:147, :158-159
            "border border-solid border-border-primary rounded-[28px]",
              "inline-flex items-center justify-center gap-2",
              "h-[54px] min-w-[160px] px-3",
  // :188-193 (glowing orb 1; orb 2 at :202-207 is 24px / 0.22 / 0.42s)
                  style={{
                    background: color1,
                    filter: "blur(18px)",
                    opacity: 0.38,
                    transition: "opacity 0.36s ease-out",
                  }}
  // :244, :247-259 (hover orb 1; orb 2 at :265, :268-280 is 0.22 / 26px / 0.42s / 0.22s)
                    "opacity-0 group-hover:opacity-[0.38]",
                  style={{
                    background: color1,
                    filter: "blur(20px)",
                    left: 0,
                    top: 0,
                    transform:
                      "translate(" +
                      "calc((var(--gx, 0.5) * 0.4 + 0.25) * var(--bw, 160px) - 50%)," +
                      "calc(var(--gy, 0.5) * var(--bh, 54px) - 50%)" +
                      ")",
                    transition:
                      "opacity 0.36s ease-out, transform 0.16s ease-out",
                  }}
  // :286
            <span className="relative z-10 inline-flex items-center gap-2">
  ```
- why: Blur radii, orb opacities and orb timing are component-decided design values emitted as inline style (R8.12), duplicated across two mechanisms and unreachable by tokens or reduced motion. The box geometry repeats token values as px literals (F-021, F-016, F-017).
- steps:
  - [ ] 1. Baseline: V-RENDER `OutlineButton` with `glowing` and without, into a V-PROBE page. Record each orb span's computed `opacity`, `filter`, `transitionDuration`, `transitionTimingFunction`, and the inner button's `height`, `min-width`, `padding-inline`, `gap`, and the frame's `border-radius`. For hover mode also record the orb `opacity` after adding the `:hover` state via DevTools (or by temporarily adding `group-hover`-equivalent styles in the probe).
  - [ ] 2. tokens.css after `--ui-min-w-search-box` (:568):
    ```css

      /* ── OutlineButton ─────────────────────────────────────────────────────
       * Box, and the two glow orbs. Orb 1 is color1, orb 2 color2. The hover
       * (cursor-tracking) mode blurs each orb 2px more than the static `glowing`
       * mode; that split predates the tokens and is kept as-is. */
      --ui-height-outline-button: 54px;
      --ui-min-w-outline-button: 160px;
      --ui-outline-button-orb-1-opacity: 0.38;
      --ui-outline-button-orb-2-opacity: 0.22;
      --ui-outline-button-orb-1-blur: 18px;
      --ui-outline-button-orb-2-blur: 24px;
      --ui-outline-button-orb-1-hover-blur: 20px;
      --ui-outline-button-orb-2-hover-blur: 26px;
      --ui-outline-button-orb-1-fade-duration: 360ms;
      --ui-outline-button-orb-2-fade-duration: 420ms;
      --ui-outline-button-orb-1-track-duration: 160ms;
      --ui-outline-button-orb-2-track-duration: 220ms;
      --ui-outline-button-ease: ease-out;
    ```
    Add the 13 names to EXCLUDED and run `npm run sync-tokens` (no generated change).
  - [ ] 3. dooph-component-tokens.css after :55-57:
    ```css

      /* OutlineButton — frame box and glow orbs (all values: --ui-outline-button-*). */
      .ds-size-outline-button {
        height: var(--ui-height-outline-button);
        min-width: var(--ui-min-w-outline-button);
      }
      .ds-outline-button-glow-1 {
        opacity: var(--ui-outline-button-orb-1-opacity);
        filter: blur(var(--ui-outline-button-orb-1-blur));
        transition: opacity var(--ui-outline-button-orb-1-fade-duration) var(--ui-outline-button-ease);
      }
      .ds-outline-button-glow-2 {
        opacity: var(--ui-outline-button-orb-2-opacity);
        filter: blur(var(--ui-outline-button-orb-2-blur));
        transition: opacity var(--ui-outline-button-orb-2-fade-duration) var(--ui-outline-button-ease);
      }
      .ds-outline-button-trail-1 {
        opacity: 0;
        filter: blur(var(--ui-outline-button-orb-1-hover-blur));
        transition:
          opacity var(--ui-outline-button-orb-1-fade-duration) var(--ui-outline-button-ease),
          transform var(--ui-outline-button-orb-1-track-duration) var(--ui-outline-button-ease);
      }
      .ds-outline-button-trail-2 {
        opacity: 0;
        filter: blur(var(--ui-outline-button-orb-2-hover-blur));
        transition:
          opacity var(--ui-outline-button-orb-2-fade-duration) var(--ui-outline-button-ease),
          transform var(--ui-outline-button-orb-2-track-duration) var(--ui-outline-button-ease);
      }
      .group:hover .ds-outline-button-trail-1 {
        opacity: var(--ui-outline-button-orb-1-opacity);
      }
      .group:hover .ds-outline-button-trail-2 {
        opacity: var(--ui-outline-button-orb-2-opacity);
      }
      @media (prefers-reduced-motion: reduce) {
        .ds-outline-button-glow-1,
        .ds-outline-button-glow-2,
        .ds-outline-button-trail-1,
        .ds-outline-button-trail-2 {
          transition: none;
        }
      }
    ```
    `disabledGlowClass` (:137-140, `group-disabled:!opacity-0`) keeps working because `!important` still beats these rules.
  - [ ] 4. OutlineButton.tsx. `:147` `rounded-[28px]` → `ds-radius-soft-outset-xs` (helper from WI-C4-08). `:158` `gap-2` → `gap-xs`. `:159` → `"ds-size-outline-button px-rg",`. `:286` `gap-2` → `gap-xs`. Glowing orbs: add `"ds-outline-button-glow-1"` / `"ds-outline-button-glow-2"` to the `cn(...)` at :183-187 / :197-201, and reduce each `style` to `style={{ background: color1 }}` / `style={{ background: color2 }}`. Rewrite the comment :176-178 ("Opacity is set inline so it can be transitioned / if `glowing` flips at runtime.") as "Opacity, blur and timing come from the ds-outline-button-glow-* classes (--ui-outline-button-*); only the consumer's colour is inline." Hover orbs: `:244` `"opacity-0 group-hover:opacity-[0.38]"` → `"ds-outline-button-trail-1"`, `:265` → `"ds-outline-button-trail-2"`. In both `style` objects delete `filter` and `transition`, keep `background`, `left`, `top`, `transform`, and change the transform fallbacks `var(--bw, 160px)` / `var(--bh, 54px)` to `var(--bw, var(--ui-min-w-outline-button))` / `var(--bh, var(--ui-height-outline-button))`.
  - [ ] 5. Docs: token-contract.md "Sizing And Shape": add an OutlineButton bullet listing the 13 tokens. CHANGELOG `[Unreleased]` → Added: `--ui-outline-button-*`, `--ui-height-outline-button`, `--ui-min-w-outline-button`. Fixed: OutlineButton glow respects reduced motion.
  - [ ] 6. Verify: V-LINT. `rg -n "blur\(|opacity: 0\.|opacity-\[|\[(28|54|160)px\]|0\.[0-9]+s ease|gap-2|px-3" src/components/OutlineButton/OutlineButton.tsx` → 0 hits. V-BUILD. Re-run step 1: every value equals the baseline. With `:root{--ui-outline-button-orb-1-opacity:0.8}` injected, glowing orb 1 opacity → 0.8. Storybook `Buttons/OutlineButton`: hover glow and the glowing story look unchanged.
  - [ ] 7. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: step-6 `rg` → 0 hits; orb `style` attributes contain only `background` (+ position/transform in hover mode); probe values equal the baseline and follow a token override.
- log:
  - 2026-10-01 — created by audit

### WI-C4-13: Rename the source const/type to IconSize with a non-widening type, put the open arm on the prop, and drop the generator alias
- status: todo
- addresses: [F-023]
- depends_on: []
- phase: P3
- risk: low — the exported name `IconSize` (value and type) is unchanged and `size` accepts exactly the same values. The one public change is that the `IconSize` TYPE narrows from `string` to the four `var(--ui-icon-*)` literals, so consumer code that annotates an arbitrary string as `IconSize` stops type-checking (type-only). `IconSizes` was never reachable (package `exports` has only `"."`).
- semver: minor
- files:
  - modify: `src/components/Icons/BaseIcon.tsx:3-18 @ b436647`, `:39 @ b436647`
  - modify: `scripts/generate-icon-exports.mjs:41 @ b436647`
  - generated (run `npm run generate-icon-exports`, never hand-edit): `src/components/Icons/index.ts:3`
  - modify: `src/components/Icons/Icons.stories.tsx:2 @ b436647`, `:50`, `:169`, `:193-202`
  - modify: `src/components/LoadingSpinner/spinnerGeometry.ts:32 @ b436647`
  - modify: `CHANGELOG.md` `[Unreleased]`
- anchor:
  ```tsx
  // BaseIcon.tsx:3-18
  /**
   * Dot-accessible icon size constants.
   * Values resolve via CSS tokens so consuming projects can override.
   *
   * Usage: <ChevronDownIcon size={IconSizes.md} />
   */
  export const IconSizes = {
    sm: "var(--ui-icon-sm)", // 12px
    rg: "var(--ui-icon-rg)", // 14px
    md: "var(--ui-icon-md)", // 16px
    lg: "var(--ui-icon-lg)", // 18px
  } as const;
  export type IconSizes = (typeof IconSizes)[keyof typeof IconSizes] | string;

  export interface IconProps {
    size?: IconSizes | number;
  ```
  ```js
  // generate-icon-exports.mjs:41
    'export { BaseIcon, IconSizes as IconSize } from "./BaseIcon";',
  ```
- why: The `| string` arm inside the derived type collapses the public `IconSize` to `string`, and the shipped JSDoc teaches `IconSizes`, a name the package does not export (F-023, R1.4's `X | (string & {})` form).
- steps:
  - [ ] 1. Reproduce (tsc probe against a V-BUILD worktree's `dist/index.d.ts`, as in scratch/V6/iconsize-probe.ts): `import { IconSize } from "@dooph-software/design-system"; const a: "x" = null as unknown as IconSize;` reports `Type 'string' is not assignable to type '"x"'`. Hovering `IconSize` in an editor shows `Usage: <ChevronDownIcon size={IconSizes.md} />`.
  - [ ] 2. BaseIcon.tsx:
    ```tsx
    /**
     * Dot-accessible icon size constants.
     * Values resolve via CSS tokens so consuming projects can override.
     *
     * Usage: <ChevronDownIcon size={IconSize.md} />
     */
    export const IconSize = {
      sm: "var(--ui-icon-sm)", // 12px
      rg: "var(--ui-icon-rg)", // 14px
      md: "var(--ui-icon-md)", // 16px
      lg: "var(--ui-icon-lg)", // 18px
    } as const;
    export type IconSize = (typeof IconSize)[keyof typeof IconSize];

    export interface IconProps {
      /** An `IconSize`, any CSS length, or a number of px. */
      size?: IconSize | (string & {}) | number;
    ```
    and `:39` `size = IconSizes.rg,` → `size = IconSize.rg,`.
  - [ ] 3. generate-icon-exports.mjs:41 → `'export { BaseIcon, IconSize } from "./BaseIcon";',`. Run `npm run generate-icon-exports`, which rewrites `src/components/Icons/index.ts:3` to `export { BaseIcon, IconSize } from "./BaseIcon";`. Icons.stories.tsx: replace every `IconSizes` with `IconSize` (:2, :50, :169 incl. the tuple type `[keyof typeof IconSize, IconSize]`, :193-202). spinnerGeometry.ts:32 comment `` `Fonts`/`IconSizes` `` → `` `Fonts`/`IconSize` ``. The colour props (`color`/`strokeColor`/`fillColor: string`) are untouched and wait on D-06 (WI-C4-16).
  - [ ] 4. CHANGELOG `[Unreleased]` → Changed: "The `IconSize` type is now the union of its four values (was `string`); `size` still accepts any CSS length or number." The v6 migration skill needs no entry (no rename). If the release is cut as a major, list it as type-only in the inventory owned by WI-RELEASE-OPEN.
  - [ ] 5. Verify: V-LINT. `rg -n "IconSizes" src scripts` → 0 hits. V-BUILD (porcelain = BaseIcon.tsx, the generator, Icons/index.ts, the stories, spinnerGeometry.ts, CHANGELOG). Re-run step 1's probe: `const a: "x" = null as unknown as IconSize` now reports `Type '"var(--ui-icon-sm)" | …' is not assignable`. `const ok: IconProps = { size: "2rem" }` and `{ size: 20 }` compile. `dist/components/Icons/BaseIcon.d.ts` JSDoc reads `IconSize.md`.
  - [ ] 6. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: `rg -n "IconSizes" src scripts` → 0; the generated barrel exports `IconSize` without an alias; the tsc probe shows a literal union.
- log:
  - 2026-10-01 — created by audit

### WI-C4-14: Give CalendarPresetItem, SearchBox and CodeDigitInput a working disabled look via data-disabled
- status: todo
- addresses: [F-026]
- depends_on: [WI-C4-09]
- phase: P3
- risk: low — disabled-only paint. CalendarPresetItem and SearchBox gain the DS disabled fade, cursor and (SearchBox) disabled surface they lack today. CodeDigitInput gains the fade and cursor its header already promises. Enabled rendering is unchanged.
- semver: patch
- files:
  - modify: `src/components/Calendar/CalendarPresetsPanel.tsx:57-73 @ b436647`
  - modify: `src/components/SearchBox/SearchBox.tsx:23-36 @ b436647`, `:65-73 @ b436647`
  - modify: `src/components/VerificationCode/CodeDigitInput.tsx:8-9 @ b436647`, `:52-53`, `:59-60`
  - modify: `CHANGELOG.md` `[Unreleased]`
- anchor:
  ```tsx
  // CalendarPresetsPanel.tsx:57-60
        <button
          ref={ref}
          type="button"
          data-active={isActive ? "" : undefined}
  // SearchBox.tsx:23, :33
    ({ className, shortcut, showShortcut = !!shortcut, placeholder = 'Search', ...props }, ref) => {
            'hover:border-input-border-hover',
  // CodeDigitInput.tsx:52-53
            disabled &&
              "border-secondary-border-disabled bg-secondary-disabled ds-disabled-state",
  ```
- why: A disabled CalendarPresetItem and a disabled SearchBox render, and in the preset's case hover, exactly like enabled ones. CodeDigitInput's `ds-disabled-state` sits on a `<div>` that can never match `:disabled` (F-026; C-HDR-CodeDigitInput-4 FALSE).
- steps:
  - [ ] 1. Reproduce with V5's method (scratch/V5/render-disabled.cjs → disabled-probe-inline.html): V-RENDER each component enabled and `disabled`, inline the worktree's dist CSS, and read `opacity`, `cursor`, `backgroundColor`, `borderColor` on the CalendarPresetItem button, the SearchBox wrapper and the CodeDigitInput cell. Today the preset and SearchBox values are identical enabled vs disabled, and the CodeDigitInput cell has `opacity 1, cursor auto`.
  - [ ] 2. CalendarPresetsPanel.tsx: after `data-active={isActive ? "" : undefined}` (:60) add `data-disabled={props.disabled ? "" : undefined}`. The `menuItemClassName` rules (`ds-radix-data-disabled`, `data-disabled:hover:bg-transparent`, `data-disabled:active:bg-transparent`, DropdownMenu.tsx:197) then apply unchanged, which honours DropdownMenu.tsx:20 ("Style open/disabled/highlighted via Radix data attributes only").
  - [ ] 3. SearchBox.tsx: destructure `disabled` (`({ className, shortcut, showShortcut = !!shortcut, placeholder = 'Search', disabled, ...props }, ref)`). Give the wrapper `<div>` `data-disabled={disabled ? "" : undefined}`. Change `'hover:border-input-border-hover',` (:33) to `'[&:not([data-disabled])]:hover:border-input-border-hover',` and add `'ds-radix-data-disabled data-[disabled]:bg-secondary-disabled data-[disabled]:border-secondary-border-disabled',` after :34. Pass `disabled={disabled}` to the `<input>` (:65-73).
  - [ ] 4. CodeDigitInput.tsx: `:53` → `"border-secondary-border-disabled bg-secondary-disabled ds-radix-data-disabled",`, and add `data-disabled={disabled || undefined}` beside `data-filled` (:59). Header `## behavior` :8-9 "`disabled` uses secondary / disabled tokens + `ds-disabled-state`" → "`disabled` uses secondary / disabled tokens + `ds-radix-data-disabled` on the cell (the inner `<input>` carries `disabled`)". This makes the header true. The "focus uses brand focus ring" wording is F-054's.
  - [ ] 5. CHANGELOG `[Unreleased]` → Fixed: "Disabled CalendarPresetItem, SearchBox and CodeDigitInput now render the DS disabled state."
  - [ ] 6. Verify: V-LINT. V-BUILD. Re-run step 1. Disabled preset: `opacity` = `0.6` (light), `cursor` = `not-allowed`, and `el.matches('[data-disabled]')` → true, so the `data-disabled:hover:bg-transparent` rule applies. Disabled SearchBox wrapper: `opacity 0.6`, background `rgb(245, 245, 245)`, border `rgb(233, 233, 233)`. Disabled CodeDigitInput cell: `opacity 0.6`, `cursor not-allowed`. Enabled values are identical to the baseline. Storybook `Inputs/SearchBox` → `Disabled` and `Inputs/VerificationCode` → `Disabled` now read as disabled.
  - [ ] 7. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: the three disabled renders differ from their enabled renders in opacity and cursor; `rg -n "ds-disabled-state" src/components/VerificationCode/CodeDigitInput.tsx` → 0 hits (code and header both updated).
- log:
  - 2026-10-01 — created by audit

### WI-C4-15: Collapse the disabled mechanisms: one fade per control, data-[disabled] instead of JS ternaries, ds-disabled-state instead of ds-disabled-control, one hover guard in the Button family
- status: todo
- addresses: [F-026, F-061]
- depends_on: [WI-C4-14]
- phase: P3
- risk: medium — disabled visuals across several controls. (1) DropdownTrigger's chevron goes from 0.36 to 0.6 effective opacity in light mode (0.25 → 0.5 in dark), matching TypeableDropdownTrigger. (2) Input/Typeable wrappers keep their content-only model (surface not faded); only the mechanism changes. (3) Toggle/Tabs options and AIPromptInput's textarea get identical results from `ds-disabled-state` (nothing in them sets `aria-disabled`). (4) An `aria-disabled` SplitButton part or ShapeButton stops painting hover/press colours, and ShapeButton gains its disabled fill under `aria-disabled`.
- semver: patch
- files:
  - modify: `src/styles/index.css:855-859 @ b436647`
  - modify: `src/components/Input/Input.tsx:124 @ b436647`, `:163-170`
  - modify: `src/components/DropdownTrigger/DropdownTrigger.tsx:197-207 @ b436647`
  - modify: `src/components/Toggle/toggleOption.ts:16 @ b436647`, `:32`
  - modify: `src/components/AIChat/AIPromptInput.tsx:227 @ b436647`
  - modify: `src/components/SplitButton/SplitButton.tsx:25-26 @ b436647`, `:56-57`
  - modify: `src/components/ShapeButton/ShapeButton.tsx:68-77 @ b436647`, `:138`
  - modify: `.agents/skills/dooph-ds-codebase/SKILL.md:529 @ b436647`, `CHANGELOG.md` `[Unreleased]`
- anchor:
  ```css
  /* index.css:855-859 */
    .ds-dropdown-caret-host:is(:disabled, [aria-disabled="true"], [data-disabled])
      .ds-dropdown-caret-chevron {
      color: var(--ui-color-secondary-foreground);
      opacity: var(--ui-opacity-disabled);
    }
  ```
  ```tsx
  // Input.tsx:163-170
            disabled
              ? "cursor-not-allowed bg-secondary-disabled border-secondary-border-disabled"
              : [
                  "cursor-text",
                  !hasError &&
                    "[&:hover:not(:focus-within)]:border-input-border-hover [&:hover:not(:focus-within)]:shadow-button-secondary",
                  "focus-within:border-input-border-focus",
                ],
  // SplitButton.tsx:25-26 (same at :56-57)
          "hover:enabled:bg-secondary-hover",
          "active:enabled:bg-secondary-active",
  ```
- why: Four disabled mechanisms and three helpers produce a double fade (DropdownTrigger), a disabled bare Input that still lifts on hover, emitted `data-disabled` attributes that nothing reads, a helper missing from R8.16, and hover guards that ignore `aria-disabled` (F-026, F-061).
- steps:
  - [ ] 1. Baseline V-PROBE (V5's render-disabled method): disabled DropdownTrigger in a DropdownMenu (root `opacity`, chevron `opacity`), disabled TypeableDropdownTrigger, disabled `Input` with and without `icon` (wrapper bg/border/cursor), disabled Toggle option, an `aria-disabled` SplitButtonAction and ShapeButton (fill colour; the hover rule match via `el.matches(':hover')` is not scriptable, so read the CSSOM rules for `hover:enabled` selectors).
  - [ ] 2. Double fade: a host that already fades as a whole must not fade its chevron again. index.css:855:
    ```css
    /* before */  .ds-dropdown-caret-host:is(:disabled, [aria-disabled="true"], [data-disabled])
    /* after  */  .ds-dropdown-caret-host:not(.ds-disabled-state):is(:disabled, [aria-disabled="true"], [data-disabled])
    ```
    Add a comment line above it: `/* Content-only fade, for hosts whose surface stays opaque (TypeableDropdownTrigger). A host carrying ds-disabled-state already fades as a whole. */`. DropdownCaret.tsx:21-22 ("Colours live in the .ds-dropdown-caret CSS … do not move them into props or classes here") is respected: the change stays in that CSS.
  - [ ] 3. Input.tsx:163-170 → style from the `data-disabled` the wrapper already emits (:155):
    ```tsx
            "cursor-text data-[disabled]:cursor-not-allowed data-[disabled]:bg-secondary-disabled data-[disabled]:border-secondary-border-disabled",
            !hasError &&
              "[&:hover:not(:focus-within):not([data-disabled])]:border-input-border-hover [&:hover:not(:focus-within):not([data-disabled])]:shadow-button-secondary",
            "focus-within:border-input-border-focus",
    ```
    Bare input `:124` `"hover:border-input-border-hover hover:shadow-button-secondary",` → `"enabled:hover:border-input-border-hover enabled:hover:shadow-button-secondary",`. DropdownTrigger.tsx:197-207 → the same shape keyed on `data-[disabled]` (it emits `data-disabled` at :248):
    ```tsx
            "cursor-text data-[disabled]:cursor-not-allowed data-[disabled]:bg-secondary-disabled data-[disabled]:border-secondary-border-disabled",
            "[&:hover:not(:focus-within):not([data-disabled])]:border-input-border-hover [&:hover:not(:focus-within):not([data-disabled])]:shadow-button-secondary",
            "focus-within:border-input-border-focus ds-focus-within-ring",
            // The ring carries its state in its own selector — a
            // `data-[state=open]:ds-focus-ring` variant composes a Tailwind
            // variant with a package class and emits no rule at all.
            "data-[state=open]:border-input-border-focus ds-focus-ring-on-open",
    ```
    The decorative icon fades (`disabled && "ds-opacity-disabled"` at Input.tsx:181, DropdownTrigger.tsx:250) stay: that is the content-only use the helper documents (dooph-component-tokens.css:322-323). Input.tsx's header (`className` lands on the chrome element; bare `<input>` stays bare) is consistent.
  - [ ] 4. Fold the third helper: toggleOption.ts:32 `"ds-disabled-control",` → `"ds-disabled-state",`. AIPromptInput.tsx:227 likewise. Header toggleOption.ts:16 "Disabled drops any fill; opacity comes from ds-disabled-control." → "Disabled drops any fill; opacity comes from ds-disabled-state." (same commit, AGENTS.md). The now-unused `.ds-disabled-control` rule is removed by WI-C4-27 (D-15). codebase SKILL.md:529 → mark it "unused; scheduled for removal".
  - [ ] 5. Hover guards: SplitButton.tsx:25-26 and :56-57 → `"[&:not(:disabled):not([aria-disabled=true])]:hover:bg-secondary-hover",` / `"[&:not(:disabled):not([aria-disabled=true])]:active:bg-secondary-active",` (Button.tsx:51's guard). ShapeButton.tsx shapeFillClasses (:68-77): `group-hover:` → `[.group:not(:disabled):not([aria-disabled=true]):hover_&]:` and `group-active:` → `[.group:not(:disabled):not([aria-disabled=true]):active_&]:` (e.g. `"[.group:not(:disabled):not([aria-disabled=true]):hover_&]:text-prominent-hover"`). :138 `"group-disabled:text-secondary-disabled"` → `"[.group:is(:disabled,[aria-disabled=true])_&]:text-secondary-disabled"`. These match the selectors the shadow helper already uses (dooph-component-tokens.css:47-57).
  - [ ] 6. CHANGELOG `[Unreleased]` → Fixed: "DropdownTrigger no longer fades its chevron twice; disabled bare Input no longer lifts on hover; aria-disabled SplitButton/ShapeButton no longer react to hover."
  - [ ] 7. Verify: V-LINT. `rg -n "disabled\s*\?\s*\"cursor-not-allowed|ds-disabled-control|hover:enabled|group-hover:text|group-disabled:" src/components --glob '!*.stories.tsx'` → 0 hits. V-BUILD. Re-run step 1. DropdownTrigger chevron `opacity` = `1` with root `0.6`; Typeable chevron `0.6` with root `1`. Input wrapper disabled bg `rgb(245, 245, 245)` and `cursor: not-allowed`, from the `data-[disabled]` rules. Toggle option disabled `opacity 0.6`. CSSOM shows the generated ShapeButton selectors exist (`[...rules].some(r=>r.selectorText?.includes(':not([aria-disabled=true]):hover'))`). Storybook `Menus/DropdownTriggers` disabled stories and `Inputs/Input` disabled.
  - [ ] 8. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: step-7 `rg` → 0 hits; a disabled DropdownTrigger's effective chevron opacity equals its root's; Input's `data-disabled` is read by a generated `data-[disabled]:` rule.
- log:
  - 2026-10-01 — created by audit

### WI-C4-16: Route LoadingSpinner, ProgressIndicator and ShapeMorphSpinner colour through resolveDsColor and sanction the one name lookup in arch Rule 1 (recommended D-06 option)
- status: blocked(D-06)
- addresses: [F-032]
- depends_on: []
- phase: P3
- risk: low — additive. The only names the private maps knew (`primary`, `prominent`) resolve through `DS_COLOR_TOKENS` to the same `var()` as today, and raw CSS colours still pass through untouched. Names that are invalid paint today (`"danger"`, `"text-secondary"`, …) start drawing. The `color` types widen from `LoadingSpinnerColor | (string & {})` to `DsColor`, which still accepts every `LoadingSpinnerColor` value because both are `DsColorToken` keys. If D-06 picks the alternative (var()-string consts with no lookup), this WI is void: that option is breaking for `color="text"` callers and belongs with the release WIs.
- semver: minor
- files:
  - modify: `src/components/LoadingSpinner/LoadingSpinner.tsx:10 @ b436647`, `:26-36`, `:42-46`, `:301`
  - modify: `src/components/ProgressIndicator/ProgressIndicator.tsx:10 @ b436647`, `:31-40`, `:51-57`, `:299`
  - modify: `src/components/ShapeMorphSpinner/ShapeMorphSpinner.tsx:2-5 @ b436647`, `:8`, `:33-36`, `:40-41`, `:67`
  - modify: `src/components/AIChat/AIContextGauge.tsx:6-9 @ b436647` (## behavior header)
  - modify: `src/utils/color.ts:1-2 @ b436647`
  - modify: `.agents/skills/dooph-ds-architecture/SKILL.md:72-78 @ b436647`
  - modify: `.agents/skills/dooph-ds-codebase/SKILL.md:29-32 @ b436647`
  - modify: `.agents/skills/dooph-ds-loading-indicators/SKILL.md:25 @ b436647`, `:209-211`
  - modify: `skills/dooph-design-system-usage/SKILL.md:365 @ b436647`
  - modify: `CHANGELOG.md` `[Unreleased]`
- anchor:
  ```tsx
  // LoadingSpinner.tsx:26-36
  // ── Color resolution ──────────────────────────────────────────────────────────

  const COLOR_TOKENS: Record<LoadingSpinnerColor, string> = {
    primary: "var(--ui-color-primary)",
    prominent: "var(--ui-color-prominent)",
  };

  /** Preset color aliases resolve to design tokens; arbitrary strings pass through. */
  function resolveColor(color: string): string {
    return COLOR_TOKENS[color as LoadingSpinnerColor] ?? color;
  }
  // ProgressIndicator.tsx:31-40
  // ── Color resolution ──────────────────────────────────────────────────────────

  const COLOR_TOKENS: Record<string, string> = {
    primary: "var(--ui-color-primary)",
    prominent: "var(--ui-color-prominent)",
  };

  function resolveColor(color: string): string {
    return COLOR_TOKENS[color] ?? color;
  }
  // ShapeMorphSpinner.tsx:33-36, :67
  const COLOR_TOKENS: Record<LoadingSpinnerColor, string> = {
    primary: "var(--ui-color-primary)",
    prominent: "var(--ui-color-prominent)",
  };
        color: COLOR_TOKENS[color as LoadingSpinnerColor] ?? color,
  ```
  ```md
  <!-- arch SKILL.md:72-78 -->
  - The value IS the var reference, so resolution is a no-op and a consumer's token
    override still applies. No lookup table to silently mis-map.
  - `(string & {})` keeps dot-access in autocomplete while admitting any CSS value.
  - Numbers resolve per property (`fontSize` → px, `lineHeight` → unitless ratio).

  Used by `Fonts` / `FontSizes` / `FontWeights` / `Tracking` (`BaseText`) and
  `DS_COLOR_TOKENS` via the `color` prop (`Slider*`, `LinearProgressIndicator`).
  ```
- why: `color` accepts 18 DS names on Slider, LinearProgressIndicator, Sticker and AIModelSelect but only 2 on the three loaders, and the types do not show it. `color="text-secondary"` emits `stroke="text-secondary"` and the arc silently vanishes, and `color="danger"` draws nothing on AIContextGauge (F-032). The three private map copies must otherwise change together on every token rename.
- steps:
  - [ ] 1. Reproduce: V-BUILD from HEAD (no edits), then inside the worktree run `node <repo>/docs/audit/_work/scratch/W4a/colorprop.cjs "$PWD"` (the script's argument is the build root; it defaults to the audit build). Output at b436647: `ProgressIndicator text-secondary: strokes=["var(--ui-color-border-primary)","text-secondary"]`, `LoadingSpinner text-secondary` the same, `LoadingSpinner spokes danger: strokes=[] styleColor=["stroke:danger"]`, `AIContextGauge danger: strokes=["var(--ui-color-border-primary)","danger"]`, `ShapeMorphSpinner text-secondary: strokes=[] styleColor=["color:text-secondary"]`. The `primary` and `#a3c2d1` rows already resolve and are the controls.
  - [ ] 2. LoadingSpinner.tsx. After `import { cn } from "../../utils/cn";` (:10) add `import { resolveDsColor, type DsColor } from "../../utils/color";`. Delete :26-36 (the section banner, `COLOR_TOKENS`, `resolveColor`). Props :42-46:
    ```tsx
    // before
      /**
       * Preset color alias or any CSS string (e.g. `"#ff6b6b"`).
       * @default LoadingSpinnerColor.primary
       */
      color?: LoadingSpinnerColor | (string & {});
    // after
      /**
       * A DS colour name (`DS_COLOR_TOKENS` key, e.g. `"primary"`, `"danger"`,
       * `"text-secondary"`) or any CSS colour (e.g. `"#ff6b6b"`).
       * @default LoadingSpinnerColor.primary
       */
      color?: DsColor;
    ```
    :301 `const strokeColor = resolveColor(color);` → `const strokeColor = resolveDsColor(color, "var(--ui-color-primary)");`. Keep the `LoadingSpinnerColor` import (default at :293). The file stays `"use client"` for its own rAF hooks; `utils/color.ts` is server-safe.
  - [ ] 3. ProgressIndicator.tsx. Same import after :10. Delete :31-40 (banner, `COLOR_TOKENS`, `resolveColor`). Props :51-57:
    ```tsx
    // before
      /**
       * Preset alias or any CSS string (e.g. `"#ff6b6b"`).
       * @default LoadingSpinnerColor.primary
       */
      color?:
        | (typeof LoadingSpinnerColor)[keyof typeof LoadingSpinnerColor]
        | (string & {});
    // after
      /**
       * A DS colour name (`DS_COLOR_TOKENS` key, e.g. `"primary"`, `"danger"`,
       * `"text-secondary"`) or any CSS colour (e.g. `"#ff6b6b"`).
       * @default LoadingSpinnerColor.primary
       */
      color?: DsColor;
    ```
    :299 `const strokeColor = resolveColor(color);` → `const strokeColor = resolveDsColor(color, "var(--ui-color-primary)");`. The module stays directive-free; comment :1-3 stays true because `utils/color.ts` uses no hook.
  - [ ] 4. ShapeMorphSpinner.tsx. After `import { cn } from "../../utils/cn";` (:8) add `import { resolveDsColor, type DsColor } from "../../utils/color";`. Delete :33-36 (`COLOR_TOKENS`) and the blank line after it. :40-41 → `  /** A DS colour name (DS_COLOR_TOKENS key) or any CSS colour. */` / `  color?: DsColor;`. :67 → `      color: resolveDsColor(color, "var(--ui-color-primary)"),`. Header :3-4 "the spinner size scale, and the / * spinner colour aliases." → "the spinner size scale, and the shared DS colour / * names (resolveDsColor)." Keep the `LoadingSpinnerColor` import (default at :49).
  - [ ] 5. AIContextGauge.tsx `## behavior` :6-9 (AGENTS.md: code and contract ship together):
    ```tsx
    // before
     * - Draws `used / budget` on a flat ProgressIndicator. `color` is the open
     *   design value (a LoadingSpinnerColor key or any CSS colour), so warning
     *   tiers are a consumer's call:
     *   `color={ratio > 0.9 ? "var(--ui-color-danger-primary)" : undefined}`.
    // after
     * - Draws `used / budget` on a flat ProgressIndicator. `color` is the open
     *   design value (a DS colour name — DS_COLOR_TOKENS key — or any CSS
     *   colour), so warning tiers are a consumer's call:
     *   `color={ratio > 0.9 ? "danger" : undefined}`.
    ```
    The `## constraints` (not clamped; `budget <= 0` draws empty) are untouched, so the change is consistent with them.
  - [ ] 6. Docs this change makes false, or the sanction D-06 grants:
    - arch SKILL.md:72-78 → replace with:
      ```md
      - The value IS the var reference, so resolution is a no-op and a consumer's token
        override still applies. No lookup table to silently mis-map (colour props are
        the one exception, below).
      - `(string & {})` keeps dot-access in autocomplete while admitting any CSS value.
      - Numbers resolve per property (`fontSize` → px, `lineHeight` → unitless ratio).

      Used by `Fonts` / `FontSizes` / `FontWeights` / `Tracking` (`BaseText`).

      **Colour props: the one sanctioned name lookup.** A `color` prop that accepts
      DS colour names is typed `DsColor` and resolves through `resolveDsColor`
      (`src/utils/color.ts`): a `DS_COLOR_TOKENS` key (`"primary"`, `"danger"`,
      `"text-secondary"`) becomes its `var(--ui-*)`; anything else passes through.
      It is ONE shared table, so a name means the same on every component; a
      component-private colour map is a violation. Users: `Slider*`,
      `LinearProgressIndicator`, `Sticker` (custom), `AIModelSelect` parts,
      `LoadingSpinner`, `ProgressIndicator` / `AIContextGauge`, `ShapeMorphSpinner`.
      ```
      BaseIcon's `color` / `strokeColor` / `fillColor` take a CSS colour only (no names), so this rule does not cover them; their stroke-only behaviour is F-063's and is not changed here.
    - `src/utils/color.ts:1-2` → `/* Shared color resolution for every component \`color\` prop that accepts DS` / ` * colour names (arch Rule 1, "Colour props: the one sanctioned name lookup").`. If WI-C1-15 item (f) has already rewritten these lines with a consumer list, replace that list with this pointer.
    - codebase SKILL.md:29-32 → `  utils/color.ts              ← DS_COLOR_TOKENS / resolveDsColor / DsColor — backs every` / `                                \`color\` prop that accepts DS names (Slider*, LinearProgressIndicator,` / `                                Sticker, AIModelSelect, LoadingSpinner, ProgressIndicator/AIContextGauge,` / `                                ShapeMorphSpinner): a token NAME ("primary") or any raw CSS color`. This supersedes WI-C1-15 item (f)'s wording for the same lines.
    - loading-indicators SKILL.md:25 `LoadingSpinnerColor.primary / .prominent  // or arbitrary hex via color prop` → `LoadingSpinnerColor.primary / .prominent  // or any DS colour name / CSS colour via color prop`. In the Color System block, after `LoadingSpinnerColor.prominent    → var(--ui-color-prominent)` (:210) insert `<LoadingSpinner color="danger" />   // any DS_COLOR_TOKENS key, via resolveDsColor`, and change :211's comment `// arbitrary hex passes through` → `// any other CSS colour passes through`.
    - usage SKILL.md:365 `` - **`color` on `Slider*` / `LinearProgressIndicator`:** the one sanctioned place `` → `` - **`color` on `Slider*`, `LinearProgressIndicator`, `Sticker`, `AIModelSelect` and the loaders (`LoadingSpinner`, `ProgressIndicator`, `AIContextGauge`, `ShapeMorphSpinner`):** the one sanctioned place ``. :366-369 stay.
    - CHANGELOG `[Unreleased]` → Fixed: "`LoadingSpinner`, `ProgressIndicator`, `AIContextGauge` and `ShapeMorphSpinner` accept every DS colour name (`color="danger"`, `"text-secondary"`, …). Before, only `primary`/`prominent` resolved and other names drew nothing." Changed: "Their `color` prop is typed `DsColor`."
  - [ ] 7. Verify: V-LINT. `rg -n "COLOR_TOKENS\b|function resolveColor" src --glob '!*.stories.tsx'` → hits only in `src/utils/color.ts` and `src/index.ts` (`DS_COLOR_TOKENS`). V-BUILD (porcelain = the files above). Re-run step 1 in the worktree: `ProgressIndicator text-secondary` → `"var(--ui-color-text-secondary)"`; `LoadingSpinner text-secondary` → same; spokes → `stroke:var(--ui-color-danger-primary)`; `AIContextGauge danger` → `"var(--ui-color-danger-primary)"`; `ShapeMorphSpinner` → `color:var(--ui-color-text-secondary)`; the `primary` and `#a3c2d1` controls are unchanged. tsc probe against the worktree's `dist/index.d.ts` (as in WI-C4-13 step 1): `const a: ProgressIndicatorProps = { progress: 0.5, color: LoadingSpinnerColor.prominent }` and `const b: LoadingSpinnerProps = { color: "oklch(0.7 0.1 200)" }` both compile. Storybook `Progress/ProgressIndicator` with the `color` control set to `danger`: the arc draws in danger red.
  - [ ] 8. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: `rg -n "const COLOR_TOKENS" src` → 0 hits; the step-7 render prints a `var(--ui-color-*)` for every DS-name case; arch SKILL.md names `resolveDsColor` as the sanctioned colour lookup.
- log:
  - 2026-10-01 — created by audit

### WI-C4-17: Make the flat ProgressIndicator use getWavyTrackGeometry and omit the track when it returns null
- status: todo
- addresses: [F-033]
- depends_on: []
- phase: P3
- risk: low — the flat track's length and offset come from the same formula, so every value with a non-zero remainder renders identically (step 1 vs step 4 at p=0 and 0.5). In the clamp band and at p=1 the track `<circle>` is no longer rendered at all. A value moving into the band now drops the track at once instead of transitioning it to a zero-length dot. The wavy variant has always behaved this way. WI-C4-04 later replaces this circle's inline `transition` with `ds-progress-arc`, so this WI leaves the `style={{ transition }}` line as it is.
- semver: patch
- files:
  - modify: `src/components/ProgressIndicator/ProgressIndicator.tsx:70-81 @ b436647` (doc comment), `:106`, `:109-121`, `:139-152`
  - modify: `src/components/ProgressIndicator/waveGeometry.ts:130-134 @ b436647` (doc comment)
  - modify: `.agents/skills/dooph-ds-loading-indicators/SKILL.md:186-193 @ b436647`, `:200-202`
  - modify: `CHANGELOG.md` `[Unreleased]`
- anchor:
  ```tsx
  // ProgressIndicator.tsx:106-121
    const activeLength = circumference * progress;
    const dashOffset = circumference * (1 - progress);

    // At progress === 0: full-circle track, no indicator, no gaps.
    // For progress > 0: standard M3 discrete-arc formula with gapLength gaps.
    let trackLength: number;
    let trackOffset: number;
    if (progress === 0) {
      trackLength = circumference;
      trackOffset = 0;
    } else {
      trackLength = Math.max(0, circumference - activeLength - 2 * gapLength);
      // Correct dashoffset formula: L + G - D where L=trackLength, G=circumference,
      // D=activeLength+gapLength (track starts one gap after the indicator arc ends).
      trackOffset = trackLength + circumference - (activeLength + gapLength);
    }
  // ProgressIndicator.tsx:139-152
        {/* Track arc — full circle at 0, discrete complement of indicator for progress > 0 */}
        <circle
          cx={cx}
          cy={cy}
          r={trackRadius}
          fill="none"
          stroke="var(--ui-color-border-primary)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${trackLength} ${circumference}`}
          strokeDashoffset={trackOffset}
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition }}
        />
  ```
- why: The flat variant re-implements the remainder-track formula and always renders the track `<circle>`. Its zero-length round-capped dash paints a stray dot once the value enters the clamp band (sm ≈0.82–0.91 … xl ≈0.90–0.95) and at p=1 under a translucent `color`, including in AIContextGauge's dial. The guard exists only in the wavy copy (F-033). Using the one function removes the duplicate that let the fix land in one place only.
- steps:
  - [ ] 1. Reproduce: V-BUILD from HEAD (no edits). In the worktree run `node <repo>/docs/audit/_work/scratch/W4a/flat-track.cjs "$PWD"`. It renders both variants at sizes sm/rg/md/xl and p = 0, 0.5, 0.9, 0.94, 1 and prints each track circle's `stroke-dasharray`. At b436647 it ends `zero-length track dashes: 12`: every flat row at p=0.9, 0.94 and 1 has `trackCircles=1 dasharray=["0 <C>"]` (e.g. `flat md p=0.9: … ["0 91.106186954104"]`), while the wavy rows there have `trackCircles=0`. Keep this output as the baseline for the p=0 and p=0.5 rows. Visual: Storybook `Progress/ProgressIndicator` → `Half` with args `progress:0.9` (size md) shows a grey dot in the gap ahead of the arc's head.
  - [ ] 2. ProgressIndicator.tsx `FlatProgressIndicator`. Delete :106 (`const activeLength = …`; it becomes unused and `noUnusedLocals` is on). Replace :109-121 with:
    ```tsx
      // Same remainder track as the wavy variant: full circle at 0, the M3
      // discrete complement above 0, and null once it has no length — a
      // zero-length round-capped dash still paints a dot, so the track is omitted.
      const track = getWavyTrackGeometry(progress, circumference, gapLength);
    ```
    (`getWavyTrackGeometry` is already imported at :25-28.) Replace :139-152 with:
    ```tsx
          {/* Track arc — full circle at 0, discrete complement of the indicator above 0, omitted once it has no length */}
          {track && (
            <circle
              cx={cx}
              cy={cy}
              r={trackRadius}
              fill="none"
              stroke="var(--ui-color-border-primary)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={`${track.length} ${circumference}`}
              strokeDashoffset={track.offset}
              transform={`rotate(-90 ${cx} ${cy})`}
              style={{ transition }}
            />
          )}
    ```
    Doc comment :73-77: after "track covers the complementary arc with a `gapLength` gap at each / endpoint." add " Once that complement has no length the track is omitted (shared with the wavy variant via `getWavyTrackGeometry`)." No new helper, no rename: the function is already variant-neutral in what it computes (F-033 recommendation).
  - [ ] 3. waveGeometry.ts:130-134 doc comment: after "Returns the smooth circular remainder track, or `null` when no track should / * be painted." add the line ` * Shared by the flat and wavy ProgressIndicator variants.` Docs made true or false: loading-indicators SKILL.md:186-190 "Track arc: computed in render (not rAF). Correct formula:" → "Track arc: computed in render (not rAF) by `getWavyTrackGeometry`, the same function the wavy variant uses. Formula:". :193 "trackLength clamps to 0 → no track." becomes literally true (the element is omitted); leave it. :200-202 "`getWavyTrackGeometry` computes the circular remainder and returns `null` at / completion" → "`getWavyTrackGeometry` (shared with the flat variant) computes the circular remainder and returns `null` once it has no length". CHANGELOG `[Unreleased]` → Fixed: "The flat `ProgressIndicator` (and `AIContextGauge`) no longer paints a stray track dot near completion."
  - [ ] 4. Verify: V-LINT. `rg -n "trackLength|trackOffset" src/components/ProgressIndicator/ProgressIndicator.tsx` → 0 hits. V-BUILD (porcelain = ProgressIndicator.tsx, waveGeometry.ts, the skill, CHANGELOG). Re-run step 1 in the worktree: `zero-length track dashes: 0`; flat rows at p=0.9, 0.94 and 1 show `trackCircles=0`; the flat p=0 and p=0.5 rows print the same `dasharray` as the baseline. Storybook `Half` with `progress:0.9` and `Complete` with a translucent `color` (e.g. `rgba(36,6,172,0.4)`): no grey dot. `ProgressSteps` and `Interactive` (drag the progress control through 0.8–1.0): the track shrinks and then disappears with no dot.
  - [ ] 5. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: `flat-track.cjs` against the built worktree prints `zero-length track dashes: 0`; `FlatProgressIndicator` calls `getWavyTrackGeometry` and contains no inline track formula.
- log:
  - 2026-10-01 — created by audit

### WI-C4-18: Redraw HeartFillIcon on the 24-unit grid and add it to the Icons gallery story
- status: todo
- addresses: [F-043]
- depends_on: []
- phase: P3
- risk: low — one path's coordinates. Every `<HeartFillIcon>` grows from about 58% × 50% of its box, anchored top-left, to the full grid like its siblings. That is the intended fix, but it is a visible size and position change for any consumer who compensated with a larger `size` or an offset.
- semver: patch
- files:
  - modify: `src/components/Icons/HeartFillIcon.tsx:6 @ b436647`
  - modify: `src/components/Icons/Icons.stories.tsx:9-10 @ b436647` (import), `:160` (gallery cell)
  - modify: `CHANGELOG.md` `[Unreleased]`
- anchor:
  ```tsx
  // HeartFillIcon.tsx:5-9
      <path
        d="M15 6.375c0 4.375-6.487 7.916-6.763 8.063a.5.5 0 0 1-.474 0C7.487 14.291 1 10.75 1 6.375A3.879 3.879 0 0 1 4.875 2.5c1.291 0 2.42.555 3.125 1.493C8.705 3.055 9.834 2.5 11.125 2.5A3.879 3.879 0 0 1 15 6.375Z"
        fill={color ?? 'currentColor'}
        stroke="none"
      />
  // Icons.stories.tsx:160
        <IconCell icon={(props) => <CheckIcon {...props} />} label="Check" />
  ```
- why: The path was authored on a 16-unit grid but BaseIcon always draws into `viewBox="0 0 24 24"` (BaseIcon.tsx:50). The heart therefore renders at about 58% size, centred at (8, 8.5) instead of (12, 12), beside every other icon. No story renders it, so nothing surfaces the drift (F-043).
- steps:
  - [ ] 1. Reproduce: V-BUILD from HEAD. V-RENDER `renderToStaticMarkup(React.createElement(ds.HeartFillIcon,{size:48}))` and `ds.CheckIcon` at the same size into a V-PROBE page. In the Browser pane, `document.querySelectorAll('svg')[0].querySelector('path').getBBox()` → `{x: 1, y: 2.5, width: 14, height: ≈11.998}` (V2), while the CheckIcon paths' union bbox is centred near (12, 12).
  - [ ] 2. HeartFillIcon.tsx:6 — replace the `d` with the same outline scaled uniformly ×1.5 about the origin. Its 1-unit inset on the 16 grid becomes a 1.5-unit inset on the 24 grid. Arc radii scale too; arc rotation and flags are unchanged. The values were produced by `node docs/audit/_work/scratch/W4a/heart-scale.cjs`:
    ```tsx
    // before
          d="M15 6.375c0 4.375-6.487 7.916-6.763 8.063a.5.5 0 0 1-.474 0C7.487 14.291 1 10.75 1 6.375A3.879 3.879 0 0 1 4.875 2.5c1.291 0 2.42.555 3.125 1.493C8.705 3.055 9.834 2.5 11.125 2.5A3.879 3.879 0 0 1 15 6.375Z"
    // after
          d="M22.5 9.5625c0 6.5625-9.7305 11.874-10.1445 12.0945a.75.75 0 0 1-.711 0C11.2305 21.4365 1.5 16.125 1.5 9.5625A5.8185 5.8185 0 0 1 7.3125 3.75c1.9365 0 3.63.8325 4.6875 2.2395C13.0575 4.5825 14.751 3.75 16.6875 3.75A5.8185 5.8185 0 0 1 22.5 9.5625Z"
    ```
    If the maintainer has a 24-unit re-export of the Figma heart, use that path instead. Step 4's bbox check applies to either. Leave `fill={color ?? 'currentColor'}` and `stroke="none"` unchanged; the colour wiring is F-063's.
  - [ ] 3. Icons.stories.tsx. Add `import { HeartFillIcon } from "./HeartFillIcon";` after `import { ExtensionsIcon } from "./ExtensionsIcon";` (:9). In `SettingsIcons`, after the `Check` cell (:160) add `      <IconCell icon={(props) => <HeartFillIcon {...props} />} label="HeartFill" />`. Insert by content, not line number: WI-C4-13 edits other lines of this file. No header, skill or JSDoc describes the old geometry. CHANGELOG `[Unreleased]` → Fixed: "`HeartFillIcon` now fills the 24-unit icon grid (it rendered at about 58% size in the top-left corner)."
  - [ ] 4. Verify: V-LINT. `rg -n "M15 6.375" src` → 0 hits. V-BUILD (porcelain = HeartFillIcon.tsx, Icons.stories.tsx, CHANGELOG.md; the generated `Icons/index.ts` must not change). Re-run step 1: the heart path's `getBBox()` → `x 1.5, y 3.75, width 21, height ≈17.997` (centre x 12). Storybook `Icons/BaseIcon` → `Settings & System Icons`: the HeartFill cell is the same visual size as its neighbours and sits centred in its cell.
  - [ ] 5. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: the heart path's bbox spans x 1.5–22.5 in the 24-unit viewBox; `rg -n "HeartFillIcon" src/components/Icons/Icons.stories.tsx` → 2 hits (import + cell).
- log:
  - 2026-10-01 — created by audit

### WI-C4-19: Delete the four mode-invariant size/radius re-declarations from .dark (keep the two alias lines in WI-C4-10's commented group)
- status: todo
- addresses: [F-059]
- depends_on: [WI-C4-10]
- phase: P3
- risk: low — the four values equal `:root`, so nothing changes under `<html class="dark">`, in light mode, or inside a `.dark` island with no consumer override. The only change: a consumer's `:root` override of `--ui-size-checkbox`, `--ui-radius-checkbox` or `--ui-radius-avatar(-sm)` now also applies inside `.dark` subtree islands. Deleting the two alias lines too (the unit's original advice) would regress islands to the light `#f5f5f5` disabled paint (V5), so this WI must not touch them. WI-C4-10 lands first and moves them into its commented alias group, so a text-equality R5.3 sweep no longer reads them as redundant.
- semver: patch
- files:
  - modify: `src/styles/tokens.css:719-723 @ b436647`
  - modify: `CHANGELOG.md` `[Unreleased]`
- anchor:
  ```css
  /* tokens.css:718-724 */
    --ui-color-sticker-bg-danger: #ffffff;

    --ui-size-checkbox: 18px;
    --ui-radius-checkbox: 6px;
    --ui-radius-avatar: 8px;
    --ui-radius-avatar-sm: 6px;
  }
  ```
  ```css
  /* :root, .light — the values these duplicate (tokens.css:451, :541-543) */
    --ui-size-checkbox: 18px;
    --ui-radius-checkbox: 6px;
    --ui-radius-avatar: 8px;
    --ui-radius-avatar-sm: 6px;
  ```
- why: R5.3 allows a `.dark` line only when the value changes in dark. These four are genuinely mode-invariant, and re-pinning them in `.dark` cancels a consumer's `:root` override inside the subtree islands that token-contract.md:11 documents as supported (F-059, V5 results C/E).
- steps:
  - [ ] 1. Reproduce. `node docs/audit/_work/scratch/V5/darkdup.cjs | rg "^\s+--" | rg -v "var\("` prints exactly the four lines `--ui-size-checkbox: 18px (:root:451 .dark:720)`, `--ui-radius-checkbox: 6px …`, `--ui-radius-avatar: 8px …`, `--ui-radius-avatar-sm: 6px …`. Cascade: V-BUILD from HEAD, then V-PROBE as V5 did (`docs/audit/_work/scratch/V5/cascade-probe.html` method): a light `<html>`, the dist CSS, then a consumer `<style>:root{--ui-radius-avatar:4px}</style>`, and an element inside `<div class="dark">`. `getComputedStyle(islandEl).getPropertyValue('--ui-radius-avatar')` → `8px` (top-level element → `4px`).
  - [ ] 2. Confirm WI-C4-10 has landed. `.dark` must contain its `/* ── Alias re-declarations …` group, which holds `--ui-color-primary-disabled` and `--ui-color-primary-border-disabled`, and the bare copies at :647-648 must be gone. If it has not landed, stop: deleting lines here while the two alias lines still sit uncommented at the top of `.dark` invites the "delete all six" regression this finding warns about.
  - [ ] 3. tokens.css: delete the blank line and the four declarations before `.dark`'s closing brace (b436647 :719-723), leaving the alias group (or `--ui-color-sticker-bg-danger`, depending on WI-C4-10's placement) as the last content before `}`:
    ```css
    /* before */
      --ui-color-sticker-bg-danger: #ffffff;

      --ui-size-checkbox: 18px;
      --ui-radius-checkbox: 6px;
      --ui-radius-avatar: 8px;
      --ui-radius-avatar-sm: 6px;
    /* after — the four lines are gone; nothing replaces them (R5.3: mode-invariant tokens live only in :root, .light) */
      --ui-color-sticker-bg-danger: #ffffff;
    ```
    Do not touch the `:root, .light` declarations (:451, :541-543). No header, skill or token-contract line claims these four have dark overrides, so no doc becomes false. `scripts/sync-theme.mjs` reads only `:root, .light`, so `npm run sync-tokens` must leave the generated block unchanged. CHANGELOG `[Unreleased]` → Fixed: "A `:root` override of `--ui-size-checkbox`, `--ui-radius-checkbox` or `--ui-radius-avatar(-sm)` now also applies inside nested `.dark` regions."
  - [ ] 4. Verify: `npm run sync-tokens`, then `git diff --stat src/styles/index.css src/styles/theme.css` → empty. V-LINT. Re-run step 1's script: the `rg -v "var\("` filter prints nothing, and every remaining IDENTICAL entry is a `var(` alias inside WI-C4-10's group. V-BUILD (porcelain = tokens.css, CHANGELOG.md). V-PROBE from step 1: the island `--ui-radius-avatar` → `4px`. Without the consumer override, island and `<html class="dark">` → `8px`, and `--ui-size-checkbox` → `18px`. Island `--ui-color-primary-disabled` still equals island `--ui-color-secondary-disabled` (`#222224`). Storybook `Inputs/Checkbox` and the Avatar stories in Dark theme look unchanged.
  - [ ] 5. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: `rg -n "^\s+--ui-(size-checkbox|radius-checkbox|radius-avatar(-sm)?):" src/styles/tokens.css` → exactly 4 hits, all in `:root, .light` (b436647 :451, :541-543); darkdup reports no non-`var()` duplicate; a consumer `:root` radius override reaches a `.dark` island.
- log:
  - 2026-10-01 — created by audit

### WI-C4-20: Replace TableHeaderCell's nonexistent text-text-primary with the real text-text utility
- status: todo
- addresses: [F-060]
- depends_on: []
- phase: P3
- risk: low — the sortable header label already renders in the inherited colour, and in an app whose body colour is `--ui-color-text` that inherited colour is exactly what `text-text` sets. tailwind-merge still drops the Button's `text-ghost-fg`, now as an explicit override. Only an app that sets a different colour on a Table ancestor sees the label switch from that colour to `--ui-color-text`. If the Figma header spec turns out to want the ghost foreground (`#4a4a4a`), delete the override instead (F-060's alternative); that is a visible change and would need its own CHANGELOG line. WI-C4-06 edits `gap-1` on the same line: edit by token, not by line.
- semver: patch
- files:
  - modify: `src/components/Table/Table.tsx:82 @ b436647`
  - modify: `CHANGELOG.md` `[Unreleased]`
- anchor:
  ```tsx
  // Table.tsx:79-84
            <Button
              variant={ButtonVariant.text}
              size={ButtonSize.default}
              className="w-full justify-start gap-1 text-text-primary"
              onClick={onSort}
            >
  ```
- why: `text-text-primary` looks like a token utility but no `--color-text-primary` exists, so it emits no CSS anywhere. tailwind-merge still classifies it as a text colour and deletes the Button's `text-ghost-fg`. The result is a fake token in the source that a contributor will copy and get no colour and no error (F-060, R5.2).
- steps:
  - [ ] 1. Reproduce: `node docs/audit/_work/scratch/W4a/table-header.cjs` (audit build at b436647) → `bare text-colour classes: text-text-primary` / `.text-text-primary has a rule in dist/styles.css: false`. `rg -n "text-text-primary" src` → 1 hit (Table.tsx:82).
  - [ ] 2. Table.tsx:82 — change only that token:
    ```tsx
    // before
              className="w-full justify-start gap-1 text-text-primary"
    // after
              className="w-full justify-start gap-1 text-text"
    ```
    (If WI-C4-06 landed first, the line reads `gap-xxs`; keep it.) `text-text` is the generated utility for `--color-text: var(--ui-color-text)` (index.css:139). Button.tsx's header contract does not cover className colour overrides, so it is consistent; Table.tsx has no contract. CHANGELOG `[Unreleased]` → Fixed: "Sortable `TableHeaderCell` labels use the `text-text` token utility (the previous class did not exist)."
  - [ ] 3. Verify: V-LINT. `rg -n "text-text-primary" src skills .agents` → 0 hits. V-BUILD (porcelain = Table.tsx, CHANGELOG.md), then in the worktree `node <repo>/docs/audit/_work/scratch/W4a/table-header.cjs "$PWD"` → `bare text-colour classes: text-text` / `.text-text has a rule in dist/styles.css: true`. Storybook `Bits & Pieces/Table` → `HeaderCellSortStates` in light and dark: the three sortable labels render in the text colour, the same as the plain header cells beside them.
  - [ ] 4. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: `rg -n "text-text-primary" src` → 0 hits; the rendered sortable header's only bare text-colour class is `text-text`, which has a rule in the built CSS.
- log:
  - 2026-10-01 — created by audit

### WI-C4-21: State the DS-set-state idiom in arch Rule 2 and restyle CodeDigitInput, CalendarPresetItem, CalendarGrid, AIToolPart and HotkeyIndicator from the data attributes they emit
- status: todo
- addresses: [F-061]
- depends_on: [WI-C4-14, WI-C4-15]
- phase: P3
- risk: low — every computed paint is meant to stay identical (step 1 vs step 7). The one new public surface is HotkeyIndicator's `data-pressed`, plus documentation that keeps the emitted AIPromptInput, AIToolPart and CalendarGrid attributes as consumer styling hooks. Two cases where a careless conversion would regress are handled explicitly. (1) A CalendarGrid outside-month day can be a range ENDPOINT (e.g. May 31 in June 2026's grid): a bare `data-[outside]:text-ghost-fg` (specificity 0,2,0) would beat the endpoint's `text-primary-fg`, so the outside rule is scoped to non-endpoint tiles. (2) A disabled errored CodeDigitInput shows the disabled border today, because the later `disabled` class wins in `cn`; the error-border variant excludes `[data-disabled]` (emitted by WI-C4-14) to keep that. WI-C4-14 and WI-C4-15 convert the disabled ternaries (Input, DropdownTrigger, CodeDigitInput, CalendarPresetItem) and must land first. Several other WIs edit these files (WI-C4-05/-06/-08/-09 on CodeDigitInput, HotkeyIndicator): match by content, not line number.
- semver: minor
- files:
  - modify: `.agents/skills/dooph-ds-architecture/SKILL.md:147-154 @ b436647` (insert after :154)
  - modify: `src/components/VerificationCode/CodeDigitInput.tsx:44-51 @ b436647`, `:66-70`
  - modify: `src/components/Calendar/CalendarPresetsPanel.tsx:67-72 @ b436647`
  - modify: `src/components/Calendar/CalendarGrid.tsx:66 @ b436647` (JSDoc), `:172-173`, `:245-246`
  - modify: `src/components/AIChat/AIToolPart.tsx:4-9 @ b436647` (## behavior), `:52-60`, `:68-76`
  - modify: `src/components/AIChat/AIPromptInput.tsx:14-15 @ b436647` (## behavior)
  - modify: `src/components/HotkeyIndicator/HotkeyIndicator.tsx:9-25 @ b436647`
  - modify: `CHANGELOG.md` `[Unreleased]`
- anchor:
  ```tsx
  // CodeDigitInput.tsx:49-51, :66-70
            hasError
              ? "border-danger-primary bg-secondary text-danger-primary"
              : "border-secondary-border bg-secondary text-text",
            className={cn(
              "pointer-events-none absolute inset-0 flex items-center justify-center",
              !filled && "opacity-0",
              hasError && "text-danger-primary",
            )}
  // CalendarPresetsPanel.tsx:70
            isActive && "bg-ghost-active",
  // CalendarGrid.tsx:173, :246
                      !isEndpoint && position !== "none" && "bg-ghost-active",
                        isOutside && "text-ghost-fg",
  // AIToolPart.tsx:71-73
                state === AIToolPartState.error
                  ? "text-danger-primary"
                  : "text-ghost-fg",
  // HotkeyIndicator.tsx:22-24
              pressed
                ? 'bg-ghost-active border-border-primary'
                : 'bg-surface-page border-border-primary'
  // AIPromptInput.tsx:139-140
            data-state={responding ? "responding" : trimmed ? "filled" : "empty"}
            data-disabled={disabled || undefined}
  ```
- why: The package splits evenly (about 8/8) between styling DS-set state from a data attribute and from JS class ternaries. Six components emit an attribute that nothing reads, so it looks like a styling hook while a JS class does the work, and HotkeyIndicator's `pressed` cannot be targeted at all (F-061, V7 corrected tally). Stating one idiom and using the attributes already emitted removes the competing pattern without adding any.
- steps:
  - [ ] 1. Baseline: V-BUILD from HEAD (no edits). In the worktree run `node <repo>/docs/audit/_work/scratch/W4a/state-render.cjs "$PWD" <repo>/docs/audit/_work/scratch/WI-C4-21/state-before.html` (it must print `tagged: 16 missing: (none)`). Open the page in the Browser pane and run the JS-tool one-liner in the script's header comment. Save the 16 rows (CodeDigitInput normal/error/error+disabled border and colour, glyph opacity filled/empty, preset active/inactive background, grid band/none tile background, outside-endpoint/outside/inside label colour, hotkey rest/pressed background, tool error/complete label colour). Record the reader gap: `rg -n "data-\[(filled|error|active|outside|range=[a-z]+|pressed)\]|group-data-\[(state=error|filled|error|pressed)\]" src/components --glob '!*.stories.tsx'` → 0 hits.
  - [ ] 2. arch SKILL.md: insert after :154 (`- \`data-[disabled]\`, \`data-[highlighted]\``):
    ```md

    ### DS-set state uses the same idiom

    State the package computes itself (not Radix) is ALSO a data attribute on the
    element, styled by `data-[x]:` / `group-data-[x]/name:` utilities or a `ds-*`
    selector — not a `cond ? "a" : "b"` class ternary. Examples: CopyButton
    `data-copied`, Slider `data-dragging`, CodeDigitInput `data-filled` /
    `data-error`, CalendarPresetItem `data-active`, HotkeyIndicator `data-pressed`.

    - Every attribute the package emits is either read by a package rule or listed
      as a consumer styling hook in the component's header or JSDoc. Delete one that
      is neither.
    - A package class (`ds-*`, `h-button`, `size-*`) never takes a Tailwind variant
      (toggleOption.ts constraint), so toggling one of those from JS is allowed.
    ```
  - [ ] 3. CodeDigitInput.tsx. Root `cn(...)`: replace the ternary (:49-51) with
    ```tsx
            "group/code-digit border-secondary-border bg-secondary text-text",
            // Error border yields to the disabled border, as the old class order did.
            "data-[error]:text-danger-primary [&[data-error]:not([data-disabled])]:border-danger-primary",
    ```
    Glyph `cn(...)` (:66-70):
    ```tsx
              "pointer-events-none absolute inset-0 flex items-center justify-center",
              "opacity-0 group-data-[filled]/code-digit:opacity-100",
              "group-data-[error]/code-digit:text-danger-primary",
    ```
    `filled` stays (it chooses the glyph text at :72). The `hasError`-keyed lines WI-C4-09 adds (`ds-focus-within-ring-danger` etc.) stay JS because they toggle package classes (step 2 exception). Header :8 "`hasError` paints error-primary border + text" stays true, so the contract is consistent.
  - [ ] 4. CalendarPresetsPanel.tsx:70 `isActive && "bg-ghost-active",` → `"data-[active]:bg-ghost-active",` (reads `data-active`, :60). The JSDoc :42-46 stays true. CalendarGrid.tsx:
    - :173 `!isEndpoint && position !== "none" && "bg-ghost-active",` → `"data-[range=middle]:bg-ghost-active",` (the tile carries `data-range`, :166; `middle` is exactly "not an endpoint and not none").
    - :246 `isOutside && "text-ghost-fg",` → `"group-data-[range=none]/day:data-[outside]:text-ghost-fg group-data-[range=middle]/day:data-[outside]:text-ghost-fg",`. This is scoped to non-endpoint tiles so an outside ENDPOINT keeps `text-primary-fg` (:247, still JS). `group/day` is already on the tile (:172).
    - Above `const CalendarGrid = forwardRef<…>(` (:66) add `/** Each day tile carries \`data-range\` (DayRangePosition) and its button \`data-today\` / \`data-outside\`. The grid's fills read \`data-range\` and \`data-outside\`; all three are also consumer styling hooks. */`. This documents `data-today`, which the package does not read (step 2 first bullet).
    - :176-182 (position `none` rounding/hover, row-edge rounding) and :247 are left in JS. They mix layout (`isFirstColumn`) or `dayDisabled` with state, which F-061 does not cite.
  - [ ] 5. AIToolPart.tsx. Root (:56-60) gains the group name: `"group/tool flex w-full min-w-0 select-none items-center gap-sm px-xs py-xxs text-style-body",`. Label (:71-73) → `"text-ghost-fg group-data-[state=error]/tool:text-danger-primary",`. :74 (`ds-chat-lift` on complete) stays JS (package class). Header `## behavior` :5-7 keeps its tone sentence. After :9 ("…revealed on hover once settled.") add ` * - The root carries \`data-state\` (AIToolPartState) and \`data-variant\`; the error label reads \`data-state\`, and both are consumer styling hooks.` This adds to the behaviour description, so header and code change together (AGENTS.md). Constraints :18-19 ("never an AI SDK state string") are unaffected.
  - [ ] 6. AIPromptInput.tsx: keep the attributes and document them. After the `responding` bullet (:14-15) add ` * - The <form> carries \`data-state="empty|filled|responding"\` (Figma's Empty / Filled / Active) and \`data-disabled\` as consumer styling hooks; no package rule reads them.` This is non-breaking. Dropping them instead is a DOM change for anyone already styling against them, so keep them. The `## constraints` (:21-27) are untouched. HotkeyIndicator.tsx:
    ```tsx
    // before (:9-11, :22-24)
    function HotkeyIndicator({ keys, pressed = false, className, ...props }: HotkeyIndicatorProps) {
      return (
        <span className={cn('inline-flex items-center gap-1', className)} {...props}>
    …
                pressed
                  ? 'bg-ghost-active border-border-primary'
                  : 'bg-surface-page border-border-primary'
    // after
    function HotkeyIndicator({ keys, pressed = false, className, ...props }: HotkeyIndicatorProps) {
      return (
        <span
          data-pressed={pressed || undefined}
          className={cn('group/hotkey inline-flex items-center gap-1', className)}
          {...props}
        >
    …
                'bg-surface-page group-data-[pressed]/hotkey:bg-ghost-active'
    ```
    (`border-border-primary` was repeated in both arms and is already at :17. Keep `gap-1` or WI-C4-06's `gap-xxs`, whichever is present.) CHANGELOG `[Unreleased]` → Added: "`HotkeyIndicator` sets `data-pressed` on its root when `pressed`." Changed: "AIToolPart, AIPromptInput and CalendarGrid document their `data-*` attributes as styling hooks."
  - [ ] 7. Verify: V-LINT. `rg -n '\? "border-danger-primary|!filled && "opacity-0"|hasError && "text-danger-primary"|isActive && "bg-ghost-active"|position !== "none" && "bg-ghost-active"|isOutside && "text-ghost-fg"|AIToolPartState.error$|^\s+pressed$' src/components --glob '!*.stories.tsx'` → 0 hits. Re-run step 1's reader `rg` → at least one hit in each of CodeDigitInput.tsx, CalendarPresetsPanel.tsx, CalendarGrid.tsx, AIToolPart.tsx and HotkeyIndicator.tsx. V-BUILD (porcelain = the files above). Re-run step 1 into `state-after.html`: all 16 rows equal the baseline. In particular `grid-outside-endpoint-label` stays the primary-foreground colour and `digit-error-disabled` keeps the disabled border. Storybook: `Inputs/VerificationCode` (Error, Disabled), the Calendar/DatePicker range stories (a range starting on an outside day), the AIChat tool-part stories (error), and `HotkeyIndicator` pressed look unchanged in light and dark.
  - [ ] 8. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: the step-7 ternary `rg` returns 0 hits; each of the five restyled components has a `data-[…]` / `group-data-[…]` reader for the attribute it emits; the 16 probe rows equal the baseline; arch Rule 2 contains "DS-set state uses the same idiom".
- log:
  - 2026-10-01 — created by audit

## DONE
