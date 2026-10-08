// HD: hand-authored consolidation decisions (merges, line fixes, exclusions, resolutions)
// Row ids are `<unit>:<line in units/U#.md>` as emitted by parse.cjs / normalize.cjs.

// Cited-line corrections (unit cited a drifted line; canonical line verified against the doc @ b436647)
exports.lineFix = {
  'U2:503': ['27'], 'U2:504': ['28'], 'U2:505': ['29-32'],
  'U2:515': ['588-592'], 'U2:516': ['594'], 'U2:517': ['595'], 'U2:518': ['596'], 'U2:519': ['599'],
  'U2:520': ['605-606'], 'U2:521': ['618'], 'U2:522': ['623-624'], 'U2:523': ['627-629'],
  'U2:524': ['630-633'], 'U2:525': ['633-635'], 'U2:526': ['635-636'], 'U2:527': ['638-640'],
  'U2:528': ['640-641'], 'U2:529': ['645-646'],
  'U7:457': ['623-624'], 'U7:458': ['631'], 'U7:459': ['638-640'], 'U6:868': ['632'], 'U10:585': ['633'],
  'U12:549': ['634'], 'U12:550': ['640-641'], 'U10:586': ['640-641'], 'U9:571': ['630-634'],
  'U7:467': ['93-95'],
};

// Rows that are not present-tense descriptive claims (rules, templates, plans, omissions, non-claims)
exports.exclude = {
  'U11:495': 'omission, not a claim (no AIChat section) — U11-F10',
  'U11:496': 'omission, not a claim (no AIChat section) — U11-F10, U13-F10',
  'U11:497': 'omission, not a claim (no AIChat entry) — U11-F10, U13-F12',
  'U13:557': 'not a claim (README has no component list)',
  'U13:558': 'not a claim (README states no peer deps)',
  'U14:698': 'not a claim (hook doc; no gated files in repo)',
  'U14:626': 'statement of intent ("meant to be symlinks"), not a factual claim; reality in C-CB rows 103-107/653-661 — U14-F5',
  'U14:655': 'normative template inconsistency (file-tree template vs checklist) — U14-F8',
  'U14:656': 'normative list (RC-5) — U14-F13',
  'U14:657': 'normative rule (RC-2: what a necessary wrapper must be) — U14-F11',
  'U4:612': 'normative rule (RC-2) — U14-F11 (U4 graded TRUE for the orbs, U14 FALSE for sanctioned wrappers: conflict dissolves once classed as a rule)',
  'U14:658': 'normative story template (teaches string literal) — U14-F8',
  'U14:661': 'normative rule (RC-3) — U14-F12',
  'U14:695': 'normative example contract (RC-6) — U14-F2',
  'U14:721': 'plan/instruction in a task prompt ("package.json gains bugs"), not a claim',
  'U14:724': 'plan ("release as Minor — 5.5"), not a claim — presumes unreleased 5.4 (U14-F4)',
  'U3:498': 'rule R1.7 (arch:111-115)',
  'U3:499': 'rule R1.8 (arch:119)',
  'U3:500': 'rule R1.9 (arch:120) — violation is U3-F4',
  'U3:501': 'rule R1.10 (arch:121)',
  'U14:641': 'rule R1.11 (arch:122) — violation/RC-1 is U14-F10, U7-F6',
  'U7:461': 'rule R1.11 (arch:122) — U7-F6',
  'U8:501': 'rule R1.11 (arch:122)',
  'U5:463': 'rule R2.9 (arch:167-182) — ModalContent/SheetContent violation is U8-F4',
  'U8:502': 'rule R2.9 (arch:167) — U8-F4',
  'U10:594': 'rule (Rule 6 escape hatch, arch:336-347); compliance TRUE for both components',
  'U9:557': 'anti-pattern rules (li:234-242); compliance TRUE',
  'U10:591': 'anti-pattern rules (li:268-271); compliance TRUE',
  'U6:839': 'constraint with no factual part ("prefer composing") — U6-F26',
  'U9:573': 'procedure ("Adding a component means …"), not a claim — the defect (3 folders without index.ts) is U9-F12/U2-F14',
};

// Pure history with no present-tense claim (task item 4)
exports.drop = {
  'U9:570': 'cb:477-480 "before 5.x the tokens were inert" — pure history (git check agrees: v4.8.2 LoadingSpinner.tsx:186 `width={diameter}`)',
  'U13:503': 'tc:194-195 "before 5.x spinner tokens were inert" — pure history (same git check)',
  'U14:684': 'vm:56-61 what v4.0.0 changed — pure history (U14 verified TRUE via `git diff --name-status v3.4.0 v4.0.0`)',
  'U10:603': 'shapeMorphSpring.mjs:14 "Tuned in prototypes/shape-morph-loader on 2026-09-27" — provenance history; no prototypes/ in repo',
};

// Duplicate/overlapping rows merged into one claim (first id = primary text). A row may sit in several groups.
exports.merge = [
  ['U1:461', 'U11:489'], ['U11:494', 'U1:478'],
  ['U14:594', 'U1:479', 'U2:498'], ['U14:595', 'U1:480', 'U2:499'], ['U14:596', 'U1:481', 'U2:500'],
  ['U14:597', 'U1:482', 'U2:501'], ['U14:598', 'U1:483', 'U2:502', 'U7:440'],
  ['U14:600', 'U2:503'], ['U14:601', 'U2:504'], ['U14:602', 'U2:505'],
  ['U1:484', 'U14:603'], ['U1:485', 'U14:604'], ['U1:486', 'U14:605'], ['U1:487', 'U14:606'],
  ['U14:608', 'U2:506'], ['U14:609', 'U2:507'], ['U14:610', 'U2:508'], ['U2:509', 'U14:611', 'U14:612'],
  ['U14:613', 'U2:510'], ['U14:614', 'U2:511'], ['U14:615', 'U2:512'], ['U14:616', 'U2:513'],
  ['U14:617', 'U2:514', 'U1:488'],
  ['U10:569', 'U10:566', 'U4:602'], ['U10:567', 'U4:602'], ['U10:568', 'U4:602'],
  ['U10:570', 'U4:603'], ['U10:582', 'U14:618'],
  ['U1:491', 'U8:493'], ['U8:494', 'U1:492'], ['U5:449', 'U1:493', 'U5:450', 'U5:451', 'U5:452'],
  ['U8:496', 'U1:494'], ['U12:548', 'U1:495'], ['U8:497', 'U1:497'], ['U9:568', 'U1:499'],
  ['U5:453', 'U1:517'], ['U5:454', 'U1:518', 'U5:455'], ['U1:519', 'U6:862'], ['U1:521', 'U8:498', 'U8:499'],
  ['U1:523', 'U6:863'], ['U6:864', 'U1:524'], ['U6:865', 'U1:525'], ['U6:866', 'U1:525'], ['U6:867', 'U1:526', 'U1:527'],
  ['U3:485', 'U1:529'], ['U1:531', 'U3:488'], ['U1:532', 'U3:489'], ['U3:491', 'U1:533'], ['U1:534', 'U3:492'],
  ['U1:535', 'U3:493'], ['U1:536', 'U3:494'], ['U1:537', 'U10:583', 'U10:584'],
  ['U14:619', 'U2:515'], ['U14:620', 'U2:518'], ['U14:621', 'U2:519'], ['U14:622', 'U2:520'], ['U14:624', 'U2:521'],
  ['U2:522', 'U7:457'], ['U2:524', 'U7:458', 'U6:868', 'U10:585', 'U9:571'], ['U2:525', 'U12:549', 'U9:571'],
  ['U2:526', 'U6:869', 'U9:572'], ['U2:527', 'U7:459'], ['U2:528', 'U10:586', 'U12:550'],
  // loading-indicators (+ .claude copy)
  ['U9:523', 'U14:672'], ['U9:558', 'U14:672'], ['U14:673', 'U9:524', 'U9:525'], ['U14:674', 'U9:530'],
  ['U9:555', 'U1:539'], ['U1:540', 'U9:556'], ['U10:588', 'U14:675'],
  // architecture
  ['U14:635', 'U4:605'], ['U14:638', 'U4:606', 'U6:870', 'U4:607', 'U8:500'], ['U7:460', 'U14:640'],
  ['U14:642', 'U8:503'], ['U4:609', 'U5:464'], ['U4:611', 'U14:643'],
  ['U1:542', 'U14:644', 'U3:502'], ['U1:543', 'U14:645', 'U3:503'], ['U1:544', 'U14:646', 'U3:504'],
  ['U1:545', 'U3:506'], ['U1:546', 'U3:507'], ['U1:547', 'U14:648', 'U10:593'],
  // CHANGELOG
  ['U10:595', 'U13:564'], ['U10:596', 'U13:564'], ['U10:597', 'U13:564'], ['U10:598', 'U13:564'], ['U5:469', 'U13:565'],
  // usage skill
  ['U13:397', 'U4:614'], ['U13:398', 'U4:615'], ['U13:399', 'U4:616'], ['U13:400', 'U4:617'], ['U13:401', 'U4:618'],
  ['U13:402', 'U4:619'], ['U13:403', 'U6:875'], ['U13:404', 'U6:875'], ['U13:405', 'U6:875'], ['U13:406', 'U6:875'],
  ['U13:407', 'U5:470'], ['U13:408', 'U5:471'], ['U13:409', 'U5:470'], ['U13:410', 'U5:472'], ['U13:411', 'U6:876'],
  ['U13:412', 'U8:505', 'U7:462'], ['U12:553', 'U13:413'], ['U12:555', 'U13:413'], ['U12:556', 'U13:413'],
  ['U12:557', 'U13:414'], ['U7:463', 'U13:415'], ['U7:464', 'U13:415'], ['U7:465', 'U13:415'], ['U7:466', 'U13:415'],
  ['U13:420', 'U10:599'], ['U13:422', 'U10:600'], ['U10:601', 'U13:424'], ['U5:473', 'U13:425'],
  ['U13:439', 'U4:620'], ['U5:474', 'U13:440'], ['U4:621', 'U13:441'],
  // token-contract / rsm / theming / v5 / README / contrib / vm / spec / research
  ['U13:493', 'U10:602'], ['U12:559', 'U13:496'], ['U12:560', 'U13:496'],
  ['U8:514', 'U13:446'], ['U8:515', 'U13:447'], ['U8:516', 'U13:448'], ['U8:519', 'U13:449'],
  ['U8:511', 'U13:465'], ['U8:512', 'U13:466'],
  ['U13:538', 'U7:467'],
  ['U13:546', 'U2:532'], ['U2:533', 'U13:547'], ['U13:548', 'U2:534'],
  ['U2:535', 'U13:549'], ['U2:536', 'U13:549'], ['U2:537', 'U13:549'], ['U13:550', 'U2:538'],
  ['U14:659', 'U2:530'], ['U2:531', 'U14:688'],
  ['U3:508', 'U14:712'], ['U3:515', 'U14:714'], ['U7:470', 'U14:719'],
];

// Claim text for merged groups whose primary row is too narrow
exports.claimText = {
  'U10:569': 'twelve shape primitives (`size`/`strokeColor`/`fillColor`/`strokeWeight`); `Shapes` const (Shapes/index.ts) enumerates the same twelve keys and types `Shapes`',
  'U10:567': '"each one `<path d>` lifted verbatim from the Figma export kept alongside in `Shapes/svgs/`"',
  'U10:568': '"`GemShape` was REMOVED in 5.4; do not reintroduce it"',
  'U14:617': 'what each listed script does (generate-icon-exports "regenerates Icons/index.ts from svg components"; sync-theme; copy-theme "used by build:css; tsup onSuccess does the same")',
  'U5:449': 'menu width tokens: `--ui-min-w-menu` (160) held by items via `ds-min-w-menu` in `itemBase`; `--ui-min-w-menu-complex` (324) for a wide Section / DropdownMenuSearch, also backs `--ui-min-w-search-box`; `--ui-min-w-menu-action` (144) removed',
  'U5:453': '`ds-radix-origin-*` / `ds-radix-dropdown-match-trigger-width` helpers; match-trigger-width only widens, applied when `matchTriggerWidth`',
  'U5:454': '`ds-min-w-menu` (160px) held by items, not panel/Section; `ds-min-w-menu-complex` (324px) applied directly to a wide Section',
  'U1:521': 'toast helpers `ds-toast-viewport`/`-width-simple`/`-width-complex` and tooltip helpers `ds-tooltip-inverse-theme`/`-matching-theme`/`ds-width-tooltip-rich`/`ds-min-w-tooltip-complex`',
  'U6:865': '`.ds-slider-dot` inactive = `--ui-color-secondary-border`',
  'U6:866': '`.ds-slider-dot[data-active]` = `--ui-color-text` at 40%',
  'U6:867': 'dot active/inactive split is a plain attribute selector (not `data-[active]:`); `ds-slider-glide` + `ds-slider-part` share one settle transition',
  'U1:537': '`.ds-sidebar-rail` in `@layer utilities`; `@property --ds-sidebar-rail-s`/`-h` registered near the top of index.css beside `--progress-pct`',
  'U2:524': 'client split: `LoadingSpinner`, `Calendar`, `DatePicker`, `Popover`, `VerificationCodeInput`, `CodeDigitInput`, `RollingDigitsText`, `RollChangeText`, `FadeChangeText`, `RevealChangeText`, `SidebarWithHoverIcon` are client',
  'U2:525': 'neutral: `ProgressIndicator` (useMemo), `WavyDivider` (useId), `Table` (no hooks), `CTAButton`, `ShimmerText`, `RollHoverText`, `UnderlineLinkText`',
  'U2:528': '"Every component with consts follows this, except `Avatar` and `BaseIcon`, which declare theirs inline in server-safe modules — equivalent"',
  'U9:523': 'enum keys: LoadingSpinnerVariant flat/spokes; LoadingSpinnerColor primary/prominent (+arbitrary); LoadingSpinnerSize sm/rg/md/xl = 16/22/32/40px; WavyDividerVariant high/low',
  'U9:558': '`LoadingSpinnerColor.primary / .brand` (the .claude copy; canonical says `.prominent`)',
  'U14:673': 'every const in a sibling `constants.ts` with no "use client"; LoadingSpinner is the only client module of the three; ProgressIndicator (`useMemo`) and WavyDivider (`useId`) carry no directive',
  'U14:638': 'naming table (arch:36-55): each listed const exists and maps to the stated prop (`ButtonVariant`→`variant`, `ButtonSize`→`size`, Tab/Toggle/Segmented variant+size, `ShapeButtons`→`shape`, `SheetSide`→`side`, …)',
  'U7:460': '"`SliderVariant.custom` … enforced by making the props a discriminated union (`CalendarProps` is the other example). Pair it with an unconditional `throw` …, as `ProgressIndicator` does"',
  'U1:547': '"Existing families: `--ui-roll-hover-*`, `--ui-roll-change-*`, `--ui-fade-change-*`, `--ui-underline-link-*`, `--ui-rolling-digits-*`, `--ui-sidebar-icon-*`, `--ui-shape-morph-*`"',
  'U2:535': 'interactive components ship a per-module `"use client"` "preserved into the published bundle", so they import directly into a Server Component',
  'U2:536': '"`next build` runs with no `createContext is not a function` error"',
  'U2:537': 'pure exports (text, icons, shapes, variant enums, `cn`) stay server-safe',
  'U1:484': 'index.css ← "Tailwind build entry: @import chain, generated @theme inline block, text-style-* role classes (@layer components), h-button/size-* utilities"',
};

// Final verdicts decided by HD (conflict resolutions, UNVERIFIABLE re-checks, policy harmonisation, split rows)
// kind: conflict | unverifiable | policy | split | regrade
exports.resolve = {
  'U1:484': { v: 'STALE', kind: 'conflict', m: 'U1 STALE vs U14 TRUE. Every listed item is present, but index.css now also holds `.ds-*` rules (e.g. ds-shimmer-text :369), 15 `@keyframes`, 6 `@property`, 2 `@custom-variant`, while CB:36 places ds-* helpers in dooph-component-tokens.css. At the commit that wrote the line (21d2236) index.css had 1 `@keyframes` and 0 `.ds-` rules (`git show 21d2236:src/styles/index.css | grep -c`), so the description drifted → STALE.' },
  'U14:614': { v: 'STALE', kind: 'conflict', m: 'U2 UNVERIFIABLE (out of scope) vs U14 STALE. `git ls-files -s .claude/skills` → 4 mode-120000 links + 66 regular files: the map lists 3 symlinks + 1 real copy; the vm symlink, fhc/visx (absolute junctions on disk, regular files in git) and skill-creator are missing → STALE.' },
  'U14:617': { v: 'TRUE', kind: 'conflict', m: 'U2 FALSE (":110 reads *Icon.tsx, not svg") vs U14 TRUE. `ls src/components/Icons` → only `*Icon.tsx` (SVG React components), Icons.stories.tsx, index.ts — no `.svg` files; generator filters `^[A-Z][A-Za-z0-9]*Icon\\.tsx$` (generate-icon-exports.mjs:9-13). "svg components" = those SVG components → TRUE (wording loose, not false). copy-theme part TRUE (U1).' },
  'U6:864': { v: 'STALE', kind: 'conflict', m: 'U1 FALSE vs U6 STALE. `git show v5.3.0:src/styles/dooph-component-tokens.css` :111-117 → `var(--ds-slider-color, …) 45%`; HEAD :117-124 uses `--ds-slider-track-opacity` per-variant tokens → was true at v5.3.0 → STALE (the skill\'s own CB:279-281 already says "no longer 45%").' },
  'U6:865': { v: 'TRUE', kind: 'split', m: 'U1:525 graded inactive+active together (TRUE/FALSE); inactive half: `--ui-color-slider-step-inactive` → `var(--ui-color-secondary-border)` (tokens.css:509) → TRUE.' },
  'U6:866': { v: 'STALE', kind: 'conflict', m: 'U1 FALSE vs U6 STALE. v5.3.0 dooph-component-tokens.css:141-143 `color-mix(in srgb, var(--ui-color-text) 40%, transparent)`; HEAD :154-158 `--ds-slider-step-active`/`--ui-color-slider-step-primary-active` → STALE.' },
  'U14:619': { v: 'STALE', kind: 'conflict', m: 'U2 FALSE vs U14 STALE. The pipeline block was written in 21d2236 (2026-06-11, `git log -S`); add-use-client joined onSuccess in ebb0b52 (2026-06-24) and generate-shape-morph-ease joined `build` in 5036a8f (2026-09-29) → accurate when written → STALE.' },
  'U2:528': { v: 'FALSE', kind: 'conflict', m: 'U12 TRUE (checked only Avatar/BaseIcon) vs U2/U10 FALSE. `src/components/Shapes/index.ts:15 export const Shapes = {` and no Shapes/constants.ts (`ls`) → a third exception → FALSE.' },
  'U9:555': { v: 'STALE', kind: 'conflict', m: 'U1 TRUE vs U9 STALE. li:8 counts ShapeMorphSpinner in the family; it animates on `ds-shape-morph-clock`/`ds-shape-morph-spin` (index.css:798, 803, 921). v5.3.0 index.css has 0 "shape-morph" hits → the sentence was true before 5036a8f → STALE.' },
  'U7:460': { v: 'FALSE', kind: 'conflict', m: 'U14 TRUE ("examples exist") vs U7 FALSE. `grep -n throw src/components/Calendar/Calendar.tsx` → none; CalendarProps discriminates on `mode`, not a no-defaults bundle member, and Calendar only `console.warn`s in dev (Calendar.tsx:61-122). As an example of the union+throw pairing the sentence describes, it is FALSE; the list is also incomplete (StickerVariant.custom + throw, Sticker.tsx:104-107).' },
  'U1:547': { v: 'STALE', kind: 'conflict', m: 'U1/U14 STALE vs U10 TRUE (U10 checked only that the listed families exist). tokens.css defines `--ui-reveal-change-*` and `--ui-chat-*` motion tokens (19 lines, `grep -c`) absent from the list → STALE.' },
  'U4:621': { v: 'TRUE', kind: 'unverifiable', m: 'U13 UNVERIFIABLE (component unit) vs U4 TRUE: OutlineButton.tsx:133-134 `glowColor1 ?? "var(--ui-prominent-color-alt)"` (same for 2) → TRUE.' },
  'U13:406': { v: 'TRUE', kind: 'unverifiable', m: 'U13 default half UNVERIFIABLE; VerificationCodeInput.tsx:50 `length = 6` (U6 same) → TRUE.' },
  'U13:538': { v: 'TRUE', kind: 'conflict', m: 'U7 UNVERIFIABLE vs U13 TRUE. `git ls-tree`/`git grep` per tag: all of Popover, Calendar, DatePicker, VerificationCodeInput, SidebarWithHoverIcon, RollingDigitsText, MonoText, SubheadingText, `tabular?:` absent at v4.8.2, present at v5.1.0 (the first five already at v5.0.0) → TRUE for the v5 line.' },
  'U2:535': { v: 'FALSE', kind: 'conflict', m: 'U13 TRUE (baseline stamp count) vs U2 FALSE. dist chunk-4SBJJVN3.js (FadeChangeText) begins `import {` — no directive; 24 ESM chunks stamped vs 40 source directives (add-use-client.mjs:40 scans 5 lines; orchestrator O11) → FALSE.' },
  'U2:536': { v: 'FALSE', kind: 'conflict', m: 'U13 TRUE vs U2 FALSE. Static: dist/chunk-6QQ7EYYD.js:32 `var PromptInputContext = createContext(null);` at module scope, no directive, imported by dist/index.js (`grep -c` = 1) → a Server Component importing the root evaluates it. Not executed under `next build` (none available) — FALSE on static evidence.' },
  'U2:537': { v: 'TRUE', kind: 'split', m: 'U13 umbrella TRUE; U2 TRUE for this part (none of those chunks stamped, U2 §2).' },
  // policy: "5.4" version label (no 5.4 release: package.json 5.3.0, latest tag v5.3.0)
  'U10:568': { v: 'FALSE', kind: 'policy', m: 'P-5.4. U10 graded the removal (TRUE: `rg -i gem` → only `--ui-color-ai-gemini`); U13/U14 grade identical "…in 5.4" claims FALSE because no 5.4 exists (`git tag` tops at v5.3.0; package.json 5.3.0). Event TRUE, version label FALSE → FALSE (label).' },
  'U4:600': { v: 'FALSE', kind: 'policy', m: 'P-5.4. v3 half TRUE (`git grep -o destructive`/`danger` in Button: v2.1.0 15/0, v3.0.0 0/15); "prominent replaced brand in 5.4" names an unreleased version → FALSE (label).' },
  'U1:510': { v: 'FALSE', kind: 'policy', m: 'P-5.4 → FALSE (label: "the 5.4 pass" is unreleased); the Figma-realignment half stays UNVERIFIABLE (committed Figma exports predate it, U1-F13).' },
  'U9:523': { v: 'TRUE', kind: 'split', m: 'U14:672 graded canonical TRUE and .claude copy FALSE; this row is the canonical doc → TRUE (LoadingSpinner/constants.ts:16-19).' },
  'U10:567': { v: 'FALSE', kind: 'conflict', m: 'U4 left the per-shape "verbatim from Figma" part UNVERIFIABLE (Shapes unit); U10 ran scratch/U10/verify-shape-svgs.mjs: Pentagon and Puff `d` strings differ from svgs/, no star.svg → FALSE.' },
  'U9:558': { v: 'FALSE', kind: 'split', m: '.claude copy half of U14:672 + U9 → FALSE (`LoadingSpinnerColor` has no `brand` key).' },
  // single-unit UNVERIFIABLE re-checks
  'U1:490': { v: 'FALSE', kind: 'unverifiable', m: '`grep -rn --include=*.tsx "var(--ui-" src` (non-story) → Slider.tsx:344 `h-[var(--ui-height-slider-handle)]`, :368, :380, :408 — raw `var(--ui-*)` inside className arbitrary values → FALSE.' },
  'U8:484': { v: 'FALSE', kind: 'unverifiable', m: 'Compiled `slide-in-from-right` with tailwindcss 4.3.3 + tailwindcss-animate 1.0.7 (scratch/HD/tw/, `@tailwindcss/cli`): `.slide-in-from-right { --tw-enter-translate-x: 100%; }` — 100%, not 0.25rem → FALSE.' },
  'U6:859': { v: 'TRUE', kind: 'unverifiable', m: 'Static: @radix-ui/react-slider dist/index.mjs:208/275 map the pointer against `getBoundingClientRect()` (border box, includes padding) and :491 place the thumb at `calc(${percent}% + offset)` of the root → padding the root does not inset travel → TRUE.' },
  'U5:446': { v: 'TRUE', kind: 'unverifiable', m: 'Static: @radix-ui/react-menu dist/index.mjs:452-461 item `onPointerMove` → `item.focus()`; :314 content keydown → `handleTypeaheadSearch` → after pointer-toggling, keystrokes reach typeahead → TRUE.' },
  'U2:544': { v: 'TRUE', kind: 'unverifiable', m: 'scratch/HD/rt/run.cjs: rollup 4.60.2 (tsup\'s treeshake path) bundling a `"use client"` module warns `MODULE_LEVEL_DIRECTIVE … "use client" … was ignored` and emits no directive → TRUE.' },
  'U14:681': { v: 'TRUE', kind: 'unverifiable', m: '`superpowers:writing-skills` is listed among this session\'s available skills (external plugin; not checkable from the repo alone).' },
  'U13:529': { v: 'TRUE', kind: 'unverifiable', m: 'Export-name diff (`git grep -o "export (const|function) X"` v4.8.2 vs v5.3.0) removes only `SiloIcon` (generateWavyArcPath was internal); `--ui-color-danger*` 19→0 at v5.0.0; `BarChartIcon` repurposed + `BarChartAxesIcon` added. Two of three are silent. Caveat: the icon renames shipped in 5.1.0, not 5.0.0; prop-level changes not inventoried.' },
  'U6:803': { v: 'TRUE', kind: 'unverifiable', m: 'Present-tense check: `git grep -c TwoWayToggle v5.3.0 -- src` → Toggle.tsx 9, stories 36; at HEAD only this header line and one codebase-skill mention → the rename happened and the old names are gone from code → TRUE.' },
  'U4:584': { v: 'TRUE', kind: 'unverifiable', m: 'Present-tense half verified (no `brand` key/token in src); history half needs no check.' },
  'U10:539': { v: 'UNVERIFIABLE', kind: 'unverifiable', m: 'Fit-per-mode half TRUE (geometry.ts:68-73). "Pixel-identical to the static Shapes component" needs a raster diff; construction differs (static: path ×23/24 + 1-unit round-join stroke, BaseShape.tsx:45-48,55; morph: raw path fill), so identity cannot be asserted statically.' },
  'U10:590': { v: 'UNVERIFIABLE', kind: 'unverifiable', m: 'Numbers TRUE (spill 2.5/26 ≈ 9.6%, 31px frame, `inset-[2.5px]`); "match the static Shape exactly" — same reason as MorphRotationShape.tsx:22-26.' },
  'U11:442': { v: 'UNVERIFIABLE', kind: 'unverifiable', m: 'Depends on where the consumer keeps the stream relative to its error boundary; not a property of this code.' },
  'U11:466': { v: 'TRUE', kind: 'unverifiable', m: 'Layout half TRUE (ChatDivider.tsx:28 `flex-1` on both rules); "Figma pins 120px" not checkable without the Figma file (not in repo).' },
  'U13:566': { v: 'UNVERIFIABLE', kind: 'unverifiable', m: 'Policy statement ("PRs not accepted"); nothing in the repo can confirm or refute a policy.' },
  'U13:568': { v: 'UNVERIFIABLE', kind: 'unverifiable', m: 'Policy statement (supported versions).' },
  'U13:570': { v: 'UNVERIFIABLE', kind: 'unverifiable', m: 'Per-icon provenance is not recorded in the repo (the notice says so itself).' },
  'U14:653': { v: 'UNVERIFIABLE', kind: 'unverifiable', m: 'Tool name depends on the MCP server registration; no .mcp.json in repo. In this session the Figma server is registered under a UUID prefix (`mcp__31b6d641-…__get_design_context`), so the literal name does not resolve here.' },
  'U14:697': { v: 'UNVERIFIABLE', kind: 'unverifiable', m: 'Experiment results from runs outside the repo.' },
  'U14:707': { v: 'UNVERIFIABLE', kind: 'unverifiable', m: 'sha256 of SKILL.md does not match; the hashing algorithm of the skills CLI is not documented in-repo.' },
  'U14:704': { v: 'UNVERIFIABLE', kind: 'regrade', m: 'U14 "consistent (no local provenance to contradict)" is not a verification; upstream provenance is external → UNVERIFIABLE.' },
  'U14:706': { v: 'UNVERIFIABLE', kind: 'regrade', m: 'Consistent with skill-creator/LICENSE.txt (Apache-2.0) but upstream provenance is external → UNVERIFIABLE.' },
  'U9:543': { v: 'UNVERIFIABLE', kind: 'unverifiable', m: 'Rendering rationale (why `<circle>` shows a seam); needs a render comparison of a removed implementation.' },
  'U10:563': { v: 'FALSE', kind: 'unverifiable', m: 'Path half FALSE (`../svgPath.ts` → the file is `./svgPath.ts`, engine/ sibling); faithfulness to upstream f4d2697 stays UNVERIFIABLE (no upstream copy offline; `git log` shows no edits since vendoring).' },
  'U9:565': { v: 'TRUE', kind: 'unverifiable', m: 'Mechanism TRUE (LinearProgressIndicator.tsx:70-72 `data-hidden` when pct >= 100); the rationale follows from it — a hidden remainder cannot overlap the nub — so the claim as a whole is TRUE.' },
  // regrades of odd verdict words
  'U14:720': { v: 'STALE', kind: 'regrade', m: 'U14 "FALSE now (all tasks since done)": a task prompt describing the repo state when written → STALE.' },
  'U14:722': { v: 'STALE', kind: 'regrade', m: 'U14 "superseded" → STALE (.github/workflows/deploy-storybook.yml exists).' },
  'U14:705': { v: 'FALSE', kind: 'regrade', m: 'U14 "CONTRADICTED": the lock says sickn33/antigravity-awesome-skills; radix SKILL.md:6 says `source: self` — the two records cannot both be true; graded FALSE as recorded provenance (U14-F14).' },
  'U9:562': { v: 'TRUE', kind: 'regrade', m: 'Single-unit verdict questioned: U9 read "(v3)" as the react-progress major (package.json `^1.1.16`). In this file "(v3)" is the "v3 addition" label (CB:15-17 explains the labels; same form at CB:138 "`ButtonSize` (v3)"); LinearProgressIndicator is listed as new in v3 (v3-migration:220-224). TRUE as a label, but the label is ambiguous — worth removing with the other v3 labels.' },
};

// HD mapping of a claim to the unit finding that already covers its defect (shown as ≈ in the register)
exports.findingsAdd = {
  'U10:568': ['U14-F4'], 'U4:600': ['U14-F4'], 'U1:510': ['U14-F4'],
  'U2:536': ['U2-F1'], 'U9:561': ['U14-F1'], 'U1:490': ['U6-F3'],
};

// Proposed roll-in for FALSE/STALE claims no unit finding covers
exports.rollup = {
  'U9:555': 'U14-F9 — the loading-indicators skill predates the shape-morph family; add that ShapeMorphSpinner animates on ds-shape-morph-clock/-spin',
  'U9:550': 'U9-F19 (S4 doc nits in scope) — li:192 contradicts li:93 and PI.tsx:113-115 (complete circle at 0)',
  'U3:515': 'U14-F15 — dated design spec tracked as if current; mark historical/archive',
  'U3:510': 'U14-F15 — dated design spec tracked as if current; mark historical/archive',
  'U7:470': 'U14-F15 — dated research doc tracked as if current; mark historical/archive',
  'U14:720': 'U14-F15 — one-off task prompt tracked at repo root; archive',
  'U14:722': 'U14-F15 — one-off task prompt tracked at repo root; archive',
  'U14:723': 'U14-F15 — charts plan misquotes arch:122; fix the quote when the plan is next touched or archive',
  'U4:595': 'U4-F1 + U5-F1 (merged asChild finding) — the codebase-skill asChild column is wrong in four rows (CB:127, 128, 129, 220/222); fix together',
  'U8:484': 'U8-F15 (S4 overlay doc nits) — CB:237 "unsuffixed slide-* = 0.25rem" is 100% with tailwindcss-animate 1.0.7',
};
