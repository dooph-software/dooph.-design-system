// WI-C7-53 reproduction. Usage: node 53-shapes.cjs [build-dir] [--dump]
//   default build-dir: the audit build (b436647). --dump prints one markup line per shape (for a before/after diff).
const B = (process.argv[2] && !process.argv[2].startsWith('--')) ? process.argv[2] : 'C:/Users/stick/Github/dooph/dooph-ds-audit-build';
const React = require(B + '/node_modules/react');
const { renderToStaticMarkup } = require(B + '/node_modules/react-dom/server');
const ds = require(B + '/dist/index.cjs');
const h = React.createElement;
const NAMES = ['Arrow','Capsule','Clover','Cookie','Diamond','Double','Pentagon','Pixircle','Puff','Squircle','Star','Triple'].map(n => n + 'Shape');
if (process.argv.includes('--dump')) {
  for (const n of NAMES) console.log(n, renderToStaticMarkup(h(ds[n], { size: 24 })));
  process.exit(0);
}
let fail = 0;
const check = (label, ok) => { console.log((ok ? 'PASS ' : 'FAIL ') + label); if (!ok) fail = 1; };
const two = renderToStaticMarkup(h('div', null, h(ds.ArrowShape, { size: 24 }), h(ds.ArrowShape, { size: 24 })));
check('two ArrowShapes emit no id= and no clip-path', !/ id="/.test(two) && !/clip-path/.test(two));
for (const n of NAMES) {
  const out = renderToStaticMarkup(h(ds[n], { size: 24, fillColor: 'red' }));
  check(`${n}: fill:red on the svg, no fill= on the path, one <path>`,
    /<svg[^>]*style="[^"]*fill:red/.test(out) && !/<path[^>]* fill=/.test(out) && (out.match(/<path/g) || []).length === 1);
}
for (const n of NAMES) check(`${n}.displayName === "${n}"`, (ds[n].displayName || ds[n].name) === n);
process.exit(fail);
