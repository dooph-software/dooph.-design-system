# WI-C2 — draft work items (composer C2) @ b436647

Ordering note: WI-C2-01 and WI-C2-09 both edit token-contract.md, and WI-C2-04 and WI-C2-08 both edit the usage skill. The second WI of each pair depends on the first so its anchors stay valid. WI-C2-07 (P4) relabels every remaining "5.4" line last. The other WIs never touch a "5.4" token, so their anchors survive it.

### WI-C2-01: Correct the theming skill's dead utility names and wrong token facts
- status: todo
- addresses: [F-006, F-047, F-117]
- depends_on: []
- phase: P3
- risk: low — prose only in two shipped markdown files; the one risk is restating a value wrongly, which step 3's rg assertions check against tokens.css
- semver: patch
- files:
  - modify: `skills/dooph-design-system-theming/references/token-contract.md:56,66,69,77,87,98,210,212,220 @ b436647`
  - modify: `skills/dooph-design-system-theming/SKILL.md:16,45-46,203-205 @ b436647`
- anchor:
  ```md
  token-contract.md:66   There are **eight** text roles: `body`, `button`, `heading`, `subheading`, `label`, `title`, `hero`, `mono`.
  token-contract.md:98   - `--ui-color-slider-step-inactive` — the unfilled step dot, shared by both variants (defaults to `--ui-color-border-secondary`)
  token-contract.md:210  - Radii: `rounded-tight`, `rounded-normal`, `rounded-soft`, `rounded-slider-inner` (v3, and directional variants such as `rounded-l-standard`)
  SKILL.md:205           slider paints the handle in it and the active track at 45% of it. Geometry
  ```
- why: A consumer copying `rounded-l-standard` gets square corners with no warning (F-006, S1), and one retuning icons, slider dots, the `-alt` identity colour or the hero roles from this file starts from a wrong baseline (F-047). Several "5.4" labels sit on these lines; they are left for WI-C2-07.
- steps:
  - [ ] 1. token-contract.md — make these edits, each a literal replacement inside the quoted line:
    - :210 `directional variants such as \`rounded-l-standard\`` → `directional variants such as \`rounded-l-normal\``
    - :56 replace the last sentence `Unlike the button family (which is fully mode-invariant), the alt DOES change between light and dark.` → `Like the button family, all three identity colours (\`--ui-prominent-color\`, \`-alt\`, \`-ter\`) are mode-invariant — none has a \`.dark\` value.`, and change the sentence's opening `the two-color brand identity pair` → `the brand identity trio`
    - :66 → `There are **ten** text roles: \`body\`, \`button\`, \`heading\`, \`subheading\`, \`label\`, \`title\`, \`hero\`, \`heroBody\`, \`heroButton\`, \`mono\`. \`heroBody\` and \`heroButton\` are the body and button roles at 16px (\`--ui-text-hero-body\` / \`--ui-text-hero-button\`) — same family, weight, tracking and axes; they are unrelated to \`hero\`.`
    - :69 append `, \`--ui-text-hero-body\`, \`--ui-text-hero-button\`` to the `--ui-text-*` list
    - :77 replace `Label, title and hero ship no axis token because their faces implement none.` → `Label, title and hero ship no axis token: Host Grotesk (label) implements only \`wght\` and Bricolage Grotesque (title/hero) only \`opsz\`/\`wght\` — none of the axes the tokens name.`
    - :87 replace `\`--ui-icon-stroke-width\` (1.5) — back \`IconSize.sm/rg/md/lg\`.` → `back \`IconSize.sm/rg/md/lg\`; \`--ui-icon-stroke-width\` (2) is the default \`strokeWidth\` of every icon.` (keep the rest of the line, including its "Renamed in 5.4 …" sentence, verbatim)
    - :98 `(defaults to \`--ui-color-border-secondary\`)` → `(defaults to \`--ui-color-secondary-border\`, the secondary button's border paint — not \`--ui-color-border-secondary\`)`
    - :212 insert `\`text-style-hero-body\`, \`text-style-hero-button\`, ` after `\`text-style-hero\`, `
    - :220 `so the app's Tailwind learns every \`--ui-*\` token:` → `so the app's Tailwind learns every dooph token that backs a utility (motion, opacity and other raw-value tokens are CSS-only by design):`
  - [ ] 2. theming SKILL.md:
    - :16 `The \`--ui-*\` names below are the v3 contract.` → `The \`--ui-*\` names below are the current contract.`
    - :45-46 `it registers every\n\`--ui-*\` token in your Tailwind build` → `it registers every\ndooph token that backs a utility in your Tailwind build`
    - :204-205 `— the\n  slider paints the handle in it and the active track at 45% of it.` → `— the\n  slider paints the handle in it and tints the active track with it at\n  \`--ui-slider-track-primary-active-opacity\` / \`--ui-slider-track-prominent-active-opacity\`\n  (50% / 70% light, 60% dark), per \`SliderVariant\`.`
  - [ ] 3. Verify:
    - `rg -n "rounded-l-standard|\(1\.5\)|\*\*eight\*\*|at 45%|defaults to \`--ui-color-border-secondary\`|the v3 contract|alt DOES change" skills/dooph-design-system-theming` → no output
    - `rg -n "hero-body" skills/dooph-design-system-theming/references/token-contract.md` → 3 lines (:66, :69, :212)
    - `rg -n -- "--ui-icon-stroke-width: 2;|--ui-color-slider-step-inactive: var\(--ui-color-secondary-border\)|--ui-slider-track-primary-active-opacity: (50|60)%" src/styles/tokens.css` → 4 lines (the values the doc now states)
    - Compile check for the utility name, in a scratch dir outside the repo: an input of `@import "tailwindcss"; @import "<repo>/dist/theme.css";` built from a scratch-worktree build, with content `rounded-l-normal` → the output contains `.rounded-l-normal`
  - [ ] 4. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: the step-3 rg assertions hold; every value the two files state for stroke width, step-inactive, `-alt` mode, role count and track opacity matches tokens.css @ HEAD.
- log:
  - 2026-10-01 — created by audit

### WI-C2-02: Fix README's dead utility name, its font contract, and its licence lines
- status: todo
- addresses: [F-006, F-052, F-117]
- depends_on: []
- phase: P3
- risk: low — README prose and example code only; the Next.js example cannot be compiled offline (`next` is not installed), so the new loader lines mirror the theming skill's existing guidance and keep README:143's fallback sentence
- semver: patch
- files:
  - modify: `README.md:62-71,85-96,119,129-140,147,163-172,180,185,208-209 @ b436647`
- anchor:
  ```md
  README.md:95   axes: ["GRAD", "ROND", "wdth"],
  README.md:180  `p-md`, `gap-sm`, `rounded-standard`, or `font-label` in **your** code, your
  README.md:185  so your Tailwind learns every `--ui-*` token. Order matters — Tailwind first,
  README.md:208  MIT — see [LICENSE](./LICENSE) for the full text.  
  README.md:209  The "dooph" name and logo are not covered by the MIT license and remain trademarks of dooph software.
  ```
- why: README ships in the tarball and is the setup most consumers follow. Today it names a utility that generates nothing (F-006), never loads the mono face or the `opsz`/`slnt` axes (F-052), and links a licence file that does not exist (F-117 item 1).
- steps:
  - [ ] 1. Line edits:
    ```diff
    -`p-md`, `gap-sm`, `rounded-standard`, or `font-label` in **your** code, your
    +`p-md`, `gap-sm`, `rounded-normal`, or `font-label` in **your** code, your
    -so your Tailwind learns every `--ui-*` token. Order matters — Tailwind first,
    +so your Tailwind learns every dooph token that backs a utility. Order matters — Tailwind first,
    -MIT — see [LICENSE](./LICENSE) for the full text.  
    -The "dooph" name and logo are not covered by the MIT license and remain trademarks of dooph software.
    +MIT — see [LICENSE](./LICENSE.txt) for the full text.  
    +The "dooph" name and logo are not covered by the MIT license and remain trademarks of Dooph LLC.
    ```
    (`Dooph LLC` is the entity LICENSE.txt:3 names. If the trademark holder is a different entity, write that one instead, and keep README and LICENSE.txt consistent.)
  - [ ] 2. Font Contract block (:64-71): after the `--ui-font-hero` line, add
    ```css
    --ui-font-mono: "Google Sans Code", ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas, monospace;
    ```
    (the tokens.css:388-390 default), and after :75 add this paragraph:
    ```md
    Request every axis as a range, or the token that names it silently does nothing: Google Sans Flex needs `GRAD`, `ROND`, `opsz`, `slnt`, `wdth` and `wght`; Google Sans Code needs `MONO` (its proportional cut is `MONO 0`, so without the axis `MonoText` is not monospaced). The bundled `dooph-design-system-theming` skill (§3 Fonts) is the full contract.
    ```
  - [ ] 3. Next.js example: in the import (:85-89) add `Google_Sans_Code,`; change :95 to `axes: ["GRAD", "ROND", "opsz", "slnt", "wdth"],`; after the `bricolageGrotesque` loader (:109) add
    ```tsx
    const googleSansCode = Google_Sans_Code({
      subsets: ["latin"],
      variable: "--font-google-sans-code",
      display: "swap",
      axes: ["MONO"],
    });
    ```
    and append `${googleSansCode.variable}` to the `className` template on :119. In the app/theme.css block (:129-140), before the closing `}`, add
    ```css
      --ui-font-mono: var(--font-google-sans-code), ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    ```
    (the same mapping as theming SKILL.md:67).
  - [ ] 4. Vite example: after :147 add `Load Google Sans Flex and Google Sans Code with the axis ranges listed under Font Contract — a hosted provider \`<link>\` is the simplest route.` In the `:root` block (:163-172), before the closing `}`, add `  --ui-font-mono: "Google Sans Code", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;`.
  - [ ] 5. Verify:
    - `rg -n "rounded-standard|\./LICENSE\)|dooph software\.|\"GRAD\", \"ROND\", \"wdth\"" README.md` → no output
    - `rg -c "ui-font-mono" README.md` → 3; `rg -n "Google_Sans_Code|opsz" README.md` → at least the import, the loader and the axes line
    - `test -f LICENSE.txt && echo ok` → `ok`
  - [ ] 6. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: the step-5 assertions hold, and README's font section lists seven role tokens and the full Flex + Code axis set.
- log:
  - 2026-10-01 — created by audit

### WI-C2-03: Restore the v5 codemod's exit-code contract (1 while renames are pending, 2 on an unreadable root)
- status: todo
- addresses: [F-007]
- depends_on: []
- phase: P3
- risk: low — a consumer CI job that runs the dry run over an unmigrated app goes red. That is the documented intent ("works as a CI gate"). The danger REPORT stays advisory, so correct post-5.3.0 code that uses `--ui-color-danger*` never fails.
- semver: patch
- files:
  - modify: `skills/dooph-design-system-v5-migration/codemod.mjs:15-19,24-26,141-144 @ b436647`
  - modify: `skills/dooph-design-system-v5-migration/SKILL.md:30-31,86-87 @ b436647`
- anchor:
  ```js
  // codemod.mjs:141-144
  if (!WRITE && renamed.length) {
    console.log("\nRe-run with --write to apply the renames.");
  }
  process.exit(0);
  ```
- why: The skill makes the exit code its done-check and its expiry test (SKILL.md:3, :82), and R13.10 says to exit 0 only when nothing actionable remains. Today a dry run with pending `SiloIcon`/`BarChartIcon` renames, or one over a mistyped path, exits 0 (F-007).
- steps:
  - [ ] 1. Reproduce (scratch fixture only, never the repo's own src). In the session scratchpad, create `cm-fx/src/App.tsx` containing `import { SiloIcon, BarChartIcon } from "@dooph-software/design-system"; export const A = () => <><SiloIcon /><BarChartIcon /></>;` and `cm-fx/src/theme.css` containing `.x { color: var(--ui-color-danger); }`. Run `node skills/dooph-design-system-v5-migration/codemod.mjs <scratch>/cm-fx/src; echo EXIT=$?` → today `EXIT=0` (the defect). Run it again with `<scratch>/cm-fx/scr` → today `EXIT=0` (the defect).
  - [ ] 2. codemod.mjs — fail loudly on an unreadable root. After `const ROOT = …` (:26), insert:
    ```js
    /* An unreadable root must not look like a migrated app: walk() swallows
     * readdir errors for SUBdirectories, but a mistyped root would otherwise
     * print "nothing to rename" and exit 0. */
    try {
      if (!statSync(ROOT).isDirectory()) throw new Error("not a directory");
    } catch {
      console.error(`\ncodemod: cannot read directory "${ROOT}" — pass the folder to scan, e.g. ./src`);
      process.exit(2);
    }
    ```
  - [ ] 3. codemod.mjs — replace :144 `process.exit(0);` with:
    ```js
    /* Exit code is the skill's done-check ("must exit 0"): 1 while a dry run
     * still finds AUTO renames to apply — that work is actionable. The danger
     * REPORT never affects it; it is advisory (see the header). */
    process.exit(!WRITE && renamed.length ? 1 : 0);
    ```
    and after the header paragraph that ends at :19 (`code can stand in for.`) add, inside the same comment:
    ```js
     *
     * Exit codes: 0 = nothing actionable remains; 1 = a dry run found AUTO
     * renames still to apply; 2 = the directory could not be read.
    ```
    Leave :15's "5.4" wording alone; WI-C2-07 relabels it.
  - [ ] 4. SKILL.md — rewrite the two exit-code sentences:
    ```diff
    -Dry run by default; add `--write` to apply the renames. It works as a CI gate;
    -the danger-palette list it prints is advisory (see §2).
    +Dry run by default; add `--write` to apply the renames. It exits `0` when
    +nothing actionable remains, `1` while a dry run still finds icon renames to
    +apply, and `2` when the directory cannot be read — so it works as a CI gate on
    +the renames. The danger-palette list it prints is advisory and never changes
    +the exit code (see §2).
    -On 5.4+ the codemod exits 0 once the icon renames are applied; the danger list
    -it prints is advisory.
    +A dry run exits 0 only once the icon renames are applied; the danger list it
    +prints is advisory and never affects the exit code.
    ```
    SKILL.md:3 ("No longer applies once the codemod exits 0") and :82 (`# must exit 0`) are now true; leave them as they are.
  - [ ] 5. Verify (scratch fixture from step 1; copy it to `cm-fx-w` before any `--write`):
    - `node --check skills/dooph-design-system-v5-migration/codemod.mjs` → exit 0
    - dry run on `cm-fx/src` → `EXIT=1`, prints "Re-run with --write"
    - `--write` on `cm-fx-w/src` → `EXIT=0`; then a dry run on `cm-fx-w/src` → `EXIT=0` (the danger hit is still listed, advisory)
    - dry run on `cm-fx/scr` → `EXIT=2` with the "cannot read directory" message on stderr
    - `rg -n "It works as a CI gate;|On 5\.4\+ the codemod" skills/dooph-design-system-v5-migration/SKILL.md` → no output
  - [ ] 6. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: the four exit codes in step 5 are observed on the scratch fixture, and SKILL.md states the same contract.
- log:
  - 2026-10-01 — created by audit

### WI-C2-04: Make the usage skill's code compile — import `HeroText`, and name MorphRotationShape's and CTAButton's required props
- status: todo
- addresses: [F-008, F-046, F-117]
- depends_on: []
- phase: P3
- risk: low — four prose and example edits in one shipped skill
- semver: patch
- files:
  - modify: `skills/dooph-design-system-usage/SKILL.md:26-28,117-119,210,255 @ b436647`
- anchor:
  ```md
  SKILL.md:255  import { BodyText, Fonts, FontSizes, FontWeights, Tracking, FontAxes } from "@dooph-software/design-system";
  SKILL.md:210  - `MorphRotationShape` (shape morph primitive; required `mode`: `MorphRotationShapeMode.autoplay` | `.controlled` (activeIndex) | `.embedded` (set --ds-shape-morph-target from CSS state); give it a box, leave ~9% of the shape per side for rotation spill).
  SKILL.md:117  `CTAButton` (marketing CTA — fully round, padded outline ring on `primary`,
  SKILL.md:118  label-only hover roll; `CTAButtonVariant`: `primary` | `secondary`,
  SKILL.md:119  `CTAButtonSize`: `standard` | `big`).
  ```
- why: The skill's one fully-imported example fails with TS2304 (F-008, S1), and calls written from the inventory fail with TS2322/TS2739 (F-046). Golden Rule 1 lists 8 of the 10 role components (F-117 item 6).
- steps:
  - [ ] 1. Reproduce: copy SKILL.md:255-259 into `docs/audit/_work/scratch/C2/usage-check/typo.tsx` (wrap :257-259 in `export const X = () => <>…</>;`), copy `docs/audit/_work/scratch/U13/examples/tsconfig.json` beside it, and run `node C:/Users/stick/Github/dooph/dooph-ds-audit-build/node_modules/typescript/bin/tsc -p docs/audit/_work/scratch/C2/usage-check/tsconfig.json --pretty false` → today `TS2304: Cannot find name 'HeroText'`. (Use a fresh scratch-worktree build's `dist/index.d.ts` in the tsconfig `paths` when the audit build is gone.)
  - [ ] 2. Edits:
    ```diff
    -import { BodyText, Fonts, FontSizes, FontWeights, Tracking, FontAxes } from "@dooph-software/design-system";
    +import { BodyText, HeroText, Fonts, FontSizes, FontWeights, Tracking, FontAxes } from "@dooph-software/design-system";
    ```
    In :210, after `required \`mode\`: … \`.embedded\` (set --ds-shape-morph-target from CSS state)`, insert `; required \`shapes\`: two or more DS shape components in play order, e.g. \`[CloverShape, PuffShape]\` (see **Shapes**)`. (The **Shapes** entry is added by WI-C2-08. Until then, the e.g. names the components.)
    ```diff
    -  `CTAButton` (marketing CTA — fully round, padded outline ring on `primary`,
    -  label-only hover roll; `CTAButtonVariant`: `primary` | `secondary`,
    -  `CTAButtonSize`: `standard` | `big`).
    +  `CTAButton` (marketing CTA — fully round, padded outline ring on `primary`,
    +  label-only hover roll; REQUIRES `text` (the label string) and `icon` (a
    +  ReactNode); children are used only with `asChild`, as the link element;
    +  `CTAButtonVariant`: `primary` | `secondary`, `CTAButtonSize`: `standard` | `big`).
    ```
    In Golden Rule 1 (:27-28), change `` `SubheadingText`, `TitleText`, `HeroText`, `ButtonText`, `MonoText`). `` to `` `SubheadingText`, `TitleText`, `HeroText`, `HeroBodyText`, `ButtonText`, `HeroButtonText`, `MonoText`). ``.
  - [ ] 3. Verify: re-run step 1's tsc on the edited block → 0 errors. Add a probe `probe.tsx` that compiles `<MorphRotationShape mode={MorphRotationShapeMode.autoplay} shapes={[CloverShape, PuffShape]} />` and `<CTAButton text="Start" icon={<SearchIcon />} />` exactly as the edited prose describes them → 0 errors. Then `rg -n "HeroBodyText" skills/dooph-design-system-usage/SKILL.md` → it includes line 28.
  - [ ] 4. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: the typography example and the two inventory-derived calls compile against the shipped d.ts, and Golden Rule 1 names all ten role components.
- log:
  - 2026-10-01 — created by audit

### WI-C2-05: Stop the v3 migration skill from renaming `surface-page`, and make its done-check reachable
- status: todo
- addresses: [F-009]
- depends_on: []
- phase: P3
- risk: low — three prose and grep edits in a shipped skill; the defect is unreleased (introduced by 8a946e5 after v5.3.0), so this only fixes what the next publish ships
- semver: none
- files:
  - modify: `skills/dooph-design-system-v3-migration/SKILL.md:153-154,237,249-252 @ b436647`
- anchor:
  ```md
  - `bg-surface` — same: leave `bg-surface-secondary` alone; rename only bare
    `bg-surface` and `bg-surface-page`.
  …
  rg -n -e "destructive|surface-page|accent-color|--ui-color-logo|avatar-bg|text-logo|shadow-focus-destructive"
  ```
- why: :115 says to keep `--ui-color-surface-page`, but :154 says to rename `bg-surface-page`, and the :237 done-check flags every correct page-surface use, so "zero hits" (:254) cannot be reached without breaking the app (F-009, S1).
- steps:
  - [ ] 1. Edits:
    ```diff
    -- `bg-surface` — same: leave `bg-surface-secondary` alone; rename only bare
    -  `bg-surface` and `bg-surface-page`.
    +- `bg-surface` — same: leave `bg-surface-secondary` and `bg-surface-page` (the
    +  page surface, current under that name) alone; rename only bare `bg-surface`.
    -rg -n -e "destructive|surface-page|accent-color|--ui-color-logo|avatar-bg|text-logo|shadow-focus-destructive"
    +rg -n -e "destructive|accent-color|--ui-color-logo|avatar-bg|text-logo|shadow-focus-destructive"
    ```
    In the no-PCRE fallback paragraph (:249-252), change the allowed-name list `(\`-primary\`, \`-secondary\`, \`-popovers\`, \`-focus\`; \`bg-surface-secondary\`)` to `(\`-primary\`, \`-secondary\`, \`-popovers\`, \`-page\`; \`bg-surface-primary\`, \`bg-surface-secondary\`, \`bg-surface-page\`)`. `--ui-color-border-focus` was itself renamed to `--ui-color-input-border-focus`, so `-focus` is no longer an allowed survivor.
  - [ ] 2. Leave :197-198 ("Those are the only changed exports") and :222-224 (`ShapeButtons.star`, `DropdownMenuVariant`) to the release's R13.11 forward-compat pass in WI-RELEASE-MIGRATION, which points them at the next migration skill. Leave :125 ("CURRENT (5.4)") to WI-C2-07.
  - [ ] 3. Verify: `rg -n "surface-page" skills/dooph-design-system-v3-migration/SKILL.md` → only :115 (Unchanged list), :128 (rename note), the edited :153-154 "leave … alone" line, and the fallback allowed-name list (:249-252). Then run the edited Pass A command over a scratch file containing `bg-surface-page --ui-color-surface-page bg-surface` → no hits. Pass B (`rg -nP`) on the same file → only the bare `bg-surface`.
  - [ ] 4. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: no instruction in the skill renames `surface-page`, and an app already on current names reaches zero hits on Pass A.
- log:
  - 2026-10-01 — created by audit

### WI-C2-06: Correct LinearProgressIndicator's `color` JSDoc and header, and the LPI/Slider "Color prop" stories
- status: todo
- addresses: [F-010, F-047, F-117]
- depends_on: []
- phase: P3
- risk: low — comments and stories only; no runtime code changes. The header edit rewords a `## behavior` bullet per R10.4 and leaves both `## constraints` bullets untouched.
- semver: patch
- files:
  - modify: `src/components/LinearProgressIndicator/LinearProgressIndicator.tsx:8-9,29-30 @ b436647`
  - modify: `src/components/LinearProgressIndicator/LinearProgressIndicator.stories.tsx:53,90 @ b436647`
  - modify: `src/components/Slider/Slider.stories.tsx:206,212 @ b436647`
- anchor:
  ```tsx
  // LinearProgressIndicator.tsx:8-9
   * - Fill width animates when that percentage changes via registered
   *   `@property --progress-pct` (custom properties do not interpolate otherwise).
  // LinearProgressIndicator.tsx:29-30
    /** Filled-bar color. Accepts a DS token name ('primary', 'brand', 'text') or
     * any CSS color. Defaults to the primary token. */
  // LinearProgressIndicator.stories.tsx:53 and Slider.stories.tsx:212
        {(['primary', 'brand', 'text', 'error-primary'] as const).map((c) => (
  ```
- why: IntelliSense and both "Color prop" stories offer `brand`/`error-primary`, which resolve to a transparent fill (F-010, S1). The Slider story's description states a fixed 45% track opacity that became per-variant tokens (F-047). The LPI header credits the transition to `@property` registration, but plain `width`/`left` transitions drive it (F-117 item 23).
- steps:
  - [ ] 1. Reproduce: in Storybook, open `Progress/LinearProgressIndicator` → "Color prop" and run `[...document.querySelectorAll('.ds-progress-fill')].map(e => getComputedStyle(e).backgroundColor)` in the preview iframe → today two entries are `rgba(0, 0, 0, 0)` (brand, error-primary). `Inputs/Slider` → "Color prop" shows the same two broken rows.
  - [ ] 2. LinearProgressIndicator.tsx (header `## behavior` and prop JSDoc):
    ```diff
    - * - Fill width animates when that percentage changes via registered
    - *   `@property --progress-pct` (custom properties do not interpolate otherwise).
    + * - When that percentage changes, the fill's `width` and the remainder's
    + *   `left` transition (`ds-progress-fill` / `ds-progress-remainder`; off under
    + *   reduced motion).
    -  /** Filled-bar color. Accepts a DS token name ('primary', 'brand', 'text') or
    -   * any CSS color. Defaults to the primary token. */
    +  /** Filled-bar color. Accepts a `DS_COLOR_TOKENS` name ('primary',
    +   * 'prominent', 'text', 'danger-primary', …) or any CSS color. Defaults to
    +   * the primary token. */
    ```
    The `@property --progress-pct` registration itself (index.css:16-21) and its comment at dooph-component-tokens.css:126-127 are F-101's (member U1-F8) and stay untouched here.
  - [ ] 3. Stories: in LinearProgressIndicator.stories.tsx:53 and Slider.stories.tsx:212, change `(['primary', 'brand', 'text', 'error-primary'] as const)` → `(['primary', 'prominent', 'text', 'danger-primary'] as const)`. In LinearProgressIndicator.stories.tsx:90, change `<LabelText>Brand - Animated</LabelText>` → `<LabelText>Prominent - Animated</LabelText>`. In Slider.stories.tsx:206, change `The handle renders it solid and the active track renders it at 45%.` → `The handle renders it solid; the active track tints it at the variant's track opacity (\`--ui-slider-track-primary-active-opacity\`: 50% light, 60% dark).`
  - [ ] 4. Verify: `rg -n "'brand'|error-primary|Brand - Animated|at 45%" src/components/LinearProgressIndicator src/components/Slider` → no output. `npm run lint` → exit 0. Re-run step 1's getComputedStyle probe → no `rgba(0, 0, 0, 0)` entry, and the Slider "Color prop" rows all show a visible handle and track. In a scratch-worktree build, `rg -n "brand" dist/components/LinearProgressIndicator/LinearProgressIndicator.d.ts` → no output.
  - [ ] 5. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: no shipped JSDoc or story in these files names a colour key that `DS_COLOR_TOKENS` lacks; every "Color prop" sample paints; the LPI header describes the `width`/`left` transition.
- log:
  - 2026-10-01 — created by audit

### WI-C2-07: Rewrite the "5.4" narration to the chosen release version across skills, codemod and Button's header
- status: blocked(D-01)
- addresses: [F-013]
- depends_on: [WI-RELEASE-MIGRATION, WI-C2-01, WI-C2-03, WI-C2-13]
- phase: P4
- risk: medium — 40-odd label edits across 9 files. A blind global replace would hit SVG path numbers (`Shapes/svgs/*.svg`, `*Shape.tsx`, `ShowMoneyIcon.tsx`) and `.agents/skills/skill-creator/**` (`"overall_score": 5.4`), so step 1 limits the edit to a fixed file list
- semver: major
- files:
  - modify: `skills/dooph-design-system-theming/references/token-contract.md:17,19,21,23,41,42,43,56,59,60,87,88 @ b436647`
  - modify: `skills/dooph-design-system-v3-migration/SKILL.md:125 @ b436647`
  - modify: `skills/dooph-design-system-v5-migration/SKILL.md:17,18,49,50,62 @ b436647`
  - modify: `skills/dooph-design-system-v5-migration/codemod.mjs:15,44,124,125 @ b436647`
  - modify: `.agents/skills/dooph-ds-writing-version-migrations/SKILL.md:44-48,280,289,290 @ b436647`
  - modify: `.agents/skills/dooph-ds-architecture/SKILL.md:32,84 @ b436647`
  - modify: `.agents/skills/dooph-ds-codebase/SKILL.md:138,140,277,398,498,499,501,502,504,531 @ b436647`
  - modify: `src/components/Button/Button.tsx:19 @ b436647`
  - modify: `2026-09-20-visx-charts-design.md:659 @ b436647` (at its WI-C2-13 destination, `docs/superpowers/specs/2026-09-20-visx-charts-design.md`)
- anchor:
  ```md
  token-contract.md:17  … (renamed from `--ui-color-brand*` in 5.4, alongside `ButtonVariant.brand` → `.prominent`)
  vm:44  **The awkward case: a minor that renamed things.** 5.4 renamed most of the token
  vm:45  vocabulary in a minor. That was a mistake, and it is why the v3 and v5 migration
  vm:46  skills now carry inline "on 5.4 or later, read this differently" notes instead of
  vm:47  clean rename tables. If a rename is worth doing, it is worth a major. If it ships
  vm:48  in a minor anyway, you inherit the §7 forward-compat work below.
  Button.tsx:19   * - `prominent` was called `brand` before 5.4, in both the variant key and the
  ```
- why: No 5.4 exists. Under D-01's recommended option the renames ship as 6.0.0, and every line that narrates them as "5.4" becomes false in three shipped skills, the codemod, three authoring skills and a header contract (F-013). This WI is only the relabel. The release, the v6 migration skill and the R13.11 forward-compat pass on the v3/v5 skills (target columns, the :197/:223 annotations, codemod report text vs exit code) belong to WI-RELEASE-MIGRATION. The steps below assume D-01 = 6.0.0. If D-01 picks 5.4.0 instead, the labels become true at release, and this WI shrinks to step 2's vm:44-48 rewrite, which must then say that the minor was deliberate.
- steps:
  - [ ] 1. Mechanical relabel, limited to these files (no repo-wide replace):
    ```bash
    FILES="skills/dooph-design-system-theming/references/token-contract.md \
      skills/dooph-design-system-v3-migration/SKILL.md \
      skills/dooph-design-system-v5-migration/SKILL.md \
      skills/dooph-design-system-v5-migration/codemod.mjs \
      .agents/skills/dooph-ds-writing-version-migrations/SKILL.md \
      .agents/skills/dooph-ds-architecture/SKILL.md \
      .agents/skills/dooph-ds-codebase/SKILL.md \
      src/components/Button/Button.tsx"
    rg -n '\b5\.4\b' $FILES          # before: exactly the lines listed under files:
    sed -i 's/\b5\.4\b/6.0/g' $FILES
    ```
    Before running sed, confirm that the `rg` output contains only release-label hits (at b436647: 42 occurrences on 41 lines, none numeric; WI-C2-03 has already removed v5 SKILL.md:86, leaving 41). After it, v5 SKILL.md:17 reads `landing on **6.0 or later**`, :18 `the 6.0 token renames`, codemod.mjs:124 `EXIST again as of 6.0`, and Button.tsx:19 `` `prominent` was called `brand` before 6.0 ``. Button.tsx is a header contract: only the version label inside the `## constraints` bullet changes, and its rule ("Neither spelling survives.") stays.
  - [ ] 2. Rewrite vm:44-48 (a relabel alone would keep a false "renamed … in a minor" story):
    ```md
    **The awkward case: renames after an older migration skill shipped.** 6.0
    renamed most of the token vocabulary, which is why the v3 and v5 migration
    skills carry inline "on 6.0 or later, read this differently" notes instead of
    clean rename tables. If a rename is worth doing, it is worth a major. If one
    ever ships in a minor anyway, you inherit the §7 forward-compat work below.
    ```
  - [ ] 3. In v5 SKILL.md:18, after `the 6.0 token renames`, add ` (the \`dooph-design-system-v6-migration\` skill)` so the chain points at the new skill. In the charts design (:659), change `**Minor — 5.5.**` → `**Minor — 6.1.**`.
  - [ ] 4. Verify: `rg -n '\b5\.4\b' skills .agents src README.md CHANGELOG.md docs/superpowers --glob '!**/svgs/**' --glob '!**/*Shape.tsx' --glob '!**/ShowMoneyIcon.tsx' --glob '!.agents/skills/skill-creator/**'` → no output. `node --check skills/dooph-design-system-v5-migration/codemod.mjs` → exit 0. `npm run lint` → exit 0.
  - [ ] 5. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: no doc, skill, codemod or header narrates a "5.4" release, and every relabelled line names the version D-01 chose.
- log:
  - 2026-10-02 — orchestrator: WI-C3-18 (P1) deletes the "5.4" line at src/components/Button/Button.tsx:19; if it has landed, skip that line here (re-run the rg in this WI to get the live list).
  - 2026-10-01 — created by audit

### WI-C2-08: Add the missing public surface to the usage skill — AIChat, Shapes, icons, the Tooltip/Toast providers, and each listed component's variant/size const
- status: todo
- addresses: [F-048]
- depends_on: [WI-C2-04]
- phase: P3
- risk: low — additive prose in a shipped skill. The risk is a wrong fact, so each bullet below is taken from the component's own header/constants at b436647, and step 3 compiles the examples.
- semver: patch
- files:
  - modify: `skills/dooph-design-system-usage/SKILL.md:110-212 @ b436647` (Component Inventory)
- anchor:
  ```md
  SKILL.md:150  `PopoverPortal`, `PopoverClose`); `Tooltip` family.
  SKILL.md:191  `BaseIcon`, `ChevronDownIcon`, `SearchIcon`, `SidebarWithHoverIcon`.
  SKILL.md:207  - **Feedback / motion:** `Toast` family, `LoadingSpinner`, `ProgressIndicator`,
  SKILL.md:212  - **Utility:** `cn`.
  ```
- why: The skill says "Reach for these before writing local UI", but it never names the 17-component AIChat family, the Shapes that `MorphRotationShape` requires, the icon set, or the providers whose absence makes `<Tooltip>`/`useToast()` throw. It also leaves out the consts that Rule 1 requires instead of string literals (F-048).
- steps:
  - [ ] 1. Edit the Component Inventory (keep its one-bullet-per-area style). Exact content:
    - :150 `` `Tooltip` family. `` → `` `Tooltip` family (`Tooltip`, `TooltipTrigger`, `TooltipContent` with `variant`: `TooltipTypes.simple` | `.rich` | `.complex`, `TooltipTitle`, `TooltipBody`) — mount `TooltipProvider` once above them; a `Tooltip` without it throws. ``
    - :207 `` `Toast` family, `` → `` `Toast` family (mount `ToastProvider` once — it renders the viewport — then call `useToast().toast({ title, description, variant: ToastTypes.simple | .prominent | .danger | .complex, duration, action })`; `useToast` throws outside the provider; `ToastRoot`/`ToastTitle`/`ToastDescription`/`ToastAction`/`ToastClose`/`ToastViewport` are for custom composition), ``
    - In the same Feedback bullet, after `LoadingSpinner`, add `` (`LoadingSpinnerVariant`: `flat` | `spokes`; `LoadingSpinnerSize`: `sm` | `rg` | `md` | `xl`; `LoadingSpinnerColor`: `primary` | `prominent` or any CSS colour) ``; after `ProgressIndicator`, add `` (`ProgressIndicatorVariants`: `flat` | `wavy`; `progress` 0–1, throws outside it) ``; after `WavyDivider`, add `` (`WavyDividerVariant`: `high` | `low`) ``.
    - Navigation (:142-143): after `Tabs (+ …)`, add `` (`TabVariant`: `ghost` | `primary` | `unselected`; `TabSize`: `default` | `sm` | `micro` | `fill` | `icon` | `iconSm` | `iconMicro`) ``; after `SegmentedTabSelect (+ SegmentedTabItem)`, add `` (`SegmentedVariant`: `primary` | `ghost`; `SegmentedSize`: `container` | `standard` | `containerIcon` | `icon`) ``.
    - Inputs (:120): after `Input`, add `` (`InputVariant`: `text` | `number` | `iconText` | `iconNumber` — the two icon variants require `icon`) ``; after `Checkbox`, add `` (`CheckboxVariant`: `prominent` | `primary`; `CheckboxChecked`: `checked` | `unchecked` | `indeterminate`) ``; after `ToggleSwitch (+ ToggleSwitchItem)`, add `` (`ToggleVariant`: `primary` | `ghost` | `unselected`; `ToggleSize`: `default` | `sm` | `icon` | `iconSm`) ``.
    - Triggers (:141): after `TextDropdownTrigger`, add `` (`TextDropdownSize`: `default` | `sm`) ``. Menus (:133-140): after `DropdownMenuItem`, add `` (`variant`: `DropdownMenuItemVariant.default` | `.danger`) ``; after `DropdownMenuSegment`, add `` (`DropdownMenuSegmentVariant`: `divider` | `labeled`) ``. Layout (:154): after `Avatar`, add `` (`AvatarSize`: `standard` | `small`) ``.
    - :191 `` `BaseIcon`, `ChevronDownIcon`, `SearchIcon`, `SidebarWithHoverIcon`. `` → `` `SidebarWithHoverIcon`, and the icon set: 88 `*Icon` components on `BaseIcon` (`size`: `IconSize.sm` | `.rg` | `.md` | `.lg`, or a number) — check the package exports for an icon before drawing an SVG. ``
    - New bullet before `- **Utility:**` (:212):
      ```md
      - **Shapes:** `ArrowShape`, `CapsuleShape`, `CloverShape`, `CookieShape`,
        `DiamondShape`, `DoubleShape`, `PentagonShape`, `PixircleShape`, `PuffShape`,
        `SquircleShape`, `StarShape`, `TripleShape` (on `BaseShape`; each exports
        its outline as `<NAME>_SHAPE_PATH`, with `SHAPE_VIEWBOX_SIZE` and
        `ShapeClipPath`). These are what `MorphRotationShape`/`ShapeMorphSpinner`
        take as `shapes`.
      - **AI chat** (compose with your AI SDK; the package has no transport and no
        markdown dependency, and every string, clock and model list is yours):
        `AIPromptInput` (a `<form>`; `onSubmit` receives the trimmed text;
        `responding` + `onStop` turn submit into stop) with `AIPromptInputTextarea`,
        `AIPromptInputToolbar` (+ `AIPromptInputToolbarStart`/`…End`) and
        `AIPromptInputSubmit`; transcript parts `UserMessageHeader`, `AITextPart`
        (children = your markdown renderer; pass `streamingAnimation` only while
        THAT part streams), `AIThinkingPart` (`state`: `AIThinkingPartState.thinking`
        | `.thought`), `AIToolPart` (`state`: `AIToolPartState.active` | `.complete`
        | `.error` — map your SDK's part states onto these; `variant`:
        `AIToolPartVariant.simple` | `.skill`), `AITurnSummary` (render once the
        turn has settled) and `ChatDivider`; model-select parts composed inside a
        `DropdownMenu`: `AIModelSelectTrigger`, `AIModelSelectItem` (wrap items in
        `DropdownMenuRadioGroup`), `AIThinkingEffortSelector`,
        `AIModelTooltipContent`; and `AIContextGauge` (`used` / `budget`; NOT
        clamped — an out-of-range ratio throws, so keep the figures in range). No
        part holds a timer: elapsed labels are ticked by you and passed in.
      ```
  - [ ] 2. Cross-check the names in the new text against the package: for each backticked identifier added in step 1, `rg -n "\b<Name>\b" docs/audit/_work/dist-index.d.ts` (or the d.ts of a scratch-worktree build) → present. A one-liner over all of them: extract them with `rg -o '\`[A-Z][A-Za-z_]+\`'` from the diff and loop.
  - [ ] 3. Verify: `rg -c "AIPromptInput|TooltipProvider|ToastProvider|IconSize|CloverShape|TabVariant|InputVariant" skills/dooph-design-system-usage/SKILL.md` → ≥ 7 matching lines. A tsc probe (harness as in WI-C2-04 step 1) of `<TooltipProvider><Tooltip><TooltipTrigger asChild><Button>?</Button></TooltipTrigger><TooltipContent variant={TooltipTypes.rich}>x</TooltipContent></Tooltip></TooltipProvider>` and `<AIToolPart state={AIToolPartState.active}>Search</AIToolPart>` → 0 errors.
  - [ ] 4. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: the usage skill names the AIChat family with its consumer-owned responsibilities, the Shapes family, the icon set + `IconSize`, `TooltipProvider`/`ToastProvider`/`useToast`, and the variant/size const of every component it lists; every added name resolves in the shipped d.ts.
- log:
  - 2026-10-01 — created by audit

### WI-C2-09: Document the 65 missing tokens and four missing motion families in token-contract.md
- status: todo
- addresses: [F-048]
- depends_on: [WI-C2-01]
- phase: P3
- risk: low — additive prose. Every default quoted below was read from src/styles/tokens.css @ b436647, and step 2 re-checks the list against tokens.css mechanically. `--ui-shape-morph-ease` is a generated value: the doc describes it but never restates it.
- semver: patch
- files:
  - modify: `skills/dooph-design-system-theming/references/token-contract.md:13-23,83-90,115-131,140-201 @ b436647`
- anchor:
  ```md
  token-contract.md:146  Families: `--ui-roll-hover-*` (`RollHoverText`), `--ui-underline-link-*`
  token-contract.md:147  (`UnderlineLinkText`), `--ui-rolling-digits-*` (`RollingDigitsText`),
  token-contract.md:148  `--ui-sidebar-icon-*` (`SidebarWithHoverIcon`).
  ```
- why: The theming skill calls this file "the exhaustive list" (SKILL.md:221-222), but 65 of the 259 tokens are missing from it, 53 of which appear in no consumer doc. Consumers retuning chat, shape-morph, fade/reveal motion, CTA geometry or tooltip themes cannot find the knobs (F-048).
- steps:
  - [ ] 1. Add these entries (one bullet per family, defaults in parentheses; light / dark where they differ):
    - **Core Colors** (after :23): `--ui-color-selection` / `--ui-color-selection-foreground` — text-selection paint (alias `--ui-color-primary` / `-primary-foreground`); the package ships only the tokens — apply them with the `.ds-selection` opt-in class or your own `::selection` rule. · `--ui-color-ai-anthropic` (#e48844), `--ui-color-ai-gemini` (#154bff), `--ui-color-ai-openai` / `--ui-color-ai-spacexai` (#000000 light / #ffffff dark) — third-party model identity paints for badges or `AIModelSelect*` `color`; no component reads them by default.
    - New `## Tooltips` section (before `## Panel And Field Widths`): `--ui-color-tooltip-inverse-surface` / `-text` / `-border` (alias primary / primary-foreground / primary — the default `themeInverse` look) and `--ui-color-tooltip-matching-surface` / `-text` / `-border` (alias secondary / secondary-foreground / border-primary — `themeInverse={false}`).
    - **Sizing And Shape** (after :90): `--ui-size-checkbox` (18px), `--ui-size-code-digit` (46px, one `CodeDigitInput` cell), `--ui-height-tab-micro` (28px — `TabSize.micro`, micro `Sticker`), `--ui-radius-checkbox` (6px), `--ui-radius-avatar` (8px) / `--ui-radius-avatar-sm` (6px), `--ui-radius-calendar-day` (8px), `--ui-shadow-standard` (`0 0 4px 0 rgba(56,56,56,.1)` light / `rgba(0,0,0,.65)` dark).
    - New `## CTAButton` section (after Stickers): `--ui-color-border-cta` (rgba(56,56,56,.5) light / rgba(255,255,255,.35) dark — the padded outline ring), `--ui-shadow-cta`, `--ui-text-cta-standard` (24px) / `-big` (28px), `--ui-size-cta-chip-standard` (46px) / `-big` (60px), `--ui-size-cta-icon` (20px), `--ui-min-w-cta-content-standard` (330px) / `-big` (350px), `--ui-min-w-cta-pill-big` (370px), `--ui-spacing-cta-content-big` (60px).
    - **Motion → Families** (:146-148): append `` `--ui-fade-change-*` (`FadeChangeText`), `--ui-reveal-change-*` (`RevealChangeText`), `--ui-shape-morph-*` (`MorphRotationShape`, `ShapeMorphSpinner`, `DropdownCaret`), `--ui-chat-*` (the AIChat parts) ``, then add four subsections after `### Roll On Change`:
      - `### Fade On Change`: `--ui-fade-change-out-duration` / `-in-duration` / `-out-ease` / `-in-ease` / `-depth` — each defaults to its `--ui-roll-change-*` twin, so retuning the roll retunes the fade unless you override these.
      - `### Reveal On Change`: `--ui-reveal-change-in-duration` (420ms), `--ui-reveal-change-out-duration` (320ms), `--ui-reveal-change-ease` (`cubic-bezier(0.32, 0.72, 0, 1)`).
      - `### Shape Morph`: `--ui-shape-morph-duration` (498ms), `--ui-shape-morph-ease` (a generated `linear()` spring — override with any easing), `--ui-shape-morph-interval` (650ms, autoplay hold), `--ui-shape-morph-passive-spin-duration` (4666ms), `--ui-shape-morph-nudge` (0.15) / `-nudge-duration` (180ms) / `-nudge-ease` (`cubic-bezier(0.2, 0, 0, 1)`) — the hover lean.
      - `### AI Chat`: `--ui-chat-tool-shimmer-base` / `-highlight` and `--ui-chat-thinking-shimmer-base` / `-highlight` (re-base `ShimmerText` for the live tool/thinking rows), `--ui-chat-reveal-duration` (150ms) / `-ease`, `--ui-chat-stream-duration` (400ms) / `-ease` / `-blur` (3px) / `-rise` (4px) (`AITextPart streamingAnimation`), `--ui-chat-disclosure-duration` (200ms) / `-ease` (`AIThinkingPart`), `--ui-chat-prompt-max-height` (300px, the composer's growth cap), `--ui-chat-model-swatch-size` (10px) / `-radius` (3px), `--ui-width-chat-model-tooltip` (242px), `--ui-chat-prose-code-radius` (4px).
  - [ ] 2. Verify mechanically: `node -e` script (scratch) that reads every `--ui-[a-z0-9-]+:` declared in src/styles/tokens.css and every `--ui-[a-z0-9-]+` mentioned in token-contract.md (expanding `` `--ui-x` / `-y` `` shorthand by hand-listed prefixes, as scratch/V3/m9-tokens.mjs does) → "absent: 0". Running `node docs/audit/_work/scratch/V3/m9-tokens.mjs` after the edit should report 0 absent.
  - [ ] 3. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: every token declared in tokens.css is named in token-contract.md (literally, by family wildcard, or by `/ -suffix` shorthand), and the Motion "Families" line names all eight families.
- log:
  - 2026-10-01 — created by audit

### WI-C2-10: Rebuild CHANGELOG [Unreleased] from `git diff v5.3.0 HEAD`, and state a policy for v1.1.1–v5.3.0
- status: todo
- addresses: [F-049, F-048]
- depends_on: []
- phase: P1
- risk: low — CHANGELOG.md is not in the npm tarball. The risk is an incomplete list, so step 1 re-derives it mechanically before step 2 pastes it.
- semver: none
- files:
  - modify: `CHANGELOG.md:10-21 @ b436647`
  - modify: `CHANGELOG.md:23-25 @ b436647` (insert the history note per step 3)
- anchor:
  ```md
  ## [Unreleased]

  ### Added
  - `MorphRotationShape` — DS shapes that spring-morph into one another while turning (`autoplay`, `controlled`, `embedded` modes; `restingAngle`; per-instance `timing`).
  …
  ### Changed
  - `DropdownTrigger` and `TypeableDropdownTrigger` use `DropdownCaret` in place of the plain chevron; right padding is now 0.
  ```
- why: [Unreleased] is additive-only, although HEAD removes 7 exports, ~20 const members, 26 tokens, 19 preset keys and 4 helpers. Whoever cuts the release from this file would pick a minor (F-049, F-013), and the AIChat family has no entry at all (F-048 / U11-F10).
- steps:
  - [ ] 1. Re-derive the inventory (R13.5 — diff the tags, never memory) and check it against step 2's text: `git diff v5.3.0 HEAD -- src/index.ts "src/components/*/constants.ts" src/components/Icons/BaseIcon.tsx src/utils/color.ts`; removed tokens = `comm -23 <(git show v5.3.0:src/styles/tokens.css | rg -o -- '--ui-[a-z0-9-]+(?=:)' | sort -u) <(rg -o -- '--ui-[a-z0-9-]+(?=:)' src/styles/tokens.css | sort -u)` (use `rg -oP` for the lookahead) → 26; removed preset keys = the same over src/styles/theme.css with `--(color|radius|shadow|spacing|font|text)-[a-z0-9-]+(?=:)` → 19; removed helpers = the same over `\.ds-[a-z0-9-]+` in src/styles/*.css → 4. docs/audit/_work/units/U13.md §6 is the audit's copy of this inventory.
  - [ ] 2. Replace CHANGELOG.md:10-21 with:
    ```md
    ## [Unreleased]

    ### Removed (breaking — see the next migration skill)
    - `TwoWayToggle`, `TwoWayToggleItem` (and their `*Props`) — renamed `ToggleSwitch`, `ToggleSwitchItem`.
    - `DropdownMenuCheckboxItem` — renamed `DropdownMenuMultiSelectItem`.
    - `DropdownMenuVariant` and the `DropdownMenu` `variant` prop — items hold the 160px floor; set `DropdownMenuSection` `width` for a wider menu.
    - `GemShape`; `ShapeButtons.arrow`, `.gem` and `.star` (no replacement; `.diamond` and `.squircle` added).
    - Const members: `ButtonVariant.brand`, `CheckboxVariant.brand`, `LoadingSpinnerColor.brand` → `.prominent`; `ToastTypes.brand` / `.error` → `.prominent` / `.danger`; `IconSize.tiny` / `.standard` / `.medium` → `.sm` / `.rg` / `.md`; `ToggleVariant.secondary` → `.ghost`; `SegmentedVariant.ghostSmall` / `.micro` / `.secondary` / `.secondarySmall` / `.primarySmall` → `variant` (`primary` | `ghost`) × `SegmentedSize`.
    - `color` token names (`DS_COLOR_TOKENS`, used by `Slider*`, `LinearProgressIndicator`, `Sticker`, `AIModelSelect*`): `brand`, `error-primary`, `error-secondary`, `page-background`, `brand-color`, `brand-color-alt` → `prominent`, `danger-primary`, `danger-secondary`, `surface-page`, `prominent-color`, `prominent-color-alt`. The old strings still type-check and now paint nothing.
    - Tokens (26): `--ui-color-brand`, `-brand-border`, `-brand-hover`, `-brand-border-hover`, `-brand-active`, `-brand-border-active`, `-brand-foreground`, `-brand-border-disabled` → `--ui-color-prominent*`; `--ui-color-error-primary` / `-secondary` → `--ui-color-danger-primary` / `-secondary`; `--ui-color-page-background` → `--ui-color-surface-page`; `--ui-color-border-focus` → `--ui-color-input-border-focus`; `--ui-color-trigger-border-hover` → `--ui-color-input-border-hover`; `--ui-color-trigger-border-error-focus` → `--ui-color-input-border-danger-focus`; `--ui-color-focus-ring-brand` / `-error` → `-prominent` / `-danger`; `--ui-brand-color` / `-alt` → `--ui-prominent-color` / `-alt`; `--ui-icon-tiny` / `-standard` / `-medium` → `--ui-icon-sm` / `-rg` / `-md`; `--ui-icon-large` (20px) removed (nearest is the 18px `--ui-icon-lg`); `--ui-icon-stroke` → `--ui-icon-stroke-width`; `--ui-radius-standard` → `--ui-radius-normal`; `--ui-shadow-focus-brand` → `--ui-shadow-focus-prominent`; `--ui-min-w-menu-action` removed.
    - Tailwind preset keys (19 — these utilities no longer generate): `--color-brand`, `-brand-fg`, `-brand-hover`, `-brand-active`, `-brand-border`, `-brand-border-hover`, `-brand-border-active`, `-brand-border-disabled`, `--color-brand-color`, `-brand-color-alt`, `--color-error-primary`, `-error-secondary`, `--color-page-background`, `--color-border-focus`, `--color-trigger-border-hover`, `--color-trigger-border-error-focus`, `--radius-standard` (`rounded-standard`, `rounded-l-standard`, …), `--shadow-focus-brand`, `--shadow-focus-error`.
    - `ds-*` helpers: `ds-focus-ring-error-on-focus` → `ds-focus-ring-danger-on-focus`; `ds-menu-w-standard`, `ds-menu-w-action`, `ds-menu-w-complex` removed.

    ### Changed
    - Prominent palette: `--ui-color-prominent*` (ex-brand) is deep violet `#340fd9` and mode-invariant (was teal `#4f666d` with a dark override); identity `--ui-prominent-color` `#390ef8`, `-alt` `#13c29f` (the old `#44c0e5` is now `-ter`); focus rings retinted.
    - `SegmentedTabSelect` with no props now renders `primary` + `SegmentedSize.container` (was the `secondary` shell).
    - `--ui-height-tab-micro` 30px → 28px (`TabSize.micro`, micro `Sticker`).
    - Dark `--ui-color-focus-ring-primary` `rgba(23,23,23,.15)` → `rgba(249,249,249,.15)`; dark `--ui-color-input-border-focus` follows `--ui-color-prominent-border-active`.
    - `DropdownTrigger` and `TypeableDropdownTrigger` use `DropdownCaret` in place of the plain chevron; right padding is now 0.

    ### Added
    - `MorphRotationShape` — DS shapes that spring-morph into one another while turning (`autoplay`, `controlled`, `embedded` modes; `restingAngle`; per-instance `timing`).
    - `ShapeMorphSpinner` — M3 Expressive–style shape-morphing loader.
    - Tokens `--ui-shape-morph-duration`, `--ui-shape-morph-ease` (generated spring), `--ui-shape-morph-interval`, `--ui-shape-morph-passive-spin-duration`.
    - Every `Shapes` component exports its outline as `<NAME>_SHAPE_PATH`.
    - `DropdownCaret` — shape-morphing caret (Figma Dropdown Caret); hover leans the shape, open morphs it.
    - `MorphRotationShape` hover nudge: `--ds-shape-morph-nudge` input, `--ui-shape-morph-nudge`, `--ui-shape-morph-nudge-duration`, `--ui-shape-morph-nudge-ease` tokens.
    - AI chat family: `AIPromptInput` (+ `Textarea`, `Toolbar`, `ToolbarStart`, `ToolbarEnd`, `Submit`), `AITextPart`, `AIThinkingPart`, `AIToolPart`, `AITurnSummary`, `UserMessageHeader`, `ChatDivider`, `AIContextGauge`, `AIModelSelectTrigger`, `AIModelSelectItem`, `AIThinkingEffortSelector`, `AIModelTooltipContent`; consts `AIToolPartVariant`, `AIToolPartState`, `AIThinkingPartState`; `--ui-chat-*` and `--ui-color-ai-*` tokens.
    - `Sticker` (`StickerVariant`, `StickerSize`, `stickerVariants`) and `--ui-*sticker*` tokens.
    - `ToggleSwitch` / `ToggleSwitchItem`; `FadeChangeText` (`--ui-fade-change-*`); `HeroBodyText`, `HeroButtonText` (`--ui-text-hero-body` / `-button`, `text-style-hero-body` / `-button`).
    - Consts: `InputVariant`, `SegmentedSize`, `ShapeButtonVariant`, `SliderVariant`, `DropdownMenuSelectType`, `DropdownMenuSegmentVariant`, `DropdownCaretVariant`, `MorphRotationShapeMode`; members `TabSize.iconMicro`, `TabVariant.unselected`, `ToggleSize.icon` / `.iconSm`, `ToggleVariant.unselected`, `IconSize.lg`, `Tracking.mono`, `TextVariant.heroBody` / `.heroButton`.
    - Menu parts `DropdownMenuSegment`, `DropdownMenuPlainItem`, `DropdownMenuRadioSelectItem`; shapes `CapsuleShape`, `DiamondShape`, `DoubleShape`, `PixircleShape`, `SquircleShape`, `TripleShape`.
    - The `--ui-color-danger*` button state family under its v4 names (aliases of the secondary family and the two raw danger paints), `--ui-color-prominent*`, `--ui-color-input-border-*`, `--ui-spacing-xxxs`, `--ui-radius-mini`, `--ui-shadow-standard`, `--ui-tracking-mono`, slider paint tokens.
    ```
  - [ ] 3. Maintainer's choice — history policy for the 34 v-tags with no entry (v1.1.1, v1.1.2, v2.0.0 … v5.3.0; majors v2.0.0, v3.0.0, v4.0.0, v5.0.0; there is no v1.1.0 tag, and 30 unprefixed tags 1.0.0 … 4.4.0 plus 2.0.1-ci duplicate early releases — use the `v` tags). Pick one:
    - (a) Backfill one section per tag from `git diff <prev-v-tag> <v-tag> -- src/index.ts src/styles/tokens.css "src/components/*/constants.ts" package.json`, dated with `git log -1 --format=%cs <v-tag>`.
    - (b) Backfill only the four majors, each pointing at its migration skill (v3, v5; v4 shipped none — vm:56-61).
    - (c) Insert above `## [1.1.0]` (:25): `Releases v1.1.1 through v5.3.0 are not described here. Their changes are recorded in the git tags (\`git diff v<prev> v<next>\`) and, for v3 and v5, in the migration skills under \`skills/\`.`
  - [ ] 4. Verify: `rg -n "^### (Removed|Changed|Added)" CHANGELOG.md | head -3` → all three headings under [Unreleased]. `rg -c "TwoWayToggle|DropdownMenuCheckboxItem|DropdownMenuVariant|GemShape|ButtonVariant.brand|--ui-radius-standard|ds-menu-w-action|AIPromptInput" CHANGELOG.md` → ≥ 7 lines. The step-1 counts (26 / 19 / 4) match the Removed bullets.
  - [ ] 5. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: [Unreleased] lists every removal the step-1 diffs produce, under a `### Removed` heading, plus the AIChat/Sticker additions; the file states its history policy for v1.1.1–v5.3.0.
- log:
  - 2026-10-01 — created by audit

### WI-C2-11: Rewrite ProgressIndicator's stale `wavy` and `progress` JSDoc
- status: todo
- addresses: [F-050]
- depends_on: []
- phase: P3
- risk: low — comments only; they ship in dist/components/ProgressIndicator/*.d.ts
- semver: patch
- files:
  - modify: `src/components/ProgressIndicator/constants.ts:11-15 @ b436647`
  - modify: `src/components/ProgressIndicator/ProgressIndicator.tsx:45-48 @ b436647`
- anchor:
  ```ts
  // constants.ts:11-15
    /**
     * Polar sine-wave arc — indicator follows a wavy path generated from `progress`.
     * CSS path transitions are not applied (point count changes); drive `progress`
     * gradually from a spring/animation loop for smooth motion.
     */
  // ProgressIndicator.tsx:45-48
    /**
     * Progress value from 0 (empty) to 1 (complete).
     * Throws in development if the value is outside this range.
     */
  ```
- why: IntelliSense describes a regenerated sine path and a development-only throw. The code draws one stable rounded-star path revealed by a normalized dash, and it throws in every build (F-050).
- steps:
  - [ ] 1. Edits:
    ```diff
    -  /**
    -   * Polar sine-wave arc — indicator follows a wavy path generated from `progress`.
    -   * CSS path transitions are not applied (point count changes); drive `progress`
    -   * gradually from a spring/animation loop for smooth motion.
    -   */
    +  /**
    +   * Material 3 wavy arc — one stable rounded-star path for the whole circle,
    +   * revealed up to `progress` by a normalized stroke dash. The dash is not
    +   * transitioned, so drive `progress` gradually (e.g. from a spring loop) for
    +   * smooth motion.
    +   */
    -   * Throws in development if the value is outside this range.
    +   * Throws if the value is below 0 or above 1 — in every build.
    ```
  - [ ] 2. Verify: `rg -n "Polar sine-wave|point count changes|Throws in development" src/components/ProgressIndicator` → no output. `npm run lint` → exit 0. In a scratch-worktree build, `rg -n "Polar sine-wave|Throws in development" dist/components/ProgressIndicator` → no output.
  - [ ] 3. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: both shipped JSDoc blocks describe the dash-revealed stable path and the unconditional range throw.
- log:
  - 2026-10-01 — created by audit

### WI-C2-12: Point the CONTRIBUTING and SECURITY links at the real repository
- status: todo
- addresses: [F-053]
- depends_on: []
- phase: P1
- risk: low — two URLs in docs that are not in the tarball
- semver: none
- files:
  - modify: `CONTRIBUTING.md:7 @ b436647`
  - modify: `SECURITY.md:12 @ b436647`
- anchor:
  ```md
  CONTRIBUTING.md:7  To file a bug or question, open an [issue](https://github.com/dooph-software/dooph-Design-System/issues) — fixes are not guaranteed.
  SECURITY.md:12     **[Report a vulnerability](https://github.com/dooph-software/dooph-Design-System/security/advisories/new)**
  ```
- why: Both URLs return HTTP 404 (the `.` after `dooph` is missing), which leaves the only private disclosure channel unreachable (F-053).
- steps:
  - [ ] 1. Replace `github.com/dooph-software/dooph-Design-System/` with `github.com/dooph-software/dooph.-design-system/` in both lines (the form package.json:10 and :12 use).
  - [ ] 2. Verify: `rg -n "dooph-software/dooph-Design-System" CONTRIBUTING.md SECURITY.md README.md package.json` → no output. Open both URLs in a browser → the issues page and the advisory form load (the advisory form needs private vulnerability reporting enabled in the repo's Security settings; if it 404s while signed in, enable it there).
  - [ ] 3. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: both links resolve to the live repository's issues and advisory pages.
- log:
  - 2026-10-01 — created by audit

### WI-C2-13: Retire the completed executor prompt and implemented spec, and move the remaining planning documents under docs/superpowers/specs
- status: todo
- addresses: [F-109, F-117]
- depends_on: []
- phase: P1
- risk: low — none of the five files ships or is imported. The one live dependency is research:576, the Calendar "render nothing" decision that F-038/D-12 cite, so the research brief is moved rather than deleted. Note: the maintainer's global git ignore (`C:/Users/stick/.config/git/ignore:2`) ignores `docs/superpowers/`. `git mv` keeps the moved files tracked, as the existing spec there already is, but a file newly created there would not be picked up by `git add .`.
- semver: none
- files:
  - delete: `executor-prompt-oss-publication.md @ b436647`
  - delete: `docs/superpowers/specs/2026-08-31-digits-sidebar-mono-design.md @ b436647`
  - move: `.claude/research/2026-08-27-date-picker-foundation-research.md → docs/superpowers/specs/2026-08-27-date-picker-foundation-research.md` (modify :5)
  - move: `2026-09-20-visx-charts-design.md → docs/superpowers/specs/2026-09-20-visx-charts-design.md` (modify :335)
  - move: `2026-09-20-visx-charts-figma-checklist.md → docs/superpowers/specs/2026-09-20-visx-charts-figma-checklist.md`
- anchor:
  ```md
  executor-prompt:5          You are an executor agent. Your job is to produce concrete file content and configuration changes …
  digits-sidebar-mono:5      Status: decisions approved; implementation pending
  research:5                 **Status:** research only. No code was written and none is prescribed. …
  visx-charts-design:335     const seriesKey = series.map((s) => s.id).join("<NUL>");
  ```
- why: An instruction-shaped prompt with a now-false "Current repo state" sits at the root, and an implemented spec and the research brief read as current (F-109). The maintainer's own precedent (c05b59d) deletes implemented plans. The literal NUL makes greps skip the charts design.
- steps:
  - [ ] 1. `git rm executor-prompt-oss-publication.md docs/superpowers/specs/2026-08-31-digits-sidebar-mono-design.md` (git history keeps both; c05b59d is the precedent). This also resolves F-117 item 36.
  - [ ] 2. `git mv .claude/research/2026-08-27-date-picker-foundation-research.md docs/superpowers/specs/2026-08-27-date-picker-foundation-research.md`, then replace its line 5 (`**Status:** research only. No code was written …`) with:
    ```md
    **Status:** historical. Calendar, DatePicker and Popover shipped from this brief (`src/components/{Calendar,DatePicker,Popover}`); §§1–5 describe the landscape before implementation and §6.4's "no Popover" no longer holds. §11's enforcement line ("`console.warn` in development … and render nothing rather than crashing") remains the recorded Calendar decision.
    ```
  - [ ] 3. `git mv 2026-09-20-visx-charts-design.md docs/superpowers/specs/2026-09-20-visx-charts-design.md` and `git mv 2026-09-20-visx-charts-figma-checklist.md docs/superpowers/specs/2026-09-20-visx-charts-figma-checklist.md`. The checklist cites the design by bare filename (:3), and that still resolves because both sit in the same folder. Replace the NUL byte at the design's :335 with the escape `\0`: `node -e "const f='docs/superpowers/specs/2026-09-20-visx-charts-design.md';const fs=require('fs');fs.writeFileSync(f,fs.readFileSync(f,'utf8').replace(/\u0000/g,'\\\\0'))"`. (The design's ":659 Minor — 5.5" is relabelled by WI-C2-07.)
  - [ ] 4. Verify: `git ls-files | rg "^(executor-prompt|2026-09-20)|\.claude/research|digits-sidebar-mono"` → no output; `git ls-files docs/superpowers/specs` → the moved files plus `2026-09-23-…` if tracked; `node -e "process.exit(require('fs').readFileSync('docs/superpowers/specs/2026-09-20-visx-charts-design.md').includes(0)?1:0)"` → exit 0; `rg -c "join\(\"\\\\0\"\)" docs/superpowers/specs/2026-09-20-visx-charts-design.md` → 1.
  - [ ] 5. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: no planning document is tracked at the repo root or under `.claude/`; the remaining three carry accurate status lines; the charts design is plain text.
- log:
  - 2026-10-01 — created by audit

### WI-C2-14: Correct stale facts, a wrong rule number and a broken list in the authoring skills
- status: todo
- addresses: [F-117, F-047]
- depends_on: []
- phase: P1
- risk: low — internal skill prose; edit the canonical `.agents/skills/` copies only (the `.claude/skills` entries are links or junctions, F-058). Codebase SKILL.md:542 is also a location of F-099 (U1-F15), so whichever WI lands second drops that line.
- semver: none
- files:
  - modify: `.agents/skills/dooph-ds-codebase/SKILL.md:30,307,398,435,456,542,616-646 @ b436647`
  - modify: `.agents/skills/dooph-ds-architecture/SKILL.md:78,253 @ b436647`
  - modify: `.agents/skills/dooph-ds-contribution/SKILL.md:110 @ b436647`
- anchor:
  ```md
  codebase:435  listeners to a node it did not own — see the architecture skill's Rule 6.
  codebase:616  Conventions that hold across the surface:
  codebase:618  - Components and their `*Props` types come from the component's `index.ts`.
  codebase:619  ### `"use client"` — only where a client-only hook forces it
  contrib:110   4. Reference the new Tailwind utility (e.g. `h-tab`) in the component — never the raw `var(--ui-*)`.
  ```
- why: Each line sends the next agent to the wrong place or value: the ancestor-query rule is Rule 7, not 6; stroke is 2; the slider fill/dot description predates the opacity tokens; the `h-tab` example does not exist; and an H3 splits the "Conventions" list, so two surface conventions read as "use client" notes (F-117 items 7, 8, 10, 12-15; F-047 internal copies).
- steps:
  - [ ] 1. codebase SKILL.md:
    - :435 `see the architecture skill's Rule 6.` → `see the architecture skill's Rule 7.`
    - :30 `` `color` prop on Slider*/LinearProgressIndicator: a token `` → `` `color` prop on Slider*/LinearProgressIndicator/Sticker (custom)/AIModelSelect*: a token `` (re-wrap the comment column if needed)
    - :307 `see \`dooph-ds-loading-indicators\` skill for the wave/geometry model` → `see \`dooph-ds-loading-indicators\` skill for spinner geometry and the rAF model` (the wave belongs to ProgressIndicator)
    - :398 `stroke from \`--ui-icon-stroke-width\`, 1.5)` → `stroke from \`--ui-icon-stroke-width\`, 2)` (leave the line's "Renamed in 5.4" for WI-C2-07)
    - :456 `Widths are pinned per variant, matching \`ToastTypes.simple\`/\`.complex\`.` → `Widths are pinned per variant: the simple width serves \`ToastTypes.simple\`, \`.prominent\` and \`.danger\`; the complex width serves \`.complex\`.`
    - :542 `` `ds-slider-fill` (45% of `--ds-slider-color` — Figma applies alpha over the color, which Tailwind's `bg-primary/45` shorthand can't express against a custom property) `` → `` `ds-slider-fill` (`--ds-slider-color` mixed at `--ds-slider-track-opacity`, which the root sets from `--ui-slider-track-{primary,prominent}-active-opacity` — an alpha over a custom-property colour, which Tailwind's `bg-x/NN` shorthand can't express) ``, and `` (inactive `--ui-color-secondary-border`, active `--ui-color-text` at 40%) `` → `` (inactive `--ui-color-slider-step-inactive`; active `--ds-slider-step-active` → `--ui-color-slider-step-{primary,prominent}-active`) ``
    - :616-646: move the two convention bullets at :638-646 (`- Dot-accessible consts live in a sibling **\`constants.ts\` with no \`"use client"\`** …` through `… config change is needed.`) up to directly after :618, so the "Conventions that hold across the surface:" list is contiguous and the `### "use client"` heading follows it.
  - [ ] 2. architecture SKILL.md:
    - :78 `` `DS_COLOR_TOKENS` via the `color` prop (`Slider*`, `LinearProgressIndicator`). `` → `` `DS_COLOR_TOKENS` via the `color` prop (`Slider*`, `LinearProgressIndicator`, `Sticker` custom, `AIModelSelect*`). ``
    - :253 `Roles whose faces implement no axes (label/title/hero) ship no token.` → `Roles whose faces implement none of these axes ship no token (label: Host Grotesk, \`wght\` only; title/hero: Bricolage Grotesque, \`opsz\`/\`wght\` only).`
  - [ ] 3. contribution SKILL.md:110 `(e.g. \`h-tab\`)` → `(e.g. \`h-tab-micro\`)`.
  - [ ] 4. Verify: `rg -n "Rule 6\.$|, 1\.5\)|45% of|at 40%|e\.g\. \`h-tab\`\)|implement no axes" .agents/skills/dooph-ds-codebase/SKILL.md .agents/skills/dooph-ds-architecture/SKILL.md .agents/skills/dooph-ds-contribution/SKILL.md` → no output. `rg -n "^Conventions that hold|^### \`\"use client\"\`" .agents/skills/dooph-ds-codebase/SKILL.md` → the heading line number is greater than the last convention bullet's. `rg -n "h-tab-micro" src/styles/index.css` → the utility exists.
  - [ ] 5. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: the step-4 assertions hold.
- log:
  - 2026-10-01 — created by audit

### WI-C2-15: Reword source comments and header lines that misdescribe the code, and drop three no-op constructs
- status: todo
- addresses: [F-117, F-047]
- depends_on: []
- phase: P1
- risk: low — comments, one identical type alias, one invisible SVG path, and two no-op `?? undefined` coalesces (the props are typed `string | undefined`). Three header contracts change wording only: the `## constraints` rules stay intact (see F-117's contract field). Icons/index.ts is regenerated through its generator, never hand-edited. dooph-component-tokens.css:115 is also an F-101 location (U1-F8), so whichever WI lands second drops that line.
- semver: none
- files:
  - modify: `src/components/AnimatedText/FadeChangeText.tsx:24-26 @ b436647`
  - modify: `src/components/AnimatedText/RollChangeText.tsx:19-22 @ b436647`
  - modify: `src/components/AnimatedText/RevealChangeText.tsx:23-25 @ b436647`
  - modify: `src/components/AnimatedText/RollingDigitsText.tsx:128-131 @ b436647`
  - modify: `src/components/Text/BaseText.tsx:41 @ b436647`
  - modify: `src/components/Sheet/Sheet.tsx:63-65 @ b436647`
  - modify: `src/components/Sheet/Sheet.stories.tsx:158-159 @ b436647`
  - modify: `src/components/LoadingSpinner/spinnerGeometry.ts:42,49-51 @ b436647`
  - modify: `src/components/ProgressIndicator/ProgressIndicator.tsx:55-57 @ b436647`
  - modify: `src/components/MorphRotationShape/engine/{cubic,morph,polygon,utils}.ts:7 @ b436647`
  - modify: `src/components/SidebarWithHoverIcon/SidebarWithHoverIcon.tsx:31 @ b436647`
  - modify: `src/components/Icons/ShowMoneyIcon.tsx:6 @ b436647`
  - modify: `src/components/Icons/BaseIcon.tsx:59 @ b436647`
  - modify: `src/components/Shapes/BaseShape.tsx:61 @ b436647`
  - modify: `src/styles/dooph-component-tokens.css:115 @ b436647`
  - modify: `scripts/generate-icon-exports.mjs:39 @ b436647` (then regenerate `src/components/Icons/index.ts`)
- anchor:
  ```ts
  // FadeChangeText.tsx:24-26
   * - Nothing here may hold a duration. Timing, easing, depth and the
   *   reduced-motion case are `--ui-fade-change-*` tokens (defaulting to the
   *   roll-change values) read by `.ds-fade-change-*` in index.css.
  // cubic.ts:7 (identical in morph.ts, polygon.ts, utils.ts)
   * - Keep this file a faithful port. Behaviour fixes belong in ../svgPath.ts
  // spinnerGeometry.ts:49-51
   * Duration in ms for one full animation cycle.
   * Matches Material Design's indeterminate circular progress timing (1.4 s).
   */
  ```
- why: Each line teaches the next maintainer something false: that reduced motion is an overridable token, that `transitionend` reaches an `onAnimationEnd` guard, that BaseText is the only typography path, that consumer widths always win on Sheet, that 1.8 s matches Material's 1.4 s, that the engine fix file lives at `../svgPath.ts`, and that the slider fill is a fixed 45% (F-117 items 17-22, 25, 29-30, 32-34; F-047).
- steps:
  - [ ] 1. Header/comment rewording (constraint rules unchanged):
    - FadeChangeText.tsx:24-26 → ` * - Nothing here may hold a duration. Timing, easing and depth are` / ` *   \`--ui-fade-change-*\` tokens (defaulting to the roll-change values) read by` / ` *   \`.ds-fade-change-*\` in index.css; reduced motion is that file's @media rule` / ` *   (\`animation-duration: 1ms\`).`
    - RollChangeText.tsx:19-21 `Timing, easing, depth, blur and the` / `reduced-motion case are all \`--ui-roll-change-*\` tokens read by` / `\`.ds-roll-change-*\` in index.css;` → `Timing, easing, depth and blur are all` / `\`--ui-roll-change-*\` tokens read by \`.ds-roll-change-*\` in index.css, and` / `reduced motion is that file's @media rule (\`animation-duration: 1ms\`);` (keep the rest of the sentence, starting `out (200ms)`)
    - RevealChangeText.tsx:23-25 `Timing, easing and the reduced-motion` / `case are \`--ui-reveal-change-*\` tokens read by \`.ds-reveal-change\` in` / `index.css. Reduced motion drops those to 1ms` → `Timing and easing are` / `\`--ui-reveal-change-*\` tokens read by \`.ds-reveal-change\` in index.css.` / `Reduced motion (an @media rule there) drops the duration to 1ms` (keep the rest of the sentence)
    - RollingDigitsText.tsx:128-131 → `/* Only the wheel reports; its separator is a sibling that unmounts with` / ` * it. Guarded on the target because an animation a consumer puts on the` / ` * content would otherwise bubble its own animationend here. */`
    - BaseText.tsx:41 → ` * BaseText — the typography primitive behind every role component and consumer text (DS controls such as Button apply \`text-style-*\` classes directly).`
    - Sheet.tsx:63-65 → ` * Default cross-axis size: left/right sheets are \`w-3/4 max-w-96\`, so a` / ` * consumer width needs a \`max-w-*\` override too (e.g. \`w-[540px] max-w-none\`);` / ` * top/bottom sheets size to their content (no default height).`
    - Sheet.stories.tsx:158-159 → `Cross-axis size is overridable via className — override max-w-* along` / `with the width, since the default caps it at max-w-96.`
    - spinnerGeometry.ts:42 → `/** Stroke width per size, in viewBox user units — the rendered size comes from the --ui-size-spinner-* token and the stroke scales with it. */`; :50 → ` * Material's indeterminate circular progress cycles in 1.4 s; this one is 1.8 s.`
    - engine/{cubic,morph,polygon,utils}.ts:7 `../svgPath.ts` → `./svgPath.ts`
    - SidebarWithHoverIcon.tsx:31 `One \`getComputedStyle\` pair per frame per icon.` → `One \`getComputedStyle\` call (two property reads) per frame per icon.`
    - dooph-component-tokens.css:115 `/* Active slider track — the handle color at 45% (Figma applies alpha on top).` → `/* Active slider track — the handle color at --ds-slider-track-opacity (the variant's --ui-slider-track-*-active-opacity; Figma applies alpha on top).`
  - [ ] 2. No-op code (behaviour unchanged):
    ```diff
    # ProgressIndicator.tsx:55-57
    -  color?:
    -    | (typeof LoadingSpinnerColor)[keyof typeof LoadingSpinnerColor]
    -    | (string & {});
    +  color?: LoadingSpinnerColor | (string & {});
    # ShowMoneyIcon.tsx:6 — delete Tabler's invisible bounding box
    -      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    # BaseIcon.tsx:59
    -      fill: fillColor ?? undefined,
    +      fill: fillColor,
    # BaseShape.tsx:61
    -      strokeColor={strokeColor ?? undefined}
    +      strokeColor={strokeColor}
    ```
    (`LoadingSpinnerColor` is already imported from `../LoadingSpinner/constants`, and that import carries the same-name type.)
  - [ ] 3. Generated header: in scripts/generate-icon-exports.mjs:39, change `'// This file is generated by scripts/generate-icon-exports.mjs.',` → `'// AUTO-GENERATED by scripts/generate-icon-exports.mjs. Do not edit by hand.',` then run `npm run generate-icon-exports` → `git diff --stat src/components/Icons/index.ts` shows a 1-line change.
  - [ ] 4. Verify: `npm run lint` → exit 0. `rg -n "reduced-motion case are|roll's own transitionend|every visible string in the system|fully overridable via \`className\`|\(1\.4 s\)|Stroke width in px|\.\./svgPath\.ts|getComputedStyle\` pair|at 45%" src` → no output. A scratch-worktree `npm run build` succeeds and `git status --porcelain` in that worktree is empty after the build (no generated drift beyond step 3). In Storybook `Overlays/Sheet` → "Custom width", the panel still renders 540px wide.
  - [ ] 5. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: the step-4 assertions hold and the regenerated Icons/index.ts carries the R11.12 header form.
- log:
  - 2026-10-01 — created by audit

### WI-C2-16: Refresh the file-header-contracts worked example upstream so it stops showing `ButtonVariant.brand` and an `error-primary` utility
- status: todo
- addresses: [F-117]
- depends_on: []
- phase: P1
- risk: low — an illustrative example in a vendored skill. Editing only the local copy would be overwritten on the next re-pull (skills-lock.json:4-9 records `dooph-software/dooph-skills`), so the edit is made upstream first.
- semver: none
- files:
  - modify (upstream): `dooph-software/dooph-skills` → `skills/file-header-contracts/SKILL.md` (the `## Example` block)
  - modify (re-pulled): `.agents/skills/file-header-contracts/SKILL.md:148-151 @ b436647` (`.claude/skills/file-header-contracts` is a junction to it)
  - modify (re-pulled): `skills-lock.json:8 @ b436647` (`computedHash`)
- anchor:
  ```tsx
   * ## constraints
   * - Do NOT reintroduce `--ui-color-danger*` tokens; the danger variant paints
   *   secondary + error-primary/secondary utilities directly so consumers can
   *   still override those families independently.
   * - Keep `ButtonVariant.brand` in the API even if icon stories omit it.
  ```
- why: The skill an agent loads to WRITE header contracts shows, as its model answer, two constraints that are now the opposite of the live Button.tsx contract and arch:32 (F-117 item 16; V4 M24 downgraded this to S4 because the example illustrates format and instructs nothing).
- steps:
  - [ ] 1. In the upstream repo, replace the example's two constraint bullets with the live Button.tsx:12-21 wording, shortened:
    ```tsx
     * ## constraints
     * - The `danger` variant paints the `--ui-color-danger-*` STATE family, not
     *   the raw `--ui-color-danger-primary`/`-secondary` paints — the indirection
     *   lets a consumer retune the danger button alone. Do not collapse it back.
     * - Keep `ButtonVariant.prominent` in the API even if icon stories omit it.
    ```
  - [ ] 2. Re-pull `file-header-contracts` into `.agents/skills/` with the tool that maintains skills-lock.json, so that `computedHash` matches the new upstream file.
  - [ ] 3. Verify: `rg -n "ButtonVariant\.brand|error-primary" .agents/skills/file-header-contracts` → no output; `git diff skills-lock.json` → only the `file-header-contracts` `computedHash` changed.
  - [ ] 4. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: the vendored example matches the repo's live Button contract, and the lock hash matches upstream.
- log:
  - 2026-10-01 — created by audit

## DONE
