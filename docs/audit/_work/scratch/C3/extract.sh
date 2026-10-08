#!/bin/bash
# usage: extract.sh ID...  -> prints finding blocks
for id in "$@"; do
  u=${id%%-*}
  f=units/$u.md
  [ -f "$f" ] || f=horizontal/H2-matrix.md
  awk -v id="$id" '
    $0 ~ "^### "id":" {p=1; print; next}
    p && /^### / {p=0}
    p && /^## / {p=0}
    p {print}
  ' "$f"
  echo "-----"
done
