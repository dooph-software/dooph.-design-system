#!/usr/bin/env node
// WI-001 (brief 06 wave A, agent A3): remove the vestigial `export default <Name>;`
// lines from non-story modules in src/, and switch every in-repo default import of
// a relative module to the named form. One deterministic pass, verified by itself.
//
//   node docs/audit/_work/scratch/waveA/remove-default-exports.mjs          # dry run
//   node docs/audit/_work/scratch/waveA/remove-default-exports.mjs --write  # apply
//   node docs/audit/_work/scratch/waveA/remove-default-exports.mjs --verify # post-check only
//
// Rules:
// - Only `^export default <Identifier>;$` in non-*.stories.* files is removed, and
//   any blank lines left trailing at EOF collapse to a single final newline.
// - Lane guard: every touched file must sit in Icons/, Shapes/, SidebarWithHoverIcon/,
//   or be Menu/DropdownMenu.tsx (import line only). Anything else aborts.
// - Default imports from "./x" / "../x": `import A from "p";` -> `import { A } from "p";`,
//   `import A, { b, c } from "p";` -> `import { A, b, c } from "p";`. If the default
//   binding is no longer referenced anywhere else in the file (FiltersSlidersIcon's
//   `ArrowUpLeftIcon`, which only fed the wrong default), the import line is deleted.
import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(process.argv.slice(2).find((a) => !a.startsWith("-")) ?? ".");
const mode = process.argv.includes("--write") ? "write" : process.argv.includes("--verify") ? "verify" : "dry";
const srcDir = path.join(root, "src");

const LANE = [
  /^src\/components\/Icons\//,
  /^src\/components\/Shapes\//,
  /^src\/components\/SidebarWithHoverIcon\//,
  /^src\/components\/Menu\/DropdownMenu\.tsx$/,
];

const EXPORT_DEFAULT_RE = /^export default ([A-Za-z_$][\w$]*);$/;
const DEFAULT_IMPORT_RE =
  /^import ([A-Za-z_$][\w$]*)(?:\s*,\s*\{([^}]*)\})? from (["'])(\.\.?\/[^"']+)\3;$/;

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else if (/\.(ts|tsx)$/.test(e.name)) out.push(p);
  }
  return out;
}

const rel = (p) => path.relative(root, p).split(path.sep).join("/");
const isStory = (r) => /\.stories\.(ts|tsx)$/.test(r);
const inLane = (r) => LANE.some((re) => re.test(r));

function transform(source, r) {
  let lines = source.split("\n");
  const removedExports = [];
  const rewroteImports = [];
  const droppedImports = [];

  if (!isStory(r)) {
    lines = lines.filter((line) => {
      const m = EXPORT_DEFAULT_RE.exec(line);
      if (m) removedExports.push(m[1]);
      return !m;
    });
  }

  lines = lines.flatMap((line, i) => {
    const m = DEFAULT_IMPORT_RE.exec(line);
    if (!m) return [line];
    const [, def, named, q, spec] = m;
    const others = lines.filter((_, j) => j !== i).join("\n");
    const used = new RegExp(`(^|[^\\w$.])${def.replace(/\$/g, "\\$")}(?![\\w$])`).test(others);
    const namedList = (named ?? "").split(",").map((s) => s.trim()).filter(Boolean);
    if (!used && namedList.length === 0) {
      droppedImports.push(line);
      return [];
    }
    if (!used) throw new Error(`${r}: unused default binding ${def} alongside named imports — handle by hand`);
    const next = `import { ${[def, ...namedList].join(", ")} } from ${q}${spec}${q};`;
    rewroteImports.push(`${line}  ->  ${next}`);
    return [next];
  });

  let out = lines.join("\n");
  if (removedExports.length) out = out.replace(/\n+$/, "\n");
  return { out, removedExports, rewroteImports, droppedImports };
}

const files = await walk(srcDir);
const results = [];
for (const f of files) {
  const r = rel(f);
  const src = await readFile(f, "utf8");
  const t = transform(src, r);
  if (t.out !== src) results.push({ f, r, src, ...t });
}

// ---------- verify-only ----------
async function postCheck() {
  const problems = [];
  let storyDefaults = 0;
  for (const f of await walk(srcDir)) {
    const r = rel(f);
    const s = await readFile(f, "utf8");
    for (const line of s.split("\n")) {
      if (/^export default/.test(line)) {
        if (isStory(r)) storyDefaults++;
        else problems.push(`non-story export default: ${r}: ${line}`);
      }
      if (DEFAULT_IMPORT_RE.test(line)) problems.push(`relative default import: ${r}: ${line}`);
    }
  }
  return { problems, storyDefaults };
}

if (mode === "verify") {
  const { problems, storyDefaults } = await postCheck();
  console.log(`story files' export default lines: ${storyDefaults}`);
  if (problems.length) {
    console.error(problems.join("\n"));
    process.exit(1);
  }
  console.log("VERIFY OK: no non-story export default, no relative default import in src/");
  process.exit(0);
}

// ---------- lane guard ----------
const outOfLane = results.filter((x) => !inLane(x.r));
if (outOfLane.length) {
  console.error("ABORT — would touch files outside the A3 lane:\n" + outOfLane.map((x) => "  " + x.r).join("\n"));
  process.exit(1);
}
const dropdown = results.find((x) => x.r === "src/components/Menu/DropdownMenu.tsx");
if (dropdown) {
  const changed = dropdown.src.split("\n").filter((l, i) => l !== dropdown.out.split("\n")[i]);
  if (changed.length !== 1 || dropdown.removedExports.length) {
    console.error("ABORT — DropdownMenu.tsx change is not exactly its one import line");
    process.exit(1);
  }
}

const exportFiles = results.filter((x) => x.removedExports.length);
const importLines = results.flatMap((x) => [...x.rewroteImports, ...x.droppedImports].map((l) => `${x.r}: ${l}`));
console.log(`mode=${mode}`);
console.log(`files losing an export default: ${exportFiles.length}`);
console.log(`default-import lines rewritten/dropped: ${importLines.length}`);
for (const l of importLines) console.log("  " + l);
console.log(`total files touched: ${results.length}`);
for (const x of results) console.log("  " + x.r);

if (mode === "write") {
  for (const x of results) await writeFile(x.f, x.out);
  const { problems, storyDefaults } = await postCheck();
  console.log(`story files' export default lines: ${storyDefaults}`);
  if (problems.length) {
    console.error("POST-CHECK FAILED:\n" + problems.join("\n"));
    process.exit(1);
  }
  console.log("WRITE + VERIFY OK");
}
