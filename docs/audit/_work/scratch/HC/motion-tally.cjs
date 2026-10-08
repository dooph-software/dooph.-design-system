// HC pass: tally hardcoded motion in non-story TS/TSX (comment lines skipped).
// Usage: node docs/audit/_work/scratch/HC/motion-tally.cjs
const fs = require("fs");
const path = require("path");

function walk(d, o = []) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p, o);
    else if (/\.(ts|tsx)$/.test(e.name) && !/\.stories\./.test(e.name)) o.push(p);
  }
  return o;
}

const tot = { dur: 0, ease: 0, delay: 0, arb: 0, inline: 0, implicit: 0 };
const rows = [];
for (const f of walk("src")) {
  const L = fs.readFileSync(f, "utf8").split("\n");
  let inC = false;
  L.forEach((s, i) => {
    const t = s.trim();
    if (inC) { if (t.includes("*/")) inC = false; return; }
    if (t.startsWith("/*")) { if (!t.includes("*/")) inC = true; return; }
    if (t.startsWith("*") || t.startsWith("//")) return;
    const dur = s.match(/(?:[\w\[\]=-]+:)*duration-\d+/g) || [];
    const ease = s.match(/\bease-(?:in-out|in|out|linear)\b(?![^"'`]*\d+m?s)/g) || [];
    const delay = s.match(/delay-\d+/g) || [];
    const arb = s.match(/\[(?:animation|transition)[^\]]*\]/g) || [];
    const inl = /\b(transition|animation)\s*:\s*["`]|^\s*["`][a-z-]+ [\d.]+m?s /.test(s) ? 1 : 0;
    // transition-*/animate-* utility with NO duration on the same line => Tailwind/tw-animate default (150ms)
    const implicit = /\b(transition(-all|-colors|-transform|-opacity)?|animate-(in|out))\b/.test(s) && dur.length === 0 && !inl ? 1 : 0;
    if (dur.length || ease.length || delay.length || arb.length || inl || implicit) {
      tot.dur += dur.length; tot.ease += ease.length; tot.delay += delay.length;
      tot.arb += arb.length; tot.inline += inl; tot.implicit += implicit;
      rows.push(`${f.replace(/\\/g, "/")}:${i + 1} | dur=${dur.join(",")} | ease=${ease.join(",")} | arb=${arb.join(",")} | inline=${inl} | implicitDefault=${implicit}`);
    }
  });
}
console.log(rows.join("\n"));
console.log(JSON.stringify(tot));
console.log("lines", rows.length, "files", new Set(rows.map((r) => r.split(":")[0])).size);
