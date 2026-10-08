// D2 markup snapshot. Usage: node render.cjs <bundle.cjs>  (bundle = esbuild of src/index.ts)
// Renders every icon, every shape, SidebarWithHoverIcon, ShapeButton and CTAButton
// with NO new props (only props that existed before WI-108), one line each.
const path = require('path');
const React = require(path.resolve(__dirname, '../../../../../../node_modules/react'));
const { renderToStaticMarkup } = require(path.resolve(__dirname, '../../../../../../node_modules/react-dom/server'));
const ds = require(path.resolve(process.argv[2]));
const h = React.createElement;
console.error = () => {};
const out = [];
const r = (label, el) => { let m; try { m = renderToStaticMarkup(el); } catch (e) { m = 'THROW ' + e.message; } out.push(label + ': ' + m); };
const names = Object.keys(ds).sort();
for (const n of names.filter((n) => /Icon$/.test(n) && n !== 'BaseIcon' && n !== 'SidebarWithHoverIcon')) {
  r(n, h(ds[n], {}));
  r(n + '+props', h(ds[n], { size: ds.IconSize.md, color: 'red', strokeWidth: 2, className: 'x', 'aria-hidden': false }));
  r(n + '+num', h(ds[n], { size: 20, strokeColor: 'blue', fillColor: 'green', 'aria-hidden': 'false' }));
}
r('BaseIcon', h(ds.BaseIcon, {}, h('path', { d: 'M0 0' })));
for (const n of names.filter((n) => /Shape$/.test(n) && typeof ds[n] === 'function' && !/^(Base|MorphRotation)/.test(n))) {
  r(n, h(ds[n], { size: 24 }));
  r(n + '+props', h(ds[n], { size: 'var(--ui-size-x)', strokeColor: 'red', fillColor: 'blue', strokeWeight: 2 }));
}
r('BaseShape', h(ds.BaseShape, { size: 24 }, h('path', { d: 'M0 0' })));
for (const side of ['left', 'right']) for (const hovered of [false, true])
  r(`SidebarWithHoverIcon ${side} ${hovered}`, h(ds.SidebarWithHoverIcon, { side, hovered, size: ds.IconSize.md, className: 'y' }));
for (const shape of Object.values(ds.ShapeButtons)) for (const variant of Object.values(ds.ShapeButtonVariant))
  r(`ShapeButton ${shape} ${variant}`, h(ds.ShapeButton, { shape, variant, 'aria-label': 'x' }, 'A'));
for (const size of Object.values(ds.CTAButtonSize)) r('CTAButton ' + size, h(ds.CTAButton, { text: 'Go', icon: h(ds.ArrowRightIcon, {}), size, href: '#' }));
console.log(out.join('\n'));
