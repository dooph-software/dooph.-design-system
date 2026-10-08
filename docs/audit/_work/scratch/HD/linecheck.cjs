// HD: verify each claim row's cited line range against the actual source doc using anchor strings
// from the claim text (backticked / quoted fragments). Writes linecheck.json {id: {status, suggest}}
const fs = require('fs');
const path = require('path');
const REPO = path.resolve(__dirname, '..', '..', '..', '..', '..');
const n = JSON.parse(fs.readFileSync(path.join(__dirname, 'norm.json'), 'utf8')).filter((o) => !o.skip);
const cache = {};
function doc(p) {
  if (!(p in cache)) { try { cache[p] = fs.readFileSync(path.join(REPO, p), 'utf8').split(/\r?\n/); } catch { cache[p] = null; } }
  return cache[p];
}
function anchors(claim) {
  const out = [];
  for (const m of claim.matchAll(/`([^`]+)`/g)) out.push(m[1]);
  for (const m of claim.matchAll(/"([^"]+)"/g)) out.push(...m[1].split(/…|\.\.\./));
  return out.map((s) => s.replace(/\\\|/g, '|').trim()).filter((s) => s.length >= 5 && !/^[\s.]+$/.test(s));
}
function range(o) {
  if (!o.lines.length) return null;
  let lo = Infinity; let hi = -Infinity;
  for (const l of o.lines) { const [a, b] = l.split(/[-–]/).map(Number); lo = Math.min(lo, a); hi = Math.max(hi, b || a); }
  return [lo, hi];
}
const res = {};
let ok = 0; let bad = 0; let none = 0;
for (const o of n) {
  const id = o.unit + ':' + o.fileLine;
  const lines = o.doc && doc(o.doc);
  const r = range(o);
  const an = anchors(o.claim);
  if (!lines || !r || !an.length) { res[id] = { status: 'unchecked' }; none++; continue; }
  const hits = [];
  const norm = (x) => x.replace(/\s+/g, ' ').toLowerCase();
  for (const a of an) lines.forEach((l, i) => { if (norm(l).includes(norm(a))) hits.push(i + 1); });
  if (!hits.length) { res[id] = { status: 'no-anchor-hit', anchors: an }; none++; continue; }
  const inRange = hits.some((h) => h >= r[0] - 1 && h <= r[1] + 1);
  if (inRange) { res[id] = { status: 'ok' }; ok++; continue; }
  const near = hits.reduce((b, h) => (Math.abs(h - r[0]) < Math.abs(b - r[0]) ? h : b), hits[0]);
  res[id] = { status: 'drift', cited: o.lines.join(','), nearest: near, delta: near - r[0], anchors: an };
  bad++;
}
fs.writeFileSync(path.join(__dirname, 'linecheck.json'), JSON.stringify(res, null, 1));
console.log('ok', ok, 'drift', bad, 'unchecked', none);
for (const [id, v] of Object.entries(res)) if (v.status === 'drift') {
  const o = n.find((x) => x.unit + ':' + x.fileLine === id);
  console.log(id.padEnd(9), (o.doc || '').split('/').slice(-2).join('/').padEnd(40), 'cited', v.cited.padEnd(12), 'nearest', v.nearest, 'delta', v.delta, '|', v.anchors.slice(0, 2).join(' ; ').slice(0, 70));
}
