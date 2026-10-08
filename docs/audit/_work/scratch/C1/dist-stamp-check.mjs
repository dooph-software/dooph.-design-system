// F-011 dist check: every src module whose directive prologue holds "use client"
// must sit in ESM and CJS chunks whose first statement is the directive.
// Chunks are mapped to src modules by esbuild's `// src/<path>` comments
// (ESM falls back to the .map `sources`).
// Usage: node docs/audit/_work/scratch/C1/dist-stamp-check.mjs <repo-or-worktree-root>
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.argv[2] ?? '.');
const dist = path.join(root, 'dist');

function prologueDirectives(contents) {
  const src = contents.replace(/^﻿/, '');
  const found = [];
  let i = 0;
  for (;;) {
    const ws = /\s*/y; ws.lastIndex = i; ws.exec(src); i = ws.lastIndex;
    if (src.startsWith('//', i)) { const nl = src.indexOf('\n', i); i = nl === -1 ? src.length : nl + 1; continue; }
    if (src.startsWith('/*', i)) { const end = src.indexOf('*/', i + 2); if (end === -1) return found; i = end + 2; continue; }
    const lit = /(["'])([^"'\\\n]*)\1[ \t]*;?/y; lit.lastIndex = i;
    const m = lit.exec(src);
    if (!m) return found;
    found.push(m[2]);
    i = lit.lastIndex;
  }
}
const client = new Set();
(function walk(d) {
  for (const e of readdirSync(d)) {
    const f = path.join(d, e);
    if (statSync(f).isDirectory()) walk(f);
    else if (/\.(ts|tsx)$/.test(e) && !/\.(stories|test)\./.test(e) && prologueDirectives(readFileSync(f, 'utf8')).includes('use client'))
      client.add(path.relative(root, f).split(path.sep).join('/'));
  }
})(path.join(root, 'src'));

const stamped = (c) => /^﻿?\s*(["'])use client\1;?/.test(c);
const result = { esm: new Map(), cjs: new Map() };
for (const f of readdirSync(dist)) {
  const kind = /^chunk-.*\.js$/.test(f) ? 'esm' : /^chunk-.*\.cjs$/.test(f) ? 'cjs' : null;
  if (!kind) continue;
  const c = readFileSync(path.join(dist, f), 'utf8');
  const mods = new Set([...c.matchAll(/\/\/ (src\/\S+\.(?:tsx?|jsx?))/g)].map((m) => m[1]));
  if (kind === 'esm' && existsSync(path.join(dist, f + '.map'))) {
    for (const s of JSON.parse(readFileSync(path.join(dist, f + '.map'), 'utf8')).sources ?? []) {
      const m = s.replace(/\\/g, '/').match(/(src\/.+)$/);
      if (m) mods.add(m[1]);
    }
  }
  for (const m of mods) if (client.has(m)) result[kind].set(m, (result[kind].get(m) ?? true) && stamped(c) ? true : false);
}
let fail = 0;
for (const kind of ['esm', 'cjs']) {
  const ok = [...result[kind].values()].filter(Boolean).length;
  const unstamped = [...result[kind].entries()].filter(([, v]) => !v).map(([k]) => k);
  const unmapped = [...client].filter((m) => !result[kind].has(m));
  console.log(`${kind.toUpperCase()}: ${ok}/${client.size} client modules in stamped chunks; unstamped: ${unstamped.length}${unstamped.length ? ' → ' + unstamped.join(', ') : ''}; no chunk found: ${unmapped.length}${unmapped.length ? ' → ' + unmapped.join(', ') : ''}`);
  if (unstamped.length) fail++;
}
console.log(fail ? 'FAIL' : 'PASS');
process.exitCode = fail ? 1 : 0;
