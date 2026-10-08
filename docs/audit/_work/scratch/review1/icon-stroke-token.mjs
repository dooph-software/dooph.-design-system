#!/usr/bin/env node
// Route every icon's stroke width through BaseIcon's token default
// (--ui-icon-stroke-width). Deterministic: strips any hardcoded
// strokeWidth / stroke-width from src/components/Icons/*Icon.tsx —
// JSX attributes (strokeWidth={1.5}, strokeWidth="1.5", stroke-width="1.5")
// and style-object keys (strokeWidth: 1.5). Filled glyphs carry none, so they
// are untouched. BaseIcon.tsx is not an *Icon.tsx leaf and is never edited:
// its `strokeWidth ?? "var(--ui-icon-stroke-width)"` keeps consumer overrides.
//
//   node docs/audit/_work/scratch/review1/icon-stroke-token.mjs           # apply
//   node docs/audit/_work/scratch/review1/icon-stroke-token.mjs --verify  # check only
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../../../..");
const dir = join(root, "src/components/Icons");
const verify = process.argv.includes("--verify");

const ATTR = /\s+(?:strokeWidth|stroke-width)\s*=\s*(?:\{[^}]*\}|"[^"]*"|'[^']*')/g;
const STYLE_KEY = /\s*\b(?:strokeWidth|"stroke-width"|'stroke-width')\s*:\s*[^,}\n]+,?/g;
const ANY = /strokeWidth|stroke-width/;

const files = readdirSync(dir).filter((f) => /Icon\.tsx$/.test(f) && f !== "BaseIcon.tsx").sort();
let changed = 0;
const left = [];
for (const f of files) {
  const p = join(dir, f);
  const src = readFileSync(p, "utf8");
  const out = src.replace(ATTR, "").replace(STYLE_KEY, "");
  if (out !== src) {
    changed++;
    if (!verify) writeFileSync(p, out);
    console.log(`${verify ? "WOULD CHANGE" : "changed"}: ${f}`);
  }
  if (ANY.test(verify ? src : out)) left.push(f);
}

const base = readFileSync(join(dir, "BaseIcon.tsx"), "utf8");
const tokens = readFileSync(join(root, "src/styles/tokens.css"), "utf8");
const problems = [];
if (left.length) problems.push(`stroke width still hardcoded in: ${left.join(", ")}`);
if (!base.includes('strokeWidth: strokeWidth ?? "var(--ui-icon-stroke-width)"'))
  problems.push("BaseIcon no longer defaults strokeWidth to the token (consumer override path)");
if (!/--ui-icon-stroke-width:\s*2;/.test(tokens)) problems.push("--ui-icon-stroke-width is not 2 in tokens.css");

console.log(`${files.length} icon leaves scanned; ${changed} ${verify ? "need changes" : "changed"}.`);
if (problems.length) {
  for (const m of problems) console.error(`FAIL: ${m}`);
  process.exit(1);
}
console.log("OK: every icon leaf takes its stroke width from --ui-icon-stroke-width (2); consumer strokeWidth still overrides.");
