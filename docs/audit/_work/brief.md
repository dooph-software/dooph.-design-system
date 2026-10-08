# Unit reviewer brief — read in full before starting

Repo: `C:\Users\stick\Github\dooph\dooph-Design-System` (Windows; Git Bash + PowerShell available).
Audited commit: `b436647c5b5713bdadceef3b5def90b0ad5357f1` (short `b436647`). All `path:line` refs are @ this SHA.
Built copy (same SHA, `npm ci && npm run build` already run, dist/ present, node_modules present): `C:\Users\stick\Github\dooph\dooph-ds-audit-build`. You may READ its `dist/` and run read-only commands there (e.g. `npx tsc --noEmit -p <tmp tsconfig>`), but do not modify tracked files in either checkout. Copies of `dist/index.d.ts`, `dist/styles.css`, `dist/theme.css` are also in `docs/audit/_work/`.

## Hard constraints

- READ-ONLY. The only place you may create or modify files is `docs/audit/_work/` (your output file; scratch scripts may go in `docs/audit/_work/scratch/<your unit>/`). Never edit `src/`, `scripts/`, `skills/`, `.agents/`, `.claude/`, docs, configs — not even a typo. Typos are findings.
- Never commit, stage, push. Never `npm install`. Never run `npm run build` in the main repo (it regenerates tracked files).
- Evidence or it didn't happen: every finding cites `path:line` AND quotes the offending lines, or gives a command plus its output. "It seems like", "may want to consider", "generally" are not findings.
- Read `docs/audit/_work/rulebook.md` in full — it is the measuring stick. Also read `AGENTS.md` (File contracts). Do not invent new rules and grade against them. General-engineering findings are allowed but carry `rules: []` and must argue the cost in `impact`.
- Header contracts (block comment with `## behavior` / `## constraints` at file top) are INTENT. Read a file's header before judging that file. If your recommendation contradicts a constraint, say so in the `contract:` field as `conflicts` — the maintainer decides; don't recommend editing around it.
- Descriptive text (codebase skill, consumer skills, README, CHANGELOG, comments, header `## behavior`) = hypotheses to verify against code. Where code and a descriptive claim disagree that is a finding; say whether the doc or the code is wrong and why.

## What counts as a finding (audit §4)

"Spaghetti" here means concretely:
- **Competing patterns.** One concern implemented several ways across components: ref typing, `displayName`, where variant consts live, `"use client"` placement, cva vs hand-built class strings, `cn()` merge order, whether a consumer's `style` is merged or clobbered, `asChild` handling, controlled/uncontrolled naming, context shapes, disabled/focus helpers, typography application, barrel shape.
- **Logic in the wrong layer.** JS doing CSS's job. Timing, easing, or theme decided in components (Rules 5, 6). Token system bypassed with hex values, arbitrary Tailwind values, or raw `var(--ui-*)` in `className`. Components reaching outside their own subtree (Rule 7).
- **Tangled dependencies.** Deep imports into a sibling's internals, barrel bypasses, circular imports, internal helpers leaked into the public surface or public things missing from it.
- **Vestigial code.** Unused exports, files, CSS classes, tokens, props that do nothing, stale aliases, commented-out code, leftover compatibility layers.
- **Duplication.** Copy-pasted logic or CSS across components; parallel helpers doing the same thing under different names.
- **Generated drift.** (Baseline: a full build reproduced every generated file byte-identically — no drift found. Hand edits inside generated regions still count.)
- **Truth drift.** Docs, skills, header contracts, or comments that no longer describe the code, especially anything that ships to consumers.
- **Type escape hatches.** `any`, `as unknown as`, `@ts-ignore`/`@ts-expect-error`, non-null assertions, unions the runtime guard doesn't match.
- **Mixed-responsibility files.** Size alone isn't a finding; a file doing several unrelated jobs is.

NOT findings:
- Essential complexity (geometry and morph math: `MorphRotationShape/engine`, wave geometry, rolling-digits model). Flag only accidental complexity you can point to.
- Deliberate decisions recorded in a header contract, `AGENTS.md`, or a design spec — challengeable only as a decision item (put `contract: … → conflicts` and say why the constraint is wrong).
- Plans for work that doesn't exist yet (e.g. chart design docs) — only their placement can be a repo-hygiene finding.
- Style preferences no rule covers with no nameable maintainability cost.

Anti-busywork:
- One pattern = one finding (14 components with the same defect → one finding, 14 locations).
- Batch S4 nits: one finding per category.
- Every recommendation names the cost it removes (bug class, count of duplicates, misleading doc, consumer confusion, trap for next agent). Can't name one → drop it.
- No new abstraction unless it removes ≥2 real duplicates or a demonstrated bug class.
- Don't propose standing infrastructure (linter, test framework, CI job) as a blanket improvement.
- "Reviewed, clean" is a result. Don't pad.
- Don't reward effort/volume.

Severity:
| S1 | Ships broken or misleading to consumers: an export, prop, or token that is documented or typed but does nothing or doesn't exist; a packaging/build/RSC-boundary defect; a runtime failure path; a shipped skill that tells consumers to write code that doesn't compile or doesn't work. |
| S2 | A violation of a stated rule, or an inconsistency that will make the next reasonable edit go wrong: competing patterns, a false header contract, generated drift, a vendored skill template that teaches a banned pattern to agents in this repo. |
| S3 | Maintainability debt with a concrete cost: duplication, dead code, logic in the wrong layer, a mixed-responsibility file, stale internal docs. |
| S4 | Cosmetic. Batched. |

## Output file format — `docs/audit/_work/units/<UNIT>.md`

Write to disk AS YOU GO (append per file reviewed) — your context may be compacted. Sections, in order:

### 1. Findings
Provisional IDs `<UNIT>-F<n>`. Keep this exact field order:

```markdown
### U4-F3: <the defect, stated as a fact>
- severity: S2
- category: inconsistency   # rule-violation | inconsistency | dead-code | duplication | wrong-layer | coupling | type-safety | api-design | naming | doc-drift | contract-drift | generated-drift | build-packaging | stories | repo-hygiene | rulebook-conflict
- rules: [R1.4, R2.1]       # [] = general engineering; then `impact` must carry the argument
- scope: consumer-visible   # consumer-visible | internal | tooling | docs
- confidence: plausible     # ALWAYS plausible at this stage; verification happens later
- verified_by: "<command + result summary, or the method>"
- locations:
  - src/components/X/X.tsx:12-18
- evidence: |
    X.tsx:12  <quoted line>
    (≤6 quoted lines per location; for many locations use a table: path:line | snippet)
- impact: <who is hurt (consumer / maintainer / next agent), how, under what conditions>
- recommendation: <direction only>
- breaking: none            # none | minor | major  (major = a consumer's code or CSS must change)
- contract: n/a             # or: <path> "<quoted constraint>" → consistent | conflicts
- remediation: tbd
- related: []
```

### 2. File ledger
One row per file in your scope: `path | lines read (e.g. 1-141 = all) | status | finding IDs`. Status: `reviewed-clean` or `findings` (Icons leaves may be `pattern-verified`; svgs `generated-verified`/`pattern-verified` with the script named; docs `claims-checked`). No file in scope may be missing.

### 3. Fingerprints (component units only)
One row per EXPORTED component (every forwardRef/function component re-exported from the folder index). Facts only; quote a line when a value is unusual. Columns:
`component | file | "use client" (present? needed? which hook/API forces it) | forwardRef | ref type helper (ComponentRef / ElementRef / HTML*Element / none) | displayName (set? matches?) | props type (name, exported?, interface/type, base type extended) | className merge (cn(base, className)? order) | style handling (merged / clobbered / n/a) | ...props target | asChild | variant/size consts (name, file, key casing, derived type?) | cva? | controlled/uncontrolled API names | state styling (data-attrs / JS classes) | disabled helper | focus helper | typography (text-style-* / BaseText / raw utilities) | token access (utilities / ds-* / raw var() / arbitrary values / hex) | motion (CSS tokens / JS timing) | outside-subtree access | header contract (present / accurate?) | story file (present / conventions ok?) | folder index.ts shape`

"style handling": `clobbered` = component sets `style={…}` and a consumer's `style` passed in props is lost (e.g. `{...props}` spread BEFORE `style=`, or `style` destructured and discarded) OR consumer style overrides the component's needed style (spread AFTER). Say which.

### 4. Claim results
Every present-tense claim in (a) the header contracts in your scope (`## behavior` AND `## constraints` factual parts) and (b) the sections of `.agents/skills/dooph-ds-codebase/SKILL.md` that describe your scope (and any other doc named in your unit prompt). One row each: `claim-src path:line | claim (short quote) | TRUE / FALSE / STALE / UNVERIFIABLE | evidence path:line or command`.

### 5. Stories check
Against contrib story rules (R8.22, R9.13, R9.23, R9.24): stories use variant consts not string literals; use DS components rather than raw `<button>`/`<div>` where a DS component exists; at least one story contradicts each override prop's default (so a dead prop would be visible). Findings go in section 1; summarize per story file here.

## Method notes
- Read every file in scope IN FULL with the Read tool (use offset/limit chunks for big files). No sampling; don't rely on grep excerpts for judgement (grep is fine for cross-referencing).
- Cross-reference beyond your scope freely (e.g. to see if a CSS class your component uses exists in `src/styles/*.css`, or who imports a helper) — `rg`/`grep` across the repo.
- For a CSS class used in a component, confirm it exists: generated utilities in `docs/audit/_work/dist-styles.css`; `ds-*`/`text-style-*` in `src/styles/*.css`.
- For "is this export used?": grep `src/` (excluding the defining file) AND check whether it's re-exported from `src/index.ts` (public = used by definition, but then check consumer docs mention).
- When done, end your output file with a line `## DONE` and return a ≤15-line summary (counts by severity, top 3 findings) as your final message.
