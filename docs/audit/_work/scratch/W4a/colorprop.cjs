// WI-C4-16 reproduction: SSR the four colour-prop components with DS colour names.
const { createRequire } = require('module');
const B = process.argv[2] || 'C:/Users/stick/Github/dooph/dooph-ds-audit-build';
const req = createRequire(B + '/package.json');
const React = req('react'); const { renderToStaticMarkup } = req('react-dom/server');
const DS = req(B + '/dist/index.cjs'); const h = React.createElement;
const cases = [
  ['ProgressIndicator text-secondary', h(DS.ProgressIndicator, { progress: 0.5, color: 'text-secondary' })],
  ['ProgressIndicator primary', h(DS.ProgressIndicator, { progress: 0.5, color: 'primary' })],
  ['ProgressIndicator #a3c2d1', h(DS.ProgressIndicator, { progress: 0.5, color: '#a3c2d1' })],
  ['LoadingSpinner text-secondary', h(DS.LoadingSpinner, { color: 'text-secondary' })],
  ['LoadingSpinner spokes danger', h(DS.LoadingSpinner, { variant: 'spokes', color: 'danger' })],
  ['AIContextGauge danger', h(DS.AIContextGauge, { used: 50, budget: 100, color: 'danger' })],
  ['ShapeMorphSpinner text-secondary', h(DS.ShapeMorphSpinner, { color: 'text-secondary' })],
];
for (const [id, el] of cases) {
  let html; try { html = renderToStaticMarkup(el); } catch (e) { html = 'ERR ' + e.message; }
  const strokes = [...new Set([...html.matchAll(/stroke="([^"]*)"/g)].map(m => m[1]))];
  const colors = [...html.matchAll(/[";](color|stroke):([^;"]*)/g)].map(m => m[1] + ":" + m[2]);
  console.log(`${id}: strokes=${JSON.stringify(strokes)} styleColor=${JSON.stringify(colors)}`);
}
