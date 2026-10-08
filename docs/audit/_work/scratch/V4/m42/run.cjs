// V4 / M42 runtime probes against the built dist (same SHA).
const B = 'C:/Users/stick/Github/dooph/dooph-ds-audit-build/';
const React = require(B + 'node_modules/react');
const { renderToStaticMarkup } = require(B + 'node_modules/react-dom/server');
const ds = require(B + 'dist/index.cjs');
const h = React.createElement;
const warns = [];
const origWarn = console.warn, origErr = console.error;
console.warn = (...a) => warns.push('warn: ' + String(a[0]).slice(0, 140));
console.error = (...a) => warns.push('error: ' + String(a[0]).slice(0, 140));
function probe(label, el) {
  warns.length = 0;
  let out;
  try {
    out = 'OK  ' + renderToStaticMarkup(el).replace(/\s+/g, ' ').slice(0, 220);
  } catch (e) {
    out = 'THROW ' + e.constructor.name + ': ' + String(e.message).slice(0, 160);
  }
  origWarn(`[${process.env.NODE_ENV || 'dev'}] ${label}\n   ${out}` + (warns.length ? '\n   ' + warns.join('\n   ') : ''));
}
const noop = () => {};
const d = new Date(2026, 8, 15);
probe('Calendar single, selected undefined', h(ds.Calendar, { mode: 'single-day', selected: undefined, onSelect: noop, today: d }));
probe('Calendar range, selected undefined', h(ds.Calendar, { mode: 'date-range', selected: undefined, onSelect: noop, today: d }));
probe('Calendar mode "single" (unknown) + Date', h(ds.Calendar, { mode: 'single', selected: d, onSelect: noop, today: d }));
probe('Calendar mode "single" (unknown) + {from,to}', h(ds.Calendar, { mode: 'single', selected: { from: d, to: d }, onSelect: noop, today: d }));
probe('DatePicker single, value undefined', h(ds.DatePicker, { mode: 'single-day', value: undefined, onChange: noop, today: d }));
probe('Input iconText icon=null', h(ds.Input, { variant: 'icon-text', icon: null }));
probe('Input iconText icon=undefined', h(ds.Input, { variant: 'icon-text', icon: undefined }));
probe('Input iconText icon=false', h(ds.Input, { variant: 'icon-text', icon: false }));
probe('Input iconText icon=""', h(ds.Input, { variant: 'icon-text', icon: '' }));
probe('Input iconText icon=0', h(ds.Input, { variant: 'icon-text', icon: 0 }));
probe('SliderStepped custom color=""', h(ds.SliderStepped, { variant: 'custom', color: '', steps: 3 }));
probe('SliderStepped custom color undefined', h(ds.SliderStepped, { variant: 'custom', steps: 3 }));
probe('RollingDigitsText smallDecimals w/o component', h(ds.RollingDigitsText, { smallDecimals: true }, '$1.25'));
probe('ProgressIndicator NaN', h(ds.ProgressIndicator, { progress: NaN }));
probe('ProgressIndicator NaN wavy', h(ds.ProgressIndicator, { progress: NaN, variant: 'wavy' }));
probe('ProgressIndicator 1.5', h(ds.ProgressIndicator, { progress: 1.5 }));
