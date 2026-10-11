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
 *   node codemod.mjs [path]            # dry run, prints everything
 *   node codemod.mjs [path] --write    # apply the AUTO renames
 *
 * Exit code (CI gates on it, so it must mean "work pending"):
 *   1  a dry run found AUTO renames still to apply, or a REPORT item remains
 *   2  the path could not be read (missing, or a folder under it unreadable)
 *   0  otherwise
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

/* A path that cannot be read is reported and fails the run with 2. Swallowing
 * it would let a typo'd path, or an unreadable folder, pass as "nothing to do". */
const unreadable = [];

function walk(dir, out = []) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch (err) {
    unreadable.push({ path: dir, code: err.code ?? err.message });
    return out;
  }
  for (const name of entries) {
    if (SKIP.has(name)) continue;
    const p = join(dir, name);
    let st;
    try {
      st = statSync(p);
    } catch (err) {
      // Only a source file we would have scanned fails the run; a dangling
      // non-source symlink (a socket, a stale .env link) is not pending work.
      if (EXT.has(extname(p))) {
        unreadable.push({ path: p, code: err.code ?? err.message });
      }
      continue;
    }
    if (st.isDirectory()) walk(p, out);
    else if (EXT.has(extname(p))) out.push(p);
  }
  return out;
}

let rootStat;
try {
  rootStat = statSync(ROOT);
} catch (err) {
  console.error(`codemod: cannot read ${ROOT} (${err.code ?? err.message})`);
  process.exit(2);
}
const files = rootStat.isDirectory() ? walk(ROOT) : [ROOT];

const renamed = [];
const manual = [];

for (const file of files) {
  let before;
  try {
    before = readFileSync(file, "utf8");
  } catch (err) {
    unreadable.push({ path: file, code: err.code ?? err.message });
    continue;
  }
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
    // Doc-comment lines (` * …`, ` */`). Not a CSS universal selector (`* {`).
    if (/^\s*\*(\s|\/|$)/.test(line) && !/^\s*\*\s*[{,>+~]/.test(line)) return;
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

if (unreadable.length) {
  console.error("\n== COULD NOT READ ==");
  for (const u of unreadable) console.error(`  ${u.path}  (${u.code})`);
}

const renamesPending = !WRITE && renamed.length > 0;
if (renamesPending) {
  console.log("\nRe-run with --write to apply the renames.");
}
process.exit(unreadable.length ? 2 : renamesPending || manual.length ? 1 : 0);
