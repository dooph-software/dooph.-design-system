// Expression check: guards the signature/practical expression system (next-plan.md, "Expression system").
// Exit 1 when:
//   1. a token marked `/* expression */` in src/styles/tokens.css is missing from the practical preset
//      ([data-ds-expression="practical"] inside @layer ds.expression), or the preset sets an unmarked token;
//   2. any src .ts/.tsx file sets an expression token (inline style key, arbitrary-property class, setProperty);
//   3. any expression token is read (var(--x)) outside a CSS rule whose selector contains `.ds-expr-`,
//      including from TS/TSX (className arbitrary values) and from other tokens in tokens.css;
//   4. any CSS outside the tokens.css default (:root) and the preset sets an expression token.
// Usage (repo root): node docs/audit/_work/scratch/expression-check.mjs   → one PASS/FAIL line (+ reasons).
import fs from 'node:fs';
import path from 'node:path';

const TOKENS = 'src/styles/tokens.css';
const PRESET_SEL = '[data-ds-expression="practical"]';
const files = [];
const walk = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (/\.(tsx?|css)$/.test(e.name)) files.push(p.split(path.sep).join('/')); } };
walk('src');
const errors = [];
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// Blank out comments, keeping offsets.
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
const lineOf = (s, i) => s.slice(0, i).split('\n').length;

const tokensSrc = fs.readFileSync(TOKENS, 'utf8');
// 1. Marked tokens: a declaration followed on the same line by the marker comment.
const marked = [...tokensSrc.matchAll(/(--[\w-]+)\s*:[^;\n]*;[ \t]*\/\*\s*expression\s*\*\//g)].map((m) => m[1]);
if (marked.length === 0) errors.push(`${TOKENS}: no expression-marked tokens found (marker regex broke?)`);

// Rule scanner: calls onRule(selector, body, bodyStart, atRuleStack) for every innermost style rule.
function scanRules(css, onRule) {
  const s = stripComments(css);
  const stack = [];
  let start = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '{') {
      const prelude = s.slice(start, i).trim();
      stack.push({ prelude, open: i + 1 });
      start = i + 1;
    } else if (c === '}') {
      const top = stack.pop();
      if (top && !top.prelude.startsWith('@')) onRule(top.prelude, s.slice(top.open, i), top.open, stack.map((x) => x.prelude));
      start = i + 1;
    } else if (c === ';') {
      start = i + 1;
    }
  }
}

const presetNames = [];
let presetFound = false;
const reads = { ok: 0 };
const nameAlt = marked.map(esc).join('|') || '(?!)';
const readRe = new RegExp(`var\\(\\s*(${nameAlt})(?![\\w-])`, 'g');
const setRe = new RegExp(`(^|[;{\\s])(${nameAlt})\\s*:`, 'g');

for (const f of files.filter((x) => x.endsWith('.css'))) {
  const css = fs.readFileSync(f, 'utf8');
  scanRules(css, (selector, body, bodyStart, at) => {
    const inExprLayer = at.some((p) => /^@layer\s+ds\.expression\b/.test(p));
    const isPreset = f === TOKENS && inExprLayer && selector === PRESET_SEL;
    const isDefault = f === TOKENS && selector === ':root' && at.some((p) => /^@layer\s+ds\.tokens\b/.test(p));
    if (isPreset) { presetFound = true; for (const m of body.matchAll(/(--[\w-]+)\s*:/g)) presetNames.push(m[1]); }
    for (const m of body.matchAll(setRe)) {
      if (!isPreset && !isDefault) errors.push(`${f}:${lineOf(css, bodyStart + m.index)} sets ${m[2]} in "${selector}" (only the tokens.css :root default and the practical preset may)`);
    }
    for (const m of body.matchAll(readRe)) {
      if (selector.includes('.ds-expr-')) reads.ok++;
      else errors.push(`${f}:${lineOf(css, bodyStart + m.index)} reads ${m[1]} in "${selector}" (only .ds-expr-* rules may)`);
    }
  });
}
if (!presetFound) errors.push(`${TOKENS}: no ${PRESET_SEL} rule inside @layer ds.expression`);
for (const n of marked) if (!presetNames.includes(n)) errors.push(`${TOKENS}: expression token ${n} is missing from the practical preset`);
for (const n of presetNames) if (!marked.includes(n)) errors.push(`${TOKENS}: practical preset sets ${n}, which is not marked /* expression */`);

// 2/3. TS/TSX: no sets, no reads.
for (const f of files.filter((x) => /\.tsx?$/.test(x))) {
  const src = fs.readFileSync(f, 'utf8');
  for (const n of marked) {
    const e = esc(n);
    const set = new RegExp(`\\[${e}\\s*:|["'\`]${e}["'\`]\\s*[:\\]]|setProperty\\(\\s*["'\`]${e}`, 'g');
    for (const m of src.matchAll(set)) errors.push(`${f}:${lineOf(src, m.index)} sets ${n} (components never set expression tokens)`);
    for (const m of src.matchAll(new RegExp(`var\\(\\s*${e}(?![\\w-])`, 'g'))) errors.push(`${f}:${lineOf(src, m.index)} reads ${n} outside a .ds-expr-* CSS rule`);
  }
}

if (errors.length) {
  console.log(`FAIL expression-check: ${errors.length} problem(s)`);
  for (const e of errors) console.log(`  - ${e}`);
  process.exit(1);
}
console.log(`PASS expression-check: ${marked.length} expression tokens, all in the practical preset; ${reads.ok} reads, all in .ds-expr-* rules; no component sets one`);
