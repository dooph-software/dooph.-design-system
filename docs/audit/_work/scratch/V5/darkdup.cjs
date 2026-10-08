// V5: compare every custom property declared in tokens.css `.dark` against its `:root, .light` value.
const fs = require('fs');
const path = require('path');
const raw = fs.readFileSync(path.resolve(__dirname, '../../../../../src/styles/tokens.css'), 'utf8');
const src = raw.replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '));
// find top-level blocks: selector { ... } with brace matching
const blocks = [];
let i = 0;
while (i < src.length) {
  const open = src.indexOf('{', i);
  if (open < 0) break;
  const sel = src.slice(i, open).trim().replace(/\s+/g, ' ');
  let depth = 1, j = open + 1;
  while (depth && j < src.length) { if (src[j] === '{') depth++; else if (src[j] === '}') depth--; j++; }
  const startLine = src.slice(0, open).split('\n').length;
  blocks.push({ sel, body: src.slice(open + 1, j - 1), bodyStart: open + 1, startLine });
  i = j;
}
console.log('top-level blocks:', blocks.map(b => `${b.sel} @${b.startLine}`).join(' | '));
function decls(b) {
  const out = new Map();
  for (const m of b.body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    const line = src.slice(0, b.bodyStart + m.index).split('\n').length;
    out.set(m[1], { v: m[2].trim().replace(/\s+/g, ' '), line });
  }
  return out;
}
const root = blocks.filter(b => /:root/.test(b.sel)).map(decls).reduce((a, m) => new Map([...a, ...m]), new Map());
const dark = blocks.filter(b => /\.dark/.test(b.sel)).map(decls).reduce((a, m) => new Map([...a, ...m]), new Map());
let same = [], darkOnly = [];
for (const [k, d] of dark) {
  const r = root.get(k);
  if (!r) darkOnly.push(`${k} (.dark:${d.line})`);
  else if (r.v === d.v) same.push(`${k}: ${d.v}   (:root:${r.line}  .dark:${d.line})`);
}
console.log(`:root decls ${root.size}, .dark decls ${dark.size}`);
console.log(`IDENTICAL in .dark (${same.length}):\n  ` + same.join('\n  '));
console.log(`dark-only (${darkOnly.length}): ` + darkOnly.join(', '));
