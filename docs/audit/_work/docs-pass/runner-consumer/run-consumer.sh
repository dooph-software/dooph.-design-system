#!/usr/bin/env bash
# run-consumer.sh <scenario-id> <red|green> <out-dir>
#
# Runs ONE consumer behaviour scenario (scenarios.md "Consumer scenarios") as a
# separate HEADLESS Claude Code process started inside a fresh consumer-app
# sandbox, never as an Agent-tool subagent. The consumer twin of
# run-scenario.sh: same claude flags, tools, auto-memory switch and canary,
# same output files and exit codes; extract-run.mjs is CALLED, not copied.
#
#   red    sandbox without skills (make-consumer-sandbox.sh): the installed
#          package has no skills/ and a 3-line stub README
#   green  sandbox with skills    (make-consumer-sandbox.sh --with-skills):
#          the package's init-skills has run. REFUSED unless DS_TARBALL is set:
#          the template's vendored tarball predates the skills under test.
# DS_TARBALL=<path> is passed through to make-consumer-sandbox.sh (install a
# fresh pack-ds.sh build instead of the template's vendored tarball).
#
# The sandbox dir is OPAQUE (ds-consumer-sb-<random hex>): the agent's cwd must
# not spell the scenario or the mode. Id and mode live only in the out-dir file
# names; -sandbox.txt maps the run to its sandbox.
#
# Writes to <out-dir> the same <id>-<mode>-* files as run-scenario.sh, with:
#   -final.txt     line 1 RUN OK / RUN ERROR (extract-run.mjs), line 2-3 the
#                  DS tarball used (path + sha256, and the installed one's
#                  sha256 after the RED repack), then STEP FAILED lines if any
#   -sandbox.txt   make-consumer-sandbox output (dir, mode, commits, tarball)
#   -diff.patch    consumer-diff.sh: the app's changes vs the hand-over commit,
#   -diffstat.txt  untracked files included (--name-status)
#   -lint.txt      the app's checks after the run: `npm run typecheck`
#                  (next typegen && tsc --noEmit), then `npm run build`
#                  (next build); last line "lint exit: <n>", 0 only if both
#                  pass. A lint FAILURE is a result to score, not a runner
#                  error; the lint STEP fails only if it cannot run or record
#                  its result, or the build could not fetch its Google Fonts.
#   -honesty.txt   extract-run.mjs flags plus consumer-honesty.mjs flags
#                  (template path, tarball reads, other sandboxes, DS registry
#                  commands, network use)
# then removes the sandbox (KEEP_SANDBOX=1 keeps it).
#
# Exit status: 0 only for a valid run (-final.txt starts "RUN OK") with the
# main checkout unchanged; 1 = RUN ERROR (including a failed post-run step:
# consumer-honesty, consumer-diff or the lint step; line 1 then becomes
# "RUN ERROR: step failed …"); 3 = main checkout changed; 2 = usage, a
# maintainer scenario (use run-scenario.sh) or green without DS_TARBALL. The
# sandbox is removed in every case (trap on EXIT, set before it is made).
#
# SCENARIO_PROMPT=<text> overrides the prompt (for a smoke test; the id then
# only names the output files).
set -uo pipefail
# No `set -e`: every step after claude must still run (diff, lint, cleanup).
# Optional locks off: reading the main checkout's status must never refresh
# its index stat cache or take index.lock.
export GIT_OPTIONAL_LOCKS=0

[ $# -eq 3 ] || { echo "usage: $0 <scenario-id> <red|green> <out-dir>" >&2; exit 2; }
ID=$1; MODE=$2; OUT_ARG=$3
case "$MODE" in red) SBFLAG="" ;; green) SBFLAG="--with-skills" ;; *) echo "mode must be red or green" >&2; exit 2 ;; esac
if [ "$MODE" = green ] && [ -z "${DS_TARBALL:-}" ]; then
  echo "refusing: green needs DS_TARBALL=<fresh pack-ds.sh tarball>; the vendored one predates the skills under test" >&2; exit 2
fi
if [ -n "${DS_TARBALL:-}" ]; then
  [ -f "$DS_TARBALL" ] || { echo "DS_TARBALL not found: $DS_TARBALL" >&2; exit 2; }
  DS_TARBALL=$(realpath "$DS_TARBALL"); export DS_TARBALL
fi

HERE=$(cd "$(dirname "$0")" && pwd)
MAIN=/c/Users/stick/Github/dooph/dooph-Design-System
TEMPLATE=/c/Users/stick/Github/dooph/ds-consumer-template
mkdir -p "$OUT_ARG"; OUT=$(cd "$OUT_ARG" && pwd)
P="$OUT/$ID-$MODE"

if [ -n "${SCENARIO_PROMPT:-}" ]; then
  PROMPT=$SCENARIO_PROMPT
else
  SIDE=$(node "$HERE/scenario-prompt.mjs" --side "$ID") || exit 2
  [ "$SIDE" = consumer ] || { echo "refusing: $ID is a $SIDE scenario; run it with run-scenario.sh" >&2; exit 2; }
  PROMPT=$(node "$HERE/scenario-prompt.mjs" "$ID") || exit 2
fi
printf '%s\n' "$PROMPT" > "$P-prompt.txt"

# The source tarball, recorded in -final.txt for every run.
if [ -n "${DS_TARBALL:-}" ]; then SRC_TGZ=$DS_TARBALL
else SRC_TGZ="$TEMPLATE/$(git -C "$TEMPLATE" ls-files 'vendor/*.tgz' | head -1)"; fi
SRC_SHA=$(sha256sum "$SRC_TGZ" | cut -d' ' -f1)

main_state() {
  echo "HEAD $(git -C "$MAIN" rev-parse HEAD)"
  echo "index $(git -C "$MAIN" ls-files -s | md5sum | cut -d' ' -f1)"
  echo "refs $(git -C "$MAIN" for-each-ref | md5sum | cut -d' ' -f1)"
  echo "status $(git -C "$MAIN" status --porcelain | md5sum | cut -d' ' -f1)"
}
BEFORE=$(main_state)

SB="$(dirname "$MAIN")/ds-consumer-sb-$(od -An -N6 -tx1 /dev/urandom | tr -d ' \n')"
cleanup() {
  [ -e "$SB" ] || return 0
  if [ "${KEEP_SANDBOX:-0}" = 1 ]; then echo "kept sandbox: $SB"
  elif [ -f "$SB/.git/consumer-sandbox" ]; then bash "$HERE/remove-consumer-sandbox.sh" "$SB" >/dev/null
  else rm -rf "$SB"   # make-consumer-sandbox failed before writing its marker
  fi
}
trap cleanup EXIT
if ! bash "$HERE/make-consumer-sandbox.sh" "$SB" $SBFLAG > "$P-sandbox.txt" 2>&1; then
  cat "$P-sandbox.txt"
  { printf 'RUN ERROR: make-consumer-sandbox.sh failed (see %s-sandbox.txt)\n' "$ID-$MODE"
    echo "ds tarball: $SRC_TGZ sha256 $SRC_SHA"; } > "$P-final.txt"
  exit 1
fi
INST_SHA=$(sed -n 's/^installed-tgz-sha256: //p' "$P-sandbox.txt")

ALLOWED="Read,Edit,Write,Glob,Grep,Bash(npm:*),Bash(node:*),Bash(npx:*),Bash(ls:*),Bash(cat:*),Bash(git status:*),Bash(git diff:*),Bash(grep:*),Bash(find:*)"
# run-scenario.sh's list, plus the registry back door: the PUBLISHED package
# (npm view / info / show / pack, curl, wget) carries its README and skills.
DISALLOWED="Bash(git commit:*),Bash(git add:*),Bash(git push:*),Bash(git reset:*),Bash(git stash:*),Bash(git checkout:*),Bash(git restore:*),Bash(git show:*),Bash(git log:*),Bash(git worktree:*),Bash(git diff HEAD:*),Bash(git diff --cached:*),Bash(git diff --staged:*),Bash(git diff main:*),Bash(npm view:*),Bash(npm info:*),Bash(npm show:*),Bash(npm pack:*),Bash(curl:*),Bash(wget:*)"

# AGENTS.md: the template app has none. If a sandbox ever has one, append it
# the way run-scenario.sh does (headless claude auto-loads only CLAUDE.md).
APPEND=()
if [ -f "$SB/AGENTS.md" ]; then
  APPEND=(--append-system-prompt "Contents of AGENTS.md (project instructions, checked into the codebase):

$(cat "$SB/AGENTS.md")")
fi

# Auto-memory off twice over, with the canary (see run-scenario.sh).
CANARY="$P-memory-canary"
rm -rf "$CANARY"
CANARY_JSON=$(cygpath -m "$CANARY" 2>/dev/null || echo "$CANARY")
SETTINGS='{"autoMemoryEnabled":false,"autoMemoryDirectory":"'"$CANARY_JSON"'"}'

echo "running $ID ($MODE, consumer) in $SB ..."
( cd "$SB" && CLAUDE_CODE_DISABLE_AUTO_MEMORY=1 claude -p "$PROMPT" \
    --model opus \
    --setting-sources project \
    --settings "$SETTINGS" \
    "${APPEND[@]}" \
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

STEP_FAILS=()
node "$HERE/consumer-honesty.mjs" "$P.jsonl" "$P-honesty.txt" "$SB"
rc=$?; [ $rc -eq 0 ] || STEP_FAILS+=("consumer-honesty exit $rc")
{ echo; echo "--- skill / plugin / CLAUDE.md loading, from $ID-$MODE-debug.log ---"
  grep -i -E "Loading skills from|unique skills|getSkills returning|skills via attachment|installed plugins|Found [0-9]+ plugins|CLAUDE\.md|AGENTS\.md" "$P-debug.log" | cut -c1-300 \
    || echo "(no matching debug lines)"
} >> "$P-env.txt"
bash "$HERE/consumer-diff.sh" "$SB" > "$P-diff.patch"
rc=$?; [ $rc -eq 0 ] || STEP_FAILS+=("consumer-diff exit $rc")
bash "$HERE/consumer-diff.sh" "$SB" --name-status > "$P-diffstat.txt"
rc=$?; [ $rc -eq 0 ] || STEP_FAILS+=("consumer-diff --name-status exit $rc")
( cd "$SB" || exit 1
  npm run typecheck > "$P-lint.txt" 2>&1; TC=$?
  echo "typecheck exit: $TC" >> "$P-lint.txt"
  npm run build >> "$P-lint.txt" 2>&1; BU=$?
  echo "build exit: $BU" >> "$P-lint.txt"
  echo "lint exit: $(( TC != 0 || BU != 0 ))" >> "$P-lint.txt" )
rc=$?
if [ $rc -ne 0 ] || ! tail -1 "$P-lint.txt" 2>/dev/null | grep -q '^lint exit: [01]$'; then
  STEP_FAILS+=("lint step exit $rc (no lint result recorded)")
elif grep -q -i -E "Failed to fetch( font)?.*fonts\.googleapis|fonts\.googleapis.*(ENOTFOUND|ECONNREFUSED|ETIMEDOUT|fetch failed)|Failed to fetch \`[^\`]+\` from Google Fonts" "$P-lint.txt"; then
  STEP_FAILS+=("lint step: next build could not fetch Google Fonts (network), so the build result is not the agent's")
fi

# -final.txt: RUN line, then the tarball lines, then any STEP FAILED lines.
{
  first=$(head -1 "$P-final.txt")
  if [ ${#STEP_FAILS[@]} -gt 0 ] && [ "$first" = "RUN OK" ]; then
    first="RUN ERROR: step failed: $(IFS=';'; echo "${STEP_FAILS[*]}")"
  fi
  echo "$first"
  echo "ds tarball: $SRC_TGZ sha256 $SRC_SHA"
  echo "installed tarball sha256: ${INST_SHA:-?}$([ "$MODE" = red ] && echo ' (RED repack: no skills/, stub README)')"
  for f in "${STEP_FAILS[@]}"; do echo "STEP FAILED: $f"; done
  tail -n +2 "$P-final.txt"
} > "$P-final.txt.tmp" && mv "$P-final.txt.tmp" "$P-final.txt"

AFTER=$(main_state)
{ echo "before:"; echo "$BEFORE"; echo "after:"; echo "$AFTER"
  [ "$BEFORE" = "$AFTER" ] && echo "MAIN CHECKOUT UNCHANGED" || echo "MAIN CHECKOUT CHANGED"; } > "$P-main.txt"
tail -1 "$P-main.txt"
tail -3 "$P-lint.txt"
for f in "${STEP_FAILS[@]}"; do echo "STEP FAILED: $f"; done
echo "claude exit: $CLAUDE_EXIT   extract exit: $EXTRACT_EXIT   $(head -1 "$P-final.txt")"
echo "outputs: $P-*"
if [ "$CLAUDE_EXIT" -ne 0 ] || [ "$EXTRACT_EXIT" -ne 0 ] || [ ${#STEP_FAILS[@]} -gt 0 ]; then exit 1; fi
[ "$BEFORE" = "$AFTER" ] || exit 3
exit 0
