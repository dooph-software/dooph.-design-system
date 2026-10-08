const B = 'C:/Users/stick/Github/dooph/dooph-ds-audit-build/';
const React = require(B + 'node_modules/react');
const { renderToStaticMarkup } = require(B + 'node_modules/react-dom/server');
const ds = require(B + 'dist/index.cjs');
const h = React.createElement;
for (const name of ['DropdownTrigger', 'TextDropdownTrigger']) {
  try {
    const out = renderToStaticMarkup(h(ds[name], { asChild: true }, h('a', { href: '/x' }, 'Go')));
    console.log(name, 'asChild OK:', out.slice(0, 200));
  } catch (e) {
    console.log(name, 'asChild THROWS:', e.message.split('\n')[0]);
  }
  const out2 = renderToStaticMarkup(h(ds[name], null, 'Label'));
  console.log(name, 'default OK:', out2.length, 'chars');
}
