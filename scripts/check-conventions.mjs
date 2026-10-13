/*
 * check-conventions.mjs — the design system's measurable rules, run by
 * `npm run lint` after `tsc --noEmit`.
 *
 * ## behavior
 * - `node scripts/check-conventions.mjs` runs every check in CHECKS over src/
 *   (.ts/.tsx/.css). Each violation prints one line,
 *   `FAIL <check name>: <file:line> <match>`, then each failed check prints its
 *   one-line why, and the script exits 1. With no violation it prints
 *   `conventions: N checks passed` and exits 0.
 * - `--fixtures [dir]` (dir defaults to scripts/check-conventions.fixtures/)
 *   runs the checks that have fixtures over that dir instead of src/, with the
 *   dir's allowlists.json in place of the allowlists below. It exits 0 only when
 *   every fixture file `<check-id>[.<case>].<ext>` is reported exactly once, by
 *   the check with that id, every other file (`*.ok.*` near-misses and support
 *   files) reports nothing, and every check reports at least one file. See the
 *   fixture dir's README.txt.
 * - Repo-level checks (`fixtures: false`, e.g. the generated-theme check) run
 *   only in the normal mode, because they read fixed paths, not the scan root.
 * - Paths are root-relative for scoping (`components/Text/`, `styles/tokens.css`)
 *   and repo-relative in output, so the same scoping holds in fixture mode.
 *
 * ## Adding a check
 * Append ONE object to CHECKS, nothing else:
 *   { id, name, why, run(ctx) => Violation[] }          // code check: add a fixture
 *   { id, name, why, fixtures: false, run(ctx) => [...] } // repo-level check
 * - `id` is kebab-case; it names the check's fixture files.
 * - `name` and `why` are quoted verbatim by the maintainer skills.
 * - A Violation is { file, line, match }. `file` is repo-relative (use `f.path`
 *   for a scanned file, or `repoRel(abs)` for anything else).
 * - `ctx.files` holds every scanned file as { path, rel, ts, css, story,
 *   generated, raw, code } where `code` is the source with comments blanked out
 *   (offsets and line numbers unchanged). Match `code`, never `raw`. Helpers:
 *   `scan(files, regex)` (every match is a violation) and `lineOf(code, index)`.
 * - A repo-level check that wraps a generator calls the generator's own
 *   write-nothing `--check` mode with `runCheckMode()`, as the generated-theme
 *   check does with sync-theme.mjs.
 *
 * ## constraints
 * - Check names and whys are a contract: the maintainer skills cite them word
 *   for word ("lint check: text-style classes outside Text components").
 *   Renaming one means updating every skill that cites it, in the same change.
 * - Code checks match comment-blanked source. A header contract must be able to
 *   name a forbidden class without failing lint, and line numbers must stay true.
 * - Lint stays fast: no browser, no build, no network, nothing written. A repo
 *   check calls a generator only through its in-memory `--check` mode.
 * - A regex fix that removes a false positive keeps its fixture catching the
 *   real violation; add the near-miss to that fixture so it cannot come back.
 * - Every allowlist entry carries a reason and `needs`, the APIs the reason
 *   names. An entry whose file is gone, lost its directive or timer, or no
 *   longer uses what `needs` names FAILS, so the list cannot rot. Fix the entry
 *   (or the code), never the matching, to make it pass.
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_FIXTURES = "scripts/check-conventions.fixtures";
const posix = (p) => p.split(path.sep).join("/");
const repoRel = (abs) => posix(path.relative(REPO, abs));
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// ── Source loading ────────────────────────────────────────────────────────────
const blank = (s) => s.replace(/[^\n]/g, " ");
/** Blank out comments, keeping every offset (so line numbers stay true). */
function stripComments(src, ts) {
  let out = src.replace(/\/\*[\s\S]*?\*\//g, blank);
  // `//` not preceded by `:` (URLs), a quote or a backslash.
  if (ts) out = out.replace(/(^|[^:"'`\\])(\/\/.*)$/gm, (_, a, b) => a + blank(b));
  return out;
}
const GENERATED_BLOCK = /\/\* __GENERATED_THEME_START__ \*\/[\s\S]*?\/\* __GENERATED_THEME_END__ \*\//;

function loadFiles(root) {
  const out = [];
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (/\.(tsx?|css)$/.test(e.name)) {
        const rel = posix(path.relative(root, p));
        const ts = /\.tsx?$/.test(rel);
        const raw = fs.readFileSync(p, "utf8");
        out.push({
          path: repoRel(p),
          rel,
          ts,
          css: !ts,
          story: /\.stories\.tsx?$/.test(rel),
          // Written by scripts (sync-theme.mjs, generate-icon-exports.mjs).
          // Their freshness is checked by the generators' own --check modes.
          generated: rel === "styles/theme.css" || rel === "components/Icons/index.ts",
          raw,
          code: stripComments(raw, ts).replace(GENERATED_BLOCK, blank),
        });
      }
    }
  };
  walk(root);
  return out.sort((a, b) => (a.path < b.path ? -1 : 1));
}

const lineOf = (s, i) => {
  let n = 1;
  for (let k = 0; k < i; k++) if (s.charCodeAt(k) === 10) n++;
  return n;
};
const short = (s) => s.replace(/\s+/g, " ").trim().slice(0, 80);
/** Every match of `re` (global) in each file's comment-blanked code is a violation. */
function scan(files, re, keep = () => true) {
  const v = [];
  for (const f of files)
    for (const m of f.code.matchAll(re))
      if (keep(m, f)) v.push({ file: f.path, line: lineOf(f.code, m.index), match: short(m[0]) });
  return v;
}

// File sets shared by the checks (all non-generated):
//   code(ctx)  .ts/.tsx/.css, stories excluded       codeTs(ctx) the .ts/.tsx part
//   tsx(ctx)   .ts/.tsx, stories included             text(ctx)   tsx minus the Text exemption
const code = (ctx) => ctx.files.filter((f) => !f.story && !f.generated);
const codeTs = (ctx) => code(ctx).filter((f) => f.ts);
const tsx = (ctx) => ctx.files.filter((f) => f.ts && !f.generated);
// The Text components and the tailwind-merge registry must name the role classes.
const TEXT_EXEMPT = (f) =>
  f.rel.startsWith("components/Text/") || f.rel === "utils/cn.ts" || f.rel === "utils/twMergeTheme.ts";
const text = (ctx) => tsx(ctx).filter((f) => !TEXT_EXEMPT(f));
const TOKENS_REL = "styles/tokens.css";

/** Run a generator's write-nothing `--check` mode; each `stale <path>` line it prints is a violation. */
function runCheckMode(script) {
  const r = spawnSync(process.execPath, [path.join(REPO, script), "--check"], { cwd: REPO, encoding: "utf8" });
  if (r.status === 0) return [];
  const stale = (r.stdout || "").split("\n").map((l) => l.match(/^stale (\S+)/)).filter(Boolean);
  if (stale.length) return stale.map((m) => ({ file: m[1], line: 1, match: `out of date; run node ${script}` }));
  return [{ file: script, line: 1, match: `--check failed: ${short(r.stderr || r.stdout || `exit ${r.status}`)}` }];
}

// ── Allowlists ────────────────────────────────────────────────────────────────
// `needs`: what the reason says the file uses. A string is matched as a whole
// identifier (or dotted name like navigator.clipboard) in the comment-blanked
// code; a RegExp as written.
const USE_CLIENT_ALLOWLIST = [
  { file: "src/components/AIChat/AIModelSelect.tsx", needs: [/\bonValueChange=\{\(/],
    reason: "Builds an inline onValueChange closure for SliderLabeled that maps the slider index back to the consumer's step value." },
  { file: "src/components/AIChat/AIPromptInput.tsx", needs: ["createContext", "useState", "useLayoutEffect"],
    reason: "createContext shares the composer state with its parts, useState holds the uncontrolled value, useLayoutEffect sizes the textarea to its scrollHeight." },
  { file: "src/components/AIChat/AIThinkingPart.tsx", needs: ["useState"],
    reason: "useState holds the uncontrolled disclosure open state." },
  { file: "src/components/AnimatedText/ChangeSwapShell.tsx", needs: ["useChangeSwap"],
    reason: "Calls useChangeSwap, whose useState/useRef keep the outgoing copy mounted until its animationend." },
  { file: "src/components/AnimatedText/RevealChangeText.tsx", needs: ["useState", "useRef", "useEffect", "ResizeObserver"],
    reason: "useState/useRef/useEffect run the collapse-then-reveal slot; a ResizeObserver measures the content width the slot animates to." },
  { file: "src/components/AnimatedText/RollingDigitsText.tsx", needs: ["useState"],
    reason: "useState (inside useWheels) holds every digit wheel, reconciled during render." },
  { file: "src/components/AnimatedText/useChangeSwap.ts", needs: ["useState", "useRef"],
    reason: "The swap engine: useState holds the exiting and entering copies, useRef the content on screen." },
  { file: "src/components/Calendar/Calendar.tsx", needs: ["useState", "useRef", "useEffect"],
    reason: "useState holds the uncontrolled month, range anchor, hovered and focused day; useRef + useEffect restore focus to the focused day." },
  { file: "src/components/Calendar/CalendarCaption.tsx", needs: [/\bonSelect=\{\(\)\s*=>/, /\bonClick=\{\(\)\s*=>/],
    reason: "Builds inline onSelect/onClick closures for the month and year menus and the previous/next buttons." },
  { file: "src/components/Calendar/CalendarGrid.tsx", needs: [/\bonClick=\{\(\)\s*=>/, /\bonPointerEnter=\{\(\)\s*=>/],
    reason: "Attaches per-day onClick/onPointerEnter closures to the day buttons." },
  { file: "src/components/Calendar/CalendarPresetsPanel.tsx", needs: [/\bonClick=\{\(event\)\s*=>/],
    reason: "Attaches an inline onClick closure to each preset button." },
  { file: "src/components/CopyButton/CopyButton.tsx", needs: ["navigator.clipboard", "useState", "setTimeout"],
    reason: "Writes to navigator.clipboard, holds the copied state in useState and reverts it with setTimeout." },
  { file: "src/components/DatePicker/DatePicker.tsx", needs: [/\bonValueChange=\{props\.onValueChange\}/],
    reason: "No client hook of its own: it forwards the required onValueChange callback (and onOpenChange) into Calendar and Popover, so only client code can render it." },
  { file: "src/components/DatePicker/DatePickerSplitTrigger.tsx", needs: [/\bconst handlePresetChange\s*=/],
    reason: "Builds the handlePresetChange closure that turns a preset tab into its date range for onValueChange." },
  { file: "src/components/DropdownTrigger/DropdownTrigger.tsx", needs: ["useRef", /\bonKeyDown=\{\(event\)\s*=>/],
    reason: "useRef holds the input element, which the inline pointer and key handlers focus before Radix opens the menu." },
  { file: "src/components/Input/Input.tsx", needs: ["useState", "useRef"],
    reason: "useState holds the uncontrolled value, focus and committed value; useRef holds the input element." },
  { file: "src/components/Menu/DropdownMenu.tsx", needs: ["createContext", "useContext", "document.hasFocus"],
    reason: "createContext/useContext pass selectType to the items; the focus-loss guard reads document.hasFocus and document.contains." },
  { file: "src/components/Menu/DropdownMenuSearch.tsx", needs: [/\bconst handleKeyDown\s*=/],
    reason: "Builds the handleKeyDown closure that stops key events reaching the menu's typeahead." },
  { file: "src/components/MorphRotationShape/MorphRotationShape.tsx",
    needs: ["useState", "useRef", "useLayoutEffect", "requestAnimationFrame", "getComputedStyle", "addEventListener"],
    reason: "A requestAnimationFrame loop samples transitioned custom properties with getComputedStyle, wired in useLayoutEffect with addEventListener; useState/useRef hold the engine." },
  { file: "src/components/OutlineButton/OutlineButton.tsx", needs: ["useRef", "getBoundingClientRect"],
    reason: "The mouse-move handler reads getBoundingClientRect on a useRef element and writes the glow position as custom properties." },
  { file: "src/components/SegmentedTabSelect/SegmentedTabSelect.tsx", needs: ["createContext", "useContext"],
    reason: "createContext/useContext pass the tab variant and item size from the group to its items." },
  { file: "src/components/SidebarWithHoverIcon/SidebarWithHoverIcon.tsx",
    needs: ["useRef", "useLayoutEffect", "requestAnimationFrame", "getComputedStyle"],
    reason: "A requestAnimationFrame loop, started in useLayoutEffect, samples the rail's transitioned custom properties with getComputedStyle and rewrites the path." },
  { file: "src/components/Slider/Slider.tsx", needs: ["useState"],
    reason: "useState holds the uncontrolled value, the live drag value and the dragging/interacted flags." },
  { file: "src/components/Toast/Toast.tsx", needs: ["createContext", "useContext", "useState"],
    reason: "ToastProvider keeps the toast queue in useState and exposes it through createContext/useContext (useToast)." },
  { file: "src/components/Toggle/FancyToggleSwitch.tsx", needs: ["useNeverClearedValue"],
    reason: "Calls useNeverClearedValue (useState, in Toggle.tsx) so clicking the selected option never clears the value." },
  { file: "src/components/Toggle/Toggle.tsx", needs: ["useState", "createContext", "useContext"],
    reason: "useNeverClearedValue keeps the uncontrolled value in useState; createContext/useContext pass variant and size to the options." },
  { file: "src/components/VerificationCode/VerificationCodeInput.tsx", needs: ["useState", "useRef"],
    reason: "useState holds the uncontrolled digits; useRef holds the input elements and the moving-focus flag." },
];

// `count`: call sites of requestAnimationFrame / setTimeout / setInterval (comments excluded).
const TIMER_ALLOWLIST = [
  { file: "src/components/CopyButton/CopyButton.tsx", count: 1,
    reason: "setTimeout reverts the copied confirmation after REVERT_MS (2s); it is a state timeout, not a copy of a CSS duration." },
  { file: "src/components/MorphRotationShape/MorphRotationShape.tsx", count: 2,
    reason: "requestAnimationFrame (start + reschedule) samples the transitioned --ds-shape-morph-* properties each frame to redraw the morph, and stops once they settle." },
  { file: "src/components/SidebarWithHoverIcon/SidebarWithHoverIcon.tsx", count: 1,
    reason: "requestAnimationFrame samples the rail's transitioned custom properties each frame to rewrite the path's d, and stops at the target." },
];

// `line`: the exact (trimmed) source line whose hex literal is allowed.
const STYLESHEET_HEX_ALLOWLIST = [
  { file: "src/styles/index.css", line: "#000 var(--ui-roll-change-breathe),", needs: ["mask-image"],
    reason: "A mask-image gradient stop in .ds-change-swap: a mask reads only alpha, so #000 means fully shown, not a colour, and has nothing to follow in the theme." },
  { file: "src/styles/index.css", line: "#000 calc(100% - var(--ui-roll-change-breathe)),", needs: ["mask-image"],
    reason: "The second mask-image gradient stop in .ds-change-swap: alpha only, not a colour." },
];

// Not part of a longer identifier; a member access (`el.getBoundingClientRect`) still counts.
const needRe = (n) => (n instanceof RegExp ? n : new RegExp(`(?<![\\w$])${esc(n)}(?![\\w$])`));
const needLabel = (n) => (n instanceof RegExp ? `/${n.source}/` : n);

// ── Expression system (tokens.css markers, the practical preset, .ds-expr-* reads) ─
function scanRules(css, onRule) {
  const stack = [];
  let start = 0;
  for (let i = 0; i < css.length; i++) {
    const c = css[i];
    if (c === "{") {
      stack.push({ prelude: css.slice(start, i).trim(), open: i + 1 });
      start = i + 1;
    } else if (c === "}") {
      const top = stack.pop();
      if (top && !top.prelude.startsWith("@"))
        onRule(top.prelude, css.slice(top.open, i), top.open, stack.map((x) => x.prelude));
      start = i + 1;
    } else if (c === ";") start = i + 1;
  }
}

function expressionSystem(ctx) {
  const v = [];
  const T = ctx.tokens;
  if (!T) return [{ file: `${ctx.rootRel}/${TOKENS_REL}`, line: 1, match: "tokens file not found" }];
  const PRESET_SEL = '[data-ds-expression="practical"]';
  // Marked tokens: a declaration followed on the same line by /* expression */ (read from raw: it IS a comment).
  const marked = [...T.raw.matchAll(/(--[\w-]+)\s*:[^;\n]*;[ \t]*\/\*\s*expression\s*\*\//g)].map((m) => m[1]);
  if (marked.length === 0) return [{ file: T.path, line: 1, match: "no /* expression */ tokens found (marker regex broke?)" }];
  const alt = marked.map(esc).join("|");
  const readRe = new RegExp(`var\\(\\s*(${alt})(?![\\w-])`, "g");
  const setRe = new RegExp(`(^|[;{\\s])(${alt})\\s*:`, "g");
  const presetNames = [];
  let presetFound = false;
  for (const f of ctx.files.filter((x) => x.css)) {
    scanRules(f.code, (selector, body, bodyStart, at) => {
      const isTokens = f === T;
      const isPreset = isTokens && selector === PRESET_SEL && at.some((p) => /^@layer\s+ds\.expression\b/.test(p));
      const isDefault = isTokens && selector === ":root" && at.some((p) => /^@layer\s+ds\.tokens\b/.test(p));
      if (isPreset) {
        presetFound = true;
        for (const m of body.matchAll(/(--[\w-]+)\s*:/g)) presetNames.push(m[1]);
      }
      for (const m of body.matchAll(setRe))
        if (!isPreset && !isDefault)
          v.push({ file: f.path, line: lineOf(f.code, bodyStart + m.index + m[1].length), match: `sets ${m[2]} in "${short(selector)}" (only the tokens.css :root default and the practical preset may)` });
      for (const m of body.matchAll(readRe))
        if (!selector.includes(".ds-expr-"))
          v.push({ file: f.path, line: lineOf(f.code, bodyStart + m.index), match: `reads ${m[1]} in "${short(selector)}" (only .ds-expr-* rules may)` });
    });
  }
  if (!presetFound) v.push({ file: T.path, line: 1, match: `no ${PRESET_SEL} rule inside @layer ds.expression` });
  for (const n of marked) if (presetFound && !presetNames.includes(n)) v.push({ file: T.path, line: 1, match: `expression token ${n} is missing from the practical preset` });
  for (const n of presetNames) if (!marked.includes(n)) v.push({ file: T.path, line: 1, match: `the practical preset sets ${n}, which is not marked /* expression */` });
  for (const f of ctx.files.filter((x) => x.ts)) {
    for (const n of marked) {
      const e = esc(n);
      for (const m of f.code.matchAll(new RegExp(`\\[${e}\\s*:|["'\`]${e}["'\`]\\s*[:\\]]|setProperty\\(\\s*["'\`]${e}`, "g")))
        v.push({ file: f.path, line: lineOf(f.code, m.index), match: `sets ${n} (components never set expression tokens)` });
      for (const m of f.code.matchAll(new RegExp(`var\\(\\s*${e}(?![\\w-])`, "g")))
        v.push({ file: f.path, line: lineOf(f.code, m.index), match: `reads ${n} outside a .ds-expr-* CSS rule` });
    }
  }
  return v;
}

// ── Dark theme: aliases .dark must repeat, and redundant .dark lines ──────────
const LIGHT_BLOCK = /^:root\s*,\s*\.light\s*\{/m;
const DARK_BLOCK = /^\.dark\s*\{/m;
function blockAt(css, re) {
  const m = css.match(re);
  if (!m) return null;
  let i = css.indexOf("{", m.index) + 1;
  const start = i;
  let depth = 1;
  while (depth && i < css.length) {
    const c = css[i++];
    if (c === "{") depth++;
    else if (c === "}") depth--;
  }
  return { body: css.slice(start, i - 1), start };
}
function uiDecls(b) {
  const out = new Map();
  for (const m of b.body.matchAll(/(--ui-[\w-]+)\s*:\s*([^;]+);/g))
    out.set(m[1], { value: m[2].replace(/\s+/g, " ").trim(), index: b.start + m.index });
  return out;
}
function darkTheme(ctx) {
  const v = [];
  const sheets = ctx.files.filter((f) => f.css && (f === ctx.tokens || (LIGHT_BLOCK.test(f.code) && DARK_BLOCK.test(f.code))));
  for (const f of sheets) {
    const lb = blockAt(f.code, LIGHT_BLOCK);
    const db = blockAt(f.code, DARK_BLOCK);
    if (!lb || !db) {
      v.push({ file: f.path, line: 1, match: `no ${lb ? ".dark { }" : ":root, .light { }"} block found (block regex broke?)` });
      continue;
    }
    const light = uiDecls(lb);
    const dark = uiDecls(db);
    const refs = (val) => [...val.matchAll(/var\(\s*(--ui-[\w-]+)/g)].map((m) => m[1]);
    const memo = new Map();
    const reachesDark = (name, seen = new Set()) => {
      if (memo.has(name)) return memo.get(name);
      if (seen.has(name)) return false;
      seen.add(name);
      const d = light.get(name);
      if (!d) return false;
      const r = refs(d.value).some((t) => dark.has(t) || reachesDark(t, seen));
      memo.set(name, r);
      return r;
    };
    for (const [name, d] of light) {
      if (dark.has(name)) {
        const dd = dark.get(name);
        if (dd.value === d.value && refs(d.value).length === 0)
          v.push({ file: f.path, line: lineOf(f.code, dd.index), match: `${name}: ${dd.value} repeats its :root value and is not an alias; delete the .dark line` });
      } else if (refs(d.value).length && reachesDark(name)) {
        v.push({ file: f.path, line: lineOf(f.code, d.index), match: `${name}: ${d.value} aliases a token .dark changes; repeat it in .dark` });
      }
    }
  }
  return v;
}

// ── Dark-mode styling and hex colours outside tokens.css ─────────────────────
// Component stylesheets: every stylesheet under styles/ (where all of the design
// system's CSS lives) except tokens.css and the generated theme.css.
const componentCss = (ctx) =>
  ctx.files.filter((f) => f.css && !f.generated && f.rel !== TOKENS_REL && f.rel.startsWith("styles/"));
function darkOutsideTokens(ctx) {
  const v = [];
  const sheets = componentCss(ctx);
  // .dark alone or in a compound or nested selector (.ds-x.dark, :is(.dark) .ds-x).
  v.push(...scan(sheets, /\.dark(?![\w-])/g));
  for (const f of sheets)
    for (const a of f.code.matchAll(/@apply\b[^;}]*/g))
      for (const m of a[0].matchAll(/(?<![\w-])dark:/g))
        v.push({ file: f.path, line: lineOf(f.code, a.index + m.index), match: short(a[0].slice(m.index)) });
  // A redefined or applied Tailwind dark variant in a component stylesheet.
  v.push(...scan(sheets, /@(?:custom-)?variant\s+dark(?![\w-])/g));
  // No stylesheet, tokens.css included, maps the OS colour scheme: system mode is
  // the consuming app's job (tokens.css header). prefers-reduced-motion is fine.
  const allSheets = ctx.files.filter((f) => f.css && !f.generated && f.rel.startsWith("styles/"));
  v.push(...scan(allSheets, /prefers-color-scheme/g));
  // A dark: variant in a class string (not an object key like `dark: …`).
  v.push(...scan(tsx(ctx), /(?<![\w-])dark:(?=[\w[-])/g));
  // Allowlisted lines are matched in comment-blanked code, so a commented-out
  // line never counts as present.
  const codeLines = (f) => f.code.split("\n").map((l) => l.trim());
  const allowed = ctx.allowlists.stylesheetHex;
  for (const f of sheets) {
    const lines = codeLines(f);
    for (const m of f.code.matchAll(/#[0-9a-fA-F]{3,8}\b(?![\w-])/g)) {
      const line = lineOf(f.code, m.index);
      if (!allowed.some((e) => e.file === f.path && e.line === lines[line - 1]))
        v.push({ file: f.path, line, match: short(m[0]) });
    }
  }
  for (const e of allowed) {
    const f = ctx.byPath.get(e.file);
    if (!f) { v.push({ file: e.file, line: 1, match: "stale allowlist entry: the file no longer exists" }); continue; }
    if (!codeLines(f).some((l) => l === e.line)) { v.push({ file: e.file, line: 1, match: `stale allowlist entry: no line reads "${e.line}"; remove the entry` }); continue; }
    const gone = e.needs.filter((n) => !needRe(n).test(f.code));
    if (gone.length) v.push({ file: e.file, line: 1, match: `stale allowlist entry: the reason names ${gone.map(needLabel).join(", ")}, which the file no longer uses; fix the reason or the entry` });
  }
  return v;
}

// ── "use client" and JS timers: explicit allowlists, stale entries fail ───────
// A byte-order mark or indentation before the directive still makes it one.
const USE_CLIENT = /^\uFEFF?[ \t]*["']use client["'];?/m;
function useClient(ctx) {
  const v = [];
  const listed = new Map(ctx.allowlists.useClient.map((e) => [e.file, e]));
  for (const f of codeTs(ctx)) {
    const m = f.code.match(USE_CLIENT);
    if (m && !listed.has(f.path))
      v.push({ file: f.path, line: lineOf(f.code, m.index), match: `"use client" — not on the allowlist; add the file with its reason and needs, or drop the directive` });
  }
  for (const e of ctx.allowlists.useClient) {
    const f = ctx.byPath.get(e.file);
    if (!f) { v.push({ file: e.file, line: 1, match: "stale allowlist entry: the file no longer exists" }); continue; }
    if (!USE_CLIENT.test(f.code)) { v.push({ file: e.file, line: 1, match: `stale allowlist entry: the file no longer has "use client"; remove the entry` }); continue; }
    const gone = e.needs.filter((n) => !needRe(n).test(f.code));
    if (gone.length)
      v.push({ file: e.file, line: 1, match: `stale allowlist entry: the reason names ${gone.map(needLabel).join(", ")}, which the file no longer uses; fix the reason or drop the directive` });
  }
  return v;
}

const TIMER_CALL = /\b(?:requestAnimationFrame|setTimeout|setInterval)\(/g;
function jsTimers(ctx) {
  const v = [];
  const listed = new Map(ctx.allowlists.timers.map((e) => [e.file, e]));
  for (const f of codeTs(ctx)) {
    const calls = [...f.code.matchAll(TIMER_CALL)];
    const e = listed.get(f.path);
    if (!e) {
      for (const m of calls) v.push({ file: f.path, line: lineOf(f.code, m.index), match: `${m[0]} — not on the timer allowlist` });
    } else if (calls.length > e.count) {
      const m = calls[e.count];
      v.push({ file: f.path, line: lineOf(f.code, m.index), match: `${m[0]} — ${calls.length} call sites, the allowlist records ${e.count}` });
    }
  }
  for (const e of ctx.allowlists.timers) {
    const f = ctx.byPath.get(e.file);
    if (!f) { v.push({ file: e.file, line: 1, match: "stale allowlist entry: the file no longer exists" }); continue; }
    const n = [...f.code.matchAll(TIMER_CALL)].length;
    if (n < e.count) v.push({ file: e.file, line: 1, match: `stale allowlist entry: records ${e.count} call site(s), the file has ${n}; update or remove the entry` });
  }
  return v;
}

// ── forwardRef / size keys helpers ───────────────────────────────────────────
/** True when the forwardRef call starting at `i` (after the name) takes `function Name(`. */
function namedFunctionArg(s, i) {
  while (i < s.length && /\s/.test(s[i])) i++;
  if (s[i] === "<") {
    let depth = 0;
    for (; i < s.length; i++) {
      if (s[i] === "<") depth++;
      else if (s[i] === ">" && s[i - 1] !== "=") {
        depth--;
        if (depth === 0) { i++; break; }
      }
    }
  }
  return /^\s*\(\s*function\s+\w+/.test(s.slice(i, i + 200));
}
function closingBrace(s, open) {
  let depth = 0;
  for (let i = open; i < s.length; i++) {
    if (s[i] === "{") depth++;
    else if (s[i] === "}" && --depth === 0) return i;
  }
  return s.length;
}

// Sanctioned *Type constant: the dot-accessible values of the `selectType` prop.
const SANCTIONED_TYPE_CONSTS = new Set(["DropdownMenuSelectType"]);

// ── The checks ────────────────────────────────────────────────────────────────
const CHECKS = [
  {
    id: "motion-timing",
    name: "motion timing literals outside tokens.css",
    why: "A hardcoded duration or easing skips the motion scale and its reduced-motion collapse, so it drifts from every other animation.",
    // Tailwind duration-N / delay-N / ease-*, cubic-bezier(), and millisecond or second
    // literals anywhere (CSS values, inline styles, bracketed classes like duration-[0.2s],
    // and underscore-separated bracket values like transition-[opacity_.2s]).
    run: (ctx) => scan(code(ctx).filter((f) => f.rel !== TOKENS_REL),
      /(?<![\w-])(?:[\w-]+:)*(?:duration|delay)-\d+\b|(?<![\w-])(?:[\w-]+:)*ease-(?:in|out|in-out|linear)\b|cubic-bezier\(|(?<![A-Za-z0-9-])\d+ms\b|(?<![A-Za-z0-9.$#-])\d*\.?\d+s(?![\w-])/g),
  },
  {
    id: "arbitrary-length",
    name: "arbitrary px/rem/em/deg in classNames",
    why: "An arbitrary length or angle bypasses the token scale, so it never follows a token change or a consumer override. Stories are checked too; a story that needs a fixed demo width with no token sets it in style={{ width }} with a short comment.",
    // Stories included: they are the usage examples.
    run: (ctx) => scan(tsx(ctx), /-\[-?[0-9.]+(?:px|r?em|deg)\]/g),
  },
  {
    id: "numeric-spacing",
    name: "numeric Tailwind spacing",
    why: "p-2 or gap-4 is Tailwind's default scale, not the DS spacing tokens, so it ignores token overrides (zero resets like p-0 are allowed).",
    // Class strings in .ts/.tsx (stories included: they are the usage examples),
    // and `@apply` lines in stylesheets.
    run: (ctx) => {
      const re = /(?<![\w-])-?(?:p|px|py|pt|pr|pb|pl|ps|pe|m|mx|my|mt|mr|mb|ml|ms|me|gap|gap-x|gap-y|space-x|space-y)-(?!0(?![\d.]))\d+(?:\.5)?(?![\w-])/g;
      const v = scan(tsx(ctx), re);
      for (const f of code(ctx).filter((x) => x.css))
        for (const a of f.code.matchAll(/@apply\b[^;}]*/g))
          for (const m of a[0].matchAll(re))
            v.push({ file: f.path, line: lineOf(f.code, a.index + m.index), match: short(m[0]) });
      return v;
    },
  },
  {
    id: "raw-ui-var-class",
    name: "raw var(--ui-*) in className brackets or (--ui-*) shorthand",
    why: "A token belongs behind its theme utility (bg-primary, p-md) or a ds-* helper; an arbitrary var() class, or its Tailwind v4 shorthand p-(--ui-…), wires the raw token name into the component, and where the prefix is ambiguous (text-[var(--ui-text-body)]) tailwind-merge files a size as a colour, so cn() erases it.",
    // p-[var(--ui-x)], and the shorthand p-(--ui-x) or p-(length:--ui-x).
    run: (ctx) => scan(codeTs(ctx), /\[[^\]\s"'`]*var\(--ui-|-\((?:[\w-]+:)?--ui-/g),
  },
  {
    id: "focus-ring",
    name: "hand-rolled focus rings",
    why: "Focus rings come from the ds-focus-* helpers; a hand-rolled ring drifts from their width, colour and offset and from every other control.",
    run: (ctx) => scan(codeTs(ctx), /shadow-focus|focus-visible:ring|focus:ring/g),
  },
  {
    id: "disabled-look",
    name: "hand-rolled disabled looks",
    why: "The disabled look comes from ds-disabled-state / ds-radix-data-disabled and --ui-opacity-disabled; a local opacity or cursor drifts and double-fades nested controls.",
    // `disabled:opacity-100` cancels a double fade on a nested control: a reset, not a disabled look.
    run: (ctx) => scan(codeTs(ctx), /disabled:opacity-(?!100\b)|(?<![\w-])opacity-50(?![\w-])|disabled:cursor/g),
  },
  {
    id: "value-callback",
    name: "value callbacks not named onValueChange",
    why: "Every value callback is onValueChange, as in Radix; onChange(value) collides with the DOM onChange(event) signature.",
    run: (ctx) => scan(codeTs(ctx), /\bon(?:Change|Select)\??:\s*\((?:value|date|range|code|v)\b/g),
  },
  {
    id: "default-export",
    name: "default exports in component modules",
    why: "The package re-exports named exports only, so a default export never reaches consumers and gets a different name at every import.",
    run: (ctx) => scan(codeTs(ctx), /^export default /gm),
  },
  {
    id: "text-style-class",
    name: "text-style classes outside Text components",
    why: "Text is set by a Text component (BodyText, ButtonText, … or BaseText, with `as` for a root); a bare class skips the role's element and font wiring and drifts when roles change.",
    // Also a name built at runtime: `text-style-${role}` or "text-style-" + role.
    run: (ctx) => scan(text(ctx), /(?<![\w-])(?:[\w-]+:)*text-style-(?:[\w-]+|(?=\$\{|["'`]\s*\+))/g),
  },
  {
    id: "typography-utility",
    name: "typography utilities or inline font styles",
    why: "Font, size, tracking and leading belong to the Text component's role; a utility or inline style overrides the role piecemeal.",
    run: (ctx) => scan(text(ctx),
      /(?<![\w-])(?:[\w-]+:)*(?:font-(?:body|button|heading|label|title|hero|mono|thin|light|normal|medium|semibold|bold|black|sans|serif)|text-(?:xs|sm|base|lg|xl|[2-9]xl|label|body|hero-body|hero-button|mono|subheading|code-digit|heading|title|hero|cta-standard|cta-big)|tracking-[\w-]+|leading-[\w-]+)(?![\w-])|style=\{\{[^}]*\b(?:fontSize|fontFamily|fontWeight|letterSpacing|lineHeight)\s*:/g),
  },
  {
    id: "hex-colour",
    name: "hex colour literals in components and stories",
    why: "A hex literal never follows the theme, so it breaks in dark mode and under consumer token overrides; a story is a usage example, so it is held to the same rule.",
    // `&#8212;` is an HTML character reference, not a colour. Stories included.
    run: (ctx) => scan(tsx(ctx), /#[0-9a-fA-F]{3,8}\b(?![\w-])/g, (m, f) => f.code[m.index - 1] !== "&"),
  },
  {
    id: "tailwind-radius-shadow",
    name: "Tailwind default radii and shadows",
    why: "Tailwind's default radius and shadow scales are not the DS tokens (rounded-tight, shadow-standard, shadow-menu …), so they ignore token overrides and dark-mode shadows.",
    run: (ctx) => [
      // A class token is followed by a quote or whitespace; the TypeScript word `rounded`
      // (a variable: `const rounded =`, `rounded ? …`) is followed by an operator.
      ...scan(tsx(ctx),
        /(?<![\w$.-])(?:[\w-]+:)*rounded(?:-(?:t|r|b|l|tl|tr|bl|br|s|e|ss|se|es|ee))?(?:-(?:xs|sm|md|lg|xl|2xl|3xl|4xl))?(?=["'`\s])(?!\s*[=?:;,)\]}&|+*/%<>!.-])/g),
      ...scan(tsx(ctx), /(?<![\w-])(?:[\w-]+:)*shadow-(?:xs|sm|md|lg|xl|2xl|inner)(?![\w-])/g),
    ],
  },
  {
    id: "element-ref",
    name: "ElementRef instead of ComponentRef",
    why: "ElementRef is deprecated in the React 19 types; ComponentRef is its replacement.",
    run: (ctx) => scan(codeTs(ctx), /\bElementRef\b/g),
  },
  {
    id: "forwardref-displayname",
    name: "forwardRef without displayName",
    why: "An anonymous forwardRef shows as ForwardRef in React DevTools and error stacks; pass a named function or set displayName.",
    run: (ctx) => {
      const v = [];
      for (const f of codeTs(ctx))
        for (const m of f.code.matchAll(/(?:const|let)\s+(\w+)\s*=\s*(?:React\.)?forwardRef\b/g)) {
          if (new RegExp(`\\b${m[1]}\\.displayName\\s*=`).test(f.code)) continue;
          if (namedFunctionArg(f.code, m.index + m[0].length)) continue;
          v.push({ file: f.path, line: lineOf(f.code, m.index), match: short(m[0]) });
        }
      return v;
    },
  },
  {
    id: "variant-on-package-class",
    name: "Tailwind variant on a DS package class",
    why: "ds-*, h-button*, size-button* and text-style-* are plain package CSS, not Tailwind utilities, so hover:/data-[…]: variants on them emit no rule and silently do nothing.",
    run: (ctx) => scan(tsx(ctx),
      /(?<![\w-])(?:[\w-]+|\[[^\]\s]+\]):(?:ds-[\w-]+|h-button[\w-]*|size-button[\w-]*|text-style-[\w-]+)/g),
  },
  {
    id: "svg-var-attribute",
    name: "var() in SVG geometry attributes",
    why: "SVG 2 parses a presentation attribute as a value, not a declaration, so var() in a geometry attribute (width, r, cx …) is not specified: Chromium draws it, but its SVG DOM reads the length as 0; keep a plain number attribute and set the token through style or a class.",
    run: (ctx) => {
      // Only host elements (lowercase tags) carry SVG attributes; <DropdownMenuSection width="var(…)">
      // is a component PROP. The attribute pattern skips quoted strings and {…} expressions.
      const attrs = String.raw`(?:[^>"'{}]|"[^"]*"|'[^']*'|\{(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*\})*?`;
      const re = new RegExp(String.raw`<[a-z][\w.-]*\b${attrs}\s((?:width|height|r|rx|ry|x|y|cx|cy|x1|x2|y1|y2)=(?:["']|\{\s*["'\x60]?)[^"'\x60}]*var\(--)`, "gd");
      const v = [];
      for (const f of tsx(ctx))
        for (const m of f.code.matchAll(re))
          v.push({ file: f.path, line: lineOf(f.code, m.indices[1][0]), match: short(m[1]) });
      return v;
    },
  },
  {
    id: "theme-detection",
    name: "runtime theme detection",
    why: "Dark mode is CSS only (.dark and the tokens); detecting the theme in JS breaks nested dark islands and renders differently on the server.",
    run: (ctx) => scan(codeTs(ctx), /prefers-color-scheme|classList\.(?:contains|toggle|add)\(\s*["']dark/g),
  },
  {
    id: "font-family",
    name: "hardcoded font families",
    why: "A literal font stack bypasses the --ui-font-* tokens, so a consumer font override never reaches it.",
    run: (ctx) => scan(
      ctx.files.filter((f) => !f.generated && f.rel !== TOKENS_REL && !f.rel.startsWith("components/Text/")),
      /font-family:(?!\s*(?:var\(|inherit))[^;]+;|fontFamily:\s*["'`](?!var\()/g),
  },
  {
    id: "variant-const-name",
    name: "variant constants named *Type",
    why: "Dot-accessible option constants are named *Variant (or *Size); a *Type name reads as a TypeScript type. DropdownMenuSelectType is the sanctioned exception: it holds the selectType prop's values.",
    run: (ctx) => scan(codeTs(ctx), /export\s+const\s+(\w+?Types?)\s*=/g, (m) => !SANCTIONED_TYPE_CONSTS.has(m[1])),
  },
  {
    id: "size-key-name",
    name: "size keys named default or small",
    why: "A size scale calls its default size standard and its small size sm, never default or small, so the same size reads the same on every component; only size scales (…Size consts and cva size groups) are held to this, not variant keys.",
    run: (ctx) => {
      const v = [];
      for (const f of codeTs(ctx)) {
        // A size scale: a `…Size` / `…Sizes` const object, or the `size: { … }` group of a cva.
        const opens = new Set();
        for (const m of f.code.matchAll(/(?:export\s+)?const\s+\w+Sizes?\s*=\s*\{/g)) opens.add(m.index + m[0].length - 1);
        for (const m of f.code.matchAll(/(?<![\w$.?])size\s*:\s*\{/g)) opens.add(m.index + m[0].length - 1);
        for (const open of opens) {
          const body = f.code.slice(open, closingBrace(f.code, open));
          for (const m of body.matchAll(/(?<![\w$.-])["']?(default|small)["']?\s*:/g))
            v.push({ file: f.path, line: lineOf(f.code, open + m.index), match: short(m[0]) });
        }
      }
      return v;
    },
  },
  {
    id: "expression-system",
    name: "expression tokens set or read outside the expression system",
    why: "Expression tokens are set only by the tokens.css :root default and the practical preset, and read only by .ds-expr-* rules: a set anywhere else overrides the preset in that subtree, so practical stops switching it; a read anywhere else scatters the detail where the next edit cannot find it; and a marked token missing from the preset is one practical cannot switch off.",
    run: expressionSystem,
  },
  {
    id: "dark-theme",
    name: "dark aliases missing from .dark, and redundant .dark lines",
    why: "An alias resolves where it is declared, so a nested .dark island keeps the light value unless .dark repeats the alias; a .dark line that repeats a non-alias :root value re-declares the DS value on every nested .dark island, so a consumer's :root override never reaches them.",
    run: darkTheme,
  },
  {
    id: "dark-outside-tokens",
    name: "dark-mode rules or hex colours outside tokens.css",
    why: "Dark mode lives in tokens.css alone: a component paints with a token and tokens.css gives it its dark value. A .dark selector, a dark variant (@variant dark, @custom-variant dark) or a hex colour in a component stylesheet, or a dark: variant in a class string, skips the token, so it ignores consumer overrides, and a .dark rule also reaches into a nested .light island. No stylesheet, tokens.css included, reads prefers-color-scheme: following the OS scheme is the consuming app's job, and a media query would override the app's own light/dark choice. The #000 mask-image stops in index.css are allowlisted: a mask reads only alpha.",
    run: darkOutsideTokens,
  },
  {
    id: "use-client",
    name: "\"use client\" outside its allowlist",
    why: "\"use client\" makes a module a client boundary, and constants declared in it become references a server component cannot read; only modules that need client-only React or browser APIs carry it, each listed with its reason.",
    run: useClient,
  },
  {
    id: "js-timers",
    name: "JS timers and animation loops outside their allowlist",
    why: "A JS timer that mirrors a CSS duration desyncs the moment either is retuned; motion timing lives in CSS on the motion scale, so each timer or rAF loop is listed with its reason.",
    run: jsTimers,
  },
  {
    id: "theme-fresh",
    name: "generated theme out of date",
    why: "index.css's @theme block, theme.css and twMergeTheme.ts are generated from tokens.css by sync-theme.mjs; stale output ships utilities and cn() merges that disagree with the tokens.",
    fixtures: false,
    run: () => runCheckMode("scripts/sync-theme.mjs"),
  },
  {
    id: "icons-fresh",
    name: "icon barrel out of date",
    why: "src/components/Icons/index.ts is generated from the *Icon.tsx files by generate-icon-exports.mjs; a stale barrel leaves a new icon out of the package entry or exports one whose file is gone.",
    fixtures: false,
    run: () => runCheckMode("scripts/generate-icon-exports.mjs"),
  },
  {
    id: "shape-morph-ease-fresh",
    name: "shape-morph ease out of date",
    why: "The --ui-shape-morph-duration and --ui-shape-morph-ease block in tokens.css is generated from the spring in shapeMorphSpring.mjs by generate-shape-morph-ease.mjs; a hand edit, or a retuned spring that was not regenerated, makes the morph's timing disagree with its spring.",
    fixtures: false,
    run: () => runCheckMode("scripts/generate-shape-morph-ease.mjs"),
  },
  {
    id: "docs-fresh",
    name: "generated doc references out of date",
    why: "components.md, token-contract.md, the codebase inventory and the client-references list are generated from src/ by generate-docs.mjs and read as the truth by agents and consumers; a stale one documents props, defaults, tokens, files or client boundaries that no longer match the code.",
    fixtures: false,
    run: () => runCheckMode("scripts/generate-docs.mjs"),
  },
  {
    id: "skills-mirrored",
    name: "skill mirrors out of sync with .agents/skills",
    why: "agents load skills from .claude/skills and .agent/skills, which are real copies of .agents/skills made by sync-skills.mjs; a stale, missing or symlinked mirror makes an agent follow an outdated skill or none at all.",
    fixtures: false,
    run: () => runCheckMode("scripts/sync-skills.mjs"),
  },
];

// ── Main ──────────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
const fi = argv.indexOf("--fixtures");
const fixtureMode = fi !== -1;
const root = fixtureMode
  ? path.resolve(REPO, argv[fi + 1] && !argv[fi + 1].startsWith("--") ? argv[fi + 1] : DEFAULT_FIXTURES)
  : path.join(REPO, "src");

const files = loadFiles(root);
const ctx = {
  mode: fixtureMode ? "fixtures" : "src",
  root,
  rootRel: repoRel(root),
  files,
  byPath: new Map(files.map((f) => [f.path, f])),
  tokens: files.find((f) => f.rel === TOKENS_REL) || null,
  allowlists: { useClient: USE_CLIENT_ALLOWLIST, timers: TIMER_ALLOWLIST, stylesheetHex: STYLESHEET_HEX_ALLOWLIST },
};
if (fixtureMode) {
  const p = path.join(root, "allowlists.json");
  const j = fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, "utf8")) : {};
  const at = (e) => ({ ...e, file: repoRel(path.join(root, e.file)) });
  ctx.allowlists = { useClient: (j.useClient || []).map(at), timers: (j.timers || []).map(at), stylesheetHex: (j.stylesheetHex || []).map(at) };
}

const active = CHECKS.filter((c) => !fixtureMode || c.fixtures !== false);
const results = active.map((c) => ({ check: c, violations: c.run(ctx) }));
for (const { check, violations } of results)
  for (const x of violations) console.log(`FAIL ${check.name}: ${x.file}:${x.line} ${x.match}`);
const failed = results.filter((r) => r.violations.length);

if (!fixtureMode) {
  if (failed.length) {
    console.log("");
    for (const { check } of failed) console.log(`why (${check.name}): ${check.why}`);
    console.log(`\nconventions: ${failed.length} of ${CHECKS.length} checks failed`);
    process.exit(1);
  }
  console.log(`conventions: ${CHECKS.length} checks passed`);
  process.exit(0);
}

// Fixture mode: every <check-id>[.<case>].<ext> file is reported exactly once, by its own check.
const ids = new Set(active.map((c) => c.id));
const problems = [];
const byFile = new Map();
for (const { check, violations } of results)
  for (const x of violations) {
    if (!byFile.has(x.file)) byFile.set(x.file, []);
    byFile.get(x.file).push(check.id);
  }
for (const { check, violations } of results) if (!violations.length) problems.push(`BROKEN ${check.id}: reported nothing`);
const expectOf = (rel) => {
  const parts = path.posix.basename(rel).split(".");
  return ids.has(parts[0]) && !(parts.length > 2 && parts[1] === "ok") ? parts[0] : null;
};
const seen = new Set();
for (const f of files) {
  seen.add(f.path);
  const want = expectOf(f.rel);
  const got = byFile.get(f.path) || [];
  if (want && (got.length !== 1 || got[0] !== want))
    problems.push(`MISMATCH ${f.path}: expected exactly one report from ${want}, got [${got.join(", ")}]`);
  if (!want && got.length) problems.push(`UNEXPECTED ${f.path}: must report nothing, got [${got.join(", ")}]`);
}
for (const [file, got] of byFile) if (!seen.has(file)) problems.push(`UNEXPECTED ${file}: not a fixture file, got [${got.join(", ")}]`);

console.log("");
for (const c of active) {
  const caught = results.find((r) => r.check === c).violations.map((x) => path.posix.basename(x.file));
  console.log(`${caught.length ? "caught" : "BROKEN"}  ${c.id.padEnd(26)} ${caught.join(", ")}`);
}
const skipped = CHECKS.filter((c) => c.fixtures === false).map((c) => c.id);
if (skipped.length) console.log(`skipped (repo-level, no fixtures): ${skipped.join(", ")}`);
for (const p of problems) console.log(p);
console.log(problems.length
  ? `\nfixtures: ${problems.length} problem(s)`
  : `\nfixtures: OK — ${active.length} checks, each caught exactly its own fixtures (${files.length} files)`);
process.exit(problems.length ? 1 : 0);
