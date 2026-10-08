// Assign final F-IDs from final-map.psv: order by severity, then category (schema order), then file order.
// Usage: node docs/audit/_work/scratch/orch/assign-ids.mjs  → writes docs/audit/_work/fid-map.psv
import fs from 'node:fs';

const CAT_ORDER = [
  'rule-violation', 'inconsistency', 'dead-code', 'duplication', 'wrong-layer', 'coupling',
  'type-safety', 'api-design', 'naming', 'doc-drift', 'contract-drift', 'generated-drift',
  'build-packaging', 'stories', 'repo-hygiene', 'rulebook-conflict',
];
const SEV_ORDER = ['S1', 'S2', 'S3', 'S4'];
const src = 'docs/audit/_work/final-map.psv';
const lines = fs.readFileSync(src, 'utf8').trim().split(/\r?\n/);
const head = lines[0].split('|');
const rows = lines.slice(1).map((l, i) => {
  const c = l.split('|');
  const o = Object.fromEntries(head.map((h, j) => [h, c[j]]));
  o._i = i;
  return o;
}).filter((r) => r.key !== 'DROPPED');
for (const r of rows) {
  if (!SEV_ORDER.includes(r.sev)) throw new Error(`bad sev ${r.key}`);
  if (!CAT_ORDER.includes(r.cat)) throw new Error(`bad cat ${r.key}: ${r.cat}`);
}
rows.sort((a, b) =>
  SEV_ORDER.indexOf(a.sev) - SEV_ORDER.indexOf(b.sev) ||
  CAT_ORDER.indexOf(a.cat) - CAT_ORDER.indexOf(b.cat) ||
  a._i - b._i);
const out = ['fid|' + head.join('|')];
rows.forEach((r, i) => {
  r.fid = 'F-' + String(i + 1).padStart(3, '0');
  out.push([r.fid, ...head.map((h) => r[h])].join('|'));
});
fs.writeFileSync('docs/audit/_work/fid-map.psv', out.join('\n') + '\n');
// member → fid lookup (for ledger + related rewriting)
const mem = ['member|fid'];
for (const r of rows) for (const m of r.members.split(',')) mem.push(`${m.trim()}|${r.fid}`);
fs.writeFileSync('docs/audit/_work/member-fid.psv', mem.join('\n') + '\n');
const count = {};
for (const r of rows) count[r.sev] = (count[r.sev] || 0) + 1;
const cat = {};
for (const r of rows) cat[r.cat] = (cat[r.cat] || 0) + 1;
console.log(JSON.stringify({ total: rows.length, count, cat }));
