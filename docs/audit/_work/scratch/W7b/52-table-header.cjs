// WI-C7-52 reproduction. Usage: node 52-table-header.cjs [build-dir]  (a dir holding dist/ and node_modules/)
const B = process.argv[2] || 'C:/Users/stick/Github/dooph/dooph-ds-audit-build';
const React = require(B + '/node_modules/react');
const { renderToStaticMarkup } = require(B + '/node_modules/react-dom/server');
const ds = require(B + '/dist/index.cjs');
const h = React.createElement;
let fail = 0;
const check = (label, ok) => { console.log((ok ? 'PASS ' : 'FAIL ') + label); if (!ok) fail = 1; };
const plain = renderToStaticMarkup(h(ds.TableHeaderCell, null, 'Name'));
const sortable = renderToStaticMarkup(h(ds.TableHeaderCell, { sortDirection: ds.TableSortDirection.none, onSort: () => {} }, 'Name'));
console.log('plain    =>', plain);
check('plain header label carries text-style-button', /text-style-button[^>]*>Name</.test(plain));
check('sortable header label carries text-style-button', /text-style-button[^>]*>Name</.test(sortable));
const wrapped = renderToStaticMarkup(h(ds.TableHeaderCell, null, h(ds.BodyText, null, 'Name')));
check('a consumer role component stays the innermost span', /text-style-body[^>]*>Name</.test(wrapped));
process.exit(fail);
