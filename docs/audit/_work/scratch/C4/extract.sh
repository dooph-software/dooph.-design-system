#!/bin/sh
# usage: extract.sh U12-F1 ...  -> prints each "### <id>:" block from units/*.md
for id in "$@"; do
  u=${id%%-*}
  f=units/$u.md
  awk -v id="$id" '
    $0 ~ "^### "id":" {p=1; print; next}
    p && /^### / {p=0}
    p && /^## / {p=0}
    p {print}
  ' "$f"
  echo
done
