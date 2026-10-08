// usage: node classcheck.mjs <cssfile> class1 class2 ...
import fs from "node:fs";
const [, , file, ...classes] = process.argv;
const css = fs.readFileSync(file, "utf8");
const escape = (c) => c.replace(/[^A-Za-z0-9_-]/g, (ch) => "\\" + ch);
for (const c of classes) {
  const sel = "." + escape(c);
  let idx = 0, count = 0;
  while ((idx = css.indexOf(sel, idx)) !== -1) {
    const next = css[idx + sel.length];
    if (next === undefined || !/[A-Za-z0-9_-]/.test(next) || next === "\\") {
      if (!(next === "\\")) count++;
    }
    idx += sel.length;
  }
  console.log(`${c.padEnd(42)} ${count ? "OK(" + count + ")" : "MISSING"}`);
}
