const B = 'C:/Users/stick/Github/dooph/dooph-ds-audit-build/';
const React = require(B + 'node_modules/react');
const { renderToStaticMarkup } = require(B + 'node_modules/react-dom/server');
const ds = require(B + 'dist/index.cjs');
const h = React.createElement;
for (const name of ['Button', 'OutlineButton', 'ShapeButton']) {
  if (!ds[name]) { console.log(name, 'not exported'); continue; }
  try {
    const out = renderToStaticMarkup(h(ds[name], { asChild: true }, h('a', { href: '/x' }, 'Go')));
    console.log(name, 'asChild OK:', out.slice(0, 160));
  } catch (e) { console.log(name, 'asChild THROWS:', e.message.split('\n')[0]); }
}
