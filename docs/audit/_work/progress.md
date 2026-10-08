# STATUS: AUDIT COMPLETE (2026-10-02) — nothing in flight; all agents finished.
# Deliverables: docs/audit/SUMMARY.md, FINDINGS.md, REMEDIATION.md. self-check.mjs 0 FAIL/20; fidelity-check.mjs: 89% evidence quotes exact-line, ~95% anchor lines verbatim (misses = multi-line/paraphrase/label formatting, sampled).
# REMEDIATION.md is now the LIVE spine: edit it directly. Do NOT re-run assemble-*.mjs after anyone edits FINDINGS/REMEDIATION by hand — they rebuild from _work sources and would overwrite those edits.
# Everything below is the historical run log; TODO lines in it are superseded.

# Audit progress tracker (orchestrator notes — survives compaction)

SHA b436647c5b5713bdadceef3b5def90b0ad5357f1 · date 2026-09-29 · worktree ../dooph-ds-audit-build (REMOVE at end: `git worktree remove ../dooph-ds-audit-build --force` from repo root; also delete ../ds-audit-*.log/txt)

## Phase status
- [x] Phase 0 baseline → _work/baseline.md (lint 0, build 0, no gen drift, storybook 0, pack 2519 files)
- [x] Skills loaded (dispatching-parallel-agents, writing-plans, verification-before-completion, 6 repo skills read in full)
- [x] Phase 1 rulebook → _work/rulebook.md (R1–R13 + RC-1..RC-7); ledger seed → _work/ledger-seed.tsv (504 rows, tier+unit); contracts list → _work/contracts.txt (35)
- [ ] Phase 2: 14 unit agents dispatched (U1–U14) → _work/units/U#.md — all 14 hit API usage limit mid-read (2026-09-29 ~22:45); resumed 2026-09-30 via SendMessage with "append after each file". Agent ids: U1 accb78054100275cd, U2 abd6c17f11f4aa2c7, U3 a6ccaf60221e3f7ce, U4 aeabd4f18c721234e, U5 a0ce36be8b91c4764, U6 aaf767de9fee8c03e, U7 a519e9f42a35bec9c, U8 a25c4e29c85f54165, U9 ab58e6f0cc47ef401, U10 a740219a0b1b5274c, U11 a24ce4ef740dc0ca3, U12 a32bbc5f9bbf673f7, U13 a2e570f730e9f51b9, U14 a74c7acef4f991ffd. A unit is complete only when its file ends with `## DONE`.
  - 2nd usage-limit hit 2026-09-30 (~2600 lines on disk, no unit DONE; U11 empty, U9 8 lines). Switched to WAVES of 5: A = U7, U12, U14, U3, U6 (resumed); B = U8, U4, U2, U1, U13; C = U5, U9, U10, U11. Resume next wave only when current wave finishes.
- [ ] Phase 3: horizontal passes → _work/horizontal/H*.md
- [x] Phase 4: adversarial verification → _work/verify/V1..V8.md (all S1+S2 clusters; S3 sample 29%, refute ≈8%)
- [ ] Phase 5: dedupe + FINDINGS.md → REMEDIATION.md → SUMMARY.md
- [ ] Phase 6: self-check; remove worktree; decide _work kept (plan: KEEP as evidence)

## Orchestrator-observed facts (seed findings; merge with unit output)
- O1: HEAD 11 commits past v5.3.0 (published, npm latest). package.json 5.3.0. Docs narrate "5.4" renames (brand→prominent, error→danger, etc.) as history; unreleased. v5.3.0 tokens.css has 10 `color-brand` lines, HEAD 0. vm skill says "5.4 renamed … in a minor. That was a mistake" — but it hasn't shipped: chance to cut 6.0.0 → DECISION.
- O2: CHANGELOG.md has only [Unreleased], [1.1.0], [1.0.0]; no 2.x–5.3.0; Unreleased omits renames.
- O3: `.claude/skills/dooph-ds-loading-indicators/SKILL.md` = stale real copy (274 vs 282 lines) teaching `LoadingSpinnerColor.brand` / `var(--ui-color-brand)`; Claude Code loads .claude/skills → agents read the stale copy (the Skill tool in this very session listed it).
- O4: .agent/skills mirrors only 3/9; .claude/skills lacks radix-ui-design-system; file-header-contracts + using-airbnb-visx-lib are local absolute-path JUNCTIONS on disk but tracked as regular-file copies.
- O5: fhc SKILL.md example teaches `ButtonVariant.brand` + "Do NOT reintroduce --ui-color-danger*" (RC-6).
- O6: src/index.ts deep-imports WavyDivider/LoadingSpinner/ProgressIndicator files (no folder index.ts).
- O7: `src/components/Icons/FiltersSlidersIcon.tsx:20` → `export default ArrowUpLeftIcon;` (wrong default export; icons all carry default exports; unreachable through package exports ".").
- O8: AIChat family: 0 mentions in codebase skill, usage skill, README.
- O9: Storybook build emits 17 "Module level directives cause errors when bundled" warnings — standard Vite noise for "use client"; NOT a finding.
- O11 (S1, orchestrator-confirmed): scripts/add-use-client.mjs:40 `contents.split('\n').slice(0, 5)` → 16 client source modules whose directive sits below a header contract (lines 15–54: DropdownMenuSearch, CodeDigitInput, VerificationCodeInput, Checkbox, ShapeButton, Button, AIThinkingPart, RollChangeText, FadeChangeText, AIPromptInput, RevealChangeText, Input, useChangeSwap, SidebarWithHoverIcon, RollingDigitsText, MorphRotationShape) are NOT stamped; 40 source directives − 16 = 24 = build log "from 24 client source module(s)". dist chunk-4SBJJVN3.js (FadeChangeText) starts `import {` with no directive. Rule tension: fhc R11.9 mandates header ABOVE "use client"; the stamping script assumes directive in first 5 lines.
- Rolling window: keep 5 agents live; resume next paused unit whenever one finishes. Done: U3 (1/4/6/3), U7 (0/6/7/2), U12 (1/6/10/2), U8 (1/4/8/3), U14 (0/6/7/2; RC-1..7 all confirmed; R4.2 not a conflict). U6 (1/7/18/2; F28 = add-use-client dup; F23 unions accept icon={null}/color="" → "real guard" claim false), U4 (1/8/10/1; F1 OutlineButton+ShapeButton asChild crash — Slot with 2 children, reproduced via react-dom/server).
  - 3rd usage-limit hit (reset 12:40pm). Resumed: U1, U2, U13, U5, U9. Pending: U10, U11.
  - U1 DONE (2/3/10/1): F1 theme.css spacing keys xs..xl shadow --container-* → max-w-md=16px in consumer builds (compiled w/ TW 4.3.3); F10 token-contract.md errors; F6 six animated helpers w/ literal timings; F2 .dark dup tokens cancel consumer :root overrides; F3 82/89 EXCLUDED entries dead + stale header. Live: U2, U13, U5, U9, U10. Pending: U11.
  - U2 DONE (2/5/6/1): F1 add-use-client (owner; v5.3.0 also affected; chunk-6QQ7EYYD.js:32 createContext unstamped); F7 cn.ts 8/10 text-style roles (hero-body/button dropped); F6 cn registers no DS size/radius/spacing/shadow scales (text-body drops text-primary-fg; rounded-full vs rounded-tight both kept); F2 13 hook-free modules carry directive; F3 color.ts lookup table + 3 private copies; F13 init-skills no-op non-interactive. Live: U13, U5, U9, U10, U11. Pending: none.
  - U13 DONE (6/8/0/1): F1 release state ~50 breaking changes since v5.3.0 (inventory in U13 §6); F9 v3 migration skill forward-compat broken (renames bg-surface-page which is current; lists removed ShapeButtons.star/DropdownMenuVariant); F6 cn hero roles (dup of U2-F7); F2 v5 codemod always exit 0; F3 usage typography example TS2304 (missing HeroText import); F5 rounded-l-standard/rounded-standard don't generate; F13 THIRD_PARTY_NOTICES not in tarball + misses 3 Radix deps; F14 SECURITY/CONTRIBUTING links 404 (repo name missing "."). Live: U5, U9, U10, U11.

## Phase 3 plan (REVISED — units already covered H3/H4 (U1), H5 (U2 client table), H11 (U14/U2))
- HA = H1 const/API table (script every exported const: name, file, key casing, derived-type identifier, prop name) + H8 type safety (greps/h8-typesafety.txt verdicts) + H9 dead code/dup (global unused-export + unused internal fn scan; structural similarity)
- HB = H2 consistency matrix (merge all unit fingerprint tables → one row per exported component; per column dominant/outliers/justified?) → _work/horizontal/H2-matrix.md
- HC = H6/H7 global verdicts for every grep hit (greps/h6-*, h7-radix) + H3 residual counts (raw var(--ui-*) in className, arbitrary values, duration-*/ease-* literals) to support one-pattern-one-finding merges
- HD = H10 claims register consolidation: gather every unit's "Claim results" into one register grouped by source doc, assign C-IDs, flag conflicting verdicts between units, re-verify UNVERIFIABLE/conflicting ones → _work/horizontal/claims-register.md
- Routed leads: cn.ts hero text-style → U2; Toggle.tsx:1 directive above contract (R11.9) → U6. U14 nuance: fresh clone w/ core.symlinks=false → .claude/skills symlink entries check out as 38–56-byte TEXT files (rulebook skills lost for Claude; stale loading-indicators copy + vendored copies still load).
- Cross-unit theme to merge: hardcoded hover `duration-*` utilities (U3-F9 TextLink duration-100; U12-F13: 38 uses / 16 files) → one finding; decide R6.5 applicability (design value hardcoded in component) — likely a D-item or one WI adding a hover-duration token.
- U12-F1 (S1 claim): dark `--ui-color-sticker-danger` and `--ui-color-sticker-bg-danger` both `#ffffff` (tokens.css:717-718) → verify in Phase 4 whether bg is applied with opacity (comment at tokens.css:710 says "the wash are a literal white").
- U7-F15 (S2): "use client" rule (R8.21) lists only hooks/browser APIs/timers; event-handler closures on host elements also force client → rulebook gap (RC-8 candidate).
- O10: CopyButton `REVERT_MS` setTimeout (CopyButton.tsx:59); Toast.tsx:229 setTimeout — check verdicts from U4/U8.

## Phase 3 plan (dispatch after all Phase 2 units land)
- HA = H1 public API (src/index.ts vs folder index vs dist/index.d.ts; Rule 1 invariants on EVERY const; *Props exported; default exports) + H8 type safety (greps/h8-typesafety.txt, unions vs runtime throws)
- HB = H2 consistency matrix (merge all fingerprint tables → per column dominant/outliers/justified?)
- HC = H3 token pipeline + H4 CSS helpers/layers (builds on U1)
- HD = H6 Rules 5/6/7 + H7 Rules 2/3 (greps/h6-*, h7-radix; every hit a verdict)
- HE = H9 dead code + duplication (unused exports/files/functions/props/CSS; similarity scan)
- HF = H10 docs/skills truth consolidation (claims register across all units, re-verify UNVERIFIABLE) + H11 hygiene (root strays, mirrors, vendored templates, gitignore, version vs changelog, orphan test, deps)
Pre-computed greps in _work/greps/.

## Index
- `node docs/audit/_work/scratch/orch/index-findings.mjs > docs/audit/_work/index.tsv` → one row per unit/horizontal finding (id sev cat rules scope nloc loc0 title). Partial run (U5/U9/U10/U11 incomplete): 224 findings {S1:20,S2:74,S3:109,S4:21}.
- HA dispatched (agent a3d5fef9176675b5f) → _work/horizontal/HA.md.
- U9 DONE (3/9/6/1): F1 ShapeMorphSpinner RSC (neutral passes functions to client MorphRotationShape + unstamped chunk); F5 flat ProgressIndicator stray dot near completion (reproduced); F8 LinearProgressIndicator JSDoc 'brand' token; F2 spinner JS timing; F3 li-vs-Rule6 conflict; F6 li:53 false (RC-4); F7 colour-prop mechanisms compete; F12 3 folders w/o index.ts; F13 orphan test passes w/ node --test.
- HC dispatched (agent a6678b224ffea2cbc) → _work/horizontal/HC.md. Live: U5, U10, U11, HA, HC. Next: HB + HD once U5/U10/U11 DONE.
- U5 DONE (1/3/7/1): F1 DropdownTrigger/TextDropdownTrigger asChild always throws (merge w/ U4-F1 → one asChild finding, 4 components); F2 disabled drawn 3 ways; F8 CHANGELOG omits 3 breaking removals.
- HD dispatched (agent a423599af5278f5e9) → _work/horizontal/claims-register.md. Live: U10, U11, HA, HC, HD. Next: HB once U10/U11 DONE.
- U11 DONE (0/3/10/1): F4 AIPromptInputSubmit/AIThinkingEffortSelector drop unnamed props (breaks asChild composition); F1 `state` prop on AIThinkingPart outside R1.11 list; F11 AIModelSelect header claim partly false; F2 color="danger" invalid on AIContextGauge (ProgressIndicator private resolver); F7 ref-merge hand-rolled 4 ways; F10 17 components/3 consts/17 --ui-chat-* tokens undocumented.
- HB dispatched (agent abea77ea32bb8ad43) → _work/horizontal/H2-matrix.md. Live: U10, HA, HB, HC, HD.
- U10 DONE (1/5/7/1): F1 Pentagon/Puff fillColor dead; F5 BaseIcon color stroke-only (TagIcon); F6 HeartFillIcon 16-grid; F8 IconSizes; F9 stroke width 1.5 vs 2; F10 engine notices not shipped; svgs≠paths (Pentagon, Puff, no star.svg); static clipPath ids; 72/88 default exports; R12.9 faithful-port UNVERIFIABLE (no upstream diff). PHASE 2 COMPLETE (all 14 units DONE).
- 4th usage-limit hit right after U10. HA (a3d5fef9176675b5f), HB (abea77ea32bb8ad43), HC (a6678b224ffea2cbc), HD (a423599af5278f5e9) may be interrupted → on resume: check each horizontal/*.md for `## DONE`; SendMessage-resume any that lack it.
- CONFIRMED: HA, HB, HC, HD all stalled ("no progress for 600s") after the 4th limit. On resume: check horizontal/*.md for partial output, then SendMessage-resume each (ids above) with "check what's on disk, finish, append".
- 2026-09-30 resumed HA/HB/HC/HD (SendMessage). clusters.md extended with S3/S4 merge notes.
- Phase 4 started early for S1 clusters: verify-brief.md written; V1 (agent abe53b607d04dbd7b: M1,M16,M5,M7,M33,M13,M2) and V2 (agent acf61658be34de6f6: M4,M10,M11,M12,M17,M31,M18,M14,M15) → _work/verify/V1.md, V2.md.
- 5th usage limit (reset 10:40pm 2026-09-30): V3 (a6fbe59f32f8914e8), V4 (af7ecb1c9e29e2c67), V5 (a137b2d2ac8e69660), V6 (a370875cdc27dfdc8), HD, HB interrupted with little/no output. Resumed HB, HD, V3, V4, V5; V6 queued (resume when a slot frees). HA, HC, V1, V2 DONE.
- HD DONE; V3 DONE; V7 dispatched (ac9e24e33a836505d: M45,M47,M48,M50,M51,M52,M54,M55,M56(+HC-F8),M57,HC-F5,HC-F7).
- S3 sample: pool scratch/orch/s3-pool.txt (45), seeded draw (seed 20260930, LCG Fisher-Yates) → scratch/orch/s3-sample.txt (13 = 29%) + HC-F5/F7/F8 in V7 → V8 to dispatch when a slot frees.
- 2026-10-01: V6 DONE. final-map.psv (119: S1 14, S2 44, S3 53, S4 8) → assign-ids.mjs → fid-map.psv (+ snapshot fid-map.v1.psv) + member-fid.psv. Composer brief written (D-01..D-19 numbered there). Areas: scratch/orch/areas-fid.txt (C1..C7). C1 (a5cb5dbcf02bad158) + C2 (adc41ee640ea80fe4) dispatched → _work/final/F-C#.md + WI-C#.md. C3..C7 wait for V7/V8 (if severities change: regenerate fid-map and remap old→new F-IDs in final/*.md with a script using fid-map.v1.psv).
- Remaining Phase 4: S2 clusters (~45) in batches of ~8 (V3..V8) + ≥25% sample of S3 (V9..) once horizontal passes land.
- NEXT after Phase 3: extend clusters.md to S3/S4 using index.tsv + horizontal outputs; then Phase 4 verifiers on merged S1+S2 + ≥25% S3.
- DECISION (method): cluster/dedupe unit findings into provisional merged findings BEFORE Phase 4, so each merged finding is refuted once (not once per duplicate). Final F-IDs assigned after verification.

## Phase 4 plan
Batch S1+S2 + ≥25% random S3 into verifier agents (≈6–8 findings each, grouped by file area), each fresh, given only the findings + cited files + rulebook; job = refute. Output _work/verify/V#.md with per-finding verdict: confirmed / refuted / downgrade(Sx) + method.
- Phase 5 progress: ledger.md built (504 rows, 0 missing) via scratch/orch/build-ledger.mjs (re-run after any member-fid change). remediation-decisions.md drafted (D-01..D-19, IDs checked vs fid-map v2). Composers live: C1 a5cb5dbcf02bad158, C2 adc41ee640ea80fe4, C3 a676ffce6ffc0f433, C4 aaf683e575b296c36, C5 a76e1afa9fa17cb8b. Pending: C6, C7.
- 7th usage limit (reset 8:40am 2026-10-01): C1–C5 had written NOTHING. Resumed all five with "write each F block immediately, F before WI". C6/C7 still pending dispatch.
- Grade draft: overall C-; API&naming C; internals B-; styling&tokens C; client/server+build C-; docs/skills/contracts C-; stories D+. (finalize with counted evidence at SUMMARY time)
- Assembly tooling: scratch/orch/assemble-findings.mjs (--check validates blocks: presence, field order, sev/cat vs map, remediation present, plausible-with-reason). Needs _work/grades.md + _work/appendix.md before full run. Index titles come from block headings (composers corrected counts: F-075 74 default exports, F-101 11 files, F-019 28 alias tokens, F-016 12 literal timings in 6 helpers, F-033 bands across sizes).
- At assembly: force F-103 category line to `contract-drift` if C3 left `inconsistency`. D-09 extended with R9.19 scope question (F-117 item 27). C3 told to leave codebase SKILL.md:542 + dooph-component-tokens.css:115 to WI-C2-14/15.
- REMEDIATION tooling: scratch/orch/assemble-remediation.mjs (--check = traceability gate; full run writes REMEDIATION.md, _work/wi-map.psv, and final/remapped/F-C*.md with global WI ids). Inputs: remediation-head.md, remediation-decisions.md, remediation-p0.md, final/WI-C*.md + WI-R.md (WI-RELEASE-OPEN/CLOSE; MIGRATION alias → OPEN). FINDINGS assembler now prefers final/remapped/. ORDER: run assemble-remediation (full) → assemble-findings.

## RESUME CHECKLIST (authoritative — 2026-10-02, after weekly-limit reset)
Rule: nothing counts until it is on disk and passes the validators. Never trust an agent report alone.
1. State check: `for f in docs/audit/_work/final/*.md; do echo $f $(grep -c '^### F-' $f) $(grep -c '^### WI-' $f) $(grep -c '^## DONE' $f); done`
2. Validators: `node docs/audit/_work/scratch/orch/assemble-findings.mjs --check` (want only notes, no MISSING/FIELD/SEVERITY/CATEGORY lines) and `node docs/audit/_work/scratch/orch/assemble-remediation.mjs --check` (want no UNKNOWN/UNREMEDIATED/CYCLE/NO-* lines). The remediation assembler auto-raises a WI's phase to its latest dependency's phase.
3. Old composer agents C3/C4/C6/C7 (a676ffce6ffc0f433, aaf683e575b296c36, a1102a617cb08af56, a7504cd6becc7f63d) are ABANDONED — do not resume them (huge contexts). Use fresh agents with docs/audit/_work/continue-brief.md.
4. Gap queue (fresh agents, one target file each):
   - DONE W3 (a82126049ab2281f4) → final/WI-C3.md: WI-C3-15..19 (F-105, F-106, F-110, F-111/F-112/F-120, F-102)
   - DONE W4a (a95c74e5fae1db94f) → final/WI-C4.md: WI-C4-16..21 (F-032, F-033, F-043, F-059, F-060, F-061)
   - DONE W4b (aceba894b2f6a6b04) → final/WI-C4b.md: WI-C4-22..27 (F-063, F-067, F-068, F-076×2, F-084)
   - DONE C6F (a35c201d772c262b4) → final/F-C6.md: F-028, F-030, F-035, F-073, F-083, F-085, F-086, F-090, F-091, F-096, F-097, F-114 (WI ids WI-C6-02+)
   - DONE C7a (ac64758e33612af47) → final/F-C7.md: F-022, F-029, F-031, F-038, F-039, F-040, F-042, F-045, F-065, F-070, F-071 (WI ids WI-C7-01+)
   - C7b (a93c77def07e86d3f) → final/F-C7b.md: F-072, F-074, F-080, F-089, F-095, F-098, F-108, F-113, F-115, F-116, F-118 (WI ids WI-C7-50+ to avoid collision with C7a)
   - W6 (a3e51ac666946d469) → final/WI-C6.md (WI-C6-01..12): every WI-C6-NN referenced in F-C6.md (spec = the F blocks)
   - W7a (a321e96cc0261399f) → final/WI-C7.md: WI-C7-01..12. TODO W7b → final/WI-C7b.md: every WI-C7-5x referenced in F-C7b.md
   - If an agent dies mid-file: check the target file, give a NEW fresh agent the remaining IDs only (same target file, insert before `## DONE`).
5. Then: grades.md (drafted) → full `assemble-remediation.mjs` → full `assemble-findings.mjs` → force F-103 category to contract-drift if needed → SUMMARY.md → Phase 6 self-check → `git worktree remove ../dooph-ds-audit-build --force` + delete ../ds-audit-*.log/txt → final message.
- 2026-10-02 limit hit: C7b (5/11 F), W6 (2/12 WI), W7a (2/12 WI) cut off → replaced by fresh agents: C7c (a5746b8ebae4ad56b) F-098,F-108,F-113,F-115,F-116,F-118 → F-C7b.md; W6b (a686205c70a231d7e) WI-C6-03..12 → WI-C6.md; W7c (ace2378ebc58bfe41) WI-C7-03..12 → WI-C7.md. Still TODO after C7c: W7b → WI-C7b.md for every WI-C7-5x referenced in F-C7b.md.
- C7c DONE (F-C7b complete, 11 blocks). W7b (a561034630af17fb4) → WI-C7b.md: WI-C7-51..62. Remaining in flight: W6b, W7c, W7b. Then assembly.
- W6b DONE (WI-C6 complete). In flight: W7c, W7b.
- W7c DONE (WI-C7 01..12). In flight: W7b only.
- W7b cut off after WI-C7-61; W7d (a2c409fb4af88529a) writing WI-C7-62 + DONE.
- Self-check script ready: scratch/orch/self-check.mjs (20 checks). Trial: all pass except the 3 expected (WI-C7-62 pending, SUMMARY not written, worktree present).
- FINAL SEQUENCE once WI-C7b.md ends with `## DONE`: (1) node assemble-remediation.mjs (2) node assemble-findings.mjs (3) write SUMMARY.md from _work/summary-draft.md with WI count from REMEDIATION (4) git worktree remove ../dooph-ds-audit-build --force; rm ../ds-audit-*.{log,txt} (5) node self-check.mjs → 0 FAIL (6) final message.

## COMPLETE — 2026-10-02
FINDINGS.md (120: 15/43/54/8), REMEDIATION.md (131 WIs: P1 26, P2 6, P3 89, P4 10; 25 blocked; 19 D-items), SUMMARY.md (55 lines). self-check.mjs: 0 FAIL / 20. Worktree ../dooph-ds-audit-build removed; ../ds-audit-* logs deleted. _work/ KEPT as evidence (scripts referenced by WIs live in _work/scratch/). Nothing committed.
