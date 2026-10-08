// WI-C7-51 reproduction. Usage: node 51-loaders.cjs [build-dir]  (a dir holding dist/ and node_modules/)
const B = process.argv[2] || 'C:/Users/stick/Github/dooph/dooph-ds-audit-build';
const React = require(B + '/node_modules/react');
const { renderToStaticMarkup } = require(B + '/node_modules/react-dom/server');
const ds = require(B + '/dist/index.cjs');
const h = React.createElement;
let fail = 0;
const check = (label, ok) => { console.log((ok ? 'PASS ' : 'FAIL ') + label); if (!ok) fail = 1; };
const ls = renderToStaticMarkup(h(ds.LoadingSpinner));
const sms = renderToStaticMarkup(h(ds.ShapeMorphSpinner));
check('LoadingSpinner role="progressbar"', /^<svg[^>]*role="progressbar"/.test(ls));
check('LoadingSpinner keeps aria-label="Loading"', /aria-label="Loading"/.test(ls));
check('LoadingSpinner aria-label still overridable', /aria-label="Saving"/.test(renderToStaticMarkup(h(ds.LoadingSpinner, { 'aria-label': 'Saving' }))));
check('ShapeMorphSpinner role="progressbar"', /role="progressbar"/.test(sms));
check('ShapeMorphSpinner default size rg', /width:var\(--ui-size-spinner-rg\)/.test(sms));
check('LoadingSpinner default diameter 22', /width="22"/.test(ls));
process.exit(fail);
