// Spaghetti scoreboard: counts the audit's measurable inconsistencies in src/ at the current working tree.
// Each number should only go DOWN over the remediation (or hit its stated target). A number that goes up means
// new work re-introduced a pattern the audit is removing, so stop and look.
// Usage (repo root): node docs/audit/_work/scratch/scoreboard.mjs [--record "note"]
//   --record appends a dated row to docs/audit/scoreboard.md.
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const files = [];
const walk = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (/\.(tsx?|css)$/.test(e.name)) files.push(p.split(path.sep).join('/')); } };
walk('src');
const isStory = (f) => /\.stories\.tsx?$/.test(f);
const isGenerated = (f) => f === 'src/styles/theme.css' || f === 'src/components/Icons/index.ts';
const code = files.filter((f) => !isStory(f) && !isGenerated(f));
const read = (f) => fs.readFileSync(f, 'utf8').replace(/__GENERATED_THEME_START__[\s\S]*?__GENERATED_THEME_END__/, '');
const count = (list, re, skip = () => false) => { let n = 0; const where = {}; for (const f of list) { if (skip(f)) continue; const m = read(f).match(re); if (m) { n += m.length; where[f] = m.length; } } return { n, where }; };

const metrics = [
  // [plain-English name, target, result]
  ['Motion timing hardcoded (duration-N, ease-*, cubic-bezier, Nms) outside tokens.css', 0,
    count(code, /(?<![\w-])(?:[\w-]+:)*duration-\d+\b|(?<![\w-])(?:[\w-]+:)*ease-(?:in|out|in-out|linear)\b|cubic-bezier\(|(?<![\w-])\d+ms\b/g, (f) => f === 'src/styles/tokens.css')],
  ['Arbitrary px/rem values in classNames ([13px])', 0,
    count(code.filter((f) => /\.tsx?$/.test(f)), /-\[-?[0-9.]+(?:px|rem)\]/g)],
  // Zero resets (p-0, m-0) are not spacing values and have no DS token, so they are not counted (2026-10-04).
  ['Tailwind numeric spacing instead of the DS scale (p-2, gap-4…)', 0,
    count(code.filter((f) => /\.tsx?$/.test(f)), /(?<![\w-])-?(?:p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml|gap|gap-x|gap-y|space-x|space-y)-(?!0(?![\d.]))\d+(?:\.5)?(?![\w-])/g)],
  ['Raw var(--ui-*) inside className brackets', 0,
    count(code.filter((f) => /\.tsx?$/.test(f)), /\[[^\]\s"'`]*var\(--ui-/g)],
  ['Hand-rolled focus rings (shadow-focus / ring utilities)', 0,
    count(code.filter((f) => /\.tsx?$/.test(f)), /shadow-focus|focus-visible:ring|focus:ring/g)],
  ['Hand-rolled disabled looks (disabled:opacity, opacity-50, disabled:cursor)', 0,
    // `disabled:opacity-100` cancels a double fade on a nested control; it is a reset, not a disabled look (2026-10-04).
    count(code.filter((f) => /\.tsx?$/.test(f)), /disabled:opacity-(?!100\b)|(?<![\w-])opacity-50(?![\w-])|disabled:cursor/g)],
  ['"use client" files (keep as few as possible)', null,
    count(code.filter((f) => /\.tsx?$/.test(f)), /^["']use client["'];?/m)],
  ['JS timers/animation loops in components (rAF, setTimeout, setInterval)', null,
    count(code.filter((f) => /\.tsx?$/.test(f)), /\b(?:requestAnimationFrame|setTimeout|setInterval)\(/g)],
  ['Value callbacks not named onValueChange (onChange(value)/onSelect)', 0,
    count(code.filter((f) => /\.tsx?$/.test(f)), /\bon(?:Change|Select)\??:\s*\((?:value|date|range|code|v)\b/g)],
  ['Vestigial default exports in component modules', 0,
    count(code.filter((f) => /\.tsx?$/.test(f)), /^export default /gm)],
];

const R = fs.existsSync('docs/audit/REMEDIATION.md') ? fs.readFileSync('docs/audit/REMEDIATION.md', 'utf8') : '';
const statuses = {};
for (const m of R.matchAll(/^\| WI-\d{3} \| .*? \| P\d \| ([^|]+?) \|/gm)) { const s = m[1].replace(/\(.*$/, '').trim(); statuses[s] = (statuses[s] || 0) + 1; }

let head = '?'; let dirty = '';
try { head = execSync('git rev-parse --short HEAD').toString().trim(); dirty = execSync('git status --porcelain').toString().trim() ? '+dirty' : ''; } catch {}

console.log(`Spaghetti scoreboard @ ${head}${dirty}\n`);
for (const [name, target, r] of metrics) {
  const top = Object.entries(r.where).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([f, n]) => `${f.replace('src/components/', '')} ${n}`).join(', ');
  console.log(`${String(r.n).padStart(5)}  ${name}${target === null ? '' : `  (target ${target})`}${top ? `\n       worst: ${top}` : ''}`);
}
console.log(`\nPlan: ${Object.entries(statuses).map(([k, v]) => `${k} ${v}`).join(' · ')}`);

// Expression system guard (expression-check.mjs, next to this file): one PASS/FAIL line.
{
  let out;
  try { out = execSync('node docs/audit/_work/scratch/expression-check.mjs').toString(); }
  catch (e) { out = (e.stdout || '').toString() || 'FAIL expression-check: could not run'; }
  console.log(out.split('\n')[0]);
}

const i = process.argv.indexOf('--record');
if (i > 0) {
  const note = process.argv[i + 1] || '';
  const file = 'docs/audit/scoreboard.md';
  if (!fs.existsSync(file)) {
    const hdr = ['date', 'HEAD', ...metrics.map((_, k) => `m${k + 1}`), 'note'];
    fs.writeFileSync(file, `# Spaghetti scoreboard history\n\nProduced by \`docs/audit/_work/scratch/scoreboard.mjs --record\`. Every number should only go down.\n\n${metrics.map(([n, t], k) => `- **m${k + 1}** — ${n}${t === null ? ' (minimise)' : ` (target ${t})`}`).join('\n')}\n\n| ${hdr.join(' | ')} |\n|${hdr.map(() => '---').join('|')}|\n`);
  }
  const date = new Date().toISOString().slice(0, 10);
  fs.appendFileSync(file, `| ${date} | ${head}${dirty} | ${metrics.map(([, , r]) => r.n).join(' | ')} | ${note} |\n`);
  console.log(`recorded → ${file}`);
}
