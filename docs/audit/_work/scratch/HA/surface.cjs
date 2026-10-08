// Task 2: public surface — classify every export of src/index.ts; check *Props exported per component.
const fs = require('fs');
const { ts, ROOT, srcFiles, allFiles, load, rel, lineOf, isStory } = require('./prog.cjs');
const { program, checker } = load();

const idx = program.getSourceFile(ROOT + '/src/index.ts');
const modSym = checker.getSymbolAtLocation(idx);
const exps = checker.getExportsOfModule(modSym);

const dts = fs.readFileSync(ROOT + '/docs/audit/_work/dist-index.d.ts', 'utf8');
const distNames = new Set();
for (const m of dts.matchAll(/export \{([^}]*)\}/g)) for (const part of m[1].split(',')) { const s = part.trim(); if (!s) continue; const mm = s.match(/(?:type\s+)?(\w+)(?:\s+as\s+(\w+))?/); distNames.add(mm[2] || mm[1]); }

// docs corpus
function walk(dir, out = []) { if (!fs.existsSync(dir)) return out; for (const e of fs.readdirSync(dir, { withFileTypes: true })) { const p = dir + '/' + e.name; if (e.isDirectory()) walk(p, out); else if (/\.(md|mdx)$/.test(e.name)) out.push(p); } return out; }
const docFiles = [...walk(ROOT + '/skills'), ROOT + '/README.md'];
const docText = docFiles.map((f) => [rel(f), fs.readFileSync(f, 'utf8')]);
function docMentions(name) { const re = new RegExp('(?<![\\w$])' + name + '(?![\\w$])'); return docText.filter(([, t]) => re.test(t)).map(([f]) => f); }

// internal importers: non-story src files importing the name (by symbol)
const importers = new Map(); // declSymbol -> Set(file)
const storyImporters = new Map();
for (const f of allFiles) {
  const sf = program.getSourceFile(f);
  sf.forEachChild((n) => {
    if (ts.isImportDeclaration(n) && n.importClause) {
      const ic = n.importClause;
      const add = (idn) => { let s = checker.getSymbolAtLocation(idn); if (!s) return; if (s.flags & ts.SymbolFlags.Alias) s = checker.getAliasedSymbol(s); const m = isStory(f) ? storyImporters : importers; if (!m.has(s)) m.set(s, new Set()); m.get(s).add(rel(f)); };
      if (ic.name) add(ic.name);
      if (ic.namedBindings && ts.isNamedImports(ic.namedBindings)) ic.namedBindings.elements.forEach((e) => add(e.name));
    }
  });
}

const rows = [];
for (const e of exps) {
  const name = e.name;
  const target = e.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(e) : e;
  const decl = (target.declarations || [])[0];
  const file = decl ? rel(decl.getSourceFile().fileName) : '?';
  const line = decl ? lineOf(decl) : 0;
  const isValue = !!(target.flags & ts.SymbolFlags.Value);
  const isType = !!(target.flags & (ts.SymbolFlags.Type)) ;
  let kind = 'type';
  let typeStr = '';
  if (isValue && decl) {
    const t = checker.getTypeOfSymbolAtLocation(target, decl);
    typeStr = checker.typeToString(t).slice(0, 120);
    const isComp = /^[A-Z]/.test(name) && (/ForwardRefExoticComponent|MemoExoticComponent|NamedExoticComponent|=> (JSX\.Element|ReactElement|ReactNode|React\.JSX\.Element)|Component\b/.test(typeStr) || t.getCallSignatures().some((s) => /Element|ReactNode/.test(checker.typeToString(s.getReturnType()))));
    if (isComp) kind = 'component';
    else if (decl && ts.isVariableDeclaration(decl) && decl.initializer && /as const/.test(decl.initializer.getText())) kind = 'const';
    else if (/^[A-Z][A-Z_0-9]+$/.test(name)) kind = 'CONST_TABLE';
    else if (/^use[A-Z]/.test(name)) kind = 'hook';
    else if (t.getCallSignatures().length) kind = /Variants$/.test(name) ? 'cva-recipe' : 'function';
    else kind = 'value';
  }
  const imp = importers.get(target) ? [...importers.get(target)].filter((f) => f !== file) : [];
  const simp = storyImporters.get(target) ? [...storyImporters.get(target)] : [];
  rows.push({ name, kind, file, line, inDist: distNames.has(name), imp, simp, docs: docMentions(name), typeStr });
}
const names = new Set(rows.map((r) => r.name));
const out = [];
out.push(`# ${rows.length} exports of src/index.ts; dist names ${distNames.size}`);
const missingInDist = rows.filter((r) => !r.inDist).map((r) => r.name);
const extraInDist = [...distNames].filter((n) => !names.has(n));
out.push('src-not-in-dist: ' + missingInDist.join(', '));
out.push('dist-not-in-src: ' + extraInDist.join(', '));
const byKind = {};
for (const r of rows) (byKind[r.kind] ||= []).push(r);
for (const k of Object.keys(byKind)) out.push(`kind ${k}: ${byKind[k].length}`);
out.push('');
out.push('# non-component, non-const, non-type VALUE exports (helpers/recipes/hooks/tables)');
for (const r of rows) if (!['component', 'const', 'type'].includes(r.kind)) out.push(['NONCOMP', r.name, r.kind, `${r.file}:${r.line}`, 'internal-importers=[' + r.imp.join(', ') + ']', 'story-importers=' + r.simp.length, 'docs=[' + r.docs.join(', ') + ']', r.typeStr].join(' | '));
out.push('');
out.push('# components and whether <Name>Props is exported');
for (const r of rows) if (r.kind === 'component') { const p = r.name + 'Props'; out.push(['COMP', r.name, `${r.file}:${r.line}`, names.has(p) ? 'Props-exported' : 'NO-PROPS-EXPORT', 'docs=' + r.docs.length].join(' | ')); }
out.push('');
out.push('# type-only exports (name | file)');
for (const r of rows) if (r.kind === 'type') out.push(['TYPE', r.name, `${r.file}:${r.line}`, 'docs=' + r.docs.length, 'importers=' + r.imp.length].join(' | '));
out.push('');
out.push('# consts');
for (const r of rows) if (r.kind === 'const') out.push(['CONST', r.name, `${r.file}:${r.line}`, 'docs=[' + r.docs.join(', ') + ']'].join(' | '));
fs.writeFileSync(ROOT + '/docs/audit/_work/scratch/HA/surface.out.txt', out.join('\n'));
console.log(out.join('\n'));
