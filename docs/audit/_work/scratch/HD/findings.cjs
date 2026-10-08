// HD: index every unit finding (id, severity, category, title, locations) -> findings.json
const fs = require('fs');
const path = require('path');
const UNITS = path.join(__dirname, '..', '..', 'units');
const out = [];
for (const f of fs.readdirSync(UNITS).filter((x) => /^U\d+\.md$/.test(x))) {
  const lines = fs.readFileSync(path.join(UNITS, f), 'utf8').split(/\r?\n/);
  let cur = null; let inLoc = false;
  for (const line of lines) {
    const h = line.match(/^### (U\d+-F\d+[a-z]?):\s*(.*)$/);
    if (h) { cur = { id: h[1], title: h[2], sev: '', cat: '', locs: [] }; out.push(cur); inLoc = false; continue; }
    if (/^## /.test(line)) { cur = null; inLoc = false; continue; }
    if (!cur) continue;
    let m;
    if ((m = line.match(/^- severity:\s*(\S+)/))) cur.sev = m[1];
    if ((m = line.match(/^- category:\s*(\S+)/))) cur.cat = m[1];
    if (/^- locations:/.test(line)) { inLoc = true; const rest = line.replace(/^- locations:\s*/, ''); if (rest) cur.locs.push(rest); continue; }
    if (inLoc) {
      if (/^\s+-\s+/.test(line)) { cur.locs.push(line.replace(/^\s+-\s+/, '').trim()); continue; }
      if (/^- /.test(line)) inLoc = false;
    }
  }
}
// parse locs into {path, lo, hi}
for (const f of out) {
  f.parsed = [];
  for (const l of f.locs) {
    for (const part of l.split(/[;,]\s*(?=[\w./-]+:\d)|\s+\(|\s+—/)) {
      const m = part.match(/([\w./@-]+\.(?:md|tsx?|css|mjs|cjs|json|ya?ml|html|txt))(?::(\d+)(?:[-–](\d+))?)?/);
      if (m) f.parsed.push({ path: m[1], lo: m[2] ? +m[2] : 0, hi: m[3] ? +m[3] : (m[2] ? +m[2] : 0) });
    }
  }
}
fs.writeFileSync(path.join(__dirname, 'findings.json'), JSON.stringify(out, null, 1));
console.log('findings', out.length);
const noLoc = out.filter((f) => !f.parsed.length).map((f) => f.id);
console.log('without parsed locations', noLoc.length, noLoc.join(' '));
