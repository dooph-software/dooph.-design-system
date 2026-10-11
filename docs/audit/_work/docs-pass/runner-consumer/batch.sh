#!/usr/bin/env bash
# batch.sh <out-dir> <id>... — runs red baselines, 5 at a time, staggered 45s.
OUT=$1; shift; HERE=$(cd "$(dirname "$0")" && pwd)
i=0
for id in "$@"; do
  ( sleep $(( i < 5 ? i * 45 : 0 )); bash "$HERE/run-scenario.sh" "$id" red "$OUT" > "$OUT/$id-red-runner.log" 2>&1; echo "$id exit=$?" >> "$OUT/batch-status.txt" ) &
  i=$((i+1))
  while [ "$(jobs -rp | wc -l)" -ge 5 ]; do sleep 20; done
done
wait; echo ALL-DONE >> "$OUT/batch-status.txt"
