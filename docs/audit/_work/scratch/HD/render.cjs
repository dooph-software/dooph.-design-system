// HD: render docs/audit/_work/horizontal/claims-register.md, appending one section (and one doc group) at a time.
// Usage: node render.cjs <part>   part = header | docs | conflicts | unverifiable | regrades | excluded | summary | rollup | done
const fs = require('fs');
const B = require('./build.cjs');
const { G, keys, keyDoc, stats, excluded, dropped, esc, evidenceCell, findingsCell, pathLine, units, OUT, O } = B;
const part = process.argv[2];
const app = (s) => fs.appendFileSync(OUT, s);
const short = (s, n = 220) => { s = String(s || ''); return s.length > n ? s.slice(0, n - 1) + '…' : s; };
const byId = Object.fromEntries(G.map((x) => [x.id, x]));
const ord = (a, b) => keys.indexOf(a.key) - keys.indexOf(b.key) || +a.cid.split('-').pop() - +b.cid.split('-').pop();
const UMB = new Set(['U6:875', 'U5:470', 'U13:413', 'U13:415', 'U13:564', 'U13:549', 'U13:496', 'U9:571', 'U4:602', 'U1:525', 'U14:672']);
const memberVerdicts = (x) => x.g.map((r) => r.unit + ' ' + r.verdictRaw.replace(/\s+/g, ' ').slice(0, 70)).join('; ');

if (part === 'header') {
  const rawRows = JSON.parse(fs.readFileSync(__dirname + '/rows.json', 'utf8'));
  const nRC = rawRows.filter((r) => r.ncol !== 4).length;
  const merged = G.filter((x) => x.g.length > 1);
  const tot = { TRUE: 0, FALSE: 0, STALE: 0, UNVERIFIABLE: 0 };
  for (const x of G) tot[x.verdict]++;
  fs.writeFileSync(OUT, `# H10 — Claims register (horizontal pass HD) @ b436647

Consolidates every "Claim results" row from units U1–U14 (all 14 end with \`## DONE\`; U10/U11 processed in full, not partial) into one register grouped by source doc, de-duplicated, with conflicting verdicts and UNVERIFIABLE rows re-checked by HD.

**Pipeline** (scripts in \`docs/audit/_work/scratch/HD/\`): \`parse.cjs\` (table rows of each unit's §4 → \`rows.json\`) → \`normalize.cjs\` (resolve \`codebase:\`/\`cb:\`/\`DM:\`/\`li:\`… aliases to repo paths; verdict class from the words outside parentheses) → \`claims.tsv\` (${rawRows.length} raw rows) → \`linecheck.cjs\` (anchor strings from each claim located in the cited doc: 595 cited ranges confirmed, 4 drifted) → \`overrides.cjs\` (hand decisions: line fixes, merges, exclusions, resolutions) → \`build.cjs\`/\`render.cjs\` (this file). \`findings.cjs\` indexes all ${B.F.length} unit findings and their locations for the roll-up.

**Counts.** ${rawRows.length} raw rows − ${nRC} rulebook-conflict rows (U14 RC table, not claims) − ${excluded.length} excluded (normative rules, templates, plans, omissions; §5) − ${dropped.length} dropped (pure history; §5) → **${G.length} claims** (${merged.length} of them merged from 2+ unit rows; 3 multi-file rows expanded per file). Verdicts: TRUE ${tot.TRUE} · FALSE ${tot.FALSE} · STALE ${tot.STALE} · UNVERIFIABLE ${tot.UNVERIFIABLE}.

**Conventions**
- Verdicts: TRUE / FALSE (never true, or contradicted now with no sign it was once true) / STALE (true at an earlier commit or tag, drifted) / UNVERIFIABLE (reason given in §3). A row graded "TRUE … / FALSE …" by a unit is FALSE here (a claim with a false part is false) unless HD split it.
- Rules are not claims: imperative content of the normative docs (arch, contrib, fhc, li, vm, AGENTS — see rulebook.md) is excluded; their descriptive present-tense sentences stay. Header \`## constraints\` rows stay where they state a checkable fact ("honoured" → TRUE).
- **P-5.4 policy.** No 5.4 release exists (\`git tag\` tops at v5.3.0; package.json 5.3.0). A claim whose content is "X happened in 5.4" is graded on that label → FALSE, with the event's own truth noted in evidence. This aligns U4/U10/U1 rows with U13/U14, who graded the identical label FALSE.
- Evidence cell: each unit's evidence prefixed by **U#** (with the unit's own verdict in [brackets] when it differs from the final verdict, and "(cited :N)" when HD corrected a drifted line), then **HD** with the resolution method where HD decided.
- Finding(s): plain ID = cited by the unit in the claim row; ≈ID = HD mapped the claim to the finding that owns the same defect; ~ID = a finding whose \`locations\` overlap this path:line (ranges ≤ 20 lines); UNCOVERED = FALSE/STALE with none (see §7).
- DOCKEY: CB codebase skill · ARCH architecture · CONTRIB contribution · LI loading-indicators (canonical) · LIC the \`.claude/\` real copy · VM version-migrations · FHC file-header-contracts (+ -SNIPPET, -EVAL references) · USAGE / RSM (responsive-sheet-modal) · THEME / TC (token-contract) · V3 / V5 / V5CM (v5 codemod) · README · CHANGELOG · CONTRIBUTING · SECURITY · NOTICES · LICENSE · PKG · SKILLSLOCK · SPEC (digits/sidebar/mono spec) · SPEC-CHARTS · RESEARCH · PROMPT (executor prompt) · HDR-<File> (lines inside a \`## behavior\`/\`## constraints\` header) · JSDOC-<File> (any other code/CSS/script comment).

## 1. Register (grouped by source doc)

`);
  console.log('header written');
}

if (part === 'docs') {
  const only = process.argv[3];
  for (const k of keys) {
    if (only && k !== only) continue;
    const xs = G.filter((x) => x.key === k).sort((a, b) => +a.cid.split('-').pop() - +b.cid.split('-').pop());
    let s = `### ${k} — \`${keyDoc[k]}\` (${xs.length})\n\n| C-ID | path:line | claim (short quote) | verdict | evidence | unit source(s) | finding(s) |\n|---|---|---|---|---|---|---|\n`;
    for (const x of xs) {
      const extra = x.p.extra && x.p.extra.length ? ` [also: ${x.p.extra.join(', ')}]` : '';
      s += `| ${x.cid} | ${esc(pathLine(x))} | ${esc(short(x.claim) + extra)} | ${x.verdict} | ${evidenceCell(x)} | ${units(x)} | ${findingsCell(x)} |\n`;
    }
    app(s + '\n');
  }
  console.log('docs written', only || 'all');
}

if (part === 'conflicts') {
  const differs = (x) => new Set(x.g.map((r) => r.vclass)).size > 1;
  const xs = G.filter((x) => x.res && (['conflict', 'policy', 'split'].includes(x.res.kind) || differs(x))).sort(ord);
  const multi = G.filter((x) => !x.res && differs(x));
  let s = `## 2. Resolved conflicts

A conflict = two or more units graded the same claim differently (or one unit graded two halves of a merged claim differently). Each was re-verified against the code at b436647; method in the last column. "policy" rows harmonise the P-5.4 label; "split" rows are halves of one unit row that HD separated.

| C-ID | path:line | claim | unit verdicts | resolved | kind | method |
|---|---|---|---|---|---|---|
`;
  for (const x of xs) s += `| ${x.cid} | ${esc(pathLine(x))} | ${esc(short(x.claim, 140))} | ${esc(memberVerdicts(x))} | ${x.verdict} | ${x.res.kind} | ${esc(x.res.m)} |\n`;
  s += `| (excluded) | .agents/skills/dooph-ds-contribution/SKILL.md:65 | necessary wrapper "is \`aria-hidden\` and absolutely positioned" | U4 TRUE for the orbs; U14 FALSE for sanctioned wrappers | excluded | conflict | Classed as a normative rule (RC-2, U14-F11): the disagreement is about whether the rule fits arch:232-235, not about a fact. |\n`;
  s += `\nConflicts resolved: ${xs.filter((x) => x.res.kind === 'conflict' || x.res.kind === 'unverifiable').length} unit-vs-unit + 1 dissolved by exclusion; ${xs.filter((x) => x.res.kind === 'policy').length} P-5.4 harmonisations; ${xs.filter((x) => x.res.kind === 'split').length} split rows. Unresolved: ${multi.length}.\n\n`;
  app(s);
  console.log('conflicts', xs.length, 'unresolved', multi.length);
}

if (part === 'unverifiable') {
  const xs = G.filter((x) => x.g.some((r, i) => (i === 0 || !UMB.has(r.id)) && /UNVERIFIABLE/i.test(r.verdictRaw)) || x.verdict === 'UNVERIFIABLE' || (x.res && x.res.kind === 'unverifiable')).sort(ord);
  let s = `## 3. UNVERIFIABLE re-checks

Every claim a unit marked UNVERIFIABLE (wholly or in part), plus anything still UNVERIFIABLE after HD. "still UNVERIFIABLE" rows say why no in-repo check exists.

| C-ID | path:line | claim | unit verdict(s) | HD result | method / reason |
|---|---|---|---|---|---|
`;
  for (const x of xs) {
    const m = x.res ? x.res.m : 'Resolved by merge: another unit verified it (see evidence).';
    s += `| ${x.cid} | ${esc(pathLine(x))} | ${esc(short(x.claim, 140))} | ${esc(memberVerdicts(x))} | ${x.verdict === 'UNVERIFIABLE' ? 'still UNVERIFIABLE' : x.verdict} | ${esc(m)} |\n`;
  }
  const still = xs.filter((x) => x.verdict === 'UNVERIFIABLE').length;
  s += `\nRe-checked: ${xs.length}; now verified: ${xs.length - still}; still UNVERIFIABLE: ${still}.\n\n`;
  app(s);
  console.log('unverifiable', xs.length, 'still', still);
}

if (part === 'regrades') {
  const xs = G.filter((x) => x.res && x.res.kind === 'regrade').sort(ord);
  let s = `## 4. Single-unit verdicts re-graded by HD

Not conflicts (one unit only), but the unit's verdict word was not one of the four, or HD's re-reading changed it.

| C-ID | path:line | claim | unit verdict | HD verdict | reason |
|---|---|---|---|---|---|
`;
  for (const x of xs) s += `| ${x.cid} | ${esc(pathLine(x))} | ${esc(short(x.claim, 140))} | ${esc(memberVerdicts(x))} | ${x.verdict} | ${esc(x.res.m)} |\n`;
  app(s + '\n');
  console.log('regrades', xs.length);
}

if (part === 'excluded') {
  let s = `## 5. Rows not in the register

### 5a. Excluded — rules, templates, plans, omissions, non-claims (${excluded.length})

| unit row | source path:line | claim | unit verdict | why excluded |
|---|---|---|---|---|
`;
  for (const r of excluded) s += `| ${r.id} | ${esc(r.doc + (r.lines.length ? ':' + r.lines.join(',') : ''))} | ${esc(short(r.claim, 120))} | ${esc(r.verdictRaw.slice(0, 60))} | ${esc(r.reason)} |\n`;
  s += `\nAlso skipped: the 8 rows of U14's "Rulebook conflicts RC-1..RC-7" table (rulebook conflicts, not claims; RC-1…RC-7 all CONFIRMED by U14, R4.2 refuted — HD concurs with the R4.2 refutation: \`.text-style-button\` sizes from \`--ui-text-body\`, index.css:227).\n\n### 5b. Dropped — pure history with no present-tense claim (${dropped.length})\n\n| unit row | source path:line | claim | unit verdict | note |\n|---|---|---|---|---|\n`;
  for (const r of dropped) s += `| ${r.id} | ${esc(r.doc + (r.lines.length ? ':' + r.lines.join(',') : ''))} | ${esc(short(r.claim, 120))} | ${esc(r.verdictRaw.slice(0, 60))} | ${esc(r.reason)} |\n`;
  s += `\nKept although historical, because each implies a checkable present-tense fact: renames whose old name must now be absent (Toggle.tsx:5 TwoWayToggle; CB:211/USAGE:134-135 DropdownMenuCheckboxItem; CB:398 old icon sizes; CB:457 \`--ui-min-w-menu-action\`; CB:481-488 / TC:152-157 \`rolling-money\`; Button.tsx:19-20 \`brand\`), and "in 5.4" labels (graded under P-5.4).\n\n`;
  app(s);
  console.log('excluded/dropped written');
}

if (part === 'summary') {
  let s = `## 6. Summary per source doc

| DOCKEY | source doc | claims | TRUE | FALSE | STALE | UNVERIFIABLE |
|---|---|---|---|---|---|---|
`;
  const tot = { total: 0, TRUE: 0, FALSE: 0, STALE: 0, UNVERIFIABLE: 0 };
  for (const k of keys) {
    const st = stats[k];
    s += `| ${k} | \`${st.doc}\` | ${st.total} | ${st.TRUE || 0} | ${st.FALSE || 0} | ${st.STALE || 0} | ${st.UNVERIFIABLE || 0} |\n`;
    for (const f of Object.keys(tot)) tot[f] += st[f] || 0;
  }
  s += `| **all** | ${keys.length} docs | **${tot.total}** | **${tot.TRUE}** | **${tot.FALSE}** | **${tot.STALE}** | **${tot.UNVERIFIABLE}** |\n\n`;
  // rollups by family
  const fam = (k) => (k.startsWith('HDR-') ? 'header contracts (HDR-*)' : k.startsWith('JSDOC-') ? 'code comments (JSDOC-*)' : ['USAGE', 'RSM', 'THEME', 'TC', 'V3', 'V5', 'V5CM'].includes(k) ? 'shipped consumer skills' : ['CB', 'ARCH', 'CONTRIB', 'LI', 'LIC', 'VM', 'FHC', 'FHC-SNIPPET', 'FHC-EVAL', 'AGENTS'].includes(k) ? 'authoring skills + AGENTS' : 'repo docs, plans, metadata');
  const F2 = {};
  for (const k of keys) { const f = fam(k); F2[f] = F2[f] || { total: 0, TRUE: 0, FALSE: 0, STALE: 0, UNVERIFIABLE: 0 }; for (const c of Object.keys(F2[f])) F2[f][c] += stats[k][c] || 0; }
  s += `By family:\n\n| family | claims | TRUE | FALSE | STALE | UNVERIFIABLE | FALSE+STALE share |\n|---|---|---|---|---|---|---|\n`;
  for (const [f, v] of Object.entries(F2)) s += `| ${f} | ${v.total} | ${v.TRUE} | ${v.FALSE} | ${v.STALE} | ${v.UNVERIFIABLE} | ${Math.round((100 * (v.FALSE + v.STALE)) / v.total)}% |\n`;
  app(s + '\n');
  console.log('summary written');
}

if (part === 'rollup') {
  const xs = G.filter((x) => x.verdict === 'FALSE' || x.verdict === 'STALE').sort((a, b) => keys.indexOf(a.key) - keys.indexOf(b.key) || +a.cid.split('-').pop() - +b.cid.split('-').pop());
  const unc = xs.filter((x) => !x.explicit.length && !x.mapped.length && !x.inferred.length);
  let s = `## 7. FALSE/STALE roll-up (${xs.length})

Every FALSE/STALE claim with the unit finding(s) that already cover it (notation as in §1). ${xs.length - unc.length} covered, ${unc.length} UNCOVERED.

| C-ID | path:line | verdict | claim | covering finding(s) |
|---|---|---|---|---|
`;
  for (const x of xs) s += `| ${x.cid} | ${esc(pathLine(x))} | ${x.verdict} | ${esc(short(x.claim, 130))} | ${findingsCell(x)} |\n`;
  s += `\n### 7a. UNCOVERED — proposed roll-in (one line each, grouped by source doc)\n\n`;
  const byKey = {};
  for (const x of unc) (byKey[x.key] = byKey[x.key] || []).push(x);
  for (const [k, list] of Object.entries(byKey)) {
    s += `**${k}** (\`${keyDoc[k]}\`)\n`;
    for (const x of list) s += `- ${x.cid} (${x.lines || 'n/a'}, ${x.verdict}) → ${O.rollup[x.id] || 'NO PROPOSAL'}\n`;
    s += '\n';
  }
  app(s);
  console.log('rollup', xs.length, 'uncovered', unc.length, unc.filter((x) => !O.rollup[x.id]).map((x) => x.id));
}

if (part === 'done') { app('## DONE\n'); console.log('done'); }
