// WI-C7-04 reproduction / acceptance check (F-038).
// Usage: node guards-check.cjs <build-dir>   (a dir holding dist/ and node_modules/)
// Defaults to the audit build of b436647, where every check below prints FAIL
// except the two "still" baselines. Run with NODE_ENV=production as well: the
// Calendar/DatePicker checks must pass in both.
const B = process.argv[2] || 'C:/Users/stick/Github/dooph/dooph-ds-audit-build';
const React = require(B + '/node_modules/react');
const { renderToStaticMarkup } = require(B + '/node_modules/react-dom/server');
const ds = require(B + '/dist/index.cjs');
const h = React.createElement;
const origWarn = console.warn, origErr = console.error;
console.warn = () => {}; console.error = () => {};
let fail = 0;
const check = (label, ok, detail) => {
  origWarn((ok ? 'PASS ' : 'FAIL ') + label + (ok || !detail ? '' : '  -> ' + detail));
  if (!ok) fail = 1;
};
const run = (el) => {
  try { return { html: renderToStaticMarkup(el) }; }
  catch (e) { return { error: String(e && e.message) }; }
};
const noop = () => {};
const d = new Date(2026, 8, 15);
// Both prop spellings, so the check survives WI-C7-03's rename.
const cal = (mode, v) => h(ds.Calendar, { mode, selected: v, value: v, onSelect: noop, onValueChange: noop, today: d });

let r = run(cal('single-day', undefined));
check('Calendar single-day, value undefined renders nothing (no TypeError)', r.html === '', r.error || r.html);
r = run(cal('date-range', undefined));
check('Calendar date-range, value undefined renders nothing', r.html === '', r.error || r.html);
r = run(cal('single', d));
check('Calendar unknown mode "single" renders nothing (not range)', r.html === '', r.error || r.html.slice(0, 80));
r = run(cal('single-day', d));
check('still: Calendar single-day with a Date renders', !!r.html && r.html.length > 0, r.error);
r = run(h(ds.DatePicker, { mode: 'single-day', value: undefined, onChange: noop, onValueChange: noop, today: d }));
check('DatePicker single-day, value undefined renders its trigger (no TypeError)', !!r.html && /<button/.test(r.html), r.error || r.html);
r = run(h(ds.DatePicker, { mode: 'date-range', value: undefined, onChange: noop, onValueChange: noop, splitPresets: ds.DEFAULT_SPLIT_TRIGGER_PRESETS, today: d }));
check('DatePicker date-range split, value undefined renders its trigger (no TypeError)', !!r.html && /<button/.test(r.html), r.error || r.html);

r = run(h(ds.Input, { variant: 'icon-text', icon: false }));
check('Input icon={false} throws [Input]', !!r.error && r.error.startsWith('[Input]'), r.error || 'rendered');
r = run(h(ds.Input, { variant: 'icon-text', icon: null }));
check('Input icon={null} throws [Input]', !!r.error && r.error.startsWith('[Input]'), r.error || 'rendered');
r = run(h(ds.Input, { variant: 'icon-text', icon: h('svg') }));
check('still: Input with an icon element renders', !!r.html, r.error);

r = run(h(ds.SliderStepped, { variant: 'custom', color: '', steps: 3 }));
check('SliderStepped custom color="" throws [Slider]', !!r.error && r.error.startsWith('[Slider]'), r.error || 'rendered');

r = run(h(ds.ProgressIndicator, { progress: NaN }));
check('ProgressIndicator progress={NaN} throws [ProgressIndicator]', !!r.error && r.error.startsWith('[ProgressIndicator]'), r.error || 'rendered');
r = run(h(ds.ProgressIndicator, { progress: 0.5 }));
check('still: ProgressIndicator progress={0.5} renders', !!r.html, r.error);

process.exit(fail);
