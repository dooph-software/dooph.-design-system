#!/usr/bin/env node
// surface-reconcile.mjs <v530.json> <mid.json> <head.json> <api-diff.json> <out.json>
//
// For every api-diff line, says WHEN the change landed by probing the
// intermediate surface (b436647, where docs/audit/CHANGES.md starts):
//   pre   the value at b436647 already equals HEAD's → one of the ten commits
//         v5.3.0..b436647 (no CHANGES.md coverage exists for these)
//   post  the value at b436647 still equals v5.3.0's → b436647..HEAD, so a
//         CHANGES.md entry must explain it
//   both  changed in both ranges
// A line with several paths (a grouped line) gets the set of its paths' classes.

import { readFileSync, writeFileSync } from 'node:fs';
import { getPath } from './surface-diff.mjs';

const [v530P, midP, headP, diffP, outP] = process.argv.slice(2);
const load = (p) => JSON.parse(readFileSync(p, 'utf8'));
const [A, M, H, D] = [load(v530P), load(midP), load(headP), load(diffP)];
const same = (x, y) => JSON.stringify(x) === JSON.stringify(y);

export function classify(path) {
  const a = getPath(A, path), m = getPath(M, path), h = getPath(H, path);
  if (same(m, h) && !same(a, h)) return 'pre';
  if (same(m, a) && !same(a, h)) return 'post';
  if (same(a, h)) return 'none';
  return 'both';
}

const out = [];
const counts = {};
for (const sec of D) {
  for (const line of sec.lines) {
    const cls = [...new Set(line.paths.map(classify))].sort();
    const when = cls.length === 1 ? cls[0] : cls.join('+');
    counts[when] = (counts[when] ?? 0) + 1;
    out.push({ section: sec.title, text: line.text, when, paths: line.paths });
  }
}
writeFileSync(outP, JSON.stringify(out, null, 1) + '\n');
console.log(counts);
