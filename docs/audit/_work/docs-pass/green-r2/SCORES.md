# GREEN round 2 scores: 9 maintainer re-runs after the skill-fix round

Scored against `scenarios.md` (observable tests, valid-run rules), with the method and evidence style of
`green/SCORES-maint-1.md` and `green/SCORES-maint-2.md`. One run per scenario, model `claude-opus-4-6` (every `-env.txt` line 2),
the same model as RED and round 1. Evidence is cited as `<file>:<line>`. For `-diff.patch` that is the raw patch line number (`cat -n`).
"Thinking" and "text" quotes come from the `.jsonl`. `[n]` is the 0-based content-block index over all assistant blocks,
subagent blocks included, printed by the same scratchpad copy of `texts.mjs` that round 1 used. All file names below drop the
`green-r2/` prefix. The `limit-failed/` folder (runs that died on a usage limit) is ignored.

These runs follow the skill-fix round briefed in `.superpowers/sdd/docs-pass-plan/task-11-skillfix-brief.md`. Each scenario is compared
with its RED verdict (`baseline/SCORES.md`) and its round-1 GREEN verdict (`green/SCORES-maint-1.md`, `-maint-2.md`), and each
targeted gap is marked closed or not.

**Result: 8 PASS, 1 FAIL, 9 of 9 valid.** Round 1 scored these nine 6 PASS / 3 FAIL, and RED scored them 3 PASS / 6 FAIL.
- The three round-1 FAILs are fixed: searchbox-icon-hover-nudge and textlink-wavy-underline (the `EXCLUDED` step), and tabs-medium-size (the text role).
- **One regression: checkbox-field-row** (RED PASS, round-1 PASS, now FAIL). The targeted fix landed, since the root is now `<LabelText as="label">`.
  But the label text inside that root now sits in a bare `<span>{label}</span>`, which must 1's regex catches.
- The three round-1 scraped-by PASSes (service-status-polling, button-height-40 and checkbox-field-row's `as` rule) all had their target gap closed.
  checkbox-field-row then failed on a different line.

## Summary

| id | valid | verdict | RED verdict | round-1 GREEN | skills loaded | ran lint | failed musts |
|---|---|---|---|---|---|---|---|
| searchbox-icon-hover-nudge | yes (exit 3, status hash only) | **PASS** | FAIL → **fixed** | FAIL → **fixed** | dooph-ds-styling, dooph-ds-editing-tokens | yes (×2; first RED) | none |
| textlink-wavy-underline | yes | **PASS** | FAIL → **fixed** | FAIL → **fixed** | dooph-ds-styling, dooph-ds-editing-tokens | yes (first green) | none |
| tabs-medium-size | yes (exit 3, status hash only) | **PASS** | FAIL → **fixed** | FAIL → **fixed** | dooph-ds-writing-components | yes (×2; first RED) | none |
| checkbox-field-row | yes | **FAIL** | PASS → **regressed** | PASS (scraped) → **regressed** | dooph-ds-adding-a-component, dooph-ds-writing-components, dooph-ds-styling | yes (×2; first RED) | 1 (`<span>{label}</span>`) |
| service-status-polling | yes (1 denial, recorded) | **PASS** | FAIL → **fixed** | PASS (scraped) → clean pass | dooph-ds-adding-a-component, dooph-ds-writing-components, dooph-ds-styling | yes (×2; first RED) | none |
| button-height-40 | yes | **PASS** | FAIL → **fixed** | PASS (scraped) → clean pass | dooph-ds-codebase-map, dooph-ds-editing-tokens | yes (first green) | none |
| radix-collapsible | yes | **PASS** | PASS → unchanged | PASS → unchanged | dooph-ds-adding-a-component, dooph-ds-writing-components, dooph-ds-styling, dooph-ds-codebase-map | yes (first green) | none |
| checkbox-checked-classname | yes | **PASS** | PASS → unchanged | PASS → unchanged | dooph-ds-writing-components | no (no edits) | none |
| chat-code-well-dark | yes | **PASS** | FAIL → **fixed** | PASS → unchanged | dooph-ds-editing-tokens | yes (first green) | none |

**Skills now load where round 1 loaded none.** service-status-polling and button-height-40 loaded no skill in round 1. This time they loaded three and two.

**Lint.** 8 of 9 runs ran `npm run lint`. checkbox-checked-classname made no edit. Every post-run `-lint.txt` reads `conventions: 30 checks passed` / `lint exit: 0`.
Every final hand-back now pastes the lint line (searchbox final.txt:23, tabs :26, checkbox-field-row :11, service :12, button :36, radix :11, chat :23,
textlink jsonl [59]). No run claimed success without evidence.
- Four runs had a red first lint, and each fixed it and re-ran:
  - searchbox: `text-sm` in its story;
  - tabs: twMergeTheme.ts out of date;
  - checkbox-field-row: TS errors;
  - service-status-polling: TS errors.
- "All clean." / "Everything is clean." still opens three finals (tabs final.txt:6, chat :6, checkbox-field-row :6). Each pastes the line underneath, so the claim is backed.
- **No run started Storybook** (grep of every `-bash.txt`). searchbox (final.txt:25) and textlink ([59]) say so in the hand-back, as the fixed skill asks.

## Validity (all 9 runs)

- `batch-status.txt`: searchbox ran in the first batch (`exit=3`). The other eight died there (`exit=1`, moved to `limit-failed/`), and the `r2 retry` batch re-ran them.
  That batch shows tabs `exit=3` and the other seven `exit=0`.
- **The two exit-3 runs are valid** under the known parallel-edit note:
  - searchbox `-main.txt`: HEAD `849390…`, index `a696bc1c…` and refs `2c29788e…` are the same before and after. Only the status hash moved (`7ea020b0…` → `8d546aa1…`).
  - tabs: the same, with the status hash moving `8d546aa1…` → `5c2e00e1…`.
  - Both `-honesty.txt` files read `no flags`.
  - The other seven `-main.txt` files end `MAIN CHECKOUT UNCHANGED`.
- **Skill version.** searchbox ran at 17:54 local (sandbox `…-20261011175400`) and the rest from 20:42. The last edits to `.agents/skills/*` (17:50) and to AGENTS.md (17:48) come before both.
  So all nine runs saw the fixed skills, and the runs' own reads confirm it: searchbox and textlink read the new checklist line with `EXCLUDED`, and service quotes the extended AGENTS.md bullet.
- Line 1 of every `-final.txt` is `RUN OK`, with `subtype: success  is_error: false`.
  service-status-polling has `permission_denials (1)`: a `find … | xargs …` inside its own sandbox (final.txt:4; honesty.txt `DENIED Bash`). DENIED lines are recorded, and they don't void a run.
- Every `-env.txt`: `canary absent after the run: auto-memory was off, no memory loaded` and `debug-log memory activity lines: 0`. No `*-memory-canary` directory exists in `green-r2/`.
- Every `-env.txt` shows `skills (16)` with the 7 dooph-ds-* project skills, `plugins (0): (none)` and `Loaded 9 unique skills (… user: 0, project: 9 …)`.
- No resurrection, and no lint gaming: no diffstat adds a file under `docs/` or `.claude/research/`, and none touches `scripts/check-conventions.mjs`.
  The `.agents/`, `.agent/`, `.claude/skills/` and `skills/` changes are generator output.
- Every `-prompt.txt` matches `node scenario-prompt.mjs <id>` except for one trailing newline.
- **Artefact note, textlink.** Its `-final.txt` shows `turns: 1` and only the last turn's text (final.txt:6, "Background research confirmed my implementation…").
  The agent let an Explore subagent run in the background ([3]), finished the work, handed back at [59], and was then woken by the subagent's completion.
  The real hand-back is jsonl [59], and this report scores that.

Skill loads were confirmed twice: by the `Skill` tool_use blocks in the `.jsonl` and by the `SkillTool returning 2 newMessages for skill <name>` lines in `-debug.log`
(searchbox:124, 356; textlink:124, 188; tabs:124; checkbox-field-row:124, 150, 176; service:124, 150, 176; button:124, 180; radix:124, 150, 161, 172;
checkbox-checked:124; chat:316).

---

## Per-scenario results

### searchbox-icon-hover-nudge: PASS (RED FAIL, round-1 FAIL; fixed)

Files: tokens.css, sync-theme.mjs, index.css, SearchBox.tsx, SearchBox.stories.tsx; generated token-contract.md, inventory.md and its mirrors.

| must-line | result | evidence |
|---|---|---|
| tokens.css adds a `/* expression */` line in the expression `:root` block AND the same name in `[data-ds-expression="practical"]` | PASS | diff.patch:214 `+  --ui-search-icon-lean: -8deg; /* expression */` (after `--ui-caret-nudge`, :212); :222 `+    --ui-search-icon-lean: 0deg;` inside the preset (:219) |
| sync-theme.mjs `EXCLUDED` gains the name | PASS | diff.patch:81 `+  "ui-search-icon-lean",` after `"ui-caret-nudge"` (:80) |
| SearchBox.tsx added lines: no `style=`, `[--ui-`, `onMouse`, `"use client"`; no new .css, no css import | PASS | Only classes are added: diff.patch:174 `'ds-search-box flex items-center gap-sm',`, :183 `className="ds-motion-state ds-expr-search-icon-lean shrink-0 text-text-tertiary"`, plus comments |
| A `.ds-expr-` selector added in src/styles/*.css | PASS | diff.patch:198-199 `.ds-search-box:not([data-disabled]):hover .ds-expr-search-icon-lean {` / `rotate: var(--ui-search-icon-lean);` in index.css |

Non-must lines:
- Header block naming the token: PASS. It is now a **file-opening `/*` block** (diff.patch:145-154), and the inventory counts it (`| behavior, constraints |`, :21). Round 1 put it inside the JSDoc.
- Practical story: PASS (diff.patch:126-139, wrapper at :133). No motion literal; motion comes from `ds-motion-state`. The angle is surfaced (final.txt:21 "I used `-8deg` … This is a placeholder").
- Lint: #42 RED on `text-sm` in the first story draft (bash.txt, `SearchBox.stories.tsx:50 text-sm`); the agent switched the labels to `ButtonText` from the caret's story, and #47 passed.
- As in round 1, the twin `DropdownMenuSearch` ("apply row fixes to both", diff.patch:162-165, context) did not get the lean, and the report does not mention it. Not scored.

**Targeted gap: closed** (the `EXCLUDED` step). The agent read expressive-details.md and went straight to `EXCLUDED` before loading editing-tokens. Text [32]: "Now I have the full recipe. Let me also check the EXCLUDED list in sync-theme.mjs to know where to add the new token."
Its plan [36] lists "2. **EXCLUDED** entry in `sync-theme.mjs`". Contract placement: closed. Verify order: closed (sync-tokens → generate-docs → sync-skills → lint, bash.txt #40-#42).

**De-contaminated sketch: the agent reasons from the rule.** The sketch now leans a hypothetical ToastClose icon (expressive-details.md:62-84).
- The run uses none of those names. Its own names are `--ui-search-icon-lean`, `.ds-search-box` and `.ds-expr-search-icon-lean`.
- It keys the hover on SearchBox's own `data-disabled` attribute (diff.patch:171, context), not the sketch's `:not(:disabled)`.
- Its stated model is the precedent, not the sketch. Text [36]: "following the DropdownCaret pattern exactly". Round 1's "already shows exactly this" copying is gone.

### textlink-wavy-underline: PASS (RED FAIL, round-1 FAIL; fixed)

Files: tokens.css, sync-theme.mjs, index.css, TextLink.tsx, TextLink.stories.tsx; generated token-contract.md, inventory.md and its mirrors.

| must-line | result | evidence |
|---|---|---|
| No `underline`, `decoration-wavy` or `decoration-` utility added to TextLink's className | PASS | The only class change is diff.patch:163 `"ds-motion-state ds-expr-textlink-underline",` |
| tokens.css gains a `/* expression */` line and its neutral value in the preset; sync-theme.mjs `EXCLUDED` gains it | PASS | diff.patch:199 `+  --ui-textlink-underline-color: currentColor; /* expression */`; :207 `+    --ui-textlink-underline-color: transparent;` in the preset; :81 `+  "ui-textlink-underline-color",` in `EXCLUDED` |
| A `.ds-expr-` rule in src/styles/*.css; no new .css under src/components | PASS | diff.patch:179-184 `.ds-expr-textlink-underline { text-decoration-line: underline; text-decoration-style: wavy; text-decoration-color: var(--ui-textlink-underline-color); … }` in index.css; no file under src/components other than TextLink.tsx and its stories |

Non-must lines:
- Header line naming the token: PASS, in a file-opening block (diff.patch:134-145), counted by the inventory (:21). Round 1 had it inside the JSDoc.
- The JSDoc no longer claims "no underline": PASS (diff.patch:153-154). Practical story: PASS (diff.patch:114-128, wrapper at :122).
- The neutral value draws nothing: `transparent` colour. The hand-back says what was not checked ([59] "I have not checked the Practical story in Storybook visually.").
- Observation: the story labels carry `text-secondary-foreground` (diff.patch:119, 123). No such utility exists: the theme key is `secondary-fg` (index.css:106), so the class emits nothing. Lint does not see an unknown class.

**Targeted gaps: closed.**
- `EXCLUDED`: closed. The agent never opened editing-tokens recipes.md, so the inlined rule 7 and the checklist did it. Thinking [21]: "I also need to … exclude this new token in the sync script".
- Neutral value: closed. Thinking [21]: "zero thickness still paints a one-pixel line per the recipe's warning, so the switch-off has to happen through color (transparent) or through the line property itself (none)". Round 1 shipped `thickness: 0`.
- Contract placement: closed. Verify order: closed (bash.txt #38-#41).

**De-contamination: partial, and a new leak.**
- The old keys are gone. The Rationalizations row is now generic (styling SKILL.md:60, "add the decoration's Tailwind classes to the component"), and editing-tokens no longer says "wavy".
- But the fixed neutral-value bullet names this scenario's one open design question and answers it: expressive-details.md:57, "`text-decoration-thickness: 0` still paints a one-pixel line, so an underline switches off through its colour (`transparent`)".
- The run took that answer verbatim (thinking [21] above, text [35]). It reasoned from the rule for the token, rule, class and contract, but its neutral value is copied.
- No must depends on the neutral value, so the verdict stands. See Concerns 2.

### tabs-medium-size: PASS (RED FAIL, round-1 FAIL; fixed)

Files: Tabs/constants.ts, Toggle/toggleOption.ts, index.css (a hand-written `.size-button-medium`); generated twMergeTheme.ts and components.md.

| must-line | result | evidence |
|---|---|---|
| `medium: "medium"` added to `TabSize`; no `lg`/`large`/`md`/`big` key | PASS | diff.patch:40-41 `/** 46px — matches the hero section's 46px Buttons (\`h-button-medium\`). */` / `medium: "medium",`. The extra key is `iconMedium: "icon-medium"` (:49-50), as in RED and round 1 |
| Recipe entry uses `h-button-medium`; tokens.css unchanged; no `-[46px]` | PASS | diff.patch:63 `medium: "h-button-medium rounded-tight px-rg",`; tokens.css is not in the diffstat |
| The report states the radius **and text-role** choice | PASS | final.txt:17 "**Radius:** `rounded-tight` — copied from `standard` and `sm`"; :19 "**Text role:** Inherited from `ButtonText` (unchanged) — same as all other tab sizes." True: TabsTrigger renders one `ButtonText as={TabsPrimitive.Trigger}` for every size (Tabs.tsx:47-51) |

Non-must lines:
- Toggle affected: PASS (final.txt:22, "`ToggleSwitchItem` shares `toggleOptionVariants` but uses its own `ToggleSize` const, which doesn't include `medium`").
- TabSize JSDoc 46px line: PASS (diff.patch:40). **Story: FAIL.** No story change; `ToggleOptionSizes` lists sizes explicitly (Tabs.stories.tsx:107), so medium is never shown. Round 1 added it.
- Unrequested scope, as before: `icon-medium` and a hand-written `.size-button-medium` (diff.patch:69, 81-84). This time it is listed under Changed, not under Decisions.
- The hand-back follows every slot of the skill's template (final.txt:10-26). Two of the three size Decisions give no alternative, though. The radius line never mentions that Button medium is a pill, and the text-role line never mentions the 16px hero role.
  Padding is the only line that names Button medium's value (:18). None is marked open. The must allows "decided", so this is not scored.
- Verify order: **not followed.** It ran generate-docs + sync-skills (bash.txt #47) before sync-tokens, although it had added a `.size-*` rule.
  Lint #48 went RED ("twMergeTheme.ts:1 out of date"). It ran sync-tokens (#49), and lint #50 passed. The writing-components Verification step 1 parenthetical ("after `npm run sync-tokens`, if a token or size rule changed") did not register.

**Targeted gap: closed** (the size Decisions line). The run read no reference file, so it never saw the re-keyed recipe 9.
Its three Decisions lines come from the SKILL.md hand-back template (SKILL.md:45-47, "For a new size: radius, padding and text role, one line each, even when copied from a sibling size").
The radius line says it was "copied from `standard` and `sm`", which is the case the template names. **It reasons from the rule:** the example was not available to copy.

### checkbox-field-row: FAIL (RED PASS, round-1 PASS; regressed)

Files: new `src/components/CheckboxField/{CheckboxField.tsx, CheckboxField.stories.tsx, index.ts}`; src/index.ts; CHANGELOG.md; generated docs and mirrors.

| must-line | result | evidence |
|---|---|---|
| Added non-story .tsx lines: no `<(span\|p\|div\|label)\b[^>]*>\s*\{(label\|hint\|description\|children)\}`, no raw element whose only child is literal text | **FAIL** | diff.patch:357 `+        <span>{label}</span>`, inside :356 `<span className="flex min-w-0 flex-col gap-xxs">`. The regex matches. The first Write already had it (edits.txt #48 FIRST) |
| No `aria-hidden` on an element containing the label | PASS | None in the added lines |
| New component files: no `useState` / `"use client"`; check-conventions.mjs unchanged | PASS | CheckboxField.tsx imports `forwardRef` and types only (diff.patch:315-319). `useState` is only in the Controlled story, the same reading as RED and round 1 |
| Label associated with the checkbox | PASS | A wrapping label: diff.patch:338-340 `<LabelText ref={ref} as="label"` contains :348 `<Checkbox` |

Non-must lines:
- JSDoc names where `className` and `ref` go: PASS (diff.patch:332-335, "`className`, `style` and `ref` land on the wrapping `<label>`. Every other prop … forwards to the inner `Checkbox`"). Round 1 was partial.
- The disabled look uses a helper now (`ds-disabled-state`, diff.patch:343). RED and round 1 hand-rolled `text-text-disabled`. Stacked on Checkbox's own disabled paint, it may double-fade the box. The look is surfaced in the hand-back (final.txt:36-37). Not scored.
- Still a separate `CheckboxField/` folder with its own src/index.ts line, as in RED and round 1. No `aria-describedby` for the hint, as in round 1. The hand-back surfaces seven decisions (final.txt:20-37).

**Targeted gap: closed, and the fix moved the failure inward.**
- The root is now `<LabelText as="label">` (diff.patch:338-340). The hand-back cites the fixed precedent (final.txt:21, "Label text role: LabelText (the label role), matching the existing Checkbox WithLabel story. … Settled by convention (the root is a <label>)").
- That precedent (`Checkbox.stories.tsx:70-73`, now `<LabelText as="label" …><Checkbox defaultChecked />Accept terms</LabelText>`) holds a single line of text directly in the root.
- A label with a hint under it needs a column. The agent wrapped the label in a bare `<span>`, and no thinking or text block mentions that span.
- The skill row it loaded names this very failure: writing-components SKILL.md:27, Failure column, "Lint can't see `<span>{label}</span>`". Its Rule column covers the root ("A root that owns its text renders through one with `as`") but says nothing about a layout wrapper inside that root.
- Lint: #58 RED on TS errors (unused imports, stories without `args`), then #62 `conventions: 30 checks passed`. After that, generate-docs and sync-skills ran (#63) with no lint after them. The post-run `-lint.txt` is green, so final.txt:11 holds.

### service-status-polling: PASS (RED FAIL, fixed; round-1 scraped-by PASS, now a clean pass)

Files: new `src/components/ServiceStatusBadge/{ServiceStatusBadge.tsx, constants.ts, ServiceStatusBadge.stories.tsx, index.ts}`; src/index.ts; CHANGELOG.md; generated docs and mirrors.

| must-line | result | evidence |
|---|---|---|
| New non-story files: none of `fetch(`, `setInterval`, `setTimeout`, `useEffect`, `useState`, `"use client"`; no `url`/`endpoint`/`pollInterval` prop | PASS | Props are `status`, `label?` and `size?` (diff.patch:313-321). The component is a pure map onto Sticker (:299-303, :323-338). The one grep hit is a comment, :349 `// Server-safe constants — no client APIs, intentionally NO "use client" directive`, the boilerplate 25 constants.ts files already carry. It is not a directive |
| `scripts/check-conventions.mjs` unchanged | PASS | Not in the diffstat |
| The report states that fetching and polling belong to the consuming app | PASS | final.txt:34 "**Polling belongs to your app.** Here's the consumer-side snippet the component was designed for:", then 30 lines of app code with `fetch` + `setInterval(poll, 30_000)` (:36-67) |

Non-must: the const is `ServiceStatusBadgeStatus` (a `*Status` name; diff.patch:356-362), re-exported through `export * from './components/ServiceStatusBadge'` (:380): PASS.
The variant mapping is surfaced as open decisions, including "No amber/yellow token exists in the DS" (final.txt:25-32).

**Targeted gap: closed.** Round 1 stopped and asked. This run builds the presentational part and hands over the polling code, which is the scenario's whole correct behaviour.
The extended AGENTS.md bullet drove it again, but this time the run also loaded the skills. Thinking [0] quotes it verbatim: "Asked for a component that fetches or polls, build the presentational part and hand the app the polling code."
Then: "So I cannot build a component that fetches/polls. I need to build the presentational part and hand back the polling code separately."
It loaded adding-a-component, writing-components and styling ([2], [4], [5]) and read recipes.md.

### button-height-40: PASS (RED FAIL, fixed; round-1 scraped-by PASS, now a clean pass on the musts)

Files: tokens.css (one line); generated token-contract.md.

| must-line | result | evidence |
|---|---|---|
| In tokens.css only `--ui-height-button` changes; theme.css and the hand-written `.h-button` rules unchanged | PASS | diff.patch:22-23 `-  --ui-height-button: 38px;` / `+  --ui-height-button: 40px;`. Nothing else under src/ is in the diffstat |
| `--ui-size-avatar` unchanged | PASS | Not in the hunk; final.txt:16 "`--ui-size-avatar` (38px) is independent and unchanged." |
| The report mentions the SegmentedTabSelect shell arithmetic, or the diff fixes it | PASS | final.txt:23 "`28px items + xxs inset + 1px border = 38px` \| **Arithmetic no longer balances** — now 40px, leaving 2px slack"; :34 names it a design decision |

Non-must: **stale-doc count is 9 (FAIL; RED 0, round 1 0).**
- All 9 starting hits are listed in a "flagged, not reworded" table (final.txt:18-32), and none is edited. Among them is the published TabSize JSDoc, "`38px — Figma buttonSizes/buttonHeight`" (final.txt:27).
- The run also found one comment the scenario did not list: the DropdownCaret **header contract**, "height-button minus spacing-md (26px at defaults)" (DropdownCaret.tsx:14; final.txt:32, "40 − 12 = 28, not 26"). It flagged it but left the header false.
- AGENTS.md says "If your change alters behavior the header describes, update the header in the same commit."
- See Concerns 1. This is the skill text doing what it says, not the agent misreading it.

**Targeted gap: closed.** The run loaded codebase-map and editing-tokens. Round 1 loaded none.
It reasoned from editing-tokens rule 3, thinking [19] verbatim: "Re-reading the rule, it's specifically about grepping the old literal across src/ and flagging every comment stating the old value or a sum that no longer balances, never rewording them myself."
Round 1's reworded sum (`= 38px` → `inside 40px`) is gone.

**De-contaminated example: the agent reasons from the rule.** codebase-map SKILL.md:46 and :55 are now generic ("an inline sum of parts that adds up to the old value").
The run found the SegmentedTabSelect sum by grepping `38` (text [6], [8]). It also found the DropdownCaret header sum, which no skill example names (thinking [9], "the arithmetic changes from 40-12=26 to 28").

### radix-collapsible: PASS (RED PASS, round-1 PASS; unchanged)

Files: package.json, package-lock.json; new `src/components/Collapsible/{Collapsible.tsx, Collapsible.stories.tsx, index.ts}`; src/index.ts; index.css; dooph-component-tokens.css; CHANGELOG.md; generated docs and mirrors.

| must-line | result | evidence |
|---|---|---|
| No `"use client"` in Collapsible/**; check-conventions unchanged | PASS | Collapsible.tsx opens with `import * as CollapsiblePrimitive` (diff.patch:460); no directive in any added src line |
| No new .css under src/components; no css import | PASS | The CSS is in index.css (diff.patch:608-623) and dooph-component-tokens.css (:581-590) |
| No `useState` in new component files | PASS | Only in the Controlled story (diff.patch:372, :433), the same reading as before |
| src/index.ts gains the export | PASS | diff.patch:565 `+export * from './components/Collapsible';` |

Non-must lines:
- Trigger label through ButtonText or BodyText: **PASS** (diff.patch:499 `<ButtonText as="span">{children}</ButtonText>`). Round 1 used LabelText. The trigger root itself is still a raw `CollapsiblePrimitive.Trigger` (:487), not `ButtonText as={…Trigger}`.
- No `ElementRef`, every forwardRef has a displayName, focus from `ds-focus-visible-ring` (:493), no motion literal: PASS. Disabled from `ds-disabled-state` (:494); round 1 had no disabled look.
- **The content animation is now keyframes on `--radix-collapsible-content-height`** (diff.patch:608-623), timed by `--ui-motion-*` tokens (:581-590). That is the scenario's correct behaviour. Round 1 used a grid-rows transition that Presence never waits for.
- Observation, very likely a false claim. final.txt:21 says the height keyframes run "plus fade via animate-in / animate-out". But the new helper sets `animation-name` (diff.patch:582, :587).
  dooph-component-tokens.css's own comment says this block outranks the plugin's same-specificity `data-[state=…]:animate-in` on source order (dooph-component-tokens.css:57-64). So `ds-collapsible-open`/`-close` replaces the plugin's `enter`/`exit` keyframes, and no fade runs. Not verified in a browser; no run started Storybook.

**Targeted gap: closed** (Presence keyframes). The run read recipes.md, whose §2 now carries the Presence rule (recipes.md:81-88). Its own CSS comment restates the rule in its own words: "Keyframes, not transitions, because Presence unmounts on animationend (transitions are ignored)" (diff.patch:603-607).
The recipe's example is Popover (`ds-radix-popover-content-origin`), and the run applied the rule to a Collapsible-specific variable no skill names. It reasons from the rule.

### checkbox-checked-classname: PASS (RED PASS, round-1 PASS; unchanged)

No diff, no edits. Tool calls: Skill, an Explore subagent, 2 Reads.

| must-line | result | evidence |
|---|---|---|
| No `checkedClassName` / state-dependent class logic in Checkbox.tsx | PASS | Empty diffstat; edits.txt "(no edits)" |
| Checkbox header unchanged | PASS | Empty diffstat |
| The report cites the constraint | PASS | final.txt:12-14 "The constraint in `Checkbox.tsx` (lines 13–14) states: > Style states via Radix `data-[state]` / `data-[disabled]` only — no JS class toggling for checked/disabled." (The constraint sits at lines 14-15; the off-by-one is cosmetic) |

Non-must: it offers the `data-[state=checked]:` route (PASS, final.txt:30 `<Checkbox className="data-[state=checked]:bg-green-500" />`) and says lifting the constraint is the maintainer's call (:33). No apology.

### chat-code-well-dark: PASS (RED FAIL, fixed; round-1 PASS, unchanged)

Files: tokens.css, dooph-component-tokens.css, sync-theme.mjs; generated token-contract.md.

| must-line | result | evidence |
|---|---|---|
| New token in BOTH the `:root, .light` block and the `.dark` block | PASS | diff.patch:59 `+  --ui-color-chat-code-well: var(--ui-color-surface-secondary);` (hunk @@ -277, light block); :67 `+  --ui-color-chat-code-well: #0e0e10;` (hunk @@ -787, `.dark` block, beside `--ui-color-surface-secondary: #242425`, :65) |
| No `.dark` selector added outside tokens.css | PASS | The only other src change is diff.patch:46 `+    background-color: var(--ui-color-chat-code-well);` in `.ds-chat-prose pre` |
| No hex added outside tokens.css; `.dark` `--ui-color-surface-secondary` unchanged | PASS | Same evidence; :65 is context |

Non-must: final lint passes. The token is in the `--ui-color-*` family and read only through `var()`, so the agent added it to `EXCLUDED` (diff.patch:9-10). That is editing-tokens rule 6, and the scenario's preferred route. Only `pre` changes, and inline `code` is left alone (final.txt:21).
Thinking [27]: "The skill says: \"To change one place, add a token and leave the shared one alone.\""

**Targeted gap: closed** (lint line pasted, final.txt:23 `conventions: 30 checks passed`). Verify order: closed (bash.txt #39-#41).

---

## Gap-by-gap: did each targeted fix close its gap?

| fix in the brief | scenario(s) | closed? | evidence |
|---|---|---|---|
| `EXCLUDED` step inlined (editing-tokens rule 7; expressive-details checklist) | searchbox, textlink | **yes, both** | searchbox diff.patch:81, text [32]; textlink diff.patch:81, thinking [21]. Neither opened editing-tokens recipes.md |
| `<LabelText as="label">`, stories not precedent (+ the Checkbox story fixed) | checkbox-field-row | **yes for the root; new FAIL inside it** | diff.patch:338-340 root; :357 `<span>{label}</span>` |
| AGENTS.md: build the presentational part, hand over the polling code | service-status-polling | **yes** | thinking [0]; final.txt:34-67 |
| AGENTS.md: token retune → list dependents, flag the old-value comments | button-height-40 | **yes, but over-applied** | skills loaded; final.txt:18-34; stale-doc count 9 (Concerns 1) |
| Lint line pasted (editing-tokens and styling Verify) | chat (+ all) | **yes** | all 8 editing runs paste it |
| De-contaminated examples | searchbox, tabs, button, textlink | **yes for 3; textlink partial** | see the section below |
| Size Decisions line | tabs | **yes** | final.txt:17-19 |
| The neutral value draws nothing | textlink | **yes** (copied from the bullet) | diff.patch:207; thinking [21] |
| Contract placement (file-opening block) | searchbox, textlink | **yes, both** | inventory rows `behavior, constraints` (searchbox :21, textlink :21) |
| Presence keyframes | radix-collapsible | **yes** | diff.patch:603-623 |
| Verify order (sync-tokens → generate-docs → sync-skills → lint) | token runs | **yes for searchbox, textlink, chat, button; no for tabs** | tabs bash.txt #47-#50 |

## De-contamination check: rule or example?

| scenario | old answer key | after the fix | did the run copy or reason? |
|---|---|---|---|
| searchbox-icon-hover-nudge | expressive-details.md sketch used the scenario's names and selector | Sketch re-keyed to a hypothetical ToastClose lean (expressive-details.md:62-84) | **Reasoned.** Own names, own disabled attribute, the precedent named as the model (text [36]) |
| tabs-medium-size | writing-components recipes.md §9 was a full answer key; SKILL.md quoted the RED run | §9 re-keyed to TextDropdownTrigger (recipes.md:243-269); the row is now generic (SKILL.md:59) | **Reasoned.** It never opened recipes.md. Its Decisions follow the generic template (SKILL.md:45-47) |
| button-height-40 | codebase-map SKILL.md:46/:55 named the 38px sum and quoted the RED run | Generic: "an inline sum of parts that adds up to the old value" (:46), "the new value" (:55) | **Reasoned.** It found a second unbalanced sum (DropdownCaret header) that no example names (thinking [9]) |
| textlink-wavy-underline | styling SKILL.md:60 quoted the RED textlink run; "our wavy underline" in editing-tokens recipes | Both gone. But expressive-details.md:57 now says an underline switches off through `transparent` | **Mixed.** The mechanism was reasoned. The neutral value was copied from the new bullet (thinking [21] echoes it) |
| radix-collapsible | (none in round 1) | recipes.md:81-88 adds a generic Presence rule, keyed to Popover | **Reasoned.** It applied the rule to `--radix-collapsible-content-height`, which no skill names |

Residue grep of `.agents/skills` (inventory.md excluded) for the scenarios' key nouns: no hit for SearchBox/search-icon, TextLink, Collapsible, CheckboxField, ServiceStatus,
code-well/`0e0e10` or checkedClassName. "wavy" hits only loading-indicators (WavyDivider, the wavy ProgressIndicator).
"Sticker" appears once, in a provenance line (adding-a-component file-templates.md:3). "medium" appears in the re-keyed recipe 9 and the Heights table. "38" appears only in that table (`h-button` 38).

---

## Skill gaps (proposed edits)

One edit, for the one FAIL. No PASS this round scraped by on a must line.

1. **A layout wrapper inside a Text root holds bare text** (checkbox-field-row, must 1 FAIL).
   - Evidence: diff.patch:357 `<span>{label}</span>` inside the `<LabelText as="label">` root (:338-340), present from the first Write (edits.txt #48 FIRST).
     The hand-back reasons only about the root: final.txt:21, "Label text role: LabelText (the label role), matching the existing Checkbox WithLabel story. … Settled by convention (the root is a <label>)". No block mentions the inner span.
   - What it missed: writing-components SKILL.md:27 names this failure but gives no rule that reaches it. The Failure column says "Lint can't see `<span>{label}</span>`".
     The Rule column says "A root that owns its text renders through one with `as`", which covers only the root. The fixed precedent (Checkbox.stories.tsx:70-73) has one line of text sitting directly in the root, so it shows no column.
   - Smallest edit: in **dooph-ds-writing-components/SKILL.md, Rules, the Text row**, after "never `<label><LabelText>`.", add:
     "Inside that root, a wrapper added for layout holds no bare text: each line in it is its own Text component (`as="span"` for an inline tag)."
     The edit names no component and no prop, so it does not become this scenario's answer key.

## Concerns about this scoring

1. **The retune guardrail now over-applies, and the skill text causes it** (button-height-40, non-must).
   - AGENTS.md ("flagging, never rewording, every comment that states the old value") and editing-tokens rule 3 ("flag, never reword, every comment that states the old value or a sum that no longer balances") treat a plain stale value the same as a broken sum.
   - The run obeyed and left 9 stale "38px" comments, including a published JSDoc (RED and round 1: 0).
   - It also left the DropdownCaret header contract false. That conflicts with AGENTS.md's "update the header in the same commit".
   - The scenario wants the descriptive values updated and only the broken sum flagged. No must line covers this, so under this round's rule (edits only for a FAIL or a scrape-by) **no edit is proposed**. The maintainer should still decide which reading the guardrail means.
2. **textlink's neutral value is now answered by the skill.** The fix for the round-1 hairline put the underline example into expressive-details.md:57, and the run copied it.
   The verdict does not depend on it (no must line covers the neutral value), but a future textlink run measures copying on that point. A held-out scenario, or an example on a non-underline property, would keep the test clean.
3. **checkbox-field-row's must 1 is strict, but right.** The bare `<span>{label}</span>` inherits the LabelText root's role, so the label renders in the correct type. The regex still matches, and the skill's own Failure column names that exact string.
   A lenient reading would make this round 9/9, but the scenario's correct behaviour says "No raw `<span>` … holds text".
4. **Two hand-back claims went unverified:**
   - radix's "plus fade" (very likely no fade, because the helper's `animation-name` wins);
   - tabs' "Text role … same as all other tab sizes" (true; checked against Tabs.tsx:47-51).
   No run started Storybook. searchbox and textlink now say so in the hand-back; radix does not.
5. **n = 1 per scenario.** Round-1 FAILs that now pass may partly reflect run-to-run variance. The evidence above (each run quoting the fixed skill or AGENTS.md text) ties the change to the fix in all eight PASSes.
