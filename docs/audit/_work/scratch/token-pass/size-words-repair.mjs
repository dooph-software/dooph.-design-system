// Repair for size-words-rename.mjs (2026-10-03). In three places its helper returned replacement strings
// containing `$1` without expanding them. This restores those exact spots with the intended result.
// Original text was recovered from git (b436647).
import fs from 'node:fs';
const fix = [
  ['src/components/Button/Button.tsx', '    $1"standard",\n', '    defaultVariants: {\n      variant: "secondary",\n      size: "standard",\n'],
  ['src/components/Toggle/toggleOption.ts', '    $1"standard",\n', '    defaultVariants: {\n      variant: "ghost",\n      size: "standard",\n'],
  ['src/components/Avatar/Avatar.tsx', '  standard: "standard",$1sm: "sm",\n', '  standard: "standard",\n  sm: "sm",\n'],
];
for (const [f, from, to] of fix) {
  const s = fs.readFileSync(f, 'utf8');
  const n = s.split(from).length - 1;
  if (n !== 1) throw new Error(`${f}: expected 1 occurrence, found ${n}`);
  fs.writeFileSync(f, s.replace(from, () => to));
  console.log('repaired', f);
}
