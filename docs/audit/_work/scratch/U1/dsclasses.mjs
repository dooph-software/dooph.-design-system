// ds-* / text-style-* / custom-utility class inventory: where defined (file:line, layer), where used.
// Run from repo root: node docs/audit/_work/scratch/U1/dsclasses.mjs
import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";
const walk = (d, o = []) => { for (const n of readdirSync(d)) { const p = join(d, n).replace(/\\/g, "/"); statSync(p).isDirectory() ? (n === "node_modules" ? 0 : walk(p, o)) : o.push(p); } return o; };
const cssFiles = ["src/styles/index.css", "src/styles/dooph-component-tokens.css"];
const defs = new Map(); // class -> [{file,line,layer}]
for (const f of cssFiles) {
  const lines = readFileSync(f, "utf8").split("\n");
  let depth = 0, layerStack = [], inComment = false;
  lines.forEach((ln, i) => {
    let code = ln;
    // strip comments across lines
    let out = "";
    for (let k = 0; k < code.length; k++) {
      if (!inComment && code[k] === "/" && code[k + 1] === "*") { inComment = true; k++; continue; }
      if (inComment && code[k] === "*" && code[k + 1] === "/") { inComment = false; k++; continue; }
      if (!inComment) out += code[k];
    }
    const lm = out.match(/@layer\s+([\w-]+)\s*\{/);
    for (const m of out.matchAll(/\.((?:ds|text-style)-[\w-]+|h-button(?:-sm)?|size-[\w-]+|min-h-button|min-w-button|h-slider-track|h-tab-micro)(?![\w-])/g)) {
      // only count as definition if line is a selector line (contains { or ends with , ) and not inside declaration value
      if (/[{,]\s*$/.test(out) || /\{/.test(out) || /^\s*[.\[:]/.test(out)) {
        const layer = layerStack.length ? layerStack[layerStack.length - 1] : "(none)";
        if (!defs.has(m[1])) defs.set(m[1], []);
        const arr = defs.get(m[1]);
        if (!arr.some((d) => d.file === f && d.line === i + 1)) arr.push({ file: f, line: i + 1, layer });
      }
    }
    for (const ch of out) {
      if (ch === "{") { depth++; if (lm && layerStack.length < depth) layerStack.push(lm[1]); else layerStack.push(layerStack.length ? layerStack[layerStack.length - 1] : "(none)"); }
      if (ch === "}") { depth--; layerStack.pop(); }
    }
  });
}
const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'`\\])\/\/.*$/gm, "$1");
const src = walk("src").filter((f) => /\.(tsx?)$/.test(f));
const comp = src.filter((f) => !f.endsWith(".stories.tsx")), story = src.filter((f) => f.endsWith(".stories.tsx"));
const skillFiles = walk("skills").filter((f) => f.endsWith(".md"));
const content = Object.fromEntries([...comp, ...story].map((f) => [f, strip(readFileSync(f, "utf8"))]));
const skillC = Object.fromEntries(skillFiles.map((f) => [f, readFileSync(f, "utf8")]));
const re = (c) => new RegExp("(?<![\\w-])" + c.replace(/-/g, "\\-") + "(?![\\w-])");
const rows = [];
for (const [c, d] of defs) {
  const r = re(c);
  const inComp = comp.filter((f) => r.test(content[f]));
  const inStory = story.filter((f) => r.test(content[f]));
  const inSkill = skillFiles.filter((f) => r.test(skillC[f]));
  rows.push({ c, defs: d.map((x) => `${x.file.replace("src/styles/", "")}:${x.line}[${x.layer}]`), comp: inComp.map((f) => f.replace("src/components/", "")), story: inStory.length, skill: inSkill.map((f) => f.replace("skills/", "")) });
}
const mode = process.argv[2];
if (mode === "all") for (const r of rows) console.log(JSON.stringify(r));
console.log("defined classes:", rows.length);
console.log("\n== defined in >1 place ==");
for (const r of rows) if (new Set(r.defs.map((d) => d.split(":")[0])).size > 1) console.log(" ", r.c, r.defs.join(" "));
console.log("\n== ds-* defined OUTSIDE dooph-component-tokens.css ==");
for (const r of rows) if (r.c.startsWith("ds-") && !r.defs.some((d) => d.startsWith("dooph-component-tokens"))) console.log(" ", r.c, r.defs[0]);
console.log("\n== not in @layer utilities/components ==");
for (const r of rows) if (r.defs.some((d) => d.includes("[(none)]"))) console.log(" ", r.c, r.defs.join(" "));
console.log("\n== unused by components (non-story tsx/ts) ==");
for (const r of rows) if (!r.comp.length) console.log(" ", r.c, "| story files:", r.story, "| consumer skills:", r.skill.join(",") || "-");
// referenced but undefined
const refd = new Set();
for (const f of comp.concat(story)) for (const m of content[f].matchAll(/(?<![\w-])(ds-[a-z][\w-]*|text-style-[a-z][\w-]*)/g)) refd.add(m[1] + "\t" + f);
console.log("\n== ds-*/text-style-* referenced in src ts/tsx but NOT defined in src/styles ==");
const seen = new Set();
for (const x of refd) { const [c, f] = x.split("\t"); if (!defs.has(c) && !c.endsWith("-")) { console.log(" ", c, f); seen.add(c); } }
