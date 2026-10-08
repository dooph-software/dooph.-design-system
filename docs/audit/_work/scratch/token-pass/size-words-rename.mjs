// Size-word + height-token pass (maintainer decisions 2026-10-02/03; docs/audit/figma-additions.md).
// Deterministic; dry run by default, --write to apply. Refuses to run twice.
// Usage (repo root): node docs/audit/_work/scratch/token-pass/size-words-rename.mjs [--write]
// After --write: npm run sync-tokens && npm run lint.
import fs from 'node:fs';
import path from 'node:path';

const WRITE = process.argv.includes('--write');
const TOK = 'src/styles/tokens.css';
if (!fs.readFileSync(TOK, 'utf8').includes('--ui-height-tab-micro')) {
  console.error('Refusing: --ui-height-tab-micro is already gone, so this pass was already applied.');
  process.exit(1);
}

const files = [];
const walk = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (/\.(tsx?|css|mdx)$/.test(e.name) && !p.endsWith(path.normalize('styles/theme.css'))) files.push(p.split(path.sep).join('/')); } };
walk('src');
if (fs.existsSync('.storybook')) walk('.storybook');

const tally = {};
const hit = (k, n = 1) => { tally[k] = (tally[k] || 0) + n; };
// NOTE (2026-10-03): string `rep` values are NOT $-expanded here (they are returned from a function). Three uses
// with `$1` broke on the first run and were fixed by size-words-repair.mjs. Use function reps for backreferences.
const sub = (s, re, rep, k) => s.replace(re, (...a) => { hit(k); return typeof rep === 'function' ? rep(...a) : rep; });

// Rewrite `default: "default"` keys / cva `default:` keys inside a delimited block only.
const inBlock = (s, startRe, fn, k) => s.replace(startRe, (block) => { const out = fn(block); if (out !== block) hit(k); return out; });

const SIZE_CONSTS = ['ButtonSize', 'TextDropdownSize', 'TabSize', 'ToggleSize'];

for (const f of files) {
  const src = fs.readFileSync(f, 'utf8');
  const G0 = src.indexOf('__GENERATED_THEME_START__');
  const G1 = src.indexOf('__GENERATED_THEME_END__');
  const segs = G0 >= 0 && G1 > G0 ? [[0, G0, true], [G0, G1, false], [G1, src.length, true]] : [[0, src.length, true]];
  let out = '';
  for (const [a, b, edit] of segs) {
    let s = src.slice(a, b);
    if (edit) {
      // 1. base size key: default → standard (only on the four size consts and the blocks that key off them)
      s = sub(s, new RegExp(`\\b(${SIZE_CONSTS.join('|')})\\.default\\b`, 'g'), (m, c) => `${c}.standard`, 'XSize.default → .standard');
      s = inBlock(s, new RegExp(`export const (?:${SIZE_CONSTS.join('|')}) = \\{[\\s\\S]*?\\} as const;`, 'g'),
        (blk) => blk.replace(/(\n\s*)default: "default",/, '$1standard: "standard",'), 'size const key default → standard');
      if (f.endsWith('Toggle/Toggle.tsx')) {
        s = inBlock(s, /const OPTION_SIZE: Record<ToggleSize, ToggleOptionSize> = \{[\s\S]*?\};/,
          (blk) => blk.replace(/default: "default",/, 'standard: "standard",').replace(/"icon-sm": "icon-micro",/, '"icon-micro": "icon-micro",'), 'Toggle OPTION_SIZE keys');
      }
      if (f.endsWith('Button/Button.tsx') || f.endsWith('Toggle/toggleOption.ts')) {
        // cva size block: the first `default:` key after `size: {`
        s = inBlock(s, /\n(\s*)size: \{[\s\S]*?\n\1\},/, (blk) => blk.replace(/(\n\s*)default: "/, '$1standard: "'), 'cva size key default → standard');
        s = sub(s, /(defaultVariants: \{[\s\S]*?size: )"default"/, '$1"standard"', 'cva defaultVariants size');
      }
      if (f.endsWith('DropdownTrigger/constants.ts') || f.endsWith('Button/constants.ts') || f.endsWith('Tabs/constants.ts') || f.endsWith('Toggle/constants.ts')) {
        // handled by the size-const block rule above
      }
      // 2. AvatarSize.small → sm
      s = sub(s, /\bAvatarSize\.small\b/g, 'AvatarSize.sm', 'AvatarSize.small → .sm');
      if (f.endsWith('Avatar/Avatar.tsx')) s = sub(s, /(\n\s*)small: "small",/, '$1sm: "sm",', 'AvatarSize key small → sm');
      // 3. ToggleSize.iconSm (28px) → iconMicro; TabSize.iconSm (34px) is correct and stays
      s = sub(s, /\bToggleSize\.iconSm\b/g, 'ToggleSize.iconMicro', 'ToggleSize.iconSm → .iconMicro');
      if (f.endsWith('Toggle/constants.ts')) s = sub(s, /iconSm: "icon-sm",/, 'iconMicro: "icon-micro",', 'ToggleSize key iconSm → iconMicro');
      // 4. *Types → *Variant
      s = sub(s, /\bTooltipTypes\b/g, 'TooltipVariant', 'TooltipTypes → TooltipVariant');
      s = sub(s, /\bToastTypes\b/g, 'ToastVariant', 'ToastTypes → ToastVariant');
      // 5. tab-micro height joins the button family
      s = sub(s, /--ui-height-tab-micro(?![\w-])/g, '--ui-height-button-micro', '--ui-height-tab-micro → --ui-height-button-micro');
      s = sub(s, /(?<![\w-])h-tab-micro(?![\w-])/g, 'h-button-micro', 'h-tab-micro → h-button-micro');
      s = sub(s, /(?<![\w-])size-tab-micro(?![\w-])/g, 'size-button-micro', 'size-tab-micro → size-button-micro');
    }
    out += s;
  }
  if (out !== src && WRITE) fs.writeFileSync(f, out);
}

// After the renames: tokens.css has two --ui-height-button-micro lines (26px original + the renamed 28px tab-micro).
// Keep one, at 28px. Add medium/big heights. Ghost foreground → primary text in both modes.
// index.css: utilities for the new heights; drop the duplicate .size-button-micro the rename produces.
const IDX = 'src/styles/index.css';
if (WRITE) {
  let t = fs.readFileSync(TOK, 'utf8');
  t = t.replace(/\n([ \t]*)--ui-height-button-micro: 26px;([^\n]*)/, '\n$1--ui-height-button-micro: 28px;$2');
  let seen = false;
  t = t.split('\n').filter((l) => { if (/^\s*--ui-height-button-micro:/.test(l)) { if (seen) return false; seen = true; } return true; }).join('\n');
  t = t.replace(/(\n(\s*)--ui-height-button-sm: 34px;)/, '$1\n$2--ui-height-button-medium: 46px;\n$2--ui-height-button-big: 54px;');
  t = t.replace(/--ui-color-ghost-foreground: #4a4a4a;/, '--ui-color-ghost-foreground: var(--ui-color-text);');
  t = t.replace(/--ui-color-ghost-foreground: #afafaf;/, '--ui-color-ghost-foreground: var(--ui-color-text);');
  fs.writeFileSync(TOK, t);

  let x = fs.readFileSync(IDX, 'utf8');
  // remove duplicate .size-button-micro blocks (keep the first)
  let n = 0;
  x = x.replace(/\n[ \t]*\.size-button-micro \{[^}]*\}/g, (m) => (n++ ? '' : m));
  x = x.replace(/(\n([ \t]*)\.h-button-sm \{[^}]*\})/, '$1\n$2.h-button-medium {\n$2  height: var(--ui-height-button-medium);\n$2}\n$2.h-button-big {\n$2  height: var(--ui-height-button-big);\n$2}');
  fs.writeFileSync(IDX, x);

  // theme generator: the new heights are raw-var utilities like the other button heights
  const SY = 'scripts/sync-theme.mjs';
  let y = fs.readFileSync(SY, 'utf8');
  if (!y.includes('"ui-height-button-medium"')) y = y.replace(/(\n(\s*)"ui-height-button-sm",)/, '$1\n$2"ui-height-button-medium",\n$2"ui-height-button-big",');
  fs.writeFileSync(SY, y);
}

console.log(`${WRITE ? 'WROTE' : 'DRY RUN'} — files scanned ${files.length}`);
for (const [k, v] of Object.entries(tally).sort()) console.log(`  ${k}: ${v}`);
