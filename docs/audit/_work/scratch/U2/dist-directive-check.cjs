// For every dist .js/.cjs output: which src modules does it contain (from its
// .map `sources`), does it start with "use client" at byte 0, and does that
// match whether any contained source declares the directive?
// node dist-directive-check.cjs <buildRoot>
const fs = require('fs');
const path = require('path');
const root = process.argv[2];
const dist = path.join(root, 'dist');

// source-of-truth: directive anywhere in the prologue (after leading comments)
function srcHasDirective(file) {
  const src = fs.readFileSync(file, 'utf8').replace(/^﻿/, '');
  const stripped = src.replace(/^\s*(\/\*[\s\S]*?\*\/\s*|\/\/[^\n]*\n\s*)*/, '');
  return /^['"]use client['"];?/.test(stripped);
}
function srcHasDirectiveFirst5(file) {
  return fs.readFileSync(file, 'utf8').split('\n').slice(0, 5)
    .some((l) => /^['"]use client['"];?$/.test(l.trim()));
}

const outs = [];
(function walk(d) {
  for (const e of fs.readdirSync(d)) {
    const f = path.join(d, e);
    if (fs.statSync(f).isDirectory()) walk(f);
    else if (/\.(js|cjs)$/.test(e)) outs.push(f);
  }
})(dist);

const rows = [];
for (const f of outs) {
  const rel = path.relative(dist, f).replace(/\\/g, '/');
  const txt = fs.readFileSync(f, 'utf8');
  const stamped = txt.startsWith('"use client"');
  const anyUC = /(^|\n)\s*["']use client["']/.test(txt);
  let sources = [];
  if (fs.existsSync(f + '.map')) {
    const m = JSON.parse(fs.readFileSync(f + '.map', 'utf8'));
    sources = m.sources.map((s) => path.resolve(path.dirname(f), s));
  }
  const srcRel = sources.map((s) => path.relative(root, s).replace(/\\/g, '/')).filter((s) => s.startsWith('src/'));
  const clientSrcs = srcRel.filter((s) => srcHasDirective(path.join(root, s)));
  const missed = clientSrcs.filter((s) => !srcHasDirectiveFirst5(path.join(root, s)));
  // does the chunk export a const object (dot-accessible) ?
  rows.push({ rel, stamped, anyUC, srcRel, clientSrcs, missed, size: txt.length });
}

const isEntryWrapper = (r) => !r.rel.includes('chunk-');
const bad = [];
for (const r of rows) {
  const needs = r.clientSrcs.length > 0;
  if (needs && !r.stamped) bad.push(['CLIENT-CODE-UNSTAMPED', r]);
  if (!needs && r.stamped) bad.push(['STAMPED-WITHOUT-CLIENT-CODE', r]);
  if (r.anyUC && !r.stamped) bad.push(['DIRECTIVE-NOT-AT-BYTE0', r]);
}
const summary = {};
for (const [k] of bad) summary[k] = (summary[k] || 0) + 1;
console.log('outputs', rows.length, 'chunks', rows.filter((r) => r.rel.includes('chunk-')).length,
  'stamped', rows.filter((r) => r.stamped).length);
console.log('problems', JSON.stringify(summary));
for (const [k, r] of bad) {
  console.log(`${k} | ${r.rel} | stamped=${r.stamped} | clientSrcs=${r.clientSrcs.join(',')} | missedByScript=${r.missed.join(',')} | srcs=${r.srcRel.slice(0, 6).join(',')}${r.srcRel.length > 6 ? ',…' : ''}`);
}
fs.writeFileSync(path.join(__dirname, 'dist-map.json'), JSON.stringify(rows, null, 1));
