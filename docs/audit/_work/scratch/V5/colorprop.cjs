const { createRequire } = require('module'); const fs = require('fs'); const path = require('path');
const B = 'C:/Users/stick/Github/dooph/dooph-ds-audit-build';
const req = createRequire(B + '/package.json');
const React = req('react'); const { renderToStaticMarkup } = req('react-dom/server');
const DS = req(B + '/dist/index.cjs'); const h = React.createElement;
const cases = [
  ['lpi-text-secondary', h(DS.LinearProgressIndicator, { value: 50, color: 'text-secondary' })],
  ['pi-text-secondary', h(DS.ProgressIndicator, { progress: 0.5, value: 50, color: 'text-secondary' })],
  ['pi-prominent', h(DS.ProgressIndicator, { progress: 0.5, value: 50, color: 'prominent' })],
  ['gauge-danger', h(DS.AIContextGauge, { value: 50, progress: 0.5, color: 'danger' })],
  ['gauge-default', h(DS.AIContextGauge, { value: 50, progress: 0.5 })],
  ['spinner-text-secondary', h(DS.LoadingSpinner, { color: 'text-secondary' })],
];
let body = '';
for (const [id, el] of cases) {
  let html; try { html = renderToStaticMarkup(el); } catch (e) { html = 'ERR ' + e.message; }
  const strokes = [...html.matchAll(/stroke="([^"]*)"/g)].map(m => m[1]);
  const styleColor = [...html.matchAll(/style="([^"]*)"/g)].map(m => m[1]).filter(s => /color|stroke/.test(s));
  console.log(`== ${id}\n strokes: ${JSON.stringify(strokes)}\n color-ish styles: ${JSON.stringify(styleColor)}`);
  body += `<section id="${id}">${html}</section>\n`;
}
const css = fs.readFileSync(B + '/dist/styles.css', 'utf8');
fs.writeFileSync(path.join(__dirname, 'colorprop-probe.html'), `<!doctype html><html class="light"><head><meta charset="utf-8"><style>${css}</style></head><body>${body}</body></html>`);
