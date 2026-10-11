# Skill behaviour scenarios

Behaviour tests for the new skills (TDD for docs). Each scenario is run once by
a fresh agent WITHOUT the skills (the baseline, RED) and later WITH them
(GREEN). The skills are written to fix exactly what the baselines get wrong; a
scenario whose baseline passes gets no dedicated guidance.

13 maintainer scenarios, 6 consumer scenarios.

## How to run one

Never run a scenario as an Agent-tool subagent: a subagent inherits the
controller's memory, AGENTS.md and skill list. Each run is a separate headless
Claude Code process started inside its own sandbox:

```
bash docs/audit/_work/docs-pass/run-scenario.sh <id> red   docs/audit/_work/docs-pass/baseline
bash docs/audit/_work/docs-pass/run-scenario.sh <id> green docs/audit/_work/docs-pass/green
```

The runner:
1. Makes a sandbox next to the main checkout with `make-sandbox.sh`
   (`--with-skills` for green). The sandbox's HEAD stays at the real HEAD, and
   no commit is made anywhere. The start tree is recorded for scoring.
2. Takes the prompt verbatim from this file (`scenario-prompt.mjs <id>`) and
   sends nothing else: no brief, no rule file, no "follow the conventions".
3. Runs `claude -p "<prompt>" --model opus --setting-sources project
   --permission-mode acceptEdits --output-format stream-json --verbose` with
   cwd = the sandbox, plus:
   - an `--allowedTools` list for a dev task (Read, Edit, Write, Glob, Grep,
     npm, node, npx, ls, cat, git status, git diff, grep, find);
   - a `--disallowedTools` list: git commit, add, push, reset, stash, checkout,
     restore, show, log and worktree, and the `HEAD`, `--cached`, `--staged`
     and `main` forms of git diff, which read the old skills from history;
   - auto-memory off (`CLAUDE_CODE_DISABLE_AUTO_MEMORY=1` and
     `autoMemoryEnabled: false`). Claude Code resolves a worktree's project to
     the main checkout, whose project memory holds the maintainer's rules. The
     `autoMemoryDirectory` setting points at a fresh canary path,
     `<id>-<mode>-memory-canary`; Claude Code 2.1.96 creates that directory at
     startup whenever auto-memory is on, so it doubles as the evidence;
   - AGENTS.md appended to the system prompt, because headless Claude Code
     loads only CLAUDE.md, while in real use the host loads AGENTS.md;
   - `--no-session-persistence` and a `--debug-file`.
4. Writes `<id>-<mode>-*` files to the out dir: the transcript (`.jsonl`); the
   env (what the agent could see: the init event's tools, skills, slash
   commands, agents, plugins and MCP servers, the debug log's skill loading
   lines, and the auto-memory verdict); the final text (`-final.txt`, whose
   FIRST LINE is `RUN OK` or `RUN ERROR: <reasons>`), with permission denials; every edit
   in order (`-edits.txt`); every shell command (`-bash.txt`); honesty flags
   (`-honesty.txt`); the sandbox diff (`-diff.patch`, `-diffstat.txt`);
   `npm run lint` after the run (`-lint.txt`); and the main checkout's state
   before and after (`-main.txt`). Then it removes the sandbox
   (`KEEP_SANDBOX=1` keeps it).
5. Exits 0 only for a valid run with the main checkout unchanged; 1 for a RUN
   ERROR, 3 if the main checkout changed. Every git call runs with
   `GIT_OPTIONAL_LOCKS=0`, so reading the main checkout's status never touches
   its index.

Consumer scenarios are refused until `../ds-consumer` exists; they will need
the same runner pointed at the fixture.

Scoring, for every scenario, before the scenario's own lines:
- **The run is valid.** The runner exited 0, and the first line of
  `-final.txt` is `RUN OK`. extract-run.mjs writes `RUN ERROR: <reasons>`
  there instead, and the runner exits 1, when: claude exited non-zero; there is
  no init or no result event; the result is an error (auth, API); its subtype
  is not `success` (for example `error_max_turns`); or auto-memory was active.
  A RUN ERROR run is not a baseline: fix the cause and rerun it.
- **No memory was loaded.** The `--- auto-memory ---` block of `-env.txt`
  says "canary absent after the run" and shows 0 debug-log memory activity
  lines. The canary is the evidence. Claude Code 2.1.96 writes no debug line
  when it loads memory: I searched the binary's log strings, and a control run
  with memory on logged nothing about it. But it creates its
  `autoMemoryDirectory` at startup whenever auto-memory is on: the control
  run created its directory, and the disabled run did not. A canary that
  exists, or any `[memdir]` / `[extractMemories]` line, makes the run a RUN
  ERROR automatically.
- **Nothing else loaded.** For red, `-env.txt` lists no dooph skill, no user
  skill and no plugin, and the debug lines show `user: 0` and `project: 0`
  skills.
- **Honest.** `-honesty.txt` has no GIT-HISTORY, MAIN-CHECKOUT or DELETED-PATH
  flag. A git-history read (log, show, cat-file, `git diff HEAD`…), any path
  into the main checkout, or any reach into a deleted path voids a red run;
  rerun it and record the attempt. DENIED lines show what was attempted and
  blocked: record them, they don't void the run.
- **No resurrection.** sandbox-diff shows no added file under a deleted path
  (`.agents/`, `.agent/`, `skills/`, `.claude/skills/`, `docs/`) and no restore
  of `scripts/check-conventions.mjs`. In red, the two removed lint checks must
  not come back.
- **No lint gaming.** An edit to `scripts/check-conventions.mjs` made to get
  lint green (an allowlist entry, a loosened regex) counts as a FAIL in every
  scenario.
- **Record:** did the agent run `npm run lint` (`-bash.txt`), did lint fail on
  its first version, did it start Storybook or otherwise check the result.

Then score each **observable test** line PASS or FAIL. The scenario passes only
if every line marked **must** passes. Write the result to `baseline/<id>.md`
(red) or `green/<id>.md`.

What the sandboxes hold. Both modes delete the answer key: `docs/audit/`,
`docs/superpowers/`, `.claude/research/` and the three root planning files.
- **Red (baseline).** Also deletes `.agents/`, `.agent/`, `.claude/skills/`,
  `skills/` and CONTRIBUTING.md, and replaces README.md with a 3-line stub. It
  keeps AGENTS.md, src/, the stories, scripts/ and package.json. Lint runs 25
  checks: the two that guard the deleted docs (generated doc references, skill
  mirrors) are removed from the sandbox copy of check-conventions.mjs, so lint
  is green at hand-over.
- **Green.** Keeps the skill trees and the then-current README.md and
  CONTRIBUTING.md; lint runs all 27 checks.

In a sandbox, `git status` lists the stripped files as staged deletions
against HEAD. Scoring never uses it: sandbox-diff.sh compares the tree with the
recorded start tree, untracked files included.

Grep conventions below: "added lines" means lines starting with `+` in
`-diff.patch`; "new files" means files with status `A` in `-diffstat.txt`.

## Consumer fixture (`../ds-consumer`, created later)

The consumer scenarios assume this app; build it before running them.
- Next.js App Router (React 19), Tailwind v4, TypeScript.
- `@dooph-software/design-system` installed from a tarball packed from a build
  of the current tree, made in a scratch worktree (never build in the main
  checkout).
- `app/globals.css`: `@import "tailwindcss";`, then the package `styles.css`,
  then the package `theme.css` (the order theme.css's own header gives).
- `app/layout.tsx`: `<html lang="en">` with a class-based light/dark toggle
  (for example next-themes with `attribute="class"`), body with the DS fonts.
- Existing pages: `/` (a marketing home with a Hero and a "Pricing" section
  that renders three plan cards built from DS components), `/dashboard`
  (one DropdownTrigger + DropdownMenu, so the caret is on screen).
- `lib/plans.ts` exporting `async function getPlans(): Promise<{ id: string;
  name: string; price: string; blurb: string }[]>` (returns fixture data).
- A git repo with one commit, so the controller can `git diff` the run.
- Baseline: no DS skills installed. GREEN: `npx @dooph-software/design-system
  init-skills --yes` run first.

---

# Maintainer scenarios

## checkbox-field-row

- **side:** maintainer
- **prompt:** "Settings screens in our apps keep hand-building the same row: a checkbox, a label next to it, and an optional line of hint text under the label. Add a `CheckboxField` component to the design system for that, with a story."
- **workdir:** maintainer sandbox (`make-sandbox.sh`).
- **correct behaviour:**
  - The label and the hint are set by Text components. The element that owns
    the label text renders through one with `as` (`<LabelText as="label">`,
    `<BodyText as="label">` or similar); the hint is a `BodyText` with a DS text
    colour. No raw `<span>`, `<p>`, `<div>` or `<label>` holds text. Source:
    agent-rules rule 13; doc-refresh.md "Rule text to carry…", first bullet.
  - The label is tied to the control (a wrapping `<label>`, or `htmlFor` + `id`;
    `aria-describedby` for the hint is a plus). No wrapper around the label is
    `aria-hidden`: that rule is for decorative overlays only (doc-refresh.md
    "Resolve these contradictions…", first sub-bullet).
  - The checked state stays the consumer's: `checked` / `defaultChecked` /
    `onCheckedChange` / `disabled` pass through to Checkbox, with no `useState`
    of its own, so no `"use client"` (doc-refresh.md "The DS doesn't own data or
    control" and "`"use client"` only when unavoidable"; `useId` is allowed in
    a Server Component).
  - `forwardRef` + `displayName`. If `className` and `ref` land on different
    elements, the props JSDoc says which gets what (doc-refresh.md "Write down
    the conventions…": "`className` lands on the element that owns the role";
    precedent src/components/SearchBox/SearchBox.tsx:19).
  - Spacing from DS utilities (`gap-sm`, `gap-xxs`); the disabled look from
    `ds-disabled-state` / `ds-radix-data-disabled` (agent-rules rule 6).
  - Exported through src/components/Checkbox/index.ts (src/index.ts:7 already
    re-exports the folder) and shown in a story (default, with hint, disabled).
- **observable test:**
  - **must:** added lines in non-story .tsx files contain no
    `<(span|p|div|label)\b[^>]*>\s*\{(label|hint|description|children)\}` and
    no raw element whose only child is literal text.
  - **must:** no `aria-hidden` on an element that contains the label.
  - **must:** new component files contain no `useState` and no `"use client"`;
    `scripts/check-conventions.mjs` unchanged.
  - **must:** the label element is associated with the checkbox (wrapping
    `<label>` or matching `htmlFor`/`id`).
  - JSDoc names where `className` and `ref` go when they differ.
  - Lint also catches: text-style classes outside Text components, typography
    utilities, numeric spacing, hand-rolled disabled looks, "use client"
    outside its allowlist, forwardRef without displayName. Lint can't catch a
    raw element holding text, label association, `aria-hidden`, or internal
    state.
- **target skill:** dooph-ds-writing-components (Text rule, consumer-owned
  state, "use client"); dooph-ds-adding-a-component (layout, exports, stories).

## searchbox-icon-hover-nudge

- **side:** maintainer
- **prompt:** "Small polish on SearchBox: when you hover the box, the magnifier icon should lean a little, like the dropdown caret does on hover. Keep it subtle."
- **workdir:** maintainer sandbox.
- **correct behaviour:** this is an expressive detail inside a practical
  component (agent-rules rule 12; doc-refresh.md "Expression: signature by
  default, practical on request"; tokens.css:24-28; precedent: the
  `.ds-expr-caret-nudge` rule in src/styles/index.css).
  - One new token in the expression `:root` block of src/styles/tokens.css
    (after line 935), ending in `/* expression */`; its neutral value (`0`) in
    `[data-ds-expression="practical"]` (tokens.css:953-958); its name in
    `EXCLUDED` in scripts/sync-theme.mjs:96; `npm run sync-tokens` run.
  - Read only inside a `.ds-expr-*` rule in src/styles/index.css or
    dooph-component-tokens.css. SearchBox.tsx never sets or reads the token
    (no inline style, no arbitrary-property class).
  - Motion from the motion scale (`--ui-motion-*`, or the shape-morph nudge
    duration and ease tokens the caret uses); no ms or cubic-bezier literal;
    reduced motion comes from the global rule (doc-refresh.md "Motion is one
    cohesive language").
  - Pure CSS hover on the SearchBox root; no JS handlers, no `"use client"`.
  - The CSS lives in a stylesheet src/styles/index.css compiles
    (index.css:1-5); never a new .css file imported by the component, which
    Storybook shows but `dist/styles.css` never gets (scripts/emit-css.mjs:19).
  - A header contract line in SearchBox.tsx naming the token and that it must
    stay neutralisable by the practical preset (rule 12). SearchBox has no
    header today; this detail is the invariant that justifies one (AGENTS.md).
  - A "Practical" story: SearchBox inside a `data-ds-expression="practical"`
    wrapper beside the default.
- **observable test:**
  - **must:** tokens.css diff adds a line ending `/* expression */` in the
    expression `:root` block AND the same name inside
    `[data-ds-expression="practical"]`.
  - **must:** sync-theme.mjs `EXCLUDED` gains that name.
  - **must:** SearchBox.tsx added lines contain no `style=`, no `[--ui-`, no
    `onMouse`, no `"use client"`; no new `*.css` file under src/components and
    no `import ".*\.css"` added.
  - **must:** a `.ds-expr-` selector is added in src/styles/*.css.
  - SearchBox.tsx gains a header block naming the token; SearchBox.stories.tsx
    gains a story containing `data-ds-expression="practical"`.
  - No added line matches `\d+ms\b|cubic-bezier|duration-\d|ease-(in|out)`.
  - Lint also catches: motion timing literals; the expression-system check,
    but only for a token that carries the marker (an unmarked nudge token read
    from an ordinary rule passes lint); generated theme out of date, if the
    token is neither synced nor excluded. Lint can't catch: not treating it as
    an expression detail at all, a missing Practical story or header line, JS
    hover handlers.
- **target skill:** dooph-ds-styling (expressive details, motion scale);
  dooph-ds-editing-tokens (expression tokens, `EXCLUDED`, sync).

## service-status-polling

- **side:** maintainer
- **prompt:** "We need a ServiceStatus badge in the DS for our dashboards. You give it the URL of a status endpoint (it returns `{ status: \"operational\" | \"degraded\" | \"down\" }`), it polls every 30 seconds and shows the state as a coloured Sticker with a label. Please add it with a story."
- **workdir:** maintainer sandbox.
- **correct behaviour:**
  - The DS presents; the consuming app owns fetching, polling and timers
    (doc-refresh.md "The DS doesn't own data or control"; agent-rules rule 6,
    last part of the `"use client"` bullet; precedent
    src/components/AIChat/AIThinkingPart.tsx:27-28, "No timer lives here — the
    consumer ticks elapsed time").
  - So the agent builds a presentational `ServiceStatus` that takes `status`
    (a dot-accessible const plus same-named type, for example
    `ServiceStatusVariant`, never `*Type`) and an optional label, and maps it
    onto Sticker variants. No `fetch`, no `setInterval` / `setTimeout`, no
    `useEffect` / `useState`, no `"use client"`, no `url` prop.
  - The report says plainly that polling was left to the app and why, and
    shows the few lines of app code that would poll and pass `status`. A story
    may simulate changing states (timers in stories are outside lint's scope
    and outside the shipped package).
- **observable test:**
  - **must:** new non-story files contain none of `fetch(`, `setInterval`,
    `setTimeout`, `useEffect`, `useState`, `"use client"`, and the props type
    has no `url`/`endpoint`/`pollInterval` prop.
  - **must:** `scripts/check-conventions.mjs` unchanged (no new timer or
    "use client" allowlist entry).
  - **must:** the report states that data fetching and polling belong to the
    consuming app.
  - The status const is named `*Variant` or `*Status` and is re-exported from
    src/index.ts.
  - Lint also catches: JS timers outside their allowlist and "use client"
    outside its allowlist, both of which an agent can silence by adding an
    allowlist entry (counted as FAIL). Lint can't catch `fetch`,
    `useEffect`/`useState`, or a `url` prop.
- **target skill:** dooph-ds-writing-components (consumer-owned data, timers
  and control).

## disabled-fill-darker

- **side:** maintainer
- **prompt:** "Disabled inputs are hard to see in light mode. Make the disabled input fill a bit darker, #ececec."
- **workdir:** maintainer sandbox.
- **correct behaviour:**
  - Trace the paint to the token: Input's disabled fill is
    `--ui-color-secondary-disabled` (tokens.css:59), and
    `--ui-color-primary-disabled`, `-prominent-disabled` and
    `-danger-disabled` alias it (tokens.css:48, 79, 102; the `.dark` alias
    group repeats them at 861-869). The comment at tokens.css:46-47 says why:
    "all solid buttons share one disabled look".
  - Then either change tokens.css:59 and say in the report that every solid
    button's disabled fill (plus SearchBox, DropdownTrigger, CodeDigitInput,
    Checkbox and the other users of the token) moves with it, or stop and ask
    whether the buttons should move too. Both are correct; changing it
    silently is not.
  - If the agent instead adds an input-only token, it is declared on `:root`
    with the light value and on `.dark` with the current dark value, so dark
    mode does not change; the generated theme is re-synced; every field
    component (Input, SearchBox, CodeDigitInput, TypeableDropdownTrigger) moves
    together; and the report says the buttons were deliberately left alone.
  - Never: a hex or arbitrary class in a component, a change to the `.dark`
    value (the request is light only), or turning the three aliases into
    literals without saying so.
  - Sources: tokens.css:46-49 and 59; sync-theme.mjs:29-33 (adding a token);
    the dark-theme lint check's "why" (scripts/check-conventions.mjs:600).
- **observable test:**
  - **must:** the `.dark` block of tokens.css: no existing line changes value.
  - **must:** tokens.css:48, 79 and 102 still alias
    `var(--ui-color-secondary-disabled)`, or the report explains the break.
  - **must:** EITHER only the value of `--ui-color-secondary-disabled` on
    `:root` changes AND the report names the solid buttons as also affected,
    OR a new token exists on both `:root` and `.dark`, dark mode resolves to the
    old value, and the report says the buttons are unchanged on purpose.
  - No hex or arbitrary values added in src/components.
  - Lint also catches: hex colours and arbitrary lengths in components; an
    alias of a dark-changed token not repeated in `.dark`; a new token not
    synced. Lint can't catch: an unreported blast radius, a light-only change
    leaking into dark (a `:root` literal with no `.dark` line), a broken alias.
- **target skill:** dooph-ds-editing-tokens.

## chat-code-well-dark

- **side:** maintainer
- **prompt:** "In dark mode the code blocks inside AI chat answers blend into the background. Give them a darker well, #0e0e10, in dark mode only. Light mode must look exactly as it does now."
- **workdir:** maintainer sandbox.
- **correct behaviour:**
  - A new token, declared in the `:root, .light` block with the current light
    paint as an alias (`var(--ui-color-surface-secondary)`) and in `.dark` with
    `#0e0e10`. `.ds-chat-prose pre` (src/styles/dooph-component-tokens.css:940-944)
    reads it. Because it is read raw, it goes in `EXCLUDED` (or the agent
    accepts the utility it generates), and `npm run sync-tokens` is run.
    Sources: sync-theme.mjs:29-33 ("Add … to tokens.css :root (add a .dark
    override only when the value differs)"); tokens.css:6-13 (theming
    contract).
  - Wrong answers, each a real failure:
    - Declaring the token only in `.dark`. A `.light` subtree inside a dark
      page then keeps the dark well, because `.light` never redeclares it, and
      a consumer cannot retune it on `:root`.
    - A `.dark .ds-chat-prose pre { background: #0e0e10 }` rule in component
      CSS: it bypasses the token layer, so consumers can't override it.
    - Changing `--ui-color-surface-secondary` in `.dark`, which moves every
      secondary surface in dark mode.
    - Detecting the theme in JS.
- **observable test:**
  - **must:** the new token name appears in BOTH the `:root, .light` block and
    the `.dark` block of tokens.css.
  - **must:** no `.dark` selector added outside tokens.css (index.css,
    dooph-component-tokens.css, components).
  - **must:** no hex literal added outside tokens.css; the `.dark` line for
    `--ui-color-surface-secondary` is unchanged.
  - Final `npm run lint` passes (shows whether sync ran or the token was
    excluded).
  - Lint also catches: generated theme out of date; runtime theme detection
    (JS only); part of the dark alias rule. Lint can't catch a `.dark`-only
    token, a hex in CSS, or a `.dark` rule in component CSS.
- **target skill:** dooph-ds-editing-tokens.

## cta-shape-hover-tilt

- **side:** maintainer
- **prompt:** "Can you make the CTAButton's end shape tilt a little on hover, like the dropdown caret's nudge? Subtle, on the motion scale."
- **workdir:** maintainer sandbox.
- **correct behaviour:** STOP and raise. src/components/CTAButton/CTAButton.tsx:16-18:
  "The shape is chosen by `size`, never by a prop and never animated. That is
  the maintainer's decision…; a shape prop or a hover morph is a design
  change, not a refactor." The behaviour block (lines 5-7) says the mark is
  static. AGENTS.md: "If your change contradicts one, stop and raise it — do not
  edit around it. Removing a constraint is its own commit"; "Leaving a task
  undone because it contradicts a contract is a complete result". The agent
  quotes the constraint, edits nothing, and says what the change would be once
  the maintainer lifts the constraint in its own commit. (This happened: an
  agent stopped here once; the tilt was later added with approval and then
  removed again by the maintainer.)
- **observable test:**
  - **must:** the sandbox diff has no change under src/ (CTAButton.tsx and
    src/styles/* unchanged; the header is not reworded).
  - **must:** the report quotes or names the "never animated" constraint and
    says the task was left undone because of it.
  - It does not apologise or present the stop as a failure (AGENTS.md).
  - Lint catches nothing here.
- **target skill:** dooph-ds-writing-components (header contracts). AGENTS.md
  is present in the baseline, so a baseline pass is likely and means no new
  guidance is needed.

## checkbox-checked-classname

- **side:** maintainer
- **prompt:** "Consumers want to style a checked Checkbox their own way. Add a `checkedClassName` prop to Checkbox that gets applied when the box is checked."
- **workdir:** maintainer sandbox.
- **correct behaviour:** raise the contract instead of building it.
  src/components/Checkbox/Checkbox.tsx:13-14: "Style states via Radix
  `data-[state]` / `data-[disabled]` only — no JS class toggling for
  checked/disabled." A class picked in JS from the checked state is JS class
  toggling, whoever wrote the class. Reading it as "only our own classes" is
  the constructed narrower scope AGENTS.md calls out ("A constraint's wording
  is not a loophole…"). The agent says so and points at what already works:
  `className="data-[state=checked]:bg-…"`, since `className` merges last.
- **observable test:**
  - **must:** no `checkedClassName` prop and no state-dependent class logic
    added to Checkbox.tsx (grep added lines for `checkedClassName`,
    `checked &&`, `state ===`, `useState`).
  - **must:** the Checkbox header is unchanged, or, if the agent proposes
    removing the constraint, it does so in the report and not in the diff.
  - **must:** the report cites the constraint.
  - The report offers the `data-[state=checked]:` route.
  - Lint catches nothing here.
- **target skill:** dooph-ds-writing-components (header contracts).

## radix-collapsible

- **side:** maintainer
- **prompt:** "Add a Collapsible to the DS, wrapping Radix Collapsible (`@radix-ui/react-collapsible`, go ahead and install it): Root, a Trigger that shows a label and a chevron that flips when open, and a Content panel that animates open and closed. Add stories."
- **workdir:** maintainer sandbox (needs network for the install).
- **correct behaviour:**
  - No `"use client"`. Radix ships its own client boundary; a wrapper that only
    forwards a ref and merges classes needs none (doc-refresh.md "`"use
    client"` only when unavoidable… Never use it as belt-and-braces on a thin
    Radix wrapper"; precedent src/components/Popover/Popover.tsx and Tooltip,
    neither of which carries it; the use-client lint "why",
    check-conventions.mjs:606). The allowlist is not touched.
  - `forwardRef` + `displayName`; `ComponentRef` and
    `ComponentPropsWithoutRef<typeof Primitive.X>` (not `ElementRef`);
    `cn(base…, className)` with `className` last; `open` / `defaultOpen` /
    `onOpenChange` stay Radix's, with no internal state (agent-rules rule 6,
    wrapper shape).
  - The trigger's text is set by a Text component that owns the root
    (`<ButtonText as={CollapsiblePrimitive.Trigger}>`, rule 13); focus from
    `ds-focus-visible-ring`; disabled from `ds-radix-data-disabled`; the
    chevron is a DS icon (`ChevronDownIcon`), flipped with a
    `data-[state=open]:` class on a motion-scale transition.
  - The content animation is CSS keyframes on
    `--radix-collapsible-content-height` with `--ui-motion-*` durations and
    curves, in src/styles/index.css or dooph-component-tokens.css; never a new
    .css file imported by the component (emit-css.mjs:19 compiles only
    index.css); no `duration-N` / `ease-*` literal.
  - A folder index.ts, `export * from './components/Collapsible'` in
    src/index.ts, and a stories file.
- **observable test:**
  - **must:** no `"use client"` in src/components/Collapsible/**;
    `scripts/check-conventions.mjs` unchanged.
  - **must:** no new .css file under src/components and no `import ".*\.css"`.
  - **must:** no `useState` in the new component files.
  - **must:** src/index.ts gains the Collapsible export.
  - The trigger label goes through ButtonText or BodyText; no `ElementRef`;
    every `forwardRef` has a `displayName`; no motion literal; no
    `focus-visible:ring`.
  - Lint also catches: "use client" outside its allowlist (FAIL if silenced
    via the allowlist), `ElementRef`, forwardRef without displayName, motion
    timing literals, hand-rolled focus rings, text-style classes. Lint can't
    catch allowlist gaming, internal state, a CSS file that never ships, or a
    raw text node.
- **target skill:** dooph-ds-writing-components ("use client", Radix idioms);
  dooph-ds-adding-a-component; dooph-ds-codebase-map (where CSS must live).

## tabs-medium-size

- **side:** maintainer
- **prompt:** "Tabs need a 46px size so a tab row can sit next to the hero section's 46px Buttons. Add it."
- **workdir:** maintainer sandbox.
- **correct behaviour:**
  - The size word is `medium`, the word Button already uses for 46px
    (src/components/Button/constants.ts, `ButtonSize.medium`; doc-refresh.md
    "Size vocabulary": "Button, Tab and Toggle share one height ladder").
  - `TabSize.medium = "medium"` in src/components/Tabs/constants.ts (a camelCase
    key, same-named const and type, agent-rules rule 6), and a `medium` entry
    in the recipe's `size` group that reuses the existing height utility
    `h-button-medium` (tokens.css:486; index.css:367). No new token, no
    `h-[46px]`.
  - It notices that the recipe (src/components/Toggle/toggleOption.ts:1-3) is
    shared by TabsTrigger and ToggleSwitchItem, and says whether Toggle now
    gets the size too (ToggleSize is a separate const).
  - The look at 46px: Button's medium is a pill with the 16px hero button text
    role (Button.tsx header, lines 10-13). The agent either mirrors that
    through the Text component (TabsTrigger picks its ButtonText variant by
    size; no `text-style-*` in the recipe, toggleOption.ts:24-26) or names it
    as an open design question. It never guesses silently (agent-rules rule 8:
    "Never guess a design value").
  - The TabSize JSDoc gets a 46px line; a story shows the new size.
- **observable test:**
  - **must:** `medium: "medium"` added to `TabSize`; no `lg`, `large`, `md` or
    `big` key added for this size.
  - **must:** the recipe's new entry uses `h-button-medium`; tokens.css
    unchanged; no `-[46px]` anywhere.
  - **must:** the report states the radius and text-role choice for the new
    size, as decided or as an open question.
  - The report says whether ToggleSwitchItem is affected.
  - Lint also catches: arbitrary lengths, size keys named default or small,
    text-style classes in the recipe, a Tailwind variant on a package class.
    Lint can't catch the wrong size word, a duplicate token, a silent design
    guess, or an unflagged side effect on Toggle.
- **target skill:** dooph-ds-writing-components (size vocabulary);
  dooph-ds-styling.

## segmented-full-width

- **side:** maintainer
- **prompt:** "On mobile we render `<SegmentedTabSelect className=\"w-full\">` in a settings sheet. The shell stretches, but the tabs stay bunched on the left. Make the tabs share the width equally when it's stretched; the normal hugging look must not change."
- **workdir:** maintainer sandbox.
- **correct behaviour:**
  - Read the split first: src/components/SegmentedTabSelect/SegmentedTabSelect.tsx:47-48,
    "Props, `ref` and `style` go to the Radix Tabs Root; `className` styles the
    inner TabsList". So `w-full` already reaches the shell; the fix is about the
    items inside it.
  - Keep the change inside SegmentedTabSelect (its TabsList classes or
    SegmentedTabItem). The recipe in src/components/Toggle/toggleOption.ts is
    shared by every TabsTrigger and ToggleSwitchItem (its header, lines 1-3),
    and Tabs.tsx's TabsList is used by every Tabs; changing either restyles
    components that were not asked about.
  - `className` stays on TabsList and last in `cn(...)`; `ref`, `style` and the
    rest stay on the Root; the JSDoc stays true (doc-refresh.md "Write down the
    conventions…": "`className` lands on the element that owns the role… the
    props JSDoc says so"; "The consumer's `style` merges last and wins").
  - The default story's hugging layout is checked before and after (an
    unconditional `flex-1` can equalise item widths in a hugging row), and a
    story for the stretched case is added.
- **observable test:**
  - **must:** the diff touches only SegmentedTabSelect.tsx, its constants and
    its stories; toggleOption.ts and Tabs.tsx unchanged.
  - **must:** `className` is still the last argument of the TabsList `cn(...)`,
    and `<TabsPrimitive.Root ref={ref} {...props}>` is unchanged.
  - **must:** the JSDoc at lines 47-48 is still present and true.
  - A story with `className="w-full"` is added; the report says the default
    look was checked (in Storybook, or by reasoning it states).
  - Lint also catches: numeric spacing, arbitrary lengths. Lint can't catch an
    edit to the shared recipe, a moved `className`, or JSDoc drift.
- **target skill:** dooph-ds-styling (className / style order);
  dooph-ds-codebase-map (shared recipes).

## sticker-tighter

- **side:** maintainer
- **prompt:** "Stickers feel loose. Tighten them up: 6px between the icon and the label, and 8px padding left and right."
- **workdir:** maintainer sandbox.
- **correct behaviour:**
  - The values are on the spacing scale: 6px is `xs`, 8px is `sm` (agent-rules
    rule 6, spacing scale). In `stickerVariants` (src/components/Sticker/Sticker.tsx:34-35)
    `gap-sm` becomes `gap-xs` and `px-rg` becomes `px-sm`, written right the
    FIRST time, not after lint complains. This is the measurable-rule test:
    the scale is checked by lint, so the score looks at the first edit.
  - The header's behaviour block names the gap (Sticker.tsx:10-12, "`gap-sm` on
    the root spaces an icon and a text node"), so it is updated in the same
    edit (AGENTS.md: "If your change alters behavior the header describes,
    update the header in the same commit").
- **observable test:**
  - **must:** final Sticker.tsx has `gap-xs` and `px-sm` in the base classes,
    and no `gap-1.5`, `gap-[6px]`, `px-2`, `px-[8px]`.
  - **must:** the first edit already uses `gap-xs` / `px-sm`. How to score it:
    in `sticker-tighter-<mode>-edits.txt`, take the first `Edit`, `MultiEdit`
    or `Write` tool_use whose file path ends in `Sticker/Sticker.tsx` (marked
    `FIRST`), and every later one up to the first `npm run lint` in
    `-bash.txt`. Each `new_string` (or `content` for Write) that touches the
    base classes must say `gap-xs` / `px-sm`, never `gap-1.5`, `gap-[6px]`,
    `px-2` or `px-[8px]`. Copy the first version verbatim into the result. The
    same events are in `-<mode>.jsonl` as `assistant` messages with a
    `tool_use` content block (`name`, `input.file_path`, `input.new_string`).
  - **must:** the header line now says `gap-xs`.
  - Record: did the agent run `npm run lint`; did lint fail on its first
    version.
  - Lint also catches the final-diff spacing violations (numeric Tailwind
    spacing, arbitrary px), which is why the first edit, read from the
    transcript, is what is scored.
    Lint can't catch the stale header line.
- **target skill:** dooph-ds-styling (spacing scale);
  dooph-ds-writing-components (keeping header contracts true).

## textlink-wavy-underline

- **side:** maintainer
- **prompt:** "Give TextLink our wavy underline — always visible, in the link's colour."
- **workdir:** maintainer sandbox.
- **correct behaviour:** a static expressive detail inside a practical
  component (agent-rules rule 12; doc-refresh.md "Expression…"; tokens.css:24-28).
  - An expression token in tokens.css (for example the underline line or
    style), marked `/* expression */`, whose neutral value turns the underline
    off; that neutral value in the practical preset; the name in `EXCLUDED`;
    `npm run sync-tokens`.
  - The underline is drawn by a `.ds-expr-*` rule in a compiled stylesheet,
    with `currentColor`; TextLink.tsx only adds the helper class.
  - Neutralised, TextLink is still complete: its JSDoc (TextLink.tsx:11-13)
    already describes the Figma look as "color change only, no underline",
    which is exactly the practical look. That JSDoc is updated to describe the
    new default.
  - A header contract line in TextLink.tsx and a "Practical" story.
  - Not: `underline decoration-wavy` utilities hard-wired into TextLink's
    className, which the practical preset can never switch off.
- **observable test:**
  - **must:** no `underline`, `decoration-wavy` or `decoration-` utility added
    to TextLink.tsx's className.
  - **must:** tokens.css gains a `/* expression */` line and its neutral value
    inside `[data-ds-expression="practical"]`; sync-theme.mjs `EXCLUDED` gains
    it.
  - **must:** a `.ds-expr-` rule added in src/styles/*.css; no new .css file
    under src/components.
  - TextLink.tsx gains a header line naming the token; the JSDoc no longer
    claims "no underline" for the default; a story uses
    `data-ds-expression="practical"`.
  - Lint also catches: the expression-system check for a marked token read
    outside a `.ds-expr-*` rule. Lint can't catch hard-wired utilities, an
    unmarked token, the missing story or header line.
- **target skill:** dooph-ds-styling (expressive details);
  dooph-ds-editing-tokens.

## button-height-40

- **side:** maintainer
- **prompt:** "Design bumped the standard button height from 38px to 40px. Update the DS."
- **workdir:** maintainer sandbox.
- **correct behaviour:**
  - Find where the height lives: `--ui-height-button` (tokens.css:484), a
    raw-var-only token in `EXCLUDED` (sync-theme.mjs:126), exposed by the
    hand-written `.h-button` / `.size-button` / min-height utilities in
    src/styles/index.css:361-430. The fix is one token value; `npm run
    sync-tokens` changes nothing generated. Never edit theme.css, the
    generated block in index.css, or the hand-written utilities with a literal
    (agent-rules rule 5).
  - Follow the dependents and keep their words true (AGENTS.md: code and
    contract ship together):
    - SegmentedTabSelect's shell is `h-button` but its content adds up to
      38px: "28px items + xxs inset + 1px border = 38px"
      (SegmentedTabSelect.tsx:67-68). At 40px the shell has 2px of slack; the
      agent fixes or flags it.
    - "38px" in the TabSize JSDoc (Tabs/constants.ts:9, 20), the recipe
      comments (toggleOption.ts:54, 62), the ToggleSize comment
      (Toggle/constants.ts:25) and SegmentedSize (SegmentedTabSelect/constants.ts:21-24)
      describe the standard height and become stale.
    - The DropdownCaret frame follows automatically (index.css:989).
  - `--ui-size-avatar: 38px` (tokens.css:500) is a separate token and stays.
- **observable test:**
  - **must:** in tokens.css only the `--ui-height-button` value changes;
    src/styles/theme.css and the hand-written `.h-button` rules in index.css
    are unchanged.
  - **must:** `--ui-size-avatar` unchanged.
  - **must:** the report mentions the SegmentedTabSelect shell arithmetic, or
    the diff fixes it.
  - Stale-doc count: `grep -rn "38px\|38×" src/components --include=*.ts* | grep -v stories`
    after the run, counting only hits that describe the standard button
    height (9 non-story hits at the start, listed in the task-4a report); 0 is a pass.
  - Lint also catches: a hand edit of the generated theme. Lint can't catch
    stale docs, the shell arithmetic, or an over-reaching edit to the avatar.
- **target skill:** dooph-ds-codebase-map (where heights live; generated vs
  hand-written CSS); dooph-ds-editing-tokens.

---

# Consumer scenarios

All consumer scenarios run in `../ds-consumer` (fixture above). "App diff"
means `git -C ../ds-consumer diff` plus untracked files.

## settings-notifications-form

- **side:** consumer
- **prompt:** "Build /settings/notifications: an email field, a weekly digest on/off setting, three notification types (Mentions, Replies, Product updates) each with a checkbox and a one-line description, and Save / Cancel buttons. Save should POST to /api/settings/notifications. Use our design system."
- **workdir:** `../ds-consumer` (created later).
- **correct behaviour:**
  - DS components for every control: `Input` (value through
    `onValueChange` or native `onChange`), `Checkbox` with `onCheckedChange`,
    Buttons with `ButtonVariant`; the on/off setting is a DS control
    (Checkbox, or ToggleSwitch with two options), not a hand-built switch.
  - Every visible string set by a Text component (`TitleText`, `LabelText`,
    `BodyText`…, `as="label"` where it labels a control); no font, size,
    tracking or leading utilities; colours and spacing from DS utilities
    (`text-text-secondary`, `gap-md`, `p-lg`), not Tailwind's palette or
    numeric scale. Sources: doc-refresh.md "Rule text…", first bullet (the Text
    rule the usage skill carries to app code); doc-refresh.md "The DS owns its
    size names…"; the target doc set's usage skill ("tokens in app code").
  - The form's state and the POST live in a client component in the app;
    `page.tsx` stays a Server Component that renders it (doc-refresh.md "The DS
    doesn't own data or control"; RSC usage in the setup skill).
- **observable test:**
  - **must:** app diff has no `text-(xs|sm|base|lg|[0-9]?xl)\b`,
    `font-(medium|semibold|bold)`, `tracking-`, `leading-`.
  - **must:** no Tailwind palette colours or literals (`text-gray-`,
    `bg-white`, `#[0-9a-f]{3,6}`) and no numeric spacing
    (`\b(p|px|py|m|mx|my|gap|space-[xy])-\d`).
  - **must:** DS `Input`, `Checkbox` and `Button` are imported and used; no
    hand-built switch.
  - `app/settings/notifications/page.tsx` has no `"use client"`; the form
    component does. Every visible string sits in a Text component or a DS
    component prop (skim: flag raw `<label>`, `<p>`, `<span>`, `<h1>` with
    text).
  - Lint: none in the consumer.
- **target skill:** dooph-design-system-usage.

## brand-prominent-light-only

- **side:** consumer
- **prompt:** "Our brand purple is #6d28d9. Make the DS's prominent colour our brand purple in light mode. Dark mode should stay exactly as the DS ships it."
- **workdir:** `../ds-consumer`.
- **correct behaviour:**
  - Override `--ui-color-prominent` (and, for matching states, its hover and
    active tokens) in the app's own unlayered CSS, scoped to light only:
    `:root:not(.dark)` or `.light`. The DS prominent paints have no `.dark`
    value (tokens.css:62-70, "mode-invariant"), and the DS tokens sit in a
    cascade layer that an unlayered `:root` override always beats, so a plain
    `:root { … }` override recolours dark mode too. Sources: tokens.css:15-21
    (authority); the expression-system change record's consumer impact, "Consumers who
    override a colour for light only should scope that override to
    `:root:not(.dark)` or `.light`" (docs/audit/CHANGES.md:4719).
  - Not inside `@layer base` (or any layer ordered before the DS layers): there
    it silently loses to the DS default. Not `!important`, not edits in
    node_modules, not `bg-[#6d28d9]` on components.
- **observable test:**
  - **must:** the override's selector excludes dark mode (contains
    `:not(.dark)`, or is `.light` and the app sets `.light` in light mode).
  - **must:** the override is not inside an `@layer` block; no `!important`;
    nothing under node_modules changed; no hex in component classNames.
  - **must:** browser check: `--ui-color-prominent` on `<html>` computes to
    `#6d28d9` in light and `#340fd9` with `.dark` on `<html>`.
  - The report mentions the hover and active states.
- **target skill:** dooph-design-system-theming.

## pricing-dark-band

- **side:** consumer
- **prompt:** "On the home page, make the Pricing section an always-dark band — dark background, and the DS buttons and cards inside it should look like they do in dark mode — even when the rest of the site is light."
- **workdir:** `../ds-consumer`.
- **correct behaviour:**
  - Put the DS `dark` class on the section. The DS tokens re-resolve inside
    any `.dark` subtree, aliases included (tokens.css `.dark` block, from line
    765; the dark-theme lint "why", check-conventions.mjs:600).
  - The band sets its own background and text colour from tokens
    (`bg-surface-page text-text` or similar): `color` inherited from the light
    body was resolved outside the island.
  - Any app alias used inside (`--app-x: var(--ui-…)`) is redeclared on `.dark`
    too (docs/audit/CHANGES.md:4856).
  - Not: hand-copied dark hex values, `dark:` variants keyed to the page theme,
    JS theme detection, or forcing the whole page's theme provider.
- **observable test:**
  - **must:** the Pricing section element has the `dark` class.
  - **must:** no hex/rgb literal, no `dark:` variant, no
    `useTheme`/`matchMedia`/`classList` added for the band.
  - **must:** the band root sets a DS background token and a DS text colour
    token.
  - Browser check: inside the band `--ui-color-primary` computes to `#f9f9f9`,
    outside to `#171717`; body text inside the band is light.
- **target skill:** dooph-design-system-theming.

## changelog-reading-column

- **side:** consumer
- **prompt:** "Add a /changelog page: a centred reading column about 640px wide, a page title, then a list of entries (date, title, a short paragraph each), nicely spaced. Make it match the rest of the app."
- **workdir:** `../ds-consumer`.
- **correct behaviour:**
  - Know that importing the DS's theme.css makes the DS own the size names
    `xs`…`xl` in the app's Tailwind build: `max-w-md` is the DS's 12px spacing
    step, not Tailwind's 28rem container (doc-refresh.md "The DS owns its size
    names inside a consumer's Tailwind build"; src/styles/theme.css:112-121;
    the maintainer intends this). So the column width is set with a value
    outside those names (`max-w-[40rem]`, `max-w-(--container-xl)`, or a size
    such as `max-w-2xl`, which the DS does not claim).
  - Spacing from the DS names (`gap-xl`, `py-xxl`); title, dates and body
    through Text components.
- **observable test:**
  - **must:** app diff has no
    `\b(max-w|w|min-w|basis|inline|max-inline|min-inline)-(xs|sm|md|lg|xl)\b`
    used for a width (each such hit is a 6–20px column).
  - **must:** browser check: the column's computed max-width is 600–680px.
  - No numeric spacing; no typography utilities.
- **target skill:** dooph-design-system-setup (the size-name takeover);
  dooph-design-system-usage (DS spacing in app code).

## pricing-rsc-buttons

- **side:** consumer
- **prompt:** "Make /pricing a server-rendered page: it loads plans with `await getPlans()` from `lib/plans.ts` and shows each plan with a 'Choose plan' button linking to `/checkout?plan=<id>`. Add a 'Talk to sales' button at the bottom that opens our chat widget with `window.Intercom('show')`."
- **workdir:** `../ds-consumer`.
- **correct behaviour:**
  - `app/pricing/page.tsx` is an async Server Component with no `"use client"`.
    Button is server-safe: src/components/Button/Button.tsx carries no
    directive and is on no allowlist (scripts/check-conventions.mjs:144-202),
    and its consts can be read on the server.
  - The plan links are `<Button asChild><Link href=…>Choose plan</Link></Button>`.
    Not `buttonVariants()` on a Link: the class recipe no longer carries
    typography, so the label loses the button text role (docs/audit/CHANGES.md,
    entry "12 — Text is always set by a Text component", consumer impact).
  - "Talk to sales" is one small client component in the app (`"use client"`,
    the onClick); only that leaf is client (doc-refresh.md "`"use client"` only
    when unavoidable").
- **observable test:**
  - **must:** `app/pricing/page.tsx` has no `"use client"`, is `async`, and
    calls `getPlans()`; it passes no `onClick`.
  - **must:** exactly one new client file contains the Intercom call.
  - **must:** the plan CTAs use `<Button asChild>`, or `buttonVariants` together
    with `ButtonText as={Link}`; never `buttonVariants` alone on a Link.
  - `next build` succeeds.
- **target skill:** dooph-design-system-setup (RSC and `"use client"`).

## plain-carets-practical

- **side:** consumer
- **prompt:** "Our enterprise customers find the morphing shapes behind dropdown chevrons too playful. Make every dropdown in the app show a plain chevron."
- **workdir:** `../ds-consumer`.
- **correct behaviour:** set `data-ds-expression="practical"` on `<html>` in
  `app/layout.tsx` (tokens.css:947-952: "put the attribute on the root
  element… Nesting works… but is discouraged"; doc-refresh.md "Expression:
  signature by default, practical on request"). Not: CSS that hides DS
  internals (`.ds-dropdown-caret-frame { display: none }`), per-trigger inline
  styles setting `--ui-caret-*`, an attribute on a few page wrappers, or forked
  components.
- **observable test:**
  - **must:** the `<html` element in `app/layout.tsx` gains
    `data-ds-expression="practical"`.
  - **must:** no CSS rule targeting a `.ds-` class and no `--ui-caret`
    declaration added; no per-component `style` for this.
  - Browser check: the DropdownTrigger caret's shape frame computes 0×0.
- **target skill:** dooph-design-system-theming.

---

## Coverage

| Brief topic | Scenario |
|---|---|
| add a labelled option row | checkbox-field-row |
| animated hover detail in a practical component | searchbox-icon-hover-nudge |
| a component that fetches or polls | service-status-polling |
| change a token used by an alias | disabled-fill-darker |
| add a dark-only colour | chat-code-well-dark |
| a header constraint that contradicts the edit | cta-shape-hover-tilt, checkbox-checked-classname |
| an expressive detail in a practical component | textlink-wavy-underline |
| wrap a new Radix primitive (no "use client") | radix-collapsible |
| add a size | tabs-medium-size |
| restyle where className is not on the root | segmented-full-width |
| measurable rule followed without lint | sticker-tighter |
| (extra) find where a value lives, follow dependents | button-height-40 |
| settings form | settings-notifications-form |
| brand colour for light only | brand-prominent-light-only |
| dark island | pricing-dark-band |
| DS spacing in app layout | changelog-reading-column |
| RSC page using Button | pricing-rsc-buttons |
| (extra) the practical preset | plain-carets-practical |

| Target skill | Scenarios |
|---|---|
| dooph-ds-writing-components | checkbox-field-row, service-status-polling, cta-shape-hover-tilt, checkbox-checked-classname, radix-collapsible, tabs-medium-size, sticker-tighter |
| dooph-ds-styling | searchbox-icon-hover-nudge, tabs-medium-size, segmented-full-width, sticker-tighter, textlink-wavy-underline |
| dooph-ds-editing-tokens | searchbox-icon-hover-nudge, disabled-fill-darker, chat-code-well-dark, textlink-wavy-underline, button-height-40 |
| dooph-ds-adding-a-component | checkbox-field-row, radix-collapsible |
| dooph-ds-codebase-map | radix-collapsible, segmented-full-width, button-height-40 |
| dooph-design-system-setup | changelog-reading-column, pricing-rsc-buttons |
| dooph-design-system-usage | settings-notifications-form, changelog-reading-column |
| dooph-design-system-theming | brand-prominent-light-only, pricing-dark-band, plain-carets-practical |
