const { createRequire } = require('module');
const B = 'C:/Users/stick/Github/dooph/dooph-ds-audit-build/';
const r = createRequire(B + 'package.json');
const React = r('react');
const { renderToStaticMarkup } = r('react-dom/server');
const ds = r(B + 'dist/index.cjs');
for (const n of ['PentagonShape','PuffShape','SquircleShape','CloverShape']) {
  if (!ds[n]) { console.log('missing export', n); continue; }
  const out = renderToStaticMarkup(React.createElement(ds[n], { size: 24, fillColor: 'red' }));
  console.log(n, out.replace(/d="[^"]{40,}"/g, 'd="…"'));
}
