// Orchestrator follow-ups after wave D (items agents could not reach from their lanes).
// Each edit asserts its anchor occurs exactly once, then replaces it. Re-running is a no-op (checks the result first).
import fs from 'node:fs';
const edits = [
  // WI-119 (D3 report): one number→px helper
  ['src/components/AnimatedText/UnderlineLinkText.tsx',
    'const toLength = (value: string | number) =>\n  typeof value === "number" ? `${value}px` : value;\n',
    ''],
  ['src/components/AnimatedText/UnderlineLinkText.tsx', '{ "--ds-underline-thickness": toLength(thickness) }', '{ "--ds-underline-thickness": toPxLength(thickness) }'],
  ['src/components/AnimatedText/UnderlineLinkText.tsx', '{ "--ds-underline-offset": toLength(offset) }', '{ "--ds-underline-offset": toPxLength(offset) }'],
  // WI-027 (D3 report): import through the new folder indexes
  ['src/components/AIChat/AIContextGauge.tsx', '} from "../ProgressIndicator/ProgressIndicator";\nimport { ProgressIndicatorVariant } from "../ProgressIndicator/constants";', '  ProgressIndicatorVariant,\n} from "../ProgressIndicator";'],
  ['src/components/AIChat/ChatDivider.tsx', 'import { WavyDivider } from "../WavyDivider/WavyDivider";\nimport { WavyDividerVariant } from "../WavyDivider/constants";', 'import { WavyDivider, WavyDividerVariant } from "../WavyDivider";'],
  // WI-083 step 4 (D3 report): reasons at the purposeful wrappers
  ['src/components/AIChat/AIModelSelect.tsx', '    <span className="whitespace-nowrap text-text">{children}</span>',
    '    {/* Keeps the model name on one line in the primary text tone; the detail span below uses the ghost tone. */}\n    <span className="whitespace-nowrap text-text">{children}</span>'],
  ['src/components/AIChat/AIModelSelect.tsx', '    <span className="min-w-0 flex-1 truncate">{children}</span>',
    '    {/* min-w-0 + truncate lets a long model name ellipsize beside the swatch instead of widening the menu. */}\n    <span className="min-w-0 flex-1 truncate">{children}</span>'],
  ['src/components/Menu/DropdownMenu.tsx', '      />\n      <span className="flex flex-1 items-center gap-rg">{children}</span>',
    '      />\n      {/* flex-1 fills the row beside the leading checkbox, so the label takes the remaining width. */}\n      <span className="flex flex-1 items-center gap-rg">{children}</span>'],
  // D2 report: stale const name in a comment
  ['src/components/LoadingSpinner/spinnerGeometry.ts', 'the same technique `Fonts`/`IconSizes` use', 'the same technique `Fonts`/`IconSize` use'],
  // D1 report (WI-125 step 3): the comment names a helper that no longer exists
  ['src/components/DatePicker/DatePickerTrigger.tsx',
    '          // The ring uses ds-focus-ring-on-open, which carries the state in its\n          // own selector — a `data-[state=open]:ds-focus-ring` variant would\n          // silently emit no rule at all.',
    '          // The ring uses ds-focus-ring-on-open, which carries the open state in\n          // its own selector: a Tailwind state variant on a ds-* helper would\n          // silently emit no rule at all.'],
];
let applied = 0;
for (const [f, from, to] of edits) {
  let s = fs.readFileSync(f, 'utf8');
  if (to && s.includes(to) && !s.includes(from)) continue; // already applied
  const n = s.split(from).length - 1;
  if (n !== 1) throw new Error(`${f}: anchor found ${n}× — ${from.slice(0, 60)}`);
  s = s.replace(from, () => to);
  fs.writeFileSync(f, s);
  applied++;
}
// UnderlineLinkText needs the helper import
const U = 'src/components/AnimatedText/UnderlineLinkText.tsx';
let u = fs.readFileSync(U, 'utf8');
if (!u.includes('toPxLength } from "../../utils/length"')) {
  const lines = u.split('\n');
  const lastImport = lines.reduce((acc, l, i) => (/^import .* from /.test(l) ? i : acc), -1);
  lines.splice(lastImport + 1, 0, 'import { toPxLength } from "../../utils/length";');
  fs.writeFileSync(U, lines.join('\n'));
  applied++;
}
console.log('applied', applied);
