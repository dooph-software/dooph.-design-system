// Extract className-ish string tokens from component files and check each exists
// as a selector in dist-styles.css or src/styles/*.css.
import fs from "node:fs";
const files = process.argv.slice(2);
const css = fs.readFileSync("docs/audit/_work/dist-styles.css", "utf8");
const srcCss = ["dooph-component-tokens.css", "index.css", "tokens.css", "theme.css"]
  .map((f) => fs.readFileSync("src/styles/" + f, "utf8"))
  .join("\n");
const BS = String.fromCharCode(92);
function esc(s) {
  let out = "";
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (/[a-zA-Z0-9_-]/.test(c)) {
      if (i === 0 && /[0-9]/.test(c)) out += BS + "3" + c + " ";
      else out += c;
    } else out += BS + c;
  }
  return out;
}
const BARE = ["group", "relative", "grid", "absolute", "flex", "border", "sr-only", "shrink-0", "grow"];
for (const f of files) {
  const src = fs.readFileSync(f, "utf8");
  const strs = [...src.matchAll(/"([^"\n]*)"|'([^'\n]*)'/g)].map((m) => m[1] ?? m[2]);
  const toks = new Set();
  for (const s of strs) {
    if (s.startsWith(".") || s.startsWith("@") || s.includes("/Shapes") || s.startsWith("react")) continue;
    for (const t of s.split(/\s+/)) {
      if (!t) continue;
      if ((/^[!a-z\[\-]/.test(t) && /[-:\[]/.test(t)) || BARE.includes(t)) toks.add(t);
    }
  }
  const missing = [];
  for (const t of toks) {
    const e = "." + esc(t);
    const found = [" ", "{", ":", ",", ")", "\n", ".", "[", ">"].some((x) => css.includes(e + x));
    const found2 = srcCss.includes("." + t.replace(/\//g, BS + "/"));
    if (!found && !found2) missing.push(t);
  }
  console.log("== " + f + " : " + toks.size + " tokens; not found: " + missing.join("  |  "));
}
