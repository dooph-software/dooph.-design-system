/*
 * Writes the shape-morph spring into tokens.css between the
 * __SHAPE_MORPH_EASE_START__ / __SHAPE_MORPH_EASE_END__ markers.
 * Run: npm run generate-shape-morph-ease (also runs as part of `npm run build`).
 * Check only: node scripts/generate-shape-morph-ease.mjs --check computes the
 * block in memory, writes NOTHING, prints `stale src/styles/tokens.css` and
 * exits 1 when the block on disk differs (CRLF and LF count as equal), else
 * exits 0. scripts/check-conventions.mjs runs it inside `npm run lint`.
 */
import { readFileSync, writeFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { buildEase } from "./shapeMorphSpring.mjs";

const TOKENS_PATH = resolve(dirname(fileURLToPath(import.meta.url)), "../src/styles/tokens.css");
const START = "/* __SHAPE_MORPH_EASE_START__ */";
const END = "/* __SHAPE_MORPH_EASE_END__ */";
const CHECK = process.argv.includes("--check");

const src = readFileSync(TOKENS_PATH, "utf8");
const i = src.indexOf(START);
const j = src.indexOf(END);
if (i < 0 || j < 0) throw new Error("tokens.css is missing the shape-morph ease markers");

const { durationMs, ease } = buildEase();
const block = `${START}\n  --ui-shape-morph-duration: ${durationMs}ms;\n  --ui-shape-morph-ease: ${ease};\n  ${END}`;
const next = src.slice(0, i) + block + src.slice(j + END.length);

if (CHECK) {
  const lf = (s) => s.replace(/\r\n/g, "\n");
  if (lf(next) !== lf(src)) {
    console.log("stale src/styles/tokens.css");
    console.log("generate-shape-morph-ease --check: the shape-morph ease block is out of date; run `npm run generate-shape-morph-ease`.");
    process.exit(1);
  }
  console.log("generate-shape-morph-ease --check: the shape-morph ease block is fresh.");
  process.exit(0);
}

writeFileSync(TOKENS_PATH, next);
console.log(`shape-morph ease: ${durationMs}ms, ${ease.length} chars`);
