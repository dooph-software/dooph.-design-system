// V5: literal timing values in src/styles/*.css, comment-stripped, outside @theme/token declarations.
const fs = require('fs');
const path = require('path');
const dir = path.resolve(__dirname, '../../../../../src/styles');
for (const f of ['index.css', 'dooph-component-tokens.css', 'tokens.css', 'theme.css']) {
  const raw = fs.readFileSync(path.join(dir, f), 'utf8');
  const src = raw.replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '));
  const lines = src.split('\n');
  lines.forEach((ln, i) => {
    if (/^\s*--/.test(ln)) return; // custom property declarations = token definitions
    const hits = [...ln.matchAll(/(?<![\w-])(\d*\.?\d+m?s)(?![\w-])|cubic-bezier\([^)]*\)|(?<![\w-])(ease-in-out|ease-in|ease-out|ease|linear)(?![\w-])/g)].map(m => m[0]);
    if (hits.length && /(transition|animation)/.test(ln)) console.log(`${f}:${i + 1}  [${hits.join(' | ')}]  ${ln.trim().slice(0, 150)}`);
  });
}
