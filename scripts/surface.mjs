#!/usr/bin/env node
// node scripts/surface.mjs <treeDir> <out.json>
//
// Extracts the public surface of a BUILT design-system tree (a scratch worktree
// after `npm ci && npm run build`; never the main checkout) into one JSON file:
//   exports      every export of dist/index.d.ts, with its kind
//   components   each component's own declared props (repo-source only)
//   consts       each const object's keys and values (flattened)
//   types        exported type aliases / interfaces (text + own members)
//   functions    exported function signatures
//   tokens       every --ui-* in src/styles/tokens.css, per block
//   themeVars    every custom property in dist/theme.css, per block
//   classes      every class selector in dist/styles.css
//   pkg          package.json exports / files / peerDependencies / bin (+ a few extras)
//
// The extraction steps live in scripts/lib/surface.mjs (shared with
// scripts/generate-docs.mjs, which reads source instead of dist): extractExports,
// extractProps, extractConstEntries, extractType, extractFunction, walkCss,
// extractTokens, extractClasses, extractPackage. Nothing here writes outside
// <out.json>. scripts/surface-diff.mjs diffs two of these files.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  loadTs,
  norm,
  sortObj,
  createDistProgram,
  probeSpecs,
  readProbe,
  extractExports,
  extractProps,
  extractConstEntries,
  extractType,
  extractFunction,
  extractTokens,
  extractClasses,
  extractPackage,
} from './lib/surface.mjs';

// ── Main ────────────────────────────────────────────────────────────────────
export function extractSurface(treeDir) {
  treeDir = resolve(treeDir);
  const ts = loadTs(treeDir);
  // Pass 1 finds the component names; pass 2 re-creates the program with the
  // probe file so every component's ComponentProps<typeof X> can be resolved.
  const pass1 = createDistProgram(ts, treeDir);
  const names = probeSpecs(ts, pass1.checker, extractExports(ts, pass1.checker, pass1.sf, treeDir));
  const { checker, sf, probe } = createDistProgram(ts, treeDir, names);
  const exps = extractExports(ts, checker, sf, treeDir);
  const { probeTypes, probeTypeAliases } = readProbe(checker, probe);

  const surface = {
    tree: treeDir,
    tsVersion: ts.version,
    exports: {},
    components: {},
    consts: {},
    types: {},
    functions: {},
  };
  for (const e of exps) {
    surface.exports[e.name] = { kind: e.kind, alsoType: e.alsoType, module: e.module, deprecated: e.deprecated };
    if (e.kind === 'component') surface.components[e.name] = { module: e.module, ...extractProps(ts, checker, e, treeDir, probeTypes.get(e.name)) };
    else if (e.kind === 'const') surface.consts[e.name] = { module: e.module, entries: extractConstEntries(ts, checker, e, treeDir) };
    else if (e.kind === 'function') surface.functions[e.name] = { module: e.module, signatures: extractFunction(ts, checker, e) };
    if (e.kind === 'type' || e.alsoType) surface.types[e.name] = { module: e.module, ...extractType(ts, checker, e, treeDir, probeTypeAliases.get(e.name)) };
  }
  for (const k of ['exports', 'components', 'consts', 'types', 'functions']) surface[k] = sortObj(surface[k]);

  surface.tokens = extractTokens(readFileSync(resolve(treeDir, 'src/styles/tokens.css'), 'utf8'));
  const themePath = resolve(treeDir, 'dist/theme.css');
  surface.themeVars = existsSync(themePath) ? extractTokens(readFileSync(themePath, 'utf8'), { prefix: '--' }) : null;
  surface.classes = extractClasses(readFileSync(resolve(treeDir, 'dist/styles.css'), 'utf8'));
  surface.pkg = extractPackage(JSON.parse(readFileSync(resolve(treeDir, 'package.json'), 'utf8')));
  return surface;
}

if (process.argv[1] && norm(resolve(process.argv[1])) === norm(fileURLToPath(import.meta.url))) {
  const [treeDir, outPath] = process.argv.slice(2);
  if (!treeDir || !outPath) {
    console.error('usage: node scripts/surface.mjs <treeDir> <out.json>');
    process.exit(2);
  }
  const s = extractSurface(treeDir);
  writeFileSync(outPath, JSON.stringify(s, null, 2) + '\n');
  const n = (o) => Object.keys(o ?? {}).length;
  console.log(
    `${outPath}: exports ${n(s.exports)}, components ${n(s.components)}, consts ${n(s.consts)}, types ${n(s.types)}, functions ${n(s.functions)}, token blocks ${n(s.tokens)}, classes ds ${s.classes.ds.length} / text-style ${s.classes.textStyle.length} / utilities ${s.classes.utilities.length}`,
  );
}
