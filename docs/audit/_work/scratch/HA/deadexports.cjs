// Task 4a: unused-export scan + unimported files.
const fs = require('fs');
const { ts, ROOT, srcFiles, allFiles, load, rel, lineOf, isStory, isTest } = require('./prog.cjs');
const { program, checker } = load();
const opts = program.getCompilerOptions();
const host = ts.createCompilerHost(opts);

const resolveAlias = (s) => (s && s.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(s) : s);

// public set
const idx = program.getSourceFile(ROOT + '/src/index.ts');
const publicTargets = new Set(checker.getExportsOfModule(checker.getSymbolAtLocation(idx)).map(resolveAlias));

// importer map: target symbol -> {src:Set, story:Set}
const imp = new Map();
const note = (t, f) => { if (!t) return; if (!imp.has(t)) imp.set(t, { src: new Set(), story: new Set() }); imp.get(t)[isStory(f) || isTest(f) ? 'story' : 'src'].add(rel(f)); };
// file graph
const importedBy = new Map(); // file -> Set(importer)
for (const f of allFiles) {
  const sf = program.getSourceFile(f);
  sf.forEachChild((n) => {
    if ((ts.isImportDeclaration(n) || ts.isExportDeclaration(n)) && n.moduleSpecifier) {
      const spec = n.moduleSpecifier.text;
      const r = ts.resolveModuleName(spec, f, opts, host).resolvedModule;
      if (r && r.resolvedFileName.replace(/\\/g, '/').startsWith(ROOT + '/src')) {
        const tgt = r.resolvedFileName.replace(/\\/g, '/');
        if (!importedBy.has(tgt)) importedBy.set(tgt, new Set());
        importedBy.get(tgt).add(rel(f));
      }
    }
    if (ts.isImportDeclaration(n) && n.importClause) {
      const ic = n.importClause;
      if (ic.name) note(resolveAlias(checker.getSymbolAtLocation(ic.name)), f);
      if (ic.namedBindings && ts.isNamedImports(ic.namedBindings)) ic.namedBindings.elements.forEach((e) => note(resolveAlias(checker.getSymbolAtLocation(e.name)), f));
      if (ic.namedBindings && ts.isNamespaceImport(ic.namedBindings)) {
        // namespace import: mark all exports of that module as used via ns
        const ms = checker.getSymbolAtLocation(n.moduleSpecifier);
        if (ms) checker.getExportsOfModule(ms).forEach((e) => note(resolveAlias(e), f));
      }
    }
    // named re-exports `export { X } from './y'` count as an importer (barrel)
    if (ts.isExportDeclaration(n) && n.exportClause && ts.isNamedExports(n.exportClause)) {
      n.exportClause.elements.forEach((e) => { const s = checker.getExportSpecifierLocalTargetSymbol(e); note(resolveAlias(s), f + '#reexport'); });
    }
  });
}

// own-file references count
function ownFileRefs(target, sf) {
  let c = 0;
  const decls = new Set(target.declarations || []);
  (function v(n) {
    if (ts.isIdentifier(n) && !decls.has(n.parent)) {
      const s = checker.getSymbolAtLocation(n);
      if (s && (s === target || resolveAlias(s) === target)) c++;
    }
    ts.forEachChild(n, v);
  })(sf);
  return c;
}

const out = [];
const deadRows = [];
for (const f of srcFiles) {
  const sf = program.getSourceFile(f);
  const ms = checker.getSymbolAtLocation(sf);
  if (!ms) continue;
  for (const e of checker.getExportsOfModule(ms)) {
    const t = resolveAlias(e);
    const decl = (t.declarations || [])[0];
    if (!decl || rel(decl.getSourceFile().fileName) !== rel(f)) continue; // only symbols DEFINED here
    if (e.name === 'default') continue; // default exports covered by U2-F5
    const isPublic = publicTargets.has(t);
    const u = imp.get(t) || { src: new Set(), story: new Set() };
    const srcImp = [...u.src].filter((x) => !x.startsWith(rel(f)) && !/index\.ts#reexport$/.test(x) && !/\/index\.ts$/.test(x));
    const barrelOnly = [...u.src].filter((x) => /index\.ts/.test(x));
    if (!isPublic && srcImp.length === 0) {
      const own = ownFileRefs(t, sf);
      deadRows.push(['NOT-PUBLIC-NOT-IMPORTED', e.name, `${rel(f)}:${lineOf(decl)}`, 'own-file-refs=' + own, 'story-importers=[' + [...u.story].join(', ') + ']', 'barrels=[' + barrelOnly.join(', ') + ']'].join(' | '));
    }
    if (isPublic && srcImp.length === 0 && u.story.size === 0) {
      out.push(['PUBLIC-NO-INTERNAL-OR-STORY-USE', e.name, `${rel(f)}:${lineOf(decl)}`].join(' | '));
    }
  }
}
const files = [];
for (const f of allFiles) {
  if (isStory(f) || /src\/index\.ts$/.test(f)) continue;
  const by = importedBy.get(f) ? [...importedBy.get(f)] : [];
  const nonStory = by.filter((x) => !/\.stories\.tsx$|\.test\.ts$/.test(x));
  if (nonStory.length === 0) files.push(['FILE-NOT-IMPORTED-BY-SRC', rel(f), 'importers=[' + by.join(', ') + ']'].join(' | '));
}
const all = ['# exported, not public, not imported by another src module', ...deadRows, '', '# public, never used internally nor in stories', ...out, '', '# files not imported by any non-story src module', ...files];
fs.writeFileSync(ROOT + '/docs/audit/_work/scratch/HA/deadexports.out.txt', all.join('\n'));
console.log(all.join('\n'));
