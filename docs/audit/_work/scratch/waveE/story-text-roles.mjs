// WI-020 / WI-121 (R9.24): stories render text through the DS text roles, not
// raw elements carrying a `text-style-*` class.
//
//   node docs/audit/_work/scratch/waveE/story-text-roles.mjs           apply
//   node docs/audit/_work/scratch/waveE/story-text-roles.mjs --verify  check only (exit 1 on failure)
//
// Mapping (one rule): <span|p|code className="… text-style-label|body …">…</tag>
//   → <LabelText|BodyText [as="p"|"code"] className="…rest…">…</LabelText|BodyText>
// The element stays the same (`span` is the roles' default tag, so it gets no `as`).
// The matching close tag must be the next `</tag>` with no same-tag opener between,
// or the run aborts before writing anything. The `../Text` import is merged into
// an existing one or added after the last import, in the file's quote style.
// Line endings are preserved. CopyButton is out of scope: WI-121 maps its snippet
// to the mono role by hand. Text/ stories demonstrate the classes themselves.
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../../..");
const verify = process.argv.includes("--verify");

const OPEN = /<(span|p|code) className="([^"]*?)\btext-style-(label|body)\b([^"]*)">/g;
const ROLE = { label: "LabelText", body: "BodyText" };

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = path.join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (p.endsWith(".stories.tsx")) out.push(p);
  }
  return out;
}
const rel = (p) => path.relative(root, p).split(path.sep).join("/");
const inScope = (p) =>
  !rel(p).startsWith("src/components/Text/") && !rel(p).startsWith("src/components/CopyButton/");
const files = walk(path.join(root, "src")).filter(inScope).sort();

function transform(src, file) {
  const crlf = src.includes("\r\n");
  let s = src.replace(/\r\n/g, "\n");
  const names = new Set();
  let out = "";
  let pos = 0;
  OPEN.lastIndex = 0;
  let m;
  while ((m = OPEN.exec(s))) {
    const [whole, tag, pre, role, post] = m;
    const comp = ROLE[role];
    names.add(comp);
    const cls = `${pre} ${post}`.trim().replace(/\s+/g, " ");
    const asAttr = tag === "span" ? "" : ` as="${tag}"`;
    const clsAttr = cls ? ` className="${cls}"` : "";
    const close = `</${tag}>`;
    const closeAt = s.indexOf(close, m.index + whole.length);
    if (closeAt < 0) throw new Error(`${file}: no ${close} after offset ${m.index}`);
    const between = s.slice(m.index + whole.length, closeAt);
    if (new RegExp(`<${tag}[\\s>]`).test(between)) {
      throw new Error(`${file}: nested <${tag}> before its close at offset ${m.index}`);
    }
    out += s.slice(pos, m.index) + `<${comp}${asAttr}${clsAttr}>` + between + `</${comp}>`;
    pos = closeAt + close.length;
    OPEN.lastIndex = pos;
  }
  if (!names.size) return null;
  s = out + s.slice(pos);

  const existing = /^import \{([^}]*)\} from (['"])\.\.\/Text\2;?$/m.exec(s);
  if (existing) {
    const have = existing[1].split(",").map((x) => x.trim()).filter(Boolean);
    const all = [...new Set([...have, ...names])].sort();
    const q = existing[2];
    s = s.replace(existing[0], `import { ${all.join(", ")} } from ${q}../Text${q};`);
  } else {
    const imports = [...s.matchAll(/^import\b[\s\S]*?from\s+(['"])[^'"\n]+\1;?$/gm)];
    if (!imports.length) throw new Error(`${file}: no import block`);
    const last = imports[imports.length - 1];
    const q = imports[0][1];
    const at = last.index + last[0].length;
    const line = `\nimport { ${[...names].sort().join(", ")} } from ${q}../Text${q};`;
    s = s.slice(0, at) + line + s.slice(at);
  }
  return crlf ? s.replace(/\n/g, "\r\n") : s;
}

if (!verify) {
  const todo = [];
  for (const f of files) {
    const next = transform(readFileSync(f, "utf8"), rel(f)); // throws → nothing written
    if (next !== null) todo.push([f, next]);
  }
  for (const [f, next] of todo) {
    writeFileSync(f, next);
    console.log(`edit  ${rel(f)}`);
  }
  console.log(`${todo.length} file(s) edited`);
}

// --- verify (always runs; covers every story outside Text/, CopyButton included) ---
let failed = false;
for (const f of walk(path.join(root, "src")).filter((p) => !rel(p).startsWith("src/components/Text/"))) {
  const src = readFileSync(f, "utf8");
  const left = src.match(/<(span|p|code|div|h[1-6]) className="[^"]*\btext-style-/g) || [];
  if (left.length) { console.error(`FAIL  ${rel(f)}: ${left.length} raw text-style element(s)`); failed = true; }
  for (const comp of Object.values(ROLE)) {
    if (new RegExp(`<${comp}[\\s>]`).test(src) && !new RegExp(`import \\{[^}]*\\b${comp}\\b[^}]*\\} from ['"]\\.\\./Text(/BaseText)?['"]`).test(src)) {
      console.error(`FAIL  ${rel(f)}: uses ${comp} without importing it from ../Text`); failed = true;
    }
  }
  if (/\r\n/.test(src) && /[^\r]\n/.test(src)) { console.error(`FAIL  ${rel(f)}: mixed line endings`); failed = true; }
}
console.log(failed ? "verify: FAILED" : "verify: ok");
process.exit(failed ? 1 : 0);
