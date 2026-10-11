#!/usr/bin/env bash
# remove-sandbox.sh <dir> — removes a sandbox made by make-sandbox.sh.
# Refuses any worktree that has no sandbox-start-tree marker, so it can never
# remove the main checkout or someone else's worktree.
set -euo pipefail
# Optional locks off for every git call: none may refresh the main index stat
# cache or take its index.lock while the maintainer works there.
export GIT_OPTIONAL_LOCKS=0
[ $# -eq 1 ] || { echo "usage: $0 <dir>" >&2; exit 2; }
MAIN=$(git -C "$(dirname "$0")" rev-parse --show-toplevel)
DIR=$(realpath -m "$1")
GITDIR=$(git -C "$DIR" rev-parse --absolute-git-dir 2>/dev/null) || { echo "not a git worktree: $DIR" >&2; exit 1; }
[ -f "$GITDIR/sandbox-start-tree" ] || { echo "refusing: $DIR is not a sandbox (no sandbox-start-tree marker)" >&2; exit 1; }

git -C "$MAIN" worktree remove --force "$DIR" || true
# Windows can leave long node_modules paths behind; finish the job, then prune.
if [ -e "$DIR" ]; then rm -rf "$DIR"; fi
git -C "$MAIN" worktree prune
[ -e "$DIR" ] && { echo "could not fully remove $DIR" >&2; exit 1; }
echo "removed $DIR"
