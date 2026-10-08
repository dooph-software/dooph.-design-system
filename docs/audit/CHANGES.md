# Working change record

A running log of every change made while working through the audit
([REMEDIATION.md](REMEDIATION.md)). Started 2026-10-02 at `b436647`.

**Why this file exists.** The maintainer deferred all documentation work until
the code changes are finished. Edits to `CHANGELOG.md`, the consumer skills
under `skills/`, `README.md`, the theming `token-contract.md` and the authoring
skills under `.agents/skills/` are NOT made as we go. Each entry below records
what those docs will need. At the end, one agent reads this file and writes the
docs from it. Header contracts (`## behavior` / `## constraints` blocks) are the
exception: `AGENTS.md` requires them to change in the same edit as the code, so
they are updated in place and only noted here.

**Rules for adding an entry**
- One entry per change, newest at the bottom, under the date it was made.
- Use plain names (component, prop, file), not audit IDs alone. An audit ID may
  follow in brackets for traceability.
- Fill every field. Write "none" rather than leaving one out.
- `consumer impact` says what a consumer of the package sees. `breaking` is
  `no`, or `yes — v6` with the exact before → after the migration skill needs.
- `docs owed` lists each doc the final pass must touch and what to say there.
- The package version is never bumped here. The maintainer cuts v6 and asks for
  the v6 migration skill at release time. Every `breaking: yes — v6` entry feeds
  that skill.

---

## 2026-10-02

### Decisions recorded
- **Release.** No agent bumps the version. The queued breaking changes are v6
  work, and the maintainer is still adding to it. A v6 migration skill is
  written only right before the maintainer cuts the release.
- **Dark-mode danger Sticker.** Left as is. The maintainer is overhauling the
  dark theme constants and will settle it there.
- **Motion tokens.** Every motion value lives in a token, through a small
  shared scale. See REMEDIATION.md, decision D-03, for the full rule. Nothing
  has been implemented yet.
- **Figma variable exports.** Deleted (below).

### PentagonShape and PuffShape now honour `fillColor` [F-004, WI-057]
- files: `src/components/Shapes/PentagonShape.tsx`, `src/components/Shapes/PuffShape.tsx`
- what changed: the `<path>` no longer hard-codes `fill="currentColor"`, so it
  inherits the fill `BaseShape` puts on the `<svg>`, like the other 10 shapes do.
- consumer impact: `<PentagonShape fillColor="…">` and `<PuffShape fillColor="…">`
  now paint that colour. Before, they always painted the text colour. ShapeButton
  passes `currentColor` explicitly, so it looks the same.
- breaking: no
- verified: `npm run lint` exit 0. In Storybook, the `Bits & Pieces/Shapes` →
  Colors story shows the Pentagon path with no `fill` attribute, computed
  `rgb(23,23,23)` (primary). The Puff path computes `rgb(19,194,159)` (prominent-alt),
  alternating like its neighbours.
- docs owed: CHANGELOG `[Unreleased]` → Fixed: "`fillColor` now applies to
  `PentagonShape` and `PuffShape`."

### `ToastProvider duration` now sets the default dismiss delay [F-005, WI-093]
- files: `src/components/Toast/Toast.tsx`, `src/components/Toast/Toast.stories.tsx`
- what changed: `ToastProviderProps` declares `duration?: number` (with JSDoc,
  default 4000). The provider passes it to the Radix provider. Each toast passes
  only its own `duration`, instead of `item.duration ?? 4000`, which used to
  override the provider. A new story, `Overlays/Toast` → "Provider duration (1s)",
  shows it.
- consumer impact: `<ToastProvider duration={8000}>` now applies to every toast
  it renders; it used to be silently ignored. A per-toast `toast({ duration })`
  still wins. An app that sets no duration anywhere still gets 4000ms.
- breaking: no
- verified: `npm run lint` exit 0. Storybook timings, measured from the click to
  the toast being removed:
  - Provider duration (1s): 1027 ms.
  - Standard (no duration set): 4026 ms.
  - Persistent (`duration: Infinity`): still open after 6 s.
- docs owed:
  - CHANGELOG → Fixed: "`ToastProvider`'s `duration` now sets the auto-dismiss
    delay for every toast it renders. It was overridden by a per-toast 4000ms.
    The default stays 4000ms."
  - Usage skill: mention `ToastProvider duration` where the Toast API is described.

### CopyButton's props are real types, and `value` is required [F-002, WI-080]
- files: `src/components/CopyButton/CopyButton.tsx`, `src/components/CopyButton/CopyButton.stories.tsx`
- what changed:
  - `CopyButtonProps` now extends `Omit<ComponentPropsWithoutRef<"button">, "children">`
    instead of the generic Button's props. Those resolved to `any`, so every
    prop, `value` included, was untyped.
  - The `onClick?.(e as never)` cast is gone.
  - The stories now pass `value` through the meta `args`. With real types the
    two `render`-only stories no longer compiled; the plan had missed this.
- consumer impact:
  - `<CopyButton />` without `value` is now a compile error. Before, it compiled
    and copied the string "undefined".
  - A non-string `value`, an unknown `variant`, a non-function `onCopied`,
    unknown props, and `size`/`asChild`/`children` are compile errors too.
  - Runtime behaviour is unchanged.
- breaking: no at runtime. At compile time, code that was already wrong stops
  type-checking. Treat it as a minor-level type fix, not a v6 rename.
- verified:
  - A type probe compiled 3 valid usages, and all 6 invalid usages failed as
    expected. A `ToastProvider duration` usage also type-checked.
  - `npm run lint` exit 0.
  - The Storybook `Buttons/CopyButton` → Secondary story renders the button
    (`aria-label="Copy to clipboard"`) with no console errors.
- docs owed:
  - CHANGELOG → Changed: "`CopyButtonProps` is now typed from the native
    `<button>` attributes. `value` is required and must be a string, and
    `variant`/`onCopied` are checked. Props CopyButton never accepted (`size`,
    `asChild`, `children`, unknown attributes) are compile errors. Previously
    every prop was `any`."
  - Usage skill: "`CopyButton` (writes the required `value` string to the clipboard, …".

### Deleted `figma-variable-jsons/` [F-106, WI-021]
- files: removed `figma-variable-jsons/` (5 files: `Colors - Interactables.json`,
  `Colors - Statics.json`, `Corner Radii.json`, `Icons.json`, `Sizing_Spacing.json`)
- what changed: deleted the initial-commit Figma variable exports. They
  contradicted the current token model, and nothing read them: a repo-wide
  search outside `docs/audit/` finds no reference.
- consumer impact: none. The folder was not published, since `package.json`
  `files` does not include it.
- breaking: no
- verified: the reference search returned 0 hits. The deletion is unstaged, so
  `git restore figma-variable-jsons` brings the files back.
- docs owed: none. No skill, README or doc mentions the folder.

### Decisions recorded (second batch)
- **`theme.css` size names:** intended. `max-w-md` resolving to the DS `md`
  spacing value is correct behaviour. Document it for adopters (doc-refresh.md).
- **`"use client"`:** as rarely as possible. Only modules that truly need it.
- **Colour props:** one shared lookup (`resolveDsColor`).
- **Option prop names:** allow-list extended with `mode`, `direction`,
  `sortDirection`, `state`.
- **Callbacks:** `value` / `defaultValue` / `onValueChange` everywhere, and
  `inverseTheme` → `themeInverse`. These are v6 renames.
- **Const/type renames:** `FontAxes` → `FontAxis` and `ProgressIndicatorVariants`
  → `ProgressIndicatorVariant` (v6).
- **Size words:** `standard` is the base size everywhere; `AvatarSize.small` →
  `sm`; Button/Tab/Toggle `sm` = 34px and `micro` = 28px on the button-height
  tokens; `TooltipTypes` / `ToastTypes` → `*Variant` (all v6).
- **Bad Calendar/DatePicker values:** render nothing after a development warning.
- **Internals:** removed at the agent's discretion (see REMEDIATION.md D-15).
- **Skills and docs:** all rebuilt from scratch at the end. See doc-refresh.md.

### Deleted the vendored `radix-ui-design-system` skill [F-025, WI-013]
- files: removed `.agents/skills/radix-ui-design-system/` (SKILL.md, examples/,
  templates/) and its entry in `skills-lock.json`.
- what changed: the third-party skill taught seven patterns this repo's rules
  ban, so it is gone.
- consumer impact: none. It was an authoring skill, not shipped.
- breaking: no
- verified: `npm run lint` exit 0. `skills-lock.json` still parses, with 3 skills left.
- docs owed: none, since the authoring skills are being rebuilt. The codebase
  skill still names it until then.

### Deleted the orphan test `waveGeometry.test.ts` [F-078, WI-003]
- files: removed `src/components/ProgressIndicator/waveGeometry.test.ts`.
  `waveGeometry.ts` stays; ProgressIndicator imports it.
- what changed: the repo's only test, which nothing ran.
- consumer impact: none.
- breaking: no
- verified: `npm run lint` exit 0.
- docs owed: don't document a test command (doc-refresh.md).

## 2026-10-03

### Spacing scale renamed to match Figma; new 6px step; two values changed
- files: 56 files under `src/` (component classNames, stories, `tokens.css`,
  `dooph-component-tokens.css`, `index.css`) plus the regenerated `@theme`
  block and `theme.css`. The script is
  `docs/audit/_work/scratch/token-pass/spacing-rename.mjs`. It runs in one pass
  and refuses to run a second time.
- what changed: names are matched by Figma variable ID (old export in git →
  new export).
  - Renames, old → new: `xs`→`sm` (8px), `sm`→`rg` (10px), `rg`→`md` (12px),
    `md`→`lg` (16px), `lg`→`xl` (20px), `xl`→`xxl`, `xxl`→`xxxl`.
    `xxxs` (2px) and `xxs` (4px) are unchanged.
  - New `xs` = 6px.
  - Value changes from Figma: `xxl` is 26px (was 28px as old `xl`), and `xxxl`
    is 42px (was 40px as old `xxl`).
  - The rename covers every Tailwind spacing utility (`p*`, `m*`, `gap*`, `w`,
    `h`, inset, …), the `ds-{p,px,py,pl,pr,gap,my}-ui-*` helper classes,
    `--ui-spacing-*` var references, and three comments that paired a name
    with its px value.
- consumer impact: every DS spacing utility now means a different size. `p-md`
  was 16px and is now 12px; to keep 16px, write `p-lg`. The same applies to
  `--ui-spacing-*` overrides and `ds-*-ui-*` helper classes.
- breaking: yes — v6. Old → new, for classes, tokens and helpers alike:
  `xs→sm`, `sm→rg`, `rg→md`, `md→lg`, `lg→xl`, `xl→xxl` (28→26px),
  `xxl→xxxl` (40→42px). There is a new `xs` (6px). A codemod must apply the
  map in ONE pass, because applying it in sequence would chain the renames.
- verified:
  - `npm run lint` exit 0; `npm run sync-tokens` regenerated 130 tokens.
  - Computed padding, margin, gap, width and height for every element in all
    320 stories were snapshotted twice before the rename (0 differences
    between the two runs) and once after.
  - The only differences after the rename are the expected value changes:
    CTAButton's content gap 40→42px, which also makes its label 2px narrower,
    and the BaseText stories' bottom padding 28→26px.
  - Toast's `gap-xxxl` also goes 40→42px. Toasts only open on click, so the
    snapshot didn't cover them.
  - Two chat-streaming stories differed only by timing and were re-checked.
- docs owed: every doc that names a spacing utility or `--ui-spacing-*` (README,
  theming skill, token-contract.md, usage examples) uses the new names. The
  v6 migration skill gets the map above, plus the one-pass codemod note.

### Size words, Tooltip/Toast variant names, one micro height, new medium/big heights, ghost text colour
- files: by `docs/audit/_work/scratch/token-pass/size-words-rename.mjs`.
  - Its first run wrote a literal `$1` in three spots: Button and toggleOption
    `defaultVariants`, and the `AvatarSize` const.
    `docs/audit/_work/scratch/token-pass/size-words-repair.mjs` repaired them
    from git.
  - Hand edits: `tokens.css` (moved the micro height next to the button
    heights) and `scripts/sync-theme.mjs` (new heights excluded from the theme,
    like the other button heights).
- what changed:
  - **Base size key** `default` → `standard`, in the size consts `ButtonSize`,
    `TextDropdownSize`, `TabSize`, `ToggleSize` and their cva size blocks and
    defaults. `AvatarSize.small` → `AvatarSize.sm`.
  - **`ToggleSize.iconSm` ("icon-sm") → `ToggleSize.iconMicro` ("icon-micro").**
    It was 28px, so its name now matches its height. `TabSize.iconSm` and
    `ButtonSize.iconSm` are 34px and keep their names.
  - **`TooltipTypes` → `TooltipVariant`; `ToastTypes` → `ToastVariant`.** Both
    the const and the type.
  - **`--ui-height-tab-micro` (28px) is merged into `--ui-height-button-micro`,**
    which goes from 26px to 28px. Utilities `h-tab-micro` → `h-button-micro`,
    `size-tab-micro` → `size-button-micro`.
  - **New tokens** `--ui-height-button-medium: 46px` and
    `--ui-height-button-big: 54px`, with utilities `.h-button-medium` /
    `.h-button-big`. No component uses them yet; Button medium/big comes next.
  - **`--ui-color-ghost-foreground` → `var(--ui-color-text)`** in light and dark
    (was #4a4a4a / #afafaf). The maintainer re-pointed ghost content at rest to
    primary text in Figma.
- consumer impact:
  - The renamed consts and keys break code that uses the old names.
  - Micro icon buttons (`ButtonSize.iconMicro`) are 2px larger.
  - Everything painted with the ghost foreground is darker (#161616), not only
    ghost buttons: chat parts and the chat "thinking" shimmer base, TextLink,
    Tooltip, Toast close, HotkeyIndicator, SearchBox, Calendar,
    DropdownTriggers, SidebarWithHoverIcon, CopyButton.
- breaking: yes — v6.
  - Consts: `ButtonSize.default`→`.standard`, `TextDropdownSize.default`→`.standard`,
    `TabSize.default`→`.standard`, `ToggleSize.default`→`.standard`,
    `ToggleSize.iconSm`→`.iconMicro`, `AvatarSize.small`→`.sm`,
    `TooltipTypes`→`TooltipVariant`, `ToastTypes`→`ToastVariant`.
  - Raw string sizes passed as `size="default"` become `"standard"`, and
    `"icon-sm"` on Toggle becomes `"icon-micro"`.
  - Tokens and utilities: `--ui-height-tab-micro`→`--ui-height-button-micro`,
    `h-tab-micro`→`h-button-micro`, `size-tab-micro`→`size-button-micro`.
  - Value changes: `--ui-height-button-micro` 26→28px;
    `--ui-color-ghost-foreground` → text colour.
- verified:
  - `npm run lint` exit 0; `npm run sync-tokens` ok.
  - Every story was snapshotted before and after: padding, margin, gap, size
    and colour of every element.
  - The only differences: the ghost colour 74,74,74 → 22,22,22 in the families
    listed above, and micro icon buttons 26→28px, which grows their row and
    container by 2px (Button and CopyButton stories, one chat part).
  - Nothing else moved, and no element-count changes.
- docs owed: usage skill, migration skill (the renames above), token-contract
  (new and removed tokens, ghost alias). Comments that still say "Figma
  `buttonSizes/buttonHeight`" use Figma's old variable names; refresh them in
  the docs pass.
- follow-up (maintainer, 2026-10-03): keep the ghost foreground shared for now.
  The maintainer will review it in Storybook and may want a slight tweak, such
  as a separate ghost-button token.

<!-- merged from _work/changes/01-motion.md -->
### 01 — Motion scale (batch 01)

Status: complete. Spec: `docs/audit/motion-scale.md` (signed off 2026-10-03).

## Decisions taken while implementing
- **Reduced motion collapses to 1ms, not 0ms.** The spec §1 says `0ms`; the
  brief says `1ms`, and the code agrees with the brief. RevealChangeText's
  header contract requires its transition to *run* under reduced motion, because
  its content swap and `onSettled` hang off `transitionend`, which a 0ms
  transition never fires. MorphRotationShape starts sampling on `transitionrun`,
  which a 0ms transition also never fires. So the global block sets every
  `--ui-motion-duration-*` to `1ms` and the two staggers to `0ms`.
- **Overlays get the enter/exit curves.** The brief asked for the `enter` curve
  on open and the `exit` curve on close. Menu, tooltip, popover, toast and modal
  used tailwindcss-animate's default `ease` before; Sheet already used these two
  curves as literals.
- **`ds-motion-state` has zero specificity** (`:where()`), so a consumer's own
  `transition-*` / `duration-*` class on the same element still wins, as it did
  when the component carried those utilities.

## Progress (write-to-disk-first)
- [x] tokens.css: scale + shimmer loop token + global reduce block; 29 tokens removed
- [x] sync-theme.mjs EXCLUDED: new tokens added, removed tokens dropped
- [x] dooph-component-tokens.css: ds-motion-state, ds-motion-overlay(-dialog/-sheet), ds-progress-arc, ds-outline-orb-1/-2; helpers rewired; redundant reduce blocks removed
- [x] index.css: helpers rewired; redundant reduce blocks removed
- [x] components
- [x] headers
- [x] verify

---

### Motion runs on one shared scale [F-016, F-020, F-021, F-035; WI-058/064/070/082/050]

- **files** (33)
  - Build: `scripts/sync-theme.mjs` (`EXCLUDED` only).
  - Styles: `src/styles/tokens.css`, `src/styles/index.css` (outside the
    generated block), `src/styles/dooph-component-tokens.css`.
  - Components: `AIChat/AITextPart.tsx`, `AIChat/AIThinkingPart.tsx`,
    `AnimatedText/{FadeChangeText,RevealChangeText,RollChangeText,RollingDigitsText}.tsx`,
    `AnimatedText/useChangeSwap.ts`, `Button/Button.tsx`, `Checkbox/Checkbox.tsx`,
    `DropdownTrigger/DropdownTrigger.tsx`, `HotkeyIndicator/HotkeyIndicator.tsx`,
    `Input/Input.tsx`, `Menu/DropdownMenu.tsx`, `Modal/Modal.tsx`,
    `MorphRotationShape/MorphRotationShape.tsx`, `OutlineButton/OutlineButton.tsx`,
    `Popover/Popover.tsx`, `ProgressIndicator/ProgressIndicator.tsx`,
    `SearchBox/SearchBox.tsx`, `Sheet/Sheet.tsx`,
    `SidebarWithHoverIcon/SidebarWithHoverIcon.tsx`, `Slider/Slider.tsx`,
    `SplitButton/SplitButton.tsx`, `Table/Table.tsx`, `TextLink/TextLink.tsx`,
    `Toast/Toast.tsx`, `Toggle/toggleOption.ts`, `Tooltip/Tooltip.tsx`,
    `VerificationCode/CodeDigitInput.tsx` (all under `src/components/`).
  - Not touched: `LoadingSpinner/**` and `spinnerGeometry.ts` (a later batch
    rebuilds the spinner).

- **what changed**
  - Every duration and curve in the package now comes from one scale in
    `tokens.css`. Changing one scale token retunes that step everywhere.
  - Components no longer write `duration-N`, `ease-*`, `cubic-bezier(…)` or
    `Nms` anywhere. They use `ds-*` helper classes, and CSS helpers read the
    scale through `var()`.
  - Inline-style transitions moved into classes: the OutlineButton orbs and
    the ProgressIndicator arcs.
  - Reduced motion is handled in ONE place: a global block at the end of
    `tokens.css`. The per-component overrides are gone.
  - 29 per-component motion tokens were removed. They only restated a scale
    value.

  **New tokens** (raw `var()` only, never Tailwind theme keys; all are in
  `EXCLUDED` in `sync-theme.mjs`; declared on `:root, .light`)

  | token | value |
  |---|---|
  | `--ui-motion-duration-fast` | 150ms |
  | `--ui-motion-duration-base` | 200ms |
  | `--ui-motion-duration-slow` | 300ms |
  | `--ui-motion-duration-slower` | 420ms |
  | `--ui-motion-duration-slowest` | 600ms |
  | `--ui-motion-ease-standard` | `cubic-bezier(0.4, 0, 0.2, 1)` |
  | `--ui-motion-ease-enter` | `cubic-bezier(0.32, 0.72, 0, 1)` |
  | `--ui-motion-ease-exit` | `cubic-bezier(0.4, 0, 1, 1)` |
  | `--ui-motion-ease-linear` | `linear` |
  | `--ui-shimmer-duration` | 2000ms (loop; was the literal `2s` in `ds-shimmer-text`) |

  Kept off the scale, unchanged: `--ui-shape-morph-duration/-ease/-interval/-passive-spin-duration`
  (generated spring), `--ui-roll-hover-stagger` 35ms, `--ui-rolling-digits-stagger` 0ms.
  The two spinner loop tokens in spec §2 belong to the later spinner batch.

  **Global reduced-motion block** (`tokens.css`, end of file)
  - `@media (prefers-reduced-motion: reduce) { :root, .light { … } }`.
  - It sets all five `--ui-motion-duration-*` to `1ms`, and
    `--ui-roll-hover-stagger` and `--ui-rolling-digits-stagger` to `0ms`.
  - Why 1ms and not 0: a 0ms transition never fires `transitionrun` or
    `transitionend`. RevealChangeText swaps its content and calls `onSettled`
    on `transitionend`. MorphRotationShape starts sampling on `transitionrun`.
    1ms reads as instant and still fires every event (`animationend` too, which
    retires the roll/fade change halves and the rolling-digit slots).
  - `.light` is listed because it redeclares the scale. Without it, a `.light`
    subtree would get full-length motion back.
  - Loop cycle times are deliberately left out (a loop at 1ms would strobe).
    Each loop keeps its own reduce rule.

  **Reduce rules removed** (the global block now covers them)
  - The 15 `motion-reduce:…duration-0` utilities: Menu ×2, Modal ×4, Sheet ×4,
    Toast ×2, Tooltip ×3.
  - The per-helper `@media (prefers-reduced-motion)` blocks for:
    `ds-progress-fill/-remainder`, `ds-slider-glide`,
    `ds-copy-icon-clipboard/-check`, the chat reveal/lift/chevron/disclosure
    and stream-in, `ds-underline-link`, `ds-rolling-digits-*`,
    `ds-roll-change-*`, `ds-fade-change-*`, `ds-sidebar-rail` and
    `ds-reveal-change`.
  - Several of those used `transition: none` or `animation: none` (progress,
    slider, copy icon, chat, underline wipe). Those now run at 1ms instead.
    That looks the same (instant) and keeps the end events firing.

  **Reduce rules kept** (they do more than shorten)
  - `ds-shimmer-text`: stops the loop and shows plain colour.
  - `ds-roll-hover-*`: static frame; the rest face only.
  - `ds-shape-morph` autoplay and passive spin: loops, stopped outright.
  - `ds-shape-morph` and `ds-dropdown-caret(-chevron)`: their spring duration
    is off the scale, so the global block can't reach it. These rules now set
    `transition-duration: var(--ui-motion-duration-fast)`. Inside the reduce
    query that resolves to the collapsed 1ms, so the old `1ms` literal is gone.

  **New `ds-*` helpers** (`dooph-component-tokens.css`)

  | helper | what it does | replaced |
  |---|---|---|
  | `ds-motion-state` | Hover/press/focus transition, `:where()` (zero specificity). Property list: color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, opacity, box-shadow, filter, transform, translate, scale, rotate. Uses `fast` + `standard`. Layout properties are deliberately left out. | `transition-all duration-150 ease-out` (Button, Checkbox, DropdownTrigger ×3, OutlineButton, toggleOption); `transition-all duration-100` (Input ×2, SearchBox, SplitButton ×2, CodeDigitInput); `transition-colors duration-100` (HotkeyIndicator, `menuItemClassName` → menu items + CalendarPresetItem, Table rows, TextLink) |
  | `ds-motion-overlay` | `animation-duration` and `animation-timing-function` keyed off `data-state`. Open (including Tooltip's `delayed-open`/`instant-open`) = `fast` + `enter`; closed = `fast` + `exit`. Under `[data-swipe="cancel"]` it also sets a transform/translate transition (`fast` + `standard`). | the `data-[state=*]:duration-100/150` + `motion-reduce:` classes on DropdownMenuContent, TooltipContent, Toast root; Popover's implicit tailwindcss-animate default (150ms); Toast's `data-[swipe=cancel]:transition-transform` |
  | `ds-motion-overlay-dialog` | open = `base` + `enter`; closed = `fast` + `exit` | ModalOverlay / ModalContent `duration-200` / `duration-150` + `motion-reduce:` classes |
  | `ds-motion-overlay-sheet` | open = `slow` + `enter`; closed = `base` + `exit` | SheetOverlay / sheet panel `duration-300` / `duration-200`, the panel's arbitrary `[animation-timing-function:cubic-bezier(…)]` pair, and the `motion-reduce:` classes |
  | `ds-progress-arc` | `stroke-dasharray, stroke-dashoffset` over `slow` + `standard` | ProgressIndicator's inline `style={{ transition }}` (300ms `cubic-bezier(0.4,0,0.2,1)`) on both arcs |
  | `ds-outline-orb-1` | opacity `slow` + `standard`; transform `fast` + `enter` | OutlineButton orb 1's inline `opacity 0.36s ease-out, transform 0.16s ease-out` |
  | `ds-outline-orb-2` | opacity `slower` + `standard`; transform `base` + `enter` | OutlineButton orb 2's inline `opacity 0.42s ease-out, transform 0.22s ease-out` |

  The keyframe utilities (`animate-in`, `fade-*`, `zoom-*`, `slide-*`) stay on
  the components; the overlay helpers set only the duration and the curve.

  **Existing helpers rewired onto the scale** (literal or removed token → scale):
  - `ds-shape-button-shadow` → `fast` + `standard`.
  - `ds-progress-fill/-remainder` → `slow` + `standard`.
  - `ds-slider-glide` → `base` + `enter`.
  - `ds-copy-icon-*` → `fast` + `standard` (opacity) and `fast` + `enter`
    (transform).
  - `ds-chat-reveal`, `ds-chat-lift` → `fast` + `standard`.
  - `ds-chat-chevron` → `base` + `standard` (transform) and `fast` + `standard`
    (opacity).
  - `ds-chat-disclosure` → `base` + `standard`.
  - `ds-chat-prose` stream-in → `slower` + `standard`.
  - `ds-shimmer-text` → `--ui-shimmer-duration` + `linear`.
  - `ds-roll-hover-in/-out` → `slower` + `enter`.
  - `ds-underline-link` → `slowest` + `enter`.
  - `ds-rolling-digits-col` → `base` + `enter`.
  - Rolling-digits slot enter → `slow` + `enter`; exit → `base` + `enter`.
  - `ds-roll-change-out` and `ds-fade-change-out` → `base` + `exit`.
  - `ds-roll-change-in` and `ds-fade-change-in` → `slow` + `enter`.
  - `ds-sidebar-rail` → `slow` (traverse) and `base` (hover), both `enter`.
  - `ds-shape-morph` lean → `base` + `enter`.
  - `ds-dropdown-caret(-chevron)` colour → `base` + `enter`.
  - `ds-reveal-change` → out `slow`, in `slower`, both `enter`.

- **consumer impact**
  - Most motion keeps its exact value. The timings that changed are listed
    below; they match spec §4.
  - Overlay curves changed from `ease` to `enter` on open and `exit` on close.
  - Hover sites that used `transition-colors` now also ease opacity, shadow,
    filter and transform.
  - Hover sites that used `transition-all` no longer ease layout properties.
    None of them animated layout.
  - A consumer can now retune all motion by overriding one of nine
    `--ui-motion-*` tokens. Reduced motion follows automatically.
  - A consumer who overrode any of the 29 removed tokens loses that override
    silently. There is no per-component motion knob any more: the only knob is
    the shared scale step.

  **Every timing whose value changed** (= motion-scale.md §4)

  | where | before | now | change |
  |---|---|---|---|
  | 10 hover sites: HotkeyIndicator, Input ×2, menu items + CalendarPresetItem, SearchBox, SplitButton ×2, Table rows, TextLink, CodeDigitInput | 100ms | `fast` 150ms, `standard` | +50ms |
  | 7 hover sites: Button, Checkbox, DropdownTrigger ×3, OutlineButton, toggleOption | 150ms ease-out | `fast` 150ms, `standard` | curve only |
  | Menu open, Tooltip open | 100ms | `fast` 150ms | +50ms |
  | Modal close | 150ms | `fast` 150ms | none |
  | CopyButton icon swap | opacity 120ms ease-out, transform 160ms | both `fast` 150ms | +30 / −10ms |
  | OutlineButton orbs | opacity 360 / 420ms, transform 160 / 220ms, ease-out | `slow` 300 / `slower` 420, `fast` 150 / `base` 200 | inner orb opacity −60ms; others ≤20ms; 2-orb stagger kept |
  | Slider glide | 180ms `cubic-bezier(0.22,1,0.36,1)` | `base` 200ms, `enter` | +20ms |
  | Chat stream | 400ms ease-out | `slower` 420ms, `standard` | +20ms |
  | Chat disclosure | 200ms ease-in-out | `base` 200ms, `standard` | curve only |
  | Chat hover reveal / lift | 150ms ease-out | `fast` 150ms, `standard` | curve only |
  | Reveal-change out | 320ms | `slow` 300ms | −20ms |
  | RollingDigits roll / enter / exit | 240 / 260 / 200ms | `base` 200 / `slow` 300 / `base` 200 | −40 / +40 / 0ms |
  | SidebarWithHoverIcon traverse / hover | 260 / 180ms | `slow` 300 / `base` 200 | +40 / +20ms |
  | Shape-morph hover lean + dropdown caret colour | 180ms `cubic-bezier(0.2,0,0,1)` | `base` 200ms, `enter` | +20ms |
  | RollHoverText | 500ms | `slower` 420ms | −80ms |
  | ProgressIndicator, LinearProgressIndicator | 300ms (`standard` / ease-out) | `slow` 300ms, `standard` | LPI curve only |
  | Popover, Toast swipe-cancel | implicit 150ms (library default) | `fast` 150ms, explicit | none |
  | Overlay curves (menu, tooltip, popover, toast, modal) | `ease` | `enter` in / `exit` out | curve only |

  Unchanged values (now on the scale):
  - roll/fade change 200 / 300ms;
  - underline wipe 600ms;
  - reveal-change in 420ms;
  - Modal open 200ms;
  - Sheet 300 / 200ms;
  - Toast 150 / 150ms;
  - Tooltip / Menu close 150ms;
  - shimmer 2000ms.

- **breaking:** yes — v6. These 29 tokens were removed. Each maps to its
  replacement scale token:

  | removed | replacement |
  |---|---|
  | `--ui-chat-reveal-duration` | `--ui-motion-duration-fast` |
  | `--ui-chat-reveal-ease` | `--ui-motion-ease-standard` |
  | `--ui-chat-stream-duration` | `--ui-motion-duration-slower` |
  | `--ui-chat-stream-ease` | `--ui-motion-ease-standard` |
  | `--ui-chat-disclosure-duration` | `--ui-motion-duration-base` |
  | `--ui-chat-disclosure-ease` | `--ui-motion-ease-standard` |
  | `--ui-roll-hover-duration` | `--ui-motion-duration-slower` (curve was a literal; now `--ui-motion-ease-enter`) |
  | `--ui-roll-change-out-duration` | `--ui-motion-duration-base` |
  | `--ui-roll-change-in-duration` | `--ui-motion-duration-slow` |
  | `--ui-roll-change-out-ease` | `--ui-motion-ease-exit` |
  | `--ui-roll-change-in-ease` | `--ui-motion-ease-enter` |
  | `--ui-fade-change-out-duration` | `--ui-motion-duration-base` |
  | `--ui-fade-change-in-duration` | `--ui-motion-duration-slow` |
  | `--ui-fade-change-out-ease` | `--ui-motion-ease-exit` |
  | `--ui-fade-change-in-ease` | `--ui-motion-ease-enter` |
  | `--ui-shape-morph-nudge-duration` | `--ui-motion-duration-base` |
  | `--ui-shape-morph-nudge-ease` | `--ui-motion-ease-enter` |
  | `--ui-rolling-digits-duration` | `--ui-motion-duration-base` |
  | `--ui-rolling-digits-enter-duration` | `--ui-motion-duration-slow` |
  | `--ui-rolling-digits-exit-duration` | `--ui-motion-duration-base` |
  | `--ui-rolling-digits-ease` | `--ui-motion-ease-enter` |
  | `--ui-sidebar-icon-duration` | `--ui-motion-duration-slow` |
  | `--ui-sidebar-icon-hover-duration` | `--ui-motion-duration-base` |
  | `--ui-sidebar-icon-ease` | `--ui-motion-ease-enter` |
  | `--ui-underline-link-duration` | `--ui-motion-duration-slowest` |
  | `--ui-underline-link-ease` | `--ui-motion-ease-enter` |
  | `--ui-reveal-change-in-duration` | `--ui-motion-duration-slower` |
  | `--ui-reveal-change-out-duration` | `--ui-motion-duration-slow` |
  | `--ui-reveal-change-ease` | `--ui-motion-ease-enter` |

  The replacement is shared, not per component. Overriding it retunes every
  component on that step. A consumer who needs one component alone to differ
  must target that component's `ds-*` class in their own CSS. None of the 29
  was a Tailwind theme key, so no utility class disappears. `theme.css` is
  unchanged.

  Header contracts touched (comment text only, updated in the same edit as the
  code; no constraint was contradicted or removed):
  - `AITextPart`, `## behavior`: stream-in is timed by the motion scale; blur
    and rise stay `--ui-chat-stream-*`.
  - `AIThinkingPart`, `## behavior` and the chevron's inline comment: the
    disclosure is timed by the motion scale.
  - `FadeChangeText`, `## constraints`: timing is on the scale; depth is
    `--ui-fade-change-depth`; reduced motion is the global collapse.
  - `RollChangeText`, `## constraints`: same. "out (200ms) / in (300ms)"
    became "out (`base`) / in (`slow`)".
  - `RevealChangeText`, `## constraints`: reduced motion is the global
    collapse to a non-zero instant. Its rationale (transitionend must fire) is
    kept and extended to cover zero durations.
  - `RollingDigitsText`, `## updating`: timing is on the scale; stagger and
    fade ratio stay `--ui-rolling-digits-*`.
  - `useChangeSwap`, `## constraints`: "timing lives in each wrapper's CSS
    classes, on the motion scale".
  - `MorphRotationShape`, `## behavior` (the lean is on the motion scale) and
    `## constraints` (the step stays `--ui-shape-morph-*`; the lean is
    `--ui-motion-*`).
  - `SidebarWithHoverIcon`, `## constraints`: durations are scale tokens read
    by `.ds-sidebar-rail`; reduced motion is the global collapse.
  - Plain doc comments (no contract block):
    - Sheet's `sheetVariants` JSDoc (`slow`/`enter` in, `base`/`exit` out, via
      `ds-motion-overlay-sheet`; the timing-function workaround note dropped);
    - ProgressIndicator's `FlatProgressIndicator` JSDoc (`.ds-progress-arc`);
    - OutlineButton's controlled-orb comment;
    - Slider's step-dot comment ("over 150ms" → "at all");
    - a new Toast comment that `ds-motion-overlay` also carries swipe-cancel.
  - CSS comments:
    - the tokens.css motion legend, reduce-block rationale and the
      roll-hover, roll-change, fade-change, nudge, rolling-digits, chat and
      underline comments;
    - the index.css sidebar-rail, shape-morph, roll/fade-change,
      rolling-digits, reveal-change and shimmer comments.
  - Final sweep (this pass): re-read all 33 files and every other motion
    component (ShimmerText, RollHoverText, UnderlineLinkText, CopyButton,
    ShapeButton, CalendarPresetsPanel). No comment still states an old
    duration or curve, names a removed token, or describes a replaced
    reduced-motion mechanism. `rg` for the 29 names over `src/` and `scripts/`
    finds nothing.

- **verified**
  - `npm run sync-tokens` run after the `tokens.css` edits.
  - `npm run lint` exit 0.
  - Scoreboard m1 (hardcoded motion): 102 → 0. No other metric rose; m8
    (JS timers) is unaffected.
  - The 29 removed names: zero hits in `src/` and `scripts/`.
  - All-320-stories computed-style snapshot, before and after: only the §4
    timing/curve changes; no layout or colour change.
  - Overlays opened in Storybook animate at these timings:
    - menu, popover, toast and tooltip: 150ms on the `enter` curve;
    - modal: 200ms in, 150ms out;
    - sheet: 300ms in, 200ms out;
    - every overlay uses the `exit` curve on close.

- **docs owed**
  - CHANGELOG `[Unreleased]`:
    - **Changed:** "Motion runs on one shared scale (`--ui-motion-duration-{fast,base,slow,slower,slowest}` 150/200/300/420/600ms, `--ui-motion-ease-{standard,enter,exit,linear}`). Retune all motion by overriding these." List the §4 timing changes. Overlays now use the enter/exit curves.
    - **Changed:** "Reduced motion is one global rule. Every scale duration collapses to 1ms and the staggers to 0."
    - **Removed (v6):** the 29 tokens, with the table above.
    - **Added:** `--ui-shimmer-duration`.
  - `skills/dooph-design-system-theming/references/token-contract.md`, Motion section:
    - Add the scale and the reduced-motion rule.
    - Remove `--ui-rolling-digits-duration/-enter-duration/-exit-duration/-ease`, `--ui-roll-change-{out,in}-{duration,ease}` and `--ui-sidebar-icon-*`.
    - Keep `--ui-rolling-digits-stagger/-opacity-ratio/…` and `--ui-roll-change-depth/-blur`.
    - Rewrite the "retunes the component, including under `prefers-reduced-motion`" sentence (line ~144).
  - `.agents/skills/dooph-ds-architecture/SKILL.md` Rule 6 (~l.311–344):
    - The token list (`--ui-underline-link-*`, `--ui-rolling-digits-*`, `--ui-sidebar-icon-*`) becomes the scale.
    - "Reduced motion is a `@media` block in CSS" becomes "the single global block in tokens.css; component CSS adds a reduce rule only to stop a loop or show a static frame".
    - Name the `ds-motion-*` helpers as the only way a className reaches timing.
  - `.agents/skills/dooph-ds-codebase/SKILL.md`:
    - RevealChangeText row (~l.347): `--ui-reveal-change-*` → scale; the 1ms is now global.
    - SidebarWithHoverIcon (~l.421, ~l.489): `--ui-sidebar-icon-*` → scale.
    - Token list (~l.463).
    - CopyButton helpers (~l.543): "skipped under reduced motion" → "collapsed to 1ms".
    - Reveal timing (~l.562).
    - Add `ds-motion-state`, `ds-motion-overlay(-dialog/-sheet)`, `ds-progress-arc` and `ds-outline-orb-1/-2` to the helper inventory.
  - `.agents/skills/dooph-ds-loading-indicators/SKILL.md` (~l.270): the "transition-duration 0 under reduced motion" note for the shape-morph should say 1ms via the scale. This can wait for the spinner batch.
  - `.agents/skills/dooph-ds-contribution/SKILL.md`: add to the anti-patterns table "`duration-N` / `ease-*` / `transition-all` / inline timing in a component → `ds-motion-state` / `ds-motion-overlay*`" and "`motion-reduce:` utility → nothing (global block)".
  - v6 migration skill: the 29-token table; overriding a scale token is global; overlay curve change.


<!-- merged from _work/changes/02-callbacks-guards.md -->
### 02 — Value callbacks, inverse-theme flag, Calendar/DatePicker guards (batch 02, agent A)

Status: done. Brief: `docs/audit/_work/briefs/02-callbacks-guards.md`.

## Progress (write-to-disk-first)
- [x] VerificationCodeInput rename
- [x] Calendar rename + guard (Calendar.tsx, dateUtils.ts, dateFormat.ts, rangeSelection.ts)
- [x] CalendarPresetItem rename
- [x] DatePicker / DatePickerSplitTrigger rename + label guards
- [x] OutlineButton themeInverse
- [x] Input icon ReactElement + guard
- [x] Stories
- [x] Verify (lint, tsc probe, scoreboard)

Note on the folder diffs: the working-tree diff of these five folders also carries
other batches' scripted edits (spacing-scale renames such as `gap-md` → `gap-lg`,
`ds-motion-state` replacing `transition-all duration-*`, OutlineButton orb
transitions moving to `ds-outline-orb-*`, and `formatTriggerLabel` dropped from
`DatePicker/index.ts`, which is batch 03). None of those are recorded here.

---

## 2026-10-03

### Value controls are named `value` / `onValueChange` [WI-127, D-13]
- files:
  - `src/components/VerificationCode/VerificationCodeInput.tsx`
  - `src/components/Calendar/Calendar.tsx`, `CalendarPresetsPanel.tsx`, `rangeSelection.ts` (comment only)
  - `src/components/DatePicker/DatePicker.tsx`, `DatePickerSplitTrigger.tsx`
  - stories: `VerificationCode.stories.tsx`, `Calendar.stories.tsx`, `DatePicker.stories.tsx`
- what changed: every date/code value control now takes `value` and reports
  through `onValueChange(value)`, like the rest of the DS. Internal forwarding in
  DatePicker (`selected={props.value}` / `onSelect={props.onChange}`) is gone; it
  passes `value` / `onValueChange` straight through. Rename only: no
  uncontrolled `defaultValue` was added where none existed. The old names stay
  omitted from the native-attribute base types (`onChange` on
  VerificationCodeInput's div props, `onSelect` on DatePickerSplitTrigger and
  CalendarPresetItem), so a pre-v6 call site is a type error rather than a
  silently attached DOM handler. CalendarPresetItem also omits the native
  `value` button attribute so its `value` can be the range.
- consumer impact: call sites using the old names stop compiling and must be
  renamed. Behaviour and callback arguments are unchanged.
- breaking: yes — v6. Exact old → new, per component:
  - `VerificationCodeInput`: `onChange` → `onValueChange` (still `(value: string) => void`; `value` and `defaultValue` unchanged).
  - `DatePicker`: `onChange` → `onValueChange` (both modes; `value` unchanged).
  - `Calendar`: `selected` → `value`; `onSelect` → `onValueChange` (both modes).
  - `DatePickerSplitTrigger`: `onSelect` → `onValueChange` (`value` unchanged).
  - `CalendarPresetItem`: `selected` → `value`; `onSelect` → `onValueChange`.
  - Codemod-safe: each is a pure prop rename on that JSX element; argument types are identical.
- verified: see "Verification" below.
- docs owed:
  - CHANGELOG v6 → Changed (breaking): the five renames above.
  - v6 migration skill: the old → new list above, verbatim.
  - Usage skill / any Calendar, DatePicker, VerificationCode examples: switch to `value` / `onValueChange`.

### OutlineButton `inverseTheme` → `themeInverse` [WI-127]
- files: `src/components/OutlineButton/OutlineButton.tsx`, `OutlineButton.stories.tsx`
- what changed: the prop is renamed to match Tooltip and AIModelSelect. JSDoc
  now says "Same flag as Tooltip's `themeInverse`". The story `InverseTheme` is
  now `ThemeInverse` (Storybook id changes from `…--inverse-theme` to `…--theme-inverse`).
- consumer impact: `<OutlineButton inverseTheme>` stops compiling; rename the prop.
- breaking: yes — v6. `OutlineButton`: `inverseTheme` → `themeInverse`.
- verified: see "Verification" below.
- docs owed: CHANGELOG v6 breaking; migration skill entry; usage skill OutlineButton prop table.

### Input icon variants require an icon element [WI-128]
- files: `src/components/Input/Input.tsx` (stories unchanged — they already pass `icon={<UserIcon />}` / `icon={<TagIcon />}`)
- what changed: on `InputVariant.iconText` / `iconNumber`, `icon` is typed
  `ReactElement` instead of `ReactNode`, so `null`, `undefined`, `false` and
  `""` are compile errors. The runtime guard now uses `isValidElement`, so a
  JavaScript consumer passing a non-element also hits the throw; the message is
  `[Input] variant "<variant>" requires an \`icon\` element, e.g. icon={<PencilIcon />}.`
- consumer impact: an icon variant given a string, number or falsy icon now
  fails to compile (TS) or throws (JS). Passing an element is unchanged.
- breaking: yes — v6. `Input` (`variant` iconText / iconNumber): `icon: ReactNode` → `icon: ReactElement`; non-element values (string, number, null, false) now throw at render instead of rendering an empty/odd icon slot.
- verified: see "Verification" below.
- docs owed: CHANGELOG v6 breaking; migration skill ("wrap text icons in an element"); usage skill Input notes.

### Calendar renders nothing on an invalid value or unknown mode [WI-128, D-12]
- files: `src/components/Calendar/Calendar.tsx`, `dateUtils.ts`, `Calendar.stories.tsx`
- what changed: `Calendar` validates before any hook or date maths runs. In
  single-day mode `value` must be a valid Date; in date-range mode it must be
  `{ from: Date, to: Date }` with both valid. A `mode` other than the two
  `DatePickerMode` values is invalid too (before, it silently ran the range
  branch). Invalid → development `console.warn("[dooph] Calendar: … Rendering
  nothing.")` and the component returns `null`. Before, it warned and then
  crashed with a TypeError. A reversed range still renders and still warns. The
  view lives in an inner `CalendarView`, so an invalid value unmounts it (view
  month/focus reset when a valid value returns). New helpers `isValidDate` /
  `isValidRange` in `dateUtils.ts` (internal, not exported from the barrel).
  Out-of-bounds warning text now says `value` instead of `selected`.
- consumer impact: a bad value no longer crashes the tree; the calendar simply
  is not shown, with a dev warning saying why.
- breaking: no (crash → render nothing).
- verified: see "Verification" below. Stories added:
  `Dates/Calendar` → "Invalid Single Day Value Renders Nothing",
  "Invalid Range Value Renders Nothing", "Unknown Mode Renders Nothing".
- docs owed: CHANGELOG → Fixed: "Calendar no longer crashes on an invalid
  `value` or unknown `mode`; it warns in development and renders nothing."

### DatePicker / trigger labels tolerate an invalid value [WI-128, D-12]
- files: `src/components/Calendar/dateFormat.ts`, `src/components/DatePicker/DatePickerSplitTrigger.tsx`, `DatePicker.stories.tsx`
- what changed: `formatSingleLabel` / `formatRangeLabel` return `""` for an
  invalid value, so `DatePickerTrigger` and `DatePickerSplitTrigger` show an
  empty label instead of throwing. The split trigger's active-preset lookup
  skips a value whose ends are not Dates. Opening the panel shows no calendar
  (Calendar renders nothing, above).
- consumer impact: an invalid value no longer crashes the DatePicker.
- breaking: no.
- verified: see "Verification" below. Story added: `Dates/DatePicker` → "Invalid Value Empty Label" (single-day and split range trigger).
- docs owed: CHANGELOG → Fixed, folded into the Calendar line above.

### Header contracts touched
- `src/components/VerificationCode/VerificationCodeInput.tsx` — `## behavior`: "Controlled via `value` + `onChange`" → "`onValueChange`".
- `src/components/Input/Input.tsx` — `## behavior`: "The icon variants require an `icon` element."; `## constraints`: "An icon variant without an `icon` element (null, false, "" included) throws. The props union is the real guard (`icon` is a `ReactElement`) …".
- Calendar, DatePicker, OutlineButton files carry no `## behavior` / `## constraints` header; the render-nothing rule is documented in the JSDoc on `hasValidValue` and the outer `Calendar` in `Calendar.tsx`. No new header added (rule 3).
- `CodeDigitInput.tsx` has a header but batch 02 did not change it (its diff is the motion batch).

### Verification
- `npm run lint` (tsc --noEmit): exit 0 (run after the final story edit).
- tsc probe in `.tmp-probe-A/` (own tsconfig extending the root; deleted after):
  - `good.tsx` — 0 errors: VerificationCodeInput `value`/`defaultValue`/`onValueChange`; DatePicker both modes `onValueChange`; Calendar both modes `value`/`onValueChange`; CalendarPresetItem `value`/`onValueChange`; DatePickerSplitTrigger `value`/`onValueChange`; OutlineButton `themeInverse`; Input iconText/iconNumber with `icon={<span />}`.
  - `bad.tsx` — 14/14 lines fail with TS2322: VerificationCodeInput `onChange`; DatePicker `onChange` ×2 modes; Calendar `selected`/`onSelect` ×2 modes; CalendarPresetItem `selected`/`onSelect`; DatePickerSplitTrigger `onSelect`; OutlineButton `inverseTheme`; Input iconText `icon={null}`, `icon={false}`, `icon=""`, no icon; Input iconNumber `icon={null}`, `icon={false}`.
- Scoreboard m9 (value callbacks not named `onValueChange`): 7 at `b436647` (Calendar.tsx 2, DatePicker.tsx 2, CalendarPresetsPanel.tsx 1, DatePickerSplitTrigger.tsx 1, VerificationCodeInput.tsx 1) → 0 now. No hits remain anywhere in `src/`. No other metric rose from batch 02 (it adds no classes, timers or `"use client"`).
- Not done here, per the brief: browser check and `npm run build`. The invalid-value stories are untested at runtime; their non-crash is by code reading (guard runs before any date maths; label formatters short-circuit).


<!-- merged from _work/changes/03-renames-color-internals.md -->
### 03 — Const renames, one colour lookup, public-surface cleanup (batch 03, agent B)

Status: done, with one item blocked on agent A's lane (Calendar barrel date helpers, see 4).

## Progress (write-to-disk-first)
- [x] 1. Renames FontAxes → FontAxis, ProgressIndicatorVariants → ProgressIndicatorVariant
- [x] 2. One colour lookup (resolveDsColor) on ProgressIndicator / LoadingSpinner / ShapeMorphSpinner / AIContextGauge
- [x] 3. ProgressIndicator NaN guard
- [~] 4. Public surface: barrels + src/index.ts; three CSS helpers — all done EXCEPT the Calendar barrel's four date helpers (blocked, see entry)
- [x] 5. Headers
- [x] verify

---

### Const renames: `FontAxes` → `FontAxis`, `ProgressIndicatorVariants` → `ProgressIndicatorVariant` [WI-129, D-14]
- files: `src/components/Text/constants.ts`, `Text/index.ts`, `Text/BaseText.tsx`
  (JSDoc example), `Text/BaseText.stories.tsx`;
  `src/components/ProgressIndicator/constants.ts`, `ProgressIndicator.tsx`,
  `ProgressIndicator.stories.tsx`; `src/components/AIChat/AIContextGauge.tsx`.
- what changed: each const now shares its type's name, matching the repo's
  `export const X = {...} as const; export type X = ...` convention. The
  `FontAxis` type already existed; the const joined it. `FontAxesValue` (the
  axis→value record type) and `TrackingValue` are unchanged.
- consumer impact: imports of the old const names stop compiling.
- breaking: yes — v6
  - `FontAxes` → `FontAxis` (const; `FontAxis.grade` etc. — keys unchanged)
  - `ProgressIndicatorVariants` → `ProgressIndicatorVariant` (const; `.flat`, `.wavy` unchanged)
- verified: `rg -n "FontAxes\b|ProgressIndicatorVariants\b" src` → nothing.
- docs owed: v6 migration skill rename table; README/skills examples using the old names.

### One colour-name lookup for every progress and loader component [WI-068, D-06]
- files: `src/utils/color.ts` (header only), `src/components/ProgressIndicator/ProgressIndicator.tsx`,
  `src/components/LoadingSpinner/LoadingSpinner.tsx` (colour lookup only — animation
  untouched), `src/components/ShapeMorphSpinner/ShapeMorphSpinner.tsx`,
  `src/components/LinearProgressIndicator/LinearProgressIndicator.tsx` (JSDoc only:
  `'brand'` was never a token → `'prominent'`), `src/components/AIChat/AIContextGauge.tsx` (header).
- what changed: the three private `COLOR_TOKENS` tables (ProgressIndicator,
  LoadingSpinner, ShapeMorphSpinner — each knew only `primary`/`prominent`) are
  deleted. All three now call `resolveDsColor(color, "var(--ui-color-primary)")`
  and type `color` as `DsColor`. AIContextGauge forwards `color` to
  ProgressIndicator, so it inherits the lookup. LinearProgressIndicator already
  used it. `LoadingSpinnerColor` (`primary`, `prominent`) is kept; both keys are
  `DS_COLOR_TOKENS` names, so they resolve to the same vars as before.
- consumer impact — colour behaviour change: every `DS_COLOR_TOKENS` name now
  works on every progress/loader `color` prop. Names other than
  `primary`/`prominent` (e.g. `"text-secondary"`, `"danger"`, `"text"`,
  `"border-primary"`) used to be passed through as the literal string, an
  invalid CSS colour, so the ring/spinner drew **nothing**; they now draw in the
  named token colour. `primary`, `prominent` and any raw CSS colour render
  exactly as before.
- breaking: no (types widened from `LoadingSpinnerColor | string` to `DsColor`,
  which is also `name | string`).
- verified: tsc probe (temp `src/__probe03__/`, deleted) type-checked
  `color="text-secondary"` and `color="danger"` on ProgressIndicator,
  LoadingSpinner, ShapeMorphSpinner, LinearProgressIndicator and AIContextGauge;
  `rg -n "COLOR_TOKENS" src` → only `DS_COLOR_TOKENS` in `utils/color.ts`.
- docs owed: loading-indicators skill / README colour prop wording ("DS colour
  name or CSS colour", not "preset alias").

### ProgressIndicator throws on `progress={NaN}` [WI-128 part]
- files: `src/components/ProgressIndicator/ProgressIndicator.tsx`;
  `src/components/AIChat/AIContextGauge.tsx` (header constraint wording).
- what changed: the range guard is now `!(progress >= 0 && progress <= 1)`, so
  NaN (e.g. `done / total` with `total` 0) throws the same error as other
  out-of-range values instead of drawing a full ring. The component JSDoc says
  "outside [0, 1] or NaN". AIContextGauge still maps `budget <= 0` to 0, so it
  never hands NaN down; its header now says ProgressIndicator would reject it.
- consumer impact: code that passed NaN now throws (was a silently wrong full ring).
- breaking: no (was a bug) — call it out in release notes.
- verified: lint exit 0; guard read by inspection.
- docs owed: none beyond release note.

### Public-surface cleanup: helpers and recipes no longer exported [WI-123, WI-125, D-15]
- files: `src/components/DatePicker/index.ts`, `src/components/Text/index.ts`,
  `src/components/Sticker/index.ts`, `src/components/Checkbox/index.ts`,
  `src/styles/dooph-component-tokens.css`, `src/styles/index.css`.
  `src/index.ts` unchanged (it `export *`s the folder barrels).
- what changed:
  - Removed from the package surface: `formatTriggerLabel` (DatePicker barrel),
    `serializeAxes` (Text barrel), `stickerVariants` (Sticker barrel),
    `checkboxVariants` (Checkbox barrel). They remain module-level exports of
    their own files for in-folder use.
  - Recipes kept public: `buttonVariants` and `tabTriggerVariants` (the brief /
    D-15 keep them — consumers compose them onto their own elements).
    `stickerVariants` and `checkboxVariants` went private because no other
    component imports them (`rg` shows uses only inside `Sticker.tsx` /
    `Checkbox.tsx`; DropdownMenu imports `Checkbox` itself, not the recipe).
  - Types kept public: `DateMatcher`, `TextStyleProps`.
  - CSS helpers deleted: `.ds-focus-ring` (bare; the `-on-focus`,
    `-danger-on-focus`, `-on-open` variants stay) from
    `dooph-component-tokens.css`, and the unused margin helper (`.ds-my-ui-xs`,
    which the spacing pass would have named `ds-my-ui-sm`) from `index.css`.
    `rg` finds no class use of either in `src/` (only explanatory comments
    mentioning `data-[state=open]:ds-focus-ring`).
  - `.ds-disabled-control` **stays**: still used by
    `AIChat/AIPromptInput.tsx:227` and `Toggle/toggleOption.ts:32`. It goes with
    WI-067 (disabled-helper consolidation), not here.
  - **Blocked — not done:** `isSameDay`, `startOfDay`, `formatRangeLabel`,
    `formatSingleLabel` are still exported from `src/components/Calendar/index.ts:21-22`
    and therefore from the package. `DatePicker/DatePickerTrigger.tsx:8-13` and
    `DatePicker/DatePickerSplitTrigger.tsx:15-22` import them through the
    `../Calendar` barrel, so removing those two lines breaks `tsc`. Those files
    are agent A's lane. Owed: switch those imports to `../Calendar/dateFormat`
    and `../Calendar/dateUtils` (keeping the barrel imports for `DatePickerMode`,
    `DEFAULT_SPLIT_TRIGGER_PRESETS`, types), then delete Calendar/index.ts lines
    20-22 (the comment + both export lines).
- consumer impact: imports of the removed names stop compiling; classes
  `ds-focus-ring` / `ds-my-ui-xs` stop styling (neither was documented).
- breaking: yes — v6. Removed exports:
  - `formatTriggerLabel`, `serializeAxes`, `stickerVariants`, `checkboxVariants`
    (no replacement — internal helpers/recipes);
  - after the blocked step lands: `isSameDay`, `startOfDay`, `formatRangeLabel`,
    `formatSingleLabel`;
  - CSS classes `ds-focus-ring` (use `ds-focus-ring-on-focus` / `-on-open`),
    `ds-my-ui-xs`.
- verified: tsc probe confirmed `serializeAxes`, `formatTriggerLabel`,
  `stickerVariants`, `checkboxVariants` are not importable from `src/index`
  (`@ts-expect-error` consumed); brief's rg for date/label helpers → only the
  two blocked Calendar lines.
- docs owed: v6 migration skill removed-export list; codebase skill helper list
  (drop `ds-focus-ring`, `ds-my-ui-*`).

### Verification (whole batch)
- `npm run lint` → exit 0.
- `rg -n "FontAxes|ProgressIndicatorVariants\b" src` → nothing.
- `rg` date/label helpers in barrels → `Calendar/index.ts:21-22` only (blocked, above).
- Scoreboard (after): motion 0 · arbitrary px 19 · numeric spacing 36 · raw var 5 ·
  focus rings 3 · disabled looks 2 · "use client" 40 · JS timers 8 ·
  callback names 0 · default exports 74. This batch adds to none of them
  (renames, imports and lookups only; the deletions can only lower counts).
- Not mine but seen in the barrels' diff: `Toast/index.ts` (`ToastTypes` →
  `ToastVariant`) and `Tooltip/index.ts` (`TooltipTypes` → `TooltipVariant`),
  and ProgressIndicator's `.ds-progress-arc` motion change — from other batches.



### Unblocked by the orchestrator after both agents finished (2026-10-03)
- `DatePickerTrigger.tsx` and `DatePickerSplitTrigger.tsx` now import
  `formatRangeLabel` / `formatSingleLabel` from `../Calendar/dateFormat` and
  `isSameDay` / `startOfDay` from `../Calendar/dateUtils`.
- The four helpers' re-export lines are deleted from
  `src/components/Calendar/index.ts`.
- `npm run lint` exits 0. `rg` finds none of `isSameDay`, `startOfDay`,
  `formatRangeLabel`, `formatSingleLabel`, `formatTriggerLabel`,
  `serializeAxes`, `stickerVariants`, `checkboxVariants` in `src/index.ts` or
  any folder barrel.
- breaking: yes — v6. These names are no longer importable from the package.
  They were never documented.


<!-- merged from _work/changes/04-use-client.md -->
### 04 — `"use client"`: prologue-aware stamping, directive only where needed (batch 04, agent C)

Status: done. One item left to the orchestrator (ShapeMorphSpinner / DropdownCaret, trigger 4 → WI-034).

## Progress (write-to-disk-first)
- [x] 0. Baseline scoreboard: m7 = 40
- [x] 1. WI-033: prologue reader in scripts/add-use-client.mjs
- [x] 2. WI-037: per-module trigger audit of all 40 directive modules (+ AIModelSelect)
- [x] 3. Apply directive removals / additions
- [x] 4. Headers mentioning the directive — none of the touched files' `## behavior`/`## constraints` blocks mention it; no header edits needed
- [x] 5. lint exit 0; scoreboard m7 40 → 28, nothing else moved
- [x] 6. Scratch worktree build + stamp check + RSC check; worktree removed

---
### The build now stamps every client module, even when a header comment comes first [WI-033, F-011]
- files: `scripts/add-use-client.mjs`
- what changed: the post-build stamper used to look for `"use client"` only in
  the first 5 lines of each source file, so any module whose header contract
  (R11.9 puts it first) pushed the directive lower shipped unstamped — 16 of 40
  at HEAD. It now reads the module's directive prologue the way a JS parser does
  (skips BOM, whitespace, `//` and `/* */` comments, collects leading string
  statements). A `"use client"` line that sits anywhere outside the prologue
  (e.g. below an import) now fails the build with the file named, instead of
  being silently ignored. The script's top comment states the new rule.
- consumer impact: every module that keeps the directive is now a real client
  boundary in dist. Before this, RSC consumers hit `createContext is not a
  function` on the root import. No effect on Vite/non-RSC consumers.
- breaking: no
- verified: parser unit cases (header-then-directive, BOM, `'use strict'` first,
  directive after an import → not detected, directive inside a comment → not
  detected) all pass; guard regex detects a misplaced directive line and ignores
  `const s = "use client"`. `prologue-scan.mjs` at HEAD: 40 lines / 24 old / 40 new.
  Build checks: see the verification section below.
- docs owed: none for this script beyond what WI-037's rule text covers (codebase
  SKILL.md:627-636 and README.md:30-48 become true as written).

### `"use client"` only where a module truly needs it [WI-037, D-05 (a) strict, F-027, F-012]
Rule applied (the maintainer's four triggers): the module itself (1) calls a
client-only React hook (useState/useEffect/useLayoutEffect/useRef/useReducer/
useContext/createContext/… or a custom hook built on them), (2) touches a browser
API (window/document/navigator/timers/rAF/observers/getComputedStyle), (3) creates
an event-handler closure on a host element, or (4) creates a function and passes
it to a client component. `forwardRef`, `useId`, `useMemo`, `useCallback`, and
passing a consumer's own prop through unchanged do not count. Each of the 40
directive modules plus every neutral module was checked (scripted survey for
hooks / browser globals / `on*={() =>` / `on*={localFn}` / function-valued JSX
props, then read by hand).

**Lost the directive (13) — no trigger applies:**
| module | why neutral |
|---|---|
| `Button/Button.tsx` | forwardRef + cva + Radix Slot; no hooks, no closures |
| `Checkbox/Checkbox.tsx` | forwardRef around Radix Checkbox (Radix carries its own boundary) |
| `ShapeButton/ShapeButton.tsx` | forwardRef + Slot; renders neutral Shapes directly |
| `VerificationCode/CodeDigitInput.tsx` | forwardRef `<input>`; `onFocus`/`onBlur` are the consumer's props passed through |
| `Modal/Modal.tsx` | forwardRef wrappers around Radix Dialog parts |
| `Popover/Popover.tsx` | forwardRef wrapper around Radix Popover parts |
| `Sheet/Sheet.tsx` | forwardRef wrappers around Radix Dialog parts |
| `Tooltip/Tooltip.tsx` | wrappers around Radix Tooltip parts |
| `Tabs/Tabs.tsx` | forwardRef wrappers around Radix Tabs parts |
| `SearchBox/SearchBox.tsx` | forwardRef `<input>` + HotkeyIndicator; no handlers created |
| `SplitButton/SplitButton.tsx` | forwardRef `<button>`s; props spread through |
| `LinearProgressIndicator/LinearProgressIndicator.tsx` | forwardRef around Radix Progress; value maths only (directive was on line 1 above the header — header is now first) |
| `DatePicker/DatePickerTrigger.tsx` | forwardRef around (client) DropdownTrigger; no function props created |

**Gained the directive (1):**
| module | trigger |
|---|---|
| `AIChat/AIModelSelect.tsx` | (4) `AIThinkingEffortSelector` creates `onValueChange={([next]) => …}` and passes it to client `SliderLabeled`. Inserted below the header contract (R11.9), which only the WI-033 prologue reader honours. |

**Kept the directive (27) — trigger per module:**
- (1) hooks: `AIChat/AIPromptInput` (createContext/useState/useRef/useLayoutEffect), `AIChat/AIThinkingPart` (useState), `AnimatedText/FadeChangeText`, `AnimatedText/RollChangeText` (useChangeSwap), `AnimatedText/RevealChangeText` (useState/useRef/useEffect + ResizeObserver), `AnimatedText/RollingDigitsText` (useState), `AnimatedText/useChangeSwap.ts` (useState/useRef/useEffect), `Calendar/Calendar` (useState/useRef/useEffect), `CopyButton/CopyButton` (+ navigator.clipboard, setTimeout), `DatePicker/DatePicker` (useState), `DropdownTrigger/DropdownTrigger` (useRef), `Input/Input` (useRef/useState), `LoadingSpinner/LoadingSpinner` (useRef/useEffect + rAF), `Menu/DropdownMenu` (createContext/useContext + document), `MorphRotationShape/MorphRotationShape` (useState/useRef/useLayoutEffect + rAF), `OutlineButton/OutlineButton` (useRef), `SegmentedTabSelect/SegmentedTabSelect` (createContext/useContext), `SidebarWithHoverIcon/SidebarWithHoverIcon` (useRef/useLayoutEffect + rAF), `Slider/Slider` (useState), `Toast/Toast` (createContext/useState + setTimeout), `Toggle/Toggle` (createContext/useState), `VerificationCode/VerificationCodeInput` (useState/useRef).
- (3) closure on a host element: `Calendar/CalendarCaption` (`onClick={() => onMonthChange(…)}`), `Calendar/CalendarGrid` (`onClick={() => onDayClick(date)}`), `Calendar/CalendarPresetsPanel` (`onClick={(event) => …}`), `Menu/DropdownMenuSearch` (`onKeyDown={handleKeyDown}`, a local closure).
- (4) closure to a client component: `DatePicker/DatePickerSplitTrigger` (`onValueChange={handlePresetChange}` on the client SegmentedTabSelect).

**Trigger (4) applies but NOT added — left to WI-034 (not this lane):**
`ShapeMorphSpinner/ShapeMorphSpinner.tsx` and `DropdownCaret/DropdownCaret.tsx`
pass shape *components* (functions) to the client `MorphRotationShape`, so a
Server Component rendering either fails at Flight serialisation. WI-034's
planned fix passes serialisable `Shapes` keys instead, which removes the trigger
without a directive; adding the directive now would be a stopgap WI-034 undoes.
Orchestrator/maintainer: pick one (WI-034, or a directive on both now).

- consumer impact: in React Server Components, the 13 wrappers render on the
  server (their Radix internals stay client); `buttonVariants`, `checkboxVariants`,
  `tabTriggerVariants` and `formatTriggerLabel` can be called from server code;
  `AIThinkingEffortSelector` (and the rest of AIModelSelect's parts) are now a
  client boundary. Vite/non-RSC consumers: no change.
- breaking: no
- docs owed: rule text in `.agents/skills/dooph-ds-contribution/SKILL.md:71` and
  `.agents/skills/dooph-ds-codebase/SKILL.md:619-636` (the four triggers + the
  "Current split" list above); CHANGELOG `[Unreleased] → Fixed` line from WI-037
  step 6. Stale mid-file comments that remain *true* (e.g. Button.tsx:108
  "constants … kept server-safe (no "use client")") left untouched — outside lane.

### Verification (both items)
- `npm run lint` → exit 0.
- Scoreboard: m7 `"use client" files` **40 → 28**; no other metric moved.
- Scratch worktree `../ds-wi-agentC` (removed afterwards; `git worktree list` shows only main):
  - **before** (HEAD b436647 as-is, `npm ci && npm run build`): build log
    `stamped "use client" on 48 output chunk(s) from 24 client source module(s)`;
    `dist-stamp-check.mjs` → ESM 24/40, CJS 24/40, 16 unstamped, `FAIL`;
    `rsc-root.mjs` → `root import FAIL TypeError: createContext is not a function`.
  - **after** (main's working tree `src/` + `scripts/` copied in, so batches 01–03
    are included): build log `stamped "use client" on 56 output chunk(s) from 28
    client source module(s)`; `dist-stamp-check.mjs` → ESM 28/28, CJS 28/28,
    unstamped 0, `PASS`; inverse check (scratchpad script: every stamped dist file's
    bundled `src/` modules all carry the directive) → 84 stamped dist files
    (56 chunks), 0 containing a neutral module, `PASS`; `prologue-scan.mjs` → 28 / 28;
    `rsc-root.mjs` → `root import OK; exports: 318`; `rsc-boundaries.mjs` →
    `ALL PASS` (13 wrappers neutral; AIThinkingEffortSelector, AIModelSelectTrigger,
    Calendar/DatePicker closure parts, Input, ToggleSwitch client references;
    `tabTriggerVariants()` and `buttonVariants()` return strings;
    `checkboxVariants`/`formatTriggerLabel` SKIP — no longer root-exported after batch 03).
  - Guard: `import "x";` inserted above the directive in the worktree's Input.tsx →
    `node scripts/add-use-client.mjs` throws naming `src/components/Input/Input.tsx`.
    Reverted. Worktree `src/`/`scripts/` identical to main after the build (no generated drift).
  - Windows note for re-running the RSC probes: pass `--import` as a `file:///C:/…`
    URL; a bare `C:/…` path fails with `ERR_UNSUPPORTED_ESM_URL_SCHEME`.
- Not done: Storybook interaction pass (Tooltip/Modal/Sheet/Popover/Tabs/Checkbox/
  Button/DatePicker). The directive has no effect outside an RSC bundler, so
  Storybook (Vite) behaviour cannot change; left for the maintainer's routine check.


<!-- merged from _work/changes/05a-button-sizes.md -->
### 05a — Button `medium` and `big` sizes (batch 05, agent 05a)

## Progress (write-to-disk-first)
- [x] 0. Baseline scoreboard (m3 Tailwind numeric spacing 36, Button.tsx 6; m2 arbitrary 19; m4 raw var 5)
- [x] 1. Tokens: `--ui-spacing-button-medium-x` 22px, `--ui-spacing-button-big-x` 32px (tokens.css) + EXCLUDED (sync-theme.mjs) + sync-tokens
- [x] 2. Helpers `ds-px-button-medium` / `ds-px-button-big` (dooph-component-tokens.css)
- [x] 3. `text-style-hero-button` registered in cn's text-style group (cn.ts)
- [x] 4. `ButtonSize.medium` / `ButtonSize.big` (constants.ts) + cva sizes + type restriction (Button.tsx) + header
- [x] 5. Stories
- [x] 6. lint + scoreboard after

---
### Button gets `medium` (46px) and `big` (54px) pill sizes [figma 01-button, node 5:369]
- files:
  - `src/components/Button/constants.ts`: `ButtonSize.big` = `"big"`, `ButtonSize.medium` = `"medium"`, with JSDoc.
  - `src/components/Button/Button.tsx`: two new cva sizes; the base radius moved into each size; a type restriction on the props; the header contract updated (one behaviour bullet, two constraints).
  - `src/components/Button/Button.stories.tsx`: new `Medium` and `Big` stories and a `PillSizes` story (both pill sizes × prominent/primary/secondary, at rest and disabled, icon + label). `AllSizes` now shows big and medium, and its "Default" label reads "Standard".
  - `src/styles/tokens.css`: `--ui-spacing-button-medium-x: 22px` and `--ui-spacing-button-big-x: 32px`, next to the button heights.
  - `scripts/sync-theme.mjs`: both tokens added to `EXCLUDED` (raw-var only, so no Tailwind theme key). `npm run sync-tokens` run; it emitted no new theme key.
  - `src/styles/dooph-component-tokens.css`: the `.ds-px-button-medium` / `.ds-px-button-big` helpers (padding-inline from the tokens above).
  - `src/utils/cn.ts`: `text-style-hero-button` registered in the `text-style` merge group.
- what changed:
  - `medium` = `h-button-medium ds-px-button-medium rounded-full text-style-hero-button`.
  - `big` = `h-button-big ds-px-button-big rounded-full text-style-hero-button`.
  - Big prominent is 54px like the others (Figma's 52 is a mistake, per the maintainer). Labels use the hero button text role (16px, button weight and axes; `wdth` stays 100). Each variant keeps the shadow it has at standard size.
  - `rounded-tight` moved from the cva base into every existing size. tailwind-merge does not treat `rounded-tight` and `rounded-full` as one group, so a base radius would have survived next to the pill radius. The existing sizes render exactly the same classes, only in a different order.
  - **Type-level restriction (chosen over a dev warning):** the props are now a union. Prominent, primary, secondary or an omitted variant (which defaults to secondary) accept every size. Danger, ghost and text accept every size except `medium` and `big`. So `<Button variant="danger" size="big">` fails to compile, and so does a `variant` typed as the whole `ButtonVariant` union combined with a pill size. There is no `any`, and the polymorphic `Button<"a">` / `asChild` typing is unchanged. `buttonVariants()` itself, the raw cva function, is not restricted.
  - cn registration: without it, tailwind-merge treats `text-style-hero-button` as a text colour. It then strips the variant's `text-prominent-fg` / `text-primary-fg` / `text-secondary-fg`, and pill labels lose their colour. Checked with tailwind-merge directly: before, the merged class string had no `text-prominent-fg`; after, it keeps `text-prominent-fg` and drops the base `text-style-button` in favour of the hero role. The fix also helps the `Text` component, which can apply `text-style-hero-button`.
- consumer impact: `<Button size={ButtonSize.medium | ButtonSize.big}>` is available for prominent, primary and secondary. Existing sizes look the same. Code that passes a `variant` typed as the whole `ButtonVariant` union together with a size typed as the whole `ButtonSize` union (which now includes the pill sizes) gets a type error and must narrow one of the two.
- breaking: no. Every new option is additive; no existing prop, value or token changes meaning.
- verified:
  - `npm run lint` (tsc) exit 0.
  - A throwaway tsc project (since deleted) proved the type rules with `@ts-expect-error`. Allowed: pills on prominent, primary, secondary and an omitted variant; danger/ghost at small sizes; the whole `ButtonVariant` union at non-pill sizes; `Button<"a"> asChild`. Rejected: danger+big, ghost+medium, text+big, and the whole union + big.
  - Scoreboard before → after: nothing went up. Arbitrary values went 19 → 18 from another agent's change; Button.tsx's numeric spacing stays 6 (the existing `gap-2`/`px-3`/`p-0`, unchanged).
  - Not checked in Storybook (the brief said not to run it).
- docs owed:
  - CHANGELOG `[Unreleased]` → Added: "`ButtonSize.medium` (46px) and `ButtonSize.big` (54px): pill buttons with the 16px hero button label, for the prominent, primary and secondary variants. Danger, ghost and text don't support them, and the types reject that combination."
  - Usage skill (Button section): list the two sizes and the variant restriction. Say there is no icon-only pill.
  - token-contract.md: `--ui-spacing-button-medium-x` (22px) and `--ui-spacing-button-big-x` (32px), raw-var-only, read by `ds-px-button-medium` / `ds-px-button-big`.
  - Architecture/codebase skill: `text-style-hero-button` is in cn's `text-style` group (any new `text-style-*` class must be registered there too; `text-style-hero-body` is still NOT registered and has the same latent colour-stripping bug).


<!-- merged from _work/changes/05b-hero-cta.md -->
### 05b — Hero CTA: fixed shapes (change record)

Checklist
- [x] Register `EightLeafCloverShape` (barrel, `Shapes` const, `shapePaths.ts`, Shapes stories)
- [x] CTA tokens (icon, shape and gap per size; label weight); helpers; sync-theme EXCLUDED; `npm run sync-tokens`
- [x] `text-style-cta` class + `cn` text-style group
- [x] CTAButton: fixed shape per size, paints, icon size, hug layout, label role, header contract
- [x] Stories
- [x] lint + scoreboard

## Hero CTA end mark becomes a fixed shape; new CTA label style

**Files**
- `src/components/CTAButton/CTAButton.tsx`, `CTAButton.stories.tsx`
- `src/components/Shapes/EightLeafCloverShape.tsx`, `BaseShape.tsx`, `index.ts`, `shapePaths.ts`, `Shapes.stories.tsx`
- `src/styles/tokens.css` (CTA section + one weight token), `src/styles/index.css` (`.text-style-cta`; generated block via sync-tokens), `src/styles/theme.css` (generated)
- `src/styles/dooph-component-tokens.css` (CTA helper section only)
- `scripts/sync-theme.mjs` (EXCLUDED list, CTA + weight entries only)
- `src/utils/cn.ts` (text-style group)

**What changed**
- The round end chip is replaced by a FIXED shape per size: the eight-leaf clover at `standard`
  (46px, fills its 46px frame) and the puff at `big` (50px, centred in its 60px frame). Static on
  hover; only the label rolls, as before. The shape is the `Shapes/` primitive, not a copy.
- Paints: primary CTA's shape uses the secondary-button bg (`text-secondary` → `--ui-color-secondary`);
  secondary CTA's shape uses the primary-button bg (`--ui-color-primary`). The icon now takes the
  matching content colour (`secondary-fg` / `primary-fg`); before, it inherited whatever colour the
  page gave the link.
- Icon slot: 22px standard / 26px big (`--ui-size-cta-icon-standard` / `-big`, helpers
  `.ds-size-cta-icon-standard` / `-big`), replacing the single 20px `--ui-size-cta-icon`.
- Layout: both sizes use 16px pill padding (`p-lg`; big was 12) and a 60px label → mark gap (new
  `--ui-spacing-cta-content-standard` 60px + `.ds-gap-cta-content-standard`; standard was 42px
  `gap-xxxl`). Content min-widths (330 / 350) kept. The big pill's 370px min-width is dropped —
  the pill now hugs.
- Label: new `.text-style-cta` (components layer) — the button role's family, axes and optical
  sizing at `--ui-weight-cta` (new, = semibold 600), sized `--ui-text-cta-standard` (24px). The big
  CTA sets 28px (`--ui-text-cta-big`) through BaseText's `fontSize` prop. Was ButtonText at medium
  (500). Registered in `cn`'s text-style group.
- `EightLeafCloverShape` registered: barrel export, `Shapes.eightLeafClover`, `shapePaths.ts`
  (so MorphRotationShape accepts it), Shapes stories. Its `EIGHT_LEAF_CLOVER_SHAPE_PATH` constant
  held the FOUR-leaf clover outline (same string as `CLOVER_SHAPE_PATH`) while the JSX drew the
  eight-leaf path inline; the constant now holds the drawn eight-leaf path and the JSX uses it. The
  rendered geometry is unchanged byte for byte. Note the path overshoots the 24 box (≈ −1.08…25.08),
  as Figma's does; the SVG's default overflow clip trims the leaf tips exactly as Figma's clipPath.
- `ShapeProps.size` widened `number` → `number | string` (BaseIcon already takes CSS lengths), so
  shapes can be sized from a token.
- CTAButton gained a header contract: the shape is fixed per size and static, by maintainer
  decision; shapes are the `Shapes/` primitives.

**Consumer impact**
- CTAs look different (by design): shape end mark, bigger icon, semibold label, wider standard gap,
  big pill padding 12 → 16. An `icon` sized for the old 20px slot now sits in a 22/26px slot; pass
  `size="100%"` (as the stories do) to fill it.
- New exports: `EightLeafCloverShape`, `EIGHT_LEAF_CLOVER_SHAPE_PATH`, `Shapes.eightLeafClover`.

**Breaking:** yes — v6 (removed tokens/helpers):
- `--ui-size-cta-icon` (20px) → `--ui-size-cta-icon-standard` (22px) / `--ui-size-cta-icon-big` (26px)
- `.ds-size-cta-icon` → `.ds-size-cta-icon-standard` / `.ds-size-cta-icon-big`
- `--ui-min-w-cta-pill-big` (370px) → removed, no replacement (the pill hugs)
- `.ds-min-w-cta-pill-big` → removed, no replacement
- New, non-breaking: `--ui-size-cta-shape-standard` (= chip-standard) / `--ui-size-cta-shape-big` (50px),
  `--ui-spacing-cta-content-standard` (60px), `--ui-weight-cta`, `.text-style-cta`,
  `.ds-gap-cta-content-standard`.

**Verified**
- `npm run lint` (tsc --noEmit) exit 0.
- `npm run sync-tokens` run; no new Tailwind theme keys from the new tokens.
- Scoreboard: no metric rose (before m2 19 / m8 8 → after m2 18 / m8 6; those drops are other agents').
- Not visually verified (Storybook not run, per brief).

**Judgment calls for the maintainer**
- Kept the content min-widths (Figma's chosen "hug" frame also has min-w 330). Code's big
  min-width is 350, Figma's is 330 — left at 350, not in this brief.
- `.text-style-cta` is a CSS class only; there is no `TextVariant.cta` / `CTAText` (Text/** was out
  of lane). CTAButton renders `<BaseText unstyled className="text-style-cta">`.

**Docs owed**
- CHANGELOG (v6 token removals above; new shape export; CTA look change).
- Skills/token docs listing text styles (`text-style-cta`) and CTA tokens; shapes list (eight-leaf clover).


<!-- merged from _work/changes/05c-spinner.md -->
### 05c — LoadingSpinner: CSS-driven rebuild + `star` variant (batch 05, agent c)

Status: done.

## Progress (write-to-disk-first)
- [x] 0. Baseline scoreboard: m1 0 · m7 ("use client") 28 · m8 (JS timers) 8, LoadingSpinner.tsx 2
- [x] 1. Tokens: `--ui-spinner-duration`, `--ui-spinner-spokes-duration` in tokens.css (+ sync-tokens; no theme key — the name maps to nothing, so sync-theme needed no EXCLUDED entry)
- [x] 2. CSS helpers + `@property --ds-spinner-phase` + reduce rules in index.css
- [x] 3. spinnerGeometry.ts: drop JS durations, add spin-scale / star-fit geometry
- [x] 4. LoadingSpinner.tsx rebuild (no rAF, no hooks, no "use client") + `star`
- [x] 5. constants.ts `LoadingSpinnerVariant.star`; stories
- [x] 6. lint exit 0; scoreboard after: m8 8 → 6, m7 −1 from this change (see verified)

---
### The loading spinner now animates in CSS, on two spinner tokens, and holds still under reduced motion [WI-050, F-034]
- files: `src/components/LoadingSpinner/LoadingSpinner.tsx`,
  `src/components/LoadingSpinner/spinnerGeometry.ts`,
  `src/components/LoadingSpinner/constants.ts` (flat JSDoc only),
  `src/styles/tokens.css` (two tokens), `src/styles/index.css`
  (`@property --ds-spinner-phase`, `.ds-spinner-*` helpers, `ds-spinner-phase` keyframes,
  the keyframes comment).
- what changed:
  - The flat spinner used to run an endless `requestAnimationFrame` loop that
    rewrote both arc paths every frame, with its cycle (1800ms) and cosine easing
    in JS, and no reduced-motion path. It is now pure CSS on the Rule 6 escape
    hatch MorphRotationShape uses: one registered number, `--ds-spinner-phase`,
    runs 0 → 1 per `--ui-spinner-duration` on `--ui-motion-ease-linear`. The
    arc's length is computed from it in CSS with the SAME cosine
    (`min + (max − min) × (1 − cos(phase turn)) / 2`, via CSS `cos()`), and the
    arc group turns `phase × 2turn`, so length and turn cannot drift apart.
    Both arcs are dashes on one open circle path that starts half a gap past
    12 o'clock (inside the head gap, which never moves in the turning frame), so
    neither dash ever crosses the path's seam — the round-cap flash the rAF
    version was built to avoid stays avoided. Checked numerically: at all four
    sizes and 200 phases, every arc end matches the old JS arc ends to ~1e-15 rad
    and both dashes stay strictly inside the path.
  - Spokes: its turn was an inline-style `animation` with a JS-computed duration
    (1280ms × √(diameter/22), rounded). It is now the `.ds-spinner-spin` helper:
    `--ui-spinner-spokes-duration × --ds-spinner-time-scale`, where the factor
    (still √(diameter/22)) is geometry passed as a number. The turn moved from the
    root `<svg>` to an inner `<g>` (same centre), so a consumer's own `transform`
    on the root no longer fights the animation.
  - New tokens: `--ui-spinner-duration: 1800ms`, `--ui-spinner-spokes-duration: 1280ms`
    (loop cycle times, off the scale like `--ui-shimmer-duration`).
    Removed internal JS constants `SPINNER_ANIM_DURATION`, `SPINNER_SPOKES_DURATION`
    and the `spokesDuration` geometry field (replaced by `spinTimeScale` and
    `SPINNER_SPIN_EXPONENT`). None was public (spinnerGeometry is not exported
    from `src/index.ts`; the package exports only `.`).
  - Reduced motion (new): flat holds a static frame at mid-cycle (longest arc,
    72% of a turn, head at 12 o'clock, track filling the rest); spokes stop
    turning. The rule lives in the helper, as loops' reduce rules do.
  - Colours now go on via `style` (`stroke: …`) instead of the `stroke`
    presentation attribute, so `var(--ui-*)` colours never depend on a browser
    resolving `var()` inside an SVG attribute. Still through `resolveDsColor`.
  - `"use client"` removed: no hook, timer or listener remains (batch 04 policy).
    A header contract was added (the seam rule and the "track never reaches zero
    length" rule are invariants a reasonable edit would break).
- what should look the SAME (orchestrator visual check):
  - flat, every size and colour: arc shape, stroke widths, round caps, the
    one-stroke-width gaps at both ends, the grey track, the grow/shrink rhythm,
    two head turns per cycle, cycle length. Compare `Default`, `AllSizes`,
    `Colors`, `AllVariantsAndColors` against the previous build frame-for-frame
    in feel; the maths is identical.
  - spokes: identical look and speed per size.
- what DIFFERS:
  - flat now paints on the server-rendered/first frame (before: empty paths
    until the first rAF tick after hydration).
  - spokes turn durations are no longer rounded to whole ms (sm 1091.6 vs 1092,
    md 1543.9 vs 1544) — invisible.
  - under `prefers-reduced-motion: reduce`, flat is a still three-quarter ring and
    spokes are still (before: both kept spinning).
  - needs CSS `cos()` and `@property` (same baseline MorphRotationShape already
    requires). Without the DS stylesheet the flat variant draws two full
    overlapping rings instead of arcs.
- consumer impact: none at the API. Retuning speed is now a token override
  (`--ui-spinner-duration`, `--ui-spinner-spokes-duration`).
- breaking: no
- verified: `npm run lint` exit 0. Scoreboard m8 (JS timers) 8 → 6
  (LoadingSpinner.tsx's two rAF uses gone; 0 left there). m7 ("use client") reads
  28 → 28 overall: LoadingSpinner.tsx −1, while agent 05e's new
  `Toggle/FancyToggleSwitch.tsx` +1 landed at the same time. m1 stays 0 (no `Nms`
  literal outside tokens.css). Numeric equivalence check of the dash model vs
  the old JS arcs (script run in scratch, all sizes). No Storybook/build run, per
  brief.
- docs owed:
  - `.agents/skills/dooph-ds-loading-indicators/SKILL.md`: rewrite "LoadingSpinner —
    Animation Architecture" (rAF model → CSS phase model), the component-map row
    and enum list (add `star`), "LoadingSpinner is the only one … client module"
    (no longer), the CSS Notes ("ds-spinner-rotate is the only keyframe"; now
    also `ds-spinner-phase`), and the anti-patterns that forbid CSS animation on
    the flat spinner and require `cancelAnimationFrame`. Keep the `<circle>` seam
    anti-pattern (still true).
  - architecture Rule 6: name LoadingSpinner beside MorphRotationShape as a CSS
    escape-hatch user (WI-050's rule-text step).
  - shipped usage skill + CHANGELOG: `LoadingSpinnerVariant.star`, the two new
    tokens, reduced-motion behaviour.
  - REMEDIATION: WI-050 can move to `review` (not edited here; outside this lane).

### New `LoadingSpinnerVariant.star` — a spinning star [Figma 907:2182, maintainer answers]
- files: `src/components/LoadingSpinner/constants.ts`, `LoadingSpinner.tsx`,
  `spinnerGeometry.ts`, `LoadingSpinner.stories.tsx`.
- what changed: a third variant renders `STAR_SHAPE_PATH` (reused from
  `Shapes/StarShape`, not a copy of Figma's 18-unit path), filled with `color`
  through `resolveDsColor`, turning at a constant linear rate on the same
  `.ds-spinner-spin` helper and per-size factor as spokes. All four sizes.
  Static under reduced motion.
  - Fit: the star's bounds are scaled to `ACTIVE_INDICATOR_SCALE` (38/48) of the
    box — imported from `MorphRotationShape/geometry`, the ratio ShapeMorphSpinner
    draws its shapes at, so the two cannot drift. The star's farthest points
    from its centre are its tips, which also set its bounds (checked: max
    radius 10.4968 = half-extent 10.4968), so no extra rotation-safe reduction
    is needed and the turn stays inside the box. Star size per box: sm 12.7px,
    rg 17.4px, md 25.3px, xl 31.7px (79% of the box; Figma's single 24 frame
    showed 18/24 = 75% — the maintainer chose the shape-morph ratio instead).
- open, for the maintainer:
  - turn speed: the star uses the spokes' rate (`--ui-spinner-spokes-duration`
    scaled per size), because no speed was given. If it should differ, add a
    `--ui-spinner-star-duration` token.
  - colour default is `LoadingSpinnerColor.primary` (`--ui-color-primary`,
    #171717) like the other variants; Figma bound `text-primary` (#161616).
- stories: `Star`, `AllSizesStar`, `StarStaysInBox` (each size inside a 1px
  border drawn on its box — the turning star must never touch it), and a `star`
  row in `AllVariantsAndColors` with primary, prominent and an arbitrary
  `color="#e05252"` override.
- breaking: no (new option).
- verified: lint exit 0; geometry check above.
- docs owed: loading-indicators skill (variant + fit rule), shipped usage skill,
  CHANGELOG.


<!-- merged from _work/changes/05d-slider-step.md -->
### 05d — Slider: tall highlighted step (brief 05, agent 05d)

## Progress (write-to-disk-first)
- [x] 0. Baseline scoreboard: arbitrary px 19, numeric spacing 36, raw var in className 5, use client 28, JS timers 8
- [x] 1. Tokens: step dot size + tall height in tokens.css; `npm run sync-tokens` (neither becomes a theme key)
- [x] 2. Helper: `.ds-slider-dot` owns geometry + animated height; `[data-highlighted]` tall
- [x] 3. Slider.tsx: `highlightedStep` prop, types, dot markup; `SliderSteppedProps` exported
- [x] 4. Stories
- [x] 5. lint exit 0; scoreboard arbitrary px 19 → 18, nothing else moved

---
### A stepped slider can draw one step tall, chosen by the new `highlightedStep` prop [Figma "Slider Step" 577:962, figma-additions item 4]
- files:
  - `src/components/Slider/Slider.tsx`
  - `src/components/Slider/index.ts`
  - `src/components/Slider/Slider.stories.tsx`
  - `src/styles/tokens.css` (two slider step tokens)
  - `src/styles/dooph-component-tokens.css` (`.ds-slider-dot` helper)
  - `src/styles/index.css` / `src/styles/theme.css` regenerated by `npm run sync-tokens`. My tokens add nothing to them: `--ui-size-*` / `--ui-height-*` don't map to theme keys.
- what changed:
  - New optional, controlled prop `highlightedStep?: number` on `SliderStepped` and `SliderLabeled`. It is a step index counted from the step at `min` (0). Default: none, so every existing slider looks the same.
  - The chosen step keeps the dot's 6px width and paint and is drawn 10px tall, as a capsule centred on the same point. It works on both sides of the handle and in every variant, including `custom`. Paints are unchanged: active and inactive colours come from the same `data-active` rule.
  - The height change animates on the motion scale: `base` duration, `standard` curve. Reduced motion comes from the global rule in tokens.css. Only `height` transitions; the dot's colour flip stays discrete, as the existing step-dot comment intends (that comment now names the exception).
  - An index with no step (out of range, not an integer) highlights nothing; nothing throws.
  - New tokens: `--ui-size-slider-step: 6px` (the dot, which was the literal `size-[6px]`) and `--ui-height-slider-step-tall: 10px`. `.ds-slider-dot` now owns the dot's width and height, and `.ds-slider-dot[data-highlighted]` sets the tall height.
  - New exported type `SliderSteppedProps` = `SliderProps` + `highlightedStep`. `SliderContinuous` still takes `SliderProps`, so passing `highlightedStep` to it fails to compile; it has no dots. `SliderLabeledProps` gains `highlightedStep`, which is drawn only when `stepped`.
  - Stories:
    - "Highlighted step": primary, prominent and custom, each with the tall step on the filled side and on the unfilled side, plus a labeled stepped slider.
    - "Highlighted step (marks the previous value)": the consumer pattern the maintainer described. The tall step marks the last committed value while a drag or key press is in progress, and buttons move it directly so the animation can be seen on its own.
- consumer impact: none unless the prop is used. Overriding `--ui-size-slider-step` now resizes the step dots, which were a hard-coded 6px before.
- breaking: no
- verified:
  - `npm run lint` (tsc) exits 0.
  - Scoreboard: arbitrary px/rem in classNames 19 → 18 (the `size-[6px]` literal is gone). No other metric moved.
  - `grep slider-step` in `theme.css` / `index.css` finds nothing, so neither token became a theme key.
  - Not checked in a browser (Storybook not run, per the brief).
- decisions / open points (choices I made where the spec and answers were silent):
  - Index, not value. The maintainer's default answer named it a step index (`highlightedStep?: number`). One step at a time; no array form.
  - When the handle sits on the tall step, the 42px handle covers it, exactly as it covers a normal dot today. Spec open question 6 wasn't answered; nothing was offset.
  - The height animates on a plain CSS transition, so the first render never animates; only changes do.
  - The mark is `aria-hidden` like every dot. Its JSDoc tells consumers to state its meaning in text if it carries any.
- docs owed:
  - Slider docs/skill: the `highlightedStep` prop, the `SliderSteppedProps` type, and the two new tokens `--ui-size-slider-step` and `--ui-height-slider-step-tall`.
  - CHANGELOG: a minor-version feature entry.


<!-- merged from _work/changes/05e-fancy-toggle.md -->
### 05e — FancyToggleSwitch + FancyToggleSwitchItem (brief 05, agent 05e)

## Progress (write-to-disk-first)
- [x] 0. Read rules, brief, figma-additions answers, specs 05/06, motion scale, Toggle folder + contracts
- [x] 1. Baseline scoreboard (m7 "use client" = 28)
- [x] 2. `FancyToggleSelectType` const (appended to `Toggle/constants.ts`)
- [x] 3. `fancyToggleOption.ts` (neutral cva: option + indicator, header contract)
- [x] 4. `FancyToggleSwitch.tsx` (root + item, header contract)
- [x] 5. Barrel exports (`Toggle/index.ts`; `src/index.ts` already does `export * from './components/Toggle'`, so no edit)
- [x] 6. Stories (`FancyToggleSwitch.stories.tsx`)
- [x] 7. lint + scoreboard after

---

### New `FancyToggleSwitch` + `FancyToggleSwitchItem`: the Figma "Fancy" toggle row [Figma 826:2149 / 826:1723]
- files:
  - NEW `src/components/Toggle/FancyToggleSwitch.tsx` (root + item, `"use client"`, header contract)
  - NEW `src/components/Toggle/fancyToggleOption.ts` (neutral cva for the option, the indicator slot, the indicator and the check; header contract)
  - NEW `src/components/Toggle/FancyToggleSwitch.stories.tsx` (`Inputs/FancyToggleSwitch`)
  - `src/components/Toggle/constants.ts` (appended `FancyToggleSelectType`)
  - `src/components/Toggle/index.ts` (exports)
  - NOT touched: `Toggle.tsx`, `toggleOption.ts`, `tokens.css`, `src/index.ts`.
- what changed:
  - A dedicated row of 54px pill options (`h-button-big`, shared with Button big), 12px apart (`gap-md`). Labels use `text-style-hero-button` (16px), `text-text` in every state, 16px right padding (`pr-lg`).
  - Each option has a 2px border (hardcoded `border-2`, by maintainer decision): grey `secondary-border` (#e2e3e4, Figma `button-secondary-border`) unselected, `prominent` selected. Prominent colour only; no variant or size props.
  - A leading 50px square slot (full inner height) holds a 28px indicator circle (`size-button-micro`, the token Figma binds). Without an item `icon` it is a stroke-only 2px grey ring that fills prominent and shows the DS `CheckIcon` (white) when selected. With an `icon` it is a filled circle: grey with a dark icon, prominent with a white icon when selected. The icon is per item, so a row can mix both.
  - Selected options have no hover or pressed look (washes are gated on `unselected:`). Unselected hover/press = `ghost-hover` / `ghost-active`, as in Figma.
  - Disabled = `ds-disabled-control`. Focus = `ds-focus-visible-ring`. All state changes (border, fill, icon colour, check fade) run on `ds-motion-state` (`fast`, `standard`); reduced motion via the global token rule.
  - `selectType` (`FancyToggleSelectType.single` default | `.multi`). Single: `value: string`, can never be cleared — the same guard as `ToggleSwitch` (Radix's "" dropped, Radix kept controlled). Multi: `value: string[]`, any number including none, Radix owns uncontrolled state. Props are a discriminated union, so `selectType=multi value="x"` (or single with an array) fails to compile. Items read `selectType` from context (the ToggleSwitch context pattern); in single mode the chosen option gets the default cursor, in multi it keeps the pointer because a click still deselects it.
- decisions where Figma is silent (open questions answered by default, not by the maintainer):
  - Disabled dims the whole option (the existing helper, as the brief says). Figma dims only the label and icon; the border and indicator stay full strength there.
  - A disabled SELECTED option keeps its prominent border and filled indicator (dimmed). ToggleSwitch's options drop their fill when disabled; that rule was not copied, so a disabled fancy row still shows which option is chosen.
  - The check uses the DS `CheckIcon` at its default 14px and the DS default stroke width (Figma draws a 2px stroke in a 14px box).
  - Multi mode: "a selected option is not interactive" can't fully hold, because clicking it is how you deselect. It still has no hover or pressed look.
- reuse vs ToggleSwitch: the never-clear guard is a copy (~8 lines), not shared. ToggleSwitch couldn't be composed: its root hard-codes `gap-xxs`, and cn's tailwind-merge does not dedupe DS spacing keys (`cn("gap-xxs", "gap-md")` keeps both, so CSS order would decide the gap). Both headers now say the two rules must change together. A shared hook would need an edit to `Toggle.tsx` (outside this lane).
- consumer impact: new exports `FancyToggleSwitch`, `FancyToggleSwitchItem`, `FancyToggleSelectType` (+ type), `FancyToggleSwitchProps`, `FancyToggleSwitchItemProps`. Existing ToggleSwitch / Tabs are unchanged.
- breaking: no
- verified:
  - `npm run lint` (tsc): no errors in any Toggle file. At hand-back time the only errors are in `LoadingSpinner/LoadingSpinner.tsx` (agent 05c's work in progress).
  - Type checks: single with a string array and multi with a string both fail to compile (`@ts-expect-error` probe file, deleted afterwards).
  - Server render (`react-dom/server`, esbuild scratch bundle): single → `role=radiogroup`, `data-state` on/off, chosen option gets `selected:enabled:cursor-default`; no-icon indicator renders the ring classes + CheckIcon with `group-unselected/fancy-option:opacity-0`; icon item renders the filled-circle classes and the consumer svg; multi → `role=toolbar`, two `aria-pressed=true`, a disabled item with `disabled` + `data-disabled`.
  - Tailwind compile of `src/styles/index.css` (`@tailwindcss/node`) with every class the component emits: all generate a rule. `group-selected/fancy-option:` / `group-unselected/fancy-option:` compile against the `selected` / `unselected` custom variants. `pr-lg` → `--ui-spacing-lg` (16), `gap-md` → `--ui-spacing-md` (12).
  - Not run: Storybook and the build (per the brief).
  - Scoreboard: m7 "use client" files 28 → 29 (the new `FancyToggleSwitch.tsx`, which needs `useState` and `createContext`/`useContext`; `fancyToggleOption.ts` and `constants.ts` stay neutral). No other metric rose because of this change (m2 fell 19 → 18 from another agent).
- docs owed:
  - CHANGELOG `[Unreleased]` → Added: "`FancyToggleSwitch` / `FancyToggleSwitchItem` — 54px prominent pill toggle row with a leading indicator (ring + check, or a filled circle with an item `icon`), single or multi select via `FancyToggleSelectType`."
  - Consumer skill (`skills/` design-system usage): a FancyToggleSwitch section — when to choose it over ToggleSwitch, `selectType` and value shapes, `icon` per item, selected options have no hover/press, no variant/size props.
  - `.agents/skills/dooph-ds-codebase`: list `FancyToggleSwitch.tsx` / `fancyToggleOption.ts` in the Toggle folder; add `FancyToggleSelectType` to the constants table.
  - `.agents/skills/dooph-ds-architecture` line ~122 (sanctioned non-variant prop names: `shape`, `side`, `selectType`): `selectType` is now on FancyToggleSwitch as well as DropdownMenu.
  - Follow-up to consider: register `text-style-hero-button` in `src/utils/cn.ts`'s text-style group (today `cn("text-style-hero-button", "text-text")` drops the text style; this component avoids it by keeping them on separate elements).


<!-- merged from _work/changes/06A1-aschild.md -->
### 06A1 — `asChild` on decorated leaves + OutlineButton consumer mouse handlers

Agent A1, wave A. WI-081, WI-087.

## Checklist
- [x] Baseline scoreboard
- [x] Baseline render snapshot (asChild repro + non-asChild markup) from current source — 5 THROW, as the audit found
- [x] OutlineButton: Slottable (WI-081) + composed mouse handlers (WI-087)
- [x] ShapeButton: Slottable
- [x] DropdownTrigger + TextDropdownTrigger: Slottable (+ one-line span reasons)
- [x] Harness after edits: 7/7 OK, non-asChild markup byte-identical
- [x] Stories: Button, OutlineButton (AsChild + ConsumerMouseHandlers), ShapeButton, DropdownTrigger (2)
- [x] Verify: lint, scoreboard, WI grep checks

---

### `asChild` now works on OutlineButton, ShapeButton, DropdownTrigger and TextDropdownTrigger [F-003, F-024, WI-081]
- files: `src/components/OutlineButton/OutlineButton.tsx`,
  `src/components/ShapeButton/ShapeButton.tsx`,
  `src/components/DropdownTrigger/DropdownTrigger.tsx`,
  `src/components/Button/Button.stories.tsx`,
  `src/components/OutlineButton/OutlineButton.stories.tsx`,
  `src/components/ShapeButton/ShapeButton.stories.tsx`,
  `src/components/DropdownTrigger/DropdownTrigger.stories.tsx`
- what changed: each of the four components rendered its decoration (orbs,
  shape, caret, chevron) beside `children`, so Radix `Slot` had two candidates
  and threw. The label wrapper is now a Radix `Slottable` in its render-prop
  form (`<Slottable child={children}>{(child) => <span…>{child}</span>}</Slottable>`):
  Slot targets the consumer's element, and the label span wraps that element's
  own children. The two DropdownTrigger label spans got a one-line comment
  saying why they exist. Button.tsx needed no change (it already worked).
  New stories: `Button/As Child`, `OutlineButton/As Child`,
  `ShapeButton/As Child`, `DropdownTriggers/Secondary As Child`,
  `DropdownTriggers/Text As Child`.
- consumer impact: `<OutlineButton asChild><a href…>…</a></OutlineButton>` (and
  the same on the other three) no longer throws "Slot failed to slot onto its
  children". The consumer's element becomes the interactive root and receives
  the root classes, handlers and ref; the decoration renders inside it.
  OutlineButton keeps its outer frame `<div>`. Without `asChild` the markup is
  byte-identical. A non-element `asChild` child now throws Radix's descriptive
  "failed to slot onto its `Slottable`" error instead of the generic one.
  ShapeButton stays server-safe: `Slottable` is a plain function component and
  `@radix-ui/react-slot` has no `"use client"`, so the render-prop never crosses
  a client boundary.
- breaking: no
- verified: a scratch esbuild harness (source bundled to the scratchpad, no
  repo build) running the audit's `aschild-repro` and `nonaschild-snapshot`
  cases. Before: OutlineButton, OutlineButton glowing, ShapeButton,
  DropdownTrigger, TextDropdownTrigger THROW; Button and CTAButton OK. After:
  all 7 OK, the `<a>` is the root (inside OutlineButton's frame div) with the
  label span and decoration inside it. Non-asChild markup diff before → after:
  empty. `<Slottable child=` counts: OutlineButton 1, ShapeButton 1,
  DropdownTrigger 2. `npm run lint` exit 0. Storybook not run (orchestrator
  verifies visually).
- docs owed:
  - `.agents/skills/dooph-ds-architecture/SKILL.md` (the asChild paragraph,
    ~:221 at b436647): list the leaves that support `asChild` (Button,
    CTAButton, TextLink, DropdownTrigger, TextDropdownTrigger, OutlineButton,
    ShapeButton) and say a leaf that renders decoration beside `children`
    puts it next to a `Slottable` in its render-prop form, so the Slot has one
    target and the label wrapper survives slotting.
  - `.agents/skills/dooph-ds-codebase/SKILL.md` (~:129): the last cell
    "via `Button`" → "❌ (omitted — always a `<button>`)".
  - CHANGELOG `[Unreleased]` → Fixed: "`asChild` on `OutlineButton`,
    `ShapeButton`, `DropdownTrigger` and `TextDropdownTrigger` no longer throws
    'Slot failed to slot onto its children'; the child element becomes the
    interactive root and the decoration renders inside it."

### OutlineButton runs a consumer's `onMouseMove` / `onMouseLeave` alongside its glow tracking [F-062, WI-087]
- files: `src/components/OutlineButton/OutlineButton.tsx`,
  `src/components/OutlineButton/OutlineButton.stories.tsx`
- what changed: `onMouseMove` and `onMouseLeave` are destructured out of the
  rest props. The internal handlers call the consumer's first, then do the
  glow tracking / centre reset, and list the consumer callbacks as
  `useCallback` dependencies. Event types are `MouseEvent<HTMLButtonElement>`.
  New story `OutlineButton/Consumer Mouse Handlers` (a move counter).
- consumer impact: before, a consumer `onMouseMove` arrived in `...props` after
  the internal one and replaced it, so the orbs never tracked the cursor and
  the leave-reset stopped. Now both run. With no consumer handler nothing
  changes.
- breaking: no
- verified: harness with an `asChild` probe child that captures the merged
  props and receives a fake element through the ref. Hover mode: consumer
  move 1 call, leave 1 call; `--gx 0.250 / --gy 0.500 / --bw 200px / --bh 50px`
  written on move, `--gx/--gy` reset to `0.5` on leave. `glowing` mode:
  consumer callbacks run, no custom properties written. The destructure grep
  gives exactly 2 lines. `npm run lint` exit 0.
- docs owed: CHANGELOG `[Unreleased]` → Fixed: "`OutlineButton` runs a
  consumer's `onMouseMove`/`onMouseLeave` alongside its glow tracking instead
  of losing the tracking."

### Scoreboard
No metric moved because of this change. Between my before and after runs,
motion literals went 0 → 1 (Toast/Toast.tsx), JS timers 6 → 5 and default
exports 74 → 0; all three are in other agents' folders. OutlineButton's 5
arbitrary px values are unchanged (WI-082 owns them).


<!-- merged from _work/changes/06A2-cn.md -->
### 06A2 — cn learns every text-style role and the DS theme scales (WI-035)

Checklist
- [x] scoreboard baseline
- [x] sync-theme.mjs generates src/utils/twMergeTheme.ts
- [x] cn.ts reads the generated lists; DS_TW_MERGE_CONFIG exported
- [x] src/index.ts exports DS_TW_MERGE_CONFIG
- [x] npm run sync-tokens; index.css/theme.css byte-identical (cmp)
- [x] conflict-pair checks (C1 cn-verify + 21 extra pairs) ALL PASS
- [x] regression scan of internal cn() calls
- [x] npm run lint; scoreboard after

### `cn` knows every text-style role and the DS size/radius/spacing/shadow scales, from generated lists [F-014, F-055, WI-035]
- files: `scripts/sync-theme.mjs`, `src/utils/twMergeTheme.ts` (new, GENERATED —
  must be added to git), `src/utils/cn.ts`, `src/index.ts`
- what changed:
  - `npm run sync-tokens` now also writes `src/utils/twMergeTheme.ts`, with three
    lists taken from the CSS that defines the classes:
    - the DS theme scales (text sizes 11, radius 9, spacing 11, shadow 10), from
      the same entries as the `@theme` block;
    - every `.text-style-<role>` rule in index.css (11: button, body, hero-body,
      hero-button, mono, label, title, heading, subheading, hero, cta);
    - the custom sizing utilities in index.css (`h-button` … `h-button-big`,
      `h-button-micro`, `h-slider-track`, `size-button*`, `size-checkbox`,
      `size-code-digit`, `min-h-button`, `min-w-button`), grouped by
      tailwind-merge class group (h / w / size / min-h / min-w / max-h / max-w).
    The generator throws if any list comes out empty (a regex stopped matching).
  - `cn.ts` has no hand-written class names any more. It builds
    `DS_TW_MERGE_CONFIG` from the generated lists. The two roles batch 05 added
    by hand (hero-button, cta) now come from the generated list.
    Difference from the WI text: the WI used a catch-all validator for
    `text-style-*` and a hand list for the h/size utilities. Per the brief
    ("generate the list from one source"), both are generated instead, so a new
    `.h-*`/`.size-*` utility in index.css is picked up without editing cn.ts.
  - `src/index.ts` exports `DS_TW_MERGE_CONFIG` beside `cn`.
- consumer impact:
  - `<HeroBodyText className="text-text-secondary">` and HeroButtonText keep their
    role typography (in the previous release they lost it; batch 05's hand fix
    had already restored it in the working tree).
  - DS classes now merge with their Tailwind counterparts:
    `cn("rounded-tight","rounded-full")` → `rounded-full`, `cn("p-md","p-lg")` →
    `p-lg`, `cn("h-button","h-8")` → `h-8`, and `text-body` beside a colour is
    kept as a size and no longer erases the colour. Consumer overrides through
    `className` that silently did nothing now take effect.
  - New export `DS_TW_MERGE_CONFIG`, for apps that keep their own merge helper:
    `extendTailwindMerge<"text-style">(DS_TW_MERGE_CONFIG)`.
  - Internal renders: 13 internal `cn()` results change (below). Each dropped
    class already lost on stylesheet order, so nothing looks different.
- breaking: no
- verified:
  - `npm run sync-tokens` → twMergeTheme.ts written; `src/styles/index.css` and
    `theme.css` byte-identical to before the run.
  - `npm run lint` exit 0.
  - esbuild bundle of `src/index.ts` (into ignored `node_modules/.cache`,
    since removed), then `docs/audit/_work/scratch/C1/cn-verify.mjs` → ALL PASS
    (10 roles kept beside `text-text`, `rounded-tight`/`rounded-full`,
    `px-3`/`px-md`, `h-button`/`h-8`, `size-button`/`size-8`, `shadow-*`,
    `buttonVariants(primary)` + `text-body` keeps `text-primary-fg`, five Text
    components keep their role class beside a colour, `DS_TW_MERGE_CONFIG`
    exported).
  - 21 extra pairs ALL PASS, among them `text-style-cta`+`text-text`,
    `p-md`/`p-lg`, `gap-sm`/`gap-md`, `py-sticker-y`/`py-xs`,
    `h-button`/`h-button-big`, `h-button-medium`/`h-auto`,
    `size-checkbox`/`size-code-digit`, `min-h-button`/`min-h-0`,
    `cn("h-button px-rg","px-6")` → `h-button px-6`. Script kept in the session
    scratchpad (`cn-extra.mjs`).
  - Regression scan: C1's render-diff harness re-run on the working tree with
    `cn` swapped for an old-vs-new comparator (455 renders). OLD = the working-tree
    config before this change. 13 changed calls: AIModelSelectTrigger drops
    `gap-2 px-3`, Button size icon/icon-sm/icon-micro and CopyButton secondary
    drop `shadow-button-secondary`, SegmentedTabSelect (7 variant/size renders)
    and DatePickerSplitTrigger (which renders a SegmentedTabSelect) drop
    `gap-1`. That is the audit's 12 plus DatePickerSplitTrigger, which is newer
    than the audit and holds the same SegmentedTabSelect case. In
    dist/styles.css every dropped class sits before its winner (`.gap-1`:728 <
    `.gap-xxs`:770, `.gap-2`:731 < `.gap-sm`:761, `.px-3`:1103 < `.px-sm`:1118,
    `.shadow-button-secondary`:1433 < `.shadow-none`:1453), so it already lost.
  - Scoreboard: no metric moved because of these files. Between my before and
    after runs, default exports 74→0 and JS timers 6→5 moved (A3/A4 lanes), and
    motion literals 0→1 is in `Toast/Toast.tsx` (A4's lane, likely mid-edit).
  - Not done here: a scratch-worktree `npm run build` and the Storybook pass;
    the orchestrator verifies visually (Button icon sizes, CopyButton,
    SegmentedTabSelect, AIModelSelect trigger, HeroBodyText with a colour).
- docs owed:
  - usage skill (`skills/dooph-design-system-usage/SKILL.md`, the cn section):
    replace the "registers a `text-style` conflict group … replicate the group"
    text and its copy-paste list with: cn registers every `text-style-*` role and
    the DS size/radius/spacing/shadow scales, so `text-text` cannot erase a role
    class and `rounded-full` overrides `rounded-tight`. Apps with their own merge
    helper build it from the package config:
    `import { extendTailwindMerge } from "tailwind-merge"; import { DS_TW_MERGE_CONFIG } from "@dooph-software/design-system"; export const twMerge = extendTailwindMerge<"text-style">(DS_TW_MERGE_CONFIG);`
  - codebase skill (`.agents/skills/dooph-ds-codebase/SKILL.md`): `utils/cn.ts` ←
    clsx + tailwind-merge; `DS_TW_MERGE_CONFIG` built from generated lists. Add
    `utils/twMergeTheme.ts` ← GENERATED by sync-theme.mjs from tokens.css and
    index.css; never hand-edit. On the sync-theme.mjs line, add "and
    src/utils/twMergeTheme.ts".
  - contribution skill (`.agents/skills/dooph-ds-contribution/SKILL.md`, both
    places that describe what sync-tokens regenerates): add "AND
    `src/utils/twMergeTheme.ts` (cn's merge lists)". Also: after adding a
    `.text-style-*` role or a custom `.h-*`/`.size-*`/`.min-w-*` utility to
    index.css, run `npm run sync-tokens`.
  - CHANGELOG `[Unreleased]`: Added — "`DS_TW_MERGE_CONFIG`: the package's
    tailwind-merge config, for apps that keep their own merge helper." Fixed —
    "`cn` keeps every `text-style-*` role beside a colour class, and merges DS
    size/radius/spacing/shadow and button-height classes with their Tailwind
    counterparts (`rounded-full` now overrides `rounded-tight`; `text-body` no
    longer erases a text colour)."
  - Unblocks: WI-059/WI-060 (consumer override check) and WI-104 (drop
    AIThinkingPart's `h-auto!` now that `cn` knows `h-button`).


<!-- merged from _work/changes/06A3-exports-icons.md -->
### 06A3 — Vestigial default exports, drifted shape SVG copies, BaseIcon colour (brief 06 wave A, agent A3)

## Progress (write-to-disk-first)
- [x] 0. Read rules, brief A3, WI-001 / WI-025 / WI-076; baseline scoreboard (default exports = 74)
- [x] 1. WI-001 default-export removal by script (`docs/audit/_work/scratch/waveA/remove-default-exports.mjs`)
- [x] 2. WI-025 delete the drifted `Shapes/svgs/` copies (kept the maintainer's new `eightleafclover.svg`)
- [x] 3. WI-076 BaseIcon `color` → CSS `color`; dropped HeartFill / StopFilled re-wiring; Icon Colors story
- [x] 4. lint + scoreboard after; icon barrel regenerated (byte-identical)

---

### Icon leaves, BaseShape and SidebarWithHoverIcon export by name only [WI-001, F-075]
- files (88, all by one script — `docs/audit/_work/scratch/waveA/remove-default-exports.mjs`, dry run / `--write` / `--verify`):
  - 74 lose their `export default <Name>;` line (and the blank line before it): 72 `src/components/Icons/*Icon.tsx` leaves, `src/components/Shapes/BaseShape.tsx`, `src/components/SidebarWithHoverIcon/SidebarWithHoverIcon.tsx`.
  - `src/components/Icons/FiltersSlidersIcon.tsx`: also drops `import ArrowUpLeftIcon from "./ArrowUpLeftIcon";`, which only fed its wrong default (the default export was `ArrowUpLeftIcon`).
  - Default imports → named: `src/components/Menu/DropdownMenu.tsx` (that one import line only; the script aborts if any other line in the file would change), `src/components/Icons/Icons.stories.tsx`, and line 1 of 12 shape leaves (`Arrow, Capsule, Clover, Cookie, Diamond, Double, EightLeafClover, Pixircle, Puff, Squircle, Star, Triple`Shape.tsx): `import BaseShape, { … }` → `import { BaseShape, … }`.
  - `EightLeafCloverShape.tsx` is the maintainer's new, still-untracked file; it had the same default import, so it got the same one-line switch (lint would fail otherwise).
- what changed: one export convention for these files — named only. The script has a lane guard (aborts if it would touch anything outside Icons/, Shapes/, SidebarWithHoverIcon/, DropdownMenu.tsx's import line).
- consumer impact: none. The package `exports` map only exposes "." and the barrels re-export named bindings, so the defaults were unreachable.
- breaking: no.
- verified:
  - script `--verify`: no `export default` in any non-story module under src/, no relative default import left; story files keep their 46 `export default meta` lines (unchanged).
  - `npm run generate-icon-exports` → `src/components/Icons/index.ts` byte-identical (88 icon exports); generator needed no change.
  - `npm run lint` exit 0. Scoreboard "Vestigial default exports" 74 → 0.
- docs owed: contribution SKILL.md `*Icon.tsx` row: "Keep filename and const in sync; named export only (no `export default`)".

### Drifted `Shapes/svgs/` copies deleted; new eightleafclover.svg kept [WI-025, F-108]
- files: deleted `src/components/Shapes/svgs/{arrow,capsule,clover,cookie,diamond,double,pentagon,pixircle,puff,squircle,triple}.svg` (plain `rm`, unstaged — 11 tracked files). No `*Shape.tsx` touched.
- KEPT: `src/components/Shapes/svgs/eightleafclover.svg` — the maintainer's new, untracked export (its path matches `EIGHT_LEAF_CLOVER_SHAPE_PATH`). Per the brief it stays; so the folder still exists with that one file. Nothing in src/, scripts/, Storybook config or package.json references `svgs` (only the codebase skill line, and the audit scratch `U10/verify-shape-svgs.mjs`).
- baseline drift confirmed before deleting: Pentagon and Puff svgs differed from their constants, Star had no svg, the rest matched.
- consumer impact: none (folder never shipped; `files` = dist, skills, bin).
- breaking: no.
- verified: lint exit 0; `grep -rn svgs src scripts` → nothing.
- docs owed: codebase SKILL.md line 140 — replace the "lifted verbatim from the Figma export kept alongside in `Shapes/svgs/`" clause with the WI-025 wording naming the `*_SHAPE_PATH` constants as canonical. Maintainer decision owed: whether `eightleafclover.svg` should also go (WI-025 intent) once the new shape is committed — the constant is canonical either way.

### Icon `color` now sets CSS `color`, so filled parts follow it [WI-076, F-063]
- files: `src/components/Icons/BaseIcon.tsx` (style gains `color: color ?? undefined`; `stroke` is now `strokeColor ?? "currentColor"`), `HeartFillIcon.tsx` and `StopFilledIcon.tsx` (no longer destructure `color`; fill is plain `currentColor`; StopFilled comment rewritten), `Icons.stories.tsx` (Icon Colors story adds HeartFill, StopFilled and a 0.5-stroke Tag in prominent colour).
- what changed: `color` reaches every `currentColor` paint in the icon, not just the stroke. `strokeColor` still wins for the stroke. Without `color`, nothing changes (no inline `color`, inheritance as before).
- consumer impact: `TagIcon`'s centre dot now follows `color` (visible below stroke-width 1); any consumer icon built on BaseIcon with `currentColor` fills now follows `color` too — a bug fix. HeartFill / StopFilled render the same colours as before.
- breaking: no (patch-level fix).
- verified (esbuild render of HEAD vs working tree, `docs/audit/_work/scratch/waveA/a3-render/{head,work}.txt`): `TagIcon color=red` svg style now has `color:red;stroke:currentColor` (HEAD: `stroke:red`, no `color`); HeartFill/StopFilled resolve to the same red; `StopFilled color=red strokeColor=blue` keeps the blue stroke; `SquircleShape size=24` markup byte-identical to HEAD (shapes unaffected). `grep "fill={color" src/components/Icons` → none. Lint exit 0.
- docs owed: CHANGELOG `[Unreleased]` → Fixed: "`color` on any icon now sets CSS `color`, so filled parts drawn with `currentColor` (e.g. `TagIcon`'s dot) follow it."

### Scoreboard
- Vestigial default exports 74 → 0 (this change).
- Moved by other agents' in-flight Toast work, not A3: motion literals 0 → 1 (Toast/Toast.tsx), JS timers 6 → 5.


<!-- merged from _work/changes/06A4-toast-toggle.md -->
### 06A4 — Toast exit animation, toast description colour, shared toggle never-clear rule (brief 06 wave A, agent A4)

## Progress (write-to-disk-first)
- [x] 0. Read rules, brief, WI-096 / WI-100 blocks, F-035 / F-086, motion scale, Toast + Toggle files and contracts
- [x] 1. Baseline scoreboard (m3 Tailwind numeric spacing 36 — Toast.tsx 13; m7 "use client" 28; m8 timers 6)
- [x] 2. WI-096 toast exit on `animationend`
- [x] 3. WI-100 description colour keyed off `data-variant`
- [x] 4. Toggle: shared never-clear hook
- [x] 5. lint + scoreboard after

---

### Every provider-rendered toast plays its exit animation; removal follows `animationend`, not a 200ms timer [WI-096, F-035]
- files: `src/components/Toast/Toast.tsx`
- what changed:
  - `dismiss(id)` only sets the item's `open` to false. The `setTimeout(…, 200)` that removed it is gone.
  - The provider's `onOpenChange(false)` (timer, close button, `ToastDismiss`, Escape, swipe end) now calls `dismiss` instead of filtering the item out at once. Before, the `<li>` unmounted before Radix `Presence` could play the `data-[state=closed]` exit.
  - New `onAnimationEnd` on each provider `ToastRoot` removes the item from state, only when `event.target === event.currentTarget` and the `<li>` has `data-state="closed"`. A descendant's bubbling animation or the enter animation can't prune it. Radix spreads root props onto the `<li>` (`@radix-ui/react-toast` 1.2.23 `dist/index.mjs:394-399`, checked). `Presence` (1.1.10) listens with its own native listener and dispatches through `useReducer`, not `flushSync`, so the node is still mounted when React's delegated handler runs.
  - Reduced motion (checked in the CSS): the toast's exit duration is `.ds-motion-overlay[data-state="closed"] { animation-duration: var(--ui-motion-duration-fast) }`. The single reduce block in `tokens.css` sets `--ui-motion-duration-fast` to `1ms`, not `0ms` (its comment says that is load-bearing for event-driven components). The keyframe animation still runs and `animationend` fires. No `animation: none` reduce rule anywhere in `src/styles/` matches the toast. (Note: `motion-scale.md` says `0ms`; the shipped token block says `1ms`. A 0s CSS animation also dispatches `animationend`, so either way the toast is pruned.)
- consumer impact: toasts closed by their timer, close button, Escape or a swipe now animate out instead of vanishing. `dismiss()` no longer waits a fixed 200ms; the exit timing comes only from the motion token. Known edge: in a hidden tab the closed item stays in the provider's array (invisible) until the tab is shown and the event is delivered.
- breaking: no
- verified: see the end of this record.
- docs owed: CHANGELOG `[Unreleased]` → `### Fixed`: "- Toasts closed by their timer, close button, Escape or a swipe now play their exit animation; they used to vanish at once. `dismiss()` no longer waits on a 200ms timer."

### The prominent toast description colour moves into `ToastDescription`, keyed off a new `data-variant` on `ToastRoot` [WI-100, F-086]
- files: `src/components/Toast/Toast.tsx`, `src/components/Toast/Toast.stories.tsx`
- what changed:
  - `ToastRoot` renders `data-variant={variant ?? ToastVariant.simple}` on its `<li>` (before the consumer's props, so a consumer value still wins). `simple` matches the cva default.
  - `ToastDescription` base classes: `text-text-secondary group-data-[variant=prominent]:text-prominent-fg`. It reads the root's existing `group` class.
  - The provider's simple/prominent/danger template no longer branches on the variant: title and description are just `block wrap-break-word`. The title inherits the root's colour (BaseText sets none): `text-text` on simple/danger, `text-prominent-fg` on prominent, as before. The complex branch is untouched.
  - New story `Overlays/Toast › Composed Prominent`: a `ToastRoot` + `ToastTitle` + `ToastDescription` composed by hand, prominent variant (`data-testid="composed-desc"` on the description).
- consumer impact: a hand-composed `<ToastRoot variant={ToastVariant.prominent}>` now gets a legible white description (was #4a4a4a on #340fd9, about 1.07:1). Provider-rendered toasts compute the same colours as before. `ToastRoot` now carries `data-variant`. On a prominent root, the group variant outranks a consumer's plain text-colour class on `ToastDescription`.
- breaking: no
- verified: see the end of this record.
- docs owed: CHANGELOG `[Unreleased]` → `### Fixed`: "- `ToastDescription` inside a prominent `ToastRoot` uses the prominent foreground colour, so custom-composed prominent toasts are legible. `ToastRoot` now renders `data-variant`."

### ToggleSwitch and FancyToggleSwitch share one "single selection can never be cleared" hook instead of two copies [follow-up to 05e, maintainer's reuse request]
- files: `src/components/Toggle/Toggle.tsx`, `src/components/Toggle/FancyToggleSwitch.tsx`
- what changed:
  - New internal hook `useNeverClearedValue({ value, defaultValue, onValueChange })` in `Toggle.tsx`. It holds the uncontrolled state, lets a controlled `value` win, and drops Radix's `""` (the active option clicked again) before it reaches state or the callback. It returns `{ value, onValueChange }` to hand straight to a Radix `type="single"` group. It is exported from `Toggle.tsx` for FancyToggleSwitch only; `Toggle/index.ts` does not re-export it, so it is not public.
  - `ToggleSwitch` and `FancyToggleSwitch` (single mode) both call it. FancyToggleSwitch calls it above its mode branch, fed nothing in multi mode, so the hook order never depends on `selectType` (same as the old `useState` placement).
  - Why the hook sits in `Toggle.tsx` and not its own file: this repo marks a hook module `"use client"` (as `useChangeSwap.ts` is), so a separate file would add a client module (scoreboard "use client" 28 → 29). `Toggle.tsx` is already a client module. The header says so.
  - No other duplicated selection logic found: multi mode is plain Radix passthrough, and the two presentation contexts carry different data.
  - Header contracts: Toggle.tsx's `## behavior` now says the rule lives in `useNeverClearedValue` and FancyToggleSwitch calls it; a new constraint records why it stays in this module. FancyToggleSwitch.tsx no longer says "change this one with it; they must not drift". It now points to the shared hook, and the hook-order constraint names the hook instead of `useState`.
- consumer impact: none. Same behaviour, same public exports.
- breaking: no
- verified: see below.
- docs owed: `.agents/skills/dooph-ds-codebase` Toggle folder note: the never-clear rule is `useNeverClearedValue` in `Toggle.tsx`, shared by both rows (internal, not exported).

---

### Verification (all three items)
- `npm run lint` (tsc) → exit 0.
- `rg "setTimeout" src/components/Toast/Toast.tsx` → none. `rg "ToastVariant.prominent" src/components/Toast/Toast.tsx` → none (the template no longer branches on it).
- Scoreboard before → after: JS timers/animation loops 6 → 5 (Toast's `setTimeout` gone). Motion literals 0 → 0, "use client" files 28 → 28, Tailwind numeric spacing 36 → 36. Default exports 74 → 0 is agent A3's work, not this one. No metric rose. (A first draft comment in Toast.tsx said "1ms" and tripped the motion-literal counter; reworded.)
- Runtime harness (scratch, outside the repo): esbuild bundle of the real `src/` Toast + Toggle modules under React 19 `StrictMode`, Tailwind CLI compile of `src/styles/index.css`, served on localhost and driven in the Browser pane. The pane was hidden, which freezes CSS animations, so exits were driven with `document.getAnimations().forEach(a => a.finish())`, per the known hidden-pane caveat. Provider state was read from the React fiber.
  - Close button, `dismiss()`, Escape on the focused toast, and the auto-dismiss timer: in each case the `<li>` stays mounted with `data-state="closed"` and an `exit` animation running at 150ms. The provider array holds the item with `open: false`. When the exit ends, the `<li>` is removed with `state-at-removal=closed` and the array empties. Before the fix, the close button, Escape and the timer removed it at once while still `open`.
  - Reduced-motion stand-in: with `--ui-motion-duration-fast` set to `1ms` on `:root` (what the reduce block sets), the exit animation ran at 1ms and the toast was pruned from DOM and state without manual help, even in the hidden pane.
  - Colours: the composed prominent description computes `rgb(255,255,255)` = `--ui-color-prominent-foreground`, and its `<li>` has `data-variant="prominent"`. Provider prominent title and description are white too. Provider simple title = `--ui-color-text` (rgb 22,22,22) and description = `--ui-color-text-secondary` (rgb 74,74,74), unchanged. The compiled rule is `.group-data-[variant=prominent]:text-prominent-fg:is(:where(.group)[data-variant="prominent"] *)` at (0,2,0), which beats `.text-text-secondary`.
  - Toggles: ToggleSwitch uncontrolled/controlled and FancyToggleSwitch uncontrolled/controlled: clicking the active option again leaves it `on` and never calls `onValueChange("")`. Clicking the other option selects it (uncontrolled) or reports it while the controlled `value` wins. Fancy multi still clears to `[]` and toggles freely.
- Not run: Storybook, the build, dark theme, true `prefers-reduced-motion` emulation (the pane tools cannot set it), the 600ms retune check from the WI. The orchestrator verifies visually: Overlays/Toast › Persistent / Standard / All Variants and the new Composed Prominent.


<!-- merged from _work/changes/06A5-behaviour-bugs.md -->
### 06A5 — Behaviour bugs: VerificationCodeInput entry, Input aria-invalid, flat ProgressIndicator track

Checklist:
- [x] Sequential verification-code entry [WI-110 / F-040]
- [x] Input `hasError` sets `aria-invalid` [WI-111 / F-070]
- [x] Flat ProgressIndicator shares the wavy track geometry [WI-069 / F-033]
- [x] lint + scoreboard

Scoreboard before: arbitrary px 18, numeric spacing 36, raw var 5, focus 3, disabled 2, use client 28, JS timers 6, onValueChange 0, default exports 74.

## Flat ProgressIndicator no longer paints a stray track dot near completion [WI-069 / F-033]
- files: `src/components/ProgressIndicator/ProgressIndicator.tsx`, `src/components/ProgressIndicator/waveGeometry.ts` (doc comment only).
- what changed: the flat variant drops its own copy of the remainder-track formula and calls `getWavyTrackGeometry`, the function the wavy variant already uses. When it returns null (the clamp band near completion, and p=1) the track `<circle>` is not rendered at all, instead of rendering a zero-length round-capped dash that paints a dot. The track keeps its `ds-progress-arc` class (WI-070 had already landed). Doc comments on `FlatProgressIndicator` and `getWavyTrackGeometry` updated. No header contract in either file.
- consumer impact: no stray grey dot ahead of the arc's head at sm ≈0.82–0.91 … xl ≈0.90–0.95, nor through a translucent `color` at p=1. Also fixes AIContextGauge's dial. A value moving into the band drops the track at once instead of transitioning it to a dot (the wavy variant always behaved this way). All other values render identically.
- breaking: no
- verified: scratch SSR script (copy of `scratch/W4a/flat-track.cjs`, run on an esbuild bundle of the source) before → after: `zero-length track dashes: 12` → `0`; every flat row at p=0.9, 0.94, 1 now `trackCircles=0`; flat and wavy p=0 and p=0.5 rows byte-identical to the baseline (dasharray and dashoffset). `rg trackLength|trackOffset ProgressIndicator.tsx` → 0 hits.
- docs owed: loading-indicators SKILL.md :186-190 "Track arc: computed in render (not rAF). Correct formula:" → "Track arc: computed in render (not rAF) by `getWavyTrackGeometry`, the same function the wavy variant uses. Formula:"; :200-202 "`getWavyTrackGeometry` computes … returns `null` at completion" → "`getWavyTrackGeometry` (shared with the flat variant) computes the circular remainder and returns `null` once it has no length". CHANGELOG Fixed: "The flat `ProgressIndicator` (and `AIContextGauge`) no longer paints a stray track dot near completion."

## Input's `hasError` now announces the error to assistive technology [WI-111 / F-070]
- files: `src/components/Input/Input.tsx`.
- what changed: `hasError` sets `aria-invalid="true"` on the `<input>` in all four variants (text, iconText, number, iconNumber), as CodeDigitInput already did. It is written ahead of `...props`, so a consumer's own `aria-invalid` still wins. Header `## behavior` gains the bullet "`hasError` paints the danger chrome and sets `aria-invalid` on the `<input>` (a consumer's own `aria-invalid` wins)." Constraints untouched; consistent with "every other prop, and `ref`, always land on the `<input>`".
- consumer impact: screen readers now announce errored Inputs as invalid. No visual change.
- breaking: no
- verified: scratch SSR script on an esbuild bundle of the source (the audit's `W7c/invalid-check.cjs` is not on disk, so it was re-created): before → 4 FAIL (all four variants), after → 7 PASS: four variants `aria-invalid="true"`; `hasError` + `aria-invalid={false}` → `"false"`; no `hasError` → attribute absent; VerificationCodeInput control → `"true"`.
- docs owed: codebase SKILL.md :148 "+ `hasError` bool." → "+ `hasError` bool (danger chrome + `aria-invalid` on the input, as `CodeDigitInput`)."; CHANGELOG Fixed: "`Input`: `hasError` sets `aria-invalid` on the `<input>`, matching `CodeDigitInput`."

## VerificationCodeInput entry is sequential, so a digit always lands where it shows [WI-110 / F-040]
- files: `src/components/VerificationCode/VerificationCodeInput.tsx`, `src/components/VerificationCode/VerificationCode.stories.tsx` (new `NonSequentialEntry` story after `Disabled`).
- what changed:
  - `writeDigit` writes at `Math.min(index, value.length)` and auto-advances from there, so a stale focus cannot place a digit out of position.
  - Each cell's `onFocus`: an empty cell past the first empty one moves focus to the first empty cell (tap, Tab).
  - ArrowRight stops at the first empty cell (`focusAt(Math.min(index + 1, value.length))`). The WI only listed `writeDigit` + `onFocus`; this was needed because of the next point.
  - **Deviation from the WI's code, found in testing:** the WI's `onFocus` alone breaks ordinary typing. `focusAt` runs inside the same event as `setValue`, before the new value renders, so the next cell's `onFocus` reads the old value and bounces focus back (typing 7 into cell 1 left focus on cell 1; paste likewise). Fix: a `movingFocusRef` flag set while `focusAt` moves focus, so the redirect only applies to user focus. Hence the ArrowRight clamp (it also goes through `focusAt`).
  - Header: `## behavior` gains the sequential-entry bullet (incl. Backspace on a filled middle cell deletes it, later digits shift left, focus stays). `## constraints` gains a new bullet stating why `focusAt` moves skip the redirect and that every `focusAt` target must be a legal cell — the flag looks removable and is not.
- consumer impact: tapping/Tabbing into a later empty cell now lands on the first empty one; typed digits appear where the caret is. Public value shape unchanged (gapless digit string). Typing in order, paste, ArrowLeft, Backspace unchanged.
- breaking: no
- verified: esbuild bundle of the source mounted in a scratch page (not Storybook), focused browser tab:
  - WI step 1 on empty: `[0, "7|||||", 1]` (before the fix the WI documents `[3, "7|||||", 4]`).
  - Partial "123": focus cell 6 → 3; `type(cells[1],'9')` → `"1|9|3|||"`, focus 2; ArrowRight on cell 4 stays 3; ArrowRight on filled cell 2 → 3rd cell.
  - Filled: Backspace on cell 3 → `"1|2|4|5|6|"`, focus 2.
  - Controlled: focus cell 5 → 0; typing 4,2,0 echoes "420", focus 3; paste "987654" → echo "987654", focus 5.
  - Guard check: same bundle with the `movingFocusRef` check stripped → typing 7 into cell 1 leaves focus on cell 1 (bounce), confirming the constraint.
- docs owed: CHANGELOG Fixed: "`VerificationCodeInput`: focusing an empty cell past the first empty one moves focus to the first empty cell, so a typed digit lands where it shows."

## Verification (all three)
- `npm run lint` → exit 0.
- Scoreboard after: motion 1 (was 0 — the hit is `Toast/Toast.tsx`, agent A4's folder, not this change), JS timers 6 → 5 and default exports 74 → 0 (other agents). Nothing in this change raised any count.
- No build run in this checkout; scratch bundles stub `utils/cn` because `cn.ts` was mid-edit by agent A2 (`./twMergeTheme` not yet present at the time).


<!-- merged from _work/changes/06B1-dialogs.md -->
### 06B1 — Modal & Sheet: portal escape hatch, one shared dialog shell

Checklist
- [x] Scoreboard before
- [x] Harness: esbuild bundle of src → scratch build root, run wi-c6-03-check / wi-c6-06-snapshot
- [x] WI-095 portal / portalProps on ModalContent + SheetContent (+ stories)
- [x] WI-098 internal dialogShell.tsx
- [x] lint, type probes, scoreboard after

Harness (no build in checkout, no worktree): `esbuild` bundles `src/components/{Modal,Sheet}` to
`<scratch>/b/dist/index.cjs` (packages external, `b/node_modules` is a junction to the repo's),
so the audit's `wi-c6-03-check.cjs` / `wi-c6-06-snapshot.cjs` run unchanged against it.

## Modal and Sheet content can skip the portal or target a container [WI-095, F-030]
- files: `src/components/Modal/Modal.tsx`, `src/components/Sheet/Sheet.tsx`,
  `src/components/Modal/Modal.stories.tsx`, `src/components/Sheet/Sheet.stories.tsx`
- what changed: `ModalContent` and `SheetContent` take `portal` (default `true`) and
  `portalProps` (passed to Radix `Dialog.Portal`: `container`, `forceMount`), like Tooltip,
  Popover and DropdownMenu content. `portal={false}` renders the overlay and panel in place.
  The overlay and panel go to the portal as two children (never one Fragment), so Radix
  Presence keeps its ref and the exit animation still plays. New exported types
  `ModalContentProps`, `SheetContentProps`. Class lists unchanged. New story "Custom Container"
  in Overlays/Modal and Overlays/Sheet.
- consumer impact: can mount a dialog into a shadow root / iframe / themed wrapper, or render
  it in place; default output is the same tree as before.
- breaking: no
- verified: `wi-c6-03-check.cjs` before = `FAILURES: 3` (the three `portal={false}` cases render
  ""), after = `ALL PASS`. Snapshot Overlay/Title/Description lines byte-identical before/after.
- docs owed: CHANGELOG `[Unreleased]` → Added: "`ModalContent` and `SheetContent` accept
  `portal` (default `true`) and `portalProps`, like the other overlay contents;
  `ModalContentProps` and `SheetContentProps` are exported." `.agents/skills/dooph-ds-codebase/SKILL.md`
  Modal and Sheet rows: `` `withOverlay` bool `` → `` `withOverlay` bool; `portal` (default true) /
  `portalProps` escape hatch ``. `skills/dooph-design-system-usage/references/responsive-sheet-modal.md`
  props cell: "both have `withOverlay`, `portal` and `portalProps`".

## Modal and Sheet share one internal dialog shell [WI-098, F-083]
- files: new `src/components/Modal/dialogShell.tsx`; `src/components/Modal/Modal.tsx`,
  `src/components/Sheet/Sheet.tsx`
- what changed: the backdrop base, the panel surface (surface colour, border style/colour,
  shadow, overflow, focus reset), the portal-or-in-place logic, and the title/description
  styling now live once in `dialogShell.tsx` (`DialogShellOverlay`, `DialogShellContent`,
  `DialogShellTitle`, `DialogShellDescription`). Every public Modal/Sheet part is a thin
  `forwardRef` wrapper with its old name, props type and `displayName`. Motion classes stay in
  Modal.tsx / Sheet.tsx on the exact batch-01 helpers (`ds-motion-overlay-dialog`,
  `ds-motion-overlay-sheet`), so timing is unchanged. `sheetVariants` dropped the three surface
  strings the shell now owns. JSDoc on SheetOverlay and sheetVariants now points at the shell
  (the stale "durations" wording went with it). No `"use client"` (Modal.tsx/Sheet.tsx have none;
  the shell uses no hooks or handlers). The shell is not re-exported from `Modal/index.ts` or
  `src/index.ts`. Also moved `ModalContentProps` / `SheetContentProps` above the component JSDoc
  so the "Raw modal/sheet primitive" doc stays on the component.
- consumer impact: none visible. Class token order inside ModalContent/SheetContent's `class`
  attribute changes (surface classes first); the set is identical and the consumer `className`
  still merges last.
- breaking: no
- verified: `wi-c6-06-snapshot.cjs` (22 cases: every part, each Sheet side, with/without overlay,
  with/without consumer className; sorted classes, ids stripped) run before and after this item →
  `diff` empty; all 22 lines non-empty. `wi-c6-03-check.cjs` still `ALL PASS`. Outside stories,
  `bg-modal-surface`, `bg-modal-backdrop`, `text-style-heading text-text`,
  `text-style-body text-text-secondary` appear exactly once each under Modal+Sheet, all in
  `dialogShell.tsx`. Type probe (scratch tsc against `src/index`): `<ModalContent portal={false}>`,
  `<SheetContent portalProps={{ container: null }}>`, `forceMount`, both Props types compile;
  `@ts-expect-error` holds on `Lib.DialogShellContent` (not public) and on `overlay` passed to
  ModalContent. `npm run lint` exit 0. Scoreboard identical before/after.
- not verified here (orchestrator, Browser pane): Storybook Overlays/Modal › Default and
  Overlays/Sheet › Right/Left/Top/Bottom open/close look and motion; dialogs are direct children
  of `body`; no "Invalid prop `ref` supplied to `React.Fragment`" console error; Escape leaves
  `[role=dialog]` mounted with `data-state="closed"` during the exit; the two "Custom Container"
  stories mount `[role=dialog]` inside `[data-testid=modal-container]` / `sheet-container` and Tab
  stays trapped. No dist build was made (rule 7), so the `dist/*.d.ts` greps were replaced by the
  type probe above.
- docs owed: `.agents/skills/dooph-ds-codebase/SKILL.md`: after the `SheetTitle`, `SheetDescription`
  row add `| (internal) DialogShell* | Modal/dialogShell.tsx | shared backdrop base, panel surface,
  portal-or-in-place shell, title/description; not exported — Modal and Sheet wrap it |`, and the
  architecture skill's "copy Modal.tsx" advice should mention the shell. No CHANGELOG line.


<!-- merged from _work/changes/06B2-table.md -->
### 06B2 — Table (WI-106, WI-074, WI-114)

Checklist
- [x] WI-106 style merge, roles, aria-sort, buttonProps
- [x] WI-074 text-text-primary → text-text
- [x] WI-114 plain header labels as ButtonText; stories pass bare strings
- [x] lint, scoreboard, SSR probe, type probe

## 2026-10-03

### Table parts merge a consumer `style`, carry table roles and `aria-sort`, and TableHeaderCell takes `buttonProps` [F-029, F-042, F-039, WI-106]
- files: `src/components/Table/Table.tsx`
- what changed:
  - `TableHeader` and `TableRow` destructure `style` and spread it last
    (`{ gridTemplateColumns: …, ...style }`). Before, a consumer `style`
    replaced the whole object and wiped the column grid and row height.
  - Roles, all written before `{...props}` so a consumer's own `role` wins:
    `Table` `table`; `TableHeader`, `TableRow` `row`; `TableHeaderCell`
    `columnheader` (both branches); `TableCell` `cell`; `TablePlaceholder`
    `row`, with its children wrapped in `<div role="cell" className="contents">`
    (no layout change).
  - A sortable `TableHeaderCell` sets `aria-sort` through a local map
    (`none`→`none`, `ascend`→`ascending`, `descend`→`descending`). The
    `TableSortDirection` values are unchanged.
  - New optional `TableHeaderCellProps.buttonProps`, spread onto the sort
    `<Button>` after its variant/size; its `className` merges via `cn`; the
    click is always `onSort`. Type: `Omit<ButtonProps, "children" | "onClick" |
    "asChild" | "variant" | "size">`. **Deviation from the WI:** the WI omitted
    only children/onClick/asChild. `Omit` over Button's variant×size union
    collapses it, so spreading it failed to compile (`variant: … | null` not
    assignable to the text-variant branch) and would have widened the pill
    restriction Button's header contract protects. The header owns the sort
    button's look, so `variant` and `size` are omitted too.
  - `React.CSSProperties` → imported `CSSProperties`.
- consumer impact: `<TableRow style={{ opacity: 0.5 }}>` keeps its grid. Screen
  readers now announce a table with rows, column headers, cells and sort state.
  `buttonProps` lets `aria-*`, `id`, handlers and a `className` reach the sort
  button instead of the wrapping `<div>`.
- breaking: no
- verified: `npm run lint` exit 0. esbuild bundle of the Table module in the
  scratchpad (`b2build/`, node_modules junctioned to the repo's) →
  `docs/audit/_work/scratch/W7a/table-check.cjs` all 8 PASS, exit 0, no React
  unknown-prop warning. Extra SSR probe: consumer `role` and `style.gridTemplateColumns`
  win on `TableRow`; consumer `role` wins on a plain header; `buttonProps.className`
  and `id` reach the `<button>`; `aria-sort` is `none`/`descending` as expected.
  `^\s+style=\{\{` in Table.tsx → 2 hits, each ending in `...style`.
  Not yet checked in Storybook (orchestrator: `Bits & Pieces/Table` →
  "Header Cell Sort States" read_page should show table → row → columnheader,
  columns aligned as before).
- docs owed:
  - CHANGELOG `[Unreleased]` → Added: "`TableHeaderCell buttonProps` — props
    for the sort button (not `variant`/`size`/`onClick`)." Fixed:
    "`TableHeader` / `TableRow`: a consumer `style` merges instead of wiping the
    column grid." and "`Table` parts expose table/row/columnheader/cell roles;
    sortable headers set `aria-sort`."
  - contribution SKILL.md:54 — the style spread-order rule (WI-106 step 7, verbatim).
  - usage SKILL.md:163 — roles/`aria-sort`/`buttonProps`/style-merge sentence
    (WI-106 step 8).

### Sortable TableHeaderCell uses the real `text-text` utility [F-060, WI-074]
- files: `src/components/Table/Table.tsx`
- what changed: the sort button's `text-text-primary` (no such token; it emitted
  no CSS but still made `cn` drop the Button's `text-ghost-fg`) → `text-text`
  (`--color-text: var(--ui-color-text)`). Folded into the new
  `cn("w-full justify-start gap-1 text-text", buttonProps?.className)`.
- consumer impact: none in an app whose body colour is the text token. An app
  that sets a different colour on a Table ancestor now sees the sortable label
  in `--ui-color-text` instead of inheriting.
- breaking: no
- verified: SSR probe → the button's classes include `text-text`, and neither
  `text-text-primary` nor `text-ghost-fg`. `rg text-text-primary src` → 0.
- docs owed: CHANGELOG `[Unreleased]` → Fixed: "Sortable `TableHeaderCell`
  labels use the `text-text` token utility (the previous class did not exist)."

### Every TableHeaderCell label renders as ButtonText; stories pass bare strings [F-074, WI-114]
- files: `src/components/Table/Table.tsx`, `src/components/Table/Table.stories.tsx`
- what changed: the plain (non-sortable) branch renders
  `<ButtonText>{children}</ButtonText>`, mirroring the sortable branch. In the
  stories, all 13 wrapped header labels (the WI says 14 but lists 13) are now
  bare strings on one line; the unused `ButtonText` import is dropped.
- consumer impact: bare-string plain header labels now carry `text-style-button`
  (same size as body, button font/weight) instead of inheriting the page's
  style, matching the sortable header beside them. Labels already wrapped in
  `ButtonText` or another role component (e.g. `BodyText`) look the same — the
  inner span is closer. **Look change in the DS's own stories:** `Header`,
  `CellStackedContent` and `Placeholder` labelled their headers with
  `BodyText`; they now render in the button style like `Default` and `Rows`.
  I judged the BodyText rendering to be the inconsistency F-074 names, not
  "today's correct rendering", so I did not skip — orchestrator, please
  eyeball those three stories.
- breaking: no
- verified: `docs/audit/_work/scratch/W7b/52-table-header.cjs` against the
  scratch bundle → 3 PASS, exit 0. `rg ButtonText Table.stories.tsx` → 0;
  no multi-line `<TableHeaderCell>` remains; `<ButtonText>{children}</ButtonText>`
  appears twice in Table.tsx.
- docs owed: CHANGELOG `[Unreleased]` → Fixed: "`TableHeaderCell` applies the
  button text style to plain (non-sortable) labels too, so a header row reads
  in one style. Pass header labels as plain strings."

### Notes
- Scoreboard before → after: unchanged on every line. Table.tsx still holds 4
  Tailwind numeric spacing classes (`gap-1`, `px-4 py-3`, `py-8`); not in these
  WIs, left alone (`py-8` = 32px has no token).
- Table.tsx's line-1 "No use client" note stays true (no hook added).


<!-- merged from _work/changes/06B3-slider-types.md -->
### 06B3 — Slider / LPI / CopyButton / CTAButton types, Slider keyboard, LPI colour docs

Checklist:
- [x] Types say what the runtime does (LPI value, Slider extras, CopyButton ref, CTAButton ref) + story [WI-116]
- [x] Stepped slider keyboard: PageUp/PageDown and Shift+Arrow move 10 dots + story description [WI-105]
- [x] LPI `color` JSDoc + header transition bullet, LPI/Slider "Color prop" stories [WI-046]
- [x] lint, scoreboard, type probe, Slider behaviour script

## Types match the runtime [WI-116, F-089]
- files: `src/components/LinearProgressIndicator/LinearProgressIndicator.tsx`, `src/components/Slider/Slider.tsx`, `src/components/Slider/Slider.stories.tsx`, `src/components/CopyButton/CopyButton.tsx`, `src/components/CTAButton/CTAButton.tsx`
- what changed:
  - LinearProgressIndicator: props now `Omit<…Root props, 'value'>` plus `value?: number` (JSDoc: determinate only; Radix's `null` not supported). Runtime unchanged. Header unchanged (it already says "determinate bar"), per the WI.
  - Slider: Radix is handed `[value[0]]` only. A new `withExtras` helper re-attaches the consumer's `value[1…]` on every path (continuous change/commit, stepped drag change/commit, stepped keyboard commit). Extras pass through as given, not snapped. JSDoc on `SliderProps` says single thumb. New story `Extra values pass through` (after `Controlled (stepped)`), using `gap-md` rather than the WI's `gap-3`. `highlightedStep` / `SliderSteppedProps` untouched.
  - CopyButton: `forwardRef<HTMLButtonElement, …>`, cast on `ref` removed.
  - CTAButton: `forwardRef<HTMLElement, …>`; the `<a>` branch casts to `ForwardedRef<HTMLAnchorElement>` with a comment; `type ForwardedRef` added to the react import. Header contract (shape-by-size) not touched; no conflict.
- consumer impact: single-value sliders behave exactly as before. A multi-value `[a, b]` now comes back `[a', b]` instead of being truncated or having `b` moved/re-sorted by Radix's closest-thumb logic.
- breaking: `yes — v6` (type-level only):
  - `LinearProgressIndicator value={null}` → compile error (pass a number).
  - `CopyButton` ref `HTMLElement` → `HTMLButtonElement` (`useRef<HTMLElement>` no longer assigns).
  - `CTAButton` ref `HTMLAnchorElement` → `HTMLElement` (reading `ref.current.href` now needs narrowing).
- verified:
  - `npm run lint` exit 0.
  - Type probe `docs/audit/_work/scratch/W7b/types-probe/probe54.tsx`, retargeted at `src/index.ts` (scratchpad tsconfig, no build): exit 0. Sanity negatives in the same run error as expected (CTAButton ref is `HTMLElement`; a `HTMLDivElement` ref on CopyButton is rejected).
  - Scratchpad esbuild script (Radix slider stubbed to capture Root props; rendered via react-dom/server; handlers called directly): Root gets `[1]` for `[1,3]`; ArrowRight `[1,3]`→`[2,3]`; Home→`[0,3]`; End→`[4,3]`; stepped drag change `[2.37]`→`[2,3]`, commit `[3.6]`→`[4,3]`; continuous change/commit `[62]`→`[62,80]`; off-grid extra `3.3` kept; single-value paths unchanged. All PASS.
  - `rg "as React.Ref<HTMLButtonElement>" src/components/CopyButton` → none.
  - Not verified here (orchestrator, Storybook): pointer drag on the new story, CTAButton `AsChildButton` story.
- docs owed: usage SKILL.md (single-thumb note on the Slider entry), codebase SKILL.md LPI row ("determinate only — `value` is `number`"), CHANGELOG `[Unreleased]` Changed (LPI `value` number-only; CopyButton/CTAButton ref types) and Fixed (Slider extra values no longer dropped or moved).

## Stepped slider keyboard x10 [WI-105, F-022]
- files: `src/components/Slider/Slider.tsx`, `src/components/Slider/Slider.stories.tsx`
- what changed: `handleKeyDown` computes `isSkipKey` (PageUp/PageDown, or Shift+Arrow) and moves `step * 10` for those keys; plain Arrow/Home/End unchanged; the existing clamp keeps the result in range. Comment explains it mirrors Radix's multiplier. "Keyboard interaction" story description rewritten per the WI. (`const big = step * (isSkipKey ? 10 : 1)` — one hit for the WI's grep.)
- consumer impact: on SliderStepped / SliderLabeled `stepped`, PageUp/PageDown and Shift+Arrow now move 10 dots (clamped), matching SliderContinuous.
- breaking: no
- verified: same esbuild script — 0..4 slider from 2: PageUp→4, Shift+ArrowLeft→0; 0..100 from 50: PageUp 60, PageDown 40, Shift+ArrowRight/Up 60, Shift+ArrowDown 40, plain ArrowRight 51, rtl Shift+ArrowRight 40, inverted Shift+ArrowLeft 60, Shift+Home 0; unrelated key (Tab) not prevented. All PASS. Lint exit 0.
- docs owed: arch SKILL.md sanction sub-bullet for SliderBase's `preventDefault` (text in WI-105 step 4); codebase SKILL.md Slider keyboard sentence; CHANGELOG `[Unreleased]` Fixed line.

## LPI colour docs and "Color prop" stories [WI-046, F-010, F-047, F-117]
- files: `src/components/LinearProgressIndicator/LinearProgressIndicator.tsx`, `src/components/LinearProgressIndicator/LinearProgressIndicator.stories.tsx`, `src/components/Slider/Slider.stories.tsx`
- what changed: header `## behavior` bullet now credits the `width`/`left` transitions (`ds-progress-fill` / `ds-progress-remainder`, off under reduced motion) instead of `@property` registration (confirmed in dooph-component-tokens.css); both `## constraints` untouched. `color` JSDoc names `DS_COLOR_TOKENS` keys ('primary', 'prominent', 'text', 'danger-primary', …). Both "Color prop" stories iterate `primary/prominent/text/danger-primary`; LPI "Brand - Animated" → "Prominent - Animated"; Slider Color story description now states the per-variant track opacity token (50% light / 60% dark, confirmed in tokens.css).
- consumer impact: none at runtime; IntelliSense and stories no longer offer colour names that paint transparent.
- breaking: no
- verified: `rg "'brand'|error-primary|Brand - Animated|at 45%"` over both folders → no output. Lint exit 0. Visual "every sample paints" check left to the orchestrator.
- docs owed: none beyond the skill/CHANGELOG parts the brief defers.

## Scoreboard
Before → after: identical on every metric (diff of the two runs is empty).


<!-- merged from _work/changes/06B4-menu.md -->
### 06B4 — Menu family (wave B, section B4)

Checklist
- [x] SearchBox draws the DS search icon; the two search rows name each other as twins [WI-089]
- [x] HotkeyIndicator `menu` variant replaces DropdownMenuSearch's descendant overrides [WI-090]
- [x] DropdownMenuSearch documents its keyboard limit [WI-092]
- [x] Styled submenu parts: DropdownMenuSubTrigger / DropdownMenuSubContent [WI-102]
- [x] Menu/trigger contracts, props types, Slot `type` off the typeable trigger's div [WI-118]
- [x] Complex menu width through the token in stories [WI-024, stories only]

Verification tools used (no Browser pane, no build): `npm run lint`, an esbuild
bundle of `src/index.ts` rendered with `react-dom/server` (scratchpad
`b4/probe.tsx`, 30 checks, all PASS), a `tsc --strict` type probe against
`src/index.ts` (`b4/types.tsx`, exit 0), and a `cn` class-set comparison of the
root menu panel (`b4/panel.ts`).

### SearchBox draws the DS `SearchIcon`; SearchBox and DropdownMenuSearch name each other as twins [F-082, WI-089]
- files: `src/components/SearchBox/SearchBox.tsx`, `src/components/Menu/DropdownMenuSearch.tsx`
- what changed: SearchBox's hand-drawn 16-unit glyph (circle r=4.25, 1.5
  stroke) is replaced by `<SearchIcon size={IconSize.md} className="shrink-0 text-text-tertiary" />`
  — the glyph DropdownMenuSearch already draws. SearchBox JSDoc names
  DropdownMenuSearch as its twin; DropdownMenuSearch's header `## behavior`
  names SearchBox as its twin ("apply row fixes to both").
  DropdownMenuSearch's `showShortcut` default is now spelled `!!shortcut`, the
  same expression as SearchBox (`shortcut` defaults to `["Esc"]`, so the
  result is unchanged).
- consumer impact: SearchBox's leading icon is now the DS search glyph (16px,
  DS icon stroke width 2) instead of a slightly smaller, thinner custom one.
  Box size unchanged. The icon is still `aria-hidden` (BaseIcon default).
- breaking: no
- verified: render probe — no `r="4.25"` in SearchBox output, the svg is
  `aria-hidden="true"`; no `<kbd>` without `shortcut`, `<kbd>` with it;
  DropdownMenuSearch still shows `Esc` by default and hides it with
  `showShortcut={false}`. Lint exit 0. Visual glyph comparison owed to the
  orchestrator (Storybook `Inputs/SearchBox/*` vs `Complex With Search`).
- docs owed: CHANGELOG `[Unreleased]` → Changed: "`SearchBox` draws the DS
  `SearchIcon` (16px) in place of its own glyph."

### HotkeyIndicator gets a `menu` variant; DropdownMenuSearch drops its `[&_kbd]` overrides [F-088, WI-090]
- files: `src/components/HotkeyIndicator/constants.ts` (new),
  `src/components/HotkeyIndicator/HotkeyIndicator.tsx`,
  `src/components/HotkeyIndicator/index.ts`,
  `src/components/HotkeyIndicator/HotkeyIndicator.stories.tsx`,
  `src/components/Menu/DropdownMenuSearch.tsx`
- what changed: new server-safe `HotkeyIndicatorVariant` const + type
  (`default` | `menu`), re-exported from the HotkeyIndicator barrel (and so from
  the package root). `HotkeyIndicator` takes `variant` (default `default`).
  `menu` = `h-6 min-h-6 text-text-tertiary` plus `bg-secondary-hover
  border-secondary-border-hover` at rest; `pressed` still wins for both
  variants. DropdownMenuSearch passes `variant={HotkeyIndicatorVariant.menu}`
  and `className="shrink-0"` — the five `[&_kbd]:` descendant selectors are
  gone. New story `Bits & Pieces/HotkeyIndicator/Menu`.
- consumer impact: additive — a consumer can now render the menu-row chip
  themselves. The default chip and the in-menu chip render the same as before
  (refactor, not restyle).
- breaking: no
- verified: render probe — the default chip's class set is identical to the
  pre-change spelling for 1 and 2 keys, pressed and not (4 checks). The menu
  chip's classes contain `h-6 min-h-6 bg-secondary-hover
  border-secondary-border-hover text-text-tertiary` and lack `min-h-[23px]`,
  `bg-surface-page`, `border-border-primary`, `text-ghost-fg`, which is the
  effective result of the old overrides. `rg "\[&_" src` (non-stories) → no
  output. Type probe: `variant: "nope"` is rejected. Computed-style
  comparison in Storybook (step 1/5 of the WI) owed to the orchestrator.
- docs owed: usage SKILL.md (HotkeyIndicator line) → `HotkeyIndicator`
  (`HotkeyIndicatorVariant`: `default` | `menu`); codebase SKILL.md
  HotkeyIndicator row → append `; variant (HotkeyIndicatorVariant.default|.menu,
  the menu-row chip)`; CHANGELOG `[Unreleased]` → Added: "`HotkeyIndicatorVariant`
  / `HotkeyIndicator` `variant` — `menu` is the chip used on menu rows."

### DropdownMenuSearch documents that it is not keyboard-reachable inside the menu [F-094, WI-092]
- files: `src/components/Menu/DropdownMenuSearch.tsx`, `src/components/Menu/DropdownMenu.stories.tsx`
- what changed: new last `## behavior` bullet ("Not keyboard-reachable inside
  DropdownMenuContent … consumers must give keyboard users another path");
  new shipped JSDoc on `DropdownMenuSearch` with a "Keyboard limit" paragraph;
  a doc comment on the `ComplexWithSearch` story. No code change.
- consumer impact: IntelliSense on `DropdownMenuSearch` now states the limit
  and the two workarounds (TypeableDropdownTrigger, or search outside the menu).
- breaking: no
- verified: `rg "Keyboard limit|Not keyboard-reachable" src/components/Menu` →
  2 lines, both in DropdownMenuSearch.tsx. Lint exit 0.
- docs owed: none beyond what the shipped JSDoc carries.

### `DropdownMenuSubTrigger` and `DropdownMenuSubContent` [F-091, WI-102]
- files: `src/components/Menu/DropdownMenu.tsx`, `src/components/Menu/index.ts`,
  `src/components/Menu/DropdownMenu.stories.tsx`
- what changed: the root panel's classes moved into one module constant
  `menuPanelClassName` (the list as it stands after the motion batch, ending in
  `ds-motion-overlay`), used by `DropdownMenuContent` and the new
  `DropdownMenuSubContent`. `DropdownMenuSubTrigger` = `itemBase` +
  `data-[state=open]:bg-ghost-active` + a trailing `ChevronRightIcon`
  (`IconSize.rg`); its children sit in a `gap-rg` span (the WI's `gap-sm` is
  pre-rename; `gap-rg` matches the radio item's children span).
  `DropdownMenuSubContent` takes `portal` (default true) / `portalProps` like
  the root content. Both exported from the module and the Menu barrel. Header
  `## behavior` gains the submenu bullet. New story `Menus/DropdownMenu/Submenu`.
- consumer impact: a styled submenu without importing Radix. Root
  `DropdownMenuContent` output unchanged.
- breaking: no
- verified: `cn` class-set comparison — the root panel's merged class set is
  identical before/after with `matchTriggerWidth` true and false. Render probe
  (open, unportalled) renders the sub trigger with `aria-haspopup="menu"` and
  two `role="menu"` panels. Type probe imports both from `src/index.ts`, exit 0.
  Radix `SubContent` sets `--radix-dropdown-menu-content-transform-origin`
  too (react-dropdown-menu dist :226), so `ds-radix-dropdown-content-origin`
  works on the sub panel. Keyboard/hover behaviour (ArrowRight opens, Escape
  closes only the sub) owed to the orchestrator in Storybook.
- docs owed: codebase SKILL.md — remove `DropdownMenuSub` from the
  pass-through row; add a row `DropdownMenuSub`, `DropdownMenuSubTrigger`,
  `DropdownMenuSubContent` (Sub = pass-through; SubTrigger = itemBase + open
  fill + trailing ChevronRightIcon; SubContent shares `menuPanelClassName`,
  `portal`/`portalProps`). Usage SKILL.md menu paragraph — add
  "`DropdownMenuSub` + `DropdownMenuSubTrigger` + `DropdownMenuSubContent` (a
  nested submenu; the sub panel takes `portal`/`portalProps`)". CHANGELOG
  `[Unreleased]` → Added: "`DropdownMenuSubTrigger` and `DropdownMenuSubContent`,
  so `DropdownMenuSub` builds a styled submenu without importing Radix."

### Menu/trigger contracts name their failures; three props types exported; TypeableDropdownTrigger drops Slot's `type` [F-113, F-115, WI-118]
- files: `src/components/Menu/DropdownMenu.tsx`, `src/components/Menu/DropdownMenuSearch.tsx`,
  `src/components/DropdownCaret/DropdownCaret.tsx`,
  `src/components/DropdownTrigger/DropdownTrigger.tsx`, `src/components/Menu/index.ts`
- what changed:
  - DropdownMenu.tsx header: the danger exception is its own sentence; both
    constraints name their failure; a new constraint records that
    `focusOnOpen={false}` / `onOpenAutoFocus` reach Radix's private
    `onOpenAutoFocus` through the cast at the Content spread (checked against
    installed react-menu 2.1.24: dist/index.mjs :179 and :266). The cast-spread
    itself is untouched.
  - New exported types `DropdownMenuProps`, `DropdownMenuContentProps` (with a
    JSDoc on `onOpenAutoFocus` pointing at the constraint), `DropdownMenuItemProps`;
    `DropdownMenuSegmentProps` documents `children` ("rendered only when
    `variant` is `labeled`"). All re-exported from the Menu barrel.
  - DropdownMenuSearch.tsx and DropdownCaret.tsx constraints each append their
    failure (wording only, rules unchanged).
  - TypeableDropdownTrigger: the rest props are `rest`; `type` is dropped
    before spreading onto the root `<div>` (`const { type: _slotType, ...triggerProps } = rest …`).
    No header contract in DropdownTrigger.tsx; wave A's `asChild` work kept.
- consumer impact: three new type exports (additive). TypeableDropdownTrigger's
  root `<div>` no longer carries `type="button"`; every other Radix trigger
  attribute still flows through.
- breaking: no
- verified: render probe of `<DropdownMenuTrigger asChild><TypeableDropdownTrigger/>`
  — root div has no `type=`, still has `aria-haspopup="menu"` and the Radix
  `id`; the inner input keeps `type="text"`. Type probe with the three new
  types, exit 0. `rg "never the faded .ghost-fg. rest$"` → 1 hit; `rg "tone — except"`
  → none. Lint exit 0 (so `_slotType` passes the repo's tsc flags). Typeable
  open/focus behaviour in Storybook owed to the orchestrator.
- docs owed: CHANGELOG `[Unreleased]` → Added: "Types `DropdownMenuProps`,
  `DropdownMenuContentProps`, `DropdownMenuItemProps`."; Fixed:
  "`TypeableDropdownTrigger` no longer renders Radix's `type="button"` on its
  root `<div>`."

### Complex menu width goes through the token in the stories [F-069, WI-024 — stories only]
- files: `src/components/Menu/DropdownMenu.stories.tsx`
- what changed: `ComplexWithoutSearch` and `ComplexWithSearch` sections use
  `width="var(--ui-min-w-menu-complex)"` instead of `324`;
  `SectionWidthOverride` moves to a bespoke `280` (button label "Width 280").
- consumer impact: none (stories). Retuning `--ui-min-w-menu-complex` now moves
  the search row and the results section together.
- breaking: no
- verified: `rg "width=\{324\}" src` → no output. Lint exit 0. Rendered widths
  (324px / 280px) owed to the orchestrator.
- docs owed: architecture SKILL.md (the `DropdownMenuSection width` sentence)
  and codebase SKILL.md (`ds-min-w-menu-complex` bullet and the token
  description) per WI-024 steps 3–4: the complex width is passed as
  `width="var(--ui-min-w-menu-complex)"`; `ds-min-w-menu-complex` is
  DropdownMenuSearch's floor, not a section helper.

### Scoreboard
No metric moved (before and after runs identical). Noted, not touched: the
default HotkeyIndicator's `min-w-[23px] min-h-[23px]` (2 arbitrary px) and the
`h-6 min-h-6` moved verbatim into the `menu` variant (tokenising them is
F-017's); SearchBox `gap-2` and HotkeyIndicator `gap-1` (numeric spacing) are
outside these WIs.


<!-- merged from _work/changes/06B5-aichat-checkbox.md -->
### 06B5 — AIChat parts + Checkbox (WI-018, WI-052, WI-054, WI-094, WI-097, WI-103, WI-104)

Checklist:
- [x] Header contracts brought into format (Checkbox, CodeDigitInput, RollingDigitsText, AIChat) [WI-018]
- [x] Checkbox press gated to unchecked [WI-052]
- [x] AIPromptInputSubmit / AIThinkingEffortSelector forward props; unknown effort throws [WI-094]
- [x] AIThinkingPart `data-phase` [WI-103]
- [x] ChatDivider `h-3` / AIThinkingPart `h-auto!` dropped [WI-104]
- [x] Reduced-motion chat shimmer tone [WI-097]
- [x] Model tooltip title via `--ds-chat-model-color` [WI-054]
- [x] lint + scoreboard

Scoreboard before: motion 0, arbitrary px 18, numeric spacing 36, raw var 5, focus 3, disabled 2, use client 28, JS timers 5, onValueChange 0, default exports 0.
Scoreboard after: identical (no metric moved).

How "before" was measured: no build in this checkout, so `src/` was bundled with esbuild (cjs, packages external) into a scratch "build root" (dist/index.cjs plus a junction to node_modules). The "before" root is a copy of `src/` with this batch's code edits reversed by script. The audit check scripts (`W6/wi-c6-02-check.cjs`, `W6b/wi-c6-11-check.cjs`, `W6b/wi-c6-12-check.cjs`) ran against both. CSS was compiled with `tailwindcss -i src/styles/index.css -o <scratchpad>/b5-styles.css` (output outside the repo; `git status` unchanged).

## Header contracts brought into the file-header format and current vocabulary [WI-018]
- files: `src/components/Checkbox/Checkbox.tsx`, `src/components/VerificationCode/CodeDigitInput.tsx` (header only), `src/components/AnimatedText/RollingDigitsText.tsx` (header only), `src/components/AIChat/{AIThinkingPart,AIToolPart,AITurnSummary,ChatDivider,UserMessageHeader,AIModelSelect}.tsx` (headers only).
- what changed:
  - Checkbox: title and variant bullet say `prominent | primary` (there is no `brand` member). Inline comment "matches typeabletrigger hover, not brand" → "matches the typeable trigger's hover border".
  - CodeDigitInput: `error-primary` → `danger-primary`, "brand focus ring" → "the prominent focus ring" (substrings only; its `disabled` clause left for WI-066).
  - RollingDigitsText: the `## updating` section is gone. Its three rules are now `## constraints` bullets, each with its failure: no duration in JS (it desyncs and the fade overruns the roll); no timer/rAF/transitionend; the reconcile stays in render. Drift: the first bullet keeps today's mention of the motion scale (`--ui-motion-*`) beside `--ui-rolling-digits-*`, which the WI text predates. The header closes at line 38 (≤ 42).
  - AIThinkingPart: "Transcript colour is inherited by `ds-chat-prose`" moved from `## constraints` to `## behavior` (it is behaviour).
  - AIToolPart: the AI-SDK-state constraint now names its failure (it would tie the package to one SDK's vocabulary and version).
  - AITurnSummary: "Render it only once a turn has settled" moved to `## behavior`, reworded as consumer guidance.
  - ChatDivider, UserMessageHeader: rewritten as prose headers with no `## behavior` / `## constraints`, since neither has an invariant beyond layout. Every rule is kept in the prose: ChatDivider's "when to draw one is the consumer's decision", UserMessageHeader's "NOT sticky" and its reason.
  - AIModelSelect: `## behavior` added over the parts table. The provider-colour constraint gains its failure ("a class cannot carry an arbitrary consumer colour").
- consumer impact: none (comments only).
- breaking: no
- verified: lint exit 0. `brand|error-primary` → no hits in Checkbox/CodeDigitInput. `## updating|almost always|hasCents|an earlier version` → no hits in RollingDigitsText. `## behavior` ×1 in AIModelSelect. No `## constraints` in ChatDivider/UserMessageHeader.
- docs owed: none. Maintainer note: AGENTS.md says removing a constraint is its own commit, with the reasoning stated. The ChatDivider/UserMessageHeader change drops the `## constraints` heading but keeps both rules as prose. If you read that as a removal, commit it separately (reason: R11.5 prose form, for files with no invariant a reasonable edit would violate).

## Checkbox keeps its fill while a checked box is pressed [WI-052]
- files: `src/components/Checkbox/Checkbox.tsx`
- what changed: the press background `active:bg-secondary-hover` is now gated to `data-[state=unchecked]`, like hover. Header `## behavior`: "Unchecked hover/active use secondary surface tokens; a checked or indeterminate box keeps its fill while pressed." The inline comment no longer calls the old behaviour intentional.
- consumer impact: pressing a checked or indeterminate Checkbox no longer flashes the secondary-hover background over the fill, so the check stays legible. Unchecked press is unchanged. The pressed border/shadow on checked boxes is unchanged.
- breaking: no
- verified: SSR shows the class `data-[state=unchecked]:[&:not([data-disabled])]:active:bg-secondary-hover`. The compiled CSS has exactly one rule for it, with selector `…[data-state="unchecked"]:not([data-disabled]):active`. The forced-`:active` browser check is left to the orchestrator.
- docs owed: CHANGELOG Fixed: "`Checkbox`: a checked or indeterminate box keeps its fill while pressed."

## AIPromptInputSubmit and AIThinkingEffortSelector forward their props; an unknown effort value throws [WI-094]
- files: `src/components/AIChat/AIPromptInput.tsx`, `src/components/AIChat/AIModelSelect.tsx`
- what changed:
  - `AIPromptInputSubmitProps` extends `ComponentPropsWithoutRef<"button">` minus `children | type | disabled | aria-label`. The rest props spread FIRST on both buttons, so the part's `type`, variant, `size` (iconSm), `disabled` and accessible name always win. In the stop state a consumer `onClick` runs before `onStop`, and `event.preventDefault()` cancels the stop (documented in the component JSDoc).
  - `AIThinkingEffortSelectorProps` extends `ComponentPropsWithoutRef<"div">` minus `children | color | onChange | defaultValue` (the part's own `color` is a `DsColor`). Rest props spread first on the root.
  - The selector throws `[AIThinkingEffortSelector] value "<v>" is not one of steps: a, b` when `value` is not in a non-empty `steps`, instead of silently drawing step 0. Empty `steps` still renders as before.
  - The AIModelSelect header's `## constraints` gains: "AIThinkingEffortSelector THROWS when `value` is not one of `steps` …".
  - Policy note: the WI said to switch to a dev warning if D-12 chose that. D-12 chose "render nothing after a dev warning" for Calendar/DatePicker only, and kept a throw for ProgressIndicator's own guard. This selector's guard is a component-level bad-value guard like ProgressIndicator's, so the throw was kept. The maintainer may overrule.
- consumer impact: `<TooltipTrigger asChild>` / `<DropdownMenuTrigger asChild>` now work around both parts (the tooltip opens, `data-state` lands). `id`, `data-*`, `aria-*` and handlers reach the DOM. An effort `value` missing from `steps` now throws during render.
- breaking: no per the WI (semver minor). But the new throw fails a render that used to "work", so the maintainer may want it listed under v6.
- verified: `wi-c6-02-check.cjs` before `FAILURES: 6` → after `ALL PASS`. Its `BASELINE:` line (a valid selector render) is byte-identical before and after. tsc probe: `<AIPromptInputSubmit type="button" />`, `disabled` and the selector's `onChange` each error (TS2322). `id`/`data-testid`/`onClick`/`aria-describedby` on the submit and `id`/`style`/`className`/`color` on the selector → no error.
- docs owed: CHANGELOG Fixed: "`AIPromptInputSubmit` and `AIThinkingEffortSelector` forward their remaining props, so `asChild` triggers (Tooltip, DropdownMenu) and `id`/`data-*`/`aria-*` attributes work on them." CHANGELOG Changed: "`AIThinkingEffortSelector` throws when `value` is not one of `steps`, instead of drawing the first step." Usage skill, AI chat notes: the stop-click `preventDefault()` hook.

## AIThinkingPart exposes its phase as `data-phase` [WI-103]
- files: `src/components/AIChat/AIThinkingPart.tsx`
- what changed: every root branch renders `data-phase={state}` beside its existing `data-state`. `data-state` is unchanged: the phase on the live and plain rows, `open`/`closed` on the disclosure row. Both are set before `...props`, so a consumer value still wins. The header's `## behavior` gains the "Root attributes" bullet, which explains both attributes and says not to change what `data-state` holds.
- consumer impact: a phase can be styled with `data-[phase=thought]:…` on every row; `data-state` selectors keep working.
- breaking: no
- verified: `wi-c6-11-check.cjs` before `FAILURES: 4` → after `ALL PASS`. `data-phase={state}` appears 3 times in the file.
- docs owed: CHANGELOG Added: "`AIThinkingPart` renders `data-phase` (the `state` prop) on its root in every variant; `data-state` is unchanged."

## Chat parts stop restating sibling sizes [WI-104]
- files: `src/components/AIChat/ChatDivider.tsx`, `src/components/AIChat/AIThinkingPart.tsx`
- what changed: ChatDivider's wavy rules drop `h-3`, because WavyDivider's own `height="12"` sizes them. AIThinkingPart's disclosure button uses plain `h-auto` instead of `h-auto!`, and the three-line workaround comment is gone (`cn` now replaces `h-button`).
- consumer impact: none at a 16px root. At other root sizes the divider keeps WavyDivider's 12px band.
- breaking: no
- verified: `wi-c6-12-check.cjs` before `FAILURES: 3` (the `cn` line already passed) → after `ALL PASS`. Button height classes before `h-auto! h-button px-sm py-xxs` → after `h-auto px-sm py-xxs`. No `h-auto!`/`h-3` is left in non-story AIChat files. The only `*-button` height left is AITurnSummary's `h-button-sm`, as the WI expects. The Storybook height arrays are left to the orchestrator.
- docs owed: CHANGELOG Fixed: "`ChatDivider`'s wavy rules keep WavyDivider's 12px band at any root font size."

## Live chat labels keep their tone under reduced motion [WI-097]
- files: `src/styles/dooph-component-tokens.css`
- what changed: after `.ds-chat-thinking-shimmer`, a `prefers-reduced-motion: reduce` block paints `.ds-shimmer-text.ds-chat-tool-shimmer` with `--ui-chat-tool-shimmer-base` and `.ds-shimmer-text.ds-chat-thinking-shimmer` with `--ui-chat-thinking-shimmer-base`. The selectors use two classes so they beat index.css's later `color: inherit`. index.css and ShimmerText are untouched; no header changes.
- consumer impact: with reduced motion, live AIToolPart / AIThinkingPart labels show the chat tone instead of the container's text colour. Nothing changes with motion allowed.
- breaking: no
- verified: the compiled CSS contains both rules inside the reduced-motion media block (2 matches). The browser computed-colour check is left to the orchestrator.
- docs owed: CHANGELOG Fixed: "Under `prefers-reduced-motion: reduce`, a live `AIToolPart` / `AIThinkingPart` label keeps its chat tone instead of inheriting the container's text colour."

## Model tooltip title takes the provider colour through the custom property [WI-054]
- files: `src/components/AIChat/AIModelSelect.tsx`, `src/styles/dooph-component-tokens.css`
- what changed: `AIModelTooltipContent` sets `--ds-chat-model-color` on the tooltip root, merged after a consumer `style` as AIModelSelectItem does. The title is `<ButtonText className="ds-chat-model-name">` with no inline style. New rule `.ds-chat-model-name { color: var(--ds-chat-model-color, currentColor); }` after `.ds-chat-model-swatch`. The header's colour constraint (made explicit in WI-018) is now true at every sink.
- consumer impact: the title colour is unchanged with and without `color`. Edge: an unportalled tooltip with no `color`, nested in an element that sets `--ds-chat-model-color`, now inherits that colour.
- breaking: no
- verified: SSR with Radix's Portal stubbed. Before: the title has `style="color:…"`. After: no inline style on the title; the root style carries `--ds-chat-model-color:<value>` plus the consumer's `opacity` and Radix's own variables; with no `color`, there is no custom property. `{ color: resolveDsColor` → no hits in `src`. The compiled CSS has `.ds-chat-model-name` (1).
- docs owed: none beyond an optional CHANGELOG Fixed line ("`AIModelTooltipContent`'s title reads the provider colour from `--ds-chat-model-color`").

## Verification summary
- `npm run lint`: exit 0 (after all edits).
- Scoreboard: no metric moved.
- Not done, per the brief: Storybook/browser checks (Checkbox forced `:active`, reduced-motion computed colours, divider/disclosure heights, tooltip on the submit).
- Observed, not mine: in SSR, `resolveDsColor("ai-anthropic", "")` returned the raw string `ai-anthropic` (same before and after). That story value may not be a DS token name.


<!-- merged from _work/changes/06C1-token-sweep.md -->
### 06C1 — Token sweep: numeric spacing and arbitrary px → DS tokens, plus OutlineButton tokens (WI-059, WI-060, WI-082 remaining part)

Agent C1, wave C (restarted run; the earlier C1 changed no file — it left only
`scratch/waveC/C1-hits.mjs` and `C1-score-before.txt`).

## Checklist
- [x] Scoreboard baseline: m2 (arbitrary px) 18, m3 (numeric spacing) 36 (`scratch/waveC/C1-score-before2.txt`)
- [x] Tokens + EXCLUDED + sync-tokens
- [x] Utilities / ds-* helpers
- [x] Mechanical swap script (`scratch/waveC/C1-sweep.mjs`, `--verify`)
- [x] OutlineButton tokens (WI-082)
- [x] Probes (compiled-CSS values unchanged; merge overrides; SSR markup)
- [x] lint, scoreboard after (`scratch/waveC/C1-score-after.txt`)

## Decisions
- Mapping is by PIXEL value on today's scale, so the WI tables' target names
  are re-derived: `gap-2`(8)→`gap-sm`, `gap-1`(4)→`gap-xxs`, `px-3`(12)→`px-md`,
  `pl-4`/`pr-4`/`px-4`(16)→`*-lg`, `py-2`/`pr-2`(8)→`*-sm`, `pb-3`/`pr-3`/`py-3`(12)→`*-md`.
  Per-utility swaps (SplitButton keeps `pl-lg pr-lg`, not a merged `px-*`).
- WI-060's concentric radius is soft (20) + **sm** (8) = 28px now (the frame
  inset `ds-p-ui-sm` is 8px, not xs).
- **Override safety beats the WI's helper choice.** A `ds-*` helper sits in no
  tailwind-merge group and its layer block comes after Tailwind's utilities, so
  on an element that also receives the consumer's `className` it silently beats
  `rounded-none` / `h-2` / `py-4` / `min-w-0`. Those roots therefore get
  merge-aware utilities (theme tokens or registered index.css utilities):
  OutlineSection/OutlineButton radius → `rounded-outline-frame`
  (`--ui-radius-outline-frame`, not WI-060's `ds-radius-soft-outset-xs`),
  TablePlaceholder → `py-table-placeholder-y`, LinearProgress → `h-linear-progress`
  (not WI-071's `ds-progress-track`), DropdownTrigger `min-w-40` → new
  `min-w-menu` utility (not WI-059's `ds-min-w-menu`). Internal-only spans keep
  `ds-*` helpers (kbd floor, SplitButton icon slot, OutlineButton inner box and orbs).
  The first draft used the helpers; the sweep script's RETARGET pass moved them.
- `ShapeProps.size` already accepts a string (batch 05b): no Shapes/ edit needed.
- WI-082's motion tokens are dropped: orb timing already lives on the motion
  scale (`.ds-outline-orb-1/2`). Only paint (opacity, blur), orb size/anchor and
  the inner box become tokens.
- Zero resets (`p-0`, `m-0`) are not spacing values and stay — see "Not done".

---

### Spacing and fixed sizes follow tokens (Button, SplitButton, SearchBox, HotkeyIndicator, DropdownTrigger, Tooltip, Toast, Table, Tabs, Avatar, ShapeButton, CodeDigitInput, DropdownMenuLabel, TextDropdownTrigger, Checkbox, OutlineSection, LinearProgressIndicator) [F-017, WI-059, WI-060]
- files: `src/styles/tokens.css`, `src/styles/index.css` (utilities + generated block), `src/styles/theme.css` (generated),
  `src/utils/twMergeTheme.ts` (generated), `src/styles/dooph-component-tokens.css`, `scripts/sync-theme.mjs` (EXCLUDED),
  `src/components/{Button/Button.tsx, SplitButton/SplitButton.tsx, SearchBox/SearchBox.tsx, HotkeyIndicator/HotkeyIndicator.tsx,
  DropdownTrigger/DropdownTrigger.tsx, Tooltip/Tooltip.tsx, Toast/Toast.tsx, Table/Table.tsx, Tabs/Tabs.tsx, Avatar/Avatar.tsx,
  ShapeButton/ShapeButton.tsx, VerificationCode/CodeDigitInput.tsx, Menu/DropdownMenu.tsx, Checkbox/Checkbox.tsx,
  OutlineSection/OutlineSection.tsx, LinearProgressIndicator/LinearProgressIndicator.tsx, Sheet/Sheet.tsx (doc comment only)}`
- what changed:
  - Tailwind numeric spacing → the DS scale at the same px (table above). TablePlaceholder's 32px → `py-table-placeholder-y`.
  - Arbitrary px → token classes: Avatar `size-avatar` / `size-avatar-sm`; ShapeButton `size-shape-button`, and its shape
    renders at `size="var(--ui-size-shape-button)"` (the `SHAPE_SIZE = 46` copy is gone); SplitButtonAction icon slot
    `ds-size-icon-rg`; CodeDigitInput `text-code-digit` + `fontSize="var(--ui-text-code-digit)"`; DropdownMenuLabel
    `h-menu-label`; TextDropdownTrigger `h-text-trigger`; single-key HotkeyIndicator `ds-min-size-kbd`; complex Toast
    `pl-toast-inset pt-toast-inset`; Checkbox glyph `size-checkbox-icon` (was `size-2.5`); OutlineSection
    `rounded-outline-frame`; LinearProgressIndicator `h-linear-progress`; DropdownTrigger `min-w-menu`.
  - New tokens (all `:root, .light`): `--ui-text-code-digit` 18px, `--ui-size-checkbox-icon` 10px, `--ui-size-avatar` 38px,
    `--ui-size-avatar-sm` 22px, `--ui-size-shape-button` 46px, `--ui-size-kbd` 23px, `--ui-height-menu-label` 30px,
    `--ui-height-text-trigger` (= menu-label), `--ui-height-linear-progress` 4px, `--ui-spacing-toast-inset` 14px,
    `--ui-spacing-table-placeholder-y` 32px, `--ui-radius-outline-frame` (= soft + sm, 28px).
  - New utilities: theme-generated `text-code-digit`, `*-toast-inset`, `*-table-placeholder-y`, `rounded-outline-frame`;
    index.css `.size-checkbox-icon`, `.size-avatar`, `.size-avatar-sm`, `.size-shape-button`, `.h-menu-label`,
    `.h-text-trigger`, `.h-linear-progress`, `.min-w-menu` (all registered in `cn` by the generator);
    helpers `.ds-size-icon-rg`, `.ds-min-size-kbd`.
  - Sheet's JSDoc example `p-6` → `p-lg` (comment only).
  - CodeDigitInput `## behavior` header now names the token.
- consumer impact: no visual change at a 16px root (every value probed equal). Overriding the new tokens now retunes
  these parts; spacing no longer scales with a non-16px root font size (it follows the px tokens, as everywhere else).
  Consumer `className` overrides keep working (verified via `cn`: `rounded-none`, `py-4`, `h-2`, `min-w-0`, `size-10`,
  `px-6` all replace the DS class). New public tokens and utilities listed above.
- breaking: no
- verified: `npm run lint` exit 0. `C1-sweep.mjs --verify` all 36 rows ok. Compiled before/after CSS with the Tailwind
  CLI into the scratchpad and resolved every old vs new class declaration: all identical (gap 8/4, paddings 8/12/16/32/14,
  sizes 38/22/46/14/10, font-size 18, heights 30/30/4, min 23/160, radius 28). `cn('text-code-digit … text-transparent')`
  keeps both. SSR markup: ShapeButton svg `width/height: var(--ui-size-shape-button)`; CodeDigitInput glyph
  `font-size: var(--ui-text-code-digit)`. Generated diff: exactly `--text-code-digit`, `--spacing-toast-inset`,
  `--spacing-table-placeholder-y`, `--radius-outline-frame` in index.css and theme.css, plus the twMergeTheme lists.
- docs owed: token-contract.md "Sizing And Shape": the twelve tokens above with defaults and their utility/helper.
  CHANGELOG `[Unreleased]` → Added: those tokens and utilities. Fixed: "Button, SplitButton, SearchBox, HotkeyIndicator,
  DropdownTrigger, Tooltip, Toast, Table, Tabs, Avatar, ShapeButton, CodeDigitInput, menu label, text trigger, Checkbox,
  OutlineSection and LinearProgressIndicator sizes and spacing now follow `--ui-*` overrides."

### OutlineButton box and glow orbs read `--ui-outline-button-*` tokens [F-016, F-017, F-021, WI-082]
- files: `src/components/OutlineButton/OutlineButton.tsx`, `src/styles/tokens.css`, `src/styles/dooph-component-tokens.css`,
  `scripts/sync-theme.mjs`
- what changed: frame radius `rounded-outline-frame`; inner box `ds-size-outline-button px-md gap-sm`, label `gap-sm`.
  Orbs: `glowing` mode uses `ds-outline-button-glow-1/2` (anchor, size, opacity, blur), hover mode
  `ds-outline-button-trail-1/2` (size, opacity 0 → token on group hover inside `@media (hover: hover)`, exactly like the
  `group-hover:` utilities they replace, blur). Inline `style` now holds only the glow colour (plus left/top/transform in
  hover mode; the transform's fallbacks are `var(--ui-min-w-outline-button)` / `var(--ui-height-outline-button)`).
  Timing stays on `.ds-outline-orb-*`. New tokens: `--ui-height-outline-button` 54px, `--ui-min-w-outline-button` 160px,
  `--ui-outline-button-orb-{1,2}-opacity` 0.38 / 0.22, `-orb-{1,2}-blur` 18 / 24px, `-orb-{1,2}-hover-blur` 20 / 26px,
  `-orb-{1,2}-width` 62% / 48%, `-orb-{1,2}-height` 72% / 64%, `-orb-1-bottom` -18px, `-orb-1-left` 4%,
  `-orb-2-bottom` -14px, `-orb-2-right` 6% (16 tokens, all EXCLUDED from the theme).
- consumer impact: looks the same; the glow is now retunable by token. Disabled still hides the orbs
  (`group-disabled:!opacity-0` is !important). Reduced motion already handled by the motion scale.
- breaking: no
- verified: compiled-CSS probe — glow-1 = bottom -18px, left 4%, 62%×72%, opacity 0.38, blur(18px); glow-2 = bottom
  -14px, right 6%, 48%×64%, 0.22, blur(24px); trail-1/2 = same sizes, opacity 0, blur 20 / 26px; hover rule 0.38 / 0.22 —
  each equal to the removed utility or inline value. WI-082 step-6 grep → 0 hits. SSR markup: orb `style` has only
  `background` (+ position/transform in hover mode).
- docs owed: token-contract.md: an OutlineButton bullet listing the 16 tokens. CHANGELOG → Added:
  `--ui-outline-button-*`, `--ui-height-outline-button`, `--ui-min-w-outline-button`.

## Not done / for the orchestrator
- **Scoreboard m3 stays at 8: zero resets.** `p-0` on Button `icon`/`icon-sm`/`icon-micro`, `p-0` on the same three
  toggleOption sizes, `m-0 p-0` on the Toast viewport `<ol>`. Zero is not a spacing value, there is no DS token for it,
  and renaming it to a helper would only dodge the regex. Options for the maintainer: exclude `-0` from the scoreboard
  pattern, or add a `--ui-spacing-none` to the scale (a design call, not mine).
- Not on the scoreboard and outside the three WIs, left as is: HotkeyIndicator `menu` variant `h-6 min-h-6` (24px),
  Sheet `max-w-96` ×2 (384px; WI-059 already listed Sheet as no-token).
- `.min-w-menu` (index.css, merge-aware) duplicates the value of `.ds-min-w-menu` (menu items). Menu items could move to
  it later; not done here (DropdownMenu.tsx only had the label edit in this pass).
- WI-071 (still todo) planned `ds-progress-track`; the bar height now ships as `h-linear-progress` /
  `--ui-height-linear-progress` (same token name WI-071 chose). WI-071 should reuse it, not add the helper.


<!-- merged from _work/changes/06C2-shapes.md -->
### 06C2 — Shapes: key-based MorphRotationShape, one `createShape` factory (WI-034 → WI-115)

Agent C2, wave C. Folders: `src/components/{Shapes,MorphRotationShape,ShapeMorphSpinner,DropdownCaret}/**`.
(Resumed after a usage-limit cut; the first run wrote only this skeleton and a baseline. No code had been edited.)

Scratch (session scratchpad `c2/`): `build.cjs` (esbuild bundle of the four folders + ShapeButton from the
working tree, CJS, react external), `dump.cjs` (SSR markup: 13 shapes × 5 prop sets, spinner ×3, carets ×2,
MorphRotationShape ×3 modes = 73 lines), `compare.cjs` (before/after line diff), `leaves.cjs` (the leaf
rewrite, with `--verify`), `53-shapes-local.cjs` (the audit's 53-shapes check pointed at these bundles, plus
EightLeafClover), `probe/` (type probe), `before/`, `after/`, `*-before.txt`, `*-after.txt`.

## Checklist
- [x] Scoreboard baseline (`c2/score-before.txt`; C1 is sweeping concurrently, so compare only this lane's files)
- [x] Before-snapshot: bundle + 73-line markup dump. `shapes-serializable.mjs` on it → 3 FAIL, SSR sha1
      d5aef932fc2c / 28ba2db06d6e / 253074aea2c3 (identical to the b436647 values in WI-034 step 1)
- [x] WI-034 — `Shapes` keys in `shapes`; spinner and caret pass keys (code + ShapeKeys story)
- [x] WI-115 — `createShape` factory, clipPaths gone, `DsShapeComponent` brand (leaves rewritten by `c2/leaves.cjs`, `--verify` OK)
- [x] After-snapshot diff, serialisable check, type probe
- [x] lint, scoreboard after

## MorphRotationShape takes `Shapes` keys; the spinner and caret pass keys [WI-034, F-012]
- files: `src/components/Shapes/shapePaths.ts`, `src/components/MorphRotationShape/MorphRotationShape.tsx`,
  `src/components/ShapeMorphSpinner/ShapeMorphSpinner.tsx`, `src/components/DropdownCaret/DropdownCaret.tsx`,
  `src/components/MorphRotationShape/MorphRotationShape.stories.tsx`
- what changed:
  - shapePaths.ts: one table keyed by `Shapes` key → [component, outline], typed
    `satisfies Record<Shapes, …>`, so a new shape without a row is a compile error (the WI's array form
    could not catch that). It includes EightLeafClover. New `ShapeInput` type (a DS shape component or a
    `Shapes` key); `getShapePath` takes either and still throws for anything else; new
    `getShapeComponent(key)`. Neither is re-exported from the package (same as before).
  - MorphRotationShape: `shapes: ShapeInput[]`; the error text says "components or Shapes keys". Keys
    compare by value, so an inline key array no longer remounts the inner component. Header unchanged:
    its constraints still hold, including "Changing `shapes` remounts the inner component".
  - ShapeMorphSpinner: the default sequence is an internal key list; `SHAPE_MORPH_SPINNER_SHAPES` stays
    exported, same order, derived from the keys; `shapes?: ShapeInput[]`, default = the keys.
  - DropdownCaret: `CARET_SHAPES` are keys (`squircle`/`pixircle`, `clover`/`puff`). Header unchanged.
  - Story: `ControlledDemo` takes `MorphRotationShapeProps["shapes"]`; new `ShapeKeys` story
    (clover → puff → squircle, by key).
  - "use client" re-check (agent-rules §6): ShapeMorphSpinner and DropdownCaret now hand the client
    MorphRotationShape only strings and plain objects, so batch 04's deferred trigger 4 is gone and both
    stay neutral (no directive). shapePaths.ts and createShape.tsx have no hooks or closures, so neutral.
    MorphRotationShape keeps its directive (hooks + rAF).
- consumer impact: ShapeMorphSpinner and DropdownCaret now render from a React Server Component (before,
  Flight failed serialising the shape functions). `shapes` accepts `Shapes.*` keys as well as components.
  Drawing is unchanged.
- breaking: no (additive; both `shapes` props are under CHANGELOG [Unreleased])
- verified:
  - `shapes-serializable.mjs` on the after bundle → three PASS lines (`"cookie", "clover", "puff",
    "squircle", "pentagon", "capsule"`; `"squircle", "pixircle"`; `"clover", "puff"`), ALL PASS.
    SSR sha1 d5aef932fc2c / 28ba2db06d6e / 253074aea2c3, equal to before (drawing unchanged).
  - Markup dump: spinner ×3, caret ×2, MorphRotationShape controlled/embedded/autoplay lines byte-identical.
  - Not run: `dist-stamp-check.mjs` and Storybook (no build in this checkout; the orchestrator verifies visually).
- docs owed: usage SKILL.md (`shapes` takes components or `Shapes` keys; keys are RSC-safe);
  loading-indicators SKILL.md, both copies (the RSC bullet in WI-034 step 6); CHANGELOG [Unreleased] →
  Added: "`MorphRotationShape` / `ShapeMorphSpinner` `shapes` also accept `Shapes` keys (the RSC-safe
  form); `ShapeMorphSpinner` and `DropdownCaret` now pass keys."; the codebase skill's use-client
  "current split" can drop the ShapeMorphSpinner / DropdownCaret caveat from batch 04.

## One `createShape` factory for all 13 shapes; Figma clipPaths gone; `DsShapeComponent` brand [WI-115, F-080, F-089]
- files: new `src/components/Shapes/createShape.tsx` (not re-exported); `src/components/Shapes/BaseShape.tsx`;
  the 13 leaves `src/components/Shapes/{Arrow,Capsule,Clover,Cookie,Diamond,Double,EightLeafClover,Pentagon,Pixircle,Puff,Squircle,Star,Triple}Shape.tsx`;
  `shapePaths.ts` and `ShapeMorphSpinner.tsx` (types, as above)
- what changed:
  - Every leaf is now three statements: `import { createShape }`, the unchanged `<NAME>_SHAPE_PATH`
    constant (lines 3-4 byte-for-byte), and `export const XShape = createShape(X_SHAPE_PATH, "XShape")`.
    One render body: `<BaseShape {...props} fillColor={fillColor ?? "currentColor"}><path d/></BaseShape>`.
  - Arrow, Clover and Cookie no longer emit `<g clip-path="url(#clip…)">` wrappers or
    `<defs><clipPath id="clip0_504_97x">`. Those static ids duplicated when two were on one page.
  - Arrow, Clover, Cookie and EightLeafClover lose the redundant `fill=` on the `<path>`. The path
    inherits the same value from the `<svg style="fill:…">` that BaseIcon already sets (checked for every
    prop set: path fill == svg fill in all 20 before-lines). EightLeafClover is the maintainer's 13th
    shape and is not in the WI; it carried the same redundant attribute.
  - BaseShape.tsx: new exported type `DsShapeComponent` = `FunctionComponent<ShapeProps>` plus a
    type-only brand (a `declare const … unique symbol`; no runtime marker). `ShapeClipPath` and
    `SHAPE_VIEWBOX_SIZE` stay exported and unchanged (removing them is a public-surface trim, not this WI).
  - `ShapeInput` = `DsShapeComponent | Shapes`, so `shapes={[memo(CloverShape), …]}` or a hand-written
    component is a compile error instead of a render-time throw; the runtime throw stays.
    `SHAPE_MORPH_SPINNER_SHAPES` is typed `DsShapeComponent[]`.
- consumer impact: identical paint. Two Arrow/Clover/Cookie shapes on a page no longer share ids. The only
  possible pixel difference is a sub-pixel sliver of stroke at the 24-unit box edge that the clip used to
  trim (Arrow/Clover/Cookie with a visible stroke); the orchestrator should compare them in Storybook.
  Each shape's type is now `DsShapeComponent` (still assignable to `ComponentType<ShapeProps>`; renders as JSX).
- breaking: no. Edge only: code that calls a shape as a plain function and types the result
  `JSX.Element` now gets `ReactNode` (FunctionComponent's return type). The `shapes` narrowing is on
  unreleased props.
- verified:
  - `c2/compare.cjs` over 73 SSR lines: 53 byte-identical (the 9 other shapes × 5 prop sets, spinner,
    carets, MorphRotationShape). The 20 Arrow/Clover/Cookie/EightLeafClover lines are byte-identical once
    the clip groups, `<defs>` and path `fill=` are stripped from the before markup. ALL OK.
  - All 13 `*_SHAPE_PATH` exports equal before/after; display names unchanged; export lists identical.
  - The audit's 53-shapes check (pointed at the bundles, plus EightLeafClover): before 5 FAIL; after 27 PASS, exit 0.
  - Type probe (`c2/probe`, against the working-tree source): components, keys, mixed lists,
    `SHAPE_MORPH_SPINNER_SHAPES`, assignment to `ComponentType<ShapeProps>` and JSX use all compile;
    `memo(CloverShape)`, a hand-written component, an unknown key and an unbranded
    `ComponentType<ShapeProps>` are rejected (every `@ts-expect-error` is used) → tsc exit 0.
  - `clip0_|clip1_|ShapeClipPath|clipPath` in `src/components/Shapes` outside BaseShape.tsx → none;
    `createShape(` once in each of the 13 leaves; `ComponentType<ShapeProps>` left only in Shapes.stories.tsx.
  - `npm run lint` → exit 0. Scoreboard before → after: no metric moved.
- docs owed: codebase SKILL.md:140 (every leaf is `createShape(<NAME>_SHAPE_PATH, "<Name>Shape")`;
  `DsShapeComponent` is a type-only brand that `shapes` props require). CHANGELOG [Unreleased] → Added:
  "Type `DsShapeComponent` — the type of the DS shape components; `MorphRotationShape`/`ShapeMorphSpinner`
  `shapes` accept only these (or `Shapes` keys), so a wrapped shape is a compile error instead of a
  render-time throw." → Fixed: "`ArrowShape`, `CloverShape` and `CookieShape` no longer emit a Figma
  clipPath with a fixed `id`; two of them on one page no longer duplicate ids." (WI-057's Pentagon/Puff
  fill fix had already landed before this run, so its CHANGELOG line belongs to that record.)


<!-- merged from _work/changes/06C3-animatedtext.md -->
### 06C3 — AnimatedText: one change-text render shell; RollHoverText sr-only words

Checklist
- [x] Baseline: scoreboard + SSR probe of RollChangeText / FadeChangeText / RollHoverText (before)
- [x] One shared render shell for RollChangeText and FadeChangeText [WI-031]
- [x] RollHoverText reads its words from an sr-only copy, not aria-label [WI-086]
- [x] Verify: lint, SSR diff, scoreboard after

## Resume note
The first run was cut off after creating `ChangeSwapShell.tsx` and nothing else.
Reviewed it against the plan's step 2: same structure, classes merged with `cn`
in the same order, both `key`s and both `onAnimationEnd`s wired exactly as the
wrappers wired them, and a header contract stating that wiring invariant (a
reasonable edit — "merge the two handlers" — would break the swap). Kept as is.

## 1. RollChangeText and FadeChangeText share one render shell [WI-031, F-079]
- files:
  - `src/components/AnimatedText/ChangeSwapShell.tsx` (new, internal — not
    re-exported from `AnimatedText/index.ts` or `src/index.ts`)
  - `src/components/AnimatedText/RollChangeText.tsx`
  - `src/components/AnimatedText/FadeChangeText.tsx`
  - `src/components/AnimatedText/useChangeSwap.ts` (header only)
- what changed: the grid cell, keyed exiting copy and entering span that both
  wrappers copied line for line now live once, in `ChangeSwapShell`. Each wrapper
  is a single `<ChangeSwapShell ref {...props} outClassName inClassName />`
  render passing only its class pair (the pair goes after the spread, so a stray
  runtime prop cannot replace the wrapper's look). The drift the finding named —
  the `will-change` comment existing only in RollChangeText — is gone: the shell
  carries it once. Public names, props interfaces and `displayName`s unchanged.
- `"use client"`: the shell carries it (it calls `useChangeSwap` and wires
  handlers). Both wrappers DROP it: they now use no hooks, no browser APIs, no
  handler closures, and pass only strings to the client shell, so agent-rules
  §6 says they must not carry it. (The plan item said to keep both lines,
  deferring to the then-open directive question; that question has since been
  settled by the §6 policy, which a brief cannot override.) In dist, any chunk
  that bundles the shell is still stamped by `scripts/add-use-client.mjs`, so
  client consumers see no difference; Server Components can now render the
  wrappers as server elements with the shell as the client boundary.
- headers (same change): RollChangeText constraints gain "The render shell
  (grid cell, keyed exit, entry span) lives in `ChangeSwapShell` for the same
  reason. This file owns only the roll's look: its class pair." FadeChangeText
  constraints gain "the render shell lives in `ChangeSwapShell`; this file owns
  only the look: its class pair." useChangeSwap behavior: "The wrapper renders
  both…" → "`ChangeSwapShell` renders both in one grid cell and spreads these
  onto its two spans; the wrappers pass only their class pair." No constraint
  removed or narrowed. RevealChangeText untouched (its reduced-motion
  `transitionend` notes are unaffected; the shell holds no duration or timer).
- consumer impact: none. Rendered DOM is byte-identical (see verified).
- breaking: no.

## 2. RollHoverText exposes its words through an sr-only copy [WI-086, F-044]
- files: `src/components/AnimatedText/RollHoverText.tsx`
- what changed: the root no longer carries `aria-label={children}` (a name on a
  role-less span, which ARIA prohibits and reading-mode screen readers drop).
  Its first child is now `<span className="sr-only">{children}</span>`, the same
  pattern RollingDigitsText uses. The glyph spans, their `aria-hidden` and every
  `ds-roll-hover*` class are unchanged, so the index.css rules select the same
  elements (none of them use child/first-child selectors).
- consumer impact: in body copy the phrase is now read as part of the sentence.
  CTAButton's link (and any Button wrapping RollHoverText) is still named by the
  text — now via name-from-content instead of the label. Layout unchanged:
  `sr-only` is clipped and out of flow. A consumer-passed `aria-label` still
  spreads onto the root as before.
- breaking: no (patch).

## Verified
- `npm run lint` (tsc --noEmit) → exit 0.
- Before/after render probe (scratchpad, esbuild-bundled from `src/`, no build
  in this checkout), three prop sets per wrapper (up + className + style;
  defaults; down + id/data-/aria- props + style overriding `--ds-roll-dir` +
  element child):
  - real `renderToStaticMarkup` at rest: Roll/Fade output identical before vs
    after;
  - with `useChangeSwap` stubbed to a mid-flight swap: identical markup with
    `ds-*-change-out` / `ds-*-change-in` applied, AND an element-tree dump
    (wrappers expanded through their render functions) identical — same keys
    (`out-7`, content key), same `onAnimationEnd` handler on each span, same
    forwarded ref on the root.
  - RollHoverText: before `<span aria-label="Deploy now" class="ds-roll-hover"…`,
    after `<span class="ds-roll-hover" style="--ds-roll-dir:1"><span
    class="sr-only">Deploy now</span>…`; the rest of the markup unchanged.
- `inline-grid overflow-hidden` appears in code once (ChangeSwapShell.tsx);
  `ChangeSwapShell` absent from `AnimatedText/index.ts` and `src/index.ts`;
  no `aria-label` left in RollHoverText.tsx.
- Scoreboard: `"use client"` files 28 → 27 for this change (shell +1, two
  wrappers −2; read 29 at resume because the unused shell was already on disk).
  No other metric moved.
- Not done here (orchestrator): Storybook check that roll/fade swaps still
  animate both directions, and that the body-copy story's accessibility tree
  reads the full sentence and CTAButton links keep their names.

## Docs owed
- `.agents/skills/dooph-ds-codebase/SKILL.md`: name `ChangeSwapShell.tsx` beside
  `useChangeSwap.ts` as the shared internal render shell, and list it with the
  non-re-exported internals ("each wrapper owns only its class pair and
  keyframes"). Note RollChangeText/FadeChangeText no longer carry `"use client"`.
- CHANGELOG (patch): RollHoverText's text is now exposed through a visually
  hidden copy instead of `aria-label`, so screen readers read it in the flow of
  surrounding text.


<!-- merged from _work/changes/06C4-build-packaging.md -->
### 06C4 — Build, packaging, licence, tooling (WI-002, WI-005, WI-038, WI-040, WI-039)

Checklist:
- [x] Scoreboard before
- [x] Scratch worktree `../ds-wi-c4` baseline build + pack (before)
- [x] One CSS emit step: scripts/emit-css.mjs [WI-002]
- [x] Tooling nits: release workflow, icon-barrel header, build:watch, color.ts [WI-005] (Storybook font item skipped: outside this lane)
- [x] THIRD_PARTY_NOTICES.md ships with licence texts [WI-038] (svgPath.ts provenance line skipped: outside this lane)
- [x] init-skills off a TTY + --yes [WI-039]
- [x] Tarball: no stubs, no CJS maps, shifted maps [WI-040]
- [x] After build + pack, compare; lint; scoreboard after
- [x] Worktree removed

Scoreboard before: motion 0, arbitrary px 18, numeric spacing 36, raw var 5, focus 3, disabled 2, use client 28, JS timers 5, onValueChange 0, default exports 0.

## Baseline (before) — scratch worktree build

The worktree was made at HEAD (b436647), then the working-tree `src/**` and `scripts/**` of that moment were copied in (so it builds with WI-033's add-use-client prologue scan), with this agent's files left at HEAD. `npm ci` + `npm run build` succeeded (node 24.19.0, npm 11.17.0; stamp: 56 chunks from 28 client modules). The after build used the same `src/**`, with only this lane's files synced in.

- `dist/styles.css` sha1 `b1da5c5f6ae9f3c623cac63fdbc51e1849fc2898`; `dist/theme.css` sha1 `003908677f06622821f2af3a510ab551bbcee1f6`.
- `npm pack --dry-run --json`: total 2579 files; per-module stubs 512; stub maps 512; CJS maps 513; `.d.ts`/`.d.cts` 514; THIRD_PARTY_NOTICES 0.
- `dist/*.cjs.map` 257; `dist/*.cjs` with a `sourceMappingURL` 257.
- Consumer smoke (tarball extracted into a temp `node_modules`): ESM import 327 exports, CJS require 327 exports.
- Stamped chunk maps: the WI's "mappings starts with ';'" check reports 0 unshifted even before the fix, because every ESM chunk opens with import lines that carry no mapping — so it cannot see the bug. By eye: in `chunk-2776OVOX.js` the first mapping (11 leading `;` → generated line 12) lands on the `// src/...` comment, one line above the `import {` it belongs to.

## One CSS emit step (WI-002) [F-077]

- **Files:** `scripts/emit-css.mjs` (new), `scripts/copy-theme.mjs` (deleted — a plain delete + new file, since agents may not `git mv`; the maintainer can stage it as a rename), `tsup.config.ts`, `package.json`.
- **What changed:** the Tailwind compile and the theme.css copy now live only in `scripts/emit-css.mjs`. tsup's `onSuccess` runs it (`emitCssAssets()` and its `copyFileSync`/`resolve` imports are gone), and `build:css` is now `node scripts/emit-css.mjs`. The `copy-theme` npm script is removed. The tsup comment says both paths go through the one script.
- **Consumer impact:** none — the shipped CSS is byte-identical.
- **Breaking:** no. (Repo-internal: `npm run copy-theme` no longer exists; `build:css` covers it.)
- **Verified:** scratch build → `dist/styles.css` and `dist/theme.css` sha1 equal the baseline; then deleted both and ran `npm run build:css` → the same two hashes again.
- **Docs owed:** `.agents/skills/dooph-ds-codebase/SKILL.md` lines 112, 594, 599 still name `copy-theme` (use WI-002 step 3's wording).

## Tooling nits (WI-005) [F-119]

- **Files:** `.github/workflows/release-package.yml`, `scripts/generate-icon-exports.mjs`, `src/components/Icons/index.ts` (regenerated by the script, not hand-edited), `package.json`.
- **What changed:**
  - Release workflow: removed the separate `Build` step (`npm publish` runs `prepublishOnly` → `npm run build`, so a release builds once and still fails on a build error). The trusted-publisher note now names the repo `dooph.-Design-System` (what `git remote -v` shows). Deleted the obsolete "TOKEN FALLBACK below" line (no such step exists).
  - Icon barrel header now reads `// AUTO-GENERATED by scripts/generate-icon-exports.mjs. Do not edit by hand.` — `git diff src/components/Icons/index.ts` shows only that line.
  - `build:watch` runs the three generators, then tsup `--watch` through the same node/heap invocation as `build:js`.
  - `src/utils/color.ts`: no edit needed. The colour-mechanism work had already rewritten its header to list every consumer (Slider*, LinearProgressIndicator, Sticker, AIModelSelect, LoadingSpinner, ProgressIndicator/AIContextGauge, ShapeMorphSpinner), which matches the files that import it.
- **Consumer impact:** none.
- **Breaking:** no.
- **Verified:** lint 0; `grep "TOKEN FALLBACK|Repo: dooph-Design-System" .github` → none. `build:watch` was not started (long-running watcher); it is the `build` generator chain plus `--watch`.
- **Skipped:** the unused IBM Plex Sans font request in `.storybook/preview-head.html` (item c) — that file is outside this lane. Still present at line 10.
- **Docs owed:** codebase SKILL.md:29-32 and architecture SKILL.md:78 colour-consumer lists.

## Third-party notices ship (WI-038) [F-056]

- **Files:** `THIRD_PARTY_NOTICES.md`, `package.json` (`files`).
- **What changed:**
  - Dependency table gains `@radix-ui/react-popover`, `-progress`, `-slider` → 14 rows, matching `dependencies` (11 `@radix-ui/` rows).
  - Under shape-morph: the full MIT licence, verbatim from `https://raw.githubusercontent.com/Thereallo1026/shape-morph/f4d2697/LICENSE` (fetched 2026-10-03; byte-compared after insertion).
  - New closing `## Apache License 2.0` section: verbatim `https://www.apache.org/licenses/LICENSE-2.0.txt` (fetched 2026-10-03, sha1 `2b8b815229aa8a61e483fb4ba0588b8b6c491890`; byte-compared after insertion; its terms also match androidx's own `LICENSE.txt`, which omits only the appendix). The androidx entry links to it.
  - NOTICE check: androidx has no NOTICE file at the repo root, `graphics/graphics-shapes`, `compose/animation/animation-core` or `compose/material3/material3` (GitHub, androidx-main). Recorded under the androidx entry, so no Apache §4(d) attribution lines are owed.
  - `files` gains `"THIRD_PARTY_NOTICES.md"`.
- **Consumer impact:** the tarball now carries the notices file (+1 file).
- **Breaking:** no.
- **Verified:** `npm pack --dry-run` lists THIRD_PARTY_NOTICES.md (1); "Permission is hereby granted" 1; "Apache License" ≥ 1; `^| @radix-ui/` 11; table rows 14.
- **Skipped:** WI-038 step 4, the provenance line in `src/components/MorphRotationShape/engine/svgPath.ts` (` * Ported from AOSP androidx.graphics.shapes (Apache 2.0). See THIRD_PARTY_NOTICES.md.`) — outside this lane.
- **Docs owed:** CHANGELOG [Unreleased] → Fixed: "The npm package now ships THIRD_PARTY_NOTICES.md with the shape-morph MIT notice and the Apache 2.0 licence for the vendored morph engine."

## init-skills off a terminal, plus --yes (WI-039) [F-057]

- **Files:** `bin/init.mjs` (prompt block + usage comment; written by the previous C4 run, checked against the WI's code).
- **What changed:** answers are queued from readline `line` events, and every waiting prompt settles with the default on `close`, so piped or closed stdin no longer exits 0 mid-prompt having copied nothing. `--yes`/`-y` answers every prompt `y` without reading stdin.
- **Consumer impact:** `npx … init-skills` with no terminal now installs into all three directories (the documented default) instead of silently doing nothing; new `--yes` flag.
- **Breaking:** no.
- **Verified** (fresh temp dir each, then removed): `< /dev/null` → `.agent .agents .claude`, 3 ✓, exit 0; `y n n` piped → `.agents` only; `n n n` → "Nothing selected.", dir empty; `--yes < /dev/null` → all three, prompts print `y (--yes)`. All exit 0. `rl.question` no longer appears. The interactive (real terminal) run could not be exercised from an agent.
- **Docs owed:** README after :56 (`--yes`, and the no-terminal default); CHANGELOG Added "`init-skills --yes`." and Fixed "`init-skills` no longer exits 0 having installed nothing when stdin is not a terminal."

## Leaner tarball, aligned maps (WI-040) [F-104]

- **Files:** `package.json` (`files`), `scripts/add-use-client.mjs` (map shift only, on top of the prologue-scan work already there), `tsup.config.ts`.
- **What changed:**
  - `files` negations keep the per-module `.js`/`.cjs` stubs and their maps under `dist/components/**` and `dist/utils/**`, and every `*.cjs.map`, out of the tarball. Mechanism used: `files` negation (npm 11.17.0 honours it locally; CI's npm 11.5.1 was not run, since nothing may be installed).
  - The stamp now shifts each stamped file's paired `.map` by one generated line (a `;` prefix). Header comment step 3 says so.
  - tsup `onSuccess` deletes every `dist/**/*.cjs.map` and strips the trailing `//# sourceMappingURL=….cjs.map` from every `.cjs`. The strip is not line-anchored: empty chunks are `"use strict";//# sourceMappingURL=…` on one line, and the first version missed 38 of those. ESM maps stay (`sourcemap: true`, comment updated).
- **Consumer impact:** tarball 2579 → 1299 files. No supported import changes (`exports` exposes only `.`, `./styles.css`, `./theme.css`). `require` users lose CJS maps that mapped each file to itself. Stack traces through stamped ESM chunks now line up.
- **Breaking:** no.
- **Verified** (scratch worktree, same src as baseline):
  - `npm pack --dry-run`: total 1299 (2579 − 512 stubs − 512 stub maps − 257 top-level CJS maps + 1 notices); stubs 0, stub maps 0, CJS maps 0, `.d.ts` 514 (unchanged).
  - `dist/**/*.cjs.map` 0; `.cjs` files with a sourceMappingURL 0.
  - `docs/audit/_work/scratch/C1/dist-stamp-check.mjs` → PASS (ESM 28/28, CJS 28/28).
  - Map alignment: the 13 stamped ESM chunks whose names didn't change have mappings exactly `;` + baseline. A decoder check (does the identifier at each of the first mapped positions match the source identifier?) gives 28/28 stamped ESM chunks aligned after; the same check with the shift removed gives 0/28, so it discriminates. (15 chunk names changed because the regenerated icon-barrel header changes their content hash.)
  - Consumer smoke from the packed tarball (extracted into a temp `node_modules`): ESM import 327 exports, CJS require 327 — same as baseline.
- **Docs owed:** CHANGELOG [Unreleased] → Fixed: the tarball no longer ships unreachable per-module stubs or self-referencing CJS maps, and stamped chunks' source maps are aligned.

## Overall

- `npm run lint` → exit 0.
- Scoreboard after: motion 0, arbitrary px 18, numeric spacing 36, raw var 5, focus 3, disabled 2, use client 27, JS timers 5, onValueChange 0, default exports 0. Only "use client" moved (28 → 27), from another agent's src work — this lane touched no component source.
- `copy-theme` now appears only in `.agents/skills/dooph-ds-codebase/SKILL.md` (docs owed) and docs.
- Scratch worktree `../ds-wi-c4` and its `../ds-wi-c4-*.log` files removed.


### Orchestrator follow-ups (outside C4 lane)
- WI-005 (c): removed the IBM Plex Sans family segment from `.storybook/preview-head.html` (nothing referenced Plex). The other families are untouched.
- WI-038 step 4: added the AOSP androidx.graphics.shapes (Apache 2.0) provenance line to `MorphRotationShape/engine/svgPath.ts`, above `## behavior`, so the contract is untouched.
- Lint exits 0.

<!-- merged from _work/changes/06C5-calendar-labels.md -->
### 06C5 — Calendar & DatePicker element access; overridable accessible names

Checklist:
- [x] Calendar `forwardRef` + root rest props; DatePicker `triggerProps` / `contentProps` [WI-109]
- [x] Calendar/DatePicker/CalendarCaption `labels` (month arrows) [WI-101]
- [x] Toast `closeLabel` + export `ToastOptions` [WI-101]
- [x] Slider `aria-labelledby` / `aria-describedby` on the thumb [WI-101]
- [x] VerificationCodeInput `digitLabel` [WI-101]
- [x] lint, scoreboard, type probe, render script


## Calendar and DatePicker: reach the element, label the trigger, place the panel [WI-109, F-039]

- **files:** `src/components/Calendar/Calendar.tsx`, `src/components/DatePicker/DatePicker.tsx`
- **what changed:**
  - `Calendar` now forwards `ref` to its root `<div>` and spreads the div's other props (`id`, `aria-*`, `data-*`, `style`, handlers) onto it. Its own `data-mode`, `className` merge (consumer class last) and Escape handler are written after the spread, so a consumer can't override them by accident. A consumer `onKeyDown` runs first; if it calls `preventDefault()`, the pending-range-anchor reset is skipped. The div's native `onSelect` / `defaultValue` are left out of the type, so a pre-v6 `onSelect` is still a type error and never becomes a DOM handler. `value` / `onValueChange` are kept off the root. The ref goes through the validating outer `Calendar` (batch 02's "invalid value renders nothing") to the inner view.
  - `DatePicker` takes `triggerProps` (spread first onto the trigger button: `id` for `<label htmlFor>`, `aria-*`, handlers, `className`) and `contentProps` (spread onto `PopoverContent`: `align`, `side`, `sideOffset`, `aria-*`, `className`). The picker still owns the trigger's `mode` / `value` / `disabled` / `today` / `locale`; the type omits them. On the plain triggers the class is `cn(className, triggerProps.className)`; on the split trigger the picker's `className` stays on the split container and `triggerProps.className` goes on the button.
- **consumer impact:** additive. Nothing renders differently unless the new props are passed.
- **breaking:** no
- **verified:** see Verification below.
- **docs owed:** codebase SKILL Calendar row (append "`ref` + `<div>` rest props on the root") and DatePicker row (append "`triggerProps` (trigger button) and `contentProps` (PopoverContent)"); usage SKILL dates paragraph (label the trigger with `triggerProps={{ id }}` + `<label htmlFor>`, place the panel with `contentProps={{ align: "end" }}`, Calendar takes `ref`/`id`/`aria-*`); CHANGELOG `### Added`: "`DatePicker` `triggerProps` / `contentProps`; `Calendar` forwards `ref` and root `<div>` props."

## Overridable accessible names [WI-101, F-090]

- **files:** `src/components/Calendar/CalendarCaption.tsx`, `src/components/Calendar/Calendar.tsx`, `src/components/Calendar/index.ts`, `src/components/DatePicker/DatePicker.tsx`, `src/components/Toast/Toast.tsx`, `src/components/Slider/Slider.tsx`, `src/components/VerificationCode/VerificationCodeInput.tsx`
- **what changed:**
  - Month arrows: new `labels?: { previousMonth?, nextMonth? }` on `CalendarCaption`, `Calendar` and `DatePicker` (passed down). Defaults stay "Previous month" / "Next month". New exported type `CalendarLabels` (from the Calendar barrel, so from the package root).
  - Toast: `ToastOptions` is now exported from `Toast.tsx` and gains `closeLabel` (accessible name of the simple/prominent/danger close X; default "Close"). `dismissLabel` got a doc comment.
  - Slider: `aria-labelledby` and `aria-describedby` are taken out of the rest props and put on the `role="slider"` thumb instead of the role-less Root span. The thumb's "Value" fallback name now applies only when there is neither `aria-label` nor `aria-labelledby`. Covers `SliderContinuous`, `SliderStepped`, `SliderLabeled` (all render `SliderBase`).
  - VerificationCodeInput: new `digitLabel?: (index, length) => string` for each cell's name; default stays `Digit N of M`. It's destructured, so it never reaches the DOM. The header contract is unaffected (a label prop, not a layout).
- **consumer impact:** every new prop is optional with today's English default, so markup is unchanged when none is passed. One deliberate change: a Slider given `aria-labelledby` / `aria-describedby` now has them on the thumb (where assistive tech reads them), not the Root span, and that thumb no longer also says "Value".
- **breaking:** no
- **verified:** see Verification below.
- **NOT done — outside C5's lane:** `src/components/Toast/index.ts` needs `ToastOptions,` added to its `export type { … } from "./Toast"` list (after `ToastDescriptionProps,`). Until then `ToastOptions` is exported from the module but NOT from the package root, and WI-101's done_when ("`ToastOptions` imports from the package root") isn't met. It's a one-line edit for the orchestrator.
- **docs owed:** CHANGELOG `### Added`: "Overridable accessible names: `labels` on `Calendar`/`DatePicker`/`CalendarCaption` (month arrows), `closeLabel` on `toast()` options, `digitLabel` on `VerificationCodeInput`; `ToastOptions` and `CalendarLabels` are exported." `### Fixed`: "Slider `aria-labelledby` / `aria-describedby` now land on the `role=\"slider\"` thumb, which no longer falls back to the name \"Value\" when labelled by reference."

## Verification

- `npm run lint` → exit 0.
- Scoreboard after: motion 0, arbitrary px 18, numeric spacing 36, raw var 5 (all in Slider's thumb class, untouched), focus 3, disabled 2, "use client" 29, timers 5, value callbacks 0, default exports 0. C5's edits add no class strings, motion, timers or `"use client"`, so no number moved because of them. (The pre-resume agent recorded no "before" figure.)
- Type probe (scratchpad `c5/probe.tsx`, tsc against `src`) → 0 errors. It covers: Calendar `id`/`aria-label`/`ref`/`labels`/`onKeyDown`; DatePicker `labels`/`triggerProps`/`contentProps`; CalendarCaption `labels`; Slider `aria-labelledby`/`aria-describedby`; VerificationCodeInput `digitLabel`; `ToastOptions` with `closeLabel` (imported from the module). Two `@ts-expect-error` cases still error as they should: Calendar `onSelect`, and `triggerProps.value`.
- SSR check (scratchpad `c5/check.cjs`, esbuild bundle of `src`, react-dom/server) → ALL PASS, 21 checks. It ports all of `wi-c6-09-check.cjs` (Calendar labels, Slider thumb ×6, digitLabel) and `render.cjs` case 07 (Calendar root props, DatePicker `triggerProps`) to the value/onValueChange names. It also checks: CalendarCaption labels, Calendar keeps its own `data-mode` with the consumer class last, `value` is not on the root, triggerProps on the range and split triggers with the split container keeping `className`, and no React unknown-prop warnings.
- Default-name grep: every "Previous month" / "Next month" / "Close" / `Digit ${index` is the right side of a `??`, the `defaultDigitLabel` template, or a doc comment.
- NOT verified here (no Browser pane, no build, per the brief): the ref attaching in a live DOM; Escape still clearing a pending range anchor; a toast shown with `closeLabel`; `contentProps` placing an open panel. These need the orchestrator's Storybook pass.


### Orchestrator follow-up
- Added `ToastOptions` to the type re-exports in `src/components/Toast/index.ts`. `src/index.ts` re-exports the Toast barrel, so it is now importable from the package root. Lint exits 0.

<!-- merged from _work/changes/06D1-focus-disabled.md -->
### 06D1 — One focus ring and one disabled look (WI-062, WI-066, WI-067, WI-075, WI-125 rest)

Agent D1, wave D. Record written as I go.

## Checklist
- [x] WI-062 focus rings (Tabs, CodeDigitInput, ShapeButton, Checkbox press tokens)
- [x] WI-066 disabled looks via data-disabled (CalendarPresetItem, SearchBox, CodeDigitInput)
- [x] WI-067 disabled mechanism collapse (caret double fade, Input, DropdownTrigger, toggleOption, AIPromptInput, SplitButton, ShapeButton)
- [x] WI-075 DS-set state from data attributes (CodeDigitInput, CalendarPresetItem, CalendarGrid, AIToolPart, AIPromptInput header, HotkeyIndicator)
- [x] WI-125 last helper: delete ds-disabled-control

## Scoreboard before
- hand-rolled focus rings: 3 (Checkbox 2, CodeDigitInput 1)
- hand-rolled disabled looks: 2 (Menu/DropdownMenu.tsx 2 — `data-disabled:opacity-100!`, not a file my WIs name)

## Entries

### TabsContent and every CodeDigitInput cell show a keyboard focus ring; ShapeButton's ring hides when disabled; Checkbox press ring gets its own tokens [F-018, WI-062]
- files: `src/components/Tabs/Tabs.tsx`, `src/components/VerificationCode/CodeDigitInput.tsx`,
  `src/styles/dooph-component-tokens.css`, `src/components/Checkbox/Checkbox.tsx` (code + header),
  `src/styles/tokens.css`; generated by `npm run sync-tokens`: `src/styles/index.css` block,
  `src/styles/theme.css`, `src/utils/twMergeTheme.ts`
- what changed:
  - TabsContent: `focus-visible:outline-none` → `ds-focus-visible-ring`.
  - CodeDigitInput: the box-shadow ring (`focus-within:shadow-focus-prominent`) → the Input
    wrapper's outline helpers: `ds-focus-within-ring` on every enabled cell, plus
    `ds-focus-within-ring-danger` on an errored one. The prominent border on focus stays for
    non-error cells.
  - `.ds-shape-button-focus-visible` keeps its 2px offset ring but gains the shared disabled
    exclusions (`:not(:disabled):not([data-disabled]):not([aria-disabled="true"])`), with a
    comment naming it the offset variant for organic shapes.
  - New tokens `--ui-shadow-press-prominent` / `--ui-shadow-press-primary` (aliases of the two
    focus shadows) → utilities `shadow-press-*`. Checkbox's `:active` ring uses them instead of
    `shadow-focus-*`. Header wording updated to name the press shadow.
- consumer impact: tabbing onto a tab panel now shows the prominent ring; an errored code cell
  shows the danger ring (before: nothing). A disabled ShapeButton no longer shows the ring after
  programmatic focus. Checkbox press look unchanged. Two new shadow tokens/utilities.
- breaking: no
- skipped: the `.dark` re-declaration of the press tokens. WI-061's `.dark` alias group does not
  exist (WI-061 is waiting on the maintainer's dark-theme overhaul), and the focus shadows they
  alias aren't re-declared in `.dark` either, so the press tokens behave exactly like the focus
  shadows do today. Fold them into WI-061 when it runs.
- verified: `rg "shadow-focus-(prominent|primary)|focus-visible:outline-none" src/components`
  (tsx, no stories) → only `Modal/dialogShell.tsx` (the tabIndex −1 dialog fallback, compliant).
  sync-tokens generated `--shadow-press-prominent/-primary` in index.css + theme.css and the
  twMerge scale. Lint: see end.
- docs owed: CHANGELOG `[Unreleased]` → Fixed: "TabsContent and errored CodeDigitInput now show
  a focus ring; ShapeButton's ring is hidden when disabled." Added: "`--ui-shadow-press-prominent`,
  `--ui-shadow-press-primary` (`shadow-press-*`)." `.agents/skills/dooph-ds-contribution/SKILL.md`
  helper list: add "`ds-shape-button-focus-visible` (offset variant for organic shapes)";
  `.agents/skills/dooph-ds-codebase/SKILL.md` focus-helper bullet to match. Theming
  token-contract: list the two press tokens.

### Disabled CalendarPresetItem, SearchBox and CodeDigitInput now look disabled [F-026, WI-066]
- files: `src/components/Calendar/CalendarPresetsPanel.tsx`, `src/components/SearchBox/SearchBox.tsx`,
  `src/components/VerificationCode/CodeDigitInput.tsx` (code + header)
- what changed:
  - CalendarPresetItem emits `data-disabled` when `disabled`, so `menuItemClassName`'s existing
    `ds-radix-data-disabled` and `data-disabled:hover/active:bg-transparent` rules apply.
  - SearchBox destructures `disabled`, puts `data-disabled` on the wrapper, guards the hover
    border with `[&:not([data-disabled])]`, adds `ds-radix-data-disabled` + the disabled surface
    and border (`data-[disabled]:bg-secondary-disabled`, `…:border-secondary-border-disabled`),
    and passes `disabled` on to the `<input>` (it already reached it through `...props`).
  - CodeDigitInput: the cell `<div>` carried `ds-disabled-state`, which can never match a div;
    now `ds-radix-data-disabled` plus `data-disabled` on the cell. Header updated to say so.
- consumer impact: these three now fade to the disabled opacity with a not-allowed cursor when
  disabled (SearchBox also gets the disabled surface; the preset no longer hovers). Enabled
  rendering unchanged. New `data-disabled` attribute on the preset button, the SearchBox wrapper
  and the code cell.
- breaking: no
- verified: `rg ds-disabled-state CodeDigitInput.tsx` → 0 hits. Lint/type check at end.
- docs owed: CHANGELOG `[Unreleased]` → Fixed: "Disabled CalendarPresetItem, SearchBox and
  CodeDigitInput now render the DS disabled state."

### Disabled looks use one mechanism per control [F-026, F-061, WI-067]
- files: `src/styles/index.css` (DropdownCaret block, hand-written part), `src/components/Input/Input.tsx`,
  `src/components/DropdownTrigger/DropdownTrigger.tsx`, `src/components/Toggle/toggleOption.ts`
  (code + header), `src/components/Toggle/fancyToggleOption.ts` (code + header),
  `src/components/AIChat/AIPromptInput.tsx`, `src/components/SplitButton/SplitButton.tsx`,
  `src/components/ShapeButton/ShapeButton.tsx`
- what changed:
  - DropdownCaret chevron: the disabled rule is split. The chevron colour still changes on every
    disabled host; its opacity fade now applies only to a host WITHOUT `ds-disabled-state`
    (TypeableDropdownTrigger, whose surface stays opaque). DropdownTrigger fades as a whole, so
    its chevron is no longer faded twice. (The WI put the `:not(.ds-disabled-state)` on the whole
    rule; that would also have dropped the chevron's disabled colour on DropdownTrigger, a white
    chevron on a light-grey caret, so the colour stays in its own unguarded rule.)
  - Input (wrapper variants) and TypeableDropdownTrigger: the `disabled ? … : […]` class ternary
    → `data-[disabled]:` utilities reading the `data-disabled` both already emit; the hover lift
    is guarded with `:not([data-disabled])`. Bare text Input hover → `enabled:hover:` (shadow) and
    `enabled:hover:not-focus:` (border). Deviation from the WI: plain `enabled:hover:` raises the hover
    border to 0,3,0, which would beat `focus:border-input-border-focus` (0,2,0) and show the hover
    border on a focused + hovered input; before, focus won by coming later in the sheet. `not-focus:`
    keeps that. Checked in a scratch Tailwind compile (selector order and output).
  - Input deviation from the WI: the disabled BORDER stays behind `!hasError`, so a disabled +
    errored wrapper Input keeps the danger border it shows today (the error classes came later in
    `cn`). The WI's form would have switched it to the disabled border, a visible change.
  - toggleOption (Tabs/ToggleSwitch options), fancyToggleOption (FancyToggleSwitch options) and
    AIPromptInput's textarea: `ds-disabled-control` → `ds-disabled-state`. Both toggle headers say
    so. Nothing in them sets `aria-disabled`, so the result is identical.
  - SplitButtonAction / SplitButtonTrigger: `hover:enabled:` / `active:enabled:` → Button's guard
    `[&:not(:disabled):not([aria-disabled=true])]:hover:` / `:active:`.
  - ShapeButton fill: `group-hover:` / `group-active:` → `[.group:not(:disabled):not([aria-disabled=true]):hover_&]:`
    / `…:active_&]:`, and `group-disabled:` → `[.group:is(:disabled,[aria-disabled=true])_&]:`
    (the selectors its shadow helper already uses). Note: the arbitrary group variant has no
    `@media (hover:hover)` wrapper, matching the shadow helper, unlike the old `group-hover:`.
  - DropdownTrigger's open-ring comment no longer names the deleted `ds-focus-ring` (WI-125 step 3).
- consumer impact: a disabled DropdownTrigger's chevron shows at the root's 0.6 opacity instead
  of 0.36 (0.5 vs 0.25 dark) — the one deliberate visible change, matching TypeableDropdownTrigger.
  A disabled bare Input no longer lifts on hover. An `aria-disabled` SplitButton part or
  ShapeButton no longer paints hover/press colours, and an `aria-disabled` ShapeButton gets its
  disabled fill. Everything else renders the same.
- breaking: no
- verified: `rg "disabled\s*\?\s*\"cursor-not-allowed|ds-disabled-control|hover:enabled|group-hover:text|group-disabled:" src/components`
  (no stories) → one hit, `OutlineButton.tsx:147 group-disabled:!opacity-0`, which is not a file
  WI-067 names (reported, not touched). Generated-rule check: see the Tailwind compile below.
- docs owed: CHANGELOG `[Unreleased]` → Fixed: "DropdownTrigger no longer fades its chevron twice;
  disabled bare Input no longer lifts on hover; aria-disabled SplitButton/ShapeButton no longer
  react to hover." `.agents/skills/dooph-ds-codebase/SKILL.md` disabled-helper bullet: drop
  `ds-disabled-control` (removed below).

### Five components style their own state from the data attributes they emit [F-061, WI-075]
- files: `src/components/VerificationCode/CodeDigitInput.tsx`, `src/components/Calendar/CalendarPresetsPanel.tsx`,
  `src/components/Calendar/CalendarGrid.tsx` (+ JSDoc), `src/components/AIChat/AIToolPart.tsx` (code + header),
  `src/components/AIChat/AIPromptInput.tsx` (header only), `src/components/HotkeyIndicator/HotkeyIndicator.tsx`
- what changed:
  - CodeDigitInput: the `hasError ? … : …` cell ternary → `group/code-digit` + `data-[error]:text-danger-primary`
    and `[&[data-error]:not([data-disabled])]:border-danger-primary` (the error border still yields
    to the disabled border). Glyph: `opacity-0 group-data-[filled]/code-digit:opacity-100` and
    `group-data-[error]/code-digit:text-danger-primary`. The `hasError`-keyed focus-ring classes
    stay JS (they toggle package `ds-*` classes). Header stays true.
  - CalendarPresetItem: `isActive && "bg-ghost-active"` → `[:where(&[data-active])]:bg-ghost-active`.
    Deviation from the WI's `data-[active]:bg-ghost-active`: that is 0,2,0 and Tailwind emits it AFTER
    menuItemClassName's `hover:bg-ghost-hover`, so a hovered active preset would have switched from
    ghost-hover to ghost-active (verified in a scratch compile). The `:where()` form has zero
    specificity, so hover / press / disabled fills still win exactly as they did over the plain class.
  - CalendarGrid: band fill → `data-[range=middle]:bg-ghost-active`; outside-month label →
    `group-data-[range=none]/day:data-[outside]:text-ghost-fg group-data-[range=middle]/day:data-[outside]:text-ghost-fg`
    (scoped so an outside ENDPOINT keeps `text-primary-fg`). JSDoc above `CalendarGrid` lists
    `data-range`, `data-today`, `data-outside` as consumer styling hooks.
  - AIToolPart: root gains `group/tool`; label → `text-ghost-fg group-data-[state=error]/tool:text-danger-primary`.
    Header `## behavior` gains a line naming `data-state` / `data-variant` as styling hooks.
  - AIPromptInput: header `## behavior` documents the form's `data-state` / `data-disabled` as
    consumer styling hooks (attributes kept; dropping them would be a DOM change).
  - HotkeyIndicator: root emits `data-pressed` and carries `group/hotkey`; each key reads it via
    `group-data-[pressed]/hotkey:bg-ghost-active …:border-border-primary`. The file has changed
    since the WI (a `menu` variant): pressed still overrides both variants' surface and border,
    and the variant choice stays a prop ternary (it is a consumer prop, not DS-set state).
- consumer impact: computed paint is meant to be identical. New public hook: `data-pressed` on
  HotkeyIndicator's root. AIToolPart, AIPromptInput and CalendarGrid now document their `data-*`
  attributes as styling hooks.
- breaking: no
- skipped: step 2 (the "DS-set state uses the same idiom" text in the architecture skill) — docs
  deferred, listed below.
- verified: the WI's ternary `rg` → 0 hits; the reader `rg` → hits in all five components
  (HotkeyIndicator 1, CalendarPresetsPanel 1, CalendarGrid 2, CodeDigitInput 3, AIToolPart 1).
  The 16-row before/after browser probe was not run (no Browser pane / build in this wave); the
  Tailwind compile below confirms each new selector is generated.
- docs owed: `.agents/skills/dooph-ds-architecture/SKILL.md` Rule 2 — insert the "DS-set state
  uses the same idiom" subsection from WI-075 step 2 verbatim. CHANGELOG `[Unreleased]` → Added:
  "`HotkeyIndicator` sets `data-pressed` on its root when `pressed`." Changed: "AIToolPart,
  AIPromptInput and CalendarGrid document their `data-*` attributes as styling hooks."

### `ds-disabled-control` helper removed [F-076, WI-125 — completes it]
- files: `src/styles/dooph-component-tokens.css`, `src/components/DropdownTrigger/DropdownTrigger.tsx`
  (comment, done with WI-067), `src/components/DropdownTrigger/DropdownTrigger.stories.tsx` (doc comment)
- what changed: deleted the `.ds-disabled-control:disabled` rule and its comment (no user left
  after WI-067: confirmed with `rg ds-disabled-control src` → only the rule itself). The open-ring
  comment in dooph-component-tokens.css and DropdownTrigger.tsx now say `data-[state=open]:<any ds-* class>`
  / `ds-*` instead of naming the already-deleted `ds-focus-ring`; the TypeableOpen story doc says
  `ds-focus-ring-on-open`.
- consumer impact: a consumer who put `ds-disabled-control` on their own markup loses the
  disabled fade (silent: no compile error).
- breaking: yes — v6: `ds-disabled-control` → `ds-disabled-state` (covers `:disabled` and
  `[aria-disabled="true"]`). Detection: `rg -n 'ds-disabled-control([^-\w]|$)'`.
- not done (other agent's folder): `src/components/DatePicker/DatePickerTrigger.tsx:61` comment
  still says `` `data-[state=open]:ds-focus-ring` `` → should read `` `data-[state=open]:ds-*` ``
  (D3's folder).
- verified: `rg -e 'ds-focus-ring([^-\w]|$)' -e ds-my-ui-xs -e ds-disabled-control src` → only
  that DatePickerTrigger comment.
- docs owed: `.agents/skills/dooph-ds-codebase/SKILL.md` — delete the `ds-disabled-control`
  bullet. v6 migration skill, "Removed `ds-*` helpers" (silent bucket): row `ds-disabled-control`
  → `ds-disabled-state`, with the detection pattern above. CHANGELOG `[Unreleased]` → Removed:
  "`ds-disabled-control` utility class (unused)". Mark WI-125 done in REMEDIATION.md.

## Verification (all items)
- `npm run lint` → exit 0.
- Scoreboard before → after: hand-rolled focus rings 3 → 0; hand-rolled disabled looks 2 → 2
  (both in `Menu/DropdownMenu.tsx`, a file none of my WIs name — see below); every other count unchanged.
- Scratch Tailwind compile (`tailwindcss -i src/styles/index.css -o <scratchpad>/d1.css`, nothing in
  the checkout written): every new utility/selector is generated (press shadows, the `data-[disabled]:`
  set, the guarded hovers, ShapeButton's group selectors, all `group-data-[…]` readers, the `:where`
  preset fill, `not-focus:`), and `.ds-disabled-control` is gone. Rule order was read to catch two
  specificity regressions (preset hover, bare Input hover-vs-focus), fixed as noted above.
- SSR probe (esbuild bundle of the sources + `renderToStaticMarkup`): code cell error+disabled keeps
  the disabled border classes and danger text; SearchBox disabled has `data-disabled` on the wrapper
  and `disabled` on the input; HotkeyIndicator emits `data-pressed`; AIToolPart error label reads
  `data-state`; a disabled preset emits `data-disabled`.
- Not run: Storybook / browser computed-style probes (wave rule); the orchestrator verifies visually.

## For the orchestrator
- Hand-rolled disabled count stays at 2: `src/components/Menu/DropdownMenu.tsx:364` (JSDoc) and `:398`
  `data-disabled:opacity-100!` — an override that stops the inert Checkbox in a disabled menu row
  fading twice, not a hand-rolled disabled look. Not my file; needs either a scoreboard exclusion
  or a menu-owner change.
- `src/components/OutlineButton/OutlineButton.tsx:147` `group-disabled:!opacity-0` still matches
  WI-067's verify `rg` (`group-disabled:`). Not named by WI-067; not touched.
- `src/components/DatePicker/DatePickerTrigger.tsx:61` comment still names `ds-focus-ring` (WI-125
  step 3) — D3's folder.
- `.dark` re-declaration of the new press tokens waits for WI-061.


<!-- merged from _work/changes/06D2-icons-access.md -->
### 06D2 — Icons and shapes: `IconSize` and element access

Wave D, section D2 (WI-065, WI-108 code part). Scratch: `docs/audit/_work/scratch/waveD/d2/`
and the rename script `docs/audit/_work/scratch/waveD/rename-iconsize.mjs`.

## Checklist
- [x] Read rules, briefs, WI-065 / WI-107 / WI-108
- [x] Scoreboard before → `scratch/waveD/d2/score-before.txt`
- [x] Before-render snapshot (current tree, not b436647: WI-076's `color` style has landed) + pre-edit copies in `d2/orig/`
- [x] WI-065 rename script (`scratch/waveD/rename-iconsize.mjs`, `--verify` → VERIFY OK)
- [x] WI-065 BaseIcon type shape + generator alias + regenerated barrel (`npm run generate-icon-exports`)
- [x] WI-108 BaseIcon forwardRef + rest props (+ header contract)
- [x] WI-108 BaseShape rest props (createShape already spreads; no edit)
- [x] After-render diff, access check, type probe, lint, scoreboard after

## Findings while scoping
- Every call site outside `src/components/Icons/` already imports `IconSize`
  from the `../Icons` barrel (the generator aliased it). So the rename touched
  NO other agent's files: only `BaseIcon.tsx`, `Icons.stories.tsx` and the
  generator (then the regenerated barrel).
- The 12 (now 13) shape leaves are `createShape(d, name)` one-liners (wave C),
  and `createShape` already spreads its props into `BaseShape`. WI-108 step 4's
  per-leaf `...rest` edits are not needed; `createShape.tsx` is unchanged.
- SidebarWithHoverIcon needed no edit (WI-108 step 5): it spreads `...iconProps`
  into BaseIcon, so `ref` and rest props ride through. Its header is unchanged.

---

### Icon size name is `IconSize` at source, and its type no longer widens to `string` [WI-065, F-023]
- **files:** `src/components/Icons/BaseIcon.tsx`, `src/components/Icons/Icons.stories.tsx`,
  `scripts/generate-icon-exports.mjs`, `src/components/Icons/index.ts` (generated, line 3 only).
- **what changed:** the const/type `IconSizes` is renamed `IconSize` in BaseIcon
  (the name the package already exported, via an alias). The type is now the
  union of the four `var(--ui-icon-*)` values; the open arm moved to the prop:
  `size?: IconSize | (string & {}) | number`. The generator emits
  `export { BaseIcon, IconSize } from "./BaseIcon";` with no alias. The JSDoc
  example now reads `size={IconSize.md}`. Done by one script
  (`rename-iconsize.mjs`, 1 + 7 + 12 anchored replacements with expected-count
  guards), then the type line was hand-edited.
- **consumer impact:** the exported `IconSize` value is unchanged; `size`
  accepts exactly what it did. The `IconSize` TYPE narrows from `string` to the
  four token literals, so code annotating an arbitrary string as `IconSize`
  stops type-checking. Editor hover now teaches the exported name.
- **breaking:** type-only. `yes — v6` if the release is cut as a major:
  `const x: IconSize = "<any string>"` → use `IconProps["size"]` or `string`.
  No runtime or rename change (`IconSizes` was never reachable from the package).
- **verified:** `node docs/audit/_work/scratch/waveD/rename-iconsize.mjs --verify`
  → VERIFY OK (0 `IconSizes` in src/scripts except the allow-listed three below).
  Type probe `d2/types/probe.tsx`: `const a: "x" = … as IconSize` and
  `const s: IconSize = "2rem"` now error; `{ size: "2rem" }`, `{ size: 20 }` compile.
- **left as is (not mine / not the identifier):**
  - `src/components/LoadingSpinner/spinnerGeometry.ts:36` comment "`Fonts`/`IconSizes`"
    → should read `IconSize` (WI-065 step 3). D3's folder; one-word comment edit owed.
  - `export const IconSizes: Story` in `Toggle/Toggle.stories.tsx:46` and
    `SegmentedTabSelect/SegmentedTabSelect.stories.tsx:46` are Storybook story
    names (they set the story id), not the const. They keep WI-065's literal
    `rg -n "IconSizes" src scripts → 0` done-when from holding; renaming them
    would change story URLs. Maintainer's call.
- **docs owed:** CHANGELOG `[Unreleased]` → Changed: "The `IconSize` type is now
  the union of its four values (was `string`); `size` still accepts any CSS
  length or number." If cut as a major, list it as type-only in the v6 inventory.

### Icons, shapes and SidebarWithHoverIcon forward `ref` and `<svg>` props [WI-108, F-039]
- **files:** `src/components/Icons/BaseIcon.tsx`, `src/components/Shapes/BaseShape.tsx`.
- **what changed:**
  - BaseIcon is `forwardRef<SVGSVGElement, IconProps>` with `displayName`.
    `IconProps` = own props + `Omit<SVGProps<SVGSVGElement>, own | "ref">` +
    `ref?: Ref<SVGSVGElement>` (declared because icon leaves are plain functions
    whose spread carries `ref` under React 19). The rest spread sits after the
    fixed attributes and before `ref`/`aria-hidden`/`className`/`style`; a
    consumer `style` merges last.
  - `aria-hidden` default: `true` unless the icon has `aria-label` or
    `aria-labelledby` (and no explicit `aria-hidden`).
  - `ShapeProps` now extends `Omit<IconProps, "size" | "strokeWidth" | "color" | "children">`
    (so `className`, `aria-*`, `id`, handlers, `style`, `ref`). BaseShape spreads
    `...rest` FIRST on `<BaseIcon>`, so its own size/stroke/fill still win.
  - BaseIcon gained a header contract (it now carries the spread-order and the
    non-widening `IconSize` invariants). BaseShape/createShape/SidebarWithHoverIcon
    headers: none needed / unchanged.
- **consumer impact:** additive. Every icon, every shape and
  SidebarWithHoverIcon accept `ref` and any `<svg>` attribute/handler; shapes
  accept `className`. A labelled icon is no longer `aria-hidden`. Markup with no
  new props is byte-identical.
- **breaking:** no.
- **verified:**
  - Markup: `d2/render.cjs` renders all 88 icons (3 prop sets each), BaseIcon,
    all 13 shapes (2 sets), BaseShape, SidebarWithHoverIcon (4 poses),
    ShapeButton (all shapes × variants), CTAButton (both sizes) — 308 lines.
    Before (pre-edit copies swapped into a copy of the current tree, so other
    agents' concurrent edits cancel out) vs after: **identical**.
  - Access: `node d2/access.cjs d2/out/after.cjs` → 14 PASS (W7c's four "06"
    checks, the aria-hidden rule, and a spy on BaseIcon's forwardRef render
    proving the consumer's `ref` arrives from CheckIcon, CloverShape,
    SidebarWithHoverIcon and BaseIcon). Against the before bundle: 11 FAIL.
  - Types: `tsc -p d2/types/tsconfig.json` → exit 0 (W7c probe lines 17-19
    equivalents compile; MorphRotationShape `shapes` still accepts shapes;
    span ref on an icon and `strokeWidth` on a shape are rejected). Against the
    before tree: 6 errors.
  - `npm run lint` → exit 0. Scoreboard: nothing went up from D2 (focus count
    3 → 0 between runs is D1's work).
  - Not done: a full `npm run build` in a scratch worktree (esbuild bundles of
    `src/index.ts` used instead, per the wave-D brief); Storybook visual check
    is the orchestrator's.
- **docs owed:**
  - codebase skill (icon section, ~SKILL.md:398): "`BaseIcon` forwards `ref` and
    every `<svg>` attribute; icon and shape leaves spread their props into it,
    so `ref`, `aria-*`, `id`, handlers and `style` (merged last) reach the
    `<svg>` of every icon, shape and `SidebarWithHoverIcon`. An icon with
    `aria-label` is not `aria-hidden`."
  - usage skill (~SKILL.md:191): "Icons and shapes take `ref` and any `<svg>`
    prop. Give a meaningful icon `aria-label` (plus `role="img"`) and it stops
    being `aria-hidden`."
  - CHANGELOG `[Unreleased]` Added: "Every icon, every shape and
    `SidebarWithHoverIcon` forward `ref` and `<svg>` props (`aria-*`, `id`,
    handlers, `style`); shapes accept `className`. A labelled icon is no longer
    `aria-hidden`."
  - The element-access RULE text (WI-107) stays with the docs pass.

## Files touched (all D2-lane)
- `src/components/Icons/BaseIcon.tsx`
- `src/components/Icons/Icons.stories.tsx`
- `src/components/Icons/index.ts` (regenerated)
- `src/components/Shapes/BaseShape.tsx`
- `scripts/generate-icon-exports.mjs`
- No other agent's files were touched.


<!-- merged from _work/changes/06D3-leaf-cleanups.md -->
### 06D3 — Leaf cleanups (WI-083, WI-119, WI-049, WI-027)

Agent D3, wave D. Baseline scoreboard (before): m1 0 · m2 0 · m3 0 · m4 5 ·
m5 3 · m6 2 · use-client 27 · timers 5 · m9 0 · m10 0.

## Checklist
- [x] WI-083 Sticker inner wrapper removed; header bullet rewritten
- [ ] WI-083 purposeful-wrapper comments (DropdownMenu, AIModelSelect) — outside lane, NOT done, reported
- [x] WI-119 Sticker: StickerBase displayName, dead prominent fallback
- [x] WI-119 Table: barrel imports, blank line (CSSProperties had already landed)
- [x] WI-119 DatePicker: open delegated to Popover, `defaultOpen`
- [x] WI-119 RollingDigitsText: stray `style`, cast `className`
- [~] WI-119 one number→px helper: `src/utils/length.ts` + textStyle done; UnderlineLinkText outside lane, NOT done, reported
- [x] WI-049 ProgressIndicator JSDoc
- [~] WI-027 folder indexes + src/index.ts routing done; AIContextGauge/ChatDivider deep imports (AIChat, D1's) NOT done, reported
- [x] lint, scoreboard after, markup/export diffs

## Entries

## 2026-10-03

### Sticker lays its children out on the root; no inner wrapper [F-024, WI-083]
- files: `src/components/Sticker/Sticker.tsx`
- what changed: the inner `<div className="flex flex-row items-center gap-sm">`
  around `{children}` is gone. `gap-sm` (the old `gap-xs` before the spacing
  rename, 8px) moved onto the root in `stickerVariants`' base. The header's
  `## behavior` children bullet is rewritten to say the children sit directly
  in the root row. `## constraints` unchanged.
- consumer impact: a `gap-*` or child selector (`[&>svg]:…`) on `<Sticker
  className>` now reaches the icon and label (cn/tailwind-merge drops the base
  `gap-sm` when a consumer passes another `gap-*`). With the default gap the
  layout is the same (the audit's render showed it pixel-identical). A consumer
  who targeted the old inner div (`[&>div]:…`) loses it. `stickerVariants` is
  exported from Sticker.tsx, so anyone applying it to their own element now
  also gets `gap-sm`.
- breaking: no (DOM depth changes by one level; no prop or type change)
- verified: SSR diff (esbuild bundle of src, react-dom/server). Only the three
  Sticker cases changed: inner div removed, `gap-sm` on the root; with
  `className="gap-lg"` the root carries `gap-lg` only. Every other case is
  byte-identical. `rg "flex flex-row items-center gap-" src/components/Sticker` → none.
- docs owed: CHANGELOG `[Unreleased]` → Fixed: "`Sticker` renders its children
  directly in the root row, so a `gap-*` or child selector on `className` now
  applies." Architecture skill Rule 3 wrapper examples: drop Sticker if listed.

### Sticker: distinct base name, no dead prominent fallback [F-113 items 6-7, WI-119]
- files: `src/components/Sticker/Sticker.tsx`
- what changed: `StickerBase.displayName = "StickerBase"` (was "Sticker"; the
  public `Sticker.displayName` stays "Sticker"). The custom-colour resolve no
  longer names `var(--ui-color-prominent)` as a fallback. It passes `""`, with
  a comment that the throw above guarantees `color`. The throw and the header
  constraint ("custom with no color throws") are unchanged.
- consumer impact: React DevTools shows `Sticker` > `StickerBase` instead of
  two `Sticker` nodes. Rendering unchanged.
- breaking: no
- verified: SSR `variant="custom" color="danger"` still paints
  `color:var(--ui-color-danger-primary)`; inner base displayName = StickerBase;
  `rg ui-color-prominent Sticker.tsx` → none; type probe: `custom` without
  `color` is still a type error.
- docs owed: none

### Table imports through the Icons and Text barrels [F-113 item 8, WI-119]
- files: `src/components/Table/Table.tsx`
- what changed: the three chevron icon deep imports become one
  `from "../Icons"`; `ButtonText` comes `from "../Text"`; the double blank line
  before `/* ── Table ── */` is now one. The `CSSProperties` part had already
  landed (WI-106), so it was skipped.
- consumer impact: none (markup byte-identical).
- breaking: no
- verified: SSR of `Table` and `TableHeaderCell` (ascend / descend / none)
  byte-identical; `rg 'from "\.\./(Icons|Text)/' Table.tsx` → none.
- docs owed: none

### DatePicker lets Radix Popover own its open state, and takes `defaultOpen` [F-113 item 9, WI-119]
- files: `src/components/DatePicker/DatePicker.tsx`
- what changed: the hand-rolled `useState` open state (`uncontrolledOpen` /
  `isOpen` / `setOpen`) is deleted. `open`, the new optional `defaultOpen` and
  `onOpenChange` pass straight to `<Popover>` (the Radix Root). It is
  controlled when `open` is defined and uncontrolled otherwise. The `useState`
  import is dropped. The `"use client"` directive is kept (decision D-05 owns
  that). The file has no header contract.
- consumer impact: `<DatePicker defaultOpen>` now opens initially when
  uncontrolled. Controlled and uncontrolled use behave as before. One nuance:
  switching a mounted picker between controlled and uncontrolled now gets
  Radix's development warning (the old code silently ignored it).
- breaking: no (additive prop)
- verified: type probe (`docs/audit/_work/scratch/waveD/d3-probe`, `tsc -p` →
  exit 0) accepts `defaultOpen` and the controlled `open` + `onOpenChange`
  form. SSR of closed and `open` pickers is byte-identical to before.
  `rg useState DatePicker.tsx` → none. Not checked in a browser (no Storybook
  in this wave): opening on click and closing on outside click and Escape are
  left to the orchestrator's visual pass.
- docs owed: CHANGELOG `[Unreleased]` → Added: "`DatePicker` `defaultOpen`
  (uncontrolled initial open state)." Consumer DatePicker skill/reference: list
  `defaultOpen`.

### RollingDigitsText passes `style` through with the rest [F-113 item 10, WI-119]
- files: `src/components/AnimatedText/RollingDigitsText.tsx`
- what changed: `style` is no longer destructured and passed back as
  `style={style}`; it reaches the root `<span>` through `{...rest}`. The cast's
  redundant `className?: string` is dropped (`className` is already in
  `HTMLAttributes`). The header constraints are about rendering, so they are
  untouched.
- consumer impact: none.
- breaking: no
- verified: SSR of `RollingDigitsText` with `className`, `style` and `data-x`,
  and with `smallDecimals`, is byte-identical.
- docs owed: none

### One number→px helper, `src/utils/length.ts` (partial) [F-113 item 11, WI-119]
- files: `src/utils/length.ts` (new), `src/components/Text/textStyle.ts`
- what changed: new internal `toPxLength(value: string | number): string`
  (numbers → `${n}px`, strings pass through). It is not exported from
  `src/index.ts`. `textStyle.ts` drops its private `toLength` and calls
  `toPxLength` for `fontSize` and `letterSpacing` (both already behind
  `!== undefined`). `toUnitless` is kept.
- NOT done: `src/components/AnimatedText/UnderlineLinkText.tsx` still has its
  own `toLength` (lines 21-22, used at :51 and :54). It is outside this agent's
  file list. To finish: import `toPxLength` from `"../../utils/length"`,
  delete the local `toLength`, and call `toPxLength(thickness)` /
  `toPxLength(offset)`.
- consumer impact: none.
- breaking: no
- verified: SSR of `BodyText` with numeric and string `fontSize` /
  `letterSpacing` is byte-identical; lint exit 0.
- docs owed: none

### ProgressIndicator's `wavy` and `progress` JSDoc tell the truth [F-050, WI-049]
- files: `src/components/ProgressIndicator/constants.ts`,
  `src/components/ProgressIndicator/ProgressIndicator.tsx`
- what changed: the `ProgressIndicatorVariant.wavy` JSDoc now describes one
  stable Material 3 rounded-star path, revealed by a normalized stroke dash
  that is not transitioned. It used to say "polar sine-wave … point count
  changes". The `progress` prop JSDoc now says it throws below 0, above 1 or
  on NaN, in every build; it used to say "throws in development". The guard is
  `!(progress >= 0 && progress <= 1)`, so NaN is included; the WI's wording
  predates the NaN guard.
- consumer impact: IntelliSense text only (ships in the .d.ts).
- breaking: no
- verified: `rg "Polar sine-wave|point count changes|Throws in development"
  src/components/ProgressIndicator` → none; lint exit 0.
- docs owed: none

### LoadingSpinner, ProgressIndicator and WavyDivider get folder indexes [F-064, WI-027]
- files: `src/components/LoadingSpinner/index.ts`,
  `src/components/ProgressIndicator/index.ts`,
  `src/components/WavyDivider/index.ts` (all new), `src/index.ts`
- what changed: each folder has an index of named re-exports: the component,
  its `*Props`, and its const+type objects. `src/index.ts` exports the three
  folders instead of their component and constants files. The
  ProgressIndicator index exports `ProgressIndicatorVariant` once; the const
  and the type now share that name, so the WI's separate type line is not
  needed. `spinnerGeometry` stays internal.
- NOT done: `src/components/AIChat/AIContextGauge.tsx:25`
  (`from "../ProgressIndicator/ProgressIndicator"`) and
  `src/components/AIChat/ChatDivider.tsx:11`
  (`from "../WavyDivider/WavyDivider"`) still deep-import. AIChat is D1's.
  To finish: `from "../ProgressIndicator"` and `from "../WavyDivider"`.
- consumer impact: none. The package root's runtime export list is identical.
- breaking: no
- verified: the runtime keys of an esbuild bundle of `src/index.ts` are
  identical before and after (part of the SSR dump diff). The type probe
  imports every type and const through the root → exit 0. Every
  `src/components/*/` has an `index.ts`. `src/index.ts` has no
  `components/(WavyDivider|LoadingSpinner|ProgressIndicator)/` deep path.
- docs owed: the codebase skill line "Components and their `*Props` types come
  from the component's `index.ts`" is now true for these three. Contribution
  skill: record named re-exports as the one folder-index form.

### Not done — outside this agent's files [WI-083 step 4]
- `src/components/Menu/DropdownMenu.tsx`: the MultiSelectItem wrapper
  `<span className="flex flex-1 items-center gap-rg">{children}</span>` needs
  the comment "flex-1 fills the row beside the leading checkbox, so the label
  takes the remaining width." The WI's :326 anchor has drifted: that class now
  appears at :238, :342 and :400, so pick the MultiSelectItem one by reading.
- `src/components/AIChat/AIModelSelect.tsx` :72 and :108 need the two comments
  from WI-083 step 4 (D1's file).

### Verification summary
- `npm run lint` → exit 0.
- Scoreboard before → after: no metric rose. Hand-rolled focus went 3 → 0
  during this run from D1's work, not this agent's.
- SSR/export dump: scratchpad `d3/render.cjs` (esbuild bundle of src +
  react-dom/server). The before/after diff shows only the intended Sticker
  change and the StickerBase name.
- Type probe: `docs/audit/_work/scratch/waveD/d3-probe/` (`tsc -p` → exit 0).


### Orchestrator follow-ups after wave D (2026-10-04)
- files: AnimatedText/UnderlineLinkText.tsx, AIChat/AIContextGauge.tsx,
  AIChat/ChatDivider.tsx, AIChat/AIModelSelect.tsx, Menu/DropdownMenu.tsx,
  LoadingSpinner/spinnerGeometry.ts, DatePicker/DatePickerTrigger.tsx. Done by
  `docs/audit/_work/scratch/waveD/orchestrator-followups.mjs`, which checks
  every anchor before replacing it.
- what changed:
  - UnderlineLinkText uses the shared `toPxLength` instead of its own copy
    (WI-119).
  - AIContextGauge and ChatDivider import from the new ProgressIndicator and
    WavyDivider folder indexes (WI-027).
  - The three WI-083 comments explain why each remaining wrapper exists:
    AIModelSelect ×2 and DropdownMenuMultiSelectItem.
  - Two stale comments corrected: `IconSizes` → `IconSize`, and the
    DatePickerTrigger note no longer names the deleted `ds-focus-ring`.
- consumer impact: none.
- breaking: no
- verified: `npm run lint` exits 0.
- docs owed: none.

<!-- merged from _work/changes/06E1-refs.md -->
### 06E1 — Element access: one `useComposedRefs`, `forwardRef` + rest props (WI-099, WI-107)

Agent E1, wave E. Baseline scoreboard (before): m1 0 · m2 0 · m3 0 · m4 5 ·
m5 0 · m6 0 · use-client 27 · timers 5 · m9 0 · m10 0.

Before-markup captured: scratchpad `e1/before.html` (20 usages rendered from
`src/index.ts` with esbuild + `renderToStaticMarkup`), md5 `bcea7459…`.

## Checklist
- [x] WI-099 step 2: `src/utils/composeRefs.ts` created (no `"use client"`, see entry)
- [x] WI-099 step 3: AIPromptInput
- [x] WI-099 step 4: Input
- [x] WI-099 step 5: OutlineButton
- [x] WI-099 step 6: DropdownTrigger
- [x] WI-107 step 3: HotkeyIndicator
- [x] WI-107 step 4: MorphRotationShape (+ step 5 story)
- [x] WI-107 step 6: ShapeMorphSpinner
- [x] WI-107 step 7: SplitButton
- [x] lint, scoreboard after, markup before/after, type probe

## Entries

## 2026-10-03

### One memoized ref merge instead of four hand-rolled ones [WI-099, F-085]
- files: `src/utils/composeRefs.ts` (new), `src/components/AIChat/AIPromptInput.tsx`,
  `src/components/Input/Input.tsx`, `src/components/OutlineButton/OutlineButton.tsx`,
  `src/components/DropdownTrigger/DropdownTrigger.tsx`.
- what changed: a new internal hook `useComposedRefs(...refs)` returns one
  callback ref, memoized on the refs, that writes the node into every ref. The
  four components that merged their own internal ref with the consumer's
  (`AIPromptInputTextarea`'s inline arrow + `assignRef`, Input's `setRefs`,
  OutlineButton's and TypeableDropdownTrigger's `useCallback` merges) now call
  it. Dead imports removed (`Ref` in AIPromptInput; `MutableRefObject`,
  `RefCallback` in OutlineButton; `useCallback` in DropdownTrigger — it had no
  other use there; OutlineButton keeps `useCallback` for its mouse handlers).
  The hook is not exported from `src/index.ts`.
- `"use client"`: none on `composeRefs.ts`. It calls only `useCallback`, which
  the package's directive rule (agent-rules §6 / WI-037: "`useCallback` …
  do[es] not count") treats as neutral; every caller already carries its own
  directive. A header comment in the file says so. use-client count unchanged.
- consumer impact: same refs reach the same elements. A consumer callback ref
  on `AIPromptInputTextarea` and `Input` is no longer called with `null` and
  then the node on every re-render (every keystroke). OutlineButton and
  DropdownTrigger were already memoized: pure de-duplication.
- breaking: no.
- verified: see the verification section at the end.
- docs owed: codebase SKILL.md Directory Structure line for
  `utils/composeRefs.ts` (internal, not exported); CHANGELOG `[Unreleased]`
  `### Fixed`: "`AIPromptInputTextarea` and `Input` no longer detach and
  re-attach a callback `ref` on every keystroke."

### Four components now hand over their element and accept a ref [WI-107, F-039]
- files: `src/components/HotkeyIndicator/HotkeyIndicator.tsx`,
  `src/components/MorphRotationShape/MorphRotationShape.tsx`,
  `src/components/MorphRotationShape/MorphRotationShape.stories.tsx` (one story appended, import line),
  `src/components/ShapeMorphSpinner/ShapeMorphSpinner.tsx`,
  `src/components/SplitButton/SplitButton.tsx`.
- what changed:
  - HotkeyIndicator: `forwardRef<HTMLSpanElement>` with `displayName`; `ref` first on
    the root `<span>`. Body (data-pressed, `menu` variant) untouched. (The previous
    run had wrapped it but not yet passed `ref`, which is why lint failed.)
  - MorphRotationShape: outer component is `forwardRef` + `displayName`; it hands
    the ref to the inner as `forwardedRef`, which composes it with its own `spanRef`
    via `useComposedRefs` and puts `ref={composedRef}` LAST on the span, after
    `{...spanProps}`, with a comment saying why. Header unchanged: listeners stay
    on the span, nothing new writes `d`/transform.
  - ShapeMorphSpinner: `forwardRef` + `displayName`, passes `ref` to
    MorphRotationShape. Still no `"use client"` (forwardRef is not a client
    trigger). Default `shapes` stays `DEFAULT_SHAPE_KEYS` (current code, not the
    WI's older `SHAPE_MORPH_SPINNER_SHAPES`). Role/size divergence left to F-072.
  - SplitButton: props now extend `HTMLAttributes<HTMLDivElement>` (explicit
    `children`/`className` lines removed), `forwardRef<HTMLDivElement>` +
    `displayName`, rest props spread on the root `<div>` after `className`.
    WI-085's `SplitButtonGroup` has not landed, so the root is still the `<div>`.
  - Story `Progress/MorphRotationShape` → "Forwarded Ref" (WI step 5), with
    `gap-lg` instead of the WI's `gap-4`.
- consumer impact: `ref` works on all four (TypeScript used to reject it on
  HotkeyIndicator and SplitButton). SplitButton now passes `id`, `aria-*`,
  `data-*` and handlers to its root, so Radix `asChild` triggers work around it.
  A ref on MorphRotationShape / ShapeMorphSpinner no longer replaces the internal
  one, so the shape no longer freezes when a ref is attached.
- breaking: no (additive; the frozen-shape behaviour was a bug).
- docs owed: contribution SKILL.md element-access checklist (WI-107 step 2,
  verbatim text in the WI); CHANGELOG `[Unreleased]` `### Added`
  "`HotkeyIndicator`, `MorphRotationShape`, `ShapeMorphSpinner` and `SplitButton`
  forward their ref; `SplitButton` passes rest props (`id`, `aria-*`, handlers) to
  its root." and `### Fixed` "A ref on `MorphRotationShape`/`ShapeMorphSpinner` no
  longer freezes the shape."

## Verification (WI-099 + WI-107)
- `npm run lint` (tsc --noEmit) → exit 0, after all edits.
- Scoreboard after: m1 0 · m2 0 · m3 0 · m4 5 · m5 0 · m6 0 · use-client 27 ·
  timers 5 · m9 0 · m10 0. Identical to the baseline; nothing moved.
- Markup: the same 20-usage esbuild + `renderToStaticMarkup` harness (scratchpad
  `e1/entry.tsx`, all 8 touched components incl. refs, rest props, every
  MorphRotationShape mode, ShapeMorphSpinner, SplitButton) re-rendered as
  `e1/after.html`: md5 `bcea7459c26af794eb3641408b14630b` for both; `cmp` →
  byte-identical, 0 throws.
- Type probe: `docs/audit/_work/scratch/W7c/access-probe/probe.tsx` with its
  paths pointed at `src/index.ts` (no build) → no errors on lines 13-16
  (HotkeyIndicator, SplitButton, MorphRotationShape, ShapeMorphSpinner refs).
  The 2 remaining errors are lines 20-21 (Calendar / DatePicker: WI-109's).
- Rest props (WI-107 render check 05, run from src via esbuild): `PASS
  SplitButton rest props reach the root div` (`data-x`, `id`, `aria-label`),
  `PASS HotkeyIndicator rest props still reach the span`. All four have their
  `displayName`.
- Ref-freeze (DOM, Browser pane, rAF driven by timers because the pane was
  hidden): a controlled MorphRotationShape with a consumer `ref`, stepped to
  index 1 with `--ds-shape-morph-step: 1` and a `transitionrun` dispatched on the
  span. Before (tree `06D-wave-d` version): `ref=SPAN landed=[] pathChanged=false`,
  so the shape froze. After: `ref=SPAN landed=[1] pathChanged=true`.
- Not done here: worktree `npm run build` (the src probes above cover the same
  checks), Storybook "Forwarded Ref" visual check (orchestrator).


<!-- merged from _work/changes/06E2-comments-css.md -->
### 06E2 — comments, stale descriptions, dead CSS (WI-010, WI-017, WI-026, WI-029, WI-078, WI-088)

Agent E2, wave E. Scoreboard before: raw var(--ui-*) in className 5 (Slider 5); "use client" 27; JS timers 5; all others 0.

## Checklist
- [x] WI-010 stale comments + no-op constructs
- [x] WI-017 stale comments (sync-theme, stylesheets, Calendar, OutlineButton, OutlineSection)
- [x] WI-026 naming/cosmetic sweep
- [x] WI-029 make the two straddling motion systems whole in one stylesheet
- [x] WI-078 dead CSS
- [x] WI-088 className-target JSDoc
- [x] lint, scoreboard after, Tailwind compile proof

Tailwind compile baseline: `src` snapshot copied to scratchpad before any edit, compiled with the repo's `tailwindcss` CLI (`before.css`, 3720 lines).

### Source comments that misdescribed the code, and three no-op constructs [F-117, F-047, WI-010]
- files: `src/components/AnimatedText/RollingDigitsText.tsx`, `src/components/Text/BaseText.tsx`, `src/components/Sheet/Sheet.tsx`, `src/components/Sheet/Sheet.stories.tsx`, `src/components/LoadingSpinner/spinnerGeometry.ts`, `src/components/MorphRotationShape/engine/{cubic,morph,polygon,utils}.ts`, `src/components/SidebarWithHoverIcon/SidebarWithHoverIcon.tsx`, `src/styles/dooph-component-tokens.css`, `src/components/Icons/ShowMoneyIcon.tsx`, `src/components/Icons/BaseIcon.tsx`, `src/components/Shapes/BaseShape.tsx`
- what changed:
  - RollingDigitsText: the wheel's `onAnimationEnd` guard comment no longer claims the column's roll fires there (it is a transition, so it fires `transitionend`, which never reaches `onAnimationEnd`); the guard is for a consumer's own animation bubbling up.
  - BaseText: no longer claims every visible string renders through it (DS controls such as Button apply `text-style-*` classes directly).
  - Sheet: the cross-axis comment and the "Custom width" story text now say left/right sheets are `w-3/4 max-w-96`, so a consumer width needs a `max-w-*` override too; top/bottom size to content.
  - spinnerGeometry: stroke widths are viewBox user units, not px.
  - Shape-morph engine headers (4 files, constraint wording only, rule unchanged): the fix file is `./svgPath.ts` (same folder), not `../svgPath.ts`.
  - SidebarWithHoverIcon header: "one `getComputedStyle` call (two property reads) per frame".
  - Slider fill CSS comment: the active track is at `--ds-slider-track-opacity` (the variant's token), not a fixed 45%; says which root var comes from which prop.
  - No-op code: ShowMoneyIcon loses Tabler's invisible `stroke="none" fill="none"` bounding-box path; BaseIcon `color ?? undefined` / `fillColor ?? undefined` → `color` / `fillColor`; BaseShape `strokeColor ?? undefined` → `strokeColor` (all typed `string | undefined`; React drops null style values either way).
  - Already done before this wave (re-derived, nothing to change): the Fade/Roll/RevealChangeText reduced-motion wording (now the motion scale's global collapse), the 1.4 s Material claim (the spinner clock is now a token), ProgressIndicator's `color` type (now `DsColor`), and the generated Icons/index.ts header.
- consumer impact: none. Rendered output is identical; ShowMoneyIcon's DOM has one fewer invisible `<path>`.
- breaking: no
- verified: see the verification section at the end.
- docs owed: none.

- resume note (2026-10-03): WI-010 re-checked against the wave-D tree — every item is in the code and its step-4 grep returns nothing. One fix-up: the Sheet comment's example `w-[540px] max-w-none` was counted by the scoreboard as an arbitrary px value (0 → 1), so it now reads "e.g. `max-w-none` next to the width" (scoreboard back to 0).

### Comments in the token script, the stylesheets, Calendar, OutlineButton and OutlineSection that pointed at the wrong thing [F-101, WI-017]
- files: `scripts/sync-theme.mjs`, `src/styles/index.css`, `src/styles/dooph-component-tokens.css`, `src/styles/tokens.css`, `src/components/Calendar/{rangeSelection.ts,CalendarCaption.tsx,dateUtils.ts,CalendarGrid.tsx}`, `src/components/OutlineButton/OutlineButton.tsx` (comment only), `src/components/OutlineSection/OutlineSection.tsx`
- what changed:
  - sync-theme.mjs header: wired into `npm run sync-tokens` (which `build` and `build:watch` run first), not a `prebuild` hook that does not exist; the mapping step names `toThemeEntry` (prefix rules + ALIASES) instead of a `TOKEN_MAP` that does not exist; adds step 4 (theme.css + twMergeTheme.ts); a new token goes in `:root`, with a `.dark` override only when the value differs. The EXCLUDED comment says only entries a prefix rule would map have an effect. Group comments: `.text-style-*` is `@layer components`; menu widths feed the custom `.min-w-menu` utility and the `ds-min-w-*` helpers; opacity feeds ds-* helpers and index.css rules (not arbitrary Tailwind values); focus-ring colours also feed the `ds-focus-*` outline helpers.
  - index.css: the `@property --progress-pct` comment no longer claims the registration makes the bar animate — the motion is the `.ds-progress-*` width/left transition. (The audit's spinner-keyframe item was already fixed: the comment now says "spokes and star variants".)
  - dooph-component-tokens.css: the disabled helper is "native :disabled + aria-disabled=\"true\"" (it never looked at aria-invalid); the linear-progress comment matches the index.css one.
  - tokens.css: the prompt-height cap is applied by CSS max-height (the component never reads it back with getComputedStyle); the radius legend lists the four real keys tight / mini / normal / soft (it said `standard`, which is not a radius).
  - Calendar: dropped references to a deleted plan ("Task 9", "Step 5"); dateUtils' rule 3 now allows `getTime()` after `startOfDay` (which the module itself does); weekday names are "short", matching `weekday: "short"`. (rangeSelection's `onSelect` and Calendar's `warnOnBadValue` items were already fixed by the onValueChange and earlier waves.)
  - OutlineButton hover-mode comment: no longer says the orb sits exactly at the cursor or that orb 2 tracks the diagonally opposite point; it defers to the exact mapping comment below it (both orbs follow the cursor with a fixed 30% offset).
  - OutlineSection JSDoc (ships in .d.ts): the outer ring is a solid 1px border, not dashed.
- consumer impact: none — comments only; OutlineSection's hover text in editors changes.
- breaking: no
- verified: WI-017 step-8 grep over `scripts src` → no matches. `npm run sync-tokens` re-run: theme.css, index.css and twMergeTheme.ts byte-identical before/after (md5).
- docs owed: none.

### Naming and cosmetic sweep: two chat-prose tokens, a "do not edit" line on the generated theme block, three header constraints that now name their failure, and small code nits [F-116, WI-026]
- files: `src/styles/tokens.css`, `src/styles/dooph-component-tokens.css`, `src/styles/index.css` (hand-written comment above the generated markers only), `src/components/Toast/Toast.tsx`, `src/components/Tooltip/Tooltip.tsx`, `src/components/Checkbox/Checkbox.tsx`, `src/components/VerificationCode/{CodeDigitInput,VerificationCodeInput}.tsx`, `src/components/SegmentedTabSelect/SegmentedTabSelect.tsx`, `src/components/Slider/Slider.tsx`, `src/components/AIChat/constants.ts` (comment only — E1's folder)
- what changed:
  - tokens.css: the Calendar heading no longer claims the day-cell radius (it lives with the radii, `--ui-radius-calendar-day`). The micro button height had already been moved next to the other button heights. New `--ui-chat-prose-link-offset: 3px` and `--ui-chat-prose-quote-border-width: 2px`, used by `.ds-chat-prose a` / `.ds-chat-prose blockquote` in place of the bare 3px / 2px.
  - index.css: the comment above `__GENERATED_THEME_START__` now says the block is written by sync-theme.mjs and must not be hand-edited.
  - Toast's cva default is `ToastVariant.simple`, not the string `"simple"`. TooltipBody no longer destructures `className` only to pass it back.
  - Header constraints, each keeping its rule and gaining its failure: Checkbox (an interactive indicator is a nested control assistive tech cannot reach), CodeDigitInput (a hand-built row loses auto-advance, backspace, arrows, paste and sequential entry — the last added because the current VerificationCodeInput header documents it), VerificationCodeInput (a packaged layout would fix copy and a Button arrangement each app owns).
  - VerificationCodeInput drops its redeclared `"aria-label"?: string` (already in `HTMLAttributes` via `AriaAttributes`; the `"Verification code"` default is unchanged).
  - SegmentedTabSelect's `./constants` import (and its comment) moves up into the import block.
  - Slider's inline `--slider-pct` is now `--ds-slider-pct` (the style key and both arbitrary width/left classes, each still one literal string).
  - AIThinkingPartState JSDoc records why Figma's `Variant` is the `state` prop.
- consumer impact: none visible. The two new `--ui-chat-*` tokens are overridable like any token (no Tailwind key — no `toThemeEntry` rule matches `ui-chat-`). A consumer stylesheet that read Slider's undocumented `--slider-pct` must read `--ds-slider-pct`.
- breaking: no (the `--slider-pct` rename touches an undocumented internal on Slider's own root).
- skipped — the two `Error` → `HasError` story renames (Input.stories.tsx, VerificationCode.stories.tsx): stories are E3's lane and this wave's E3 brief says not to rename existing story exports because it changes their URLs. Left for the maintainer to decide; the renames are trivial if wanted.
- verified: `npm run sync-tokens` → theme.css hash `61a5092…` and generated-block hash `43dd400…` identical before and after. `rg -n "slider-pct" src | rg -v ds-slider-pct` → none; `rg -n '"simple"' Toast.tsx` → none; no bare 3px/2px on the chat-prose underline/border. Tailwind compile proof in the verification section.
- docs owed: none (no consumer doc lists the `--ui-chat-*` tokens yet; that coverage gap is F-048's).

### The linear-progress and AI-chat-streaming motion systems each now live whole in one stylesheet [F-068, WI-029]
- files: `src/styles/index.css`, `src/styles/dooph-component-tokens.css`
- what changed: two at-rules moved, unchanged, from index.css into dooph-component-tokens.css, next to the classes that use them, both outside `@layer`:
  - `@property --progress-pct` (LinearProgressIndicator) now sits above `@layer utilities {`, with the `.ds-progress-*` transition classes;
  - `@keyframes ds-chat-stream-in` (AITextPart / AIThinkingPart streaming) now closes the file, after `.ds-chat-prose`; its comment says why it is outside `@layer` (an inline-style animation cannot reach a layered `@keyframes`).
  - Before this, each system had its classes in one sheet and its at-rule in the other. Every other motion system already lives whole in one file.
- consumer impact: none. Both files are plain `@import`s into one compiled sheet, so dist/styles.css has the same rules; only their position in it changes. `@property` and `@keyframes` do not depend on source order.
- breaking: no
- verified: `rg -n "@property --progress-pct|@keyframes ds-chat-stream-in" src/styles` → 2 hits, both in dooph-component-tokens.css, neither inside `@layer`. Tailwind compile proof in the verification section (both still top-level in the output).
- docs owed: WI-029 steps 2–3 — the placement rule and the file map in `.agents/skills/dooph-ds-codebase/SKILL.md` (keyframes "in the same stylesheet as the system that uses them"; dooph-component-tokens.css holds token helpers plus the Slider, LinearProgressIndicator, CopyButton swap and AI-chat systems, with their at-rules outside the layer there), and one sentence in `.agents/skills/dooph-ds-contribution/SKILL.md` (a motion system is not a token helper; keep it whole in one stylesheet). Skills are deferred.

### Dead CSS: an unread dark sticker opacity, a doubled table bottom edge, and a ToastClose colour override that never won [F-076, WI-078]
- files: `src/styles/tokens.css`, `src/components/Table/Table.tsx`, `src/components/Toast/Toast.tsx`
- what changed:
  - tokens.css `.dark`: deleted `--ui-sticker-bg-opacity-secondary: 60%`. Nothing reads it in dark — the dark secondary wash is redefined right below it on `--ui-sticker-bg-opacity` (20%). The comment above now says the 80% token is light-only.
  - TableRow: dropped the unconditional `border-b` that defeated `not-last:border-b`. Rows now draw a divider between rows only, so the last row no longer stacks its border on the Table's own 1px border (the bottom edge was 2px, now 1px like the top and sides).
  - ToastClose: the colour override now uses the ghost Button's own guarded selector (`[&:not(:disabled):not([aria-disabled=true])]:hover:text-current` / `:active:`). Checked with the repo's `cn()`: the old string kept the ghost `…:hover:text-ghost-fg-active` / `…:active:text-ghost-fg-active` classes (which out-specify a bare `hover:text-current`); the new one drops them. A comment says why the long selector is there.
- consumer impact (visible, both bug fixes):
  - On hover and press, the toast close (X) keeps the toast's text colour instead of turning ghost-foreground-active (near-invisible on the prominent toast). The ghost hover wash still shows.
  - The last TableRow has no bottom border. A consumer who renders TableRows outside a bordered `Table` loses the line under the last row.
- breaking: no
- verified: Tailwind compile in the scratchpad (current `src` vs. the same tree with only my stylesheet / Slider / Table / Toast files reverted to the pre-wave snapshot, each compiled from its own directory). The whole output diff is: the two chat-prose tokens and their two uses; the dark `60%` line removed; `@property --progress-pct` and `@keyframes ds-chat-stream-in` moved, both still top-level (brace depth 0, once each); the two Slider classes renamed to `--ds-slider-pct`; `active:text-current` removed and the two guarded `text-current` rules added. Nothing else changed. TableRow produces no CSS change (`border-b` is still used elsewhere); the change is which class the row carries. `npm run sync-tokens` → theme.css and the generated block unchanged.
- docs owed:
  - token-contract.md (`skills/dooph-design-system-theming/references/`): a "Text Selection" section documenting the opt-in `ds-selection` class and the `--ui-color-selection*` tokens (WI-078 step 2), and the `--ui-sticker-bg-opacity-secondary` line → "80%. Only the light secondary wash reads it; the dark secondary wash uses `--ui-sticker-bg-opacity`".
  - CHANGELOG `[Unreleased]` → Fixed: "`ToastClose` keeps the toast's text colour on hover and press (the icon was near-invisible on the prominent toast)." and "`TableRow` no longer draws a divider under the last row, so a `Table`'s bottom edge matches its other sides."

### Which element `className` styles, written down in the eight components that send it somewhere other than `ref`/`style` [F-062, WI-088]
- files: `src/components/OutlineButton/OutlineButton.tsx` (JSDoc only — E1's folder), `src/components/SearchBox/SearchBox.tsx`, `src/components/Menu/DropdownMenuSearch.tsx` (header `## behavior` bullet), `src/components/VerificationCode/CodeDigitInput.tsx` (header `## behavior` bullet), `src/components/SegmentedTabSelect/SegmentedTabSelect.tsx`, `src/components/Slider/Slider.tsx`
- what changed: each states its split, re-derived from the current render code:
  - OutlineButton: `className` → outer pill frame `<div>`; `ref`, `style`, handlers and the rest → the inner button (the slotted element under `asChild`).
  - SearchBox: `className` → bordered field `<div>`; the rest → `<input>`.
  - DropdownMenuSearch: `className` → row `<div>`; the rest → `<input>`.
  - CodeDigitInput: `className` → cell `<div>`; the rest → `<input>`.
  - SegmentedTabSelect: props, `ref` and `style` → Radix Tabs Root; `className` → inner TabsList (the visible shell at the container sizes).
  - SliderContinuous / SliderStepped: `className` → outer box (owns the width, and on the stepped slider the end-dot inset); the rest → Radix Root.
  - SliderLabeled: `className` → outer column (track + labels); the rest → the slider's Radix Root.
- consumer impact: none in behaviour; the JSDoc lines show in IntelliSense.
- breaking: no
- verified: `rg -n "className\` styles|className\` always lands" src/components` → 9 lines (Input plus the 8 added).
- docs owed: WI-088 step 7 — a "`className` target" paragraph in `.agents/skills/dooph-ds-codebase/SKILL.md` under Component Inventory, listing the nine split components and noting the rule is pending decision D-17.

## Verification (whole record)
- `npm run lint` (tsc --noEmit) → exit 0.
- Scoreboard after: identical to before (raw var(--ui-*) in className 5, all Slider; "use client" 27; JS timers 5; all others 0). During the resume the Sheet comment example briefly pushed "arbitrary px values" to 1; reworded, back to 0.
- Stale-text greps from WI-010 step 4 and WI-017 step 8 → no matches. `rg "slider-pct" src | rg -v ds-slider-pct`, `rg '"simple"' Toast.tsx`, `rg "sticker-bg-opacity-secondary: 60%" src` → none.
- `npm run sync-tokens` → theme.css (`61a5092…`), the generated `@theme` block (`43dd400…`) and twMergeTheme.ts unchanged.
- Tailwind compile proof: see the WI-078 entry. The only output changes are the ones listed there, and both moved at-rules are still top-level.
- Not run here (the orchestrator verifies visually): Storybook checks — chat-prose computed `3px` / `2px`, Slider fills tracking the handle, ToastClose on the prominent toast, Table bottom edge — and a scratch-worktree build.

## Skipped / for other lanes
- WI-026 `Error` → `HasError` story renames (Input.stories.tsx, VerificationCode.stories.tsx): stories are E3's lane, and E3's brief says not to rename existing story exports because it changes their URLs. Maintainer's call.


<!-- merged from _work/changes/06E3-stories.md -->
### 06E3 — Stories (WI-004, WI-020, WI-121)

Agent E3, wave E. Lane: `src/**/*.stories.tsx`, `.storybook/**`.
Resume scoreboard (before E3 resumed): arbitrary px 1 (Sheet/Sheet.tsx — not a story, E1 lane), rest unchanged.
Baseline scoreboard (before): motion 0 · arbitrary px 0 · numeric spacing 0 ·
raw var 5 · focus 0 · disabled 0 · use-client 27 · timers 5 · onValueChange 0 ·
default exports 0.

Brief overrides: existing story exports are NOT renamed (their names set the
Storybook URL), so WI-020 step 1 (`Brand`→`Prominent`, `Error`→`Danger`) and
WI-026's `Error` story rename are skipped by instruction. Two `IconSizes`
stories stay.

## Checklist
- [x] WI-004 import specifier script (`docs/audit/_work/scratch/waveE/storybook-imports.mjs`)
- [x] WI-020 sweep (step 1 skipped by brief)
  - [x] step 2 Modal/Sheet visible titles (checked consistent on resume: no `sr-only` titles left, all 7 pairs are visible `ModalTitle`/`SheetTitle`, `rounded` → `rounded-tight`)
- [x] WI-121 hygiene (step 7, Button.tsx header, not done: outside lane)
- [x] lint, scoreboard after

## Entries

## 2026-10-03

### Stories and the Storybook preview import types from `@storybook/react-vite` [F-107, WI-004]
- files: `.storybook/preview.ts` and 41 `src/**/*.stories.tsx` (every file that
  imported `@storybook/react`); script
  `docs/audit/_work/scratch/waveE/storybook-imports.mjs` (`--verify`).
- what changed: the module specifier `@storybook/react` → `@storybook/react-vite`,
  one line per file, each file's quote style and line endings kept. The
  framework package is the declared devDependency and re-exports the renderer
  (`export * from "@storybook/react"`), so `Meta`, `StoryObj` and `Preview` are
  the same types.
- consumer impact: none (stories and `.storybook/` do not ship).
- breaking: no
- verified: script `--verify` → 0 `@storybook/react` specifiers left in src
  stories or `.storybook/`, 48 files import `@storybook/react-vite`, no mixed
  line endings. `npm run lint` (see end). `build-storybook` not run (brief: no
  Storybook/build in this checkout) — `.storybook/preview.ts` is excluded from
  lint by tsconfig, so it is checked only by the orchestrator's Storybook run.
- docs owed: contribution skill story template / any skill snippet that shows
  `import type { Meta, StoryObj } from "@storybook/react"` → `@storybook/react-vite`.

### Modal and Sheet stories name each dialog by its visible title [F-105, WI-020 step 2]
- files: `src/components/Modal/Modal.stories.tsx`, `src/components/Sheet/Sheet.stories.tsx`
- what changed: every hidden `ModalTitle`/`SheetTitle className="sr-only"` beside a raw
  `<p className="text-style-heading">` is now one visible `ModalTitle`/`SheetTitle`
  (Modal: Default, LargerContent, Controlled, NoOverlay; Sheet: DemoBody, Controlled,
  CustomWidth). Body copy uses `ModalDescription`/`SheetDescription`; list labels use
  `ButtonText`; the inline `open` code chip is `LabelText as="code"` with
  `rounded-tight px-xxs` (`rounded` is not a radius token).
- consumer impact: none (stories). Rendered look unchanged; each dialog's accessible
  name now equals its visible heading.
- breaking: no
- verified: on resume, `rg 'Title className="sr-only"'` in both files → no output; imports
  consistent. Lint at end.
- docs owed: none

### Stories that contradict uncovered defaults [F-105, WI-020 steps 3-4]
- files: Tooltip, Sheet, DropdownMenu, DatePicker, ProgressIndicator, WavyDivider,
  ShapeMorphSpinner stories (more appended below as they land).
- what changed (new story exports, each with a one-line JSDoc naming the default):
  - Tooltip `InlineNoDelay` — `portal={false}`, `sideOffset={16}`, provider `delayDuration={0}`.
  - Sheet `NoOverlay` — `withOverlay={false}`.
  - DropdownMenu `ModalInlineDismissOnFocusLoss` — `<DropdownMenu modal>`, content `portal={false} dismissOnFocusLoss`.
  - DatePicker `SplitTriggerCustomPresetsLocale` — custom `splitPresets`, `locale="de-DE"` (uses the current `onValueChange`, not the WI's `onChange`).
  - ProgressIndicator `Prominent` — `color: LoadingSpinnerColor.prominent`; `Interactive` now uses
    `SliderContinuous` + `LabelText` instead of a raw range input and span.
  - WavyDivider `HeavyStroke` — `strokeWeight: 4`.
  - ShapeMorphSpinner `SlowTiming` — `timing: { duration: 1200, interval: 2400, ease: "linear" }`.
  - Toast `ProviderDuration` already existed (WI-093) — not re-added.
- consumer impact: none (stories).
- breaking: no
- docs owed: none

### Raw text elements in stories → DS text roles, by script [F-105/F-118, WI-020 step 5, WI-121 step 8]
- files: script `docs/audit/_work/scratch/waveE/story-text-roles.mjs` (`--verify`); edited
  AIModelSelect, Avatar, HotkeyIndicator, LoadingSpinner, Shapes, Tabs, WavyDivider stories.
- what changed: one mapping — `<span|p|code className="… text-style-label|body …">` →
  `LabelText`/`BodyText` (with `as="p"`/`as="code"` so the element is unchanged), the
  rest of the class string kept; `../Text` import merged or added. CopyButton is done by
  hand (WI-121 maps its snippet to the mono role); Text/ stories are excluded (they
  demonstrate the classes).
- consumer impact: none (stories); same element, same role classes.
- breaking: no
- verified: script `--verify` (see end).
- docs owed: none

### More override stories, raw elements and wrong blurbs [F-105, WI-020 steps 4-5]
- files: AIPromptInput, AIModelSelect, Table, AnimatedText, Tabs, Toggle,
  SegmentedTabSelect, Icons, MorphRotationShape, Text/BaseText stories.
- what changed:
  - AIPromptInput: `Composer` gains `disabled`/`stoppable`; new `Disabled` and
    `RespondingWithoutStop`; `ContextGaugeColors` gains a fifth gauge with
    `size={LoadingSpinnerSize.md}` (contradicts sm).
  - AIModelSelect: new `ModelTooltipInverse` (`themeInverse`); the trigger label is `BodyText`.
  - Table: new `RowsCustomHeight` (copy of `Rows` + `rowHeight="var(--ui-height-button)"`).
  - AnimatedText: RollHover direction blurb now says `down` is the default (matches
    RollHoverText); the RollChangeText reduced-motion note now names the global
    tokens.css block (1ms motion scale), not the gone `motion-safe:` scoping; new
    `FadeChangeDirectionUp` (`direction={RollDirection.up}`), also listed in the overview.
  - Tabs: `IconTabs` draws `TableIcon`/`GraphIcon` with `aria-label`s instead of two inline
    SVGs; new `UnselectedAndFill` (`TabVariant.unselected`, `TabSize.fill`).
  - Toggle: new `ItemSizeOverride` (WI's `ToggleSize.default` is now `ToggleSize.standard`).
  - SegmentedTabSelect: new `ItemOverrides` (item `variant`/`size` contradict the inherited ones).
  - Icons: `IconCell` label is `LabelText` (was an inline-styled 11px span); the two "Open"
    sidebar cells now draw `SidebarLeftHoverIcon`/`SidebarRightHoverIcon` (they drew the
    closed icon) and all four are relabelled; new `Playground` story that renders args
    (`strokeWidth: 3`, `strokeColor`, `fillColor`). `IconSize` (WI-065) already landed.
  - MorphRotationShape: deleted `EmbeddedDropdownCaret` (a hand-built duplicate of the
    shipped DropdownCaret; `Menus/DropdownCaret` shows embedded mode) and its now-unused
    `ChevronDownIcon` / `../Menu` imports; a one-line pointer comment remains.
  - BaseText: the `MonoText` row label says `fontWeight={FontWeights.bold}`, matching its code.
- skipped:
  - Step 1 (rename `Brand`→`Prominent`, `Error`→`Danger` in Button, ShapeButton, Toast) —
    by brief: existing story exports are not renamed (their names set the Storybook URL).
  - BaseText `RawValueProps` keeps `fontWeight={700}` on purpose (it demonstrates raw
    numbers, pre-dates the audit), so the WI's `fontWeight=\{700\}` rg still hits it there.
- consumer impact: none (stories). Look changes: IconTabs draws DS icons; Icons cell labels
  use the label role (was 11px); Story id `progress-morphrotationshape--embedded-dropdown-caret` removed.
- breaking: no
- docs owed: none

### Story hygiene: DS icons and text roles, a router-link asChild demo, no dead story, theme-aware fills [F-118, WI-121]
- files: TextLink, OutlineButton, SplitButton, CopyButton, Button, Avatar, Sticker, Table stories.
- what changed:
  - TextLink: deleted `Interactive` (rendered exactly like `Default`; no pseudo-state addon);
    `WithAsChild` (export name kept) now wraps a forwardRef `RouterLink` that renders its own
    `<a>` instead of a `<button>`; story name "asChild with a router link".
  - OutlineButton: the local 16-unit `SearchIcon` SVG is gone; the four uses draw the DS
    `SearchIcon size={IconSize.md}`.
  - SplitButton: meta gains `component: SplitButton` (`Meta<typeof SplitButton>`,
    `StoryObj<typeof meta>`) so Docs gets a props table; `WithIcon` uses `PlusIcon size={IconSize.rg}`.
  - CopyButton: snippet is `MonoText as="code"`, status line `BodyText as="p"`; numeric
    spacing → scale (`gap-md p-lg`, `gap-sm px-md py-sm`, and the first story's `gap-lg p-lg`).
    The WI's `gap-rg p-md` / `gap-xs` / `px-rg py-xs` are pre-rename names; the current scale
    words for the same pixels are used.
  - Button: `as (typeof ButtonVariant)[keyof typeof ButtonVariant][]` → `as ButtonVariant[]`.
  - Avatar: logo fills `#0A0A0A`/`#390EF8` → `className="fill-text"` / `"fill-prominent-color"`
    (follows the theme); `gap-3` → `gap-md`; the ⌘ label is `LabelText` (via the script).
  - Sticker: dropped the unused `args: { children: "Milestones" }` from `Sizes` and `AllVariants`.
  - Table: `Default` drops its `border border-border-primary rounded-soft` override (Table
    already draws `border border-border-primary rounded-normal`; `h-[420px]` stays); the six
    wrapper `<div>`s inside two-line cells are removed so the two `BodyText`s stack as
    TableCell's flex-col children.
- not done: step 7 (Button.tsx header line "Keep `ButtonVariant.prominent`…" gains its
  failure) — `Button.tsx` is component code, outside this lane (stories only). Owner: E1/E2.
- consumer impact: none (stories). Look changes the WI already names: OutlineButton/SplitButton
  icons are DS geometry; CopyButton snippet is mono; Table Default has rounded-normal corners
  and stacked two-line cells; Avatar glyph reads in dark theme. Story id
  `text-textlink--interactive` removed.
- breaking: no
- verified: every WI-121 step-11 rg assertion → no output (CopyButton/Avatar spacing included);
  `fill="#"`, `<button`, `<svg` gone from the named files.
- docs owed: none

## Verification (end of run)
- `npm run lint` → exit 0.
- `node docs/audit/_work/scratch/waveE/story-text-roles.mjs --verify` → ok (no raw
  `text-style-*` element in any story outside Text/; every role used is imported; no mixed EOLs).
- `storybook-imports.mjs --verify` → OK.
- WI-020 step 6 rg: sr-only titles, raw range/svg/text-style spans, `EmbeddedDropdownCaret`,
  `` `up` (default) ``, `motion-safe:` scoped → no output. `fontWeight=\{700\}` still hits
  BaseText `RawValueProps` (intentional raw-value demo). Each override value present; Toast's
  `ProviderDuration` (pre-existing) uses `duration={1000}`, not 10000.
- Scoreboard after: motion 0 · arbitrary px 0 · numeric spacing 0 · raw var 5 · focus 0 ·
  disabled 0 · use-client 27 · timers 5 · onValueChange 0 · default exports 0. Nothing moved
  up (stories are outside the scoreboard; arbitrary px went 1 → 0 from E1's Sheet.tsx work).
- Storybook not run (brief); orchestrator to check visually: Modal/Sheet titles, Tooltip
  `InlineNoDelay`, DropdownMenu `ModalInlineDismissOnFocusLoss`, Icons sidebar Hover cells,
  Tabs `IconTabs`, SplitButton props table, TextLink router link, Avatar dark theme, Table Default.


### Orchestrator follow-up after wave E (2026-10-04)
- `src/components/Button/Button.tsx` header: the "keep `ButtonVariant.prominent`" constraint now names its failure (WI-121 step 7, outside E3's story-only lane). It is comment-only.
- Probe: `Calendar` takes `ref` and root attributes; `DatePicker` takes `triggerProps` / `contentProps`. tsc exits 0.

<!-- merged from _work/changes/06F1-splitbutton.md -->
### 06F1 — SplitButton (WI-084 → WI-085 → WI-117)

Checklist
- [x] baseline: scoreboard captured; esbuild "before" bundle + SSR render reproduces
  the three WI-117 FAILs and the unnamed trigger
- [x] WI-084 split parts on secondary `buttonVariants` + default trigger name
- [x] WI-085 `SplitButtonGroup` part
- [x] WI-117 merge order of triggerProps / part-level disabled
- [x] verify: lint, scoreboard after, class diff, 55-split-triggers equivalent, type probe

---

### SplitButton parts are built on the secondary Button recipe, and the trigger has a default name [F-041, F-081, WI-084]
- files: `src/components/SplitButton/SplitButton.tsx`, `src/components/SplitButton/SplitButton.stories.tsx`
- what changed: `SplitButtonAction` and `SplitButtonTrigger` now compose
  `buttonVariants({ variant: secondary, size: standard | icon })` (deep imports
  from `../Button/Button` and `../Button/constants`) plus only the split
  geometry: one-sided radius (`rounded-r-none` / `rounded-l-none`), the shared
  seam (`border-r-0` on the action), the action's 16px inline padding (`px-lg`),
  and a `PART_SHADOW_NONE` list that cancels the recipe's rest/hover/active
  shadows (the group keeps `shadow-button`). The hand-written paint and state
  classes are gone. `SplitButtonTrigger` renders `aria-label="More options"`
  unless the consumer passes `aria-label` (overrides) or `aria-labelledby`
  (then no default label is set). The prop is declared with JSDoc on
  `SplitButtonTriggerProps`.
- class diff (computed by `cn` from an esbuild bundle, SSR before vs after; all
  three stories' renders: Default, WithIcon, Disabled):
  - Action — removed `ds-gap-ui-sm` → added `gap-sm` (same 8px, `--spacing-sm` =
    `--ui-spacing-sm`; the recipe's spelling). Removed `pl-lg pr-lg` → `px-lg`
    (same 16px). Removed `rounded-l-tight` → `rounded-tight` + kept
    `rounded-r-none` (same geometry; Tailwind 4.3 emits `rounded-r-none` after
    `rounded-tight`, confirmed by compiling a probe with the repo's tailwindcss).
  - Trigger — removed `rounded-r-tight` → `rounded-tight` + `rounded-l-none`
    (same geometry, same ordering proof). Added `p-0` (preflight already zeroes
    button padding: no change). Added `text-style-button` (icon-only, fixed
    `size-button` box, centred svg: no visible change).
  - Both — `border-border-primary` → `border-secondary-border` (light #dddddd →
    #e2e3e4, dark #333437 → #303235): FIX, the parts painted a different
    border token from the secondary Button they sit beside.
  - Both — added hover/active `border-secondary-border-hover/-active`: FIX,
    the secondary Button changes its border on hover/press, the parts did not.
  - Both — added `disabled:bg-secondary-disabled`: FIX, Button's contract is
    "each variant paints its own disabled bg/border tokens", the parts only
    dimmed the rest fill.
  - Both — added `aria-disabled:bg-secondary-disabled
    aria-disabled:border-secondary-border-disabled`: FIX, `aria-disabled` parts
    had no disabled paint (the hover/active guards already honoured it).
  - Both — added `whitespace-nowrap` (action label can no longer wrap inside the
    fixed 38px height) and, on the action, `justify-center` (no visible change
    at content width; centres the label if a consumer widens the part, like
    Button). Convergence with Button.
  - Both — added `shadow-none` + hover/active `shadow-none`: keeps today's look
    (parts had no shadow); they override the recipe's per-part shadows, which
    `cn` removes from the output (`shadow-button-secondary`,
    hover `shadow-button-hover`, active `shadow-button-active` do not appear).
  - Unchanged: group wrapper classes (byte-identical), `h-button`/`size-button`,
    `bg-secondary text-secondary-fg`, hover/active bg, `ds-motion-state`
    (transition was already converged by the motion wave, so the WI's
    100ms→150ms item no longer applies), `ds-focus-visible-ring`,
    `ds-disabled-state`, `disabled:border-secondary-border-disabled`, the
    action's `ds-size-icon-rg` icon slot.
  - No correct state's look was kept back: every visible change above is one
    the WI names as the drift fix.
- story: `WithDropdown`'s trigger passes `aria-label="More save options"` (the
  override); Default/WithIcon/Disabled exercise the default label.
- consumer impact: SplitButton now matches a secondary Button exactly in border
  colour, hover/press border, disabled fill and `aria-disabled` paint. Screen
  readers announce the trigger as "More options" by default.
- breaking: no
- verified: SSR from an esbuild bundle of the source: trigger renders
  `aria-label="More options"`; `aria-label="Weitere Optionen"` overrides it;
  `aria-labelledby="x"` renders no `aria-label`. `rg "hover:enabled|border-border-primary"`
  on SplitButton.tsx → no output. `npm run lint` exit 0. Type probe (temp file
  under src/, removed): `aria-label`, `aria-labelledby` compile;
  `aria-label={3}` fails.
- docs owed:
  - codebase SKILL (`.agents/skills/dooph-ds-codebase/SKILL.md`, the SplitButton
    rows): `SplitButtonAction` Variants → "secondary `buttonVariants`";
    `SplitButtonTrigger` → "secondary `buttonVariants` (icon size); default
    `aria-label="More options"`".
  - usage SKILL (`skills/dooph-design-system-usage/SKILL.md`, SplitButton line):
    "`SplitButtonTrigger` — icon-only, named "More options" unless you pass a
    localised `aria-label`".
  - CHANGELOG `[Unreleased]` → Fixed: "`SplitButtonTrigger` has a default
    accessible name ("More options", overridable with `aria-label`), and the
    split parts now share the secondary `Button`'s paints and
    disabled/`aria-disabled` states."

### New `SplitButtonGroup` part [F-092, WI-085]
- files: `src/components/SplitButton/SplitButton.tsx`, `src/components/SplitButton/index.ts`, `src/components/SplitButton/SplitButton.stories.tsx`
- what changed: exported `SplitButtonGroup` (forwardRef div, `displayName`,
  `inline-flex rounded-tight shadow-button` merged with consumer `className`,
  rest spread) and `SplitButtonGroupProps`. The composite renders through it
  (ref and rest props forwarded as before). `src/index.ts` re-exports the
  folder with `export *`, so it is public with no further edit. The
  `WithDropdown` story uses `SplitButtonGroup` instead of a bare
  `<div className="inline-flex">`; meta already had `component: SplitButton`.
- consumer impact: a split button whose trigger opens a `DropdownMenu` can be
  composed by hand and keep the composite's radius and group shadow. The
  composite's DOM is unchanged (wrapper classes byte-identical in the SSR diff).
- breaking: no (additive)
- verified: SSR of `SplitButtonGroup` with `className="x"` →
  `inline-flex rounded-tight shadow-button x`; composite wrapper identical
  before/after; `rg 'className="inline-flex"' src/components/SplitButton` → no
  output; type probe: `<SplitButtonGroup ref={divRef} />` and
  `SplitButtonGroupProps` import from the package root compile.
- docs owed:
  - codebase SKILL: add a `SplitButtonGroup` row (`same | – | – | ❌`); append
    to the `SplitButton` row: "renders through `SplitButtonGroup` — compose
    `SplitButtonGroup` + `SplitButtonAction` + `DropdownMenuTrigger
    asChild`/`SplitButtonTrigger` to open a menu".
  - usage SKILL: name `SplitButtonGroup` among the parts, "(use it, not a bare
    div, when the trigger opens a `DropdownMenu`)".
  - CHANGELOG `[Unreleased]` → Added: "`SplitButtonGroup` — the SplitButton
    chrome as a part, for split buttons whose trigger opens a `DropdownMenu`."

### Split controls: consumer trigger props merge instead of replacing, and a part cannot re-enable a disabled control [F-095, WI-117]
- files: `src/components/DatePicker/DatePickerSplitTrigger.tsx`, `src/components/SplitButton/SplitButton.tsx`
- what changed:
  - DatePickerSplitTrigger pulls `className` and `disabled` out of
    `triggerProps`, spreads the rest first, then sets
    `disabled={disabled || triggerDisabled}` and
    `className={cn("rounded-r-none border-r-0", triggerClassName)}`. JSDoc on
    `triggerProps` documents both. The preset half still follows only the
    component-level `disabled`.
  - SplitButton composite: `{...actionProps} disabled={disabled ||
    actionProps?.disabled}` and `{...triggerProps} disabled={disabled ||
    triggerProps?.disabled}` (`icon` stays before the spread, so
    `actionProps.icon` still overrides). Inline comment explains the order.
    `actionProps`/`triggerProps` JSDoc states it.
- consumer impact: `triggerProps={{ className: "w-60" }}` on
  DatePickerSplitTrigger now keeps the seam (no doubled border / stray right
  radius). `disabled` on DatePickerSplitTrigger or SplitButton can no longer be
  undone by a part's `disabled: false`. A part-level `disabled: true` still
  disables just that part.
- breaking: no
- verified: equivalent of `docs/audit/_work/scratch/W7b/55-split-triggers.cjs`
  run against esbuild bundles of the source (callback renamed to
  `onValueChange`): before → 3 FAIL / 2 PASS (reproduced); after → 5 PASS,
  plus an extra check that `triggerProps.disabled: true` alone disables only
  the trigger. DatePickerSplitTrigger SSR with no props / `disabled` /
  `triggerProps={{id}}` is byte-identical before and after.
  `rg "\{\.\.\.triggerProps\}\s*$"` on DatePickerSplitTrigger.tsx → no output.
- docs owed: CHANGELOG `[Unreleased]` → Fixed: "`DatePickerSplitTrigger` merges
  `triggerProps.className` after its seam classes instead of replacing them,
  and `disabled` on `DatePickerSplitTrigger` / `SplitButton` can no longer be
  undone by a part's `disabled: false`."

### Verification summary
- `npm run lint` → exit 0.
- scoreboard before → after: no metric rose. (Raw `var(--ui-*)` in className
  went 5 → 0 during the run — Slider, F3's lane, not this change.)
- Neither SplitButton.tsx nor DatePickerSplitTrigger.tsx has a header contract;
  none added (inline comments cover the seam ordering and the disabled-after-
  spread order).
- Not done here (orchestrator): Storybook visual check of
  `Buttons/SplitButton/*` and `Dates/DatePicker` SplitTrigger.


<!-- merged from _work/changes/06F2-types.md -->
### 06F2 — Types say what the runtime does (WI-030, WI-126, WI-091)

Checklist:
- [x] baseline scoreboard + lint
- [x] WI-030 polymorphic render functions typed at concrete element
- [x] WI-126 Button variant/size, SheetContent side, Checkbox variant, TabsTrigger size/variant from consts
- [x] WI-091 CTAButton children only with asChild
- [x] type probe (both directions)
- [x] before/after render (esbuild bundle)
- [x] lint + scoreboard after

## Baseline (before any edit)
- scoreboard: raw var 5, "use client" 27, JS timers 5, all others 0.
- render snapshot: scratchpad `f2/entry.tsx` + `f2/snap.mjs` (esbuild bundle of the
  touched components, renderToStaticMarkup, 99 cases) → `f2/before.json`, 0 throws.
- type probe `.tmp-probe/f2.probe.tsx`: every must-compile line compiles. Exactly the 10
  new WI expect-errors are TS2578 "unused": Button variant/size null ×3, SheetContent
  side null, Checkbox variant null, TabsTrigger size and variant null, CTAButton children
  without asChild, asChild with no child, asChild with a string child.
- mutation check (copy of src, `const probe: number = <binding>` in each polymorphic
  render body: Button variant, OutlineButton glowing, ShapeButton shape,
  DropdownTrigger asChild, TextDropdownTrigger size, BaseText fontSize) → tsc exit 0:
  every binding is `any`.

---

### Polymorphic components type-check their own props again [F-036, WI-030]
- files: `src/components/Button/Button.tsx`, `src/components/OutlineButton/OutlineButton.tsx`,
  `src/components/ShapeButton/ShapeButton.tsx`, `src/components/DropdownTrigger/DropdownTrigger.tsx`,
  `src/components/Text/BaseText.tsx`
- what changed: the inner `forwardRef` render functions of Button, OutlineButton,
  ShapeButton, DropdownTrigger, TextDropdownTrigger and BaseText are now typed at their
  default element (`Props<"button">`). BaseText gets a local `BaseTextRenderProps`: own
  props + `as?: ElementType` + span attributes. Before, they were typed as
  `Props<ElementType>`, which made every destructured prop `any`. The casts this made
  redundant are gone: ShapeButton's `shape as ShapeButtons` and
  `variant as ShapeButtonVariant` (`resolvedVariant` removed; the class maps index by
  `variant`), and BaseText's `variant as TextVariant`. The exported generic cast
  signatures are unchanged. The only `Props<ElementType>` left is
  `RoleTextProps<ElementType>`, the pass-through in BaseText's role factory, which
  destructures nothing.
- consumer impact: none. Public signatures and runtime behaviour are unchanged. The
  repo's own render bodies now catch a renamed or mistyped prop at compile time.
- breaking: no
- verified: mutation check on a copy of `src` (`const probe: number = <binding>` in
  each render body). Before: tsc exit 0. After: 6 × TS2322 (Button `variant`,
  OutlineButton `glowing`, ShapeButton `shape`, DropdownTrigger `asChild`,
  TextDropdownTrigger `size`, BaseText `fontSize`). The probe compiles
  `<OutlineButton<"a"> href glowing>`, `<DropdownTrigger<"a"> href>`,
  `<TextDropdownTrigger<"a"> href>`, `<ShapeButton<"a"> href>`,
  `<BaseText as="label" htmlFor>`, `<BodyText as="p" fontSize>`, a typed
  `onMouseMove` on OutlineButton, and button refs. `<OutlineButton glowing="yes">` still
  fails. Render snapshot identical (see Verification below).
- docs owed: none (internal typing).

### Button `variant`/`size`, SheetContent `side`, Checkbox `variant`, TabsTrigger `size`/`variant` no longer accept `null` [F-037, WI-126]
- files: `src/components/Button/Button.tsx`, `src/components/Sheet/Sheet.tsx`,
  `src/components/Checkbox/Checkbox.tsx`, `src/components/Tabs/Tabs.tsx`
- what changed: these props are now typed from their exported consts (`ButtonVariant`,
  `ButtonSize`, `SheetSide`, `CheckboxVariant`, `TabSize`, `TabVariant`). Before, they
  used cva's `VariantProps`, which admits `null`. cva reads `null` as "no variant", so
  it rendered an unstyled button, an unpositioned sheet, an unfilled checkbox or an
  unsized tab, with no warning. Button keeps the batch-05 pill restriction: its
  `ButtonVariantSizeProps` union is now built from the consts
  (`Extract<ButtonVariant, …>` / `Extract<ButtonSize, …>`), so
  `variant="danger" size="big"` still fails. The `VariantProps` imports are dropped from
  all four files. The exported cva helpers (`buttonVariants`, `checkboxVariants`,
  `tabTriggerVariants`) are cva functions, so their own argument still accepts `null`.
  That is cva's signature, not a component prop.
- header: a new bullet in Button.tsx `## constraints`: props are typed from the consts,
  never `VariantProps`, because `null` would compile and render unstyled. Checkbox's
  header is unaffected. Sheet and Tabs have no header.
- consumer impact: a TypeScript call that passes `null` for one of these props stops
  compiling. Const members, string literals and `undefined` all still compile.
  Runtime unchanged.
- breaking: yes — v6 (type-level only). Exact old → new:
  - `<Button variant={null}>` / `variant={cond ? X : null}` → `variant={undefined}` / `variant={cond ? X : undefined}`
  - `<Button size={null}>` → `size={undefined}` (or omit)
  - `<SheetContent side={null}>` → `side={undefined}` (or omit; default `right`)
  - `<Checkbox variant={null}>` → `variant={undefined}` (or omit; default `prominent`)
  - `<TabsTrigger size={null}>` / `variant={null}` → `undefined` (or omit; defaults `standard` / `ghost`)
  - The exported prop types change to match. `ButtonProps['variant'|'size']`,
    `SheetContentProps['side']`, `CheckboxProps['variant']` and
    `TabsTriggerProps['size'|'variant']` lose `| null`.
  - finder: `rg -n "(variant|size|side)=\{[^}]*\bnull\b" src`
- verified: probe. These were unused `@ts-expect-error`s before and are errors now:
  `<Button variant={null}>`, `<Button size={null}>`,
  `variant={cond ? ButtonVariant.primary : null}`, `<SheetContent side={null}>`,
  `<Checkbox variant={null}>`, `<TabsTrigger size={null}>`, `<TabsTrigger variant={null}>`.
  These compile: `variant="ghost"`, `size={ButtonSize.iconSm}`, `cond ? X : undefined`
  (Button, Sheet, Checkbox), `variant="primary" size="big"`, `size="medium"`,
  `Button<"a"> asChild`, TabsTrigger `size="fill"`, and
  `buttonVariants({ variant: ButtonVariant.primary, size: ButtonSize.sm })`.
  `variant="danger" size="big"` still fails. Declarations emitted into the scratchpad:
  the component prop types carry no `| null` (only the cva helper signatures do).
  `npm run lint` exit 0, which covers Toast's `buttonVariants` calls, CopyButton and all
  stories.
- docs owed: CHANGELOG `[Unreleased]` → Changed: "**Breaking (types):** `Button`
  `variant`/`size`, `SheetContent` `side`, `Checkbox` `variant` and `TabsTrigger`
  `variant`/`size` are typed from their exported consts and no longer accept `null`;
  pass `undefined` for the default." v6 migration skill: a hard-bucket row and step,
  with the finder above.

### CTAButton `children` type-checks only with `asChild` [F-093, WI-091]
- files: `src/components/CTAButton/CTAButton.tsx`
- what changed: the `forwardRef` const is now `CTAButtonBase` (displayName still
  "CTAButton"). The export is `CTAButtonBase as CTAButtonComponent`, a type with three
  call signatures:
  - `asChild: true` + one `ReactElement` child;
  - `asChild: boolean` + one `ReactElement` child;
  - anchor mode (`asChild?: false`, `children?: never`). It is listed last so
    `ComponentProps<typeof CTAButton>` and Storybook's `Meta` read it.
  `CTAButtonProps` stays one interface, so a consumer `extends` still works, and it
  gains a JSDoc on `children`. The ref type stays `HTMLElement`, as wave E left it.
  The render body is untouched.
- consumer impact: `<CTAButton text icon>Label</CTAButton>` is now a compile error
  (at runtime the children were silently dropped). So are `asChild` with no child and
  `asChild` with a non-element child, both of which throw at runtime today. Every working
  form still compiles.
- breaking: no (minor per the WI: only calls that rendered wrongly or threw stop compiling).
- verified: probe. The three bad forms were unused `@ts-expect-error`s before and are
  errors now. These compile: anchor with `href`, `asChild` + `<a>`,
  `asChild={isLink}` + `<a>`, `asChild={false}`, an `HTMLAnchorElement` ref,
  `interface X extends CTAButtonProps`, and `ComponentProps<typeof CTAButton>` args.
  CTAButton.stories.tsx (including `<CTAButton asChild {...args}>`) type-checks under
  `npm run lint`. The d.ts emitted into the scratchpad declares the three signatures.
- docs owed: CHANGELOG `[Unreleased]` → Changed: "`CTAButton` `children` now
  type-checks only with `asChild` (it was silently ignored otherwise); pass the label
  as `text`."

### Verification for all three
- No runtime change. An esbuild bundle of the 9 touched components, rendered with
  `renderToStaticMarkup`, covers 99 cases:
  - every Button variant × size, `null` at runtime, and asChild;
  - OutlineButton glow × inverse, and asChild;
  - every ShapeButton shape × variant;
  - DropdownTrigger and TextDropdownTrigger sizes, plus asChild;
  - every BaseText variant, `as`, unstyled, BodyText and HeadingText;
  - every Sheet side, plus the default;
  - Checkbox variant × state;
  - TabsTrigger size × variant;
  - CTAButton size × variant, asChild, and anchor + children.

  `before.json` and `after.json` are byte-identical. Harness: scratchpad
  `f2/entry.tsx` and `f2/snap.mjs`. Probe archived at scratchpad `f2/f2.probe.tsx`.
- `npm run lint` exit 0.
- scoreboard: no metric went up. Raw `var(--ui-*)` in className went 5 → 0 during the
  run; that is F3's parallel Slider work, not this change.
- `.tmp-probe/` was created and deleted; nothing is left in the repo root.
- Not done: no build in a scratch worktree, because the brief says no build. The d.ts
  was checked with `tsc --emitDeclarationOnly` into the scratchpad instead.
- Noticed, not touched: ShapeButton's header says `satisfies Record<string, Shapes>`,
  but the code is `satisfies Record<ShapeButtons, ComponentType<ShapeComponentProps>>`.
  The wording drift predates F2, and the meaning is unchanged.


<!-- merged from _work/changes/06F3-consts-nits.md -->
### 06F3 — constants placement, geometry helpers, type nits (WI-032, WI-071, WI-120)

Agent F3, wave F. Started 2026-10-03.

## Checklist
- [x] Baseline scoreboard (raw var(--ui-*) in className = 5, all Slider.tsx)
- [x] WI-032 AvatarSize + Shapes → constants.ts
- [x] WI-071 Slider / LinearProgressIndicator geometry → helpers
- [x] WI-120 type nits (in-lane parts)
- [x] lint, scoreboard after, probes

## Notes as I go
- Lane: Avatar, Shapes, Slider, LinearProgressIndicator, LoadingSpinner,
  ProgressIndicator, Calendar, ShapeMorphSpinner, MorphRotationShape,
  OutlineSection, and the slider/progress helpers in dooph-component-tokens.css.
  NOT in lane: tokens.css, sync-theme.mjs, index.css, DatePicker/**.

## Entry 1 — `AvatarSize` and `Shapes` live in sibling `constants.ts` files [WI-032, F-065]
- **files:** new `src/components/Avatar/constants.ts`, new
  `src/components/Shapes/constants.ts`; `Avatar/Avatar.tsx` (imports the
  const), `Avatar/index.ts` (re-exports it from `./constants`),
  `Shapes/index.ts` (`export * from "./constants"` replaces the inline const),
  `Shapes/shapePaths.ts` (imports `Shapes` from `./constants` instead of the
  barrel `./index` — removes an index ↔ shapePaths cycle; the
  `satisfies Record<Shapes, …>` check on the shape table is unchanged),
  `Avatar/Avatar.stories.tsx` (imports from `.`),
  `OutlineSection/OutlineSection.stories.tsx` (imports from `../Avatar`).
- **what changed:** the two discrete-option consts moved out of component /
  barrel modules into server-safe `constants.ts` files, so `AvatarSize.sm`
  stays readable from a Server Component even if Avatar later gains client
  state. Values unchanged (`AvatarSize` keys are `standard` / `sm` today — the
  WI's `small` predates the size-word rename).
- **consumer impact:** none. Same names, same values, same `src/index.ts`
  `export *` paths.
- **breaking:** no.
- **verified:** the step-1 search (`export const` + PascalCase in components,
  excluding constants.ts and stories) now lists only `Icons/BaseIcon.tsx`.
  Lint below.
- **docs owed:** `.agents/skills/dooph-ds-codebase/SKILL.md` — the "every
  component with consts uses constants.ts" exception list should name only
  `BaseIcon` (declares `IconSize` inline in a module that must stay
  server-safe), dropping `Avatar`.

## Entry 2 — Slider and LinearProgressIndicator geometry moves into helper classes [WI-071, F-017]
- **files:** `src/styles/dooph-component-tokens.css` (slider/progress helpers),
  `src/components/Slider/Slider.tsx`,
  `src/components/LinearProgressIndicator/LinearProgressIndicator.tsx`.
- **state found:** wave C had already given the progress root the mergeable
  `h-linear-progress` utility (+ `--ui-height-linear-progress: 4px`) and moved
  the slider dot's size into `.ds-slider-dot` (`--ui-size-slider-step`). Kept
  both. Left: 5 raw `var(--ui-*)` class strings in Slider.tsx plus the
  `var(--ds-*)` / `4px` / `2px` arbitraries in both files.
- **what changed:**
  - New helpers `.ds-slider-root` (height), `.ds-slider-active-part`
    (left/width), `.ds-slider-inactive-part` (right/left), `.ds-slider-thumb`
    (width/height/background). `.ds-progress-fill` gains width + background,
    `.ds-progress-remainder` gains left.
  - Slider.tsx / LinearProgressIndicator.tsx use those class names instead of
    the arbitrary values. Slider's "calc() class strings must stay single
    literals" comment now points at the CSS helpers that share
    thumbAlignedLeft()'s formula.
  - Helpers, not mergeable utilities, on purpose: none of these elements
    receives the consumer's className (Slider's goes to the outer box; the
    progress root keeps its `h-linear-progress` utility), so no override is
    lost.
- **deviation from the WI:** the WI added three tokens to tokens.css
  (`--ui-size-slider-dot`, `--ui-height-linear-progress`,
  `--ui-linear-progress-gap`). tokens.css and sync-theme.mjs are outside this
  lane. The first two already exist (as `--ui-size-slider-step` and
  `--ui-height-linear-progress`). For the gap I used the existing 4px spacing
  token: `var(--ui-spacing-xxs) / 2` either side. The progress nub's minimum is
  `var(--ui-height-linear-progress)` (4px). If the maintainer wants a dedicated
  `--ui-linear-progress-gap`, it is a one-line token + EXCLUDED entry and a
  swap in the two helper declarations.
- **consumer impact:** none visible. Every moved declaration is
  character-identical to what Tailwind emitted for the old class (compiled the
  old classes with tailwindcss 4.3.3 `compile().build()` and diffed against the
  helpers, substituting the two token values: ALL EQUAL, 11/11 declarations).
  The new `ds-slider-*` / `ds-progress-*` names ship in styles.css.
- **breaking:** no.
- **verified:** see bottom (lint, scoreboard).
- **docs owed:** none new (no new tokens). If a dedicated gap token is added
  later: token-contract.md "Linear Progress" bullet + CHANGELOG Added.

## Entry 3 — Type nits: no-op casts dropped, shape-list types readonly, date and event types spelled directly [WI-120, F-115]
- **files:** `LoadingSpinner/LoadingSpinner.tsx`,
  `ProgressIndicator/ProgressIndicator.tsx`, `Slider/Slider.tsx`,
  `Calendar/dateFormat.ts`, `Calendar/CalendarGrid.tsx`,
  `ShapeMorphSpinner/ShapeMorphSpinner.tsx`,
  `MorphRotationShape/MorphRotationShape.tsx`.
- **what changed:**
  - `getSpinnerGeometry(size as SpinnerSizeKey)` → `getSpinnerGeometry(size)`
    in LoadingSpinner and ProgressIndicator (and the unused `SpinnerSizeKey`
    import removed). `LoadingSpinnerSize` and `SPINNER_DIAMETERS` keys are now
    tied at compile time again: a size added to one and not the other fails
    `npm run lint` instead of rendering NaN geometry. They match today
    (sm/rg/md/xl).
  - Slider: `VARIANT_PAINTS[variant as SliderVariant]` → `VARIANT_PAINTS[variant]`.
  - `SHAPE_MORPH_SPINNER_SHAPES` is `readonly DsShapeComponent[]`; the internal
    default key list is `readonly Shapes[]`; `ShapeMorphSpinner`'s `shapes`
    and `MorphRotationShape`'s `shapes` (and its `useShapesKey`) take
    `readonly ShapeInput[]`. MorphRotationShape's header ("changing `shapes`
    remounts the inner component") still holds: type-only, the identity
    comparison is unchanged.
  - `buildYearOptions` reads `bounds?.from` / `bounds?.to` into locals instead
    of `bounds!.from!` / `bounds!.to!` (same truthiness, narrowed by the
    existing `hasFrom` / `hasTo`).
  - CalendarGrid imports `KeyboardEvent` by name instead of `React.KeyboardEvent`.
- **skipped (as it applies now):**
  - LoadingSpinner `as CSSProperties` style casts: the WI called the spokes
    cast a no-op because its object "holds no custom property". It now spreads
    `vars` (`--ds-spinner-time-scale`), as do the flat and star objects, so the
    cast is no longer a no-op on a custom-property-free literal. Left all three.
  - `DEFAULT_CALENDAR_PRESETS` / `DEFAULT_SPLIT_TRIGGER_PRESETS` → `readonly`,
    and the two DatePicker steps (`DatePickerSplitTrigger` `presets?: readonly
    CalendarPreset[]`; `DatePicker` `splitPresets?: readonly CalendarPreset[]`
    instead of `Parameters<typeof DatePickerSplitTrigger>[0]["presets"]`).
    `DatePicker/**` is outside this lane (F1 is editing DatePickerSplitTrigger),
    and making either default readonly before that prop is widened breaks
    `<DatePickerSplitTrigger presets={DEFAULT_…}>` (the constants doc tells
    consumers to do exactly that). Order to land: widen the two DatePicker props
    first, then flip both consts in Calendar/constants.ts:118 and :128.
- **consumer impact:** `SHAPE_MORPH_SPINNER_SHAPES.push()/.reverse()` etc. is
  now a type error (it would have rewritten every instance's default). A
  consumer annotation `const s: DsShapeComponent[] = SHAPE_MORPH_SPINNER_SHAPES`
  now fails; copy it (`[...SHAPE_MORPH_SPINNER_SHAPES]`). Every value the
  `shapes` props accepted before still compiles, plus readonly / `as const`
  arrays now do too. No emitted JS changes.
- **breaking:** no (map: patch). Type-level edge: the annotation case above —
  list it in the CHANGELOG `Changed` note.
- **verified:** lint exit 0. Source-level type probe
  (scratchpad `probe/probe.tsx`, paths → `src/index.ts`): the
  `@ts-expect-error` on `SHAPE_MORPH_SPINNER_SHAPES.reverse()` is used, and
  every "must keep compiling" line from W7b `probe60.tsx` (mutable arrays,
  the defaults passed back in, spreads, both DatePicker forms with today's
  `onValueChange`) plus `as const` key arrays into ShapeMorphSpinner and
  MorphRotationShape compile; exit 0. `rg "as SpinnerSizeKey|as SliderVariant|
  bounds!|React\.KeyboardEvent"` over LoadingSpinner/ProgressIndicator/Slider/
  Calendar → none.
- **docs owed:** CHANGELOG `[Unreleased]` → Changed:
  `SHAPE_MORPH_SPINNER_SHAPES` is a `readonly` array, so one consumer can no
  longer mutate the default for every instance; copy it to get a mutable
  array. `ShapeMorphSpinner` / `MorphRotationShape` `shapes` accept readonly
  arrays. (Add the two calendar defaults to the same note when they land.)

## Verification (whole batch)
- `npm run lint` → exit 0.
- Scoreboard before → after: raw `var(--ui-*)` inside className brackets
  5 → 0 (all were Slider.tsx). Every other number unchanged.
- WI-071 rg (`\[var\(--ui-|\[var\(--ds-|-\[[0-9]+px\]|max\(4px|calc\(-1` in
  Slider.tsx / LinearProgressIndicator.tsx) → 0 hits.
- WI-071 equivalence: old classes compiled with tailwindcss 4.3.3 vs the new
  helper declarations → 11/11 identical (scratchpad `cmp.cjs`).
- esbuild bundle of `src/index.ts` (scratchpad `bundle.cjs`): `AvatarSize.sm`
  → `sm`, `Shapes.clover` → `clover` (13 keys), `SHAPE_MORPH_SPINNER_SHAPES`
  length 6. SSR render of SliderStepped / LinearProgressIndicator shows the
  helper classes and no arbitrary values; a consumer `h-sm` on the progress
  root still replaces `h-linear-progress`.
- Not run: Storybook / build (per brief). Visual check owed to the
  orchestrator: Inputs/Slider (stepped glide, drag), Progress/
  LinearProgressIndicator, Avatar, OutlineSection, Progress/LoadingSpinner.


### Orchestrator follow-up after wave F (2026-10-04): WI-120 readonly presets
- `DEFAULT_CALENDAR_PRESETS` and `DEFAULT_SPLIT_TRIGGER_PRESETS` are now `readonly CalendarPreset[]`.
- `DatePickerSplitTrigger` `presets` and `DatePicker` `splitPresets` accept `readonly CalendarPreset[]`; the `Parameters<…>` form is dropped. F3 could not reach these files from its lane.
- breaking: no. Widening a prop to readonly accepts every array it accepted before.
- verified: lint exits 0.

## 2026-10-04 — maintainer review round 1

### Quick fixes (orchestrator; `docs/audit/_work/scratch/review1/quick-fixes.mjs` + small scripts)
- files: DropdownCaret.tsx, tokens.css, dooph-component-tokens.css,
  Checkbox.tsx, scripts/sync-theme.mjs (EXCLUDED), stories (Button, ShapeButton,
  Toast, Input, VerificationCode, Toggle, SegmentedTabSelect, Calendar,
  DatePicker).
- what changed:
  - The typeable dropdown caret morphs clover → eight-leaf clover (was puff).
  - `--ui-spinner-spokes-duration` 1280 → 1800ms, so spokes and star spin
    slower. The star shares the spokes rate.
  - `--ui-size-cta-shape-big` 50px → the big chip size (60px), so the big CTA
    shape fills its frame to the pill padding, like standard.
  - Focus-ring width is now tokenised:
    - `--ui-focus-ring-width` (4px) and `--ui-focus-ring-width-sm` (2px);
    - every `ds-focus-*` helper reads
      `var(--ds-focus-ring-width, var(--ui-focus-ring-width))`;
    - a new `ds-focus-ring-sm` modifier, which Checkbox uses.
  - During a drag, a slider's highlighted (tall) step takes the slider colour
    when it sits off the fill, so the "previous value" mark is visible until
    release.
  - Story renames:
    - `Brand` → `Prominent` (Button, ShapeButton, Toast);
    - `Error` → `HasError` (Input, VerificationCode), and Toast `Error` → `Danger`;
    - `IconSizes` → `IconOnlySizes` (Toggle, SegmentedTabSelect).
  - Calendar and DatePicker stories get `tags: ["autodocs"]`, so each has a
    top-level Docs page.
- consumer impact:
  - Checkbox focus ring is 2px.
  - Big CTA shape is larger.
  - Spokes and star spin slower.
  - The typeable caret's second shape changed.
  - New theme levers: `--ui-focus-ring-width(-sm)`.
- breaking: no. Story URLs changed for the renamed stories (maintainer:
  doesn't matter).
- verified: `npm run lint` exits 0; `npm run sync-tokens` ok; the new tokens
  are excluded from the Tailwind theme.
- docs owed: token-contract (focus-ring width tokens, CTA shape size, spokes
  duration).

<!-- merged from _work/changes/07R1-toggles-icons.md -->
### 07R1 — Maintainer review: toggles and icons (agent R1)

## Progress (write-to-disk-first)
- [x] 0. Rules read; scoreboard baseline (all hard metrics 0; "use client" 27; timers 5)
- [x] 1. FancyToggleSwitch: multi-select removed
- [x] 2. Disabled + selected fancy option with an icon
- [x] 3. ToggleSwitch `unselected` variant in the light/dark options
- [x] 4. Icon stroke widths from the token (script)
- [x] 5. HeartFillIcon on the 24-unit grid + gallery cell
- [x] 6. lint + scoreboard after

---

### FancyToggleSwitch is single-select only, like ToggleSwitch; multi-select and `FancyToggleSelectType` are gone [maintainer review]
- files: `src/components/Toggle/FancyToggleSwitch.tsx` (code + header), `src/components/Toggle/fancyToggleOption.ts` (code + header), `src/components/Toggle/constants.ts`, `src/components/Toggle/index.ts`, `src/components/Toggle/FancyToggleSwitch.stories.tsx`, `src/components/Toggle/Toggle.tsx` (header wording only)
- what changed:
  - Maintainer decision: the fancy row behaves exactly like ToggleSwitch. One option is always chosen and the user can never clear it. The root calls the shared `useNeverClearedValue` from `Toggle.tsx` and always hands Radix a controlled `type="single"` value.
  - Removed: the `selectType` prop, the per-mode prop union (`FancyToggleSwitchProps` is now one interface: `value?: string`, `defaultValue?: string`, `onValueChange?: (value: string) => void`), the item presentation context, and the `FancyToggleSelectType` const + type (constants.ts and the Toggle barrel; `src/index.ts` re-exports the folder, so it is gone from the package root too).
  - `fancyToggleOptionVariants` lost its `selectType` variant; `selected:enabled:cursor-default` is now in the base (the chosen option can't be clicked off, so it doesn't read as clickable).
  - Headers: FancyToggleSwitch's behaviour now says "single select only, same as ToggleSwitch"; the hook-order constraint about the mode branch is gone (there is no branch). fancyToggleOption's hover/cursor bullet no longer mentions modes. Toggle.tsx's header says "FancyToggleSwitch also calls" instead of "FancyToggleSwitch's single mode also calls".
  - Story `Inputs/FancyToggleSwitch › Multi Select` removed.
- consumer impact: none shipped — FancyToggleSwitch and `FancyToggleSelectType` are not in any release yet (absent from HEAD; package 5.3.0). Anyone on the working tree passing `selectType` gets a type error.
- breaking: no (never released)
- verified: see the end of this record.
- docs owed: whatever CHANGELOG `[Unreleased]` / skill text was drafted for FancyToggleSwitch (05e record) must drop `selectType`, `FancyToggleSelectType` and multi-select.

### Disabled + selected fancy option with an icon: story gap, not a code bug [maintainer review]
- files: `src/components/Toggle/FancyToggleSwitch.stories.tsx`
- what changed:
  - Finding: the old `Disabled` story's icon row had "Pay" SELECTED but ENABLED next to a disabled, unselected "Receive". So the only selected icon option on screen was not disabled; it rightly showed full colour. No story rendered a disabled + selected icon option.
  - The code already fades it the same way as the check mode: `ds-disabled-state` sits on the whole option button (`opacity: var(--ui-opacity-disabled)` on `:disabled`), and Radix puts `disabled` on the item button whether the root or the item is disabled. Opacity on the option composes over every child, the icon circle included; no indicator class sets its own opacity. No code change.
  - `Disabled` story now has four rows: whole row disabled (check mode), whole row disabled (icon mode — selected "Pay" disabled, `data-testid="disabled-icon-selected"`), only the selected icon option disabled, only an unselected icon option disabled.
- consumer impact: none.
- breaking: no
- verified: reasoning from the CSS (`src/styles/dooph-component-tokens.css` `.ds-disabled-state:is(:disabled, [aria-disabled="true"])`); orchestrator to confirm visually in the new rows.
- docs owed: none.

### ToggleSwitch `unselected` variant: story-only — Light and Dark were plain primary options [maintainer review]
- files: `src/components/Toggle/Toggle.stories.tsx`
- what changed:
  - Finding: "light" and "dark" in `UnselectedVariant` are option values, not themes. The story set `ToggleVariant.unselected` on the Auto item only, while the switch was `primary`, so choosing Light or Dark correctly showed the primary fill. `toggleOption.ts`'s contract defines `unselected` as per-option ("for an option that must never read as selected"), and the code already gives it no selected fill whatever the state. No code change.
  - Story now shows two rows: `variant={ToggleVariant.unselected}` on the switch (every option — Auto, Light, Dark — keeps the unselected look whichever is chosen; test ids `unsel-all-*`), and the original per-item row with a caption saying Light/Dark still take the switch's primary fill.
- consumer impact: none.
- breaking: no
- verified: see the end of this record.
- docs owed: none.

### Icon stroke widths: every icon leaf already takes the token; a guard script now proves it, and the gallery's odd 0.5 weight is gone [maintainer review]
- files: `docs/audit/_work/scratch/review1/icon-stroke-token.mjs` (new), `src/components/Icons/Icons.stories.tsx`
- what changed:
  - Finding: none of the 88 `src/components/Icons/*Icon.tsx` leaves sets `strokeWidth` / `stroke-width` (attribute, style key or default). They all inherit BaseIcon's `strokeWidth ?? "var(--ui-icon-stroke-width)"`, and the token is 2 in `tokens.css`. The only odd weight on screen came from the `Icons/BaseIcon › Icon Colors` story, which passed `strokeWidth={0.5}` to `TagIcon`. That override is removed (the story is about colour). The `Playground` story keeps its explicit `strokeWidth: 3` — that is the documented consumer-override demo.
  - The script strips any hardcoded stroke width from icon leaves and, with `--verify`, fails if one remains, if BaseIcon stops defaulting to the token, or if the token is not 2. Run: 0 files changed; `--verify` OK. Filled glyphs (HeartFill, StopFilled) carry no stroke and are untouched. BaseIcon is never edited, so a consumer `strokeWidth` still wins (probe: `<HeartFillIcon strokeWidth={3}/>` renders `stroke-width:3`; a default icon renders `stroke-width:var(--ui-icon-stroke-width)`).
  - Out of my lane, noted for the maintainer: `src/components/Checkbox/Checkbox.tsx` draws its own check and indeterminate glyphs as inline `<svg viewBox="0 0 10 10">` with `strokeWidth="1.5"`. They are not DS icons, so the token does not reach them.
- consumer impact: none.
- breaking: no
- verified: script run + `--verify`; server-render probe above.
- docs owed: none.

### HeartFillIcon fills the 24-unit icon grid and appears in the Icons gallery [WI-072, F-043]
- files: `src/components/Icons/HeartFillIcon.tsx`, `src/components/Icons/Icons.stories.tsx`
- what changed: the path was drawn on a 16-unit grid inside BaseIcon's 24-unit viewBox, so it rendered at about 58% size in the top-left corner. It is now the same outline scaled ×1.5 about the origin (the WI-072 path, bbox x 1.5–22.5, y 3.75–21.75). `fill="currentColor"` and `stroke="none"` are unchanged. The `Settings & System Icons` gallery story has a new `HeartFill` cell after `Check` (the import already existed).
- consumer impact: every `<HeartFillIcon>` is now full size and centred horizontally like its siblings; anyone who compensated with a bigger `size` or an offset will see it grow.
- breaking: no
- verified: `rg "M15 6.375" src` → 0; `HeartFillIcon` in Icons.stories.tsx → import + gallery cell + the existing Icon Colors use; probe render shows the new path.
- docs owed: CHANGELOG `[Unreleased]` → Fixed: "`HeartFillIcon` now fills the 24-unit icon grid (it rendered at about 58% size in the top-left corner)." REMEDIATION.md WI-072 status → review (not edited here).

### Verification (whole record)
- `npm run lint` (tsc --noEmit): exit 0.
- Scoreboard before → after: unchanged (hard metrics 0; "use client" 27 → 27; timers 5 → 5).
- esbuild + `renderToStaticMarkup` probe: `FancyToggleSelectType` no longer exported from the Toggle barrel; a disabled row's selected icon option renders `disabled=""` + `data-state="on"` + `ds-disabled-state` on its button, so the standard disabled opacity covers the icon circle.


<!-- merged from _work/changes/07R2-loaders.md -->
### 07R2 — loader review fixes (Material spinner, progress-to-0 flash, WI-113)

Agent R2. Started 2026-10-04.

## Checklist
- [x] Baseline scoreboard (motion literals 0, "use client" 27, timers 5)
- [x] WI-113 ShapeMorphSpinner default size md → rg
- [x] WI-113 LoadingSpinner role status → progressbar
- [x] LoadingSpinner flat → Material circular indeterminate (CSS only) — code + header + tokens + sync-tokens done
- [x] ProgressIndicator flat: clean animation back to 0 — track offset now −(active+gap) (waveGeometry.ts)
- [x] lint exit 0; scoreboard unchanged (all metrics equal before → after); probe scripts

## Entry 1 — LoadingSpinner `flat` now runs Material's circular indeterminate animation
- **files:** `src/components/LoadingSpinner/LoadingSpinner.tsx` (header
  contract rewritten for the new behaviour; path is now two laps, starting one
  gap before 12 o'clock), `src/components/LoadingSpinner/spinnerGeometry.ts`
  (`SPINNER_MIN_SWEEP` 0.07 → 0.008; `SPINNER_MAX_SWEEP` stays 0.72, comment
  says why), `src/styles/index.css` (`@property --ds-spinner-phase` replaced by
  `--ds-spinner-grow` + `--ds-spinner-tail`; `.ds-spinner-flat*` rules;
  `ds-spinner-phase` keyframes replaced by `ds-spinner-dash`; reduced-motion
  rule also stops `.ds-spinner-flat-turn`), `src/styles/tokens.css`,
  `scripts/sync-theme.mjs` (the three spinner duration tokens recorded in
  `EXCLUDED`), `npm run sync-tokens` run (no spinner theme key emitted).
- **what changed:** the old flat arc grew/shrank on a cosine while its head
  made two turns per cycle, which made the tail look stuck while the head ran
  on. It is replaced by Material/MUI's recipe, CSS only: the arc group turns at
  a constant rate (`--ui-spinner-rotate-duration`, linear), and on the <svg>
  two registered numbers animate per `--ui-spinner-duration` on the standard
  curve per keyframe segment — grow 0 → 1 → 1 (min → max sweep) and tail
  0 → 0.118 → 0.985 of a turn (Material's offsets 0/−15/−125 rescaled from its
  126.9-unit circle). Sweep is clipped to 1 − tail, which is Material's "dash
  slides off the path end": the head holds while the tail chases it to a dot.
  The grey track is kept as the complement, a gap clear of each end. Both
  dashes stay strictly inside a two-lap open path (probe: path span 0.05–1.985
  turns at every size, track never shorter than 0.098 turn, never overlaps the
  arc), so no dash is ever cut by the seam. Max sweep kept at 0.72 rather than
  Material's ≈0.79: at `sm` 0.79 leaves the track ≈3 % of a turn (a dot). The
  dash easing is `--ui-motion-ease-standard` (0.4,0,0.2,1) — the scale has no
  plain ease-in-out, and Material's own standard curve is this one.
  Reduced motion: the arc freezes at its longest with its tail at 12 o'clock,
  no turn. Spokes and star are unchanged.
- **consumer impact:** the flat spinner looks and times like Material's.
  `--ui-spinner-duration` default 1800ms → 1400ms and now means one dash
  cycle (not "grow+shrink while the head makes two turns"). New token
  `--ui-spinner-rotate-duration: 1400ms` (one turn of the flat arc group).
  A consumer who overrode `--ui-spinner-duration` keeps a working spinner; the
  number now times the dash cycle only.
- **breaking:** no (token kept; one token added; value/feel change only).
- **verified:** lint exit 0; scoreboard unchanged; postcss parse of index.css
  lists the new rules/keyframes/@property; scratch probe of the dash maths over
  1001 frames at all four sizes (inside (0,2) laps, no overlap, track > 0).
  Not visually checked (orchestrator to check the Storybook Flat stories).
- **docs owed:** loading-indicators skill (`.agents` + `.claude` copies, and
  the consumer skill if it describes the flat arc): replace the "cosine sweep,
  head makes two turns" description with the Material recipe above, the
  two-lap path rule, and the new `--ui-spinner-rotate-duration` token; token
  contract / theming docs: add `--ui-spinner-rotate-duration`, update
  `--ui-spinner-duration`'s meaning and default (1400ms); CHANGELOG
  `[Unreleased]` → Changed: "LoadingSpinner flat now uses Material's circular
  indeterminate motion; `--ui-spinner-duration` is 1400ms and a new
  `--ui-spinner-rotate-duration` times the turn."

## Entry 2 — ProgressIndicator flat no longer flashes when progress returns to 0
- **files:** `src/components/ProgressIndicator/waveGeometry.ts`
  (`getWavyTrackGeometry` offset, plus its doc comment).
- **what changed:** cause: the track's dashoffset for progress > 0 was written
  as a positive wrap, `length + C − (active + gap)` (≈2C − 2·active), while the
  full circle at 0 uses offset 0. Statically identical, but `.ds-progress-arc`
  transitions dashoffset, so going back to 0 interpolated the offset across
  ≈2C: the track dash vanished mid-transition and regrew clockwise from
  12 o'clock over the shrinking indicator (probe: at rg, 0.3 → 0, the track is
  [0, 1.8] at 40 % and [0, 21.6] at 60 % while the indicator is still [0, 7–11]).
  This predates wave A (the old inline formula was the same); wave A's
  null-track change was not involved (null only near 1). Fix: offset is now
  the negative start, `−(active + gap)`, which is continuous with 0: the gap
  at the indicator's end closes as the indicator shrinks (probe: track
  [11.7, 58.8] at 50 % for 0.3 → 0, never over the indicator). The zero-length
  rule is untouched (track still `null` when its length is 0). Static renders,
  wavy included, are pixel-identical (same start modulo the dash period).
- **consumer impact:** animating flat ProgressIndicator to 0 is clean.
- **breaking:** no.
- **verified:** lint exit 0; scratch probe simulating the CSS lerp of
  dasharray/dashoffset, old vs new, at 0.1/0.3/0.6 → 0. Not visually checked.
- **docs owed:** loading-indicators skill, where it states the track offset
  formula (`L + G − D`): replace with `−(active + gap)` and the reason.

## Entry 3 — Both indeterminate loaders: role `progressbar`, default size `rg` [WI-113, F-072]
- **files:** `src/components/LoadingSpinner/LoadingSpinner.tsx` (role
  `status` → `progressbar`, header documents it),
  `src/components/ShapeMorphSpinner/ShapeMorphSpinner.tsx` (default `size`
  `md` → `rg`; its header names no default size, so it stays true).
- **what changed:** LoadingSpinner now renders `role="progressbar"` with no
  `aria-valuenow` (indeterminate, ARIA 1.2); `aria-label="Loading"` still sits
  before `...props`, so a consumer's label wins. ShapeMorphSpinner defaults to
  22 px like LoadingSpinner and ProgressIndicator.
- **consumer impact:** tests using `getByRole("status")` for LoadingSpinner
  must query `getByRole("progressbar")`; screen readers no longer announce it
  as a live region. ShapeMorphSpinner without `size` renders 22 px instead of
  32 px (unreleased component, so no shipped consumer is affected).
- **breaking:** no (minor, per WI-113: the role change is behavioural;
  ShapeMorphSpinner's default never shipped).
- **verified:** lint exit 0. WI-113's probe (`W7b/51-loaders.cjs`) needs a
  build of this tree; not run (no build in this checkout).
- **docs owed:** WI-113 steps 4–5: both loading-indicators SKILL.md copies get
  "Both indeterminate loaders render `role="progressbar"` with no
  `aria-valuenow` and default to `size={LoadingSpinnerSize.rg}` (22 px)."
  after line 8; CHANGELOG `[Unreleased]` → Changed: "`LoadingSpinner` renders
  `role="progressbar"` (was `role="status"`), matching `ShapeMorphSpinner` and
  `ProgressIndicator`. A test that finds the spinner with
  `getByRole("status")` should query `getByRole("progressbar")`." REMEDIATION
  board: WI-113 → review.


## 2026-10-04 — review round 2

### Highlighted slider step: fades, and takes the slider colour on both sides during a drag (orchestrator)
- files: `src/styles/dooph-component-tokens.css` (slider dot rules only).
- what changed:
  - Only `.ds-slider-dot[data-highlighted]` transitions its `background-color`.
    The other dots keep their deliberate instant paint switch, so a fast drag
    doesn't leave staggered fades behind.
  - While dragging (`[data-dragging]` on the root), the highlighted dot is the
    solid slider colour on BOTH sides of the thumb. It used to be off-fill only.
    On the fill it still reads, because the fill draws the same colour at
    --ds-slider-track-opacity (50–70%) and the dot is opaque.
  - It's CSS only; it outranks the `[data-active]` paint by specificity, and
    the slider's JS and dot grouping are untouched.
- consumer impact: the highlighted step is visible during drags across the
  whole track, and its colour change fades.
- breaking: no
- verified: `npm run lint` exits 0.
- docs owed: none beyond the Slider docs already owed.

<!-- merged from _work/changes/08-pi-race.md -->
### 08 — ProgressIndicator flat: track vanishes / backtracks under rapid progress changes

Agent 08-pi-race. Started 2026-10-04.

## Checklist
- [x] Baseline scoreboard (motion literals 0, "use client" 27, timers 5)
- [x] CSS: `@property --ds-pi-progress` + `.ds-progress-ring*` helpers replace `.ds-progress-arc`
- [x] ProgressIndicator.tsx flat variant: one inline scalar, both circles always mounted; JSDoc
- [x] waveGeometry.ts doc comment (flat no longer uses it)
- [x] rest-state proof (before vs after) + interrupted-transition probe (Chromium)
- [x] lint exit 0, scoreboard unchanged

## Entry — ProgressIndicator flat animates from one value, so rapid changes stay clean
- **files:** `src/styles/dooph-component-tokens.css` (new
  `@property --ds-pi-progress` next to `--progress-pct`; `.ds-progress-arc`
  removed; new `.ds-progress-ring`, `.ds-progress-ring-indicator`,
  `.ds-progress-ring-track` with the derivation in a comment),
  `src/components/ProgressIndicator/ProgressIndicator.tsx` (flat variant +
  its JSDoc), `src/components/ProgressIndicator/waveGeometry.ts` (doc comment
  of `getWavyTrackGeometry` only — no code change).
- **what changed:** cause confirmed: both flat arcs transitioned
  stroke-dasharray AND stroke-dashoffset independently. When `progress`
  changed mid-flight, each of the four transitions restarted from its own
  interpolated value, so the track's length/offset disagreed with the
  indicator; and the track element was unmounted whenever its target length
  was 0 (≈ p > 0.87 at md) and remounted with no transition. Chromium probe
  of the OLD code (md, progress stepped every 50 ms through 0→1→0 then a
  random burst, 339 frames): track overlapping the indicator in 101 frames by
  up to 35.8 units, track absent mid-range in 32 frames.
  Fix: the <svg> sets one number, `--ds-pi-progress` (0–1), plus the fixed
  `--ds-pi-c` (circumference) and `--ds-pi-gap` (M3 gap, round-cap allowance
  included) inline. `.ds-progress-ring` transitions only `--ds-pi-progress`
  (`--ui-motion-duration-slow`, `--ui-motion-ease-standard` — same timing as
  before). Both arcs' dasharray/dashoffset are calc()s of it, so every frame
  is one consistent drawing. Both circles are always mounted; each arc's
  stroke-opacity is `clamp(0, length × 1000, 1)`, so a zero-length arc paints
  no round-cap dot and nothing remounts. Wavy variant untouched: it has no
  transition, so it does not share the bug.
  One deliberate rest-state difference: today's static drawing jumps at 0
  (full circle at 0, two full gaps at any p > 0), and a continuous animated
  drawing cannot keep that jump. The gaps now ramp in linearly over
  0 < p < 0.01 (track identical to today at p = 0 and at every p ≥ 0.01).
  The old transitions closed the gaps progressively too, so this keeps the
  clean return to 0 from the earlier fix (07R2 entry 2).
- **consumer impact:** rapid `progress` updates on the flat ring no longer
  make the grey track jump back or blink. Rest rendering unchanged except for
  sub-1 % values (smaller gaps). The internal helper class
  `.ds-progress-arc` is gone (internal; nothing else used it). A consumer
  `style` still merges last on the svg (it could override the three
  `--ds-pi-*` vars, which is unsupported).
- **breaking:** no.
- **verified:** `npm run lint` exit 0; scoreboard unchanged (all metrics
  equal before → after). Chromium (real CSS rules extracted from the file,
  served locally): rest-state computed dasharray/dashoffset of NEW vs OLD at
  p = 0, 0.01, 0.03, 0.08, 0.25, 0.5, 0.9, 0.95, 0.99, 1 for sm/rg/md/xl —
  max difference 0; track opacity 1 exactly where the old track existed and
  0 exactly where it was omitted; indicator opacity 0 only at p = 0, where
  the old indicator painted 0 pixels (canvas check). Interrupted-transition
  probe (same 339-frame sequence, transitions paused and stepped 16.7 ms per
  frame): every frame's track length/offset equals the formula of that
  frame's scalar (max error 5e-5), the track never faded or reached length 0
  for 0 < p < 0.8, and its leading end moved monotonically with the scalar.
  Tailwind CLI compile (to scratch, normal and --minify) keeps the
  @property and the calc()/clamp()/max() rules verbatim. Not checked in the
  live Storybook "Interactive" story (no server running) — orchestrator
  should drag the slider fast there.
- **docs owed:** loading-indicators skill (`.agents` + `.claude` copies, and
  the consumer skill if it says the same): the ProgressIndicator section says
  both circles carry a 300 ms dasharray/dashoffset transition — replace with
  "one registered number `--ds-pi-progress` transitions (motion scale slow /
  standard); both arcs are calc()s of it; arcs fade (stroke-opacity) rather
  than unmount at zero length"; the 0 % note should add that the gaps ramp in
  over the first 1 %. CHANGELOG `[Unreleased]` → Fixed: "ProgressIndicator
  flat: the track no longer jumps back or disappears when progress changes
  rapidly."


<!-- merged from _work/changes/08D1-copy-cta.md -->
### CopyButton zoom swap, `CTAText` role, CTAButton hover tilt (skipped)

#### CopyButton icon swap is now a zoom swap
- files: `src/styles/dooph-component-tokens.css` (the `.ds-copy-icon-*` helper only)
- what changed: the outgoing icon scales 1 -> 0.6 and fades out on the `exit`
  curve; the incoming icon scales 0.6 -> 1 and fades in on the `enter` curve,
  both at `--ui-motion-duration-fast`. Before, the check icon rested at scale
  0.5 and the fade used the `standard` curve. Swap mechanism (`[data-copied]`,
  the 2s revert timer) and reduced motion (global rule) are unchanged. No JS added.
- consumer impact: slightly different icon animation on CopyButton.
- breaking: no
- verified: `npm run lint` exit 0; scoreboard unchanged.
- docs owed: none (CHANGELOG optional: "CopyButton icon swap now zooms").

#### `TextVariant.cta` and `CTAText`
- files: `src/components/Text/constants.ts`, `BaseText.tsx`, `index.ts`,
  `BaseText.stories.tsx`; `src/components/CTAButton/CTAButton.tsx`
- what changed: new `TextVariant.cta` (class `text-style-cta`, button-role axes)
  and `CTAText` / `CTATextProps` role components, exported through the Text
  barrel and `src/index.ts`. CTAButton's label uses `CTAText` instead of
  `BaseText unstyled` + the raw class. CTAButton header line updated to name it.
- consumer impact: new exports; CTAButton output unchanged.
- breaking: no
- verified: esbuild server render of CTAButton (standard/big x primary/secondary)
  before vs after is byte-identical. `npm run lint` exit 0; scoreboard unchanged.
- docs owed: CHANGELOG `[Unreleased]` -> Added: `TextVariant.cta`, `CTAText`.
  `skills/**` text-roles list and `.agents/skills` Text role list: add `CTAText`.

#### CTAButton hover tilt: NOT DONE (header contract conflict)
- CTAButton.tsx header constraint: "The shape is chosen by `size`, never by a
  prop and never animated. That is the maintainer's decision (2026-10-03); a
  shape prop or a hover morph is a design change, not a refactor." The behavior
  block also says the mark "is static".
- next-plan says the earlier "static on hover" answer is superseded, but the
  constraint still stands in the file. Removing it is its own commit with the
  reasoning stated, so it was not edited around.
- to proceed: remove the constraint and the "static" line in a separate commit,
  then add one helper (e.g. `.ds-cta-shape-tilt`) in dooph-component-tokens.css
  that rotates the shape wrapper on `.group:hover` / `:focus-visible` by the
  `--ui-shape-morph-nudge` fraction of a step, on the motion scale.


<!-- merged from _work/changes/08D2-chat-blur.md -->
### Chat parts secondary text + blur-roll soft clip (next-plan: chat parts item 9, blur roll review #1)

- **files:** src/components/AIChat/{AIToolPart,AIThinkingPart,AITurnSummary,ChatDivider}.tsx; src/styles/tokens.css; src/styles/dooph-component-tokens.css; src/styles/index.css; src/components/AnimatedText/{ChangeSwapShell,RollChangeText}.tsx; scripts/sync-theme.mjs (EXCLUDED +1); generated theme files re-synced (no diff for the new token).
- **what changed:**
  - Chat: settled tool label/meta, thinking label/meta, turn-summary label/meta and ChatDivider text now use text-secondary (were ghost foreground / text-tertiary). The settled tool label, thinking label and turn-summary label lift to text-primary (`--ui-color-text`) on row hover/focus/open through the existing `ds-chat-lift` motion-scale transition (it used to lift to ghost-active; turn-summary label now uses it too). Streamed answer prose, the live thinking transcript (tertiary), the error label, the chevron and the model picker are unchanged.
  - `--ui-chat-thinking-shimmer-base` (and its highlight) now text-secondary instead of ghost foreground. Tool shimmer unchanged.
  - Blur roll: `--ui-roll-change-depth` 0.9em -> 0.55em, `--ui-roll-change-blur` 4px -> 0.1em, new `--ui-roll-change-breathe` 0.15em. ChangeSwapShell's hard `overflow-hidden` is replaced by `.ds-change-swap` (index.css): padding-block breathe, equal negative margin-block, vertical mask-image gradient. Fade roll shares the shell and depth so it gets the same soft clip and shorter travel.
  - Deviation from plan: mask fade zones are exactly the breathing room (em stops) rather than 18%/82%, so the resting line is always fully opaque even at line-height 1; a percentage would dim ascenders at tight leading.
- **layout proof:** the root is an inline-grid; padding-block adds 2*0.15em to its box and margin-block subtracts 2*0.15em from its margin box, so margin-box height (what the line box uses) is unchanged; the first-row baseline moves down 0.15em inside the box by the padding and the box moves up 0.15em by the negative margin, so the baseline lands where it did. Width unaffected (no horizontal padding). mask-image does not affect layout. Not browser-measured.
- **consumer impact:** chat label colours shift to text-secondary and lighten to text-primary on hover; blur/fade roll travel is shorter, blur scales with font size, the roll edge fades instead of cutting. Consumers overriding `--ui-roll-change-blur` in px still work. A consumer-set `overflow` on the roll wrapper is no longer needed.
- **breaking:** no
- **verified:** `npm run lint` (tsc) exit 0; `npm run sync-tokens` ok; scoreboard identical before and after.
- **docs owed:** token-contract.md (new `--ui-roll-change-breathe`; roll depth/blur new defaults and em blur; thinking shimmer base now text-secondary); CHANGELOG (chat text colours, soft-clip roll).


<!-- merged from _work/changes/08E-input.md -->
### 08E — Input: fixed-width number variants, opt-in hug, opt-in number formatting

### Number inputs fill their container by default; `autoWidth` hugs; `format` formats on blur [next-plan: "Input number variants: hug + centre", "Number formatting with separators"]
- files:
  - `src/components/Input/Input.tsx` (header contract rewritten)
  - `src/components/Input/constants.ts` (variant doc comment)
  - `src/components/Input/Input.stories.tsx`
- what changed:
  - Number variants (`number`, `iconNumber`) are now FIXED width like the text variant: they fill their container or take a consumer width (`className="w-32"`), never narrower than a square, and the content (icon included) is left-aligned.
  - New boolean prop `autoWidth` restores the old behaviour for number variants: hug the value through the hidden mirror span, content centred. That code path is untouched, now behind the prop. Ignored on text variants.
  - New props for number variants (default off): `format?: boolean | Intl.NumberFormatOptions` and `locale?: string`. Format on blur: while focused the field shows the raw value, blurred it shows `Intl.NumberFormat` output ("1234567" focused, "1,234,567" blurred in en-US). `format={true}` keeps every fraction digit; pass options for control. Typed or pasted grouping separators and whitespace are stripped; the locale's decimal separator is read as the decimal point (the focused field shows it, e.g. "1234567,25" in de-DE). Text that is not a plain number is shown as typed.
  - New prop `onValueChange(value: string)` on every variant, per the repo's value-control rule. It fires on every change with the raw string (separators stripped, "." decimal when `format` is on; the input's own value otherwise). `onChange` is unchanged and still runs first; with `format` on its `event.target.value` is the displayed text.
  - `value` / `defaultValue` stay raw strings in both modes. With `format` on the input is internally always controlled by the display text; the component keeps raw state itself when the consumer passes `defaultValue`.
  - Number variants set `inputMode="decimal"` (a consumer's own `inputMode` wins).
  - With `autoWidth` + `format`, the mirror follows the displayed (formatted) text.
  - Stories: `NumberGrows` replaced by `NumberFixedWidth` (fixed default, plus a `w-32` consumer width), `NumberAutoWidth`, and `NumberFormatted` (en-US, de-DE, de-DE currency, controlled with `onValueChange`). The `Variants` grid now uses fixed 160px columns.
- header contract change (for the maintainer to commit on its own, per AGENTS.md): the constraint "The number variants HUG their value through a hidden mirror span" is reworded to "ONLY `autoWidth` number variants hug"; the mirror-follows-value constraint now says it follows the displayed text; a new constraint says that with `format` on the input is always controlled by the display text and raw state never stores display text. `## behavior` states the new fixed-width default, `format`, `onValueChange` and `inputMode`.
- consumer impact: number variants that relied on hugging now stretch to their container. They need `autoWidth` to keep the old look. Layout in a flex row with no width will now fill the row. Nothing else changes unless `format` / `onValueChange` / `autoWidth` are used. With `format` and no `locale`, the runtime's locale is used, so server and client can differ in SSR: pass `locale` for stable output.
- breaking: yes — v6 (visual/layout only; no API removed). Old → new: `<Input variant="number" />` hugged its value, content centred → fills its container, content left-aligned; migration: add `autoWidth` to keep the hugging, centred look.
- verified:
  - `npm run lint` (tsc) exits 0; all existing usages (stories, other components) compile.
  - Scoreboard before == after: nothing moved ("use client" stays 27; Input already had it).
  - Real-DOM check (esbuild bundle of the component, rendered with React 19 in the browser pane, input events dispatched): en-US blurred "1,234,567"; focused "12345678" after typing "1,234,5678" (separators stripped), `onValueChange` got "12345678", blurred "12,345,678"; de-DE "1234567.5" blurred "1.234.567,5", pasting "1.234.567,25" focused "1234567,25" with raw "1234567.25", blurred "1.234.567,25"; `inputMode` "decimal"; default number has no mirror span, `autoWidth` has one.
  - Not verified: pixel widths and left alignment (the scratch page had no stylesheet), caret behaviour when typing mid-string in a formatted field, Storybook.
- docs owed:
  - `skills/**` Input docs and README: fixed-width default, `autoWidth`, `format` / `locale`, `onValueChange`, the SSR `locale` note.
  - CHANGELOG: v6 breaking note above.
  - v6 migration skill: number Input layout change.


<!-- merged from _work/changes/09-popover.md -->
### PopoverContent uses the shared floating-panel look [F-071, WI-112]
- files: `src/components/Popover/Popover.tsx` (no header contract in this file)
- what changed: the panel surface now matches the menus (`menuPanelClassName`):
  `border-border-primary` → `border-border-popovers`, `bg-surface-primary` →
  `bg-modal-surface`, `shadow-button` → `shadow-menu`. Default `sideOffset`
  4 → 6 (still consumer-overridable). Motion (`ds-motion-overlay`), the
  transform-origin helper, `overflow-hidden`, `rounded-normal` and the radix
  animate classes are unchanged. No menu padding/gap copied; DropdownMenu untouched.
- consumer impact: every PopoverContent and the DatePicker panel get the new
  border, background (dark: #000000 → #212124) and shadow, and sit 2px further
  from the trigger. A consumer `className` or `sideOffset` still wins.
- breaking: no
- verified: server render of PopoverContent and of an open DatePicker shows the
  new surface classes on the panel; the Calendar inside still carries its own
  `flex flex-col gap-rg p-md ds-calendar-panel-w` (padding/size unchanged, only
  surface paint changed). Lint exit 0. Scoreboard before/after identical.
- docs owed: `src/styles/tokens.css:122-123` comment (Popover now one of the
  floating-panel users), `skills/dooph-design-system-theming/references/token-contract.md:40`,
  CHANGELOG `[Unreleased]` entry (minor: visible surface change on Popover and DatePicker).


<!-- merged from _work/changes/09-input-entry.md -->
### 09 — Input: number entry filter and range-derived error

### Number inputs block invalid characters at entry; `min` / `max` drive the error state
- files:
  - `src/components/Input/Input.tsx` (header contract: behavior + new constraint)
  - `src/components/Input/Input.stories.tsx`
- what changed:
  - Number variants (`number`, `iconNumber`) only accept digits, one decimal separator and a leading minus (the minus only when `min` is undefined or below 0). Typing a character that adds nothing valid is blocked in `onBeforeInput`. Anything else that gets in (a partly valid paste, autofill, IME) is sanitised in the change handler before `onChange` / `onValueChange` run, with the caret kept in place. Paste "12ab3.4.5" gives "123.45"; "--1" gives "-1"; "1.2.3" gives "1.23".
  - The decimal separator is the `locale`'s when `format` is on, and "." otherwise. Grouping (the comma, or the locale's group separator) and whitespace are stripped, as before for `format`, now also without `format`.
  - New props `min?: number` and `max?: number` (number variants). A committed value outside [min, max] shows the danger chrome and sets `aria-invalid`. Committed = value at last blur when uncontrolled (the `defaultValue` until then), the current `value` when controlled. Empty or half-typed text is never out of range. The value is never clamped.
  - `hasError` is now authoritative: `true` forces the error, `false` suppresses the automatic one, omitted lets the range decide.
  - Consumer `onBeforeInput`, `onChange` and `onPaste` still run (`onBeforeInput` runs first; if it calls `preventDefault`, the filter steps aside). On text variants `min` / `max` are still passed through to the DOM; their type is now `number`.
  - Stories: new "Number — range"; the formatted story's comment now notes the entry filter.
- consumer impact: number variants no longer accept letters or symbols, and a comma typed without `format` is now treated as grouping and removed (before it was kept). Anyone typing decimal commas needs `format` plus `locale`. `min` / `max` on number variants now change visual error state. `min` / `max` props typed as `string` on Input no longer compile (now `number`).
- breaking: yes — v6. Old → new: number Input accepted any text → only digits, one decimal separator and an allowed leading minus; `min` / `max` accepted `number | string` → `number`; `hasError` omitted never errored → may error when `min` / `max` are set.
- verified:
  - `npm run lint` exits 0. Scoreboard metrics before == after (only the plan line moved, from other agents' work).
  - Real browser (esbuild bundle in the browser pane, real key events): per-key "a", "$", ",", "2" with "1" gives "12" (blocked keys fire no change); "--1" with `min=-5` gives "-1"; "1.2.3" gives "1.23"; a chunked insert of "12ab3.4.5" gives "123.45"; consumer `onBeforeInput`/`onChange` logged; `min=0 max=100` typing "500" has no `aria-invalid` until blur, then `true`; `hasError={false}` with 150 has none; `hasError` with 5 has `true`; a controlled field with 250 is invalid right away.
  - Not verified: the `min >= 0` blocks minus by key press (same code path as the negative case), IME, autofill, locale-decimal typing (de-DE) with the new filter, Storybook, pixel look.
- docs owed:
  - `skills/**` Input docs and README: entry filtering, `min` / `max`, `hasError` precedence, decimal comma needs `format` + `locale`.
  - CHANGELOG and v6 migration skill: the breaking note above.


<!-- merged from _work/changes/10-pi-cta.md -->
### 10 — ProgressIndicator flat gap from target; CTAButton hover tilt

Resumed agent (the first one was cut off before writing a record). Baseline
scoreboard: motion 0, "use client" 27, timers 5.

## Entry A — ProgressIndicator flat: end gaps follow the TARGET value, rest look is the old ring again
- **files:** `src/components/ProgressIndicator/ProgressIndicator.tsx` (one more
  inline custom property + JSDoc), `src/styles/dooph-component-tokens.css`
  (`.ds-progress-ring-indicator` / `-track`).
- **what changed:** the 08 fix ramped the track's end gaps in over 0 < p < 1 %,
  so tiny values looked different from the old ring. Now the svg also sets
  `--ds-pi-gap-on` (0 or 1, from `progress > 0` — the target, not the animated
  value). It is a plain (unregistered) custom property, so it never transitions:
  the gaps switch at once while only `--ds-pi-progress` animates. Track gap =
  `--ds-pi-gap × --ds-pi-gap-on`. The race fix (one animated scalar, both circles
  always mounted) is untouched. The opacity cut-off factor went 1000 → 1000000 so
  a track/indicator shorter than 1e-6 units, not 1e-3, is what fades (a drawn dot
  is otherwise the old behaviour at any positive length). Reviewed the cut-off
  agent's edit: correct, kept as is (only the JSDoc sentence "From any value
  above 0" reflowed by hand — left).
- **consumer impact:** rest rendering equals the pre-08 ring at every progress
  value, including 0 < p < 0.01 (08's "gaps ramp in" note no longer applies).
  During a transition to 0 the gaps drop at once; to > 0 from 0 they appear at
  once. A consumer `style` can still override the `--ds-pi-*` vars (unsupported).
- **breaking:** no.
- **verified:** `npm run lint` exit 0. Rest proof in Chromium (real CSS in the
  live Storybook, computed styles of svgs built exactly as the component does)
  vs the pre-08 formulas (`getWavyTrackGeometry` + indicator dash, from the
  07-review-round-1 tree): sm/rg/md/xl x p = 0, 0.001, 0.005, 0.01, 0.25, 0.5,
  0.99, 1 — dash length, dash offset, and track/indicator present-vs-omitted all
  match; max numeric difference 4.6e-4 = Chromium's 3-decimal serialisation of
  computed lengths. Track on exactly where the old track existed (off at 0.99
  and 1 for every size at these samples), indicator invisible only at p = 0.
  Live "Interactive" story: real slider key events (React path), animations
  stepped manually at 16.7 ms (hidden-pane rule), keys every 50 ms: 0→1→0 over
  640 frames plus a 501-frame random burst incl. 142 frames above 87 %: track
  never vanished while it had positive length, never overlapped the indicator,
  and its leading end never moved against the progress direction (0 backward
  frames). The gap switch is the only discontinuity (once per direction change).
- **docs owed:** 08 record's "gaps ramp in over the first 1 %" is superseded —
  the loading-indicators skill note should say "end gaps switch on at once when
  progress > 0 (target-driven `--ds-pi-gap-on`)". CHANGELOG [Unreleased] Fixed
  line from 08 is unchanged.

## Entry B — CTAButton: end shape tilts on hover / focus-visible (header contract reworded)
- **files:** `src/components/CTAButton/CTAButton.tsx` (class on the shape
  wrapper + header + JSDoc), `src/styles/dooph-component-tokens.css` (new
  `.ds-cta-shape-tilt`).
- **what changed:** the header said the shape was "never animated" and that a
  hover morph is a design change. REWORDED WITH MAINTAINER APPROVAL
  (2026-10-07): the shape is fixed per size (clover standard, puff big) and
  never morphs; its only motion is a hover tilt matching DropdownCaret's hover
  nudge amount, on the motion scale, via one named helper `.ds-cta-shape-tilt`.
  Per AGENTS.md the contract change must be its OWN commit (maintainer commits).
  `.ds-cta-shape-tilt`: `rotate: calc(var(--ui-shape-morph-nudge) * 90deg)` =
  13.5deg clockwise when the root `.group` is hovered or focus-visible
  (`:is(:where(.group):is(:hover, :focus-visible) *)`, same pattern as the
  outline-button orbs); `transition: rotate var(--ui-motion-duration-base)
  var(--ui-motion-ease-enter)`. CSS only, no listeners. Nudge amount: the token
  is a fraction of one step (0.15) and MorphRotationShape's step turns 90deg
  (`NOMINAL_TURN_DEG`, not a token — hence the literal 90deg in the calc).
- **consumer impact:** the CTA's end shape leans 13.5deg on hover/keyboard
  focus. Reduced motion is covered by the global rule (durations collapse).
- **breaking:** no.
- **verified:** lint exit 0; scoreboard unchanged (motion 0, "use client" 27,
  timers 5, all other 0). Chromium on the live Storybook `all-variants` story:
  real mouse hover on the first CTA -> only that CTA's shape computes
  `rotate: 13.5deg`; others `none`; Tab focus (keyboard) -> 13.5deg; transition
  computes `rotate 0.2s cubic-bezier(0.32, 0.72, 0, 1)` (base / enter). Not
  checked: dark mode, clipping of the rotated shape beyond its chip (nothing
  clips; looked fine in the screenshot).
- **docs owed:** CHANGELOG [Unreleased] Added: "CTAButton: the end shape tilts
  on hover and keyboard focus." Any skill text that says the CTA hover is
  label-only.


<!-- merged from _work/changes/10-expression.md -->
### Expression system: cascade layers, the practical preset, and the dropdown caret as its first detail (next-plan "Expression system: signature vs practical")

- files:
  - `src/styles/tokens.css`: header rewritten (authority, expression tokens), `@layer ds.tokens, ds.expression;` on line 1, every existing block (`:root,.light`, `.dark`, the reduced-motion `@media`) inside `@layer ds.tokens { … }`, not re-indented, so the shape-morph ease generator's markers and output are unchanged. New expression `:root` block (`--ui-caret-shape-scale: 1`, `--ui-caret-nudge: var(--ui-shape-morph-nudge)`, each marked `/* expression */`), declared on `:root` only so a `.light`/`.dark` subtree can't restore a detail. New `@layer ds.expression { [data-ds-expression="practical"] { both: 0 } }`.
  - `src/styles/index.css` (DropdownCaret block, hand-written part only): the frame size, chevron colour and hover nudge now read the expression tokens, only inside `.ds-expr-caret-shape` / `.ds-expr-caret-nudge` rules.
  - `src/components/DropdownCaret/DropdownCaret.tsx`: on the root, `size-button` → `h-button` plus `ds-expr-caret-shape ds-expr-caret-nudge`. The header contract has new behaviour and constraint lines, and the stale "spacing-rg" now reads spacing-md, which is what the CSS uses.
  - `src/components/DropdownCaret/DropdownCaret.stories.tsx`: new `Practical` story, showing the real DropdownTrigger and TypeableDropdownTrigger (closed, open, disabled) as Default and inside a `data-ds-expression="practical"` wrapper.
  - `scripts/sync-theme.mjs`: both caret tokens added to `EXCLUDED`. The header now says which `:root` block is parsed. The parser itself is unchanged, because the layer wrapper didn't confuse it.
  - `docs/audit/_work/scratch/expression-check.mjs` (new), plus a PASS/FAIL line added to the end of `scoreboard.mjs`.
  - `docs/audit/_work/agent-rules.md`: rule 12. `docs/audit/doc-refresh.md`: an expression principle.
- what changed: the DS token defaults now sit in cascade layers. A consumer's unlayered `--ui-*` overrides always win, and the expression preset beats the DS defaults. On the dropdown caret, `--ui-caret-shape-scale` set to 0 removes the morphing shape and its frame. The caret root shrinks from 38px square to the chevron plus a trailing inset equal to the host's leading `ds-pl-ui-md`, and the chevron takes `--ui-color-secondary-foreground` in place of the primary foreground. `--ui-caret-nudge` set to 0 removes the hover lean. With the defaults (1 and the shape-morph nudge), nothing changes.
- consumer impact (**precedence change, read carefully**):
  - Previously the DS tokens were unlayered, so a consumer override won only if it came later in the cascade, or had higher specificity. A consumer `:root { --ui-x }` loaded BEFORE the DS stylesheet lost, and so did one with lower specificity, such as `:where(:root)`. **Now the DS tokens sit in `@layer ds.tokens`, so a consumer's unlayered override always wins, whatever its import order or specificity.** The rule in one line: your tokens.css > the expression preset > DS defaults.
  - A side effect: a consumer `:root { --ui-color-x }` override now beats the DS's `.dark` value even when the consumer's CSS loads first. Before, that was only true when it loaded after. Consumers who override a colour for light only should scope that override to `:root:not(.dark)` or `.light`.
  - In the same way, a consumer override of `--ui-motion-duration-*` now always beats the DS's reduced-motion collapse, so the consumer needs their own reduce block. Before, this held only when the consumer's CSS loaded after the DS stylesheet.
  - A consumer that puts its own overrides inside a cascade layer of its own takes part in layer ordering. Any layer declared before `ds` loses to it.
  - Layered rules elsewhere in the DS (Tailwind `components`/`utilities`) are unaffected. They were below the unlayered tokens before, and they are below `ds.tokens`, the last-declared layer, now.
  - Opt-in: `<html data-ds-expression="practical">` gives plain chevrons in DropdownTrigger and TypeableDropdownTrigger.
  - Browsers without `color-mix()` fall back, via Tailwind's emitted `@supports`, to the primary-foreground chevron. Under practical that chevron would sit on the trigger without its shape. The DS already relies on `color-mix` for the sticker washes.
- breaking: no for the API. The behaviour change is the precedence bullets above: an override that used to lose, because it loaded first or had low specificity, now wins. Flag this in the v6 notes as a behaviour change, even though no rename is involved.
- verified:
  - `npm run lint`: exit 0.
  - `npm run sync-tokens` (136 tokens): `theme.css` and `twMergeTheme.ts` are byte-identical to the pre-change copies, and so is the generated block in `index.css` (`cmp`).
  - Tailwind CLI compile, before and after, diffed with indentation normalised:
    - the token change alone adds only the two `@layer` wrappers, the expression `:root` block and the preset;
    - the full change adds only the caret block rewrite;
    - one unrelated `.ds-cta-shape-tilt` addition comes from another agent's concurrent CTA work.
  - In the compiled CSS, the reduced-motion `@media` is nested inside `ds.tokens` after `:root,.light`, so it still applies, and the browser CSSOM confirms it.
  - Storybook, `Menus/DropdownCaret` → Practical, measured:
    - Default: root 38×38, frame 26×26, white chevron, nudge 0.15 on hover.
    - Practical: root 27×38, frame and shape 0×0. The chevron sits flush in the root, 12px from the inner border, matching the 12px leading padding. Colour #161616 (dark: #fff). The hover nudge resolves to 0.
  - An unlayered `:root{--ui-caret-nudge:.3}` inserted FIRST in `<head>` still beat the preset on `<html data-ds-expression="practical">`.
  - Server render: no inline expression token. The chevron is `var(--ui-icon-rg)` wide, matching the width calc.
  - expression-check: PASS (2 tokens, 7 reads). A scratch copy with 6 planted violations failed with exit 1 and reported all 6.
  - Scoreboard: every metric unchanged, plus the new PASS line.
  - One fix along the way: Tailwind's automatic source scan picked up a literal arbitrary-property example in my docs and script comments and emitted a junk utility. I reworded both.
- docs owed:
  - The theming `token-contract.md` needs the authority rule, the layer names, and the warning that import order no longer matters (with the `.dark` and reduced-motion side effects above).
  - The consumer skill and README need the `data-ds-expression="practical"` setup: on `<html>` in Next.js `app/layout.tsx` or Vite `index.html`, nesting discouraged, and debugging by reading the token's computed value.
  - CHANGELOG `[Unreleased]`: Added, the expression system and practical preset. Changed, the token precedence (cascade layers).
  - Architecture skill: rule 12 text.
  - Future expression candidate, not done: the chevron's open flip rides the shape-morph spring and overshoots. That may also count as expressive under practical.


### Reduced motion keeps winning after the token layering (orchestrator, 2026-10-07)
- files: `src/styles/tokens.css`, the global `prefers-reduced-motion` block only.
- what changed: the block's seven declarations are now `!important`. The token
  layering (`@layer ds.tokens`) means a consumer's unlayered override, such as
  a product tuning `--ui-motion-duration-fast`, would otherwise beat the block
  and give reduced-motion users full animations. A layered `!important`
  outranks every unlayered normal declaration, so the user's accessibility
  setting always wins. A comment marks it load-bearing.
- consumer impact: a product's motion overrides still apply normally; they no
  longer leak past the reduced-motion setting.
- breaking: no
- verified: `npm run lint` exits 0; sync-tokens ok; expression-check passes.
- docs owed: token-contract / theming docs say that reduced motion always wins.


### 11 — CTAButton hover tilt removed (maintainer decision, 2026-10-07)
- **files:** `src/components/CTAButton/CTAButton.tsx` (header, JSDoc, and the class on the shape wrapper), `src/styles/dooph-component-tokens.css` (`.ds-cta-shape-tilt` deleted).
- **what changed:** this fully reverses entry 10-B. The header constraint is back to its 2026-10-03 wording: "chosen by `size`, never by a prop and never animated". The hover is label-only again. **Contract change: per AGENTS.md, commit it on its own.** Because 10-B was never committed, the net change against HEAD is just that wording, unchanged.
- **consumer impact:** none against HEAD.
- **breaking:** no.
- **docs owed:** delete 10-B's CHANGELOG line ("the end shape tilts…") and don't carry it over.

### 12 — Text is always set by a Text component (maintainer rule, 2026-10-07)
- **Rule:** text is set only by a Text component (`ButtonText`, `BodyText`, `LabelText`, `HeadingText`, `MonoText`, … or `BaseText` with props). A root that owns its text renders through one with `as`. Typography is set once, on that element, and descendants inherit it. No `text-style-*` class appears outside `src/components/Text/`, and no typography utility or inline font style appears anywhere.
- **Measured:** two new scoreboard lines, "Text styled without a Text component". They count components and stories, with comments stripped.

  | | `text-style-*` classes | font utilities / inline font styles |
  |---|---|---|
  | audited commit b436647 | 76 | 11 |
  | after the cleanup (round 4) | 42 | 12 |
  | now | **0** | **0** |

  The cleanup lowered the class count only incidentally, through story sweeps. It also ADDED new violations in new code: the FancyToggle label span, Button's medium/big `text-style-hero-button`, an Input story readout, a CodeDigitInput class, and an AnimatedText story.
- **files:**
  - **Controls (root `as`):** Button, SplitButton (both parts), Toast (Action / Close / Dismiss), ToggleSwitchItem, TabsTrigger, OutlineButton (inner surface), DropdownTrigger / TextDropdownTrigger (label role at `sm`), every DropdownMenu item (SubTrigger, Item, RadioSelectItem, MultiSelectItem, PlainItem), DropdownMenuLabel (LabelText), CalendarPresetsPanel preset button.
  - **Fields (`as="input"` / `"textarea"`):** Input (all three fields, plus the sizing mirror on the field's role), SearchBox, DropdownMenuSearch, TypeableDropdownTrigger, AIPromptInputTextarea, CodeDigitInput.
  - **Text-bearing roots:** TextLink (BodyText `as` the anchor or Slot), Sticker (ButtonText `as="div"`), HotkeyIndicator key caps (LabelText `as="kbd"`), dialog title and description (HeadingText / BodyText `as` the Radix part, so Modal and Sheet), AITextPart, UserMessageHeader, AIToolPart, AITurnSummary (BodyText `as="div"`).
  - **Leaf spans and divs:** AIThinkingPart (meta, label, both transcripts, and the shimmer label via `BodyText as={ShimmerText}`), ChatDivider, AIModelSelect detail.
  - **Simple Tooltip:** its label is a BodyText inside the panel.
  - **Recipes now hold no typography:** `buttonVariants`, `toggleOptionVariants` (= `tabTriggerVariants`), and `menuItemClassName`.
  - **Stories:** Tabs content, the Input raw readout (MonoText), Icons labels (LabelText; was inline 12px), the Toggle and FancyToggle value readouts (BodyText), and the AnimatedText captions (`tracking-wide` → `letterSpacing="0.025em"`).
- **Contract changes (commit separately, per AGENTS.md):**
  - Button: new behaviour line; new constraint "typography only from the Text component"; the cn-registration constraint reworded.
  - toggleOption: new constraint "never a text-style class in this recipe".
  - DropdownMenuSearch: the constraint "keep typography on the input via `text-style-button`" now reads "it renders as ButtonText".
  - fancyToggleOption: the label constraint is reworded, because the span no longer exists.
  - CodeDigitInput: behaviour line.
- **consumer impact / breaking: yes — v6.**
  - `buttonVariants()` and `tabTriggerVariants()` no longer carry typography. A consumer who applied either to their own element (for example a router Link) gets no button text role.
  - Fix: `<ButtonText as={Link} className={buttonVariants({ … })}>`, using `HeroButtonText` for `size` medium/big. Even simpler, `<Button asChild><Link/></Button>`, which needs no change.
  - The component renders themselves are unchanged (see verified).
- **Visible changes, all small:**
  - CodeDigitInput's transparent input glyph now uses the body family, matching the visible glyph.
  - The preset button lost its redundant inner span.
  - The story readouts now use the DS faces instead of the page default.
- **verified:**
  - `npm run lint` exit 0. Scoreboard m11 0 and m12 0; nothing else moved; expression-check PASS.
  - Snapshot of all 372 stories before and after, with typography now captured (font family, size, weight, line height, letter spacing, variation settings, numeric variant). Only the expected changes differ:
    - Icons, Toggle and FancyToggle story readouts are now on the DS faces;
    - the CodeDigitInput transparent glyph is now on the body family;
    - the Calendar presets lost 7 redundant inner spans;
    - the Tabs stories gained the BodyText inside the content.
  - Two snapshot glitches were rechecked one by one: the typeable-triggers story (identical, 57 of 57 elements) and the streaming text story (a timed demo).
  - Every other story is identical across all 27 properties: Button, SplitButton, Toggle, Tabs, menus, triggers, inputs, Sticker, hotkeys, chat parts.
  - Overlays checked live, open: the simple Tooltip label is a BodyText span (14px Google Sans Flex) and the panel geometry is unchanged. The dialog title (heading role) and description (body role) and the toast buttons (button role) carry the role class on the same element as before.
  - Patch: `_work/patches/11-text-components.patch`. It is based on round 4's tree, which equals the maintainer's commit 97a057c. It includes the maintainer's own FancyToggleSwitch label edit.
- **docs owed:**
  - The contribution skill's checklist line "Typography uses `text-style-*` composite utility classes" is the OPPOSITE of the rule. Replace it with the rule above.
  - The codebase skill's "Components apply these directly" goes too.
  - The `buttonVariants` / `tabTriggerVariants` break goes in the v6 migration skill.
  - CHANGELOG Changed: "Text is always rendered through the Text components; the public class recipes no longer include typography."

### 13 — FancyToggle label at the button role, 14px (maintainer decision, 2026-10-07)
- The maintainer's own edit swapped the label from `text-style-hero-button` (16px) to `BaseText variant={TextVariant.button}` (14px). They confirmed it's intentional: the fancy toggle label is the 14px button role.
- **docs owed:** any skill or story text saying the fancy toggle label is 16px or hero-button.
