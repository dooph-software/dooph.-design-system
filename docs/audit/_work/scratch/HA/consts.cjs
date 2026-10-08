// Task 1: enumerate every exported object const (as const or plain object literal) under src (non-story).
const fs = require('fs');
const { ts, ROOT, srcFiles, load, rel, lineOf, hasUseClient, isExported } = require('./prog.cjs');
const { program } = load();

// dist export names
const dts = fs.readFileSync(ROOT + '/docs/audit/_work/dist-index.d.ts', 'utf8');
const distNames = new Set();
for (const m of dts.matchAll(/export \{([^}]*)\}/g)) {
  for (const part of m[1].split(',')) {
    const s = part.trim(); if (!s) continue;
    const mm = s.match(/(?:type\s+)?(\w+)(?:\s+as\s+(\w+))?/);
    distNames.add(mm[2] || mm[1]);
    distNames.add('__src__' + mm[1]);
  }
}

const consts = [];
const typeAliases = []; // {name, file, line, text}
const propSigs = []; // {file, line, iface, prop, typeText}
const unionLiteralTypes = []; // exported hand-written string-literal unions

function unwrap(e) {
  while (e && (ts.isAsExpression(e) || ts.isSatisfiesExpression?.(e) || ts.isParenthesizedExpression(e) || ts.isTypeAssertionExpression?.(e))) e = e.expression;
  return e;
}
function isAsConst(e) {
  let cur = e;
  while (cur && (ts.isAsExpression(cur) || ts.isSatisfiesExpression?.(cur) || ts.isParenthesizedExpression(cur))) {
    if (ts.isAsExpression(cur) && ts.isTypeReferenceNode(cur.type) && cur.type.typeName.getText() === 'const') return true;
    cur = cur.expression;
  }
  return false;
}
const camel = (k) => /^[a-z][a-zA-Z0-9]*$/.test(k);

for (const f of srcFiles) {
  const sf = program.getSourceFile(f);
  const uc = hasUseClient(sf);
  function visit(node, ifaceName) {
    if (ts.isVariableStatement(node) && isExported(node)) {
      for (const d of node.declarationList.declarations) {
        const init = unwrap(d.initializer);
        if (init && ts.isObjectLiteralExpression(init)) {
          const keys = init.properties.map((p) => (p.name ? p.name.getText(sf).replace(/^['"]|['"]$/g, '') : '...'));
          consts.push({ name: d.name.getText(sf), file: rel(f), line: lineOf(d), useClient: uc, asConst: isAsConst(d.initializer), keys, typeAnn: d.type ? d.type.getText(sf) : '' , initText: d.initializer.getText(sf).slice(0,80).replace(/\s+/g,' ')});
        }
      }
    }
    if (ts.isTypeAliasDeclaration(node)) {
      typeAliases.push({ name: node.name.text, file: rel(f), line: lineOf(node), text: node.type.getText(sf).replace(/\s+/g, ' '), exported: isExported(node) });
      // hand-written string-literal unions
      const t = node.type;
      if (ts.isUnionTypeNode(t) && t.types.some((x) => ts.isLiteralTypeNode(x) && ts.isStringLiteral(x.literal))) {
        unionLiteralTypes.push({ name: node.name.text, file: rel(f), line: lineOf(node), text: t.getText(sf).replace(/\s+/g, ' '), exported: isExported(node) });
      }
    }
    if (ts.isInterfaceDeclaration(node)) ifaceName = node.name.text;
    if (ts.isTypeAliasDeclaration(node)) ifaceName = node.name.text;
    if (ts.isPropertySignature(node) && node.type) {
      propSigs.push({ file: rel(f), line: lineOf(node), iface: ifaceName, prop: node.name.getText(sf), typeText: node.type.getText(sf).replace(/\s+/g, ' ') });
    }
    ts.forEachChild(node, (c) => visit(c, ifaceName));
  }
  visit(sf, '');
}

// derive type info per const
const rows = [];
for (const c of consts) {
  const same = typeAliases.find((t) => t.name === c.name && t.exported);
  const derivedAny = typeAliases.filter((t) => new RegExp('typeof\\s+' + c.name + '\\b').test(t.text));
  const canonical = (t) => new RegExp('^\\(typeof ' + c.name + '\\)\\[keyof typeof ' + c.name + '\\]').test(t.text);
  const derivedNames = derivedAny.map((t) => t.name);
  // props consuming it: prop type references a derived type name or typeof X
  const consumers = propSigs.filter((p) => derivedNames.some((n) => new RegExp('\\b' + n + '\\b').test(p.typeText)) || new RegExp('typeof ' + c.name + '\\b').test(p.typeText));
  rows.push({
    ...c,
    badKeys: c.keys.filter((k) => !camel(k)),
    sameIdType: same ? `${same.name} = ${same.text}` : '',
    derived: derivedAny.map((t) => `${t.name}${t.exported ? '' : '(unexported)'} @${t.file.split('/').pop()}:${t.line} = ${t.text}${canonical(t) ? '' : ' [NONCANON]'}`),
    canonicalSameId: same ? canonical(same) : false,
    inDist: distNames.has(c.name) || distNames.has('__src__' + c.name),
    consumers: [...new Set(consumers.map((p) => `${p.iface}.${p.prop}`))],
  });
}
const out = [];
out.push(`# ${rows.length} exported object consts`);
for (const r of rows) {
  out.push(['CONST', r.name, `${r.file}:${r.line}`, r.useClient ? 'USECLIENT' : 'server-safe', r.asConst ? 'as-const' : 'NOT-as-const', r.typeAnn ? 'annot=' + r.typeAnn : '', 'keys=' + r.keys.length, r.badKeys.length ? 'BADKEYS=' + r.badKeys.join('|') : 'keys-ok', r.sameIdType ? 'SAMEID' + (r.canonicalSameId ? '-canon' : '-NONCANON') : 'NO-SAMEID-TYPE', r.inDist ? 'dist' : 'NOT-IN-DIST', 'derived=[' + r.derived.join(' ; ') + ']', 'consumers=[' + r.consumers.join(', ') + ']'].join(' | '));
}
out.push('');
out.push('# hand-written string-literal union type aliases');
for (const u of unionLiteralTypes) out.push(['UNION', u.name, `${u.file}:${u.line}`, u.exported ? 'exported' : 'local', u.text].join(' | '));
out.push('');
out.push('# props typed via VariantProps / cva');
for (const p of propSigs) if (/VariantProps|\["(variant|size)"\]/.test(p.typeText)) out.push(['VP', `${p.file}:${p.line}`, `${p.iface}.${p.prop}`, p.typeText].join(' | '));
out.push('');
out.push('# prop signatures with inline string-literal unions');
for (const p of propSigs) if (/^(\s*\|?\s*["'][^"']*["']\s*\|?)+$/.test(p.typeText) || /["'][\w-]+["']\s*\|/.test(p.typeText)) out.push(['INLINEUNION', `${p.file}:${p.line}`, `${p.iface}.${p.prop}`, p.typeText].join(' | '));
fs.writeFileSync(ROOT + '/docs/audit/_work/scratch/HA/consts.out.txt', out.join('\n'));
fs.writeFileSync(ROOT + '/docs/audit/_work/scratch/HA/propsigs.json', JSON.stringify(propSigs));
fs.writeFileSync(ROOT + '/docs/audit/_work/scratch/HA/typealiases.json', JSON.stringify(typeAliases));
console.log(out.join('\n'));
