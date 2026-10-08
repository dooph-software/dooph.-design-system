// WI-C4-17 reproduction: SSR flat vs wavy ProgressIndicator and print the track circle.
// A track <circle> whose stroke-dasharray starts with "0 " paints a round-cap dot.
const { createRequire } = require('module');
const B = process.argv[2] || 'C:/Users/stick/Github/dooph/dooph-ds-audit-build';
const req = createRequire(B + '/package.json');
const React = req('react'); const { renderToStaticMarkup } = req('react-dom/server');
const DS = req(B + '/dist/index.cjs'); const h = React.createElement;
let zeroDash = 0;
for (const variant of ['flat', 'wavy']) for (const size of ['sm', 'rg', 'md', 'xl']) for (const p of [0, 0.5, 0.9, 0.94, 1]) {
  const html = renderToStaticMarkup(h(DS.ProgressIndicator, { progress: p, size, variant }));
  const track = [...html.matchAll(/<circle[^>]*stroke="var\(--ui-color-border-primary\)"[^>]*>/g)].map(m => m[0]);
  const dash = track.map(t => (t.match(/stroke-dasharray="([^"]*)"/) || [])[1]);
  const isZero = dash.some(d => d && /^0 /.test(d));
  if (isZero) zeroDash++;
  console.log(`${variant} ${size} p=${p}: trackCircles=${track.length} dasharray=${JSON.stringify(dash)}${isZero ? '  <-- zero-length round-capped dash (dot)' : ''}`);
}
console.log(`zero-length track dashes: ${zeroDash}`);
