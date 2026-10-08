// WI-004: import Storybook types from the declared `@storybook/react-vite`
// (package.json devDependency) instead of the hoisted transitive `@storybook/react`.
// One deterministic mapping, quote style and line endings preserved.
//
//   node docs/audit/_work/scratch/waveE/storybook-imports.mjs           apply
//   node docs/audit/_work/scratch/waveE/storybook-imports.mjs --verify  check only (exit 1 on failure)
//
// Scope: every `*.stories.tsx` under src/ and every file under .storybook/.
// Each file must carry exactly one `from '@storybook/react'` specifier, or the
// run aborts before writing anything. `@storybook/react-vite` re-exports the
// renderer (`export * from "@storybook/react"`), so Meta/StoryObj/Preview are
// the same types.
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../../..");
const verify = process.argv.includes("--verify");

const OLD = /from (['"])@storybook\/react\1/g;
const NEW = (_m, q) => `from ${q}@storybook/react-vite${q}`;

function walk(dir, pick, out = []) {
  for (const name of readdirSync(dir)) {
    const p = path.join(dir, name);
    if (statSync(p).isDirectory()) walk(p, pick, out);
    else if (pick(p)) out.push(p);
  }
  return out;
}
const files = [
  ...walk(path.join(root, "src"), (p) => p.endsWith(".stories.tsx")),
  ...walk(path.join(root, ".storybook"), (p) => /\.(ts|tsx|js|mjs)$/.test(p)),
].sort();
const rel = (p) => path.relative(root, p).split(path.sep).join("/");

if (!verify) {
  const todo = [];
  for (const f of files) {
    const n = (readFileSync(f, "utf8").match(OLD) || []).length;
    if (n === 0) continue;
    if (n !== 1) { console.error(`ABORT ${rel(f)}: expected 1 specifier, found ${n}`); process.exit(1); }
    todo.push(f);
  }
  for (const f of todo) {
    const src = readFileSync(f, "utf8");
    writeFileSync(f, src.replace(OLD, NEW));
    console.log(`edit  ${rel(f)}`);
  }
  console.log(`${todo.length} file(s) edited`);
}

// --- verify (always runs) ---
let failed = false;
let vite = 0;
for (const f of files) {
  const src = readFileSync(f, "utf8");
  const left = (src.match(OLD) || []).length;
  if (left) { console.error(`FAIL  ${rel(f)}: ${left} '@storybook/react' specifier(s) left`); failed = true; }
  if (/from (['"])@storybook\/react-vite\1/.test(src)) vite++;
  // Mixed line endings would mean the write normalised something it should not have.
  const crlf = (src.match(/\r\n/g) || []).length;
  const lf = (src.match(/\n/g) || []).length;
  if (crlf && crlf !== lf) { console.error(`FAIL  ${rel(f)}: mixed line endings`); failed = true; }
}
const stories = files.filter((f) => f.endsWith(".stories.tsx"));
const noImport = stories.filter((f) => !/from (['"])@storybook\/react-vite\1/.test(readFileSync(f, "utf8")));
for (const f of noImport) console.log(`note  ${rel(f)}: imports no Storybook types`);
console.log(`verify: ${vite} file(s) import from @storybook/react-vite; ${stories.length} story file(s) scanned`);
if (failed) process.exit(1);
console.log("verify: OK");
