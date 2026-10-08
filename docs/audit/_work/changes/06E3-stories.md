# 06E3 — Stories (WI-004, WI-020, WI-121)

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

## DONE
