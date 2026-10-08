// F-014/F-055 check against a built dist: the package cn keeps every text-style
// role beside a colour, and DS theme-scale classes conflict with their stock
// counterparts. Usage: node docs/audit/_work/scratch/C1/cn-verify.mjs <path-to>/dist
import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const dist = path.resolve(process.argv[2]);
const pkg = await import(pathToFileURL(path.join(dist, 'index.js')).href);
const require = createRequire(path.join(dist, 'index.js'));
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { cn, buttonVariants, ButtonVariant } = pkg;
const ROLES = ['button', 'body', 'label', 'title', 'heading', 'subheading', 'hero', 'mono', 'hero-body', 'hero-button'];
const cases = [
  ...ROLES.map((r) => [[`text-style-${r}`, 'text-text'], `text-style-${r} text-text`]),
  [['text-style-body', 'text-style-title'], 'text-style-title'],
  [['text-body', 'text-text'], 'text-body text-text'],
  [['text-label', 'text-body'], 'text-body'],
  [['rounded-tight', 'rounded-full'], 'rounded-full'],
  [['rounded-normal', 'rounded-soft'], 'rounded-soft'],
  [['px-3', 'px-md'], 'px-md'],
  [['gap-xs', 'gap-2'], 'gap-2'],
  [['h-button', 'h-8'], 'h-8'],
  [['size-button', 'size-8'], 'size-8'],
  [['shadow-button', 'shadow-none'], 'shadow-none'],
  [['shadow-button', 'shadow-primary'], 'shadow-button shadow-primary'],
  [['text-sm', 'text-primary-fg'], 'text-sm text-primary-fg'],
];
let fail = 0;
for (const [input, want] of cases) {
  const got = cn(...input);
  if (got !== want) fail++;
  console.log(`${got === want ? 'PASS' : 'FAIL'} cn(${input.map((s) => JSON.stringify(s)).join(', ')}) -> ${JSON.stringify(got)}${got === want ? '' : `  (want ${JSON.stringify(want)})`}`);
}
const merged = cn(buttonVariants({ variant: ButtonVariant.primary }), 'text-body').split(/\s+/);
const keep = merged.includes('text-primary-fg') && merged.includes('text-body');
if (!keep) fail++;
console.log(`${keep ? 'PASS' : 'FAIL'} cn(buttonVariants({variant: primary}), 'text-body') keeps text-primary-fg`);
for (const name of ['HeroBodyText', 'HeroButtonText', 'SubheadingText', 'MonoText', 'BodyText']) {
  const html = renderToStaticMarkup(React.createElement(pkg[name], { className: 'text-text-secondary' }, 'x'));
  const ok = /class="text-style-[a-z-]+ text-text-secondary"/.test(html);
  if (!ok) fail++;
  console.log(`${ok ? 'PASS' : 'FAIL'} <${name} className="text-text-secondary"> -> ${html}`);
}
if ('DS_TW_MERGE_CONFIG' in pkg) console.log('INFO DS_TW_MERGE_CONFIG exported');
else { fail++; console.log('FAIL DS_TW_MERGE_CONFIG not exported'); }
console.log(fail ? `FAILURES: ${fail}` : 'ALL PASS');
process.exitCode = fail ? 1 : 0;
