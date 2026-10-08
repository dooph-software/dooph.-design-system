// exact-normalized-body matches for small functions (>=15 tokens) across different files/names
const fs = require('fs');
const { ts, ROOT, srcFiles, load, rel, lineOf } = require('./prog.cjs');
const { program } = load();
function norm(text) { const sc = ts.createScanner(ts.ScriptTarget.ES2020, true, ts.LanguageVariant.JSX, text); const t = []; for (let k = sc.scan(); k !== ts.SyntaxKind.EndOfFileToken; k = sc.scan()) { if (k === ts.SyntaxKind.Identifier) t.push('ID:' + sc.getTokenText()); else if (k === ts.SyntaxKind.StringLiteral) t.push('STR'); else if (k === ts.SyntaxKind.NumericLiteral) t.push('NUM'); else t.push(String(k)); } return t; }
const groups = new Map();
for (const f of srcFiles.filter((f) => !/\/Icons\/|\/Shapes\/|engine\//.test(f))) {
  const sf = program.getSourceFile(f);
  (function v(n) {
    const isFn = ts.isFunctionDeclaration(n) || (ts.isArrowFunction(n) && n.parent && ts.isVariableDeclaration(n.parent));
    if (isFn && n.body) {
      // keep identifiers of globals/props but drop the function's own local names: crude — use body text with ids kept
      const t = norm(n.body.getText(sf)).map((x) => (x.startsWith('ID:') ? 'ID' : x));
      if (t.length >= 15) { const k = t.join(','); if (!groups.has(k)) groups.set(k, []); groups.get(k).push(`${rel(f)}:${lineOf(n)} ${n.name ? n.name.getText(sf) : n.parent.name.getText(sf)}`); }
    }
    ts.forEachChild(n, v);
  })(sf);
}
for (const [k, v] of groups) if (v.length > 1 && new Set(v.map((x) => x.split(':')[0])).size > 1) console.log(v.join('  ~  '), '| tokens=' + k.split(',').length);
