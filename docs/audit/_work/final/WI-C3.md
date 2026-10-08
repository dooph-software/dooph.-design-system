# WI-C3 — draft work items (composer C3) @ b436647

Ordering and coordination notes:
- `.agents/skills/dooph-ds-codebase/SKILL.md` is edited by WI-C3-01 (mirror facts, lines 96-107 and 653-662), WI-C3-07 (everything else), and the blocked WI-C3-02 and WI-C3-03. Line 542 (slider) is covered by WI-C2-14 and is not touched here.
- Lines containing a "5.4" token are relabelled by WI-C2-07 (P4). These WIs never add or remove a "5.4" substring except where a step says so explicitly (WI-C3-18 removes Button.tsx's history clause; see its note).
- `src/styles/dooph-component-tokens.css:115-116` (the slider "45%" comment) is covered by WI-C2-15; WI-C3-09 does not touch it.
- `src/components/Slider/Slider.stories.tsx:212` and the LinearProgressIndicator "Color prop" story are covered by WI-C2-06; WI-C3-15 does not touch them.
- The li skill exists twice (canonical `.agents/…` and a real copy in `.claude/…`). Every WI that edits the canonical file ends by re-copying it (WI-C3-01 step 1 is the copy command).

### WI-C3-01: Refresh the stale `.claude` loading-indicators copy from canonical and correct the codebase skill's mirror facts
- status: todo
- addresses: [F-058]
- depends_on: []
- phase: P1
- risk: low — the copy replaces a file Claude Code loads; a wrong source path would load nothing for that skill (checked by a byte-compare)
- semver: none
- files:
  - modify: `.claude/skills/dooph-ds-loading-indicators/SKILL.md:1-274 @ b436647` (replaced wholesale by the canonical file's bytes)
  - modify: `.agents/skills/dooph-ds-codebase/SKILL.md:96-107 @ b436647`
  - modify: `.agents/skills/dooph-ds-codebase/SKILL.md:653-662 @ b436647`
- anchor:
  ```text
  .claude/skills/dooph-ds-loading-indicators/SKILL.md:25   LoadingSpinnerColor.primary / .brand   // or arbitrary hex via color prop
  .claude/skills/dooph-ds-loading-indicators/SKILL.md:202  LoadingSpinnerColor.brand    → var(--ui-color-brand)
  .agents/skills/dooph-ds-codebase/SKILL.md:103-107
  .claude/skills/               ← Claude-specific skill directory
    dooph-ds-architecture  →    symlink → ../../.agents/skills/dooph-ds-architecture
    dooph-ds-codebase      →    symlink → ../../.agents/skills/dooph-ds-codebase
    dooph-ds-contribution  →    symlink → ../../.agents/skills/dooph-ds-contribution
    dooph-ds-loading-indicators/← real copy (not symlinked)
  .agents/skills/dooph-ds-codebase/SKILL.md:660-662
  `core.symlinks = false` on this repo (and Windows checkouts generally) means git
  often materializes those mode-`120000` links as empty/real directories instead —
  so a mirror may be missing or stale. Check actual state before trusting it:
  ```
- why: In every checkout, Claude Code loads the `.claude` real copy, and that copy teaches a nonexistent `LoadingSpinnerColor.brand` / `--ui-color-brand` and lacks the R12.1 paragraph (F-058; C-LIC-1..4). The codebase skill lists half the mirror entries and gives a diagnosis (C-CB-234) that sends agents looking for directories when the materialised links are plain files. Neither fix depends on D-10.
- steps:
  - [ ] 1. Confirm the target is a real file, not a link, then copy (PowerShell): `git ls-files -s .claude/skills/dooph-ds-loading-indicators/SKILL.md` → mode `100644`; `(Get-Item .claude\skills\dooph-ds-loading-indicators).LinkType` → empty. Then `Copy-Item -Force .agents\skills\dooph-ds-loading-indicators\SKILL.md .claude\skills\dooph-ds-loading-indicators\SKILL.md`.
  - [ ] 2. In `.agents/skills/dooph-ds-codebase/SKILL.md`, replace lines 96-107 (the `.agents/skills/` and `.claude/skills/` tree entries, C-CB-29, C-CB-30). Leave the `radix-ui-design-system` line in place (WI-C3-03, D-11, owns it):
    ```text
    .agents/skills/               ← authoring-side skills for this repo (canonical source)
      dooph-ds-architecture/      ← architecture rules skill
      dooph-ds-codebase/          ← this file
      dooph-ds-contribution/      ← contribution guide skill
      dooph-ds-loading-indicators/← loading-indicator + shape-morph component skill
      dooph-ds-writing-version-migrations/← how to author/update the shipped vN-migration skills (majors only)
      file-header-contracts/      ← vendored (dooph-software/dooph-skills, skills-lock.json): writing header contracts
      radix-ui-design-system/     ← Radix UI patterns skill
      skill-creator/              ← vendored (anthropics/skills)
      using-airbnb-visx-lib/      ← vendored (dooph-software/dooph-skills): visx v4
    .claude/skills/               ← what Claude Code loads; 8 entries, three mechanisms
      dooph-ds-architecture, dooph-ds-codebase, dooph-ds-contribution,
      dooph-ds-writing-version-migrations ← git symlinks (mode 120000) → ../../.agents/skills/<name>
      dooph-ds-loading-indicators/, skill-creator/ ← real copies (re-copy after editing the canonical)
      file-header-contracts/, using-airbnb-visx-lib/ ← git tracks real copies; the maintainer's disk has absolute junctions
    .agent/skills/                ← 3 git symlinks: dooph-ds-architecture, dooph-ds-codebase, dooph-ds-contribution
    ```
  - [ ] 3. Replace lines 653-656 (canonical list, C-CB-232), keeping `radix-ui-design-system` (D-11):
    before: ``(`dooph-ds-architecture`, `dooph-ds-codebase`, `dooph-ds-contribution`,`` / ``\`dooph-ds-loading-indicators\`, plus the general `radix-ui-design-system` and`` / ``\`skill-creator\`). **Always edit here.**``
    after: ``(`dooph-ds-architecture`, `dooph-ds-codebase`, `dooph-ds-contribution`, `dooph-ds-loading-indicators`, `dooph-ds-writing-version-migrations`, plus the vendored `file-header-contracts`, `using-airbnb-visx-lib`, `skill-creator` and `radix-ui-design-system` — see `skills-lock.json` for their sources). **Always edit here.**``
  - [ ] 4. Replace lines 660-662 (C-CB-234) with:
    ```text
    `core.symlinks = false` on this repo (and Git for Windows by default) means a
    fresh clone or worktree materialises each mode-`120000` link as a small plain
    TEXT FILE whose content is the link target (e.g. `../../.agents/skills/dooph-ds-codebase`).
    Claude Code cannot load a skill from a file, so those skills silently disappear.
    Check actual state before trusting a mirror:
    ```
    and add, directly under the existing ``cmd /c dir /AL ".claude\skills"`` line inside the same powershell fence: ``Get-ChildItem .claude\skills, .agent\skills -File   # any entry listed here is a materialised link``.
  - [ ] 5. Verify: `git diff --no-index --quiet .agents/skills/dooph-ds-loading-indicators/SKILL.md .claude/skills/dooph-ds-loading-indicators/SKILL.md` → exit 0; `rg -n "brand" .claude/skills/dooph-ds-loading-indicators/SKILL.md` → no matches; `rg -n "empty/real directories" .agents/skills/dooph-ds-codebase/SKILL.md` → no matches; `rg -c "using-airbnb-visx-lib" .agents/skills/dooph-ds-codebase/SKILL.md` → ≥ 2; `git status --porcelain` lists only the two SKILL.md files (the `.claude/skills/dooph-ds-codebase` entry is a link, so it shows no separate change).
  - [ ] 6. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: the two loading-indicators SKILL.md files are byte-identical; the codebase skill names all 9 canonical skills and all 8 `.claude/skills` entries, and no longer says "empty/real directories".
- log:
  - 2026-10-01 — created by audit

### WI-C3-02: Replace the three mirroring mechanisms with tracked real copies generated by one script, and delete `.agent/skills`
- status: blocked(D-10)
- addresses: [F-058]
- depends_on: [WI-C3-01]
- phase: P2
- risk: medium — removing a Windows junction with a recursive delete deletes the canonical skill it points to (step 1 uses `rmdir`, which removes only the link); a mirror list that misses a skill drops it for Claude
- semver: none
- files:
  - create: `scripts/sync-skill-mirrors.mjs`
  - modify: `package.json:40-56 @ b436647` (scripts block)
  - modify: `.claude/skills/dooph-ds-architecture`, `.claude/skills/dooph-ds-codebase`, `.claude/skills/dooph-ds-contribution`, `.claude/skills/dooph-ds-writing-version-migrations` (mode 120000 → real directories)
  - modify: `.claude/skills/file-header-contracts/`, `.claude/skills/using-airbnb-visx-lib/` (junction on the maintainer's disk → real directory; tracked files unchanged)
  - delete: `.agent/skills/dooph-ds-architecture`, `.agent/skills/dooph-ds-codebase`, `.agent/skills/dooph-ds-contribution` (mode 120000)
  - modify: `.agents/skills/dooph-ds-codebase/SKILL.md:103-107,651-677 @ b436647` (as left by WI-C3-01)
- anchor:
  ```text
  .agents/skills/dooph-ds-codebase/SKILL.md:656-658
  `skill-creator`). **Always edit here.** The `.claude/` and `.agent/` skill
  directories are meant to be directory symlinks back into `.agents/skills/` so a
  single edit serves every agent framework.
  .agents/skills/dooph-ds-codebase/SKILL.md:676-677
  If a mirror is a real copy rather than a link (e.g. `.claude/skills/dooph-ds-loading-indicators`),
  edits made in `.agents/` won't propagate — re-copy or relink it after changing the source.
  git ls-files -s: 120000 … .claude/skills/dooph-ds-codebase ; 120000 … .agent/skills/dooph-ds-codebase ; git config core.symlinks → false
  ```
- why: With core.symlinks=false (this repo's and Git for Windows' default), the four symlinked rulebook skills check out as text files that Claude cannot load, while real copies drift silently (F-058). Tracked real copies load in every checkout. A `--check` mode turns drift into a failing command instead of a stale skill. Nothing in this repo reads `.agent/skills`, and it carries 3 of 9 skills.
- steps:
  - [ ] 1. Remove the six on-disk links in the maintainer's checkout without touching their targets (PowerShell, one per entry): `cmd /c rmdir ".claude\skills\dooph-ds-architecture"` (likewise `dooph-ds-codebase`, `dooph-ds-contribution`, `dooph-ds-writing-version-migrations`, `file-header-contracts`, `using-airbnb-visx-lib`). Never use `Remove-Item -Recurse` on a junction. Then confirm the canonicals are intact: `Test-Path .agents\skills\file-header-contracts\SKILL.md` → True (repeat for each).
  - [ ] 2. Create `scripts/sync-skill-mirrors.mjs` (zero dependencies, `node:fs`/`node:path` only; a why-comment at the top naming F-058's failure). Shape:
    ```js
    // Mirrors .agents/skills/<name> into .claude/skills/<name> as REAL copies.
    // Why: git symlinks check out as text files under core.symlinks=false, and
    // Claude Code cannot load a skill from a file. --check exits 1 on drift.
    const MIRRORED = [
      "dooph-ds-architecture", "dooph-ds-codebase", "dooph-ds-contribution",
      "dooph-ds-loading-indicators", "dooph-ds-writing-version-migrations",
      "file-header-contracts", "using-airbnb-visx-lib", "skill-creator",
    ];
    // for each name:
    //   src = .agents/skills/<name>, dst = .claude/skills/<name>
    //   lstat(dst): isSymbolicLink() → print "remove link <dst> with `cmd /c rmdir` first" and exit 2
    //               isFile()         → (a materialised git link) unlinkSync(dst) in write mode; drift in --check mode
    //   --check: walk src and dst; any missing, extra or byte-different file → print the path, set exit 1
    //   write:   rmSync(dst, { recursive: true, force: true }) only after the isSymbolicLink() guard; cpSync(src, dst, { recursive: true })
    // exit 0 when clean
    ```
  - [ ] 3. In `package.json` scripts add `"sync-skills": "node scripts/sync-skill-mirrors.mjs"` and change `"lint": "tsc --noEmit"` to `"lint": "tsc --noEmit && node scripts/sync-skill-mirrors.mjs --check"`.
  - [ ] 4. Run `npm run sync-skills`, then `git rm --cached .claude/skills/dooph-ds-architecture .claude/skills/dooph-ds-codebase .claude/skills/dooph-ds-contribution .claude/skills/dooph-ds-writing-version-migrations` (drops the 120000 entries) and `git add .claude/skills`. Run `git rm -r .agent` (three link entries; `.agent/` holds nothing else: `git ls-files .agent` → those 3).
  - [ ] 5. Rewrite the codebase skill. Lines 103-107 become `.claude/skills/ ← real copies of 8 canonical skills, generated by scripts/sync-skill-mirrors.mjs (never edit here)`, and delete the `.agent/skills/` tree line WI-C3-01 added. Replace lines 651-677 (the whole "Maintenance Skills: Canonical Source & Mirroring" section body) with: canonical source `.agents/skills/` ("Always edit here"); after any edit run `npm run sync-skills`; `npm run lint` fails on drift; Claude Code loads `.claude/skills/`; mirrors are real copies because git symlinks become text files under core.symlinks=false; `radix-ui-design-system` is not mirrored. Delete the `mklink` and `Remove-Item` instructions.
  - [ ] 6. Verify: `npm run lint` → exit 0. `git ls-files -s .claude .agent | Select-String '^120000'` → no output. In a scratch worktree created with `git -c core.symlinks=false worktree add ../c3-mirror-check HEAD` (after the maintainer's commit, or from a stash-applied copy), `Test-Path ..\c3-mirror-check\.claude\skills\dooph-ds-architecture\SKILL.md` → True. Back in the main checkout, append one byte to `.agents/skills/dooph-ds-codebase/SKILL.md` → `node scripts/sync-skill-mirrors.mjs --check` exits 1 naming that file; revert the byte → exit 0.
  - [ ] 7. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: no mode-120000 entry under `.claude/` or `.agent/`; `.agent/` is untracked; `node scripts/sync-skill-mirrors.mjs --check` exits 0; `npm run lint` runs it; the codebase skill describes one mechanism.
- log:
  - 2026-10-01 — created by audit

### WI-C3-03: Remove the vendored radix-ui-design-system skill and every pointer to it
- status: blocked(D-11)
- addresses: [F-025]
- depends_on: [WI-C3-01]
- phase: P1
- risk: low — a skills-sync tool that reads skills-lock.json would re-install the skill if the lock entry stayed; nothing in src/ or the build reads the skill
- semver: none
- files:
  - delete: `.agents/skills/radix-ui-design-system/SKILL.md`, `.agents/skills/radix-ui-design-system/examples/README.md`, `.agents/skills/radix-ui-design-system/examples/dialog-example.tsx`, `.agents/skills/radix-ui-design-system/examples/dropdown-example.tsx`, `.agents/skills/radix-ui-design-system/templates/component-template.tsx.template`
  - modify: `skills-lock.json:10-15 @ b436647`
  - modify: `.agents/skills/dooph-ds-codebase/SKILL.md:102 @ b436647` and the canonical-list sentence at :653-656 (as rewritten by WI-C3-01)
- anchor:
  ```json
      "radix-ui-design-system": {
        "source": "sickn33/antigravity-awesome-skills",
        "sourceType": "github",
        "skillPath": "skills/radix-ui-design-system/SKILL.md",
        "computedHash": "e80a260a82334d85f4ca41d9417f44df759db55db88c881447c8d8d2eb434825"
      },
  ```
  ```text
  .agents/skills/dooph-ds-codebase/SKILL.md:102    radix-ui-design-system/     ← Radix UI patterns skill
  ```
- why: The skill's template teaches seven patterns arch Rules 1-2 ban, and the codebase skill presents it as canonical (F-025). Arch Rule 2 and the contribution skill already cover Radix wrapping for this repo, so deleting it removes the contradiction without losing guidance.
- steps:
  - [ ] 1. `git rm -r .agents/skills/radix-ui-design-system` (5 tracked files; there is no copy under `.claude/skills` or `.agent/skills`: `git ls-files | rg radix-ui-design-system` → exactly these 5 paths).
  - [ ] 2. In `skills-lock.json`, delete lines 10-15 (the anchor block above, including its trailing `},`). The `skill-creator` entry that follows keeps its own `{ … },`. Result: three entries (`file-header-contracts`, `skill-creator`, `using-airbnb-visx-lib`).
  - [ ] 3. In `.agents/skills/dooph-ds-codebase/SKILL.md`, delete line 102 (`radix-ui-design-system/     ← Radix UI patterns skill`). In the canonical-list sentence WI-C3-01 wrote, delete `` and `radix-ui-design-system` `` so the list reads "…plus the vendored `file-header-contracts`, `using-airbnb-visx-lib` and `skill-creator` — see `skills-lock.json` for their sources". If WI-C3-02 has landed, also delete its sentence "`radix-ui-design-system` is not mirrored."
  - [ ] 4. Verify: `rg -n "radix-ui-design-system" --glob '!docs/audit/**'` → no matches; `node -e "const l=require('./skills-lock.json'); console.log(Object.keys(l.skills).join(','))"` → `file-header-contracts,skill-creator,using-airbnb-visx-lib`; `npm run lint` → exit 0.
  - [ ] 5. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: `.agents/skills/radix-ui-design-system/` is untracked and absent; skills-lock.json parses with three entries; no file outside docs/audit names the skill.
- log:
  - 2026-10-01 — created by audit

### WI-C3-04: Move LoadingSpinner's timing into a `--ui-spinner-*` token family driven by CSS (Rule 6 escape hatch), add its reduced-motion block, and amend arch Rule 6 and the li skill to match
- status: blocked(D-04)
- addresses: [F-034]
- depends_on: [WI-C3-05, WI-C3-07]
- phase: P3
- risk: medium — the flat arc's feel depends on the sweep curve (`cubic-bezier(0.37, 0, 0.63, 1)` reproduces the current `(1 − cos)/2` per half-cycle); an unregistered or mistyped `@property` freezes the arc at its initial value; per-frame `getComputedStyle` on one `<g>` is the sampling cost
- semver: minor
- files:
  - modify: `src/components/LoadingSpinner/spinnerGeometry.ts:48-71,103-111,127-132,144 @ b436647`
  - modify: `src/components/LoadingSpinner/LoadingSpinner.tsx:16-24,96-111,125-181,196-211,218-264 @ b436647`
  - modify: `src/styles/tokens.css:454-458 @ b436647` (append after :458)
  - modify: `src/styles/index.css:62-66 @ b436647` (append `@property` after :66), `:918-919` (rules before the `@layer utilities` close), `:935-947` (keyframes)
  - modify: `.agents/skills/dooph-ds-loading-indicators/SKILL.md:134-176,220,238 @ b436647` (as left by WI-C3-05) and its `.claude` copy
  - modify: `.agents/skills/dooph-ds-architecture/SKILL.md:317-321,342 @ b436647` (families list as left by WI-C3-07)
  - modify: `.agents/skills/dooph-ds-codebase/SKILL.md:557,569-571 @ b436647`
- anchor:
  ```tsx
  // LoadingSpinner.tsx:135-148
      function animate(now: number) {
        const elapsed = now - startTime;
        const phase = (elapsed % SPINNER_ANIM_DURATION) / SPINNER_ANIM_DURATION;

        // Cosine easing: 0→1→0 over one cycle.
        const easedPhase = (1 - Math.cos(phase * twoPi)) / 2;
        const sweepAngle =
          (SPINNER_MIN_SWEEP +
            (SPINNER_MAX_SWEEP - SPINNER_MIN_SWEEP) * easedPhase) *
          twoPi;

        // Head advances at 2 full rotations per cycle; tail = head − sweepAngle.
        const arcEndAngle =
          SPINNER_START_ANGLE + (elapsed / SPINNER_ANIM_DURATION) * 2 * twoPi;
  // LoadingSpinner.tsx:260
            animation: `ds-spinner-rotate ${spokesDuration}ms linear infinite`,
  ```
- why: The spinner owns its duration, easing and (absent) reduced-motion decision in JavaScript. Users who ask for reduced motion get full motion, and no token can retune it (F-034). Moving the clock into CSS keeps li's `<path>` geometry, which is the part that has to be JS, and follows the CSS-clock precedent of the shape-morph loader (index.css:57, :798, :810-812).
- steps:
  - [ ] 1. Reproduce. In a scratch worktree of the current HEAD (`git worktree add ../c3-spin HEAD`, then `npm ci` and `npm run build` there), run `node -e "const R=require('react'),S=require('react-dom/server'),{LoadingSpinner,LoadingSpinnerVariant}=require('./dist/index.cjs');console.log(S.renderToStaticMarkup(R.createElement(LoadingSpinner,{variant:LoadingSpinnerVariant.spokes})))"` → output contains `animation:ds-spinner-rotate 1280ms linear infinite` (a JS-timed inline animation no stylesheet can reach). Also `rg -n "ds-spinner" src/styles/index.css` → no match inside any `prefers-reduced-motion` block.
  - [ ] 2. Tokens: in `src/styles/tokens.css` after :458 add (`:root` only — mode-invariant, R5.3):
    ```css
      /* Loading spinner motion (arch Rule 6). Flat: one cycle grows and shrinks
       * the arc once while its head turns twice. Spokes: one turn per duration,
       * scaled per size by a square-root law (values precomputed from 1280ms at rg). */
      --ui-spinner-flat-duration: 1800ms;
      --ui-spinner-flat-sweep-ease: cubic-bezier(0.37, 0, 0.63, 1);
      --ui-spinner-spokes-duration-sm: 1092ms;
      --ui-spinner-spokes-duration-rg: 1280ms;
      --ui-spinner-spokes-duration-md: 1544ms;
      --ui-spinner-spokes-duration-xl: 1726ms;
    ```
    Then run `npm run sync-tokens`. Expect no `@theme` change: these names match no mapping rule. If the generated block or theme.css changes, add the six names to `EXCLUDED` in `scripts/sync-theme.mjs` and re-run.
  - [ ] 3. CSS in `src/styles/index.css`: after :66 add `@property --ds-spinner-sweep { syntax: "<number>"; inherits: false; initial-value: 0; }` and `@property --ds-spinner-head { syntax: "<number>"; inherits: false; initial-value: 0; }`. Before the `@layer utilities` closing brace at :919 add:
    ```css
      /* LoadingSpinner — CSS owns the clock; the component samples
       * --ds-spinner-sweep / --ds-spinner-head and writes path geometry. */
      .ds-spinner-flat {
        animation:
          ds-spinner-sweep var(--ui-spinner-flat-duration) var(--ui-spinner-flat-sweep-ease) infinite,
          ds-spinner-head var(--ui-spinner-flat-duration) linear infinite;
      }
      .ds-spinner-spokes {
        transform-origin: center;
        animation: ds-spinner-rotate
          var(--ds-spinner-spokes-duration, var(--ui-spinner-spokes-duration-rg)) linear infinite;
      }
      @media (prefers-reduced-motion: reduce) {
        .ds-spinner-flat {
          animation: none;
          --ds-spinner-sweep: 0.5;
        }
        .ds-spinner-spokes {
          animation: none;
        }
      }
    ```
    After the `ds-spinner-rotate` keyframes (:943-947) add `@keyframes ds-spinner-sweep { 0%, 100% { --ds-spinner-sweep: 0; } 50% { --ds-spinner-sweep: 1; } }` and `@keyframes ds-spinner-head { from { --ds-spinner-head: 0; } to { --ds-spinner-head: 2; } }`. Replace the :935-942 comment with: `Loading spinner keyframes — outside @layer so they stay globally reachable. ds-spinner-rotate turns the spokes variant; ds-spinner-sweep / ds-spinner-head are the flat variant's clock (sampled by LoadingSpinner, never read as a transform).`
  - [ ] 4. `spinnerGeometry.ts`: delete `SPINNER_ANIM_DURATION` and its JSDoc (:48-52; WI-C2-15 may already have reworded :50 — delete whatever text is there) and `SPINNER_SPOKES_DURATION` (:60-71). Replace the `spokesDuration: number` field (:103-111) with `spokesDurationVar: string` documented as "`var(--ui-spinner-spokes-duration-*)` for this size; set inline as `--ds-spinner-spokes-duration`". Add `export const SPINNER_SPOKES_DURATION_VARS = { sm: "var(--ui-spinner-spokes-duration-sm)", rg: "var(--ui-spinner-spokes-duration-rg)", md: "var(--ui-spinner-spokes-duration-md)", xl: "var(--ui-spinner-spokes-duration-xl)" } as const;` beside `SPINNER_SIZE_VARS`. In `getSpinnerGeometry` delete the :127-132 computation and return `spokesDurationVar: SPINNER_SPOKES_DURATION_VARS[size]` in place of `spokesDuration` (:144). (spinnerGeometry.ts is not re-exported from src/index.ts, so this is not public API.)
  - [ ] 5. `LoadingSpinner.tsx` FlatSpinner: drop `SPINNER_ANIM_DURATION` from the import (:18). Add `const clockRef = useRef<SVGGElement>(null);`. Wrap the two `<path>` elements (:197-211) in `<g ref={clockRef} className="ds-spinner-flat">…</g>`. Replace the effect body (:128-181) with a sampler: `draw()` reads `getComputedStyle(g).getPropertyValue("--ds-spinner-sweep")` and `"--ds-spinner-head"` (each `parseFloat(…) || 0`), computes `sweepAngle = (SPINNER_MIN_SWEEP + (SPINNER_MAX_SWEEP − SPINNER_MIN_SWEEP) × sweep) × 2π` and `arcEndAngle = SPINNER_START_ANGLE + head × 2π`, and writes both `d` attributes exactly as :151-174 do now. `tick()` calls `draw()` and requests the next frame only while `getComputedStyle(g).animationName !== "none"`. So under reduced motion (or a consumer's `animation: none`) it draws one static frame and stops. Keep `return () => cancelAnimationFrame(frameId)` and the `[cx, cy, trackRadius, gapLength]` deps. Rewrite the JSDoc "Animation model" (:104-110) to: the clock is CSS (`.ds-spinner-flat`, `--ui-spinner-flat-*`); the component samples it and owns only geometry.
  - [ ] 6. SpokesSpinner: take `spokesDurationVar` from `geo` (:236). Set `className={cn("ds-spinner-spokes", className)}` and replace the inline style's `animation` and `transformOrigin` entries (:260-261) with `"--ds-spinner-spokes-duration": spokesDurationVar`, keeping `width`, `height`, `stroke`, `strokeWidth` and `...style` last. Update the JSDoc at :218-226 to say the spin is timed by `--ui-spinner-spokes-duration-*`.
  - [ ] 7. Docs in the same change (code and contract ship together). li SKILL.md:134-176: replace the "Animation model" code block and the "rAF loop is infinite" cleanup note with the sampler model from step 5, the token names, and "reduced motion: CSS sets `animation: none`; the loop draws once and stops". li:238 becomes "Do not time the flat spinner in JS: its clock is `.ds-spinner-flat` (`--ds-spinner-sweep`/`--ds-spinner-head`); the component only samples it." li:220 lists `ds-spinner-sweep`/`ds-spinner-head` beside `ds-spinner-rotate`. Then re-copy to `.claude/skills/dooph-ds-loading-indicators/SKILL.md` (WI-C3-01 step 1). arch:342: append "An indeterminate loader whose clock is an `infinite` CSS animation samples every frame while that animation runs and stops once the computed `animation-name` is `none`; it still holds no duration, easing or reduced-motion branch." Add `--ui-spinner-*` to the arch:317-321 families list and the codebase:459-463 list (both as left by WI-C3-07). Codebase:557: ``and `ds-spinner-rotate` backs the spokes `LoadingSpinner` `` → ``and `ds-spinner-rotate` (spokes) plus `ds-spinner-sweep`/`ds-spinner-head` (the flat clock) back `LoadingSpinner` ``. Codebase:570-571: ``is how the SVG spinner drives its own.`` → ``which is how inline-style animations elsewhere reach them.``
  - [ ] 8. Verify: `npm run lint` → exit 0. `rg -n "SPINNER_ANIM_DURATION|SPINNER_SPOKES_DURATION\b|performance\.now|Math\.cos\(phase" src` → no matches. In the scratch worktree with these changes applied, `npm run build` → `git status --porcelain` shows only the files listed above (no generated drift beyond `index.css`/`theme.css` if step 2 needed EXCLUDED). Re-running step 1's render prints no `animation:` and contains `class="ds-spinner-spokes"` and `--ds-spinner-spokes-duration:var(--ui-spinner-spokes-duration-rg)`. The flat render contains `<g class="ds-spinner-flat">`. `rg -n "@property --ds-spinner-sweep" dist/styles.css` → 1. In Storybook (pane visible; a hidden pane freezes rAF), on Progress/LoadingSpinner run `getComputedStyle(document.querySelector('.ds-spinner-flat')).animationName` → `ds-spinner-sweep, ds-spinner-head`, and the arc grows/shrinks while turning as before. With DevTools "Emulate CSS prefers-reduced-motion: reduce" and a reload, the same call → `none`, the flat arc is static at about 40% and the spokes do not turn. Set `--ui-spinner-flat-duration: 3600ms` on `:root` in DevTools → the arc visibly halves its speed.
  - [ ] 9. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: no duration, easing or reduced-motion logic remains in `src/components/LoadingSpinner/*.ts(x)`; `.ds-spinner-flat`/`.ds-spinner-spokes` exist with a reduced-motion block; six `--ui-spinner-*` tokens exist; li, arch and codebase skills describe the CSS clock; the two li copies are byte-identical.
- log:
  - 2026-10-01 — created by audit

### WI-C3-05: Correct the loading-indicators skill's sizing rule, trigger description, family sentence and keyframe note, then re-sync its `.claude` copy
- status: todo
- addresses: [F-051, F-100]
- depends_on: [WI-C3-01]
- phase: P1
- risk: low — documentation only; a description that over-triggers would load the skill on unrelated tasks (it names six concrete components)
- semver: none
- files:
  - modify: `.agents/skills/dooph-ds-loading-indicators/SKILL.md:3,8,51-53,220 @ b436647`
  - modify: `.claude/skills/dooph-ds-loading-indicators/SKILL.md` (re-copied from the canonical)
- anchor:
  ```markdown
  description: Use when building, modifying, or debugging WavyDivider, LoadingSpinner, or ProgressIndicator. Covers spinner animation, Material-style rounded-wave geometry, shared sizing, and key constraints that prevent common mistakes.
  Four components form the M3E-inspired indicator family. `LoadingSpinner` and `ShapeMorphSpinner` are indeterminate (no `progress` prop), while `ProgressIndicator` is determinate and exclusively owns the circular rounded-wave geometry.
  Values live in both `tokens.css` (`--ui-size-spinner-*`) and `spinnerGeometry.ts` (`SPINNER_DIAMETERS`, `SPINNER_STROKE_WIDTHS`). **Keep them in sync.**

  **CRITICAL:** The CSS tokens are a consumer-facing contract, but the components render `<svg width={diameter}>` from the JS constants. **Changing tokens.css alone has no effect on rendered size.** You must update `SPINNER_DIAMETERS` (and `SPINNER_STROKE_WIDTHS`) in `spinnerGeometry.ts` to match.
  `ds-spinner-rotate` in `src/styles/index.css` is the **only** loading-indicator keyframe. It is used by the spokes spinner. `ds-spinner-arc` was removed when `FlatSpinner` was converted to rAF. Do not re-add it.
  ```
- why: li:53 states, as a CRITICAL rule, that the size tokens are inert and that sizes are changed in `SPINNER_DIAMETERS`, which is false and is the anti-pattern contrib:137 names (F-051; C-LI-15). The description triggers on three of the six components the body covers, and li:8/li:220 no longer describe the family (F-100; C-LI-1, C-LI-2, C-LI-40).
- steps:
  - [ ] 1. li:3 → `description: Use when building, modifying, or debugging LoadingSpinner, ProgressIndicator, WavyDivider, ShapeMorphSpinner, MorphRotationShape or DropdownCaret. Covers spinner animation, Material-style rounded-wave geometry, shape-morph timing and the generated spring ease, shared sizing, and key constraints that prevent common mistakes.`
  - [ ] 2. li:8 → `` `LoadingSpinner` and `ShapeMorphSpinner` are indeterminate (no `progress` prop); `ProgressIndicator` is determinate and exclusively owns the circular rounded-wave geometry. `WavyDivider` shares that wave geometry but is not an indicator, and `LinearProgressIndicator` (a Radix Progress bar) is documented in the codebase skill, not here. `MorphRotationShape` and `DropdownCaret` are covered in the shape-morph section below. ``
  - [ ] 3. Replace li:51-53 (both paragraphs) with:
    ```markdown
    Two size spaces, deliberately separate (see the header of `spinnerGeometry.ts`):

    - **Rendered size** comes from the token. `getSpinnerGeometry(size).cssSize` is `var(--ui-size-spinner-*)`, applied as CSS `width`/`height`, so overriding a token in `tokens.css` (or a consumer's CSS) resizes the spinner and everything inside it.
    - **User units** (`SPINNER_DIAMETERS`, `SPINNER_STROKE_WIDTHS`) are the viewBox space the drawing is authored in. They also sit on the `<svg>` as numeric `width`/`height` attributes, which only give an intrinsic size before CSS lands. Change them to reshape the drawing (stroke-to-diameter ratio, gaps), never to resize it.

    The table's diameters match the token defaults so the spec above stays accurate. Keep that true when you change either side.
    ```
  - [ ] 4. li:220 → `` `ds-spinner-rotate` in `src/styles/index.css` is the spokes spinner's only keyframe. The shape-morph members animate on `ds-shape-morph-clock` / `ds-shape-morph-spin`, documented in the shape-morph section. `ds-spinner-arc` was removed when `FlatSpinner` was converted to rAF. Do not re-add it. ``
  - [ ] 5. Re-copy: `Copy-Item -Force .agents\skills\dooph-ds-loading-indicators\SKILL.md .claude\skills\dooph-ds-loading-indicators\SKILL.md` (if WI-C3-02 has landed, run `npm run sync-skills` instead).
  - [ ] 6. Verify: `rg -n "no effect on rendered size|Keep them in sync" .agents/skills/dooph-ds-loading-indicators/SKILL.md` → no matches; `rg -n "^description:.*MorphRotationShape.*DropdownCaret" .agents/skills/dooph-ds-loading-indicators/SKILL.md` → 1 match; `git diff --no-index --quiet .agents/skills/dooph-ds-loading-indicators/SKILL.md .claude/skills/dooph-ds-loading-indicators/SKILL.md` → exit 0. Cross-check the new sizing text against the render in F-051 (V4: flat `width="32" … style="width:var(--ui-size-spinner-md)…"`).
  - [ ] 7. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: li no longer says the tokens are inert; its description names all six components; li:8 and li:220 match the code; both copies are byte-identical.
- log:
  - 2026-10-01 — created by audit

### WI-C3-06: Fix the contribution skill's stale radius names, file tree, string-literal story template and title/hero sizes
- status: todo
- addresses: [F-100]
- depends_on: []
- phase: P1
- risk: low — documentation only; the edited lines do not overlap WI-C3-18's (contrib:56, :65, :100)
- semver: none
- files:
  - modify: `.agents/skills/dooph-ds-contribution/SKILL.md:17,29-34,78,151 @ b436647`
- anchor:
  ```markdown
  - Note: every state (rest, hover, active, focus, disabled), sizing (exact px from Figma), corner radius (map to `--ui-radius-tight/standard/soft`), color tokens, and typography class.
  src/components/MyComponent/
    MyComponent.tsx         ← implementation
    index.ts                ← re-exports everything public from MyComponent.tsx
    MyComponent.stories.tsx ← Storybook stories, one per variant/state
  export const Indeterminate: Story = { render: () => <Checkbox checked="indeterminate" /> };
  4. Title/hero text (Bricolage Grotesque) renders at 23px/36px
  ```
- why: The step-by-step guide maps radii onto a renamed token, its Step 3 tree omits the `constants.ts` that its own Step 4 checklist (contrib:70) requires, its Step 5 story template is a string-literal story (R1.1, R9.13), and its font check fails a correct 40px/55px render (F-100; C-CONTRIB-2, C-CONTRIB-7).
- steps:
  - [ ] 1. contrib:17: `` `--ui-radius-tight/standard/soft` `` → `` `--ui-radius-tight/mini/normal/soft`, or a component radius token if none fits ``.
  - [ ] 2. contrib:29-34: insert the line `  constants.ts            ← dot-accessible consts + derived types; NO "use client"` between the `MyComponent.tsx` and `index.ts` lines, and change the `index.ts` comment to `← re-exports the component, its *Props type and the consts`.
  - [ ] 3. contrib:78: `<Checkbox checked="indeterminate" />` → `<Checkbox checked={CheckboxChecked.indeterminate} />`, matching Checkbox.stories.tsx:42.
  - [ ] 4. contrib:151: `4. Title/hero text (Bricolage Grotesque) renders at 23px/36px` → ``4. Title/hero text (Bricolage Grotesque) renders at `--ui-text-title` / `--ui-text-hero` (40px / 55px at the defaults in tokens.css)``.
  - [ ] 5. Verify: `rg -n "radius-tight/standard|checked=\"indeterminate\"|23px/36px" .agents/skills/dooph-ds-contribution/SKILL.md` → no matches; `rg -n "constants.ts" .agents/skills/dooph-ds-contribution/SKILL.md` → includes a line inside the Step 3 fence (lines 29-35). Through the `.claude` symlink the edit is live for Claude in this checkout (WI-C3-02 covers other checkouts).
  - [ ] 6. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: the four rg patterns above return nothing and the Step 3 tree lists `constants.ts`.
- log:
  - 2026-10-01 — created by audit

### WI-C3-07: Correct the codebase skill line by line against the claims register's 43 FALSE/STALE CB rows, add the five missing folders, and fix the matching architecture-skill lines
- status: todo
- addresses: [F-099]
- depends_on: [WI-C3-01, WI-C2-14]
- phase: P1
- risk: low — documentation plus one JSDoc count. The main risk is editing a line another WI owns, so every owned row is listed as "no edit" below, and lines carrying a "5.4" token keep that substring byte-identical for WI-C2-07. WI-C4-03, WI-C4-04 and WI-C4-05 later append families to the two motion-family lists this WI rewrites (codebase:459-463, arch:317-321): land this P1 WI first so they append to the corrected list.
- semver: none
- files:
  - modify: `.agents/skills/dooph-ds-codebase/SKILL.md:34,38-86,79,110,112,152,202,206-223,237,283-285,315,442,459-463,500,531,547,549,588-592 @ b436647`
  - modify: `.agents/skills/dooph-ds-architecture/SKILL.md:52,318-321 @ b436647`
  - modify: `src/components/Sheet/Sheet.tsx:54-56 @ b436647` (JSDoc carrying the same false sentence as codebase:237)
  - modify: `src/components/Text/constants.ts:66 @ b436647`
- anchor:
  ```text
  codebase:79   Text/                       ← BaseText + 8 roles, constants.ts (Fonts/FontSizes/
  codebase:547  `text-style-button`, `text-style-body`, `text-style-label`, `text-style-title`, `text-style-heading`, `text-style-subheading`, `text-style-hero`, `text-style-mono` — one per `TextVariant` (eight), …
  codebase:588  npm run build
  codebase:589    → generate-icon-exports  (regenerate Icons/index.ts)
  codebase:590    → sync-tokens            (regenerate @theme inline block in index.css AND theme.css)
  codebase:591    → tsup (build:js)        (ESM + CJS + .d.ts; clean:true wipes dist first)
  codebase:592         └ onSuccess         → tailwindcss CLI → dist/styles.css, then copy src/styles/theme.css → dist/theme.css
  arch:318-321  duration and an ease. Existing families: `--ui-roll-hover-*`, / `--ui-roll-change-*`, `--ui-fade-change-*`, / `--ui-underline-link-*`, `--ui-rolling-digits-*`, `--ui-sidebar-icon-*`, / `--ui-shape-morph-*`.
  ```
- why: The codebase skill exists to answer "does this exist / where does it live / how does the build emit it". For the five newest folders it answers no, and 43 of its claims are false or stale (F-099; claims register §1 CB). Each wrong line sends the next agent to the wrong place or invites a wrong edit (re-hardcoding 45%, missing two text roles, not knowing the use-client stamp exists).
- steps:
  - [ ] 1. Apply this disposition table, one row per FALSE/STALE CB claim. "edit" rows are done here. Every other row names the WI or finding that owns the line, which stays untouched.
    | C-ID | codebase line @ b436647 | action |
    |---|---|---|
    | C-CB-10 | 29-32 | no edit: WI-C2-14 (:30) |
    | C-CB-11 | 34 | edit: append "; also `ds-*` motion/component rules (ds-shimmer-text, ds-roll-*, ds-shape-morph, ds-reveal-change, ds-rolling-digits-*, ds-sidebar-rail, ds-chat-*), the `@keyframes` (outside any layer), the `@property` registrations and the `selected:`/`unselected:` `@custom-variant`s" |
    | C-CB-15 | 38-86 | edit: step 2 |
    | C-CB-22 | 79 | edit: "BaseText + 8 roles" → "BaseText + 10 roles" |
    | C-CB-29, C-CB-30, C-CB-232, C-CB-234 | 96-107, 653-662 | no edit: WI-C3-01 |
    | C-CB-32 | 109-112 | edit: step 3 (:110 and three new lines after :112; :111 belongs to WI-C1-03 and :112's text to WI-C1-10) |
    | C-CB-36, C-CB-37, C-CB-86, C-CB-88 | 127, 128, 220, 222 (asChild ✅) | no edit: these become true when WI-C5-02 makes asChild work |
    | C-CB-39 | 129 | no edit: WI-C5-02 |
    | C-CB-44, C-CB-47, C-CB-178 | 138, 140, 498 ("5.4" labels) | no edit: WI-C2-07 (F-013) |
    | C-CB-46 | 140 ("lifted verbatim … Shapes/svgs/") | no edit: F-108's WI |
    | C-CB-54 | 152 | edit: last cell `` `CheckboxChecked` `` → `` `CheckboxVariant` (`prominent`\|`primary`) + `CheckboxChecked` `` |
    | C-CB-71 | 202 | edit: "(`Toggle/toggleOption.ts`, internal, not re-exported)" → "(`Toggle/toggleOption.ts`; not exported under its own name, but public as the `tabTriggerVariants` alias)". If D-15's outcome removes that alias, its WI rewrites this row again. |
    | C-CB-74 | 206-223 | edit: step 4 |
    | C-CB-102 | 237 | edit: "(explicit value required — unsuffixed `slide-*` resolves to 0.25rem in Tailwind v4)" → "(explicit value required — unsuffixed `slide-*` translates the full 100%)". Make the same correction in Sheet.tsx:55-56: "resolves to the 0.25rem translate DEFAULT, not the plugin's 100%" → "translates the plugin's full 100%, not the 20% settle tail" |
    | C-CB-117 | 283-285 | edit: "Geometry uses literal `calc()` class strings … dots, both fills and the handle share one percent formula." → "Fill geometry uses literal `calc()` class strings keyed to `--ui-slider-track-gap` / `--ui-width-slider-handle` / `--ui-height-slider-handle`; the step dots get an inline `left` from `thumbAlignedLeft()` (Slider.tsx:99); Radix positions the handle. The thumb-aligned percent formula is written three times (`thumbAlignedLeft` and the two fill class strings) — change all three together." |
    | C-CB-126 | 307 | no edit: WI-C2-14 |
    | C-CB-147 | 398 | no edit: WI-C2-14 |
    | C-CB-157 | 433-435 | no edit: WI-C2-14 |
    | C-CB-159 | 442 | edit: "outer dashed ring + inner surface card" → "outer solid 1px ring + inner surface card" |
    | C-CB-162 | 451 | no edit: becomes true when F-017's WI removes Slider.tsx's raw `var(--ui-*)` arbitrary values |
    | C-CB-165 | 456 | no edit: WI-C2-14 |
    | C-CB-169 | 459-460 | edit: "Every animated component owns a `--ui-<component>-*` family and the component reads them only through CSS — see the architecture skill's Rule 6." → "Rule 6 (architecture skill) requires every animated component to own a `--ui-<component>-*` family read only through CSS. Not every component does yet, so check `tokens.css` before assuming one exists." |
    | C-CB-170 | 461-463 | edit: "Current families: …" → "Current families (regenerate with `rg -o -- '--ui-[a-z-]+-(duration\|ease)' src/styles/tokens.css \| sort -u`): `--ui-roll-hover-*`, `--ui-roll-change-*`, `--ui-fade-change-*`, `--ui-underline-link-*`, `--ui-rolling-digits-*`, `--ui-sidebar-icon-*`, `--ui-shape-morph-*`, `--ui-reveal-change-*`, `--ui-chat-reveal-*`, `--ui-chat-stream-*`, `--ui-chat-disclosure-*`." |
    | C-CB-181 | 500 | edit: "Distinct from the IDENTITY pair `--ui-prominent-color`/`--ui-prominent-color-alt` (was `--ui-brand-color*`), where the alt *does* differ per mode;" → "Distinct from the IDENTITY trio `--ui-prominent-color`/`-alt`/`-ter` (was `--ui-brand-color*`), all three mode-invariant (tokens.css:148-151);" |
    | C-CB-190 | 531 | edit only the helper list: "`ds-focus-ring-on-focus`, `ds-focus-ring-danger-on-focus`, `ds-focus-ring`" → "`ds-focus-ring-on-focus`, `ds-focus-ring-danger-on-focus`, `ds-focus-within-ring-danger`, `ds-focus-ring-on-open`, `ds-focus-ring` (unused)". Drop "`ds-focus-ring` (unused)" if F-076's WI has deleted the class (`rg -n "\.ds-focus-ring \{" src/styles` → none). Keep the "(… `-error-` before 5.4 …)" parenthetical byte-identical for WI-C2-07. WI-C4-09 edits :530, not :531. |
    | C-CB-198, C-CB-200 | 542 | no edit: WI-C2-14 |
    | C-CB-203 | 547 | edit: list ten classes (add `text-style-hero-body`, `text-style-hero-button`) and "(eight)" → "(ten)" |
    | C-CB-206 | 549 | edit: "Adding a role means four edits in step: …" → "Adding a role means these edits in step: the `TextVariant` key, a `TEXT_VARIANT_CLASS` entry, the `.text-style-*` rule here, a `ROLE_AXIS_TOKEN` entry if the face has axes, its `--ui-text-*` (and weight/tracking) tokens, a `FontSizes` key, a `createRoleText` export plus `*Props` type in `BaseText.tsx`, and the `Text/index.ts` barrel entries." |
    | C-CB-216 | 588-592 | edit: step 5 |
    | C-CB-223 | 616-619 (Props-from-index.ts bullet; list split by the H3) | no edit: WI-C1-08 adds the three index.ts files (the bullet becomes true); WI-C2-14 restores the list structure |
    | C-CB-224, C-CB-225, C-CB-228 | 623-624, 627-629, 635-636 | no edit: WI-C1-05 (D-05) and WI-C1-01 (F-011) rewrite the use-client paragraph |
    | C-CB-230 | 640-641 | no edit: F-065's WI |
  - [ ] 2. Tree (38-86): insert, in alphabetical position, `AIChat/ ← AI chat parts (AIPromptInput, AITextPart, AIThinkingPart, AIToolPart, AITurnSummary, AIContextGauge, AIModelSelect parts, ChatDivider, UserMessageHeader); constants.ts: AIToolPartVariant/AIToolPartState/AIThinkingPartState; each file carries a header contract`, `DropdownCaret/ ← shape-morph chevron for trigger hosts (.ds-dropdown-caret-host); DropdownCaretVariant`, `MorphRotationShape/ ← shape morph + rotation; engine/ is a faithful port (fixes go in engine/svgPath.ts); MorphRotationShapeMode; timing.ts types`, `ShapeMorphSpinner/ ← indeterminate loader = MorphRotationShape autoplay; SHAPE_MORPH_SPINNER_SHAPES`, `Sticker/ ← non-interactive chip; StickerVariant × StickerSize`. After the "Links" table (it ends at :314; insert at :315), add a section `### AI chat, Sticker, shape morph` with one line per folder pointing to its header contract and, for the shape-morph trio, to the `dooph-ds-loading-indicators` skill.
  - [ ] 3. Scripts (109-112): change the :110 comment `← regenerates Icons/index.ts from svg components` → `← regenerates Icons/index.ts from the *Icon.tsx files`. After :112 add `add-use-client.mjs ← stamps "use client" onto dist chunks from source directives (tsup onSuccess)`, `generate-shape-morph-ease.mjs ← writes the generated --ui-shape-morph-ease value in tokens.css`, `shapeMorphSpring.mjs ← the spring the ease is sampled from (retune here)`.
  - [ ] 4. Menu table (206-223): replace the header row with `| Component | File | Radix | Notes |` and the separator with four cells. Add rows `| \`DropdownMenuSearch\` | \`Menu/DropdownMenuSearch.tsx\` | – | search row; \`shortcut\`/\`showShortcut\` |` and `| \`DropdownCaret\` | \`DropdownCaret/DropdownCaret.tsx\` | – | \`DropdownCaretVariant\`; reads the nearest \`.ds-dropdown-caret-host\` |`. In the `DropdownMenuItem` row add "`variant`: `DropdownMenuItemVariant` (`default`\|`danger`)". In the `DropdownMenuContent` row add "`matchTriggerWidth` (default true), `dismissOnFocusLoss` (default false), `portal`/`portalProps`".
  - [ ] 5. Build block (588-592) →
    ```text
    npm run build
      → generate-icon-exports      (regenerate Icons/index.ts)
      → generate-shape-morph-ease  (regenerate --ui-shape-morph-ease in tokens.css from shapeMorphSpring.mjs)
      → sync-tokens                (regenerate @theme inline block in index.css AND theme.css)
      → tsup (build:js)            (ESM + CJS + .d.ts; clean:true wipes dist first)
           └ onSuccess             → add-use-client.mjs (stamp "use client" chunks), then the CSS emit (dist/styles.css + dist/theme.css)
    ```
    (:594 and :599 belong to WI-C1-10.)
  - [ ] 6. Architecture skill: arch:318-321 → "Existing families: list them with `rg -o -- '--ui-[a-z-]+-(duration|ease)' src/styles/tokens.css | sort -u` (today: roll-hover, roll-change, fade-change, underline-link, rolling-digits, sidebar-icon, shape-morph, reveal-change, chat-reveal, chat-stream, chat-disclosure)" (C-ARCH-35). In the arch:36-55 naming table add a row `| \`CheckboxVariant\` | \`variant\` | \`<Checkbox variant={CheckboxVariant.primary} />\` |` after the `CheckboxChecked` row (:52).
  - [ ] 7. `src/components/Text/constants.ts:66`: `/** Letter-spacing tokens. Only these three roles ship a tracking token. */` → `/** Letter-spacing tokens. Only these four roles ship a tracking token. */`.
  - [ ] 8. Verify: `npm run lint` → exit 0. `rg -n "8 roles|\(eight\)|outer dashed|0\.25rem|internal, not re-exported|IDENTITY pair" .agents/skills/dooph-ds-codebase/SKILL.md src/components/Sheet/Sheet.tsx` → no matches. `for f in AIChat DropdownCaret MorphRotationShape ShapeMorphSpinner Sticker; do rg -c "$f/" .agents/skills/dooph-ds-codebase/SKILL.md; done` → each ≥ 1. `rg -n "generate-shape-morph-ease|add-use-client" .agents/skills/dooph-ds-codebase/SKILL.md` → ≥ 2 lines. The menu table renders with four columns in a Markdown preview. `git diff -U0 .agents/skills/dooph-ds-codebase/SKILL.md | rg "^[-+].*5\.4"` → only the :531 line, as an identical-substring -/+ pair. `git diff -U0 .agents/skills/dooph-ds-codebase/SKILL.md | rg "ds-slider-fill|Rule 6\.$|ToastTypes"` → no hit (WI-C2-14's lines untouched).
  - [ ] 9. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: every "edit" row's old text is gone (step 8 rg); the five folders appear in the tree and inventory; the build block names all five steps; owned rows are untouched.
- log:
  - 2026-10-01 — created by audit

### WI-C3-08: Name the input, navigation and menu consts and the menu content props in the shipped usage skill
- status: todo
- addresses: [F-099]
- depends_on: [WI-C2-04, WI-C2-08]
- phase: P3
- risk: low — shipped documentation; a wrong key name would teach a compile error (every key below was read from the constants files @ b436647)
- semver: patch
- files:
  - modify: `skills/dooph-design-system-usage/SKILL.md:120,130-141,142-143 @ b436647`
- anchor:
  ```markdown
  - **Inputs:** `Input`, `SearchBox`, `Checkbox`, `ToggleSwitch` (+ `ToggleSwitchItem`),
  - **Menus:** `DropdownMenu` (`selectType`: `DropdownMenuSelectType.single`
    `DropdownMenuSegment` (full-width divider/labeled break between sections).
  - **Triggers:** `DropdownTrigger`, optional `DropdownTriggerContent`, `TypeableDropdownTrigger`, `TextDropdownTrigger`.
  - **Navigation:** `Tabs` (+ `TabsList`, `TabsTrigger`, `TabsContent`),
    `SegmentedTabSelect` (+ `SegmentedTabItem`).
  ```
- why: The usage skill is the only document shipped to consumer agents. It names these components without their dot-accessible consts or required props, so consumers type string literals, which R1.1 bans, and they miss that an icon Input variant throws without `icon`. They also miss the shipped `DropdownMenuSearch`, the danger item tone and the content props, and hand-roll them (F-099, members U6-F24 and U5-F10).
- steps:
  - [ ] 1. Inputs line (:120): replace `` `Input`, `SearchBox`, `Checkbox`, `ToggleSwitch` (+ `ToggleSwitchItem`), `` with `` `Input` (`InputVariant`: `text` | `number` | `iconText` | `iconNumber`; the two icon variants REQUIRE `icon` — a compile error without it, and a runtime throw), `SearchBox`, `Checkbox` (`CheckboxVariant`: `prominent` | `primary`; `checked={CheckboxChecked.indeterminate}` for the mixed state), `ToggleSwitch` (+ `ToggleSwitchItem`; `ToggleVariant`: `primary` | `ghost` | `unselected`, `ToggleSize`: `default` | `sm` | `icon` | `iconSm`), ``. The line wraps; keep the continuation `SliderContinuous …` at :121 unchanged.
  - [ ] 2. Menus (:130-140): after `` `DropdownMenuItem`, `` add `` (`variant={DropdownMenuItemVariant.danger}` for a destructive item) ``. After the `DropdownMenuSegment` entry (:140), before the closing period, add `` (`DropdownMenuSegmentVariant`: `divider` | `labeled`), `DropdownMenuSearch` (a search row for the top of a menu; `shortcut` / `showShortcut`). `DropdownMenuContent` takes `matchTriggerWidth` (default true), `dismissOnFocusLoss` (default false) and `portal` / `portalProps` (default portalled) ``.
  - [ ] 3. Triggers (:141): `` `TextDropdownTrigger`. `` → `` `TextDropdownTrigger` (`TextDropdownSize`: `default` | `sm`). ``
  - [ ] 4. Navigation (:142-143): `` `Tabs` (+ `TabsList`, `TabsTrigger`, `TabsContent`), `` → `` `Tabs` (+ `TabsList`, `TabsTrigger`, `TabsContent`; `TabVariant`: `ghost` | `primary` | `unselected`, `TabSize`: `default` | `sm` | `micro` | `fill` | `icon` | `iconSm` | `iconMicro`), `` and `` `SegmentedTabSelect` (+ `SegmentedTabItem`). `` → `` `SegmentedTabSelect` (+ `SegmentedTabItem`; `SegmentedVariant`: `primary` | `ghost`, `SegmentedSize`: `container` | `containerIcon` | `standard` | `icon`). ``
  - [ ] 5. Verify: for each name in `InputVariant ToggleVariant ToggleSize CheckboxVariant CheckboxChecked TabVariant TabSize SegmentedVariant SegmentedSize TextDropdownSize DropdownMenuItemVariant DropdownMenuSegmentVariant DropdownMenuSearch matchTriggerWidth dismissOnFocusLoss portalProps`, `rg -c "<name>" skills/dooph-design-system-usage/SKILL.md` → ≥ 1. Type-check the keys: write a scratch `probe.tsx` beside a scratch worktree build with one expression per key (`InputVariant.iconNumber`, `TabSize.fill`, `SegmentedSize.containerIcon`, `DropdownMenuItemVariant.danger`, `DropdownMenuSegmentVariant.labeled`, …) imported from `@dooph-software/design-system` and run `npx tsc --noEmit probe.tsx` → 0 errors. Add a `CHANGELOG.md` `[Unreleased]` → `### Changed` line (CHANGELOG.md:20): "usage skill names the input, navigation and menu consts and the menu content props".
  - [ ] 6. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: step 5's rg counts are all ≥ 1 and the probe type-checks.
- log:
  - 2026-10-01 — created by audit

### WI-C3-09: Rewrite the stale comments in sync-theme.mjs, the three stylesheets, five Calendar modules, OutlineButton and OutlineSection to match the code
- status: todo
- addresses: [F-101]
- depends_on: [WI-C2-15]
- phase: P1
- risk: low — comments only; OutlineSection's JSDoc ships in dist .d.ts (text change only). `src/styles/dooph-component-tokens.css:115-116` (slider 45%) is covered by WI-C2-15 and not touched here. WI-C3-04, if it lands later, rewrites index.css:935-942 again. WI-C4-04 and WI-C4-07 later edit dooph-component-tokens.css:126-159 and WI-C4-12 edits sync-theme.mjs:145-148; land this P1 WI first and they re-anchor on its comment text.
- semver: none
- files:
  - modify: `scripts/sync-theme.mjs:5,8,13,18,59,61,145,157,163 @ b436647`
  - modify: `src/styles/index.css:16,939-941 @ b436647`
  - modify: `src/styles/dooph-component-tokens.css:12,126-127 @ b436647`
  - modify: `src/styles/tokens.css:205-207,531-535 @ b436647`
  - modify: `src/components/Calendar/rangeSelection.ts:18,42 @ b436647`
  - modify: `src/components/Calendar/CalendarCaption.tsx:45-50 @ b436647`
  - modify: `src/components/Calendar/Calendar.tsx:149 @ b436647`
  - modify: `src/components/Calendar/dateUtils.ts:9 @ b436647`
  - modify: `src/components/Calendar/CalendarGrid.tsx:57 @ b436647`
  - modify: `src/components/OutlineButton/OutlineButton.tsx:211-228 @ b436647`
  - modify: `src/components/OutlineSection/OutlineSection.tsx:8 @ b436647`
- anchor:
  ```text
  sync-theme.mjs:8          * Wired into:    npm run prebuild  (see package.json)
  index.css:939-941         * ds-spinner-rotate: continuous 360° spin for the wavy LoadingSpinner SVG
                            * container. The flat variant is now fully rAF-driven and does not use CSS
                            * animation; this keyframe is only referenced by WavySpinner.
  tokens.css:206-207         * component reads it back from computed style, so this token is the only
                            * place the cap lives. */
  dateUtils.ts:9            //   3. Never compare with `getTime()` — compare y/m/d, or compare day keys.
  OutlineButton.tsx:223     * Orb 2 tracks the diagonally opposite point (1−gx, 1−gy) so the two
  OutlineSection.tsx:8      * Outer ring: dashed/thin border. Inner card: bg-secondary surface with shadow.
  ```
- why: Each comment points the next editor at the wrong thing (F-101). The spinner note invites deleting a live keyframe. The cap note invites a `getComputedStyle` read. dateUtils' rule 3 would have a maintainer rewrite correct comparisons. "Task 9"/"Step 5" cite a deleted plan. The sync-theme header names a pipeline that does not exist, and the shipped OutlineSection JSDoc describes a dashed ring.
- steps:
  - [ ] 1. `scripts/sync-theme.mjs`:
    - :5 → ` * Generated output:       the @theme inline { } block inside index.css AND src/styles/theme.css`
    - :8 → ` * Wired into:    npm run sync-tokens (which npm run build runs first; see package.json)`
    - :13 → ` * 2. Map each name to a Tailwind theme token (toThemeEntry: prefix rules + ALIASES; EXCLUDED names and names no rule matches are skipped)`
    - :18 → ` * 1. Add --ui-color-foo (or --ui-shadow-foo etc.) to tokens.css :root (add a .dark override only when the value differs)`
    - :59 → `// ── Tokens excluded from @theme. Only an entry a prefix rule would otherwise map has an effect; the rest record raw-var()-only tokens. A token no rule matches is skipped whether it is listed or not. ───`
    - :61 `// Font variation axes and weights — used in @layer utilities .text-style-*` → `// Font variation axes and weights — used in @layer components .text-style-*`
    - :145 → `  // Menu widths — read by the ds-min-w-menu* helpers, not utilities`
    - :157 → `  // Opacity — read by ds-* helpers and index.css rules, not utilities`
    - :163 → `  // Focus ring colors — used inside shadow values and by the ds-focus-* outline helpers`
  - [ ] 2. `src/styles/index.css:16` → `/* Types LinearProgressIndicator's --progress-pct as a number. The fill/remainder motion is a width/left transition (.ds-progress-* in dooph-component-tokens.css), not a transition of this property. */`. index.css:939-941 → ` * ds-spinner-rotate: continuous 360° spin for the spokes LoadingSpinner (applied inline by` / ` * SpokesSpinner). The flat variant is rAF-driven and uses no CSS animation.`
  - [ ] 3. `src/styles/dooph-component-tokens.css:12` → `  /* Disabled / inactive (native :disabled + aria-disabled="true") */`. :126-127 → `  /* Linear progress — width/left transition whenever --progress-pct changes their computed value. */`
  - [ ] 4. `src/styles/tokens.css:205-207` → `  /* The prompt textarea grows with its content up to this, then scrolls. CSS` / `   * max-height applies the cap and the component only sets height = scrollHeight,` / `   * so this token is the only place the cap lives. */`. :531-535 → the radius legend with four rows: `tight — compact chrome: buttons, tabs, dense controls (kbd, etc.).`, `mini — micro (28px) toggle options / tabs.`, `normal — triggers, grouped inputs, dropdown rows, segmented shells.`, `soft — panels: modals, menu surfaces, search field shell, Outline inner.` (keep the `/* ── Radius … */` frame and the :537 Figma note).
  - [ ] 5. Calendar: rangeSelection.ts:18 `` `onChange` must fire `` → `` `onSelect` must fire ``; :42 → `/** Drives the band rounding in CalendarGrid. */`. CalendarCaption.tsx:45-50 → `// Guarded on the CURRENT view being in bounds. A controlled \`month\` is respected` / `// rather than clamped, so \`viewMonth\` can be out of bounds, and then BOTH` / `// neighbours are out of bounds too — an unguarded test would disable both arrows,` / `// including the one pointing back toward the bounds, stranding the user exactly` / `// where they most need to navigate.` Calendar.tsx:149 `warnOnBadValue` → `warnOnOutOfBoundsValue`. dateUtils.ts:9 → ``//   3. Never compare raw `getTime()` of un-normalised dates — compare after `startOfDay`, compare y/m/d, or compare day keys.`` CalendarGrid.tsx:57 `Seven narrow weekday names` → `Seven short weekday names`.
  - [ ] 6. OutlineButton.tsx:211-228: replace the block with
    ```tsx
            /*
             * Hover / cursor-tracking mode — "gutter rolling."
             *
             * Each orb is anchored at left:0, top:0 and translated so its CENTER sits
             * at a point derived from the cursor position (--gx/--gy, 0–1) inside the
             * button — the exact mapping is in the comment below. Near a wall half an
             * orb is clipped outside and the other half blooms in from the edge (the
             * "gutter" effect). overflow-hidden on the parent clips both orbs cleanly.
             */
    ```
  - [ ] 7. OutlineSection.tsx:8 → ` * Outer ring: solid 1px border. Inner card: bg-secondary surface with shadow.`
  - [ ] 8. Verify: `npm run lint` → exit 0. `rg -n "prebuild|TOKEN_MAP|@layer utilities \.text-style|WavySpinner|reads it back from computed style|standard — triggers|aria-invalid disabled|Task 9|Step 5 makes|warnOnBadValue for that case|Never compare with \`getTime|Seven narrow|diagonally opposite|dashed/thin" scripts src` → no matches. In a scratch worktree with the change applied, `npm run sync-tokens` → `git status --porcelain` lists only this WI's files (comment edits produce no generated drift). `npm run build` there → `rg -n "solid 1px border" dist/components/OutlineSection/OutlineSection.d.ts` → 1.
  - [ ] 9. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: step 8's rg returns nothing and sync-tokens produces no drift.
- log:
  - 2026-10-01 — created by audit

### WI-C3-10: Bring the Checkbox, CodeDigitInput, RollingDigitsText and AIChat header contracts into the file-header format and current vocabulary
- status: todo
- addresses: [F-054, F-102]
- depends_on: []
- phase: P1
- risk: low — header text only; no constraint is weakened (each one is kept, given its failure, or moved to `## behavior` because it is behaviour). No header shrinks below 5 lines, so F-011's 5-line stamp scan sees the same thing it does today.
- semver: none
- files:
  - modify: `src/components/Checkbox/Checkbox.tsx:2,6,54 @ b436647`
  - modify: `src/components/VerificationCode/CodeDigitInput.tsx:8-9 @ b436647`
  - modify: `src/components/AnimatedText/RollingDigitsText.tsx:19-40 @ b436647`
  - modify: `src/components/AIChat/AIThinkingPart.tsx:4-22 @ b436647`
  - modify: `src/components/AIChat/AIToolPart.tsx:18-19 @ b436647`
  - modify: `src/components/AIChat/AITurnSummary.tsx:4-13 @ b436647`
  - modify: `src/components/AIChat/ChatDivider.tsx:1-14 @ b436647`
  - modify: `src/components/AIChat/UserMessageHeader.tsx:1-13 @ b436647`
  - modify: `src/components/AIChat/AIModelSelect.tsx:1-19 @ b436647`
- anchor:
  ```tsx
  // Checkbox.tsx:2,6
   * Checkbox — Radix checkbox with brand/primary checked fills.
   * - Checked/indeterminate fill follows `CheckboxVariant` (brand | primary).
  // CodeDigitInput.tsx:8-9
   * - `hasError` paints error-primary border + text; `disabled` uses secondary
   *   disabled tokens + `ds-disabled-state`; focus uses brand focus ring.
  // RollingDigitsText.tsx:30,34-35
   * ## updating
   * - There is no timer, no requestAnimationFrame and no transitionend in this
   *   file, and adding one is almost always the wrong fix. Entry is a mount
  // AIModelSelect.tsx:14-15
   * - Provider colour is an open design value (`color`: DS token name or any CSS
   *   colour), written as a custom property the CSS reads — never a class.
  ```
- why: Agents read headers as authoritative (R11.2). Checkbox's header names a `brand` member that does not exist, and CodeDigitInput's names two retired spellings (F-054). RollingDigitsText keeps its three must-not-change rules under `## updating` with a hedge and history. Several AIChat constraints name no failure, are behaviour, or are consumer advice, and AIModelSelect has no `## behavior` slot (F-102).
- steps:
  - [ ] 1. Checkbox.tsx:2 → ` * Checkbox — Radix checkbox with prominent/primary checked fills.`; :6 → `` * - Checked/indeterminate fill follows `CheckboxVariant` (prominent | primary).``; :54 `// active border matches typeabletrigger hover, not brand` → `// active border matches the typeable trigger's hover border`. (Line 5 changes in WI-C3-11, together with the code it describes.)
  - [ ] 2. CodeDigitInput.tsx:8-9, substrings only (WI-C4-14 rewrites the `disabled` clause on the same lines and WI-C5-10 adds a line after :9; leave both untouched): `paints error-primary border` → `paints danger-primary border`, and `focus uses brand focus ring.` → `focus uses the prominent focus ring.`
  - [ ] 3. RollingDigitsText.tsx: delete `## updating` and its bullets (:30-40). Append to `## constraints` (after :28, before the blank `*` line):
    ```text
     * - No duration in this file: motion lives in CSS and the `--ui-rolling-digits-*`
     *   tokens. A JS copy of a CSS duration desyncs from it and the fade overruns
     *   the roll.
     * - No timer, requestAnimationFrame or transitionend here. Entry is a mount
     *   animation, which needs no scheduling; exit is a single `animationend`.
     * - The reconcile runs in the RENDER phase (React's "adjusting state when props
     *   change"). Moving it into an effect adds a frame of lag between the value
     *   and the wheels.
    ```
    Keep the closing ` */` and the `"use client";` line after it.
  - [ ] 4. AIThinkingPart.tsx: move the constraint bullet at :21-22 (`- Transcript colour is inherited by \`ds-chat-prose\`: …`) unchanged to the end of `## behavior` (after :13).
  - [ ] 5. AIToolPart.tsx:18-19 → `` * - `state` is AIToolPartState, never an AI SDK state string: taking the SDK's`` / `` *   strings would tie the package to one SDK's vocabulary and version. Mapping one`` / `` *   onto the other is the consumer's one line of glue.``
  - [ ] 6. AITurnSummary.tsx: move :12-13 (`- Render it only once a turn has settled — …`) to the end of `## behavior`, reworded ` * - Meant for a settled turn; when to render it is the consumer's call, since` / ` *   only they know when their stream has finished.`
  - [ ] 7. ChatDivider.tsx:1-14 → prose form (R11.5; it has no invariant a reasonable edit would violate beyond the layout):
    ```text
    /*
     * ChatDivider — a centred label between wavy rules (Figma 761:2496 Model Switch
     * Divider, 761:1453 Chat Date Divider). One component serves both Figma
     * dividers; they share every value but the text, and `children` is the label.
     * The rules take the leftover width so the label stays centred at any width
     * (Figma pins them at 120px only because its frame is a fixed 418px). When to
     * draw one — a day boundary, a model change — is the consumer's decision.
     */
    ```
  - [ ] 8. UserMessageHeader.tsx:1-13 → prose form keeping the constraint and its reason:
    ```text
    /*
     * UserMessageHeader — the user's prompt, heading its turn (Figma 854:1337): a
     * surface card that `children` flows straight into. It is NOT sticky: pinning a
     * turn's header and having the next turn push it away depends on how the
     * consumer structures turns inside their own scroll container, which the
     * package neither designs nor owns. Consumers wrap it
     * (`<div className="sticky top-0">`); clamping long prompts (`line-clamp-*`) is
     * likewise a `className` decision.
     */
    ```
  - [ ] 9. AIModelSelect.tsx:1-19: after the title paragraph (:1-4) insert ` * ## behavior` and put the four-row parts table (:6-9) under it. Change :14-15 to `` * - Provider colour is an open design value (`color`: DS token name or any CSS`` / `` *   colour), written as a custom property the CSS reads — never a class: a class`` / `` *   cannot carry an arbitrary consumer colour.`` (WI-C3-19 brings the tooltip title, the one sink that writes inline `color`, into line.)
  - [ ] 10. Verify: `npm run lint` → exit 0. `rg -n "brand|error-primary" src/components/Checkbox/Checkbox.tsx src/components/VerificationCode/CodeDigitInput.tsx` → no matches. `rg -n "## updating|almost always|hasCents|an earlier version" src/components/AnimatedText/RollingDigitsText.tsx` → no matches. `rg -c "## behavior" src/components/AIChat/AIModelSelect.tsx` → 1. `rg -n "## constraints" src/components/AIChat/ChatDivider.tsx src/components/AIChat/UserMessageHeader.tsx` → no matches. Header length check: `awk 'NR<=60 && /^ \*\//{print FILENAME": "NR; nextfile}' src/components/AnimatedText/RollingDigitsText.tsx` → ≤ 42. `git diff --stat` touches only the nine files.
  - [ ] 11. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: step 10's assertions hold.
- log:
  - 2026-10-01 — created by audit

### WI-C3-11: Gate Checkbox's pressed background to the unchecked state, and make the header and inline comment say so
- status: todo
- addresses: [F-102]
- depends_on: [WI-C3-10]
- phase: P3
- risk: low — changes the pressed look of a checked/indeterminate box (it keeps its fill instead of flashing to `secondary-hover`); unchecked press is unchanged
- semver: patch
- files:
  - modify: `src/components/Checkbox/Checkbox.tsx:5,39-40 @ b436647`
- anchor:
  ```tsx
   * - Unchecked hover/active use secondary surface tokens.
      // active bg stays at hover color intentionally — never while disabled
      "[&:not([data-disabled])]:active:bg-secondary-hover",
  ```
- why: Hover is gated to `data-[state=unchecked]` but the press is not. Pressing a checked box paints `bg-secondary-hover` (specificity 0,3,0) over the checked fill (0,2,0), so the on-fill check loses contrast for the length of the press. The header covers only the unchecked case, and the inline comment calls the behaviour intentional (F-102, U6-F15; V6 confirmed the cascade).
- steps:
  - [ ] 1. Reproduce: in Storybook `Inputs/Checkbox` → `Checked`, select the checkbox `<button>` in DevTools, use "Force state → :active", and run `getComputedStyle($0).backgroundColor`. It equals the `--ui-color-secondary-hover` value, not the prominent fill (compare `getComputedStyle(document.documentElement).getPropertyValue('--ui-color-prominent')`).
  - [ ] 2. Checkbox.tsx:39-40 →
    ```tsx
        // press darkens only an unchecked box, like hover — never while disabled.
        // A checked box keeps its fill so the on-fill check stays legible.
        "data-[state=unchecked]:[&:not([data-disabled])]:active:bg-secondary-hover",
    ```
  - [ ] 3. Header Checkbox.tsx:5 → ` * - Unchecked hover/active use secondary surface tokens; a checked or` / ` *   indeterminate box keeps its fill while pressed.` (the header grows by one line and stays above `"use client"`).
  - [ ] 4. Verify: `npm run lint` → exit 0. Repeat step 1 on `Checked` and `Indeterminate` → the background equals the prominent fill; on `Unchecked` → still the secondary-hover colour. In a scratch-worktree build, `rg -c -F 'data-\[state\=unchecked\]\:\[\&\:not' dist/styles.css` → 1 (Tailwind's escaped selector for the new class exists).
  - [ ] 5. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: forced `:active` on a checked or indeterminate Checkbox leaves its fill unchanged; the header states it.
- log:
  - 2026-10-01 — created by audit

### WI-C3-12: Make the `StickerVariant` JSDoc state the dark danger content colour, and confirm the Sticker header's wash sentence once the dark wash is a color-mix again
- status: blocked(D-07)
- addresses: [F-054]
- depends_on: [WI-C4-01]
- phase: P1
- risk: low — JSDoc text only (it ships in dist .d.ts); written for D-07's recommended option (white dark content over the `:root` color-mix wash). If D-07 picks another look, step 1's sentence changes accordingly
- semver: none
- files:
  - modify: `src/components/Sticker/constants.ts:8-13 @ b436647`
  - verify only: `src/components/Sticker/Sticker.tsx:5-7 @ b436647`
- anchor:
  ```ts
   * A variant selects a pair of paints — the content colour and the wash behind
   * it. They are not the same hue for every variant: secondary washes the
   * secondary button's active border, and danger washes danger-secondary while
   * its content is danger-primary. The wash alpha is `--ui-sticker-bg-opacity`
   * (20%), except the light secondary wash, which uses
   * `--ui-sticker-bg-opacity-secondary`.
  ```
- why: The JSDoc tells consumers danger's content is danger-primary, which is true only in light mode (`.dark` sets `--ui-color-sticker-danger: #ffffff`, tokens.css:717). Once WI-C4-01 deletes the opaque `#ffffff` dark wash (tokens.css:718), the header's "the wash is a color-mix at the sticker opacity" is true again and needs no edit (F-054, U12-F2).
- steps:
  - [ ] 1. constants.ts:10-11: `` * secondary button's active border, and danger washes danger-secondary while`` / `` * its content is danger-primary. The wash alpha is `--ui-sticker-bg-opacity` `` → `` * secondary button's active border, and danger washes danger-secondary while`` / `` * its content is danger-primary (white in dark mode). The wash alpha is `--ui-sticker-bg-opacity` `` (re-wrap at ~80 columns; keep :12-13).
  - [ ] 2. Confirm the header holds after WI-C4-01: `rg -n "sticker-bg-danger" src/styles/tokens.css` → only the `:root` color-mix (≈ :626), no `.dark` line. Sticker.tsx:5-7 then needs no edit. If the `.dark` override is still present, stop: the D-07 outcome differs and this WI's text must be redrafted.
  - [ ] 3. Verify: `npm run lint` → exit 0; `rg -n "white in dark mode" src/components/Sticker/constants.ts` → 1. In Storybook (Sticker stories, `.dark` toggled), the danger sticker shows white content on a translucent red wash, matching the JSDoc.
  - [ ] 4. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: the JSDoc names the dark content colour and no `.dark` override of `--ui-color-sticker-bg-danger` remains.
- log:
  - 2026-10-01 — created by audit

### WI-C3-13: Record the class-resolution convention (cva for discrete class-selecting props; named exclusions and legacy list) in the architecture skill and point contrib:97-98 at it
- status: blocked(D-17)
- addresses: [F-066]
- depends_on: []
- phase: P1
- risk: low — rule text only; the nine legacy components are not converted here (they convert when next touched, per the rule), so nothing renders differently
- semver: none
- files:
  - modify: `.agents/skills/dooph-ds-architecture/SKILL.md:122-123 @ b436647` (insert a subsection between the Invariants list and the `---` at :124)
  - modify: `.agents/skills/dooph-ds-contribution/SKILL.md:97-98 @ b436647`
- anchor:
  ```markdown
  - Prop name is always `variant` (not `styleVariant`, not `type`, not `kind`). Size prop is always `size`. The only exceptions are …

  ---
  4. Tailwind utility changes → edit the `cva` variant maps or base class strings in the component file.
  5. Remove deprecated variants/sizes from both the `cva` map AND the exported const object.
  ```
- why: Seven components resolve variants with cva and nine hand-build the class with four idioms, while the contribution workflow assumes a cva map exists everywhere. Removing a const key then leaves dead `&&` branches or breaks a `satisfies` map, and each idiom teaches a different lesson to whoever copies it (F-066).
- steps:
  - [ ] 1. After arch:122 (keep the blank line at :123), insert:
    ```markdown

    ### Class resolution

    - A discrete prop (`variant`, `size`, or a sanctioned name above) that selects CLASSES resolves through a `cva` recipe whose keys are the const's values. Type the prop from the const (`ButtonVariant`), not from `VariantProps`, which admits `null`.
    - Not class selection, so no cva: a prop that picks geometry or a sub-component (LoadingSpinner, ProgressIndicator and WavyDivider geometry, DropdownMenuSegment, DropdownCaret, the Slider paint bundle via `VARIANT_PAINTS`, Input's structural `isNumber`/`hasIcon`).
    - Legacy, hand-built (convert when you next change the component's variants): Avatar (`&&`), Tooltip (`&&`), DropdownMenuItem (`&&`), TextDropdownTrigger (`&&`), AIToolPart (ternary), ShapeButton (`satisfies` maps), SegmentedTabSelect (`ITEM_SIZE` map), CTAButton (`SIZES` table + boolean). When a const key is removed from one of these, delete its branch or map entry in the same change.
    - Package classes (`h-button`, `size-*`, `ds-*`) are never prefixed with a Tailwind variant inside a recipe (toggleOption.ts header).
    ```
  - [ ] 2. contrib:97 → `4. Tailwind utility changes → edit the component's cva recipe (or, for the legacy components listed under architecture Rule 1 "Class resolution", its hand-built map) or base class strings in the component file.` contrib:98 → `5. Remove deprecated variants/sizes from both the class map (cva recipe or legacy map) AND the exported const object.`
  - [ ] 3. Verify: `rg -n "### Class resolution" .agents/skills/dooph-ds-architecture/SKILL.md` → 1; each legacy component named in step 1 still matches its idiom (`rg -n "size === AvatarSize|variant === TooltipTypes|satisfies Record<ShapeButtonVariant|const ITEM_SIZE|SIZES\[size\]" src/components` → ≥ 5 hits), so the list is true when written; `rg -n "cva\` map AND" .agents/skills/dooph-ds-contribution/SKILL.md` → no matches.
  - [ ] 4. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: the architecture skill has a "Class resolution" subsection naming the rule, the exclusions and the legacy set; contrib:97-98 no longer assume every component has a cva map.
- log:
  - 2026-10-01 — created by audit

### WI-C3-14: Record the invariant-form rule in AGENTS.md, promote four comment-borne invariants into header contracts, and put the header above the directive in the three files that invert it
- status: blocked(D-17)
- addresses: [F-103]
- depends_on: [WI-C1-01]
- phase: P2
- risk: medium — putting a header above `"use client"` moves the directive past line 5. Before WI-C1-01 that silently drops it from the dist chunk (F-011), hence the dependency. Header text that over-states a rule would bind future edits wrongly; each constraint below quotes the failure its current comment already records.
- semver: none
- files:
  - modify: `AGENTS.md:1-19 @ b436647` (append one bullet)
  - modify: `src/components/Table/Table.tsx:1-3 @ b436647`
  - modify: `src/components/DropdownTrigger/DropdownTrigger.tsx:1,82-97 @ b436647`
  - modify: `src/components/Slider/Slider.tsx:1,345-350 @ b436647`
  - modify: `src/components/Text/BaseText.tsx:1 @ b436647` (new header above the imports; the JSDoc at :40-52 stays for IntelliSense)
  - modify: `src/components/Menu/DropdownMenu.tsx:1-3 @ b436647`, `src/components/LinearProgressIndicator/LinearProgressIndicator.tsx:1-3 @ b436647`, `src/components/Toggle/Toggle.tsx:1-3 @ b436647` (move the directive below the header)
- anchor:
  ```tsx
  // Table.tsx:1-3
  // No "use client": no hooks, and onSort is a consumer-supplied passthrough.
  // Neutral module — it renders in either graph. It may import client components
  // (Button); that is normal composition, not a client boundary for this file.
  // Slider.tsx:345-350
              /* ds-radix-data-disabled, NOT `data-[disabled]:ds-disabled-state`.
               * That form was broken twice over: a Tailwind variant only composes
               * with a GENERATED utility, so pairing one with a package class
               * emits no rule at all — and `.ds-disabled-state` keys off
               * `:disabled`/`[aria-disabled]`, which a Radix Root <span> carrying
               * `data-disabled` never has. */
  // DropdownMenu.tsx:1-3 (likewise LinearProgressIndicator.tsx, Toggle.tsx)
  "use client";

  /*
  ```
- why: AGENTS.md's read-first and stop-and-raise rules attach only to the sectioned header. Four invariants that match fhc's triggers live in forms those rules do not cover: Table's deliberate missing directive, TypeableDropdownTrigger's pointer-down skip and focus pairing, Slider's twice-broken disabled selector, and BaseText's precedence order. A "simplify" edit can reverse any of them unchallenged (F-103).
- steps:
  - [ ] 1. Confirm WI-C1-01 has landed: `rg -n "slice\(0, 5\)" scripts/add-use-client.mjs` → no match. Otherwise stop.
  - [ ] 2. AGENTS.md: append under `## File contracts`: `- Invariants live in the header. A rule written elsewhere — a \`//\` note, JSDoc, an inline comment — carries none of the protection above; when you find one that a reasonable edit would violate, move it into the header (sectioned, or prose for a single invariant) and leave the explanation where it was.`
  - [ ] 3. Table.tsx:1-3 → prose header:
    ```tsx
    /*
     * Table — div-based data table (Table, TableHeader, TableRow, TableHeaderCell, …).
     * Deliberately has no "use client": it uses no hooks, and `onSort` is a
     * consumer-supplied passthrough, so the module renders in either graph.
     * Adding the directive would make every Table part a client reference for no
     * reason. Importing client components (Button) is composition, not a boundary.
     */
    ```
  - [ ] 4. DropdownTrigger.tsx: above `"use client";` (:1) insert
    ```tsx
    /*
     * DropdownTrigger — DropdownTrigger and TextDropdownTrigger (Slot-based menu
     * triggers) and TypeableDropdownTrigger (a search field used as a menu trigger).
     *
     * ## behavior
     * - TypeableDropdownTrigger's root is a div (Radix merges the trigger's button
     *   props onto it); `displayValue` shows the selection summary in the primary
     *   tone while the input is empty.
     * - Known limitation (multi): after a pointer toggle, focus sits on the item,
     *   so typing goes to Radix typeahead until the input is clicked again.
     *
     * ## constraints
     * - Radix toggles the menu on every trigger pointerdown; TypeableDropdownTrigger
     *   skips that when the target is the input. Without the skip, every click into
     *   the field closes the menu mid-typing.
     * - Pair it with `DropdownMenuContent focusOnOpen={false}`: content's
     *   onOpenAutoFocus otherwise moves focus off the input on open.
     * - Never refocus the input from content: that trips the non-modal
     *   focus-outside dismissal.
     */
    ```
    and shrink the mid-file block (:82-97) to `/* TypeableDropdownTrigger — see the file header for its pointer and focus constraints. */`. This drops the "Long-term fix: a combobox" TODO (R11.13); codebase:223 already records it.
  - [ ] 5. Slider.tsx: above `'use client';` (:1) insert a prose header: `/*` / ` * Slider — SliderContinuous / SliderStepped / SliderLabeled on Radix Slider.` / `` * Disabled styling on the Radix Root uses `ds-radix-data-disabled`, never `` / `` * `data-[disabled]:ds-disabled-state`: a Tailwind variant on a package class `` / `` * emits no rule, and `.ds-disabled-state` keys off `:disabled`/`[aria-disabled]`, `` / ` * which the Root <span> never has. That form shipped broken twice.` / ` */`. Then shrink :345-350 to `/* disabled: see the file header */`.
  - [ ] 6. BaseText.tsx: above the imports (:1) insert a prose header: `/*` / ` * BaseText — role text with typography props. Props are written as INLINE style` / ` * so they beat the consumer's className, which beats the role class (\`.text-style-*\`,` / ` * in \`@layer components\`); \`style\` outranks props. Never move a typography prop` / ` * to a class: the class-based version silently dropped two of its three props` / ` * on cascade order (and \`fontSize\` to tailwind-merge).` / ` */`. Keep the JSDoc at :40-52.
  - [ ] 7. DropdownMenu.tsx, LinearProgressIndicator.tsx, Toggle.tsx: move the `"use client";` / `'use client';` line from :1 to directly after the header's closing ` */`, deleting the blank line :2 (R11.9, fhc:158).
  - [ ] 8. Verify: `npm run lint` → exit 0. In a scratch worktree with this change on top of WI-C1-01, `npm ci && npm run build`, then `head -1 dist/components/{DropdownTrigger/DropdownTrigger,Slider/Slider,Menu/DropdownMenu,LinearProgressIndicator/LinearProgressIndicator,Toggle/Toggle}.js` → each `"use client";`, and `head -1 dist/components/Table/Table.js dist/components/Text/BaseText.js` → neither is a directive. Run WI-C1-01's `dist-stamp-check.mjs` → PASS. `rg -n "^// No \"use client\"|Long-term fix" src/components/Table/Table.tsx src/components/DropdownTrigger/DropdownTrigger.tsx` → no matches. `rg -l "## constraints" src/components/DropdownTrigger/DropdownTrigger.tsx` → 1.
  - [ ] 9. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: AGENTS.md states the invariant-form rule; the four invariants sit in headers; every header is the first thing in its file; dist stamping is unchanged for client modules and absent for Table and BaseText.
- log:
  - 2026-10-01 — created by audit

### WI-C3-15: Sweep the stories: a contradicting story for every uncovered override, no removed spellings, DS components instead of raw elements, and docs blurbs that match the code
- status: todo
- addresses: [F-105]
- depends_on: []
- phase: P1
- risk: low — only story files change, and stories never ship (tsup does not build them, and they are not in `files`). Three things can still go wrong. (a) Renaming the `Brand`/`Error` story exports changes their Storybook ids (`buttons-button--brand` → `--prominent`). Nothing in the repo links those ids: `rg -n "button--brand|shapebutton--brand|toast--brand|toast--error" --glob '!docs/audit/**'` → no output @ b436647. (b) Other WIs edit several of these files. Icons.stories.tsx: WI-C1-09 (:4), WI-C4-13 (`IconSizes` → `IconSize` at :2, :50, :169, :193-202) and WI-C4-22 (imports :2-18, `Colors` :189-205). MorphRotationShape.stories.tsx: WI-C1-02 (:29, plus a story after `RestingAngle`). HotkeyIndicator.stories.tsx: WI-C5-14 (the :2 import, plus a story after :19). DropdownMenu.stories.tsx: WI-C5-11 (:221, :224, :407, :436) and WI-C5-16 (above :427). Sheet.stories.tsx: WI-C2-15 (text at :158-159). Slider.stories.tsx:212 and LinearProgressIndicator's colour story: WI-C2-06. Every edit below is anchored by text as well as by line, and none touches those lines. (c) WI-C5-02 (F-003) owns the asChild stories for Button, OutlineButton, ShapeButton, DropdownTrigger and TextDropdownTrigger, so this WI does not add them.
- semver: none
- files:
  - modify: `src/components/Button/Button.stories.tsx:34 @ b436647`
  - modify: `src/components/ShapeButton/ShapeButton.stories.tsx:28 @ b436647`
  - modify: `src/components/Toast/Toast.stories.tsx:50,58 @ b436647` and append one story (file ends at :169)
  - modify: `src/components/Modal/Modal.stories.tsx:31-33,59-61,98-100,103,125-127 @ b436647`
  - modify: `src/components/Sheet/Sheet.stories.tsx:27-29,121-126,154-156 @ b436647` and append one story (file ends at :165)
  - modify: `src/components/Tooltip/Tooltip.stories.tsx` (append one story; file ends at :128)
  - modify: `src/components/Menu/DropdownMenu.stories.tsx` (append one story; file ends at :461)
  - modify: `src/components/DatePicker/DatePicker.stories.tsx` (append one story; file ends at :137)
  - modify: `src/components/ProgressIndicator/ProgressIndicator.stories.tsx:7,119-130 @ b436647` and append one story (file ends at :134)
  - modify: `src/components/WavyDivider/WavyDivider.stories.tsx` (insert one story after `Low`, :35-40)
  - modify: `src/components/ShapeMorphSpinner/ShapeMorphSpinner.stories.tsx` (append one story; file ends at :42)
  - modify: `src/components/LoadingSpinner/LoadingSpinner.stories.tsx:7,103,116 @ b436647`
  - modify: `src/components/HotkeyIndicator/HotkeyIndicator.stories.tsx:27,31,35 @ b436647` (+ one import line after :2)
  - modify: `src/components/AIChat/AIPromptInput.stories.tsx:12,65-84,149-158 @ b436647` and append two stories (file ends at :160)
  - modify: `src/components/AIChat/AIModelSelect.stories.tsx:211 @ b436647` (+ one import) and append one story (file ends at :224)
  - modify: `src/components/Table/Table.stories.tsx` (append one story; file ends at :293)
  - modify: `src/components/AnimatedText/AnimatedText.stories.tsx:212-213,253-254 @ b436647` and insert one story after `FadeChangeAutoCyclingStatus` (:367-390)
  - modify: `src/components/Text/BaseText.stories.tsx:161 @ b436647`
  - modify: `src/components/Tabs/Tabs.stories.tsx:50-61 @ b436647` and append one story (file ends at :137)
  - modify: `src/components/Toggle/Toggle.stories.tsx` (append one story; file ends at :115)
  - modify: `src/components/SegmentedTabSelect/SegmentedTabSelect.stories.tsx:4 @ b436647` and append one story
  - modify: `src/components/Icons/Icons.stories.tsx:17-18,51-59,105-120 @ b436647` and append one story
  - modify: `src/components/MorphRotationShape/MorphRotationShape.stories.tsx:4-10,73-103 @ b436647`
- anchor:
  ```tsx
  // Button.stories.tsx:34 (ShapeButton.stories.tsx:28 and Toast.stories.tsx:50 likewise)
  export const Brand: Story = {
  // Modal.stories.tsx:31-33 (three more pairs in Modal, three in Sheet)
          <ModalTitle className="sr-only">Modal</ModalTitle>
          <div className="flex flex-col gap-4 p-6">
            <p className="text-style-heading text-text">Modal title</p>
  // ProgressIndicator.stories.tsx:119-120
          <input
            type="range"
  // AnimatedText.stories.tsx:212
            "`direction` flips the barrel roll. `up` (default) rolls each glyph upward; `down` rolls it " +
  // Icons.stories.tsx:109-111
        <IconCell
          icon={(props) => <SidebarLeftIcon {...props} />}
          label="LeftSidebar Open"
  ```
- why: R9.23 exists so that a dead or broken override shows up in Storybook. Where no story contradicted a default, shipped defects went unseen; `ToastProvider`'s ignored `duration` (F-005) is one. The stories also serve as the de-facto usage docs, and today they teach:
  - a removed spelling as a sidebar name;
  - a hidden title beside a visible raw `<p>`, so the accessible name differs from the visible title;
  - raw `<input>`/`<svg>`/`<span>` where DS components exist;
  - a second hand-built dropdown caret;
  - two blurbs that state the wrong default and a reduced-motion mechanism that no longer exists (F-105).
- steps:
  - [ ] 1. Removed spellings (R1.3):
    - Button.stories.tsx:34 `export const Brand: Story = {` → `export const Prominent: Story = {`.
    - ShapeButton.stories.tsx:28: the same rename → `export const Prominent: Story = {`.
    - Toast.stories.tsx:50 `export const Brand: Story = {` → `export const Prominent: Story = {`.
    - Toast.stories.tsx:58 `export const Error: Story = {` → `export const Danger: Story = {`. The variants are `ToastTypes.prominent` / `ToastTypes.danger`, and `Error` also shadows the global.
  - [ ] 2. Visible titles in Modal and Sheet. Seven pairs: Modal.stories.tsx :31/:33, :59/:61, :98/:100, :125/:127 and Sheet.stories.tsx :27/:29, :121/:123, :154/:156.
    - In each pair, delete the `<ModalTitle className="sr-only">…</ModalTitle>` (or `<SheetTitle className="sr-only">…</SheetTitle>`) line.
    - Change the `<p className="text-style-heading text-text">X</p>` line to `<ModalTitle>X</ModalTitle>` (or `<SheetTitle>X</SheetTitle>`) at the same indentation, keeping the visible text X.
    - `ModalTitle`/`SheetTitle` already apply `text-style-heading text-text` (Modal.tsx:96, Sheet.tsx:160). The render is unchanged, and each dialog's accessible name now equals its visible title.
    - Modal.stories.tsx:103 and Sheet.stories.tsx:126: `bg-surface-secondary rounded px-1` → `bg-surface-secondary rounded-tight px-1`. `rounded` is not a radius token (R8.13).
  - [ ] 3. Start with the overrides whose broken state is already known (R9.23). Append these stories. Each has a one-line JSDoc naming the default it contradicts.
    - Toast.stories.tsx. Skip this one if WI-C6-01 already added it: `rg -n "<ToastProvider duration=" src/components/Toast/Toast.stories.tsx` matches.
      ```tsx
      /** Contradicts the 4000ms default: the provider asks for 10s. Before WI-C6-01 this toast still closes at 4s (F-005). */
      export const ProviderDuration: Story = {
        render: () => (
          <ToastProvider duration={10000}>
            <ToastDemo label="Stays for ten seconds" variant={ToastTypes.simple} />
          </ToastProvider>
        ),
      };
      ```
    - Sheet.stories.tsx:
      ```tsx
      /** Contradicts withOverlay (default true): no backdrop, the page stays visible. */
      export const NoOverlay: Story = {
        render: () => (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant={ButtonVariant.secondary}>Open (no backdrop)</Button>
            </SheetTrigger>
            <SheetContent side={SheetSide.right} withOverlay={false}>
              <DemoBody side={SheetSide.right} />
            </SheetContent>
          </Sheet>
        ),
      };
      ```
    - Tooltip.stories.tsx. Contradicts `portal` (true), `sideOffset` (6) and the provider's `delayDuration` (250). The inner provider overrides the meta decorator's.
      ```tsx
      /** portal={false} renders inside the clipping box (and is clipped); sideOffset 16; no open delay. */
      export const InlineNoDelay: Story = {
        render: () => (
          <TooltipProvider delayDuration={0}>
            <div className="flex h-24 w-64 items-start justify-center overflow-hidden border border-solid border-border-primary p-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant={ButtonVariant.ghost}>Inline, clipped</Button>
                </TooltipTrigger>
                <TooltipContent portal={false} sideOffset={16} side="bottom">
                  Rendered in place, not portalled
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        ),
      };
      ```
    - DropdownMenu.stories.tsx. Contradicts `modal` (false, DropdownMenu.tsx:55), `portal` (true, :117) and `dismissOnFocusLoss` (false, :110):
      ```tsx
      /** modal traps focus and blocks the page; the panel renders in place; leaving the window closes it. */
      export const ModalInlineDismissOnFocusLoss: Story = {
        render: () => (
          <DropdownMenu modal>
            <DropdownMenuTrigger asChild>
              <DropdownTrigger>Modal, in place</DropdownTrigger>
            </DropdownMenuTrigger>
            <DropdownMenuContent portal={false} dismissOnFocusLoss>
              <DropdownMenuSection>
                <DropdownMenuItem>Rename</DropdownMenuItem>
                <DropdownMenuItem>Duplicate</DropdownMenuItem>
              </DropdownMenuSection>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      };
      ```
  - [ ] 4. The rest of the uncovered overrides. Append unless noted.
    - DatePicker.stories.tsx: `SplitTrigger` (:93) passes the default preset list, so add custom split presets and a non-default locale:
      ```tsx
      /** Contradicts DEFAULT_SPLIT_TRIGGER_PRESETS and the default locale. */
      export const SplitTriggerCustomPresetsLocale: Story = {
        render: () => {
          const [value, setValue] = useState<DateRange>(
            CalendarPresets.days.fourteen.getRange(TODAY),
          );
          return (
            <DatePicker
              mode={DatePickerMode.dateRange}
              value={value}
              onChange={setValue}
              splitPresets={[CalendarPresets.days.fourteen, CalendarPresets.months.six]}
              locale="de-DE"
              today={TODAY}
            />
          );
        },
      };
      ```
    - ProgressIndicator.stories.tsx: `Default` passes the default colour (:39).
      - Append `export const Prominent: Story = { args: { progress: 0.6, color: LoadingSpinnerColor.prominent, size: LoadingSpinnerSize.md } };`.
      - In `Interactive`, replace the raw range input (:119-127) with `<SliderContinuous className="w-48" min={0} max={1} step={0.01} value={[value]} onValueChange={([v]) => setValue(v)} />`.
      - Replace the raw span (:128-130) with `<LabelText className="text-text-secondary">{Math.round(value * 100)} %</LabelText>`.
      - Add `import { SliderContinuous } from "../Slider";` and `import { LabelText } from "../Text";` after :7.
    - WavyDivider.stories.tsx: after `Low` (:35-40), insert `/** Contradicts strokeWeight (default 2). */` / `export const HeavyStroke: Story = { args: { variant: WavyDividerVariant.high, strokeWeight: 4, className: "text-border" } };`.
    - ShapeMorphSpinner.stories.tsx: append `/** Contradicts the --ui-shape-morph-* timing tokens for this instance. */` / `export const SlowTiming: Story = { args: { size: LoadingSpinnerSize.xl, timing: { duration: 1200, interval: 2400, ease: "linear" } } };`.
    - AIPromptInput.stories.tsx:
      - Give `Composer` (:65-84) two more props, `disabled = false` and `stoppable = true` (types `disabled?: boolean; stoppable?: boolean;`). Pass `disabled={disabled}` to `AIPromptInput`, and change :83 to `onStop={stoppable ? () => setSent("(stopped)") : undefined}`.
      - Append `/** Contradicts disabled (default false). */ export const Disabled: Story = { render: () => <Composer disabled defaultValue="Read-only while the workspace syncs." /> };`.
      - Append `/** responding without onStop: no stop button is offered, and submit stays blocked (AIPromptInput.tsx:305). */ export const RespondingWithoutStop: Story = { render: () => <Composer responding stoppable={false} used={42_000} budget={100_000} /> };`.
      - Contradict the gauge's `size` (default sm, AIContextGauge.tsx:39): add `<AIContextGauge used={50} budget={100} size={LoadingSpinnerSize.md} />` as a fifth child of `ContextGaugeColors` (:149-158), and change :12 to `import { LoadingSpinnerColor, LoadingSpinnerSize } from "../LoadingSpinner/constants";`.
    - AIModelSelect.stories.tsx:
      - :211 `<span className="text-style-body text-text">Claude Sonnet 5</span>` → `<BodyText className="text-text">Claude Sonnet 5</BodyText>`, and add `import { BodyText } from "../Text";` after :12.
      - Append a copy of `ModelTooltip` (:205-224) named `ModelTooltipInverse`, with the JSDoc `/** Contradicts themeInverse (false here, flipping Tooltip's own true default). */` and the boolean prop `themeInverse` added to `AIModelTooltipContent`.
    - Table.stories.tsx: append `RowsCustomHeight` with the JSDoc `/** Contradicts the default row height (auto) through rowHeight, which sets --table-row-height. */`. Copy `Rows`' render (:188-229) verbatim and add only `rowHeight="var(--ui-height-button)"` to `<Table>` (the token is tokens.css:449).
    - AnimatedText.stories.tsx: after `FadeChangeAutoCyclingStatus` (ends :390), insert `FadeChangeDirectionUp`. Use the same render, with `direction={RollDirection.up}` on `<FadeChangeText>` (:384) and `data-testid="fade-status-up"`, and the JSDoc `/** Contradicts direction (default down): new text rises in from below. */`.
    - Tabs.stories.tsx: append
      ```tsx
      /** Contradicts the variant/size defaults: an `unselected` trigger stays unchosen while active; `fill` follows the parent's 48px height. */
      export const UnselectedAndFill: Story = {
        render: () => (
          <div className="flex h-12 items-stretch">
            <Tabs defaultValue="all" className="flex">
              <TabsList className="h-full">
                <TabsTrigger value="all" variant={TabVariant.unselected} size={TabSize.fill}>All</TabsTrigger>
                <TabsTrigger value="mine" variant={TabVariant.primary} size={TabSize.fill}>Mine</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        ),
      };
      ```
    - Toggle.stories.tsx: append `/** An item's size contradicts the switch's (default: inherited, Toggle.tsx:123). */` / `export const ItemSizeOverride: Story = { render: () => (<ToggleSwitch defaultValue="a" variant={ToggleVariant.primary} size={ToggleSize.default}><ToggleSwitchItem value="a">Default</ToggleSwitchItem><ToggleSwitchItem value="b" size={ToggleSize.sm}>Small</ToggleSwitchItem></ToggleSwitch>) };`.
    - SegmentedTabSelect.stories.tsx: add `import { TabSize, TabVariant } from '../Tabs/constants';` after :4. Then append `/** Items contradict the inherited variant and size (SegmentedTabSelect.tsx:94-95). */` / `export const ItemOverrides: Story = { render: () => (<SegmentedTabSelect defaultValue="funding" variant={SegmentedVariant.primary} size={SegmentedSize.standard}><SegmentedTabItem value="funding">Funding</SegmentedTabItem><SegmentedTabItem value="all" variant={TabVariant.unselected}>All</SegmentedTabItem><SegmentedTabItem value="tx" size={TabSize.sm}>Transactions</SegmentedTabItem></SegmentedTabSelect>) };`.
    - Icons.stories.tsx: no story renders args today, so the `strokeWidth`/`color` argTypes at :24-28 do nothing. Append `export const Playground: Story = { args: { size: IconSizes.md, strokeWidth: 3, strokeColor: "var(--ui-color-prominent)", fillColor: "var(--ui-color-surface-secondary)", children: <path d="M6 18h6a3 3 0 0 0 3 -3v-10l-4 4m8 0l-4 -4" /> } };`. Spell it `IconSize.md` if WI-C4-13 has landed. Both colour tokens exist (tokens.css:53, :96).
  - [ ] 5. Raw elements and wrong docs (R9.24, R9.13):
    - Tabs.stories.tsx:50-61: replace the two inline `<svg>…</svg>` blocks with `<TableIcon />` (value `list`) and `<GraphIcon />` (value `grid`). Add `aria-label="List"` / `aria-label="Grid"` to those two `TabsTrigger`s. Both icons are already imported at :4.
    - LoadingSpinner.stories.tsx:103 and :116: `<span className="w-12 text-style-label text-text-secondary">flat</span>` → `<LabelText className="w-12 text-text-secondary">flat</LabelText>` (likewise `spokes`). Add `import { LabelText } from "../Text";` after :7.
    - HotkeyIndicator.stories.tsx:27, :31, :35: `<span className="text-style-label text-ghost-fg w-20">…</span>` → `<LabelText className="text-ghost-fg w-20">…</LabelText>`. Add `import { LabelText } from '../Text';` as a new line after :2 (WI-C5-14 edits :2 itself).
    - Icons.stories.tsx:
      - Replace `IconCell`'s inline-styled label span (:51-59) with `<LabelText className="text-center text-text-secondary">{label}</LabelText>`, and add `import { LabelText } from "../Text";`.
      - The "Open" sidebar cells (:109-112, :117-120) render the closed icon. Change them to `icon={(props) => <SidebarLeftHoverIcon {...props} />}` / `label="SidebarLeftHover"` and `icon={(props) => <SidebarRightHoverIcon {...props} />}` / `label="SidebarRightHover"`.
      - Relabel :107 and :115 to `"SidebarLeft"` / `"SidebarRight"`.
      - Import both hover icons from `./SidebarLeftHoverIcon` / `./SidebarRightHoverIcon` in the :2-18 block.
    - MorphRotationShape.stories.tsx:73-103:
      - Delete the `EmbeddedDropdownCaret` story and its JSDoc. Its hand-built 31px frame duplicates the shipped `DropdownCaret`, whose `Menus/DropdownCaret` stories show the embedded mode.
      - In its place, put `/* Embedded mode inside a trigger: see Menus/DropdownCaret, the shipped embedding. */`.
      - Remove the imports that become unused: `ChevronDownIcon` (:4) and the `../Menu` block (:5-10). `Button`, `ButtonVariant`, `ButtonText` and `PuffShape` stay, because `ControlledDemo` and the stories above use them.
    - AnimatedText.stories.tsx:
      - :212-213 → `` "`direction` flips the barrel roll. `down` (default) rolls each glyph downward; `up` rolls it " + `` / `"upward. Hover each to compare.",`, matching RollHoverText.tsx:37 `direction = RollDirection.down,`.
      - :253-254 → `` * text rolls in and settles into focus. Respects `prefers-reduced-motion` `` / `` * (index.css:727-732 cuts `.ds-roll-change-*` to a 1ms animation). The roll owns no color ``.
    - BaseText.stories.tsx:161 `<Row label="MonoText fontSize={20} fontWeight={700}">` → `<Row label="MonoText fontSize={20} fontWeight={FontWeights.bold}">`.
  - [ ] 6. Verify with commands:
    - `npm run lint` → exit 0. tsconfig includes `src`, so every story type-checks.
    - `rg -n "export const (Brand|Error)\b" src/components/Button src/components/ShapeButton src/components/Toast --glob '*.stories.tsx'` → no output.
    - `rg -n 'Title className="sr-only"' src/components/Modal/Modal.stories.tsx src/components/Sheet/Sheet.stories.tsx` → no output.
    - `rg -n 'type="range"|<svg width=|<span className="(w-12 )?text-style-' src/components/{ProgressIndicator,Tabs,LoadingSpinner,HotkeyIndicator,AIChat} --glob '*.stories.tsx'` → no output.
    - `rg -n "EmbeddedDropdownCaret|\`up\` \(default\)|motion-safe:\` scoped|fontWeight=\{700\}" src --glob '*.stories.tsx'` → no output.
    - Each new override value is present (one rg per pattern, in the file named): `duration=\{10000\}` (Toast); `withOverlay=\{false\}` (Sheet); `portal=\{false\}` (Tooltip and DropdownMenu); `dismissOnFocusLoss`; `<DropdownMenu modal>`; `locale="de-DE"`; `LoadingSpinnerColor.prominent` (ProgressIndicator); `strokeWeight: 4`; `timing:` (ShapeMorphSpinner); `stoppable=\{false\}`; `size=\{LoadingSpinnerSize.md\}` (AIPromptInput); `ModelTooltipInverse`; `rowHeight=`; `RollDirection.up` inside `FadeChangeDirectionUp`; `TabVariant.unselected` and `TabSize.fill` (Tabs); `size=\{ToggleSize.sm\}` (Toggle); `variant=\{TabVariant.unselected\}` (SegmentedTabSelect); `strokeWidth: 3` (Icons).
  - [ ] 7. Verify in Storybook. Run `npm run storybook` with the pane visible.
    - `Overlays/Modal/Default`: the DevTools Accessibility pane names the dialog "Modal title", matching the visible heading.
    - `Overlays/Toast/Provider Duration`: the toast closes at about 4s before WI-C6-01 and about 10s after it.
    - `Overlays/Tooltip/Inline No Delay`: the tooltip opens immediately and is clipped by the box.
    - `Menus/DropdownMenu/Modal Inline Dismiss On Focus Loss`: the page behind is inert while the menu is open, and alt-tab closes it.
    - `Icons/BaseIcon/Sidebar Icons`: the two Hover cells show the curved inner line.
    - `Navigation/Tabs/Icon Tabs`: renders the Table and Graph icons.
  - [ ] 8. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: step 6's rg assertions hold. Every override in F-105's evidence table has a story that sets a non-default value, except the asChild set (WI-C5-02) and the colour stories (WI-C2-06). No story export is named `Brand` or `Error` for a renamed variant. The Modal and Sheet stories render visible `ModalTitle`/`SheetTitle`. `npm run lint` exits 0.
- log:
  - 2026-10-01 — created by audit

### WI-C3-16: Delete the stale `figma-variable-jsons/` snapshot
- status: blocked(D-19)
- addresses: [F-106]
- depends_on: []
- phase: P1
- risk: low — nothing in the repo reads the folder (no script, config, skill or doc names it), and it never ships (`files` = dist, skills, bin). git keeps the snapshot at a01e5e8 for anyone who needs it. The two tokens.css comments that mention "the Figma export" (:47-50, :501-502) describe the live Figma file's export behaviour, not this folder: the committed export has no `ButtonProminent` group. They stay true and are not edited.
- semver: none
- files:
  - delete: `figma-variable-jsons/Colors - Interactables.json`, `figma-variable-jsons/Colors - Statics.json`, `figma-variable-jsons/Corner Radii.json`, `figma-variable-jsons/Icons.json`, `figma-variable-jsons/Sizing_Spacing.json` (all five tracked files; added in a01e5e8 and never changed since)
- anchor:
  ```json
  // figma-variable-jsons/Corner Radii.json:1 (first 3 variables)
  {"id":"VariableCollectionId:6:80","name":"Corner Radii", … "variables":[{"id":"VariableID:6:81","name":"tight", … "valuesByMode":{"6:3":12}, … {"id":"VariableID:6:82","name":"standard", … "valuesByMode":{"6:3":18},
  ```
  ```json
  // package.json:35-39
    "files": [
      "dist",
      "skills",
      "bin"
    ],
  ```
- why: The folder is the initial-commit snapshot. It names `standard` radius, `brand` button colours and a 1.5 stroke width, all of which tokens.css has since renamed or changed, and nothing records its export date. An agent asked to "sync tokens with Figma" that trusts it would revert the renames (F-106). D-19's recommended option is deletion: git keeps the history, the live Figma file is the source the token comments already cite, and c05b59d set the precedent of deleting completed artefacts. If D-19 instead picks "keep as historical", replace steps 1-2 with one new file `figma-variable-jsons/README.md` stating "Snapshot of the Figma variable collections at a01e5e8 (initial commit). Stale: tokens.css is the source of truth; the live Figma file is the design source. Do not sync from these files." If it picks "refresh", this WI is superseded by a maintainer export from Figma (the steps then depend on the Figma file and are not knowable here).
- steps:
  - [ ] 1. Confirm the preconditions: `git ls-files figma-variable-jsons` → exactly the five paths above; `rg -n "figma-variable-jsons" --glob '!docs/audit/**' .` → no output; `git log --oneline -- figma-variable-jsons` → only `a01e5e8 Initial commit`. If any reference has appeared since b436647, stop and list it.
  - [ ] 2. `git rm -r figma-variable-jsons` (removes the five files and the directory).
  - [ ] 3. Docs: no skill or doc names the folder, so no text changes are needed. `.agents/skills/dooph-ds-codebase/SKILL.md:498` (C-CB-178, "The 5.4 pass realigned nearly every name with Figma…") stays as it is: its "5.4" label belongs to WI-C2-07, and with the snapshot gone the sentence no longer contradicts a committed file.
  - [ ] 4. Verify: `test ! -e figma-variable-jsons && echo gone` → `gone`; `git status --porcelain` → five `D  figma-variable-jsons/…` lines and nothing else; `npm run lint` → exit 0. In a scratch worktree with the change applied, `npm run build` → exit 0 and `npm pack --dry-run` lists the same files as on b436647 (the folder was never packed).
  - [ ] 5. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: `figma-variable-jsons/` is absent and untracked; nothing outside docs/audit references it; the build and the packed file list are unchanged.
- log:
  - 2026-10-01 — created by audit

### WI-C3-17: Make arch:122's prop-name rule a stated test with a complete list of sanctioned names, and add a `DatePickerMode` row to the naming table
- status: blocked(D-08)
- addresses: [F-110]
- depends_on: []
- phase: P1
- risk: low — rule text only; no prop is renamed, so nothing a consumer sees changes. Two other WIs touch the same area: WI-C3-07 adds a `CheckboxVariant` row after arch:52, and WI-C3-13 (D-17) inserts a "Class resolution" subsection after arch:122 that refers to "a sanctioned name above". Both anchor on the text, and this WI's rewritten :122 is still the last bullet of the Invariants list, so all three land in any order.
- semver: none
- files:
  - modify: `.agents/skills/dooph-ds-architecture/SKILL.md:122 @ b436647`
  - modify: `.agents/skills/dooph-ds-architecture/SKILL.md:54-55 @ b436647` (insert one table row after the `DropdownMenuSelectType` row)
- anchor:
  ```markdown
  - Prop name is always `variant` (not `styleVariant`, not `type`, not `kind`). Size prop is always `size`. The only exceptions are geometry/mode props with established or genuinely orthogonal names: `shape` (ShapeButton), `side` (SheetContent, matching Radix's own `side` convention), and `selectType` (`DropdownMenu` — it is a selection mode, not a visual variant, so the `variant` name would mislead).
  | `DropdownMenuSelectType` | `selectType` | `<DropdownMenu selectType={DropdownMenuSelectType.multi} />` (items read it via context; triggers get it as Slot-merged `data-select-type`) |
  ```
- why: arch:122's principle sanctions any geometry/mode prop with an orthogonal name, but its "The only exceptions are" list names three. The code follows the principle: `mode` (Calendar, DatePicker, DatePickerTrigger, MorphRotationShape), `direction` (RollChangeText, FadeChangeText, RollHoverText, RevealChangeText), `sortDirection` (Table) and `state` (AIToolPart, AIThinkingPart) are 11 props that the literal list marks as violations. A reviewer gets 11 false positives, and an agent "fixing" them makes a breaking rename that is impossible on AIToolPart, where `state` and `variant` already coexist (F-110). D-08's recommended option is to extend the rule, not rename the props.
- steps:
  - [ ] 1. Replace arch:122 with:
    ```markdown
    - A prop that picks a visual style is named `variant`, never `styleVariant`, `type`, `kind`, `appearance` or `tone`. A prop that picks a size is named `size`. Any other closed-set prop is named for what it selects, provided the choice is orthogonal to the visual variant — a geometry, a mode, a direction or a lifecycle state — because calling it `variant` would mislead. The sanctioned names today: `shape` (ShapeButton), `side` (SheetContent, after Radix's own `side`), `selectType` (DropdownMenu: a selection mode), `mode` (Calendar, DatePicker, DatePickerTrigger: `DatePickerMode`; MorphRotationShape: `MorphRotationShapeMode`), `direction` (RollChangeText, FadeChangeText, RollHoverText: `RollDirection`; RevealChangeText: `RevealDirection`), `sortDirection` (TableHeaderCell: `TableSortDirection`) and `state` (AIToolPart: `AIToolPartState`; AIThinkingPart: `AIThinkingPartState`). Adding a name to this list is a rule change: add it here in the same change as the prop. Outside the rule: props inherited unchanged from a Radix primitive (`checked`, `orientation`) and open-value props (`color`, the typography props; see "The open-value exception" below).
    ```
  - [ ] 2. After the `DropdownMenuSelectType` row (:54), insert:
    ```markdown
    | `DatePickerMode` | `mode` | `<DatePicker mode={DatePickerMode.dateRange} value={range} onChange={setRange} />` (a discriminated union: `mode` decides the type of `value`) |
    ```
  - [ ] 3. Make sure the list in step 1 is complete when written. Run a TypeScript-AST enumeration of every prop typed from an exported `as const` object (V4's `docs/audit/_work/scratch/V4/m26.cjs` does exactly this; re-run it with `node docs/audit/_work/scratch/V4/m26.cjs`). Drop `variant`, `size`, `checked` and `color` from its output. Every remaining prop name must appear in the step-1 sentence; @ b436647 that leaves `shape`, `side`, `selectType`, `mode`, `direction`, `sortDirection` and `state`. If the script is gone, use `rg -n "^\s+(shape|side|selectType|mode|direction|sortDirection|state)\??:\s" src/components --glob '*.tsx' --glob '!*.stories.tsx'` and confirm every hit's type is one of the consts named in step 1 or a Radix type.
  - [ ] 4. Verify: `rg -n "The only exceptions are" .agents/skills/dooph-ds-architecture/SKILL.md` → no output; `rg -c "sortDirection|AIToolPartState|RevealDirection|MorphRotationShapeMode" .agents/skills/dooph-ds-architecture/SKILL.md` → ≥ 1 each (one rg per name); `rg -n "^\| \`DatePickerMode\`" .agents/skills/dooph-ds-architecture/SKILL.md` → 1; the naming table renders as one table in a Markdown preview; `git diff --stat` touches only the architecture skill. Through the `.claude` symlink the edit is live for Claude in this checkout (WI-C3-02 covers other checkouts).
  - [ ] 5. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: arch:122 states the orthogonality test and names all seven sanctioned props with their consts; the naming table has a `DatePickerMode` row; no component file changed.
- log:
  - 2026-10-01 — created by audit

### WI-C3-18: Resolve the contribution skill's rule-text conflicts (RC-2 wrappers, RC-3 breaking-change notes, RC-5 radius list) and settle R9.19's scope; move the history out of contracts and JSDoc
- status: blocked(D-09)
- addresses: [F-111, F-112, F-120]
- depends_on: [WI-C2-10]
- phase: P1
- risk: low. Most of this is rule text and comments. Three points to watch:
  - Step 6 rewords a `## constraints` bullet in Button.tsx. AGENTS.md:6-8 makes that the maintainer's own commit, with reasoning, so step 6 sits behind its own CHECKPOINT.
  - Step 7 deletes four "BREAKING (major)" JSDoc notes that ship in dist `.d.ts`. They can go only once WI-C2-10 has put the same facts in CHANGELOG `[Unreleased]`, hence the dependency.
  - Step 4 swaps three `stroke="var(…)"` attributes for a generated utility. The rendered colour is the same token, and an SVG presentation attribute loses to any class anyway, so nothing a consumer can see changes.
  Coordination: Button.tsx:19 carries a "5.4" token. This WI deletes that line, so WI-C2-07 has nothing left to relabel there. WI-C3-04 (D-04) rewrites LoadingSpinner.tsx:196-211 around the same track `<path>`. Whichever lands second re-anchors on the text `stroke="var(--ui-color-border-primary)"` or `className="stroke-border-primary"`. WI-C3-06 edits contrib:17, :29-34, :78 and :151, and WI-C3-13 edits contrib:97-98. None of those lines overlap this WI's (contrib:56, :65, :100, :136).
- semver: none
- files:
  - modify: `.agents/skills/dooph-ds-contribution/SKILL.md:56,65,100,136 @ b436647`
  - modify: `src/components/LoadingSpinner/LoadingSpinner.tsx:200 @ b436647`
  - modify: `src/components/ProgressIndicator/ProgressIndicator.tsx:145,238 @ b436647`
  - modify: `src/components/Toggle/Toggle.tsx:4-5 @ b436647`
  - modify: `src/components/Button/Button.tsx:19-20 @ b436647`
  - modify: `src/components/Menu/constants.ts:11-13 @ b436647`
  - modify: `src/components/Menu/DropdownMenu.tsx:277-278 @ b436647`
  - modify: `src/components/SegmentedTabSelect/constants.ts:7-11 @ b436647`
  - modify: `src/components/Toggle/constants.ts:13-14 @ b436647`
- anchor:
  ```markdown
  contrib:56   - [ ] Uses `rounded-tight`, `rounded-normal`, or `rounded-soft` for corner radius
  contrib:65   - [ ] If a layout wrapper IS necessary, it is `aria-hidden` and absolutely positioned (like OutlineButton's blur orbs)
  contrib:100  7. Document breaking changes in a comment at the top of the component file if any API surface was removed.
  contrib:136  | `width="var(--ui-…)"` (or any `var()`) as an SVG **attribute** | Attributes are parsed as SVG lengths and cannot resolve custom properties, so the value is silently ignored | Set it as a CSS property instead — `style={{ width: 'var(--ui-…)' }}` — and leave the numeric attribute as the pre-CSS fallback |
  ```
  ```tsx
  // Button.tsx:19-20 (inside ## constraints)
   * - `prominent` was called `brand` before 5.4, in both the variant key and the
   *   token family (`--ui-color-brand-*`). Neither spelling survives.
  // Toggle.tsx:4-5 (contract title)
   * ToggleSwitch — Figma "Toggle Switch": a single-select row of Toggle Options
   * (two or more). Renamed from TwoWayToggle / TwoWayToggleItem (BREAKING, major).
  // LoadingSpinner.tsx:200, ProgressIndicator.tsx:145 and :238
          stroke="var(--ui-color-border-primary)"
  ```
- why: Three pairs of rules contradict each other:
  - **RC-2:** contrib:65 demands `aria-hidden` and absolute positioning for any necessary wrapper. Applied to the two wrappers around `children` that arch:232-235 sanctions, that silences the button's or menu item's label (F-111).
  - **RC-3:** contrib:100 puts breaking-change notes at the top of the component file. That is where fhc:158 puts the contract and fhc:173 forbids history. The repo now carries history in Toggle's title, in Button's `## constraints` (with an unreleased version stated as fact), and in four shipped JSDoc blocks (F-112).
  - **RC-5:** contrib:56 lists three radius utilities, while contrib:18 tells authors to mint tokens and nine radius tokens exist (F-120).
  Separately, R9.19 (contrib:136) gives a reason that is false for presentation attributes: Chromium resolves `stroke="var(…)"` (F-117 item 27). That leaves a reviewer unsure whether the three track strokes break the rule. D-09's recommended option rewrites each rule to the version both sides can follow. It keeps R9.19 universal and states the reason precisely, so the three strokes comply instead of sitting in a grey zone.
- steps:
  - [ ] 1. RC-2. Replace contrib:65 with two checklist items:
    ```markdown
    - [ ] Decorative layers (blur orbs, glows, a track behind the content) are `aria-hidden` and absolutely positioned (OutlineButton's orbs)
    - [ ] A wrapper around `children` exists only for a layout necessity listed in the architecture skill's "Layout-necessity exceptions" — non-interactive, in flow or relatively positioned, and NEVER `aria-hidden` (it holds the control's accessible name)
    ```
  - [ ] 2. RC-5. contrib:56 → `- [ ] Corner radius is a \`rounded-*\` utility generated from a \`--ui-radius-*\` token, never an arbitrary value: the shared scale is \`rounded-tight\` / \`rounded-mini\` / \`rounded-normal\` / \`rounded-soft\`, and a component-specific radius gets its own token per Step 1 (\`rounded-checkbox\`, \`rounded-avatar\`, \`rounded-calendar-day\`); \`rounded-full\` is fine for true circles`. Check first that every utility named still exists: `rg -n -- "--ui-radius-(tight|mini|normal|soft|checkbox|avatar|calendar-day):" src/styles/tokens.css` → 9 lines (7 in `:root` at :536-544, plus `.dark` re-declarations of checkbox and avatar at :721-722).
  - [ ] 3. RC-3. contrib:100 → `7. Record every removed or renamed API surface in \`CHANGELOG.md\` \`[Unreleased]\` (Removed / Changed). When the release is a major, the \`dooph-ds-writing-version-migrations\` Step 2 inventory picks it up from there. Never write history into the component file: its top is the header contract, which describes only the present (file-header-contracts, "Changelog entries").`
  - [ ] 4. R9.19 scope. Replace the contrib:136 row with:
    ```markdown
    | `width="var(--ui-…)"`, `stroke="var(--ui-…)"` — any `var()` in an SVG **attribute** | Geometry attributes (`width`, `height`, `r`, `cx`, …) are parsed as SVG lengths and never resolve a custom property, so the value is silently ignored. Presentation attributes (`stroke`, `fill`) resolve it in Chromium, but the package tests no other engine and any class beats them anyway. Either way the attribute is the wrong carrier for a token | Use a generated utility (`stroke-border-primary`, `fill-…`) or a CSS property (`style={{ width: 'var(--ui-…)' }}`), and leave a numeric attribute only as the pre-CSS fallback |
    ```
    Then bring the three sites into line. In LoadingSpinner.tsx:200 and ProgressIndicator.tsx:145 and :238, replace `stroke="var(--ui-color-border-primary)"` with `className="stroke-border-primary"`. None of the three elements has a `className` today. `--color-border-primary` is in the `@theme` block (index.css:132), so Tailwind generates the utility.
  - [ ] 5. Toggle.tsx:4-5 (the title line, not a constraint) → ` * ToggleSwitch — Figma "Toggle Switch": a single-select row of Toggle Options` / ` * (two or more).`. The `## constraints` bullets (:15-17) are untouched. WI-C3-14 later moves the `"use client"` line at :1, which this edit does not touch.
  - [ ] 6. CHECKPOINT — stop. Summarise steps 1-5 as one diff; the maintainer commits it.
  - [ ] 7. Button.tsx:19-20, a constraint change, so it gets its own commit (AGENTS.md:6-8). Replace the two lines with ` * - Neither \`brand\` (as a \`ButtonVariant\` key) nor the \`--ui-color-brand-*\` token` / ` *   family exists; do not reintroduce either spelling (architecture skill, Rule 1).`. The rule keeps its force and drops its history. The rename itself is recorded in CHANGELOG by WI-C2-10 and in arch:32. Proposed commit reasoning for the maintainer: "Constraint reworded, not removed: contracts describe the present (fhc:173); the history and the unreleased version label move to CHANGELOG [Unreleased]."
  - [ ] 8. CHECKPOINT — stop. Summarise the Button.tsx diff and the reasoning above; the maintainer commits it separately.
  - [ ] 9. JSDoc history. These comments ship in dist `.d.ts`. First confirm that WI-C2-10 has recorded each change: `rg -n "DropdownMenuVariant|DropdownMenuCheckboxItem|SegmentedVariant.ghostSmall|SegmentedTabSelect\` with no props|ToggleVariant.secondary" CHANGELOG.md` → ≥ 5 lines, all under `## [Unreleased]`. If any is missing, stop: WI-C2-10 has not landed. Then:
    - Menu/constants.ts:11-13: delete the blank ` *` line and the two `BREAKING (major): DropdownMenuVariant …` / `Items hold the 160px floor; …` lines. Then add ` * Width: items hold the 160px floor; set DropdownMenuSection \`width\` for a wider menu.` before the closing ` */` (present-tense usage, kept).
    - DropdownMenu.tsx:277-278 → ` * Figma Checkbox Menu Item.` (drop `Renamed from DropdownMenuCheckboxItem` / `(BREAKING, major).`).
    - SegmentedTabSelect/constants.ts:7-11: delete the blank ` *` line and the four `BREAKING (major): the flat keys …` lines. Add ` * With no props it renders \`primary\` + \`SegmentedSize.container\`.` before the closing ` */`.
    - Toggle/constants.ts:13-14: delete the blank ` *` line and ` * BREAKING (major): \`secondary\` was renamed \`ghost\` to match Figma.`.
  - [ ] 10. Verify:
    - `npm run lint` → exit 0.
    - `rg -n "BREAKING|Renamed from|before 5\.4|was renamed" src --glob '!*.stories.tsx'` → no output.
    - `rg -n "aria-hidden\` and absolutely positioned \(like" .agents/skills/dooph-ds-contribution/SKILL.md` → no output.
    - `rg -n "Document breaking changes in a comment" .agents/skills/dooph-ds-contribution/SKILL.md` → no output.
    - `rg -n "rounded-mini" .agents/skills/dooph-ds-contribution/SKILL.md` → ≥ 1.
    - R9.19's own check, `rg -n "(width|height|stroke|fill|strokeWidth|r|cx|cy)=\{?['\"\`]var\(" src` → no output.
    - In a scratch worktree build: `rg -c "\.stroke-border-primary" dist/styles.css` → ≥ 1. `rg -n "BREAKING" dist/components/Menu/constants.d.ts dist/components/SegmentedTabSelect/constants.d.ts dist/components/Toggle/constants.d.ts` → no output.
    - In Storybook (pane visible), `Progress/ProgressIndicator/Half`: `getComputedStyle(document.querySelector('svg circle')).stroke` equals the resolved `--ui-color-border-primary`, in light and in `.dark`. The flat `Progress/LoadingSpinner` track looks the same as before.
  - [ ] 11. CHECKPOINT — stop. Summarise the step-9 diff; the maintainer commits it.
- done_when:
  - contrib:65 is two items, and the children-wrapper item forbids `aria-hidden`.
  - contrib:56 names the token-generated scale.
  - contrib:100 points at CHANGELOG.
  - contrib:136 covers presentation attributes, and no `var()` SVG attribute remains in src.
  - No "BREAKING"/"Renamed from"/"before 5.4" history remains in src, and Button's reworded constraint landed in its own commit.
- log:
  - 2026-10-01 — created by audit

### WI-C3-19: Paint AIModelTooltipContent's title through `--ds-chat-model-color` and a `ds-*` rule, so the AIModelSelect colour constraint holds at every sink
- status: todo
- addresses: [F-102]
- depends_on: [WI-C3-10]
- phase: P3
- risk: low — the title keeps the same colour in every case today's code produces. With `color` set, it is the same resolved value, now reaching the title through the custom property. Without `color`, `currentColor` on the `color` property inherits exactly as the absent inline style did. One edge changes, and it is the intended one: an unportalled tooltip with no `color`, nested inside an element that sets `--ds-chat-model-color` (an `AIModelSelectItem`), now inherits that provider colour for its title.
- semver: patch
- files:
  - modify: `src/components/AIChat/AIModelSelect.tsx:205-230 @ b436647`
  - modify: `src/styles/dooph-component-tokens.css:511-517 @ b436647` (add one rule after `.ds-chat-model-swatch`)
- anchor:
  ```tsx
  // AIModelSelect.tsx:205-230
    (
      {
        title,
        description,
        capability,
        color,
        className,
        themeInverse = false,
        ...props
      },
      ref,
    ) => (
      <TooltipContent
        ref={ref}
        variant={TooltipTypes.complex}
        themeInverse={themeInverse}
        className={cn("ds-width-chat-model-tooltip", className)}
        {...props}
      >
        <div className="flex w-full flex-col gap-rg px-rg pt-sm pb-md">
          <div className="flex w-full flex-col gap-xs">
            <ButtonText
              style={color ? { color: resolveDsColor(color, "") } : undefined}
            >
  ```
  ```css
  /* dooph-component-tokens.css:511-517 */
    .ds-chat-model-swatch {
      width: var(--ui-chat-model-swatch-size);
      height: var(--ui-chat-model-swatch-size);
      border-radius: var(--ui-chat-model-swatch-radius);
      background-color: var(--ds-chat-model-color, var(--ui-color-prominent));
      flex-shrink: 0;
    }
  ```
- why: The AIModelSelect header says provider colour is "written as a custom property the CSS reads — never a class". Three of the four colour sinks do that: the item swatch via `--ds-chat-model-color` (:93), and the slider and the bar via their own `color` props. The tooltip title writes an inline `color` (:227), the one place the constraint is false (F-102, V6 M35). An agent editing AIModelTooltipContent either "fixes" it ad hoc or stops trusting the header. Routing the title through the same custom property makes the header true without weakening it. WI-C3-10 adds the constraint's failure clause.
- steps:
  - [ ] 1. Reproduce. Run `npm run storybook` with the pane visible, open `AI Chat/Model Select/Model Tooltip`, and run `document.querySelector('[data-radix-popper-content-wrapper] .text-style-button').getAttribute('style')`. It returns `color: var(--ui-color-ai-anthropic);`, an inline `color`, not a custom property. Then `rg -n "\{ color: resolveDsColor" src/components/AIChat/AIModelSelect.tsx` → 1 (:227).
  - [ ] 2. CSS. In `src/styles/dooph-component-tokens.css`, after the `.ds-chat-model-swatch` rule (:511-517), still inside `@layer utilities`, add:
    ```css
      /* AIModelTooltipContent's model name. The provider colour arrives as
       * --ds-chat-model-color (set on the tooltip root); without it,
       * currentColor on `color` inherits, which is the untinted look. */
      .ds-chat-model-name {
        color: var(--ds-chat-model-color, currentColor);
      }
    ```
  - [ ] 3. Component. `AIModelSelect.tsx`:
    - Destructure `style` beside `className` (after :211).
    - Add a `style` prop to `TooltipContent` that merges exactly as AIModelSelectItem does (:89-96), placed before `{...props}`:
      ```tsx
          style={
            {
              ...style,
              ...(color
                ? { "--ds-chat-model-color": resolveDsColor(color, "") }
                : {}),
            } as CSSProperties
          }
      ```
    - Replace the title's opening tag (:226-228) with `<ButtonText className="ds-chat-model-name">`.
    - `CSSProperties` is already imported (:24). Radix Tooltip merges a consumer `style` with its own transform-origin variables, so nothing it sets is lost.
  - [ ] 4. Header. With WI-C3-10 landed, the constraint at :14-15 reads "…written as a custom property the CSS reads — never a class: a class cannot carry an arbitrary consumer colour", which is now true at every sink. No header edit is needed. If WI-C3-10 has not landed, stop: it owns that line. The `title` JSDoc (:187 "Model name, painted in `color`.") stays true.
  - [ ] 5. Verify with commands:
    - `npm run lint` → exit 0.
    - `rg -n "\{ color: resolveDsColor" src` → no output.
    - `rg -c "ds-chat-model-name" src/components/AIChat/AIModelSelect.tsx src/styles/dooph-component-tokens.css` → 1 each.
    - In a scratch worktree build, `rg -c "\.ds-chat-model-name" dist/styles.css` → ≥ 1.
  - [ ] 6. Verify in Storybook, story `Model Tooltip`:
    - The step-1 query returns `null` (no inline style on the title).
    - `getComputedStyle(document.querySelector('.ds-chat-model-name')).color` equals `getComputedStyle(document.documentElement).getPropertyValue('--ui-color-ai-anthropic')` as an rgb value (#e48844 → `rgb(228, 136, 68)`).
    - In DevTools, delete the `color` prop's custom property from the tooltip root's style. The title falls back to the tooltip's text colour, not black or transparent.
    - With WI-C3-15's `ModelTooltipInverse` story present, the title keeps the provider colour on the inverse surface.
  - [ ] 7. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: no inline `color` is written from a `color` prop anywhere in AIModelSelect.tsx; the tooltip title reads `--ds-chat-model-color` through `.ds-chat-model-name`; the computed title colour is unchanged with and without `color`.
- log:
  - 2026-10-01 — created by audit

## DONE
