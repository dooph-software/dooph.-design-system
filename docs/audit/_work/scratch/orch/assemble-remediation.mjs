// Assemble docs/audit/REMEDIATION.md and remap local WI ids (WI-C#-nn, WI-RELEASE-*) to global WI-nnn.
// Usage (repo root):
//   node docs/audit/_work/scratch/orch/assemble-remediation.mjs --check   # validate only
//   node docs/audit/_work/scratch/orch/assemble-remediation.mjs           # write REMEDIATION.md + remapped F blocks to _work/final/remapped/
import fs from 'node:fs';

const W = 'docs/audit/_work';
const CHECK = process.argv.includes('--check');
const read = (p) => fs.readFileSync(p, 'utf8');
const AREA_ORDER = ['C1', 'C2', 'C3', 'C4', 'C4b', 'C5', 'C6', 'C7', 'C7b', 'R'];
const PHASES = ['P0', 'P1', 'P2', 'P3', 'P4'];

const fmap = read(`${W}/fid-map.psv`).trim().split(/\r?\n/).slice(1).map((l) => {
  const [fid, key, sev, cat, scope, members, verify, route, breaking, title] = l.split('|');
  return { fid, key, sev, cat, route, title };
});
const fids = new Set(fmap.map((r) => r.fid));
const problems = [];

// ---- parse WIs
const wis = [];
for (const f of fs.readdirSync(`${W}/final`).filter((f) => /^WI-(C\d[a-z]?|R)\.md$/.test(f)).sort()) {
  const area = f.match(/^WI-(C\d[a-z]?|R)\.md$/)[1];
  const text = read(`${W}/final/${f}`).replace(/WI-RELEASE-MIGRATION/g, 'WI-RELEASE-OPEN');
  text.split(/\n(?=### WI-[A-Z0-9-]+:)/).forEach((part, idx) => {
    const m = part.match(/^### (WI-[A-Z0-9-]+):\s*(.*)/);
    if (!m) return;
    const body = part.replace(/\n## DONE[\s\S]*$/, '').trimEnd();
    const field = (k) => (body.match(new RegExp(`^- ${k}:\\s*(.*)$`, 'm')) || [])[1]?.trim() ?? '';
    const list = (k) => (field(k).match(/[A-Z]+-[A-Z0-9-]+/g) || []);
    const phase = (field('phase').match(/P\d/) || ['??'])[0];
    wis.push({
      local: m[1], title: m[2].trim(), area, idx, body, phase,
      status: field('status'), semver: (field('semver').match(/none|patch|minor|major/) || ['none'])[0],
      addresses: list('addresses').filter((x) => x.startsWith('F-')),
      depends: list('depends_on').filter((x) => x.startsWith('WI-')),
    });
  });
}
const byLocal = new Map(wis.map((w) => [w.local, w]));
// release ordering: CLOSE depends on every other P4 item
const close = byLocal.get('WI-RELEASE-CLOSE');
if (close) for (const w of wis) if (w.phase === 'P4' && w.local !== 'WI-RELEASE-CLOSE' && !close.depends.includes(w.local)) close.depends.push(w.local);
// A WI cannot run before something it depends on: raise it to its latest dependency's phase (fixed point) and log why.
for (let changed = true, n = 0; changed && n < 20; n++) {
  changed = false;
  for (const w of wis) {
    for (const d of w.depends) {
      const dep = byLocal.get(d);
      if (dep && PHASES.indexOf(dep.phase) > PHASES.indexOf(w.phase)) {
        const from = w.phase;
        w.phase = dep.phase;
        w.body = w.body.replace(/^- phase:.*$/m, `- phase: ${w.phase}`)
          .replace(/(^- log:\n)/m, `$1  - 2026-10-02 — phase raised from ${from} to ${w.phase} at assembly: it depends on ${d} (${dep.phase})\n`);
        changed = true;
      }
    }
  }
}
for (const w of wis) {
  if (!PHASES.includes(w.phase)) problems.push(`BAD PHASE ${w.local}: ${w.phase}`);
  if (!w.addresses.length) problems.push(`NO FINDING ${w.local}`);
  for (const a of w.addresses) if (!fids.has(a)) problems.push(`UNKNOWN F ${a} in ${w.local}`);
  for (const d of w.depends) {
    if (!byLocal.has(d)) problems.push(`UNKNOWN DEP ${d} in ${w.local}`);
    else if (PHASES.indexOf(byLocal.get(d).phase) > PHASES.indexOf(w.phase)) problems.push(`DEP ON LATER PHASE ${w.local}(${w.phase}) → ${d}(${byLocal.get(d).phase})`);
  }
  if (!/CHECKPOINT/.test(w.body)) problems.push(`NO CHECKPOINT ${w.local}`);
  if (/\bTBD\b|similar to WI-|clean up /i.test(w.body)) problems.push(`PLACEHOLDER-ISH ${w.local}`);
  if (!/^- anchor:/m.test(w.body) && !/^- files:[\s\S]*create:/m.test(w.body)) problems.push(`NO ANCHOR ${w.local}`);
}

// ---- order: phase, then topological within phase, tie-break area/idx; RELEASE-OPEN first in P4
const sorted = [];
for (const ph of PHASES) {
  const pool = wis.filter((w) => w.phase === ph).sort((a, b) =>
    (a.local === 'WI-RELEASE-OPEN' ? -1 : b.local === 'WI-RELEASE-OPEN' ? 1 : 0) ||
    (a.local === 'WI-RELEASE-CLOSE' ? 1 : b.local === 'WI-RELEASE-CLOSE' ? -1 : 0) ||
    AREA_ORDER.indexOf(a.area) - AREA_ORDER.indexOf(b.area) || a.idx - b.idx);
  const done = new Set(sorted.map((w) => w.local));
  let guard = 0;
  while (pool.length && guard++ < 10000) {
    const i = pool.findIndex((w) => w.depends.every((d) => done.has(d) || !byLocal.has(d) || byLocal.get(d).phase !== ph));
    if (i < 0) { problems.push(`CYCLE in ${ph}: ${pool.map((w) => w.local).join(', ')}`); sorted.push(...pool); break; }
    const [w] = pool.splice(i, 1); sorted.push(w); done.add(w.local);
  }
}
sorted.forEach((w, i) => { w.gid = 'WI-' + String(i + 1).padStart(3, '0'); });
const g = new Map(sorted.map((w) => [w.local, w.gid]));
const remap = (t) => t.replace(/WI-RELEASE-MIGRATION/g, 'WI-RELEASE-OPEN')
  .replace(/WI-(?:C\d-\d+|RELEASE-OPEN|RELEASE-CLOSE)\b/g, (x) => (g.has(x) ? `\u0000${g.get(x)}` : x)).replace(/\u0000/g, '');

// ---- findings traceability (read F blocks, remap)
const fBlocks = new Map();
for (const f of fs.readdirSync(`${W}/final`).filter((f) => /^F-C\d[a-z]?\.md$/.test(f))) {
  for (const part of read(`${W}/final/${f}`).split(/\n(?=### F-\d{3}:)/)) {
    const m = part.match(/^### (F-\d{3}):/);
    if (m) fBlocks.set(m[1], { file: f, text: part });
  }
}
const addressedBy = new Map();
for (const w of sorted) for (const a of w.addresses) { if (!addressedBy.has(a)) addressedBy.set(a, []); addressedBy.get(a).push(w.gid); }
for (const r of fmap) {
  const b = fBlocks.get(r.fid);
  const rem = (b ? (b.text.match(/^- remediation:\s*(.*)$/m) || [])[1] || '' : '').replace(/WI-RELEASE-MIGRATION/g, 'WI-RELEASE-OPEN');
  for (const x of rem.match(/WI-[A-Z0-9-]+/g) || []) if (!g.has(x) && !/^WI-\d{3}$/.test(x)) problems.push(`F REMEDIATION → UNKNOWN ${x} in ${r.fid}`);
  if (r.sev === 'S4') continue;
  const ok = addressedBy.has(r.fid) || /decision D-\d+|no-action/.test(rem);
  if (!ok) problems.push(`UNREMEDIATED ${r.fid} (${r.sev} ${r.key}) rem="${rem}"`);
}
if (CHECK) {
  console.log(`WIs: ${wis.length} (${PHASES.map((p) => `${p}:${wis.filter((w) => w.phase === p).length}`).join(' ')})`);
  console.log(problems.length ? problems.join('\n') : 'OK');
  process.exit(0);
}

// ---- write remapped F blocks for the findings assembler
fs.mkdirSync(`${W}/final/remapped`, { recursive: true });
for (const f of fs.readdirSync(`${W}/final`).filter((f) => /^F-C\d[a-z]?\.md$/.test(f))) {
  fs.writeFileSync(`${W}/final/remapped/${f}`, remap(read(`${W}/final/${f}`)));
}

// ---- decisions: fill blocks lines
const blockedBy = new Map();
for (const w of sorted) for (const d of w.status.match(/D-\d+/g) || []) { if (!blockedBy.has(d)) blockedBy.set(d, []); blockedBy.get(d).push(w.gid); }
let decisions = remap(read(`${W}/remediation-decisions.md`)).replace(/### (D-\d+):([\s\S]*?)- blocks: ([^\n]*)/g, (all, d, mid, txt) =>
  `### ${d}:${mid}- blocks: ${(blockedBy.get(d) || []).join(', ') || 'none'} — ${txt}`);

const board = ['| WI | title | phase | status | addresses | depends_on | breaking | blocked_by |', '|---|---|---|---|---|---|---|---|'];
for (const w of sorted) {
  const blocked = (w.status.match(/D-\d+/g) || []).join(', ') || '—';
  const status = w.status.replace(/\s+#.*$/, '').replace(/\(.*$/, '') + (blocked !== '—' ? `(${blocked})` : '');
  board.push(`| ${w.gid} | ${remap(w.title).replace(/\|/g, '\\|')} | ${w.phase} | ${status} | ${w.addresses.join(', ')} | ${w.depends.map((d) => g.get(d) || d).join(', ') || '—'} | ${w.semver === 'major' ? 'major' : 'none'} | ${blocked} |`);
}
const phaseTitle = {
  P0: 'P0 — prerequisites for verification', P1: 'P1 — no-behaviour-change cleanups', P2: 'P2 — internal restructuring',
  P3: 'P3 — consumer-visible, non-breaking fixes', P4: 'P4 — breaking changes (one major release)',
};
let phases = '';
for (const ph of PHASES) {
  const list = sorted.filter((w) => w.phase === ph);
  phases += `\n### ${phaseTitle[ph]}\n\n`;
  if (!list.length) { phases += read(`${W}/remediation-p0.md`).trim() + '\n'; continue; }
  for (const w of list) {
    let body = remap(w.body).replace(/^### WI-[A-Z0-9-]+:/, `### ${w.gid}:`);
    body = body.replace(/^- depends_on:.*$/m, `- depends_on: [${w.depends.map((d) => g.get(d) || d).join(', ')}]`);
    phases += `${body}\n\n`;
  }
}
const head = remap(read(`${W}/remediation-head.md`)).trim();
const out = `${head}

${decisions.trim()}

## Status board

${board.join('\n')}

## Phases and work items
${phases}
## Document change log

- 2026-10-01 — created by the audit of \`b436647\` (${sorted.length} work items, ${(decisions.match(/^### D-\d+/gm) || []).length} decision items). All items \`todo\` or \`blocked\`; nothing executed.
`;
fs.writeFileSync('docs/audit/REMEDIATION.md', out);
fs.writeFileSync(`${W}/wi-map.psv`, ['local|gid|phase|status', ...sorted.map((w) => `${w.local}|${w.gid}|${w.phase}|${w.status}`)].join('\n') + '\n');
console.log(`wrote docs/audit/REMEDIATION.md (${sorted.length} WIs); problems: ${problems.length}`);
if (problems.length) console.log(problems.join('\n'));
