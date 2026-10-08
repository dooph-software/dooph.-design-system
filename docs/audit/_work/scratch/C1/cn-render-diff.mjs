// SSR every exported component (x each matching variant/size/shape const value)
// from the audit build with the cn chunk swapped by cn-hook.mjs; print every
// internal cn() call whose result the proposed config would change.
// Usage (repo root): node --import ./docs/audit/_work/scratch/C1/cn-register.mjs docs/audit/_work/scratch/C1/cn-render-diff.mjs
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
const B = 'C:/Users/stick/Github/dooph/dooph-ds-audit-build';
const require = createRequire(`${B}/dist/index.js`);
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const pkg = await import(pathToFileURL(`${B}/dist/index.js`).href);
const h = React.createElement;

const isComp = (v) => typeof v === 'function' ? /^[A-Z]/.test(v.name || 'X') : !!(v && typeof v === 'object' && v.$$typeof && (v.render || v.type));
const isConst = (v) => v && typeof v === 'object' && !v.$$typeof && !Array.isArray(v) && Object.values(v).length > 0 && Object.values(v).every((x) => typeof x === 'string');
const comps = Object.entries(pkg).filter(([n, v]) => isComp(v) && /^[A-Z]/.test(n));
const consts = Object.entries(pkg).filter(([n, v]) => /^[A-Z]/.test(n) && isConst(v));
const wrap = (el) => {
  let out = el;
  if (pkg.TooltipProvider) out = h(pkg.TooltipProvider, null, out);
  if (pkg.ToastProvider) out = h(pkg.ToastProvider, null, out);
  return out;
};
const BASE = { labels: { start: 'a', end: 'b' }, children: 'x', value: '1', text: 'x', label: 'x', title: 'x', steps: [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }], onValueChange() {}, onSelect() {}, onChange() {}, mode: 'autoplay', shapes: [pkg.CookieShape, pkg.PuffShape], icon: h('span'), progress: 0.5, items: [], length: 4, digits: '12', changeKey: 1 };
let renders = 0, errors = 0;
function tryRender(ctx, C, props) {
  globalThis.__cnCtx = ctx;
  try { renderToStaticMarkup(wrap(h(C, { ...BASE, ...props }))); renders++; } catch { errors++; }
}
for (const [name, C] of comps) {
  tryRender(name, C, {});
  for (const [k, obj] of consts) {
    const family = k.replace(/(Variants?|Sizes?|Types|Side|Shapes?|s)$/, '');
    if (!name.startsWith(family) && !k.startsWith(name)) continue;
    const prop = /Size/.test(k) ? 'size' : /ShapeButtons/.test(k) ? 'shape' : /Side/.test(k) ? 'side' : /(Variant|Types)/.test(k) ? 'variant' : null;
    if (!prop) continue;
    for (const v of Object.values(obj)) tryRender(`${name} ${prop}=${v}`, C, { [prop]: v, color: v === 'custom' ? 'red' : undefined });
  }
}
// A few compositions whose parts only render inside their root.
const P = pkg;
const extra = [
  ['DropdownMenu open', () => h(P.DropdownMenu, { open: true }, h(P.DropdownMenuTrigger, { asChild: true }, h(P.DropdownTrigger, null, 'x')), h(P.DropdownMenuContent, { portal: false }, h(P.DropdownMenuSection, null, h(P.DropdownMenuItem, null, 'a'), h(P.DropdownMenuMultiSelectItem, { checked: true }, 'b'), h(P.DropdownMenuRadioGroup, { value: 'a' }, h(P.DropdownMenuRadioSelectItem, { value: 'a' }, 'a')))))],
  ['Tooltip open', () => h(P.Tooltip, { open: true }, h(P.TooltipTrigger, null, 'x'), h(P.TooltipContent, { portal: false }, 'tip'))],
  ['Tabs', () => h(P.Tabs, { defaultValue: 'a' }, h(P.TabsList, null, h(P.TabsTrigger, { value: 'a' }, 'A')), h(P.TabsContent, { value: 'a' }, 'c'))],
  ['Table', () => h(P.Table, { columns: '1fr 1fr' }, h(P.TableHeader, null, h(P.TableHeaderCell, null, 'h'), h(P.TableHeaderCell, { sortable: true, sortDirection: 'asc', onSort() {} }, 's')), h(P.TableRow, null, h(P.TableCell, null, 'c')))],
  ['Calendar', () => h(P.Calendar, { mode: P.DatePickerMode.singleDay, selected: new Date(2026, 8, 30), onSelect() {} })],
  ['Calendar range', () => h(P.Calendar, { mode: P.DatePickerMode.dateRange, selected: { from: new Date(2026, 8, 3), to: new Date(2026, 8, 9) }, onSelect() {}, presets: [{ label: 'Week', range: { from: new Date(2026, 8, 3), to: new Date(2026, 8, 9) } }] })],
  ['DatePicker', () => h(P.DatePicker, { mode: P.DatePickerMode.singleDay, selected: new Date(2026, 8, 30), onSelect() {}, open: true })],
  ['DatePicker range', () => h(P.DatePicker, { mode: P.DatePickerMode.dateRange, selected: { from: new Date(2026, 8, 3), to: new Date(2026, 8, 9) }, onSelect() {} })],
  ['SplitButton', () => h(P.SplitButton, null, h(P.SplitButtonAction, null, 'a'), h(P.SplitButtonTrigger, null))],
  ['Toast', () => h(P.ToastProvider, null, h(P.ToastRoot, { open: true }, h(P.ToastTitle, null, 't'), h(P.ToastClose, null)), h(P.ToastViewport))],
  ['AIPromptInput', () => h(P.AIPromptInput, { defaultValue: 'hi' }, h(P.AIPromptInputTextarea), h(P.AIPromptInputToolbar, null, h(P.AIPromptInputToolbarEnd, null, h(P.AIPromptInputSubmit))))],
  ['AIThinkingEffortSelector', () => h(P.AIThinkingEffortSelector, { steps: [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }], value: 'a', onValueChange() {}, label: 'Thinking', labels: { start: 'Faster', end: 'Smarter' } })],
];
for (const [ctx, make] of extra) { globalThis.__cnCtx = ctx; try { renderToStaticMarkup(wrap(make())); renders++; } catch (e) { errors++; console.log(`render error in ${ctx}: ${String(e.message).split('\n')[0]}`); } }
console.log(`renders ok: ${renders}, render errors (skipped): ${errors}`);
const diffs = [...(globalThis.__cnDiffs ?? new Map()).entries()];
console.log(`internal cn() calls that the proposed config changes: ${diffs.length}`);
for (const [k, n] of diffs) console.log(`  ${k}  (x${n})`);
