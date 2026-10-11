#!/usr/bin/env bash
# sandbox-diff.sh <dir> [git-diff args…] — what the agent changed in a sandbox:
# the sandbox's current working tree (tracked + untracked, .gitignore honoured)
# against the start tree make-sandbox.sh recorded. Uses a throwaway index, so
# it works even if the agent staged or committed. Extra args go to `git diff`
# (e.g. --stat, --name-status, -- src/styles/tokens.css).
set -euo pipefail
# Optional locks off for every git call: none may refresh the main index stat
# cache or take its index.lock while the maintainer works there.
export GIT_OPTIONAL_LOCKS=0
[ $# -ge 1 ] || { echo "usage: $0 <dir> [git-diff args…]" >&2; exit 2; }
DIR=$(realpath -m "$1"); shift
GITDIR=$(git -C "$DIR" rev-parse --absolute-git-dir)
START=$(cat "$GITDIR/sandbox-start-tree")
tmpd=$(mktemp -d)
END=$(
  cd "$DIR"
  export GIT_INDEX_FILE="$tmpd/index"
  git read-tree "$START"
  git add -A -- . >/dev/null 2>&1
  git write-tree
)
rm -rf "$tmpd"
git -C "$DIR" diff "$START" "$END" "$@"
