// Lists every module-level export per non-story src module and diffs against
// the public surface (src/index.ts). Run from the audit build worktree so the
// typescript package resolves: node <this> <repoRoot>
const path = require('path');
const fs = require('fs');
const ts = require(path.join('C:/Users/stick/Github/dooph/dooph-ds-audit-build/node_modules/typescript'));
const root = process.argv[2];
const cfgPath = path.join(root, 'tsconfig.json');
const cfg = ts.getParsedCommandLineOfConfigFile(cfgPath, {}, { ...ts.sys, onUnRecoverableConfigFileDiagnostic: () => {} });
const program = ts.createProgram(cfg.fileNames, cfg.options);
const checker = program.getTypeChecker();
const idx = program.getSourceFile(path.join(root, 'src/index.ts').replace(/\\/g, '/'));
const pub = new Set(checker.getExportsOfModule(checker.getSymbolAtLocation(idx)).map((s) => s.getName()));
const rows = [];
for (const sf of program.getSourceFiles()) {
  const f = sf.fileName;
  if (!f.includes('/src/') || f.includes('node_modules') || /\.stories\.tsx$/.test(f) || /index\.ts$/.test(f)) continue;
  if (/Icons\/[A-Z]\w*Icon\.tsx$/.test(f) && !/BaseIcon/.test(f)) continue;
  const sym = checker.getSymbolAtLocation(sf);
  if (!sym) continue;
  const names = checker.getExportsOfModule(sym).map((s) => s.getName());
  const priv = names.filter((n) => !pub.has(n));
  rows.push(`${path.relative(root, f).replace(/\\/g, '/')} | public: ${names.filter((n) => pub.has(n)).join(', ')} | NOT public: ${priv.join(', ')}`);
}
console.log('public count', pub.size);
console.log(rows.join('\n'));
