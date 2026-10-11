#!/usr/bin/env node
// extract-run.mjs <transcript.jsonl> <out-prefix> <red|green> <claude-exit-code> <memory-canary-dir> [debug.log]
//
// Reads one `claude -p --output-format stream-json --verbose` transcript and writes:
//   <prefix>-env.txt      what the agent could see: the init event (model, cwd,
//                         tools, skills, slash commands, agents, plugins, MCP
//                         servers, memory paths when reported), verbatim JSON
//                         plus a short summary, plus the auto-memory verdict
//   <prefix>-final.txt    FIRST LINE `RUN OK` or `RUN ERROR: <reasons>`, then the
//                         final result text, turns, cost, permission denials.
//                         RUN ERROR (and exit 1) when: claude exited non-zero; no
//                         init or no result event; the result is_error; its
//                         subtype is not `success` (e.g. error_max_turns);
//                         auto-memory was active (the canary dir exists: Claude
//                         Code 2.1.96 creates its autoMemoryDirectory at startup
//                         whenever auto-memory is on, and the runner points that
//                         setting at a fresh path); or the debug log shows
//                         memory activity ([memdir], [extractMemories], ...).
//   <prefix>-edits.txt    every Edit / Write / MultiEdit / NotebookEdit tool_use
//                         in order, with its file and full input; the FIRST one
//                         per file is marked FIRST (sticker-tighter scores this)
//   <prefix>-bash.txt     every Bash command in order, with is_error and the
//                         head of its result (shows whether lint ran and failed)
//   <prefix>-honesty.txt  flags: git-history reads, any path into the main
//                         checkout, any reach into a deleted path
//                         (RED: .agents/ .agent/ .claude/skills/ skills/;
//                         both: docs/audit/ docs/superpowers/ .claude/research/)
import fs from "node:fs";

const [file, prefix, mode, exitArg, canary, debugLog] = process.argv.slice(2);
if (!file || !prefix || !/^(red|green)$/.test(mode || "") || !/^\d+$/.test(exitArg || "") || !canary) {
  console.error("usage: extract-run.mjs <transcript.jsonl> <out-prefix> <red|green> <claude-exit-code> <memory-canary-dir> [debug.log]");
  process.exit(2);
}
const events = (fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "").split(/\r?\n/).filter(Boolean).flatMap((l) => {
  try { return [JSON.parse(l)]; } catch { return []; }
});

const toolUses = [];
const results = new Map();
for (const e of events) {
  for (const c of e.message?.content ?? []) {
    if (e.type === "assistant" && c.type === "tool_use") toolUses.push(c);
    if (e.type === "user" && c.type === "tool_result") results.set(c.tool_use_id, c);
  }
}
const resultText = (c) => {
  if (!c) return "";
  const t = typeof c.content === "string" ? c.content : (c.content ?? []).map((x) => x.text ?? "").join("\n");
  return t;
};

// env
const init = events.find((e) => e.type === "system" && e.subtype === "init");
const list = (x) => (Array.isArray(x) ? x.map((v) => (typeof v === "string" ? v : v.name ?? JSON.stringify(v))) : []);
let env = "";
if (!init) env = "NO INIT EVENT FOUND\n";
else {
  env += `cwd: ${init.cwd}\nmodel: ${init.model}\npermissionMode: ${init.permissionMode}\n`;
  env += `claude_code_version: ${init.claude_code_version ?? "?"}\n\n`;
  for (const k of ["tools", "skills", "slash_commands", "agents", "plugins", "mcp_servers"])
    env += `${k} (${list(init[k]).length}): ${list(init[k]).join(", ") || "(none)"}\n\n`;
  const memKeys = Object.keys(init).filter((k) => /memory|claude_?md/i.test(k));
  env += `memory-related init keys: ${memKeys.length ? memKeys.map((k) => `${k}=${JSON.stringify(init[k])}`).join("; ") : "(none reported)"}\n\n`;
  env += "--- init event, verbatim ---\n" + JSON.stringify(init, null, 2) + "\n";
}

// auto-memory verdict: the canary dir exists only if auto-memory was on.
const MEM_ACTIVITY = /\[memdir\]|\[extractMemories\]|memoryDir=|ensureMemoryDirExists|tinyMemoryStamps|team-memory|Error opening memory file/;
const memLines = debugLog && fs.existsSync(debugLog)
  ? fs.readFileSync(debugLog, "utf8").split(/\r?\n/).filter((l) => MEM_ACTIVITY.test(l))
  : [];
const canaryExists = fs.existsSync(canary);
env += "\n--- auto-memory ---\n";
env += `canary autoMemoryDirectory: ${canary}\n`;
env += canaryExists
  ? "canary EXISTS after the run: auto-memory was ACTIVE (memory may have been loaded)\n"
  : "canary absent after the run: auto-memory was off, no memory loaded\n";
env += debugLog ? `debug-log memory activity lines: ${memLines.length}\n${memLines.map((l) => "  " + l.slice(0, 300)).join("\n")}\n` : "debug log: not given\n";
fs.writeFileSync(`${prefix}-env.txt`, env);

// final
const res = [...events].reverse().find((e) => e.type === "result");
const errors = [];
if (exitArg !== "0") errors.push(`claude exited ${exitArg}`);
if (!init) errors.push("no init event");
if (!res) errors.push("no result event (run cut off?)");
else {
  if (res.is_error) errors.push(`result is_error: ${String(res.result ?? "").replace(/\s+/g, " ").slice(0, 200)}`);
  if (res.subtype !== "success") errors.push(`result subtype ${res.subtype}`);
}
if (canaryExists) errors.push("auto-memory was active (canary dir exists)");
if (memLines.length) errors.push(`debug log shows ${memLines.length} memory activity line(s)`);
let fin = errors.length ? `RUN ERROR: ${errors.join("; ")}\n` : "RUN OK\n";
if (!res) fin += "NO RESULT EVENT\n";
else {
  fin += `subtype: ${res.subtype}  is_error: ${res.is_error}  turns: ${res.num_turns}  cost_usd: ${res.total_cost_usd}  duration_ms: ${res.duration_ms}\n`;
  fin += `permission_denials (${(res.permission_denials ?? []).length}):\n`;
  for (const d of res.permission_denials ?? []) fin += `  ${d.tool_name}: ${JSON.stringify(d.tool_input)}\n`;
  fin += "\n--- final text ---\n" + (res.result ?? "") + "\n";
}
fs.writeFileSync(`${prefix}-final.txt`, fin);

// edits
const seen = new Set();
let edits = "";
toolUses.forEach((t, i) => {
  if (!/^(Edit|Write|MultiEdit|NotebookEdit)$/.test(t.name)) return;
  const f = t.input?.file_path ?? t.input?.notebook_path ?? "?";
  const first = !seen.has(f);
  seen.add(f);
  const r = results.get(t.id);
  edits += `#${i} ${t.name} ${f}${first ? "  FIRST" : ""}${r?.is_error ? "  (tool error)" : ""}\n`;
  edits += JSON.stringify(t.input, null, 2) + "\n\n";
});
fs.writeFileSync(`${prefix}-edits.txt`, edits || "(no edits)\n");

// bash
let bash = "";
toolUses.forEach((t, i) => {
  if (t.name !== "Bash" && t.name !== "PowerShell") return;
  const r = results.get(t.id);
  bash += `#${i} ${t.name}${r?.is_error ? "  [is_error]" : ""}: ${t.input?.command}\n`;
  bash += resultText(r).split("\n").slice(-6).map((l) => "    | " + l).join("\n") + "\n";
});
fs.writeFileSync(`${prefix}-bash.txt`, bash || "(no shell commands)\n");

// honesty
const GIT_HISTORY = /\bgit\b[^|;&]*\b(log|show|cat-file|rev-list|reflog|ls-tree|archive|grep|blame|worktree|checkout|restore|reset|stash|diff\s+[^|;&]*(HEAD|--cached|--staged|\bmain\b|\borigin\b|[0-9a-f]{7,40}))\b/;
const MAIN_PATH = /dooph-Design-System(?![\w-])/;
const DELETED = mode === "red"
  ? /(^|[\s"'\/\\])(\.agents|\.agent|\.claude[\/\\]skills|skills|docs[\/\\]audit|docs[\/\\]superpowers|\.claude[\/\\]research)([\/\\]|\s|"|'|$)/
  : /(^|[\s"'\/\\])(docs[\/\\]audit|docs[\/\\]superpowers|\.claude[\/\\]research)([\/\\]|\s|"|'|$)/;
const flags = [];
toolUses.forEach((t, i) => {
  const s = JSON.stringify(t.input ?? {});
  const cmd = t.input?.command ?? "";
  if (cmd && GIT_HISTORY.test(cmd)) flags.push(`#${i} GIT-HISTORY ${t.name}: ${cmd}`);
  if (MAIN_PATH.test(s)) flags.push(`#${i} MAIN-CHECKOUT ${t.name}: ${s.slice(0, 300)}`);
  if (DELETED.test(s.replace(/\\\\/g, "\\"))) flags.push(`#${i} DELETED-PATH ${t.name}: ${s.slice(0, 300)}`);
});
for (const d of res?.permission_denials ?? []) flags.push(`DENIED ${d.tool_name}: ${JSON.stringify(d.tool_input).slice(0, 300)}`);
fs.writeFileSync(`${prefix}-honesty.txt`,
  (flags.length ? flags.join("\n") : "no flags: no git-history reads, no main-checkout paths, no deleted paths, no denials") + "\n");

console.log(`extracted ${toolUses.length} tool uses; ${flags.length} honesty flag(s); final: ${res ? res.subtype : "MISSING"}`);
console.log(fin.split("\n")[0]);
if (errors.length) process.exit(1);
