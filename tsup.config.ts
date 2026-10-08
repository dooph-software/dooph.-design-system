import { execSync } from 'node:child_process';
import { readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { defineConfig } from 'tsup';

// tsup runs with clean: true, which wipes dist/ before each build. onSuccess
// re-emits both CSS assets through scripts/emit-css.mjs (the same script build:css
// runs), so dist/styles.css and dist/theme.css are always regenerated together on
// any path that runs tsup.

// tsup's CJS splitting emits maps whose only source is the output file itself
// (an absolute build-machine path, no sourcesContent), so they map nothing back
// to src/. Remove them and the comments that point at them; ESM maps stay.
function dropCjsSourceMaps(distDir: string) {
  for (const rel of readdirSync(distDir, { recursive: true }) as string[]) {
    const file = join(distDir, rel);
    if (rel.endsWith('.cjs.map')) {
      rmSync(file);
    } else if (rel.endsWith('.cjs')) {
      const contents = readFileSync(file, 'utf8');
      // Not anchored to a line start: an empty chunk is `"use strict";//# sourceMappingURL=…`.
      const stripped = contents.replace(/\/\/# sourceMappingURL=\S+\.cjs\.map\s*$/, '');
      if (stripped !== contents) writeFileSync(file, stripped);
    }
  }
}

export default defineConfig({
  // Every source module is its own entry point (Storybook stories excluded).
  // This makes tsup behave like Rollup's `preserveModules`: instead of inlining
  // the whole library into one barrel, each module emits its own dist file. That
  // is what lets per-module "use client" directives survive into dist — interactive
  // components keep the directive at the top of THEIR chunk, while pure/server-safe
  // modules (cn, types, icons, BaseText) stay free of it. dist/index.js remains the
  // single public entry, now re-exporting sibling chunks rather than an inlined blob.
  // The per-module .js/.cjs stubs and their maps are unreachable through `exports`
  // and are kept out of the tarball by package.json `files`; their .d.ts stay
  // because dist/index.d.ts references them.
  entry: ['src/**/*.{ts,tsx}', '!src/**/*.stories.tsx', '!src/**/*.test.{ts,tsx}'],
  format: ['esm', 'cjs'],
  dts: true,
  // `splitting` is required so esbuild keeps the module graph as separate chunks
  // (shared code is factored out instead of duplicated) — without it the barrel
  // would re-inline client code and the directive would land on the whole bundle.
  splitting: true,
  // metafile gives the post-build stamp (scripts/add-use-client.mjs) a precise
  // input→output map so it tags only the output chunks whose source actually
  // carried "use client". The stamp runs in onSuccess because tsup writes files
  // itself (esbuild `write: false`), so an esbuild plugin mutating outputFiles in
  // onEnd is ignored — the directive must be applied after the real files land.
  metafile: true,
  // ESM maps only; the CJS maps tsup emits map each file to itself, so onSuccess
  // removes them.
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom', 'react/jsx-runtime'],
  // NOTE: tsup's `treeshake` runs an extra Rollup pass that emits a
  // MODULE_LEVEL_DIRECTIVE warning for every "use client" file and strips the
  // directive anyway. The per-module output below already lets consumer bundlers
  // tree-shake (combined with the package "sideEffects" field), so we skip it to
  // keep the build warning-free and preserve directives cleanly.
  onSuccess: async () => {
    execSync('node scripts/add-use-client.mjs', { stdio: 'inherit', cwd: process.cwd() });
    dropCjsSourceMaps(join(process.cwd(), 'dist'));
    execSync('node scripts/emit-css.mjs', { stdio: 'inherit', cwd: process.cwd() });
  },
});
