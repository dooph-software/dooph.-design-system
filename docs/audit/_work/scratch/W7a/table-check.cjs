// Usage: node table-check.cjs <build-dir>   (a dir holding dist/ and node_modules/)
const B = process.argv[2] || 'C:/Users/stick/Github/dooph/dooph-ds-audit-build';
const React = require(B + '/node_modules/react');
const { renderToStaticMarkup } = require(B + '/node_modules/react-dom/server');
const ds = require(B + '/dist/index.cjs');
const h = React.createElement;
let fail = 0;
const check = (label, ok) => { console.log((ok ? 'PASS ' : 'FAIL ') + label); if (!ok) fail = 1; };
const row = renderToStaticMarkup(h(ds.TableRow, { style: { opacity: 0.5 } }));
check('TableRow style merge keeps grid', /grid-template-columns:var\(--table-cols\)/.test(row) && /opacity:0.5/.test(row));
const head = renderToStaticMarkup(h(ds.TableHeader, { style: { opacity: 0.5 } }));
check('TableHeader style merge keeps grid', /grid-template-columns:var\(--table-cols\)/.test(head) && /opacity:0.5/.test(head));
const t = renderToStaticMarkup(
  h(ds.Table, { columns: '1fr 1fr' },
    h(ds.TableHeader, null,
      h(ds.TableHeaderCell, { sortDirection: ds.TableSortDirection.ascend, onSort: () => {}, buttonProps: { 'aria-describedby': 'hint' } }, 'Name'),
      h(ds.TableHeaderCell, null, 'Role')),
    h(ds.TableRow, null, h(ds.TableCell, null, 'a'), h(ds.TableCell, null, 'b')),
    h(ds.TablePlaceholder, null, 'empty')));
check('role="table"', /role="table"/.test(t));
check('three role="row" (header, row, placeholder)', (t.match(/role="row"/g) || []).length === 3);
check('two role="columnheader"', (t.match(/role="columnheader"/g) || []).length === 2);
check('aria-sort="ascending" on the sortable header', /role="columnheader"[^>]*aria-sort="ascending"|aria-sort="ascending"[^>]*role="columnheader"/.test(t));
check('three role="cell" (two cells + placeholder)', (t.match(/role="cell"/g) || []).length === 3);
check('buttonProps reach the sort <button>', /<button[^>]*aria-describedby="hint"/.test(t));
process.exit(fail);
