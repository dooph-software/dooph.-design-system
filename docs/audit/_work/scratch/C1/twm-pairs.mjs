// C1: which class pairs used together inside one src file would merge differently
// under the proposed cn() config (F-014/F-055)? Over-approximation: every pair of
// class tokens appearing in string literals of the same non-story file.
// Usage: node docs/audit/_work/scratch/C1/twm-pairs.mjs   (run from repo root)
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const B = 'C:/Users/stick/Github/dooph/dooph-ds-audit-build';
const { extendTailwindMerge } = await import(pathToFileURL(`${B}/node_modules/tailwind-merge/dist/bundle-mjs.mjs`).href);
const OLD = extendTailwindMerge({ extend: { classGroups: { 'text-style': ['text-style-button','text-style-body','text-style-label','text-style-title','text-style-heading','text-style-subheading','text-style-hero','text-style-mono'] } } });
const NEW = extendTailwindMerge({
  extend: {
    theme: {
      text: ['label','body','hero-body','hero-button','mono','subheading','heading','title','hero','cta-standard','cta-big'],
      radius: ['slider-inner','tight','mini','normal','soft','checkbox','avatar','avatar-sm','calendar-day'],
      spacing: ['xxxs','xxs','xs','sm','rg','md','lg','xl','xxl','sticker-y'],
      shadow: ['button','button-secondary','button-hover','button-active','menu','standard','cta','focus-prominent','focus-primary','focus-danger'],
    },
    classGroups: {
      'text-style': [{ 'text-style': [() => true] }],
      h: [{ h: ['button','button-sm','tab-micro','slider-track'] }],
      size: [{ size: ['button','button-sm','button-micro','checkbox','code-digit','tab-micro'] }],
      'min-h': [{ 'min-h': ['button'] }],
      'min-w': [{ 'min-w': ['button'] }],
    },
  },
});
const files = [];
(function walk(d) { for (const e of readdirSync(d)) { const f = path.join(d, e); if (statSync(f).isDirectory()) walk(f); else if (/\.tsx?$/.test(e) && !/\.stories\.|\.test\./.test(e)) files.push(f); } })('src');
let total = 0;
for (const f of files) {
  const src = readFileSync(f, 'utf8');
  const toks = new Set();
  for (const m of src.matchAll(/(["'`])((?:(?!\1)[^\\\n]|\\.)*)\1/g)) for (const t of m[2].split(/\s+/)) if (/^[a-z!\[&][\w\-:\[\]&().,=%>*_/!]*$/.test(t) && t.includes('-')) toks.add(t);
  const arr = [...toks];
  const hits = [];
  for (let i = 0; i < arr.length; i++) for (let j = 0; j < arr.length; j++) {
    if (i === j) continue;
    const a = arr[i], b = arr[j];
    if (OLD(a, b) !== NEW(a, b)) hits.push(`${a} + ${b}: old=${JSON.stringify(OLD(a, b))} new=${JSON.stringify(NEW(a, b))}`);
  }
  if (hits.length) { total += hits.length; console.log(`\n${f}`); for (const h of hits) console.log('  ' + h); }
}
console.log(`\npairs that merge differently: ${total}`);
