// WI-C4-21: render every state F-061 restyles into one probe page, so the computed
// colours/opacities can be compared before vs after.
// Usage: node state-render.cjs [buildRoot] [outFile]
//   buildRoot defaults to the audit build; outFile defaults to ./state-probe.html.
// Open the page in the Browser pane and run, in the JS tool:
//   [...document.querySelectorAll('[data-probe]')].map(el => ({ probe: el.dataset.probe,
//     ...Object.fromEntries(el.dataset.read.split(',').map(p => [p, getComputedStyle(el)[p]])) }))
// Each case tags the element whose OPENING TAG is matched by its anchor regex.
const { createRequire } = require('module');
const fs = require('fs');
const path = require('path');
const B = process.argv[2] || 'C:/Users/stick/Github/dooph/dooph-ds-audit-build';
const out = process.argv[3] || path.join(__dirname, 'state-probe.html');
const req = createRequire(B + '/package.json');
const React = req('react');
const { renderToStaticMarkup } = req('react-dom/server');
const DS = req(B + '/dist/index.cjs');
const h = React.createElement;
const noop = () => {};

const today = new Date(2026, 5, 10);
const preset = { label: 'Last 7 days', getRange: (now) => ({ from: new Date(now.getTime() - 6 * 864e5), to: now }) };
// June 2026: the grid starts on Sun May 31 (outside the month). Range May 31 → Jun 3,
// so May 31 is an OUTSIDE ENDPOINT, Jun 1-2 are the band, Jul 1+ are outside non-endpoints.
const grid = h(DS.CalendarGrid, {
  viewMonth: new Date(2026, 5, 1),
  selectedRange: { from: new Date(2026, 4, 31), to: new Date(2026, 5, 3) },
  previewedRange: null,
  today,
  focusedDay: today,
  onDayClick: noop, onDayHover: noop, onDayHoverEnd: noop, onDayKeyDown: noop, dayRef: noop,
});

const cases = [
  ['digit-normal', h(DS.CodeDigitInput, { value: '4', readOnly: true }), /<div/, 'borderTopColor,color'],
  ['digit-error', h(DS.CodeDigitInput, { value: '4', hasError: true, readOnly: true }), /<div/, 'borderTopColor,color'],
  ['digit-error-disabled', h(DS.CodeDigitInput, { value: '4', hasError: true, disabled: true, readOnly: true }), /<div/, 'borderTopColor,color,backgroundColor'],
  ['digit-glyph-filled-error', h(DS.CodeDigitInput, { value: '4', hasError: true, readOnly: true }), /<span/, 'opacity,color'],
  ['digit-glyph-empty', h(DS.CodeDigitInput, { value: '', readOnly: true }), /<span/, 'opacity,color'],
  ['preset-active', h(DS.CalendarPresetItem, { preset, selected: preset.getRange(today), today, onSelect: noop }), /<button/, 'backgroundColor'],
  ['preset-inactive', h(DS.CalendarPresetItem, { preset, selected: null, today, onSelect: noop }), /<button/, 'backgroundColor'],
  ['grid-band-tile', grid, /<div role="gridcell"[^>]*data-range="middle"/, 'backgroundColor'],
  ['grid-none-tile', grid, /<div role="gridcell"[^>]*data-range="none"/, 'backgroundColor'],
  ['grid-outside-endpoint-label', grid, /<button[^>]*aria-label="Sunday, May 31, 2026"/, 'color'],
  ['grid-outside-label', grid, /<button[^>]*aria-label="Wednesday, July 1, 2026"/, 'color'],
  ['grid-inside-label', grid, /<button[^>]*aria-label="Wednesday, June 10, 2026"/, 'color'],
  ['hotkey-rest', h(DS.HotkeyIndicator, { keys: ['K'] }), /<kbd/, 'backgroundColor,borderTopColor'],
  ['hotkey-pressed', h(DS.HotkeyIndicator, { keys: ['K'], pressed: true }), /<kbd/, 'backgroundColor,borderTopColor'],
  ['tool-error-label', h(DS.AIToolPart, { state: 'error' }, 'Reading file'), /<span/, 'color'],
  ['tool-complete-label', h(DS.AIToolPart, { state: 'complete' }, 'Reading file'), /<span/, 'color'],
];

let body = '';
const missing = [];
for (const [id, el, anchor, read] of cases) {
  let html;
  try {
    html = renderToStaticMarkup(el);
  } catch (e) {
    html = `<p>ERR ${e.message}</p>`;
  }
  const m = anchor.exec(html);
  if (!m) {
    missing.push(id);
  } else {
    const tagEnd = m.index + m[0].match(/^<[a-z]+/)[0].length;
    html = html.slice(0, tagEnd) + ` data-probe="${id}" data-read="${read}"` + html.slice(tagEnd);
  }
  body += `<section>${html}</section>\n`;
}
const css = fs.readFileSync(B + '/dist/styles.css', 'utf8');
fs.writeFileSync(
  out,
  `<!doctype html><html class="light"><head><meta charset="utf-8"><title>state probe</title><style>${css}</style></head><body>${body}</body></html>`,
);
console.log('wrote', out);
console.log('tagged:', cases.length - missing.length, 'missing:', missing.join(', ') || '(none)');
