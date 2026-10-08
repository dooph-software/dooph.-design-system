// Parse a tokens.css into {light:{name:value}, dark:{name:value}} (comments stripped).
const fs = require("fs");
function parse(file) {
  let src = fs.readFileSync(file, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  const out = { light: {}, dark: {}, dupLight: [], dupDark: [] };
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let m;
  while ((m = re.exec(src))) {
    const sel = m[1].trim();
    const mode = sel.includes(".dark") ? "dark" : "light";
    const body = m[2];
    const declRe = /(--[\w-]+)\s*:\s*([^;]+);/g;
    let d;
    while ((d = declRe.exec(body))) {
      const v = d[2].replace(/\s+/g, " ").trim();
      if (d[1] in out[mode]) out[mode === "light" ? "dupLight" : "dupDark"].push(d[1]);
      out[mode][d[1]] = v;
    }
  }
  return out;
}
module.exports = parse;
if (require.main === module) {
  const a = parse(process.argv[2]);
  console.log(JSON.stringify({ light: Object.keys(a.light).length, dark: Object.keys(a.dark).length, dupLight: a.dupLight, dupDark: a.dupDark }));
}
