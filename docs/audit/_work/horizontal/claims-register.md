# H10 — Claims register (horizontal pass HD) @ b436647

Consolidates every "Claim results" row from units U1–U14 (all 14 end with `## DONE`; U10/U11 processed in full, not partial) into one register grouped by source doc, de-duplicated, with conflicting verdicts and UNVERIFIABLE rows re-checked by HD.

**Pipeline** (scripts in `docs/audit/_work/scratch/HD/`): `parse.cjs` (table rows of each unit's §4 → `rows.json`) → `normalize.cjs` (resolve `codebase:`/`cb:`/`DM:`/`li:`… aliases to repo paths; verdict class from the words outside parentheses) → `claims.tsv` (1032 raw rows) → `linecheck.cjs` (anchor strings from each claim located in the cited doc: 595 cited ranges confirmed, 4 drifted) → `overrides.cjs` (hand decisions: line fixes, merges, exclusions, resolutions) → `build.cjs`/`render.cjs` (this file). `findings.cjs` indexes all 231 unit findings and their locations for the roll-up.

**Counts.** 1032 raw rows − 8 rulebook-conflict rows (U14 RC table, not claims) − 30 excluded (normative rules, templates, plans, omissions; §5) − 4 dropped (pure history; §5) → **843 claims** (140 of them merged from 2+ unit rows; 3 multi-file rows expanded per file). Verdicts: TRUE 673 · FALSE 116 · STALE 42 · UNVERIFIABLE 12.

**Conventions**
- Verdicts: TRUE / FALSE (never true, or contradicted now with no sign it was once true) / STALE (true at an earlier commit or tag, drifted) / UNVERIFIABLE (reason given in §3). A row graded "TRUE … / FALSE …" by a unit is FALSE here (a claim with a false part is false) unless HD split it.
- Rules are not claims: imperative content of the normative docs (arch, contrib, fhc, li, vm, AGENTS — see rulebook.md) is excluded; their descriptive present-tense sentences stay. Header `## constraints` rows stay where they state a checkable fact ("honoured" → TRUE).
- **P-5.4 policy.** No 5.4 release exists (`git tag` tops at v5.3.0; package.json 5.3.0). A claim whose content is "X happened in 5.4" is graded on that label → FALSE, with the event's own truth noted in evidence. This aligns U4/U10/U1 rows with U13/U14, who graded the identical label FALSE.
- Evidence cell: each unit's evidence prefixed by **U#** (with the unit's own verdict in [brackets] when it differs from the final verdict, and "(cited :N)" when HD corrected a drifted line), then **HD** with the resolution method where HD decided.
- Finding(s): plain ID = cited by the unit in the claim row; ≈ID = HD mapped the claim to the finding that owns the same defect; ~ID = a finding whose `locations` overlap this path:line (ranges ≤ 20 lines); UNCOVERED = FALSE/STALE with none (see §7).
- DOCKEY: CB codebase skill · ARCH architecture · CONTRIB contribution · LI loading-indicators (canonical) · LIC the `.claude/` real copy · VM version-migrations · FHC file-header-contracts (+ -SNIPPET, -EVAL references) · USAGE / RSM (responsive-sheet-modal) · THEME / TC (token-contract) · V3 / V5 / V5CM (v5 codemod) · README · CHANGELOG · CONTRIBUTING · SECURITY · NOTICES · LICENSE · PKG · SKILLSLOCK · SPEC (digits/sidebar/mono spec) · SPEC-CHARTS · RESEARCH · PROMPT (executor prompt) · HDR-<File> (lines inside a `## behavior`/`## constraints` header) · JSDOC-<File> (any other code/CSS/script comment).

## 1. Register (grouped by source doc)

### CB — `.agents/skills/dooph-ds-codebase/SKILL.md` (236)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-CB-1 | .agents/skills/dooph-ds-codebase/SKILL.md:8 | package `@dooph-software/design-system` | TRUE | **U14**: package.json:2 | U14 | — |
| C-CB-2 | .agents/skills/dooph-ds-codebase/SKILL.md:9 | tsup ESM+CJS+.d.ts; onSuccess emits styles.css and copies theme.css | TRUE | **U14** [TRUE (omits the add-use-client stamp)]: tsup.config.ts:12-23, 35-36, 55-58 · **U1**: tsup.config.ts:12-23, 60-63 · **U2** [TRUE (incomplete: onSuccess also runs add-use-client first)]: tsup.config.ts:34-35,54-57 | U1, U2, U14 | — |
| C-CB-3 | .agents/skills/dooph-ds-codebase/SKILL.md:10 | React peerDep `>=19` | TRUE | **U14**: package.json peerDependencies · **U1**: package.json peerDependencies react/react-dom `>=19` · **U2**: package.json:57-60 | U1, U2, U14 | — |
| C-CB-4 | .agents/skills/dooph-ds-codebase/SKILL.md:11 | Tailwind v4 with `@theme inline` | TRUE | **U14**: package.json tailwindcss ^4.3.3; index.css:74-209 · **U1**: index.css:75; dist banner tailwindcss v4.3.3 · **U2**: package.json:73 | U1, U2, U14 | — |
| C-CB-5 | .agents/skills/dooph-ds-codebase/SKILL.md:12 | exports `.`, `./styles.css`, `./theme.css` | TRUE | **U14**: package.json exports · **U1**: package.json exports · **U2**: package.json:20-28 | U1, U2, U14 | — |
| C-CB-6 | .agents/skills/dooph-ds-codebase/SKILL.md:13 | 11 Radix packages in `dependencies`; progress/slider/popover back LinearProgressIndicator/Slider*/Popover | TRUE | **U14**: package.json:80-90; LinearProgressIndicator.tsx:17; Slider.tsx:3; Popover.tsx:3 · **U1**: package.json dependencies (11 `@radix-ui/*` + cva, clsx, tailwind-merge) · **U2**: package.json:80-90; LinearProgressIndicator.tsx:17, Slider.tsx:3, Popover.tsx:3 · **U7**: package.json:83 `"@radix-ui/react-popover": "^1.1.23"` in dependencies; Popover.tsx:3 | U1, U2, U7, U14 | — |
| C-CB-7 | .agents/skills/dooph-ds-codebase/SKILL.md:15-17 | package is at 5.x | TRUE | **U14**: package.json:3 5.3.0 | U14 | — |
| C-CB-8 | .agents/skills/dooph-ds-codebase/SKILL.md:27 | `index.ts` barrel of all public exports | TRUE | **U14**: src/index.ts:1-52 · **U2** (cited :24): exports map exposes only "." (package.json:21-25) | U2, U14 | — |
| C-CB-9 | .agents/skills/dooph-ds-codebase/SKILL.md:28 | `utils/cn.ts` = clsx + tailwind-merge | TRUE | **U14**: cn.ts:1-2 · **U2** (cited :25): cn.ts:1-2,31-33 | U2, U14 | — |
| C-CB-10 | .agents/skills/dooph-ds-codebase/SKILL.md:29-32 | `utils/color.ts` backs `color` on Slider*/LinearProgressIndicator | STALE | **U14** [STALE (also Sticker.tsx:28, AIModelSelect.tsx:28)]: U14-F7 · **U2** (cited :26-29): also Sticker.tsx:113 (not a --ds-* property) and AIModelSelect.tsx:93,227 | U2, U14 | U14-F7 |
| C-CB-11 | .agents/skills/dooph-ds-codebase/SKILL.md:34 | index.css ← "Tailwind build entry: @import chain, generated @theme inline block, text-style-* role classes (@layer components), h-button/size-* utilities" | STALE | **U1** [STALE (incomplete)]: also 28 ds-* classes, 15 keyframes, 6 @property, 2 @custom-variant → U1-F7 · **U14** [TRUE]: index.css:1-5, 74, 209, 223, 350 · **HD** (conflict): U1 STALE vs U14 TRUE. Every listed item is present, but index.css now also holds `.ds-*` rules (e.g. ds-shimmer-text :369), 15 `@keyframes`, 6 `@property`, 2 `@custom-variant`, while CB:36 places ds-* helpers in dooph-component-tokens.css. At the commit that wrote the line (21d2236) index.css had 1 `@keyframes` and 0 `.ds-` rules (`git show 21d2236:src/styles/index.css \| grep -c`), so the description drifted → STALE. | U1, U14 | U1-F7, ~U1-F15 |
| C-CB-12 | .agents/skills/dooph-ds-codebase/SKILL.md:35 | tokens.css is source of truth, light in `:root`/`.light`, dark in `.dark` | TRUE | **U1**: tokens.css:17, 642 · **U14**: - | U1, U14 | — |
| C-CB-13 | .agents/skills/dooph-ds-codebase/SKILL.md:36 | dooph-component-tokens.css is `@layer utilities` ds-* helpers | TRUE | **U1** [TRUE (but not all ds-* live there)]: dooph-component-tokens.css:11-668 → U1-F7 · **U14**: dooph-component-tokens.css:11 | U1, U14 | U1-F7 |
| C-CB-14 | .agents/skills/dooph-ds-codebase/SKILL.md:37 | theme.css generated by sync-theme.mjs, shipped as ./theme.css | TRUE | **U1**: sync-theme.mjs:305; package.json exports · **U14**: theme.css:4 | U1, U14 | — |
| C-CB-15 | .agents/skills/dooph-ds-codebase/SKILL.md:38-86 | component directory list | FALSE | **U14** [FALSE (5 of 42 folders missing)]: U14-F6 | U14 | U14-F6, ~U3-F10 |
| C-CB-16 | .agents/skills/dooph-ds-codebase/SKILL.md:39-47 | seven wrappers listed; constants hold RollDirection/RevealDirection; useChangeSwap shared + internal; one merged stories file | TRUE | **U3**: AnimatedText/index.ts:1-15; constants.ts:12,27 | U3 | — |
| C-CB-17 | .agents/skills/dooph-ds-codebase/SKILL.md:51-52 | "Calendar/ ← Calendar + Grid/Caption/PresetsPanel, constants.ts, dateUtils.ts, dateFormat.ts, rangeSelection.ts" | TRUE | **U7**: folder listing (plus index.ts, stories) | U7 | — |
| C-CB-18 | .agents/skills/dooph-ds-codebase/SKILL.md:55 | "DatePicker/ ← Popover + Calendar; DatePicker/Trigger/SplitTrigger" | TRUE | **U7**: DatePicker.tsx:4-13 | U7 | — |
| C-CB-19 | .agents/skills/dooph-ds-codebase/SKILL.md:66 | "Popover/ ← Radix Popover; the surface DatePicker anchors on" | TRUE | **U7**: DatePicker.tsx:81,130 | U7 | — |
| C-CB-20 | .agents/skills/dooph-ds-codebase/SKILL.md:71 | "Shapes/ ← 12 shape primitives; 5 of them back ShapeButton" | TRUE | **U10**: 12 *Shape.tsx; ShapeButton.tsx:32-37 | U10 | — |
| C-CB-21 | .agents/skills/dooph-ds-codebase/SKILL.md:73-74 | "SidebarWithHoverIcon/ ← … traverses on `side`, bows to a chevron on `hovered`; SidebarIconSide" | TRUE | **U10**: SidebarWithHoverIcon.tsx:75-81; constants.ts:8-13 | U10 | — |
| C-CB-22 | .agents/skills/dooph-ds-codebase/SKILL.md:79 | "BaseText + 8 roles" | FALSE | **U3**: BaseText.tsx:133-158 = 10 (U3-F10) | U3 | U3-F10 |
| C-CB-23 | .agents/skills/dooph-ds-codebase/SKILL.md:79-80 | constants.ts (Fonts/FontSizes/FontWeights/Tracking/FontAxes), textStyle.ts | TRUE | **U3** [TRUE (omits TextVariant)]: Text/constants.ts | U3 | — |
| C-CB-24 | .agents/skills/dooph-ds-codebase/SKILL.md:81,314 | TextLink: Slot; ghost fg at rest, primary text on hover/active; no underline; asChild | TRUE | **U3**: TextLink.tsx:16-23; tokens.css:91 = :134 (#161616), dark :663 = :681 | U3 | — |
| C-CB-25 | .agents/skills/dooph-ds-codebase/SKILL.md:88 | main.ts uses @storybook/react-vite + @tailwindcss/vite | TRUE | **U14**: .storybook/main.ts:1-2, 16 · **U2**: main.ts:1-2,5,16 | U2, U14 | — |
| C-CB-26 | .agents/skills/dooph-ds-codebase/SKILL.md:89 | preview.ts toggles `.dark` on `<html>`, sets body bg | TRUE | **U14**: .storybook/preview.ts:23-25 · **U2**: preview.ts:21-27 | U2, U14 | — |
| C-CB-27 | .agents/skills/dooph-ds-codebase/SKILL.md:90 | preview-head.html Google Fonts, not shipped | TRUE | **U14**: package.json files = dist, skills, bin · **U2**: package.json:35-39 files = dist, skills, bin | U2, U14 | — |
| C-CB-28 | .agents/skills/dooph-ds-codebase/SKILL.md:91-95 | skills/ shipped via npm + init-skills; usage, theming, v3-migration, v5-migration | TRUE | **U2**: `ls skills` → exactly those 4; init.mjs:85,127 · **U14**: package.json files/bin; bin/init.mjs:28, 127 · **U14**: `ls skills/`; skills/dooph-design-system-v5-migration/codemod.mjs | U2, U14 | — |
| C-CB-29 | .agents/skills/dooph-ds-codebase/SKILL.md:96-102 | `.agents/skills/` contents (6 listed) | STALE | **U14** [STALE (9 exist)]: U14-F5 · **U2**: also file-header-contracts, skill-creator, using-airbnb-visx-lib (Glob .agents/skills/*/SKILL.md → 9) | U2, U14 | U14-F5, ~U14-F14 |
| C-CB-30 | .agents/skills/dooph-ds-codebase/SKILL.md:103-107 | `.claude/skills/` = 3 symlinks + loading-indicators real copy | STALE | **U14** [STALE/incomplete (8 entries: +vm symlink, 2 absolute junctions, skill-creator real copy)]: U14-F5 · **U2** [UNVERIFIABLE (not in U2 scope; git core.symlinks=false, see codebase:655-660)]: .git/config:6 · **HD** (conflict): U2 UNVERIFIABLE (out of scope) vs U14 STALE. `git ls-files -s .claude/skills` → 4 mode-120000 links + 66 regular files: the map lists 3 symlinks + 1 real copy; the vm symlink, fhc/visx (absolute junctions on disk, regular files in git) and skill-creator are missing → STALE. | U2, U14 | U14-F5, ~U14-F1 |
| C-CB-31 | .agents/skills/dooph-ds-codebase/SKILL.md:108 | `bin/init.mjs` is the init-skills CLI | TRUE | **U14**: package.json bin · **U2**: package.json:17-19,38 | U2, U14 | — |
| C-CB-32 | .agents/skills/dooph-ds-codebase/SKILL.md:109-113 | scripts list | STALE | **U14** [STALE (3 of 6; missing add-use-client, generate-shape-morph-ease, shapeMorphSpring)]: U14-F7 · **U2**: add-use-client.mjs, generate-shape-morph-ease.mjs, shapeMorphSpring.mjs missing (U2-F11) | U2, U14 | U14-F7, U2-F11 |
| C-CB-33 | .agents/skills/dooph-ds-codebase/SKILL.md:110-112 | what each listed script does (generate-icon-exports "regenerates Icons/index.ts from svg components"; sync-theme; copy-theme "used by build:css; tsup onSuccess does the same") | TRUE | **U14**: generate-icon-exports.mjs:6-7; sync-theme.mjs:31-33; copy-theme.mjs:18-20 · **U2** [FALSE]: reads `*Icon.tsx` files: generate-icon-exports.mjs:9-13 · **U1**: package.json:48; tsup.config.ts:20 → U1-F4 · **HD** (conflict): U2 FALSE (":110 reads *Icon.tsx, not svg") vs U14 TRUE. `ls src/components/Icons` → only `*Icon.tsx` (SVG React components), Icons.stories.tsx, index.ts — no `.svg` files; generator filters `^[A-Z][A-Za-z0-9]*Icon\.tsx$` (generate-icon-exports.mjs:9-13). "svg components" = those SVG components → TRUE (wording loose, not false). copy-theme part TRUE (U1). | U1, U2, U14 | U1-F4 |
| C-CB-34 | .agents/skills/dooph-ds-codebase/SKILL.md:123 | Button — `Slot`, `ButtonVariant` × `ButtonSize`, asChild ✅ | TRUE | **U4**: Button.tsx:25,126; constants.ts | U4 | — |
| C-CB-35 | .agents/skills/dooph-ds-codebase/SKILL.md:124-126 | SplitButton / Action / Trigger — no Radix, no variants, asChild ❌ | TRUE | **U4**: SplitButton.tsx:1-98 | U4 | — |
| C-CB-36 | .agents/skills/dooph-ds-codebase/SKILL.md:127 | OutlineButton — `Slot`; `inverseTheme`, `glowing` bools; `glowColor1/2` strings; asChild ✅ | FALSE | **U4** [Slot/props TRUE; asChild ✅ FALSE (throws)]: OutlineButton.tsx:18-38,86; U4-F1 | U4 | U4-F1 |
| C-CB-37 | .agents/skills/dooph-ds-codebase/SKILL.md:128 | ShapeButton — `Slot`; `ShapeButtons` × `ShapeButtonVariant`; asChild ✅ | FALSE | **U4** [Slot/consts TRUE; asChild ✅ FALSE (throws)]: ShapeButton.tsx:20,43-47,116; U4-F1 | U4 | U4-F1 |
| C-CB-38 | .agents/skills/dooph-ds-codebase/SKILL.md:129 | CopyButton — no Radix; `CopyButtonVariant (ghost\|secondary)`; wraps Button (ghost→iconMicro, secondary→iconSm) | TRUE | **U4**: CopyButton.tsx:71-82; constants.ts:8-11 | U4 | — |
| C-CB-39 | .agents/skills/dooph-ds-codebase/SKILL.md:129 | CopyButton asChild "via `Button`" | FALSE | **U4** [FALSE — `asChild` is explicitly omitted from `CopyButtonProps` (and would throw on CopyButton's three-span children if forced through)]: CopyButton.tsx:21 `"variant" \| "size" \| "children" \| "asChild"` | U4 | UNCOVERED |
| C-CB-40 | .agents/skills/dooph-ds-codebase/SKILL.md:130 | CTAButton — `Slot`; `CTAButtonVariant` × `CTAButtonSize`; asChild ✅ | TRUE | **U4**: CTAButton.tsx:1,114-125; aschild.cjs `OK CTAButton asChild <a>` | U4 | — |
| C-CB-41 | .agents/skills/dooph-ds-codebase/SKILL.md:132-135 | CTAButton: fully round radii; outline ring on primary only (`--ui-color-border-cta`); label-only hover via `RollHoverText` under ancestor `.group`; geometry in `--ui-*-cta-*` tokens | TRUE | **U4** [TRUE (geometry also uses generic `p-md`/`gap-rg`/`p-xs`/`px-rg`)]: CTAButton.tsx:72,87,93,107-110; index.css:136; tokens.css:572-580 | U4 | — |
| C-CB-42 | .agents/skills/dooph-ds-codebase/SKILL.md:135-136 | "Module is **neutral** (no `"use client"`) — it holds no state." | TRUE | **U4**: CTAButton.tsx:1; dist chunk-TIBWCTET.js has no directive | U4 | — |
| C-CB-43 | .agents/skills/dooph-ds-codebase/SKILL.md:138 | `ButtonVariant`: primary\|secondary\|prominent\|danger\|ghost\|text | TRUE | **U4**: constants.ts:8-15 | U4 | — |
| C-CB-44 | .agents/skills/dooph-ds-codebase/SKILL.md:138 | "`danger` replaced `destructive` in v3, and `prominent` replaced `brand` in 5.4" | FALSE | **U4** [UNVERIFIABLE (history; no old keys remain)]: `rg -n "destructive\|\bbrand\b" src/components/Button` → header only · **HD** (policy): P-5.4. v3 half TRUE (`git grep -o destructive`/`danger` in Button: v2.1.0 15/0, v3.0.0 0/15); "prominent replaced brand in 5.4" names an unreleased version → FALSE (label). | U4 | ≈U14-F4 |
| C-CB-45 | .agents/skills/dooph-ds-codebase/SKILL.md:138 | `ButtonSize`: default\|sm\|icon\|icon-sm\|icon-micro (`ButtonSize.iconMicro` backs `--ui-height-button-micro` via `size-button-micro`) | TRUE | **U4**: constants.ts:18-24; dist-styles.css:3247-3249 | U4 | — |
| C-CB-46 | .agents/skills/dooph-ds-codebase/SKILL.md:140 | "each one `<path d>` lifted verbatim from the Figma export kept alongside in `Shapes/svgs/`" | FALSE | **U10**: verify-shape-svgs.mjs: Pentagon/Puff differ, no star.svg (U10-F2) · **U4** [TRUE (per-shape "verbatim from Figma" UNVERIFIABLE here — Shapes unit)]: Shapes/index.ts:15-29 (12 keys); `rg Gem src/components/Shapes` → none · **HD** (conflict): U4 left the per-shape "verbatim from Figma" part UNVERIFIABLE (Shapes unit); U10 ran scratch/U10/verify-shape-svgs.mjs: Pentagon and Puff `d` strings differ from svgs/, no star.svg → FALSE. | U4, U10 | U10-F2 |
| C-CB-47 | .agents/skills/dooph-ds-codebase/SKILL.md:140 | "`GemShape` was REMOVED in 5.4; do not reintroduce it" | FALSE | **U10** [TRUE]: `rg -n -i gem src skills .agents .claude` → only `--ui-color-ai-gemini` and unrelated words · **U4** [TRUE (per-shape "verbatim from Figma" UNVERIFIABLE here — Shapes unit)]: Shapes/index.ts:15-29 (12 keys); `rg Gem src/components/Shapes` → none · **HD** (policy): P-5.4. U10 graded the removal (TRUE: `rg -i gem` → only `--ui-color-ai-gemini`); U13/U14 grade identical "…in 5.4" claims FALSE because no 5.4 exists (`git tag` tops at v5.3.0; package.json 5.3.0). Event TRUE, version label FALSE → FALSE (label). | U4, U10 | ≈U14-F4, ~U10-F2 |
| C-CB-48 | .agents/skills/dooph-ds-codebase/SKILL.md:140 | twelve shape primitives (`size`/`strokeColor`/`fillColor`/`strokeWeight`); `Shapes` const (Shapes/index.ts) enumerates the same twelve keys and types `Shapes` | TRUE | **U10**: Shapes/index.ts:15-29 (same identifier, R1.9 ok) · **U10**: BaseShape.tsx:4-9 (but `fillColor` is dead on Pentagon/Puff — U10-F1) · **U4** [TRUE (per-shape "verbatim from Figma" UNVERIFIABLE here — Shapes unit)]: Shapes/index.ts:15-29 (12 keys); `rg Gem src/components/Shapes` → none | U4, U10 | U10-F1 |
| C-CB-49 | .agents/skills/dooph-ds-codebase/SKILL.md:142 | "`ShapeButtons` … subset … held honest by `satisfies Record<string, Shapes>`" | TRUE | **U10**: ShapeButton/constants.ts:20 · **U4**: constants.ts:14-20 | U4, U10 | — |
| C-CB-50 | .agents/skills/dooph-ds-codebase/SKILL.md:142 | `ShapeButtonVariant` (prominent\|primary, default prominent); icon colour set on the ROOT; renders the real `Shapes/` primitive | TRUE | **U4**: constants.ts:27-30; ShapeButton.tsx:109,128,31-37 | U4 | — |
| C-CB-51 | .agents/skills/dooph-ds-codebase/SKILL.md:148 | Input row (variants, icon required, bare text, chrome div + ref on input, mirror, min button height) | TRUE | **U6**: Input.tsx as above | U6 | — |
| C-CB-52 | .agents/skills/dooph-ds-codebase/SKILL.md:149 | SearchBox: `shortcut` string[] | TRUE | **U5**: SearchBox.tsx:9 | U5 | — |
| C-CB-53 | .agents/skills/dooph-ds-codebase/SKILL.md:150-151 | ToggleSwitch: ToggleVariant primary\|ghost\|unselected × ToggleSize default\|sm\|icon\|iconSm=28px; item inherits via context | TRUE | **U6**: Toggle/constants.ts:16-33; Toggle.tsx:37-42, 121-123 | U6 | — |
| C-CB-54 | .agents/skills/dooph-ds-codebase/SKILL.md:152 | Checkbox variants = `CheckboxChecked` | STALE | **U6**: CheckboxVariant (prominent\|primary) missing (U6-F24) | U6 | U6-F24 |
| C-CB-55 | .agents/skills/dooph-ds-codebase/SKILL.md:153-154 | VerificationCodeInput / CodeDigitInput rows | TRUE | **U6**: as above; tokens.css:452 | U6 | — |
| C-CB-56 | .agents/skills/dooph-ds-codebase/SKILL.md:156-160 | ToggleSwitch fully controlled Radix, drops "", onValueChange never "" | TRUE | **U6**: Toggle.tsx:84-97 | U6 | — |
| C-CB-57 | .agents/skills/dooph-ds-codebase/SKILL.md:162-164 | VerificationCodeInput behaviours; no verification section | TRUE | **U6**: VerificationCodeInput.tsx:86-131 | U6 | — |
| C-CB-58 | .agents/skills/dooph-ds-codebase/SKILL.md:170 | Calendar: "`DatePickerMode.singleDay` / `.dateRange`" | TRUE | **U7**: Calendar.tsx:47-59 | U7 | — |
| C-CB-59 | .agents/skills/dooph-ds-codebase/SKILL.md:170 | Calendar: "controlled or uncontrolled `month`" | TRUE | **U7**: Calendar.tsx:150-165 (no `defaultMonth`; uncontrolled start derives from the selection) | U7 | — |
| C-CB-60 | .agents/skills/dooph-ds-codebase/SKILL.md:170 | Calendar: "`yearBounds`, `disabled` (`DateMatcher`), `renderDay`" | TRUE | **U7**: Calendar.tsx:34-38 | U7 | — |
| C-CB-61 | .agents/skills/dooph-ds-codebase/SKILL.md:171 | CalendarGrid: "`CalendarDayRenderProps` is what `renderDay` receives" | TRUE | **U7**: CalendarGrid.tsx:24-34,149-159,250-251 | U7 | — |
| C-CB-62 | .agents/skills/dooph-ds-codebase/SKILL.md:172 | CalendarCaption: "month/year header + navigation" | TRUE | **U7**: CalendarCaption.tsx:57-135 | U7 | — |
| C-CB-63 | .agents/skills/dooph-ds-codebase/SKILL.md:173 | presets rail: "width from `--ui-width-calendar-presets`" | TRUE | **U7**: CalendarPresetsPanel.tsx:21 `ds-calendar-presets-w` → dooph-component-tokens.css:298-300 | U7 | — |
| C-CB-64 | .agents/skills/dooph-ds-codebase/SKILL.md:174 | Popover* = Popover, Trigger, Anchor, Content, Portal, Close | TRUE | **U7**: Popover.tsx:69-76; Popover/index.ts:1-9 | U7 | — |
| C-CB-65 | .agents/skills/dooph-ds-codebase/SKILL.md:175 | DatePicker: "via `Popover`"; "`DatePickerTrigger` and `DatePickerSplitTrigger` are the two trigger shapes" | TRUE | **U7**: DatePicker.tsx:81-128 | U7 | — |
| C-CB-66 | .agents/skills/dooph-ds-codebase/SKILL.md:177-181 | constants.ts carries `DatePickerMode`, `DateRange` (structural, `to` non-nullable), `CalendarPresets` (`today`, `days.three/seven/fourteen/thirty`, `months.three/six`, `custom({id,label,days})`), `DEFAULT_CALENDAR_PRESE… | TRUE | **U7**: constants.ts:13-18,25-28,89-115,118-132 (also carries the `CalendarPreset` type, unmentioned) | U7 | — |
| C-CB-67 | .agents/skills/dooph-ds-codebase/SKILL.md:183-185 | "`yearBounds` limits the calendar's OWN navigation but a consumer value outside them is reported, never rewritten" | TRUE | **U7**: Calendar.tsx:92-104 (warn only), :141-142 (value used as passed), :160 (navigation clamped) | U7 | — |
| C-CB-68 | .agents/skills/dooph-ds-codebase/SKILL.md:185-186 | "a controlled `month` is never clamped" | TRUE | **U7**: Calendar.tsx:154-156 `month ? startOfMonth(month) : clampMonthToYearBounds(...)`; :160 still clamps the month it EMITS via `onMonthChange` when navigating (navigation, consistent with the claim) | U7 | — |
| C-CB-69 | .agents/skills/dooph-ds-codebase/SKILL.md:186-189 | `dateUtils` (`isSameDay`, `startOfDay`, `DateMatcher`) and `dateFormat` (`formatRangeLabel`, `formatSingleLabel`) "are re-exported from `Calendar/index.ts` so `DatePicker` never deep-imports a sibling" | TRUE | **U7** [TRUE (incomplete)]: Calendar/index.ts:19-22; DatePicker files import only barrels. Omits that `export *` makes them public package API (U7-F2) and that the Calendar folder itself deep-imports Menu (CalendarPresetsPanel.tsx:5) | U7 | U7-F2 |
| C-CB-70 | .agents/skills/dooph-ds-codebase/SKILL.md:195-200 | Tabs family rows; TabSize adds iconMicro 28×28; Segmented wraps Tabs; item inherits | TRUE | **U6**: Tabs/constants.ts:25; toggleOption.ts:62; SegmentedTabSelect.tsx:61-72, 89-97 | U6 | — |
| C-CB-71 | .agents/skills/dooph-ds-codebase/SKILL.md:202 | toggleOptionVariants "internal, not re-exported" | FALSE | **U6**: public as `tabTriggerVariants` (Tabs.tsx:28,62; dist-index.d.ts:105) (U6-F14) | U6 | U6-F14 |
| C-CB-72 | .agents/skills/dooph-ds-codebase/SKILL.md:202 | unselected look shared; `unselected` renders regardless of state | TRUE | **U6**: toggleOption.ts:33, 46 | U6 | — |
| C-CB-73 | .agents/skills/dooph-ds-codebase/SKILL.md:202 | tabTriggerVariants stays exported as an alias | TRUE | **U6**: Tabs/index.ts:1 | U6 | — |
| C-CB-74 | .agents/skills/dooph-ds-codebase/SKILL.md:206-207 | (table shape) | FALSE | **U5** [FALSE — 3-column header, 4-column separator/rows]: U5-F10 | U5 | U5-F10 |
| C-CB-75 | .agents/skills/dooph-ds-codebase/SKILL.md:208 | `DropdownMenu` (Root) uses `@radix-ui/react-dropdown-menu` | TRUE | **U5**: DM:23 | U5 | — |
| C-CB-76 | .agents/skills/dooph-ds-codebase/SKILL.md:209 | Content: portal toggle; `focusOnOpen` default true | TRUE | **U5** [TRUE (omits `matchTriggerWidth`, `dismissOnFocusLoss`)]: DM:110-118 | U5 | — |
| C-CB-77 | .agents/skills/dooph-ds-codebase/SKILL.md:210 | `DropdownMenuItem` wraps Item | TRUE | **U5**: DM:208 | U5 | — |
| C-CB-78 | .agents/skills/dooph-ds-codebase/SKILL.md:211 | MultiSelectItem wraps CheckboxItem; renamed from `DropdownMenuCheckboxItem` | TRUE | **U5**: DM:310; `git show v5.3.0:…DropdownMenu.tsx` line 216 | U5 | — |
| C-CB-79 | .agents/skills/dooph-ds-codebase/SKILL.md:212 | RadioSelectItem wraps RadioItem, inside RadioGroup | TRUE | **U5**: DM:254 | U5 | — |
| C-CB-80 | .agents/skills/dooph-ds-codebase/SKILL.md:213 | PlainItem plain div, not roving-focus reachable | TRUE | **U5**: DM:233-247 | U5 | — |
| C-CB-81 | .agents/skills/dooph-ds-codebase/SKILL.md:214 | Segment divider/labeled; `DropdownMenuSegmentVariant` | TRUE | **U5**: DM:366-378 | U5 | — |
| C-CB-82 | .agents/skills/dooph-ds-codebase/SKILL.md:215-216 | Label, Separator wrap Radix | TRUE | **U5**: DM:332-358 | U5 | — |
| C-CB-83 | .agents/skills/dooph-ds-codebase/SKILL.md:217 | Section: layout div, horizontal inset, `width` overrides hug | TRUE | **U5**: DM:390-400 | U5 | — |
| C-CB-84 | .agents/skills/dooph-ds-codebase/SKILL.md:218 | Group/Sub/RadioGroup/Portal are pass-throughs | TRUE | **U5**: DM:89-92 | U5 | — |
| C-CB-85 | .agents/skills/dooph-ds-codebase/SKILL.md:219 | Trigger: thin forwardRef reading selectType, forwards `data-select-type` | TRUE | **U5**: DM:74-87 | U5 | — |
| C-CB-86 | .agents/skills/dooph-ds-codebase/SKILL.md:220 | `DropdownTrigger` — `Slot`, asChild | FALSE | **U5** [FALSE (asChild throws)]: U5-F1 | U5 | U5-F1, ~U5-F10 |
| C-CB-87 | .agents/skills/dooph-ds-codebase/SKILL.md:221 | `DropdownTriggerContent` = `<div className="flex flex-row gap-xs">` | TRUE | **U5**: DT:45 | U5 | — |
| C-CB-88 | .agents/skills/dooph-ds-codebase/SKILL.md:222 | `TextDropdownTrigger` — `Slot`, `TextDropdownSize` | FALSE | **U5** [FALSE for Slot/asChild (throws); TRUE for size const]: U5-F1; DT:286 | U5 | U5-F1, ~U5-F10 |
| C-CB-89 | .agents/skills/dooph-ds-codebase/SKILL.md:223 | Typeable: div root; `inputRef`; `displayValue`; re-emits `data-select-type`; state-aware `onPointerDown`; disabled forwards nothing and emits `aria-disabled`/`data-disabled` | TRUE | **U5**: DT:126, 133, 167, 190, 210-248 | U5 | — |
| C-CB-90 | .agents/skills/dooph-ds-codebase/SKILL.md:223 | known multi-select typeahead limitation | TRUE | **U5** [UNVERIFIABLE (runtime behaviour; consistent with DT:91-96)]: — · **HD** (unverifiable): Static: @radix-ui/react-menu dist/index.mjs:452-461 item `onPointerMove` → `item.focus()`; :314 content keydown → `handleTypeaheadSearch` → after pointer-toggling, keystrokes reach typeahead → TRUE. | U5 | — |
| C-CB-91 | .agents/skills/dooph-ds-codebase/SKILL.md:227-242 | overlay inventory | TRUE | **U8** [TRUE but incomplete]: omits `TooltipProvider`, `TooltipTrigger`, `TooltipTitle`, `TooltipBody`, `ToastTitle`, `ToastDescription`, `useToast`, `ToastTypes` (all public: dist-index.d.ts:147-150) | U8 | — |
| C-CB-92 | .agents/skills/dooph-ds-codebase/SKILL.md:229 | `Modal` — `Modal/Modal.tsx` — `@radix-ui/react-dialog` | TRUE | **U8**: Modal.tsx:8,13 | U8 | — |
| C-CB-93 | .agents/skills/dooph-ds-codebase/SKILL.md:230 | `ModalTrigger`, `ModalPortal`, `ModalClose` "pass-throughs" | TRUE | **U8**: Modal.tsx:14-16 | U8 | — |
| C-CB-94 | .agents/skills/dooph-ds-codebase/SKILL.md:231 | `ModalOverlay` "styled backdrop" | TRUE | **U8**: Modal.tsx:20-37 | U8 | — |
| C-CB-95 | .agents/skills/dooph-ds-codebase/SKILL.md:232 | `ModalContent` "panel; `withOverlay` bool" | TRUE | **U8**: Modal.tsx:59-65 | U8 | — |
| C-CB-96 | .agents/skills/dooph-ds-codebase/SKILL.md:233 | `ModalTitle`, `ModalDescription` "a11y helpers" | TRUE | **U8**: Modal.tsx:90-112 | U8 | — |
| C-CB-97 | .agents/skills/dooph-ds-codebase/SKILL.md:234 | `Sheet` on react-dialog, "edge-anchored panel counterpart to Modal" | TRUE | **U8**: Sheet.tsx:3,15,79-95 | U8 | — |
| C-CB-98 | .agents/skills/dooph-ds-codebase/SKILL.md:235 | `SheetTrigger`, `SheetPortal`, `SheetClose` pass-throughs | TRUE | **U8**: Sheet.tsx:16-18 | U8 | — |
| C-CB-99 | .agents/skills/dooph-ds-codebase/SKILL.md:236 | `SheetOverlay` "fade synced to panel (300ms in / 200ms out)" | TRUE | **U8**: Sheet.tsx:37-38 vs 73-74 | U8 | — |
| C-CB-100 | .agents/skills/dooph-ds-codebase/SKILL.md:237 | `side` = `SheetSide.left/right/top/bottom` "(default right)"; `withOverlay` bool | TRUE | **U8**: Sheet.tsx:98-100,132-133; Sheet/constants.ts:8-13 | U8 | — |
| C-CB-101 | .agents/skills/dooph-ds-codebase/SKILL.md:237 | "enters from 20% offset + fade via `slide-*-[20%]` + `fade-in-0`" | TRUE | **U8**: Sheet.tsx:73,82-94; dist-styles.css `slide-in-from-right-\[20\%\]` → `--tw-enter-translate-x: 20%` | U8 | — |
| C-CB-102 | .agents/skills/dooph-ds-codebase/SKILL.md:237 | "unsuffixed `slide-*` resolves to 0.25rem in Tailwind v4" | FALSE | **U8** [UNVERIFIABLE]: unsuffixed form not used, so not in dist-styles.css; tailwindcss-animate/index.js:152-153 `animationTranslate: … DEFAULT: "100%", ...theme("translate")` — outcome depends on v4's compat `theme("translate")`, not checked by compiling · **HD** (unverifiable): Compiled `slide-in-from-right` with tailwindcss 4.3.3 + tailwindcss-animate 1.0.7 (scratch/HD/tw/, `@tailwindcss/cli`): `.slide-in-from-right { --tw-enter-translate-x: 100%; }` — 100%, not 0.25rem → FALSE. | U8 | UNCOVERED |
| C-CB-103 | .agents/skills/dooph-ds-codebase/SKILL.md:237 | "300ms in `cubic-bezier(0.32,0.72,0,1)`, 200ms out" | TRUE | **U8** [TRUE (hard-coded — U8-F3)]: Sheet.tsx:73-74 | U8 | U8-F3 |
| C-CB-104 | .agents/skills/dooph-ds-codebase/SKILL.md:237 | "timing set as arbitrary `[animation-timing-function:…]` property" | TRUE | **U8**: Sheet.tsx:73-74 | U8 | — |
| C-CB-105 | .agents/skills/dooph-ds-codebase/SKILL.md:239 | `Tooltip` — `Tooltip/Tooltip.tsx` — react-tooltip | TRUE | **U8**: Tooltip.tsx:3,16 | U8 | — |
| C-CB-106 | .agents/skills/dooph-ds-codebase/SKILL.md:240 | `TooltipContent` "variants: `TooltipTypes.simple/rich/complex`; token-driven `themeInverse`" | TRUE | **U8**: Tooltip/constants.ts:4-8; Tooltip.tsx:66-72; dooph-component-tokens.css:285-295 | U8 | — |
| C-CB-107 | .agents/skills/dooph-ds-codebase/SKILL.md:241 | `ToastProvider`, `ToastRoot`, `ToastViewport` in `Toast/Toast.tsx`, react-toast | TRUE | **U8**: Toast.tsx:3,90,102,204 | U8 | — |
| C-CB-108 | .agents/skills/dooph-ds-codebase/SKILL.md:242 | `ToastAction`, `ToastClose` "reuse `buttonVariants`" | TRUE | **U8**: Toast.tsx:147-150,165-168 (Button's classes all live in buttonVariants, Button.tsx:37-105, so reuse is complete) | U8 | — |
| C-CB-109 | .agents/skills/dooph-ds-codebase/SKILL.md:242 | "action toasts use text dismiss + primary action" | TRUE | **U8**: Toast.tsx:266-275 (ghost `sm` `ToastDismiss` "Dismiss" + primary `ToastAction`) | U8 | — |
| C-CB-110 | .agents/skills/dooph-ds-codebase/SKILL.md:248-250 | Slider rows (Base showSteps false/true; dots ds-slider-dot [data-active]; Labeled labels as LabelText, `stepped`) | TRUE | **U6**: Slider.tsx:392-403, 421-453 | U6 | — |
| C-CB-111 | .agents/skills/dooph-ds-codebase/SKILL.md:252-257 | SliderVariant primary\|prominent\|custom default primary; VARIANT_PAINTS bundle; color/stepColor override | TRUE | **U6**: Slider.tsx:56-80, 122, 333-338 | U6 | — |
| C-CB-112 | .agents/skills/dooph-ds-codebase/SKILL.md:259-266 | custom requires color: union + unconditional throw; Object.values cannot be mapped | TRUE | **U6** [TRUE (with U6-F23 caveat: `color=""` compiles and throws)]: Slider.tsx:38-43, 288-294; stories:79-83 | U6 | U6-F23 |
| C-CB-113 | .agents/skills/dooph-ds-codebase/SKILL.md:260 | "`SliderProps` is a discriminated union (same shape as `CalendarProps`)" | TRUE | **U7** [TRUE (shape only)]: Calendar.tsx:59. The pairing with an unconditional throw described in the same paragraph does not hold for Calendar (U7-F1) | U7 | U7-F1 |
| C-CB-114 | .agents/skills/dooph-ds-codebase/SKILL.md:267-268 | SliderLabeledProps is a type alias | TRUE | **U6**: Slider.tsx:436 | U6 | — |
| C-CB-115 | .agents/skills/dooph-ds-codebase/SKILL.md:272-275 | component writes the three --ds-slider-* vars; helpers read them with primary fallbacks | TRUE | **U6**: Slider.tsx:333-338; dooph-component-tokens.css:117-124, 154-158 | U6 | — |
| C-CB-116 | .agents/skills/dooph-ds-codebase/SKILL.md:279-281 | opacity no longer 45%: primary 50%/60%, prominent 70%/60% | TRUE | **U6**: tokens.css:505-506, 700-701 (.dark from :642) | U6 | — |
| C-CB-117 | .agents/skills/dooph-ds-codebase/SKILL.md:283-285 | geometry = literal calc() class strings; dots, fills, handle share one formula | FALSE | **U6**: dots use inline style template (Slider.tsx:99-100, 401); formula written 3× (:100, :368, :380); handle placed by Radix (U6-F24) | U6 | U6-F24 |
| C-CB-118 | .agents/skills/dooph-ds-codebase/SKILL.md:288-291 | wrapper px-xs; fills bleed via --ds-slider-pad (0px continuous) | TRUE | **U6**: Slider.tsx:309, 339, 367, 379 | U6 | — |
| C-CB-119 | .agents/skills/dooph-ds-codebase/SKILL.md:292-293 | padding the root itself does nothing | TRUE | **U6** [UNVERIFIABLE]: Radix runtime behaviour; consistent with Slider.tsx:299-305 comment · **HD** (unverifiable): Static: @radix-ui/react-slider dist/index.mjs:208/275 map the pointer against `getBoundingClientRect()` (border box, includes padding) and :491 place the thumb at `calc(${percent}% + offset)` of the root → padding the root does not inset travel → TRUE. | U6 | — |
| C-CB-120 | .agents/skills/dooph-ds-codebase/SKILL.md:294-297 | driven at step / DRAG_SUBDIVISIONS while dragging; snapped on change/commit; keyboard handled explicitly | TRUE | **U6**: Slider.tsx:87, 184-185, 197-200, 212-255, 317 | U6 | — |
| C-CB-121 | .agents/skills/dooph-ds-codebase/SKILL.md:298-300 | ds-slider-glide on handle + fills; off mid-drag and until first interaction | TRUE | **U6**: Slider.tsx:355; dooph-component-tokens.css:166-171 | U6 | — |
| C-CB-122 | .agents/skills/dooph-ds-codebase/SKILL.md:306 | LinearProgressIndicator backed by `@radix-ui/react-progress` "(v3)" | TRUE | **U9** [FALSE]: package.json:84 `"^1.1.16"` · **HD** (regrade): Single-unit verdict questioned: U9 read "(v3)" as the react-progress major (package.json `^1.1.16`). In this file "(v3)" is the "v3 addition" label (CB:15-17 explains the labels; same form at CB:138 "`ButtonSize` (v3)"); LinearProgressIndicator is listed as new in v3 (v3-migration:220-224). TRUE as a label, but the label is ambiguous — worth removing with the other v3 labels. | U9 | — |
| C-CB-123 | .agents/skills/dooph-ds-codebase/SKILL.md:306 | `color` same contract as Slider*, default `primary`, via `--ds-progress-color`; no `LinearProgressVariant` | TRUE | **U9**: LPI.tsx:34, 52; Slider.tsx:13, 333; no such const in src | U9 | — |
| C-CB-124 | .agents/skills/dooph-ds-codebase/SKILL.md:306 | clamps `value` into `[0, max]` before computing `--progress-pct` | TRUE | **U9**: LPI.tsx:40-42, 51 | U9 | — |
| C-CB-125 | .agents/skills/dooph-ds-codebase/SKILL.md:306 | remainder hides via `data-hidden` once `pct >= 100` "so it never overlaps the 0% nub" | TRUE | **U9** [TRUE (mechanism) / UNVERIFIABLE (rationale)]: LPI.tsx:70-72 · **HD** (unverifiable): Mechanism TRUE (LinearProgressIndicator.tsx:70-72 `data-hidden` when pct >= 100); the rationale follows from it — a hidden remainder cannot overlap the nub — so the claim as a whole is TRUE. | U9 | — |
| C-CB-126 | .agents/skills/dooph-ds-codebase/SKILL.md:307 | LoadingSpinner: "see ... skill for the wave/geometry model" | STALE | **U9**: wave geometry is ProgressIndicator's (li:236; WG.ts) | U9 | ~U9-F19 |
| C-CB-127 | .agents/skills/dooph-ds-codebase/SKILL.md:308 | ProgressIndicator row | TRUE | **U9**: — | U9 | — |
| C-CB-128 | .agents/skills/dooph-ds-codebase/SKILL.md:320 | BaseText props resolve to inline style in textStyle.ts; `unstyled`; polymorphic `as` | TRUE | **U3**: BaseText.tsx:80-98; textStyle.ts:78-117 | U3 | — |
| C-CB-129 | .agents/skills/dooph-ds-codebase/SKILL.md:321 | the **ten** role components via `createRoleText`; hero-scale = base role at 16px only | TRUE | **U3**: BaseText.tsx:122-158; tokens.css:401-402; index.css:249-266 | U3 | — |
| C-CB-130 | .agents/skills/dooph-ds-codebase/SKILL.md:322 | consts in server-safe Text/constants.ts; FontSizes has heroBody/heroButton; values are var strings; FontAxes holds tags | TRUE | **U3**: Text/constants.ts:1-3,44-54,88-98 | U3 | — |
| C-CB-131 | .agents/skills/dooph-ds-codebase/SKILL.md:323 | `serializeAxes`, `TextStyleProps` in textStyle.ts | TRUE | **U3** [TRUE (export questioned U3-F7)]: textStyle.ts:37,43 | U3 | U3-F7 |
| C-CB-132 | .agents/skills/dooph-ds-codebase/SKILL.md:326-330 | seven wrappers; server-safe constants; barrel; src/index.ts re-exports alongside Text | TRUE | **U3**: src/index.ts:14-15 | U3 | — |
| C-CB-133 | .agents/skills/dooph-ds-codebase/SKILL.md:332-334 | useChangeSwap NOT re-exported | TRUE | **U3**: AnimatedText/index.ts | U3 | — |
| C-CB-134 | .agents/skills/dooph-ds-codebase/SKILL.md:336-337 | rollingDigitsModel NOT re-exported | TRUE | **U3**: AnimatedText/index.ts:17-19 | U3 | — |
| C-CB-135 | .agents/skills/dooph-ds-codebase/SKILL.md:341 | ShimmerText: `ds-shimmer-text`, background-clip text, tune via `--ui-shimmer-*`, respects RM | TRUE | **U3**: index.css:369-388 | U3 | — |
| C-CB-136 | .agents/skills/dooph-ds-codebase/SKILL.md:342 | RollChangeText keyframes `ds-roll-out`/`ds-roll-in` | TRUE | **U3**: index.css:717-725,957-972 | U3 | — |
| C-CB-137 | .agents/skills/dooph-ds-codebase/SKILL.md:343 | FadeChangeText: shared engine, `--ds-roll-dir`, tokens alias roll-change, keyframes `ds-fade-change-*` | TRUE | **U3**: tokens.css:255-259; index.css:739-747 | U3 | — |
| C-CB-138 | .agents/skills/dooph-ds-codebase/SKILL.md:344 | RollHoverText `ds-roll-hover*` classes | TRUE | **U3**: RollHoverText.tsx:53,75,80,83-84 | U3 | — |
| C-CB-139 | .agents/skills/dooph-ds-codebase/SKILL.md:345 | UnderlineLinkText currentColor gradient; own hover/group/active | TRUE | **U3**: index.css:493-515 | U3 | — |
| C-CB-140 | .agents/skills/dooph-ds-codebase/SKILL.md:347 | RevealChangeText width slot, tokens, null collapse, onSettled, render reconcile, transitionend, RM 1ms | TRUE | **U3**: RevealChangeText.tsx; index.css:882-918 | U3 | — |
| C-CB-141 | .agents/skills/dooph-ds-codebase/SKILL.md:350-352 | `--ui-text-mono`/`--ui-weight-mono` alias the button role's tokens; `--ui-font-var-mono: "MONO" 1` | TRUE | **U3** [TRUE (size aliases `--ui-text-body`, which is the button role's size token)]: tokens.css:406,420,436; index.css:227 | U3 | — |
| C-CB-142 | .agents/skills/dooph-ds-codebase/SKILL.md:356-361 | `tabular` false writes proportional-nums; omit inherits | TRUE | **U3**: textStyle.ts:100-102 | U3 | — |
| C-CB-143 | .agents/skills/dooph-ds-codebase/SKILL.md:367-375 | place keying; roll = transition, enter/exit = animations; "no requestAnimationFrame, no timer and no transitionend in the component" | TRUE | **U3**: index.css:652-653,592-619; grep | U3 | — |
| C-CB-144 | .agents/skills/dooph-ds-codebase/SKILL.md:376-385 | explicit widths; one-sided keyframes; comma owned by trailing wheel | TRUE | **U3**: index.css:583,589,1004-1015; model:187-189 | U3 | — |
| C-CB-145 | .agents/skills/dooph-ds-codebase/SKILL.md:387-394 | tabular fixed; spacer visibility hidden; model not re-exported | TRUE | **U3**: index.css:561,622-624 | U3 | — |
| C-CB-146 | .agents/skills/dooph-ds-codebase/SKILL.md:398 | "`IconSize` enum (`sm` 12 / `rg` 14 / `md` 16 / `lg` 18, backed by `--ui-icon-sm`…)" | TRUE | **U10**: BaseIcon.tsx:9-14; tokens.css:525-528; public only via the generator alias (U10-F8) | U10 | U10-F8 |
| C-CB-147 | .agents/skills/dooph-ds-codebase/SKILL.md:398 | "stroke from `--ui-icon-stroke-width`, 1.5" | FALSE | **U10**: tokens.css:529 is `2` (U10-F9) | U10 | U10-F9 |
| C-CB-148 | .agents/skills/dooph-ds-codebase/SKILL.md:398 | "the old names and the 20px `--ui-icon-large` are gone" | TRUE | **U10**: rg icon-tiny/icon-standard/icon-medium/icon-large in src → none | U10 | — |
| C-CB-149 | .agents/skills/dooph-ds-codebase/SKILL.md:400 | "`npm run build` regenerates it first" | TRUE | **U10**: package.json build: `npm run generate-icon-exports && …` | U10 | — |
| C-CB-150 | .agents/skills/dooph-ds-codebase/SKILL.md:400-402 | "cannot hold a hand-written alias … the next build deletes it" | TRUE | **U10**: generate-icon-exports.mjs:38-47 overwrites the file; the one alias (`IconSizes as IconSize`) is hard-coded in the generator (:41) | U10 | — |
| C-CB-151 | .agents/skills/dooph-ds-codebase/SKILL.md:403-405 | "generator also **hard-fails** on any `*Icon.tsx` that does not export a const matching its filename" | TRUE | **U10** [TRUE (with gaps)]: generate-icon-exports.mjs:22-36 exits 1; but only files matching `^[A-Z][A-Za-z0-9]*Icon\.tsx$` are checked, the check is a substring `includes`, and a wrong default export is invisible to it (U10-F4) | U10 | U10-F4 |
| C-CB-152 | .agents/skills/dooph-ds-codebase/SKILL.md:409-410 | "Its own folder … so the generator must not see it" | TRUE | **U10**: generator reads only src/components/Icons (:6, :11) | U10 | — |
| C-CB-153 | .agents/skills/dooph-ds-codebase/SKILL.md:417-422 | "`@property`-registered numbers transitioned on the `<path>` via `.ds-sidebar-rail`; a self-terminating rAF … nothing here mirrors them" | TRUE | **U10**: index.css:37-46, 765-771; SidebarWithHoverIcon.tsx:102-130 | U10 | — |
| C-CB-154 | .agents/skills/dooph-ds-codebase/SKILL.md:423-426 | side-swap-while-hovered "falls out of the maths" | TRUE | **U10**: SidebarWithHoverIcon.tsx:76-78 | U10 | — |
| C-CB-155 | .agents/skills/dooph-ds-codebase/SKILL.md:427-429 | "At `hovered = 1` the path is byte-identical to the static `SidebarLeftHoverIcon` / `SidebarRightHoverIcon`" | TRUE | **U10**: see the SidebarWithHoverIcon.tsx:14-16 row | U10 | — |
| C-CB-156 | .agents/skills/dooph-ds-codebase/SKILL.md:430-432 | "`d` is in JSX only for the FIRST render (from a ref set once)" | TRUE | **U10**: SidebarWithHoverIcon.tsx:96-97 | U10 | — |
| C-CB-157 | .agents/skills/dooph-ds-codebase/SKILL.md:433-435 | "An earlier version called `closest(…)` … — see the architecture skill's Rule 6" | FALSE | **U10** [FALSE (rule number)]: the ancestor-query rule is Rule 7, arch SKILL.md:363-376 (Rule 6 is motion, :309) (U10-F13) · **U14** [FALSE (Rule 7)]: arch:363-376; U14-F7 | U10, U14 | U10-F13, U14-F7 |
| C-CB-158 | .agents/skills/dooph-ds-codebase/SKILL.md:441 | HotkeyIndicator: `<kbd>` display, `keys: string[]`, `pressed` bool | TRUE | **U5**: HotkeyIndicator.tsx:4-7, 13 | U5 | — |
| C-CB-159 | .agents/skills/dooph-ds-codebase/SKILL.md:442 | OutlineSection "outer dashed ring + inner surface card" | FALSE | **U12** [FALSE (solid)]: OutlineSection.tsx:22 → U12-F9 | U12 | U12-F9 |
| C-CB-160 | .agents/skills/dooph-ds-codebase/SKILL.md:443 | Avatar "Composable square shell; `children` only, size via `AvatarSize.standard/small`" | TRUE | **U12**: Avatar.tsx:4-7, 10-12, 23-24 (`size-[…]` = square) | U12 | — |
| C-CB-161 | .agents/skills/dooph-ds-codebase/SKILL.md:451 | values live in `--ui-*` on `:root`/`.light` and `.dark` | TRUE | **U1**: tokens.css | U1 | — |
| C-CB-162 | .agents/skills/dooph-ds-codebase/SKILL.md:451 | components never use `var(--ui-*)` directly in className strings | FALSE | **U1** [UNVERIFIABLE here (component units)]: tokens.mjs shows `--ui-text-cta-*` referenced in CTAButton.tsx code — for U-component review · **HD** (unverifiable): `grep -rn --include=*.tsx "var(--ui-" src` (non-story) → Slider.tsx:344 `h-[var(--ui-height-slider-handle)]`, :368, :380, :408 — raw `var(--ui-*)` inside className arbitrary values → FALSE. | U1 | ≈U6-F3 |
| C-CB-163 | .agents/skills/dooph-ds-codebase/SKILL.md:455 | `TooltipContent themeInverse` switches `ds-tooltip-inverse-theme`/`-matching-theme`; no runtime detection | TRUE | **U1**: Tooltip.tsx:20-21, 66 · **U8**: tokens.css:115-120; Tooltip.tsx:19-22,66; no `documentElement/classList/matchMedia/localStorage` in Tooltip.tsx | U1, U8 | — |
| C-CB-164 | .agents/skills/dooph-ds-codebase/SKILL.md:456 | toast width tokens consumed by `ds-toast-width-simple`, `ds-toast-width-complex`, `ds-toast-viewport` | TRUE | **U8**: tokens.css:461-463; dooph-component-tokens.css:260-273 · **U1**: dooph-component-tokens.css:260-273; Toast.tsx:70 | U1, U8 | — |
| C-CB-165 | .agents/skills/dooph-ds-codebase/SKILL.md:456 | "Widths are pinned per variant, matching `ToastTypes.simple`/`.complex`" | STALE | **U8**: ToastTypes has 4 keys (Toast/constants.ts:4-9); simple width serves simple/prominent/danger (Toast.tsx:70-74) — U8-F15 | U8 | U8-F15 |
| C-CB-166 | .agents/skills/dooph-ds-codebase/SKILL.md:457 | menu width tokens: `--ui-min-w-menu` (160) held by items via `ds-min-w-menu` in `itemBase`; `--ui-min-w-menu-complex` (324) for a wide Section / DropdownMenuSearch, also backs `--ui-min-w-search-box`; `--ui-min-w-menu-a… | TRUE | **U5**: tokens.css:562; DM:200 · **U1**: tokens.css:562-568; Menu/DropdownMenu.tsx:200; no `--ui-min-w-menu-action` in tokens.css · **U5** [TRUE (Search uses it; Section only via consumer class — stories use `width={324}`, F9)]: tokens.css:563; DropdownMenuSearch.tsx:54 · **U5**: tokens.css:568 `--ui-min-w-search-box: var(--ui-min-w-menu-complex);` · **U5** [TRUE (removed since v5.3.0; not in CHANGELOG, F8)]: `rg min-w-menu-action src scripts` → 0; v5.3.0 tokens.css count 1 | U1, U5 | U5-F9, U5-F8 |
| C-CB-167 | .agents/skills/dooph-ds-codebase/SKILL.md:457 | `--ui-width-tooltip-rich` / `--ui-min-w-tooltip-complex` back `ds-width-tooltip-rich`/`ds-min-w-tooltip-complex`; simple hugs | TRUE | **U8**: tokens.css:467-468; dooph-component-tokens.css:277-283; Tooltip.tsx:68 (`whitespace-nowrap`, no width) · **U1**: dooph-component-tokens.css:277-283; Tooltip.tsx:70,72 | U1, U8 | — |
| C-CB-168 | .agents/skills/dooph-ds-codebase/SKILL.md:458 | no `--ui-color-avatar-bg`; Avatar composes `bg-surface-secondary` + `border-border-secondary` + `text-prominent-color`; logo via children, no provider | TRUE | **U12**: rg avatar src/styles → radius tokens only; Avatar.tsx:21-22; classcheck OK for all three · **U1**: Avatar.tsx:21-22 | U1, U12 | — |
| C-CB-169 | .agents/skills/dooph-ds-codebase/SKILL.md:459-460 | "Every animated component owns a `--ui-<component>-*` family and the component reads them only through CSS" | FALSE | **U8** [FALSE for Modal/Sheet/Tooltip/Toast]: no such tokens (tokens.css:193-373); literals in className — U8-F3 · **U1**: six components hardcode motion in ds-* helpers → U1-F6 | U1, U8 | U8-F3, U1-F6, ~U1-F15, ~U14-F6 |
| C-CB-170 | .agents/skills/dooph-ds-codebase/SKILL.md:459-463 | "Current families: roll-hover, roll-change, fade-change, underline-link, rolling-digits, sidebar-icon" | STALE | **U1**: also `--ui-shape-morph-*`, `--ui-reveal-change-*`, `--ui-chat-*` → U1-F15 | U1 | U1-F15, ~U14-F6 |
| C-CB-171 | .agents/skills/dooph-ds-codebase/SKILL.md:464-472 | roll-change token set (two durations, two eases, depth em, blur px, mid-blur derived) | TRUE | **U1**: tokens.css:245-250; index.css:970 | U1 | — |
| C-CB-172 | .agents/skills/dooph-ds-codebase/SKILL.md:473-477 | `getSpinnerGeometry` returns `cssSize` beside `diameter`; SVGs apply `cssSize` as CSS width/height, `diameter` stays in viewBox | TRUE | **U9**: SG.ts:134-137; LS.tsx:190-194; PI.tsx:133-137 · **U1**: spinnerGeometry.ts:36-39,136; LoadingSpinner.tsx:194,256-257 | U1, U9 | — |
| C-CB-173 | .agents/skills/dooph-ds-codebase/SKILL.md:476-477 | applying it as an ATTRIBUTE would silently do nothing | TRUE | **U9** [TRUE (for width/height)]: svg length attributes; note stroke/fill presentation attributes DO resolve `var()` in Chromium (F19 item 6) | U9 | U9-F19 |
| C-CB-174 | .agents/skills/dooph-ds-codebase/SKILL.md:481-488 | rolling-digits token set incl. decimals-size/-rise/-gap in em; renamed from rolling-money | TRUE | **U1**: tokens.css:323-333; no `rolling-money` in tokens.css | U1 | — |
| C-CB-175 | .agents/skills/dooph-ds-codebase/SKILL.md:489-490 | sidebar-icon: duration, hover-duration, ease | TRUE | **U1**: tokens.css:345-347 | U1 | — |
| C-CB-176 | .agents/skills/dooph-ds-codebase/SKILL.md:491-497 | mono tokens; weight/font-var/tracking-mono EXCLUDED; font-mono/text-mono map to `--font-mono`/`--text-mono`; `Tracking.mono` | TRUE | **U1**: tokens.css:388-445; sync-theme.mjs:65,73,81; index.css:155,160; Text/constants.ts:71 | U1 | — |
| C-CB-177 | .agents/skills/dooph-ds-codebase/SKILL.md:492 | mono aliases "the button role" vs "`--ui-text-body` and `--ui-weight-button`" [also: .agents/skills/dooph-ds-architecture/SKILL.md:252] | TRUE | **U1** [TRUE (both)]: `--ui-text-mono: var(--ui-text-body)` is the size text-style-button uses (index.css:227); arch is literal, codebase semantic | U1 | — |
| C-CB-178 | .agents/skills/dooph-ds-codebase/SKILL.md:498 | "The 5.4 pass realigned nearly every name with Figma" | FALSE | **U1** [UNVERIFIABLE]: committed Figma exports predate 5.4 and carry the old names → U1-F13 · **HD** (policy): P-5.4 → FALSE (label: "the 5.4 pass" is unreleased); the Figma-realignment half stays UNVERIFIABLE (committed Figma exports predate it, U1-F13). | U1 | U1-F13, ≈U14-F4 |
| C-CB-179 | .agents/skills/dooph-ds-codebase/SKILL.md:499 | danger raw pair + 10-token button family, all aliases, no `.dark` | TRUE | **U1**: tokens.css:68-85 | U1 | — |
| C-CB-180 | .agents/skills/dooph-ds-codebase/SKILL.md:500 | prominent button family fully mode-invariant; glowColor1/2 default `var(--ui-prominent-color-alt)` | TRUE | **U1**: tokens.css:53-64; OutlineButton.tsx:133 | U1 | — |
| C-CB-181 | .agents/skills/dooph-ds-codebase/SKILL.md:500 | identity is a "pair" whose "alt *does* differ per mode" | FALSE | **U1**: trio, all mode-invariant (tokens.css:148-154) → U1-F15 | U1 | U1-F15 |
| C-CB-182 | .agents/skills/dooph-ds-codebase/SKILL.md:501-503 | border/surface/input/focus-ring token names | TRUE | **U1**: tokens.css:94-96, 124-131, 144-146 | U1 | — |
| C-CB-183 | .agents/skills/dooph-ds-codebase/SKILL.md:504 | radius tight/normal/soft/mini (10px, `rounded-mini`) | TRUE | **U1**: tokens.css:536-540; index.css:176 | U1 | — |
| C-CB-184 | .agents/skills/dooph-ds-codebase/SKILL.md:505 | slider sizing tokens, `--ui-height-button-micro`, shimmer tokens exist | TRUE | **U1**: tokens.css:475-482, 166-171 | U1 | — |
| C-CB-185 | .agents/skills/dooph-ds-codebase/SKILL.md:511-515 | `--color-primary`→`bg-primary` etc.; `--font-*`, `--shadow-button`, `--radius-tight` | TRUE | **U1**: index.css:76, 149-155, 183, 175 | U1 | — |
| C-CB-186 | .agents/skills/dooph-ds-codebase/SKILL.md:517 | generated block managed by sync-theme.mjs | TRUE | **U1**: sync-theme.mjs:253-272 | U1 | — |
| C-CB-187 | .agents/skills/dooph-ds-codebase/SKILL.md:521 | theme.css generated from the same entries as the index.css block | TRUE | **U1**: sync-theme.mjs:301 reuses `generated`; theme.css:19-154 = index.css:74-209 | U1 | — |
| C-CB-188 | .agents/skills/dooph-ds-codebase/SKILL.md:525-529 | `@layer utilities`; disabled-state/radix-data-disabled/disabled-control declarations | TRUE | **U1**: dooph-component-tokens.css:11-33 | U1 | — |
| C-CB-189 | .agents/skills/dooph-ds-codebase/SKILL.md:530 | `ds-shape-button-focus-visible` custom outline | TRUE | **U1**: dooph-component-tokens.css:35-38 | U1 | — |
| C-CB-190 | .agents/skills/dooph-ds-codebase/SKILL.md:531 | focus helper list (…, `ds-focus-ring`) | STALE | **U1**: `ds-focus-ring` unused (U1-F9); list omits `ds-focus-within-ring-danger`, `ds-focus-ring-on-open` (:81, :106) | U1 | U1-F9, ~U1-F15 |
| C-CB-191 | .agents/skills/dooph-ds-codebase/SKILL.md:532-533 | `ds-radix-origin-*` / `ds-radix-dropdown-match-trigger-width` helpers; match-trigger-width only widens, applied when `matchTriggerWidth` | TRUE | **U5**: dooph-component-tokens.css:201-203; DM:167 · **U1**: dooph-component-tokens.css:192-203 | U1, U5 | — |
| C-CB-192 | .agents/skills/dooph-ds-codebase/SKILL.md:534-535 | `ds-min-w-menu` (160px) held by items, not panel/Section; `ds-min-w-menu-complex` (324px) applied directly to a wide Section | TRUE | **U5**: DM:200, 394, 160-172 · **U1**: dooph-component-tokens.css:206-213; tokens.css:562-563 · **U5** [TRUE (value); advice competes with arch:159 `width` (F9)]: dooph-component-tokens.css:211-213 | U1, U5 | U5-F9 |
| C-CB-193 | .agents/skills/dooph-ds-codebase/SKILL.md:536 | `ds-radius-mini-outset-xxs` = mini + xxs (14px), used by SegmentedTabSelect shell | TRUE | **U1**: dooph-component-tokens.css:318-320 (10+4); SegmentedTabSelect.tsx:68 · **U6**: dooph-component-tokens.css:318-320; tokens.css:514, 538; SegmentedTabSelect.tsx:68 | U1, U6 | — |
| C-CB-194 | .agents/skills/dooph-ds-codebase/SKILL.md:537 | `ds-opacity-disabled` | TRUE | **U1**: dooph-component-tokens.css:324-326 | U1 | — |
| C-CB-195 | .agents/skills/dooph-ds-codebase/SKILL.md:538-539 | toast helpers `ds-toast-viewport`/`-width-simple`/`-width-complex` and tooltip helpers `ds-tooltip-inverse-theme`/`-matching-theme`/`ds-width-tooltip-rich`/`ds-min-w-tooltip-complex` | TRUE | **U1**: dooph-component-tokens.css:260-295 · **U8**: dooph-component-tokens.css:260-273 · **U8**: dooph-component-tokens.css:277-295 | U1, U8 | — |
| C-CB-196 | .agents/skills/dooph-ds-codebase/SKILL.md:540 | spacing helper list (12 names) | TRUE | **U1**: dooph-component-tokens.css:255-361 (`ds-my-ui-xs` unused → U1-F9) | U1 | U1-F9 |
| C-CB-197 | .agents/skills/dooph-ds-codebase/SKILL.md:541 | `selected:`/`unselected:` @custom-variants in index.css back `Toggle/toggleOption.ts` | TRUE | **U1**: index.css:12-13; toggleOption.ts:33 · **U6**: index.css:12-13; toggleOption.ts:33-43 | U1, U6 | — |
| C-CB-198 | .agents/skills/dooph-ds-codebase/SKILL.md:542 | ds-slider-fill = 45% of --ds-slider-color | STALE | **U6**: dooph-component-tokens.css:117-124 uses --ds-slider-track-opacity (U6-F17) · **U1** [FALSE]: dooph-component-tokens.css:117-124 (token opacity) → U1-F15; codebase:281 contradicts it · **HD** (conflict): U1 FALSE vs U6 STALE. `git show v5.3.0:src/styles/dooph-component-tokens.css` :111-117 → `var(--ds-slider-color, …) 45%`; HEAD :117-124 uses `--ds-slider-track-opacity` per-variant tokens → was true at v5.3.0 → STALE (the skill's own CB:279-281 already says "no longer 45%"). | U1, U6 | U6-F17, U1-F15 |
| C-CB-199 | .agents/skills/dooph-ds-codebase/SKILL.md:542 | `.ds-slider-dot` inactive = `--ui-color-secondary-border` | TRUE | **U6**: via --ui-color-slider-step-inactive (tokens.css:509; css:145) · **U1** [TRUE / FALSE]: inactive via `--ui-color-slider-step-inactive` (tokens.css:509) TRUE; active is `--ui-color-slider-step-*-active` (rgba(22,22,22,.5) light primary) FALSE · **HD** (split): U1:525 graded inactive+active together (TRUE/FALSE); inactive half: `--ui-color-slider-step-inactive` → `var(--ui-color-secondary-border)` (tokens.css:509) → TRUE. | U1, U6 | — |
| C-CB-200 | .agents/skills/dooph-ds-codebase/SKILL.md:542 | `.ds-slider-dot[data-active]` = `--ui-color-text` at 40% | STALE | **U6**: css:154-158 → --ds-slider-step-active / --ui-color-slider-step-*-active (tokens.css:507-508) · **U1** [TRUE / FALSE]: inactive via `--ui-color-slider-step-inactive` (tokens.css:509) TRUE; active is `--ui-color-slider-step-*-active` (rgba(22,22,22,.5) light primary) FALSE · **HD** (conflict): U1 FALSE vs U6 STALE. v5.3.0 dooph-component-tokens.css:141-143 `color-mix(in srgb, var(--ui-color-text) 40%, transparent)`; HEAD :154-158 `--ds-slider-step-active`/`--ui-color-slider-step-primary-active` → STALE. | U1, U6 | ~U1-F15, ~U6-F17 |
| C-CB-201 | .agents/skills/dooph-ds-codebase/SKILL.md:542 | dot active/inactive split is a plain attribute selector (not `data-[active]:`); `ds-slider-glide` + `ds-slider-part` share one settle transition | TRUE | **U6**: css:154, 166-167 · **U1**: dooph-component-tokens.css:154 · **U1**: dooph-component-tokens.css:166-171 (hardcoded → U1-F6) | U1, U6 | U1-F6 |
| C-CB-202 | .agents/skills/dooph-ds-codebase/SKILL.md:543 | copy-icon helpers, skipped under reduced motion | TRUE | **U1**: dooph-component-tokens.css:368-394 | U1 | — |
| C-CB-203 | .agents/skills/dooph-ds-codebase/SKILL.md:547 | "one per `TextVariant` (eight)" with 8 classes listed | FALSE | **U3**: constants.ts:17-28 (10); index.css:249,259 (U3-F10) · **U1**: ten (Text/constants.ts:17-28; index.css:249,259) → U1-F15 | U1, U3 | U3-F10, U1-F15 |
| C-CB-204 | .agents/skills/dooph-ds-codebase/SKILL.md:547 | "Components apply these directly" | TRUE | **U3**: 22 component files use `text-style-*` | U3 | — |
| C-CB-205 | .agents/skills/dooph-ds-codebase/SKILL.md:549 | `TEXT_VARIANT_CLASS` and `ROLE_AXIS_TOKEN` exist; role without token emits axes standalone | TRUE | **U1**: Text/constants.ts:109-133 | U1 | — |
| C-CB-206 | .agents/skills/dooph-ds-codebase/SKILL.md:549 | "Adding a role means four edits in step" | STALE | **U3** [STALE (incomplete)]: U3-F10 | U3 | U3-F10 |
| C-CB-207 | .agents/skills/dooph-ds-codebase/SKILL.md:551 | text-style-* in `@layer components` | TRUE | **U1**: index.css:223 · **U3**: index.css:223 | U1, U3 | — |
| C-CB-208 | .agents/skills/dooph-ds-codebase/SKILL.md:553 | no role sets line-height | TRUE | **U1**: index.css:224-318 · **U3**: index.css:224-318 | U1, U3 | — |
| C-CB-209 | .agents/skills/dooph-ds-codebase/SKILL.md:555 | props inline; class-based `ds-font-weight-*` deleted | TRUE | **U3**: `grep -rn ds-font-weight src` → 0 | U3 | — |
| C-CB-210 | .agents/skills/dooph-ds-codebase/SKILL.md:557 | keyframe → component mapping incl. `ds-spinner-rotate` backs the spokes spinner | TRUE | **U1**: index.css:957-1028; LoadingSpinner.tsx:260 · **U3** [TRUE (but index.css:939-941 comment says "only referenced by WavySpinner"; out of unit, for the loading-indicators unit)]: LoadingSpinner.tsx:260 | U1, U3 | — |
| C-CB-211 | .agents/skills/dooph-ds-codebase/SKILL.md:557 | `ds-shimmer-text` in index.css; keyframe → wrapper mapping (roll-out/in, fade-change, underline-wipe, rolling-digits ×4) | TRUE | **U3**: index.css:369,949-1028 · **U1**: index.css:369-388, 949 | U1, U3 | — |
| C-CB-212 | .agents/skills/dooph-ds-codebase/SKILL.md:559-567 | ds-reveal-change: width transition between `--ds-reveal-change-width` and 0, tokens, 1ms under reduced motion | TRUE | **U1**: index.css:882-918 · **U3**: index.css:882-918; tokens.css:371-373 | U1, U3 | — |
| C-CB-213 | .agents/skills/dooph-ds-codebase/SKILL.md:569-571 | keyframes live outside `@layer` in index.css | TRUE | **U1**: index.css:921-1045 · **U3**: index.css:919 closes layer; keyframes 921-1045 | U1, U3 | — |
| C-CB-214 | .agents/skills/dooph-ds-codebase/SKILL.md:573-577 | `.ds-sidebar-rail` in `@layer utilities`; `@property --ds-sidebar-rail-s`/`-h` registered near the top of index.css beside `--progress-pct` | TRUE | **U1**: index.css:765-771, 17-46 · **U10**: index.css:322 opens `@layer utilities {`, rule at :765, layer closes :919 · **U10**: index.css:17-21 (progress-pct), :37-46 | U1, U10 | — |
| C-CB-215 | .agents/skills/dooph-ds-codebase/SKILL.md:581 | h-button/-sm, size-button/-sm; size-button-micro backs `ButtonSize.iconMicro`; h-slider-track; h-tab-micro/size-tab-micro (28px) back micro/icon-micro; min-h-button backs menu items | TRUE | **U1**: index.css:324-365; Button.tsx:89; toggleOption.ts:54,62; tokens.css:477; Menu/DropdownMenu.tsx:197 | U1 | — |
| C-CB-216 | .agents/skills/dooph-ds-codebase/SKILL.md:588-592 | build = icons → sync-tokens → tsup | STALE | **U14** [STALE (omits generate-shape-morph-ease, add-use-client)]: package.json "build"; tsup.config.ts:55-56 · **U2** [FALSE] (cited :588-591): package.json:50 includes generate-shape-morph-ease; tsup.config.ts:55 add-use-client (U2-F11) · **HD** (conflict): U2 FALSE vs U14 STALE. The pipeline block was written in 21d2236 (2026-06-11, `git log -S`); add-use-client joined onSuccess in ebb0b52 (2026-06-24) and generate-shape-morph-ease joined `build` in 5036a8f (2026-09-29) → accurate when written → STALE. | U2, U14 | U2-F11 |
| C-CB-217 | .agents/skills/dooph-ds-codebase/SKILL.md:594 | build:css standalone → styles.css then copy-theme | TRUE | **U2** (cited :593): package.json:48-49 | U2 | — |
| C-CB-218 | .agents/skills/dooph-ds-codebase/SKILL.md:595 | storybook dev server port 6006 | TRUE | **U2** (cited :594): package.json:52 | U2 | — |
| C-CB-219 | .agents/skills/dooph-ds-codebase/SKILL.md:596 | lint = `tsc --noEmit`, no eslint | TRUE | **U14**: package.json lint · **U2** (cited :595): package.json:54 | U2, U14 | — |
| C-CB-220 | .agents/skills/dooph-ds-codebase/SKILL.md:599 | CSS assets emitted together by onSuccess; build does not call build:css | TRUE | **U14**: tsup.config.ts:55-58; package.json build · **U2** (cited :597-598): tsup.config.ts:12-23,56; package.json:50 | U2, U14 | — |
| C-CB-221 | .agents/skills/dooph-ds-codebase/SKILL.md:605-606 | src/index.ts is the single public surface | TRUE | **U14**: package.json exports `.` → dist/index · **U2** (cited :602-603): package.json:20-28 | U2, U14 | — |
| C-CB-222 | .agents/skills/dooph-ds-codebase/SKILL.md:612-613 | the two grep commands read the surface | TRUE | **U14**: 48 lines / 197 `export {…}` blocks | U14 | — |
| C-CB-223 | .agents/skills/dooph-ds-codebase/SKILL.md:618 | Components + *Props come from the component's index.ts | FALSE | **U14** [FALSE for WavyDivider/LoadingSpinner/ProgressIndicator (no index.ts)]: src/index.ts:37-43; U14-F7 · **U2** (cited :619): WavyDivider/LoadingSpinner/ProgressIndicator have no index.ts; src/index.ts:37-43 (U2-F14) | U2, U14 | U14-F7, U2-F14, ~U2-F11 |
| C-CB-224 | .agents/skills/dooph-ds-codebase/SKILL.md:623-624 | only useState/useEffect/useRef (+ browser APIs/timers/rAF) require the directive | FALSE | **U2** [FALSE (incomplete)] (cited :623-626): createContext/useContext/useLayoutEffect also absent from react-server; used by AIPromptInput, DropdownMenu, Toast, Toggle, SegmentedTabSelect, MorphRotationShape · **U7** [FALSE (incomplete)] (cited :622-623): four hook-free files need it for handler closures (U7-F15) | U2, U7 | U7-F15 |
| C-CB-225 | .agents/skills/dooph-ds-codebase/SKILL.md:627-629 | directive after a doc comment "is still a valid directive prologue" | FALSE | **U2** [TRUE for JS; FALSE for this build] (cited :628-631): add-use-client.mjs:40 checks 5 lines only (U2-F1) | U2 | U2-F1, ~U6-F28 |
| C-CB-226 | .agents/skills/dooph-ds-codebase/SKILL.md:630-633 | client split: `LoadingSpinner`, `Calendar`, `DatePicker`, `Popover`, `VerificationCodeInput`, `CodeDigitInput`, `RollingDigitsText`, `RollChangeText`, `FadeChangeText`, `RevealChangeText`, `SidebarWithHoverIcon` are cli… | TRUE | **U2** [TRUE in source; 7 of 11 not stamped in dist] (cited :631-634): §2 table · **U7** (cited :630-631): Calendar.tsx:1, DatePicker.tsx:1, Popover.tsx:1 (Popover's is not forced by the skill's own rule: forwardRef only) · **U6** [TRUE as fact / unjustified] (cited :630-632): directive at :15 with only forwardRef (U6-F20) · **U10** [TRUE (source)] (cited :630-633): SidebarWithHoverIcon.tsx:40; not stamped in dist — repo-wide add-use-client finding (known, not re-derived) · **U9** (cited :630-634): LS.tsx:1; PI.tsx:1-3; WD.tsx:1-2 | U2, U6, U7, U9, U10 | U6-F20 |
| C-CB-227 | .agents/skills/dooph-ds-codebase/SKILL.md:633-635 | neutral: `ProgressIndicator` (useMemo), `WavyDivider` (useId), `Table` (no hooks), `CTAButton`, `ShimmerText`, `RollHoverText`, `UnderlineLinkText` | TRUE | **U2** (cited :634-636): client-scan.cjs: no directive, no client API · **U12** (cited :630-631): Table.tsx has no hooks and no directive · **U9** (cited :630-634): LS.tsx:1; PI.tsx:1-3; WD.tsx:1-2 | U2, U9, U12 | — |
| C-CB-228 | .agents/skills/dooph-ds-codebase/SKILL.md:635-636 | "`add-use-client.mjs` stamps dist chunks purely from source directives, so deleting the line … is the whole change" | FALSE | **U2** (cited :636-637): 16 source directives ignored (U2-F1) · **U6**: only first 5 lines scanned (add-use-client.mjs:40); Input/VerificationCodeInput chunks unstamped (U6-F28) · **U9**: only the first 5 lines are scanned (known repo-wide); MRS directive at l.54 → chunk-PWLXGSXJ unstamped (U9-F1) | U2, U6, U9 | U2-F1, U6-F28, U9-F1, ~U14-F6, ~U2-F11 |
| C-CB-229 | .agents/skills/dooph-ds-codebase/SKILL.md:638-640 | consts in sibling constants.ts with no directive | TRUE | **U2** (cited :639-641): no constants.ts has the directive; no constants chunk stamped (§2) · **U7** [TRUE for this unit] (cited :638-640): Calendar/constants.ts:1-2; DatePicker/Popover declare no consts | U2, U7 | — |
| C-CB-230 | .agents/skills/dooph-ds-codebase/SKILL.md:640-641 | "Every component with consts follows this, except `Avatar` and `BaseIcon`, which declare theirs inline in server-safe modules — equivalent" | FALSE | **U2** [FALSE (incomplete)] (cited :641-642): Shapes/index.ts:15 `export const Shapes = {` · **U10** (cited :638-641): Shapes/index.ts:15 is a third exception (U10-F12) · **U12** [TRUE as fact (Avatar.tsx and BaseIcon.tsx have no directive); "equivalent" disputed → U12-F14] (cited :637-641): grep -c '"use client"' BaseIcon.tsx → 0 · **HD** (conflict): U12 TRUE (checked only Avatar/BaseIcon) vs U2/U10 FALSE. `src/components/Shapes/index.ts:15 export const Shapes = {` and no Shapes/constants.ts (`ls`) → a third exception → FALSE. | U2, U10, U12 | U10-F12, U12-F14, ~U2-F11 |
| C-CB-231 | .agents/skills/dooph-ds-codebase/SKILL.md:645-646 | "tsup globs `src/**/*.{ts,tsx}`, so no build config change is needed" | TRUE | **U2** (cited :646-647): tsup.config.ts:33 | U2 | — |
| C-CB-232 | .agents/skills/dooph-ds-codebase/SKILL.md:653-656 | canonical skill list | STALE | **U14**: U14-F5 | U14 | U14-F5 |
| C-CB-233 | .agents/skills/dooph-ds-codebase/SKILL.md:660 | `core.symlinks = false` on this repo | TRUE | **U14**: `git config core.symlinks` → false | U14 | — |
| C-CB-234 | .agents/skills/dooph-ds-codebase/SKILL.md:661 | links materialise as "empty/real directories" | FALSE | **U14** [FALSE (plain text files)]: ../dooph-ds-audit-build/.claude/skills; U14-F5 | U14 | U14-F5 |
| C-CB-235 | .agents/skills/dooph-ds-codebase/SKILL.md:665 | `dir /AL` shows SYMLINKD/JUNCTION | TRUE | **U14** [TRUE (this checkout)]: cmd output | U14 | — |
| C-CB-236 | .agents/skills/dooph-ds-codebase/SKILL.md:676-677 | loading-indicators is a real copy, edits don't propagate | TRUE | **U14** [TRUE — and it has drifted]: U14-F1 | U14 | U14-F1 |

### ARCH — `.agents/skills/dooph-ds-architecture/SKILL.md` (35)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-ARCH-1 | .agents/skills/dooph-ds-architecture/SKILL.md:18-27 | ButtonVariant const shape | TRUE | **U14**: Button/constants.ts:8-16 · **U4** [TRUE (identical to constants.ts)]: constants.ts:8-16 | U4, U14 | — |
| C-ARCH-2 | .agents/skills/dooph-ds-architecture/SKILL.md:32 | `destructive`/`brand` exist nowhere as keys | FALSE | **U14** [TRUE in src; FALSE in the .claude loading-indicators copy and the fhc example]: U14-F1, U14-F2 | U14 | U14-F1, U14-F2, ~U14-F4 |
| C-ARCH-3 | .agents/skills/dooph-ds-architecture/SKILL.md:32,84 | renames happened "in 5.4" | FALSE | **U14** [STALE/FALSE as history (unreleased)]: U14-F4 | U14 | U14-F4, ~U14-F10, ~U2-F3, ~U3-F4, ~U6-F24, ~U6-F25 |
| C-ARCH-4 | .agents/skills/dooph-ds-architecture/SKILL.md:36-55 | naming table (arch:36-55): each listed const exists and maps to the stated prop (`ButtonVariant`→`variant`, `ButtonSize`→`size`, Tab/Toggle/Segmented variant+size, `ShapeButtons`→`shape`, `SheetSide`→`side`, …) | TRUE | **U14** [TRUE (all 20 present in src/components/*/constants.ts)]: const listing · **U4**: Button.tsx:110 (VariantProps), constants.ts · **U6**: Tabs/constants.ts; Toggle/constants.ts; SegmentedTabSelect/constants.ts; props at Tabs.tsx:41, Toggle.tsx:53-54, SegmentedTabSelect.tsx:32-33 · **U4**: ShapeButton.tsx:43-47 · **U8**: Sheet/constants.ts:8-14; Sheet.tsx:123,132 | U4, U6, U8, U14 | — |
| C-ARCH-5 | .agents/skills/dooph-ds-architecture/SKILL.md:50 | InputVariant row: icon variants require icon — union + runtime throw | TRUE | **U6** [TRUE (union weaker than stated, U6-F23)]: Input.tsx:51-60, 99-103 | U6 | U6-F23 |
| C-ARCH-6 | .agents/skills/dooph-ds-architecture/SKILL.md:52 | CheckboxChecked → prop `checked` | TRUE | **U6** [TRUE (conflicts with R1.11 list, U6-F25)]: Checkbox/constants.ts:4-10 | U6 | U6-F25 |
| C-ARCH-7 | .agents/skills/dooph-ds-architecture/SKILL.md:53 | `<CopyButton variant={CopyButtonVariant.secondary} value="npm install" />` | TRUE | **U4** [TRUE (type-checks; probe P3 analogous)]: CopyButton.tsx:18-27 | U4 | — |
| C-ARCH-8 | .agents/skills/dooph-ds-architecture/SKILL.md:65-69 | open-value example `FontWeights` / `FontWeightValue = FontWeight \| (string & {}) \| number` | TRUE | **U3** [TRUE vs code; contradicts arch:120]: constants.ts:58-64,143 (U3-F4) | U3 | U3-F4 |
| C-ARCH-9 | .agents/skills/dooph-ds-architecture/SKILL.md:72-75 | var-string resolution no-op; numbers per property | TRUE | **U3**: textStyle.ts:26-31,92-96 | U3 | — |
| C-ARCH-10 | .agents/skills/dooph-ds-architecture/SKILL.md:77-78 | open-value `color` used by Slider*, LinearProgressIndicator | STALE | **U14** [STALE (+Sticker, AIModelSelect)]: U14-F7 | U14 | U14-F7, ~U2-F3 |
| C-ARCH-11 | .agents/skills/dooph-ds-architecture/SKILL.md:77-78 | open-value used by Fonts/FontSizes/FontWeights/Tracking | TRUE | **U3**: constants.ts:139-147 | U3 | — |
| C-ARCH-12 | .agents/skills/dooph-ds-architecture/SKILL.md:88-100 | SliderVariant picks three non-derivable paints; variant selects bundle, color/stepColor override | TRUE | **U6**: Slider.tsx:56-80, 333-338 | U6 | — |
| C-ARCH-13 | .agents/skills/dooph-ds-architecture/SKILL.md:101-107 | custom has no defaults; discriminated union + unconditional throw; "the union is the real guard" | FALSE | **U6** [TRUE / "real guard" FALSE for `color=""`]: Slider.tsx:38-43, 288-294; U6-F23 | U6 | U6-F23, ~U7-F1 |
| C-ARCH-14 | .agents/skills/dooph-ds-architecture/SKILL.md:101-107 | "`SliderVariant.custom` … enforced by making the props a discriminated union (`CalendarProps` is the other example). Pair it with an unconditional `throw` …, as `ProgressIndicator` does" | FALSE | **U7** [FALSE for Calendar]: Calendar warns via `console.warn` in dev only (Calendar.tsx:61-122) and has no `throw`; `CalendarProps` is keyed on `mode`, not a no-defaults bundle member (U7-F1) · **U14** [TRUE, incomplete (StickerVariant.custom + throw: Sticker.tsx:104-107)]: - · **HD** (conflict): U14 TRUE ("examples exist") vs U7 FALSE. `grep -n throw src/components/Calendar/Calendar.tsx` → none; CalendarProps discriminates on `mode`, not a no-defaults bundle member, and Calendar only `console.warn`s in dev (Calendar.tsx:61-122). As an example of the union+throw pairing the sentence describes, it is FALSE; the list is also incomplete (StickerVariant.custom + throw, Sticker.tsx:104-107). | U7, U14 | U7-F1 |
| C-ARCH-15 | .agents/skills/dooph-ds-architecture/SKILL.md:158 | root defaults `modal={false}` | TRUE | **U5**: DM:55 | U5 | — |
| C-ARCH-16 | .agents/skills/dooph-ds-architecture/SKILL.md:159 | width model; `matchTriggerWidth` default true, widen-only; false → no panel min-width | TRUE | **U5**: DM:112, 167 | U5 | — |
| C-ARCH-17 | .agents/skills/dooph-ds-architecture/SKILL.md:160 | selectType via context + `data-select-type`; multi keep-open onSelect-then-preventDefault | TRUE | **U5**: DM:302-307 | U5 | — |
| C-ARCH-18 | .agents/skills/dooph-ds-architecture/SKILL.md:161 | MultiSelectItem Checkbox inert (`pointer-events-none`, `tabIndex={-1}`, `aria-hidden`) | TRUE | **U5**: DM:322-324 | U5 | — |
| C-ARCH-19 | .agents/skills/dooph-ds-architecture/SKILL.md:162 | Section `ds-px-ui-xs`; Content no horizontal padding | TRUE | **U5**: DM:394, 161-162 | U5 | — |
| C-ARCH-20 | .agents/skills/dooph-ds-architecture/SKILL.md:163 | Typeable: div root; pre-focus before Radix; suppress when open for input clicks; chrome clicks when open call Radix; `focusOnOpen={false}`; data-state/focus-within styling; no `open` prop | TRUE | **U5**: DT:190, 210-231, 201-206 | U5 | — |
| C-ARCH-21 | .agents/skills/dooph-ds-architecture/SKILL.md:193 | Modal.tsx / DropdownMenu.tsx exist as patterns | TRUE | **U14**: src/components/Modal, Menu · **U8** [TRUE for ref/props/cn/displayName; misleading as a portal exemplar]: Modal.tsx:20-37 matches Rule 2 shape; lacks portal hatch — U8-F4 | U8, U14 | U8-F4 |
| C-ARCH-22 | .agents/skills/dooph-ds-architecture/SKILL.md:221 | asChild via Slot on Button, DropdownTrigger, TextDropdownTrigger, OutlineButton, ShapeButton | FALSE | **U4** [Button TRUE; OutlineButton/ShapeButton FALSE (throw); Dropdown/TextDropdown triggers UNVERIFIABLE here (other unit); list is STALE — omits CTAButton, which does support it]: aschild.cjs; U4-F1 · **U5**: U5-F1 | U4, U5 | U4-F1, U5-F1 |
| C-ARCH-23 | .agents/skills/dooph-ds-architecture/SKILL.md:225-228 | `<Button asChild variant={ButtonVariant.primary}><Link href="/settings">Settings</Link></Button>` | TRUE | **U4**: aschild.cjs `OK Button asChild <a>` | U4 | — |
| C-ARCH-24 | .agents/skills/dooph-ds-architecture/SKILL.md:234-235 | OutlineButton wraps children in `<span className="relative z-10 ...">` above blur orbs | TRUE | **U4**: OutlineButton.tsx:286-288 · **U14**: OutlineButton.tsx:286; DropdownMenu.tsx:268 | U4, U14 | — |
| C-ARCH-25 | .agents/skills/dooph-ds-architecture/SKILL.md:236 | Avatar is a composable display shell; no logo providers or asset URL props | TRUE | **U12**: Avatar.tsx:10-12 (only `size` added) | U12 | — |
| C-ARCH-26 | .agents/skills/dooph-ds-architecture/SKILL.md:247 | package loads no font files | TRUE | **U1**: no @font-face / font URLs in src (R4.6 grep exit 1) | U1 | — |
| C-ARCH-27 | .agents/skills/dooph-ds-architecture/SKILL.md:251 | seven per-role family tokens with the stated defaults; mono falls back to ui-monospace | TRUE | **U1**: tokens.css:379-390 · **U14**: tokens.css:379-390 · **U3**: tokens.css:379-390 | U1, U3, U14 | — |
| C-ARCH-28 | .agents/skills/dooph-ds-architecture/SKILL.md:252 | `--ui-text-mono`/`--ui-weight-mono` alias `--ui-text-body`/`--ui-weight-button` | TRUE | **U1**: tokens.css:406, 420 · **U14**: tokens.css:406, 420 · **U3**: tokens.css:406,420 | U1, U3, U14 | — |
| C-ARCH-29 | .agents/skills/dooph-ds-architecture/SKILL.md:253 | `--ui-font-var-button/body/heading/mono`; label/title/hero ship no token; axes append | TRUE | **U1**: tokens.css:429-436; Text/constants.ts:109-119 · **U14**: tokens.css:429-436 · **U3**: tokens.css:429-436; textStyle.ts:111-112 | U1, U3, U14 | — |
| C-ARCH-30 | .agents/skills/dooph-ds-architecture/SKILL.md:253 | "Roles whose faces implement no axes (label/title/hero)" | FALSE | **U3** [FALSE (wording)]: constants.ts:78-79 (Bricolage opsz/wght, Host Grotesk wght) (U3-F13) | U3 | U3-F13 |
| C-ARCH-31 | .agents/skills/dooph-ds-architecture/SKILL.md:254 | text-style-* in index.css `@layer components` | TRUE | **U1**: index.css:223 · **U3**: index.css:223 | U1, U3 | — |
| C-ARCH-32 | .agents/skills/dooph-ds-architecture/SKILL.md:258-262 | no leading token, no role sets line-height | TRUE | **U1**: tokens.css has no `--ui-leading*`; index.css:224-318 · **U3**: tokens.css:392-445; index.css:224-318 | U1, U3 | — |
| C-ARCH-33 | .agents/skills/dooph-ds-architecture/SKILL.md:275-276 | preview-head URL axes | TRUE | **U14**: .storybook/preview-head.html | U14 | — |
| C-ARCH-34 | .agents/skills/dooph-ds-architecture/SKILL.md:298 | inverse surfaces (TooltipContent) via semantic tokens + class switch, not theme state | TRUE | **U8**: tokens.css:115-120; Tooltip.tsx:19-22,66 | U8 | — |
| C-ARCH-35 | .agents/skills/dooph-ds-architecture/SKILL.md:317-321 | "Existing families: `--ui-roll-hover-*`, `--ui-roll-change-*`, `--ui-fade-change-*`, `--ui-underline-link-*`, `--ui-rolling-digits-*`, `--ui-sidebar-icon-*`, `--ui-shape-morph-*`" | STALE | **U1**: tokens.css also defines `--ui-reveal-change-*` (371-373) and `--ui-chat-*` motion (193-204); and six animated components have no family → U1-F6, U1-F15 · **U14** [STALE (omits reveal-change, chat)]: U14-F7 · **U10** [TRUE]: tokens.css:267-278, 345-347 (each has a duration and an ease) · **HD** (conflict): U1/U14 STALE vs U10 TRUE (U10 checked only that the listed families exist). tokens.css defines `--ui-reveal-change-*` and `--ui-chat-*` motion tokens (19 lines, `grep -c`) absent from the list → STALE. | U1, U10, U14 | U1-F6, U1-F15, U14-F7 |

### CONTRIB — `.agents/skills/dooph-ds-contribution/SKILL.md` (9)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-CONTRIB-1 | .agents/skills/dooph-ds-contribution/SKILL.md:16 | Figma tool is `mcp__Figma__get_design_context` | UNVERIFIABLE | **U14** [UNVERIFIABLE (name depends on the user's MCP server registration; no .mcp.json in repo; this session registers it under a UUID prefix)]: - · **HD** (unverifiable): Tool name depends on the MCP server registration; no .mcp.json in repo. In this session the Figma server is registered under a UUID prefix (`mcp__31b6d641-…__get_design_context`), so the literal name does not resolve here. | U14 | — |
| C-CONTRIB-2 | .agents/skills/dooph-ds-contribution/SKILL.md:17 | radius tokens `tight/standard/soft` | STALE | **U14**: U14-F8 | U14 | U14-F8 |
| C-CONTRIB-3 | .agents/skills/dooph-ds-contribution/SKILL.md:85-87 | lint = tsc --noEmit | TRUE | **U14**: package.json · **U2** [TRUE (scripts exist)]: package.json:50,52,54 | U2, U14 | — |
| C-CONTRIB-4 | .agents/skills/dooph-ds-contribution/SKILL.md:96,108 | sync-tokens updates index.css + theme.css; ALIASES/EXCLUDED | TRUE | **U14**: sync-theme.mjs:31-33, 43, 60 | U14 | — |
| C-CONTRIB-5 | .agents/skills/dooph-ds-contribution/SKILL.md:110 | `h-tab` utility example | FALSE | **U14** [FALSE (no such utility)]: U14-F7 | U14 | U14-F7 |
| C-CONTRIB-6 | .agents/skills/dooph-ds-contribution/SKILL.md:148-150 | button wdth 100 / GRAD 11; body GRAD 19; label Host Grotesk 12px | TRUE | **U14**: tokens.css:382, 393, 429-430 | U14 | — |
| C-CONTRIB-7 | .agents/skills/dooph-ds-contribution/SKILL.md:151 | title/hero 23px/36px | FALSE | **U14** [FALSE (40px/55px)]: tokens.css:409-410; U14-F8 | U14 | U14-F8 |
| C-CONTRIB-8 | .agents/skills/dooph-ds-contribution/SKILL.md:152 | mono at button size/weight | TRUE | **U14**: tokens.css:406, 420 | U14 | — |
| C-CONTRIB-9 | .agents/skills/dooph-ds-contribution/SKILL.md:164-165 | preview-head axis ranges | TRUE | **U14**: preview-head.html | U14 | — |

### LI — `.agents/skills/dooph-ds-loading-indicators/SKILL.md` (50)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-LI-1 | .agents/skills/dooph-ds-loading-indicators/SKILL.md:3 | description covers WavyDivider/LoadingSpinner/ProgressIndicator | STALE | **U14** [STALE (body covers MorphRotationShape/ShapeMorphSpinner/DropdownCaret)]: U14-F9 | U14 | U14-F9 |
| C-LI-2 | .agents/skills/dooph-ds-loading-indicators/SKILL.md:8 | "Four components form the M3E-inspired indicator family" | STALE | **U9**: LinearProgressIndicator (determinate, Storybook "Progress/…", src/index.ts:44) is never mentioned; WavyDivider is not an indicator | U9 | ~U14-F9 |
| C-LI-3 | .agents/skills/dooph-ds-loading-indicators/SKILL.md:8 | LoadingSpinner + ShapeMorphSpinner indeterminate (no `progress`); ProgressIndicator determinate, owns wave geometry | TRUE | **U9**: LS.tsx:40-49; SMS.tsx:38-45; PI.tsx:44-49; WG.ts | U9 | — |
| C-LI-4 | .agents/skills/dooph-ds-loading-indicators/SKILL.md:16 | WavyDivider `high\|low`; `variant`, `strokeWeight`, `className` + SVG spread | TRUE | **U9**: WD.tsx:36-41 | U9 | — |
| C-LI-5 | .agents/skills/dooph-ds-loading-indicators/SKILL.md:17 | LoadingSpinner `flat\|spokes`; `variant`, `color`, `size` + SVG spread | TRUE | **U9**: LS.tsx:40-49 | U9 | — |
| C-LI-6 | .agents/skills/dooph-ds-loading-indicators/SKILL.md:18 | ProgressIndicator `flat\|wavy`; `progress` (0-1), `variant`, `color`, `size` + SVG spread | TRUE | **U9**: PI.tsx:44-60 | U9 | — |
| C-LI-7 | .agents/skills/dooph-ds-loading-indicators/SKILL.md:19 | ShapeMorphSpinner `size`, `color`, `shapes`, `timing` + span spread | TRUE | **U9**: SMS.tsx:38-45 | U9 | — |
| C-LI-8 | .agents/skills/dooph-ds-loading-indicators/SKILL.md:21 | "All enums follow the dot-accessible pattern required by architecture Rule 1" | FALSE | **U9** [FALSE (partly)]: dot-accessible yes, but `ProgressIndicatorVariants`/`ProgressIndicatorVariant` breaks R1.9 (U9-F11) | U9 | U9-F11 |
| C-LI-9 | .agents/skills/dooph-ds-loading-indicators/SKILL.md:24-27 | enum keys: LoadingSpinnerVariant flat/spokes; LoadingSpinnerColor primary/prominent (+arbitrary); LoadingSpinnerSize sm/rg/md/xl = 16/22/32/40px; WavyDividerVariant high/low | TRUE | **U9**: LS constants.ts:4-34; SG.ts:28; tokens.css:455-458; WD constants.ts:4-9 · **U14** [TRUE (canonical); FALSE in .claude copy (`.brand`)]: LoadingSpinner/constants.ts:16-19; U14-F1 · **HD** (split): U14:672 graded canonical TRUE and .claude copy FALSE; this row is the canonical doc → TRUE (LoadingSpinner/constants.ts:16-19). | U9, U14 | U14-F1 |
| C-LI-10 | .agents/skills/dooph-ds-loading-indicators/SKILL.md:30-35 | every const in a sibling `constants.ts` with no "use client"; LoadingSpinner is the only client module of the three; ProgressIndicator (`useMemo`) and WavyDivider (`useId`) carry no directive | TRUE | **U14**: directive-line grep (LoadingSpinner.tsx yes; ProgressIndicator.tsx / WavyDivider.tsx no) · **U9**: LS/PI/WD constants.ts have no directive; `SHAPE_MORPH_SPINNER_SHAPES` sits in a neutral module (SMS.tsx) · **U9**: LS.tsx:1; PI.tsx:1-3; WD.tsx:1-2 | U9, U14 | — |
| C-LI-11 | .agents/skills/dooph-ds-loading-indicators/SKILL.md:35-37 | PI imports `LoadingSpinnerColor`/`LoadingSpinnerSize` from `LoadingSpinner/constants` — same objects | TRUE | **U9**: PI.tsx:17-20 | U9 | — |
| C-LI-12 | .agents/skills/dooph-ds-loading-indicators/SKILL.md:37-38 | const plural, type singular | TRUE | **U9**: PI constants.ts:8,18 (a defect: U9-F11) | U9 | U9-F11 |
| C-LI-13 | .agents/skills/dooph-ds-loading-indicators/SKILL.md:44-49 | size table (diameter, stroke 2/2.5/3/3) | TRUE | **U9**: SG.ts:28,43; tokens.css:455-458 | U9 | — |
| C-LI-14 | .agents/skills/dooph-ds-loading-indicators/SKILL.md:51 | values live in both places — "Keep them in sync" | STALE | **U9**: rendered size comes only from the token (U9-F6) | U9 | U9-F6, ~U14-F3 |
| C-LI-15 | .agents/skills/dooph-ds-loading-indicators/SKILL.md:51-53 | tokens.css alone has no effect on rendered size | FALSE | **U14**: U14-F3 · **U9**: LS.tsx:194, 256-257; PI.tsx:137, 229; SMS.tsx:65-66 (U9-F6) | U9, U14 | U14-F3, U9-F6 |
| C-LI-16 | .agents/skills/dooph-ds-loading-indicators/SKILL.md:55 | `getSpinnerGeometry(size)` computes everything; never hardcode px | TRUE | **U9**: LS.tsx:300; PI.tsx:298; no px literals in components | U9 | — |
| C-LI-17 | .agents/skills/dooph-ds-loading-indicators/SKILL.md:59-62 | trackRadius, indicatorRadius, circumference, gapLength formulas | TRUE | **U9**: SG.ts:120-125 | U9 | — |
| C-LI-18 | .agents/skills/dooph-ds-loading-indicators/SKILL.md:68 | two discrete arcs above 0; PI full smooth track at 0% | TRUE | **U9**: PI.tsx:113-121; WG.ts:140-142 | U9 | — |
| C-LI-19 | .agents/skills/dooph-ds-loading-indicators/SKILL.md:70 | gap = one stroke width via `gapLength = 2 × strokeWidth` | TRUE | **U9**: SG.ts:125 | U9 | — |
| C-LI-20 | .agents/skills/dooph-ds-loading-indicators/SKILL.md:77-78,86-90 | dash positioning `L + G − D`; track derivation | TRUE | **U9**: PI.tsx:117-120; WG.ts:144-154 | U9 | — |
| C-LI-21 | .agents/skills/dooph-ds-loading-indicators/SKILL.md:93 | PI special-cases track to a complete circle at 0% | TRUE | **U9**: PI.tsx:113-115; WG.ts:140-142 | U9 | — |
| C-LI-22 | .agents/skills/dooph-ds-loading-indicators/SKILL.md:94 | "At 100% progress: trackLength clamps to 0, track disappears" | FALSE | **U9** [FALSE (flat)]: flat renders a zero-length round-capped dash, which paints a dot (U9-F5); wavy omits the element (WG.ts:149) | U9 | U9-F5 |
| C-LI-23 | .agents/skills/dooph-ds-loading-indicators/SKILL.md:104-109 | wavelength 15, `max(5, round(2πr/15))`, inner 0.66, corner radii 0.35/0.4/0.5 | TRUE | **U9**: WG.ts:10-15, 169-173, 193-194 | U9 | — |
| C-LI-24 | .agents/skills/dooph-ds-loading-indicators/SKILL.md:110-114 | stable closed path, `pathLength={1}` + normalized dash; first cubic split so wave starts at 12 o'clock | TRUE | **U9**: PI.tsx:248-257; WG.ts:245-258; test.ts:18 `^M 24 2 C` passes | U9 | — |
| C-LI-25 | .agents/skills/dooph-ds-loading-indicators/SKILL.md:115-116 | remainder track is a separate smooth `<circle>` with round caps | TRUE | **U9**: PI.tsx:233-244 | U9 | — |
| C-LI-26 | .agents/skills/dooph-ds-loading-indicators/SKILL.md:122-130 | WavyDivider: pattern SVG, no state; `width="100%"`; `currentColor`; `strokeWeight` default 2; tiles 20/40, 12px band; AMPLITUDE 2.88 not a prop; 4/3 overshoot; `useId` | TRUE | **U9**: WD.tsx:14-31, 57-92; `.text-border` exists in dist-styles.css | U9 | — |
| C-LI-27 | .agents/skills/dooph-ds-loading-indicators/SKILL.md:138 | flat spinner: two `<path>`s, `d` set per frame via rAF + `setAttribute`; no `<circle>`, no dashoffset | TRUE | **U9**: LS.tsx:151-174, 197-211 | U9 | — |
| C-LI-28 | .agents/skills/dooph-ds-loading-indicators/SKILL.md:141 | `<circle>` seam artefact rationale | UNVERIFIABLE | **U9**: rendering claim; not reproduced · **HD** (unverifiable): Rendering rationale (why `<circle>` shows a seam); needs a render comparison of a removed implementation. | U9 | — |
| C-LI-29 | .agents/skills/dooph-ds-loading-indicators/SKILL.md:143-152 | `flatArcPath` body | TRUE | **U9**: LS.tsx:77-92 | U9 | — |
| C-LI-30 | .agents/skills/dooph-ds-loading-indicators/SKILL.md:157-171 | animation model (sweep easing, 2 revs/cycle, track sweep) | TRUE | **U9**: LS.tsx:131-174 (constant names prefixed `SPINNER_` in code) | U9 | — |
| C-LI-31 | .agents/skills/dooph-ds-loading-indicators/SKILL.md:174 | useEffect deps `[cx, cy, trackRadius, gapLength]` | TRUE | **U9**: LS.tsx:181 | U9 | — |
| C-LI-32 | .agents/skills/dooph-ds-loading-indicators/SKILL.md:176 | cleanup returns `cancelAnimationFrame(frameId)` | TRUE | **U9**: LS.tsx:180 | U9 | — |
| C-LI-33 | .agents/skills/dooph-ds-loading-indicators/SKILL.md:184 | flat indicator `[C, C]` dash, offset `C × (1 − progress)`; both circles carry `300ms cubic-bezier(0.4, 0, 0.2, 1)` | TRUE | **U9**: PI.tsx:107, 123-124, 151, 162-165 (the hardcoded value is U9-F4) | U9 | U9-F4 |
| C-LI-34 | .agents/skills/dooph-ds-loading-indicators/SKILL.md:186-190 | track computed in render with the stated formulas | TRUE | **U9**: PI.tsx:111-121 | U9 | — |
| C-LI-35 | .agents/skills/dooph-ds-loading-indicators/SKILL.md:192 | "At progress = 0 ... Track covers almost full circle" | STALE | **U9**: code draws a complete circle at 0 (PI.tsx:113-115), as li:93 itself says | U9 | UNCOVERED |
| C-LI-36 | .agents/skills/dooph-ds-loading-indicators/SKILL.md:193 | "At progress = 1 ... trackLength clamps to 0 → no track" | FALSE | **U9**: zero-length round-capped dash still paints (U9-F5) | U9 | U9-F5 |
| C-LI-37 | .agents/skills/dooph-ds-loading-indicators/SKILL.md:197-202 | wavy: memoized by (diameter, strokeWidth); `pathLength={1}`, `strokeDasharray="${progress} 1"`; `getWavyTrackGeometry` null at completion | TRUE | **U9**: PI.tsx:207-216, 247-257; WG.ts:149 | U9 | — |
| C-LI-38 | .agents/skills/dooph-ds-loading-indicators/SKILL.md:209-211 | primary/prominent → var tokens; arbitrary hex passes through | TRUE | **U9**: LS.tsx:28-36 | U9 | — |
| C-LI-39 | .agents/skills/dooph-ds-loading-indicators/SKILL.md:214 | track always `var(--ui-color-border-primary)` | TRUE | **U9**: LS.tsx:200; PI.tsx:145, 238 | U9 | — |
| C-LI-40 | .agents/skills/dooph-ds-loading-indicators/SKILL.md:220 | `ds-spinner-rotate` in index.css is the ONLY loading-indicator keyframe; used by spokes; `ds-spinner-arc` removed | STALE | **U9**: ShapeMorphSpinner (a family member per li:8) runs on `ds-shape-morph-clock`/`ds-shape-morph-spin` (index.css:921, 929); rest TRUE (index.css:943; no `ds-spinner-arc` anywhere) · **U1** [TRUE]: index.css:943; `rg ds-spinner-arc src` → none; LoadingSpinner.tsx:260 · **HD** (conflict): U1 TRUE vs U9 STALE. li:8 counts ShapeMorphSpinner in the family; it animates on `ds-shape-morph-clock`/`ds-shape-morph-spin` (index.css:798, 803, 921). v5.3.0 index.css has 0 "shape-morph" hits → the sentence was true before 5036a8f → STALE. | U1, U9 | UNCOVERED |
| C-LI-41 | .agents/skills/dooph-ds-loading-indicators/SKILL.md:222-228 | four spinner size tokens 16/22/32/40px, not in `@theme inline` | TRUE | **U1**: tokens.css:455-458; absent from index.css:74-209 · **U9**: tokens.css:455-458; `grep spinner src/styles/theme.css` → none | U1, U9 | — |
| C-LI-42 | .agents/skills/dooph-ds-loading-indicators/SKILL.md:252-254 | engine vendored MIT; "fixes go in `engine/svgPath.ts`" | TRUE | **U10**: THIRD_PARTY_NOTICES.md:69-79; the only deviation lives in svgPath.ts:15-19, 135-156 | U10 | — |
| C-LI-43 | .agents/skills/dooph-ds-loading-indicators/SKILL.md:255-258 | step transitioned with `--ui-shape-morph-ease`, GENERATED by generate-shape-morph-ease.mjs from shapeMorphSpring.mjs | TRUE | **U10**: index.css:792-793; tokens.css:266-269 markers; generate-shape-morph-ease.mjs:12-22; shapeMorphSpring.mjs:15-19, 71-89; baseline: build regenerates byte-identically · **U14**: scripts/; package.json "build" | U10, U14 | — |
| C-LI-44 | .agents/skills/dooph-ds-loading-indicators/SKILL.md:259-262 | modes: autoplay (clock animation, passive spin, rotation-safe fit, per-frame re-centre), controlled (forward-only, direct), embedded | TRUE | **U10**: index.css:797-805; geometry.ts:38-46, 68-73; MorphRotationShape.tsx:200-207 | U10 | — |
| C-LI-45 | .agents/skills/dooph-ds-loading-indicators/SKILL.md:263-267 | "at rest they match the static Shape exactly"; ~9% spill; 31px frame / `inset-[2.5px]` / 26px shape | UNVERIFIABLE | **U10** [UNVERIFIABLE / TRUE]: "exactly": see the MorphRotationShape.tsx:22-26 row. Spill budget 2.5/26 ≈ 9.6%, matches MorphRotationShape.stories.tsx:76, 84-88; svg is `overflow-visible` (tsx:350) · **HD** (unverifiable): Numbers TRUE (spill 2.5/26 ≈ 9.6%, 31px frame, `inset-[2.5px]`); "match the static Shape exactly" — same reason as MorphRotationShape.tsx:22-26. | U10 | — |
| C-LI-46 | .agents/skills/dooph-ds-loading-indicators/SKILL.md:272-276 | nudge variable names; "Targets may be fractional; never round them. `onStepComplete` fires only on whole stops." | TRUE | **U10**: index.css:791-795, 837; tsx:278-283, 291 | U10 | — |
| C-LI-47 | .agents/skills/dooph-ds-loading-indicators/SKILL.md:277-278 | DropdownCaret = embedded MorphRotationShape behind a chevron | TRUE | **U5**: DropdownCaret.tsx:53-59 | U5 | — |
| C-LI-48 | .agents/skills/dooph-ds-loading-indicators/SKILL.md:278-280 | reads host via CSS: open `[data-state]`, hover nudge, disabled `:disabled`/`[aria-disabled]`/`[data-disabled]` | TRUE | **U5**: index.css:835-859 | U5 | — |
| C-LI-49 | .agents/skills/dooph-ds-loading-indicators/SKILL.md:280-281 | frame = height-button − spacing-rg; host uses `ds-pl-ui-rg`, no right padding | TRUE | **U5**: index.css:820; DT:61, 195 (no `pr-*`) | U5 | — |
| C-LI-50 | .agents/skills/dooph-ds-loading-indicators/SKILL.md:282-283 | colours: open = input focus border, disabled = secondary disabled border | TRUE | **U5**: index.css:844 `var(--ui-color-input-border-focus)`, :853 `var(--ui-color-secondary-border-disabled)` | U5 | — |

### LIC — `.claude/skills/dooph-ds-loading-indicators/SKILL.md` (4)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-LIC-1 | .claude/skills/dooph-ds-loading-indicators/SKILL.md | li:53 / li:94 / li:192-193 / li:220 texts | FALSE | **U9** [FALSE/STALE as above]: identical text in the mirror | U9 | ≈U14-F1 |
| C-LIC-2 | .claude/skills/dooph-ds-loading-indicators/SKILL.md:25 | `LoadingSpinnerColor.primary / .brand` (the .claude copy; canonical says `.prominent`) | FALSE | **U9**: constants.ts:16-19 (`prominent`) · **U14** [TRUE (canonical); FALSE in .claude copy (`.brand`)]: LoadingSpinner/constants.ts:16-19; U14-F1 · **HD** (split): .claude copy half of U14:672 + U9 → FALSE (`LoadingSpinnerColor` has no `brand` key). | U9, U14 | U14-F1 |
| C-LIC-3 | .claude/skills/dooph-ds-loading-indicators/SKILL.md:30 | "ProgressIndicator imports `LoadingSpinnerVariant`, `LoadingSpinnerColor`, and `LoadingSpinnerSize`" | FALSE | **U9**: PI.tsx:17-20 imports Color and Size only | U9 | ~U14-F1 |
| C-LIC-4 | .claude/skills/dooph-ds-loading-indicators/SKILL.md:202 | `LoadingSpinnerColor.brand → var(--ui-color-brand)` | FALSE | **U9**: no `brand` key; no `--ui-color-brand` token at HEAD (baseline) | U9 | ~U14-F1 |

### VM — `.agents/skills/dooph-ds-writing-version-migrations/SKILL.md` (9)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-VM-1 | .agents/skills/dooph-ds-writing-version-migrations/SKILL.md:8-9 | skills/ copied into consuming projects by init-skills | TRUE | **U14**: bin/init.mjs:28, 127 | U14 | — |
| C-VM-2 | .agents/skills/dooph-ds-writing-version-migrations/SKILL.md:17,311 | `superpowers:writing-skills` exists | TRUE | **U14** [UNVERIFIABLE from repo (external plugin; present in this session)]: - · **HD** (unverifiable): `superpowers:writing-skills` is listed among this session's available skills (external plugin; not checkable from the repo alone). | U14 | — |
| C-VM-3 | .agents/skills/dooph-ds-writing-version-migrations/SKILL.md:44-46 | 5.4 renamed tokens in a minor | FALSE | **U14** [FALSE as history (unreleased)]: U14-F4 | U14 | U14-F4 |
| C-VM-4 | .agents/skills/dooph-ds-writing-version-migrations/SKILL.md:46,289-290 | v3/v5 skills carry "5.4 or later" notes | TRUE | **U14**: skills/dooph-design-system-v5-migration/SKILL.md:17, 49 | U14 | — |
| C-VM-5 | .agents/skills/dooph-ds-writing-version-migrations/SKILL.md:78-82 | tags v4.8.2 / v5.0.0 exist | TRUE | **U14**: `git tag` | U14 | — |
| C-VM-6 | .agents/skills/dooph-ds-writing-version-migrations/SKILL.md:126-127,136 | v3 and v5 skills exist; both carry metadata.short-description | TRUE | **U14**: skills/*/SKILL.md:5 | U14 | — |
| C-VM-7 | .agents/skills/dooph-ds-writing-version-migrations/SKILL.md:242,253-255,259,261-263 | v5 codemod: template; skip list + ext allowlist; node:fs only; header explains BarChartIcon | TRUE | **U14** [TRUE (skip list also has `.git`; imports node:fs + node:path)]: codemod.mjs:21-38 | U14 | — |
| C-VM-8 | .agents/skills/dooph-ds-writing-version-migrations/SKILL.md:301-304 | files covers skills; "`bin/init.mjs` copies the whole `skills/` directory — no registration step" | TRUE | **U2**: package.json:35-39; init.mjs:28,85,127 (readdirSync + recursive cp; no hardcoded list) · **U14**: package.json files; bin/init.mjs:127 | U2, U14 | — |
| C-VM-9 | .agents/skills/dooph-ds-writing-version-migrations/SKILL.md:306-307 | migration skills not mirrored into .claude/skills | TRUE | **U14**: `ls .claude/skills` | U14 | — |

### FHC — `.agents/skills/file-header-contracts/SKILL.md` (1)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-FHC-1 | .agents/skills/file-header-contracts/SKILL.md:24 | grep finds `## File contracts` in AGENTS.md | TRUE | **U14**: AGENTS.md:1 | U14 | — |

### FHC-SNIPPET — `.agents/skills/file-header-contracts/references/agents-md-snippet.md` (1)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-FHC-SNIPPET-1 | .agents/skills/file-header-contracts/references/agents-md-snippet.md:12-27,63-69 | snippet (+ optional lines) | TRUE | **U14** [TRUE — AGENTS.md:1-19 is exactly the snippet plus both optional additions]: AGENTS.md | U14 | — |

### FHC-EVAL — `.agents/skills/file-header-contracts/references/evaluation.md` (1)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-FHC-EVAL-1 | .agents/skills/file-header-contracts/references/evaluation.md | experiment results | UNVERIFIABLE | **U14** [UNVERIFIABLE (external runs)]: - · **HD** (unverifiable): Experiment results from runs outside the repo. | U14 | — |

### AGENTS — `AGENTS.md` (1)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-AGENTS-1 | AGENTS.md:3-4 | some source files open with `## behavior` / `## constraints` | TRUE | **U14**: e.g. Button.tsx:1-22 | U14 | — |

### USAGE — `skills/dooph-design-system-usage/SKILL.md` (63)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-USAGE-1 | skills/dooph-design-system-usage/SKILL.md:10 | React + Tailwind v4 package | TRUE | **U13**: package.json peer react >=19; tailwindcss 4.3.3 build (baseline) | U13 | — |
| C-USAGE-2 | skills/dooph-design-system-usage/SKILL.md:20,74 | `import { Button, ButtonVariant, ... }`; `<Button variant={ButtonVariant.primary} onClick={save}>` | TRUE | **U4**: dist-index.d.ts:1-2 | U4 | — |
| C-USAGE-3 | skills/dooph-design-system-usage/SKILL.md:21 | `import "@dooph-software/design-system/styles.css"` | TRUE | **U13**: package.json exports `./styles.css` | U13 | — |
| C-USAGE-4 | skills/dooph-design-system-usage/SKILL.md:26-28 | Text components `BodyText, LabelText, HeadingText, SubheadingText, TitleText, HeroText, ButtonText, MonoText` exist | TRUE | **U13** [TRUE (incomplete: 8 of 10)]: dist-exports.txt; → F15 | U13 | U13-F15 |
| C-USAGE-5 | skills/dooph-design-system-usage/SKILL.md:110-112 | `ButtonVariant` primary/secondary/prominent/danger/ghost/text; `ButtonSize` default/sm/icon/iconSm/iconMicro | TRUE | **U13**: exports-head.tsv keys · **U4**: constants.ts:8-24 | U4, U13 | — |
| C-USAGE-6 | skills/dooph-design-system-usage/SKILL.md:112 | `SplitButton` + `SplitButtonAction`, `SplitButtonTrigger` exported | TRUE | **U13**: dist-exports.txt · **U4**: dist-index.d.ts:129 | U4, U13 | — |
| C-USAGE-7 | skills/dooph-design-system-usage/SKILL.md:113 | `OutlineButton` `inverseTheme`, `glowing`, `glowColor1/2` | TRUE | **U13**: ex15 compiles · **U4** [TRUE (naming divergence U4-F13)]: OutlineButton.tsx:18-38 | U4, U13 | U4-F13 |
| C-USAGE-8 | skills/dooph-design-system-usage/SKILL.md:114-115 | `ShapeButtons` clover/cookie/diamond/puff/squircle; `ShapeButtonVariant` prominent/primary | TRUE | **U13**: exports-head.tsv · **U4**: ShapeButton/constants.ts | U4, U13 | — |
| C-USAGE-9 | skills/dooph-design-system-usage/SKILL.md:115-116 | `CopyButton` writes `value`, checkmark for 2s; `CopyButtonVariant` ghost/secondary | TRUE | **U13**: CopyButton.tsx:16 `const REVERT_MS = 2000;`; keys · **U4**: CopyButton.tsx:16,53-59,90-95 | U4, U13 | — |
| C-USAGE-10 | skills/dooph-design-system-usage/SKILL.md:117-119 | `CTAButtonVariant` primary/secondary; `CTAButtonSize` standard/big | TRUE | **U13** [TRUE (omits required `text`/`icon`)]: → F4 · **U4**: CTAButton.tsx:72,87,110; constants.ts | U4, U13 | U13-F4 |
| C-USAGE-11 | skills/dooph-design-system-usage/SKILL.md:120 | `ToggleSwitch` (+ `ToggleSwitchItem`) | TRUE | **U13**: ex15 · **U6**: as above (no consts named for Input/Checkbox/ToggleSwitch — U6-F24) | U6, U13 | U6-F24 |
| C-USAGE-12 | skills/dooph-design-system-usage/SKILL.md:121-126 | `SliderVariant` primary/prominent/custom; `color`,`stepColor`; custom REQUIRES color, compile error + runtime throw | TRUE | **U13** [TRUE (compile half verified)]: ex15 `@ts-expect-error` held; Slider/constants.ts comment · **U6**: as above (no consts named for Input/Checkbox/ToggleSwitch — U6-F24) | U6, U13 | U6-F24 |
| C-USAGE-13 | skills/dooph-design-system-usage/SKILL.md:127 | `SliderLabeled` `labels: {start,end}` | TRUE | **U13**: ex15 · **U6**: as above (no consts named for Input/Checkbox/ToggleSwitch — U6-F24) | U6, U13 | U6-F24 |
| C-USAGE-14 | skills/dooph-design-system-usage/SKILL.md:127-129 | `VerificationCodeInput` `length` default 6; `CodeDigitInput` single cell | TRUE | **U13** [TRUE (type) / UNVERIFIABLE (default)]: ex15 compiles · **U6**: as above (no consts named for Input/Checkbox/ToggleSwitch — U6-F24) · **HD** (unverifiable): U13 default half UNVERIFIABLE; VerificationCodeInput.tsx:50 `length = 6` (U6 same) → TRUE. | U6, U13 | U6-F24 |
| C-USAGE-15 | skills/dooph-design-system-usage/SKILL.md:130-133 | `DropdownMenu selectType` `DropdownMenuSelectType.single`(default)/`.multi` | TRUE | **U13**: Menu/constants.ts:17-20; ex15 · **U5** [TRUE but incomplete (F10)]: DM passim | U5, U13 | U5-F10 |
| C-USAGE-16 | skills/dooph-design-system-usage/SKILL.md:134-135 | `DropdownMenuMultiSelectItem` renamed from `DropdownMenuCheckboxItem` | TRUE | **U13**: DropdownMenu.tsx:277-278 · **U5** [TRUE vs HEAD; unreleased and absent from CHANGELOG (F8)]: git v5.3.0 | U5, U13 | U5-F8 |
| C-USAGE-17 | skills/dooph-design-system-usage/SKILL.md:135-140 | `DropdownMenuRadioSelectItem` inside `DropdownMenuRadioGroup`; `DropdownMenuPlainItem`; `DropdownMenuSection width`; `DropdownMenuSegment` | TRUE | **U13**: ex15; DropdownMenu.d.ts `width?: string \| number` · **U5** [TRUE but incomplete (F10)]: DM passim | U5, U13 | U5-F10 |
| C-USAGE-18 | skills/dooph-design-system-usage/SKILL.md:141 | `DropdownTrigger`, `DropdownTriggerContent`, `TypeableDropdownTrigger`, `TextDropdownTrigger` exported | TRUE | **U13**: dist-exports.txt · **U5** [TRUE (omits `TextDropdownSize`, F10)]: DropdownTrigger/index.ts | U5, U13 | U5-F10 |
| C-USAGE-19 | skills/dooph-design-system-usage/SKILL.md:142-143 | `Tabs` (+List/Trigger/Content), `SegmentedTabSelect` (+ `SegmentedTabItem`) | TRUE | **U13**: dist-exports.txt · **U6**: Tabs/index.ts:1; SegmentedTabSelect/index.ts:1 | U6, U13 | — |
| C-USAGE-20 | skills/dooph-design-system-usage/SKILL.md:144-150 | Modal/Sheet/Popover families as listed; `SheetSide.left/right/top/bottom` | TRUE | **U13**: exports-head.tsv · **U8** [TRUE but incomplete]: exports exist (dist-index.d.ts:140-150); `ModalPortal`, `SheetOverlay`, `SheetPortal`, `TooltipProvider` (required), `TooltipTypes` unnamed — U8-F9 · **U7**: Popover/index.ts:1-8 | U7, U8, U13 | U8-F9 |
| C-USAGE-21 | skills/dooph-design-system-usage/SKILL.md:151-153 | responsive swap is "app-side wrapper — intentionally not a packaged component" | TRUE | **U8**: rg `ResponsiveDialog` src → none | U8 | — |
| C-USAGE-22 | skills/dooph-design-system-usage/SKILL.md:154 | Layout/surfaces: `OutlineSection`, `Avatar`, `Sticker` | TRUE | **U12**: dist-index.d.ts:7-9, 130 | U12 | — |
| C-USAGE-23 | skills/dooph-design-system-usage/SKILL.md:155-157 | `StickerVariant` / `StickerSize` keys; `micro` is `--ui-height-tab-micro` | TRUE | **U12**: constants.ts:21-28, 38-41; index.css:350-351 · **U13**: keys; Sticker/constants.ts:15-18,37; ex15 | U12, U13 | — |
| C-USAGE-24 | skills/dooph-design-system-usage/SKILL.md:157-158 | "Children are the label — an icon and text, laid out in a row" | TRUE | **U12**: Sticker.tsx:131 | U12 | — |
| C-USAGE-25 | skills/dooph-design-system-usage/SKILL.md:158-159 | `custom` REQUIRES `color` (token name or any CSS color); wash at `--ui-sticker-bg-opacity` | TRUE | **U12**: utils/color.ts `DsColor = DsColorToken \| (string & {})`; Sticker.tsx:125 · **U13**: keys; Sticker/constants.ts:15-18,37; ex15 | U12, U13 | — |
| C-USAGE-26 | skills/dooph-design-system-usage/SKILL.md:159-160 | "Omitting `color` is a compile error, and the component throws at runtime" | TRUE | **U12**: tsc check line 2; Sticker.tsx:104-109 · **U13**: keys; Sticker/constants.ts:15-18,37; ex15 | U12, U13 | — |
| C-USAGE-27 | skills/dooph-design-system-usage/SKILL.md:161-163 | Table parts + sortable headers via `TableSortDirection` | TRUE | **U12**: dist-index.d.ts:145-146 · **U13**: exports-head.tsv | U12, U13 | — |
| C-USAGE-28 | skills/dooph-design-system-usage/SKILL.md:162-163 | use Table "before hand-rolling a grid of divs for tabular data" | TRUE | **U12** [TRUE as advice, but Table is itself an un-roled div grid]: → U12-F11 | U12 | U12-F11 |
| C-USAGE-29 | skills/dooph-design-system-usage/SKILL.md:164-166 | `DatePicker` (+ `DatePickerTrigger`, `DatePickerSplitTrigger`); `Calendar` (+ `CalendarGrid`, `CalendarCaption`, `CalendarPresetsPanel`, `CalendarPresetItem`) | TRUE | **U7**: Calendar/index.ts:1-11; DatePicker/index.ts:1-6. The five helper exports (U7-F2) and all prop names (U7-F5) are undocumented · **U13**: Calendar/constants.ts:89-129; ex15 | U7, U13 | U7-F2, U7-F5 |
| C-USAGE-30 | skills/dooph-design-system-usage/SKILL.md:167 | "`DatePickerMode`: `singleDay` / `dateRange`" | TRUE | **U7**: constants.ts:13-16 · **U13**: Calendar/constants.ts:89-129; ex15 | U7, U13 | — |
| C-USAGE-31 | skills/dooph-design-system-usage/SKILL.md:167-170 | `CalendarPresets` keys incl. `custom({ id, label, days })`; `DEFAULT_CALENDAR_PRESETS` and `DEFAULT_SPLIT_TRIGGER_PRESETS` "as the shipped sets" | TRUE | **U7**: constants.ts:89-132 · **U13**: Calendar/constants.ts:89-129; ex15 | U7, U13 | — |
| C-USAGE-32 | skills/dooph-design-system-usage/SKILL.md:171-173 | "A `DateRange` is `{ from: Date; to: Date }` — structural ... `to` is never null" | TRUE | **U7**: constants.ts:25-28 · **U13**: Calendar/constants.ts:89-129; ex15 | U7, U13 | — |
| C-USAGE-33 | skills/dooph-design-system-usage/SKILL.md:174-175 | `TextLink` `asChild` | TRUE | **U13**: ex15 | U13 | — |
| C-USAGE-34 | skills/dooph-design-system-usage/SKILL.md:176-178 | "the ten role components"; seven animating wrappers live under `AnimatedText` | TRUE | **U13**: TextVariant 10 keys; src/components/AnimatedText/ exists (index.ts:14) | U13 | — |
| C-USAGE-35 | skills/dooph-design-system-usage/SKILL.md:183 | `FadeChangeText` tuned via `--ui-fade-change-*` | TRUE | **U13**: tokens.css fade-change ×5 | U13 | — |
| C-USAGE-36 | skills/dooph-design-system-usage/SKILL.md:185-187 | `RevealChangeText` `changeKey` (nullable), `onSettled` | TRUE | **U13**: ex15 | U13 | — |
| C-USAGE-37 | skills/dooph-design-system-usage/SKILL.md:191 | `BaseIcon`, `ChevronDownIcon`, `SearchIcon`, `SidebarWithHoverIcon` exported | TRUE | **U13**: dist-exports.txt · **U10**: all exported (dist-index.d.ts). Observation: the consumer skill names no `*Shape` component, no `Shapes`/`<NAME>_SHAPE_PATH`, no `IconSize`, and 3 of 88 icons — not raised separately | U10, U13 | — |
| C-USAGE-38 | skills/dooph-design-system-usage/SKILL.md:198-199 | `smallDecimals` requires `smallDecimalsComponent` "which the types enforce" | TRUE | **U13**: ex15 `@ts-expect-error` held | U13 | — |
| C-USAGE-39 | skills/dooph-design-system-usage/SKILL.md:202-206 | `SidebarWithHoverIcon` `side` (`SidebarIconSide`), controlled `hovered` | TRUE | **U13**: ex15 · **U10**: SidebarWithHoverIcon.tsx:56-64; stories :43-62 | U10, U13 | — |
| C-USAGE-40 | skills/dooph-design-system-usage/SKILL.md:207 | "`Toast` family" | TRUE | **U8** [TRUE but incomplete]: `ToastProvider`/`useToast`/`ToastTypes` unnamed — U8-F9 | U8 | U8-F9 |
| C-USAGE-41 | skills/dooph-design-system-usage/SKILL.md:209 | `ShapeMorphSpinner` `size`, `color`, optional `shapes`, `timing` | TRUE | **U13** [TRUE (`size` is `LoadingSpinnerSize`, not number)]: ShapeMorphSpinner.d.ts:10-14 | U13 | — |
| C-USAGE-42 | skills/dooph-design-system-usage/SKILL.md:210 | MorphRotationShape required `mode` (three values); "leave ~9% of the shape per side for rotation spill" | TRUE | **U10**: tsx:94-120 (mode required in every union arm); header :26 · **U13** [TRUE but incomplete (`shapes` also required)]: ex16 (mode independently required); → F4 | U10, U13 | U13-F4 |
| C-USAGE-43 | skills/dooph-design-system-usage/SKILL.md:211 | DropdownCaret `variant` const; built into both triggers; custom trigger adds host class (1px border, h-button, right padding 0) | TRUE | **U5**: DropdownCaret.tsx:40; DT:74, 276; header :18-20 · **U13** [TRUE (class exists; geometry not checked)]: classes-head.txt; DropdownCaret/constants.ts | U5, U13 | — |
| C-USAGE-44 | skills/dooph-design-system-usage/SKILL.md:212 | `cn` exported | TRUE | **U13**: dist-exports.txt | U13 | — |
| C-USAGE-45 | skills/dooph-design-system-usage/SKILL.md:221-227 | colour utilities listed all generate via preset | TRUE | **U13**: check-names.cjs: 0 misses at usage:221-232 | U13 | — |
| C-USAGE-46 | skills/dooph-design-system-usage/SKILL.md:228-229 | spacing stems `xxxs xxs xs sm rg md lg xl xxl` | TRUE | **U13**: theme.css `--spacing-*` (10 keys incl. sticker-y) | U13 | — |
| C-USAGE-47 | skills/dooph-design-system-usage/SKILL.md:230-232 | radius + shadow utilities listed exist | TRUE | **U13**: check-names.cjs | U13 | — |
| C-USAGE-48 | skills/dooph-design-system-usage/SKILL.md:237-240 | ten roles listed | TRUE | **U13**: TextVariant keys | U13 | — |
| C-USAGE-49 | skills/dooph-design-system-usage/SKILL.md:242-245 | HeroBody/HeroButton = Body/Button at 16px; HeroText 55px | TRUE | **U13**: tokens.css:401-402 (16px), :410 `--ui-text-hero: 55px` | U13 | — |
| C-USAGE-50 | skills/dooph-design-system-usage/SKILL.md:247-248 | MonoText = Google Sans Code at button role's size and weight | TRUE | **U13**: tokens.css:388, :406 `--ui-text-mono: var(--ui-text-body)`, :420 `--ui-weight-mono: var(--ui-weight-button)` | U13 | — |
| C-USAGE-51 | skills/dooph-design-system-usage/SKILL.md:254-260 | typography example | FALSE | **U13** [FALSE as written (missing HeroText import)]: → F3 | U13 | U13-F3 |
| C-USAGE-52 | skills/dooph-design-system-usage/SKILL.md:262-272 | prop table (font/fontSize/fontWeight/lineHeight/letterSpacing/axes/tabular/unstyled/as) | TRUE | **U13** [TRUE (types)]: ex06b, ex15 compile | U13 | — |
| C-USAGE-53 | skills/dooph-design-system-usage/SKILL.md:287-289 | constants resolve to `var(--ui-*)` | TRUE | **U13**: Text/constants.ts FontSizes etc. | U13 | — |
| C-USAGE-54 | skills/dooph-design-system-usage/SKILL.md:291-294 | precedence prop > className > role; `style` outranks props | TRUE | **U13**: BaseText.tsx:89-92 (style spread last) | U13 | — |
| C-USAGE-55 | skills/dooph-design-system-usage/SKILL.md:320-322 | package `cn` registers a text-style group so `text-text` cannot erase the role class | FALSE | **U13** [FALSE for hero-body/hero-button]: → F6 | U13 | U13-F6 |
| C-USAGE-56 | skills/dooph-design-system-usage/SKILL.md:325-337 | replicated group snippet | FALSE | **U13** [compiles; FALSE as a complete group (6 of 10)]: ex08 PASS; → F6 | U13 | U13-F6, ~U2-F7 |
| C-USAGE-57 | skills/dooph-design-system-usage/SKILL.md:351-361 | SaveButton wrapper | TRUE | **U13**: ex09 PASS · **U4** [TRUE (compiles)]: tsc -p scratch/U4/tsconfig.json on probe.tsx P1 → no error | U4, U13 | — |
| C-USAGE-58 | skills/dooph-design-system-usage/SKILL.md:365-369 | `color` on Slider* takes a token name or raw CSS colour | TRUE | **U6**: utils/color.ts:44, 52-58 | U6 | — |
| C-USAGE-59 | skills/dooph-design-system-usage/SKILL.md:370-372 | `Modal` for every dialog; always include `ModalTitle` (`sr-only` if no visible title) | TRUE | **U8**: Modal.tsx:54-55 JSDoc; Radix Dialog requires Title | U8 | — |
| C-USAGE-60 | skills/dooph-design-system-usage/SKILL.md:373-375 | Typeable only under `DropdownMenuTrigger asChild` + `focusOnOpen={false}`; no `type` prop | TRUE | **U5**: DT:99-118 · **U13** [TRUE (focusOnOpen type)]: ex15 | U5, U13 | — |
| C-USAGE-61 | skills/dooph-design-system-usage/SKILL.md:376-377 | DropdownTriggerContent optional; triggers don't add it | TRUE | **U5**: DT:73 wraps children in a plain span | U5 | — |
| C-USAGE-62 | skills/dooph-design-system-usage/SKILL.md:378 | Radix-backed components (tooltip, modal) own a11y | TRUE | **U8**: Radix Dialog/Tooltip wrappers, no custom focus code | U8 | — |
| C-USAGE-63 | skills/dooph-design-system-usage/SKILL.md:380-382 | OutlineButton: both `glowColor1/2` default to `--ui-prominent-color-alt`; override per instance | TRUE | **U4**: OutlineButton.tsx:133-134 · **U13** [UNVERIFIABLE here (component unit)]: token exists · **HD** (unverifiable): U13 UNVERIFIABLE (component unit) vs U4 TRUE: OutlineButton.tsx:133-134 `glowColor1 ?? "var(--ui-prominent-color-alt)"` (same for 2) → TRUE. | U4, U13 | — |

### RSM — `skills/dooph-design-system-usage/references/responsive-sheet-modal.md` (8)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-RSM-1 | skills/dooph-design-system-usage/references/responsive-sheet-modal.md:7-8 | Modal and Sheet "both wrap the same Radix Dialog primitive, their parts map 1:1" | TRUE | **U8**: Modal.tsx:8,13-16; Sheet.tsx:3,15-18 | U8 | — |
| C-RSM-2 | skills/dooph-design-system-usage/references/responsive-sheet-modal.md:14 | same root props (`open`, `onOpenChange`, `modal`) | TRUE | **U8**: both roots = `DialogPrimitive.Root` · **U13**: ex15 `<Modal modal>`, `<Sheet modal>` compile | U8, U13 | — |
| C-RSM-3 | skills/dooph-design-system-usage/references/responsive-sheet-modal.md:15,17 | Trigger / Close "Both support `asChild`" | TRUE | **U8**: Radix Trigger/Close aliases · **U13**: ResponsiveDialog.tsx compiles | U8, U13 | — |
| C-RSM-4 | skills/dooph-design-system-usage/references/responsive-sheet-modal.md:16 | "Sheet adds `side` (`SheetSide.*`); both have `withOverlay`" | TRUE | **U8**: Modal.tsx:61; Sheet.tsx:123-126 · **U13**: ex15 compiles | U8, U13 | — |
| C-RSM-5 | skills/dooph-design-system-usage/references/responsive-sheet-modal.md:18-19 | Title "Required for a11y", Description "Optional" | TRUE | **U8**: Radix Dialog; (Radix still logs a dev warning when Description and `aria-describedby={undefined}` are both absent — not stated) | U8 | — |
| C-RSM-6 | skills/dooph-design-system-usage/references/responsive-sheet-modal.md:21-23 | focus, dismissal, portal behaviour identical; only geometry and animation differ | TRUE | **U8**: both always-portal; same Radix root | U8 | — |
| C-RSM-7 | skills/dooph-design-system-usage/references/responsive-sheet-modal.md:29-103 | breakpoint hook + `ResponsiveDialog` + usage example | TRUE | **U8** [TRUE (compiles)]: `npx tsc --noEmit -p docs/audit/_work/scratch/U8/tsconfig.json` → no errors on probe.tsx:1-62 (the example verbatim, against built dist d.ts); only the intentional negative probes at :64,:65,:68 error · **U13**: useIsDesktop.tsx, ResponsiveDialog.tsx, ex12 PASS | U8, U13 | — |
| C-RSM-8 | skills/dooph-design-system-usage/references/responsive-sheet-modal.md:109-111 | crossing the breakpoint while open unmounts one root and closes unless `open` is controlled | TRUE | **U8**: uncontrolled Radix root remounts with `defaultOpen` false | U8 | — |

### THEME — `skills/dooph-design-system-theming/SKILL.md` (20)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-THEME-1 | skills/dooph-design-system-theming/SKILL.md:16-17 | names below are the v3 contract | STALE | **U13**: → F15 | U13 | U13-F15 |
| C-THEME-2 | skills/dooph-design-system-theming/SKILL.md:25-28 | import order tailwindcss → styles.css → theme.css → app theme | TRUE | **U13**: theme.css header lines 6-11 | U13 | — |
| C-THEME-3 | skills/dooph-design-system-theming/SKILL.md:45-46 | preset registers every `--ui-*` token | FALSE | **U13** [FALSE (130 keys / 259 tokens)]: → F15 | U13 | U13-F15 |
| C-THEME-4 | skills/dooph-design-system-theming/SKILL.md:54-56 | one font token per role body/button/heading/label/title/hero/mono | TRUE | **U13**: tokens.css:379-392 | U13 | — |
| C-THEME-5 | skills/dooph-design-system-theming/SKILL.md:83-85 | Flex axes GRAD/ROND/opsz/slnt/wdth/wght; Code MONO | TRUE | **U13** [TRUE (consistent with FontAxes keys)]: exports-head.tsv FontAxes | U13 | — |
| C-THEME-6 | skills/dooph-design-system-theming/SKILL.md:117 | no leading token, no role sets line-height | TRUE | **U13** [TRUE (no `--ui-leading*` / `--ui-line-height*` in tokens.cjs output)]: tokens.cjs | U13 | — |
| C-THEME-7 | skills/dooph-design-system-theming/SKILL.md:125-129 | `.text-style-*` classes named exist | TRUE | **U13**: classes-head.txt | U13 | — |
| C-THEME-8 | skills/dooph-design-system-theming/SKILL.md:138-139 | light on `:root` and `.light` with identical values | TRUE | **U13**: tokens.css:17-18 `:root,\n.light {` | U13 | — |
| C-THEME-9 | skills/dooph-design-system-theming/SKILL.md:140 | package does not read `prefers-color-scheme` | TRUE | **U13**: Grep src (excl. stories): only tokens.css:10 comment | U13 | — |
| C-THEME-10 | skills/dooph-design-system-theming/SKILL.md:147-149 | portalled menus/modals don't inherit `div.light`; "Decorate the portalled content (or portal container)" | FALSE | **U8** [PARTLY FALSE]: content className works; portal `container` cannot be set through ModalContent/SheetContent, and the internal overlay takes no className — U8-F4 | U8 | U8-F4 |
| C-THEME-11 | skills/dooph-design-system-theming/SKILL.md:160-163 | override tokens exist | TRUE | **U13**: check-names.cjs 0 misses | U13 | — |
| C-THEME-12 | skills/dooph-design-system-theming/SKILL.md:176-177 | mode-invariant tokens defined once on :root | FALSE | **U13** [FALSE for 6 tokens]: → F15 (cross-ref tokens unit) | U13 | U13-F15 |
| C-THEME-13 | skills/dooph-design-system-theming/SKILL.md:185-187 | Tooltip "token-driven, not theme-detected. Defaults to `themeInverse`"; `themeInverse={false}` for matching | TRUE | **U8**: Tooltip.tsx:48,66 · **U13**: Tooltip.tsx:35,48 `themeInverse = true`; 6 tooltip tokens | U8, U13 | — |
| C-THEME-14 | skills/dooph-design-system-theming/SKILL.md:188-192 | toast/tooltip width tokens; "the simple tooltip hugs its text by design" | TRUE | **U8**: tokens.css:461-468; Tooltip.tsx:68 · **U13**: check-names.cjs | U8, U13 | — |
| C-THEME-15 | skills/dooph-design-system-theming/SKILL.md:193-197 | menu width floor on items; `-complex` 324 shared with SearchBox; `-menu-action` removed | TRUE | **U13**: tokens.css:562-568 | U13 | — |
| C-THEME-16 | skills/dooph-design-system-theming/SKILL.md:198-202 | Avatar = surface-secondary + border-secondary + prominent-color; no avatar-bg | TRUE | **U13**: Avatar.tsx:21-22 | U13 | — |
| C-THEME-17 | skills/dooph-design-system-theming/SKILL.md:203-205 | slider fill from `color`; active track at 45% | STALE | **U13** [STALE (per-variant opacity tokens 50/70/60%)]: dooph-component-tokens.css:117-123 → F7 | U13 | U13-F7 |
| C-THEME-18 | skills/dooph-design-system-theming/SKILL.md:206-209 | slider geometry tokens; stepped inset `--ui-spacing-xs` | TRUE | **U13**: Slider.tsx:339 | U13 | — |
| C-THEME-19 | skills/dooph-design-system-theming/SKILL.md:210-212 | ShimmerText tokens | TRUE | **U13**: tokens.css:166-167 | U13 | — |
| C-THEME-20 | skills/dooph-design-system-theming/SKILL.md:221-222 | token-contract is the exhaustive list | FALSE | **U13**: → F8 | U13 | U13-F8 |

### TC — `skills/dooph-design-system-theming/references/token-contract.md` (31)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-TC-1 | skills/dooph-design-system-theming/references/token-contract.md:5 | bundle does not switch on prefers-color-scheme | TRUE | **U13**: as theming:140 | U13 | — |
| C-TC-2 | skills/dooph-design-system-theming/references/token-contract.md:15-23 | core colour token lists exist | TRUE | **U13**: check-names.cjs (only historical names missed) | U13 | — |
| C-TC-3 | skills/dooph-design-system-theming/references/token-contract.md:17,19,21,23,41-43,56,59-60,88 | "renamed … in 5.4" | FALSE | **U13** [FALSE (no 5.4 release; latest 5.3.0)]: → F1 | U13 | U13-F1, ~U1-F10, ~U10-F9, ~U13-F7 |
| C-TC-4 | skills/dooph-design-system-theming/references/token-contract.md:18 | danger-primary/secondary mode-invariant | TRUE | **U13**: not in .dark | U13 | — |
| C-TC-5 | skills/dooph-design-system-theming/references/token-contract.md:19 | danger state family all aliases (bg/disabled → secondary; hover → danger-secondary; active/fg → danger-primary) | TRUE | **U13**: tokens.css:75-84 | U13 | — |
| C-TC-6 | skills/dooph-design-system-theming/references/token-contract.md:29-32 | per-variant border alias behaviour | TRUE | **U13**: tokens.css:23-32 and prominent/danger blocks | U13 | — |
| C-TC-7 | skills/dooph-design-system-theming/references/token-contract.md:41 | input-border-focus light → prominent-border-hover, dark → prominent-border-active | TRUE | **U13**: token diff | U13 | — |
| C-TC-8 | skills/dooph-design-system-theming/references/token-contract.md:43 | input-border-danger-focus → danger-primary | TRUE | **U13**: token diff | U13 | — |
| C-TC-9 | skills/dooph-design-system-theming/references/token-contract.md:56 | alt DOES change between light and dark | FALSE | **U13**: → F7 | U13 | U13-F7, ~U1-F10 |
| C-TC-10 | skills/dooph-design-system-theming/references/token-contract.md:59-60 | alt mode-invariant; `-ter` exists | TRUE | **U13**: tokens.css:152-154 | U13 | — |
| C-TC-11 | skills/dooph-design-system-theming/references/token-contract.md:66 | eight text roles | STALE | **U13** [STALE (ten)]: → F7 | U13 | U13-F7, ~U1-F10 |
| C-TC-12 | skills/dooph-design-system-theming/references/token-contract.md:68 | font defaults per role | TRUE | **U13**: tokens.css:379-392 | U13 | — |
| C-TC-13 | skills/dooph-design-system-theming/references/token-contract.md:73 | `--ui-tracking-mono` -3% | TRUE | **U13**: tokens.css:445 `-0.03em` | U13 | — |
| C-TC-14 | skills/dooph-design-system-theming/references/token-contract.md:75 | text-mono/weight-mono alias text-body/weight-button | TRUE | **U13**: tokens.css:406,420 | U13 | — |
| C-TC-15 | skills/dooph-design-system-theming/references/token-contract.md:77 | `--ui-font-var-mono: "MONO" 1`; no label/title/hero axis token | TRUE | **U13**: tokens.css:429-436 | U13 | — |
| C-TC-16 | skills/dooph-design-system-theming/references/token-contract.md:85 | `--ui-height-button-micro` backs `ButtonSize.iconMicro` | TRUE | **U13** [TRUE (token 26px exists)]: tokens.css:475 | U13 | — |
| C-TC-17 | skills/dooph-design-system-theming/references/token-contract.md:87 | icon 12/14/16/18, stroke-width (1.5), back `IconSize.sm/rg/md/lg` | FALSE | **U13** [PARTLY FALSE (stroke is 2)]: tokens.css:525-529 → F7 · **U10**: tokens.css:529 is `2`; the stroke token feeds `strokeWidth` (BaseIcon.tsx:61), not IconSize (U10-F9) | U10, U13 | U13-F7, U10-F9, ~U1-F10 |
| C-TC-18 | skills/dooph-design-system-theming/references/token-contract.md:88 | radius-mini 10px | TRUE | **U13**: token diff | U13 | — |
| C-TC-19 | skills/dooph-design-system-theming/references/token-contract.md:96-98 | slider opacity/step tokens; step-inactive defaults to `--ui-color-border-secondary` | FALSE | **U13** [PARTLY FALSE (it is `--ui-color-secondary-border`)]: tokens.css:509 → F7 | U13 | U13-F7, ~U1-F10 |
| C-TC-20 | skills/dooph-design-system-theming/references/token-contract.md:109-110 | dark danger content and wash are `#ffffff` | TRUE | **U12** [TRUE (describes the tokens; the tokens are the defect)]: tokens.css:717-718 → U12-F1 · **U13**: token diff | U12, U13 | U12-F1 |
| C-TC-21 | skills/dooph-design-system-theming/references/token-contract.md:112 | `--ui-sticker-bg-opacity-secondary` 60% dark; "the dark wash does not" read it | TRUE | **U12** [TRUE (describes a dead override)]: → U12-F3 · **U13**: token diff | U12, U13 | U12-F3 |
| C-TC-22 | skills/dooph-design-system-theming/references/token-contract.md:117-128 | menu/search/tooltip/toast widths | TRUE | **U13**: tokens.css:562-568 | U13 | — |
| C-TC-23 | skills/dooph-design-system-theming/references/token-contract.md:137-138 | shimmer defaults | TRUE | **U13**: tokens.css:166-170 | U13 | — |
| C-TC-24 | skills/dooph-design-system-theming/references/token-contract.md:146-148 | motion families list | TRUE | **U13** [TRUE but incomplete]: → F8 | U13 | U13-F8 |
| C-TC-25 | skills/dooph-design-system-theming/references/token-contract.md:152-157 | rolling-digits were `--ui-rolling-money-*` in 5.0.0 | TRUE | **U13**: `git show v5.0.0:src/styles/tokens.css \| grep -c rolling-money` → 8 | U13 | — |
| C-TC-26 | skills/dooph-design-system-theming/references/token-contract.md:160-166 | rolling-digits defaults (stagger 0ms, ratio 0.55, 1ch, 0.34em) | TRUE | **U13**: tokens.css:324-330 | U13 | — |
| C-TC-27 | skills/dooph-design-system-theming/references/token-contract.md:192 | spinner 16/22/32/40 | TRUE | **U13**: tokens.css:455-458 | U13 | — |
| C-TC-28 | skills/dooph-design-system-theming/references/token-contract.md:207-209 | Tailwind colour/font/shadow mappings | TRUE | **U13**: check-names.cjs | U13 | — |
| C-TC-29 | skills/dooph-design-system-theming/references/token-contract.md:210 | `rounded-l-standard` | FALSE | **U13**: → F5 | U13 | U13-F5, ~U1-F10 |
| C-TC-30 | skills/dooph-design-system-theming/references/token-contract.md:212 | composite utilities list | TRUE | **U13** [TRUE but incomplete (no hero-body/hero-button)]: classes-head.txt → F7 | U13 | U13-F7 |
| C-TC-31 | skills/dooph-design-system-theming/references/token-contract.md:228 | preset: no manual remap needed | TRUE | **U13**: theme.css @theme inline | U13 | — |

### V3 — `skills/dooph-design-system-v3-migration/SKILL.md` (13)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-V3-1 | skills/dooph-design-system-v3-migration/SKILL.md:84-100 | rename-table targets | TRUE | **U13** [TRUE (all 15 targets exist at HEAD)]: check-names.cjs | U13 | — |
| C-V3-2 | skills/dooph-design-system-v3-migration/SKILL.md:113-118 | "Unchanged" list | TRUE | **U13** [TRUE at HEAD]: tokens.cjs | U13 | — |
| C-V3-3 | skills/dooph-design-system-v3-migration/SKILL.md:121-123 | new optional tokens exist | TRUE | **U13**: tokens.cjs | U13 | — |
| C-V3-4 | skills/dooph-design-system-v3-migration/SKILL.md:125-132 | "CURRENT (5.4)" names | FALSE | **U13** [FALSE version label]: → F1 | U13 | U13-F1 |
| C-V3-5 | skills/dooph-design-system-v3-migration/SKILL.md:138-147 | utility-rename targets | TRUE | **U13**: theme-keys-head.txt | U13 | — |
| C-V3-6 | skills/dooph-design-system-v3-migration/SKILL.md:153-154 | rename `bg-surface-page` | FALSE | **U13** [FALSE at HEAD]: → F9 | U13 | U13-F9 |
| C-V3-7 | skills/dooph-design-system-v3-migration/SKILL.md:163-172 | `ButtonVariant.danger`, `Fonts`, `FontSizes`, `FontWeights`, `font` prop | TRUE | **U13**: exports-head.tsv | U13 | — |
| C-V3-8 | skills/dooph-design-system-v3-migration/SKILL.md:186-187 | `SidebarLeftIcon`/`…HoverIcon`/`SidebarRightIcon`/`…HoverIcon` | TRUE | **U13**: exports-head.tsv | U13 | — |
| C-V3-9 | skills/dooph-design-system-v3-migration/SKILL.md:197-198 | only changed exports | STALE | **U13** [STALE for a v2→HEAD path]: → F9 | U13 | U13-F9 |
| C-V3-10 | skills/dooph-design-system-v3-migration/SKILL.md:220-224 | new in v3: `TextLink`, `CopyButton`, sliders, `LinearProgressIndicator`, `StarShape`, `ShimmerText`, `RollChangeText`, `RollHoverText`, `ButtonSize.iconMicro` | TRUE | **U13**: exports | U13 | — |
| C-V3-11 | skills/dooph-design-system-v3-migration/SKILL.md:223 | `ShapeButtons.star`, `DropdownMenuVariant` | FALSE | **U13** [FALSE at HEAD (removed)]: → F9 | U13 | U13-F9 |
| C-V3-12 | skills/dooph-design-system-v3-migration/SKILL.md:225-226 | slider/progress Radix deps are runtime deps | TRUE | **U13**: package.json dependencies | U13 | — |
| C-V3-13 | skills/dooph-design-system-v3-migration/SKILL.md:237,254 | done-check reachable | FALSE | **U13** [FALSE (greps a current name)]: → F9 | U13 | U13-F9 |

### V5 — `skills/dooph-design-system-v5-migration/SKILL.md` (11)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-V5-1 | skills/dooph-design-system-v5-migration/SKILL.md:10-15 | three breaking changes, two silent | TRUE | **U13** [UNVERIFIABLE vs v4.8.2→v5.0.0 (not re-inventoried; out of the HEAD question)]: — · **HD** (unverifiable): Export-name diff (`git grep -o "export (const\|function) X"` v4.8.2 vs v5.3.0) removes only `SiloIcon` (generateWavyArcPath was internal); `--ui-color-danger*` 19→0 at v5.0.0; `BarChartIcon` repurposed + `BarChartAxesIcon` added. Two of three are silent. Caveat: the icon renames shipped in 5.1.0, not 5.0.0; prop-level changes not inventoried. | U13 | — |
| C-V5-2 | skills/dooph-design-system-v5-migration/SKILL.md:17-22 | "5.4" renames | FALSE | **U13** [FALSE version label]: → F1 | U13 | U13-F1 |
| C-V5-3 | skills/dooph-design-system-v5-migration/SKILL.md:30 | "works as a CI gate" | FALSE | **U13** [FALSE (always exit 0)]: → F2 | U13 | U13-F2 |
| C-V5-4 | skills/dooph-design-system-v5-migration/SKILL.md:30-31 | dry run default, `--write` applies | TRUE | **U13**: fixture run | U13 | — |
| C-V5-5 | skills/dooph-design-system-v5-migration/SKILL.md:37-38 | `DiscPlatterDBIcon`, `BarChartAxesIcon` exist; `BarChartIcon` still exists | TRUE | **U13**: exports-head.tsv | U13 | — |
| C-V5-6 | skills/dooph-design-system-v5-migration/SKILL.md:50-53 | 5.4 brought the danger family back | FALSE | **U13** [FALSE as a release claim (tokens exist only on unreleased HEAD)]: token-inventory.txt ADDED; → F1 | U13 | U13-F1 |
| C-V5-7 | skills/dooph-design-system-v5-migration/SKILL.md:62-67 | danger token defaults table | TRUE | **U13** [TRUE at HEAD]: tokens.css:75-84 | U13 | — |
| C-V5-8 | skills/dooph-design-system-v5-migration/SKILL.md:75-77 | utilities `bg-danger`, `text-danger-fg`, `border-danger-border`, `-hover/-active/-disabled`, `bg-danger-primary` | TRUE | **U13** [TRUE at HEAD]: theme-keys-head.txt | U13 | — |
| C-V5-9 | skills/dooph-design-system-v5-migration/SKILL.md:86-87 | exits 0 once icon renames applied | TRUE | **U13** [TRUE but vacuous (exits 0 always)]: → F2 | U13 | U13-F2 |
| C-V5-10 | skills/dooph-design-system-v5-migration/SKILL.md:93-97 | new in v5 exports | TRUE | **U13**: exports-head.tsv · **U7** [UNVERIFIABLE here (release history; U13 scope)] (cited :95): — · **HD** (conflict): U7 UNVERIFIABLE vs U13 TRUE. `git ls-tree`/`git grep` per tag: all of Popover, Calendar, DatePicker, VerificationCodeInput, SidebarWithHoverIcon, RollingDigitsText, MonoText, SubheadingText, `tabular?:` absent at v4.8.2, present at v5.1.0 (the first five already at v5.0.0) → TRUE for the v5 line. | U7, U13 | — |
| C-V5-11 | skills/dooph-design-system-v5-migration/SKILL.md:100-101 | exports/files/peers unchanged v4→v5 | TRUE | **U13**: `git diff v4.8.2 v5.0.0 -- package.json` shows only dependency bumps, +react-popover, −optionalDependencies | U13 | — |

### V5CM — `skills/dooph-design-system-v5-migration/codemod.mjs` (1)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-V5CM-1 | skills/dooph-design-system-v5-migration/codemod.mjs:15-19,44,124-126 | "5.4 reinstated" | FALSE | **U13** [FALSE as release claim]: → F1 | U13 | U13-F1 |

### README — `README.md` (15)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-README-1 | README.md:7 | Storybook URL | TRUE | **U13**: WebFetch → Storybook page | U13 | — |
| C-README-2 | README.md:14 | `npm install @dooph-software/design-system` | TRUE | **U13**: package.json name/publishConfig · **U2**: package name package.json:2 | U2, U13 | — |
| C-README-3 | README.md:20,55 | `npx @dooph-software/design-system init-skills` | TRUE | **U2** [TRUE interactively; no-op when stdin is not a TTY]: U2-F13 · **U13**: package.json:17-19 `"init-skills": "./bin/init.mjs"` (single bin; extra arg ignored) | U2, U13 | U2-F13 |
| C-README-4 | README.md:24-25 | root import + `styles.css` | TRUE | **U13**: ex13 PASS; exports map · **U2**: package.json:26 | U2, U13 | — |
| C-README-5 | README.md:30-33 | interactive components ship a per-module `"use client"` "preserved into the published bundle", so they import directly into a Server Component | FALSE | **U2**: 16 modules unstamped (U2-F1) · **U13** [TRUE per baseline (48 chunks stamped); runtime `next build` not run]: baseline.md:15 · **HD** (conflict): U13 TRUE (baseline stamp count) vs U2 FALSE. dist chunk-4SBJJVN3.js (FadeChangeText) begins `import {` — no directive; 24 ESM chunks stamped vs 40 source directives (add-use-client.mjs:40 scans 5 lines; orchestrator O11) → FALSE. | U2, U13 | U2-F1 |
| C-README-6 | README.md:44 | "`next build` runs with no `createContext is not a function` error" | FALSE | **U2** [FALSE (plausible; not run under Next)]: dist/chunk-6QQ7EYYD.js:32 module-scope `createContext(null)` with no directive, imported by dist/index.js · **U13** [TRUE per baseline (48 chunks stamped); runtime `next build` not run]: baseline.md:15 · **HD** (conflict): U13 TRUE vs U2 FALSE. Static: dist/chunk-6QQ7EYYD.js:32 `var PromptInputContext = createContext(null);` at module scope, no directive, imported by dist/index.js (`grep -c` = 1) → a Server Component importing the root evaluates it. Not executed under `next build` (none available) — FALSE on static evidence. | U2, U13 | ≈U2-F1 |
| C-README-7 | README.md:45-47 | pure exports (text, icons, shapes, variant enums, `cn`) stay server-safe | TRUE | **U2**: §2: none of those chunks stamped · **U13** [TRUE per baseline (48 chunks stamped); runtime `next build` not run]: baseline.md:15 · **HD** (split): U13 umbrella TRUE; U2 TRUE for this part (none of those chunks stamped, U2 §2). | U2, U13 | — |
| C-README-8 | README.md:58 | copies skills into `.agents/`, `.claude/`, `.agent/`; no project files modified | TRUE | **U13**: bin/init.mjs:52-68, 122-130 · **U2**: init.mjs:52-68,127 (force-overwrites same-name files, never deletes stale ones) | U2, U13 | — |
| C-README-9 | README.md:62-71 | six role font tokens, defaults | TRUE | **U13** [TRUE values / incomplete (no mono)]: tokens.css:379-384 → F11 | U13 | U13-F11 |
| C-README-10 | README.md:95 | Flex axes GRAD/ROND/wdth | STALE | **U13** [INCOMPLETE]: → F11 | U13 | U13-F11 |
| C-README-11 | README.md:150-151,190-191 | `@import …/styles.css`, `…/theme.css` | TRUE | **U2**: package.json:26-27 | U2 | — |
| C-README-12 | README.md:180 | `rounded-standard` | FALSE | **U13** [FALSE at HEAD]: → F5 | U13 | U13-F5 |
| C-README-13 | README.md:185 | preset learns every `--ui-*` token | FALSE | **U13**: → F15 | U13 | U13-F15 |
| C-README-14 | README.md:189-191 | preset import order | TRUE | **U13**: theme.css:6-11 | U13 | — |
| C-README-15 | README.md:208 | LICENSE link `./LICENSE` | FALSE | **U13** [FALSE (LICENSE.txt)]: → F15 | U13 | U13-F15 |

### CHANGELOG — `CHANGELOG.md` (6)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-CHANGELOG-1 | CHANGELOG.md:3-6 | all notable changes documented; Keep a Changelog | FALSE | **U13**: → F12 | U13 | U13-F12 |
| C-CHANGELOG-2 | CHANGELOG.md:13 | "`MorphRotationShape` … (`autoplay`, `controlled`, `embedded` modes; `restingAngle`; per-instance `timing`)" | TRUE | **U10**: constants.ts:3-10; tsx:94-120; timing.ts:21-31 (token overrides, not JS durations) · **U13**: exports-head.tsv; tokens (shape-morph ×7 incl. nudge ×3); 12 `*_SHAPE_PATH` | U10, U13 | — |
| C-CHANGELOG-3 | CHANGELOG.md:15 | tokens `--ui-shape-morph-duration`, `-ease` (generated), `-interval`, `-passive-spin-duration` | TRUE | **U10**: tokens.css:267-271 · **U13**: exports-head.tsv; tokens (shape-morph ×7 incl. nudge ×3); 12 `*_SHAPE_PATH` | U10, U13 | — |
| C-CHANGELOG-4 | CHANGELOG.md:16 | "Every `Shapes` component exports its outline as `<NAME>_SHAPE_PATH`" | TRUE | **U10**: 12/12 (`rg -c "_SHAPE_PATH =" src/components/Shapes` → 12 files) · **U13**: exports-head.tsv; tokens (shape-morph ×7 incl. nudge ×3); 12 `*_SHAPE_PATH` | U10, U13 | — |
| C-CHANGELOG-5 | CHANGELOG.md:18 | nudge: `--ds-shape-morph-nudge` input, `--ui-shape-morph-nudge`, `-nudge-duration`, `-nudge-ease` | TRUE | **U10**: index.css:791, 837; tokens.css:276-278 · **U13**: exports-head.tsv; tokens (shape-morph ×7 incl. nudge ×3); 12 `*_SHAPE_PATH` | U10, U13 | — |
| C-CHANGELOG-6 | CHANGELOG.md:21 | DropdownTrigger + Typeable use DropdownCaret; right padding now 0 | TRUE | **U5**: DT:61, 74, 195, 276 · **U13** [TRUE (per usage:211 + DropdownCaret presence)]: classes-head.txt `ds-dropdown-caret-host` | U5, U13 | — |

### CONTRIBUTING — `CONTRIBUTING.md` (2)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-CONTRIBUTING-1 | CONTRIBUTING.md:4 | PRs not accepted | UNVERIFIABLE | **U13** [UNVERIFIABLE (policy)]: — · **HD** (unverifiable): Policy statement ("PRs not accepted"); nothing in the repo can confirm or refute a policy. | U13 | — |
| C-CONTRIBUTING-2 | CONTRIBUTING.md:7 | issues link | FALSE | **U13** [FALSE (404)]: → F14 | U13 | U13-F14 |

### SECURITY — `SECURITY.md` (2)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-SECURITY-1 | SECURITY.md:5 | only latest release gets fixes | UNVERIFIABLE | **U13** [UNVERIFIABLE (policy)]: — · **HD** (unverifiable): Policy statement (supported versions). | U13 | — |
| C-SECURITY-2 | SECURITY.md:12 | advisory link | FALSE | **U13** [FALSE (404)]: → F14 | U13 | U13-F14 |

### NOTICES — `THIRD_PARTY_NOTICES.md` (3)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-NOTICES-1 | THIRD_PARTY_NOTICES.md:10-42 | icon libraries collectively | UNVERIFIABLE | **U13** [UNVERIFIABLE (provenance not tracked per icon, as stated)]: — · **HD** (unverifiable): Per-icon provenance is not recorded in the repo (the notice says so itself). | U13 | — |
| C-NOTICES-2 | THIRD_PARTY_NOTICES.md:48-63 | runtime npm packages listed | FALSE | **U13** [FALSE (3 of 14 missing)]: → F13 | U13 | U13-F13 |
| C-NOTICES-3 | THIRD_PARTY_NOTICES.md:67-85 | engine vendored from shape-morph @ f4d2697, MIT; androidx Apache-2.0 | TRUE | **U13** [TRUE (matches headers)]: engine/{utils,polygon,morph,cubic}.ts:2-4 | U13 | — |

### LICENSE — `LICENSE.txt` (1)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-LICENSE-1 | LICENSE.txt:1-3 | MIT, © 2026 Dooph LLC | TRUE | **U13** [TRUE (provenance)]: — | U13 | — |

### PKG — `package.json` (1)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-PKG-1 | package.json:3 | version 5.3.0 = tag v5.3.0 | TRUE | **U2** [TRUE, but HEAD is 11 commits past the tag with unreleased renames (baseline.md:21-24; RC-7)]: baseline.md | U2 | — |

### SKILLSLOCK — `skills-lock.json` (4)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-SKILLSLOCK-1 | skills-lock.json:4-9,22-27 | fhc and visx from dooph-software/dooph-skills | UNVERIFIABLE | **U14** [consistent (no local provenance to contradict)]: - · **HD** (regrade): U14 "consistent (no local provenance to contradict)" is not a verification; upstream provenance is external → UNVERIFIABLE. | U14 | — |
| C-SKILLSLOCK-2 | skills-lock.json:8,14,20,26 | computedHash values | UNVERIFIABLE | **U14** [UNVERIFIABLE (sha256 of SKILL.md does not match; algorithm unknown)]: sha256sum · **HD** (unverifiable): sha256 of SKILL.md does not match; the hashing algorithm of the skills CLI is not documented in-repo. | U14 | — |
| C-SKILLSLOCK-3 | skills-lock.json:10-15 | radix-ui-design-system from sickn33/antigravity-awesome-skills | FALSE | **U14** [CONTRADICTED by the skill's own frontmatter `source: self`]: radix SKILL.md:6; U14-F14 · **HD** (regrade): U14 "CONTRADICTED": the lock says sickn33/antigravity-awesome-skills; radix SKILL.md:6 says `source: self` — the two records cannot both be true; graded FALSE as recorded provenance (U14-F14). | U14 | U14-F14 |
| C-SKILLSLOCK-4 | skills-lock.json:16-21 | skill-creator from anthropics/skills | UNVERIFIABLE | **U14** [consistent (Apache-2.0 LICENSE.txt present)]: skill-creator/LICENSE.txt:1-3 · **HD** (regrade): Consistent with skill-creator/LICENSE.txt (Apache-2.0) but upstream provenance is external → UNVERIFIABLE. | U14 | — |

### SPEC — `docs/superpowers/specs/2026-08-31-digits-sidebar-mono-design.md` (12)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-SPEC-1 | docs/superpowers/specs/2026-08-31-digits-sidebar-mono-design.md:5 | "Status: decisions approved; implementation pending" | STALE | **U3**: implemented (U3-F13) · **U14** [STALE (shipped)]: RollingDigitsText.tsx, SidebarWithHoverIcon.tsx, MonoText | U3, U14 | U3-F13, ~U14-F15 |
| C-SPEC-2 | docs/superpowers/specs/2026-08-31-digits-sidebar-mono-design.md:44,51-52,82-85 | separator default 0.3em; one keyframe carries width+opacity; `prevJoined` ref | STALE | **U3** [STALE (design superseded: tokens.css:330 = 0.34em; separate fade keyframes index.css:1010-1015; state `source` guard RollingDigitsText.tsx:190-212)]: not a finding (design doc of shipped work, not present tense) · **U14** [STALE (retuned to 0.34em)]: tokens.css:330 | U3, U14 | UNCOVERED |
| C-SPEC-3 | docs/superpowers/specs/2026-08-31-digits-sidebar-mono-design.md:139-140 | `@property --ds-sidebar-rail-{s,h}` | TRUE | **U14**: index.css:37, 42 | U14 | — |
| C-SPEC-4 | docs/superpowers/specs/2026-08-31-digits-sidebar-mono-design.md:146 | PULL = 1, BULGE = 2.5 | TRUE | **U14**: SidebarWithHoverIcon.tsx:50, 52 | U14 | — |
| C-SPEC-5 | docs/superpowers/specs/2026-08-31-digits-sidebar-mono-design.md:179-181 | sidebar-icon tokens 260ms / 180ms / cubic-bezier(0.32,0.72,0,1) | TRUE | **U14**: tokens.css:345-347 | U14 | — |
| C-SPEC-6 | docs/superpowers/specs/2026-08-31-digits-sidebar-mono-design.md:196-197 | MonoText = BaseText with variant fixed via createRoleText | TRUE | **U3**: BaseText.tsx:158 | U3 | — |
| C-SPEC-7 | docs/superpowers/specs/2026-08-31-digits-sidebar-mono-design.md:202 | `--ui-font-mono` stack value | STALE | **U3** [STALE (design-time; code adds "SF Mono", Consolas)]: tokens.css:388-390 | U3 | UNCOVERED |
| C-SPEC-8 | docs/superpowers/specs/2026-08-31-digits-sidebar-mono-design.md:203-205 | text/weight/font-var mono tokens | TRUE | **U3**: tokens.css:406,420,436 | U3 | — |
| C-SPEC-9 | docs/superpowers/specs/2026-08-31-digits-sidebar-mono-design.md:208-212 | `.text-style-mono` in components layer; surface list | TRUE | **U3** [TRUE (code adds tracking)]: index.css:272-280; constants.ts | U3 | — |
| C-SPEC-10 | docs/superpowers/specs/2026-08-31-digits-sidebar-mono-design.md:214-215 | sync-theme regex gains mono; weight/font-var mono EXCLUDED | TRUE | **U3**: scripts/sync-theme.mjs:65,73,191 | U3 | — |
| C-SPEC-11 | docs/superpowers/specs/2026-08-31-digits-sidebar-mono-design.md:226-230 | `tabular` in TextStyleProps, inline; RollingDigitsText always tabular | TRUE | **U3**: textStyle.ts:65,100-102; index.css:561 | U3 | — |
| C-SPEC-12 | docs/superpowers/specs/2026-08-31-digits-sidebar-mono-design.md:236-239 | KeyIcon to export `KeyIcon` | TRUE | **U14**: Icons/KeyIcon.tsx:3 | U14 | — |

### SPEC-CHARTS — `2026-09-20-visx-charts-design.md` (1)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-SPEC-CHARTS-1 | 2026-09-20-visx-charts-design.md:125-127 | quotes Rule 1 as exempting "geometry props with established Radix/industry names" | FALSE | **U14** [misquote (arch:122 says "geometry/mode props with established or genuinely orthogonal names")]: arch:122 | U14 | UNCOVERED |

### RESEARCH — `.claude/research/2026-08-27-date-picker-foundation-research.md` (4)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-RESEARCH-1 | .claude/research/2026-08-27-date-picker-foundation-research.md:5 | "research only. No code was written" | STALE | **U14** [STALE (Calendar/DatePicker/Popover shipped)]: src/components/{Calendar,DatePicker,Popover} | U14 | ~U14-F15 |
| C-RESEARCH-2 | .claude/research/2026-08-27-date-picker-foundation-research.md:42,300,310 | repo has no `@radix-ui/react-popover` | STALE | **U7** [STALE (historical; dated research)]: package.json:83 · **U14**: Popover/Popover.tsx:3 | U7, U14 | UNCOVERED |
| C-RESEARCH-3 | .claude/research/2026-08-27-date-picker-foundation-research.md:314 | DropdownMenuContent wrapper "ports over nearly verbatim" to Popover | STALE | **U7** [STALE (historical plan; result diverged)]: U7-F3, U7-F4 | U7 | U7-F3, U7-F4 |
| C-RESEARCH-4 | .claude/research/2026-08-27-date-picker-foundation-research.md:576 | "Enforcement: `console.warn` ... and render nothing rather than crashing" (decision record) | FALSE | **U7** [FALSE vs code]: Calendar keeps rendering after the warning and hits a TypeError (U7-F1) | U7 | U7-F1 |

### PROMPT — `executor-prompt-oss-publication.md` (2)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-PROMPT-1 | executor-prompt-oss-publication.md:25-30 | repo state: UNLICENSED, GitHub Packages, orientation/composition skills | STALE | **U14** [FALSE now (all tasks since done)]: package.json:6, publishConfig; `ls skills/` · **HD** (regrade): U14 "FALSE now (all tasks since done)": a task prompt describing the repo state when written → STALE. | U14 | UNCOVERED |
| C-PROMPT-2 | executor-prompt-oss-publication.md:38 | no Storybook deploy | STALE | **U14** [superseded]: .github/workflows/deploy-storybook.yml · **HD** (regrade): U14 "superseded" → STALE (.github/workflows/deploy-storybook.yml exists). | U14 | UNCOVERED |

### HDR-AIContextGauge — `src/components/AIChat/AIContextGauge.tsx` (5)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-HDR-AIContextGauge-1 | src/components/AIChat/AIContextGauge.tsx:6-7 | "Draws `used / budget` on a flat ProgressIndicator" | TRUE | **U11**: AIContextGauge.tsx:42-43 | U11 | — |
| C-HDR-AIContextGauge-2 | src/components/AIChat/AIContextGauge.tsx:7-8 | "`color` is the open design value (a LoadingSpinnerColor key or any CSS colour)" | TRUE | **U11** [TRUE (but see F2: only 2 keys, unlike family)]: ProgressIndicator.tsx:33-40,55-57 | U11 | U11-F2 |
| C-HDR-AIContextGauge-3 | src/components/AIChat/AIContextGauge.tsx:12-14 | "Deliberately NOT clamped ... reaches ProgressIndicator — which THROWS" | TRUE | **U11**: AIContextGauge.tsx:42; ProgressIndicator.tsx:~293-297 `if (progress < 0 \|\| progress > 1) { throw` | U11 | — |
| C-HDR-AIContextGauge-4 | src/components/AIChat/AIContextGauge.tsx:15 | "their stream keeps running if this throws inside it" | UNVERIFIABLE | **U11** [UNVERIFIABLE (consumer runtime)]: — · **HD** (unverifiable): Depends on where the consumer keeps the stream relative to its error boundary; not a property of this code. | U11 | — |
| C-HDR-AIContextGauge-5 | src/components/AIChat/AIContextGauge.tsx:16-18 | "`budget <= 0` ... draws empty ... 0/0 is NaN, which would otherwise slip past the range guard" | TRUE | **U11**: AIContextGauge.tsx:42; NaN comparisons are false at the guard | U11 | — |

### HDR-AIModelSelect — `src/components/AIChat/AIModelSelect.tsx` (3)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-HDR-AIModelSelect-1 | src/components/AIChat/AIModelSelect.tsx:12-13 | no model catalogue/provider enum/reasoning levels here | TRUE | **U11** [TRUE (for this file; provider colour TOKENS exist in tokens.css:156-163)]: file body | U11 | — |
| C-HDR-AIModelSelect-2 | src/components/AIChat/AIModelSelect.tsx:14-15 | provider colour "written as a custom property the CSS reads — never a class" | FALSE | **U11** [FALSE (partly; true only for AIModelSelectItem)]: F11: :93 vs :227 | U11 | U11-F11, ~U11-F12 |
| C-HDR-AIModelSelect-3 | src/components/AIChat/AIModelSelect.tsx:16-18 | AIModelSelectItem IS a DropdownMenuRadioSelectItem; fill/check/aria-checked from the menu | TRUE | **U11**: :83-102 | U11 | — |

### HDR-AIPromptInput — `src/components/AIChat/AIPromptInput.tsx` (7)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-HDR-AIPromptInput-1 | src/components/AIChat/AIPromptInput.tsx:5-8 | compound; form provides context to Textarea/Toolbar(+Start/End)/Submit | TRUE | **U11**: :61, :125-162 | U11 | — |
| C-HDR-AIPromptInput-2 | src/components/AIChat/AIPromptInput.tsx:9-10 | Empty vs Filled is textarea state; value controllable/uncontrolled | TRUE | **U11**: :104-115, :139 | U11 | — |
| C-HDR-AIPromptInput-3 | src/components/AIChat/AIPromptInput.tsx:11-13 | Enter submits, Shift+Enter breaks, IME Enter left alone; `onSubmit` gets TRIMMED text; uncontrolled clears itself | TRUE | **U11**: :215-222, :117-122 | U11 | — |
| C-HDR-AIPromptInput-4 | src/components/AIChat/AIPromptInput.tsx:14-15 | `responding`: submit → stop wired to `onStop`, submitting blocked | TRUE | **U11** [TRUE (stop only when `onStop` given, :305)]: :119, :305-318 | U11 | — |
| C-HDR-AIPromptInput-5 | src/components/AIChat/AIPromptInput.tsx:16-19 | grows to `--ui-chat-prompt-max-height`, floor `1lh`; cap/floor only in CSS; component sets height = scrollHeight | TRUE | **U11**: :189-197; css:505-509 | U11 | — |
| C-HDR-AIPromptInput-6 | src/components/AIChat/AIPromptInput.tsx:22-24 | no transport, no hotkeys beyond Enter; textarea forwards its ref | TRUE | **U11**: :180-204 | U11 | — |
| C-HDR-AIPromptInput-7 | src/components/AIChat/AIPromptInput.tsx:25-27 | every submit state renders `ButtonSize.iconSm` | TRUE | **U11**: :311, :327 | U11 | — |

### HDR-AITextPart — `src/components/AIChat/AITextPart.tsx` (5)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-HDR-AITextPart-1 | src/components/AIChat/AITextPart.tsx:5-7 | shell; `ds-chat-prose` styles whatever the renderer emits | TRUE | **U11**: AITextPart.tsx:35; dooph-component-tokens.css:555-667 (plain element selectors) | U11 | — |
| C-HDR-AITextPart-2 | src/components/AIChat/AITextPart.tsx:8-9 | `streamingAnimation` → `ds-chat-stream-in`, timed by `--ui-chat-stream-*` | TRUE | **U11**: AITextPart.tsx:33; dooph-component-tokens.css:488-492; index.css:1034-1045 | U11 | — |
| C-HDR-AITextPart-3 | src/components/AIChat/AITextPart.tsx:12-13 | "NO dependency on a markdown renderer" | TRUE | **U11**: no renderer import in any shipped file (rg) | U11 | — |
| C-HDR-AITextPart-4 | src/components/AIChat/AITextPart.tsx:14-15 | "No wrapper around `children`" | TRUE | **U11**: AITextPart.tsx:31-39 (children via props onto root) | U11 | — |
| C-HDR-AITextPart-5 | src/components/AIChat/AITextPart.tsx:18-19 | "Turning it off mid-flight settles any block still animating straight to rest" | TRUE | **U11**: animation is gated on the attribute (css:488); removing it removes the `animation` declaration | U11 | — |

### HDR-AIThinkingPart — `src/components/AIChat/AIThinkingPart.tsx` (7)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-HDR-AIThinkingPart-1 | src/components/AIChat/AIThinkingPart.tsx:5-7 | thinking: label shimmers via ShimmerText re-based by `ds-chat-thinking-shimmer`; transcript always visible | TRUE | **U11**: AIThinkingPart.tsx:109-121; css:407-410 | U11 | — |
| C-HDR-AIThinkingPart-2 | src/components/AIChat/AIThinkingPart.tsx:8-10 | thought+transcript: disclosure; chevron revealed on hover, stays while open; grid-rows transition timed by `--ui-chat-disclosure-*` | TRUE | **U11**: :157-200; css:424-427 (`[data-state="open"]`), 441-469 | U11 | — |
| C-HDR-AIThinkingPart-3 | src/components/AIChat/AIThinkingPart.tsx:11 | thought without transcript: plain settled row | TRUE | **U11**: :137-152 | U11 | — |
| C-HDR-AIThinkingPart-4 | src/components/AIChat/AIThinkingPart.tsx:12-13 | open state controllable or uncontrolled; "the only state this component owns" | TRUE | **U11**: :76-85 | U11 | — |
| C-HDR-AIThinkingPart-5 | src/components/AIChat/AIThinkingPart.tsx:16-17 | transcript "available" exactly when `children` is given | TRUE | **U11** [TRUE (an empty string `""` also counts as given)]: :88 | U11 | — |
| C-HDR-AIThinkingPart-6 | src/components/AIChat/AIThinkingPart.tsx:18-20 | label/meta are consumer copy; "No timer lives here" | TRUE | **U11**: no timer APIs in file | U11 | — |
| C-HDR-AIThinkingPart-7 | src/components/AIChat/AIThinkingPart.tsx:21-22 | transcript tertiary while live, secondary once opened | TRUE | **U11**: :117 `text-text-tertiary`, :196 `text-text-secondary` | U11 | — |

### HDR-AIToolPart — `src/components/AIChat/AIToolPart.tsx` (5)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-HDR-AIToolPart-1 | src/components/AIChat/AIToolPart.tsx:5-7 | active shimmers (`ds-chat-tool-shimmer`), complete ghost, error danger | TRUE | **U11**: :63-78; css:403-406 | U11 | — |
| C-HDR-AIToolPart-2 | src/components/AIChat/AIToolPart.tsx:8-9 | meta visible while active, revealed on hover once settled | TRUE | **U11**: :80-86 | U11 | — |
| C-HDR-AIToolPart-3 | src/components/AIChat/AIToolPart.tsx:10-11 | skill: no hover response and no meta | TRUE | **U11**: :48-49, :58, :74 | U11 | — |
| C-HDR-AIToolPart-4 | src/components/AIChat/AIToolPart.tsx:14-17 | formats nothing, measures nothing, no timer | TRUE | **U11**: file body | U11 | — |
| C-HDR-AIToolPart-5 | src/components/AIChat/AIToolPart.tsx:18-19 | `state` is AIToolPartState, never an SDK string | TRUE | **U11**: :29; constants.ts:28-32 | U11 | — |

### HDR-AITurnSummary — `src/components/AIChat/AITurnSummary.tsx` (2)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-HDR-AITurnSummary-1 | src/components/AIChat/AITurnSummary.tsx:5-7 | label ghost, meta tertiary; CopyButton revealed on hover and keyboard focus | TRUE | **U11**: :43-56; css:424-425 (`:hover`, `:focus-within`) | U11 | — |
| C-HDR-AITurnSummary-2 | src/components/AIChat/AITurnSummary.tsx:10-11 | never reads a clock or usage object | TRUE | **U11**: file body | U11 | — |

### HDR-Button — `src/components/Button/Button.tsx` (6)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-HDR-Button-1 | src/components/Button/Button.tsx:5-6 | "`variant` + `size` map through `buttonVariants` (cva) onto token-backed Tailwind utilities" | TRUE | **U4** [TRUE (except `px-3`/`gap-2`, not token-backed — U4-F7)]: Button.tsx:37-105,130 | U4 | U4-F7 |
| C-HDR-Button-2 | src/components/Button/Button.tsx:6 | "`asChild` swaps the root for Radix `Slot`" | TRUE | **U4**: Button.tsx:126; aschild.cjs `OK Button asChild <a>` | U4 | — |
| C-HDR-Button-3 | src/components/Button/Button.tsx:7-9 | "paints each variant's own explicit disabled bg/border tokens (primary, prominent and danger all alias secondary-disabled) plus `ds-disabled-state`" | TRUE | **U4** [TRUE (for the four filled variants; ghost/text are transparent and have none)]: Button.tsx:43,53,59,65,71; tokens.css:31-32,61-63,84-85 | U4 | — |
| C-HDR-Button-4 | src/components/Button/Button.tsx:12-18 | "`danger` paints the `--ui-color-danger-*` STATE family ... not the raw palette ... the state family aliases them" | TRUE | **U4**: Button.tsx:68-71; tokens.css:76-85 alias `--ui-color-danger-primary/-secondary` | U4 | — |
| C-HDR-Button-5 | src/components/Button/Button.tsx:19-20 | "`prominent` was called `brand` ... Neither spelling survives." | TRUE | **U4** [TRUE for keys/tokens (history part UNVERIFIABLE); story export names still say `Brand` (U4-F17). Out of scope: Checkbox.tsx:2,6 still describe `CheckboxVariant (brand \| primary)` — for the Checkbox unit]: `rg -n -i "\bbrand\b\|--ui-color-brand" src` · **HD** (unverifiable): Present-tense half verified (no `brand` key/token in src); history half needs no check. | U4 | U4-F17 |
| C-HDR-Button-6 | src/components/Button/Button.tsx:21 | "Keep `ButtonVariant.prominent` in the API even if icon stories omit it." | TRUE | **U4**: constants.ts:11; Button.stories.tsx:104 omits prominent | U4 | — |

### HDR-ChatDivider — `src/components/AIChat/ChatDivider.tsx` (3)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-HDR-ChatDivider-1 | src/components/AIChat/ChatDivider.tsx:6-7 | one component for both Figma dividers | TRUE | **U11**: stories Dividers | U11 | — |
| C-HDR-ChatDivider-2 | src/components/AIChat/ChatDivider.tsx:8-9 | rules take leftover width so the label stays centred; Figma pins 120px | TRUE | **U11** [TRUE / UNVERIFIABLE (Figma)]: :28 `flex-1` on both rules · **HD** (unverifiable): Layout half TRUE (ChatDivider.tsx:28 `flex-1` on both rules); "Figma pins 120px" not checkable without the Figma file (not in repo). | U11 | — |
| C-HDR-ChatDivider-3 | src/components/AIChat/ChatDivider.tsx:12-13 | when to draw is the consumer's | TRUE | **U11**: no date/model logic | U11 | — |

### HDR-Checkbox — `src/components/Checkbox/Checkbox.tsx` (7)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-HDR-Checkbox-1 | src/components/Checkbox/Checkbox.tsx:2 | "brand/primary checked fills" | FALSE | **U6**: constants.ts:12-15 prominent/primary (U6-F1) | U6 | U6-F1, ~U6-F28 |
| C-HDR-Checkbox-2 | src/components/Checkbox/Checkbox.tsx:5 | unchecked hover/active use secondary surface tokens | FALSE | **U6**: hover gated (:38), active not gated (:40); dist-styles.css:2277 vs :1827 (U6-F15) | U6 | U6-F15, ~U6-F28 |
| C-HDR-Checkbox-3 | src/components/Checkbox/Checkbox.tsx:6 | fill follows `CheckboxVariant` (brand \| primary) | FALSE | **U6**: constants.ts:12-15 (U6-F1) | U6 | U6-F1, ~U6-F28 |
| C-HDR-Checkbox-4 | src/components/Checkbox/Checkbox.tsx:7-9 | disabled unchecked → secondary-disabled; disabled checked/indeterminate → primary-disabled + secondary-fg | TRUE | **U6**: Checkbox.tsx:43-45 | U6 | — |
| C-HDR-Checkbox-5 | src/components/Checkbox/Checkbox.tsx:9-10 | active/focus rings gated off while data-disabled | TRUE | **U6**: Checkbox.tsx:40, 55, 60; dooph-component-tokens.css:64 | U6 | — |
| C-HDR-Checkbox-6 | src/components/Checkbox/Checkbox.tsx:13-14 | (constraint) states via data-[state]/data-[disabled] only | TRUE | **U6** [TRUE (honoured)]: no JS class toggling in Checkbox.tsx | U6 | — |
| C-HDR-Checkbox-7 | src/components/Checkbox/Checkbox.tsx:15-16 | (constraint) indicator SVGs aria-hidden | TRUE | **U6** [TRUE (honoured)]: Checkbox.tsx:89, 105 | U6 | — |

### HDR-CodeDigitInput — `src/components/VerificationCode/CodeDigitInput.tsx` (6)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-HDR-CodeDigitInput-1 | src/components/VerificationCode/CodeDigitInput.tsx:5 | 46px size-code-digit, rounded-tight, secondary surface/border | TRUE | **U6**: :46-47, 51; tokens.css:452 | U6 | — |
| C-HDR-CodeDigitInput-2 | src/components/VerificationCode/CodeDigitInput.tsx:6-7 | glyph always BaseText 18px/medium, never SubheadingText or raw text node | TRUE | **U6**: :62-73 | U6 | — |
| C-HDR-CodeDigitInput-3 | src/components/VerificationCode/CodeDigitInput.tsx:8 | hasError paints error-primary border + text | TRUE | **U6**: :50, 69 | U6 | — |
| C-HDR-CodeDigitInput-4 | src/components/VerificationCode/CodeDigitInput.tsx:8-9 | disabled uses secondary disabled tokens + ds-disabled-state | FALSE | **U6**: ds-disabled-state on a div never matches (U6-F2) | U6 | U6-F2, ~U6-F1, ~U6-F28 |
| C-HDR-CodeDigitInput-5 | src/components/VerificationCode/CodeDigitInput.tsx:9 | focus uses brand focus ring | STALE | **U6**: `focus-within:shadow-focus-prominent` (:56); `brand` removed (U6-F1, U6-F4) | U6 | U6-F1, U6-F4, ~U6-F2, ~U6-F28 |
| C-HDR-CodeDigitInput-6 | src/components/VerificationCode/CodeDigitInput.tsx:13 | (constraint) do not hardcode Host Grotesk | TRUE | **U6** [TRUE (honoured)]: no font-family in file | U6 | — |

### HDR-cubic — `src/components/MorphRotationShape/engine/cubic.ts` (2)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-HDR-cubic-1 | src/components/MorphRotationShape/engine/cubic.ts:2-4 | "Vendored from shape-morph (…, MIT, commit f4d2697) … See THIRD_PARTY_NOTICES.md" | TRUE | **U10** [TRUE (attribution present in repo)]: THIRD_PARTY_NOTICES.md:69-85; the notice does not ship (U10-F10) | U10 | U10-F10 |
| C-HDR-cubic-2 | src/components/MorphRotationShape/engine/cubic.ts:7-9 | "Keep this file a faithful port. Behaviour fixes belong in ../svgPath.ts" | FALSE | **U10** [FALSE (path) / UNVERIFIABLE (faithfulness)]: svgPath.ts is `./svgPath.ts` (U10-F13). Faithfulness to upstream f4d2697 not diffed (no upstream copy offline); `git log -- src/components/MorphRotationShape/` → only 5036a8f, so no edits since vendoring; no DS-specific logic in the four files. Unused upstream factories (createCircle/createRectangle/createStar, polygon.ts:538-645) are retained, consistent with the faithful-port constraint — not raised · **HD** (unverifiable): Path half FALSE (`../svgPath.ts` → the file is `./svgPath.ts`, engine/ sibling); faithfulness to upstream f4d2697 stays UNVERIFIABLE (no upstream copy offline; `git log` shows no edits since vendoring). | U10 | U10-F13 |

### HDR-DropdownCaret — `src/components/DropdownCaret/DropdownCaret.tsx` (8)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-HDR-DropdownCaret-1 | src/components/DropdownCaret/DropdownCaret.tsx:5 | MorphRotationShape (embedded) behind a 14px chevron | TRUE | **U5**: :53-59; BaseIcon.tsx:11 `rg: "var(--ui-icon-rg)"`; tokens.css:526 `--ui-icon-rg: 14px` | U5 | — |
| C-HDR-DropdownCaret-2 | src/components/DropdownCaret/DropdownCaret.tsx:5-7 | closed shape → open shape morph, chevron flips 180° | TRUE | **U5**: :34-37; index.css:839-848 | U5 | — |
| C-HDR-DropdownCaret-3 | src/components/DropdownCaret/DropdownCaret.tsx:7-8 | hover leans `--ui-shape-morph-nudge` toward the other shape in either state | TRUE | **U5**: index.css:835-838 (not when disabled) | U5 | — |
| C-HDR-DropdownCaret-4 | src/components/DropdownCaret/DropdownCaret.tsx:9-12 | state from nearest `.ds-dropdown-caret-host` via CSS: open, hover, disabled forms; trigger passes no props | TRUE | **U5** [TRUE (nit: descendant combinator matches any host ancestor, not only the nearest)]: index.css:835-859; DT:74, 276 | U5 | — |
| C-HDR-DropdownCaret-5 | src/components/DropdownCaret/DropdownCaret.tsx:13-15 | root is a square the trigger's height; frame = height-button − spacing-rg (26px) | TRUE | **U5**: :48 `size-button`; index.css:820; tokens.css:449 (38px), :517 (12px) | U5 | — |
| C-HDR-DropdownCaret-6 | src/components/DropdownCaret/DropdownCaret.tsx:18-20 | (constraint) `-my-px -mr-px` pulls over the host's 1px border | TRUE | **U5** [honoured]: :48 | U5 | — |
| C-HDR-DropdownCaret-7 | src/components/DropdownCaret/DropdownCaret.tsx:21-22 | (constraint) colours live in `.ds-dropdown-caret` CSS | TRUE | **U5** [honoured]: :44-61 has no colour classes; index.css:822, 830, 844, 853, 857 | U5 | — |
| C-HDR-DropdownCaret-8 | src/components/DropdownCaret/DropdownCaret.tsx:23 | (constraint) no state props and no listeners | TRUE | **U5** [honoured]: :39-42 props = `variant`, `className` | U5 | — |

### HDR-DropdownMenu — `src/components/Menu/DropdownMenu.tsx` (7)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-HDR-DropdownMenu-1 | src/components/Menu/DropdownMenu.tsx:5-6 | search is an optional sibling (`DropdownMenuSearch`), never baked into content | TRUE | **U5**: DM:149-175 renders no search | U5 | — |
| C-HDR-DropdownMenu-2 | src/components/Menu/DropdownMenu.tsx:9-10 | selectType flows to items via context and to triggers as Slot-merged `data-select-type` | TRUE | **U5**: DM:49-51, 63, 78-83, 300 | U5 | — |
| C-HDR-DropdownMenu-3 | src/components/Menu/DropdownMenu.tsx:11 | items hold the 160px floor; sections and panel hug | TRUE | **U5** [TRUE (a mounted `DropdownMenuSearch` adds a 324px floor to the panel)]: DM:200; dooph-component-tokens.css:206-208; tokens.css:562; DropdownMenuSearch.tsx:54 | U5 | — |
| C-HDR-DropdownMenu-4 | src/components/Menu/DropdownMenu.tsx:12-15 | ghost surfaces; content `ghost-fg-active`; danger paints danger-primary on hover/active | TRUE | **U5**: DM:197, 212-215 | U5 | — |
| C-HDR-DropdownMenu-5 | src/components/Menu/DropdownMenu.tsx:16 | default `modal={false}`; portals on by default with escape hatch | TRUE | **U5**: DM:55, 117-118, 177-185 | U5 | — |
| C-HDR-DropdownMenu-6 | src/components/Menu/DropdownMenu.tsx:19 | (constraint) no search hardcoded into Content | TRUE | **U5** [honoured]: DM:149-175 | U5 | — |
| C-HDR-DropdownMenu-7 | src/components/Menu/DropdownMenu.tsx:20 | (constraint) open/disabled/highlighted via Radix data attributes only | TRUE | **U5** [honoured]: DM:168-169, 197, 258-263 (`hover:`/`active:` are pseudo-classes, no JS toggles) | U5 | — |

### HDR-DropdownMenuSearch — `src/components/Menu/DropdownMenuSearch.tsx` (5)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-HDR-DropdownMenuSearch-1 | src/components/Menu/DropdownMenuSearch.tsx:5-6 | icon + input + optional Esc hotkey; no bordered chrome (unlike SearchBox) | TRUE | **U5**: DropdownMenuSearch.tsx:52-80 vs SearchBox.tsx:28 | U5 | — |
| C-HDR-DropdownMenuSearch-2 | src/components/Menu/DropdownMenuSearch.tsx:7 | forwards ref to the input | TRUE | **U5**: :65 | U5 | — |
| C-HDR-DropdownMenuSearch-3 | src/components/Menu/DropdownMenuSearch.tsx:7-8 | stops keydown propagation so Radix typeahead does not steal keystrokes | TRUE | **U5**: :47; @radix-ui/react-menu 2.1.24 dist/index.mjs:312-314 | U5 | — |
| C-HDR-DropdownMenuSearch-4 | src/components/Menu/DropdownMenuSearch.tsx:11 | (constraint) not mounted in Content by default | TRUE | **U5** [honoured]: DM:149-175 | U5 | — |
| C-HDR-DropdownMenuSearch-5 | src/components/Menu/DropdownMenuSearch.tsx:12-13 | (constraint) typography via `text-style-button` on the input | TRUE | **U5** [honoured]: :70 | U5 | — |

### HDR-FadeChangeText — `src/components/AnimatedText/FadeChangeText.tsx` (7)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-HDR-FadeChangeText-1 | src/components/AnimatedText/FadeChangeText.tsx:6-7 | change signalled by `changeKey` or string/number children; mount never animates | TRUE | **U3**: useChangeSwap.ts:50-57, 99-104 (entering null at mount) | U3 | — |
| C-HDR-FadeChangeText-2 | src/components/AnimatedText/FadeChangeText.tsx:8-10 | `direction` down default / up, via the same signed `--ds-roll-dir` | TRUE | **U3**: FadeChangeText.tsx:56,70; index.css:986,992 | U3 | — |
| C-HDR-FadeChangeText-3 | src/components/AnimatedText/FadeChangeText.tsx:13-14 | swap engine lives in useChangeSwap | TRUE | **U3**: FadeChangeText.tsx:37,62 | U3 | — |
| C-HDR-FadeChangeText-4 | src/components/AnimatedText/FadeChangeText.tsx:15-18 | `ds-fade-change-*` animate transform + opacity only; will-change scoped to those | TRUE | **U3**: index.css:742,747,983-997 | U3 | — |
| C-HDR-FadeChangeText-5 | src/components/AnimatedText/FadeChangeText.tsx:19-23 | opacity has own offsets: old gone by 50%, new at 0 until 30% | TRUE | **U3**: index.css:984,995 | U3 | — |
| C-HDR-FadeChangeText-6 | src/components/AnimatedText/FadeChangeText.tsx:24-26 | no duration here; timing/easing/depth are `--ui-fade-change-*` defaulting to roll-change | TRUE | **U3**: tokens.css:255-259; index.css:740-746 | U3 | — |
| C-HDR-FadeChangeText-7 | src/components/AnimatedText/FadeChangeText.tsx:24-26 | "…and the reduced-motion case are `--ui-fade-change-*` tokens" | FALSE | **U3**: index.css:749-753 literal `animation-duration: 1ms` (U3-F13) | U3 | U3-F13 |

### HDR-Input — `src/components/Input/Input.tsx` (8)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-HDR-Input-1 | src/components/Input/Input.tsx:5-9 | text = bare input; others = wrapper chrome; className on chrome; other props + ref on input | TRUE | **U6**: Input.tsx:105-131, 152-212 | U6 | — |
| C-HDR-Input-2 | src/components/Input/Input.tsx:10-12 | number: mono role, 12px both sides, centred, ≥ one button height, grows | TRUE | **U6**: Input.tsx:135, 160 (ds-pl/pr-ui-rg = --ui-spacing-rg 12px, tokens.css:517), min-w-button; mirror :188-198 | U6 | — |
| C-HDR-Input-3 | src/components/Input/Input.tsx:12 | icon variants require `icon` | TRUE | **U6**: Input.tsx:99-103 | U6 | — |
| C-HDR-Input-4 | src/components/Input/Input.tsx:13 | clicking the chrome focuses the input | TRUE | **U6**: Input.tsx:143-147, 154 | U6 | — |
| C-HDR-Input-5 | src/components/Input/Input.tsx:16-20 | (constraint) number variants hug via hidden mirror span in a shared grid cell | TRUE | **U6** [TRUE (honoured)]: Input.tsx:188-204 | U6 | — |
| C-HDR-Input-6 | src/components/Input/Input.tsx:21-24 | mirror follows `value` or own state; consumer onChange still runs | TRUE | **U6**: Input.tsx:90-97, 149-150 | U6 | — |
| C-HDR-Input-7 | src/components/Input/Input.tsx:25-27 | (constraint) text without icon stays a bare input | TRUE | **U6** [TRUE (honoured)]: Input.tsx:115-133 | U6 | — |
| C-HDR-Input-8 | src/components/Input/Input.tsx:28-31 | icon variant without icon throws; "the props union is the real guard" | FALSE | **U6** [throw TRUE / "real guard" FALSE]: tsc run in U6-F23: icon = null / undefined / false all compile | U6 | U6-F23 |

### HDR-LinearProgressIndicator — `src/components/LinearProgressIndicator/LinearProgressIndicator.tsx` (6)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-HDR-LinearProgressIndicator-1 | src/components/LinearProgressIndicator/LinearProgressIndicator.tsx:4 | "determinate bar backed by Radix Progress" | TRUE | **U9**: LPI.tsx:17, 44 | U9 | — |
| C-HDR-LinearProgressIndicator-2 | src/components/LinearProgressIndicator/LinearProgressIndicator.tsx:7 | `value`/`max` clamp into a percentage stored on `--progress-pct` | TRUE | **U9**: LPI.tsx:40-42, 51 | U9 | — |
| C-HDR-LinearProgressIndicator-3 | src/components/LinearProgressIndicator/LinearProgressIndicator.tsx:8-9 | fill width animates via registered `@property --progress-pct` "(custom properties do not interpolate otherwise)" | FALSE | **U9** [FALSE (mechanism)]: effect is TRUE (dooph-component-tokens.css:128-133; index.css:17-21) but the `width`/`left` transitions start without registration (scratch svgvar.html) | U9 | ~U9-F19 |
| C-HDR-LinearProgressIndicator-4 | src/components/LinearProgressIndicator/LinearProgressIndicator.tsx:10 | `color` accepts a DS token name or any CSS color (same contract as Slider) | TRUE | **U9**: LPI.tsx:25, 52; color.ts:52-58 | U9 | — |
| C-HDR-LinearProgressIndicator-5 | src/components/LinearProgressIndicator/LinearProgressIndicator.tsx:13 | (constraint) no `LinearProgressVariant` enum | TRUE | **U9**: none in src | U9 | — |
| C-HDR-LinearProgressIndicator-6 | src/components/LinearProgressIndicator/LinearProgressIndicator.tsx:14 | (constraint) remainder hides at 100% via `data-hidden` | TRUE | **U9**: LPI.tsx:70-72 | U9 | — |

### HDR-MorphRotationShape — `src/components/MorphRotationShape/MorphRotationShape.tsx` (14)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-HDR-MorphRotationShape-1 | src/components/MorphRotationShape/MorphRotationShape.tsx:6-8 | "`autoplay` (an internal CSS clock on --ui-shape-morph-interval), `controlled` (`activeIndex`), or `embedded` (an ancestor's CSS sets --ds-shape-morph-target)" | TRUE | **U10**: index.css:797-799 (`animation: ds-shape-morph-clock var(--ui-shape-morph-interval)`); tsx:311-316 (clock handler bumps target), :339, index.css:790. No setInterval/setTimeout in scope (rg). | U10 | — |
| C-HDR-MorphRotationShape-2 | src/components/MorphRotationShape/MorphRotationShape.tsx:9-12 | "One registered number, --ds-shape-morph-step, is transitioned by CSS with the generated spring ease … never clamped" | TRUE | **U10**: index.css:52-56, 792-793; geometry.ts:19-23 clamps only the SEGMENT index, `t = v - segment` is unclamped (R12.11 ok). (Two other registered numbers exist, -lean and -clock; the header names lean at :17-18.) | U10 | — |
| C-HDR-MorphRotationShape-3 | src/components/MorphRotationShape/MorphRotationShape.tsx:13-16 | "`controlled` moves forward one stop per `activeIndex` change … In `autoplay`/`embedded` the stops are shape indices" | TRUE | **U10**: tsx:200-207 (push stop, counter+1), :221-222 (`shapeAt` = stops[k] vs mod(k,n)) | U10 | — |
| C-HDR-MorphRotationShape-4 | src/components/MorphRotationShape/MorphRotationShape.tsx:17-21 | "drawn value is --ds-shape-morph-step … PLUS --ds-shape-morph-lean … Targets may therefore be fractional" | TRUE | **U10**: tsx:278-279; index.css:790-795 (R12.12: target never rounded) | U10 | — |
| C-HDR-MorphRotationShape-5 | src/components/MorphRotationShape/MorphRotationShape.tsx:22-26 | fit per mode; "at rest the shape is pixel-identical to the static Shapes component" | UNVERIFIABLE | **U10** [TRUE / UNVERIFIABLE]: fit: geometry.ts:68-73, tsx:191,223 TRUE. "pixel-identical": the static Shape draws the path scaled 23/24 plus a 1-unit round-join currentColor stroke (BaseShape.tsx:45-48,55; BaseIcon.tsx:52-53,60); the morph fills the raw path. Near-identical, not provably pixel-identical · **HD** (unverifiable): Fit-per-mode half TRUE (geometry.ts:68-73). "Pixel-identical to the static Shapes component" needs a raster diff; construction differs (static: path ×23/24 + 1-unit round-join stroke, BaseShape.tsx:45-48,55; morph: raw path fill), so identity cannot be asserted statically. | U10 | — |
| C-HDR-MorphRotationShape-6 | src/components/MorphRotationShape/MorphRotationShape.tsx:27-28 | "`restingAngle` derives each step's turn from the target shape's measured rotational symmetry" | TRUE | **U10**: tsx:236-240; symmetry.ts:24-59 | U10 | — |
| C-HDR-MorphRotationShape-7 | src/components/MorphRotationShape/MorphRotationShape.tsx:29-30 | "fills the box it is given and sizes nothing itself" | TRUE | **U10**: tsx:346 (`block`), :350 (`size-full`); no width/height | U10 | — |
| C-HDR-MorphRotationShape-8 | src/components/MorphRotationShape/MorphRotationShape.tsx:33-37 | "Nothing in this file may hold a duration or an easing curve" | TRUE | **U10**: rg for DURATION/_MS/ms/cubic-bezier/setTimeout in scope → none; consts are NOMINAL_TURN_DEG (geometry) and EPSILON. timing.ts only maps consumer overrides onto `--ui-shape-morph-*` inline custom properties (R6.5 ok) | U10 | — |
| C-HDR-MorphRotationShape-9 | src/components/MorphRotationShape/MorphRotationShape.tsx:38-40 | "`d` and the transform are in JSX only for the FIRST render" | TRUE | **U10**: tsx:256-263 (ref set once), :352-353 (R12.11 ok) | U10 | — |
| C-HDR-MorphRotationShape-10 | src/components/MorphRotationShape/MorphRotationShape.tsx:41-44 | "Sampling starts from this element's OWN transitionrun / animationstart / animationiteration … Never listen on an ancestor" | TRUE | **U10**: tsx:300-321 listeners on own span; also started on mount :323 and on controlled change :335 (neither is an ancestor listener) | U10 | — |
| C-HDR-MorphRotationShape-11 | src/components/MorphRotationShape/MorphRotationShape.tsx:45-48 | "motion range comes from widenRange … resets only on landing" | TRUE | **U10**: tsx:280, :285-287; geometry.ts:30-35 | U10 | — |
| C-HDR-MorphRotationShape-12 | src/components/MorphRotationShape/MorphRotationShape.tsx:49 | "onStepComplete fires only when landing on a whole stop, never for a lean" | TRUE | **U10**: tsx:283, :291 | U10 | — |
| C-HDR-MorphRotationShape-13 | src/components/MorphRotationShape/MorphRotationShape.tsx:50-51 | "Changing `shapes` remounts the inner component (key), resetting to stop 0" | TRUE | **U10**: tsx:156-169 | U10 | — |
| C-HDR-MorphRotationShape-14 | src/components/MorphRotationShape/MorphRotationShape.tsx:52 | "One getComputedStyle per frame per animating instance" | TRUE | **U10**: tsx:275 | U10 | — |

### HDR-RevealChangeText — `src/components/AnimatedText/RevealChangeText.tsx` (8)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-HDR-RevealChangeText-1 | src/components/AnimatedText/RevealChangeText.tsx:6-8 | key from changeKey/children; `null` collapses and stays collapsed | TRUE | **U3**: RevealChangeText.tsx:58-68, 156-165, 220-221 | U3 | — |
| C-HDR-RevealChangeText-2 | src/components/AnimatedText/RevealChangeText.tsx:9-11 | change runs collapse → swap at 0 width → reveal | TRUE | **U3**: RevealChangeText.tsx:165, 211-223 | U3 | — |
| C-HDR-RevealChangeText-3 | src/components/AnimatedText/RevealChangeText.tsx:12 | `direction` picks the pinned edge; mount never animates | TRUE | **U3**: index.css:885,891-898 (auto fallback, width measured in layout effect before paint :196-205) | U3 | — |
| C-HDR-RevealChangeText-4 | src/components/AnimatedText/RevealChangeText.tsx:15-18 | WIDTH is the animated property | TRUE | **U3**: index.css:887-889,898 | U3 | — |
| C-HDR-RevealChangeText-5 | src/components/AnimatedText/RevealChangeText.tsx:19-22 | content never rolls or fades | TRUE | **U3**: RevealChangeText.tsx:243-249 (no animation classes) | U3 | — |
| C-HDR-RevealChangeText-6 | src/components/AnimatedText/RevealChangeText.tsx:23-25 | "reduced-motion case are `--ui-reveal-change-*` tokens" | FALSE | **U3**: index.css:916 literal 1ms (U3-F13) | U3 | U3-F13 |
| C-HDR-RevealChangeText-7 | src/components/AnimatedText/RevealChangeText.tsx:23-28 | no duration; RM drops to 1ms, not `transition: none` | TRUE | **U3**: index.css:913-918 | U3 | — |
| C-HDR-RevealChangeText-8 | src/components/AnimatedText/RevealChangeText.tsx:29-31 | slot state reconciled during render | TRUE | **U3**: RevealChangeText.tsx:149-167 | U3 | — |

### HDR-RollChangeText — `src/components/AnimatedText/RollChangeText.tsx` (5)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-HDR-RollChangeText-1 | src/components/AnimatedText/RollChangeText.tsx:6-10 | changeKey/children signal; mount never animates; one signed property flips both keyframes | TRUE | **U3**: useChangeSwap.ts:106-121; index.css:959,966 | U3 | — |
| C-HDR-RollChangeText-2 | src/components/AnimatedText/RollChangeText.tsx:13-14 | wrapper can wrap icons/arbitrary children | TRUE | **U3**: RollChangeText.tsx:40 `children: ReactNode` | U3 | — |
| C-HDR-RollChangeText-3 | src/components/AnimatedText/RollChangeText.tsx:15-18 | engine shared in useChangeSwap | TRUE | **U3**: RollChangeText.tsx:33,58 | U3 | — |
| C-HDR-RollChangeText-4 | src/components/AnimatedText/RollChangeText.tsx:19-21 | "reduced-motion case are all `--ui-roll-change-*` tokens" | FALSE | **U3**: index.css:727-731 (U3-F13) | U3 | U3-F13 |
| C-HDR-RollChangeText-5 | src/components/AnimatedText/RollChangeText.tsx:19-22 | no duration; out 200ms < in 300ms; halves retire independently | TRUE | **U3**: tokens.css:245-246; useChangeSwap.ts:130-144 | U3 | — |

### HDR-rollingDigitsModel — `src/components/AnimatedText/rollingDigitsModel.ts` (5)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-HDR-rollingDigitsModel-1 | src/components/AnimatedText/rollingDigitsModel.ts:5-8 | separators discarded at parse | TRUE | **U3**: rollingDigitsModel.ts:63 | U3 | — |
| C-HDR-rollingDigitsModel-2 | src/components/AnimatedText/rollingDigitsModel.ts:9-13 | reconcile keyed by place counting rightward | TRUE | **U3**: rollingDigitsModel.ts:152-160 | U3 | — |
| C-HDR-rollingDigitsModel-3 | src/components/AnimatedText/rollingDigitsModel.ts:15-16 | no React, no DOM | TRUE | **U3**: file has no imports | U3 | — |
| C-HDR-rollingDigitsModel-4 | src/components/AnimatedText/rollingDigitsModel.ts:19-21 | place is scope-local; strips reconciled independently | TRUE | **U3**: RollingDigitsText.tsx:244-245 | U3 | — |
| C-HDR-rollingDigitsModel-5 | src/components/AnimatedText/rollingDigitsModel.ts:24-28 | epoch only mints keys | TRUE | **U3**: rollingDigitsModel.ts:165 | U3 | — |

### HDR-RollingDigitsText — `src/components/AnimatedText/RollingDigitsText.tsx` (10)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-HDR-RollingDigitsText-1 | src/components/AnimatedText/RollingDigitsText.tsx:5-7 | pre-formatted string; digits roll; prefix/suffix swap without rolling; mount never animates | TRUE | **U3**: rollingDigitsModel.ts:99-110 (entering false); RollingDigitsText.tsx:282,296 | U3 | — |
| C-HDR-RollingDigitsText-2 | src/components/AnimatedText/RollingDigitsText.tsx:8-12 | keyed by place; new place opens from 0 width; departing collapses; concurrent with roll | TRUE | **U3**: rollingDigitsModel.ts:140-175; index.css:592-619 | U3 | — |
| C-HDR-RollingDigitsText-3 | src/components/AnimatedText/RollingDigitsText.tsx:13-14 | separators re-derived from place; trail their wheel | TRUE | **U3**: RollingDigitsText.tsx:164-168; rollingDigitsModel.ts:187-189 | U3 | — |
| C-HDR-RollingDigitsText-4 | src/components/AnimatedText/RollingDigitsText.tsx:15-17 | smallDecimals splits on last `.`, rendered via required component, raised right | TRUE | **U3**: rollingDigitsModel.ts:73; RollingDigitsText.tsx:288-292; index.css:666-683 | U3 | — |
| C-HDR-RollingDigitsText-5 | src/components/AnimatedText/RollingDigitsText.tsx:20 | US format only | TRUE | **U3**: rollingDigitsModel.ts:73 | U3 | — |
| C-HDR-RollingDigitsText-6 | src/components/AnimatedText/RollingDigitsText.tsx:21-24 | tabular not optional; `.ds-rolling-digits-figure` sets it | TRUE | **U3**: index.css:561 | U3 | — |
| C-HDR-RollingDigitsText-7 | src/components/AnimatedText/RollingDigitsText.tsx:25-26 | inherits typography; no 3D, no blur | TRUE | **U3**: index.css:553-660 (no filter/3D) | U3 | — |
| C-HDR-RollingDigitsText-8 | src/components/AnimatedText/RollingDigitsText.tsx:27-28 | union-enforced, never a runtime throw | TRUE | **U3** [TRUE (as a description; decision challenged U3-F6)]: RollingDigitsText.tsx:76-85,289 | U3 | U3-F6 |
| C-HDR-RollingDigitsText-9 | src/components/AnimatedText/RollingDigitsText.tsx:31-36 | no duration/timer/rAF/transitionend; entry = mount animation; exit = one animationend | TRUE | **U3**: grep; RollingDigitsText.tsx:132-134 | U3 | — |
| C-HDR-RollingDigitsText-10 | src/components/AnimatedText/RollingDigitsText.tsx:37-40 | reconcile in render | TRUE | **U3**: RollingDigitsText.tsx:202-212 | U3 | — |

### HDR-ShapeButton — `src/components/ShapeButton/ShapeButton.tsx` (4)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-HDR-ShapeButton-1 | src/components/ShapeButton/ShapeButton.tsx:5 | "`shape` picks a primitive from `Shapes/`; `variant` picks a color family" | TRUE | **U4**: ShapeButton.tsx:31-37,56-62,67-84 | U4 | — |
| C-HDR-ShapeButton-2 | src/components/ShapeButton/ShapeButton.tsx:6-8 | "shape SVG is painted by `currentColor` on its own wrapper span ... states are plain `text-*` utilities on that span" | TRUE | **U4**: ShapeButton.tsx:67-78,134-146 | U4 | — |
| C-HDR-ShapeButton-3 | src/components/ShapeButton/ShapeButton.tsx:9-10 | "The icon slot carries the CONTENT color separately" | TRUE | **U4** [TRUE (imprecise: the colour class sits on the root and the slot inherits it)]: ShapeButton.tsx:80-84,128,150 | U4 | — |
| C-HDR-ShapeButton-4 | src/components/ShapeButton/ShapeButton.tsx:13-16 | "`shapeComponents` must stay keyed by `ShapeButtons`, which `satisfies Record<string, Shapes>`" | TRUE | **U4** [TRUE (honoured)]: ShapeButton.tsx:56-62; constants.ts:14-20 | U4 | — |

### HDR-SidebarWithHoverIcon — `src/components/SidebarWithHoverIcon/SidebarWithHoverIcon.tsx` (8)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-HDR-SidebarWithHoverIcon-1 | src/components/SidebarWithHoverIcon/SidebarWithHoverIcon.tsx:6-8 | "The rail is a single cubic. Collinear control points draw a straight line" | TRUE | **U10**: :75-81 (`railPath(0,0)` = `M9 8C9 10.5 9 13.5 9 16`) | U10 | — |
| C-HDR-SidebarWithHoverIcon-2 | src/components/SidebarWithHoverIcon/SidebarWithHoverIcon.tsx:9-13 | side/hovered continuous; "It flattens on the way over, because at the midpoint `dir` is 0" | TRUE | **U10**: :76 `const dir = -1 + 2 * s;` | U10 | — |
| C-HDR-SidebarWithHoverIcon-3 | src/components/SidebarWithHoverIcon/SidebarWithHoverIcon.tsx:14-16 | "At `hovered` = 1 the geometry is exactly SidebarLeftHoverIcon / SidebarRightHoverIcon" | TRUE | **U10**: node evaluation of railPath: (0,1) → `M8 8C10.5 10.5 10.5 13.5 8 16` = SidebarLeftHoverIcon.tsx:7; (1,1) → `M16 8C13.5 10.5 13.5 13.5 16 16` = SidebarRightHoverIcon.tsx:7; rect :134 = both icons' :6 | U10 | — |
| C-HDR-SidebarWithHoverIcon-4 | src/components/SidebarWithHoverIcon/SidebarWithHoverIcon.tsx:19-23 | "`hovered` is CONTROLLED … must not go looking for an interactive ancestor … the stories show it" | TRUE | **U10**: rg `closest(` → only this comment; stories :49-52 wire pointer/focus on DS Button (R7.1/R7.2 ok) | U10 | — |
| C-HDR-SidebarWithHoverIcon-5 | src/components/SidebarWithHoverIcon/SidebarWithHoverIcon.tsx:24-26 | "Durations and easing are tokens on `.ds-sidebar-rail`, including the reduced-motion case" | TRUE | **U10**: index.css:765-776; tokens.css:345-347 | U10 | — |
| C-HDR-SidebarWithHoverIcon-6 | src/components/SidebarWithHoverIcon/SidebarWithHoverIcon.tsx:27-30 | "`d` … in JSX only for the FIRST render" | TRUE | **U10**: :96-97, :115, :138 | U10 | — |
| C-HDR-SidebarWithHoverIcon-7 | src/components/SidebarWithHoverIcon/SidebarWithHoverIcon.tsx:31-32 | "One `getComputedStyle` pair per frame per icon" | STALE | **U10**: one call per frame (:110), two property reads (:111-114); the code's own comment :107 says "One style resolution per frame" (U10-F13) | U10 | U10-F13 |
| C-HDR-SidebarWithHoverIcon-8 | src/components/SidebarWithHoverIcon/SidebarWithHoverIcon.tsx:35-38 | "self-terminating … where `@property` is unsupported the values jump, the loop writes the final path on its first frame and stops" | TRUE | **U10**: :116-119 | U10 | — |

### HDR-Sticker — `src/components/Sticker/Sticker.tsx` (11)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-HDR-Sticker-1 | src/components/Sticker/Sticker.tsx:5-6 | "`variant` maps through `stickerVariants` onto the content colour and the wash" | TRUE | **U12**: Sticker.tsx:38-45, 119 | U12 | — |
| C-HDR-Sticker-2 | src/components/Sticker/Sticker.tsx:6-7 | "the wash is a color-mix at the sticker opacity" | FALSE | **U12** [FALSE (dark danger `#ffffff`; dark secondary ignores its opacity token)]: tokens.css:711-718 → U12-F2 | U12 | U12-F2 |
| C-HDR-Sticker-3 | src/components/Sticker/Sticker.tsx:7 | "the component does not apply alpha a second time" | TRUE | **U12**: Sticker.tsx:31-56 (no opacity utility) | U12 | — |
| C-HDR-Sticker-4 | src/components/Sticker/Sticker.tsx:8 | "`standard` hugs its label" | TRUE | **U12**: Sticker.tsx:33 `w-fit`, :47 `rounded-tight py-sticker-y` (no fixed height) | U12 | — |
| C-HDR-Sticker-5 | src/components/Sticker/Sticker.tsx:8-9 | "`micro` is a fixed `--ui-height-tab-micro` chip with the mini radius" | TRUE | **U12**: Sticker.tsx:48 `h-tab-micro rounded-mini`; index.css:350-351; theme.css:121 | U12 | — |
| C-HDR-Sticker-6 | src/components/Sticker/Sticker.tsx:9 | "Paints do not change" (with size) | TRUE | **U12**: Sticker.tsx:46-49 (no colour classes in size map) | U12 | — |
| C-HDR-Sticker-7 | src/components/Sticker/Sticker.tsx:10-12 | children "wrapped in a row with `gap-xs`"; "wrapper is layout, not an interactive element" | TRUE | **U12** [TRUE (as description; necessity disputed → U12-F10)]: Sticker.tsx:131 | U12 | U12-F10 |
| C-HDR-Sticker-8 | src/components/Sticker/Sticker.tsx:13-15 | `custom`: `color` inline is content colour; wash at `--ui-sticker-bg-opacity` | TRUE | **U12**: Sticker.tsx:111-128 | U12 | — |
| C-HDR-Sticker-9 | src/components/Sticker/Sticker.tsx:18-20 | (constraint) wash alpha not baked into a hex | FALSE | **U12** [FALSE for dark danger (opaque hex, not opacity-driven)]: tokens.css:718 → U12-F1/F2 | U12 | U12-F1, U12-F2 |
| C-HDR-Sticker-10 | src/components/Sticker/Sticker.tsx:21 | "`custom` with no `color` throws" | TRUE | **U12**: Sticker.tsx:104-109 | U12 | — |
| C-HDR-Sticker-11 | src/components/Sticker/Sticker.tsx:22-23 | "The prop union is the real guard" | TRUE | **U12**: tsc on scratch/U12/tsc/check.tsx → line 2 TS2322 (custom w/o color), line 3 TS2322 (color on prominent) | U12 | — |

### HDR-svgPath — `src/components/MorphRotationShape/engine/svgPath.ts` (5)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-HDR-svgPath-1 | src/components/MorphRotationShape/engine/svgPath.ts:5-7 | "parse to cubics -> first continuous sub-path -> detectFeatures -> PolygonValidator.fix" | TRUE | **U10**: :170-183 (plus the documented fixSharpCornerConvexity step) | U10 | — |
| C-HDR-svgPath-2 | src/components/MorphRotationShape/engine/svgPath.ts:8-9 | "Output is in 0..1 units, scaled by the source viewBox … centred at (0.5, 0.5)" | TRUE | **U10**: :185-187 | U10 | — |
| C-HDR-svgPath-3 | src/components/MorphRotationShape/engine/svgPath.ts:12-14 | "Normalize by the viewBox, never by the path's own bounds … (Pentagon is 23 units tall)" | TRUE | **U10**: :185-186; PENTAGON_SHAPE_PATH y spans -0.288..23 (PentagonShape.tsx:4). Autoplay's `frame.normalized()` (MorphRotationShape.tsx:135) is the loader fit, not a frame mode (R12.11 ok) | U10 | — |
| C-HDR-svgPath-4 | src/components/MorphRotationShape/engine/svgPath.ts:15-19 | "Deviation from upstream … fixSharpCornerConvexity re-derives it" | TRUE | **U10**: :135-156, :183 | U10 | — |
| C-HDR-svgPath-5 | src/components/MorphRotationShape/engine/svgPath.ts:20 | "Arc commands are not ported; they throw. No DS shape uses them." | TRUE | **U10**: :50; 0 of the 12 `_SHAPE_PATH` strings contain `a`/`A` | U10 | — |

### HDR-Toggle — `src/components/Toggle/Toggle.tsx` (5)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-HDR-Toggle-1 | src/components/Toggle/Toggle.tsx:4-5 | single-select row of Toggle Options (two or more) | TRUE | **U6**: Toggle.tsx:95 `type="single"`; stories Custom (3 items) | U6 | — |
| C-HDR-Toggle-2 | src/components/Toggle/Toggle.tsx:5 | renamed from TwoWayToggle / TwoWayToggleItem (BREAKING, major) | TRUE | **U6** [UNVERIFIABLE]: history, not present tense (R11.13); rg TwoWayToggle src → 0 · **HD** (unverifiable): Present-tense check: `git grep -c TwoWayToggle v5.3.0 -- src` → Toggle.tsx 9, stories 36; at HEAD only this header line and one codebase-skill mention → the rename happened and the old names are gone from code → TRUE. | U6 | — |
| C-HDR-Toggle-3 | src/components/Toggle/Toggle.tsx:8-11 | selection can never be cleared; root hands Radix a controlled value and drops "" | TRUE | **U6**: Toggle.tsx:84-89, 96 | U6 | — |
| C-HDR-Toggle-4 | src/components/Toggle/Toggle.tsx:12-13 | controlled and uncontrolled both work; controlled wins | TRUE | **U6**: Toggle.tsx:78-82, 87 | U6 | — |
| C-HDR-Toggle-5 | src/components/Toggle/Toggle.tsx:16-17 | (constraint) keep Radix fully controlled; don't pass defaultValue through | TRUE | **U6** [TRUE (honoured)]: defaultValue destructured at :69, never passed; `value={currentValue}` :96 | U6 | — |

### HDR-toggleOption — `src/components/Toggle/toggleOption.ts` (7)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-HDR-toggleOption-1 | src/components/Toggle/toggleOption.ts:2-3 | shared by TabsTrigger and ToggleSwitchItem | TRUE | **U6**: Tabs.tsx:11,28,44; Toggle.tsx:34,129 | U6 | — |
| C-HDR-toggleOption-2 | src/components/Toggle/toggleOption.ts:6-7 | selected:/unselected: (index.css @custom-variant) match data-state=active and =on | TRUE | **U6**: index.css:12-13 | U6 | — |
| C-HDR-toggleOption-3 | src/components/Toggle/toggleOption.ts:8-12 | unselected look is one shared look (transparent, no border, text-text, ghost hover/active) | TRUE | **U6**: toggleOption.ts:28-29, 33 | U6 | — |
| C-HDR-toggleOption-4 | src/components/Toggle/toggleOption.ts:13-15 | `unselected` variant renders it whatever the Radix state, hover/press ungated | TRUE | **U6**: toggleOption.ts:46 (no `selected:` classes) | U6 | — |
| C-HDR-toggleOption-5 | src/components/Toggle/toggleOption.ts:16 | disabled drops any fill; opacity from ds-disabled-control | TRUE | **U6**: toggleOption.ts:32, 34 | U6 | — |
| C-HDR-toggleOption-6 | src/components/Toggle/toggleOption.ts:19-20 | (constraint) neutral module, no "use client" | TRUE | **U6** [TRUE (honoured)]: no directive in file | U6 | — |
| C-HDR-toggleOption-7 | src/components/Toggle/toggleOption.ts:21 | (constraint) never prefix a package class with a variant | TRUE | **U6** [TRUE (honoured)]: toggleOption.ts:50-62, 31-32 unprefixed | U6 | — |

### HDR-useChangeSwap — `src/components/AnimatedText/useChangeSwap.ts` (7)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-HDR-useChangeSwap-1 | src/components/AnimatedText/useChangeSwap.ts:8-10 | opaque children with no changeKey never animate | TRUE | **U3**: useChangeSwap.ts:112 | U3 | — |
| C-HDR-useChangeSwap-2 | src/components/AnimatedText/useChangeSwap.ts:11-14 | returns exiting{node,key,onAnimationEnd}/entering{key,animating,onAnimationEnd} | TRUE | **U3**: useChangeSwap.ts:146-160 | U3 | — |
| C-HDR-useChangeSwap-3 | src/components/AnimatedText/useChangeSwap.ts:17-21 | no duration, timer, rAF, transitionend | TRUE | **U3**: grep (only comment hits) | U3 | — |
| C-HDR-useChangeSwap-4 | src/components/AnimatedText/useChangeSwap.ts:22-26 | render-phase reconcile with `source` guard | TRUE | **U3**: useChangeSwap.ts:106-121 | U3 | — |
| C-HDR-useChangeSwap-5 | src/components/AnimatedText/useChangeSwap.ts:27-30 | exit keyed by counter, entering by content key | TRUE | **U3**: useChangeSwap.ts:152,156 | U3 | — |
| C-HDR-useChangeSwap-6 | src/components/AnimatedText/useChangeSwap.ts:31-34 | halves retired independently, each guarded on its id | TRUE | **U3**: useChangeSwap.ts:130-144 | U3 | — |
| C-HDR-useChangeSwap-7 | src/components/AnimatedText/useChangeSwap.ts:35-37 | ignores bubbled animationend | TRUE | **U3**: useChangeSwap.ts:131,140 | U3 | — |

### HDR-UserMessageHeader — `src/components/AIChat/UserMessageHeader.tsx` (2)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-HDR-UserMessageHeader-1 | src/components/AIChat/UserMessageHeader.tsx:5 | surface card; children flow straight in | TRUE | **U11**: :21-28 | U11 | — |
| C-HDR-UserMessageHeader-2 | src/components/AIChat/UserMessageHeader.tsx:8 | "NOT sticky" | TRUE | **U11**: no `sticky` class | U11 | — |

### HDR-VerificationCodeInput — `src/components/VerificationCode/VerificationCodeInput.tsx` (5)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-HDR-VerificationCodeInput-1 | src/components/VerificationCode/VerificationCodeInput.tsx:5-6 | length (default 6) cells; value+onChange or defaultValue | TRUE | **U6**: :50, 62-68, 141 | U6 | — |
| C-HDR-VerificationCodeInput-2 | src/components/VerificationCode/VerificationCodeInput.tsx:7 | digits only; auto-advance, backspace to previous, arrows, paste | TRUE | **U6** [TRUE (positional bug U6-F11)]: :41, 86-92, 98-119, 122-131 | U6 | U6-F11 |
| C-HDR-VerificationCodeInput-3 | src/components/VerificationCode/VerificationCodeInput.tsx:8 | hasError paints every cell; disabled disables all | TRUE | **U6**: :148-149 | U6 | — |
| C-HDR-VerificationCodeInput-4 | src/components/VerificationCode/VerificationCodeInput.tsx:11 | (constraint) glyphs via CodeDigitInput → BaseText (18 / medium / body) | TRUE | **U6** [TRUE (honoured)]: CodeDigitInput.tsx:62-65; BaseText.tsx:64 default `TextVariant.body` | U6 | — |
| C-HDR-VerificationCodeInput-5 | src/components/VerificationCode/VerificationCodeInput.tsx:12-13 | (constraint) no package-level verification section | TRUE | **U6** [TRUE (honoured)]: only story composition (stories:68-116) | U6 | — |

### JSDOC-add-use-client — `scripts/add-use-client.mjs` (2)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-JSDOC-add-use-client-1 | scripts/add-use-client.mjs:11-12 | scan src for modules "whose first lines carry" the directive, "kept in lockstep with the component files" | FALSE | **U2** [FALSE in effect]: :40 5-line window vs header-first files (U2-F1) | U2 | U2-F1, ~U3-F1 |
| C-JSDOC-add-use-client-2 | scripts/add-use-client.mjs:16-17 | "Pure modules (cn, types, icons, BaseText, Shapes) never match" | TRUE | **U2**: §2 | U2 | — |

### JSDOC-AIChat.constants — `src/components/AIChat/constants.ts` (3)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-JSDOC-AIChat.constants-1 | src/components/AIChat/constants.ts:1-2 | server-safe, no `"use client"` | TRUE | **U11**: file; dist constants.js line 1 `import {` | U11 | — |
| C-JSDOC-AIChat.constants-2 | src/components/AIChat/constants.ts:7-11 | simple: settled rows lift + reveal meta; skill: no hover, no meta | TRUE | **U11**: AIToolPart.tsx:58,74,49 | U11 | — |
| C-JSDOC-AIChat.constants-3 | src/components/AIChat/constants.ts:22-24 | deliberately NOT the SDK's part states | TRUE | **U11**: values active/complete/error | U11 | — |

### JSDOC-AIChatStreaming.stories — `src/components/AIChat/AIChatStreaming.stories.tsx` (3)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-JSDOC-AIChatStreaming.stories-1 | src/components/AIChat/AIChatStreaming.stories.tsx:4 | "Nothing here ships (tsup excludes *.stories.tsx)" | TRUE | **U11**: tsup.config.ts entry `'!src/**/*.stories.tsx'` | U11 | — |
| C-JSDOC-AIChatStreaming.stories-2 | src/components/AIChat/AIChatStreaming.stories.tsx:15-16 | every clock ticked here (`useNow`), strings formatted here, context kept in range here | TRUE | **U11**: :335-353, :522-537 (`Math.min(…, CONTEXT_BUDGET)`) | U11 | — |
| C-JSDOC-AIChatStreaming.stories-3 | src/components/AIChat/AIChatStreaming.stories.tsx:19-20 | Streamdown's own word animation stays OFF | TRUE | **U11**: :364-368 passes no `animated` (streamdown index.d.ts `animated?: boolean \| AnimateOptions` is the opt-in) | U11 | — |

### JSDOC-AIModelSelect — `src/components/AIChat/AIModelSelect.tsx` (2)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-JSDOC-AIModelSelect-1 | src/components/AIChat/AIModelSelect.tsx:127-131 | step label rolls per stop crossed (RollChangeText keyed on step) | TRUE | **U11**: :154 `changeKey={current.value}` | U11 | — |
| C-JSDOC-AIModelSelect-2 | src/components/AIChat/AIModelSelect.tsx:196-199 | compose inside Tooltip/TooltipTrigger asChild | TRUE | **U11**: AIModelSelect.stories.tsx:116-130 | U11 | — |

### JSDOC-AIThinkingPart — `src/components/AIChat/AIThinkingPart.tsx` (1)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-JSDOC-AIThinkingPart-1 | src/components/AIChat/AIThinkingPart.tsx:179-180 | chevron down closed / up open via button's data-state | TRUE | **U11**: :168 Button `data-state`; css:441-450; DropdownIcon.tsx:6 path points up | U11 | — |

### JSDOC-AITurnSummary — `src/components/AIChat/AITurnSummary.tsx` (1)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-JSDOC-AITurnSummary-1 | src/components/AIChat/AITurnSummary.tsx:52-53 | explicit `aria-label={undefined}` would override CopyButton's default name | TRUE | **U11** [TRUE (CopyButton sets `aria-label` then spreads props)]: CopyButton.tsx:83 | U11 | — |

### JSDOC-Calendar.constants — `src/components/Calendar/constants.ts` (1)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-JSDOC-Calendar.constants-1 | src/components/Calendar/constants.ts:1-2 | "Server-safe constants — no client APIs, intentionally NO use client" | TRUE | **U7**: no directive; only import is server-safe dateUtils; no module-scope `new Date()` | U7 | — |

### JSDOC-cn — `src/utils/cn.ts` (1)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-JSDOC-cn-1 | src/utils/cn.ts:4-13 | registering `text-style-*` lets them coexist with colour utilities | FALSE | **U2** [TRUE for 8 roles; FALSE for hero-body/hero-button]: U2-F7 | U2 | U2-F7 |

### JSDOC-color — `src/utils/color.ts` (2)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-JSDOC-color-1 | src/utils/color.ts:1-2 | backs "(Slider, LinearProgressIndicator)" | STALE | **U2**: also Sticker.tsx:28, AIModelSelect.tsx:28 | U2 | ~U12-F19, ~U2-F12 |
| C-JSDOC-color-2 | src/utils/color.ts:4-5 | deliberately server-safe | TRUE | **U2**: no directive; chunk unstamped | U2 | — |

### JSDOC-copy-theme — `scripts/copy-theme.mjs` (1)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-JSDOC-copy-theme-1 | scripts/copy-theme.mjs:4-6 | copies theme.css into dist for publishing | TRUE | **U1** [TRUE but unreachable]: only via `build:css`, which `build` never runs → U1-F4 | U1 | U1-F4 |

### JSDOC-CopyButton.stories — `src/components/CopyButton/CopyButton.stories.tsx` (1)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-JSDOC-CopyButton.stories-1 | src/components/CopyButton/CopyButton.stories.tsx:24-27,50-52 | reverts after 2 s (`REVERT_MS`), timer resets on re-click; aria-live announces "Copied" | TRUE | **U4**: CopyButton.tsx:16,58-59,96-98 | U4 | — |

### JSDOC-dateUtils — `src/components/Calendar/dateUtils.ts` (1)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-JSDOC-dateUtils-1 | src/components/Calendar/dateUtils.ts:9 | "Never compare with `getTime()`" (module rule comment) | FALSE | **U7** [FALSE vs code]: U7-F9 | U7 | U7-F9 |

### JSDOC-dooph-component-tokens.css — `src/styles/dooph-component-tokens.css` (8)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-JSDOC-dooph-component-tokens.css-1 | src/styles/dooph-component-tokens.css:12 | "aria-invalid disabled pattern" | FALSE | **U1**: selector :13 `[aria-disabled="true"]` → U1-F8 | U1 | U1-F8 |
| C-JSDOC-dooph-component-tokens.css-2 | src/styles/dooph-component-tokens.css:115 | slider fill is "the handle color at 45%" | FALSE | **U1**: :121 token opacity 50/70/60% → U1-F8 | U1 | U1-F8, ~U6-F17 |
| C-JSDOC-dooph-component-tokens.css-3 | src/styles/dooph-component-tokens.css:126-127 | `--progress-pct` registration is what makes width/left interpolate | FALSE | **U1**: nothing transitions `--progress-pct`; the transitions are on `width`/`left` → U1-F8 | U1 | U1-F8, ~U9-F15 |
| C-JSDOC-dooph-component-tokens.css-4 | src/styles/dooph-component-tokens.css:413-418 | reveal is scoped to its own root class, not `.group`; `:focus-within` keeps revealed control reachable | TRUE | **U11**: css:419-436 | U11 | — |
| C-JSDOC-dooph-component-tokens.css-5 | src/styles/dooph-component-tokens.css:438-440 | DropdownIcon's own path points up | TRUE | **U11**: Icons/DropdownIcon.tsx:6 `M6 15l6 -6l6 6` | U11 | — |
| C-JSDOC-dooph-component-tokens.css-6 | src/styles/dooph-component-tokens.css:477-487 | gated on attribute; lists animate via items; granularity is the block | TRUE | **U11**: css:488-492 | U11 | — |
| C-JSDOC-dooph-component-tokens.css-7 | src/styles/dooph-component-tokens.css:494-504 | textarea padding lives beside the calc; `1lh` floor | TRUE | **U11**: css:505-509 | U11 | — |
| C-JSDOC-dooph-component-tokens.css-8 | src/styles/dooph-component-tokens.css:541-549 | prose in `utilities` (load-bearing); Streamdown emits `text-sm`/`text-xl`/`list-inside`/`my-4` | TRUE | **U11**: utilities layer opens at :11 and closes at :668; streamdown dist grep: text-sm 21, text-xl 1, list-inside 2, my-4 7 · **U1** [TRUE (reasoning)]: same layer, (0,1,1) vs (0,1,0) | U1, U11 | — |

### JSDOC-DropdownMenu — `src/components/Menu/DropdownMenu.tsx` (2)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-JSDOC-DropdownMenu-1 | src/components/Menu/DropdownMenu.tsx:191-194 | menuItemClassName lets non-Radix surfaces "render visually identical items"; "Internal: not re-exported from src/index.ts" | FALSE | **U7** [FALSE (first part) / TRUE (second)]: disabled styling is Radix-only (U7-F14); Menu/index.ts does not export it | U7 | U7-F14, ~U7-F2 |
| C-JSDOC-DropdownMenu-2 | src/components/Menu/DropdownMenu.tsx:290-292 | plain `opacity-100` loses to Checkbox's own `ds-radix-data-disabled` rule (Checkbox.tsx:46) | TRUE | **U5**: src/components/Checkbox/Checkbox.tsx:46 `"ds-radix-data-disabled",` | U5 | — |

### JSDOC-generate-icon-exports — `scripts/generate-icon-exports.mjs` (1)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-JSDOC-generate-icon-exports-1 | scripts/generate-icon-exports.mjs:22-36 | hard-fails when a file doesn't export a const matching its filename | TRUE | **U2** [TRUE (substring check `source.includes('export const X')`)]: :22-35 `process.exit(1)` | U2 | — |

### JSDOC-generate-shape-morph-ease — `scripts/generate-shape-morph-ease.mjs` (1)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-JSDOC-generate-shape-morph-ease-1 | scripts/generate-shape-morph-ease.mjs:1-4 | writes between markers; runs in `npm run build` | TRUE | **U2**: tokens.css:266-269; package.json:50 | U2 | — |

### JSDOC-index.css — `src/styles/index.css` (6)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-JSDOC-index.css-1 | src/styles/index.css:16 | `--progress-pct` registration is what makes width/left interpolate | FALSE | **U1**: nothing transitions `--progress-pct`; the transitions are on `width`/`left` → U1-F8 | U1 | U1-F8 |
| C-JSDOC-index.css-2 | src/styles/index.css:215-221 | text-style-* in `components`; nothing sets line-height | TRUE | **U1**: index.css:223-320 | U1 | — |
| C-JSDOC-index.css-3 | src/styles/index.css:756-764 | sidebar reduced motion "durations go to zero … writes the final path once and stops" | TRUE | **U10**: index.css:772-776; the sampler is started by a layout effect, not transitionrun (tsx:102-130), so 0ms is safe here, unlike MorphRotationShape | U10 | — |
| C-JSDOC-index.css-4 | src/styles/index.css:786-788 | "Reduced motion shortens the transition to 1ms rather than 0 … Autoplay and passive spinning stop outright" | TRUE | **U10**: index.css:806-814 | U10 | — |
| C-JSDOC-index.css-5 | src/styles/index.css:935-941 | ds-spinner-rotate is for "the wavy LoadingSpinner", "only referenced by WavySpinner" | FALSE | **U1**: only user LoadingSpinner.tsx:260 (SpokesSpinner) → U1-F8 | U1 | U1-F8, ~U9-F2 |
| C-JSDOC-index.css-6 | src/styles/index.css:936-937 | keyframes outside @layer so inline-style animations can reach them | TRUE | **U1** [TRUE (placement)]: all 15 @keyframes top level, index.css:921-1045 | U1 | — |

### JSDOC-init — `bin/init.mjs` (1)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-JSDOC-init-1 | bin/init.mjs:10-18 | asks dirs, copies skills/, prints import; does NOT modify project files/configure/install | TRUE | **U2**: :101-130,147-155 | U2 | — |

### JSDOC-main — `.storybook/main.ts` (1)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-JSDOC-main-1 | .storybook/main.ts:9-10 | "CI sets STORYBOOK_BASE_PATH to the repo subpath" | TRUE | **U2**: deploy-storybook.yml:34-35 | U2 | — |

### JSDOC-Modal — `src/components/Modal/Modal.tsx` (1)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-JSDOC-Modal-1 | src/components/Modal/Modal.tsx:41-42 | "Raw modal primitive — no internal padding or flex layout" | TRUE | **U8**: Modal.tsx:68-79 | U8 | — |

### JSDOC-OutlineButton — `src/components/OutlineButton/OutlineButton.tsx` (3)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-JSDOC-OutlineButton-1 | src/components/OutlineButton/OutlineButton.tsx:24 | "Mirrors the `themeInverse` pattern on Tooltip." | FALSE | **U4** [FALSE (prop is spelled `inverseTheme`)]: U4-F13 | U4 | U4-F13 |
| C-JSDOC-OutlineButton-2 | src/components/OutlineButton/OutlineButton.tsx:28-32,53-58 | glowing: bottom-anchored, no cursor tracking; hover mode: orbs track cursor at different speeds | TRUE | **U4**: OutlineButton.tsx:105,125,185,199,258,279 | U4 | — |
| C-JSDOC-OutlineButton-3 | src/components/OutlineButton/OutlineButton.tsx:217,223 | "translateX = gx * bw − 50%"; "Orb 2 tracks the diagonally opposite point (1−gx, 1−gy)" | STALE | **U4**: OutlineButton.tsx:254,275; U4-F20 | U4 | U4-F20 |

### JSDOC-OutlineSection — `src/components/OutlineSection/OutlineSection.tsx` (3)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-JSDOC-OutlineSection-1 | src/components/OutlineSection/OutlineSection.tsx:7 | "A double-border container shell" | TRUE | **U12**: OutlineSection.tsx:22, 30 | U12 | — |
| C-JSDOC-OutlineSection-2 | src/components/OutlineSection/OutlineSection.tsx:8 | "Outer ring: dashed/thin border" | FALSE | **U12**: OutlineSection.tsx:22 `border-solid` → U12-F9 | U12 | U12-F9 |
| C-JSDOC-OutlineSection-3 | src/components/OutlineSection/OutlineSection.tsx:8 | "Inner card: bg-secondary surface with shadow" | TRUE | **U12**: OutlineSection.tsx:30-31 | U12 | — |

### JSDOC-preview — `.storybook/preview.ts` (1)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-JSDOC-preview-1 | .storybook/preview.ts:33-38 | LoadingSpinner and ProgressIndicator declare their own `argTypes.color` | TRUE | **U2**: LoadingSpinner.stories.tsx:19, ProgressIndicator.stories.tsx:21 | U2 | — |

### JSDOC-preview-head — `.storybook/preview-head.html` (2)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-JSDOC-preview-head-1 | .storybook/preview-head.html:2-3 | "This file is NEVER shipped" | TRUE | **U2**: package.json:35-39 | U2 | — |
| C-JSDOC-preview-head-2 | .storybook/preview-head.html:14-15 | every axis named by a `--ui-font-var-*` token present as a range, uppercase-first order | TRUE | **U2**: tokens.css:429-436 name wdth/GRAD/ROND/slnt/MONO; URL `GRAD,ROND,opsz,slnt,wdth,wght@0..100,0..100,6..144,-10..0,25..151,1..1000` and `MONO,ital,wght@0..1,0,300..800` | U2 | — |

### JSDOC-ProgressIndicator — `src/components/ProgressIndicator/ProgressIndicator.tsx` (2)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-JSDOC-ProgressIndicator-1 | src/components/ProgressIndicator/ProgressIndicator.tsx:47 | "Throws in development if the value is outside this range" | FALSE | **U9**: PI.tsx:292-296 unconditional (U9-F9) | U9 | U9-F9 |
| C-JSDOC-ProgressIndicator-2 | src/components/ProgressIndicator/ProgressIndicator.tsx:79-80 | both arcs carry a CSS transition (300ms cubic-bezier) | TRUE | **U9**: PI.tsx:151, 165 | U9 | — |

### JSDOC-ProgressIndicator.constants — `src/components/ProgressIndicator/constants.ts` (1)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-JSDOC-ProgressIndicator.constants-1 | src/components/ProgressIndicator/constants.ts:12-14 | wavy = "Polar sine-wave arc ... point count changes" | FALSE | **U9**: WG.ts:157-161 (U9-F9) | U9 | U9-F9, ~U9-F11 |

### JSDOC-rangeSelection — `src/components/Calendar/rangeSelection.ts` (1)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-JSDOC-rangeSelection-1 | src/components/Calendar/rangeSelection.ts:3 | cites "research doc §10.3" for restart-on-click | TRUE | **U7**: research:580 heading "10.3 Range interaction — restart on click (FINAL)" | U7 | — |

### JSDOC-release-package — `.github/workflows/release-package.yml` (2)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-JSDOC-release-package-1 | .github/workflows/release-package.yml:43 | trusted publisher "Repo: dooph-Design-System" | FALSE | **U2**: .git/config:9 remote `dooph.-Design-System` | U2 | ~U2-F12 |
| C-JSDOC-release-package-2 | .github/workflows/release-package.yml:45 | "use the TOKEN FALLBACK below" | FALSE | **U2**: no such step; file ends :48 (U2-F12a) | U2 | ~U2-F12 |

### JSDOC-ShapeMorphSpinner — `src/components/ShapeMorphSpinner/ShapeMorphSpinner.tsx` (2)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-JSDOC-ShapeMorphSpinner-1 | src/components/ShapeMorphSpinner/ShapeMorphSpinner.tsx:2-4 | MorphRotationShape in `autoplay` mode with role="progressbar", spinner size scale, spinner colour aliases | TRUE | **U9**: SMS.tsx:33-36, 58-67 | U9 | — |
| C-JSDOC-ShapeMorphSpinner-2 | src/components/ShapeMorphSpinner/ShapeMorphSpinner.tsx:4-5 | sizes render from `--ui-size-spinner-*` (never a JS size table), so overriding the tokens resizes it | TRUE | **U9**: SMS.tsx:65-66; MRS sizes nothing itself (MRS.tsx:28-29, 346, 350) | U9 | — |

### JSDOC-shapeMorphSpring — `scripts/shapeMorphSpring.mjs` (1)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-JSDOC-shapeMorphSpring-1 | scripts/shapeMorphSpring.mjs:1-5 | "The ONLY place its constants live … no component reads these values" | TRUE | **U2**: Grep: MorphRotationShape.tsx:37 mentions it in a comment only | U2 | — |

### JSDOC-Sheet — `src/components/Sheet/Sheet.tsx` (5)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-JSDOC-Sheet-1 | src/components/Sheet/Sheet.tsx:23-26 | SheetOverlay "Shares the backdrop token + fade behavior with `ModalOverlay`"; "Durations match the panel slide" | TRUE | **U8**: Sheet.tsx:36-38 vs Modal.tsx:28-30 (token + fade shared; durations 300/200 = panel's 300/200) | U8 | — |
| C-JSDOC-Sheet-2 | src/components/Sheet/Sheet.tsx:50-53 | panel enters from 20% offset, 300ms decelerating; exits 20% back, 200ms accelerating | TRUE | **U8**: Sheet.tsx:73-74,82-94 | U8 | — |
| C-JSDOC-Sheet-3 | src/components/Sheet/Sheet.tsx:56-58 | arbitrary property used because `animation-timing-function` "has no unambiguous utility (core `ease-*` targets transitions)" | TRUE | **U8** [TRUE (qualified)]: tailwindcss-animate/index.js:98-100 does add `ease-*` → `animationTimingFunction`, emitted alongside core's transition rule exactly as the `duration-*` utilities on the same line already are (dist-styles.css `duration-300` emits both) | U8 | — |
| C-JSDOC-Sheet-4 | src/components/Sheet/Sheet.tsx:60-61 | same surface/border/shadow tokens as ModalContent; border only on inner edge | TRUE | **U8**: Sheet.tsx:70-71,81-93 vs Modal.tsx:71-73 | U8 | — |
| C-JSDOC-Sheet-5 | src/components/Sheet/Sheet.tsx:63-65 | default cross-axis size is "width for left/right, height for top/bottom", "fully overridable via `className`" | FALSE | **U8** [FALSE (height) / PARTLY (width)]: no height class for top/bottom (Sheet.tsx:89,93); `max-w-96` caps a consumer width unless `max-w-none` is added (Sheet.stories.tsx:153) — U8-F15 | U8 | U8-F15 |

### JSDOC-Sheet.constants — `src/components/Sheet/constants.ts` (1)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-JSDOC-Sheet.constants-1 | src/components/Sheet/constants.ts:1-2 | "Server-safe constants … intentionally NO \"use client\"" | TRUE | **U8**: no directive; dist/components/Sheet/constants.js starts with `import { SheetSide } from "../../chunk-…"` (no directive) | U8 | — |

### JSDOC-spinnerGeometry — `src/components/LoadingSpinner/spinnerGeometry.ts` (3)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-JSDOC-spinnerGeometry-1 | src/components/LoadingSpinner/spinnerGeometry.ts:4-11 | two size spaces: user units (viewBox) vs rendered `cssSize` token | TRUE | **U9**: SG.ts:115-146; LS.tsx:190-194 | U9 | — |
| C-JSDOC-spinnerGeometry-2 | src/components/LoadingSpinner/spinnerGeometry.ts:49-51 | "Matches Material Design's indeterminate circular progress timing (1.4 s)" | FALSE | **U9**: SG.ts:52 `= 1800` (F19 item 1) | U9 | U9-F19 |
| C-JSDOC-spinnerGeometry-3 | src/components/LoadingSpinner/spinnerGeometry.ts:68-69 | spokes durations ≈ 1092/1280/1544/1726 ms | TRUE | **U9**: 1280·√(16/22)=1092; √(32/22)→1544; √(40/22)→1726 | U9 | — |

### JSDOC-Sticker.constants — `src/components/Sticker/constants.ts` (6)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-JSDOC-Sticker.constants-1 | src/components/Sticker/constants.ts:1-2 | server-safe, no "use client" | TRUE | **U12**: grep → only the comment mentions it | U12 | — |
| C-JSDOC-Sticker.constants-2 | src/components/Sticker/constants.ts:9-11 | secondary washes the secondary button's active border; danger washes danger-secondary, content danger-primary | FALSE | **U12** [TRUE light / FALSE dark (danger)]: tokens.css:600, 612, 626-628 vs 717-718 | U12 | ~U12-F2 |
| C-JSDOC-Sticker.constants-3 | src/components/Sticker/constants.ts:11-13 | wash alpha is 20% except light secondary (`-opacity-secondary`) | FALSE | **U12** [TRUE light / FALSE dark danger (no alpha)]: tokens.css:602-603, 718 | U12 | ~U12-F2 |
| C-JSDOC-Sticker.constants-4 | src/components/Sticker/constants.ts:15-19 | `custom` REQUIRES `color`; compile error + runtime throw | TRUE | **U12**: tsc check (above); Sticker.tsx:104 | U12 | — |
| C-JSDOC-Sticker.constants-5 | src/components/Sticker/constants.ts:35 | `standard` "6px vertical padding, tight radius" | TRUE | **U12**: tokens.css:633; Sticker.tsx:47 | U12 | — |
| C-JSDOC-Sticker.constants-6 | src/components/Sticker/constants.ts:36 | `micro` "fixed `--ui-height-tab-micro` (28px) chip with `radius-mini`" | TRUE | **U12**: tokens.css:477, 538 | U12 | — |

### JSDOC-sync-theme — `scripts/sync-theme.mjs` (4)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-JSDOC-sync-theme-1 | scripts/sync-theme.mjs:5 | generated output is the block inside index.css | STALE | **U1**: also writes theme.css (:305) → U1-F3 | U1 | U1-F3 |
| C-JSDOC-sync-theme-2 | scripts/sync-theme.mjs:8 | wired into `npm run prebuild` | FALSE | **U1**: package.json has no prebuild; `build` runs `sync-tokens` → U1-F3 | U1 | U1-F3 |
| C-JSDOC-sync-theme-3 | scripts/sync-theme.mjs:13 | rules in `TOKEN_MAP` | FALSE | **U1**: no such identifier; `toThemeEntry` (:170) → U1-F3 | U1 | U1-F3 |
| C-JSDOC-sync-theme-4 | scripts/sync-theme.mjs:61,145,157,163 | EXCLUDED group rationales | FALSE | **U1** [FALSE (4)]: text-style-* are @layer components; menu widths back ds-* helpers; opacity not used in arbitrary values; focus-ring colours used by outline helpers → U1-F3 | U1 | U1-F3 |

### JSDOC-Table — `src/components/Table/Table.tsx` (1)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-JSDOC-Table-1 | src/components/Table/Table.tsx:1-3 | no "use client": no hooks, `onSort` passthrough, may import client `Button` | TRUE | **U12**: Table.tsx (no hooks); Button.tsx:23 `"use client"` | U12 | — |

### JSDOC-Table.constants — `src/components/Table/constants.ts` (1)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-JSDOC-Table.constants-1 | src/components/Table/constants.ts:1-2 | server-safe, re-exported via index.ts, imported by Table.tsx | TRUE | **U12**: Table/index.ts:9; Table.tsx:12 | U12 | — |

### JSDOC-theme.css — `src/styles/theme.css` (2)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-JSDOC-theme.css-1 | src/styles/theme.css:4 | "AUTO-GENERATED by scripts/sync-theme.mjs. Do not edit by hand." | TRUE | **U1**: sync-theme.mjs:282-305 writes it; baseline: rebuild byte-identical | U1 | — |
| C-JSDOC-theme.css-2 | src/styles/theme.css:13-17 | preset makes `p-md, gap-sm, rounded-normal, font-label, bg-primary` generate; values from styles.css at runtime | TRUE | **U1**: probe compile (scratch/U1/consumer-out.css) — but it also remaps container widths → U1-F1 | U1 | U1-F1 |

### JSDOC-Toast — `src/components/Toast/Toast.tsx` (1)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-JSDOC-Toast-1 | src/components/Toast/Toast.tsx:21-22 | `*Types` "lives in ./constants (server-safe), re-exported via index.ts" | TRUE | **U8**: Tooltip/index.ts:9; Toast/index.ts:11 | U8 | — |

### JSDOC-Toast.constants — `src/components/Toast/constants.ts` (1)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-JSDOC-Toast.constants-1 | src/components/Toast/constants.ts:1-2 | "Server-safe constants … intentionally NO \"use client\"" | TRUE | **U8**: no directive; dist/components/Sheet/constants.js starts with `import { SheetSide } from "../../chunk-…"` (no directive) | U8 | — |

### JSDOC-tokens.css — `src/styles/tokens.css` (10)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-JSDOC-tokens.css-1 | src/styles/tokens.css:5-6 | light palette on `:root` and `.light` (same declarations) | TRUE | **U1**: tokens.css:17-18 `:root,\n.light {` | U1 | — |
| C-JSDOC-tokens.css-2 | src/styles/tokens.css:10-11 | "There is NO `prefers-color-scheme` remapping here" | TRUE | **U1**: `rg prefers-color-scheme src/styles` → only the comment itself | U1 | — |
| C-JSDOC-tokens.css-3 | src/styles/tokens.css:45-47 | prominent family "has no .dark override at all" | TRUE | **U1**: tokens.mjs: no `--ui-color-prominent*` in `.dark` | U1 | — |
| C-JSDOC-tokens.css-4 | src/styles/tokens.css:73-75,105-106 | danger-button and selection tokens are all aliases, so no `.dark` block | TRUE | **U1**: tokens.css:76-85, 107-108; none in `.dark` | U1 | — |
| C-JSDOC-tokens.css-5 | src/styles/tokens.css:150-151 | prominent identity trio is mode-invariant | TRUE | **U1**: no `--ui-prominent-color*` in `.dark` (tokens.css:642-724) | U1 | — |
| C-JSDOC-tokens.css-6 | src/styles/tokens.css:173-178 | tool row "reads at full ghost-active weight", thinking row at ghost | FALSE | **U11** [TRUE while animating; FALSE under reduced motion]: F8 | U11 | U11-F8 |
| C-JSDOC-tokens.css-7 | src/styles/tokens.css:205-207 | "The component reads it back from computed style, so this token is the only place the cap lives" | FALSE | **U1** [FALSE / TRUE]: only-place TRUE (dooph-component-tokens.css:508 max-height); "reads it back from computed style" FALSE — AIPromptInput.tsx:192-196 sets height = scrollHeight and lets CSS max-height bound it (its own header :17-19 says so) → U1-F8 · **U11**: F9 | U1, U11 | U1-F8, U11-F9 |
| C-JSDOC-tokens.css-8 | src/styles/tokens.css:403-405 | "Mono matches the button role's size and weight by aliasing them" | TRUE | **U1**: tokens.css:406 `var(--ui-text-body)` (the size text-style-button uses, index.css:227), :420 `var(--ui-weight-button)` | U1 | — |
| C-JSDOC-tokens.css-9 | src/styles/tokens.css:531-535 | radius roles "tight / standard / soft" | STALE | **U1**: token is `--ui-radius-normal` (:539); `-mini` unlisted → U1-F8 | U1 | U1-F8 |
| C-JSDOC-tokens.css-10 | src/styles/tokens.css:707-710 | dark secondary sticker wash does not use the secondary opacity | TRUE | **U1**: tokens.css:712-716 uses `--ui-sticker-bg-opacity` (and so :711 is inert → U1-F16) | U1 | U1-F16 |

### JSDOC-Tooltip — `src/components/Tooltip/Tooltip.tsx` (1)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-JSDOC-Tooltip-1 | src/components/Tooltip/Tooltip.tsx:12-13 | `*Types` "lives in ./constants (server-safe), re-exported via index.ts" | TRUE | **U8**: Tooltip/index.ts:9; Toast/index.ts:11 | U8 | — |

### JSDOC-Tooltip.constants — `src/components/Tooltip/constants.ts` (1)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-JSDOC-Tooltip.constants-1 | src/components/Tooltip/constants.ts:1-2 | "Server-safe constants … intentionally NO \"use client\"" | TRUE | **U8**: no directive; dist/components/Sheet/constants.js starts with `import { SheetSide } from "../../chunk-…"` (no directive) | U8 | — |

### JSDOC-tsup.config — `tsup.config.ts` (5)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-JSDOC-tsup.config-1 | tsup.config.ts:7-11 | both CSS assets regenerated together on any path that runs tsup | TRUE | **U2**: tsup.config.ts:54-57 | U2 | — |
| C-JSDOC-tsup.config-2 | tsup.config.ts:26-32 | "interactive components keep the directive at the top of THEIR chunk" | FALSE | **U2** [FALSE for 16 modules]: U2-F1 | U2 | U2-F1 |
| C-JSDOC-tsup.config-3 | tsup.config.ts:36-38 | splitting keeps modules as separate chunks | TRUE | **U2**: 250 ESM chunks, 0 multi-source (§2) | U2 | — |
| C-JSDOC-tsup.config-4 | tsup.config.ts:40-45 | metafile gives the stamp an input→output map; stamp runs in onSuccess | TRUE | **U2**: add-use-client.mjs:85-111; pack.txt has no metafile (removed at :114-117) | U2 | — |
| C-JSDOC-tsup.config-5 | tsup.config.ts:49-53 | tsup `treeshake` would strip directives | TRUE | **U2** [UNVERIFIABLE]: not re-built with treeshake · **HD** (unverifiable): scratch/HD/rt/run.cjs: rollup 4.60.2 (tsup's treeshake path) bundling a `"use client"` module warns `MODULE_LEVEL_DIRECTIVE … "use client" … was ignored` and emits no directive → TRUE. | U2 | — |

### JSDOC-waveGeometry.test — `src/components/ProgressIndicator/waveGeometry.test.ts` (1)

| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |
|---|---|---|---|---|---|---|
| C-JSDOC-waveGeometry.test-1 | src/components/ProgressIndicator/waveGeometry.test.ts:3-5 | "required by the zero-dependency Node test command" | FALSE | **U9**: no test command in package.json (U9-F13) | U9 | U9-F13, ~U2-F10 |

## 2. Resolved conflicts

A conflict = two or more units graded the same claim differently (or one unit graded two halves of a merged claim differently). Each was re-verified against the code at b436647; method in the last column. "policy" rows harmonise the P-5.4 label; "split" rows are halves of one unit row that HD separated.

| C-ID | path:line | claim | unit verdicts | resolved | kind | method |
|---|---|---|---|---|---|---|
| C-CB-11 | .agents/skills/dooph-ds-codebase/SKILL.md:34 | index.css ← "Tailwind build entry: @import chain, generated @theme inline block, text-style-* role classes (@layer components), h-button/si… | U1 STALE (incomplete); U14 TRUE | STALE | conflict | U1 STALE vs U14 TRUE. Every listed item is present, but index.css now also holds `.ds-*` rules (e.g. ds-shimmer-text :369), 15 `@keyframes`, 6 `@property`, 2 `@custom-variant`, while CB:36 places ds-* helpers in dooph-component-tokens.css. At the commit that wrote the line (21d2236) index.css had 1 `@keyframes` and 0 `.ds-` rules (`git show 21d2236:src/styles/index.css \| grep -c`), so the description drifted → STALE. |
| C-CB-30 | .agents/skills/dooph-ds-codebase/SKILL.md:103-107 | `.claude/skills/` = 3 symlinks + loading-indicators real copy | U14 STALE/incomplete (8 entries: +vm symlink, 2 absolute junctions, skill-; U2 UNVERIFIABLE (not in U2 scope; git core.symlinks=false, see codebase:6 | STALE | conflict | U2 UNVERIFIABLE (out of scope) vs U14 STALE. `git ls-files -s .claude/skills` → 4 mode-120000 links + 66 regular files: the map lists 3 symlinks + 1 real copy; the vm symlink, fhc/visx (absolute junctions on disk, regular files in git) and skill-creator are missing → STALE. |
| C-CB-33 | .agents/skills/dooph-ds-codebase/SKILL.md:110-112 | what each listed script does (generate-icon-exports "regenerates Icons/index.ts from svg components"; sync-theme; copy-theme "used by build… | U14 TRUE; U2 FALSE; U1 TRUE | TRUE | conflict | U2 FALSE (":110 reads *Icon.tsx, not svg") vs U14 TRUE. `ls src/components/Icons` → only `*Icon.tsx` (SVG React components), Icons.stories.tsx, index.ts — no `.svg` files; generator filters `^[A-Z][A-Za-z0-9]*Icon\.tsx$` (generate-icon-exports.mjs:9-13). "svg components" = those SVG components → TRUE (wording loose, not false). copy-theme part TRUE (U1). |
| C-CB-44 | .agents/skills/dooph-ds-codebase/SKILL.md:138 | "`danger` replaced `destructive` in v3, and `prominent` replaced `brand` in 5.4" | U4 UNVERIFIABLE (history; no old keys remain) | FALSE | policy | P-5.4. v3 half TRUE (`git grep -o destructive`/`danger` in Button: v2.1.0 15/0, v3.0.0 0/15); "prominent replaced brand in 5.4" names an unreleased version → FALSE (label). |
| C-CB-46 | .agents/skills/dooph-ds-codebase/SKILL.md:140 | "each one `<path d>` lifted verbatim from the Figma export kept alongside in `Shapes/svgs/`" | U10 FALSE; U4 TRUE (per-shape "verbatim from Figma" UNVERIFIABLE here — Shapes unit) | FALSE | conflict | U4 left the per-shape "verbatim from Figma" part UNVERIFIABLE (Shapes unit); U10 ran scratch/U10/verify-shape-svgs.mjs: Pentagon and Puff `d` strings differ from svgs/, no star.svg → FALSE. |
| C-CB-47 | .agents/skills/dooph-ds-codebase/SKILL.md:140 | "`GemShape` was REMOVED in 5.4; do not reintroduce it" | U10 TRUE; U4 TRUE (per-shape "verbatim from Figma" UNVERIFIABLE here — Shapes unit) | FALSE | policy | P-5.4. U10 graded the removal (TRUE: `rg -i gem` → only `--ui-color-ai-gemini`); U13/U14 grade identical "…in 5.4" claims FALSE because no 5.4 exists (`git tag` tops at v5.3.0; package.json 5.3.0). Event TRUE, version label FALSE → FALSE (label). |
| C-CB-178 | .agents/skills/dooph-ds-codebase/SKILL.md:498 | "The 5.4 pass realigned nearly every name with Figma" | U1 UNVERIFIABLE | FALSE | policy | P-5.4 → FALSE (label: "the 5.4 pass" is unreleased); the Figma-realignment half stays UNVERIFIABLE (committed Figma exports predate it, U1-F13). |
| C-CB-198 | .agents/skills/dooph-ds-codebase/SKILL.md:542 | ds-slider-fill = 45% of --ds-slider-color | U6 STALE; U1 FALSE | STALE | conflict | U1 FALSE vs U6 STALE. `git show v5.3.0:src/styles/dooph-component-tokens.css` :111-117 → `var(--ds-slider-color, …) 45%`; HEAD :117-124 uses `--ds-slider-track-opacity` per-variant tokens → was true at v5.3.0 → STALE (the skill's own CB:279-281 already says "no longer 45%"). |
| C-CB-199 | .agents/skills/dooph-ds-codebase/SKILL.md:542 | `.ds-slider-dot` inactive = `--ui-color-secondary-border` | U6 TRUE; U1 TRUE / FALSE | TRUE | split | U1:525 graded inactive+active together (TRUE/FALSE); inactive half: `--ui-color-slider-step-inactive` → `var(--ui-color-secondary-border)` (tokens.css:509) → TRUE. |
| C-CB-200 | .agents/skills/dooph-ds-codebase/SKILL.md:542 | `.ds-slider-dot[data-active]` = `--ui-color-text` at 40% | U6 STALE; U1 TRUE / FALSE | STALE | conflict | U1 FALSE vs U6 STALE. v5.3.0 dooph-component-tokens.css:141-143 `color-mix(in srgb, var(--ui-color-text) 40%, transparent)`; HEAD :154-158 `--ds-slider-step-active`/`--ui-color-slider-step-primary-active` → STALE. |
| C-CB-216 | .agents/skills/dooph-ds-codebase/SKILL.md:588-592 | build = icons → sync-tokens → tsup | U14 STALE (omits generate-shape-morph-ease, add-use-client); U2 FALSE | STALE | conflict | U2 FALSE vs U14 STALE. The pipeline block was written in 21d2236 (2026-06-11, `git log -S`); add-use-client joined onSuccess in ebb0b52 (2026-06-24) and generate-shape-morph-ease joined `build` in 5036a8f (2026-09-29) → accurate when written → STALE. |
| C-CB-230 | .agents/skills/dooph-ds-codebase/SKILL.md:640-641 | "Every component with consts follows this, except `Avatar` and `BaseIcon`, which declare theirs inline in server-safe modules — equivalent" | U2 FALSE (incomplete); U10 FALSE; U12 TRUE as fact (Avatar.tsx and BaseIcon.tsx have no directive); "equival | FALSE | conflict | U12 TRUE (checked only Avatar/BaseIcon) vs U2/U10 FALSE. `src/components/Shapes/index.ts:15 export const Shapes = {` and no Shapes/constants.ts (`ls`) → a third exception → FALSE. |
| C-ARCH-14 | .agents/skills/dooph-ds-architecture/SKILL.md:101-107 | "`SliderVariant.custom` … enforced by making the props a discriminated union (`CalendarProps` is the other example). Pair it with an uncond… | U7 FALSE for Calendar; U14 TRUE, incomplete (StickerVariant.custom + throw: Sticker.tsx:104-107) | FALSE | conflict | U14 TRUE ("examples exist") vs U7 FALSE. `grep -n throw src/components/Calendar/Calendar.tsx` → none; CalendarProps discriminates on `mode`, not a no-defaults bundle member, and Calendar only `console.warn`s in dev (Calendar.tsx:61-122). As an example of the union+throw pairing the sentence describes, it is FALSE; the list is also incomplete (StickerVariant.custom + throw, Sticker.tsx:104-107). |
| C-ARCH-35 | .agents/skills/dooph-ds-architecture/SKILL.md:317-321 | "Existing families: `--ui-roll-hover-*`, `--ui-roll-change-*`, `--ui-fade-change-*`, `--ui-underline-link-*`, `--ui-rolling-digits-*`, `--u… | U1 STALE; U14 STALE (omits reveal-change, chat); U10 TRUE | STALE | conflict | U1/U14 STALE vs U10 TRUE (U10 checked only that the listed families exist). tokens.css defines `--ui-reveal-change-*` and `--ui-chat-*` motion tokens (19 lines, `grep -c`) absent from the list → STALE. |
| C-LI-9 | .agents/skills/dooph-ds-loading-indicators/SKILL.md:24-27 | enum keys: LoadingSpinnerVariant flat/spokes; LoadingSpinnerColor primary/prominent (+arbitrary); LoadingSpinnerSize sm/rg/md/xl = 16/22/32… | U9 TRUE; U14 TRUE (canonical); FALSE in .claude copy (`.brand`) | TRUE | split | U14:672 graded canonical TRUE and .claude copy FALSE; this row is the canonical doc → TRUE (LoadingSpinner/constants.ts:16-19). |
| C-LI-40 | .agents/skills/dooph-ds-loading-indicators/SKILL.md:220 | `ds-spinner-rotate` in index.css is the ONLY loading-indicator keyframe; used by spokes; `ds-spinner-arc` removed | U9 STALE; U1 TRUE | STALE | conflict | U1 TRUE vs U9 STALE. li:8 counts ShapeMorphSpinner in the family; it animates on `ds-shape-morph-clock`/`ds-shape-morph-spin` (index.css:798, 803, 921). v5.3.0 index.css has 0 "shape-morph" hits → the sentence was true before 5036a8f → STALE. |
| C-LIC-2 | .claude/skills/dooph-ds-loading-indicators/SKILL.md:25 | `LoadingSpinnerColor.primary / .brand` (the .claude copy; canonical says `.prominent`) | U9 FALSE; U14 TRUE (canonical); FALSE in .claude copy (`.brand`) | FALSE | split | .claude copy half of U14:672 + U9 → FALSE (`LoadingSpinnerColor` has no `brand` key). |
| C-USAGE-63 | skills/dooph-design-system-usage/SKILL.md:380-382 | OutlineButton: both `glowColor1/2` default to `--ui-prominent-color-alt`; override per instance | U4 TRUE; U13 UNVERIFIABLE here (component unit) | TRUE | unverifiable | U13 UNVERIFIABLE (component unit) vs U4 TRUE: OutlineButton.tsx:133-134 `glowColor1 ?? "var(--ui-prominent-color-alt)"` (same for 2) → TRUE. |
| C-V5-10 | skills/dooph-design-system-v5-migration/SKILL.md:93-97 | new in v5 exports | U13 TRUE; U7 UNVERIFIABLE here (release history; U13 scope) | TRUE | conflict | U7 UNVERIFIABLE vs U13 TRUE. `git ls-tree`/`git grep` per tag: all of Popover, Calendar, DatePicker, VerificationCodeInput, SidebarWithHoverIcon, RollingDigitsText, MonoText, SubheadingText, `tabular?:` absent at v4.8.2, present at v5.1.0 (the first five already at v5.0.0) → TRUE for the v5 line. |
| C-README-5 | README.md:30-33 | interactive components ship a per-module `"use client"` "preserved into the published bundle", so they import directly into a Server Compon… | U2 FALSE; U13 TRUE per baseline (48 chunks stamped); runtime `next build` not run | FALSE | conflict | U13 TRUE (baseline stamp count) vs U2 FALSE. dist chunk-4SBJJVN3.js (FadeChangeText) begins `import {` — no directive; 24 ESM chunks stamped vs 40 source directives (add-use-client.mjs:40 scans 5 lines; orchestrator O11) → FALSE. |
| C-README-6 | README.md:44 | "`next build` runs with no `createContext is not a function` error" | U2 FALSE (plausible; not run under Next); U13 TRUE per baseline (48 chunks stamped); runtime `next build` not run | FALSE | conflict | U13 TRUE vs U2 FALSE. Static: dist/chunk-6QQ7EYYD.js:32 `var PromptInputContext = createContext(null);` at module scope, no directive, imported by dist/index.js (`grep -c` = 1) → a Server Component importing the root evaluates it. Not executed under `next build` (none available) — FALSE on static evidence. |
| C-README-7 | README.md:45-47 | pure exports (text, icons, shapes, variant enums, `cn`) stay server-safe | U2 TRUE; U13 TRUE per baseline (48 chunks stamped); runtime `next build` not run | TRUE | split | U13 umbrella TRUE; U2 TRUE for this part (none of those chunks stamped, U2 §2). |
| (excluded) | .agents/skills/dooph-ds-contribution/SKILL.md:65 | necessary wrapper "is `aria-hidden` and absolutely positioned" | U4 TRUE for the orbs; U14 FALSE for sanctioned wrappers | excluded | conflict | Classed as a normative rule (RC-2, U14-F11): the disagreement is about whether the rule fits arch:232-235, not about a fact. |

Conflicts resolved: 15 unit-vs-unit + 1 dissolved by exclusion; 3 P-5.4 harmonisations; 4 split rows. Unresolved: 0.

## 3. UNVERIFIABLE re-checks

Every claim a unit marked UNVERIFIABLE (wholly or in part), plus anything still UNVERIFIABLE after HD. "still UNVERIFIABLE" rows say why no in-repo check exists.

| C-ID | path:line | claim | unit verdict(s) | HD result | method / reason |
|---|---|---|---|---|---|
| C-CB-30 | .agents/skills/dooph-ds-codebase/SKILL.md:103-107 | `.claude/skills/` = 3 symlinks + loading-indicators real copy | U14 STALE/incomplete (8 entries: +vm symlink, 2 absolute junctions, skill-; U2 UNVERIFIABLE (not in U2 scope; git core.symlinks=false, see codebase:6 | STALE | U2 UNVERIFIABLE (out of scope) vs U14 STALE. `git ls-files -s .claude/skills` → 4 mode-120000 links + 66 regular files: the map lists 3 symlinks + 1 real copy; the vm symlink, fhc/visx (absolute junctions on disk, regular files in git) and skill-creator are missing → STALE. |
| C-CB-44 | .agents/skills/dooph-ds-codebase/SKILL.md:138 | "`danger` replaced `destructive` in v3, and `prominent` replaced `brand` in 5.4" | U4 UNVERIFIABLE (history; no old keys remain) | FALSE | P-5.4. v3 half TRUE (`git grep -o destructive`/`danger` in Button: v2.1.0 15/0, v3.0.0 0/15); "prominent replaced brand in 5.4" names an unreleased version → FALSE (label). |
| C-CB-90 | .agents/skills/dooph-ds-codebase/SKILL.md:223 | known multi-select typeahead limitation | U5 UNVERIFIABLE (runtime behaviour; consistent with DT:91-96) | TRUE | Static: @radix-ui/react-menu dist/index.mjs:452-461 item `onPointerMove` → `item.focus()`; :314 content keydown → `handleTypeaheadSearch` → after pointer-toggling, keystrokes reach typeahead → TRUE. |
| C-CB-102 | .agents/skills/dooph-ds-codebase/SKILL.md:237 | "unsuffixed `slide-*` resolves to 0.25rem in Tailwind v4" | U8 UNVERIFIABLE | FALSE | Compiled `slide-in-from-right` with tailwindcss 4.3.3 + tailwindcss-animate 1.0.7 (scratch/HD/tw/, `@tailwindcss/cli`): `.slide-in-from-right { --tw-enter-translate-x: 100%; }` — 100%, not 0.25rem → FALSE. |
| C-CB-119 | .agents/skills/dooph-ds-codebase/SKILL.md:292-293 | padding the root itself does nothing | U6 UNVERIFIABLE | TRUE | Static: @radix-ui/react-slider dist/index.mjs:208/275 map the pointer against `getBoundingClientRect()` (border box, includes padding) and :491 place the thumb at `calc(${percent}% + offset)` of the root → padding the root does not inset travel → TRUE. |
| C-CB-125 | .agents/skills/dooph-ds-codebase/SKILL.md:306 | remainder hides via `data-hidden` once `pct >= 100` "so it never overlaps the 0% nub" | U9 TRUE (mechanism) / UNVERIFIABLE (rationale) | TRUE | Mechanism TRUE (LinearProgressIndicator.tsx:70-72 `data-hidden` when pct >= 100); the rationale follows from it — a hidden remainder cannot overlap the nub — so the claim as a whole is TRUE. |
| C-CB-162 | .agents/skills/dooph-ds-codebase/SKILL.md:451 | components never use `var(--ui-*)` directly in className strings | U1 UNVERIFIABLE here (component units) | FALSE | `grep -rn --include=*.tsx "var(--ui-" src` (non-story) → Slider.tsx:344 `h-[var(--ui-height-slider-handle)]`, :368, :380, :408 — raw `var(--ui-*)` inside className arbitrary values → FALSE. |
| C-CB-178 | .agents/skills/dooph-ds-codebase/SKILL.md:498 | "The 5.4 pass realigned nearly every name with Figma" | U1 UNVERIFIABLE | FALSE | P-5.4 → FALSE (label: "the 5.4 pass" is unreleased); the Figma-realignment half stays UNVERIFIABLE (committed Figma exports predate it, U1-F13). |
| C-ARCH-22 | .agents/skills/dooph-ds-architecture/SKILL.md:221 | asChild via Slot on Button, DropdownTrigger, TextDropdownTrigger, OutlineButton, ShapeButton | U4 Button TRUE; OutlineButton/ShapeButton FALSE (throw); Dropdown/TextDro; U5 FALSE | FALSE | Resolved by merge: another unit verified it (see evidence). |
| C-CONTRIB-1 | .agents/skills/dooph-ds-contribution/SKILL.md:16 | Figma tool is `mcp__Figma__get_design_context` | U14 UNVERIFIABLE (name depends on the user's MCP server registration; no . | still UNVERIFIABLE | Tool name depends on the MCP server registration; no .mcp.json in repo. In this session the Figma server is registered under a UUID prefix (`mcp__31b6d641-…__get_design_context`), so the literal name does not resolve here. |
| C-LI-28 | .agents/skills/dooph-ds-loading-indicators/SKILL.md:141 | `<circle>` seam artefact rationale | U9 UNVERIFIABLE | still UNVERIFIABLE | Rendering rationale (why `<circle>` shows a seam); needs a render comparison of a removed implementation. |
| C-LI-45 | .agents/skills/dooph-ds-loading-indicators/SKILL.md:263-267 | "at rest they match the static Shape exactly"; ~9% spill; 31px frame / `inset-[2.5px]` / 26px shape | U10 UNVERIFIABLE / TRUE | still UNVERIFIABLE | Numbers TRUE (spill 2.5/26 ≈ 9.6%, 31px frame, `inset-[2.5px]`); "match the static Shape exactly" — same reason as MorphRotationShape.tsx:22-26. |
| C-VM-2 | .agents/skills/dooph-ds-writing-version-migrations/SKILL.md:17,311 | `superpowers:writing-skills` exists | U14 UNVERIFIABLE from repo (external plugin; present in this session) | TRUE | `superpowers:writing-skills` is listed among this session's available skills (external plugin; not checkable from the repo alone). |
| C-FHC-EVAL-1 | .agents/skills/file-header-contracts/references/evaluation.md | experiment results | U14 UNVERIFIABLE (external runs) | still UNVERIFIABLE | Experiment results from runs outside the repo. |
| C-USAGE-14 | skills/dooph-design-system-usage/SKILL.md:127-129 | `VerificationCodeInput` `length` default 6; `CodeDigitInput` single cell | U13 TRUE (type) / UNVERIFIABLE (default); U6 TRUE | TRUE | U13 default half UNVERIFIABLE; VerificationCodeInput.tsx:50 `length = 6` (U6 same) → TRUE. |
| C-USAGE-63 | skills/dooph-design-system-usage/SKILL.md:380-382 | OutlineButton: both `glowColor1/2` default to `--ui-prominent-color-alt`; override per instance | U4 TRUE; U13 UNVERIFIABLE here (component unit) | TRUE | U13 UNVERIFIABLE (component unit) vs U4 TRUE: OutlineButton.tsx:133-134 `glowColor1 ?? "var(--ui-prominent-color-alt)"` (same for 2) → TRUE. |
| C-V5-1 | skills/dooph-design-system-v5-migration/SKILL.md:10-15 | three breaking changes, two silent | U13 UNVERIFIABLE vs v4.8.2→v5.0.0 (not re-inventoried; out of the HEAD que | TRUE | Export-name diff (`git grep -o "export (const\|function) X"` v4.8.2 vs v5.3.0) removes only `SiloIcon` (generateWavyArcPath was internal); `--ui-color-danger*` 19→0 at v5.0.0; `BarChartIcon` repurposed + `BarChartAxesIcon` added. Two of three are silent. Caveat: the icon renames shipped in 5.1.0, not 5.0.0; prop-level changes not inventoried. |
| C-V5-10 | skills/dooph-design-system-v5-migration/SKILL.md:93-97 | new in v5 exports | U13 TRUE; U7 UNVERIFIABLE here (release history; U13 scope) | TRUE | U7 UNVERIFIABLE vs U13 TRUE. `git ls-tree`/`git grep` per tag: all of Popover, Calendar, DatePicker, VerificationCodeInput, SidebarWithHoverIcon, RollingDigitsText, MonoText, SubheadingText, `tabular?:` absent at v4.8.2, present at v5.1.0 (the first five already at v5.0.0) → TRUE for the v5 line. |
| C-CONTRIBUTING-1 | CONTRIBUTING.md:4 | PRs not accepted | U13 UNVERIFIABLE (policy) | still UNVERIFIABLE | Policy statement ("PRs not accepted"); nothing in the repo can confirm or refute a policy. |
| C-SECURITY-1 | SECURITY.md:5 | only latest release gets fixes | U13 UNVERIFIABLE (policy) | still UNVERIFIABLE | Policy statement (supported versions). |
| C-NOTICES-1 | THIRD_PARTY_NOTICES.md:10-42 | icon libraries collectively | U13 UNVERIFIABLE (provenance not tracked per icon, as stated) | still UNVERIFIABLE | Per-icon provenance is not recorded in the repo (the notice says so itself). |
| C-SKILLSLOCK-1 | skills-lock.json:4-9,22-27 | fhc and visx from dooph-software/dooph-skills | U14 consistent (no local provenance to contradict) | still UNVERIFIABLE | U14 "consistent (no local provenance to contradict)" is not a verification; upstream provenance is external → UNVERIFIABLE. |
| C-SKILLSLOCK-2 | skills-lock.json:8,14,20,26 | computedHash values | U14 UNVERIFIABLE (sha256 of SKILL.md does not match; algorithm unknown) | still UNVERIFIABLE | sha256 of SKILL.md does not match; the hashing algorithm of the skills CLI is not documented in-repo. |
| C-SKILLSLOCK-4 | skills-lock.json:16-21 | skill-creator from anthropics/skills | U14 consistent (Apache-2.0 LICENSE.txt present) | still UNVERIFIABLE | Consistent with skill-creator/LICENSE.txt (Apache-2.0) but upstream provenance is external → UNVERIFIABLE. |
| C-HDR-AIContextGauge-4 | src/components/AIChat/AIContextGauge.tsx:15 | "their stream keeps running if this throws inside it" | U11 UNVERIFIABLE (consumer runtime) | still UNVERIFIABLE | Depends on where the consumer keeps the stream relative to its error boundary; not a property of this code. |
| C-HDR-Button-5 | src/components/Button/Button.tsx:19-20 | "`prominent` was called `brand` ... Neither spelling survives." | U4 TRUE for keys/tokens (history part UNVERIFIABLE); story export names s | TRUE | Present-tense half verified (no `brand` key/token in src); history half needs no check. |
| C-HDR-ChatDivider-2 | src/components/AIChat/ChatDivider.tsx:8-9 | rules take leftover width so the label stays centred; Figma pins 120px | U11 TRUE / UNVERIFIABLE (Figma) | TRUE | Layout half TRUE (ChatDivider.tsx:28 `flex-1` on both rules); "Figma pins 120px" not checkable without the Figma file (not in repo). |
| C-HDR-cubic-2 | src/components/MorphRotationShape/engine/cubic.ts:7-9 | "Keep this file a faithful port. Behaviour fixes belong in ../svgPath.ts" | U10 FALSE (path) / UNVERIFIABLE (faithfulness) | FALSE | Path half FALSE (`../svgPath.ts` → the file is `./svgPath.ts`, engine/ sibling); faithfulness to upstream f4d2697 stays UNVERIFIABLE (no upstream copy offline; `git log` shows no edits since vendoring). |
| C-HDR-MorphRotationShape-5 | src/components/MorphRotationShape/MorphRotationShape.tsx:22-26 | fit per mode; "at rest the shape is pixel-identical to the static Shapes component" | U10 TRUE / UNVERIFIABLE | still UNVERIFIABLE | Fit-per-mode half TRUE (geometry.ts:68-73). "Pixel-identical to the static Shapes component" needs a raster diff; construction differs (static: path ×23/24 + 1-unit round-join stroke, BaseShape.tsx:45-48,55; morph: raw path fill), so identity cannot be asserted statically. |
| C-HDR-Toggle-2 | src/components/Toggle/Toggle.tsx:5 | renamed from TwoWayToggle / TwoWayToggleItem (BREAKING, major) | U6 UNVERIFIABLE | TRUE | Present-tense check: `git grep -c TwoWayToggle v5.3.0 -- src` → Toggle.tsx 9, stories 36; at HEAD only this header line and one codebase-skill mention → the rename happened and the old names are gone from code → TRUE. |
| C-JSDOC-tsup.config-5 | tsup.config.ts:49-53 | tsup `treeshake` would strip directives | U2 UNVERIFIABLE | TRUE | scratch/HD/rt/run.cjs: rollup 4.60.2 (tsup's treeshake path) bundling a `"use client"` module warns `MODULE_LEVEL_DIRECTIVE … "use client" … was ignored` and emits no directive → TRUE. |

Re-checked: 31; now verified: 19; still UNVERIFIABLE: 12.

## 4. Single-unit verdicts re-graded by HD

Not conflicts (one unit only), but the unit's verdict word was not one of the four, or HD's re-reading changed it.

| C-ID | path:line | claim | unit verdict | HD verdict | reason |
|---|---|---|---|---|---|
| C-CB-122 | .agents/skills/dooph-ds-codebase/SKILL.md:306 | LinearProgressIndicator backed by `@radix-ui/react-progress` "(v3)" | U9 FALSE | TRUE | Single-unit verdict questioned: U9 read "(v3)" as the react-progress major (package.json `^1.1.16`). In this file "(v3)" is the "v3 addition" label (CB:15-17 explains the labels; same form at CB:138 "`ButtonSize` (v3)"); LinearProgressIndicator is listed as new in v3 (v3-migration:220-224). TRUE as a label, but the label is ambiguous — worth removing with the other v3 labels. |
| C-SKILLSLOCK-1 | skills-lock.json:4-9,22-27 | fhc and visx from dooph-software/dooph-skills | U14 consistent (no local provenance to contradict) | UNVERIFIABLE | U14 "consistent (no local provenance to contradict)" is not a verification; upstream provenance is external → UNVERIFIABLE. |
| C-SKILLSLOCK-3 | skills-lock.json:10-15 | radix-ui-design-system from sickn33/antigravity-awesome-skills | U14 CONTRADICTED by the skill's own frontmatter `source: self` | FALSE | U14 "CONTRADICTED": the lock says sickn33/antigravity-awesome-skills; radix SKILL.md:6 says `source: self` — the two records cannot both be true; graded FALSE as recorded provenance (U14-F14). |
| C-SKILLSLOCK-4 | skills-lock.json:16-21 | skill-creator from anthropics/skills | U14 consistent (Apache-2.0 LICENSE.txt present) | UNVERIFIABLE | Consistent with skill-creator/LICENSE.txt (Apache-2.0) but upstream provenance is external → UNVERIFIABLE. |
| C-PROMPT-1 | executor-prompt-oss-publication.md:25-30 | repo state: UNLICENSED, GitHub Packages, orientation/composition skills | U14 FALSE now (all tasks since done) | STALE | U14 "FALSE now (all tasks since done)": a task prompt describing the repo state when written → STALE. |
| C-PROMPT-2 | executor-prompt-oss-publication.md:38 | no Storybook deploy | U14 superseded | STALE | U14 "superseded" → STALE (.github/workflows/deploy-storybook.yml exists). |

## 5. Rows not in the register

### 5a. Excluded — rules, templates, plans, omissions, non-claims (30)

| unit row | source path:line | claim | unit verdict | why excluded |
|---|---|---|---|---|
| U11:495 | .agents/skills/dooph-ds-codebase/SKILL.md | (no section describes AIChat) | OMISSION | omission, not a claim (no AIChat section) — U11-F10 |
| U11:496 | skills/dooph-design-system-usage/SKILL.md | (no section describes AIChat) | OMISSION | omission, not a claim (no AIChat section) — U11-F10, U13-F10 |
| U11:497 | CHANGELOG.md | (no AIChat mention) | OMISSION | omission, not a claim (no AIChat entry) — U11-F10, U13-F12 |
| U13:557 | README.md | component list | n/a — README has no component list; defers to Storybook | not a claim (README has no component list) |
| U13:558 | README.md | peer deps | not stated (react/react-dom >=19 in package.json:57-60) | not a claim (README states no peer deps) |
| U14:698 | .agents/skills/file-header-contracts/references/human-approval-hook.md | hook for gated files | n/a — no gated files in repo | not a claim (hook doc; no gated files in repo) |
| U14:626 | .agents/skills/dooph-ds-codebase/SKILL.md:656-658 | `.claude/` and `.agent/` meant to be symlinks | intent only; reality mixed, .agent has 3/9 | statement of intent ("meant to be symlinks"), not a factual claim; reality in C-CB rows 103-107/653-661 — U14-F5 |
| U14:655 | .agents/skills/dooph-ds-contribution/SKILL.md:29-34,70 | file tree vs constants.ts rule | inconsistent | normative template inconsistency (file-tree template vs checklist) — U14-F8 |
| U14:656 | .agents/skills/dooph-ds-contribution/SKILL.md:56 | radius utilities list | ambiguous | normative list (RC-5) — U14-F13 |
| U14:657 | .agents/skills/dooph-ds-contribution/SKILL.md:65 | necessary wrapper is aria-hidden + absolute | FALSE for sanctioned wrappers | normative rule (RC-2: what a necessary wrapper must be) — U14-F11 |
| U4:612 | .agents/skills/dooph-ds-contribution/SKILL.md:65 | necessary wrapper "is `aria-hidden` and absolutely positioned (like OutlineButton's blur orbs)" | TRUE for the orbs; the children wrapper (arch:234) is neithe | normative rule (RC-2) — U14-F11 (U4 graded TRUE for the orbs, U14 FALSE for sanctioned wrappers: conflict dissolves once classed as a rule) |
| U14:658 | .agents/skills/dooph-ds-contribution/SKILL.md:78 | story template `checked="indeterminate"` | teaches string literal | normative story template (teaches string literal) — U14-F8 |
| U14:661 | .agents/skills/dooph-ds-contribution/SKILL.md:100 | breaking changes as top-of-file comment | conflicts with fhc:173 | normative rule (RC-3) — U14-F12 |
| U14:695 | .agents/skills/file-header-contracts/SKILL.md:137-154 | example Button contract | FALSE vs current Button.tsx:1-22 and arch:32 | normative example contract (RC-6) — U14-F2 |
| U14:721 | executor-prompt-oss-publication.md:56-73 | package.json gains `bugs` | not done (no `bugs` field) | plan/instruction in a task prompt ("package.json gains bugs"), not a claim |
| U14:724 | 2026-09-20-visx-charts-design.md:659 | release as "Minor — 5.5" | presumes the unreleased 5.4 | plan ("release as Minor — 5.5"), not a claim — presumes unreleased 5.4 (U14-F4) |
| U3:498 | .agents/skills/dooph-ds-architecture/SKILL.md:111-115 | design-value props inline; role defaults as classes | TRUE | rule R1.7 (arch:111-115) |
| U3:499 | .agents/skills/dooph-ds-architecture/SKILL.md:119 | const keys camelCase | TRUE (scope) | rule R1.8 (arch:119) |
| U3:500 | .agents/skills/dooph-ds-architecture/SKILL.md:120 | const and derived type share an identifier | FALSE for Fonts, FontSizes, FontWeights, Tracking, FontAxes | rule R1.9 (arch:120) — violation is U3-F4 |
| U3:501 | .agents/skills/dooph-ds-architecture/SKILL.md:121 | re-exported from src/index.ts | TRUE | rule R1.10 (arch:121) |
| U14:641 | .agents/skills/dooph-ds-architecture/SKILL.md:122 | only exceptions shape/side/selectType | FALSE | rule R1.11 (arch:122) — violation/RC-1 is U14-F10, U7-F6 |
| U7:461 | .agents/skills/dooph-ds-architecture/SKILL.md:122 | `variant`/`size` naming, "The only exceptions are ... `shape`, `side`, `selectType`" | FALSE (list incomplete) | rule R1.11 (arch:122) — U7-F6 |
| U8:501 | .agents/skills/dooph-ds-architecture/SKILL.md:122 | `side` (SheetContent) is a sanctioned non-`variant` prop name | TRUE (TooltipTypes/ToastTypes use `variant`, so no further e | rule R1.11 (arch:122) |
| U5:463 | .agents/skills/dooph-ds-architecture/SKILL.md:167-182 | Content portalled by default with `portal`/`portalProps` escape hatch | TRUE | rule R2.9 (arch:167-182) — ModalContent/SheetContent violation is U8-F4 |
| U8:502 | .agents/skills/dooph-ds-architecture/SKILL.md:167 | "Overlay/floating content defaults to portalled … Always expose an escape hatch" | FALSE for ModalContent/SheetContent (always portal, no hatch | rule R2.9 (arch:167) — U8-F4 |
| U10:594 | .agents/skills/dooph-ds-architecture/SKILL.md:336-347 | escape hatch: register numbers, transition in a `ds-*` class with tokens, targets inline, self-terminating rAF, "no dur… | TRUE for both components | rule (Rule 6 escape hatch, arch:336-347); compliance TRUE for both components |
| U9:557 | .agents/skills/dooph-ds-loading-indicators/SKILL.md:234-242 | anti-patterns (gray wave track, sampled partial wave, wave in LoadingSpinner, circle+dashoffset flat spinner, CSS anima… | TRUE (all honoured) | anti-pattern rules (li:234-242); compliance TRUE |
| U10:591 | .agents/skills/dooph-ds-loading-indicators/SKILL.md:268-271 | anti-patterns (no clamp, no bounds-normalize in frame modes, no React `d` after first render, 1ms not 0 under reduced m… | TRUE (code complies) | anti-pattern rules (li:268-271); compliance TRUE |
| U6:839 | src/components/VerificationCode/CodeDigitInput.tsx:12 | (constraint) prefer composing through VerificationCodeInput | UNVERIFIABLE | constraint with no factual part ("prefer composing") — U6-F26 |
| U9:573 | .agents/skills/dooph-ds-codebase/SKILL.md:644-646 | adding a component means consts + types in the folder `index.ts` | FALSE for this family | procedure ("Adding a component means …"), not a claim — the defect (3 folders without index.ts) is U9-F12/U2-F14 |

Also skipped: the 8 rows of U14's "Rulebook conflicts RC-1..RC-7" table (rulebook conflicts, not claims; RC-1…RC-7 all CONFIRMED by U14, R4.2 refuted — HD concurs with the R4.2 refutation: `.text-style-button` sizes from `--ui-text-body`, index.css:227).

### 5b. Dropped — pure history with no present-tense claim (4)

| unit row | source path:line | claim | unit verdict | note |
|---|---|---|---|---|
| U9:570 | .agents/skills/dooph-ds-codebase/SKILL.md:477-480 | before 5.x the tokens were inert | UNVERIFIABLE | cb:477-480 "before 5.x the tokens were inert" — pure history (git check agrees: v4.8.2 LoadingSpinner.tsx:186 `width={diameter}`) |
| U13:503 | skills/dooph-design-system-theming/references/token-contract.md:194-195 | before 5.x spinner tokens were inert | UNVERIFIABLE here (v4.8.2 had 4 `size-spinner` lines; inertn | tc:194-195 "before 5.x spinner tokens were inert" — pure history (same git check) |
| U14:684 | .agents/skills/dooph-ds-writing-version-migrations/SKILL.md:56-61 | v4.0.0 moved 4 consts to constants.ts, dropped "use client" from 3 modules | TRUE | vm:56-61 what v4.0.0 changed — pure history (U14 verified TRUE via `git diff --name-status v3.4.0 v4.0.0`) |
| U10:603 | scripts/shapeMorphSpring.mjs:14 | "Tuned in prototypes/shape-morph-loader on 2026-09-27" | UNVERIFIABLE | shapeMorphSpring.mjs:14 "Tuned in prototypes/shape-morph-loader on 2026-09-27" — provenance history; no prototypes/ in repo |

Kept although historical, because each implies a checkable present-tense fact: renames whose old name must now be absent (Toggle.tsx:5 TwoWayToggle; CB:211/USAGE:134-135 DropdownMenuCheckboxItem; CB:398 old icon sizes; CB:457 `--ui-min-w-menu-action`; CB:481-488 / TC:152-157 `rolling-money`; Button.tsx:19-20 `brand`), and "in 5.4" labels (graded under P-5.4).

## 6. Summary per source doc

| DOCKEY | source doc | claims | TRUE | FALSE | STALE | UNVERIFIABLE |
|---|---|---|---|---|---|---|
| CB | `.agents/skills/dooph-ds-codebase/SKILL.md` | 236 | 193 | 28 | 15 | 0 |
| ARCH | `.agents/skills/dooph-ds-architecture/SKILL.md` | 35 | 27 | 6 | 2 | 0 |
| CONTRIB | `.agents/skills/dooph-ds-contribution/SKILL.md` | 9 | 5 | 2 | 1 | 1 |
| LI | `.agents/skills/dooph-ds-loading-indicators/SKILL.md` | 50 | 39 | 4 | 5 | 2 |
| LIC | `.claude/skills/dooph-ds-loading-indicators/SKILL.md` | 4 | 0 | 4 | 0 | 0 |
| VM | `.agents/skills/dooph-ds-writing-version-migrations/SKILL.md` | 9 | 8 | 1 | 0 | 0 |
| FHC | `.agents/skills/file-header-contracts/SKILL.md` | 1 | 1 | 0 | 0 | 0 |
| FHC-SNIPPET | `.agents/skills/file-header-contracts/references/agents-md-snippet.md` | 1 | 1 | 0 | 0 | 0 |
| FHC-EVAL | `.agents/skills/file-header-contracts/references/evaluation.md` | 1 | 0 | 0 | 0 | 1 |
| AGENTS | `AGENTS.md` | 1 | 1 | 0 | 0 | 0 |
| USAGE | `skills/dooph-design-system-usage/SKILL.md` | 63 | 60 | 3 | 0 | 0 |
| RSM | `skills/dooph-design-system-usage/references/responsive-sheet-modal.md` | 8 | 8 | 0 | 0 | 0 |
| THEME | `skills/dooph-design-system-theming/SKILL.md` | 20 | 14 | 4 | 2 | 0 |
| TC | `skills/dooph-design-system-theming/references/token-contract.md` | 31 | 25 | 5 | 1 | 0 |
| V3 | `skills/dooph-design-system-v3-migration/SKILL.md` | 13 | 8 | 4 | 1 | 0 |
| V5 | `skills/dooph-design-system-v5-migration/SKILL.md` | 11 | 8 | 3 | 0 | 0 |
| V5CM | `skills/dooph-design-system-v5-migration/codemod.mjs` | 1 | 0 | 1 | 0 | 0 |
| README | `README.md` | 15 | 9 | 5 | 1 | 0 |
| CHANGELOG | `CHANGELOG.md` | 6 | 5 | 1 | 0 | 0 |
| CONTRIBUTING | `CONTRIBUTING.md` | 2 | 0 | 1 | 0 | 1 |
| SECURITY | `SECURITY.md` | 2 | 0 | 1 | 0 | 1 |
| NOTICES | `THIRD_PARTY_NOTICES.md` | 3 | 1 | 1 | 0 | 1 |
| LICENSE | `LICENSE.txt` | 1 | 1 | 0 | 0 | 0 |
| PKG | `package.json` | 1 | 1 | 0 | 0 | 0 |
| SKILLSLOCK | `skills-lock.json` | 4 | 0 | 1 | 0 | 3 |
| SPEC | `docs/superpowers/specs/2026-08-31-digits-sidebar-mono-design.md` | 12 | 9 | 0 | 3 | 0 |
| SPEC-CHARTS | `2026-09-20-visx-charts-design.md` | 1 | 0 | 1 | 0 | 0 |
| RESEARCH | `.claude/research/2026-08-27-date-picker-foundation-research.md` | 4 | 0 | 1 | 3 | 0 |
| PROMPT | `executor-prompt-oss-publication.md` | 2 | 0 | 0 | 2 | 0 |
| HDR-AIContextGauge | `src/components/AIChat/AIContextGauge.tsx` | 5 | 4 | 0 | 0 | 1 |
| HDR-AIModelSelect | `src/components/AIChat/AIModelSelect.tsx` | 3 | 2 | 1 | 0 | 0 |
| HDR-AIPromptInput | `src/components/AIChat/AIPromptInput.tsx` | 7 | 7 | 0 | 0 | 0 |
| HDR-AITextPart | `src/components/AIChat/AITextPart.tsx` | 5 | 5 | 0 | 0 | 0 |
| HDR-AIThinkingPart | `src/components/AIChat/AIThinkingPart.tsx` | 7 | 7 | 0 | 0 | 0 |
| HDR-AIToolPart | `src/components/AIChat/AIToolPart.tsx` | 5 | 5 | 0 | 0 | 0 |
| HDR-AITurnSummary | `src/components/AIChat/AITurnSummary.tsx` | 2 | 2 | 0 | 0 | 0 |
| HDR-Button | `src/components/Button/Button.tsx` | 6 | 6 | 0 | 0 | 0 |
| HDR-ChatDivider | `src/components/AIChat/ChatDivider.tsx` | 3 | 3 | 0 | 0 | 0 |
| HDR-Checkbox | `src/components/Checkbox/Checkbox.tsx` | 7 | 4 | 3 | 0 | 0 |
| HDR-CodeDigitInput | `src/components/VerificationCode/CodeDigitInput.tsx` | 6 | 4 | 1 | 1 | 0 |
| HDR-cubic | `src/components/MorphRotationShape/engine/cubic.ts` | 2 | 1 | 1 | 0 | 0 |
| HDR-DropdownCaret | `src/components/DropdownCaret/DropdownCaret.tsx` | 8 | 8 | 0 | 0 | 0 |
| HDR-DropdownMenu | `src/components/Menu/DropdownMenu.tsx` | 7 | 7 | 0 | 0 | 0 |
| HDR-DropdownMenuSearch | `src/components/Menu/DropdownMenuSearch.tsx` | 5 | 5 | 0 | 0 | 0 |
| HDR-FadeChangeText | `src/components/AnimatedText/FadeChangeText.tsx` | 7 | 6 | 1 | 0 | 0 |
| HDR-Input | `src/components/Input/Input.tsx` | 8 | 7 | 1 | 0 | 0 |
| HDR-LinearProgressIndicator | `src/components/LinearProgressIndicator/LinearProgressIndicator.tsx` | 6 | 5 | 1 | 0 | 0 |
| HDR-MorphRotationShape | `src/components/MorphRotationShape/MorphRotationShape.tsx` | 14 | 13 | 0 | 0 | 1 |
| HDR-RevealChangeText | `src/components/AnimatedText/RevealChangeText.tsx` | 8 | 7 | 1 | 0 | 0 |
| HDR-RollChangeText | `src/components/AnimatedText/RollChangeText.tsx` | 5 | 4 | 1 | 0 | 0 |
| HDR-rollingDigitsModel | `src/components/AnimatedText/rollingDigitsModel.ts` | 5 | 5 | 0 | 0 | 0 |
| HDR-RollingDigitsText | `src/components/AnimatedText/RollingDigitsText.tsx` | 10 | 10 | 0 | 0 | 0 |
| HDR-ShapeButton | `src/components/ShapeButton/ShapeButton.tsx` | 4 | 4 | 0 | 0 | 0 |
| HDR-SidebarWithHoverIcon | `src/components/SidebarWithHoverIcon/SidebarWithHoverIcon.tsx` | 8 | 7 | 0 | 1 | 0 |
| HDR-Sticker | `src/components/Sticker/Sticker.tsx` | 11 | 9 | 2 | 0 | 0 |
| HDR-svgPath | `src/components/MorphRotationShape/engine/svgPath.ts` | 5 | 5 | 0 | 0 | 0 |
| HDR-Toggle | `src/components/Toggle/Toggle.tsx` | 5 | 5 | 0 | 0 | 0 |
| HDR-toggleOption | `src/components/Toggle/toggleOption.ts` | 7 | 7 | 0 | 0 | 0 |
| HDR-useChangeSwap | `src/components/AnimatedText/useChangeSwap.ts` | 7 | 7 | 0 | 0 | 0 |
| HDR-UserMessageHeader | `src/components/AIChat/UserMessageHeader.tsx` | 2 | 2 | 0 | 0 | 0 |
| HDR-VerificationCodeInput | `src/components/VerificationCode/VerificationCodeInput.tsx` | 5 | 5 | 0 | 0 | 0 |
| JSDOC-add-use-client | `scripts/add-use-client.mjs` | 2 | 1 | 1 | 0 | 0 |
| JSDOC-AIChat.constants | `src/components/AIChat/constants.ts` | 3 | 3 | 0 | 0 | 0 |
| JSDOC-AIChatStreaming.stories | `src/components/AIChat/AIChatStreaming.stories.tsx` | 3 | 3 | 0 | 0 | 0 |
| JSDOC-AIModelSelect | `src/components/AIChat/AIModelSelect.tsx` | 2 | 2 | 0 | 0 | 0 |
| JSDOC-AIThinkingPart | `src/components/AIChat/AIThinkingPart.tsx` | 1 | 1 | 0 | 0 | 0 |
| JSDOC-AITurnSummary | `src/components/AIChat/AITurnSummary.tsx` | 1 | 1 | 0 | 0 | 0 |
| JSDOC-Calendar.constants | `src/components/Calendar/constants.ts` | 1 | 1 | 0 | 0 | 0 |
| JSDOC-cn | `src/utils/cn.ts` | 1 | 0 | 1 | 0 | 0 |
| JSDOC-color | `src/utils/color.ts` | 2 | 1 | 0 | 1 | 0 |
| JSDOC-copy-theme | `scripts/copy-theme.mjs` | 1 | 1 | 0 | 0 | 0 |
| JSDOC-CopyButton.stories | `src/components/CopyButton/CopyButton.stories.tsx` | 1 | 1 | 0 | 0 | 0 |
| JSDOC-dateUtils | `src/components/Calendar/dateUtils.ts` | 1 | 0 | 1 | 0 | 0 |
| JSDOC-dooph-component-tokens.css | `src/styles/dooph-component-tokens.css` | 8 | 5 | 3 | 0 | 0 |
| JSDOC-DropdownMenu | `src/components/Menu/DropdownMenu.tsx` | 2 | 1 | 1 | 0 | 0 |
| JSDOC-generate-icon-exports | `scripts/generate-icon-exports.mjs` | 1 | 1 | 0 | 0 | 0 |
| JSDOC-generate-shape-morph-ease | `scripts/generate-shape-morph-ease.mjs` | 1 | 1 | 0 | 0 | 0 |
| JSDOC-index.css | `src/styles/index.css` | 6 | 4 | 2 | 0 | 0 |
| JSDOC-init | `bin/init.mjs` | 1 | 1 | 0 | 0 | 0 |
| JSDOC-main | `.storybook/main.ts` | 1 | 1 | 0 | 0 | 0 |
| JSDOC-Modal | `src/components/Modal/Modal.tsx` | 1 | 1 | 0 | 0 | 0 |
| JSDOC-OutlineButton | `src/components/OutlineButton/OutlineButton.tsx` | 3 | 1 | 1 | 1 | 0 |
| JSDOC-OutlineSection | `src/components/OutlineSection/OutlineSection.tsx` | 3 | 2 | 1 | 0 | 0 |
| JSDOC-preview | `.storybook/preview.ts` | 1 | 1 | 0 | 0 | 0 |
| JSDOC-preview-head | `.storybook/preview-head.html` | 2 | 2 | 0 | 0 | 0 |
| JSDOC-ProgressIndicator | `src/components/ProgressIndicator/ProgressIndicator.tsx` | 2 | 1 | 1 | 0 | 0 |
| JSDOC-ProgressIndicator.constants | `src/components/ProgressIndicator/constants.ts` | 1 | 0 | 1 | 0 | 0 |
| JSDOC-rangeSelection | `src/components/Calendar/rangeSelection.ts` | 1 | 1 | 0 | 0 | 0 |
| JSDOC-release-package | `.github/workflows/release-package.yml` | 2 | 0 | 2 | 0 | 0 |
| JSDOC-ShapeMorphSpinner | `src/components/ShapeMorphSpinner/ShapeMorphSpinner.tsx` | 2 | 2 | 0 | 0 | 0 |
| JSDOC-shapeMorphSpring | `scripts/shapeMorphSpring.mjs` | 1 | 1 | 0 | 0 | 0 |
| JSDOC-Sheet | `src/components/Sheet/Sheet.tsx` | 5 | 4 | 1 | 0 | 0 |
| JSDOC-Sheet.constants | `src/components/Sheet/constants.ts` | 1 | 1 | 0 | 0 | 0 |
| JSDOC-spinnerGeometry | `src/components/LoadingSpinner/spinnerGeometry.ts` | 3 | 2 | 1 | 0 | 0 |
| JSDOC-Sticker.constants | `src/components/Sticker/constants.ts` | 6 | 4 | 2 | 0 | 0 |
| JSDOC-sync-theme | `scripts/sync-theme.mjs` | 4 | 0 | 3 | 1 | 0 |
| JSDOC-Table | `src/components/Table/Table.tsx` | 1 | 1 | 0 | 0 | 0 |
| JSDOC-Table.constants | `src/components/Table/constants.ts` | 1 | 1 | 0 | 0 | 0 |
| JSDOC-theme.css | `src/styles/theme.css` | 2 | 2 | 0 | 0 | 0 |
| JSDOC-Toast | `src/components/Toast/Toast.tsx` | 1 | 1 | 0 | 0 | 0 |
| JSDOC-Toast.constants | `src/components/Toast/constants.ts` | 1 | 1 | 0 | 0 | 0 |
| JSDOC-tokens.css | `src/styles/tokens.css` | 10 | 7 | 2 | 1 | 0 |
| JSDOC-Tooltip | `src/components/Tooltip/Tooltip.tsx` | 1 | 1 | 0 | 0 | 0 |
| JSDOC-Tooltip.constants | `src/components/Tooltip/constants.ts` | 1 | 1 | 0 | 0 | 0 |
| JSDOC-tsup.config | `tsup.config.ts` | 5 | 4 | 1 | 0 | 0 |
| JSDOC-waveGeometry.test | `src/components/ProgressIndicator/waveGeometry.test.ts` | 1 | 0 | 1 | 0 | 0 |
| **all** | 106 docs | **843** | **673** | **116** | **42** | **12** |

By family:

| family | claims | TRUE | FALSE | STALE | UNVERIFIABLE | FALSE+STALE share |
|---|---|---|---|---|---|---|
| authoring skills + AGENTS | 347 | 275 | 45 | 23 | 4 | 20% |
| shipped consumer skills | 147 | 123 | 20 | 4 | 0 | 16% |
| repo docs, plans, metadata | 53 | 26 | 12 | 9 | 6 | 40% |
| header contracts (HDR-*) | 195 | 178 | 13 | 2 | 2 | 8% |
| code comments (JSDOC-*) | 101 | 71 | 26 | 4 | 0 | 30% |

## 7. FALSE/STALE roll-up (158)

Every FALSE/STALE claim with the unit finding(s) that already cover it (notation as in §1). 148 covered, 10 UNCOVERED.

| C-ID | path:line | verdict | claim | covering finding(s) |
|---|---|---|---|---|
| C-CB-10 | .agents/skills/dooph-ds-codebase/SKILL.md:29-32 | STALE | `utils/color.ts` backs `color` on Slider*/LinearProgressIndicator | U14-F7 |
| C-CB-11 | .agents/skills/dooph-ds-codebase/SKILL.md:34 | STALE | index.css ← "Tailwind build entry: @import chain, generated @theme inline block, text-style-* role classes (@layer components), h… | U1-F7, ~U1-F15 |
| C-CB-15 | .agents/skills/dooph-ds-codebase/SKILL.md:38-86 | FALSE | component directory list | U14-F6, ~U3-F10 |
| C-CB-22 | .agents/skills/dooph-ds-codebase/SKILL.md:79 | FALSE | "BaseText + 8 roles" | U3-F10 |
| C-CB-29 | .agents/skills/dooph-ds-codebase/SKILL.md:96-102 | STALE | `.agents/skills/` contents (6 listed) | U14-F5, ~U14-F14 |
| C-CB-30 | .agents/skills/dooph-ds-codebase/SKILL.md:103-107 | STALE | `.claude/skills/` = 3 symlinks + loading-indicators real copy | U14-F5, ~U14-F1 |
| C-CB-32 | .agents/skills/dooph-ds-codebase/SKILL.md:109-113 | STALE | scripts list | U14-F7, U2-F11 |
| C-CB-36 | .agents/skills/dooph-ds-codebase/SKILL.md:127 | FALSE | OutlineButton — `Slot`; `inverseTheme`, `glowing` bools; `glowColor1/2` strings; asChild ✅ | U4-F1 |
| C-CB-37 | .agents/skills/dooph-ds-codebase/SKILL.md:128 | FALSE | ShapeButton — `Slot`; `ShapeButtons` × `ShapeButtonVariant`; asChild ✅ | U4-F1 |
| C-CB-39 | .agents/skills/dooph-ds-codebase/SKILL.md:129 | FALSE | CopyButton asChild "via `Button`" | UNCOVERED |
| C-CB-44 | .agents/skills/dooph-ds-codebase/SKILL.md:138 | FALSE | "`danger` replaced `destructive` in v3, and `prominent` replaced `brand` in 5.4" | ≈U14-F4 |
| C-CB-46 | .agents/skills/dooph-ds-codebase/SKILL.md:140 | FALSE | "each one `<path d>` lifted verbatim from the Figma export kept alongside in `Shapes/svgs/`" | U10-F2 |
| C-CB-47 | .agents/skills/dooph-ds-codebase/SKILL.md:140 | FALSE | "`GemShape` was REMOVED in 5.4; do not reintroduce it" | ≈U14-F4, ~U10-F2 |
| C-CB-54 | .agents/skills/dooph-ds-codebase/SKILL.md:152 | STALE | Checkbox variants = `CheckboxChecked` | U6-F24 |
| C-CB-71 | .agents/skills/dooph-ds-codebase/SKILL.md:202 | FALSE | toggleOptionVariants "internal, not re-exported" | U6-F14 |
| C-CB-74 | .agents/skills/dooph-ds-codebase/SKILL.md:206-207 | FALSE | (table shape) | U5-F10 |
| C-CB-86 | .agents/skills/dooph-ds-codebase/SKILL.md:220 | FALSE | `DropdownTrigger` — `Slot`, asChild | U5-F1, ~U5-F10 |
| C-CB-88 | .agents/skills/dooph-ds-codebase/SKILL.md:222 | FALSE | `TextDropdownTrigger` — `Slot`, `TextDropdownSize` | U5-F1, ~U5-F10 |
| C-CB-102 | .agents/skills/dooph-ds-codebase/SKILL.md:237 | FALSE | "unsuffixed `slide-*` resolves to 0.25rem in Tailwind v4" | UNCOVERED |
| C-CB-117 | .agents/skills/dooph-ds-codebase/SKILL.md:283-285 | FALSE | geometry = literal calc() class strings; dots, fills, handle share one formula | U6-F24 |
| C-CB-126 | .agents/skills/dooph-ds-codebase/SKILL.md:307 | STALE | LoadingSpinner: "see ... skill for the wave/geometry model" | ~U9-F19 |
| C-CB-147 | .agents/skills/dooph-ds-codebase/SKILL.md:398 | FALSE | "stroke from `--ui-icon-stroke-width`, 1.5" | U10-F9 |
| C-CB-157 | .agents/skills/dooph-ds-codebase/SKILL.md:433-435 | FALSE | "An earlier version called `closest(…)` … — see the architecture skill's Rule 6" | U10-F13, U14-F7 |
| C-CB-159 | .agents/skills/dooph-ds-codebase/SKILL.md:442 | FALSE | OutlineSection "outer dashed ring + inner surface card" | U12-F9 |
| C-CB-162 | .agents/skills/dooph-ds-codebase/SKILL.md:451 | FALSE | components never use `var(--ui-*)` directly in className strings | ≈U6-F3 |
| C-CB-165 | .agents/skills/dooph-ds-codebase/SKILL.md:456 | STALE | "Widths are pinned per variant, matching `ToastTypes.simple`/`.complex`" | U8-F15 |
| C-CB-169 | .agents/skills/dooph-ds-codebase/SKILL.md:459-460 | FALSE | "Every animated component owns a `--ui-<component>-*` family and the component reads them only through CSS" | U8-F3, U1-F6, ~U1-F15, ~U14-F6 |
| C-CB-170 | .agents/skills/dooph-ds-codebase/SKILL.md:459-463 | STALE | "Current families: roll-hover, roll-change, fade-change, underline-link, rolling-digits, sidebar-icon" | U1-F15, ~U14-F6 |
| C-CB-178 | .agents/skills/dooph-ds-codebase/SKILL.md:498 | FALSE | "The 5.4 pass realigned nearly every name with Figma" | U1-F13, ≈U14-F4 |
| C-CB-181 | .agents/skills/dooph-ds-codebase/SKILL.md:500 | FALSE | identity is a "pair" whose "alt *does* differ per mode" | U1-F15 |
| C-CB-190 | .agents/skills/dooph-ds-codebase/SKILL.md:531 | STALE | focus helper list (…, `ds-focus-ring`) | U1-F9, ~U1-F15 |
| C-CB-198 | .agents/skills/dooph-ds-codebase/SKILL.md:542 | STALE | ds-slider-fill = 45% of --ds-slider-color | U6-F17, U1-F15 |
| C-CB-200 | .agents/skills/dooph-ds-codebase/SKILL.md:542 | STALE | `.ds-slider-dot[data-active]` = `--ui-color-text` at 40% | ~U1-F15, ~U6-F17 |
| C-CB-203 | .agents/skills/dooph-ds-codebase/SKILL.md:547 | FALSE | "one per `TextVariant` (eight)" with 8 classes listed | U3-F10, U1-F15 |
| C-CB-206 | .agents/skills/dooph-ds-codebase/SKILL.md:549 | STALE | "Adding a role means four edits in step" | U3-F10 |
| C-CB-216 | .agents/skills/dooph-ds-codebase/SKILL.md:588-592 | STALE | build = icons → sync-tokens → tsup | U2-F11 |
| C-CB-223 | .agents/skills/dooph-ds-codebase/SKILL.md:618 | FALSE | Components + *Props come from the component's index.ts | U14-F7, U2-F14, ~U2-F11 |
| C-CB-224 | .agents/skills/dooph-ds-codebase/SKILL.md:623-624 | FALSE | only useState/useEffect/useRef (+ browser APIs/timers/rAF) require the directive | U7-F15 |
| C-CB-225 | .agents/skills/dooph-ds-codebase/SKILL.md:627-629 | FALSE | directive after a doc comment "is still a valid directive prologue" | U2-F1, ~U6-F28 |
| C-CB-228 | .agents/skills/dooph-ds-codebase/SKILL.md:635-636 | FALSE | "`add-use-client.mjs` stamps dist chunks purely from source directives, so deleting the line … is the whole change" | U2-F1, U6-F28, U9-F1, ~U14-F6, ~U2-F11 |
| C-CB-230 | .agents/skills/dooph-ds-codebase/SKILL.md:640-641 | FALSE | "Every component with consts follows this, except `Avatar` and `BaseIcon`, which declare theirs inline in server-safe modules — e… | U10-F12, U12-F14, ~U2-F11 |
| C-CB-232 | .agents/skills/dooph-ds-codebase/SKILL.md:653-656 | STALE | canonical skill list | U14-F5 |
| C-CB-234 | .agents/skills/dooph-ds-codebase/SKILL.md:661 | FALSE | links materialise as "empty/real directories" | U14-F5 |
| C-ARCH-2 | .agents/skills/dooph-ds-architecture/SKILL.md:32 | FALSE | `destructive`/`brand` exist nowhere as keys | U14-F1, U14-F2, ~U14-F4 |
| C-ARCH-3 | .agents/skills/dooph-ds-architecture/SKILL.md:32,84 | FALSE | renames happened "in 5.4" | U14-F4, ~U14-F10, ~U2-F3, ~U3-F4, ~U6-F24, ~U6-F25 |
| C-ARCH-10 | .agents/skills/dooph-ds-architecture/SKILL.md:77-78 | STALE | open-value `color` used by Slider*, LinearProgressIndicator | U14-F7, ~U2-F3 |
| C-ARCH-13 | .agents/skills/dooph-ds-architecture/SKILL.md:101-107 | FALSE | custom has no defaults; discriminated union + unconditional throw; "the union is the real guard" | U6-F23, ~U7-F1 |
| C-ARCH-14 | .agents/skills/dooph-ds-architecture/SKILL.md:101-107 | FALSE | "`SliderVariant.custom` … enforced by making the props a discriminated union (`CalendarProps` is the other example). Pair it with… | U7-F1 |
| C-ARCH-22 | .agents/skills/dooph-ds-architecture/SKILL.md:221 | FALSE | asChild via Slot on Button, DropdownTrigger, TextDropdownTrigger, OutlineButton, ShapeButton | U4-F1, U5-F1 |
| C-ARCH-30 | .agents/skills/dooph-ds-architecture/SKILL.md:253 | FALSE | "Roles whose faces implement no axes (label/title/hero)" | U3-F13 |
| C-ARCH-35 | .agents/skills/dooph-ds-architecture/SKILL.md:317-321 | STALE | "Existing families: `--ui-roll-hover-*`, `--ui-roll-change-*`, `--ui-fade-change-*`, `--ui-underline-link-*`, `--ui-rolling-digit… | U1-F6, U1-F15, U14-F7 |
| C-CONTRIB-2 | .agents/skills/dooph-ds-contribution/SKILL.md:17 | STALE | radius tokens `tight/standard/soft` | U14-F8 |
| C-CONTRIB-5 | .agents/skills/dooph-ds-contribution/SKILL.md:110 | FALSE | `h-tab` utility example | U14-F7 |
| C-CONTRIB-7 | .agents/skills/dooph-ds-contribution/SKILL.md:151 | FALSE | title/hero 23px/36px | U14-F8 |
| C-LI-1 | .agents/skills/dooph-ds-loading-indicators/SKILL.md:3 | STALE | description covers WavyDivider/LoadingSpinner/ProgressIndicator | U14-F9 |
| C-LI-2 | .agents/skills/dooph-ds-loading-indicators/SKILL.md:8 | STALE | "Four components form the M3E-inspired indicator family" | ~U14-F9 |
| C-LI-8 | .agents/skills/dooph-ds-loading-indicators/SKILL.md:21 | FALSE | "All enums follow the dot-accessible pattern required by architecture Rule 1" | U9-F11 |
| C-LI-14 | .agents/skills/dooph-ds-loading-indicators/SKILL.md:51 | STALE | values live in both places — "Keep them in sync" | U9-F6, ~U14-F3 |
| C-LI-15 | .agents/skills/dooph-ds-loading-indicators/SKILL.md:51-53 | FALSE | tokens.css alone has no effect on rendered size | U14-F3, U9-F6 |
| C-LI-22 | .agents/skills/dooph-ds-loading-indicators/SKILL.md:94 | FALSE | "At 100% progress: trackLength clamps to 0, track disappears" | U9-F5 |
| C-LI-35 | .agents/skills/dooph-ds-loading-indicators/SKILL.md:192 | STALE | "At progress = 0 ... Track covers almost full circle" | UNCOVERED |
| C-LI-36 | .agents/skills/dooph-ds-loading-indicators/SKILL.md:193 | FALSE | "At progress = 1 ... trackLength clamps to 0 → no track" | U9-F5 |
| C-LI-40 | .agents/skills/dooph-ds-loading-indicators/SKILL.md:220 | STALE | `ds-spinner-rotate` in index.css is the ONLY loading-indicator keyframe; used by spokes; `ds-spinner-arc` removed | UNCOVERED |
| C-LIC-1 | .claude/skills/dooph-ds-loading-indicators/SKILL.md | FALSE | li:53 / li:94 / li:192-193 / li:220 texts | ≈U14-F1 |
| C-LIC-2 | .claude/skills/dooph-ds-loading-indicators/SKILL.md:25 | FALSE | `LoadingSpinnerColor.primary / .brand` (the .claude copy; canonical says `.prominent`) | U14-F1 |
| C-LIC-3 | .claude/skills/dooph-ds-loading-indicators/SKILL.md:30 | FALSE | "ProgressIndicator imports `LoadingSpinnerVariant`, `LoadingSpinnerColor`, and `LoadingSpinnerSize`" | ~U14-F1 |
| C-LIC-4 | .claude/skills/dooph-ds-loading-indicators/SKILL.md:202 | FALSE | `LoadingSpinnerColor.brand → var(--ui-color-brand)` | ~U14-F1 |
| C-VM-3 | .agents/skills/dooph-ds-writing-version-migrations/SKILL.md:44-46 | FALSE | 5.4 renamed tokens in a minor | U14-F4 |
| C-USAGE-51 | skills/dooph-design-system-usage/SKILL.md:254-260 | FALSE | typography example | U13-F3 |
| C-USAGE-55 | skills/dooph-design-system-usage/SKILL.md:320-322 | FALSE | package `cn` registers a text-style group so `text-text` cannot erase the role class | U13-F6 |
| C-USAGE-56 | skills/dooph-design-system-usage/SKILL.md:325-337 | FALSE | replicated group snippet | U13-F6, ~U2-F7 |
| C-THEME-1 | skills/dooph-design-system-theming/SKILL.md:16-17 | STALE | names below are the v3 contract | U13-F15 |
| C-THEME-3 | skills/dooph-design-system-theming/SKILL.md:45-46 | FALSE | preset registers every `--ui-*` token | U13-F15 |
| C-THEME-10 | skills/dooph-design-system-theming/SKILL.md:147-149 | FALSE | portalled menus/modals don't inherit `div.light`; "Decorate the portalled content (or portal container)" | U8-F4 |
| C-THEME-12 | skills/dooph-design-system-theming/SKILL.md:176-177 | FALSE | mode-invariant tokens defined once on :root | U13-F15 |
| C-THEME-17 | skills/dooph-design-system-theming/SKILL.md:203-205 | STALE | slider fill from `color`; active track at 45% | U13-F7 |
| C-THEME-20 | skills/dooph-design-system-theming/SKILL.md:221-222 | FALSE | token-contract is the exhaustive list | U13-F8 |
| C-TC-3 | skills/dooph-design-system-theming/references/token-contract.md:17,19,21,23,41-43,56,59-60,88 | FALSE | "renamed … in 5.4" | U13-F1, ~U1-F10, ~U10-F9, ~U13-F7 |
| C-TC-9 | skills/dooph-design-system-theming/references/token-contract.md:56 | FALSE | alt DOES change between light and dark | U13-F7, ~U1-F10 |
| C-TC-11 | skills/dooph-design-system-theming/references/token-contract.md:66 | STALE | eight text roles | U13-F7, ~U1-F10 |
| C-TC-17 | skills/dooph-design-system-theming/references/token-contract.md:87 | FALSE | icon 12/14/16/18, stroke-width (1.5), back `IconSize.sm/rg/md/lg` | U13-F7, U10-F9, ~U1-F10 |
| C-TC-19 | skills/dooph-design-system-theming/references/token-contract.md:96-98 | FALSE | slider opacity/step tokens; step-inactive defaults to `--ui-color-border-secondary` | U13-F7, ~U1-F10 |
| C-TC-29 | skills/dooph-design-system-theming/references/token-contract.md:210 | FALSE | `rounded-l-standard` | U13-F5, ~U1-F10 |
| C-V3-4 | skills/dooph-design-system-v3-migration/SKILL.md:125-132 | FALSE | "CURRENT (5.4)" names | U13-F1 |
| C-V3-6 | skills/dooph-design-system-v3-migration/SKILL.md:153-154 | FALSE | rename `bg-surface-page` | U13-F9 |
| C-V3-9 | skills/dooph-design-system-v3-migration/SKILL.md:197-198 | STALE | only changed exports | U13-F9 |
| C-V3-11 | skills/dooph-design-system-v3-migration/SKILL.md:223 | FALSE | `ShapeButtons.star`, `DropdownMenuVariant` | U13-F9 |
| C-V3-13 | skills/dooph-design-system-v3-migration/SKILL.md:237,254 | FALSE | done-check reachable | U13-F9 |
| C-V5-2 | skills/dooph-design-system-v5-migration/SKILL.md:17-22 | FALSE | "5.4" renames | U13-F1 |
| C-V5-3 | skills/dooph-design-system-v5-migration/SKILL.md:30 | FALSE | "works as a CI gate" | U13-F2 |
| C-V5-6 | skills/dooph-design-system-v5-migration/SKILL.md:50-53 | FALSE | 5.4 brought the danger family back | U13-F1 |
| C-V5CM-1 | skills/dooph-design-system-v5-migration/codemod.mjs:15-19,44,124-126 | FALSE | "5.4 reinstated" | U13-F1 |
| C-README-5 | README.md:30-33 | FALSE | interactive components ship a per-module `"use client"` "preserved into the published bundle", so they import directly into a Ser… | U2-F1 |
| C-README-6 | README.md:44 | FALSE | "`next build` runs with no `createContext is not a function` error" | ≈U2-F1 |
| C-README-10 | README.md:95 | STALE | Flex axes GRAD/ROND/wdth | U13-F11 |
| C-README-12 | README.md:180 | FALSE | `rounded-standard` | U13-F5 |
| C-README-13 | README.md:185 | FALSE | preset learns every `--ui-*` token | U13-F15 |
| C-README-15 | README.md:208 | FALSE | LICENSE link `./LICENSE` | U13-F15 |
| C-CHANGELOG-1 | CHANGELOG.md:3-6 | FALSE | all notable changes documented; Keep a Changelog | U13-F12 |
| C-CONTRIBUTING-2 | CONTRIBUTING.md:7 | FALSE | issues link | U13-F14 |
| C-SECURITY-2 | SECURITY.md:12 | FALSE | advisory link | U13-F14 |
| C-NOTICES-2 | THIRD_PARTY_NOTICES.md:48-63 | FALSE | runtime npm packages listed | U13-F13 |
| C-SKILLSLOCK-3 | skills-lock.json:10-15 | FALSE | radix-ui-design-system from sickn33/antigravity-awesome-skills | U14-F14 |
| C-SPEC-1 | docs/superpowers/specs/2026-08-31-digits-sidebar-mono-design.md:5 | STALE | "Status: decisions approved; implementation pending" | U3-F13, ~U14-F15 |
| C-SPEC-2 | docs/superpowers/specs/2026-08-31-digits-sidebar-mono-design.md:44,51-52,82-85 | STALE | separator default 0.3em; one keyframe carries width+opacity; `prevJoined` ref | UNCOVERED |
| C-SPEC-7 | docs/superpowers/specs/2026-08-31-digits-sidebar-mono-design.md:202 | STALE | `--ui-font-mono` stack value | UNCOVERED |
| C-SPEC-CHARTS-1 | 2026-09-20-visx-charts-design.md:125-127 | FALSE | quotes Rule 1 as exempting "geometry props with established Radix/industry names" | UNCOVERED |
| C-RESEARCH-1 | .claude/research/2026-08-27-date-picker-foundation-research.md:5 | STALE | "research only. No code was written" | ~U14-F15 |
| C-RESEARCH-2 | .claude/research/2026-08-27-date-picker-foundation-research.md:42,300,310 | STALE | repo has no `@radix-ui/react-popover` | UNCOVERED |
| C-RESEARCH-3 | .claude/research/2026-08-27-date-picker-foundation-research.md:314 | STALE | DropdownMenuContent wrapper "ports over nearly verbatim" to Popover | U7-F3, U7-F4 |
| C-RESEARCH-4 | .claude/research/2026-08-27-date-picker-foundation-research.md:576 | FALSE | "Enforcement: `console.warn` ... and render nothing rather than crashing" (decision record) | U7-F1 |
| C-PROMPT-1 | executor-prompt-oss-publication.md:25-30 | STALE | repo state: UNLICENSED, GitHub Packages, orientation/composition skills | UNCOVERED |
| C-PROMPT-2 | executor-prompt-oss-publication.md:38 | STALE | no Storybook deploy | UNCOVERED |
| C-HDR-AIModelSelect-2 | src/components/AIChat/AIModelSelect.tsx:14-15 | FALSE | provider colour "written as a custom property the CSS reads — never a class" | U11-F11, ~U11-F12 |
| C-HDR-Checkbox-1 | src/components/Checkbox/Checkbox.tsx:2 | FALSE | "brand/primary checked fills" | U6-F1, ~U6-F28 |
| C-HDR-Checkbox-2 | src/components/Checkbox/Checkbox.tsx:5 | FALSE | unchecked hover/active use secondary surface tokens | U6-F15, ~U6-F28 |
| C-HDR-Checkbox-3 | src/components/Checkbox/Checkbox.tsx:6 | FALSE | fill follows `CheckboxVariant` (brand \| primary) | U6-F1, ~U6-F28 |
| C-HDR-CodeDigitInput-4 | src/components/VerificationCode/CodeDigitInput.tsx:8-9 | FALSE | disabled uses secondary disabled tokens + ds-disabled-state | U6-F2, ~U6-F1, ~U6-F28 |
| C-HDR-CodeDigitInput-5 | src/components/VerificationCode/CodeDigitInput.tsx:9 | STALE | focus uses brand focus ring | U6-F1, U6-F4, ~U6-F2, ~U6-F28 |
| C-HDR-cubic-2 | src/components/MorphRotationShape/engine/cubic.ts:7-9 | FALSE | "Keep this file a faithful port. Behaviour fixes belong in ../svgPath.ts" | U10-F13 |
| C-HDR-FadeChangeText-7 | src/components/AnimatedText/FadeChangeText.tsx:24-26 | FALSE | "…and the reduced-motion case are `--ui-fade-change-*` tokens" | U3-F13 |
| C-HDR-Input-8 | src/components/Input/Input.tsx:28-31 | FALSE | icon variant without icon throws; "the props union is the real guard" | U6-F23 |
| C-HDR-LinearProgressIndicator-3 | src/components/LinearProgressIndicator/LinearProgressIndicator.tsx:8-9 | FALSE | fill width animates via registered `@property --progress-pct` "(custom properties do not interpolate otherwise)" | ~U9-F19 |
| C-HDR-RevealChangeText-6 | src/components/AnimatedText/RevealChangeText.tsx:23-25 | FALSE | "reduced-motion case are `--ui-reveal-change-*` tokens" | U3-F13 |
| C-HDR-RollChangeText-4 | src/components/AnimatedText/RollChangeText.tsx:19-21 | FALSE | "reduced-motion case are all `--ui-roll-change-*` tokens" | U3-F13 |
| C-HDR-SidebarWithHoverIcon-7 | src/components/SidebarWithHoverIcon/SidebarWithHoverIcon.tsx:31-32 | STALE | "One `getComputedStyle` pair per frame per icon" | U10-F13 |
| C-HDR-Sticker-2 | src/components/Sticker/Sticker.tsx:6-7 | FALSE | "the wash is a color-mix at the sticker opacity" | U12-F2 |
| C-HDR-Sticker-9 | src/components/Sticker/Sticker.tsx:18-20 | FALSE | (constraint) wash alpha not baked into a hex | U12-F1, U12-F2 |
| C-JSDOC-add-use-client-1 | scripts/add-use-client.mjs:11-12 | FALSE | scan src for modules "whose first lines carry" the directive, "kept in lockstep with the component files" | U2-F1, ~U3-F1 |
| C-JSDOC-cn-1 | src/utils/cn.ts:4-13 | FALSE | registering `text-style-*` lets them coexist with colour utilities | U2-F7 |
| C-JSDOC-color-1 | src/utils/color.ts:1-2 | STALE | backs "(Slider, LinearProgressIndicator)" | ~U12-F19, ~U2-F12 |
| C-JSDOC-dateUtils-1 | src/components/Calendar/dateUtils.ts:9 | FALSE | "Never compare with `getTime()`" (module rule comment) | U7-F9 |
| C-JSDOC-dooph-component-tokens.css-1 | src/styles/dooph-component-tokens.css:12 | FALSE | "aria-invalid disabled pattern" | U1-F8 |
| C-JSDOC-dooph-component-tokens.css-2 | src/styles/dooph-component-tokens.css:115 | FALSE | slider fill is "the handle color at 45%" | U1-F8, ~U6-F17 |
| C-JSDOC-dooph-component-tokens.css-3 | src/styles/dooph-component-tokens.css:126-127 | FALSE | `--progress-pct` registration is what makes width/left interpolate | U1-F8, ~U9-F15 |
| C-JSDOC-DropdownMenu-1 | src/components/Menu/DropdownMenu.tsx:191-194 | FALSE | menuItemClassName lets non-Radix surfaces "render visually identical items"; "Internal: not re-exported from src/index.ts" | U7-F14, ~U7-F2 |
| C-JSDOC-index.css-1 | src/styles/index.css:16 | FALSE | `--progress-pct` registration is what makes width/left interpolate | U1-F8 |
| C-JSDOC-index.css-5 | src/styles/index.css:935-941 | FALSE | ds-spinner-rotate is for "the wavy LoadingSpinner", "only referenced by WavySpinner" | U1-F8, ~U9-F2 |
| C-JSDOC-OutlineButton-1 | src/components/OutlineButton/OutlineButton.tsx:24 | FALSE | "Mirrors the `themeInverse` pattern on Tooltip." | U4-F13 |
| C-JSDOC-OutlineButton-3 | src/components/OutlineButton/OutlineButton.tsx:217,223 | STALE | "translateX = gx * bw − 50%"; "Orb 2 tracks the diagonally opposite point (1−gx, 1−gy)" | U4-F20 |
| C-JSDOC-OutlineSection-2 | src/components/OutlineSection/OutlineSection.tsx:8 | FALSE | "Outer ring: dashed/thin border" | U12-F9 |
| C-JSDOC-ProgressIndicator-1 | src/components/ProgressIndicator/ProgressIndicator.tsx:47 | FALSE | "Throws in development if the value is outside this range" | U9-F9 |
| C-JSDOC-ProgressIndicator.constants-1 | src/components/ProgressIndicator/constants.ts:12-14 | FALSE | wavy = "Polar sine-wave arc ... point count changes" | U9-F9, ~U9-F11 |
| C-JSDOC-release-package-1 | .github/workflows/release-package.yml:43 | FALSE | trusted publisher "Repo: dooph-Design-System" | ~U2-F12 |
| C-JSDOC-release-package-2 | .github/workflows/release-package.yml:45 | FALSE | "use the TOKEN FALLBACK below" | ~U2-F12 |
| C-JSDOC-Sheet-5 | src/components/Sheet/Sheet.tsx:63-65 | FALSE | default cross-axis size is "width for left/right, height for top/bottom", "fully overridable via `className`" | U8-F15 |
| C-JSDOC-spinnerGeometry-2 | src/components/LoadingSpinner/spinnerGeometry.ts:49-51 | FALSE | "Matches Material Design's indeterminate circular progress timing (1.4 s)" | U9-F19 |
| C-JSDOC-Sticker.constants-2 | src/components/Sticker/constants.ts:9-11 | FALSE | secondary washes the secondary button's active border; danger washes danger-secondary, content danger-primary | ~U12-F2 |
| C-JSDOC-Sticker.constants-3 | src/components/Sticker/constants.ts:11-13 | FALSE | wash alpha is 20% except light secondary (`-opacity-secondary`) | ~U12-F2 |
| C-JSDOC-sync-theme-1 | scripts/sync-theme.mjs:5 | STALE | generated output is the block inside index.css | U1-F3 |
| C-JSDOC-sync-theme-2 | scripts/sync-theme.mjs:8 | FALSE | wired into `npm run prebuild` | U1-F3 |
| C-JSDOC-sync-theme-3 | scripts/sync-theme.mjs:13 | FALSE | rules in `TOKEN_MAP` | U1-F3 |
| C-JSDOC-sync-theme-4 | scripts/sync-theme.mjs:61,145,157,163 | FALSE | EXCLUDED group rationales | U1-F3 |
| C-JSDOC-tokens.css-6 | src/styles/tokens.css:173-178 | FALSE | tool row "reads at full ghost-active weight", thinking row at ghost | U11-F8 |
| C-JSDOC-tokens.css-7 | src/styles/tokens.css:205-207 | FALSE | "The component reads it back from computed style, so this token is the only place the cap lives" | U1-F8, U11-F9 |
| C-JSDOC-tokens.css-9 | src/styles/tokens.css:531-535 | STALE | radius roles "tight / standard / soft" | U1-F8 |
| C-JSDOC-tsup.config-2 | tsup.config.ts:26-32 | FALSE | "interactive components keep the directive at the top of THEIR chunk" | U2-F1 |
| C-JSDOC-waveGeometry.test-1 | src/components/ProgressIndicator/waveGeometry.test.ts:3-5 | FALSE | "required by the zero-dependency Node test command" | U9-F13, ~U2-F10 |

### 7a. UNCOVERED — proposed roll-in (one line each, grouped by source doc)

**CB** (`.agents/skills/dooph-ds-codebase/SKILL.md`)
- C-CB-39 (129, FALSE) → U4-F1 + U5-F1 (merged asChild finding) — the codebase-skill asChild column is wrong in four rows (CB:127, 128, 129, 220/222); fix together
- C-CB-102 (237, FALSE) → U8-F15 (S4 overlay doc nits) — CB:237 "unsuffixed slide-* = 0.25rem" is 100% with tailwindcss-animate 1.0.7

**LI** (`.agents/skills/dooph-ds-loading-indicators/SKILL.md`)
- C-LI-35 (192, STALE) → U9-F19 (S4 doc nits in scope) — li:192 contradicts li:93 and PI.tsx:113-115 (complete circle at 0)
- C-LI-40 (220, STALE) → U14-F9 — the loading-indicators skill predates the shape-morph family; add that ShapeMorphSpinner animates on ds-shape-morph-clock/-spin

**SPEC** (`docs/superpowers/specs/2026-08-31-digits-sidebar-mono-design.md`)
- C-SPEC-2 (44,51-52,82-85, STALE) → U14-F15 — dated design spec tracked as if current; mark historical/archive
- C-SPEC-7 (202, STALE) → U14-F15 — dated design spec tracked as if current; mark historical/archive

**SPEC-CHARTS** (`2026-09-20-visx-charts-design.md`)
- C-SPEC-CHARTS-1 (125-127, FALSE) → U14-F15 — charts plan misquotes arch:122; fix the quote when the plan is next touched or archive

**RESEARCH** (`.claude/research/2026-08-27-date-picker-foundation-research.md`)
- C-RESEARCH-2 (42,300,310, STALE) → U14-F15 — dated research doc tracked as if current; mark historical/archive

**PROMPT** (`executor-prompt-oss-publication.md`)
- C-PROMPT-1 (25-30, STALE) → U14-F15 — one-off task prompt tracked at repo root; archive
- C-PROMPT-2 (38, STALE) → U14-F15 — one-off task prompt tracked at repo root; archive

## DONE
