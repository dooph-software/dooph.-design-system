#!/usr/bin/env bash
# make-sandbox.sh <dir> [--with-skills]
#
# Creates a sandbox repo for ONE behaviour-scenario run (see scenarios.md;
# run-scenario.sh calls this).
#
# - Snapshots the main checkout's CURRENT working tree (tracked + untracked,
#   .gitignore honoured, uncommitted edits included) as a git tree, using a
#   throwaway index. The main checkout's index, HEAD and branches are never
#   touched, and no commit is created anywhere.
# - `git worktree add --detach <dir> HEAD`, then `git read-tree -u --reset <tree>`
#   in the worktree (its own index) so the sandbox holds that snapshot. The
#   worktree's HEAD stays at the real HEAD.
# - Both modes delete the answer key: docs/audit/, docs/superpowers/,
#   .claude/research/ and the three root planning files.
# - Default (baseline, RED) also deletes everything else that teaches the
#   rules: .agents/, .agent/, .claude/skills/, skills/, CONTRIBUTING.md, and
#   replaces README.md with a 3-line stub. AGENTS.md, src/, stories, scripts/
#   and package.json stay. Because the skills and their generated references
#   are gone, the two lint checks that guard them (docs-fresh, skills-mirrored)
#   are removed from the SANDBOX copy of scripts/check-conventions.mjs, so
#   `npm run lint` passes before the agent starts and every failure it later
#   reports is the agent's own.
# - --with-skills (GREEN) keeps the skill trees and the then-current README.md
#   and CONTRIBUTING.md.
# - Records the sandbox's start tree in <git-dir>/sandbox-start-tree and resets
#   the sandbox index to it, so plain `git diff` in the sandbox shows only the
#   agent's edits to tracked files. `git status` still lists the stripped files
#   as staged deletions against HEAD; scoring never uses it: sandbox-diff.sh
#   compares the sandbox with the recorded start tree, new files included.
# - Runs `npm ci` in the sandbox. Prints the dir and the tree hashes.
#
# Remove with remove-sandbox.sh <dir>. Show the agent's changes with
# sandbox-diff.sh <dir>.
set -euo pipefail
# Optional locks off for every git call: none may refresh the main index stat
# cache or take its index.lock while the maintainer works there.
export GIT_OPTIONAL_LOCKS=0

usage() { echo "usage: $0 <dir> [--with-skills]" >&2; exit 2; }
[ $# -ge 1 ] || usage
DIR_ARG=$1; shift
WITH_SKILLS=0
for a in "$@"; do
  case "$a" in
    --with-skills) WITH_SKILLS=1 ;;
    *) usage ;;
  esac
done

MAIN=$(git -C "$(dirname "$0")" rev-parse --show-toplevel)
DIR=$(realpath -m "$DIR_ARG")
[ -e "$DIR" ] && { echo "refusing: $DIR already exists" >&2; exit 1; }

# 1. Snapshot tree of the main working tree (throwaway index, as in snap.sh).
tmpd=$(mktemp -d)
SNAP=$(
  cd "$MAIN"
  export GIT_INDEX_FILE="$tmpd/index"
  git read-tree HEAD
  git add -A -- . >/dev/null 2>&1
  git write-tree
)
rm -rf "$tmpd"

# 2. Worktree at HEAD, then the snapshot into ITS index and files.
git -C "$MAIN" worktree add --detach "$DIR" HEAD >/dev/null
git -C "$DIR" read-tree -u --reset "$SNAP"

# 3. Strip. Both modes: the answer key (audit, plans, research).
(
  cd "$DIR"
  rm -rf docs/audit docs/superpowers .claude/research
  rm -f executor-prompt-oss-publication.md 2026-09-20-visx-charts-design.md \
    2026-09-20-visx-charts-figma-checklist.md
  rmdir docs 2>/dev/null || true
)
# Baseline only: everything else that teaches the rules.
if [ "$WITH_SKILLS" -eq 0 ]; then
  (
    cd "$DIR"
    rm -rf .agents .agent .claude/skills skills
    rm -f CONTRIBUTING.md
    printf '%s\n' '# @dooph-software/design-system' '' \
      'React component library: components in src/, stories next to them; run `npm run storybook`.' > README.md
    # Drop the two checks that guard the deleted docs (sandbox copy only).
    node -e '
      const fs = require("fs"), f = "scripts/check-conventions.mjs";
      let s = fs.readFileSync(f, "utf8");
      for (const id of ["docs-fresh", "skills-mirrored"]) {
        const re = new RegExp("\\n  \\{\\n    id: \"" + id + "\",[\\s\\S]*?\\n  \\},(?=\\n)");
        if (!re.test(s)) { console.error("make-sandbox: check " + id + " not found"); process.exit(1); }
        s = s.replace(re, "");
      }
      fs.writeFileSync(f, s);
    '
  )
fi

# 4. Record the start tree and make it the sandbox index (HEAD is not moved).
tmpd=$(mktemp -d)
START=$(
  cd "$DIR"
  export GIT_INDEX_FILE="$tmpd/index"
  git read-tree HEAD
  git add -A -- . >/dev/null 2>&1
  git write-tree
)
rm -rf "$tmpd"
git -C "$DIR" read-tree --reset "$START"
GITDIR=$(git -C "$DIR" rev-parse --absolute-git-dir)
echo "$START" > "$GITDIR/sandbox-start-tree"

# 5. Dependencies.
( cd "$DIR" && npm ci --no-audit --no-fund --loglevel=error >/dev/null )

mode=baseline; [ "$WITH_SKILLS" -eq 1 ] && mode=with-skills
echo "sandbox:       $DIR ($mode)"
echo "snapshot tree: $SNAP (main working tree)"
echo "start tree:    $START (sandbox at hand-over; recorded in $GITDIR/sandbox-start-tree)"
