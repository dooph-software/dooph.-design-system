#!/usr/bin/env node
/*
 * dooph Design System — v4 → v5 codemod.
 *
 * Two jobs, deliberately separated:
 *   AUTO   — pure renames, identical rendering. Applied with --write.
 *   REPORT — the danger palette, which was redesigned rather than renamed.
 *            There is no correct mechanical mapping, so this script refuses to
 *            guess and prints file:line for a human instead.
 *
 * Usage:
 *   node codemod.mjs [dir]            # dry run, prints everything
 *   node codemod.mjs [dir] --write    # apply the AUTO renames
 *
 * Exit 1 while any REPORT item remains, so CI can gate on it.
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

/* Removed in v5. `ButtonVariant.danger` is now a secondary-surface button with
 * error-coloured text that fills on hover, not a solid red one — so these have
 * no one-to-one replacement. */
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

console.log("\n== NEEDS A HUMAN: the danger palette was redesigned ==");
if (!manual.length) {
  console.log("  none found");
} else {
  for (const m of manual) {
    console.log(`  ${m.file}:${m.line}  [${m.kind}]  ${m.text}`);
  }
  console.log(`
  The nine --ui-color-danger* tokens are gone, and so are the Tailwind classes
  they generated. Overriding a token that no longer exists fails SILENTLY, and a
  removed utility class produces no rule at all.

  v5's danger button is a secondary surface with error-coloured text that fills
  on hover/active. Retune it through:
    --ui-color-error-primary     the resting text colour and the active fill
    --ui-color-error-secondary   the hover fill
    --ui-color-secondary*        the surface and border it sits on

  For your own markup, the nearest equivalents are bg-error-primary /
  text-error-primary / border-error-primary. There is no replacement for
  *-danger-fg, *-danger-disabled, or the *-danger-border-* trio; decide those
  against the new two-colour model rather than mapping them one to one.`);
}

if (!WRITE && renamed.length) {
  console.log("\nRe-run with --write to apply the renames.");
}
process.exit(manual.length ? 1 : 0);
