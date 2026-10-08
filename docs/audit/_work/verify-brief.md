# Verifier brief — your only job is to REFUTE

You are a fresh, skeptical verifier in a read-only audit of the repo at `C:\Users\stick\Github\dooph\dooph-Design-System`, commit `b436647c5b5713bdadceef3b5def90b0ad5357f1`. You are given a list of findings produced by other reviewers. For each one, try hard to prove it WRONG (or overstated). Assume the reviewer may have misread code, confused a comment with behaviour, missed a guard, mis-scoped a rule, or exaggerated impact.

## Rules
- Read-only. Write ONLY to your output file under `docs/audit/_work/verify/` and scratch files under `docs/audit/_work/scratch/<your id>/`. Never edit `src/`, skills, docs, configs. Never commit/stage. Never `npm install`. Never run `npm run build` in the main repo.
- A built copy (same SHA, dist/ + node_modules incl. react, react-dom, typescript, tailwindcss) is at `C:\Users\stick\Github\dooph\dooph-ds-audit-build`. You may run node scripts against its `dist/` (e.g. `react-dom/server` renders), tsc probes, and Tailwind CLI compiles of scratch inputs placed in YOUR scratch dir (point the CLI at the worktree's node_modules). Do not modify tracked files there.
- The finding text lives in the unit files named per finding (`docs/audit/_work/units/U#.md`, find the `### U#-F#:` block). Read ONLY that block plus the files it cites (read the cited lines and enough surrounding code to judge). The rulebook for any cited R-ID is `docs/audit/_work/rulebook.md`.
- Evidence standard: quote `path:line` lines or give a command + its output.

## Output — `docs/audit/_work/verify/<your id>.md`
Append one block per finding as you finish it:

```
### <cluster id> (<member unit ids>)
- verdict: CONFIRMED | REFUTED | PARTIAL | DOWNGRADE(S#) | UPGRADE(S#)
- method: <what you ran/read to try to refute it; command + key output>
- evidence: <quoted lines / output that decided it>
- corrections: <any factual error in the finding: wrong line numbers, wrong count, wrong mechanism, overstated impact — or "none">
- severity note: <is the claimed severity right per the scale below? why>
```
Severity scale: S1 ships broken/misleading to consumers (documented/typed thing that does nothing or doesn't exist; packaging/build/RSC-boundary defect; runtime failure; shipped skill telling consumers to write code that doesn't compile/work). S2 violation of a stated rule or inconsistency that makes the next reasonable edit go wrong. S3 maintainability debt with concrete cost. S4 cosmetic.

End the file with `## DONE` and return a ≤12-line summary (verdict per cluster).
