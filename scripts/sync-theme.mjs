/**
 * sync-theme.mjs
 *
 * Single source of truth: tokens.css
 * Generated output:       the @theme inline { } block inside index.css,
 *                         src/styles/theme.css (consumer Tailwind preset), and
 *                         src/utils/twMergeTheme.ts (tailwind-merge lists for cn)
 *
 * Run manually:  node scripts/sync-theme.mjs
 * Wired into:    npm run sync-tokens (which npm run build and build:watch run
 *                first; see package.json)
 *
 * HOW IT WORKS
 * ─────────────
 * 1. Parse tokens.css and extract every --ui-* variable name from the first
 *    :root / :root,.light { } block (the light palette, inside
 *    @layer ds.tokens). Later :root blocks — the expression tokens — and the
 *    ds.expression preset are deliberately not read: none is a theme key.
 * 2. Map each name to a Tailwind theme token (toThemeEntry: prefix rules +
 *    ALIASES; EXCLUDED names and names no rule matches are skipped)
 * 3. Replace the @theme inline { } block in index.css between the auto-gen markers
 * 4. Write the same entries to theme.css, and derive the twMergeTheme.ts lists
 *
 * HOW TO ADD A NEW TOKEN
 * ──────────────────────
 * 1. Add --ui-color-foo (or --ui-shadow-foo etc.) to tokens.css :root (add a
 *    .dark override only when the value differs)
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
// Standalone Tailwind preset shipped to consumers (see § theme.css below).
const THEME_PRESET_PATH = resolve(__dirname, "../src/styles/theme.css");
// tailwind-merge lists read by src/utils/cn.ts (see § twMergeTheme.ts below).
const TW_MERGE_THEME_PATH = resolve(__dirname, "../src/utils/twMergeTheme.ts");

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
  "ui-color-prominent-foreground": "color-prominent-fg",
  "ui-color-danger-foreground": "color-danger-fg",
  "ui-color-danger-foreground-active": "color-danger-fg-active",
  "ui-color-ghost-foreground": "color-ghost-fg",
  "ui-color-ghost-foreground-active": "color-ghost-fg-active",
  "ui-color-selection-foreground": "color-selection-fg",
  // Brand identity colors live under non-standard css var names
  "ui-prominent-color": "color-prominent-color",
  "ui-prominent-color-alt": "color-prominent-color-alt",
  "ui-prominent-color-ter": "color-prominent-color-ter",
};

// ── Tokens excluded from @theme ───────────────────────────────────────────────
// Only an entry a prefix rule in toThemeEntry would otherwise map has an effect;
// the rest record raw-var()-only tokens. A token no rule matches is skipped
// whether it is listed or not.
const EXCLUDED = new Set([
  // Font variation axes and weights — used in @layer components .text-style-*
  "ui-font-var-button",
  "ui-font-var-body",
  "ui-font-var-heading",
  "ui-font-var-mono",
  "ui-weight-body",
  "ui-weight-button",
  "ui-weight-label",
  "ui-weight-subheading",
  "ui-weight-heading",
  "ui-weight-title",
  "ui-weight-hero",
  "ui-weight-mono",
  "ui-weight-cta",
  "ui-weight-regular",
  "ui-weight-medium",
  "ui-weight-semibold",
  "ui-weight-bold",
  "ui-tracking-body",
  "ui-tracking-label",
  "ui-tracking-hero",
  "ui-tracking-mono",
  // Icon sizes — used as raw var() only
  "ui-icon-sm",
  "ui-icon-rg",
  "ui-icon-md",
  "ui-icon-lg",
  "ui-icon-stroke-width",
  // Button heights — exposed via custom @layer utilities (.h-button etc.)
  "ui-height-button",
  "ui-height-button-sm",
  "ui-height-button-medium",
  // Focus-ring widths: raw var() inside the ds-focus-* helpers, never a utility
  "ui-focus-ring-width",
  "ui-focus-ring-width-sm",
  "ui-height-button-big",
  "ui-height-button-micro",
  // Medium / big button padding — exposed via ds-px-button-* helpers
  "ui-spacing-button-medium-x",
  "ui-spacing-button-big-x",
  "ui-height-slider-track",
  "ui-slider-track-gap",
  "ui-width-slider-handle",
  "ui-height-slider-handle",
  // Slider paints — raw var() inside .ds-slider-* helpers, never a utility
  "ui-slider-track-primary-active-opacity",
  "ui-slider-track-prominent-active-opacity",
  "ui-color-slider-step-primary-active",
  "ui-color-slider-step-prominent-active",
  "ui-color-slider-step-inactive",
  // Checkbox / code digit — exposed via custom @layer utilities
  "ui-size-checkbox",
  "ui-size-code-digit",
  // Component sizes — exposed via custom @layer utilities (.size-avatar,
  // .h-menu-label …) or ds-* helpers, never a Tailwind theme key
  "ui-size-checkbox-icon",
  "ui-size-avatar",
  "ui-size-avatar-sm",
  "ui-size-shape-button",
  "ui-size-kbd",
  "ui-height-menu-label",
  "ui-height-text-trigger",
  "ui-height-linear-progress",
  // OutlineButton box + glow orbs — raw var() inside the ds-* helpers only
  "ui-height-outline-button",
  "ui-min-w-outline-button",
  "ui-outline-button-orb-1-opacity",
  "ui-outline-button-orb-2-opacity",
  "ui-outline-button-orb-1-blur",
  "ui-outline-button-orb-2-blur",
  "ui-outline-button-orb-1-hover-blur",
  "ui-outline-button-orb-2-hover-blur",
  "ui-outline-button-orb-1-width",
  "ui-outline-button-orb-1-height",
  "ui-outline-button-orb-2-width",
  "ui-outline-button-orb-2-height",
  "ui-outline-button-orb-1-bottom",
  "ui-outline-button-orb-1-left",
  "ui-outline-button-orb-2-bottom",
  "ui-outline-button-orb-2-right",
  // Motion scale — raw var() inside the ds-motion-* helpers and CSS helpers
  // only. Never a Tailwind theme key: components must not reach the scale
  // through duration-N / ease-* utilities.
  "ui-motion-duration-fast",
  "ui-motion-duration-base",
  "ui-motion-duration-slow",
  "ui-motion-duration-slower",
  "ui-motion-duration-slowest",
  "ui-motion-ease-standard",
  "ui-motion-ease-enter",
  "ui-motion-ease-exit",
  "ui-motion-ease-linear",
  // Loop cycle times — raw var() in @layer utilities only
  "ui-shimmer-duration",
  "ui-spinner-duration",
  "ui-spinner-rotate-duration",
  "ui-spinner-spokes-duration",
  // Roll-on-change depth/blur — raw var() in keyframes only
  "ui-roll-change-depth",
  "ui-roll-change-blur",
  "ui-roll-change-breathe",
  // Fade-roll-on-change depth — raw var() in keyframes only
  "ui-fade-change-depth",
  // Shape morph motion — raw var() in @layer utilities / keyframes only
  "ui-shape-morph-duration",
  "ui-shape-morph-ease",
  "ui-shape-morph-interval",
  "ui-shape-morph-passive-spin-duration",
  "ui-shape-morph-nudge",
  // Expression tokens — raw var() inside .ds-expr-* helpers only, never a
  // utility (see the expression block at the end of tokens.css)
  "ui-caret-shape-scale",
  "ui-caret-nudge",
  // Rolling digits stagger / geometry — raw var() in @layer utilities only
  "ui-rolling-digits-stagger",
  "ui-rolling-digits-opacity-ratio",
  "ui-rolling-digits-digit-width",
  "ui-rolling-digits-separator-width",
  "ui-rolling-digits-decimals-rise",
  "ui-rolling-digits-decimals-gap",
  "ui-rolling-digits-decimals-size",
  // Tooltip widths — exposed via ds-* helpers
  "ui-width-tooltip-rich",
  "ui-min-w-tooltip-complex",
  // Menu widths — read by the custom .min-w-menu utility and the ds-min-w-*
  // helpers, never a theme key
  "ui-min-w-menu",
  "ui-min-w-menu-complex",
  "ui-min-w-search-box",
  // CTAButton geometry — exposed via ds-* helpers
  "ui-size-cta-chip-standard",
  "ui-size-cta-chip-big",
  "ui-size-cta-shape-standard",
  "ui-size-cta-shape-big",
  "ui-size-cta-icon-standard",
  "ui-size-cta-icon-big",
  "ui-min-w-cta-content-standard",
  "ui-min-w-cta-content-big",
  "ui-spacing-cta-content-standard",
  "ui-spacing-cta-content-big",
  // Opacity — read by ds-* helpers and index.css rules, not utilities
  "ui-opacity-disabled",
  // Sticker washes — raw var() inside the sticker bg color-mix and the
  // custom variant's inline background. Not a utility.
  "ui-sticker-bg-opacity",
  "ui-sticker-bg-opacity-secondary",
  // Focus ring colors — used inside shadow values and by the ds-focus-* outline
  // helpers
  "ui-color-focus-ring-prominent",
  "ui-color-focus-ring-primary",
  "ui-color-focus-ring-danger",
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

  // --ui-font-<role>  →  --font-<role>  (family stacks only; excludes --ui-font-var-*)
  const fontM = key.match(
    /^ui-font-(body|button|heading|label|title|hero|mono)$/,
  );
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

const generated = [
  GEN_START,
  "@theme inline {",
  ...entries.map((e) => `  ${e}`),
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

// ── Emit the standalone consumer preset: src/styles/theme.css ─────────────────
// Apps that run their OWN Tailwind v4 build import this file so that THEIR
// Tailwind learns the dooph token namespace. Without it, classes the app writes
// itself (p-md, gap-sm, rounded-normal, font-label, …) are never generated —
// they only exist in dist/styles.css for the exact classes dooph components use —
// and same-named Tailwind defaults (font-sans, etc.) silently win. Importing this
// makes every dooph utility resolvable in the app build and overrides colliding
// defaults, so no manual `@theme inline` remap is needed.
const themePreset = [
  "/*",
  " * @dooph-software/design-system — Tailwind v4 theme preset",
  " *",
  " * AUTO-GENERATED by scripts/sync-theme.mjs. Do not edit by hand.",
  " *",
  " * Only needed by apps that run their own Tailwind v4 build. Import it into",
  " * your Tailwind entry AFTER `@import \"tailwindcss\";` and the package styles:",
  " *",
  ' *   @import "tailwindcss";',
  ' *   @import "@dooph-software/design-system/styles.css";',
  ' *   @import "@dooph-software/design-system/theme.css";',
  " *",
  " * This registers every --ui-* token in your Tailwind build so utilities like",
  " * p-md, gap-sm, rounded-normal, font-label and bg-primary all generate and",
  " * resolve to design-system tokens. Token VALUES still come from styles.css at",
  " * runtime (these are `inline` var() references), so overriding --ui-* in your",
  " * own CSS keeps working. Apps that do not use Tailwind can ignore this file.",
  " */",
  generated,
  "",
].join("\n");

writeFileSync(THEME_PRESET_PATH, themePreset, "utf8");

// ── Emit the tailwind-merge lists: src/utils/twMergeTheme.ts ──────────────────
// cn() (src/utils/cn.ts) must know every DS class name, or tailwind-merge
// misfiles it: an unknown `text-style-hero-body` or `text-body` is read as a
// text COLOUR and erased by `text-text`, and an unknown `rounded-tight` or
// `p-md` never conflicts with `rounded-full` / `p-lg`. The hand-kept list in
// cn.ts drifted twice, so every list is derived here from the CSS that defines
// the classes:
//   theme scales  ← the @theme entries above (tokens.css)
//   text-style-*  ← the `.text-style-<role>` rules in index.css
//   h-/size-/…    ← the custom `.h-*` / `.size-*` / `.min-w-*` … rules in index.css
const TW_MERGE_SCALES = ["text", "radius", "spacing", "shadow"];
const twMergeTheme = Object.fromEntries(TW_MERGE_SCALES.map((s) => [s, []]));
for (const line of entries) {
  const m = line.match(
    /^--(text|radius|spacing|shadow)-([a-z0-9]+(?:-[a-z0-9]+)*):/,
  );
  if (m && !twMergeTheme[m[1]].includes(m[2])) twMergeTheme[m[1]].push(m[2]);
}

// Hand-written part of index.css only: drop the generated block and comments
// (comments mention `.text-style-*` as prose).
const handCss = indexCss
  .replace(new RegExp(`${escapeRegex(GEN_START)}[\\s\\S]*?${escapeRegex(GEN_END)}`), "")
  .replace(/\/\*[\s\S]*?\*\//g, "");

const textStyleRoles = [];
for (const m of handCss.matchAll(
  /^\s*\.text-style-([a-z0-9]+(?:-[a-z0-9]+)*)\s*\{/gm,
)) {
  if (!textStyleRoles.includes(m[1])) textStyleRoles.push(m[1]);
}

const SIZE_GROUPS = ["h", "w", "size", "min-h", "min-w", "max-h", "max-w"];
const sizeUtilities = Object.fromEntries(SIZE_GROUPS.map((g) => [g, []]));
for (const m of handCss.matchAll(
  /^\s*\.(min-h|min-w|max-h|max-w|size|h|w)-([a-z0-9]+(?:-[a-z0-9]+)*)\s*\{/gm,
)) {
  if (!sizeUtilities[m[1]].includes(m[2])) sizeUtilities[m[1]].push(m[2]);
}

// An empty list here means a regex stopped matching, not that the DS has no
// roles — fail loudly rather than ship a cn() that forgets them all.
for (const [name, list] of [
  ["text-style roles (index.css)", textStyleRoles],
  ["custom h-* utilities (index.css)", sizeUtilities.h],
  ...TW_MERGE_SCALES.map((s) => [`--${s}-* theme entries`, twMergeTheme[s]]),
]) {
  if (list.length === 0)
    throw new Error(`sync-theme: found no ${name} for twMergeTheme.ts`);
}

const recordType = (keys) =>
  `Readonly<Record<${keys.map((k) => JSON.stringify(k)).join(" | ")}, readonly string[]>>`;
const twMergeThemeTs = [
  "// AUTO-GENERATED by scripts/sync-theme.mjs. Do not edit by hand.",
  "// Run `npm run sync-tokens` after changing tokens.css or the .text-style-* /",
  "// .h-* / .size-* / .min-w-* … rules in index.css. Read by src/utils/cn.ts.",
  "",
  "/** DS theme scales (tailwind-merge theme keys), from the same tokens as the @theme block. */",
  `export const DS_TW_MERGE_THEME: ${recordType(TW_MERGE_SCALES)} = ${JSON.stringify(twMergeTheme, null, 2)};`,
  "",
  "/** Every `.text-style-<role>` class defined in index.css. */",
  `export const DS_TEXT_STYLE_ROLES: readonly string[] = ${JSON.stringify(textStyleRoles, null, 2)};`,
  "",
  "/** Custom sizing utilities defined in index.css @layer utilities, by tailwind-merge class group. */",
  `export const DS_SIZE_UTILITIES: ${recordType(SIZE_GROUPS)} = ${JSON.stringify(sizeUtilities, null, 2)};`,
  "",
].join("\n");

writeFileSync(TW_MERGE_THEME_PATH, twMergeThemeTs, "utf8");
console.log(
  `✓  @theme inline regenerated — ${entries.length} tokens mapped (index.css + theme.css + utils/twMergeTheme.ts).`,
);
