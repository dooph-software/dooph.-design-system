// HD: normalize rows.json -> norm.json (resolved doc path, line list, verdict class)
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const REPO = path.resolve(__dirname, '..', '..', '..', '..', '..');
const tracked = execSync('git ls-files', { cwd: REPO, encoding: 'utf8' }).split('\n').filter(Boolean);
const rows = JSON.parse(fs.readFileSync(path.join(__dirname, 'rows.json'), 'utf8'));

const CB = '.agents/skills/dooph-ds-codebase/SKILL.md';
const ARCH = '.agents/skills/dooph-ds-architecture/SKILL.md';
const CONTRIB = '.agents/skills/dooph-ds-contribution/SKILL.md';
const LI = '.agents/skills/dooph-ds-loading-indicators/SKILL.md';
const LIC = '.claude/skills/dooph-ds-loading-indicators/SKILL.md';
const VM = '.agents/skills/dooph-ds-writing-version-migrations/SKILL.md';
const FHC = '.agents/skills/file-header-contracts/SKILL.md';
const USAGE = 'skills/dooph-design-system-usage/SKILL.md';
const RSM = 'skills/dooph-design-system-usage/references/responsive-sheet-modal.md';
const THEME = 'skills/dooph-design-system-theming/SKILL.md';
const TC = 'skills/dooph-design-system-theming/references/token-contract.md';
const V3 = 'skills/dooph-design-system-v3-migration/SKILL.md';
const V5 = 'skills/dooph-design-system-v5-migration/SKILL.md';
const V5CM = 'skills/dooph-design-system-v5-migration/codemod.mjs';
const SPEC = 'docs/superpowers/specs/2026-08-31-digits-sidebar-mono-design.md';
const RESEARCH = '.claude/research/2026-08-27-date-picker-foundation-research.md';

const ALIAS = {
  'codebase': CB, 'cb': CB, 'codebase SKILL.md': CB,
  'arch': ARCH, 'arch SKILL.md': ARCH, 'architecture SKILL.md': ARCH,
  'li': LI, 'li SKILL.md': LI, 'loading-indicators SKILL.md': LI, '.claude mirror': LIC,
  'usage': USAGE, 'usage SKILL.md': USAGE,
  'theming': THEME, 'theming SKILL.md': THEME,
  'tc': TC, 'rsm': RSM, 'responsive-sheet-modal.md': RSM,
  'v3': V3, 'v5': V5, 'codemod': V5CM,
  'README': 'README.md', 'CHANGELOG': 'CHANGELOG.md', 'CONTRIBUTING': 'CONTRIBUTING.md',
  'SECURITY': 'SECURITY.md', 'NOTICES': 'THIRD_PARTY_NOTICES.md',
  'spec': SPEC, 'spec 2026-08-31': SPEC, 'research': RESEARCH,
  'executor-prompt': 'executor-prompt-oss-publication.md',
  'fhc': FHC,
  'DM': 'src/components/Menu/DropdownMenu.tsx',
  'DT': 'src/components/DropdownTrigger/DropdownTrigger.tsx',
  'LS': 'src/components/LoadingSpinner/LoadingSpinner.tsx',
  'SG': 'src/components/LoadingSpinner/spinnerGeometry.ts',
  'PI': 'src/components/ProgressIndicator/ProgressIndicator.tsx',
  'WG': 'src/components/ProgressIndicator/waveGeometry.ts',
  'LPI': 'src/components/LinearProgressIndicator/LinearProgressIndicator.tsx',
  'LPI.tsx': 'src/components/LinearProgressIndicator/LinearProgressIndicator.tsx',
  'SMS': 'src/components/ShapeMorphSpinner/ShapeMorphSpinner.tsx',
  'SMS.tsx': 'src/components/ShapeMorphSpinner/ShapeMorphSpinner.tsx',
  'PI.tsx': 'src/components/ProgressIndicator/ProgressIndicator.tsx',
  'SG.ts': 'src/components/LoadingSpinner/spinnerGeometry.ts',
  'constants.ts (PI)': 'src/components/ProgressIndicator/constants.ts',
  'test.ts': 'src/components/ProgressIndicator/waveGeometry.test.ts',
  'agents-md-snippet.md': '.agents/skills/file-header-contracts/references/agents-md-snippet.md',
  'evaluation.md': '.agents/skills/file-header-contracts/references/evaluation.md',
  'human-approval-hook.md': '.agents/skills/file-header-contracts/references/human-approval-hook.md',
  '.claude/research/…': RESEARCH,
  'docs/superpowers/specs/…digits-sidebar-mono-design.md': SPEC,
};
const UNIT_DEFAULT = { U11: { 'constants.ts': 'src/components/AIChat/constants.ts' } };
const SUB_DOC = [
  [/dooph-ds-codebase/, CB], [/dooph-ds-architecture/, ARCH], [/dooph-ds-contribution/, CONTRIB],
  [/dooph-ds-loading-indicators/, LI], [/writing-version-migrations/, VM], [/skills-lock/, 'skills-lock.json'],
  [/usage\/SKILL|dooph-design-system-usage\/SKILL/, USAGE], [/responsive-sheet-modal/, RSM],
  [/theming\/SKILL/, THEME], [/token-contract/, TC], [/v3-migration/, V3], [/v5-migration/, V5],
];

function resolveFile(tok, unit) {
  tok = tok.trim();
  if (ALIAS[tok]) return ALIAS[tok];
  if (UNIT_DEFAULT[unit] && UNIT_DEFAULT[unit][tok]) return UNIT_DEFAULT[unit][tok];
  if (tracked.includes(tok)) return tok;
  const suf = tracked.filter((p) => p === tok || p.endsWith('/' + tok));
  if (suf.length === 1) return suf[0];
  if (suf.length > 1) {
    // prefer src/ over mirrors
    const src = suf.filter((p) => p.startsWith('src/') || p.startsWith('.agents/') || p.startsWith('skills/'));
    if (src.length === 1) return src[0];
    return 'AMBIG:' + tok + ' [' + suf.join(', ') + ']';
  }
  return null;
}

function parseSrc(raw, unit, sub, prevDoc) {
  let s = raw.replace(/\s*\((table as a whole|adjacent, not owned|comment|JSDoc|inherited)\)/g, '').trim();
  s = s.replace(/\s*\(×4 files\)/, '').replace(/\s*\(same in [^)]*\)/, '');
  s = s.replace(/\s*\(contrib R9\.21, codebase 403-405\)/, '').replace(/\s*\+ R4\.7/, '').replace(/ vs tags$/, '');
  let doc = null; let lines = []; const extra = [];
  // sub heading doc for U13/U14
  let subDoc = null;
  for (const [re, d] of SUB_DOC) if (re.test(sub)) { subDoc = d; break; }
  // split into segments
  const segs = s.split(/\s+(?:\/|vs|;)\s+|;\s+|,\s+(?=[A-Za-z.])|\s+\+\s+/);
  for (const seg of segs) {
    let m = seg.match(/^(.*?)\s*:\s*([\d][\d,\-– :]*)$/) || seg.match(/^(.*?)\s*:\s*(\d+.*)$/);
    let file = null; let nums = [];
    if (m) {
      const f = m[1].trim();
      nums = (m[2].match(/\d+(?:\s*[-–]\s*\d+)?/g) || []).map((x) => x.replace(/\s/g, ''));
      if (f === '' || f === 'same') file = f === 'same' ? prevDoc : (subDoc || doc || prevDoc);
      else file = resolveFile(f, unit) || resolveFile(f.replace(/\s+SKILL\.md$/, ''), unit);
      if (!file && subDoc && f === '') file = subDoc;
    } else {
      // no line number
      const f = seg.replace(/\s*\((all|item \d+)\)$/, '').trim();
      file = resolveFile(f, unit) || (f.startsWith('.') || f.includes('/') ? f : null);
      if (!file && /^:?\d/.test(seg)) { file = subDoc || doc; nums = seg.match(/\d+(?:-\d+)?/g); }
      if (!file && subDoc) file = subDoc;
    }
    if (!doc) { doc = file; lines = nums; } else if (file === doc) lines = lines.concat(nums); else extra.push((file || '?') + (nums.length ? ':' + nums.join(',') : ''));
  }
  if (!doc && subDoc) doc = subDoc;
  return { doc, lines, extra };
}

function vclass(v) {
  // classify on the verdict words outside parentheses (evidence-like asides inside them, e.g. "core.symlinks=false")
  const u = (v.replace(/\([^)]*\)/g, ' ').trim() || v).toUpperCase();
  if (/OMISSION/.test(u)) return 'OMISSION';
  if (/^CONFIRMED|^REFUTED/.test(u)) return 'RC';
  const hasF = /FALSE|CONTRADICTED|MISQUOTE/.test(u);
  const hasS = /STALE|SUPERSEDED|INCOMPLETE/.test(u) && !/^TRUE/.test(u);
  const hasT = /TRUE|HONOURED|^CONSISTENT/.test(u);
  const hasU = /UNVERIFIABLE/.test(u);
  let c;
  if (hasF && hasT) c = 'FALSE';
  else if (hasF) c = 'FALSE';
  else if (hasS) c = 'STALE';
  else if (/^STALE/.test(u)) c = 'STALE';
  else if (hasT) c = 'TRUE';
  else if (hasU) c = 'UNVERIFIABLE';
  else c = 'OTHER';
  return c;
}

const out = [];
let prevDoc = null;
for (const r of rows) {
  if (r.ncol !== 4) { out.push({ ...r, skip: 'RC table (rulebook conflict, not a claim)' }); continue; }
  const [src, claim, verdict, evidence] = r.cells;
  const p = parseSrc(src, r.unit, r.sub, prevDoc);
  prevDoc = p.doc;
  const first = p.lines.length ? parseInt(p.lines[0], 10) : 0;
  out.push({ unit: r.unit, fileLine: r.fileLine, sub: r.sub, src, doc: p.doc, lines: p.lines, first, extra: p.extra, claim, verdictRaw: verdict, vclass: vclass(verdict), evidence });
}
fs.writeFileSync(path.join(__dirname, 'norm.json'), JSON.stringify(out, null, 1));
for (const o of out) {
  if (o.skip) continue;
  console.log([o.unit, o.fileLine, o.doc, o.lines.join(','), o.extra.join(' '), o.vclass, o.src].join('\t'));
}
