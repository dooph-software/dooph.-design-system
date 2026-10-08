// F-012 check: do the neutral ShapeMorphSpinner / DropdownCaret hand only
// serialisable values (strings) as `shapes` to MorphRotationShape? Also prints
// the SSR markup hash so a before/after build can be compared for drawing drift.
// Usage: node docs/audit/_work/scratch/C1/shapes-serializable.mjs <path-to>/dist
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const dist = path.resolve(process.argv[2]);
const require = createRequire(path.join(dist, 'index.js'));
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const pkg = await import(pathToFileURL(path.join(dist, 'index.js')).href);
const findMrs = (el) => {
  if (!el || typeof el !== 'object') return null;
  if (el.type === pkg.MorphRotationShape) return el;
  for (const c of [].concat(el.props?.children ?? [])) { const f = findMrs(c); if (f) return f; }
  return null;
};
let fail = 0;
const cases = [
  ['ShapeMorphSpinner()', pkg.ShapeMorphSpinner({})],
  ['DropdownCaret(dropdown)', pkg.DropdownCaret({ variant: pkg.DropdownCaretVariant.dropdown })],
  ['DropdownCaret(typeable)', pkg.DropdownCaret({ variant: pkg.DropdownCaretVariant.typeable })],
];
for (const [name, el] of cases) {
  const mrs = findMrs(el);
  const kinds = (mrs?.props.shapes ?? []).map((s) => typeof s);
  const ok = kinds.length >= 2 && kinds.every((k) => k === 'string');
  if (!ok) fail++;
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}: shapes passed to MorphRotationShape = [${(mrs?.props.shapes ?? []).map((s) => (typeof s === 'string' ? JSON.stringify(s) : `${typeof s} ${s.name}`)).join(', ')}]`);
}
const h = React.createElement;
for (const [name, el] of [['ShapeMorphSpinner', h(pkg.ShapeMorphSpinner)], ['DropdownCaret', h(pkg.DropdownCaret)], ['DropdownCaret typeable', h(pkg.DropdownCaret, { variant: pkg.DropdownCaretVariant.typeable })]]) {
  const html = renderToStaticMarkup(el).replace(/_R_[A-Za-z0-9_]+_|:r[0-9a-z]+:/g, 'ID');
  console.log(`SSR ${name} sha1=${createHash('sha1').update(html).digest('hex').slice(0, 12)} length=${html.length}`);
}
console.log(fail ? `FAILURES: ${fail}` : 'ALL PASS');
process.exitCode = fail ? 1 : 0;
