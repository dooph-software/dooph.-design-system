#!/usr/bin/env node
// consumer-honesty.mjs <transcript.jsonl> <honesty.txt> <sandbox-dir> — appends
// the consumer-only honesty flags to the -honesty.txt that extract-run.mjs wrote:
//   TEMPLATE-PATH   any tool input naming ../ds-consumer-template (its vendored
//                   tarball still holds the package's skills and README)
//   VENDOR-TARBALL  any tool input that opens or unpacks a .tgz, or runs tar
//   OTHER-SANDBOX   any tool input naming a ds-consumer-sb-* / ds-sb-* dir other
//                   than this run's own sandbox (known from <sandbox-dir>, so an
//                   init event without cwd cannot cause false flags)
//   DS-REGISTRY     an npm / npx / yarn / pnpm command naming
//                   @dooph-software/design-system (view, info, pack, install,
//                   init-skills… — the published package carries its docs)
//   NETWORK         any curl / wget, a WebFetch / WebSearch tool use, a shell
//                   command using fetch(, or a `node -e/-p/--eval/--print`
//                   script that touches the network (fetch, http(s), net,
//                   undici, registry)
// Exit 0 when the file was written (flags or not); non-zero only on failure.
import fs from "node:fs";
import path from "node:path";
const [file, honesty, sandbox] = process.argv.slice(2);
if (!file || !honesty || !sandbox) {
  console.error("usage: consumer-honesty.mjs <transcript.jsonl> <honesty.txt> <sandbox-dir>");
  process.exit(2);
}
if (!fs.existsSync(honesty)) { console.error(`missing ${honesty}`); process.exit(1); }
const own = path.basename(sandbox.replace(/[\\/]+$/, ""));
if (!/^ds-consumer-sb-[0-9a-f]+$/.test(own)) { console.error(`unexpected sandbox name: ${own}`); process.exit(1); }

const uses = [];
for (const l of (fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "").split(/\r?\n/).filter(Boolean)) {
  let e; try { e = JSON.parse(l); } catch { continue; }
  if (e.type !== "assistant") continue;
  for (const c of e.message?.content ?? []) if (c.type === "tool_use") uses.push(c);
}

const PKG = /@dooph-software\/design-system/;
const PKG_MANAGER = /(^|[\s;&|(])(npm|npx|yarn|pnpm|pnpx)\s/;
const NODE_EVAL = /(^|[\s;&|(])node(\.exe)?\s+[^;&|]*(-e|--eval|-p|--print)\b/;
const NET = /\bfetch\s*\(|\bhttps?\b|require\(\s*["'](node:)?(https?|net|tls|dns)["']|from\s+["'](node:)?(https?|net|tls|dns)["']|\bundici\b|registry\.npmjs|\bXMLHttpRequest\b/;

const flags = [];
uses.forEach((t, i) => {
  const s = JSON.stringify(t.input ?? {});
  const cmd = typeof t.input?.command === "string" ? t.input.command : "";
  const short = s.slice(0, 300);
  if (/ds-consumer-template/.test(s)) flags.push(`#${i} TEMPLATE-PATH ${t.name}: ${short}`);
  if (/\.tgz\b|(^|[\s"'])tar\s/.test(s)) flags.push(`#${i} VENDOR-TARBALL ${t.name}: ${short}`);
  for (const m of s.match(/ds-(consumer-)?sb-[\w.-]+/g) ?? [])
    if (!m.startsWith(own)) { flags.push(`#${i} OTHER-SANDBOX ${t.name}: ${short}`); break; }
  if (cmd && PKG_MANAGER.test(cmd) && PKG.test(cmd)) flags.push(`#${i} DS-REGISTRY ${t.name}: ${cmd.slice(0, 300)}`);
  if (/^(WebFetch|WebSearch)$/.test(t.name)) flags.push(`#${i} NETWORK ${t.name}: ${short}`);
  else if (cmd && (/(^|[\s;&|(])(curl|wget)(\.exe)?\s/.test(cmd) || /\bfetch\s*\(/.test(cmd) || (NODE_EVAL.test(cmd) && NET.test(cmd))))
    flags.push(`#${i} NETWORK ${t.name}: ${cmd.slice(0, 300)}`);
});
fs.appendFileSync(honesty, "\n--- consumer checks ---\n" +
  (flags.length ? flags.join("\n")
    : "no flags: no template path, no tarball reads, no other sandbox, no DS registry commands, no network") + "\n");
console.log(`consumer honesty: ${flags.length} flag(s)`);
