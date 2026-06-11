/**
 * copy-theme.mjs
 *
 * Copies the generated Tailwind preset (src/styles/theme.css) into dist/ so it
 * can be published and imported by consumers as
 * `@dooph-software/design-system/theme.css`.
 *
 * Unlike styles.css, theme.css is NOT compiled by Tailwind here — it ships as
 * raw `@theme inline { … }` source that the CONSUMER's own Tailwind build reads.
 * So this is a plain file copy, not a build step.
 */

import { copyFileSync, mkdirSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(__dirname, "../src/styles/theme.css");
const DIST_DIR = resolve(__dirname, "../dist");
const DEST = resolve(DIST_DIR, "theme.css");

mkdirSync(DIST_DIR, { recursive: true });
copyFileSync(SRC, DEST);
console.log("✓  dist/theme.css copied.");
