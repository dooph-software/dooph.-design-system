# Claim check, batch 2: styling + editing-tokens skills, and the lint `why` strings

Checked 2026-10-11 against the working tree (HEAD 8493906 plus uncommitted changes). Read-only. Evidence comes from file:line reads; from `node scripts/check-conventions.mjs` (exit 0, "conventions: 30 checks passed"); from tailwind-merge 3.6.0 run with the DS theme from `src/utils/twMergeTheme.ts` (a scratch script outside the repo); from the three blast-radius greps in recipes.md, run as written; and from one browser probe in the desktop app's built-in Chromium (UA Chrome/152): an inline SVG on a scratch tab at example.com. The tab was closed afterwards. Facts about dark islands and layers rely on `docs/audit/_work/docs-pass/theming-proof.md`, which is cited where used.

## Summary

| doc | claims | TRUE | FALSE | UNVERIFIABLE |
|---|---|---|---|---|
| .agents/skills/dooph-ds-styling/SKILL.md | 39 | 38 | 1 | 0 |
| .agents/skills/dooph-ds-styling/references/expressive-details.md | 21 | 20 | 1 | 0 |
| .agents/skills/dooph-ds-editing-tokens/SKILL.md | 30 | 29 | 1 | 0 |
| .agents/skills/dooph-ds-editing-tokens/references/recipes.md | 33 | 33 | 0 | 0 |
| scripts/check-conventions.mjs CHECKS `why` strings | 30 | 25 | 5 | 0 |
| **total** | **153** | **145** | **8** | **0** |

## FALSE claims

### F1. styling SKILL.md:39: SVG geometry attributes and var()
- **Claim:** "SVG geometry attributes (`width`, `r`, `cx`…) cannot resolve `var()`."
- **Evidence:** In the built-in Chromium (Chrome/152), a `<div>` set `--w: 40px`, `--r: 7px` and `--c: red`, and held `<svg width="var(--w)" height="var(--w)">` containing `<rect width="var(--w)" fill="var(--c)">` and `<circle r="var(--r)" stroke="var(--c)">`. Every attribute resolved: svg bounding width 40, rect computed `width` 40px with getBBox width 40, circle computed `r` 7px with bbox 14, fill and stroke both `rgb(255, 0, 0)`. The maintainer's memory note `project_charts_visx_cascade_facts.md` recorded the same in Chromium earlier: "`rx="var(…)"` … compute to the token value", and "`src/` asserts four times that an SVG attribute 'cannot resolve var()'. In Chromium it resolves." Other engines were not tested.
- **Fix:** "Never put `var()` in an SVG geometry attribute (`width`, `r`, `cx`…). Whether an attribute resolves `var()` varies by engine (Chromium resolves it), and the house pattern is a plain number attribute as the fallback, with the token value set through `style` or a class. `fill` and `stroke` take `var()` safely." The rule and the lint check stay; only the stated reason changes. The same false reason appears in the check's `why` (W-F4 below) and in `src/components/LoadingSpinner/spinnerGeometry.ts:104`, which is outside this batch.

### F2. expressive-details.md:3: number of shipped details
- **Claim:** "This file walks through the one shipped expressive detail, DropdownCaret".
- **Evidence:** The same file says at :15 "DropdownCaret has two details, its shape and its hover nudge". tokens.css:943 and :946 hold two expression tokens.
- **Fix:** "This file walks through DropdownCaret, the only component that ships expressive details (two of them), and then sketches…"

### F3. editing-tokens SKILL.md:8: where `--ui-*` values live
- **Claim:** "`src/styles/tokens.css` holds every `--ui-*` value".
- **Evidence:** `src/styles/dooph-component-tokens.css:641-648` sets `--ui-shimmer-base` and `--ui-shimmer-highlight` on `.ds-chat-tool-shimmer` and `.ds-chat-thinking-shimmer`. Those rules re-point them to the chat's own tokens. No other `--ui-*` declaration exists outside tokens.css, in either CSS or TS: a grep for style keys, arbitrary properties and `setProperty` found nothing.
- **Fix:** "`src/styles/tokens.css` defines every `--ui-*` token. The only other `--ui-*` declarations are the ShimmerText re-bases in dooph-component-tokens.css, which point `--ui-shimmer-*` at the chat's own tokens." A smaller point on the same line: "cn's merge lists … are generated from it" is incomplete. The text-style and size lists come from the rules in index.css (sync-theme.mjs:348-384). The styling skill (SKILL.md:37) states this correctly.

### W-F1. check-conventions.mjs:658: dark-theme `why` (the suspected one; confirmed)
- **Claim:** "a .dark line that repeats a non-alias :root value blocks consumer :root overrides inside .dark."
- **Evidence:** theming-proof.md:54 (point 1) says that on `<html class="dark">` an unlayered consumer `:root` rule beats the DS `.dark` value, because the two are the same element and unlayered beats `@layer ds.tokens`. A redundant `.dark` line therefore blocks nothing at html level. It only re-declares the DS value on a nested `.dark` element, which pins that element to the DS value. Without the line the island would inherit the consumer's `:root` value (theming-proof.md:55, point 2). editing-tokens SKILL.md:29 already says this correctly: "pinning a consumer's :root override out of .dark islands". The first half of the `why` is TRUE: theming-proof.md:58 (point 5), and the baseline at :25.
- **Fix:** "…unless .dark repeats the alias; a .dark line that repeats a non-alias :root value pins the DS value inside nested .dark islands, so a consumer's :root override never reaches them." The same wording is in `scripts/sync-theme.mjs:34-35` ("that line blocks a consumer's :root override inside .dark") and should be fixed in the same change.

### W-F2. check-conventions.mjs:503: raw-ui-var-class `why`
- **Claim:** "an arbitrary var() class, or its Tailwind v4 shorthand p-(--ui-…), hides it from tailwind-merge, so cn() cannot resolve conflicts with it."
- **Evidence:** tailwind-merge 3.6.0 with the DS theme resolves these conflicts:
  - `p-[var(--ui-spacing-sm)] p-lg` gives `p-lg`
  - `p-lg p-[var(--ui-spacing-sm)]` gives `p-[var(--ui-spacing-sm)]`
  - `p-(--ui-spacing-sm) p-lg` gives `p-lg`
  - `bg-[var(--ui-color-primary)] bg-secondary` gives `bg-secondary`
  - `w-[var(--ui-size-avatar)] w-full` gives `w-full`

  It only gets an ambiguous prefix wrong: `text-[var(--ui-text-body)] text-text` gives `text-text`, so a font size is erased as a colour, and the same happens with `text-(--ui-text-body)`. Only the typed form `text-(length:--ui-text-body)` survives.
- **Fix:** "A token belongs behind its theme utility (bg-primary, p-md) or a ds-* helper. An arbitrary var() class, or its v4 shorthand p-(--ui-…), wires the raw token name into the component. Where the prefix is ambiguous (text-[var(--ui-text-body)]), tailwind-merge cannot tell a size from a colour, so cn() erases it."

### W-F3. check-conventions.mjs:632: size-key-name `why`
- **Claim:** "Every size scale names its sizes standard and sm".
- **Evidence:** Several scales do not:
  - LoadingSpinnerSize has sm/rg/md (`src/components/LoadingSpinner/constants.ts:28-34`)
  - CTAButtonSize has standard/big (`CTAButton/constants.ts:11-13`)
  - StickerSize has standard/micro (`Sticker/constants.ts:38-40`)
  - ButtonSize has big/medium/standard/sm/icon/icon-sm (`Button/constants.ts:24-30`)

  The rule the check enforces is narrower: the keys `default` and `small` are banned.
- **Fix:** "A size scale calls its default size standard and its small size sm, never default or small, so the same size reads the same on every component; only SIZE keys are held to this, not variant keys."

### W-F4. check-conventions.mjs:596: svg-var-attribute `why`
- **Claim:** "SVG geometry attributes (width, r, cx …) do not resolve var(), so the shape falls back to its default size".
- **Evidence:** The same browser probe as F1. In Chromium, width, height and r resolve `var()` and the shape takes the token's size.
- **Fix:** "Whether an SVG geometry attribute (width, r, cx …) resolves var() varies by engine, so it is not a portable place for a token; keep a plain number attribute as the fallback and set the token value through style or a class."

### W-F5. check-conventions.mjs:652: expression-system `why` (partly false)
- **Claim:** "…read only by .ds-expr-* rules; anything else stops the practical preset from switching them."
- **Evidence:** A set outside the tokens.css default and the preset does stop the switch. For example, an inline style or a rule on a descendant overrides `[data-ds-expression="practical"]` for that subtree. A read outside a `.ds-expr-*` rule does not stop it: `var(--ui-caret-shape-scale)` read anywhere still resolves to the preset's 0 under practical (tokens.css:957-961, theming-proof.md:139-141). The read restriction is about keeping every use of the detail in one findable place, not about switching.
- **Fix:** "Expression tokens are set only by the tokens.css default and the practical preset, and read only by .ds-expr-* rules: a set anywhere else stops the practical preset from switching them, and a read outside a .ds-expr-* rule scatters the detail where the next edit cannot find it."

## UNVERIFIABLE claims

None.

## TRUE claims

### dooph-ds-styling/SKILL.md
- :8 Visual values come from tokens through theme utilities or ds-* helpers. Enforced by the hex, spacing, radius/shadow and raw-var checks (check-conventions.mjs:478-563).
- :8, :12-16 Flourishes on practical components must be switchable by practical. This matches the mechanism: the preset sets only custom properties (tokens.css:957-962).
- :18 Expressive components (OutlineButton, CTAButton, shapes) are never switched. The preset touches only the two caret tokens (tokens.css:958-961), and all three folders exist under `src/components`.
- :22 One token per detail, marked, with a neutral value in the preset. Lint reads the marker and requires the preset entry (check-conventions.mjs:250, 275-276).
- :23 Reads happen only in `.ds-expr-*` rules, with state in the selector. See index.css:1013-1041. Lint allows `.ds-expr-*` in any stylesheet (:270); the skill's "in index.css" is stricter policy, not a contradiction.
- :24 No inline style, arbitrary property, setProperty or prop sets the token. Lint covers style keys, `[--x:` and `setProperty` in TS (check-conventions.mjs:280).
- :25 The component is complete at the neutral value. Precedent: index.css:1000-1011, 1013-1021.
- :26 Header-contract line and Practical story. Precedent: DropdownCaret.tsx:34-38 and DropdownCaret.stories.tsx:76-81.
- :28 Lint checks only marked tokens, so a hard-wired utility passes (check-conventions.mjs:250-253).
- :32 `bg-secondary`, `rounded-tight` and `shadow-menu` exist (theme.css:30, :124, :137). The three lint names match check-conventions.mjs:548, :663 and :555.
- :33 The bracket check knows only px/rem/em/deg (check-conventions.mjs:482). Both lint names match (:479, :486).
- :34 No `[var(--ui-…)]` or `(--ui-…)` in classes (check-conventions.mjs:505). `cn("ds-p-ui-sm","p-lg")` keeps both: tailwind-merge returned `"ds-p-ui-sm p-lg"`, and `ds-p-ui-sm` exists at dooph-component-tokens.css:585.
- :35 Motion goes through ds-motion-* or var() in CSS. Own reduce rules are only for loops, the spring, or a static frame (RollHover): tokens.css:894-900. Both lint names match (:469, :675).
- :36 The focus and disabled helpers exist (dooph-component-tokens.css:109-205). The double-fade wording matches the `why` at check-conventions.mjs:516, and the lint names match (:509, :515).
- :37 cva with `className` last means the consumer wins. cn() learns from generated lists, and adding a `.text-style-*`, `.h-*`, `.size-*` or `.min-w-*` rule needs sync-tokens (sync-theme.mjs:337-384). Otherwise a role is erased as a colour (cn.ts:14-21). Lint name: :681.
- :38 `hover:ds-*` emits no rule. `.h-button` and friends are plain classes in `@layer utilities` (index.css:361), not `@utility`. Lint name: :588.
- :39 `fill` and `stroke` take var(): both resolved in the browser probe. Lint name: :595.
- :40 CSS lives in src/styles with helpers in `@layer utilities`. emit-css compiles only build.css (emit-css.mjs:22), and build.css imports index.css (build.css:6). No .css file exists under src/components. Text roles sit in `@layer components` (index.css:244).
- :41 Text goes through Text components. Lint name: :534.
- :47 The spacing scale is 2/4/6/8/10/12/16/20/26/42 (tokens.css:581-590).
- :48 Motion steps and eases: tokens.css:205-218.
- :49 `ds-motion-state` transitions colours, rotate, scale and translate, among others (dooph-component-tokens.css:49-56). The overlay, overlay-dialog and overlay-sheet helpers are at :71-106.
- :50-51 Every listed focus and disabled helper exists (dooph-component-tokens.css:109, 118, 125, 152-205, 580). `ds-opacity-disabled` is for content only (:577-579).
- :52 The token-contract link resolves to `skills/dooph-design-system-theming/references/token-contract.md`.
- :53 The mapping from `@theme` keys to utilities matches sync-theme.mjs:257-288 and index.css:136.
- :59 "No preset can remove a utility": the preset sets only custom properties.
- :71 `npm run lint` runs `tsc --noEmit && node scripts/check-conventions.mjs` (package.json). `npm run storybook` exists.

### dooph-ds-styling/references/expressive-details.md
- :7, :9 A static detail counts too. The preset cannot reach a utility.
- :17-24 Tokens sit in the expression `:root` block inside `@layer ds.tokens` (tokens.css:33, 939-949). The snippet matches :943 and :946 verbatim.
- :26-33 The preset snippet matches tokens.css:957-962, inside `@layer ds.expression`.
- :35 The block is `:root` only, so a theme subtree cannot restore a detail (tokens.css:936-938, theming-proof.md:214). An unlayered consumer beats both (theming-proof.md:141, E4).
- :37 The helpers are inside `@layer utilities` (index.css:359, which closes at :1133) and beside the caret rules (:986-1069).
- :39 Shape geometry: at 1 a trigger-height square, at 0 the chevron plus an inset. The frame is scale × frame, and the colour mixes to `secondary-foreground` at 0 (index.css:1000-1033).
- :40-47 The nudge selector and declaration match index.css:1038-1041 verbatim.
- :49 DropdownCaret.tsx:61-66 adds only the classes. It has no style, listener or prop for either detail (its only props are `variant` and `className`), and its state comes from the host (:9-12).
- :51 Header content and the quoted constraint match DropdownCaret.tsx:17-22 and :34-38.
- :53 The Practical story uses the labels "Default (signature)" and "Practical" inside `data-ds-expression="practical"` (stories:76-81).
- :57 Both tokens are neutral at 0. One is a magnitude and the other a 0–1 scale (tokens.css:940-946).
- :60 `ds-motion-state` transitions rotate, scale, translate and transform at `fast` (dooph-component-tokens.css:49-55). The lean runs on `base`/`enter` (index.css:857-863). On-scale motion needs no extra reduce rule (tokens.css:923-934).
- :62-84 The sketch is labelled hypothetical. The `text-text-tertiary` utility exists (theme.css:86).
- :90 Lint name: check-conventions.mjs:651. :95 lint exits 0.

### dooph-ds-editing-tokens/SKILL.md
- :8 `theme.css`, the `@theme` block and the token contract are generated from tokens.css (sync-theme.mjs:4-7, generate-docs.mjs:716). "A look that differs by mode or place is a token" holds as the rule the dark-outside-tokens check enforces.
- :16 The light block is `:root, .light` in `ds.tokens` (tokens.css:33-36), and it is the only block sync-theme reads (sync-theme.mjs:20-23, 293-296).
- :17 `.dark` is in `ds.tokens`, with an alias group (tokens.css:765-892).
- :18 Reduced motion: `:root, .light`, 1ms durations, 0ms staggers, all `!important` (tokens.css:923-934).
- :19-20 The expression `:root` block and the preset in `ds.expression` (tokens.css:939-947, 957-962).
- :22 Precedence is consumer > preset > defaults (tokens.css:1, 15-20). The layered `!important` beats consumer `:root`/`.light` overrides, and other selectors need their own block (theming-proof.md:160).
- :26 Rule 1 and its lint coverage: `.dark`, dark variants and hex in component stylesheets (check-conventions.mjs:351-363, 374-381); `prefers-color-scheme` in every styles/ sheet including tokens.css (:366-367); `dark:` in class strings (:369); hex in TS (:551). What it prevents is consistent with theming-proof.md:56.
- :27 Rule 2. A new light alias with its own `.dark` value passes the dark check (check-conventions.mjs:336-339).
- :28 Rule 3. `DS_COLOR_TOKENS` exists (color.ts:21).
- :29 Rule 4 mechanics match check-conventions.mjs:335-342. Its "Prevents" text is correct (theming-proof.md:54-58). Lint name: :657.
- :30 sync-tokens writes the three outputs (sync-theme.mjs:4-7, 314, 345, 397). Lint name: :681.
- :31 The families mapping plus `ALIASES` (sync-theme.mjs:84-96, 257-288).
- :32 Lint name: :651.
- :33 A component motion token is only for a loop, stagger or spring (tokens.css:193-196). Steps and staggers go in the reduce block and loop cycles do not (tokens.css:909-912). The markers and `npm run generate-shape-morph-ease` match tokens.css:326-333 and package.json. Lint name: :469.
- :34 The comment above a token is published (generate-docs.mjs:420-463, 513). Lint name: :702.
- :35 The PLACEHOLDER values exist and are the maintainer's (tokens.css:804, 833, 844), as the maintainer decision says.
- :43-48 `.ds-chat-prose pre` and `code` exist (dooph-component-tokens.css:903-921). theme.css and twMergeTheme.ts are generated.
- :53 tsc alone is not clean: lint runs tsc and then the conventions script.
- :54 The Storybook Theme toolbar's Dark toggles `.dark` on `<html>` (.storybook/preview.ts:22-23).

### dooph-ds-editing-tokens/references/recipes.md
- :7 `pre` and inline `code` paint `surface-secondary` (dooph-component-tokens.css:911, 918). Avatar uses `bg-surface-secondary` (Avatar.tsx:16). `DS_COLOR_TOKENS` holds `'surface-secondary'` (color.ts:34).
- :10 Chat-prose tokens exist in the light block (tokens.css:278-282).
- :14 The `.dark` block has a dark-paints section and a separate alias group (tokens.css:765-848 and :849-891).
- :25-26 The alias follows the light value. Its own `.dark` value needs no alias-group copy (check-conventions.mjs:336-339).
- :28 `--ui-color-*` maps to `--color-*` (sync-theme.mjs:268-269). The slider paints are in `EXCLUDED` (:150-155).
- :34-44 Precedent tokens: the marker must be on the same line after `;` (check-conventions.mjs:250). Lint fails on a missing preset entry or an unmarked one (:275-276). The `EXCLUDED` "Expression tokens" group exists (sync-theme.mjs:213-216), and sync-theme never reads the expression block (:20-23). Reads are allowed only under `.ds-expr-` (:270). A component never sets or reads the token (:277-284). adding-a-component covers the Practical story (SKILL.md:43, file-templates.md:139-143).
- :55-59 All three greps run as written. On `surface-secondary` they find dooph-component-tokens.css:911/918, Avatar.tsx:16 and color.ts:34.
- :62 `ALIASES` renames `-foreground` to `-fg` (sync-theme.mjs:84-92).
- :66 Scale names, the per-step comment (tokens.css:198-218), all nine in `EXCLUDED` (sync-theme.mjs:187-198), no duration-N or ease-* (check-conventions.mjs:475).
- :67 1ms not 0ms, and events are relied on (tokens.css:902-907, RevealChangeText.tsx:28, MorphRotationShape.tsx:42). Staggers go to 0ms and loop cycles are absent (tokens.css:931-932, 909-912).
- :68 The `!important` is load-bearing, and only for `:root`/`.light` (tokens.css:917-922, theming-proof.md:160).
- :69 The shape-morph values are generated (tokens.css:325-333, package.json).
- :73 The first block is read (sync-theme.mjs:296, a non-global match).
- :74 Dark-check block regexes (check-conventions.mjs:290-291). `\s` also spans the newline in tokens.css:35-36.
- :75 `TOKEN_BLOCKS` exists, and an unknown block throws (generate-docs.mjs:375-381, 447).

### check-conventions.mjs `why` strings (TRUE)
- **motion-timing (:470):** the scale and the reduced-motion collapse are in tokens.css:923-934.
- **arbitrary-length (:480):** stories are scanned, since `tsx(ctx)` includes them (:125).
- **numeric-spacing (:487):** `p-0` is exempt through the regex `(?!0(?![\d.]))` (:491).
- **focus-ring (:510):** helper width, colour and offset are at dooph-component-tokens.css:152-205.
- **disabled-look (:516):** see dooph-component-tokens.css:109-122.
- **value-callback (:523):** convention.
- **default-export (:529):** src/index.ts uses `export *`, which skips default exports.
- **text-style-class (:535):** Text components.
- **typography-utility (:542):** roles.
- **hex-colour (:549):** stories included.
- **tailwind-radius-shadow (:556):** `rounded-tight`, `shadow-standard` and `shadow-menu` exist. Dark shadows are at tokens.css:814-820.
- **element-ref (:568):** `@types/react` index.d.ts:200 has "@deprecated Use `ComponentRef<T>` instead".
- **forwardref-displayname (:574):** React DevTools naming.
- **variant-on-package-class (:589):** these are plain `@layer utilities` classes.
- **theme-detection (:612):** dark mode is CSS-only, per the maintainer's design.
- **font-family (:618):** `--ui-font-*` tokens.
- **variant-const-name (:626):** `DropdownMenuSelectType` is at Menu/constants.ts:15.
- **dark-outside-tokens (:664):** a `.dark` rule reaches a nested `.light` island. No stylesheet reads `prefers-color-scheme`; lint passes. The #000 mask stops are at index.css:786-790 and in the allowlist at :215-220.
- **use-client (:670):** React Server Components client-reference semantics.
- **js-timers (:676):** the allowlist is at :205-212.
- **theme-fresh (:682):** see sync-theme.mjs:4-7.
- **icons-fresh (:689):** see generate-icon-exports.mjs:1-8.
- **shape-morph-ease-fresh (:696):** see tokens.css:325-333.
- **docs-fresh (:703):** the four outputs are at generate-docs.mjs:714-718.
- **skills-mirrored (:710):** see sync-skills.mjs:7-28. `.claude/skills` and `.agent/skills` exist.
- **dark-theme (:658), first half:** an alias resolves where it is declared, so a nested `.dark` island keeps the light value (theming-proof.md:25, 58).

## Old false claims (FINDINGS.md §4) that reappear

I grepped the §4 register (FINDINGS.md:4984-6821) for: svg, var(), tailwind-merge/cn(), redundant/alias/islands, expression, prefers-color, reduced/1ms/transitionend, sync-tokens/EXCLUDED, emit-css, @layer, helper, focus, disabled.

None reappears:
- **The claim that every animated component owns a `--ui-<component>-*` family** is FALSE in the register. editing-tokens SKILL.md:33 now says the opposite, correctly.
- **The focus-helper list that included `ds-focus-ring` and left out `-within-ring-danger` and `-on-open`** was STALE in the register. styling SKILL.md:50 lists the current helpers, and no longer lists `ds-focus-ring`.
- **The `EXCLUDED` group rationales** were FALSE in the register. recipes.md:42 describes `EXCLUDED` as a record, not a filter, which matches sync-theme.mjs:97-99.
- **The claims that the reduced-motion case is a `--ui-*-change-*` token** were FALSE in the register. They are not repeated here.

## Cross-doc contradictions and notes

1. **The dark-theme reason is stated three ways.** editing-tokens SKILL.md:29 says "pinning a consumer's :root override out of .dark islands", which is correct. The check's `why` (check-conventions.mjs:658) and the sync-theme.mjs:34-35 header both say a redundant line "blocks" the override "inside .dark". That is false for `<html class="dark">` (see W-F1). Fix the `why` and the sync-theme header together.
2. **The SVG var() reason** is wrong in styling SKILL.md:39, in the check's `why` (:596) and in `src/components/LoadingSpinner/spinnerGeometry.ts:104` (outside this batch). A memory note records the maintainer's own Chromium test showing it. The rule is sound for portability; only the reason is wrong.
3. **Possible tension: styling SKILL.md:40 and the typography decision.** The skill says "Text roles sit in `@layer components`, so a consumer's utility beats a role." That is TRUE as a cascade fact. Read on its own, it could suggest that consumers may restyle a Text component with typography utilities, which the maintainer's decision forbids (typography is props only). Suggested addition: "…beats a role (cascade fact only: typography still goes through Text props, never utilities)."
4. **A minor overlap that is not a contradiction.** styling SKILL.md:49 lists what `ds-motion-state` transitions as "colours, rotate, scale, translate". expressive-details.md:60 adds `transform`. Both are subsets of dooph-component-tokens.css:49-52, so they do not conflict.
5. **Lint location.** styling SKILL.md:23 restricts expression reads to `src/styles/index.css`. Lint allows a `.ds-expr-*` rule in any stylesheet (check-conventions.mjs:257-271). The skill is stricter policy, so this is not a contradiction, but lint will not catch a `.ds-expr-*` rule placed in dooph-component-tokens.css.

## Fixes

Applied 2026-10-11. Every finding was re-verified before editing. The check names and behaviour are unchanged; only `why` text and doc text changed. None of the five old `why` strings was quoted verbatim in `.agents/skills/`, `skills/` or the claims files (grep), so no quote needed updating.

### SVG var() probe (re-run for F1 and W-F4)
Built-in Chromium (UA Chrome/152.0.7977.130). The scratch file `svg-var-probe.html` (session scratchpad) could not be scripted as a local file, so its markup was injected into an example.com tab: a `<div style="--w:40px;--r:7px;--cx:20px">` holding `<svg width="var(--w)" height="var(--w)">` with `<circle r="var(--r)" cx="var(--cx)" cy="20">` and `<rect width="var(--w)" height="10">`.
- Rendering resolves `var()`: svg bounding box 40×40 (computed width 40px), circle computed `r` 7px, `cx` 20px, bbox 14 wide, path length 43.7; rect bbox 40 wide. A control circle with no `r` drew at 0, and a control svg with no width drew at 300.
- The SVG DOM does not: `svg.width.baseVal.value`, `rect.width.baseVal.value`, `circle.r.baseVal.value` and `circle.cx.baseVal.value` all read 0.
- Spec: SVG 2 §6.6 says presentation attributes are "parsed as CSS values, not declarations", and §4.2 (Attribute syntax) parses them against the property's Value grammar (w3.org/TR/SVG2/styling.html, types.html). The spec does not provide `var()` there. Chromium's rendering is engine behaviour. MDN's `r` page says nothing on `var()`.
- Conclusion: the checker is right that Chromium resolves these. Kept the rule and the check (maintainer decision, doc-refresh.md:126-128). Reworded the reason to what was measured and cited.

### Per finding
- **F1 (styling SKILL.md:39): FIXED.** "**Never put `var()` in an SVG geometry attribute (`width`, `r`, `cx`…).** SVG 2 parses a presentation attribute as a value, not a declaration, so `var()` there is not specified. Chromium draws it, but its SVG DOM reads the length as 0 (`circle.r.baseVal.value`). Keep a plain number attribute and set the token through `style` or a class. `fill` and `stroke` may take `var()`. "var() in SVG geometry attributes"." The same false reason in `src/components/LoadingSpinner/spinnerGeometry.ts:104` (JSDoc) became "never as an SVG attribute — `var()` there is not specified, and the SVG DOM reads it as 0" (comment only; generate-docs reported fresh).
- **F2 (expressive-details.md:3): FIXED.** "This file walks through DropdownCaret, the only component that ships expressive details (two of them), and then sketches the same mechanism for a new detail."
- **F3 (editing-tokens SKILL.md:8): FIXED.** Re-grep confirmed that the only other `--ui-*` declarations in src/styles are dooph-component-tokens.css:642-647 (plus one story's inline style, OutlineButton.stories.tsx:74). New text: "`src/styles/tokens.css` defines every `--ui-*` token, one block per mode and preset. Elsewhere in `src/styles`, only the ShimmerText re-bases in `dooph-component-tokens.css` set one: they point `--ui-shimmer-*` at the chat's own tokens. The theme utilities, `theme.css` and the token contract are generated from tokens.css, and so are cn's merge lists, together with the class rules in `index.css`."
- **W-F1 (dark-theme why, :658): FIXED.** "…unless .dark repeats the alias; a .dark line that repeats a non-alias :root value re-declares the DS value on every nested .dark island, so a consumer's :root override never reaches them." sync-theme.mjs:34-36 became: "Never repeat a non-alias value that is the same in both: that line pins the DS value on nested .dark islands, so a consumer's :root override never reaches them."
- **W-F2 (raw-ui-var-class why, :503): FIXED.** Re-ran cn() (built from src/utils/cn.ts) on all eight cases; the results match the checker exactly. New text: "A token belongs behind its theme utility (bg-primary, p-md) or a ds-* helper; an arbitrary var() class, or its Tailwind v4 shorthand p-(--ui-…), wires the raw token name into the component, and where the prefix is ambiguous (text-[var(--ui-text-body)]) tailwind-merge files a size as a colour, so cn() erases it."
- **W-F3 (size-key-name why, :632): FIXED.** The check bans only the keys `default` and `small`, inside `…Size(s)` const objects and cva `size: {}` groups (:636-642). New text: "A size scale calls its default size standard and its small size sm, never default or small, so the same size reads the same on every component; only size scales (…Size consts and cva size groups) are held to this, not variant keys."
- **W-F4 (svg-var-attribute why, :596): FIXED** (see probe). "SVG 2 parses a presentation attribute as a value, not a declaration, so var() in a geometry attribute (width, r, cx …) is not specified: Chromium draws it, but its SVG DOM reads the length as 0; keep a plain number attribute and set the token through style or a class."
- **W-F5 (expression-system why, :652): FIXED.** The check (:244-287) flags CSS sets outside the tokens.css `:root` default and the preset, CSS reads outside a `.ds-expr-*` selector, TS sets and reads, and preset entries that are missing or unmarked. New text: "Expression tokens are set only by the tokens.css :root default and the practical preset, and read only by .ds-expr-* rules: a set anywhere else overrides the preset in that subtree, so practical stops switching it; a read anywhere else scatters the detail where the next edit cannot find it; and a marked token missing from the preset is one practical cannot switch off."

### Cross-doc notes
- 1 and 2: resolved by W-F1 (with sync-theme.mjs) and by F1/W-F4 (with spinnerGeometry.ts).
- 3, 4 and 5: no change. None contradicts the code (the checker says so). The next bullet in styling SKILL.md already routes text through Text components.

Claims files updated: claims/dooph-ds-styling.md (SVG rule; new R:3 line) and claims/dooph-ds-editing-tokens.md (S1, S2). Ran `node scripts/sync-skills.mjs`. It also mirrored concurrent edits by other batches to adding-a-component and writing-components. `node scripts/generate-docs.mjs` reported everything fresh. `npm run lint` exits 0 ("conventions: 30 checks passed").

## Fix verification

Verified 2026-10-11, read-only. `npm run lint` exit 0 ("conventions: 30 checks passed"); `node scripts/sync-skills.mjs --check` exit 0 (9 skills x 2 mirrors).

- **F1 (styling SKILL.md:39): VERIFIED.** I re-ran the SVG probe in the built-in Chromium (Chrome/152.0.7977.130) on a scratch example.com tab, then closed it. Rendering resolves `var()`: svg width 40, circle computed `r` 7px, bbox 14, rect bbox 40. The SVG DOM reads 0: `circle.r.baseVal.value`, `rect.width.baseVal.value`, `svg.width.baseVal.value` and `circle.cx.baseVal.value` are all 0. SVG 2 §6.6 says "presentation attributes are parsed as CSS values, not declarations" and does not mention var() or custom properties. The new wording ("SVG 2 parses ... as a value, not a declaration, so var() there is not specified. Chromium draws it, but its SVG DOM reads the length as 0 (`circle.r.baseVal.value`)") stays within that observation plus the spec's silence. It claims nothing about other engines. Same wording checked in check-conventions.mjs:596 (`svg-var-attribute` why) and spinnerGeometry.ts:104-106 (JSDoc): both say the same and nothing more. The "fill and stroke may take var()" sentence matches the earlier probe.
- **F2 (expressive-details.md:3): VERIFIED.** "the only component that ships expressive details (two of them)": the only `ds-expr-*` users in src/components are in DropdownCaret.tsx (:19, :63), and tokens.css has two marked tokens. Consistent with :15 "two details" and with the file's own definition of an expressive detail.
- **F3 (editing-tokens SKILL.md:8): VERIFIED.** The only other `--ui-*` declarations in src/styles are dooph-component-tokens.css:642-647, the ShimmerText re-bases pointing at the chat tokens. "One block per mode and preset" is loose (tokens.css also has a reduced-motion block and an expression default block) but not false; the sentence makes no count claim. The cn merge-lists sentence matches the styling skill and sync-theme.
- **W-F1 (dark-theme why, check-conventions.mjs:658): VERIFIED.** New text matches theming-proof.md points 1, 2 and 5. The sync-theme.mjs:34-36 header says the same ("pins the DS value on nested .dark islands"). No stale "blocks" wording remains in either.
- **W-F2 (raw-ui-var-class why, :503): VERIFIED.** Re-ran cn() (src/utils/cn.ts, tailwind-merge 3.6.0, DS theme) via tsx: `p-[var(--ui-spacing-sm)] p-lg` gives `p-lg`; the reverse order keeps the arbitrary class; `p-(--ui-spacing-sm) p-lg` gives `p-lg`; `text-[var(--ui-text-body)] text-text` and `text-(--ui-text-body) text-text` both give `text-text`; `text-(length:--ui-text-body)` survives. The new sentence says nothing beyond this.
- **W-F3 (size-key-name why, :632): VERIFIED.** The check (:636-642) scans `…Size(s)` const objects and cva `size: {}` groups and bans only `default` and `small`. The why says exactly that.
- **W-F4 (svg-var-attribute why, :596): VERIFIED.** See F1.
- **W-F5 (expression-system why, :652): VERIFIED.** Matches expressionSystem() (:244-287): a set outside the tokens.css `:root` default or the preset is flagged, a read outside a `.ds-expr-*` selector is flagged, and a marked token missing from the preset is flagged.

Counts: 8 VERIFIED, 0 STILL FALSE.
