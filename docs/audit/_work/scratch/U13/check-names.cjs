// Item 2: every --ui-* token, ds-*/text-style-* class and token-backed utility
// named in the consumer docs, checked against HEAD src/styles + theme.css.
// Usage (repo root): node docs/audit/_work/scratch/U13/check-names.cjs
const fs = require("fs");
const path = require("path");
const parse = require("./tokens.cjs");
const R = process.cwd();
const tok = parse(path.join(R, "src/styles/tokens.css"));
const allCss = ["tokens.css", "index.css", "dooph-component-tokens.css", "theme.css"]
  .map((f) => fs.readFileSync(path.join(R, "src/styles", f), "utf8")).join("\n");
const tokens = new Set([...Object.keys(tok.light), ...Object.keys(tok.dark)]);
// also any --ui-* declared anywhere in src/styles (component-token files)
for (const m of allCss.matchAll(/(--ui-[\w-]+)\s*:/g)) tokens.add(m[1]);
const classes = new Set([...allCss.matchAll(/\.((?:ds|text-style)-[\w-]+|h-button(?:-sm)?|size-button(?:-sm|-micro)?|min-h-button|h-slider-track)\b/g)].map((m) => m[1]));
const theme = fs.readFileSync(path.join(R, "src/styles/theme.css"), "utf8");
const tkeys = new Set([...theme.matchAll(/^\s*--([\w-]+)\s*:/gm)].map((m) => m[1]));
const has = (ns, n) => tkeys.has(`${ns}-${n}`);
function utilOk(u) {
  let m;
  if ((m = u.match(/^(?:bg|border|ring|outline|fill|stroke|from|via|to|divide|decoration|accent|caret)-(.+)$/))) return has("color", m[1]);
  if ((m = u.match(/^text-(.+)$/))) return has("color", m[1]) || has("text", m[1]);
  if ((m = u.match(/^-?(?:p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap|gap-x|gap-y|space-x|space-y|inset|top|left|right|bottom|w|h|min-w|min-h|max-w|max-h|size)-(.+)$/))) return has("spacing", m[1]) || classes.has(u);
  if ((m = u.match(/^rounded(?:-(?:t|b|l|r|s|e|tl|tr|bl|br))?-(.+)$/))) return has("radius", m[1]);
  if ((m = u.match(/^shadow-(.+)$/))) return has("shadow", m[1]);
  if ((m = u.match(/^font-(.+)$/))) return has("font", m[1]);
  return null; // not a token-backed utility we can judge
}
const docs = [
  "skills/dooph-design-system-usage/SKILL.md",
  "skills/dooph-design-system-usage/references/responsive-sheet-modal.md",
  "skills/dooph-design-system-theming/SKILL.md",
  "skills/dooph-design-system-theming/references/token-contract.md",
  "skills/dooph-design-system-v3-migration/SKILL.md",
  "skills/dooph-design-system-v5-migration/SKILL.md",
  "README.md",
];
const out = [];
for (const d of docs) {
  const lines = fs.readFileSync(path.join(R, d), "utf8").split("\n");
  lines.forEach((l, i) => {
    for (const m of l.matchAll(/--ui-[\w-]*[\w]/g)) {
      const n = m[0];
      const fam = /-\*?$/.test(l.slice(m.index + n.length, m.index + n.length + 2)) && l[m.index + n.length] === "-" && l[m.index + n.length + 1] === "*";
      let ok = fam ? [...tokens].some((t) => t.startsWith(n + "-")) : tokens.has(n);
      if (!ok && !fam && /\*$/.test(l.slice(m.index, m.index + n.length + 1))) ok = [...tokens].some((t) => t.startsWith(n));
      if (!ok) out.push(`${d}:${i + 1}\tTOKEN${fam ? "-FAMILY" : ""}\t${n}${fam ? "-*" : ""}`);
    }
    // backticked words only, for classes/utilities
    for (const b of l.matchAll(/`([^`]+)`/g)) {
      for (const w of b[1].split(/[\s/]+/)) {
        const u = w.replace(/^[\[(\"']+|[\])\",.';:]+$/g, "");
        if (!u || u.startsWith("--") || /[{}=<>()]/.test(u)) continue;
        if (/^(ds|text-style)-[\w-]+$/.test(u)) { if (!classes.has(u)) out.push(`${d}:${i + 1}\tCLASS\t${u}`); continue; }
        if (!/^-?[a-z]+(-[a-z0-9]+)+$/.test(u)) continue;
        const r = utilOk(u);
        if (r === false) out.push(`${d}:${i + 1}\tUTILITY\t${u}`);
      }
    }
  });
}
console.log(out.join("\n"));
console.error(`tokens known: ${tokens.size}; classes known: ${classes.size}; theme keys: ${tkeys.size}; misses: ${out.length}`);
