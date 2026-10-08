// Build the coverage ledger: one row per tracked file.
// Usage (repo root): node docs/audit/_work/scratch/orch/build-ledger.mjs > docs/audit/_work/ledger.md
import fs from 'node:fs';
import path from 'node:path';

const W = 'docs/audit/_work';
const seed = fs.readFileSync(`${W}/ledger-seed.tsv`, 'utf8').trim().split(/\r?\n/).map((l) => {
  const [p, tier, unit, lines] = l.split('\t');
  return { p, tier, unit, lines };
});
const memberFid = new Map(fs.readFileSync(`${W}/member-fid.psv`, 'utf8').trim().split(/\r?\n/).slice(1)
  .map((l) => l.split('|')));

const sources = [];
for (const d of ['units', 'horizontal']) {
  for (const f of fs.readdirSync(`${W}/${d}`)) if (f.endsWith('.md')) sources.push(`${W}/${d}/${f}`);
}
const rowsByPath = new Map();
for (const s of sources) {
  const unit = path.basename(s, '.md');
  for (const line of fs.readFileSync(s, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\|\s*`?([^|`]+?)`?\s*\|\s*([^|]*)\|\s*([^|]*)\|\s*([^|]*)\|?/);
    if (!m) continue;
    const p = m[1].trim().replace(/\\/g, '/');
    if (!rowsByPath.has(p)) rowsByPath.set(p, []);
    rowsByPath.get(p).push({ unit, read: m[2].trim(), status: m[3].trim(), ids: m[4].trim() });
  }
}

const unitPrefix = (u) => (u.match(/^U\d+$/) ? u : u === 'HA' ? 'HA' : u === 'HC' ? 'HC' : u === 'H2-matrix' ? 'HB' : u);
function mapIds(idsText, unit) {
  const out = new Set();
  const pre = unitPrefix(unit);
  for (const tok of idsText.match(/\b(?:U\d+-|HA-|HB-|HC-)?F\d+\b/g) || []) {
    const full = /^(U\d+|HA|HB|HC)-/.test(tok) ? tok : `${pre}-${tok}`;
    const fid = memberFid.get(full);
    if (fid) out.add(fid);
  }
  return [...out];
}
function normStatus(texts, tier, fids) {
  const t = texts.join(' ').toLowerCase();
  if (tier === 'T1-pattern' || /pattern/.test(t)) return fids.length ? 'findings' : 'pattern-verified';
  if (tier === 'T1-script' || /generated-verified|script-verified/.test(t)) return fids.length ? 'findings' : 'generated-verified';
  if (fids.length) return 'findings';
  if (/provenance/.test(t)) return 'provenance-only';
  if (/claims/.test(t)) return 'claims-checked';
  if (/clean/.test(t)) return 'reviewed-clean';
  if (tier === 'T3') return 'provenance-only';
  return null;
}

const out = ['| path | tier | unit | lines | status | finding IDs |', '|---|---|---|---|---|---|'];
const missing = [];
const counts = {};
for (const r of seed) {
  const rows = rowsByPath.get(r.p) || [];
  const fids = [...new Set(rows.flatMap((x) => mapIds(x.ids, x.unit)))].sort();
  let status = normStatus(rows.map((x) => x.status), r.tier, fids);
  if (!status) { missing.push(r.p); status = 'MISSING'; }
  counts[status] = (counts[status] || 0) + 1;
  out.push(`| ${r.p} | ${r.tier} | ${r.unit} | ${r.lines} | ${status} | ${fids.join(', ') || '—'} |`);
}
console.log(out.join('\n'));
console.error(JSON.stringify({ files: seed.length, counts, missing: missing.length }));
if (missing.length) console.error('MISSING:\n' + missing.join('\n'));
