/**
 * sync-theme.mjs
 *
 * Single source of truth: tokens.css
 * Generated output:       the @theme inline { } block inside index.css
 *
 * Run manually:  node scripts/sync-theme.mjs
 * Wired into:    npm run prebuild  (see package.json)
 *
 * HOW IT WORKS
 * ─────────────
 * 1. Parse tokens.css and extract every --ui-* variable name from :root { }
 * 2. Map each name to a Tailwind theme token using the rules in TOKEN_MAP
 * 3. Replace the @theme inline { } block in index.css between the auto-gen markers
 *
 * HOW TO ADD A NEW TOKEN
 * ──────────────────────
 * 1. Add --ui-color-foo (or --ui-shadow-foo etc.) to tokens.css (light + dark)
 * 2. Run `node scripts/sync-theme.mjs`  — done.
 *
 * If the automatic name derivation is wrong (e.g. you want --color-bar instead of
 * --color-foo), add an explicit override to ALIASES below.
 */

import { readFileSync, writeFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TOKENS_PATH = resolve(__dirname, "../src/styles/tokens.css");
const INDEX_PATH = resolve(__dirname, "../src/styles/index.css");

const GEN_START = "/* __GENERATED_THEME_START__ */";
const GEN_END = "/* __GENERATED_THEME_END__ */";

// ── Explicit name aliases ─────────────────────────────────────────────────────
// When the auto-derived Tailwind name (stripping --ui-color- prefix) doesn't
// match the desired class name, add a mapping here:
//   key   → the --ui-* variable name (without leading --)
//   value → the Tailwind @theme key to emit
const ALIASES = {
  // Foreground → fg shorthand
  "ui-color-primary-foreground": "color-primary-fg",
  "ui-color-secondary-foreground": "color-secondary-fg",
  "ui-color-brand-foreground": "color-brand-fg",
  "ui-color-destructive-foreground": "color-destructive-fg",
  "ui-color-ghost-foreground": "color-ghost-fg",
  "ui-color-ghost-foreground-active": "color-ghost-fg-active",
  // Accent lives under a non-standard css var name
  "ui-accent-color": "color-accent",
};

// ── Tokens excluded from @theme (used only as raw var() refs or in @layer) ───
const EXCLUDED = new Set([
  // Font variation axes and weights — used in @layer utilities .text-style-*
  "ui-font-var-button",
  "ui-font-var-body",
  "ui-font-var-heading",
  "ui-weight-body",
  "ui-weight-button",
  "ui-weight-label",
  "ui-weight-heading",
  "ui-weight-title",
  "ui-weight-hero",
  "ui-tracking-body",
  "ui-tracking-label",
  "ui-tracking-hero",
  // Icon sizes — used as raw var() only
  "ui-icon-tiny",
  "ui-icon-standard",
  "ui-icon-medium",
  "ui-icon-stroke",
  // Button heights — exposed via custom @layer utilities (.h-button etc.)
  "ui-height-button",
  "ui-height-button-sm",
  // Menu widths — used as raw var() only
  "ui-min-w-menu",
  "ui-min-w-menu-action",
  "ui-min-w-menu-complex",
  // Opacity — used as var() in arbitrary Tailwind values
  "ui-opacity-disabled",
  // Focus ring colors — only used inside shadow values
  "ui-color-focus-ring",
  "ui-color-destructive-focus-ring",
]);

// ── Derive the @theme key for a given --ui-* variable name ───────────────────
function toThemeEntry(fullName) {
  const key = fullName.replace(/^--/, ""); // strip leading --
  if (EXCLUDED.has(key)) return null;

  // Explicit alias wins
  if (ALIASES[key]) return `--${ALIASES[key]}: var(${fullName});`;

  // --ui-color-X  →  --color-X
  const colorM = key.match(/^ui-color-(.+)$/);
  if (colorM) return `--color-${colorM[1]}: var(${fullName});`;

  // --ui-shadow-X  →  --shadow-X
  const shadowM = key.match(/^ui-shadow-(.+)$/);
  if (shadowM) return `--shadow-${shadowM[1]}: var(${fullName});`;

  // --ui-radius-X  →  --radius-X
  const radiusM = key.match(/^ui-radius-(.+)$/);
  if (radiusM) return `--radius-${radiusM[1]}: var(${fullName});`;

  // --ui-font-sans|label|heading  →  --font-X  (families only)
  const fontM = key.match(/^ui-font-(sans|label|heading)$/);
  if (fontM) return `--font-${fontM[1]}: var(${fullName});`;

  // --ui-text-X  →  --text-X  (font sizes)
  const textM = key.match(/^ui-text-(.+)$/);
  if (textM) return `--text-${textM[1]}: var(${fullName});`;

  // --ui-spacing-X  →  --spacing-X
  const spacingM = key.match(/^ui-spacing-(.+)$/);
  if (spacingM) return `--spacing-${spacingM[1]}: var(${fullName});`;

  return null; // everything else is skipped
}

// ── Parse the light-mode `:root` / `:root,.light` block to get variable names ─
function parseLightModeVars(css) {
  // Strip block comments first — the header comment contains :root { } usage
  // examples that would otherwise be matched before the real :root block.
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const rootMatch = stripped.match(/:root(?:\s*,\s*.light)?\s*\{([\s\S]*?)\}/);
  if (!rootMatch)
    throw new Error(
      "Could not find :root block (optional .light pair) in tokens.css",
    );
  const block = rootMatch[1];
  const re = /(--ui-[\w-]+)\s*:/g;
  const vars = [];
  let m;
  while ((m = re.exec(block)) !== null) {
    if (!vars.includes(m[1])) vars.push(m[1]);
  }
  return vars;
}

// ── Main ──────────────────────────────────────────────────────────────────────
const tokensCss = readFileSync(TOKENS_PATH, "utf8");
const vars = parseLightModeVars(tokensCss);

const entries = vars.map(toThemeEntry).filter(Boolean);

// Computed entries that can't be derived from token names alone
const COMPUTED = [
  "/* Focus ring with destructive  */",
  "--shadow-focus-destructive: 0 0 0 4px var(--ui-color-destructive-focus-ring);",
];

const generated = [
  GEN_START,
  "@theme inline {",
  ...entries.map((e) => `  ${e}`),
  "",
  ...COMPUTED.map((l) => `  ${l}`),
  "}",
  GEN_END,
].join("\n");

// Escape a string for safe use inside new RegExp(...)
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ── Splice into index.css ─────────────────────────────────────────────────────
let indexCss = readFileSync(INDEX_PATH, "utf8");

if (!indexCss.includes(GEN_START)) {
  // First run: no markers yet — replace the existing @theme inline { ... } block.
  // The block ends at the LAST } before the next top-level rule, so we match
  // greedily up to `}` followed by a newline and a non-space character (or EOF).
  indexCss = indexCss.replace(/@theme inline \{[\s\S]*?\n\}/, generated);
} else {
  // Subsequent runs: replace between the auto-gen markers.
  // Markers contain /* and */ which are regex quantifiers — escape them.
  const startRe = escapeRegex(GEN_START);
  const endRe = escapeRegex(GEN_END);
  indexCss = indexCss.replace(
    new RegExp(`${startRe}[\\s\\S]*?${endRe}`),
    generated,
  );
}

writeFileSync(INDEX_PATH, indexCss, "utf8");
console.log(`✓  @theme inline regenerated — ${entries.length} tokens mapped.`);
