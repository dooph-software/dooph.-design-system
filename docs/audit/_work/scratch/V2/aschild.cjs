const { createRequire } = require('module');
const B = 'C:/Users/stick/Github/dooph/dooph-ds-audit-build/';
const r = createRequire(B + 'package.json');
const React = r('react');
const { renderToStaticMarkup } = r('react-dom/server');
const ds = r(B + 'dist/index.cjs');
const h = React.createElement;
const cases = [
  ['Button', () => h(ds.Button, { asChild: true }, h('a', { href: '/x' }, 'Go'))],
  ['CTAButton', () => h(ds.CTAButton, { asChild: true, text: 'Go', icon: h('span', null, '>') }, h('a', { href: '/x' }))],
  ['OutlineButton', () => h(ds.OutlineButton, { asChild: true }, h('a', { href: '/x' }, 'Go'))],
  ['OutlineButton glowing', () => h(ds.OutlineButton, { asChild: true, glowing: true }, h('a', { href: '/x' }, 'Go'))],
  ['ShapeButton', () => h(ds.ShapeButton, { asChild: true }, h('a', { href: '/x' }, 'Go'))],
  ['DropdownTrigger', () => h(ds.DropdownTrigger, { asChild: true }, h('a', { href: '/x' }, 'Go'))],
  ['TextDropdownTrigger', () => h(ds.TextDropdownTrigger, { asChild: true }, h('a', { href: '/x' }, 'Go'))],
  ['OutlineButton (no asChild)', () => h(ds.OutlineButton, null, 'Go')],
  ['ShapeButton (no asChild)', () => h(ds.ShapeButton, null, 'Go')],
  ['DropdownTrigger (no asChild)', () => h(ds.DropdownTrigger, null, 'Go')],
  ['TextDropdownTrigger (no asChild)', () => h(ds.TextDropdownTrigger, null, 'Go')],
];
const origErr = console.error; console.error = () => {};
for (const [name, fn] of cases) {
  try { const out = renderToStaticMarkup(fn()); console.log('OK   ' + name + ' -> ' + out.slice(0, 140)); }
  catch (e) { console.log('THROW ' + name + ' -> ' + String(e.message).slice(0, 120)); }
}
console.log('react', React.version, 'slot', r('@radix-ui/react-slot/package.json').version);
