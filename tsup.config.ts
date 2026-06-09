import { execSync } from 'node:child_process';

import { defineConfig } from 'tsup';

function emitTailwindCss() {
  execSync('npx tailwindcss -i src/styles/index.css -o dist/styles.css', {
    stdio: 'inherit',
    cwd: process.cwd(),
  });
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
    emitTailwindCss();
  },
});
