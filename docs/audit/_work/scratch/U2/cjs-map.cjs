// Pair each ESM chunk (whose .map names its single src module) with the CJS
// chunk exporting the same names, then report CJS stamping vs source directive.
// node cjs-map.cjs <buildRoot>
const fs = require('fs');
const path = require('path');
const root = process.argv[2];
const dist = path.join(root, 'dist');
const rows = require('./dist-map.json');

function esmExports(txt) {
  const m = [...txt.matchAll(/export\s*\{([^}]*)\}\s*;?\s*$/gm)].pop();
  if (!m) return [];
  return m[1].split(',').map((s) => s.trim()).filter(Boolean).map((s) => s.split(/\s+as\s+/).pop().trim()).sort();
}
function cjsExports(txt) {
  return [...new Set([...txt.matchAll(/exports\.([A-Za-z_$][\w$]*)\s*=/g)].map((m) => m[1]))]
    .filter((n) => n !== '__esModule').sort();
}
function srcDirective(rel) {
  const src = fs.readFileSync(path.join(root, rel), 'utf8');
  const stripped = src.replace(/^\s*(\/\*[\s\S]*?\*\/\s*|\/\/[^\n]*\n\s*)*/, '');
  return /^['"]use client['"];?/.test(stripped);
}

const cjsFiles = fs.readdirSync(dist).filter((f) => /^chunk-.*\.cjs$/.test(f));
const cjsIndex = new Map();
for (const f of cjsFiles) {
  const txt = fs.readFileSync(path.join(dist, f), 'utf8');
  const key = cjsExports(txt).join(',');
  if (!cjsIndex.has(key)) cjsIndex.set(key, []);
  cjsIndex.get(key).push({ f, stamped: txt.startsWith('"use client"') });
}

let unmatched = 0;
const problems = [];
let pairs = 0;
for (const r of rows.filter((r) => /^chunk-.*\.js$/.test(r.rel))) {
  const txt = fs.readFileSync(path.join(dist, r.rel), 'utf8');
  const key = esmExports(txt).join(',');
  const c = cjsIndex.get(key);
  if (!key || !c || c.length !== 1) { unmatched++; continue; }
  pairs++;
  const needs = r.srcRel.some(srcDirective);
  if (needs !== c[0].stamped || r.stamped !== c[0].stamped) {
    problems.push(`${r.srcRel.join(',')} | esm ${r.rel} stamped=${r.stamped} | cjs ${c[0].f} stamped=${c[0].stamped} | needs=${needs}`);
  }
}
console.log('cjs chunks', cjsFiles.length, 'paired', pairs, 'unmatched esm chunks', unmatched,
  'stamped cjs chunks', cjsFiles.filter((f) => fs.readFileSync(path.join(dist, f), 'utf8').startsWith('"use client"')).length);
console.log(problems.join('\n'));
// entry stubs (cjs)
const stubs = [];
(function walk(d) {
  for (const e of fs.readdirSync(d)) {
    const f = path.join(d, e);
    if (fs.statSync(f).isDirectory()) walk(f);
    else if (/\.cjs$/.test(e) && !/^chunk-/.test(e)) stubs.push(f);
  }
})(dist);
console.log('cjs entry stubs', stubs.length, 'with use client', stubs.filter((f) => /["']use client["']/.test(fs.readFileSync(f, 'utf8'))).length);
