// For every non-CSSProperties `as` cast in src (non-story), print source type vs target type,
// flag REDUNDANT (identical), FROM-ANY (source is any), WIDEN/NARROW.
const fs = require('fs');
const { ts, ROOT, srcFiles, load, rel, lineOf } = require('./prog.cjs');
const { program, checker } = load();
const out = [];
for (const f of srcFiles) {
  if (/MorphRotationShape\/engine\//.test(f)) continue;
  const sf = program.getSourceFile(f);
  (function v(n) {
    if (ts.isAsExpression(n) && n.type.getText(sf) !== 'const' && !/CSSProperties$/.test(n.type.getText(sf))) {
      const src = checker.getTypeAtLocation(n.expression);
      const tgt = checker.getTypeFromTypeNode(n.type);
      const s = checker.typeToString(src, undefined, ts.TypeFormatFlags.NoTruncation);
      const t = checker.typeToString(tgt, undefined, ts.TypeFormatFlags.NoTruncation);
      let tag = s === t ? 'REDUNDANT' : (src.flags & ts.TypeFlags.Any) ? 'FROM-ANY' : checker.isTypeAssignableTo(src, tgt) ? 'UPCAST(assignable)' : 'NARROW';
      out.push(`${rel(f)}:${lineOf(n)} | ${tag} | src=${s.slice(0, 120)} | tgt=${t.slice(0, 120)}`);
    }
    ts.forEachChild(n, v);
  })(sf);
}
fs.writeFileSync(ROOT + '/docs/audit/_work/scratch/HA/casttypes.out.txt', out.join('\n'));
console.log(out.join('\n'));
