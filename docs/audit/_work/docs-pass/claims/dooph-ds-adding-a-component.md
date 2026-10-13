# Claims: dooph-ds-adding-a-component

Every factual claim in `.agents/skills/dooph-ds-adding-a-component/SKILL.md` (S) and
`references/file-templates.md` (R), one per line, with evidence. Paths are repo-relative.
Maintainer-intent claims cite the brief/constraints, since they are instructions, not code.

## SKILL.md

- S overview: a component is component file + constants.ts (when it has discrete options) + folder index.ts + a src/index.ts line + stories — `src/components/CTAButton/{CTAButton.tsx,constants.ts,index.ts,CTAButton.stories.tsx}` (ls); `src/index.ts:3`; Popover has no constants.ts and no options (`src/components/Popover/` ls: Popover.tsx, Popover.stories.tsx, index.ts)
- S overview: type-checking alone is not lint — `package.json:61` (`"lint": "tsc --noEmit && node scripts/check-conventions.mjs"`)
- S step 1: Figma only through a live MCP; expired → STOP and tell the maintainer — maintainer intent: `.superpowers/sdd/docs-pass-plan/task-5-brief.md:44`, `.superpowers/sdd/docs-pass-plan/constraints.md:12`
- S step 1: never guess a design value; unknowns are open questions in the hand-back — maintainer intent: `docs/audit/_work/agent-rules.md:42` ("Never guess a design value"); baseline failure pattern `docs/audit/_work/docs-pass/baseline/SCORES.md:353-359`
- S step 2: Radix primitives are imported `import * as XPrimitive from "@radix-ui/react-x"` — `src/components/Popover/Popover.tsx:1`, `src/components/Checkbox/Checkbox.tsx:21`, `src/components/Tooltip/Tooltip.tsx:1`, `src/components/Toggle/FancyToggleSwitch.tsx:31` (`* as ToggleGroup`)
- S step 2: Radix primitives are per-package runtime `dependencies` in package.json — `package.json:86-97` (`@radix-ui/react-checkbox` … `@radix-ui/react-tooltip` under `"dependencies"`)
- S step 2: a new dependency is added only with the maintainer's go-ahead — maintainer intent: `docs/audit/_work/agent-rules.md:5` ("Install nothing and add no dependency"); reviewer instruction, fix round 1
- S step 3: a family member goes in the family's folder and barrel: FancyToggleSwitch in Toggle/ — `src/components/Toggle/FancyToggleSwitch.tsx`, `src/components/Toggle/index.ts:4-8`
- S step 3: a standalone component gets its own folder — `src/components/CTAButton/`, `src/components/Popover/`, `src/components/DatePicker/` (ls)
- S step 4 (Prevents): a .css under a component folder never ships because emit-css compiles only src/styles/build.css (scripts/emit-css.mjs:22; src/styles/build.css:6-7); whether it would work in Storybook is not claimed.
- S step 4: no .css file under component folders — `find src/components -name "*.css"` returns nothing
- S step 4: the build compiles only src/styles/build.css, which imports index.css — `scripts/emit-css.mjs:22` (`npx tailwindcss -i src/styles/build.css -o dist/styles.css`); `src/styles/build.css:6` (`@import "./index.css"`); index.css pulls in only tokens.css and dooph-component-tokens.css: `src/styles/index.css:4-5`
- S step 5: the barrel names the component, its *Props type and its consts — `src/components/CTAButton/index.ts:1-3`; `src/components/Toggle/index.ts:1-8`; `src/components/AIChat/index.ts:1-46`
- S step 5: src/index.ts line form `export * from './components/<Name>';` — `src/index.ts:2-44`
- S step 5: src/index.ts is the only package entry — `package.json:20-28` (`exports`: `.` → dist/index.*, plus `./styles.css`, `./theme.css`); `tsup.config.ts` comment "dist/index.js remains the single public entry"
- S step 5: a component not exported from src/index.ts is missing from components.md — `scripts/generate-docs.mjs:16-17` (program built from src/index.ts), `:245` ("Every export of the package entry (`src/index.ts`)")
- S step 6: stories sit beside the component as *.stories.tsx — every story file is `src/components/<Folder>/<Name>.stories.tsx` (ls: 46 files); `.storybook/main.ts:6` (`stories: ['../src/**/*.stories.@(ts|tsx)']`)
- S step 6: `Default` story — `src/components/Popover/Popover.stories.tsx:14`, `src/components/LinearProgressIndicator/LinearProgressIndicator.stories.tsx:28` (13 of 46 story files export `Default`)
- S step 6: every variant as one story each or an `AllVariants` grid — `src/components/CTAButton/CTAButton.stories.tsx:31-69` (one per variant×size), `:86` (`AllVariants`); `src/components/Sticker/Sticker.stories.tsx:37-85`, `:139`
- S step 6: `Disabled` story — `src/components/Toggle/FancyToggleSwitch.stories.tsx:100`, `src/components/Checkbox/Checkbox.stories.tsx:54`
- S step 6: `Controlled` story for a value control — `src/components/Checkbox/Checkbox.stories.tsx:77`, `src/components/Toggle/FancyToggleSwitch.stories.tsx:79`
- S step 6: `Practical` story for an expressive detail — `src/components/DropdownCaret/DropdownCaret.stories.tsx:76-85`; maintainer intent `docs/audit/_work/agent-rules.md:54-60` ("gets a \"Practical\" story")
- S step 7: CTAButton's header contract holds the invariant "the shape is fixed per size" — `src/components/CTAButton/CTAButton.tsx:15-18`
- S step 7: an expressive detail always gets a header-contract line — `src/components/DropdownCaret/DropdownCaret.tsx:19,35` (header names the `.ds-expr-caret-*` helpers and `--ui-caret-*`); maintainer intent `docs/audit/_work/agent-rules.md:54-58` ("gets a header-contract line in its component")
- S step 7: most files have no header contract — `.agents/skills/dooph-ds-codebase-map/references/inventory.md:7` ("317 files; 39 open with a header contract"); e.g. `src/components/Popover/Popover.tsx:1` starts with an import
- S step 7: a contract only when the file carries an invariant a reasonable edit would violate — `AGENTS.md` ("Do not add a contract to a file that has none unless it now carries an invariant a reasonable edit would violate.")
- S step 8: a "use client" module needs an allowlist entry with `reason` and `needs` in scripts/check-conventions.mjs — `scripts/check-conventions.mjs:145-147` (`USE_CLIENT_ALLOWLIST`, `{ file, needs, reason }`), `:395-413` (`useClient` check fails an unlisted directive)
- S step 8: a JS timer needs an entry with `count` — `scripts/check-conventions.mjs:205-211` (`TIMER_ALLOWLIST`, `{ file, count, reason }`), `:415-435`
- S step 8: use-client entries carry `reason` + `needs`, timer entries `reason` + `count` — `scripts/check-conventions.mjs:145-147`, `:205-211`
- S step 8: never add an allowlist entry just to pass lint — `scripts/check-conventions.mjs:49-53` (constraint: "Fix the entry (or the code), never the matching")
- S step 9: CHANGELOG has `## [Unreleased]` → `### Added` listing new components — `CHANGELOG.md:10-17`
- S step 9: never bump `version` — `.superpowers/sdd/docs-pass-plan/constraints.md:3`; `package.json:3`
- S step 10: `node scripts/generate-docs.mjs` regenerates the generated references — `scripts/generate-docs.mjs:3-6,9-10`
- S step 10: `npm run storybook` runs Storybook — `package.json:59` (`storybook dev -p 6006`)
- S step 10: generate-docs writes `.agents/skills/dooph-ds-codebase-map/references/inventory.md`, a mirrored skill file, so a new component leaves the mirrors stale — `scripts/generate-docs.mjs:662-666` (OUTPUTS), `scripts/sync-skills.mjs:5-13` (mirrors copy every canonical skill file); lint check "skill mirrors out of sync with .agents/skills" `scripts/check-conventions.mjs:709`
- S step 10: order generate-docs → sync-skills → lint — follows from the line above (sync-skills must run after the inventory is rewritten, lint checks both)
- S step 6: lint scans stories for spacing, arbitrary px/rem/em/deg and hex — `scripts/check-conventions.mjs:125` (`tsx` keeps stories), used by arbitrary lengths `:482`, numeric spacing `:492`, hex `:551`; fixtures `scripts/check-conventions.fixtures/{arbitrary-length,numeric-spacing,hex-colour}.story.stories.tsx`; the stories that broke it were fixed (e.g. `src/components/Checkbox/Checkbox.stories.tsx:70,84`, now `gap-sm`)
- S step 6: a demo frame size with no token goes in `style={{ width: … }}` with a short comment — the arbitrary-length why `scripts/check-conventions.mjs:480`; e.g. `src/components/Modal/Modal.stories.tsx:25-28`, `src/components/AIChat/AIPromptInput.stories.tsx:81-83`
- S step 6: stories use the same tokens as components — maintainer intent: `docs/audit/_work/agent-rules.md:26` ("New code must not add to any count"); reviewer instruction, fix round 1
- S quick ref: option values in constants.ts as const + same-named type, no directive — `src/components/CTAButton/constants.ts:1-15`; `src/components/Sticker/constants.ts:1-2`; no constants.ts carries a `"use client"` directive (`grep -l '^["'"'"']use client' src/components/*/constants.ts` → none)
- S quick ref: lint check names "variant constants named *Type", "size keys named default or small", "\"use client\" outside its allowlist" — `scripts/check-conventions.mjs:625`, `:631`, `:669`
- S quick ref: lint check "default exports in component modules" — `scripts/check-conventions.mjs:528`
- S quick ref: first JSDoc sentence of a prop is its components.md description — `skills/dooph-design-system-usage/references/components.md:12`; `scripts/generate-docs.mjs:250`
- S quick ref: lint check "generated doc references out of date" — `scripts/check-conventions.mjs:702`
- S quick ref: lint check "text-style classes outside Text components", which also scans stories — `scripts/check-conventions.mjs:534-537`, `:125` (`tsx` keeps stories), `:129`
- S rationalizations: "Clean type-check." (checkbox-field-row) and "Type-check passes." (tabs) handed back with lint red on numeric spacing / a stale generated theme — `docs/audit/_work/docs-pass/baseline/SCORES.md:383-386`, `:85-87`, `:247-248`
- S rationalizations: "All clean." after `npx tsc --noEmit` only; lint failed on `text-style-label` and raw `var(--ui-*)` — `SCORES.md:224-227`
- S rationalizations: "Everything passes — type-check and build are clean"; lint failed on hex and `setInterval` — `SCORES.md:19`, `:384`
- S rationalizations: header "`children` is reserved for the label content"; the component never read `children` — `SCORES.md:81-83`
- S red flags: "follows the pattern" quote — `SCORES.md:245`, `:355`
- S hand-back: `npm run lint` prints `conventions: N checks passed` or `FAIL <check name>: …` lines — `scripts/check-conventions.mjs:6-10`, `:744-754`
- S hand-back: `node scripts/sync-skills.mjs` syncs the skill mirrors — `scripts/sync-skills.mjs:5-13`
- S hand-back: lint check "skill mirrors out of sync with .agents/skills" — `scripts/check-conventions.mjs:709`

## references/file-templates.md

- R: constants.ts banner comment text — verbatim `src/components/CTAButton/constants.ts:1-2` (also `Sticker/constants.ts:1-2`)
- R: const + `(typeof X)[keyof typeof X]` type, same name — `src/components/CTAButton/constants.ts:4-15`
- R: size keys `standard` / `sm` — `src/components/Toggle/constants.ts:36-41`; lint `scripts/check-conventions.mjs:631`
- R: component wiring: `forwardRef`, `cn(..., className)`, `displayName`, named export at the end, `cn` from "../../utils/cn" — `src/components/CTAButton/CTAButton.tsx:33,131,201-207,234,238`; `src/components/Popover/Popover.tsx:7,23-66,68-75`
- R: the default written in the render function is what components.md prints as Default — `skills/dooph-design-system-usage/references/components.md:11`; example `components.md:438` (`CTAButtonSize.standard`)
- R: barrel form — `src/components/CTAButton/index.ts:1-3`
- R: src/index.ts re-exports each barrel with `export *`, so everything in a barrel is public — `src/index.ts:2-44`
- R: the line goes in the `// Components` list above `// Utilities` — `src/index.ts:1`, `:46`
- R: story meta shape (react-vite import, title, component, layout centered, autodocs, argTypes from `Object.values`, `satisfies Meta<typeof X>`, `StoryObj<typeof meta>`) — `src/components/CTAButton/CTAButton.stories.tsx:1-26`; `src/components/Sticker/Sticker.stories.tsx:1-33`; `src/components/Toggle/FancyToggleSwitch.stories.tsx:1,13-21`
- R: every story file imports from `@storybook/react-vite` — 46 of 46 (`grep -l "@storybook/react-vite" src/components/*/*.stories.tsx`); CHANGES.md "docs owed" `docs/audit/CHANGES.md:3542-3543`
- R: existing title groups: AI Chat, Bits & Pieces, Buttons, Dates, Icons, Inputs, Menus, Navigation, Overlays, Progress, Text — `grep -h "^  title:" src/components/*/*.stories.tsx` (e.g. `Sticker.stories.tsx:16`, `CTAButton.stories.tsx:7`, `FancyToggleSwitch.stories.tsx:14`, `Popover.stories.tsx:7`)
- R: Storybook picks up any src/**/*.stories.tsx — `.storybook/main.ts:6`
- R: Disabled includes the chosen/checked state — `src/components/Toggle/FancyToggleSwitch.stories.tsx:95-100` (JSDoc + story), `src/components/Checkbox/Checkbox.stories.tsx:60` (`DisabledChecked`)
- R: `AllStates` grid — `src/components/Checkbox/Checkbox.stories.tsx:94`; `src/components/DropdownCaret/DropdownCaret.stories.tsx:25`
- R: Controlled story holds `useState` and passes `value` / `onValueChange` (FancyToggleSwitch) — `src/components/Toggle/FancyToggleSwitch.stories.tsx:79-91`
- R: or the Radix pair the component passes through, `checked` / `onCheckedChange` (Checkbox) — `src/components/Checkbox/Checkbox.stories.tsx:77-92` (`<Checkbox checked={checked} onCheckedChange={setChecked} />` at :85)
- R: a stateful render is a named function `render: function ControlledStory()` — `src/components/Toggle/FancyToggleSwitch.stories.tsx:80`
- R: Practical story template — `src/components/DropdownCaret/DropdownCaret.stories.tsx:76-85`
- R: a component with required props needs `args` on every story, `render` stories included — `src/components/CTAButton/CTAButton.stories.tsx:86-91` (`AllVariants` sets `text`, `href`, `icon` beside its `render`); `CTAButtonProps` requires `text` and `icon`: `src/components/CTAButton/CTAButton.tsx:78,80`
- R: story text through Text components — `src/components/DropdownCaret/DropdownCaret.stories.tsx:30,60`; `src/components/Sticker/Sticker.stories.tsx:35`
- R (verification of the templates): the five code blocks, completed with a cva recipe and a `Column` helper, type-check with the repo's tsc and settings and trip no code check in `check-conventions.mjs --fixtures` (scratch run, see report)
- S step 10: the verify order starts with `npm run sync-tokens` when tokens or a `.text-style-*`/`.h-*`/`.size-*` rule changed (task 11, 2026-10-11) — scripts/sync-theme.mjs:386-397 (those rules feed cn's lists); scripts/check-conventions.mjs:681 ("generated theme out of date")
