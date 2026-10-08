// C1 token sweep — ONE deterministic old → new class table (wave C, WI-059 /
// WI-060 / WI-082). Numeric spacing is mapped by PIXEL value onto today's
// scale (xxxs 2, xxs 4, xs 6, sm 8, rg 10, md 12, lg 16, xl 20, xxl 26,
// xxxl 42); arbitrary px literals map onto the new token-backed classes.
//
//   node docs/audit/_work/scratch/waveC/C1-sweep.mjs           apply (all-or-nothing)
//   node docs/audit/_work/scratch/waveC/C1-sweep.mjs --verify  check only
//
// Apply refuses to write anything unless every row finds exactly `n` hits —
// or is already applied (0 `from` left, >= n `to`), so a re-run is a no-op.
// Verify passes when every `from` has 0 hits and every `to` has >= n hits.
// Structural edits (ShapeButton's SHAPE_SIZE, CodeDigitInput's fontSize,
// OutlineButton's orb spans/styles) are hand edits, not rows here.
import fs from "node:fs";

const C = "src/components/";
// [file, from, to, n]  — n = occurrences in that file
const TABLE = [
  // ── WI-059: Tailwind numeric spacing → DS scale (by px) ──
  [C + "Button/Button.tsx", "gap-2", "gap-sm", 1], // 8px
  [C + "Button/Button.tsx", "px-3", "px-md", 2], // 12px (standard, sm)
  [C + "SearchBox/SearchBox.tsx", "gap-2", "gap-sm", 1],
  [C + "HotkeyIndicator/HotkeyIndicator.tsx", "gap-1", "gap-xxs", 1], // 4px
  [C + "Table/Table.tsx", "gap-1", "gap-xxs", 1],
  [C + "Table/Table.tsx", "px-4", "px-lg", 1], // 16px
  [C + "Table/Table.tsx", "py-3", "py-md", 1], // 12px
  [C + "Tabs/Tabs.tsx", "gap-1", "gap-xxs", 1],
  [C + "Tooltip/Tooltip.tsx", "px-3", "px-md", 1],
  [C + "SplitButton/SplitButton.tsx", "pl-4", "pl-lg", 1],
  [C + "SplitButton/SplitButton.tsx", "pr-4", "pr-lg", 1],
  [C + "Toast/Toast.tsx", "py-2", "py-sm", 3], // simple ×3 variants
  [C + "Toast/Toast.tsx", "pl-4", "pl-lg", 3],
  [C + "Toast/Toast.tsx", "pr-2", "pr-sm", 3],
  [C + "Toast/Toast.tsx", "pb-3", "pb-md", 1], // complex
  [C + "Toast/Toast.tsx", "pr-3", "pr-md", 1],
  [C + "OutlineButton/OutlineButton.tsx", "gap-2", "gap-sm", 2],
  [C + "OutlineButton/OutlineButton.tsx", "px-3", "px-md", 1],
  // Doc-comment example only (no runtime class): show a DS-scale padding.
  [C + "Sheet/Sheet.tsx", "p-6", "p-lg", 1],
  // ── No exact token → new component token via a class ──
  [C + "Table/Table.tsx", "py-8", "py-table-placeholder-y", 1], // 32px, mapped spacing token
  [C + "DropdownTrigger/DropdownTrigger.tsx", "min-w-40", "min-w-menu", 2], // 160px = --ui-min-w-menu
  // ── WI-060: arbitrary px → token-backed classes ──
  [C + "Avatar/Avatar.tsx", "size-[38px]", "size-avatar", 1],
  [C + "Avatar/Avatar.tsx", "size-[22px]", "size-avatar-sm", 1],
  [C + "ShapeButton/ShapeButton.tsx", "size-[46px]", "size-shape-button", 1],
  [C + "SplitButton/SplitButton.tsx", "size-[14px]", "ds-size-icon-rg", 1],
  [C + "VerificationCode/CodeDigitInput.tsx", "text-[18px]", "text-code-digit", 1],
  [C + "Menu/DropdownMenu.tsx", "h-[30px]", "h-menu-label", 1],
  [C + "DropdownTrigger/DropdownTrigger.tsx", "h-[30px]", "h-text-trigger", 1],
  [C + "HotkeyIndicator/HotkeyIndicator.tsx", "min-w-[23px] min-h-[23px]", "ds-min-size-kbd", 1],
  [C + "Toast/Toast.tsx", "pl-[14px]", "pl-toast-inset", 1],
  [C + "Toast/Toast.tsx", "pt-[14px]", "pt-toast-inset", 1],
  [C + "Checkbox/Checkbox.tsx", "size-2.5", "size-checkbox-icon", 3], // 10px
  [C + "OutlineSection/OutlineSection.tsx", "rounded-[28px]", "rounded-outline-frame", 1],
  // ── WI-082 / WI-071 (height only): box geometry ──
  [C + "OutlineButton/OutlineButton.tsx", "rounded-[28px]", "rounded-outline-frame", 1],
  [C + "OutlineButton/OutlineButton.tsx", "h-[54px] min-w-[160px]", "ds-size-outline-button", 1],
  [C + "LinearProgressIndicator/LinearProgressIndicator.tsx", "h-[4px]", "h-linear-progress", 1],
];

// Second pass of the same run, from the first draft's targets. A ds-* helper
// is in no tailwind-merge group, so on a root that also takes the consumer's
// className it beat overrides like `rounded-none` / `py-4` / `h-2`. Those
// roots get merge-aware utilities instead (the rows above are the final map).
const RETARGET = [
  [C + "Table/Table.tsx", "ds-py-table-placeholder", "py-table-placeholder-y", 1],
  [C + "OutlineSection/OutlineSection.tsx", "ds-radius-soft-outset-sm", "rounded-outline-frame", 1],
  [C + "OutlineButton/OutlineButton.tsx", "ds-radius-soft-outset-sm", "rounded-outline-frame", 1],
  [C + "LinearProgressIndicator/LinearProgressIndicator.tsx", "ds-progress-track", "h-linear-progress", 1],
];

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// Class-token boundaries: not glued to another class character or a variant.
const re = (cls) => new RegExp(`(?<![\\w\\-:!/.\\[])${esc(cls)}(?![\\w\\-.\\[\\]%/])`, "g");
const hits = (src, cls) => (src.match(re(cls)) || []).length;

const verify = process.argv.includes("--verify");
const files = new Map();
const read = (f) => files.get(f) ?? (files.set(f, fs.readFileSync(f, "utf8")), files.get(f));
let bad = 0;

for (const [f, from, to, n] of verify ? TABLE : [...RETARGET, ...TABLE]) {
  const src = read(f);
  if (verify) {
    const left = hits(src, from), got = hits(src, to);
    const ok = left === 0 && got >= n;
    if (!ok) bad++;
    console.log(`${ok ? "ok  " : "FAIL"} ${f}: ${from} left ${left}, ${to} ${got}/${n}`);
  } else {
    const k = hits(src, from);
    if (k === 0 && hits(src, to) >= n) { console.log(`done ${f}: ${from} → ${to}`); continue; }
    if (k !== n) { bad++; console.log(`MISMATCH ${f}: ${from} found ${k}, expected ${n}`); continue; }
    files.set(f, src.replace(re(from), to));
    console.log(`swap ${f}: ${from} → ${to} ×${n}`);
  }
}

if (bad) { console.error(`\n${bad} row(s) failed — ${verify ? "verify failed" : "nothing written"}.`); process.exit(1); }
if (!verify) for (const [f, src] of files) if (fs.readFileSync(f, "utf8") !== src) fs.writeFileSync(f, src, "utf8");
console.log(verify ? "\nverify: all rows ok" : `\napplied ${TABLE.length} rows to ${files.size} files`);
