
## 2. File ledger

| path | lines read | status | finding IDs |
|---|---|---|---|
| skills/dooph-design-system-usage/SKILL.md | 1-398 = all | claims-checked | U13-F1, F3, F4, F6, F10, F15 |
| skills/dooph-design-system-usage/references/responsive-sheet-modal.md | 1-116 = all | claims-checked (all 3 examples compile; claims TRUE) | — |
| skills/dooph-design-system-theming/SKILL.md | 1-222 = all | claims-checked | U13-F1, F7, F8, F15 |
| skills/dooph-design-system-theming/references/token-contract.md | 1-237 = all | claims-checked | U13-F1, F5, F7, F8 |
| skills/dooph-design-system-v3-migration/SKILL.md | 1-255 = all | claims-checked | U13-F1, F9 |
| skills/dooph-design-system-v5-migration/SKILL.md | 1-101 = all | claims-checked | U13-F1, F2 |
| skills/dooph-design-system-v5-migration/codemod.mjs | 1-144 = all (line by line; executed on scratch fixture) | findings | U13-F1, F2 |
| README.md | 1-209 = all | claims-checked | U13-F5, F11, F15 |
| CHANGELOG.md | 1-68 = all | claims-checked | U13-F12 |
| CONTRIBUTING.md | 1-7 = all | claims-checked | U13-F14 |
| SECURITY.md | 1-12 = all | claims-checked | U13-F14 |
| THIRD_PARTY_NOTICES.md | 1-84 = all | claims-checked | U13-F13 |
| LICENSE.txt | 1-21 = all (provenance) | claims-checked | U13-F13, F15 |
| bin/init.mjs (cross-ref for README claims; not in scope) | 1-165 = all | reference only | — |
| .agents/skills/dooph-ds-writing-version-migrations/SKILL.md (rule source) | 1-330 = all | reference only | — |

## 4. Claim results

### skills/dooph-design-system-usage/SKILL.md
| claim-src | claim | result | evidence |
|---|---|---|---|
| usage:10 | React + Tailwind v4 package | TRUE | package.json peer react >=19; tailwindcss 4.3.3 build (baseline) |
| usage:21 | `import "@dooph-software/design-system/styles.css"` | TRUE | package.json exports `./styles.css` |
| usage:26-28 | Text components `BodyText, LabelText, HeadingText, SubheadingText, TitleText, HeroText, ButtonText, MonoText` exist | TRUE (incomplete: 8 of 10) | dist-exports.txt; → F15 |
| usage:110-112 | `ButtonVariant` primary/secondary/prominent/danger/ghost/text; `ButtonSize` default/sm/icon/iconSm/iconMicro | TRUE | exports-head.tsv keys |
| usage:112 | `SplitButton` + `SplitButtonAction`, `SplitButtonTrigger` exported | TRUE | dist-exports.txt |
| usage:113 | `OutlineButton` `inverseTheme`, `glowing`, `glowColor1/2` | TRUE | ex15 compiles |
| usage:114-115 | `ShapeButtons` clover/cookie/diamond/puff/squircle; `ShapeButtonVariant` prominent/primary | TRUE | exports-head.tsv |
| usage:115-116 | `CopyButton` writes `value`, checkmark for 2s; `CopyButtonVariant` ghost/secondary | TRUE | CopyButton.tsx:16 `const REVERT_MS = 2000;`; keys |
| usage:117-119 | `CTAButtonVariant` primary/secondary; `CTAButtonSize` standard/big | TRUE (omits required `text`/`icon`) | → F4 |
| usage:120 | `ToggleSwitch` (+ `ToggleSwitchItem`) | TRUE | ex15 |
| usage:121-126 | `SliderVariant` primary/prominent/custom; `color`,`stepColor`; custom REQUIRES color, compile error + runtime throw | TRUE (compile half verified) | ex15 `@ts-expect-error` held; Slider/constants.ts comment |
| usage:127 | `SliderLabeled` `labels: {start,end}` | TRUE | ex15 |
| usage:127-129 | `VerificationCodeInput` `length` default 6; `CodeDigitInput` single cell | TRUE (type) / UNVERIFIABLE (default) | ex15 compiles |
| usage:130-133 | `DropdownMenu selectType` `DropdownMenuSelectType.single`(default)/`.multi` | TRUE | Menu/constants.ts:17-20; ex15 |
| usage:134-135 | `DropdownMenuMultiSelectItem` renamed from `DropdownMenuCheckboxItem` | TRUE | DropdownMenu.tsx:277-278 |
| usage:135-140 | `DropdownMenuRadioSelectItem` inside `DropdownMenuRadioGroup`; `DropdownMenuPlainItem`; `DropdownMenuSection width`; `DropdownMenuSegment` | TRUE | ex15; DropdownMenu.d.ts `width?: string \| number` |
| usage:141 | `DropdownTrigger`, `DropdownTriggerContent`, `TypeableDropdownTrigger`, `TextDropdownTrigger` exported | TRUE | dist-exports.txt |
| usage:142-143 | `Tabs` (+List/Trigger/Content), `SegmentedTabSelect` (+ `SegmentedTabItem`) | TRUE | dist-exports.txt |
| usage:144-150 | Modal/Sheet/Popover families as listed; `SheetSide.left/right/top/bottom` | TRUE | exports-head.tsv |
| usage:154-160 | `StickerVariant` 6 keys; `StickerSize` standard/micro; micro = `--ui-height-tab-micro`; custom wash at `--ui-sticker-bg-opacity`; custom w/o color = compile error | TRUE | keys; Sticker/constants.ts:15-18,37; ex15 |
| usage:161-163 | `Table` + parts, `TableSortDirection` | TRUE | exports-head.tsv |
| usage:164-173 | DatePicker/Calendar parts; `DatePickerMode` singleDay/dateRange; `CalendarPresets` today/days.three…thirty/months.three,six/custom({id,label,days}); `DEFAULT_*_PRESETS`; `DateRange` `{from: Date; to: Date}` | TRUE | Calendar/constants.ts:89-129; ex15 |
| usage:174-175 | `TextLink` `asChild` | TRUE | ex15 |
| usage:176-178 | "the ten role components"; seven animating wrappers live under `AnimatedText` | TRUE | TextVariant 10 keys; src/components/AnimatedText/ exists (index.ts:14) |
| usage:183 | `FadeChangeText` tuned via `--ui-fade-change-*` | TRUE | tokens.css fade-change ×5 |
| usage:185-187 | `RevealChangeText` `changeKey` (nullable), `onSettled` | TRUE | ex15 |
| usage:191 | `BaseIcon`, `ChevronDownIcon`, `SearchIcon`, `SidebarWithHoverIcon` exported | TRUE | dist-exports.txt |
| usage:198-199 | `smallDecimals` requires `smallDecimalsComponent` "which the types enforce" | TRUE | ex15 `@ts-expect-error` held |
| usage:202-203 | `SidebarWithHoverIcon` `side` (`SidebarIconSide`), controlled `hovered` | TRUE | ex15 |
| usage:209 | `ShapeMorphSpinner` `size`, `color`, optional `shapes`, `timing` | TRUE (`size` is `LoadingSpinnerSize`, not number) | ShapeMorphSpinner.d.ts:10-14 |
| usage:210 | `MorphRotationShape` required `mode` autoplay/controlled/embedded | TRUE but incomplete (`shapes` also required) | ex16 (mode independently required); → F4 |
| usage:211 | `DropdownCaret` `variant` dropdown/typeable; built into both triggers; `ds-dropdown-caret-host` class exists | TRUE (class exists; geometry not checked) | classes-head.txt; DropdownCaret/constants.ts |
| usage:212 | `cn` exported | TRUE | dist-exports.txt |
| usage:221-227 | colour utilities listed all generate via preset | TRUE | check-names.cjs: 0 misses at usage:221-232 |
| usage:228-229 | spacing stems `xxxs xxs xs sm rg md lg xl xxl` | TRUE | theme.css `--spacing-*` (10 keys incl. sticker-y) |
| usage:230-232 | radius + shadow utilities listed exist | TRUE | check-names.cjs |
| usage:237-240 | ten roles listed | TRUE | TextVariant keys |
| usage:242-245 | HeroBody/HeroButton = Body/Button at 16px; HeroText 55px | TRUE | tokens.css:398-403 (16px), :410 `--ui-text-hero: 55px` |
| usage:247-248 | MonoText = Google Sans Code at button role's size and weight | TRUE | tokens.css:388, :406 `--ui-text-mono: var(--ui-text-body)`, :420 `--ui-weight-mono: var(--ui-weight-button)` |
| usage:254-260 | typography example | FALSE as written (missing HeroText import) | → F3 |
| usage:262-272 | prop table (font/fontSize/fontWeight/lineHeight/letterSpacing/axes/tabular/unstyled/as) | TRUE (types) | ex06b, ex15 compile |
| usage:287-289 | constants resolve to `var(--ui-*)` | TRUE | Text/constants.ts FontSizes etc. |
| usage:291-294 | precedence prop > className > role; `style` outranks props | TRUE | BaseText.tsx:89-92 (style spread last) |
| usage:320-322 | package `cn` registers a text-style group so `text-text` cannot erase the role class | FALSE for hero-body/hero-button | → F6 |
| usage:325-337 | replicated group snippet | compiles; FALSE as a complete group (6 of 10) | ex08 PASS; → F6 |
| usage:351-361 | SaveButton wrapper | TRUE | ex09 PASS |
| usage:373-375 | `TypeableDropdownTrigger` inside `DropdownMenuTrigger asChild`, `focusOnOpen={false}`; no `type` prop | TRUE (focusOnOpen type) | ex15 |
| usage:380-382 | OutlineButton glow defaults to `--ui-prominent-color-alt` | UNVERIFIABLE here (component unit) | token exists |

### skills/dooph-design-system-usage/references/responsive-sheet-modal.md
| claim-src | claim | result | evidence |
|---|---|---|---|
| rsm:14 | Modal/Sheet same root props (`open`, `onOpenChange`, `modal`) | TRUE | ex15 `<Modal modal>`, `<Sheet modal>` compile |
| rsm:15,17 | Trigger/Close support `asChild` | TRUE | ResponsiveDialog.tsx compiles |
| rsm:16 | SheetContent adds `side`; both contents have `withOverlay` | TRUE | ex15 compiles |
| rsm:29-103 | three code blocks | TRUE | useIsDesktop.tsx, ResponsiveDialog.tsx, ex12 PASS |

### skills/dooph-design-system-theming/SKILL.md
| claim-src | claim | result | evidence |
|---|---|---|---|
| theming:16-17 | names below are the v3 contract | STALE | → F15 |
| theming:25-28 | import order tailwindcss → styles.css → theme.css → app theme | TRUE | theme.css header lines 6-11 |
| theming:45-46 | preset registers every `--ui-*` token | FALSE (130 keys / 259 tokens) | → F15 |
| theming:54-56 | one font token per role body/button/heading/label/title/hero/mono | TRUE | tokens.css:379-392 |
| theming:83-85 | Flex axes GRAD/ROND/opsz/slnt/wdth/wght; Code MONO | TRUE (consistent with FontAxes keys) | exports-head.tsv FontAxes |
| theming:117 | no leading token, no role sets line-height | TRUE (no `--ui-leading*` / `--ui-line-height*` in tokens.cjs output) | tokens.cjs |
| theming:125-129 | `.text-style-*` classes named exist | TRUE | classes-head.txt |
| theming:138-139 | light on `:root` and `.light` with identical values | TRUE | tokens.css:17-18 `:root,\n.light {` |
| theming:140 | package does not read `prefers-color-scheme` | TRUE | Grep src (excl. stories): only tokens.css:10 comment |
| theming:160-163 | override tokens exist | TRUE | check-names.cjs 0 misses |
| theming:176-177 | mode-invariant tokens defined once on :root | FALSE for 6 tokens | → F15 (cross-ref tokens unit) |
| theming:185-187 | Tooltip defaults `themeInverse`; `--ui-color-tooltip-*`; `themeInverse={false}` | TRUE | Tooltip.tsx:35,48 `themeInverse = true`; 6 tooltip tokens |
| theming:188-192 | toast/tooltip width tokens | TRUE | check-names.cjs |
| theming:193-197 | menu width floor on items; `-complex` 324 shared with SearchBox; `-menu-action` removed | TRUE | tokens.css:562-568 |
| theming:198-202 | Avatar = surface-secondary + border-secondary + prominent-color; no avatar-bg | TRUE | Avatar.tsx:21-22 |
| theming:203-205 | slider fill from `color`; active track at 45% | STALE (per-variant opacity tokens 50/70/60%) | dooph-component-tokens.css:117-123 → F7 |
| theming:206-209 | slider geometry tokens; stepped inset `--ui-spacing-xs` | TRUE | Slider.tsx:339 |
| theming:210-212 | ShimmerText tokens | TRUE | tokens.css:166-167 |
| theming:221-222 | token-contract is the exhaustive list | FALSE | → F8 |

### skills/dooph-design-system-theming/references/token-contract.md
| claim-src | claim | result | evidence |
|---|---|---|---|
| tc:5 | bundle does not switch on prefers-color-scheme | TRUE | as theming:140 |
| tc:15-23 | core colour token lists exist | TRUE | check-names.cjs (only historical names missed) |
| tc:17,19,21,23,41-43,56,59-60,88 | "renamed … in 5.4" | FALSE (no 5.4 release; latest 5.3.0) | → F1 |
| tc:18 | danger-primary/secondary mode-invariant | TRUE | not in .dark |
| tc:19 | danger state family all aliases (bg/disabled → secondary; hover → danger-secondary; active/fg → danger-primary) | TRUE | tokens.css:75-84 |
| tc:29-32 | per-variant border alias behaviour | TRUE | tokens.css:23-32 and prominent/danger blocks |
| tc:41 | input-border-focus light → prominent-border-hover, dark → prominent-border-active | TRUE | token diff |
| tc:43 | input-border-danger-focus → danger-primary | TRUE | token diff |
| tc:56 | alt DOES change between light and dark | FALSE | → F7 |
| tc:59-60 | alt mode-invariant; `-ter` exists | TRUE | tokens.css:152-154 |
| tc:66 | eight text roles | STALE (ten) | → F7 |
| tc:68 | font defaults per role | TRUE | tokens.css:379-392 |
| tc:73 | `--ui-tracking-mono` -3% | TRUE | tokens.css:445 `-0.03em` |
| tc:75 | text-mono/weight-mono alias text-body/weight-button | TRUE | tokens.css:406,420 |
| tc:77 | `--ui-font-var-mono: "MONO" 1`; no label/title/hero axis token | TRUE | tokens.css:429-436 |
| tc:85 | `--ui-height-button-micro` backs `ButtonSize.iconMicro` | TRUE (token 26px exists) | tokens.css:475 |
| tc:87 | icon 12/14/16/18, stroke-width (1.5), back `IconSize.sm/rg/md/lg` | PARTLY FALSE (stroke is 2) | tokens.css:525-529 → F7 |
| tc:88 | radius-mini 10px | TRUE | token diff |
| tc:96-98 | slider opacity/step tokens; step-inactive defaults to `--ui-color-border-secondary` | PARTLY FALSE (it is `--ui-color-secondary-border`) | tokens.css:509 → F7 |
| tc:109-113 | sticker aliases/opacities/6px | TRUE | token diff |
| tc:117-128 | menu/search/tooltip/toast widths | TRUE | tokens.css:562-568 |
| tc:137-138 | shimmer defaults | TRUE | tokens.css:166-170 |
| tc:146-148 | motion families list | TRUE but incomplete | → F8 |
| tc:152-157 | rolling-digits were `--ui-rolling-money-*` in 5.0.0 | TRUE | `git show v5.0.0:src/styles/tokens.css \| grep -c rolling-money` → 8 |
| tc:160-166 | rolling-digits defaults (stagger 0ms, ratio 0.55, 1ch, 0.34em) | TRUE | tokens.css:324-330 |
| tc:192 | spinner 16/22/32/40 | TRUE | tokens.css:455-458 |
| tc:194-195 | before 5.x spinner tokens were inert | UNVERIFIABLE here (v4.8.2 had 4 `size-spinner` lines; inertness is component history) | git show v4.8.2 |
| tc:207-209 | Tailwind colour/font/shadow mappings | TRUE | check-names.cjs |
| tc:210 | `rounded-l-standard` | FALSE | → F5 |
| tc:212 | composite utilities list | TRUE but incomplete (no hero-body/hero-button) | classes-head.txt → F7 |
| tc:228 | preset: no manual remap needed | TRUE | theme.css @theme inline |

### skills/dooph-design-system-v3-migration/SKILL.md
| claim-src | claim | result | evidence |
|---|---|---|---|
| v3:84-100 | rename-table targets | TRUE (all 15 targets exist at HEAD) | check-names.cjs |
| v3:113-118 | "Unchanged" list | TRUE at HEAD | tokens.cjs |
| v3:121-123 | new optional tokens exist | TRUE | tokens.cjs |
| v3:125-132 | "CURRENT (5.4)" names | FALSE version label | → F1 |
| v3:138-147 | utility-rename targets | TRUE | theme-keys-head.txt |
| v3:153-154 | rename `bg-surface-page` | FALSE at HEAD | → F9 |
| v3:163-172 | `ButtonVariant.danger`, `Fonts`, `FontSizes`, `FontWeights`, `font` prop | TRUE | exports-head.tsv |
| v3:186-187 | `SidebarLeftIcon`/`…HoverIcon`/`SidebarRightIcon`/`…HoverIcon` | TRUE | exports-head.tsv |
| v3:197-198 | only changed exports | STALE for a v2→HEAD path | → F9 |
| v3:220-224 | new in v3: `TextLink`, `CopyButton`, sliders, `LinearProgressIndicator`, `StarShape`, `ShimmerText`, `RollChangeText`, `RollHoverText`, `ButtonSize.iconMicro` | TRUE | exports |
| v3:223 | `ShapeButtons.star`, `DropdownMenuVariant` | FALSE at HEAD (removed) | → F9 |
| v3:225-226 | slider/progress Radix deps are runtime deps | TRUE | package.json dependencies |
| v3:237,254 | done-check reachable | FALSE (greps a current name) | → F9 |

### skills/dooph-design-system-v5-migration/SKILL.md + codemod.mjs
| claim-src | claim | result | evidence |
|---|---|---|---|
| v5:10-15 | three breaking changes, two silent | UNVERIFIABLE vs v4.8.2→v5.0.0 (not re-inventoried; out of the HEAD question) | — |
| v5:17-22 | "5.4" renames | FALSE version label | → F1 |
| v5:30-31 | dry run default, `--write` applies | TRUE | fixture run |
| v5:30 | "works as a CI gate" | FALSE (always exit 0) | → F2 |
| v5:37-38 | `DiscPlatterDBIcon`, `BarChartAxesIcon` exist; `BarChartIcon` still exists | TRUE | exports-head.tsv |
| v5:50-53 | 5.4 brought the danger family back | FALSE as a release claim (tokens exist only on unreleased HEAD) | token-inventory.txt ADDED; → F1 |
| v5:62-67 | danger token defaults table | TRUE at HEAD | tokens.css:75-84 |
| v5:75-77 | utilities `bg-danger`, `text-danger-fg`, `border-danger-border`, `-hover/-active/-disabled`, `bg-danger-primary` | TRUE at HEAD | theme-keys-head.txt |
| v5:86-87 | exits 0 once icon renames applied | TRUE but vacuous (exits 0 always) | → F2 |
| v5:95-97 | new in v5 exports | TRUE | exports-head.tsv |
| v5:100-101 | exports/files/peers unchanged v4→v5 | TRUE | `git diff v4.8.2 v5.0.0 -- package.json` shows only dependency bumps, +react-popover, −optionalDependencies |
| codemod:15-19,44,124-126 | "5.4 reinstated" | FALSE as release claim | → F1 |

### README.md
| claim-src | claim | result | evidence |
|---|---|---|---|
| README:7 | Storybook URL | TRUE | WebFetch → Storybook page |
| README:14 | `npm install @dooph-software/design-system` | TRUE | package.json name/publishConfig |
| README:20,55 | `npx @dooph-software/design-system init-skills` | TRUE | package.json:17-19 `"init-skills": "./bin/init.mjs"` (single bin; extra arg ignored) |
| README:24-25 | root import + `styles.css` | TRUE | ex13 PASS; exports map |
| README:30-48 | per-module `"use client"` preserved, RSC import works | TRUE per baseline (48 chunks stamped); runtime `next build` not run | baseline.md:15 |
| README:58 | copies skills into `.agents/`, `.claude/`, `.agent/`; no project files modified | TRUE | bin/init.mjs:52-68, 122-130 |
| README:62-71 | six role font tokens, defaults | TRUE values / incomplete (no mono) | tokens.css:379-384 → F11 |
| README:95 | Flex axes GRAD/ROND/wdth | INCOMPLETE | → F11 |
| README:180 | `rounded-standard` | FALSE at HEAD | → F5 |
| README:185 | preset learns every `--ui-*` token | FALSE | → F15 |
| README:189-191 | preset import order | TRUE | theme.css:6-11 |
| README:208 | LICENSE link `./LICENSE` | FALSE (LICENSE.txt) | → F15 |
| README (item 7) | component list | n/a — README has no component list; defers to Storybook | — |
| README (item 7) | peer deps | not stated (react/react-dom >=19 in package.json:60-63) | → noted, not filed |

### CHANGELOG.md / CONTRIBUTING.md / SECURITY.md / THIRD_PARTY_NOTICES.md / LICENSE.txt
| claim-src | claim | result | evidence |
|---|---|---|---|
| CHANGELOG:3-6 | all notable changes documented; Keep a Changelog | FALSE | → F12 |
| CHANGELOG:13-18 | [Unreleased] Added items exist | TRUE | exports-head.tsv; tokens (shape-morph ×7 incl. nudge ×3); 12 `*_SHAPE_PATH` |
| CHANGELOG:21 | triggers use DropdownCaret, right padding 0 | TRUE (per usage:211 + DropdownCaret presence) | classes-head.txt `ds-dropdown-caret-host` |
| CONTRIBUTING:4 | PRs not accepted | UNVERIFIABLE (policy) | — |
| CONTRIBUTING:7 | issues link | FALSE (404) | → F14 |
| SECURITY:5 | only latest release gets fixes | UNVERIFIABLE (policy) | — |
| SECURITY:12 | advisory link | FALSE (404) | → F14 |
| NOTICES:10-42 | icon libraries collectively | UNVERIFIABLE (provenance not tracked per icon, as stated) | — |
| NOTICES:48-63 | runtime npm packages listed | FALSE (3 of 14 missing) | → F13 |
| NOTICES:67-85 | engine vendored from shape-morph @ f4d2697, MIT; androidx Apache-2.0 | TRUE (matches headers) | engine/{utils,polygon,morph,cubic}.ts:2-4 |
| LICENSE.txt:1-3 | MIT, © 2026 Dooph LLC | TRUE (provenance) | — |
