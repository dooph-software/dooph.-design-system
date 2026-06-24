// Post-build pass: stamp a leading `"use client"` directive onto exactly the
// dist chunks that contain client-only source modules.
//
// Why a post-build script instead of an esbuild/tsup plugin:
// tsup runs esbuild with `write: false` and writes the output itself. esbuild's
// `OutputFile.text` is a getter closure-cached over the ORIGINAL contents, so a
// plugin that mutates `file.contents` in `onEnd` is silently ignored on write.
// Running here — after tsup has flushed the real files to disk — is reliable.
//
// How it decides which outputs to stamp:
// 1. Scan src/ for modules whose first lines carry a "use client" directive
//    (the source of truth — kept in lockstep with the component files).
// 2. Read tsup's emitted metafiles (dist/metafile-esm.json + metafile-cjs.json),
//    which map every output chunk to the exact input modules bundled into it.
// 3. Any output whose inputs include a client source gets the directive prepended
//    as its very first line (before imports/requires). Pure modules (cn, types,
//    icons, BaseText, Shapes) never match, so they stay server-safe.

import {
  existsSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';

const cwd = process.cwd();
const SRC_DIR = path.resolve(cwd, 'src');
const DIST_DIR = path.resolve(cwd, 'dist');
const DIRECTIVE = 'use client';

const toPosix = (p) => p.split(path.sep).join('/');

/** True if a source file declares the directive within its prologue. */
function hasDirective(contents) {
  // Inspect the first handful of non-empty lines; the directive must precede
  // imports, but allow a leading BOM/comment-free blank prologue.
  const lines = contents.split('\n').slice(0, 5);
  return lines.some((line) => {
    const t = line.trim();
    return (
      t === `"${DIRECTIVE}";` ||
      t === `'${DIRECTIVE}';` ||
      t === `"${DIRECTIVE}"` ||
      t === `'${DIRECTIVE}'`
    );
  });
}

/** Recursively collect client source modules, keyed as posix paths relative to cwd. */
function collectClientSources(dir, acc) {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) {
      collectClientSources(full, acc);
    } else if (/\.(ts|tsx|js|jsx)$/.test(entry)) {
      if (hasDirective(readFileSync(full, 'utf8'))) {
        acc.add(toPosix(path.relative(cwd, full)));
      }
    }
  }
  return acc;
}

function loadMetafile(file) {
  const full = path.resolve(DIST_DIR, file);
  if (!existsSync(full)) return null;
  return JSON.parse(readFileSync(full, 'utf8'));
}

function alreadyStamped(contents) {
  const first = contents.replace(/^﻿/, '').trimStart().split('\n')[0]?.trim();
  return first === `"${DIRECTIVE}";` || first === `'${DIRECTIVE}';`;
}

function run() {
  const clientSources = collectClientSources(SRC_DIR, new Set());
  if (clientSources.size === 0) {
    console.warn('[add-use-client] no client sources found — nothing to stamp.');
    return;
  }

  const metafiles = ['metafile-esm.json', 'metafile-cjs.json']
    .map(loadMetafile)
    .filter(Boolean);

  if (metafiles.length === 0) {
    throw new Error(
      '[add-use-client] no tsup metafiles found in dist/. Ensure `metafile: true` in tsup.config.ts.',
    );
  }

  const stamped = new Set();

  for (const meta of metafiles) {
    for (const [outPath, info] of Object.entries(meta.outputs)) {
      if (!/\.(js|cjs|mjs)$/.test(outPath)) continue; // skip .map etc.
      const inputs = Object.keys(info.inputs ?? {});
      const isClient = inputs.some((input) => clientSources.has(toPosix(input)));
      if (!isClient) continue;

      const full = path.resolve(cwd, outPath);
      if (!existsSync(full)) continue;
      const contents = readFileSync(full, 'utf8');
      if (alreadyStamped(contents)) continue;
      writeFileSync(full, `"${DIRECTIVE}";\n${contents}`);
      stamped.add(toPosix(outPath));
    }
  }

  // Clean up the metafiles so they don't ship in the published package.
  for (const file of ['metafile-esm.json', 'metafile-cjs.json']) {
    const full = path.resolve(DIST_DIR, file);
    if (existsSync(full)) rmSync(full);
  }

  console.log(
    `[add-use-client] stamped "use client" on ${stamped.size} output chunk(s) from ${clientSources.size} client source module(s).`,
  );
}

run();
