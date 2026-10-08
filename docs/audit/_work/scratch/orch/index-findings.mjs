// Parse docs/audit/_work/{units,horizontal}/*.md findings into a compact TSV index.
// Usage: node docs/audit/_work/scratch/orch/index-findings.mjs > docs/audit/_work/index.tsv
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('docs/audit/_work');
const dirs = ['units', 'horizontal'].map((d) => path.join(root, d)).filter((d) => fs.existsSync(d));
const rows = [];
for (const dir of dirs) {
  for (const f of fs.readdirSync(dir).filter((f) => f.endsWith('.md')).sort()) {
    const text = fs.readFileSync(path.join(dir, f), 'utf8');
    const blocks = text.split(/\n(?=### [A-Z0-9]+-F\d+[a-z]?:)/);
    for (const b of blocks) {
      const m = b.match(/^### ([A-Z0-9]+-F\d+[a-z]?):\s*(.+)/);
      if (!m) continue;
      const field = (k) => {
        const r = b.match(new RegExp(`^- ${k}:\\s*(.*)$`, 'm'));
        return r ? r[1].trim().replace(/\s+#.*$/, '') : '';
      };
      const locBlock = b.match(/^- locations:\s*\n((?:\s+- .*\n?)+)/m);
      const locs = locBlock ? locBlock[1].trim().split('\n').map((l) => l.replace(/^\s*-\s*/, '').trim()) : [];
      rows.push([
        m[1], field('severity'), field('category'), field('rules'), field('scope'),
        String(locs.length), (locs[0] || '').slice(0, 70), m[2].replace(/\t/g, ' ').slice(0, 170),
      ]);
    }
  }
}
console.log(['id', 'sev', 'cat', 'rules', 'scope', 'nloc', 'loc0', 'title'].join('\t'));
for (const r of rows) console.log(r.join('\t'));
const bySev = {};
for (const r of rows) bySev[r[1]] = (bySev[r[1]] || 0) + 1;
console.error('total', rows.length, JSON.stringify(bySev));
