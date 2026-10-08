// U10 audit scratch: pattern-verify src/components/Icons/*Icon.tsx leaves.
// Normalizes each file (component name -> __NAME__, geometry children -> __GEOMETRY__,
// quotes -> ", whitespace collapsed), groups by normalized text, prints the dominant
// shape and every outlier, plus per-file checks.
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
const root = path.resolve(process.argv[2] ?? ".");
const dir = path.join(root, "src/components/Icons");
const files = readdirSync(dir).filter((f) => /Icon\.tsx$/.test(f) && f !== "BaseIcon.tsx").sort();
const indexSrc = readFileSync(path.join(dir, "index.ts"), "utf8");
const indexNames = new Set([...indexSrc.matchAll(/export \{ (\w+) \} from "\.\/(\w+)";/g)].map((m) => { if (m[1] !== m[2]) console.log("INDEX NAME/PATH MISMATCH", m[1], m[2]); return m[1]; }));
const groups = new Map();
const checks = [];
for (const f of files) {
  const name = f.replace(/\.tsx$/, "");
  const src = readFileSync(path.join(dir, f), "utf8");
  // geometry = everything between the BaseIcon opening tag and its closing tag
  const open = src.search(/<BaseIcon\b[^>]*>/);
  const openEnd = open >= 0 ? src.indexOf(">", open) + 1 : -1;
  const close = src.lastIndexOf("</BaseIcon>");
  const geometry = open >= 0 && close > openEnd ? src.slice(openEnd, close) : "";
  let norm = open >= 0 && close > openEnd ? src.slice(0, openEnd) + "__GEOMETRY__" + src.slice(close) : src;
  norm = norm.split(name).join("__NAME__").replace(/'/g, '"').replace(/\s+/g, " ").trim();
  if (!groups.has(norm)) groups.set(norm, []);
  groups.get(norm).push(f);
  const exportsConst = new RegExp("export const " + name + "(?![\\w$])").test(src);
  const otherExports = [...src.matchAll(/export (?:const|function|default) (\w+)/g)].map((m) => m[1]).filter((x) => x !== name);
  const defaultExport = (src.match(/export default (\w+)/) || [])[1];
  const geomAttrs = [...geometry.matchAll(/\b(fill|stroke|strokeWidth|stroke-width|color|opacity|fillOpacity|strokeOpacity|style)=\{?(["'][^"']*["']|[^\s>}]+)\}?/g)].map((m) => `${m[1]}=${m[2]}`);
  const hex = geometry.match(/#[0-9a-fA-F]{3,8}\b/g) || [];
  const varAttr = geometry.match(/\w+=\{?["'`]var\(/g) || [];
  const elems = [...new Set([...geometry.matchAll(/<(\w+)/g)].map((m) => m[1]))];
  checks.push({ f, exportsConst, inIndex: indexNames.has(name), otherExports, defaultExport, geomAttrs: [...new Set(geomAttrs)], hex, varAttr, elems });
}
const sorted = [...groups.entries()].sort((a, b) => b[1].length - a[1].length);
console.log(`files: ${files.length}; distinct normalized shapes: ${sorted.length}`);
sorted.forEach(([norm, fs], i) => {
  console.log(`\n=== SHAPE #${i + 1} (${fs.length} files) ===\n${norm}\n-- ${fs.join(", ")}`);
});
console.log("\n=== PER-FILE CHECKS (only non-default rows) ===");
for (const c of checks) {
  const flags = [];
  if (!c.exportsConst) flags.push("NO export const <filename>");
  if (!c.inIndex) flags.push("NOT IN index.ts");
  if (c.otherExports.length) flags.push("other exports: " + c.otherExports.join(","));
  if (c.defaultExport) flags.push("default export: " + c.defaultExport + (c.defaultExport !== c.f.replace(/\.tsx$/, "") ? "  <-- MISMATCH" : ""));
  if (c.geomAttrs.length) flags.push("geometry attrs: " + c.geomAttrs.join(" "));
  if (c.hex.length) flags.push("HEX: " + c.hex.join(","));
  if (c.varAttr.length) flags.push("VAR() IN ATTR: " + c.varAttr.join(","));
  if (c.elems.some((e) => !["path", "circle", "rect", "line", "polyline", "polygon", "ellipse", "g"].includes(e))) flags.push("elements: " + c.elems.join(","));
  if (flags.length) console.log(`${c.f}: ${flags.join(" | ")}`);
}
for (const n of indexNames) if (!files.includes(n + ".tsx")) console.log("INDEX EXPORT WITH NO FILE:", n);
