# Claims: dooph-design-system-v3-migration

Skill: `skills/dooph-design-system-v3-migration/SKILL.md` as it stood at HEAD (commit 0dac153) before this pass. One atomic claim per line, with verdict and evidence.

**Baseline.** OLD = `v2.1.0` (last v2 tag). NEW = the v3.x line: `v3.0.0` plus the v3 minors up to `v3.4.0`, because the skill says "v2.x to v3.x" and was first shipped in `v3.1.0` (commit b9de625 is after the 3.0.0 tag) and amended through v3.x. Where a claim only became true in a v3 minor, the evidence says which.

Method: `git show <tag>:<path>`, read-only. Token and theme-key lists from `src/styles/tokens.css` / `src/styles/theme.css`; public exports by following `src/index.ts` re-exports; option-const keys from `export const X = {…}` in `src/components`. Helper scripts in the session scratchpad (`exports.mjs`, `consts.mjs`).

**Where the HEAD text came from.** The skill shipped unchanged from v4.0.0 to v5.3.0 (same blob at every tag). Commit 8a946e5 (after v5.3.0, in no tag: `git tag --contains 8a946e5` is empty) re-pointed the rename targets at the unreleased v6 names and called them "the CURRENT (5.4) ones". No 5.4 tag exists, and none of those names exists in any release (table below).

| Name | v3.4.0 | v4.8.2 | v5.3.0 | HEAD (unreleased) |
|---|---|---|---|---|
| `--ui-color-focus-ring-error` / `-danger` | error | error | error | danger |
| `--ui-color-page-background` / `--ui-color-surface-page` | page-background | page-background | page-background | surface-page |
| `--ui-color-focus-ring-brand` / `-prominent` | brand | brand | brand | prominent |
| `--ui-brand-color(-alt)` / `--ui-prominent-color(-alt)` | brand | brand | brand | prominent |
| `--ui-radius-standard` / `-normal` | standard | standard | standard | normal |
| `--ui-color-trigger-border-error-focus` / `--ui-color-input-border-danger-focus` | trigger | trigger | trigger | input |

## Counts

TRUE 39 · FALSE 17 · UNVERIFIABLE 4 (60 claims). FALSE claims were all fixed in the skill.

## Frontmatter and opening

- TRUE — Symptoms: removed v2 names (bare border/surface utilities, destructive/logo/accent-color tokens, `ButtonVariant.destructive`). Evidence: tokens removed v2.1.0→v3.0.0 include `--ui-color-border`, `--ui-color-surface`, `--ui-color-destructive*`, `--ui-color-logo`, `--ui-accent-color`; theme keys `--color-border`, `--color-surface`, `--color-destructive*` removed; ButtonVariant keys v2.1.0 `brand,destructive,…` → v3.4.0 `brand,danger,…`.
- TRUE — No back-compat aliases: old token names and the `destructive` variant are deleted. Evidence: none of the removed tokens is defined at v3.0.0 or v3.4.0; `ButtonVariant.destructive` absent at v3.0.0.
- TRUE — The package itself is not modified; only the app's overrides and usages change. (Instructional.)

## Prerequisite: the Tailwind preset

- TRUE — The package ships `@dooph-software/design-system/theme.css`. Evidence: v3.0.0 package.json `exports["./theme.css"] = "./dist/theme.css"`.
- TRUE — It is a standalone `@theme inline` block. Evidence: v3.0.0 src/styles/theme.css line 20 `@theme inline {`.
- FALSE — It "registers every `--ui-*` token". Evidence: v3.0.0 has 138 `--ui-*` definitions but 95 theme keys; scripts/sync-theme.mjs:57 `EXCLUDED` drops the weight, tracking and font-axis tokens. **Fixed:** "registers dooph's `--ui-*` scales".
- TRUE — The preset makes `bg-danger`, `bg-surface-primary`, `border-border-primary` generate. Evidence: v3.0.0 theme keys `--color-danger`, `--color-surface-primary`, `--color-border-primary`.
- UNVERIFIABLE — Without the preset "a same-named Tailwind default silently wins (`font-sans`, the numeric spacing scale)". Tailwind behaviour in the consumer's build; no repo evidence either way. Left as is.
- TRUE — Import order snippet: `tailwindcss`, then `styles.css`, then `theme.css`. Evidence: v3.0.0 theme.css header lines 6-11 give the same order.
- TRUE — `@theme inline` means utilities emit `var(--ui-*)`, so runtime overrides keep resolving. Evidence: every v3.0.0 theme line is `--key: var(--ui-…)`.
- UNVERIFIABLE — No `tailwind.config` or `@source` change is needed. Tailwind v4 picks up `@theme` from an imported file; not checkable from repo code. Left as is.
- TRUE — Spacing scale `xxs xs sm rg md lg xl xxl`. Evidence: v3.0.0 theme.css:94-101.
- FALSE (HEAD) — Radius scale `tight normal soft`, utility `rounded-normal`. Evidence: v3.0.0–v5.3.0 define `--ui-radius-standard`; `--ui-radius-normal` exists only at HEAD. **Fixed:** `standard` / `rounded-standard` (the shipped v3 text).
- TRUE — `bg-primary`, `text-danger-fg`, `border-border-primary`, `bg-surface-primary`. Evidence: v3.0.0 theme keys `--color-primary`, `--color-danger-fg`, `--color-border-primary`, `--color-surface-primary`.
- TRUE — `font-body/button/label/heading`, `text-body/label/heading/title/hero`. Evidence: v3.0.0 theme keys `--font-*`, `--text-*`.
- TRUE — `text-style-button` and friends ship precompiled in `styles.css`. Evidence: v3.0.0 src/styles/index.css:120-121.

## Step 1: token overrides

- TRUE — `--ui-color-destructive*` (nine) → `--ui-color-danger*`. Evidence: v2.1.0 tokens.css:56-64 vs v3.0.0 tokens.css:54-62 (same suffixes).
- FALSE (HEAD) — `--ui-color-destructive-focus-ring` → `--ui-color-focus-ring-danger`. Evidence: v3.0.0 tokens.css:104 `--ui-color-focus-ring-error`; `-danger` exists only at HEAD. **Fixed:** `--ui-color-focus-ring-error`.
- TRUE — `--ui-color-border` → `--ui-color-border-primary`. Evidence: v3.0.0 tokens.css:89.
- TRUE — `--ui-color-surface` → `--ui-color-surface-primary`. Evidence: v3.0.0 tokens.css:72 (`#ffffff`, as v2's surface).
- FALSE (HEAD, by omission) — the row `--ui-color-surface-page` → `--ui-color-page-background` was deleted at HEAD. Evidence: v2.1.0 tokens.css:75 `--ui-color-surface-page: #fdfeff`; v3.0.0 tokens.css:71 `--ui-color-page-background: #fdfeff`; surface-page is not defined at v3.0.0–v5.3.0. **Fixed:** row restored.
- FALSE (HEAD) — `--ui-color-focus-ring` → `--ui-color-focus-ring-prominent`. Evidence: v3.0.0 tokens.css:102 `--ui-color-focus-ring-brand` (same value `rgba(70, 86, 92, 0.35)` as v2's). **Fixed:** `-brand`.
- FALSE (HEAD) — `--ui-color-logo` → `--ui-prominent-color`. Evidence: v3.0.0 tokens.css:107 `--ui-brand-color: #46565c` (v2 logo value). **Fixed.**
- FALSE (HEAD) — `--ui-accent-color` → `--ui-prominent-color-alt`. Evidence: v3.0.0 tokens.css:108 `--ui-brand-color-alt: #44c0e5` (v2 accent value). **Fixed.**
- TRUE — `--ui-color-logo-alt` removed with no replacement. Evidence: absent at v3.0.0; no v3 token carries `#a1aaa5`.
- TRUE — `--ui-color-avatar-bg` removed; Avatar derives from surface-secondary, border-secondary and the brand colour. Evidence: v3.0.0 Avatar.tsx:21-22 `bg-surface-secondary … border-border-secondary`, `text-brand-color`. (HEAD named the tint `--ui-prominent-color`: FALSE for v3, fixed with the rows above.)
- FALSE (HEAD) — "Unchanged: `--ui-color-surface-page`". It was removed at v3.0.0 (above). This is the root of the done-check defect: Pass A greps `surface-page`, which HEAD listed as unchanged. **Fixed:** the shipped unchanged list (primary/secondary/brand bg+border, `--ui-color-border-focus`, `--ui-color-trigger-border-hover`, popovers, modal, focus-ring-primary, ghost, text), which is TRUE: each is defined at both v2.1.0 and v3.0.0.
- TRUE — `--ui-color-focus-ring-primary`: name unchanged, default moved. Evidence: v2.1.0 `rgba(23, 23, 23, 0.17)` → v3.0.0 `rgba(23, 23, 23, 0.25)`.
- FALSE — "all font / spacing / radius / sizing tokens" unchanged. Evidence: v3.1.0 tokens.css:169-170 renamed `--ui-width-toast` → `--ui-width-toast-simple` and `--ui-width-toast-action` → `--ui-width-toast-complex` (same 230px / 360px; commit 5a12b09 "feat!: … Toast simple|complex"). **Fixed:** two rows added, and the unchanged sentence excepts them.
- TRUE — New optional tokens: `--ui-color-border-secondary`, the slider geometry tokens, `--ui-shimmer-base` / `-highlight`. Evidence: v3.0.0 added-token list.
- FALSE (HEAD) — `--ui-color-input-border-danger-focus` (defaults to the danger border). Evidence: v3.0.0 tokens.css:94 `--ui-color-trigger-border-error-focus: var(--ui-color-danger-border)`. **Fixed:** the v3 name. The default claim is TRUE.
- FALSE — The "CURRENT (5.4)" note: no 5.4 release exists, and every name it lists as current exists only at HEAD (table at top). **Fixed:** note removed; replaced by a forward note.

## Step 2: utility classes

- TRUE — `bg-destructive` → `bg-danger`, `text-destructive-fg` → `text-danger-fg`, `border-destructive` → `border-danger` / `border-danger-border`. Evidence: v2.1.0 theme keys `--color-destructive`, `--color-destructive-fg`, `--color-destructive-border` → v3.0.0 `--color-danger`, `--color-danger-fg`, `--color-danger-border`.
- TRUE — `border-border` (bare) → `border-border-primary`; `bg-surface` (bare) → `bg-surface-primary`. Evidence: theme key `--color-border` / `--color-surface` removed, `-primary` added.
- FALSE (HEAD, by omission) — the `bg-surface-page` → `bg-page-background` row was deleted, though the caution below still says to rename `bg-surface-page`. Evidence: v2.1.0 theme key `--color-surface-page` removed; v3.0.0 `--color-page-background` added. **Fixed:** row restored.
- FALSE (HEAD) — `text-logo` → `text-prominent-color`. Evidence: v3.0.0 theme key `--color-brand-color`. **Fixed:** `text-brand-color`.
- FALSE (HEAD) — `shadow-focus-destructive` → `shadow-focus-danger`. Evidence: v3.0.0 theme key `--shadow-focus-error`. **Fixed:** `shadow-focus-error`.
- TRUE — Do not touch `border-border-secondary` / `-popovers`; leave `bg-surface-secondary`. Evidence: theme keys present at v3.0.0.

## Step 3: component API

- FALSE — "Three things changed": the button variant, the text constants, the sidebar icons. Also changed: `ToastTypes.standard` → `.simple`, `.action` → `.complex` (v3.1.0, commit 5a12b09, "BREAKING"); `ThinkingIcon` → `AIThinkingIcon` (an alias until v3.1.1, removed in v3.2.0; identical paths). **Fixed:** both added; the count corrected.
- TRUE — `ButtonVariant.destructive` → `ButtonVariant.danger`. Evidence: const keys v2.1.0 vs v3.0.0.
- TRUE — `TextFontFamily` → `Fonts`, `TextFontSize` → `FontSizes`, `TextFontWeight` → `FontWeights`, `fontFamily` → `font`. Evidence: v3.4.0 exports `Fonts`, `FontSizes`, `FontWeights`, not `TextFont*`; v3.4.0 BaseText.tsx props `font, fontSize, fontWeight, lineHeight, letterSpacing, axes`. Landed in v3.4.0, not v3.0.0.
- TRUE — Values are `var(--ui-*)` strings applied as inline style. Evidence: v3.4.0 BaseText.tsx doc comment and `style={{...typography, ...style}}` from `buildTextStyle`.
- UNVERIFIABLE — In v2, `fontSize` and `fontFamily` lost to the variant's own class. v2.1.0 BaseText emits `font-*`/`text-*` utilities beside a `.text-style-*` class in the same `utilities` layer; who wins depends on emitted order in the build. Not built here. Left as is.
- TRUE — `fontSize` / `fontWeight` accept raw values; `lineHeight`, `letterSpacing`, `axes`, `unstyled` are new. Evidence: v3.4.0 BaseText.tsx doc example `fontSize={16} fontWeight={450} lineHeight={1.6}`, `unstyled` prop.
- TRUE — `Left/RightSidebarOpened/ClosedIcon` removed; `SidebarLeftIcon`, `SidebarLeftHoverIcon`, `SidebarRightIcon`, `SidebarRightHoverIcon` added. Evidence: export diff v2.1.0 → v3.0.0.
- TRUE — The sidebar change is semantic (open/closed → rest/hover). Evidence: the names; consistent with the export diff.
- FALSE — "Those are the only changed exports — `ButtonSize`, every other variant enum, and all component names are unchanged." `ToastTypes` keys changed and `ThinkingIcon` was removed (above). **Fixed.**

## Step 4: visual changes

- TRUE — v2 pinned every text role to `line-height: 1`; v3 sets none. Evidence: `line-height: 1;` appears 6 times in index.css through v3.3.0, 0 times at v3.4.0.
- TRUE — 1.5 under Tailwind preflight. (Tailwind preflight sets `line-height: 1.5` on `html`.)
- TRUE (narrowed, see the claim-check fixes below) — `Button` and `Input` keep their fixed height; their text stays centred to within half a pixel. Evidence: render of v3.3.0 vs v3.4.0 CSS.
- TRUE — The role class moved to the `components` layer. Evidence: `.text-style-*` inside `@layer components` at v3.4.0 (6 rules), inside `@layer utilities` through v3.3.0.
- TRUE — Danger button text is dark in light mode, white in dark mode. Evidence: v3.0.0 tokens.css:60 `--ui-color-danger-foreground: #161616; /* Figma: Text/primaryText */` (same value as `--ui-color-text`), :253 `#ffffff`; v2.1.0 `#ffffff` in light.
- TRUE — The default danger red shifted `#e93b3b` → `#ec5555`. Evidence: v2.1.0 tokens.css:56, v3.0.0 tokens.css:54.
- TRUE — The standard border tone changed slightly. Evidence: `#dfe3e5` → `#dddddd`.

## Step 5: new in v3

- TRUE — `TextLink`, `CopyButton`, `SliderContinuous` / `SliderStepped` / `SliderLabeled`, `LinearProgressIndicator`, `StarShape`, `ShimmerText`, `RollChangeText`, `RollHoverText` (v3.3.0), `ButtonSize.iconMicro`, `ShapeButtons.star`, `DropdownMenuVariant` (v3.1.0). Evidence: export and const diffs v2.1.0 → v3.4.0.
- TRUE — `@radix-ui/react-slider` and `@radix-ui/react-progress` are dependencies. Evidence: v3.0.0 package.json dependencies.

## Step 6: verify

- TRUE (after the fixes) — Pass A names only removed names: `destructive`, `surface-page`, `--ui-color-logo`, `avatar-bg`, `text-logo`, `shadow-focus-destructive` are all gone at v3.x. At HEAD the skill listed `surface-page` as unchanged, so the check could never reach zero; with the v3-true table it is a removed name again.
- FALSE — Pass A's `accent-color` also matches the standard CSS property `accent-color`, a name that is still current, so a consumer who styles a checkbox with it never reaches zero. **Fixed:** the pattern now matches `--ui-accent-color` only.
- TRUE — Pass B needs PCRE2; `-e` is needed because the pattern starts with `--`. (ripgrep behaviour.)
- TRUE — The fallback's allowed longer names (`-primary`, `-secondary`, `-popovers`, `-focus`; `bg-surface-secondary`) exist at v3.0.0.

## Gaps (not false claims; nothing rewritten)

- v2 helper classes removed by v3.x and not named: `.ds-font-weight-regular/-medium/-semibold/-bold` (v2 BaseText's weight classes), `.ds-toast-width`, `.ds-toast-action-width`. `.ds-focus-ring-destructive-on-focus` is caught by Pass A's `destructive`.
- v2 utilities from removed theme keys not in the class table: `*-accent` (`--color-accent`), `*-logo-alt`, `*-avatar-bg`. Pass A catches `avatar-bg` and `text-logo-alt` (substring of `text-logo`), not `bg-accent` / `text-accent`.
- The v3 → v4 step has no migration skill. `FundingIcon` and `ReviewQueueIcon` left the published package in v4.2.0 (files deleted in commit a042a60; the build regenerates `Icons/index.ts` from the folder, though the tracked file kept the export lines until v4.4.0). Now covered by the v5 skill's step 4.

## Forward compatibility (for whoever writes the v6 skill)

This file ships in the v6 tarball. At HEAD, several v3 targets are renamed again (table at top), and `--ui-color-surface-page` comes back as a current name. A consumer who runs this skill's done-check after the v6 migration gets hits on the current name. The forward note says to run this migration first, then the later skills in order; the v6 skill must list the v3 targets above as its before-names (writing-version-migrations, migration-skill-shape.md §5.3).

## Claim-check fixes (batch 8)

Re-verified each finding from docs/audit/_work/docs-pass/claim-check/batch-8-migrations-v3-v5.md before editing.

- FALSE → fixed — Intro: "a mechanical rename sweep across three surfaces … 3. `ButtonVariant.destructive`". Step 3 lists five changes, and the sidebar icons are a semantic change. Now: "mostly a rename sweep … 3. The component API in your TSX (`ButtonVariant.destructive`, `ToastTypes`, the Text constants, and some icon names). One of these, the sidebar icons, is a semantic change, not a rename (step 3)."
- FALSE → fixed — Done-check: Pass A + Pass B missed `--ui-color-focus-ring`, `--ui-width-toast`, `--ui-width-toast-action` and bare `border-border` (all removed: focus-ring at v3.0.0, toast widths at v3.1.0, theme key `--color-border` at v3.0.0). Pass B now greps all four with lookaheads; tested on a scratch fixture (removed names hit; v3.4.0 longer names `-brand/-error/-primary`, `-simple/-complex/-viewport`, `border-border-primary/-secondary/-popovers`, `bg-surface-primary/-secondary` do not). The fallback list names the allowed longer names per family (v3.4.0 tokens.css: `--ui-width-toast-viewport` also exists). The section now says a clean build proves nothing, since both failure modes are silent.
- FALSE → fixed — Danger text "uses the primary text token". v3.0.0 and v3.4.0 tokens.css:60 `--ui-color-danger-foreground: #161616;` is a literal, not `var(--ui-color-text)`. Now: "`#161616`, the same colour as the primary text token but set separately, so retuning `--ui-color-text` does not move it".
- FALSE → fixed — Typography utilities recommended (`font-label`, the font role and font size rows, the `text-style-button` aside, "Audit those call sites"). The facts were true, but the advice contradicts the usage skill. Not needed for the step: v2.1.0 and v3.4.0 theme.css have the same `--font-*` / `--text-*` keys, so nothing was renamed. Rows, aside and the `font-label` example removed; one paragraph says typography goes through Text component props (exist since v3.4.0: BaseText `font`, `fontSize`, `fontWeight`, `lineHeight`, `letterSpacing`) and points to `dooph-design-system-v6-migration` for later majors. `leading-*` / `tracking-*` bullet now says delete or move to the `lineHeight` / `letterSpacing` prop.
- UNVERIFIABLE → verified and narrowed — "fixed-height controls (buttons, inputs) are unaffected". Built v3.3.0 and v3.4.0 `src/styles/index.css` with the Tailwind CLI in the scratchpad, rendered the v3.4.0 `buttonVariants` default and `sm` classes and the `Input` classes in Chromium: heights 38 / 34 / 38 px in both versions; line-height 14px → 21px; button text box moved 0.5px (top inset 10 → 9.5, 8 → 7.5); screenshots identical by eye. Now: "`Button` and `Input` keep their fixed height either way, and their text stays centred to within half a pixel."
