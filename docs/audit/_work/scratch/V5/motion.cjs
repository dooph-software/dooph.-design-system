// V5 independent motion tally. Strips // and /* */ comments (naive but string-aware enough for class strings).
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '../../../../../src');
function walk(d, out = []) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(ts|tsx)$/.test(e.name) && !/\.stories\./.test(e.name) && !/\.test\./.test(e.name)) out.push(p);
  }
  return out;
}
function stripComments(src) {
  // remove block comments and line comments not inside strings (approximate: line comments only when preceded by whitespace or line start)
  let out = '';
  let i = 0, inStr = null;
  while (i < src.length) {
    const c = src[i], n = src[i + 1];
    if (inStr) {
      out += c;
      if (c === '\\') { out += n; i += 2; continue; }
      if (c === inStr) inStr = null;
      i++; continue;
    }
    if (c === '"' || c === "'" || c === '`') { inStr = c; out += c; i++; continue; }
    if (c === '/' && n === '*') { const j = src.indexOf('*/', i + 2); const chunk = src.slice(i, j + 2); out += chunk.replace(/[^\n]/g, ' '); i = j + 2; continue; }
    if (c === '/' && n === '/') { const j = src.indexOf('\n', i); const end = j < 0 ? src.length : j; out += ' '.repeat(end - i); i = end; continue; }
    out += c; i++;
  }
  return out;
}
const files = walk(root);
const res = { durAll: [], durReduce: [], dur: [], ease: [], arbEase: [], inline: [], delay: [] };
for (const f of files) {
  const rel = path.relative(path.resolve(root, '..'), f).replace(/\\/g, '/');
  const lines = stripComments(fs.readFileSync(f, 'utf8')).split('\n');
  lines.forEach((ln, idx) => {
    const loc = `${rel}:${idx + 1}`;
    for (const m of ln.matchAll(/(?<![\w-])((?:[\w\[\]=&:()!.-]+:)*)duration-(\d+|\[[^\]]+\])/g)) {
      const tok = m[0];
      res.durAll.push(`${loc}  ${tok}`);
      if (/motion-reduce:/.test(m[1]) && /duration-0\b/.test(tok)) res.durReduce.push(`${loc}  ${tok}`);
      else res.dur.push(`${loc}  ${tok}`);
    }
    for (const m of ln.matchAll(/(?<![\w-])((?:[\w\[\]=&:()!.-]+:)*)ease-(in-out|in|out|linear|\[[^\]]+\])(?![\w-])/g)) res.ease.push(`${loc}  ${m[0]}`);
    for (const m of ln.matchAll(/\[animation-timing-function:[^\]]+\]|\[transition-timing-function:[^\]]+\]/g)) res.arbEase.push(`${loc}  ${m[0]}`);
    for (const m of ln.matchAll(/(?<![\w-])delay-\d+/g)) res.delay.push(`${loc}  ${m[0]}`);
    if (/(transition|animation)\s*[:=]/.test(ln) && /\d+(ms|s)\b/.test(ln)) res.inline.push(`${loc}  ${ln.trim().slice(0, 140)}`);
    if (/\b\d+(\.\d+)?m?s\s+(ease|linear|cubic)/.test(ln) && !/(transition|animation)\s*[:=]/.test(ln)) res.inline.push(`${loc} (bare) ${ln.trim().slice(0, 140)}`);
  });
}
const durFiles = new Set(res.dur.map(s => s.split(':')[0]));
console.log('files scanned', files.length);
console.log('duration-N total', res.durAll.length, 'reduce carve-outs', res.durReduce.length, 'hardcoded', res.dur.length, 'in files', durFiles.size);
console.log([...durFiles].join('\n'));
console.log('--- hardcoded durations'); console.log(res.dur.join('\n'));
console.log('--- reduce'); console.log(res.durReduce.join('\n'));
console.log('--- ease utilities', res.ease.length); console.log(res.ease.join('\n'));
console.log('--- arbitrary timing fns', res.arbEase.length); console.log(res.arbEase.join('\n'));
console.log('--- delay', res.delay.length); console.log(res.delay.join('\n'));
console.log('--- inline-ish motion strings', res.inline.length); console.log(res.inline.join('\n'));
