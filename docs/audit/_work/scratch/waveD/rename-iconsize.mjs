// WI-065: rename the icon size const/type `IconSizes` -> `IconSize` at source and
// drop the generator's `IconSizes as IconSize` alias. One deterministic mapping.
//
//   node docs/audit/_work/scratch/waveD/rename-iconsize.mjs           apply
//   node docs/audit/_work/scratch/waveD/rename-iconsize.mjs --verify  check only (exit 1 on failure)
//
// Every call site outside src/components/Icons/ already imports `IconSize` from the
// `../Icons` barrel, so only the three files below carry the source name. Each edit
// asserts its exact occurrence count before writing, so a drifted file aborts the run
// instead of being half-edited. Files are read immediately before they are written.
//
// Deliberately NOT renamed (reported, not ours or not the identifier):
//  - `export const IconSizes: Story` in Toggle/SegmentedTabSelect stories: Storybook
//    story export names (they set the story id), not the const.
//  - LoadingSpinner/spinnerGeometry.ts comment "`Fonts`/`IconSizes`": D3's folder.
import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../../..");
const verify = process.argv.includes("--verify");

const EDITS = [
  { file: "scripts/generate-icon-exports.mjs", from: /IconSizes as IconSize/g, to: "IconSize", expect: 1 },
  { file: "src/components/Icons/BaseIcon.tsx", from: /\bIconSizes\b/g, to: "IconSize", expect: 7 },
  { file: "src/components/Icons/Icons.stories.tsx", from: /\bIconSizes\b/g, to: "IconSize", expect: 12 },
];

// Hits allowed to remain after the rename (file -> exact line text regex).
const ALLOWED_REMAINING = [
  { file: "src/components/Toggle/Toggle.stories.tsx", line: /^export const IconSizes: Story = \{$/ },
  { file: "src/components/SegmentedTabSelect/SegmentedTabSelect.stories.tsx", line: /^export const IconSizes: Story = \{$/ },
  { file: "src/components/LoadingSpinner/spinnerGeometry.ts", line: /`Fonts`\/`IconSizes`/ },
];

const read = (f) => readFileSync(path.join(root, f), "utf8");
let failed = false;

if (!verify) {
  for (const e of EDITS) {
    const src = read(e.file);
    const n = (src.match(e.from) || []).length;
    if (n === 0) { console.log(`skip  ${e.file} (already renamed)`); continue; }
    if (n !== e.expect) { console.error(`ABORT ${e.file}: expected ${e.expect} matches, found ${n}`); process.exit(1); }
  }
  for (const e of EDITS) {
    const src = read(e.file);
    const n = (src.match(e.from) || []).length;
    if (n === 0) continue;
    writeFileSync(path.join(root, e.file), src.replace(e.from, e.to));
    console.log(`edit  ${e.file}: ${n} replacement(s)`);
  }
}

// --- verify (always runs) ---
for (const e of EDITS) {
  const n = (read(e.file).match(/\bIconSizes\b/g) || []).length;
  if (n) { console.error(`FAIL  ${e.file}: ${n} IconSizes left`); failed = true; }
}
const gen = read("scripts/generate-icon-exports.mjs");
if (!gen.includes(`'export { BaseIcon, IconSize } from "./BaseIcon";',`)) {
  console.error("FAIL  generator does not emit the unaliased IconSize export"); failed = true;
}
const barrel = read("src/components/Icons/index.ts");
if (!barrel.includes('export { BaseIcon, IconSize } from "./BaseIcon";') || /IconSizes/.test(barrel)) {
  console.error("FAIL  src/components/Icons/index.ts not regenerated (run `npm run generate-icon-exports`)"); failed = true;
}
const base = read("src/components/Icons/BaseIcon.tsx");
if (/export type IconSize\b[^;]*\|\s*string/.test(base)) {
  console.error("FAIL  BaseIcon.tsx: the IconSize type still widens with `| string`"); failed = true;
}
// Repo-wide sweep of src + scripts: anything left must be on the allow-list.
const hits = execFileSync("git", ["grep", "--untracked", "-n", "-w", "IconSizes", "--", "src", "scripts"], { cwd: root, encoding: "utf8" }).trim().split("\n").filter(Boolean);
for (const h of hits) {
  const [file, , ...rest] = h.split(":");
  const text = rest.join(":");
  const ok = ALLOWED_REMAINING.some((a) => a.file === file && a.line.test(text));
  console.log(`${ok ? "allow" : "FAIL "} ${h}`);
  if (!ok) failed = true;
}
console.log(failed ? "VERIFY FAILED" : "VERIFY OK");
process.exit(failed ? 1 : 0);
