// HB (H2 matrix) — mechanical fact extraction per exported component.
// Input: docs/audit/_work/scratch/HA/surface.out.txt (COMP rows = every exported component).
// Output: TSV on stdout: name file defLine directive forwardRef refType displayName propsType cnLast styleSet styleOrder
// Heuristics only; every outlier is re-read by hand in H2-matrix.md.
const fs = require("fs");
const path = require("path");
const root = path.resolve(__dirname, "../../../../..");
const surface = fs.readFileSync(path.join(root, "docs/audit/_work/scratch/HA/surface.out.txt"), "utf8");
const comps = surface
  .split(/\r?\n/)
  .filter((l) => l.startsWith("COMP |"))
  .map((l) => {
    const [, name, loc] = l.split(" | ");
    const [file, line] = loc.split(":");
    return { name, file, line: +line };
  });

const cache = {};
const read = (f) => (cache[f] ??= fs.readFileSync(path.join(root, f), "utf8").split(/\r?\n/));

function block(lines, startIdx) {
  // from startIdx to the next top-level declaration
  const out = [lines[startIdx]];
  for (let i = startIdx + 1; i < lines.length; i++) {
    if (/^(export\s+)?(const|function|type|interface|let)\s/.test(lines[i])) break;
    if (/^\w+\.displayName\s*=/.test(lines[i])) { out.push(lines[i]); break; }
    out.push(lines[i]);
  }
  return out.join("\n");
}
function findDecl(lines, ident) {
  const re = new RegExp(`^(export\\s+)?(const|function)\\s+${ident}\\b`);
  return lines.findIndex((l) => re.test(l));
}

const rows = [];
for (const c of comps) {
  const lines = read(c.file);
  const directive = (() => {
    const i = lines.findIndex((l) => /^["']use client["'];?\s*$/.test(l));
    return i < 0 ? "none" : `L${i + 1}`;
  })();
  let idx = findDecl(lines, c.name);
  let text = idx >= 0 ? block(lines, idx) : "";
  let chased = "";
  // chase `const X = XBase as ...` / `= XBase` casts and createRoleText factory
  const m = text.match(/=\s*\(?\s*(\w+Base)\b/);
  if (!/forwardRef/.test(text) && m) {
    const j = findDecl(lines, m[1]);
    if (j >= 0) { chased = m[1]; text = block(lines, j) + "\n" + text; }
  }
  if (/createRoleText\(/.test(text)) {
    const j = findDecl(lines, "createRoleText");
    chased = "createRoleText"; text = block(lines, j) + "\n" + text;
  }
  const isAlias = /=\s*\w+Primitive\.\w+\s*;/.test(text) && !/forwardRef/.test(text);
  const fr = /forwardRef\s*</.test(text) || /forwardRef\(/.test(text);
  let refType = "none";
  const rt = text.match(/forwardRef\s*<\s*([\s\S]*?),\s*\n?\s*[\w<]/);
  if (fr && rt) refType = rt[1].replace(/\s+/g, " ").trim();
  if (isAlias) refType = "alias";
  const dnName = chased && chased !== "createRoleText" ? chased : c.name;
  const dnRe = new RegExp(`^${dnName}\\.displayName\\s*=\\s*(.*)$`);
  const dnLine = lines.find((l) => dnRe.test(l)) || (chased === "createRoleText" ? "factory" : "");
  const displayName = dnLine ? (dnLine === "factory" ? "factory" : dnLine.match(dnRe)[1]) : "none";
  // className: last arg of the first cn( … ) that mentions className
  const cnCalls = [...text.matchAll(/cn\(([\s\S]*?)\)\s*[}\n,]/g)].map((x) => x[1]);
  const withCls = cnCalls.find((s) => /\bclassName\b/.test(s));
  let cnLast = "no-cn";
  if (withCls) cnLast = /className\s*,?\s*$/.test(withCls.trim()) ? "last" : "NOT-last";
  else if (/className=\{className\}/.test(text)) cnLast = "passthrough";
  const styleSet = /style=\{/.test(text) ? "sets" : "none";
  // order of style= vs {...props}/{...rest}
  let styleOrder = "";
  if (styleSet === "sets") {
    const sIdx = text.search(/\sstyle=\{/);
    const pIdx = text.search(/\{\.\.\.(props|rest|spanProps|svgProps|iconProps|other)\}/);
    styleOrder = pIdx < 0 ? "no-spread" : sIdx < pIdx ? "style-before-spread" : "style-after-spread";
    if (/\.\.\.style\b/.test(text)) styleOrder += "+merges";
  }
  rows.push([c.name, c.file.replace("src/components/", ""), directive, isAlias ? "alias" : fr ? "yes" : "no", refType, displayName, cnLast, styleSet, styleOrder].join("\t"));
}
console.log(["name", "file", "directive", "forwardRef", "refType", "displayName", "cnClassNameLast", "style", "styleOrder"].join("\t"));
console.log(rows.join("\n"));
