// U1 token pipeline audit script (read-only). Run from repo root:
//   node docs/audit/_work/scratch/U1/tokens.mjs
import { readFileSync, readdirSync, statSync } from "fs";
import { join, relative } from "path";

const ROOT = process.cwd();
const rd = (p) => readFileSync(join(ROOT, p), "utf8");
const stripCss = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "");
// Strip JS/TS comments (block + line). Crude but fine for token scanning.
const stripTs = (s) =>
  s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'`\\])\/\/.*$/gm, "$1");

function walk(dir, out = []) {
  for (const n of readdirSync(join(ROOT, dir))) {
    const p = join(dir, n);
    const st = statSync(join(ROOT, p));
    if (st.isDirectory()) walk(p, out);
    else out.push(p.replace(/\\/g, "/"));
  }
  return out;
}

// ── A. tokens.css blocks ──────────────────────────────────────────────────
const tokensRaw = rd("src/styles/tokens.css");
const tokensCss = stripCss(tokensRaw);
function block(css, selRe) {
  const m = css.match(selRe);
  if (!m) throw new Error("block not found " + selRe);
  let i = m.index + m[0].length, depth = 1, start = i;
  while (depth) { if (css[i] === "{") depth++; else if (css[i] === "}") depth--; i++; }
  return css.slice(start, i - 1);
}
function decls(b) {
  const map = new Map();
  // declarations separated by ; at top level (values may contain parens)
  let depth = 0, cur = "";
  for (const ch of b) {
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    if (ch === ";" && depth === 0) { push(cur); cur = ""; } else cur += ch;
  }
  push(cur);
  function push(d) {
    const m = d.match(/^\s*(--ui-[\w-]+)\s*:\s*([\s\S]*)$/);
    if (m) map.set(m[1], m[2].replace(/\s+/g, " ").trim());
  }
  return map;
}
const root = decls(block(tokensCss, /:root\s*,\s*\.light\s*\{/));
const dark = decls(block(tokensCss, /\.dark\s*\{/));
const allTokens = [...root.keys()];

// ── B. generated theme block ──────────────────────────────────────────────
const indexRaw = rd("src/styles/index.css");
const gen = indexRaw.slice(
  indexRaw.indexOf("/* __GENERATED_THEME_START__ */"),
  indexRaw.indexOf("/* __GENERATED_THEME_END__ */"),
);
const themeMap = new Map(); // ui token -> theme key
for (const m of gen.matchAll(/(--[\w-]+):\s*var\((--ui-[\w-]+)\)/g)) themeMap.set(m[2], m[1]);
const computed = [...gen.matchAll(/(--[\w-]+):\s*([^;]*var\((--ui-[\w-]+)\)[^;]*);/g)]
  .filter((m) => !m[2].trim().startsWith("var("));

// ── C. usage scan ─────────────────────────────────────────────────────────
const files = walk("src").filter((f) => /\.(tsx?|css)$/.test(f));
const cats = { comp: [], story: [], css: [] };
for (const f of files) {
  if (f === "src/styles/tokens.css" || f === "src/styles/theme.css") continue;
  if (f.endsWith(".css")) cats.css.push(f);
  else if (/\.stories\.tsx$/.test(f)) cats.story.push(f);
  else cats.comp.push(f);
}
const content = {};
for (const f of cats.comp.concat(cats.story)) content[f] = stripTs(rd(f));
for (const f of cats.css) {
  let c = rd(f);
  if (f.endsWith("index.css")) c = c.replace(gen, ""); // drop generated block
  content[f] = stripCss(c);
}
const tokRe = (t) => new RegExp(t.replace(/[-]/g, "\\-") + "(?![\\w-])", "g");
// dynamic: ShapeMorphSpinner `var(--ui-size-spinner-${size})`
const dynamicUsed = new Set(["--ui-size-spinner-sm", "--ui-size-spinner-rg", "--ui-size-spinner-md", "--ui-size-spinner-xl"]);

// token-to-token alias references in tokens.css (both blocks)
const aliasRefs = new Map(allTokens.map((t) => [t, new Set()])); // t -> tokens that reference t
for (const [src, val] of [...root, ...dark]) {
  for (const m of val.matchAll(/var\((--ui-[\w-]+)/g)) if (aliasRefs.has(m[1])) aliasRefs.get(m[1]).add(src);
}

// dist utilities: parse dist-styles.css rules, collect selectors per token outside token blocks
const dist = stripCss(rd("docs/audit/_work/dist-styles.css"));
const distRules = []; // {sel, body}
(function parse(css, stack) {
  let i = 0;
  while (i < css.length) {
    const open = css.indexOf("{", i);
    if (open < 0) break;
    const semi = css.indexOf(";", i);
    if (semi >= 0 && semi < open) { i = semi + 1; continue; } // @import / @layer stmt
    const prelude = css.slice(i, open).trim();
    let d = 1, j = open + 1;
    while (d) { if (css[j] === "{") d++; else if (css[j] === "}") d--; j++; }
    const body = css.slice(open + 1, j - 1);
    if (body.includes("{")) parse(body, stack.concat(prelude));
    else distRules.push({ sel: prelude, stack, body });
    i = j;
  }
})(dist, []);
const utilUse = new Map(allTokens.map((t) => [t, new Set()]));
for (const r of distRules) {
  if (/^(:root, \.light|\.dark)$/.test(r.sel)) continue;
  if (r.stack.some((s) => s.startsWith("@layer theme") || s.startsWith("@keyframes") || s.startsWith("@property"))) continue;
  if (/^\.(ds-|text-style-)|^\.(h-button|h-button-sm|size-button|size-button-sm|size-checkbox|size-code-digit|size-button-micro|h-tab-micro|size-tab-micro|min-h-button|min-w-button|h-slider-track)\b/.test(r.sel)) continue;
  for (const m of r.body.matchAll(/var\((--ui-[\w-]+)/g)) if (utilUse.has(m[1])) utilUse.get(m[1]).add(r.sel);
}

// docs
const contract = rd("skills/dooph-design-system-theming/references/token-contract.md");
const docTokens = new Set([...contract.matchAll(/--ui-[\w-]+[\w]/g)].map((m) => m[0]));
const themingSkill = rd("skills/dooph-design-system-theming/SKILL.md");
const docTokens2 = new Set([...themingSkill.matchAll(/--ui-[\w-]+[\w]/g)].map((m) => m[0]));

const rows = [];
for (const t of allTokens) {
  const where = { comp: [], story: [], css: [] };
  for (const [cat, list] of Object.entries(cats))
    for (const f of list) if (tokRe(t).test(content[f])) where[cat].push(relative(ROOT, f).replace(/\\/g, "/").replace(/^src\//, ""));
  rows.push({ t, where, alias: [...aliasRefs.get(t)], util: [...utilUse.get(t)], theme: themeMap.get(t) || null, doc: docTokens.has(t), doc2: docTokens2.has(t), dyn: dynamicUsed.has(t) });
}
// transitive: used if direct use OR referenced by a used token
const direct = (r) => r.where.comp.length || r.where.css.length || r.util.length || r.dyn;
const used = new Set(rows.filter(direct).map((r) => r.t));
let changed = true;
while (changed) {
  changed = false;
  for (const r of rows) if (!used.has(r.t) && r.alias.some((a) => used.has(a))) { used.add(r.t); changed = true; }
}

const mode = process.argv[2] || "summary";
if (mode === "full") {
  for (const r of rows) console.log(JSON.stringify(r));
} else {
  console.log("root tokens:", root.size, " dark tokens:", dark.size, " theme-mapped:", themeMap.size, " computed theme entries:", computed.map((c) => c[1]).join(","));
  console.log("\n== dark-only tokens (not in :root) ==");
  for (const t of dark.keys()) if (!root.has(t)) console.log(" ", t);
  console.log("\n== .dark value identical to :root value (R5.3) ==");
  for (const [t, v] of dark) if (root.get(t) === v) console.log(" ", t, "=", v);
  console.log("\n== UNUSED by package (no comp/css/utility/alias-from-used use) ==");
  for (const r of rows) if (!used.has(r.t)) console.log(" ", r.t, "| theme:", r.theme, "| story:", r.where.story.join(",") || "-", "| contract-doc:", r.doc, "| theming-skill:", r.doc2);
  console.log("\n== used ONLY via alias chain (no direct use) ==");
  for (const r of rows) if (used.has(r.t) && !direct(r)) console.log(" ", r.t, "<-", r.alias.join(","));
  console.log("\n== tokens NOT mentioned in token-contract.md ==");
  const undoc = rows.filter((r) => !r.doc).map((r) => r.t);
  console.log(" count", undoc.length); for (const t of undoc) console.log(" ", t, docTokens2.has(t) ? "(in theming SKILL.md)" : "");
  console.log("\n== token-contract.md mentions that do not exist in tokens.css ==");
  for (const t of docTokens) if (!root.has(t) && !dark.has(t)) console.log(" ", t);
  console.log("\n== theming SKILL.md mentions that do not exist ==");
  for (const t of docTokens2) if (!root.has(t) && !dark.has(t)) console.log(" ", t);
}
