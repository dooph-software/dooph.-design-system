#!/usr/bin/env node
// scenario-prompt.mjs <id>   prints the scenario's prompt exactly as the test agent receives it
// scenario-prompt.mjs --side <id>   prints maintainer | consumer
// scenario-prompt.mjs --list        prints "<id> <side>" for every scenario
// Source: scenarios.md next to this file. A scenario is a `## <id>` section with
// one `- **side:** …` line and one `- **prompt:** "…"` line (\" inside is a quote).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const md = fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), "scenarios.md"), "utf8");
const scenarios = new Map();
for (const sec of md.split(/^## /m).slice(1)) {
  const id = sec.slice(0, sec.indexOf("\n")).trim();
  const side = sec.match(/^- \*\*side:\*\* (maintainer|consumer)\s*$/m);
  const prompt = sec.match(/^- \*\*prompt:\*\* "(.*)"\s*$/m);
  if (side && prompt) scenarios.set(id, { side: side[1], prompt: prompt[1].replace(/\\"/g, '"') });
}

const [a, b] = process.argv.slice(2);
if (a === "--list") {
  for (const [id, s] of scenarios) console.log(`${id} ${s.side}`);
} else {
  const id = a === "--side" ? b : a;
  const s = scenarios.get(id);
  if (!s) { console.error(`unknown scenario: ${id}`); process.exit(1); }
  process.stdout.write(a === "--side" ? s.side + "\n" : s.prompt);
}
