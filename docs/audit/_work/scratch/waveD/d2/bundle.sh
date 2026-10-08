#!/usr/bin/env bash
# Usage: bash bundle.sh <out.cjs> [src-root]  — esbuild <src-root>/index.ts (default: repo src)
# to a node CJS bundle (react and all packages external, CSS emptied).
set -e
ROOT="$(cd "$(dirname "$0")/../../../../../.." && pwd)"
SRC="${2:-$ROOT/src}"
"$ROOT/node_modules/.bin/esbuild" "$SRC/index.ts" --bundle --platform=node --format=cjs --jsx=automatic \
  --packages=external --loader:.css=empty --log-level=warning --outfile="$1"
