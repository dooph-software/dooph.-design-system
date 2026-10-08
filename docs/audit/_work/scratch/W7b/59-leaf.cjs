// WI-C7-59 check. Usage: node 59-leaf.cjs [build-dir] [--dump]
//   Prints markup that must not change (--dump, for a before/after diff) and checks the Sticker displayName split.
const B = (process.argv[2] && !process.argv[2].startsWith('--')) ? process.argv[2] : 'C:/Users/stick/Github/dooph/dooph-ds-audit-build';
const React = require(B + '/node_modules/react');
const { renderToStaticMarkup } = require(B + '/node_modules/react-dom/server');
const ds = require(B + '/dist/index.cjs');
const h = React.createElement;
const cases = {
  stickerCustom: h(ds.Sticker, { variant: 'custom', color: 'danger' }, 'x'),
  stickerPreset: h(ds.Sticker, { variant: ds.StickerVariant.prominent }, 'x'),
  tableHeaderSort: h(ds.TableHeaderCell, { sortDirection: ds.TableSortDirection.ascend, onSort: () => {} }, 'Name'),
  table: h(ds.Table, { columns: '1fr 1fr', rowHeight: '40px', style: { opacity: 0.5 } }),
  rolling: h(ds.RollingDigitsText, { className: 'c', style: { color: 'red' }, 'data-x': '1' }, '$1,234.56'),
  underline: h(ds.UnderlineLinkText, { thickness: 2, offset: '0.1em' }, 'u'),
  bodyText: h(ds.BodyText, { fontSize: 18, letterSpacing: 0.5 }, 't'),
};
if (process.argv.includes('--dump')) {
  for (const [k, el] of Object.entries(cases)) console.log(k, renderToStaticMarkup(el));
  process.exit(0);
}
let fail = 0;
const check = (label, ok) => { console.log((ok ? 'PASS ' : 'FAIL ') + label); if (!ok) fail = 1; };
const sticker = renderToStaticMarkup(cases.stickerCustom);
check('custom Sticker paints the requested colour', /color:var\(--ui-color-danger-primary\)/.test(sticker));
// The inner base component is reachable through the outer forwardRef's render output type.
const inner = ds.Sticker.render ? ds.Sticker.render({ children: 'x', variant: 'prominent' }, null) : null;
const baseName = inner && inner.type && inner.type.displayName;
console.log('Sticker.displayName =', ds.Sticker.displayName, '| inner base displayName =', baseName);
check('Sticker and its base have distinct displayNames (StickerBase)', ds.Sticker.displayName === 'Sticker' && baseName === 'StickerBase');
process.exit(fail);
