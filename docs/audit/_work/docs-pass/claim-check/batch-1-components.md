# Claim check, batch 1: component skills

Checked at the working tree on 2026-10-11 (HEAD 8493906 plus uncommitted edits). Read-only.
`npm run lint` → `conventions: 30 checks passed` (exit 0). The skill mirrors in `.claude/skills/` and
`.agent/skills/` are byte-identical to the canonical copies (`diff -r`), so these verdicts hold for them too.

Code blocks were type-checked against the repo outside it: recipe 8 (ServiceStatus, its constants,
and the app's polling code) and every file template (`constants.ts`, `Example.tsx`, `index.ts`,
`Example.stories.tsx`, with a stub `exampleVariants` cva). The scratchpad tsconfig extends the repo's
own, and `tsc` exited 0. A negative control (`<Sticker variant="custom" />` with no `color`) failed as
expected (TS2322), which shows the harness really checks types.

## Summary

| doc | claims | TRUE | FALSE | UNVERIFIABLE |
|---|---|---|---|---|
| `.agents/skills/dooph-ds-writing-components/SKILL.md` | 30 | 27 | 3 | 0 |
| `.agents/skills/dooph-ds-writing-components/references/recipes.md` | 24 | 23 | 1 | 0 |
| `.agents/skills/dooph-ds-adding-a-component/SKILL.md` | 14 | 13 | 0 | 1 |
| `.agents/skills/dooph-ds-adding-a-component/references/file-templates.md` | 13 | 13 | 0 | 0 |
| **total** | **81** | **76** | **4** | **1** |

## FALSE

### 1. writing-components SKILL.md:21: the "use client" trigger is overstated
> Add `"use client"` only when the module itself calls hooks, touches browser APIs, …

- Evidence: three modules call hooks and correctly carry no directive. `src/utils/composeRefs.ts`
  calls `useCallback`, `src/components/ProgressIndicator/ProgressIndicator.tsx` calls `useMemo`, and
  `src/components/WavyDivider/WavyDivider.tsx` calls `useId`. None of the three is on
  `USE_CLIENT_ALLOWLIST` (check-conventions.mjs:145-202). React's server build exports exactly `use`,
  `useCallback`, `useDebugValue`, `useId` and `useMemo` (node_modules/react/cjs/react.react-server.production.js).
  recipes.md:149 already says a `useCallback`-only module needs no directive, so the rule and its own
  recipe disagree. An agent that follows the rule literally would add a directive that lint then
  rejects ("use client" outside its allowlist).
- Fix: "Add `"use client"` only when the module itself calls a client-only hook (`useState`,
  `useReducer`, `useRef`, an effect, context), touches browser APIs, … `useCallback`, `useMemo` and
  `useId` run in React's server build and need none (composeRefs, ProgressIndicator, WavyDivider)."
  Optionally add a `useMemo`/`useId` row to the recipes.md:142-151 table.

### 2. writing-components SKILL.md:24: the `asChild` rule misses CTAButton
> `asChild` swaps the root for `Slot`; with children of your own, wrap the consumer's in `Slottable`.

- Evidence: Button, OutlineButton, ShapeButton, DropdownTrigger and TextDropdownTrigger follow it
  (OutlineButton.tsx:271, ShapeButton.tsx:148, DropdownTrigger.tsx:78 and :332). TextLink has no
  children of its own (TextLink.tsx:17). CTAButton has children of its own and does not use
  `Slottable`. It renders `<Slot …>{cloneElement(children, undefined, content)}</Slot>`
  (CTAButton.tsx:209-218), which replaces the consumer element's children with the CTA content. This is
  documented and deliberate (CTAButton.tsx:91-93).
- Fix: append "CTAButton is the exception: with `asChild` it replaces the slotted element's children
  with its own content (`cloneElement`, CTAButton.tsx:209-218)."

### 3. writing-components SKILL.md:35: not every size scale has a `standard` base
> Size keys | `standard` base, `sm`, `iconSm: "icon-sm"`.

- Evidence: `LoadingSpinnerSize` is `sm`/`rg`/`md`/`xl` (LoadingSpinner/constants.ts:28-36) and has no
  `standard`. Every other `*Size` const has `standard` (Avatar, Button, CTAButton, TextDropdown,
  Sticker, Tabs and Toggle constants.ts). Lint enforces only "no `default`/`small`"
  (check-conventions.mjs:630-648), so it does not catch this. Severity is low, but the line reads as
  a fact about every size scale.
- Fix: "`standard` base, `sm`, `iconSm: "icon-sm"` (LoadingSpinnerSize's `sm`/`rg`/`md`/`xl` diameter
  scale predates this and stays). Lint check: size keys named default or small".

### 4. recipes.md:251-252: the TabSize JSDoc does not give every size's padding
> The TabSize JSDoc gives each size's height and its `rg` (10px) horizontal padding (`Tabs/constants.ts`), matching the recipe.

- Evidence: only `standard` and `sm` mention `rg` padding (Tabs/constants.ts:9, :11). `micro` gives a
  height and a radius but no padding (:13), although its recipe has `px-rg` (toggleOption.ts:59). `fill`
  gives no fixed height (:15-18). The icon sizes give dimensions only, and their recipe uses `p-0`
  (toggleOption.ts:63-67). What the JSDoc does state matches the recipe, so the example's conclusion
  ("Flagged: none") still holds.
- Fix: "The TabSize JSDoc gives the heights, and `rg` (10px) padding for `standard` and `sm`
  (`Tabs/constants.ts`). What it states matches the recipe."

## UNVERIFIABLE

### 1. adding-a-component SKILL.md:35-36: "*Prevents:* styles that work nowhere but never ship."
- The fact half is TRUE. emit-css compiles only `src/styles/build.css` (scripts/emit-css.mjs:22),
  build.css is `@import "./index.css"` plus `@source not` for stories (src/styles/build.css:6-7), and no
  `.css` exists under `src/components` (`find`). The phrase "work nowhere" is likely wrong, though. A
  `.css` file imported from a component would be loaded by Storybook's Vite builder, so it would work in
  Storybook and still never reach `dist/styles.css`. Verifying this needs a scratch component that
  imports a `.css` file, viewed in Storybook. Suggested wording: "styles that work in Storybook but
  never ship." dooph-ds-styling SKILL.md:40 states the fact correctly and does not make the "work
  nowhere" claim.

## TRUE (claim → evidence)

### writing-components SKILL.md
- L8: a component presents, and the app owns data, fetching, timers and control → this matches the
  maintainer decision. `grep fetch(|setInterval|XMLHttpRequest|EventSource|WebSocket` in non-story
  `src` finds nothing. (See Notes for Toast.)
- L11, L50: recipe anchors `#8-…` and `#9-…` → headings at recipes.md:159 and :238.
- L13, L59, L64: lint = `tsc --noEmit && node scripts/check-conventions.mjs` → package.json:61. The
  last line is `conventions: N checks passed` → check-conventions.mjs:754. The live run printed 30.
- L15: sibling skills exist → `.agents/skills/` holds dooph-ds-editing-tokens, -styling,
  -adding-a-component and -codebase-map.
- L20: no fetch, URL or interval prop, clock or polling → no such prop in components (grep for
  `url|endpoint|interval|pollInterval?:`). The only `Date.now` (Toast.tsx:57) builds an id and is not a clock.
- L20: lint check "JS timers and animation loops outside their allowlist" → check-conventions.mjs:675.
- L21: never on a thin Radix wrapper or `constants.ts` → Checkbox, Tabs, Popover, Tooltip and every
  `*/constants.ts` carry no directive. The 27 directive files equal the 27 allowlist entries.
- L21: lint check "\"use client\" outside its allowlist" → :669.
- L22: option sets are a const plus a same-named type in `constants.ts`, with `IconSize` the one
  exception → `grep "^export type (\w+) = (typeof \1)"` outside constants.ts finds only
  Icons/BaseIcon.tsx:44. Shapes now has Shapes/constants.ts:5.
- L22: props are typed from the consts, never `VariantProps`, because `null` renders unstyled →
  Tabs.tsx:32-40, Checkbox.tsx:73-79, Sheet.tsx:102 and Button.tsx:26 all say so. The only
  `VariantProps` use is internal (toggleOption.ts:77-78, wrapped in `NonNullable`).
- L23: forwardRef + displayName, `ComponentRef`, `useComposedRefs`, and the lint names "forwardRef
  without displayName" / "ElementRef instead of ComponentRef" → :573 and :567. composeRefs.ts exists.
- L25: `cn(recipe, className)`, JSDoc routing, and consumer `style` last → every `...style` spread in
  `src/components` is the last key (checked at 22 sites: AIModelSelect, AnimatedText, BaseIcon,
  LoadingSpinner, ProgressIndicator, Slider, Sticker, Table, BaseText.tsx:109 and others).
- L26: Radix `data-[state]` states, and overlays portal by default with `portal`/`portalProps` →
  Popover.tsx:19-20, Tooltip.tsx:34-35, DropdownMenu.tsx:132-133 and :254-255, dialogShell.tsx:61-63,
  Modal.tsx:48-50, Sheet.tsx:111-113. Each defaults to `portal = true`.
- L27: the Text rule and the lint names "text-style classes outside Text components" / "typography
  utilities or inline font styles" → :534 and :541. No check matches `<span>{label}</span>`.
- L28: header contracts → AGENTS.md "File contracts".
- L33: option props `shape`, `side`, `selectType`, `mode`, `direction`, `sortDirection`, `state` →
  ShapeButton, Sheet/SidebarWithHoverIcon, DropdownMenu, Calendar/DatePicker/MorphRotationShape,
  AnimatedText, Table, AIThinkingPart/AIToolPart.
- L34: the const names exist (ButtonVariant, ButtonSize, SheetSide, TableSortDirection,
  AIToolPartState, CheckboxChecked, ShapeButtons, RollDirection). DropdownMenuSelectType is the
  sanctioned exception → check-conventions.mjs:463. Lint name "variant constants named *Type" → :625.
- L35: lint name "size keys named default or small" → :631.
- L36: heights 28/34/38/46/54 → tokens.css:484-487 and :494. Utilities at index.css:361-371 and :424.
- L37: value/defaultValue/onValueChange, controlled `value` wins → Toggle.tsx:12-13. Lint name
  "value callbacks not named onValueChange" → :522.
- L38: `active` (RollHoverText, UnderlineLinkText), `hovered` (SidebarWithHoverIcon), `glowing`
  (OutlineButton), `pressed` (HotkeyIndicator), `themeInverse` (OutlineButton, Tooltip).
- L55-59: the rationalization quotes are verbatim from the baseline → SCORES.md:134, :135, :245, :315
  and :36-39. "Lint was red" → SCORES.md:36-39, and :248 for tabs.
- L56: "None of them fetches, polls or runs an interval" → Toggle, Slider and Toast have no fetch or
  setInterval. Toast's auto-dismiss is Radix's own timer (see Notes).
- L57: Button medium is a pill with the hero text role → Button.tsx:117 and :140-145. Hero 16px →
  tokens.css:432.
- L65: Storybook is in codebase-map → codebase-map SKILL.md:62.
- L68: the links resolve. The inventory holds header contracts and the allowlist → inventory.md:7-11.

### recipes.md
- L19-33: ButtonSize matches Button/constants.ts:24-33. No directive (:1-2 comment only).
- L37-43: TabsTriggerProps → Tabs.tsx:35-41.
- L47-65: the Checkbox snippet is verbatim → Checkbox.tsx:126-138, with no directive.
- L67: `data-[state=checked]:bg-prominent` → Checkbox.tsx:55.
- L68-69: `const PopoverTrigger = PopoverPrimitive.Trigger;` → Popover.tsx:10.
- L73-76: ButtonText `as={TabsPrimitive.Trigger}` → Tabs.tsx:46-52.
- L80-81: `const Comp = (asChild ? Slot : "button") as ElementType;` and `<BaseText as={Comp}>` →
  Button.tsx:189-192.
- L83-92: the Slottable render-function snippet → OutlineButton.tsx:271-277. The API exists in
  @radix-ui/react-slot 1.3.3 (dist/index.d.ts: `child`, `children: (slottable) => …`).
- L96-99: `useComposedRefs` is internal (not in src/index.ts) and memoized → composeRefs.ts:12-25.
  Passed last → MorphRotationShape.tsx:191 and :356-359.
- L111-116: routing JSDoc → Input.tsx:8-9 and :190-192, OutlineButton.tsx:62, SegmentedTabSelect.tsx:47.
- L118-119: `style={{ ...typography, ...style }}` → BaseText.tsx:108-109.
- L123-130: portal snippet → Popover.tsx:59-61, with `portal = true` at :33.
- L132-134: overlay and panel are two children because of Presence → dialogShell.tsx:67-69.
- L138-140: entries carry file, reason and `needs`, and a stale `needs` fails → check-conventions.mjs:145
  and :403-410.
- L144-151: every row is right. Slider, SegmentedTabSelect, CopyButton (`navigator.clipboard`),
  CalendarGrid (per-day `onClick`) and DatePicker (`onValueChange={props.onValueChange}`) are on the
  allowlist with matching needs (:160-202). composeRefs, Checkbox, Tabs, Popover, Tooltip,
  Button/constants.ts and Toggle/toggleOption.ts have no directive.
- L153: the header may precede the directive → 12 allowlisted files have the directive after line 1
  (e.g. Input.tsx:84, MorphRotationShape.tsx:56). The regex is line-anchored with the `m` flag (:394).
- L155-157: TIMER_ALLOWLIST holds call counts. Its three entries are CopyButton (setTimeout revert),
  MorphRotationShape and SidebarWithHoverIcon (rAF) → :205-212.
- L163-205: ServiceStatus compiles (scratch tsc). StickerVariant has secondary, alternate and danger
  (Sticker/constants.ts:21-28). `custom` requires `color` (Sticker.tsx:60-70).
- L209-233: the app-side polling code compiles against it (scratch tsc).
- L243-244: Button medium = `h-button-medium ds-px-button-medium rounded-full` → Button.tsx:117. The
  hero role → :140-145.
- L245-246: every tab size is `rounded-tight`/`rounded-mini` with `px-rg`/`p-0` → toggleOption.ts:55-67.
  TabsTrigger renders ButtonText → Tabs.tsx:46.
- L247-250: the recipe is shared → Tabs.tsx:27 and Toggle.tsx:165. `OPTION_SIZE: Record<ToggleSize, …>`
  → Toggle.tsx:45-50.
- L261-262: `ds-px-button-medium` is 22px → dooph-component-tokens.css:595-597 and tokens.css:491.
  ButtonText is 14px (index.css:251 `--ui-text-body`, tokens.css:424). Hero is 16px → tokens.css:432.

### adding-a-component SKILL.md
- L8-12: one change, finished when lint exits 0 → matches lint (package.json:61) and the baseline lesson.
- L19-21: Figma only through a live MCP, otherwise STOP → this is a maintainer rule (memory
  feedback_figma_mcp_must_be_live).
- L23-26: the `import * as XPrimitive` pattern → Checkbox.tsx:21, DropdownMenu, dialogShell. Radix
  packages are `dependencies`, not peers → package.json `dependencies`.
- L28-31: FancyToggleSwitch is in `Toggle/` → Toggle/FancyToggleSwitch.tsx and Toggle/index.ts:4.
- L33-35: the build compiles only build.css, which imports index.css → emit-css.mjs:22 and build.css:6.
  No `.css` under src/components.
- L37-40: the barrel plus `export * from './components/<Name>';` → src/index.ts:2-43. It is the only JS
  entry → package.json `exports["."]` and tsup.config.ts:36. Every component folder has an index.ts.
- L41-46: lint scans stories for spacing, arbitrary units and hex → `tsx(ctx)` includes stories
  (:123-125, :482, :492, :551). A fixed demo width goes in `style={{ width }}` → :480 why.
- L48-52: CTAButton's invariant is the fixed shape per size → CTAButton.tsx:5-7 and :16-18. An
  expressive detail gets a header line → styling SKILL.md:26. 40 of 318 files have a header →
  inventory.md:7.
- L53-56: use-client entries carry `reason` + `needs`, timer entries `reason` + `count` →
  check-conventions.mjs:145-212.
- L57-58: `## [Unreleased]` → `### Added` → CHANGELOG.md:10 and :472 (CHANGELOG.md was being edited by another agent during this check, so these lines may move). The version is still 5.3.0
  (package.json:3).
- L59-63: generate-docs writes the codebase-map inventory → generate-docs.mjs:6. sync-skills mirrors
  `.agents/skills` → sync-skills.mjs:2-8. `npm run storybook` → package.json:59.
- L69-72: lint names "default exports in component modules" (:528) and "generated doc references out
  of date" (:702). The first JSDoc sentence → generate-docs.mjs:216 and :256. Story text goes through
  the text-style check (stories are in `text(ctx)`, :129).
- L78-81: the baseline quotes → SCORES.md:36-39, :81-82 (`children` header), :138-139 (hex and
  setInterval), :226-227 (`text-style-label`, raw var). "stale generated theme" → SCORES.md:248.

### file-templates.md
- L3: CTAButton, Sticker and Toggle each have Name.tsx, constants.ts, index.ts and stories (`ls`).
- L12-31: the template header comment matches Button/constants.ts:1-2. No directive.
- L35-54: Example.tsx compiles (scratch tsc), with `cn` at `../../utils/cn`.
- L57-58: the destructured default is the Default column → generate-docs.mjs:19-20 and :255.
- L63-70: `export *` makes the barrel public API → src/index.ts.
- L75-78: one line in `// Components`, above `// Utilities` → src/index.ts:1 and :45.
- L83-117: the stories template compiles against @storybook/react-vite types. 46 stories import
  `@storybook/react-vite`.
- L119-120: CTAButton `AllVariants` sets `text`, `href` and `icon` → CTAButton.stories.tsx:86-91.
- L122-125: the story groups are exactly AI Chat, Bits & Pieces, Buttons, Dates, Icons, Inputs, Menus,
  Navigation, Overlays, Progress and Text (`grep title:`). The glob is `../src/**/*.stories.@(ts|tsx)`
  → .storybook/main.ts:6.
- L129-132: Disabled stories with the chosen or checked state → FancyToggleSwitch.stories.tsx:100-121,
  Checkbox.stories.tsx:54-63. Checkbox `AllStates` → :94.
- L133-138: Controlled with `render: function ControlledStory()` → FancyToggleSwitch.stories.tsx:79-84.
  Checkbox `checked`/`onCheckedChange` → Checkbox.stories.tsx:77-85.
- L139-153: the Practical story → DropdownCaret.stories.tsx:76-85 (the helper there is `TriggerColumn`).
- L155-156: story text goes through Text components → DropdownCaret.stories.tsx:60 `<ButtonText>{label}</ButtonText>`.

## Old false-claims register (FINDINGS.md §4): no reappearance

The phrases checked were asChild/Slot, "use client" triggers, consts exceptions, the barrel/index.ts,
portals, VariantProps, h-button heights, CHANGELOG and stories.

- The old false "use client" claim was that only useState, useEffect, useRef, browser APIs and timers
  require the directive (codebase SKILL.md:623-624). It does not reappear: these docs add handler
  closures and forwarded function props. False 1 above is a different overstatement, in the opposite
  direction.
- The old false "consts" claim was "except Avatar and BaseIcon", which missed a Shapes exception
  (codebase SKILL.md:640-641). It does not reappear: Avatar/constants.ts and Shapes/constants.ts now
  exist, and IconSize is the only exception.
- The old false barrel claim was "Components + *Props come from the component's index.ts", which was
  false because three folders had no index.ts (codebase SKILL.md:618). It does not reappear: every
  `src/components/*/` has an index.ts.
- The old false asChild claims (that asChild works on the decorated leaves, while F-003 found it
  throws) do not reappear as false. The leaves now use `Slottable` (remediation item WI-081, in
  review), and asChild stories exist (e.g. OutlineButton.stories.tsx:83-86).
- No unreleased version is named as released ("5.4", "v6"): neither string occurs in the batch.

## Cross-doc contradictions and notes

- **Internal, writing-components.** SKILL.md:21 ("calls hooks") against recipes.md:149 (a
  `useCallback`-only module gets no directive) and the composeRefs.ts:1-4 comment. This is False 1.
- **Storybook port.** adding-a-component SKILL.md:62 says to run `npm run storybook` (port 6006).
  codebase-map SKILL.md:62 says to reuse the `.claude/launch.json` "storybook" entry on 6007, which
  may already be running. These don't contradict each other, but adding-a-component could point to the
  codebase-map line.
- **Barrel guidance.** file-templates.md:69 says to leave "a part's cva recipe" out of the barrel, yet
  Tabs/index.ts:1 exports `tabTriggerVariants`, a part recipe. This looks deliberate: toggleOption.ts:24-26
  names consumers applying it. The guidance is about new components, so it is not graded FALSE.
  Saying "existing exports such as buttonVariants/tabTriggerVariants stay" would remove the doubt.
- **Toast timers (ungraded).** SKILL.md:8 says the app owns timers. ToastProvider defaults
  `duration = 4000` (Toast.tsx:232) and Radix Toast runs the dismiss timer. The consumer controls it
  through `duration`, and no DS JS timer exists (TIMER_ALLOWLIST has no Toast entry), so this is
  consistent with "no timers in DS code". Still, it is the one place where DS behaviour has a default
  timeout. If the maintainer considers that a timer the DS owns, SKILL.md:56 ("None of them … runs an
  interval") is still literally true, but L8 would need a carve-out.
- The styling skill agrees with adding-a-component on `.css` placement (styling SKILL.md:40) and on
  expressive details getting a header line (styling SKILL.md:26).

## Fixes

- FALSE 1 (use client trigger): FIXED. Re-verified: composeRefs.ts, ProgressIndicator.tsx and WavyDivider.tsx call useCallback/useMemo/useId and carry no directive. SKILL.md:21 now reads "calls a client-only hook (`useState`, `useRef`, an effect, context)" and adds "`useCallback`, `useMemo`, `useId` and `forwardRef` run in React's server build and need none". The recipes.md table row now covers `useCallback`, `useMemo` or `useId`, with the three real examples. The two docs agree (contradiction resolved).
- FALSE 2 (asChild and CTAButton): FIXED. Re-verified CTAButton.tsx:209-218 uses `cloneElement(children, undefined, content)` inside `Slot`, no `Slottable`. Added: "CTAButton is the exception: with `asChild` it replaces the slotted element's children with its own content (`cloneElement`)."
- FALSE 3 (size scale `standard`): FIXED. Re-verified LoadingSpinnerSize is sm/rg/md/xl. Now: "Where a scale has a base size it is `standard`, then `sm`, `iconSm: "icon-sm"`; never `default` or `small`. (`LoadingSpinnerSize` is a diameter scale, `sm`/`rg`/`md`/`xl`, with no `standard`.)"
- FALSE 4 (TabSize JSDoc): FIXED. Re-verified Tabs/constants.ts:9,11 only. Now: "The TabSize JSDoc gives the heights, and `rg` (10px) padding for `standard` and `sm`. What it states matches the recipe."
- UNVERIFIABLE 1 (styles that "work nowhere"): FIXED by narrowing. Now: "styles that never ship: emit-css compiles only `src/styles/build.css`." (scripts/emit-css.mjs:22; build.css is the build entry.)
- Contradiction SKILL.md:21 vs recipes.md:149: FIXED (see FALSE 1).
- Claims files updated: dooph-ds-writing-components.md, dooph-ds-adding-a-component.md.

## Fix verification

Checked 2026-10-11 against the working tree. `npm run lint` exit 0 (30 checks); `sync-skills --check` exit 0 (9 skills x 2 mirrors).

- FALSE 1 (use client trigger): VERIFIED. SKILL.md:21 now says client-only hooks, and that `useCallback`, `useMemo`, `useId` and `forwardRef` need none. React's server build exports all four (react.react-server.production.js:392,413,417,420). composeRefs.ts, ProgressIndicator.tsx and WavyDivider.tsx carry "No use client" comments and call those hooks. The recipes.md table row matches, so the contradiction is resolved.
- FALSE 2 (asChild and CTAButton): VERIFIED. SKILL.md:24 now names the CTAButton exception; CTAButton.tsx:215-217 uses `cloneElement(children, undefined, content)` inside `Slot`.
- FALSE 3 (size scale `standard`): VERIFIED. SKILL.md:35 now says "Where a scale has a base size", with the LoadingSpinnerSize note; LoadingSpinner/constants.ts:28-36 is sm/rg/md/xl.
- FALSE 4 (TabSize JSDoc): VERIFIED. recipes.md:251-252 now limits the `rg` padding claim to `standard` and `sm`; Tabs/constants.ts:9,11 matches.
- UNVERIFIABLE 1 ("work nowhere"): VERIFIED. SKILL.md:35-36 now says "styles that never ship: emit-css compiles only `src/styles/build.css`", true per emit-css.mjs:22.
