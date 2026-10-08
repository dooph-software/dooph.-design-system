/**
 * emit-css.mjs — the one CSS emit step. Called by tsup's onSuccess (every build)
 * and by `npm run build:css` (CSS-only iterations), so both produce the same files.
 *
 * 1. Compiles src/styles/index.css with the Tailwind CLI → dist/styles.css.
 * 2. Copies the generated preset src/styles/theme.css → dist/theme.css. It ships as
 *    raw `@theme inline` source that the CONSUMER's Tailwind compiles, so it is copied,
 *    not compiled. Kept in sync with index.css by scripts/sync-theme.mjs.
 */
import { execSync } from "child_process";
import { copyFileSync, mkdirSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DIST_DIR = resolve(ROOT, "dist");

mkdirSync(DIST_DIR, { recursive: true });
execSync("npx tailwindcss -i src/styles/index.css -o dist/styles.css", { stdio: "inherit", cwd: ROOT });
copyFileSync(resolve(ROOT, "src/styles/theme.css"), resolve(DIST_DIR, "theme.css"));
console.log("✓  dist/styles.css compiled, dist/theme.css copied.");
