// WI-C7-05/-06/-07 SSR check (F-039). Usage: node render.cjs <build-dir> [05|06|07]
// Defaults to the audit build of b436647, where every check prints FAIL.
const B = process.argv[2] || 'C:/Users/stick/Github/dooph/dooph-ds-audit-build';
const only = process.argv[3];
const React = require(B + '/node_modules/react');
const { renderToStaticMarkup } = require(B + '/node_modules/react-dom/server');
const ds = require(B + '/dist/index.cjs');
const h = React.createElement;
console.error = () => {};
let fail = 0;
const check = (wi, label, ok) => {
  if (only && only !== wi) return;
  console.log((ok ? 'PASS ' : 'FAIL ') + 'WI-C7-' + wi + ' ' + label);
  if (!ok) fail = 1;
};
const r = (el) => { try { return renderToStaticMarkup(el); } catch (e) { return 'THROW ' + e.message; } };
const d = new Date(2026, 8, 15);
const noop = () => {};

const split = r(h(ds.SplitButton, { 'data-x': '1', id: 'sb' }, 'Save'));
check('05', 'SplitButton rest props reach the root div', /^<div[^>]*data-x="1"/.test(split) && /^<div[^>]*id="sb"/.test(split));
const hk = r(h(ds.HotkeyIndicator, { keys: ['K'], id: 'hk' }));
check('05', 'HotkeyIndicator rest props still reach the span (regression guard)', /^<span[^>]*id="hk"/.test(hk));

const icon = r(h(ds.CheckIcon, { 'aria-label': 'Done', role: 'img', 'aria-hidden': false, 'data-x': '1', style: { opacity: 0.5 } }));
check('06', 'CheckIcon aria-label/role/data-* reach the <svg>', /^<svg[^>]*aria-label="Done"/.test(icon) && /^<svg[^>]*role="img"/.test(icon) && /^<svg[^>]*data-x="1"/.test(icon));
check('06', 'CheckIcon consumer style merges with the size/stroke style', /^<svg[^>]*style="[^"]*width:var\(--ui-icon-rg\)[^"]*opacity:0.5/.test(icon));
const shape = r(h(ds.CloverShape, { size: 24, className: 'text-primary', 'data-x': '1' }));
check('06', 'CloverShape className and rest reach the <svg>', /^<svg[^>]*class="[^"]*text-primary/.test(shape) && /^<svg[^>]*data-x="1"/.test(shape));
const rail = r(h(ds.SidebarWithHoverIcon, { 'data-x': '1' }));
check('06', 'SidebarWithHoverIcon rest props reach the <svg>', /^<svg[^>]*data-x="1"/.test(rail));

const cal = r(h(ds.Calendar, { mode: 'single-day', selected: d, value: d, onSelect: noop, onValueChange: noop, today: d, id: 'c', 'aria-label': 'Pick a day', 'data-x': '1' }));
check('07', 'Calendar id/aria-label/data-* reach the root div', /^<div[^>]*id="c"/.test(cal) && /^<div[^>]*aria-label="Pick a day"/.test(cal) && /^<div[^>]*data-x="1"/.test(cal));
const dp = r(h(ds.DatePicker, { mode: 'single-day', value: d, onChange: noop, onValueChange: noop, today: d, triggerProps: { id: 'dp', 'aria-describedby': 'hint' } }));
check('07', 'DatePicker triggerProps reach the trigger <button>', /<button[^>]*id="dp"/.test(dp) && /<button[^>]*aria-describedby="hint"/.test(dp));
process.exit(fail);
