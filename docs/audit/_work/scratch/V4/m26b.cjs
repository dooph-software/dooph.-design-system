// V4 / M26: enumerate every prop whose declared type references an exported `as const` object
// (directly, via its derived type alias of the same name, or via `typeof X.key`), excluding props
// named `variant` / `size`.
const ts = require('C:/Users/stick/Github/dooph/dooph-ds-audit-build/node_modules/typescript');
const fs = require('fs');
const path = require('path');
const ROOT = 'C:/Users/stick/Github/dooph/dooph-Design-System/src';
const rel = (f) => path.relative(ROOT, f).split(path.sep).join('/');
const files = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.tsx?$/.test(e.name) && !/\.stories\.|\.test\./.test(e.name)) files.push(p);
  }
})(ROOT);
const sfs = files.map((f) => [
  f,
  ts.createSourceFile(f, fs.readFileSync(f, 'utf8'), ts.ScriptTarget.Latest, true,
    f.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS),
]);
const consts = new Map();
for (const [f, sf] of sfs) {
  sf.forEachChild((n) => {
    if (ts.isVariableStatement(n) && n.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) {
      for (const d of n.declarationList.declarations) {
        const init = d.initializer;
        if (init && ts.isAsExpression(init) && init.type.getText() === 'const' && ts.isObjectLiteralExpression(init.expression)) {
          consts.set(d.name.getText(), rel(f));
        }
      }
    }
  });
}
const alias = new Map();
for (const [f, sf] of sfs) {
  (function v(n) {
    if (ts.isTypeAliasDeclaration(n)) {
      const m = n.type.getText().match(/typeof\s+(\w+)/);
      if (m && consts.has(m[1])) alias.set(n.name.getText(), m[1]);
    }
    n.forEachChild(v);
  })(sf);
}
for (const [a, c] of alias) if (!consts.has(a)) consts.set(a, 'alias-of:' + c);
console.log('aliases with a different name:', [...alias].filter(([a,c])=>a!==c).map(([a,c])=>a+'<-'+c).join(', '));
const rows = [];
for (const [f, sf] of sfs) {
  (function v(n) {
    if ((ts.isPropertySignature(n) || ts.isPropertyDeclaration(n)) && n.type) {
      const refs = new Set();
      (function w(t) {
        if (ts.isTypeReferenceNode(t) && consts.has(t.typeName.getText())) refs.add(t.typeName.getText());
        if (ts.isTypeQueryNode(t)) {
          const q = t.exprName.getText().split('.')[0];
          if (consts.has(q)) refs.add(q);
        }
        t.forEachChild(w);
      })(n.type);
      if (refs.size) {
        const { line } = sf.getLineAndCharacterOfPosition(n.getStart());
        rows.push([n.name.getText(), [...refs].join('|'), rel(f) + ':' + (line + 1), n.type.getText().replace(/\s+/g, ' ').slice(0, 70)]);
      }
    }
    n.forEachChild(v);
  })(sf);
}
console.log('exported as-const objects:', consts.size);
const non = rows.filter((r) => !['variant', 'size'].includes(r[0]));
const byName = {};
for (const r of non) (byName[r[0]] ??= []).push(r);
for (const k of Object.keys(byName).sort()) {
  console.log(`\n## ${k} (${byName[k].length})`);
  for (const r of byName[k]) console.log('   ' + r[2] + '  ' + r[1] + '  ::  ' + r[3]);
}
const used = new Set(rows.flatMap((r) => r[1].split('|')));
console.log('\nconsts never used as a declared prop type:', [...consts.keys()].filter((c) => !used.has(c)).join(', '));
