// WI-C7-58 reproduction. Usage: node 58-menu.cjs [build-dir]  (a dir holding dist/ and node_modules/)
const B = process.argv[2] || 'C:/Users/stick/Github/dooph/dooph-ds-audit-build';
const React = require(B + '/node_modules/react');
const { renderToStaticMarkup } = require(B + '/node_modules/react-dom/server');
const ds = require(B + '/dist/index.cjs');
const h = React.createElement;
let fail = 0;
const check = (label, ok) => { console.log((ok ? 'PASS ' : 'FAIL ') + label); if (!ok) fail = 1; };
const out = renderToStaticMarkup(
  h(ds.DropdownMenu, null,
    h(ds.DropdownMenuTrigger, { asChild: true }, h(ds.TypeableDropdownTrigger, { placeholder: 'x' }))));
const root = (out.match(/^<div[^>]*>/) || [''])[0];
console.log('root =>', root);
check('TypeableDropdownTrigger root <div> carries no type= attribute', root !== '' && !/ type="/.test(root));
check('the inner <input> stays type="text"', /<input[^>]* type="text"/.test(out));
check('Radix trigger attributes still reach the root (aria-haspopup, data-state)', /aria-haspopup="menu"/.test(root) && /data-state="closed"/.test(root));
process.exit(fail);
