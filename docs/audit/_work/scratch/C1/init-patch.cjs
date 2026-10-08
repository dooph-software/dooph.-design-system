// Builds a patched copy of bin/init.mjs (WI-C1-07 step 2) under scratch/C1/initt/.
const fs = require('fs');
const path = require('path');
const repo = path.resolve(__dirname, '../../../../..');
let s = fs.readFileSync(path.join(repo, 'bin/init.mjs'), 'utf8');
const a = [
  'const rl = createInterface({ input: process.stdin, output: process.stdout });',
  'const ask = (q) =>',
  '  new Promise((res) => rl.question(q, (ans) => res(ans.trim())));',
].join('\n');
const b = fs.readFileSync(path.join(__dirname, 'init-ask.js.txt'), 'utf8').trimEnd();
if (!s.includes(a)) throw new Error('anchor not found');
fs.mkdirSync(path.join(__dirname, 'initt/bin'), { recursive: true });
fs.writeFileSync(path.join(__dirname, 'initt/bin/init.mjs'), s.replace(a, () => b));
console.log('patched');
