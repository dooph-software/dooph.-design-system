// HB — render matrix.psv as a markdown table and count every column.
// usage: node render.cjs table   → markdown matrix (all rows)
//        node render.cjs counts  → per-column value counts over pop A (weighted), plus R/L totals
const fs = require("fs");
const path = require("path");
const lines = fs.readFileSync(path.join(__dirname, "matrix.psv"), "utf8").split(/\r?\n/);
const cols = lines.find((l) => l.startsWith("# cols:")).replace("# cols:", "").trim().split("|");
const rows = lines
  .filter((l) => l && !l.startsWith("#"))
  .map((l) => {
    const cells = l.split("|");
    if (cells.length !== cols.length) throw new Error(`bad row (${cells.length} cells): ${l.slice(0, 80)}`);
    return Object.fromEntries(cols.map((c, i) => [c, cells[i]]));
  });
const mode = process.argv[2] || "table";
if (mode === "table") {
  const show = cols.filter((c) => c !== "pop" && c !== "unit");
  const hdr = ["pop", "n", ...show.filter((c) => c !== "n"), "unit"];
  console.log("| " + hdr.join(" | ") + " |");
  console.log("|" + hdr.map(() => "---").join("|") + "|");
  for (const r of rows) console.log("| " + hdr.map((c) => r[c]).join(" | ") + " |");
} else {
  const tot = { A: 0, R: 0, L: 0 };
  rows.forEach((r) => (tot[r.pop] += +r.n));
  console.log(`weights: A=${tot.A} R=${tot.R} L=${tot.L} total=${tot.A + tot.R + tot.L}`);
  // normalizers: collapse a cell to its class for counting
  const norm = {
    uc: (v) => (v.startsWith("L") ? (v.includes("need") ? "present·needed" : "present·NOT-needed") : v.includes("NEED") ? "absent·NEEDED" : v.includes("borderline") ? "absent·borderline" : "absent·ok"),
    fwd: (v) => v.split(" ")[0],
    ref: (v) => (["Div", "Span", "Button", "Input", "Anchor", "SVG", "Form", "TextArea"].includes(v) ? "concrete HTML*/SVG*Element" : v),
    dn: (v) => v.split(" ")[0],
    props: (v) => v.split(" ")[0].replace(/:.*/, ":<shared>"),
    cn: (v) => v.split(" ")[0],
    style: (v) => v.split(" ")[0],
    rest: (v) => v.split(" ")[0],
    asChild: (v) => v.split(" ")[0],
    cva: (v) => v.split(" ")[0].replace(/^hand.*/, "hand-built").replace(/^via.*/, "via other recipe"),
    disabled: (v) => v.split(" ")[0],
    focus: (v) => v.split(" ")[0],
    typo: (v) => v.split(" ")[0],
    motion: (v) => v.split(" ")[0],
    header: (v) => v.split(" ")[0],
    story: (v) => v.split(" ")[0],
    index: (v) => v,
  };
  for (const c of Object.keys(norm)) {
    const m = {};
    rows.filter((r) => r.pop === "A").forEach((r) => {
      const k = norm[c](r[c]);
      m[k] = (m[k] || 0) + +r.n;
    });
    const s = Object.entries(m).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}=${v}`).join(", ");
    console.log(`${c}: ${s}`);
  }
}
