import { execSync } from 'node:child_process';
import { copyFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { defineConfig } from 'tsup';

// tsup runs with `clean: true`, which wipes dist/ before each build. Emitting
// both CSS assets here (rather than only in the build:css npm script) guarantees
// dist/styles.css and dist/theme.css are always regenerated together on any path
// that runs tsup — so the compiled stylesheet and the Tailwind preset can never
// drift apart or go missing on publish.
function emitCssAssets() {
  execSync('npx tailwindcss -i src/styles/index.css -o dist/styles.css', {
    stdio: 'inherit',
    cwd: process.cwd(),
  });
  // theme.css ships as raw @theme source (the consumer's Tailwind compiles it),
  // so it is copied, not compiled. Kept in sync by scripts/sync-theme.mjs.
  copyFileSync(
    resolve(process.cwd(), 'src/styles/theme.css'),
    resolve(process.cwd(), 'dist/theme.css'),
  );
}

export default defineConfig({
  // Every source module is its own entry point (Storybook stories excluded).
  // This makes tsup behave like Rollup's `preserveModules`: instead of inlining
  // the whole library into one barrel, each module emits its own dist file. That
  // is what lets per-module "use client" directives survive into dist — interactive
  // components keep the directive at the top of THEIR chunk, while pure/server-safe
  // modules (cn, types, icons, BaseText) stay free of it. dist/index.js remains the
  // single public entry, now re-exporting sibling chunks rather than an inlined blob.
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
    emitCssAssets();
  },
});
