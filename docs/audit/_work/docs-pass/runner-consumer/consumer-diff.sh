#!/usr/bin/env bash
# consumer-diff.sh <dir> [git-diff args…] — what the agent changed in a
# consumer sandbox: the current working tree (tracked + untracked, .gitignore
# honoured) against the sandbox's hand-over commit, which is the template's
# initial commit plus the mode's preparation (make-consumer-sandbox.sh). The
# base is the FIRST commit, not HEAD, and a throwaway index is used, so this
# holds even if the agent staged or committed. Extra args go to `git diff`
# (e.g. --stat, --name-status, -- app/).
set -euo pipefail
export GIT_OPTIONAL_LOCKS=0
[ $# -ge 1 ] || { echo "usage: $0 <dir> [git-diff args…]" >&2; exit 2; }
DIR=$(realpath -m "$1"); shift
[ -f "$DIR/.git/consumer-sandbox" ] || { echo "not a consumer sandbox: $DIR" >&2; exit 1; }
BASE=$(git -C "$DIR" rev-list --max-parents=0 HEAD | tail -1)
tmpd=$(mktemp -d)
END=$(
  cd "$DIR"
  export GIT_INDEX_FILE="$tmpd/index"
  git read-tree "$BASE"
  git add -A -- . >/dev/null 2>&1
  git write-tree
)
rm -rf "$tmpd"
git -C "$DIR" diff "$BASE" "$END" "$@"
