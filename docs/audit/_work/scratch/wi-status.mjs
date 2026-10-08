// Set a work item's status (board row + block) and append a dated log line.
// Usage (repo root): node docs/audit/_work/scratch/wi-status.mjs WI-058 review "log text" [WI-064 review "log" ...]
import fs from 'node:fs';
const f = 'docs/audit/REMEDIATION.md';
const lines = fs.readFileSync(f, 'utf8').split('\n');
const date = new Date().toISOString().slice(0, 10);
const args = process.argv.slice(2);
if (args.length % 3) { console.error('args must be triples: WI-NNN status "log"'); process.exit(1); }
for (let a = 0; a < args.length; a += 3) {
  const [id, status, log] = args.slice(a, a + 3);
  const r = lines.findIndex((l) => l.startsWith(`| ${id} | `));
  if (r < 0) throw new Error(`${id}: no board row`);
  const c = lines[r].split(' | ');
  if (c.length !== 8) throw new Error(`${id}: board row shape`);
  c[3] = status; lines[r] = c.join(' | ');
  const h = lines.findIndex((l) => l.startsWith(`### ${id}:`));
  const s = lines.findIndex((l, k) => k > h && l.startsWith('- status: '));
  lines[s] = `- status: ${status}`;
  let j = lines.findIndex((l, k) => k > h && l === '- log:') + 1;
  while (lines[j] !== undefined && lines[j].startsWith('  - ')) j++;
  lines.splice(j, 0, `  - ${date} — ${log}`);
  console.log(`${id} → ${status}`);
}
fs.writeFileSync(f, lines.join('\n'));
