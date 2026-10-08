// Shared loader: builds a TS Program over the repo's src/ (read-only).
const path = require('path');
const fs = require('fs');
const ts = require('C:/Users/stick/Github/dooph/dooph-ds-audit-build/node_modules/typescript');
const ROOT = 'C:/Users/stick/Github/dooph/dooph-Design-System';
const SRC = ROOT + '/src';

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = dir + '/' + e.name;
    if (e.isDirectory()) walk(p, out);
    else if (/\.(ts|tsx)$/.test(e.name)) out.push(p);
  }
  return out;
}
const allFiles = walk(SRC);
const isStory = (f) => /\.stories\.tsx?$/.test(f);
const isTest = (f) => /\.test\.tsx?$/.test(f);
const srcFiles = allFiles.filter((f) => !isStory(f) && !isTest(f));

const options = {
  target: ts.ScriptTarget.ES2020,
  jsx: ts.JsxEmit.ReactJSX,
  strict: true,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  module: ts.ModuleKind.ESNext,
  skipLibCheck: true,
  noEmit: true,
  lib: ['lib.es2020.d.ts', 'lib.dom.d.ts', 'lib.dom.iterable.d.ts'],
};
let program, checker;
function load() {
  if (!program) {
    program = ts.createProgram(allFiles, options);
    checker = program.getTypeChecker();
  }
  return { ts, program, checker };
}
const rel = (f) => path.relative(ROOT, f).replace(/\\/g, '/');
function lineOf(node) {
  const sf = node.getSourceFile();
  return sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1;
}
function hasUseClient(sf) {
  for (const st of sf.statements) {
    if (ts.isExpressionStatement(st) && ts.isStringLiteral(st.expression)) {
      if (st.expression.text === 'use client') return true;
      continue;
    }
    break;
  }
  return false;
}
function isExported(node) {
  return !!(ts.getCombinedModifierFlags(node) & ts.ModifierFlags.Export);
}
module.exports = { ts, ROOT, SRC, allFiles, srcFiles, isStory, isTest, load, rel, lineOf, hasUseClient, isExported };
