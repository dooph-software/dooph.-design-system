import fs from 'node:fs';
const BS = String.fromCharCode(92);
const files = process.argv.slice(2);
const css = fs.readFileSync('docs/audit/_work/dist-styles.css','utf8');
const src = ['src/styles/index.css','src/styles/dooph-component-tokens.css'].map(f=>fs.readFileSync(f,'utf8')).join('\n');
const esc = c => c.replace(/[^a-zA-Z0-9_-]/g, m => BS + m);
const missing = new Set();
const re = /"([^"\n]*)"|'([^'\n]*)'/g;
for (const f of files) {
  const t = fs.readFileSync(f,'utf8');
  for (const m of t.matchAll(re)) {
    const s = m[1] ?? m[2];
    if (!/(flex|ds-|text-|bg-|border|rounded|h-|w-|gap-|size-|items-|selected:|hover:|transition|cursor|inset|opacity)/.test(s)) continue;
    for (const c of s.split(/\s+/)) {
      if (!c || c.length < 2 || /^[A-Z@.\/]/.test(c) || c.includes('(') && !c.includes('[')) continue;
      if (/^(ds-|text-style-)/.test(c)) { if (!src.includes('.' + c)) missing.add(f + ' :: ' + c + ' (pkg)'); continue; }
      if (!css.includes('.' + esc(c))) missing.add(f + ' :: ' + c);
    }
  }
}
console.log([...missing].join('\n') || 'none missing');
