
<!-- chunk: items 2+3 (name existence, token-contract two-way) — findings → §1; tables → §5 -->
### U13-F5: Two consumer docs present utilities that no longer generate as current (`rounded-l-standard`, `rounded-standard`)
- severity: S1
- category: doc-drift
- rules: [R13.11]
- scope: consumer-visible
- confidence: plausible
- verified_by: "scratch/U13/check-names.cjs (every backticked utility resolved against HEAD src/styles/theme.css @theme keys) → misses include token-contract.md:210 `rounded-l-standard`, README.md:180 `rounded-standard`; theme-keys diff: `--radius-standard` REMOVED v5.3.0→HEAD, `--radius-normal` ADDED."
- locations:
  - skills/dooph-design-system-theming/references/token-contract.md:210
  - README.md:180
- evidence: |
    token-contract.md:210  - Radii: `rounded-tight`, `rounded-normal`, `rounded-soft`, `rounded-slider-inner` (v3, and directional variants such as `rounded-l-standard`)
    README.md:180          `p-md`, `gap-sm`, `rounded-standard`, or `font-label` in **your** code, your
- impact: With the HEAD `theme.css` preset, `rounded-l-standard`/`rounded-standard` generate no CSS — silently square corners. README is the first doc a consumer reads and ships in the tarball; token-contract.md is the "exhaustive list". (README's `rounded-standard` is correct for the released 5.3.0 and wrong for the HEAD it ships beside — the rename pass updated the skills but not README.)
- recommendation: `rounded-l-normal`, `rounded-normal`.
- breaking: none
- contract: n/a
- remediation: tbd
- related: [U13-F1]

### U13-F6: The package `cn` (and the skill's "replicate the group" snippet) omit `text-style-hero-body`/`text-style-hero-button`, so `HeroBodyText`/`HeroButtonText` silently lose their role class when given a text-colour className — the exact pattern the usage skill teaches
- severity: S1
- category: doc-drift
- rules: []
- scope: consumer-visible
- confidence: plausible
- verified_by: "`node --input-type=module -e 'import {cn} from \"./dist/index.js\"; …'` in the audit build → `cn(\"text-style-hero-body\",\"text-text-secondary\")` = \"text-text-secondary\"; `cn(\"text-style-hero-button\",\"text-primary-fg\")` = \"text-primary-fg\"; control `cn(\"text-style-body\",\"text-text\")` = \"text-style-body text-text\". BaseText.tsx:89 `className={cn(role && TEXT_VARIANT_CLASS[role], className)}`."
- locations:
  - src/utils/cn.ts:17-26 (root cause; outside U13 scope, cross-ref)
  - skills/dooph-design-system-usage/SKILL.md:58,242-245,320-336
- evidence: |
    cn.ts:17-25      'text-style': [ 'text-style-button', 'text-style-body', 'text-style-label', 'text-style-title', 'text-style-heading', 'text-style-subheading', 'text-style-hero', 'text-style-mono', ],
    Text/constants.ts:124  heroButton: 'text-style-hero-button',   (…:130 heroBody: 'text-style-hero-body')
    SKILL.md:58      <BodyText className="text-text-secondary">Saved automatically</BodyText>
    SKILL.md:320     **`cn` must come from the package.** It registers a `text-style` conflict group;
    SKILL.md:330-333 "text-style-button", "text-style-body", "text-style-label", "text-style-title", "text-style-heading", "text-style-hero",
- impact: `<HeroBodyText className="text-text-secondary">` (the skill's own recolouring idiom applied to a role the skill documents at :242) renders with no `text-style-hero-body`: family, 16px size, weight, tracking and axes all fall back to inheritance, silently. The skill's claim that importing `cn` from the package prevents this is false for 2 of 10 roles. The skill's copy-paste group (:330-333) lists only 6 of the 10 role classes, so an app that follows it also loses `text-style-subheading`/`-mono`/`-hero-body`/`-hero-button`.
- recommendation: Add the two hero classes to `cn`'s group (code, other unit) and make the skill snippet list all ten (or derive both from `TEXT_VARIANT_CLASS`).
- breaking: none
- contract: n/a
- remediation: tbd
- related: []

### U13-F7: The theming docs state wrong defaults and mode behaviour for five tokens/roles
- severity: S2
- category: doc-drift
- rules: [R13.2]
- scope: consumer-visible
- confidence: plausible
- verified_by: "Grep of src/styles/tokens.css for each documented default; tokens.cjs parse of :root vs .dark; dooph-component-tokens.css:117-123; TextVariant keys from exports-head.tsv."
- locations:
  - skills/dooph-design-system-theming/references/token-contract.md:87
  - skills/dooph-design-system-theming/references/token-contract.md:98
  - skills/dooph-design-system-theming/references/token-contract.md:56 vs :59
  - skills/dooph-design-system-theming/references/token-contract.md:66,69,212
  - skills/dooph-design-system-theming/SKILL.md:204-205
- evidence: |
    token-contract.md:87  `--ui-icon-stroke-width` (1.5)            | tokens.css:529  --ui-icon-stroke-width: 2;
    token-contract.md:98  `--ui-color-slider-step-inactive` … (defaults to `--ui-color-border-secondary`) | tokens.css:509  --ui-color-slider-step-inactive: var(--ui-color-secondary-border);
    token-contract.md:56  Unlike the button family (which is fully mode-invariant), the alt DOES change between light and dark.
    token-contract.md:59  `--ui-prominent-color-alt` … Mode-invariant as of 5.4   | tokens.css:153 only (no .dark line)
    token-contract.md:66  There are **eight** text roles: `body`, `button`, `heading`, `subheading`, `label`, `title`, `hero`, `mono`.   | TextVariant has 10 keys (+heroBody, heroButton); usage/SKILL.md:237 "Ten roles"
    theming/SKILL.md:205  slider paints the handle in it and the active track at 45% of it.   | tokens.css: --ui-slider-track-primary-active-opacity 50% / prominent 70% (light), 60% (dark)
- impact: A consumer retuning from the doc gets the wrong baseline: they believe stroke is 1.5 (it is 2), override `--ui-color-border-secondary` expecting to move the slider's inactive dots (it moves nothing there; the dots read `--ui-color-secondary-border`), and expect `-alt` to need a `.dark` override. The two skills disagree on the number of text roles (8 vs 10), and the `--ui-text-*` list (:69) and composite-utility list (:212) omit `--ui-text-hero-body`/`-hero-button` and `text-style-hero-body`/`-hero-button`. :56 and :59 contradict each other.
- recommendation: Correct the five statements from tokens.css; count ten roles.
- breaking: none
- contract: n/a
- remediation: tbd
- related: [U13-F8]

### U13-F8: token-contract.md is billed as the exhaustive token list but omits 65 of HEAD's 259 tokens, including seven whole families
- severity: S2
- category: doc-drift
- rules: [R13.2]
- scope: consumer-visible
- confidence: plausible
- verified_by: "node two-way diff (scratch/U13/token-contract-diff.txt): tokens.css 259 names; 172 named literally in token-contract.md; 11 via `family-*`; 76 not literally named, of which 11 are covered by the doc's `/ -secondary / …` shorthand (sticker ×8, spinner ×3) → 65 undocumented. Reverse direction: 22 doc names absent from tokens.css, all historical 'renamed from' mentions or family prefixes (none presented as current)."
- locations:
  - skills/dooph-design-system-theming/SKILL.md:221-222
  - skills/dooph-design-system-theming/references/token-contract.md:146-148
- evidence: |
    theming/SKILL.md:221  The full token surface and Tailwind mappings live in
    theming/SKILL.md:222  `references/token-contract.md` — read it when you need the exhaustive list.
    token-contract.md:146 Families: `--ui-roll-hover-*` (`RollHoverText`), `--ui-underline-link-*`
    token-contract.md:147 (`UnderlineLinkText`), `--ui-rolling-digits-*` (`RollingDigitsText`),
    token-contract.md:148 `--ui-sidebar-icon-*` (`SidebarWithHoverIcon`).
    Undocumented: --ui-color-tooltip-{inverse,matching}-{surface,text,border} (6) · --ui-color-selection, -selection-foreground · --ui-color-ai-{anthropic,gemini,openai,spacexai} · --ui-chat-* (16) + --ui-width-chat-model-tooltip · --ui-fade-change-* (5) · --ui-reveal-change-{in,out}-duration, -ease · --ui-shape-morph-* (7) · CTA: --ui-color-border-cta, --ui-shadow-cta, --ui-text-cta-{standard,big}, --ui-size-cta-chip-{standard,big}, --ui-size-cta-icon, --ui-min-w-cta-content-{standard,big}, --ui-min-w-cta-pill-big, --ui-spacing-cta-content-big · --ui-text-hero-body, -hero-button · --ui-size-checkbox, --ui-size-code-digit, --ui-radius-checkbox, --ui-radius-avatar, -avatar-sm, --ui-radius-calendar-day · --ui-height-tab-micro · --ui-shadow-standard
- impact: The whole AIChat/Sticker/shape-morph/fade/reveal motion surface added since 5.3.0 (R13.2 requires the theming skill to be edited when tokens move) plus older families (tooltip, CTA, selection) are invisible to a consumer's agent, which the skill tells to treat this file as exhaustive — so it will conclude a retune is impossible or reach for arbitrary values. The Motion "Families" line names 4 families while 8 exist (fade-change, reveal-change, shape-morph, chat missing; roll-change and shimmer are documented in their own sections).
- recommendation: Add the missing families (at least a one-line entry each), or drop "exhaustive".
- breaking: none
- contract: n/a
- remediation: tbd
- related: [U13-F7, U13-F10]

<!-- §5 tables -->
### [§5 part] Name-existence check (item 2)

Script `scratch/U13/check-names.cjs` over usage SKILL.md + reference, theming SKILL.md + token-contract.md, v3/v5 skills, README.md. Checks: every `--ui-*` against HEAD tokens.css (+ any `--ui-*` declared in src/styles); every backticked `ds-*`/`text-style-*` against selectors in src/styles/*.css (115 known); every backticked token-backed utility (`bg-/text-/border-…`, spacing, `rounded-*`, `shadow-*`, `font-*`) against the HEAD `theme.css` `@theme inline` keys (130) — i.e. whether the consumer's own Tailwind build can generate it via the preset. Output `scratch/U13/name-misses.tsv` (83 raw misses), classified:

| Class of miss | Count | Verdict |
|---|---|---|
| Stock Tailwind or CSS words cited as anti-patterns/explanations (`font-sans`, `text-sm`, `text-2xl`, `font-variation-settings`, `font-weight`, `font-variant-numeric`, group name `text-style`) | 12 | OK — not DS names |
| Old names in explicit "renamed from / v2 / removed" context (theming:17-19,197; token-contract:17-21,38,41-43,56,87,88,120,152-156; v3 table left column + verify greps; v5:18-21) | 69 | OK as history (but see U13-F1: "5.4" framing) |
| **Presented as current but does not exist at HEAD** | 2 | token-contract.md:210 `rounded-l-standard`; README.md:180 `rounded-standard` → U13-F5 |

No `ds-*` or `text-style-*` name in any consumer doc is missing (`ds-dropdown-caret-host`, `ds-shimmer-text`, `text-style-*` ×8 all found). All v3/v5 rename-table TARGETS exist at HEAD (0 misses in target columns). Every const member cited with dot access in the usage/theming docs exists (script over `exports-head.tsv` keys; the only non-existent members are old names in migration context, plus `ShapeButtons.star` at v3:223 → U13-F9).

### [§5 part] token-contract.md ↔ tokens.css two-way (item 3)

| Direction | Count | Detail |
|---|---|---|
| tokens.css → doc | 259 tokens; 194 documented (172 literal + 11 `family-*` + 11 shorthand); **65 undocumented** | list in U13-F8 |
| doc → tokens.css | 22 names absent | all historical or prefixes: `--ui-color-brand`, `-error`, `-page-background`, `-border`, `-border-focus`, `-trigger-border-hover`, `-trigger-border-error-focus`, `--ui-brand-color(-alt)`, `--ui-icon-tiny`, `--ui-icon-large`, `--ui-radius-standard`, `--ui-min-w-menu-action`, `--ui-rolling-money(-cents-size, -fade-duration)`, family stems `--ui-font`, `--ui-font-var`, `--ui-roll-hover`, `--ui-underline-link`, `--ui-rolling-digits`, `--ui-sidebar-icon` |
| documented defaults | 30 checked | 25 TRUE; 5 wrong → U13-F7 (stroke-width, slider-step-inactive, prominent-color-alt mode, text-role count/list, slider 45%) |
