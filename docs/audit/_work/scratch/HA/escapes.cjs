// Task 3: AST scan of every type escape hatch in src (non-story; test file listed separately).
const fs = require('fs');
const { ts, ROOT, allFiles, load, rel, lineOf, isStory } = require('./prog.cjs');
const { program } = load();
const rows = [];
for (const f of allFiles) {
  if (isStory(f)) continue;
  const sf = program.getSourceFile(f);
  const text = sf.getFullText();
  for (const m of text.matchAll(/@ts-(ignore|expect-error|nocheck)/g)) {
    const line = sf.getLineAndCharacterOfPosition(m.index).line + 1;
    rows.push({ f: rel(f), line, kind: 'ts-' + m[1], txt: text.split('\n')[line - 1].trim() });
  }
  (function v(n) {
    if (ts.isAsExpression(n) || ts.isTypeAssertionExpression(n)) {
      const t = n.type.getText(sf);
      if (t !== 'const') {
        const inner = n.expression;
        const dbl = (ts.isAsExpression(inner) && inner.type.getText(sf) === 'unknown');
        if (!(ts.isAsExpression(n.parent) && t === 'unknown')) {
          let kind = dbl ? 'as-unknown-as' : 'as';
          if (/^(React\.)?CSSProperties$/.test(t)) kind = 'as-CSSProperties';
          else if (/Component$|ElementType$/.test(t) && !dbl) kind = 'as-Component/ElementType';
          else if (/Ref|ForwardedRef|RefCallback|MutableRefObject/.test(t)) kind = 'as-Ref';
          rows.push({ f: rel(f), line: lineOf(n), kind, txt: n.getText(sf).replace(/\s+/g, ' ').slice(0, 110) });
        }
      }
    }
    if (ts.isNonNullExpression(n)) rows.push({ f: rel(f), line: lineOf(n), kind: 'non-null!', txt: n.getText(sf).replace(/\s+/g, ' ').slice(0, 110) });
    if (n.kind === ts.SyntaxKind.AnyKeyword) rows.push({ f: rel(f), line: lineOf(n), kind: 'any', txt: n.parent.getText(sf).replace(/\s+/g, ' ').slice(0, 110) });
    ts.forEachChild(n, v);
  })(sf);
}
const by = {};
for (const r of rows) (by[r.kind] ||= []).push(r);
const out = [];
for (const k of Object.keys(by)) {
  out.push(`## ${k} (${by[k].length})`);
  for (const r of by[k]) out.push(`${r.f}:${r.line} | ${r.txt}`);
  out.push('');
}
fs.writeFileSync(ROOT + '/docs/audit/_work/scratch/HA/escapes.out.txt', out.join('\n'));
console.log(out.join('\n'));
