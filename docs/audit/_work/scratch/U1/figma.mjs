// Flatten the committed Figma variable exports: collection / name / per-mode resolved value (alias name if aliased).
import { readFileSync, readdirSync } from "fs";
const dir = "figma-variable-jsons";
const all = {};
const files = readdirSync(dir).filter((f) => f.endsWith(".json"));
const byId = {};
for (const f of files) { const j = JSON.parse(readFileSync(`${dir}/${f}`, "utf8")); for (const v of j.variables) byId[v.id] = v.name; all[f] = j; }
const fmt = (v) => typeof v === "object" && v && "r" in v ? "#" + [v.r, v.g, v.b].map((x) => Math.round(x * 255).toString(16).padStart(2, "0")).join("") + (v.a !== undefined && v.a < 1 ? `@${+v.a.toFixed(3)}` : "") : String(v);
for (const f of files) {
  const j = all[f];
  console.log(`\n## ${j.name}  modes=${Object.values(j.modes).join("/")}  vars=${j.variables.length}`);
  for (const v of j.variables) {
    const parts = Object.entries(j.modes).map(([mid, mname]) => {
      const raw = v.valuesByMode[mid];
      const res = v.resolvedValuesByMode?.[mid];
      const alias = raw && raw.type === "VARIABLE_ALIAS" ? `→${byId[raw.id] || res?.alias || raw.id}` : "";
      return `${mname}=${fmt(res ? res.resolvedValue : raw)}${alias}`;
    });
    console.log(`  ${v.name} | ${parts.join(" | ")}`);
  }
}
