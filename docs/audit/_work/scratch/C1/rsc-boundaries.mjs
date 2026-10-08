// F-027 check under V1's RSC approximation: which root exports are client
// references, and do the public helpers return values when called from server code?
// Usage: NODE_ENV=production node --conditions=react-server \
//   --import <main>/docs/audit/_work/scratch/V1/rsc-register2.mjs \
//   <main>/docs/audit/_work/scratch/C1/rsc-boundaries.mjs <path-to>/dist
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const dist = path.resolve(process.argv[2]);
let pkg;
try { pkg = await import(pathToFileURL(path.join(dist, 'index.js')).href); }
catch (e) { console.log('root import FAIL', e.constructor.name + ': ' + String(e.message).split('\n')[0], '(apply WI-C1-01 first)'); process.exit(1); }
const isRef = (v) => v?.$$typeof === Symbol.for('react.client.reference');
const SHOULD_BE_NEUTRAL = ['Button', 'Checkbox', 'ShapeButton', 'CodeDigitInput', 'ModalContent', 'PopoverContent', 'SheetContent', 'TooltipContent', 'TabsTrigger', 'SearchBox', 'SplitButton', 'LinearProgressIndicator', 'DatePickerTrigger'];
const SHOULD_BE_CLIENT = ['AIThinkingEffortSelector', 'AIModelSelectTrigger', 'CalendarCaption', 'CalendarGrid', 'CalendarPresetItem', 'DatePickerSplitTrigger', 'Input', 'Toggle', 'ToggleSwitch'].filter((n) => n in pkg);
let fail = 0;
for (const n of SHOULD_BE_NEUTRAL) { const ok = n in pkg && !isRef(pkg[n]); if (!ok) fail++; console.log(`${ok ? 'PASS' : 'FAIL'} ${n}: ${isRef(pkg[n]) ? 'client reference' : 'neutral'} (want neutral)`); }
for (const n of SHOULD_BE_CLIENT) { const ok = isRef(pkg[n]); if (!ok) fail++; console.log(`${ok ? 'PASS' : 'FAIL'} ${n}: ${ok ? 'client reference' : 'neutral'} (want client)`); }
const calls = [
  ['tabTriggerVariants', () => pkg.tabTriggerVariants({})],
  ['buttonVariants', () => pkg.buttonVariants({})],
  ['checkboxVariants', () => pkg.checkboxVariants({})],
  ['formatTriggerLabel', () => pkg.formatTriggerLabel({ mode: pkg.DatePickerMode.singleDay, value: new Date(2026, 8, 30) }, new Date(2026, 8, 30), 'en-US')],
];
for (const [n, f] of calls) {
  if (!(n in pkg)) { console.log(`SKIP ${n}: not exported (D-15 removed it)`); continue; }
  try { const r = f(); const ok = typeof r === 'string'; if (!ok) fail++; console.log(`${ok ? 'PASS' : 'FAIL'} ${n}() -> ${JSON.stringify(r).slice(0, 60)}`); }
  catch (e) { fail++; console.log(`FAIL ${n}() threw ${e.constructor.name}: ${String(e.message).split('\n')[0]}`); }
}
console.log(fail ? `FAILURES: ${fail}` : 'ALL PASS');
process.exitCode = fail ? 1 : 0;
