// Dark-theme inventory: for every token in tokens.css's `:root, .light` block, says whether `.dark` covers it.
//   literal   — a paint literal (hex / rgb / color-mix of literals / shadow with a colour) not overridden in .dark
//   alias     — a var() whose resolution (transitively) reaches a token .dark overrides, but .dark doesn't repeat it
//               (a nested .dark region would inherit the LIGHT resolution: the alias resolves where it's declared)
//   invariant — a .dark line whose value is text-identical to :root and is NOT an alias (redundant; blocks
//               consumer :root overrides inside .dark islands)
// Usage (repo root): node docs/audit/_work/scratch/dark-inventory.mjs [--all]
import fs from 'node:fs';

const css = fs.readFileSync('src/styles/tokens.css', 'utf8');
const block = (startRe) => {
  const m = css.match(startRe); if (!m) throw new Error('block not found: ' + startRe);
  let i = css.indexOf('{', m.index) + 1, depth = 1; const s = i;
  while (depth) { const c = css[i++]; if (c === '{') depth++; else if (c === '}') depth--; }
  return css.slice(s, i - 1);
};
const decls = (body) => {
  const out = new Map();
  const clean = body.replace(/\/\*[\s\S]*?\*\//g, '');
  for (const m of clean.matchAll(/(--ui-[\w-]+)\s*:\s*([^;]+);/g)) out.set(m[1], m[2].replace(/\s+/g, ' ').trim());
  return out;
};
const light = decls(block(/^:root,\s*\n\.light\s*\{/m));
const dark = decls(block(/^\.dark\s*\{/m));

const isPaint = (v) => /#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(|oklch\(|color\(/i.test(v);
const refs = (v) => [...v.matchAll(/var\(\s*(--ui-[\w-]+)/g)].map((m) => m[1]);
const memo = new Map();
const reachesDark = (name, seen = new Set()) => {
  if (memo.has(name)) return memo.get(name);
  if (seen.has(name)) return false; seen.add(name);
  const v = light.get(name); if (v === undefined) return false;
  const r = refs(v).some((t) => dark.has(t) || reachesDark(t, seen));
  memo.set(name, r); return r;
};

const literal = [], alias = [], invariant = [];
for (const [name, v] of light) {
  if (dark.has(name)) {
    if (dark.get(name) === v && refs(v).length === 0) invariant.push(name);
    continue;
  }
  if (refs(v).length) { if (reachesDark(name)) alias.push(name); }
  else if (isPaint(v)) literal.push(`${name}: ${v}`);
}
console.log(`light tokens ${light.size}, dark tokens ${dark.size}`);
console.log(`\nLITERAL paints with no .dark value: ${literal.length}`); literal.forEach((l) => console.log('  ' + l));
console.log(`\nALIASES reaching a dark-changed token, not repeated in .dark: ${alias.length}`); alias.forEach((l) => console.log('  ' + l));
console.log(`\nINVARIANT non-alias .dark lines identical to :root: ${invariant.length}`); invariant.forEach((l) => console.log('  ' + l));
