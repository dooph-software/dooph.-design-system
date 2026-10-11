#!/usr/bin/env bash
# run-scenario.sh <scenario-id> <red|green> <out-dir>
#
# Runs ONE behaviour scenario (scenarios.md) as a separate HEADLESS Claude Code
# process started inside a fresh sandbox, never as an Agent-tool subagent (a
# subagent inherits the controller's memory, AGENTS.md and skill list).
#
#   red    sandbox without skills (make-sandbox.sh)
#   green  sandbox with skills    (make-sandbox.sh --with-skills)
#
# Writes to <out-dir>:
#   <id>-<mode>.jsonl         the stream-json transcript
#   <id>-<mode>-stderr.txt    claude's stderr, plus its exit code
#   <id>-<mode>-sandbox.txt   make-sandbox output (dir, snapshot and start trees)
#   <id>-<mode>-prompt.txt    the exact prompt sent
#   <id>-<mode>-env.txt       what the agent could see (init event: tools,
#                             skills, slash commands, agents, plugins, MCP) and
#                             the auto-memory verdict
#   <id>-<mode>-final.txt     FIRST LINE "RUN OK" or "RUN ERROR: <reasons>", then
#                             final text, turns, cost, permission denials
#   <id>-<mode>-edits.txt     every edit in order, FIRST per file marked
#   <id>-<mode>-bash.txt      every shell command with the tail of its output
#   <id>-<mode>-honesty.txt   git-history reads, main-checkout paths, deleted paths
#   <id>-<mode>-diff.patch    sandbox-diff.sh (agent's changes vs start tree)
#   <id>-<mode>-diffstat.txt  sandbox-diff.sh --name-status
#   <id>-<mode>-lint.txt      `npm run lint` in the sandbox after the run
#   <id>-<mode>-main.txt      main checkout status/index/HEAD before vs after
#   <id>-<mode>-debug.log     claude --debug-file log (skill, plugin loading)
#   <id>-<mode>-memory-canary exists ONLY if auto-memory was active (run void)
# then removes the sandbox (KEEP_SANDBOX=1 keeps it).
#
# Exit status: 0 only for a valid run (-final.txt starts "RUN OK") with the
# main checkout unchanged. 1 = RUN ERROR (claude exited non-zero, API or auth
# error, a result subtype other than success, auto-memory active, or the
# sandbox could not be made), 3 = main checkout changed, 2 = usage. The sandbox
# is removed in every case (trap on EXIT).
#
# SCENARIO_PROMPT=<text> overrides the prompt (for a smoke test; the id then
# only names the output files). Consumer scenarios need ../ds-consumer, which
# does not exist yet, so they are refused.
set -uo pipefail
# No `set -e`: every step after claude must still run (diff, lint, cleanup), so
# each exit code is captured and the script decides its own exit at the end.
# Optional locks off: `git status` on the main checkout must never refresh the
# main index's stat cache or take index.lock while the maintainer works there.
export GIT_OPTIONAL_LOCKS=0

[ $# -eq 3 ] || { echo "usage: $0 <scenario-id> <red|green> <out-dir>" >&2; exit 2; }
ID=$1; MODE=$2; OUT_ARG=$3
case "$MODE" in red) SBFLAG="" ;; green) SBFLAG="--with-skills" ;; *) echo "mode must be red or green" >&2; exit 2 ;; esac

HERE=$(cd "$(dirname "$0")" && pwd)
MAIN=$(git -C "$HERE" rev-parse --show-toplevel)
mkdir -p "$OUT_ARG"; OUT=$(cd "$OUT_ARG" && pwd)
P="$OUT/$ID-$MODE"

if [ -n "${SCENARIO_PROMPT:-}" ]; then
  PROMPT=$SCENARIO_PROMPT
else
  SIDE=$(node "$HERE/scenario-prompt.mjs" --side "$ID") || exit 2
  [ "$SIDE" = maintainer ] || { echo "refusing: $ID is a $SIDE scenario; ../ds-consumer is not built yet" >&2; exit 2; }
  PROMPT=$(node "$HERE/scenario-prompt.mjs" "$ID") || exit 2
fi
printf '%s\n' "$PROMPT" > "$P-prompt.txt"

main_state() {
  echo "HEAD $(git -C "$MAIN" rev-parse HEAD)"
  echo "index $(git -C "$MAIN" ls-files -s | md5sum | cut -d' ' -f1)"
  echo "refs $(git -C "$MAIN" for-each-ref | md5sum | cut -d' ' -f1)"
  echo "status $(git -C "$MAIN" status --porcelain | md5sum | cut -d' ' -f1)"
}
BEFORE=$(main_state)

SB="$(dirname "$MAIN")/ds-sb-$ID-$MODE-$(date +%Y%m%d%H%M%S)"
cleanup() {
  [ -e "$SB" ] || return 0
  if [ "${KEEP_SANDBOX:-0}" = 1 ]; then echo "kept sandbox: $SB"; else bash "$HERE/remove-sandbox.sh" "$SB" >/dev/null; fi
}
trap cleanup EXIT
if ! bash "$HERE/make-sandbox.sh" "$SB" $SBFLAG > "$P-sandbox.txt" 2>&1; then
  cat "$P-sandbox.txt"
  printf 'RUN ERROR: make-sandbox.sh failed (see %s-sandbox.txt)\n' "$ID-$MODE" > "$P-final.txt"
  exit 1
fi

ALLOWED="Read,Edit,Write,Glob,Grep,Bash(npm:*),Bash(node:*),Bash(npx:*),Bash(ls:*),Bash(cat:*),Bash(git status:*),Bash(git diff:*),Bash(grep:*),Bash(find:*)"
# git log / git show and the HEAD/--cached/--staged/main forms of git diff
# would read the old skills and docs from history; the rest change git state.
DISALLOWED="Bash(git commit:*),Bash(git add:*),Bash(git push:*),Bash(git reset:*),Bash(git stash:*),Bash(git checkout:*),Bash(git restore:*),Bash(git show:*),Bash(git log:*),Bash(git worktree:*),Bash(git diff HEAD:*),Bash(git diff --cached:*),Bash(git diff --staged:*),Bash(git diff main:*)"

# AGENTS.md: in real use the desktop app / Agent SDK host loads it as project
# instructions, but headless claude 2.1.96 auto-loads only CLAUDE.md, never
# AGENTS.md, so it is appended to the system prompt in the same words.
AGENTS_TEXT="Contents of AGENTS.md (project instructions, checked into the codebase):

$(cat "$SB/AGENTS.md")"

# Auto-memory: off twice over (env + setting), because Claude Code resolves a
# worktree's project to the main checkout, whose project memory holds the
# maintainer's rules. autoMemoryDirectory also points at a fresh canary path:
# Claude Code 2.1.96 creates that directory at startup whenever auto-memory is
# on (verified with a control run), so a canary that exists afterwards means
# memory was active and extract-run.mjs marks the run RUN ERROR. A failed switch
# would also read that empty dir, never the main checkout's memory.
CANARY="$P-memory-canary"
rm -rf "$CANARY"
CANARY_JSON=$(cygpath -m "$CANARY" 2>/dev/null || echo "$CANARY")
SETTINGS='{"autoMemoryEnabled":false,"autoMemoryDirectory":"'"$CANARY_JSON"'"}'

echo "running $ID ($MODE) in $SB ..."
( cd "$SB" && CLAUDE_CODE_DISABLE_AUTO_MEMORY=1 claude -p "$PROMPT" \
    --model opus \
    --setting-sources project \
    --settings "$SETTINGS" \
    --append-system-prompt "$AGENTS_TEXT" \
    --debug-file "$P-debug.log" \
    --permission-mode acceptEdits \
    --output-format stream-json --verbose \
    --no-session-persistence \
    --allowedTools "$ALLOWED" \
    --disallowedTools "$DISALLOWED" \
    < /dev/null > "$P.jsonl" 2> "$P-stderr.txt" )
CLAUDE_EXIT=$?
echo "claude exit: $CLAUDE_EXIT" >> "$P-stderr.txt"

node "$HERE/extract-run.mjs" "$P.jsonl" "$P" "$MODE" "$CLAUDE_EXIT" "$CANARY_JSON" "$P-debug.log"
EXTRACT_EXIT=$?
{ echo; echo "--- skill / plugin / CLAUDE.md loading, from $ID-$MODE-debug.log ---"
  grep -i -E "Loading skills from|unique skills|getSkills returning|skills via attachment|installed plugins|Found [0-9]+ plugins|CLAUDE\.md|AGENTS\.md" "$P-debug.log" | cut -c1-300 \
    || echo "(no matching debug lines)"
} >> "$P-env.txt"
bash "$HERE/sandbox-diff.sh" "$SB" > "$P-diff.patch"
bash "$HERE/sandbox-diff.sh" "$SB" --name-status > "$P-diffstat.txt"
( cd "$SB" && npm run lint > "$P-lint.txt" 2>&1; echo "lint exit: $?" >> "$P-lint.txt" )

AFTER=$(main_state)
{ echo "before:"; echo "$BEFORE"; echo "after:"; echo "$AFTER"
  [ "$BEFORE" = "$AFTER" ] && echo "MAIN CHECKOUT UNCHANGED" || echo "MAIN CHECKOUT CHANGED"; } > "$P-main.txt"
tail -1 "$P-main.txt"
tail -1 "$P-lint.txt"
echo "claude exit: $CLAUDE_EXIT   extract exit: $EXTRACT_EXIT   $(head -1 "$P-final.txt")"
echo "outputs: $P-*"
if [ "$CLAUDE_EXIT" -ne 0 ] || [ "$EXTRACT_EXIT" -ne 0 ]; then exit 1; fi
[ "$BEFORE" = "$AFTER" ] || exit 3
exit 0
