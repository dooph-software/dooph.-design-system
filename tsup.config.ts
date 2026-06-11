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
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom', 'react/jsx-runtime'],
  treeshake: true,
  onSuccess: async () => {
    emitCssAssets();
  },
});
