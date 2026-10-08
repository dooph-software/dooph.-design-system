// HD: build the consolidated claims register from norm.json + overrides.cjs + findings.json
// Usage: node build.cjs [--dry]   (writes ../../horizontal/claims-register.md incrementally, one doc group per append)
const fs = require('fs');
const path = require('path');
const REPO = path.resolve(__dirname, '..', '..', '..', '..', '..');
const OUT = path.join(__dirname, '..', '..', 'horizontal', 'claims-register.md');
const DRY = process.argv.includes('--dry');
const O = require('./overrides.cjs');
const F = JSON.parse(fs.readFileSync(path.join(__dirname, 'findings.json'), 'utf8'));
const FIDS = new Set(F.map((f) => f.id));
const rowsAll = JSON.parse(fs.readFileSync(path.join(__dirname, 'norm.json'), 'utf8')).filter((o) => !o.skip);

// ---------- rows ----------
const rows = {};
for (const o of rowsAll) {
  const id = o.unit + ':' + o.fileLine;
  if (O.lineFix[id]) { o.citedLines = o.lines.join(','); o.lines = O.lineFix[id]; }
  o.id = id;
  rows[id] = o;
}
// expand rows that name several files (each file carries its own copy of the comment)
const EXPAND = { 'U8:527': true, 'U8:528': true, 'U1:475': true };
for (const id of Object.keys(EXPAND)) {
  const o = rows[id];
  let k = 0;
  for (const ex of o.extra) {
    const m = ex.match(/^(.*?)(?::([\d,\-–]+))?$/);
    k++;
    const c = { ...o, id: id + '#' + String.fromCharCode(97 + k), doc: m[1], lines: m[2] ? m[2].split(',') : [], extra: [], expandedFrom: id };
    rows[c.id] = c;
  }
  o.extra = [];
}
function range(lines) {
  let lo = Infinity; let hi = -Infinity;
  for (const l of lines) { const [a, b] = String(l).split(/[-–]/).map(Number); if (!isNaN(a)) { lo = Math.min(lo, a); hi = Math.max(hi, isNaN(b) ? a : b); } }
  return lo === Infinity ? [0, 0] : [lo, hi];
}
function mergeLines(list) {
  const rs = [];
  for (const l of list) { const [a, b] = String(l).split(/[-–]/).map(Number); if (!isNaN(a)) rs.push([a, isNaN(b) ? a : b]); }
  rs.sort((x, y) => x[0] - y[0]);
  const out = [];
  for (const r of rs) { const last = out[out.length - 1]; if (last && r[0] <= last[1] + 1) last[1] = Math.max(last[1], r[1]); else out.push([...r]); }
  return out.map(([a, b]) => (a === b ? String(a) : a + '-' + b)).join(',');
}

// ---------- groups ----------
const excluded = []; const dropped = [];
const inMerge = new Set(O.merge.flat());
for (const id of Object.keys(O.exclude)) { if (!rows[id]) throw new Error('exclude: unknown ' + id); excluded.push({ ...rows[id], reason: O.exclude[id] }); }
for (const id of Object.keys(O.drop)) { if (!rows[id]) throw new Error('drop: unknown ' + id); dropped.push({ ...rows[id], reason: O.drop[id] }); }
const gone = new Set([...Object.keys(O.exclude), ...Object.keys(O.drop)]);
const groups = [];
for (const m of O.merge) {
  for (const id of m) { if (!rows[id]) throw new Error('merge: unknown ' + id); if (gone.has(id)) throw new Error('merge contains excluded ' + id); }
  groups.push(m.map((id) => rows[id]));
}
for (const id of Object.keys(rows)) if (!inMerge.has(id) && !gone.has(id)) groups.push([rows[id]]);

const UMBRELLA = new Set(['U6:875', 'U5:470', 'U13:413', 'U13:415', 'U13:564', 'U13:549', 'U13:496', 'U9:571', 'U4:602', 'U1:525', 'U14:672']);
const unresolved = [];
const G = groups.map((g) => {
  const p = g[0];
  const own = g.filter((r, i) => i === 0 || !UMBRELLA.has(r.id));
  const lines = mergeLines(own.flatMap((r) => r.lines));
  const res = O.resolve[p.id];
  const classes = [...new Set(g.map((r) => r.vclass))];
  let verdict;
  if (res) verdict = res.v;
  else if (classes.length === 1) verdict = classes[0];
  else { verdict = 'CONFLICT?'; unresolved.push(p.id + ' ' + classes.join('/')); }
  if (verdict === 'OTHER') unresolved.push(p.id + ' OTHER');
  // findings: explicit ids
  const fset = new Set();
  for (const r of g) {
    const txt = [r.verdictRaw, r.evidence, r.claim].join(' ');
    for (const m of txt.matchAll(/\b(U\d+)-F(\d+)\b/g)) fset.add(m[1] + '-F' + m[2]);
    for (const m of txt.matchAll(/(?<![\w-])F(\d+)\b/g)) fset.add(r.unit + '-F' + m[1]);
  }
  const explicit = [...fset].filter((x) => FIDS.has(x));
  const mapped = (O.findingsAdd[p.id] || []).filter((x) => FIDS.has(x) && !explicit.includes(x));
  const inferred = [];
  if (verdict === 'FALSE' || verdict === 'STALE') {
    const [lo, hi] = range(lines.split(','));
    for (const f of F) {
      if (explicit.includes(f.id) || mapped.includes(f.id)) continue;
      for (const l of f.parsed) {
        if (l.path !== p.doc) continue;
        if (!l.lo || !lo) continue;
        if (l.hi - l.lo > 20) continue; // broad ranges (whole sections) are not evidence of coverage
        if (l.lo <= hi && lo <= l.hi) { inferred.push(f.id); break; }
      }
    }
  }
  return { id: p.id, p, g, doc: p.doc, lines, first: range(lines.split(','))[0], verdict, res, explicit, mapped, inferred, claim: O.claimText[p.id] || p.claim };
});
if (unresolved.length) { console.error('UNRESOLVED:\n' + unresolved.join('\n')); }

// ---------- doc keys ----------
const CONTRACTS = fs.readFileSync(path.join(__dirname, '..', '..', 'contracts.txt'), 'utf8').split(/\r?\n/).filter(Boolean);
const headerEnd = {};
for (const c of CONTRACTS) {
  const ls = fs.readFileSync(path.join(REPO, c), 'utf8').split(/\r?\n/);
  headerEnd[c] = ls.findIndex((l) => /\*\//.test(l)) + 1;
}
const FIXED = [
  ['.agents/skills/dooph-ds-codebase/SKILL.md', 'CB'], ['.agents/skills/dooph-ds-architecture/SKILL.md', 'ARCH'],
  ['.agents/skills/dooph-ds-contribution/SKILL.md', 'CONTRIB'], ['.agents/skills/dooph-ds-loading-indicators/SKILL.md', 'LI'],
  ['.claude/skills/dooph-ds-loading-indicators/SKILL.md', 'LIC'], ['.agents/skills/dooph-ds-writing-version-migrations/SKILL.md', 'VM'],
  ['.agents/skills/file-header-contracts/SKILL.md', 'FHC'], ['.agents/skills/file-header-contracts/references/agents-md-snippet.md', 'FHC-SNIPPET'],
  ['.agents/skills/file-header-contracts/references/evaluation.md', 'FHC-EVAL'], ['AGENTS.md', 'AGENTS'],
  ['skills/dooph-design-system-usage/SKILL.md', 'USAGE'], ['skills/dooph-design-system-usage/references/responsive-sheet-modal.md', 'RSM'],
  ['skills/dooph-design-system-theming/SKILL.md', 'THEME'], ['skills/dooph-design-system-theming/references/token-contract.md', 'TC'],
  ['skills/dooph-design-system-v3-migration/SKILL.md', 'V3'], ['skills/dooph-design-system-v5-migration/SKILL.md', 'V5'],
  ['skills/dooph-design-system-v5-migration/codemod.mjs', 'V5CM'], ['README.md', 'README'], ['CHANGELOG.md', 'CHANGELOG'],
  ['CONTRIBUTING.md', 'CONTRIBUTING'], ['SECURITY.md', 'SECURITY'], ['THIRD_PARTY_NOTICES.md', 'NOTICES'], ['LICENSE.txt', 'LICENSE'],
  ['package.json', 'PKG'], ['skills-lock.json', 'SKILLSLOCK'],
  ['docs/superpowers/specs/2026-08-31-digits-sidebar-mono-design.md', 'SPEC'], ['2026-09-20-visx-charts-design.md', 'SPEC-CHARTS'],
  ['.claude/research/2026-08-27-date-picker-foundation-research.md', 'RESEARCH'], ['executor-prompt-oss-publication.md', 'PROMPT'],
];
const fixedKey = Object.fromEntries(FIXED);
const ORDER = FIXED.map((x) => x[1]);
function codeKey(doc, first) {
  const parts = doc.split('/');
  const fname = parts[parts.length - 1];
  let base = /\.css$/.test(fname) ? fname : fname.replace(/\.(tsx?|mjs|cjs|html|ya?ml)$/, '');
  if (/^(constants|index)$/.test(base)) base = parts[parts.length - 2] + '.' + base;
  const isHdr = headerEnd[doc] && first && first <= headerEnd[doc];
  return (isHdr ? 'HDR-' : 'JSDOC-') + base;
}
for (const x of G) x.key = fixedKey[x.doc] || codeKey(x.doc, x.first);
const keyDoc = {};
for (const x of G) keyDoc[x.key] = x.doc;
const keys = [...new Set(G.map((x) => x.key))].sort((a, b) => {
  const ia = ORDER.indexOf(a); const ib = ORDER.indexOf(b);
  if (ia >= 0 || ib >= 0) return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib);
  const ha = a.startsWith('HDR-') ? 0 : 1; const hb = b.startsWith('HDR-') ? 0 : 1;
  return ha - hb || a.localeCompare(b);
});
for (const k of keys) {
  const xs = G.filter((x) => x.key === k).sort((a, b) => a.first - b.first || a.lines.localeCompare(b.lines) || a.id.localeCompare(b.id));
  xs.forEach((x, i) => { x.cid = 'C-' + k + '-' + (i + 1); });
}

// ---------- rendering ----------
const esc = (s) => String(s || '').replace(/\r?\n/g, ' ').replace(/(?<!\\)\|/g, '\\|');
function evidenceCell(x) {
  const parts = [];
  for (const r of x.g) {
    const raw = r.verdictRaw.trim();
    const note = raw.toUpperCase() === x.verdict ? '' : ' [' + raw + ']';
    const cited = r.citedLines ? ' (cited :' + r.citedLines + ')' : '';
    parts.push('**' + r.unit + '**' + note + cited + ': ' + r.evidence);
  }
  if (x.res) parts.push('**HD** (' + x.res.kind + '): ' + x.res.m);
  return esc(parts.join(' · '));
}
function findingsCell(x) {
  const a = [...x.explicit, ...x.mapped.map((i) => '≈' + i), ...x.inferred.map((i) => '~' + i)];
  return a.length ? a.join(', ') : (x.verdict === 'FALSE' || x.verdict === 'STALE' ? 'UNCOVERED' : '—');
}
function pathLine(x) { return x.doc + (x.lines ? ':' + x.lines : ''); }
function units(x) { return [...new Set(x.g.map((r) => r.unit))].sort((a, b) => +a.slice(1) - +b.slice(1)).join(', '); }

const stats = {};
for (const k of keys) {
  const xs = G.filter((x) => x.key === k);
  stats[k] = { doc: keyDoc[k], total: xs.length, TRUE: 0, FALSE: 0, STALE: 0, UNVERIFIABLE: 0 };
  for (const x of xs) stats[k][x.verdict] = (stats[k][x.verdict] || 0) + 1;
}

if (DRY) {
  console.log('groups', G.length, 'excluded', excluded.length, 'dropped', dropped.length, 'keys', keys.length);
  const tot = { TRUE: 0, FALSE: 0, STALE: 0, UNVERIFIABLE: 0 };
  for (const x of G) tot[x.verdict] = (tot[x.verdict] || 0) + 1;
  console.log(tot);
  const unc = G.filter((x) => (x.verdict === 'FALSE' || x.verdict === 'STALE') && !x.explicit.length && !x.mapped.length && !x.inferred.length);
  console.log('UNCOVERED', unc.length);
  for (const x of unc) console.log('  ', x.cid, pathLine(x), '|', x.claim.slice(0, 90));
  const inf = G.filter((x) => (x.verdict === 'FALSE' || x.verdict === 'STALE') && !x.explicit.length && !x.mapped.length && x.inferred.length);
  console.log('INFERRED-ONLY', inf.length);
  for (const x of inf) console.log('  ', x.cid, pathLine(x), '|', x.inferred.join(','), '|', x.claim.slice(0, 70));
  fs.writeFileSync(path.join(__dirname, 'groups.json'), JSON.stringify(G.map((x) => ({ cid: x.cid, id: x.id, members: x.g.map((r) => r.id), doc: x.doc, lines: x.lines, verdict: x.verdict, explicit: x.explicit, inferred: x.inferred, claim: x.claim })), null, 1));
  process.exit(0);
}
module.exports = { G, keys, keyDoc, stats, excluded, dropped, esc, evidenceCell, findingsCell, pathLine, units, OUT, O, F };
