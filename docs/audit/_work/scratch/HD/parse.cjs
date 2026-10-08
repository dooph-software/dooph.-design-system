// HD: extract every "Claim results" table row from units/U*.md into rows.json
// Usage: node parse.cjs > rows.tsv   (also writes rows.json next to this file)
const fs = require('fs');
const path = require('path');
const UNITS = path.join(__dirname, '..', '..', 'units');

function splitCells(line) {
  // split a markdown table row on | that is not escaped and not inside backticks
  const cells = [];
  let cur = '';
  let inTick = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '`') { inTick = !inTick; cur += c; continue; }
    if (c === '\\' && line[i + 1] === '|') { cur += '\\|'; i++; continue; }
    if (c === '|' && !inTick) { cells.push(cur); cur = ''; continue; }
    cur += c;
  }
  cells.push(cur);
  // drop leading/trailing empties from the outer pipes
  if (cells.length && cells[0].trim() === '') cells.shift();
  if (cells.length && cells[cells.length - 1].trim() === '') cells.pop();
  return cells.map((s) => s.trim());
}

const out = [];
const files = fs.readdirSync(UNITS).filter((f) => /^U\d+\.md$/.test(f));
for (const f of files) {
  const unit = f.replace('.md', '');
  const lines = fs.readFileSync(path.join(UNITS, f), 'utf8').split(/\r?\n/);
  let inSec = false;
  let sub = '';
  let header = null;
  lines.forEach((line, idx) => {
    if (/^## /.test(line)) {
      inSec = /Claim results/i.test(line);
      sub = '';
      header = null;
      return;
    }
    if (!inSec) return;
    if (/^### /.test(line)) { sub = line.replace(/^###\s*/, ''); header = null; return; }
    if (!/^\s*\|/.test(line)) { header = null; return; }
    const cells = splitCells(line);
    if (cells.every((c) => /^:?-{3,}:?$/.test(c))) return; // separator
    if (!header) { header = cells; return; }
    out.push({ unit, fileLine: idx + 1, sub, ncol: cells.length, header: header.join(' | '), cells });
  });
}
fs.writeFileSync(path.join(__dirname, 'rows.json'), JSON.stringify(out, null, 1));
for (const r of out) {
  console.log([r.unit, r.fileLine, r.ncol, r.sub, ...r.cells].join('\t'));
}
console.error('rows:', out.length, 'by unit:', JSON.stringify(out.reduce((a, r) => ((a[r.unit] = (a[r.unit] || 0) + 1), a), {})));
