// Quote/anchor fidelity: do the quoted lines in FINDINGS evidence and REMEDIATION anchors exist in the audited SHA?
// Usage (repo root): node docs/audit/_work/scratch/orch/fidelity-check.mjs
import fs from 'node:fs';
import { execSync } from 'node:child_process';

const SHA = 'b436647c5b5713bdadceef3b5def90b0ad5357f1';
const tracked = execSync('git ls-files', { encoding: 'utf8' }).trim().split('\n');
const cache = new Map();
const fileAt = (p) => {
  if (!cache.has(p)) {
    try { cache.set(p, execSync(`git show ${SHA}:"${p}"`, { encoding: 'utf8', maxBuffer: 1 << 26 }).split(/\r?\n/)); }
    catch { cache.set(p, null); }
  }
  return cache.get(p);
};
const norm = (s) => s.replace(/\s+/g, ' ').trim();
const resolve = (name, locs) => {
  const hit = locs.find((l) => l.endsWith('/' + name) || l === name);
  if (hit) return hit;
  const c = tracked.filter((t) => t.endsWith('/' + name) || t === name);
  return c.length === 1 ? c[0] : null;
};

// ---- FINDINGS evidence lines of the form "<file.ext>:<line>  <quote>"
const F = fs.readFileSync('docs/audit/FINDINGS.md', 'utf8');
const blocks = F.split(/\n(?=### F-\d{3}:)/).filter((b) => /^### F-\d{3}:/.test(b));
let ev = { checked: 0, exact: 0, nearby: 0, miss: [] };
for (const b of blocks) {
  const id = b.match(/^### (F-\d{3})/)[1];
  const locs = [...b.matchAll(/^\s+- ([^\s:]+\.[a-z]+):\d/gm)].map((m) => m[1]);
  const evid = (b.match(/^- evidence: \|\n([\s\S]*?)(?=^- impact:)/m) || [])[1] || '';
  for (const line of evid.split('\n')) {
    const m = line.match(/^\s+([\w./-]+\.(?:tsx?|mjs|cjs|js|css|md|json|html|yml)):(\d+)(?:-\d+)?\s{2,}(.+)$/);
    if (!m) continue;
    const quote = norm(m[3]).replace(/\s*\(.*$/, '').replace(/….*$/, '').slice(0, 60);
    if (quote.length < 8) continue;
    const path = resolve(m[1], locs);
    const lines = path && fileAt(path);
    if (!lines) continue;
    ev.checked++;
    const n = Number(m[2]);
    if (lines[n - 1] && norm(lines[n - 1]).includes(quote)) ev.exact++;
    else if (lines.slice(Math.max(0, n - 6), n + 5).some((l) => norm(l).includes(quote))) ev.nearby++;
    else ev.miss.push(`${id} ${m[1]}:${n} «${quote}»`);
  }
}

// ---- REMEDIATION anchors: every non-trivial line of each anchor block must exist in one of the WI's listed files
const R = fs.readFileSync('docs/audit/REMEDIATION.md', 'utf8');
const wis = R.split(/\n(?=### WI-\d{3}:)/).filter((b) => /^### WI-\d{3}:/.test(b));
let an = { wis: 0, lines: 0, found: 0, miss: [] };
for (const w of wis) {
  const id = w.match(/^### (WI-\d{3})/)[1];
  const files = [...w.matchAll(/^\s+- modify: `([^`:\s]+)/gm)].map((m) => m[1]).filter((p) => tracked.includes(p));
  const anchor = (w.match(/^- anchor:\s*\n([\s\S]*?)(?=^- why:)/m) || [])[1] || '';
  if (!files.length || !anchor) continue;
  an.wis++;
  const body = files.map(fileAt).filter(Boolean).flat().map(norm);
  for (const raw of anchor.split('\n')) {
    const l = norm(raw);
    if (l.length < 12 || /^```|^\/\/ [\w./-]+:\d|^<!--|^#|^\.\.\.|^…/.test(l)) continue;
    an.lines++;
    if (body.some((b) => b.includes(l) || l.includes(b) && b.length > 20)) an.found++;
    else an.miss.push(`${id} «${l.slice(0, 70)}»`);
  }
}

const pct = (a, b) => (b ? ((100 * a) / b).toFixed(1) + '%' : 'n/a');
console.log(`FINDINGS evidence quotes: ${ev.checked} checked · exact line ${ev.exact} (${pct(ev.exact, ev.checked)}) · within ±5 lines ${ev.nearby} · not found ${ev.miss.length}`);
console.log(`REMEDIATION anchors: ${an.wis} WIs · ${an.lines} anchor lines · found in source ${an.found} (${pct(an.found, an.lines)}) · not found ${an.miss.length}`);
fs.writeFileSync('docs/audit/_work/scratch/orch/fidelity-misses.txt', ['# evidence misses', ...ev.miss, '', '# anchor misses', ...an.miss].join('\n') + '\n');
console.log('misses listed in docs/audit/_work/scratch/orch/fidelity-misses.txt');
