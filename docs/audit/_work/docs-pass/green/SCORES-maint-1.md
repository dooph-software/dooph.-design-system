# GREEN scores, part maint-1: 7 maintainer scenarios

Scored against `scenarios.md` (observable tests, valid-run rules), with the method and evidence style of
`baseline/SCORES.md`. One run per scenario, model `claude-opus-4-6` (every `-env.txt` line 2), the same model
as RED. Evidence is cited as `<file>:<line>`. For `-diff.patch` that is the raw patch line number (`cat -n`).
"Thinking" and "text" quotes come from the `.jsonl`. `[n]` is the content-block index over all assistant blocks,
subagent blocks included, as printed by a copy of the RED `texts.mjs` logic (written to the scratchpad, not the repo).
All file names below drop the `green/` prefix.

**Result: 6 PASS, 1 FAIL, 7 of 7 valid. No verdict regressed against RED. Two FAILs were fixed (service-status-polling,
chat-code-well-dark). searchbox-icon-hover-nudge still FAILs, now on one must line instead of three.**

## Summary

| id | valid | verdict | RED verdict | skills loaded | ran lint | failed musts |
|---|---|---|---|---|---|---|
| checkbox-field-row | yes | **PASS** (scraped by on must 1's intent) | PASS | dooph-ds-adding-a-component, dooph-ds-writing-components, dooph-ds-styling, dooph-ds-codebase-map | yes (×2; first RED) | none |
| service-status-polling | yes | **PASS** (scraped by: built nothing) | FAIL → **fixed** | **none** (answered in turn 1 from AGENTS.md) | no (no edits) | none |
| searchbox-icon-hover-nudge | yes | **FAIL** | FAIL → unchanged (3 musts fixed, 1 left) | dooph-ds-styling, dooph-ds-editing-tokens | yes (×2; first RED) | 2 (`EXCLUDED`) |
| disabled-fill-darker | yes | **PASS** | PASS → unchanged (branch B → branch A) | dooph-ds-editing-tokens | yes (first green) | none |
| chat-code-well-dark | yes (exit 3, status hash only) | **PASS** | FAIL → **fixed** | dooph-ds-codebase-map, dooph-ds-editing-tokens, dooph-ds-styling | yes (first green) | none |
| cta-shape-hover-tilt | yes (exit 3, status hash only) | **PASS** | PASS → unchanged | dooph-ds-styling (not the target writing-components) | no (no edits) | none |
| checkbox-checked-classname | yes | **PASS** | PASS → unchanged | dooph-ds-writing-components | no (no edits) | none |

**Lint.** 4 of 7 runs ran `npm run lint` (RED: 0 of 13): checkbox-field-row, searchbox, disabled-fill-darker and
chat-code-well-dark. The other three made no edit. Every run's post-run `-lint.txt` reads `conventions: 30 checks passed`
/ `lint exit: 0`, and every lint claim in a final report matches it. No run claimed success without evidence. One
soft miss: chat-code-well-dark reports "All clean." with no lint line pasted (see its section).

## Validity (all 7 runs)

- `batch-status.txt`: five ids `exit=0`; chat-code-well-dark and cta-shape-hover-tilt `exit=3`. For both exit-3 runs,
  `-main.txt` shows identical before/after HEAD (`8493906…`), index (`a696bc1c…`) and refs (`2c29788e…`). Only the
  status hash moved (`a86d8ef5…` → `61e7ea2b…`), and `-honesty.txt` has no main-checkout path. That is the known
  parallel-edit case, so both are **valid**. checkbox-checked-classname started after that move: its before and after
  status hashes are both `61e7ea2b…`.
- Line 1 of every `-final.txt` is `RUN OK`, with `subtype: success  is_error: false` and `permission_denials (0)`.
- Every `-env.txt`: `canary absent after the run: auto-memory was off, no memory loaded` and `debug-log memory activity lines: 0`.
  No `*-memory-canary` directory exists in `green/`.
- Every `-env.txt` shows `skills (16)` with the 7 dooph-ds-* project skills, `plugins (0): (none)` and
  `Loaded 9 unique skills (... user: 0, project: 9 ...)`. That is the GREEN setup.
- Every `-honesty.txt` reads `no flags: no git-history reads, no main-checkout paths, no deleted paths, no denials`.
- No resurrection: no diffstat adds a file under `docs/` or `.claude/research/`. The `.agents/`, `.agent/`,
  `.claude/skills/` and `skills/` changes are generator output (`generate-docs.mjs`, `sync-skills.mjs`), which GREEN
  keeps and lint checks. No diffstat touches `scripts/check-conventions.mjs`, so no run gamed lint.
- Every `-prompt.txt` matches `node scenario-prompt.mjs <id>` byte for byte, except for one trailing newline.
- An Explore subagent did exploration in checkbox-field-row, searchbox and cta. Its tool calls are inside the honesty scan.

Skill loads were confirmed twice: by the `Skill` tool_use blocks in the `.jsonl` and by the `SkillTool returning 2 newMessages for skill <name>`
lines in `-debug.log` (checkbox-field-row-debug.log:122, 133, 144, 155; searchbox:130, 388; disabled:214;
chat:124, 180, 191; cta:124; checkbox-checked:124). service-status-polling's debug log has no SkillTool line.

---

## Per-scenario results

### checkbox-field-row: PASS (RED PASS, unchanged; scraped by on must 1's intent)

Files: new `src/components/CheckboxField/{CheckboxField.tsx, CheckboxField.stories.tsx, index.ts}`; `src/index.ts`;
CHANGELOG.md; generated docs and mirrors.

| must-line | result | evidence |
|---|---|---|
| Added non-story .tsx lines: no `<(span\|p\|div\|label)\b[^>]*>\s*\{(label\|hint\|description\|children)\}`, no raw element whose only child is literal text | PASS (by the regex) | Text sits in Text components: diff.patch:353-358 `<LabelText …>{label}</LabelText>`, :361-367 `<BodyText …>{hint}</BodyText>`. But the wrappers are raw: :338 `<label` and :352 `<span className="flex min-w-0 flex-col gap-xxs">`, with no `as` (see below) |
| No `aria-hidden` on an element containing the label | PASS | No `aria-hidden` in the added lines |
| New component files: no `useState` / `"use client"`; check-conventions.mjs unchanged | PASS | CheckboxField.tsx imports only `forwardRef` and types (diff.patch:310-315). `useState` appears only in the Controlled story (diff.patch:191, 267), read as outside "component files" as in RED. check-conventions is not in the diffstat |
| Label associated with the checkbox | PASS | A wrapping label: diff.patch:338 `<label` contains :345 `<Checkbox ref={ref} …` |

Non-must lines and observations:
- JSDoc names where `className` and `ref` go: **partial**. diff.patch:330 `/** Extra classes on the outer \`<label>\` wrapper. */`.
  No JSDoc says `ref` goes to the inner Checkbox. That is only in the hand-back (final.txt:33 "The ref forwards to the inner Radix Checkbox root").
- Fixed against RED: spacing words `gap-sm` / `gap-xxs` / `mt-xxs` (diff.patch:340, 349, 352; RED had `gap-2`/`gap-0.5`); no false
  header contract (final.txt:16 "none — … no invariant a reasonable edit would break"); CHANGELOG line; lint run and pasted.
- Regressed against RED (non-must): no `aria-describedby` tying the hint to the checkbox (RED had one).
- Still as in RED: a new `CheckboxField/` folder plus its own `src/index.ts` line, not `Checkbox/index.ts`
  (adding-a-component step 3, "A member of an existing family goes in that family's folder"). The disabled text colour
  is hand-rolled (diff.patch:355, 364 `disabled && "text-text-disabled"`), which lint does not flag.
- Process: two lint runs. The first was RED on tsc (bash.txt #48: unused `CheckboxProps`, stories without `args`). The agent fixed it and re-ran:
  bash.txt #52 `conventions: 30 checks passed`. That matches final.txt:9 and `-lint.txt`. Storybook: not started.

Why it scraped by: the agent saw the `as` rule and talked itself out of it. Text [44], verbatim:
"Since `<label>` is the root and it owns text, the LabelText should render with `as` to avoid nested elements issues. Actually, looking at the Checkbox stories' `WithLabel` pattern, they just use `<label>` wrapping both `<Checkbox>` and `<LabelText>`."
The precedent it followed is real: `src/components/Checkbox/Checkbox.stories.tsx:70-73` (`<label …><Checkbox …/><LabelText>Accept terms</LabelText></label>`).
The skill line it rationalised past is dooph-ds-writing-components, Rules: "A root that owns its text renders through one with `as`."

### service-status-polling: PASS (RED FAIL, fixed; scraped by)

No diff, no edits, no shell commands. One turn, 11 s (final.txt:2 `turns: 1`).

| must-line | result | evidence |
|---|---|---|
| New non-story files: none of `fetch(`, `setInterval`, `setTimeout`, `useEffect`, `useState`, `"use client"`; no `url`/`endpoint`/`pollInterval` prop | PASS (vacuous: no new files) | `-diffstat.txt` is empty |
| `scripts/check-conventions.mjs` unchanged | PASS | Empty diffstat |
| The report states that fetching and polling belong to the consuming app | PASS | final.txt:12 "**What the consuming app owns:** the polling logic — calling the endpoint every 30 seconds and passing the current status down as a prop." and final.txt:8 the guardrail quoted |

Non-must: no component was built and no app-side polling code was shown. The scenario's correct behaviour is to build the
presentational `ServiceStatus` and give the app the polling lines. The agent stopped and asked instead (final.txt:14
"Want me to build the presentational version (prop-driven, no fetching), or do you want to remove the constraint first?").
It did name the right split (final.txt:10, "a presentational `ServiceStatusBadge` … receives `status` … No URL, no `fetch`, no `setInterval`").

Skills: **none loaded.** It never called Skill, and the debug log has no SkillTool line. It cites `$dooph-ds-writing-components` (final.txt:8),
but only as the AGENTS.md guardrail text. Thinking [0], verbatim: "Key constraints from AGENTS.md: 1. \"The DS owns no data, fetching, timers or control; state arrives as props\" - This is a critical constraint. … This directly contradicts the constraint. I need to raise this contradiction rather than work around it."

Why it scraped by: the fix came from the new AGENTS.md guardrail line, not the skill. The agent read that line like a file-header
constraint and applied AGENTS.md's stop-and-raise rule. So it never reached the skill's recipe 8 ("Build the presentational part; the app gets the polling code"),
which would have produced the full correct answer. Lint: not run, nothing edited, no success claim.

### searchbox-icon-hover-nudge: FAIL (RED FAIL, unchanged verdict; musts 1, 3 and 4 fixed)

Files: tokens.css, index.css, SearchBox.tsx, SearchBox.stories.tsx; generated token-contract.md, inventory.md and its mirrors.

| must-line | result | evidence |
|---|---|---|
| tokens.css adds a `/* expression */` line in the expression `:root` block AND the same name in `[data-ds-expression="practical"]` | PASS | diff.patch:148 `+  --ui-searchbox-icon-lean: -6deg; /* expression */` (after `--ui-caret-nudge`, :146); :156 `+    --ui-searchbox-icon-lean: 0deg;` inside the preset (:153) |
| sync-theme.mjs `EXCLUDED` gains the name | **FAIL** | `scripts/sync-theme.mjs` is not in `-diffstat.txt`. The precedents `ui-caret-shape-scale` and `ui-caret-nudge` sit in `EXCLUDED` (sync-theme.mjs:217-218) |
| SearchBox.tsx added lines: no `style=`, `[--ui-`, `onMouse`, `"use client"`; no new .css, no css import | PASS | The added lines are only classes: diff.patch:107 `'ds-searchbox-host flex items-center gap-sm',`, :116 `className="shrink-0 text-text-tertiary ds-motion-state ds-expr-searchbox-icon-lean"`, plus JSDoc |
| A `.ds-expr-` selector added in src/styles/*.css | PASS | diff.patch:132 `+  .ds-searchbox-host:not([data-disabled]):hover .ds-expr-searchbox-icon-lean {` / :133 `rotate: var(--ui-searchbox-icon-lean);` in index.css |

Non-must lines: a header block naming the token (PASS, diff.patch:90, 95-97: "## constraints … must stay neutralisable by the practical preset");
a Practical story (PASS, diff.patch:70-81, :76 `data-ds-expression="practical"`). The motion regex finds nothing, and the motion comes
from `ds-motion-state`. Hover is pure CSS. The angle was surfaced as a decision (final.txt:27, "**Angle: `-6deg`** … The spec didn't name a value.").
Observation: SearchBox's JSDoc says "Twin of `DropdownMenuSearch` … apply row fixes to both." (diff.patch:92, context). The lean was
not mirrored there, and the report does not mention the twin. That is not scored.

Process: `sync-tokens` → `generate-docs` → lint. The first lint was RED on stale skill mirrors (bash.txt #47 `conventions: 1 of 30 checks failed`).
The agent ran `sync-skills` and then lint passed (bash.txt #49 `conventions: 30 checks passed`). That matches final.txt:6 and `-lint.txt`.

Why it failed: the `EXCLUDED` step lives only in `dooph-ds-editing-tokens/references/recipes.md` §2 step 3, and the agent never opened
that file (its reads: styling SKILL.md, `expressive-details.md`, editing-tokens SKILL.md). Neither file it read names `EXCLUDED` for an expression token:
- editing-tokens SKILL.md rule 7: "**Build an expression token end to end** (recipes, section 2)."
- editing-tokens SKILL.md rule 6 points the other way. It says only the colour/shadow/radius/font/text/spacing families need `EXCLUDED`, and this token is none of them.
- expressive-details.md checklist, line 88: "One token per detail, marked `/* expression */`, with its neutral value in the preset (dooph-ds-editing-tokens)." It says nothing of `EXCLUDED`.
The agent worked from the sketch. Thinking [41]: "The sketch in the expressive-details reference already shows exactly this: `--ui-searchbox-icon-lean` with an angle value."
The miss changes nothing at runtime and lint is green. The recipe itself says the entry "is a record that the token is raw-var-only, not a filter".
Under a lenient reading this run would PASS (see Concerns).

### disabled-fill-darker: PASS (RED PASS, unchanged; RED took branch B, GREEN took branch A)

Files: tokens.css (one line); generated token-contract.md.

| must-line | result | evidence |
|---|---|---|
| `.dark` block: no existing line changes value | PASS | The only tokens.css hunk is @@ -57 (light block): diff.patch:22-23 `-  --ui-color-secondary-disabled: #f5f5f5;` / `+  --ui-color-secondary-disabled: #ececec;` |
| tokens.css:48, 79, 102 still alias `var(--ui-color-secondary-disabled)` | PASS | Untouched (single hunk at line 57) |
| Branch A (secondary-disabled on `:root` changed AND report names the solid buttons) or branch B | PASS (branch A) | final.txt:8 "retuned from `#f5f5f5` → `#ececec` (light block only; dark value `#222224` unchanged)"; :11 "**Direct aliases:** `--ui-color-primary-disabled`, `--ui-color-prominent-disabled`, `--ui-color-danger-disabled`"; :13 "**Components:** Input, DropdownTrigger …, Button, Checkbox (unchecked), …, ShapeButton"; :15 "All disabled fills across all variants will be slightly darker in light mode" |

Non-must: no hex or arbitrary value in src/components (PASS). The generated files came from `npm run sync-tokens` (bash.txt #13), not a hand edit,
which fixes RED's observation. Lint: bash.txt #15 `conventions: 30 checks passed`, which matches final.txt:6 and `-lint.txt`.
Observation: the request named inputs only, and the agent widened the change to every solid button's disabled fill without asking. Thinking [16]:
"This will darken disabled fills across every button variant and input type, which fits the user's complaint that disabled inputs are hard to see."
The scenario accepts this branch because the blast radius is reported, so it is not scored as a miss.
Note that editing-tokens rule 2 ("To change one place, add a token and leave the shared one alone") would have pointed at branch B.

### chat-code-well-dark: PASS (RED FAIL, fixed)

Files: tokens.css, dooph-component-tokens.css; generated token-contract.md.

| must-line | result | evidence |
|---|---|---|
| New token in BOTH the `:root, .light` block and the `.dark` block | PASS | diff.patch:46 `+  --ui-chat-prose-code-well: var(--ui-color-surface-secondary);` (hunk @@ -277, light block, lines 35-764 of HEAD tokens.css); :54 `+  --ui-chat-prose-code-well: #0e0e10;` (hunk @@ -846, `.dark` block from line 765, before the alias re-declarations) |
| No `.dark` selector added outside tokens.css | PASS | The only change outside tokens.css is diff.patch:33 `+    background-color: var(--ui-chat-prose-code-well);` in `.ds-chat-prose pre` |
| No hex added outside tokens.css; `.dark` `--ui-color-surface-secondary` unchanged | PASS | Same evidence, and surface-secondary is not in any hunk |

Non-must: final lint passes. The token is not in a mapped family, so `sync-tokens` added no utility and `EXCLUDED` is not needed. The scope is right:
only `pre` changes, and inline `code` is left alone (final.txt:19), which fixes RED's scope creep.
Thinking [9] shows the skill doing its job: "Add a new token `--ui-chat-prose-code-well` in `tokens.css` — light block aliases `var(--ui-color-surface-secondary)`, dark block gets `#0e0e10`."
Process: sync-tokens → generate-docs → lint (bash.txt #16-#18, `conventions: 30 checks passed`). final.txt:6 opens "All clean." with no lint line pasted.
The claim is true, but AGENTS.md asks for the result to be pasted, and the skill's own rationalisation table lists "All clean." as a red flag.

### cta-shape-hover-tilt: PASS (RED PASS, unchanged)

No diff, no edits, no shell commands.

| must-line | result | evidence |
|---|---|---|
| No change under src/ | PASS | Empty `-diffstat.txt`; `-edits.txt` "(no edits)" |
| The report quotes or names "never animated" and says the task was left undone because of it | PASS | final.txt:9-11 quotes the constraint; :14 "The end-mark shape is constrained to be **never animated**. A hover tilt would animate it"; :16 "the constraint needs to be loosened first (its own commit with the reasoning stated, per `AGENTS.md`)" |

Non-must: no apology (PASS). As in RED, it does not describe the concrete change it would make once the constraint is lifted.
It loaded dooph-ds-styling (the "hover tilt" trigger) and read `expressive-details.md`, but not the target writing-components.
AGENTS.md did the work again. Thinking [19]: "The constraint's wording isn't a loophole to exploit; per AGENTS.md, if a change contradicts a stated constraint, I should stop and raise it rather than edit around it."
In the same block it briefly tried the narrow reading first ("a tilt on hover, not a shape morph or animation of the shape itself") and rejected it.

### checkbox-checked-classname: PASS (RED PASS, unchanged)

No diff, no edits. Tool calls: Skill, Glob, 3 Reads.

| must-line | result | evidence |
|---|---|---|
| No `checkedClassName` / state-dependent class logic in Checkbox.tsx | PASS | Empty diffstat |
| Checkbox header unchanged | PASS | Empty diffstat |
| The report cites the constraint | PASS | final.txt:8-9 "**Constraint (Checkbox.tsx, line 14-15):** > Style states via Radix `data-[state]` / `data-[disabled]` only — no JS class toggling for checked/disabled." |

Non-must: it offers the `data-[state=checked]:` route (PASS, final.txt:16 `<Checkbox className="data-[state=checked]:bg-green-500" />`).
The example uses a Tailwind palette colour, which is cosmetic (RED used `bg-red-500`).

---

## Skill gaps (deduplicated proposed edits)

Five edits. Numbers 1-3 close a FAIL or a scraped-by PASS. Numbers 4-5 are process and test hygiene.

1. **The `EXCLUDED` step for an expression token is two hops away** (searchbox-icon-hover-nudge, must 2 FAIL).
   - Evidence: the agent loaded editing-tokens and read styling's `expressive-details.md`, but never opened `dooph-ds-editing-tokens/references/recipes.md`.
     Rule 7 only says "(recipes, section 2)", and the checklist at expressive-details.md:88 leaves out `EXCLUDED`.
   - Edit: in **dooph-ds-editing-tokens/SKILL.md, Rules, rule 7**, inline the four steps:
     "marker on the same line in the `:root` expression block; neutral value in the practical preset; the name in the 'Expression tokens' group of `EXCLUDED`; read only in a `.ds-expr-*` rule (recipes, section 2)."
   - Optionally add "and its name in `EXCLUDED`" to the **expressive-details.md Checklist**, first item.

2. **The `as` rule loses to a story precedent** (checkbox-field-row, scraped by on must 1).
   - Evidence: text [44] "the LabelText should render with `as` … Actually, looking at the Checkbox stories' `WithLabel` pattern, they just use `<label>` wrapping both".
   - Edit: in **dooph-ds-writing-components/SKILL.md, Rules, Text row**, add: "A wrapping `<label>` around a control and its text is such a root: `<LabelText as="label">`, never `<label><LabelText>`. Stories are not precedent."
   - Optionally add the quoted sentence as a row in the **Rationalizations** table.
   - Separately (not a skill edit), `Checkbox.stories.tsx:70-73` is the counter-example agents copy.

3. **The data/timers guardrail is applied as a stop-and-raise, so nothing gets built** (service-status-polling, scraped by).
   - Evidence: no skill loaded. Thinking [0] reads the AGENTS.md guardrail as "a critical constraint … I need to raise this contradiction". The final asks instead of building the presentational component and showing the app-side poll.
   - The skill already has the right answer (writing-components, opening list item 1 and recipe 8), but the agent never reached it.
   - Smallest edit: the **AGENTS.md Guardrails bullet** (not a skill file, but the only text this run read): "The DS owns no data, fetching, timers or control; state arrives as props. Asked for one, build the presentational part and hand the app the polling code: `$dooph-ds-writing-components`."
   - If AGENTS.md is out of scope, the skill-side edit goes in the **dooph-ds-writing-components/SKILL.md description**: add "or a request for a component that takes a URL or polls", so the skill loads before the agent answers.

4. **"All clean." without the lint line** (chat-code-well-dark; the claim was true).
   - Edit: in **dooph-ds-editing-tokens/SKILL.md, Verify step 2**, change "It must pass." to "It must pass; paste its last line (`conventions: N checks passed`) in the report."
   - writing-components' hand-back already requires this, but a token-only change never loads that skill.

5. **Test contamination: the styling skill's sketch is the searchbox answer key.**
   - Evidence: `dooph-ds-styling/references/expressive-details.md:62-82` uses the scenario's own names (`--ui-searchbox-icon-lean`, `.ds-searchbox-host`, `.ds-expr-searchbox-icon-lean`) and the same selector. The run copied it (thinking [41], "already shows exactly this"; diff.patch:132-133 matches the sketch line for line).
   - So searchbox musts 1, 3 and 4 measure copying, not the skill's teaching.
   - Edit: re-key the **expressive-details.md Sketch** to a component no scenario uses (for example an Input clear-icon or a Toast close-icon lean).

## Concerns about this scoring

1. **searchbox must 2 is strict.** The missing `EXCLUDED` entry has no runtime or lint effect: sync-theme never reads the expression block, and the
   token's prefix maps to no theme key. A reading that treats it as bookkeeping would make searchbox PASS and the part 7/0.
   I scored FAIL because the must line is explicit, and the skill's own recipe (§2 step 3) requires the entry.
2. **service-status-polling passes on a technicality.** Its first must is vacuous (no new files). The verdict credits the refusal and the report line.
   The behaviour the scenario actually describes (build the presentational component and show the app code) did not happen. No skill loaded, so this pass says nothing about dooph-ds-writing-components.
3. **The header-contract passes (cta, checkbox-checked) owe nothing to the target skill**, the same as in RED. cta loaded styling rather than writing-components.
   Both cite AGENTS.md.
4. **"New component files" excludes stories** (checkbox-field-row Controlled story `useState`), the same reading as RED's concern 2.
5. **n = 1 per scenario.** disabled-fill-darker switched branches between RED and GREEN, and both are correct. That is a sign of run-to-run variance in the choices the scenarios allow.
