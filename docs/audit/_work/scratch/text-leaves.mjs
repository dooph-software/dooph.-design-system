// Lists host elements (span, p, div, label, …) that directly render text, outside src/components/Text/.
// A "text leaf" is an element whose children hold a text literal or a {expression} and no nested element.
// Maintainer rule: text is always rendered by a Text component (ButtonText, BodyText, … or BaseText), never
// by a host element carrying typography classes. This finds candidates; scoreboard.mjs counts the hard rule.
// Usage (repo root): node docs/audit/_work/scratch/text-leaves.mjs [--components]
import fs from 'node:fs';
import path from 'node:path';

const files = [];
const walk = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (/\.tsx$/.test(e.name)) files.push(p.split(path.sep).join('/')); } };
walk('src');
const tags = 'span|p|div|label|h[1-6]|strong|em|small|a|li|td|th|dt|dd|code|pre';
const attr = String.raw`(?:[^>"'{}]|"[^"]*"|'[^']*'|\{(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*\})*`;
const re = new RegExp(String.raw`<(${tags})\b(${attr})>([^<]*)</\1>`, 'g');
const onlyComponents = process.argv.includes('--components');
for (const f of files) {
  if (f.startsWith('src/components/Text/')) continue;
  const story = /\.stories\.tsx$/.test(f);
  if (onlyComponents && story) continue;
  const s = fs.readFileSync(f, 'utf8');
  for (const m of s.matchAll(re)) {
    const inner = m[3];
    const t = inner.trim();
    if (!t || /^\{\/\*[\s\S]*\*\/\}$/.test(t)) continue;
    const line = s.slice(0, m.index).split('\n').length;
    const cls = (m[2].match(/className=("[^"]*"|\{[\s\S]*?\}(?=\s|$))/) || ['', ''])[1].replace(/\s+/g, ' ').slice(0, 80);
    console.log(`${story ? 'S' : 'C'} ${f}:${line} <${m[1]}> ${cls} :: ${t.replace(/\s+/g, ' ').slice(0, 40)}`);
  }
}
