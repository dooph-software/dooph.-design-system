// One-off: counts violations of written rules (contribution skill, agent-rules §6, doc-refresh) that the
// scoreboard did not measure as of 2026-10-07. Each candidate becomes a scoreboard metric once its count is
// confirmed real (no false positives). Usage (repo root): node docs/audit/_work/scratch/rule-gaps.mjs
import fs from 'node:fs';
import path from 'node:path';

const files = [];
const walk = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (/\.(tsx?|css)$/.test(e.name)) files.push(p.split(path.sep).join('/')); } };
walk('src');
const gen = (f) => f === 'src/styles/theme.css' || f === 'src/components/Icons/index.ts';
const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:"'`])\/\/.*$/gm, '$1');
const tsx = files.filter((f) => /\.tsx?$/.test(f) && !gen(f));
const comp = tsx.filter((f) => !/\.stories\.tsx$/.test(f));
const count = (list, re, filter = () => true) => { let n = 0; const where = []; for (const f of list) { const s = strip(fs.readFileSync(f, 'utf8')); for (const m of s.matchAll(re)) { if (!filter(m, s, f)) continue; n++; where.push(`${f.replace('src/components/', '')}:${s.slice(0, m.index).split('\n').length} ${m[0].slice(0, 60)}`); } } return { n, where }; };

const checks = [
  ['Hex colour literals in component code (#fff, #1a2b3c)', count(comp, /#[0-9a-fA-F]{3,8}\b(?![\w-])/g, (m, s) => !/&#/.test(s.slice(m.index - 1, m.index + 1)))],
  ['Tailwind default radii instead of DS radius tokens (rounded, rounded-md…)', count(tsx, /(?<![\w-])(?:[\w-]+:)*rounded(?:-(?:t|r|b|l|tl|tr|bl|br|s|e|ss|se|es|ee))?(?:-(?:xs|sm|md|lg|xl|2xl|3xl|4xl))?(?=["'`\s])/g)],
  ['Tailwind default shadows (shadow-sm, shadow-md, shadow-lg…)', count(tsx, /(?<![\w-])(?:[\w-]+:)*shadow-(?:xs|sm|md|lg|xl|2xl|inner)(?![\w-])/g)],
  ['Deprecated ElementRef (use ComponentRef)', count(comp, /\bElementRef\b/g)],
  ['forwardRef components without displayName', (() => { let n = 0; const where = []; for (const f of comp) { const s = strip(fs.readFileSync(f, 'utf8')); for (const m of s.matchAll(/(?:const|let)\s+(\w+)\s*=\s*forwardRef\b/g)) { const name = m[1]; if (!new RegExp(`\\b${name}\\.displayName\\s*=`).test(s) && !/forwardRef\(\s*function\s+\w+/.test(s.slice(m.index, m.index + 200))) { n++; where.push(`${f.replace('src/components/', '')} ${name}`); } } } return { n, where }; })()],
  ['Variant consts named *Types / *Type (rule: *Variant)', count(comp, /export const \w+Types?\s*=/g)],
  ['Size keys "default" / "small" (rule: standard / sm)', count(comp, /(?<![\w.])(?:default|small)\s*:\s*["'`]/g, (m, s, f) => /constants\.ts$/.test(f) || /cva\(/.test(s))],
  ['Tailwind variant on a DS package class (emits no rule): hover:ds-*, data-[…]:h-button…', count(tsx, /(?<![\w-])(?:[\w-]+|\[[^\]\s]+\]):(?:ds-[\w-]+|h-button[\w-]*|size-button[\w-]*|text-style-[\w-]+)/g)],
  ['var() in SVG geometry attributes (width/height/r/x/y/cx/cy)', count(tsx, /\b(?:width|height|r|rx|ry|x|y|cx|cy|x1|x2|y1|y2)=["'{][^"'}]*var\(--/g)],
  ['Runtime theme detection (matchMedia prefers-color-scheme / classList "dark")', count(comp, /prefers-color-scheme|classList\.(?:contains|toggle|add)\(\s*["']dark/g)],
  ['Hardcoded font families (font-family / fontFamily literal)', count(files.filter((f) => !gen(f) && !/tokens\.css$|Text\//.test(f)), /font-family:(?!\s*(?:var\(|inherit))[^;]+;|fontFamily:\s*["'`](?!var\()/g)],
];

for (const [name, r] of checks) {
  console.log(`${String(r.n).padStart(4)}  ${name}`);
  for (const w of r.where.slice(0, 6)) console.log(`        ${w}`);
  if (r.where.length > 6) console.log(`        … ${r.where.length - 6} more`);
}
