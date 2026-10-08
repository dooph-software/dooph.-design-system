// C1 prototype: the cn() config proposed in WI-C1 for F-014/F-055, run with the
// audit build copy's tailwind-merge 3.6.0 (read/execute only).
// Usage: node docs/audit/_work/scratch/C1/twm-proto.mjs
import { pathToFileURL } from 'node:url';
const B = 'C:/Users/stick/Github/dooph/dooph-ds-audit-build';
const { extendTailwindMerge, twMerge: stock } = await import(pathToFileURL(`${B}/node_modules/tailwind-merge/dist/bundle-mjs.mjs`).href);
const { buttonVariants, ButtonVariant } = await import(pathToFileURL(`${B}/dist/index.js`).href);

// What sync-theme.mjs would emit (names read from src/styles/theme.css @ b436647).
const DS_THEME = {
  text: ['label', 'body', 'hero-body', 'hero-button', 'mono', 'subheading', 'heading', 'title', 'hero', 'cta-standard', 'cta-big'],
  radius: ['slider-inner', 'tight', 'mini', 'normal', 'soft', 'checkbox', 'avatar', 'avatar-sm', 'calendar-day'],
  spacing: ['xxxs', 'xxs', 'xs', 'sm', 'rg', 'md', 'lg', 'xl', 'xxl', 'sticker-y'],
  shadow: ['button', 'button-secondary', 'button-hover', 'button-active', 'menu', 'standard', 'cta', 'focus-prominent', 'focus-primary', 'focus-danger'],
};

const twMerge = extendTailwindMerge({
  extend: {
    theme: DS_THEME,
    classGroups: {
      'text-style': [{ 'text-style': [() => true] }],
      h: [{ h: ['button', 'button-sm', 'tab-micro', 'slider-track'] }],
      size: [{ size: ['button', 'button-sm', 'button-micro', 'checkbox', 'code-digit', 'tab-micro'] }],
      'min-h': [{ 'min-h': ['button'] }],
      'min-w': [{ 'min-w': ['button'] }],
    },
  },
});

const bv = buttonVariants({ variant: ButtonVariant.primary });
const cases = [
  // [input, expected]
  [['text-style-hero-body', 'text-text'], 'text-style-hero-body text-text'],
  [['text-style-hero-button', 'text-text-secondary'], 'text-style-hero-button text-text-secondary'],
  ...['button', 'body', 'label', 'title', 'heading', 'subheading', 'hero', 'mono', 'hero-body', 'hero-button'].map((r) => [[`text-style-${r}`, 'text-primary-fg'], `text-style-${r} text-primary-fg`]),
  [['text-style-body', 'text-style-title'], 'text-style-title'],
  [['text-body', 'text-text'], 'text-body text-text'],
  [['text-label', 'text-body'], 'text-body'],
  [['text-sm', 'text-body'], 'text-body'],
  [['text-sm', 'text-primary-fg'], 'text-sm text-primary-fg'],
  [['rounded-tight', 'rounded-full'], 'rounded-full'],
  [['rounded-normal', 'rounded-soft'], 'rounded-soft'],
  [['rounded-md', 'rounded-full'], 'rounded-full'],
  [['px-3', 'px-md'], 'px-md'],
  [['p-md', 'p-4'], 'p-4'],
  [['gap-xs', 'gap-2'], 'gap-2'],
  [['h-button', 'h-8'], 'h-8'],
  [['size-button', 'size-8'], 'size-8'],
  [['min-h-button', 'min-h-0'], 'min-h-0'],
  [['shadow-button', 'shadow-none'], 'shadow-none'],
  [['shadow-button', 'shadow-primary'], 'shadow-button shadow-primary'],
  [['max-w-md', 'max-w-lg'], 'max-w-lg'],
  [['font-body', 'font-semibold'], 'font-body font-semibold'],
  [['bg-primary', 'bg-secondary'], 'bg-secondary'],
];
let fail = 0;
for (const [input, want] of cases) {
  const got = twMerge(...input);
  const ok = got === want;
  if (!ok) fail++;
  console.log(`${ok ? 'PASS' : 'FAIL'} ${JSON.stringify(input)} -> ${JSON.stringify(got)}${ok ? '' : ` (want ${JSON.stringify(want)}; stock: ${JSON.stringify(stock(...input))})`}`);
}
const merged = twMerge(bv, 'text-body');
const keep = merged.split(/\s+/).includes('text-primary-fg') && merged.endsWith('text-body');
if (!keep) fail++;
console.log(`${keep ? 'PASS' : 'FAIL'} buttonVariants(primary)+'text-body' keeps text-primary-fg -> ${JSON.stringify(merged)}`);
const merged2 = twMerge(bv, 'rounded-full');
const ok2 = !merged2.split(/\s+/).includes('rounded-tight') || !bv.includes('rounded-tight');
console.log(`INFO buttonVariants(primary)+'rounded-full' -> ${JSON.stringify(merged2)}`);
console.log(fail ? `FAILURES: ${fail}` : 'ALL PASS');
process.exitCode = fail ? 1 : 0;
