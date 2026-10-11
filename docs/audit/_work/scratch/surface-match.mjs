#!/usr/bin/env node
// surface-match.mjs <classified.json> <out.json>
//
// Links each classified api-diff line to the records that explain it:
//   - CHANGES.md entries (### headings) for lines that changed after b436647
//   - CHANGELOG.md [Unreleased]
//   - commits in v5.3.0..b436647 (git pickaxe on the line's most specific term)
// The match is a lead for a human reader, not proof: every line is reviewed by
// hand before it lands in gaps.md.

import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';

const REPO = resolve(import.meta.dirname, '../../../..');
const [clsP, outP] = process.argv.slice(2);
const lines = JSON.parse(readFileSync(clsP, 'utf8'));

// ── Record parsing ──────────────────────────────────────────────────────────
function parseChanges(text) {
  const entries = [];
  let cur = null;
  let date = '';
  text.split(/\r?\n/).forEach((ln, i) => {
    const d = ln.match(/^## (\d{4}-\d{2}-\d{2})/);
    if (d) date = d[1];
    const h = ln.match(/^### (.*)/);
    if (h) {
      cur = { heading: h[1].trim(), line: i + 1, date, body: '' };
      entries.push(cur);
      return;
    }
    if (cur) cur.body += ln + '\n';
  });
  for (const e of entries) {
    const b = e.body.match(/^\s*- (?:\*\*)?breaking(?:\*\*)?:?\s*([\s\S]*?)(?=^\s*- (?:\*\*)?(?:verified|docs owed|files|what changed|consumer impact)|^### |(?![\s\S]))/im);
    e.breaking = b ? b[1].replace(/\s+/g, ' ').trim().slice(0, 400) : null;
    e.all = (e.heading + '\n' + e.body);
  }
  return entries;
}

function unreleased(text) {
  const m = text.match(/## \[Unreleased\]([\s\S]*?)\n## \[/);
  return m ? m[1] : '';
}

const changes = parseChanges(readFileSync(resolve(REPO, 'docs/audit/CHANGES.md'), 'utf8'));
const changelog = unreleased(readFileSync(resolve(REPO, 'CHANGELOG.md'), 'utf8'));

// ── Terms from a line's paths ───────────────────────────────────────────────
// owner = the component / const / type / block the line is about;
// terms = the most specific identifiers (prop, key, token, class, values).
function termsOf(line) {
  const owners = new Set(), terms = new Set();
  for (const p of line.paths) {
    const [root, a, b, c] = p;
    if (root === 'exports') { terms.add(a); }
    else if (root === 'components') { owners.add(a); if (b === 'props' && c) terms.add(c); else if (b === 'inherited' && c) terms.add(c); }
    else if (root === 'consts') { owners.add(a); if (c) terms.add(c); }
    else if (root === 'types') { owners.add(a); if (b === 'members' && c) terms.add(c); }
    else if (root === 'functions') { terms.add(a); }
    else if (root === 'tokens' || root === 'themeVars') { if (c) terms.add(c); else owners.add(a); }
    else if (root === 'classes') { terms.add(b === 'ds' || b === 'textStyle' ? c : c); }
    else if (root === 'pkg') { terms.add(String(a)); if (b != null) terms.add(String(b)); }
  }
  // Values named in the text ("values added: `"prominent"`").
  for (const m of line.text.matchAll(/values (?:added|removed): ([^;)]*)/g))
    for (const v of m[1].matchAll(/`"([^"`]+)"`/g)) terms.add(v[1]);
  return { owners: [...owners], terms: [...terms].filter(Boolean) };
}

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const has = (hay, term) => {
  if (!term) return false;
  // word-ish boundary: not preceded/followed by an identifier character
  return new RegExp(`(^|[^A-Za-z0-9_-])${esc(term)}($|[^A-Za-z0-9_-])`).test(hay);
};

// Wildcard names an entry uses for a family (`--ui-outline-button-*`,
// `ds-progress-*`): a term matches when it starts with the prefix.
for (const e of changes) {
  e.wild = [...e.all.matchAll(/(--ui-[a-z0-9-]*|ds-[a-z0-9-]*)\*/g)].map((m) => m[1]).filter((p) => p !== '--ui-' && p !== 'ds-');
}
// An owner may be written without its Props suffix, or as its component.
const ownerForms = (o) => [o, o.replace(/Props$/, ''), o.replace(/(Own)?Props$/, '')].filter((v, i, a) => v && a.indexOf(v) === i);
// Terms too common to identify anything on their own.
const WEAK = new Set(['size', 'variant', 'color', 'value', 'children', 'className', 'ref', 'label', 'labels', 'default', 'standard', 'sm', 'icon', 'primary', 'secondary', 'ghost', 'text', 'danger', 'style', 'id', 'key', 'title', 'description', 'disabled', 'state', 'mode', 'meta', 'shapes', 'timing', 'portal', 'portalProps', 'files', 'exports', 'dist', 'skills', 'bin']);

function matchEntries(line) {
  const { owners, terms } = termsOf(line);
  const hits = [];
  for (const e of changes) {
    const t = terms.filter((x) => has(e.all, x) || e.wild.some((w) => x.startsWith(w) && x.length > w.length));
    const o = owners.filter((x) => ownerForms(x).some((f) => has(e.all, f)));
    let ok;
    if (!terms.length) ok = o.length > 0; // a whole new component / const / type
    else if (!owners.length) ok = t.length > 0;
    else ok = (t.length && o.length) || t.some((x) => !WEAK.has(x) && x.length > 4 && has(e.all, x) && /[A-Z-]/.test(x.slice(1)));
    if (ok) hits.push({ heading: e.heading, line: e.line, terms: t, owners: o, breaking: e.breaking });
  }
  return { owners, terms, hits };
}

// ── Pickaxe in v5.3.0..b436647 ──────────────────────────────────────────────
const pickCache = new Map();
function pickaxe(term) {
  if (pickCache.has(term)) return pickCache.get(term);
  let out = [];
  try {
    out = execFileSync('git', ['-C', REPO, 'log', '--format=%h %s', `-S${term}`, 'v5.3.0..b436647', '--', 'src', 'package.json', 'scripts'], { encoding: 'utf8' })
      .trim().split('\n').filter(Boolean);
  } catch {}
  pickCache.set(term, out);
  return out;
}

const result = [];
for (const l of lines) {
  const when = l.when.split('+').filter((w) => w !== 'none').join('+') || 'none';
  const { owners, terms, hits } = matchEntries(l);
  const inChangelog = terms.some((t) => has(changelog, t));
  let commits = [];
  if (when.includes('pre')) {
    const t = terms.find((x) => x.length > 2) ?? owners[0];
    if (t) commits = pickaxe(t);
  }
  result.push({ ...l, when, owners, terms, entries: hits.map((h) => `${h.line}: ${h.heading}`), entryBreaking: hits.map((h) => h.breaking), inChangelog, commits });
}
writeFileSync(outP, JSON.stringify(result, null, 1) + '\n');
const stat = {};
for (const r of result) {
  const k = `${r.when} | ${r.entries.length ? 'entry' : r.inChangelog ? 'changelog' : r.commits.length ? 'commit' : 'NONE'}`;
  stat[k] = (stat[k] ?? 0) + 1;
}
console.log(stat);
