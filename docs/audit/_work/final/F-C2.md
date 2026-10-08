# F-C2 — final findings (composer C2) @ b436647

### F-006: The shipped theming docs present `rounded-l-standard` and `rounded-standard` as current utilities, but the preset generates neither
- severity: S1
- category: doc-drift
- rules: [R13.2, R13.11]
- scope: consumer-visible
- confidence: confirmed
- verified_by: "U13 check-names.cjs resolved every backticked utility in the consumer docs against HEAD theme.css @theme keys (2 presented-as-current misses); V4 compiled the audit-build Tailwind 4.3.3 CLI over node_modules/tailwindcss + dist/theme.css with content `rounded-l-standard rounded-standard rounded-l-normal rounded-normal` → only `.rounded-normal` and `.rounded-l-normal` emitted (verdict PARTIAL: S1 holds for exactly these two names)."
- locations:
  - skills/dooph-design-system-theming/references/token-contract.md:210
  - README.md:180
  - src/styles/theme.css:120-127
- evidence: |
    token-contract.md:210  - Radii: `rounded-tight`, `rounded-normal`, `rounded-soft`, `rounded-slider-inner` (v3, and directional variants such as `rounded-l-standard`)
    token-contract.md:88   `--ui-radius-normal` (renamed from `--ui-radius-standard` in 5.4; utility `rounded-standard` → `rounded-normal`)
    README.md:180          `p-md`, `gap-sm`, `rounded-standard`, or `font-label` in **your** code, your
    theme.css:120-123      --radius-tight: var(--ui-radius-tight);  --radius-mini: …;  --radius-normal: var(--ui-radius-normal);  --radius-soft: …;   (no --radius-standard; v5.3.0 theme.css:102 had `--radius-standard: var(--ui-radius-standard);`)
    Claims register: C-TC-29 (FALSE), C-README-12 (FALSE).
- impact: A consumer (or their agent) that copies either name into app code gets no CSS rule from the shipped preset and therefore silently square corners — no build error, no warning. token-contract.md is the file the theming skill bills as the exhaustive list, and README.md is the first setup doc in the tarball (pack.txt ships both). Mitigation: token-contract.md:88 documents the rename two sections above the stale example, so that file contradicts itself rather than being uniformly wrong; README:180 sits in a "without the preset these don't generate" sentence, so it is wrong by implication (that the preset fixes it). Both names were correct for published 5.3.0 and are wrong for the HEAD they ship beside.
- recommendation: Name the current utilities (`rounded-l-normal`, `rounded-normal`) in both places.
- breaking: none
- contract: n/a
- remediation: [WI-C2-01, WI-C2-02]
- related: [F-013, F-047]

### F-007: The v5 migration codemod exits 0 unconditionally (v5.3.0's exited 1 on hits), so the skill's CI-gate, done-check and expiry claims are false
- severity: S1
- category: doc-drift
- rules: [R13.10, R13.11]
- scope: consumer-visible
- confidence: confirmed
- verified_by: "U13 ran the codemod read-only on scratch/U13/codemod-fixture (SiloIcon, BarChartIcon, --ui-color-danger) → 'WOULD RENAME … Re-run with --write', EXIT=0; V1 re-ran it on scratch/V1/codemod-fx → EXIT=0 with two pending renames, and EXIT=0 on a nonexistent path ('nothing to rename' / 'none found'); `git show v5.3.0:…/codemod.mjs:139` = `process.exit(manual.length ? 1 : 0);`."
- locations:
  - skills/dooph-design-system-v5-migration/codemod.mjs:15-19
  - skills/dooph-design-system-v5-migration/codemod.mjs:51-57
  - skills/dooph-design-system-v5-migration/codemod.mjs:141-144
  - skills/dooph-design-system-v5-migration/SKILL.md:3
  - skills/dooph-design-system-v5-migration/SKILL.md:30-31
  - skills/dooph-design-system-v5-migration/SKILL.md:82
  - skills/dooph-design-system-v5-migration/SKILL.md:86-87
- evidence: |
    codemod.mjs:15   * The danger report is ADVISORY and does not fail the run: 5.4 reinstated every
    codemod.mjs:55   } catch {
    codemod.mjs:56     return out;
    codemod.mjs:141  if (!WRITE && renamed.length) {
    codemod.mjs:142    console.log("\nRe-run with --write to apply the renames.");
    codemod.mjs:144  process.exit(0);
    SKILL.md:3       … A one-time breaking upgrade. No longer applies once the codemod exits 0.
    SKILL.md:30      Dry run by default; add `--write` to apply the renames. It works as a CI gate;
    SKILL.md:82      node .../codemod.mjs ./src          # must exit 0
    SKILL.md:86      On 5.4+ the codemod exits 0 once the icon renames are applied; the danger list
    v5.3.0 codemod.mjs:15   * Exit 1 while any REPORT item remains, so CI can gate on it.
    v5.3.0 codemod.mjs:139  process.exit(manual.length ? 1 : 0);
    Claims register: C-V5-3 (FALSE "works as a CI gate").
- impact: The consumer's agent is told the migration is done when the codemod exits 0 (SKILL.md:3 expiry, :82 done-check). Because the exit is unconditional, a dry run over an app still importing `SiloIcon` (a build break) and `BarChartIcon` (the silent wrong-glyph break this skill exists for) exits 0, so the done-check and the expiry test pass before any work is done, and a CI gate built on it can never fail. A mistyped path (`./scr`) also exits 0, because `walk()` swallows the `readdirSync` error, and prints the same output as a migrated app. R13.10 (vm:256-258) makes the exit code a contract: exit 0 "unless something genuinely actionable remains", and pending AUTO renames are actionable. HEAD made the danger list advisory on purpose, because the tokens are back, but it removed the only non-zero exit along with it. The defect is unreleased: published v5.3.0 still exits 1 on danger hits, so it ships at the next publish. Mitigation: the dry-run output still lists the pending renames to a human who reads it. Only the automated gate and the expiry test are broken.
- recommendation: Restore the documented contract. Exit non-zero while AUTO renames are pending in a dry run, and fail loudly on an unreadable root. Keep the danger REPORT advisory. Make SKILL.md:30-31/:86-87 describe exactly that.
- breaking: none
- contract: n/a
- remediation: [WI-C2-03]
- related: [F-013, F-009]

### F-008: The usage skill's typography example uses `HeroText` without importing it, so the block fails to compile (TS2304)
- severity: S1
- category: doc-drift
- rules: []
- scope: consumer-visible
- confidence: confirmed
- verified_by: "U13 scratch/U13/examples/ex06_usage_L254.tsx (import line verbatim) → tsc 5.9.3 `TS2304: Cannot find name 'HeroText'`; ex06b with HeroText imported → 0 errors. V2 re-extracted it independently (scratch/V2/tsc/usage_typo.tsx → `(5,2): error TS2304: Cannot find name 'HeroText'`, control usage_typo_fixed.tsx clean)."
- locations:
  - skills/dooph-design-system-usage/SKILL.md:255
  - skills/dooph-design-system-usage/SKILL.md:259
- evidence: |
    SKILL.md:255  import { BodyText, Fonts, FontSizes, FontWeights, Tracking, FontAxes } from "@dooph-software/design-system";
    SKILL.md:259  <HeroText as="h1" lineHeight={1.05}>Dashboard</HeroText>
    Claims register: C-USAGE-51 (FALSE).
- impact: This is the only example in the usage skill with a complete import line, so it is the one a consumer's agent most likely copies verbatim, and it fails to compile with TS2304. The compiler catches it at once and the fix is one word, but it is a shipped skill example that does not compile against the shipped types. (`Tracking` and `FontAxes` are imported and unused in the block, which is harmless.)
- recommendation: Add `HeroText` to the import on line 255.
- breaking: none
- contract: n/a
- remediation: [WI-C2-04]
- related: [F-046]

### F-009: The v3 migration skill tells consumers both to keep and to rename `surface-page`, so its done-check grep can never reach zero
- severity: S1
- category: doc-drift
- rules: [R13.11]
- scope: consumer-visible
- confidence: confirmed
- verified_by: "U13 compared `git show v5.3.0:skills/dooph-design-system-v3-migration/SKILL.md` (rows :98 `--ui-color-surface-page` → `--ui-color-page-background`, :139 `bg-surface-page` → `bg-page-background`) with HEAD, where commit 8a946e5 deleted both rows and moved the token to 'Unchanged'. V2 confirmed it: HEAD tokens.css:94 defines `--ui-color-surface-page`, dist/styles.css has `.bg-surface-page`, ShapeButtons has no `star`, and Menu/constants.ts:12 records the removal of DropdownMenuVariant. Every defect here dates from after v5.3.0."
- locations:
  - skills/dooph-design-system-v3-migration/SKILL.md:113-115
  - skills/dooph-design-system-v3-migration/SKILL.md:153-154
  - skills/dooph-design-system-v3-migration/SKILL.md:237
  - skills/dooph-design-system-v3-migration/SKILL.md:254-255
  - skills/dooph-design-system-v3-migration/SKILL.md:197-198
  - skills/dooph-design-system-v3-migration/SKILL.md:222-224
- evidence: |
    v3:113-115  **Unchanged — do NOT rename (these already had v3 names in v2):** all … `--ui-color-surface-page`, `--ui-color-border-popovers`,
    v3:153      - `bg-surface` — same: leave `bg-surface-secondary` alone; rename only bare
    v3:154        `bg-surface` and `bg-surface-page`.
    v3:237      rg -n -e "destructive|surface-page|accent-color|--ui-color-logo|avatar-bg|text-logo|shadow-focus-destructive"
    v3:254      Zero hits from both passes + a clean build = migration complete. This skill no
    v3:197      Those are the only changed exports — `ButtonSize`, every other variant enum, and
    v3:223      `ButtonSize.iconMicro`, `ShapeButtons.star`, and `DropdownMenuVariant` for menu
    Claims register: C-V3-6 (FALSE), C-V3-13 (FALSE), C-V3-11 (FALSE), C-V3-9 (STALE).
- impact: A v2 app upgrading to HEAD already uses `--ui-color-surface-page`/`bg-surface-page`, which are v2 names that are current again. Line 115 says to keep them, while :153-154 says to rename `bg-surface-page`. No table row gives a target for it, so the nearest instruction is the bare `bg-surface` → `bg-surface-primary` row, which would repaint the page background (inferred, since :154 names no target). The done-check at :237 flags every correct `surface-page` use as a stale survivor, so the skill's "zero hits" completion condition (:254-255) cannot be met without breaking the app. Separately, "New in v3" (:223) sends the agent to `ShapeButtons.star` and `DropdownMenuVariant`, both removed at HEAD (a compile error), and :197 still claims no other variant enum changed. The `surface-page` half was introduced BY a forward-compat edit (8a946e5) and contradicts the same file. The removed-API half is the R13.11 pass that falls due when the release is cut. All of it is unreleased: the published 5.3.0 skill was internally consistent, so this ships at the next publish.
- recommendation: Remove `bg-surface-page` from the :154 rename instruction and `surface-page` from the :237 grep now. Annotate :197 and :223 as part of the release's R13.11 forward-compat pass.
- breaking: none
- contract: n/a
- remediation: [WI-C2-05] (`surface-page` half); the :197-198 / :222-224 half belongs to the release's R13.11 forward-compat pass in WI-RELEASE-MIGRATION (decision D-01)
- related: [F-013, F-007]

### F-010: LinearProgressIndicator's shipped JSDoc and the LPI and Slider "Color prop" stories offer `'brand'` and `'error-primary'`, which resolve to a transparent fill
- severity: S1
- category: doc-drift
- rules: [R1.3, R1.4]
- scope: consumer-visible
- confidence: confirmed
- verified_by: "U9 traced it: DS_COLOR_TOKENS has no `brand`/`error-primary` key, and resolveDsColor passes unknown names through. V2 confirmed it: a Browser-pane probe of `background-color: var(--ds-progress-color)` gives `brand` → rgba(0, 0, 0, 0), `error-primary` → rgba(0, 0, 0, 0), and `#7c5cff` → rgb(124, 92, 255). The same JSDoc is in the audit build's dist/components/LinearProgressIndicator/LinearProgressIndicator.d.ts:7, which pack.txt lists. `git show v5.3.0:src/utils/color.ts` still has `brand` (:21) and `'error-primary'` (:23)."
- locations:
  - src/components/LinearProgressIndicator/LinearProgressIndicator.tsx:29-30
  - src/components/LinearProgressIndicator/LinearProgressIndicator.stories.tsx:53
  - src/components/LinearProgressIndicator/LinearProgressIndicator.stories.tsx:90-93
  - src/components/Slider/Slider.stories.tsx:212
  - src/utils/color.ts:18-38
  - src/utils/color.ts:57
- evidence: |
    LPI.tsx:29        /** Filled-bar color. Accepts a DS token name ('primary', 'brand', 'text') or
    LPI.tsx:30         * any CSS color. Defaults to the primary token. */
    LPI.stories:53    {(['primary', 'brand', 'text', 'error-primary'] as const).map((c) => (
    LPI.stories:90    <LabelText>Brand - Animated</LabelText>
    LPI.stories:93    <LinearProgressIndicator color="prominent" value={value} max={100} />
    Slider.stories:212  {(['primary', 'brand', 'text', 'error-primary'] as const).map((c) => (
    color.ts:21       prominent: 'var(--ui-color-prominent)',          (no `brand` key; `'danger-primary'` at :23, no `'error-primary'`)
    color.ts:57       return DS_COLOR_TOKENS[color as DsColorToken] ?? color;
- impact: IntelliSense tells consumers that `'brand'` is a valid token name. It compiles, because `DsColor` admits any string (color.ts:44), but the bare word becomes an invalid CSS colour and the bar fill is invisible. The "Color prop" stories in LinearProgressIndicator and Slider, which exist to prove that the prop works, render two broken samples each (`brand`, `error-primary`). On Slider that leaves a transparent handle and track, and nothing marks them as broken. LPI.stories:90 labels a `prominent` bar "Brand". Both names were valid in published v5.3.0 (color.ts:21,23), and the rename at HEAD left the JSDoc and the stories behind. So this ships at the next publish, and it compounds F-013's silent break for consumers who already pass `color="brand"`.
- recommendation: Name only real `DS_COLOR_TOKENS` keys (`prominent`, `danger-primary`) in the JSDoc and both stories, and relabel the "Brand" demo.
- breaking: none
- contract: src/components/LinearProgressIndicator/LinearProgressIndicator.tsx "Do not add a LinearProgressVariant enum — color is the open design value." → consistent (the recommendation edits prose and stories only; `color` stays an open value)
- remediation: [WI-C2-06]
- related: [F-013, F-032, F-054]

### F-013: HEAD holds about 76 consumer-breaking changes since v5.3.0, yet package.json still says 5.3.0 and the docs describe them as an already-released "5.4" minor
- severity: S1
- category: build-packaging
- rules: [R13.1, R13.2, R13.3, R13.5, R13.6, R13.11]
- scope: consumer-visible
- confidence: confirmed
- verified_by: "U13 built the inventory mechanically: git diff v5.3.0 HEAD over tokens.css/index.ts/constants.ts/package.json, TS-checker export lists of both trees (357 → 443 names), and token, @theme-key and ds-* class diffs (U13 §6). V1 sampled 12 breaks (all real) and re-derived 26 removed tokens and 19 removed @theme keys exactly with comm -23. `npm view` shows dist-tags latest 5.3.0, and `git log v5.3.0..HEAD` has 11 commits. V1 CONFIRMED, with two corrections: '~50' is ≈76, and 'every consumer doc' overstates it."
- locations:
  - package.json:3
  - package.json:43-45
  - skills/dooph-design-system-theming/references/token-contract.md:17,19,21,23,41,42,43,56,59,60,87,88
  - skills/dooph-design-system-v3-migration/SKILL.md:125-132
  - skills/dooph-design-system-v5-migration/SKILL.md:17-22,49-53,62,86
  - skills/dooph-design-system-v5-migration/codemod.mjs:15-19,44,124-126
  - .agents/skills/dooph-ds-writing-version-migrations/SKILL.md:44-48,277-280,288-290
  - .agents/skills/dooph-ds-architecture/SKILL.md:32,84
  - .agents/skills/dooph-ds-codebase/SKILL.md:138,140,277,398,498,499,501,502,504,531
  - src/components/Button/Button.tsx:19-20
  - src/components/Menu/constants.ts:12
  - src/components/Menu/DropdownMenu.tsx:277-278
  - src/components/SegmentedTabSelect/constants.ts:8-11
  - src/components/Toggle/constants.ts:14
  - src/components/Toggle/Toggle.tsx:5
  - src/utils/color.ts:44
  - CHANGELOG.md:10-21
- evidence: |
    package.json:3            "version": "5.3.0",
    package.json:45           "prep-release:minor": "npm version minor && npm run build && git push --follow-tags",
    token-contract.md:17      … (renamed from `--ui-color-brand*` in 5.4, alongside `ButtonVariant.brand` → `.prominent`)
    v3-migration:125          > **The target names above are the CURRENT (5.4) ones, not the literal v3
    v5-migration:50           > v5 deleted all nine `--ui-color-danger*` tokens; **5.4 brought the entire
    codemod.mjs:124           These tokens and classes EXIST again as of 5.4, under their v4 names — v5
    vm:44-45                  **The awkward case: a minor that renamed things.** 5.4 renamed most of the token / vocabulary in a minor. That was a mistake, and it is why the v3 and v5 migration
    arch:32                   … v3 renamed `ButtonVariant.destructive` → `.danger`, and 5.4 renamed `ButtonVariant.brand` → `.prominent`. …
    Button.tsx:19             * - `prominent` was called `brand` before 5.4, in both the variant key and the
    Menu/constants.ts:12      * BREAKING (major): DropdownMenuVariant (standard/action/complex) was removed.
    Toggle/Toggle.tsx:5       * (two or more). Renamed from TwoWayToggle / TwoWayToggleItem (BREAKING, major).
    color.ts:44               export type DsColor = DsColorToken | (string & {});
    Inventory (U13 §6, re-derived by V1 and C2): 26 removed `--ui-*` tokens · 19 removed theme.css @theme keys · 4 removed ds-* helpers (`ds-focus-ring-error-on-focus`, `ds-menu-w-standard/-action/-complex`) · 7 removed export names (GemShape, TwoWayToggle, TwoWayToggleItem, TwoWayToggleProps, TwoWayToggleItemProps, DropdownMenuCheckboxItem, DropdownMenuVariant) · ~20 removed/renamed const members (ButtonVariant/CheckboxVariant/LoadingSpinnerColor `.brand`, ToastTypes `.brand/.error`, IconSize `.tiny/.standard/.medium`, ShapeButtons `.arrow/.gem/.star`, SegmentedVariant ×5, ToggleVariant `.secondary`, DS_COLOR_TOKENS ×6) ≈ 76.
    Claims register: C-TC-3, C-V3-4, C-V5-2, C-V5-6, C-V5CM-1, C-VM-3, C-ARCH-3, C-CB-44, C-CB-47, C-CB-178 (all FALSE on the P-5.4 label).
- impact: The latest tag and npm release is 5.3.0, and no 5.4 exists. If HEAD ships as the "5.4" the docs describe (`npm run prep-release:minor`), every consumer on `^5.3.0` receives it on a routine `npm update`. TypeScript consumers hit compile errors, the hard breaks. CSS overrides of removed tokens, consumer-authored utilities on removed theme keys, plain-JS callers and `color="brand"`-style strings all fail silently, because `DsColor`'s `(string & {})` lets the old name compile and emit an invalid colour. The repo's own rule (R13.3, vm:44-48) says a rename worth doing is worth a major, and five source comments already label these changes "BREAKING (major)". But if the maintainer honours that and cuts 6.0.0, every "5.4" in three shipped skills, the codemod, three authoring skills and Button.tsx's header becomes false, and the required v6 migration skill (R13.1, R13.6) does not exist. CHANGELOG [Unreleased] lists only additive items (F-049), so whoever cuts the release from it would pick a minor. Corrections applied from V1: the usage skill uses present tense with no version label, and README:180 still has the 5.3.0 name `rounded-standard` (F-006), so the "5.4" narration lives in token-contract.md, the v3/v5 skills, the codemod and the authoring skills, not in every doc.
- recommendation: Choose the version before release (D-01). The recommended option, per R13.3 and the source's own markers, is 6.0.0: author `skills/dooph-design-system-v6-migration/` from a mechanical v5.3.0→HEAD inventory (U13 §6, docs/audit/_work/units/U13.md, is the seed), do the R13.11 forward-compat pass on the v3 and v5 skills as part of that release, and then relabel every "5.4" narration line listed above to the shipped version.
- breaking: major
- contract: src/components/Button/Button.tsx "`prominent` was called `brand` before 5.4, in both the variant key and the token family (`--ui-color-brand-*`). Neither spelling survives." → consistent (the recommendation relabels the version only; the constraint's rule is unchanged)
- remediation: decision D-01 (+ blocked WI-C2-07; the release itself and the v6 migration skill are WI-RELEASE-MIGRATION)
- related: [F-006, F-007, F-009, F-010, F-047, F-049, F-109, F-112]

### F-046: The usage skill's component inventory omits required props (MorphRotationShape `shapes`, CTAButton `text`/`icon`), so code written from it does not compile
- severity: S2
- category: doc-drift
- rules: []
- scope: consumer-visible
- confidence: confirmed
- verified_by: "U13 scratch/U13/examples/ex15_usage_prose_claims.tsx → `TS2322 … Property 'shapes' is missing` and `TS2739 … missing the following properties from type 'CTAButtonProps': text, icon`. V2 reproduced both with an independent tsc run (scratch/V2/tsc/inventory.tsx, :2 TS2322 and :3 TS2739; the corrected controls compile clean)."
- locations:
  - skills/dooph-design-system-usage/SKILL.md:210
  - skills/dooph-design-system-usage/SKILL.md:117-119
- evidence: |
    SKILL.md:210  `MorphRotationShape` (shape morph primitive; required `mode`: `MorphRotationShapeMode.autoplay` | `.controlled` (activeIndex) | `.embedded` (set --ds-shape-morph-target from CSS state); give it a box, …
    SKILL.md:117  `CTAButton` (marketing CTA — fully round, padded outline ring on `primary`,
    SKILL.md:118  label-only hover roll; `CTAButtonVariant`: `primary` | `secondary`,
    SKILL.md:119  `CTAButtonSize`: `standard` | `big`).
    (types) MorphRotationShape.tsx:90-91  /** DS shape components in play order, e.g. `[CloverShape, PuffShape]`. At least two. */ shapes: ShapeComponent[];
    (types) CTAButton.tsx:33,35  text: string; … icon: ReactNode;
    Claims register: C-USAGE-42 and C-USAGE-10 (TRUE but incomplete).
- impact: The skill calls `mode` "required" and stops, so an agent writes `<MorphRotationShape mode={…} />` and gets TS2322. The `shapes` it actually needs are DS shape components (`CloverShape`, `PuffShape`, …), which the usage skill never mentions (F-048), so the agent must also guess what to pass. The CTAButton entry reads like Button, so `<CTAButton>Label</CTAButton>` fails on the missing `text`/`icon` (and children are discarded unless `asChild`, F-093). The compiler catches both, so the cost is a wasted round-trip, not a silent failure. V2 note: the inventory is framed as "Reach for these" rather than as a prop reference, so the CTAButton half is an omission, while the MorphRotationShape half misleads because it names a required prop and stops.
- recommendation: State `shapes` (two or more `*Shape` components) next to `mode`, and `text`/`icon` for `CTAButton`.
- breaking: none
- contract: n/a
- remediation: [WI-C2-04]
- related: [F-008, F-048, F-093]

### F-047: The shipped theming docs state five wrong token facts: icon stroke 1.5 (it is 2), the slider step-inactive default, the dark behaviour of `-alt`, eight text roles (there are ten), and a 45% track opacity
- severity: S2
- category: doc-drift
- rules: [R13.2]
- scope: consumer-visible
- confidence: confirmed
- verified_by: "U13 grepped tokens.css for each documented default and parsed :root vs .dark (tokens.cjs). U1 and U10 compared the docs with tokens.css/Text constants (`git log -G` shows 613285c moved the stroke from 1.5 to 2 without touching either doc). V4 re-grepped every value (stroke `2` at tokens.css:529; step-inactive → `--ui-color-secondary-border` at :509; `-alt` defined only at :153; TextVariant has ten keys; opacity 50%/70% light, 60%/60% dark). Verdict PARTIAL: all facts confirmed, S2 for this half of M8, and U6-F17's internal locations are S3."
- locations:
  - skills/dooph-design-system-theming/references/token-contract.md:56
  - skills/dooph-design-system-theming/references/token-contract.md:59
  - skills/dooph-design-system-theming/references/token-contract.md:66
  - skills/dooph-design-system-theming/references/token-contract.md:69
  - skills/dooph-design-system-theming/references/token-contract.md:87
  - skills/dooph-design-system-theming/references/token-contract.md:98
  - skills/dooph-design-system-theming/references/token-contract.md:212
  - skills/dooph-design-system-theming/SKILL.md:203-205
  - .agents/skills/dooph-ds-codebase/SKILL.md:398
  - .agents/skills/dooph-ds-codebase/SKILL.md:542
  - src/styles/dooph-component-tokens.css:115
  - src/components/Slider/Slider.stories.tsx:206
- evidence: |
    path:line | snippet | reality @ b436647
    token-contract.md:87 | `--ui-icon-stroke-width` (1.5) — back `IconSize.sm/rg/md/lg`. | tokens.css:529 `--ui-icon-stroke-width: 2;`
    .agents/…/dooph-ds-codebase/SKILL.md:398 | stroke from `--ui-icon-stroke-width`, 1.5). | same (C-CB-147 FALSE)
    token-contract.md:98 | `--ui-color-slider-step-inactive` — the unfilled step dot, shared by both variants (defaults to `--ui-color-border-secondary`) | tokens.css:509 `--ui-color-slider-step-inactive: var(--ui-color-secondary-border);` (a different token: :36 `#e2e3e4` vs :125 `#dfdfdf`)
    token-contract.md:56 | Unlike the button family (which is fully mode-invariant), the alt DOES change between light and dark. | :59 of the same file "Mode-invariant as of 5.4"; tokens.css:153 is the only definition (comment :148-151 "All three are mode-invariant")
    token-contract.md:66 | There are **eight** text roles: `body`, `button`, `heading`, `subheading`, `label`, `title`, `hero`, `mono`. | Text/constants.ts TextVariant has ten (adds `heroButton`, `heroBody`); usage/SKILL.md:237 "Ten roles"; :69 omits `--ui-text-hero-body`/`-hero-button` (tokens.css:401-402); :212 omits `text-style-hero-body`/`-hero-button` (index.css:249,259)
    theming/SKILL.md:205 | slider paints the handle in it and the active track at 45% of it. | tokens.css:505-506 `50%` / `70%`, `.dark` :700-701 `60%` / `60%`, read at dooph-component-tokens.css:121
    dooph-component-tokens.css:115 | /* Active slider track — the handle color at 45% (Figma applies alpha on top). | same (internal comment)
    Slider.stories.tsx:206 | '`color` takes a DS token name or any CSS color. The handle renders it solid and the active track renders it at 45%.' | same (Storybook docs page)
    codebase/SKILL.md:542 | `ds-slider-fill` (45% of `--ds-slider-color` …), … active `--ui-color-text` at 40%) | same skill's :279-281 says "no longer the hardcoded 45%"; active dot is `--ds-slider-step-active` → `--ui-color-slider-step-*-active`
    Claims register: C-TC-17, C-TC-19, C-TC-9 (FALSE); C-TC-11, C-THEME-17 (STALE); C-CB-147 (FALSE); C-CB-198, C-CB-200 (STALE); C-JSDOC-dooph-component-tokens.css-2 (FALSE).
- impact: A consumer retuning from the shipped theming skill starts from the wrong baseline. They match icon strokes against 1.5 when the default is 2. They override `--ui-color-border-secondary` to move the slider's inactive dots, which changes nothing there, because the dots read `--ui-color-secondary-border`. They add a `.dark` override for `-alt` that it does not need (the file contradicts itself at :56 vs :59). And they never learn the two hero roles and their `--ui-text-hero-*` tokens and `text-style-hero-*` classes exist, because the theming skill counts eight roles while the usage skill counts ten. None of this breaks compilation or turns a documented thing into a no-op, which is why it is S2 and not S1 (V4). The internal copies (codebase skill :398/:542, the CSS comment, the Storybook description) steer the next maintainer to the same wrong values. V4 correction applied: U10-F9's "the stroke token backs IconSize" is a reading of a shared list suffix, not a separate error.
- recommendation: Correct each statement from tokens.css (stroke 2; step-inactive → `--ui-color-secondary-border`; `-alt` mode-invariant; ten roles plus the hero tokens and classes; per-variant track opacity tokens), in the shipped docs first and then in the internal copies.
- breaking: none
- contract: n/a
- remediation: [WI-C2-01, WI-C2-06, WI-C2-14, WI-C2-15]
- related: [F-006, F-013, F-048, F-099, F-101]
- note-to-orchestrator: codebase/SKILL.md:542 is also a location of F-099 (member U1-F15), and dooph-component-tokens.css:115 is also a location of F-101 (member U1-F8). WI-C2-14/WI-C2-15 edit those two lines, so the F-099/F-101 WIs should drop them, or the reverse.

### F-048: Consumer docs omit public surface: 53 tokens have no doc mention, and the AIChat family and TooltipProvider/ToastProvider are never mentioned
- severity: S2
- category: doc-drift
- rules: [R13.2, R1.1]
- scope: consumer-visible
- confidence: confirmed
- verified_by: "U13 ran two-way token and export diffs (token-contract-diff.txt; export-name scan of usage SKILL.md + references). V3 recounted both: 259 tokens = 172 literal + 11 wildcard + 11 shorthand + 65 absent from token-contract.md, of which 53 appear in no consumer doc at all. Of 443 d.ts names, 140 are mentioned and 106 runtime values are absent. AIChat is 17 components + 3 consts with 0 mentions across the shipped docs and README. TooltipProvider/ToastProvider/useToast/TooltipTypes/ToastTypes have 0 mentions, and Radix react-context throws when a Tooltip has no provider. Verdict CONFIRMED, with count corrections applied below."
- locations:
  - skills/dooph-design-system-theming/SKILL.md:221-222
  - skills/dooph-design-system-theming/references/token-contract.md:146-148
  - skills/dooph-design-system-usage/SKILL.md:106-108
  - skills/dooph-design-system-usage/SKILL.md:144-150
  - skills/dooph-design-system-usage/SKILL.md:191
  - skills/dooph-design-system-usage/SKILL.md:207-212
  - skills/dooph-design-system-theming/SKILL.md:185-187
  - src/index.ts:35
  - src/components/AIChat/index.ts:1-46
  - src/styles/tokens.css:173-215
  - src/components/Tooltip/Tooltip.tsx:16
  - src/components/Toast/Toast.tsx:317-320
- evidence: |
    theming/SKILL.md:221-222  The full token surface and Tailwind mappings live in / `references/token-contract.md` — read it when you need the exhaustive list.
    token-contract.md:146-148 Families: `--ui-roll-hover-*` (`RollHoverText`), `--ui-underline-link-*` / (`UnderlineLinkText`), `--ui-rolling-digits-*` (`RollingDigitsText`), / `--ui-sidebar-icon-*` (`SidebarWithHoverIcon`).
    usage/SKILL.md:108        Reach for these before writing local UI:
    usage/SKILL.md:150        `PopoverPortal`, `PopoverClose`); `Tooltip` family.
    usage/SKILL.md:207        - **Feedback / motion:** `Toast` family, `LoadingSpinner`, `ProgressIndicator`,
    usage/SKILL.md:191        `BaseIcon`, `ChevronDownIcon`, `SearchIcon`, `SidebarWithHoverIcon`.
    src/index.ts:35           export * from './components/AIChat';
    Tooltip.tsx:16            const Tooltip = TooltipPrimitive.Root;
    Toast.tsx:319-320         if (!context) { / throw new Error("useToast must be used within a ToastProvider");
    Absent from token-contract.md (65): selection ×2, tooltip inverse/matching ×6, border-cta, ai-* ×4, chat-* ×16 + width-chat-model-tooltip, fade-change ×5, shape-morph ×7, reveal-change ×3, text-hero-body/-button, size-checkbox, size-code-digit, height-tab-micro, radius-checkbox/-avatar/-avatar-sm/-calendar-day, shadow-standard, CTA ×10 (border-cta counted above; shadow-cta, text-cta ×2, size-cta-chip ×2, size-cta-icon, min-w-cta-content ×2, min-w-cta-pill-big, spacing-cta-content-big). 12 of them are named elsewhere (tooltip-* by wildcard at theming:186, fade-change-* at usage:183, height-tab-micro at usage:157) → 53 with no consumer-doc mention.
    Absent from the usage skill: AIChat (AIContextGauge, AIModelSelectItem, AIModelSelectTrigger, AIModelTooltipContent, AIPromptInput + Submit/Textarea/Toolbar/ToolbarStart/ToolbarEnd, AITextPart, AIThinkingEffortSelector, AIThinkingPart, AIToolPart, AITurnSummary, ChatDivider, UserMessageHeader; consts AIToolPartVariant, AIToolPartState, AIThinkingPartState); the Shapes family; 86 of 88 icons and IconSize; TooltipProvider, ToastProvider, useToast; TooltipTypes, ToastTypes, TabVariant, TabSize, ToggleVariant, ToggleSize, SegmentedVariant, SegmentedSize, InputVariant, CheckboxVariant and more.
    Claims register: C-THEME-20 (FALSE "exhaustive list"); C-TC-24, C-USAGE-20, C-USAGE-40 (TRUE but incomplete).
- impact: The theming skill sends agents to token-contract.md as "the exhaustive list", yet the whole AIChat/Sticker-era motion surface (chat, fade/reveal change, shape morph) and older families (CTA geometry, tooltip themes, selection, AI model marks) are missing from it. A consumer's agent then concludes that a retune is impossible or reaches for arbitrary values. The usage skill's contract is "Reach for these before writing local UI", yet it never mentions the 17-component AIChat family, so an agent building a chat surface hand-rolls it. It also never names the providers whose absence makes `<Tooltip>` throw ("`Tooltip` must be used within `TooltipProvider`") and `useToast()` throw, nor the consts (`TooltipTypes`, `ToastTypes`, `TabVariant`, …) that Rule 1 requires instead of string literals. R13.2 says a minor that adds components or tokens must edit the usage/theming skills, and these additions were not carried in. Corrections applied from V3: AIChat is 17 components + 3 consts (`AIThinkingEffortStep` is a type). The listed Tabs/Toggle/SegmentedTabSelect/Input calls have defaults, so their consts are needed only to pick a non-default. Not S1: the docs omit, they do not instruct wrong code.
- recommendation: Add the AIChat family (with its consumer-owned responsibilities), the Shapes family, the icon set + `IconSize`, the providers, and each listed component's variant/size const to the usage skill. Add the 65 tokens (at least one line per family) and the four missing motion families to token-contract.md.
- breaking: none
- contract: n/a
- remediation: [WI-C2-08, WI-C2-09] (the codebase-skill half of U11-F10 belongs to F-099's folder-list fix; its CHANGELOG half is in WI-C2-10)
- related: [F-046, F-047, F-049, F-099]

### F-049: CHANGELOG has no entries for the 34 tags after 1.1.0, and its [Unreleased] section omits every breaking change on HEAD
- severity: S2
- category: doc-drift
- rules: []
- scope: consumer-visible
- confidence: confirmed
- verified_by: "U13 compared `git tag` with the CHANGELOG headings and checked [Unreleased] against the §6 inventory. U5 confirmed three menu removals with `git show v5.3.0:` (DropdownMenuCheckboxItem, DropdownMenuVariant, --ui-min-w-menu-action). V3 recounted: `grep -n '^## ' CHANGELOG.md` gives [Unreleased] :10, [1.1.0] :25, [1.0.0] :55. 78 tags exist, and 34 v-tags after 1.1.0 (v1.1.1 … v5.3.0, majors v2.0.0, v3.0.0, v4.0.0, v5.0.0) have no entry. Symbol presence was counted v5.3.0 → HEAD for 14 names. Verdict CONFIRMED (four majors, not three)."
- locations:
  - CHANGELOG.md:3-6
  - CHANGELOG.md:10-21
  - CHANGELOG.md:25
  - src/components/Menu/constants.ts:12-13
  - src/components/Menu/DropdownMenu.tsx:277-278
  - skills/dooph-design-system-usage/SKILL.md:134-135
- evidence: |
    CHANGELOG.md:3   All notable changes to `@dooph-software/design-system` will be documented here.
    CHANGELOG.md:5   Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
    CHANGELOG.md:10  ## [Unreleased]
    CHANGELOG.md:12  ### Added        (6 bullets: MorphRotationShape, ShapeMorphSpinner, shape-morph tokens, *_SHAPE_PATH, DropdownCaret, hover nudge)
    CHANGELOG.md:20  ### Changed      (1 bullet: DropdownTrigger/TypeableDropdownTrigger use DropdownCaret)
    CHANGELOG.md:25  ## [1.1.0] — 2026-06-23
    Menu/constants.ts:12   * BREAKING (major): DropdownMenuVariant (standard/action/complex) was removed.
    DropdownMenu.tsx:277-278  * Figma Checkbox Menu Item. Renamed from DropdownMenuCheckboxItem / * (BREAKING, major).
    usage/SKILL.md:134-135    `DropdownMenuMultiSelectItem` (checkbox-style, renamed / from `DropdownMenuCheckboxItem`)
    `git tag --sort=v:refname` → … v4.8.2 v5.0.0 v5.1.0 v5.1.1 v5.2.0 v5.3.0 (no v1.1.0 tag; 30 unprefixed tags 1.0.0 … 4.4.0, incl. 2.0.1-ci, also exist)
    Claims register: C-CHANGELOG-1 (FALSE).
- impact: The file promises that it documents all notable changes in Keep a Changelog/SemVer form, but it is silent on every release a consumer can actually install (v1.1.1 to v5.3.0, four majors). [Unreleased] lists seven additive items and has no `### Removed`. It omits the 26 token removals, the 19 utility-key removals, `ButtonVariant.brand`, `IconSize` members, `TwoWayToggle`, `DropdownMenuCheckboxItem`, `DropdownMenuVariant`, `SegmentedVariant` keys and `GemShape`/`ShapeButtons` removals, and also the additive AIChat, Sticker, ToggleSwitch, FadeChangeText and HeroBody/HeroButton work. The next reasonable edit, cutting the release from [Unreleased], would read an additive-only list and choose a minor (F-013), even though five source comments already say "BREAKING (major)". No repo rule mandates the file (R13.5 governs migration inventories, and R11.13 says history lives in git), so the obligation comes from the file's own promise at :3/:5. The file is not in the npm tarball (pack.txt), so it reaches only GitHub readers, which keeps this at S2.
- recommendation: Rebuild [Unreleased] mechanically from `git diff v5.3.0 HEAD` with Added/Changed/Removed headings, and have the maintainer choose and state a policy for v1.1.1–v5.3.0 (backfill from tag diffs, or a pointer to tags/releases).
- breaking: none
- contract: src/components/Menu/DropdownMenu.tsx "Do not hardcode a search field into `DropdownMenuContent`." / "Style open/disabled/highlighted via Radix data attributes only." → consistent (the recommendation edits CHANGELOG.md only; the file is cited as evidence)
- remediation: [WI-C2-10]
- related: [F-013, F-048, F-112]

### F-050: ProgressIndicator's shipped JSDoc describes a "polar sine-wave" path and a development-only throw, and neither exists
- severity: S2
- category: doc-drift
- rules: []
- scope: consumer-visible
- confidence: confirmed
- verified_by: "U9 read constants.ts, ProgressIndicator.tsx and waveGeometry.ts in full and grepped the audit build's dist/components/ProgressIndicator/*.d.ts, where both texts ship (constants.d.ts:5-6, ProgressIndicator.d.ts:9,36; pack.txt lists them). V2 verdict PARTIAL: the stale mechanism text is real, the same d.ts also carries the correct component JSDoc (\"Throws if `progress` is outside [0, 1]\"), and the spring-loop advice is still valid because the wavy `<path>` has no transition. `git show v5.3.0:` shows identical text, so this is in the published package."
- locations:
  - src/components/ProgressIndicator/constants.ts:11-15
  - src/components/ProgressIndicator/ProgressIndicator.tsx:45-48
  - src/components/ProgressIndicator/ProgressIndicator.tsx:269
  - src/components/ProgressIndicator/ProgressIndicator.tsx:292-296
  - src/components/ProgressIndicator/waveGeometry.ts:1-8
  - src/components/ProgressIndicator/waveGeometry.ts:157-160
- evidence: |
    constants.ts:12  * Polar sine-wave arc — indicator follows a wavy path generated from `progress`.
    constants.ts:13  * CSS path transitions are not applied (point count changes); drive `progress`
    waveGeometry.ts:4-5    * Material builds the active indicator from a rounded star polygon rather / * than a sampled sine wave. …
    waveGeometry.ts:158-159  * Creates one stable, closed path for the complete wave. Progress is revealed / * with SVG dash properties, so changing progress never changes the path's
    PI.tsx:47        * Throws in development if the value is outside this range.
    PI.tsx:269       * Throws if `progress` is outside [0, 1] — invalid values are always a bug.
    PI.tsx:292       if (progress < 0 || progress > 1) {
    Claims register: C-JSDOC-ProgressIndicator.constants-1 (FALSE), C-JSDOC-ProgressIndicator-1 (FALSE).
- impact: A consumer hovering `ProgressIndicatorVariants.wavy` is told the path is regenerated from `progress` and that its point count changes. In fact one stable rounded-star path is revealed by a normalized dash (PI.tsx:249-256). The practical advice to drive `progress` from a spring loop stays correct (V2), so the harm is a false mental model, not wrong usage. The `progress` prop JSDoc says the range guard throws only in development, but it throws unconditionally, so a consumer who trusts the prop doc may let out-of-range values reach production and crash there. The adjacent component JSDoc (:269) states the truth, so IntelliSense shows both claims (V2).
- recommendation: Rewrite both JSDoc blocks to the current model: a stable path revealed by a normalized dash, and a throw in every build.
- breaking: none
- contract: n/a
- remediation: [WI-C2-11]
- related: [F-038, F-033]

### F-052: README's font contract omits the mono role and the `opsz`/`slnt` axes that the theming skill says must be requested
- severity: S2
- category: doc-drift
- rules: [R4.1, R4.3]
- scope: consumer-visible
- confidence: confirmed
- verified_by: "U13 read README.md in full and compared it with theming SKILL.md:54-93, token-contract.md:9 and tokens.css:379-436. V3 grepped README for `mono|Google Sans Code|opsz|slnt|theming` (no hits), confirmed README ships (pack.txt:5), and narrowed the effect: default rendering loses only `opsz` (index.css `font-optical-sizing: auto` ×7), and `slnt` matters only once a consumer sets `FontAxes.slant`."
- locations:
  - README.md:62-71
  - README.md:85-96
  - README.md:127-140
  - README.md:163-172
- evidence: |
    README.md:62   … It defines default font-family tokens only — one per text role, so each role can be overridden independently:
    README.md:65-70  six declarations (body, button, heading, label, title, hero) — no `--ui-font-mono`
    README.md:95   axes: ["GRAD", "ROND", "wdth"],
    theming/SKILL.md:55-56  one token per text role — `body`, `button`, `heading`, `label`, `title`, `hero`, / `mono` — so each role can be overridden independently.
    theming/SKILL.md:83  - **Google Sans Flex** — `GRAD`, `ROND`, `opsz`, `slnt`, `wdth`, `wght`. Loading
    tokens.css:388-390  --ui-font-mono: / "Google Sans Code", ui-monospace, "SF Mono", SFMono-Regular, Menlo, / Consolas, monospace;
    token-contract.md:9  … Request every axis as a RANGE — pinned or omitted, the provider serves a file without the axis and the token silently does nothing.
    Claims register: C-README-10 (STALE).
- impact: README ships in the tarball and is the setup doc most consumers follow. An app built from it never loads Google Sans Code, so `MonoText` falls back to the platform monospace, a degradation the theming skill (:71-72) calls "almost right … goes unnoticed". The app also requests Google Sans Flex without `opsz`/`slnt`, so the DS's own `font-optical-sizing: auto` does nothing and `axes={{[FontAxes.slant]: …}}` / `FontAxes.opticalSize` silently no-op. "One per text role" lists six of seven roles. Per V3, leaving `--ui-font-mono` out of the Vite override block is not wrong by itself, because the default token survives. The defect is that README never says the mono face must be loaded. Nothing breaks outright, so this is the low edge of S2.
- recommendation: Add the mono role (token + Google Sans Code with a `MONO` range) and the full Flex axis set to both README examples, and point to the theming skill as the canonical font contract.
- breaking: none
- contract: n/a
- remediation: [WI-C2-02]
- related: [F-006]

### F-053: CONTRIBUTING.md and SECURITY.md link to a repository path that 404s, so the only documented private vulnerability-reporting channel is unreachable
- severity: S2
- category: doc-drift
- rules: []
- scope: consumer-visible
- confidence: confirmed
- verified_by: "U13 fetched both documented URLs (HTTP 404) and the real repository `dooph-software/dooph.-Design-System`. V3 compared the link text with package.json `repository.url`/`homepage` and `git remote -v` and re-fetched both URLs (`The server returned HTTP 404 Not Found.`, no rename redirect). It traced the links to executor-prompt-oss-publication.md:250/:303 templates, copied verbatim."
- locations:
  - SECURITY.md:12
  - CONTRIBUTING.md:7
  - package.json:10
  - package.json:12
- evidence: |
    SECURITY.md:12     **[Report a vulnerability](https://github.com/dooph-software/dooph-Design-System/security/advisories/new)**
    CONTRIBUTING.md:7  To file a bug or question, open an [issue](https://github.com/dooph-software/dooph-Design-System/issues) — fixes are not guaranteed.
    package.json:10    "url": "https://github.com/dooph-software/dooph.-design-system.git"
    package.json:12    "homepage": "https://github.com/dooph-software/dooph.-design-system#readme",
    git remote -v      origin https://github.com/dooph-software/dooph.-Design-System.git
    Claims register: C-SECURITY-2, C-CONTRIBUTING-2 (FALSE).
- impact: A security researcher following SECURITY.md lands on a 404. SECURITY.md:9 has just told them not to open a public issue, so they have no working channel. Bug reporters following CONTRIBUTING.md hit the same 404. The repo name is missing the `.` after `dooph`. package.json has no `bugs` field, so npm users get no alternative link. Neither file is in the npm tarball, which limits reach to GitHub readers and keeps this at S2.
- recommendation: Point both links at `dooph-software/dooph.-design-system`, the name package.json already uses.
- breaking: none
- contract: n/a
- remediation: [WI-C2-12]
- related: [F-109]

### F-109: Five one-off planning and prompt documents are tracked at the root and outside any docs convention, and three of them read as current although their premises are false
- severity: S3
- category: repo-hygiene
- rules: []
- scope: docs
- confidence: plausible: S3, outside the Phase-4 verification sample. U14 checked the facts (`git ls-files`, `git log --diff-filter=A`, `git show --stat c05b59d`, the NUL byte), and C2 re-checked them at b436647: `git ls-files` root listing, the head of each file, `git check-ignore -v` (the maintainer's global ignore covers `docs/superpowers/`), and claims-register rows C-PROMPT-1/2, C-SPEC-1, C-RESEARCH-1/2.
- verified_by: "U14 read each file and traced references (only the charts checklist cites the charts design) and the deletion precedent c05b59d ('delete docs files', 10 implemented plans/specs/prompts, 6532 lines). C2 confirmed the line content, the NUL at 2026-09-20-visx-charts-design.md:335 (`cat -v` shows `join(\"^@\")`), and that `docs/superpowers/` is ignored by `C:/Users/stick/.config/git/ignore:2` while the one spec under it is tracked."
- locations:
  - executor-prompt-oss-publication.md:1-5
  - executor-prompt-oss-publication.md:24-31
  - executor-prompt-oss-publication.md:38
  - 2026-09-20-visx-charts-design.md:1-5
  - 2026-09-20-visx-charts-design.md:335
  - 2026-09-20-visx-charts-design.md:657-661
  - 2026-09-20-visx-charts-figma-checklist.md:1-3
  - docs/superpowers/specs/2026-08-31-digits-sidebar-mono-design.md:3-5
  - .claude/research/2026-08-27-date-picker-foundation-research.md:1-6
  - .claude/research/2026-08-27-date-picker-foundation-research.md:300
  - .claude/research/2026-08-27-date-picker-foundation-research.md:576
- evidence: |
    executor-prompt:5    You are an executor agent. Your job is to produce concrete file content and configuration changes …
    executor-prompt:25   - `package.json`: `"license": "UNLICENSED"`, `publishConfig.registry` points to GitHub Packages, …
    executor-prompt:30   - `skills/` directory contains consumer skills (orientation, composition, theming) + `init-skills` CLI
    executor-prompt:38   - No: … Storybook deploy, Dependabot, bad…        (.github/workflows/deploy-storybook.yml exists)
    visx-charts-design:5    Status: architecture approved; visual layer pending Figma; implementation pending
    visx-charts-design:335  const seriesKey = series.map((s) => s.id).join("<NUL byte>");   (grep/`file` treat the doc as binary)
    visx-charts-design:659  **Minor — 5.5.** No migration skill (those are for majors only). …
    digits-sidebar-mono-design.md:5  Status: decisions approved; implementation pending   (RollingDigitsText/SidebarWithHoverIcon/MonoText shipped)
    research:5           **Status:** research only. No code was written and none is prescribed. …
    research:300         ### 6.4 Popover: you do not already have one          (src/components/Popover/ exists)
    research:576         Enforcement: `console.warn` in development on a missing or malformed value … and render nothing rather than crashing. …
    Claims register: C-PROMPT-1, C-PROMPT-2, C-SPEC-1, C-SPEC-2, C-SPEC-7, C-RESEARCH-1, C-RESEARCH-2 (STALE); C-SPEC-CHARTS-1 (FALSE).
- impact: The executor prompt is an instruction-shaped file at the repo root, addressed to "an executor agent". Every line of its "Current repo state" block is now false (license, registry, skill names), and decisions in it have since been superseded (Storybook deploy), so an agent that opens it may act on it. The spec says "implementation pending" for shipped work, and the research brief says "No code was written" and that there is no Popover. Both read as current. The charts plan schedules a "Minor — 5.5", which presumes the unreleased "5.4" of F-013. Nothing references four of the five files, and none of them ship. The maintainer's own c05b59d shows that implemented plans are meant to be deleted, and the future-work visx pair sits at the root rather than under docs/superpowers/. The literal NUL byte makes repo-wide greps silently skip the charts design. Caution for the fix: research:576 is the recorded Calendar "render nothing" decision that F-038 (D-12) cites, so deleting the research outright would lose it.
- recommendation: Delete the executor prompt and the implemented spec (git keeps both). Move the research brief out of `.claude/` with a historical status line, because F-038 cites it. Move the visx pair beside the other specs/plans, and write the NUL as an escape.
- breaking: none
- contract: n/a
- remediation: [WI-C2-13]
- related: [F-013, F-038, F-053]

### F-117: S4 batch — doc and comment wording that no longer matches the code, including the file-header-contracts example that still shows `ButtonVariant.brand`
- severity: S4
- category: doc-drift
- rules: [R10.4, R11.2, R11.12]
- scope: docs
- confidence: plausible: S4 and outside the Phase-4 sample, except U14-F2, which V4 (M24) checked and downgraded to S4 (the fhc example illustrates format and instructs nothing). C2 re-opened every remaining line at b436647.
- verified_by: "Each member unit read the cited lines against the code (U3, U8, U9, U10, U13, U14). U9 checked item 23 in the Browser pane: with --pct unregistered, a width CSSTransition still starts. C2 re-quoted every line below at b436647. The claims register regraded U9-F19 item 3 (codebase:306 '(v3)') TRUE as C-CB-122, so it is dropped."
- locations:
  - README.md:185
  - README.md:208-209
  - skills/dooph-design-system-theming/SKILL.md:16-17
  - skills/dooph-design-system-theming/SKILL.md:45-46
  - skills/dooph-design-system-theming/SKILL.md:176-177
  - skills/dooph-design-system-theming/references/token-contract.md:220
  - skills/dooph-design-system-usage/SKILL.md:26-28
  - .agents/skills/dooph-ds-codebase/SKILL.md:29-32
  - .agents/skills/dooph-ds-codebase/SKILL.md:109-112
  - .agents/skills/dooph-ds-codebase/SKILL.md:307
  - .agents/skills/dooph-ds-codebase/SKILL.md:433-435
  - .agents/skills/dooph-ds-codebase/SKILL.md:456
  - .agents/skills/dooph-ds-codebase/SKILL.md:616-620
  - .agents/skills/dooph-ds-codebase/SKILL.md:618
  - .agents/skills/dooph-ds-architecture/SKILL.md:77-78
  - .agents/skills/dooph-ds-architecture/SKILL.md:253
  - .agents/skills/dooph-ds-architecture/SKILL.md:317-321
  - .agents/skills/dooph-ds-contribution/SKILL.md:110
  - .agents/skills/file-header-contracts/SKILL.md:137-154
  - skills-lock.json:4-9
  - src/components/AnimatedText/FadeChangeText.tsx:24-26
  - src/components/AnimatedText/RollChangeText.tsx:19-21
  - src/components/AnimatedText/RevealChangeText.tsx:23-25
  - src/components/AnimatedText/RollingDigitsText.tsx:128-131
  - src/components/Text/BaseText.tsx:41
  - src/components/Sheet/Sheet.tsx:63-65
  - src/components/Sheet/Sheet.stories.tsx:158-159
  - src/components/LoadingSpinner/spinnerGeometry.ts:42
  - src/components/LoadingSpinner/spinnerGeometry.ts:48-52
  - src/components/LinearProgressIndicator/LinearProgressIndicator.tsx:8-9
  - src/components/LoadingSpinner/LoadingSpinner.tsx:200,208,253,263,300,306
  - src/components/ProgressIndicator/ProgressIndicator.tsx:55-57,145,159,238,252,298,306
  - src/components/ShapeMorphSpinner/ShapeMorphSpinner.tsx:65
  - src/components/MorphRotationShape/engine/cubic.ts:7 (same line in morph.ts:7, polygon.ts:7, utils.ts:7)
  - src/components/MorphRotationShape/MorphRotationShape.tsx:1-53
  - src/components/SidebarWithHoverIcon/SidebarWithHoverIcon.tsx:31
  - src/components/SidebarWithHoverIcon/SidebarWithHoverIcon.tsx:150
  - src/components/Icons/index.ts:1-2 (generated by scripts/generate-icon-exports.mjs:39-40)
  - src/components/Icons/ShowMoneyIcon.tsx:6
  - src/components/Icons/BaseIcon.tsx:59
  - src/components/Shapes/BaseShape.tsx:61,70
  - docs/superpowers/specs/2026-08-31-digits-sidebar-mono-design.md:5
- evidence: |
    # | path:line | snippet (verbatim @ b436647) | reality | disposition
    1 | README.md:208 | MIT — see [LICENSE](./LICENSE) for the full text. | the file is LICENSE.txt (dead link on GitHub/npm); C-README-15 | WI-C2-02
    2 | README.md:209 | … remain trademarks of dooph software. | LICENSE.txt:3 "Copyright (c) 2026 Dooph LLC" | WI-C2-02
    3 | README.md:185 · theming:45-46 · token-contract:220 | so your Tailwind learns every `--ui-*` token. · it registers every / `--ui-*` token in your Tailwind build | theme.css maps 130 keys for 259 tokens (motion/size/opacity deliberately unmapped); C-README-13, C-THEME-3 | WI-C2-01, WI-C2-02
    4 | theming:16 | > **Upgrading from v2?** The `--ui-*` names below are the v3 contract. If your | the names below are HEAD's post-v3 names; C-THEME-1 | WI-C2-01
    5 | theming:176-177 | - Mode-invariant tokens (spacing, radius, sizing, fonts) are defined once on / `:root`/`.light`; | tokens.css `.dark` :720-723 re-declares 4 size/radius tokens; C-THEME-12 | no-action: becomes true once F-059's WI removes the 4 redundant `.dark` lines (the 2 that F-059 keeps are colour aliases, outside this sentence's category)
    6 | usage:26-28 | or a pre-composed variant (`BodyText`, `LabelText`, `HeadingText`, / `SubheadingText`, `TitleText`, `HeroText`, `ButtonText`, `MonoText`). | 8 of the 10 roles the same skill lists at :237-239 | WI-C2-04
    7 | codebase:435 | listeners to a node it did not own — see the architecture skill's Rule 6. | the closest() ban is Rule 7 (arch:363-376); C-CB-157 | WI-C2-14
    8 | codebase:30 · arch:78 | `color` prop on Slider*/LinearProgressIndicator · `DS_COLOR_TOKENS` via the `color` prop (`Slider*`, `LinearProgressIndicator`). | also Sticker and AIModelSelect; C-CB-10, C-ARCH-10 | WI-C2-14
    9 | arch:317-321 · codebase:109-112 | Existing families: … `--ui-shape-morph-*`. · scripts/ lists 3 files | missing reveal-change/chat families; 3 of 6 scripts | no-action here: the same lines are F-099 locations (U1-F15, U2-F11)
    10 | codebase:616-620 | Conventions that hold across the surface: / - Components and their `*Props` types … / ### `"use client"` — … | an H3 splits the list; bullets 638-646 now sit under the "use client" heading | WI-C2-14
    11 | codebase:618 | - Components and their `*Props` types come from the component's `index.ts`. | WavyDivider/, LoadingSpinner/, ProgressIndicator/ have no index.ts; C-CB-223 | no-action here: resolved by F-064's barrel WI
    12 | contrib:110 | 4. Reference the new Tailwind utility (e.g. `h-tab`) in the component | no `h-tab` utility exists (only `h-tab-micro`); C-CONTRIB-5 | WI-C2-14
    13 | codebase:456 | Widths are pinned per variant, matching `ToastTypes.simple`/`.complex`. | ToastTypes has 4 keys; the simple width serves simple/prominent/danger; C-CB-165 | WI-C2-14
    14 | codebase:307 | see `dooph-ds-loading-indicators` skill for the wave/geometry model | the wave belongs to ProgressIndicator; C-CB-126 | WI-C2-14
    15 | arch:253 (+ token-contract:77) | Roles whose faces implement no axes (label/title/hero) ship no token. | Text/constants.ts:78 "Bricolage Grotesque has opsz/wght, Host Grotesk has wght"; C-ARCH-30 | WI-C2-14 (+ WI-C2-01)
    16 | fhc:148-151 | * - Do NOT reintroduce `--ui-color-danger*` tokens; … * - Keep `ButtonVariant.brand` in the API even if icon stories omit it. | Button.tsx:12-21 says the opposite; vendored from dooph-software/dooph-skills (skills-lock.json:4-9) | WI-C2-16 (upstream)
    17 | FadeChangeText:24-26 · RollChangeText:19-21 · RevealChangeText:23-25 | Timing, easing, depth and the / reduced-motion case are `--ui-fade-change-*` tokens | reduced motion is a literal `animation-duration: 1ms` / `transition-duration: 1ms` in @media blocks (index.css:727-731, 749-753, 913-918); C-HDR-FadeChangeText-7, C-HDR-RollChangeText-4, C-HDR-RevealChangeText-6 | WI-C2-15
    18 | RollingDigitsText:129 | it. Guarded on the target because the roll's own transitionend and any | an onAnimationEnd handler never receives transitionend | WI-C2-15
    19 | BaseText:41 | * BaseText — every visible string in the system renders through this. | 22 component files apply text-style-* classes directly (R8.17 sanctions it) | WI-C2-15
    20 | Sheet.tsx:63-65 · Sheet.stories:158-159 | Default cross-axis size (width for left/right, height for top/bottom) … fully overridable via `className` | top/bottom set no height (:89,:93); left/right `max-w-96` caps a consumer width unless `max-w-*` is overridden too; C-JSDOC-Sheet-5 | WI-C2-15
    21 | spinnerGeometry:50-52 | * Matches Material Design's indeterminate circular progress timing (1.4 s). / export const SPINNER_ANIM_DURATION = 1800; | it is 1.8 s; C-JSDOC-spinnerGeometry-2 | WI-C2-15
    22 | spinnerGeometry:42 | /** Stroke width in px for each size. Scales with diameter. */ | these are viewBox user units; rendered size comes from the token | WI-C2-15
    23 | LPI.tsx:8-9 | * - Fill width animates when that percentage changes via registered / *   `@property --progress-pct` (custom properties do not interpolate otherwise). | the transition is on `width`/`left` (dooph-component-tokens.css:128-133); C-HDR-LinearProgressIndicator-3 | WI-C2-06
    24 | LS.tsx:253,306 · PI.tsx:306 | className={cn(className)} · className: cn(className), | reported as a single-argument no-op, but cn also tailwind-merges conflicts inside the consumer's own string ("p-2 p-4" → "p-4") | no-action: removing it would change behaviour for no gain (correction to U9-F19 item 7)
    25 | PI.tsx:55-57 | | (typeof LoadingSpinnerColor)[keyof typeof LoadingSpinnerColor] | re-derives the exported `LoadingSpinnerColor` type inline | WI-C2-15
    26 | LS.tsx:263 · LS.tsx:300 · PI.tsx:298 | } as React.CSSProperties · getSpinnerGeometry(size as SpinnerSizeKey) | no-op casts | no-action here: the same lines are F-115 (HA-F5)
    27 | LS.tsx:200 · PI.tsx:145,238 | stroke="var(--ui-color-border-primary)" | matches the letter of R9.19 ("any var()" as an SVG attribute), yet it resolves for presentation attributes in Chromium | no-action: R9.19's scope is a rule-text question, not a code defect (note-to-orchestrator)
    28 | SMS.tsx:65 | width: `var(--ui-size-spinner-${size})`, | a second size→token mapping beside spinnerGeometry.ts:35-40 | no-action: identical output, and unifying it would add a cross-folder deep import (F-064)
    29 | cubic.ts:7 (+ morph/polygon/utils.ts:7) | Behaviour fixes belong in ../svgPath.ts | the file is ./svgPath.ts (engine/svgPath.ts); C-HDR-cubic-2 | WI-C2-15
    30 | Icons/index.ts:1-2 | // This file is generated by scripts/generate-icon-exports.mjs. | R11.12's form is "AUTO-GENERATED by <script>. Do not edit by hand." | WI-C2-15 (via the generator)
    31 | MorphRotationShape.tsx:1-53 | 53-line header | R11.6 "Past ~40 the file is doing too much" | no-action here: restructuring the contract belongs to F-102's header-format pass
    32 | SidebarWithHoverIcon:31 | * - One `getComputedStyle` pair per frame per icon. Fine for a toggle; do not | one call, two reads (the code's own comment at :107: "One style resolution per frame"); C-HDR-SidebarWithHoverIcon-7 | WI-C2-15
    33 | ShowMoneyIcon:6 | <path stroke="none" d="M0 0h24v24H0z" fill="none" /> | Tabler's invisible bounding-box path; it draws nothing | WI-C2-15
    34 | BaseIcon:59 · BaseShape:61 | fill: fillColor ?? undefined, · strokeColor={strokeColor ?? undefined} | no-op coalesce | WI-C2-15
    35 | BaseShape:70 · SidebarWithHoverIcon:150 | export default BaseShape; · export default SidebarWithHoverIcon; | vestigial default exports | no-action here: F-075 (M73)
    36 | spec:5 | Status: decisions approved; implementation pending | shipped; C-SPEC-1 | WI-C2-13 (deletes the spec)
- impact: Each item is small, but each one teaches the next reader something false. A consumer follows a dead licence link and over-reads the preset ("every token"). The next maintainer goes to the motion rule for an ownership question, treats reduced motion as an overridable token, trusts a 1.4 s Material match for a 1.8 s loop, believes `@property` registration drives the LPI transition, reads `BaseText` as the only typography path, and copies a file-header example that keeps the banned `ButtonVariant.brand`. A local fix to the fhc example would not last: the skill is pulled from dooph-software/dooph-skills (skills-lock.json), and the next re-pull would overwrite it.
- recommendation: Reword each line to match the code, in one docs pass per file group. Fix the fhc example upstream and re-pull it. Leave the no-action items to the findings that already own those lines.
- breaking: none
- contract: src/components/AnimatedText/FadeChangeText.tsx, RollChangeText.tsx, RevealChangeText.tsx "Nothing here may hold a duration." → consistent (only the false "reduced-motion case is a token" clause changes; the rule stays) · src/components/AnimatedText/RollingDigitsText.tsx "US format only (`.` decimal, `,` thousands). Do not localize separators." → consistent (the edit is an inline JSX comment outside the header) · src/components/LinearProgressIndicator/LinearProgressIndicator.tsx "Do not add a LinearProgressVariant enum — color is the open design value." → consistent (a `## behavior` bullet is reworded per R10.4) · src/components/MorphRotationShape/engine/{cubic,morph,polygon,utils}.ts "Keep this file a faithful port. Behaviour fixes belong in ../svgPath.ts" → consistent (the path is corrected to ./svgPath.ts; the rule is unchanged) · src/components/SidebarWithHoverIcon/SidebarWithHoverIcon.tsx "`hovered` is CONTROLLED. The component must not go looking for an interactive ancestor to attach listeners to" → consistent (only the :31 performance note's wording changes) · src/components/MorphRotationShape/MorphRotationShape.tsx → not edited (item 31 is no-action)
- remediation: [WI-C2-01, WI-C2-02, WI-C2-04, WI-C2-06, WI-C2-13, WI-C2-14, WI-C2-15, WI-C2-16]; no-action for items 5, 9, 11, 24, 26, 27, 28, 31 and 35, with the reasons given in the table
- related: [F-034, F-059, F-064, F-075, F-099, F-101, F-102, F-115]
- note-to-orchestrator: item 27 (R9.19 says "any var()" as an SVG attribute, but presentation attributes resolve var() in Chromium) is a question about the rule's scope and could join the D-09 rule-text batch.

## DONE
