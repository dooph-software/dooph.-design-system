// U10 audit scratch: compare every `d` in Shapes/svgs/*.svg against the
// exported <NAME>_SHAPE_PATH constant of the matching *Shape.tsx.
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
const root = path.resolve(process.argv[2] ?? ".");
const dir = path.join(root, "src/components/Shapes");
const svgDir = path.join(dir, "svgs");
const norm = (s) => s.replace(/\s+/g, " ").trim();
const shapeFiles = readdirSync(dir).filter((f) => /^[A-Z]\w*Shape\.tsx$/.test(f) && f !== "BaseShape.tsx");
const svgs = new Set(readdirSync(svgDir).filter((f) => f.endsWith(".svg")));
const rows = [];
for (const f of shapeFiles.sort()) {
  const src = readFileSync(path.join(dir, f), "utf8");
  const m = src.match(/export const (\w+_SHAPE_PATH)\s*=\s*"([^"]*)"/);
  const name = f.replace(/Shape\.tsx$/, "").toLowerCase();
  const svgName = `${name}.svg`;
  if (!m) { rows.push([f, "-", "NO *_SHAPE_PATH const"]); continue; }
  if (!svgs.has(svgName)) { rows.push([f, svgName, "NO SVG FILE"]); continue; }
  svgs.delete(svgName);
  const svg = readFileSync(path.join(svgDir, svgName), "utf8");
  const ds = [...svg.matchAll(/\sd="([^"]*)"/g)].map((x) => norm(x[1]));
  const c = norm(m[2]);
  const idx = ds.findIndex((d) => d === c);
  rows.push([f, svgName, `${ds.length} d attr(s); const ${m[1]} ${idx >= 0 ? "MATCHES d[" + idx + "]" : "DIFFERS (svg d len " + ds.map(d=>d.length).join(",") + " vs const len " + c.length + "; first chars svg=" + JSON.stringify(ds[0]?.slice(0,24)) + " const=" + JSON.stringify(c.slice(0,24)) + ")"}`]);
}
for (const s of svgs) rows.push(["-", s, "SVG WITH NO SHAPE COMPONENT"]);
for (const r of rows) console.log(r.join(" | "));
