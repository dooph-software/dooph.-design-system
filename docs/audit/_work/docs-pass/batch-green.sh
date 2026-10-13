#!/usr/bin/env bash
# batch-green.sh <maint|consumer> <concurrency> <out-dir> <id>... — GREEN runs.
# maint uses run-scenario.sh; consumer uses runner-consumer/run-consumer.sh and
# needs DS_TARBALL exported (a fresh pack-ds.sh build). Staggered 45s.
KIND=$1; N=$2; OUT=$3; shift 3; HERE=$(cd "$(dirname "$0")" && pwd)
case "$KIND" in maint) R="$HERE/run-scenario.sh" ;; consumer) R="$HERE/runner-consumer/run-consumer.sh"; [ -n "${DS_TARBALL:-}" ] || { echo "DS_TARBALL unset" >&2; exit 2; } ;; *) exit 2 ;; esac
mkdir -p "$OUT"; i=0
for id in "$@"; do
  ( sleep $(( i < N ? i * 45 : 0 )); bash "$R" "$id" green "$OUT" > "$OUT/$id-green-runner.log" 2>&1; echo "$id exit=$?" >> "$OUT/batch-status.txt" ) &
  i=$((i+1))
  while [ "$(jobs -rp | wc -l)" -ge "$N" ]; do sleep 20; done
done
wait; echo ALL-DONE >> "$OUT/batch-status.txt"
