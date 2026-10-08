### WI-C3-07: Correct the codebase skill line by line against the claims register's 43 FALSE/STALE CB rows, add the five missing folders, and fix the matching architecture-skill lines
- status: todo
- addresses: [F-099]
- depends_on: [WI-C3-01, WI-C2-14]
- phase: P1
- risk: low — documentation plus one JSDoc count. The main risk is editing a line another WI owns, so every owned row is listed as "no edit" below, and lines carrying a "5.4" token keep that substring byte-identical for WI-C2-07. WI-C4-03, WI-C4-04 and WI-C4-05 later append families to the two motion-family lists this WI rewrites (codebase:459-463, arch:317-321): land this P1 WI first so they append to the corrected list.
- semver: none
- files:
  - modify: `.agents/skills/dooph-ds-codebase/SKILL.md:34,38-86,79,110,112,152,202,206-223,237,283-285,315,442,459-463,500,531,547,549,588-592 @ b436647`
  - modify: `.agents/skills/dooph-ds-architecture/SKILL.md:52,318-321 @ b436647`
  - modify: `src/components/Sheet/Sheet.tsx:54-56 @ b436647` (JSDoc carrying the same false sentence as codebase:237)
  - modify: `src/components/Text/constants.ts:66 @ b436647`
- anchor:
  ```text
  codebase:79   Text/                       ← BaseText + 8 roles, constants.ts (Fonts/FontSizes/
  codebase:547  `text-style-button`, `text-style-body`, `text-style-label`, `text-style-title`, `text-style-heading`, `text-style-subheading`, `text-style-hero`, `text-style-mono` — one per `TextVariant` (eight), …
  codebase:588  npm run build
  codebase:589    → generate-icon-exports  (regenerate Icons/index.ts)
  codebase:590    → sync-tokens            (regenerate @theme inline block in index.css AND theme.css)
  codebase:591    → tsup (build:js)        (ESM + CJS + .d.ts; clean:true wipes dist first)
  codebase:592         └ onSuccess         → tailwindcss CLI → dist/styles.css, then copy src/styles/theme.css → dist/theme.css
  arch:318-321  duration and an ease. Existing families: `--ui-roll-hover-*`, / `--ui-roll-change-*`, `--ui-fade-change-*`, / `--ui-underline-link-*`, `--ui-rolling-digits-*`, `--ui-sidebar-icon-*`, / `--ui-shape-morph-*`.
  ```
- why: The codebase skill exists to answer "does this exist / where does it live / how does the build emit it". For the five newest folders it answers no, and 43 of its claims are false or stale (F-099; claims register §1 CB). Each wrong line sends the next agent to the wrong place or invites a wrong edit (re-hardcoding 45%, missing two text roles, not knowing the use-client stamp exists).
- steps:
  - [ ] 1. Apply this disposition table, one row per FALSE/STALE CB claim. "edit" rows are done here. Every other row names the WI or finding that owns the line, which stays untouched.
    | C-ID | codebase line @ b436647 | action |
    |---|---|---|
    | C-CB-10 | 29-32 | no edit: WI-C2-14 (:30) |
    | C-CB-11 | 34 | edit: append "; also `ds-*` motion/component rules (ds-shimmer-text, ds-roll-*, ds-shape-morph, ds-reveal-change, ds-rolling-digits-*, ds-sidebar-rail, ds-chat-*), the `@keyframes` (outside any layer), the `@property` registrations and the `selected:`/`unselected:` `@custom-variant`s" |
    | C-CB-15 | 38-86 | edit: step 2 |
    | C-CB-22 | 79 | edit: "BaseText + 8 roles" → "BaseText + 10 roles" |
    | C-CB-29, C-CB-30, C-CB-232, C-CB-234 | 96-107, 653-662 | no edit: WI-C3-01 |
    | C-CB-32 | 109-112 | edit: step 3 (:110 and three new lines after :112; :111 belongs to WI-C1-03 and :112's text to WI-C1-10) |
    | C-CB-36, C-CB-37, C-CB-86, C-CB-88 | 127, 128, 220, 222 (asChild ✅) | no edit: these become true when WI-C5-02 makes asChild work |
    | C-CB-39 | 129 | no edit: WI-C5-02 |
    | C-CB-44, C-CB-47, C-CB-178 | 138, 140, 498 ("5.4" labels) | no edit: WI-C2-07 (F-013) |
    | C-CB-46 | 140 ("lifted verbatim … Shapes/svgs/") | no edit: F-108's WI |
    | C-CB-54 | 152 | edit: last cell `` `CheckboxChecked` `` → `` `CheckboxVariant` (`prominent`\|`primary`) + `CheckboxChecked` `` |
    | C-CB-71 | 202 | edit: "(`Toggle/toggleOption.ts`, internal, not re-exported)" → "(`Toggle/toggleOption.ts`; not exported under its own name, but public as the `tabTriggerVariants` alias)". If D-15's outcome removes that alias, its WI rewrites this row again. |
    | C-CB-74 | 206-223 | edit: step 4 |
    | C-CB-102 | 237 | edit: "(explicit value required — unsuffixed `slide-*` resolves to 0.25rem in Tailwind v4)" → "(explicit value required — unsuffixed `slide-*` translates the full 100%)". Make the same correction in Sheet.tsx:55-56: "resolves to the 0.25rem translate DEFAULT, not the plugin's 100%" → "translates the plugin's full 100%, not the 20% settle tail" |
    | C-CB-117 | 283-285 | edit: "Geometry uses literal `calc()` class strings … dots, both fills and the handle share one percent formula." → "Fill geometry uses literal `calc()` class strings keyed to `--ui-slider-track-gap` / `--ui-width-slider-handle` / `--ui-height-slider-handle`; the step dots get an inline `left` from `thumbAlignedLeft()` (Slider.tsx:99); Radix positions the handle. The thumb-aligned percent formula is written three times (`thumbAlignedLeft` and the two fill class strings) — change all three together." |
    | C-CB-126 | 307 | no edit: WI-C2-14 |
    | C-CB-147 | 398 | no edit: WI-C2-14 |
    | C-CB-157 | 433-435 | no edit: WI-C2-14 |
    | C-CB-159 | 442 | edit: "outer dashed ring + inner surface card" → "outer solid 1px ring + inner surface card" |
    | C-CB-162 | 451 | no edit: becomes true when F-017's WI removes Slider.tsx's raw `var(--ui-*)` arbitrary values |
    | C-CB-165 | 456 | no edit: WI-C2-14 |
    | C-CB-169 | 459-460 | edit: "Every animated component owns a `--ui-<component>-*` family and the component reads them only through CSS — see the architecture skill's Rule 6." → "Rule 6 (architecture skill) requires every animated component to own a `--ui-<component>-*` family read only through CSS. Not every component does yet, so check `tokens.css` before assuming one exists." |
    | C-CB-170 | 461-463 | edit: "Current families: …" → "Current families (regenerate with `rg -o -- '--ui-[a-z-]+-(duration\|ease)' src/styles/tokens.css \| sort -u`): `--ui-roll-hover-*`, `--ui-roll-change-*`, `--ui-fade-change-*`, `--ui-underline-link-*`, `--ui-rolling-digits-*`, `--ui-sidebar-icon-*`, `--ui-shape-morph-*`, `--ui-reveal-change-*`, `--ui-chat-reveal-*`, `--ui-chat-stream-*`, `--ui-chat-disclosure-*`." |
    | C-CB-181 | 500 | edit: "Distinct from the IDENTITY pair `--ui-prominent-color`/`--ui-prominent-color-alt` (was `--ui-brand-color*`), where the alt *does* differ per mode;" → "Distinct from the IDENTITY trio `--ui-prominent-color`/`-alt`/`-ter` (was `--ui-brand-color*`), all three mode-invariant (tokens.css:148-151);" |
    | C-CB-190 | 531 | edit only the helper list: "`ds-focus-ring-on-focus`, `ds-focus-ring-danger-on-focus`, `ds-focus-ring`" → "`ds-focus-ring-on-focus`, `ds-focus-ring-danger-on-focus`, `ds-focus-within-ring-danger`, `ds-focus-ring-on-open`, `ds-focus-ring` (unused)". Drop "`ds-focus-ring` (unused)" if F-076's WI has deleted the class (`rg -n "\.ds-focus-ring \{" src/styles` → none). Keep the "(… `-error-` before 5.4 …)" parenthetical byte-identical for WI-C2-07. WI-C4-09 edits :530, not :531. |
    | C-CB-198, C-CB-200 | 542 | no edit: WI-C2-14 |
    | C-CB-203 | 547 | edit: list ten classes (add `text-style-hero-body`, `text-style-hero-button`) and "(eight)" → "(ten)" |
    | C-CB-206 | 549 | edit: "Adding a role means four edits in step: …" → "Adding a role means these edits in step: the `TextVariant` key, a `TEXT_VARIANT_CLASS` entry, the `.text-style-*` rule here, a `ROLE_AXIS_TOKEN` entry if the face has axes, its `--ui-text-*` (and weight/tracking) tokens, a `FontSizes` key, a `createRoleText` export plus `*Props` type in `BaseText.tsx`, and the `Text/index.ts` barrel entries." |
    | C-CB-216 | 588-592 | edit: step 5 |
    | C-CB-223 | 616-619 (Props-from-index.ts bullet; list split by the H3) | no edit: WI-C1-08 adds the three index.ts files (the bullet becomes true); WI-C2-14 restores the list structure |
    | C-CB-224, C-CB-225, C-CB-228 | 623-624, 627-629, 635-636 | no edit: WI-C1-05 (D-05) and WI-C1-01 (F-011) rewrite the use-client paragraph |
    | C-CB-230 | 640-641 | no edit: F-065's WI |
  - [ ] 2. Tree (38-86): insert, in alphabetical position, `AIChat/ ← AI chat parts (AIPromptInput, AITextPart, AIThinkingPart, AIToolPart, AITurnSummary, AIContextGauge, AIModelSelect parts, ChatDivider, UserMessageHeader); constants.ts: AIToolPartVariant/AIToolPartState/AIThinkingPartState; each file carries a header contract`, `DropdownCaret/ ← shape-morph chevron for trigger hosts (.ds-dropdown-caret-host); DropdownCaretVariant`, `MorphRotationShape/ ← shape morph + rotation; engine/ is a faithful port (fixes go in engine/svgPath.ts); MorphRotationShapeMode; timing.ts types`, `ShapeMorphSpinner/ ← indeterminate loader = MorphRotationShape autoplay; SHAPE_MORPH_SPINNER_SHAPES`, `Sticker/ ← non-interactive chip; StickerVariant × StickerSize`. After the "Links" table (it ends at :314; insert at :315), add a section `### AI chat, Sticker, shape morph` with one line per folder pointing to its header contract and, for the shape-morph trio, to the `dooph-ds-loading-indicators` skill.
  - [ ] 3. Scripts (109-112): change the :110 comment `← regenerates Icons/index.ts from svg components` → `← regenerates Icons/index.ts from the *Icon.tsx files`. After :112 add `add-use-client.mjs ← stamps "use client" onto dist chunks from source directives (tsup onSuccess)`, `generate-shape-morph-ease.mjs ← writes the generated --ui-shape-morph-ease value in tokens.css`, `shapeMorphSpring.mjs ← the spring the ease is sampled from (retune here)`.
  - [ ] 4. Menu table (206-223): replace the header row with `| Component | File | Radix | Notes |` and the separator with four cells. Add rows `| \`DropdownMenuSearch\` | \`Menu/DropdownMenuSearch.tsx\` | – | search row; \`shortcut\`/\`showShortcut\` |` and `| \`DropdownCaret\` | \`DropdownCaret/DropdownCaret.tsx\` | – | \`DropdownCaretVariant\`; reads the nearest \`.ds-dropdown-caret-host\` |`. In the `DropdownMenuItem` row add "`variant`: `DropdownMenuItemVariant` (`default`\|`danger`)". In the `DropdownMenuContent` row add "`matchTriggerWidth` (default true), `dismissOnFocusLoss` (default false), `portal`/`portalProps`".
  - [ ] 5. Build block (588-592) →
    ```text
    npm run build
      → generate-icon-exports      (regenerate Icons/index.ts)
      → generate-shape-morph-ease  (regenerate --ui-shape-morph-ease in tokens.css from shapeMorphSpring.mjs)
      → sync-tokens                (regenerate @theme inline block in index.css AND theme.css)
      → tsup (build:js)            (ESM + CJS + .d.ts; clean:true wipes dist first)
           └ onSuccess             → add-use-client.mjs (stamp "use client" chunks), then the CSS emit (dist/styles.css + dist/theme.css)
    ```
    (:594 and :599 belong to WI-C1-10.)
  - [ ] 6. Architecture skill: arch:318-321 → "Existing families: list them with `rg -o -- '--ui-[a-z-]+-(duration|ease)' src/styles/tokens.css | sort -u` (today: roll-hover, roll-change, fade-change, underline-link, rolling-digits, sidebar-icon, shape-morph, reveal-change, chat-reveal, chat-stream, chat-disclosure)" (C-ARCH-35). In the arch:36-55 naming table add a row `| \`CheckboxVariant\` | \`variant\` | \`<Checkbox variant={CheckboxVariant.primary} />\` |` after the `CheckboxChecked` row (:52).
  - [ ] 7. `src/components/Text/constants.ts:66`: `/** Letter-spacing tokens. Only these three roles ship a tracking token. */` → `/** Letter-spacing tokens. Only these four roles ship a tracking token. */`.
  - [ ] 8. Verify: `npm run lint` → exit 0. `rg -n "8 roles|\(eight\)|outer dashed|0\.25rem|internal, not re-exported|IDENTITY pair" .agents/skills/dooph-ds-codebase/SKILL.md src/components/Sheet/Sheet.tsx` → no matches. `for f in AIChat DropdownCaret MorphRotationShape ShapeMorphSpinner Sticker; do rg -c "$f/" .agents/skills/dooph-ds-codebase/SKILL.md; done` → each ≥ 1. `rg -n "generate-shape-morph-ease|add-use-client" .agents/skills/dooph-ds-codebase/SKILL.md` → ≥ 2 lines. The menu table renders with four columns in a Markdown preview. `git diff -U0 .agents/skills/dooph-ds-codebase/SKILL.md | rg "^[-+].*5\.4"` → only the :531 line, as an identical-substring -/+ pair. `git diff -U0 .agents/skills/dooph-ds-codebase/SKILL.md | rg "ds-slider-fill|Rule 6\.$|ToastTypes"` → no hit (WI-C2-14's lines untouched).
  - [ ] 9. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: every "edit" row's old text is gone (step 8 rg); the five folders appear in the tree and inventory; the build block names all five steps; owned rows are untouched.
- log:
  - 2026-10-01 — created by audit

