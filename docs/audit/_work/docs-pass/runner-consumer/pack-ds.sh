#!/usr/bin/env bash
# pack-ds.sh <out-dir>
#
# Packs @dooph-software/design-system from the main checkout's CURRENT working
# tree (tracked + untracked, .gitignore honoured, uncommitted edits included)
# without building in, or changing, the main checkout:
#   1. snapshot the main working tree as a git tree through a throwaway index
#      (same as make-sandbox.sh; the main index, HEAD and refs are untouched);
#   2. `git worktree add --detach ../ds-pack-<stamp> HEAD`, then
#      `read-tree -u --reset <snapshot>` in the WORKTREE's own index;
#   3. `npm ci && npm run build && npm pack` there;
#   4. copy the tarball to <out-dir>, remove the worktree (trap on EXIT).
# Prints the tarball path on its last line. Used to (re)build the vendored
# tarball of the consumer template (see the template's README.md).
set -euo pipefail
# Optional locks off: no git call may refresh the main index or take its lock.
export GIT_OPTIONAL_LOCKS=0
[ $# -eq 1 ] || { echo "usage: $0 <out-dir>" >&2; exit 2; }
MAIN=/c/Users/stick/Github/dooph/dooph-Design-System
mkdir -p "$1"; OUT=$(cd "$1" && pwd)
WT="$(dirname "$MAIN")/ds-pack-$(date +%Y%m%d%H%M%S)"
[ -e "$WT" ] && { echo "refusing: $WT exists" >&2; exit 1; }

cleanup() {
  [ -e "$WT" ] || return 0
  git -C "$MAIN" worktree remove --force "$WT" >/dev/null 2>&1 || true
  [ -e "$WT" ] && rm -rf "$WT"
  git -C "$MAIN" worktree prune
}
trap cleanup EXIT

tmpd=$(mktemp -d)
SNAP=$(
  cd "$MAIN"
  export GIT_INDEX_FILE="$tmpd/index"
  git read-tree HEAD
  git add -A -- . >/dev/null 2>&1
  git write-tree
)
rm -rf "$tmpd"
echo "snapshot tree: $SNAP (main working tree)"

git -C "$MAIN" worktree add --detach "$WT" HEAD >/dev/null
git -C "$WT" read-tree -u --reset "$SNAP"
[ "$(git -C "$WT" write-tree)" = "$SNAP" ] || { echo "worktree index does not match the snapshot" >&2; exit 1; }
echo "worktree: $WT (holds the snapshot)"

(
  cd "$WT"
  npm ci --no-audit --no-fund --loglevel=error
  npm run build
  npm pack --pack-destination "$OUT" --loglevel=error
) > "$OUT/pack-ds.log" 2>&1 || { tail -40 "$OUT/pack-ds.log"; echo "build/pack failed (log: $OUT/pack-ds.log)" >&2; exit 1; }

TGZ=$(ls -t "$OUT"/dooph-software-design-system-*.tgz | head -1)
echo "snapshot $SNAP" > "$TGZ.source"
echo "tarball: $TGZ"
