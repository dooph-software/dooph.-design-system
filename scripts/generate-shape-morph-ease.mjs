/*
 * Writes the shape-morph spring into tokens.css between the
 * __SHAPE_MORPH_EASE_START__ / __SHAPE_MORPH_EASE_END__ markers.
 * Run: npm run generate-shape-morph-ease (also runs as part of `npm run build`).
 */
import { readFileSync, writeFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { buildEase } from "./shapeMorphSpring.mjs";

const TOKENS_PATH = resolve(dirname(fileURLToPath(import.meta.url)), "../src/styles/tokens.css");
const START = "/* __SHAPE_MORPH_EASE_START__ */";
const END = "/* __SHAPE_MORPH_EASE_END__ */";

const src = readFileSync(TOKENS_PATH, "utf8");
const i = src.indexOf(START);
const j = src.indexOf(END);
if (i < 0 || j < 0) throw new Error("tokens.css is missing the shape-morph ease markers");

const { durationMs, ease } = buildEase();
const block = `${START}\n  --ui-shape-morph-duration: ${durationMs}ms;\n  --ui-shape-morph-ease: ${ease};\n  ${END}`;
writeFileSync(TOKENS_PATH, src.slice(0, i) + block + src.slice(j + END.length));
console.log(`shape-morph ease: ${durationMs}ms, ${ease.length} chars`);
