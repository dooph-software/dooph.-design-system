// F-011 reproduction + proposed fix check. Compares the shipped 5-line
// hasDirective (add-use-client.mjs:37-50 @ b436647) with the prologue parser
// proposed in WI-C1-01, over every non-story src module, and checks the guard.
// Usage (repo root): node docs/audit/_work/scratch/C1/prologue-scan.mjs
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const DIRECTIVE = 'use client';

function oldHasDirective(contents) {
  const lines = contents.split('\n').slice(0, 5);
  return lines.some((line) => {
    const t = line.trim();
    return t === `"${DIRECTIVE}";` || t === `'${DIRECTIVE}';` || t === `"${DIRECTIVE}"` || t === `'${DIRECTIVE}'`;
  });
}

// --- proposed (copied verbatim into WI-C1-01) ---
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
const hasDirective = (contents) => prologueDirectives(contents).includes(DIRECTIVE);
const DIRECTIVE_LINE = /^\s*(["'])use client\1;?\s*$/m;
// --- end proposed ---

const files = [];
(function walk(d) {
  for (const e of readdirSync(d)) {
    const f = path.join(d, e);
    if (statSync(f).isDirectory()) walk(f);
    else if (/\.(ts|tsx|js|jsx)$/.test(e)) files.push(f);
  }
})('src');

let lines = 0, oldN = 0, newN = 0;
const missedByOld = [], misplaced = [];
for (const f of files) {
  const c = readFileSync(f, 'utf8');
  const hasLine = DIRECTIVE_LINE.test(c);
  if (hasLine && !/\.stories\.tsx$/.test(f)) lines++;
  const o = oldHasDirective(c), n = hasDirective(c);
  if (o) oldN++;
  if (n) newN++;
  if (n && !o) missedByOld.push(`${f.split(path.sep).join('/')}:${c.split('\n').findIndex((l) => DIRECTIVE_LINE.test(l)) + 1}`);
  if (hasLine && !n) misplaced.push(f);
}
console.log(`src modules with a "use client" line (non-story): ${lines}`);
console.log(`detected by shipped 5-line window: ${oldN}`);
console.log(`detected by prologue parser:       ${newN}`);
console.log(`missed by the 5-line window (${missedByOld.length}):\n  ${missedByOld.join('\n  ')}`);
console.log(`guard — directive line present but not in the prologue: ${misplaced.length ? misplaced.join(', ') : 'none'}`);
// Unit checks of the parser on edge cases.
const cases = [
  ['"use client";\nimport x', true],
  ["'use client'\nimport x", true],
  ['/*\n * header\n */\n"use client";\nimport x', true],
  ['// a\n// b\n\n"use strict";\n"use client";\n', true],
  ['﻿"use client";', true],
  ['import x from "y";\n"use client";', false],
  ['const s = "use client";', false],
  ['/* "use client"; */\nimport x', false],
];
let bad = 0;
for (const [src, want] of cases) if (hasDirective(src) !== want) { bad++; console.log(`PARSER FAIL on ${JSON.stringify(src)}`); }
console.log(bad ? `parser edge cases: ${bad} FAIL` : 'parser edge cases: all pass');
process.exitCode = newN === lines && misplaced.length === 0 && !bad ? 0 : 1;
