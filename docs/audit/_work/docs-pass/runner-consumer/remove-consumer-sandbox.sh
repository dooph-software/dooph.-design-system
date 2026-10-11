#!/usr/bin/env bash
# remove-consumer-sandbox.sh <dir> — removes a sandbox made by
# make-consumer-sandbox.sh. Refuses any dir whose git dir has no
# consumer-sandbox marker, so it can never remove the template, the main
# checkout or anything else.
set -euo pipefail
export GIT_OPTIONAL_LOCKS=0
[ $# -eq 1 ] || { echo "usage: $0 <dir>" >&2; exit 2; }
DIR=$(realpath -m "$1")
[ -f "$DIR/.git/consumer-sandbox" ] || { echo "refusing: $DIR is not a consumer sandbox (no .git/consumer-sandbox marker)" >&2; exit 1; }
rm -rf "$DIR" || true
[ -e "$DIR" ] && { echo "could not fully remove $DIR (a process may still hold files in it)" >&2; exit 1; }
echo "removed $DIR"
