# F-C3 — final findings (composer C3) @ b436647

### F-025: The vendored radix-ui-design-system skill, listed by the codebase skill as canonical, teaches seven patterns the rulebook bans
- severity: S2
- category: rule-violation
- rules: [R2.1, R8.5, R8.8, R8.10, R8.11, R9.2, R8.16, R8.14, R1.3, R1.1, R1.2, R2.9]
- scope: tooling
- confidence: confirmed
- verified_by: "U14: `rg -n 'forwardRef|displayName|ComponentRef'` over the skill → 0; targeted greps for arbitrary values / opacity-50 / destructive / string variants; skills-lock.json provenance. V4 (M25, CONFIRMED): per-file `grep -c` (5 files, 1354 lines, 12 `export function` components, 0 forwardRef/displayName), counted seven distinct banned patterns, confirmed the skill exists only under `.agents/skills` (bin/init.mjs labels that root Cursor's) and not in `.claude/skills`."
- locations:
  - .agents/skills/radix-ui-design-system/SKILL.md:3
  - .agents/skills/radix-ui-design-system/SKILL.md:5
  - .agents/skills/radix-ui-design-system/SKILL.md:167-169
  - .agents/skills/radix-ui-design-system/SKILL.md:185
  - .agents/skills/radix-ui-design-system/SKILL.md:190
  - .agents/skills/radix-ui-design-system/SKILL.md:212
  - .agents/skills/radix-ui-design-system/templates/component-template.tsx.template:19-39
  - .agents/skills/radix-ui-design-system/templates/component-template.tsx.template:57
  - .agents/skills/radix-ui-design-system/templates/component-template.tsx.template:74
  - .agents/skills/radix-ui-design-system/templates/component-template.tsx.template:129
  - .agents/skills/radix-ui-design-system/examples/dialog-example.tsx:14
  - .agents/skills/radix-ui-design-system/examples/dropdown-example.tsx:20
  - .agents/skills/dooph-ds-codebase/SKILL.md:96
  - .agents/skills/dooph-ds-codebase/SKILL.md:102
  - .agents/skills/dooph-ds-codebase/SKILL.md:653-656
  - skills-lock.json:10-15
  - bin/init.mjs:54-55
- evidence: |
    path:line | snippet | rule it contradicts
    radix SKILL.md:167-169 | `bg-[hsl(var(--color-surface))]` / `rounded-[var(--radius-base)]` / `shadow-[var(--shadow-lg)]` | R8.10, R8.11, R9.2
    radix SKILL.md:185 | "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50", | R8.16 (ds-disabled-state), R8.14 (ds-focus-* ring)
    radix SKILL.md:190 | destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90", | R1.3
    template:28 | destructive: "destructive-styles", | R1.3
    radix SKILL.md:212 | export function Button({ variant, size, children }: ButtonProps) { | R2.1, R8.5, R8.8 (0 forwardRef / displayName in all 5 files)
    template:57 | export function [Component]({ | R2.1, R8.5, R8.8
    template:37 / :129 | variant: "default", / <[Component] variant="default" size="md"> | R1.1, R1.2 (no exported const, string literals)
    template:74 | <[PRIMITIVE].Portal> | R2.9 (unconditional portal, no `portal`/`portalProps`)
    radix SKILL.md:5 | source: self | skills-lock.json:11 `"source": "sickn33/antigravity-awesome-skills",`
    codebase SKILL.md:96 | .agents/skills/               ← authoring-side skills for this repo (canonical source)
    codebase SKILL.md:102 | radix-ui-design-system/     ← Radix UI patterns skill
    codebase SKILL.md:655-656 | `dooph-ds-loading-indicators`, plus the general `radix-ui-design-system` and / `skill-creator`). **Always edit here.**
    bin/init.mjs:55 | label: ".agents/   — Cursor Agent Skills",
- impact: Agents that read `.agents/skills` (Cursor, and any framework the repo targets through bin/init.mjs:54-55) get this skill next to `dooph-ds-architecture`, and the codebase skill calls it part of the canonical authoring set. SKILL.md:3 describes Radix component and theming work, which is most component work in this repo. Its copy-paste template is the opposite of arch Rules 1 and 2: no forwardRef/ComponentRef/displayName, a `destructive` key, string variants with no const, raw `var()` in arbitrary values, `opacity-50` disabling, an unconditional portal. Nothing in arch or contrib says arch wins. The template is the easier of the two to follow. Claude Code does not auto-load it, because it is absent from `.claude/skills`; for Claude-only work the cost is lower. One untracked prior agent note (`.superpowers/sdd/task-11-report.md:82-87`) treated the skill as "generic … teaching examples" and left it alone. So the generic-versus-canonical question has already been settled ad hoc once.
- recommendation: Decide the vendored skill's status. My pick is removal: arch Rule 2 and the contribution skill already cover Radix wrapping for this repo, and quarantine still leaves a contradicting template on disk. Removal means deleting the skill directory, dropping its skills-lock.json entry and removing it from the codebase skill's canonical list. If it is kept, the codebase skill should list it as third-party and non-normative, arch Rule 2 should state that arch overrides it, and the `source:` mismatch should be noted.
- breaking: none
- contract: n/a
- remediation: decision D-11 (+ blocked WI-013)
- related: [F-058, F-099]

### F-034: LoadingSpinner times its motion in JavaScript (an infinite rAF loop with a 1800 ms duration and cosine easing, plus an inline spokes animation with a JS-computed duration) and has no reduced-motion path. The loading-indicators skill prescribes this; arch Rule 6 forbids it
- severity: S2
- category: wrong-layer
- rules: [R6.1, R6.2, R6.4, R6.5, R9.14, R12.8]
- scope: consumer-visible
- confidence: confirmed
- verified_by: "U9: read LoadingSpinner.tsx 1-326 and spinnerGeometry.ts 1-146; `grep '--ui-(spinner|progress|loading)' src/styles/*.css` → none; listed every `prefers-reduced-motion` block, and none targets the spinner. V4 (M21, CONFIRMED): no `## behavior`/`## constraints` header in either file. Read li:134-176/238 against arch Rule 6 and tested three reconciliations, none of which holds. Found an in-repo precedent for CSS-clocked SVG motion (`@property --ds-shape-morph-clock`, index.css:57, animated at :798, reduced-motion `animation: none` at :810-812)."
- locations:
  - src/components/LoadingSpinner/spinnerGeometry.ts:48-52
  - src/components/LoadingSpinner/spinnerGeometry.ts:60-71
  - src/components/LoadingSpinner/LoadingSpinner.tsx:104-110
  - src/components/LoadingSpinner/LoadingSpinner.tsx:128-181
  - src/components/LoadingSpinner/LoadingSpinner.tsx:254-264
  - src/styles/index.css:935-947
  - .agents/skills/dooph-ds-loading-indicators/SKILL.md:155-176
  - .agents/skills/dooph-ds-loading-indicators/SKILL.md:238
  - .agents/skills/dooph-ds-architecture/SKILL.md:311-313
  - .agents/skills/dooph-ds-architecture/SKILL.md:317-324
  - .agents/skills/dooph-ds-architecture/SKILL.md:336-347
  - .agents/skills/dooph-ds-architecture/SKILL.md:351-353
- evidence: |
    spinnerGeometry.ts:50   * Matches Material Design's indeterminate circular progress timing (1.4 s).
    spinnerGeometry.ts:52   export const SPINNER_ANIM_DURATION = 1800;            (comment says 1.4 s; stale, V4 correction)
    spinnerGeometry.ts:71   export const SPINNER_SPOKES_DURATION = 1280;
    LoadingSpinner.tsx:137  const phase = (elapsed % SPINNER_ANIM_DURATION) / SPINNER_ANIM_DURATION;
    LoadingSpinner.tsx:140  const easedPhase = (1 - Math.cos(phase * twoPi)) / 2;
    LoadingSpinner.tsx:176  frameId = requestAnimationFrame(animate);          (unconditional; stopped only by cleanup :180)
    LoadingSpinner.tsx:260  animation: `ds-spinner-rotate ${spokesDuration}ms linear infinite`,
    LoadingSpinner.tsx:262  ...style,                                          (only a consumer `style` can override; no stylesheet can without !important)
    li SKILL.md:161         const arcEndAngle = SPINNER_START_ANGLE + (elapsed / DURATION) * 2 * twoPi; // 2 revs/cycle
    li SKILL.md:238         - **Do not add `animation` CSS to the flat spinner or its paths.** The flat spinner is fully rAF-driven; CSS animation on those elements will fight the rAF loop.
    arch SKILL.md:313       is a design value, so it lives in `tokens.css` and is consumed by CSS. A … it must not own its *timing*.
    arch SKILL.md:344       The component then holds no duration, no easing and no reduced-motion branch;
    arch SKILL.md:351-352   - Hardcode a duration or easing curve in a component (`const DURATION_MS = 220`, / a hand-rolled `easeOutCubic`). Both have shipped here and both had to be
- impact: |
    Consumer: a user with `prefers-reduced-motion: reduce` gets both spinner variants at full motion. The flat rAF loop never consults CSS, and the spokes rotation is an inline `animation` that a stylesheet media query cannot override without `!important`. Speed and easing cannot be retuned through tokens, which is the point of Rule 6, because no `--ui-spinner-*` family exists (arch:317-321 lists none). The flat loop runs every frame for the component's whole life. Rule 6's escape hatch requires a self-terminating sampler.
    Next agent: li:155-176 and li:238 prescribe exactly this model, and arch:351-352 bans it. Whichever skill is loaded decides the edit. li's description names LoadingSpinner, so an agent editing the spinner gets the banned model as the rule. Two stale comments make it worse. spinnerGeometry.ts:50 says the cycle is 1.4 s while the value is 1800. index.css:939-941 says `ds-spinner-rotate` is "only referenced by WavySpinner"; it is the spokes variant's keyframe (LoadingSpinner.tsx:260), and that comment is carried by F-101.
- recommendation: Decide between two options. One: move the spinner's timing into a `--ui-spinner-*` token family consumed by CSS, using the Rule 6 escape hatch: registered numbers animated by a `ds-*` class and sampled by the existing path-writing loop, plus a reduced-motion block. Two: record a reasoned exception in arch Rule 6 and leave li as is. My pick is the first. The component keeps its geometry (the `<path>` arcs li rightly requires) and stops owning duration, easing and the reduced-motion decision. A precedent for an SVG motion clocked by a CSS `infinite` animation already exists in the shape-morph loader. The one rule text that needs amending is arch:342's "self-terminating" condition: it should sanction a perpetual sampler for an indeterminate loader whose clock is a CSS animation, with the loop ending once that animation is `none`.
- breaking: none
- contract: n/a (LoadingSpinner.tsx and spinnerGeometry.ts carry JSDoc only, no `## behavior`/`## constraints` header; the conflicting text is the li skill's rule at li:238, which is why this is a decision item)
- remediation: decision D-04 (+ blocked WI-050)
- related: [F-016, F-051, F-101]

### F-051: The loading-indicators skill says spinner size tokens are inert ("Changing tokens.css alone has no effect on rendered size"), but every spinner SVG renders its width and height from the token
- severity: S2
- category: doc-drift
- rules: [R12.2, R9.20]
- scope: internal
- confidence: confirmed
- verified_by: "U14/U9: grep of `cssSize` across LoadingSpinner, ProgressIndicator and spinnerGeometry; read spinnerGeometry.ts:1-40. V4 (M22, CONFIRMED): rendered both spinner variants and ProgressIndicator from the built dist with react-dom/server. Flat output `width=\"32\" … style=\"width:var(--ui-size-spinner-md);height:var(--ui-size-spinner-md)\"`. A CSS width/height property overrides the presentation attribute, so the token decides the rendered size. Correction applied: only li:53 is false; li:51's 'Keep them in sync' reads consistently as a defaults-alignment note."
- locations:
  - .agents/skills/dooph-ds-loading-indicators/SKILL.md:53
  - .agents/skills/dooph-ds-loading-indicators/SKILL.md:51
  - .claude/skills/dooph-ds-loading-indicators/SKILL.md (stale real copy carrying the same text; see F-058)
  - src/components/LoadingSpinner/spinnerGeometry.ts:17-22
  - src/components/LoadingSpinner/spinnerGeometry.ts:136
  - src/components/LoadingSpinner/LoadingSpinner.tsx:194
  - src/components/LoadingSpinner/LoadingSpinner.tsx:256-257
  - src/components/ProgressIndicator/ProgressIndicator.tsx:137
  - src/components/ProgressIndicator/ProgressIndicator.tsx:229
- evidence: |
    li:53   **CRITICAL:** The CSS tokens are a consumer-facing contract, but the components render `<svg width={diameter}>` from the JS constants. **Changing tokens.css alone has no effect on rendered size.** You must update `SPINNER_DIAMETERS` (and `SPINNER_STROKE_WIDTHS`) in `spinnerGeometry.ts` to match.
    li:51   Values live in both `tokens.css` (`--ui-size-spinner-*`) and `spinnerGeometry.ts` (`SPINNER_DIAMETERS`, `SPINNER_STROKE_WIDTHS`). **Keep them in sync.**
    spinnerGeometry.ts:17-20  * This is NOT the rendered size. The rendered size comes from / * `SPINNER_SIZE_VARS` below, … The two agree at the defaults, and they are / * allowed to diverge: overriding a token resizes the spinner and every part of
    spinnerGeometry.ts:136    cssSize: SPINNER_SIZE_VARS[size],
    LoadingSpinner.tsx:194    style={{ width: cssSize, height: cssSize, ...style }}
    ProgressIndicator.tsx:137 style={{ width: cssSize, height: cssSize, ...style }}
    contrib:137               | A JS table of sizes that a token is documented as controlling | … | Render from the token and keep the JS number for the viewBox / geometry only |
    claims register: C-LI-15 (li:51-53) FALSE; C-LI-14 (li:51) STALE; C-LIC-1 (.claude copy, li:53 text) FALSE
- impact: The li skill is the one an agent loads to retune a spinner, and this is a CRITICAL callout. It tells the agent to edit `SPINNER_DIAMETERS` to change the rendered size. That table is the viewBox user-unit space, so editing it changes the stroke and arc proportions and leaves the rendered size alone. That is the regression spinnerGeometry.ts:24-26 records, and contrib:137 names it as an anti-pattern. The codebase skill (codebase:473-477) and the shipped token-contract.md:188-190 both describe the token correctly, so the authoring skills now contradict each other. Consumers are unaffected; the code is right.
- recommendation: Rewrite li:53 to the two-space model that spinnerGeometry.ts:4-11 already states: user units for the viewBox, `cssSize` from the token for the rendered size. Keep li:51 only as "the table's default diameters match the token defaults so the spec table stays accurate." Re-sync the `.claude` copy in the same change.
- breaking: none
- contract: n/a (spinnerGeometry.ts has a JSDoc block, not a sectioned contract; its "they are allowed to diverge" is consistent with the recommendation)
- remediation: [WI-014]
- related: [F-034, F-058, F-100]

### F-054: The Checkbox and CodeDigitInput header contracts still use the removed `brand` spelling; Checkbox's lists a `brand` member of `CheckboxVariant` that does not exist. The Sticker header and the `StickerVariant` JSDoc state a wash and content model that the dark tokens break
- severity: S2
- category: contract-drift
- rules: [R10.4, R11.2, R1.3]
- scope: internal
- confidence: confirmed
- verified_by: "U6: read the Checkbox.tsx:1-17 and CodeDigitInput.tsx:1-14 headers against Checkbox/constants.ts:12-15 and CodeDigitInput.tsx:50-56. U12: compared the Sticker header and constants.ts JSDoc against the tokens.css `.dark` block. V6 (M35, PARTIAL; U6-F1 CONFIRMED): `grep -rn '\bbrand\b' src/components`; there is no `brand` token or class (CSS hits are prose). Correction applied: the header writes ``CheckboxVariant` (brand | primary)``, not the literal `CheckboxVariant.brand`; Checkbox.tsx:54 is a third, non-header mention. Re-read @ b436647 by C3, which adds CodeDigitInput.tsx:8 `error-primary` (the code paints `danger-primary`, :50)."
- locations:
  - src/components/Checkbox/Checkbox.tsx:2
  - src/components/Checkbox/Checkbox.tsx:6
  - src/components/Checkbox/Checkbox.tsx:54
  - src/components/Checkbox/constants.ts:12-15
  - src/components/VerificationCode/CodeDigitInput.tsx:8-9
  - src/components/VerificationCode/CodeDigitInput.tsx:50
  - src/components/VerificationCode/CodeDigitInput.tsx:56
  - src/components/Sticker/Sticker.tsx:5-7
  - src/components/Sticker/constants.ts:8-13
  - src/styles/tokens.css:707-718
- evidence: |
    Checkbox.tsx:2        * Checkbox — Radix checkbox with brand/primary checked fills.
    Checkbox.tsx:6        * - Checked/indeterminate fill follows `CheckboxVariant` (brand | primary).
    Checkbox.tsx:54       // active border matches typeabletrigger hover, not brand
    constants.ts:12-14    export const CheckboxVariant = { / prominent: "prominent", / primary: "primary",
    CodeDigitInput.tsx:8  * - `hasError` paints error-primary border + text; `disabled` uses secondary
    CodeDigitInput.tsx:9  *   disabled tokens + `ds-disabled-state`; focus uses brand focus ring.
    CodeDigitInput.tsx:50 ? "border-danger-primary bg-secondary text-danger-primary"
    CodeDigitInput.tsx:56 "focus-within:border-input-border-focus focus-within:shadow-focus-prominent",
    Sticker.tsx:6-7       *   wash. Both are already-resolved tokens (the wash is a color-mix at the / *   sticker opacity), so the component does not apply alpha a second time.
    constants.ts:10-11    * secondary button's active border, and danger washes danger-secondary while / * its content is danger-primary. The wash alpha is `--ui-sticker-bg-opacity`
    tokens.css:717-718    --ui-color-sticker-danger: #ffffff; / --ui-color-sticker-bg-danger: #ffffff;   (inside `.dark`)
- impact: The header is the first text an editing agent reads, and R11.2 makes it authoritative. On Checkbox, an agent following it writes `CheckboxVariant.brand`, which is a compile error, or "restores" a `brand` key, which arch:32 forbids. CodeDigitInput's header names two spellings the code does not use (`error-primary`, `brand`). On Sticker, the header says every wash is a `color-mix` at the sticker opacity, yet the dark danger wash is the opaque hex `#ffffff`. That breaks the header's own constraint (Sticker.tsx:18-20) and causes the invisible dark danger sticker (F-001). `StickerVariant`'s JSDoc ships in dist/index.d.ts and tells consumers that danger's content is danger-primary, which holds in light mode only.
- recommendation: Rewrite the Checkbox and CodeDigitInput behavior lines in current vocabulary: `prominent | primary`, a "prominent focus ring", `danger-primary`. Delete the Checkbox.tsx:54 "not brand" aside. For Sticker, settle the dark danger look first (D-07, owned by F-001). Then make the header and the `StickerVariant` JSDoc state the result for both modes.
- breaking: none
- contract: src/components/Checkbox/Checkbox.tsx "Style states via Radix `data-[state]` / `data-[disabled]` only — no JS class toggling for checked/disabled." → consistent (behavior text only); src/components/VerificationCode/CodeDigitInput.tsx "Do not hardcode Host Grotesk here; body role + size/weight props own it." → consistent; src/components/Sticker/Sticker.tsx "Do not bake the wash alpha into a hex." → consistent (F-001's recommended option restores the opacity-driven wash, after which the header's wash sentence is true again)
- remediation: [WI-018]; Sticker part: decision D-07 (+ blocked WI-056)
- related: [F-001, F-102, F-010]

### F-058: Skill mirroring uses three mechanisms. With core.symlinks=false (this repo's setting and the Git for Windows default), Claude agents lose the rulebook skills but still load a stale real copy that teaches `LoadingSpinnerColor.brand`
- severity: S2
- category: repo-hygiene
- rules: [R1.3, R12.1]
- scope: tooling
- confidence: confirmed
- verified_by: "U14: `git ls-files -s` mode and blob compare of `.claude/skills` against `.agents/skills` (65 same, 1 differs); `cmd /c dir /AL`; inspected the fresh checkout in ../dooph-ds-audit-build. V4 (M23, CONFIRMED): ran an independent `git -c core.symlinks=false clone` and found the 120000 entries materialise as 38-56-byte text FILES while `dooph-ds-loading-indicators` is a real dir holding the stale text. Correction applied: scope is 'a clone with core.symlinks=false', not every clone. Re-checked by C3 @ b436647: 7 mode-120000 entries, `git config core.symlinks` → false, `git diff --no-index --stat` → 4+/12-."
- locations:
  - .claude/skills/dooph-ds-loading-indicators/SKILL.md:25
  - .claude/skills/dooph-ds-loading-indicators/SKILL.md:30
  - .claude/skills/dooph-ds-loading-indicators/SKILL.md:201-202
  - .claude/skills/dooph-ds-architecture (mode 120000), .claude/skills/dooph-ds-codebase (120000), .claude/skills/dooph-ds-contribution (120000), .claude/skills/dooph-ds-writing-version-migrations (120000)
  - .claude/skills/file-header-contracts/ and .claude/skills/using-airbnb-visx-lib/ (absolute junctions on the maintainer's disk; 4 + 43 tracked 100644 copies in git)
  - .claude/skills/skill-creator/ (real copy, 18 tracked files)
  - .agent/skills/dooph-ds-architecture, .agent/skills/dooph-ds-codebase, .agent/skills/dooph-ds-contribution (mode 120000; 3 of the 9 canonical skills)
  - .agents/skills/dooph-ds-codebase/SKILL.md:96-107
  - .agents/skills/dooph-ds-codebase/SKILL.md:653-662
  - .agents/skills/dooph-ds-codebase/SKILL.md:676-677
- evidence: |
    .claude/.../SKILL.md:25   LoadingSpinnerColor.primary / .brand   // or arbitrary hex via color prop
    .claude/.../SKILL.md:202  LoadingSpinnerColor.brand    → var(--ui-color-brand)
    canonical .agents/.../SKILL.md:25  LoadingSpinnerColor.primary / .prominent  // or arbitrary hex via color prop
    src/components/LoadingSpinner/constants.ts:16-19  export const LoadingSpinnerColor = { primary: "primary", prominent: "prominent", } as const;
    git ls-files -s  120000 … .claude/skills/dooph-ds-codebase   (blob content `../../.agents/skills/dooph-ds-codebase`)
    git config core.symlinks  → false
    fresh core.symlinks=false checkout (V4): FILE .claude/skills/dooph-ds-codebase 38B: ../../.agents/skills/dooph-ds-codebase
    codebase:107  dooph-ds-loading-indicators/← real copy (not symlinked)        (lists 4 of the 8 `.claude/skills` entries)
    codebase:660-661  `core.symlinks = false` on this repo (and Windows checkouts generally) means git / often materializes those mode-`120000` links as empty/real directories instead
    claims register: C-CB-30 (codebase:103-107) STALE; C-CB-234 (codebase:661 "empty/real directories") FALSE; C-CB-232 (codebase:653-656) STALE; C-LIC-1..C-LIC-4 (.claude copy) FALSE
- impact: |
    In any core.symlinks=false checkout (a Windows clone, a worktree, CI on Windows), Claude Code finds no `dooph-ds-architecture`, `-codebase`, `-contribution` or `-writing-version-migrations` skill, because those entries are text files. It does find the stale loading-indicators copy. In that checkout the only dooph-ds rulebook skill Claude can load is the stale one. That copy names a `LoadingSpinnerColor.brand` key and a `--ui-color-brand` token, neither of which exists (tsc error, dead CSS var), and invites "restoring" `brand` (R1.3). It also omits the canonical's R12.1 paragraph (consts live in a `constants.ts` with no "use client"). Even on the maintainer's machine, Claude loads that stale real copy.
    Two of the mirrors are absolute junctions into this one checkout, and git tracks their contents as 47 regular files. Every other clone gets independent copies of those files, and they will drift on the next canonical edit, which is the same failure as the loading-indicators copy, twice over. The codebase skill describes only part of this and misdiagnoses it: the links materialise as plain text files, not "empty/real directories", and the plain file is what an agent has to look for.
- recommendation: Choose one mirroring mechanism that survives core.symlinks=false (D-10). My pick is tracked real copies in `.claude/skills`, generated from `.agents/skills` by a zero-dependency copy script that has a `--check` mode, with the codebase skill documenting it as the one sync step. I would also delete `.agent/skills`: nothing in this repo reads it, and it carries 3 of the 9 skills. Separately, and regardless of the decision, refresh the stale loading-indicators copy from canonical now and correct the codebase skill's mirror facts.
- breaking: none
- contract: n/a
- remediation: decision D-10 (+ blocked WI-028); unblocked [WI-012] refreshes the stale copy and the codebase skill's mirror facts now
- related: [F-025, F-051, F-099, F-100]

### F-066: Variant-to-class resolution uses cva in 7 components and is hand-built in 9 with four idioms (`&&` chains, ternaries, `satisfies` lookup maps, a JS size table), while the contribution workflow assumes every component has a cva map
- severity: S3
- category: inconsistency
- rules: [R8.24]
- scope: internal
- confidence: plausible: S3 horizontal finding, not in the Phase-4 verification sample; facts re-checked by C3 @ b436647 (`grep -n 'cva(' src` → 6 recipes; each hand-built site re-read)
- verified_by: "HB: `rg -n 'cva\(' src` → 6 recipes in 7 components (Tabs borrows toggleOption's). `rg -n 'size === |variant === |satisfies Record|SIZES\[|ITEM_SIZE' src/components` → the hand-built sites, each read (population in H2-matrix §2.11). C3 re-read every location below @ b436647."
- locations:
  - src/components/Button/Button.tsx:37
  - src/components/Checkbox/Checkbox.tsx:33
  - src/components/Sheet/Sheet.tsx:67
  - src/components/Sticker/Sticker.tsx:31
  - src/components/Toast/Toast.tsx:56
  - src/components/Toggle/toggleOption.ts:25
  - src/components/Avatar/Avatar.tsx:23-24
  - src/components/Tooltip/Tooltip.tsx:67-72
  - src/components/Menu/DropdownMenu.tsx:212
  - src/components/DropdownTrigger/DropdownTrigger.tsx:324-327
  - src/components/Input/Input.tsx:78-81
  - src/components/AIChat/AIToolPart.tsx:48
  - src/components/AIChat/AIToolPart.tsx:71-74
  - src/components/ShapeButton/ShapeButton.tsx:78
  - src/components/ShapeButton/ShapeButton.tsx:84
  - src/components/ShapeButton/ShapeButton.tsx:128
  - src/components/SegmentedTabSelect/SegmentedTabSelect.tsx:36-40
  - src/components/SegmentedTabSelect/SegmentedTabSelect.tsx:57-58
  - src/components/CTAButton/CTAButton.tsx:65-66
  - src/components/CTAButton/CTAButton.tsx:110
  - .agents/skills/dooph-ds-contribution/SKILL.md:97-98
- evidence: |
    path:line | snippet | idiom
    Button.tsx:37 | const buttonVariants = cva( | cva (also Checkbox:33, Sheet:67, Sticker:31, Toast:56, toggleOption.ts:25 → Toggle/Tabs/SegmentedTabSelect items)
    Avatar.tsx:23 | size === AvatarSize.standard && "size-[38px] rounded-avatar p-xs", | `&&` chain
    Tooltip.tsx:67 | variant === TooltipTypes.simple && | `&&` chain
    DropdownMenu.tsx:212 | variant === DropdownMenuItemVariant.danger && [ | `&&` chain
    DropdownTrigger.tsx:324 | size === TextDropdownSize.default && | `&&` chain
    AIToolPart.tsx:71-73 | state === AIToolPartState.error / ? "text-danger-primary" / : "text-ghost-fg", | ternary
    ShapeButton.tsx:78 | } satisfies Record<ShapeButtonVariant, string[]>; | `satisfies` lookup map
    SegmentedTabSelect.tsx:36 | const ITEM_SIZE: Record<SegmentedSize, TabSize> = { | lookup map
    CTAButton.tsx:65-66 | const s = SIZES[size]; / const isPrimary = variant === CTAButtonVariant.primary; | JS size table + boolean
    contrib:97 | 4. Tailwind utility changes → edit the `cva` variant maps or base class strings in the component file.
    contrib:98 | 5. Remove deprecated variants/sizes from both the `cva` map AND the exported const object.
- impact: The Figma-sync step (contrib:97) and the deprecation step (contrib:98, R8.24) both tell the next agent to edit "the cva map". Nine of the 16 class-selecting components have none. Removing a key from the const then leaves a dead `&&` branch (Avatar, Tooltip, DropdownMenuItem, TextDropdownTrigger) or a `satisfies` map that stops compiling (ShapeButton), and the agent has to discover each component's idiom by reading it. No skill names a precedent, so whichever component an agent copies decides what it learns: Avatar teaches `&&` chains, ShapeButton `satisfies` maps, Sticker cva. SplitButtonAction/Trigger have already drifted from Button's look by hand-rebuilding it instead of reusing the recipe (F-081). The typing and export halves of the cva question are filed separately (F-037, F-087).
- recommendation: Record a class-resolution convention (D-17). My pick: cva is the one mechanism for a discrete prop that selects classes, which the contribution workflow already assumes. Prop-to-geometry and sub-component switches stay as they are: LoadingSpinner, ProgressIndicator, WavyDivider, DropdownMenuSegment, DropdownCaret, Slider paints, Input's structural `isNumber`/`hasIcon`. The rule should name the nine hand-built components as known legacy, to be converted when next touched, with their props typed from the consts rather than `VariantProps` (F-037). contrib:97-98 should then point to that rule instead of assuming a map exists.
- breaking: none
- contract: src/components/ShapeButton/ShapeButton.tsx "`shapeComponents` must stay keyed by `ShapeButtons`, which `satisfies Record<string, Shapes>`" → consistent (that constraint is about the shape map, not the variant class map); src/components/Toggle/toggleOption.ts "Never prefix a package class (h-button, size-*, ds-*) with a variant." → consistent (a cva conversion must keep package classes unprefixed); src/components/Input/Input.tsx, src/components/AIChat/AIToolPart.tsx, src/components/Menu/DropdownMenu.tsx headers → consistent (none constrains the class-resolution mechanism)
- remediation: decision D-17 (+ blocked WI-019)
- related: [F-037, F-087, F-081, F-103]

### F-099: The codebase skill misdescribes the build, the text roles, the slider, the style layer and the menu API, and omits five shipped component folders. The usage skill's input, navigation and menu lines name components without their consts or content props
- severity: S3
- category: doc-drift
- rules: [R1.1, R8.19]
- scope: internal
- confidence: plausible: S3 outside the 29% Phase-4 sample. Every member claim was re-graded by the HD claims register (43 FALSE/STALE CB rows, conflicts re-checked by HD), and C3 re-read each cited line @ b436647.
- verified_by: "U14: `ls src/components` → 42 folders against 37 in codebase:38-86; `grep -c` for each missing folder → 0. U2: compared codebase:108-113/587-593 with package.json:50 and tsup.config.ts:54-57. U3/U1: TextVariant has 10 keys and index.css has 10 `.text-style-*` rules. U6: Slider.tsx inline-style dots against codebase:283-285. U5: grep of skills/ for menu consts and props → 0. HD claims register §1 CB: 43 FALSE/STALE rows. C3 @ b436647: `ls scripts` → 6 files; a loop over src/components for a missing index.ts → LoadingSpinner, ProgressIndicator, WavyDivider."
- locations:
  - .agents/skills/dooph-ds-codebase/SKILL.md:29-32
  - .agents/skills/dooph-ds-codebase/SKILL.md:34
  - .agents/skills/dooph-ds-codebase/SKILL.md:38-86
  - .agents/skills/dooph-ds-codebase/SKILL.md:79
  - .agents/skills/dooph-ds-codebase/SKILL.md:109-112
  - .agents/skills/dooph-ds-codebase/SKILL.md:152
  - .agents/skills/dooph-ds-codebase/SKILL.md:202
  - .agents/skills/dooph-ds-codebase/SKILL.md:206-223
  - .agents/skills/dooph-ds-codebase/SKILL.md:237
  - .agents/skills/dooph-ds-codebase/SKILL.md:283-285
  - .agents/skills/dooph-ds-codebase/SKILL.md:307
  - .agents/skills/dooph-ds-codebase/SKILL.md:433-435
  - .agents/skills/dooph-ds-codebase/SKILL.md:442
  - .agents/skills/dooph-ds-codebase/SKILL.md:451
  - .agents/skills/dooph-ds-codebase/SKILL.md:456
  - .agents/skills/dooph-ds-codebase/SKILL.md:459-463
  - .agents/skills/dooph-ds-codebase/SKILL.md:500
  - .agents/skills/dooph-ds-codebase/SKILL.md:531
  - .agents/skills/dooph-ds-codebase/SKILL.md:542
  - .agents/skills/dooph-ds-codebase/SKILL.md:547-549
  - .agents/skills/dooph-ds-codebase/SKILL.md:587-599
  - .agents/skills/dooph-ds-codebase/SKILL.md:616-646
  - .agents/skills/dooph-ds-architecture/SKILL.md:36-55
  - .agents/skills/dooph-ds-architecture/SKILL.md:317-321
  - skills/dooph-design-system-usage/SKILL.md:120-129
  - skills/dooph-design-system-usage/SKILL.md:130-141
  - skills/dooph-design-system-usage/SKILL.md:142-143
  - src/components/Text/constants.ts:66
- evidence: |
    path:line | snippet | reality (claims-register C-ID)
    codebase:39-86 | tree runs `AnimatedText/` … `WavyDivider/` | 5 of 42 folders missing: AIChat, DropdownCaret, MorphRotationShape, ShapeMorphSpinner, Sticker (C-CB-15 FALSE)
    codebase:79 | Text/ ← BaseText + 8 roles, constants.ts (Fonts/FontSizes/ | 10 roles; codebase:321 itself says "The **ten** role components" (C-CB-22 FALSE)
    codebase:547 | … `text-style-mono` — one per `TextVariant` (eight), | 10 rules incl. text-style-hero-body / -hero-button (C-CB-203 FALSE); :549 "four edits in step" is incomplete (C-CB-206 STALE)
    codebase:109-112 | scripts/ lists generate-icon-exports, sync-theme, copy-theme | also add-use-client.mjs, generate-shape-morph-ease.mjs, shapeMorphSpring.mjs (C-CB-32 STALE)
    codebase:588-592 | npm run build → generate-icon-exports → sync-tokens → tsup (build:js) | package.json:50 adds generate-shape-morph-ease; tsup.config.ts:55 runs add-use-client before emitCssAssets (C-CB-216 STALE)
    codebase:542 | `ds-slider-fill` (45% of `--ds-slider-color` … active `--ui-color-text` at 40%) | dooph-component-tokens.css:121 `--ds-slider-track-opacity`; :157 `--ui-color-slider-step-primary-active` (C-CB-198, C-CB-200 STALE)
    codebase:283-285 | dots, both fills and the handle share one percent formula | dots are an inline style (Slider.tsx:401); formula written 3× (C-CB-117 FALSE)
    codebase:500 | IDENTITY pair … where the alt *does* differ per mode | tokens.css:148-151 a trio, "All three are mode-invariant" (C-CB-181 FALSE)
    codebase:461-463 | Current families: … `--ui-rolling-digits-*` and `--ui-sidebar-icon-*`. | also `--ui-shape-morph-*`, `--ui-reveal-change-*`, `--ui-chat-*` (C-CB-170 STALE); arch:317-321 likewise (C-ARCH-35 STALE)
    codebase:152 | `Checkbox` … | `CheckboxChecked` | | `CheckboxVariant` (prominent|primary) missing (C-CB-54 STALE); arch:36-55 table has no CheckboxVariant row
    codebase:206-207 | 3-cell header, 4-cell separator | (C-CB-74 FALSE); no row for `DropdownMenuSearch` or `DropdownCaret`
    codebase:618-619 | - Components and their `*Props` types come from the component's `index.ts`. / ### `"use client"` — … | 3 folders have no index.ts (C-CB-223 FALSE); the H3 splits the conventions list so :638-646 sit under "use client"
    codebase:442 | Double-border shell: outer dashed ring + inner surface card | OutlineSection.tsx:22 `border-solid` (C-CB-159 FALSE)
    codebase:237 | unsuffixed `slide-*` resolves to 0.25rem in Tailwind v4 | HD compile: `.slide-in-from-right { --tw-enter-translate-x: 100%; }` (C-CB-102 FALSE, UNCOVERED); same sentence in Sheet.tsx:54-56 JSDoc
    usage SKILL.md:120 | - **Inputs:** `Input`, `SearchBox`, `Checkbox`, `ToggleSwitch` (+ `ToggleSwitchItem`), | no InputVariant (icon required, throws), ToggleVariant/ToggleSize, CheckboxVariant/CheckboxChecked
    usage SKILL.md:141 | - **Triggers:** `DropdownTrigger`, optional `DropdownTriggerContent`, `TypeableDropdownTrigger`, `TextDropdownTrigger`. | no TextDropdownSize; menus line omits DropdownMenuSearch, DropdownMenuItemVariant, DropdownMenuSegmentVariant, matchTriggerWidth/dismissOnFocusLoss/portal/portalProps
    Text/constants.ts:66 | /** Letter-spacing tokens. Only these three roles ship a tracking token. */ | four keys follow (body, label, hero, mono)
    (full disposition of all 43 CB rows: WI-016)
- impact: The codebase skill's description says it answers "whether a component or token already exists" and "how the build emits its assets". For the five newest folders (about 40 public exports) it answers no, so an agent asked to add a chat part, a sticker or a caret either duplicates an existing component or misses its header contract. The build section omits the `add-use-client` stamp that decides RSC safety (F-011) and the generated shape-morph ease, so an agent debugging either cannot learn the step exists. Several lines invite a wrong edit: "45%" invites re-hardcoding an opacity the tokens own, "eight roles" hides two roles from whoever adds the next one, and the incomplete motion-family lists cannot be used to check Rule 6. The shipped usage skill lists inputs, tabs and menus by name only, so a consumer agent cannot discover `InputVariant.iconText` (whose `icon` is required and throws), the Toggle/Tab/Checkbox consts or `DropdownMenuItemVariant.danger`. It then types string literals (R1.1) or hand-rolls a danger item.
- recommendation: Correct the codebase skill line by line against the claims register: complete the tree and inventory, regenerate the build and scripts blocks from package.json and tsup.config.ts, fix the counts, the slider, identity and focus-helper lines and the menu table, and restore the conventions list structure. Where a list cannot stay complete, replace it with the command that produces it. Rows whose truth depends on another remediation (asChild, "use client" stamping, the "5.4" label) are left to that remediation and listed as such in the WI. Add the missing consts and content props to the usage skill's Inputs, Triggers, Menus and Navigation lines. Correct the Text/constants.ts:66 count.
- breaking: none
- contract: n/a (skills carry no header contracts; Text/constants.ts has none)
- remediation: [WI-016, WI-051]
- related: [F-003, F-011, F-013, F-027, F-047, F-048, F-058, F-064, F-065, F-087, F-101, F-117]

### F-100: The contribution skill's own examples and checklist values are stale or teach a banned pattern, and the loading-indicators skill's description never triggers for the shape-morph components its body documents
- severity: S3
- category: doc-drift
- rules: [R1.1, R9.13, R8.20, R8.13]
- scope: internal
- confidence: confirmed
- verified_by: "U14: compared tokens.css:536-540 (radius) and :409-410 (title/hero) and Checkbox.stories.tsx:42,104 against contrib:17/29-34/78/151; read li:1-8 and :246-282. V8 (M71, PARTIAL): U14-F8 CONFIRMED at S3 (no 23px/36px override exists anywhere). U14-F9's fact is confirmed but it is DOWNGRADED to S4: every rule R12.9-R12.12 is also stated in the edit-site header contracts and CSS comments (MorphRotationShape.tsx:11-12, 21, 33-40, 47-49; engine/*.ts:7; DropdownCaret.tsx:1-24; index.css:786-788), which AGENTS.md makes mandatory reading. The cluster stays S3 on U14-F8. C3 re-read every line @ b436647."
- locations:
  - .agents/skills/dooph-ds-contribution/SKILL.md:17
  - .agents/skills/dooph-ds-contribution/SKILL.md:29-34
  - .agents/skills/dooph-ds-contribution/SKILL.md:70
  - .agents/skills/dooph-ds-contribution/SKILL.md:78
  - .agents/skills/dooph-ds-contribution/SKILL.md:151
  - .agents/skills/dooph-ds-loading-indicators/SKILL.md:3
  - .agents/skills/dooph-ds-loading-indicators/SKILL.md:8
  - .agents/skills/dooph-ds-loading-indicators/SKILL.md:220
  - .agents/skills/dooph-ds-loading-indicators/SKILL.md:246-282
- evidence: |
    contrib:17   - Note: every state (rest, hover, active, focus, disabled), sizing (exact px from Figma), corner radius (map to `--ui-radius-tight/standard/soft`), color tokens, and typography class.
    tokens.css:536-540  --ui-radius-tight: 12px; … --ui-radius-mini: 10px; --ui-radius-normal: 18px; --ui-radius-soft: 20px;   (no `standard`)
    contrib:32   index.ts                ← re-exports everything public from MyComponent.tsx        (Step 3 tree has no constants.ts)
    contrib:70   - [ ] Dot-accessible consts declared in a sibling `constants.ts` with **no** `"use client"` — …
    contrib:78   export const Indeterminate: Story = { render: () => <Checkbox checked="indeterminate" /> };
    Checkbox.stories.tsx:42  checked: CheckboxChecked.indeterminate,
    contrib:151  4. Title/hero text (Bricolage Grotesque) renders at 23px/36px
    tokens.css:409-410  --ui-text-title: 40px; / --ui-text-hero: 55px;
    li:3         description: Use when building, modifying, or debugging WavyDivider, LoadingSpinner, or ProgressIndicator. Covers spinner animation, …
    li:8         Four components form the M3E-inspired indicator family. `LoadingSpinner` and `ShapeMorphSpinner` are indeterminate …
    li:220       `ds-spinner-rotate` in `src/styles/index.css` is the **only** loading-indicator keyframe. …   (ShapeMorphSpinner runs on `ds-shape-morph-clock`/`-spin`, index.css:798, 803)
    li:246       ## MorphRotationShape & ShapeMorphSpinner        (li:277 `- **DropdownCaret** is this in embedded mode behind a chevron.`)
    claims register: C-CONTRIB-2 (contrib:17) STALE; C-CONTRIB-7 (contrib:151) FALSE; C-LI-1 (li:3) STALE; C-LI-2 (li:8) STALE; C-LI-40 (li:220) STALE, UNCOVERED
- impact: The contribution skill is the step-by-step guide an agent follows to add a component, and four of its concrete instructions are wrong. Step 1 maps Figma radii onto `-standard`, which was renamed to `-normal`, and omits `-mini`. The Step 3 file tree contradicts the Step 4 checklist (contrib:70) by leaving out `constants.ts`, so an agent following Step 3 declares consts in the client component file, which is the RSC failure R8.20 exists to prevent. The Step 5 story template is itself a string-literal story (R1.1, R9.13), although the real Checkbox story uses `CheckboxChecked.indeterminate`. The font check expects 23px/36px while the tokens are 40px/55px, so a correct render "fails" verification. In the li skill (S4 within this cluster per V8), the description triggers on three of the six components the body covers, and li:220 calls `ds-spinner-rotate` the only family keyframe, which stopped being true when ShapeMorphSpinner joined. Agents editing the shape-morph trio still get its rules from those files' own headers.
- recommendation: Update contrib:17 to `tight/mini/normal/soft`, add `constants.ts` to the Step 3 tree, use `CheckboxChecked.indeterminate` in the Step 5 template, and replace the pixel sizes at contrib:151 with the token names. Add MorphRotationShape, ShapeMorphSpinner and DropdownCaret to li:3 and correct li:8 and li:220. Re-sync the `.claude` copy of li in the same change.
- breaking: none
- contract: n/a
- remediation: [WI-014, WI-015]
- related: [F-051, F-058, F-117, F-120]

### F-101: Stale comments in 11 files (three stylesheets, sync-theme.mjs, five Calendar modules, OutlineButton and OutlineSection) describe behaviour the code no longer has, including OutlineSection's shipped JSDoc describing a dashed ring
- severity: S3
- category: doc-drift
- rules: [R8.23, R5.3, R11.13, R10.4]
- scope: internal
- confidence: plausible: S3 outside the 29% Phase-4 sample. Facts re-checked by U1 (excluded.mjs script, `rg ds-spinner-rotate`), U11 (`rg getComputedStyle src/components/AIChat` → 0), U7 (`git log` of the deleted plans), U4 and U12 (`git show a01e5e8`), and by C3, who re-read every location @ b436647.
- verified_by: "U1: `node scratch/U1/excluded.mjs` → 89 EXCLUDED entries, 82 of them no-ops, 41 tokens skipped unlisted; `rg ds-spinner-rotate src` → only LoadingSpinner.tsx:260 (spokes). U11: `rg 'computed style|getComputedStyle' src/components/AIChat` → 0. U7: `rg 'task 9|layer model|Step 5'` → only these comments; the plans were deleted in c05b59d. U4: read OutlineButton.tsx:211-238 against the transforms. U12: `git show a01e5e8:…OutlineSection.tsx` → border-solid since the initial commit; dist .d.ts carries the JSDoc. V4 (M21 correction) independently flagged the index.css:939-941 spinner comment."
- locations:
  - scripts/sync-theme.mjs:5
  - scripts/sync-theme.mjs:8
  - scripts/sync-theme.mjs:13
  - scripts/sync-theme.mjs:18
  - scripts/sync-theme.mjs:59-61
  - scripts/sync-theme.mjs:145
  - scripts/sync-theme.mjs:157
  - scripts/sync-theme.mjs:163
  - src/styles/index.css:16
  - src/styles/index.css:939-941
  - src/styles/dooph-component-tokens.css:12
  - src/styles/dooph-component-tokens.css:115-116
  - src/styles/dooph-component-tokens.css:126-127
  - src/styles/tokens.css:205-207
  - src/styles/tokens.css:531-535
  - src/components/AIChat/AIPromptInput.tsx:16-19
  - src/components/Calendar/rangeSelection.ts:18
  - src/components/Calendar/rangeSelection.ts:42
  - src/components/Calendar/CalendarCaption.tsx:45-50
  - src/components/Calendar/Calendar.tsx:149
  - src/components/Calendar/dateUtils.ts:9
  - src/components/Calendar/CalendarGrid.tsx:57-59
  - src/components/OutlineButton/OutlineButton.tsx:211-228
  - src/components/OutlineButton/OutlineButton.tsx:230-238
  - src/components/OutlineSection/OutlineSection.tsx:8
  - src/components/OutlineSection/OutlineSection.tsx:22
- evidence: |
    path:line | stale text | reality
    sync-theme.mjs:5 | Generated output:       the @theme inline { } block inside index.css | also writes src/styles/theme.css
    sync-theme.mjs:8 | Wired into:    npm run prebuild  (see package.json) | no prebuild; package.json:50 `build` calls `npm run sync-tokens`
    sync-theme.mjs:13 | 2. Map each name to a Tailwind theme token using the rules in TOKEN_MAP | there is no TOKEN_MAP
    sync-theme.mjs:18 | 1. Add --ui-color-foo (or --ui-shadow-foo etc.) to tokens.css (light + dark) | R5.3: add `.dark` only when the value changes
    sync-theme.mjs:61 | // Font variation axes and weights — used in @layer utilities .text-style-* | `.text-style-*` are `@layer components`
    sync-theme.mjs:59 | EXCLUDED "(used only as raw var() refs or in @layer)" | 82 of 89 entries are no-ops; 41 unmapped tokens are skipped unlisted
    index.css:16 | /* Register so --progress-pct interpolates when LinearProgressIndicator value changes. */ | no rule transitions --progress-pct; width/left transition on their own computed value
    index.css:939-941 | ds-spinner-rotate: continuous 360° spin for the wavy LoadingSpinner SVG … this keyframe is only referenced by WavySpinner. | used by the spokes variant (LoadingSpinner.tsx:260); no WavySpinner exists
    dooph-component-tokens.css:12 | /* Disabled / inactive (native + aria-invalid disabled pattern) */ | selector is `[aria-disabled="true"]` (:13)
    dooph-component-tokens.css:115 | /* Active slider track — the handle color at 45% (Figma applies alpha on top). | opacity is `--ds-slider-track-opacity` → `--ui-slider-track-*-active-opacity` (:121)
    dooph-component-tokens.css:126-127 | Linear progress — width/left interpolate because --progress-pct is a / registered @property in index.css. | the transition is on `width`/`left` (:129, :132)
    tokens.css:206-207 | * component reads it back from computed style, so this token is the only / * place the cap lives. */ | AIPromptInput.tsx:18-19 "Cap and floor live only in CSS; the component just sets height = scrollHeight"
    tokens.css:533 | * standard — triggers, grouped inputs, dropdown rows, segmented shells. | token is `--ui-radius-normal` (:539); `-mini` unlisted
    rangeSelection.ts:18 | * `onChange` must fire only for a "commit" result. | the prop is `onSelect`
    rangeSelection.ts:42 | /** Drives the band rounding in CalendarGrid — see the layer model in Task 9. */ | the plan was deleted in c05b59d
    CalendarCaption.tsx:45 | // Guarded on the CURRENT view being in bounds. Step 5 makes an out-of-bounds | plan-step narration (R11.13)
    Calendar.tsx:149 | // committed value is never rewritten (see warnOnBadValue for that case). | that case is `warnOnOutOfBoundsValue` (:92)
    dateUtils.ts:9 | //   3. Never compare with `getTime()` — compare y/m/d, or compare day keys. | dateUtils/rangeSelection/dateFormat/Calendar compare `startOfDay(…).getTime()`
    CalendarGrid.tsx:57 | /** Seven narrow weekday names taken from any known week — no lookup table. */ | :59 `{ weekday: "short" }`
    OutlineButton.tsx:223 | * Orb 2 tracks the diagonally opposite point (1−gx, 1−gy) so the two | :231-238 and the transforms: same direction, fixed 0.30 offset
    OutlineSection.tsx:8 | * Outer ring: dashed/thin border. Inner card: bg-secondary surface with shadow. | :22 `'border border-solid border-border-primary rounded-[28px]',`
- impact: Each comment points the next editor at the wrong thing. The spinner note would lead someone to delete `ds-spinner-rotate` as "wavy-only", which breaks the spokes spinner. The 45% note invites re-hardcoding an opacity the tokens own. The tokens.css cap note sends an agent looking for, or re-adding, a `getComputedStyle` read, and it contradicts the AIPromptInput header. dateUtils' "never compare getTime()" would have a maintainer rewrite correct comparisons. "Task 9" and "Step 5" point at a deleted plan. sync-theme's EXCLUDED list reads as "everything here would otherwise become a utility", so the next token either pads the list needlessly or is assumed mapped. Its "(light + dark)" step teaches the redundant `.dark` duplicates F-059 found. The OutlineSection JSDoc ships in dist .d.ts, so consumers see a "dashed" ring in IntelliSense that the component cannot render, and an agent "matching OutlineSection" hand-rolls a dashed border. The two OutlineButton comment blocks give opposite accounts of the orb motion.
- recommendation: Rewrite each comment to what the code does now. Delete plan-step history (R11.13). In sync-theme.mjs, correct the header (outputs, wiring, function name, "`.dark` only when the value changes") and the four stale group comments. Do not change `@property --progress-pct` or the EXCLUDED entries in this pass; describe them truthfully instead, so the change stays comment-only.
- breaking: none
- contract: src/components/AIChat/AIPromptInput.tsx "Every submit state renders ButtonSize.iconSm." → consistent (only tokens.css's comment changes; the header's "Cap and floor live only in CSS" is the true side); no other location file carries a `## behavior`/`## constraints` header
- remediation: [WI-017]
- related: [F-034, F-059, F-076, F-099]
- note-to-orchestrator: the map title says "seven files". The members' locations span 11 files (4 style/script files, 5 Calendar modules, OutlineButton, OutlineSection), so the title above states 11.

### F-102: Several header contracts break the file-header format or are incomplete: hard rules under `## updating`, a hedged prohibition, constraints that name no failure, a parts table in place of `## behavior`, AIModelSelect's colour constraint broken by one sink, and Checkbox's ungated press state
- severity: S3
- category: contract-drift
- rules: [R11.3, R11.4, R11.5, R11.7, R11.8, R11.13, R11.6, R10.4, R11.2]
- scope: internal
- confidence: confirmed
- verified_by: "U3: read RollingDigitsText.tsx:1-41 against fhc:58-62/131/172-173. U11: read all 9 AIChat headers against fhc:37-68/99-125/158-182 and every `color` use in AIModelSelect.tsx. U6: checked dist-styles.css specificity of the Checkbox active rule (0,3,0) against the checked fill (0,2,0), both in `@layer utilities`. V6 (M35, PARTIAL): U11-F11 confirmed but narrower, down to S3. The header is false at exactly one sink, the tooltip title's inline `color`; the two child-prop sinks become custom properties inside the children. U6-F15's behaviour is confirmed, but the header is incomplete rather than false: line 5 is true of unchecked. What the code contradicts is the inline comment at :39. C3 re-read every header @ b436647."
- locations:
  - src/components/AnimatedText/RollingDigitsText.tsx:30-40
  - src/components/AIChat/AIThinkingPart.tsx:21-22
  - src/components/AIChat/AIToolPart.tsx:18-19
  - src/components/AIChat/AITurnSummary.tsx:12-13
  - src/components/AIChat/ChatDivider.tsx:11-13
  - src/components/AIChat/UserMessageHeader.tsx:7-12
  - src/components/AIChat/AIModelSelect.tsx:1-19
  - src/components/AIChat/AIModelSelect.tsx:93
  - src/components/AIChat/AIModelSelect.tsx:162
  - src/components/AIChat/AIModelSelect.tsx:227
  - src/components/AIChat/AIModelSelect.tsx:237
  - src/components/Checkbox/Checkbox.tsx:5
  - src/components/Checkbox/Checkbox.tsx:38-40
- evidence: |
    RollingDigitsText.tsx:30   * ## updating
    RollingDigitsText.tsx:31-33  * - Motion lives in CSS and in tokens (`--ui-rolling-digits-*`). Nothing here / *   may hold a duration: an earlier version mirrored the CSS timings in JS / *   constants to stage the fade against the roll, and the mirror desynced.
    RollingDigitsText.tsx:34-35  * - There is no timer, no requestAnimationFrame and no transitionend in this / *   file, and adding one is almost always the wrong fix. …      (R11.8 hedge; fhc:131 names this exact phrasing)
    RollingDigitsText.tsx:39-40  *   frame of lag between the value and the wheels, which is what forced the old / *   `hasCents` union hack.          (history, R11.13; header runs 41 lines, R11.6)
    AIThinkingPart.tsx:21-22   * - Transcript colour is inherited by `ds-chat-prose`: tertiary while live, / *   secondary once opened, as Figma draws them.      (behaviour filed as a constraint; no failure named)
    AIToolPart.tsx:18-19       * - `state` is AIToolPartState, never an AI SDK state string. Mapping one onto / *   the other is the consumer's one line of glue.     (no failure named)
    AITurnSummary.tsx:12-13    * - Render it only once a turn has settled — that rule is the consumer's to / *   apply, since only they know when their stream has finished.   (consumer advice, not a file invariant)
    ChatDivider.tsx:12-13      * - Deciding WHEN to draw one (a day boundary, a model change) is the / *   consumer's: it depends on their message metadata.   (sole constraint → prose form per R11.5)
    AIModelSelect.tsx:6-11     parts table, then `## constraints` — no `## behavior` section (R11.3)
    AIModelSelect.tsx:14-15    * - Provider colour is an open design value (`color`: DS token name or any CSS / *   colour), written as a custom property the CSS reads — never a class.
    AIModelSelect.tsx:93       ? { "--ds-chat-model-color": resolveDsColor(color, "") }          (conforms)
    AIModelSelect.tsx:227      style={color ? { color: resolveDsColor(color, "") } : undefined}  (inline `color`, not a custom property)
    Checkbox.tsx:5             * - Unchecked hover/active use secondary surface tokens.
    Checkbox.tsx:38            "data-[state=unchecked]:hover:bg-secondary-hover data-[state=unchecked]:hover:border-border-primary …",   (hover gated)
    Checkbox.tsx:39-40         // active bg stays at hover color intentionally — never while disabled / "[&:not([data-disabled])]:active:bg-secondary-hover",   (active NOT gated)
- impact: fhc:62 says editors treat `## constraints` as law and rewrite the other sections freely. RollingDigitsText keeps its three must-not-change rules under `## updating`: no duration in JS, no timer/rAF/transitionend, reconcile in render. One of them carries the "almost always" hedge that hands the next agent an exception to argue into. Its sibling headers (useChangeSwap.ts, RollChangeText.tsx) state the no-timer rule as a constraint. In AIChat, constraints that name no failure, or that are behaviour or consumer advice, dilute the bullets that do carry incidents. fhc:99 says such a constraint "gets refactored away by someone who cannot see its cost". AIModelSelect's colour constraint is false at the tooltip title. An agent editing AIModelTooltipContent will either "fix" it ad hoc or stop trusting the header. Checkbox: while a checked or indeterminate box is pressed, the fill flips to `bg-secondary-hover` under the on-fill (`prominent-fg`/`primary-fg`) check, a brief low-contrast flash. The inline comment says "intentionally", and the header covers only the unchecked case, so whichever text an editor trusts decides the next change.
- recommendation: RollingDigitsText: move the three rules into `## constraints` without the hedge, keep each named failure, drop the history clauses, and delete `## updating`. AIChat: attach the failure to each flagged constraint or move it to `## behavior`; drop the consumer-advice bullet (consumer usage belongs in the usage skill); convert ChatDivider and UserMessageHeader to the prose form; give AIModelSelect a `## behavior` section holding the parts table. Bring AIModelTooltipContent's title colour into line with its constraint by writing it as `--ds-chat-model-color` read by a `ds-*` rule, as AIModelSelectItem already does, and add the failure clause to that constraint. Checkbox: gate the active background to `data-[state=unchecked]` as the hover is gated, and make the header and inline comment say so.
- breaking: none
- contract: src/components/AnimatedText/RollingDigitsText.tsx (the header itself) → consistent (content kept, moved into `## constraints`); src/components/AIChat/AIModelSelect.tsx "written as a custom property the CSS reads — never a class" → consistent (the recommendation changes the one non-conforming sink to match the constraint; the constraint is kept); src/components/AIChat/{AIThinkingPart,AIToolPart,AITurnSummary,ChatDivider,UserMessageHeader}.tsx → consistent (no constraint is weakened; each is given its failure or moved to the section it belongs in); src/components/Checkbox/Checkbox.tsx "Style states via Radix `data-[state]` / `data-[disabled]` only — no JS class toggling for checked/disabled." → consistent (the gate is a `data-[state=unchecked]` selector)
- remediation: [WI-018, WI-052, WI-054]
- related: [F-054, F-103, F-011, F-117]
- note-to-orchestrator: the map title lists "directive above the contract". No member of this cluster carries that defect; it lives in F-011 (U6-F28, U2-F1) and is cited in F-103's evidence, so the title above omits it.

### F-103: Component invariants are recorded in five forms, and AGENTS.md's read-first and stop-and-raise rules cover only the sectioned `## behavior`/`## constraints` header. Equally load-bearing rules in a `//` note, a mid-file block comment, JSDoc or an inline comment carry no protection
- severity: S3
- category: contract-drift
- rules: [R10.1, R10.2, R11.3, R11.9, R11.13]
- scope: internal
- confidence: plausible: S3 horizontal finding, not in the Phase-4 verification sample; facts re-checked by C3 @ b436647 (each quoted comment re-read; `grep -l '## constraints'` over src/components .ts/.tsx excluding stories → 35 files)
- verified_by: "HB: `grep -l '## constraints'` over the 61 component .tsx files outside Icons/Shapes → 27; read the first 40 lines of every remaining component file for invariant-bearing comments; read fhc:37-47 for the triggers. C3 re-read every location @ b436647."
- locations:
  - AGENTS.md:3-4
  - AGENTS.md:6-8
  - .agents/skills/file-header-contracts/SKILL.md:37-43
  - .agents/skills/file-header-contracts/SKILL.md:158
  - src/components/Table/Table.tsx:1-3
  - src/components/DropdownTrigger/DropdownTrigger.tsx:82-97
  - src/components/Slider/Slider.tsx:345-350
  - src/components/Text/BaseText.tsx:45-51
  - src/components/ShapeMorphSpinner/ShapeMorphSpinner.tsx:1-6
  - src/components/AIChat/AIModelSelect.tsx:1-19
  - src/components/Menu/DropdownMenu.tsx:1-3
  - src/components/LinearProgressIndicator/LinearProgressIndicator.tsx:1-3
  - src/components/Toggle/Toggle.tsx:1-3
- evidence: |
    path:line | form | invariant it carries
    AGENTS.md:3-4 | Some source files open with a block comment stating `## behavior` and / `## constraints`. Read it before editing that file. | the only form the rules attach to
    Table.tsx:1-2 | // No "use client": no hooks, and onSort is a consumer-supplied passthrough. / // Neutral module — it renders in either graph. … | `//` note; fhc:40 trigger ("a missing `"use client"`")
    DropdownTrigger.tsx:84-87 | * Root is a div (Radix merges button trigger props). Radix toggles the menu on every / * trigger pointerDown — we skip that when the target is the input … pair / * with DropdownMenuContent focusOnOpen={false} … | mid-file block comment; R2.8's invariants; :95-96 "Long-term fix: a combobox …" is a TODO (R11.13)
    Slider.tsx:345-347 | /* ds-radix-data-disabled, NOT `data-[disabled]:ds-disabled-state`. / * That form was broken twice over: … | inline comment; fhc:43 trigger ("you have already fixed it twice")
    BaseText.tsx:49-51 | * That ordering is the whole point of the design: a prop is explicit and must / * never lose to cascade order, … `style` still outranks props, as the last-resort escape hatch. | JSDoc; the style-precedence invariant (F-029)
    ShapeMorphSpinner.tsx:1-6 | /* ShapeMorphSpinner — … Sizes render from --ui-size-spinner-* (never a JS / * size table) … */ | prose-form header (R11.5)
    AIModelSelect.tsx:1-19 | parts table + `## constraints`, no `## behavior` | constraints-only header (F-102)
    DropdownMenu.tsx:1-3 / LinearProgressIndicator.tsx:1-3 / Toggle.tsx:1-3 | "use client"; / (blank) / /* | directive above the header (R11.9, fhc:158), the placement that keeps them stamped under F-011's 5-line scan
- impact: AGENTS.md tells the next agent to read the header and to stop and raise before contradicting a constraint, and both obligations attach only to the sectioned header. Four invariants match fhc's own triggers exactly: the Typeable trigger's pointer-down suppression, Table's deliberate missing directive, Slider's twice-broken disabled selector and BaseText's precedence order. Each sits in a form the rule does not cover, so a "simplify" edit can reverse any of them without tripping anything. The forms also drift in practice. Three files put the directive above the header (R11.9), which is the only reason they stay stamped under the 5-line `add-use-client` scan (F-011), so the format rule and the build fight each other. Unit claim checks found false or stale statements in at least 8 of the contracted files (F-054, F-102). AIChat contracts all 9 of its files while Slider, Calendar, DropdownTrigger, OutlineButton, LoadingSpinner and ProgressIndicator contract none. That fits fhc's "file size is not a trigger", but it leaves each unit to rediscover the invariants.
- recommendation: Record the invariant-form convention (D-17). My pick: an invariant that meets an fhc trigger lives in the file's header (sectioned, or prose for one invariant), and any other comment is explanation and says so by not using "must"/"never" language. Promote the four invariants above into headers: Table (prose), TypeableDropdownTrigger (a sectioned header for DropdownTrigger.tsx, dropping the TODO), Slider's disabled selector, and BaseText's precedence order. Do it only after F-011's stamp fix lands, so that putting a header above `"use client"` cannot drop the directive from dist.
- breaking: none
- contract: n/a (concerns the contract mechanism itself; AGENTS.md:3-8 and fhc:37-47 are the measuring sticks and are not contradicted; promoting text into a header adds constraints and weakens none)
- remediation: decision D-17 (+ blocked WI-053)
- related: [F-011, F-029, F-054, F-066, F-102]

### F-105: Stories in all ten component units leave override props uncontradicted (R9.23), and several use raw elements or removed spellings (R9.24, R1.3). The uncovered props are where three shipped defects hid
- severity: S3
- category: stories
- rules: [R9.23, R9.24, R8.22, R1.3, R9.13]
- scope: internal
- confidence: confirmed
- verified_by: "Each unit's §5 Stories check plus its story finding (all 45 story files read in full across U3-U12). V8 (M84, PARTIAL; S3 kept) re-ran the greps for U4-F17, U6-F18, U8-F12 and U10-F11. Corrections applied: U8-F12's 'arbitrary px widths' charge is dropped, because no modal/sheet width token exists and Sheet.stories.tsx:158 shows the width is the consumer's. U10-F11's 'TagIcon never rendered' is false and dropped (Input.stories.tsx:63, Sticker.stories.tsx:54); the hover sidebar icons render in SidebarWithHoverIcon.stories.tsx:99 and are missing only from the Icons catalogue. U4-F17 alone is ≈S4. C3 re-read every location @ b436647."
- locations:
  - src/components/AnimatedText/AnimatedText.stories.tsx:212
  - src/components/AnimatedText/AnimatedText.stories.tsx:253-254
  - src/components/AnimatedText/AnimatedText.stories.tsx:384
  - src/components/Text/BaseText.stories.tsx:161-162
  - src/components/Button/Button.stories.tsx:34-35
  - src/components/ShapeButton/ShapeButton.stories.tsx:28-31
  - src/components/Menu/DropdownMenu.tsx:55
  - src/components/Menu/DropdownMenu.tsx:110
  - src/components/Menu/DropdownMenu.tsx:117
  - src/components/DropdownTrigger/DropdownTrigger.tsx:309
  - src/components/HotkeyIndicator/HotkeyIndicator.stories.tsx:27
  - src/components/DatePicker/DatePicker.stories.tsx:93
  - src/components/DatePicker/DatePickerSplitTrigger.tsx:53
  - src/components/Sheet/Sheet.tsx:133
  - src/components/Tooltip/Tooltip.tsx:25
  - src/components/Tooltip/Tooltip.tsx:49-51
  - src/components/Toast/Toast.tsx:243
  - src/components/ProgressIndicator/ProgressIndicator.stories.tsx:39
  - src/components/ProgressIndicator/ProgressIndicator.stories.tsx:119-120
  - src/components/WavyDivider/WavyDivider.tsx:57
  - src/components/LoadingSpinner/LoadingSpinner.stories.tsx:103
  - src/components/LoadingSpinner/LoadingSpinner.stories.tsx:116
  - src/components/AIChat/AIPromptInput.tsx:84
  - src/components/AIChat/AIPromptInput.tsx:305
  - src/components/AIChat/AIContextGauge.tsx:39
  - src/components/AIChat/AIModelSelect.tsx:212
  - src/components/AIChat/AIModelSelect.stories.tsx:211
  - src/components/Table/Table.tsx:19
  - src/components/Slider/Slider.stories.tsx:212
  - src/components/Modal/Modal.stories.tsx:30-33
  - src/components/Modal/Modal.stories.tsx:103
  - src/components/Sheet/Sheet.stories.tsx:27-29
  - src/components/Icons/Icons.stories.tsx:24-28
  - src/components/Icons/Icons.stories.tsx:52-53
  - src/components/Icons/Icons.stories.tsx:105-112
  - src/components/MorphRotationShape/MorphRotationShape.stories.tsx:84-88
  - src/components/Tabs/Tabs.stories.tsx:51
  - src/components/Tabs/Tabs.stories.tsx:113
  - src/components/Toggle/Toggle.tsx:114
  - src/components/SegmentedTabSelect/SegmentedTabSelect.tsx:94-95
- evidence: |
    override (default) | where | contradicting story?
    DropdownMenu modal (false) / dismissOnFocusLoss (false) / portal (true) | DropdownMenu.tsx:55, :110, :117 | none
    DropdownTrigger / TextDropdownTrigger asChild (false) | DropdownTrigger.tsx:309 | none (asChild throws, F-003)
    ToastProvider duration (ignored: Toast.tsx:243 `duration={item.duration ?? 4000}`) | Toast.stories.tsx | none (F-005)
    SheetContent withOverlay (true) | Sheet.tsx:133 | none (Modal has one)
    TooltipContent portal (true) / sideOffset (6); TooltipProvider delayDuration (250) | Tooltip.tsx:49-51, :25 | none
    DatePicker splitPresets / locale | DatePicker.stories.tsx:93 passes the default DEFAULT_SPLIT_TRIGGER_PRESETS (= DatePickerSplitTrigger.tsx:53) | none
    ProgressIndicator color | PI.stories:39 `color: LoadingSpinnerColor.primary,` (= default) | none
    WavyDivider strokeWeight (2) / ShapeMorphSpinner timing | WavyDivider.tsx:57 | none
    AIPromptInput disabled; responding without onStop | AIPromptInput.tsx:84, :305 `if (responding && onStop) {` | none
    AIContextGauge size (sm) / AIModelTooltipContent themeInverse (false, flips Tooltip's true) | AIContextGauge.tsx:39; AIModelSelect.tsx:212 | none
    Table rowHeight | Table.tsx:19 `rowHeight?: string;` | none
    FadeChangeText direction | AnimatedText.stories.tsx:384 (no direction) | none
    TabVariant.unselected / TabSize.fill; ToggleSwitchItem size; SegmentedTabItem variant/size | Tabs.stories.tsx:113; Toggle.tsx:114; SegmentedTabSelect.tsx:94-95 | none
    BaseIcon strokeWidth/strokeColor/fillColor | Icons.stories.tsx:24-28 (argTypes; no story renders args) | none
    raw elements / removed spellings:
    Button.stories.tsx:34        export const Brand: Story = {          (ShapeButton.stories.tsx:28 likewise; R1.3)
    Slider.stories.tsx:212       {(['primary', 'brand', 'text', 'error-primary'] as const).map((c) => (   (two rows render transparent)
    Modal.stories.tsx:31-33      <ModalTitle className="sr-only">Modal</ModalTitle> … <p className="text-style-heading text-text">Modal title</p>   (also Sheet.stories.tsx:27-29)
    Modal.stories.tsx:103        <code className="text-style-label bg-surface-secondary rounded px-1">open</code> prop.   (`rounded` is not a radius token)
    PI.stories:119-120           <input / type="range"                (SliderContinuous exists)
    Tabs.stories.tsx:51          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>   (TableIcon/GraphIcon already imported)
    LoadingSpinner.stories.tsx:103 / HotkeyIndicator.stories.tsx:27 / AIModelSelect.stories.tsx:211 / Icons.stories.tsx:52-53   raw styled `<span>`s where LabelText/BodyText exist
    Icons.stories.tsx:109-111    <IconCell icon={(props) => <SidebarLeftIcon {...props} />} label="LeftSidebar Open" />   (renders the closed icon)
    MorphRotationShape.stories.tsx:84-88  hand-built caret frame (`size-[31px]`, `inset-[2.5px]`, `group-data-[state=open]:[--ds-shape-morph-target:1]`) beside the shipped DropdownCaret
    story docs that contradict the code: AnimatedText.stories.tsx:212 says RollHoverText's default is `up` (RollHoverText.tsx:37 `direction = RollDirection.down,`); :254 says "(animation classes are `motion-safe:` scoped)" (CSS uses `@media (prefers-reduced-motion: reduce)` → 1ms); BaseText.stories.tsx:161 labels `fontWeight={700}` but passes `FontWeights.bold`
- impact: R9.23 exists so that a dead or broken override shows up in Storybook. The three places where it was skipped are where shipped defects sit. `asChild` throws on OutlineButton, ShapeButton, DropdownTrigger and TextDropdownTrigger (F-003), and no story sets it. `ToastProvider`'s `duration` is ignored (F-005), and no story sets it. The "Color prop" stories pass `'brand'` and `'error-primary'`, which resolve to transparent: on LinearProgressIndicator this shipped in JSDoc (F-010), and the Slider story repeats it. `ToastRoot` is never rendered directly, which is how F-086's grey prominent-toast text went unnoticed. The stories are also the de-facto usage docs. They teach a hidden `ModalTitle` with a visible raw `<p>` copying its classes (accessible name ≠ visible title), raw `<input type="range">`/`<svg>`/`<span>` where DS components exist, a removed spelling as a sidebar name (`Buttons/Button/Brand`), a second hand-built embedding of the dropdown caret, and two docs blurbs that state the wrong default and a reduced-motion mechanism that no longer exists. Each unit filed its slice at S3/S4; together they show no family follows the story rules consistently, so whoever copies the next story file inherits the gaps.
- recommendation: Do one sweep, ordered by risk. First, a contradicting story for every override whose broken state is already known, unless that defect's own WI adds it: ToastProvider `duration`, Sheet `withOverlay`, Tooltip `portal`, the menu's `modal`/`portal`/`dismissOnFocusLoss`. The asChild stories belong to the F-003 fix (member U4-F15). Then the rest of each unit's list. Fold the `brand`/`error-primary` spellings, the raw elements and the wrong docs blurbs into the same pass.
- breaking: none
- contract: n/a (story files carry no header contracts; the component files cited only for their defaults are not edited)
- remediation: [WI-020]
- related: [F-003, F-005, F-010, F-086, F-095, F-118]

### F-106: The committed figma-variable-jsons are the initial-commit snapshot and contradict the current token model they are named after
- severity: S3
- category: repo-hygiene
- rules: []
- scope: tooling
- confidence: plausible: S3 outside the 29% Phase-4 sample; facts re-checked by C3 @ b436647 (`git log -- figma-variable-jsons` → only a01e5e8; values below read from the JSON with node)
- verified_by: "U1: `git log -- figma-variable-jsons` → a01e5e8 Initial commit only; `node scratch/U1/figma.mjs` flattened all 5 collections (104 lines) and compared them with tokens.css; `rg figma-variable-jsons` outside docs/audit → no references; not shipped (package.json `files` = dist, skills, bin). C3 @ b436647: re-read the Corner Radii/Icons/Interactables values with node; the only references are git index entries."
- locations:
  - figma-variable-jsons/Corner Radii.json:1
  - figma-variable-jsons/Icons.json:1
  - figma-variable-jsons/Colors - Interactables.json:1
  - figma-variable-jsons/Colors - Statics.json:1
  - figma-variable-jsons/Sizing_Spacing.json:1
  - package.json:35-39
  - .agents/skills/dooph-ds-codebase/SKILL.md:498
- evidence: |
    file | exported value | current token (tokens.css @ b436647)
    Corner Radii.json | tight=12, standard=18, soft=20 | --ui-radius-normal: 18px (:539), --ui-radius-mini: 10px (:538); no `standard`
    Icons.json | strokewidth=1.5, iconTiny=12, iconStandard=14, iconMedium=16 | sm/rg/md/lg icon sizes; stroke width 2
    Colors - Interactables.json | brandButton/bg-brandButton, brandButton/bg-brandButton:hover, … | --ui-color-prominent family; no prominent/sticker/slider/focus-ring/ai-models groups in the export
    Sizing_Spacing.json | dropdownWidths/actionMenuItemMinWidth = 144 | --ui-min-w-menu-action was removed (codebase:457)
    package.json:35-38 | "files": [ "dist", "skills", "bin" | the folder never ships
    codebase:498 | The 5.4 pass realigned nearly every name with Figma, so anything you remember from before it is suspect — read `tokens.css`, do not recall. | the committed exports predate that pass (C-CB-178 FALSE)
- impact: tokens.css comments cite Figma groups the exports do not contain (`ButtonProminent/*`, `stickers/`, `radius-mini`, `ai-models/*`, `Inputs/focus-ring-*`). An agent asked to "sync tokens with Figma" that trusts these files would revert the renames and values: `standard` radius, `brand` button colours, 1.5 stroke. token-contract.md's stale `1.5` stroke width (F-047) matches this file, not the CSS. Nothing in the repo records the export date, so the files read as current. The folder is unreferenced and does not ship, so the only cost is misleading the next agent, but that agent is exactly the one doing token work.
- recommendation: Decide the folder's status (D-19): refresh it from the live Figma file, delete it, or keep it labelled as a historical snapshot. My pick is deletion: git keeps the snapshot, nothing references the files, the live Figma file is the source the token comments already cite, and the maintainer's c05b59d set the precedent of deleting completed artefacts. If it is kept, add a README beside it with the export date and the Figma file key.
- breaking: none
- contract: n/a
- remediation: decision D-19 (+ blocked WI-021)
- related: [F-047, F-013, F-109]

### F-110: arch:122's closed list of non-`variant`/`size` prop names omits four DS-chosen names that its own principle covers (`mode`, `direction`, `sortDirection`, `state`; 11 component props)
- severity: S3
- category: rulebook-conflict
- rules: [R1.11]
- scope: internal
- confidence: confirmed
- verified_by: "U14: listed every exported const and grepped its prop declarations. U7: read arch:36-55/122 and the `mode` props. V4 (M26, DOWNGRADE to S3): a TypeScript-AST enumeration (`scratch/V4/m26.cjs`) of all 54 exported `as const` objects and every property typed from one, with `variant`/`size` filtered out. RC-1 (arch:52 `checked` against arch:122) is REFUTED: `checked` is Radix's own prop, and `color` is sanctioned by arch:57-80. What remains is four DS-chosen names on 11 props. U11-F1 → S4 (F-116); U6-F25 is moot. C3 re-read every declaration @ b436647."
- locations:
  - .agents/skills/dooph-ds-architecture/SKILL.md:122
  - src/components/Calendar/Calendar.tsx:48
  - src/components/Calendar/Calendar.tsx:54
  - src/components/DatePicker/DatePicker.tsx:38
  - src/components/DatePicker/DatePicker.tsx:45
  - src/components/DatePicker/DatePickerTrigger.tsx:25-26
  - src/components/MorphRotationShape/MorphRotationShape.tsx:97
  - src/components/MorphRotationShape/MorphRotationShape.tsx:104
  - src/components/MorphRotationShape/MorphRotationShape.tsx:114
  - src/components/AnimatedText/RollChangeText.tsx:39
  - src/components/AnimatedText/FadeChangeText.tsx:43
  - src/components/AnimatedText/RollHoverText.tsx:14
  - src/components/AnimatedText/RevealChangeText.tsx:106
  - src/components/Table/Table.tsx:60
  - src/components/AIChat/AIThinkingPart.tsx:43
  - src/components/AIChat/AIToolPart.tsx:29-30
- evidence: |
    rule text A (enumeration), arch:122  The only exceptions are geometry/mode props with established or genuinely orthogonal names: `shape` (ShapeButton), `side` (SheetContent, matching Radix's own `side` convention), and `selectType` (`DropdownMenu` — it is a selection mode, not a visual variant, so the `variant` name would mislead).
    rule text B (principle), same sentence  "geometry/mode props with established or genuinely orthogonal names" … "it is a selection mode, not a visual variant, so the `variant` name would mislead"
    Calendar.tsx:48          mode: typeof DatePickerMode.singleDay;          (also DatePicker.tsx:38/45, DatePickerTrigger.tsx:25-26, MorphRotationShape.tsx:97/104/114)
    RollChangeText.tsx:39    direction?: RollDirection;                      (also FadeChangeText.tsx:43, RollHoverText.tsx:14, RevealChangeText.tsx:106 `RevealDirection`)
    Table.tsx:60             sortDirection?: TableSortDirection;
    AIToolPart.tsx:29-30     state?: AIToolPartState; / variant?: AIToolPartVariant;   (also AIThinkingPart.tsx:43)
- impact: The two halves of arch:122 cannot both be followed. The principle (B) describes `mode` (single vs range, autoplay vs controlled) exactly the way it justifies `selectType`, and `direction`/`sortDirection`/`state` are orthogonal to any visual variant. The enumeration (A) says "The only exceptions are" three names, so each of the 11 props is a literal R1.11 violation. A reviewer applying A gets 11 false positives. An agent "fixing" them renames working props to `variant`, which is a breaking change that makes the API worse and is impossible on AIToolPart, where `state` and `variant` already coexist (:29-30). The code follows the principle; only the list is incomplete. No consumer impact.
- recommendation: Resolve it in the rule, not the code (D-08: extend the list or rename the props). My pick is to extend: name the principle as the test and list every sanctioned name (`shape`, `side`, `selectType`, `mode`, `direction`, `sortDirection`, `state`). Also note that props inherited unchanged from a Radix primitive (`checked`) and open-value props (`color`, arch:57-80) are outside the rule, and add a `DatePickerMode`/`mode` row to the arch:36-55 naming table. Renaming the props would be a major for no user benefit.
- breaking: none
- contract: src/components/MorphRotationShape/MorphRotationShape.tsx and the AIChat headers → consistent (the recommendation edits only the architecture skill; no component file changes)
- remediation: decision D-08 (+ blocked WI-022)
- related: [F-116, F-031, F-098]

### F-111: contrib:65 requires a necessary layout wrapper to be `aria-hidden` and absolutely positioned, but arch:232-235 sanctions two wrappers around `children` that are neither and cannot be
- severity: S3
- category: rulebook-conflict
- rules: [R8.18, R3.3]
- scope: internal
- confidence: plausible: S3 outside the 29% Phase-4 sample; the conflict was confirmed by U14 (RC-2), and C3 re-read both rule texts and both wrappers @ b436647
- verified_by: "U14: grep of `<span|aria-hidden` in OutlineButton.tsx and of `flex flex-1` in Menu/DropdownMenu.tsx; read contrib:62-65 against arch:230-241. C3 @ b436647: OutlineButton's four decorative orbs carry `aria-hidden` (:182, :196, :241, :262); the children span at :286 does not; DropdownMenu.tsx:268 and :326 wrap children in `flex flex-1`."
- locations:
  - .agents/skills/dooph-ds-contribution/SKILL.md:65
  - .agents/skills/dooph-ds-architecture/SKILL.md:232-235
  - .agents/skills/dooph-ds-architecture/SKILL.md:240
  - src/components/OutlineButton/OutlineButton.tsx:286-288
  - src/components/OutlineButton/OutlineButton.tsx:182
  - src/components/Menu/DropdownMenu.tsx:268
  - src/components/Menu/DropdownMenu.tsx:326
- evidence: |
    rule A, contrib:65   - [ ] If a layout wrapper IS necessary, it is `aria-hidden` and absolutely positioned (like OutlineButton's blur orbs)
    rule B, arch:232     Wrapping children in a layout span is acceptable ONLY when visually required and the wrapper is not interactive. Examples:
    rule B, arch:234     - `OutlineButton` wraps children in `<span className="relative z-10 ...">` to layer above blur orbs — acceptable.
    rule B, arch:235     - `DropdownMenuRadioSelectItem` wraps text children in `<span className="flex flex-1">` to push the trailing check right — acceptable.
    OutlineButton.tsx:286-287  <span className="relative z-10 inline-flex items-center gap-2"> / {children}
    OutlineButton.tsx:182      aria-hidden          (a decorative orb — what contrib:65's parenthesis actually describes)
    DropdownMenu.tsx:268       <span className="flex flex-1 items-center gap-sm">{children}</span>
- impact: The two rules cannot both be followed for a wrapper around `children`. contrib:65 demands `aria-hidden` and absolute positioning. arch:232-235 sanctions two wrappers that hold the control's label, are relatively positioned or in flow, and must stay exposed. `aria-hidden` on them removes the button's or menu item's accessible name, and absolute positioning takes the label out of layout. contrib:65 conflates decorative layers (the orbs, correctly `aria-hidden` and absolute) with a wrapper around children. An agent working through the contribution checklist on OutlineButton or the radio/multi-select items would "fix" the span by adding `aria-hidden`, which silences the control for screen readers.
- recommendation: Resolve the rule text (D-09). My pick: split contrib:65 into two checklist items. Decorative layers (orbs, glows) are `aria-hidden` and absolutely positioned. A wrapper around `children` is layout-only, non-interactive, listed in arch's layout-necessity exceptions, and never `aria-hidden`. That matches arch:232 and keeps both shipped wrappers correct. No code changes.
- breaking: none
- contract: n/a (OutlineButton.tsx and DropdownMenu.tsx are not edited; DropdownMenu.tsx's "Style open/disabled/highlighted via Radix data attributes only." is untouched)
- remediation: decision D-09 (+ blocked WI-023)
- related: [F-024, F-112, F-120]

### F-112: contrib:100 asks for breaking-change notes in a comment at the top of the component file, the place file-header-contracts reserves for a contract and where it forbids changelog entries. The repo now does both
- severity: S3
- category: rulebook-conflict
- rules: [R8.25, R11.13, R11.9]
- scope: internal
- confidence: plausible: S3 outside the 29% Phase-4 sample; the conflict was confirmed by U14 (RC-3), and C3 re-read both rule texts and every history comment @ b436647
- verified_by: "U14: `rg -n 'before 5\\.|in 5\\.4|renamed from|was called|BREAKING' src --glob '!*.stories.tsx'` → 6 hits, two inside sectioned header contracts. C3 @ b436647: re-read contrib:100, fhc:158 and fhc:173, Toggle.tsx:3-5, Button.tsx:19-20, and the four JSDoc BREAKING notes; CHANGELOG.md has `## [Unreleased]` (:10) and no release section after 1.1.0 (:25)."
- locations:
  - .agents/skills/dooph-ds-contribution/SKILL.md:100
  - .agents/skills/file-header-contracts/SKILL.md:173
  - .agents/skills/file-header-contracts/SKILL.md:158
  - src/components/Toggle/Toggle.tsx:4-5
  - src/components/Button/Button.tsx:19-20
  - src/components/Menu/constants.ts:12
  - src/components/Menu/DropdownMenu.tsx:277-278
  - src/components/SegmentedTabSelect/constants.ts:8-11
  - src/components/Toggle/constants.ts:14
  - CHANGELOG.md:10
- evidence: |
    rule A, contrib:100  7. Document breaking changes in a comment at the top of the component file if any API surface was removed.
    rule B, fhc:158      - First thing in the file — above `"use client"`, above imports, below a license banner if one exists.
    rule B, fhc:173      | Changelog entries | Contracts describe the present; history lives in git |
    Toggle.tsx:4-5       * ToggleSwitch — Figma "Toggle Switch": a single-select row of Toggle Options / * (two or more). Renamed from TwoWayToggle / TwoWayToggleItem (BREAKING, major).   (contract title line)
    Button.tsx:19-20     * - `prominent` was called `brand` before 5.4, in both the variant key and the / *   token family (`--ui-color-brand-*`). Neither spelling survives.   (inside `## constraints`)
    Menu/constants.ts:12 * BREAKING (major): DropdownMenuVariant (standard/action/complex) was removed.   (JSDoc; also DropdownMenu.tsx:277-278, SegmentedTabSelect/constants.ts:8, Toggle/constants.ts:14)
    CHANGELOG.md:10      ## [Unreleased]          (none of these breaking changes is listed there; F-049)
- impact: The two rules cannot both be followed. The top of a component file is where fhc:158 puts the header contract, so a breaking-change note "at the top of the component file" (A) lands in, or directly above, the contract, and fhc:173 (B) forbids changelog entries there. The repo shows the result. Toggle's contract title and Button's `## constraints` now carry history. Button's history line also gives an unreleased version as fact ("before 5.4", F-013). Four more modules carry "BREAKING (major)" JSDoc that ships in dist .d.ts. CHANGELOG.md's `[Unreleased]` lists none of them (F-049), so these comments are the only record, in the wrong place, and they go stale on the next release.
- recommendation: Resolve the rule text (D-09). My pick: replace contrib:100 with "record each removed or renamed API in CHANGELOG.md `[Unreleased]` and in the major's migration inventory (vm Rule 0)". Then reword the two contract lines to present-tense rules that keep their force: Toggle's title drops the rename clause; Button's history bullet becomes "Neither `brand` nor `--ui-color-brand-*` exists; do not reintroduce either spelling (arch:32)." Move the four JSDoc BREAKING notes into the changelog entry. Rewording Button's constraint changes a contract line, so it is the maintainer's call and gets its own commit.
- breaking: none
- contract: src/components/Button/Button.tsx "`prominent` was called `brand` before 5.4, in both the variant key and the token family (`--ui-color-brand-*`). Neither spelling survives." → conflicts (the recommendation rewords a constraint; AGENTS.md:6-8 makes that the maintainer's own commit with reasoning, hence a decision item); src/components/Toggle/Toggle.tsx title line → consistent (the title line is not a constraint; the `## constraints` bullets are untouched)
- remediation: decision D-09 (+ blocked WI-023)
- related: [F-013, F-049, F-111, F-120]

### F-120: contrib:56's radius checklist names three utilities while nine radius tokens exist and components use six more radius utilities
- severity: S4
- category: rulebook-conflict
- rules: [R8.13, R8.1]
- scope: internal
- confidence: plausible: S4, not adversarially verified; the conflict was confirmed by U14 (RC-5), and C3 re-counted tokens and usages @ b436647
- verified_by: "U14: `rg -o '\\brounded(-[a-z]+)*(-\\[[^]]*\\])?' src --glob '*.tsx' | sort | uniq -c`. C3 @ b436647, excluding stories: rounded-tight 18, rounded-full 10, rounded-normal 6, rounded-soft 5, rounded-calendar-day 4 (+4 sided), rounded-slider-inner 1 (+2 sided), rounded-mini 1, rounded-checkbox 1, rounded-avatar 1, rounded-avatar-sm 1, rounded-[28px] 2. tokens.css declares 9 `--ui-radius-*` tokens (:479, :536-544)."
- locations:
  - .agents/skills/dooph-ds-contribution/SKILL.md:56
  - .agents/skills/dooph-ds-contribution/SKILL.md:18
  - src/styles/tokens.css:479
  - src/styles/tokens.css:536-544
  - .agents/skills/dooph-ds-codebase/SKILL.md:504
  - src/components/Checkbox/Checkbox.tsx:36
  - src/components/Calendar/CalendarGrid.tsx:176
  - src/components/Avatar/Avatar.tsx:23-24
  - src/components/Slider/Slider.tsx:409
- evidence: |
    rule A, contrib:56   - [ ] Uses `rounded-tight`, `rounded-normal`, or `rounded-soft` for corner radius
    rule B, contrib:18   - If a value doesn't map to an existing token, add a new `--ui-*` token to `tokens.css` — never hardcode.
    tokens.css:538       --ui-radius-mini: 10px;
    tokens.css:541-544   --ui-radius-checkbox: 6px; --ui-radius-avatar: 8px; --ui-radius-avatar-sm: 6px; --ui-radius-calendar-day: 8px;
    tokens.css:479       --ui-radius-slider-inner: 8px;
    Checkbox.tsx:36      "rounded-checkbox border border-solid border-border-primary bg-transparent text-primary-fg",
    codebase:504         - **Radius**: `--ui-radius-tight`/`-normal`/`-soft`/`-mini` (10px, `rounded-mini` — Figma `radius-mini`, backs the 2…
- impact: Read as exhaustive, rule A marks `rounded-mini` and every component radius token as violations, including the tokens rule B tells authors to create when no existing token fits. Following both is impossible for the micro toggle option (10px) or the checkbox (6px). Read as non-exhaustive, rule A says nothing. Low risk, but a literal-minded fix would flatten the micro option or the checkbox onto `rounded-tight`. The two `rounded-[28px]` literals (OutlineButton, OutlineSection) are R8.11 violations under either reading and are owned by F-017.
- recommendation: Resolve the rule text (D-09). My pick: reword contrib:56 to "a `rounded-*` utility generated from a `--ui-radius-*` token (never an arbitrary value); the shared scale is `tight`/`mini`/`normal`/`soft`, and a component-specific radius gets its own token per Step 1." No code changes.
- breaking: none
- contract: n/a (no component file is edited)
- remediation: decision D-09 (+ blocked WI-023)
- related: [F-017, F-100, F-111, F-112]

## DONE
