const fs = require('fs');
const { ts, ROOT, srcFiles, load, rel, lineOf } = require('./prog.cjs');
const { program } = load();
function norm(text) { const sc = ts.createScanner(ts.ScriptTarget.ES2020, true, ts.LanguageVariant.JSX, text); const t = []; for (let k = sc.scan(); k !== ts.SyntaxKind.EndOfFileToken; k = sc.scan()) { if (k === ts.SyntaxKind.Identifier) t.push('ID'); else if (k === ts.SyntaxKind.StringLiteral || k===ts.SyntaxKind.NoSubstitutionTemplateLiteral) t.push('STR'); else if (k === ts.SyntaxKind.NumericLiteral) t.push('NUM'); else t.push(String(k)); } return t; }
const sh = (t, k) => { const s = new Set(); for (let i = 0; i + k <= t.length; i++) s.add(t.slice(i, i + k).join(',')); return s; };
const jac = (a, b) => { let i = 0; for (const x of a) if (b.has(x)) i++; return i / (a.size + b.size - i || 1); };
const H = [];
for (const f of srcFiles.filter((f) => !/\/Icons\/|\/Shapes\/|engine\//.test(f))) {
  const sf = program.getSourceFile(f);
  for (const st of sf.statements) {
    let fn = null, name = '';
    if (ts.isFunctionDeclaration(st) && st.body) { fn = st; name = st.name.text; }
    if (ts.isVariableStatement(st)) for (const d of st.declarationList.declarations) if (d.initializer && (ts.isArrowFunction(d.initializer) || ts.isFunctionExpression(d.initializer))) { fn = d.initializer; name = d.name.getText(sf); }
    if (!fn) continue;
    const t = norm(fn.getText(sf));
    if (t.length >= 12 && t.length <= 400) H.push({ at: `${rel(f)}:${lineOf(st)}`, name, n: t.length, s: sh(t, 5) });
  }
}
for (let i = 0; i < H.length; i++) for (let j = i + 1; j < H.length; j++) { const a = H[i], b = H[j]; if (a.at.split(':')[0] === b.at.split(':')[0]) continue; const J = jac(a.s, b.s); if (J >= 0.6) console.log(`J=${J.toFixed(2)} | ${a.at} ${a.name} (${a.n}) ~ ${b.at} ${b.name} (${b.n})`); }
