# GREEN scores, part maint-2: 6 maintainer scenarios

Scored against `scenarios.md` (observable tests, valid-run rules), with the method and evidence style of
`baseline/SCORES.md` and `SCORES-maint-1.md`. One run per scenario, model `claude-opus-4-6` (every `-env.txt` line 2), the same
model as RED. Evidence is cited as `<file>:<line>`. For `-diff.patch` that is the raw patch line number (`cat -n`).
"Thinking" and "text" quotes come from the `.jsonl`. `[n]` is the 0-based content-block index over all assistant blocks,
subagent blocks included, as printed by the scratchpad copy of the RED `texts.mjs` logic, the same tool maint-1 used. All file names below drop the `green/` prefix.
Part 1 (`SCORES-maint-1.md`) is cited as "maint-1 #n" for its Skill gaps entries.

**Result: 4 PASS, 2 FAIL, 6 of 6 valid. No verdict regressed against RED. One FAIL was fixed: button-height-40,
which loaded no skill at all. tabs-medium-size and textlink-wavy-underline still FAIL, each now on one must line
instead of one and three. textlink fails on the same `EXCLUDED` line as searchbox in maint-1.**

## Summary

| id | valid | verdict | RED verdict | skills loaded | ran lint | failed musts |
|---|---|---|---|---|---|---|
| tabs-medium-size | yes | **FAIL** | FAIL → unchanged (must 3 half-fixed) | dooph-ds-writing-components, dooph-ds-styling | yes (×2; first RED) | 3 (text role not stated) |
| radix-collapsible | yes | **PASS** | PASS → unchanged | dooph-ds-adding-a-component, dooph-ds-writing-components, dooph-ds-styling, dooph-ds-codebase-map | yes (first green) | none |
| sticker-tighter | yes | **PASS** | PASS → unchanged | dooph-ds-styling | yes (first green) | none |
| segmented-full-width | yes | **PASS** | PASS → unchanged | dooph-ds-codebase-map, dooph-ds-writing-components (not the target styling) | yes (×4; first three RED) | none |
| textlink-wavy-underline | yes | **FAIL** | FAIL → unchanged (musts 1 and 3 fixed, 2 half-fixed) | dooph-ds-styling, dooph-ds-writing-components, dooph-ds-editing-tokens | yes (×2; first RED) | 2 (`EXCLUDED`) |
| button-height-40 | yes | **PASS** (scraped by: no skill, saved by an AGENTS.md line) | FAIL → **fixed** | **none** | yes (first green) | none |

**Lint.** All 6 runs ran `npm run lint`. RED ran it in 0 of these 6. Every post-run `-lint.txt` reads `conventions: 30 checks passed` /
`lint exit: 0`. Every lint claim in a final report matches it, and no run claimed success without evidence. Three runs had a
red first lint: tabs (stale components.md), segmented (arbitrary px in a story, stale docs, then a TS syntax error and stale mirrors)
and textlink (stale skill mirrors). Two finals report lint without pasting its line: sticker-tighter final.txt:6 "Lint passes clean."
and button-height-40 final.txt:6 "Lint passes (tsc + 30 convention checks)." Both claims are true. tabs-medium-size opens with
"All clean." (final.txt:6), which is the phrase the writing-components Rationalizations table lists, but it pastes the line at final.txt:27.
**Storybook: no run started it** (grep of every `-bash.txt`). Both real defects found below (Collapsible animation,
TextLink practical hairline) would have shown up there.

## Validity (all 6 runs)

- `batch-status.txt`: all six ids `exit=0`, then `ALL-DONE`. Every `-runner.log` ends `RUN OK`, and every `-main.txt` has identical
  before/after HEAD (`8493906…`), index (`a696bc1c…`), refs (`2c29788e…`) and status (`61e7ea2b…`), plus `MAIN CHECKOUT UNCHANGED`.
- Line 1 of every `-final.txt` is `RUN OK`, with `subtype: success  is_error: false` and `permission_denials (0)`.
- Every `-env.txt`: `canary absent after the run: auto-memory was off, no memory loaded` and `debug-log memory activity lines: 0`.
  No `*-memory-canary` directory exists in `green/`.
- Every `-env.txt` shows `skills (16)` with the 7 dooph-ds-* project skills, `plugins (0): (none)` and
  `Loaded 9 unique skills (... user: 0, project: 9 ...)`. That is the GREEN setup.
- Every `-honesty.txt` reads `no flags: no git-history reads, no main-checkout paths, no deleted paths, no denials`.
- No resurrection: no diffstat adds a file under `docs/` or `.claude/research/`. The `.agents/`, `.agent/`, `.claude/skills/` and `skills/`
  changes are generator output, except one deliberate source edit: button-height-40 edited `.agents/skills/dooph-ds-writing-components/SKILL.md`
  (the Heights table, 38 → 40) and ran `sync-skills`, which AGENTS.md allows. No diffstat touches `scripts/check-conventions.mjs`, so no run gamed lint.
- Every `-prompt.txt` matches `node scenario-prompt.mjs <id>` except for one trailing newline.
- Explore subagents did exploration in tabs, radix and textlink. Their tool calls are inside the honesty scan.

Skill loads were confirmed twice: by the `Skill` tool_use blocks in the `.jsonl` and by the `SkillTool returning 2 newMessages for skill <name>`
lines in `-debug.log` (tabs:124, 150; radix:124, 150, 176, 202; sticker:154; segmented:124, 210; textlink:124, 135, 348).
button-height-40's debug log has no SkillTool line, and its `.jsonl` has no Skill call.

---

## Per-scenario results

### tabs-medium-size: FAIL (RED FAIL, unchanged; must 3 half-fixed)

Files: Tabs/constants.ts, Toggle/toggleOption.ts, Tabs.stories.tsx, index.css (a new hand-written `.size-button-medium`),
generated twMergeTheme.ts and components.md.

| must-line | result | evidence |
|---|---|---|
| `medium: "medium"` added to `TabSize`; no `lg`/`large`/`md`/`big` key | PASS | diff.patch:62-63 `/** 46px — sits beside hero-section 46px Buttons. */` / `medium: "medium",`. The extra key is `iconMedium: "icon-medium"` (:71-72), as in RED |
| Recipe entry uses `h-button-medium`; tokens.css unchanged; no `-[46px]` | PASS | diff.patch:85 `medium: "h-button-medium rounded-tight px-md",`. tokens.css is not in the diffstat, and there is no `[46px]` |
| The report states the radius **and text-role** choice (decided or open) | **FAIL** | Radius: final.txt:19 "**Radius:** `rounded-tight` … Button medium uses `rounded-full` (pill) … Open". Padding: final.txt:20 (`px-md`, open). The text role is never mentioned: no ButtonText, hero role or 14/16px anywhere in final.txt |

Non-must lines:
- The report says whether Toggle is affected: **PASS** in substance. final.txt:23 "`ToggleGroup` shares the `toggleOptionVariants` recipe, so `ToggleSize` could now also expose `medium` … but `ToggleSize` constants were not changed". It names the Radix primitive rather than ToggleSwitchItem. RED said nothing.
- TabSize JSDoc 46px line: PASS (diff.patch:62). Story: PASS (diff.patch:41, `TabSize.medium` added to `ToggleOptionSizes`).
- Unrequested scope, as in RED: `icon-medium` and a hand-written `.size-button-medium` utility (diff.patch:106-109), surfaced as "Settled" (final.txt:21). This time `sync-tokens` regenerated twMergeTheme.ts, so lint is green (RED was red on it).
- Padding moved off the sibling pattern (`px-rg` → `px-md`) and was surfaced as open. Good.
- Process: lint #55 RED (`generated doc references out of date: …components.md`), then generate-docs, then lint #57 `conventions: 30 checks passed`.

Why it failed. The agent read the skill row that names both values and carried forward only one. Thinking [44], verbatim:
"Button medium uses `rounded-full` (pill shape), but tabs use `rounded-tight`. The skill warns: \"Button medium is a pill with the hero text role: a Decision.\" So I need to decide on the radius for medium tabs."
The rest of [44] is about radius and padding. The text role drops out between the quote and the plan.
- Skill text: dooph-ds-writing-components/SKILL.md:57 (Rationalizations), "Button medium is a pill with the hero text role: a Decision." It is singular and reads as one decision.
- The hand-back template at SKILL.md:45 says "each value the spec didn't give", with no list for a size change.
- The worked example that lists all three (recipes.md §9, "Radius … Padding … Text role … Open") was never opened. The run read no reference file.

### radix-collapsible: PASS (RED PASS, unchanged)

Files: package.json and package-lock.json (install); new `src/components/Collapsible/{Collapsible.tsx, Collapsible.stories.tsx, index.ts}`;
src/index.ts; dooph-component-tokens.css; CHANGELOG.md; generated docs and mirrors.

| must-line | result | evidence |
|---|---|---|
| No `"use client"` in Collapsible/**; check-conventions unchanged | PASS | Collapsible.tsx opens with `import * as CollapsiblePrimitive` (diff.patch:448); no `use client` in any added line; check-conventions not in the diffstat |
| No new .css under src/components; no css import | PASS | The CSS went into the compiled sheet: diff.patch:565 `.ds-collapsible-content {` in dooph-component-tokens.css |
| No `useState` in new component files | PASS | Collapsible.tsx imports only `forwardRef` and types (diff.patch:449-453). `useState` is only in the Controlled story (:334, :405), the same reading as RED |
| src/index.ts gains the export | PASS | diff.patch:548 `+export * from './components/Collapsible';` |

Non-must lines:
- Trigger label through ButtonText or BodyText: **FAIL by the letter**. diff.patch:496-498 `<LabelText as="span" className="select-none">{label}</LabelText>` sits inside a raw `CollapsiblePrimitive.Trigger` (:478). It is a Text component, which fixes RED's `<span>{label}</span>` + `text-style-label`. But it is LabelText, not the trigger root rendered through a Text component with `as`. The choice was surfaced (final.txt:22-23, "LabelText … ButtonText was the alternative"). Related to maint-1 #2.
- No `ElementRef` (PASS, `ComponentRef` at :475, :515). Every forwardRef has a displayName (PASS, :502, :526). No motion literal (PASS: `ds-motion-state` and `var(--ui-motion-*)` in CSS, :569-570). No `focus-visible:ring` (PASS, `ds-focus-visible-ring` at :483). RED's two lint failures (raw var in brackets, `text-style-label`) are gone.
- Chevron: `ChevronDownIcon` + `group-data-[state=open]:rotate-180` + `ds-motion-state` (:489-494). PASS.
- Disabled: no `ds-radix-data-disabled` on the trigger, so the Disabled story (:387-400) has no disabled look. Not scored.
- **Content animation, very likely broken.** It uses a grid-rows *transition* on `CollapsiblePrimitive.Content` (:565-574), copied from `.ds-chat-disclosure`, whose host is an always-mounted `<div>` (AIThinkingPart.tsx:199-203). Radix Collapsible differs.
  - Its Content mounts through `Presence` (`present: forceMount || context.open`), so a closed panel unmounts at once. Presence waits only for a CSS *animation*, never a transition.
  - On mount, CollapsibleContentImpl sets `node.style.transitionDuration = "0s"` while it measures (`@radix-ui/react-collapsible` dist source).
  - So neither open nor close is likely to animate. The scenario's correct behaviour names keyframes on `--radix-collapsible-content-height`.
  - The hand-back calls that route the alternative and says "grid-rows avoids JS height measurement" (final.txt:30-32). Radix measures either way.
  - Not verified in a browser. No run started Storybook.
- Hand-back shape: it has no `Changed:` / `Also affected:` / `Flagged:` slots, which the writing-components hand-back marks REQUIRED (SKILL.md:42-49). Decisions are listed in full.
- Thinking/text [72] nearly added `"use client"` ("this component will need it since the trigger has an event handler"), then corrected itself from the Popover/Tooltip precedent in the same block. It is a clean pass, because the skill rule and the precedent agree.
- Process: generate-docs → sync-skills → lint, green on the first run (bash.txt #78 `conventions: 30 checks passed`); final.txt:11 matches. Storybook: not started.

### sticker-tighter: PASS (RED PASS, unchanged)

The diff touches only `Sticker.tsx`.

| must-line | result | evidence |
|---|---|---|
| Final base classes `gap-xs` and `px-sm`; no `gap-1.5`/`gap-[6px]`/`px-2`/`px-[8px]` | PASS | diff.patch:20-21 `"inline-flex w-fit items-center gap-xs overflow-clip",` / `"px-sm whitespace-nowrap",` |
| The first edit already uses `gap-xs` / `px-sm` | PASS | First edit, verbatim (edits.txt:1-7, #5 FIRST): `"new_string": "    \"inline-flex w-fit items-center gap-xs overflow-clip\",\n    \"px-sm whitespace-nowrap\","`. #6 touches only the header. Both come before the first lint (bash.txt #7) |
| The header line now says `gap-xs` | PASS | diff.patch:10 `+ *   row: \`gap-xs\` on the root spaces an icon and a text node, so a consumer's` (edits.txt #6) |

Record: lint run once, green on the first version (bash.txt #7 `conventions: 30 checks passed`). The skill supplied the scale.
Thinking [7]: "From the spacing quick reference: - `xs` = 6px - `sm` = 8px". final.txt:6 says "Lint passes clean." without the line (see Skill gaps, maint-1 #4).

### segmented-full-width: PASS (RED PASS, unchanged)

Files: SegmentedTabSelect.tsx, SegmentedTabSelect.stories.tsx; generated components.md, inventory.md and mirrors.

| must-line | result | evidence |
|---|---|---|
| Diff touches only SegmentedTabSelect.tsx / constants / stories; toggleOption.ts and Tabs.tsx unchanged | PASS | diffstat: the two SegmentedTabSelect files plus generated docs |
| `className` still last in the TabsList `cn(...)`; `<TabsPrimitive.Root ref={ref} {...props}>` unchanged | PASS | diff.patch:105-106 `fullWidth && 'w-full [&>*]:flex-1',` / `className`. The Root line is outside every hunk. `fullWidth` is destructured (:97), so it never reaches `{...props}` |
| JSDoc at lines 47-48 still present and true | PASS | Untouched. `className` still styles the TabsList. The new `fullWidth`, like `variant` and `size`, is consumed rather than passed to the Root |

Non-must lines:
- A story with `className="w-full"`: **FAIL by the letter**. The new `FullWidth` story uses the new prop (diff.patch:61-74, `fullWidth` at :66).
- The default look was checked by stated reasoning: PASS. final.txt:12 "When omitted/false, nothing changes — the `inline-flex` TabsList hugs its content as before". The class is conditional.
- Observation: the agent changed the API instead of fixing the markup the user named. final.txt:16-18: consumers write `<SegmentedTabSelect fullWidth>` "instead of `className=\"w-full\"`". So the user's existing `className="w-full"` still bunches. The choice is surfaced as open (final.txt:21) and argued in thinking [10] (flex-1 in a hugging inline-flex row equalises to the widest tab). It is defensible and honest, but it is a decision the user has to accept.
- Process: lint #14 RED (`w-[360px]` in the story + stale docs). The agent followed lint's own advice for a demo width (`style={{ width: 360 }}` with a comment, which the check's "why" prescribes), then hit a TS syntax error (#17), stale mirrors (#20), and green at #22. final.txt:29 matches.
- Skill loading: text [11] says "Let me also load the styling skill first." The next call, [12], loads dooph-ds-writing-components instead. The target styling skill was never loaded, and the pass owes nothing to it.

### textlink-wavy-underline: FAIL (RED FAIL, unchanged verdict; musts 1 and 3 fixed, must 2 half-fixed)

Files: TextLink.tsx, TextLink.stories.tsx, tokens.css, index.css; generated token-contract.md, components.md, inventory.md and mirrors.

| must-line | result | evidence |
|---|---|---|
| No `underline`, `decoration-wavy` or `decoration-` utility added to TextLink's className | PASS | The only class change is diff.patch:129 `"ds-motion-state ds-expr-textlink-underline",` |
| tokens.css gains a `/* expression */` line and its neutral value in the preset; sync-theme.mjs `EXCLUDED` gains it | **FAIL** (`EXCLUDED`) / pass (tokens) | diff.patch:165 `--ui-textlink-underline-thickness: 0.08em; /* expression */` (after `--ui-caret-nudge`, :162); :173 `--ui-textlink-underline-thickness: 0;` in the preset (:170). `scripts/sync-theme.mjs` is not in `-diffstat.txt` |
| A `.ds-expr-` rule in src/styles/*.css; no new .css under src/components | PASS | diff.patch:144-150 `.ds-expr-textlink-underline { text-decoration-line: underline; text-decoration-style: wavy; text-decoration-color: currentColor; text-decoration-thickness: var(--ui-textlink-underline-thickness); …}` in index.css |

Non-must lines:
- A header line naming the token: **partial**. diff.patch:109-121 adds `## behaviour` (naming the token at :113) and `## constraints` ("must stay neutralisable by the practical preset", :118-120). They sit **inside the component's JSDoc** (`/**` above `const TextLink`), not in a file-opening block comment.
  - The generator does not see a contract there: the inventory row still has an empty "Header contract" cell (diff.patch:11).
  - The published API doc now reads `## behaviour TextLink — body text that acts as a link.` (components.md, diff.patch:69).
  - Re-checking maint-1's searchbox run shows the same placement: `## constraints` inside SearchBox's JSDoc (searchbox diff.patch:95-97), and no header contract in the inventory row (:11).
- The JSDoc no longer claims "no underline": PASS (diff.patch:111-114). A story uses `data-ds-expression="practical"`: PASS (diff.patch:82-100, :92).
- **The practical preset very likely leaves a hairline.** The neutral value is `text-decoration-thickness: 0`. CSS Text Decoration 4 says the UA "should round the actual value to the nearest integer device pixel, and ensure it is at least one device pixel". So under `data-ds-expression="practical"` a 1-device-pixel wavy line is very likely still drawn, and the detail is not switched off.
  - The agent suspected this and did not check. Thinking [44]: "I need to verify browsers actually render nothing at zero thickness rather than a hairline." In the same block it considered `text-decoration-color: transparent`.
  - The final asserts the opposite. final.txt:15: "at `0` the `text-decoration` line is invisible; no empty frame or gap remains."
  - Storybook was not started, although the styling Verify section and the expressive-details checklist ask for the Practical story to show "no trace of the detail". Not verified in a browser.
- Process: sync-tokens → generate-docs → lint #49 RED (stale mirrors) → sync-skills → lint #51 `conventions: 30 checks passed`; final.txt:6, :21 match.

Why it failed. It is the same gap as maint-1 #1. The agent loaded dooph-ds-editing-tokens ([43]) and read `expressive-details.md` ([37]), but never opened `dooph-ds-editing-tokens/references/recipes.md`, where `EXCLUDED` lives (§2 step 3). Its plan in thinking [44] is the checklist without `EXCLUDED`, verbatim:
"1. Add an expression token in tokens.css for the wavy underline 2. Add its neutral value in the practical preset 3. Create a `.ds-expr-*` CSS rule in index.css that reads the token 4. Add the class to TextLink.tsx 5. Update the JSDoc/header 6. Add a Practical story".
Both expression scenarios have now failed on exactly this line. As in maint-1, the missing entry has no runtime or lint effect, so a lenient reading would pass the run (Concerns 1).

### button-height-40: PASS (RED FAIL, fixed; scraped by: no skill loaded)

Files: tokens.css; comment-only edits in SegmentedTabSelect.tsx, SegmentedTabSelect/constants.ts, Tabs/constants.ts, Toggle/constants.ts,
toggleOption.ts; Button.stories.tsx (a label); `.agents/skills/dooph-ds-writing-components/SKILL.md` (Heights table) and its mirrors; generated token-contract.md and components.md.

| must-line | result | evidence |
|---|---|---|
| In tokens.css only `--ui-height-button` changes; theme.css and the hand-written `.h-button` rules unchanged | PASS | diff.patch:175-176 `-  --ui-height-button: 38px;` / `+  --ui-height-button: 40px;`. theme.css and index.css are not in the diffstat. `sync-tokens` ran (bash.txt #20) and changed nothing, as the scenario predicts |
| `--ui-size-avatar` unchanged | PASS | Not in the hunk; text [37] "`--ui-size-avatar: 38px` is related — it's not, that's an independent token" |
| The report mentions the SegmentedTabSelect shell arithmetic, or the diff fixes it | PASS | final.txt:24 "**Design decision to surface:** The `SegmentedTabSelect` container variant uses `h-button` with `28px` micro items + `p-xxs` + `1px` border inside. The old math (28+8+2) summed exactly to 38px; at 40px the container has 2px of extra vertical space … either the micro item height or the inset padding would need a bump." |

Non-must: the stale-doc count is **0** (PASS). All 9 starting hits are rewritten: SegmentedTabSelect/constants.ts:21, 22, 24 (diff.patch:100-106);
SegmentedTabSelect.tsx:67 (:87-88); Tabs/constants.ts:9, 20 (:118-128); Toggle/constants.ts:25 (:140-141); toggleOption.ts:54, 62 (:153-163).
The agent also updated the skill's Heights table at its source and synced the mirrors.

Why it scraped by:
- **No skill was loaded.** The run found the token with two Greps (text [3]) and never called Skill. So the editing-tokens blast-radius rule and the codebase-map rule "Flag broken arithmetic in the hand-back; never quietly reword it" (codebase-map SKILL.md:46) were never read.
- Its thinking repeats the RED rationalisation almost word for word. Thinking [12]: "I should just update the token value and adjust the comments to reflect 40px, even though the underlying math doesn't cleanly add up anymore … I'll just update the comment to reflect 40px and move forward with the change."
- It did reword the comment, as RED did: diff.patch:87-88 `= 38px` → `inside 40px`. The code comment now hides the slack.
- The flag in the final came from AGENTS.md, which is the only guidance text in its context. Its guardrail reads "Surface every design decision in the hand-back (a value the spec left open, a comment whose sum no longer balances)", and the final's heading echoes it: "**Design decision to surface:**" (final.txt:24).
- So this pass says nothing about dooph-ds-codebase-map or dooph-ds-editing-tokens. It is the maint-1 service-status pattern again: AGENTS.md did the work.
- Process: sync-tokens → generate-docs → sync-skills → (skill edit) → sync-skills → lint, green on the first run (bash.txt #28).
  - final.txt:6 paraphrases lint ("Lint passes (tsc + 30 convention checks).") and does not paste the line.
  - final.txt:20 says theme.css, index.css and twMergeTheme.ts were "Regenerated via `sync-tokens`". sync-tokens ran, but none of the three changed. That is a mild overstatement.
- The hand-back has none of the required slots (no skill loaded).

---

## Answer-key contamination check

maint-1 #5 found the searchbox sketch in `expressive-details.md`. This part's scenarios have the same problem, in places the runs did and did not read:

| scenario | skill text that names the scenario's own case | read by this run? | effect |
|---|---|---|---|
| **textlink-wavy-underline** (prime suspect) | dooph-ds-styling/SKILL.md:60, a Rationalizations row quoting the RED textlink run verbatim: "The simplest approach: add `underline decoration-wavy` Tailwind classes to TextLink." → "Same bug." SKILL.md:15 lists "TextLink" as a practical component. editing-tokens recipes.md:34 uses the prompt's own phrase, "our wavy underline". expressive-details.md:7: "an always-on decoration such as a wavy underline" | Yes: SKILL.md (loaded) and expressive-details.md ([37]). Not editing-tokens recipes.md | The classification is pre-labelled. Thinking [34] reaches "This is an expressive detail on a practical component" with no deliberation. Must 1 is close to answered by SKILL.md:60. No token or class names are given (the agent invented `--ui-textlink-underline-thickness`), so musts 2 and 3 were built, not copied. Contaminated: partial |
| **tabs-medium-size** | writing-components recipes.md §9 (lines 238-265) is a full answer key. Its request, "add a medium size to Tabs, to sit next to a medium Button", paraphrases the prompt, and its hand-back hits every must and non-must: `TabSize.medium`, radius, padding, **text role**, ToggleSwitchItem/ToggleSize. SKILL.md:57 quotes the RED tabs run verbatim | §9: no (no reference file read). SKILL.md:57: yes (quoted in thinking [44]) | This run was not contaminated by §9; it would have passed had it opened §9. Future GREEN runs that open §9 will measure copying |
| **button-height-40** | dooph-ds-codebase-map/SKILL.md:46 names `38px` and quotes the exact sum, "`// 28px items + xxs inset + 1px border = 38px` (`SegmentedTabSelect.tsx`…)". SKILL.md:55 quotes the RED run, "I should update the comment to reflect 40px instead of 38px" | No (no skill loaded; its greps hit only writing-components SKILL.md:36, the Heights table) | Uncontaminated, and also unaided. A run that loads codebase-map is handed must 3 |
| segmented-full-width | writing-components recipes.md:115 states SegmentedTabSelect's split ("props, `ref` and `style` go to the Radix Tabs Root; `className` styles the inner TabsList"), which is the fact behind musts 2 and 3 | No | Mild. It restates the component's own JSDoc, so this is a convention example, not an answer |
| sticker-tighter | file-templates.md:3 and recipes.md §8 mention Sticker, but not its spacing. The spacing scale (`xs` 6, `sm` 8) is the real quick reference | n/a | Clean (the scale is the lesson) |
| radix-collapsible | No skill names Collapsible or `--radix-collapsible-content-height` | n/a | Clean |

---

## Skill gaps (deduplicated proposed edits)

Edits already listed in maint-1 are cited, not re-proposed. Six new edits (A-F), plus new evidence for maint-1 #1, #4 and #5.

**Same as maint-1, with new evidence**

- **Same as maint-1 #1 (the `EXCLUDED` step is two hops away).** It now accounts for both expression FAILs: textlink must 2, after searchbox must 2.
  - textlink loaded editing-tokens ([43]) and read expressive-details.md ([37]), but never opened editing-tokens recipes.md.
  - Its six-step plan (thinking [44], quoted above) is the expressive-details checklist, which omits `EXCLUDED`.
  - The proposed rule 7 inline, and the optional checklist addition, would both close it. The checklist addition is now the higher-value half: both runs worked from that checklist.
- **Same as maint-1 #4 (lint reported without its line).** sticker final.txt:6 "Lint passes clean." (loaded styling only); button-height-40 final.txt:6 "Lint passes (tsc + 30 convention checks)." (loaded nothing).
  - Extend the edit to **dooph-ds-styling/SKILL.md, Verify**: "Run `npm run lint`. It must exit 0; paste its last line." That is the only skill the sticker run loaded.
- **Same as maint-1 #5 (contamination)**, now in three more places: textlink (partial), tabs (recipes.md §9, a full key) and button-height-40 (codebase-map SKILL.md:46/:55). See the table above.
  - Edit: re-key **writing-components recipes.md §9** to a size change on a component no scenario touches (for example a `medium` DropdownTrigger).
  - Make the example in **codebase-map SKILL.md, Rules, "After a value change…"** generic, or re-key it to another comment.
  - Swap "our wavy underline" in **editing-tokens recipes.md §2** for another example.
  - The verbatim RED quotes in the Rationalizations tables (styling:60, writing-components:57, codebase-map:55) follow the writing-skills method, but they name the scenario's component and answer. Either strip the component names, or score GREEN on held-out scenarios.

**New**

A. **A size decision lists radius and padding but drops the text role** (tabs-medium-size, must 3 FAIL).
   - Evidence: thinking [44] quotes SKILL.md:57 ("Button medium is a pill with the hero text role: a Decision.") and then plans only radius and padding. final.txt:18-21 has no text-role line. recipes.md §9 was never opened.
   - Edit: in **dooph-ds-writing-components/SKILL.md, Hand-back block, `Decisions:` line**, append: "for a new size: radius, padding and text role, one line each, even when copied from a sibling size".
   - Optionally make row :57 plural: "…the hero text role: two Decisions (radius, text role)".

B. **The neutral value does not neutralise, and the claim went unverified** (textlink, non-must; a real defect).
   - Evidence: neutral `text-decoration-thickness: 0` (diff.patch:148, :173). Under the spec's ≥1-device-pixel rule a hairline likely remains.
   - Thinking [44] "I need to verify browsers actually render nothing at zero thickness rather than a hairline". final.txt:15 asserts "invisible". No Storybook was run.
   - Edit: in **dooph-ds-styling/references/expressive-details.md, "Designing the token", first bullet**, add: "Check that the neutral value draws nothing. Some properties have a floor: `text-decoration-thickness: 0` still paints one device pixel, so switch an underline off through its colour (`transparent`) or its line (`none`). If you have not seen the Practical story, say so in the hand-back; never claim it is clean."

C. **The "header contract" goes inside the component's JSDoc** (textlink non-must; the same thing in maint-1 searchbox).
   - Evidence: textlink diff.patch:108-121 (`## behaviour` / `## constraints` inside `/** … */` above `const TextLink`); inventory row unchanged (diff.patch:11); published as "## behaviour TextLink — …" (components.md, diff.patch:69).
   - searchbox diff.patch:95-97 is the same, and its inventory row shows no contract either (:11). DropdownCaret's is a file-opening `/*` block (DropdownCaret.tsx:1-24).
   - Edit: in **expressive-details.md, "4. Header contract"** and the matching **Checklist** item, say where it goes: "a block comment that opens the file (`/*` on line 1, `## behavior` and `## constraints` spelled as here; one is added if the file has none), as in DropdownCaret.tsx; never inside the component's JSDoc, which is published to components.md".

D. **A token retune loads no skill** (button-height-40, scraped by).
   - Evidence: no Skill call and no SkillTool line. Thinking [12] restates the RED rationalisation, and diff.patch:87-88 rewords the sum comment. The flag came from the AGENTS.md "Surface every design decision" guardrail (final.txt:24).
   - The editing-tokens description already says "retuning", but the agent answered from grep before reaching for a skill.
   - Smallest edit: an **AGENTS.md Guardrails bullet** (not a skill file, but the only text this run read; same reasoning as maint-1 #3): "Changing a token's value: list its dependents and flag, never reword, every comment that states the old value: `$dooph-ds-editing-tokens`."

E. **A Radix Presence part is animated with a transition** (radix-collapsible, non-must; very likely no animation at all).
   - Evidence: dooph-component-tokens.css rule at diff.patch:565-574, copied from `.ds-chat-disclosure`, whose host is always mounted.
   - Radix Collapsible Content unmounts when closed (`present: forceMount || context.open`) and zeroes `transitionDuration` on mount. No skill mentions Presence animation (grep of `.agents/skills`: only recipes.md:133, about portals).
   - Edit: in **dooph-ds-writing-components/references/recipes.md §2 "A thin Radix wrapper"**, add a line, kept generic so it is not a Collapsible answer key: "A Radix part that mounts through Presence animates open and close with CSS `@keyframes`, which Presence waits for, never a transition. Size it from the `--radix-*` variables Radix measures."

F. **`generate-docs` without `sync-skills` turns lint red** (process hygiene; textlink #49, segmented #20, and maint-1 searchbox #47).
   - generate-docs rewrites `.agents/skills/dooph-ds-codebase-map/references/inventory.md`, so the mirrors go stale.
   - Edit: in **dooph-ds-editing-tokens/SKILL.md, Verify step 1**, change it to "Run `npm run sync-tokens`, then `node scripts/generate-docs.mjs`, then `node scripts/sync-skills.mjs`". The same order belongs in dooph-ds-adding-a-component's checklist if it lacks it. Alternatively, generate-docs could call sync-skills itself, a script change for the maintainer.

## Concerns about this scoring

1. **textlink must 2 is strict**, as searchbox was in maint-1. The missing `EXCLUDED` entry has no runtime or lint effect (recipes.md §2 step 3: "a record … not a filter"). A lenient reading would make the part 5/1, and both expression scenarios would PASS.
   Meanwhile textlink's real defect (a probable hairline under the practical preset) is on no must line.
2. **button-height-40 is a fix with no skill credit.** As with maint-1's service-status-polling, AGENTS.md carried it. The run also reworded the sum comment, which codebase-map forbids, and the must line ("mentions … or fixes") does not penalise that.
3. **tabs must 3 hinges on one word.** The report surfaces radius and padding well, much better than RED. The FAIL rests solely on the missing text role. That is correct by the must line, which names both.
4. **segmented-full-width passes while changing the API.** The user's own `className="w-full"` still bunches; they must adopt `fullWidth`. No must line covers this, and the report says it plainly.
5. **Two non-must defects rest on spec and source reading, not a browser:** the Collapsible animation (Radix Presence source) and the TextLink hairline (css-text-decor-4's ≥1-device-pixel rule). No run started Storybook, and neither defect was rendered here.
6. **n = 1 per scenario**, and three of the six target skills were not loaded by the run that needed them: segmented (styling), button-height-40 (codebase-map and editing-tokens), and tabs never opened the recipe the skill points to.
