#!/usr/bin/env bash
# Regenerates every Task-1 output from the three built trees. Run from the repo root.
# Usage: bash docs/audit/_work/scratch/surface-run-all.sh <scratch-dir-for-intermediates>
set -euo pipefail
S="$1"; W=docs/audit/_work; P=$W/docs-pass; X=$W/scratch
node $X/surface.mjs ../ds-head $P/surface-head.json
node $X/surface.mjs ../ds-v530 $P/surface-v5.3.0.json
node $X/surface.mjs ../ds-v530/_b436647 $P/surface-b436647.json
node $X/surface-diff.mjs $P/surface-v5.3.0.json $P/surface-head.json $P/api-diff.md "$S/api-diff.json"
node $X/surface-reconcile.mjs $P/surface-v5.3.0.json $P/surface-b436647.json $P/surface-head.json "$S/api-diff.json" "$S/classified.json"
node $X/surface-match.mjs "$S/classified.json" "$S/matched.json"
node $X/surface-utilities.mjs "$S/matched.json" $P/utility-attribution.md
cp "$S/matched.json" $P/api-diff-reconciled.json
node $X/surface-regrade.mjs $P/api-diff-reconciled.json $P/breaking-regrade.md
