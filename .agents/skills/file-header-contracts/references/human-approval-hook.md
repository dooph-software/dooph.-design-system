# Enforcing `## REQUIRE HUMAN EDIT PERMISSION`

The header marker and the `AGENTS.md` clause are instructions — they hold because
an agent chooses to honor them. For regulatory, financial or safety-critical
files, back them with a hook, which the harness enforces before the tool runs.

The two layers do different jobs. The header says *why* the file is gated, in
words a human and an agent both read. The hook makes the gate hold even when the
agent is wrong, rushed, or reading a ticket that claims prior sign-off.

## The script

Save as `.claude/hooks/require-human-edit.mjs` in the project (or anywhere, and
point the command at it). Requires Node; no `jq` dependency, since `jq` is
absent on many Windows setups and a hook whose command is missing fails silently.

```js
#!/usr/bin/env node
// PreToolUse hook: gate edits to files marked ## REQUIRE HUMAN EDIT PERMISSION.
// Emits permissionDecision "ask" so Claude Code prompts the human before the
// tool runs. Silent (allows) for every other file.
import fs from "node:fs";

const MARKER = "## REQUIRE HUMAN EDIT PERMISSION";
const HEAD_BYTES = 4096; // the contract lives at the top of the file

let raw = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (d) => (raw += d));
process.stdin.on("end", () => {
  try {
    const path = JSON.parse(raw)?.tool_input?.file_path;
    if (!path || !fs.existsSync(path)) return;
    const fd = fs.openSync(path, "r");
    const buf = Buffer.alloc(HEAD_BYTES);
    const n = fs.readSync(fd, buf, 0, HEAD_BYTES, 0);
    fs.closeSync(fd);
    if (!buf.subarray(0, n).toString("utf8").includes(MARKER)) return;
    process.stdout.write(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "ask",
        permissionDecisionReason:
          `${path} is marked ${MARKER}. A human must approve this edit before it is applied.`,
      },
    }));
  } catch {
    // Unreadable path or malformed payload: stay silent so normal edits proceed.
  }
});
```

## The settings entry

Merge into `.claude/settings.json` (team-wide) or `~/.claude/settings.json`
(personal). Do not replace an existing `hooks` block — add to it.

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "node .claude/hooks/require-human-edit.mjs",
            "timeout": 10
          }
        ]
      }
    ]
  }
}
```

`permissionDecision: "ask"` routes the edit through the normal permission prompt,
so the human sees the file, the reason, and the pending change. Use `"deny"`
instead if the file should never be agent-edited under any circumstances.

## Verify it before you trust it

A hook that silently does nothing is worse than no hook. Pipe the payload in
directly and confirm you get JSON back:

```bash
echo '{"tool_name":"Edit","tool_input":{"file_path":"src/billing/priceWindow.ts"}}' | node .claude/hooks/require-human-edit.mjs
```

A gated file prints the `ask` JSON; any other file prints nothing. Then confirm
the hook is registered and well-formed:

```bash
node -e "const s=require('./.claude/settings.json');console.log(JSON.stringify(s.hooks.PreToolUse,null,2))"
```

If the pipe test passes but the hook never fires in a session, the settings
watcher did not pick up the file — open `/hooks` once, or restart.

## Limits worth knowing

- **It fails open on an unresolvable path.** If the path does not exist or cannot
  be read, the hook stays silent and the edit proceeds. That is correct for
  writes creating new files, but it means the gate is not a security boundary.
- **It only sees `Write` and `Edit`.** An agent that rewrites the file through a
  shell command (`sed -i`, a redirect) bypasses it. Add `Bash` to the matcher and
  inspect the command if that matters to you.
- **It is not a substitute for review.** For anything genuinely dangerous, the
  durable controls are branch protection, CODEOWNERS, and tests that fail loudly
  — this hook makes the intent visible and interrupts the common path.
