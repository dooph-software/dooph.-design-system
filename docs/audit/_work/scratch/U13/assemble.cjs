// Reassemble docs/audit/_work/units/U13.md into final section order.
// Run from repo root: node docs/audit/_work/scratch/U13/assemble.cjs
const fs = require("fs");
const P = "docs/audit/_work/units/U13.md";
const src = fs.readFileSync(P, "utf8");
fs.writeFileSync("docs/audit/_work/scratch/U13/U13.pre-assembly.md", src);
const claims = fs.readFileSync("docs/audit/_work/scratch/U13/chunk-claims.md", "utf8");
const lines = src.split("\n");
const findings = {}; const parts = []; let inv = null;
let cur = null;
const flush = () => {
  if (!cur) return;
  const text = cur.lines.join("\n").replace(/\n+$/, "") + "\n";
  if (cur.kind === "F") findings[cur.id] = text;
  else if (cur.kind === "P") parts.push(text);
  else if (cur.kind === "I") inv = text;
  cur = null;
};
for (const l of lines) {
  let m;
  if ((m = l.match(/^### U13-F(\d+):/))) { flush(); cur = { kind: "F", id: +m[1], lines: [l] }; continue; }
  if (/^### \[§5 part\]/.test(l)) { flush(); cur = { kind: "P", lines: [l.replace("[§5 part] ", "")] }; continue; }
  if (/^## 6\. Release inventory/.test(l)) { flush(); cur = { kind: "I", lines: [l] }; continue; }
  if (/^<!--/.test(l) || /^## /.test(l) || /^---\s*$/.test(l)) { flush(); continue; }
  if (cur) cur.lines.push(l);
}
flush();
const ids = Object.keys(findings).map(Number).sort((a, b) => a - b);
let F = ids.map((i) => findings[i]).join("\n");
// line-number corrections found after the chunks were written
F = F.replace("  - package.json:36-40 (files) ; package.json:80-95 (dependencies)", "  - package.json:35-39 (files) ; package.json:79-94 (dependencies)")
     .replace('    package.json:36  "files": [ "dist", "skills", "bin" ],', '    package.json:35  "files": [ "dist", "skills", "bin" ],')
     .replace("  - SECURITY.md:11\n", "  - SECURITY.md:12\n")
     .replace("    SECURITY.md:11     **[Report", "    SECURITY.md:12     **[Report")
     .replace("(SECURITY.md:9)", "(SECURITY.md:9)");
const C = claims.replace("tokens.css:398-403 (16px)", "tokens.css:401-402 (16px)").replace("package.json:60-63", "package.json:57-60");
const header = `# U13 — consumer-facing docs (shipped skills) + top-level repo docs

Audited SHA b436647 (package.json 5.3.0 = latest tag/npm; HEAD 11 commits past v5.3.0).
Sections: 1 Findings · 2 File ledger · 4 Claim results · 5 Code-example and name checks · 6 Release inventory (seed for remediation).

Scratch (all under \`docs/audit/_work/scratch/U13/\`): \`v530/\`, \`head/\` (\`git archive\` of src+skills at each ref); \`list-exports.cjs\` → \`exports-v530.tsv\` (357) / \`exports-head.tsv\` (443, identical to dist-index.d.ts); \`tokens.cjs\` + \`token-diff.cjs\` → \`token-inventory.txt\`; \`theme-keys-*.txt\`, \`classes-*.txt\`; \`check-names.cjs\` → \`name-misses.tsv\`; \`token-contract-diff.txt\`; \`examples/\` (tsconfig + 16 example files + \`tsc-output.txt\`); \`codemod-fixture/\` (+ \`-copy-before\`).

Counts: S1 ×6 (F1, F2, F3, F5, F6, F9) · S2 ×8 (F4, F7, F8, F10, F11, F12, F13, F14) · S3 ×0 · S4 ×1 (F15).
`;
const out = [header, "## 1. Findings\n", F, C.trim() + "\n", "## 5. Code-example and name checks\n", parts.join("\n"), inv || "", "## DONE\n"].join("\n");
fs.writeFileSync(P, out);
console.log("findings:", ids.join(","), "parts:", parts.length, "inventory:", !!inv, "bytes:", out.length);
