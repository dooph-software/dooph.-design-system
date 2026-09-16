#!/usr/bin/env node
/*
 * dooph Design System — v4 → v5 codemod.
 *
 * Two jobs, deliberately separated:
 *   AUTO   — pure renames, identical rendering. Applied with --write.
 *   REPORT — the danger palette, whose DEFAULTS were redesigned. It is not a
 *            rename, so this script refuses to guess and prints file:line for a
 *            human to eyeball instead.
 *
 * Usage:
 *   node codemod.mjs [dir]            # dry run, prints everything
 *   node codemod.mjs [dir] --write    # apply the AUTO renames
 *
 * The danger report is ADVISORY and does not fail the run: 5.4 reinstated every
 * --ui-color-danger* token under its v4 name, so a v4 override once again lands
 * in a real slot, and gating CI on its mere presence would fail correct code.
 * What changed is what those slots DEFAULT to — a visual check, which no exit
 * code can stand in for.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const args = process.argv.slice(2);
const WRITE = args.includes("--write");
const ROOT = args.find((a) => !a.startsWith("-")) ?? ".";

const SKIP = new Set([
  "node_modules", ".git", "dist", "build", ".next", "out", "coverage",
  ".turbo", ".cache", "storybook-static",
]);
const EXT = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".css"]);

/* Renamed exports. Same glyph in both cases — v4's `BarChartIcon` is v5's
 * `BarChartAxesIcon`, and v5 reused the free name for a DIFFERENT, axis-less
 * chart. Left alone, `BarChartIcon` keeps compiling and quietly renders the
 * wrong icon, which is why this rename is worth running even though nothing
 * breaks without it. */
const RENAMES = {
  SiloIcon: "DiscPlatterDBIcon",
  BarChartIcon: "BarChartAxesIcon",
};

/* Removed in v5, reinstated in 5.4 under the SAME names. `ButtonVariant.danger`
 * is a secondary-surface button with danger-coloured text that fills on hover,
 * not v4's solid red one — so the slots line up but their defaults do not. */
const DANGER_TOKEN = /--ui-color-danger(?:-[a-z-]+)?/g;
const DANGER_CLASS =
  /(?<![\w-])(?:[a-z-]+:)*(?:bg|text|border|ring|outline|fill|stroke|from|via|to)-danger(?:-[a-z]+)*(?![\w-])/g;

function walk(dir, out = []) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const name of entries) {
    if (SKIP.has(name)) continue;
    const p = join(dir, name);
    let st;
    try {
      st = statSync(p);
    } catch {
      continue;
    }
    if (st.isDirectory()) walk(p, out);
    else if (EXT.has(extname(p))) out.push(p);
  }
  return out;
}

const renamed = [];
const manual = [];

for (const file of walk(ROOT)) {
  const before = readFileSync(file, "utf8");
  let after = before;

  for (const [from, to] of Object.entries(RENAMES)) {
    // Identifier boundaries, so BarChartIconWrapper and "silo-icon" are safe.
    const re = new RegExp(`(?<![\\w$])${from}(?![\\w$])`, "g");
    const hits = after.match(re);
    if (hits) {
      renamed.push({ file, from, to, count: hits.length });
      after = after.replace(re, to);
    }
  }

  if (WRITE && after !== before) writeFileSync(file, after, "utf8");

  before.split("\n").forEach((line, i) => {
    if (line.trimStart().startsWith("*")) return; // doc comments
    for (const [re, kind] of [
      [DANGER_TOKEN, "token"],
      [DANGER_CLASS, "class"],
    ]) {
      re.lastIndex = 0;
      for (const m of line.matchAll(re)) {
        manual.push({ file, line: i + 1, kind, text: m[0] });
      }
    }
  });
}

const plural = (n, s) => `${n} ${s}${n === 1 ? "" : "s"}`;

console.log(
  WRITE ? "\n== APPLIED (renames) ==" : "\n== WOULD RENAME (dry run) ==",
);
if (!renamed.length) console.log("  nothing to rename");
for (const r of renamed) {
  console.log(`  ${r.file}  ${r.from} -> ${r.to}  (${plural(r.count, "use")})`);
}

console.log("\n== WORTH A LOOK: the danger palette was redesigned ==");
if (!manual.length) {
  console.log("  none found");
} else {
  for (const m of manual) {
    console.log(`  ${m.file}:${m.line}  [${m.kind}]  ${m.text}`);
  }
  console.log(`
  These tokens and classes EXIST again as of 5.4, under their v4 names — v5
  removed them and 5.4 brought the whole family back. So nothing here is
  broken, and this list is advisory rather than a failure.

  What changed is the DEFAULTS. v4's danger button was solid red; today's is a
  secondary surface carrying danger-coloured text that fills on hover/active,
  and every --ui-color-danger* token now defaults to an alias expressing that:
    --ui-color-danger / -border / -disabled   alias the SECONDARY family
    --ui-color-danger-hover                   aliases --ui-color-danger-secondary
    --ui-color-danger-active / -foreground    alias --ui-color-danger-primary

  A v4 override therefore still lands in a real slot, but it is pinning one
  step of a design that no longer looks the way it did. Open each occurrence
  above, decide whether the override is still what you want, and check the
  result in a browser.`);
}

if (!WRITE && renamed.length) {
  console.log("\nRe-run with --write to apply the renames.");
}
process.exit(0);
