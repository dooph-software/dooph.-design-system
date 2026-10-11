# Reconciliation of api-diff.md (v5.3.0 → HEAD) against the change records

Inputs: `api-diff.md` (1489 lines), `docs/audit/CHANGES.md` (read in full), the
`CHANGELOG.md` `[Unreleased]` section, and the ten commits `v5.3.0..b436647`
(diffs read for every file that defines public surface: component barrels and
`constants.ts`, `utils/color.ts`, `BaseIcon.tsx`, `Shapes/index.ts`,
`tokens.css`, `dooph-component-tokens.css`).

## How every line was explained

1. **When it landed.** A third surface was extracted at `b436647` (the commit
   CHANGES.md starts from; built from a `git archive` export). For each line,
   the fact it is about was read in all three surfaces
   (`docs/audit/_work/scratch/surface-reconcile.mjs`):
   - **pre**: already at its HEAD value at b436647 → one of the ten commits
     `v5.3.0..b436647`. CHANGES.md does not cover these by design.
   - **post**: still at its v5.3.0 value at b436647 → `b436647..HEAD`, so a
     CHANGES.md entry must explain it.
   - **both**: changed in both ranges; each half explained by its own range.
2. **Which record.** Every post/both line was matched to CHANGES.md entries by
   its identifiers (`surface-match.mjs`, leads only), then checked by hand
   against the entry text. Pre lines were attributed to a commit by pickaxe
   (`git log -S<term> v5.3.0..b436647`) and by reading the commit diffs.
3. **Utility classes** were attributed to the files that write them
   (`surface-utilities.mjs` → `utility-attribution.md`), because
   `dist/styles.css` is generated from whatever text Tailwind scans.

| Section | pre | post | both | lines |
|---|---|---|---|---|
| Exports | 113 | 38 | 0 | 151 |
| Component props | 51 | 86 | 20 | 157 |
| Consts | 80 | 25 | 1 | 106 |
| Types | 64 | 74 | 18 | 156 |
| Functions | 0 | 0 | 2 | 2 |
| Tokens (tokens.css) | 125 | 135 | 4 | 264 |
| Tailwind theme (theme.css) | 69 | 7 | 1 | 77 |
| CSS classes (ds-*, text-style-*, utilities) | 226 | 342 | 0 | 568 |
| package.json | 0 | 8 | 0 | 8 |
| **Total** | **728** | **715** | **46** | **1489** |

Result:
- Every **post** and **both** line outside the generated utilities is explained
  by a CHANGES.md entry (checked by hand; the matcher's misses were all
  entries that name a family, e.g. the dark-theme entry's alias group, the
  reduced-motion block, "`TooltipTypes` → `TooltipVariant`").
- Every **pre** line is explained by one of the ten commits. None of them has a
  "breaking:" line anywhere (only the shape-morph and DropdownCaret items are in
  CHANGELOG `[Unreleased]`), so section 2 below grades them.
- **Gaps** (lines no record explains): **187**, all generated utilities in
  `dist/styles.css`; **0 breaking**. Section 1.

---

## 1. Gaps — lines no record explains

### 1.1 HEAD's `dist/styles.css` carries utilities harvested from `docs/audit/` (187 lines, not breaking)

- **Lines:** 178 "generated utilities … added" lines whose class appears
  nowhere in `src/` at HEAD, only in tracked files outside it (mostly
  `docs/audit/**`: FINDINGS.md, REMEDIATION.md, `_work/final/*.md`,
  `_work/patches/*.patch`, `_work/scratch/**` including two bundled
  `V7/web/bundle*.js`), plus 9 more (`-translate-x-1`, `-translate-y-1`,
  `left-1`, `top-1`, `w-3`, `flex-grow`, `grayscale`, `sepia`,
  `shadow-press-prominent`) that are Tailwind sub-candidates of longer tokens in
  the same files. Each is listed with its source files in
  `utility-attribution.md` ("outside src/ only" and "no hit anywhere").
- **Cause (read from code):** `src/styles/index.css` does `@import "tailwindcss";`
  with no `source(...)`, so Tailwind v4's automatic source detection scans every
  file git does not ignore, on top of `@source "../**/*.{js,ts,jsx,tsx}"`.
  `docs/audit/` is tracked, so its markdown, patches and scratch bundles feed
  the compiled sheet. Examples, all verified in `../ds-head/dist/styles.css`:
  `.backdrop-sepia`, `.border-be`, `.antialiased` (from
  `docs/audit/_work/scratch/V7/web/bundle.js`), `.motion-reduce:duration-0`
  (from `docs/audit/motion-scale.md`; the components dropped these utilities in
  the motion change), `.[grid-area:…]` and `.bg-[hsl(var(--…))]` (literal
  ellipses from FINDINGS.md), and the old Slider arbitrary widths
  `w-[max(0px,calc(var(--slider-pct)…))]` that the Slider no longer uses.
  The same effect exists, smaller, at v5.3.0 and b436647: 15 pre lines whose
  classes come only from skills and planning docs (`skills/**`,
  `.agents/skills/**` and its mirrors, `2026-09-20-visx-charts-design.md`),
  e.g. `.shadow-focus-brand`, `.bg-error-primary`, `.ordinal` (visx skill),
  `.fill-primary`. Those are explained by the commits that edited the docs.
  So it is not only `docs/audit/`: the skills the docs pass rewrites also feed
  the shipped sheet.
- **Breaking:** no. These rules match no element the package renders; a
  consumer could only notice them as dead weight in the sheet.
- **Consumer fix:** none.
- **What it means for the docs pass:** do not list any of these in the
  CHANGELOG. They change whenever `docs/audit/`, the skills or the planning
  files change (most disappear when `docs/audit/` is deleted), so the
  generated-utilities section of api-diff must be regenerated after the docs
  pass before anyone documents it. A durable fix is a build change (out of scope here):
  `@import "tailwindcss" source(none);` plus the explicit `@source`, or a
  `source("../")` base, so docs can never leak into the shipped sheet.

### 1.2 Lines explained only loosely (not counted as gaps)

- 4 utilities written only by stories (`h-12`, `mt-lg` in
  `Tabs.stories.tsx`, `h-24` in `Tooltip.stories.tsx`, `pt-md` in
  `AIChatStreaming.stories.tsx`). The story edits are covered by the stories
  entries and the spacing-rename entry, which rewrote stories too, but no entry
  names those files. Not consumer surface.
- 79 + 9 + 1 utility lines come from component source or stylesheets in files
  that a CHANGES.md entry names; `styles.css` utilities are not a consumer
  contract (README: "the exact utility classes the dooph components use
  internally"; the consumer contract for utilities is `theme.css`, diffed in
  its own section).

---

## 2. Explained by a commit in v5.3.0..b436647, recorded nowhere — breaking analysis

The ten commits: `ec73a1b` README, `52d8249` shapes & token updates,
`8a946e5` token overhaul / animated text / slider, `2004575` slider patches,
`2ab9469` planning only, `613285c` stickers, `6f2d674` toggle switch / tab
select / menu overhaul, `25a36dd` AI components, `9ce64ef` micro sticker,
`5036a8f` shape morph + dropdown caret, `b436647` inputs. Several of them mark
their own breaks with a `BREAKING (major)` comment in the source; those are
quoted below. Everything here is breaking **relative to v5.3.0**, which is what
the CHANGELOG must describe.

| # | Breaking change (before → after) | Consumer fix | Commit | api-diff lines |
|---|---|---|---|---|
| B1 | "brand" became "prominent" in every option set: `ButtonVariant.brand`, `CheckboxVariant.brand`, `LoadingSpinnerColor.brand` → `.prominent`; Toast variant values `brand` / `error` → `prominent` / `danger` (the const is also renamed post: `ToastTypes` → `ToastVariant`) | rename the key or string literal | 52d8249, 8a946e5 | consts ButtonVariant/CheckboxVariant/LoadingSpinnerColor; Button/Checkbox/ToastRoot props (pre half of "both" lines) |
| B2 | `DS_COLOR_TOKENS` / `DsColor` names: `brand` → `prominent`, `brand-color` → `prominent-color`, `brand-color-alt` → `prominent-color-ter` (same #44c0e5), `error-primary` / `error-secondary` → `danger-primary` / `danger-secondary`, `page-background` → `surface-page`; `danger` now reads `--ui-color-danger-primary` (same colour) | rename the colour name passed to `color` props | 8a946e5 | DS_COLOR_TOKENS keys; DsColor / DsColorToken; color props of LinearProgressIndicator, Slider*, ProgressIndicator, LoadingSpinner |
| B3 | Token renames (light and dark): `--ui-color-brand*` → `--ui-color-prominent*` (value changed: #4f666d grey-blue → #340fd9 violet; foreground stays white; `-border-disabled` transparent → secondary-border-disabled); `--ui-brand-color` → `--ui-prominent-color` (#46565c → #390ef8); `--ui-brand-color-alt` → `--ui-prominent-color-ter` (same value; `--ui-prominent-color-alt` is a NEW teal #13c29f); `--ui-color-error-primary/-secondary` → `--ui-color-danger-primary/-secondary`; `--ui-color-page-background` → `--ui-color-surface-page`; `--ui-color-border-focus` → `--ui-color-input-border-focus` (now the prominent hover border); `--ui-color-trigger-border-hover` → `--ui-color-input-border-hover`; `--ui-color-trigger-border-error-focus` → `--ui-color-input-border-danger-focus`; `--ui-color-focus-ring-brand` → `--ui-color-focus-ring-prominent`; `--ui-color-focus-ring-error` → `--ui-color-focus-ring-danger` (236,85,85 → 234,63,63); `--ui-shadow-focus-brand` → `--ui-shadow-focus-prominent`; `--ui-radius-standard` → `--ui-radius-normal` (18px) | rename overrides in the app's tokens.css; re-check brand colours, the value changed | 8a946e5 (52d8249 for interim values) | ~40 token lines, light and dark |
| B4 | Tailwind theme keys follow B3: `bg-brand*`/`text-brand-fg`/`border-brand-border*` → `*-prominent*`/`prominent-fg`; `*-brand-color(-alt)` → `*-prominent-color(-ter)`; `*-error-primary/-secondary` → `*-danger-primary/-secondary`; `*-page-background` → `*-surface-page`; `*-trigger-border-hover` → `*-input-border-hover`; `*-trigger-border-error-focus` → `*-input-border-danger-focus`; `*-border-focus` → `*-input-border-focus`; `rounded-standard` → `rounded-normal`; `shadow-focus-brand` / `shadow-focus-error` → `shadow-focus-prominent` / `shadow-focus-danger` | rename the utility classes in app markup | 8a946e5 | 19 theme.css "removed" lines + their "added" pairs |
| B5 | Icon sizes: `--ui-icon-tiny/-standard/-medium/-large` → `--ui-icon-sm/-rg/-md/-lg` (12/14/16px unchanged; large 20px → lg **18px**); `--ui-icon-stroke` → `--ui-icon-stroke-width`; `IconSize.tiny/.standard/.medium` → `.sm/.rg/.md` (new `.lg`) | rename keys and token overrides; re-check anything sized `large` | 52d8249 | IconSize keys; 5 token lines |
| B6 | Shapes: `GemShape` and `Shapes.gem` removed; `ShapeButtons.arrow`, `.gem`, `.star` removed (ShapeButton offers clover, cookie, diamond, puff, squircle) | pick another shape (e.g. `DiamondShape`; no like-for-like gem) | 52d8249 | GemShape export; Shapes/ShapeButtons keys; ShapeButton `shape` |
| B7 | `DropdownMenuVariant` and the `variant` prop on `DropdownMenu` / `DropdownMenuContent` removed; `--ui-min-w-menu-action` and `.ds-menu-w-standard/-action/-complex` removed. Source comment: "BREAKING (major): DropdownMenuVariant (standard/action/complex) was removed. Items hold the 160px floor; set DropdownMenuSection `width` for wider menus." | drop `variant`; use `DropdownMenuSection width` (complex = `var(--ui-min-w-menu-complex)`) | 6f2d674 | 7 lines |
| B8 | `DropdownMenuCheckboxItem` removed | `DropdownMenuMultiSelectItem` inside `<DropdownMenu selectType={DropdownMenuSelectType.multi}>` (or `DropdownMenuRadioSelectItem` for single) | 6f2d674 | 1 line |
| B9 | `TwoWayToggle` / `TwoWayToggleItem` (+ `…Props`) renamed `ToggleSwitch` / `ToggleSwitchItem`, same props; `ToggleVariant.secondary` → `ToggleVariant.ghost` (source: "BREAKING (major): `secondary` was renamed `ghost` to match Figma") | rename components, types and the variant | 6f2d674 | 4 export lines, ToggleVariant key |
| B10 | `SegmentedVariant` lost `secondary`, `ghostSmall`, `secondarySmall`, `primarySmall`, `micro`; size moved to a new `SegmentedSize` (`container`, `standard`, `containerIcon`, `icon`). **Default changed** from `secondary` to `primary` + `container` (source: "a silent visual change for no-prop callers") | combine `variant` + `size`; pass the old look explicitly | 6f2d674 | 7 lines |
| B11 | `.ds-focus-ring-error-on-focus` → `.ds-focus-ring-danger-on-focus` | rename the class | 8a946e5 | 2 lines |
| B12 | Type-level: `InputProps` (b436647) and `SliderProps` / `SliderLabeledProps` (8a946e5) changed from interfaces to union types, so `interface X extends InputProps` / `extends SliderProps` no longer compiles | use `type X = InputProps & {…}` | b436647, 8a946e5 | 3 "declared as interface → type" lines |
| B13 | Visual: dark `--ui-color-focus-ring-primary` rgba(23,23,23,.15) → rgba(249,249,249,.15) (a fix: the dark ring was invisible) | none (re-check custom dark rings) | 52d8249 | 1 line |

Not breaking (additions or internal), all explained by their commit:
- New components and their props/consts/types: Sticker (613285c, 9ce64ef);
  ToggleSwitch row options and toggleOption sizes `icon`, `icon-sm`
  (6f2d674; `icon-sm` is renamed post); DropdownMenuSelectType /
  MultiSelectItem / RadioSelectItem / PlainItem / Segment / Section `width`
  (6f2d674); AI chat family (25a36dd); MorphRotationShape, ShapeMorphSpinner,
  DropdownCaret, `*_SHAPE_PATH` constants and the shape-morph tokens
  (5036a8f — already in CHANGELOG `[Unreleased]`); Input `variant` /
  `InputVariant` (b436647); Slider `variant` / `stepColor` / `SliderVariant`
  (8a946e5, 2004575); Text `heroBody` / `heroButton` roles and their tokens
  (8a946e5); `--ui-tracking-mono` (b436647); TabSize `iconMicro`, TabVariant
  `unselected` (6f2d674); new shapes Capsule, Diamond, Double, Pixircle,
  Squircle, Triple (52d8249); `--ui-spacing-xxxs` 2px (52d8249); the danger
  button token family and danger focus ring (52d8249 as `error-*`, renamed in
  8a946e5 — net new relative to v5.3.0).
- 14 "declared in a different folder" lines: RevealChangeText,
  RollChangeText, RollHoverText, RollingDigitsText, ShimmerText,
  UnderlineLinkText, RevealDirection, RollDirection and their props types moved
  from `Text/` to `AnimatedText/` (8a946e5). The package-root import is
  unchanged; not consumer-visible.
- 197 generated-utility lines follow the component markup of these commits
  (attributed per class in `utility-attribution.md`).

---

## 3. Notes for whoever writes the CHANGELOG from CHANGES.md

### 3.1 Under-claimed breaks: CHANGES.md says "no" or "minor", but v5.3.0 code breaks

Every api-diff line after b436647 (and every "both" line) that removes,
narrows or retypes something, or adds a required prop, was re-graded against
its CHANGES.md entry: **164 lines** — 109 breaking and recorded as breaking,
40 not breaking, **11 under-claimed**, 4 breaking but only implied by an entry
that names another component. The full per-line table is
`breaking-regrade.md` (generated by `scratch/surface-regrade.mjs`, which fails
on any line its hand-written rules do not grade). Compile-time claims were
checked with a tsc probe of v5.3.0-valid code (`__probe__/usage-probe.tsx`
and `extends-probe.ts`) compiled against v5.3.0, b436647 and HEAD: each
listed probe compiles at v5.3.0 and b436647 and fails at HEAD.

| # | Change (before → after) | CHANGES.md entry and its grade | Evidence | Consumer fix |
|---|---|---|---|---|
| U1 | `CTAButton` `children` accepted only with `asChild`: `<CTAButton text icon href>Label</CTAButton>` compiled (children were silently dropped) → TS2769 | "CTAButton `children` type-checks only with `asChild`" — breaking: no (minor) | api-diff CTAButton `asChild` / `children` lines; probe | drop the children and pass the label as `text`, or use `asChild` with one element child |
| U2 | `Button` `variant` × `size` became a discriminated union (pill sizes only on prominent/primary/secondary): (a) `interface X extends ButtonProps` → TS2312; (b) a `variant` typed `ButtonVariant` with a `size` typed `ButtonSize` → TS2322 | "Button gets `medium` (46px) and `big` (54px) pill sizes" — breaking: no | api-diff Button `variant` / ButtonProps `variant` lines; probe: `extends ButtonProps` passes at v5.3.0 and b436647, fails at HEAD | (a) `type X = ButtonProps & {…}`; (b) narrow one of the two (e.g. `Exclude<ButtonSize, "medium" \| "big">`) |
| U3 | `CopyButton` props stopped being `any`: `<CopyButton />` (no `value`), `size`, `asChild`, `children`, unknown props → compile errors | "CopyButton's props are real types, and `value` is required" — breaking: "no at runtime … minor-level type fix" | api-diff CopyButton `value: string` line; probe (three forms) | pass `value`; drop `size`/`asChild`/`children` |
| U4 | `DEFAULT_CALENDAR_PRESETS` / `DEFAULT_SPLIT_TRIGGER_PRESETS` became `readonly CalendarPreset[]`: assigning them to `CalendarPreset[]` or calling `.push()` → TS4104 | "Orchestrator follow-up after wave F: readonly presets" — breaking: no | api-diff const lines; probe | copy first: `[...DEFAULT_CALENDAR_PRESETS]` |
| U5 | `ShapeProps.size` widened `number` → `number \| string`: code that reads it as a number (a wrapper doing `p.size * 2`) → TS2362 | "Hero CTA: fixed shapes" — not graded for this (breaking line covers tokens only) | api-diff ShapeProps / shape `size` lines; probe | handle the string case (or `Number(p.size)`) |
| U6 | Shape components are typed `DsShapeComponent` (`FunctionComponent`): calling one as a function and typing the result `JSX.Element` → TS2322 (returns `ReactNode`) | "One `createShape` factory … `DsShapeComponent` brand" — breaking: no ("Edge only") | probe only: the diff does not compare component return types | render as JSX, or type the result `ReactNode` |
| U7 | Token defaults moved into `@layer ds.tokens`: an unlayered consumer override now always wins, whatever its import order or specificity — including over the DS `.dark` values and (before the `!important` follow-up) the reduced-motion block | "Expression system: cascade layers" — breaking: "no for the API", asks to flag it | api-diff "cascade layer: unlayered → ds.tokens" (light, dark) | scope light-only overrides to `:root:not(.dark)` / `.light`; keep your own reduced-motion block if you override motion |
| U8 | `ProgressIndicator` now throws on `progress={NaN}` (drew a full ring) | "ProgressIndicator throws on `progress={NaN}`" — breaking: no (was a bug) | runtime; no api-diff line | guard `total === 0` before dividing |
| U9 | `LoadingSpinner` renders `role="progressbar"` (was `role="status"`) | "Both indeterminate loaders: role `progressbar`" — breaking: no (minor) | runtime; no api-diff line | tests: query `getByRole("progressbar")` |
| U10 | `RollHoverText` root lost `aria-label={children}` (words now in an sr-only span) | "RollHoverText exposes its words through an sr-only copy" — breaking: no (patch) | runtime; no api-diff line | tests that used `getByLabelText(text)` query the text instead |
| U11 | `cn()` merges DS classes with their Tailwind counterparts: `cn("rounded-tight","rounded-full")`, `cn("p-md","p-lg")`, `cn("h-button","h-8")` now keep only the last (both were kept) | "`cn` knows every text-style role and the DS size/radius/spacing/shadow scales" — breaking: no | runtime output of an exported function; no api-diff line | none for most apps; code that relied on both classes surviving must not |
| U12 | Component spacing moved from Tailwind's rem scale to px tokens: in an app whose root font size is not 16px, Button, SplitButton, SearchBox, Tabs, Toast, Table and others change size | "Spacing and fixed sizes follow tokens" — breaking: no ("no visual change at a 16px root") | runtime layout; no api-diff line | none at 16px; otherwise re-check layouts |

Breaking but named under another component (NAMED-ELSEWHERE, 4 lines):
`SegmentedTabItem` / `SegmentedTabItemProps` `size` and `variant` lose
`"default"` and `null`, because `SegmentedTabItemProps extends
TabsTriggerProps`. The "Size words" and "no longer accept `null`" entries name
TabsTrigger only; the CHANGELOG must name SegmentedTabItem too. Fix:
`size="standard"`, `undefined` for the default.

Checked and **not** a break (despite looking like one in the diff):
`VerificationCodeInput` lost its own `aria-label` prop, but it is still
accepted through `HTMLAttributes` (probe compiles at HEAD) and the default
name is unchanged; the same holds for `SplitButton` `children` / `className`
and `SplitButtonTrigger` `aria-label`. `IconProps` became a type alias but is
an intersection, so `interface X extends IconProps` still compiles.
`CTAButton`'s ref retype breaks only a callback ref typed
`(el: HTMLAnchorElement)`; a `RefObject<HTMLAnchorElement>` still compiles.

### 3.2 Over-claimed breaks: CHANGES.md says "yes", but not relative to v5.3.0

Several CHANGES.md entries say "breaking: yes — v6" for things that are only
breaking relative to b436647, because what they change was added in
`v5.3.0..b436647` and never released. Relative to v5.3.0 (what users have):

| CHANGES.md entry | Breaking vs v5.3.0? |
|---|---|
| Spacing scale renamed to match Figma | yes, all of it |
| Size words, Tooltip/Toast variant names, micro height | yes, except `ToggleSize.iconSm` → `iconMicro`: `iconSm` was never released (v5.3.0 ToggleSize = `default`, `sm`), so for users ToggleSize simply gains `icon` and `iconMicro` |
| Motion runs on one shared scale (29 tokens removed) | 17 of the 29 were released. Never released, so not breaking: `--ui-chat-reveal-*`, `--ui-chat-stream-duration/-ease`, `--ui-chat-disclosure-*`, `--ui-fade-change-in/out-*` (4), `--ui-shape-morph-nudge-duration/-ease` |
| Value controls named `value` / `onValueChange` | yes (VerificationCodeInput, DatePicker, Calendar, DatePickerSplitTrigger, CalendarPresetItem all existed in v5.3.0) |
| OutlineButton `inverseTheme` → `themeInverse` | yes |
| Input icon variants require an icon element | **no** — Input had no `variant` in v5.3.0 (its only own prop was `hasError`) |
| Const renames `FontAxes`, `ProgressIndicatorVariants` | yes |
| Removed exports (`formatTriggerLabel`, `serializeAxes`, `checkboxVariants`, `isSameDay`, `startOfDay`, `formatRangeLabel`, `formatSingleLabel`; `.ds-focus-ring`, `.ds-my-ui-xs`) | yes; `stickerVariants` **no** (Sticker is new) |
| Hero CTA token/helper removals | yes (`--ui-size-cta-icon`, `.ds-size-cta-icon`, `--ui-min-w-cta-pill-big`, `.ds-min-w-cta-pill-big` all existed) |
| LPI `value={null}`, CopyButton ref, CTAButton ref | yes (v5.3.0 refs: CopyButton `HTMLElement`, CTAButton `HTMLAnchorElement`) |
| `ds-disabled-control` removed | yes |
| `null` no longer accepted on Button/SheetContent/Checkbox/TabsTrigger | yes |
| `IconSize` type narrowed from `string` | yes (type-level) |
| Number Input fills its container (`autoWidth`) | **no** — number variants are new since v5.3.0 |
| Number Input entry filter, `min`/`max`, `hasError` precedence | only the `min`/`max` type (`number \| string` → `number`, which also applies to the plain text Input); the rest concerns the new number variants |
| Text always set by a Text component (`buttonVariants` / `tabTriggerVariants` lose typography) | yes |
| Expression system (token cascade layers) | yes, behaviour: precedence of overrides changed for every token |
| AIThinkingEffortSelector throws on an unknown value | **no** — AI chat parts are new |
| LoadingSpinner role `status` → `progressbar` | yes, behaviour (tests querying `status`) |
| FancyToggleSwitch multi-select removed, ShapeMorphSpinner default size | no (never released) |

Other things the api-diff shows that a reader of CHANGES.md alone could miss:
- Class **names** only are diffed. The spacing-helper classes `ds-{p,px,py,pl,pr,gap}-ui-*`
  kept some names with new values (e.g. `.ds-pl-ui-md` was 16px, is 12px); the
  diff shows only the names that appeared or vanished. The spacing-rename
  entry covers the meaning change.
- `ds-progress-arc` was added and removed inside `b436647..HEAD`, so it is not
  in the diff; nothing to document.
- The CTA hover tilt (entry 10, part B) was reverted by entry 11 and is not in
  the diff; drop its CHANGELOG line as entry 11 says.
- `--ui-height-tab-micro` was 30px in v5.3.0 (28px only at b436647): users see
  tab micro go 30px → `--ui-height-button-micro` 28px.
- The prominent colour itself changed (B3), so any app that used the old
  `brand` look sees a different hue even after renaming.
