import fs from "node:fs"; import path from "node:path";
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
for (const f of walk("src/components").filter((f) => /\.(ts|tsx)$/.test(f) && !/stories/.test(f))) {
  const s = fs.readFileSync(f, "utf8");
  const re = /export const (\w*Size\w*)\s*=\s*\{([\s\S]*?)\}\s*as const/g; let m;
  while ((m = re.exec(s))) {
    const keys = [...m[2].matchAll(/^\s*["']?([\w-]+)["']?\s*:/gm)].map((x) => x[1]);
    console.log(f.split(path.sep).join("/") + " :: " + m[1] + " = {" + keys.join(", ") + "}");
  }
}
