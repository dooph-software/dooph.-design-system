// HD: find candidate duplicate clusters: same doc, overlapping line ranges, >=2 distinct units
const fs = require('fs');
const path = require('path');
const n = JSON.parse(fs.readFileSync(path.join(__dirname, 'norm.json'), 'utf8')).filter((o) => !o.skip);
function range(o) {
  if (!o.lines.length) return [0, 0];
  let lo = Infinity; let hi = -Infinity;
  for (const l of o.lines) { const [a, b] = l.split(/[-–]/).map(Number); lo = Math.min(lo, a); hi = Math.max(hi, b || a); }
  return [lo, hi];
}
const byDoc = {};
n.forEach((o, i) => { o.id = o.unit + ':' + o.fileLine; o.r = range(o); (byDoc[o.doc] = byDoc[o.doc] || []).push(o); });
const clusters = [];
for (const [doc, rs] of Object.entries(byDoc)) {
  rs.sort((a, b) => a.r[0] - b.r[0] || a.r[1] - b.r[1]);
  // union-find on overlap between different units (ranges intersect)
  const parent = rs.map((_, i) => i);
  const find = (i) => (parent[i] === i ? i : (parent[i] = find(parent[i])));
  for (let i = 0; i < rs.length; i++) for (let j = i + 1; j < rs.length; j++) {
    if (rs[i].unit === rs[j].unit) continue;
    const a = rs[i].r; const b = rs[j].r;
    if (a[0] === 0 || b[0] === 0) continue;
    // treat big ranges (>12 lines) as overlapping only if starts are within 3
    const big = (a[1] - a[0] > 12) || (b[1] - b[0] > 12);
    const inter = a[0] <= b[1] && b[0] <= a[1];
    if (inter && (!big || Math.abs(a[0] - b[0]) <= 3)) parent[find(i)] = find(j);
  }
  const groups = {};
  rs.forEach((o, i) => { (groups[find(i)] = groups[find(i)] || []).push(o); });
  for (const g of Object.values(groups)) if (new Set(g.map((o) => o.unit)).size > 1) clusters.push({ doc, g });
}
let k = 0;
for (const c of clusters) {
  k++;
  console.log(`\n## K${k} ${c.doc}`);
  for (const o of c.g) console.log(`  ${o.id.padEnd(9)} ${o.lines.join(',').padEnd(10)} ${o.vclass.padEnd(6)} | ${o.claim.slice(0, 120)} || ${o.verdictRaw.slice(0, 60)}`);
}
console.error('clusters', clusters.length, 'rows in clusters', clusters.reduce((a, c) => a + c.g.length, 0));
