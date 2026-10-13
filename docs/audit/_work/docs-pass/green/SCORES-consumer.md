# GREEN scores, part consumer: 6 consumer scenarios

Scored against `scenarios.md` ("Consumer scenarios", plus the valid-run rules), with the consumer method of
`baseline/SCORES.md` sections (d) and (e). One run per scenario, model `claude-opus-4-6` (every `-env.txt` line 2),
Claude Code 2.1.96, the same as RED. Each run used a sandbox `ds-consumer-sb-<hex>` made from `ds-consumer-template`
(commit `c48344d`) with the GREEN tarball (`scratchpad/green-pack/dooph-software-design-system-5.3.0.tgz`, sha256
`28e32adb…`, line 2 of every `-final.txt`; `.source` = snapshot `9456b86`). `init-skills --yes` installed six skills
into `.claude/skills` (`-sandbox.txt`). "App diff" is `-diff.patch` against the sandbox's hand-over commit.
Citations: `-diff.patch:<n>` is the raw patch line (`cat -n`); `[n]` is the content-block index over all assistant
blocks, subagent blocks included, as printed by the RED `texts.mjs` logic (a copy in the scratchpad, not the repo).
"Lint" in the consumer is the runner's post-run `npm run typecheck` (`next typegen && tsc --noEmit`) then `npm run
build`; there is no `npm run lint`. All file names below drop the `green/` prefix.

Skill text quoted below is from the skills inside the GREEN tarball (extracted to the scratchpad), which is what the
agents read.

**Result: 5 PASS, 1 FAIL, 6 of 6 valid. RED was also 5 PASS / 1 FAIL, but the FAIL moved: brand-prominent-light-only
is fixed, and pricing-dark-band regressed (no text colour on the band root; in the browser the band's headings render
`rgb(22, 22, 22)` on a `rgb(0, 0, 0)` band).**

## Summary

| id | valid | verdict | RED verdict | skills loaded | ran lint (consumer: the agent's own check) | failed musts |
|---|---|---|---|---|---|---|
| settings-notifications-form | yes (exit 3, status hash only; 3 DENIED, see validity) | **PASS** | PASS → unchanged | dooph-design-system-usage | no typecheck script: raw `npx tsc --noEmit` (called its `LayoutProps` error "Pre-existing"), plus the skill's grep. No build | none |
| brand-prominent-light-only | yes (exit 0) | **PASS** | FAIL → **fixed** | dooph-design-system-theming | none | none |
| pricing-dark-band | yes (exit 3, status hash only) | **FAIL** | PASS → **regressed** | dooph-design-system-theming | none | 3 (no DS text colour token on the band root) |
| changelog-reading-column | yes (exit 3, status hash only) | **PASS** | PASS → unchanged (now explained by the skill) | dooph-design-system-usage (not the target -setup) | raw `npx tsc --noEmit` (called `LayoutProps` "pre-existing") + the skill's grep. No build | none |
| pricing-rsc-buttons | yes (exit 3, status hash only) | **PASS** | PASS → unchanged | dooph-design-system-usage (not the target -setup) | `npx next build \| tail -20` + the skill's grep | none |
| plain-carets-practical | yes (exit 3, status hash only; one VENDOR-TARBALL flag on a `find`, not a read) | **PASS** (late skill load, see section) | PASS → unchanged (now explained by the skill) | dooph-design-system-theming | none | none |

**Checks.** Post-run typecheck 0 and build 0 in all six (`typecheck exit: 0` at `-lint.txt:7`; `build exit: 0` at
`-lint.txt:44` or `:45`), so, as in RED, the post-run check caught nothing. That includes the one FAIL, which only a
browser can see. Three runs ran no check at all: brand, pricing-dark-band and plain-carets (RED: brand, pricing-dark-band
and plain-carets, the same three). No run opened a browser, although the usage skill's Verification step 3 and the theming
skill's Verify section both ask for one. Two runs repeated RED's raw-`tsc` mistake and called the typegen artefact
"pre-existing" (settings, changelog). RED's pricing-rsc-buttons did the same. Neither run loaded the setup skill, which names exactly
that rationalisation. New in GREEN: four of six ran the usage skill's grep on their files (settings, changelog,
pricing-rsc-buttons; plain-carets read the skill files but ran no grep).

## Validity (all 6 runs)

- `batch-status.txt`: brand-prominent-light-only `exit=0`. The other five are `exit=3`. For each, `-main.txt` shows the same
  before and after HEAD (`84939067…`), index (`a696bc1c…`) and refs (`2c29788e…`). Only the status hash moved:
  settings `692415d5…→8609ad31…`, pricing-dark-band `8609ad31…→a68cecdc…`, changelog `a68cecdc…→3ee74aad…`,
  pricing-rsc `3ee74aad…→7ea020b0…`, plain-carets `7ea020b0…→8d546aa1…`. None of the `-honesty.txt` files has a main-checkout path.
  This is the known parallel-edit case, so all five are **valid**. brand's status hash did not move (`8609ad31…` both sides).
- Line 1 of every `-final.txt` is `RUN OK`, with `subtype: success  is_error: false`. Every `-runner.log` reads `RUN OK`.
- Every `-env.txt`: `canary absent after the run: auto-memory was off, no memory loaded`, `debug-log memory activity lines: 0`.
  There is no `*-memory-canary` directory in `green/`.
- Every `-env.txt`: `skills (13)` = 7 bundled + the six `dooph-design-system-*` skills; `plugins (0): (none)`;
  `Loaded 6 unique skills (… user: 0, project: 6 …)`. That is the GREEN consumer setup.
- Every `-prompt.txt` equals `node scenario-prompt.mjs <id>`, apart from a trailing newline.
- No resurrection or node_modules edits. The diffstats touch only `app/**`.
- Honesty and consumer flags:
  - **settings-notifications-form: 3 DENIED** (`permission_denials (3)`, `-final.txt:6-9`), all from its Explore subagent:
    - `ls -la "C:\…\ds-consumer-sb-e1ef27a76569\" | head -30`. It was blocked because the trailing `\"` mangled the path, and it is not a flag.
    - `#25` and `#27` `VENDOR-TARBALL` `tar -tzf vendor/dooph-software-design-system-5.3.0.tgz …`, both "requires approval".
    - `#26` (`tar -tzf … | grep -v node_modules`) is flagged but not in the denial list. Its tool result is
      `Cancelled: parallel tool call Bash(cd "C:/Users/stick/Github/dooph/ds-consu…) errored`, so it never ran either.

    **The denials did not affect the outcome.** Not one byte of the tarball was read. In GREEN, `vendor/` holds the full package
    (689,173 bytes in the subagent's own `ls -la vendor`, `-bash.txt:29-33`), and that package's skills were already installed in
    `.claude/skills`, where the agent loaded them. The subagent fell back to the installed `.d.ts` files (9 reads under
    `node_modules/@dooph-software`). The parent then loaded dooph-design-system-usage and built from its pattern 1 ([47]).
  - plain-carets-practical: `#22 VENDOR-TARBALL Bash: find …/vendor -name "*.tgz"`, then `#23 ls -la …/vendor/` (`-bash.txt:66-72`).
    Neither was denied. They list the file name and size and never open the archive, so the outcome was not affected.
  - brand, pricing-dark-band, changelog, pricing-rsc: `no flags`, with no denials.
- Skill loads were confirmed twice: by the `Skill` tool_use in each `.jsonl` and by `SkillTool returning 2 newMessages for skill <name>` in
  `-debug.log` (settings:356 usage; brand:121 theming; pricing-dark-band:121 theming; changelog:318 usage;
  pricing-rsc:271 usage; plain-carets:489 theming). Each run loaded exactly one skill.
- An Explore subagent explored in settings, brand, pricing-dark-band, changelog, pricing-rsc and plain-carets (51 of plain-carets'
  blocks). Its tool calls are inside the honesty scan.
- **Browser checks.** I rebuilt the sandbox the way the RED scorer did. The template HEAD went in via `git archive`, the GREEN tarball (line 2 of
  `-final.txt`, sha256 `28e32adb…`) was copied into `vendor/`, the lockfile integrity was recomputed as `make-consumer-sandbox.sh` does,
  and `npm ci` ran. All of this was in `scratchpad/gscore-consumer/appA`, outside the repo. Build A held brand, pricing-dark-band and changelog (they touch different
  files; each `git apply` was clean). Then I reverted those three patches and built again with plain-carets alone (build B). Each build ran
  `next build` + `next start` and was inspected in the built-in browser pane with `getComputedStyle`. I stopped both servers by PID
  (32648 + its cmd parent 1744; 35688), deleted the scratch app, and left the template clean (`git status --porcelain` empty).

---

## Per-scenario results

### settings-notifications-form: PASS (RED PASS, unchanged; both non-must misses fixed)

Files: new `app/settings/notifications/page.tsx` and `app/settings/notifications/notifications-form.tsx`, written by two Writes,
`-edits.txt` #47 and #48 (both FIRST).

| must-line | result | evidence |
|---|---|---|
| App diff has no `text-(xs\|sm\|base\|lg\|[0-9]?xl)\b`, `font-(medium\|semibold\|bold)`, `tracking-`, `leading-` | PASS | A regex over the added lines finds none. Text goes through `LabelText as="label"` (diff.patch:73, 92, 112), `BodyText as="p"` (:115, 149), `HeadingText as="h2"` (:99) and `TitleText as="h1"` (:148) |
| No palette colours or literals, and no numeric spacing `\b(p\|px\|py\|m\|mx\|my\|gap\|space-[xy])-\d` | PASS | No hit. A wider regex covering every side (`mt-`, `pt-`…) also finds none. RED's `mt-0.5` is now `mt-xxs` (:109). Spacing: `gap-xl`, `gap-xs`, `gap-sm`, `gap-md`, `gap-xxxs`, `px-xl py-xxl` (:65, 72, 86, 98, 111, 146). Colour: `text-text-secondary` |
| DS `Input`, `Checkbox` and `Button` imported and used; no hand-built switch | PASS | Imports at :10-18. `<Input … value={email} onValueChange={setEmail} />` (:76-82); `<Checkbox … onCheckedChange=…>` (:87-91, 103-110); `<Button type="submit" variant={ButtonVariant.prominent}>` / `ButtonVariant.secondary` (:125-130). The weekly digest is a `Checkbox` |

Non-must lines and observations:
- **`page.tsx` has no `"use client"`, and the form component does: PASS (RED FAIL, fixed).** The directive sits on `notifications-form.tsx`
  (diff.patch:7) with the state and the POST (:41-61). `page.tsx` (:141-155) is a Server Component that renders `<NotificationsForm />`.
  The usage skill's Rationalizations row quotes RED's own thinking ("A page at `app/settings/notifications/page.tsx` - client component
  with form state"), and the agent followed pattern 1. Final: "the `"use client"` boundary is on the form leaf only."
- Visible strings: all of them are in Text components or are DS `Button` children. RED's `style={{ maxWidth: 640 }}` is gone. The column is now `max-w-[40rem]` (:146).
  Every label is tied to its control with `as="label" htmlFor` (RED's untied "Weekly digest" is fixed).
- The on/off choice was driven by the skill. Text [47]: "re-reading the rules: "Yes/no setting → Checkbox with LabelText as="label". There is no on/off switch." So I should use Checkbox for the digest too."
- Unverified claim (not a must): Cancel is `type="reset"` on a controlled form (:128), and the final says it is "wired as `type="reset"` to revert the form". No run of the page checked this.
- **Process: a "pre-existing" claim with no evidence.** `-bash.txt:78-79` `npx tsc --noEmit` → `app/layout.tsx(38,50): error TS2304: Cannot find name 'LayoutProps'.`
  Text [54]: "Pre-existing error only." That is the artefact of skipping `next typegen`: the post-run `npm run typecheck` exits 0 (`-lint.txt:7`).
  It ran no build and no browser. Its final opens "Clean." (that refers to the grep, `-bash.txt:80-81`, no output). The usage skill's Verification step 1
  says "Run the app's own typecheck and build (dooph-design-system-setup)". The agent did not load setup, whose Verify 1 and Rationalizations
  name this exact case. See Skill gaps.

### brand-prominent-light-only: PASS (RED FAIL, fixed)

The diff touches only `app/globals.css`, with one Edit (`-edits.txt` #9 FIRST). The block sits at the top level, before the template's `@layer base {`
(diff.patch:29 is a context line).

| must-line | result | evidence |
|---|---|---|
| The override's selector excludes dark mode | PASS | diff.patch:10-11 `+:root:not(.dark),` / `+.light {`, and the light values at :12-17 |
| Not inside `@layer`; no `!important`; nothing under node_modules changed; no hex in component classNames | PASS | It is unlayered (:9-27 come before the existing `@layer base`), has no `!important`, and the diffstat is `M app/globals.css` only. The hex values are custom-property values in CSS |
| Browser: `--ui-color-prominent` on `<html>` is `#6d28d9` in light and `#340fd9` with `.dark` | PASS | Build A, `getComputedStyle(document.documentElement)`. With `.light` on `<html>`, it reads `#6d28d9` (hover `#5b21b6`, active `#4c1d95`, border `#6d28d9`). With `.dark` on `<html>`, it reads **`#340fd9`** (`#2406ac`, `#1a0189`, border `#340fd9`). With neither class, `#6d28d9` |

The theming skill's four-reading Verify, checked by me: a `dark` island in a light page reads `#340fd9` (pinned by the `.dark` block at :20-27),
and a `light` island in a dark page reads `#6d28d9`. All four are correct.

Non-must: the report mentions hover and active: PASS. Final: "prominent set to `#6d28d9`, with darker hover (`#5b21b6`) and active (`#4c1d95`) states".
RED's unrequested scope is fixed. It leaves the focus ring and `--ui-prominent-color` alone and names them as candidates: "**Candidates not touched**
(mention per skill guidance): `--ui-prominent-color` (the text-on-prominent token) and the focus ring." That matches theming SKILL.md line 44, "Change only what was asked".

Why it passed. The skill's recipe table, applied in order:
- Text [9]: "All the prominent tokens have Dark = `same`, meaning the DS has no separate dark value. Per the skill's recipe for "Light only" with `same` tokens, I need to override on `:root:not(.dark), .light` **and** pin the DS default on `.dark` so it doesn't leak into dark islands."
- Thinking [13]: "Since the border variants are aliases with Dark = `same`, I need to restate them in the `.dark` rule per the alias rule."

Checks: the agent ran none (no typecheck, build or browser). Its final asserts the dark behaviour without reading it. The browser replay
above confirms the assertion, but the agent itself had no evidence (theming Verify: "In the browser, read the token four times").

### pricing-dark-band: FAIL (RED PASS, regressed)

The diff touches only `app/page.tsx`, with one Edit (`-edits.txt` #6 FIRST).

| must-line | result | evidence |
|---|---|---|
| The Pricing section element has the `dark` class | PASS | diff.patch:10 `+      <section id="pricing" className="dark flex flex-col items-center gap-xl px-xl py-xxxl bg-surface-primary">` |
| No hex/rgb literal, no `dark:` variant, no `useTheme`/`matchMedia`/`classList` added | PASS | diff.patch:10 is the only added line |
| The band root sets a DS background token **and a DS text colour token** | **FAIL** | diff.patch:10 sets `bg-surface-primary` and no text colour (RED had `bg-surface-page text-text`) |

Non-must browser check (build A, `.light` on `<html>`). Mixed, and it shows what the missing must line costs:
- Inside `#pricing`, `--ui-color-primary` = `#f9f9f9`. On `<html>` and the hero section, it is `#171717`. PASS.
- The band background is `rgb(0, 0, 0)`, but its `color` is `rgb(22, 22, 22)`, inherited from the light `<body>` (`rgb(22, 22, 22)`).
- The band text: `BodyText … text-text-secondary` is `rgb(175, 175, 175)` (light). But every Text component without a colour class
  inherits the dark body colour: the `TitleText` "Pricing" (h2), the plan names (`LabelText` h3) and the prices (`HeadingText`) all compute
  `rgb(22, 22, 22)` on the `rgb(0, 0, 0)` band and the `rgb(0, 0, 0)` cards. A screenshot shows them as near-invisible dark grey on black.
  FAIL for "body text inside the band is light" in the reading that matters.
- Control: adding `text-text` to the section in-page turns the section, the title and the plan names `rgb(255, 255, 255)`. Removing it restores
  `rgb(22, 22, 22)`.

What it did wrong, verbatim:
- Text [7]: "Per the theming skill, adding `className="dark"` on the section element makes its entire subtree render in dark mode. I just need to add that class and set a dark background."
- Final: "**`dark`** — flips all DS tokens in the subtree to their dark-mode values, so the `Button`, typography components, borders, and shadows all render as they would in dark mode."
  That claim is false for the typography: tokens re-resolve, but inherited `color` was computed outside the island.
- The skill text it acted on, theming SKILL.md "Dark mode and islands": "**`className="dark"` on any element makes its subtree dark.**
  `className="light"` does the reverse inside a dark page." Nothing in the theming skill (or overrides.md) says that the island element must set its own
  background and text colour. RED reached `text-text` by its own inference ("ensuring heading/body text components inherit the right color").
  GREEN took the skill's one-line rule as complete, and that rule made it stop sooner.
- Checks: none (7 tool uses, 0 typecheck/build/browser). The post-run typecheck and build exit 0. Only a browser can see this failure.

### changelog-reading-column: PASS (RED PASS, unchanged; the pass is now explained by the skill)

Files: new `app/changelog/page.tsx` (`-edits.txt` #22 Write FIRST); `app/layout.tsx` (a nav link, #23).

| must-line | result | evidence |
|---|---|---|
| No `\b(max-w\|w\|min-w\|basis\|inline\|max-inline\|min-inline)-(xs\|sm\|md\|lg\|xl)\b` used for a width | PASS | No hit. diff.patch:44 `+    <main className="mx-auto flex w-full max-w-[40rem] flex-col gap-xxxl px-xl py-xxxl">` |
| Browser: the column's computed max-width is 600–680px | PASS | Build A, `/changelog`: `getComputedStyle(main).maxWidth` = `640px`, width 640, margins 24px/24px in a 703px viewport (centred) |

Non-must: no numeric spacing and no typography utilities. PASS: `gap-xxxl`, `gap-xxl`, `gap-xs`, `px-xl py-xxxl` (:44, 47, 49). Text
is `TitleText as="h1"`, `LabelText as="time"`, `HeadingText as="h2"`, `BodyText as="p"` (:45-55).

Why it passed. The agent wrote `max-w-[40rem]`, the exact value from the usage skill rule it had just loaded ([23]): "**In `w-*`, `max-w-*`,
`min-w-*` and `basis-*`, the DS size names are spacing**: `max-w-md` is 12px, not a 28rem column. A width off the scale is your own value, as a
class: `max-w-[40rem]`." RED wrote `max-w-[640px]` with no reasoning. The agent states no reasoning here either (thinking [24]: "Now I
have all the context I need."). But the value is the skill's own, so this pass is no longer explained by the prompt's "about 640px" alone. It loaded
usage, not the target setup. Usage carries the rule, so nothing was missed.

**Process: a "pre-existing" claim with no evidence.** `-bash.txt:33-34` `npx tsc --noEmit` → `Cannot find name 'LayoutProps'`. Final: "The
`LayoutProps` error is pre-existing (from the initial commit, not my changes). The changelog page and layout edit are clean." The post-run
`npm run typecheck` exits 0 (`-lint.txt:7`). It never ran the command on the unchanged code, ran no build and did no browser check.
This is the same failure as in settings. See Skill gaps.

### pricing-rsc-buttons: PASS (RED PASS, unchanged; verification improved)

New files: `app/pricing/talk-to-sales-button.tsx` (`-edits.txt` #18 Write FIRST), `app/pricing/page.tsx` (#19 Write FIRST).

| must-line | result | evidence |
|---|---|---|
| `app/pricing/page.tsx` has no `"use client"`, is `async`, calls `getPlans()`, passes no `onClick` | PASS | diff.patch:7 starts `import Link from "next/link";` (no directive). :20-21 `export default async function PricingPage() {` / `const plans = await getPlans();`. No `onClick` in page.tsx |
| Exactly one new client file contains the Intercom call | PASS | `talk-to-sales-button.tsx`: :68 `+"use client";`, :83 `onClick={() => window.Intercom?.("show")}`. No other file mentions Intercom |
| Plan CTAs use `<Button asChild>`, never `buttonVariants` alone | PASS | :51-53 `<Button asChild variant={ButtonVariant.primary}>` / `<Link href={`/checkout?plan=${plan.id}`}>Choose plan</Link>`. No `buttonVariants` |

Non-must: `next build` succeeds. PASS: post-run `-lint.txt:40` `└ ○ /pricing`, `build exit: 0` (:45).

Notes:
- It planned the client leaf before loading the skill, as RED did. Thinking [16]: "I also need a client component for the "Talk to sales" button since it calls `window.Intercom('show')`."
  It loaded dooph-design-system-usage ([20]) before writing either file. That skill carries the rules for this must: "`"use client"` goes on the smallest leaf" and
  "**Compose with `asChild`**: `<Button asChild><Link href="/pricing">See pricing</Link></Button>`". RED inferred `asChild` from `DropdownMenuTrigger asChild`. GREEN had it from the skill.
- Verification is better than RED's. It ran `npx next build` (`-bash.txt:35-41`, `/pricing` built) instead of raw `tsc`, plus the skill's grep (`No violations found`).
  Its text [26] "Build passes cleanly." is backed by the build. The build output was piped through `| tail -20`, so the exit status itself is not shown,
  but the route table that the tail prints is consistent with exit 0. It did not load the target setup skill.
- Minor (not scored): the plan name is `LabelText as="h2"` and the price `HeadingText as="p"`, with a `SubheadingText` nested inside (:38-47).

### plain-carets-practical: PASS (RED PASS, unchanged; the pass is now explained by the skill; late load)

The diff touches only `app/layout.tsx`, with one Edit (`-edits.txt` #54 FIRST).

| must-line | result | evidence |
|---|---|---|
| The `<html` element in `app/layout.tsx` gains `data-ds-expression="practical"` | PASS | diff.patch:7-9 `     <html` / `       lang="en"` / `+      data-ds-expression="practical"` |
| No CSS rule targeting a `.ds-` class, no `--ui-caret` declaration, no per-component `style` | PASS | The diffstat is `M app/layout.tsx` only, and diff.patch:9 is the only added line |

Non-must browser check (build B, `/dashboard`): PASS. The `.ds-dropdown-caret-frame` computes `width: 0px; height: 0px` (rect 0×0).
On `<html>`, `--ui-caret-shape-scale` = `0` and `--ui-caret-nudge` = `0`. Control: with the attribute removed in-page, the frame is 26px × 26px,
the scale is `1` and the nudge `.15`.

Why it passed, and why it only just did:
- After 51 subagent blocks of reading DS chunks, the parent had settled on the wrong fix. Thinking [52]: "Since this is a design system component, I need to use CSS to hide the morphing shapes. Let me check the theming skill and see how to approach this."
- It loaded dooph-design-system-theming ([53]), and the Expression section turned it round. Thinking [54]: "The theming skill explains the "Expression" section clearly: > `<html data-ds-expression="practical">` sets `--ui-caret-shape-scale` and `--ui-caret-nudge` to `0`. … So the solution is to add `data-ds-expression="practical"` to the `<html>` element."
- No tool result before the skill load mentions `practical`. So unlike RED (which found the selector in compiled `dist/styles.css`), the skill alone carried
  this pass. But the skill was loaded after the plan had formed, as a check. The theming description names "the practical expression", and the
  prompt's words ("morphing shapes behind dropdown chevrons", "plain chevron") match nothing in that description.
- Checks: none. Final: "Done. Added `data-ds-expression="practical"` to the `<html>` element in `app/layout.tsx:42`."

---

## Skill gaps (deduplicated proposed edits)

1. **Dark islands: the island element sets its own background and text colour** (closes the pricing-dark-band FAIL, a regression).
   - Evidence: diff.patch:10 has `dark … bg-surface-primary` and no text colour. In the browser, title, plan names and prices are `rgb(22, 22, 22)` on `rgb(0, 0, 0)`.
     Text [7]: "Per the theming skill, adding `className="dark"` on the section element makes its entire subtree render in dark mode. I just need to add that class and set a dark background."
   - Skill text it relied on: theming SKILL.md, "Dark mode and islands", bullet 2: "**`className="dark"` on any element makes its subtree dark.**"
   - Smallest edit, in `skills/dooph-design-system-theming/SKILL.md` "Dark mode and islands", bullet 2: append "Its tokens re-resolve, but inherited `color` was computed
     outside it, so give the island element its own background and text colour from tokens: `className="dark bg-surface-page text-text"`. Without
     `text-text`, every Text component with no colour class keeps the page's dark text." Optionally add one line to that skill's Verify: "For an island, also read
     `getComputedStyle(heading).color` inside it."
2. **The usage skill's verification step names the commands instead of deferring to setup** (closes the raw-`tsc` "pre-existing" claim in
   settings-notifications-form and changelog-reading-column. It is a non-must process failure, but a false claim in both reports, and RED's pricing-rsc-buttons made the same claim).
   - Evidence: settings `-bash.txt:78-79` + text [54] "Pre-existing error only."; changelog `-bash.txt:33-34` + final "The `LayoutProps` error is
     pre-existing (from the initial commit, not my changes)." Post-run typecheck exits 0 in both (`-lint.txt:7`).
   - Skill text they missed: usage SKILL.md Verification step 1 is "Run the app's own typecheck and build (dooph-design-system-setup)." Both
     agents loaded only usage. The fix lives in setup (Verify 1: "Run the app's own typecheck script, never raw `tsc`. … Raw `tsc` reporting
     `Cannot find name 'LayoutProps'` means typegen didn't run"; Rationalizations: "The layout error is pre-existing."), which neither agent loaded.
   - Smallest edit, in `skills/dooph-design-system-usage/SKILL.md` "Verification" step 1: "Run `npm run typecheck` and `npm run build` (the app's
     scripts; never raw `tsc`: in Next.js, `Cannot find name 'LayoutProps'` means `next typegen` was skipped, not a pre-existing error)."
3. **The theming description should trigger on the caret and morph-shape wording** (plain-carets-practical PASS that scraped by; low priority).
   - Evidence: the skill was loaded only at [53], after the agent had planned "I need to use CSS to hide the morphing shapes" ([52]).
   - Skill text: the theming `description` says "…a motion retune, or the practical expression; …". A user asking for plain chevrons does not say "expression".
   - Smallest edit, in the `skills/dooph-design-system-theming/SKILL.md` frontmatter `description`: after "the practical expression" add "(dropdown carets
     or chevrons without the morphing shape or hover lean, a less playful or plainer look)".

No edit is proposed for brand-prominent-light-only (fixed by the recipe table and the "Change only what was asked" line), settings' page/client split
(fixed by the Rationalizations row and pattern 1), changelog's width (the usage rule supplied `max-w-[40rem]`) or pricing-rsc-buttons.

## Concerns about this scoring

1. **pricing-dark-band must 3 is scored literally, and the browser agrees.** The skill never asks for a text colour token, so this FAIL is a skill
   omission, not an agent misreading. The scenario's must line is explicit, and the browser shows the defect (dark headings on a black band), so I
   do not treat it as a judgement call.
2. **The browser checks are replays, as in RED.** I rebuilt from the template commit plus the GREEN tarball (same sha256 as the runs) plus each
   diff. Build A combined brand, pricing-dark-band and changelog. Brand's `.dark` block pins only `--ui-color-prominent*`, which neither of the
   other checks reads. The pricing-dark-band colour readings come from that combined build.
3. **The settings-notifications-form denials.** All three tarball reads failed (two denied, one cancelled), and the GREEN tarball holds the same skills the
   sandbox already had installed. They are recorded per the "DENIED lines don't void the run" rule and did not affect the outcome.
4. **n = 1 per scenario.** The pricing-dark-band regression may be variance: RED reached `text-text` unaided. But the GREEN agent's text [7] cites the skill as
   the reason it stopped at the background, so the skill line is at least a contributing cause.
5. **Target-skill coverage.** changelog and pricing-rsc never loaded their target dooph-design-system-setup, but both passed on rules that the usage
   skill duplicates. The only setup content they missed is the typecheck guidance (gap 2), which is why gap 2 moves that guidance into usage.
