// Phase 6 self-check (audit §6). Usage (repo root): node docs/audit/_work/scratch/orch/self-check.mjs
import fs from 'node:fs';
import { execSync } from 'node:child_process';

const read = (p) => fs.readFileSync(p, 'utf8');
const F = read('docs/audit/FINDINGS.md');
const R = read('docs/audit/REMEDIATION.md');
const S = fs.existsSync('docs/audit/SUMMARY.md') ? read('docs/audit/SUMMARY.md') : '';
const results = [];
const check = (name, ok, detail = '') => results.push(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);

// 1. ledger covers every tracked file with a terminal status
const tracked = execSync('git ls-files', { encoding: 'utf8' }).trim().split('\n');
const ledgerRows = new Map([...F.matchAll(/^\| ([^|]+?) \| (T[^|]*) \| [^|]* \| [^|]* \| ([a-z-]+|MISSING) \|/gm)].map((m) => [m[1].trim(), m[3]]));
const STAT = new Set(['reviewed-clean', 'findings', 'claims-checked', 'pattern-verified', 'generated-verified', 'provenance-only']);
const noRow = tracked.filter((p) => !ledgerRows.has(p));
const badStat = [...ledgerRows].filter(([, s]) => !STAT.has(s));
check('ledger: every git ls-files path has a row', noRow.length === 0, `${tracked.length} tracked, ${noRow.length} missing ${noRow.slice(0, 5).join(', ')}`);
check('ledger: every status terminal', badStat.length === 0, badStat.slice(0, 5).map((x) => x.join('=')).join(', '));

// 2. findings fields
const blocks = F.split(/\n(?=### F-\d{3}:)/).filter((b) => /^### F-\d{3}:/.test(b));
const fids = blocks.map((b) => b.match(/^### (F-\d{3}):/)[1]);
const need = ['locations', 'evidence', 'verified_by', 'remediation'];
const weak = [];
const unconf = [];
for (const b of blocks) {
  const id = b.match(/^### (F-\d{3}):/)[1];
  for (const k of need) if (!new RegExp(`^- ${k}:\\s*\\S`, 'm').test(b) && !new RegExp(`^- ${k}:\\s*\\|?\\s*\\n\\s+\\S`, 'm').test(b) && !new RegExp(`^- ${k}:\\s*\\n\\s+- `, 'm').test(b)) weak.push(`${id}:${k}`);
  const sev = (b.match(/^- severity:\s*(S\d)/m) || [])[1];
  const conf = (b.match(/^- confidence:\s*(.*)$/m) || [])[1] || '';
  if ((sev === 'S1' || sev === 'S2') && !/^confirmed/.test(conf) && !/^plausible\s*[:—-]\s*\S/.test(conf)) unconf.push(`${id}(${conf})`);
}
check('findings: 120 blocks, unique, sequential', fids.length === 120 && new Set(fids).size === 120 && fids.every((f, i) => f === `F-${String(i + 1).padStart(3, '0')}`), `${fids.length} blocks`);
check('findings: location/evidence/verified_by/remediation present', weak.length === 0, weak.slice(0, 8).join(', '));
check('findings: S1/S2 confirmed or plausible-with-reason', unconf.length === 0, unconf.join(', '));
const conflicts = blocks.filter((b) => /^- contract:.*→\s*conflicts\b/m.test(b) && !/^- remediation:.*decision D-\d+/m.test(b)).map((b) => b.match(/^### (F-\d{3})/)[1]);
check('contract conflicts route to a decision', conflicts.length === 0, conflicts.join(', '));

// 3. traceability both ways
const wiIds = [...R.matchAll(/^### (WI-\d{3}):/gm)].map((m) => m[1]);
const wiAddr = new Map([...R.matchAll(/^### (WI-\d{3}):[\s\S]*?^- addresses:\s*\[([^\]]*)\]/gm)].map((m) => [m[1], m[2].match(/F-\d{3}/g) || []]));
const noF = wiIds.filter((w) => !(wiAddr.get(w) || []).length);
check('every WI addresses ≥1 finding', noF.length === 0, noF.join(', '));
const addressed = new Set([...wiAddr.values()].flat());
const unremediated = blocks.filter((b) => {
  const id = b.match(/^### (F-\d{3})/)[1];
  const sev = (b.match(/^- severity:\s*(S\d)/m) || [])[1];
  const rem = (b.match(/^- remediation:\s*(.*)$/m) || [])[1] || '';
  return sev !== 'S4' && !addressed.has(id) && !/decision D-\d+|no-action/.test(rem);
}).map((b) => b.match(/^### (F-\d{3})/)[1]);
check('every S1–S3 finding → WI, D-item or no-action', unremediated.length === 0, unremediated.join(', '));
const danglingWI = [...F.matchAll(/\bWI-(\d{3})\b/g)].map((m) => `WI-${m[1]}`).filter((w) => !wiIds.includes(w));
check('findings cite only existing WIs', danglingWI.length === 0, [...new Set(danglingWI)].join(', '));
const leftovers = (R + F + S).match(/WI-C\d[a-z]?-\d+|WI-RELEASE-[A-Z]+/g) || [];
check('no local WI ids left', leftovers.length === 0, [...new Set(leftovers)].join(', '));
const dIds = new Set([...R.matchAll(/^### (D-\d{2}):/gm)].map((m) => m[1]));
const dRefs = [...(R + F + S).matchAll(/\bD-(\d{2})\b/g)].map((m) => `D-${m[1]}`).filter((d) => !dIds.has(d));
check('every D reference exists', dRefs.length === 0, [...new Set(dRefs)].join(', '));

// 4. placeholders
const ph = (R.match(/^.*\b(TBD|TODO:|similar to WI-|clean up [A-Z])\b.*$/gim) || []).filter((l) => !/no placeholders|placeholder/i.test(l));
check('REMEDIATION has no placeholders', ph.length === 0, ph.slice(0, 3).join(' | ').slice(0, 300));

// 5. SUMMARY numbers vs FINDINGS
const sevCount = (s) => blocks.filter((b) => (b.match(/^- severity:\s*(S\d)/m) || [])[1] === s).length;
const counts = ['S1', 'S2', 'S3', 'S4'].map(sevCount);
const sumOk = S && S.includes(`${counts[0]} S1`) && S.includes(`${counts[1]} S2`) && S.includes(`${counts[2]} S3`) && S.includes(`${counts[3]} S4`) && S.includes(`${blocks.length} findings`);
check('SUMMARY severity counts match FINDINGS', !!sumOk, `FINDINGS: ${counts.join('/')} total ${blocks.length}`);
const sumF = [...S.matchAll(/\bF-(\d{3})\b/g)].map((m) => `F-${m[1]}`).filter((f) => !fids.includes(f));
check('SUMMARY cites only existing F-IDs', sumF.length === 0, sumF.join(', '));
const sumWI = S.match(/(\d+) work items/);
check('SUMMARY WI count matches REMEDIATION', !sumWI || Number(sumWI[1]) === wiIds.length, `REMEDIATION ${wiIds.length}${sumWI ? ', SUMMARY ' + sumWI[1] : ''}`);
const sumD = S.match(/(\d+) decision items/);
check('SUMMARY D count matches REMEDIATION', !sumD || Number(sumD[1]) === dIds.size, `REMEDIATION ${dIds.size}${sumD ? ', SUMMARY ' + sumD[1] : ''}`);
check('SUMMARY ≈60 lines', S.split('\n').length <= 75, `${S.split('\n').length} lines`);

// 6. repo state
const status = execSync('git status --porcelain', { encoding: 'utf8' }).trim().split('\n').filter(Boolean);
check('git status shows only docs/audit/', status.every((l) => /docs\/audit\/?$|docs\/audit\//.test(l)), status.join(' ; '));
const wt = execSync('git worktree list', { encoding: 'utf8' });
check('audit worktree removed', !/dooph-ds-audit-build/.test(wt), wt.trim().split('\n').length + ' worktree(s)');
check('_work kept (evidence) and referenced files exist', fs.existsSync('docs/audit/_work/verify/V1.md') && fs.existsSync('docs/audit/_work/units/U1.md'));

console.log(results.join('\n'));
console.log(`\n${results.filter((r) => r.startsWith('FAIL')).length} FAIL / ${results.length}`);
