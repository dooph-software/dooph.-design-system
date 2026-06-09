#!/usr/bin/env node
/**
 * bin/init.mjs — unpack bundled skills into consuming projects (npm bin: init-skills)
 *
 * From a consuming project (after installing the package):
 *   npx @dooph-software/design-system init-skills
 *   -- or --
 *   node node_modules/@dooph-software/design-system/bin/init.mjs
 *
 * What it does:
 *   1. Asks which agent skill directories to populate
 *   2. Copies skills/ from the installed package into those directories
 *   3. Prints the one import line needed to finish setup
 *
 * What it does NOT do:
 *   - Modify any project files
 *   - Configure frameworks, fonts, or Tailwind
 *   - Install dependencies
 */

import { existsSync, mkdirSync, readdirSync } from "fs";
import { cp } from "fs/promises";
import { dirname, resolve } from "path";
import { createInterface } from "readline";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PKG_SKILLS = resolve(__dirname, "../skills");
const CWD = process.cwd();

// ── ANSI helpers (no deps) ────────────────────────────────────────────────────
const NO_COLOR = !process.stdout.isTTY || process.env.NO_COLOR;
const bold = (s) => (NO_COLOR ? s : `\x1b[1m${s}\x1b[0m`);
const dim = (s) => (NO_COLOR ? s : `\x1b[2m${s}\x1b[0m`);
const green = (s) => (NO_COLOR ? s : `\x1b[32m${s}\x1b[0m`);
const cyan = (s) => (NO_COLOR ? s : `\x1b[36m${s}\x1b[0m`);
const yellow = (s) => (NO_COLOR ? s : `\x1b[33m${s}\x1b[0m`);

// ── Readline prompt ───────────────────────────────────────────────────────────
const rl = createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) =>
  new Promise((res) => rl.question(q, (ans) => res(ans.trim())));

/**
 * Skill destination directories.
 *
 * Each entry describes where a particular agent framework expects skills to live
 * inside a consuming project. Users only need to install to the tools they use.
 *
 * To add support for a new agent framework, append an entry here.
 */
const TARGETS = [
  {
    dir: ".agents/skills",
    label: ".agents/   — Cursor Agent Skills",
    hint: "Open Cursor and the skills will be available to agents automatically.",
  },
  {
    dir: ".claude/skills",
    label: ".claude/   — Claude CLI / Projects",
    hint: "Skills are picked up by Claude CLI when running in this project directory.",
  },
  {
    dir: ".agent/skills",
    label: ".agent/    — other agent framework",
    hint: null,
  },
];

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log();
  console.log(bold("dooph Design System") + dim(" · init-skills"));
  console.log();

  // Sanity-check the package is intact
  if (!existsSync(PKG_SKILLS)) {
    console.error("  ✗ skills/ directory not found in the installed package.");
    console.error(
      "    Try reinstalling: npm install @dooph-software/design-system",
    );
    process.exit(1);
  }

  const skills = readdirSync(PKG_SKILLS);
  if (skills.length === 0) {
    console.log(
      dim("  No skills bundled in this version. Nothing to install."),
    );
    rl.close();
    return;
  }

  console.log(
    `  ${skills.length} skill(s) available: ${dim(skills.join(", "))}`,
  );
  console.log();
  console.log("  Which directories should skills be installed to?");
  console.log(dim("  Press Enter (or y) to install, n to skip.\n"));

  // Collect user selections
  const selected = [];
  for (const target of TARGETS) {
    const alreadyExists = existsSync(resolve(CWD, target.dir));
    const existsNote = alreadyExists ? yellow("  (exists — will merge)") : "";
    const ans = await ask(
      `  ${target.label}${existsNote}\n  ${dim("[Y/n]:")} `,
    );

    if (ans.toLowerCase() !== "n") {
      selected.push(target);
    }
    console.log();
  }

  if (selected.length === 0) {
    console.log(dim("  Nothing selected. No files were changed."));
    rl.close();
    return;
  }

  // Copy skills into selected targets
  const results = await Promise.allSettled(
    selected.map(async (target) => {
      const dest = resolve(CWD, target.dir);
      mkdirSync(dest, { recursive: true });
      await cp(PKG_SKILLS, dest, { recursive: true, force: true });
      return target;
    }),
  );

  console.log("  Results:\n");
  for (const result of results) {
    if (result.status === "fulfilled") {
      const t = result.value;
      console.log(`  ${green("✓")} ${cyan(t.dir)}`);
      if (t.hint) console.log(`    ${dim(t.hint)}`);
    } else {
      console.error(`  ✗ ${result.reason?.message ?? result.reason}`);
    }
  }

  // ── Setup reminder ────────────────────────────────────────────────────────
  console.log();
  console.log(dim("─".repeat(56)));
  console.log();
  console.log(
    `  ${bold("One more step")} — import the design system styles in your`,
  );
  console.log(`  project's CSS or JS entry point:\n`);
  console.log(
    `    ${cyan("import '@dooph-software/design-system/styles.css'")}`,
  );
  console.log();
  console.log(dim("  (app/globals.css, src/main.tsx, or equivalent)"));
  console.log();

  rl.close();
}

main().catch((err) => {
  console.error("\n  ✗ Unexpected error:", err.message ?? err);
  rl.close();
  process.exit(1);
});
