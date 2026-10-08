# Continuation brief — finish a gap in the audit's final documents

You are a FRESH agent finishing a narrow, exactly-specified piece of a read-only audit of `C:\Users\stick\Github\dooph\dooph-Design-System` at commit `b436647c5b5713bdadceef3b5def90b0ad5357f1`. Earlier agents were cut off by usage limits; you may be too. Everything must therefore be on disk the moment it is done.

## Rules (in addition to composer-brief.md)
1. Read `docs/audit/_work/composer-brief.md` in full — it holds the exact finding schema, the WI template, the phase definitions, the decision list D-01…D-19 and the hard rules (no placeholders, anchors verbatim @ b436647, never hand-edit generated files, no commit steps, CHECKPOINT last).
2. Read your TARGET file's existing content first (if it exists) to match style and see which IDs already exist. Never duplicate an ID that already exists there. Never edit any other agent's file.
3. Work ONE ITEM AT A TIME end-to-end: gather only that item's inputs, then APPEND the finished block to the target file immediately (bash `cat >> file <<'EOF' … EOF` or the Edit tool). Your first append must happen within your first ~10 tool calls.
4. If the target file already ends with `## DONE`, insert new items BEFORE that line. Write `## DONE` (once, last line) only when every assigned item is present.
5. Read-only everywhere else: write only to your target file and scratch under `docs/audit/_work/scratch/<your id>/`. Never edit src/, skills, docs, configs; never commit; never npm install; never `npm run build` in the repo. The built copy at `C:\Users\stick\Github\dooph\dooph-ds-audit-build` is read/execute only.
6. Inputs you may need: `docs/audit/_work/fid-map.psv` (final F-IDs, severity, category, members, verify file, route), `member-fid.psv`, member blocks in `docs/audit/_work/units/U#.md` and `docs/audit/_work/horizontal/{HA,HC,H2-matrix}.md`, verifier blocks in `docs/audit/_work/verify/V#.md`, `docs/audit/_work/rulebook.md`, `docs/audit/_work/horizontal/claims-register.md`. For WI writing, the FINDING BLOCK in `docs/audit/_work/final/F-C*.md` is your spec: its `recommendation`, `locations`, `contract` and `remediation` fields say what the WI must do and which WI ID it expects.
7. Release dependency for P4 items: `WI-RELEASE-OPEN` (see `docs/audit/_work/final/WI-R.md`).
8. When finished, return a ≤10-line summary listing the IDs you wrote.
