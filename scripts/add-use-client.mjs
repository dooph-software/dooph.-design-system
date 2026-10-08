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
// 1. Scan src/ for modules whose directive prologue (after any header comment,
//    which R11.9 puts first) carries "use client". A "use client" line anywhere
//    else fails the build.
// 2. Read tsup's emitted metafiles (dist/metafile-esm.json + metafile-cjs.json),
//    which map every output chunk to the exact input modules bundled into it.
// 3. Any output whose inputs include a client source gets the directive prepended
//    as its very first line (before imports/requires). Pure modules (cn, types,
//    icons, BaseText, Shapes) never match, so they stay server-safe. The paired
//    `.map` is shifted down one generated line so stack traces stay aligned.

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

/** String-literal statements at the top of a module (its directive prologue),
 *  after a BOM, whitespace and comments — the same rule a JS parser applies. */
function prologueDirectives(contents) {
  const src = contents.replace(/^﻿/, '');
  const found = [];
  let i = 0;
  for (;;) {
    const ws = /\s*/y;
    ws.lastIndex = i;
    ws.exec(src);
    i = ws.lastIndex;
    if (src.startsWith('//', i)) {
      const nl = src.indexOf('\n', i);
      i = nl === -1 ? src.length : nl + 1;
      continue;
    }
    if (src.startsWith('/*', i)) {
      const end = src.indexOf('*/', i + 2);
      if (end === -1) return found;
      i = end + 2;
      continue;
    }
    const lit = /(["'])([^"'\\\n]*)\1[ \t]*;?/y;
    lit.lastIndex = i;
    const m = lit.exec(src);
    if (!m) return found;
    found.push(m[2]);
    i = lit.lastIndex;
  }
}

/** True if a source file declares the directive in its prologue. */
function hasDirective(contents) {
  return prologueDirectives(contents).includes(DIRECTIVE);
}

/** A `"use client"` line anywhere in the file (used to catch misplaced directives). */
const DIRECTIVE_LINE = /^\s*(["'])use client\1;?\s*$/m;

/** Recursively collect client source modules, keyed as posix paths relative to cwd. */
function collectClientSources(dir, acc) {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) {
      collectClientSources(full, acc);
    } else if (/\.(ts|tsx|js|jsx)$/.test(entry)) {
      const contents = readFileSync(full, 'utf8');
      if (hasDirective(contents)) {
        acc.add(toPosix(path.relative(cwd, full)));
      } else if (DIRECTIVE_LINE.test(contents)) {
        throw new Error(
          `[add-use-client] ${toPosix(path.relative(cwd, full))} has a "use client" line outside its directive prologue (only comments may precede it).`,
        );
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
      // The directive adds one line at the top; shift the paired source map by one
      // generated line (a leading ';' in `mappings`) so stack traces stay aligned.
      const mapPath = `${full}.map`;
      if (existsSync(mapPath)) {
        const map = JSON.parse(readFileSync(mapPath, 'utf8'));
        map.mappings = `;${map.mappings}`;
        writeFileSync(mapPath, JSON.stringify(map));
      }
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
