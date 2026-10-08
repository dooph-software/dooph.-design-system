// Assemble docs/audit/FINDINGS.md from the composer outputs and the Phase 1–4 artefacts.
// Usage (repo root): node docs/audit/_work/scratch/orch/assemble-findings.mjs [--check]
//   --check : validate only (all F-IDs present, field order, remediation targets) and print problems.
import fs from 'node:fs';

const W = 'docs/audit/_work';
const CHECK = process.argv.includes('--check');
const FIELDS = ['severity', 'category', 'rules', 'scope', 'confidence', 'verified_by', 'locations',
  'evidence', 'impact', 'recommendation', 'breaking', 'contract', 'remediation', 'related'];

const fmap = fs.readFileSync(`${W}/fid-map.psv`, 'utf8').trim().split(/\r?\n/).slice(1).map((l) => {
  const [fid, key, sev, cat, scope, members, verify, route, breaking, title] = l.split('|');
  return { fid, key, sev, cat, scope, members, verify, route, breaking, title };
});
const byFid = new Map(fmap.map((r) => [r.fid, r]));

// Collect blocks
const blocks = new Map();
const problems = [];
const FDIR = fs.existsSync(`${W}/final/remapped`) ? `${W}/final/remapped` : `${W}/final`;
for (const f of fs.readdirSync(FDIR).filter((f) => /^F-C\d[a-z]?\.md$/.test(f)).sort()) {
  const text = fs.readFileSync(`${FDIR}/${f}`, 'utf8');
  for (const part of text.split(/\n(?=### F-\d{3}:)/)) {
    const m = part.match(/^### (F-\d{3}):/);
    if (!m) continue;
    let body = part.replace(/\n## DONE[\s\S]*$/, '').replace(/\n+# [^\n]*$/, '').trimEnd();
    // drop orchestrator notes from the published block
    const notes = [...body.matchAll(/^- note-to-orchestrator:.*$/gm)].map((x) => x[0]);
    if (notes.length) problems.push(`${m[1]} (${f}) notes: ${notes.join(' / ').slice(0, 300)}`);
    body = body.replace(/^- note-to-orchestrator:.*\n?/gm, '').trimEnd();
    if (blocks.has(m[1])) problems.push(`DUPLICATE ${m[1]} in ${f}`);
    blocks.set(m[1], { body, file: f });
  }
}
for (const r of fmap) if (!blocks.has(r.fid)) problems.push(`MISSING ${r.fid} (${r.key})`);
for (const [fid, b] of blocks) {
  if (!byFid.has(fid)) { problems.push(`UNKNOWN ${fid} in ${b.file}`); continue; }
  const order = [...b.body.matchAll(/^- ([a-z_]+):/gm)].map((x) => x[1]).filter((k) => FIELDS.includes(k));
  const expect = FIELDS.join(',');
  if (order.join(',') !== expect) problems.push(`FIELD ORDER ${fid}: ${order.join(',')}`);
  const sev = (b.body.match(/^- severity:\s*(S\d)/m) || [])[1];
  if (sev !== byFid.get(fid).sev) problems.push(`SEVERITY ${fid}: block ${sev} vs map ${byFid.get(fid).sev}`);
  const cat = (b.body.match(/^- category:\s*([a-z-]+)/m) || [])[1];
  if (cat !== byFid.get(fid).cat) problems.push(`CATEGORY ${fid}: block ${cat} vs map ${byFid.get(fid).cat}`);
  if (!/^- remediation:\s*\S/m.test(b.body)) problems.push(`NO REMEDIATION ${fid}`);
  if (/^- confidence:\s*plausible\s*$/m.test(b.body)) problems.push(`PLAUSIBLE WITHOUT REASON ${fid}`);
}
if (CHECK) {
  console.log(problems.length ? problems.join('\n') : 'OK');
  process.exit(0);
}

const read = (p) => fs.readFileSync(p, 'utf8');
const strip = (t) => t.replace(/\n## DONE[\s\S]*$/, '').trim();
const count = (k) => fmap.reduce((a, r) => ((a[r[k]] = (a[r[k]] || 0) + 1), a), {});
const sevCount = count('sev');
const catCount = count('cat');
const lsFiles = 504;

const header = `# Audit findings — @dooph-software/design-system

- audited commit: \`b436647c5b5713bdadceef3b5def90b0ad5357f1\` (all \`path:line\` references are @ this SHA)
- audit dates: 2026-09-29 → 2026-10-01
- \`git ls-files | wc -l\`: ${lsFiles}
- baseline: \`npm run lint\` exit 0 · \`npm run build\` (separate worktree) exit 0 with **no generated drift** · \`npm run build-storybook\` exit 0 · \`npm pack --dry-run\` 2519 files
- companion docs: [SUMMARY.md](SUMMARY.md) · [REMEDIATION.md](REMEDIATION.md) · evidence kept in [\_work/](_work/) (unit reports, horizontal passes, verifier logs, scripts)

## Grades

${strip(read(`${W}/grades.md`))}

## Counts

| severity | count |
|---|---|
${['S1', 'S2', 'S3', 'S4'].map((s) => `| ${s} | ${sevCount[s] || 0} |`).join('\n')}
| **total** | **${fmap.length}** |

| category | count |
|---|---|
${Object.entries(catCount).sort((a, b) => b[1] - a[1]).map(([c, n]) => `| ${c} | ${n} |`).join('\n')}

Index (F-ID · severity · category · title):

| F-ID | sev | category | title |
|---|---|---|---|
${fmap.map((r) => {
  const h = (blocks.get(r.fid)?.body.match(/^### F-\d{3}:\s*(.*)$/m) || [])[1] || r.title;
  return `| ${r.fid} | ${r.sev} | ${r.cat} | ${h.replace(/\|/g, '\\|')} |`;
}).join('\n')}
`;

const rulebook = strip(read(`${W}/rulebook.md`)).replace(/^# .*\n/, '');
const findings = fmap.map((r) => blocks.get(r.fid)?.body || `### ${r.fid}: MISSING`).join('\n\n');
const claims = strip(read(`${W}/horizontal/claims-register.md`)).replace(/^# .*\n/, '');
const matrix = strip(read(`${W}/horizontal/H2-matrix.md`)).replace(/^# .*\n/, '');
const ledger = read(`${W}/ledger.md`).trim();
const appendix = strip(read(`${W}/appendix.md`));

const out = `${header}
## 2. Rulebook (R-IDs)

${rulebook}

## 3. Findings

${findings}

## 4. Claims register (C-IDs)

${claims}

## 5. Consistency matrices

${matrix}

## 6. Coverage ledger

Status values: \`findings\` (≥1 finding cites the file) · \`reviewed-clean\` · \`claims-checked\` · \`pattern-verified\` (Icons leaves, normalised-shape diff; outliers read in full) · \`generated-verified\` (Shapes/svgs, script) · \`provenance-only\` (Tier 3).

${ledger}

## 7. Appendix — method, refuted items, verification log

${appendix}
`;
fs.writeFileSync('docs/audit/FINDINGS.md', out);
console.log(`wrote docs/audit/FINDINGS.md (${out.length} chars); problems: ${problems.length}`);
if (problems.length) console.log(problems.join('\n'));
