#!/usr/bin/env node
// surface-diff.mjs <old.json> <new.json> <out.md> [out.json]
//
// Diffs two surface JSONs written by surface.mjs into a markdown file with one
// line per difference. Each section is produced by its own function so it can
// be lifted into a shared lib. Lines inside a section are sorted by module
// (component folder), then by name.
//
// Every line carries the surface paths it is about (e.g. ["components",
// "Button", "props", "size"]). The optional out.json keeps them, so a third
// surface (an intermediate commit) can be probed with getPath() to say WHEN a
// change landed — that is what surface-reconcile.mjs does.

import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const MAX = 160;
const short = (v) => {
  const s = typeof v === 'string' ? v : JSON.stringify(v);
  if (s == null) return String(s);
  if (s.length <= MAX) return s;
  const h = createHash('sha1').update(s).digest('hex').slice(0, 8);
  return `${s.slice(0, 60)}… (${s.length} chars, sha1 ${h})`;
};
const code = (v) => '`' + short(v).replace(/`/g, "'") + '`';
const keys = (o) => Object.keys(o ?? {});
const added = (a, b) => keys(b).filter((k) => !(k in (a ?? {})));
const removed = (a, b) => keys(a).filter((k) => !(k in (b ?? {})));
const common = (a, b) => keys(a).filter((k) => k in (b ?? {}));
const listSummary = (arr, n = 15) => (arr.length <= n ? arr.join(', ') : `${arr.slice(0, n).join(', ')}, … (+${arr.length - n} more)`);

// Value at a path in a surface. A segment applied to an array means
// "is this item in the array" (class lists, package.json `files`).
export function getPath(surface, path) {
  let v = surface;
  for (const seg of path) {
    if (v == null) return undefined;
    if (Array.isArray(v)) return v.includes(seg);
    v = v[seg];
  }
  return v;
}

// For two union texts, the members added and removed; otherwise old → new.
function unionDelta(a, b) {
  // " / " separates the declared types of a prop's arms (see surface.mjs);
  // `undefined` is optionality, which is reported on its own line.
  const split = (t) => [...new Set(t.split(/ \| | \/ /).map((x) => x.trim()).filter((x) => x !== 'undefined'))];
  const A = split(a), B = split(b);
  if (A.length > 1 || B.length > 1) {
    const add = B.filter((x) => !A.includes(x)), rem = A.filter((x) => !B.includes(x));
    const parts = [];
    if (add.length) parts.push(`values added: ${add.map((x) => '`' + x + '`').join(', ')}`);
    if (rem.length) parts.push(`values removed: ${rem.map((x) => '`' + x + '`').join(', ')}`);
    if (parts.length) return parts.join('; ');
    return '';
  }
  return `expanded ${code(a)} → ${code(b)}`;
}

const sortRecs = (recs) => recs.sort((x, y) => (x.sort < y.sort ? -1 : x.sort > y.sort ? 1 : 0));
const L = (module, name, text, paths) => ({ sort: `${module}\u0000${name}`, text: `- [${module}] ${text}`, paths });

// Collapse a change repeated across many components of one module (every icon
// gaining `ref`, …) into one line that names them all. A record's `tmpl` is
// its text with the component name replaced by {C}.
function groupRepeated(recs, min = 4) {
  const groups = new Map();
  for (const r of recs) {
    const g = `${r.module}\u0000${r.tmpl}`;
    if (!groups.has(g)) groups.set(g, []);
    groups.get(g).push(r);
  }
  const out = [];
  for (const rs of groups.values()) {
    if (rs.length < min) { out.push(...rs); continue; }
    const names = rs.map((r) => r.comp).sort();
    const text = rs[0].tmpl.replace('`{C}`', `${names.length} components (${names.map((n) => '`' + n + '`').join(', ')})`);
    out.push({ sort: `${rs[0].module}\u0000${names[0]}\u0000${rs[0].tmpl}`, text: `- [${rs[0].module}] ${text}`, paths: rs.flatMap((r) => r.paths) });
  }
  return out;
}

// ── Exports ─────────────────────────────────────────────────────────────────
function diffExports(a, b) {
  const out = [];
  const A = a.exports, B = b.exports;
  const kind = (e) => `${e.kind}${e.alsoType ? ' + type' : ''}`;
  for (const k of added(A, B)) out.push(L(B[k].module, k, `export added: \`${k}\` (${kind(B[k])})`, [['exports', k]]));
  for (const k of removed(A, B)) out.push(L(A[k].module, k, `export removed: \`${k}\` (${kind(A[k])})`, [['exports', k]]));
  for (const k of common(A, B)) {
    const x = A[k], y = B[k];
    if (x.kind !== y.kind || x.alsoType !== y.alsoType)
      out.push(L(y.module, k, `export kind changed: \`${k}\` ${kind(x)} → ${kind(y)}`, [['exports', k, 'kind'], ['exports', k, 'alsoType']]));
    if (x.module !== y.module)
      out.push(L(y.module, k, `export declared in a different folder (internal; the import from the package root is unchanged): \`${k}\` ${x.module} → ${y.module}`, [['exports', k, 'module']]));
    if (x.deprecated !== y.deprecated)
      out.push(L(y.module, k, `export \`${k}\` ${y.deprecated ? 'now @deprecated' : 'no longer @deprecated'}`, [['exports', k, 'deprecated']]));
  }
  return sortRecs(out);
}

// ── Component props ─────────────────────────────────────────────────────────
function diffComponents(a, b) {
  const recs = [];
  const A = a.components, B = b.components;
  // Component-line constructor: keeps the component name so repeats can be grouped.
  const C = (module, name, text, paths) => {
    const comp = name.split('.')[0];
    recs.push({ module, comp, sort: `${module}\u0000${name}`, text: `- [${module}] ${text}`, tmpl: text.split('`' + comp + '`').join('`{C}`'), paths });
  };
  for (const k of added(A, B)) {
    const c = B[k];
    const own = keys(c.props);
    C(c.module, k, `\`${k}\` (new component) own props: ${own.length ? own.map((p) => `\`${p}${c.props[p].optional ? '?' : ''}\``).join(', ') : 'none'}; inherits from ${c.inheritedFrom.join(', ') || 'nothing'} (${c.inheritedCount} props)`, [['components', k]]);
  }
  for (const k of common(A, B)) {
    const x = A[k], y = B[k];
    const m = y.module;
    const P = (p) => ['components', k, 'props', p];
    for (const p of added(x.props, y.props)) {
      const wasInherited = x.inherited?.includes(p);
      C(m, `${k}.${p}`, `\`${k}\` prop added: \`${p}${y.props[p].optional ? '?' : ''}: ${short(y.props[p].type)}\`${wasInherited ? ' (was already accepted as an inherited prop)' : ''}`, [P(p)]);
    }
    for (const p of removed(x.props, y.props)) {
      const nowInherited = y.inherited?.includes(p);
      C(m, `${k}.${p}`, `\`${k}\` prop removed: \`${p}${x.props[p].optional ? '?' : ''}: ${short(x.props[p].type)}\`${nowInherited ? ' (still accepted as an inherited prop)' : ''}`, [P(p)]);
    }
    for (const p of common(x.props, y.props)) {
      const px = x.props[p], py = y.props[p];
      if (px.type !== py.type || px.expanded !== py.expanded) {
        let t = `\`${k}\` prop type changed: \`${p}\` ${code(px.type)} → ${code(py.type)}`;
        const delta = px.expanded !== py.expanded && (px.expanded !== px.type || py.expanded !== py.type) ? unionDelta(px.expanded, py.expanded) : '';
        if (delta) t += ` (${delta})`;
        C(m, `${k}.${p}`, t, [[...P(p), 'type'], [...P(p), 'expanded']]);
      }
      if (px.optional !== py.optional) C(m, `${k}.${p}`, `\`${k}\` prop \`${p}\` ${py.optional ? 'now optional' : 'now required'}`, [[...P(p), 'optional']]);
      if (px.deprecated !== py.deprecated) C(m, `${k}.${p}`, `\`${k}\` prop \`${p}\` ${py.deprecated ? 'now @deprecated' : 'no longer @deprecated'}`, [[...P(p), 'deprecated']]);
    }
    // Inherited (DOM / Radix) props, summarised per component.
    const xf = x.inheritedFrom ?? [], yf = y.inheritedFrom ?? [];
    const fa = yf.filter((s) => !xf.includes(s)), fr = xf.filter((s) => !yf.includes(s));
    const ix = new Set(x.inherited ?? []), iy = new Set(y.inherited ?? []);
    const ia = [...iy].filter((p) => !ix.has(p) && !(p in x.props));
    const ir = [...ix].filter((p) => !iy.has(p) && !(p in y.props));
    const IP = (list) => list.map((p) => ['components', k, 'inherited', p]);
    if (!ix.size && iy.size) {
      // Went from no inherited props to a DOM/Radix base: one line, not three.
      const eg = ia.filter((p) => /^(id|style|className|onClick|aria-label|title|ref|key)$/.test(p));
      C(m, `${k}.~inh+`, `\`${k}\` now also accepts inherited props from ${yf.join(', ')} (${ia.length} props, e.g. ${eg.length ? eg.join(', ') : listSummary(ia, 8)})`, [['components', k, 'inheritedCount']]);
    } else {
      if (fa.length || fr.length) C(m, `${k}.~from`, `\`${k}\` inherits-from changed: ${fr.length ? `−${fr.join(', ')} ` : ''}${fa.length ? `+${fa.join(', ')}` : ''}`.trim(), [['components', k, 'inheritedFrom']]);
      if (ia.length) C(m, `${k}.~inh+`, `\`${k}\` inherited props added (${ia.length}): ${listSummary(ia.sort())}`, IP(ia));
      if (ir.length) C(m, `${k}.~inh-`, `\`${k}\` inherited props removed (${ir.length}): ${listSummary(ir.sort())}`, IP(ir));
    }
    if ((x.refType ?? null) !== (y.refType ?? null))
      C(m, `${k}.~ref`, `\`${k}\` ref type changed: ${code(x.refType ?? 'no ref')} → ${code(y.refType ?? 'no ref')}`, [['components', k, 'refType']]);
    if (x.generic !== y.generic) C(m, `${k}.~generic`, `\`${k}\` ${y.generic ? 'is now generic (polymorphic)' : 'is no longer generic'}`, [['components', k, 'generic']]);
  }
  return sortRecs(groupRepeated(recs));
}

// ── Consts ──────────────────────────────────────────────────────────────────
function diffConsts(a, b) {
  const out = [];
  const A = a.consts, B = b.consts;
  for (const k of added(A, B)) {
    const e = B[k].entries;
    const ks = keys(e);
    const body = ks.length === 1 && ks[0] === '(value)' ? `value ${code(e['(value)'])}` : `keys: ${ks.map((x) => `${x}=${short(e[x])}`).join(', ')}`;
    out.push(L(B[k].module, k, `\`${k}\` (new const) ${body}`, [['consts', k]]));
  }
  for (const k of common(A, B)) {
    const x = A[k].entries, y = B[k].entries, m = B[k].module;
    const E = (e) => [['consts', k, 'entries', e]];
    for (const e of added(x, y)) out.push(L(m, `${k}.${e}`, `\`${k}\` key added: \`${e}\` = ${code(y[e])}`, E(e)));
    for (const e of removed(x, y)) out.push(L(m, `${k}.${e}`, `\`${k}\` key removed: \`${e}\` (was ${code(x[e])})`, E(e)));
    for (const e of common(x, y)) if (x[e] !== y[e]) out.push(L(m, `${k}.${e}`, `\`${k}\` value changed: \`${e}\` ${code(x[e])} → ${code(y[e])}`, E(e)));
  }
  return sortRecs(out);
}

// ── Types and functions ─────────────────────────────────────────────────────
function diffTypes(a, b) {
  const out = [];
  const A = a.types, B = b.types;
  for (const k of added(A, B)) {
    const t = B[k];
    const desc = keys(t.members).length
      ? `members: ${listSummary(keys(t.members).map((m) => (t.members[m].includes('(some variants)') ? `${m} (some variants)` : m)), 30)}`
      : `= ${code(t.expanded && t.expanded !== k && !(t.expanded.startsWith('{') && t.text) ? t.expanded : t.text ?? t.expanded)}`;
    out.push(L(t.module, k, `\`${k}\` (new ${t.declaredAs ?? 'type'}${t.generics ? `<${t.generics}>` : ''}) ${desc}`, [['types', k]]));
  }
  for (const k of common(A, B)) {
    const x = A[k], y = B[k], m = y.module;
    const T = (...s) => [['types', k, ...s]];
    // An object-literal expansion that only reordered its members is not a change.
    const objKey = (e) => (e?.startsWith('{') ? e.slice(1, -1).split('; ').map((z) => z.trim()).sort().join('; ') : e);
    if (x.expanded !== y.expanded && objKey(x.expanded) !== objKey(y.expanded) && !(keys(x.members).length && keys(y.members).length)) {
      const isUnion = (e) => e && !e.startsWith('{') && e.includes(' | ');
      const detail = isUnion(x.expanded) || isUnion(y.expanded) ? unionDelta(x.expanded, y.expanded) : `${code(x.expanded)} → ${code(y.expanded)}`;
      const decl = x.text !== y.text && x.text && y.text ? ` (declared ${code(x.text)} → ${code(y.text)})` : '';
      if (detail || decl) out.push(L(m, k, `\`${k}\` type changed: ${detail || 'same members'}${decl}`, T('expanded')));
    }
    if ((x.generics ?? '') !== (y.generics ?? '')) out.push(L(m, k, `\`${k}\` type parameters changed: ${code(x.generics ?? 'none')} → ${code(y.generics ?? 'none')}`, T('generics')));
    if ((x.declaredAs ?? '') !== (y.declaredAs ?? '')) out.push(L(m, k, `\`${k}\` declared as ${x.declaredAs} → ${y.declaredAs}`, T('declaredAs')));
    for (const e of added(x.members, y.members)) out.push(L(m, `${k}.${e}`, `\`${k}\` member added: \`${e}${y.members[e]}\``, T('members', e)));
    for (const e of removed(x.members, y.members)) out.push(L(m, `${k}.${e}`, `\`${k}\` member removed: \`${e}${x.members[e]}\``, T('members', e)));
    for (const e of common(x.members, y.members))
      if (x.members[e] !== y.members[e]) out.push(L(m, `${k}.${e}`, `\`${k}\` member changed: \`${e}\` ${code(x.members[e])} → ${code(y.members[e])}`, T('members', e)));
  }
  return sortRecs(out);
}

function diffFunctions(a, b) {
  const out = [];
  const A = a.functions, B = b.functions;
  const full = (v) => '`' + v + '`';
  for (const k of added(A, B)) out.push(L(B[k].module, k, `\`${k}\` (new function) ${B[k].signatures.map(full).join(' ; ')}`, [['functions', k]]));
  for (const k of common(A, B)) {
    const x = A[k].signatures.join(' ; '), y = B[k].signatures.join(' ; ');
    if (x !== y) out.push(L(B[k].module, k, `\`${k}\` signature changed: ${full(x)} → ${full(y)}`, [['functions', k, 'signatures']]));
  }
  return sortRecs(out);
}

// ── Tokens (tokens.css) and theme.css vars ──────────────────────────────────
function diffTokenBlocks(A, B, label, root) {
  const out = [];
  const line = (block, name, text, paths) => ({ sort: `${block}\u0000${name}`, text: `- [${block}] ${text}`, paths });
  for (const k of added(A, B)) out.push(line(k, '', `${label} block added: \`${k}\`${B[k].layer ? ` (in @layer ${B[k].layer})` : ''} — ${keys(B[k].tokens).length} declarations: ${listSummary(keys(B[k].tokens).map((t) => `${t}: ${short(B[k].tokens[t])}`), 40)}`, [[root, k]]));
  for (const k of removed(A, B)) out.push(line(k, '', `${label} block removed: \`${k}\` (${keys(A[k].tokens).length} declarations)`, [[root, k]]));
  for (const k of common(A, B)) {
    const x = A[k], y = B[k];
    const P = (t) => [[root, k, 'tokens', t]];
    if (x.layer !== y.layer) out.push(line(k, '', `${label} block \`${k}\` cascade layer: ${x.layer ?? 'unlayered'} → ${y.layer ?? 'unlayered'}`, [[root, k, 'layer']]));
    for (const t of added(x.tokens, y.tokens)) out.push(line(k, t, `\`${t}\` added = ${code(y.tokens[t])}`, P(t)));
    for (const t of removed(x.tokens, y.tokens)) out.push(line(k, t, `\`${t}\` removed (was ${code(x.tokens[t])})`, P(t)));
    for (const t of common(x.tokens, y.tokens)) if (x.tokens[t] !== y.tokens[t]) out.push(line(k, t, `\`${t}\` value changed: ${code(x.tokens[t])} → ${code(y.tokens[t])}`, P(t)));
  }
  return sortRecs(out);
}

// ── CSS classes ─────────────────────────────────────────────────────────────
function diffClasses(a, b, group) {
  const x = new Set(a.classes[group]), y = new Set(b.classes[group]);
  const out = [];
  const R = (c, what) => ({ sort: c, text: `- \`.${c}\` ${what}`, paths: [['classes', group, c]] });
  for (const c of [...y].filter((c) => !x.has(c))) out.push(R(c, 'added'));
  for (const c of [...x].filter((c) => !y.has(c))) out.push(R(c, 'removed'));
  return sortRecs(out);
}

// ── package.json ────────────────────────────────────────────────────────────
function diffPackage(a, b) {
  const out = [];
  const R = (text, path) => ({ sort: String(out.length).padStart(4, '0'), text, paths: [path] });
  for (const f of keys({ ...a.pkg, ...b.pkg })) {
    const x = a.pkg[f], y = b.pkg[f];
    if (JSON.stringify(x) === JSON.stringify(y)) continue;
    if (Array.isArray(x) || Array.isArray(y)) {
      const xs = x ?? [], ys = y ?? [];
      for (const v of ys.filter((v) => !xs.includes(v))) out.push(R(`- \`${f}\` entry added: \`${JSON.stringify(v)}\``, ['pkg', f, v]));
      for (const v of xs.filter((v) => !ys.includes(v))) out.push(R(`- \`${f}\` entry removed: \`${JSON.stringify(v)}\``, ['pkg', f, v]));
      if (xs.filter((v) => ys.includes(v)).join() !== ys.filter((v) => xs.includes(v)).join()) out.push(R(`- \`${f}\` order changed`, ['pkg', f]));
    } else if (x && y && typeof x === 'object' && typeof y === 'object') {
      for (const k of added(x, y)) out.push(R(`- \`${f}["${k}"]\` added: \`${JSON.stringify(y[k])}\``, ['pkg', f, k]));
      for (const k of removed(x, y)) out.push(R(`- \`${f}["${k}"]\` removed (was \`${JSON.stringify(x[k])}\`)`, ['pkg', f, k]));
      for (const k of common(x, y)) if (JSON.stringify(x[k]) !== JSON.stringify(y[k])) out.push(R(`- \`${f}["${k}"]\` changed: \`${JSON.stringify(x[k])}\` → \`${JSON.stringify(y[k])}\``, ['pkg', f, k]));
    } else {
      out.push(R(`- \`${f}\` changed: \`${JSON.stringify(x)}\` → \`${JSON.stringify(y)}\``, ['pkg', f]));
    }
  }
  return out;
}

// ── Main ────────────────────────────────────────────────────────────────────
export function diffSurfaces(a, b) {
  return [
    ['Exports added / removed / changed kind', diffExports(a, b)],
    ['Component props (own props; inherited props summarised)', diffComponents(a, b)],
    ['Consts (keys and values)', diffConsts(a, b)],
    ['Exported types (aliases and interfaces)', diffTypes(a, b)],
    ['Exported functions (signatures)', diffFunctions(a, b)],
    ['Tokens — src/styles/tokens.css (`light` = `:root, .light`; `dark` = `.dark`; other blocks by selector)', diffTokenBlocks(a.tokens, b.tokens, 'tokens.css', 'tokens')],
    ['Tailwind theme — dist/theme.css custom properties', diffTokenBlocks(a.themeVars ?? {}, b.themeVars ?? {}, 'theme.css', 'themeVars')],
    ['CSS classes in dist/styles.css — `ds-*`', diffClasses(a, b, 'ds')],
    ['CSS classes in dist/styles.css — `text-style-*`', diffClasses(a, b, 'textStyle')],
    ['CSS classes in dist/styles.css — generated utilities', diffClasses(a, b, 'utilities')],
    ['package.json (`exports`, `files`, `peerDependencies`, `bin`, plus `dependencies`, `sideEffects`, entry fields)', diffPackage(a, b)],
  ];
}

const isMain = process.argv[1]?.endsWith('surface-diff.mjs');
if (isMain) {
  const [oldPath, newPath, outPath, jsonPath] = process.argv.slice(2);
  if (!oldPath || !newPath || !outPath) {
    console.error('usage: node surface-diff.mjs <old.json> <new.json> <out.md> [out.json]');
    process.exit(2);
  }
  const a = JSON.parse(readFileSync(oldPath, 'utf8'));
  const b = JSON.parse(readFileSync(newPath, 'utf8'));
  const sections = diffSurfaces(a, b);
  const total = sections.reduce((n, [, l]) => n + l.length, 0);
  let md = `# Public-surface diff: v5.3.0 → HEAD\n\n`;
  md += `Generated by \`docs/audit/_work/scratch/surface-diff.mjs\` from \`surface-v5.3.0.json\` and \`surface-head.json\` (both written by \`surface.mjs\` from freshly built scratch worktrees: v5.3.0 = 8f58ae8, HEAD = 0dac153). One line per difference. Lines are grouped by module (the \`src/components/<Folder>\` an export is declared in, or \`utils/…\`). Long values are cut and given a hash. A change repeated identically across four or more components of one module is one line that names them all.\n\n`;
  md += `"Own props" are the properties of a component's props parameter declared in this package's own sources; props it inherits from React DOM types or Radix are summarised per component, not listed one by one. Tokens are read from \`src/styles/tokens.css\` only; \`--ui-*\` declared in component stylesheets are internal re-points, not tokens.\n\n`;
  md += `| Section | Lines |\n|---|---|\n`;
  for (const [t, l] of sections) md += `| ${t} | ${l.length} |\n`;
  md += `| **Total** | **${total}** |\n\n`;
  for (const [t, l] of sections) md += `## ${t}\n\n${l.length ? l.map((r) => r.text).join('\n') : '_No differences._'}\n\n`;
  writeFileSync(outPath, md);
  if (jsonPath) writeFileSync(jsonPath, JSON.stringify(sections.map(([title, recs]) => ({ title, lines: recs.map(({ text, paths }) => ({ text, paths })) })), null, 1) + '\n');
  for (const [t, l] of sections) console.log(`${String(l.length).padStart(5)}  ${t}`);
  console.log(`${String(total).padStart(5)}  total`);
}
