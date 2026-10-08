// V5: SSR-render disabled controls from the audit build's dist and emit an HTML page that links dist/styles.css.
const { createRequire } = require('module');
const path = require('path');
const fs = require('fs');
const B = 'C:/Users/stick/Github/dooph/dooph-ds-audit-build';
const req = createRequire(B + '/package.json');
const React = req('react');
const { renderToStaticMarkup } = req('react-dom/server');
const DS = req(B + '/dist/index.cjs');
const h = React.createElement;
const pick = (n) => { if (!DS[n]) throw new Error('missing export ' + n); return DS[n]; };
const cases = [
  ['code-enabled', h(pick('CodeDigitInput'), { value: '4' })],
  ['code-disabled', h(pick('CodeDigitInput'), { value: '4', disabled: true })],
  ['preset-enabled', h(pick('CalendarPresetItem'), { preset: { label: 'Last 7 days', getRange: (n) => ({ from: n, to: n }) }, onSelect: () => {} })],
  ['preset-disabled', h(pick('CalendarPresetItem'), { preset: { label: 'Last 7 days', getRange: (n) => ({ from: n, to: n }) }, onSelect: () => {}, disabled: true })],
  ['search-enabled', h(pick('SearchBox'), { placeholder: 'Search' })],
  ['search-disabled', h(pick('SearchBox'), { placeholder: 'Search', disabled: true })],
];
// DropdownTrigger needs a DropdownMenu root (Radix Trigger). Try to render inside DropdownMenu.
try {
  const Menu = pick('DropdownMenu');
  const DT = pick('DropdownTrigger');
  cases.push(['dt-enabled', h(Menu, null, h(DT, null, 'Choose'))]);
  cases.push(['dt-disabled', h(Menu, null, h(DT, { disabled: true }, 'Choose'))]);
} catch (e) { console.error('DropdownTrigger render skipped:', e.message); }
let body = '';
for (const [id, el] of cases) {
  let html;
  try { html = renderToStaticMarkup(el); } catch (e) { html = `<pre>ERR ${e.message}</pre>`; }
  console.log(`== ${id}\n${html}\n`);
  body += `<section id="${id}" style="margin:12px"><div class="probe">${html}</div></section>\n`;
}
const page = `<!doctype html><html class="light"><head><meta charset="utf-8"><link rel="stylesheet" href="file:///${B}/dist/styles.css"></head><body>${body}</body></html>`;
fs.writeFileSync(path.join(__dirname, 'disabled-probe.html'), page);
