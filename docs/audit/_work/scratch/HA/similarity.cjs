// Task 4c: structural similarity. Files and functions are tokenized with the TS scanner.
// Identifiers become ID, strings STR, numbers NUM, JSX text TXT; comments are dropped.
// Similarity is Jaccard over k-token shingles.
const fs = require('fs');
const { ts, ROOT, srcFiles, load, rel, lineOf } = require('./prog.cjs');
const { program } = load();

function norm(text, isTsx) {
  const sc = ts.createScanner(ts.ScriptTarget.ES2020, true, isTsx ? ts.LanguageVariant.JSX : ts.LanguageVariant.Standard, text);
  const toks = [];
  for (let k = sc.scan(); k !== ts.SyntaxKind.EndOfFileToken; k = sc.scan()) {
    if (k === ts.SyntaxKind.Identifier) toks.push('ID');
    else if (k === ts.SyntaxKind.StringLiteral || k === ts.SyntaxKind.NoSubstitutionTemplateLiteral || k === ts.SyntaxKind.TemplateHead || k === ts.SyntaxKind.TemplateMiddle || k === ts.SyntaxKind.TemplateTail) toks.push('STR');
    else if (k === ts.SyntaxKind.NumericLiteral) toks.push('NUM');
    else if (k === ts.SyntaxKind.JsxText) { if (sc.getTokenText().trim()) toks.push('TXT'); }
    else toks.push(String(k));
  }
  return toks;
}
function shingles(toks, k) { const s = new Set(); for (let i = 0; i + k <= toks.length; i++) s.add(toks.slice(i, i + k).join(',')); return s; }
function jac(a, b) { let i = 0; for (const x of a) if (b.has(x)) i++; return i / (a.size + b.size - i || 1); }
function contain(a, b) { let i = 0; for (const x of a) if (b.has(x)) i++; return i / (Math.min(a.size, b.size) || 1); }

const files = srcFiles.filter((f) => !/\/Icons\/|\/index\.ts$|MorphRotationShape\/engine\//.test(f));
const F = files.map((f) => { const t = norm(fs.readFileSync(f, 'utf8'), f.endsWith('.tsx')); return { f: rel(f), n: t.length, s: shingles(t, 12) }; });
const out = ['# file pairs (k=12) with Jaccard >= 0.5 or containment >= 0.7 (files >= 60 tokens)'];
for (let i = 0; i < F.length; i++) for (let j = i + 1; j < F.length; j++) {
  const a = F[i], b = F[j]; if (a.n < 60 || b.n < 60) continue;
  const J = jac(a.s, b.s), C = contain(a.s, b.s);
  if (J >= 0.5 || C >= 0.7) out.push(`FILE | J=${J.toFixed(2)} C=${C.toFixed(2)} | ${a.f} (${a.n}) ~ ${b.f} (${b.n})`);
}

// function-level
const fns = [];
for (const f of files) {
  const sf = program.getSourceFile(f);
  (function v(n, depth) {
    const isFn = ts.isFunctionDeclaration(n) || ts.isArrowFunction(n) || ts.isFunctionExpression(n) || ts.isMethodDeclaration(n);
    if (isFn && n.body) {
      const txt = n.getText(sf);
      const t = norm(txt, f.endsWith('.tsx'));
      if (t.length >= 40) {
        let name = n.name ? n.name.getText(sf) : (n.parent && ts.isVariableDeclaration(n.parent) ? n.parent.name.getText(sf) : (n.parent && ts.isCallExpression(n.parent) ? n.parent.expression.getText(sf) + '(cb)' : '<anon>'));
        fns.push({ f: rel(f), line: lineOf(n), name, n: t.length, s: shingles(t, 8), key: t.join(',') });
      }
    }
    ts.forEachChild(n, (c) => v(c, depth + 1));
  })(sf, 0);
}
out.push('', '# function pairs (k=8) with Jaccard >= 0.7 (functions >= 40 tokens), different names or files');
for (let i = 0; i < fns.length; i++) for (let j = i + 1; j < fns.length; j++) {
  const a = fns[i], b = fns[j];
  if (a.f === b.f && a.line === b.line) continue;
  // skip nested pairs (one inside the other in the same file)
  const J = a.key === b.key ? 1 : jac(a.s, b.s);
  if (J >= 0.7) out.push(`FN | J=${J.toFixed(2)} | ${a.f}:${a.line} ${a.name} (${a.n}) ~ ${b.f}:${b.line} ${b.name} (${b.n})`);
}
fs.writeFileSync(ROOT + '/docs/audit/_work/scratch/HA/similarity.out.txt', out.join('\n'));
console.log(out.join('\n'));
