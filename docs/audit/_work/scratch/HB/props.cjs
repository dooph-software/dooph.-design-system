// HB — props-type fact per exported component: is `<Name>Props` declared+exported in the defining file,
// as interface or type? If not, report the inline type in the forwardRef generic. Output TSV.
const fs = require("fs");
const path = require("path");
const root = path.resolve(__dirname, "../../../../..");
const facts = fs
  .readFileSync(path.join(__dirname, "facts.tsv"), "utf8")
  .trim()
  .split(/\r?\n/)
  .slice(1)
  .map((l) => l.split("\t"));
for (const [name, file, , fr] of facts) {
  if (/^(Icons|Shapes)\//.test(file) && !/Base/.test(name)) continue;
  const src = fs.readFileSync(path.join(root, "src/components", file), "utf8");
  const m = src.match(new RegExp("export\\s+(interface|type)\\s+" + name + "Props\\b"));
  const local = src.match(new RegExp("^(interface|type)\\s+" + name + "Props\\b", "m"));
  let v;
  if (fr === "alias") v = "radix-alias";
  else if (m) v = "exported-" + m[1];
  else if (local) v = "local-" + local[1] + "-NOT-exported";
  else {
    const re = new RegExp("const\\s+" + name + "(Base)?\\s*=\\s*forwardRef\\s*<([\\s\\S]*?)>\\s*\\(");
    const fwd = src.match(re);
    v = fwd ? "inline:" + fwd[2].replace(/\s+/g, " ").slice(0, 90) : "other";
  }
  console.log(name + "\t" + file + "\t" + v);
}
