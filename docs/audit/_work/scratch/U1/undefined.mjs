// --ui-* names referenced in src (code, comments stripped) that tokens.css does not define.
// Run from repo root: node docs/audit/_work/scratch/U1/undefined.mjs
import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";
const walk = (d, o = []) => { for (const n of readdirSync(d)) { const p = join(d, n); statSync(p).isDirectory() ? walk(p, o) : o.push(p); } return o; };
const tok = readFileSync("src/styles/tokens.css", "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
const defined = new Set([...tok.matchAll(/(--ui-[\w-]+)\s*:/g)].map((m) => m[1]));
const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'`\\])\/\/.*$/gm, "$1");
const out = {};
for (const f of walk("src").filter((f) => /\.(tsx?|css)$/.test(f))) {
  const c = strip(readFileSync(f, "utf8"));
  for (const m of c.matchAll(/(--ui-[a-z0-9-]*[a-z0-9])(?![\w$-])/g)) {
    if (!defined.has(m[1])) (out[m[1]] ||= new Set()).add(f.replace(/\\/g, "/"));
  }
}
for (const [k, v] of Object.entries(out)) console.log(k, [...v].join(","));
console.log("defined:", defined.size, " undefined-referenced:", Object.keys(out).length);
