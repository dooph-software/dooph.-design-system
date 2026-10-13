# GREEN scores, round 2, consumer: 4 re-runs after three skill fixes

Scored against `scenarios.md` ("Consumer scenarios", plus the valid-run rules), with the method of round 1
(`green/SCORES-consumer.md`), which copies `baseline/SCORES.md` sections (d) and (e). One run per scenario, model
`claude-opus-4-6` (every `-env.txt` line 2), Claude Code 2.1.96, the same as RED and round 1. Each run used a sandbox
`ds-consumer-sb-<hex>` made from `ds-consumer-template` (commit `c48344d`, `-sandbox.txt:42`) with this round's tarball
(`scratchpad/green-pack-r2/dooph-software-design-system-5.3.0.tgz`, sha256 `15b1b278…`, line 2 of every `-final.txt`;
`.source` = snapshot `1aedd331`). `init-skills --yes` installed six skills into `.claude/skills` (`-sandbox.txt`).
"App diff" is `-diff.patch` against the sandbox's hand-over commit. Citations: `-diff.patch:<n>` is the raw patch line
(`cat -n`); `[n]` is the content-block index over all assistant blocks, subagent blocks included, printed by the same
`texts.mjs` logic as round 1 (scratchpad copy, 0-based; it reproduces round 1's pricing-dark-band `[7]`). "Lint" in the
consumer is the runner's post-run `npm run typecheck` (`next typegen && tsc --noEmit`), then `npm run build`. All file
names below drop the `green-r2-consumer/` prefix.

The three skill fixes under test (quoted from the round-2 tarball's skills, which is what the agents read):
- theming SKILL.md:26, "Dark mode and islands": "**Give the island element its own background and text colour:
  `className="dark bg-surface-page text-text"`.** Its tokens re-resolve, but the `color` it inherits was computed outside
  it, on your `<body>`." Plus Verify, :87: "For an island, also read `getComputedStyle(heading).color` on a heading inside it."
- usage SKILL.md:64, Verification step 1: "Run the app's own `npm run typecheck` and `npm run build`, never raw `tsc`.
  In Next.js, raw `tsc` reporting `Cannot find name 'LayoutProps'` means `next typegen` was skipped, not a pre-existing error".
- theming SKILL.md:3, `description`: "…or the practical expression (dropdown carets or chevrons without the morphing
  shape or hover lean, a plainer or less playful look); …".

**Result: 4 PASS, 0 FAIL, 4 of 4 valid. pricing-dark-band is fixed against round 1 (FAIL → PASS) and back to RED's PASS.
Of the three targeted gaps, two closed (island text colour; raw `tsc` "pre-existing" claim) and one did not (the late
theming load in plain-carets: the skill was loaded even later than in round 1, and the PASS again scraped by).**

## Summary

| id | valid | verdict | RED verdict | round-1 GREEN | skills loaded | ran lint (consumer: the agent's own check) | failed musts | targeted gap |
|---|---|---|---|---|---|---|---|---|
| pricing-dark-band | yes (exit 0) | **PASS** | PASS → unchanged | FAIL → **fixed** | dooph-design-system-theming (at [2], first) | none | none | **closed**: `dark bg-surface-page text-text`, cited from the skill; browser headings `rgb(255, 255, 255)` |
| settings-notifications-form | yes (exit 0, no denials) | **PASS** | PASS → unchanged | PASS → unchanged | dooph-design-system-usage | `npm run build` (includes TypeScript) + the skill's grep. No raw `tsc` | none | **closed**: no raw `tsc`, no "pre-existing" claim |
| changelog-reading-column | yes (exit 0) | **PASS** | PASS → unchanged | PASS → unchanged | dooph-design-system-usage (not the target -setup) | `npm run typecheck` + the skill's grep. No build | none | **closed**: `npm run typecheck`, no "pre-existing" claim (attribution shared with the Explore report, see section) |
| plain-carets-practical | yes (exit 0) | **PASS** (scraped by, see section) | PASS → unchanged | PASS → unchanged | dooph-design-system-theming (at [72] of 80) | none | none | **not closed**: loaded after a token-override plan had formed |

**Checks.** Post-run typecheck 0 and build 0 in all four (`typecheck exit: 0` at `-lint.txt:7`; `build exit: 0` at
`-lint.txt:44`, `:47` for settings, `:45` for changelog). Two runs ran no check at all: pricing-dark-band and
plain-carets (round 1 and RED: the same two, plus brand). No run opened a browser. The usage skill's Verification step 3
and the theming skill's Verify both ask for one, but the runs' tool list (`-env.txt` "tools (24)") has no browser tool,
so this is a harness limit, not a skill gap. Both runs that checked used the app's own scripts this time
(settings `npm run build`, changelog `npm run typecheck`); round 1's two raw `npx tsc --noEmit` calls and their false
"pre-existing" claims are gone.

## Validity (all 4 runs)

- `batch-status.txt`: all four `exit=0`, then `ALL-DONE`. Every `-main.txt` reads `MAIN CHECKOUT UNCHANGED`, with the same
  before and after HEAD (`84939067…`), index (`a696bc1c…`), refs (`2c29788e…`) and status (`5c2e00e1…`). Unlike round 1,
  not even the status hash moved, so the exit-3 note is not needed.
- Line 1 of every `-final.txt` is `RUN OK`, with `subtype: success  is_error: false` and `permission_denials (0)`.
  Every `-runner.log` reads `RUN OK`, `consumer honesty: 0 flag(s)`.
- Every `-honesty.txt`: "no flags: no git-history reads, no main-checkout paths, no deleted paths, no denials" and
  "no flags: no template path, no tarball reads, no other sandbox, no DS registry commands, no network". Round 1's
  settings denials and plain-carets VENDOR-TARBALL flag do not recur.
- Every `-env.txt`: `canary absent after the run: auto-memory was off, no memory loaded`, `debug-log memory activity lines: 0`.
  There is no `*-memory-canary` directory in `green-r2-consumer/`.
- Every `-env.txt`: `skills (13)` = 7 bundled + the six `dooph-design-system-*` skills; `plugins (0): (none)`;
  `Loaded 6 unique skills (… user: 0, project: 6 …)`. That is the GREEN consumer setup.
- Every `-prompt.txt` equals `node scenario-prompt.mjs <id>`, apart from a trailing newline (checked with `diff`).
- No resurrection or node_modules edits. The diffstats touch `app/**` only, plus settings' new `lib/settings.ts`.
- Skill loads were confirmed twice: by the `Skill` tool_use in each `.jsonl` and by `SkillTool returning 2 newMessages for
  skill <name>` in `-debug.log` (pricing-dark-band:121 theming; settings:233 usage; changelog:267 usage;
  plain-carets:660 theming). Each run loaded exactly one skill.
- An Explore subagent ran in all four (pricing-dark-band in parallel with its skill load; the other three before it).
  Its tool calls are inside the honesty scan.
- **Browser checks.** I rebuilt the sandbox the way round 1 did: the template HEAD (`c48344d`) via `git archive`, this
  round's tarball (line 2 of `-final.txt`, sha256 `15b1b278…`, re-verified after copying) into `vendor/`, the lockfile
  integrity recomputed as `make-consumer-sandbox.sh` does, `npm ci`. All in `scratchpad/gscore-r2/app`, outside the repo.
  One build held all three browser-checked diffs (pricing-dark-band `app/page.tsx`; changelog `app/changelog/page.tsx`
  + a `layout.tsx` nav hunk; plain-carets a different `layout.tsx` hunk). Each `git apply --check` was clean. `next build`
  exit 0, then `next start -p 3471`, inspected in the built-in browser pane with `getComputedStyle`, with in-page controls
  (see Concerns 2 on combining). I stopped the server by PID (node 30908 and its cmd parent 35408; port 3471 no longer
  listening), closed the tab, deleted the scratch dir, and left the template clean (`git status --porcelain` empty).

---

## Per-scenario results

### pricing-dark-band: PASS (RED PASS, unchanged; round 1 FAIL, fixed; targeted gap closed)

The diff touches only `app/page.tsx`, with one Edit (`-edits.txt` #15 FIRST).

| must-line | result | evidence |
|---|---|---|
| The Pricing section element has the `dark` class | PASS | diff.patch:10 `+      <section id="pricing" className="dark flex flex-col items-center gap-xl px-xl py-xxxl bg-surface-page text-text">` |
| No hex/rgb literal, no `dark:` variant, no `useTheme`/`matchMedia`/`classList` added | PASS | diff.patch:10 is the only added line; a regex for `rgb\|dark:\|useTheme\|matchMedia\|classList\|#hex` over added lines finds nothing |
| The band root sets a DS background token **and a DS text colour token** | **PASS** | diff.patch:10: `bg-surface-page text-text` (round 1: `bg-surface-primary`, no text colour) |

Non-must browser check (`.light` on `<html>`): PASS on every reading.
- `--ui-color-primary`: `#f9f9f9` inside `#pricing`, `#171717` on `<html>` and on the hero section.
- Band: background `rgb(19, 28, 29)`, `color` `rgb(255, 255, 255)`, on a light `<body>` (`rgb(253, 254, 255)` / `rgb(22, 22, 22)`).
- Text with no colour class is now light: the `TitleText` "Pricing" (h2), the plan names (`LabelText` h3) and the prices
  (`HeadingText` p) all compute `rgb(255, 255, 255)`. In round 1 these were `rgb(22, 22, 22)`. Secondary text
  `rgb(175, 175, 175)`, tertiary `rgb(139, 139, 139)`. A screenshot shows white headings on the dark band and black cards.
- Buttons and cards look like dark mode: button `rgb(249, 249, 249)` fill with `rgb(0, 0, 0)` label; card (`article`,
  `bg-surface-primary`) `rgb(0, 0, 0)` with border `rgb(51, 52, 55)`. With `.dark` on `<html>` instead (whole page dark), the
  same elements read identically (band `rgb(19, 28, 29)`, button `rgb(249, 249, 249)`/`rgb(0, 0, 0)`, border
  `rgb(51, 52, 55)`, h2 `rgb(255, 255, 255)`).
- Control: removing `text-text` from the section in-page turns the section, h2 and h3 back to `rgb(22, 22, 22)` (round 1's
  defect); restoring it gives `rgb(255, 255, 255)`.

Why it passed: the skill line, verbatim, before reading the code.
- It loaded theming at [2], in parallel with the Explore subagent, before any edit.
- Thinking [16]: "Based on the skill instructions, I need to: 1. Add `className="dark bg-surface-page text-text"` to the pricing section element 2. Handle any portalled content if needed".
- Final: "**`text-text`** — resets inherited text colour so Text components without an explicit colour class pick up the dark-mode text colour (not the light colour inherited from `<body>`)."
  That is the skill's reason, restated correctly. It also applied the portal bullet (SKILL.md:27): "No portalled content … so no `portalProps` wiring is needed."
- Checks: none (6 turns, 0 typecheck/build/browser). The skill's Verify :87 asks for the heading colour read; the run had
  no browser tool. Its claims are confirmed by the replay above, not by the agent.

### settings-notifications-form: PASS (RED PASS, unchanged; round 1 PASS, unchanged; targeted gap closed)

Files: new `lib/settings.ts` (#26), `app/settings/notifications/page.tsx` (#27), `app/settings/notifications/notifications-form.tsx`
(#28), `app/api/settings/notifications/route.ts` (#29), all Write FIRST; `app/layout.tsx` nav link (#30 Edit FIRST).

| must-line | result | evidence |
|---|---|---|
| App diff has no `text-(xs\|sm\|base\|lg\|[0-9]?xl)\b`, `font-(medium\|semibold\|bold)`, `tracking-`, `leading-` | PASS | No hit over added lines. Text goes through `LabelText as="label"` (diff.patch:116, 136, 160), `BodyText as="p"` (:140, 163, 207), `SubheadingText as="h2"` (:129, 147), `TitleText as="h1"` (:206) |
| No palette colours or literals, and no numeric spacing `\b(p\|px\|py\|m\|mx\|my\|gap\|space-[xy])-\d` | PASS | No hit; a wider every-side regex finds none either. Spacing: `gap-xl` (:108), `gap-xs` (:115, 205), `gap-sm` (:128, 130, 146, 152, 174), `gap-md` (:148), `mt-xxs` (:157), `px-xl py-xxl` (:204). Colour: `text-text-secondary` |
| DS `Input`, `Checkbox` and `Button` imported and used; no hand-built switch | PASS | Imports :38-46. `<Input … value={email} onValueChange={setEmail} />` (:119-124); `<Checkbox … onCheckedChange=…>` (:131-135, 153-158); `<Button type="submit" variant={ButtonVariant.prominent}>` (:175) and a Cancel `Button` (:178-186). The weekly digest is a `Checkbox` |

Non-must lines and observations:
- `page.tsx` has no `"use client"`, the form does: PASS (as round 1). The directive is at :35 on `notifications-form.tsx`, with
  the state and the POST (:72-104). `page.tsx` (:197-214) is an async Server Component that loads settings and renders
  `<NotificationsForm initial={settings} />`. Thinking [24]: "The pattern from patterns.md #1 is exactly what I need."
- Visible strings: all in Text components or DS `Button` children; every label is tied with `as="label" htmlFor`. The column is `max-w-[40rem]` (:204).
- Scope beyond the prompt (not scored): a fixture loader `lib/settings.ts` and a POST route handler `route.ts`, both
  reported in the final. Cancel is `type="reset"` with an `onClick` that resets the controlled state (:178-184); unverified in a browser.
- **Process: the targeted gap closed.** `-bash.txt:29-35` `npm run build 2>&1 | tail -30` (route table includes
  `/settings/notifications`), then the usage skill's grep, `-bash.txt:36-37` "No violations found". No `npx tsc` anywhere in
  `-bash.txt`; no "pre-existing" claim in the agent's own text (the one hit in the `.jsonl`, line 62, is the loaded skill's text). `next build` itself runs TypeScript ("Running TypeScript … Finished
  TypeScript", post-run `-lint.txt`), so the build covers the typecheck. Final: "Build passes clean, no DS rule violations." Backed by
  the route table and the grep (the `| tail -30` hides the exit status, but post-run `build exit: 0`, `-lint.txt:47`).
  The agent gave no reason for choosing `npm run build` (text [34]: "Now let me add a nav link and verify the build."), so the
  closure is consistent with usage SKILL.md:64 but not quoted from it. It ran the build only, not `npm run typecheck` as well.

### changelog-reading-column: PASS (RED PASS, unchanged; round 1 PASS, unchanged; targeted gap closed)

Files: new `app/changelog/page.tsx` (`-edits.txt` #22 Write FIRST); `app/layout.tsx` (a nav link, #23 Edit FIRST).

| must-line | result | evidence |
|---|---|---|
| No `\b(max-w\|w\|min-w\|basis\|inline\|max-inline\|min-inline)-(xs\|sm\|md\|lg\|xl)\b` used for a width | PASS | No hit. diff.patch:58 `+    <main className="mx-auto max-w-[40rem] px-xl py-xxxl">` |
| Browser: the column's computed max-width is 600–680px | PASS | `/changelog`: `getComputedStyle(main).maxWidth` = `640px`, width 640, root font 16px. Centred: 24px each side of a 688px document width (the 703px viewport less a 15px scrollbar) |

Non-must: no numeric spacing and no typography utilities: PASS. Spacing `mt-sm` (:60), `mt-xxl … gap-xxl` (:64), `gap-xs`
(:66), `px-xl py-xxxl` (:58). Text is `TitleText as="h1"` (:59), `BodyText as="p"` (:60, 71), `LabelText as="time"` (:67),
`HeadingText as="h2"` (:70); five `article`s render.

Why it passed: this time with stated reasoning from the skill. Thinking [25]: "Width uses `max-w-[40rem]` (640px) since DS size
names in max-w are spacing tokens, not breakpoints." (Round 1 wrote the same value with no reasoning.) It loaded usage at [24],
not the target setup; usage carries the rule.

**Process: the targeted gap closed.** `-bash.txt:42-47` `npm run typecheck` (`next typegen && tsc --noEmit`, "Types generated
successfully", no errors), text [31] "Typecheck passes.", then the skill's grep, `-bash.txt:48-49` "Clean". No raw `tsc`, no
"pre-existing" claim. Final: "All clean." Backed by both outputs. No build (post-run `build exit: 0`, `-lint.txt:45`).
Attribution is shared: the usage skill (SKILL.md:64) was loaded at [24], before the typecheck at [30], but the Explore
subagent also read `README.md` (`-bash.txt:25-31`, which lists `npm run typecheck`) and passed the scripts list to the parent.
In round 1 the subagent also read the README, but its report to the parent did not name the script, and the parent ran raw `tsc`.
So this run does not isolate the skill's effect. RED also ran `npm run typecheck`; round 1 was the outlier.

### plain-carets-practical: PASS (RED PASS, unchanged; round 1 PASS, unchanged; scraped by; targeted gap NOT closed)

The diff touches only `app/layout.tsx`, with one Edit (`-edits.txt` #68 FIRST).

| must-line | result | evidence |
|---|---|---|
| The `<html` element in `app/layout.tsx` gains `data-ds-expression="practical"` | PASS | diff.patch:7-9 `     <html` / `       lang="en"` / `+      data-ds-expression="practical"` |
| No CSS rule targeting a `.ds-` class, no `--ui-caret` declaration, no per-component `style` | PASS | The diffstat is `M app/layout.tsx` only, and diff.patch:9 is the only added line |

Non-must browser check (`/dashboard`): PASS. The one `.ds-dropdown-caret-frame` computes `width: 0px; height: 0px` (rect 0×0);
on `<html>`, `--ui-caret-shape-scale` = `0` and `--ui-caret-nudge` = `0`. Control: with the attribute removed in-page, the frame is
26px × 26px, scale `1`, nudge `.15`; restoring it gives 0×0 again.

Why it passed, and why it only just did. The skill was loaded at [72] of 80 blocks, later than round 1's [53]:
- Thinking [0] opened with an Explore subagent and no skill check. 57 subagent blocks read `.d.ts` files, dist chunks and
  `dist/styles.css` (`-bash.txt:8-137`).
- Thinking [60]: "To hide the morphing shapes and show only a plain chevron, I need to use CSS to hide the MorphRotationShape element." Text [61]: "I can't modify the DS source, but I can hide the shape layer with CSS." That plan fails must 2.
- Reading `dist/styles.css` (Read at [70], offset 2074) found the preset itself, and text [71] chose the wrong branch:
  "The DS already has a `data-ds-expression="practical"` preset that sets `--ui-caret-shape-scale: 0` — exactly what we need. But the simplest approach is just to override the token in our app's CSS."
  A `--ui-caret-shape-scale` declaration also fails must 2.
- Only then did it load theming ([72]), and the Expression section (SKILL.md:63) turned it. Thinking [73]: "The skill confirms exactly what I found. … The `data-ds-expression="practical"` attribute is the cleanest approach since it's the DS's built-in mechanism."
- So, unlike round 1, the answer came from the compiled CSS first (as in RED), and the skill acted as the tie-breaker between
  a token override (FAIL) and the attribute (PASS). The new description words ("dropdown carets or chevrons without the
  morphing shape … a plainer or less playful look") match the prompt ("morphing shapes behind dropdown chevrons too playful",
  "plain chevron") almost word for word, and the skill list with descriptions was sent at startup (`-env.txt` "Sending 12 skills
  via attachment"). The agent still did not load the skill until after its own exploration. The description fix did not
  produce an earlier load in this run.
- Checks: none. Final: "Done. Added `data-ds-expression="practical"` to the `<html>` element in `app/layout.tsx:42`."

---

## Did the targeted gaps close?

| gap (round 1 Skill gaps #) | fix | closed? | evidence |
|---|---|---|---|
| 1. Island sets its own text colour (pricing-dark-band must 3) | theming SKILL.md:26 + Verify :87 | **Yes** | diff.patch:10 `bg-surface-page text-text`; thinking [16] quotes the skill's class string; browser headings `rgb(255, 255, 255)` on `rgb(19, 28, 29)`, control without `text-text` = `rgb(22, 22, 22)` |
| 2. Raw `tsc` and a false "pre-existing" claim (settings, changelog) | usage SKILL.md:64 | **Yes**, in both | settings `npm run build` (`-bash.txt:29`), changelog `npm run typecheck` (`-bash.txt:42`); no `tsc` call in either `-bash.txt`; the only "pre-existing" in either `.jsonl` is the injected usage SKILL.md:64 text itself (settings line 62, changelog line 72), so the fix's wording reached both agents. Changelog's attribution is shared with the Explore report (see its section) |
| 3. Late theming load (plain-carets) | theming `description` | **No** | Skill at [72] (round 1: [53]); text [71] had chosen an app-CSS token override, which fails must 2, before the load |

## Skill gaps (deduplicated proposed edits)

1. **plain-carets-practical: the theming skill still loads after the plan forms** (a PASS that scraped by; low priority, low confidence).
   - Evidence: text [61] "I can hide the shape layer with CSS"; text [71] "But the simplest approach is just to override the token in our app's CSS."; Skill tool at [72]; debug.log:660.
   - What it missed: nothing in the skill text. It did not consult the skill list before exploring, although theming SKILL.md:3 now
     names "dropdown carets or chevrons without the morphing shape or hover lean, a plainer or less playful look".
     The same explore-first order shows in settings ([19]) and changelog ([24]); only pricing-dark-band loaded first ([2]).
   - Smallest edit, tentative: in `skills/dooph-design-system-theming/SKILL.md` frontmatter `description`, move the caret trigger to the
     front so it is the first clause an agent scans: "Use when dropdown chevrons or carets should be plain (no morphing shape, no hover
     lean) or the UI should look less playful; when an app on @dooph-software/design-system needs a --ui-* token overridden, …".
     This round shows wording overlap alone was not enough, so this edit may not move the load either. The working safeguard
     today is the Expression section itself, which turned a failing plan into a pass in both GREEN rounds. A second run of this scenario
     would show whether the late load is variance or habit.

No edit is proposed for pricing-dark-band (fixed by SKILL.md:26), settings or changelog (gap 2 closed; both passed every must),
or for the missing browser checks (the headless runs have no browser tool).

## Concerns about this scoring

1. **n = 1 per scenario.** pricing-dark-band's fix is strongly attributable (thinking [16] quotes the skill's class string). The
   plain-carets result is one run, and the round-1 and round-2 load positions ([53], [72]) differ by run, not by skill text alone.
2. **One combined browser build.** Round 1 built plain-carets separately. Here all three diffs were in one build, so
   `data-ds-expression="practical"` was on `<html>` during the pricing and changelog reads. The preset sets only the expression
   tokens (`--ui-caret-shape-scale`, `--ui-caret-nudge`), which neither the colour nor the width readings use, and every
   pricing reading was compared in-page against whole-page dark in the same build.
3. **Changelog's gap-2 closure is not isolated.** The Explore subagent's report named `npm run typecheck` as well as the skill. The
   settings closure is cleaner (its subagent saw only `package.json`'s scripts), but that agent did not state its reason either.
4. **The browser checks are replays, as in RED and round 1.** Rebuilt from the template commit plus this round's tarball (same sha256 as the runs) plus each diff.
