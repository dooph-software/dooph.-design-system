# Commit plan simulation (docs/COMMIT-PLAN.md)

Method: scratch worktree `../ds-plan-sim` at HEAD 8493906, `npm ci`, then for each commit 1-12 the files from
`git status --porcelain --untracked-files=all -- <pathspecs>` were copied from the main tree (deleted paths removed).
Nothing from docs/audit/ or the plan was copied. After each step: `npm run lint`, `generate-docs --check`,
`sync-skills --check`, `sync-theme --check`. Worktree removed and pruned afterwards.

## Results

| Step | lint | generate-docs | sync-skills | sync-theme |
|---|---|---|---|---|
| 0 (HEAD) | pass (30 checks) | pass | pass | pass |
| 1 | pass | pass | pass | pass |
| 2 | FAIL | FAIL | pass | pass |
| 3 | pass | pass | pass | pass |
| 4 to 12 | pass | pass | pass | pass |

Step 2 failure message:

    FAIL generated doc references out of date: skills/dooph-design-system-usage/references/components.md:1 out of date; run node scripts/generate-docs.mjs
    generate-docs --check: stale skills/dooph-design-system-usage/references/components.md

Cause: commit 2 includes the regenerated `components.md`, but that file is produced by `scripts/generate-docs.mjs`,
whose corrected version only arrives in commit 3. With the old generator the new components.md is "stale".
The check goes green again as soon as commit 3 lands.

## Smallest fix (verified in the worktree)

Move `scripts/generate-docs.mjs` and `skills/dooph-design-system-theming/references/token-contract.md` from commit 3
into commit 2 (the generator and its two outputs ship together). Tested state after commits 1 + modified 2:
`npm run lint` and `generate-docs --check` both pass. Then the reduced commit 3
(`scripts/check-conventions.mjs scripts/sync-theme.mjs src/styles/theme.css`) also passes lint, generate-docs and
sync-theme. Rename commit 2's message to cover the generator, and commit 3's description to drop the generate-docs bullet.

Alternative: do commit 3 before commit 2 (not tested; token-contract.md would be fine but components.md is
generated against the new generator, so 3-then-2 should also be green).

## End-state equality (after step 12)

Every non-docs/audit, non-plan path in `git status` is covered by exactly one commit (no uncovered, no duplicate).
Planned files are byte-identical between the worktree and the main tree. The five deleted tracked files
(`.claude/research/...`, `2026-09-20-visx-*` x2, `executor-prompt-oss-publication.md`, `docs/superpowers/...`) are gone in the worktree.
The only differences across the rest of the tracked tree are line endings: unmodified files in the main tree are CRLF
on disk (index is LF), while the fresh worktree checkout is LF. With CR stripped the trees are identical.

## Main checkout safety

`git status --porcelain | md5sum` before: 08106dc67c6fb38253db78b7c33917ad (102 lines)
`git status --porcelain | md5sum` after the worktree was removed (before this report file was written): 08106dc67c6fb38253db78b7c33917ad
Writing this report adds one untracked line under docs/audit/_work/docs-pass/, so the hash taken after this file exists will differ by that line only.
`git worktree list` shows only the main checkout.
