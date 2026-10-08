// D2 element-access check (WI-108). Usage: node access.cjs <bundle.cjs>
// Mirrors W7c render.cjs "06" checks, plus: the ref a consumer passes to an icon,
// a shape and SidebarWithHoverIcon reaches BaseIcon's forwardRef render (spied),
// and a labelled icon is not aria-hidden.
const path = require('path');
const R = path.resolve(__dirname, '../../../../../../node_modules/');
const React = require(R + '/react');
const { renderToStaticMarkup } = require(R + '/react-dom/server');
const ds = require(path.resolve(process.argv[2]));
const h = React.createElement;
console.error = () => {};
let fail = 0;
const check = (label, ok) => { console.log((ok ? 'PASS ' : 'FAIL ') + label); if (!ok) fail = 1; };
const r = (el) => { try { return renderToStaticMarkup(el); } catch (e) { return 'THROW ' + e.message; } };

const icon = r(h(ds.CheckIcon, { 'aria-label': 'Done', role: 'img', 'aria-hidden': false, 'data-x': '1', style: { opacity: 0.5 } }));
check('CheckIcon aria-label/role/data-* reach the <svg>', /^<svg[^>]*aria-label="Done"/.test(icon) && /^<svg[^>]*role="img"/.test(icon) && /^<svg[^>]*data-x="1"/.test(icon));
check('CheckIcon consumer style merges with the size/stroke style', /^<svg[^>]*style="[^"]*width:var\(--ui-icon-rg\)[^"]*opacity:0.5/.test(icon));
const shape = r(h(ds.CloverShape, { size: 24, className: 'text-primary', 'data-x': '1' }));
check('CloverShape className and rest reach the <svg>', /^<svg[^>]*class="shrink-0 text-primary"/.test(shape) && /^<svg[^>]*data-x="1"/.test(shape));
const shapeOwn = r(h(ds.CloverShape, { size: 24, strokeWidth: 9, style: { width: 1 } }));
check('Shape own size still wins over rest; consumer style merges last', /width:1px/.test(shapeOwn) && /stroke-width:1px/.test(shapeOwn));
const rail = r(h(ds.SidebarWithHoverIcon, { 'data-x': '1', id: 'rail' }));
check('SidebarWithHoverIcon rest props reach the <svg>', /^<svg[^>]*data-x="1"/.test(rail) && /^<svg[^>]*id="rail"/.test(rail));

const labelled = r(h(ds.CheckIcon, { 'aria-label': 'Done' }));
check('labelled icon (no explicit aria-hidden) is not aria-hidden', !/aria-hidden/.test(labelled.split('>')[0]));
const labelledBy = r(h(ds.CheckIcon, { 'aria-labelledby': 'l' }));
check('aria-labelledby icon is not aria-hidden', !/aria-hidden/.test(labelledBy.split('>')[0]));
const forced = r(h(ds.CheckIcon, { 'aria-label': 'Done', 'aria-hidden': true }));
check('explicit aria-hidden still wins on a labelled icon', /aria-hidden="true"/.test(forced));
check('unlabelled icon stays aria-hidden="true"', /^<svg[^>]*aria-hidden="true"/.test(r(h(ds.CheckIcon, {}))));

// ref reaches BaseIcon's forwardRef render: spy on the render function SSR calls.
const orig = ds.BaseIcon.render;
const seen = [];
ds.BaseIcon.render = (props, ref) => { seen.push(ref); return orig(props, ref); };
for (const [name, el] of [
  ['CheckIcon', (ref) => h(ds.CheckIcon, { ref })],
  ['CloverShape', (ref) => h(ds.CloverShape, { size: 24, ref })],
  ['SidebarWithHoverIcon', (ref) => h(ds.SidebarWithHoverIcon, { ref })],
  ['BaseIcon', (ref) => h(ds.BaseIcon, { ref })],
]) {
  const ref = { current: null, tag: name };
  seen.length = 0;
  r(el(ref));
  check(`${name} ref arrives at BaseIcon's forwardRef render`, seen.length === 1 && seen[0] === ref);
}
ds.BaseIcon.render = orig;
check('BaseIcon displayName', ds.BaseIcon.displayName === 'BaseIcon');
process.exit(fail);
