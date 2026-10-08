// For each forwardRef/function component whose first param is an object binding pattern,
// list destructured bindings whose type is `any` inside the component body.
const fs = require('fs');
const { ts, ROOT, srcFiles, load, rel, lineOf } = require('./prog.cjs');
const { program, checker } = load();
const out = [];
for (const f of srcFiles) {
  const sf = program.getSourceFile(f);
  (function v(n) {
    if ((ts.isArrowFunction(n) || ts.isFunctionExpression(n) || ts.isFunctionDeclaration(n)) && n.parameters.length && ts.isObjectBindingPattern(n.parameters[0].name)) {
      const anyNames = [], all = [];
      for (const el of n.parameters[0].name.elements) {
        if (!ts.isIdentifier(el.name)) continue;
        const t = checker.getTypeAtLocation(el.name);
        all.push(el.name.text);
        if (t.flags & ts.TypeFlags.Any) anyNames.push(el.dotDotDotToken ? '...' + el.name.text : el.name.text);
      }
      if (anyNames.length) out.push(`${rel(f)}:${lineOf(n)} | any-bindings=${anyNames.length}/${all.length} | ${anyNames.join(', ')}`);
    }
    ts.forEachChild(n, v);
  })(sf);
}
fs.writeFileSync(ROOT + '/docs/audit/_work/scratch/HA/polyany.out.txt', out.join('\n'));
console.log(out.join('\n'));
