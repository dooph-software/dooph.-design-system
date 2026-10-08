# Composer brief — write final findings + draft work items for your area

Read-only audit of `C:\Users\stick\Github\dooph\dooph-Design-System` at commit `b436647c5b5713bdadceef3b5def90b0ad5357f1` (short `b436647`). Today: 2026-10-01. You write ONLY under `docs/audit/_work/final/` (and scratch under `docs/audit/_work/scratch/<your id>/`). Never edit src/, skills, docs, configs; never commit; never npm install; never `npm run build` in the repo. A built copy (dist/ + node_modules) is at `C:\Users\stick\Github\dooph\dooph-ds-audit-build` (read/execute only; never write there).

## Inputs (authoritative)
- `docs/audit/_work/fid-map.psv` — pipe-separated: `fid|key|sev|cat|scope|members|verify|route|breaking|title`. This FIXES each finding's final F-ID, severity, category, scope, title and member list. Do not change severity/category; if you believe one is wrong, keep it and add a line `- note-to-orchestrator: …` at the end of the block.
- `docs/audit/_work/member-fid.psv` — `member|fid` lookup (unit/horizontal finding ID → final F-ID). Use it to rewrite `related:` to final F-IDs.
- Member finding blocks: `docs/audit/_work/units/U#.md` (`### U#-F#:`) and `docs/audit/_work/horizontal/{HA,HC,H2-matrix}.md` (`### HA-F#`, `### HC-F#`, `### HB-F#`). `V5-new` = the new finding described in `docs/audit/_work/verify/V5.md` (alias tokens not re-declared in `.dark`).
- Verifier verdicts: `docs/audit/_work/verify/V1.md … V8.md` (blocks titled by cluster key, e.g. `### M4 (…)`, `### HC-F1 …`). The `verify` column says which file. APPLY every verifier correction (counts, mechanisms, line numbers, refuted sub-claims). Refuted sub-claims are dropped from the finding text.
- `docs/audit/_work/rulebook.md` (R-IDs), `AGENTS.md`, `docs/audit/_work/horizontal/claims-register.md` (C-IDs; cite FALSE/STALE claim IDs in doc-drift findings' evidence where relevant).

## Output A — `docs/audit/_work/final/F-<your id>.md`
One block per assigned F-ID, in F-ID order, in EXACTLY this field order (this is the audit's required schema):

```markdown
### F-042: <the defect, stated as a fact — use the map title, tightened if needed>
- severity: S2
- category: inconsistency
- rules: [R1.4, R2.1]       # [] = general engineering; then impact must carry the argument
- scope: consumer-visible
- confidence: confirmed     # confirmed = verify column names a V-file whose block verdict is CONFIRMED/PARTIAL/DOWNGRADE (it survived refutation); else plausible: <why it was not adversarially verified — e.g. "S3 outside the 29% Phase-4 sample; facts re-checked by <unit> and <horizontal pass>">
- verified_by: "<unit method; verifier method + key output>"   # ≤3 lines
- locations:
  - src/components/X/X.tsx:12-18
- evidence: |
    X.tsx:12  <quoted line, verbatim from the file @ b436647>
    (≤6 quoted lines per location; for many locations use a table: path:line | snippet)
- impact: <who is hurt (consumer / maintainer / next agent), how, under what conditions>
- recommendation: <direction only; exact steps live in the WI>
- breaking: none
- contract: n/a             # or: <path> "<quoted constraint>" → consistent | conflicts
- remediation: [WI-<your id>-01]   # or: decision D-07 (+ blocked WI id) | no-action: <reason>
- related: [F-013]
```
Rules: every location is `path:line` valid AT b436647 — re-open the file and confirm the line numbers and quotes yourself (unit line refs sometimes drift by 1–3 lines). Quote verbatim. Union the members' locations; drop duplicates. Contract field: if any location file opens with a `## behavior`/`## constraints` header, read it and state whether the recommendation is consistent or conflicts (quote the constraint). If it conflicts, the remediation must be a decision item, never a WI.

## Output B — `docs/audit/_work/final/WI-<your id>.md`
Draft the work items that remediate your findings. A WI may address several findings (group by file to minimise churn); every WI addresses ≥1 finding; every S1–S3 finding of yours maps to a WI, a decision, or a justified `no-action`. Template (keep field order):

````markdown
### WI-<your id>-01: <imperative title>
- status: todo              # todo | blocked(D-03)
- addresses: [F-042, F-043]
- depends_on: []            # other WI ids (yours or "WI-<other id>-nn" if you know one), else []
- phase: P1                 # P1 no-behaviour-change cleanup | P2 internal restructuring | P3 consumer-visible non-breaking | P4 breaking (ships only in the next MAJOR; always depends on the release WI and D-01)
- risk: low — <what could regress>
- semver: none              # none | patch | minor | major
- files:
  - modify: `src/components/X/X.tsx:12-18 @ b436647`
- anchor:
  ```tsx
  <the current lines, verbatim @ b436647>
  ```
- why: <1–2 sentences tying back to the findings' impact>
- steps:
  - [ ] 1. <action> — before/after code block for mechanical changes; for changes > ~40 lines give the exact target shape (signatures, names, file layout) plus a per-file edit list
  - [ ] 2. <update the header contract / .agents/skills/dooph-ds-codebase / skills/** consumer skill / CHANGELOG.md [Unreleased] IF this change makes any of them false — name the exact lines>
  - [ ] 3. Verify: `npm run lint` → exit 0; `<rg assertion>` → <expected>; build in a scratch worktree + `git status --porcelain` empty (generated drift); a named Storybook story + what to observe; or a getComputedStyle check. For a behavioural bug, step 1 is a reproduction that fails before the fix (e.g. a react-dom/server render script, a tsc probe, or a story that shows the defect).
  - [ ] 4. CHECKPOINT — stop; summarise the diff; the maintainer commits.
- done_when: <mechanically checkable assertion(s)>
- log:
  - 2026-10-01 — created by audit
````
Hard rules for WIs: no commit steps; no placeholders ("TBD", "similar to WI-x", "clean up X", unanchored edits); never hand-edit generated files (`src/components/Icons/index.ts`, the `__GENERATED_THEME_*__` block in `src/styles/index.css`, `src/styles/theme.css`, the generated `--ui-shape-morph-ease` value) — change the generator/source and run `npm run sync-tokens` / the generator; run `npm run sync-tokens` after token changes; no test framework (no jest/vitest) — verification uses lint, worktree builds, rg assertions, react-dom/server render scripts with node, Storybook stories and getComputedStyle; no new abstraction unless it removes ≥2 real duplicates or a demonstrated bug class; renames/removals of public API are P4 (major) and must name the migration-skill WI as a dependency (`WI-RELEASE-MIGRATION`, authored by the orchestrator). Follow the repo's established practice for renames/removals: no deprecation shims (the repo removes and documents in a vN-migration skill).

## Decision items (owned by the orchestrator; reference by number)
D-01 next release is a MAJOR (6.0.0) with a v6 migration skill, vs 5.4.0 · D-02 theme.css spacing-vs-container collision fix strategy · D-03 whether hover/state colour transitions need --ui-* motion tokens or a documented carve-out · D-04 LoadingSpinner timing: move to CSS per Rule 6 vs amend the loading-indicators skill · D-05 "use client" policy (R8.21 trigger list; hook-free Radix wrappers) · D-06 one colour-prop mechanism (utils/color.ts) and whether R1.4 permits its name lookup · D-07 intended dark-mode danger Sticker look · D-08 extend arch:122's prop-name exception list vs rename props · D-09 rule-text conflicts RC-2 / RC-3 / RC-5 · D-10 one skill-mirroring mechanism · D-11 keep, quarantine or remove the vendored radix-ui-design-system skill · D-12 discriminated-union guard policy (tighten types; Calendar invalid value: throw vs render nothing) · D-13 one callback / force-active boolean naming convention (breaking) · D-14 const/type identifier alignment (rename types vs amend R1.9 + fix arch example) · D-15 remove undocumented internals from the public surface in the major vs document them · D-16 naming vocabulary (size keys, iconSm collision, *Types → *Variant) · D-17 record the conventions the rulebook is silent on (class-resolution mechanism, style precedence, className target, invariant form) · D-18 orphan test: add a `node --test` script vs delete it · D-19 figma-variable-jsons: refresh, delete, or keep as historical.
A finding routed `D` or `D+WI` in the map: write `remediation: decision D-xx` (and the blocked WI id if you draft one). Draft a `blocked(D-xx)` WI for the RECOMMENDED option where the steps are knowable now.

When both files are complete, end each with `## DONE` and return a ≤12-line summary (F-IDs written, WI count by phase, any note-to-orchestrator).
