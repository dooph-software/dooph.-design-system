// V5: arbitrary-value literals and numeric-scale utilities in non-story TS/TSX (comments stripped).
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '../../../../../src');
function walk(d, out = []) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(ts|tsx)$/.test(e.name) && !/\.stories\./.test(e.name) && !/\.test\./.test(e.name)) out.push(p);
  }
  return out;
}
function stripComments(src) {
  let out = '', i = 0, inStr = null;
  while (i < src.length) {
    const c = src[i], n = src[i + 1];
    if (inStr) { out += c; if (c === '\\') { out += n; i += 2; continue; } if (c === inStr) inStr = null; i++; continue; }
    if (c === '"' || c === "'" || c === '`') { inStr = c; out += c; i++; continue; }
    if (c === '/' && n === '*') { const j = src.indexOf('*/', i + 2); out += src.slice(i, j + 2).replace(/[^\n]/g, ' '); i = j + 2; continue; }
    if (c === '/' && n === '/') { const j = src.indexOf('\n', i); const end = j < 0 ? src.length : j; out += ' '.repeat(end - i); i = end; continue; }
    out += c; i++;
  }
  return out;
}
const arb = [], num = [], rawvar = [];
const numRe = /(?<![\w\[-])-?(p|px|py|pt|pb|pl|pr|ps|pe|m|mx|my|mt|mb|ml|mr|ms|me|gap|gap-x|gap-y|space-x|space-y|inset|inset-x|inset-y|top|left|right|bottom|start|end|w|h|size|min-w|min-h|max-w|max-h|translate-x|translate-y|basis)-(\d+(?:\.\d+)?)(?![\w.\/-])/g;
for (const f of walk(root)) {
  const rel = path.relative(path.resolve(root, '..'), f).replace(/\\/g, '/');
  const lines = stripComments(fs.readFileSync(f, 'utf8')).split('\n');
  lines.forEach((ln, idx) => {
    const loc = `${rel}:${idx + 1}`;
    // only inspect string-literal content
    const strs = [...ln.matchAll(/"([^"]*)"|'([^']*)'|`([^`]*)`/g)].map(m => m[1] ?? m[2] ?? m[3]);
    for (const s of strs) {
      for (const m of s.matchAll(/(?<![\w-])!?-?([a-z][a-z0-9-]*)-\[([^\]\s]+)\]/g)) {
        const [tok, util, val] = m;
        if (/^(data|group|aria|peer|has|supports)$/.test(util)) continue;
        if (/var\(/.test(val)) { if (/var\(--ui-/.test(val)) rawvar.push(`${loc}  ${tok}`); continue; }
        if (!/\d/.test(val)) continue;
        arb.push(`${loc}  ${tok}`);
      }
      for (const m of s.matchAll(numRe)) num.push(`${loc}  ${m[0]}  (${m[2]})`);
    }
  });
}
console.log('ARBITRARY literal-bearing', arb.length); console.log(arb.join('\n'));
const nz = num.filter(s => !/\((0)\)$/.test(s));
console.log('\nNUMERIC SCALE total', num.length, 'non-zero', nz.length, 'files', new Set(nz.map(s => s.split(':')[0])).size); console.log(nz.join('\n'));
console.log('\nRAW var(--ui-*) in class strings', rawvar.length); console.log(rawvar.join('\n'));
