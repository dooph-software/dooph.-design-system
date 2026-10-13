#!/usr/bin/env node
/*
 * dooph Design System: v5 -> v6 codemod.
 *
 * Two modes, run in this order:
 *
 *   --spacing  The spacing-scale shift. v6 reuses the v5 step names for
 *              smaller sizes (v5 `md` = 16px is v6 `lg`), so this rename is
 *              NOT repeatable: a second run would shift every name again. It
 *              is a separate mode so that the normal run can be repeated
 *              safely. Run `--spacing --write` exactly once, on v5 code.
 *              Because it sees v5 code, it also lists the v5 `ghost`
 *              SegmentedTabSelect tags, which need a size in v6.
 *
 *   (normal)   Everything else, in three lists kept deliberately apart:
 *     AUTO     Renames where the v5 name has exactly one v6 successor in the
 *              same role. Applied with --write. Every v5 name here is gone in
 *              v6, so a second run finds nothing to do.
 *     REPORT   Removals, splits, merges and redesigns. There is no correct
 *              mechanical mapping, so this script refuses to guess and prints
 *              file:line for a human. Each one fails the run until fixed.
 *              The DONE CHECK adds every other v5 DS name still present (the
 *              skill's step-6 patterns, in plain JS), except the app's own
 *              declared theme keys, so exit 0 means no v5 name is left.
 *     ADVISORY Call sites to look at: a changed default, offset or
 *              measurement, a class that kept its name but changed size, a
 *              silent typography change, a changed role or accessible name.
 *              Listed, but never fail the run,
 *              because the v6 form of the code can look the same.
 *
 * Usage (one call; [path …] defaults to the current folder):
 *   node codemod.mjs [path …] --spacing            # dry run of the spacing shift
 *   node codemod.mjs [path …] --spacing --write    # apply it (once)
 *   node codemod.mjs [path …]                      # dry run of the renames
 *   node codemod.mjs [path …] --write              # apply the AUTO renames
 *
 * Every path given is scanned, as one set: the preset and the app's own theme
 * keys are detected across all of them, so a folder without the CSS entry
 * still gets the utility renames and the own-key protection. SKIP leaves out
 * dependencies, build output and the agent skill folders that `init-skills`
 * fills (.agents, .claude, .agent): those quote v5 names on purpose, and a
 * --write there would rewrite the migration skill itself.
 *
 * Tailwind names (the theme keys renamed below, and the spacing utilities)
 * exist only in an app whose Tailwind build imports the DS preset,
 * @dooph-software/design-system/theme.css. Without it, `max-w-md` is
 * Tailwind's own 28rem container and `bg-brand` is not the DS's. So both modes
 * look for that import in the scanned files and leave utility names alone when
 * they do not find it. If your CSS entry lives elsewhere, pass --preset (or
 * --no-preset to force the other way). A theme key your own CSS declares
 * (`--color-brand: …`) is yours, and is never renamed.
 *
 * Exit code (CI gates on the normal mode, so it must mean "work pending"):
 *   1  normal dry run with AUTO renames still to apply, or any REPORT item left
 *   2  a path could not be read (missing, or a folder under it unreadable)
 *   3  --spacing refused: the code already uses a v6-only spacing step
 *      (xxxs / xxxl), so it looks shifted. Pass --force only if it is not.
 *   0  otherwise. A --spacing dry run that is not refused exits 0: shifted
 *      and unshifted code look alike, so it cannot tell whether work is
 *      pending.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, extname, resolve } from "node:path";

const args = process.argv.slice(2);
const WRITE = args.includes("--write");
const SPACING = args.includes("--spacing");
const FORCE = args.includes("--force");
const PRESET_FLAG = args.includes("--preset") ? true : args.includes("--no-preset") ? false : null;
const PATHS = args.filter((a) => !a.startsWith("-"));
const ROOTS = PATHS.length ? PATHS : ["."];

const SKIP = new Set([
  "node_modules", ".git", "dist", "build", ".next", "out", "coverage",
  ".turbo", ".cache", "storybook-static",
  // Agent skill folders (init-skills): they quote v5 names on purpose.
  ".agents", ".claude", ".agent",
]);
const EXT = new Set([
  ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".mts", ".cts",
  ".css", ".scss", ".html", ".mdx", ".vue", ".svelte", ".astro",
]);

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const byLength = (a, b) => b.length - a.length;

/* ---------------------------------------------------------------- AUTO */

/* Exports and const keys. Members are listed with the v5 const name, so
 * `ToastTypes.brand` lands on `ToastVariant.prominent` in one step. */
const IDENTIFIERS = {
  "ToastTypes.brand": "ToastVariant.prominent",
  "ToastTypes.error": "ToastVariant.danger",
  "ButtonVariant.brand": "ButtonVariant.prominent",
  "CheckboxVariant.brand": "CheckboxVariant.prominent",
  "LoadingSpinnerColor.brand": "LoadingSpinnerColor.prominent",
  "ButtonSize.default": "ButtonSize.standard",
  "TabSize.default": "TabSize.standard",
  "ToggleSize.default": "ToggleSize.standard",
  "TextDropdownSize.default": "TextDropdownSize.standard",
  "AvatarSize.small": "AvatarSize.sm",
  "IconSize.tiny": "IconSize.sm",
  "IconSize.standard": "IconSize.rg",
  "IconSize.medium": "IconSize.md",
  "ToggleVariant.secondary": "ToggleVariant.ghost",
  TwoWayToggleItemProps: "ToggleSwitchItemProps",
  TwoWayToggleItem: "ToggleSwitchItem",
  TwoWayToggleProps: "ToggleSwitchProps",
  TwoWayToggle: "ToggleSwitch",
  ToastTypes: "ToastVariant",
  TooltipTypes: "TooltipVariant",
  FontAxes: "FontAxis",
  ProgressIndicatorVariants: "ProgressIndicatorVariant",
  inverseTheme: "themeInverse",
};
const IDENT_RE = new RegExp(
  `(?<![\\w$.])(${Object.keys(IDENTIFIERS).sort(byLength).map(esc).join("|")})(?![\\w$])`,
  "g",
);

/* Token names, in CSS and in strings. An override keeps the value you set, so
 * it renders as before. Some defaults changed under the new name (the brand
 * colour, the focus rings, --ui-icon-large); the skill lists them. */
const TOKENS = {
  "--ui-color-brand-border-disabled": "--ui-color-prominent-border-disabled",
  "--ui-color-brand-border-active": "--ui-color-prominent-border-active",
  "--ui-color-brand-border-hover": "--ui-color-prominent-border-hover",
  "--ui-color-brand-foreground": "--ui-color-prominent-foreground",
  "--ui-color-brand-border": "--ui-color-prominent-border",
  "--ui-color-brand-active": "--ui-color-prominent-active",
  "--ui-color-brand-hover": "--ui-color-prominent-hover",
  "--ui-color-brand": "--ui-color-prominent",
  "--ui-brand-color-alt": "--ui-prominent-color-ter",
  "--ui-brand-color": "--ui-prominent-color",
  "--ui-color-error-primary": "--ui-color-danger-primary",
  "--ui-color-error-secondary": "--ui-color-danger-secondary",
  "--ui-color-page-background": "--ui-color-surface-page",
  "--ui-color-border-focus": "--ui-color-input-border-focus",
  "--ui-color-trigger-border-hover": "--ui-color-input-border-hover",
  "--ui-color-trigger-border-error-focus": "--ui-color-input-border-danger-focus",
  "--ui-color-focus-ring-brand": "--ui-color-focus-ring-prominent",
  "--ui-color-focus-ring-error": "--ui-color-focus-ring-danger",
  "--ui-shadow-focus-brand": "--ui-shadow-focus-prominent",
  "--ui-radius-standard": "--ui-radius-normal",
  "--ui-icon-tiny": "--ui-icon-sm",
  "--ui-icon-standard": "--ui-icon-rg",
  "--ui-icon-medium": "--ui-icon-md",
  "--ui-icon-large": "--ui-icon-lg",
  "--ui-icon-stroke": "--ui-icon-stroke-width",
};
const TOKEN_RE = new RegExp(
  `(?<![\\w-])(${Object.keys(TOKENS).sort(byLength).map(esc).join("|")})(?![\\w-])`,
  "g",
);

/* Tailwind theme keys (utilities and the --color-* / --radius-* / --shadow-*
 * variables). Some keys are only renamed under one prefix. */
const KEYS = {
  "brand-border-disabled": "prominent-border-disabled",
  "brand-border-active": "prominent-border-active",
  "brand-border-hover": "prominent-border-hover",
  "brand-border": "prominent-border",
  "brand-color-alt": "prominent-color-ter",
  "brand-color": "prominent-color",
  "brand-hover": "prominent-hover",
  "brand-active": "prominent-active",
  "brand-fg": "prominent-fg",
  brand: "prominent",
  "error-primary": "danger-primary",
  "error-secondary": "danger-secondary",
  "page-background": "surface-page",
  "trigger-border-error-focus": "input-border-danger-focus",
  "trigger-border-hover": "input-border-hover",
  "border-focus": "input-border-focus",
  "focus-brand": "focus-prominent",
  "focus-error": "focus-danger",
  standard: "normal",
};
const KEY_PREFIX =
  "--color|--radius|--shadow|bg|text|border(?:-[trblxyse])?|ring|ring-offset|outline|fill|stroke|divide|placeholder|caret|accent|decoration|from|via|to|shadow|rounded(?:-[trblse]{1,2})?";
const KEY_RE = new RegExp(
  `(?<![\\w-])(-?(?:${KEY_PREFIX})-)(${Object.keys(KEYS).sort(byLength).map(esc).join("|")})(?![\\w-])`,
  "g",
);
const keyApplies = (prefix, key) => {
  if (key === "standard") return /^-?(rounded|--radius)/.test(prefix);
  if (key === "focus-brand" || key === "focus-error") return /^-?(shadow|--shadow)-$/.test(prefix);
  return true;
};

/* Classes renamed one to one. */
const CLASSES = {
  "ds-focus-ring-error-on-focus": "ds-focus-ring-danger-on-focus",
};
const CLASS_RE = new RegExp(
  `(?<![\\w-])(${Object.keys(CLASSES).map(esc).join("|")})(?![\\w-])`,
  "g",
);

/* DS colour names, only where a DS colour is expected: the `color` and
 * `stepColor` props, resolveDsColor() and DS_COLOR_TOKENS[]. Those props also
 * take any CSS colour, so a v5 name compiles and paints nothing. */
const COLORS = {
  "brand-color-alt": "prominent-color-ter",
  "brand-color": "prominent-color",
  brand: "prominent",
  "error-primary": "danger-primary",
  "error-secondary": "danger-secondary",
  "page-background": "surface-page",
};
const COLOR_RE = new RegExp(
  `((?<![\\w$-])(?:color|stepColor)\\s*=\\s*\\{?\\s*|resolveDsColor\\(\\s*|DS_COLOR_TOKENS\\[\\s*)(["'\`])(${Object.keys(COLORS).sort(byLength).map(esc).join("|")})\\2`,
  "g",
);

/* -------------------------------------------------------------- REPORT */

const MOTION = {
  "--ui-reveal-change-in-duration": "--ui-motion-duration-slower",
  "--ui-reveal-change-out-duration": "--ui-motion-duration-slow",
  "--ui-reveal-change-ease": "--ui-motion-ease-enter",
  "--ui-roll-change-in-duration": "--ui-motion-duration-slow",
  "--ui-roll-change-out-duration": "--ui-motion-duration-base",
  "--ui-roll-change-in-ease": "--ui-motion-ease-enter",
  "--ui-roll-change-out-ease": "--ui-motion-ease-exit",
  "--ui-roll-hover-duration": "--ui-motion-duration-slower",
  "--ui-rolling-digits-duration": "--ui-motion-duration-base",
  "--ui-rolling-digits-enter-duration": "--ui-motion-duration-slow",
  "--ui-rolling-digits-exit-duration": "--ui-motion-duration-base",
  "--ui-rolling-digits-ease": "--ui-motion-ease-enter",
  "--ui-sidebar-icon-duration": "--ui-motion-duration-slow",
  "--ui-sidebar-icon-hover-duration": "--ui-motion-duration-base",
  "--ui-sidebar-icon-ease": "--ui-motion-ease-enter",
  "--ui-underline-link-duration": "--ui-motion-duration-slowest",
  "--ui-underline-link-ease": "--ui-motion-ease-enter",
};

/* [pattern, why]. Each pattern matches a name that does not exist in v6. */
const REPORT = [
  [
    new RegExp(`(?<![\\w-])(?:${Object.keys(MOTION).sort(byLength).map(esc).join("|")})(?![\\w-])`, "g"),
    (m) => `per-component motion token removed; the shared scale step is ${MOTION[m]}, but overriding it retunes every component on that step. Read the skill's motion table`,
  ],
  [/(?<![\w-])--ui-min-w-menu-action(?![\w-])/g, () => "removed, no replacement: menus have no 144px floor"],
  [/(?<![\w-])--ui-min-w-cta-pill-big(?![\w-])/g, () => "removed, no replacement: the big CTA pill hugs its content"],
  [/(?<![\w-])--ui-size-cta-icon(?![\w-])/g, () => "split: --ui-size-cta-icon-standard (22px) or --ui-size-cta-icon-big (26px)"],
  [/(?<![\w-])--ui-height-tab-micro(?![\w-])/g, () => "merged into --ui-height-button-micro (28px), which micro icon buttons share"],
  [
    /(?<![\w-])ds-focus-ring(?![\w-])/g,
    () =>
      "the v5 class drew the ring always; no v6 class does. To keep it: outline: var(--ui-focus-ring-width) solid var(--ui-color-focus-ring-prominent). ds-focus-ring-on-focus draws it on :focus only",
  ],
  [/(?<![\w-])ds-disabled-control(?![\w-])/g, () => "ds-disabled-state, which also fades [aria-disabled=\"true\"]"],
  [/(?<![\w-])ds-menu-w-(?:standard|action|complex)(?![\w-])/g, () => "removed: give DropdownMenuSection a width"],
  [/(?<![\w-])ds-size-cta-icon(?![\w-])/g, () => "split: ds-size-cta-icon-standard or ds-size-cta-icon-big"],
  [/(?<![\w-])ds-min-w-cta-pill-big(?![\w-])/g, () => "removed: the pill hugs its content"],
  [
    /(?<![\w-])ds-(?:p-ui-xs|px-ui-xs|py-ui-xs|py-ui-rg|pl-ui-md|pl-ui-rg|pr-ui-rg|pr-ui-sm|gap-ui-xs|my-ui-xs)(?![\w-])/g,
    () => "spacing helper removed: use the v6 utility or property from the skill's helper table (after the --spacing shift)",
  ],
  [/(?<![\w-])h-tab-micro(?![\w-])/g, () => "removed: h-button-micro is 28px (micro tabs were 30px)"],
  [/(?<![\w$])Shapes\.gem(?![\w$])/g, () => "GemShape is removed: Shapes.diamond is the closest"],
  [/(?<![\w$])ShapeButtons\.(?:arrow|gem|star)(?![\w$])/g, () => "ShapeButton offers clover, cookie, diamond, puff, squircle"],
  [
    /(?<![\w$])SegmentedVariant\.(?:ghostSmall|micro)(?![\w$])/g,
    (m) =>
      `two edits: variant={SegmentedVariant.ghost} size={SegmentedSize.standard} on the root, AND size={TabSize.${m.endsWith("micro") ? "micro" : "sm"}} on every SegmentedTabItem (without it the items render taller)`,
  ],
  [
    /(?<![\w$])SegmentedVariant\.(?:secondary|secondarySmall|primarySmall)(?![\w$])/g,
    () => "variant is now primary | ghost plus a size prop: read the skill's SegmentedTabSelect table",
  ],
];

/* Exports removed with no rename. Reported only when imported from the DS,
 * so a date library's isSameDay is left alone. */
const REMOVED_EXPORTS = {
  DropdownMenuCheckboxItem: "DropdownMenuMultiSelectItem (and selectType on DropdownMenu)",
  DropdownMenuVariant: "removed: drop `variant`; widen with DropdownMenuSection width",
  GemShape: "removed: DiamondShape is the closest",
  formatTriggerLabel: "no longer exported: keep your own copy",
  formatSingleLabel: "no longer exported: keep your own copy",
  formatRangeLabel: "no longer exported: keep your own copy",
  isSameDay: "no longer exported: keep your own copy",
  startOfDay: "no longer exported: keep your own copy",
  serializeAxes: "no longer exported: keep your own copy",
  checkboxVariants: "no longer exported: render Checkbox",
};
const DS_IMPORT_RE =
  /((?:import|export)\s+(?:type\s+)?\{)([^}]*)(\}\s*from\s*["']@dooph-software\/design-system["'])/g;

/* ---------------------------------------------------------- DONE CHECK */

/* Every v5 DS name, in any form: the skill's step-6 patterns, run here so the
 * check needs no rg or PCRE. Applied to the code after the AUTO renames; a hit
 * that a REPORT entry already covers is not listed twice, and doc-comment
 * lines are skipped as for REPORT. Entry: [pattern, key group, kind]. The key
 * group holds a theme key; the hit is skipped when the app declares that key
 * itself (`--color-brand: …`). Each remaining hit fails the run. */
const DONE_CHECK = [
  [/--ui-(?:color-brand|brand-color|color-error-|color-page-background|color-border-focus|color-trigger-border|color-focus-ring-(?:brand|error)|shadow-focus-brand|radius-standard|icon-(?:tiny|standard|medium|large)|icon-stroke(?![\w-])|height-tab-micro|size-cta-icon(?![\w-])|min-w-menu-action|min-w-cta-pill-big)/g],
  [/--ui-(?:reveal-change-(?:in-duration|out-duration|ease)|roll-change-(?:in|out)-(?:duration|ease)|roll-hover-duration|rolling-digits-(?:duration|enter-duration|exit-duration|ease)|sidebar-icon-(?:duration|hover-duration|ease)|underline-link-(?:duration|ease))(?![\w-])/g],
  [/(?<![\w-])-?(?:bg|text|border|ring|outline|fill|stroke|shadow|from|via|to)-(brand(?:-[\w-]+)?|error-(?:primary|secondary)|page-background|trigger-border[\w-]*|border-focus|focus-(?:brand|error))(?![\w-])/g, 1, "theme"],
  [/(?<![\w-])--(?:color|radius|shadow)-(brand[\w-]*|error-(?:primary|secondary)|page-background|trigger-border[\w-]*|border-focus|standard|focus-(?:brand|error))(?![\w-])/g, 1, "theme"],
  [/(?<![\w-])(?:rounded(?:-[trblse]{1,2})?-(standard)|h-tab-micro|ds-focus-ring|ds-focus-ring-error-on-focus|ds-disabled-control|ds-menu-w-\w+|ds-size-cta-icon|ds-min-w-cta-pill-big|ds-(?:p|px|py|my|gap)-ui-xs|ds-py-ui-rg|ds-p[lr]-ui-(?:md|rg|sm))(?![\w-])/g, 1],
  [/(?<![\w$])(?:TwoWayToggle\w*|ToastTypes|TooltipTypes|FontAxes|ProgressIndicatorVariants|DropdownMenuCheckboxItem|DropdownMenuVariant|GemShape|inverseTheme)(?![\w$])/g],
  [/\b(?:ButtonVariant|CheckboxVariant|LoadingSpinnerColor)\.brand\b|\b(?:ButtonSize|TabSize|ToggleSize|TextDropdownSize)\.default\b|\bAvatarSize\.small\b|\bIconSize\.(?:tiny|standard|medium)\b|\bToggleVariant\.secondary\b|\bShapes\.gem\b|\bShapeButtons\.(?:arrow|gem|star)\b|\bSegmentedVariant\.(?:ghostSmall|micro|secondary|secondarySmall|primarySmall)\b/g],
  [/(?:(?:color|stepColor)=\{?\s*|resolveDsColor\(\s*|DS_COLOR_TOKENS\[\s*)["'](?:brand|brand-color|brand-color-alt|error-primary|error-secondary|page-background)["']/g],
];
const DONE_WHY = {
  theme:
    "a v5 DS theme name the renames did not cover. Without the preset, v6 ships no such class or variable: use the v6 utility in your own Tailwind build, or var(--ui-…) in your CSS (skill steps 3–4)",
  name: "a v5 DS name the renames did not cover (another form, or a place the codemod does not rewrite): fix it by the skill's tables",
};

/* ------------------------------------------------------------ ADVISORY */

const ADVISORY = [
  [/(?<![\w-])ds-px-ui-sm(?![\w-])/g, () => "same name, now 8px (v5: 10px). If this is v5 code, use px-rg or padding-inline: var(--ui-spacing-rg)"],
  [/\b(?:buttonVariants|tabTriggerVariants)\(/g, () => "the recipe no longer sets typography: render the text through ButtonText (`as`) or use <Button asChild>"],
  [/\b(?:get|query|find)(?:All)?ByRole\(\s*["']status["']/g, () => "LoadingSpinner is role=\"progressbar\" now"],
  [/\b(?:get|query|find)(?:All)?ByRole\(\s*["']slider["']/g, () => "a Slider thumb labelled by aria-labelledby takes that label as its name now (v5: \"Value\"): query the label text"],
  [/<\w*Icon\b(?![^>\n]*\saria-hidden\b)[^>\n]*\saria-label(?:ledby)?\s*=/g, () => "a labelled icon is no longer aria-hidden: its label is read and joins the name of a button or link around it. Pass aria-hidden to keep it hidden"],
  [/(["'`])(?:brand-color-alt|brand-color|error-primary|error-secondary|page-background)\1/g, () => "a v5 DS colour name outside a color prop: rename it if it reaches one"],
];

/* The text of a JSX opening tag, from `start` to its closing `>` (braces and
 * quotes skipped). */
function openingTag(text, from, start) {
  let depth = 0;
  let quote = null;
  let j = from;
  for (; j < text.length; j++) {
    const c = text[j];
    if (quote) {
      if (c === quote) quote = null;
    } else if (c === '"' || c === "'" || c === "`") quote = c;
    else if (c === "{") depth++;
    else if (c === "}") depth--;
    else if (c === ">" && depth === 0) break;
  }
  return text.slice(start, j);
}
const has = (tag, prop) => new RegExp(`\\s${prop}\\s*=`).test(tag);

/* [component, check(tag) -> { what, why } | null]. No rename marks these, so
 * the component name is the only handle. */
const TAG_CHECKS = [
  [
    "SegmentedTabSelect",
    (tag) => {
      // A ghost tag with no size is not checked here: v5 `ghost` (no shell)
      // and a migrated v5 default (`ghost`, shell kept) read the same. The
      // one-time --spacing run, which sees v5 code, lists v5 ghost tags.
      if (has(tag, "variant")) return null;
      return {
        what: "without variant",
        why: "if this is v5 code, its default was a shell with a ghost active tab. Add variant={SegmentedVariant.ghost} and NO size: that keeps a shell and the ghost tab (v6's shell is 38px with 28px items; v5's was 52px with 38px items, which v6 has no setting for). With no variant, v6 draws a filled (primary) active tab",
      };
    },
  ],
  [
    "ShapeButton",
    (tag) =>
      has(tag, "variant")
        ? null
        : {
            what: "without variant",
            why: "the default is now prominent (a violet shape); v5 painted it grey in the secondary colours: add variant={ShapeButtonVariant.primary} for the neutral look",
          },
  ],
  [
    "PopoverContent",
    (tag) =>
      has(tag, "sideOffset") ? null : { what: "without sideOffset", why: "sits 6px from the trigger (v5: 4px): sideOffset={4} keeps the old gap" },
  ],
  [
    "DatePicker",
    (tag) =>
      has(tag, "contentProps")
        ? null
        : { what: "without contentProps", why: "the panel sits 6px from the trigger (v5: 4px): contentProps={{ sideOffset: 4 }} keeps the old gap" },
  ],
  [
    "CTAButton",
    () => ({
      what: "",
      why: "measured differently: 22 / 26px icon, 60px standard label gap, 16px padding on both sizes, the big pill hugs its content (v5: min 370px). Re-check the layout around it",
    }),
  ],
  [
    "DropdownTrigger",
    () => ({ what: "", why: "wider: ends in a caret square as tall as the trigger, with no right padding (v5: 14px chevron + 10px padding)" }),
  ],
  [
    "TypeableDropdownTrigger",
    () => ({ what: "", why: "wider: ends in a caret square as tall as the trigger, with no right padding (v5: 14px chevron + 10px padding)" }),
  ],
];

/* ----------------------------------------------------------- SPACING */

const STEP = { xs: "sm", sm: "rg", rg: "md", md: "lg", lg: "xl", xl: "xxl", xxl: "xxxl" };
const UTIL =
  "p|px|py|pt|pr|pb|pl|ps|pe|m|mx|my|mt|mr|mb|ml|ms|me|gap|gap-x|gap-y|space-x|space-y|inset|inset-x|inset-y|top|right|bottom|left|start|end|w|h|size|min-w|min-h|max-w|max-h|inline|min-inline|max-inline|basis|scroll-m|scroll-p|translate-x|translate-y";
const SPACING_PREFIX = `(--ui-spacing-|(?<![\\w-])--spacing-|(?<![\\w-])-?(?:${UTIL})-)`;
const SPACING_RE = new RegExp(`${SPACING_PREFIX}(xxl|xl|lg|md|rg|sm|xs)(?![\\w-])`, "g");
const SPACING_TOKEN_RE = /(--ui-spacing-)(xxl|xl|lg|md|rg|sm|xs)(?![\w-])/g;
const V6_ONLY_STEP_RE = new RegExp(`${SPACING_PREFIX}(xxxs|xxxl)(?![\\w-])`, "g");

/* ----------------------------------------------------------- walking */

const unreadable = [];

function walk(dir, out = []) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch (err) {
    unreadable.push({ path: dir, code: err.code ?? err.message });
    return out;
  }
  for (const name of entries) {
    if (SKIP.has(name)) continue;
    const p = join(dir, name);
    let st;
    try {
      st = statSync(p);
    } catch (err) {
      if (EXT.has(extname(p))) unreadable.push({ path: p, code: err.code ?? err.message });
      continue;
    }
    if (st.isDirectory()) walk(p, out);
    else if (EXT.has(extname(p))) out.push(p);
  }
  return out;
}

const files = [];
const seenFiles = new Set(); // overlapping paths (`. app`) scan each file once
for (const root of ROOTS) {
  let rootStat;
  try {
    rootStat = statSync(root);
  } catch (err) {
    console.error(`codemod: cannot read ${root} (${err.code ?? err.message})`);
    process.exit(2);
  }
  for (const f of rootStat.isDirectory() ? walk(root) : [root]) {
    const key = resolve(f);
    if (!seenFiles.has(key)) {
      seenFiles.add(key);
      files.push(f);
    }
  }
}

const sources = [];
for (const file of files) {
  try {
    sources.push({ file, text: readFileSync(file, "utf8") });
  } catch (err) {
    unreadable.push({ path: file, code: err.code ?? err.message });
  }
}

/* Does this app compile Tailwind with the DS preset? */
const PRESET =
  PRESET_FLAG ?? sources.some(({ text }) => /@dooph-software\/design-system\/theme\.css/.test(text));
const presetNote = PRESET
  ? "Tailwind preset: found (or --preset), so utility names are migrated too."
  : "Tailwind preset: no import of @dooph-software/design-system/theme.css found in the scanned paths,\n" +
    "so utility names are left alone. Pass --preset if your CSS entry is elsewhere.";

/* Theme keys the app declares itself are the app's own. */
const OWN_KEYS = new Set();
for (const { text } of sources) {
  for (const m of text.matchAll(/(?<![\w-])--(?:color|radius|shadow)-([\w-]+)\s*:/g)) OWN_KEYS.add(m[1]);
}

const lineOf = (text, index) => text.slice(0, index).split("\n").length;
// Doc-comment lines (` * …`, ` */`). Not a CSS universal selector (`* {`).
const isDocLine = (line) => /^\s*\*(\s|\/|$)/.test(line) && !/^\s*\*\s*[{,>+~]/.test(line);
const plural = (n, s) => `${n} ${s}${n === 1 ? "" : "s"}`;

function finish(code) {
  if (unreadable.length) {
    console.error("\n== COULD NOT READ ==");
    for (const u of unreadable) console.error(`  ${u.path}  (${u.code})`);
    process.exit(2);
  }
  process.exit(code);
}

/* ------------------------------------------------------- spacing mode */

if (SPACING) {
  const v6Only = [];
  const shifts = [];
  const resized = [];
  const helpers = [];
  const ghosts = [];
  for (const { file, text } of sources) {
    text.split("\n").forEach((line, i) => {
      for (const m of line.matchAll(V6_ONLY_STEP_RE)) v6Only.push(`${file}:${i + 1}  ${m[0]}`);
      for (const m of line.matchAll(/(?<![\w-])ds-px-ui-sm(?![\w-])/g)) helpers.push(`${file}:${i + 1}  ${m[0]}`);
    });
    // v5 `ghost` had no shell; in v6 a ghost tag with no size draws one. This
    // mode runs on v5 code only, so here `ghost` is known to be v5's.
    for (const m of text.matchAll(/<SegmentedTabSelect(?![\w$.])/g)) {
      const tag = openingTag(text, m.index + m[0].length, m.index);
      if (/\svariant\s*=\s*\{?\s*(?:SegmentedVariant\.ghost\b|["'`]ghost["'`])/.test(tag) && !has(tag, "size")) {
        ghosts.push(`${file}:${lineOf(text, m.index)}  <SegmentedTabSelect variant ghost>`);
      }
    }
    let count = 0;
    const after = text.replace(PRESET ? SPACING_RE : SPACING_TOKEN_RE, (whole, prefix, step, index) => {
      count++;
      if (step === "xl" || step === "xxl") {
        resized.push(`${file}:${lineOf(text, index)}  ${whole} -> ${prefix}${STEP[step]}  (${step === "xl" ? "28px -> 26px" : "40px -> 42px"})`);
      }
      return prefix + STEP[step];
    });
    if (count) shifts.push({ file, count, after });
  }

  if (v6Only.length && !FORCE) {
    console.error("\n== REFUSED: this code already uses v6-only spacing steps ==");
    for (const v of v6Only) console.error(`  ${v}`);
    console.error(`
  xxxs and xxxl exist only in v6, so this code looks already shifted. A second
  shift moves every spacing name down another step. If you are sure the shift
  has not run (you wrote these names yourself), re-run with --force.`);
    finish(3);
  }

  console.log(`\n${presetNote}`);
  console.log(WRITE ? "\n== SHIFTED (spacing scale) ==": "\n== WOULD SHIFT (spacing scale, dry run) ==");
  if (!shifts.length) console.log("  no v5 spacing names found");
  for (const s of shifts) {
    console.log(`  ${s.file}  (${plural(s.count, "name")})`);
    if (WRITE) writeFileSync(s.file, s.after, "utf8");
  }
  if (resized.length) {
    console.log("\n== NO EXACT v6 STEP: the nearest one is 2px off ==");
    for (const r of resized) console.log(`  ${r}`);
  }
  if (helpers.length) {
    console.log("\n== ds-px-ui-sm is 8px in v6 (v5: 10px); this shift does not touch it ==");
    for (const h of helpers) console.log(`  ${h}`);
    console.log("  For the v5 size use px-rg, or padding-inline: var(--ui-spacing-rg).");
  }
  if (ghosts.length) {
    console.log("\n== v5 ghost SegmentedTabSelect (no shell): v6 ghost draws a shell unless sized ==");
    for (const g of ghosts) console.log(`  ${g}`);
    console.log("  Add size={SegmentedSize.standard} to each. Only these: a ghost you add later for v5's");
    console.log("  default or secondary keeps its shell and takes no size.");
  }
  if (!WRITE && shifts.length) {
    console.log("\nRe-run with --spacing --write, exactly once. Commit before and after.");
  }
  finish(0);
}

/* -------------------------------------------------------- normal mode */

const renamed = [];
const report = [];
const advisory = [];

function dedupeImports(text) {
  return text.replace(DS_IMPORT_RE, (whole, open, body, close) => {
    const parts = body.split(",");
    const seen = new Map();
    parts.forEach((part, i) => {
      const spec = part.trim();
      if (!spec) return;
      const local = spec.replace(/^type\s+/, "").split(/\s+as\s+/).pop().trim();
      const isType = /^type\s/.test(spec);
      if (!seen.has(local)) seen.set(local, { i, isType });
      else if (seen.get(local).isType && !isType) {
        parts[seen.get(local).i] = null;
        seen.set(local, { i, isType });
      } else parts[i] = null;
    });
    if (!parts.includes(null)) return whole;
    return open + parts.filter((p) => p !== null).join(",") + close;
  });
}

for (const src of sources) {
  const { file, text: before } = src;
  let after = before;
  const count = (label) => (whole, ...rest) => {
    const to = label(whole, ...rest);
    if (to !== whole) renamed.push({ file, from: whole, to });
    return to;
  };
  after = after.replace(IDENT_RE, count((m) => IDENTIFIERS[m]));
  after = after.replace(TOKEN_RE, count((m) => TOKENS[m]));
  if (PRESET) {
    after = after.replace(
      KEY_RE,
      count((whole, prefix, key) => (keyApplies(prefix, key) && !OWN_KEYS.has(key) ? prefix + KEYS[key] : whole)),
    );
  }
  after = after.replace(CLASS_RE, count((m) => CLASSES[m]));
  after = after.replace(COLOR_RE, count((whole, lead, q, name) => `${lead}${q}${COLORS[name]}${q}`));
  after = dedupeImports(after);

  if (WRITE && after !== before) writeFileSync(file, after, "utf8");

  // Report on the code as it stands after the renames (line numbers do not move).
  const lines = after.split("\n");
  const covered = []; // [line, start, end] of each REPORT hit, so the done check skips it
  lines.forEach((line, i) => {
    if (isDocLine(line)) return;
    for (const [re, why] of REPORT) {
      re.lastIndex = 0;
      for (const m of line.matchAll(re)) {
        report.push({ file, line: i + 1, text: m[0], why: why(m[0]) });
        covered.push([i + 1, m.index, m.index + m[0].length]);
      }
    }
    for (const [re, why] of ADVISORY) {
      re.lastIndex = 0;
      for (const m of line.matchAll(re)) advisory.push({ file, line: i + 1, text: m[0], why: why(m[0]) });
    }
  });

  for (const m of after.matchAll(DS_IMPORT_RE)) {
    const start = m.index + m[1].length;
    let offset = 0;
    for (const part of m[2].split(",")) {
      const name = part.trim().replace(/^type\s+/, "").split(/\s+as\s+/)[0].trim();
      if (REMOVED_EXPORTS[name]) {
        const at = start + offset + part.indexOf(name);
        const col = at - (after.lastIndexOf("\n", at - 1) + 1);
        report.push({ file, line: lineOf(after, at), text: name, why: REMOVED_EXPORTS[name] });
        covered.push([lineOf(after, at), col, col + name.length]);
      }
      offset += part.length + 1;
    }
  }

  // The done check: any v5 DS name still here that no entry above reported.
  lines.forEach((line, i) => {
    if (isDocLine(line)) return;
    for (const [re, keyGroup, kind] of DONE_CHECK) {
      re.lastIndex = 0;
      for (const m of line.matchAll(re)) {
        if (keyGroup && m[keyGroup] && OWN_KEYS.has(m[keyGroup])) continue;
        const s = m.index;
        const e = s + m[0].length;
        if (covered.some(([l, a, b]) => l === i + 1 && a < e && s < b)) continue;
        report.push({ file, line: i + 1, text: m[0], why: REMOVED_EXPORTS[m[0]] ?? DONE_WHY[kind ?? "name"] });
        covered.push([i + 1, s, e]);
      }
    }
  });

  // JSX call sites whose look changed with no rename (defaults, offsets,
  // measurements). Each check reads the whole opening tag.
  for (const [name, check] of TAG_CHECKS) {
    for (const m of after.matchAll(new RegExp(`<${name}(?![\\w$.])`, "g"))) {
      const tag = openingTag(after, m.index + m[0].length, m.index);
      const result = check(tag);
      if (result) advisory.push({ file, line: lineOf(after, m.index), text: `<${name}> ${result.what}`.trim(), why: result.why });
    }
  }
}

console.log(`\n${presetNote}`);
console.log("If you have not yet run the one-time spacing shift, run --spacing first (see the skill).");

console.log(WRITE ? "\n== APPLIED (renames) ==" : "\n== WOULD RENAME (dry run) ==");
if (!renamed.length) console.log("  nothing to rename");
const grouped = new Map();
for (const r of renamed) {
  const k = `${r.file}  ${r.from} -> ${r.to}`;
  grouped.set(k, (grouped.get(k) ?? 0) + 1);
}
for (const [k, n] of grouped) console.log(`  ${k}  (${plural(n, "use")})`);

console.log("\n== NEEDS A HUMAN (fails the run until fixed) ==");
if (!report.length) console.log("  none found");
for (const r of report) console.log(`  ${r.file}:${r.line}  ${r.text}  ->  ${r.why}`);

console.log("\n== CHECK BY EYE (does not fail the run) ==");
if (!advisory.length) console.log("  none found");
for (const a of advisory) console.log(`  ${a.file}:${a.line}  ${a.text}  ->  ${a.why}`);

const renamesPending = !WRITE && renamed.length > 0;
if (renamesPending) console.log("\nRe-run with --write to apply the renames.");

/* Exit 0 is only the code half of "done". Print the skill's step 6.4 list so
 * the hand-back reproduces it item by item instead of summarising it. */
if (!renamesPending && !report.length) {
  console.log("\n== VISUAL CHECK (paste into your hand-back; mark each seen or not seen, with why) ==");
  for (const item of [
    "spacing on a page that used xl / xxl steps (2px off; list the sites you left) or ds-px-ui-sm",
    "one prominent (ex-brand) button",
    "one ghost button and other ghost text (TextLink, TextDropdownTrigger)",
    "every ShapeButton",
    "every SegmentedTabSelect: shell or no shell as in v5, item height",
    "every tab row and toggle (narrower padding)",
    "a popover and the DatePicker panel (offset)",
    "every CTAButton",
    "every dropdown trigger (DropdownTrigger, TypeableDropdownTrigger)",
    "anything that used ds-focus-ring",
    "a dark-mode page with a colour override",
    "anything styled with buttonVariants() or tabTriggerVariants()",
    "any element with shadow-standard",
  ]) console.log(`  - not seen (why: …): ${item}`);
  console.log("The migration is done only when every line above reads seen.");
}
finish(renamesPending || report.length ? 1 : 0);
